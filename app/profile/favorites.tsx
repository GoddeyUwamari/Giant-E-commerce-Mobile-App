import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
    StyleSheet,
    FlatList,
    TextInput,
    Share,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import unified system - INTEGRATED
import { useCartStore } from '../../store/slices/cartSlice';
import {
    getAllFeaturedProducts,
    getAllSaleProducts,
    getProductById,
    getProductsByCategory,
    CATEGORIES,
    Product
} from '../../constants/products';
import { getProductImageBySize } from '../../assets/images/imageLoader';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Walmart colors - consistent with other screens
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

// Enhanced interfaces
interface FavoriteItem {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    category: string;
    inStock: boolean;
    isOnSale: boolean;
    discount?: number;
    addedDate: string;
    lastPriceCheck: string;
    priceDropAlert: boolean;
    quickOrder: boolean;
    description?: string;
    badge?: string;
    badgeColor?: string;
    featured?: boolean;
    shipping?: {
        free: boolean;
        option: string;
    };
    sku: string;
    maxQuantity?: number;
    minQuantity?: number;
    status?: string;
    storeId?: string;
    storeName?: string;
    delivery?: {
        option: 'pickup' | 'delivery' | 'shipping';
        freeShippingEligible: boolean;
    };
}

interface WishList {
    id: string;
    name: string;
    itemCount: number;
    isDefault: boolean;
    isPublic: boolean;
    createdDate: string;
    description?: string;
    color?: string;
    icon?: string;
    items: FavoriteItem[];
}

// Storage keys
const FAVORITES_KEY = 'user_favorites';
const WISHLISTS_KEY = 'user_wishlists';

// Enhanced filter options
const filterOptions = [
    { id: 'all', label: 'All Items', icon: 'grid-outline' },
    { id: 'today', label: 'Added Today', icon: 'today-outline' },
    { id: 'week', label: 'This Week', icon: 'calendar-outline' },
    { id: 'month', label: 'This Month', icon: 'calendar-outline' },
    { id: 'on-sale', label: 'On Sale', icon: 'pricetag-outline' },
    { id: 'in-stock', label: 'In Stock', icon: 'checkmark-circle-outline' },
    { id: 'price-drops', label: 'Price Drops', icon: 'trending-down-outline' },
    ...Object.entries(CATEGORIES).map(([key, category]) => ({
        id: key,
        label: category.name,
        icon: category.icon,
    })),
];

const sortOptions = [
    { id: 'recent', label: 'Recently Added', icon: 'time-outline' },
    { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up-outline' },
    { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down-outline' },
    { id: 'name', label: 'Name A-Z', icon: 'text-outline' },
    { id: 'brand', label: 'Brand A-Z', icon: 'business-outline' },
    { id: 'rating', label: 'Highest Rated', icon: 'star-outline' },
    { id: 'discount', label: 'Biggest Savings', icon: 'pricetag-outline' },
];

export default function FavoritesScreen(): JSX.Element {
    const [wishLists, setWishLists] = useState<WishList[]>([]);
    const [selectedList, setSelectedList] = useState<string>('default');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high' | 'name' | 'brand' | 'rating' | 'discount'>('recent');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState<{ [key: string]: boolean }>({});

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Zustand cart store - INTEGRATED
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    useEffect(() => {
        loadFavoritesData();
        calculateSummary();

        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
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

    // Load favorites data with real product integration
    const loadFavoritesData = async () => {
        try {
            setIsLoading(true);

            // Load wishlists
            const storedWishlists = await AsyncStorage.getItem(WISHLISTS_KEY);
            let lists: WishList[];

            if (storedWishlists) {
                lists = JSON.parse(storedWishlists);
            } else {
                // Create default wishlist with some sample items from unified system
                const sampleFavorites = getAllFeaturedProducts().slice(0, 3).map(product =>
                    convertProductToFavorite(product)
                );

                lists = [{
                    id: 'default',
                    name: 'My Favorites',
                    itemCount: sampleFavorites.length,
                    isDefault: true,
                    isPublic: false,
                    createdDate: new Date().toISOString(),
                    description: 'Your main favorites list',
                    color: COLORS.walmartBlue,
                    icon: 'heart',
                    items: sampleFavorites,
                }];

                await AsyncStorage.setItem(WISHLISTS_KEY, JSON.stringify(lists));
            }

            setWishLists(lists);

            // Set default selected list if none selected
            if (!lists.find(list => list.id === selectedList)) {
                const defaultList = lists.find(list => list.isDefault) || lists[0];
                if (defaultList) {
                    setSelectedList(defaultList.id);
                }
            }

        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Convert Product to FavoriteItem
    const convertProductToFavorite = (product: Product): FavoriteItem => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        category: product.category,
        inStock: product.inStock,
        isOnSale: product.originalPrice ? product.originalPrice > product.price : false,
        discount: product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : undefined,
        addedDate: new Date().toISOString(),
        lastPriceCheck: new Date().toISOString(),
        priceDropAlert: false,
        quickOrder: false,
        description: product.description,
        badge: product.badge,
        badgeColor: product.badgeColor,
        featured: product.featured,
        shipping: product.shipping,
        sku: product.sku,
        maxQuantity: product.maxQuantity,
        minQuantity: product.minQuantity,
        status: product.status,
        storeId: product.storeId,
        storeName: product.storeName,
        delivery: product.delivery,
    });

    const currentList = useMemo(() =>
            wishLists.find(list => list.id === selectedList) || wishLists[0],
        [wishLists, selectedList]
    );

    const allItems = useMemo(() =>
            currentList?.items || [],
        [currentList]
    );

    // Enhanced filtering and sorting
    const processedItems = useMemo(() => {
        let filtered = [...allItems];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.brand.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }

        // Apply category/special filters
        switch (filterCategory) {
            case 'today':
                const today = new Date().toDateString();
                filtered = filtered.filter(item =>
                    new Date(item.addedDate).toDateString() === today
                );
                break;
            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filtered = filtered.filter(item =>
                    new Date(item.addedDate) >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                filtered = filtered.filter(item =>
                    new Date(item.addedDate) >= monthAgo
                );
                break;
            case 'on-sale':
                filtered = filtered.filter(item => item.isOnSale);
                break;
            case 'in-stock':
                filtered = filtered.filter(item => item.inStock);
                break;
            case 'price-drops':
                filtered = filtered.filter(item => item.priceDropAlert);
                break;
            default:
                if (filterCategory !== 'all' && CATEGORIES[filterCategory as keyof typeof CATEGORIES]) {
                    filtered = filtered.filter(item => item.category === filterCategory);
                }
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'brand':
                    return a.brand.localeCompare(b.brand);
                case 'rating':
                    return b.rating - a.rating;
                case 'discount':
                    return (b.discount || 0) - (a.discount || 0);
                case 'recent':
                default:
                    return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
            }
        });

        return filtered;
    }, [allItems, searchQuery, filterCategory, sortBy]);

    const categories = useMemo(() =>
            ['all', 'on-sale', 'in-stock', 'price-drops', ...new Set(allItems.map(item => item.category))],
        [allItems]
    );

    // Enhanced refresh handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadFavoritesData();
        // Simulate price checking
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    // Enhanced add to cart with real integration
    const handleAddToCart = useCallback(async (item: FavoriteItem) => {
        if (!item.inStock) {
            Alert.alert('Out of Stock', 'This item is currently out of stock.');
            return;
        }

        setIsAddingToCart(prev => ({ ...prev, [item.id]: true }));

        try {
            const success = await addItem({
                productId: item.id,
                name: item.name,
                brand: item.brand,
                price: item.price,
                originalPrice: item.originalPrice,
                quantity: 1,
                maxQuantity: item.maxQuantity || 10,
                minQuantity: item.minQuantity || 1,
                image: getProductImageBySize(item.id, 'medium'),
                category: item.category,
                sku: item.sku,
                status: item.status || 'available',
                storeId: item.storeId || 'store_001',
                storeName: item.storeName || 'Walmart Supercenter',
                delivery: item.delivery || {
                    option: 'pickup' as const,
                    freeShippingEligible: true,
                },
            });

            if (success) {
                Alert.alert(
                    'Added to Cart',
                    `${item.name} has been added to your cart.`,
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
            setIsAddingToCart(prev => ({ ...prev, [item.id]: false }));
        }
    }, [addItem]);

    const handleRemoveFromFavorites = useCallback((itemId: string) => {
        const item = allItems.find(item => item.id === itemId);
        Alert.alert(
            'Remove from Favorites',
            `Remove "${item?.name}" from your ${currentList.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedLists = wishLists.map(list =>
                                list.id === selectedList
                                    ? {
                                        ...list,
                                        items: list.items.filter(item => item.id !== itemId),
                                        itemCount: list.items.filter(item => item.id !== itemId).length
                                    }
                                    : list
                            );
                            setWishLists(updatedLists);
                            await AsyncStorage.setItem(WISHLISTS_KEY, JSON.stringify(updatedLists));
                        } catch (error) {
                            console.error('Error removing favorite:', error);
                        }
                    },
                },
            ]
        );
    }, [allItems, currentList, selectedList, wishLists]);

    const handleShareItem = useCallback(async (item: FavoriteItem) => {
        try {
            await Share.share({
                message: `Check out this ${item.name} for $${item.price.toFixed(2)} at Walmart!`,
                url: `https://walmart.com/product/${item.id}`,
                title: item.name,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, []);

    const handleCreateNewList = useCallback(() => {
        router.push('/(modals)/create-wishlist');
    }, []);

    const handleManageLists = useCallback(() => {
        router.push('/(modals)/manage-wishlists');
    }, []);

    // Check if product is in cart
    const isInCart = useCallback((productId: string) => {
        return cartItems.some(item => item.productId === productId);
    }, [cartItems]);

    const handleProductPress = useCallback((productId: string) => {
        router.push(`/product/${productId}`);
    }, []);

    // Enhanced renderers
    const renderWishListTab = useCallback((list: WishList) => (
        <TouchableOpacity
            key={list.id}
            style={[
                styles.wishListTab,
                selectedList === list.id && styles.wishListTabActive
            ]}
            onPress={() => setSelectedList(list.id)}
            activeOpacity={0.7}
        >
            <View style={styles.wishListTabIcon}>
                <Ionicons
                    name={list.icon as any || 'heart'}
                    size={14}
                    color={selectedList === list.id ? COLORS.white : list.color || COLORS.walmartBlue}
                />
            </View>
            <View style={styles.wishListTabInfo}>
                <Text style={[
                    styles.wishListTabText,
                    selectedList === list.id && styles.wishListTabTextActive
                ]}>
                    {list.name}
                </Text>
                <Text style={[
                    styles.wishListTabCount,
                    selectedList === list.id && styles.wishListTabCountActive
                ]}>
                    {list.itemCount} items
                </Text>
            </View>
        </TouchableOpacity>
    ), [selectedList]);

    const renderGridItem = useCallback(({ item }: { item: FavoriteItem }) => (
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
                activeOpacity={0.9}
            >
                <View style={styles.gridItemImageContainer}>
                    <Image
                        source={getProductImageBySize(item.id, 'medium')}
                        style={styles.gridItemImage}
                        resizeMode="cover"
                    />

                    {item.badge && (
                        <View style={[styles.saleBadge, { backgroundColor: item.badgeColor || COLORS.error }]}>
                            <Text style={styles.saleBadgeText}>{item.badge}</Text>
                        </View>
                    )}

                    {item.featured && (
                        <View style={styles.featuredBadge}>
                            <Ionicons name="star" size={10} color={COLORS.white} />
                            <Text style={styles.featuredText}>Featured</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.gridFavoriteButton}
                        onPress={() => handleRemoveFromFavorites(item.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="heart" size={18} color={COLORS.error} />
                    </TouchableOpacity>

                    {!item.inStock && (
                        <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>Out of Stock</Text>
                        </View>
                    )}
                </View>

                <View style={styles.gridItemInfo}>
                    <Text style={styles.gridItemBrand}>{item.brand}</Text>
                    <Text style={styles.gridItemName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    <View style={styles.gridItemRating}>
                        <Ionicons name="star" size={12} color={COLORS.warning} />
                        <Text style={styles.gridRatingText}>
                            {item.rating} ({item.reviewCount})
                        </Text>
                    </View>

                    <View style={styles.gridItemPricing}>
                        <Text style={styles.gridItemPrice}>${item.price.toFixed(2)}</Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.gridItemOriginalPrice}>
                                ${item.originalPrice.toFixed(2)}
                            </Text>
                        )}
                    </View>

                    <Text style={styles.shippingInfo}>
                        {item.shipping?.free ? 'FREE shipping' : 'Standard shipping'}
                    </Text>

                    {isInCart(item.id) ? (
                        <View style={styles.inCartButton}>
                            <Ionicons name="checkmark" size={14} color={COLORS.success} />
                            <Text style={styles.inCartText}>In Cart</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.gridAddToCartButton,
                                !item.inStock && styles.gridAddToCartButtonDisabled,
                                isAddingToCart[item.id] && styles.addToCartButtonLoading
                            ]}
                            onPress={() => item.inStock && handleAddToCart(item)}
                            disabled={!item.inStock || isAddingToCart[item.id]}
                            activeOpacity={0.8}
                        >
                            {isAddingToCart[item.id] ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="add"
                                        size={14}
                                        color={item.inStock ? COLORS.white : COLORS.mediumGray}
                                    />
                                    <Text style={[
                                        styles.addToCartText,
                                        !item.inStock && styles.addToCartTextDisabled
                                    ]}>
                                        {item.inStock ? 'Add' : 'Out'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    ), [fadeAnim, slideAnim, handleProductPress, handleRemoveFromFavorites, handleAddToCart, isInCart, isAddingToCart]);

    const renderListItem = useCallback(({ item }: { item: FavoriteItem }) => (
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
                activeOpacity={0.9}
            >
                <View style={styles.listImageContainer}>
                    <Image
                        source={getProductImageBySize(item.id, 'medium')}
                        style={styles.listItemImage}
                        resizeMode="cover"
                    />
                    {item.badge && (
                        <View style={[styles.listDiscountBadge, { backgroundColor: item.badgeColor || COLORS.error }]}>
                            <Text style={styles.saleBadgeText}>{item.badge}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.listItemInfo}>
                    <View style={styles.listItemHeader}>
                        <Text style={styles.listItemName} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => handleRemoveFromFavorites(item.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="heart" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.listItemBrand}>{item.brand}</Text>

                    <View style={styles.listItemRating}>
                        <Ionicons name="star" size={14} color={COLORS.warning} />
                        <Text style={styles.ratingText}>
                            {item.rating} ({item.reviewCount})
                        </Text>
                    </View>

                    <View style={styles.listItemPricing}>
                        <Text style={styles.listItemPrice}>${item.price.toFixed(2)}</Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.listItemOriginalPrice}>
                                ${item.originalPrice.toFixed(2)}
                            </Text>
                        )}
                        {item.isOnSale && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>
                                    {item.discount}% OFF
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.shippingInfo}>
                        {item.shipping?.free ? 'FREE shipping' : 'Standard shipping'}
                    </Text>
                </View>

                <View style={styles.listActions}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => handleShareItem(item)}
                    >
                        <Ionicons name="share-outline" size={20} color={COLORS.walmartBlue} />
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
                            activeOpacity={0.8}
                        >
                            {isAddingToCart[item.id] ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="add"
                                        size={16}
                                        color={item.inStock ? COLORS.white : COLORS.mediumGray}
                                    />
                                    <Text style={[
                                        styles.addToCartText,
                                        !item.inStock && styles.addToCartTextDisabled
                                    ]}>
                                        {item.inStock ? 'Add' : 'Out'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    ), [fadeAnim, slideAnim, handleProductPress, handleRemoveFromFavorites, handleAddToCart, handleShareItem, isInCart, isAddingToCart]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.walmartBlue} />
                    <Text style={styles.loadingText}>Loading your favorites...</Text>
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
                    <Text style={styles.headerTitle}>My Favorites</Text>
                    <Text style={styles.headerSubtitle}>
                        {processedItems.length} {processedItems.length === 1 ? 'item' : 'items'}
                    </Text>
                </View>

                <View style={styles.headerActions}>
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

                    <TouchableOpacity
                        style={styles.manageButton}
                        onPress={handleManageLists}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={24} color={COLORS.walmartBlue} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Wish List Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.wishListTabs}
                contentContainerStyle={styles.wishListTabsContent}
            >
                {wishLists.map(renderWishListTab)}
                <TouchableOpacity
                    style={styles.addListButton}
                    onPress={handleCreateNewList}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={18} color={COLORS.walmartBlue} />
                    <Text style={styles.addListText}>New List</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Search and Controls */}
            <View style={styles.searchAndControls}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.mediumGray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your favorites..."
                        placeholderTextColor={COLORS.mediumGray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            style={styles.clearSearchButton}
                        >
                            <Ionicons name="close-circle" size={20} color={COLORS.mediumGray} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => setShowSortOptions(!showSortOptions)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="swap-vertical" size={16} color={COLORS.walmartBlue} />
                        <Text style={styles.sortButtonText}>
                            {sortOptions.find(opt => opt.id === sortBy)?.label || 'Sort'}
                        </Text>
                        <Ionicons
                            name={showSortOptions ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={COLORS.walmartBlue}
                        />
                    </TouchableOpacity>

                    <View style={styles.viewControls}>
                        <TouchableOpacity
                            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
                            onPress={() => setViewMode('grid')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="grid" size={18} color={viewMode === 'grid' ? COLORS.walmartBlue : COLORS.mediumGray} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
                            onPress={() => setViewMode('list')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="list" size={18} color={viewMode === 'list' ? COLORS.walmartBlue : COLORS.mediumGray} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Sort Options Dropdown */}
            {showSortOptions && (
                <Animated.View style={styles.sortDropdown}>
                    <ScrollView style={styles.sortOptionsContainer}>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.sortOption,
                                    sortBy === option.id && styles.sortOptionActive
                                ]}
                                onPress={() => {
                                    setSortBy(option.id as any);
                                    setShowSortOptions(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={16}
                                    color={sortBy === option.id ? COLORS.walmartBlue : COLORS.mediumGray}
                                />
                                <Text style={[
                                    styles.sortOptionText,
                                    sortBy === option.id && styles.sortOptionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                                {sortBy === option.id && (
                                    <Ionicons name="checkmark" size={16} color={COLORS.walmartBlue} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}

            {/* Filter Options */}
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
                            filterCategory === filter.id && styles.filterChipActive
                        ]}
                        onPress={() => setFilterCategory(filter.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={filter.icon}
                            size={14}
                            color={filterCategory === filter.id ? COLORS.white : COLORS.walmartBlue}
                        />
                        <Text style={[
                            styles.filterChipText,
                            filterCategory === filter.id && styles.filterChipTextActive
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Content */}
            {processedItems.length > 0 ? (
                <FlatList
                    data={processedItems}
                    keyExtractor={(item) => item.id}
                    renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    key={`${viewMode}-${selectedList}`} // Force re-render when view mode or list changes
                    contentContainerStyle={[
                        styles.contentContainer,
                        viewMode === 'grid' && styles.gridContainer
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.walmartBlue]}
                            tintColor={COLORS.walmartBlue}
                        />
                    }
                />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.emptyStateContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.walmartBlue]}
                            tintColor={COLORS.walmartBlue}
                        />
                    }
                >
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
                            <Ionicons
                                name={searchQuery || filterCategory !== 'all' ? "search-outline" : "heart-outline"}
                                size={64}
                                color={COLORS.mediumGray}
                            />
                        </View>
                        <Text style={styles.emptyStateTitle}>
                            {searchQuery || filterCategory !== 'all'
                                ? 'No items found'
                                : `No items in ${currentList?.name || 'this list'}`
                            }
                        </Text>
                        <Text style={styles.emptyStateText}>
                            {searchQuery || filterCategory !== 'all'
                                ? 'Try adjusting your search or filters'
                                : `Start adding items to your ${currentList?.name || 'favorites'} to see them here.`
                            }
                        </Text>

                        {searchQuery || filterCategory !== 'all' ? (
                            <TouchableOpacity
                                style={styles.emptyStateButton}
                                onPress={() => {
                                    setSearchQuery('');
                                    setFilterCategory('all');
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.emptyStateButton}
                                onPress={() => router.push('/(tabs)/search')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="search" size={18} color={COLORS.white} />
                                <Text style={styles.emptyStateButtonText}>Start Shopping</Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </ScrollView>
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
        textAlign: 'center',
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
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
        gap: 12,
    },
    cartButton: {
        position: 'relative',
    },
    cartIconContainer: {
        position: 'relative',
        padding: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    manageButton: {
        padding: 8,
        borderRadius: 8,
    },

    // Enhanced Wish List Tabs
    wishListTabs: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    wishListTabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    wishListTab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: COLORS.borderColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    wishListTabActive: {
        backgroundColor: COLORS.walmartBlue,
        borderColor: COLORS.walmartBlue,
        shadowOpacity: 0.15,
        elevation: 3,
    },
    wishListTabIcon: {
        marginRight: 8,
    },
    wishListTabInfo: {
        alignItems: 'flex-start',
    },
    wishListTabText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    wishListTabTextActive: {
        color: COLORS.white,
    },
    wishListTabCount: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '500',
    },
    wishListTabCountActive: {
        color: COLORS.white,
        opacity: 0.9,
    },
    addListButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.walmartBlue}15`,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: COLORS.walmartBlue,
        borderStyle: 'dashed',
    },
    addListText: {
        color: COLORS.walmartBlue,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },

    // Enhanced Search and Controls
    searchAndControls: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    clearSearchButton: {
        padding: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        gap: 6,
        flex: 1,
        marginRight: 12,
    },
    sortButtonText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    viewControls: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 2,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    viewButton: {
        padding: 8,
        borderRadius: 6,
    },
    viewButtonActive: {
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },

    // Sort Dropdown
    sortDropdown: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        maxHeight: 250,
    },
    sortOptionsContainer: {
        paddingHorizontal: 16,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 12,
    },
    sortOptionActive: {
        backgroundColor: `${COLORS.walmartBlue}10`,
    },
    sortOptionText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    sortOptionTextActive: {
        color: COLORS.walmartBlue,
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.walmartBlue,
        gap: 4,
        backgroundColor: COLORS.white,
    },
    filterChipActive: {
        backgroundColor: COLORS.walmartBlue,
    },
    filterChipText: {
        color: COLORS.walmartBlue,
        fontSize: 12,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: COLORS.white,
    },

    // Content Container
    contentContainer: {
        paddingHorizontal: 12,
        paddingBottom: 32,
    },
    gridContainer: {
        paddingTop: 16,
    },

    // Enhanced Grid Items
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
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    gridItemImageContainer: {
        position: 'relative',
    },
    gridItemImage: {
        width: '100%',
        height: 160,
        backgroundColor: COLORS.lightGray,
    },
    saleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    saleBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    featuredBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.walmartBlue,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        gap: 2,
    },
    featuredText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '600',
    },
    gridFavoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    gridItemInfo: {
        padding: 16,
    },
    gridItemBrand: {
        fontSize: 12,
        color: COLORS.walmartBlue,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    gridItemName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 20,
    },
    gridItemRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridRatingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
        fontWeight: '500',
    },
    gridItemPricing: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridItemPrice: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.success,
        marginRight: 8,
    },
    gridItemOriginalPrice: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },
    shippingInfo: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '500',
        marginBottom: 12,
    },
    gridAddToCartButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    gridAddToCartButtonDisabled: {
        backgroundColor: COLORS.mediumGray,
        shadowOpacity: 0.1,
    },
    addToCartButtonLoading: {
        backgroundColor: COLORS.walmartDarkBlue,
    },
    addToCartText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
    },
    addToCartTextDisabled: {
        color: COLORS.mediumGray,
    },
    inCartButton: {
        backgroundColor: `${COLORS.success}20`,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    inCartText: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '600',
    },

    // Enhanced List Items
    listItem: {
        marginBottom: 12,
    },
    listItemContent: {
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
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
    listItemImage: {
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
        borderRadius: 4,
    },
    listItemInfo: {
        flex: 1,
        marginRight: 12,
    },
    listItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    listItemName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        lineHeight: 22,
        marginRight: 8,
    },
    favoriteButton: {
        padding: 6,
        borderRadius: 8,
    },
    listItemBrand: {
        fontSize: 14,
        color: COLORS.walmartBlue,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    listItemRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginLeft: 4,
        fontWeight: '500',
    },
    listItemPricing: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    listItemPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.success,
    },
    listItemOriginalPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: COLORS.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },
    listActions: {
        alignItems: 'center',
        gap: 12,
    },
    shareButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: `${COLORS.walmartBlue}15`,
    },
    listAddToCartButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 70,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    listInCartButton: {
        backgroundColor: `${COLORS.success}20`,
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.success,
    },

    // Enhanced Empty State
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
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
        shadowOpacity: 0.08,
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
    emptyStateText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyStateButton: {
        backgroundColor: COLORS.walmartBlue,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyStateButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});