import { useEffect, useState } from 'react';
import { pushNotifications } from '../services/notifications/pushNotifications';
import type { NotificationHistory, NotificationSettings } from '../services/notifications/pushNotifications';

export const useNotifications = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [history, setHistory] = useState<NotificationHistory[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        initializeNotifications();
    }, []);

    const initializeNotifications = async () => {
        try {
            await pushNotifications.initialize();
            const notificationSettings = await pushNotifications.getNotificationSettings();
            const notificationHistory = await pushNotifications.getNotificationHistory();

            setSettings(notificationSettings);
            setHistory(notificationHistory);
            setUnreadCount(notificationHistory.filter(n => !n.isRead).length);
            setIsInitialized(true);
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
        }
    };

    return {
        isInitialized,
        settings,
        history,
        unreadCount,
        updateSettings: pushNotifications.updateNotificationSettings.bind(pushNotifications),
        sendLocal: pushNotifications.sendLocalNotification.bind(pushNotifications),
        schedule: pushNotifications.scheduleNotification.bind(pushNotifications),
        markAsRead: pushNotifications.markNotificationAsRead.bind(pushNotifications),
    };
};