import { apiClient } from './client';
import { API } from '../../config/constants';

// Types
export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    placedAt: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    customer: OrderCustomer;
    items: OrderItem[];
    summary: OrderSummary;
    shipping: OrderShipping;
    billing: OrderBilling;
    payment: OrderPayment;
    fulfillment: OrderFulfillment;
    timeline: OrderTimeline[];
    tracking: OrderTracking;
    cancellation?: OrderCancellation;
    returnInfo?: OrderReturn;
    notes?: string;
    metadata: Record<string, any>;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'picking'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'refunded'
    | 'failed';

export interface OrderCustomer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isGuest: boolean;
    walmartPlusMember: boolean;
}

export interface OrderItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    description?: string;
    sku: string;
    image: string;
    brand?: string;
    category: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    quantity: number;
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    variants?: Record<string, string>;
    seller: OrderItemSeller;
    fulfillment: OrderItemFulfillment;
    status: OrderItemStatus;
    tracking?: OrderItemTracking;
    warranty?: OrderItemWarranty;
    returnWindow?: {
        endDate: string;
        isEligible: boolean;
        reason?: string;
    };
}

export type OrderItemStatus =
    | 'pending'
    | 'confirmed'
    | 'backordered'
    | 'cancelled'
    | 'shipped'
    | 'delivered'
    | 'returned';

export interface OrderItemSeller {
    id: string;
    name: string;
    isWalmart: boolean;
    isThirdParty: boolean;
    contact?: {
        email: string;
        phone: string;
    };
}

export interface OrderItemFulfillment {
    type: 'delivery' | 'pickup' | 'digital';
    storeId?: string;
    storeName?: string;
    estimatedDate?: string;
    actualDate?: string;
    trackingNumber?: string;
    carrier?: string;
}

export interface OrderItemTracking {
    trackingNumber: string;
    carrier: string;
    url: string;
    status: string;
    estimatedDelivery?: string;
    events: TrackingEvent[];
}

export interface OrderItemWarranty {
    type: 'manufacturer' | 'extended' | 'protection_plan';
    duration: string;
    provider: string;
    startDate: string;
    endDate: string;
    terms?: string;
}

export interface OrderSummary {
    subtotal: number;
    discount: number;
    couponDiscount: number;
    tax: number;
    taxBreakdown: TaxBreakdown[];
    shipping: number;
    fees: OrderFee[];
    total: number;
    savings: number;
    walmartPlusSavings?: number;
    refundAmount?: number;
    itemCount: number;
    currency: string;
}

export interface TaxBreakdown {
    type: 'sales' | 'vat' | 'import' | 'environmental';
    jurisdiction: string;
    rate: number;
    amount: number;
    taxableAmount: number;
}

export interface OrderFee {
    type: 'service' | 'processing' | 'convenience' | 'delivery' | 'installation';
    name: string;
    amount: number;
    description?: string;
}

export interface OrderShipping {
    address: ShippingAddress;
    method: ShippingMethod;
    instructions?: string;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
    signature: {
        required: boolean;
        obtained?: {
            name: string;
            timestamp: string;
            image?: string;
        };
    };
    insurance: {
        included: boolean;
        amount?: number;
        provider?: string;
    };
}

export interface ShippingAddress {
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
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface ShippingMethod {
    id: string;
    name: string;
    carrier: string;
    serviceLevel: 'standard' | 'expedited' | 'overnight' | 'same_day';
    cost: number;
    estimatedDays: string;
    trackingProvided: boolean;
}

export interface OrderBilling {
    address: BillingAddress;
    isSameAsShipping: boolean;
}

export interface BillingAddress {
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
}

export interface OrderPayment {
    method: PaymentMethod;
    transactions: PaymentTransaction[];
    status: PaymentStatus;
    authorizedAmount: number;
    capturedAmount: number;
    refundedAmount: number;
}

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'voided';

export interface PaymentMethod {
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'walmart_pay' | 'gift_card';
    lastFourDigits?: string;
    cardBrand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    provider?: string;
}

export interface PaymentTransaction {
    id: string;
    type: 'authorization' | 'capture' | 'refund' | 'void';
    amount: number;
    status: PaymentStatus;
    timestamp: string;
    gatewayResponse?: Record<string, any>;
    failureReason?: string;
}

export interface OrderFulfillment {
    type: 'delivery' | 'pickup' | 'mixed';
    instructions?: string;
    pickupDetails?: PickupDetails;
    deliveryWindow?: DeliveryWindow;
    contactlessDelivery: boolean;
    specialHandling?: string[];
}

export interface PickupDetails {
    storeId: string;
    storeName: string;
    address: string;
    phone: string;
    hours: Record<string, string>;
    instructions?: string;
    readyAt?: string;
    expiresAt?: string;
    pickupCode?: string;
    contactPerson?: string;
}

export interface DeliveryWindow {
    startTime: string;
    endTime: string;
    date: string;
    timeZone: string;
    isGuaranteed: boolean;
}

export interface OrderTimeline {
    id: string;
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
    location?: string;
    actor?: {
        type: 'system' | 'user' | 'agent' | 'carrier';
        name?: string;
    };
    metadata?: Record<string, any>;
}

export interface OrderTracking {
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    status: string;
    estimatedDelivery?: string;
    lastUpdate?: string;
    events: TrackingEvent[];
    deliveryAttempts?: DeliveryAttempt[];
}

export interface TrackingEvent {
    id: string;
    status: string;
    description: string;
    location?: string;
    timestamp: string;
    details?: Record<string, any>;
}

export interface DeliveryAttempt {
    attemptNumber: number;
    timestamp: string;
    status: 'delivered' | 'failed' | 'rescheduled';
    reason?: string;
    nextAttemptDate?: string;
    signature?: {
        name: string;
        image?: string;
    };
}

export interface OrderCancellation {
    id: string;
    reason: string;
    requestedBy: 'customer' | 'system' | 'agent';
    requestedAt: string;
    processedAt?: string;
    refundAmount: number;
    refundMethod: string;
    refundStatus: 'pending' | 'processed' | 'failed';
    canReorder: boolean;
}

export interface OrderReturn {
    id: string;
    type: 'full' | 'partial';
    reason: string;
    items: ReturnItem[];
    status: ReturnStatus;
    requestedAt: string;
    approvedAt?: string;
    completedAt?: string;
    refundAmount: number;
    restockingFee: number;
    returnShipping: {
        carrier: string;
        trackingNumber?: string;
        cost: number;
        prepaidLabel: boolean;
    };
    pickupScheduled?: {
        date: string;
        timeWindow: string;
        carrier: string;
    };
}

export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'in_transit' | 'received' | 'inspected' | 'completed';

export interface ReturnItem {
    orderItemId: string;
    quantity: number;
    reason: string;
    condition: 'new' | 'used' | 'damaged' | 'defective';
    refundAmount: number;
    returnFee: number;
}

// Request/Response Types
export interface CreateOrderRequest {
    cartId: string;
    shippingAddress: ShippingAddress;
    billingAddress?: BillingAddress;
    paymentMethodId: string;
    shippingMethodId: string;
    fulfillmentType: 'delivery' | 'pickup';
    storeId?: string;
    deliveryWindow?: DeliveryWindow;
    instructions?: string;
    giftOptions?: GiftOptions;
    promoCode?: string;
}

export interface GiftOptions {
    isGift: boolean;
    giftMessage?: string;
    giftWrap?: {
        type: string;
        cost: number;
    };
    recipientEmail?: string;
}

export interface OrderListRequest {
    page?: number;
    limit?: number;
    status?: OrderStatus[];
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'date' | 'total' | 'status';
    sortOrder?: 'asc' | 'desc';
}

export interface OrderListResponse {
    orders: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    summary: {
        totalOrders: number;
        totalSpent: number;
        averageOrderValue: number;
        ordersByStatus: Record<OrderStatus, number>;
    };
}

export interface CancelOrderRequest {
    orderId: string;
    reason: string;
    items?: Array<{
        itemId: string;
        quantity: number;
    }>;
}

export interface ReturnOrderRequest {
    orderId: string;
    type: 'full' | 'partial';
    reason: string;
    items: Array<{
        itemId: string;
        quantity: number;
        reason: string;
        condition: 'new' | 'used' | 'damaged' | 'defective';
    }>;
    returnMethod: 'pickup' | 'drop_off' | 'mail';
    pickupAddress?: ShippingAddress;
}

export interface ReorderRequest {
    orderId: string;
    items?: string[]; // Specific item IDs to reorder
    useOriginalShipping?: boolean;
    useOriginalPayment?: boolean;
}

export interface OrderSearchRequest {
    query: string;
    filters?: {
        status?: OrderStatus[];
        dateRange?: {
            start: string;
            end: string;
        };
        priceRange?: {
            min: number;
            max: number;
        };
        seller?: string[];
    };
    page?: number;
    limit?: number;
}

export interface ReviewOrderItemRequest {
    orderItemId: string;
    rating: number;
    title: string;
    review: string;
    wouldRecommend: boolean;
    photos?: string[];
}

export interface InvoiceRequest {
    orderId: string;
    format: 'pdf' | 'html';
    email?: string;
}

// Orders API Service
export const ordersAPI = {
    // Order Management
    createOrder: async (data: CreateOrderRequest): Promise<Order> => {
        const response = await apiClient.post<Order>(API.ENDPOINTS.ORDERS.CREATE, data);
        return response.data;
    },

    getOrders: async (params: OrderListRequest = {}): Promise<OrderListResponse> => {
        const response = await apiClient.get<OrderListResponse>(API.ENDPOINTS.USER.ORDER_HISTORY, {
            params,
        });
        return response.data;
    },

    getOrder: async (orderId: string): Promise<Order> => {
        const response = await apiClient.get<Order>(
            API.ENDPOINTS.ORDERS.DETAILS.replace(':id', orderId)
        );
        return response.data;
    },

    searchOrders: async (params: OrderSearchRequest): Promise<OrderListResponse> => {
        const response = await apiClient.post<OrderListResponse>('/orders/search', params);
        return response.data;
    },

    // Order Actions
    cancelOrder: async (data: CancelOrderRequest): Promise<OrderCancellation> => {
        const response = await apiClient.post<OrderCancellation>(
            API.ENDPOINTS.ORDERS.CANCEL.replace(':id', data.orderId),
            data
        );
        return response.data;
    },

    returnOrder: async (data: ReturnOrderRequest): Promise<OrderReturn> => {
        const response = await apiClient.post<OrderReturn>(
            API.ENDPOINTS.ORDERS.RETURN.replace(':id', data.orderId),
            data
        );
        return response.data;
    },

    reorder: async (data: ReorderRequest): Promise<{ cartId: string; unavailableItems: string[] }> => {
        const response = await apiClient.post(`/orders/${data.orderId}/reorder`, data);
        return response.data;
    },

    // Tracking & Status
    getOrderTracking: async (orderId: string): Promise<OrderTracking> => {
        const response = await apiClient.get<OrderTracking>(
            API.ENDPOINTS.ORDERS.TRACK.replace(':id', orderId)
        );
        return response.data;
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
        const response = await apiClient.put<Order>(`/orders/${orderId}/status`, { status });
        return response.data;
    },

    trackShipment: async (trackingNumber: string, carrier?: string): Promise<OrderTracking> => {
        const response = await apiClient.get<OrderTracking>('/orders/track-shipment', {
            params: { trackingNumber, carrier },
        });
        return response.data;
    },

    // Order Modifications
    updateShippingAddress: async (orderId: string, address: ShippingAddress): Promise<Order> => {
        const response = await apiClient.put<Order>(`/orders/${orderId}/shipping-address`, address);
        return response.data;
    },

    updateDeliveryInstructions: async (orderId: string, instructions: string): Promise<Order> => {
        const response = await apiClient.put<Order>(`/orders/${orderId}/delivery-instructions`, {
            instructions,
        });
        return response.data;
    },

    rescheduleDelivery: async (
        orderId: string,
        newWindow: DeliveryWindow
    ): Promise<Order> => {
        const response = await apiClient.put<Order>(`/orders/${orderId}/reschedule-delivery`, {
            deliveryWindow: newWindow,
        });
        return response.data;
    },

    // Returns Management
    getReturnReasons: async (): Promise<string[]> => {
        const response = await apiClient.get<string[]>('/orders/return-reasons');
        return response.data;
    },

    getReturnStatus: async (returnId: string): Promise<OrderReturn> => {
        const response = await apiClient.get<OrderReturn>(`/orders/returns/${returnId}`);
        return response.data;
    },

    scheduleReturnPickup: async (
        returnId: string,
        pickupDetails: {
            address: ShippingAddress;
            preferredDate: string;
            timeWindow: string;
            instructions?: string;
        }
    ): Promise<OrderReturn> => {
        const response = await apiClient.post<OrderReturn>(
            `/orders/returns/${returnId}/schedule-pickup`,
            pickupDetails
        );
        return response.data;
    },

    cancelReturn: async (returnId: string, reason: string): Promise<void> => {
        await apiClient.post(`/orders/returns/${returnId}/cancel`, { reason });
    },

    // Order History & Analytics
    getOrderSummary: async (period: 'month' | 'quarter' | 'year'): Promise<OrderAnalytics> => {
        const response = await apiClient.get<OrderAnalytics>(`/orders/summary?period=${period}`);
        return response.data;
    },

    getFrequentlyOrderedItems: async (limit: number = 10): Promise<FrequentlyOrderedItem[]> => {
        const response = await apiClient.get<FrequentlyOrderedItem[]>(
            `/orders/frequently-ordered?limit=${limit}`
        );
        return response.data;
    },

    // Reviews & Feedback
    reviewOrderItem: async (data: ReviewOrderItemRequest): Promise<void> => {
        await apiClient.post('/orders/review-item', data);
    },

    reportIssue: async (
        orderId: string,
        issue: {
            type: 'delivery' | 'product' | 'billing' | 'other';
            description: string;
            photos?: string[];
        }
    ): Promise<{ issueId: string }> => {
        const response = await apiClient.post(`/orders/${orderId}/report-issue`, issue);
        return response.data;
    },

    // Invoice & Documentation
    getInvoice: async (data: InvoiceRequest): Promise<{ url: string }> => {
        const response = await apiClient.post(`/orders/invoice`, data);
        return response.data;
    },

    downloadInvoice: async (orderId: string): Promise<Blob> => {
        const response = await apiClient.downloadFile(`/orders/${orderId}/invoice`);
        return response.data;
    },

    getReceiptEmail: async (orderId: string, email?: string): Promise<void> => {
        await apiClient.post(`/orders/${orderId}/receipt-email`, { email });
    },

    // Gift Orders
    createGiftOrder: async (data: CreateOrderRequest & { giftOptions: GiftOptions }): Promise<Order> => {
        const response = await apiClient.post<Order>('/orders/gift', data);
        return response.data;
    },

    scheduleGiftDelivery: async (
        orderId: string,
        deliveryDate: string,
        message?: string
    ): Promise<Order> => {
        const response = await apiClient.put<Order>(`/orders/${orderId}/schedule-gift`, {
            deliveryDate,
            message,
        });
        return response.data;
    },

    // Subscription Orders
    getSubscriptionOrders: async (): Promise<SubscriptionOrder[]> => {
        const response = await apiClient.get<SubscriptionOrder[]>('/orders/subscriptions');
        return response.data;
    },

    updateSubscription: async (
        subscriptionId: string,
        updates: {
            frequency?: string;
            nextDelivery?: string;
            quantity?: number;
            paused?: boolean;
        }
    ): Promise<SubscriptionOrder> => {
        const response = await apiClient.put<SubscriptionOrder>(
            `/orders/subscriptions/${subscriptionId}`,
            updates
        );
        return response.data;
    },

    cancelSubscription: async (subscriptionId: string, reason: string): Promise<void> => {
        await apiClient.post(`/orders/subscriptions/${subscriptionId}/cancel`, { reason });
    },
};

// Additional Types
export interface OrderAnalytics {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    topCategories: Array<{ category: string; count: number; total: number }>;
    monthlyTrend: Array<{ month: string; orders: number; total: number }>;
    deliveryMethods: Record<string, number>;
    paymentMethods: Record<string, number>;
}

export interface FrequentlyOrderedItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    orderCount: number;
    lastOrderedAt: string;
    averageQuantity: number;
}

export interface SubscriptionOrder {
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    frequency: string;
    nextDelivery: string;
    status: 'active' | 'paused' | 'cancelled';
    createdAt: string;
    totalDeliveries: number;
}

export default ordersAPI;