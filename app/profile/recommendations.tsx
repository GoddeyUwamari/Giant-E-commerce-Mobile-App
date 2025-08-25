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
    RefreshControl,
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
    ALL_PRODUCTS,
    getAllFeaturedProducts,
    getAllSaleProducts,
    getAllTrendingProducts,
    getProductsByCategory,
    getRelatedProducts,
    getRandomProducts,
    CATEGORIES,
    Product
} from '../../constants/products';
import { getProductImageBySize } from '../../assets/images/imageLoader';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Walmart colors
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

// Preference interface
interface UserPreference {
    id: string;
    label: string;
    active: boolean;
    categoryKey?: keyof typeof CATEGORIES;
}

// Recommendation section interface
interface RecommendationSection {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    products: Product[];
    algorithm: 'trending' | 'personalized' | 'deals' | 'related' | 'seasonal' | 'featured';
}

// Storage keys
const PREFERENCES_KEY = 'user_preferences';
const RECENTLY_VIEWED_KEY = 'recently_viewed_products';

export default function RecommendationsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [preferences, setPreferences] = useState<UserPreference[]>([]);
    const [recommendationSections, setRecommendationSections] = useState<RecommendationSection[]>([]);
    const [stats, setStats] = useState({
        itemsRecommended: 0,
        matchScore: 0,
        avgSavings: 0,
    });
    const [isAddingToCart, setIsAddingToCart] = useState<{ [key: string]: boolean }>({});

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Zustand cart store - INTEGRATED
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    useEffect(() => {
        loadUserData();
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

    // Load user preferences and generate recommendations
    const loadUserData = async () => {
        try {
            setIsLoading(true);

            // Load user preferences
            const storedPreferences = await AsyncStorage.getItem(PREFERENCES_KEY);
            let userPreferences: UserPreference[];

            if (storedPreferences) {
                userPreferences = JSON.parse(storedPreferences);
            } else {
                // Initialize with categories from unified system
                userPreferences = Object.entries(CATEGORIES).map(([key, category]) => ({
                    id: key,
                    label: category.name,
                    active: Math.random() > 0.5, // Random initial preferences
                    categoryKey: key as keyof typeof CATEGORIES,
                }));
                await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(userPreferences));
            }

            setPreferences(userPreferences);

            // Generate personalized recommendations
            await generateRecommendations(userPreferences);

        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate smart recommendations using unified product system
    const generateRecommendations = async (userPreferences: UserPreference[]) => {
        try {
            const sections: RecommendationSection[] = [];

            // 1. Trending Now - using unified system
            const trendingProducts = getAllTrendingProducts().slice(0, 8);
            if (trendingProducts.length > 0) {
                sections.push({
                    id: 'trending',
                    title: 'Trending Now',
                    subtitle: 'Popular items customers are buying',
                    icon: 'trending-up',
                    products: trendingProducts,
                    algorithm: 'trending',
                });
            }

            // 2. Personalized recommendations based on preferences
            const activePreferences = userPreferences.filter(p => p.active);
            if (activePreferences.length > 0) {
                const personalizedProducts: Product[] = [];
                activePreferences.forEach(pref => {
                    if (pref.categoryKey) {
                        const categoryProducts = getProductsByCategory(pref.categoryKey);
                        personalizedProducts.push(...categoryProducts.slice(0, 3));
                    }
                });

                if (personalizedProducts.length > 0) {
                    sections.push({
                        id: 'for-you',
                        title: 'Recommended for You',
                        subtitle: 'Based on your interests and preferences',
                        icon: 'person',
                        products: personalizedProducts.slice(0, 8),
                        algorithm: 'personalized',
                    });
                }
            }

            // 3. Deals You'll Love - using sale products
            const saleProducts = getAllSaleProducts().slice(0, 8);
            if (saleProducts.length > 0) {
                sections.push({
                    id: 'deals',
                    title: 'Deals You\'ll Love',
                    subtitle: 'Great savings on quality products',
                    icon: 'pricetag',
                    products: saleProducts,
                    algorithm: 'deals',
                });
            }

            // 4. Related to Recently Viewed
            const recentlyViewed = await getRecentlyViewedProducts();
            if (recentlyViewed.length > 0) {
                const relatedProducts: Product[] = [];
                recentlyViewed.slice(0, 3).forEach(productId => {
                    const related = getRelatedProducts(productId, 3);
                    relatedProducts.push(...related);
                });

                if (relatedProducts.length > 0) {
                    sections.push({
                        id: 'recently-viewed',
                        title: 'Related to Recently Viewed',
                        subtitle: 'Items similar to what you\'ve been looking at',
                        icon: 'eye',
                        products: relatedProducts.slice(0, 8),
                        algorithm: 'related',
                    });
                }
            }

            // 5. Featured Products
            const featuredProducts = getAllFeaturedProducts().slice(0, 8);
            if (featuredProducts.length > 0) {
                sections.push({
                    id: 'featured',
                    title: 'Staff Picks',
                    subtitle: 'Handpicked favorites from our team',
                    icon: 'star',
                    products: featuredProducts,
                    algorithm: 'featured',
                });
            }

            // 6. Seasonal/Random recommendations if needed
            if (sections.length < 4) {
                const randomProducts = getRandomProducts(8);
                sections.push({
                    id: 'seasonal',
                    title: 'You Might Also Like',
                    subtitle: 'Discover something new',
                    icon: 'sparkles',
                    products: randomProducts,
                    algorithm: 'seasonal',
                });
            }

            setRecommendationSections(sections);

            // Calculate stats
            const totalProducts = sections.reduce((sum, section) => sum + section.products.length, 0);
            const totalSavings = sections.flatMap(s => s.products)
                .filter(p => p.originalPrice && p.originalPrice > p.price)
                .reduce((sum, p) => sum + (p.originalPrice! - p.price), 0);

            setStats({
                itemsRecommended: totalProducts,
                matchScore: Math.min(95, 60 + (activePreferences.length * 5)),
                avgSavings: Math.round(totalSavings / Math.max(1, totalProducts)),
            });

        } catch (error) {
            console.error('Error generating recommendations:', error);
        }
    };

    // Get recently viewed products for related recommendations
    const getRecentlyViewedProducts = async (): Promise<string[]> => {
        try {
            const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
            if (stored) {
                const recentlyViewed = JSON.parse(stored);
                return recentlyViewed.map((item: any) => item.productId).slice(0, 5);
            }
        } catch (error) {
            console.error('Error getting recently viewed:', error);
        }
        return [];
    };

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await generateRecommendations(preferences);
        setRefreshing(false);
    }, [preferences]);

    // Handle product press
    const handleProductPress = useCallback(async (productId: string) => {
        // Save to recently viewed
        try {
            const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
            let recentlyViewed = stored ? JSON.parse(stored) : [];

            // Add or update item
            const existingIndex = recentlyViewed.findIndex((item: any) => item.productId === productId);
            const newItem = {
                productId,
                viewedAt: new Date().toISOString(),
                category: ALL_PRODUCTS.find(p => p.id === productId)?.category || 'unknown',
            };

            if (existingIndex >= 0) {
                recentlyViewed[existingIndex] = newItem;
            } else {
                recentlyViewed.unshift(newItem);
            }

            // Keep only last 20 items
            recentlyViewed = recentlyViewed.slice(0, 20);

            await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
        } catch (error) {
            console.error('Error saving recently viewed:', error);
        }

        // Navigate to product
        router.push(`/product/${productId}`);
    }, []);

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
    }, [addItem]);

    // Toggle preference
    const togglePreference = useCallback((preferenceId: string) => {
        setPreferences(prev =>
            prev.map(pref =>
                pref.id === preferenceId ? { ...pref, active: !pref.active } : pref
            )
        );
    }, []);

    // Save preferences
    const handleSavePreferences = useCallback(async () => {
        try {
            await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
            await generateRecommendations(preferences);
            Alert.alert(
                'Preferences Updated',
                'Your recommendations have been refreshed based on your interests!',
                [{ text: 'Great!', style: 'default' }]
            );
        } catch (error) {
            console.error('Error saving preferences:', error);
            Alert.alert('Error', 'Failed to save preferences');
        }
    }, [preferences]);

    // Check if product is in cart
    const isInCart = useCallback((productId: string) => {
        return cartItems.some(item => item.productId === productId);
    }, [cartItems]);

    // Handle feedback
    const handleFeedback = useCallback((type: 'positive' | 'negative') => {
        Alert.alert(
            'Thank You!',
            type === 'positive'
                ? 'We\'re glad you\'re enjoying your recommendations!'
                : 'Thanks for the feedback. We\'ll work on improving your recommendations.',
            [{ text: 'OK' }]
        );
    }, []);

    // Navigate to section view all
    const handleSeeAllSection = useCallback((section: RecommendationSection) => {
        // Navigate to filtered products based on algorithm
        switch (section.algorithm) {
            case 'trending':
                router.push('/product?filter=trending');
                break;
            case 'deals':
                router.push('/product?filter=flash-deals');
                break;
            case 'featured':
                router.push('/product?filter=featured');
                break;
            default:
                router.push('/product');
        }
    }, []);

    // Enhanced product card renderer
    const renderProductCard = useCallback((product: Product, isHorizontal = true) => (
        <Animated.View
            style={[
                isHorizontal ? styles.horizontalProductCard : styles.verticalProductCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <TouchableOpacity
                style={styles.productCardContent}
                onPress={() => handleProductPress(product.id)}
                activeOpacity={0.9}
            >
                <View style={styles.productImageContainer}>
                    <Image
                        source={getProductImageBySize(product.id, 'medium')}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    {product.badge && (
                        <View style={[styles.discountBadge, { backgroundColor: product.badgeColor || COLORS.error }]}>
                            <Text style={styles.discountText}>{product.badge}</Text>
                        </View>
                    )}
                    {product.featured && (
                        <View style={styles.walmartChoiceBadge}>
                            <Ionicons name="star" size={10} color={COLORS.white} />
                            <Text style={styles.walmartChoiceText}>Featured</Text>
                        </View>
                    )}
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.brandText}>{product.brand}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.warning} />
                        <Text style={styles.ratingText}>{product.rating}</Text>
                        <Text style={styles.reviewText}>({product.reviewCount})</Text>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>${product.price.toFixed(2)}</Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
                        )}
                    </View>

                    {isInCart(product.id) ? (
                        <View style={styles.inCartButton}>
                            <Ionicons name="checkmark" size={16} color={COLORS.success} />
                            <Text style={styles.inCartText}>In Cart</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.addToCartButton,
                                !product.inStock && styles.addToCartButtonDisabled,
                                isAddingToCart[product.id] && styles.addToCartButtonLoading
                            ]}
                            onPress={() => product.inStock && handleAddToCart(product)}
                            disabled={!product.inStock || isAddingToCart[product.id]}
                        >
                            {isAddingToCart[product.id] ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons name="add" size={16} color={COLORS.white} />
                                    <Text style={styles.addToCartText}>
                                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    ), [fadeAnim, slideAnim, handleProductPress, handleAddToCart, isInCart, isAddingToCart]);

    // Enhanced section renderer
    const renderSection = useCallback((section: RecommendationSection) => (
        <Animated.View
            key={section.id}
            style={[
                styles.sectionContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                    <View style={[styles.sectionIcon, { backgroundColor: `${COLORS.walmartBlue}15` }]}>
                        <Ionicons name={section.icon} size={24} color={COLORS.walmartBlue} />
                    </View>
                    <View style={styles.sectionTextContainer}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={() => handleSeeAllSection(section)}
                >
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.walmartBlue} />
                </TouchableOpacity>
            </View>

            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={section.products}
                renderItem={({ item }) => renderProductCard(item, true)}
                keyExtractor={(item) => `${section.id}-${item.id}`}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
        </Animated.View>
    ), [fadeAnim, slideAnim, renderProductCard, handleSeeAllSection]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.walmartBlue} />
                    <Text style={styles.loadingText}>Personalizing your recommendations...</Text>
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
                    <Text style={styles.headerTitle}>For You</Text>
                    <Text style={styles.headerSubtitle}>Personalized recommendations</Text>
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

                    <TouchableOpacity style={styles.settingsButton}>
                        <Ionicons name="settings-outline" size={24} color={COLORS.walmartBlue} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.walmartBlue]}
                        tintColor={COLORS.walmartBlue}
                    />
                }
            >
                {/* Enhanced Personalization Banner */}
                <Animated.View
                    style={[
                        styles.personalizationBanner,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.bannerContent}>
                        <View style={styles.bannerIconContainer}>
                            <Ionicons name="sparkles" size={32} color={COLORS.walmartBlue} />
                        </View>
                        <View style={styles.bannerText}>
                            <Text style={styles.bannerTitle}>Curated Just for You</Text>
                            <Text style={styles.bannerSubtitle}>
                                Smart recommendations based on your shopping patterns and preferences
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Enhanced Quick Stats */}
                <Animated.View
                    style={[
                        styles.statsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.itemsRecommended}</Text>
                        <Text style={styles.statLabel}>Items Found</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.matchScore}%</Text>
                        <Text style={styles.statLabel}>Match Score</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>${stats.avgSavings}</Text>
                        <Text style={styles.statLabel}>Avg. Savings</Text>
                    </View>
                </Animated.View>

                {/* Enhanced Preference Tags */}
                <Animated.View
                    style={[
                        styles.preferencesSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.preferencesHeader}>
                        <Ionicons name="heart" size={20} color={COLORS.walmartBlue} />
                        <Text style={styles.preferencesTitle}>Your Interests</Text>
                    </View>
                    <Text style={styles.preferencesDescription}>
                        Choose categories you're interested in to get better recommendations
                    </Text>

                    <View style={styles.preferenceTags}>
                        {preferences.map((pref) => (
                            <TouchableOpacity
                                key={pref.id}
                                style={[
                                    styles.preferenceTag,
                                    pref.active && styles.preferenceTagActive
                                ]}
                                onPress={() => togglePreference(pref.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.preferenceTagText,
                                    pref.active && styles.preferenceTagTextActive
                                ]}>
                                    {pref.label}
                                </Text>
                                {pref.active && (
                                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.savePreferencesButton}
                        onPress={handleSavePreferences}
                    >
                        <Ionicons name="refresh" size={16} color={COLORS.white} />
                        <Text style={styles.savePreferencesText}>Update Recommendations</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Recommendation Sections */}
                {recommendationSections.map(renderSection)}

                {/* Enhanced Feedback Section */}
                <Animated.View
                    style={[
                        styles.feedbackSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.feedbackIconContainer}>
                        <Ionicons name="chatbubble-ellipses" size={32} color={COLORS.walmartBlue} />
                    </View>
                    <Text style={styles.feedbackTitle}>How Are We Doing?</Text>
                    <Text style={styles.feedbackSubtitle}>
                        Your feedback helps us improve your recommendations
                    </Text>
                    <View style={styles.feedbackButtons}>
                        <TouchableOpacity
                            style={[styles.feedbackButton, styles.feedbackButtonPositive]}
                            onPress={() => handleFeedback('positive')}
                        >
                            <Ionicons name="thumbs-up" size={20} color={COLORS.success} />
                            <Text style={[styles.feedbackButtonText, { color: COLORS.success }]}>
                                Great!
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.feedbackButton, styles.feedbackButtonNegative]}
                            onPress={() => handleFeedback('negative')}
                        >
                            <Ionicons name="thumbs-down" size={20} color={COLORS.error} />
                            <Text style={[styles.feedbackButtonText, { color: COLORS.error }]}>
                                Needs Work
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Bottom spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
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
    settingsButton: {
        padding: 8,
        borderRadius: 8,
    },

    // Scroll Container
    scrollContainer: {
        flex: 1,
    },

    // Enhanced Personalization Banner
    personalizationBanner: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: `${COLORS.walmartBlue}15`,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    bannerText: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },

    // Enhanced Quick Stats
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.walmartBlue,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.borderColor,
        marginHorizontal: 16,
    },

    // Enhanced Preferences Section
    preferencesSection: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    preferencesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    preferencesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    preferencesDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    preferenceTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    preferenceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        gap: 6,
    },
    preferenceTagActive: {
        backgroundColor: COLORS.walmartBlue,
        borderColor: COLORS.walmartBlue,
    },
    preferenceTagText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    preferenceTagTextActive: {
        color: COLORS.white,
    },
    savePreferencesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 8,
    },
    savePreferencesText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },

    // Section Container
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sectionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTextContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.walmartBlue,
    },

    // Horizontal List
    horizontalList: {
        paddingHorizontal: 16,
    },

    // Product Cards
    horizontalProductCard: {
        width: 180,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginVertical: 4,
    },
    verticalProductCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginVertical: 4,
        marginHorizontal: 16,
    },
    productCardContent: {
        flex: 1,
        padding: 12,
    },
    productImageContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    productImage: {
        width: '100%',
        height: 140,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.error,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    walmartChoiceBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 2,
    },
    walmartChoiceText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '600',
    },

    // Product Info
    productInfo: {
        flex: 1,
    },
    brandText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        lineHeight: 18,
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    reviewText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
        gap: 6,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },

    // Cart Buttons
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 8,
        paddingVertical: 10,
        gap: 6,
    },
    addToCartButtonDisabled: {
        backgroundColor: COLORS.mediumGray,
    },
    addToCartButtonLoading: {
        backgroundColor: COLORS.walmartDarkBlue,
    },
    addToCartText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    inCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.success,
        gap: 6,
    },
    inCartText: {
        color: COLORS.success,
        fontSize: 14,
        fontWeight: '600',
    },

    // Enhanced Feedback Section
    feedbackSection: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 24,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    feedbackIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: `${COLORS.walmartBlue}15`,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    feedbackSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    feedbackButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    feedbackButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
        gap: 8,
    },
    feedbackButtonPositive: {
        backgroundColor: `${COLORS.success}10`,
        borderColor: COLORS.success,
    },
    feedbackButtonNegative: {
        backgroundColor: `${COLORS.error}10`,
        borderColor: COLORS.error,
    },
    feedbackButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 40,
    },
});