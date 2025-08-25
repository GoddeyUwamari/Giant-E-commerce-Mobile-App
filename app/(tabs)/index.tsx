import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    RefreshControl,
    StyleSheet,
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
import {
    ALL_PRODUCTS,
    getAllFeaturedProducts,
    getAllSaleProducts,
    getProductsByCategory,
    BANNERS_DATA
} from '../../constants/products';
import { CATEGORIES } from '../../constants/products';
import { getBannerImage, getProductImageBySize } from '../../assets/images/imageLoader';

const { width: screenWidth } = Dimensions.get('window');

// Updated Walmart Colors
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
    borderColor: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
};

// Enhanced Quick Services with better icons
const quickServices = [
    { id: '1', name: 'Pharmacy', icon: 'medical', color: '#EF4444', route: '/(tabs)/services' },
    { id: '2', name: 'Photo Center', icon: 'camera', color: '#8B5CF6', route: '/(tabs)/services' },
    { id: '3', name: 'Money Services', icon: 'card', color: '#10B981', route: '/(tabs)/services' },
    { id: '4', name: 'Vision Center', icon: 'glasses', color: '#F59E0B', route: '/(tabs)/services' },
    { id: '5', name: 'Auto Care', icon: 'car-sport', color: '#6B7280', route: '/(tabs)/services' },
    { id: '6', name: 'Gift Cards', icon: 'gift', color: '#EC4899', route: '/(tabs)/services' },
    { id: '7', name: 'Grocery', icon: 'basket', color: '#059669', route: '/category/grocery' },
    { id: '8', name: 'Tech Support', icon: 'construct', color: '#3B82F6', route: '/(tabs)/services' },
];

// Enhanced category mapping with proper routes
const getCategoryRoute = (categoryName: string) => {
    const routeMap: { [key: string]: string } = {
        'Electronics': '/category/electronics',
        'Fashion': '/category/fashion',
        'Home & Garden': '/category/home-garden', // Fixed the linking issue
        'Health & Beauty': '/category/health-beauty',
        'Baby & Kids': '/category/baby-kids',
        'Sports & Outdoors': '/category/sports-outdoors',
    };
    return routeMap[categoryName] || '/category';
};

// Additional promotional banners using available images
const PROMOTIONAL_BANNERS = [
    {
        id: 'promo_1',
        title: 'Black Friday Deals',
        subtitle: 'Save up to 80% on everything',
        image: getBannerImage('banner_07'),
        backgroundColor: '#1F2937',
        textColor: '#FFFFFF',
        ctaText: 'Shop Black Friday',
        route: '/product?filter=black-friday',
    },
    {
        id: 'promo_2',
        title: 'Free Grocery Pickup',
        subtitle: 'Order online, pickup today',
        image: getBannerImage('banner_08'),
        backgroundColor: '#059669',
        textColor: '#FFFFFF',
        ctaText: 'Start Shopping',
        route: '/category/grocery',
    },
    {
        id: 'promo_3',
        title: 'Walmart+ Members',
        subtitle: 'Free shipping with no order minimum',
        image: getBannerImage('banner_09'),
        backgroundColor: '#7C3AED',
        textColor: '#FFFFFF',
        ctaText: 'Join Walmart+',
        route: '/(tabs)/services',
    },
];

// Updated HERO_SLIDES with correct routing paths
const HERO_SLIDES = [
    {
        id: '1',
        title: 'Holiday Savings',
        subtitle: 'Up to 70% Off Everything',
        ctaText: 'Shop Now',
        backgroundColor: 'pink',
        image: getBannerImage('banner_01'),
        link: '/category/electronics',
        showRollbacks: true,
    },
    {
        id: '2',
        title: 'Electronics Mega Sale',
        subtitle: 'Latest Tech at Unbeatable Prices',
        ctaText: 'Shop Electronics',
        backgroundColor: 'aqua',
        image: getBannerImage('banner_02'),
        link: '/category/electronics',
        showRollbacks: false,
    },
    {
        id: '3',
        title: 'Fashion Winter Collection',
        subtitle: 'Stay Warm, Look Great',
        ctaText: 'Shop Fashion',
        backgroundColor: 'green',
        image: getBannerImage('banner_03'),
        link: '/category/fashion',
        showRollbacks: false,
    },
    {
        id: '4',
        title: 'Home & Garden Refresh',
        subtitle: 'Transform Your Space',
        ctaText: 'Shop Home',
        backgroundColor: '#059669',
        image: getBannerImage('banner_04'),
        link: '/category/home-garden',
        showRollbacks: false,
    },
    {
        id: '5',
        title: 'Health & Beauty Essentials',
        subtitle: 'Feel Your Best Every Day',
        ctaText: 'Shop Beauty',
        backgroundColor: '#BE185D',
        image: getBannerImage('banner_05'),
        link: '/category/health-beauty',
        showRollbacks: false,
    },
    {
        id: '6',
        title: 'Free Shipping',
        subtitle: 'On Orders Over $35',
        ctaText: 'Learn More',
        backgroundColor: COLORS.walmartBlue,
        image: getBannerImage('banner_06'),
        link: '/category',
        showRollbacks: false,
    }
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

    // Enhanced data calculations using more products
    const featuredCategories = useMemo(() => {
        if (!CATEGORIES || typeof CATEGORIES !== 'object') {
            return [];
        }
        return Object.entries(CATEGORIES).map(([key, category]) => ({
            ...category,
            slug: key,
            route: getCategoryRoute(category.name),
        })).filter(category =>
            category && category.products && category.products.some(product => product.featured)
        ).slice(0, 3);
    }, []);

    const FLASH_DEALS = useMemo(() => {
        try {
            return getAllSaleProducts().slice(0, 10); // Increased from 8 to 10
        } catch (error) {
            console.error('Error getting flash deals:', error);
            return [];
        }
    }, []);

    // New: Trending Products section
    const TRENDING_PRODUCTS = useMemo(() => {
        try {
            const allProducts = Object.values(CATEGORIES)
                .flatMap(category => category.products || [])
                .filter(product => product.trending || product.rating >= 4.5)
                .slice(0, 8);
            return allProducts;
        } catch (error) {
            console.error('Error getting trending products:', error);
            return [];
        }
    }, []);

    // New: Best Sellers section
    const BEST_SELLERS = useMemo(() => {
        try {
            const allProducts = Object.values(CATEGORIES)
                .flatMap(category => category.products || [])
                .filter(product => product.bestSeller || product.reviewCount > 1000)
                .slice(0, 6);
            return allProducts;
        } catch (error) {
            console.error('Error getting best sellers:', error);
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
                image: product.primaryImage || product.images?.[0]?.url,
                category: product.category,
                sku: product.sku,
                status: product.status || 'available',
                storeId: product.storeId || 'store_001',
                storeName: product.storeName || 'Walmart Supercenter',
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

    const WalmartLogo = () => (
        <View style={styles.logoContainer}>
            <View style={styles.walmartSpark}>
                <View style={[styles.sparkRay, styles.sparkRay1]} />
                <View style={[styles.sparkRay, styles.sparkRay2]} />
                <View style={[styles.sparkRay, styles.sparkRay3]} />
                <View style={[styles.sparkRay, styles.sparkRay4]} />
                <View style={[styles.sparkRay, styles.sparkRay5]} />
                <View style={[styles.sparkRay, styles.sparkRay6]} />
                <View style={styles.sparkCenter} />
            </View>
            <Text style={styles.logoText}>Walmart</Text>
        </View>
    );

    // Enhanced banner rendering with proper navigation
    const renderHeroBanner = ({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity
            style={[
                styles.heroBanner,
                { backgroundColor: item.backgroundColor },
                index === HERO_SLIDES.length - 1 ? styles.lastBanner : {}
            ]}
            onPress={() => {
                console.log('Banner pressed:', item.title, 'Link:', item.link);
                try {
                    router.push(item.link || '/category');
                } catch (error) {
                    console.error('Navigation error:', error);
                    router.replace('/category');
                }
            }}
            activeOpacity={0.9}
        >
            <View style={styles.heroBannerContent}>
                <Text style={styles.heroBannerTitle}>{item.title}</Text>
                <Text style={styles.heroBannerSubtitle}>{item.subtitle}</Text>
                <TouchableOpacity
                    style={styles.heroBannerButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        try {
                            router.push(item.link || '/category');
                        } catch (error) {
                            console.error('Button navigation error:', error);
                            router.replace('/category');
                        }
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.heroBannerButtonText}>{item.ctaText}</Text>
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

    // Enhanced product card renderer
    const renderProductCard = ({ item, cardStyle = 'default' }: { item: any; cardStyle?: 'default' | 'compact' | 'wide' }) => (
        <TouchableOpacity
            style={[
                styles.productCard,
                cardStyle === 'compact' && styles.productCardCompact,
                cardStyle === 'wide' && styles.productCardWide
            ]}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.9}
        >
            <Image
                source={getProductImageBySize(item.id, 'medium')}
                style={[
                    styles.productImage,
                    cardStyle === 'compact' && styles.productImageCompact,
                    cardStyle === 'wide' && styles.productImageWide
                ]}
                resizeMode="cover"
            />
            <TouchableOpacity style={styles.favoriteButton}>
                <Ionicons name="heart-outline" size={18} color={COLORS.mediumGray} />
            </TouchableOpacity>
            {item.discount && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                </View>
            )}
            {item.badge && (
                <View style={[styles.productBadge, { backgroundColor: item.badge === 'Best Seller' ? COLORS.error : COLORS.success }]}>
                    <Text style={styles.productBadgeText}>{item.badge}</Text>
                </View>
            )}
            <View style={styles.productInfo}>
                <Text style={styles.productPrice}>Now ${item.price}</Text>
                {item.originalPrice && item.originalPrice > item.price && (
                    <Text style={styles.productOriginalPrice}>${item.originalPrice}</Text>
                )}
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.productRating}>
                    <Ionicons name="star" size={12} color="#FCD34D" />
                    <Text style={styles.ratingText}>{item.rating} ({item.reviewCount})</Text>
                </View>
                <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() => handleQuickAddToCart(item)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={16} color={COLORS.white} />
                    <Text style={styles.quickAddText}>Add</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderFlashDeal = ({ item }: { item: any }) => renderProductCard({ item });

    // New: Promotional banner renderer
    const renderPromotionalBanner = (banner: any) => (
        <TouchableOpacity
            key={banner.id}
            style={[styles.promoBanner, { backgroundColor: banner.backgroundColor }]}
            onPress={() => router.push(banner.route)}
            activeOpacity={0.9}
        >
            <View style={styles.promoBannerContent}>
                <Text style={[styles.promoBannerTitle, { color: banner.textColor }]}>
                    {banner.title}
                </Text>
                <Text style={[styles.promoBannerSubtitle, { color: banner.textColor }]}>
                    {banner.subtitle}
                </Text>
                <TouchableOpacity
                    style={[styles.promoBannerButton, { borderColor: banner.textColor }]}
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push(banner.route);
                    }}
                >
                    <Text style={[styles.promoBannerButtonText, { color: banner.textColor }]}>
                        {banner.ctaText}
                    </Text>
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
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
        >
            <View style={[styles.serviceIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.serviceText}>{item.name}</Text>
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
            <StatusBar barStyle="light-content" backgroundColor={COLORS.walmartBlue} />

            <View style={styles.headerBackground} />

            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={() => router.push('/(auth)/login')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>

                        <WalmartLogo />

                        {/* Enhanced Cart Button with Real Data */}
                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => router.push('/(modals)/cart')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cartIconContainer}>
                                <Ionicons name="cart-outline" size={24} color={COLORS.white} />
                                {cartSummary.itemCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{cartSummary.itemCount}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cartDetails}>
                                <Text style={styles.cartTotal}>
                                    ${cartSummary.total.toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.searchContainer}
                        onPress={() => router.push('/(tabs)/search')}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="search" size={20} color={COLORS.mediumGray} />
                        <Text style={styles.searchPlaceholder}>Search everything at Walmart</Text>
                        <TouchableOpacity style={styles.barcodeButton} activeOpacity={0.7}>
                            <Ionicons name="barcode-outline" size={20} color={COLORS.mediumGray} />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.locationBar}
                        onPress={() => router.push('/store/locator')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="location" size={16} color={COLORS.white} />
                        <Text style={styles.locationText}>Pickup or delivery?</Text>
                        <Text style={styles.locationDetails}>Irvington, 07111</Text>
                        <Ionicons name="chevron-down" size={16} color={COLORS.white} />
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
                    {/* Enhanced Navigation Tabs */}
                    <View style={styles.navTabs}>
                        <TouchableOpacity
                            style={styles.navTab}
                            onPress={() => router.push('/category')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.navTabText}>Departments</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navTab}
                            onPress={() => router.push('/product?filter=fast-delivery')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.navTabText}>Get it Fast</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navTab}
                            onPress={() => router.push('/product?filter=new-arrivals')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.navTabText}>New Arrivals</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navTab}
                            onPress={() => router.push('/product?filter=trending')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.navTabText}>Trending</Text>
                        </TouchableOpacity>
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
                            pagingEnabled={true}
                            snapToInterval={screenWidth - 20}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            contentContainerStyle={styles.heroCarousel}
                            onScroll={onBannerScroll}
                            scrollEventThrottle={16}
                            initialScrollIndex={0}
                            getItemLayout={(data, index) => ({
                                length: screenWidth - 20,
                                offset: (screenWidth - 20) * index,
                                index,
                            })}
                        />

                        {/* Banner Pagination Dots */}
                        <View style={styles.bannerPagination}>
                            {HERO_SLIDES.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        currentBannerIndex === index && styles.paginationDotActive
                                    ]}
                                    onPress={() => {
                                        bannerFlatListRef.current?.scrollToIndex({
                                            index,
                                            animated: true
                                        });
                                    }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Enhanced Special Offers */}
                    <View style={styles.offersContainer}>
                        <View style={styles.offerCard}>
                            <Ionicons name="flash" size={24} color="#F59E0B" />
                            <View style={styles.offerContent}>
                                <Text style={[styles.offerTitle, { color: '#F59E0B' }]}>Same-Day Delivery</Text>
                                <Text style={styles.offerSubtitle}>Get it today</Text>
                            </View>
                        </View>
                        <View style={styles.offerCard}>
                            <Ionicons name="pricetag" size={24} color="#10B981" />
                            <View style={styles.offerContent}>
                                <Text style={[styles.offerTitle, { color: '#10B981' }]}>Price Match</Text>
                                <Text style={styles.offerSubtitle}>We'll match it</Text>
                            </View>
                        </View>
                    </View>

                    {/* Flash Deals Section */}
                    {FLASH_DEALS.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Flash Deals</Text>
                                <Text style={styles.sectionSubtitle}>Up to 72% off</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/product?filter=flash-deals')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.viewAllText}>View all</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={FLASH_DEALS}
                                renderItem={renderFlashDeal}
                                keyExtractor={(item) => `flash-${item.id}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.productsContent}
                            />
                        </View>
                    )}

                    {/* Enhanced Quick Services */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Quick Services</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/services')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={quickServices}
                            renderItem={renderQuickService}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.servicesContent}
                        />
                    </View>

                    {/* Enhanced Shop by Category */}
                    {featuredCategories.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Shop by Category</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/category')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.mainCategoriesGrid}>
                                {featuredCategories.map((category, index) => (
                                    <TouchableOpacity
                                        key={`category-${index}`}
                                        style={styles.mainCategoryItem}
                                        onPress={() => {
                                            console.log('Category pressed:', category.name, 'Route:', category.route);
                                            router.push(category.route);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.mainCategoryIcon, { backgroundColor: `${category.color}15` }]}>
                                            <Ionicons name={category.icon} size={32} color={category.color} />
                                        </View>
                                        <Text style={styles.mainCategoryText}>{category.name}</Text>
                                        <Text style={styles.categoryItemCount}>{category.products.length} items</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* NEW: Additional Promotional Banners */}
                    <View style={styles.promoBannersSection}>
                        {PROMOTIONAL_BANNERS.map(renderPromotionalBanner)}
                    </View>

                    {/* NEW: Trending Products Section */}
                    {TRENDING_PRODUCTS.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Trending Now</Text>
                                <Text style={styles.sectionSubtitle}>What's popular</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/product?filter=trending')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.viewAllText}>View all</Text>
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

                    {/* NEW: Best Sellers Section */}
                    {BEST_SELLERS.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Best Sellers</Text>
                                <Text style={styles.sectionSubtitle}>Customer favorites</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/product?filter=best-sellers')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.viewAllText}>View all</Text>
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

                    {/* NEW: Recently Viewed Section (if user has viewed products) */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Continue Shopping</Text>
                            <Text style={styles.sectionSubtitle}>Pick up where you left off</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/profile/recently-viewed')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.viewAllText}>View all</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.recentlyViewedContainer}>
                            <TouchableOpacity
                                style={styles.recentlyViewedCard}
                                onPress={() => router.push('/profile/recently-viewed')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="time-outline" size={32} color={COLORS.walmartBlue} />
                                <Text style={styles.recentlyViewedTitle}>Recently Viewed</Text>
                                <Text style={styles.recentlyViewedSubtitle}>Continue where you left off</Text>
                                <View style={styles.recentlyViewedButton}>
                                    <Text style={styles.recentlyViewedButtonText}>View History</Text>
                                    <Ionicons name="arrow-forward" size={16} color={COLORS.walmartBlue} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.recentlyViewedCard}
                                onPress={() => router.push('/profile/favorites')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="heart-outline" size={32} color={COLORS.error} />
                                <Text style={styles.recentlyViewedTitle}>Saved Items</Text>
                                <Text style={styles.recentlyViewedSubtitle}>Your favorite products</Text>
                                <View style={styles.recentlyViewedButton}>
                                    <Text style={styles.recentlyViewedButtonText}>View Saved</Text>
                                    <Ionicons name="arrow-forward" size={16} color={COLORS.error} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* NEW: Special Features Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>More Ways to Save</Text>
                            <Text style={styles.sectionSubtitle}>Exclusive benefits</Text>
                        </View>

                        <View style={styles.featuresGrid}>
                            <TouchableOpacity
                                style={[styles.featureCard, { backgroundColor: '#EFF6FF' }]}
                                onPress={() => router.push('/(tabs)/services')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="shield-checkmark" size={28} color={COLORS.walmartBlue} />
                                <Text style={styles.featureTitle}>Walmart+</Text>
                                <Text style={styles.featureSubtitle}>Free delivery & more</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.featureCard, { backgroundColor: '#F0FDF4' }]}
                                onPress={() => router.push('/product?filter=rollbacks')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="trending-down" size={28} color={COLORS.success} />
                                <Text style={styles.featureTitle}>Rollbacks</Text>
                                <Text style={styles.featureSubtitle}>Prices dropped</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.featureCard, { backgroundColor: '#FFFBEB' }]}
                                onPress={() => router.push('/product?filter=clearance')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="pricetag" size={28} color={COLORS.warning} />
                                <Text style={styles.featureTitle}>Clearance</Text>
                                <Text style={styles.featureSubtitle}>Final markdowns</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.featureCard, { backgroundColor: '#FEF2F2' }]}
                                onPress={() => router.push('/(tabs)/services')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="gift" size={28} color={COLORS.error} />
                                <Text style={styles.featureTitle}>Gift Cards</Text>
                                <Text style={styles.featureSubtitle}>Perfect for anyone</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* NEW: Footer Links Section */}
                    <View style={styles.footerSection}>
                        <View style={styles.footerLinksGrid}>
                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => router.push('/support/help')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={styles.footerLinkText}>Help Center</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => router.push('/orders')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="receipt-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={styles.footerLinkText}>Track Orders</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => router.push('/store/locator')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={styles.footerLinkText}>Store Finder</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.footerLink}
                                onPress={() => router.push('/support/contact')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={styles.footerLinkText}>Contact Us</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerInfo}>
                            <Text style={styles.footerInfoText}>
                                © 2025 Walmart Inc. All Rights Reserved.
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
    // Main Container Styles
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: COLORS.walmartBlue,
        zIndex: 0
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: COLORS.white
    },

    // Header Styles
    header: {
        backgroundColor: COLORS.walmartBlue,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    signInButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    signInText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600'
    },

    // Walmart Logo Styles
    logoContainer: {
        alignItems: 'center'
    },
    walmartSpark: {
        width: 36,
        height: 36,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6
    },
    sparkRay: {
        position: 'absolute',
        backgroundColor: COLORS.walmartYellow,
        borderRadius: 1
    },
    sparkRay1: { width: 16, height: 2.5, top: 2, transform: [{ rotate: '0deg' }] },
    sparkRay2: { width: 12, height: 2.5, top: 6, right: 2, transform: [{ rotate: '60deg' }] },
    sparkRay3: { width: 12, height: 2.5, bottom: 6, right: 2, transform: [{ rotate: '-60deg' }] },
    sparkRay4: { width: 16, height: 2.5, bottom: 2, transform: [{ rotate: '0deg' }] },
    sparkRay5: { width: 12, height: 2.5, bottom: 6, left: 2, transform: [{ rotate: '60deg' }] },
    sparkRay6: { width: 12, height: 2.5, top: 6, left: 2, transform: [{ rotate: '-60deg' }] },
    sparkCenter: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: COLORS.walmartYellow
    },
    logoText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '700'
    },

    // Enhanced Cart Button Styles
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 90,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cartIconContainer: {
        position: 'relative',
        marginRight: 10,
    },
    cartBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: COLORS.walmartYellow,
        borderRadius: 11,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.walmartBlue,
    },
    cartBadgeText: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '700'
    },
    cartDetails: {
        alignItems: 'flex-start',
    },
    cartTotal: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600'
    },

    // Search and Location Styles
    searchContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 26,
        paddingHorizontal: 18,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchPlaceholder: {
        color: COLORS.mediumGray,
        marginLeft: 14,
        flex: 1,
        fontSize: 16
    },
    barcodeButton: {
        padding: 6,
        borderRadius: 6,
    },
    locationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    locationText: {
        color: COLORS.white,
        fontSize: 14,
        marginLeft: 10,
        flex: 1
    },
    locationDetails: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
        marginRight: 10
    },

    // Navigation Tabs
    navTabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    navTab: {
        marginRight: 28,
        paddingVertical: 4,
    },
    navTabText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600'
    },

    // Hero Banner Styles
    heroContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    heroCarousel: {
        paddingHorizontal: 0
    },
    heroBanner: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginRight: 16,
        width: screenWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    lastBanner: {
        marginRight: 0
    },
    heroBannerContent: {
        flex: 1,
        zIndex: 2,
    },
    heroBannerTitle: {
        fontSize: 16,
        color: COLORS.textPrimary,
        marginBottom: 6,
        fontWeight: '500',
    },
    heroBannerSubtitle: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 20,
        lineHeight: 36,
    },
    heroBannerButton: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    heroBannerButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    heroBannerImage: {
        width: 130,
        height: 90,
        borderRadius: 16,
        position: 'absolute',
        right: 24,
        opacity: 0.8,
    },
    rollbacksBadge: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        backgroundColor: COLORS.error,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    rollbacksText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700'
    },

    // Banner Pagination Styles
    bannerPagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 20,
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.lightGray,
        marginHorizontal: 5,
        opacity: 0.6,
    },
    paginationDotActive: {
        backgroundColor: COLORS.walmartBlue,
        width: 28,
        opacity: 1,
    },

    // Special Offers Styles
    offersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 12,
        marginTop: 16,
    },
    offerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 16,
        padding: 18,
        marginRight: 12,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    offerContent: {
        marginLeft: 14
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4
    },
    offerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },

    // Section Styles
    section: {
        paddingHorizontal: 20,
        marginBottom: 32
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1
    },
    sectionSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginRight: 14,
        fontWeight: '500',
    },
    viewAllText: {
        color: COLORS.walmartBlue,
        fontSize: 16,
        fontWeight: '700'
    },

    // Product Card Styles
    productsContent: {
        paddingHorizontal: 0
    },
    productCard: {
        width: 170,
        marginRight: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
    },
    productCardCompact: {
        width: 150,
    },
    productCardWide: {
        width: '100%',
        marginRight: 0,
        marginBottom: 16,
    },
    productImage: {
        width: '100%',
        height: 170,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: COLORS.lightGray,
    },
    productImageCompact: {
        height: 150,
    },
    productImageWide: {
        height: 200,
    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700'
    },
    productBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    productBadgeText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '700',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3
    },
    productInfo: {
        padding: 14
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.success,
        marginBottom: 4
    },
    productOriginalPrice: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
        marginBottom: 6
    },
    productName: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 8
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },

    // Quick Add Button Styles
    quickAddButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    quickAddText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
    },

    // Services Styles
    servicesContent: {
        paddingHorizontal: 0
    },
    serviceItem: {
        alignItems: 'center',
        marginRight: 24,
        width: 110
    },
    serviceIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    serviceText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 18,
    },

    // Main Categories Styles
    mainCategoriesGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    mainCategoryItem: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 8
    },
    mainCategoryIcon: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    mainCategoryText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: 4,
    },
    categoryItemCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Promotional Banners Styles
    promoBannersSection: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    promoBanner: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    promoBannerContent: {
        flex: 1,
        zIndex: 2,
    },
    promoBannerTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 6,
    },
    promoBannerSubtitle: {
        fontSize: 16,
        marginBottom: 16,
        opacity: 0.9,
        fontWeight: '500',
    },
    promoBannerButton: {
        alignSelf: 'flex-start',
        borderWidth: 2,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    promoBannerButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    promoBannerImage: {
        width: 100,
        height: 80,
        borderRadius: 12,
        position: 'absolute',
        right: 24,
        opacity: 0.7,
    },

    // Best Sellers Grid
    bestSellersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    bestSellerItem: {
        width: '48%',
        marginBottom: 16,
    },

    // Recently Viewed Styles
    recentlyViewedContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    recentlyViewedCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 6,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    recentlyViewedTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 12,
        marginBottom: 6,
        textAlign: 'center',
    },
    recentlyViewedSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '500',
    },
    recentlyViewedButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recentlyViewedButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 6,
        color: COLORS.walmartBlue,
    },

    // Features Grid Styles
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureCard: {
        width: '48%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 12,
        marginBottom: 4,
        textAlign: 'center',
    },
    featureSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Footer Styles
    footerSection: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 20,
        paddingVertical: 32,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
    },
    footerLinksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        paddingVertical: 12,
    },
    footerLinkText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 10,
        fontWeight: '500',
    },
    footerInfo: {
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
    },
    footerInfoText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '500',
    },
    footerSocial: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 10,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 100
    },
});