import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Pressable,
    StyleSheet,
    Platform,
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

interface ProductCardProps {
    product: Product;
    layout?: 'grid' | 'list' | 'compact';
    showQuickActions?: boolean;
    showVariants?: boolean;
    showBrand?: boolean;
    showCategory?: boolean;
    showDeliveryInfo?: boolean;
    showStockInfo?: boolean;
    cardWidth?: number;
    onPress: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    onQuickView?: (product: Product) => void;
}

// Constants
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
    bestsellerOrange: '#F97316',
    discountRed: '#EF4444',
    outOfStockGray: '#6B7280',
    favoriteRed: '#EF4444',
    starYellow: '#F59E0B',
    freeShippingGreen: '#059669',
    fastDeliveryAmber: '#F59E0B',
    stockWarningRed: '#DC2626',
    savingsGreen: '#10B981',
    savingsGreenLight: '#D1FAE5',
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
};

// Utility Functions
const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

const calculateSavings = (originalPrice: number, salePrice: number): string => {
    return `$${(originalPrice - salePrice).toFixed(2)}`;
};

// Badge Component
const ProductBadge = React.memo(({
                                     type,
                                     text,
                                     color
                                 }: {
    type: string;
    text: string;
    color: string;
}) => (
    <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{text}</Text>
    </View>
));

// Badges Container Component
const ProductBadges = React.memo(({ product }: { product: Product }) => (
    <View style={styles.badgesContainer}>
        {product.isNew && (
            <ProductBadge type="new" text="NEW" color={WALMART_COLORS.newGreen} />
        )}
        {product.isBestseller && (
            <ProductBadge type="bestseller" text="BESTSELLER" color={WALMART_COLORS.bestsellerOrange} />
        )}
        {product.discount && (
            <ProductBadge type="discount" text={`-${product.discount}%`} color={WALMART_COLORS.discountRed} />
        )}
        {product.inStock === false && (
            <ProductBadge type="outofstock" text="OUT OF STOCK" color={WALMART_COLORS.outOfStockGray} />
        )}
    </View>
));

// Quick Actions Component
const QuickActions = React.memo(({
                                     product,
                                     showQuickActions,
                                     onToggleFavorite,
                                     onQuickView,
                                 }: {
    product: Product;
    showQuickActions: boolean;
    onToggleFavorite?: (product: Product) => void;
    onQuickView?: (product: Product) => void;
}) => {
    if (!showQuickActions) return null;

    return (
        <View style={styles.quickActionsContainer}>
            {onToggleFavorite && (
                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => onToggleFavorite(product)}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={product.isFavorite ? 'heart' : 'heart-outline'}
                        size={16}
                        color={product.isFavorite ? WALMART_COLORS.favoriteRed : WALMART_COLORS.gray600}
                    />
                </TouchableOpacity>
            )}
            {onQuickView && (
                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => onQuickView(product)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="eye-outline" size={16} color={WALMART_COLORS.gray600} />
                </TouchableOpacity>
            )}
        </View>
    );
});

// Rating Component
const ProductRating = React.memo(({
                                      rating,
                                      reviewCount,
                                      isCompact = false
                                  }: {
    rating: number;
    reviewCount: number;
    isCompact?: boolean;
}) => (
    <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                    key={star}
                    name="star"
                    size={isCompact ? 10 : 12}
                    color={star <= rating ? WALMART_COLORS.starYellow : WALMART_COLORS.gray200}
                />
            ))}
        </View>
        <Text style={styles.reviewCount}>
            {reviewCount > 0 ? `(${reviewCount})` : 'No reviews'}
        </Text>
    </View>
));

// Pricing Component
const ProductPricing = React.memo(({
                                       product,
                                       isCompact = false
                                   }: {
    product: Product;
    isCompact?: boolean;
}) => {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const savings = hasDiscount ? calculateSavings(product.originalPrice!, product.price) : null;

    return (
        <View style={styles.pricingContainer}>
            <View style={styles.priceColumn}>
                <Text style={[
                    styles.currentPrice,
                    isCompact && styles.currentPriceCompact
                ]}>
                    {formatPrice(product.price)}
                </Text>
                {hasDiscount && (
                    <Text style={styles.originalPrice}>
                        {formatPrice(product.originalPrice!)}
                    </Text>
                )}
            </View>
            {hasDiscount && !isCompact && (
                <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                        Save {savings}
                    </Text>
                </View>
            )}
        </View>
    );
});

// Delivery Info Component
const DeliveryInfo = React.memo(({
                                     product,
                                     showDeliveryInfo
                                 }: {
    product: Product;
    showDeliveryInfo: boolean;
}) => {
    if (!showDeliveryInfo || (!product.freeShipping && !product.fastDelivery && !product.deliveryDate)) {
        return null;
    }

    return (
        <View style={styles.deliveryContainer}>
            {product.freeShipping && (
                <View style={styles.deliveryItem}>
                    <Ionicons name="checkmark-circle" size={12} color={WALMART_COLORS.freeShippingGreen} />
                    <Text style={styles.freeShippingText}>Free Shipping</Text>
                </View>
            )}
            {product.fastDelivery && (
                <View style={styles.deliveryItem}>
                    <Ionicons name="flash" size={12} color={WALMART_COLORS.fastDeliveryAmber} />
                    <Text style={styles.fastDeliveryText}>Fast Delivery</Text>
                </View>
            )}
            {product.deliveryDate && (
                <View style={styles.deliveryItem}>
                    <Ionicons name="time-outline" size={12} color={WALMART_COLORS.gray600} />
                    <Text style={styles.deliveryDateText}>Arrives {product.deliveryDate}</Text>
                </View>
            )}
        </View>
    );
});

// Color Variants Component
const ColorVariants = React.memo(({
                                      variants,
                                      selectedColor,
                                      onColorSelect,
                                  }: {
    variants?: { colors?: string[] };
    selectedColor: number;
    onColorSelect: (index: number) => void;
}) => {
    if (!variants?.colors?.length) return null;

    return (
        <View style={styles.variantsContainer}>
            <View style={styles.colorVariants}>
                {variants.colors.slice(0, 4).map((color, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.colorVariant,
                            { backgroundColor: color },
                            selectedColor === index && styles.colorVariantSelected,
                        ]}
                        onPress={() => onColorSelect(index)}
                        activeOpacity={0.8}
                    />
                ))}
                {variants.colors.length > 4 && (
                    <Text style={styles.moreVariantsText}>
                        +{variants.colors.length - 4}
                    </Text>
                )}
            </View>
        </View>
    );
});

// Stock Info Component
const StockInfo = React.memo(({
                                  product,
                                  showStockInfo
                              }: {
    product: Product;
    showStockInfo: boolean;
}) => {
    if (!showStockInfo || !product.stockCount || product.stockCount > 10) return null;

    return (
        <View style={styles.stockContainer}>
            <Text style={styles.stockText}>
                Only {product.stockCount} left in stock!
            </Text>
            <View style={styles.stockProgressBar}>
                <View
                    style={[
                        styles.stockProgressFill,
                        { width: `${(product.stockCount / 10) * 100}%` },
                    ]}
                />
            </View>
        </View>
    );
});

// Add to Cart Button Component
const AddToCartButton = React.memo(({
                                        product,
                                        onAddToCart,
                                        isCompact = false,
                                    }: {
    product: Product;
    onAddToCart?: (product: Product) => void;
    isCompact?: boolean;
}) => {
    if (!onAddToCart || product.inStock === false) return null;

    return (
        <TouchableOpacity
            style={[styles.addToCartButton, isCompact && styles.addToCartButtonCompact]}
            onPress={() => onAddToCart(product)}
            activeOpacity={0.8}
        >
            <Ionicons
                name="cart-outline"
                size={isCompact ? 14 : 16}
                color={WALMART_COLORS.white}
                style={styles.cartIcon}
            />
            <Text style={[styles.addToCartText, isCompact && styles.addToCartTextCompact]}>
                {isCompact ? 'Add' : 'Add to Cart'}
            </Text>
        </TouchableOpacity>
    );
});

// Main Component
export default function ProductCard({
                                        product,
                                        layout = 'grid',
                                        showQuickActions = true,
                                        showVariants = false,
                                        showBrand = true,
                                        showCategory = true,
                                        showDeliveryInfo = true,
                                        showStockInfo = true,
                                        cardWidth,
                                        onPress,
                                        onAddToCart,
                                        onToggleFavorite,
                                        onQuickView,
                                    }: ProductCardProps): JSX.Element {
    // State
    const [selectedColor, setSelectedColor] = useState(0);

    // Animation
    const scaleAnim = useMemo(() => new Animated.Value(1), []);

    // Callbacks
    const handlePress = useCallback(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onPress(product);
        });
    }, [scaleAnim, product, onPress]);

    const handleColorSelect = useCallback((index: number) => {
        setSelectedColor(index);
    }, []);

    // Grid Layout
    if (layout === 'grid') {
        return (
            <Animated.View
                style={[
                    styles.gridCard,
                    { transform: [{ scale: scaleAnim }] },
                    cardWidth && { width: cardWidth },
                ]}
            >
                <Pressable onPress={handlePress} style={styles.cardPressable}>
                    {/* Image Container */}
                    <View style={styles.gridImageContainer}>
                        <Image
                            source={{ uri: product.image }}
                            style={styles.gridImage}
                            contentFit="cover"
                            transition={200}
                        />
                        <ProductBadges product={product} />
                        <QuickActions
                            product={product}
                            showQuickActions={showQuickActions}
                            onToggleFavorite={onToggleFavorite}
                            onQuickView={onQuickView}
                        />
                        {product.inStock === false && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.gridContent}>
                        {showBrand && product.brand && (
                            <Text style={styles.brandText}>{product.brand}</Text>
                        )}

                        <Text style={styles.productName} numberOfLines={2}>
                            {product.name}
                        </Text>

                        {showCategory && product.category && (
                            <Text style={styles.categoryText}>{product.category}</Text>
                        )}

                        <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
                        <ProductPricing product={product} />
                        <DeliveryInfo product={product} showDeliveryInfo={showDeliveryInfo} />

                        {showVariants && (
                            <ColorVariants
                                variants={product.variants}
                                selectedColor={selectedColor}
                                onColorSelect={handleColorSelect}
                            />
                        )}

                        <StockInfo product={product} showStockInfo={showStockInfo} />
                        <AddToCartButton product={product} onAddToCart={onAddToCart} />
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    // List Layout
    if (layout === 'list') {
        return (
            <Animated.View
                style={[
                    styles.listCard,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <Pressable onPress={handlePress} style={styles.listCardPressable}>
                    {/* Image Container */}
                    <View style={styles.listImageContainer}>
                        <Image
                            source={{ uri: product.image }}
                            style={styles.listImage}
                            contentFit="cover"
                            transition={200}
                        />
                        {product.isNew && (
                            <View style={[styles.badge, styles.listBadge, { backgroundColor: WALMART_COLORS.newGreen }]}>
                                <Text style={[styles.badgeText, styles.listBadgeText]}>NEW</Text>
                            </View>
                        )}
                        {product.discount && (
                            <View style={[styles.badge, styles.listDiscountBadge, { backgroundColor: WALMART_COLORS.discountRed }]}>
                                <Text style={[styles.badgeText, styles.listBadgeText]}>-{product.discount}%</Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.listContent}>
                        <View style={styles.listContentTop}>
                            {showBrand && product.brand && (
                                <Text style={styles.brandText}>{product.brand}</Text>
                            )}

                            <Text style={styles.listProductName} numberOfLines={2}>
                                {product.name}
                            </Text>

                            <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
                            <DeliveryInfo product={product} showDeliveryInfo={showDeliveryInfo} />
                        </View>

                        <View style={styles.listContentBottom}>
                            <ProductPricing product={product} />

                            <View style={styles.listActions}>
                                {onToggleFavorite && (
                                    <TouchableOpacity
                                        style={styles.listFavoriteButton}
                                        onPress={() => onToggleFavorite(product)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name={product.isFavorite ? 'heart' : 'heart-outline'}
                                            size={16}
                                            color={product.isFavorite ? WALMART_COLORS.favoriteRed : WALMART_COLORS.gray600}
                                        />
                                    </TouchableOpacity>
                                )}

                                <AddToCartButton
                                    product={product}
                                    onAddToCart={onAddToCart}
                                    isCompact={true}
                                />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    // Compact Layout
    return (
        <Animated.View
            style={[
                styles.compactCard,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <Pressable onPress={handlePress} style={styles.compactCardPressable}>
                {/* Image */}
                <View style={styles.compactImageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.compactImage}
                        contentFit="cover"
                        transition={200}
                    />
                    {product.discount && (
                        <View style={[styles.badge, styles.compactDiscountBadge, { backgroundColor: WALMART_COLORS.discountRed }]}>
                            <Text style={[styles.badgeText, styles.compactBadgeText]}>-{product.discount}%</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.compactContent}>
                    {showBrand && product.brand && (
                        <Text style={styles.compactBrandText}>{product.brand}</Text>
                    )}
                    <Text style={styles.compactProductName} numberOfLines={1}>
                        {product.name}
                    </Text>
                    <ProductRating rating={product.rating} reviewCount={product.reviewCount} isCompact={true} />
                    <ProductPricing product={product} isCompact={true} />
                </View>

                {/* Actions */}
                <View style={styles.compactActions}>
                    {onToggleFavorite && (
                        <TouchableOpacity
                            onPress={() => onToggleFavorite(product)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={product.isFavorite ? 'heart' : 'heart-outline'}
                                size={20}
                                color={product.isFavorite ? WALMART_COLORS.favoriteRed : WALMART_COLORS.gray600}
                            />
                        </TouchableOpacity>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={WALMART_COLORS.gray600} />
                </View>
            </Pressable>
        </Animated.View>
    );
}

// Enhanced Styles
const styles = StyleSheet.create({
    // Grid Layout
    gridCard: {
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray100,
        marginBottom: SPACING.lg,
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
    cardPressable: {
        flex: 1,
    },
    gridImageContainer: {
        position: 'relative',
        height: 192,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridContent: {
        padding: SPACING.lg,
    },

    // List Layout
    listCard: {
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray100,
        marginBottom: SPACING.lg,
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
    listCardPressable: {
        flexDirection: 'row',
    },
    listImageContainer: {
        position: 'relative',
        width: 112,
        height: 112,
    },
    listImage: {
        width: '100%',
        height: '100%',
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
    listProductName: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.xs,
        lineHeight: 18,
    },
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

    // Compact Layout
    compactCard: {
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray100,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
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
    compactCardPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    compactImageContainer: {
        position: 'relative',
        marginRight: SPACING.md,
    },
    compactImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
    },
    compactContent: {
        flex: 1,
    },
    compactBrandText: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    compactProductName: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.gray900,
        lineHeight: 18,
    },
    compactActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },

    // Badges
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
    listDiscountBadge: {
        position: 'absolute',
        top: SPACING.xs,
        right: SPACING.xs,
    },
    listBadgeText: {
        fontSize: 10,
    },
    compactDiscountBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
    },
    compactBadgeText: {
        fontSize: 10,
    },

    // Quick Actions
    quickActionsContainer: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        gap: SPACING.sm,
    },
    quickActionButton: {
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
    },
    outOfStockText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
    },

    // Brand and Category
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
    categoryText: {
        color: WALMART_COLORS.gray400,
        fontSize: TYPOGRAPHY.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.sm,
    },

    // Rating
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

    // Pricing
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
    currentPriceCompact: {
        fontSize: TYPOGRAPHY.sm,
    },
    originalPrice: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray500,
        textDecorationLine: 'line-through',
    },
    savingsBadge: {
        backgroundColor: WALMART_COLORS.savingsGreenLight,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    savingsText: {
        color: WALMART_COLORS.savingsGreen,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },

    // Delivery Info
    deliveryContainer: {
        gap: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    deliveryItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    freeShippingText: {
        color: WALMART_COLORS.freeShippingGreen,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    fastDeliveryText: {
        color: WALMART_COLORS.fastDeliveryAmber,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    deliveryDateText: {
        color: WALMART_COLORS.gray600,
        fontSize: TYPOGRAPHY.xs,
        marginLeft: SPACING.xs,
    },

    // Color Variants
    variantsContainer: {
        marginBottom: SPACING.sm,
    },
    colorVariants: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    colorVariant: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: WALMART_COLORS.gray300,
    },
    colorVariantSelected: {
        borderColor: WALMART_COLORS.primary,
        borderWidth: 2,
    },
    moreVariantsText: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.xs,
        marginLeft: SPACING.xs,
    },

    // Stock Info
    stockContainer: {
        marginBottom: SPACING.sm,
    },
    stockText: {
        color: WALMART_COLORS.stockWarningRed,
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
        backgroundColor: WALMART_COLORS.stockWarningRed,
        height: 4,
        borderRadius: 2,
    },

    // Add to Cart Button
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
    addToCartButtonCompact: {
        borderRadius: 20,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
    },
    cartIcon: {
        marginRight: SPACING.xs,
    },
    addToCartText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },
    addToCartTextCompact: {
        fontSize: TYPOGRAPHY.sm,
    },
});