// firebase/messaging.ts
// import messaging from '@react-native-firebase/messaging';
// import { Platform, PermissionsAndroid } from 'react-native';

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'ios') {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            return enabled;
        } else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
    } catch (error) {
        console.error('Notification permission error:', error);
        return false;
    }
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
    try {
        const token = await messaging().getToken();
        return token;
    } catch (error) {
        console.error('Get FCM token error:', error);
        return null;
    }
};

// Listen to token refresh
export const onTokenRefresh = (callback: (token: string) => void) => {
    return messaging().onTokenRefresh(callback);
};

// Handle foreground messages
export const onMessageReceived = (callback: (message: any) => void) => {
    return messaging().onMessage(callback);
};

// Handle background messages
export const setBackgroundMessageHandler = () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
    });
};

// Subscribe to topic
export const subscribeToTopic = async (topic: string) => {
    try {
        await messaging().subscribeToTopic(topic);
    } catch (error) {
        console.error('Subscribe to topic error:', error);
    }
};

// Unsubscribe from topic
export const unsubscribeFromTopic = async (topic: string) => {
    try {
        await messaging().unsubscribeFromTopic(topic);
    } catch (error) {
        console.error('Unsubscribe from topic error:', error);
    }
};