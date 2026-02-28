import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set how notifications should act when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'web') {
        console.log("Push notifications are mocked on web.");
        return "web-mock-token-123";
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#00F5FF',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            // In a real app we would pass projectId here from expo config
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log("Push Token Generated:", token);
        } catch (e) {
            console.warn("Could not generate push token:", e);
        }

    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}

export async function sendPushNotification(expoPushToken, title, body, data = {}) {
    if (Platform.OS === 'web') {
        console.log(`[Web Push Mock] Sending push to ${expoPushToken}: ${title} - ${body}`);
        return;
    }

    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title || 'Ny Notis!',
        body: body || 'Klicka här för att öppna.',
        data: data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}
