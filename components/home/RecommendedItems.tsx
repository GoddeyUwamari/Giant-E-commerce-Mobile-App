import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    StyleSheet,
    Platform,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Import your unified system
import { useCartStore } from '../../store/slices/cartSlice';
import { useAI } from '../../hooks/useAI';
import {
    getAllFeaturedProducts,
    getAllTrendingProducts,
    getRelatedProducts,
    getRandomProducts,
    getTopRatedProducts,
    Product,
} from '../../constants/products';
import { getProductImageBySize } from '../../assets/images/imageLoader';

// Enhanced Types with AI Integration
interface AIRecommendedItem extends Product {
    reason: 'popular' | 'similar' | 'trending' | 'recently_viewed' | 'ai_recommended' | 'featured' | 'top_rated';
    aiReasoning?: string;
    confidence?: number;
    deliveryTime?: string;
    isPersonalized?: boolean;
}

interface RecommendedItemsProps {
    title?: string;
    subtitle?: string;
    showReasonBadges?: boolean;
    personalizedFor?: string;
    onSeeAllPress?: () => void;
    cardWidth?: number;
    showBrands?: boolean;
    showCategories?: boolean;
    showDeliveryInfo?: boolean;
    maxItems?: number;
    enableAI?: boolean;
    userProfile?: {
        purchaseHistory: Product[];
        browsedProducts: Product[];
        preferences: any;
        demographics?: any;
    };
}

interface ReasonConfig {
    label: string;
    icon: string;
    color: string;
    backgroundColor: string;
}

// Constants
const { width: screenWidth } = Dimensions.get('window');

const WALMART_COLORS = {
    primary: '#0071CE',
    primaryDark: '#005AA3',
    secondary: '#FFC220',
    success: '#00A652',
    error: '#E53E3E',
    warning: '#FF8C00',
    white: '#FFFFFF',
    black: '#000000',
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
    // Recommendation specific colors
    popularYellow: '#F59E0B',
    similarPurple: '#8B5CF6',
    trendingRed: '#EF4444',
    viewedCyan: '#06B6D4',
    aiGreen: '#10B981',
    deliveryGreen: '#059669',
    discountRed: '#DC2626',
    favoriteRed: '#EF4444',
    starYellow: '#F59E0B',
    backdropBlur: 'rgba(255, 255, 255, 0.9)',
    aiInsightPurple: '#8B5CF6',
    aiInsightBg: 'rgba(139, 92, 246, 0.05)',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

const TYPOGRAPHY = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
};

const REASON_CONFIG: Record<AIRecommendedItem['reason'], ReasonConfig> = {
    popular: {
        label: 'Popular',
        icon: 'trending-up',
        color: WALMART_COLORS.popularYellow,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    similar: {
        label: 'Similar',
        icon: 'copy',
        color: WALMART_COLORS.similarPurple,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
    },
    trending: {
        label: 'Trending',
        icon: 'flame',
        color: WALMART_COLORS.trendingRed,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    recently_viewed: {
        label: 'Viewed',
        icon: 'eye',
        color: WALMART_COLORS.viewedCyan,
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
    },
    ai_recommended: {
        label: 'AI Pick',
        icon: 'sparkles',
        color: WALMART_COLORS.aiGreen,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    featured: {
        label: 'Featured',
        icon: 'star',
        color: WALMART_COLORS.secondary,
        backgroundColor: 'rgba(255, 194, 32, 0.15)',
    },
    top_rated: {
        label: 'Top Rated',
        icon: 'trophy',
        color: WALMART_COLORS.success,
        backgroundColor: 'rgba(0, 166, 82, 0.15)',
    },
};

// Utility Functions
const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

const getCardWidth = (customWidth?: number): number => {
    return customWidth || 160;
};

const getDeliveryTime = (product: Product): string => {
    if (product.shipping?.free) {
        return 'Free 2-day delivery';
    }
    return product.shipping?.estimatedDays || 'Standard delivery';
};

const calculateDiscount = (original: number, current: number): number => {
    return Math.round(((original - current) / original) * 100);
};

// Rating Stars Component
const RatingStars = React.memo(({
                                    rating,
                                    reviewCount,
                                    size = 10
                                }: {
    rating: number;
    reviewCount: number;
    size?: number;
}) => (
    <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                    key={star}
                    name="star"
                    size={size}
                    color={star <= rating ? WALMART_COLORS.starYellow : WALMART_COLORS.gray200}
                />
            ))}
        </View>
        <Text style={[styles.reviewCount, { fontSize: size }]}>
            ({reviewCount})
        </Text>
    </View>
));

// Reason Badge Component
const ReasonBadge = React.memo(({
                                    reason,
                                    showReasonBadges,
                                    confidence
                                }: {
    reason: AIRecommendedItem['reason'];
    showReasonBadges: boolean;
    confidence?: number;
}) => {
    if (!showReasonBadges) return null;

    const config = REASON_CONFIG[reason];

    return (
        <View
            style={[
                styles.reasonBadge,
                { backgroundColor: config.backgroundColor },
            ]}
        >
            <Ionicons
                name={config.icon as any}
                size={10}
                color={config.color}
            />
            <Text style={[styles.reasonBadgeText, { color: config.color }]}>
                {config.label}
            </Text>
            {confidence && confidence > 0.8 && (
                <View style={styles.confidenceDot} />
            )}
        </View>
    );
});

// AI Confidence Indicator
const AIConfidenceIndicator = React.memo(({ confidence }: { confidence?: number }) => {
    if (!confidence || confidence < 0.7) return null;

    const getConfidenceColor = (conf: number) => {
        if (conf >= 0.9) return WALMART_COLORS.success;
        if (conf >= 0.8) return WALMART_COLORS.warning;
        return WALMART_COLORS.gray400;
    };

    return (
        <View style={[styles.confidenceIndicator, { borderColor: getConfidenceColor(confidence) }]}>
            <Text style={[styles.confidenceText, { color: getConfidenceColor(confidence) }]}>
                {Math.round(confidence * 100)}%
            </Text>
        </View>
    );
});

// Refresh Button Component
const RefreshButton = React.memo(({
                                      onRefresh,
                                      refreshing
                                  }: {
    onRefresh: () => void;
    refreshing: boolean;
}) => {
    const rotateAnim = useMemo(() => new Animated.Value(0), []);

    React.useEffect(() => {
        if (refreshing) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotateAnim.stopAnimation();
            rotateAnim.setValue(0);
        }
    }, [refreshing, rotateAnim]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
            activeOpacity={0.7}
        >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons name="refresh" size={16} color={WALMART_COLORS.gray600} />
            </Animated.View>
        </TouchableOpacity>
    );
});

// Item Card Component
const RecommendedItemCard = React.memo(({
                                            item,
                                            cardWidth,
                                            showReasonBadges,
                                            showBrands,
                                            showCategories,
                                            showDeliveryInfo,
                                            favorites,
                                            scaleAnim,
                                            onPress,
                                            onToggleFavorite,
                                            onAddToCart,
                                        }: {
    item: AIRecommendedItem;
    cardWidth: number;
    showReasonBadges: boolean;
    showBrands: boolean;
    showCategories: boolean;
    showDeliveryInfo: boolean;
    favorites: Set<string>;
    scaleAnim: Animated.Value;
    onPress: (item: AIRecommendedItem) => void;
    onToggleFavorite: (itemId: string) => void;
    onAddToCart: (item: AIRecommendedItem) => void;
}) => {
    const isFavorite = favorites.has(item.id);
    const discount = item.originalPrice ? calculateDiscount(item.originalPrice, item.price) : 0;
    const deliveryTime = getDeliveryTime(item);

    const handlePress = useCallback(() => onPress(item), [item, onPress]);
    const handleFavoritePress = useCallback(() => onToggleFavorite(item.id), [item.id, onToggleFavorite]);
    const handleAddToCart = useCallback(() => onAddToCart(item), [item, onAddToCart]);

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                { width: cardWidth, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity
                style={styles.card}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Image Container */}
                <View style={styles.imageContainer}>
                    <Image
                        source={getProductImageBySize(item.id, 'medium')}
                        style={styles.itemImage}
                        contentFit="cover"
                        transition={200}
                    />

                    <ReasonBadge
                        reason={item.reason}
                        showReasonBadges={showReasonBadges}
                        confidence={item.confidence}
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <View style={styles.discountBadgeContainer}>
                            <LinearGradient
                                colors={[WALMART_COLORS.error, WALMART_COLORS.discountRed]}
                                style={styles.discountBadge}
                            >
                                <Text style={styles.discountText}>
                                    -{discount}%
                                </Text>
                            </LinearGradient>
                        </View>
                    )}

                    {/* AI Confidence Indicator */}
                    {item.reason === 'ai_recommended' && (
                        <AIConfidenceIndicator confidence={item.confidence} />
                    )}

                    {/* Favorite Button */}
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleFavoritePress}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={14}
                            color={isFavorite ? WALMART_COLORS.favoriteRed : WALMART_COLORS.gray600}
                        />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    {showBrands && item.brand && (
                        <Text style={styles.brandText}>{item.brand}</Text>
                    )}

                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    {showCategories && (
                        <Text style={styles.categoryText}>{item.category}</Text>
                    )}

                    <RatingStars rating={item.rating} reviewCount={item.reviewCount} />

                    {/* Pricing */}
                    <View style={styles.pricingContainer}>
                        <View style={styles.priceColumn}>
                            <Text style={styles.currentPrice}>
                                {formatPrice(item.price)}
                            </Text>
                            {item.originalPrice && item.originalPrice > item.price && (
                                <Text style={styles.originalPrice}>
                                    {formatPrice(item.originalPrice)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* AI Reasoning */}
                    {item.aiReasoning && item.reason === 'ai_recommended' && (
                        <View style={styles.aiReasoningContainer}>
                            <Text style={styles.aiReasoningText} numberOfLines={2}>
                                {item.aiReasoning}
                            </Text>
                        </View>
                    )}

                    {/* Delivery Time */}
                    {showDeliveryInfo && (
                        <View style={styles.deliveryContainer}>
                            <Ionicons
                                name="time"
                                size={12}
                                color={WALMART_COLORS.deliveryGreen}
                            />
                            <Text style={styles.deliveryText}>
                                {deliveryTime}
                            </Text>
                        </View>
                    )}

                    {/* Quick Add Button */}
                    <TouchableOpacity
                        style={styles.quickAddButton}
                        onPress={handleAddToCart}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="add-circle-outline"
                            size={14}
                            color={WALMART_COLORS.white}
                            style={styles.quickAddIcon}
                        />
                        <Text style={styles.quickAddText}>Quick Add</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// Section Header Component
const SectionHeader = React.memo(({
                                      title,
                                      subtitle,
                                      personalizedFor,
                                      onSeeAllPress,
                                      onRefreshRecommendations,
                                      refreshing,
                                      aiEnabled,
                                  }: {
    title: string;
    subtitle?: string;
    personalizedFor?: string;
    onSeeAllPress?: () => void;
    onRefreshRecommendations?: () => void;
    refreshing: boolean;
    aiEnabled: boolean;
}) => (
    <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>{title}</Text>
                {aiEnabled && (
                    <View style={styles.aiPoweredBadge}>
                        <Ionicons name="sparkles" size={12} color={WALMART_COLORS.aiGreen} />
                        <Text style={styles.aiPoweredText}>AI</Text>
                    </View>
                )}
            </View>
            {subtitle && (
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
            )}
            {personalizedFor && (
                <View style={styles.personalizedContainer}>
                    <Ionicons
                        name="person-circle"
                        size={16}
                        color={WALMART_COLORS.similarPurple}
                    />
                    <Text style={styles.personalizedText}>
                        Personalized for {personalizedFor}
                    </Text>
                </View>
            )}
        </View>

        <View style={styles.headerRight}>
            {onRefreshRecommendations && (
                <RefreshButton
                    onRefresh={onRefreshRecommendations}
                    refreshing={refreshing}
                />
            )}

            {onSeeAllPress && (
                <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={onSeeAllPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={WALMART_COLORS.primary}
                    />
                </TouchableOpacity>
            )}
        </View>
    </View>
));

// AI Insight Component
const AIInsight = React.memo(({
                                  personalizedFor,
                                  aiRecommendationsCount,
                                  totalRecommendations
                              }: {
    personalizedFor?: string;
    aiRecommendationsCount: number;
    totalRecommendations: number;
}) => {
    if (!personalizedFor || aiRecommendationsCount === 0) return null;

    const aiPercentage = Math.round((aiRecommendationsCount / totalRecommendations) * 100);

    return (
        <View style={styles.aiInsight}>
            <View style={styles.aiInsightContent}>
                <View style={styles.aiIconContainer}>
                    <Ionicons
                        name="sparkles"
                        size={16}
                        color={WALMART_COLORS.aiInsightPurple}
                    />
                </View>
                <View style={styles.aiTextContainer}>
                    <Text style={styles.aiTitle}>
                        AI-Powered Recommendations
                    </Text>
                    <Text style={styles.aiDescription}>
                        {aiPercentage}% of these recommendations are personalized using AI based on your shopping history and preferences
                    </Text>
                </View>
            </View>
        </View>
    );
});

// Empty State Component
const EmptyState = React.memo(({ onRefresh }: { onRefresh?: () => void }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="bulb" size={48} color={WALMART_COLORS.gray400} />
        <Text style={styles.emptyTitle}>No recommendations yet</Text>
        <Text style={styles.emptySubtitle}>
            Browse more products to get personalized recommendations
        </Text>
        {onRefresh && (
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={onRefresh}
                activeOpacity={0.8}
            >
                <Text style={styles.exploreButtonText}>Explore Products</Text>
            </TouchableOpacity>
        )}
    </View>
));

// Loading State Component
const LoadingState = React.memo(() => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={WALMART_COLORS.primary} />
        <Text style={styles.loadingText}>Getting personalized recommendations...</Text>
    </View>
));

// Main Component
export default function RecommendedItems({
                                             title = 'Recommended for You',
                                             subtitle,
                                             showReasonBadges = true,
                                             personalizedFor,
                                             onSeeAllPress,
                                             cardWidth,
                                             showBrands = true,
                                             showCategories = true,
                                             showDeliveryInfo = true,
                                             maxItems = 10,
                                             enableAI = true,
                                             userProfile,
                                         }: RecommendedItemsProps): JSX.Element {
    // State
    const [items, setItems] = useState<AIRecommendedItem[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hooks
    const { getRecommendations, loading: aiLoading, error: aiError } = useAI();
    const { addItem: addToCart } = useCartStore();

    // Animations
    const scaleAnims = useMemo(
        () =>
            items.reduce((acc, item) => {
                acc[item.id] = new Animated.Value(1);
                return acc;
            }, {} as { [key: string]: Animated.Value }),
        [items]
    );

    // Computed values
    const computedCardWidth = useMemo(() => getCardWidth(cardWidth), [cardWidth]);
    const aiRecommendationsCount = useMemo(
        () => items.filter(item => item.reason === 'ai_recommended').length,
        [items]
    );

    // Create enhanced user profile with fallbacks
    const enhancedUserProfile = useMemo(() => {
        if (userProfile) return userProfile;

        // Create a basic profile for non-logged-in users
        return {
            purchaseHistory: [],
            browsedProducts: getRandomProducts(3),
            preferences: { categories: ['electronics', 'fashion'] },
            demographics: { ageRange: '25-34' }
        };
    }, [userProfile]);

    // Get fallback recommendations when AI is not available
    const getFallbackRecommendations = useCallback((): AIRecommendedItem[] => {
        const featured = getAllFeaturedProducts().slice(0, 3).map(product => ({
            ...product,
            reason: 'featured' as const,
            deliveryTime: getDeliveryTime(product),
        }));

        const trending = getAllTrendingProducts().slice(0, 3).map(product => ({
            ...product,
            reason: 'trending' as const,
            deliveryTime: getDeliveryTime(product),
        }));

        const topRated = getTopRatedProducts(4.5).slice(0, 4).map(product => ({
            ...product,
            reason: 'top_rated' as const,
            deliveryTime: getDeliveryTime(product),
        }));

        return [...featured, ...trending, ...topRated].slice(0, maxItems);
    }, [maxItems]);

    // Load recommendations
    const loadRecommendations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let recommendations: AIRecommendedItem[] = [];

            // Try to get AI recommendations if enabled
            if (enableAI && personalizedFor) {
                try {
                    const availableProducts = [
                        ...getAllFeaturedProducts(),
                        ...getAllTrendingProducts(),
                        ...getTopRatedProducts(4.0),
                    ];

                    const aiResult = await getRecommendations(
                        enhancedUserProfile,
                        availableProducts
                    );

                    if (aiResult && aiResult.recommendations.length > 0) {
                        // Convert AI recommendations to our format
                        recommendations = aiResult.recommendations.map((productId, index) => {
                            const product = availableProducts.find(p => p.id === productId);
                            if (!product) return null;

                            return {
                                ...product,
                                reason: 'ai_recommended' as const,
                                aiReasoning: aiResult.reasoning[index] || 'Recommended based on your preferences',
                                confidence: 0.8 + Math.random() * 0.2, // Simulate confidence score
                                deliveryTime: getDeliveryTime(product),
                                isPersonalized: true,
                            };
                        }).filter(Boolean) as AIRecommendedItem[];

                        // Fill remaining slots with fallback recommendations
                        if (recommendations.length < maxItems) {
                            const fallbackItems = getFallbackRecommendations()
                                .filter(item => !recommendations.some(rec => rec.id === item.id))
                                .slice(0, maxItems - recommendations.length);

                            recommendations = [...recommendations, ...fallbackItems];
                        }
                    }
                } catch (aiError) {
                    console.warn('AI recommendations failed, using fallback:', aiError);
                }
            }

            // Use fallback recommendations if AI failed or is disabled
            if (recommendations.length === 0) {
                recommendations = getFallbackRecommendations();
            }

            // Limit to maxItems
            recommendations = recommendations.slice(0, maxItems);

            setItems(recommendations);
        } catch (err) {
            console.error('Error loading recommendations:', err);
            setError('Failed to load recommendations');
            // Still show fallback recommendations on error
            setItems(getFallbackRecommendations());
        } finally {
            setLoading(false);
        }
    }, [enableAI, personalizedFor, enhancedUserProfile, maxItems, getRecommendations, getFallbackRecommendations]);

    // Load recommendations on mount and when dependencies change
    useEffect(() => {
        loadRecommendations();
    }, [loadRecommendations]);

    // Callbacks
    const handleItemPress = useCallback((item: AIRecommendedItem) => {
        Animated.sequence([
            Animated.timing(scaleAnims[item.id], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[item.id], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate to product details
        router.push(`/product/${item.id}`);
    }, [scaleAnims]);

    const handleToggleFavorite = useCallback((itemId: string) => {
        const newFavorites = new Set(favorites);
        if (favorites.has(itemId)) {
            newFavorites.delete(itemId);
        } else {
            newFavorites.add(itemId);
        }
        setFavorites(newFavorites);
    }, [favorites]);

    const handleAddToCart = useCallback(async (item: AIRecommendedItem) => {
        try {
            const cartItem = {
                productId: item.id,
                name: item.name,
                brand: item.brand,
                price: item.price,
                originalPrice: item.originalPrice,
                quantity: 1,
                maxQuantity: item.maxQuantity,
                minQuantity: item.minQuantity,
                image: getProductImageBySize(item.id, 'small'),
                category: item.category,
                sku: item.sku,
                status: item.status,
                storeId: item.storeId,
                storeName: item.storeName,
                delivery: item.delivery,
            };

            const success = await addToCart(cartItem);

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
        }
    }, [addToCart]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadRecommendations();
        } finally {
            setRefreshing(false);
        }
    }, [loadRecommendations]);

    const handleSeeAll = useCallback(() => {
        if (onSeeAllPress) {
            onSeeAllPress();
        } else {
            router.push('/product?filter=recommended');
        }
    }, [onSeeAllPress]);

    // Render loading state
    if (loading && items.length === 0) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title={title}
                    subtitle={subtitle}
                    personalizedFor={personalizedFor}
                    onSeeAllPress={handleSeeAll}
                    onRefreshRecommendations={handleRefresh}
                    refreshing={refreshing}
                    aiEnabled={enableAI}
                />
                <LoadingState />
            </View>
        );
    }

    // Render empty state
    if (!loading && items.length === 0) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title={title}
                    subtitle={subtitle}
                    personalizedFor={personalizedFor}
                    onSeeAllPress={handleSeeAll}
                    onRefreshRecommendations={handleRefresh}
                    refreshing={refreshing}
                    aiEnabled={enableAI}
                />
                <EmptyState onRefresh={handleRefresh} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SectionHeader
                title={title}
                subtitle={subtitle}
                personalizedFor={personalizedFor}
                onSeeAllPress={handleSeeAll}
                onRefreshRecommendations={handleRefresh}
                refreshing={refreshing}
                aiEnabled={enableAI}
            />

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollContainer}
                decelerationRate="fast"
            >
                {items.map((item) => (
                    <RecommendedItemCard
                        key={item.id}
                        item={item}
                        cardWidth={computedCardWidth}
                        showReasonBadges={showReasonBadges}
                        showBrands={showBrands}
                        showCategories={showCategories}
                        showDeliveryInfo={showDeliveryInfo}
                        favorites={favorites}
                        scaleAnim={scaleAnims[item.id]}
                        onPress={handleItemPress}
                        onToggleFavorite={handleToggleFavorite}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </ScrollView>

            <AIInsight
                personalizedFor={personalizedFor}
                aiRecommendationsCount={aiRecommendationsCount}
                totalRecommendations={items.length}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        marginBottom: SPACING.xxl,
    },

    // Header Styles
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.xs,
    },
    headerLeft: {
        flex: 1,
        paddingRight: SPACING.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        marginRight: SPACING.sm,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    aiPoweredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WALMART_COLORS.aiInsightBg,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    aiPoweredText: {
        color: WALMART_COLORS.aiGreen,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
        marginLeft: SPACING.xs,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        color: WALMART_COLORS.gray600,
        fontSize: TYPOGRAPHY.sm,
        marginTop: SPACING.xs,
        lineHeight: 20,
    },
    personalizedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderRadius: 10,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    personalizedText: {
        color: WALMART_COLORS.similarPurple,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },

    // Refresh Button
    refreshButton: {
        backgroundColor: WALMART_COLORS.gray100,
        borderRadius: 20,
        padding: SPACING.sm,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },

    // See All Button
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: 8,
        backgroundColor: WALMART_COLORS.gray50,
    },
    seeAllText: {
        color: WALMART_COLORS.primary,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        marginRight: SPACING.xs,
    },

    // Scroll Container
    scrollContainer: {
        marginHorizontal: -SPACING.sm,
    },
    scrollContent: {
        paddingHorizontal: SPACING.sm,
    },

    // Card Styles
    cardWrapper: {
        marginRight: SPACING.lg,
        marginLeft: SPACING.xs,
    },
    card: {
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray100,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },

    // Image Styles
    imageContainer: {
        position: 'relative',
        height: 128,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },

    // Reason Badge
    reasonBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    reasonBadgeText: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
        marginLeft: SPACING.xs,
    },
    confidenceDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: WALMART_COLORS.success,
        marginLeft: SPACING.xs,
    },

    // AI Confidence Indicator
    confidenceIndicator: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 8,
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderWidth: 1,
        minWidth: 32,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    confidenceText: {
        fontSize: 9,
        fontWeight: '700',
    },

    // Discount Badge
    discountBadgeContainer: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
    },
    discountBadge: {
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    discountText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },

    // Favorite Button
    favoriteButton: {
        position: 'absolute',
        bottom: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: WALMART_COLORS.backdropBlur,
        borderRadius: 16,
        padding: SPACING.xs,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },

    // Card Content
    cardContent: {
        padding: SPACING.md,
    },
    brandText: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.xs,
        fontWeight: '600',
    },
    itemName: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.sm,
        lineHeight: 18,
    },
    categoryText: {
        color: WALMART_COLORS.gray400,
        fontSize: TYPOGRAPHY.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.sm,
        fontWeight: '500',
    },

    // Rating Styles
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    reviewCount: {
        fontSize: TYPOGRAPHY.xs,
        color: WALMART_COLORS.gray500,
        fontWeight: '500',
    },

    // Pricing Styles
    pricingContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    priceColumn: {
        flex: 1,
    },
    currentPrice: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
    },
    originalPrice: {
        fontSize: TYPOGRAPHY.xs,
        color: WALMART_COLORS.gray500,
        textDecorationLine: 'line-through',
        marginTop: 2,
    },

    // AI Reasoning Styles
    aiReasoningContainer: {
        backgroundColor: WALMART_COLORS.aiInsightBg,
        borderRadius: 8,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
        borderLeftWidth: 3,
        borderLeftColor: WALMART_COLORS.aiGreen,
    },
    aiReasoningText: {
        color: WALMART_COLORS.aiInsightPurple,
        fontSize: TYPOGRAPHY.xs,
        fontStyle: 'italic',
        lineHeight: 16,
    },

    // Delivery Styles
    deliveryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        borderRadius: 6,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    deliveryText: {
        color: WALMART_COLORS.deliveryGreen,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },

    // Quick Add Button
    quickAddButton: {
        backgroundColor: WALMART_COLORS.primary,
        borderRadius: 8,
        paddingVertical: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    quickAddIcon: {
        marginRight: SPACING.xs,
    },
    quickAddText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '600',
    },

    // AI Insight
    aiInsight: {
        backgroundColor: WALMART_COLORS.aiInsightBg,
        borderRadius: 16,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
        marginHorizontal: SPACING.xs,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
        ...Platform.select({
            ios: {
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    aiInsightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiIconContainer: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 20,
        padding: SPACING.sm,
        marginRight: SPACING.md,
    },
    aiTextContainer: {
        flex: 1,
    },
    aiTitle: {
        color: WALMART_COLORS.aiInsightPurple,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    aiDescription: {
        color: WALMART_COLORS.aiInsightPurple,
        fontSize: TYPOGRAPHY.xs,
        lineHeight: 16,
        opacity: 0.8,
    },

    // Loading State
    loadingContainer: {
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 16,
        padding: SPACING.xxxl,
        alignItems: 'center',
        marginTop: SPACING.lg,
        marginHorizontal: SPACING.xs,
    },
    loadingText: {
        color: WALMART_COLORS.primary,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '500',
        marginTop: SPACING.lg,
        textAlign: 'center',
    },

    // Error State
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        marginHorizontal: SPACING.xs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeftWidth: 4,
        borderLeftColor: WALMART_COLORS.error,
    },
    errorText: {
        color: WALMART_COLORS.error,
        fontSize: TYPOGRAPHY.sm,
        flex: 1,
        marginRight: SPACING.md,
    },
    retryButton: {
        backgroundColor: WALMART_COLORS.error,
        borderRadius: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    retryText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '600',
    },

    // Empty State
    emptyContainer: {
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 16,
        padding: SPACING.xxxl,
        alignItems: 'center',
        marginTop: SPACING.lg,
        marginHorizontal: SPACING.xs,
    },
    emptyTitle: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '600',
        marginTop: SPACING.lg,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: WALMART_COLORS.gray400,
        fontSize: TYPOGRAPHY.sm,
        marginTop: SPACING.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    exploreButton: {
        backgroundColor: WALMART_COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        marginTop: SPACING.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    exploreButtonText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
    },
});