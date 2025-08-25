import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
};

// Mock user data - replace with actual user state
const userData = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    memberSince: 'Member since 2020',
    profileImage: 'https://via.placeholder.com/80x80/0071CE/ffffff?text=JD',
    walmartPlusMember: true,
    rewardsBalance: 245.50,
    savedItems: 12,
    recentOrders: 8,
};

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
                action: () => router.push('/orders'),
                badge: '3 in transit',
                badgeColor: COLORS.walmartBlue,
            },
            {
                id: '1-2',
                title: 'Purchase History',
                subtitle: 'View all your past purchases',
                icon: 'receipt-outline',
                action: () => router.push('/orders/history'),
            },
            {
                id: '1-3',
                title: 'Returns & Refunds',
                subtitle: 'Manage returns and track refunds',
                icon: 'return-down-back-outline',
                action: () => router.push('/orders/returns'),
            },
        ],
    },
    {
        id: '2',
        title: 'Account & Billing',
        items: [
            {
                id: '2-1',
                title: 'Personal Information',
                subtitle: 'Update your contact details',
                icon: 'person-outline',
                action: () => router.push('/profile/personal'),
            },
            {
                id: '2-2',
                title: 'Addresses',
                subtitle: 'Manage shipping and billing addresses',
                icon: 'location-outline',
                action: () => router.push('/profile/addresses'),
            },
            {
                id: '2-3',
                title: 'Payment Methods',
                subtitle: 'Cards, PayPal, and other payment options',
                icon: 'card-outline',
                action: () => router.push('/profile/payment-methods'),
            },
            {
                id: '2-4',
                title: 'Walmart+ Membership',
                subtitle: 'Manage your subscription and benefits',
                icon: 'add-circle-outline',
                action: () => router.push('/profile/walmart-plus'),
                badge: 'Active',
                badgeColor: COLORS.success,
            },
        ],
    },
    {
        id: '3',
        title: 'Lists & Preferences',
        items: [
            {
                id: '3-1',
                title: 'Saved Items',
                subtitle: 'Items you want to buy later',
                icon: 'heart-outline',
                action: () => router.push('/profile/favorites'),
                badge: `${userData.savedItems} items`,
                badgeColor: COLORS.error,
            },
            {
                id: '3-2',
                title: 'Shopping Lists',
                subtitle: 'Create and manage shopping lists',
                icon: 'list-outline',
                action: () => router.push('/profile/shopping-lists'),
            },
            {
                id: '3-3',
                title: 'Recently Viewed',
                subtitle: 'Products you\'ve looked at recently',
                icon: 'eye-outline',
                action: () => router.push('/profile/recently-viewed'),
            },
            {
                id: '3-4',
                title: 'Recommendations',
                subtitle: 'Personalized product suggestions',
                icon: 'bulb-outline',
                action: () => router.push('/profile/recommendations'),
            },
        ],
    },
    {
        id: '4',
        title: 'Help & Support',
        items: [
            {
                id: '4-1',
                title: 'Customer Service',
                subtitle: 'Get help with orders and account',
                icon: 'headset-outline',
                action: () => router.push('/support/contact'),
            },
            {
                id: '4-2',
                title: 'FAQ',
                subtitle: 'Find answers to common questions',
                icon: 'help-circle-outline',
                action: () => router.push('/support/help'),
            },
            {
                id: '4-3',
                title: 'Feedback',
                subtitle: 'Share your thoughts with us',
                icon: 'chatbubble-outline',
                action: () => router.push('/support/chat'),
            },
        ],
    },
];

const settingsItems = [
    {
        id: '1',
        title: 'Push Notifications',
        subtitle: 'Order updates, deals, and promotions',
        type: 'toggle',
        value: true,
    },
    {
        id: '2',
        title: 'Email Notifications',
        subtitle: 'Weekly deals and special offers',
        type: 'toggle',
        value: false,
    },
    {
        id: '3',
        title: 'Location Services',
        subtitle: 'Find nearby stores and local deals',
        type: 'toggle',
        value: true,
    },
    {
        id: '4',
        title: 'Biometric Login',
        subtitle: 'Use Face ID or fingerprint to sign in',
        type: 'toggle',
        value: true,
    },
];

export default function AccountScreen(): JSX.Element {
    const [refreshing, setRefreshing] = useState(false);
    const [settings, setSettings] = useState(
        settingsItems.reduce((acc, item) => ({
            ...acc,
            [item.id]: item.value,
        }), {})
    );

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Implement actual data refresh
        setTimeout(() => setRefreshing(false), 1000);
    };

    const toggleSetting = (id: string) => {
        setSettings(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
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
                        // TODO: Implement actual sign out logic
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

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
                        <TouchableOpacity onPress={() => router.push('/profile/edit')}>
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
                            onPress={() => router.push('/profile/edit')}
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
                                <TouchableOpacity onPress={() => router.push('/profile/walmart-plus')}>
                                    <Text style={styles.walmartPlusManage}>Manage</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => router.push('/profile/rewards')}
                        >
                            <Text style={[styles.statValue, { color: COLORS.walmartBlue }]}>
                                ${userData.rewardsBalance}
                            </Text>
                            <Text style={styles.statLabel}>Rewards Balance</Text>
                        </TouchableOpacity>
                        <View style={styles.statDivider} />
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => router.push('/profile/favorites')}
                        >
                            <Text style={[styles.statValue, { color: COLORS.success }]}>
                                {userData.savedItems}
                            </Text>
                            <Text style={styles.statLabel}>Saved Items</Text>
                        </TouchableOpacity>
                        <View style={styles.statDivider} />
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => router.push('/orders')}
                        >
                            <Text style={[styles.statValue, { color: COLORS.purple }]}>
                                {userData.recentOrders}
                            </Text>
                            <Text style={styles.statLabel}>Recent Orders</Text>
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

                {/* Settings Section */}
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
                        onPress={() => router.push('/legal/privacy')}
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
                        onPress={() => router.push('/legal/terms')}
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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor:'white',
    },
    scrollContainer: {
        flex: 1,
    },

    // Profile Header
    profileHeader: {
        paddingHorizontal: 24,
        paddingVertical: 32,
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
        borderColor: 'white',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 24,
    },
    profileEmail: {
        color: 'white',
        fontSize: 16,
        marginTop: 2,
    },
    profileMemberSince: {
        color: 'white',
        fontSize: 14,
        marginTop: 4,
    },
    editButton: {
        padding: 8,
    },

    // Walmart+ Status
    walmartPlusCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
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
    },
    walmartPlusTitle: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    walmartPlusSubtitle: {
        color: '#B3D9FF',
        fontSize: 14,
        marginTop: 2,
    },
    walmartPlusManage: {
        color: COLORS.white,
        fontWeight: '500',
        fontSize: 14,
    },

    // Quick Stats Card
    statsCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginTop: -16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.borderColor,
        marginHorizontal: 8,
    },

    // Section Cards
    sectionCard: {
        backgroundColor: COLORS.white,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        backgroundColor: '#FAFAFA',
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Account Items
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    accountItemLast: {
        borderBottomWidth: 0,
    },
    accountIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    accountItemContent: {
        flex: 1,
    },
    accountItemTitle: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    accountItemSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
        lineHeight: 18,
    },
    accountItemBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    accountItemBadgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '600',
    },

    // Settings Items
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingItemContent: {
        flex: 1,
    },
    settingItemTitle: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    settingItemSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
        lineHeight: 18,
    },

    // App Info
    appInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    appInfoLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    appInfoValue: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 14,
    },

    // Sign Out Button
    signOutContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    signOutButton: {
        backgroundColor: COLORS.error,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    signOutText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingBottom: 32,
        paddingHorizontal: 16,
    },
    footerText: {
        color: COLORS.mediumGray,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },

    // Content Spacing
    contentSpacing: {
        marginTop: 24,
    },
});