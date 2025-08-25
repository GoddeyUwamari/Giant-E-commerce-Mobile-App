import React, { useState, useCallback, useMemo } from 'react';
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
interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    isFavorite?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
    brand?: string;
    quickAddToCart?: boolean;
    inStock?: boolean;
    freeShipping?: boolean;
    onPress: () => void;
    onAddToCart?: () => void;
    onToggleFavorite?: () => void;
}

interface FeaturedProductsProps {
    products: Product[];
    title?: string;
    layout?: 'grid' | 'list';
    showFilters?: boolean;
    onSeeAllPress?: () => void;
    gridColumns?: number;
    showBrands?: boolean;
    showQuickAdd?: boolean;
}

interface FilterOption {
    id: string;
    label: string;
    icon: string;
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
    // Product specific colors
    newGreen: '#10B981',
    newGreenLight: '#D1FAE5',
    bestsellerOrange: '#F97316',
    saleRed: '#EF4444',
    starYellow: '#F59E0B',
    freeShippingGreen: '#059669',
    outOfStockOverlay: 'rgba(0, 0, 0, 0.6)',
    backdropBlur: 'rgba(255, 255, 255, 0.9)',
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

const FILTER_OPTIONS: FilterOption[] = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'new', label: 'New', icon: 'sparkles' },
    { id: 'bestseller', label: 'Bestseller', icon: 'trophy' },
    { id: 'sale', label: 'On Sale', icon: 'pricetag' },
];

// Utility Functions
const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

const calculateDiscount = (originalPrice: number, salePrice: number): number => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

const getCardWidth = (gridColumns: number): number => {
    const containerPadding = SPACING.xxl * 2;
    const gapWidth = SPACING.md * (gridColumns - 1);
    return (screenWidth - containerPadding - gapWidth) / gridColumns;
};

// Rating Stars Component
const RatingStars = React.memo(({
                                    rating,
                                    reviewCount,
                                    size = 12,
                                    showCount = true
                                }: {
    rating: number;
    reviewCount: number;
    size?: number;
    showCount?: boolean;
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
        {showCount && (
            <Text style={[styles.reviewCount, { fontSize: size - 2 }]}>
                ({reviewCount})
            </Text>
        )}
    </View>
));

// Product Badges Component
const ProductBadges = React.memo(({ product }: { product: Product }) => (
    <View style={styles.badgesContainer}>
        {product.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
                <Text style={styles.badgeText}>NEW</Text>
            </View>
        )}
        {product.isBestseller && (
            <View style={[styles.badge, styles.bestsellerBadge]}>
                <Text style={styles.badgeText}>BESTSELLER</Text>
            </View>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
            <View style={[styles.badge, styles.saleBadge]}>
                <Text style={styles.badgeText}>
                    -{calculateDiscount(product.originalPrice, product.price)}%
                </Text>
            </View>
        )}
    </View>
));

// Filter Bar Component
const FilterBar = React.memo(({
                                  selectedFilter,
                                  onFilterChange,
                              }: {
    selectedFilter: string;
    onFilterChange: (filterId: string) => void;
}) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
        style={styles.filterScrollContainer}
    >
        {FILTER_OPTIONS.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            return (
                <TouchableOpacity
                    key={filter.id}
                    style={[
                        styles.filterButton,
                        isSelected ? styles.filterButtonSelected : styles.filterButtonDefault,
                    ]}
                    onPress={() => onFilterChange(filter.id)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={filter.icon as any}
                        size={16}
                        color={isSelected ? WALMART_COLORS.white : WALMART_COLORS.gray600}
                        style={styles.filterIcon}
                    />
                    <Text
                        style={[
                            styles.filterText,
                            isSelected ? styles.filterTextSelected : styles.filterTextDefault,
                        ]}
                    >
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </ScrollView>
));

// Grid Product Card Component
const GridProductCard = React.memo(({
                                        product,
                                        cardWidth,
                                        favorites,
                                        scaleAnim,
                                        onPress,
                                        onToggleFavorite,
                                        showBrands,
                                        showQuickAdd,
                                    }: {
    product: Product;
    cardWidth: number;
    favorites: Set<string>;
    scaleAnim: Animated.Value;
    onPress: (product: Product) => void;
    onToggleFavorite: (product: Product) => void;
    showBrands: boolean;
    showQuickAdd: boolean;
}) => {
    const isFavorite = favorites.has(product.id);
    const isOutOfStock = product.inStock === false;

    const handlePress = useCallback(() => onPress(product), [product, onPress]);
    const handleFavoritePress = useCallback(() => onToggleFavorite(product), [product, onToggleFavorite]);
    const handleAddToCart = useCallback(() => product.onAddToCart?.(), [product]);

    return (
        <Animated.View
            style={[
                styles.gridCardWrapper,
                { width: cardWidth, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity
                style={styles.gridCard}
                onPress={handlePress}
                activeOpacity={0.9}
                disabled={isOutOfStock}
            >
                {/* Image Container */}
                <View style={styles.gridImageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.gridImage}
                        contentFit="cover"
                        transition={200}
                    />

                    <ProductBadges product={product} />

                    {/* Favorite Button */}
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

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.gridContent}>
                    {showBrands && product.brand && (
                        <Text style={styles.brandText}>{product.brand}</Text>
                    )}

                    <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                    </Text>

                    <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

                    {/* Pricing */}
                    <View style={styles.pricingContainer}>
                        <View style={styles.priceColumn}>
                            <Text style={styles.currentPrice}>
                                {formatPrice(product.price)}
                            </Text>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <Text style={styles.originalPrice}>
                                    {formatPrice(product.originalPrice)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Free Shipping */}
                    {product.freeShipping && (
                        <View style={styles.freeShippingBadge}>
                            <Text style={styles.freeShippingText}>Free Shipping</Text>
                        </View>
                    )}

                    {/* Add to Cart Button */}
                    {showQuickAdd && product.quickAddToCart && !isOutOfStock && (
                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={handleAddToCart}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="cart-outline"
                                size={14}
                                color={WALMART_COLORS.white}
                                style={styles.cartIconSmall}
                            />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// List Product Card Component
const ListProductCard = React.memo(({
                                        product,
                                        favorites,
                                        scaleAnim,
                                        onPress,
                                        onToggleFavorite,
                                        showBrands,
                                        showQuickAdd,
                                    }: {
    product: Product;
    favorites: Set<string>;
    scaleAnim: Animated.Value;
    onPress: (product: Product) => void;
    onToggleFavorite: (product: Product) => void;
    showBrands: boolean;
    showQuickAdd: boolean;
}) => {
    const isFavorite = favorites.has(product.id);
    const isOutOfStock = product.inStock === false;

    const handlePress = useCallback(() => onPress(product), [product, onPress]);
    const handleFavoritePress = useCallback(() => onToggleFavorite(product), [product, onToggleFavorite]);
    const handleAddToCart = useCallback(() => product.onAddToCart?.(), [product]);

    return (
        <Animated.View
            style={[
                styles.listCardWrapper,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity
                style={styles.listCard}
                onPress={handlePress}
                activeOpacity={0.9}
                disabled={isOutOfStock}
            >
                {/* Image Container */}
                <View style={styles.listImageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.listImage}
                        contentFit="cover"
                        transition={200}
                    />

                    {product.isNew && (
                        <View style={[styles.badge, styles.newBadge, styles.listBadge]}>
                            <Text style={[styles.badgeText, styles.listBadgeText]}>NEW</Text>
                        </View>
                    )}

                    {isOutOfStock && (
                        <View style={[styles.outOfStockOverlay, styles.listOutOfStockOverlay]}>
                            <Text style={styles.outOfStockTextSmall}>OUT OF STOCK</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.listContent}>
                    <View style={styles.listContentTop}>
                        {showBrands && product.brand && (
                            <Text style={styles.brandText}>{product.brand}</Text>
                        )}

                        <Text style={styles.listProductName} numberOfLines={2}>
                            {product.name}
                        </Text>

                        <RatingStars
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                            size={10}
                        />
                    </View>

                    <View style={styles.listContentBottom}>
                        <View style={styles.listPriceColumn}>
                            <Text style={styles.listCurrentPrice}>
                                {formatPrice(product.price)}
                            </Text>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <Text style={styles.listOriginalPrice}>
                                    {formatPrice(product.originalPrice)}
                                </Text>
                            )}
                        </View>

                        <View style={styles.listActions}>
                            <TouchableOpacity
                                style={styles.listFavoriteButton}
                                onPress={handleFavoritePress}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={16}
                                    color={isFavorite ? WALMART_COLORS.error : WALMART_COLORS.gray700}
                                />
                            </TouchableOpacity>

                            {showQuickAdd && product.quickAddToCart && !isOutOfStock && (
                                <TouchableOpacity
                                    style={styles.listAddToCartButton}
                                    onPress={handleAddToCart}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.listAddToCartText}>Add</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// Section Header Component
const SectionHeader = React.memo(({
                                      title,
                                      onSeeAllPress,
                                  }: {
    title: string;
    onSeeAllPress?: () => void;
}) => (
    <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
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
));

// Empty State Component
const EmptyState = React.memo(() => (
    <View style={styles.emptyStateContainer}>
        <Ionicons name="search" size={48} color={WALMART_COLORS.gray400} />
        <Text style={styles.emptyStateTitle}>No products found</Text>
        <Text style={styles.emptyStateSubtitle}>
            Try adjusting your filters or check back later
        </Text>
    </View>
));

// Main Component
export default function FeaturedProducts({
                                             products,
                                             title = 'Featured Products',
                                             layout = 'grid',
                                             showFilters = true,
                                             onSeeAllPress,
                                             gridColumns = 2,
                                             showBrands = true,
                                             showQuickAdd = true,
                                         }: FeaturedProductsProps): JSX.Element {
    // State
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Animations
    const scaleAnims = useMemo(
        () =>
            products.reduce((acc, product) => {
                acc[product.id] = new Animated.Value(1);
                return acc;
            }, {} as { [key: string]: Animated.Value }),
        [products]
    );

    // Filtered products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            switch (selectedFilter) {
                case 'new':
                    return product.isNew;
                case 'bestseller':
                    return product.isBestseller;
                case 'sale':
                    return product.originalPrice && product.originalPrice > product.price;
                default:
                    return true;
            }
        });
    }, [products, selectedFilter]);

    // Card width for grid layout
    const cardWidth = useMemo(() => getCardWidth(gridColumns), [gridColumns]);

    // Callbacks
    const handleProductPress = useCallback((product: Product) => {
        Animated.sequence([
            Animated.timing(scaleAnims[product.id], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[product.id], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        product.onPress();
    }, [scaleAnims]);

    const handleToggleFavorite = useCallback((product: Product) => {
        const newFavorites = new Set(favorites);
        if (favorites.has(product.id)) {
            newFavorites.delete(product.id);
        } else {
            newFavorites.add(product.id);
        }
        setFavorites(newFavorites);
        product.onToggleFavorite?.();
    }, [favorites]);

    const handleFilterChange = useCallback((filterId: string) => {
        setSelectedFilter(filterId);
    }, []);

    // Render empty state
    if (!filteredProducts.length) {
        return (
            <View style={styles.container}>
                <SectionHeader title={title} onSeeAllPress={onSeeAllPress} />
                {showFilters && (
                    <FilterBar
                        selectedFilter={selectedFilter}
                        onFilterChange={handleFilterChange}
                    />
                )}
                <EmptyState />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SectionHeader title={title} onSeeAllPress={onSeeAllPress} />

            {showFilters && (
                <FilterBar
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                />
            )}

            {layout === 'grid' ? (
                <View style={styles.gridContainer}>
                    {filteredProducts.map((product) => (
                        <GridProductCard
                            key={product.id}
                            product={product}
                            cardWidth={cardWidth}
                            favorites={favorites}
                            scaleAnim={scaleAnims[product.id]}
                            onPress={handleProductPress}
                            onToggleFavorite={handleToggleFavorite}
                            showBrands={showBrands}
                            showQuickAdd={showQuickAdd}
                        />
                    ))}
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {filteredProducts.map((product) => (
                        <ListProductCard
                            key={product.id}
                            product={product}
                            favorites={favorites}
                            scaleAnim={scaleAnims[product.id]}
                            onPress={handleProductPress}
                            onToggleFavorite={handleToggleFavorite}
                            showBrands={showBrands}
                            showQuickAdd={showQuickAdd}
                        />
                    ))}
                </View>
            )}
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

    // Filter Styles
    filterScrollContainer: {
        marginBottom: SPACING.lg,
        marginHorizontal: -SPACING.xs,
    },
    filterScrollContent: {
        paddingHorizontal: SPACING.xs,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        minHeight: 36,
    },
    filterButtonSelected: {
        backgroundColor: WALMART_COLORS.primary,
    },
    filterButtonDefault: {
        backgroundColor: WALMART_COLORS.gray100,
    },
    filterIcon: {
        marginRight: SPACING.xs,
    },
    filterText: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },
    filterTextSelected: {
        color: WALMART_COLORS.white,
    },
    filterTextDefault: {
        color: WALMART_COLORS.gray700,
    },

    // Grid Layout
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridCardWrapper: {
        marginBottom: SPACING.lg,
    },
    gridCard: {
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

    // Grid Image Styles
    gridImageContainer: {
        position: 'relative',
        height: 160,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },

    // List Layout
    listContainer: {
        gap: SPACING.md,
    },
    listCardWrapper: {
        marginBottom: SPACING.md,
    },
    listCard: {
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray100,
        flexDirection: 'row',
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

    // List Image Styles
    listImageContainer: {
        position: 'relative',
        width: 96,
        height: 96,
    },
    listImage: {
        width: '100%',
        height: '100%',
    },

    // Badge Styles
    badgesContainer: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        gap: SPACING.xs,
    },
    badge: {
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        alignSelf: 'flex-start',
    },
    newBadge: {
        backgroundColor: WALMART_COLORS.newGreen,
    },
    bestsellerBadge: {
        backgroundColor: WALMART_COLORS.bestsellerOrange,
    },
    saleBadge: {
        backgroundColor: WALMART_COLORS.saleRed,
    },
    badgeText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },
    listBadge: {
        position: 'absolute',
        top: SPACING.xs,
        left: SPACING.xs,
    },
    listBadgeText: {
        fontSize: 10,
    },

    // Favorite Button
    favoriteButton: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: WALMART_COLORS.backdropBlur,
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
                elevation: 2,
            },
        }),
    },

    // Out of Stock Overlay
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: WALMART_COLORS.outOfStockOverlay,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    outOfStockText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '700',
    },
    listOutOfStockOverlay: {
        borderRadius: 0,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    outOfStockTextSmall: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },

    // Content Styles
    gridContent: {
        padding: SPACING.md,
    },
    listContent: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    listContentTop: {
        flex: 1,
    },
    listContentBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Brand and Product Name
    brandText: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.xs,
    },
    productName: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.sm,
        lineHeight: 18,
    },
    listProductName: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.xs,
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
    currentPrice: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
    },
    originalPrice: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray500,
        textDecorationLine: 'line-through',
    },
    listPriceColumn: {
        flex: 1,
    },
    listCurrentPrice: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
    },
    listOriginalPrice: {
        fontSize: TYPOGRAPHY.xs,
        color: WALMART_COLORS.gray500,
        textDecorationLine: 'line-through',
    },

    // Free Shipping Badge
    freeShippingBadge: {
        backgroundColor: WALMART_COLORS.newGreenLight,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        alignSelf: 'flex-start',
        marginBottom: SPACING.sm,
    },
    freeShippingText: {
        color: WALMART_COLORS.freeShippingGreen,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '600',
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
    cartIconSmall: {
        marginRight: SPACING.xs,
    },
    addToCartText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },

    // List Actions
    listActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    listFavoriteButton: {
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
    listAddToCartButton: {
        backgroundColor: WALMART_COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
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
    listAddToCartText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },

    // Empty State
    emptyStateContainer: {
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 16,
        padding: SPACING.xxxl,
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    emptyStateTitle: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '600',
        marginTop: SPACING.lg,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        color: WALMART_COLORS.gray400,
        fontSize: TYPOGRAPHY.sm,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
});