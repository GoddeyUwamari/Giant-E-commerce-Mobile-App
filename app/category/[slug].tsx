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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import unified system - FIXED IMPORTS
import { useCartStore } from '../../store/slices/cartSlice';
import {
    getProductsByCategory,
    CATEGORIES,
    Product
} from '../../constants/products';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Customer Rating' },
    { id: 'newest', label: 'Newest First' },
    { id: 'reviews', label: 'Most Reviewed' },
];

// FIXED: Create helper functions for category management
const getCategoryBySlug = (slug: string) => {
    const categoryKey = Object.keys(CATEGORIES).find(key => key === slug);
    if (!categoryKey) return null;

    const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES];
    return {
        ...category,
        slug: categoryKey,
        subcategories: category.subcategories || [],
        itemCount: category.products.length
    };
};

// FIXED: Create sorting function
const sortProducts = (products: Product[], sortBy: string): Product[] => {
    const sorted = [...products];

    switch (sortBy) {
        case 'featured':
            return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'newest':
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'reviews':
            return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        default:
            return sorted;
    }
};

export default function CategoryPage(): JSX.Element {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('featured');
    const [showSortModal, setShowSortModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const sortModalAnim = useRef(new Animated.Value(screenHeight)).current;

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);

    // ✅ FIXED: Memoize category to prevent object recreation
    const category = useMemo(() => {
        return getCategoryBySlug(slug || '');
    }, [slug]);

    // ✅ FIXED: loadProducts with proper dependencies and loading guard
    const loadProducts = useCallback(async () => {
        if (isLoading || !slug) return; // Prevent multiple calls

        setIsLoading(true);
        try {
            console.log('Loading products for category:', slug);

            // Get products from unified system
            const categoryProducts = getProductsByCategory(slug as keyof typeof CATEGORIES || 'electronics');

            // Apply initial sorting
            const sortedProducts = sortProducts(categoryProducts, sortBy);

            console.log('Found products:', sortedProducts.length, 'for category:', category?.name);
            setProducts(sortedProducts);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    }, [slug, sortBy, category?.name]);

    // ✅ FIXED: Only depend on slug, not category object
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

        // Use unified sorting system
        const sortedProducts = sortProducts(products, sortOption);
        setProducts(sortedProducts);

        console.log('Sorting by:', sortOption);
    }, [products]);

    const handleAddToCart = useCallback(async (product: Product) => {
        try {
            const success = await addItem({
                productId: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                originalPrice: product.originalPrice,
                quantity: 1,
                maxQuantity: product.maxQuantity,
                minQuantity: product.minQuantity,
                image: product.primaryImage,
                category: product.category,
                sku: product.sku,
                status: product.status,
                storeId: product.storeId,
                storeName: product.storeName,
                delivery: product.delivery,
            });

            if (success) {
                console.log('Added to cart:', product.name);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
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
                return '#F59E0B';
            case 'Limited Stock':
                return '#8B5CF6';
            case 'Popular':
                return '#3B82F6';
            case 'Fresh':
                return '#059669';
            case 'Trending':
                return '#EC4899';
            case 'Hot Deal':
                return '#F59E0B';
            default:
                return '#EF4444';
        }
    }, []);

    const renderProductGrid = useCallback(({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productGridCard}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.8}
        >
            {item.badge && (
                <View style={[styles.productBadge, { backgroundColor: getBadgeColor(item.badge) }]}>
                    <Text style={styles.productBadgeText}>{item.badge}</Text>
                </View>
            )}
            <Image
                source={item.primaryImage}
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
                        {item.rating} ({item.reviewCount})
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
                    {item.shipping.free ? 'FREE shipping' : `Shipping: $${item.shipping.cost}`}
                </Text>
                <Text style={styles.productSeller}>
                    Sold by {item.seller}
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
    ), [getBadgeColor, handleAddToCart]);

    const renderProductList = useCallback(({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productListCard}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.8}
        >
            <View style={styles.productListImageContainer}>
                <Image
                    source={item.primaryImage}
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
                        {item.rating} ({item.reviewCount} reviews)
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
                    {item.shipping.free ? 'FREE shipping' : `Shipping: $${item.shipping.cost}`}
                </Text>
                <Text style={styles.productListSeller}>
                    Sold by {item.seller}
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
    ), [getBadgeColor, handleAddToCart]);

    if (!category) {
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
                    Available categories: {Object.keys(CATEGORIES).join(', ')}
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
                            {category.name}
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
                        <View style={[styles.heroGradient, { backgroundColor: category.color + '20' }]}>
                            <View style={styles.heroContent}>
                                <View style={[styles.heroIcon, { backgroundColor: category.color + '30' }]}>
                                    <Ionicons name={category.icon} size={32} color={category.color} />
                                </View>
                                <Text style={styles.heroTitle}>
                                    {category.name}
                                </Text>
                                <Text style={styles.heroSubtitle}>
                                    Discover amazing {category.name.toLowerCase()} products
                                </Text>
                                <Text style={styles.heroItemCount}>
                                    {category.itemCount} items available
                                </Text>
                            </View>
                        </View>
                    </View>

                    {category.subcategories && category.subcategories.length > 0 && (
                        <View style={styles.subcategoriesContainer}>
                            <Text style={styles.subcategoriesTitle}>
                                Shop by Category
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.subcategoriesContent}>
                                    {category.subcategories.map((subcategory) => (
                                        <TouchableOpacity
                                            key={subcategory.id}
                                            style={styles.subcategoryItem}
                                            onPress={() => router.push(`/product?category=${category.slug}&subcategory=${subcategory.id}`)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.subcategoryIcon, { backgroundColor: category.color + '15' }]}>
                                                <Ionicons name={subcategory.icon || 'folder-outline'} size={24} color={category.color} />
                                            </View>
                                            <Text style={styles.subcategoryName}>
                                                {subcategory.name}
                                            </Text>
                                            <Text style={styles.subcategoryCount}>
                                                {subcategory.productCount || 0} items
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.filterSortBar}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => router.push(`/product?category=${category.slug}`)}
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
                                onPress={() => router.push('/product')}
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

// COMPLETE STYLES - FIXED
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
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        marginRight: 12,
        padding: 8,
        borderRadius: 8,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 2,
    },
    cartButton: {
        padding: 8,
    },
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollContainer: {
        flex: 1,
    },
    heroContainer: {
        backgroundColor: '#ffffff',
    },
    heroGradient: {
        padding: 24,
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
    },
    heroTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 28,
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 8,
    },
    heroItemCount: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
    },
    subcategoriesContainer: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    subcategoriesTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 12,
    },
    subcategoriesContent: {
        flexDirection: 'row',
        paddingRight: 16,
    },
    subcategoryItem: {
        alignItems: 'center',
        marginRight: 24,
        minWidth: 80,
    },
    subcategoryIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    subcategoryName: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 2,
    },
    subcategoryCount: {
        color: '#6B7280',
        fontSize: 12,
    },
    filterSortBar: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    filterButtonText: {
        color: '#374151',
        fontWeight: '500',
        marginLeft: 8,
        fontSize: 16,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    sortButtonText: {
        color: '#374151',
        fontWeight: '500',
        marginRight: 4,
        fontSize: 16,
    },
    viewModeToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    viewModeButton: {
        padding: 8,
        borderRadius: 6,
        marginHorizontal: 2,
    },
    viewModeButtonActive: {
        backgroundColor: '#EFF6FF',
        elevation: 1,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 8,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    browseAllButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    browseAllText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    productsContainer: {
        padding: 16,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productGridWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    productGridCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    productBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        zIndex: 1,
    },
    productBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    productGridImage: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    productGridContent: {
        padding: 12,
    },
    productGridName: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 18,
        marginBottom: 6,
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    productRatingText: {
        color: '#6B7280',
        fontSize: 12,
        marginLeft: 4,
    },
    productPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    productPrice: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 16,
    },
    productOriginalPrice: {
        color: '#9CA3AF',
        fontSize: 12,
        textDecorationLine: 'line-through',
        marginLeft: 6,
    },
    productShipping: {
        color: '#059669',
        fontSize: 11,
        marginBottom: 2,
    },
    productSeller: {
        color: '#6B7280',
        fontSize: 11,
        marginBottom: 8,
    },
    productOutOfStock: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
    },
    quickAddButton: {
        backgroundColor: '#2563EB',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    quickAddText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    productList: {
        // List container
    },
    productListCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 16,
        flexDirection: 'row',
        position: 'relative',
    },
    productListImageContainer: {
        position: 'relative',
    },
    productListImage: {
        width: 120,
        height: 120,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    productListBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        zIndex: 1,
    },
    productListContent: {
        flex: 1,
        padding: 12,
    },
    productListName: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 20,
        marginBottom: 6,
    },
    productListRatingText: {
        color: '#6B7280',
        fontSize: 14,
        marginLeft: 4,
    },
    productListPrice: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
    },
    productListShipping: {
        color: '#059669',
        fontSize: 12,
        marginBottom: 2,
    },
    productListSeller: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 8,
    },
    productListOutOfStock: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
    },
    listQuickAddButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: '#2563EB',
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sortModal: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
        maxHeight: screenHeight * 0.6,
    },
    sortModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    sortModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    sortModalCloseButton: {
        padding: 4,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#111827',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    debugText: {
        color: '#9CA3AF',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 24,
    },
    errorButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    errorButtonText: {
        color: '`#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
});