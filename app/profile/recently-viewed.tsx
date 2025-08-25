import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    Alert,
    ActivityIndicator,
    Animated,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import unified system - INTEGRATED
import { useCartStore } from '../../store/slices/cartSlice';
import {
    ALL_PRODUCTS,
    getProductById,
    getProductsByCategory,
    CATEGORIES,
    Product
} from '../../constants/products';
import { getProductImageBySize } from '../../assets/images/imageLoader';

// Enhanced colors - Walmart design system
const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    walmartYellow: '#FFC220',
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    borderColor: '#E5E7EB',
    cardBackground: '#FFFFFF',
    sectionBackground: '#F8F9FA',
};

// Recently viewed item interface - enhanced
interface RecentlyViewedItem {
    productId: string;
    viewedAt: string;
    viewCount: number;
    category: string;
    addedToCart?: boolean;
    lastCartAction?: string;
}

// Filter options - using real categories
const filterOptions = [
    { id: 'all', label: 'All Items', icon: 'grid-outline' },
    { id: 'today', label: 'Today', icon: 'today-outline' },
    { id: 'week', label: 'This Week', icon: 'calendar-outline' },
    { id: 'month', label: 'This Month', icon: 'calendar-outline' },
    ...Object.entries(CATEGORIES).map(([key, category]) => ({
        id: key,
        label: category.name,
        icon: category.icon,
    })),
];

// Storage key for recently viewed
const RECENTLY_VIEWED_KEY = 'recently_viewed_products';

export default function RecentlyViewedScreen() {
    const [recentlyViewedItems, setRecentlyViewedItems] = useState<RecentlyViewedItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState<{ [key: string]: boolean }>({});

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Zustand cart store - INTEGRATED
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    useEffect(() => {
        loadRecentlyViewed();
        calculateSummary();

        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    // Load recently viewed items from AsyncStorage and match with products
    const loadRecentlyViewed = async () => {
        try {
            setIsLoading(true);
            const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);

            if (stored) {
                const recentlyViewed: RecentlyViewedItem[] = JSON.parse(stored);
                setRecentlyViewedItems(recentlyViewed);

                // Match with actual products and filter out non-existent ones
                const matchedProducts = recentlyViewed
                    .map(item => {
                        const product = getProductById(item.productId);
                        return product ? { ...product, viewedAt: item.viewedAt, viewCount: item.viewCount } : null;
                    })
                    .filter(Boolean) as (Product & { viewedAt: string; viewCount: number })[];

                // Sort by most recently viewed
                matchedProducts.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());

                setProducts(matchedProducts);
            }
        } catch (error) {
            console.error('Error loading recently viewed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Save recently viewed item - utility function for other screens to use
    const saveRecentlyViewed = async (productId: string) => {
        try {
            const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
            let recentlyViewed: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

            // Check if product already exists
            const existingIndex = recentlyViewed.findIndex(item => item.productId === productId);
            const product = getProductById(productId);

            if (!product) return;

            const newItem: RecentlyViewedItem = {
                productId,
                viewedAt: new Date().toISOString(),
                viewCount: existingIndex >= 0 ? recentlyViewed[existingIndex].viewCount + 1 : 1,
                category: product.category,
            };

            if (existingIndex >= 0) {
                // Update existing item
                recentlyViewed[existingIndex] = newItem;
            } else {
                // Add new item to beginning
                recentlyViewed.unshift(newItem);
            }

            // Keep only last 50 items
            recentlyViewed = recentlyViewed.slice(0, 50);

            await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
        } catch (error) {
            console.error('Error saving recently viewed:', error);
        }
    };

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRecentlyViewed();
        setRefreshing(false);
    }, []);

    // Handle product press - track view and navigate
    const handleProductPress = async (productId: string) => {
        // Save this view
        await saveRecentlyViewed(productId);
        // Navigate to product
        router.push(`/product/${productId}`);
    };

    // Enhanced add to cart with real integration
    const handleAddToCart = useCallback(async (product: Product) => {
        setIsAddingToCart(prev => ({ ...prev, [product.id]: true }));

        try {
            const success = await addItem({
                productId: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                originalPrice: product.originalPrice,
                quantity: 1,
                maxQuantity: product.maxQuantity || 10,
                minQuantity: product.minQuantity || 1,
                image: product.primaryImage,
                category: product.category,
                sku: product.sku,
                status: product.status || 'available',
                storeId: product.storeId || 'store_001',
                storeName: product.storeName || 'Walmart Supercenter',
                delivery: product.delivery || {
                    option: 'pickup' as const,
                    freeShippingEligible: true,
                },
            });

            if (success) {
                // Update recently viewed to mark as added to cart
                const updatedItems = recentlyViewedItems.map(item =>
                    item.productId === product.id
                        ? { ...item, addedToCart: true, lastCartAction: new Date().toISOString() }
                        : item
                );
                setRecentlyViewedItems(updatedItems);
                await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedItems));

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
            Alert.alert('Error', 'Failed to add item to cart');
        } finally {
            setIsAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }
    }, [addItem, recentlyViewedItems]);

    // Enhanced remove item function
    const handleRemoveItem = (productId: string) => {
        const product = products.find(p => p.id === productId);
        Alert.alert(
            'Remove from Recently Viewed',
            `Remove "${product?.name}" from your viewing history?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedItems = recentlyViewedItems.filter(item => item.productId !== productId);
                            const updatedProducts = products.filter(p => p.id !== productId);

                            setRecentlyViewedItems(updatedItems);
                            setProducts(updatedProducts);

                            await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedItems));
                        } catch (error) {
                            console.error('Error removing item:', error);
                        }
                    },
                },
            ]
        );
    };

    // Enhanced clear all function
    const handleClearAll = () => {
        Alert.alert(
            'Clear Viewing History',
            'This will remove all products from your recently viewed list. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
                            setRecentlyViewedItems([]);
                            setProducts([]);
                        } catch (error) {
                            console.error('Error clearing history:', error);
                        }
                    },
                },
            ]
        );
    };

    // Enhanced filtering using real categories
    const getFilteredProducts = useMemo(() => {
        let filtered = [...products];

        switch (selectedFilter) {
            case 'today':
                const today = new Date().toDateString();
                filtered = filtered.filter(item =>
                    new Date(item.viewedAt).toDateString() === today
                );
                break;
            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filtered = filtered.filter(item =>
                    new Date(item.viewedAt) >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                filtered = filtered.filter(item =>
                    new Date(item.viewedAt) >= monthAgo
                );
                break;
            default:
                // Check if it's a category filter
                if (selectedFilter !== 'all' && CATEGORIES[selectedFilter as keyof typeof CATEGORIES]) {
                    filtered = filtered.filter(item => item.category === selectedFilter);
                }
                break;
        }

        return filtered;
    }, [products, selectedFilter]);

    // Enhanced time formatting
    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const viewed = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

        return viewed.toLocaleDateString();
    };

    // Check if product is in cart
    const isInCart = (productId: string) => {
        return cartItems.some(item => item.productId === productId);
    };

    // Enhanced grid item renderer with real product integration
    const renderGridItem = ({ item }: { item: Product & { viewedAt: string; viewCount: number } }) => (
        <Animated.View
            style={[
                styles.gridItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <TouchableOpacity
                style={styles.gridItemContent}
                onPress={() => handleProductPress(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={getProductImageBySize(item.id, 'medium')}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    {item.badge && (
                        <View style={[styles.discountBadge, { backgroundColor: item.badgeColor || COLORS.error }]}>
                            <Text style={styles.discountText}>{item.badge}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item.id)}
                    >
                        <Ionicons name="close" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                    {item.viewCount > 1 && (
                        <View style={styles.viewCountBadge}>
                            <Text style={styles.viewCountText}>{item.viewCount}x</Text>
                        </View>
                    )}
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.warning} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        <Text style={styles.reviewText}>({item.reviewCount})</Text>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                        )}
                    </View>

                    <Text style={styles.shippingInfo}>
                        {item.shipping?.free ? 'FREE shipping' : 'Standard shipping'}
                    </Text>

                    <Text style={styles.viewedTime}>{formatTimeAgo(item.viewedAt)}</Text>

                    {isInCart(item.id) ? (
                        <View style={styles.inCartButton}>
                            <Ionicons name="checkmark" size={14} color={COLORS.success} />
                            <Text style={styles.inCartText}>In Cart</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.addToCartButton,
                                !item.inStock && styles.addToCartButtonDisabled,
                                isAddingToCart[item.id] && styles.addToCartButtonLoading
                            ]}
                            onPress={() => item.inStock && handleAddToCart(item)}
                            disabled={!item.inStock || isAddingToCart[item.id]}
                        >
                            {isAddingToCart[item.id] ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons name="add" size={14} color={COLORS.white} />
                                    <Text style={styles.addToCartText}>
                                        {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    // Enhanced list item renderer
    const renderListItem = ({ item }: { item: Product & { viewedAt: string; viewCount: number } }) => (
        <Animated.View
            style={[
                styles.listItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <TouchableOpacity
                style={styles.listItemContent}
                onPress={() => handleProductPress(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.listImageContainer}>
                    <Image
                        source={getProductImageBySize(item.id, 'medium')}
                        style={styles.listProductImage}
                        resizeMode="cover"
                    />
                    {item.badge && (
                        <View style={[styles.listDiscountBadge, { backgroundColor: item.badgeColor || COLORS.error }]}>
                            <Text style={styles.discountText}>{item.badge}</Text>
                        </View>
                    )}
                    {item.viewCount > 1 && (
                        <View style={styles.listViewCountBadge}>
                            <Text style={styles.viewCountText}>{item.viewCount}x</Text>
                        </View>
                    )}
                </View>

                <View style={styles.listProductInfo}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.warning} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        <Text style={styles.reviewText}>({item.reviewCount} reviews)</Text>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                        )}
                    </View>

                    <Text style={styles.shippingInfo}>
                        {item.shipping?.free ? 'FREE shipping' : 'Standard shipping'}
                    </Text>
                    <Text style={styles.viewedTime}>{formatTimeAgo(item.viewedAt)}</Text>
                </View>

                <View style={styles.listActions}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleRemoveItem(item.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>

                    {isInCart(item.id) ? (
                        <View style={styles.listInCartButton}>
                            <Ionicons name="checkmark" size={16} color={COLORS.success} />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.listAddToCartButton,
                                !item.inStock && styles.addToCartButtonDisabled,
                                isAddingToCart[item.id] && styles.addToCartButtonLoading
                            ]}
                            onPress={() => item.inStock && handleAddToCart(item)}
                            disabled={!item.inStock || isAddingToCart[item.id]}
                        >
                            {isAddingToCart[item.id] ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons name="add" size={16} color={COLORS.white} />
                                    <Text style={styles.addToCartText}>
                                        {item.inStock ? 'Add' : 'Out'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const filteredProducts = getFilteredProducts;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.walmartBlue} />
                    <Text style={styles.loadingText}>Loading your viewing history...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Recently Viewed</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.viewModeButton}
                        onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                        <Ionicons
                            name={viewMode === 'grid' ? 'list' : 'grid'}
                            size={20}
                            color={COLORS.walmartBlue}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => router.push('/(modals)/cart')}
                    >
                        <View style={styles.cartIconContainer}>
                            <Ionicons name="bag-outline" size={24} color={COLORS.textPrimary} />
                            {summary.itemCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{summary.itemCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    {recentlyViewedItems.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClearAll}
                        >
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {recentlyViewedItems.length === 0 ? (
                <Animated.View
                    style={[
                        styles.emptyState,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.emptyStateIcon}>
                        <Ionicons name="eye-outline" size={64} color={COLORS.mediumGray} />
                    </View>
                    <Text style={styles.emptyStateTitle}>No Recently Viewed Items</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Products you browse will appear here for quick access later
                    </Text>

                    {/* Quick category suggestions */}
                    <View style={styles.quickSuggestions}>
                        <Text style={styles.suggestionsTitle}>Start exploring:</Text>
                        <View style={styles.suggestionsGrid}>
                            {Object.entries(CATEGORIES).slice(0, 4).map(([key, category]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.suggestionCard, { backgroundColor: `${category.color}15` }]}
                                    onPress={() => {
                                        router.dismiss();
                                        router.push(`/category/${key}`);
                                    }}
                                >
                                    <Ionicons name={category.icon} size={24} color={category.color} />
                                    <Text style={[styles.suggestionText, { color: category.color }]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.browseCatalogButton}
                        onPress={() => {
                            router.dismiss();
                            router.push('/(tabs)/search');
                        }}
                    >
                        <Ionicons name="search" size={20} color={COLORS.white} />
                        <Text style={styles.browseCatalogText}>Browse Products</Text>
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <>
                    {/* Enhanced Filter Options */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterContainer}
                        contentContainerStyle={styles.filterContent}
                    >
                        {filterOptions.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterChip,
                                    selectedFilter === filter.id && styles.filterChipActive
                                ]}
                                onPress={() => setSelectedFilter(filter.id)}
                            >
                                <Ionicons
                                    name={filter.icon}
                                    size={16}
                                    color={selectedFilter === filter.id ? COLORS.white : COLORS.walmartBlue}
                                />
                                <Text style={[
                                    styles.filterChipText,
                                    selectedFilter === filter.id && styles.filterChipTextActive
                                ]}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Products List/Grid */}
                    <FlatList
                        data={filteredProducts}
                        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                        keyExtractor={(item) => item.id}
                        numColumns={viewMode === 'grid' ? 2 : 1}
                        key={viewMode} // Force re-render when view mode changes
                        contentContainerStyle={styles.productsList}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.walmartBlue]}
                                tintColor={COLORS.walmartBlue}
                            />
                        }
                        ListEmptyComponent={() => (
                            <View style={styles.emptyFilterState}>
                                <Ionicons name="filter-outline" size={48} color={COLORS.mediumGray} />
                                <Text style={styles.emptyFilterTitle}>No items in this filter</Text>
                                <Text style={styles.emptyFilterSubtitle}>
                                    Try selecting a different time period or category
                                </Text>
                                <TouchableOpacity
                                    style={styles.clearFilterButton}
                                    onPress={() => setSelectedFilter('all')}
                                >
                                    <Text style={styles.clearFilterText}>Show All Items</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.sectionBackground,
    },

    // Loading State
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },

    // Enhanced Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewModeButton: {
        padding: 8,
        borderRadius: 8,
    },
    cartButton: {
        padding: 8,
        borderRadius: 8,
    },
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.error,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.error + '15',
    },
    clearButtonText: {
        color: COLORS.error,
        fontSize: 14,
        fontWeight: '600',
    },

    // Enhanced Filter Container
    filterContainer: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: COLORS.walmartBlue,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
        backgroundColor: COLORS.white,
    },
    filterChipActive: {
        backgroundColor: COLORS.walmartBlue,
        shadowOpacity: 0.2,
        elevation: 3,
    },
    filterChipText: {
        color: COLORS.walmartBlue,
        fontSize: 14,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: COLORS.white,
    },

    // Products List
    productsList: {
        padding: 12,
        paddingBottom: 32,
    },

    // Enhanced Grid Item Styles
    gridItem: {
        flex: 1,
        margin: 6,
    },
    gridItemContent: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    imageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 160,
        backgroundColor: COLORS.lightGray,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 16,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    viewCountBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    viewCountText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },

    // Enhanced Product Info
    productInfo: {
        padding: 16,
    },
    brandText: {
        fontSize: 12,
        color: COLORS.walmartBlue,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 20,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 13,
        color: COLORS.textPrimary,
        marginLeft: 4,
        fontWeight: '500',
    },
    reviewText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    currentPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.success,
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },
    shippingInfo: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '500',
        marginBottom: 6,
    },
    viewedTime: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginBottom: 12,
        fontWeight: '500',
    },

    // Enhanced Action Buttons
    addToCartButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    addToCartButtonDisabled: {
        backgroundColor: COLORS.mediumGray,
        shadowOpacity: 0.1,
    },
    addToCartButtonLoading: {
        backgroundColor: COLORS.walmartDarkBlue,
    },
    addToCartText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 4,
    },
    inCartButton: {
        backgroundColor: COLORS.success + '20',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    inCartText: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 4,
    },

    // Enhanced List Item Styles
    listItem: {
        marginBottom: 12,
    },
    listItemContent: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    listImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    listProductImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: COLORS.lightGray,
    },
    listDiscountBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    listViewCountBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    listProductInfo: {
        flex: 1,
        marginRight: 12,
    },
    listActions: {
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: COLORS.error + '15',
    },
    listAddToCartButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    listInCartButton: {
        backgroundColor: COLORS.success + '20',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.success,
    },

    // Enhanced Empty States
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 40,
    },
    emptyStateIcon: {
        width: 120,
        height: 120,
        backgroundColor: COLORS.lightGray,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },

    // Quick Suggestions
    quickSuggestions: {
        width: '100%',
        marginBottom: 32,
    },
    suggestionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    suggestionCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    suggestionText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },

    // Browse Button
    browseCatalogButton: {
        backgroundColor: COLORS.walmartBlue,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    browseCatalogText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },

    // Empty Filter State
    emptyFilterState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyFilterTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyFilterSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    clearFilterButton: {
        backgroundColor: COLORS.walmartBlue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    clearFilterText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});