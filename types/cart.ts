// Cart Item Status
export type CartItemStatus = 'available' | 'out_of_stock' | 'low_stock' | 'discontinued' | 'restricted' | 'substituted';

// Delivery and Fulfillment Options
export type FulfillmentMethod = 'pickup' | 'delivery' | 'shipping' | 'express' | 'scheduled';

export type DeliverySpeed = 'standard' | 'expedited' | 'overnight' | 'same_day' | 'instant';

export type PickupType = 'curbside' | 'in_store' | 'locker' | 'drive_through';

// Product Variants and Options
export interface ProductVariant {
    id: string;
    type: 'size' | 'color' | 'style' | 'flavor' | 'model' | 'package';
    name: string;
    value: string;
    price?: number;
    priceModifier?: number;
    sku?: string;
    image?: string;
    available: boolean;
    stock?: number;
}

export interface ProductCustomization {
    id: string;
    type: 'engraving' | 'gift_wrap' | 'personalization' | 'assembly';
    name: string;
    description: string;
    price: number;
    options?: Array<{
        id: string;
        name: string;
        value: string;
        price?: number;
    }>;
    required: boolean;
    maxLength?: number;
    instructions?: string;
}

// Cart Item Core Structure
export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    brand?: string;
    description?: string;
    shortDescription?: string;

    // Pricing
    price: number;
    originalPrice?: number;
    salePrice?: number;
    unitPrice: number;

    // Quantity and Limits
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    quantityStep: number; // e.g., sold in packs of 6

    // Product Details
    sku: string;
    upc?: string;
    gtin?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'in' | 'cm';
    };

    // Media
    image: string;
    images?: string[];

    // Categorization
    category: string;
    subcategory?: string;
    department: string;
    departmentId?: string;

    // Variants and Customizations
    variants: ProductVariant[];
    selectedVariants: Record<string, string>;
    customizations?: ProductCustomization[];
    selectedCustomizations?: Record<string, any>;

    // Availability and Status
    status: CartItemStatus;
    availability: {
        inStock: boolean;
        stockCount?: number;
        estimatedRestockDate?: string;
        isBackordered: boolean;
        substitutionAllowed: boolean;
        ageRestricted: boolean;
        prescriptionRequired: boolean;
    };

    // Store and Location
    storeId?: string;
    storeName?: string;
    warehouseId?: string;

    // Fulfillment
    fulfillment: {
        method: FulfillmentMethod;
        availableMethods: FulfillmentMethod[];
        estimatedDate?: string;
        estimatedTime?: string;
        restrictions?: string[];
        fee?: number;
        freeShippingEligible: boolean;
    };

    // Gift Options
    gift?: {
        isGift: boolean;
        giftMessage?: string;
        giftWrap?: {
            type: string;
            price: number;
            image?: string;
        };
        giftReceipt: boolean;
        recipientName?: string;
        recipientEmail?: string;
    };

    // Special Handling
    specialHandling?: {
        fragile: boolean;
        refrigerated: boolean;
        hazmat: boolean;
        oversized: boolean;
        signatureRequired: boolean;
        adultSignatureRequired: boolean;
    };

    // Pricing Modifiers
    discounts?: CartItemDiscount[];
    taxes?: CartItemTax[];
    fees?: CartItemFee[];

    // Metadata
    addedAt: string;
    updatedAt: string;
    addedBy?: 'user' | 'recommendation' | 'subscription' | 'reorder';
    source?: 'search' | 'category' | 'product_page' | 'recommendations' | 'wishlist';

    // Nutrition (for food items)
    nutrition?: {
        servingSize: string;
        servingsPerContainer?: number;
        calories: number;
        allergens: string[];
        dietaryInfo: string[];
        ingredients?: string[];
    };

    // Subscription Options
    subscription?: {
        eligible: boolean;
        frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
        discount?: number;
        nextDelivery?: string;
    };
}

// Cart Item Modifiers
export interface CartItemDiscount {
    id: string;
    type: 'percentage' | 'fixed' | 'bogo' | 'volume' | 'member';
    name: string;
    description: string;
    amount: number;
    isPercentage: boolean;
    appliedAmount: number;
    conditions?: {
        minQuantity?: number;
        maxQuantity?: number;
        minAmount?: number;
        membershipRequired?: boolean;
    };
    validUntil?: string;
    source: 'coupon' | 'promotion' | 'membership' | 'volume' | 'automatic';
}

export interface CartItemTax {
    id: string;
    name: string;
    type: 'sales' | 'excise' | 'luxury' | 'environmental';
    rate: number;
    amount: number;
    jurisdiction: string;
    isIncluded: boolean;
}

export interface CartItemFee {
    id: string;
    name: string;
    type: 'handling' | 'processing' | 'environmental' | 'bag' | 'bottle_deposit';
    amount: number;
    description?: string;
    isRefundable: boolean;
}

// Saved Items (Save for Later)
export interface SavedItem extends Omit<CartItem, 'addedAt' | 'updatedAt'> {
    savedAt: string;
    notifyOnSale: boolean;
    notifyOnStock: boolean;
    targetPrice?: number;
    notes?: string;
}

// Recently Removed Items
export interface RemovedCartItem extends CartItem {
    removedAt: string;
    removedBy: 'user' | 'system' | 'admin';
    reason?: 'out_of_stock' | 'discontinued' | 'user_action' | 'cart_cleanup';
    canRestore: boolean;
    restoreUntil?: string;
}

// Promo Codes and Coupons
export interface PromoCode {
    code: string;
    id?: string;
    name: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo' | 'category' | 'brand';
    value: number;
    isPercentage: boolean;

    // Conditions
    conditions: {
        minOrderAmount?: number;
        maxDiscountAmount?: number;
        applicableCategories?: string[];
        applicableBrands?: string[];
        applicableProducts?: string[];
        excludedCategories?: string[];
        excludedBrands?: string[];
        excludedProducts?: string[];
        membershipRequired?: boolean;
        firstTimeCustomer?: boolean;
        maxUsesPerCustomer?: number;
        maxUsesTotal?: number;
        stackable: boolean;
    };

    // Validity
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    isValid: boolean;

    // Usage
    usageCount: number;
    appliedAmount?: number;
    errorMessage?: string;

    // Metadata
    source: 'manual' | 'email' | 'app' | 'affiliate' | 'loyalty';
    priority: number;
}

// Cart Summary and Calculations
export interface CartSummary {
    // Item Counts
    itemCount: number;
    uniqueItemCount: number;

    // Pricing
    subtotal: number;
    discounts: number;
    taxes: number;
    fees: number;
    shipping: number;
    total: number;

    // Savings
    totalSavings: number;
    memberSavings?: number;
    couponSavings: number;

    // Weight and Volume
    totalWeight?: number;
    totalVolume?: number;

    // Fulfillment
    fulfillmentFees: Record<FulfillmentMethod, number>;
    freeShippingThreshold?: number;
    freeShippingRemaining?: number;

    // Estimates
    estimatedDelivery?: {
        earliest: string;
        latest: string;
        method: FulfillmentMethod;
    };

    // Restrictions
    hasAgeRestrictedItems: boolean;
    hasPrescriptionItems: boolean;
    hasHazmatItems: boolean;
    hasRefrigeratedItems: boolean;

    // Breakdown by Store/Warehouse
    storeBreakdown?: Array<{
        storeId: string;
        storeName: string;
        itemCount: number;
        subtotal: number;
        fulfillmentMethod: FulfillmentMethod;
    }>;
}

// Cart Validation and Errors
export interface CartValidationError {
    itemId?: string;
    type: 'availability' | 'quantity' | 'price' | 'restriction' | 'location' | 'payment';
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    canProceed: boolean;
    suggestions?: string[];
    action?: 'remove' | 'update_quantity' | 'substitute' | 'change_store';
}

export interface CartValidationResult {
    isValid: boolean;
    errors: CartValidationError[];
    warnings: CartValidationError[];
    canCheckout: boolean;
    requiresAttention: string[]; // Item IDs that need attention
}

// Cart Settings and Preferences
export interface CartSettings {
    autoSave: boolean;
    saveForLaterEnabled: boolean;
    substitutionsEnabled: boolean;
    notifyPriceChanges: boolean;
    notifyStockChanges: boolean;
    consolidateShipments: boolean;
    preferredFulfillmentMethod: FulfillmentMethod;
    maxCartValue?: number;
    cartExpiryDays: number;
    reminderSettings: {
        enabled: boolean;
        reminderTime: number; // minutes before expiry
        methods: ('push' | 'email' | 'sms')[];
    };
}

// Cart Sharing and Collaboration
export interface SharedCart {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    ownerName: string;
    sharedWith: Array<{
        userId: string;
        userName: string;
        permissions: ('view' | 'edit' | 'checkout')[];
        addedAt: string;
    }>;
    isPublic: boolean;
    shareCode?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Cart Templates and Lists
export interface CartTemplate {
    id: string;
    name: string;
    description?: string;
    category: 'grocery' | 'household' | 'party' | 'office' | 'custom';
    items: Array<{
        productId: string;
        quantity: number;
        variants?: Record<string, string>;
        note?: string;
    }>;
    isPublic: boolean;
    usageCount: number;
    rating?: number;
    tags: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Auto-reorder and Subscriptions
export interface AutoReorderItem {
    productId: string;
    quantity: number;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom';
    customFrequencyDays?: number;
    nextOrderDate: string;
    lastOrderDate?: string;
    isActive: boolean;
    maxPrice?: number; // Don't auto-order if price exceeds this
    substituteAllowed: boolean;
    createdAt: string;
}

// Quick Add and Barcode
export interface QuickAddItem {
    barcode?: string;
    productId?: string;
    quantity: number;
    storeId?: string;
}

export interface BarcodeResult {
    barcode: string;
    productId?: string;
    product?: {
        name: string;
        brand: string;
        price: number;
        image: string;
        available: boolean;
    };
    suggestions?: Array<{
        productId: string;
        name: string;
        confidence: number;
    }>;
}

// Cart Analytics and Insights
export interface CartAnalytics {
    sessionId: string;
    events: Array<{
        type: 'item_added' | 'item_removed' | 'quantity_changed' | 'promo_applied' | 'checkout_started';
        timestamp: string;
        itemId?: string;
        metadata?: Record<string, any>;
    }>;
    abandonment: {
        likelihood: number;
        factors: string[];
        recommendations: string[];
    };
    value: {
        current: number;
        predicted: number;
        averageOrderValue: number;
    };
}

// Multi-store Shopping
export interface StoreCart {
    storeId: string;
    storeName: string;
    items: CartItem[];
    summary: CartSummary;
    fulfillmentMethod: FulfillmentMethod;
    availableSlots?: Array<{
        date: string;
        time: string;
        available: boolean;
        fee?: number;
    }>;
}

export interface MultiStoreCart {
    carts: StoreCart[];
    combinedSummary: CartSummary;
    canCombineShipping: boolean;
    recommendedConsolidation?: {
        targetStoreId: string;
        savings: number;
        unavailableItems: string[];
    };
}

// Cart State Management
export interface CartState {
    // Core Data
    items: CartItem[];
    savedItems: SavedItem[];
    removedItems: RemovedCartItem[];
    appliedPromoCodes: PromoCode[];
    summary: CartSummary;

    // Multi-store
    multiStore?: MultiStoreCart;
    selectedStoreId?: string;

    // Settings
    settings: CartSettings;

    // State Flags
    isLoading: boolean;
    isSyncing: boolean;
    isValidating: boolean;
    isDirty: boolean;

    // Validation
    validationResult?: CartValidationResult;
    lastValidated?: string;

    // Metadata
    id?: string;
    userId?: string;
    sessionId: string;
    createdAt?: string;
    updatedAt?: string;
    lastSyncedAt?: string;
    expiresAt?: string;

    // Error Handling
    error?: string;
    lastError?: string;

    // Analytics
    analytics?: CartAnalytics;
}

// Cart Operations and Actions
export interface CartItemInput {
    productId: string;
    quantity: number;
    variantId?: string;
    selectedVariants?: Record<string, string>;
    customizations?: Record<string, any>;
    storeId?: string;
    fulfillmentMethod?: FulfillmentMethod;
    gift?: Partial<CartItem['gift']>;
    subscription?: Partial<CartItem['subscription']>;
}

export interface CartUpdateInput {
    itemId: string;
    quantity?: number;
    variantId?: string;
    selectedVariants?: Record<string, string>;
    customizations?: Record<string, any>;
    fulfillmentMethod?: FulfillmentMethod;
    gift?: Partial<CartItem['gift']>;
}

export interface BulkCartOperation {
    type: 'add' | 'remove' | 'update' | 'clear';
    items?: CartItemInput[];
    updates?: CartUpdateInput[];
    itemIds?: string[];
    storeId?: string;
}

// Cart Migration and Merging
export interface CartMigration {
    sourceCartId: string;
    targetCartId: string;
    strategy: 'merge' | 'replace' | 'append';
    conflictResolution: 'keep_existing' | 'keep_new' | 'combine_quantities';
    preserveMetadata: boolean;
}

export interface CartMergeResult {
    success: boolean;
    mergedItems: number;
    conflictItems: Array<{
        existingItem: CartItem;
        newItem: CartItem;
        resolution: 'kept_existing' | 'kept_new' | 'combined';
    }>;
    errors: string[];
}

// Type Guards and Utilities
export const isCartItem = (item: any): item is CartItem => {
    return item && typeof item.id === 'string' && typeof item.productId === 'string';
};

export const isValidPromoCode = (promo: PromoCode): boolean => {
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validUntil = new Date(promo.validUntil);
    return promo.isActive && now >= validFrom && now <= validUntil;
};

export const calculateItemTotal = (item: CartItem): number => {
    let total = item.price * item.quantity;

    // Apply discounts
    if (item.discounts) {
        item.discounts.forEach(discount => {
            total -= discount.appliedAmount;
        });
    }

    // Add customization costs
    if (item.selectedCustomizations && item.customizations) {
        item.customizations.forEach(customization => {
            const selected = item.selectedCustomizations![customization.id];
            if (selected && customization.price) {
                total += customization.price * item.quantity;
            }
        });
    }

    return Math.max(0, total);
};

export const getItemWeight = (item: CartItem): number => {
    return (item.weight || 0) * item.quantity;
};

export const canSubstitute = (item: CartItem): boolean => {
    return item.availability.substitutionAllowed &&
        item.status === 'out_of_stock' &&
        !item.gift?.isGift;
};

export const requiresSpecialHandling = (item: CartItem): boolean => {
    return !!(item.specialHandling?.fragile ||
        item.specialHandling?.refrigerated ||
        item.specialHandling?.hazmat ||
        item.specialHandling?.oversized);
};

// Default Settings
export const DEFAULT_CART_SETTINGS: CartSettings = {
    autoSave: true,
    saveForLaterEnabled: true,
    substitutionsEnabled: true,
    notifyPriceChanges: true,
    notifyStockChanges: true,
    consolidateShipments: true,
    preferredFulfillmentMethod: 'pickup',
    cartExpiryDays: 30,
    reminderSettings: {
        enabled: true,
        reminderTime: 24 * 60, // 24 hours
        methods: ['push'],
    },
};