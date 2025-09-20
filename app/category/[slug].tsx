import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Animated,
    Dimensions,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import unified system
import { useCartStore } from '../../store/slices/cartSlice';
import {
    getProductsByCategory,
    ALL_CATEGORIES,
    ALL_PRODUCTS,
    Product,
    Category
} from '../../constants/products/data';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Customer Rating' },
    { id: 'newest', label: 'Newest First' },
    { id: 'reviews', label: 'Most Reviewed' },
];

// Enhanced helper functions
const getCategoryBySlug = (slug: string): Category | null => {
    if (!slug || !ALL_CATEGORIES) return null;
    return ALL_CATEGORIES.find(cat => cat.slug === slug) || null;
};

const sortProducts = (products: Product[], sortBy: string): Product[] => {
    if (!products || !Array.isArray(products)) return [];
    const sorted = [...products];

    switch (sortBy) {
        case 'featured':
            return sorted.sort((a, b) => {
                const aFeatured = a.featured ? 1 : 0;
                const bFeatured = b.featured ? 1 : 0;
                if (bFeatured !== aFeatured) return bFeatured - aFeatured;
                return b.rating - a.rating;
            });
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'newest':
            return sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
        case 'reviews':
            return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
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
    // Fallback placeholder
    return { uri: `https://via.placeholder.com/300x300/E5E7EB/9CA3AF?text=${encodeURIComponent(product.name.substring(0, 10))}` };
};

export default function CategoryPage(): JSX.Element {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('featured');
    const [showSortModal, setShowSortModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const sortModalAnim = useRef(new Animated.Value(screenHeight)).current;

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);

    // Memoize category to prevent unnecessary re-renders
    const category = useMemo(() => {
        return getCategoryBySlug(slug || '');
    }, [slug]);

    // Enhanced product loading with better error handling
    const loadProducts = useCallback(async () => {
        if (!slug) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            console.log('Loading products for category:', slug);

            // Get products from unified system
            let categoryProducts: Product[] = [];

            if (slug === 'all' || slug === 'browse') {
                // Handle "Browse All Products" case
                categoryProducts = ALL_PRODUCTS || [];
            } else {
                categoryProducts = getProductsByCategory(slug) || [];
            }

            // Filter out invalid products
            const validProducts = categoryProducts.filter(product =>
                product &&
                typeof product === 'object' &&
                product.id &&
                product.name &&
                product.price !== undefined
            );

            // Apply initial sorting
            const sortedProducts = sortProducts(validProducts, sortBy);

            console.log(`Found ${sortedProducts.length} valid products for category: ${category?.name || slug}`);
            setProducts(sortedProducts);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [slug, sortBy, category?.name]);

    // Load products when component mounts or slug changes
    useEffect(() => {
        if (slug) {
            loadProducts();

            // Entrance animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [slug, loadProducts]);

    // Sort modal animation
    useEffect(() => {
        if (showSortModal) {
            Animated.spring(sortModalAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(sortModalAnim, {
                toValue: screenHeight,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [showSortModal]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    }, [loadProducts]);

    const handleSort = useCallback((sortOption: string) => {
        setSortBy(sortOption);
        setShowSortModal(false);

        // Apply sorting to current products
        const sortedProducts = sortProducts(products, sortOption);
        setProducts(sortedProducts);

        console.log('Sorting by:', sortOption);
    }, [products]);

    const handleAddToCart = useCallback(async (product: Product) => {
        try {
            const cartItem = {
                productId: product.id,
                name: product.name,
                brand: product.brand || '',
                price: product.price,
                originalPrice: product.originalPrice,
                quantity: 1,
                maxQuantity: product.maxQuantity || 10,
                minQuantity: product.minQuantity || 1,
                image: getImageSource(product).uri,
                category: product.category,
                sku: product.sku || product.id,
                status: product.status || 'available',
                storeId: product.storeId || 'walmart-main',
                storeName: product.storeName || 'Walmart Supercenter',
                delivery: product.delivery || {
                    option: 'pickup' as const,
                    freeShippingEligible: product.freeShipping || false,
                },
            };

            const success = await addItem(cartItem);
            if (success) {
                console.log('Added to cart:', product.name);
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

    const getBadgeColor = useCallback((badge: string) => {
        switch (badge) {
            case 'Best Seller':
                return '#EF4444';
            case 'New':
                return '#10B981';
            case 'Save $100':
            case 'Sale':
            case 'Hot Deal':
                return '#F59E0B';
            case 'Limited Stock':
                return '#8B5CF6';
            case 'Popular':
                return '#3B82F6';
            case 'Fresh':
                return '#059669';
            case 'Trending':
                return '#EC4899';
            case 'Editor\'s Choice':
                return '#6366F1';
            case 'Customer Favorite':
                return '#F97316';
            default:
                return '#6B7280';
        }
    }, []);

    // Enhanced navigation handlers
    const handleProductPress = useCallback((productId: string) => {
        try {
            router.push(`/product/${productId}`);
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate to product details');
        }
    }, []);

    const handleFilterPress = useCallback(() => {
        try {
            if (category) {
                router.push(`/product?category=${category.slug}`);
            } else {
                router.push('/product');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate to filters');
        }
    }, [category]);

    const handleBrowseAllPress = useCallback(() => {
        try {
            router.push('/product');
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate to products');
        }
    }, []);

    const renderProductGrid = useCallback(({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productGridCard}
            onPress={() => handleProductPress(item.id)}
            activeOpacity={0.8}
        >
            {item.badge && (
                <View style={[styles.productBadge, { backgroundColor: getBadgeColor(item.badge) }]}>
                    <Text style={styles.productBadgeText}>{item.badge}</Text>
                </View>
            )}
            <Image
                source={getImageSource(item)}
                style={styles.productGridImage}
                resizeMode="cover"
            />
            <View style={styles.productGridContent}>
                <Text style={styles.productGridName} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.productRating}>
                    <Ionicons name="star" size={12} color="#FCD34D" />
                    <Text style={styles.productRatingText}>
                        {item.rating.toFixed(1)} ({item.reviewCount})
                    </Text>
                </View>
                <View style={styles.productPriceContainer}>
                    <Text style={styles.productPrice}>
                        ${item.price.toFixed(2)}
                    </Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <Text style={styles.productOriginalPrice}>
                            ${item.originalPrice.toFixed(2)}
                        </Text>
                    )}
                </View>
                <Text style={styles.productShipping}>
                    {item.freeShipping || (item.shipping && item.shipping.free) ? 'FREE shipping' : `Shipping: $${item.shipping?.cost || 5.99}`}
                </Text>
                <Text style={styles.productSeller}>
                    Sold by {item.seller || 'Walmart'}
                </Text>
                {!item.inStock && (
                    <Text style={styles.productOutOfStock}>
                        Out of stock
                    </Text>
                )}

                {item.inStock && (
                    <TouchableOpacity
                        style={styles.quickAddButton}
                        onPress={() => handleAddToCart(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={14} color="#FFFFFF" />
                        <Text style={styles.quickAddText}>Add</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    ), [getBadgeColor, handleAddToCart, handleProductPress]);

    const renderProductList = useCallback(({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productListCard}
            onPress={() => handleProductPress(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.productListImageContainer}>
                <Image
                    source={getImageSource(item)}
                    style={styles.productListImage}
                    resizeMode="cover"
                />
                {item.badge && (
                    <View style={[styles.productListBadge, { backgroundColor: getBadgeColor(item.badge) }]}>
                        <Text style={styles.productBadgeText}>{item.badge}</Text>
                    </View>
                )}
            </View>
            <View style={styles.productListContent}>
                <Text style={styles.productListName} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.productRating}>
                    <Ionicons name="star" size={14} color="#FCD34D" />
                    <Text style={styles.productListRatingText}>
                        {item.rating.toFixed(1)} ({item.reviewCount} reviews)
                    </Text>
                </View>
                <View style={styles.productPriceContainer}>
                    <Text style={styles.productListPrice}>
                        ${item.price.toFixed(2)}
                    </Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <Text style={styles.productOriginalPrice}>
                            ${item.originalPrice.toFixed(2)}
                        </Text>
                    )}
                </View>
                <Text style={styles.productListShipping}>
                    {item.freeShipping || (item.shipping && item.shipping.free) ? 'FREE shipping' : `Shipping: $${item.shipping?.cost || 5.99}`}
                </Text>
                <Text style={styles.productListSeller}>
                    Sold by {item.seller || 'Walmart'}
                </Text>
                {!item.inStock && (
                    <Text style={styles.productListOutOfStock}>
                        Out of stock
                    </Text>
                )}
            </View>

            {item.inStock && (
                <TouchableOpacity
                    style={styles.listQuickAddButton}
                    onPress={() => handleAddToCart(item)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    ), [getBadgeColor, handleAddToCart, handleProductPress]);

    // Handle case where category is not found
    if (!isLoading && !category && slug !== 'all' && slug !== 'browse') {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.errorTitle}>
                    Category Not Found
                </Text>
                <Text style={styles.errorSubtitle}>
                    The category "{slug}" doesn't exist or couldn't be found.
                </Text>
                <Text style={styles.debugText}>
                    Available categories: {ALL_CATEGORIES?.map(cat => cat.name).join(', ') || 'Loading...'}
                </Text>
                <TouchableOpacity
                    style={styles.errorButton}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.errorButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Get display information for special cases
    const getDisplayInfo = () => {
        if (slug === 'all' || slug === 'browse') {
            return {
                name: 'All Products',
                color: '#3B82F6',
                icon: 'storefront' as const,
                itemCount: products.length
            };
        }
        return category || {
            name: 'Products',
            color: '#6B7280',
            icon: 'cube' as const,
            itemCount: products.length
        };
    };

    const displayInfo = getDisplayInfo();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            {displayInfo.name}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {products.length} products
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => router.push('/(modals)/cart')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cartIconContainer}>
                            <Ionicons name="bag-outline" size={24} color="#374151" />
                            {summary.itemCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{summary.itemCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View style={styles.heroContainer}>
                        <View style={[styles.heroGradient, { backgroundColor: displayInfo.color + '20' }]}>
                            <View style={styles.heroContent}>
                                <View style={[styles.heroIcon, { backgroundColor: displayInfo.color + '30' }]}>
                                    <Ionicons name={displayInfo.icon} size={32} color={displayInfo.color} />
                                </View>
                                <Text style={styles.heroTitle}>
                                    {displayInfo.name}
                                </Text>
                                <Text style={styles.heroSubtitle}>
                                    {slug === 'all' || slug === 'browse'
                                        ? 'Browse our complete collection of products'
                                        : `Discover amazing ${displayInfo.name.toLowerCase()} products`
                                    }
                                </Text>
                                <Text style={styles.heroItemCount}>
                                    {displayInfo.itemCount || products.length} items available
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.filterSortBar}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={handleFilterPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="filter" size={16} color="#374151" />
                            <Text style={styles.filterButtonText}>Filter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sortButton}
                            onPress={() => setShowSortModal(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sortButtonText}>
                                Sort: {sortOptions.find(option => option.id === sortBy)?.label}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#374151" />
                        </TouchableOpacity>

                        <View style={styles.viewModeToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.viewModeButton,
                                    viewMode === 'grid' && styles.viewModeButtonActive
                                ]}
                                onPress={() => setViewMode('grid')}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="grid"
                                    size={16}
                                    color={viewMode === 'grid' ? '#2563EB' : '#374151'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.viewModeButton,
                                    viewMode === 'list' && styles.viewModeButtonActive
                                ]}
                                onPress={() => setViewMode('list')}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="list"
                                    size={16}
                                    color={viewMode === 'list' ? '#2563EB' : '#374151'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text style={styles.loadingText}>Loading products...</Text>
                        </View>
                    ) : products.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyTitle}>
                                No Products Found
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                We couldn't find any products in this category. Check back soon!
                            </Text>
                            <TouchableOpacity
                                style={styles.browseAllButton}
                                onPress={handleBrowseAllPress}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.browseAllText}>Browse All Products</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.productsContainer}>
                            {viewMode === 'grid' ? (
                                <View style={styles.productGrid}>
                                    {products.map((item) => (
                                        <View key={item.id} style={styles.productGridWrapper}>
                                            {renderProductGrid({ item })}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.productList}>
                                    {products.map((item) => (
                                        <View key={item.id}>
                                            {renderProductList({ item })}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </Animated.View>

            <Modal
                visible={showSortModal}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowSortModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.sortModal,
                            {
                                transform: [{ translateY: sortModalAnim }]
                            }
                        ]}
                    >
                        <View style={styles.sortModalHeader}>
                            <Text style={styles.sortModalTitle}>Sort By</Text>
                            <TouchableOpacity
                                onPress={() => setShowSortModal(false)}
                                style={styles.sortModalCloseButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.sortOption}
                                onPress={() => handleSort(option.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.sortOptionText}>{option.label}</Text>
                                {sortBy === option.id && (
                                    <Ionicons name="checkmark" size={20} color="#2563EB" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
    },
    header: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 60,
    },
    backButton: {
        marginRight: 12,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 24,
    },
    headerSubtitle: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 2,
        fontWeight: '500',
    },
    cartButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
    },
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#EF4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cartBadgeText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '700',
    },
    scrollContainer: {
        flex: 1,
    },
    heroContainer: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    heroGradient: {
        padding: 32,
        borderRadius: 0,
    },
    heroContent: {
        alignItems: 'center',
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    heroTitle: {
        color: '#111827',
        fontWeight: '800',
        fontSize: 28,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 12,
        fontWeight: '500',
        maxWidth: 280,
    },
    heroItemCount: {
        color: '#374151',
        fontSize: 15,
        fontWeight: '600',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    filterSortBar: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterButtonText: {
        color: '#374151',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 15,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flex: 1,
        marginHorizontal: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sortButtonText: {
        color: '#374151',
        fontWeight: '600',
        marginRight: 8,
        fontSize: 15,
        flex: 1,
    },
    viewModeToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    viewModeButton: {
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 1,
    },
    viewModeButtonActive: {
        backgroundColor: '#EFF6FF',
        elevation: 2,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: '#ffffff',
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
        backgroundColor: '#ffffff',
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '500',
        maxWidth: 280,
    },
    browseAllButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        elevation: 3,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    browseAllText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    productsContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productGridWrapper: {
        width: '48%',
        marginBottom: 20,
    },
    productGridCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    productBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    productBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    productGridImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#F9FAFB',
    },
    productGridContent: {
        padding: 14,
    },
    productGridName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
        minHeight: 40,
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    productRatingText: {
        color: '#6B7280',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    productPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    productPrice: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 16,
    },
    productOriginalPrice: {
        color: '#9CA3AF',
        fontSize: 13,
        textDecorationLine: 'line-through',
        marginLeft: 8,
        fontWeight: '500',
    },
    productShipping: {
        color: '#059669',
        fontSize: 11,
        marginBottom: 4,
        fontWeight: '600',
    },
    productSeller: {
        color: '#6B7280',
        fontSize: 11,
        marginBottom: 12,
        fontWeight: '500',
    },
    productOutOfStock: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    quickAddButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        elevation: 2,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    quickAddText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
    },
    productList: {
        // Container for list view
    },
    productListCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        marginBottom: 16,
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    productListImageContainer: {
        position: 'relative',
    },
    productListImage: {
        width: 130,
        height: 130,
        backgroundColor: '#F9FAFB',
    },
    productListBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    productListContent: {
        flex: 1,
        padding: 16,
        paddingRight: 60,
    },
    productListName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 8,
    },
    productListRatingText: {
        color: '#6B7280',
        fontSize: 14,
        marginLeft: 4,
        fontWeight: '500',
    },
    productListPrice: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 18,
    },
    productListShipping: {
        color: '#059669',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    productListSeller: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '500',
    },
    productListOutOfStock: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    listQuickAddButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#2563EB',
        borderRadius: 24,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sortModal: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 34,
        maxHeight: screenHeight * 0.7,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    sortModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    sortModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    sortModalCloseButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#F9FAFB',
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    errorSubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
        fontWeight: '500',
    },
    debugText: {
        color: '#9CA3AF',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 32,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    errorButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        elevation: 3,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    errorButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
});