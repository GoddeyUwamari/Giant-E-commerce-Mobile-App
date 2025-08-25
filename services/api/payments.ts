/**
 * Complete Integrated Payment Service
 * Firebase Functions + Stripe + React Native
 * Production-ready e-commerce payment system
 */

import { API_HELPERS, REQUEST_CONFIG, API } from '../../config/constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

export interface ShippingAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface PaymentMethod {
    id: string;
    userId: string;
    stripePaymentMethodId: string;
    stripeCustomerId: string;
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_account';
    isDefault: boolean;
    nickname?: string;

    // Card-specific fields
    card?: {
        brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay';
        last4: string;
        expiryMonth: number;
        expiryYear: number;
        funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
        country: string;
        fingerprint: string;
        cvcCheck?: 'pass' | 'fail' | 'unavailable' | 'unchecked';
    };

    // Digital wallet fields
    wallet?: {
        type: 'apple_pay' | 'google_pay' | 'samsung_pay';
        dynamicLast4?: string;
    };

    billingDetails: {
        name: string;
        email?: string;
        phone?: string;
        address: ShippingAddress;
    };

    metadata: Record<string, string>;
    isExpired: boolean;
    isValid: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
    paymentMethodId?: string;
    customerId: string;
    orderId?: string;
    metadata: Record<string, any>;

    // Payment breakdown
    breakdown: {
        subtotal: number;
        tax: number;
        shipping: number;
        discount: number;
        fees: PaymentFee[];
        total: number;
    };

    // Shipping info
    shipping?: {
        address: ShippingAddress;
        name: string;
        phone?: string;
    };

    createdAt: string;
    updatedAt: string;
}

export interface PaymentFee {
    type: 'processing' | 'service' | 'convenience' | 'platform';
    name: string;
    amount: number;
    description?: string;
}

export interface PaymentConfirmation {
    id: string;
    paymentIntentId: string;
    orderId: string;
    status: 'succeeded' | 'failed' | 'canceled' | 'processing';
    amount: number;
    currency: string;
    paymentMethodId: string;
    receiptUrl?: string;
    failureReason?: string;
    charges: PaymentCharge[];
    createdAt: string;
}

export interface PaymentCharge {
    id: string;
    amount: number;
    status: 'pending' | 'succeeded' | 'failed';
    receiptUrl: string;
    failureCode?: string;
    failureMessage?: string;
    createdAt: string;
}

export interface TaxCalculation {
    subtotal: number;
    taxAmount: number;
    taxRate: number;
    breakdown: TaxBreakdown[];
    exemptions: TaxExemption[];
    total: number;
}

export interface TaxBreakdown {
    type: 'sales' | 'vat' | 'gst' | 'import' | 'environmental';
    jurisdiction: string;
    rate: number;
    amount: number;
    taxableAmount: number;
}

export interface TaxExemption {
    type: string;
    exemptionId: string;
    description: string;
    amount: number;
}

export interface ShippingCalculation {
    methods: ShippingMethod[];
    freeShippingThreshold?: number;
}

export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    carrier: string;
    serviceType: 'standard' | 'expedited' | 'overnight' | 'same_day' | 'two_day';
    cost: number;
    estimatedDays: string;
    isAvailable: boolean;
    cutoffTime?: string;
    features: string[];
}

export interface PromoCode {
    id: string;
    code: string;
    title: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
    value: number;
    minimumAmount?: number;
    maximumDiscount?: number;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    startsAt?: string;
    expiresAt?: string;
    applicableProducts?: string[];
    applicableCategories?: string[];
    restrictions?: string[];
    metadata: Record<string, any>;
}

export interface CreatePaymentIntentRequest {
    cartId: string;
    items: CartItem[]; // ✅ ADD THIS LINE
    paymentMethodId?: string;
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    shippingMethodId: string;
    promoCode?: string;
    savePaymentMethod?: boolean;
    metadata?: Record<string, any>;
}

export interface ConfirmPaymentRequest {
    paymentIntentId: string;
    paymentMethodId?: string;
    savePaymentMethod?: boolean;
    returnUrl?: string;
}

export interface RefundRequest {
    paymentIntentId: string;
    amount?: number;
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata?: Record<string, string>;
}

export interface RefundResponse {
    id: string;
    paymentIntentId: string;
    amount: number;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    reason?: string;
    receiptNumber?: string;
    createdAt: string;
}

export interface ValidatePromoCodeRequest {
    code: string;
    cartId: string;
    items?: string[];
}

export interface PromoCodeValidationResponse {
    isValid: boolean;
    promoCode?: PromoCode;
    applicableItems?: string[];
    estimatedDiscount?: number;
    error?: string;
    restrictions?: string[];
}

export interface CalculateTaxRequest {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    shippingCost?: number;
    exemptionId?: string;
}

export interface CalculateShippingRequest {
    items: CartItem[];
    fromAddress?: ShippingAddress;
    toAddress: ShippingAddress;
    serviceTypes?: string[];
}

// ============================================================================
// FALLBACK FUNCTIONS (for offline/testing mode)
// ============================================================================

const createFallbackTaxCalculation = (data: CalculateTaxRequest): TaxCalculation => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRates: Record<string, number> = {
        'CA': 0.0875, 'NY': 0.08, 'TX': 0.0625, 'FL': 0.06, 'WA': 0.065,
        'NV': 0.0685, 'AZ': 0.056, 'CO': 0.029, 'OR': 0.0, 'MT': 0.0,
        'NH': 0.0, 'DE': 0.0, 'AK': 0.0
    };
    const taxRate = taxRates[data.shippingAddress.state] || 0.08;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

    return {
        subtotal,
        taxAmount,
        taxRate,
        breakdown: [{
            type: 'sales',
            jurisdiction: data.shippingAddress.state,
            rate: taxRate,
            amount: taxAmount,
            taxableAmount: subtotal,
        }],
        exemptions: [],
        total: subtotal + taxAmount,
    };
};

const createFallbackShippingCalculation = (data: CalculateShippingRequest): ShippingCalculation => {
    const totalValue = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWeight = data.items.reduce((sum, item) => sum + ((item.weight || 1) * item.quantity), 0);
    const freeShippingThreshold = 35;

    const methods: ShippingMethod[] = [
        {
            id: 'standard',
            name: 'Standard Delivery',
            description: '3-5 business days',
            carrier: 'USPS',
            serviceType: 'standard',
            cost: totalValue >= freeShippingThreshold ? 0 : Math.max(5.99, totalWeight * 0.5),
            estimatedDays: '3-5',
            isAvailable: true,
            features: ['Tracking included'],
        },
        {
            id: 'expedited',
            name: 'Express Delivery',
            description: '1-2 business days',
            carrier: 'FedEx',
            serviceType: 'expedited',
            cost: totalValue >= freeShippingThreshold ? 9.99 : Math.max(15.99, totalWeight * 1.2),
            estimatedDays: '1-2',
            isAvailable: true,
            features: ['Tracking included', 'Signature required'],
        },
        {
            id: 'overnight',
            name: 'Overnight Delivery',
            description: 'Next business day',
            carrier: 'FedEx',
            serviceType: 'overnight',
            cost: Math.max(24.99, totalWeight * 2.0),
            estimatedDays: '1',
            isAvailable: totalValue >= 25,
            features: ['Tracking included', 'Signature required', 'Insurance included'],
        },
        {
            id: 'same_day',
            name: 'Same Day Delivery',
            description: 'Today by 9 PM',
            carrier: 'Local Delivery',
            serviceType: 'same_day',
            cost: 12.99,
            estimatedDays: '0',
            isAvailable: ['CA', 'NY', 'TX', 'FL'].includes(data.toAddress.state),
            features: ['Real-time tracking', 'Contact delivery person'],
        },
    ];

    return {
        methods: methods.filter(m => m.isAvailable),
        freeShippingThreshold,
    };
};

const createFallbackPromoValidation = (data: ValidatePromoCodeRequest): PromoCodeValidationResponse => {
    const mockPromoCodes: Record<string, any> = {
        'SAVE10': { type: 'percentage', value: 10, description: '10% off your order' },
        'SAVE20': { type: 'percentage', value: 20, description: '20% off your order', minimumAmount: 50 },
        'FREESHIP': { type: 'free_shipping', value: 0, description: 'Free shipping on your order' },
        'WELCOME15': { type: 'percentage', value: 15, description: '15% off for new customers' },
        'FIRSTORDER': { type: 'percentage', value: 15, description: '15% off your first order' },
        'HOLIDAY25': { type: 'percentage', value: 25, description: '25% off holiday special', maximumDiscount: 50 },
    };

    const upperCode = data.code.toUpperCase();
    const promoData = mockPromoCodes[upperCode];

    if (!promoData) {
        return {
            isValid: false,
            error: 'Invalid promo code',
        };
    }

    const promoCode: PromoCode = {
        id: `promo_${upperCode}`,
        code: upperCode,
        title: `${upperCode} Discount`,
        description: promoData.description,
        type: promoData.type,
        value: promoData.value,
        minimumAmount: promoData.minimumAmount,
        maximumDiscount: promoData.maximumDiscount,
        usageLimit: 1,
        usageCount: 0,
        isActive: true,
        metadata: {},
    };

    return {
        isValid: true,
        promoCode,
        applicableItems: data.items || [],
        estimatedDiscount: promoData.type === 'percentage' ?
            (100 * promoData.value / 100) : promoData.value,
    };
};

// ============================================================================
// MAIN PAYMENT SERVICE
// ============================================================================

export class PaymentService {
    private static instance: PaymentService;
    private baseURL: string;
    private fallbackMode: boolean;

    constructor() {
        this.baseURL = API.baseURL;
        this.fallbackMode = API.fallbackMode;
    }

    static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    // ========================================================================
    // FIREBASE FUNCTIONS INTEGRATION
    // ========================================================================

    /**
     * Calculate tax for items using Firebase Functions
     */
    async calculateTax(data: CalculateTaxRequest): Promise<TaxCalculation> {
        if (this.fallbackMode) {
            console.log('🔄 Using fallback tax calculation');
            await new Promise(resolve => setTimeout(resolve, 500));
            return createFallbackTaxCalculation(data);
        }

        try {
            const response = await fetch(API_HELPERS.getTaxCalculationUrl(), {
                method: 'POST',
                headers: REQUEST_CONFIG.headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Tax calculation failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Tax API failed, using fallback:', error);
            return createFallbackTaxCalculation(data);
        }
    }

    /**
     * Calculate shipping options using Firebase Functions
     */
    async calculateShipping(data: CalculateShippingRequest): Promise<ShippingCalculation> {
        if (this.fallbackMode) {
            console.log('🔄 Using fallback shipping calculation');
            await new Promise(resolve => setTimeout(resolve, 500));
            return createFallbackShippingCalculation(data);
        }

        try {
            const response = await fetch(API_HELPERS.getShippingCalculationUrl(), {
                method: 'POST',
                headers: REQUEST_CONFIG.headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Shipping calculation failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Shipping API failed, using fallback:', error);
            return createFallbackShippingCalculation(data);
        }
    }

    /**
     * Validate promo code using Firebase Functions
     */
    async validatePromoCode(data: ValidatePromoCodeRequest): Promise<PromoCodeValidationResponse> {
        if (this.fallbackMode) {
            console.log('🔄 Using fallback promo code validation');
            await new Promise(resolve => setTimeout(resolve, 300));
            return createFallbackPromoValidation(data);
        }

        try {
            const response = await fetch(API_HELPERS.getPromoValidationUrl(), {
                method: 'POST',
                headers: REQUEST_CONFIG.headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Promo validation failed: ${response.status}`);
            }

            const result = await response.json();

            return {
                isValid: result.isValid,
                promoCode: result.promoCode,
                applicableItems: result.applicableItems,
                estimatedDiscount: result.estimatedDiscount,
                error: result.error,
            };
        } catch (error) {
            console.warn('Promo validation API failed, using fallback:', error);
            return createFallbackPromoValidation(data);
        }
    }

    /**
     * Create payment intent using Firebase Functions + Stripe
     */
    async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
        const url = API_HELPERS.getPaymentIntentUrl();

        // Only log essential info without sensitive data
        console.log('💳 Creating payment intent...');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: REQUEST_CONFIG.headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Payment intent creation failed:', response.status);
                throw new Error(`Payment intent creation failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            // Log success without exposing sensitive data
            console.log('✅ Payment intent created successfully');

            return {
                id: result.id,
                clientSecret: result.clientSecret,
                amount: result.amount,
                currency: result.currency,
                status: result.status,
                customerId: result.customerId || '',
                metadata: result.metadata,
                breakdown: result.breakdown,
                shipping: data.shippingAddress ? {
                    address: data.shippingAddress,
                    name: 'Customer',
                } : undefined,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
            };
        } catch (error) {
            console.error('❌ Payment intent creation error:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error('Payment processing temporarily unavailable');
        }
    }

    /**
     * Update existing payment intent
     */
    async updatePaymentIntent(paymentIntentId: string, data: any): Promise<PaymentIntent> {
        try {
            console.log('⚠️ updatePaymentIntent called - using createPaymentIntent instead');

            // Ensure cartId is included in the data
            const updateData = {
                ...data,
                cartId: data.cartId || `cart_${Date.now()}` // Add missing cartId
            };

            return await this.createPaymentIntent(updateData);
        } catch (error) {
            console.error('Payment intent update failed:', error);
            throw new Error('Payment intent update failed');
        }
    }

    /**
     * Create setup intent for saving payment methods
     */
    async createSetupIntent(): Promise<{ id: string; clientSecret: string; status: string }> {
        try {
            const response = await fetch(API_HELPERS.getSetupIntentUrl(), {
                method: 'POST',
                headers: REQUEST_CONFIG.headers,
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`Setup intent creation failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Setup intent creation failed:', error);
            throw new Error('Payment setup temporarily unavailable');
        }
    }

    /**
     * Confirm payment using Firebase Functions + Stripe
     */
    async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentConfirmation> {
        try {
            const response = await fetch(API_HELPERS.getConfirmPaymentUrl(), {
                method: 'POST',
                headers: REQUEST_CONFIG.headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Payment confirmation failed: ${response.status}`);
            }

            const result = await response.json();

            return {
                id: result.id,
                paymentIntentId: result.id,
                orderId: result.metadata?.orderId || '',
                status: result.status,
                amount: result.amount,
                currency: result.currency,
                paymentMethodId: data.paymentMethodId || '',
                charges: result.charges || [],
                createdAt: result.createdAt,
            };
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            throw new Error('Payment confirmation failed');
        }
    }

    /**
     * Create refund using Firebase Functions + Stripe
     */
    async createRefund(data: RefundRequest): Promise<RefundResponse> {
        try {
            const response = await fetch(API_HELPERS.getRefundUrl(), {
                method: 'POST',
                headers: REQUEST_CONFIG.headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Refund creation failed: ${response.status}`);
            }

            const result = await response.json();

            return {
                id: result.id,
                paymentIntentId: result.paymentIntentId,
                amount: result.amount,
                status: result.status,
                reason: result.reason,
                createdAt: result.createdAt,
            };
        } catch (error) {
            console.error('Refund creation failed:', error);
            throw new Error('Refund processing failed');
        }
    }

    /**
     * Health check for Firebase Functions
     */
    async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
        try {
            const response = await fetch(API_HELPERS.getHealthCheckUrl(), {
                method: 'GET',
                headers: REQUEST_CONFIG.headers,
            });

            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                version: 'unknown',
            };
        }
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Get available promo codes (mock data)
     */
    getAvailablePromoCodes(): PromoCode[] {
        return [
            {
                id: 'promo_SAVE10',
                code: 'SAVE10',
                title: 'Save 10%',
                description: '10% off your order',
                type: 'percentage',
                value: 10,
                usageLimit: 1,
                usageCount: 0,
                isActive: true,
                metadata: {},
            },
            {
                id: 'promo_SAVE20',
                code: 'SAVE20',
                title: 'Save 20%',
                description: '20% off orders $50+',
                type: 'percentage',
                value: 20,
                minimumAmount: 50,
                usageLimit: 1,
                usageCount: 0,
                isActive: true,
                metadata: {},
            },
            {
                id: 'promo_FREESHIP',
                code: 'FREESHIP',
                title: 'Free Shipping',
                description: 'Free shipping on your order',
                type: 'free_shipping',
                value: 0,
                usageLimit: 1,
                usageCount: 0,
                isActive: true,
                metadata: {},
            },
        ];
    }

    /**
     * Format currency amount
     */
    formatCurrency(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }

    /**
     * Validate email address
     */
    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number
     */
    isValidPhone(phone: string): boolean {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    }

    /**
     * Validate postal code
     */
    isValidPostalCode(postalCode: string, country: string = 'US'): boolean {
        if (country === 'US') {
            const zipRegex = /^\d{5}(-\d{4})?$/;
            return zipRegex.test(postalCode);
        }
        return postalCode.length >= 3;
    }

    /**
     * Check if payment method is expired
     */
    isPaymentMethodExpired(paymentMethod: PaymentMethod): boolean {
        if (!paymentMethod.card) return false;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        return paymentMethod.card.expiryYear < currentYear ||
            (paymentMethod.card.expiryYear === currentYear && paymentMethod.card.expiryMonth < currentMonth);
    }

    /**
     * Calculate order total
     */
    calculateOrderTotal(
        subtotal: number,
        tax: number,
        shipping: number,
        discount: number = 0
    ): number {
        return Math.max(0, subtotal + tax + shipping - discount);
    }

    /**
     * Apply promo code discount
     */
    applyPromoDiscount(
        subtotal: number,
        promoCode: PromoCode
    ): { discountAmount: number; finalAmount: number } {
        let discountAmount = 0;

        switch (promoCode.type) {
            case 'percentage':
                discountAmount = subtotal * (promoCode.value / 100);
                if (promoCode.maximumDiscount) {
                    discountAmount = Math.min(discountAmount, promoCode.maximumDiscount);
                }
                break;
            case 'fixed':
                discountAmount = promoCode.value;
                break;
            case 'free_shipping':
                // This would be handled separately for shipping calculation
                discountAmount = 0;
                break;
            default:
                discountAmount = 0;
        }

        const finalAmount = Math.max(0, subtotal - discountAmount);

        return { discountAmount, finalAmount };
    }
}

// ============================================================================
// REACT HOOKS FOR EASY INTEGRATION
// ============================================================================

export const usePaymentService = () => {
    const paymentService = PaymentService.getInstance();

    return {
        // Tax and shipping
        calculateTax: paymentService.calculateTax.bind(paymentService),
        calculateShipping: paymentService.calculateShipping.bind(paymentService),

        // Promo codes
        validatePromoCode: paymentService.validatePromoCode.bind(paymentService),
        getAvailablePromoCodes: paymentService.getAvailablePromoCodes.bind(paymentService),
        applyPromoDiscount: paymentService.applyPromoDiscount.bind(paymentService),

        // Payments
        createPaymentIntent: paymentService.createPaymentIntent.bind(paymentService),
        createSetupIntent: paymentService.createSetupIntent.bind(paymentService),
        confirmPayment: paymentService.confirmPayment.bind(paymentService),
        createRefund: paymentService.createRefund.bind(paymentService),

        // Utilities
        formatCurrency: paymentService.formatCurrency.bind(paymentService),
        isValidEmail: paymentService.isValidEmail.bind(paymentService),
        isValidPhone: paymentService.isValidPhone.bind(paymentService),
        isValidPostalCode: paymentService.isValidPostalCode.bind(paymentService),
        isPaymentMethodExpired: paymentService.isPaymentMethodExpired.bind(paymentService),
        calculateOrderTotal: paymentService.calculateOrderTotal.bind(paymentService),

        // Health check
        healthCheck: paymentService.healthCheck.bind(paymentService),
    };
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

export const PaymentExamples = {
    /**
     * Complete checkout flow example
     */
    async completeCheckoutFlow() {
        const paymentService = PaymentService.getInstance();

        // Step 1: Calculate tax and shipping
        const items: CartItem[] = [
            {
                productId: 'iphone-15',
                name: 'iPhone 15',
                price: 799.99,
                quantity: 1,
                category: 'electronics',
                weight: 0.5,
            }
        ];

        const shippingAddress: ShippingAddress = {
            line1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
        };

        // Calculate tax
        const taxResult = await paymentService.calculateTax({
            items,
            shippingAddress,
        });

        // Calculate shipping
        const shippingResult = await paymentService.calculateShipping({
            items,
            toAddress: shippingAddress,
        });

        // Step 2: Validate promo code (optional)
        const promoResult = await paymentService.validatePromoCode({
            code: 'SAVE10',
            cartId: 'cart-123',
        });

        // Step 3: Create payment intent
        const paymentIntent = await paymentService.createPaymentIntent({
            cartId: 'cart-123',
            shippingAddress,
            shippingMethodId: 'standard',
            promoCode: promoResult.isValid ? 'SAVE10' : undefined,
        });

        console.log('✅ Checkout flow completed:', {
            taxResult,
            shippingResult,
            promoResult,
            paymentIntent,
        });

        return { taxResult, shippingResult, promoResult, paymentIntent };
    },

    /**
     * Health check example
     */
    async checkSystemHealth() {
        const paymentService = PaymentService.getInstance();
        const health = await paymentService.healthCheck();
        console.log('🏥 System health:', health);
        return health;
    },
};

// Export singleton instance
export const paymentService = PaymentService.getInstance();
export default PaymentService;