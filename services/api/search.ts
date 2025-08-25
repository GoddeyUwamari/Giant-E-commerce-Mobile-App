import { apiClient } from './client';
// import { API } from '@/config/constants';

// Types
export interface SearchRequest {
    query: string;
    type?: SearchType;
    filters?: SearchFilters;
    sort?: SearchSort;
    page?: number;
    limit?: number;
    includeSpellcheck?: boolean;
    includeSuggestions?: boolean;
    includeAnalytics?: boolean;
    userLocation?: UserLocation;
    personalization?: PersonalizationContext;
}

export type SearchType = 'all' | 'products' | 'stores' | 'services' | 'categories' | 'brands';

export interface SearchFilters {
    // Product filters
    categoryId?: string;
    brandIds?: string[];
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    inStock?: boolean;
    onSale?: boolean;
    freeShipping?: boolean;
    seller?: 'walmart' | 'third_party' | 'all';

    // Store filters
    storeType?: ('supercenter' | 'neighborhood' | 'express')[];
    storeServices?: string[];
    distanceRadius?: number;
    isOpen?: boolean;

    // General filters
    availability?: ('available' | 'out_of_stock' | 'backorder')[];
    fulfillment?: ('delivery' | 'pickup' | 'same_day')[];
    dateRange?: {
        start: string;
        end: string;
    };
    tags?: string[];
}

export interface SearchSort {
    field: 'relevance' | 'price' | 'rating' | 'distance' | 'newest' | 'bestseller' | 'name' | 'popularity';
    direction: 'asc' | 'desc';
}

export interface UserLocation {
    latitude: number;
    longitude: number;
    zipCode?: string;
    city?: string;
    state?: string;
}

export interface PersonalizationContext {
    userId?: string;
    sessionId?: string;
    browsingHistory?: string[];
    purchaseHistory?: string[];
    preferences?: UserPreferences;
}

export interface UserPreferences {
    favoriteCategories?: string[];
    favoriteBrands?: string[];
    priceRange?: { min: number; max: number };
    shippingPreference?: 'fastest' | 'cheapest' | 'pickup';
}

export interface SearchResponse {
    query: string;
    correctedQuery?: string;
    totalResults: number;
    searchTime: number;
    results: SearchResults;
    facets: SearchFacets;
    suggestions: SearchSuggestion[];
    pagination: SearchPagination;
    analytics?: SearchAnalytics;
    relatedSearches?: string[];
    noResultsRecommendations?: NoResultsRecommendation[];
}

export interface SearchResults {
    products: ProductSearchResult[];
    stores: StoreSearchResult[];
    categories: CategorySearchResult[];
    brands: BrandSearchResult[];
    services: ServiceSearchResult[];
    content: ContentSearchResult[];
}

export interface ProductSearchResult {
    id: string;
    name: string;
    description: string;
    brand: string;
    price: number;
    originalPrice?: number;
    isOnSale: boolean;
    discountPercentage?: number;
    image: string;
    images: string[];
    rating: number;
    reviewCount: number;
    availability: {
        inStock: boolean;
        quantity?: number;
        backorderAllowed: boolean;
    };
    shipping: {
        freeShipping: boolean;
        estimatedDays: string;
        sameDayAvailable: boolean;
        pickupAvailable: boolean;
    };
    seller: {
        name: string;
        isWalmart: boolean;
        rating?: number;
    };
    badges: ProductBadge[];
    relevanceScore: number;
    searchHighlights: SearchHighlight[];
}

export interface ProductBadge {
    type: 'bestseller' | 'new' | 'sale' | 'walmart_plus' | 'trending' | 'exclusive';
    label: string;
    color: string;
}

export interface SearchHighlight {
    field: string;
    fragments: string[];
}

export interface StoreSearchResult {
    id: string;
    name: string;
    type: 'supercenter' | 'neighborhood' | 'express';
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    phone: string;
    distance: number;
    isOpen: boolean;
    hours: {
        today: string;
        tomorrow: string;
    };
    services: string[];
    rating: number;
    reviewCount: number;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    image?: string;
    specialOffers?: string[];
}

export interface CategorySearchResult {
    id: string;
    name: string;
    description: string;
    level: number;
    parentId?: string;
    productCount: number;
    image?: string;
    isPopular: boolean;
    relevanceScore: number;
}

export interface BrandSearchResult {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    productCount: number;
    averageRating: number;
    isPopular: boolean;
    categories: string[];
}

export interface ServiceSearchResult {
    id: string;
    name: string;
    description: string;
    category: string;
    availability: {
        isAvailable: boolean;
        estimatedWait?: number;
        nextAvailable?: string;
    };
    location?: {
        storeId: string;
        storeName: string;
        distance: number;
    };
    pricing?: {
        startingPrice: number;
        currency: string;
    };
    rating: number;
    reviewCount: number;
}

export interface ContentSearchResult {
    id: string;
    type: 'article' | 'faq' | 'guide' | 'video';
    title: string;
    description: string;
    url: string;
    thumbnailUrl?: string;
    publishedAt: string;
    author?: string;
    tags: string[];
    relevanceScore: number;
}

export interface SearchFacets {
    categories: FacetGroup;
    brands: FacetGroup;
    priceRanges: FacetGroup;
    ratings: FacetGroup;
    availability: FacetGroup;
    seller: FacetGroup;
    shipping: FacetGroup;
    storeTypes?: FacetGroup;
    distance?: FacetGroup;
    services?: FacetGroup;
}

export interface FacetGroup {
    name: string;
    displayName: string;
    type: 'checkbox' | 'radio' | 'range' | 'dropdown';
    values: FacetValue[];
    hasMore: boolean;
    showCount: number;
}

export interface FacetValue {
    value: string;
    displayName: string;
    count: number;
    isSelected: boolean;
    isDisabled: boolean;
    children?: FacetValue[];
}

export interface SearchSuggestion {
    text: string;
    type: 'query' | 'product' | 'category' | 'brand' | 'autocomplete';
    highlightedText?: string;
    resultCount?: number;
    image?: string;
    category?: string;
    price?: number;
    isPopular?: boolean;
    isTrending?: boolean;
}

export interface SearchPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface SearchAnalytics {
    searchId: string;
    timestamp: string;
    userAgent: string;
    location?: UserLocation;
    resultInteractions: ResultInteraction[];
    searchSessionId: string;
    abTestVariant?: string;
}

export interface ResultInteraction {
    resultId: string;
    resultType: 'product' | 'store' | 'category' | 'brand';
    action: 'view' | 'click' | 'add_to_cart' | 'wishlist' | 'share';
    position: number;
    timestamp: string;
}

export interface NoResultsRecommendation {
    type: 'category' | 'brand' | 'related_query' | 'popular_product';
    title: string;
    items: RecommendationItem[];
}

export interface RecommendationItem {
    id: string;
    name: string;
    image?: string;
    description?: string;
    url: string;
}

// Autocomplete Types
export interface AutocompleteRequest {
    query: string;
    limit?: number;
    types?: ('query' | 'product' | 'category' | 'brand')[];
    includePopular?: boolean;
    includeTrending?: boolean;
    userLocation?: UserLocation;
}

export interface AutocompleteResponse {
    suggestions: AutocompleteSuggestion[];
    popularSearches?: string[];
    trendingSearches?: string[];
    recentSearches?: string[];
}

export interface AutocompleteSuggestion {
    text: string;
    type: 'query' | 'product' | 'category' | 'brand';
    displayText: string;
    highlightedText?: string;
    image?: string;
    subtitle?: string;
    resultCount?: number;
    isPopular?: boolean;
    isTrending?: boolean;
    matchScore: number;
}

// Search History Types
export interface SearchHistoryEntry {
    id: string;
    query: string;
    timestamp: string;
    resultCount: number;
    clickedResults: string[];
    filters?: SearchFilters;
    location?: UserLocation;
}

// Visual Search Types
export interface VisualSearchRequest {
    image: File | string; // File upload or base64 string
    cropBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    filters?: SearchFilters;
    limit?: number;
}

export interface VisualSearchResponse {
    products: ProductSearchResult[];
    suggestions: string[];
    confidence: number;
    detectedObjects: DetectedObject[];
    similarImages: string[];
}

export interface DetectedObject {
    category: string;
    confidence: number;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    attributes: Record<string, string>;
}

// Voice Search Types
export interface VoiceSearchRequest {
    audioData: Blob;
    language?: string;
    filters?: SearchFilters;
}

export interface VoiceSearchResponse {
    transcription: string;
    confidence: number;
    searchResults: SearchResponse;
    suggestedQueries?: string[];
}

// Search Analytics Types
export interface SearchAnalyticsRequest {
    searchId: string;
    events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
    type: 'result_click' | 'add_to_cart' | 'purchase' | 'filter_applied' | 'sort_changed';
    resultId?: string;
    resultType?: string;
    position?: number;
    value?: number;
    metadata?: Record<string, any>;
    timestamp: string;
}

// Search API Service
export const searchAPI = {
    // Main Search
    search: async (params: SearchRequest): Promise<SearchResponse> => {
        const response = await apiClient.post<SearchResponse>(API.ENDPOINTS.SEARCH.MAIN, params);
        return response.data;
    },

    // Autocomplete
    autocomplete: async (params: AutocompleteRequest): Promise<AutocompleteResponse> => {
        const response = await apiClient.get<AutocompleteResponse>('/search/autocomplete', {
            params,
        });
        return response.data;
    },

    // Search Suggestions
    getSuggestions: async (
        query: string,
        limit: number = 10
    ): Promise<SearchSuggestion[]> => {
        const response = await apiClient.get<SearchSuggestion[]>('/search/suggestions', {
            params: { query, limit },
        });
        return response.data;
    },

    // Visual Search
    visualSearch: async (params: VisualSearchRequest): Promise<VisualSearchResponse> => {
        const formData = new FormData();

        if (params.image instanceof File) {
            formData.append('image', params.image);
        } else {
            formData.append('imageData', params.image);
        }

        if (params.cropBox) {
            formData.append('cropBox', JSON.stringify(params.cropBox));
        }

        if (params.filters) {
            formData.append('filters', JSON.stringify(params.filters));
        }

        if (params.limit) {
            formData.append('limit', params.limit.toString());
        }

        const response = await apiClient.post<VisualSearchResponse>('/search/visual', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Voice Search
    voiceSearch: async (params: VoiceSearchRequest): Promise<VoiceSearchResponse> => {
        const formData = new FormData();
        formData.append('audio', params.audioData);

        if (params.language) {
            formData.append('language', params.language);
        }

        if (params.filters) {
            formData.append('filters', JSON.stringify(params.filters));
        }

        const response = await apiClient.post<VoiceSearchResponse>('/search/voice', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Search History
    getSearchHistory: async (limit: number = 50): Promise<SearchHistoryEntry[]> => {
        const response = await apiClient.get<SearchHistoryEntry[]>('/search/history', {
            params: { limit },
        });
        return response.data;
    },

    saveSearchToHistory: async (searchData: Omit<SearchHistoryEntry, 'id'>): Promise<void> => {
        await apiClient.post('/search/history', searchData);
    },

    clearSearchHistory: async (): Promise<void> => {
        await apiClient.delete('/search/history');
    },

    deleteSearchHistoryEntry: async (entryId: string): Promise<void> => {
        await apiClient.delete(`/search/history/${entryId}`);
    },

    // Popular & Trending
    getPopularSearches: async (
        category?: string,
        location?: UserLocation,
        limit: number = 20
    ): Promise<string[]> => {
        const response = await apiClient.get<string[]>('/search/popular', {
            params: { category, ...location, limit },
        });
        return response.data;
    },

    getTrendingSearches: async (
        timeframe: 'hour' | 'day' | 'week' = 'day',
        category?: string,
        limit: number = 20
    ): Promise<TrendingSearch[]> => {
        const response = await apiClient.get<TrendingSearch[]>('/search/trending', {
            params: { timeframe, category, limit },
        });
        return response.data;
    },

    // Search Analytics
    trackSearchEvent: async (params: SearchAnalyticsRequest): Promise<void> => {
        await apiClient.post('/search/analytics', params);
    },

    trackResultInteraction: async (
        searchId: string,
        resultId: string,
        action: string,
        position: number,
        metadata?: Record<string, any>
    ): Promise<void> => {
        await apiClient.post('/search/track-interaction', {
            searchId,
            resultId,
            action,
            position,
            metadata,
            timestamp: new Date().toISOString(),
        });
    },

    // Advanced Search
    advancedSearch: async (params: AdvancedSearchRequest): Promise<SearchResponse> => {
        const response = await apiClient.post<SearchResponse>('/search/advanced', params);
        return response.data;
    },

    // Search within Results
    searchWithinResults: async (
        originalSearchId: string,
        refinementQuery: string,
        additionalFilters?: SearchFilters
    ): Promise<SearchResponse> => {
        const response = await apiClient.post<SearchResponse>('/search/refine', {
            originalSearchId,
            refinementQuery,
            additionalFilters,
        });
        return response.data;
    },

    // Saved Searches
    saveSearch: async (
        query: string,
        filters?: SearchFilters,
        name?: string
    ): Promise<SavedSearch> => {
        const response = await apiClient.post<SavedSearch>('/search/saved', {
            query,
            filters,
            name,
        });
        return response.data;
    },

    getSavedSearches: async (): Promise<SavedSearch[]> => {
        const response = await apiClient.get<SavedSearch[]>('/search/saved');
        return response.data;
    },

    deleteSavedSearch: async (searchId: string): Promise<void> => {
        await apiClient.delete(`/search/saved/${searchId}`);
    },

    runSavedSearch: async (searchId: string): Promise<SearchResponse> => {
        const response = await apiClient.post<SearchResponse>(`/search/saved/${searchId}/run`);
        return response.data;
    },

    // Search Alerts
    createSearchAlert: async (
        query: string,
        filters?: SearchFilters,
        alertSettings?: SearchAlertSettings
    ): Promise<SearchAlert> => {
        const response = await apiClient.post<SearchAlert>('/search/alerts', {
            query,
            filters,
            alertSettings,
        });
        return response.data;
    },

    getSearchAlerts: async (): Promise<SearchAlert[]> => {
        const response = await apiClient.get<SearchAlert[]>('/search/alerts');
        return response.data;
    },

    updateSearchAlert: async (
        alertId: string,
        updates: Partial<SearchAlert>
    ): Promise<SearchAlert> => {
        const response = await apiClient.put<SearchAlert>(`/search/alerts/${alertId}`, updates);
        return response.data;
    },

    deleteSearchAlert: async (alertId: string): Promise<void> => {
        await apiClient.delete(`/search/alerts/${alertId}`);
    },

    // Barcode Search
    barcodeSearch: async (barcode: string): Promise<ProductSearchResult[]> => {
        const response = await apiClient.get<ProductSearchResult[]>('/search/barcode', {
            params: { barcode },
        });
        return response.data;
    },

    // Search Export
    exportSearchResults: async (
        searchParams: SearchRequest,
        format: 'csv' | 'json' | 'pdf'
    ): Promise<{ downloadUrl: string }> => {
        const response = await apiClient.post('/search/export', {
            searchParams,
            format,
        });
        return response.data;
    },
};

// Additional Types
export interface TrendingSearch {
    query: string;
    rank: number;
    changeFromPrevious: number;
    category?: string;
    resultCount: number;
}

export interface AdvancedSearchRequest extends SearchRequest {
    exactPhrase?: string;
    excludeWords?: string[];
    anyOfWords?: string[];
    searchInTitle?: boolean;
    searchInDescription?: boolean;
    lastModified?: {
        period: 'day' | 'week' | 'month' | 'year';
        count: number;
    };
}

export interface SavedSearch {
    id: string;
    name: string;
    query: string;
    filters?: SearchFilters;
    createdAt: string;
    lastRun?: string;
    isActive: boolean;
    resultCount?: number;
}

export interface SearchAlert {
    id: string;
    name: string;
    query: string;
    filters?: SearchFilters;
    settings: SearchAlertSettings;
    isActive: boolean;
    createdAt: string;
    lastTriggered?: string;
    triggerCount: number;
}

export interface SearchAlertSettings {
    frequency: 'immediate' | 'daily' | 'weekly';
    maxResults?: number;
    priceThreshold?: {
        type: 'below' | 'above' | 'change';
        value: number;
    };
    availabilityChange?: boolean;
    newProducts?: boolean;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}

export default searchAPI;