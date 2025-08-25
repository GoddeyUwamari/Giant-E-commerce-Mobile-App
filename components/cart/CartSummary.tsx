import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartSummaryProps {
    subtotal: number;
    savings?: number;
    tax?: number;
    shipping?: number;
    discount?: number;
    itemCount: number;
    onCheckout: () => void;
    showPromoCode?: boolean;
    isCheckoutDisabled?: boolean;
    checkoutText?: string;
}

export default function CartSummary({
                                        subtotal,
                                        savings = 0,
                                        tax,
                                        shipping,
                                        discount = 0,
                                        itemCount,
                                        onCheckout,
                                        showPromoCode = true,
                                        isCheckoutDisabled = false,
                                        checkoutText = 'Checkout',
                                    }: CartSummaryProps): JSX.Element {
    const [promoCode, setPromoCode] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
    const [promoDiscount, setPromoDiscount] = useState(0);

    // Calculate estimated tax (8% rate)
    const estimatedTax = tax ?? subtotal * 0.08;

    // Calculate shipping (free over $35)
    const shippingCost = shipping ?? (subtotal >= 35 ? 0 : 5.99);

    // Total discount includes savings + promo + manual discount
    const totalDiscount = savings + promoDiscount + discount;

    // Calculate final total
    const total = subtotal + estimatedTax + shippingCost - totalDiscount;

    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) {
            Alert.alert('Error', 'Please enter a promo code');
            return;
        }

        setIsApplyingPromo(true);
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock promo code validation
            const upperPromo = promoCode.toUpperCase();
            let discount = 0;
            let message = '';

            switch (upperPromo) {
                case 'SAVE10':
                    discount = subtotal * 0.1; // 10% off
                    message = '10% discount applied!';
                    break;
                case 'WELCOME20':
                    discount = Math.min(subtotal * 0.2, 50); // 20% off, max $50
                    message = '20% welcome discount applied!';
                    break;
                case 'FREESHIP':
                    discount = shippingCost;
                    message = 'Free shipping applied!';
                    break;
                case 'FLAT5':
                    discount = 5; // $5 off
                    message = '$5 discount applied!';
                    break;
                default:
                    Alert.alert('Invalid Code', 'The promo code you entered is not valid.');
                    setIsApplyingPromo(false);
                    return;
            }

            setPromoDiscount(discount);
            setAppliedPromo(upperPromo);
            setPromoCode('');
            Alert.alert('Success', message);
        } catch (error) {
            console.error('Error applying promo code:', error);
            Alert.alert('Error', 'Failed to apply promo code. Please try again.');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoDiscount(0);
        setAppliedPromo(null);
    };

    const renderPromoSection = () => {
        if (!showPromoCode) return null;

        return (
            <View style={styles.promoSection}>
                {appliedPromo ? (
                    <View style={styles.appliedPromoContainer}>
                        <View style={styles.appliedPromoContent}>
                            <Ionicons name="checkmark-circle" size={20} color="#059669" />
                            <View style={styles.appliedPromoText}>
                                <Text style={styles.appliedPromoTitle}>
                                    {appliedPromo} Applied
                                </Text>
                                <Text style={styles.appliedPromoSavings}>
                                    You saved ${promoDiscount.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleRemovePromo}>
                            <Ionicons name="close" size={20} color="#059669" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.promoTitle}>
                            Have a promo code?
                        </Text>
                        <View style={styles.promoInputContainer}>
                            <TextInput
                                style={styles.promoInput}
                                placeholder="Enter promo code"
                                value={promoCode}
                                onChangeText={setPromoCode}
                                autoCapitalize="characters"
                                returnKeyType="done"
                                onSubmitEditing={handleApplyPromoCode}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.applyButton,
                                    isApplyingPromo && styles.applyButtonDisabled
                                ]}
                                onPress={handleApplyPromoCode}
                                disabled={isApplyingPromo}
                            >
                                {isApplyingPromo ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.applyButtonText}>Apply</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Promo Code Suggestions */}
                        <View style={styles.promoSuggestions}>
                            <TouchableOpacity
                                style={styles.promoSuggestionButton}
                                onPress={() => setPromoCode('SAVE10')}
                            >
                                <Text style={styles.promoSuggestionText}>SAVE10</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.promoSuggestionButton}
                                onPress={() => setPromoCode('FREESHIP')}
                            >
                                <Text style={styles.promoSuggestionText}>FREESHIP</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderOrderSummary = () => (
        <View style={styles.orderSummaryContainer}>
            <Text style={styles.orderSummaryTitle}>
                Order Summary
            </Text>

            <View style={styles.summaryItems}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                        Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </Text>
                    <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                </View>

                {savings > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.savingsLabel}>Item savings</Text>
                        <Text style={styles.savingsValue}>-${savings.toFixed(2)}</Text>
                    </View>
                )}

                {promoDiscount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.savingsLabel}>Promo discount</Text>
                        <Text style={styles.savingsValue}>-${promoDiscount.toFixed(2)}</Text>
                    </View>
                )}

                {discount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.savingsLabel}>Additional discount</Text>
                        <Text style={styles.savingsValue}>-${discount.toFixed(2)}</Text>
                    </View>
                )}

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping</Text>
                    <Text style={styles.summaryValue}>
                        {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                    </Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Estimated tax</Text>
                    <Text style={styles.summaryValue}>${estimatedTax.toFixed(2)}</Text>
                </View>

                <View style={styles.totalRow}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>
                            ${total.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Savings Summary */}
            {totalDiscount > 0 && (
                <View style={styles.savingsSummary}>
                    <View style={styles.savingsSummaryContent}>
                        <Ionicons name="checkmark-circle" size={20} color="#059669" />
                        <Text style={styles.savingsSummaryText}>
                            Total savings: ${totalDiscount.toFixed(2)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Free Shipping Banner */}
            {subtotal < 35 && (
                <View style={styles.freeShippingBanner}>
                    <View style={styles.freeShippingContent}>
                        <Ionicons name="information-circle" size={20} color="#0071CE" />
                        <Text style={styles.freeShippingText}>
                            Add ${(35 - subtotal).toFixed(2)} more for free shipping
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {renderOrderSummary()}
            {renderPromoSection()}

            {/* Checkout Button */}
            <TouchableOpacity
                style={[
                    styles.checkoutButton,
                    isCheckoutDisabled && styles.checkoutButtonDisabled
                ]}
                onPress={onCheckout}
                disabled={isCheckoutDisabled}
            >
                <View style={styles.checkoutButtonContent}>
                    <Ionicons
                        name="bag-check"
                        size={20}
                        color={isCheckoutDisabled ? '#9CA3AF' : 'white'}
                    />
                    <Text style={[
                        styles.checkoutButtonText,
                        isCheckoutDisabled && styles.checkoutButtonTextDisabled
                    ]}>
                        {checkoutText} • ${total.toFixed(2)}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text style={styles.securityText}>
                    Secure checkout with SSL encryption
                </Text>
            </View>

            {/* Payment Methods */}
            <View style={styles.paymentMethods}>
                <Text style={styles.paymentMethodsLabel}>We accept:</Text>
                <View style={styles.paymentIcons}>
                    <View style={[styles.paymentIcon, { backgroundColor: '#1565C0' }]} />
                    <View style={[styles.paymentIcon, { backgroundColor: '#D32F2F' }]} />
                    <View style={[styles.paymentIcon, { backgroundColor: '#F57C00' }]} />
                    <View style={[styles.paymentIcon, { backgroundColor: '#7B1FA2' }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        padding: 16,
    },

    // Order Summary Styles
    orderSummaryContainer: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    orderSummaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    summaryItems: {
        gap: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
    },
    summaryLabel: {
        color: '#6B7280',
        fontSize: 15,
    },
    summaryValue: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '500',
    },
    savingsLabel: {
        color: '#059669',
        fontSize: 15,
        fontWeight: '500',
    },
    savingsValue: {
        color: '#059669',
        fontSize: 15,
        fontWeight: '600',
    },

    // Total Section
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#D1D5DB',
        paddingTop: 12,
        marginTop: 8,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0071CE',
    },

    // Savings Summary Banner
    savingsSummary: {
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    savingsSummaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingsSummaryText: {
        color: '#065F46',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 15,
    },

    // Free Shipping Banner
    freeShippingBanner: {
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    freeShippingContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    freeShippingText: {
        color: '#1E40AF',
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },

    // Promo Code Section
    promoSection: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
        marginBottom: 16,
    },
    promoTitle: {
        color: '#111827',
        fontWeight: '600',
        marginBottom: 12,
        fontSize: 16,
    },
    promoInputContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    promoInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginRight: 12,
        fontSize: 15,
        backgroundColor: '#FFFFFF',
    },
    applyButton: {
        backgroundColor: '#0071CE',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
        minWidth: 70,
    },
    applyButtonDisabled: {
        opacity: 0.5,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 15,
    },

    // Applied Promo
    appliedPromoContainer: {
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    appliedPromoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appliedPromoText: {
        marginLeft: 8,
        flex: 1,
    },
    appliedPromoTitle: {
        color: '#065F46',
        fontWeight: '600',
        fontSize: 15,
    },
    appliedPromoSavings: {
        color: '#059669',
        fontSize: 13,
        marginTop: 2,
    },

    // Promo Suggestions
    promoSuggestions: {
        flexDirection: 'row',
        gap: 8,
    },
    promoSuggestionButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    promoSuggestionText: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '500',
    },

    // Checkout Button
    checkoutButton: {
        backgroundColor: '#0071CE',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    checkoutButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    checkoutButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkoutButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
        color: '#FFFFFF',
    },
    checkoutButtonTextDisabled: {
        color: '#9CA3AF',
    },

    // Security Notice
    securityNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    securityText: {
        color: '#059669',
        fontSize: 13,
        marginLeft: 4,
        fontWeight: '500',
    },

    // Payment Methods
    paymentMethods: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentMethodsLabel: {
        color: '#9CA3AF',
        fontSize: 13,
        marginRight: 8,
    },
    paymentIcons: {
        flexDirection: 'row',
        gap: 6,
    },
    paymentIcon: {
        width: 32,
        height: 20,
        borderRadius: 4,
    },
});