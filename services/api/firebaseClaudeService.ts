// services/api/firebaseClaudeService.ts
// Replace your existing claude.ts service with this one

import { getCurrentUser } from '../../firebase/auth';

const FUNCTIONS_BASE_URL = 'https://us-central1-walmart-mobile-a6865.cloudfunctions.net';

class FirebaseClaudeService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = FUNCTIONS_BASE_URL;
    }

    private async getAuthToken(): Promise<string | null> {
        try {
            const user = getCurrentUser();
            if (user && user.getIdToken) {
                return await user.getIdToken();
            }
            return null;
        } catch (error) {
            console.warn('Failed to get auth token:', error);
            return null;
        }
    }

    private async makeRequest(endpoint: string, data: any): Promise<any> {
        try {
            const token = await this.getAuthToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Add auth header if available (optional for most functions)
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `API request failed: ${response.status}`;

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // Use status text if JSON parsing fails
                    errorMessage = `${errorMessage} - ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'API request failed');
            }

            return result;
        } catch (error) {
            console.error(`Firebase Claude API error (${endpoint}):`, error);
            throw error;
        }
    }

    // ========================================
    // CHAT COMPLETION (for support chat)
    // ========================================
    async chat(messages: Array<{role: 'user' | 'assistant'; content: string}>, systemPrompt?: string): Promise<string> {
        try {
            const result = await this.makeRequest('getChatResponse', {
                messages,
                systemPrompt,
                maxTokens: 1000
            });

            return result.response || '';
        } catch (error) {
            console.error('Chat error:', error);
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
            const result = await this.makeRequest('enhanceSearch', { query });

            return result.result || {
                enhancedQuery: query,
                searchTerms: query.split(' '),
                filters: {},
                suggestions: []
            };
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
            const result = await this.makeRequest('summarizeReviews', { reviews });

            return result.result || {
                summary: "Unable to analyze reviews at this time.",
                pros: [],
                cons: [],
                commonThemes: [],
                recommendationScore: 0
            };
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
            // Note: This would need a separate Firebase Function if you want to implement it
            // For now, return a fallback since it's not implemented in your Firebase Functions
            console.warn('Personalized recommendations not implemented in Firebase Functions');

            return {
                recommendations: availableProducts.slice(0, 5).map(p => p.id),
                reasoning: ["Based on your browsing history", "Popular in your categories"]
            };
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
            const result = await this.makeRequest('answerProductQuestion', {
                question,
                productData
            });

            return result.response || 'I need more information to answer that question.';
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
            const result = await this.makeRequest('getShoppingAssistance', {
                userMessage,
                context
            });

            return result.response || 'How can I help you with your shopping today?';
        } catch (error) {
            console.error('Shopping assistance error:', error);
            return 'I apologize, but I\'m having trouble right now. How can I help you with your shopping?';
        }
    }
}

// Export singleton instance
export const firebaseClaudeService = new FirebaseClaudeService();

// Export default methods for easy importing
export default {
    chat: firebaseClaudeService.chat.bind(firebaseClaudeService),
    enhanceSearch: firebaseClaudeService.enhanceSearch.bind(firebaseClaudeService),
    summarizeReviews: firebaseClaudeService.summarizeReviews.bind(firebaseClaudeService),
    getPersonalizedRecommendations: firebaseClaudeService.getPersonalizedRecommendations.bind(firebaseClaudeService),
    answerProductQuestion: firebaseClaudeService.answerProductQuestion.bind(firebaseClaudeService),
    getShoppingAssistance: firebaseClaudeService.getShoppingAssistance.bind(firebaseClaudeService),
};