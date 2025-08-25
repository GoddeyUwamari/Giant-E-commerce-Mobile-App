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
    StyleSheet,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import { format, addDays } from 'date-fns';

// Import real data systems
import { useCartStore } from '../../store/slices/cartSlice';
import { paymentsAPI } from '../../services/api/payments';
import { getImageById } from '../../assets/images/imageLoader';
import { getProductById } from '../../constants/products';

const { width, height } = Dimensions.get('window');

interface OrderItem {
    id: string;
    productId: string;
    name: string;
    brand?: string;
    price: number;
    originalPrice?: number;
    image: any;
    quantity: number;
    seller: string;
    size?: string;
    color?: string;
    variant?: any;
    selectedVariants?: any;
    category?: string;
    sku?: string;
}

interface OrderDetails {
    id: string;
    orderNumber: string;
    status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    estimatedDelivery: Date;
    shippingAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    createdAt: Date;
    trackingNumber?: string;
}

export default function ConfirmationPage(): JSX.Element {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showTrackingInfo, setShowTrackingInfo] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const modalAnim = useRef(new Animated.Value(0)).current;

    // Enhanced Zustand store integration
    const cartItems = useCartStore((state) => state.items || []);
    const summary = useCartStore((state) => state.summary || {
        itemCount: 0,
        subtotal: 0,
        savings: 0,
        discounts: 0,
        shipping: 0,
        delivery: 0,
        tax: 0,
        total: 0,
    });
    const deliveryAddress = useCartStore((state) => state.deliveryAddress);
    const paymentIntent = useCartStore((state) => state.paymentIntent);
    const appliedPromoCodes = useCartStore((state) => state.appliedPromoCodes || []);

    // Cart actions
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        loadOrderDetails();
        scheduleDeliveryNotifications();

        // Clear cart data after successful order
        clearCartData();

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

    // Enhanced order details loading with better error handling
    const loadOrderDetails = async () => {
        try {
            setIsLoading(true);

            // Priority 1: Load from AsyncStorage if order was just completed
            const storedOrderId = await AsyncStorage.getItem('latest_order_id');
            if (storedOrderId) {
                const storedOrder = await AsyncStorage.getItem(`order_${storedOrderId}`);
                if (storedOrder) {
                    const order = JSON.parse(storedOrder);
                    setOrderDetails({
                        ...order,
                        estimatedDelivery: new Date(order.estimatedDelivery),
                        createdAt: new Date(order.createdAt),
                    });
                    return;
                }
            }

            // Priority 2: Create order from current cart data if available
            if (cartItems.length > 0 && summary.total > 0) {
                console.log('Creating order from cart data...');
                const newOrder = await createOrderFromCart();
                setOrderDetails(newOrder);
                return;
            }

            // Priority 3: Try to reconstruct from payment data
            const latestOrderTotal = await AsyncStorage.getItem('latest_order_total');
            const latestPaymentMethod = await AsyncStorage.getItem('latest_order_payment_method');
            const latestOrderTimestamp = await AsyncStorage.getItem('latest_order_timestamp');

            if (latestOrderTotal && latestPaymentMethod) {
                console.log('Creating order from payment data...');
                const mockOrder = createOrderFromPaymentData(
                    parseFloat(latestOrderTotal),
                    JSON.parse(latestPaymentMethod),
                    latestOrderTimestamp ? new Date(latestOrderTimestamp) : new Date()
                );
                setOrderDetails(mockOrder);
                return;
            }

            // Priority 4: Try to fetch from API if payment intent exists
            if (paymentIntent?.id) {
                try {
                    console.log('Fetching order from API...');
                    const paymentConfirmation = await paymentsAPI.checkPaymentStatus(paymentIntent.id);
                    if (paymentConfirmation.status === 'succeeded') {
                        const apiOrder = await createOrderFromPaymentIntent(paymentConfirmation);
                        setOrderDetails(apiOrder);
                        return;
                    }
                } catch (apiError) {
                    console.warn('Failed to fetch order from API:', apiError);
                }
            }

            // Final fallback: Create demo order
            console.log('Using demo order as fallback...');
            const demoOrder = createDemoOrder();
            setOrderDetails(demoOrder);

        } catch (error) {
            console.error('Error loading order details:', error);
            Alert.alert('Error', 'Failed to load order details. Please contact support if this persists.');

            // Emergency fallback
            const emergencyOrder = createDemoOrder();
            setOrderDetails(emergencyOrder);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced order creation from cart with comprehensive data mapping
    const createOrderFromCart = async (): Promise<OrderDetails> => {
        setIsSavingOrder(true);
        try {
            const orderNumber = generateOrderNumber();
            const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log('Creating order from cart with', cartItems.length, 'items');

            // Convert cart items to order items with enhanced product data
            const orderItems: OrderItem[] = cartItems.map((item) => {
                let productData;
                try {
                    productData = getProductById(item.productId);
                } catch (error) {
                    console.warn('Could not get product data for:', item.productId);
                    productData = null;
                }

                // Extract variant information comprehensively
                const extractVariantValue = (variantObj: any, key: string) => {
                    if (!variantObj) return undefined;

                    // Handle different variant structures
                    if (variantObj[key]) {
                        if (typeof variantObj[key] === 'object' && variantObj[key].value) {
                            return variantObj[key].value;
                        }
                        if (typeof variantObj[key] === 'string') {
                            return variantObj[key];
                        }
                    }
                    return undefined;
                };

                const color = extractVariantValue(item.variant, 'color') ||
                    extractVariantValue(item.selectedVariants, 'color');

                const size = extractVariantValue(item.variant, 'size') ||
                    extractVariantValue(item.selectedVariants, 'size');

                return {
                    id: item.id,
                    productId: item.productId,
                    name: item.name,
                    brand: item.brand || productData?.brand,
                    price: item.salePrice || item.price,
                    originalPrice: item.originalPrice || productData?.originalPrice,
                    image: item.image,
                    quantity: item.quantity,
                    seller: item.storeName || productData?.seller || 'Walmart',
                    variant: item.variant,
                    selectedVariants: item.selectedVariants,
                    category: item.category || productData?.category,
                    sku: item.sku || productData?.sku,
                    color,
                    size,
                };
            });

            // Get shipping address with comprehensive fallback chain
            let shippingAddress = {
                name: 'John Doe',
                street: '123 Main Street, Apt 4B',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
            };

            if (deliveryAddress) {
                shippingAddress = {
                    name: deliveryAddress.name,
                    street: deliveryAddress.street + (deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : ''),
                    city: deliveryAddress.city,
                    state: deliveryAddress.state,
                    zipCode: deliveryAddress.zipCode,
                };
            } else {
                // Try AsyncStorage fallback
                try {
                    const storedAddress = await AsyncStorage.getItem('selected_shipping_address');
                    if (storedAddress) {
                        const parsed = JSON.parse(storedAddress);
                        shippingAddress = {
                            name: parsed.name || 'Customer',
                            street: parsed.street + (parsed.apartment ? `, ${parsed.apartment}` : ''),
                            city: parsed.city,
                            state: parsed.state,
                            zipCode: parsed.zipCode,
                        };
                    }
                } catch (fallbackError) {
                    console.warn('Could not load address from AsyncStorage:', fallbackError);
                }
            }

            // Get payment method with fallback
            let paymentMethodDisplay = 'Card Payment';
            try {
                const storedPayment = await AsyncStorage.getItem('latest_order_payment_method');
                if (storedPayment) {
                    const paymentData = JSON.parse(storedPayment);
                    paymentMethodDisplay = paymentData.displayName || paymentData.nickname ||
                        `${paymentData.brand || 'Card'} •••• ${paymentData.last4 || '0000'}`;
                } else if (paymentIntent) {
                    paymentMethodDisplay = 'Stripe Payment';
                }
            } catch (paymentError) {
                console.warn('Could not determine payment method:', paymentError);
            }

            // Calculate totals with proper fallbacks
            const calculatedSubtotal = summary.subtotal || orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const calculatedShipping = (summary.shipping || 0) + (summary.delivery || 0);
            const calculatedTax = summary.tax || (calculatedSubtotal * 0.08); // 8% fallback tax
            const calculatedDiscount = (summary.discounts || 0) + (summary.savings || 0);
            const calculatedTotal = summary.total || (calculatedSubtotal + calculatedShipping + calculatedTax - calculatedDiscount);

            const order: OrderDetails = {
                id: orderId,
                orderNumber,
                status: 'confirmed',
                items: orderItems,
                subtotal: calculatedSubtotal,
                shipping: calculatedShipping,
                tax: calculatedTax,
                discount: calculatedDiscount,
                total: calculatedTotal,
                paymentMethod: paymentMethodDisplay,
                estimatedDelivery: calculateEstimatedDelivery(),
                shippingAddress,
                createdAt: new Date(),
                trackingNumber: generateTrackingNumber(),
            };

            // Store order for future reference
            await AsyncStorage.setItem(`order_${orderId}`, JSON.stringify(order));
            await AsyncStorage.setItem('latest_order_id', orderId);

            // Store order metadata
            await AsyncStorage.setItem('latest_order_timestamp', order.createdAt.toISOString());
            await AsyncStorage.setItem('latest_order_number', order.orderNumber);

            // Log promo codes applied for analytics
            if (appliedPromoCodes.length > 0) {
                console.log('Order created with promo codes:', appliedPromoCodes.map(p => p.code));
            }

            console.log('Order created successfully:', orderId);
            return order;

        } catch (error) {
            console.error('Error creating order from cart:', error);
            throw error;
        } finally {
            setIsSavingOrder(false);
        }
    };

    // Create order from payment data with enhanced reconstruction
    const createOrderFromPaymentData = (total: number, paymentMethod: any, timestamp: Date): OrderDetails => {
        console.log('Reconstructing order from payment data...');

        // Try to reconstruct items from cart history or create reasonable defaults
        let reconstructedItems: OrderItem[] = [];

        try {
            // Calculate approximate item distribution
            const itemCount = Math.max(1, Math.floor(total / 50)); // Assume avg $50 per item
            const itemPrice = total * 0.85 / itemCount; // 85% for items, 15% for tax/shipping

            for (let i = 0; i < itemCount; i++) {
                reconstructedItems.push({
                    id: `reconstructed_${i + 1}`,
                    productId: `prod_${i + 1}`,
                    name: `Order Item ${i + 1}`,
                    brand: 'Walmart',
                    price: itemPrice,
                    image: getImageById(i + 1, 'medium'),
                    quantity: 1,
                    seller: 'Walmart',
                    category: 'general',
                    sku: `WAL-${timestamp.getTime()}-${i + 1}`,
                });
            }
        } catch (error) {
            console.warn('Error reconstructing items:', error);
            // Single item fallback
            reconstructedItems = [{
                id: 'fallback_1',
                productId: 'prod_fallback',
                name: 'Order Items',
                brand: 'Walmart',
                price: total * 0.85,
                image: getImageById(1, 'medium'),
                quantity: 1,
                seller: 'Walmart',
                category: 'general',
                sku: `WAL-${timestamp.getTime()}-FB`,
            }];
        }

        return {
            id: `order_payment_${timestamp.getTime()}`,
            orderNumber: generateOrderNumber(),
            status: 'confirmed',
            items: reconstructedItems,
            subtotal: total * 0.85,
            shipping: total * 0.05,
            tax: total * 0.10,
            discount: 0,
            total: total,
            paymentMethod: paymentMethod.displayName || paymentMethod.nickname || 'Card Payment',
            estimatedDelivery: calculateEstimatedDelivery(),
            shippingAddress: {
                name: 'Customer',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
            },
            createdAt: timestamp,
            trackingNumber: generateTrackingNumber(),
        };
    };

    // Create order from payment intent (API integration)
    const createOrderFromPaymentIntent = async (paymentConfirmation: any): Promise<OrderDetails> => {
        console.log('Creating order from payment intent...');

        // This would typically fetch full order details from your backend
        // For now, we'll reconstruct from available data
        return {
            id: `order_api_${paymentConfirmation.amount}`,
            orderNumber: generateOrderNumber(),
            status: 'confirmed',
            items: [{
                id: 'api_item_1',
                productId: 'api_prod_1',
                name: 'API Order Item',
                brand: 'Walmart',
                price: paymentConfirmation.amount / 100, // Stripe amounts are in cents
                image: getImageById(1, 'medium'),
                quantity: 1,
                seller: 'Walmart',
                category: 'general',
                sku: `API-${paymentConfirmation.amount}`,
            }],
            subtotal: (paymentConfirmation.amount / 100) * 0.85,
            shipping: (paymentConfirmation.amount / 100) * 0.05,
            tax: (paymentConfirmation.amount / 100) * 0.10,
            discount: 0,
            total: paymentConfirmation.amount / 100,
            paymentMethod: 'Stripe Payment',
            estimatedDelivery: calculateEstimatedDelivery(),
            shippingAddress: {
                name: 'API Customer',
                street: '123 API Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
            },
            createdAt: new Date(paymentConfirmation.lastUpdated),
            trackingNumber: generateTrackingNumber(),
        };
    };

    // Enhanced demo order with realistic data
    const createDemoOrder = (): OrderDetails => {
        console.log('Creating demo order...');

        const demoItems: OrderItem[] = [
            {
                id: 'demo_1',
                productId: 'prod_001',
                name: 'iPhone 15 Pro Max 256GB',
                brand: 'Apple',
                price: 1199.99,
                originalPrice: 1299.99,
                image: getImageById(1, 'medium'),
                quantity: 1,
                seller: 'Apple',
                color: 'Deep Purple',
                category: 'electronics',
                sku: 'APL-IP15PM-256-DP',
            },
            {
                id: 'demo_2',
                productId: 'prod_002',
                name: 'AirPods Pro (2nd Gen)',
                brand: 'Apple',
                price: 249.99,
                image: getImageById(2, 'medium'),
                quantity: 2,
                seller: 'Apple',
                category: 'electronics',
                sku: 'APL-APP-2ND-GEN',
            },
        ];

        return {
            id: 'order_demo_' + Date.now(),
            orderNumber: generateOrderNumber(),
            status: 'confirmed',
            items: demoItems,
            subtotal: 1699.97,
            shipping: 0,
            tax: 135.99,
            discount: 169.99,
            total: 1665.97,
            paymentMethod: 'Demo Card •••• 4242',
            estimatedDelivery: calculateEstimatedDelivery(),
            shippingAddress: {
                name: 'Demo Customer',
                street: '123 Demo Street, Apt 4B',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
            },
            createdAt: new Date(),
            trackingNumber: generateTrackingNumber(),
        };
    };

    // Utility functions
    const generateOrderNumber = (): string => {
        const year = new Date().getFullYear();
        const randomPart = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `WM-${year}-${randomPart}`;
    };

    const generateTrackingNumber = (): string => {
        return `1Z${Math.random().toString(36).substr(2, 14).toUpperCase()}`;
    };

    const calculateEstimatedDelivery = (): Date => {
        const today = new Date();
        const deliveryDays = summary.shipping === 0 ? 2 : 5; // Free shipping = 2 days, paid = 5 days
        return addDays(today, deliveryDays);
    };

    // Enhanced cart clearing with comprehensive cleanup
    const clearCartData = async () => {
        try {
            console.log('Clearing cart data after successful order...');

            // Clear Zustand cart
            await clearCart();

            // Clear all related AsyncStorage keys
            const keysToRemove = [
                'cart_items',
                'selected_address_id',
                'selected_payment_id',
                'selected_shipping_id',
                'applied_promo_codes',
                'cart_summary',
                'cart_expiry',
                // Don't clear latest_order_* keys as they're needed for confirmation
            ];

            await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));

            console.log('Cart data cleared successfully');
        } catch (error) {
            console.error('Error clearing cart data:', error);
            // Non-critical error, don't block the confirmation page
        }
    };

    // Enhanced notification scheduling with better error handling
    const scheduleDeliveryNotifications = async () => {
        if (!orderDetails) return;

        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted');
                return;
            }

            const deliveryDate = orderDetails.estimatedDelivery;

            // Schedule delivery day notification
            const notificationDate = new Date(deliveryDate);
            notificationDate.setHours(9, 0, 0, 0);

            if (notificationDate > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Order Delivery Today! 📦',
                        body: `Your order ${orderDetails.orderNumber} is scheduled for delivery today.`,
                        data: {
                            orderId: orderDetails.id,
                            orderNumber: orderDetails.orderNumber,
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
                        body: `Your order ${orderDetails.orderNumber} will be delivered tomorrow.`,
                        data: {
                            orderId: orderDetails.id,
                            orderNumber: orderDetails.orderNumber,
                            type: 'delivery_reminder'
                        },
                    },
                    trigger: reminderDate,
                });
            }

            console.log('Delivery notifications scheduled successfully');
        } catch (error) {
            console.error('Error scheduling notifications:', error);
            // Non-critical error, don't show alert
        }
    };

    // Enhanced calendar integration with better event details
    const addDeliveryToCalendar = async () => {
        if (!orderDetails) return;

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

            const deliveryDate = orderDetails.estimatedDelivery;
            const startDate = new Date(deliveryDate);
            startDate.setHours(9, 0, 0, 0);
            const endDate = new Date(deliveryDate);
            endDate.setHours(18, 0, 0, 0);

            const eventDetails = `
Order Details:
- Order #: ${orderDetails.orderNumber}
- Total: $${orderDetails.total.toFixed(2)}
- Items: ${orderDetails.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
- Payment: ${orderDetails.paymentMethod}

Delivery Address:
${orderDetails.shippingAddress.name}
${orderDetails.shippingAddress.street}
${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}

${orderDetails.trackingNumber ? `Tracking: ${orderDetails.trackingNumber}` : ''}

Track your order: https://walmart.com/track/${orderDetails.orderNumber}
           `.trim();

            await Calendar.createEventAsync(defaultCalendar.id, {
                title: `Walmart Delivery - ${orderDetails.orderNumber}`,
                startDate,
                endDate,
                notes: eventDetails,
                location: `${orderDetails.shippingAddress.street}, ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}`,
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

    // Enhanced sharing with better formatting
    const shareOrder = async () => {
        if (!orderDetails) return;

        setIsSharing(true);
        try {
            const itemsList = orderDetails.items.map(item =>
                `• ${item.name}${item.color ? ` (${item.color})` : ''}${item.size ? ` - ${item.size}` : ''} × ${item.quantity}`
            ).join('\n');

            const message = `🛒 Walmart Order Confirmation

Order #: ${orderDetails.orderNumber}
Order Date: ${format(orderDetails.createdAt, 'MMM dd, yyyy')}
Total: $${orderDetails.total.toFixed(2)}

Items Ordered:
${itemsList}

Estimated Delivery: ${format(orderDetails.estimatedDelivery, 'EEEE, MMMM do, yyyy')}
Delivery Time: 9:00 AM - 6:00 PM

Delivery Address:
${orderDetails.shippingAddress.name}
${orderDetails.shippingAddress.street}
${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}

Payment Method: ${orderDetails.paymentMethod}
${orderDetails.trackingNumber ? `Tracking: ${orderDetails.trackingNumber}` : ''}

Track your order: https://walmart.com/orders/track?orderNumber=${orderDetails.orderNumber}

Thank you for shopping with Walmart! 🙏`;

            await Share.share({
                message,
                title: `Walmart Order ${orderDetails.orderNumber}`,
                url: `https://walmart.com/orders/${orderDetails.orderNumber}`, // Optional deep link
            });
        } catch (error) {
            console.error('Error sharing order:', error);
            // Don't show alert as user might have just cancelled
        } finally {
            setIsSharing(false);
        }
    };

    // Enhanced order tracking with better UX
    const handleTrackOrder = async () => {
        if (!orderDetails) return;

        try {
            if (orderDetails.trackingNumber && orderDetails.status !== 'confirmed') {
                // Open actual tracking URL
                const trackingUrl = `https://www.walmart.com/orders/track?orderNumber=${orderDetails.orderNumber}&trackingNumber=${orderDetails.trackingNumber}`;
                const canOpen = await Linking.canOpenURL(trackingUrl);

                if (canOpen) {
                    await Linking.openURL(trackingUrl);
                } else {
                    // Fallback to general order tracking
                    await Linking.openURL(`https://www.walmart.com/orders/track?orderNumber=${orderDetails.orderNumber}`);
                }
            } else {
                // Show tracking info modal for recently confirmed orders
                setShowTrackingInfo(true);
            }
        } catch (error) {
            console.error('Error opening tracking URL:', error);
            // Fallback to showing tracking info
            setShowTrackingInfo(true);
        }
    };

    // Enhanced support contact with better options
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
                        // In a real app, this would open a chat interface
                        router.push('/(modals)/support-chat');
                    }
                },
                {
                    text: 'Email Support',
                    onPress: () => {
                        const subject = `Order Support - ${orderDetails?.orderNumber}`;
                        const body = `Order Number: ${orderDetails?.orderNumber}\nOrder Date: ${orderDetails ? format(orderDetails.createdAt, 'MMM dd, yyyy') : ''}\nTotal: $${orderDetails?.total.toFixed(2)}\n\nHow can we help you?\n\n`;
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

   // Enhanced status display functions
   const getStatusColor = (status: string) => {
       switch (status) {
           case 'confirmed': return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
           case 'processing': return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
           case 'shipped': return { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' };
           case 'delivered': return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
           default: return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
       }
   };

   const getStatusIcon = (status: string) => {
       switch (status) {
           case 'confirmed': return 'checkmark-circle';
           case 'processing': return 'time';
           case 'shipped': return 'car';
           case 'delivered': return 'home';
           default: return 'ellipse';
       }
   };

   // Enhanced image source handling
   const getImageSource = (image: any) => {
       try {
           // Handle require() results
           if (typeof image === 'object' && image.default) {
               return image;
           }

           // Handle URI objects
           if (typeof image === 'object' && image.uri) {
               return image;
           }

           // Handle string/number IDs
           if (typeof image === 'string' || typeof image === 'number') {
               return getImageById(image, 'medium');
           }

           // Direct image object
           if (typeof image === 'object') {
               return image;
           }

           // Fallback
           return getImageById(1, 'medium');
       } catch (error) {
           console.warn('Error loading image:', error);
           return getImageById(1, 'medium');
       }
   };

   // Enhanced variant text extraction
   const getVariantText = (item: OrderItem): string => {
       const variants: string[] = [];

       // Direct properties
       if (item.color) variants.push(`Color: ${item.color}`);
       if (item.size) variants.push(`Size: ${item.size}`);

       // Complex variant objects
       const processVariantObject = (variantObj: any, prefix = '') => {
           if (!variantObj || typeof variantObj !== 'object') return;

           Object.entries(variantObj).forEach(([key, value]: [string, any]) => {
               if (value && typeof value === 'object' && value.value) {
                   const displayKey = prefix ? `${prefix} ${key}` : key;
                   const variantString = `${displayKey}: ${value.value}`;
                   if (!variants.some(v => v.includes(value.value))) {
                       variants.push(variantString);
                   }
               } else if (value && typeof value === 'string') {
                   const displayKey = prefix ? `${prefix} ${key}` : key;
                   const variantString = `${displayKey}: ${value}`;
                   if (!variants.some(v => v.includes(value))) {
                       variants.push(variantString);
                   }
               }
           });
       };

       if (item.variant) processVariantObject(item.variant);
       if (item.selectedVariants) processVariantObject(item.selectedVariants, 'Selected');

       return variants.join(', ');
   };

   // Loading state
   if (isLoading) {
       return (
           <SafeAreaView style={styles.loadingContainer}>
               <ActivityIndicator size="large" color="#0071CE" />
               <Text style={styles.loadingText}>
                   {isSavingOrder ? 'Creating your order...' : 'Loading order confirmation...'}
               </Text>
               {isSavingOrder && (
                   <Text style={[styles.loadingText, { marginTop: 8, fontSize: 14, color: '#9CA3AF' }]}>
                       Please wait while we process your order
                   </Text>
               )}
           </SafeAreaView>
       );
   }

   // Error state
   if (!orderDetails) {
       return (
           <SafeAreaView style={styles.container}>
               <View style={styles.errorContainer}>
                   <Ionicons name="alert-circle" size={64} color="#DC2626" />
                   <Text style={styles.errorText}>Unable to load order details</Text>
                   <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
                       There was a problem loading your order confirmation. Please try again.
                   </Text>
                   <TouchableOpacity
                       style={styles.retryButton}
                       onPress={() => {
                           setIsLoading(true);
                           loadOrderDetails();
                       }}
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
                   <Text style={styles.headerTitle}>
                       Order Confirmed
                   </Text>
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
                       <Text style={styles.successTitle}>
                           Order Confirmed!
                       </Text>
                       <Text style={styles.successSubtitle}>
                           Thank you for your purchase. We'll send you shipping updates via email and SMS.
                       </Text>
                       <View style={styles.orderNumberCard}>
                           <Text style={styles.orderNumberLabel}>Order Number</Text>
                           <Text style={styles.orderNumber}>
                               {orderDetails.orderNumber}
                           </Text>
                           <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>
                               Order placed on {format(orderDetails.createdAt, 'MMM dd, yyyy')}
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
                                   backgroundColor: getStatusColor(orderDetails.status).bg,
                                   borderWidth: 1,
                                   borderColor: getStatusColor(orderDetails.status).border,
                               }
                           ]}>
                               <View style={styles.statusContent}>
                                   <Ionicons
                                       name={getStatusIcon(orderDetails.status) as any}
                                       size={16}
                                       color={getStatusColor(orderDetails.status).text}
                                   />
                                   <Text style={[
                                       styles.statusText,
                                       { color: getStatusColor(orderDetails.status).text }
                                   ]}>
                                       {orderDetails.status}
                                   </Text>
                               </View>
                           </View>
                       </View>

                       <View style={styles.deliveryInfo}>
                           <View style={styles.deliveryRow}>
                               <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
                               <Text style={styles.deliveryValue}>
                                   {format(orderDetails.estimatedDelivery, 'EEEE, MMMM do')}
                               </Text>
                           </View>
                           <View style={styles.deliveryRow}>
                               <Text style={styles.deliveryLabel}>Delivery Time</Text>
                               <Text style={styles.deliveryTime}>9:00 AM - 6:00 PM</Text>
                           </View>
                           {orderDetails.trackingNumber && (
                               <View style={styles.deliveryRow}>
                                   <Text style={styles.deliveryLabel}>Tracking Number</Text>
                                   <TouchableOpacity onPress={handleTrackOrder} activeOpacity={0.7}>
                                       <Text style={[styles.deliveryValue, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                                           {orderDetails.trackingNumber}
                                       </Text>
                                   </TouchableOpacity>
                               </View>
                           )}
                           {orderDetails.shipping === 0 && (
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
                               <Text style={styles.trackActionText}>
                                   Track Order
                               </Text>
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
                               <Text style={styles.calendarActionText}>
                                   Add to Calendar
                               </Text>
                           </TouchableOpacity>

                           <TouchableOpacity
                               style={[styles.actionCard, styles.supportAction]}
                               onPress={handleContactSupport}
                               activeOpacity={0.8}
                           >
                               <Ionicons name="headset" size={24} color="#EA580C" />
                               <Text style={styles.supportActionText}>
                                   Support
                               </Text>
                           </TouchableOpacity>
                       </View>
                   </View>

                   {/* Order Items */}
                   <View style={styles.section}>
                       <Text style={styles.sectionTitle}>
                           Order Items ({orderDetails.items.length})
                       </Text>
                       {orderDetails.items.map((item, index) => (
                           <View key={item.id} style={[
                               styles.orderItem,
                               index === orderDetails.items.length - 1 && styles.lastOrderItem
                           ]}>
                               <Image
                                   source={getImageSource(item.image)}
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
                                       Sold by {item.seller}
                                   </Text>
                                   <Text style={styles.itemQuantity}>
                                       Qty: {item.quantity}
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
                                   {item.originalPrice && item.originalPrice > item.price && (
                                       <Text style={styles.itemSavings}>
                                           Save ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
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
                                   {orderDetails.shippingAddress.name}
                               </Text>
                           </View>
                           <Text style={styles.addressStreet}>
                               {orderDetails.shippingAddress.street}
                           </Text>
                           <Text style={styles.addressCity}>
                               {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                           </Text>
                       </View>
                   </View>

                   {/* Order Summary */}
                   <View style={styles.section}>
                       <Text style={styles.sectionTitle}>Order Summary</Text>
                       <View style={styles.summaryContainer}>
                           <View style={styles.summaryRow}>
                               <Text style={styles.summaryLabel}>Subtotal</Text>
                               <Text style={styles.summaryValue}>${orderDetails.subtotal.toFixed(2)}</Text>
                           </View>
                           <View style={styles.summaryRow}>
                               <Text style={styles.summaryLabel}>Shipping</Text>
                               <Text style={[
                                   styles.summaryValue,
                                   orderDetails.shipping === 0 && { color: '#10B981' }
                               ]}>
                                   {orderDetails.shipping === 0 ? 'Free' : `$${orderDetails.shipping.toFixed(2)}`}
                               </Text>
                           </View>
                           <View style={styles.summaryRow}>
                               <Text style={styles.summaryLabel}>Tax</Text>
                               <Text style={styles.summaryValue}>${orderDetails.tax.toFixed(2)}</Text>
                           </View>
                           {orderDetails.discount > 0 && (
                               <View style={styles.summaryRow}>
                                   <Text style={styles.discountLabel}>Total Savings</Text>
                                   <Text style={styles.discountValue}>-${orderDetails.discount.toFixed(2)}</Text>
                               </View>
                           )}
                           <View style={styles.totalRow}>
                               <View style={styles.totalContainer}>
                                   <Text style={styles.totalLabel}>Total</Text>
                                   <Text style={styles.totalValue}>
                                       ${orderDetails.total.toFixed(2)}
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
                                   {orderDetails.paymentMethod}
                               </Text>
                               <Text style={styles.paymentStatus}>
                                   Payment Successful
                               </Text>
                           </View>
                           <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                       </View>
                   </View>

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
                                   {format(orderDetails.createdAt, 'MMM dd, yyyy')}
                               </Text>
                           </View>
                           <View style={styles.orderDetailRow}>
                               <Text style={styles.orderDetailLabel}>Order Number</Text>
                               <Text style={styles.orderDetailValue}>
                                   {orderDetails.orderNumber}
                               </Text>
                           </View>
                           {orderDetails.trackingNumber && (
                               <View style={styles.orderDetailRow}>
                                   <Text style={styles.orderDetailLabel}>Tracking Number</Text>
                                   <TouchableOpacity
                                       onPress={handleTrackOrder}
                                       activeOpacity={0.7}
                                   >
                                       <Text style={styles.trackingNumberLink}>
                                           {orderDetails.trackingNumber}
                                       </Text>
                                   </TouchableOpacity>
                               </View>
                           )}
                           <View style={styles.orderDetailRow}>
                               <Text style={styles.orderDetailLabel}>Total Items</Text>
                               <Text style={styles.orderDetailValue}>
                                   {orderDetails.items.reduce((sum, item) => sum + item.quantity, 0)} item{orderDetails.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
                               </Text>
                           </View>
                           <View style={styles.orderDetailRow}>
                               <Text style={styles.orderDetailLabel}>Payment Status</Text>
                               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                   <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
                                   <Text style={[styles.orderDetailValue, { color: '#10B981' }]}>Paid</Text>
                               </View>
                           </View>
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
                           <Text style={styles.trackingTitle}>
                               Tracking Information
                           </Text>
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
                            
                            
                            const styles = StyleSheet.create({
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
   discountLabel: {
       color: '#059669',
       fontSize: 16,
       fontWeight: '600',
       letterSpacing: 0.3,
   },
   discountValue: {
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

   // Tracking Timeline - Enhanced Walmart Theme
   trackingTimeline: {
       marginBottom: 36,
   },
   timelineItem: {
       flexDirection: 'row',
       alignItems: 'center',
       marginBottom: 20,
   },
   timelineIconActive: {
       width: 36,
       height: 36,
       borderRadius: 18,
       backgroundColor: '#10B981',
       alignItems: 'center',
       justifyContent: 'center',
       marginRight: 18,
       shadowColor: '#10B981',
       shadowOffset: { width: 0, height: 3 },
       shadowOpacity: 0.3,
       shadowRadius: 6,
       elevation: 4,
       borderWidth: 2,
       borderColor: '#FFFFFF',
   },
   timelineIconInactive: {
       width: 36,
       height: 36,
       borderRadius: 18,
       backgroundColor: '#F3F4F6',
       alignItems: 'center',
       justifyContent: 'center',
       marginRight: 18,
       borderWidth: 2,
       borderColor: '#E5E7EB',
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