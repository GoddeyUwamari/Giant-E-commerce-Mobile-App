import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚀 UPDATED: Import real data systems and payment form
import { useCartStore } from '../../store/slices/cartSlice';
import { getImageById } from '../../assets/images/imageLoader';
import { getProductById } from '../../constants/products';
import PaymentForm from '../../components/forms/PaymentForm';

const { width } = Dimensions.get('window');

interface Address {
    id: string;
    type: 'home' | 'work' | 'other';
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'gift_card';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    displayName?: string;
    nickname?: string;
}

// 🚀 UPDATED: Enhanced mock data with better structure
const mockAddresses: Address[] = [
    {
        id: '1',
        type: 'home',
        name: 'John Doe',
        street: '123 Main St, Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        isDefault: true,
    },
    {
        id: '2',
        type: 'work',
        name: 'John Doe',
        street: '456 Business Ave, Suite 200',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        isDefault: false,
    },
    {
        id: '3',
        type: 'other',
        name: 'Jane Doe',
        street: '789 Oak Street',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        isDefault: false,
    },
];

export default function CheckoutPage(): JSX.Element {
    // 🚀 UPDATED: Enhanced Zustand store integration with payment state
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
    const appliedPromoCodes = useCartStore((state) => state.appliedPromoCodes || []);
    const error = useCartStore((state) => state.error || '');
    const paymentError = useCartStore((state) => state.paymentError || '');
    const isCalculatingPayment = useCartStore((state) => state.isCalculatingPayment || false);
    const deliveryAddress = useCartStore((state) => state.deliveryAddress);
    const paymentIntent = useCartStore((state) => state.paymentIntent);

    // Actions
    const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const applyPromoCode = useCartStore((state) => state.applyPromoCode);
    const removePromoCode = useCartStore((state) => state.removePromoCode);
    const clearError = useCartStore((state) => state.clearError);
    const clearPaymentError = useCartStore((state) => state.clearPaymentError);
    const calculateSummary = useCartStore((state) => state.calculateSummary);
    const setDeliveryAddress = useCartStore((state) => state.setDeliveryAddress);
    const createPaymentIntent = useCartStore((state) => state.createPaymentIntent);

    const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // 🚀 NEW: Payment modal state
    const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        loadCheckoutData();

        // Recalculate summary when component mounts
        calculateSummary();

        // Start entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [calculateSummary]);

    // 🚀 UPDATED: Enhanced data loading with payment methods integration
    const loadCheckoutData = async () => {
        try {
            // Load saved addresses and payment methods
            const [savedAddresses, savedPayments, savedSelectedAddress, savedSelectedPayment] = await Promise.all([
                AsyncStorage.getItem('user_addresses'),
                AsyncStorage.getItem('payment_methods'),
                AsyncStorage.getItem('selected_shipping_address'),
                AsyncStorage.getItem('selected_payment_method'),
            ]);

            // Process addresses
            if (savedAddresses) {
                const parsedAddresses = JSON.parse(savedAddresses);
                setAddresses(parsedAddresses);

                if (savedSelectedAddress) {
                    const selectedAddr = JSON.parse(savedSelectedAddress);
                    setSelectedAddress(selectedAddr);

                    // Update cart store with selected address
                    await setDeliveryAddress({
                        id: selectedAddr.id,
                        name: selectedAddr.name,
                        street: selectedAddr.street,
                        apartment: '',
                        city: selectedAddr.city,
                        state: selectedAddr.state,
                        zipCode: selectedAddr.zipCode,
                        country: 'US',
                        isDefault: selectedAddr.isDefault,
                    });
                } else {
                    const defaultAddr = parsedAddresses.find((addr: Address) => addr.isDefault) || parsedAddresses[0];
                    setSelectedAddress(defaultAddr);

                    if (defaultAddr) {
                        await setDeliveryAddress({
                            id: defaultAddr.id,
                            name: defaultAddr.name,
                            street: defaultAddr.street,
                            apartment: '',
                            city: defaultAddr.city,
                            state: defaultAddr.state,
                            zipCode: defaultAddr.zipCode,
                            country: 'US',
                            isDefault: defaultAddr.isDefault,
                        });
                    }
                }
            } else {
                setAddresses(mockAddresses);
                setSelectedAddress(mockAddresses[0]);

                // Set default address in cart store
                await setDeliveryAddress({
                    id: mockAddresses[0].id,
                    name: mockAddresses[0].name,
                    street: mockAddresses[0].street,
                    apartment: '',
                    city: mockAddresses[0].city,
                    state: mockAddresses[0].state,
                    zipCode: mockAddresses[0].zipCode,
                    country: 'US',
                    isDefault: mockAddresses[0].isDefault,
                });
            }

            // Process payment methods
            if (savedPayments) {
                const parsedPayments = JSON.parse(savedPayments);
                setPaymentMethods(parsedPayments);

                if (savedSelectedPayment) {
                    const selectedPay = JSON.parse(savedSelectedPayment);
                    setSelectedPayment(selectedPay);
                } else {
                    const defaultPayment = parsedPayments.find((payment: PaymentMethod) => payment.isDefault) || parsedPayments[0];
                    setSelectedPayment(defaultPayment);
                }
            } else {
                // If no saved payment methods, user needs to add one
                setPaymentMethods([]);
                setSelectedPayment(null);
            }
        } catch (error) {
            console.error('Error loading checkout data:', error);
            // Fallback to mock data
            setAddresses(mockAddresses);
            setSelectedAddress(mockAddresses[0]);
            setPaymentMethods([]);
            setSelectedPayment(null);

            // Set fallback address in cart store
            await setDeliveryAddress({
                id: mockAddresses[0].id,
                name: mockAddresses[0].name,
                street: mockAddresses[0].street,
                apartment: '',
                city: mockAddresses[0].city,
                state: mockAddresses[0].state,
                zipCode: mockAddresses[0].zipCode,
                country: 'US',
                isDefault: mockAddresses[0].isDefault,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 🚀 NEW: Handle payment method saved callback
    const handlePaymentMethodSaved = async (paymentMethod: PaymentMethod) => {
        try {
            // Update payment methods list
            const updatedMethods = [...paymentMethods, paymentMethod];
            setPaymentMethods(updatedMethods);
            setSelectedPayment(paymentMethod);

            // Save to AsyncStorage
            await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));
            await AsyncStorage.setItem('selected_payment_method', JSON.stringify(paymentMethod));

            // Close modal
            setShowAddPaymentForm(false);

            // Show success message
            Alert.alert('Success', 'Payment method added successfully!');
        } catch (error) {
            console.error('Error saving payment method:', error);
            Alert.alert('Error', 'Failed to save payment method. Please try again.');
        }
    };

    // 🚀 UPDATED: Enhanced promo code handling
    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) return;

        setIsApplyingPromo(true);
        try {
            const success = await applyPromoCode(promoCode.trim().toUpperCase());
            if (success) {
                setPromoCode('');
                // Show success feedback
                Alert.alert('Success', 'Promo code applied successfully!');
            }
        } catch (error) {
            console.error('Error applying promo code:', error);
            Alert.alert('Error', 'Failed to apply promo code. Please try again.');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleRemovePromoCode = async (code: string) => {
        try {
            await removePromoCode(code);
        } catch (error) {
            console.error('Error removing promo code:', error);
            Alert.alert('Error', 'Failed to remove promo code. Please try again.');
        }
    };

    const handleRemoveItem = (itemId: string) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeItem(itemId);
                        } catch (error) {
                            console.error('Error removing item:', error);
                            Alert.alert('Error', 'Failed to remove item. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }

        try {
            await updateItemQuantity(itemId, newQuantity);
        } catch (error) {
            console.error('Error updating quantity:', error);
            Alert.alert('Error', 'Failed to update quantity. Please try again.');
        }
    };

    // 🚀 UPDATED: Enhanced checkout validation and payment intent preparation
    const handleProceedToPayment = async () => {
        // Clear any previous errors
        clearError();
        clearPaymentError();

        // Validate delivery address
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        // 🚀 FIXED: Use modal instead of navigation for payment method
        if (!selectedPayment) {
            Alert.alert(
                'Add Payment Method',
                'You need to add a payment method to continue.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Add Payment Method',
                        onPress: () => setShowAddPaymentForm(true)
                    }
                ]
            );
            return;
        }

        // Check for out of stock items
        const outOfStockItems = cartItems.filter(item =>
            item.status === 'out_of_stock' ||
            item.status === 'discontinued' ||
            item.status === 'unavailable'
        );

        if (outOfStockItems.length > 0) {
            Alert.alert(
                'Items Out of Stock',
                `${outOfStockItems.length} item(s) in your cart are out of stock. Please remove them to continue.`,
                [{ text: 'OK' }]
            );
            return;
        }

        // Check if cart is empty
        if (cartItems.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        setIsProcessing(true);
        try {
            // Ensure payment intent is created/updated
            if (!paymentIntent) {
                console.log('Creating payment intent...');
                const intent = await createPaymentIntent({
                    forSetupOnly: false,
                    skipAddressValidation: false
                });

                if (!intent) {
                    Alert.alert(
                        'Payment Setup Failed',
                        'Unable to prepare payment. Please check your delivery address and try again.'
                    );
                    return;
                }
            }

            // Save selected address and payment method for payment screen
            await AsyncStorage.setItem('selected_shipping_address', JSON.stringify(selectedAddress));
            await AsyncStorage.setItem('selected_payment_method', JSON.stringify(selectedPayment));

            // Navigate to payment processing
            router.push('/checkout/payment');
        } catch (error) {
            console.error('Error proceeding to payment:', error);
            Alert.alert('Error', 'Failed to proceed to payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // 🚀 UPDATED: Enhanced payment method display
    const getPaymentMethodIcon = (method: PaymentMethod): string => {
        switch (method.type) {
            case 'card':
                return 'card';
            case 'paypal':
                return 'logo-paypal';
            case 'apple_pay':
                return 'logo-apple';
            case 'google_pay':
                return 'logo-google';
            case 'gift_card':
                return 'gift';
            default:
                return 'card';
        }
    };

    const getPaymentMethodDisplayName = (method: PaymentMethod): string => {
        if (method.nickname) return method.nickname;
        if (method.displayName) return method.displayName;

        switch (method.type) {
            case 'card':
                return `${method.brand} •••• ${method.last4}`;
            case 'paypal':
                return 'PayPal';
            case 'apple_pay':
                return 'Apple Pay';
            case 'google_pay':
                return 'Google Pay';
            case 'gift_card':
                return 'Gift Card';
            default:
                return 'Payment Method';
        }
    };

    // 🚀 UPDATED: Enhanced image source handling using your image system
    const getImageSource = (item: any) => {
        try {
            // Priority 1: Try using productId with image loader
            if (item.productId) {
                try {
                    return getImageById(item.productId, 'medium');
                } catch (error) {
                    console.log('Could not load image from productId:', item.productId);
                }
            }

            // Priority 2: Try to get product data and use its primary image
            if (item.productId) {
                try {
                    const product = getProductById(item.productId);
                    if (product && product.primaryImage) {
                        return product.primaryImage;
                    }
                } catch (error) {
                    console.log('Could not load product data:', item.productId);
                }
            }

            // Priority 3: Handle existing image property from cart
            if (item.image) {
                // If it's already a require() object, return it
                if (typeof item.image === 'object' && !item.image.uri) {
                    return item.image;
                }

                // If it's a URI string, create URI object
                if (typeof item.image === 'string') {
                    if (item.image.startsWith('http') || item.image.startsWith('https')) {
                        return { uri: item.image };
                    }
                }

                return item.image;
            }

            // Priority 4: Try using item ID as fallback
            if (item.id) {
                try {
                    return getImageById(item.id, 'medium');
                } catch (error) {
                    console.log('Could not load image from item ID:', item.id);
                }
            }

            // Final fallback: Use default image
            return getImageById(1, 'medium');

        } catch (error) {
            console.error('Error in getImageSource:', error);
            return getImageById(1, 'medium');
        }
    };

    // 🚀 UPDATED: Enhanced variant value extraction
    const getVariantText = (variant: any): string => {
        if (!variant) return '';

        try {
            // Handle string values
            if (typeof variant === 'string') {
                return variant;
            }

            // Handle object with value property
            if (typeof variant === 'object' && variant.value) {
                return String(variant.value);
            }

            // Handle object with name property
            if (typeof variant === 'object' && variant.name) {
                return String(variant.name);
            }

            // Handle arrays (multiple variants)
            if (Array.isArray(variant)) {
                return variant
                    .map(v => getVariantText(v))
                    .filter(text => text)
                    .join(', ');
            }

            return '';
        } catch (error) {
            console.error('Error extracting variant text:', error);
            return '';
        }
    };

    // 🚀 NEW: Get enhanced product information
    const getEnhancedItemInfo = (item: any) => {
        try {
            const product = getProductById(item.productId);
            return {
                ...item,
                brand: item.brand || product?.brand,
                category: item.category || product?.category,
                seller: item.storeName || product?.seller || 'Walmart',
                originalPrice: item.originalPrice || product?.originalPrice,
                maxQuantity: item.maxQuantity || product?.maxQuantity || 10,
                minQuantity: item.minQuantity || product?.minQuantity || 1,
            };
        } catch (error) {
            console.error('Error getting enhanced item info:', error);
            return item;
        }
    };

    // 🚀 NEW: Get delivery estimate
    const getDeliveryEstimate = () => {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + (summary.shipping === 0 ? 2 : 5));

        return deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0071CE" />
                <Text style={styles.loadingText}>Loading checkout...</Text>
            </SafeAreaView>
        );
    }

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <Ionicons name="bag-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>
                    Your cart is empty
                </Text>
                <Text style={styles.emptySubtitle}>
                    Add some items to get started
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/(tabs)')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.emptyButtonText}>Continue Shopping</Text>
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
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Review Order
                    </Text>
                    <View style={styles.progressIndicator}>
                        <View style={styles.progressStep}>
                            <View style={styles.progressStepActive}>
                                <Ionicons name="checkmark" size={12} color="white" />
                            </View>
                            <Text style={styles.progressStepText}>Cart</Text>
                        </View>
                        <View style={styles.progressLine} />
                        <View style={styles.progressStep}>
                            <View style={styles.progressStepActive}>
                                <Text style={styles.progressStepNumber}>2</Text>
                            </View>
                            <Text style={styles.progressStepText}>Review</Text>
                        </View>
                        <View style={styles.progressLine} />
                        <View style={styles.progressStep}>
                            <View style={styles.progressStepInactive}>
                                <Text style={styles.progressStepNumberInactive}>3</Text>
                            </View>
                            <Text style={styles.progressStepTextInactive}>Payment</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Error Display */}
            {(error || paymentError) && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || paymentError}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            clearError();
                            clearPaymentError();
                        }}
                        style={styles.errorCloseButton}
                    >
                        <Ionicons name="close" size={16} color="#EF4444"/>
                    </TouchableOpacity>
                </View>
            )}

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* 🚀 UPDATED: Enhanced Cart Items with better data handling */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Order Items ({cartItems.length})
                        </Text>
                        {cartItems.map((item, index) => {
                            const enhancedItem = getEnhancedItemInfo(item);

                            // Extract variant information
                            const colorText = getVariantText(item.variant?.color || item.selectedVariants?.color);
                            const sizeText = getVariantText(item.variant?.size || item.selectedVariants?.size);
                            const styleText = getVariantText(item.variant?.style || item.selectedVariants?.style);

                            return (
                                <View key={item.id} style={[
                                    styles.cartItem,
                                    index === cartItems.length - 1 && styles.lastCartItem
                                ]}>
                                    <Image
                                        source={getImageSource(item)}
                                        style={styles.itemImage}
                                        resizeMode="cover"
                                        onError={() => {
                                            console.log('Image failed to load for item:', item.id);
                                        }}
                                    />
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName} numberOfLines={2}>
                                            {enhancedItem.name}
                                        </Text>

                                        {enhancedItem.brand && (
                                            <Text style={styles.itemBrand}>
                                                by {enhancedItem.brand}
                                            </Text>
                                        )}

                                        {/* Enhanced variant display */}
                                        {colorText && (
                                            <Text style={styles.itemAttribute}>
                                                Color: {colorText}
                                            </Text>
                                        )}
                                        {sizeText && (
                                            <Text style={styles.itemAttribute}>
                                                Size: {sizeText}
                                            </Text>
                                        )}
                                        {styleText && (
                                            <Text style={styles.itemAttribute}>
                                                Style: {styleText}
                                            </Text>
                                        )}

                                        <Text style={styles.itemSeller}>
                                            Sold by {enhancedItem.seller}
                                        </Text>

                                        {/* Enhanced stock status */}
                                        {item.status === 'out_of_stock' ||
                                        item.status === 'discontinued' ||
                                        item.status === 'unavailable' ? (
                                            <View style={styles.stockBadge}>
                                                <Ionicons name="close-circle" size={14} color="#DC2626" />
                                                <Text style={styles.outOfStock}>
                                                    {item.status === 'discontinued' ? 'Discontinued' : 'Out of stock'}
                                                </Text>
                                            </View>
                                        ) : item.status === 'limited_stock' ? (
                                            <View style={styles.stockBadge}>
                                                <Ionicons name="warning" size={14} color="#F59E0B" />
                                                <Text style={styles.limitedStock}>
                                                    Limited stock
                                                </Text>
                                            </View>
                                        ) : (
                                            <View style={styles.stockBadge}>
                                                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                                <Text style={styles.inStock}>
                                                    In stock
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.itemActions}>
                                        <View style={styles.priceContainer}>
                                            <Text style={styles.itemPrice}>
                                                ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                                            </Text>
                                            {enhancedItem.originalPrice && enhancedItem.originalPrice > (item.salePrice || item.price) && (
                                                <Text style={styles.originalPrice}>
                                                    ${(enhancedItem.originalPrice * item.quantity).toFixed(2)}
                                                </Text>
                                            )}
                                            {enhancedItem.originalPrice && enhancedItem.originalPrice > (item.salePrice || item.price) && (
                                                <Text style={styles.savingsText}>
                                                    Save ${((enhancedItem.originalPrice - (item.salePrice || item.price)) * item.quantity).toFixed(2)}
                                                </Text>
                                            )}
                                        </View>

                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.quantityButton,
                                                    item.quantity <= enhancedItem.minQuantity && styles.quantityButtonDisabled
                                                ]}
                                                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                activeOpacity={0.7}
                                                disabled={item.quantity <= enhancedItem.minQuantity}
                                            >
                                                <Ionicons
                                                    name="remove"
                                                    size={16}
                                                    color={item.quantity <= enhancedItem.minQuantity ? "#D1D5DB" : "#374151"}
                                                />
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={[
                                                    styles.quantityButton,
                                                    item.quantity >= enhancedItem.maxQuantity && styles.quantityButtonDisabled
                                                ]}
                                                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                activeOpacity={0.7}
                                                disabled={item.quantity >= enhancedItem.maxQuantity}
                                            >
                                                <Ionicons
                                                    name="add"
                                                    size={16}
                                                    color={item.quantity >= enhancedItem.maxQuantity ? "#D1D5DB" : "#374151"}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => handleRemoveItem(item.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                                            <Text style={styles.removeButtonText}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Continue Shopping */}
                        <TouchableOpacity
                            style={styles.continueShoppingButton}
                            onPress={() => router.push('/(tabs)')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#0071CE" />
                            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 🚀 UPDATED: Enhanced Delivery Information */}
                    <View style={styles.section}>
                        <View style={styles.deliveryInfoHeader}>
                            <Ionicons name="truck-outline" size={20} color="#0071CE" />
                            <Text style={styles.deliveryInfoTitle}>Delivery Information</Text>
                        </View>
                        <View style={styles.deliveryInfoCard}>
                            <Text style={styles.deliveryEstimate}>
                                Estimated delivery: {getDeliveryEstimate()}
                            </Text>
                            {summary.shipping === 0 ? (
                                <View style={styles.freeShippingBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                    <Text style={styles.freeShippingText}>Free shipping included</Text>
                                </View>
                            ) : (
                                <Text style={styles.shippingInfo}>
                                    Shipping: ${summary.shipping.toFixed(2)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Delivery Address
                            </Text>
                            {/* 🚀 REMOVED: Broken shipping page navigation */}
                        </View>
                        {selectedAddress && (
                            <View style={styles.addressCard}>
                                <View style={styles.addressIcon}>
                                    <Ionicons
                                        name={selectedAddress.type === 'home' ? 'home' : selectedAddress.type === 'work' ? 'business' : 'location'}
                                        size={16}
                                        color="#0071CE"
                                    />
                                </View>
                                <View style={styles.addressDetails}>
                                    <View style={styles.addressHeader}>
                                        <Text style={styles.addressName}>
                                            {selectedAddress.name}
                                        </Text>
                                        {selectedAddress.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.addressStreet}>
                                        {selectedAddress.street}
                                    </Text>
                                    <Text style={styles.addressCity}>
                                        {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Applied Promo Codes */}
                    {appliedPromoCodes.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Applied Offers</Text>
                            {appliedPromoCodes.map((promo) => (
                                <View key={promo.code} style={styles.appliedPromoContainer}>
                                    <View style={styles.appliedPromoLeft}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                        <View style={styles.promoInfo}>
                                            <Text style={styles.appliedPromoText}>
                                                {promo.code}
                                            </Text>
                                            <Text style={styles.promoDescription}>
                                                {promo.description}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRemovePromoCode(promo.code)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.removePromoText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Promo Code Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Add Promo Code
                        </Text>
                        <View style={styles.promoContainer}>
                            <TextInput
                                style={styles.promoInput}
                                placeholder="Enter promo code"
                                value={promoCode}
                                onChangeText={setPromoCode}
                                autoCapitalize="characters"
                                placeholderTextColor="#9CA3AF"
                                returnKeyType="done"
                                onSubmitEditing={handleApplyPromoCode}
                                editable={!isApplyingPromo}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.promoButton,
                                    (!promoCode.trim() || isApplyingPromo) && styles.promoButtonDisabled
                                ]}
                                onPress={handleApplyPromoCode}
                                disabled={!promoCode.trim() || isApplyingPromo}
                                activeOpacity={0.8}
                            >
                                {isApplyingPromo ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.promoButtonText}>Apply</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Suggested Promo Codes */}
                        <View style={styles.suggestedPromos}>
                            <Text style={styles.suggestedPromosTitle}>Popular offers</Text>
                            <View style={styles.suggestedPromosList}>
                                <TouchableOpacity
                                    style={styles.suggestedPromoChip}
                                    onPress={() => setPromoCode('SAVE10')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.suggestedPromoText}>SAVE10</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.suggestedPromoChip}
                                    onPress={() => setPromoCode('FREESHIP')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.suggestedPromoText}>FREESHIP</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.suggestedPromoChip}
                                    onPress={() => setPromoCode('WELCOME20')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.suggestedPromoText}>WELCOME20</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* 🚀 UPDATED: Enhanced Order Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Order Summary
                        </Text>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>
                                    Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
                                </Text>
                                <Text style={styles.summaryValue}>${summary.subtotal.toFixed(2)}</Text>
                            </View>

                            {summary.savings > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.discountLabel}>Item Savings</Text>
                                    <Text style={styles.discountValue}>-${summary.savings.toFixed(2)}</Text>
                                </View>
                            )}

                            {summary.discounts > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.discountLabel}>Promo Discounts</Text>
                                    <Text style={styles.discountValue}>-${summary.discounts.toFixed(2)}</Text>
                                </View>
                            )}

                            <View style={styles.summaryRow}>
                                <View style={styles.shippingLabelContainer}>
                                    <Text style={styles.summaryLabel}>
                                        {summary.shipping > 0 || summary.delivery > 0 ? 'Shipping & Delivery' : 'Delivery'}
                                    </Text>
                                    {((summary.shipping || 0) + (summary.delivery || 0)) === 0 && (
                                        <Text style={styles.freeShippingNote}>(Free over $35)</Text>
                                    )}
                                </View>
                                <Text style={[
                                    styles.summaryValue,
                                    ((summary.shipping || 0) + (summary.delivery || 0)) === 0 && styles.freeShippingValue
                                ]}>
                                    {((summary.shipping || 0) + (summary.delivery || 0)) === 0
                                        ? 'FREE'
                                        : `${((summary.shipping || 0) + (summary.delivery || 0)).toFixed(2)}`
                                    }
                                </Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <View style={styles.taxLabelContainer}>
                                    <Text style={styles.summaryLabel}>Estimated Tax</Text>
                                    <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                                </View>
                                <Text style={styles.summaryValue}>${summary.tax.toFixed(2)}</Text>
                            </View>

                            {(summary.savings > 0 || summary.discounts > 0) && (
                                <View style={styles.totalSavingsRow}>
                                    <Text style={styles.totalSavingsLabel}>Total Savings</Text>
                                    <Text style={styles.totalSavingsValue}>
                                        -${(summary.savings + summary.discounts).toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.totalRow}>
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>
                                        ${summary.total.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 🚀 UPDATED: Enhanced Payment Method Selection with Modal */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Payment Method
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowAddPaymentForm(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.changeButton}>
                                    {selectedPayment ? 'Change' : 'Add'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {selectedPayment ? (
                            <View style={styles.paymentCard}>
                                <View style={styles.paymentIcon}>
                                    <Ionicons
                                        name={getPaymentMethodIcon(selectedPayment)}
                                        size={16}
                                        color="#ffffff"
                                    />
                                </View>
                                <View style={styles.paymentDetails}>
                                    <View style={styles.paymentHeader}>
                                        <Text style={styles.paymentName}>
                                            {getPaymentMethodDisplayName(selectedPayment)}
                                        </Text>
                                        {selectedPayment.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    {selectedPayment.type === 'card' && selectedPayment.expiryMonth && selectedPayment.expiryYear && (
                                        <Text style={styles.paymentExpiry}>
                                            Expires {selectedPayment.expiryMonth.toString().padStart(2, '0')}/{selectedPayment.expiryYear}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addPaymentCard}
                                onPress={() => setShowAddPaymentForm(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.addPaymentIcon}>
                                    <Ionicons name="add" size={24} color="#0071CE" />
                                </View>
                                <View style={styles.addPaymentContent}>
                                    <Text style={styles.addPaymentTitle}>Add Payment Method</Text>
                                    <Text style={styles.addPaymentSubtitle}>
                                        Credit card, PayPal, Apple Pay, or Google Pay
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Payment Status */}
                    {isCalculatingPayment && (
                        <View style={styles.section}>
                            <View style={styles.paymentStatusCard}>
                                <ActivityIndicator size="small" color="#0071CE" />
                                <Text style={styles.paymentStatusText}>
                                    Preparing payment...
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Security Notice */}
                    <View style={styles.securityNotice}>
                        <View style={styles.securityHeader}>
                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                            <Text style={styles.securityTitle}>Secure Checkout</Text>
                        </View>
                        <Text style={styles.securityText}>
                            Your payment information is encrypted and secure. We never store your card details.
                        </Text>
                        <View style={styles.securityFeatures}>
                            <View style={styles.securityFeature}>
                                <Ionicons name="lock-closed" size={14} color="#059669" />
                                <Text style={styles.securityFeatureText}>256-bit SSL encryption</Text>
                            </View>
                            <View style={styles.securityFeature}>
                                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                                <Text style={styles.securityFeatureText}>PCI DSS compliant</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* 🚀 UPDATED: Enhanced Bottom Action */}
            <View style={styles.bottomAction}>
                <View style={styles.bottomSummary}>
                    <View style={styles.bottomSummaryLeft}>
                        <Text style={styles.bottomTotalLabel}>Total</Text>
                        <Text style={styles.bottomItemCount}>
                            {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
                        </Text>
                    </View>
                    <Text style={styles.bottomTotalValue}>
                        ${summary.total.toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        (isProcessing || isCalculatingPayment) && styles.proceedButtonDisabled
                    ]}
                    onPress={handleProceedToPayment}
                    disabled={isProcessing || isCalculatingPayment}
                    activeOpacity={0.9}
                >
                    {(isProcessing || isCalculatingPayment) ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="lock-closed" size={16} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.proceedButtonText}>
                                Proceed to Payment
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* 🚀 NEW: Add Payment Method Modal */}
            <Modal
                visible={showAddPaymentForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddPaymentForm(false)}
            >
                <PaymentForm
                    onPaymentMethodSaved={handlePaymentMethodSaved}
                    onClose={() => setShowAddPaymentForm(false)}
                    isCheckout={true}
                />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 17,
        lineHeight: 24,
    },
    emptyButton: {
        backgroundColor: '#0071CE',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    header: {
        backgroundColor: '#ffffff',
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
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
    },
    progressIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressStep: {
        alignItems: 'center',
    },
    progressStepActive: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#0071CE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    progressStepInactive: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    progressStepNumber: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    progressStepNumberInactive: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '700',
    },
    progressStepText: {
        color: '#0071CE',
        fontSize: 11,
        fontWeight: '600',
    },
    progressStepTextInactive: {
        color: '#9CA3AF',
        fontSize: 11,
        fontWeight: '500',
    },
    progressLine: {
        width: 24,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 6,
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
    scrollContainer: {
        flex: 1,
    },
    section: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    changeButton: {
        color: '#0071CE',
        fontWeight: '600',
        fontSize: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    deliveryInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    deliveryInfoTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 8,
    },
    deliveryInfoCard: {
        backgroundColor: '#F0F9FF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    deliveryEstimate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 8,
    },
    freeShippingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    freeShippingText: {
        color: '#059669',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    shippingInfo: {
        color: '#1E40AF',
        fontSize: 14,
        fontWeight: '500',
    },
    cartItem: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    lastCartItem: {
        borderBottomWidth: 0,
        marginBottom: 0,
        paddingBottom: 0,
    },
    itemImage: {
        width: 88,
        height: 88,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    itemDetails: {
        flex: 1,
        paddingRight: 12,
    },
    itemName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 17,
        marginBottom: 6,
        lineHeight: 24,
    },
    itemBrand: {
        color: '#0071CE',
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    itemAttribute: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 3,
        fontWeight: '500',
    },
    itemSeller: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    outOfStock: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 13,
        marginLeft: 4,
    },
    limitedStock: {
        color: '#F59E0B',
        fontWeight: '600',
        fontSize: 13,
        marginLeft: 4,
    },
    inStock: {
        color: '#10B981',
        fontWeight: '600',
        fontSize: 13,
        marginLeft: 4,
    },
    itemActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minWidth: 100,
    },
    priceContainer: {
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    itemPrice: {
        color: '#0071CE',
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 2,
    },
    originalPrice: {
        color: '#9CA3AF',
        fontSize: 14,
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    savingsText: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    quantityButton: {
        padding: 10,
        borderRadius: 8,
    },
    quantityButtonDisabled: {
        opacity: 0.4,
    },
    quantityText: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        fontSize: 16,
        fontWeight: '700',
        minWidth: 44,
        textAlign: 'center',
        color: '#111827',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    removeButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    continueShoppingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#0071CE',
        borderRadius: 12,
        borderStyle: 'dashed',
        backgroundColor: '#F8FAFC',
    },
    continueShoppingText: {
        color: '#0071CE',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    addressCard: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    addressIcon: {
        width: 36,
        height: 36,
        backgroundColor: '#EFF6FF',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    addressDetails: {
        flex: 1,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    addressName: {
        fontWeight: '600',
        color: '#111827',
        fontSize: 16,
        flex: 1,
    },
    addressStreet: {
        color: '#6B7280',
        fontSize: 15,
        marginBottom: 4,
        lineHeight: 20,
    },
    addressCity: {
        color: '#6B7280',
        fontSize: 15,
        lineHeight: 20,
    },
    defaultBadge: {
        backgroundColor: '#0071CE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 8,
    },
    defaultBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    paymentCard: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    paymentIcon: {
        width: 40,
        height: 28,
        backgroundColor: '#0071CE',
        borderRadius: 6,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    paymentDetails: {
        flex: 1,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    paymentName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
        flex: 1,
    },
    paymentExpiry: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    addPaymentCard: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0071CE',
        borderStyle: 'dashed',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    addPaymentIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#EFF6FF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    addPaymentContent: {
        flex: 1,
    },
    addPaymentTitle: {
        color: '#0071CE',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 2,
    },
    addPaymentSubtitle: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 18,
    },
    paymentStatusCard: {
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    paymentStatusText: {
        color: '#1E40AF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    appliedPromoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    appliedPromoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    promoInfo: {
        marginLeft: 12,
        flex: 1,
    },
    appliedPromoText: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    promoDescription: {
        color: '#047857',
        fontSize: 13,
        marginTop: 2,
        fontWeight: '500',
    },
    removePromoText: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 14,
    },
    promoContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    promoInput: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#ffffff',
        fontWeight: '500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    promoButton: {
        backgroundColor: '#0071CE',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 88,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    promoButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
        elevation: 1,
    },
    promoButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    suggestedPromos: {
        marginTop: 8,
    },
    suggestedPromosTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 12,
    },
    suggestedPromosList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestedPromoChip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    suggestedPromoText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '600',
    },
    summaryContainer: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 2,
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
    discountLabel: {
        color: '#059669',
        fontSize: 16,
        fontWeight: '500',
    },
    discountValue: {
        color: '#059669',
        fontSize: 16,
        fontWeight: '700',
    },
    shippingLabelContainer: {
        flex: 1,
    },
    freeShippingNote: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    freeShippingValue: {
        color: '#10B981',
        fontWeight: '700',
    },
    taxLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    totalSavingsRow: {
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
    },
    totalSavingsLabel: {
        color: '#059669',
        fontSize: 16,
        fontWeight: '600',
    },
    totalSavingsValue: {
        color: '#059669',
        fontSize: 18,
        fontWeight: '700',
    },
    totalRow: {
        borderTopWidth: 2,
        borderTopColor: '#E2E8F0',
        paddingTop: 16,
        marginTop: 12,
        backgroundColor: '#ffffff',
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingBottom: 8,
        borderRadius: 8,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    totalValue: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0071CE',
    },
    securityNotice: {
        backgroundColor: '#ECFDF5',
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    securityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    securityTitle: {
        color: '#059669',
        fontWeight: '700',
        marginLeft: 12,
        fontSize: 18,
    },
    securityText: {
        color: '#047857',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    securityFeatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    securityFeatureText: {
        color: '#047857',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    bottomAction: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    bottomSummaryLeft: {
        flex: 1,
    },
    bottomTotalLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    bottomItemCount: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    bottomTotalValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0071CE',
    },
    proceedButton: {
        backgroundColor: '#0071CE',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        transform: [{ scale: 1 }],
    },
    proceedButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
        elevation: 2,
        transform: [{ scale: 0.98 }],
    },
    proceedButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 18,
    },
});