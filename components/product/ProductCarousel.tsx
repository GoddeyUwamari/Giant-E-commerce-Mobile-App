import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from './ProductCard';

// Types
interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    brand?: string;
    category?: string;
    isNew?: boolean;
    isBestseller?: boolean;
    isFavorite?: boolean;
    inStock?: boolean;
    stockCount?: number;
    freeShipping?: boolean;
    fastDelivery?: boolean;
    deliveryDate?: string;
    discount?: number;
    variants?: {
        colors?: string[];
        sizes?: string[];
    };
}

interface ProductCarouselProps {
    products: Product[];
    title?: string;
    subtitle?: string;
    cardWidth?: number;
    showIndicators?: boolean;
    autoScroll?: boolean;
    autoScrollInterval?: number;
    showSeeAll?: boolean;
    showNavigation?: boolean;
    showInsights?: boolean;
    showProductCount?: boolean;
    layout?: 'compact' | 'standard' | 'grid';
    onProductPress: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    onQuickView?: (product: Product) => void;
    onSeeAllPress?: () => void;
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
    // Carousel specific colors
    insightBlue: '#2563EB',
    insightBlueBg: 'rgba(37, 99, 235, 0.05)',
    insightBlueLight: 'rgba(37, 99, 235, 0.1)',
    countOverlay: 'rgba(0, 0, 0, 0.7)',
    indicatorActive: '#0071CE',
    indicatorInactive: '#D1D5DB',
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

// Navigation Button Component
const NavigationButton = React.memo(({
                                         direction,
                                         disabled,
                                         onPress,
                                     }: {
    direction: 'back' | 'forward';
    disabled: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={[
            styles.navButton,
            disabled ? styles.navButtonDisabled : styles.navButtonActive,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
    >
        <Ionicons
            name={direction === 'back' ? 'chevron-back' : 'chevron-forward'}
            size={16}
            color={disabled ? WALMART_COLORS.gray400 : WALMART_COLORS.white}
        />
    </TouchableOpacity>
));

// Indicators Component
const CarouselIndicators = React.memo(({
                                           totalPages,
                                           currentIndex,
                                           showIndicators,
                                           onPageSelect,
                                       }: {
    totalPages: number;
    currentIndex: number;
    showIndicators: boolean;
    onPageSelect: (index: number) => void;
}) => {
    if (!showIndicators || totalPages <= 1) return null;

    return (
        <View style={styles.indicatorsContainer}>
            {Array.from({ length: totalPages }).map((_, index) => {
                const isActive = index === currentIndex;
                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.indicator,
                            isActive ? styles.indicatorActive : styles.indicatorInactive,
                        ]}
                        onPress={() => onPageSelect(index)}
                        activeOpacity={0.7}
                    />
                );
            })}
        </View>
    );
});

// Product Count Component
const ProductCount = React.memo(({
                                     count,
                                     showProductCount
                                 }: {
    count: number;
    showProductCount: boolean;
}) => {
    if (!showProductCount || count <= 3) return null;

    return (
        <View style={styles.productCountContainer}>
            <Text style={styles.productCountText}>
                {count} items
            </Text>
        </View>
    );
});

// Insights Component
const CategoryInsights = React.memo(({
                                         products,
                                         showInsights,
                                     }: {
    products: Product[];
    showInsights: boolean;
}) => {
    if (!showInsights || !products.length) return null;

    const bestsellersCount = products.filter(p => p.isBestseller).length;
    const freeShippingCount = products.filter(p => p.freeShipping).length;
    const categoryName = products[0]?.category || 'this category';

    return (
        <View style={styles.insightsContainer}>
            <View style={styles.insightsContent}>
                <View style={styles.insightsIconContainer}>
                    <Ionicons
                        name="analytics"
                        size={16}
                        color={WALMART_COLORS.insightBlue}
                    />
                </View>
                <View style={styles.insightsTextContainer}>
                    <Text style={styles.insightsTitle}>
                        Trending in {categoryName}
                    </Text>
                    <Text style={styles.insightsSubtitle}>
                        {bestsellersCount} bestsellers • {freeShippingCount} with free shipping
                    </Text>
                </View>
            </View>
        </View>
    );
});

// Header Component
const CarouselHeader = React.memo(({
                                       title,
                                       subtitle,
                                       showNavigation,
                                       showSeeAll,
                                       currentIndex,
                                       totalPages,
                                       onNavigate,
                                       onSeeAllPress,
                                   }: {
    title: string;
    subtitle?: string;
    showNavigation: boolean;
    showSeeAll: boolean;
    currentIndex: number;
    totalPages: number;
    onNavigate: (direction: 'prev' | 'next') => void;
    onSeeAllPress?: () => void;
}) => (
    <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && (
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
            )}
        </View>

        <View style={styles.headerRight}>
            {/* Navigation Arrows */}
            {showNavigation && totalPages > 1 && (
                <View style={styles.navigationContainer}>
                    <NavigationButton
                        direction="back"
                        disabled={currentIndex === 0}
                        onPress={() => onNavigate('prev')}
                    />
                    <NavigationButton
                        direction="forward"
                        disabled={currentIndex === totalPages - 1}
                        onPress={() => onNavigate('next')}
                    />
                </View>
            )}

            {/* See All Button */}
            {showSeeAll && onSeeAllPress && (
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

// Empty State Component
const EmptyState = React.memo(() => (
    <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color={WALMART_COLORS.gray400} />
        <Text style={styles.emptyTitle}>No Products</Text>
        <Text style={styles.emptySubtitle}>
            No products available in this category at the moment
        </Text>
    </View>
));

// Main Component
export default function ProductCarousel({
                                            products,
                                            title = 'Related Products',
                                            subtitle,
                                            cardWidth = 180,
                                            showIndicators = false,
                                            autoScroll = false,
                                            autoScrollInterval = 3000,
                                            showSeeAll = true,
                                            showNavigation = true,
                                            showInsights = true,
                                            showProductCount = true,
                                            layout = 'standard',
                                            onProductPress,
                                            onAddToCart,
                                            onToggleFavorite,
                                            onQuickView,
                                            onSeeAllPress,
                                        }: ProductCarouselProps): JSX.Element {
    // State
    const [currentIndex, setCurrentIndex] = useState(0);

    // Refs
    const scrollViewRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Computed values
    const itemsPerPage = useMemo(() => {
        if (layout === 'compact') return 1; // Continuous scroll
        return Math.floor((screenWidth - SPACING.xxxl) / (cardWidth + SPACING.lg));
    }, [cardWidth, layout]);

    const totalPages = useMemo(() => {
        if (layout === 'compact') return 1;
        return Math.ceil(products.length / itemsPerPage);
    }, [products.length, itemsPerPage, layout]);

    // Auto scroll functionality
    const startAutoScroll = useCallback(() => {
        if (!autoScroll || products.length <= itemsPerPage || layout === 'compact') return;

        intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % totalPages;
                scrollViewRef.current?.scrollTo({
                    x: nextIndex * screenWidth,
                    animated: true,
                });
                return nextIndex;
            });
        }, autoScrollInterval);
    }, [autoScroll, autoScrollInterval, products.length, itemsPerPage, totalPages, layout]);

    const stopAutoScroll = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Effects
    useEffect(() => {
        startAutoScroll();
        return stopAutoScroll;
    }, [startAutoScroll, stopAutoScroll]);

    // Callbacks
    const handleScroll = useCallback((event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / screenWidth);
        setCurrentIndex(index);
    }, []);

    const goToPage = useCallback((pageIndex: number) => {
        const clampedIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));
        setCurrentIndex(clampedIndex);
        scrollViewRef.current?.scrollTo({
            x: clampedIndex * screenWidth,
            animated: true,
        });
    }, [totalPages]);

    const handleNavigation = useCallback((direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev'
            ? Math.max(0, currentIndex - 1)
            : Math.min(totalPages - 1, currentIndex + 1);
        goToPage(newIndex);
    }, [currentIndex, totalPages, goToPage]);

    // Render functions
    const renderCompactLayout = useCallback(() => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.compactScrollContent}
            style={styles.compactScroll}
            decelerationRate="fast"
            snapToInterval={cardWidth + SPACING.lg}
            snapToAlignment="start"
        >
            {products.map((product) => (
                <View
                    key={product.id}
                    style={[styles.compactCardWrapper, { width: cardWidth }]}
                >
                    <ProductCard
                        product={product}
                        layout="compact"
                        cardWidth={cardWidth}
                        onPress={onProductPress}
                        onAddToCart={onAddToCart}
                        onToggleFavorite={onToggleFavorite}
                        onQuickView={onQuickView}
                    />
                </View>
            ))}
        </ScrollView>
    ), [products, cardWidth, onProductPress, onAddToCart, onToggleFavorite, onQuickView]);

    const renderStandardLayout = useCallback(() => {
        const pages = [];
        for (let i = 0; i < products.length; i += itemsPerPage) {
            pages.push(products.slice(i, i + itemsPerPage));
        }

        return (
            <View>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                    onTouchStart={stopAutoScroll}
                    onTouchEnd={startAutoScroll}
                >
                    {pages.map((pageProducts, pageIndex) => (
                        <View
                            key={pageIndex}
                            style={[styles.pageContainer, { width: screenWidth }]}
                        >
                            <View style={styles.pageContent}>
                                {pageProducts.map((product) => (
                                    <View
                                        key={product.id}
                                        style={[
                                            styles.standardCardWrapper,
                                            { width: (screenWidth - SPACING.xxxl * 2 - SPACING.lg) / 2 }
                                        ]}
                                    >
                                        <ProductCard
                                            product={product}
                                            layout="grid"
                                            onPress={onProductPress}
                                            onAddToCart={onAddToCart}
                                            onToggleFavorite={onToggleFavorite}
                                            onQuickView={onQuickView}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
                <CarouselIndicators
                    totalPages={totalPages}
                    currentIndex={currentIndex}
                    showIndicators={showIndicators}
                    onPageSelect={goToPage}
                />
            </View>
        );
    }, [
        products,
        itemsPerPage,
        handleScroll,
        stopAutoScroll,
        startAutoScroll,
        totalPages,
        currentIndex,
        showIndicators,
        goToPage,
        onProductPress,
        onAddToCart,
        onToggleFavorite,
        onQuickView,
    ]);

    const renderGridLayout = useCallback(() => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gridScrollContent}
            style={styles.gridScroll}
            decelerationRate="fast"
        >
            {products.map((product) => (
                <View
                    key={product.id}
                    style={[styles.gridCardWrapper, { width: cardWidth }]}
                >
                    <ProductCard
                        product={product}
                        layout="grid"
                        cardWidth={cardWidth}
                        onPress={onProductPress}
                        onAddToCart={onAddToCart}
                        onToggleFavorite={onToggleFavorite}
                        onQuickView={onQuickView}
                    />
                </View>
            ))}
        </ScrollView>
    ), [products, cardWidth, onProductPress, onAddToCart, onToggleFavorite, onQuickView]);

    // Early return for empty products
    if (!products.length) {
        return (
            <View style={styles.container}>
                <CarouselHeader
                    title={title}
                    subtitle={subtitle}
                    showNavigation={false}
                    showSeeAll={showSeeAll}
                    currentIndex={0}
                    totalPages={0}
                    onNavigate={handleNavigation}
                    onSeeAllPress={onSeeAllPress}
                />
                <EmptyState />
            </View>
        );
    }

    return (
        <Animated.View
            style={[styles.container, { opacity: fadeAnim }]}
        >
            <CarouselHeader
                title={title}
                subtitle={subtitle}
                showNavigation={showNavigation && layout !== 'compact'}
                showSeeAll={showSeeAll}
                currentIndex={currentIndex}
                totalPages={totalPages}
                onNavigate={handleNavigation}
                onSeeAllPress={onSeeAllPress}
            />

            <View style={styles.carouselContent}>
                {layout === 'compact' && renderCompactLayout()}
                {layout === 'standard' && renderStandardLayout()}
                {layout === 'grid' && renderGridLayout()}

                <ProductCount
                    count={products.length}
                    showProductCount={showProductCount}
                />
            </View>

            <CategoryInsights
                products={products}
                showInsights={showInsights}
            />
        </Animated.View>
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
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    headerLeft: {
        flex: 1,
        paddingRight: SPACING.md,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    headerSubtitle: {
        color: WALMART_COLORS.gray600,
        fontSize: TYPOGRAPHY.sm,
        marginTop: SPACING.xs,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },

    // Navigation Styles
    navigationContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    navButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
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
    navButtonActive: {
        backgroundColor: WALMART_COLORS.primary,
    },
    navButtonDisabled: {
        backgroundColor: WALMART_COLORS.gray200,
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

    // Carousel Content
    carouselContent: {
        position: 'relative',
    },

    // Compact Layout
    compactScroll: {
        marginHorizontal: -SPACING.sm,
    },
    compactScrollContent: {
        paddingHorizontal: SPACING.sm,
    },
    compactCardWrapper: {
        marginRight: SPACING.lg,
        marginLeft: SPACING.xs,
    },

    // Standard Layout
    pageContainer: {
        paddingHorizontal: SPACING.lg,
    },
    pageContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    standardCardWrapper: {
        marginBottom: SPACING.lg,
    },

    // Grid Layout
    gridScroll: {
        marginHorizontal: -SPACING.sm,
    },
    gridScrollContent: {
        paddingHorizontal: SPACING.sm,
    },
    gridCardWrapper: {
        marginRight: SPACING.lg,
        marginLeft: SPACING.xs,
    },

    // Indicators
    indicatorsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
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
    indicatorActive: {
        backgroundColor: WALMART_COLORS.indicatorActive,
        width: 24,
    },
    indicatorInactive: {
        backgroundColor: WALMART_COLORS.indicatorInactive,
        width: 8,
    },

    // Product Count
    productCountContainer: {
        position: 'absolute',
        top: SPACING.lg,
        right: SPACING.lg,
        backgroundColor: WALMART_COLORS.countOverlay,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    productCountText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },

    // Insights
    insightsContainer: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        backgroundColor: WALMART_COLORS.insightBlueBg,
        borderRadius: 16,
        padding: SPACING.lg,
    },
    insightsContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    insightsIconContainer: {
        backgroundColor: WALMART_COLORS.insightBlueLight,
        borderRadius: 20,
        padding: SPACING.sm,
        marginRight: SPACING.md,
    },
    insightsTextContainer: {
        flex: 1,
    },
    insightsTitle: {
        color: WALMART_COLORS.insightBlue,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },
    insightsSubtitle: {
        color: WALMART_COLORS.insightBlue,
        fontSize: TYPOGRAPHY.xs,
        marginTop: SPACING.xs,
        opacity: 0.8,
    },

    // Empty State
    emptyContainer: {
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 16,
        padding: SPACING.xxxl,
        alignItems: 'center',
        marginHorizontal: SPACING.lg,
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
});