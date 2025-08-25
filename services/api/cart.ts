import { apiClient } from './client';
import { API } from '@/config/constants';

// Types
export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    isOnSale: boolean;
    saleEndDate?: string;
    image: string;
    brand?: string;
    category: string;
    sku: string;
    quantity: number;
    maxQuantity: number;
    minQuantity: number;
    quantityIncrement: number;
    inStock: boolean;
    stockQuantity: number;
    backorderAllowed: boolean;
    backorderDate?: string;
    variants?: ItemVariant[];
    selectedVariants?: Record<string, string>;
    seller: ItemSeller;
    shipping: ItemShipping;
    fulfillmentOptions: FulfillmentOption[];
    restrictions?: ItemRestriction[];
    promotions?: ItemPromotion[];
    addedAt: string;
    lastModified: string;
    estimatedDeliveryDate?: string;
}

export interface ItemVariant {
    type: 'size' | 'color' | 'style' | 'capacity' | 'material' | 'flavor';
    name: string;
    value: string;
    price?: number;
    priceDifference?: number;
    inStock: boolean;
    image?: string;
}

export interface ItemSeller {
    id: string;
    name: string;
    isWalmart: boolean;
    isThirdParty: boolean;
    rating?: number;
    reviewCount?: number;
    shipsFrom?: string;
    isVerified: boolean;
    returnPolicy?: string;
}

export interface ItemShipping {
    isFreeShipping: boolean;
    shippingCost: number;
    estimatedDays: string;
    shippingMethods: ShippingMethod[];
    restrictions?: string[];
}

export interface ShippingMethod {
    id: string;
    name: string;
    cost: number;
    estimatedDays: string;
    isAvailable: boolean;
    cutoffTime?: string;
}

export interface FulfillmentOption {
    type: 'delivery' | 'pickup' | 'same_day' | 'next_day' | 'two_day';
    isAvailable: boolean;
    cost: number;
    estimatedDate?: string;
    cutoffTime?: string;
    instructions?: string;
}

export interface ItemRestriction {
    type: 'age' | 'quantity' | 'location' | 'shipping' | 'payment';
    description: string;
    isBlocking: boolean;
}

export interface ItemPromotion {
    id: string;
    type: 'discount' | 'bogo' | 'bundle' | 'cashback';
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    requirements?: string;
    expiryDate?: string;
}

export interface Cart {
    id: string;
    userId?: string;
    items: CartItem[];
    summary: CartSummary;
    coupons: AppliedCoupon[];
    savedItems: SavedItem[];
    shipping: CartShipping;
    tax: CartTax;
    fulfillment: CartFulfillment;
    promotions: CartPromotion[];
    restrictions: CartRestriction[];
    expiryDate?: string;
    lastUpdated: string;
    version: number;
}

export interface CartSummary {
    itemCount: number;
    uniqueItemCount: number;
    subtotal: number;
    discount: number;
    couponDiscount: number;
    promotionDiscount: number;
    tax: number;
    taxDetails: TaxBreakdown[];
    shipping: number;
    fees: CartFee[];
    total: number;
    estimatedTotal: number;
    savings: number;
    walmartPlusSavings?: number;
    cashback?: number;
}

export interface TaxBreakdown {
    type: 'sales' | 'vat' | 'import' | 'environmental';
    rate: number;
    amount: number;
    jurisdiction: string;
}

export interface CartFee {
    type: 'service' | 'processing' | 'convenience' | 'delivery';
    name: string;
    amount: number;
    description?: string;
}

export interface AppliedCoupon {
    id: string;
    code: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    appliedAmount: number;
    minimumAmount?: number;
    maximumDiscount?: number;
    applicableItems?: string[];
    expiryDate: string;
    appliedAt: string;
}

export interface SavedItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    isInStock: boolean;
    quantity?: number;
    variants?: Record<string, string>;
    savedAt: string;
    notifyWhenAvailable: boolean;
    priceAlert?: {
        enabled: boolean;
        targetPrice: number;
    };
}

export interface CartShipping {
    address?: ShippingAddress;
    method?: ShippingMethod;
    estimatedDeliveryDate?: string;
    instructions?: string;
    isSignatureRequired: boolean;
    isInsured: boolean;
    trackingNumber?: string;
}

export interface ShippingAddress {
    id?: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    instructions?: string;
    isResidential: boolean;
    isVerified: boolean;
}

export interface CartTax {
    isCalculated: boolean;
    exemptionId?: string;
    breakdown: TaxBreakdown[];
    estimatedTotal: number;
}

export interface CartFulfillment {
    type: 'delivery' | 'pickup' | 'mixed';
    pickupLocation?: PickupLocation;
    deliveryWindow?: DeliveryWindow;
    instructions?: string;
}

export interface PickupLocation {
    storeId: string;
    name: string;
    address: string;
    phone: string;
    hours: Record<string, string>;
    availableDate: string;
    instructions?: string;
}

export interface DeliveryWindow {
    startTime: string;
    endTime: string;
    date: string;
    isAvailable: boolean;
    cost: number;
}

export interface CartPromotion {
    id: string;
    type: 'threshold' | 'bogo' | 'bundle' | 'seasonal';
    title: string;
    description: string;
    savings: number;
    requirements: string;
    isApplied: boolean;
    applicableItems: string[];
}

export interface CartRestriction {
    type: 'payment' | 'shipping' | 'age' | 'quantity' | 'location';
    message: string;
    isBlocking: boolean;
    affectedItems?: string[];
}

// Request/Response Types
export interface AddItemRequest {
    productId: string;
    variantId?: string;
    quantity: number;
    selectedVariants?: Record<string, string>;
    fulfillmentType?: 'delivery' | 'pickup';
    storeId?: string;
}

export interface UpdateItemRequest {
    quantity: number;
    selectedVariants?: Record<string, string>;
    fulfillmentType?: 'delivery' | 'pickup';
}

export interface ApplyCouponRequest {
    code: string;
    items?: string[]; // Specific items to apply to
}

export interface CouponValidationResponse {
    isValid: boolean;
    coupon?: AppliedCoupon;
    error?: string;
    applicableItems?: string[];
    estimatedSavings?: number;
}

export interface BulkUpdateRequest {
    updates: Array<{
        itemId: string;
        quantity: number;
        selectedVariants?: Record<string, string>;
    }>;
}

export interface MergeCartRequest {
    guestCartId: string;
    conflictResolution: 'keep_user' | 'keep_guest' | 'merge_quantities';
}

export interface SaveItemRequest {
    itemId: string;
    notifyWhenAvailable?: boolean;
    priceAlert?: {
        enabled: boolean;
        targetPrice: number;
    };
}

export interface EstimateShippingRequest {
    zipCode: string;
    country?: string;
    items?: string[]; // Specific items to estimate for
}

export interface ShippingEstimate {
    methods: ShippingMethod[];
    freeShippingThreshold?: number;
    estimatedTax?: number;
}

export interface ValidateCartResponse {
    isValid: boolean;
    issues: CartValidationIssue[];
    updatedCart?: Cart;
}

export interface CartValidationIssue {
    type: 'price_change' | 'out_of_stock' | 'quantity_limit' | 'unavailable' | 'shipping_restriction';
    itemId?: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestedAction?: string;
}

// Cart API Service
export const cartAPI = {
    // Cart Management
    getCart: async (): Promise<Cart> => {
        const response = await apiClient.get<Cart>(API.ENDPOINTS.CART.GET);
        return response.data;
    },

    createCart: async (): Promise<Cart> => {
        const response = await apiClient.post<Cart>(API.ENDPOINTS.CART.GET);
        return response.data;
    },

    clearCart: async (): Promise<void> => {
        await apiClient.delete(API.ENDPOINTS.CART.CLEAR);
    },

    validateCart: async (): Promise<ValidateCartResponse> => {
        const response = await apiClient.post<ValidateCartResponse>('/cart/validate');
        return response.data;
    },

    // Item Management
    addItem: async (data: AddItemRequest): Promise<CartItem> => {
        const response = await apiClient.post<CartItem>(API.ENDPOINTS.CART.ADD_ITEM, data);
        return response.data;
    },

    updateItem: async (itemId: string, data: UpdateItemRequest): Promise<CartItem> => {
        const response = await apiClient.put<CartItem>(
            API.ENDPOINTS.CART.UPDATE_ITEM.replace(':id', itemId),
            data
        );
        return response.data;
    },

    removeItem: async (itemId: string): Promise<void> => {
        await apiClient.delete(API.ENDPOINTS.CART.REMOVE_ITEM.replace(':id', itemId));
    },

    bulkUpdateItems: async (data: BulkUpdateRequest): Promise<Cart> => {
        const response = await apiClient.put<Cart>('/cart/bulk-update', data);
        return response.data;
    },

    // Save for Later
    saveItemForLater: async (data: SaveItemRequest): Promise<SavedItem> => {
        const response = await apiClient.post<SavedItem>('/cart/save-item', data);
        return response.data;
    },

    moveToCart: async (savedItemId: string, quantity: number = 1): Promise<CartItem> => {
        const response = await apiClient.post<CartItem>(`/cart/saved-items/${savedItemId}/move-to-cart`, {
            quantity,
        });
        return response.data;
    },

    removeSavedItem: async (savedItemId: string): Promise<void> => {
        await apiClient.delete(`/cart/saved-items/${savedItemId}`);
    },

    updateSavedItem: async (savedItemId: string, data: Partial<SavedItem>): Promise<SavedItem> => {
        const response = await apiClient.put<SavedItem>(`/cart/saved-items/${savedItemId}`, data);
        return response.data;
    },

    // Coupons & Promotions
    applyCoupon: async (data: ApplyCouponRequest): Promise<AppliedCoupon> => {
        const response = await apiClient.post<AppliedCoupon>(API.ENDPOINTS.CART.APPLY_COUPON, data);
        return response.data;
    },

    removeCoupon: async (couponId: string): Promise<void> => {
        await apiClient.delete(`/cart/coupons/${couponId}`);
    },

    validateCoupon: async (code: string): Promise<CouponValidationResponse> => {
        const response = await apiClient.post<CouponValidationResponse>('/cart/validate-coupon', { code });
        return response.data;
    },

    getAvailableCoupons: async (): Promise<AvailableCoupon[]> => {
        const response = await apiClient.get<AvailableCoupon[]>('/cart/available-coupons');
        return response.data;
    },

    getAvailablePromotions: async (): Promise<CartPromotion[]> => {
        const response = await apiClient.get<CartPromotion[]>('/cart/available-promotions');
        return response.data;
    },

    // Shipping & Fulfillment
    estimateShipping: async (data: EstimateShippingRequest): Promise<ShippingEstimate> => {
        const response = await apiClient.post<ShippingEstimate>('/cart/estimate-shipping', data);
        return response.data;
    },

    setShippingAddress: async (address: ShippingAddress): Promise<Cart> => {
        const response = await apiClient.put<Cart>('/cart/shipping-address', address);
        return response.data;
    },

    setShippingMethod: async (methodId: string): Promise<Cart> => {
        const response = await apiClient.put<Cart>('/cart/shipping-method', { methodId });
        return response.data;
    },

    setPickupLocation: async (storeId: string): Promise<Cart> => {
        const response = await apiClient.put<Cart>('/cart/pickup-location', { storeId });
        return response.data;
    },

    setDeliveryWindow: async (window: DeliveryWindow): Promise<Cart> => {
        const response = await apiClient.put<Cart>('/cart/delivery-window', window);
        return response.data;
    },

    getAvailablePickupLocations: async (zipCode: string): Promise<PickupLocation[]> => {
        const response = await apiClient.get<PickupLocation[]>(`/cart/pickup-locations?zipCode=${zipCode}`);
        return response.data;
    },

    getAvailableDeliveryWindows: async (zipCode: string, date: string): Promise<DeliveryWindow[]> => {
        const response = await apiClient.get<DeliveryWindow[]>(
            `/cart/delivery-windows?zipCode=${zipCode}&date=${date}`
        );
        return response.data;
    },

    // Tax Calculation
    calculateTax: async (address: Partial<ShippingAddress>): Promise<CartTax> => {
        const response = await apiClient.post<CartTax>('/cart/calculate-tax', address);
        return response.data;
    },

    applyTaxExemption: async (exemptionId: string): Promise<Cart> => {
        const response = await apiClient.put<Cart>('/cart/tax-exemption', { exemptionId });
        return response.data;
    },

    // Guest Cart Management
    mergeGuestCart: async (data: MergeCartRequest): Promise<Cart> => {
        const response = await apiClient.post<Cart>('/cart/merge', data);
        return response.data;
    },

    convertGuestCart: async (cartId: string): Promise<Cart> => {
        const response = await apiClient.post<Cart>(`/cart/convert/${cartId}`);
        return response.data;
    },

    // Analytics & Recommendations
    trackCartEvent: async (event: CartEvent): Promise<void> => {
        await apiClient.post('/cart/track-event', event);
    },

    getAbandonedCartReminder: async (): Promise<AbandonedCartReminder | null> => {
        const response = await apiClient.get<AbandonedCartReminder | null>('/cart/abandoned-reminder');
        return response.data;
    },

    getCartRecommendations: async (): Promise<CartRecommendation[]> => {
        const response = await apiClient.get<CartRecommendation[]>('/cart/recommendations');
        return response.data;
    },

    // Subscription Items
    addSubscriptionItem: async (data: SubscriptionItemRequest): Promise<CartItem> => {
        const response = await apiClient.post<CartItem>('/cart/subscription-item', data);
        return response.data;
    },

    updateSubscriptionFrequency: async (itemId: string, frequency: string): Promise<CartItem> => {
        const response = await apiClient.put<CartItem>(`/cart/items/${itemId}/subscription`, { frequency });
        return response.data;
    },

    // Price Alerts
    setPriceAlert: async (productId: string, targetPrice: number): Promise<PriceAlert> => {
        const response = await apiClient.post<PriceAlert>('/cart/price-alert', {
            productId,
            targetPrice,
        });
        return response.data;
    },

    removePriceAlert: async (alertId: string): Promise<void> => {
        await apiClient.delete(`/cart/price-alert/${alertId}`);
    },
};

// Additional Types
export interface AvailableCoupon {
    code: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minimumAmount?: number;
    expiryDate: string;
    restrictions?: string[];
    isPersonalized: boolean;
}

export interface CartEvent {
    type: 'item_added' | 'item_removed' | 'item_updated' | 'coupon_applied' | 'checkout_started';
    itemId?: string;
    quantity?: number;
    value?: number;
    metadata?: Record<string, any>;
}

export interface AbandonedCartReminder {
    cartId: string;
    reminderCount: number;
    lastReminderSent: string;
    items: Array<{
        name: string;
        price: number;
        image: string;
        isStillAvailable: boolean;
    }>;
    incentive?: {
        type: 'discount' | 'free_shipping';
        value: number;
        code?: string;
    };
}

export interface CartRecommendation {
    type: 'frequently_bought_together' | 'complete_the_look' | 'similar_items' | 'trending';
    title: string;
    products: Array<{
        id: string;
        name: string;
        price: number;
        image: string;
        rating?: number;
    }>;
    reason?: string;
}

export interface SubscriptionItemRequest {
    productId: string;
    quantity: number;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly';
    startDate?: string;
    discount?: number;
}

export interface PriceAlert {
    id: string;
    productId: string;
    targetPrice: number;
    currentPrice: number;
    isActive: boolean;
    createdAt: string;
    notificationMethods: ('email' | 'push' | 'sms')[];
}

export default cartAPI;