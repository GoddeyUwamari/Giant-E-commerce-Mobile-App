// services/api/smartSuggestions.ts
// Smart search suggestions using real product data

import { ALL_PRODUCTS, CATEGORIES } from '../../constants/products';

export interface SearchSuggestion {
    text: string;
    type: 'product' | 'category' | 'brand' | 'feature';
    popularity?: number;
}

class SmartSuggestionsService {
    private brands: Set<string> = new Set();
    private categories: Set<string> = new Set();
    private popularTerms: Set<string> = new Set();
    private productNames: Set<string> = new Set();

    constructor() {
        this.buildSearchIndex();
    }

    /**
     * Build search index from real product data
     */
    private buildSearchIndex() {
        // Extract brands from real products
        ALL_PRODUCTS.forEach(product => {
            if (product.brand) {
                this.brands.add(product.brand.toLowerCase());
            }

            // Extract product names
            this.productNames.add(product.name.toLowerCase());

            // Extract popular terms from tags
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach(tag => {
                    if (typeof tag === 'string') {
                        this.popularTerms.add(tag.toLowerCase());
                    }
                });
            }

            // Extract terms from product names
            const nameWords = product.name.toLowerCase().split(' ');
            nameWords.forEach(word => {
                if (word.length > 2) {
                    this.popularTerms.add(word);
                }
            });
        });

        // Extract categories with safety checks
        Object.values(CATEGORIES).forEach(category => {
            if (category.name) {
                this.categories.add(category.name.toLowerCase());
            }

            // Add subcategories with safety checks
            if (category.subcategories && Array.isArray(category.subcategories)) {
                category.subcategories.forEach(sub => {
                    // Safety check: ensure sub is a string
                    if (typeof sub === 'string') {
                        this.categories.add(sub.toLowerCase());
                    } else if (sub && typeof sub === 'object' && sub.name) {
                        // If subcategory is an object with name property
                        this.categories.add(sub.name.toLowerCase());
                    }
                });
            }
        });

        // Add common search terms for Walmart
        const commonTerms = [
            'wireless', 'bluetooth', 'smart', 'portable', 'waterproof',
            'organic', 'natural', 'eco-friendly', 'premium', 'professional',
            'gaming', 'fitness', 'kitchen', 'outdoor', 'indoor'
        ];
        commonTerms.forEach(term => this.popularTerms.add(term));
    }

    /**
     * Get smart search suggestions based on query
     */
    getSearchSuggestions(query: string, categories: string[]): SearchSuggestion[] {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm || searchTerm.length < 1) {
            return this.getTrendingSuggestions();
        }

        const suggestions: SearchSuggestion[] = [];

        // 1. Brand suggestions
        const brandMatches = Array.from(this.brands)
            .filter(brand => brand.includes(searchTerm))
            .slice(0, 2)
            .map(brand => ({
                text: this.capitalizeFirst(brand),
                type: 'brand' as const,
                popularity: this.getBrandPopularity(brand)
            }));

        // 2. Category suggestions
        const categoryMatches = Array.from(this.categories)
            .filter(category => category.includes(searchTerm))
            .slice(0, 2)
            .map(category => ({
                text: this.capitalizeFirst(category),
                type: 'category' as const,
                popularity: this.getCategoryPopularity(category)
            }));

        // 3. Product suggestions (from real product names)
        const productMatches = Array.from(this.productNames)
            .filter(name => name.includes(searchTerm))
            .slice(0, 3)
            .map(name => ({
                text: this.capitalizeFirst(name),
                type: 'product' as const,
                popularity: this.getProductPopularity(name)
            }));

        // 4. Feature/term suggestions
        const termMatches = Array.from(this.popularTerms)
            .filter(term => term.includes(searchTerm) && term !== searchTerm)
            .slice(0, 2)
            .map(term => ({
                text: this.capitalizeFirst(term),
                type: 'feature' as const,
                popularity: this.getTermPopularity(term)
            }));

        // Combine and prioritize suggestions
        suggestions.push(...brandMatches, ...productMatches, ...categoryMatches, ...termMatches);

        // Sort by popularity and relevance
        return suggestions
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 6);
    }

    /**
     * Get trending suggestions when no query
     */
    private getTrendingSuggestions(): SearchSuggestion[] {
        return [
            { text: 'iPhone', type: 'product', popularity: 95 },
            { text: 'Samsung', type: 'brand', popularity: 90 },
            { text: 'Wireless Headphones', type: 'product', popularity: 88 },
            { text: 'Gaming', type: 'category', popularity: 85 },
            { text: 'Smart TV', type: 'product', popularity: 82 },
            { text: 'Nike', type: 'brand', popularity: 80 },
        ];
    }

    /**
     * Get brand popularity score
     */
    private getBrandPopularity(brand: string): number {
        const popularBrands: Record<string, number> = {
            'apple': 95,
            'samsung': 90,
            'sony': 85,
            'nike': 88,
            'adidas': 85,
            'lg': 82,
            'hp': 80,
            'dell': 78,
            'canon': 75,
            'nintendo': 88,
        };

        return popularBrands[brand.toLowerCase()] || 60;
    }

    /**
     * Get category popularity score
     */
    private getCategoryPopularity(category: string): number {
        const popularCategories: Record<string, number> = {
            'electronics': 95,
            'fashion': 90,
            'home': 85,
            'beauty': 80,
            'sports': 78,
            'gaming': 88,
            'kitchen': 82,
        };

        return popularCategories[category.toLowerCase()] || 65;
    }

    /**
     * Get product popularity score
     */
    private getProductPopularity(productName: string): number {
        // Check if product contains popular keywords
        const popularKeywords = ['iphone', 'samsung', 'airpods', 'tv', 'laptop', 'headphones'];
        const hasPopularKeyword = popularKeywords.some(keyword =>
            productName.toLowerCase().includes(keyword)
        );

        return hasPopularKeyword ? 85 : 70;
    }

    /**
     * Get term popularity score
     */
    private getTermPopularity(term: string): number {
        const popularTerms: Record<string, number> = {
            'wireless': 90,
            'bluetooth': 88,
            'smart': 85,
            'gaming': 88,
            'portable': 75,
            'waterproof': 70,
            'organic': 72,
            'professional': 78,
        };

        return popularTerms[term.toLowerCase()] || 60;
    }

    /**
     * Capitalize first letter of each word
     */
    private capitalizeFirst(text: string): string {
        return text.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get contextual suggestions based on current category
     */
    getContextualSuggestions(category: string): SearchSuggestion[] {
        const contextualMap: Record<string, SearchSuggestion[]> = {
            'electronics': [
                { text: 'iPhone 15', type: 'product', popularity: 95 },
                { text: 'Samsung Galaxy', type: 'product', popularity: 90 },
                { text: 'MacBook', type: 'product', popularity: 88 },
                { text: 'AirPods', type: 'product', popularity: 85 },
            ],
            'fashion': [
                { text: 'Nike Shoes', type: 'product', popularity: 90 },
                { text: 'Jeans', type: 'product', popularity: 85 },
                { text: 'T-Shirts', type: 'product', popularity: 80 },
                { text: 'Adidas', type: 'brand', popularity: 88 },
            ],
            'home-garden': [
                { text: 'Kitchen Appliances', type: 'category', popularity: 85 },
                { text: 'Furniture', type: 'category', popularity: 80 },
                { text: 'Garden Tools', type: 'category', popularity: 75 },
                { text: 'Home Decor', type: 'category', popularity: 78 },
            ],
        };

        return contextualMap[category] || this.getTrendingSuggestions();
    }
}

// Export singleton instance
export const smartSuggestionsService = new SmartSuggestionsService();

// Export default for easy importing
export default {
    getSearchSuggestions: smartSuggestionsService.getSearchSuggestions.bind(smartSuggestionsService),
    getContextualSuggestions: smartSuggestionsService.getContextualSuggestions.bind(smartSuggestionsService),
};