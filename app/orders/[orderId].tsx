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
    Linking,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, isAfter, isBefore, addDays } from 'date-fns';

// Import unified systems
import { getImageById } from '../../assets/images/imageLoader';
import { useCartStore } from '../../store/slices/cartSlice';
import { ALL_PRODUCTS } from '../../constants/products';

interface OrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageId?: string | number; // Changed from image string to imageId
    quantity: number;
    seller: string;
    size?: string;
    color?: string;
    sku?: string;
    variant?: any;
}

interface TrackingEvent {
    id: string;
    status: string;
    description: string;
    location: string;
    timestamp: Date;
    isCompleted: boolean;
}

interface OrderDetails {
    id: string;
    orderNumber: string;
    status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    estimatedDelivery: Date;
    actualDelivery?: Date;
    shippingAddress: {
        name: string;
        street: string;
        apartment?: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
    };
    billingAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    createdAt: Date;
    trackingNumber?: string;
    carrier?: string;
    trackingEvents: TrackingEvent[];
    canCancel: boolean;
    canReturn: boolean;
    returnDeadline?: Date;
}

export default function OrderDetailsPage(): JSX.Element {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Cart store for reorder functionality
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    // Enhanced order loading with product data integration
    const loadOrderDetails = async () => {
        try {
            setIsLoading(true);

            // TODO: Replace with actual API call
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('Order not found');
            }
            const orderData = await response.json();

            // Enhance order items with product data from unified system
            const enhancedItems = orderData.items.map((item: OrderItem) => {
                const productData = ALL_PRODUCTS.find(p => p.id === item.productId);

                return {
                    ...item,
                    // Use product image ID if available, fallback to item imageId or productId
                    imageId: item.imageId || productData?.id || item.productId,
                    // Enhance with product data if available
                    name: item.name || productData?.name || 'Unknown Product',
                    seller: item.seller || productData?.brand || 'Walmart',
                    sku: item.sku || productData?.sku || `SKU-${item.productId}`,
                };
            });

            setOrderDetails({
                ...orderData,
                items: enhancedItems,
                // Ensure dates are Date objects
                estimatedDelivery: new Date(orderData.estimatedDelivery),
                actualDelivery: orderData.actualDelivery ? new Date(orderData.actualDelivery) : undefined,
                createdAt: new Date(orderData.createdAt),
                returnDeadline: orderData.returnDeadline ? new Date(orderData.returnDeadline) : undefined,
                trackingEvents: orderData.trackingEvents.map((event: any) => ({
                    ...event,
                    timestamp: new Date(event.timestamp)
                }))
            });

        } catch (error) {
            console.error('Error loading order details:', error);

            // For development: Generate sample order if API fails
            if (__DEV__) {
                const sampleOrder = generateSampleOrder(orderId);
                setOrderDetails(sampleOrder);
            } else {
                Alert.alert('Error', 'Failed to load order details');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Development helper: Generate sample order using real product data
    const generateSampleOrder = (id: string): OrderDetails => {
        const sampleProducts = ALL_PRODUCTS.slice(0, 3); // Use first 3 products

        const items: OrderItem[] = sampleProducts.map((product, index) => ({
            id: `item_${index + 1}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            imageId: product.id, // Use product ID for image loading
            quantity: index === 0 ? 2 : 1,
            seller: product.brand || 'Walmart',
            sku: product.sku,
            color: product.variants?.colors?.[0]?.name,
            size: product.variants?.sizes?.[0]?.name,
        }));

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const shipping = subtotal > 35 ? 0 : 7.95;
        const discount = 0;

        return {
            id,
            orderNumber: `WM-2025-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
            status: 'shipped',
            items,
            subtotal,
            shipping,
            tax,
            discount,
            total: subtotal + tax + shipping - discount,
            paymentMethod: 'Visa •••• 4242',
            estimatedDelivery: addDays(new Date(), 2),
            shippingAddress: {
                name: 'John Doe',
                street: '123 Main Street',
                apartment: 'Apt 4B',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                phone: '+1 (555) 123-4567',
            },
            billingAddress: {
                name: 'John Doe',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
            },
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            trackingNumber: `TRK${Math.floor(Math.random() * 1000000000)}`,
            carrier: 'FedEx',
            trackingEvents: [
                {
                    id: '1',
                    status: 'Order Placed',
                    description: 'Your order has been confirmed and is being prepared',
                    location: 'Walmart Fulfillment Center',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    isCompleted: true,
                },
                {
                    id: '2',
                    status: 'Processing',
                    description: 'Items are being picked and packed',
                    location: 'Walmart Fulfillment Center',
                    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
                    isCompleted: true,
                },
                {
                    id: '3',
                    status: 'Shipped',
                    description: 'Your package has been picked up by the carrier',
                    location: 'Walmart Fulfillment Center',
                    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    isCompleted: true,
                },
                {
                    id: '4',
                    status: 'In Transit',
                    description: 'Package is on its way to the destination facility',
                    location: 'FedEx Hub - Newark, NJ',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    isCompleted: true,
                },
                {
                    id: '5',
                    status: 'Out for Delivery',
                    description: 'Package is loaded on delivery vehicle',
                    location: 'FedEx Facility - New York, NY',
                    timestamp: new Date(),
                    isCompleted: false,
                },
                {
                    id: '6',
                    status: 'Delivered',
                    description: 'Package has been delivered',
                    location: 'New York, NY 10001',
                    timestamp: addDays(new Date(), 1),
                    isCompleted: false,
                },
            ],
            canCancel: false,
            canReturn: true,
            returnDeadline: addDays(new Date(), 30),
        };
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrderDetails();
        setRefreshing(false);
    };

    const handleTrackPackage = () => {
        if (orderDetails?.trackingNumber && orderDetails?.carrier) {
            let trackingUrl = '';
            switch (orderDetails.carrier.toLowerCase()) {
                case 'fedex':
                    trackingUrl = `https://www.fedex.com/fedextrack/?tracknumbers=${orderDetails.trackingNumber}`;
                    break;
                case 'ups':
                    trackingUrl = `https://www.ups.com/track?track=yes&trackNums=${orderDetails.trackingNumber}`;
                    break;
                case 'usps':
                    trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${orderDetails.trackingNumber}`;
                    break;
                default:
                    Alert.alert('Tracking', `Tracking Number: ${orderDetails.trackingNumber}`);
                    return;
            }
            Linking.openURL(trackingUrl);
        }
    };

    const handleCancelOrder = async () => {
        if (!orderDetails?.canCancel) {
            Alert.alert('Cannot Cancel', 'This order cannot be cancelled as it has already been shipped.');
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
                            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                            });

                            if (!response.ok) {
                                throw new Error('Failed to cancel order');
                            }

                            Alert.alert('Success', 'Your order has been cancelled. Refund will be processed within 3-5 business days.');
                            await loadOrderDetails(); // Refresh order details
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
        if (!orderDetails?.canReturn) {
            Alert.alert('Cannot Return', 'The return window for this order has expired.');
            return;
        }
        router.push(`/orders/${orderId}/return`);
    };

    const handleReorder = async () => {
        if (!orderDetails?.items) return;

        Alert.alert(
            'Reorder Items',
            'Add all items from this order to your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add to Cart',
                    onPress: async () => {
                        try {
                            // Add each order item to cart using the cart store
                            for (const item of orderDetails.items) {
                                const productData = ALL_PRODUCTS.find(p => p.id === item.productId);

                                await addItem({
                                    productId: item.productId,
                                    name: item.name,
                                    brand: item.seller,
                                    price: item.price,
                                    originalPrice: item.originalPrice,
                                    quantity: item.quantity,
                                    maxQuantity: productData?.maxQuantity || 10,
                                    minQuantity: productData?.minQuantity || 1,
                                    image: item.imageId || item.productId,
                                    category: productData?.category || 'general',
                                    sku: item.sku || `SKU-${item.productId}`,
                                    status: productData?.status || 'available',
                                    storeId: productData?.storeId || 'store_001',
                                    storeName: productData?.storeName || 'Walmart Supercenter',
                                    delivery: productData?.delivery || {
                                        option: 'pickup' as const,
                                        freeShippingEligible: true,
                                    },
                                    variant: item.variant || {
                                        color: item.color,
                                        size: item.size,
                                    },
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
            `Need help with order ${orderDetails?.orderNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => {
                        Linking.openURL('tel:1-800-925-6278').catch(() => {
                            Alert.alert(
                                'Call Support',
                                '📞 1-800-925-6278\n\n(Phone dialer not available in simulator)',
                                [
                                    { text: 'Copy Number', onPress: () => Alert.alert('Number', '1-800-925-6278') },
                                    { text: 'OK', style: 'cancel' }
                                ]
                            );
                        });
                    }
                },
                {
                    text: 'Chat',
                    onPress: () => router.push('/support/chat')
                },
                {
                    text: 'Email',
                    onPress: () => {
                        const emailUrl = `mailto:support@walmart.com?subject=Order%20Support%20-%20${orderDetails?.orderNumber}`;
                        Linking.openURL(emailUrl).catch(() => {
                            Alert.alert(
                                'Email Support',
                                '📧 support@walmart.com\n\nSubject: Order Support - ' + orderDetails?.orderNumber,
                                [
                                    { text: 'Copy Email', onPress: () => Alert.alert('Email', 'support@walmart.com') },
                                    { text: 'OK', style: 'cancel' }
                                ]
                            );
                        });
                    }
                },
            ]
        );
    };

    const shareOrder = async () => {
        if (!orderDetails) return;

        setIsSharing(true);
        try {
            const message = `📦 Order Update - ${orderDetails.orderNumber}

Status: ${orderDetails.status.replace('_', ' ').toUpperCase()}
Items: ${orderDetails.items.length}
Total: $${orderDetails.total.toFixed(2)}

${orderDetails.trackingNumber ? `Tracking: ${orderDetails.trackingNumber}` : ''}
Estimated Delivery: ${format(orderDetails.estimatedDelivery, 'EEEE, MMMM do')}

Track your order: https://walmart.com/track/${orderDetails.orderNumber}`;

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

    // Enhanced image loading function using smart image loader
    const getOrderItemImage = (item: OrderItem) => {
        try {
            // Use smart image loading system
            return getImageById(item.imageId || item.productId, 'medium');
        } catch (error) {
            console.warn(`Failed to load image for item ${item.id}:`, error);
            // Ultimate fallback to product ID
            return getImageById(1, 'medium');
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return { backgroundColor: '#DBEAFE', color: '#2563EB' };
            case 'processing': return { backgroundColor: '#FEF3C7', color: '#D97706' };
            case 'shipped': return { backgroundColor: '#EDE9FE', color: '#7C3AED' };
            case 'out_for_delivery': return { backgroundColor: '#FED7AA', color: '#EA580C' };
            case 'delivered': return { backgroundColor: '#D1FAE5', color: '#059669' };
            case 'cancelled': return { backgroundColor: '#FEE2E2', color: '#DC2626' };
            case 'returned': return { backgroundColor: '#F3F4F6', color: '#6B7280' };
            default: return { backgroundColor: '#F3F4F6', color: '#6B7280' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return 'checkmark-circle';
            case 'processing': return 'time';
            case 'shipped': return 'car';
            case 'out_for_delivery': return 'bicycle';
            case 'delivered': return 'home';
            case 'cancelled': return 'close-circle';
            case 'returned': return 'return-up-back';
            default: return 'ellipse';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004C98" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </SafeAreaView>
        );
    }

    if (!orderDetails) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#E74C3C" />
                <Text style={styles.errorTitle}>Order Not Found</Text>
                <Text style={styles.errorMessage}>
                    The order you're looking for doesn't exist or has been removed.
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
                            {orderDetails.orderNumber}
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
                        <View style={[styles.statusBadge, getStatusBadgeStyle(orderDetails.status)]}>
                            <View style={styles.statusBadgeContent}>
                                <Ionicons
                                    name={getStatusIcon(orderDetails.status) as any}
                                    size={16}
                                    color={getStatusBadgeStyle(orderDetails.status).color}
                                />
                                <Text style={[styles.statusBadgeText, { color: getStatusBadgeStyle(orderDetails.status).color }]}>
                                    {orderDetails.status.replace('_', ' ')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.deliveryInfo}>
                        <View style={styles.deliveryRow}>
                            <Text style={styles.deliveryLabel}>
                                {orderDetails.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                            </Text>
                            <Text style={styles.deliveryDate}>
                                {orderDetails.actualDelivery
                                    ? format(orderDetails.actualDelivery, 'EEEE, MMMM do')
                                    : format(orderDetails.estimatedDelivery, 'EEEE, MMMM do')
                                }
                            </Text>
                        </View>
                        {orderDetails.trackingNumber && (
                            <View style={styles.deliveryRow}>
                                <Text style={styles.deliveryLabel}>Tracking Number</Text>
                                <TouchableOpacity onPress={handleTrackPackage}>
                                    <Text style={styles.trackingNumber}>
                                        {orderDetails.trackingNumber}
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
                        {orderDetails.trackingNumber && (
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

                        {orderDetails.canReturn && (
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

                        {orderDetails.canCancel && (
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

                {/* Tracking Timeline */}
                {orderDetails.trackingEvents.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Tracking Timeline</Text>
                        {orderDetails.trackingEvents.map((event, index) => (
                            <View key={event.id} style={styles.timelineEvent}>
                                <View style={styles.timelineIndicator}>
                                    <View style={[
                                        styles.timelineDot,
                                        event.isCompleted ? styles.timelineDotCompleted : styles.timelineDotPending
                                    ]} />
                                    {index < orderDetails.trackingEvents.length - 1 && (
                                        <View style={[
                                            styles.timelineLine,
                                            event.isCompleted ? styles.timelineLineCompleted : styles.timelineLinePending
                                        ]} />
                                    )}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={[
                                        styles.timelineStatus,
                                        event.isCompleted ? styles.timelineStatusCompleted : styles.timelineStatusPending
                                    ]}>
                                        {event.status}
                                    </Text>
                                    <Text style={[
                                        styles.timelineDescription,
                                        event.isCompleted ? styles.timelineDescriptionCompleted : styles.timelineDescriptionPending
                                    ]}>
                                        {event.description}
                                    </Text>
                                    <Text style={[
                                        styles.timelineLocation,
                                        event.isCompleted ? styles.timelineLocationCompleted : styles.timelineLocationPending
                                    ]}>
                                        {event.location} • {format(event.timestamp, 'MMM d, h:mm a')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Order Items - Enhanced with smart image loading */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Order Items ({orderDetails.items.length})
                    </Text>
                    {orderDetails.items.map((item, index) => (
                        <View key={item.id} style={[styles.orderItem, index < orderDetails.items.length - 1 && styles.orderItemBorder]}>
                            <Image
                                source={getOrderItemImage(item)}
                                style={styles.itemImage}
                                resizeMode="cover"
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                {item.color && (
                                    <Text style={styles.itemDetail}>Color: {item.color}</Text>
                                )}
                                {item.size && (
                                    <Text style={styles.itemDetail}>Size: {item.size}</Text>
                                )}
                                {item.sku && (
                                    <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                                )}
                                <Text style={styles.itemSeller}>
                                    Sold by {item.seller} • Qty: {item.quantity}
                                </Text>
                            </View>
                            <View style={styles.itemPricing}>
                                <Text style={styles.itemPrice}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </Text>
                                {item.originalPrice && item.originalPrice > item.price && (
                                    <Text style={styles.itemOriginalPrice}>
                                        ${(item.originalPrice * item.quantity).toFixed(2)}
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
                            {orderDetails.shippingAddress.name}
                        </Text>
                        <Text style={styles.addressPhone}>
                            {orderDetails.shippingAddress.phone}
                        </Text>
                        <Text style={styles.addressText}>
                            {orderDetails.shippingAddress.street}
                            {orderDetails.shippingAddress.apartment && `, ${orderDetails.shippingAddress.apartment}`}
                        </Text>
                        <Text style={styles.addressText}>
                            {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                        </Text>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${orderDetails.subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>
                                {orderDetails.shipping === 0 ? 'Free' : `${orderDetails.shipping.toFixed(2)}`}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>${orderDetails.tax.toFixed(2)}</Text>
                        </View>
                        {orderDetails.discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryDiscount}>Discount</Text>
                                <Text style={styles.summaryDiscount}>-${orderDetails.discount.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotal}>Total</Text>
                            <Text style={styles.summaryTotalValue}>
                                ${orderDetails.total.toFixed(2)}
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
                                {orderDetails.paymentMethod}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.billingContainer}>
                        <Text style={styles.paymentLabel}>Billing Address</Text>
                        <Text style={styles.billingName}>
                            {orderDetails.billingAddress.name}
                        </Text>
                        <Text style={styles.billingText}>
                            {orderDetails.billingAddress.street}
                        </Text>
                        <Text style={styles.billingText}>
                            {orderDetails.billingAddress.city}, {orderDetails.billingAddress.state} {orderDetails.billingAddress.zipCode}
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
                                {format(orderDetails.createdAt, 'MMMM d, yyyy')}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Order Time</Text>
                            <Text style={styles.summaryValue}>
                                {format(orderDetails.createdAt, 'h:mm a')}
                            </Text>
                        </View>
                        {orderDetails.carrier && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Carrier</Text>
                                <Text style={styles.summaryValue}>
                                    {orderDetails.carrier}
                                </Text>
                            </View>
                        )}
                        {orderDetails.canReturn && orderDetails.returnDeadline && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Return By</Text>
                                <Text style={styles.summaryValue}>
                                    {format(orderDetails.returnDeadline, 'MMMM d, yyyy')}
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