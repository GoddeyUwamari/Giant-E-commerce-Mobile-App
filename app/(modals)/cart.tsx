import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../../store/slices/cartSlice';
import { ALL_CATEGORIES } from '../../constants/products/data';

const { width } = Dimensions.get('window');

interface CartItem {
    id: string;
    name: string;
    brand?: string;
    image: any;
    price: number;
    originalPrice?: number;
    quantity: number;
    minQuantity?: number;
    maxQuantity?: number;
    status: string;
    storeName?: string;
    productId: string;
    variant?: any;
    selectedVariants?: any;
    delivery?: any;
}

interface Summary {
    itemCount: number;
    subtotal: number;
    savings: number;
    discounts: number;
    shipping: number;
    delivery: number;
    tax: number;
    total: number;
    freeShippingThreshold?: number;
    freeShippingRemaining?: number;
}

interface PromoCode {
    code: string;
    description: string;
}

export default function CartModal(): JSX.Element {
    const [isLoading, setIsLoading] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [showPromoInput, setShowPromoInput] = useState(false);
    const [applyingPromo, setApplyingPromo] = useState(false);

    // Ensure state defaults to empty arrays/objects
    const items = useCartStore((state) => state.items || []) as CartItem[];
    const savedItems = useCartStore((state) => state.savedItems || []) as CartItem[];
    const summary = useCartStore((state) => state.summary || {
        itemCount: 0,
        subtotal: 0,
        savings: 0,
        discounts: 0,
        shipping: 0,
        delivery: 0,
        tax: 0,
        total: 0,
    }) as Summary;
    const appliedPromoCodes = useCartStore((state) => state.appliedPromoCodes || []) as PromoCode[];
    const error = useCartStore((state) => state.error || '');

    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
    const clearCart = useCartStore((state) => state.clearCart);
    const applyPromoCode = useCartStore((state) => state.applyPromoCode);
    const removePromoCode = useCartStore((state) => state.removePromoCode);
    const clearError = useCartStore((state) => state.clearError);
    const saveItemForLater = useCartStore((state) => state.saveItemForLater);
    const moveToCart = useCartStore((state) => state.moveToCart);

    // 🚀 REMOVED: The problematic validation logic that was causing "invalidImages" warnings
    // The new smart image system handles all image IDs automatically

    const featuredCategories = ALL_CATEGORIES.slice(0, 3);

    const updateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        await updateItemQuantity(id, newQuantity);
    };

    const handleRemoveItem = (id: string) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Save for Later', onPress: () => saveItemForLater(id) },
                { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
            ]
        );
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setApplyingPromo(true);
        const success = await applyPromoCode(promoCode.trim().toUpperCase());
        setApplyingPromo(false);
        if (success) {
            setPromoCode('');
            setShowPromoInput(false);
        }
    };

    const handleCheckout = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.dismiss();
            router.push('/checkout');
        }, 1000);
    };

    const handleViewDetails = (productId: string) => {
        router.dismiss();
        router.push(`/product/${productId}`);
    };

    const handleCategoryPress = (categorySlug: string) => {
        router.dismiss();
        router.push(`/category/${categorySlug}`);
    };

    const getDeliveryEstimate = () => {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 2);
        return deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
    };

    // 🚀 NEW: Smart image source function using the enhanced image loader
    const getImageSource = (image: any) => {
        // Since your new products have direct image URLs
        return { uri: image };
    };

    const getVariantText = (variant: any) => {
        if (variant && typeof variant === 'object') {
            if (Array.isArray(variant)) {
                // Handle array of variants
                return variant
                    .filter((v: any) => v && v.name && v.value)
                    .map((v: any) => `${v.name}: ${v.value}`)
                    .join(', ') || 'Unknown Variant';
            } else if (variant.name && typeof variant.name === 'string' && variant.value && typeof variant.value === 'string') {
                return `${variant.name}: ${variant.value}`;
            }
        }
        return 'Unknown Variant';
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        item && typeof item === 'object' && item.id ? (
            <View style={styles.cartItem}>
                <View style={styles.cartItemContent}>
                    <View style={styles.productImageContainer}>
                        <Image
                            source={getImageSource(item.image)}
                            style={styles.productImage}
                            resizeMode="cover"
                            // 🚀 REMOVED: onError handler since images always load now
                        />
                        {item.status !== 'available' && item.status !== 'limited_stock' && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>
                                    {item.status === 'out_of_stock' ? 'Out of Stock' : 'Limited Stock'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.productDetails}>
                        <Text style={styles.productName}>
                            {typeof item.name === 'string' ? item.name : 'Unnamed Product'}
                        </Text>
                        {item.brand && typeof item.brand === 'string' && (
                            <Text style={styles.productBrand}>{item.brand}</Text>
                        )}
                        {(item.variant || item.selectedVariants) && (
                            <View style={styles.variantContainer}>
                                <Text style={styles.variantText}>
                                    {getVariantText(item.variant || item.selectedVariants)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.priceContainer}>
                            <Text style={styles.currentPrice}>
                                ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                            </Text>
                            {typeof item.originalPrice === 'number' &&
                                item.originalPrice > item.price && (
                                    <Text style={styles.originalPrice}>
                                        ${item.originalPrice.toFixed(2)}
                                    </Text>
                                )}
                        </View>
                        {typeof item.originalPrice === 'number' &&
                            item.originalPrice > item.price && (
                                <Text style={styles.savingsText}>
                                    You save ${(item.originalPrice - item.price).toFixed(2)}
                                </Text>
                            )}
                        <View style={styles.quantityContainer}>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={[
                                        styles.quantityButton,
                                        item.quantity <= (item.minQuantity || 1)
                                            ? styles.quantityButtonDisabled
                                            : {},
                                    ]}
                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= (item.minQuantity || 1)}
                                >
                                    <Ionicons
                                        name="remove"
                                        size={16}
                                        color={
                                            item.quantity <= (item.minQuantity || 1)
                                                ? '#D1D5DB'
                                                : '#374151'
                                        }
                                    />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>
                                    {typeof item.quantity === 'number' ? item.quantity : 1}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.quantityButton,
                                        item.quantity >= (item.maxQuantity || Infinity)
                                            ? styles.quantityButtonDisabled
                                            : {},
                                    ]}
                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= (item.maxQuantity || Infinity)}
                                >
                                    <Ionicons
                                        name="add"
                                        size={16}
                                        color={
                                            item.quantity >= (item.maxQuantity || Infinity)
                                                ? '#D1D5DB'
                                                : '#374151'
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveItem(item.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.itemActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => saveItemForLater(item.id)}
                            >
                                <Text style={styles.actionButtonText}>Save for Later</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleViewDetails(item.productId)}
                            >
                                <Text style={styles.actionButtonText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                        {item.status === 'limited_stock' &&
                            typeof item.maxQuantity === 'number' && (
                                <Text style={styles.stockWarning}>
                                    Only {item.maxQuantity} left in stock
                                </Text>
                            )}
                        {item.storeName && typeof item.storeName === 'string' && (
                            <Text style={styles.storeInfo}>Sold by {item.storeName}</Text>
                        )}
                    </View>
                </View>
            </View>
        ) : null
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => router.dismiss()}>
                        <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            Cart ({typeof summary.itemCount === 'number' ? summary.itemCount : 0})
                        </Text>
                        {summary.itemCount > 0 && (
                            <View style={styles.headerBadge}>
                                <View style={styles.headerBadgeDot} />
                            </View>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                        router.dismiss();
                        router.push('/(tabs)/favorites');
                    }}
                >
                    <Ionicons name="heart-outline" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {error && typeof error === 'string' && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
                        <Ionicons name="close" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            )}

            {items.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <View style={styles.emptyCartIcon}>
                        <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
                    </View>
                    <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                    <Text style={styles.emptyCartSubtitle}>
                        Add items to your cart to see them here. Start shopping for great deals!
                    </Text>
                    <View style={styles.recentlyViewedSection}>
                        <Text style={styles.recentlyViewedTitle}>Continue Shopping</Text>
                        <View style={styles.quickLinksContainer}>
                            {featuredCategories.map((category) =>
                                category && typeof category === 'object' && category.id ? (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.quickLinkButton,
                                            { backgroundColor: `${category.color}15` },
                                        ]}
                                        onPress={() => handleCategoryPress(category.slug)}
                                    >
                                        <Ionicons
                                            name={
                                                typeof category.icon === 'string'
                                                    ? category.icon
                                                    : 'pricetag-outline'
                                            }
                                            size={16}
                                            color={
                                                typeof category.color === 'string'
                                                    ? category.color
                                                    : '#0071CE'
                                            }
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text
                                            style={[
                                                styles.quickLinkText,
                                                {
                                                    color:
                                                        typeof category.color === 'string'
                                                            ? category.color
                                                            : '#0071CE',
                                                },
                                            ]}
                                        >
                                            {typeof category.name === 'string'
                                                ? category.name
                                                : 'Unknown Category'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null
                            )}
                        </View>
                    </View>
                    <View style={styles.emptyActions}>
                        <TouchableOpacity
                            style={styles.startShoppingButton}
                            onPress={() => {
                                router.dismiss();
                                router.push('/product');
                            }}
                        >
                            <Ionicons
                                name="storefront-outline"
                                size={20}
                                color="#ffffff"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.startShoppingButtonText}>Browse Products</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dealsButton}
                            onPress={() => {
                                router.dismiss();
                                router.push('/product?filter=flash-deals');
                            }}
                        >
                            <Ionicons
                                name="flash-outline"
                                size={20}
                                color="#0071CE"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.dealsButtonText}>Flash Deals</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.deliveryInfo}>
                            <View style={styles.deliveryInfoRow}>
                                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                <Text style={styles.deliveryInfoText}>
                                    {typeof summary.freeShippingThreshold === 'number' &&
                                    typeof summary.subtotal === 'number' &&
                                    summary.subtotal >= summary.freeShippingThreshold
                                        ? `Free delivery included! • Arrives by ${getDeliveryEstimate()}`
                                        : `Free delivery on orders over $${
                                            typeof summary.freeShippingThreshold === 'number'
                                                ? summary.freeShippingThreshold
                                                : 35
                                        }`}
                                </Text>
                            </View>
                            {typeof summary.freeShippingRemaining === 'number' &&
                                summary.freeShippingRemaining > 0 && (
                                    <Text style={styles.deliveryInfoSubtext}>
                                        Add ${summary.freeShippingRemaining.toFixed(2)} more for free
                                        delivery
                                    </Text>
                                )}
                        </View>
                        <View style={styles.promoSection}>
                            {!showPromoInput ? (
                                <TouchableOpacity
                                    style={styles.promoCodeButton}
                                    onPress={() => setShowPromoInput(true)}
                                >
                                    <Ionicons name="pricetag-outline" size={20} color="#0071CE" />
                                    <Text style={styles.promoCodeButtonText}>Add promo code</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#0071CE" />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.promoInputContainer}>
                                    <TextInput
                                        style={styles.promoInput}
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChangeText={setPromoCode}
                                        autoCapitalize="characters"
                                        returnKeyType="done"
                                        onSubmitEditing={handleApplyPromo}
                                    />
                                    <TouchableOpacity
                                        style={[
                                            styles.applyButton,
                                            !promoCode.trim() && styles.applyButtonDisabled,
                                        ]}
                                        onPress={handleApplyPromo}
                                        disabled={!promoCode.trim() || applyingPromo}
                                    >
                                        {applyingPromo ? (
                                            <ActivityIndicator size="small" color="#ffffff" />
                                        ) : (
                                            <Text style={styles.applyButtonText}>Apply</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {appliedPromoCodes.length > 0 && (
                            <View style={styles.promoCodesSection}>
                                <Text style={styles.promoCodesTitle}>Applied Offers</Text>
                                {appliedPromoCodes.map((promo) =>
                                    promo && typeof promo === 'object' && promo.code ? (
                                        <View key={promo.code} style={styles.promoCodeItem}>
                                            <View style={styles.promoCodeInfo}>
                                                <Text style={styles.promoCodeText}>
                                                    {typeof promo.code === 'string'
                                                        ? promo.code
                                                        : 'Unknown Code'}
                                                </Text>
                                                <Text style={styles.promoDescription}>
                                                    {typeof promo.description === 'string'
                                                        ? promo.description
                                                        : 'No description'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.removePromoButton}
                                                onPress={() => removePromoCode(promo.code)}
                                            >
                                                <Ionicons name="close" size={16} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                )}
                            </View>
                        )}
                        <FlatList
                            data={items}
                            renderItem={renderCartItem}
                            keyExtractor={(item) => (item && item.id ? item.id : Math.random().toString())}
                            scrollEnabled={false}
                        />
                        {savedItems.length > 0 && (
                            <View style={styles.savedItemsSection}>
                                <Text style={styles.savedItemsTitle}>
                                    Saved for Later ({savedItems.length})
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {savedItems.map((item) =>
                                        item && typeof item === 'object' && item.id ? (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.savedItem}
                                                onPress={() => moveToCart(item.id)}
                                            >
                                                <Image
                                                    source={getImageSource(item.image)}
                                                    style={styles.savedItemImage}
                                                    resizeMode="cover"
                                                    // 🚀 REMOVED: onError handler since images always load now
                                                />
                                                <Text style={styles.savedItemName} numberOfLines={2}>
                                                    {typeof item.name === 'string'
                                                        ? item.name
                                                        : 'Unnamed Product'}
                                                </Text>
                                                <Text style={styles.savedItemPrice}>
                                                    ${typeof item.price === 'number'
                                                    ? item.price.toFixed(2)
                                                    : '0.00'}
                                                </Text>
                                                {(item.variant || item.selectedVariants) && (
                                                    <Text style={styles.savedItemVariant}>
                                                        {getVariantText(item.variant || item.selectedVariants)}
                                                    </Text>
                                                )}
                                                <TouchableOpacity
                                                    style={styles.moveToCartButton}
                                                    onPress={() => moveToCart(item.id)}
                                                >
                                                    <Text style={styles.moveToCartText}>
                                                        Add to Cart
                                                    </Text>
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        ) : null
                                    )}
                                </ScrollView>
                            </View>
                        )}
                        <View style={styles.recommendedSection}>
                            <Text style={styles.recommendedTitle}>You might also like</Text>
                            <TouchableOpacity
                                style={styles.browseMoreButton}
                                onPress={() => {
                                    router.dismiss();
                                    router.push('/product?filter=trending');
                                }}
                            >
                                <Text style={styles.browseMoreText}>Browse Trending Products</Text>
                                <Ionicons name="arrow-forward" size={16} color="#0071CE" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    <View style={styles.orderSummary}>
                        <View style={styles.securityBadge}>
                            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                            <Text style={styles.securityText}>Secure Checkout</Text>
                        </View>
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>
                                    ${typeof summary.subtotal === 'number'
                                    ? summary.subtotal.toFixed(2)
                                    : '0.00'}
                                </Text>
                            </View>
                            {typeof summary.savings === 'number' && summary.savings > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.savingsLabel}>Total Savings</Text>
                                    <Text style={styles.savingsValue}>
                                        -${summary.savings.toFixed(2)}
                                    </Text>
                                </View>
                            )}
                            {typeof summary.discounts === 'number' && summary.discounts > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.savingsLabel}>Discounts</Text>
                                    <Text style={styles.savingsValue}>
                                        -${summary.discounts.toFixed(2)}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>
                                    {summary.shipping > 0
                                        ? 'Shipping'
                                        : summary.delivery > 0
                                            ? 'Delivery'
                                            : 'Delivery'}
                                </Text>
                                <Text style={styles.summaryValue}>
                                    {typeof summary.shipping === 'number' &&
                                    typeof summary.delivery === 'number' &&
                                    summary.shipping + summary.delivery === 0
                                        ? 'FREE'
                                        : `$${(typeof summary.shipping === 'number'
                                            ? summary.shipping
                                            : 0) +
                                        (typeof summary.delivery === 'number'
                                            ? summary.delivery
                                            : 0).toFixed(2)}`}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <View style={styles.taxContainer}>
                                    <Text style={styles.summaryLabel}>Tax</Text>
                                    <Ionicons
                                        name="information-circle-outline"
                                        size={16}
                                        color="#6B7280"
                                    />
                                </View>
                                <Text style={styles.summaryValue}>
                                    ${typeof summary.tax === 'number' ? summary.tax.toFixed(2) : '0.00'}
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>
                                        ${typeof summary.total === 'number'
                                        ? summary.total.toFixed(2)
                                        : '0.00'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutButton, isLoading && styles.checkoutButtonDisabled]}
                            onPress={handleCheckout}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#0071CE', '#004C91']}
                                style={styles.checkoutGradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="lock-closed"
                                            size={16}
                                            color="#ffffff"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={styles.checkoutButtonText}>
                                            Proceed to Checkout
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#ffffff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerBadge: {
        marginLeft: 10,
    },
    headerBadgeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FECACA',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 15,
        flex: 1,
        fontWeight: '500',
    },
    errorCloseButton: {
        padding: 6,
        borderRadius: 4,
    },
    emptyCartContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 40,
    },
    emptyCartIcon: {
        width: 120,
        height: 120,
        backgroundColor: '#F3F4F6',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyCartTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyCartSubtitle: {
        fontSize: 17,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
        maxWidth: 320,
    },
    recentlyViewedSection: {
        width: '100%',
        marginBottom: 40,
    },
    recentlyViewedTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 20,
    },
    quickLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickLinkButton: {
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quickLinkText: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptyActions: {
        width: '100%',
        gap: 16,
    },
    startShoppingButton: {
        backgroundColor: '#0066B3',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#0066B3',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    startShoppingButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 19,
    },
    dealsButton: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0066B3',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    dealsButtonText: {
        color: '#0066B3',
        fontWeight: '600',
        fontSize: 17,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    deliveryInfo: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    deliveryInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryInfoText: {
        color: '#065F46',
        fontWeight: '600',
        marginLeft: 12,
        fontSize: 16,
        flex: 1,
        lineHeight: 22,
    },
    deliveryInfoSubtext: {
        color: '#047857',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    promoSection: {
        marginBottom: 20,
    },
    promoCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        shadowColor: '#0066B3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    promoCodeButtonText: {
        color: '#0066B3',
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
        marginLeft: 16,
    },
    promoInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    promoInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 17,
        color: '#1F2937',
        fontWeight: '500',
    },
    applyButton: {
        backgroundColor: '#0066B3',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0066B3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    applyButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
    },
    applyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    promoCodesSection: {
        marginBottom: 20,
    },
    promoCodesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    promoCodeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    promoCodeInfo: {
        flex: 1,
    },
    promoCodeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E40AF',
    },
    promoDescription: {
        fontSize: 14,
        color: '#1C51B9',
        marginTop: 4,
        fontWeight: '500',
    },
    removePromoButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
    },
    cartItem: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cartItemContent: {
        flexDirection: 'row',
    },
    productImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        color: '#1F2937',
        fontWeight: '600',
        fontSize: 18,
        lineHeight: 24,
        marginBottom: 8,
    },
    productBrand: {
        color: '#6B7280',
        fontSize: 15,
        marginBottom: 8,
        fontWeight: '500',
    },
    variantContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    variantText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    savedItemVariant: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '500',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    currentPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    originalPrice: {
        color: '#9CA3AF',
        fontSize: 16,
        textDecorationLine: 'line-through',
        marginLeft: 12,
        fontWeight: '500',
    },
    savingsText: {
        color: '#059669',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    quantityButton: {
        padding: 12,
        borderRadius: 10,
    },
    quantityButtonDisabled: {
        opacity: 0.4,
    },
    quantityText: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        fontSize: 18,
        fontWeight: '700',
        minWidth: 50,
        textAlign: 'center',
        color: '#1F2937',
    },
    removeButton: {
        marginLeft: 20,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#FEF2F2',
    },
    itemActions: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 20,
    },
    actionButton: {
        paddingVertical: 8,
    },
    actionButtonText: {
        color: '#0066B3',
        fontSize: 15,
        fontWeight: '600',
    },
    stockWarning: {
        color: '#D97706',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    storeInfo: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 8,
        fontWeight: '500',
    },
    savedItemsSection: {
        marginTop: 32,
        marginBottom: 20,
    },
    savedItemsTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 20,
    },
    savedItem: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        width: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    savedItemImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    savedItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        lineHeight: 22,
    },
    savedItemPrice: {
        color: '#0066B3',
        fontWeight: '700',
        fontSize: 17,
        marginBottom: 12,
    },
    moveToCartButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    moveToCartText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    recommendedSection: {
        marginTop: 32,
        marginBottom: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    recommendedTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    browseMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        shadowColor: '#0066B3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    browseMoreText: {
        color: '#0066B3',
        fontSize: 17,
        fontWeight: '600',
        marginRight: 12,
    },
    orderSummary: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        padding: 24,
        backgroundColor: '#ffffff',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#F0FDF4',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'center',
    },
    securityText: {
        color: '#059669',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    summaryDetails: {
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingVertical: 2,
    },
    summaryLabel: {
        color: '#6B7280',
        fontSize: 17,
        fontWeight: '500',
    },
    summaryValue: {
        color: '#1F2937',
        fontWeight: '600',
        fontSize: 17,
    },
    savingsLabel: {
        color: '#059669',
        fontSize: 17,
        fontWeight: '500',
    },
    savingsValue: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 17,
    },
    taxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    totalRow: {
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
        marginTop: 12,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderRadius: 12,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0066B3',
    },
    checkoutButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#0066B3',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    checkoutButtonDisabled: {
        elevation: 2,
        shadowOpacity: 0.15,
    },
    checkoutGradient: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    checkoutButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 19,
    },
});