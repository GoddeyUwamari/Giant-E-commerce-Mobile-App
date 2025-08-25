import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_KEYS, API, LIMITS } from '@/config/constants';

// Types
export interface Product {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    isOnSale: boolean;
    saleEndDate?: string;
    discount?: {
        amount: number;
        percentage: number;
        type: 'fixed' | 'percentage';
    };
    images: string[];
    thumbnail: string;
    brand: string;
    category: ProductCategory;
    subcategory?: string;
    sku: string;
    upc?: string;
    rating: {
        average: number;
        count: number;
        distribution: Record<string, number>; // 1-5 star distribution
    };
    reviews: {
        count: number;
        highlights: string[];
    };
    specifications: Record<string, any>;
    variants?: ProductVariant[];
    availability: ProductAvailability;
    shipping: ProductShipping;
    seller: ProductSeller;
    tags: string[];
    isSponsored: boolean;
    isTrending: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    level: number;
    image?: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    type: 'size' | 'color' | 'style' | 'capacity' | 'other';
    value: string;
    price?: number;
    originalPrice?: number;
    isAvailable: boolean;
    sku?: string;
    image?: string;
}

export interface ProductAvailability {
    inStock: boolean;
    quantity: number;
    maxQuantity: number;
    backorderAllowed: boolean;
    backorderDate?: string;
    discontinued: boolean;
    storeAvailability?: Record<string, number>; // storeId -> quantity
}

export interface ProductShipping {
    isFreeShipping: boolean;
    shippingCost: number;
    estimatedDays: string;
    isPickupAvailable: boolean;
    isDeliveryAvailable: boolean;
    isSameDayDelivery: boolean;
    isNextDayDelivery: boolean;
    restrictions?: string[];
}

export interface ProductSeller {
    id: string;
    name: string;
    isThirdParty: boolean;
    rating?: number;
    isVerified: boolean;
    shipsFrom?: string;
}

export interface ProductFilters {
    category?: string;
    subcategory?: string;
    brand?: string[];
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    inStock?: boolean;
    onSale?: boolean;
    freeShipping?: boolean;
    seller?: 'walmart' | 'thirdparty' | 'all';
    tags?: string[];
}

export interface ProductSort {
    field: 'relevance' | 'price' | 'rating' | 'newest' | 'bestseller' | 'name';
    direction: 'asc' | 'desc';
}

export interface SearchParams {
    query?: string;
    filters?: ProductFilters;
    sort?: ProductSort;
    page?: number;
    limit?: number;
}

export interface SearchResult {
    products: Product[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    suggestions?: string[];
    correctedQuery?: string;
    facets?: SearchFacets;
}

export interface SearchFacets {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    ratings: Array<{ rating: number; count: number }>;
    features: Array<{ name: string; count: number }>;
}

export interface ProductRecommendations {
    personalizedForYou: Product[];
    trending: Product[];
    recentlyViewed: Product[];
    frequentlyBoughtTogether: Product[];
    similarProducts: Product[];
    basedOnHistory: Product[];
}

export interface ProductState {
    products: Record<string, Product>;
    searchResults: SearchResult | null;
    recommendations: ProductRecommendations | null;
    categories: ProductCategory[];
    recentlyViewed: string[]; // Product IDs
    wishlist: string[]; // Product IDs
    compareList: string[]; // Product IDs
    isLoading: boolean;
    isSearching: boolean;
    isLoadingMore: boolean;
    searchQuery: string;
    activeFilters: ProductFilters;
    activeSort: ProductSort;
    error: Error | null;
    lastSynced: string | null;
}

// Mock API functions (replace with actual API calls)
const productsAPI = {
    search: async (params: SearchParams): Promise<SearchResult> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock search results
        const mockProducts: Product[] = Array.from({ length: params.limit || 20 }, (_, i) => ({
            id: `product_${i + 1}`,
            name: `Sample Product ${i + 1}`,
            description: `This is a detailed description for product ${i + 1}`,
            price: Math.round((Math.random() * 200 + 10) * 100) / 100,
            originalPrice: Math.round((Math.random() * 250 + 50) * 100) / 100,
            isOnSale: Math.random() > 0.7,
            images: [`https://via.placeholder.com/300x300?text=Product+${i + 1}`],
            thumbnail: `https://via.placeholder.com/150x150?text=Product+${i + 1}`,
            brand: ['Samsung', 'Apple', 'Sony', 'LG', 'Nike'][Math.floor(Math.random() * 5)],
            category: {
                id: 'electronics',
                name: 'Electronics',
                slug: 'electronics',
                level: 1,
            },
            sku: `SKU${i + 1}`,
            rating: {
                average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
                count: Math.floor(Math.random() * 1000 + 10),
                distribution: { '5': 40, '4': 30, '3': 15, '2': 10, '1': 5 },
            },
            reviews: {
                count: Math.floor(Math.random() * 500 + 10),
                highlights: ['Great quality', 'Fast shipping', 'Good value'],
            },
            specifications: { weight: '1.2 lbs', dimensions: '10x8x2 inches' },
            availability: {
                inStock: Math.random() > 0.1,
                quantity: Math.floor(Math.random() * 100 + 1),
                maxQuantity: 10,
                backorderAllowed: false,
                discontinued: false,
            },
            shipping: {
                isFreeShipping: Math.random() > 0.3,
                shippingCost: Math.random() > 0.3 ? 0 : 5.99,
                estimatedDays: '2-3',
                isPickupAvailable: true,
                isDeliveryAvailable: true,
                isSameDayDelivery: Math.random() > 0.8,
                isNextDayDelivery: Math.random() > 0.6,
            },
            seller: {
                id: 'walmart',
                name: 'Walmart',
                isThirdParty: false,
                isVerified: true,
            },
            tags: ['electronics', 'popular'],
            isSponsored: Math.random() > 0.9,
            isTrending: Math.random() > 0.8,
            isNewArrival: Math.random() > 0.9,
            isBestSeller: Math.random() > 0.85,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        return {
            products: mockProducts,
            totalCount: 1000,
            currentPage: params.page || 1,
            totalPages: 50,
            hasNextPage: (params.page || 1) < 50,
            hasPreviousPage: (params.page || 1) > 1,
            suggestions: params.query ? [`${params.query} case`, `${params.query} accessories`] : [],
        };
    },

    getProduct: async (id: string): Promise<Product> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return mock product
        return {
            id,
            name: 'Sample Product',
            description: 'Detailed product description',
            price: 29.99,
            originalPrice: 39.99,
            isOnSale: true,
            images: ['https://via.placeholder.com/300x300'],
            thumbnail: 'https://via.placeholder.com/150x150',
            brand: 'Sample Brand',
            category: { id: 'electronics', name: 'Electronics', slug: 'electronics', level: 1 },
            sku: 'SKU123',
            rating: { average: 4.5, count: 128, distribution: { '5': 50, '4': 30, '3': 15, '2': 3, '1': 2 } },
            reviews: { count: 128, highlights: ['Great quality', 'Fast shipping'] },
            specifications: { weight: '1.2 lbs' },
            availability: { inStock: true, quantity: 50, maxQuantity: 10, backorderAllowed: false, discontinued: false },
            shipping: { isFreeShipping: true, shippingCost: 0, estimatedDays: '2-3', isPickupAvailable: true, isDeliveryAvailable: true, isSameDayDelivery: false, isNextDayDelivery: true },
            seller: { id: 'walmart', name: 'Walmart', isThirdParty: false, isVerified: true },
            tags: ['electronics'],
            isSponsored: false,
            isTrending: true,
            isNewArrival: false,
            isBestSeller: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    },

    getRecommendations: async (userId?: string, productId?: string): Promise<ProductRecommendations> => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const mockProduct = {
            id: 'rec_1',
            name: 'Recommended Product',
            price: 19.99,
            images: ['https://via.placeholder.com/150x150'],
            thumbnail: 'https://via.placeholder.com/150x150',
            rating: { average: 4.3, count: 45, distribution: {} },
        } as Product;

        return {
            personalizedForYou: [mockProduct],
            trending: [mockProduct],
            recentlyViewed: [mockProduct],
            frequentlyBoughtTogether: [mockProduct],
            similarProducts: [mockProduct],
            basedOnHistory: [mockProduct],
        };
    },

    getCategories: async (): Promise<ProductCategory[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        return [
            { id: 'electronics', name: 'Electronics', slug: 'electronics', level: 1 },
            { id: 'clothing', name: 'Clothing', slug: 'clothing', level: 1 },
            { id: 'home', name: 'Home & Garden', slug: 'home-garden', level: 1 },
            { id: 'sports', name: 'Sports & Outdoors', slug: 'sports-outdoors', level: 1 },
        ];
    },
};

export function useProducts() {
    const [productState, setProductState] = useState<ProductState>({
        products: {},
        searchResults: null,
        recommendations: null,
        categories: [],
        recentlyViewed: [],
        wishlist: [],
        compareList: [],
        isLoading: false,
        isSearching: false,
        isLoadingMore: false,
        searchQuery: '',
        activeFilters: {},
        activeSort: { field: 'relevance', direction: 'desc' },
        error: null,
        lastSynced: null,
    });

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Load cached data from storage
    const loadCachedData = useCallback(async () => {
        try {
            const [recentlyViewed, wishlist, compareList, categories] = await Promise.all([
                AsyncStorage.getItem(CACHE_KEYS.RECENT_SEARCHES),
                AsyncStorage.getItem(CACHE_KEYS.WISHLIST),
                AsyncStorage.getItem('compare_list'),
                AsyncStorage.getItem(CACHE_KEYS.CATEGORIES),
            ]);

            setProductState(prev => ({
                ...prev,
                recentlyViewed: recentlyViewed ? JSON.parse(recentlyViewed) : [],
                wishlist: wishlist ? JSON.parse(wishlist) : [],
                compareList: compareList ? JSON.parse(compareList) : [],
                categories: categories ? JSON.parse(categories) : [],
            }));
        } catch (error) {
            console.error('Error loading cached data:', error);
        }
    }, []);

    // Save data to cache
    const saveToCache = useCallback(async (key: string, data: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to cache:`, error);
        }
    }, []);

    // Search products
    const searchProducts = useCallback(async (
        params: SearchParams,
        append: boolean = false
    ): Promise<void> => {
        try {
            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setProductState(prev => ({
                ...prev,
                isSearching: !append,
                isLoadingMore: append,
                error: null,
                searchQuery: params.query || '',
                activeFilters: params.filters || {},
                activeSort: params.sort || prev.activeSort,
            }));

            const result = await productsAPI.search(params);

            setProductState(prev => {
                const newProducts = { ...prev.products };
                result.products.forEach(product => {
                    newProducts[product.id] = product;
                });

                return {
                    ...prev,
                    products: newProducts,
                    searchResults: append && prev.searchResults ? {
                        ...result,
                        products: [...prev.searchResults.products, ...result.products],
                    } : result,
                    isSearching: false,
                    isLoadingMore: false,
                    lastSynced: new Date().toISOString(),
                };
            });
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                setProductState(prev => ({
                    ...prev,
                    error: error,
                    isSearching: false,
                    isLoadingMore: false,
                }));
            }
        }
    }, []);

    // Debounced search
    const debouncedSearch = useCallback((params: SearchParams, delay: number = 500) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchProducts(params);
        }, delay);
    }, [searchProducts]);

    // Get single product
    const getProduct = useCallback(async (id: string): Promise<Product | null> => {
        try {
            // Check if product is already in state
            if (productState.products[id]) {
                return productState.products[id];
            }

            setProductState(prev => ({ ...prev, isLoading: true, error: null }));

            const product = await productsAPI.getProduct(id);

            setProductState(prev => ({
                ...prev,
                products: { ...prev.products, [id]: product },
                isLoading: false,
            }));

            // Add to recently viewed
            addToRecentlyViewed(id);

            return product;
        } catch (error) {
            setProductState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to fetch product'),
                isLoading: false,
            }));
            return null;
        }
    }, [productState.products]);

    // Load more search results
    const loadMoreResults = useCallback(async (): Promise<void> => {
        if (!productState.searchResults || !productState.searchResults.hasNextPage) {
            return;
        }

        const nextPage = productState.searchResults.currentPage + 1;
        await searchProducts({
            query: productState.searchQuery,
            filters: productState.activeFilters,
            sort: productState.activeSort,
            page: nextPage,
        }, true);
    }, [productState, searchProducts]);

    // Get recommendations
    const getRecommendations = useCallback(async (
        userId?: string,
        productId?: string
    ): Promise<void> => {
        try {
            setProductState(prev => ({ ...prev, isLoading: true, error: null }));

            const recommendations = await productsAPI.getRecommendations(userId, productId);

            // Add recommended products to products state
            const newProducts = { ...productState.products };
            Object.values(recommendations).flat().forEach(product => {
                if (product && product.id) {
                    newProducts[product.id] = product;
                }
            });

            setProductState(prev => ({
                ...prev,
                products: newProducts,
                recommendations,
                isLoading: false,
            }));
        } catch (error) {
            setProductState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to fetch recommendations'),
                isLoading: false,
            }));
        }
    }, [productState.products]);

    // Add to recently viewed
    const addToRecentlyViewed = useCallback(async (productId: string): Promise<void> => {
        setProductState(prev => {
            const updated = [productId, ...prev.recentlyViewed.filter(id => id !== productId)]
                .slice(0, 20); // Keep only last 20

            saveToCache('recently_viewed', updated);
            return { ...prev, recentlyViewed: updated };
        });
    }, [saveToCache]);

    // Toggle wishlist
    const toggleWishlist = useCallback(async (productId: string): Promise<void> => {
        setProductState(prev => {
            const isInWishlist = prev.wishlist.includes(productId);
            const updated = isInWishlist
                ? prev.wishlist.filter(id => id !== productId)
                : [...prev.wishlist, productId];

            saveToCache(CACHE_KEYS.WISHLIST, updated);
            return { ...prev, wishlist: updated };
        });
    }, [saveToCache]);

    // Toggle compare list
    const toggleCompareList = useCallback(async (productId: string): Promise<void> => {
        setProductState(prev => {
            const isInCompare = prev.compareList.includes(productId);

            if (!isInCompare && prev.compareList.length >= 4) {
                throw new Error('Cannot compare more than 4 products');
            }

            const updated = isInCompare
                ? prev.compareList.filter(id => id !== productId)
                : [...prev.compareList, productId];

            saveToCache('compare_list', updated);
            return { ...prev, compareList: updated };
        });
    }, [saveToCache]);

    // Clear search results
    const clearSearchResults = useCallback(() => {
        setProductState(prev => ({
            ...prev,
            searchResults: null,
            searchQuery: '',
            activeFilters: {},
        }));
    }, []);

    // Get categories
    const loadCategories = useCallback(async (): Promise<void> => {
        try {
            const categories = await productsAPI.getCategories();

            setProductState(prev => ({ ...prev, categories }));
            saveToCache(CACHE_KEYS.CATEGORIES, categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }, [saveToCache]);

    // Initialize
    useEffect(() => {
        loadCachedData();
        loadCategories();
        getRecommendations();
    }, [loadCachedData, loadCategories, getRecommendations]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        // State
        ...productState,

        // Actions
        searchProducts,
        debouncedSearch,
        getProduct,
        loadMoreResults,
        getRecommendations,
        clearSearchResults,
        loadCategories,

        // User actions
        addToRecentlyViewed,
        toggleWishlist,
        toggleCompareList,

        // Computed values
        isInWishlist: (productId: string) => productState.wishlist.includes(productId),
        isInCompareList: (productId: string) => productState.compareList.includes(productId),
        canAddToCompare: productState.compareList.length < 4,
        compareProducts: productState.compareList.map(id => productState.products[id]).filter(Boolean),
        wishlistProducts: productState.wishlist.map(id => productState.products[id]).filter(Boolean),
        recentlyViewedProducts: productState.recentlyViewed.map(id => productState.products[id]).filter(Boolean),

        // Search helpers
        hasSearchResults: !!productState.searchResults?.products.length,
        canLoadMore: !!productState.searchResults?.hasNextPage,
        totalResults: productState.searchResults?.totalCount || 0,
    };
}