import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Send push notification via Firebase Cloud Messaging
export const sendPushNotification = functions.https.onCall(async (data, context) => {
    const { token, title, body, data: notificationData } = data;

    const message = {
        token,
        notification: { title, body },
        data: notificationData,
        android: {
            priority: 'high' as const,
        },
        apns: {
            payload: {
                aps: {
                    sound: 'default',
                },
            },
        },
    };

    try {
        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('Error sending notification:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
});