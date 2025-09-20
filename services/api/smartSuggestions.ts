// services/api/smartSuggestions.ts
// Smart search suggestions using real CSV product data

// ✅ FIXED - Import from correct path with CSV system
import { ALL_PRODUCTS, ALL_CATEGORIES } from '../../constants/products/data';

export interface SearchSuggestion {
    text: string;
    type: 'product' | 'category' | 'brand' | 'feature';
    popularity?: number;
    count?: number; // Number of products/items for this suggestion
}

export interface TrendingItem {
    term: string;
    category: string;
    popularity: number;
    type: 'product' | 'brand' | 'category';
}

class SmartSuggestionsService {
    private brands: Map<string, number> = new Map(); // brand -> product count
    private categories: Map<string, number> = new Map(); // category -> product count
    private popularTerms: Map<string, number> = new Map(); // term -> frequency
    private productNames: Set<string> = new Set();
    private searchHistory: string[] = []; // User search history
    private categoryProductCounts: Map<string, number> = new Map();

    constructor() {
        this.buildSearchIndex();
        this.loadSearchHistory();
    }

    /**
     * ✅ FIXED - Build search index from real CSV product data
     */
    private buildSearchIndex() {
        console.log('Building search index from', ALL_PRODUCTS.length, 'products');

        // Reset collections
        this.brands.clear();
        this.categories.clear();
        this.popularTerms.clear();
        this.productNames.clear();

        // Extract data from actual CSV products
        ALL_PRODUCTS.forEach(product => {
            // Extract brands with counts
            if (product.brand && product.brand.trim()) {
                const brand = product.brand.toLowerCase().trim();
                this.brands.set(brand, (this.brands.get(brand) || 0) + 1);
            }

            // Extract product names for exact matching
            if (product.name && product.name.trim()) {
                this.productNames.add(product.name.toLowerCase().trim());
            }

            // Extract categories with counts
            if (product.category && product.category.trim()) {
                const category = product.category.toLowerCase().trim();
                this.categories.set(category, (this.categories.get(category) || 0) + 1);
            }

            // Extract sub-categories if available
            if (product.subCategory && product.subCategory.trim()) {
                const subCategory = product.subCategory.toLowerCase().trim();
                this.categories.set(subCategory, (this.categories.get(subCategory) || 0) + 1);
            }

            // Extract popular terms from product names
            const nameWords = product.name.toLowerCase()
                .replace(/[^\w\s]/g, ' ') // Remove special characters
                .split(/\s+/)
                .filter(word => word.length > 2); // Only words longer than 2 chars

            nameWords.forEach(word => {
                // Skip common words
                const commonWords = ['the', 'and', 'for', 'with', 'from', 'pack', 'set'];
                if (!commonWords.includes(word)) {
                    this.popularTerms.set(word, (this.popularTerms.get(word) || 0) + 1);
                }
            });
        });

        // ✅ FIXED - Extract categories from ALL_CATEGORIES array
        ALL_CATEGORIES.forEach(category => {
            if (category.name) {
                const categoryName = category.name.toLowerCase();
                // Update with actual product count if available
                const productCount = category.productCount || 0;
                this.categoryProductCounts.set(categoryName, productCount);

                // If not already counted from products, add it
                if (!this.categories.has(categoryName)) {
                    this.categories.set(categoryName, productCount);
                }
            }
        });

        // Add technology and feature terms that are commonly searched
        const techTerms = [
            'wireless', 'bluetooth', 'smart', 'portable', 'waterproof', 'rechargeable',
            'digital', 'led', 'hd', '4k', 'gaming', 'professional', 'premium',
            'organic', 'natural', 'eco-friendly', 'sustainable', 'antibacterial'
        ];

        techTerms.forEach(term => {
            // Only add if not already present with higher frequency
            if (!this.popularTerms.has(term) || this.popularTerms.get(term)! < 10) {
                this.popularTerms.set(term, 15);
            }
        });

        console.log('Search index built:', {
            brands: this.brands.size,
            categories: this.categories.size,
            terms: this.popularTerms.size,
            products: this.productNames.size
        });
    }

    /**
     * ✅ ENHANCED - Get smart search suggestions based on query with better matching
     */
    getSearchSuggestions(query: string, currentCategory?: string): SearchSuggestion[] {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm || searchTerm.length < 1) {
            return this.getTrendingSuggestions(currentCategory);
        }

        const suggestions: SearchSuggestion[] = [];

        // 1. Exact and partial brand matches
        const brandMatches = Array.from(this.brands.entries())
            .filter(([brand]) => brand.includes(searchTerm) || searchTerm.includes(brand))
            .sort((a, b) => b[1] - a[1]) // Sort by product count
            .slice(0, 3)
            .map(([brand, count]) => ({
                text: this.capitalizeWords(brand),
                type: 'brand' as const,
                popularity: this.calculateBrandPopularity(brand, count),
                count
            }));

        // 2. Category matches (including subcategories)
        const categoryMatches = Array.from(this.categories.entries())
            .filter(([category]) => category.includes(searchTerm) || searchTerm.includes(category))
            .sort((a, b) => b[1] - a[1]) // Sort by product count
            .slice(0, 2)
            .map(([category, count]) => ({
                text: this.capitalizeWords(category),
                type: 'category' as const,
                popularity: this.calculateCategoryPopularity(category, count),
                count
            }));

        // 3. Product name matches (most relevant first)
        const productMatches = Array.from(this.productNames)
            .filter(name => name.includes(searchTerm))
            .sort((a, b) => {
                // Prioritize matches that start with the search term
                const aStartsWith = a.startsWith(searchTerm);
                const bStartsWith = b.startsWith(searchTerm);
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return a.length - b.length; // Shorter names first
            })
            .slice(0, 4)
            .map(name => ({
                text: this.capitalizeWords(name),
                type: 'product' as const,
                popularity: this.calculateProductPopularity(name)
            }));

        // 4. Popular terms and features
        const termMatches = Array.from(this.popularTerms.entries())
            .filter(([term, count]) =>
                term.includes(searchTerm) &&
                term !== searchTerm &&
                count >= 3 // Only include terms that appear multiple times
            )
            .sort((a, b) => b[1] - a[1]) // Sort by frequency
            .slice(0, 2)
            .map(([term, count]) => ({
                text: this.capitalizeWords(term),
                type: 'feature' as const,
                popularity: this.calculateTermPopularity(term, count),
                count
            }));

        // Combine suggestions with priority: brands > products > categories > terms
        suggestions.push(...brandMatches, ...productMatches, ...categoryMatches, ...termMatches);

        // Sort by popularity and relevance
        return suggestions
            .sort((a, b) => {
                // Prioritize exact matches
                const aExact = a.text.toLowerCase() === searchTerm;
                const bExact = b.text.toLowerCase() === searchTerm;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                // Then by popularity
                return (b.popularity || 0) - (a.popularity || 0);
            })
            .slice(0, 8); // Return top 8 suggestions
    }

    /**
     * ✅ ENHANCED - Get trending suggestions with real data
     */
    private getTrendingSuggestions(currentCategory?: string): SearchSuggestion[] {
        // Get top brands by product count
        const topBrands = Array.from(this.brands.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([brand, count]) => ({
                text: this.capitalizeWords(brand),
                type: 'brand' as const,
                popularity: 90 + Math.min(count / 10, 10), // Base 90 + bonus for product count
                count
            }));

        // Get top categories by product count
        const topCategories = Array.from(this.categories.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([category, count]) => ({
                text: this.capitalizeWords(category),
                type: 'category' as const,
                popularity: 85 + Math.min(count / 20, 15),
                count
            }));

        // Get popular search terms
        const popularTerms = Array.from(this.popularTerms.entries())
            .filter(([term, count]) => count >= 5)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([term, count]) => ({
                text: this.capitalizeWords(term),
                type: 'feature' as const,
                popularity: 80 + Math.min(count / 5, 20),
                count
            }));

        const trending = [...topBrands, ...topCategories, ...popularTerms];

        // If in a specific category, add category-specific suggestions
        if (currentCategory) {
            const contextual = this.getContextualSuggestions(currentCategory);
            trending.push(...contextual.slice(0, 2));
        }

        return trending
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 6);
    }

    /**
     * ✅ ENHANCED - Get contextual suggestions based on category
     */
    getContextualSuggestions(category: string): SearchSuggestion[] {
        const categoryKey = category.toLowerCase();

        // Get products from this category to extract relevant terms
        const categoryProducts = ALL_PRODUCTS.filter(product =>
            product.category.toLowerCase() === categoryKey
        );

        if (categoryProducts.length === 0) {
            return this.getTrendingSuggestions();
        }

        // Extract popular terms from this category
        const categoryTerms = new Map<string, number>();
        categoryProducts.forEach(product => {
            const words = product.name.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2);

            words.forEach(word => {
                categoryTerms.set(word, (categoryTerms.get(word) || 0) + 1);
            });
        });

        // Get top terms for this category
        const suggestions = Array.from(categoryTerms.entries())
            .filter(([term, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([term, count]) => ({
                text: this.capitalizeWords(term),
                type: 'feature' as const,
                popularity: 70 + Math.min(count * 5, 30),
                count
            }));

        return suggestions;
    }

    /**
     * ✅ ENHANCED - Calculate brand popularity based on real data
     */
    private calculateBrandPopularity(brand: string, productCount: number): number {
        // Base popularity + bonus for product count
        const basePopularity = 70;
        const countBonus = Math.min(productCount * 2, 30); // Max 30 bonus points

        // Additional bonus for well-known brands
        const knownBrands = ['apple', 'samsung', 'sony', 'nike', 'lg', 'hp'];
        const knownBonus = knownBrands.includes(brand.toLowerCase()) ? 15 : 0;

        return basePopularity + countBonus + knownBonus;
    }

    /**
     * ✅ ENHANCED - Calculate category popularity
     */
    private calculateCategoryPopularity(category: string, productCount: number): number {
        const basePopularity = 75;
        const countBonus = Math.min(productCount / 2, 25);
        return basePopularity + countBonus;
    }

    /**
     * ✅ ENHANCED - Calculate product popularity
     */
    private calculateProductPopularity(productName: string): number {
        // Check for popular keywords
        const popularKeywords = ['iphone', 'samsung', 'wireless', 'smart', 'pro', 'plus'];
        const hasPopularKeyword = popularKeywords.some(keyword =>
            productName.toLowerCase().includes(keyword)
        );

        const basePopularity = 65;
        const keywordBonus = hasPopularKeyword ? 20 : 0;
        const lengthPenalty = productName.length > 50 ? -10 : 0; // Shorter names are better

        return basePopularity + keywordBonus + lengthPenalty;
    }

    /**
     * ✅ ENHANCED - Calculate term popularity
     */
    private calculateTermPopularity(term: string, frequency: number): number {
        const basePopularity = 60;
        const frequencyBonus = Math.min(frequency * 3, 30);

        // Bonus for tech terms
        const techTerms = ['wireless', 'smart', 'digital', 'bluetooth', 'portable'];
        const techBonus = techTerms.includes(term.toLowerCase()) ? 15 : 0;

        return basePopularity + frequencyBonus + techBonus;
    }

    /**
     * ✅ ENHANCED - Better capitalization
     */
    private capitalizeWords(text: string): string {
        return text.split(' ')
            .map(word => {
                // Handle special cases
                if (word.toLowerCase() === 'tv') return 'TV';
                if (word.toLowerCase() === 'led') return 'LED';
                if (word.toLowerCase() === 'usb') return 'USB';
                if (word.toLowerCase() === 'hd') return 'HD';
                if (word.toLowerCase() === '4k') return '4K';

                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    /**
     * ✅ NEW - Get search analytics
     */
    getSearchAnalytics() {
        return {
            totalBrands: this.brands.size,
            totalCategories: this.categories.size,
            totalTerms: this.popularTerms.size,
            totalProducts: this.productNames.size,
            topBrands: Array.from(this.brands.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([brand, count]) => ({ brand: this.capitalizeWords(brand), count })),
            topCategories: Array.from(this.categories.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category, count]) => ({ category: this.capitalizeWords(category), count }))
        };
    }

    /**
     * ✅ NEW - Load search history from storage
     */
    private async loadSearchHistory() {
        try {
            // In a real app, load from AsyncStorage
            // const history = await AsyncStorage.getItem('search_history');
            // this.searchHistory = history ? JSON.parse(history) : [];
            this.searchHistory = []; // For now, start empty
        } catch (error) {
            console.error('Error loading search history:', error);
            this.searchHistory = [];
        }
    }

    /**
     * ✅ NEW - Add search to history
     */
    addToSearchHistory(query: string) {
        if (!query.trim()) return;

        const trimmedQuery = query.trim();

        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item !== trimmedQuery);

        // Add to beginning
        this.searchHistory.unshift(trimmedQuery);

        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);

        // In a real app, save to AsyncStorage
        // AsyncStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }

    /**
     * ✅ NEW - Get search history suggestions
     */
    getSearchHistory(): SearchSuggestion[] {
        return this.searchHistory.map(query => ({
            text: query,
            type: 'product' as const,
            popularity: 50 // Lower priority than other suggestions
        }));
    }

    /**
     * ✅ NEW - Clear search history
     */
    clearSearchHistory() {
        this.searchHistory = [];
        // AsyncStorage.removeItem('search_history');
    }

    /**
     * ✅ NEW - Get category-specific trending items
     */
    getCategoryTrending(category: string): TrendingItem[] {
        const categoryProducts = ALL_PRODUCTS.filter(product =>
            product.category.toLowerCase() === category.toLowerCase()
        );

        if (categoryProducts.length === 0) return [];

        // Get trending brands in this category
        const brandCounts = new Map<string, number>();
        categoryProducts.forEach(product => {
            if (product.brand) {
                const brand = product.brand.toLowerCase();
                brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
            }
        });

        return Array.from(brandCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([brand, count], index) => ({
                term: this.capitalizeWords(brand),
                category,
                popularity: 90 - (index * 5),
                type: 'brand' as const
            }));
    }

    /**
     * ✅ NEW - Rebuild index (useful for updates)
     */
    rebuildIndex() {
        this.buildSearchIndex();
    }
}

// Export singleton instance
export const smartSuggestionsService = new SmartSuggestionsService();

// ✅ ENHANCED - Export enhanced default object
export default {
    getSearchSuggestions: smartSuggestionsService.getSearchSuggestions.bind(smartSuggestionsService),
    getContextualSuggestions: smartSuggestionsService.getContextualSuggestions.bind(smartSuggestionsService),
    getSearchAnalytics: smartSuggestionsService.getSearchAnalytics.bind(smartSuggestionsService),
    addToSearchHistory: smartSuggestionsService.addToSearchHistory.bind(smartSuggestionsService),
    getSearchHistory: smartSuggestionsService.getSearchHistory.bind(smartSuggestionsService),
    clearSearchHistory: smartSuggestionsService.clearSearchHistory.bind(smartSuggestionsService),
    getCategoryTrending: smartSuggestionsService.getCategoryTrending.bind(smartSuggestionsService),
    rebuildIndex: smartSuggestionsService.rebuildIndex.bind(smartSuggestionsService),
};