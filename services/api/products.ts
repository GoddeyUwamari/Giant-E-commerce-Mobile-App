import { apiClient } from './client';
import { API } from '@/config/constants';

// Types
export interface Product {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;
    brand: string;
    manufacturer?: string;
    model?: string;
    sku: string;
    upc?: string;
    gtin?: string;
    mpn?: string; // Manufacturer Part Number
    category: ProductCategory;
    subcategory?: string;
    keywords: string[];
    tags: string[];

    // Pricing
    pricing: ProductPricing;

    // Media
    images: ProductImage[];
    videos: ProductVideo[];
    documents: ProductDocument[];

    // Product Details
    specifications: ProductSpecification[];
    features: string[];
    dimensions?: ProductDimensions;
    weight?: ProductWeight;
    colors?: string[];
    materials?: string[];

    // Variants
    variants: ProductVariant[];
    variantTypes: VariantType[];

    // Availability
    availability: ProductAvailability;

    // Ratings & Reviews
    rating: ProductRating;

    // Seller Information
    seller: ProductSeller;

    // Shipping & Fulfillment
    shipping: ProductShipping;

    // SEO & Metadata
    seo: ProductSEO;

    // Flags & Status
    flags: ProductFlags;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;

    // Additional Data
    crossSells?: string[]; // Product IDs
    upSells?: string[]; // Product IDs
    accessories?: string[]; // Product IDs
    replacementParts?: string[]; // Product IDs
    compatibleProducts?: string[]; // Product IDs

    // Analytics
    analytics: ProductAnalytics;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    level: number;
    path: string[];
    image?: string;
    description?: string;
    seo?: CategorySEO;
}

export interface CategorySEO {
    title?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
}

export interface ProductPricing {
    price: number;
    originalPrice?: number;
    salePrice?: number;
    msrp?: number; // Manufacturer Suggested Retail Price
    cost?: number; // Internal cost
    currency: string;
    pricePerUnit?: {
        value: number;
        unit: string; // per oz, per lb, etc.
    };
    priceBreaks?: PriceBreak[];
    isOnSale: boolean;
    saleStartDate?: string;
    saleEndDate?: string;
    discountPercentage?: number;
    priceHistory?: PriceHistoryEntry[];
}

export interface PriceBreak {
    quantity: number;
    price: number;
    discount: number;
}

export interface PriceHistoryEntry {
    price: number;
    date: string;
    reason?: string;
}

export interface ProductImage {
    id: string;
    url: string;
    altText: string;
    title?: string;
    type: 'primary' | 'gallery' | 'variant' | 'lifestyle' | 'detail' | 'size_chart';
    sortOrder: number;
    variantId?: string;
    dimensions?: {
        width: number;
        height: number;
    };
}

export interface ProductVideo {
    id: string;
    url: string;
    thumbnailUrl: string;
    title: string;
    description?: string;
    duration: number;
    type: 'product_demo' | 'unboxing' | 'review' | 'how_to_use';
    sortOrder: number;
}

export interface ProductDocument {
    id: string;
    name: string;
    url: string;
    type: 'manual' | 'warranty' | 'specification' | 'safety' | 'installation';
    fileSize: number;
    mimeType: string;
}

export interface ProductSpecification {
    name: string;
    value: string;
    unit?: string;
    category: string;
    displayOrder: number;
    isKeyFeature: boolean;
}

export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm' | 'mm';
}

export interface ProductWeight {
    value: number;
    unit: 'lb' | 'kg' | 'g' | 'oz';
}

export interface ProductVariant {
    id: string;
    sku: string;
    name: string;
    attributes: Record<string, string>; // size: "Large", color: "Red"
    pricing?: ProductPricing;
    availability?: ProductAvailability;
    images?: string[]; // Image IDs
    isDefault?: boolean;
}

export interface VariantType {
    name: string; // "Size", "Color"
    type: 'dropdown' | 'swatch' | 'button' | 'radio';
    required: boolean;
    displayOrder: number;
    options: VariantOption[];
}

export interface VariantOption {
    value: string;
    displayName: string;
    image?: string;
    color?: string; // For color swatches
    priceAdjustment?: number;
    isAvailable: boolean;
    sortOrder: number;
}

export interface ProductAvailability {
    inStock: boolean;
    stockQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    minOrderQuantity: number;
    maxOrderQuantity: number;
    stockThreshold: number; // Low stock warning
    backorderAllowed: boolean;
    backorderLimit?: number;
    expectedRestockDate?: string;
    discontinued: boolean;
    lastStockUpdate: string;
    storeAvailability?: StoreStock[];
}

export interface StoreStock {
    storeId: string;
    storeName: string;
    quantity: number;
    isAvailable: boolean;
    lastUpdated: string;
}

export interface ProductRating {
    average: number;
    count: number;
    distribution: RatingDistribution;
    breakdown: RatingBreakdown;
    recentTrend: 'up' | 'down' | 'stable';
}

export interface RatingDistribution {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

export interface RatingBreakdown {
    verified: number; // Verified purchase reviews
    photos: number; // Reviews with photos
    video: number; // Reviews with videos
    recent: number; // Reviews in last 30 days
}

export interface ProductSeller {
    id: string;
    name: string;
    type: 'walmart' | 'third_party';
    isVerified: boolean;
    rating?: number;
    reviewCount?: number;
    businessInfo?: {
        businessName: string;
        contactEmail: string;
        contactPhone: string;
        address?: string;
        website?: string;
    };
    policies?: {
        returns: string;
        shipping: string;
        warranty: string;
    };
    fulfillmentMethods: ('walmart' | 'seller')[];
}

export interface ProductShipping {
    freeShipping: boolean;
    freeShippingThreshold?: number;
    weight: number;
    weightUnit: 'lb' | 'kg';
    dimensions: ProductDimensions;
    shippingClass?: string;
    restrictions?: ShippingRestriction[];
    estimatedDays: {
        min: number;
        max: number;
    };
    expeditedAvailable: boolean;
    overnightAvailable: boolean;
    sameDayAvailable: boolean;
    pickupAvailable: boolean;
    deliveryOptions: DeliveryOption[];
}

export interface ShippingRestriction {
    type: 'location' | 'method' | 'carrier';
    description: string;
    restrictedTo?: string[];
    reason?: string;
}

export interface DeliveryOption {
    type: 'standard' | 'expedited' | 'overnight' | 'same_day' | 'pickup';
    name: string;
    cost: number;
    estimatedDays: string;
    cutoffTime?: string;
    isAvailable: boolean;
}

export interface ProductSEO {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    structuredData?: Record<string, any>;
    slug: string;
}

export interface ProductFlags {
    isActive: boolean;
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewArrival: boolean;
    isTrending: boolean;
    isOnSale: boolean;
    isLimitedEdition: boolean;
    isExclusive: boolean;
    isSponsored: boolean;
    requiresAge: boolean;
    ageLimit?: number;
    isHazardous: boolean;
    isPrescription: boolean;
    isRestricted: boolean;
    isGiftEligible: boolean;
    isSubscriptionEligible: boolean;
}

export interface ProductAnalytics {
    views: number;
    viewsToday: number;
    sales: number;
    salesThisMonth: number;
    conversionRate: number;
    bounceRate: number;
    averageTimeOnPage: number;
    wishlistAdds: number;
    cartAdds: number;
    cartAbandonments: number;
    searchRanking?: Record<string, number>; // keyword -> position
}

// Search & Filter Types
export interface ProductSearchRequest {
    query?: string;
    categoryId?: string;
    filters?: ProductFilters;
    sort?: ProductSort;
    facets?: string[];
    page?: number;
    limit?: number;
    includeOutOfStock?: boolean;
    userLocation?: {
        latitude: number;
        longitude: number;
    };
}

export interface ProductFilters {
    brand?: string[];
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    inStock?: boolean;
    onSale?: boolean;
    freeShipping?: boolean;
    seller?: 'walmart' | 'third_party' | 'all';
    tags?: string[];
    specifications?: Record<string, string[]>;
    colors?: string[];
    sizes?: string[];
    availability?: ('in_stock' | 'out_of_stock' | 'backorder')[];
    fulfillment?: ('delivery' | 'pickup' | 'same_day')[];
}

export interface ProductSort {
    field: 'relevance' | 'price' | 'rating' | 'newest' | 'bestseller' | 'name' | 'discount';
    direction: 'asc' | 'desc';
}

export interface ProductSearchResponse {
    products: Product[];
    facets: SearchFacets;
    pagination: SearchPagination;
    suggestions?: SearchSuggestion[];
    correctedQuery?: string;
    totalResults: number;
    searchTime: number;
    appliedFilters: ProductFilters;
}

export interface SearchFacets {
    categories: FacetGroup;
    brands: FacetGroup;
    priceRanges: FacetGroup;
    ratings: FacetGroup;
    colors: FacetGroup;
    sizes: FacetGroup;
    features: FacetGroup;
    specifications: Record<string, FacetGroup>;
}

export interface FacetGroup {
    name: string;
    values: FacetValue[];
}

export interface FacetValue {
    value: string;
    displayName: string;
    count: number;
    isSelected: boolean;
}

export interface SearchPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface SearchSuggestion {
    text: string;
    type: 'query' | 'product' | 'category' | 'brand';
    highlightedText?: string;
}

// Review Types
export interface ProductReview {
    id: string;
    userId?: string;
    userName: string;
    userAvatar?: string;
    isVerifiedPurchase: boolean;
    rating: number;
    title: string;
    review: string;
    pros?: string[];
    cons?: string[];
    wouldRecommend: boolean;
    photos: ReviewPhoto[];
    videos: ReviewVideo[];
    helpfulVotes: number;
    unhelpfulVotes: number;
    replies: ReviewReply[];
    createdAt: string;
    updatedAt: string;
    variantPurchased?: Record<string, string>;
    purchaseDate?: string;
    badges: ReviewBadge[];
}

export interface ReviewPhoto {
    id: string;
    url: string;
    thumbnailUrl: string;
    caption?: string;
}

export interface ReviewVideo {
    id: string;
    url: string;
    thumbnailUrl: string;
    caption?: string;
    duration: number;
}

export interface ReviewReply {
    id: string;
    authorName: string;
    authorType: 'seller' | 'walmart' | 'customer';
    content: string;
    createdAt: string;
}

export interface ReviewBadge {
    type: 'verified_purchase' | 'top_reviewer' | 'vine_customer' | 'helpful_reviewer';
    label: string;
    description: string;
}

// Recommendation Types
export interface ProductRecommendations {
    personalizedForYou: Product[];
    frequentlyBoughtTogether: Product[];
    customersWhoViewedAlsoBought: Product[];
    similarProducts: Product[];
    recentlyViewed: Product[];
    trending: Product[];
    basedOnBrowsingHistory: Product[];
    completeLook: Product[];
    alternatives: Product[];
}

// Request Types
export interface CreateReviewRequest {
    productId: string;
    rating: number;
    title: string;
    review: string;
    pros?: string[];
    cons?: string[];
    wouldRecommend: boolean;
    photos?: File[];
    variantPurchased?: Record<string, string>;
}

export interface ReviewListRequest {
    productId: string;
    page?: number;
    limit?: number;
    rating?: number;
    sort?: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low';
    verified?: boolean;
    withPhotos?: boolean;
}

export interface CompareProductsRequest {
    productIds: string[];
    compareFields?: string[];
}

export interface PriceAlertRequest {
    productId: string;
    targetPrice: number;
    email?: string;
    phone?: string;
}

// Products API Service
export const productsAPI = {
    // Product Search & Discovery
    search: async (params: ProductSearchRequest): Promise<ProductSearchResponse> => {
        const response = await apiClient.post<ProductSearchResponse>(
            API.ENDPOINTS.PRODUCTS.SEARCH,
            params
        );
        return response.data;
    },

    getProduct: async (productId: string): Promise<Product> => {
        const response = await apiClient.get<Product>(
            API.ENDPOINTS.PRODUCTS.DETAILS.replace(':id', productId)
        );
        return response.data;
    },

    getProductBySlug: async (slug: string): Promise<Product> => {
        const response = await apiClient.get<Product>(`/products/slug/${slug}`);
        return response.data;
    },

    getProductsBatch: async (productIds: string[]): Promise<Product[]> => {
        const response = await apiClient.post<Product[]>('/products/batch', { productIds });
        return response.data;
    },

    // Categories
    getCategories: async (): Promise<ProductCategory[]> => {
        const response = await apiClient.get<ProductCategory[]>(API.ENDPOINTS.PRODUCTS.CATEGORIES);
        return response.data;
    },

    getCategory: async (categoryId: string): Promise<ProductCategory> => {
        const response = await apiClient.get<ProductCategory>(`/products/categories/${categoryId}`);
        return response.data;
    },

    getCategoryProducts: async (
        categoryId: string,
        params?: Omit<ProductSearchRequest, 'categoryId'>
    ): Promise<ProductSearchResponse> => {
        const response = await apiClient.get<ProductSearchResponse>(
            `/products/categories/${categoryId}/products`,
            { params }
        );
        return response.data;
    },

    // Product Variants
    getProductVariants: async (productId: string): Promise<ProductVariant[]> => {
        const response = await apiClient.get<ProductVariant[]>(`/products/${productId}/variants`);
        return response.data;
    },

    getVariantDetails: async (productId: string, variantId: string): Promise<ProductVariant> => {
        const response = await apiClient.get<ProductVariant>(
            `/products/${productId}/variants/${variantId}`
        );
        return response.data;
    },

    // Product Availability
    checkAvailability: async (
        productId: string,
        variantId?: string,
        zipCode?: string
    ): Promise<ProductAvailability> => {
        const response = await apiClient.get<ProductAvailability>(
            `/products/${productId}/availability`,
            { params: { variantId, zipCode } }
        );
        return response.data;
    },

    getStoreAvailability: async (
        productId: string,
        coordinates: { latitude: number; longitude: number },
        radius: number = 25
    ): Promise<StoreStock[]> => {
        const response = await apiClient.get<StoreStock[]>(
            `/products/${productId}/store-availability`,
            { params: { ...coordinates, radius } }
        );
        return response.data;
    },

    // Reviews
    getReviews: async (params: ReviewListRequest): Promise<{
        reviews: ProductReview[];
        pagination: SearchPagination;
        summary: ProductRating;
    }> => {
        const response = await apiClient.get(
            API.ENDPOINTS.PRODUCTS.REVIEWS.replace(':id', params.productId),
            { params }
        );
        return response.data;
    },

    createReview: async (data: CreateReviewRequest): Promise<ProductReview> => {
        const formData = new FormData();

        // Add text fields
        Object.keys(data).forEach(key => {
            if (key !== 'photos' && data[key as keyof CreateReviewRequest] !== undefined) {
                formData.append(key, JSON.stringify(data[key as keyof CreateReviewRequest]));
            }
        });

        // Add photos
        if (data.photos) {
            data.photos.forEach((photo, index) => {
                formData.append(`photos[${index}]`, photo);
            });
        }

        const response = await apiClient.post<ProductReview>('/products/reviews', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    voteOnReview: async (reviewId: string, vote: 'helpful' | 'unhelpful'): Promise<void> => {
        await apiClient.post(`/products/reviews/${reviewId}/vote`, { vote });
    },

    reportReview: async (reviewId: string, reason: string): Promise<void> => {
        await apiClient.post(`/products/reviews/${reviewId}/report`, { reason });
    },

    // Recommendations
    getRecommendations: async (
        productId?: string,
        userId?: string,
        context?: 'product_page' | 'cart' | 'checkout' | 'home'
    ): Promise<ProductRecommendations> => {
        const response = await apiClient.get<ProductRecommendations>(
            API.ENDPOINTS.PRODUCTS.RECOMMENDATIONS,
            { params: { productId, userId, context } }
        );
        return response.data;
    },

    getTrendingProducts: async (
        categoryId?: string,
        limit: number = 20
    ): Promise<Product[]> => {
        const response = await apiClient.get<Product[]>(API.ENDPOINTS.PRODUCTS.TRENDING, {
            params: { categoryId, limit },
        });
        return response.data;
    },

    // Product Comparison
    compareProducts: async (params: CompareProductsRequest): Promise<{
        products: Product[];
        comparison: Record<string, any>;
    }> => {
        const response = await apiClient.post('/products/compare', params);
        return response.data;
    },

    // Price Tracking
    getPriceHistory: async (productId: string, days: number = 30): Promise<PriceHistoryEntry[]> => {
        const response = await apiClient.get<PriceHistoryEntry[]>(
            `/products/${productId}/price-history`,
            { params: { days } }
        );
        return response.data;
    },

    createPriceAlert: async (data: PriceAlertRequest): Promise<{ alertId: string }> => {
        const response = await apiClient.post('/products/price-alerts', data);
        return response.data;
    },

    deletePriceAlert: async (alertId: string): Promise<void> => {
        await apiClient.delete(`/products/price-alerts/${alertId}`);
    },

    // Product Analytics
    trackProductView: async (productId: string, context?: Record<string, any>): Promise<void> => {
        await apiClient.post('/products/track-view', { productId, context });
    },

    getViewingHistory: async (limit: number = 50): Promise<Product[]> => {
        const response = await apiClient.get<Product[]>('/products/viewing-history', {
            params: { limit },
        });
        return response.data;
    },

    // Search Suggestions
    getSearchSuggestions: async (query: string, limit: number = 10): Promise<SearchSuggestion[]> => {
        const response = await apiClient.get<SearchSuggestion[]>('/products/search-suggestions', {
            params: { query, limit },
        });
        return response.data;
    },

    // Product Q&A
    getQuestions: async (productId: string, page: number = 1, limit: number = 20): Promise<{
        questions: ProductQuestion[];
        pagination: SearchPagination;
    }> => {
        const response = await apiClient.get(`/products/${productId}/questions`, {
            params: { page, limit },
        });
        return response.data;
    },

    askQuestion: async (productId: string, question: string): Promise<ProductQuestion> => {
        const response = await apiClient.post<ProductQuestion>(`/products/${productId}/questions`, {
            question,
        });
        return response.data;
    },

    answerQuestion: async (questionId: string, answer: string): Promise<QuestionAnswer> => {
        const response = await apiClient.post<QuestionAnswer>(
            `/products/questions/${questionId}/answers`,
            { answer }
        );
        return response.data;
    },

    voteOnAnswer: async (answerId: string, vote: 'helpful' | 'unhelpful'): Promise<void> => {
        await apiClient.post(`/products/answers/${answerId}/vote`, { vote });
    },
};

// Additional Types
export interface ProductQuestion {
    id: string;
    productId: string;
    question: string;
    userName: string;
    createdAt: string;
    answers: QuestionAnswer[];
    helpfulVotes: number;
}

export interface QuestionAnswer {
    id: string;
    answer: string;
    userName: string;
    userType: 'customer' | 'seller' | 'walmart';
    createdAt: string;
    helpfulVotes: number;
    unhelpfulVotes: number;
    isVerified: boolean;
}

export default productsAPI;