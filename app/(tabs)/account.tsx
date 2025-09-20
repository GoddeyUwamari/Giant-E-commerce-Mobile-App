import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Switch,
    RefreshControl,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { permissionService } from '../../services/api/permissionService';
import { PermissionCategory } from '../../utils/permissions';
import asyncStorage, { STORAGE_KEYS } from '../../services/storage/asyncStorage';

// Walmart brand colors
const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    walmartYellow: '#FFC220',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    purple: '#7B1FA2',
    lightBlue: '#E3F2FD',
    borderColor: '#E0E0E0',
    ai: '#FF6B6B',
    eco: '#4ECDC4',
};

export default function AccountScreen() {
    const [userData, setUserData] = useState({
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        memberSince: 'Member since 2020',
        profileImage: 'https://via.placeholder.com/80x80/0071CE/ffffff?text=JD',
        walmartPlusMember: true,
        rewardsBalance: 245.50,
        savedItems: 12,
        recentOrders: 8,
        carbonFootprint: 15.2,
        monthlySpending: 432.18,
        aiRecommendations: 24,
        scannedItems: 156,
    });

    const [refreshing, setRefreshing] = useState(false);
    const [settings, setSettings] = useState({
        pushNotifications: true,
        emailNotifications: false,
        locationServices: true,
        biometricLogin: true,
        aiAssistant: true,
        voiceCommands: false,
        smartRecommendations: true,
        carbonTracking: true,
        familySharing: false,
        autoReorder: false,
        dealAlerts: true,
        priceTracking: true,
    });
    const [permissionStatus, setPermissionStatus] = useState({})

    useEffect(() => {
        checkPermissions();
        checkBiometricSupport();
        loadProfile();
    }, []);

    const checkPermissions = async () => {
        try {
            const permissions = await permissionService.checkAllPermissions();
            setPermissionStatus(permissions);
        } catch (error) {
            console.error('Error checking permissions:', error);
        }
    };

    const checkBiometricSupport = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            setSettings(prev => ({
                ...prev,
                biometricLogin: hasHardware && isEnrolled,
            }));
        } catch (error) {
            console.error('Error checking biometric support:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await checkPermissions();
        await loadProfile();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const toggleSetting = async (id: string) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        setSettings(prev => ({
            ...prev,
            [id]: !prev[id],
        }));

        if (id === 'locationServices' && !settings[id]) {
            const result = await permissionService.requestPermissionByCategory(PermissionCategory.LOCATION);
            if (!result.granted) {
                permissionService.showPermissionDeniedAlert(
                    'Location',
                    'find nearby stores and show local deals'
                );
            }
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const loadProfile = async () => {
        try {
            const profileData = await asyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            if (profileData) {
                setUserData(prev => ({
                    ...prev,
                    name: profileData.firstName ? `${profileData.firstName} ${profileData.lastName}` : prev.name,
                    email: profileData.email || prev.email,
                    phone: profileData.phone || prev.phone,
                    profileImage: profileData.profileImage || prev.profileImage,
                }));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handlePermissionRequest = async (category: PermissionCategory, title: string, description: string) => {
        try {
            const result = await permissionService.requestPermissionWithExplanation(
                category,
                title,
                description
            );

            if (result.granted) {
                await checkPermissions();
                Alert.alert('Success', 'Permission granted successfully!');
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            Alert.alert('Error', 'Failed to request permission. Please try again.');
        }
    };

    // Coming Soon handler for unimplemented features
    const showComingSoon = (featureName: string) => {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        Alert.alert(
            "Coming Soon!",
            `${featureName} is currently in development and will be available in a future update. Stay tuned!`,
            [
                { text: "OK", style: "default" }
            ]
        );
    };

    // Safe navigation handler
    const handleNavigation = (route: string, featureName?: string) => {
        // Routes that exist and should work
        const workingRoutes = [
            '/orders',
            '/orders/history',
            '/orders/returns',
            '/profile/personal',
            '/profile/edit',
            '/profile/addresses',
            '/profile/payment-methods',
            '/profile/walmart-plus',
            '/profile/rewards',
            '/profile/shopping-lists',
            '/support/contact',
            '/support/chat',
            '/support/help',
            '/legal/privacy',
            '/legal/terms'
        ];

        // Check if route exists and should work
        if (workingRoutes.includes(route)) {
            try {
                router.push(route as any);
            } catch (error) {
                console.error(`Navigation error for ${route}:`, error);
                showComingSoon(featureName || 'This feature');
            }
        } else {
            // Show coming soon for unimplemented features
            showComingSoon(featureName || 'This feature');
        }
    };

    // Enhanced account sections with proper navigation handling
    const accountSections = [
        {
            id: '1',
            title: 'Orders & Purchases',
            items: [
                {
                    id: '1-1',
                    title: 'Your Orders',
                    subtitle: 'Track packages and reorder items',
                    icon: 'cube-outline',
                    action: () => handleNavigation('/orders'),
                    badge: '3 in transit',
                    badgeColor: COLORS.walmartBlue,
                },
                {
                    id: '1-2',
                    title: 'Purchase History',
                    subtitle: 'View all your past purchases',
                    icon: 'receipt-outline',
                    action: () => handleNavigation('/orders/history'),
                },
                {
                    id: '1-3',
                    title: 'Returns & Refunds',
                    subtitle: 'Manage returns and track refunds',
                    icon: 'return-down-back-outline',
                    action: () => handleNavigation('/orders/returns'),
                },
                {
                    id: '1-4',
                    title: 'Auto-Reorder',
                    subtitle: 'Set up automatic reordering for essentials',
                    icon: 'refresh-outline',
                    action: () => showComingSoon('Auto-Reorder'),
                    badge: 'New',
                    badgeColor: COLORS.ai,
                },
            ],
        },
        {
            id: '2',
            title: 'AI & Smart Features',
            items: [
                {
                    id: '2-1',
                    title: 'AI Shopping Assistant',
                    subtitle: 'Get personalized recommendations and help',
                    icon: 'chatbubble-ellipses-outline',
                    action: () => showComingSoon('AI Shopping Assistant'),
                    badge: `${userData.aiRecommendations} suggestions`,
                    badgeColor: COLORS.ai,
                },
                {
                    id: '2-2',
                    title: 'Smart Shopping Lists',
                    subtitle: 'AI-powered lists that learn your habits',
                    icon: 'list-outline',
                    action: () => handleNavigation('/profile/shopping-lists', 'Smart Shopping Lists'),
                },
                {
                    id: '2-3',
                    title: 'Price Tracking',
                    subtitle: 'Get alerts when prices drop on saved items',
                    icon: 'trending-down-outline',
                    action: () => showComingSoon('Price Tracking'),
                },
                {
                    id: '2-4',
                    title: 'Voice Shopping',
                    subtitle: 'Shop hands-free with voice commands',
                    icon: 'mic-outline',
                    action: () => showComingSoon('Voice Shopping'),
                },
            ],
        },
        {
            id: '3',
            title: 'Camera & Scanning',
            items: [
                {
                    id: '3-1',
                    title: 'Scan History',
                    subtitle: 'View your barcode and receipt scans',
                    icon: 'scan-outline',
                    action: () => showComingSoon('Scan History'),
                    badge: `${userData.scannedItems} scans`,
                    badgeColor: COLORS.warning,
                },
                {
                    id: '3-2',
                    title: 'Receipt Scanner',
                    subtitle: 'Scan receipts for expense tracking',
                    icon: 'document-text-outline',
                    action: () => showComingSoon('Receipt Scanner'),
                },
                {
                    id: '3-3',
                    title: 'Visual Search',
                    subtitle: 'Find products by taking photos',
                    icon: 'camera-outline',
                    action: () => showComingSoon('Visual Search'),
                },
                {
                    id: '3-4',
                    title: 'Inventory Manager',
                    subtitle: 'Track your home inventory with photos',
                    icon: 'archive-outline',
                    action: () => showComingSoon('Inventory Manager'),
                },
            ],
        },
        {
            id: '4',
            title: 'Analytics & Insights',
            items: [
                {
                    id: '4-1',
                    title: 'Spending Analytics',
                    subtitle: 'Track your shopping patterns and budget',
                    icon: 'analytics-outline',
                    action: () => showComingSoon('Spending Analytics'),
                    badge: `$${userData.monthlySpending}`,
                    badgeColor: COLORS.purple,
                },
                {
                    id: '4-2',
                    title: 'Carbon Footprint',
                    subtitle: 'Track environmental impact of purchases',
                    icon: 'leaf-outline',
                    action: () => showComingSoon('Carbon Footprint Tracking'),
                    badge: `${userData.carbonFootprint} kg CO₂`,
                    badgeColor: COLORS.eco,
                },
                {
                    id: '4-3',
                    title: 'Shopping Insights',
                    subtitle: 'Personalized shopping behavior analysis',
                    icon: 'bar-chart-outline',
                    action: () => showComingSoon('Shopping Insights'),
                },
                {
                    id: '4-4',
                    title: 'Health Tracking',
                    subtitle: 'Monitor nutrition and wellness purchases',
                    icon: 'heart-outline',
                    action: () => showComingSoon('Health Tracking'),
                },
            ],
        },
        {
            id: '5',
            title: 'Account & Billing',
            items: [
                {
                    id: '5-1',
                    title: 'Personal Information',
                    subtitle: 'Update your contact details',
                    icon: 'person-outline',
                    action: () => handleNavigation('/profile/personal'),
                },
                {
                    id: '5-2',
                    title: 'Addresses',
                    subtitle: 'Manage shipping and billing addresses',
                    icon: 'location-outline',
                    action: () => handleNavigation('/profile/addresses'),
                },
                {
                    id: '5-3',
                    title: 'Payment Methods',
                    subtitle: 'Cards, PayPal, and other payment options',
                    icon: 'card-outline',
                    action: () => handleNavigation('/profile/payment-methods'),
                },
                {
                    id: '5-4',
                    title: 'Walmart+ Membership',
                    subtitle: 'Manage your subscription and benefits',
                    icon: 'add-circle-outline',
                    action: () => handleNavigation('/profile/walmart-plus'),
                    badge: 'Active',
                    badgeColor: COLORS.success,
                },
            ],
        },
        {
            id: '6',
            title: 'Family & Social',
            items: [
                {
                    id: '6-1',
                    title: 'Family Account',
                    subtitle: 'Manage household members and sharing',
                    icon: 'people-outline',
                    action: () => showComingSoon('Family Account Management'),
                },
                {
                    id: '6-2',
                    title: 'Gift Center',
                    subtitle: 'Send gifts and manage gift cards',
                    icon: 'gift-outline',
                    action: () => showComingSoon('Gift Center'),
                },
                {
                    id: '6-3',
                    title: 'Shared Lists',
                    subtitle: 'Create and share shopping lists',
                    icon: 'share-outline',
                    action: () => showComingSoon('Shared Shopping Lists'),
                },
                {
                    id: '6-4',
                    title: 'Reviews & Ratings',
                    subtitle: 'Manage your product reviews',
                    icon: 'star-outline',
                    action: () => showComingSoon('Review Management'),
                },
            ],
        },
        {
            id: '7',
            title: 'Help & Support',
            items: [
                {
                    id: '7-1',
                    title: 'Customer Service',
                    subtitle: 'Get help with orders and account',
                    icon: 'headset-outline',
                    action: () => handleNavigation('/support/contact'),
                },
                {
                    id: '7-2',
                    title: 'Live Chat',
                    subtitle: 'Chat with support representatives',
                    icon: 'chatbubble-outline',
                    action: () => handleNavigation('/support/chat'),
                },
                {
                    id: '7-3',
                    title: 'FAQ & Help',
                    subtitle: 'Find answers to common questions',
                    icon: 'help-circle-outline',
                    action: () => handleNavigation('/support/help'),
                },
                {
                    id: '7-4',
                    title: 'Feedback',
                    subtitle: 'Share your thoughts with us',
                    icon: 'thumbs-up-outline',
                    action: () => showComingSoon('Feedback System'),
                },
            ],
        },
    ];

    // Enhanced settings with granular controls
    const settingsItems = [
        {
            id: 'pushNotifications',
            title: 'Push Notifications',
            subtitle: 'Order updates, deals, and promotions',
            type: 'toggle',
            permission: PermissionCategory.NOTIFICATIONS,
        },
        {
            id: 'emailNotifications',
            title: 'Email Notifications',
            subtitle: 'Weekly deals and special offers',
            type: 'toggle',
        },
        {
            id: 'locationServices',
            title: 'Location Services',
            subtitle: 'Find nearby stores and local deals',
            type: 'toggle',
            permission: PermissionCategory.LOCATION,
        },
        {
            id: 'biometricLogin',
            title: 'Biometric Login',
            subtitle: 'Use Face ID or fingerprint to sign in',
            type: 'toggle',
            permission: PermissionCategory.BIOMETRICS,
        },
        {
            id: 'aiAssistant',
            title: 'AI Shopping Assistant',
            subtitle: 'Get personalized recommendations',
            type: 'toggle',
        },
        {
            id: 'voiceCommands',
            title: 'Voice Commands',
            subtitle: 'Shop with voice commands',
            type: 'toggle',
        },
        {
            id: 'smartRecommendations',
            title: 'Smart Recommendations',
            subtitle: 'AI-powered product suggestions',
            type: 'toggle',
        },
        {
            id: 'carbonTracking',
            title: 'Carbon Footprint Tracking',
            subtitle: 'Monitor environmental impact',
            type: 'toggle',
        },
        {
            id: 'familySharing',
            title: 'Family Sharing',
            subtitle: 'Share lists and purchases with family',
            type: 'toggle',
        },
        {
            id: 'autoReorder',
            title: 'Auto-Reorder',
            subtitle: 'Automatically reorder essentials',
            type: 'toggle',
        },
        {
            id: 'dealAlerts',
            title: 'Deal Alerts',
            subtitle: 'Notifications for price drops and deals',
            type: 'toggle',
        },
        {
            id: 'priceTracking',
            title: 'Price Tracking',
            subtitle: 'Track prices on saved items',
            type: 'toggle',
        },
    ];

    const renderAccountItem = (item: any, isLast: boolean = false) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.accountItem, isLast && styles.accountItemLast]}
            onPress={item.action}
        >
            <View style={styles.accountIconContainer}>
                <Ionicons name={item.icon} size={20} color={COLORS.darkGray} />
            </View>
            <View style={styles.accountItemContent}>
                <Text style={styles.accountItemTitle}>
                    {item.title}
                </Text>
                <Text style={styles.accountItemSubtitle}>
                    {item.subtitle}
                </Text>
            </View>
            {item.badge && (
                <View style={[
                    styles.accountItemBadge,
                    { backgroundColor: item.badgeColor || COLORS.walmartBlue }
                ]}>
                    <Text style={styles.accountItemBadgeText}>
                        {item.badge}
                    </Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
        </TouchableOpacity>
    );

    const renderSettingItem = (item: any, isLast: boolean = false) => (
        <View
            key={item.id}
            style={[styles.settingItem, isLast && styles.accountItemLast]}
        >
            <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>
                    {item.title}
                </Text>
                <Text style={styles.settingItemSubtitle}>
                    {item.subtitle}
                </Text>
            </View>
            <Switch
                value={settings[item.id]}
                onValueChange={() => toggleSetting(item.id)}
                trackColor={{ false: '#E0E0E0', true: '#B3D9FF' }}
                thumbColor={settings[item.id] ? COLORS.walmartBlue : '#FAFAFA'}
                ios_backgroundColor="#E0E0E0"
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profile Header */}
                <LinearGradient
                    colors={[COLORS.walmartBlue, COLORS.walmartDarkBlue]}
                    style={styles.profileHeader}
                >
                    <View style={styles.profileRow}>
                        <TouchableOpacity onPress={() => handleNavigation('/profile/edit')}>
                            <Image
                                source={{ uri: userData.profileImage }}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>
                                {userData.name}
                            </Text>
                            <Text style={styles.profileEmail}>
                                {userData.email}
                            </Text>
                            <Text style={styles.profileMemberSince}>
                                {userData.memberSince}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleNavigation('/profile/edit')}
                        >
                            <Ionicons name="create-outline" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Walmart+ Status */}
                    {userData.walmartPlusMember && (
                        <View style={styles.walmartPlusCard}>
                            <View style={styles.walmartPlusRow}>
                                <View style={styles.walmartPlusLeft}>
                                    <Ionicons name="add-circle" size={24} color={COLORS.white} />
                                    <View style={styles.walmartPlusInfo}>
                                        <Text style={styles.walmartPlusTitle}>
                                            Walmart+ Member
                                        </Text>
                                        <Text style={styles.walmartPlusSubtitle}>
                                            Free delivery & exclusive benefits
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleNavigation('/profile/walmart-plus')}>
                                    <Text style={styles.walmartPlusManage}>Manage</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </LinearGradient>

                {/* Enhanced Quick Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => handleNavigation('/profile/rewards')}
                        >
                            <Text style={[styles.statValue, { color: COLORS.walmartBlue }]}>
                                ${userData.rewardsBalance}
                            </Text>
                            <Text style={styles.statLabel}>Rewards Balance</Text>
                        </TouchableOpacity>
                        <View style={styles.statDivider} />
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => showComingSoon('Carbon Footprint Tracking')}
                        >
                            <Text style={[styles.statValue, { color: COLORS.eco }]}>
                                {userData.carbonFootprint}kg
                            </Text>
                            <Text style={styles.statLabel}>CO₂ Saved</Text>
                        </TouchableOpacity>
                        <View style={styles.statDivider} />
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => showComingSoon('AI Shopping Assistant')}
                        >
                            <Text style={[styles.statValue, { color: COLORS.ai }]}>
                                {userData.aiRecommendations}
                            </Text>
                            <Text style={styles.statLabel}>AI Suggestions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account Sections */}
                <View style={styles.contentSpacing}>
                    {accountSections.map((section) => (
                        <View key={section.id} style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {section.title}
                                </Text>
                            </View>
                            {section.items.map((item, index) =>
                                renderAccountItem(item, index === section.items.length - 1)
                            )}
                        </View>
                    ))}
                </View>

                {/* Enhanced Settings Section */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Settings & Privacy
                        </Text>
                    </View>
                    {settingsItems.map((item, index) =>
                        renderSettingItem(item, index === settingsItems.length - 1)
                    )}

                    {/* Additional Settings */}
                    <TouchableOpacity
                        style={styles.accountItem}
                        onPress={() => showComingSoon('Accessibility Settings')}
                    >
                        <View style={styles.accountIconContainer}>
                            <Ionicons name="accessibility-outline" size={20} color={COLORS.darkGray} />
                        </View>
                        <View style={styles.accountItemContent}>
                            <Text style={styles.accountItemTitle}>
                                Accessibility
                            </Text>
                            <Text style={styles.accountItemSubtitle}>
                                Voice controls, visual assistance, and more
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.accountItem}
                        onPress={() => handleNavigation('/legal/privacy')}
                    >
                        <View style={styles.accountIconContainer}>
                            <Ionicons name="shield-outline" size={20} color={COLORS.darkGray} />
                        </View>
                        <View style={styles.accountItemContent}>
                            <Text style={styles.accountItemTitle}>
                                Privacy Policy
                            </Text>
                            <Text style={styles.accountItemSubtitle}>
                                How we protect and use your data
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.accountItem, styles.accountItemLast]}
                        onPress={() => handleNavigation('/legal/terms')}
                    >
                        <View style={styles.accountIconContainer}>
                            <Ionicons name="document-text-outline" size={20} color={COLORS.darkGray} />
                        </View>
                        <View style={styles.accountItemContent}>
                            <Text style={styles.accountItemTitle}>
                                Terms of Service
                            </Text>
                            <Text style={styles.accountItemSubtitle}>
                                Terms and conditions of use
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            About
                        </Text>
                    </View>
                    <View style={[styles.accountItem, styles.accountItemLast]}>
                        <View style={styles.accountItemContent}>
                            <View style={styles.appInfoRow}>
                                <Text style={styles.appInfoLabel}>App Version</Text>
                                <Text style={styles.appInfoValue}>1.0.0</Text>
                            </View>
                            <View style={styles.appInfoRow}>
                                <Text style={styles.appInfoLabel}>Build</Text>
                                <Text style={styles.appInfoValue}>2024.1.1</Text>
                            </View>
                            <View style={styles.appInfoRow}>
                                <Text style={styles.appInfoLabel}>AI Model</Text>
                                <Text style={styles.appInfoValue}>Claude-3.5-Sonnet</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Sign Out Button */}
                <View style={styles.signOutContainer}>
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2024 Walmart Inc. All rights reserved.
                    </Text>
                    <Text style={styles.footerText}>
                        Powered by AI • Privacy First • Sustainable Shopping
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Keep your existing styles - they're already well-structured
const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flex: 1,
    },

    // Profile Header
    profileHeader: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        position: 'relative',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 24,
        letterSpacing: 0.5,
    },
    profileEmail: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        marginTop: 2,
        fontWeight: '400',
    },
    profileMemberSince: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '400',
    },
    editButton: {
        padding: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    // Walmart+ Status
    walmartPlusCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 18,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    walmartPlusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    walmartPlusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    walmartPlusInfo: {
        marginLeft: 12,
        flex: 1,
    },
    walmartPlusTitle: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 18,
        letterSpacing: 0.3,
    },
    walmartPlusSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 2,
        fontWeight: '400',
    },
    walmartPlusManage: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        textDecorationLine: 'underline',
    },

    // Enhanced Quick Stats Card
    statsCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 113, 206, 0.1)',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 8,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    statLabel: {
        color: '#757575',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 12,
    },

    // Enhanced Section Cards
    sectionCard: {
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderRadius: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },
    sectionTitle: {
        color: '#212121',
        fontWeight: '700',
        fontSize: 17,
        letterSpacing: 0.3,
    },

    // Enhanced Account Items
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        backgroundColor: '#FFFFFF',
    },
    accountItemLast: {
        borderBottomWidth: 0,
    },
    accountIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: '#F8F9FA',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    accountItemContent: {
        flex: 1,
    },
    accountItemTitle: {
        color: '#212121',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.2,
        marginBottom: 2,
    },
    accountItemSubtitle: {
        color: '#757575',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
    },
    accountItemBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    accountItemBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    // Enhanced Settings Items
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        backgroundColor: '#FFFFFF',
    },
    settingItemContent: {
        flex: 1,
        marginRight: 16,
    },
    settingItemTitle: {
        color: '#212121',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.2,
        marginBottom: 2,
    },
    settingItemSubtitle: {
        color: '#757575',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
    },

    // App Info
    appInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 4,
    },
    appInfoLabel: {
        color: '#757575',
        fontSize: 14,
        fontWeight: '500',
    },
    appInfoValue: {
        color: '#212121',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.2,
    },

    // Enhanced Sign Out Button
    signOutContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
        marginTop: 8,
    },
    signOutButton: {
        backgroundColor: '#D32F2F',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(211, 47, 47, 0.3)',
    },
    signOutText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    // Enhanced Footer
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 16,
        marginTop: 16,
    },
    footerText: {
        color: '#9E9E9E',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '400',
        marginBottom: 4,
    },

    // Content Spacing
    contentSpacing: {
        marginTop: 32,
    },
});