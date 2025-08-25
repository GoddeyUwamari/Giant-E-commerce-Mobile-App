import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../config/constants';

// Types
export interface PushNotification {
    id: string;
    title: string;
    body: string;
    data?: NotificationData;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    sound?: string;
    badge?: number;
    image?: string;
    scheduledTime?: string;
    expiryTime?: string;
    actionButtons?: NotificationAction[];
    tags?: string[];
    userId?: string;
    storeId?: string;
}

export interface NotificationData {
    type: NotificationType;
    productId?: string;
    orderId?: string;
    storeId?: string;
    dealId?: string;
    url?: string;
    deepLink?: string;
    imageUrl?: string;
    metadata?: Record<string, any>;
}

export type NotificationType =
    | 'order_status'
    | 'delivery_update'
    | 'price_drop'
    | 'back_in_stock'
    | 'deal_alert'
    | 'cart_reminder'
    | 'pickup_ready'
    | 'pharmacy_reminder'
    | 'appointment_reminder'
    | 'review_request'
    | 'promotional'
    | 'system_alert'
    | 'security_alert'
    | 'walmart_plus'
    | 'social_activity';

export type NotificationCategory =
    | 'orders'
    | 'shopping'
    | 'deals'
    | 'services'
    | 'social'
    | 'system'
    | 'security'
    | 'marketing'
    | 'delivery';

export type NotificationPriority = 'low' | 'default' | 'high' | 'max';

export interface NotificationAction {
    id: string;
    title: string;
    icon?: string;
    type: 'default' | 'textInput' | 'destructive';
    placeholder?: string; // For text input actions
    options?: NotificationActionOptions;
}

export interface NotificationActionOptions {
    opensApp?: boolean;
    foreground?: boolean;
    authenticationRequired?: boolean;
}

export interface NotificationSettings {
    enabled: boolean;
    categories: Record<NotificationCategory, CategorySettings>;
    quietHours: QuietHoursSettings;
    soundSettings: SoundSettings;
    displaySettings: DisplaySettings;
    locationBased: LocationBasedSettings;
}

export interface CategorySettings {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    showPreviews: boolean;
    badge: boolean;
    lockScreen: boolean;
    banners: boolean;
    criticalAlerts: boolean;
}

export interface QuietHoursSettings {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    days: string[]; // ['monday', 'tuesday', etc.]
    allowCritical: boolean;
    allowFromContacts: boolean;
}

export interface SoundSettings {
    defaultSound: string;
    customSounds: Record<NotificationCategory, string>;
    volume: number; // 0-1
    vibrationPattern: 'default' | 'subtle' | 'prominent' | 'custom';
}

export interface DisplaySettings {
    showOnLockScreen: boolean;
    showInNotificationCenter: boolean;
    showAsBanners: boolean;
    showPreviews: 'always' | 'when_unlocked' | 'never';
    grouping: 'automatic' | 'by_app' | 'off';
    badgeAppIcon: boolean;
}

export interface LocationBasedSettings {
    enabled: boolean;
    storeNotifications: boolean;
    dealNotifications: boolean;
    pickupReminders: boolean;
    radius: number; // in miles
    preferredStores: string[];
}

export interface ScheduledNotification {
    id: string;
    notification: PushNotification;
    trigger: NotificationTrigger;
    status: 'scheduled' | 'sent' | 'cancelled' | 'failed';
    createdAt: string;
    scheduledFor: string;
    sentAt?: string;
    cancelledAt?: string;
}

export interface NotificationTrigger {
    type: 'date' | 'timeInterval' | 'calendar' | 'location' | 'condition';
    date?: string;
    seconds?: number;
    repeats?: boolean;
    repeatInterval?: 'daily' | 'weekly' | 'monthly';
    calendarTrigger?: CalendarTrigger;
    locationTrigger?: LocationTrigger;
    conditionTrigger?: ConditionTrigger;
}

export interface CalendarTrigger {
    hour: number;
    minute: number;
    weekday?: number;
    day?: number;
    month?: number;
    year?: number;
}

export interface LocationTrigger {
    latitude: number;
    longitude: number;
    radius: number;
    notifyOnEntry: boolean;
    notifyOnExit: boolean;
}

export interface ConditionTrigger {
    type: 'price_drop' | 'stock_available' | 'deal_starts' | 'delivery_status';
    conditions: Record<string, any>;
}

export interface NotificationHistory {
    id: string;
    notification: PushNotification;
    receivedAt: string;
    readAt?: string;
    actionTaken?: string;
    isRead: boolean;
    isArchived: boolean;
}

export interface NotificationAnalytics {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    categoriesBreakdown: Record<NotificationCategory, CategoryAnalytics>;
    timeOfDayAnalytics: TimeAnalytics[];
    deviceAnalytics: DeviceAnalytics;
}

export interface CategoryAnalytics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
}

export interface TimeAnalytics {
    hour: number;
    sent: number;
    opened: number;
    clickRate: number;
}

export interface DeviceAnalytics {
    ios: CategoryAnalytics;
    android: CategoryAnalytics;
}

export interface PushToken {
    token: string;
    platform: 'ios' | 'android';
    deviceId: string;
    appVersion: string;
    osVersion: string;
    isActive: boolean;
    registeredAt: string;
    lastUsed: string;
}

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const settings = await getNotificationSettings();
        const category = notification.request.content.categoryIdentifier as NotificationCategory;
        const categorySettings = settings.categories[category] || settings.categories.system;

        // Check quiet hours
        if (isQuietHours(settings.quietHours) && !isCriticalNotification(notification)) {
            return {
                shouldShowAlert: false,
                shouldPlaySound: false,
                shouldSetBadge: false,
            };
        }

        return {
            shouldShowAlert: categorySettings.enabled && categorySettings.banners,
            shouldPlaySound: categorySettings.enabled && categorySettings.sound,
            shouldSetBadge: categorySettings.enabled && categorySettings.badge,
        };
    },
});

// Push Notifications Service
export class PushNotificationService {
    private static instance: PushNotificationService;
    private isInitialized = false;
    private pushToken: string | null = null;
    private notificationListeners: Array<(notification: NotificationHistory) => void> = [];

    static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }

    // Initialize push notifications
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Register for push notifications
            await this.registerForPushNotifications();

            // Set up notification categories
            await this.setupNotificationCategories();

            // Set up listeners
            this.setupNotificationListeners();

            // Load settings
            await this.loadSettings();

            this.isInitialized = true;
            console.log('✅ Push notifications initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize push notifications:', error);
            throw error;
        }
    }

    // Register for push notifications
    private async registerForPushNotifications(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log('⚠️ Push notifications only work on physical devices');
            return null;
        }

        try {
            // Check existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('❌ Push notification permissions not granted');
                return null;
            }

            // Get push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: 'walmart-mobile-a6865', // Replace with your Expo project ID
            });

            this.pushToken = tokenData.data;

            // Store token
            await this.storePushToken(this.pushToken);

            // Register token with server
            await this.registerTokenWithServer(this.pushToken);

            console.log('🔔 Push token registered:', this.pushToken);
            return this.pushToken;
        } catch (error) {
            console.error('❌ Error registering for push notifications:', error);
            return null;
        }
    }

    // Setup notification categories
    private async setupNotificationCategories(): Promise<void> {
        const categories: Notifications.NotificationCategory[] = [
            {
                identifier: 'orders',
                actions: [
                    {
                        identifier: 'view_order',
                        buttonTitle: 'View Order',
                        options: { opensApp: true },
                    },
                    {
                        identifier: 'track_order',
                        buttonTitle: 'Track',
                        options: { opensApp: true },
                    },
                ],
                options: { allowInCarPlay: true },
            },
            {
                identifier: 'deals',
                actions: [
                    {
                        identifier: 'view_deal',
                        buttonTitle: 'View Deal',
                        options: { opensApp: true },
                    },
                    {
                        identifier: 'save_deal',
                        buttonTitle: 'Save',
                        options: { opensApp: false },
                    },
                ],
            },
            {
                identifier: 'shopping',
                actions: [
                    {
                        identifier: 'view_cart',
                        buttonTitle: 'View Cart',
                        options: { opensApp: true },
                    },
                    {
                        identifier: 'dismiss',
                        buttonTitle: 'Dismiss',
                        options: { opensApp: false },
                    },
                ],
            },
            {
                identifier: 'delivery',
                actions: [
                    {
                        identifier: 'track_delivery',
                        buttonTitle: 'Track',
                        options: { opensApp: true },
                    },
                    {
                        identifier: 'contact_driver',
                        buttonTitle: 'Contact Driver',
                        options: { opensApp: true },
                    },
                ],
            },
        ];

        await Notifications.setNotificationCategoryAsync('orders', categories[0]);
        await Notifications.setNotificationCategoryAsync('deals', categories[1]);
        await Notifications.setNotificationCategoryAsync('shopping', categories[2]);
        await Notifications.setNotificationCategoryAsync('delivery', categories[3]);

        console.log('📂 Notification categories configured');
    }

    // Setup notification listeners
    private setupNotificationListeners(): void {
        // Listen for notifications received while app is in foreground
        Notifications.addNotificationReceivedListener(this.handleNotificationReceived.bind(this));

        // Listen for notification responses (user tapped notification)
        Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse.bind(this));
    }

    // Handle notification received
    private async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
        console.log('📩 Notification received:', notification.request.identifier);

        // Save to history
        const historyEntry: NotificationHistory = {
            id: notification.request.identifier,
            notification: {
                id: notification.request.identifier,
                title: notification.request.content.title || '',
                body: notification.request.content.body || '',
                data: notification.request.content.data as NotificationData,
                category: notification.request.content.categoryIdentifier as NotificationCategory,
            },
            receivedAt: new Date().toISOString(),
            isRead: false,
            isArchived: false,
        };

        await this.saveNotificationToHistory(historyEntry);

        // Notify listeners
        this.notificationListeners.forEach(listener => listener(historyEntry));

        // Track analytics
        await this.trackNotificationReceived(historyEntry);
    }

    // Handle notification response
    private async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
        console.log('👆 Notification response:', response.actionIdentifier);

        const actionIdentifier = response.actionIdentifier;
        const notification = response.notification;
        const data = notification.request.content.data as NotificationData;

        // Mark as read
        await this.markNotificationAsRead(notification.request.identifier);

        // Handle action
        await this.handleNotificationAction(actionIdentifier, data);

        // Track analytics
        await this.trackNotificationClicked(notification.request.identifier, actionIdentifier);
    }

    // Handle notification actions
    private async handleNotificationAction(actionIdentifier: string, data: NotificationData): Promise<void> {
        console.log('⚡ Handling notification action:', actionIdentifier);

        switch (actionIdentifier) {
            case 'view_order':
                console.log('📋 Navigate to order:', data.orderId);
                break;
            case 'track_order':
                console.log('🚚 Navigate to tracking:', data.orderId);
                break;
            case 'view_deal':
                console.log('💰 Navigate to deal:', data.productId || data.dealId);
                break;
            case 'view_cart':
                console.log('🛒 Navigate to cart');
                break;
            case 'track_delivery':
                console.log('📍 Track delivery for order:', data.orderId);
                break;
            case 'contact_driver':
                console.log('📞 Contact driver for order:', data.orderId);
                break;
            default:
                // Default action (usually just opening the app)
                if (data.deepLink) {
                    console.log('🔗 Navigate to deep link:', data.deepLink);
                }
                break;
        }
    }

    // Replace the existing sendLocalNotification method in pushNotifications.ts with this fixed version:

    async sendLocalNotification(
        notification: Omit<PushNotification, 'id'>,
        trigger: NotificationTrigger | null = null
    ): Promise<string> {
        const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const notificationRequest: Notifications.NotificationRequestInput = {
            identifier: id,
            content: {
                title: notification.title,
                body: notification.body,
                data: notification.data,
                sound: notification.sound || 'default',
                // 🚀 FIX: Only include badge if it's a valid number
                ...(notification.badge !== undefined && notification.badge !== null && { badge: notification.badge }),
                categoryIdentifier: notification.category,
            },
            // 🚀 FIX: Properly handle the trigger parameter
            trigger: trigger ? this.convertTriggerToExpoTrigger(trigger) : null,
        };

        console.log(`📱 Sending ${trigger ? 'scheduled' : 'immediate'} notification:`, notification.title);

        await Notifications.scheduleNotificationAsync(notificationRequest);
        return id;
    }

// 🚀 NEW: Helper method to convert our trigger format to Expo's format
    private convertTriggerToExpoTrigger(trigger: NotificationTrigger): Notifications.NotificationTriggerInput {
        switch (trigger.type) {
            case 'date':
                return new Date(trigger.date!);

            case 'timeInterval':
                return {
                    type: 'timeInterval',
                    seconds: trigger.seconds!,
                    repeats: trigger.repeats || false,
                } as Notifications.TimeIntervalTriggerInput;

            case 'calendar':
                return {
                    type: 'calendar',
                    ...trigger.calendarTrigger!,
                    repeats: trigger.repeats || false,
                } as Notifications.CalendarTriggerInput;

            default:
                throw new Error(`Unsupported trigger type: ${trigger.type}`);
        }
    }

    // Schedule notification
    async scheduleNotification(
        notification: Omit<PushNotification, 'id'>,
        trigger: NotificationTrigger
    ): Promise<string> {
        const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        let scheduleTrigger: Notifications.NotificationTriggerInput | null = null;

        switch (trigger.type) {
            case 'date':
                scheduleTrigger = new Date(trigger.date!);
                break;
            case 'timeInterval':
                scheduleTrigger = {
                    type: 'timeInterval',
                    seconds: trigger.seconds!,
                    repeats: trigger.repeats || false,
                } as Notifications.TimeIntervalTriggerInput;
                break;
            case 'calendar':
                scheduleTrigger = {
                    type: 'calendar',
                    ...trigger.calendarTrigger!,
                    repeats: trigger.repeats || false,
                } as Notifications.CalendarTriggerInput;
                break;
        }

        if (!scheduleTrigger) {
            throw new Error('Invalid trigger type');
        }

        const notificationRequest: Notifications.NotificationRequestInput = {
            identifier: id,
            content: {
                title: notification.title,
                body: notification.body,
                data: notification.data,
                sound: notification.sound || 'default',
                badge: notification.badge,
                categoryIdentifier: notification.category,
            },
            trigger: scheduleTrigger,
        };

        console.log('⏰ Scheduling notification:', notification.title);
        await Notifications.scheduleNotificationAsync(notificationRequest);

        // Save scheduled notification
        const scheduledNotification: ScheduledNotification = {
            id,
            notification: { ...notification, id },
            trigger,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            scheduledFor: trigger.date || new Date(Date.now() + (trigger.seconds || 0) * 1000).toISOString(),
        };

        await this.saveScheduledNotification(scheduledNotification);

        return id;
    }

    // Cancel notification
    async cancelNotification(notificationId: string): Promise<void> {
        console.log('❌ Cancelling notification:', notificationId);
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.updateScheduledNotificationStatus(notificationId, 'cancelled');
    }

    // Cancel all notifications
    async cancelAllNotifications(): Promise<void> {
        console.log('🗑️ Cancelling all scheduled notifications');
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    // Get notification settings
    async getNotificationSettings(): Promise<NotificationSettings> {
        try {
            const settings = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
            return settings ? JSON.parse(settings) : getDefaultNotificationSettings();
        } catch (error) {
            console.error('❌ Error loading notification settings:', error);
            return getDefaultNotificationSettings();
        }
    }

    // Update notification settings
    async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
        try {
            const currentSettings = await this.getNotificationSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedSettings));
            console.log('💾 Notification settings updated');
        } catch (error) {
            console.error('❌ Error saving notification settings:', error);
            throw error;
        }
    }

    // Get notification history
    async getNotificationHistory(limit: number = 50): Promise<NotificationHistory[]> {
        try {
            const history = await AsyncStorage.getItem('notification_history');
            const historyArray: NotificationHistory[] = history ? JSON.parse(history) : [];
            return historyArray.slice(0, limit);
        } catch (error) {
            console.error('❌ Error loading notification history:', error);
            return [];
        }
    }

    // Mark notification as read
    async markNotificationAsRead(notificationId: string): Promise<void> {
        try {
            const history = await this.getNotificationHistory();
            const updatedHistory = history.map(item =>
                item.id === notificationId
                    ? { ...item, isRead: true, readAt: new Date().toISOString() }
                    : item
            );
            await AsyncStorage.setItem('notification_history', JSON.stringify(updatedHistory));
            console.log('👁️ Notification marked as read:', notificationId);
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
        }
    }

    // Clear notification history
    async clearNotificationHistory(): Promise<void> {
        try {
            await AsyncStorage.removeItem('notification_history');
            console.log('🗑️ Notification history cleared');
        } catch (error) {
            console.error('❌ Error clearing notification history:', error);
        }
    }

    // Get badge count
    async getBadgeCount(): Promise<number> {
        return await Notifications.getBadgeCountAsync();
    }

    // Set badge count
    async setBadgeCount(count: number): Promise<void> {
        await Notifications.setBadgeCountAsync(count);
        console.log('🔢 Badge count set to:', count);
    }

    // Private helper methods
    private async loadSettings(): Promise<void> {
        await this.getNotificationSettings();
    }

    private async storePushToken(token: string): Promise<void> {
        try {
            const tokenData: PushToken = {
                token,
                platform: Platform.OS as 'ios' | 'android',
                deviceId: await this.getDeviceId(),
                appVersion: '1.0.0', // Get from app config
                osVersion: Platform.Version.toString(),
                isActive: true,
                registeredAt: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
            };

            await AsyncStorage.setItem('push_token', JSON.stringify(tokenData));
            console.log('💾 Push token stored');
        } catch (error) {
            console.error('❌ Error storing push token:', error);
        }
    }

    private async registerTokenWithServer(token: string): Promise<void> {
        try {
            // TODO: Send token to your server/Firebase Function
            // await apiClient.post('/users/push-token', { token });
            console.log('🔗 Token registered with server:', token);
        } catch (error) {
            console.error('❌ Error registering token with server:', error);
        }
    }

    private async getDeviceId(): Promise<string> {
        try {
            let deviceId = await AsyncStorage.getItem('device_id');
            if (!deviceId) {
                deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await AsyncStorage.setItem('device_id', deviceId);
            }
            return deviceId;
        } catch (error) {
            return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    private async saveNotificationToHistory(notification: NotificationHistory): Promise<void> {
        try {
            const history = await this.getNotificationHistory();
            const updatedHistory = [notification, ...history].slice(0, 100); // Keep only last 100
            await AsyncStorage.setItem('notification_history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('❌ Error saving notification to history:', error);
        }
    }

    private async saveScheduledNotification(notification: ScheduledNotification): Promise<void> {
        try {
            const scheduled = await AsyncStorage.getItem('scheduled_notifications');
            const scheduledArray: ScheduledNotification[] = scheduled ? JSON.parse(scheduled) : [];
            scheduledArray.push(notification);
            await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(scheduledArray));
        } catch (error) {
            console.error('❌ Error saving scheduled notification:', error);
        }
    }

    private async updateScheduledNotificationStatus(
        notificationId: string,
        status: ScheduledNotification['status']
    ): Promise<void> {
        try {
            const scheduled = await AsyncStorage.getItem('scheduled_notifications');
            const scheduledArray: ScheduledNotification[] = scheduled ? JSON.parse(scheduled) : [];
            const updatedArray = scheduledArray.map(item =>
                item.id === notificationId
                    ? { ...item, status, cancelledAt: new Date().toISOString() }
                    : item
            );
            await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(updatedArray));
        } catch (error) {
            console.error('❌ Error updating scheduled notification status:', error);
        }
    }

    private async trackNotificationReceived(notification: NotificationHistory): Promise<void> {
        try {
            console.log('📊 Tracking notification received:', notification.id);
        } catch (error) {
            console.error('❌ Error tracking notification received:', error);
        }
    }

    private async trackNotificationClicked(notificationId: string, action: string): Promise<void> {
        try {
            console.log('📊 Tracking notification clicked:', notificationId, action);
        } catch (error) {
            console.error('❌ Error tracking notification clicked:', error);
        }
    }

    // Public listener methods
    addNotificationListener(listener: (notification: NotificationHistory) => void): () => void {
        this.notificationListeners.push(listener);
        return () => {
            const index = this.notificationListeners.indexOf(listener);
            if (index > -1) {
                this.notificationListeners.splice(index, 1);
            }
        };
    }

    // Get current push token
    getCurrentPushToken(): string | null {
        return this.pushToken;
    }

    // 🆕 Get scheduled notifications
    async getScheduledNotifications(): Promise<ScheduledNotification[]> {
        try {
            const scheduled = await AsyncStorage.getItem('scheduled_notifications');
            return scheduled ? JSON.parse(scheduled) : [];
        } catch (error) {
            console.error('❌ Error loading scheduled notifications:', error);
            return [];
        }
    }

    // 🆕 Send notification to Firebase Function
    async sendRemoteNotification(
        token: string,
        notification: Omit<PushNotification, 'id'>
    ): Promise<void> {
        try {
            // Call your Firebase Function
            console.log('📤 Sending remote notification via Firebase Function');

            // TODO: Replace with actual Firebase Function call
            // const functions = getFunctions();
            // const sendNotification = httpsCallable(functions, 'sendPushNotification');
            // await sendNotification({
            //     token,
            //     title: notification.title,
            //     body: notification.body,
            //     data: notification.data
            // });

        } catch (error) {
            console.error('❌ Error sending remote notification:', error);
            throw error;
        }
    }
}

// Helper functions
function isQuietHours(quietHours: QuietHoursSettings): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });

    if (!quietHours.days.includes(currentDay)) return false;

    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
        return currentTime >= startTime && currentTime <= endTime;
    } else {
        // Quiet hours span midnight
        return currentTime >= startTime || currentTime <= endTime;
    }
}

function isCriticalNotification(notification: Notifications.Notification): boolean {
    const data = notification.request.content.data as NotificationData;
    return data?.type === 'security_alert' || data?.type === 'system_alert';
}

async function getNotificationSettings(): Promise<NotificationSettings> {
    return PushNotificationService.getInstance().getNotificationSettings();
}

function getDefaultNotificationSettings(): NotificationSettings {
    return {
        enabled: true,
        categories: {
            orders: {
                enabled: true,
                sound: true,
                vibration: true,
                showPreviews: true,
                badge: true,
                lockScreen: true,
                banners: true,
                criticalAlerts: false,
            },
            shopping: {
                enabled: true,
                sound: true,
                vibration: true,
                showPreviews: true,
                badge: true,
                lockScreen: true,
                banners: true,
                criticalAlerts: false,
            },
            deals: {
                enabled: true,
                sound: false,
                vibration: false,
                showPreviews: true,
                badge: true,
                lockScreen: true,
                banners: true,
                criticalAlerts: false,
            },
            services: {
                enabled: true,
                sound: true,
                vibration: true,
                showPreviews: true,
                badge: true,
                lockScreen: true,
                banners: true,
                criticalAlerts: false,
            },
            social: {
                enabled: false,
                sound: false,
                vibration: false,
                showPreviews: false,
                badge: false,
                lockScreen: false,
                banners: false,
                criticalAlerts: false,
            },
            system: {
                enabled: true,
                sound: true,
                vibration: true,
                showPreviews: true,
                badge: true,
                lockScreen: true,
                banners: true,
                criticalAlerts: true,
            },
            security: {
                enabled: true,
                sound: true,
                vibration: true,
                showPreviews: true,
                badge: true,
                lockScreen: true,
                banners: true,
                criticalAlerts: true,
            },
            marketing: {
                enabled: false,
                sound: false,
                vibration: false,
                showPreviews: true,
                badge: false,
                lockScreen: false,
                banners: false,
                criticalAlerts: false,
            },
            delivery: {
                enabled: true,
                sound: true,
                vibration: true,
                showPreviews: true,
                badge: true,
                lockScreen: true,
                banners: true,
                criticalAlerts: false,
            },
        },
        quietHours: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00',
            days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            allowCritical: true,
            allowFromContacts: false,
        },
        soundSettings: {
            defaultSound: 'default',
            customSounds: {
                orders: 'order_notification.wav',
                shopping: 'default',
                deals: 'deal_alert.wav',
                services: 'default',
                social: 'default',
                system: 'default',
                security: 'security_alert.wav',
                marketing: 'default',
                delivery: 'delivery_notification.wav',
            },
            volume: 0.8,
            vibrationPattern: 'default',
        },
        displaySettings: {
            showOnLockScreen: true,
            showInNotificationCenter: true,
            showAsBanners: true,
            showPreviews: 'always',
            grouping: 'by_app',
            badgeAppIcon: true,
        },
        locationBased: {
            enabled: true,
            storeNotifications: true,
            dealNotifications: true,
            pickupReminders: true,
            radius: 5,
            preferredStores: [],
        },
    };
}

// Export singleton instance
export const pushNotifications = PushNotificationService.getInstance();

export default pushNotifications;