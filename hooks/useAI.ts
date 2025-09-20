// hooks/useAI.ts
import { useState, useCallback } from 'react';
import firebaseClaudeService from '../services/api/firebaseClaudeService';
import { smartSuggestionsService, SearchSuggestion } from '../services/api/smartSuggestions';

interface AIState {
    loading: boolean;
    error: string | null;
}

export const useAI = () => {
    const [state, setState] = useState<AIState>({
        loading: false,
        error: null
    });

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    // ========================================
    // CHAT METHODS
    // ========================================
    const chat = useCallback(async (
        messages: Array<{role: 'user' | 'assistant'; content: string}>,
        systemPrompt?: string
    ): Promise<string | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await firebaseClaudeService.chat(messages, systemPrompt);
            return response;
        } catch (error) {
            console.error('AI chat error:', error);
            setError('Failed to get AI response');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========================================
    // SEARCH ENHANCEMENT
    // ========================================
    const enhanceSearch = useCallback(async (
        query: string,
        products: any[]
    ): Promise<{
        enhancedQuery: string;
        searchTerms: string[];
        filters: any;
        suggestions: string[];
    } | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await firebaseClaudeService.enhanceSearch(query, products);
            return result;
        } catch (error) {
            console.error('Search enhancement error:', error);
            setError('Failed to enhance search');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========================================
    // SEARCH SUGGESTIONS (Using Smart Suggestions)
    // ========================================
    const getSearchSuggestions = useCallback(async (
        query: string,
        categories: string[]
    ): Promise<SearchSuggestion[] | null> => {
        setLoading(true);
        setError(null);

        try {
            // Simulate slight delay for realistic UX
            await new Promise(resolve => setTimeout(resolve, 150));

            const suggestions = smartSuggestionsService.getSearchSuggestions(query, categories);
            return suggestions;
        } catch (error) {
            console.error('Search suggestions error:', error);
            setError('Failed to get search suggestions');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========================================
    // REVIEW SUMMARIZATION
    // ========================================
    const summarizeReviews = useCallback(async (
        reviews: any[]
    ): Promise<{
        summary: string;
        pros: string[];
        cons: string[];
        commonThemes: string[];
        recommendationScore: number;
    } | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await firebaseClaudeService.summarizeReviews(reviews);
            return result;
        } catch (error) {
            console.error('Review summarization error:', error);
            setError('Failed to summarize reviews');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========================================
    // PERSONALIZED RECOMMENDATIONS
    // ========================================
    const getRecommendations = useCallback(async (
        userProfile: {
            purchaseHistory: any[];
            browsedProducts: any[];
            preferences: any;
            demographics?: any;
        },
        availableProducts: any[]
    ): Promise<{
        recommendations: any[];
        reasoning: string[];
    } | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await firebaseClaudeService.getPersonalizedRecommendations(userProfile, availableProducts);
            return result;
        } catch (error) {
            console.error('Recommendations error:', error);
            setError('Failed to get recommendations');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========================================
    // PRODUCT Q&A
    // ========================================
    const answerProductQuestion = useCallback(async (
        question: string,
        productData: any
    ): Promise<string | null> => {
        setLoading(true);
        setError(null);

        try {
            const answer = await firebaseClaudeService.answerProductQuestion(question, productData);
            return answer;
        } catch (error) {
            console.error('Product Q&A error:', error);
            setError('Failed to answer question');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========================================
    // SHOPPING ASSISTANCE
    // ========================================
    const getShoppingAssistance = useCallback(async (
        userMessage: string,
        context: {
            currentPage?: string;
            cartItems?: any[];
            userProfile?: any;
            currentProduct?: any;
        }
    ): Promise<string | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await firebaseClaudeService.getShoppingAssistance(userMessage, context);
            return response;
        } catch (error) {
            console.error('Shopping assistance error:', error);
            setError('Failed to get assistance');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // State
        loading: state.loading,
        error: state.error,

        // Methods
        chat,
        enhanceSearch,
        summarizeReviews,
        getRecommendations,
        answerProductQuestion,
        getShoppingAssistance,
        getSearchSuggestions,

        // Utilities
        setError,
    };
};

export default useAI;