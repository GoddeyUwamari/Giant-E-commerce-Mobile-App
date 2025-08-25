import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Walmart brand colors
const COLORS = {
    walmartBlue: '#0071CE',
    walmartYellow: '#FFC220',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    badgeRed: '#FF4444',
};

const styles = StyleSheet.create({
    blurBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
});

export default function TabsLayout(): JSX.Element {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.walmartBlue,
                tabBarInactiveTintColor: COLORS.mediumGray,
                tabBarStyle: {
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: '#E0E0E0',
                    elevation: Platform.OS === 'android' ? 8 : 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: Platform.OS === 'ios' ? 88 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
                    paddingTop: 8,
                    paddingHorizontal: 8,
                },
                tabBarBackground: Platform.OS === 'ios' ? () => (
                    <BlurView
                        intensity={100}
                        style={styles.blurBackground}
                    />
                ) : undefined,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                    letterSpacing: 0.3,
                },
                tabBarIconStyle: {
                    marginTop: 2,
                },
                tabBarBadgeStyle: {
                    backgroundColor: COLORS.badgeRed,
                    color: COLORS.white,
                    fontSize: 10,
                    fontWeight: 'bold',
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    marginTop: -4,
                    marginLeft: 8,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Shop',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'storefront' : 'storefront-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                    tabBarBadge: undefined,
                }}
            />

            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'search' : 'search-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="services"
                options={{
                    title: 'Services',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'apps' : 'apps-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                    tabBarBadge: 'New',
                }}
            />

            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'person-circle' : 'person-circle-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
};