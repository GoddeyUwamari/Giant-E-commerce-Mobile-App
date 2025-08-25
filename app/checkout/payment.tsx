import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { NotificationIntegrations } from '../../services/notifications/notificationIntegrations';

// 🚀 FIXED: Import actual services and types
import { useCartStore } from '../../store/slices/cartSlice';
import { paymentService } from '../../services/api/payments';
import PaymentForm from '../../components/forms/PaymentForm';
import type {
    PaymentMethod,
    PaymentIntent,
    ShippingAddress as PaymentServiceShippingAddress,
} from '../../services/api/payments';

export default function PaymentPage(): JSX.Element {
    // 🚀 NEW: Stripe hooks for real payment processing
    const { confirmPayment: stripeConfirmPayment, createPaymentMethod } = useStripe();

    // 🚀 FIXED: Cart store integration with proper selectors
    const {
        items: cartItems,
        summary,
        paymentIntent,
        deliveryAddress,
        paymentError,
        isCalculatingPayment,
        clearCart,
        createPaymentIntent: createPaymentIntentAction,
        clearPaymentError,
    } = useCartStore();

    // Local state for payment methods
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

    // Modal states
    const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
    const [showEditPaymentForm, setShowEditPaymentForm] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadPaymentData();
        clearPaymentError();
    }, []);

    // Load payment methods
    const loadPaymentData = async () => {
        try {
            setIsLoading(true);

            // TODO: Replace with actual payment method loading when available
            const mockPaymentMethods: PaymentMethod[] = [];

            setPaymentMethods(mockPaymentMethods);
            setSelectedPayment(mockPaymentMethods.find(p => p.isDefault) || mockPaymentMethods[0] || null);
        } catch (error) {
            console.error('Error loading payment data:', error);
            setPaymentMethods([]);
            setSelectedPayment(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSelect = async (payment: PaymentMethod) => {
        setSelectedPayment(payment);
        clearPaymentError();
    };

    const handleAddNewCard = async () => {
        setShowAddPaymentForm(true);
    };

    const handleEditPaymentMethod = (methodId: string) => {
        const method = paymentMethods.find(m => m.id === methodId);
        if (method) {
            setEditingPaymentMethod(method);
            setShowEditPaymentForm(true);
        }
    };

    // 🚀 COMPLETELY FIXED: Real Stripe payment method creation
    const handlePaymentFormSubmit = async (data: any) => {
        try {
            if (editingPaymentMethod) {
                // Update existing payment method (billing address only)
                console.log('Updating payment method:', editingPaymentMethod.id, data);

                const billingData: PaymentServiceShippingAddress = {
                    line1: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.street
                        : data.billingAddress.street,
                    line2: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.apartment
                        : data.billingAddress.apartment,
                    city: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.city
                        : data.billingAddress.city,
                    state: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.state
                        : data.billingAddress.state,
                    postalCode: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.zipCode
                        : data.billingAddress.zipCode,
                    country: 'US',
                };

                // Update local state
                setPaymentMethods(prev => prev.map(method =>
                    method.id === editingPaymentMethod.id
                        ? {
                            ...method,
                            billingDetails: {
                                name: data.cardholderName,
                                address: billingData,
                            },
                            updatedAt: new Date().toISOString()
                        }
                        : method
                ));

                setShowEditPaymentForm(false);
                setEditingPaymentMethod(null);
                Alert.alert('Success', 'Payment method updated successfully!');
            } else {
                // 🚀 NEW: Create real Stripe payment method
                console.log('Creating real Stripe payment method...');

                if (!data.cardData) {
                    throw new Error('Card information is required');
                }

                const billingData: PaymentServiceShippingAddress = {
                    line1: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.street
                        : data.billingAddress.street,
                    line2: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.apartment
                        : data.billingAddress.apartment,
                    city: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.city
                        : data.billingAddress.city,
                    state: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.state
                        : data.billingAddress.state,
                    postalCode: data.useSameAddress && deliveryAddress
                        ? deliveryAddress.zipCode
                        : data.billingAddress.zipCode,
                    country: 'US',
                };

                // Create Stripe payment method
                const { paymentMethod, error } = await createPaymentMethod({
                    paymentMethodType: 'Card',
                    card: data.cardData,
                    billingDetails: {
                        name: data.cardholderName,
                        address: {
                            line1: billingData.line1,
                            line2: billingData.line2,
                            city: billingData.city,
                            state: billingData.state,
                            postalCode: billingData.postalCode,
                            country: billingData.country,
                        },
                    },
                });

                if (error) {
                    console.error('Stripe payment method creation error:', error);
                    throw new Error(error.message || 'Failed to create payment method');
                }

                if (!paymentMethod) {
                    throw new Error('No payment method returned from Stripe');
                }

                console.log('✅ Stripe payment method created:', paymentMethod.id);

                // Create new payment method with real Stripe data
                const newPaymentMethod: PaymentMethod = {
                    id: `pm_local_${Date.now()}`,
                    userId: 'current_user',
                    stripePaymentMethodId: paymentMethod.id, // 🚀 REAL STRIPE ID
                    stripeCustomerId: 'cus_current',
                    type: 'card',
                    isDefault: paymentMethods.length === 0 || data.setAsDefault,
                    nickname: data.saveCard ? `Card •••• ${paymentMethod.card?.last4}` : undefined,
                    card: {
                        brand: paymentMethod.card?.brand as any || 'visa',
                        last4: paymentMethod.card?.last4 || '0000',
                        expiryMonth: paymentMethod.card?.expMonth || 12,
                        expiryYear: paymentMethod.card?.expYear || 2025,
                        funding: paymentMethod.card?.funding as any || 'credit',
                        country: paymentMethod.card?.country || 'US',
                        fingerprint: paymentMethod.card?.fingerprint || `fp_${Date.now()}`,
                    },
                    billingDetails: {
                        name: data.cardholderName,
                        address: billingData,
                    },
                    metadata: {
                        createdInApp: 'true',
                        savedFromCheckout: 'true',
                    },
                    isExpired: false,
                    isValid: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                // Update payment methods list
                let updatedPayments = [...paymentMethods];
                if (newPaymentMethod.isDefault) {
                    updatedPayments = updatedPayments.map(payment => ({
                        ...payment,
                        isDefault: false,
                    }));
                }
                updatedPayments.push(newPaymentMethod);

                setPaymentMethods(updatedPayments);
                setSelectedPayment(newPaymentMethod);
                setShowAddPaymentForm(false);
                Alert.alert('Success', 'Payment method added successfully!');
            }
        } catch (error) {
            console.error('Payment form submission error:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save payment method. Please try again.');
        }
    };

    // Delete payment method
    const handleDeletePayment = (paymentId: string) => {
        const paymentToDelete = paymentMethods.find(payment => payment.id === paymentId);
        if (!paymentToDelete) {
            Alert.alert('Error', 'Payment method not found');
            return;
        }

        if (paymentMethods.length === 1 && cartItems.length > 0) {
            Alert.alert(
                'Cannot Delete',
                'You must have at least one payment method to complete your order. Please add another payment method before removing this one.'
            );
            return;
        }

        Alert.alert(
            'Remove Payment Method',
            `Are you sure you want to remove ${getPaymentMethodDisplay(paymentToDelete)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Deleting payment method:', paymentId);

                            const updatedPayments = paymentMethods.filter(payment => payment.id !== paymentId);
                            setPaymentMethods(updatedPayments);

                            if (selectedPayment?.id === paymentId) {
                                const newSelected = updatedPayments.find(p => p.isDefault) || updatedPayments[0] || null;
                                setSelectedPayment(newSelected);
                            }

                            console.log('Payment method removed successfully');
                        } catch (error) {
                            console.error('Error deleting payment method:', error);
                            Alert.alert('Error', 'Failed to remove payment method. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    // 🚀 UPDATED: Complete order with better validation
    const handleCompleteOrder = async () => {
        try {
            if (cartItems.length === 0) {
                Alert.alert('Error', 'Your cart is empty');
                return;
            }

            if (summary.total <= 0) {
                Alert.alert('Error', 'Invalid order total');
                return;
            }

            if (!deliveryAddress) {
                Alert.alert('Error', 'Please set a delivery address');
                return;
            }

            if (!selectedPayment) {
                Alert.alert('Error', 'Please select a payment method');
                return;
            }

            if (!selectedPayment.stripePaymentMethodId) {
                Alert.alert('Error', 'Selected payment method is invalid. Please add a new payment method.');
                return;
            }

            setIsProcessing(true);
            clearPaymentError();

            let currentPaymentIntent = paymentIntent;

            // Create payment intent if needed
            if (!currentPaymentIntent) {
                console.log('Creating payment intent for order completion...');
                currentPaymentIntent = await createPaymentIntentAction();

                if (!currentPaymentIntent) {
                    throw new Error('Failed to create payment intent. Please check your order details and try again.');
                }
            }

            // Validate payment intent
            if (!currentPaymentIntent.id || !currentPaymentIntent.clientSecret) {
                throw new Error('Invalid payment intent. Please refresh and try again.');
            }

            console.log('Processing payment with intent:', currentPaymentIntent.id);
            console.log('Selected payment method:', selectedPayment.type, 'Stripe ID:', selectedPayment.stripePaymentMethodId);

            if (selectedPayment.type === 'card' && selectedPayment.stripePaymentMethodId) {
                await processCardPayment(currentPaymentIntent, selectedPayment);
            } else if (selectedPayment.type === 'apple_pay') {
                await processApplePayPayment(currentPaymentIntent);
            } else if (selectedPayment.type === 'google_pay') {
                await processGooglePayPayment(currentPaymentIntent);
            } else if (selectedPayment.type === 'paypal') {
                await processPayPalPayment(currentPaymentIntent);
            } else {
                throw new Error('Invalid payment method selected. Please add a new card to continue.');
            }

        } catch (error) {
            console.error('Error processing payment:', error);
            Alert.alert('Payment Error', error instanceof Error ? error.message : 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // 🚀 COMPLETELY REWRITTEN: Use Stripe React Native for payment confirmation
    const processCardPayment = async (paymentIntent: PaymentIntent, payment: PaymentMethod) => {
        try {
            console.log('Processing card payment with Stripe React Native...');

            if (!paymentIntent.clientSecret) {
                throw new Error('Missing payment intent client secret');
            }

            if (!payment.stripePaymentMethodId) {
                throw new Error('Missing Stripe payment method ID');
            }

            // Use Stripe React Native to confirm the payment
            const { error, paymentIntent: confirmedPaymentIntent } = await stripeConfirmPayment(
                paymentIntent.clientSecret,
                {
                    paymentMethodType: 'Card',
                    paymentMethodData: {
                        paymentMethodId: payment.stripePaymentMethodId,
                    },
                }
            );

            if (error) {
                console.error('Stripe payment confirmation error:', error);

                // Handle specific error types
                if (error.code === 'Canceled') {
                    throw new Error('Payment was canceled');
                } else if (error.code === 'Failed') {
                    throw new Error('Payment failed. Please check your card details and try again.');
                } else if (error.code === 'PaymentIntentAuthenticationFailure') {
                    throw new Error('Payment authentication failed. Please try again.');
                } else {
                    throw new Error(error.message || 'Payment failed for an unknown reason');
                }
            }

            if (!confirmedPaymentIntent) {
                throw new Error('No payment intent returned from Stripe');
            }

            console.log('✅ Stripe payment confirmed:', confirmedPaymentIntent.status);

            if (confirmedPaymentIntent.status === 'Succeeded') {
                await handlePaymentSuccess(confirmedPaymentIntent);
            } else if (confirmedPaymentIntent.status === 'RequiresAction') {
                // This should be handled automatically by Stripe React Native
                throw new Error('Payment requires additional authentication');
            } else if (confirmedPaymentIntent.status === 'RequiresPaymentMethod') {
                throw new Error('Your payment method was declined. Please try a different card.');
            } else {
                throw new Error(`Payment failed with status: ${confirmedPaymentIntent.status}`);
            }

        } catch (error) {
            console.error('Card payment processing error:', error);
            throw error;
        }
    };

    // Alternative payment processors (placeholders)
    const processApplePayPayment = async (paymentIntent: PaymentIntent) => {
        console.log('Apple Pay payment initiated');
        Alert.alert('Coming Soon', 'Apple Pay integration will be available in a future update.');
        throw new Error('Apple Pay not yet implemented');
    };

    const processGooglePayPayment = async (paymentIntent: PaymentIntent) => {
        console.log('Google Pay payment initiated');
        Alert.alert('Coming Soon', 'Google Pay integration will be available in a future update.');
        throw new Error('Google Pay not yet implemented');
    };

    const processPayPalPayment = async (paymentIntent: PaymentIntent) => {
        console.log('PayPal payment initiated');
        Alert.alert('Coming Soon', 'PayPal integration will be available in a future update.');
        throw new Error('PayPal not yet implemented');
    };

    // 🚀 UPDATED: Handle successful payment
    const handlePaymentSuccess = async (result: any) => {
        try {
            console.log('Payment succeeded, processing order completion...');

            // Optionally call backend to confirm and create order record
            try {
                const confirmationResult = await paymentService.confirmPayment({
                    paymentIntentId: result.id,
                    paymentMethodId: selectedPayment!.stripePaymentMethodId!,
                    savePaymentMethod: false,
                });
                console.log('Backend confirmation result:', confirmationResult.status);
            } catch (backendError) {
                console.warn('Backend confirmation failed, but payment succeeded:', backendError);
                // Continue with order completion even if backend confirmation fails
            }

            console.log('Order details:', {
                total: summary.total,
                paymentMethod: selectedPayment,
                paymentIntentId: result.id,
                timestamp: new Date().toISOString(),
            });

            // 🔔 Send order notifications
            await NotificationIntegrations.sendOrderConfirmation(result.id, summary.total);
            await NotificationIntegrations.sendPaymentSuccess(result.id, summary.total);

            // Clear cart after successful payment
            await clearCart();

            console.log('Order completed successfully, navigating to confirmation...');
            router.push('/checkout/confirmation');
        } catch (error) {
            console.error('Error handling payment success:', error);
            Alert.alert(
                'Payment Successful',
                'Your payment was processed but there was an issue completing the order. Please contact support.',
                [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
            );
        }
    };
    // Utility functions
    const getPaymentMethodIcon = (type: string, brand?: string) => {
        switch (type) {
            case 'card':
                if (brand) {
                    switch (brand.toLowerCase()) {
                        case 'visa':
                            return 'card';
                        case 'mastercard':
                            return 'card-outline';
                        case 'american express':
                        case 'amex':
                            return 'card';
                        case 'discover':
                            return 'card';
                        default:
                            return 'card';
                    }
                }
                return 'card';
            case 'paypal':
                return 'logo-paypal';
            case 'apple_pay':
                return 'phone-portrait';
            case 'google_pay':
                return 'logo-google';
            default:
                return 'card';
        }
    };

    const getPaymentMethodDisplay = (method: PaymentMethod) => {
        if (method.nickname) {
            return method.nickname;
        }

        switch (method.type) {
            case 'card':
                const brandName = method.card?.brand
                    ? method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1).toLowerCase()
                    : 'Card';
                const last4 = method.card?.last4 || '0000';
                return `${brandName} •••• ${last4}`;
            case 'paypal':
                return 'PayPal';
            case 'apple_pay':
                return 'Apple Pay';
            case 'google_pay':
                return 'Google Pay';
            default:
                return 'Payment Method';
        }
    };

    const getPaymentIconStyle = (method: PaymentMethod) => {
        if (method.type === 'card' && method.card?.brand) {
            switch (method.card.brand.toLowerCase()) {
                case 'visa':
                    return { backgroundColor: '#1A1F71' };
                case 'mastercard':
                    return { backgroundColor: '#EB001B' };
                case 'amex':
                    return { backgroundColor: '#006FCF' };
                case 'discover':
                    return { backgroundColor: '#FF6000' };
                default:
                    return { backgroundColor: '#6B7280' };
            }
        } else if (method.type === 'paypal') {
            return { backgroundColor: '#0070BA' };
        } else if (method.type === 'apple_pay') {
            return { backgroundColor: '#000000' };
        } else if (method.type === 'google_pay') {
            return { backgroundColor: '#4285F4' };
        }
        return { backgroundColor: '#6B7280' };
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0071CE" />
                <Text style={styles.loadingText}>Loading payment options...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment</Text>
                </View>
            </View>

            {/* Payment Error Display */}
            {paymentError && (
                <View style={[styles.section, { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                            <Text style={{ color: '#DC2626', fontSize: 14, fontWeight: '600', flex: 1 }}>
                                {paymentError}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={clearPaymentError} style={{ padding: 4 }}>
                            <Ionicons name="close" size={18} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Payment Intent Status */}
            {isCalculatingPayment && (
                <View style={[styles.section, { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 12 }} />
                        <Text style={{ color: '#1E40AF', fontSize: 14, fontWeight: '600' }}>
                            Preparing payment...
                        </Text>
                    </View>
                </View>
            )}

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Payment Methods */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Payment Methods</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddNewCard}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.addButtonText}>Add New</Text>
                        </TouchableOpacity>
                    </View>

                    {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.paymentCard,
                                    selectedPayment?.id === method.id
                                        ? styles.paymentCardSelected
                                        : styles.paymentCardUnselected
                                ]}
                                onPress={() => handlePaymentSelect(method)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.paymentIcon, getPaymentIconStyle(method)]}>
                                    <Ionicons
                                        name={getPaymentMethodIcon(method.type, method.card?.brand) as any}
                                        size={16}
                                        color="white"
                                    />
                                </View>
                                <View style={styles.paymentInfo}>
                                    <Text style={styles.paymentTitle}>
                                        {getPaymentMethodDisplay(method)}
                                    </Text>
                                    {method.billingDetails?.name && (
                                        <Text style={styles.paymentSubtitle}>
                                            {method.billingDetails.name}
                                        </Text>
                                    )}
                                    {method.card && (
                                        <Text style={styles.paymentSubtitle}>
                                            Expires {method.card.expiryMonth.toString().padStart(2, '0')}/{method.card.expiryYear}
                                        </Text>
                                    )}
                                    {method.stripePaymentMethodId ? (
                                        <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 4 }}>
                                            ✓ Verified
                                        </Text>
                                    ) : (
                                        <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '600', marginTop: 4 }}>
                                            ⚠ Needs Update
                                        </Text>
                                    )}
                                    {method.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.paymentActions}>
                                    {selectedPayment?.id === method.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#0071CE" />
                                    )}
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => handleEditPaymentMethod(method.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="create-outline" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                    {paymentMethods.length > 1 && (
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeletePayment(method.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={{
                            backgroundColor: '#F8FAFC',
                            padding: 24,
                            borderRadius: 12,
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: '#E5E7EB',
                            borderStyle: 'dashed',
                        }}>
                            <Ionicons name="card-outline" size={48} color="#9CA3AF" />
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: '#6B7280',
                                marginTop: 12,
                                marginBottom: 8,
                            }}>
                                No Payment Methods
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#9CA3AF',
                                textAlign: 'center',
                                marginBottom: 16,
                            }}>
                                Add a payment method to complete your order
                            </Text>
                            <TouchableOpacity
                                style={[styles.addButton, { marginTop: 0 }]}
                                onPress={handleAddNewCard}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.addButtonText}>Add Payment Method</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Alternative Payment Methods */}
                    {paymentMethods.length > 0 && (
                        <View style={styles.divider}>
                            <Text style={styles.alternativeTitle}>Other Payment Options</Text>

                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    style={[
                                        styles.alternativeCard,
                                        selectedPayment?.type === 'apple_pay' && styles.paymentCardSelected
                                    ]}
                                    onPress={() => {
                                        const applePayMethod: PaymentMethod = {
                                            id: 'apple_pay',
                                            userId: 'current_user',
                                            stripePaymentMethodId: '',
                                            stripeCustomerId: '',
                                            type: 'apple_pay',
                                            isDefault: false,
                                            nickname: 'Apple Pay',
                                            billingDetails: {
                                                name: '',
                                                address: {
                                                    line1: '',
                                                    city: '',
                                                    state: '',
                                                    postalCode: '',
                                                    country: 'US',
                                                },
                                            },
                                            metadata: {},
                                            isExpired: false,
                                            isValid: true,
                                            createdAt: new Date().toISOString(),
                                            updatedAt: new Date().toISOString(),
                                        };
                                        handlePaymentSelect(applePayMethod);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: '#000000' }]}>
                                        <Ionicons name="phone-portrait" size={16} color="white" />
                                    </View>
                                    <Text style={styles.paymentTitle}>Apple Pay</Text>
                                    <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '600', marginLeft: 8 }}>
                                        Coming Soon
                                    </Text>
                                    {selectedPayment?.type === 'apple_pay' && (
                                        <View style={{ marginLeft: 'auto' }}>
                                            <Ionicons name="checkmark-circle" size={24} color="#0071CE" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}

                            {Platform.OS === 'android' && (
                                <TouchableOpacity
                                    style={[
                                        styles.alternativeCard,
                                        selectedPayment?.type === 'google_pay' && styles.paymentCardSelecte
                                    ]}
                                    onPress={() => {
                                        const googlePayMethod: PaymentMethod = {
                                            id: 'google_pay',
                                            userId: 'current_user',
                                            stripePaymentMethodId: '',
                                            stripeCustomerId: '',
                                            type: 'google_pay',
                                            isDefault: false,
                                            nickname: 'Google Pay',
                                            billingDetails: {
                                                name: '',
                                                address: {
                                                    line1: '',
                                                    city: '',
                                                    state: '',
                                                    postalCode: '',
                                                    country: 'US',
                                                },
                                            },
                                            metadata: {},
                                            isExpired: false,
                                            isValid: true,
                                            createdAt: new Date().toISOString(),
                                            updatedAt: new Date().toISOString(),
                                        };
                                        handlePaymentSelect(googlePayMethod);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: '#4285F4' }]}>
                                        <Ionicons name="logo-google" size={16} color="white" />
                                    </View>
                                    <Text style={styles.paymentTitle}>Google Pay</Text>
                                    <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '600', marginLeft: 8 }}>
                                        Coming Soon
                                    </Text>
                                    {selectedPayment?.type === 'google_pay' && (
                                        <View style={{ marginLeft: 'auto' }}>
                                            <Ionicons name="checkmark-circle" size={24} color="#0071CE" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.alternativeCard,
                                    selectedPayment?.type === 'paypal' && styles.paymentCardSelected
                                ]}
                                onPress={() => {
                                    const paypalMethod: PaymentMethod = {
                                        id: 'paypal',
                                        userId: 'current_user',
                                        stripePaymentMethodId: '',
                                        stripeCustomerId: '',
                                        type: 'paypal',
                                        isDefault: false,
                                        nickname: 'PayPal',
                                        billingDetails: {
                                            name: '',
                                            address: {
                                                line1: '',
                                                city: '',
                                                state: '',
                                                postalCode: '',
                                                country: 'US',
                                            },
                                        },
                                        metadata: {},
                                        isExpired: false,
                                        isValid: true,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                    };
                                    handlePaymentSelect(paypalMethod);
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.paymentIcon, { backgroundColor: '#0070BA' }]}>
                                    <Ionicons name="logo-paypal" size={16} color="white" />
                                </View>
                                <Text style={styles.paymentTitle}>PayPal</Text>
                                <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '600', marginLeft: 8 }}>
                                    Coming Soon
                                </Text>
                                {selectedPayment?.type === 'paypal' && (
                                    <View style={{ marginLeft: 'auto' }}>
                                        <Ionicons name="checkmark-circle" size={24} color="#0071CE" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={{ marginTop: 16 }}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
                            </Text>
                            <Text style={styles.summaryValue}>${summary.subtotal.toFixed(2)}</Text>
                        </View>

                        {summary.savings > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryValueGreen}>Item Savings</Text>
                                <Text style={styles.summaryValueGreen}>-${summary.savings.toFixed(2)}</Text>
                            </View>
                        )}

                        {summary.discounts > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryValueGreen}>Promo Discounts</Text>
                                <Text style={styles.summaryValueGreen}>-${summary.discounts.toFixed(2)}</Text>
                            </View>
                        )}

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                {((summary.shipping || 0) + (summary.delivery || 0)) > 0 ? 'Shipping & Delivery' : 'Delivery'}
                            </Text>
                            <Text style={[
                                styles.summaryValue,
                                ((summary.shipping || 0) + (summary.delivery || 0)) === 0 && { color: '#10B981', fontWeight: '700' }
                            ]}>
                                {((summary.shipping || 0) + (summary.delivery || 0)) === 0
                                    ? 'Free'
                                    : `$${((summary.shipping || 0) + (summary.delivery || 0)).toFixed(2)}`
                                }
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Estimated Tax</Text>
                            <Text style={styles.summaryValue}>${summary.tax.toFixed(2)}</Text>
                        </View>

                        {(summary.savings > 0 || summary.discounts > 0) && (
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
                                    -${(summary.savings + summary.discounts).toFixed(2)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.summaryDivider}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>
                                    ${summary.total.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                    <View style={styles.securityHeader}>
                        <Ionicons name="shield-checkmark" size={20} color="#059669" />
                        <Text style={styles.securityTitle}>Secure Payment</Text>
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

            {/* Bottom Action */}
            <View style={styles.bottomAction}>
                <TouchableOpacity
                    style={[
                        styles.completeButton,
                        (isProcessing || !selectedPayment || cartItems.length === 0 || isCalculatingPayment) && styles.completeButtonDisabled
                    ]}
                    onPress={handleCompleteOrder}
                    disabled={isProcessing || !selectedPayment || cartItems.length === 0 || isCalculatingPayment}
                    activeOpacity={0.8}
                >
                    {(isProcessing || isCalculatingPayment) ? (
                        <View style={styles.completeButtonContent}>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={styles.completeButtonTextWithIcon}>
                                {isCalculatingPayment ? 'Preparing...' : 'Processing...'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.completeButtonContent}>
                            <Ionicons name="lock-closed" size={16} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.completeButtonText}>
                                Complete Order • ${summary.total.toFixed(2)}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* 🚀 UPDATED: Add Payment Method Modal with real Stripe integration */}
            <Modal
                visible={showAddPaymentForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddPaymentForm(false)}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <PaymentForm
                        title="Add Payment Method"
                        submitText="Save Payment Method"
                        onSubmit={handlePaymentFormSubmit}
                        onCancel={() => setShowAddPaymentForm(false)}
                        showSaveOption={true}
                        showBillingAddress={true}
                        shippingAddress={deliveryAddress ? {
                            street: deliveryAddress.street,
                            city: deliveryAddress.city,
                            state: deliveryAddress.state,
                            zipCode: deliveryAddress.zipCode,
                            country: deliveryAddress.country || 'US',
                        } : undefined}
                        useStripeCardField={true} // 🚀 Enable real Stripe card input
                        mode="add"
                    />
                </SafeAreaView>
            </Modal>

            {/* Edit Payment Method Modal */}
            <Modal
                visible={showEditPaymentForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => {
                    setShowEditPaymentForm(false);
                    setEditingPaymentMethod(null);
                }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <PaymentForm
                        title="Edit Payment Method"
                        submitText="Update Payment Method"
                        onSubmit={handlePaymentFormSubmit}
                        onCancel={() => {
                            setShowEditPaymentForm(false);
                            setEditingPaymentMethod(null);
                        }}
                        showSaveOption={false}
                        showBillingAddress={true}
                        shippingAddress={deliveryAddress ? {
                            street: deliveryAddress.street,
                            city: deliveryAddress.city,
                            state: deliveryAddress.state,
                            zipCode: deliveryAddress.zipCode,
                            country: deliveryAddress.country || 'US',
                        } : undefined}
                        useStripeCardField={false} // Edit mode doesn't change card details
                        mode="edit"
                        initialData={editingPaymentMethod ? {
                            cardholderName: editingPaymentMethod.billingDetails?.name || '',
                            billingAddress: editingPaymentMethod.billingDetails?.address ? {
                                street: editingPaymentMethod.billingDetails.address.line1,
                                city: editingPaymentMethod.billingDetails.address.city,
                                state: editingPaymentMethod.billingDetails.address.state,
                                zipCode: editingPaymentMethod.billingDetails.address.postalCode,
                                country: editingPaymentMethod.billingDetails.address.country,
                            } : undefined,
                        } : undefined}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
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
        paddingHorizontal: 32,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    // Header Styles - Walmart Themed
    header: {
        backgroundColor: '#0071CE', // Walmart Blue
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#005BB5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    // Content Styles
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },

    // Payment Methods Section
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: 0.4,
    },
    addButton: {
        backgroundColor: '#FFC220', // Walmart Yellow
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 12,
        shadowColor: '#FFC220',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E6A900',
    },
    addButtonText: {
        color: '#0071CE',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.4,
    },

    // Payment Method Card Styles - Enhanced Walmart Theme
    paymentCard: {
        borderWidth: 2,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 18,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    paymentCardSelected: {
        borderColor: '#0071CE',
        backgroundColor: '#EBF4FF',
        shadowColor: '#0071CE',
        shadowOpacity: 0.25,
        elevation: 6,
        transform: [{ scale: 1.02 }],
    },
    paymentCardUnselected: {
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    paymentIcon: {
        width: 56,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
        fontSize: 17,
        letterSpacing: 0.4,
    },
    paymentSubtitle: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 3,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    defaultBadge: {
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#F59E0B',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    defaultBadgeText: {
        color: '#92400E',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    paymentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    deleteButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },

    // Alternative Payment Methods
    divider: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 24,
        marginTop: 24,
    },
    alternativeTitle: {
        color: '#111827',
        fontWeight: '700',
        marginBottom: 18,
        fontSize: 17,
        letterSpacing: 0.4,
    },
    alternativeCard: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },

    // Order Summary Styles - Walmart Theme
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingVertical: 3,
    },
    summaryLabel: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    summaryValue: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    summaryValueGreen: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    summaryDivider: {
        borderTopWidth: 3,
        borderTopColor: '#0071CE',
        paddingTop: 18,
        marginTop: 18,
        backgroundColor: '#F8FAFC',
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderRadius: 12,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    totalRow: {
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
        fontSize: 26,
        fontWeight: '900',
        color: '#0071CE',
        letterSpacing: 0.4,
        textShadowColor: 'rgba(0, 113, 206, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    // Security Notice - Walmart Theme
    securityNotice: {
        backgroundColor: '#ECFDF5',
        paddingVertical: 22,
        paddingHorizontal: 22,
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#A7F3D0',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    securityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    securityTitle: {
        color: '#059669',
        fontWeight: '800',
        marginLeft: 14,
        fontSize: 19,
        letterSpacing: 0.4,
    },
    securityText: {
        color: '#047857',
        fontSize: 15,
        marginBottom: 14,
        lineHeight: 23,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    securityFeatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    securityFeatureText: {
        color: '#047857',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 8,
        letterSpacing: 0.4,
    },

    // Bottom Action - Walmart Theme
    bottomAction: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    completeButton: {
        backgroundColor: '#0071CE',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#005BB5',
    },
    completeButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
        elevation: 2,
        borderColor: '#6B7280',
        transform: [{ scale: 0.98 }],
    },
    completeButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 19,
        letterSpacing: 0.6,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    completeButtonTextWithIcon: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 19,
        marginLeft: 10,
        letterSpacing: 0.6,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});