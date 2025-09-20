import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Share,
    StyleSheet,
    Linking,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import real order system
import { useCartStore } from '../../store/slices/cartSlice';
import { orderStorage } from '../../services/storage/asyncStorage';
import OrderCreationService from '../../services/orderCreation/OrderCreationService';
import { ALL_PRODUCTS } from '../../constants/products/data';
import type { Order, OrderItem as APIOrderItem, OrderStatus } from '../../services/api/orders';

// Helper function for product images
const getImageById = (id: string | number, size?: string) => {
    const product = ALL_PRODUCTS.find(p => p.id === id.toString());
    if (product && product.image) {
        return { uri: product.image };
    }
    return { uri: 'https://via.placeholder.com/300x300/f0f0f0/666?text=No+Image' };
};

export default function OrderDetailsPage(): JSX.Element {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cart store for reorder functionality
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let loadedOrder: Order | null = null;

            // Priority 1: Use orderId from params if provided and valid
            if (orderId && orderId !== 'undefined') {
                console.log('Loading order by ID:', orderId);
                try {
                    loadedOrder = await OrderCreationService.getOrderById(orderId);
                } catch (error) {
                    console.warn('Failed to load order by ID:', error);
                }
            }

            // Priority 2: Get current order from storage if no orderId or failed
            if (!loadedOrder) {
                console.log('Loading current order from storage...');
                try {
                    loadedOrder = await orderStorage.getCurrentOrder();
                } catch (error) {
                    console.warn('Failed to load current order:', error);
                }
            }

            // Priority 3: Get latest order ID from storage
            if (!loadedOrder) {
                console.log('Loading latest order by ID...');
                try {
                    const latestOrderId = await orderStorage.getLatestOrderId();
                    if (latestOrderId) {
                        loadedOrder = await OrderCreationService.getOrderById(latestOrderId);
                    }
                } catch (error) {
                    console.warn('Failed to load latest order:', error);
                }
            }

            if (loadedOrder) {
                setOrder(loadedOrder);
                console.log('✅ Order loaded successfully:', loadedOrder.id);
            } else {
                throw new Error('No order found');
            }

        } catch (error) {
            console.error('❌ Error loading order details:', error);
            setError('Failed to load order details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrderDetails();
        setRefreshing(false);
    };

    const handleTrackPackage = () => {
        if (order?.tracking?.trackingNumber) {
            const trackingNumber = order.tracking.trackingNumber;
            const carrier = order.shipping.method.carrier.toLowerCase();

            let trackingUrl = '';
            switch (carrier) {
                case 'fedex':
                    trackingUrl = `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
                    break;
                case 'ups':
                    trackingUrl = `https://www.ups.com/track?track=yes&trackNums=${trackingNumber}`;
                    break;
                case 'usps':
                    trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`;
                    break;
                default:
                    Alert.alert('Tracking', `Tracking Number: ${trackingNumber}`);
                    return;
            }
            Linking.openURL(trackingUrl);
        } else {
            Alert.alert('Tracking', 'Tracking information will be available once your order ships.');
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !canCancelOrder()) {
            Alert.alert('Cannot Cancel', 'This order cannot be cancelled as it has already been processed or shipped.');
            return;
        }

        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order? This action cannot be undone.',
            [
                { text: 'Keep Order', style: 'cancel' },
                {
                    text: 'Cancel Order',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            Alert.alert('Success', 'Your order has been cancelled. Refund will be processed within 3-5 business days.');
                            await loadOrderDetails();
                        } catch (error) {
                            console.error('Cancel order error:', error);
                            Alert.alert('Error', 'Failed to cancel order. Please contact support.');
                        }
                    }
                }
            ]
        );
    };

    const handleReturnItems = () => {
        if (!order || !canReturnOrder()) {
            Alert.alert('Cannot Return', 'The return window for this order has expired.');
            return;
        }
        router.push(`/orders/${orderId}/return`);
    };

    const handleReorder = async () => {
        if (!order?.items) return;

        Alert.alert(
            'Reorder Items',
            'Add all items from this order to your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add to Cart',
                    onPress: async () => {
                        try {
                            for (const item of order.items) {
                                const productData = ALL_PRODUCTS.find(p => p.id === item.productId);

                                await addItem({
                                    productId: item.productId,
                                    name: item.name,
                                    brand: item.brand || item.seller.name,
                                    price: item.price,
                                    originalPrice: item.originalPrice,
                                    quantity: item.quantity,
                                    maxQuantity: productData?.maxQuantity || 10,
                                    minQuantity: productData?.minQuantity || 1,
                                    image: item.image,
                                    category: item.category,
                                    sku: item.sku,
                                    status: 'available',
                                    storeId: item.seller.id,
                                    storeName: item.seller.name,
                                    delivery: {
                                        option: 'pickup',
                                        freeShippingEligible: true,
                                    },
                                    variant: item.variants || {},
                                });
                            }

                            Alert.alert('Success', 'Items added to cart!');
                            router.push('/(modals)/cart');
                        } catch (error) {
                            console.error('Reorder error:', error);
                            Alert.alert('Error', 'Failed to add items to cart. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            `Need help with order ${order?.orderNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => Linking.openURL('tel:1-800-925-6278')
                },
                {
                    text: 'Live Chat',
                    onPress: () => router.push('/(modals)/support-chat')
                },
                {
                    text: 'Email',
                    onPress: () => {
                        const emailUrl = `mailto:support@walmart.com?subject=Order%20Support%20-%20${order?.orderNumber}`;
                        Linking.openURL(emailUrl);
                    }
                },
            ]
        );
    };

    const shareOrder = async () => {
        if (!order) return;

        setIsSharing(true);
        try {
            const message = `📦 Order Update - ${order.orderNumber}

Status: ${getStatusDisplayText(order.status)}
Items: ${order.items.length}
Total: $${order.summary.total.toFixed(2)}

${order.tracking?.trackingNumber ? `Tracking: ${order.tracking.trackingNumber}` : ''}
${order.expectedDeliveryDate ? `Estimated Delivery: ${format(new Date(order.expectedDeliveryDate), 'EEEE, MMMM do')}` : ''}

Track your order: https://walmart.com/track/${order.orderNumber}`;

            await Share.share({
                message,
                title: 'Walmart Order Update',
            });
        } catch (error) {
            console.error('Error sharing order:', error);
        } finally {
            setIsSharing(false);
        }
    };

    // Utility functions
    const getStatusDisplayText = (status: OrderStatus): string => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'processing': return 'Processing';
            case 'picking': return 'Being Picked';
            case 'packed': return 'Packed';
            case 'shipped': return 'Shipped';
            case 'out_for_delivery': return 'Out for Delivery';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            case 'returned': return 'Returned';
            case 'refunded': return 'Refunded';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    const getStatusBadgeStyle = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
            case 'confirmed': return { backgroundColor: '#DBEAFE', color: '#2563EB' };
            case 'processing':
            case 'picking': return { backgroundColor: '#FEF3C7', color: '#D97706' };
            case 'packed':
            case 'shipped': return { backgroundColor: '#EDE9FE', color: '#7C3AED' };
            case 'out_for_delivery': return { backgroundColor: '#FED7AA', color: '#EA580C' };
            case 'delivered': return { backgroundColor: '#D1FAE5', color: '#059669' };
            case 'cancelled':
            case 'failed': return { backgroundColor: '#FEE2E2', color: '#DC2626' };
            case 'returned':
            case 'refunded': return { backgroundColor: '#F3F4F6', color: '#6B7280' };
            default: return { backgroundColor: '#F3F4F6', color: '#6B7280' };
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
            case 'confirmed': return 'checkmark-circle';
            case 'processing':
            case 'picking': return 'time';
            case 'packed': return 'cube';
            case 'shipped': return 'car';
            case 'out_for_delivery': return 'bicycle';
            case 'delivered': return 'home';
            case 'cancelled': return 'close-circle';
            case 'returned': return 'return-up-back';
            case 'refunded': return 'card';
            case 'failed': return 'alert-circle';
            default: return 'ellipse';
        }
    };

    const getOrderItemImage = (item: APIOrderItem) => {
        try {
            if (typeof item.image === 'string' && item.image.startsWith('http')) {
                return { uri: item.image };
            }

            if (typeof item.image === 'object' && item.image?.uri) {
                return item.image;
            }

            const product = ALL_PRODUCTS.find(p => p.id === item.productId);
            if (product?.image) {
                return { uri: product.image };
            }

            return getImageById(item.productId, 'medium');
        } catch (error) {
            console.warn('Error loading image:', error);
            return getImageById(1, 'medium');
        }
    };

    const getVariantText = (item: APIOrderItem): string => {
        if (!item.variants) return '';

        const variantPairs = Object.entries(item.variants)
            .filter(([key, value]) => value && value.toString().trim())
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        return variantPairs;
    };

    const getPaymentMethodDisplay = (): string => {
        if (!order) return 'Payment Method';

        const { method } = order.payment;

        if (method.type === 'credit_card' || method.type === 'debit_card') {
            const brand = method.cardBrand ? method.cardBrand.charAt(0).toUpperCase() + method.cardBrand.slice(1) : 'Card';
            const lastFour = method.lastFourDigits || '0000';
            return `${brand} •••• ${lastFour}`;
        }

        switch (method.type) {
            case 'paypal': return 'PayPal';
            case 'apple_pay': return 'Apple Pay';
            case 'google_pay': return 'Google Pay';
            case 'walmart_pay': return 'Walmart Pay';
            case 'gift_card': return 'Gift Card';
            default: return 'Payment Method';
        }
    };

    const canCancelOrder = (): boolean => {
        if (!order) return false;
        return ['pending', 'confirmed', 'processing'].includes(order.status);
    };

    const canReturnOrder = (): boolean => {
        if (!order) return false;
        return ['delivered'].includes(order.status);
    };

    const formatAddress = (address: typeof order.shipping.address) => {
        if (!address) return {};
        return {
            name: `${address.firstName} ${address.lastName}`,
            street: `${address.address1}${address.address2 ? `, ${address.address2}` : ''}`,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            phone: address.phone || '',
        };
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004C98" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </SafeAreaView>
        );
    }

    if (error || !order) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#E74C3C" />
                <Text style={styles.errorTitle}>Order Not Found</Text>
                <Text style={styles.errorMessage}>
                    {error || 'The order you\'re looking for doesn\'t exist or has been removed.'}
                </Text>
                <TouchableOpacity
                    style={styles.errorButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.errorButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const formattedShippingAddress = formatAddress(order.shipping.address);
    const formattedBillingAddress = formatAddress(order.billing.address);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Order Details</Text>
                        <Text style={styles.headerSubtitle}>
                            {order.orderNumber}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={shareOrder}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color="#374151" />
                        ) : (
                            <Ionicons name="share-outline" size={24} color="#374151" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Order Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.sectionTitle}>Order Status</Text>
                        <View style={[styles.statusBadge, getStatusBadgeStyle(order.status)]}>
                            <View style={styles.statusBadgeContent}>
                                <Ionicons
                                    name={getStatusIcon(order.status) as any}
                                    size={16}
                                    color={getStatusBadgeStyle(order.status).color}
                                />
                                <Text style={[styles.statusBadgeText, { color: getStatusBadgeStyle(order.status).color }]}>
                                    {getStatusDisplayText(order.status)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.deliveryInfo}>
                        {order.expectedDeliveryDate && (
                            <View style={styles.deliveryRow}>
                                <Text style={styles.deliveryLabel}>
                                    {order.actualDeliveryDate ? 'Delivered' : 'Estimated Delivery'}
                                </Text>
                                <Text style={styles.deliveryDate}>
                                    {order.actualDeliveryDate
                                        ? format(new Date(order.actualDeliveryDate), 'EEEE, MMMM do')
                                        : format(new Date(order.expectedDeliveryDate), 'EEEE, MMMM do')
                                    }
                                </Text>
                            </View>
                        )}
                        {order.tracking?.trackingNumber && (
                            <View style={styles.deliveryRow}>
                                <Text style={styles.deliveryLabel}>Tracking Number</Text>
                                <TouchableOpacity onPress={handleTrackPackage}>
                                    <Text style={styles.trackingNumber}>
                                        {order.tracking.trackingNumber}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {order.tracking?.trackingNumber && (
                            <TouchableOpacity
                                style={[styles.quickActionButton, styles.trackAction]}
                                onPress={handleTrackPackage}
                            >
                                <Ionicons name="location" size={24} color="#004C98" />
                                <Text style={[styles.quickActionText, styles.trackActionText]}>
                                    Track Package
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.quickActionButton, styles.reorderAction]}
                            onPress={handleReorder}
                        >
                            <Ionicons name="refresh" size={24} color="#10B981" />
                            <Text style={[styles.quickActionText, styles.reorderActionText]}>
                                Reorder
                            </Text>
                        </TouchableOpacity>

                        {canReturnOrder() && (
                            <TouchableOpacity
                                style={[styles.quickActionButton, styles.returnAction]}
                                onPress={handleReturnItems}
                            >
                                <Ionicons name="return-up-back" size={24} color="#F59E0B" />
                                <Text style={[styles.quickActionText, styles.returnActionText]}>
                                    Return Items
                                </Text>
                            </TouchableOpacity>
                        )}

                        {canCancelOrder() && (
                            <TouchableOpacity
                                style={[styles.quickActionButton, styles.cancelAction]}
                                onPress={handleCancelOrder}
                            >
                                <Ionicons name="close-circle" size={24} color="#EF4444" />
                                <Text style={[styles.quickActionText, styles.cancelActionText]}>
                                    Cancel Order
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.quickActionButton, styles.helpAction]}
                            onPress={handleContactSupport}
                        >
                            <Ionicons name="headset" size={24} color="#6B7280" />
                            <Text style={[styles.quickActionText, styles.helpActionText]}>
                                Get Help
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Timeline */}
                {order.timeline && order.timeline.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Order Timeline</Text>
                        {order.timeline.map((event, index) => (
                            <View key={event.id} style={styles.timelineEvent}>
                                <View style={styles.timelineIndicator}>
                                    <View style={[
                                        styles.timelineDot,
                                        index === 0 ? styles.timelineDotCompleted : styles.timelineDotPending
                                    ]} />
                                    {index < order.timeline.length - 1 && (
                                        <View style={[
                                            styles.timelineLine,
                                            index === 0 ? styles.timelineLineCompleted : styles.timelineLinePending
                                        ]} />
                                    )}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={[
                                        styles.timelineStatus,
                                        index === 0 ? styles.timelineStatusCompleted : styles.timelineStatusPending
                                    ]}>
                                        {event.title}
                                    </Text>
                                    <Text style={[
                                        styles.timelineDescription,
                                        index === 0 ? styles.timelineDescriptionCompleted : styles.timelineDescriptionPending
                                    ]}>
                                        {event.description}
                                    </Text>
                                    <Text style={[
                                        styles.timelineLocation,
                                        index === 0 ? styles.timelineLocationCompleted : styles.timelineLocationPending
                                    ]}>
                                        {event.location && `${event.location} • `}
                                        {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Order Items */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Order Items ({order.items.length})
                    </Text>
                    {order.items.map((item, index) => (
                        <View key={item.id} style={[styles.orderItem, index < order.items.length - 1 && styles.orderItemBorder]}>
                            <Image
                                source={getOrderItemImage(item)}
                                style={styles.itemImage}
                                resizeMode="cover"
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                {item.brand && (
                                    <Text style={styles.itemDetail}>by {item.brand}</Text>
                                )}
                                {getVariantText(item) && (
                                    <Text style={styles.itemDetail}>{getVariantText(item)}</Text>
                                )}
                                {item.sku && (
                                    <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                                )}
                                <Text style={styles.itemSeller}>
                                    Sold by {item.seller.name} • Qty: {item.quantity}
                                </Text>
                            </View>
                            <View style={styles.itemPricing}>
                                <Text style={styles.itemPrice}>
                                    ${item.totalAmount.toFixed(2)}
                                </Text>
                                {item.originalPrice && item.originalPrice > item.price && (
                                    <Text style={styles.itemOriginalPrice}>
                                        ${(item.originalPrice * item.quantity).toFixed(2)}
                                    </Text>
                                )}
                                {item.discountAmount > 0 && (
                                    <Text style={styles.itemDiscount}>
                                        Save ${item.discountAmount.toFixed(2)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Delivery Address */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressName}>
                            {formattedShippingAddress.name}
                        </Text>
                        {formattedShippingAddress.phone && (
                            <Text style={styles.addressPhone}>
                                {formattedShippingAddress.phone}
                            </Text>
                        )}
                        <Text style={styles.addressText}>
                            {formattedShippingAddress.street}
                        </Text>
                        <Text style={styles.addressText}>
                            {formattedShippingAddress.city}, {formattedShippingAddress.state} {formattedShippingAddress.zipCode}
                        </Text>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                Subtotal ({order.summary.itemCount} {order.summary.itemCount === 1 ? 'item' : 'items'})
                            </Text>
                            <Text style={styles.summaryValue}>${order.summary.subtotal.toFixed(2)}</Text>
                        </View>

                        {order.summary.savings > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryDiscount}>Savings</Text>
                                <Text style={styles.summaryDiscount}>-${order.summary.savings.toFixed(2)}</Text>
                            </View>
                        )}

                        {order.summary.discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryDiscount}>Discount</Text>
                                <Text style={styles.summaryDiscount}>-${order.summary.discount.toFixed(2)}</Text>
                            </View>
                        )}

                        {order.summary.couponDiscount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryDiscount}>Promo Discount</Text>
                                <Text style={styles.summaryDiscount}>-${order.summary.couponDiscount.toFixed(2)}</Text>
                            </View>
                        )}

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>
                                {order.summary.shipping === 0 ? 'Free' : `$${order.summary.shipping.toFixed(2)}`}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>${order.summary.tax.toFixed(2)}</Text>
                        </View>

                        {order.summary.fees && order.summary.fees.length > 0 && order.summary.fees.map(fee => (
                            <View key={fee.type} style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>{fee.name}</Text>
                                <Text style={styles.summaryValue}>${fee.amount.toFixed(2)}</Text>
                            </View>
                        ))}

                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotal}>Total</Text>
                            <Text style={styles.summaryTotalValue}>
                                ${order.summary.total.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment & Billing */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment & Billing</Text>
                    <View style={styles.paymentContainer}>
                        <Text style={styles.paymentLabel}>Payment Method</Text>
                        <View style={styles.paymentMethodRow}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="card" size={12} color="white" />
                            </View>
                            <Text style={styles.paymentMethodText}>
                                {getPaymentMethodDisplay()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.billingContainer}>
                        <Text style={styles.paymentLabel}>Billing Address</Text>
                        <Text style={styles.billingName}>
                            {formattedBillingAddress.name}
                        </Text>
                        <Text style={styles.billingText}>
                            {formattedBillingAddress.street}
                        </Text>
                        <Text style={styles.billingText}>
                            {formattedBillingAddress.city}, {formattedBillingAddress.state} {formattedBillingAddress.zipCode}
                        </Text>
                    </View>
                </View>

                {/* Order Information */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Information</Text>
                    <View style={styles.orderInfoContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Order Date</Text>
                            <Text style={styles.summaryValue}>
                                {format(new Date(order.placedAt), 'MMMM d, yyyy')}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Order Time</Text>
                            <Text style={styles.summaryValue}>
                                {format(new Date(order.placedAt), 'h:mm a')}
                            </Text>
                        </View>
                        {order.shipping.method.carrier && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Carrier</Text>
                                <Text style={styles.summaryValue}>
                                    {order.shipping.method.carrier}
                                </Text>
                            </View>
                        )}
                        {canReturnOrder() && order.returnDeadline && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Return By</Text>
                                <Text style={styles.summaryValue}>
                                    {format(new Date(order.returnDeadline), 'MMMM d, yyyy')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <View style={styles.helpHeader}>
                        <Ionicons name="information-circle" size={20} color="#004C98" />
                        <Text style={styles.helpTitle}>Need Help?</Text>
                    </View>
                    <Text style={styles.helpText}>
                        Have questions about your order? Our support team is available 24/7 to assist you.
                    </Text>
                    <TouchableOpacity
                        style={styles.helpButton}
                        onPress={handleContactSupport}
                    >
                        <Text style={styles.helpButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    // Main Container Styles
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    errorMessage: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        fontSize: 16,
    },
    errorButton: {
        backgroundColor: '#004C98',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    errorButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },

    // Enhanced Header Styles
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        marginRight: 16,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    headerSubtitle: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    shareButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Enhanced Card Styles
    card: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderRadius: 16,
        marginHorizontal: 16,
    },
    statusCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 18,
    },

    // Enhanced Status Section
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusBadgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusBadgeText: {
        fontWeight: '700',
        fontSize: 14,
        textTransform: 'capitalize',
        letterSpacing: 0.5,
    },
    deliveryInfo: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    deliveryLabel: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '500',
    },
    deliveryDate: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 15,
    },
    trackingNumber: {
        color: '#004C98',
        fontWeight: '700',
        fontSize: 15,
        textDecorationLine: 'underline',
    },

    // Enhanced Quick Actions
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickActionButton: {
        width: '47%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    trackAction: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    reorderAction: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    returnAction: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    cancelAction: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    helpAction: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    quickActionText: {
        fontWeight: '700',
        fontSize: 13,
        marginTop: 10,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    trackActionText: {
        color: '#004C98',
    },
    reorderActionText: {
        color: '#10B981',
    },
    returnActionText: {
        color: '#F59E0B',
    },
    cancelActionText: {
        color: '#EF4444',
    },
    helpActionText: {
        color: '#6B7280',
    },

    // Enhanced Timeline Styles
    timelineEvent: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineIndicator: {
        alignItems: 'center',
        marginRight: 20,
    },
    timelineDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    timelineDotCompleted: {
        backgroundColor: '#004C98',
    },
    timelineDotPending: {
        backgroundColor: '#D1D5DB',
    },
    timelineLine: {
        width: 3,
        height: 36,
        marginTop: 8,
    },
    timelineLineCompleted: {
        backgroundColor: '#004C98',
    },
    timelineLinePending: {
        backgroundColor: '#D1D5DB',
    },
    timelineContent: {
        flex: 1,
    },
    timelineStatus: {
        fontWeight: '700',
        fontSize: 17,
        marginBottom: 6,
    },
    timelineStatusCompleted: {
        color: '#111827',
    },
    timelineStatusPending: {
        color: '#9CA3AF',
    },
    timelineDescription: {
        fontSize: 15,
        marginBottom: 6,
        lineHeight: 22,
    },
    timelineDescriptionCompleted: {
        color: '#6B7280',
    },
    timelineDescriptionPending: {
        color: '#9CA3AF',
    },
    timelineLocation: {
        fontSize: 13,
        fontWeight: '500',
    },
    timelineLocationCompleted: {
        color: '#9CA3AF',
    },
    timelineLocationPending: {
        color: '#D1D5DB',
    },

    // Enhanced Order Items
    orderItem: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingBottom: 20,
    },
    orderItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 17,
        marginBottom: 6,
        lineHeight: 24,
    },
    itemDetail: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 3,
        fontWeight: '500',
    },
    itemSku: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 6,
        fontWeight: '500',
    },
    itemSeller: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    itemPricing: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    itemPrice: {
        color: '#004C98',
        fontWeight: '700',
        fontSize: 20,
    },
    itemOriginalPrice: {
        color: '#9CA3AF',
        fontSize: 15,
        textDecorationLine: 'line-through',
        marginTop: 4,
        fontWeight: '500',
    },
    itemDiscount: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },

    // Enhanced Address Styles
    addressContainer: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    addressName: {
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
        fontSize: 17,
    },
    addressPhone: {
        color: '#6B7280',
        fontSize: 15,
        marginBottom: 6,
        fontWeight: '500',
    },
    addressText: {
        color: '#6B7280',
        fontSize: 15,
        marginBottom: 3,
        fontWeight: '500',
    },

    // Enhanced Summary Styles
    summaryContainer: {
        backgroundColor: '#FFFFFF',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    summaryValue: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
    },
    summaryDiscount: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: '700',
    },
    summaryDivider: {
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
        marginTop: 12,
        marginBottom: 16,
    },
    summaryTotal: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    summaryTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#004C98',
    },

    // Enhanced Payment Styles
    paymentContainer: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    paymentLabel: {
        color: '#6B7280',
        fontSize: 15,
        marginBottom: 10,
        fontWeight: '600',
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: {
        width: 36,
        height: 24,
        backgroundColor: '#004C98',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    paymentMethodText: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 17,
    },
    billingContainer: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    billingName: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 17,
        marginBottom: 6,
    },
    billingText: {
        color: '#6B7280',
        fontSize: 15,
        marginBottom: 3,
        fontWeight: '500',
    },

    // Order Info
    orderInfoContainer: {
        backgroundColor: '#FFFFFF',
    },

    // Enhanced Help Section
    helpSection: {
        backgroundColor: '#EFF6FF',
        padding: 24,
        margin: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        marginBottom: 32,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    helpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    helpTitle: {
        color: '#1E40AF',
        fontWeight: '700',
        marginLeft: 10,
        fontSize: 18,
    },
    helpText: {
        color: '#1E3A8A',
        fontSize: 15,
        marginBottom: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    helpButton: {
        backgroundColor: '#004C98',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignSelf: 'flex-start',
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    helpButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
});