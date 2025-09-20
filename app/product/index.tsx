import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Import from unified system - FIXED PATH
import { useCartStore } from '../../store/slices/cartSlice';
import {
    ALL_PRODUCTS,
    ALL_CATEGORIES,
    getProductsByCategory,
    getFeaturedProducts,
    getBestSellerProducts,
    getTrendingProducts,
    Product
} from '../../constants/products/data';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Walmart colors
const COLORS = {
    primary: '#0071CE',
    primaryDark: '#004C91',
    secondary: '#FFC220',
    white: '#FFFFFF',
    black: '#1F2937',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F8FAFC',
};

// Enhanced filter functions with better fallbacks and data debugging
const getAllSaleProducts = (): Product[] => {
    try {
        console.log('Getting sale products from ALL_PRODUCTS:', ALL_PRODUCTS?.length || 0);
        return (ALL_PRODUCTS || []).filter(product =>
            product.originalPrice && product.originalPrice > product.price
        );
    } catch (error) {
        console.error('Error getting sale products:', error);
        return [];
    }
};

const getAllTrendingProducts = (): Product[] => {
    try {
        // Try the import function first, with fallback logic
        const trendingFromImport = getTrendingProducts?.() || [];
        if (trendingFromImport.length > 0) {
            return trendingFromImport;
        }

        // Fallback: filter products with high ratings or trending badge
        return (ALL_PRODUCTS || []).filter(product =>
            product.badge === 'Trending' ||
            product.rating >= 4.5 ||
            (product.rating >= 4.0 && product.reviewCount >= 100)
        );
    } catch (error) {
        console.error('Error getting trending products:', error);
        return [];
    }
};

const getAllFeaturedProducts = (): Product[] => {
    try {
        // Try the import function first
        const featuredFromImport = getFeaturedProducts?.() || [];
        if (featuredFromImport.length > 0) {
            return featuredFromImport;
        }

        // Fallback: filter products marked as featured
        return (ALL_PRODUCTS || []).filter(product => product.featured);
    } catch (error) {
        console.error('Error getting featured products:', error);
        return [];
    }
};

const getNewArrivals = (): Product[] => {
    try {
        return (ALL_PRODUCTS || [])
            .filter(product => product.badge === 'New')
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 50);
    } catch (error) {
        console.error('Error getting new arrivals:', error);
        return [];
    }
};

// Enhanced search function with debugging
const searchProducts = (query: string): Product[] => {
    try {
        const searchTerm = query.toLowerCase().trim();
        console.log('Searching for:', searchTerm, 'in', ALL_PRODUCTS?.length || 0, 'products');

        if (!searchTerm) return ALL_PRODUCTS || [];

        const results = (ALL_PRODUCTS || []).filter(product => {
            const matchName = product.name?.toLowerCase().includes(searchTerm);
            const matchBrand = product.brand?.toLowerCase().includes(searchTerm);
            const matchCategory = product.category?.toLowerCase().includes(searchTerm);
            const matchSubCategory = product.subCategory?.toLowerCase().includes(searchTerm);

            return matchName || matchBrand || matchCategory || matchSubCategory;
        });

        console.log('Search results:', results.length);
        return results;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
};

// Enhanced sorting function
const sortProducts = (products: Product[], sortBy: string): Product[] => {
    if (!products || !Array.isArray(products)) return [];
    const sorted = [...products];

    switch (sortBy) {
        case 'featured':
            return sorted.sort((a, b) => {
                if (a.featured !== b.featured) {
                    return b.featured ? 1 : -1;
                }
                return b.rating - a.rating;
            });
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'rating':
            return sorted.sort((a, b) => {
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                return b.reviewCount - a.reviewCount;
            });
        case 'newest':
            return sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
        case 'popularity':
            return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        case 'savings':
            return sorted.sort((a, b) => {
                const savingsA = a.originalPrice ? a.originalPrice - a.price : 0;
                const savingsB = b.originalPrice ? b.originalPrice - b.price : 0;
                return savingsB - savingsA;
            });
        default:
            return sorted;
    }
};

// Enhanced image source handler
const getImageSource = (product: Product) => {
    if (product.primaryImage?.uri) {
        return { uri: product.primaryImage.uri };
    }
    if (product.image) {
        return { uri: product.image };
    }
    return { uri: `https://via.placeholder.com/300x300/E5E7EB/9CA3AF?text=${encodeURIComponent(product.name?.substring(0, 10) || 'Product')}` };
};

// Enhanced category retrieval with debugging
const getAvailableCategories = () => {
    try {
        console.log('Available categories:', ALL_CATEGORIES?.length || 0);
        const categoryNames = (ALL_CATEGORIES || []).map(category => category.name).filter(Boolean);
        console.log('Category names:', categoryNames);

        return [
            'All',
            ...categoryNames,
            'Sale Items',
            'Trending',
            'New Arrivals',
            'Featured'
        ];
    } catch (error) {
        console.error('Error getting categories:', error);
        return ['All'];
    }
};

// Enhanced filter function with better parameter handling and debugging
const filterProductsByParams = (
    products: Product[],
    params: Record<string, string | string[]>
): Product[] => {
    try {
        let filtered = [...(products || [])];
        console.log('filterProductsByParams input:', products.length, 'products');
        console.log('filterProductsByParams params:', params);

        // Price range filter
        if (params.priceMin || params.priceMax) {
            const minPrice = params.priceMin ? parseFloat(params.priceMin as string) : 0;
            const maxPrice = params.priceMax ? parseFloat(params.priceMax as string) : Infinity;
            console.log('Applying price filter:', minPrice, 'to', maxPrice);
            filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
            console.log('After price filter:', filtered.length);
        }

        // Rating filter
        if (params.rating) {
            const minRating = parseFloat(params.rating as string);
            console.log('Applying rating filter:', minRating);
            filtered = filtered.filter(p => p.rating >= minRating);
            console.log('After rating filter:', filtered.length);
        }

        // Brand filter
        if (params.brands && params.brands.length > 0) {
            const brands = Array.isArray(params.brands) ? params.brands : [params.brands];
            console.log('Applying brand filter:', brands);
            filtered = filtered.filter(p => brands.includes(p.brand));
            console.log('After brand filter:', filtered.length);
        }

        // Feature filters - only apply if explicitly set to 'true'
        if (params.inStock === 'true') {
            console.log('Applying inStock filter');
            filtered = filtered.filter(p => p.inStock);
            console.log('After inStock filter:', filtered.length);
        }
        if (params.onSale === 'true') {
            console.log('Applying onSale filter');
            filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
            console.log('After onSale filter:', filtered.length);
        }
        if (params.featured === 'true') {
            console.log('Applying featured filter');
            filtered = filtered.filter(p => p.featured);
            console.log('After featured filter:', filtered.length);
        }
        if (params.freeShipping === 'true') {
            console.log('Applying freeShipping filter');
            filtered = filtered.filter(p => p.freeShipping);
            console.log('After freeShipping filter:', filtered.length);
        }

        console.log('filterProductsByParams output:', filtered.length, 'products');
        return filtered;
    } catch (error) {
        console.error('Error filtering products:', error);
        return products || [];
    }
};

const categories = getAvailableCategories();

const sortOptions = [
    { id: 'featured', label: 'Featured', icon: 'star' },
    { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'rating', label: 'Customer Rating', icon: 'star-half' },
    { id: 'newest', label: 'Newest First', icon: 'time' },
    { id: 'popularity', label: 'Most Popular', icon: 'trending-up' },
    { id: 'savings', label: 'Best Savings', icon: 'pricetag' },
];

export default function ProductsScreen(): JSX.Element {
    const {
        filter,
        category: categoryParam,
        search,
        sort,
        categories: categoriesParam,
        brands: brandsParam,
        priceMin,
        priceMax,
        rating,
        inStock,
        onSale,
        featured,
        freeShipping,
    } = useLocalSearchParams<{
        filter?: string;
        category?: string;
        search?: string;
        sort?: string;
        categories?: string;
        brands?: string;
        priceMin?: string;
        priceMax?: string;
        rating?: string;
        inStock?: string;
        onSale?: string;
        featured?: string;
        freeShipping?: string;
    }>();

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [sortOrder, setSortOrder] = useState('featured');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    // Memoized URL filters
    const urlFilters = useMemo(() => {
        return {
            categories: categoriesParam?.split(',') || [],
            brands: brandsParam?.split(',') || [],
            priceMin,
            priceMax,
            rating,
            inStock,
            onSale,
            featured,
            freeShipping,
        };
    }, [categoriesParam, brandsParam, priceMin, priceMax, rating, inStock, onSale, featured, freeShipping]);

    // Debug data availability on mount
    useEffect(() => {
        console.log('=== PRODUCT DATA DEBUG ===');
        console.log('ALL_PRODUCTS available:', !!ALL_PRODUCTS);
        console.log('ALL_PRODUCTS length:', ALL_PRODUCTS?.length || 0);
        console.log('ALL_CATEGORIES available:', !!ALL_CATEGORIES);
        console.log('ALL_CATEGORIES length:', ALL_CATEGORIES?.length || 0);

        if (ALL_PRODUCTS?.length > 0) {
            console.log('First product sample:', {
                id: ALL_PRODUCTS[0]?.id,
                name: ALL_PRODUCTS[0]?.name,
                category: ALL_PRODUCTS[0]?.category,
                price: ALL_PRODUCTS[0]?.price
            });
        }

        if (ALL_CATEGORIES?.length > 0) {
            console.log('First category sample:', {
                id: ALL_CATEGORIES[0]?.id,
                name: ALL_CATEGORIES[0]?.name,
                slug: ALL_CATEGORIES[0]?.slug,
                productCount: ALL_CATEGORIES[0]?.products?.length || 0
            });
        }
        console.log('========================');
    }, []);

    // Initialize state based on URL params
    useEffect(() => {
        try {
            // Set initial category
            if (categoryParam) {
                const matchingCategory = ALL_CATEGORIES?.find(cat =>
                    cat.slug === categoryParam || cat.name.toLowerCase().replace(/\s+/g, '-') === categoryParam
                );
                if (matchingCategory) {
                    setSelectedCategory(matchingCategory.name);
                }
            } else if (urlFilters.categories.length > 0) {
                const firstCategory = ALL_CATEGORIES?.find(cat =>
                    urlFilters.categories.includes(cat.slug)
                );
                setSelectedCategory(firstCategory?.name || 'All');
            } else if (filter) {
                switch (filter) {
                    case 'flash-deals':
                    case 'summer-deals':
                    case 'sale':
                        setSelectedCategory('Sale Items');
                        break;
                    case 'trending':
                        setSelectedCategory('Trending');
                        break;
                    case 'new-arrivals':
                        setSelectedCategory('New Arrivals');
                        break;
                    case 'featured':
                        setSelectedCategory('Featured');
                        break;
                    default:
                        setSelectedCategory('All');
                }
            }

            // Set initial sort order
            if (sort && sortOptions.find(opt => opt.id === sort)) {
                setSortOrder(sort);
            }

            // Set search query
            if (search) {
                setSearchQuery(search);
            }
        } catch (error) {
            console.error('Error initializing state:', error);
        }
    }, [categoryParam, filter, search, sort, urlFilters]);

    // Enhanced product filtering and sorting with better debugging
    useEffect(() => {
        const filterProducts = async () => {
            setIsLoading(true);
            try {
                console.log('=== FILTERING PRODUCTS ===');
                console.log('Starting with ALL_PRODUCTS:', ALL_PRODUCTS?.length || 0);

                // Start with all products
                let products: Product[] = [...(ALL_PRODUCTS || [])];
                console.log('Initial products count:', products.length);

                // Apply search filter first
                if (searchQuery?.trim()) {
                    console.log('Applying search filter for:', searchQuery);
                    products = searchProducts(searchQuery.trim());
                    console.log('After search filter:', products.length);
                }

                // Apply URL filters
                products = filterProductsByParams(products, urlFilters);
                console.log('After URL filters:', products.length);

                // Apply category filter
                if (selectedCategory === 'All') {
                    console.log('Showing all products');
                    // Keep current products
                } else if (selectedCategory === 'Sale Items') {
                    console.log('Filtering for Sale Items');
                    const saleProducts = getAllSaleProducts();
                    console.log('Sale products available:', saleProducts.length);
                    products = products.filter(p => saleProducts.some(sp => sp.id === p.id));
                } else if (selectedCategory === 'Trending') {
                    console.log('Filtering for Trending products');
                    const trendingProducts = getAllTrendingProducts();
                    console.log('Trending products available:', trendingProducts.length);
                    products = products.filter(p => trendingProducts.some(tp => tp.id === p.id));
                } else if (selectedCategory === 'New Arrivals') {
                    console.log('Filtering for New Arrivals');
                    const newProducts = getNewArrivals();
                    console.log('New arrivals available:', newProducts.length);
                    products = products.filter(p => newProducts.some(np => np.id === p.id));
                } else if (selectedCategory === 'Featured') {
                    console.log('Filtering for Featured products');
                    const featuredProducts = getAllFeaturedProducts();
                    console.log('Featured products available:', featuredProducts.length);
                    products = products.filter(p => featuredProducts.some(fp => fp.id === p.id));
                } else {
                    console.log('Filtering by category:', selectedCategory);
                    // FIX: Normalize category comparison to handle case mismatch
                    const categorySlug = selectedCategory.toLowerCase().replace(/\s+/g, '-');
                    console.log('Looking for category slug:', categorySlug);

                    // First try: direct category field matching with normalization
                    products = products.filter(p => {
                        const productCategory = p.category?.toLowerCase();
                        const normalizedSelected = selectedCategory.toLowerCase();

                        console.log('Comparing product category:', productCategory, 'with selected:', normalizedSelected);

                        return productCategory === categorySlug ||
                            productCategory === normalizedSelected ||
                            productCategory?.replace(/\s+/g, '-') === categorySlug ||
                            productCategory?.replace(/\s+/g, '') === normalizedSelected.replace(/\s+/g, '');
                    });

                    console.log('After direct category filter:', products.length);

                    // If no products found, try using category entry as fallback
                    if (products.length === 0) {
                        console.log('No products found with direct filter, trying category entry fallback');
                        products = [...(ALL_PRODUCTS || [])]; // Reset to all products

                        const categoryEntry = ALL_CATEGORIES?.find(cat =>
                            cat.name?.toLowerCase() === selectedCategory.toLowerCase()
                        );
                        console.log('Found category entry:', categoryEntry?.name, 'with slug:', categoryEntry?.slug);

                        if (categoryEntry) {
                            try {
                                const categoryProducts = getProductsByCategory?.(categoryEntry.slug) || [];
                                console.log('Category products from getProductsByCategory:', categoryProducts.length);

                                if (categoryProducts.length > 0) {
                                    products = products.filter(p => categoryProducts.some(cp => cp.id === p.id));
                                } else if (categoryEntry.products) {
                                    console.log('Fallback to category.products:', categoryEntry.products.length);
                                    products = products.filter(p => categoryEntry.products.some(cp => cp.id === p.id));
                                }
                            } catch (error) {
                                console.error('Error getting category products:', error);
                                // Final fallback: filter by category field with entry slug
                                products = products.filter(p =>
                                    p.category?.toLowerCase() === categoryEntry.slug?.toLowerCase()
                                );
                            }
                        }
                    }
                }

                console.log('After category filter:', products.length);

                // Apply sorting
                products = sortProducts(products, sortOrder);
                console.log('Final products after sorting:', products.length);
                console.log('===========================');

                setFilteredProducts(products);
            } catch (error) {
                console.error('Error filtering products:', error);
                setFilteredProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        filterProducts();
    }, [selectedCategory, searchQuery, sortOrder, urlFilters]);

    // Calculate cart summary
    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    // Enhanced add to cart with better error handling
    const handleAddToCart = useCallback(async (product: Product) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const cartItem = {
                productId: product.id,
                name: product.name,
                brand: product.brand || '',
                price: product.price,
                originalPrice: product.originalPrice,
                quantity: 1,
                maxQuantity: product.maxQuantity || 99,
                minQuantity: product.minQuantity || 1,
                image: getImageSource(product).uri,
                category: product.category,
                sku: product.sku || product.id,
                status: product.status || (product.inStock ? 'available' : 'out_of_stock'),
                storeId: product.storeId || 'walmart-main',
                storeName: product.storeName || 'Walmart Supercenter',
                delivery: product.delivery || {
                    option: 'pickup' as const,
                    freeShippingEligible: product.freeShipping || false,
                },
            };

            const success = await addItem(cartItem);

            if (success) {
                Alert.alert(
                    'Added to Cart',
                    `${product.name} has been added to your cart.`,
                    [
                        { text: 'Continue Shopping', style: 'cancel' },
                        { text: 'View Cart', onPress: () => router.push('/(modals)/cart') }
                    ]
                );
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart. Please try again.');
        }
    }, [addItem]);

    const updateQuantity = useCallback(async (productId: string, change: number) => {
        try {
            const existingItem = cartItems.find(item => item.productId === productId);
            if (!existingItem) return;

            const newQuantity = existingItem.quantity + change;

            if (newQuantity <= 0) {
                await removeItem(existingItem.id);
            } else {
                await updateItemQuantity(existingItem.id, newQuantity);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }, [cartItems, updateItemQuantity, removeItem]);

    const getQuantityInCart = useCallback((productId: string): number => {
        const item = cartItems.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    }, [cartItems]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, []);

    const handleFiltersPress = useCallback(() => {
        try {
            // Navigate to categories page for filtering
            router.push('/(tabs)/categories');
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to open filters');
        }
    }, []);

    const handleNavigation = useCallback((route: string) => {
        try {
            router.push(route as any);
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate');
        }
    }, []);

    const renderCategoryTab = useCallback(({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.categoryTab,
                selectedCategory === item && styles.categoryTabActive
            ]}
            onPress={() => {
                Haptics.selectionAsync();
                setSelectedCategory(item);
            }}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.categoryTabText,
                selectedCategory === item && styles.categoryTabTextActive
            ]}>
                {item}
            </Text>
        </TouchableOpacity>
    ), [selectedCategory]);

    // Enhanced product card renderer
    const renderProduct = useCallback(({ item }: { item: Product }) => {
        if (!item || !item.id) return null;

        const quantityInCart = getQuantityInCart(item.id);
        const hasDiscount = item.originalPrice && item.originalPrice > item.price;
        const discountPercent = hasDiscount
            ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
            : 0;

        if (viewMode === 'list') {
            return (
                <TouchableOpacity
                    style={styles.productCardList}
                    onPress={() => handleNavigation(`/product/${item.id}`)}
                    activeOpacity={0.9}
                >
                    <View style={styles.productImageContainerList}>
                        <Image
                            source={getImageSource(item)}
                            style={[styles.productImageList, !item.inStock && styles.productImageFaded]}
                            resizeMode="cover"
                        />

                        {hasDiscount && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                            </View>
                        )}

                        {!item.inStock && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>Out of Stock</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.productInfoList}>
                        <Text style={styles.productNameList} numberOfLines={2}>
                            {item.name}
                        </Text>

                        <Text style={styles.productBrandList}>
                            by {item.brand || 'Walmart'}
                        </Text>

                        <View style={styles.productRating}>
                            <View style={styles.starsContainer}>
                                {[...Array(5)].map((_, i) => (
                                    <Ionicons
                                        key={i}
                                        name="star"
                                        size={12}
                                        color={i < Math.floor(item.rating) ? COLORS.warning : COLORS.gray300}
                                    />
                                ))}
                            </View>
                            <Text style={styles.productRatingText}>
                                {item.rating.toFixed(1)} ({item.reviewCount.toLocaleString()})
                            </Text>
                        </View>

                        <View style={styles.productPricing}>
                            <Text style={styles.productPrice}>
                                ${item.price.toFixed(2)}
                            </Text>
                            {hasDiscount && (
                                <Text style={styles.productOriginalPrice}>
                                    ${item.originalPrice!.toFixed(2)}
                                </Text>
                            )}
                        </View>

                        {item.freeShipping && (
                            <View style={styles.freeShippingBadge}>
                                <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                                <Text style={styles.freeShippingText}>Free shipping</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.productActionsList}>
                        {item.inStock ? (
                            quantityInCart === 0 ? (
                                <TouchableOpacity
                                    style={styles.addToCartButtonList}
                                    onPress={() => handleAddToCart(item)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="add" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.quantityControlsList}>
                                    <TouchableOpacity
                                        style={styles.quantityButtonList}
                                        onPress={() => updateQuantity(item.id, -1)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="remove" size={16} color={COLORS.white} />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityTextList}>{quantityInCart}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButtonList}
                                        onPress={() => updateQuantity(item.id, 1)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="add" size={16} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            )
                        ) : (
                            <View style={styles.outOfStockButtonList}>
                                <Text style={styles.outOfStockButtonText}>Out of Stock</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            );
        }

        // Grid view
        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleNavigation(`/product/${item.id}`)}
                activeOpacity={0.9}
            >
                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                    </View>
                )}

                {!item.inStock && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}

                <Image
                    source={getImageSource(item)}
                    style={[styles.productImage, !item.inStock && styles.productImageFaded]}
                    resizeMode="cover"
                />

                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    <Text style={styles.productBrand}>
                        by {item.brand || 'Walmart'}
                    </Text>

                    <View style={styles.productRating}>
                        <View style={styles.starsContainer}>
                            {[...Array(5)].map((_, i) => (
                                <Ionicons
                                    key={i}
                                    name="star"
                                    size={12}
                                    color={i < Math.floor(item.rating) ? COLORS.warning : COLORS.gray300}
                                />
                            ))}
                        </View>
                        <Text style={styles.productRatingText}>
                            {item.rating.toFixed(1)} ({item.reviewCount})
                        </Text>
                    </View>

                    <View style={styles.productPricing}>
                        <Text style={styles.productPrice}>
                            ${item.price.toFixed(2)}
                        </Text>
                        {hasDiscount && (
                            <Text style={styles.productOriginalPrice}>
                                ${item.originalPrice!.toFixed(2)}
                            </Text>
                        )}
                    </View>

                    {item.freeShipping && (
                        <View style={styles.freeShippingBadge}>
                            <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                            <Text style={styles.freeShippingText}>Free shipping</Text>
                        </View>
                    )}

                    {item.inStock ? (
                        quantityInCart === 0 ? (
                            <TouchableOpacity
                                style={styles.addToCartButton}
                                onPress={() => handleAddToCart(item)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={16} color={COLORS.white} />
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, -1)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="remove" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantityInCart}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, 1)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View style={styles.outOfStockButton}>
                            <Text style={styles.outOfStockButtonText}>Out of Stock</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [viewMode, getQuantityInCart, handleAddToCart, updateQuantity, handleNavigation]);

    const getHeaderTitle = () => {
        if (searchQuery) return `Search: "${searchQuery}"`;
        if (selectedCategory === 'All') return 'All Products';
        return selectedCategory;
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (urlFilters.categories.length > 0) count++;
        if (urlFilters.brands.length > 0) count++;
        if (urlFilters.priceMin || urlFilters.priceMax) count++;
        if (urlFilters.rating) count++;
        if (urlFilters.inStock === 'true') count++;
        if (urlFilters.onSale === 'true') count++;
        if (urlFilters.featured === 'true') count++;
        if (urlFilters.freeShipping === 'true') count++;
        return count;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Enhanced Header */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredProducts.length.toLocaleString()} items
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => handleNavigation('/(modals)/cart')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="cart-outline" size={24} color={COLORS.white} />
                    {summary.itemCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>
                                {summary.itemCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </LinearGradient>

            {/* Enhanced Search bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={COLORS.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        placeholderTextColor={COLORS.gray400}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Enhanced Filter and controls bar */}
            <View style={styles.controlsBar}>
                <View style={styles.categoryTabs}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryTab}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryTabsContent}
                    />
                </View>

                <View style={styles.filtersRow}>
                    <TouchableOpacity
                        style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
                        onPress={handleFiltersPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="options" size={16} color={getActiveFiltersCount() > 0 ? COLORS.white : COLORS.primary} />
                        <Text style={[styles.filterButtonText, getActiveFiltersCount() > 0 && styles.filterButtonTextActive]}>
                            Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => {
                            const currentIndex = sortOptions.findIndex(opt => opt.id === sortOrder);
                            const nextIndex = (currentIndex + 1) % sortOptions.length;
                            setSortOrder(sortOptions[nextIndex].id);
                            Haptics.selectionAsync();
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={sortOptions.find(opt => opt.id === sortOrder)?.icon as any || 'swap-vertical'} size={16} color={COLORS.primary} />
                        <Text style={styles.sortButtonText}>
                            {sortOptions.find(opt => opt.id === sortOrder)?.label || 'Sort'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.viewToggle}
                        onPress={() => {
                            setViewMode(viewMode === 'grid' ? 'list' : 'grid');
                            Haptics.selectionAsync();
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={viewMode === 'grid' ? 'list' : 'grid'}
                            size={20}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Enhanced Results and loading state */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            ) : filteredProducts.length > 0 ? (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    key={viewMode}
                    contentContainerStyle={[
                        styles.productsContainer,
                        viewMode === 'list' && styles.productsContainerList
                    ]}
                    columnWrapperStyle={viewMode === 'grid' ? styles.productRow : undefined}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListHeaderComponent={() => (
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsText}>
                                {filteredProducts.length.toLocaleString()} {filteredProducts.length === 1 ? 'product' : 'products'} found
                            </Text>
                            {getActiveFiltersCount() > 0 && (
                                <TouchableOpacity
                                    style={styles.clearFiltersButton}
                                    onPress={() => {
                                        handleNavigation(searchQuery ? '/(tabs)/search' : '/product');
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={64} color={COLORS.gray400} />
                    <Text style={styles.emptyStateTitle}>No products found</Text>
                    <Text style={styles.emptyStateText}>
                        {searchQuery
                            ? `No results for "${searchQuery}". Try different keywords or browse categories.`
                            : 'Try adjusting your filters or search terms.'
                        }
                    </Text>
                    <View style={styles.emptyStateActions}>
                        {searchQuery && (
                            <TouchableOpacity
                                style={styles.emptyActionButton}
                                onPress={() => setSearchQuery('')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.emptyActionButtonText}>Clear Search</Text>
                            </TouchableOpacity>
                        )}
                        {getActiveFiltersCount() > 0 && (
                            <TouchableOpacity
                                style={styles.emptyActionButton}
                                onPress={() => handleNavigation('/product')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.emptyActionButtonText}>Clear All Filters</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.emptyActionButton, styles.emptyActionButtonPrimary]}
                            onPress={() => {
                                console.log('Browse All Products clicked');
                                setSelectedCategory('All');
                                setSearchQuery('');
                                setSortOrder('featured');
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.emptyActionButtonText, styles.emptyActionButtonTextPrimary]}>
                                Browse All Products
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.emptyActionButton}
                            onPress={() => {
                                console.log('Browse Categories clicked');
                                handleNavigation('/(tabs)/categories');
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.emptyActionButtonText}>Browse Categories</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Enhanced Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        position: 'relative',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 16,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    cartBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: COLORS.error,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },

    // Enhanced Search container
    searchContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.gray900,
        fontWeight: '500',
    },

    // Enhanced Controls bar
    controlsBar: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    categoryTabs: {
        paddingVertical: 12,
    },
    categoryTabsContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        borderWidth: 1,
        borderColor: 'transparent',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    categoryTabActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    categoryTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray600,
    },
    categoryTabTextActive: {
        color: COLORS.white,
    },

    filtersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        backgroundColor: COLORS.gray50,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        gap: 6,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    filterButtonTextActive: {
        color: COLORS.white,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        flex: 1,
        gap: 6,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sortButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        flex: 1,
    },
    viewToggle: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.gray600,
        fontWeight: '500',
    },

    // Results header
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    resultsText: {
        fontSize: 16,
        color: COLORS.gray700,
        fontWeight: '600',
    },
    clearFiltersButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: COLORS.gray100,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    clearFiltersText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Enhanced Products container
    productsContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    productsContainerList: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingBottom: 100,
    },
    productRow: {
        justifyContent: 'space-between',
        gap: 12,
    },

    // Enhanced Product card grid
    productCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        width: (screenWidth - 44) / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: COLORS.gray100,
    },
    productImageFaded: {
        opacity: 0.5,
    },
    productInfo: {
        flex: 1,
        gap: 6,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray900,
        lineHeight: 18,
        minHeight: 36,
    },
    productBrand: {
        fontSize: 12,
        color: COLORS.gray600,
        fontWeight: '500',
    },

    // Enhanced Product card list
    productCardList: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    productImageContainerList: {
        position: 'relative',
    },
    productImageList: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: COLORS.gray100,
    },
    productInfoList: {
        flex: 1,
        gap: 4,
        paddingRight: 8,
    },
    productNameList: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray900,
        lineHeight: 20,
    },
    productBrandList: {
        fontSize: 14,
        color: COLORS.gray600,
        fontWeight: '500',
    },
    productActionsList: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },

    // Badges and overlays
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.error,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        zIndex: 10,
        elevation: 3,
        shadowColor: COLORS.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        zIndex: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    outOfStockText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Rating and pricing
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 1,
    },
    productRatingText: {
        fontSize: 11,
        color: COLORS.gray500,
        fontWeight: '500',
    },
    productPricing: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.success,
    },
    productOriginalPrice: {
        fontSize: 12,
        color: COLORS.gray400,
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },

    // Free shipping badge
    freeShippingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.gray50,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    freeShippingText: {
        fontSize: 10,
        color: COLORS.success,
        fontWeight: '600',
    },

    // Enhanced Add to cart buttons
    addToCartButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 4,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    addToCartButtonList: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    addToCartText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 12,
    },

    // Enhanced Quantity controls
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        gap: 8,
        marginTop: 4,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    quantityControlsList: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 4,
        gap: 4,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    quantityButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonList: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
        minWidth: 20,
        textAlign: 'center',
    },
    quantityTextList: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
        minWidth: 24,
        textAlign: 'center',
    },

    // Out of stock states
    outOfStockButton: {
        backgroundColor: COLORS.gray400,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    outOfStockButtonList: {
        backgroundColor: COLORS.gray400,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 12,
    },

    // Enhanced Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.gray900,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: COLORS.gray600,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        maxWidth: 300,
        fontWeight: '500',
    },
    emptyStateActions: {
        width: '100%',
        gap: 12,
    },
    emptyActionButton: {
        backgroundColor: COLORS.gray100,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray200,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    emptyActionButtonPrimary: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    emptyActionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray700,
    },
    emptyActionButtonTextPrimary: {
        color: COLORS.white,
    },
});