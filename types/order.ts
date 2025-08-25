// Order Status Types
export type OrderStatus =
    | 'pending'           // Order created, awaiting payment
    | 'confirmed'         // Payment successful, order confirmed
    | 'processing'        // Order being prepared
    | 'picking'           // Items being picked from warehouse
    | 'packing'           // Items being packed
    | 'ready_for_pickup'  // Ready for customer pickup
    | 'out_for_delivery'  // Out for delivery
    | 'delivered'         // Successfully delivered
    | 'completed'         // Order fully completed
    | 'cancelled'         // Order cancelled
    | 'refunded'          // Order refunded
    | 'returned'          // Order returned
    | 'failed'            // Order failed to process
    | 'on_hold'           // Order on hold (payment, verification, etc.)
    | 'partially_shipped' // Some items shipped
    | 'partially_delivered'; // Some items delivered

// Fulfillment Methods
export type FulfillmentMethod = 'pickup' | 'delivery' | 'shipping' | 'express' | 'same_day' | 'scheduled';

// Payment Status
export type PaymentStatus =
    | 'pending'
    | 'authorized'
    | 'captured'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'refunded'
    | 'partially_refunded'
    | 'chargeback'
    | 'dispute';

// Return Status
export type ReturnStatus =
    | 'requested'
    | 'approved'
    | 'denied'
    | 'in_transit'
    | 'received'
    | 'inspected'
    | 'processed'
    | 'completed'
    | 'cancelled';

// Order Priority
export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent' | 'express';

// Order Sources
export type OrderSource = 'mobile_app' | 'website' | 'in_store' | 'phone' | 'social' | 'marketplace' | 'subscription';

// Address Types
export interface OrderAddress {
    id?: string;
    type: 'billing' | 'shipping' | 'pickup';
    name: string;
    company?: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    email?: string;
    instructions?: string;
    isDefault?: boolean;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    verified: boolean;
    addressType?: 'residential' | 'commercial' | 'po_box';
}

// Order Item Details
export interface OrderItem {
    id: string;
    productId: string;
    variantId?: string;
    sku: string;
    upc?: string;
    name: string;
    brand?: string;
    description?: string;
    category: string;
    department?: string;

    // Pricing
    unitPrice: number;
    salePrice?: number;
    originalPrice?: number;
    totalPrice: number;

    // Quantity
    quantity: number;
    quantityOrdered: number;
    quantityShipped: number;
    quantityDelivered: number;
    quantityReturned: number;
    quantityCancelled: number;

    // Product Details
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

    // Variants and Customizations
    selectedVariants?: Record<string, string>;
    customizations?: Array<{
        type: string;
        value: string;
        price: number;
    }>;

    // Item Status
    status: OrderStatus;
    fulfillmentMethod: FulfillmentMethod;

    // Special Handling
    specialInstructions?: string;
    giftMessage?: string;
    giftWrap?: {
        type: string;
        price: number;
    };

    // Restrictions
    ageRestricted: boolean;
    prescriptionRequired: boolean;
    hazmat: boolean;
    refrigerated: boolean;

    // Tracking
    trackingNumbers?: string[];
    estimatedDelivery?: string;
    actualDelivery?: string;

    // Return Information
    returnable: boolean;
    returnWindow: number; // days
    returnReason?: string;

    // Substitutions
    substituted: boolean;
    originalProductId?: string;
    substitutionReason?: string;
    substitutionApproved?: boolean;

    // Marketplace/Vendor
    vendorId?: string;
    vendorName?: string;
    dropShipping: boolean;
}

// Order Discounts and Fees
export interface OrderDiscount {
    id: string;
    type: 'coupon' | 'promotion' | 'membership' | 'employee' | 'loyalty' | 'refund';
    code?: string;
    name: string;
    description: string;
    amount: number;
    isPercentage: boolean;
    appliedTo: 'order' | 'shipping' | 'item';
    itemIds?: string[];
    maxDiscount?: number;
    source: string;
}

export interface OrderFee {
    id: string;
    type: 'delivery' | 'processing' | 'handling' | 'environmental' | 'convenience' | 'tip';
    name: string;
    description?: string;
    amount: number;
    isRefundable: boolean;
    taxable: boolean;
}

export interface OrderTax {
    id: string;
    name: string;
    type: 'sales' | 'excise' | 'luxury' | 'environmental' | 'local';
    rate: number;
    amount: number;
    jurisdiction: string;
    taxableAmount: number;
    isIncluded: boolean;
}

// Payment Information
export interface OrderPayment {
    id: string;
    method: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'gift_card' | 'store_credit' | 'cash';
    status: PaymentStatus;
    amount: number;
    currency: string;

    // Payment Details
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    authorizationCode?: string;
    transactionId?: string;
    processorResponse?: string;

    // Billing
    billingAddress?: OrderAddress;

    // Processing
    processedAt?: string;
    authorizedAt?: string;
    capturedAt?: string;

    // Fees
    processingFee?: number;

    // Security
    fraudScore?: number;
    riskLevel?: 'low' | 'medium' | 'high';

    // Refunds
    refunds?: Array<{
        id: string;
        amount: number;
        reason: string;
        processedAt: string;
        refundMethod: string;
    }>;
}

// Shipping and Delivery
export interface OrderShipment {
    id: string;
    trackingNumber: string;
    carrier: string;
    carrierService: string;
    method: FulfillmentMethod;

    // Items in shipment
    items: Array<{
        orderItemId: string;
        quantity: number;
    }>;

    // Addresses
    origin: OrderAddress;
    destination: OrderAddress;

    // Status and Timing
    status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
    shippedAt?: string;
    estimatedDelivery: string;
    actualDelivery?: string;

    // Package Details
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'in' | 'cm';
    };
    packageCount: number;

    // Costs
    shippingCost: number;
    insuranceValue?: number;

    // Special Handling
    signatureRequired: boolean;
    adultSignatureRequired: boolean;
    specialInstructions?: string;

    // Tracking Events
    trackingEvents: Array<{
        timestamp: string;
        status: string;
        location: string;
        description: string;
    }>;

    // Delivery Proof
    deliveryProof?: {
        signature?: string;
        photo?: string;
        location?: {
            latitude: number;
            longitude: number;
        };
        recipientName?: string;
    };
}

// Pickup Information
export interface OrderPickup {
    id: string;
    storeId: string;
    storeName: string;
    storeAddress: OrderAddress;

    // Pickup Details
    pickupType: 'curbside' | 'in_store' | 'locker' | 'drive_through';
    pickupTime?: string;
    pickupWindow?: {
        start: string;
        end: string;
    };

    // Customer Information
    pickupPerson: {
        name: string;
        phone: string;
        email?: string;
        photoId?: string;
    };

    // Vehicle Information (for curbside)
    vehicle?: {
        make: string;
        model: string;
        color: string;
        licensePlate: string;
        parkingSpot?: string;
    };

    // Status
    status: 'scheduled' | 'ready' | 'customer_notified' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';

    // Notifications
    notificationsSent: Array<{
        type: 'ready' | 'reminder' | 'arrival';
        sentAt: string;
        method: 'sms' | 'email' | 'push';
    }>;

    // Special Instructions
    instructions?: string;
    accessCode?: string;
}

// Order Timeline
export interface OrderEvent {
    id: string;
    type: 'status_change' | 'payment' | 'shipment' | 'delivery' | 'return' | 'note' | 'communication';
    status?: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
    actor: 'customer' | 'system' | 'employee' | 'carrier';
    actorName?: string;
    metadata?: Record<string, any>;
    isPublic: boolean;

    // Location information
    location?: {
        facility?: string;
        city?: string;
        state?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
}

// Return Information
export interface OrderReturn {
    id: string;
    returnNumber: string;
    orderId: string;
    status: ReturnStatus;

    // Return Details
    reason: 'defective' | 'wrong_item' | 'not_as_described' | 'damaged' | 'unwanted' | 'size_issue' | 'other';
    reasonDescription?: string;
    returnMethod: 'ship' | 'in_store' | 'pickup';

    // Items being returned
    items: Array<{
        orderItemId: string;
        productId: string;
        name: string;
        quantity: number;
        returnQuantity: number;
        condition: 'new' | 'used' | 'damaged' | 'defective';
        reason?: string;
        photos?: string[];
    }>;

    // Financial
    refundAmount: number;
    restockingFee?: number;
    shippingRefund?: number;
    refundMethod: 'original_payment' | 'store_credit' | 'gift_card' | 'cash';

    // Processing
    requestedAt: string;
    approvedAt?: string;
    receivedAt?: string;
    processedAt?: string;
    completedAt?: string;

    // Shipping
    returnShipment?: {
        trackingNumber?: string;
        carrier?: string;
        labelUrl?: string;
        prepaid: boolean;
    };

    // Communication
    notes?: string;
    customerComments?: string;
    internalNotes?: string;

    // Photos and Evidence
    photos?: string[];
    inspectionNotes?: string;
}

// Order Preferences
export interface OrderPreferences {
    defaultFulfillmentMethod: FulfillmentMethod;
    substituteItems: boolean;
    leaveAtDoor: boolean;
    requireSignature: boolean;
    preferredDeliveryTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
    contactPreference: 'phone' | 'email' | 'sms';
    specialInstructions?: string;

    // Notifications
    notifications: {
        orderConfirmation: boolean;
        statusUpdates: boolean;
        deliveryReminders: boolean;
        promotionalOffers: boolean;
    };
}

// Main Order Interface
export interface Order {
    // Basic Information
    id: string;
    orderNumber: string;
    status: OrderStatus;
    priority: OrderPriority;
    source: OrderSource;

    // Customer Information
    customerId: string;
    customerEmail: string;
    customerPhone?: string;
    isGuest: boolean;

    // Store and Location
    storeId?: string;
    storeName?: string;
    warehouseId?: string;
    region?: string;

    // Items and Pricing
    items: OrderItem[];
    subtotal: number;
    discounts: OrderDiscount[];
    taxes: OrderTax[];
    fees: OrderFee[];
    shippingCost: number;
    total: number;
    currency: string;

    // Fulfillment
    fulfillmentMethod: FulfillmentMethod;
    addresses: {
        billing?: OrderAddress;
        shipping?: OrderAddress;
        pickup?: OrderAddress;
    };

    // Payment
    payments: OrderPayment[];
    paymentStatus: PaymentStatus;

    // Shipping and Delivery
    shipments: OrderShipment[];
    pickup?: OrderPickup;
    estimatedDelivery?: string;
    actualDelivery?: string;
    deliveryInstructions?: string;

    // Returns
    returns: OrderReturn[];
    returnWindow: number; // days

    // Timeline and Events
    events: OrderEvent[];

    // Dates
    createdAt: string;
    updatedAt: string;
    placedAt?: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    cancelledAt?: string;

    // Special Features
    isGift: boolean;
    giftMessage?: string;
    giftReceipt: boolean;

    // Subscription
    isSubscription: boolean;
    subscriptionId?: string;
    subscriptionFrequency?: string;

    // Customer Service
    notes?: string;
    internalNotes?: string;
    customerComments?: string;
    specialHandling?: string[];

    // Tracking and Analytics
    sessionId?: string;
    deviceId?: string;
    userAgent?: string;
    referrer?: string;
    campaignId?: string;

    // Risk and Fraud
    riskScore?: number;
    fraudChecks?: Array<{
        check: string;
        result: 'pass' | 'fail' | 'review';
        score?: number;
    }>;

    // Metadata
    metadata?: Record<string, any>;
    tags?: string[];
}

// Order Summary for Lists
export interface OrderSummary {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    currency: string;
    itemCount: number;
    createdAt: string;
    estimatedDelivery?: string;
    fulfillmentMethod: FulfillmentMethod;
    storeId?: string;
    storeName?: string;
    thumbnail?: string;
    canReorder: boolean;
    canReturn: boolean;
    canCancel: boolean;
    hasTracking: boolean;
}

// Order Creation Request
export interface CreateOrderRequest {
    cartId?: string;
    customerId?: string;
    items?: Array<{
        productId: string;
        variantId?: string;
        quantity: number;
        unitPrice: number;
        customizations?: Record<string, any>;
    }>;

    // Addresses
    billingAddress: Omit<OrderAddress, 'id' | 'type'>;
    shippingAddress?: Omit<OrderAddress, 'id' | 'type'>;
    pickupDetails?: Partial<OrderPickup>;

    // Payment
    paymentMethodId: string;
    paymentDetails?: Record<string, any>;

    // Fulfillment
    fulfillmentMethod: FulfillmentMethod;
    storeId?: string;
    deliveryInstructions?: string;

    // Discounts
    promoCodes?: string[];
    giftCardCodes?: string[];

    // Preferences
    preferences?: Partial<OrderPreferences>;

    // Gift Options
    isGift?: boolean;
    giftMessage?: string;
    giftReceipt?: boolean;

    // Special Handling
    specialInstructions?: string;
    requireSignature?: boolean;
    leaveAtDoor?: boolean;

    // Metadata
    source?: OrderSource;
    sessionId?: string;
    deviceId?: string;
    metadata?: Record<string, any>;
}

// Order Update Request
export interface UpdateOrderRequest {
    status?: OrderStatus;
    fulfillmentMethod?: FulfillmentMethod;
    deliveryInstructions?: string;
    specialInstructions?: string;

    // Address updates
    shippingAddress?: Partial<OrderAddress>;
    pickupDetails?: Partial<OrderPickup>;

    // Item updates
    items?: Array<{
        id: string;
        quantity?: number;
        action?: 'update' | 'cancel' | 'substitute';
        substitution?: {
            productId: string;
            reason: string;
        };
    }>;

    // Communication
    notes?: string;
    customerComments?: string;
}

// Order Filters for Queries
export interface OrderFilters {
    status?: OrderStatus[];
    fulfillmentMethod?: FulfillmentMethod[];
    paymentStatus?: PaymentStatus[];
    dateRange?: {
        start: string;
        end: string;
    };
    priceRange?: {
        min: number;
        max: number;
    };
    storeId?: string;
    customerId?: string;
    source?: OrderSource[];
    priority?: OrderPriority[];
    hasReturns?: boolean;
    isGift?: boolean;
    search?: string;
}

// Order Analytics
export interface OrderAnalytics {
    orderId: string;
    metrics: {
        timeToFulfillment: number;
        customerSatisfaction?: number;
        onTimeDelivery: boolean;
        returnRate: number;
        profitMargin: number;
        customerLifetimeValue: number;
    };

    performance: {
        pickingTime?: number;
        packingTime?: number;
        shippingTime?: number;
        deliveryTime?: number;
        totalFulfillmentTime: number;
    };

    customerBehavior: {
        reorderLikelihood: number;
        supportTickets: number;
        reviewScore?: number;
        referralGenerated: boolean;
    };
}

// Bulk Order Operations
export interface BulkOrderOperation {
    operation: 'cancel' | 'refund' | 'ship' | 'update_status' | 'add_tracking';
    orderIds: string[];
    parameters?: Record<string, any>;
    reason?: string;
    notify?: boolean;
}

export interface BulkOrderResult {
    successful: string[];
    failed: Array<{
        orderId: string;
        error: string;
    }>;
    warnings: Array<{
        orderId: string;
        warning: string;
    }>;
}

// Type Guards and Utilities
export const isOrderCancellable = (order: Order): boolean => {
    const cancellableStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing'];
    return cancellableStatuses.includes(order.status);
};

export const isOrderReturnable = (order: Order): boolean => {
    const returnableStatuses: OrderStatus[] = ['delivered', 'completed'];
    if (!returnableStatuses.includes(order.status)) return false;

    const deliveredDate = new Date(order.deliveredAt || order.completedAt!);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceDelivery <= order.returnWindow;
};

export const canReorderOrder = (order: Order): boolean => {
    return order.status === 'delivered' || order.status === 'completed';
};

export const getOrderProgress = (order: Order): number => {
    const statusOrder: OrderStatus[] = [
        'pending', 'confirmed', 'processing', 'picking', 'packing',
        'ready_for_pickup', 'out_for_delivery', 'delivered', 'completed'
    ];

    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
};

export const calculateOrderTotal = (order: Order): number => {
    const discountTotal = order.discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const taxTotal = order.taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const feeTotal = order.fees.reduce((sum, fee) => sum + fee.amount, 0);

    return order.subtotal - discountTotal + taxTotal + feeTotal + order.shippingCost;
};

// Default Configurations
export const DEFAULT_ORDER_PREFERENCES: OrderPreferences = {
    defaultFulfillmentMethod: 'pickup',
    substituteItems: true,
    leaveAtDoor: false,
    requireSignature: false,
    preferredDeliveryTime: 'anytime',
    contactPreference: 'email',
    notifications: {
        orderConfirmation: true,
        statusUpdates: true,
        deliveryReminders: true,
        promotionalOffers: false,
    },
};

export const ORDER_STATUS_PRIORITY: Record<OrderStatus, number> = {
    'failed': 1,
    'cancelled': 2,
    'returned': 3,
    'refunded': 4,
    'on_hold': 5,
    'pending': 6,
    'confirmed': 7,
    'processing': 8,
    'picking': 9,
    'packing': 10,
    'ready_for_pickup': 11,
    'out_for_delivery': 12,
    'partially_shipped': 13,
    'partially_delivered': 14,
    'delivered': 15,
    'completed': 16,
};