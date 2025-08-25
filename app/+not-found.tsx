import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to get help?',
            [
                {
                    text: 'Call',
                    onPress: () => Linking.openURL('tel:+18001234567')
                },
                {
                    text: 'Email',
                    onPress: () => Linking.openURL('mailto:support@walmart.com?subject=Page Not Found - Need Help')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const handleQuickLink = (path: string, fallbackMessage?: string) => {
        try {
            router.push(path as any);
        } catch (error) {
            console.log(`Navigation to ${path} failed:`, error);
            if (fallbackMessage) {
                Alert.alert('Coming Soon', fallbackMessage);
            } else {
                Alert.alert('Navigation Error', `The ${path.replace('/', '')} section is not available yet.`);
            }
        }
    };

    const quickLinks = [
        {
            id: 'search',
            icon: 'search',
            text: 'Search',
            path: '/(tabs)/search',
            fallback: 'Search functionality coming soon!'
        },
        {
            id: 'categories',
            icon: 'grid',
            text: 'Categories',
            path: '/(tabs)/categories',
            fallback: 'Categories section coming soon!'
        },
        {
            id: 'deals',
            icon: 'pricetag',
            text: 'Deals',
            path: '/deals',
            fallback: 'Deals section coming soon!'
        },
        {
            id: 'stores',
            icon: 'storefront',
            text: 'Stores',
            path: '/stores',
            fallback: 'Store locator coming soon!'
        }
    ];

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Page Not Found",
                    headerStyle: {
                        backgroundColor: '#004C98',
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ marginLeft: 16 }}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Walmart Logo Area */}
                <View style={styles.logoContainer}>
                    <View style={styles.walmartSpark}>
                        <Ionicons name="star" size={40} color="#FFC220" />
                    </View>
                </View>

                {/* Error Icon */}
                <View style={styles.errorIcon}>
                    <Ionicons name="alert-circle-outline" size={80} color="#6B7280" />
                </View>

                {/* Error Content */}
                <View style={styles.errorContent}>
                    <Text style={styles.errorCode}>404</Text>
                    <Text style={styles.errorTitle}>
                        Oops! Page not found
                    </Text>
                    <Text style={styles.errorMessage}>
                        The page you're looking for doesn't exist or has been moved.
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => {
                            try {
                                router.push('/(tabs)');
                            } catch (error) {
                                console.log('Home navigation failed, trying fallback');
                                router.replace('/');
                            }
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="home" size={20} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>
                            Go to Home
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => {
                            try {
                                router.back();
                            } catch (error) {
                                console.log('Back navigation failed, going to home');
                                router.replace('/(tabs)');
                            }
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={20} color="#004C98" />
                        <Text style={styles.secondaryButtonText}>
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <Text style={styles.helpText}>
                        Need help? Contact our support team
                    </Text>
                    <TouchableOpacity
                        style={styles.helpButton}
                        onPress={handleContactSupport}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chatbubble-ellipses" size={16} color="#004C98" />
                        <Text style={styles.helpButtonText}>Get Help</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Links */}
                <View style={styles.quickLinks}>
                    <Text style={styles.quickLinksTitle}>Popular Sections</Text>
                    <View style={styles.quickLinksGrid}>
                        {quickLinks.map((link) => (
                            <TouchableOpacity
                                key={link.id}
                                style={styles.quickLinkItem}
                                onPress={() => handleQuickLink(link.path, link.fallback)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={link.icon as any} size={24} color="#004C98" />
                                <Text style={styles.quickLinkText}>{link.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Additional Help Info */}
                <View style={styles.additionalInfo}>
                    <Text style={styles.additionalInfoText}>
                        If you continue to experience issues, please contact our support team.
                    </Text>
                    <View style={styles.contactMethods}>
                        <TouchableOpacity
                            style={styles.contactMethod}
                            onPress={() => Linking.openURL('tel:+18001234567')}
                        >
                            <Ionicons name="call" size={16} color="#004C98" />
                            <Text style={styles.contactMethodText}>Call: 1-800-123-4567</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contactMethod}
                            onPress={() => Linking.openURL('mailto:support@walmart.com')}
                        >
                            <Ionicons name="mail" size={16} color="#004C98" />
                            <Text style={styles.contactMethodText}>Email Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        minHeight: '100%',
    },
    logoContainer: {
        marginBottom: 32,
    },
    walmartSpark: {
        width: 80,
        height: 80,
        backgroundColor: '#004C98',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    errorIcon: {
        marginBottom: 24,
        opacity: 0.8,
    },
    errorContent: {
        alignItems: 'center',
        marginBottom: 40,
    },
    errorCode: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#004C98',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    errorMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
    },
    actionButtons: {
        width: '100%',
        marginBottom: 32,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#004C98',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#004C98',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    secondaryButtonText: {
        color: '#004C98',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    helpSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    helpText: {
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    helpButtonText: {
        color: '#004C98',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    quickLinks: {
        width: '100%',
        maxWidth: 320,
        marginBottom: 32,
    },
    quickLinksTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    quickLinksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickLinkItem: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quickLinkText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
    },
    additionalInfo: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        width: '100%',
        maxWidth: 320,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    additionalInfoText: {
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    contactMethods: {
        gap: 12,
    },
    contactMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactMethodText: {
        color: '#004C98',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    bottomSpacing: {
        height: 40,
    },
});