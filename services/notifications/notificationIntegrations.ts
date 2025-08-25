import { pushNotifications } from './pushNotifications';
import { useCartStore } from '../../store/slices/cartSlice';
import type { PushNotification, NotificationTrigger } from './pushNotifications';

export class NotificationIntegrations {
    // Order confirmation notification
    static async sendOrderConfirmation(orderId: string, orderTotal: number): Promise<void> {
        const notification: Omit<PushNotification, 'id'> = {
            title: '🎉 Order Confirmed!',
            body: `Your order ${orderId} for $${orderTotal.toFixed(2)} has been confirmed`,
            category: 'orders',
            data: {
                type: 'order_status',
                orderId,
                deepLink: `/orders/${orderId}`,
            },
            actionButtons: [
                { id: 'view_order', title: 'View Order', type: 'default' },
                { id: 'track_order', title: 'Track', type: 'default' },
            ],
        };

        // 🚀 FIX: Pass null trigger for immediate notification
        await pushNotifications.sendLocalNotification(notification, null);
    }

    // Cart abandonment reminder
    static async scheduleCartReminder(cartValue: number, items: number): Promise<void> {
        const notification: Omit<PushNotification, 'id'> = {
            title: '🛒 Items waiting in your cart',
            body: `${items} items worth $${cartValue.toFixed(2)} are waiting for you`,
            category: 'shopping',
            data: {
                type: 'cart_reminder',
                deepLink: '/cart',
            },
            actionButtons: [
                { id: 'view_cart', title: 'View Cart', type: 'default' },
                { id: 'dismiss', title: 'Dismiss', type: 'default' },
            ],
        };

        const trigger: NotificationTrigger = {
            type: 'timeInterval',
            seconds: 60 * 60 * 24, // 24 hours
            repeats: false,
        };

        await pushNotifications.scheduleNotification(notification, trigger);
    }

    // Payment success notification
    static async sendPaymentSuccess(orderId: string, amount: number): Promise<void> {
        const notification: Omit<PushNotification, 'id'> = {
            title: '💳 Payment Successful',
            body: `Payment of $${amount.toFixed(2)} processed successfully for order ${orderId}`,
            category: 'orders',
            data: {
                type: 'order_status',
                orderId,
                deepLink: `/orders/${orderId}`,
            },
        };

        // 🚀 FIX: Pass null trigger for immediate notification
        await pushNotifications.sendLocalNotification(notification, null);
    }

    // AI-powered personalized deal notifications
    static async sendPersonalizedDeal(productId: string, productName: string, discount: number): Promise<void> {
        const notification: Omit<PushNotification, 'id'> = {
            title: '🤖 AI found a deal for you!',
            body: `${discount}% off ${productName} - Perfect match based on your shopping history`,
            category: 'deals',
            data: {
                type: 'deal_alert',
                productId,
                deepLink: `/product/${productId}`,
            },
            actionButtons: [
                { id: 'view_deal', title: 'View Deal', type: 'default' },
                { id: 'save_deal', title: 'Save', type: 'default' },
            ],
        };

        // 🚀 FIX: Pass null trigger for immediate notification
        await pushNotifications.sendLocalNotification(notification, null);
    }

    // 🆕 BONUS: Order status update notification
    static async sendOrderStatusUpdate(orderId: string, status: string, message: string): Promise<void> {
        const notification: Omit<PushNotification, 'id'> = {
            title: `📦 Order ${status}`,
            body: message,
            category: 'orders',
            data: {
                type: 'order_status',
                orderId,
                status,
                deepLink: `/orders/${orderId}`,
            },
            actionButtons: [
                { id: 'track_order', title: 'Track Order', type: 'default' },
            ],
        };

        await pushNotifications.sendLocalNotification(notification, null);
    }

    // 🆕 BONUS: Delivery notification
    static async sendDeliveryUpdate(orderId: string, estimatedTime: string): Promise<void> {
        const notification: Omit<PushNotification, 'id'> = {
            title: '🚚 Your order is on the way!',
            body: `Estimated delivery: ${estimatedTime}`,
            category: 'delivery',
            data: {
                type: 'delivery_update',
                orderId,
                deepLink: `/orders/${orderId}/track`,
            },
            actionButtons: [
                { id: 'track_delivery', title: 'Track', type: 'default' },
                { id: 'contact_driver', title: 'Contact Driver', type: 'default' },
            ],
        };

        await pushNotifications.sendLocalNotification(notification, null);
    }
}