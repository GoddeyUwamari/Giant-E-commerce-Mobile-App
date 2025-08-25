import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Walmart brand colors
const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    textPrimary: '#212121',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentStyle: {
        backgroundColor: COLORS.white,
    },
    modalContentStyle: {
        backgroundColor: COLORS.lightGray,
    },
});

export default function AuthLayout(): JSX.Element {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <StatusBar
                    style="dark"
                    backgroundColor={COLORS.white}
                    translucent={false}
                />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: styles.contentStyle,
                        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_bottom',
                        gestureEnabled: true,
                        gestureDirection: 'horizontal',
                        animationDuration: 300,
                    }}
                >
                    <Stack.Screen
                        name="login"
                        options={{
                            title: 'Sign In to Walmart',
                            headerShown: false,
                            gestureEnabled: false, // Prevent swipe back on login
                            animation: 'fade',
                        }}
                    />
                    <Stack.Screen
                        name="register"
                        options={{
                            title: 'Create Walmart Account',
                            headerShown: false,
                            gestureEnabled: true,
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="forgot-password"
                        options={{
                            title: 'Reset Your Password',
                            headerShown: false,
                            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
                            gestureEnabled: true,
                            animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_right',
                            contentStyle: Platform.OS === 'ios' ? styles.modalContentStyle : styles.contentStyle,
                        }}
                    />
                </Stack>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}