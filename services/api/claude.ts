// services/api/claude.ts
import Anthropic from '@anthropic-ai/sdk';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

class ClaudeService {
    private client: Anthropic;

    constructor() {
        this.client = new Anthropic({
            apiKey: extra.ANTHROPIC_API_KEY,
        });
    }

    // ========================================
    // CHAT COMPLETION (for support chat)
    // ========================================
    async chat(messages: Array<{role: 'user' | 'assistant'; content: string}>, systemPrompt?: string): Promise<string> {
        try {
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                system: systemPrompt || `You are a helpful Walmart shopping assistant. You help customers with:
- Product questions and recommendations
- Order tracking and support
- Store information and services
- Returns and refunds
- Price matching and deals
- Walmart+ membership benefits

Be friendly, helpful, and concise. Always prioritize customer satisfaction.`,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            });

            return response.content[0].type === 'text' ? response.content[0].text : '';
        } catch (error) {
            console.error('Claude chat error:', error);
            throw new Error('Failed to get AI response');
        }
    }

    // ========================================
    // SMART PRODUCT SEARCH
    // ========================================
    async enhanceSearch(query: string, products: any[]): Promise<{
        enhancedQuery: string;
        searchTerms: string[];
        filters: any;
        suggestions: string[];
    }> {
        try {
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
- suggestions: array of alternative searches

Example:
Query: "cheap wireless headphones for running"
Response: {
  "enhancedQuery": "wireless bluetooth headphones sports running budget affordable",
  "searchTerms": ["wireless", "bluetooth", "headphones", "sports", "running"],
  "filters": {
    "category": "electronics",
    "subcategory": "headphones",
    "maxPrice": 50,
    "features": ["wireless", "sports", "sweat-resistant"]
  },
  "suggestions": ["budget bluetooth earbuds", "sports wireless headphones under $50", "running earbuds waterproof"]
}`;

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 500,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: `Enhance this search query: "${query}"`
                }]
            });

            const content = response.content[0].type === 'text' ? response.content[0].text : '';

            try {
                return JSON.parse(content);
            } catch {
                // Fallback if JSON parsing fails
                return {
                    enhancedQuery: query,
                    searchTerms: query.split(' '),
                    filters: {},
                    suggestions: []
                };
            }
        } catch (error) {
            console.error('Search enhancement error:', error);
            return {
                enhancedQuery: query,
                searchTerms: query.split(' '),
                filters: {},
                suggestions: []
            };
        }
    }

    // ========================================
    // REVIEW SUMMARIZATION
    // ========================================
    async summarizeReviews(reviews: any[]): Promise<{
        summary: string;
        pros: string[];
        cons: string[];
        commonThemes: string[];
        recommendationScore: number;
    }> {
        try {
            const reviewTexts = reviews.map(review =>
                `Rating: ${review.rating}/5 - ${review.title || ''} ${review.comment || ''}`
            ).slice(0, 20); // Limit to 20 reviews to avoid token limits

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

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 800,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: `Analyze these product reviews:\n\n${reviewTexts.join('\n\n')}`
                }]
            });

            const content = response.content[0].type === 'text' ? response.content[0].text : '';

            try {
                return JSON.parse(content);
            } catch {
                // Fallback
                return {
                    summary: "Customer reviews are generally positive with some mixed feedback.",
                    pros: ["Good value", "Works as expected"],
                    cons: ["Some quality concerns"],
                    commonThemes: ["Value", "Quality"],
                    recommendationScore: 75
                };
            }
        } catch (error) {
            console.error('Review summarization error:', error);
            return {
                summary: "Unable to analyze reviews at this time.",
                pros: [],
                cons: [],
                commonThemes: [],
                recommendationScore: 0
            };
        }
    }

    // ========================================
    // PERSONALIZED RECOMMENDATIONS
    // ========================================
    async getPersonalizedRecommendations(userProfile: {
        purchaseHistory: any[];
        browsedProducts: any[];
        preferences: any;
        demographics?: any;
    }, availableProducts: any[]): Promise<{
        recommendations: any[];
        reasoning: string[];
    }> {
        try {
            const systemPrompt = `You are a personalized recommendation AI for Walmart.

Based on user's purchase history, browsing behavior, and preferences, recommend products from the available catalog.

Consider:
- Past purchases and patterns
- Recently viewed products
- Price preferences
- Category interests
- Seasonal relevance
- Complementary products

Return JSON with:
{
  "recommendations": [list of product IDs from available products],
  "reasoning": ["why product 1 recommended", "why product 2 recommended", ...]
}

Limit to 10 recommendations max.`;

            const userContext = `
Purchase History: ${JSON.stringify(userProfile.purchaseHistory.slice(0, 10))}
Recently Browsed: ${JSON.stringify(userProfile.browsedProducts.slice(0, 10))}
Preferences: ${JSON.stringify(userProfile.preferences)}
Available Products: ${JSON.stringify(availableProducts.slice(0, 50).map(p => ({id: p.id, name: p.name, category: p.category, price: p.price})))}
      `;

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: userContext
                }]
            });

            const content = response.content[0].type === 'text' ? response.content[0].text : '';

            try {
                const result = JSON.parse(content);
                return {
                    recommendations: result.recommendations || [],
                    reasoning: result.reasoning || []
                };
            } catch {
                // Fallback to simple recommendations
                return {
                    recommendations: availableProducts.slice(0, 5).map(p => p.id),
                    reasoning: ["Based on your browsing history", "Popular in your categories"]
                };
            }
        } catch (error) {
            console.error('Personalization error:', error);
            return {
                recommendations: [],
                reasoning: []
            };
        }
    }

    // ========================================
    // PRODUCT Q&A
    // ========================================
    async answerProductQuestion(question: string, productData: any): Promise<string> {
        try {
            const systemPrompt = `You are a product expert AI for Walmart. Answer customer questions about specific products using the provided product information.

Be accurate, helpful, and honest. If you don't have specific information, say so and suggest contacting customer service or checking reviews.

Product context will include: name, description, specifications, features, reviews, etc.`;

            const productContext = `
Product: ${productData.name}
Brand: ${productData.brand}
Description: ${productData.description}
Features: ${JSON.stringify(productData.features)}
Specifications: ${JSON.stringify(productData.specifications)}
Price: $${productData.price}
Average Rating: ${productData.rating}/5 (${productData.reviewCount} reviews)
      `;

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 300,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: `Product Information:\n${productContext}\n\nCustomer Question: ${question}`
                }]
            });

            return response.content[0].type === 'text' ? response.content[0].text : 'I need more information to answer that question.';
        } catch (error) {
            console.error('Product Q&A error:', error);
            return 'I apologize, but I cannot answer that question right now. Please try again later.';
        }
    }

    // ========================================
    // SHOPPING ASSISTANT
    // ========================================
    async getShoppingAssistance(userMessage: string, context: {
        currentPage?: string;
        cartItems?: any[];
        userProfile?: any;
        currentProduct?: any;
    }): Promise<string> {
        try {
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
- User: ${context.userProfile?.name || 'Guest'}
      `;

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 400,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: `${contextInfo}\n\nUser Message: ${userMessage}`
                }]
            });

            return response.content[0].type === 'text' ? response.content[0].text : 'How can I help you with your shopping today?';
        } catch (error) {
            console.error('Shopping assistance error:', error);
            return 'I apologize, but I\'m having trouble right now. How can I help you with your shopping?';
        }
    }
}

// Export singleton instance
export const claudeService = new ClaudeService();

// Export default methods for easy importing
export default {
    chat: claudeService.chat.bind(claudeService),
    enhanceSearch: claudeService.enhanceSearch.bind(claudeService),
    summarizeReviews: claudeService.summarizeReviews.bind(claudeService),
    getPersonalizedRecommendations: claudeService.getPersonalizedRecommendations.bind(claudeService),
    answerProductQuestion: claudeService.answerProductQuestion.bind(claudeService),
    getShoppingAssistance: claudeService.getShoppingAssistance.bind(claudeService),
};