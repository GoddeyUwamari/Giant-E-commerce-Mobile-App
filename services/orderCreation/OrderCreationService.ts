// Order Creation Service - Converts cart data to Order format
import { ordersAPI, type Order, type CreateOrderRequest, type ShippingAddress, type BillingAddress } from '../api/orders';
import { orderStorage } from '../storage/asyncStorage';
import type { CartItem, CartSummary, DeliveryAddress } from '../../store/slices/cartSlice';
import type { PaymentIntent } from '../api/payments';

interface CreateOrderFromCartData {
    cartItems: CartItem[];
    cartSummary: CartSummary;
    deliveryAddress: DeliveryAddress;
    paymentIntent: PaymentIntent;
    paymentMethodId: string;
    appliedPromoCodes?: Array<{ code: string; description: string }>;
    customerId?: string;
    customerEmail?: string;
}

export class OrderCreationService {
    /**
     * Convert cart data to Order format and create order
     */
    static async createOrderFromCart(data: CreateOrderFromCartData): Promise<Order | null> {
        try {
            console.log('🚀 Creating order from cart data...');

            // Convert cart data to CreateOrderRequest format
            const orderRequest = this.convertCartToOrderRequest(data);

            // Create order via API (or mock for development)
            let createdOrder: Order;

            if (__DEV__ && process.env.NODE_ENV === 'development') {
                // Development mode: create mock order
                createdOrder = this.createMockOrder(data, orderRequest);
                console.log('🔄 Development mode: Created mock order');
            } else {
                // Production mode: call real API
                createdOrder = await ordersAPI.createOrder(orderRequest);
                console.log('✅ Production mode: Created real order via API');
            }

            // Store order in AsyncStorage for immediate access
            await orderStorage.saveCompletedOrder(createdOrder);

            console.log('✅ Order created and stored successfully:', createdOrder.id);
            return createdOrder;

        } catch (error) {
            console.error('❌ Failed to create order from cart:', error);
            return null;
        }
    }

    /**
     * Convert cart data to CreateOrderRequest format
     */
    private static convertCartToOrderRequest(data: CreateOrderFromCartData): CreateOrderRequest {
        const {
            cartItems,
            cartSummary,
            deliveryAddress,
            paymentIntent,
            paymentMethodId,
            appliedPromoCodes,
        } = data;

        // Convert delivery address to shipping address format
        const shippingAddress: ShippingAddress = {
            firstName: deliveryAddress.name.split(' ')[0] || 'Customer',
            lastName: deliveryAddress.name.split(' ').slice(1).join(' ') || '',
            address1: deliveryAddress.street,
            address2: deliveryAddress.apartment || '',
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            zipCode: deliveryAddress.zipCode,
            country: deliveryAddress.country || 'US',
            phone: deliveryAddress.phone || '',
            isResidential: true,
        };

        // Use same address for billing (can be updated later)
        const billingAddress: BillingAddress = {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
            phone: shippingAddress.phone,
        };

        return {
            cartId: paymentIntent.metadata?.cartId || `cart_${Date.now()}`,
            shippingAddress,
            billingAddress,
            paymentMethodId,
            shippingMethodId: 'standard', // Default to standard shipping
            fulfillmentType: 'delivery',
            promoCode: appliedPromoCodes?.[0]?.code,
            giftOptions: {
                isGift: false,
            },
        };
    }

    /**
     * Create mock order for development
     */
    private static createMockOrder(
        data: CreateOrderFromCartData,
        orderRequest: CreateOrderRequest
    ): Order {
        const {
            cartItems,
            cartSummary,
            deliveryAddress,
            paymentIntent,
            paymentMethodId,
            appliedPromoCodes,
            customerId,
            customerEmail,
        } = data;

        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const orderNumber = `WM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        return {
            id: orderId,
            orderNumber,
            status: 'confirmed',
            placedAt: new Date().toISOString(),
            expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now

            // Customer info
            customer: {
                id: customerId || 'guest_customer',
                email: customerEmail || 'customer@example.com',
                firstName: orderRequest.shippingAddress.firstName,
                lastName: orderRequest.shippingAddress.lastName,
                isGuest: !customerId,
                walmartPlusMember: false,
            },

            // Convert cart items to order items
            items: cartItems.map((cartItem, index) => ({
                id: `item_${orderId}_${index}`,
                productId: cartItem.productId,
                variantId: cartItem.variant ? JSON.stringify(cartItem.variant) : undefined,
                name: cartItem.name,
                description: cartItem.description,
                sku: cartItem.sku,
                image: cartItem.image,
                brand: cartItem.brand,
                category: cartItem.category,
                price: cartItem.salePrice || cartItem.price,
                originalPrice: cartItem.originalPrice,
                salePrice: cartItem.salePrice,
                quantity: cartItem.quantity,
                totalAmount: (cartItem.salePrice || cartItem.price) * cartItem.quantity,
                discountAmount: cartItem.originalPrice
                    ? (cartItem.originalPrice - (cartItem.salePrice || cartItem.price)) * cartItem.quantity
                    : 0,
                taxAmount: ((cartItem.salePrice || cartItem.price) * cartItem.quantity) * (cartSummary.tax / cartSummary.subtotal),
                variants: cartItem.variant,
                seller: {
                    id: cartItem.storeId,
                    name: cartItem.storeName,
                    isWalmart: cartItem.storeName.toLowerCase().includes('walmart'),
                    isThirdParty: !cartItem.storeName.toLowerCase().includes('walmart'),
                },
                fulfillment: {
                    type: cartItem.delivery.option,
                    estimatedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                },
                status: 'confirmed',
                returnWindow: {
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    isEligible: true,
                },
            })),

            // Order summary
            summary: {
                subtotal: cartSummary.subtotal,
                discount: cartSummary.discounts + cartSummary.savings,
                couponDiscount: cartSummary.discounts,
                tax: cartSummary.tax,
                taxBreakdown: [{
                    type: 'sales',
                    jurisdiction: deliveryAddress.state,
                    rate: cartSummary.tax / cartSummary.subtotal,
                    amount: cartSummary.tax,
                    taxableAmount: cartSummary.subtotal,
                }],
                shipping: (cartSummary.shipping || 0) + (cartSummary.delivery || 0),
                fees: [],
                total: cartSummary.total,
                savings: cartSummary.savings + cartSummary.discounts,
                itemCount: cartSummary.itemCount,
                currency: 'USD',
            },

            // Shipping information
            shipping: {
                address: orderRequest.shippingAddress,
                method: {
                    id: 'standard',
                    name: 'Standard Delivery',
                    carrier: 'FedEx',
                    serviceLevel: 'standard',
                    cost: (cartSummary.shipping || 0) + (cartSummary.delivery || 0),
                    estimatedDays: '2-3 business days',
                    trackingProvided: true,
                },
                estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                signature: {
                    required: false,
                },
                insurance: {
                    included: cartSummary.total > 100,
                    amount: cartSummary.total > 100 ? cartSummary.total : undefined,
                },
            },

            // Billing information
            billing: {
                address: orderRequest.billingAddress!,
                isSameAsShipping: true,
            },

            // Payment information
            payment: {
                method: {
                    type: 'credit_card',
                    lastFourDigits: '4242',
                    cardBrand: 'Visa',
                },
                transactions: [{
                    id: paymentIntent.id,
                    type: 'capture',
                    amount: cartSummary.total,
                    status: 'captured',
                    timestamp: new Date().toISOString(),
                }],
                status: 'captured',
                authorizedAmount: cartSummary.total,
                capturedAmount: cartSummary.total,
                refundedAmount: 0,
            },

            // Fulfillment
            fulfillment: {
                type: 'delivery',
                contactlessDelivery: false,
                specialHandling: [],
            },

            // Timeline
            timeline: [
                {
                    id: `timeline_${orderId}_1`,
                    status: 'confirmed',
                    title: 'Order Confirmed',
                    description: 'Your order has been confirmed and is being prepared for shipment.',
                    timestamp: new Date().toISOString(),
                    actor: {
                        type: 'system',
                        name: 'Walmart Order System',
                    },
                },
            ],

            // Tracking (will be updated when shipped)
            tracking: {
                status: 'Order Confirmed',
                events: [
                    {
                        id: `track_${orderId}_1`,
                        status: 'Order Placed',
                        description: 'Order has been confirmed and is being prepared',
                        timestamp: new Date().toISOString(),
                        location: 'Walmart Fulfillment Center',
                    },
                ],
            },

            // Metadata
            notes: appliedPromoCodes?.length ? `Applied promo codes: ${appliedPromoCodes.map(p => p.code).join(', ')}` : undefined,
            metadata: {
                paymentIntentId: paymentIntent.id,
                cartId: paymentIntent.metadata?.cartId,
                appliedPromoCodes: appliedPromoCodes?.map(p => p.code) || [],
                createdFromApp: true,
                appVersion: '1.0.0',
                platform: 'mobile',
            },
        };
    }

    /**
     * Get order by ID (from storage first, then API)
     */
    static async getOrderById(orderId: string): Promise<Order | null> {
        try {
            // First check if it's the current order in storage
            const currentOrder = await orderStorage.getCurrentOrder();
            if (currentOrder && currentOrder.id === orderId) {
                return currentOrder;
            }

            // Check order history
            const orderHistory = await orderStorage.getOrderHistory();
            const historyOrder = orderHistory?.find(order => order.id === orderId);
            if (historyOrder) {
                return historyOrder;
            }

            // If not found locally, try API (in production)
            if (!__DEV__) {
                try {
                    const apiOrder = await ordersAPI.getOrder(orderId);
                    return apiOrder;
                } catch (apiError) {
                    console.warn('API order fetch failed:', apiError);
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting order by ID:', error);
            return null;
        }
    }

    /**
     * Get order history for the current user
     */
    static async getOrderHistory(): Promise<Order[]> {
        try {
            // Get order history from storage
            const orderHistory = await orderStorage.getOrderHistory();
            return orderHistory || [];
        } catch (error) {
            console.error('Error getting order history:', error);
            return [];
        }
    }

    /**
     * Handle post-payment order creation
     */
    static async handlePaymentSuccess(
        paymentResult: any,
        cartData: CreateOrderFromCartData
    ): Promise<{ success: boolean; orderId?: string; error?: string }> {
        try {
            console.log('🎉 Payment successful, creating order...');

            // Create order from cart data
            const order = await this.createOrderFromCart(cartData);

            if (!order) {
                throw new Error('Failed to create order');
            }

            // Clean up payment session data
            await orderStorage.cleanupOrderSession();

            console.log('✅ Order creation completed successfully');

            return {
                success: true,
                orderId: order.id,
            };

        } catch (error) {
            console.error('❌ Error handling payment success:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Utility: Generate order number
     */
    static generateOrderNumber(): string {
        const year = new Date().getFullYear();
        const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `WM-${year}-${randomPart}`;
    }

    /**
     * Utility: Calculate estimated delivery date
     */
    static calculateEstimatedDelivery(shippingMethod: string = 'standard'): Date {
        const now = new Date();
        const deliveryDays = shippingMethod === 'expedited' ? 1 : shippingMethod === 'overnight' ? 1 : 2;
        return new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    }
}

export default OrderCreationService;