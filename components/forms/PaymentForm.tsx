import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { CardField, useStripe } from '@stripe/stripe-react-native';

// Import payment service
import { usePaymentService } from '../../services/api/payments';

interface PaymentFormProps {
    onSubmit: (data: PaymentFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    submitText?: string;
    title?: string;
    showSaveOption?: boolean;
    showBillingAddress?: boolean;
    prefillBillingAddress?: boolean;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    useStripeCardField?: boolean;
    initialData?: Partial<PaymentFormData>;
    mode?: 'add' | 'edit';
}

// 🚀 UPDATED: Enhanced PaymentFormData interface with cardData
interface PaymentFormData {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName: string;
    billingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    saveCard?: boolean;
    setAsDefault?: boolean;
    useSameAddress?: boolean;
    cardData?: any; // 🚀 NEW: Stripe card field data
}

interface CardState {
    complete: boolean;
    brand: string;
    last4: string;
    validExpiryDate: boolean;
    validCVC: boolean;
    validNumber: boolean;
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

const US_STATES = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
];

// Utility Functions
const formatCardNumber = (value: string): string => {
    const numbers = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = numbers.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : match;
};

const formatExpiryDate = (value: string): string => {
    const numbers = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (numbers.length >= 2) {
        return numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
    }
    return numbers;
};

const validateCardNumber = (value: string): string | boolean => {
    const numbers = value.replace(/\s+/g, '');
    if (numbers.length < 13 || numbers.length > 19) {
        return 'Card number must be between 13 and 19 digits';
    }

    // Luhn algorithm for card validation
    let sum = 0;
    let isEven = false;
    for (let i = numbers.length - 1; i >= 0; i--) {
        let digit = parseInt(numbers.charAt(i), 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0 || 'Please enter a valid card number';
};

const validateExpiryDate = (value: string): string | boolean => {
    const [month, year] = value.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2) {
        return 'Please enter expiry date in MM/YY format';
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) {
        return 'Please enter a valid month (01-12)';
    }

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        return 'Card has expired';
    }

    return true;
};

const validateCVV = (value: string): string | boolean => {
    if (value.length < 3 || value.length > 4) {
        return 'CVV must be 3 or 4 digits';
    }
    return true;
};

const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s+/g, '');

    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';

    return 'card';
};

const getCardIcon = (brand: string): string => {
    const cardIcons = {
        visa: 'card',
        mastercard: 'card',
        amex: 'card',
        discover: 'card',
    };
    return cardIcons[brand as keyof typeof cardIcons] || 'card';
};

// Main Component
export default function PaymentForm({
                                        onSubmit,
                                        onCancel,
                                        isLoading = false,
                                        submitText = 'Save Payment Method',
                                        title = 'Add Payment Method',
                                        showSaveOption = true,
                                        showBillingAddress = true,
                                        prefillBillingAddress = true,
                                        shippingAddress,
                                        useStripeCardField = true,
                                        initialData,
                                        mode = 'add',
                                    }: PaymentFormProps): JSX.Element {
    // 🚀 NEW: Card field reference for data extraction
    const [cardFieldData, setCardFieldData] = useState<any>(null);

    // State
    const [showStateModal, setShowStateModal] = useState(false);
    const [useSameAddress, setUseSameAddress] = useState(
        prefillBillingAddress && !!shippingAddress
    );
    const [cardDetails, setCardDetails] = useState<CardState>({
        complete: false,
        brand: '',
        last4: '',
        validExpiryDate: false,
        validCVC: false,
        validNumber: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hooks
    const { confirmPayment } = useStripe();
    const paymentService = usePaymentService();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
        reset,
    } = useForm<PaymentFormData>({
        defaultValues: {
            cardNumber: initialData?.cardNumber || '',
            expiryDate: initialData?.expiryDate || '',
            cvv: '',
            cardholderName: initialData?.cardholderName || '',
            billingAddress: {
                street: initialData?.billingAddress?.street || '',
                city: initialData?.billingAddress?.city || '',
                state: initialData?.billingAddress?.state || '',
                zipCode: initialData?.billingAddress?.zipCode || '',
                country: initialData?.billingAddress?.country || 'US',
            },
            saveCard: initialData?.saveCard ?? true,
            setAsDefault: initialData?.setAsDefault ?? false,
        },
        mode: 'onChange',
    });

    // Watched values
    const selectedState = watch('billingAddress.state');
    const saveCard = watch('saveCard');
    const watchedCardNumber = watch('cardNumber');

    // Effects
    useEffect(() => {
        if (useSameAddress && shippingAddress) {
            setValue('billingAddress.street', shippingAddress.street);
            setValue('billingAddress.city', shippingAddress.city);
            setValue('billingAddress.state', shippingAddress.state);
            setValue('billingAddress.zipCode', shippingAddress.zipCode);
            setValue('billingAddress.country', shippingAddress.country);
        } else if (!useSameAddress && !initialData?.billingAddress) {
            setValue('billingAddress.street', '');
            setValue('billingAddress.city', '');
            setValue('billingAddress.state', '');
            setValue('billingAddress.zipCode', '');
        }
    }, [useSameAddress, shippingAddress, setValue, initialData]);

    // Pre-fill form with initial data if provided
    useEffect(() => {
        if (initialData) {
            Object.keys(initialData).forEach((key) => {
                if (initialData[key as keyof PaymentFormData] !== undefined) {
                    setValue(key as keyof PaymentFormData, initialData[key as keyof PaymentFormData] as any);
                }
            });
        }
    }, [initialData, setValue]);

    // Memoized values
    const isFormValid = useMemo(() => {
        if (useStripeCardField) {
            return cardDetails.complete && cardDetails.validNumber && cardDetails.validExpiryDate && cardDetails.validCVC;
        }
        return isValid;
    }, [useStripeCardField, cardDetails, isValid]);

    const selectedStateName = useMemo(() => {
        return US_STATES.find(state => state.code === selectedState)?.name || selectedState;
    }, [selectedState]);

    const currentCardBrand = useMemo(() => {
        return getCardBrand(watchedCardNumber);
    }, [watchedCardNumber]);

    // 🚀 COMPLETELY REWRITTEN: Enhanced form submission with card data extraction
    const handleFormSubmit = useCallback(async (data: PaymentFormData) => {
        if (useStripeCardField && !cardDetails.complete) {
            Alert.alert('Error', 'Please enter complete card information');
            return;
        }

        try {
            setIsSubmitting(true);

            // Enhanced validation
            if (!paymentService.isValidEmail && data.cardholderName.includes('@')) {
                Alert.alert('Error', 'Please enter the cardholder name, not email address');
                return;
            }

            if (showBillingAddress && !useSameAddress) {
                if (!paymentService.isValidPostalCode(data.billingAddress.zipCode)) {
                    Alert.alert('Error', 'Please enter a valid ZIP code');
                    return;
                }
            }

            // 🚀 NEW: Extract card data from Stripe CardField
            let enhancedData = { ...data };

            if (useStripeCardField) {
                if (!cardFieldData) {
                    Alert.alert('Error', 'Card information is not ready. Please re-enter your card details.');
                    return;
                }

                if (!cardDetails.complete) {
                    Alert.alert('Error', 'Please complete all card information fields');
                    return;
                }

                // 🚀 FIXED: Include the actual card field data
                enhancedData.cardData = cardFieldData;

                console.log('✅ Card data extracted successfully:', {
                    complete: cardDetails.complete,
                    brand: cardDetails.brand,
                    last4: cardDetails.last4,
                    hasCardData: !!cardFieldData
                });
            }

            // Log form submission for debugging
            console.log('Submitting payment form:', {
                mode,
                hasCardDetails: useStripeCardField ? !!enhancedData.cardData : true,
                hasBillingAddress: !!data.billingAddress.street,
                useStripeCardField,
                cardComplete: cardDetails.complete
            });

            // 🚀 FIXED: Pass enhanced data with cardData
            await onSubmit(enhancedData);

        } catch (error) {
            console.error('Form submission error:', error);
            Alert.alert('Error', 'Failed to process payment information. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [
        useStripeCardField,
        cardDetails,
        onSubmit,
        mode,
        paymentService,
        showBillingAddress,
        useSameAddress,
        cardFieldData
    ]);

    const handleStateSelection = useCallback((stateCode: string) => {
        setValue('billingAddress.state', stateCode);
        setShowStateModal(false);
    }, [setValue]);

    const handleSameAddressToggle = useCallback(() => {
        setUseSameAddress(!useSameAddress);
    }, [useSameAddress]);

    // 🚀 UPDATED: Enhanced card details change handler with data capture
    const handleCardDetailsChange = useCallback((details: any) => {
        console.log('Card details changed:', {
            complete: details.complete,
            brand: details.brand,
            last4: details.last4,
            validNumber: details.validNumber,
            validExpiryDate: details.validExpiryDate,
            validCVC: details.validCVC
        });

        setCardDetails({
            complete: details.complete,
            brand: details.brand || '',
            last4: details.last4 || '',
            validExpiryDate: details.validExpiryDate || false,
            validCVC: details.validCVC || false,
            validNumber: details.validNumber || false,
        });

        // 🚀 NEW: Store the complete card field data for submission
        if (details.complete) {
            setCardFieldData(details);
            console.log('✅ Card field data captured for submission');
        } else {
            setCardFieldData(null);
        }
    }, []);

    const handleCancel = useCallback(() => {
        if (onCancel) {
            onCancel();
        }
    }, [onCancel]);

    // Enhanced validation with payment service
    const validateZipCode = useCallback((value: string): string | boolean => {
        return paymentService.isValidPostalCode(value) || 'Please enter a valid ZIP code';
    }, [paymentService]);

    // 🚀 UPDATED: Enhanced Stripe card field rendering
    const renderStripeCardField = () => {
        if (!useStripeCardField) return null;

        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Card Information</Text>
                <View style={[
                    styles.stripeCardContainer,
                    cardDetails.complete && styles.stripeCardValid,
                    !cardDetails.complete && cardDetails.brand && styles.stripeCardInvalid,
                ]}>
                    <CardField
                        postalCodeEnabled={false}
                        placeholders={{
                            number: '4242 4242 4242 4242',
                            expiry: 'MM/YY',
                            cvc: 'CVC',
                        }}
                        cardStyle={{
                            backgroundColor: WALMART_COLORS.white,
                            textColor: WALMART_COLORS.gray900,
                            placeholderColor: WALMART_COLORS.gray400,
                            fontSize: 16,
                        }}
                        style={styles.stripeCardField}
                        onCardChange={handleCardDetailsChange}
                        // 🚀 NEW: Enable full card details access
                        dangerouslyGetFullCardDetails={true}
                    />
                </View>
                {cardDetails.brand && (
                    <View style={styles.cardBrandIndicator}>
                        <Ionicons
                            name={getCardIcon(cardDetails.brand) as any}
                            size={16}
                            color={WALMART_COLORS.primary}
                        />
                        <Text style={styles.cardBrandText}>
                            {cardDetails.brand.charAt(0).toUpperCase() + cardDetails.brand.slice(1)} detected
                        </Text>
                        {cardDetails.complete && (
                            <Ionicons name="checkmark-circle" size={16} color={WALMART_COLORS.success} />
                        )}
                    </View>
                )}

                {/* 🚀 NEW: Card validation status display */}
                {useStripeCardField && cardDetails.brand && (
                    <View style={styles.cardValidationStatus}>
                        <View style={styles.validationItem}>
                            <Ionicons
                                name={cardDetails.validNumber ? "checkmark-circle" : "close-circle"}
                                size={12}
                                color={cardDetails.validNumber ? WALMART_COLORS.success : WALMART_COLORS.gray400}
                            />
                            <Text style={[
                                styles.validationText,
                                { color: cardDetails.validNumber ? WALMART_COLORS.success : WALMART_COLORS.gray400 }
                            ]}>
                                Number
                            </Text>
                        </View>
                        <View style={styles.validationItem}>
                            <Ionicons
                                name={cardDetails.validExpiryDate ? "checkmark-circle" : "close-circle"}
                                size={12}
                                color={cardDetails.validExpiryDate ? WALMART_COLORS.success : WALMART_COLORS.gray400}
                            />
                            <Text style={[
                                styles.validationText,
                                { color: cardDetails.validExpiryDate ? WALMART_COLORS.success : WALMART_COLORS.gray400 }
                            ]}>
                                Expiry
                            </Text>
                        </View>
                        <View style={styles.validationItem}>
                            <Ionicons
                                name={cardDetails.validCVC ? "checkmark-circle" : "close-circle"}
                                size={12}
                                color={cardDetails.validCVC ? WALMART_COLORS.success : WALMART_COLORS.gray400}
                            />
                            <Text style={[
                                styles.validationText,
                                { color: cardDetails.validCVC ? WALMART_COLORS.success : WALMART_COLORS.gray400 }
                            ]}>
                                CVC
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderManualCardFields = () => {
        if (useStripeCardField) return null;

        return (
            <>
                {/* Card Number */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Card Number</Text>
                    <Controller
                        control={control}
                        name="cardNumber"
                        rules={{
                            required: 'Card number is required',
                            validate: validateCardNumber,
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={styles.cardNumberContainer}>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        styles.cardNumberInput,
                                        errors.cardNumber && styles.textInputError,
                                    ]}
                                    placeholder="1234 5678 9012 3456"
                                    placeholderTextColor={WALMART_COLORS.gray400}
                                    value={value}
                                    onChangeText={(text) => onChange(formatCardNumber(text))}
                                    onBlur={onBlur}
                                    keyboardType="numeric"
                                    maxLength={19}
                                    autoComplete="cc-number"
                                />
                                <View style={styles.cardIcon}>
                                    <Ionicons
                                        name={getCardIcon(getCardBrand(value)) as any}
                                        size={20}
                                        color={WALMART_COLORS.gray400}
                                    />
                                </View>
                            </View>
                        )}
                    />
                    {errors.cardNumber && (
                        <Text style={styles.errorText}>{errors.cardNumber.message}</Text>
                    )}
                    {currentCardBrand !== 'card' && (
                        <View style={styles.cardBrandIndicator}>
                            <Text style={styles.cardBrandText}>
                                {currentCardBrand.charAt(0).toUpperCase() + currentCardBrand.slice(1)} detected
                            </Text>
                        </View>
                    )}
                </View>

                {/* Expiry Date and CVV */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Expiry Date</Text>
                        <Controller
                            control={control}
                            name="expiryDate"
                            rules={{
                                required: 'Expiry date is required',
                                validate: validateExpiryDate,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        errors.expiryDate && styles.textInputError,
                                    ]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={WALMART_COLORS.gray400}
                                    value={value}
                                    onChangeText={(text) => onChange(formatExpiryDate(text))}
                                    onBlur={onBlur}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    autoComplete="cc-exp"
                                />
                            )}
                        />
                        {errors.expiryDate && (
                            <Text style={styles.errorText}>{errors.expiryDate.message}</Text>
                        )}
                    </View>

                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>CVV</Text>
                        <Controller
                            control={control}
                            name="cvv"
                            rules={{
                                required: 'CVV is required',
                                validate: validateCVV,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.cvvContainer}>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            styles.cvvInput,
                                            errors.cvv && styles.textInputError,
                                        ]}
                                        placeholder="123"
                                        placeholderTextColor={WALMART_COLORS.gray400}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        secureTextEntry
                                        autoComplete="cc-csc"
                                    />
                                    <TouchableOpacity style={styles.cvvInfo}>
                                        <Ionicons
                                            name="information-circle-outline"
                                            size={16}
                                            color={WALMART_COLORS.gray400}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.cvv && (
                            <Text style={styles.errorText}>{errors.cvv.message}</Text>
                        )}
                    </View>
                </View>
            </>
        );
    };

    const renderBillingAddress = () => {
        if (!showBillingAddress) return null;

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Billing Address</Text>

                {/* Same as Shipping Address */}
                {shippingAddress && (
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={handleSameAddressToggle}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    useSameAddress && styles.checkboxSelected,
                                ]}
                            >
                                {useSameAddress && (
                                    <Ionicons
                                        name="checkmark"
                                        size={14}
                                        color={WALMART_COLORS.white}
                                    />
                                )}
                            </View>
                            <View style={styles.checkboxContent}>
                                <Text style={styles.checkboxLabel}>Same as shipping address</Text>
                                <Text style={styles.checkboxSubtext}>
                                    Use your delivery address for billing
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Street Address */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Street Address *</Text>
                    <Controller
                        control={control}
                        name="billingAddress.street"
                        rules={{ required: 'Street address is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.textInput,
                                    errors.billingAddress?.street && styles.textInputError,
                                    useSameAddress && styles.textInputDisabled,
                                ]}
                                placeholder="123 Main Street"
                                placeholderTextColor={WALMART_COLORS.gray400}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                editable={!useSameAddress}
                                autoComplete="street-address"
                            />
                        )}
                    />
                    {errors.billingAddress?.street && (
                        <Text style={styles.errorText}>
                            {errors.billingAddress.street.message}
                        </Text>
                    )}
                </View>

                {/* City */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>City *</Text>
                    <Controller
                        control={control}
                        name="billingAddress.city"
                        rules={{ required: 'City is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.textInput,
                                    errors.billingAddress?.city && styles.textInputError,
                                    useSameAddress && styles.textInputDisabled,
                                ]}
                                placeholder="New York"
                                placeholderTextColor={WALMART_COLORS.gray400}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                editable={!useSameAddress}
                                autoComplete="address-level2"
                            />
                        )}
                    />
                    {errors.billingAddress?.city && (
                        <Text style={styles.errorText}>
                            {errors.billingAddress.city.message}
                        </Text>
                    )}
                </View>

                {/* State and ZIP */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>State *</Text>
                        <TouchableOpacity
                            style={[styles.selectorButton,
                                errors.billingAddress?.state && styles.textInputError,
                                useSameAddress && styles.textInputDisabled,
                            ]}
                            onPress={() => !useSameAddress && setShowStateModal(true)}
                            disabled={useSameAddress}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.selectorButtonText,
                                !selectedState && styles.placeholderText,
                            ]}>
                                {selectedState ? selectedStateName : 'Select State'}
                            </Text>
                            <Ionicons
                                name="chevron-down"
                                size={20}
                                color={WALMART_COLORS.gray400}
                            />
                        </TouchableOpacity>
                        {errors.billingAddress?.state && (
                            <Text style={styles.errorText}>
                                {errors.billingAddress.state.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>ZIP Code *</Text>
                        <Controller
                            control={control}
                            name="billingAddress.zipCode"
                            rules={{
                                required: 'ZIP code is required',
                                validate: validateZipCode,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        errors.billingAddress?.zipCode && styles.textInputError,
                                        useSameAddress && styles.textInputDisabled,
                                    ]}
                                    placeholder="10001"
                                    placeholderTextColor={WALMART_COLORS.gray400}
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    editable={!useSameAddress}
                                    autoComplete="postal-code"
                                />
                            )}
                        />
                        {errors.billingAddress?.zipCode && (
                            <Text style={styles.errorText}>
                                {errors.billingAddress.zipCode.message}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Preview address when using same as shipping */}
                {useSameAddress && shippingAddress && (
                    <View style={styles.addressPreview}>
                        <View style={styles.addressPreviewHeader}>
                            <Ionicons name="location" size={16} color={WALMART_COLORS.primary} />
                            <Text style={styles.addressPreviewTitle}>Billing Address</Text>
                        </View>
                        <Text style={styles.addressPreviewText}>
                            {shippingAddress.street}
                            {'\n'}{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderSaveOptions = () => {
        if (!showSaveOption) return null;

        return (
            <View style={styles.saveOptionsContainer}>
                <Controller
                    control={control}
                    name="saveCard"
                    render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => onChange(!value)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    value && styles.checkboxSelected,
                                ]}
                            >
                                {value && (
                                    <Ionicons
                                        name="checkmark"
                                        size={14}
                                        color={WALMART_COLORS.white}
                                    />
                                )}
                            </View>
                            <View style={styles.checkboxContent}>
                                <Text style={styles.checkboxLabel}>
                                    Save this card for future purchases
                                </Text>
                                <Text style={styles.checkboxSubtext}>
                                    Securely store your card for faster checkout
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />

                {saveCard && (
                    <Controller
                        control={control}
                        name="setAsDefault"
                        render={({ field: { onChange, value } }) => (
                            <TouchableOpacity
                                style={[styles.checkboxRow, styles.nestedCheckbox]}
                                onPress={() => onChange(!value)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        value && styles.checkboxSelected,
                                    ]}
                                >
                                    {value && (
                                        <Ionicons
                                            name="checkmark"
                                            size={14}
                                            color={WALMART_COLORS.white}
                                        />
                                    )}
                                </View>
                                <View style={styles.checkboxContent}>
                                    <Text style={styles.checkboxLabel}>
                                        Set as default payment method
                                    </Text>
                                    <Text style={styles.checkboxSubtext}>
                                        Use this card for all future orders
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        );
    };

    const renderStateModal = () => (
        <Modal
            visible={showStateModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowStateModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select State</Text>
                        <TouchableOpacity
                            onPress={() => setShowStateModal(false)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color={WALMART_COLORS.gray700}
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                        {US_STATES.map((state) => (
                            <TouchableOpacity
                                key={state.code}
                                style={[
                                    styles.modalItem,
                                    selectedState === state.code && styles.modalItemSelected,
                                ]}
                                onPress={() => handleStateSelection(state.code)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.modalItemText,
                                    selectedState === state.code && styles.modalItemTextSelected,
                                ]}>
                                    {state.name}
                                </Text>
                                {selectedState === state.code && (
                                    <Ionicons
                                        name="checkmark"
                                        size={20}
                                        color={WALMART_COLORS.primary}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>
                        Your payment information is encrypted and secure
                    </Text>
                </View>

                {/* Form Progress Indicator (for edit mode) */}
                {mode === 'edit' && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '100%' }]} />
                        </View>
                        <Text style={styles.progressText}>Updating payment method</Text>
                    </View>
                )}

                {/* Cardholder Name */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Cardholder Name *</Text>
                    <Controller
                        control={control}
                        name="cardholderName"
                        rules={{
                            required: 'Cardholder name is required',
                            minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters'
                            }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.textInput,
                                    errors.cardholderName && styles.textInputError,
                                ]}
                                placeholder="John Doe"
                                placeholderTextColor={WALMART_COLORS.gray400}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="words"
                                autoComplete="cc-name"
                                maxLength={50}
                            />
                        )}
                    />
                    {errors.cardholderName && (
                        <Text style={styles.errorText}>{errors.cardholderName.message}</Text>
                    )}
                </View>

                {/* Card Fields */}
                {renderStripeCardField()}
                {renderManualCardFields()}

                {/* Billing Address */}
                {renderBillingAddress()}

                {/* Save Options */}
                {renderSaveOptions()}

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                    <View style={styles.securityHeader}>
                        <Ionicons
                            name="shield-checkmark"
                            size={20}
                            color={WALMART_COLORS.success}
                        />
                        <Text style={styles.securityTitle}>Secure Payment</Text>
                    </View>
                    <Text style={styles.securityText}>
                        Your payment information is encrypted using 256-bit SSL technology and is never stored on our servers.
                        We are PCI DSS compliant and follow industry best practices for data security.
                    </Text>
                    <View style={styles.securityFeatures}>
                        <View style={styles.securityFeature}>
                            <Ionicons name="lock-closed" size={14} color={WALMART_COLORS.success} />
                            <Text style={styles.securityFeatureText}>256-bit SSL encryption</Text>
                        </View>
                        <View style={styles.securityFeature}>
                            <Ionicons name="shield-checkmark" size={14} color={WALMART_COLORS.success} />
                            <Text style={styles.securityFeatureText}>PCI DSS compliant</Text>
                        </View>
                    </View>
                </View>

                {/* Development Mode Notice */}
                {__DEV__ && (
                    <View style={styles.devNotice}>
                        <View style={styles.devHeader}>
                            <Ionicons name="code-working" size={18} color={WALMART_COLORS.warning} />
                            <Text style={styles.devTitle}>Development Mode</Text>
                        </View>
                        <Text style={styles.devText}>
                            Test card: 4242 4242 4242 4242 with any future expiry date and any 3-digit CVC.
                        </Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    {onCancel && (
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            disabled={isLoading || isSubmitting}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.submitButton,
                            isFormValid && !isLoading && !isSubmitting
                                ? styles.submitButtonEnabled
                                : styles.submitButtonDisabled,
                            onCancel && styles.submitButtonFlex,
                        ]}
                        onPress={handleSubmit(handleFormSubmit)}
                        disabled={!isFormValid || isLoading || isSubmitting}
                        activeOpacity={0.7}
                    >
                        {(isLoading || isSubmitting) ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={WALMART_COLORS.white} />
                                <Text style={styles.loadingText}>
                                    {mode === 'edit' ? 'Updating...' : 'Processing...'}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.submitButtonContent}>
                                <Ionicons
                                    name="lock-closed"
                                    size={16}
                                    color={WALMART_COLORS.white}
                                    style={styles.submitButtonIcon}
                                />
                                <Text style={styles.submitButtonText}>{submitText}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Help Text */}
                <View style={styles.helpContainer}>
                    <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
                        <Ionicons name="help-circle-outline" size={16} color={WALMART_COLORS.primary} />
                        <Text style={styles.helpText}>Need help with payment?</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* State Selection Modal */}
            {renderStateModal()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: WALMART_COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: SPACING.xxl,
        paddingBottom: SPACING.xxxl,
    },

    // Header Styles
    headerContainer: {
        marginBottom: SPACING.xxxl,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.xxl,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.sm,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    headerSubtitle: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.sm,
        lineHeight: 20,
        textAlign: 'center',
        maxWidth: screenWidth * 0.8,
    },

    // Progress Indicator (for edit mode)
    progressContainer: {
        marginBottom: SPACING.xxl,
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: WALMART_COLORS.gray200,
        borderRadius: 2,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: WALMART_COLORS.primary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: TYPOGRAPHY.xs,
        color: WALMART_COLORS.gray500,
        fontWeight: '500',
    },

    // Form Field Styles
    fieldContainer: {
        marginBottom: SPACING.xl,
    },
    fieldLabel: {
        color: WALMART_COLORS.gray900,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.md,
        marginBottom: SPACING.sm,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    textInput: {
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray300,
        borderRadius: 12,
        paddingHorizontal: SPACING.lg,
        paddingVertical: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray900,
        backgroundColor: WALMART_COLORS.white,
        minHeight: 50,
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
    textInputError: {
        borderColor: WALMART_COLORS.error,
        borderWidth: 2,
    },
    textInputDisabled: {
        opacity: 0.6,
        backgroundColor: WALMART_COLORS.gray50,
        color: WALMART_COLORS.gray500,
    },
    errorText: {
        color: WALMART_COLORS.error,
        fontSize: TYPOGRAPHY.xs,
        marginTop: SPACING.xs,
        fontWeight: '500',
    },
    placeholderText: {
        color: WALMART_COLORS.gray400,
    },

    // Stripe Card Field Styles
    stripeCardContainer: {
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray300,
        borderRadius: 12,
        padding: SPACING.lg,
        backgroundColor: WALMART_COLORS.white,
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
    stripeCardValid: {
        borderColor: WALMART_COLORS.success,
        borderWidth: 2,
    },
    stripeCardInvalid: {
        borderColor: WALMART_COLORS.error,
        borderWidth: 2,
    },
    stripeCardField: {
        width: '100%',
        height: 50,
    },
    cardBrandIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    cardBrandText: {
        fontSize: TYPOGRAPHY.xs,
        color: WALMART_COLORS.gray600,
        marginLeft: SPACING.xs,
        fontWeight: '500',
        flex: 1,
    },

    // 🚀 NEW: Card validation status styles
    cardValidationStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.xs,
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 8,
        paddingVertical: SPACING.sm,
    },
    validationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    validationText: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '500',
        marginLeft: SPACING.xs,
    },

    // Card Number Field Styles
    cardNumberContainer: {
        position: 'relative',
    },
    cardNumberInput: {
        paddingRight: 50,
    },
    cardIcon: {
        position: 'absolute',
        right: SPACING.md,
        top: '50%',
        transform: [{ translateY: -10 }],
    },

    // CVV Field Styles
    cvvContainer: {
        position: 'relative',
    },
    cvvInput: {
        paddingRight: 40,
    },
    cvvInfo: {
        position: 'absolute',
        right: SPACING.md,
        top: '50%',
        transform: [{ translateY: -8 }],
        padding: SPACING.xs,
    },

    // Layout Styles
    rowContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    halfField: {
        flex: 1,
    },

    // Section Styles
    sectionContainer: {
        marginBottom: SPACING.xxl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.lg,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },

    // Selector Button Styles
    selectorButton: {
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray300,
        borderRadius: 12,
        paddingHorizontal: SPACING.lg,
        paddingVertical: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
        backgroundColor: WALMART_COLORS.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 50,
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
    selectorButtonText: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray900,
        flex: 1,
    },

    // Checkbox Styles
    checkboxContainer: {
        marginBottom: SPACING.lg,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: SPACING.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: WALMART_COLORS.gray300,
        borderRadius: 4,
        marginRight: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: WALMART_COLORS.white,
        marginTop: 2,
    },
    checkboxSelected: {
        backgroundColor: WALMART_COLORS.primary,
        borderColor: WALMART_COLORS.primary,
    },
    checkboxContent: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray700,
        fontWeight: '500',
        lineHeight: 20,
    },
    checkboxSubtext: {
        fontSize: TYPOGRAPHY.xs,
        color: WALMART_COLORS.gray500,
        marginTop: SPACING.xs,
        lineHeight: 16,
    },
    nestedCheckbox: {
        marginLeft: SPACING.xxxl,
        marginTop: SPACING.sm,
    },

    // Address Preview Styles
    addressPreview: {
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 12,
        padding: SPACING.lg,
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray200,
    },
    addressPreviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    addressPreviewTitle: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.primary,
        marginLeft: SPACING.sm,
    },
    addressPreviewText: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray600,
        lineHeight: 18,
    },

    // Save Options Styles
    saveOptionsContainer: {
        marginBottom: SPACING.xxl,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray200,
    },

    // Security Notice Styles
    securityNotice: {
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.xxl,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray200,
    },
    securityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    securityTitle: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        color: WALMART_COLORS.success,
        marginLeft: SPACING.sm,
    },
    securityText: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray600,
        lineHeight: 18,
        marginBottom: SPACING.md,
    },
    securityFeatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.md,
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: WALMART_COLORS.white,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 8,
    },
    securityFeatureText: {
        fontSize: TYPOGRAPHY.xs,
        color: WALMART_COLORS.success,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },

    // Development Notice Styles
    devNotice: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.xxl,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    devHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    devTitle: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        color: WALMART_COLORS.warning,
        marginLeft: SPACING.sm,
    },
    devText: {
        fontSize: TYPOGRAPHY.sm,
        color: '#92400E',
        lineHeight: 18,
    },

    // Button Styles
    buttonContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.lg,
    },
    button: {
        borderRadius: 12,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
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
    cancelButton: {
        backgroundColor: WALMART_COLORS.white,
        borderWidth: 2,
        borderColor: WALMART_COLORS.gray300,
        flex: 1,
    },
    cancelButtonText: {
        color: WALMART_COLORS.gray700,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
    },
    submitButton: {
        flex: 2,
    },
    submitButtonEnabled: {
        backgroundColor: WALMART_COLORS.primary,
    },
    submitButtonDisabled: {
        backgroundColor: WALMART_COLORS.gray300,
    },
    submitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonIcon: {
        marginRight: SPACING.sm,
    },
    submitButtonText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '700',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    submitButtonFlex: {
        flex: 2,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },

    // Help Container Styles
    helpContainer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    helpText: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.primary,
        fontWeight: '500',
        marginLeft: SPACING.sm,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: WALMART_COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: screenWidth * 1.2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: WALMART_COLORS.gray200,
    },
    modalTitle: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
    },
    modalList: {
        maxHeight: screenWidth * 0.8,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: WALMART_COLORS.gray100,
    },
    modalItemSelected: {
        backgroundColor: WALMART_COLORS.gray50,
    },
    modalItemText: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray900,
        flex: 1,
    },
    modalItemTextSelected: {
        color: WALMART_COLORS.primary,
        fontWeight: '600',
    },
});