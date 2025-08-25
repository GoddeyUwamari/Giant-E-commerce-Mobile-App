import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
    StatusBar,
    Platform,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router'; // Add this import

interface ContactMethod {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
    availability?: string;
    isAvailable?: boolean;
}

interface SupportCategory {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    methods: string[];
}

const ContactScreen: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('general');

    const handlePhoneCall = (phoneNumber: string) => {
        Alert.alert(
            'Call Walmart Support',
            `Would you like to call ${phoneNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => Linking.openURL(`tel:${phoneNumber}`)
                },
            ]
        );
    };

    const handleEmail = (subject: string) => {
        const emailUrl = `mailto:support@walmart.com?subject=${encodeURIComponent(subject)}`;
        Linking.openURL(emailUrl);
    };

    const handleChat = () => {
        // Navigate to chat screen
        router.push('/support/chat');
    };

    const handleSocialMedia = (platform: string, url: string) => {
        Linking.openURL(url);
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'Download the Walmart app for the best shopping experience!',
                url: 'https://www.walmart.com/mobile',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const supportCategories: SupportCategory[] = [
        {
            id: 'general',
            title: 'General Support',
            description: 'Account help, app issues, general questions',
            icon: 'help-circle-outline',
            color: '#0071ce',
            methods: ['phone', 'chat', 'email'],
        },
        {
            id: 'orders',
            title: 'Orders & Delivery',
            description: 'Order status, delivery, pickup, returns',
            icon: 'cube-outline',
            color: '#f57c00',
            methods: ['phone', 'chat', 'email'],
        },
        {
            id: 'payment',
            title: 'Payment & Billing',
            description: 'Payment methods, billing issues, refunds',
            icon: 'card-outline',
            color: '#388e3c',
            methods: ['phone', 'email'],
        },
        {
            id: 'technical',
            title: 'Technical Issues',
            description: 'App crashes, login problems, bugs',
            icon: 'construct-outline',
            color: '#7b1fa2',
            methods: ['chat', 'email'],
        },
    ];

    const contactMethods: ContactMethod[] = [
        {
            id: 'phone',
            title: 'Call Us',
            subtitle: '1-800-WALMART (1-800-925-6278)',
            icon: 'call-outline',
            availability: 'Available 24/7',
            isAvailable: true,
            action: () => handlePhoneCall('18009256278'),
        },
        {
            id: 'chat',
            title: 'Live Chat',
            subtitle: 'Chat with our support team',
            icon: 'chatbubble-outline',
            availability: 'Available 6 AM - 12 AM EST',
            isAvailable: true,
            action: handleChat,
        },
        {
            id: 'email',
            title: 'Email Support',
            subtitle: 'Send us an email',
            icon: 'mail-outline',
            availability: 'Response within 24 hours',
            isAvailable: true,
            action: () => handleEmail('Mobile App Support'),
        },
        {
            id: 'store',
            title: 'Visit Store',
            subtitle: 'Find a Walmart near you',
            icon: 'storefront-outline',
            availability: 'Store hours vary',
            isAvailable: true,
            action: () => Linking.openURL('https://www.walmart.com/store/finder'),
        },
    ];

    const socialMediaLinks = [
        {
            platform: 'Facebook',
            icon: 'logo-facebook' as keyof typeof Ionicons.glyphMap,
            url: 'https://www.facebook.com/walmart',
            color: '#1877F2',
        },
        {
            platform: 'Twitter',
            icon: 'logo-twitter' as keyof typeof Ionicons.glyphMap,
            url: 'https://twitter.com/walmart',
            color: '#1DA1F2',
        },
        {
            platform: 'Instagram',
            icon: 'logo-instagram' as keyof typeof Ionicons.glyphMap,
            url: 'https://www.instagram.com/walmart',
            color: '#E4405F',
        },
        {
            platform: 'YouTube',
            icon: 'logo-youtube' as keyof typeof Ionicons.glyphMap,
            url: 'https://www.youtube.com/walmart',
            color: '#FF0000',
        },
    ];

    // Updated quickActions with proper navigation
    const quickActions = [
        {
            title: 'Track Order',
            icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
            action: () => {
                router.push('/orders');
            },
        },
        {
            title: 'Return Item',
            icon: 'return-up-back-outline' as keyof typeof Ionicons.glyphMap,
            action: () => {
                router.push('/orders');
            },
        },
        {
            title: 'FAQ',
            icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
            action: () => {
                router.push('/support/help');
            },
        },
        {
            title: 'Store Hours',
            icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
            action: () => {
                // For now, open external store finder until you create the route
                Linking.openURL('https://www.walmart.com/store/finder');
                // Alternative when you create the route: router.push('/store/locator');
            },
        },
    ];

    const currentCategory = supportCategories.find(cat => cat.id === selectedCategory);
    const availableMethods = contactMethods.filter(method =>
        currentCategory?.methods.includes(method.id)
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor="#0071ce" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Support</Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
                    <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Hero Section */}
            <View style={styles.heroSection}>
                <View style={styles.heroContent}>
                    <Ionicons name="headset-outline" size={48} color="#0071ce" />
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>
                        We're here to help you 24/7. Choose the best way to reach us.
                    </Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.title}
                            style={styles.quickActionButton}
                            onPress={action.action}
                        >
                            <View style={styles.quickActionIcon}>
                                <Ionicons name={action.icon} size={24} color="#0071ce" />
                            </View>
                            <Text style={styles.quickActionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Support Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>What do you need help with?</Text>
                <View style={styles.categoriesContainer}>
                    {supportCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryCard,
                                selectedCategory === category.id && styles.categoryCardSelected,
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                                <Ionicons name={category.icon} size={24} color="white" />
                            </View>
                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryTitle}>{category.title}</Text>
                                <Text style={styles.categoryDescription}>{category.description}</Text>
                            </View>
                            {selectedCategory === category.id && (
                                <Ionicons name="checkmark-circle" size={24} color="#0071ce" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Contact Methods */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Methods</Text>
                <View style={styles.contactMethodsContainer}>
                    {availableMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={styles.contactMethodCard}
                            onPress={method.action}
                        >
                            <View style={styles.contactMethodIcon}>
                                <Ionicons name={method.icon} size={28} color="#0071ce" />
                            </View>
                            <View style={styles.contactMethodContent}>
                                <Text style={styles.contactMethodTitle}>{method.title}</Text>
                                <Text style={styles.contactMethodSubtitle}>{method.subtitle}</Text>
                                {method.availability && (
                                    <View style={styles.availabilityContainer}>
                                        <View style={[
                                            styles.availabilityDot,
                                            { backgroundColor: method.isAvailable ? '#4CAF50' : '#FF9800' }
                                        ]} />
                                        <Text style={styles.availabilityText}>{method.availability}</Text>
                                    </View>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.section}>
                <View style={styles.emergencyCard}>
                    <View style={styles.emergencyHeader}>
                        <Ionicons name="warning-outline" size={24} color="#FF5722" />
                        <Text style={styles.emergencyTitle}>Emergency Support</Text>
                    </View>
                    <Text style={styles.emergencyText}>
                        For urgent issues with orders, payments, or account security, call us immediately.
                    </Text>
                    <TouchableOpacity
                        style={styles.emergencyButton}
                        onPress={() => handlePhoneCall('18009256278')}
                    >
                        <Ionicons name="call" size={20} color="white" />
                        <Text style={styles.emergencyButtonText}>Call Now</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Social Media */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Follow Us</Text>
                <View style={styles.socialMediaContainer}>
                    {socialMediaLinks.map((social) => (
                        <TouchableOpacity
                            key={social.platform}
                            style={[styles.socialButton, { backgroundColor: social.color }]}
                            onPress={() => handleSocialMedia(social.platform, social.url)}
                        >
                            <Ionicons name={social.icon} size={24} color="white" />
                            <Text style={styles.socialButtonText}>{social.platform}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* App Info */}
            <View style={styles.section}>
                <View style={styles.appInfoCard}>
                    <Text style={styles.appInfoTitle}>App Information</Text>
                    <View style={styles.appInfoRow}>
                        <Text style={styles.appInfoLabel}>Version:</Text>
                        <Text style={styles.appInfoValue}>3.2.1</Text>
                    </View>
                    <View style={styles.appInfoRow}>
                        <Text style={styles.appInfoLabel}>Last Updated:</Text>
                        <Text style={styles.appInfoValue}>July 15, 2025</Text>
                    </View>
                    <View style={styles.appInfoRow}>
                        <Text style={styles.appInfoLabel}>Support ID:</Text>
                        <Text style={styles.appInfoValue}>WM-7852-3491</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Walmart Customer Service is available 24/7 to help you with any questions or concerns.
                </Text>
                <Text style={styles.footerCopyright}>
                    © 2025 Walmart Inc. All rights reserved.
                </Text>
            </View>
        </ScrollView>
    );
};

export default ContactScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#0071ce',
        paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    shareButton: {
        padding: 4,
    },
    heroSection: {
        backgroundColor: 'white',
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    heroContent: {
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    categoriesContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryCardSelected: {
        backgroundColor: '#f0f8ff',
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryContent: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    contactMethodsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    contactMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    contactMethodIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactMethodContent: {
        flex: 1,
    },
    contactMethodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    contactMethodSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    availabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availabilityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    availabilityText: {
        fontSize: 12,
        color: '#999',
    },
    emergencyCard: {
        backgroundColor: '#fff3e0',
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#FF5722',
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    emergencyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF5722',
        marginLeft: 8,
    },
    emergencyText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    emergencyButton: {
        backgroundColor: '#FF5722',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    emergencyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    socialMediaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    socialButton: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
        justifyContent: 'center',
    },
    socialButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    appInfoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    appInfoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    appInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    appInfoLabel: {
        fontSize: 14,
        color: '#666',
    },
    appInfoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    footer: {
        backgroundColor: 'white',
        margin: 16,
        marginTop: 0,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 12,
    },
    footerCopyright: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});