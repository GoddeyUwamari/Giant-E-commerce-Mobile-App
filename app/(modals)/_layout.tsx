import React from 'react';
import { Stack } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Walmart brand colors
const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    darkGray: '#424242',
    modalBackground: 'rgba(0, 0, 0, 0.5)',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalContentStyle: {
        backgroundColor: COLORS.white,
    },
    fullScreenModalStyle: {
        backgroundColor: COLORS.lightGray,
    },
});

export default function ModalsLayout(): JSX.Element {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <Stack
                    screenOptions={{
                        presentation: 'modal',
                        headerShown: false,
                        gestureEnabled: true,
                        gestureDirection: 'vertical',
                        animationDuration: 350,
                        contentStyle: styles.modalContentStyle,
                        ...(Platform.OS === 'ios' && {
                            gestureResponseDistance: {
                                vertical: 150,
                            },
                        }),
                        ...(Platform.OS === 'android' && {
                            animationTypeForReplace: 'push',
                            animation: 'slide_from_bottom',
                        }),
                    }}
                >
                    <Stack.Screen
                        name="cart"
                        options={{
                            title: 'My Cart',
                            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
                            gestureEnabled: true,
                            gestureDirection: Platform.OS === 'ios' ? 'vertical' : 'horizontal',
                            contentStyle: styles.modalContentStyle,
                            animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_right',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="filter"
                        options={{
                            title: 'Filter & Sort',
                            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
                            gestureEnabled: true,
                            gestureDirection: Platform.OS === 'ios' ? 'vertical' : 'horizontal',
                            contentStyle: styles.modalContentStyle,
                            animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_right',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="store-finder"
                        options={{
                            title: 'Store Locator',
                            presentation: Platform.OS === 'ios' ? 'fullScreenModal' : 'card',
                            gestureEnabled: true,
                            gestureDirection: Platform.OS === 'ios' ? 'vertical' : 'horizontal',
                            contentStyle: Platform.OS === 'ios' ? styles.fullScreenModalStyle : styles.modalContentStyle,
                            animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_right',
                            headerShown: false,
                            ...(Platform.OS === 'ios' && {
                                gestureResponseDistance: {
                                    vertical: 200,
                                },
                            }),
                        }}
                    />
                </Stack>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}