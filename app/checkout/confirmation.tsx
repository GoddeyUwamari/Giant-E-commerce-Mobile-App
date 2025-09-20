import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Share,
    Linking,
    Animated,
    StyleSheet,
    Dimensions,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import { format, addDays } from 'date-fns';

// Import real data systems
import { useCartStore } from '../../store/slices/cartSlice';
import { orderStorage } from '../../services/storage/asyncStorage';
import OrderCreationService from '../../services/orderCreation/OrderCreationService';
import { ALL_PRODUCTS } from '../../constants/products/data';
import type { Order, OrderItem as APIOrderItem, OrderStatus } from '../../services/api/orders';

const { width } = Dimensions.get('window');

// Helper functions for product data
const getProductById = (id: string) => {
    return ALL_PRODUCTS.find(product => product.id === id);
};

const getImageById = (id: string | number, size?: string) => {
    const product = ALL_PRODUCTS.find(p => p.id === id.toString());
    if (product && product.image) {
        return { uri: product.image };
    }
    return { uri: 'https://via.placeholder.com/300x300/f0f0f0/666?text=No+Image' };
};

export default function ConfirmationPage(): JSX.Element {
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showTrackingInfo, setShowTrackingInfo] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const modalAnim = useRef(new Animated.Value(0)).current;

    // Cart store for clearing after successful order
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        loadOrderDetails();

        // Start entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Start pulse animation for success icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (order) {
            scheduleDeliveryNotifications();
            clearCartData();
        }
    }, [order]);

    useEffect(() => {
        if (showTrackingInfo) {
            Animated.spring(modalAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(modalAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [showTrackingInfo]);

    const loadOrderDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let loadedOrder: Order | null = null;

            // Priority 1: Use orderId from route params
            if (orderId) {
                console.log('Loading order by ID:', orderId);
                loadedOrder = await OrderCreationService.getOrderById(orderId);
            }

            // Priority 2: Get current order from storage (just completed)
            if (!loadedOrder) {
                console.log('Loading current order from storage...');
                loadedOrder = await orderStorage.getCurrentOrder();
            }

            // Priority 3: Get latest order ID from storage
            if (!loadedOrder) {
                console.log('Loading latest order by ID...');
                const latestOrderId = await orderStorage.getLatestOrderId();
                if (latestOrderId) {
                    loadedOrder = await OrderCreationService.getOrderById(latestOrderId);
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
            setError('Failed to load order details. Please contact support if this issue persists.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearCartData = async () => {
        try {
            console.log('🧹 Clearing cart data after successful order...');
            await clearCart();
            console.log('✅ Cart data cleared successfully');
        } catch (error) {
            console.error('⚠️ Error clearing cart data:', error);
            // Non-critical error, don't block the confirmation page
        }
    };

    const scheduleDeliveryNotifications = async () => {
        if (!order?.expectedDeliveryDate) return;

        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted');
                return;
            }

            const deliveryDate = new Date(order.expectedDeliveryDate);

            // Schedule delivery day notification
            const notificationDate = new Date(deliveryDate);
            notificationDate.setHours(9, 0, 0, 0);

            if (notificationDate > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Order Delivery Today! 📦',
                        body: `Your order ${order.orderNumber} is scheduled for delivery today.`,
                        data: {
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                            type: 'delivery_day'
                        },
                    },
                    trigger: notificationDate,
                });
            }

            // Schedule reminder notification day before
            const reminderDate = new Date(deliveryDate);
            reminderDate.setDate(reminderDate.getDate() - 1);
            reminderDate.setHours(18, 0, 0, 0);

            if (reminderDate > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Order Arriving Tomorrow! 🚚',
                        body: `Your order ${order.orderNumber} will be delivered tomorrow.`,
                        data: {
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                            type: 'delivery_reminder'
                        },
                    },
                    trigger: reminderDate,
                });
            }

            console.log('✅ Delivery notifications scheduled successfully');
        } catch (error) {
            console.error('⚠️ Error scheduling notifications:', error);
        }
    };

    const addDeliveryToCalendar = async () => {
        if (!order?.expectedDeliveryDate) return;

        setIsAddingToCalendar(true);
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Calendar access is needed to add delivery date');
                return;
            }

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.source.name === 'Default') || calendars[0];

            if (!defaultCalendar) {
                Alert.alert('Error', 'No calendar found');
                return;
            }

            const deliveryDate = new Date(order.expectedDeliveryDate);
            const startDate = new Date(deliveryDate);
            startDate.setHours(9, 0, 0, 0);
            const endDate = new Date(deliveryDate);
            endDate.setHours(18, 0, 0, 0);

            const itemsList = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');

            const eventDetails = `
Order Details:
- Order #: ${order.orderNumber}
- Total: $${order.summary.total.toFixed(2)}
- Items: ${itemsList}
- Payment: ${getPaymentMethodDisplay(order)}

Delivery Address:
${order.shipping.address.firstName} ${order.shipping.address.lastName}
${order.shipping.address.address1}${order.shipping.address.address2 ? `, ${order.shipping.address.address2}` : ''}
${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.zipCode}

${order.tracking?.trackingNumber ? `Tracking: ${order.tracking.trackingNumber}` : ''}

Track your order: https://walmart.com/track/${order.orderNumber}
            `.trim();

            await Calendar.createEventAsync(defaultCalendar.id, {
                title: `Walmart Delivery - ${order.orderNumber}`,
                startDate,
                endDate,
                notes: eventDetails,
                location: `${order.shipping.address.address1}, ${order.shipping.address.city}, ${order.shipping.address.state}`,
                alarms: [
                    { relativeOffset: -60 }, // 1 hour before
                    { relativeOffset: -1440 }, // 1 day before
                ],
            });

            Alert.alert('Success', 'Delivery date added to your calendar!');
        } catch (error) {
            console.error('Error adding to calendar:', error);
            Alert.alert('Error', 'Failed to add to calendar. Please try again.');
        } finally {
            setIsAddingToCalendar(false);
        }
    };

    const shareOrder = async () => {
        if (!order) return;

        setIsSharing(true);
        try {
            const itemsList = order.items.map(item =>
                `• ${item.name}${getVariantText(item) ? ` (${getVariantText(item)})` : ''} × ${item.quantity}`
            ).join('\n');

            const deliveryAddress = order.shipping.address;
            const addressText = `${deliveryAddress.firstName} ${deliveryAddress.lastName}
${deliveryAddress.address1}${deliveryAddress.address2 ? `, ${deliveryAddress.address2}` : ''}
${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}`;

            const message = `🛒 Walmart Order Confirmation

Order #: ${order.orderNumber}
Order Date: ${format(new Date(order.placedAt), 'MMM dd, yyyy')}
Total: $${order.summary.total.toFixed(2)}

Items Ordered:
${itemsList}

Estimated Delivery: ${order.expectedDeliveryDate ? format(new Date(order.expectedDeliveryDate), 'EEEE, MMMM do, yyyy') : 'TBD'}
Delivery Time: 9:00 AM - 6:00 PM

Delivery Address:
${addressText}

Payment Method: ${getPaymentMethodDisplay(order)}
${order.tracking?.trackingNumber ? `Tracking: ${order.tracking.trackingNumber}` : ''}

Track your order: https://walmart.com/orders/track?orderNumber=${order.orderNumber}

Thank you for shopping with Walmart! 🙏`;

            await Share.share({
                message,
                title: `Walmart Order ${order.orderNumber}`,
                url: `https://walmart.com/orders/${order.orderNumber}`,
            });
        } catch (error) {
            console.error('Error sharing order:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleTrackOrder = async () => {
        if (!order) return;

        try {
            if (order.tracking?.trackingNumber && order.status !== 'confirmed') {
                const trackingUrl = `https://www.walmart.com/orders/track?orderNumber=${order.orderNumber}&trackingNumber=${order.tracking.trackingNumber}`;
                const canOpen = await Linking.canOpenURL(trackingUrl);

                if (canOpen) {
                    await Linking.openURL(trackingUrl);
                } else {
                    await Linking.openURL(`https://www.walmart.com/orders/track?orderNumber=${order.orderNumber}`);
                }
            } else {
                setShowTrackingInfo(true);
            }
        } catch (error) {
            console.error('Error opening tracking URL:', error);
            setShowTrackingInfo(true);
        }
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to contact us about your order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call Support',
                    onPress: () => Linking.openURL('tel:1-800-925-6278')
                },
                {
                    text: 'Live Chat',
                    onPress: () => {
                        router.push('/(modals)/support-chat');
                    }
                },
                {
                    text: 'Email Support',
                    onPress: () => {
                        const subject = `Order Support - ${order?.orderNumber}`;
                        const body = `Order Number: ${order?.orderNumber}\nOrder Date: ${order ? format(new Date(order.placedAt), 'MMM dd, yyyy') : ''}\nTotal: $${order?.summary.total.toFixed(2)}\n\nHow can we help you?\n\n`;
                        Linking.openURL(`mailto:support@walmart.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                    }
                },
                {
                    text: 'Help Center',
                    onPress: () => Linking.openURL('https://help.walmart.com')
                },
            ]
        );
    };

    // Utility functions
    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
            case 'confirmed': return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
            case 'processing':
            case 'picking': return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
            case 'packed':
            case 'shipped': return { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' };
            case 'out_for_delivery':
            case 'delivered': return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
            case 'cancelled':
            case 'failed': return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
            default: return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
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
            case 'failed': return 'alert-circle';
            default: return 'ellipse';
        }
    };

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

    const getImageSource = (item: APIOrderItem) => {
        try {
            if (typeof item.image === 'string' && item.image.startsWith('http')) {
                return { uri: item.image };
            }

            if (typeof item.image === 'object' && item.image?.uri) {
                return item.image;
            }

            // Try to get image from product data
            const product = getProductById(item.productId);
            if (product?.image) {
                return { uri: product.image };
            }

            return { uri: 'https://via.placeholder.com/300x300/f0f0f0/666?text=No+Image' };
        } catch (error) {
            console.warn('Error loading image:', error);
            return { uri: 'https://via.placeholder.com/300x300/f0f0f0/666?text=No+Image' };
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

    const getPaymentMethodDisplay = (order: Order): string => {
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

    const formatAddress = (address: typeof order.shipping.address) => {
        return {
            name: `${address.firstName} ${address.lastName}`,
            street: `${address.address1}${address.address2 ? `, ${address.address2}` : ''}`,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
        };
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0071CE" />
                <Text style={styles.loadingText}>Loading order confirmation...</Text>
            </SafeAreaView>
        );
    }

    // Error state
    if (error || !order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color="#DC2626" />
                    <Text style={styles.errorText}>{error || 'Unable to load order details'}</Text>
                    <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
                        There was a problem loading your order confirmation. Please try again.
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => loadOrderDetails()}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: '#6B7280', marginTop: 12 }]}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Text style={styles.retryButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const formattedAddress = formatAddress(order.shipping.address);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => router.push('/(tabs)')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Confirmed</Text>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={shareOrder}
                        disabled={isSharing}
                        activeOpacity={0.7}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color="#374151" />
                        ) : (
                            <Ionicons name="share-outline" size={24} color="#374151" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Success Banner */}
                    <View style={styles.successBanner}>
                        <Animated.View
                            style={[
                                styles.successIcon,
                                {
                                    transform: [{ scale: pulseAnim }]
                                }
                            ]}
                        >
                            <Ionicons name="checkmark" size={40} color="white" />
                        </Animated.View>
                        <Text style={styles.successTitle}>Order Confirmed!</Text>
                        <Text style={styles.successSubtitle}>
                            Thank you for your purchase. We'll send you shipping updates via email and SMS.
                        </Text>
                        <View style={styles.orderNumberCard}>
                            <Text style={styles.orderNumberLabel}>Order Number</Text>
                            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>
                                Order placed on {format(new Date(order.placedAt), 'MMM dd, yyyy')}
                            </Text>
                        </View>
                    </View>

                    {/* Order Status */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Order Status</Text>
                            <View style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: getStatusColor(order.status).bg,
                                    borderWidth: 1,
                                    borderColor: getStatusColor(order.status).border,
                                }
                            ]}>
                                <View style={styles.statusContent}>
                                    <Ionicons
                                        name={getStatusIcon(order.status) as any}
                                        size={16}
                                        color={getStatusColor(order.status).text}
                                    />
                                    <Text style={[
                                        styles.statusText,
                                        { color: getStatusColor(order.status).text }
                                    ]}>
                                        {getStatusDisplayText(order.status)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.deliveryInfo}>
                            {order.expectedDeliveryDate && (
                                <View style={styles.deliveryRow}>
                                    <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
                                    <Text style={styles.deliveryValue}>
                                        {format(new Date(order.expectedDeliveryDate), 'EEEE, MMMM do')}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.deliveryRow}>
                                <Text style={styles.deliveryLabel}>Delivery Time</Text>
                                <Text style={styles.deliveryTime}>9:00 AM - 6:00 PM</Text>
                            </View>
                            {order.tracking?.trackingNumber && (
                                <View style={styles.deliveryRow}>
                                    <Text style={styles.deliveryLabel}>Tracking Number</Text>
                                    <TouchableOpacity onPress={handleTrackOrder} activeOpacity={0.7}>
                                        <Text style={[styles.deliveryValue, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                                            {order.tracking.trackingNumber}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {order.summary.shipping === 0 && (
                                <View style={styles.deliveryRow}>
                                    <Text style={styles.deliveryLabel}>Shipping</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
                                        <Text style={[styles.deliveryValue, { color: '#10B981' }]}>FREE</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.quickActions}>
                            <TouchableOpacity
                                style={[styles.actionCard, styles.trackAction]}
                                onPress={handleTrackOrder}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="location" size={24} color="#2563EB" />
                                <Text style={styles.trackActionText}>Track Order</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, styles.calendarAction]}
                                onPress={addDeliveryToCalendar}
                                disabled={isAddingToCalendar}
                                activeOpacity={0.8}
                            >
                                {isAddingToCalendar ? (
                                    <ActivityIndicator size="small" color="#059669" />
                                ) : (
                                    <Ionicons name="calendar" size={24} color="#059669" />
                                )}
                                <Text style={styles.calendarActionText}>Add to Calendar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, styles.supportAction]}
                                onPress={handleContactSupport}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="headset" size={24} color="#EA580C" />
                                <Text style={styles.supportActionText}>Support</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Order Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Order Items ({order.items.length})
                        </Text>
                        {order.items.map((item, index) => (
                            <View key={item.id} style={[
                                styles.orderItem,
                                index === order.items.length - 1 && styles.lastOrderItem
                            ]}>
                                <Image
                                    source={getImageSource(item)}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    {item.brand && (
                                        <Text style={styles.itemBrand}>by {item.brand}</Text>
                                    )}
                                    {getVariantText(item) && (
                                        <Text style={styles.itemAttribute}>
                                            {getVariantText(item)}
                                        </Text>
                                    )}
                                    {item.sku && (
                                        <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                                    )}
                                    <Text style={styles.itemSeller}>
                                        Sold by {item.seller.name}
                                    </Text>
                                    <Text style={styles.itemQuantity}>
                                        Qty: {item.quantity}
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
                                        <Text style={styles.itemSavings}>
                                            Save ${item.discountAmount.toFixed(2)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <View style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <Ionicons name="location" size={20} color="#2563EB" />
                                <Text style={styles.addressName}>
                                    {formattedAddress.name}
                                </Text>
                            </View>
                            <Text style={styles.addressStreet}>
                                {formattedAddress.street}
                            </Text>
                            <Text style={styles.addressCity}>
                                {formattedAddress.city}, {formattedAddress.state} {formattedAddress.zipCode}
                            </Text>
                        </View>
                    </View>

                    {/* Order Summary */}
                    <View style={styles.section}>
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
                                    <Text style={styles.summaryValueGreen}>Item Savings</Text>
                                    <Text style={styles.summaryValueGreen}>-${order.summary.savings.toFixed(2)}</Text>
                                </View>
                            )}

                            {order.summary.discount > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryValueGreen}>Discount</Text>
                                    <Text style={styles.summaryValueGreen}>-${order.summary.discount.toFixed(2)}</Text>
                                </View>
                            )}

                            {order.summary.couponDiscount > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryValueGreen}>Promo Discount</Text>
                                    <Text style={styles.summaryValueGreen}>-${order.summary.couponDiscount.toFixed(2)}</Text>
                                </View>
                            )}

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>
                                    {order.summary.shipping > 0 ? 'Shipping & Delivery' : 'Delivery'}
                                </Text>
                                <Text style={[
                                    styles.summaryValue,
                                    order.summary.shipping === 0 && { color: '#10B981', fontWeight: '700' }
                                ]}>
                                    {order.summary.shipping === 0
                                        ? 'Free'
                                        : `${order.summary.shipping.toFixed(2)}`
                                    }
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

                            {(order.summary.savings > 0 || order.summary.discount > 0 || order.summary.couponDiscount > 0) && (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    backgroundColor: '#ECFDF5',
                                    borderRadius: 8,
                                    marginVertical: 8,
                                    borderWidth: 1,
                                    borderColor: '#A7F3D0',
                                }}>
                                    <Text style={{ color: '#059669', fontSize: 16, fontWeight: '600' }}>
                                        Total Savings
                                    </Text>
                                    <Text style={{ color: '#059669', fontSize: 18, fontWeight: '700' }}>
                                        -${(order.summary.savings + order.summary.discount + order.summary.couponDiscount).toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.totalRow}>
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>
                                        ${order.summary.total.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        <View style={styles.paymentCard}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="card" size={16} color="white" />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={styles.paymentText}>
                                    {getPaymentMethodDisplay(order)}
                                </Text>
                                <Text style={styles.paymentStatus}>
                                    Payment {order.payment.status === 'captured' ? 'Successful' : order.payment.status}
                                </Text>
                            </View>
                            <Ionicons
                                name={order.payment.status === 'captured' ? "checkmark-circle" : "time"}
                                size={24}
                                color={order.payment.status === 'captured' ? "#10B981" : "#F59E0B"}
                            />
                        </View>
                    </View>

                    {/* Order Timeline */}
                    {order.timeline && order.timeline.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Timeline</Text>
                            <View style={styles.timelineContainer}>
                                {order.timeline.map((event, index) => (
                                    <View key={event.id} style={styles.timelineEvent}>
                                        <View style={styles.timelineIconContainer}>
                                            <View style={[
                                                styles.timelineIcon,
                                                index === 0 ? styles.timelineIconActive : styles.timelineIconInactive
                                            ]}>
                                                <Ionicons
                                                    name={getStatusIcon(event.status)}
                                                    size={12}
                                                    color={index === 0 ? "#FFFFFF" : "#9CA3AF"}
                                                />
                                            </View>
                                            {index < order.timeline.length - 1 && (
                                                <View style={styles.timelineLine} />
                                            )}
                                        </View>
                                        <View style={styles.timelineContent}>
                                            <Text style={styles.timelineTitle}>{event.title}</Text>
                                            <Text style={styles.timelineDescription}>{event.description}</Text>
                                            <Text style={styles.timelineTimestamp}>
                                                {format(new Date(event.timestamp), 'MMM dd, yyyy h:mm a')}
                                            </Text>
                                            {event.location && (
                                                <Text style={styles.timelineLocation}>📍 {event.location}</Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Help & Support */}
                    <View style={styles.helpSection}>
                        <View style={styles.helpHeader}>
                            <Ionicons name="information-circle" size={20} color="#2563EB" />
                            <Text style={styles.helpTitle}>Need Help?</Text>
                        </View>
                        <Text style={styles.helpDescription}>
                            Questions about your order? Our support team is here to help 24/7.
                        </Text>
                        <TouchableOpacity
                            style={styles.helpButton}
                            onPress={handleContactSupport}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.helpButtonText}>Contact Support</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Order Details for Reference */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Details</Text>
                        <View style={styles.orderDetailsCard}>
                            <View style={styles.orderDetailRow}>
                                <Text style={styles.orderDetailLabel}>Order Date</Text>
                                <Text style={styles.orderDetailValue}>
                                    {format(new Date(order.placedAt), 'MMM dd, yyyy')}
                                </Text>
                            </View>
                            <View style={styles.orderDetailRow}>
                                <Text style={styles.orderDetailLabel}>Order Number</Text>
                                <Text style={styles.orderDetailValue}>{order.orderNumber}</Text>
                            </View>
                            {order.tracking?.trackingNumber && (
                                <View style={styles.orderDetailRow}>
                                    <Text style={styles.orderDetailLabel}>Tracking Number</Text>
                                    <TouchableOpacity onPress={handleTrackOrder} activeOpacity={0.7}>
                                        <Text style={styles.trackingNumberLink}>
                                            {order.tracking.trackingNumber}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={styles.orderDetailRow}>
                                <Text style={styles.orderDetailLabel}>Total Items</Text>
                                <Text style={styles.orderDetailValue}>
                                    {order.summary.itemCount} item{order.summary.itemCount !== 1 ? 's' : ''}
                                </Text>
                            </View>
                            <View style={styles.orderDetailRow}>
                                <Text style={styles.orderDetailLabel}>Payment Status</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons
                                        name={order.payment.status === 'captured' ? "checkmark-circle" : "time"}
                                        size={16}
                                        color={order.payment.status === 'captured' ? "#10B981" : "#F59E0B"}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text style={[
                                        styles.orderDetailValue,
                                        { color: order.payment.status === 'captured' ? '#10B981' : '#F59E0B' }
                                    ]}>
                                        {order.payment.status === 'captured' ? 'Paid' : order.payment.status}
                                    </Text>
                                </View>
                            </View>
                            {order.customer.walmartPlusMember && (
                                <View style={styles.orderDetailRow}>
                                    <Text style={styles.orderDetailLabel}>Walmart+</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="star" size={16} color="#FFC220" style={{ marginRight: 4 }} />
                                        <Text style={[styles.orderDetailValue, { color: '#FFC220' }]}>Member</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.continueShoppingButton}
                        onPress={() => router.push('/(tabs)')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="storefront" size={20} color="#374151" style={{ marginRight: 8 }} />
                        <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.viewOrdersButton}
                        onPress={() => router.push('/orders')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="receipt" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.viewOrdersText}>View All Orders</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tracking Info Modal */}
            <Modal
                visible={showTrackingInfo}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowTrackingInfo(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.trackingModal,
                            {
                                opacity: modalAnim,
                                transform: [{ scale: modalAnim }]
                            }
                        ]}
                    >
                        <View style={styles.trackingHeader}>
                            <Ionicons name="information-circle" size={48} color="#2563EB" />
                            <Text style={styles.trackingTitle}>Tracking Information</Text>
                        </View>
                        <Text style={styles.trackingDescription}>
                            Your order is being prepared for shipment. You'll receive tracking information
                            via email and SMS once your order ships (usually within 24-48 hours).
                        </Text>
                        <View style={styles.trackingTimeline}>
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineIconActive}>
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                </View>
                                <Text style={styles.timelineTextActive}>Order Confirmed</Text>
                            </View>
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineIconInactive}>
                                    <Ionicons name="cube" size={16} color="#9CA3AF" />
                                </View>
                                <Text style={styles.timelineTextInactive}>Preparing for Shipment</Text>
                            </View>
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineIconInactive}>
                                    <Ionicons name="car" size={16} color="#9CA3AF" />
                                </View>
                                <Text style={styles.timelineTextInactive}>Out for Delivery</Text>
                            </View>
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineIconInactive}>
                                    <Ionicons name="home" size={16} color="#9CA3AF" />
                                </View>
                                <Text style={styles.timelineTextInactive}>Delivered</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.trackingButton}
                            onPress={() => setShowTrackingInfo(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.trackingButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
    // Main Container Styles
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
    },

    // Loading & Error States - Enhanced Walmart Theme
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#DC2626',
        textAlign: 'center',
        marginBottom: 16,
        marginTop: 16,
        letterSpacing: 0.3,
    },
    retryButton: {
        backgroundColor: '#0071CE',
        borderRadius: 14,
        paddingHorizontal: 28,
        paddingVertical: 14,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.4,
    },

    // Header - Enhanced Walmart Theme
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 16,
        letterSpacing: 0.4,
    },

    // Scroll Container
    scrollContainer: {
        flex: 1,
        paddingBottom: 20,
    },

    // Success Banner - Enhanced Walmart Theme
    successBanner: {
        backgroundColor: '#ECFDF5',
        paddingVertical: 48,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#A7F3D0',
        borderTopWidth: 0,
        marginBottom: 8,
    },
    successIcon: {
        width: 100,
        height: 100,
        backgroundColor: '#10B981',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    successTitle: {
        fontSize: 34,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    successSubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 28,
        fontSize: 17,
        lineHeight: 26,
        maxWidth: 340,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    orderNumberCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 28,
        paddingVertical: 24,
        borderWidth: 2,
        borderColor: '#0071CE',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        minWidth: 280,
    },
    orderNumberLabel: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    orderNumber: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0071CE',
        textAlign: 'center',
        letterSpacing: 0.8,
        fontFamily: 'monospace',
        marginBottom: 4,
    },

    // Section - Enhanced Walmart Theme
    section: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
        letterSpacing: 0.4,
    },

    // Status Badge - Enhanced Walmart Theme
    statusBadge: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontWeight: '700',
        textTransform: 'capitalize',
        fontSize: 16,
        letterSpacing: 0.4,
    },

    // Delivery Info - Enhanced Walmart Theme
    deliveryInfo: {
        backgroundColor: '#F8FAFC',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingVertical: 2,
    },
    deliveryLabel: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    deliveryValue: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    deliveryTime: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Quick Actions - Enhanced Walmart Theme
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    actionCard: {
        flex: 1,
        borderRadius: 20,
        paddingVertical: 28,
        paddingHorizontal: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
        minHeight: 100,
        justifyContent: 'center',
        borderWidth: 2,
    },
    trackAction: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
    trackActionText: {
        color: '#2563EB',
        fontWeight: '700',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    calendarAction: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    calendarActionText: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    supportAction: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FED7AA',
    },
    supportActionText: {
        color: '#EA580C',
        fontWeight: '700',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    // Order Items - Enhanced Walmart Theme
    orderItem: {
        flexDirection: 'row',
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    lastOrderItem: {
        borderBottomWidth: 0,
        marginBottom: 0,
        paddingBottom: 0,
    },
    itemImage: {
        width: 92,
        height: 92,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        marginRight: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    itemDetails: {
        flex: 1,
        paddingRight: 12,
    },
    itemName: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 6,
        lineHeight: 22,
        letterSpacing: 0.3,
    },
    itemBrand: {
        color: '#0071CE',
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    itemAttribute: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    itemSku: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 4,
        fontFamily: 'monospace',
        fontWeight: '500',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    itemSeller: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    itemQuantity: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    itemPricing: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        minWidth: 100,
    },
    itemPrice: {
        color: '#0071CE',
        fontWeight: '800',
        fontSize: 18,
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    itemOriginalPrice: {
        color: '#9CA3AF',
        fontSize: 14,
        textDecorationLine: 'line-through',
        marginBottom: 4,
        fontWeight: '500',
    },
    itemSavings: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        letterSpacing: 0.3,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },

    // Address Card - Enhanced Walmart Theme
    addressCard: {
        backgroundColor: '#F8FAFC',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressName: {
        fontWeight: '700',
        color: '#111827',
        marginLeft: 10,
        fontSize: 16,
        letterSpacing: 0.3,
    },
    addressStreet: {
        color: '#6B7280',
        fontSize: 15,
        marginBottom: 6,
        lineHeight: 22,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    addressCity: {
        color: '#6B7280',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
        letterSpacing: 0.2,
    },

    // Summary Container - Enhanced Walmart Theme
    summaryContainer: {
        backgroundColor: '#F8FAFC',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 2,
    },
    summaryLabel: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    summaryValue: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    summaryValueGreen: {
        color: '#059669',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    totalRow: {
        borderTopWidth: 3,
        borderTopColor: '#0071CE',
        paddingTop: 20,
        marginTop: 18,
        backgroundColor: '#FFFFFF',
        marginHorizontal: -24,
        paddingHorizontal: 24,
        paddingBottom: 8,
        borderRadius: 12,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: 0.4,
    },
    totalValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0071CE',
        letterSpacing: 0.4,
        textShadowColor: 'rgba(0, 113, 206, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    // Payment Card - Enhanced Walmart Theme
    paymentCard: {
        backgroundColor: '#F8FAFC',
        padding: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    cardIcon: {
        width: 56,
        height: 36,
        backgroundColor: '#0071CE',
        borderRadius: 10,
        marginRight: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentText: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    paymentStatus: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Timeline Styles - New for Order Timeline
    timelineContainer: {
        paddingVertical: 8,
    },
    timelineEvent: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineIconContainer: {
        alignItems: 'center',
        marginRight: 16,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timelineIconActive: {
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    timelineIconInactive: {
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginTop: 8,
    },
    timelineContent: {
        flex: 1,
        paddingTop: 2,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    timelineDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 6,
        lineHeight: 20,
        fontWeight: '500',
    },
    timelineTimestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
        marginBottom: 4,
    },
    timelineLocation: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    },

    // Help Section - Enhanced Walmart Theme
    helpSection: {
        backgroundColor: '#EFF6FF',
        paddingVertical: 32,
        paddingHorizontal: 24,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#BFDBFE',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    helpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    helpTitle: {
        color: '#1E40AF',
        fontWeight: '800',
        marginLeft: 14,
        fontSize: 20,
        letterSpacing: 0.4,
    },
    helpDescription: {
        color: '#1E40AF',
        fontSize: 15,
        marginBottom: 20,
        lineHeight: 22,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    helpButton: {
        backgroundColor: '#2563EB',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 28,
        alignSelf: 'flex-start',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    helpButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.4,
    },

    // Order Details Card - Enhanced Walmart Theme
    orderDetailsCard: {
        backgroundColor: '#F8FAFC',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    orderDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 2,
    },
    orderDetailLabel: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    orderDetailValue: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    trackingNumberLink: {
        color: '#0071CE',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
        textDecorationLine: 'underline',
    },

    // Bottom Actions - Enhanced Walmart Theme
    bottomActions: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 28,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    continueShoppingButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    continueShoppingText: {
        color: '#374151',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    viewOrdersButton: {
        flex: 1,
        backgroundColor: '#0071CE',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    viewOrdersText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },

    // Modal - Enhanced Walmart Theme
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    trackingModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 40,
        maxWidth: width - 48,
        minWidth: width - 64,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 20,
        borderWidth: 2,
        borderColor: '#F1F5F9',
    },
    trackingHeader: {
        alignItems: 'center',
        marginBottom: 28,
    },
    trackingTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        marginTop: 18,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.4,
    },
    trackingDescription: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 36,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        letterSpacing: 0.2,
    },

    // Tracking Timeline in Modal - Enhanced Walmart Theme
    trackingTimeline: {
        marginBottom: 36,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    timelineTextActive: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: 0.3,
    },
    timelineTextInactive: {
        fontSize: 16,
        fontWeight: '500',
        color: '#9CA3AF',
        letterSpacing: 0.3,
    },

    trackingButton: {
        backgroundColor: '#0071CE',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    trackingButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.4,
    },
});