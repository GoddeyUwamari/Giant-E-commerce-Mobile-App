/**
 * Improved Product Availability Function
 * Addresses security, validation, and performance concerns
 */

import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import Anthropic from '@anthropic-ai/sdk';

// Rate limiting store (in production, use Redis or Firestore)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cache for inventory data (in production, use Redis)
const inventoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes


// Helper function to calculate distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};


// Google Places API interfaces
interface GooglePlaceResult {
    place_id: string;
    name: string;
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: {
        open_now: boolean;
    };
    business_status?: string;
    types?: string[];
}

interface GooglePlacesResponse {
    results: GooglePlaceResult[];
    status: string;
    error_message?: string;
}

interface InventoryRequest {
    productId: string;
    storeIds: string[];
    includeQuantity?: boolean; // Optional flag to include exact quantities
}

interface InventoryResponse {
    storeId: string;
    productId: string;
    inStock: boolean;
    quantity?: number; // Only included if requested and user has permission
    lastUpdated: string;
    estimatedAvailability?: 'high' | 'medium' | 'low'; // Abstracted availability level
}

interface StoreRequest {
    latitude?: number;
    longitude?: number;
    radius?: number;
    limit?: number;
}

// CORS configuration
const setCorsHeaders = (response: functions.Response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Max-Age', '3600');
};

// Rate limiting helper
const checkRateLimit = (clientId: string, limit: number = 100, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const key = clientId;

    const clientData = rateLimitStore.get(key);

    if (!clientData || now > clientData.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (clientData.count >= limit) {
        return false;
    }

    clientData.count++;
    return true;
};

// Input validation
const validateInventoryRequest = (body: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!body) {
        errors.push('Request body is required');
        return { isValid: false, errors };
    }

    const { productId, storeIds } = body;

    // Validate productId
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
        errors.push('productId is required and must be a non-empty string');
    } else if (productId.length > 50) {
        errors.push('productId must be 50 characters or less');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(productId)) {
        errors.push('productId contains invalid characters');
    }

    // Validate storeIds
    if (!storeIds || !Array.isArray(storeIds)) {
        errors.push('storeIds is required and must be an array');
    } else if (storeIds.length === 0) {
        errors.push('storeIds array cannot be empty');
    } else if (storeIds.length > 20) {
        errors.push('Maximum 20 stores can be queried at once');
    } else {
        // Validate each store ID
        storeIds.forEach((storeId, index) => {
            if (!storeId || typeof storeId !== 'string' || storeId.trim().length === 0) {
                errors.push(`storeIds[${index}] must be a non-empty string`);
            } else if (storeId.length > 20) {
                errors.push(`storeIds[${index}] must be 20 characters or less`);
            } else if (!/^[a-zA-Z0-9_-]+$/.test(storeId)) {
                errors.push(`storeIds[${index}] contains invalid characters`);
            }
        });
    }

    return { isValid: errors.length === 0, errors };
};

// Authentication helper (implement based on your auth system)
const authenticateRequest = async (request: functions.Request): Promise<{ isValid: boolean; userId?: string; userRole?: string }> => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { isValid: false };
        }

        const token = authHeader.substring(7);

        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);

        return {
            isValid: true,
            userId: decodedToken.uid,
            userRole: decodedToken.role || 'customer'
        };
    } catch (error) {
        logger.warn('Authentication failed:', error);
        return { isValid: false };
    }
};

// Cache helpers
const getCacheKey = (productId: string, storeIds: string[]): string => {
    return `inventory:${productId}:${storeIds.sort().join(',')}`;
};

const getFromCache = (key: string): any | null => {
    const cached = inventoryCache.get(key);
    if (cached && Date.now() < cached.expiry) {
        return cached.data;
    }
    inventoryCache.delete(key);
    return null;
};

const setCache = (key: string, data: any): void => {
    inventoryCache.set(key, {
        data,
        expiry: Date.now() + CACHE_TTL
    });
};

// Helper function to determine store type
const determineStoreType = (name: string): 'Supercenter' | 'Neighborhood Market' | 'Pickup Only' | 'Express' => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('supercenter')) return 'Supercenter';
    if (lowerName.includes('neighborhood market')) return 'Neighborhood Market';
    if (lowerName.includes('pickup') || lowerName.includes('curbside')) return 'Pickup Only';
    if (lowerName.includes('express')) return 'Express';
    return 'Supercenter'; // Default
};

// Helper function to parse address
const parseAddress = (vicinity: string) => {
    const parts = vicinity.split(', ');
    const street = parts[0] || '';
    const cityState = parts[1] || '';

    // Try to extract city and state
    const cityStateParts = cityState.split(' ');
    const state = cityStateParts.pop() || '';
    const city = cityStateParts.join(' ') || '';

    return {
        street,
        city,
        state,
        zipCode: '',
        fullAddress: vicinity,
    };
};


// Initialize Anthropic client
const getAnthropicClient = (): Anthropic => {
    const apiKey = functions.config().anthropic?.api_key;
    if (!apiKey) {
        throw new Error('Anthropic API key not configured');
    }
    return new Anthropic({ apiKey });
};

// ========================================
// CLAUDE AI CHAT COMPLETION
// ========================================
export const getChatResponse = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
        return;
    }

    const startTime = Date.now();

    try {
        // Optional authentication - allow anonymous users for basic chat
        let userId = 'anonymous';
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decodedToken = await admin.auth().verifyIdToken(token);
                userId = decodedToken.uid;
            } catch (authError) {
                // Allow anonymous access for chat, just log the attempt
                logger.info('Anonymous chat request');
            }
        }

        // Rate limiting
        if (!checkRateLimit(userId, 50, 60000)) { // 50 requests per minute
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many chat requests. Please try again later.'
            });
            return;
        }

        const { messages, systemPrompt, maxTokens = 1000 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Messages array is required'
            });
            return;
        }

        // Validate message format
        for (const msg of messages) {
            if (!msg.role || !msg.content || !['user', 'assistant'].includes(msg.role)) {
                res.status(400).json({
                    error: 'Validation failed',
                    message: 'Each message must have role (user|assistant) and content'
                });
                return;
            }
        }

        const anthropic = getAnthropicClient();

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: Math.min(maxTokens, 4000), // Cap max tokens
            system: systemPrompt || `You are a helpful Walmart shopping assistant. You help customers with:
- Product questions and recommendations
- Order tracking and support
- Store information and services
- Returns and refunds
- Price matching and deals
- Walmart+ membership benefits

Be friendly, helpful, and concise. Always prioritize customer satisfaction.`,
            messages: messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content
            }))
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : '';

        const responseTime = Date.now() - startTime;

        logger.info('Chat response generated successfully', {
            userId,
            messageCount: messages.length,
            responseTime,
            tokensUsed: response.usage
        });

        res.json({
            success: true,
            response: text,
            usage: response.usage,
            requestId: `req_${Date.now()}`,
            responseTime
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        logger.error('Chat response failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Unable to generate response at this time',
            requestId: `req_${Date.now()}`,
            responseTime
        });
    }
});

// ========================================
// SHOPPING ASSISTANCE
// ========================================
export const getShoppingAssistance = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
        return;
    }

    const startTime = Date.now();

    try {
        // Optional authentication
        let userId = 'anonymous';
        let userProfile = null;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decodedToken = await admin.auth().verifyIdToken(token);
                userId = decodedToken.uid;

                // Get user profile if authenticated
                const userDoc = await admin.firestore().collection('users').doc(userId).get();
                userProfile = userDoc.exists ? userDoc.data() : null;
            } catch (authError) {
                logger.info('Anonymous shopping assistance request');
            }
        }

        // Rate limiting
        if (!checkRateLimit(userId, 30, 60000)) { // 30 requests per minute
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many assistance requests. Please try again later.'
            });
            return;
        }

        const { userMessage, context = {} } = req.body;

        if (!userMessage || typeof userMessage !== 'string') {
            res.status(400).json({
                error: 'Validation failed',
                message: 'User message is required'
            });
            return;
        }

        const anthropic = getAnthropicClient();

        const systemPrompt = `You are a helpful Walmart shopping assistant. Help users with:

- Product recommendations and comparisons
- Finding specific items
- Price and deal information
- Store services and policies
- Order and shipping questions
- General shopping advice

Be conversational, helpful, and concise. Use the provided context to give relevant assistance.`;

        const contextInfo = `
Current Context:
- Page: ${context.currentPage || 'unknown'}
- Cart Items: ${context.cartItems?.length || 0} items
- Current Product: ${context.currentProduct?.name || 'none'}
- User: ${userProfile?.displayName || 'Guest'}
- User Location: ${userProfile?.location?.city || 'unknown'}
        `;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 400,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: `${contextInfo}\n\nUser Message: ${userMessage}`
            }]
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : 'How can I help you with your shopping today?';

        const responseTime = Date.now() - startTime;

        logger.info('Shopping assistance provided', {
            userId,
            hasContext: Object.keys(context).length > 0,
            responseTime
        });

        res.json({
            success: true,
            response: text,
            requestId: `req_${Date.now()}`,
            responseTime
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        logger.error('Shopping assistance failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Shopping assistance unavailable at this time',
            requestId: `req_${Date.now()}`,
            responseTime
        });
    }
});

// ========================================
// PRODUCT Q&A
// ========================================
export const answerProductQuestion = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
        return;
    }

    const startTime = Date.now();

    try {
        // Optional authentication
        let userId = 'anonymous';
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decodedToken = await admin.auth().verifyIdToken(token);
                userId = decodedToken.uid;
            } catch (authError) {
                logger.info('Anonymous product Q&A request');
            }
        }

        // Rate limiting
        if (!checkRateLimit(userId, 20, 60000)) { // 20 requests per minute
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many questions. Please try again later.'
            });
            return;
        }

        const { question, productData } = req.body;

        if (!question || !productData) {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Question and product data are required'
            });
            return;
        }

        const anthropic = getAnthropicClient();

        const systemPrompt = `You are a product expert AI for Walmart. Answer customer questions about specific products using the provided product information.

Be accurate, helpful, and honest. If you don't have specific information, say so and suggest contacting customer service or checking reviews.`;

        const productContext = `
Product: ${productData.name || 'Unknown'}
Brand: ${productData.brand || 'Unknown'}
Description: ${productData.description || 'No description available'}
Features: ${JSON.stringify(productData.features || [])}
Specifications: ${JSON.stringify(productData.specifications || {})}
Price: $${productData.price || 'Unknown'}
Average Rating: ${productData.rating || 'N/A'}/5 (${productData.reviewCount || 0} reviews)
        `;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: `Product Information:\n${productContext}\n\nCustomer Question: ${question}`
            }]
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : 'I need more information to answer that question.';

        const responseTime = Date.now() - startTime;

        logger.info('Product question answered', {
            userId,
            productId: productData.id,
            responseTime
        });

        res.json({
            success: true,
            response: text,
            requestId: `req_${Date.now()}`,
            responseTime
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        logger.error('Product Q&A failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Unable to answer question at this time',
            requestId: `req_${Date.now()}`,
            responseTime
        });
    }
});

// ========================================
// SEARCH ENHANCEMENT
// ========================================
export const enhanceSearch = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
        return;
    }

    const startTime = Date.now();

    try {
        // Optional authentication
        let userId = 'anonymous';
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decodedToken = await admin.auth().verifyIdToken(token);
                userId = decodedToken.uid;
            } catch (authError) {
                logger.info('Anonymous search enhancement request');
            }
        }

        // Rate limiting
        if (!checkRateLimit(userId, 40, 60000)) { // 40 requests per minute
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many search requests. Please try again later.'
            });
            return;
        }

        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Search query is required'
            });
            return;
        }

        const anthropic = getAnthropicClient();

        const systemPrompt = `You are a product search enhancement AI for Walmart. 

Given a natural language search query, extract:
1. Enhanced search terms
2. Product categories/filters
3. Price range if mentioned
4. Brand preferences
5. Alternative search suggestions

Return a JSON object with:
- enhancedQuery: refined search terms
- searchTerms: array of key terms
- filters: {category?, brand?, minPrice?, maxPrice?, features?}
- suggestions: array of alternative searches`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: `Enhance this search query: "${query}"`
            }]
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : '';

        let result;
        try {
            result = JSON.parse(text);
        } catch (parseError) {
            // Fallback if JSON parsing fails
            result = {
                enhancedQuery: query,
                searchTerms: query.split(' '),
                filters: {},
                suggestions: []
            };
        }

        const responseTime = Date.now() - startTime;

        logger.info('Search enhanced successfully', {
            userId,
            originalQuery: query,
            responseTime
        });

        res.json({
            success: true,
            result,
            requestId: `req_${Date.now()}`,
            responseTime
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        logger.error('Search enhancement failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Search enhancement unavailable',
            requestId: `req_${Date.now()}`,
            responseTime
        });
    }
});

// ========================================
// REVIEW SUMMARIZATION
// ========================================
export const summarizeReviews = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
        return;
    }

    const startTime = Date.now();

    try {
        // Optional authentication
        let userId = 'anonymous';
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decodedToken = await admin.auth().verifyIdToken(token);
                userId = decodedToken.uid;
            } catch (authError) {
                logger.info('Anonymous review summarization request');
            }
        }

        // Rate limiting
        if (!checkRateLimit(userId, 10, 60000)) { // 10 requests per minute
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many summarization requests. Please try again later.'
            });
            return;
        }

        const { reviews } = req.body;

        if (!reviews || !Array.isArray(reviews)) {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Reviews array is required'
            });
            return;
        }

        const reviewTexts = reviews.map(review =>
            `Rating: ${review.rating}/5 - ${review.title || ''} ${review.comment || ''}`
        ).slice(0, 20); // Limit to 20 reviews

        const anthropic = getAnthropicClient();

        const systemPrompt = `You are a review analysis AI for Walmart products. 

Analyze customer reviews and provide:
1. A concise summary of overall customer sentiment
2. Top 3-5 pros (what customers love)
3. Top 3-5 cons (what customers complain about)
4. Common themes mentioned
5. Recommendation score (0-100) based on overall satisfaction

Return JSON format:
{
  "summary": "Brief overview of customer sentiment",
  "pros": ["positive point 1", "positive point 2", ...],
  "cons": ["negative point 1", "negative point 2", ...],
  "commonThemes": ["theme 1", "theme 2", ...],
  "recommendationScore": 85
}`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 800,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: `Analyze these product reviews:\n\n${reviewTexts.join('\n\n')}`
            }]
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : '';

        let result;
        try {
            result = JSON.parse(text);
        } catch (parseError) {
            // Fallback
            result = {
                summary: "Customer reviews are generally positive with some mixed feedback.",
                pros: ["Good value", "Works as expected"],
                cons: ["Some quality concerns"],
                commonThemes: ["Value", "Quality"],
                recommendationScore: 75
            };
        }

        const responseTime = Date.now() - startTime;

        logger.info('Reviews summarized successfully', {
            userId,
            reviewCount: reviews.length,
            responseTime
        });

        res.json({
            success: true,
            result,
            requestId: `req_${Date.now()}`,
            responseTime
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        logger.error('Review summarization failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Review analysis unavailable',
            requestId: `req_${Date.now()}`,
            responseTime
        });
    }
});

// Main function
export const getProductAvailability = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
        return;
    }

    const startTime = Date.now();

    try {
        // Authentication
        const authResult = await authenticateRequest(req);
        if (!authResult.isValid) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Valid authentication token required'
            });
            return;
        }

        // Rate limiting
        const clientId = authResult.userId || req.ip;
        if (!checkRateLimit(clientId)) {
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.'
            });
            return;
        }

        // Input validation
        const validation = validateInventoryRequest(req.body);
        if (!validation.isValid) {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid request parameters',
                details: validation.errors
            });
            return;
        }

        const { productId, storeIds, includeQuantity = false }: InventoryRequest = req.body;

        // Check cache first
        const cacheKey = getCacheKey(productId, storeIds);
        const cachedResult = getFromCache(cacheKey);
        if (cachedResult) {
            logger.info('Inventory data served from cache', {
                productId,
                storeCount: storeIds.length,
                userId: authResult.userId
            });

            res.json({
                inventory: cachedResult,
                cached: true,
                requestId: `req_${Date.now()}`
            });
            return;
        }

        // Permission check for quantity data
        const canViewQuantity = includeQuantity && (
            authResult.userRole === 'admin' ||
            authResult.userRole === 'manager' ||
            authResult.userRole === 'employee'
        );

        // Batch query for better performance
        const db = admin.firestore();
        const batch = db.batch();

        const inventoryPromises = storeIds.map(async (storeId) => {
            try {
                const docRef = db
                    .collection('stores')
                    .doc(storeId)
                    .collection('inventory')
                    .doc(productId);

                const doc = await docRef.get();

                if (doc.exists) {
                    const data = doc.data();
                    const quantity = data?.quantity || 0;

                    // Abstract quantity into availability levels for regular users
                    const getAvailabilityLevel = (qty: number): 'high' | 'medium' | 'low' => {
                        if (qty >= 10) return 'high';
                        if (qty >= 3) return 'medium';
                        return 'low';
                    };

                    const response: InventoryResponse = {
                        storeId,
                        productId,
                        inStock: data?.inStock === true && quantity > 0,
                        lastUpdated: data?.lastUpdated || new Date().toISOString(),
                        estimatedAvailability: getAvailabilityLevel(quantity)
                    };

                    // Only include exact quantity for authorized users
                    if (canViewQuantity) {
                        response.quantity = quantity;
                    }

                    return response;
                }

                return {
                    storeId,
                    productId,
                    inStock: false,
                    lastUpdated: new Date().toISOString(),
                    estimatedAvailability: 'low' as const
                };

            } catch (error) {
                logger.error(`Failed to fetch inventory for store ${storeId}:`, error);

                // Return error state instead of throwing
                return {
                    storeId,
                    productId,
                    inStock: false,
                    lastUpdated: new Date().toISOString(),
                    estimatedAvailability: 'low' as const,
                    error: 'Failed to fetch data'
                };
            }
        });

        const inventory = await Promise.all(inventoryPromises);

        // Cache the result
        setCache(cacheKey, inventory);

        const responseTime = Date.now() - startTime;

        // Log successful request
        logger.info('Product availability retrieved successfully', {
            productId,
            storeCount: storeIds.length,
            userId: authResult.userId,
            responseTime,
            includeQuantity: canViewQuantity
        });

        res.json({
            inventory,
            cached: false,
            requestId: `req_${Date.now()}`,
            responseTime
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        logger.error('Product availability request failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            responseTime,
            method: req.method,
            url: req.url
        });

        // Return sanitized error response
        res.status(500).json({
            error: 'Internal server error',
            message: 'Unable to retrieve product availability at this time',
            requestId: `req_${Date.now()}`,
            responseTime
        });
    }
});

export const getStores = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
        return;
    }

    const startTime = Date.now();

    try {
        const { latitude, longitude, radius = 25000 } = req.query;

        // Get the API key from Firebase config
        const GOOGLE_PLACES_API_KEY = functions.config().google?.places_api_key;

        if (!GOOGLE_PLACES_API_KEY) {
            logger.error('Google Places API key not configured');
            res.status(500).json({ error: 'API configuration error' });
            return;
        }

        if (latitude && longitude) {
            try {
                logger.info('Calling Google Places API', {
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius
                });

                // Call Google Places API
                const placesResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=80000&type=store&keyword=walmart&key=${GOOGLE_PLACES_API_KEY}`
                );

                if (!placesResponse.ok) {
                    throw new Error(`HTTP ${placesResponse.status}: ${placesResponse.statusText}`);
                }

                const placesData = await placesResponse.json() as GooglePlacesResponse;

                logger.info('Google Places API response', {
                    status: placesData.status,
                    resultCount: placesData.results?.length || 0
                });

                if (placesData.status === 'OK' && placesData.results && placesData.results.length > 0) {
                    // Transform Google Places results to your store format
                    const stores = placesData.results
                        .filter(place => place.name.toLowerCase().includes('walmart'))
                        .map(place => {
                            const address = parseAddress(place.vicinity);
                            const storeType = determineStoreType(place.name);

                            return {
                                id: place.place_id,
                                name: place.name,
                                storeNumber: place.place_id.slice(-6),
                                address,
                                phone: '',
                                coordinates: {
                                    latitude: place.geometry.location.lat,
                                    longitude: place.geometry.location.lng,
                                },
                                rating: place.rating || 0,
                                reviewCount: place.user_ratings_total || 0,
                                isOpen: place.opening_hours?.open_now || false,
                                hours: {
                                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                                    friday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                                    saturday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                                },
                                services: storeType === 'Supercenter'
                                    ? ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup', 'Photo Center']
                                    : ['Grocery Pickup'],
                                storeType,
                                features: storeType === 'Supercenter'
                                    ? ['24/7 ATM', 'Free WiFi', 'Garden Center']
                                    : ['Free WiFi'],
                                pickupAvailable: true,
                                deliveryAvailable: storeType !== 'Pickup Only',
                                curbsideAvailable: true,
                                currentCapacity: Math.floor(Math.random() * 40) + 60,
                                estimatedWaitTime: Math.floor(Math.random() * 10) + 2,
                                lastUpdated: new Date().toISOString(),
                            };
                        });

                    logger.info('Stores retrieved successfully from Google Places', {
                        storeCount: stores.length,
                        responseTime: Date.now() - startTime,
                    });

                    res.json({
                        stores,
                        source: 'google_places',
                        requestId: `req_${Date.now()}`,
                        responseTime: Date.now() - startTime
                    });
                    return;
                } else {
                    logger.warn('Google Places API returned non-OK status', {
                        status: placesData.status,
                        error: placesData.error_message
                    });
                }
            } catch (error) {
                logger.error('Error calling Google Places API:', error);
            }
        }

        // Fallback to mock store data
        logger.info('Using fallback mock store data');

        // Enhanced mock stores with Bay Area coverage
        const mockStores = [
            {
                id: 'walmart-fremont',
                name: 'Walmart Supercenter',
                storeNumber: '2785',
                address: {
                    street: '39770 Argonaut Way',
                    city: 'Fremont',
                    state: 'CA',
                    zipCode: '94538',
                    fullAddress: '39770 Argonaut Way, Fremont, CA 94538',
                },
                phone: '(510) 742-9977',
                coordinates: { latitude: 37.5485, longitude: -121.9886 },
                rating: 4.1,
                reviewCount: 2156,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup', 'Photo Center', 'Garden Center'],
                storeType: 'Supercenter' as const,
                features: ['24/7 ATM', 'Free WiFi', 'Garden Center', 'Subway'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 78,
                estimatedWaitTime: 4,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-san-jose',
                name: 'Walmart Supercenter',
                storeNumber: '2675',
                address: {
                    street: '777 Story Rd',
                    city: 'San Jose',
                    state: 'CA',
                    zipCode: '95122',
                    fullAddress: '777 Story Rd, San Jose, CA 95122',
                },
                phone: '(408) 926-8244',
                coordinates: { latitude: 37.3394, longitude: -121.8553 },
                rating: 3.9,
                reviewCount: 1892,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '12:00 AM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '12:00 AM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup', 'Money Services'],
                storeType: 'Supercenter' as const,
                features: ['24/7 ATM', 'Free WiFi', 'Tire & Lube', 'McDonald\'s'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 82,
                estimatedWaitTime: 6,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-neighborhood-milpitas',
                name: 'Walmart Neighborhood Market',
                storeNumber: '5260',
                address: {
                    street: '1827 Landess Ave',
                    city: 'Milpitas',
                    state: 'CA',
                    zipCode: '95035',
                    fullAddress: '1827 Landess Ave, Milpitas, CA 95035',
                },
                phone: '(408) 719-0292',
                coordinates: { latitude: 37.4323, longitude: -121.9077 },
                rating: 4.3,
                reviewCount: 743,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Grocery Pickup', 'Money Services'],
                storeType: 'Neighborhood Market' as const,
                features: ['Fresh Produce', 'Deli', 'Bakery', 'Free WiFi'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: false,
                currentCapacity: 65,
                estimatedWaitTime: 3,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-pickup-mountain-view',
                name: 'Walmart Pickup Point',
                storeNumber: '6180',
                address: {
                    street: '600 Showers Dr',
                    city: 'Mountain View',
                    state: 'CA',
                    zipCode: '94040',
                    fullAddress: '600 Showers Dr, Mountain View, CA 94040',
                },
                phone: '(650) 988-0163',
                coordinates: { latitude: 37.4030, longitude: -122.0827 },
                rating: 4.6,
                reviewCount: 312,
                isOpen: true,
                hours: {
                    monday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    tuesday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    wednesday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    thursday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    friday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    saturday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    sunday: { open: '8:00 AM', close: '6:00 PM', isOpen: true },
                },
                services: ['Grocery Pickup', 'Online Order Pickup'],
                storeType: 'Pickup Only' as const,
                features: ['Curbside Pickup', 'Express Pickup', 'Free WiFi'],
                pickupAvailable: true,
                deliveryAvailable: false,
                curbsideAvailable: true,
                currentCapacity: 95,
                estimatedWaitTime: 2,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-main',
                name: 'Walmart Supercenter',
                storeNumber: '4700',
                address: {
                    street: '4700 Kearny Mesa Rd',
                    city: 'San Diego',
                    state: 'CA',
                    zipCode: '92111',
                    fullAddress: '4700 Kearny Mesa Rd, San Diego, CA 92111',
                },
                phone: '(858) 279-6845',
                coordinates: { latitude: 32.8197, longitude: -117.1411 },
                rating: 4.2,
                reviewCount: 1847,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup', 'Photo Center'],
                storeType: 'Supercenter' as const,
                features: ['24/7 ATM', 'Free WiFi', 'Garden Center', 'McDonald\'s'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 85,
                estimatedWaitTime: 5,
                lastUpdated: new Date().toISOString(),
            },
        ];

        // Calculate distances and sort by proximity if location provided
        const mockStoresWithDistance = latitude && longitude
            ? mockStores.map(store => ({
                ...store,
                distance: calculateDistance(
                    parseFloat(latitude as string),
                    parseFloat(longitude as string),
                    store.coordinates.latitude,
                    store.coordinates.longitude
                )
            })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
            : mockStores;

        const responseTime = Date.now() - startTime;

        logger.info('Stores retrieved successfully (fallback)', {
            storeCount: mockStoresWithDistance.length,
            responseTime,
            hasLocation: !!(latitude && longitude)
        });

        res.json({
            stores: mockStoresWithDistance,
            source: 'fallback',
            requestId: `req_${Date.now()}`,
            responseTime
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        logger.error('Store retrieval failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Unable to retrieve stores at this time',
            requestId: `req_${Date.now()}`,
            responseTime
        });
    }
});

// Cleanup function for cache and rate limiting (call periodically)
export const cleanupMemoryStores = functions.pubsub
    .schedule('every 10 minutes')
    .onRun(async (context) => {
        const now = Date.now();

        // Clean expired cache entries
        for (const [key, value] of inventoryCache.entries()) {
            if (now >= value.expiry) {
                inventoryCache.delete(key);
            }
        }

        // Clean expired rate limit entries
        for (const [key, value] of rateLimitStore.entries()) {
            if (now >= value.resetTime) {
                rateLimitStore.delete(key);
            }
        }

        logger.info('Memory stores cleaned up', {
            cacheSize: inventoryCache.size,
            rateLimitSize: rateLimitStore.size
        });
    });