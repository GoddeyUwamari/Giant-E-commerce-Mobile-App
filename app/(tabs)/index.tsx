import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StyleSheet,
    RefreshControl,
    StatusBar,
    Animated,
    FlatList,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import your unified system
import { useCartStore } from '../../store/slices/cartSlice';
import { ALL_PRODUCTS, ALL_CATEGORIES, getFeaturedProducts, searchProducts } from '../../constants/products/data';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced utility functions
const getAllSaleProducts = () => ALL_PRODUCTS.filter(product =>
    product.originalPrice && product.originalPrice > product.price
);

const getTrendingProducts = () => ALL_PRODUCTS.filter(product =>
    product.badge === 'Trending' || product.rating >= 4.5
);

const getBestSellerProducts = () => ALL_PRODUCTS.filter(product =>
    product.badge === 'Best Seller' || product.reviewCount > 500
);

const getNewArrivals = () => ALL_PRODUCTS.filter(product =>
    product.badge === 'New'
);

const getBannerImage = (imageName: string) => {
    // Updated to use more realistic placeholder URIs for eCommerce feel; in production, use actual image URLs
    const images = {
        electronics: { uri: 'https://via.placeholder.com/400x200/0071CE/FFFFFF?text=Electronics+Sale' },
        fashion: { uri: 'https://via.placeholder.com/400x200/EC4899/FFFFFF?text=Fall+Fashion' },
        home: { uri: 'https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Home+Essentials' },
        beauty: { uri: 'https://via.placeholder.com/400x200/A855F7/FFFFFF?text=Beauty+%26+Health' },
        grocery: { uri: 'https://via.placeholder.com/400x200/059669/FFFFFF?text=Grocery+Deals' },
        fall: { uri: 'https://via.placeholder.com/400x200/EF4444/FFFFFF?text=Fall+Savings' },
        pickup: { uri: 'https://via.placeholder.com/400x200/059669/FFFFFF?text=Free+Grocery+Pickup' },
        plus: { uri: 'https://via.placeholder.com/400x200/7C3AED/FFFFFF?text=Giant%2B+Members' },
        flash: { uri: 'https://via.placeholder.com/400x200/10B981/FFFFFF?text=Flash+Sale' },
        clearance: { uri: 'https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Clearance+Event' },
    };
    return images[imageName] || { uri: 'https://via.placeholder.com/400x200/0071CE/FFFFFF?text=Shop+Now' };
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    walmartYellow: '#FFC220',
    white: '#FFFFFF',
    black: '#000000',
    lightGray: '#F8F9FA',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    borderColor: '#E5E7EB',
    success: '#10B981',
    purple: '#800080',
    error: '#EF4444',
    warning: '#F59E0B',
    green: '#00FF00',
    red: '#FF0000',
};


// Enhanced Quick Services with accurate icons and routes
const quickServices = [
    { id: '1', name: 'Pharmacy', icon: 'medical', color: '#EF4444', route: '/(tabs)/services' },
    { id: '2', name: 'Photo Center', icon: 'camera', color: '#8B5CF6', route: '/(tabs)/services' },
    { id: '3', name: 'Money Services', icon: 'card', color: '#10B981', route: '/(tabs)/services' },
    { id: '4', name: 'Vision Center', icon: 'glasses', color: '#F59E0B', route: '/(tabs)/services' },
    { id: '5', name: 'Auto Care', icon: 'car-sport', color: '#6B7280', route: '/category/automotive' },
    { id: '6', name: 'Gift Cards', icon: 'gift', color: '#EC4899', route: '/(tabs)/services' },
    { id: '7', name: 'Grocery', icon: 'basket', color: '#059669', route: '/category/grocery' },
    { id: '8', name: 'Pickup', icon: 'storefront', color: '#3B82F6', route: '/(tabs)/services' },
];

// Enhanced category mapping with proper routes based on your data
const getCategoryRoute = (categorySlug: string) => {
    return `/category/${categorySlug}`;
};

// Enhanced promotional banners with more eCommerce-like promotions (added flash sale, clearance, updated for seasonality)
const PROMOTIONAL_BANNERS = [
    {
        id: 'promo_1',
        title: 'Fall Savings Event',
        subtitle: 'Up to 60% off seasonal essentials',
        image: getBannerImage('fall'),
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        ctaText: 'Shop Fall Deals',
        route: '/product?filter=fall-sale',
    },
    {
        id: 'promo_2',
        title: 'Free Grocery Pickup',
        subtitle: 'Order online, pickup same day',
        image: getBannerImage('pickup'),
        backgroundColor: '#00008b',
        textColor: '#FFFFFF',
        ctaText: 'Order Now',
        route: '/category/grocery',
    },
    {
        id: 'promo_3',
        title: 'Giant+ Membership',
        subtitle: 'Unlimited free delivery & exclusive perks',
        image: getBannerImage('plus'),
        backgroundColor: '#8b008b',
        textColor: '#FFFFFF',
        ctaText: 'Join Now',
        route: '/(tabs)/services',
    },
];

// Enhanced hero slides with updated content for eCommerce appeal (added grocery, updated fashion for fall, added countdown feel)
const HERO_SLIDES = [
    {
        id: '1',
        title: 'Mega Electronics Sale',
        subtitle: '50% Off Top Tech Brands',
        ctaText: 'Shop Now',
        backgroundColor: '#3B82F6',
        image: getBannerImage('electronics'),
        link: '/category/electronics',
        showRollbacks: true,
    },
    {
        id: '2',
        title: 'Fall Fashion Trends',
        subtitle: 'New Arrivals Starting at $10',
        ctaText: 'Discover Styles',
        backgroundColor: '#EC4899',
        image: getBannerImage('fashion'),
        link: '/category/fashion',
        showRollbacks: false,
    },
    {
        id: '3',
        title: 'Home & Kitchen Must-Haves',
        subtitle: 'Upgrade Your Space for Less',
        ctaText: 'Browse Home',
        backgroundColor: '#F59E0B',
        image: getBannerImage('home'),
        link: '/category/home-kitchen',
        showRollbacks: true,
    },
    {
        id: '4',
        title: 'Beauty & Wellness Deals',
        subtitle: 'Pamper Yourself with Savings',
        ctaText: 'Shop Beauty',
        backgroundColor: '#A855F7',
        image: getBannerImage('beauty'),
        link: '/category/beauty-grooming',
        showRollbacks: false,
    },
    {
        id: '5',
        title: 'Grocery Essentials',
        subtitle: 'Stock Up & Save Big',
        ctaText: 'Shop Groceries',
        backgroundColor: '#059669',
        image: getBannerImage('grocery'),
        link: '/category/grocery',
        showRollbacks: true,
    },
];

export default function HomeScreen(): JSX.Element {
    const [refreshing, setRefreshing] = useState(false);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const bannerFlatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Connect to real Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const cartSummary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);

    // Enhanced category processing with proper icon mapping
    const featuredCategories = useMemo(() => {
        if (!ALL_CATEGORIES || !Array.isArray(ALL_CATEGORIES)) {
            return [];
        }

        // Map categories with enhanced icon system
        const categoryIconMap = {
            'electronics': 'phone-portrait',
            'appliances': 'home',
            'home-kitchen': 'restaurant',
            'automotive': 'car-sport',
            'sports-fitness': 'fitness',
            'grocery': 'basket',
            'fashion': 'shirt',
            'beauty-grooming': 'rose',
            'baby-products': 'happy',
            'pet-supplies': 'paw',
            'video-games': 'game-controller',
            'bags-luggage': 'bag',
            'cameras': 'camera',
            'books': 'book'
        };

        return ALL_CATEGORIES
            .map(category => ({
                ...category,
                icon: categoryIconMap[category.slug] || 'cube',
                route: getCategoryRoute(category.slug),
                productCount: category.products?.length || 0,
            }))
            .filter(category => category.productCount > 0)
            .sort((a, b) => b.productCount - a.productCount)
            .slice(0, 6);
    }, []);

    // Enhanced product sections with better filtering
    const FLASH_DEALS = useMemo(() => {
        try {
            return getAllSaleProducts()
                .sort((a, b) => {
                    const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
                    const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
                    return discountB - discountA;
                })
                .slice(0, 10);
        } catch (error) {
            console.error('Error getting flash deals:', error);
            return [];
        }
    }, []);

    const TRENDING_PRODUCTS = useMemo(() => {
        try {
            return getTrendingProducts()
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 8);
        } catch (error) {
            console.error('Error getting trending products:', error);
            return [];
        }
    }, []);

    const BEST_SELLERS = useMemo(() => {
        try {
            return getBestSellerProducts()
                .sort((a, b) => b.reviewCount - a.reviewCount)
                .slice(0, 6);
        } catch (error) {
            console.error('Error getting best sellers:', error);
            return [];
        }
    }, []);

    const NEW_ARRIVALS = useMemo(() => {
        try {
            return getNewArrivals().slice(0, 8);
        } catch (error) {
            console.error('Error getting new arrivals:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    // Enhanced quick add to cart function
    const handleQuickAddToCart = useCallback(async (product: any) => {
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
                image: product.primaryImage?.uri || product.image,
                category: product.category,
                sku: product.sku,
                status: product.status || 'available',
                storeId: product.storeId || 'store_001',
                storeName: product.storeName || 'Giant Supercenter',
                delivery: product.delivery || {
                    option: 'pickup' as const,
                    freeShippingEligible: true,
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
            Alert.alert('Error', 'Failed to add item to cart');
        }
    }, [addItem]);

    // Enhanced navigation handlers
    const handleNavigation = useCallback((route: string) => {
        try {
            console.log('Navigating to:', route);
            router.push(route as any);
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback navigation
            router.push('/category' as any);
        }
    }, []);

    const GiantLogo = () => (
        <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Giant</Text>
        </View>
    );

    // Enhanced banner rendering with added overlay for better text visibility
    const renderHeroBanner = ({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity
            style={[
                styles.heroBanner,
                { backgroundColor: item.backgroundColor },
                index === HERO_SLIDES.length - 1 ? styles.lastBanner : {}
            ]}
            onPress={() => handleNavigation(item.link)}
            activeOpacity={0.9}
        >
            <View style={styles.heroBannerOverlay} />
            <View style={styles.heroBannerContent}>
                <Text style={styles.heroBannerTitle}>{item.title}</Text>
                <Text style={styles.heroBannerSubtitle}>{item.subtitle}</Text>
                <TouchableOpacity
                    style={styles.heroBannerButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleNavigation(item.link);
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.heroBannerButtonText}>{item.ctaText}</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
                {item.showRollbacks && (
                    <View style={styles.rollbacksBadge}>
                        <Text style={styles.rollbacksText}>Rollbacks</Text>
                    </View>
                )}
            </View>
            <Image
                source={item.image}
                style={styles.heroBannerImage}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    // Enhanced product card renderer with better pricing display
    const renderProductCard = ({ item, cardStyle = 'default' }: { item: any; cardStyle?: 'default' | 'compact' | 'wide' }) => {
        const discount = item.originalPrice && item.originalPrice > item.price
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : null;

        return (
            <TouchableOpacity
                style={[
                    styles.productCard,
                    cardStyle === 'compact' && styles.productCardCompact,
                    cardStyle === 'wide' && styles.productCardWide
                ]}
                onPress={() => handleNavigation(`/product/${item.id}`)}
                activeOpacity={0.9}
            >
                <Image
                    source={{ uri: item.image || item.primaryImage?.uri }}
                    style={[
                        styles.productImage,
                        cardStyle === 'compact' && styles.productImageCompact,
                        cardStyle === 'wide' && styles.productImageWide
                    ]}
                    resizeMode="cover"
                />

                {/* Enhanced badges */}
                {discount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discount}%</Text>
                    </View>
                )}

                {item.badge && (
                    <View style={[styles.productBadge, {
                        backgroundColor: item.badge === 'Best Seller' ? COLORS.error :
                            item.badge === 'New' ? COLORS.walmartBlue :
                                item.badge === 'Trending' ? COLORS.warning : COLORS.success
                    }]}>
                        <Text style={styles.productBadgeText}>{item.badge}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={18} color={COLORS.mediumGray} />
                </TouchableOpacity>

                <View style={styles.productInfo}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.productPrice, { fontWeight: '900', fontSize: 20 }]}>${item.price.toFixed(2)}</Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={[styles.productOriginalPrice, { fontWeight: '600' }]}>${item.originalPrice.toFixed(2)}</Text>
                        )}
                    </View>

                    <Text style={[styles.productName, { fontWeight: '700' }]} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.productMeta}>
                        <View style={styles.productRating}>
                            <Ionicons name="star" size={12} color="#FCD34D" />
                            <Text style={[styles.ratingText, { fontWeight: '700' }]}>{item.rating.toFixed(1)}</Text>
                            <Text style={[styles.reviewCount, { fontWeight: '600' }]}>({item.reviewCount})</Text>
                        </View>

                        {item.freeShipping && (
                            <View style={styles.shippingBadge}>
                                <Text style={[styles.shippingText, { fontWeight: '700' }]}>Free shipping</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.quickAddButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleQuickAddToCart(item);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color={COLORS.white} />
                        <Text style={[styles.quickAddText, { fontWeight: '800' }]}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // Enhanced promotional banner renderer with added timer badge for urgency
    const renderPromotionalBanner = (banner: any) => (
        <TouchableOpacity
            key={banner.id}
            style={[styles.promoBanner, { backgroundColor: banner.backgroundColor }]}
            onPress={() => handleNavigation(banner.route)}
            activeOpacity={0.9}
        >
            <View style={styles.promoBannerOverlay} />
            <View style={styles.promoBannerContent}>
                <Text style={[styles.promoBannerTitle, { color: banner.textColor, fontWeight: '900' }]}>
                    {banner.title}
                </Text>
                <Text style={[styles.promoBannerSubtitle, { color: banner.textColor, fontWeight: '600' }]}>
                    {banner.subtitle}
                </Text>
                <View style={styles.promoTimerBadge}>
                    <Ionicons name="time-outline" size={12} color={banner.textColor} />
                    <Text style={[styles.promoTimerText, { color: banner.textColor }]}>Limited Time</Text>
                </View>
                <TouchableOpacity
                    style={[styles.promoBannerButton, { borderColor: banner.textColor }]}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleNavigation(banner.route);
                    }}
                >
                    <Text style={[styles.promoBannerButtonText, { color: banner.textColor, fontWeight: '800' }]}>
                        {banner.ctaText}
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={banner.textColor} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            </View>
            <Image
                source={banner.image}
                style={styles.promoBannerImage}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    // Enhanced service renderer
    const renderQuickService = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => handleNavigation(item.route)}
            activeOpacity={0.7}
        >
            <View style={[styles.serviceIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={[styles.serviceText, { fontWeight: '700' }]}>{item.name}</Text>
        </TouchableOpacity>
    );

    // Enhanced category renderer
    const renderCategory = (category: any, index: number) => (
        <TouchableOpacity
            key={`category-${category.slug}-${index}`}
            style={styles.categoryCard}
            onPress={() => {
                console.log('Category pressed:', category.name, 'Route:', category.route);
                handleNavigation(category.route);
            }}
            activeOpacity={0.7}
        >
            <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                <Ionicons name={category.icon} size={28} color={category.color} />
            </View>
            <Text style={[styles.categoryName, { fontWeight: '800' }]}>{category.name}</Text>
            <Text style={[styles.categoryCount, { fontWeight: '600' }]}>{category.productCount} items</Text>
        </TouchableOpacity>
    );

    const onBannerScroll = useCallback((event: any) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const viewSize = event.nativeEvent.layoutMeasurement;
        const pageNum = Math.floor(contentOffset.x / viewSize.width);
        if (pageNum >= 0 && pageNum < HERO_SLIDES.length) {
            setCurrentBannerIndex(pageNum);
        }
    }, []);

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <View style={styles.headerBackground} />

            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Enhanced Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={() => handleNavigation('/(auth)/login')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.signInText, { fontWeight: '700' }]}>Sign In</Text>
                        </TouchableOpacity>

                        <GiantLogo />

                        {/* Enhanced Cart Button */}
                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => handleNavigation('/(modals)/cart')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cartIconContainer}>
                                <Ionicons name="cart-outline" size={24} color={COLORS.black} />
                                {cartSummary.itemCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={[styles.cartBadgeText, { fontWeight: '800' }]}>{cartSummary.itemCount}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cartDetails}>
                                <Text style={[styles.cartTotal, { fontWeight: '700' }]}>
                                    ${cartSummary.total.toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Enhanced Search Bar */}
                    <TouchableOpacity
                        style={styles.searchContainer}
                        onPress={() => handleNavigation('/(tabs)/search')}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="search" size={20} color={COLORS.mediumGray} />
                        <Text style={[styles.searchPlaceholder, { fontWeight: '500' }]}>Search Giant</Text>
                        <TouchableOpacity style={styles.barcodeButton} activeOpacity={0.7}>
                            <Ionicons name="barcode-outline" size={20} color={COLORS.mediumGray} />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    {/* Enhanced Location Bar */}
                    <TouchableOpacity
                        style={styles.locationBar}
                        onPress={() => handleNavigation('/store/locator')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="location" size={16} color={COLORS.black} />
                        <View style={styles.locationContent}>
                            <Text style={[styles.locationText, { fontWeight: '600' }]}>Pickup or delivery?</Text>
                            <Text style={[styles.locationDetails, { fontWeight: '700' }]}>Irvington, 07111</Text>
                        </View>
                        <Ionicons name="chevron-down" size={16} color={COLORS.black} />
                    </TouchableOpacity>
                </View>

                <Animated.ScrollView
                    ref={scrollViewRef}
                    style={[styles.scrollContainer, { opacity: fadeAnim }]}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    bounces={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.walmartBlue]}
                            tintColor={COLORS.walmartBlue}
                        />
                    }
                >
                    <View style={styles.navTabsContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.navTabs}
                        >
                            <TouchableOpacity
                                style={styles.navTab}
                                onPress={() => handleNavigation('/category')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="grid-outline" size={16} color={COLORS.textPrimary} />
                                <Text style={[styles.navTabText, { fontWeight: '700' }]}>Departments</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navTab}
                                onPress={() => handleNavigation('/product?filter=fast-delivery')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="flash-outline" size={16} color={COLORS.textPrimary} />
                                <Text style={[styles.navTabText, { fontWeight: '700' }]}>Get it Fast</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navTab}
                                onPress={() => handleNavigation('/product?filter=new-arrivals')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="sparkles-outline" size={16} color={COLORS.textPrimary} />
                                <Text style={[styles.navTabText, { fontWeight: '700' }]}>New Arrivals</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navTab}
                                onPress={() => handleNavigation('/product?filter=trending')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="trending-up-outline" size={16} color={COLORS.textPrimary} />
                                <Text style={[styles.navTabText, { fontWeight: '700' }]}>Fall Deals</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Hero Banner Section */}
                    <View style={styles.heroContainer}>
                        <FlatList
                            ref={bannerFlatListRef}
                            data={HERO_SLIDES}
                            renderItem={renderHeroBanner}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                            onScroll={onBannerScroll}
                            contentContainerStyle={styles.servicesContent}
                        />
                    </View>

                    {/* Enhanced Shop by Category */}
                    {featuredCategories.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { fontWeight: '900' }]}>Browse Categories</Text>
                                <TouchableOpacity
                                    onPress={() => handleNavigation('/category')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.viewAllText, { fontWeight: '800' }]}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.categoriesGrid}>
                                {featuredCategories.map((category, index) => renderCategory(category, index))}
                            </View>
                        </View>
                    )}

                    {/* Flash Deals Section */}
                    {FLASH_DEALS.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { fontWeight: '900' }]}>Flash Deals</Text>
                                <Text style={[styles.sectionSubtitle, { fontWeight: '600' }]}>Limited time offers</Text>
                                <TouchableOpacity
                                    onPress={() => handleNavigation('/product?filter=flash-deals')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.viewAllText, { fontWeight: '800' }]}>View all</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={FLASH_DEALS}
                                renderItem={({ item }) => renderProductCard({ item })}
                                keyExtractor={(item) => `flash-${item.id}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.productsContent}
                            />
                        </View>
                    )}

                    {/* Promotional Banners */}
                    <View style={styles.promoBannersSection}>
                        {PROMOTIONAL_BANNERS.map(renderPromotionalBanner)}
                    </View>

                    {/* Trending Products Section */}
                    {TRENDING_PRODUCTS.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { fontWeight: '900' }]}>Trending Now</Text>
                                <Text style={[styles.sectionSubtitle, { fontWeight: '600' }]}>What's popular</Text>
                                <TouchableOpacity
                                    onPress={() => handleNavigation('/product?filter=trending')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.viewAllText, { fontWeight: '800' }]}>View all</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={TRENDING_PRODUCTS}
                                renderItem={({ item }) => renderProductCard({ item, cardStyle: 'compact' })}
                                keyExtractor={(item) => `trending-${item.id}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.productsContent}
                            />
                        </View>
                    )}

                    {/* New Arrivals Section */}
                    {NEW_ARRIVALS.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { fontWeight: '900' }]}>New Arrivals</Text>
                                <Text style={[styles.sectionSubtitle, { fontWeight: '600' }]}>Fresh finds</Text>
                                <TouchableOpacity
                                    onPress={() => handleNavigation('/product?filter=new-arrivals')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.viewAllText, { fontWeight: '800' }]}>View all</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={NEW_ARRIVALS}
                                renderItem={({ item }) => renderProductCard({ item, cardStyle: 'compact' })}
                                keyExtractor={(item) => `new-${item.id}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.productsContent}
                            />
                        </View>
                    )}

                    {/* Best Sellers Section */}
                    {BEST_SELLERS.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { fontWeight: '900' }]}>Best Sellers</Text>
                                <Text style={[styles.sectionSubtitle, { fontWeight: '600' }]}>Customer favorites</Text>
                                <TouchableOpacity
                                    onPress={() => handleNavigation('/product?filter=best-sellers')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.viewAllText, { fontWeight: '800' }]}>View all</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bestSellersGrid}>
                                {BEST_SELLERS.map((item, index) => (
                                    <View key={`bestseller-${item.id}`} style={styles.bestSellerItem}>
                                        {renderProductCard({ item, cardStyle: 'wide' })}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Enhanced Shopping Tools */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontWeight: '900' }]}>Shopping Tools</Text>
                            <Text style={[styles.sectionSubtitle, { fontWeight: '600' }]}>Make shopping easier</Text>
                        </View>

                        <View style={styles.shoppingToolsGrid}>
                            <TouchableOpacity
                                style={styles.toolCard}
                                onPress={() => handleNavigation('/profile/recently-viewed')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.toolIcon, { backgroundColor: '#EFF6FF' }]}>
                                    <Ionicons name="time-outline" size={24} color={COLORS.walmartBlue} />
                                </View>
                                <View style={styles.toolTextContainer}>
                                    <Text style={[styles.toolTitle, { fontWeight: '800' }]}>Recently Viewed</Text>
                                    <Text style={[styles.toolSubtitle, { fontWeight: '600' }]}>Continue where you left off</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.toolCard}
                                onPress={() => handleNavigation('/profile/favorites')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.toolIcon, { backgroundColor: '#FEF2F2' }]}>
                                    <Ionicons name="heart-outline" size={24} color={COLORS.error} />
                                </View>
                                <View style={styles.toolTextContainer}>
                                    <Text style={[styles.toolTitle, { fontWeight: '800' }]}>Saved Items</Text>
                                    <Text style={[styles.toolSubtitle, { fontWeight: '600' }]}>Your favorite products</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.shoppingToolsGrid}>
                            <TouchableOpacity
                                style={styles.toolCard}
                                onPress={() => handleNavigation('/orders')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.toolIcon, { backgroundColor: '#F0FDF4' }]}>
                                    <Ionicons name="receipt-outline" size={24} color={COLORS.success} />
                                </View>
                                <View style={styles.toolTextContainer}>
                                    <Text style={[styles.toolTitle, { fontWeight: '800' }]}>Order History</Text>
                                    <Text style={[styles.toolSubtitle, { fontWeight: '600' }]}>Track your orders</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.toolCard}
                                onPress={() => handleNavigation('/store/locator')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.toolIcon, { backgroundColor: '#FFFBEB' }]}>
                                    <Ionicons name="location-outline" size={24} color={COLORS.warning} />
                                </View>
                                <View style={styles.toolTextContainer}>
                                    <Text style={[styles.toolTitle, { fontWeight: '800' }]}>Store Locator</Text>
                                    <Text style={[styles.toolSubtitle, { fontWeight: '600' }]}>Find nearby stores</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Enhanced Savings Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontWeight: '900' }]}>More Ways to Save</Text>
                            <Text style={[styles.sectionSubtitle, { fontWeight: '600' }]}>Exclusive benefits</Text>
                        </View>

                        <View style={styles.savingsGrid}>
                            <TouchableOpacity
                                style={[styles.savingsCard, { backgroundColor: '#EFF6FF' }]}
                                onPress={() => handleNavigation('/(tabs)/services')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="shield-checkmark" size={32} color={COLORS.walmartBlue} />
                                <Text style={[styles.savingsTitle, { fontWeight: '800' }]}>Giant+</Text>
                                <Text style={[styles.savingsSubtitle, { fontWeight: '600' }]}>Free delivery & more benefits</Text>
                                <View style={styles.savingsButton}>
                                    <Text style={[styles.savingsButtonText, { color: COLORS.walmartBlue, fontWeight: '800' }]}>Learn More</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.savingsCard, { backgroundColor: '#F0FDF4' }]}
                                onPress={() => handleNavigation('/product?filter=rollbacks')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="trending-down" size={32} color={COLORS.success} />
                                <Text style={[styles.savingsTitle, { fontWeight: '800' }]}>Rollbacks</Text>
                                <Text style={[styles.savingsSubtitle, { fontWeight: '600' }]}>Prices dropped even lower</Text>
                                <View style={styles.savingsButton}>
                                    <Text style={[styles.savingsButtonText, { color: COLORS.success, fontWeight: '800' }]}>Shop Now</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.savingsGrid}>
                            <TouchableOpacity
                                style={[styles.savingsCard, { backgroundColor: '#FFFBEB' }]}
                                onPress={() => handleNavigation('/product?filter=clearance')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="pricetag" size={32} color={COLORS.warning} />
                                <Text style={[styles.savingsTitle, { fontWeight: '800' }]}>Clearance</Text>
                                <Text style={[styles.savingsSubtitle, { fontWeight: '600' }]}>Final markdowns up to 80% off</Text>
                                <View style={styles.savingsButton}>
                                    <Text style={[styles.savingsButtonText, { color: COLORS.warning, fontWeight: '800' }]}>Shop Clearance</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.savingsCard, { backgroundColor: '#FEF2F2' }]}
                                onPress={() => handleNavigation('/(tabs)/services')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="gift" size={32} color={COLORS.error} />
                                <Text style={[styles.savingsTitle, { fontWeight: '800' }]}>Gift Cards</Text>
                                <Text style={[styles.savingsSubtitle, { fontWeight: '600' }]}>Perfect for any occasion</Text>
                                <View style={styles.savingsButton}>
                                    <Text style={[styles.savingsButtonText, { color: COLORS.error, fontWeight: '800' }]}>Buy Gift Cards</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Enhanced Footer */}
                    <View style={styles.footerSection}>
                        <View style={styles.footerTop}>
                            <TouchableOpacity
                                style={styles.feedbackCard}
                                onPress={() => handleNavigation('/support/feedback')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="chatbubble-outline" size={24} color={COLORS.walmartBlue} />
                                <View style={styles.feedbackContent}>
                                    <Text style={[styles.feedbackTitle, { fontWeight: '800' }]}>How was your experience?</Text>
                                    <Text style={[styles.feedbackSubtitle, { fontWeight: '600' }]}>Help us improve the app</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerLinksGrid}>
                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => handleNavigation('/support/help')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={[styles.footerLinkText, { fontWeight: '600' }]}>Help Center</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => handleNavigation('/orders')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="receipt-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={[styles.footerLinkText, { fontWeight: '600' }]}>Track Orders</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => handleNavigation('/store/locator')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={[styles.footerLinkText, { fontWeight: '600' }]}>Store Finder</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => handleNavigation('/support/contact')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={[styles.footerLinkText, { fontWeight: '600' }]}>Contact Us</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerInfo}>
                            <Text style={[styles.footerInfoText, { fontWeight: '600' }]}>
                                © 2025 Giant Inc. All Rights Reserved.
                            </Text>
                            <View style={styles.footerSocial}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-facebook" size={20} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-twitter" size={20} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-instagram" size={20} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomSpacing} />
                </Animated.ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    // --- Main Container Styles ---
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: COLORS.white,
        zIndex: 0,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    // --- Header & Global Component Styles ---
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    signInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 20,
        borderColor: COLORS.white,
        borderWidth: 1,
        backgroundColor: 'white',
    },
    signInText: {
        color: COLORS.walmartBlue,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: SPACING.xs,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoText: {
        color: COLORS.walmartDarkBlue,
        fontFamily: 'redress',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
    },
    cartButton: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 100,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cartIconContainer: {
        position: 'relative',
        marginBottom: -4,
    },
    cartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '800',
    },
    cartDetails: {
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    cartTotal: {
        color: COLORS.black,
        fontSize: 18,
        fontWeight: '800',
    },
    searchContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 28,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    searchPlaceholder: {
        color: COLORS.mediumGray,
        marginLeft: SPACING.sm,
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    barcodeButton: {
        padding: SPACING.sm,
        borderRadius: SPACING.sm,
    },
    locationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    locationContent: {
        flex: 1,
        marginLeft: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    locationDetails: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '800',
    },

    // --- Navigation Tabs ---
    navTabsContainer: {
        backgroundColor: COLORS.lightGray,
    },
    navTabs: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
    },
    navTab: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.xl,
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    navTabText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: SPACING.sm,
    },

    // --- Hero Banner Styles ---
    heroContainer: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
        marginBottom: SPACING.md,
    },
    heroCarousel: {
        paddingHorizontal: 0,
    },
    heroBanner: {
        borderRadius: 24,
        padding: SPACING.xl,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginRight: SPACING.md,
        width: screenWidth - 40,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    lastBanner: {
        marginRight: 0,
    },
    heroBannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.black,
        opacity: 0.2,
    },
    heroBannerContent: {
        flex: 1,
        zIndex: 2,
        height: 150,
    },
    heroBannerTitle: {
        fontSize: 18,
        color: COLORS.white,
        marginBottom: SPACING.sm,
        fontWeight: '700',
        opacity: 0.95,
    },
    heroBannerSubtitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: SPACING.lg,
        lineHeight: 38,
    },
    heroBannerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: COLORS.black,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 10,
        marginTop: SPACING.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    heroBannerButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
    heroBannerImage: {
        width: 140,
        height: 100,
        borderRadius: 20,
        position: 'absolute',
        right: SPACING.xl,
        opacity: 0.85,
    },
    rollbacksBadge: {
        position: 'absolute',
        bottom: 34,
        left: SPACING.xl,
        backgroundColor: COLORS.error,
        borderRadius: 24,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    rollbacksText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '800',
    },

    // --- Section Styles ---
    section: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.textPrimary,
        flex: 1,
        letterSpacing: 0.5,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: COLORS.walmartBlue,
        marginRight: SPACING.md,
        fontWeight: '700',
    },
    viewAllText: {
        color: COLORS.walmartBlue,
        fontSize: 16,
        fontWeight: '800',
    },

    // --- Enhanced Product Card Styles ---
    productsContent: {
        paddingHorizontal: 0,
        marginTop: SPACING.md,
    },
    productCard: {
        width: 260,
        marginRight: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        position: 'relative',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    productCardCompact: {
        width: 160,
    },
    productCardWide: {
        width: '100%',
        marginRight: 0,
        marginBottom: SPACING.md,
    },
    productImage: {
        width: '100%',
        height: 220,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: COLORS.lightGray,
    },
    productImageCompact: {
        height: 160,
    },
    productImageWide: {
        height: 220,
    },
    discountBadge: {
        position: 'absolute',
        top: SPACING.md,
        left: SPACING.md,
        backgroundColor: COLORS.error,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '800',
    },
    productBadge: {
        position: 'absolute',
        top: SPACING.md,
        right: 56,
        borderRadius: 10,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    productBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '800',
    },
    favoriteButton: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    productInfo: {
        padding: SPACING.md,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.success,
        marginRight: SPACING.sm,
    },
    productOriginalPrice: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
        fontWeight: '700',
    },
    productName: {
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: '800',
        lineHeight: 22,
        marginBottom: SPACING.sm,
    },
    productMeta: {
        marginBottom: SPACING.sm,
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    ratingText: {
        color: COLORS.textPrimary,
        fontSize: 13,
        marginLeft: SPACING.xs,
        fontWeight: '800',
    },
    reviewCount: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginLeft: 3,
        fontWeight: '700',
    },
    shippingBadge: {
        backgroundColor: COLORS.success,
        borderRadius: 6,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    shippingText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '800',
    },
    quickAddButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    quickAddText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '900',
        marginLeft: SPACING.sm,
    },

    // --- Services Styles ---
    servicesContent: {
        paddingHorizontal: 0,
    },
    serviceItem: {
        alignItems: 'center',
        marginRight: SPACING.xl,
        width: 120,
    },
    serviceIcon: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    serviceText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        textAlign: 'center',
        fontWeight: '800',
        lineHeight: 20,
    },

    // --- Enhanced Categories Grid ---
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '31%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.md,
        alignItems: 'center',
        marginBottom: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    categoryIcon: {
        width: 64,
        height: 64,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    categoryName: {
        fontSize: 16,
        color: COLORS.textPrimary,
        textAlign: 'center',
        fontWeight: '800',
        marginBottom: 6,
        lineHeight: 18,
    },
    categoryCount: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontWeight: '700',
    },

    // --- Promotional Banners Styles ---
    promoBannersSection: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl,
    },
    promoBanner: {
        borderRadius: 24,
        padding: SPACING.xl,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    promoBannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.black,
        opacity: 0.15,
    },
    promoBannerContent: {
        flex: 1,
        zIndex: 2,
        height: 140,
    },
    promoBannerTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: SPACING.sm,
    },
    promoBannerSubtitle: {
        fontSize: 17,
        marginBottom: SPACING.sm,
        opacity: 0.95,
        fontWeight: '700',
    },
    promoTimerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 16,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        alignSelf: 'flex-start',
        marginBottom: SPACING.md,
    },
    promoTimerText: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: SPACING.xs,
    },
    promoBannerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 2,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    promoBannerButtonText: {
        fontSize: 16,
        fontWeight: '800',
    },
    promoBannerImage: {
        width: 110,
        height: 90,
        borderRadius: 16,
        position: 'absolute',
        right: SPACING.xl,
        opacity: 0.75,
    },

    // --- Best Sellers Grid ---
    bestSellersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    bestSellerItem: {
        width: '48%',
        marginBottom: SPACING.md,
    },

    // --- Shopping Tools Grid ---
    shoppingToolsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
        marginHorizontal: -SPACING.sm, // Add negative margin to account for item margins
    },
    toolCard: {
        // Corrected to flex column to stack items
        flexDirection: 'column',
        flex: 1, // Use flex to distribute space evenly
        backgroundColor: COLORS.white, // Changed background to white
        borderRadius: 20,
        padding: SPACING.md,
        marginHorizontal: SPACING.sm, // Individual margin
        alignItems: 'flex-start', // Align items to the left
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1, // Softer shadow
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        height: 140, // Set a fixed height for consistent cards
        justifyContent: 'space-between', // Distribute items vertically
    },
    toolIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        // Removed margin since it's now stacked
    },
    toolTextContainer: {
        marginTop: SPACING.sm,
    },
    toolTitle: {
        fontSize: 15,
        fontWeight: '800', // Adjusted from 900
        color: COLORS.textPrimary,
        // Removed flex: 1
    },
    toolSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '600', // Adjusted from 700
        // Removed flex: 1
        marginTop: 3,
    },

    // --- Savings Grid Styles ---
    savingsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    savingsCard: {
        width: '48%',
        borderRadius: 20,
        padding: SPACING.xl,
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    savingsTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    savingsSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.md,
        fontWeight: '700',
        lineHeight: 18,
    },
    savingsButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    savingsButtonText: {
        fontSize: 13,
        fontWeight: '900',
    },

    // --- Footer Styles ---
    footerSection: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
    },
    footerTop: {
        marginBottom: SPACING.xl,
    },
    feedbackCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    feedbackContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    feedbackSubtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    footerLinksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        paddingVertical: 14,
    },
    footerLinkText: {
        fontSize: 15,
        color: COLORS.black,
        marginLeft: SPACING.sm,
        fontWeight: '700',
    },
    footerInfo: {
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
    },
    footerInfoText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.md,
        fontWeight: '700',
    },
    footerSocial: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 22,
        padding: SPACING.sm,
        marginHorizontal: SPACING.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    bottomSpacing: {
        height: SPACING.md,
    },
});