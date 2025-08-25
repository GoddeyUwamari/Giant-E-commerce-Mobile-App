import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { StripeProvider } from '../contexts/StripeContext'; // Add this import

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// Walmart brand colors
const WALMART_COLORS = {
    primary: '#004C98',
    secondary: '#FFC220',
    background: '#F7F8FA',
    white: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
};

// Common header style for Walmart branding
const getHeaderStyle = (options?: {
    backgroundColor?: string;
    showBackButton?: boolean;
    title?: string;
}) => ({
    headerStyle: {
        backgroundColor: options?.backgroundColor || WALMART_COLORS.primary,
        elevation: 4, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTintColor: WALMART_COLORS.white,
    headerTitleStyle: {
        fontWeight: 'bold' as const,
        fontSize: 18,
    },
    headerBackTitleVisible: false,
    headerTitleAlign: 'center' as const,
    ...(options?.title && { title: options.title }),
});

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <StripeProvider>
                        <Stack
                            screenOptions={{
                                ...getHeaderStyle(),
                                headerShown: true,
                                animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade',
                                animationDuration: 200,
                            }}
                        >
                            {/* Main Tab Navigation */}
                            <Stack.Screen
                                name="(tabs)"
                                options={{
                                    headerShown: false
                                }}
                            />

                            {/* Authentication Screens */}
                            <Stack.Screen
                                name="(auth)"
                                options={{
                                    headerShown: false
                                }}
                            />

                            {/* Modal Screens */}
                            <Stack.Screen
                                name="(modals)"
                                options={{
                                    presentation: 'modal',
                                    headerShown: false,
                                    animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'fade_from_bottom',
                                    animationDuration: 300,
                                }}
                            />

                            {/* Category Screens */}
                            <Stack.Screen
                                name="category/[slug]"
                                options={{
                                    ...getHeaderStyle({ title: 'Shop by Category' }),
                                    headerSearchBarOptions: Platform.OS === 'ios' ? {
                                        placeholder: 'Search in category...',
                                    } : undefined,
                                }}
                            />

                            {/* Product Details */}
                            <Stack.Screen
                                name="product/[id]"
                                options={{
                                    headerShown: false, // Product page has custom header
                                    animation: 'slide_from_right',
                                }}
                            />

                            {/* Checkout Flow */}
                            <Stack.Screen
                                name="checkout/index"
                                options={{
                                    ...getHeaderStyle({
                                        title: 'Review Order',
                                        backgroundColor: WALMART_COLORS.primary
                                    }),
                                    headerBackTitleVisible: false,
                                    gestureEnabled: false, // Prevent swipe back during checkout
                                }}
                            />

                            <Stack.Screen
                                name="checkout/payment"
                                options={{
                                    ...getHeaderStyle({
                                        title: 'Payment Method',
                                        backgroundColor: WALMART_COLORS.primary
                                    }),
                                    headerBackTitleVisible: false,
                                    gestureEnabled: false, // Prevent swipe back during payment
                                }}
                            />

                            <Stack.Screen
                                name="category/index"
                                options={{
                                    ...getHeaderStyle({ title: 'Categories' }),
                                }}
                            />

                            <Stack.Screen
                                name="product/index"
                                options={{
                                    ...getHeaderStyle({ title: 'Products' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/personal"
                                options={{
                                    ...getHeaderStyle({ title: 'Personal Information' }),
                                }}
                            />

                            <Stack.Screen
                                name="checkout/confirmation"
                                options={{
                                    ...getHeaderStyle({
                                        title: 'Order Confirmed',
                                        backgroundColor: '#10B981' // Success green
                                    }),
                                    headerLeft: undefined, // Remove back button on confirmation
                                    gestureEnabled: false,
                                }}
                            />

                            {/* Orders */}
                            <Stack.Screen
                                name="orders/index"
                                options={{
                                    ...getHeaderStyle({ title: 'Your Orders' }),
                                }}
                            />

                            <Stack.Screen
                                name="orders/[orderId]"
                                options={{
                                    headerShown: false, // Order details has custom header
                                }}
                            />

                            {/* Store Locator */}
                            <Stack.Screen
                                name="store/locator"
                                options={{
                                    ...getHeaderStyle({ title: 'Find a Store' }),
                                }}
                            />

                            <Stack.Screen
                                name="store/[storeId]"
                                options={{
                                    ...getHeaderStyle({ title: 'Store Details' }),
                                }}
                            />

                            {/* Profile & Account */}
                            <Stack.Screen
                                name="profile/account"
                                options={{
                                    ...getHeaderStyle({ title: 'Account Settings' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/addresses"
                                options={{
                                    ...getHeaderStyle({ title: 'Saved Addresses' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/payment-methods"
                                options={{
                                    ...getHeaderStyle({ title: 'Payment Methods' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/favorites"
                                options={{
                                    ...getHeaderStyle({ title: 'My Favorites' }),
                                }}
                            />

                            {/* Support & Help */}
                            <Stack.Screen
                                name="support/help"
                                options={{
                                    ...getHeaderStyle({ title: 'Help & Support' }),
                                }}
                            />

                            <Stack.Screen
                                name="support/contact"
                                options={{
                                    ...getHeaderStyle({ title: 'Contact Us' }),
                                }}
                            />

                            <Stack.Screen
                                name="support/chat"
                                options={{
                                    ...getHeaderStyle({ title: 'Live Chat' }),
                                    presentation: 'modal',
                                }}
                            />

                            {/* Legal & Info */}
                            <Stack.Screen
                                name="legal/privacy"
                                options={{
                                    ...getHeaderStyle({ title: 'Privacy Policy' }),
                                }}
                            />

                            <Stack.Screen
                                name="legal/terms"
                                options={{
                                    ...getHeaderStyle({ title: 'Terms of Service' }),
                                }}
                            />

                            {/* 404 Not Found */}
                            <Stack.Screen
                                name="+not-found"
                                options={{
                                    ...getHeaderStyle({
                                        title: 'Page Not Found',
                                        backgroundColor: '#EF4444' // Error red
                                    }),
                                }}
                            />

                            {/* Profile & Account - ADD THESE */}
                            <Stack.Screen
                                name="profile/edit"
                                options={{
                                    ...getHeaderStyle({ title: 'Edit Profile' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/walmart-plus"
                                options={{
                                    ...getHeaderStyle({ title: 'Walmart+ Membership' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/shopping-lists"
                                options={{
                                    ...getHeaderStyle({ title: 'Shopping Lists' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/recently-viewed"
                                options={{
                                    ...getHeaderStyle({ title: 'Recently Viewed' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/recommendations"
                                options={{
                                    ...getHeaderStyle({ title: 'Recommendations' }),
                                }}
                            />

                            <Stack.Screen
                                name="profile/rewards"
                                options={{
                                    ...getHeaderStyle({ title: 'Rewards' }),
                                }}
                            />

                            {/* Orders - ADD THESE */}
                            <Stack.Screen
                                name="orders/history"
                                options={{
                                    ...getHeaderStyle({ title: 'Purchase History' }),
                                }}
                            />

                            <Stack.Screen
                                name="orders/returns"
                                options={{
                                    ...getHeaderStyle({ title: 'Returns & Refunds' }),
                                }}
                            />
                        </Stack>

                        {/* Status Bar Configuration */}
                        <StatusBar
                            style={Platform.OS === 'ios' ? 'light' : 'auto'}
                            backgroundColor={WALMART_COLORS.primary}
                            translucent={false}
                        />
                    </StripeProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}