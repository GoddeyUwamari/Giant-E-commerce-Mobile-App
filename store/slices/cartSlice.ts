import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import asyncStorage, { cartItems } from '../../services/storage/asyncStorage';
import { paymentService as paymentsAPI } from '../../services/api/payments';

import type {
    PaymentIntent,
    TaxCalculation,
    ShippingCalculation,
    PromoCodeValidationResponse,
    SetupIntent
} from '../../services/api/payments';

// Production Configuration
const PRODUCTION_CONFIG = {
    TAX_SERVICE_ENABLED: true,
    SHIPPING_SERVICE_ENABLED: true,
    PAYMENT_INTENTS_ENABLED: true,
    REAL_TIME_VALIDATION: true,
    CACHE_TTL: 300000, // 5 minutes
    REQUEST_TIMEOUT: 10000, // 10 seconds
    MAX_RETRY_ATTEMPTS: 3,
    DEBOUNCE_DELAY: 500,
};

// Type definitions
export type CartItemStatus = 'available' | 'out_of_stock' | 'limited_stock' | 'discontinued';
export type DeliveryOption = 'pickup' | 'delivery' | 'shipping';

export interface ProductVariant {
    size?: string;
    color?: string;
    style?: string;
    flavor?: string;
    [key: string]: any;
}

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    brand?: string;
    description?: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    quantity: number;
    maxQuantity: number;
    minQuantity: number;
    image: string;
    images?: string[];
    category: string;
    subcategory?: string;
    sku: string;
    upc?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    variant?: ProductVariant;
    status: CartItemStatus;
    addedAt: string;
    updatedAt: string;
    storeId: string;
    storeName: string;
    departmentId?: string;
    departmentName?: string;
    isGift?: boolean;
    giftMessage?: string;
    giftWrap?: boolean;
    prescription?: {
        required: boolean;
        rxNumber?: string;
        doctorName?: string;
    };
    delivery: {
        option: DeliveryOption;
        estimatedDate?: string;
        fee?: number;
        freeShippingEligible?: boolean;
    };
    promotions?: Array<{
        id: string;
        type: 'discount' | 'bogo' | 'free_shipping' | 'cashback';
        description: string;
        value: number;
        isPercentage: boolean;
        applied: boolean;
    }>;
    nutrition?: {
        calories?: number;
        servingSize?: string;
        allergens?: string[];
        ingredients?: string[];
    };
}

export interface CartSummary {
    subtotal: number;
    tax: number;
    shipping: number;
    delivery: number;
    fees: number;
    discounts: number;
    total: number;
    savings: number;
    itemCount: number;
    uniqueItemCount: number;
    estimatedDelivery?: string;
    freeShippingThreshold?: number;
    freeShippingRemaining?: number;
    paymentIntentId?: string;
    clientSecret?: string;
    stripeCalculatedTax?: number;
    stripeCalculatedShipping?: number;
}

export interface PromoCode {
    code: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
    value: number;
    minOrder?: number;
    maxDiscount?: number;
    expiresAt?: string;
    usageLimit?: number;
    usageCount?: number;
    isValid: boolean;
    errorMessage?: string;
}

export interface DeliveryAddress {
    id: string;
    name: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    instructions?: string;
    isDefault: boolean;
    latitude?: number;
    longitude?: number;
}

export interface CartPreferences {
    saveForLater: boolean;
    autoAddRecommendations: boolean;
    substituteUnavailableItems: boolean;
    notifyPriceChanges: boolean;
    notifyStockChanges: boolean;
    preferredDeliveryOption: DeliveryOption;
    maxCartValue?: number;
    reminderTime?: number;
    realTimeUpdates?: boolean;
}

export interface CartState {
    items: CartItem[];
    savedItems: CartItem[];
    recentlyRemovedItems: CartItem[];
    summary: CartSummary;
    appliedPromoCodes: PromoCode[];
    availablePromoCodes: PromoCode[];
    deliveryAddress: DeliveryAddress | null;
    deliveryOptions: DeliveryOption[];
    selectedDeliveryOption: DeliveryOption;
    selectedStoreId: string | null;
    availableStores: Array<{
        id: string;
        name: string;
        distance: number;
        hasPickup: boolean;
        hasDelivery: boolean;
    }>;
    preferences: CartPreferences;
    isLoading: boolean;
    isSyncing: boolean;
    lastSyncedAt: string | null;
    error: string | null;
    expiresAt: string | null;
    reminderShown: boolean;
    paymentIntent: PaymentIntent | null;
    setupIntent: SetupIntent | null;
    isCalculatingPayment: boolean;
    paymentError: string | null;
    isCalculatingTax: boolean;
    isCalculatingShipping: boolean;
    isCalculatingSummary: boolean;
    lastCalculationTime: number | null;
    lastPaymentIntentRequest: string | null;
}

export interface CartActions {
    // Item management
    addItem: (item: Omit<CartItem, 'id' | 'addedAt' | 'updatedAt'>) => Promise<boolean>;
    removeItem: (itemId: string) => Promise<boolean>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>;
    updateItemVariant: (itemId: string, variant: ProductVariant) => Promise<boolean>;
    clearCart: () => Promise<boolean>;

    // Bulk operations
    addMultipleItems: (items: Array<Omit<CartItem, 'id' | 'addedAt' | 'updatedAt'>>) => Promise<boolean>;
    removeMultipleItems: (itemIds: string[]) => Promise<boolean>;
    updateMultipleQuantities: (updates: Array<{ itemId: string; quantity: number }>) => Promise<boolean>;

    // Save for later
    saveItemForLater: (itemId: string) => Promise<boolean>;
    moveToCart: (itemId: string) => Promise<boolean>;
    removeSavedItem: (itemId: string) => Promise<boolean>;
    clearSavedItems: () => Promise<boolean>;
    restoreRemovedItem: (itemId: string) => Promise<boolean>;
    clearRemovedItems: () => void;

    // Promotions
    applyPromoCode: (code: string) => Promise<boolean>;
    removePromoCode: (code: string) => Promise<boolean>;
    validatePromoCode: (code: string) => Promise<PromoCode | null>;
    applyPromotions: () => void;

    // Delivery
    setDeliveryAddress: (address: DeliveryAddress) => Promise<boolean>;
    setDeliveryOption: (option: DeliveryOption) => Promise<boolean>;
    calculateDeliveryFee: (address: DeliveryAddress, option: DeliveryOption) => Promise<number>;

    // Store selection
    setSelectedStore: (storeId: string) => Promise<boolean>;
    checkItemAvailability: (storeId: string) => Promise<void>;

    // Cart operations
    mergeCarts: (guestCart: CartItem[]) => Promise<boolean>;
    transferCart: (fromUserId: string, toUserId: string) => Promise<boolean>;
    duplicateCart: () => Promise<string>;

    // Calculations
    calculateSummary: (options?: {
        skipPaymentIntent?: boolean;
        skipAddressValidation?: boolean;
        force?: boolean;
    }) => Promise<void>;
    calculateTaxOnly: (address: DeliveryAddress) => Promise<number>;

    // Payment
    createPaymentIntent: (options?: {
        forSetupOnly?: boolean;
        skipAddressValidation?: boolean;
        cartId?: string;
    }) => Promise<PaymentIntent | SetupIntent | null>;
    updatePaymentIntent: (options?: { force?: boolean; skipAddressValidation?: boolean }) => Promise<boolean>;

    // Sync
    syncCart: () => Promise<boolean>;
    loadCart: () => Promise<boolean>;
    saveCart: () => Promise<boolean>;

    // Preferences
    updatePreferences: (preferences: Partial<CartPreferences>) => void;

    // Cart lifecycle
    setCartExpiry: (hours: number) => void;
    checkCartExpiry: () => boolean;
    extendCartExpiry: (hours: number) => void;

    // Error handling
    setError: (error: string | null) => void;
    clearError: () => void;
    setPaymentError: (error: string | null) => void;
    clearPaymentError: () => void;

    // Utilities
    getItemById: (itemId: string) => CartItem | undefined;
    getItemsByCategory: (category: string) => CartItem[];
    getItemsByStore: (storeId: string) => CartItem[];
    searchItems: (query: string) => CartItem[];
    validateCart: () => Promise<boolean>;
    optimizeCart: () => Promise<void>;
}



console.log('🔍 paymentsAPI loaded:', paymentsAPI);
console.log('🔍 calculateTax method:', paymentsAPI?.calculateTax);

// Helper functions
const generateId = () => `cart_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const calculateItemTotal = (item: CartItem): number => {
    const basePrice = item.salePrice || item.price;
    let total = basePrice * item.quantity;

    if (item.promotions) {
        item.promotions.forEach(promo => {
            if (promo.applied) {
                if (promo.isPercentage) {
                    total *= (1 - promo.value / 100);
                } else {
                    total -= promo.value;
                }
            }
        });
    }

    return Math.max(0, total);
};

// Cache utilities
interface CacheEntry<T> {
    value: T;
    timestamp: number;
    expiresAt: number;
}

class APICache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private ttl: number;

    constructor(ttl: number = PRODUCTION_CONFIG.CACHE_TTL) {
        this.ttl = ttl;
    }

    set(key: string, value: T): void {
        const now = Date.now();
        this.cache.set(key, {
            value,
            timestamp: now,
            expiresAt: now + this.ttl,
        });
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    clear(): void {
        this.cache.clear();
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);
        return entry ? Date.now() <= entry.expiresAt : false;
    }
}

// Initialize caches
const taxCache = new APICache<number>();
const shippingCache = new APICache<number>();
const promoCache = new APICache<PromoCode>();

// Retry utility
const withRetry = async <T>(
    operation: () => Promise<T>,
    maxAttempts: number = PRODUCTION_CONFIG.MAX_RETRY_ATTEMPTS,
    delay: number = 1000
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                throw lastError;
            }

            // Exponential backoff
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }

    throw lastError!;
};

// Debounced function utility
const createDebouncedFunction = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

const initialState: CartState = {
    items: [],
    savedItems: [],
    recentlyRemovedItems: [],
    summary: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        delivery: 0,
        fees: 0,
        discounts: 0,
        total: 0,
        savings: 0,
        itemCount: 0,
        uniqueItemCount: 0,
        freeShippingThreshold: 35,
        freeShippingRemaining: 35,
    },
    appliedPromoCodes: [],
    availablePromoCodes: [],
    deliveryAddress: null,
    deliveryOptions: ['pickup', 'delivery', 'shipping'],
    selectedDeliveryOption: 'pickup',
    selectedStoreId: null,
    availableStores: [],
    preferences: {
        saveForLater: true,
        autoAddRecommendations: false,
        substituteUnavailableItems: true,
        notifyPriceChanges: true,
        notifyStockChanges: true,
        preferredDeliveryOption: 'pickup',
        reminderTime: 15,
        realTimeUpdates: true,
    },
    isLoading: false,
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    expiresAt: null,
    reminderShown: false,
    paymentIntent: null,
    setupIntent: null,
    isCalculatingPayment: false,
    paymentError: null,
    isCalculatingTax: false,
    isCalculatingShipping: false,
    isCalculatingSummary: false,
    lastCalculationTime: null,
    lastPaymentIntentRequest: null,
};

export const useCartStore = create<CartState & CartActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,

                // Tax calculation with Firebase Functions
                calculateTaxOnly: async (address: DeliveryAddress) => {
                    if (!address || !PRODUCTION_CONFIG.TAX_SERVICE_ENABLED) return 0;

                    const cacheKey = `${address.city}_${address.state}_${address.zipCode}_${get().items.length}_${get().summary.subtotal}`;

                    // Check cache first
                    const cachedTax = taxCache.get(cacheKey);
                    if (cachedTax !== null) {
                        return cachedTax;
                    }

                    set((state) => {
                        state.isCalculatingTax = true;
                        state.error = null;
                    });

                    try {
                        const currentState = get();
                        const items = currentState.items.map(item => ({
                            productId: item.productId,
                            price: item.salePrice || item.price,
                            quantity: item.quantity,
                            category: item.category,
                        }));

                        const taxCalculation = await withRetry(() =>
                            Promise.race([
                                paymentsAPI.calculateTax({
                                    items,
                                    shippingAddress: {
                                        line1: address.street,
                                        line2: address.apartment,
                                        city: address.city,
                                        state: address.state,
                                        postalCode: address.zipCode,
                                        country: address.country,
                                    },
                                    shippingCost: 0,
                                }),
                                new Promise<never>((_, reject) =>
                                    setTimeout(() => reject(new Error('Tax calculation timeout')), PRODUCTION_CONFIG.REQUEST_TIMEOUT)
                                )
                            ])
                        );

                        const taxAmount = (taxCalculation as TaxCalculation).taxAmount;
                        taxCache.set(cacheKey, taxAmount);

                        return taxAmount;
                    } catch (error) {
                        console.error('Tax calculation error:', error);
                        const currentState = get(); // Get fresh state
                        const fallbackTax = currentState.summary.subtotal * 0.08; // 8% fallback

                        // Reconstruct cache key if needed (or make sure it's in scope)
                        const safeCacheKey = `${address.city}_${address.state}_${address.zipCode}_${currentState.items.length}_${currentState.summary.subtotal}`;
                        taxCache.set(safeCacheKey, fallbackTax);
                        return fallbackTax;
                    } finally {
                        set((state) => {
                            state.isCalculatingTax = false;
                        });
                    }
                },

                // Shipping calculation with real carriers
                calculateDeliveryFee: async (address: DeliveryAddress, option: DeliveryOption) => {
                    if (option === 'pickup' || !PRODUCTION_CONFIG.SHIPPING_SERVICE_ENABLED) return 0;

                    const cacheKey = `${address.city}_${address.state}_${option}_${get().items.length}_${get().summary.subtotal}`;

                    // Check cache first
                    const cachedShipping = shippingCache.get(cacheKey);
                    if (cachedShipping !== null) {
                        return cachedShipping;
                    }

                    set((state) => {
                        state.isCalculatingShipping = true;
                        state.error = null;
                    });

                    try {
                        const currentState = get();

                        // Check for free shipping
                        if (currentState.summary.subtotal >= (currentState.summary.freeShippingThreshold || 35)) {
                            shippingCache.set(cacheKey, 0);
                            return 0;
                        }

                        const items = currentState.items.map(item => ({
                            productId: item.productId,
                            weight: item.weight,
                            dimensions: item.dimensions,
                            category: item.category,
                            quantity: item.quantity,
                        }));

                        const shippingCalculation = await withRetry(() =>
                            Promise.race([
                                paymentsAPI.calculateShipping({
                                    items,
                                    toAddress: {
                                        line1: address.street,
                                        line2: address.apartment,
                                        city: address.city,
                                        state: address.state,
                                        postalCode: address.zipCode,
                                        country: address.country,
                                    },
                                    serviceTypes: [option],
                                }),
                                new Promise<never>((_, reject) =>
                                    setTimeout(() => reject(new Error('Shipping calculation timeout')), PRODUCTION_CONFIG.REQUEST_TIMEOUT)
                                )
                            ])
                        );

                        const method = (shippingCalculation as ShippingCalculation).methods.find(m => m.serviceType === option);
                        const cost = method?.cost || (option === 'delivery' ? 7.95 : 5.99);

                        shippingCache.set(cacheKey, cost);
                        return cost;
                    } catch (error) {
                        console.error('Shipping calculation error:', error);
                        const fallbackFee = option === 'delivery' ? 7.95 : 5.99;
                        shippingCache.set(cacheKey, fallbackFee);
                        return fallbackFee;
                    } finally {
                        set((state) => {
                            state.isCalculatingShipping = false;
                        });
                    }
                },

                calculateSummary: async (options?: {
                    skipPaymentIntent?: boolean;
                    skipAddressValidation?: boolean;
                    force?: boolean;
                }) => {
                    const { skipPaymentIntent = false, skipAddressValidation = false, force = false } = options || {};

                    set((state) => {
                        state.isCalculatingSummary = true;
                        state.error = null;
                    });

                    try {
                        // Get fresh state once at the beginning
                        const state = get();
                        const items = state.items;
                        const appliedPromoCodes = state.appliedPromoCodes;
                        const deliveryAddress = state.deliveryAddress;
                        const selectedDeliveryOption = state.selectedDeliveryOption;

                        let subtotal = 0;
                        let savings = 0;
                        let itemCount = 0;

                        // Calculate subtotal
                        items.forEach(item => {
                            if (item.status === 'available' || item.status === 'limited_stock') {
                                const itemTotal = calculateItemTotal(item);
                                subtotal += itemTotal;
                                itemCount += item.quantity;

                                if (item.originalPrice && item.originalPrice > item.price) {
                                    savings += (item.originalPrice - item.price) * item.quantity;
                                }
                            }
                        });

                        // Apply promo code discounts
                        let discounts = 0;
                        appliedPromoCodes.forEach(promo => {
                            if (promo.type === 'percentage') {
                                const discount = subtotal * (promo.value / 100);
                                discounts += promo.maxDiscount ? Math.min(discount, promo.maxDiscount) : discount;
                            } else if (promo.type === 'fixed') {
                                discounts += promo.value;
                            }
                        });

                        // Calculate delivery fee
                        let deliveryFee = 0;
                        if (deliveryAddress && selectedDeliveryOption !== 'pickup') {
                            const hasFreeShipping = appliedPromoCodes.some(p => p.type === 'free_shipping');
                            if (!hasFreeShipping) {
                                // ✅ FIXED: Use the state variable instead of calling get() again
                                const currentStore = get();
                                deliveryFee = await currentStore.calculateDeliveryFee(deliveryAddress, selectedDeliveryOption);
                            }
                        }

                        // Calculate tax
                        let tax = 0;
                        if (deliveryAddress) {
                            // ✅ FIXED: Use the state variable instead of calling get() again
                            const currentStore = get();
                            tax = await currentStore.calculateTaxOnly(deliveryAddress);
                        }

                        const total = subtotal - discounts + deliveryFee + tax;
                        const freeShippingThreshold = 35;
                        const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

                        // Atomic update
                        set((state) => {
                            state.summary = {
                                ...state.summary,
                                subtotal: Math.round(subtotal * 100) / 100,
                                tax: Math.round(tax * 100) / 100,
                                shipping: selectedDeliveryOption === 'shipping' ? deliveryFee : 0,
                                delivery: selectedDeliveryOption === 'delivery' ? deliveryFee : 0,
                                fees: 0,
                                discounts: Math.round(discounts * 100) / 100,
                                total: Math.round(total * 100) / 100,
                                savings: Math.round(savings * 100) / 100,
                                itemCount,
                                uniqueItemCount: items.length,
                                freeShippingThreshold,
                                freeShippingRemaining: Math.round(freeShippingRemaining * 100) / 100,
                            };
                            state.lastCalculationTime = Date.now();
                        });

                        // Create or update payment intent if needed
                        if (!skipPaymentIntent && PRODUCTION_CONFIG.PAYMENT_INTENTS_ENABLED && total > 0) {
                            const currentStore = get();
                            await currentStore.updatePaymentIntent({ force });
                        }

                    } catch (error) {
                        console.error('Summary calculation error:', error);
                        const currentStore = get();
                        currentStore.setError('Failed to calculate cart summary');
                    } finally {
                        set((state) => {
                            state.isCalculatingSummary = false;
                        });
                    }
                },
// Updated createPaymentIntent function
                createPaymentIntent: async (options?: {
                    forSetupOnly?: boolean;
                    skipAddressValidation?: boolean;
                    cartId?: string;
                }) => {
                    if (!PRODUCTION_CONFIG.PAYMENT_INTENTS_ENABLED) return null;

                    const { forSetupOnly = false, skipAddressValidation = false, cartId } = options || {};

                    set((state) => {
                        state.isCalculatingPayment = true;
                        state.paymentError = null;
                    });

                    try {
                        const currentState = get();

                        if (forSetupOnly) {
                            const setupIntent = await paymentsAPI.createSetupIntent();
                            set((state) => {
                                state.setupIntent = setupIntent;
                            });
                            return setupIntent;
                        }

                        if (!currentState.deliveryAddress && !skipAddressValidation) {
                            throw new Error('Delivery address is required for payment intent');
                        }

                        if (currentState.summary.total <= 0) {
                            throw new Error('Cart total must be greater than 0');
                        }

                        const paymentIntent = await paymentsAPI.createPaymentIntent({
                            cartId: cartId || `cart_${Date.now()}`,
                            items: currentState.items.map(item => ({
                                productId: item.productId,
                                name: item.name,
                                price: item.salePrice || item.price,
                                quantity: item.quantity,
                                category: item.category,
                                weight: item.weight,
                                dimensions: item.dimensions,
                            })),
                            shippingAddress: {
                                line1: currentState.deliveryAddress!.street,
                                line2: currentState.deliveryAddress!.apartment || '',
                                city: currentState.deliveryAddress!.city,
                                state: currentState.deliveryAddress!.state,
                                postalCode: currentState.deliveryAddress!.zipCode,
                                country: currentState.deliveryAddress!.country || 'US',
                            },
                            shippingMethodId: currentState.selectedDeliveryOption,
                            metadata: {
                                itemCount: currentState.summary.itemCount.toString(),
                                uniqueItemCount: currentState.summary.uniqueItemCount.toString(),
                                storeId: currentState.selectedStoreId || 'default',
                            },
                        });

                        set((state) => {
                            state.paymentIntent = paymentIntent;
                            state.summary.paymentIntentId = paymentIntent.id;
                            state.summary.clientSecret = paymentIntent.clientSecret;
                            state.lastPaymentIntentRequest = new Date().toISOString();
                        });

                        return paymentIntent;
                    } catch (error) {
                        console.error('Payment intent creation error:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
                        get().setPaymentError(errorMessage);
                        return null;
                    } finally {
                        set((state) => {
                            state.isCalculatingPayment = false;
                        });
                    }
                },

// Updated updatePaymentIntent function
                updatePaymentIntent: async (options?: { force?: boolean; skipAddressValidation?: boolean }) => {
                    const { force = false, skipAddressValidation = false } = options || {};
                    const currentState = get();

                    if (!currentState.paymentIntent && !force) {
                        return await get().createPaymentIntent({ skipAddressValidation }) !== null;
                    }

                    if (!currentState.paymentIntent?.id) {
                        return await get().createPaymentIntent({ skipAddressValidation }) !== null;
                    }

                    try {
                        const updatedIntent = await paymentsAPI.updatePaymentIntent(
                            currentState.paymentIntent.id,
                            {
                                items: currentState.items.map(item => ({
                                    productId: item.productId,
                                    name: item.name,
                                    price: item.salePrice || item.price,
                                    quantity: item.quantity,
                                    category: item.category,
                                    weight: item.weight,
                                    dimensions: item.dimensions,
                                })),
                                shippingAddress: {
                                    line1: currentState.deliveryAddress!.street,
                                    line2: currentState.deliveryAddress!.apartment || '',
                                    city: currentState.deliveryAddress!.city,
                                    state: currentState.deliveryAddress!.state,
                                    postalCode: currentState.deliveryAddress!.zipCode,
                                    country: currentState.deliveryAddress!.country || 'US',
                                },
                                shippingMethodId: currentState.selectedDeliveryOption,
                            }
                        );

                        set((state) => {
                            state.paymentIntent = updatedIntent;
                            state.summary.clientSecret = updatedIntent.clientSecret;
                        });

                        return true;
                    } catch (error) {
                        console.error('Payment intent update error:', error);
                        // If update fails, try creating a new one
                        return await get().createPaymentIntent({ skipAddressValidation }) !== null;
                    }
                },
                // Real promo code validation
                validatePromoCode: async (code: string) => {
                    if (!PRODUCTION_CONFIG.REAL_TIME_VALIDATION) return null;

                    const cacheKey = `promo_${code}_${get().summary.subtotal}`;
                    const cachedPromo = promoCache.get(cacheKey);
                    if (cachedPromo !== null) {
                        return cachedPromo;
                    }

                    try {
                        const cartId = get().summary.paymentIntentId || 'temp_cart_id';
                        const validation = await paymentsAPI.validatePromoCode({
                            code,
                            cartId,
                            items: get().items.map(item => item.productId),
                        });

                        let promoCode: PromoCode;

                        if (validation.isValid && validation.promoCode) {
                            promoCode = {
                                code: validation.promoCode.code,
                                description: validation.promoCode.description,
                                type: validation.promoCode.type,
                                value: validation.promoCode.value,
                                minOrder: validation.promoCode.minimumAmount,
                                maxDiscount: validation.promoCode.maximumDiscount,
                                isValid: true,
                            };
                        } else {
                            promoCode = {
                                code,
                                description: '',
                                type: 'percentage' as const,
                                value: 0,
                                isValid: false,
                                errorMessage: validation.error || 'Invalid promo code',
                            };
                        }

                        promoCache.set(cacheKey, promoCode);
                        return promoCode;
                    } catch (error) {
                        console.error('Validate promo code error:', error);
                        return {
                            code,
                            description: '',
                            type: 'percentage' as const,
                            value: 0,
                            isValid: false,
                            errorMessage: 'Failed to validate promo code',
                        };
                    }
                },

                // Debounced cart summary calculation
                debouncedCalculateSummary: createDebouncedFunction(
                    () => get().calculateSummary({ skipPaymentIntent: true }),
                    PRODUCTION_CONFIG.DEBOUNCE_DELAY
                ),

                // Item management
                addItem: async (itemData: Omit<CartItem, 'id' | 'addedAt' | 'updatedAt'>) => {
                    try {
                        set((state) => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        const existingItemIndex = get().items.findIndex(
                            item => item.productId === itemData.productId &&
                                JSON.stringify(item.variant) === JSON.stringify(itemData.variant)
                        );

                        if (existingItemIndex >= 0) {
                            const existingItem = get().items[existingItemIndex];
                            const newQuantity = Math.min(existingItem.quantity + itemData.quantity, existingItem.maxQuantity);

                            set((state) => {
                                state.items[existingItemIndex].quantity = newQuantity;
                                state.items[existingItemIndex].updatedAt = new Date().toISOString();
                            });
                        } else {
                            const newItem: CartItem = {
                                ...itemData,
                                id: generateId(),
                                addedAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            };

                            set((state) => {
                                state.items.push(newItem);
                            });
                        }

                        await get().calculateSummary();
                        await get().saveCart();

                        set((state) => {
                            state.isLoading = false;
                        });

                        return true;
                    } catch (error) {
                        console.error('Add item error:', error);
                        get().setError('Failed to add item to cart');
                        set((state) => {
                            state.isLoading = false;
                        });
                        return false;
                    }
                },

                removeItem: async (itemId: string) => {
                    try {
                        const itemToRemove = get().items.find(item => item.id === itemId);
                        if (!itemToRemove) return false;

                        set((state) => {
                            state.recentlyRemovedItems.push({
                                ...itemToRemove,
                                updatedAt: new Date().toISOString(),
                            });

                            if (state.recentlyRemovedItems.length > 10) {
                                state.recentlyRemovedItems = state.recentlyRemovedItems.slice(-10);
                            }

                            state.items = state.items.filter(item => item.id !== itemId);
                        });

                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Remove item error:', error);
                        get().setError('Failed to remove item from cart');
                        return false;
                    }
                },

                updateItemQuantity: async (itemId: string, quantity: number) => {
                    try {
                        const itemIndex = get().items.findIndex(item => item.id === itemId);
                        if (itemIndex === -1) return false;

                        const item = get().items[itemIndex];
                        const clampedQuantity = Math.max(item.minQuantity, Math.min(quantity, item.maxQuantity));

                        if (clampedQuantity === 0) {
                            return await get().removeItem(itemId);
                        }

                        set((state) => {
                            state.items[itemIndex].quantity = clampedQuantity;
                            state.items[itemIndex].updatedAt = new Date().toISOString();
                        });

                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Update quantity error:', error);
                        get().setError('Failed to update item quantity');
                        return false;
                    }
                },

                updateItemVariant: async (itemId: string, variant: ProductVariant) => {
                    try {
                        const itemIndex = get().items.findIndex(item => item.id === itemId);
                        if (itemIndex === -1) return false;

                        set((state) => {
                            state.items[itemIndex].variant = variant;
                            state.items[itemIndex].updatedAt = new Date().toISOString();
                        });

                        await get().saveCart();
                        return true;
                    } catch (error) {
                        console.error('Update variant error:', error);
                        get().setError('Failed to update item variant');
                        return false;
                    }
                },

                clearCart: async () => {
                    try {
                        set((state) => {
                            state.items = [];
                            state.appliedPromoCodes = [];
                            state.summary = { ...initialState.summary };
                            state.paymentIntent = null;
                            state.setupIntent = null;
                        });

                        // Clear caches
                        taxCache.clear();
                        shippingCache.clear();
                        promoCache.clear();

                        await get().saveCart();
                        return true;
                    } catch (error) {
                        console.error('Clear cart error:', error);
                        get().setError('Failed to clear cart');
                        return false;
                    }
                },

                // Bulk operations
                addMultipleItems: async (items: Array<Omit<CartItem, 'id' | 'addedAt' | 'updatedAt'>>) => {
                    try {
                        set((state) => {
                            state.isLoading = true;
                        });

                        for (const itemData of items) {
                            const existingItemIndex = get().items.findIndex(
                                item => item.productId === itemData.productId &&
                                    JSON.stringify(item.variant) === JSON.stringify(itemData.variant)
                            );

                            if (existingItemIndex >= 0) {
                                set((state) => {
                                    const existingItem = state.items[existingItemIndex];
                                    const newQuantity = Math.min(
                                        existingItem.quantity + itemData.quantity,
                                        existingItem.maxQuantity
                                    );
                                    state.items[existingItemIndex].quantity = newQuantity;
                                    state.items[existingItemIndex].updatedAt = new Date().toISOString();
                                });
                            } else {
                                const newItem: CartItem = {
                                    ...itemData,
                                    id: generateId(),
                                    addedAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                };
                                set((state) => {
                                    state.items.push(newItem);
                                });
                            }
                        }

                        await get().calculateSummary();
                        await get().saveCart();

                        set((state) => {
                            state.isLoading = false;
                        });

                        return true;
                    } catch (error) {
                        console.error('Add multiple items error:', error);
                        get().setError('Failed to add items to cart');
                        set((state) => {
                            state.isLoading = false;
                        });
                        return false;
                    }
                },

                removeMultipleItems: async (itemIds: string[]) => {
                    try {
                        const removedItems: CartItem[] = [];

                        set((state) => {
                            itemIds.forEach(itemId => {
                                const itemIndex = state.items.findIndex(item => item.id === itemId);
                                if (itemIndex >= 0) {
                                    const removedItem = state.items.splice(itemIndex, 1)[0];
                                    removedItems.push({
                                        ...removedItem,
                                        updatedAt: new Date().toISOString(),
                                    });
                                }
                            });

                            state.recentlyRemovedItems.push(...removedItems);
                            if (state.recentlyRemovedItems.length > 10) {
                                state.recentlyRemovedItems = state.recentlyRemovedItems.slice(-10);
                            }
                        });

                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Remove multiple items error:', error);
                        get().setError('Failed to remove items from cart');
                        return false;
                    }
                },

                updateMultipleQuantities: async (updates: Array<{ itemId: string; quantity: number }>) => {
                    try {
                        set((state) => {
                            updates.forEach(update => {
                                const itemIndex = state.items.findIndex(item => item.id === update.itemId);
                                if (itemIndex >= 0) {
                                    const item = state.items[itemIndex];
                                    const clampedQuantity = Math.max(
                                        item.minQuantity,
                                        Math.min(update.quantity, item.maxQuantity)
                                    );

                                    if (clampedQuantity === 0) {
                                        state.items[itemIndex].quantity = 0;
                                    } else {
                                        state.items[itemIndex].quantity = clampedQuantity;
                                        state.items[itemIndex].updatedAt = new Date().toISOString();
                                    }
                                }
                            });

                            state.items = state.items.filter(item => item.quantity > 0);
                        });

                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Update multiple quantities error:', error);
                        get().setError('Failed to update item quantities');
                        return false;
                    }
                },

                // Save for later functions
                saveItemForLater: async (itemId: string) => {
                    try {
                        const item = get().items.find(item => item.id === itemId);
                        if (!item) return false;

                        set((state) => {
                            state.savedItems.push(item);
                            state.items = state.items.filter(i => i.id !== itemId);
                        });

                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Save item for later error:', error);
                        get().setError('Failed to save item for later');
                        return false;
                    }
                },

                moveToCart: async (itemId: string) => {
                    try {
                        const savedItemIndex = get().savedItems.findIndex(item => item.id === itemId);
                        if (savedItemIndex === -1) return false;

                        const item = get().savedItems[savedItemIndex];

                        set((state) => {
                            state.items.push({
                                ...item,
                                updatedAt: new Date().toISOString(),
                            });
                            state.savedItems = state.savedItems.filter(i => i.id !== itemId);
                        });

                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Move to cart error:', error);
                        get().setError('Failed to move item to cart');
                        return false;
                    }
                },

                removeSavedItem: async (itemId: string) => {
                    try {
                        set((state) => {
                            state.savedItems = state.savedItems.filter(item => item.id !== itemId);
                        });

                        await get().saveCart();
                        return true;
                    } catch (error) {
                        console.error('Remove saved item error:', error);
                        get().setError('Failed to remove saved item');
                        return false;
                    }
                },

                clearSavedItems: async () => {
                    try {
                        set((state) => {
                            state.savedItems = [];
                        });
                        await get().saveCart();
                        return true;
                    } catch (error) {
                        console.error('Clear saved items error:', error);
                        get().setError('Failed to clear saved items');
                        return false;
                    }
                },

                restoreRemovedItem: async (itemId: string) => {
                    try {
                        const removedItemIndex = get().recentlyRemovedItems.findIndex(item => item.id === itemId);
                        if (removedItemIndex === -1) return false;

                        const item = get().recentlyRemovedItems[removedItemIndex];

                        set((state) => {
                            state.items.push({
                                ...item,
                                updatedAt: new Date().toISOString(),
                            });
                            state.recentlyRemovedItems = state.recentlyRemovedItems.filter(i => i.id !== itemId);
                        });

                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Restore removed item error:', error);
                        get().setError('Failed to restore item');
                        return false;
                    }
                },

                clearRemovedItems: () => {
                    set((state) => {
                        state.recentlyRemovedItems = [];
                    });
                },

                // Promo code functions
                applyPromoCode: async (code: string) => {
                    try {
                        const promoCode = await get().validatePromoCode(code);
                        if (!promoCode || !promoCode.isValid) {
                            get().setError(promoCode?.errorMessage || 'Invalid promo code');
                            return false;
                        }

                        const isAlreadyApplied = get().appliedPromoCodes.some(p => p.code === code);
                        if (isAlreadyApplied) {
                            get().setError('Promo code already applied');
                            return false;
                        }

                        // Check minimum order requirement
                        if (promoCode.minOrder && get().summary.subtotal < promoCode.minOrder) {
                            get().setError(`Minimum order of ${promoCode.minOrder} required for this promo code`);
                            return false;
                        }

                        set((state) => {
                            state.appliedPromoCodes.push(promoCode);
                        });

                        get().applyPromotions();
                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Apply promo code error:', error);
                        get().setError('Failed to apply promo code');
                        return false;
                    }
                },

                removePromoCode: async (code: string) => {
                    try {
                        set((state) => {
                            state.appliedPromoCodes = state.appliedPromoCodes.filter(p => p.code !== code);
                        });

                        get().applyPromotions();
                        await get().calculateSummary();
                        await get().saveCart();

                        return true;
                    } catch (error) {
                        console.error('Remove promo code error:', error);
                        get().setError('Failed to remove promo code');
                        return false;
                    }
                },

                applyPromotions: () => {
                    const appliedPromoCodes = get().appliedPromoCodes;

                    set((state) => {
                        state.items.forEach(item => {
                            // Reset existing promotions
                            if (item.promotions) {
                                item.promotions.forEach(promo => {
                                    promo.applied = false;
                                });
                            }

                            // Apply current promo codes
                            appliedPromoCodes.forEach(promoCode => {
                                if (promoCode.type === 'bogo' && item.quantity >= 2) {
                                    const promotion = {
                                        id: promoCode.code,
                                        type: 'bogo' as const,
                                        description: promoCode.description,
                                        value: item.price,
                                        isPercentage: false,
                                        applied: true,
                                    };

                                    if (!item.promotions) {
                                        item.promotions = [];
                                    }
                                    item.promotions.push(promotion);
                                }
                            });
                        });
                    });
                },

                // Delivery functions
                setDeliveryAddress: async (address: DeliveryAddress) => {
                    try {
                        set((state) => {
                            state.deliveryAddress = address;
                        });

                        // Clear relevant caches since address changed
                        taxCache.clear();
                        shippingCache.clear();

                        await get().calculateSummary({ force: true });
                        await get().saveCart();
                        return true;
                    } catch (error) {
                        console.error('Set delivery address error:', error);
                        get().setError('Failed to set delivery address');
                        return false;
                    }
                },

                setDeliveryOption: async (option: DeliveryOption) => {
                    try {
                        set((state) => {
                            state.selectedDeliveryOption = option;
                        });

                        // Clear shipping cache since option changed
                        shippingCache.clear();

                        await get().calculateSummary({ force: true });
                        await get().saveCart();
                        return true;
                    } catch (error) {
                        console.error('Set delivery option error:', error);
                        get().setError('Failed to set delivery option');
                        return false;
                    }
                },

                // Store functions
                setSelectedStore: async (storeId: string) => {
                    try {
                        set((state) => {
                            state.selectedStoreId = storeId;
                        });

                        await get().checkItemAvailability(storeId);
                        await get().saveCart();
                        return true;
                    } catch (error) {
                        console.error('Set selected store error:', error);
                        get().setError('Failed to set selected store');
                        return false;
                    }
                },

                checkItemAvailability: async (storeId: string) => {
                    try {
                        // This would typically call a real inventory API
                        // For now, simulating with random availability
                        await new Promise(resolve => setTimeout(resolve, 500));

                        set((state) => {
                            state.items.forEach(item => {
                                // Simulate real inventory check
                                const random = Math.random();
                                if (random < 0.05) {
                                    item.status = 'out_of_stock';
                                } else if (random < 0.15) {
                                    item.status = 'limited_stock';
                                    item.maxQuantity = Math.min(item.maxQuantity, Math.floor(Math.random() * 3) + 1);
                                } else {
                                    item.status = 'available';
                                }
                            });
                        });

                        await get().calculateSummary();
                    } catch (error) {
                        console.error('Check item availability error:', error);
                        get().setError('Failed to check item availability');
                    }
                },

                // Cart operations
                mergeCarts: async (guestCart: CartItem[]) => {
                    try {
                        const itemsToAdd = guestCart.map(item => {
                            const { id, addedAt, updatedAt, ...itemData } = item;
                            return itemData;
                        });

                        return await get().addMultipleItems(itemsToAdd);
                    } catch (error) {
                        console.error('Merge carts error:', error);
                        get().setError('Failed to merge carts');
                        return false;
                    }
                },

                transferCart: async (fromUserId: string, toUserId: string) => {
                    try {
                        // This would typically involve server-side cart transfer
                        // Implementation depends on your user system
                        console.log(`Transferring cart from ${fromUserId} to ${toUserId}`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return true;
                    } catch (error) {
                        console.error('Transfer cart error:', error);
                        get().setError('Failed to transfer cart');
                        return false;
                    }
                },

                duplicateCart: async () => {
                    try {
                        const newCartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        // Implementation for cart duplication
                        await new Promise(resolve => setTimeout(resolve, 500));
                        return newCartId;
                    } catch (error) {
                        console.error('Duplicate cart error:', error);
                        throw new Error('Failed to duplicate cart');
                    }
                },

                // Sync operations
                syncCart: async () => {
                    try {
                        set((state) => {
                            state.isSyncing = true;
                        });

                        // Sync with server - implementation depends on your backend
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        set((state) => {
                            state.isSyncing = false;
                            state.lastSyncedAt = new Date().toISOString();
                        });

                        return true;
                    } catch (error) {
                        console.error('Sync cart error:', error);
                        set((state) => {
                            state.isSyncing = false;
                        });
                        get().setError('Failed to sync cart');
                        return false;
                    }
                },

                loadCart: async () => {
                    try {
                        set((state) => {
                            state.isLoading = true;
                        });

                        const savedCart = await cartItems.get();
                        if (savedCart) {
                            set((state) => {
                                state.items = savedCart;
                            });
                            await get().calculateSummary();
                        }

                        set((state) => {
                            state.isLoading = false;
                        });
                        return true;
                    } catch (error) {
                        console.error('Load cart error:', error);
                        set((state) => {
                            state.isLoading = false;
                        });
                        get().setError('Failed to load cart');
                        return false;
                    }
                },

                saveCart: async () => {
                    try {
                        const success = await cartItems.set(get().items);
                        return success;
                    } catch (error) {
                        console.error('Save cart error:', error);
                        return false;
                    }
                },

                // Preferences
                updatePreferences: (preferences: Partial<CartPreferences>) => {
                    set((state) => {
                        Object.assign(state.preferences, preferences);
                    });
                },

                // Cart expiry
                setCartExpiry: (hours: number) => {
                    const expiryTime = new Date();
                    expiryTime.setHours(expiryTime.getHours() + hours);
                    set((state) => {
                        state.expiresAt = expiryTime.toISOString();
                        state.reminderShown = false;
                    });
                },

                checkCartExpiry: () => {
                    const expiresAt = get().expiresAt;
                    if (!expiresAt) return false;
                    const now = new Date();
                    const expiry = new Date(expiresAt);
                    return now >= expiry;
                },

                extendCartExpiry: (hours: number) => {
                    const currentExpiry = get().expiresAt;
                    if (!currentExpiry) {
                        get().setCartExpiry(hours);
                        return;
                    }
                    const newExpiry = new Date(currentExpiry);
                    newExpiry.setHours(newExpiry.getHours() + hours);
                    set((state) => {
                        state.expiresAt = newExpiry.toISOString();
                    });
                },

                // Error handling
                setError: (error: string | null) => {
                    set((state) => {
                        state.error = error;
                        state.isLoading = false;
                    });
                },

                clearError: () => {
                    set((state) => {
                        state.error = null;
                    });
                },

                setPaymentError: (error: string | null) => {
                    set((state) => {
                        state.paymentError = error;
                        state.isCalculatingPayment = false;
                    });
                },

                clearPaymentError: () => {
                    set((state) => {
                        state.paymentError = null;
                    });
                },

                // Utility functions
                getItemById: (itemId: string) => {
                    return get().items.find(item => item.id === itemId);
                },

                getItemsByCategory: (category: string) => {
                    return get().items.filter(item => item.category === category);
                },

                getItemsByStore: (storeId: string) => {
                    return get().items.filter(item => item.storeId === storeId);
                },

                searchItems: (query: string) => {
                    const searchTerm = query.toLowerCase();
                    return get().items.filter(item =>
                        item.name.toLowerCase().includes(searchTerm) ||
                        item.brand?.toLowerCase().includes(searchTerm) ||
                        item.category.toLowerCase().includes(searchTerm) ||
                        item.sku.toLowerCase().includes(searchTerm)
                    );
                },

                validateCart: async () => {
                    try {
                        if (get().checkCartExpiry()) {
                            get().setError('Cart has expired');
                            return false;
                        }

                        const items = get().items;
                        let hasInvalidItems = false;

                        for (const item of items) {
                            if (item.status === 'discontinued' || item.status === 'out_of_stock') {
                                hasInvalidItems = true;
                                break;
                            }
                            if (item.quantity > item.maxQuantity) {
                                hasInvalidItems = true;
                                break;
                            }
                        }

                        if (hasInvalidItems) {
                            get().setError('Some items in your cart are no longer available');
                            return false;
                        }

                        return true;
                    } catch (error) {
                        console.error('Validate cart error:', error);
                        get().setError('Failed to validate cart');
                        return false;
                    }
                },

                optimizeCart: async () => {
                    try {
                        set((state) => {
                            // Remove unavailable items
                            state.items = state.items.filter(item =>
                                item.status === 'available' || item.status === 'limited_stock'
                            );

                            // Adjust quantities for limited stock items
                            state.items.forEach(item => {
                                if (item.status === 'limited_stock' && item.quantity > item.maxQuantity) {
                                    item.quantity = item.maxQuantity;
                                    item.updatedAt = new Date().toISOString();
                                }
                            });
                        });

                        get().applyPromotions();
                        await get().calculateSummary();
                        await get().saveCart();
                    } catch (error) {
                        console.error('Optimize cart error:', error);
                        get().setError('Failed to optimize cart');
                    }
                },
            })),
            {
                name: 'walmart-cart-store',
                storage: {
                    getItem: (name) => asyncStorage.getItem(name as any),
                    setItem: (name, value) => asyncStorage.setItem(name as any, value),
                    removeItem: (name) => asyncStorage.removeItem(name as any),
                },
                partialize: (state) => ({
                    items: state.items,
                    savedItems: state.savedItems,
                    appliedPromoCodes: state.appliedPromoCodes,
                    deliveryAddress: state.deliveryAddress,
                    selectedDeliveryOption: state.selectedDeliveryOption,
                    selectedStoreId: state.selectedStoreId,
                    preferences: state.preferences,
                    expiresAt: state.expiresAt,
                }),
            }
        ),
        { name: 'cart-store' }
    )
);

// Export hooks for easy usage
export const useCartActions = () => {
    const store = useCartStore();
    return {
        addItem: store.addItem,
        removeItem: store.removeItem,
        updateQuantity: store.updateItemQuantity,
        clearCart: store.clearCart,
        applyPromoCode: store.applyPromoCode,
        setDeliveryAddress: store.setDeliveryAddress,
        setDeliveryOption: store.setDeliveryOption,
        calculateSummary: store.calculateSummary,
        createPaymentIntent: store.createPaymentIntent,
    };
};

export const useCartSelectors = () => {
    const items = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const isLoading = useCartStore((state) => state.isLoading);
    const error = useCartStore((state) => state.error);
    const paymentError = useCartStore((state) => state.paymentError);
    const deliveryAddress = useCartStore((state) => state.deliveryAddress);
    const appliedPromoCodes = useCartStore((state) => state.appliedPromoCodes);
    const paymentIntent = useCartStore((state) => state.paymentIntent);

    return {
        items,
        summary,
        isLoading,
        error,
        paymentError,
        deliveryAddress,
        appliedPromoCodes,
        paymentIntent,
        itemCount: items.length,
        hasItems: items.length > 0,
        totalValue: summary.total,
        isEmpty: items.length === 0,
        isReadyForCheckout: items.length > 0 && !error && !paymentError,
    };
};

// Utility functions for cart operations
export const cartUtils = {
    formatPrice: (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    },

    calculateItemTotal: (item: CartItem) => {
        return calculateItemTotal(item);
    },

    isItemAvailable: (item: CartItem) => {
        return item.status === 'available' || item.status === 'limited_stock';
    },

    getItemImageUrl: (item: CartItem, size: 'small' | 'medium' | 'large' = 'medium') => {
        const sizes = {
            small: '150x150',
            medium: '300x300',
            large: '600x600',
        };

        if (item.image.includes('placeholder')) {
            return `https://via.placeholder.com/${sizes[size]}/f0f0f0/666?text=${encodeURIComponent(item.name)}`;
        }

        return item.image.replace(/\d+x\d+/, sizes[size]);
    },

    generateItemId: generateId,

    validateItemData: (item: Partial<CartItem>) => {
        const required = ['productId', 'name', 'price', 'quantity', 'image', 'category', 'sku', 'storeId', 'storeName'];
        const missing = required.filter(field => !item[field as keyof CartItem]);

        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        if (item.quantity && item.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        if (item.price && item.price < 0) {
            throw new Error('Price cannot be negative');
        }

        return true;
    },

    createCartItem: (data: Omit<CartItem, 'id' | 'addedAt' | 'updatedAt'>): CartItem => {
        cartUtils.validateItemData(data);

        return {
            ...data,
            id: generateId(),
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            minQuantity: data.minQuantity || 1,
            maxQuantity: data.maxQuantity || 999,
            status: data.status || 'available',
            delivery: {
                option: 'pickup',
                freeShippingEligible: true,
                ...data.delivery,
            },
        };
    },

    calculateCartTotals: (items: CartItem[], promoCodes: PromoCode[] = []) => {
        let subtotal = 0;
        let savings = 0;
        let itemCount = 0;

        items.forEach(item => {
            if (item.status === 'available' || item.status === 'limited_stock') {
                const itemTotal = calculateItemTotal(item);
                subtotal += itemTotal;
                itemCount += item.quantity;

                if (item.originalPrice && item.originalPrice > item.price) {
                    savings += (item.originalPrice - item.price) * item.quantity;
                }
            }
        });

        let discounts = 0;
        promoCodes.forEach(promo => {
            if (promo.type === 'percentage') {
                const discount = subtotal * (promo.value / 100);
                discounts += promo.maxDiscount ? Math.min(discount, promo.maxDiscount) : discount;
            } else if (promo.type === 'fixed') {
                discounts += promo.value;
            }
        });

        return {
            subtotal: Math.round(subtotal * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            discounts: Math.round(discounts * 100) / 100,
            itemCount,
        };
    },
};

// Type guards for runtime validation
export const typeGuards = {
    isCartItem: (item: any): item is CartItem => {
        return (
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            typeof item.productId === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number'
        );
    },

    isPromoCode: (code: any): code is PromoCode => {
        return (
            typeof code === 'object' &&
            code !== null &&
            typeof code.code === 'string' &&
            typeof code.type === 'string' &&
            typeof code.value === 'number' &&
            typeof code.isValid === 'boolean'
        );
    },

    isDeliveryAddress: (address: any): address is DeliveryAddress => {
        return (
            typeof address === 'object' &&
            address !== null &&
            typeof address.id === 'string' &&
            typeof address.street === 'string' &&
            typeof address.city === 'string' &&
            typeof address.state === 'string' &&
            typeof address.zipCode === 'string'
        );
    },

    isPaymentIntent: (intent: any): intent is PaymentIntent => {
        return (
            typeof intent === 'object' &&
            intent !== null &&
            typeof intent.id === 'string' &&
            typeof intent.clientSecret === 'string' &&
            typeof intent.amount === 'number' &&
            typeof intent.status === 'string'
        );
    },
};

// Constants for cart configuration
export const CART_CONSTANTS = {
    MAX_ITEMS_PER_CART: 100,
    MAX_QUANTITY_PER_ITEM: 999,
    MIN_QUANTITY_PER_ITEM: 1,
    FREE_SHIPPING_THRESHOLD: 35,
    MAX_PROMO_CODES: 3,
    CART_EXPIRY_HOURS: 24,
    DEBOUNCE_DELAY: 500,
    API_TIMEOUT: 10000,
    TAX_CALCULATION_TIMEOUT: 5000,
    SHIPPING_CALCULATION_TIMEOUT: 5000,
    CACHE_TTL: 300000, // 5 minutes
} as const;

// Performance monitoring utilities
export const cartPerformance = {
    startTimer: (operation: string) => {
        const startTime = performance.now();
        return {
            end: () => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                console.log(`Cart operation "${operation}" took ${duration.toFixed(2)}ms`);
                return duration;
            },
        };
    },

    measureCartOperation: async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
        const timer = cartPerformance.startTimer(operation);
        try {
            const result = await fn();
            timer.end();
            return result;
        } catch (error) {
            timer.end();
            throw error;
        }
    },
};

// Cart analytics utilities
export const cartAnalytics = {
    trackCartEvent: (event: string, data?: Record<string, any>) => {
        // Implementation would depend on your analytics service
        console.log(`Cart Event: ${event}`, data);
    },

    trackCartConversion: (cartData: CartSummary) => {
        cartAnalytics.trackCartEvent('cart_conversion', {
            total: cartData.total,
            itemCount: cartData.itemCount,
            discounts: cartData.discounts,
            savings: cartData.savings,
        });
    },

    trackItemAdded: (item: CartItem) => {
        cartAnalytics.trackCartEvent('item_added', {
            productId: item.productId,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
        });
    },

    trackPromoCodeUsed: (promoCode: PromoCode) => {
        cartAnalytics.trackCartEvent('promo_code_used', {
            code: promoCode.code,
            type: promoCode.type,
            value: promoCode.value,
        });
    },
};

// Error handling utilities
export class CartError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: Record<string, any>
    ) {
        super(message);
        this.name = 'CartError';
    }
}

export const cartErrorHandler = {
    handleApiError: (error: any, operation: string): CartError => {
        if (error instanceof CartError) {
            return error;
        }

        const message = error?.message || `Failed to ${operation}`;
        const code = error?.code || 'UNKNOWN_ERROR';

        return new CartError(message, code, { operation, originalError: error });
    },

    isRetryableError: (error: CartError): boolean => {
        const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'RATE_LIMITED'];
        return retryableCodes.includes(error.code);
    },
};

// Validation utilities
export const cartValidators = {
    validateDeliveryAddress: (address: DeliveryAddress): string[] => {
        const errors: string[] = [];

        if (!address.street?.trim()) errors.push('Street address is required');
        if (!address.city?.trim()) errors.push('City is required');
        if (!address.state?.trim()) errors.push('State is required');
        if (!address.zipCode?.trim()) errors.push('ZIP code is required');
        if (!address.country?.trim()) errors.push('Country is required');

        // ZIP code format validation (US format)
        if (address.zipCode && !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
            errors.push('Invalid ZIP code format');
        }

        return errors;
    },

    validateCartForCheckout: (cart: CartState): string[] => {
        const errors: string[] = [];

        if (cart.items.length === 0) {
            errors.push('Cart is empty');
        }

        if (!cart.deliveryAddress) {
            errors.push('Delivery address is required');
        } else {
            errors.push(...cartValidators.validateDeliveryAddress(cart.deliveryAddress));
        }

        if (cart.summary.total <= 0) {
            errors.push('Cart total must be greater than 0');
        }

        // Check for out of stock items
        const unavailableItems = cart.items.filter(item =>
            item.status === 'out_of_stock' || item.status === 'discontinued'
        );

        if (unavailableItems.length > 0) {
            errors.push(`${unavailableItems.length} item(s) are no longer available`);
        }

        return errors;
    },

    validateItemQuantity: (item: CartItem, newQuantity: number): string[] => {
        const errors: string[] = [];

        if (newQuantity < item.minQuantity) {
            errors.push(`Minimum quantity is ${item.minQuantity}`);
        }

        if (newQuantity > item.maxQuantity) {
            errors.push(`Maximum quantity is ${item.maxQuantity}`);
        }

        if (item.status === 'limited_stock' && newQuantity > item.maxQuantity) {
            errors.push(`Only ${item.maxQuantity} items available`);
        }

        return errors;
    },
};

// Export the main store as default
export default useCartStore;

console.log('✅ Production Cart Store Loaded - Firebase + Stripe Integration Active');
console.log('🔥 Firebase Configuration:', PRODUCTION_CONFIG.TAX_SERVICE_ENABLED ? 'ENABLED' : 'DISABLED');
console.log('💳 Stripe Payment Intents:', PRODUCTION_CONFIG.PAYMENT_INTENTS_ENABLED ? 'ENABLED' : 'DISABLED');