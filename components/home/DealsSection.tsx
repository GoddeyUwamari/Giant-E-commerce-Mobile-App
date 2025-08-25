import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

// Types
interface Deal {
    id: string;
    title: string;
    originalPrice: number;
    salePrice: number;
    discount: number;
    image: string;
    timeLeft?: string;
    isLimitedTime?: boolean;
    stockLeft?: number;
    rating?: number;
    reviewCount?: number;
    onPress: () => void;
}

interface DealsSectionProps {
    deals: Deal[];
    title?: string;
    showTimer?: boolean;
    sectionType?: 'featured' | 'flash' | 'daily' | 'clearance';
    onSeeAllPress?: () => void;
    cardWidth?: number;
    showFavorites?: boolean;
    showStock?: boolean;
    autoScroll?: boolean;
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
    // Deal colors
    flashRed: '#EF4444',
    flashRedDark: '#DC2626',
    discountOrange: '#F97316',
    saveGreen: '#10B981',
    saveGreenLight: '#D1FAE5',
    starYellow: '#F59E0B',
    stockRed: '#EF4444',
    // Gradients
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    backdropBlur: 'rgba(255, 255, 255, 0.8)',
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

// Utility Functions
const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
};

const calculateSavings = (originalPrice: number, salePrice: number): string => {
    return `$${(originalPrice - salePrice).toFixed(2)}`;
};

const getSectionTypeConfig = (type: 'featured' | 'flash' | 'daily' | 'clearance') => {
    switch (type) {
        case 'flash':
            return {
                badgeText: 'FLASH',
                badgeColor: WALMART_COLORS.flashRed,
                timerColor: WALMART_COLORS.gray900,
            };
        case 'daily':
            return {
                badgeText: 'DAILY',
                badgeColor: WALMART_COLORS.primary,
                timerColor: WALMART_COLORS.primary,
            };
        case 'clearance':
            return {
                badgeText: 'CLEARANCE',
                badgeColor: WALMART_COLORS.warning,
                timerColor: WALMART_COLORS.warning,
            };
        default:
            return {
                badgeText: 'FEATURED',
                badgeColor: WALMART_COLORS.success,
                timerColor: WALMART_COLORS.gray900,
            };
    }
};

// Timer Hook
const useTimer = (sectionType: string, showTimer: boolean) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (sectionType === 'flash' && showTimer) {
            const updateTimer = () => {
                const now = new Date();
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                const diff = endOfDay.getTime() - now.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes
                        .toString()
                        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            };

            updateTimer(); // Initial call
            const interval = setInterval(updateTimer, 1000);

            return () => clearInterval(interval);
        }
    }, [sectionType, showTimer]);

    return timeLeft;
};

// Rating Stars Component
const RatingStars = React.memo(({ rating, reviewCount }: { rating: number; reviewCount?: number }) => (
    <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                    key={star}
                    name="star"
                    size={12}
                    color={star <= rating ? WALMART_COLORS.starYellow : WALMART_COLORS.gray200}
                />
            ))}
        </View>
        {reviewCount && (
            <Text style={styles.reviewCount}>({reviewCount})</Text>
        )}
    </View>
));

// Stock Progress Component
const StockProgress = React.memo(({ stockLeft }: { stockLeft: number }) => (
    <View style={styles.stockContainer}>
        <Text style={styles.stockText}>
            Only {stockLeft} left in stock!
        </Text>
        <View style={styles.stockProgressBar}>
            <View
                style={[
                    styles.stockProgressFill,
                    { width: `${(stockLeft / 10) * 100}%` },
                ]}
            />
        </View>
    </View>
));

// Deal Card Component
const DealCard = React.memo(({
                                 deal,
                                 cardWidth,
                                 showFavorites,
                                 showStock,
                                 scaleAnim,
                                 onPress,
                             }: {
    deal: Deal;
    cardWidth: number;
    showFavorites: boolean;
    showStock: boolean;
    scaleAnim: Animated.Value;
    onPress: (deal: Deal) => void;
}) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const handlePress = useCallback(() => {
        onPress(deal);
    }, [deal, onPress]);

    const handleFavoritePress = useCallback(() => {
        setIsFavorite(!isFavorite);
    }, [isFavorite]);

    const savings = useMemo(
        () => calculateSavings(deal.originalPrice, deal.salePrice),
        [deal.originalPrice, deal.salePrice]
    );

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity
                style={[styles.card, { width: cardWidth }]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Image Container */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: deal.image }}
                        style={styles.dealImage}
                        contentFit="cover"
                        transition={200}
                    />

                    {/* Discount Badge */}
                    <View style={styles.discountBadgeContainer}>
                        <LinearGradient
                            colors={[WALMART_COLORS.flashRed, WALMART_COLORS.flashRedDark]}
                            style={styles.discountBadge}
                        >
                            <Text style={styles.discountText}>
                                -{deal.discount}%
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Limited Time Badge */}
                    {deal.isLimitedTime && (
                        <View style={styles.limitedBadge}>
                            <Text style={styles.limitedText}>LIMITED</Text>
                        </View>
                    )}

                    {/* Favorite Button */}
                    {showFavorites && (
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={handleFavoritePress}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={16}
                                color={isFavorite ? WALMART_COLORS.error : WALMART_COLORS.gray700}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    <Text style={styles.dealTitle} numberOfLines={2}>
                        {deal.title}
                    </Text>

                    {/* Rating */}
                    {deal.rating && (
                        <RatingStars rating={deal.rating} reviewCount={deal.reviewCount} />
                    )}

                    {/* Pricing */}
                    <View style={styles.pricingContainer}>
                        <View style={styles.priceColumn}>
                            <Text style={styles.salePrice}>
                                {formatPrice(deal.salePrice)}
                            </Text>
                            <Text style={styles.originalPrice}>
                                {formatPrice(deal.originalPrice)}
                            </Text>
                        </View>

                        <View style={styles.savingsBadge}>
                            <Text style={styles.savingsText}>
                                Save {savings}
                            </Text>
                        </View>
                    </View>

                    {/* Stock Left */}
                    {showStock && deal.stockLeft && deal.stockLeft <= 10 && (
                        <StockProgress stockLeft={deal.stockLeft} />
                    )}

                    {/* Add to Cart Button */}
                    <TouchableOpacity style={styles.addToCartButton} activeOpacity={0.8}>
                        <Ionicons
                            name="cart-outline"
                            size={16}
                            color={WALMART_COLORS.white}
                            style={styles.cartIcon}
                        />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// Section Header Component
const SectionHeader = React.memo(({
                                      title,
                                      sectionType,
                                      timeLeft,
                                      showTimer,
                                      onSeeAllPress,
                                  }: {
    title: string;
    sectionType: 'featured' | 'flash' | 'daily' | 'clearance';
    timeLeft: string;
    showTimer: boolean;
    onSeeAllPress?: () => void;
}) => {
    const config = getSectionTypeConfig(sectionType);

    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>{title}</Text>
                {sectionType !== 'featured' && (
                    <View style={[styles.sectionBadge, { backgroundColor: config.badgeColor }]}>
                        <Text style={styles.sectionBadgeText}>{config.badgeText}</Text>
                    </View>
                )}
            </View>

            <View style={styles.headerRight}>
                {showTimer && timeLeft && (
                    <View style={[styles.timerContainer, { backgroundColor: config.timerColor }]}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={WALMART_COLORS.white}
                            style={styles.timerIcon}
                        />
                        <Text style={styles.timerText}>{timeLeft}</Text>
                    </View>
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
    );
});

// Main Component
export default function DealsSection({
                                         deals,
                                         title = "Today's Deals",
                                         showTimer = true,
                                         sectionType = 'featured',
                                         onSeeAllPress,
                                         cardWidth = 180,
                                         showFavorites = true,
                                         showStock = true,
                                         autoScroll = false,
                                     }: DealsSectionProps): JSX.Element {
    // Animations
    const scaleAnims = useMemo(
        () =>
            deals.reduce((acc, deal) => {
                acc[deal.id] = new Animated.Value(1);
                return acc;
            }, {} as { [key: string]: Animated.Value }),
        [deals]
    );

    // Timer
    const timeLeft = useTimer(sectionType, showTimer);

    // Auto-scroll effect
    useEffect(() => {
        if (autoScroll && deals.length > 3) {
            // Implementation for auto-scroll would go here
            // This is a placeholder for future enhancement
        }
    }, [autoScroll, deals.length]);

    // Callbacks
    const handleDealPress = useCallback((deal: Deal) => {
        // Animate scale down and up
        Animated.sequence([
            Animated.timing(scaleAnims[deal.id], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[deal.id], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        deal.onPress();
    }, [scaleAnims]);

    // Render Functions
    const renderEmptyState = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="pricetag-outline"
                size={48}
                color={WALMART_COLORS.gray400}
            />
            <Text style={styles.emptyText}>No deals available right now</Text>
            <Text style={styles.emptySubtext}>Check back soon for amazing offers!</Text>
        </View>
    ), []);

    // Early return for empty deals
    if (!deals.length) {
        return renderEmptyState();
    }

    return (
        <View style={styles.container}>
            <SectionHeader
                title={title}
                sectionType={sectionType}
                timeLeft={timeLeft}
                showTimer={showTimer}
                onSeeAllPress={onSeeAllPress}
            />

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollContainer}
                decelerationRate="fast"
                snapToInterval={cardWidth + SPACING.lg}
                snapToAlignment="start"
            >
                {deals.map((deal) => (
                    <DealCard
                        key={deal.id}
                        deal={deal}
                        cardWidth={cardWidth}
                        showFavorites={showFavorites}
                        showStock={showStock}
                        scaleAnim={scaleAnims[deal.id]}
                        onPress={handleDealPress}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

// Enhanced Styles
const styles = StyleSheet.create({
    // Main Container
    container: {
        marginBottom: SPACING.xxl,
    },

    // Header Styles
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.xs,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        marginRight: SPACING.md,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    sectionBadge: {
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    sectionBadgeText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    timerIcon: {
        marginRight: SPACING.xs,
    },
    timerText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
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
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    // Image Styles
    imageContainer: {
        position: 'relative',
        height: 120,
    },
    dealImage: {
        width: '100%',
        height: '100%',
    },
    discountBadgeContainer: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
    },
    discountBadge: {
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    discountText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },
    limitedBadge: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: WALMART_COLORS.discountOrange,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    limitedText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },
    favoriteButton: {
        position: 'absolute',
        bottom: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: WALMART_COLORS.backdropBlur,
        borderRadius: 20,
        padding: SPACING.sm,
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

    // Card Content
    cardContent: {
        padding: SPACING.md,
    },
    dealTitle: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.sm,
        lineHeight: 18,
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
    salePrice: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
    },
    originalPrice: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray500,
        textDecorationLine: 'line-through',
    },
    savingsBadge: {
        backgroundColor: WALMART_COLORS.saveGreenLight,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    savingsText: {
        color: WALMART_COLORS.saveGreen,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },

    // Stock Styles
    stockContainer: {
        marginBottom: SPACING.sm,
    },
    stockText: {
        color: WALMART_COLORS.stockRed,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    stockProgressBar: {
        backgroundColor: WALMART_COLORS.gray200,
        borderRadius: 2,
        height: 4,
    },
    stockProgressFill: {
        backgroundColor: WALMART_COLORS.stockRed,
        height: 4,
        borderRadius: 2,
    },

    // Button Styles
    addToCartButton: {
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
    cartIcon: {
        marginRight: SPACING.xs,
    },
    addToCartText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl,
        paddingHorizontal: SPACING.xl,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '600',
        color: WALMART_COLORS.gray600,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray500,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
});