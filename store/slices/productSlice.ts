import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import asyncStorage, { recentSearches, STORAGE_KEYS } from '../storage/asyncStorage';

// Product availability status
export type ProductAvailability = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

// Product condition
export type ProductCondition = 'new' | 'refurbished' | 'open_box' | 'used';

// Product size guide
export interface SizeGuide {
    type: 'clothing' | 'shoes' | 'general';
    sizes: Array<{
        size: string;
        measurements: Record<string, string>;
    }>;
    guide: string; // URL or text guide
}

// Product variant
export interface ProductVariant {
    id: string;
    name: string;
    type: 'size' | 'color' | 'style' | 'flavor' | 'model';
    value: string;
    price?: number;
    priceModifier?: number;
    sku: string;
    availability: ProductAvailability;
    stock?: number;
    image?: string;
    isDefault?: boolean;
}

// Product specification
export interface ProductSpecification {
    name: string;
    value: string;
    category: 'general' | 'technical' | 'physical' | 'warranty';
    displayOrder: number;
}

// Product review
export interface ProductReview {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    content: string;
    pros?: string[];
    cons?: string[];
    verified: boolean;
    helpful: number;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

// Product rating breakdown
export interface RatingBreakdown {
    average: number;
    total: number;
    distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

// Product pricing
export interface ProductPricing {
    current: number;
    original?: number;
    sale?: number;
    msrp?: number;
    compareAt?: number;
    currency: string;
    discountPercentage?: number;
    priceHistory?: Array<{
        price: number;
        date: string;
    }>;
    bulkPricing?: Array<{
        quantity: number;
        price: number;
        savings: number;
    }>;
}

// Product shipping info
export interface ShippingInfo {
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    freeShipping: boolean;
    freeShippingThreshold?: number;
    shippingClass: 'standard' | 'oversized' | 'hazmat' | 'refrigerated';
    restrictions?: string[];
    estimatedDelivery?: {
        min: number;
        max: number;
        unit: 'hours' | 'days' | 'weeks';
    };
}

// Product warranty
export interface ProductWarranty {
    type: 'manufacturer' | 'extended' | 'store';
    duration: number;
    unit: 'days' | 'months' | 'years';
    description: string;
    coverage: string[];
    terms?: string;
}

// Product nutrition (for food items)
export interface NutritionInfo {
    servingSize: string;
    servingsPerContainer?: number;
    calories: number;
    nutrients: Array<{
        name: string;
        amount: string;
        dailyValue?: string;
    }>;
    allergens: string[];
    ingredients: string[];
    dietaryInfo?: string[];
}

// Main product interface
export interface Product {
    id: string;
    name: string;
    brand: string;
    description: string;
    shortDescription?: string;
    category: string;
    subcategory?: string;
    department: string;
    sku: string;
    upc?: string;
    gtin?: string;
    mpn?: string; // Manufacturer Part Number

    // Pricing
    pricing: ProductPricing;

    // Availability
    availability: ProductAvailability;
    stock: number;
    stockLocation?: string;
    restockDate?: string;
    condition: ProductCondition;

    // Media
    images: string[];
    videos?: Array<{
        url: string;
        type: 'product_demo' | 'unboxing' | 'review' | 'tutorial';
        thumbnail?: string;
        duration?: number;
    }>;

    // Variants
    variants: ProductVariant[];
    selectedVariant?: string;
    variantGroups?: Array<{
        name: string;
        type: string;
        variants: string[];
    }>;

    // Product details
    specifications: ProductSpecification[];
    features: string[];
    benefits?: string[];
    sizeGuide?: SizeGuide;
    careInstructions?: string[];

    // Reviews and ratings
    rating: RatingBreakdown;
    reviews: ProductReview[];
    reviewsSummary?: {
        commonPros: string[];
        commonCons: string[];
        frequentlyMentioned: string[];
    };

    // Shipping and fulfillment
    shipping: ShippingInfo;
    availableForPickup: boolean;
    availableForDelivery: boolean;
    availableForShipping: boolean;

    // Additional info
    warranty?: ProductWarranty;
    nutrition?: NutritionInfo;
    ageRestriction?: number;
    prescription?: boolean;
    hazmat?: boolean;

    // SEO and metadata
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    tags: string[];

    // Timestamps
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;

    // Analytics
    viewCount?: number;
    purchaseCount?: number;
    wishlistCount?: number;

    // Related products
    relatedProducts?: string[];
    crossSellProducts?: string[];
    upSellProducts?: string[];
    accessories?: string[];

    // Store specific
    storeAvailability?: Record<string, {
        available: boolean;
        stock: number;
        price?: number;
    }>;
}

// Search filters
export interface SearchFilters {
    category?: string[];
    brand?: string[];
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    availability?: ProductAvailability[];
    condition?: ProductCondition[];
    freeShipping?: boolean;
    onSale?: boolean;
    inStock?: boolean;
    department?: string[];
    features?: string[];
    size?: string[];
    color?: string[];
    tags?: string[];
}

// Sort options
export type SortOption =
    | 'relevance'
    | 'price_low_to_high'
    | 'price_high_to_low'
    | 'rating'
    | 'reviews'
    | 'newest'
    | 'best_seller'
    | 'name_a_to_z'
    | 'name_z_to_a';

// Search result
export interface SearchResult {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: {
        applied: SearchFilters;
        available: {
            categories: Array<{ name: string; count: number }>;
            brands: Array<{ name: string; count: number }>;
            priceRange: { min: number; max: number };
            departments: Array<{ name: string; count: number }>;
            features: Array<{ name: string; count: number }>;
        };
    };
    suggestions?: string[];
    correctedQuery?: string;
    facets?: Record<string, Array<{ value: string; count: number }>>;
}

// Product list view type
export type ViewType = 'grid' | 'list' | 'compact';

// Recently viewed product
export interface RecentlyViewedProduct {
    productId: string;
    name: string;
    image: string;
    price: number;
    brand: string;
    viewedAt: string;
}

// Product comparison
export interface ProductComparison {
    id: string;
    products: Product[];
    createdAt: string;
    name?: string;
}

// Wishlist item
export interface WishlistItem {
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    availability: ProductAvailability;
    addedAt: string;
    notifyOnSale?: boolean;
    notifyOnStock?: boolean;
    targetPrice?: number;
}

// Product state interface
export interface ProductState {
    // Current product
    currentProduct: Product | null;
    currentProductLoading: boolean;

    // Search and browse
    searchQuery: string;
    searchResults: SearchResult | null;
    searchLoading: boolean;
    searchHistory: string[];
    popularSearches: string[];
    searchSuggestions: string[];

    // Filters and sorting
    activeFilters: SearchFilters;
    activeSortOption: SortOption;
    viewType: ViewType;

    // Categories and navigation
    categories: Array<{
        id: string;
        name: string;
        slug: string;
        image?: string;
        subcategories?: Array<{
            id: string;
            name: string;
            slug: string;
            productCount?: number;
        }>;
    }>;
    featuredCategories: string[];

    // Recently viewed
    recentlyViewed: RecentlyViewedProduct[];

    // Wishlist
    wishlist: WishlistItem[];

    // Product comparisons
    comparisons: ProductComparison[];
    currentComparison: ProductComparison | null;

    // Recommendations
    recommendedProducts: Product[];
    trendingProducts: Product[];
    dealProducts: Product[];

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Cache
    productCache: Record<string, Product>;
    cacheExpiry: Record<string, number>;

    // Preferences
    preferences: {
        defaultViewType: ViewType;
        defaultSortOption: SortOption;
        priceAlerts: boolean;
        stockAlerts: boolean;
        reviewNotifications: boolean;
    };
}

// Product actions interface
export interface ProductActions {
    // Product operations
    fetchProduct: (productId: string, storeId?: string) => Promise<Product | null>;
    fetchProductBySlug: (slug: string) => Promise<Product | null>;
    refreshProduct: (productId: string) => Promise<void>;

    // Search operations
    searchProducts: (query: string, filters?: SearchFilters, page?: number) => Promise<SearchResult | null>;
    searchWithFilters: (filters: SearchFilters, page?: number) => Promise<SearchResult | null>;
    getSearchSuggestions: (query: string) => Promise<string[]>;
    clearSearch: () => void;

    // Filter operations
    setFilters: (filters: Partial<SearchFilters>) => void;
    clearFilters: () => void;
    setSortOption: (option: SortOption) => void;
    setViewType: (type: ViewType) => void;

    // Recently viewed
    addToRecentlyViewed: (product: Product) => void;
    clearRecentlyViewed: () => void;

    // Wishlist operations
    addToWishlist: (product: Product, options?: { notifyOnSale?: boolean; notifyOnStock?: boolean; targetPrice?: number }) => Promise<boolean>;
    removeFromWishlist: (productId: string) => Promise<boolean>;
    updateWishlistItem: (productId: string, updates: Partial<WishlistItem>) => Promise<boolean>;
    clearWishlist: () => Promise<boolean>;
    checkWishlistStatus: (productId: string) => boolean;

    // Product comparison
    addToComparison: (product: Product) => void;
    removeFromComparison: (productId: string) => void;
    clearComparison: () => void;
    saveComparison: (name?: string) => Promise<string>;
    loadComparison: (comparisonId: string) => Promise<boolean>;
    deleteComparison: (comparisonId: string) => Promise<boolean>;

    // Categories
    fetchCategories: () => Promise<void>;
    fetchCategoryProducts: (categoryId: string, page?: number) => Promise<SearchResult | null>;

    // Recommendations
    fetchRecommendations: (productId?: string, userId?: string) => Promise<void>;
    fetchTrendingProducts: () => Promise<void>;
    fetchDealProducts: () => Promise<void>;

    // Reviews
    fetchProductReviews: (productId: string, page?: number) => Promise<ProductReview[]>;
    submitReview: (productId: string, review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;

    // Variants
    selectVariant: (productId: string, variantId: string) => void;
    getVariantPrice: (productId: string, variantId: string) => number | null;

    // Cache management
    clearCache: () => void;
    preloadProducts: (productIds: string[]) => Promise<void>;

    // Preferences
    updatePreferences: (preferences: Partial<ProductState['preferences']>) => void;

    // Error handling
    setError: (error: string | null) => void;
    clearError: () => void;

    // Utilities
    getProductUrl: (product: Product) => string;
    shareProduct: (product: Product) => Promise<void>;
    reportProduct: (productId: string, reason: string) => Promise<boolean>;
}

// Initial state
const initialState: ProductState = {
    // Current product
    currentProduct: null,
    currentProductLoading: false,

    // Search and browse
    searchQuery: '',
    searchResults: null,
    searchLoading: false,
    searchHistory: [],
    popularSearches: ['iPhone', 'TV', 'Laptop', 'Groceries', 'Clothing'],
    searchSuggestions: [],

    // Filters and sorting
    activeFilters: {},
    activeSortOption: 'relevance',
    viewType: 'grid',

    // Categories
    categories: [],
    featuredCategories: [],

    // Recently viewed
    recentlyViewed: [],

    // Wishlist
    wishlist: [],

    // Product comparisons
    comparisons: [],
    currentComparison: null,

    // Recommendations
    recommendedProducts: [],
    trendingProducts: [],
    dealProducts: [],

    // Loading states
    isLoading: false,
    error: null,

    // Cache
    productCache: {},
    cacheExpiry: {},

    // Preferences
    preferences: {
        defaultViewType: 'grid',
        defaultSortOption: 'relevance',
        priceAlerts: true,
        stockAlerts: true,
        reviewNotifications: false,
    },
};

// Helper functions
const isValidCache = (timestamp: number, maxAge: number = 5 * 60 * 1000): boolean => {
    return Date.now() - timestamp < maxAge;
};

const generateProductUrl = (product: Product): string => {
    return `/product/${product.slug}`;
};

// Create the store
export const useProductStore = create<ProductState & ProductActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,

                // Product operations
                fetchProduct: async (productId: string, storeId?: string) => {
                    try {
                        // Check cache first
                        const cached = get().productCache[productId];
                        const cacheTime = get().cacheExpiry[productId];

                        if (cached && cacheTime && isValidCache(cacheTime)) {
                            set((state) => {
                                state.currentProduct = cached;
                            });
                            return cached;
                        }

                        set((state) => {
                            state.currentProductLoading = true;
                            state.error = null;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 800));

                        // Mock product data
                        const mockProduct: Product = {
                            id: productId,
                            name: 'Sample Product',
                            brand: 'Sample Brand',
                            description: 'This is a detailed product description with all the important information about the product.',
                            category: 'Electronics',
                            department: 'Technology',
                            sku: 'SKU123456',
                            slug: 'sample-product',

                            pricing: {
                                current: 299.99,
                                original: 399.99,
                                currency: 'USD',
                                discountPercentage: 25,
                            },

                            availability: 'in_stock',
                            stock: 50,
                            condition: 'new',

                            images: [
                                'https://via.placeholder.com/400x400/0071ce/ffffff?text=Product+1',
                                'https://via.placeholder.com/400x400/0071ce/ffffff?text=Product+2',
                            ],

                            variants: [
                                {
                                    id: 'var1',
                                    name: 'Size',
                                    type: 'size',
                                    value: 'Small',
                                    sku: 'SKU123456-S',
                                    availability: 'in_stock',
                                    isDefault: true,
                                },
                                {
                                    id: 'var2',
                                    name: 'Size',
                                    type: 'size',
                                    value: 'Medium',
                                    sku: 'SKU123456-M',
                                    availability: 'in_stock',
                                },
                            ],

                            specifications: [
                                {
                                    name: 'Weight',
                                    value: '1.5 lbs',
                                    category: 'physical',
                                    displayOrder: 1,
                                },
                                {
                                    name: 'Dimensions',
                                    value: '10 x 8 x 2 inches',
                                    category: 'physical',
                                    displayOrder: 2,
                                },
                            ],

                            features: [
                                'High quality materials',
                                'Easy to use',
                                'Durable construction',
                            ],

                            rating: {
                                average: 4.5,
                                total: 256,
                                distribution: {
                                    5: 156,
                                    4: 80,
                                    3: 15,
                                    2: 3,
                                    1: 2,
                                },
                            },

                            reviews: [],

                            shipping: {
                                weight: 1.5,
                                dimensions: {
                                    length: 10,
                                    width: 8,
                                    height: 2,
                                },
                                freeShipping: true,
                                shippingClass: 'standard',
                            },

                            availableForPickup: true,
                            availableForDelivery: true,
                            availableForShipping: true,

                            tags: ['electronics', 'technology', 'popular'],

                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };

                        // Cache the product
                        set((state) => {
                            state.productCache[productId] = mockProduct;
                            state.cacheExpiry[productId] = Date.now();
                            state.currentProduct = mockProduct;
                            state.currentProductLoading = false;
                        });

                        // Add to recently viewed
                        get().addToRecentlyViewed(mockProduct);

                        return mockProduct;
                    } catch (error) {
                        console.error('Fetch product error:', error);
                        set((state) => {
                            state.currentProductLoading = false;
                            state.error = 'Failed to load product';
                        });
                        return null;
                    }
                },

                fetchProductBySlug: async (slug: string) => {
                    try {
                        // Mock finding product by slug
                        const productId = 'product_' + slug.replace('-', '_');
                        return await get().fetchProduct(productId);
                    } catch (error) {
                        console.error('Fetch product by slug error:', error);
                        get().setError('Failed to load product');
                        return null;
                    }
                },

                refreshProduct: async (productId: string) => {
                    try {
                        // Clear cache and fetch fresh data
                        set((state) => {
                            delete state.productCache[productId];
                            delete state.cacheExpiry[productId];
                        });

                        await get().fetchProduct(productId);
                    } catch (error) {
                        console.error('Refresh product error:', error);
                        get().setError('Failed to refresh product');
                    }
                },

                // Search operations
                searchProducts: async (query: string, filters?: SearchFilters, page: number = 1) => {
                    try {
                        set((state) => {
                            state.searchLoading = true;
                            state.searchQuery = query;
                            state.error = null;
                            if (filters) {
                                state.activeFilters = filters;
                            }
                        });

                        // Add to search history
                        if (query.trim()) {
                            await recentSearches.add(query.trim());

                            set((state) => {
                                if (!state.searchHistory.includes(query)) {
                                    state.searchHistory = [query, ...state.searchHistory.slice(0, 9)];
                                }
                            });
                        }

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 600));

                        // Mock search results
                        const mockResults: SearchResult = {
                            products: Array.from({ length: 20 }, (_, i) => ({
                                id: `search_result_${i}`,
                                name: `Search Result Product ${i + 1}`,
                                brand: `Brand ${i % 5 + 1}`,
                                description: `Description for search result ${i + 1}`,
                                category: 'Electronics',
                                department: 'Technology',
                                sku: `SKU${i + 1}`,
                                slug: `search-result-${i + 1}`,

                                pricing: {
                                    current: Math.round((Math.random() * 500 + 50) * 100) / 100,
                                    currency: 'USD',
                                },

                                availability: Math.random() > 0.8 ? 'out_of_stock' : 'in_stock',
                                stock: Math.floor(Math.random() * 100),
                                condition: 'new',

                                images: [`https://via.placeholder.com/200x200/0071ce/ffffff?text=Product+${i + 1}`],
                                variants: [],
                                specifications: [],
                                features: [],

                                rating: {
                                    average: Math.round((Math.random() * 2 + 3) * 10) / 10,
                                    total: Math.floor(Math.random() * 1000),
                                    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                                },

                                reviews: [],

                                shipping: {
                                    weight: 1,
                                    dimensions: { length: 10, width: 8, height: 2 },
                                    freeShipping: Math.random() > 0.5,
                                    shippingClass: 'standard',
                                },

                                availableForPickup: true,
                                availableForDelivery: true,
                                availableForShipping: true,

                                tags: ['electronics'],

                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            })),
                            total: 500,
                            page,
                            pageSize: 20,
                            totalPages: 25,
                            filters: {
                                applied: get().activeFilters,
                                available: {
                                    categories: [
                                        { name: 'Electronics', count: 300 },
                                        { name: 'Clothing', count: 150 },
                                        { name: 'Home', count: 50 },
                                    ],
                                    brands: [
                                        { name: 'Brand 1', count: 100 },
                                        { name: 'Brand 2', count: 80 },
                                        { name: 'Brand 3', count: 60 },
                                    ],
                                    priceRange: { min: 10, max: 1000 },
                                    departments: [
                                        { name: 'Technology', count: 300 },
                                        { name: 'Fashion', count: 150 },
                                    ],
                                    features: [
                                        { name: 'Free Shipping', count: 400 },
                                        { name: 'On Sale', count: 100 },
                                    ],
                                },
                            },
                        };

                        set((state) => {
                            state.searchResults = mockResults;
                            state.searchLoading = false;
                        });

                        return mockResults;
                    } catch (error) {
                        console.error('Search products error:', error);
                        set((state) => {
                            state.searchLoading = false;
                            state.error = 'Failed to search products';
                        });
                        return null;
                    }
                },

                searchWithFilters: async (filters: SearchFilters, page: number = 1) => {
                    return await get().searchProducts(get().searchQuery, filters, page);
                },

                getSearchSuggestions: async (query: string) => {
                    try {
                        if (!query.trim()) return [];

                        // Mock suggestions
                        await new Promise(resolve => setTimeout(resolve, 200));

                        const suggestions = [
                            `${query} case`,
                            `${query} accessories`,
                            `${query} pro`,
                            `${query} max`,
                            `${query} mini`,
                        ].slice(0, 5);

                        set((state) => {
                            state.searchSuggestions = suggestions;
                        });

                        return suggestions;
                    } catch (error) {
                        console.error('Get search suggestions error:', error);
                        return [];
                    }
                },

                clearSearch: () => {
                    set((state) => {
                        state.searchQuery = '';
                        state.searchResults = null;
                        state.activeFilters = {};
                        state.searchSuggestions = [];
                    });
                },

                // Filter operations
                setFilters: (filters: Partial<SearchFilters>) => {
                    set((state) => {
                        Object.assign(state.activeFilters, filters);
                    });
                },

                clearFilters: () => {
                    set((state) => {
                        state.activeFilters = {};
                    });
                },

                setSortOption: (option: SortOption) => {
                    set((state) => {
                        state.activeSortOption = option;
                    });
                },

                setViewType: (type: ViewType) => {
                    set((state) => {
                        state.viewType = type;
                    });
                },

                // Recently viewed
                addToRecentlyViewed: (product: Product) => {
                    set((state) => {
                        const recentItem: RecentlyViewedProduct = {
                            productId: product.id,
                            name: product.name,
                            image: product.images[0] || '',
                            price: product.pricing.current,
                            brand: product.brand,
                            viewedAt: new Date().toISOString(),
                        };

                        // Remove if already exists
                        state.recentlyViewed = state.recentlyViewed.filter(
                            item => item.productId !== product.id
                        );

                        // Add to beginning and limit to 20 items
                        state.recentlyViewed = [recentItem, ...state.recentlyViewed.slice(0, 19)];
                    });
                },

                clearRecentlyViewed: () => {
                    set((state) => {
                        state.recentlyViewed = [];
                    });
                },

                // Wishlist operations
                addToWishlist: async (product: Product, options?: { notifyOnSale?: boolean; notifyOnStock?: boolean; targetPrice?: number }) => {
                    try {
                        const existingItem = get().wishlist.find(item => item.productId === product.id);
                        if (existingItem) {
                            get().setError('Product already in wishlist');
                            return false;
                        }

                        const wishlistItem: WishlistItem = {
                            id: `wishlist_${Date.now()}`,
                            productId: product.id,
                            name: product.name,
                            image: product.images[0] || '',
                            price: product.pricing.current,
                            availability: product.availability,
                            addedAt: new Date().toISOString(),
                            ...options,
                        };

                        set((state) => {
                            state.wishlist.push(wishlistItem);
                        });

                        // Save to storage
                        await asyncStorage.setItem(STORAGE_KEYS.WISHLIST_ITEMS, get().wishlist);

                        return true;
                    } catch (error) {
                        console.error('Add to wishlist error:', error);
                        get().setError('Failed to add to wishlist');
                        return false;
                    }
                },

                removeFromWishlist: async (productId: string) => {
                    try {
                        set((state) => {
                            state.wishlist = state.wishlist.filter(item => item.productId !== productId);
                        });

                        await asyncStorage.setItem(STORAGE_KEYS.WISHLIST_ITEMS, get().wishlist);
                        return true;
                    } catch (error) {
                        console.error('Remove from wishlist error:', error);
                        get().setError('Failed to remove from wishlist');
                        return false;
                    }
                },

                updateWishlistItem: async (productId: string, updates: Partial<WishlistItem>) => {
                    try {
                        set((state) => {
                            const itemIndex = state.wishlist.findIndex(item => item.productId === productId);
                            if (itemIndex !== -1) {
                                Object.assign(state.wishlist[itemIndex], updates);
                            }
                        });

                        await asyncStorage.setItem(STORAGE_KEYS.WISHLIST_ITEMS, get().wishlist);
                        return true;
                    } catch (error) {
                        console.error('Update wishlist item error:', error);
                        get().setError('Failed to update wishlist item');
                        return false;
                    }
                },

                clearWishlist: async () => {
                    try {
                        set((state) => {
                            state.wishlist = [];
                        });

                        await asyncStorage.setItem(STORAGE_KEYS.WISHLIST_ITEMS, []);
                        return true;
                    } catch (error) {
                        console.error('Clear wishlist error:', error);
                        get().setError('Failed to clear wishlist');
                        return false;
                    }
                },

                checkWishlistStatus: (productId: string) => {
                    return get().wishlist.some(item => item.productId === productId);
                },

                // Product comparison
                addToComparison: (product: Product) => {
                    set((state) => {
                        if (!state.currentComparison) {
                            state.currentComparison = {
                                id: `comparison_${Date.now()}`,
                                products: [],
                                createdAt: new Date().toISOString(),
                            };
                        }

                        // Check if product already in comparison
                        const exists = state.currentComparison.products.some(p => p.id === product.id);
                        if (!exists && state.currentComparison.products.length < 4) {
                            state.currentComparison.products.push(product);
                        }
                    });
                },

                removeFromComparison: (productId: string) => {
                    set((state) => {
                        if (state.currentComparison) {
                            state.currentComparison.products = state.currentComparison.products.filter(
                                p => p.id !== productId
                            );

                            if (state.currentComparison.products.length === 0) {
                                state.currentComparison = null;
                            }
                        }
                    });
                },

                clearComparison: () => {
                    set((state) => {
                        state.currentComparison = null;
                    });
                },

                saveComparison: async (name?: string) => {
                    try {
                        const comparison = get().currentComparison;
                        if (!comparison || comparison.products.length === 0) {
                            throw new Error('No comparison to save');
                        }

                        const savedComparison: ProductComparison = {
                            ...comparison,
                            name: name || `Comparison ${new Date().toLocaleDateString()}`,
                        };

                        set((state) => {
                            state.comparisons.push(savedComparison);
                        });

                        return savedComparison.id;
                    } catch (error) {
                        console.error('Save comparison error:', error);
                        get().setError('Failed to save comparison');
                        throw error;
                    }
                },

                loadComparison: async (comparisonId: string) => {
                    try {
                        const comparison = get().comparisons.find(c => c.id === comparisonId);
                        if (!comparison) {
                            throw new Error('Comparison not found');
                        }

                        set((state) => {
                            state.currentComparison = { ...comparison };
                        });

                        return true;
                    } catch (error) {
                        console.error('Load comparison error:', error);
                        get().setError('Failed to load comparison');
                        return false;
                    }
                },

                deleteComparison: async (comparisonId: string) => {
                    try {
                        set((state) => {
                            state.comparisons = state.comparisons.filter(c => c.id !== comparisonId);
                        });

                        return true;
                    } catch (error) {
                        console.error('Delete comparison error:', error);
                        get().setError('Failed to delete comparison');
                        return false;
                    }
                },

                // Categories
                fetchCategories: async () => {
                    try {
                        set((state) => {
                            state.isLoading = true;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        const mockCategories = [
                            {
                                id: 'electronics',
                                name: 'Electronics',
                                slug: 'electronics',
                                image: 'https://via.placeholder.com/200x200/0071ce/ffffff?text=Electronics',
                                subcategories: [
                                    { id: 'phones', name: 'Phones & Accessories', slug: 'phones', productCount: 1250 },
                                    { id: 'computers', name: 'Computers & Tablets', slug: 'computers', productCount: 850 },
                                    { id: 'tv', name: 'TV & Home Theater', slug: 'tv', productCount: 650 },
                                    { id: 'gaming', name: 'Video Games', slug: 'gaming', productCount: 450 },
                                ],
                            },
                            {
                                id: 'clothing',
                                name: 'Clothing',
                                slug: 'clothing',
                                image: 'https://via.placeholder.com/200x200/0071ce/ffffff?text=Clothing',
                                subcategories: [
                                    { id: 'mens', name: "Men's Clothing", slug: 'mens', productCount: 2100 },
                                    { id: 'womens', name: "Women's Clothing", slug: 'womens', productCount: 2800 },
                                    { id: 'kids', name: "Kids' Clothing", slug: 'kids', productCount: 1200 },
                                    { id: 'shoes', name: 'Shoes', slug: 'shoes', productCount: 950 },
                                ],
                            },
                            {
                                id: 'home',
                                name: 'Home & Garden',
                                slug: 'home',
                                image: 'https://via.placeholder.com/200x200/0071ce/ffffff?text=Home',
                                subcategories: [
                                    { id: 'furniture', name: 'Furniture', slug: 'furniture', productCount: 1500 },
                                    { id: 'decor', name: 'Home Decor', slug: 'decor', productCount: 2200 },
                                    { id: 'kitchen', name: 'Kitchen & Dining', slug: 'kitchen', productCount: 1800 },
                                    { id: 'garden', name: 'Garden & Patio', slug: 'garden', productCount: 750 },
                                ],
                            },
                            {
                                id: 'grocery',
                                name: 'Grocery',
                                slug: 'grocery',
                                image: 'https://via.placeholder.com/200x200/0071ce/ffffff?text=Grocery',
                                subcategories: [
                                    { id: 'produce', name: 'Fresh Produce', slug: 'produce', productCount: 500 },
                                    { id: 'dairy', name: 'Dairy & Eggs', slug: 'dairy', productCount: 300 },
                                    { id: 'meat', name: 'Meat & Seafood', slug: 'meat', productCount: 400 },
                                    { id: 'pantry', name: 'Pantry Staples', slug: 'pantry', productCount: 1200 },
                                ],
                            },
                        ];

                        set((state) => {
                            state.categories = mockCategories;
                            state.featuredCategories = ['electronics', 'clothing', 'home', 'grocery'];
                            state.isLoading = false;
                        });
                    } catch (error) {
                        console.error('Fetch categories error:', error);
                        set((state) => {
                            state.isLoading = false;
                            state.error = 'Failed to load categories';
                        });
                    }
                },

                fetchCategoryProducts: async (categoryId: string, page: number = 1) => {
                    try {
                        return await get().searchProducts('', { category: [categoryId] }, page);
                    } catch (error) {
                        console.error('Fetch category products error:', error);
                        return null;
                    }
                },

                // Recommendations
                fetchRecommendations: async (productId?: string, userId?: string) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 400));

                        const mockProducts = Array.from({ length: 10 }, (_, i) => ({
                            id: `recommended_${i}`,
                            name: `Recommended Product ${i + 1}`,
                            brand: `Brand ${i % 3 + 1}`,
                            description: `Recommended product description ${i + 1}`,
                            category: 'Electronics',
                            department: 'Technology',
                            sku: `REC${i + 1}`,
                            slug: `recommended-product-${i + 1}`,

                            pricing: {
                                current: Math.round((Math.random() * 300 + 50) * 100) / 100,
                                currency: 'USD',
                            },

                            availability: 'in_stock' as ProductAvailability,
                            stock: Math.floor(Math.random() * 50 + 10),
                            condition: 'new' as ProductCondition,

                            images: [`https://via.placeholder.com/200x200/0071ce/ffffff?text=Rec+${i + 1}`],
                            variants: [],
                            specifications: [],
                            features: [],

                            rating: {
                                average: Math.round((Math.random() * 2 + 3) * 10) / 10,
                                total: Math.floor(Math.random() * 500 + 50),
                                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                            },

                            reviews: [],

                            shipping: {
                                weight: 1,
                                dimensions: { length: 10, width: 8, height: 2 },
                                freeShipping: true,
                                shippingClass: 'standard' as const,
                            },

                            availableForPickup: true,
                            availableForDelivery: true,
                            availableForShipping: true,

                            tags: ['recommended'],

                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }));

                        set((state) => {
                            state.recommendedProducts = mockProducts;
                        });
                    } catch (error) {
                        console.error('Fetch recommendations error:', error);
                        get().setError('Failed to load recommendations');
                    }
                },

                fetchTrendingProducts: async () => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 400));

                        const mockProducts = Array.from({ length: 8 }, (_, i) => ({
                            id: `trending_${i}`,
                            name: `Trending Product ${i + 1}`,
                            brand: `Popular Brand ${i % 4 + 1}`,
                            description: `Trending product description ${i + 1}`,
                            category: ['Electronics', 'Clothing', 'Home', 'Sports'][i % 4],
                            department: 'Popular',
                            sku: `TREND${i + 1}`,
                            slug: `trending-product-${i + 1}`,

                            pricing: {
                                current: Math.round((Math.random() * 200 + 30) * 100) / 100,
                                original: Math.round((Math.random() * 100 + 250) * 100) / 100,
                                currency: 'USD',
                                discountPercentage: Math.floor(Math.random() * 30 + 10),
                            },

                            availability: 'in_stock' as ProductAvailability,
                            stock: Math.floor(Math.random() * 30 + 5),
                            condition: 'new' as ProductCondition,

                            images: [`https://via.placeholder.com/200x200/0071ce/ffffff?text=Trend+${i + 1}`],
                            variants: [],
                            specifications: [],
                            features: [],

                            rating: {
                                average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
                                total: Math.floor(Math.random() * 1000 + 100),
                                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                            },

                            reviews: [],

                            shipping: {
                                weight: 1,
                                dimensions: { length: 10, width: 8, height: 2 },
                                freeShipping: Math.random() > 0.3,
                                shippingClass: 'standard' as const,
                            },

                            availableForPickup: true,
                            availableForDelivery: true,
                            availableForShipping: true,

                            tags: ['trending', 'popular'],

                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }));

                        set((state) => {
                            state.trendingProducts = mockProducts;
                        });
                    } catch (error) {
                        console.error('Fetch trending products error:', error);
                        get().setError('Failed to load trending products');
                    }
                },

                fetchDealProducts: async () => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 400));

                        const mockProducts = Array.from({ length: 12 }, (_, i) => ({
                            id: `deal_${i}`,
                            name: `Deal Product ${i + 1}`,
                            brand: `Deal Brand ${i % 5 + 1}`,
                            description: `Great deal on product ${i + 1}`,
                            category: ['Electronics', 'Clothing', 'Home', 'Sports', 'Beauty'][i % 5],
                            department: 'Deals',
                            sku: `DEAL${i + 1}`,
                            slug: `deal-product-${i + 1}`,

                            pricing: {
                                current: Math.round((Math.random() * 150 + 25) * 100) / 100,
                                original: Math.round((Math.random() * 200 + 200) * 100) / 100,
                                currency: 'USD',
                                discountPercentage: Math.floor(Math.random() * 50 + 30),
                            },

                            availability: 'in_stock' as ProductAvailability,
                            stock: Math.floor(Math.random() * 20 + 2),
                            condition: 'new' as ProductCondition,

                            images: [`https://via.placeholder.com/200x200/ff6b35/ffffff?text=Deal+${i + 1}`],
                            variants: [],
                            specifications: [],
                            features: ['Limited Time Offer', 'Great Value'],

                            rating: {
                                average: Math.round((Math.random() * 2 + 3) * 10) / 10,
                                total: Math.floor(Math.random() * 800 + 50),
                                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                            },

                            reviews: [],

                            shipping: {
                                weight: 1,
                                dimensions: { length: 10, width: 8, height: 2 },
                                freeShipping: true,
                                shippingClass: 'standard' as const,
                            },

                            availableForPickup: true,
                            availableForDelivery: true,
                            availableForShipping: true,

                            tags: ['deal', 'sale', 'limited-time'],

                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }));

                        set((state) => {
                            state.dealProducts = mockProducts;
                        });
                    } catch (error) {
                        console.error('Fetch deal products error:', error);
                        get().setError('Failed to load deal products');
                    }
                },

                // Reviews
                fetchProductReviews: async (productId: string, page: number = 1) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        const mockReviews: ProductReview[] = Array.from({ length: 10 }, (_, i) => ({
                            id: `review_${productId}_${i}`,
                            userId: `user_${i}`,
                            userName: `User ${i + 1}`,
                            userAvatar: `https://via.placeholder.com/40x40/0071ce/ffffff?text=U${i + 1}`,
                            rating: Math.floor(Math.random() * 5) + 1,
                            title: `Review title ${i + 1}`,
                            content: `This is a detailed review of the product. Review number ${i + 1} with some thoughts and feedback about the product experience.`,
                            pros: ['Good quality', 'Fast shipping', 'Great value'],
                            cons: ['Could be better', 'Minor issues'],
                            verified: Math.random() > 0.3,
                            helpful: Math.floor(Math.random() * 50),
                            images: Math.random() > 0.7 ? [`https://via.placeholder.com/100x100/0071ce/ffffff?text=Review+${i + 1}`] : undefined,
                            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                            updatedAt: new Date().toISOString(),
                        }));

                        return mockReviews;
                    } catch (error) {
                        console.error('Fetch product reviews error:', error);
                        get().setError('Failed to load reviews');
                        return [];
                    }
                },

                submitReview: async (productId: string, review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Mock successful submission
                        return true;
                    } catch (error) {
                        console.error('Submit review error:', error);
                        get().setError('Failed to submit review');
                        return false;
                    }
                },

                // Variants
                selectVariant: (productId: string, variantId: string) => {
                    set((state) => {
                        if (state.currentProduct && state.currentProduct.id === productId) {
                            state.currentProduct.selectedVariant = variantId;
                        }

                        // Update cached product
                        if (state.productCache[productId]) {
                            state.productCache[productId].selectedVariant = variantId;
                        }
                    });
                },

                getVariantPrice: (productId: string, variantId: string) => {
                    const product = get().productCache[productId] || get().currentProduct;
                    if (!product) return null;

                    const variant = product.variants.find(v => v.id === variantId);
                    if (!variant) return null;

                    return variant.price || (product.pricing.current + (variant.priceModifier || 0));
                },

                // Cache management
                clearCache: () => {
                    set((state) => {
                        state.productCache = {};
                        state.cacheExpiry = {};
                    });
                },

                preloadProducts: async (productIds: string[]) => {
                    try {
                        const promises = productIds.map(id => get().fetchProduct(id));
                        await Promise.allSettled(promises);
                    } catch (error) {
                        console.error('Preload products error:', error);
                    }
                },

                // Preferences
                updatePreferences: (preferences: Partial<ProductState['preferences']>) => {
                    set((state) => {
                        Object.assign(state.preferences, preferences);
                    });
                },

                // Error handling
                setError: (error: string | null) => {
                    set((state) => {
                        state.error = error;
                    });
                },

                clearError: () => {
                    set((state) => {
                        state.error = null;
                    });
                },

                // Utilities
                getProductUrl: (product: Product) => {
                    return generateProductUrl(product);
                },

                shareProduct: async (product: Product) => {
                    try {
                        // Mock sharing functionality
                        const url = generateProductUrl(product);

                        if (navigator.share) {
                            await navigator.share({
                                title: product.name,
                                text: product.shortDescription || product.description,
                                url: window.location.origin + url,
                            });
                        } else {
                            // Fallback: copy to clipboard
                            await navigator.clipboard.writeText(window.location.origin + url);
                        }
                    } catch (error) {
                        console.error('Share product error:', error);
                        get().setError('Failed to share product');
                    }
                },

                reportProduct: async (productId: string, reason: string) => {
                    try {
                        // Mock API call to report product
                        await new Promise(resolve => setTimeout(resolve, 500));
                        return true;
                    } catch (error) {
                        console.error('Report product error:', error);
                        get().setError('Failed to report product');
                        return false;
                    }
                },
            })),
            {
                name: 'walmart-product-store',
                storage: {
                    getItem: (name) => asyncStorage.getItem(name as any),
                    setItem: (name, value) => asyncStorage.setItem(name as any, value),
                    removeItem: (name) => asyncStorage.removeItem(name as any),
                },
                partialize: (state) => ({
                    // Persist search and preferences
                    searchHistory: state.searchHistory,
                    recentlyViewed: state.recentlyViewed,
                    wishlist: state.wishlist,
                    comparisons: state.comparisons,
                    preferences: state.preferences,

                    // Don't persist cache or current states
                }),
            }
        ),
        {
            name: 'product-store',
        }
    )
);

// Selectors for common use cases
export const useCurrentProduct = () => useProductStore((state) => ({
    product: state.currentProduct,
    isLoading: state.currentProductLoading,
    fetchProduct: state.fetchProduct,
    selectVariant: state.selectVariant,
    addToWishlist: state.addToWishlist,
    checkWishlistStatus: state.checkWishlistStatus,
    addToComparison: state.addToComparison,
}));

export const useProductSearch = () => useProductStore((state) => ({
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    searchLoading: state.searchLoading,
    searchHistory: state.searchHistory,
    searchSuggestions: state.searchSuggestions,
    searchProducts: state.searchProducts,
    getSearchSuggestions: state.getSearchSuggestions,
    clearSearch: state.clearSearch,
}));

export const useProductFilters = () => useProductStore((state) => ({
    activeFilters: state.activeFilters,
    activeSortOption: state.activeSortOption,
    viewType: state.viewType,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
    setSortOption: state.setSortOption,
    setViewType: state.setViewType,
}));

export const useProductCategories = () => useProductStore((state) => ({
    categories: state.categories,
    featuredCategories: state.featuredCategories,
    fetchCategories: state.fetchCategories,
    fetchCategoryProducts: state.fetchCategoryProducts,
}));

export const useWishlist = () => useProductStore((state) => ({
    wishlist: state.wishlist,
    addToWishlist: state.addToWishlist,
    removeFromWishlist: state.removeFromWishlist,
    updateWishlistItem: state.updateWishlistItem,
    clearWishlist: state.clearWishlist,
    checkWishlistStatus: state.checkWishlistStatus,
}));

export const useProductComparison = () => useProductStore((state) => ({
    currentComparison: state.currentComparison,
    comparisons: state.comparisons,
    addToComparison: state.addToComparison,
    removeFromComparison: state.removeFromComparison,
    clearComparison: state.clearComparison,
    saveComparison: state.saveComparison,
    loadComparison: state.loadComparison,
    deleteComparison: state.deleteComparison,
}));

export const useRecentlyViewed = () => useProductStore((state) => ({
    recentlyViewed: state.recentlyViewed,
    addToRecentlyViewed: state.addToRecentlyViewed,
    clearRecentlyViewed: state.clearRecentlyViewed,
}));

export const useProductRecommendations = () => useProductStore((state) => ({
    recommendedProducts: state.recommendedProducts,
    trendingProducts: state.trendingProducts,
    dealProducts: state.dealProducts,
    fetchRecommendations: state.fetchRecommendations,
    fetchTrendingProducts: state.fetchTrendingProducts,
    fetchDealProducts: state.fetchDealProducts,
}));