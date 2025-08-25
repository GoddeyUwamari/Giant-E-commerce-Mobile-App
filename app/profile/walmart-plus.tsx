import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    borderColor: '#E0E0E0',
};

const membershipFeatures = [
    {
        id: '1',
        icon: 'car-outline',
        title: 'Free Delivery',
        description: 'Free delivery on orders $35+',
        active: true,
    },
    {
        id: '2',
        icon: 'pricetag-outline',
        title: 'Member Prices',
        description: 'Special pricing on fuel and select items',
        active: true,
    },
    {
        id: '3',
        icon: 'scan-outline',
        title: 'Scan & Go',
        description: 'Skip the checkout line',
        active: true,
    },
    {
        id: '4',
        icon: 'videocam-outline',
        title: 'Paramount+',
        description: 'Included with membership',
        active: true,
    },
    {
        id: '5',
        icon: 'time-outline',
        title: 'Early Access',
        description: 'Get deals before everyone else',
        active: true,
    },
];

const membershipSettings = [
    {
        id: '1',
        title: 'Auto-renewal',
        subtitle: 'Automatically renew membership',
        value: true,
    },
    {
        id: '2',
        title: 'Deal Notifications',
        subtitle: 'Get notified about member deals',
        value: true,
    },
    {
        id: '3',
        title: 'Delivery Notifications',
        subtitle: 'Updates on free delivery eligibility',
        value: false,
    },
];

export default function WalmartPlusScreen() {
    const [settings, setSettings] = useState(
        membershipSettings.reduce((acc, item) => ({
            ...acc,
            [item.id]: item.value,
        }), {})
    );

    const toggleSetting = (id: string) => {
        setSettings(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleCancelMembership = () => {
        // TODO: Implement cancel membership logic
        console.log('Cancel membership');
    };

    const handleViewBilling = () => {
        // TODO: Navigate to billing screen
        router.push('/profile/payment-methods');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Walmart+ Membership</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Membership Status Card */}
                <LinearGradient
                    colors={[COLORS.walmartBlue, COLORS.walmartDarkBlue]}
                    style={styles.statusCard}
                >
                    <View style={styles.statusHeader}>
                        <Ionicons name="add-circle" size={32} color={COLORS.white} />
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>Walmart+ Member</Text>
                            <Text style={styles.statusSubtitle}>Active Membership</Text>
                        </View>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>ACTIVE</Text>
                        </View>
                    </View>

                    <View style={styles.membershipDetails}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Member Since</Text>
                            <Text style={styles.detailValue}>January 2023</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Next Billing Date</Text>
                            <Text style={styles.detailValue}>December 15, 2024</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Annual Plan</Text>
                            <Text style={styles.detailValue}>$98/year</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Membership Features */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Benefits</Text>
                    </View>
                    {membershipFeatures.map((feature, index) => (
                        <View
                            key={feature.id}
                            style={[
                                styles.featureItem,
                                index === membershipFeatures.length - 1 && styles.featureItemLast
                            ]}
                        >
                            <View style={styles.featureIconContainer}>
                                <Ionicons
                                    name={feature.icon}
                                    size={24}
                                    color={COLORS.walmartBlue}
                                />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={COLORS.success}
                            />
                        </View>
                    ))}
                </View>

                {/* Membership Settings */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Membership Settings</Text>
                    </View>
                    {membershipSettings.map((setting, index) => (
                        <View
                            key={setting.id}
                            style={[
                                styles.settingItem,
                                index === membershipSettings.length - 1 && styles.settingItemLast
                            ]}
                        >
                            <View style={styles.settingContent}>
                                <Text style={styles.settingTitle}>{setting.title}</Text>
                                <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
                            </View>
                            <Switch
                                value={settings[setting.id]}
                                onValueChange={() => toggleSetting(setting.id)}
                                trackColor={{ false: '#E0E0E0', true: '#B3D9FF' }}
                                thumbColor={settings[setting.id] ? COLORS.walmartBlue : '#FAFAFA'}
                                ios_backgroundColor="#E0E0E0"
                            />
                        </View>
                    ))}
                </View>

                {/* Account Management */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Account Management</Text>
                    </View>

                    <TouchableOpacity style={styles.managementItem} onPress={handleViewBilling}>
                        <View style={styles.managementIconContainer}>
                            <Ionicons name="card-outline" size={20} color={COLORS.darkGray} />
                        </View>
                        <View style={styles.managementContent}>
                            <Text style={styles.managementTitle}>View Billing Details</Text>
                            <Text style={styles.managementSubtitle}>Manage payment method and history</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.managementItem}>
                        <View style={styles.managementIconContainer}>
                            <Ionicons name="gift-outline" size={20} color={COLORS.darkGray} />
                        </View>
                        <View style={styles.managementContent}>
                            <Text style={styles.managementTitle}>Share Membership</Text>
                            <Text style={styles.managementSubtitle}>Invite family members</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.managementItem, styles.managementItemLast]}
                        onPress={handleCancelMembership}
                    >
                        <View style={styles.managementIconContainer}>
                            <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
                        </View>
                        <View style={styles.managementContent}>
                            <Text style={[styles.managementTitle, { color: COLORS.error }]}>
                                Cancel Membership
                            </Text>
                            <Text style={styles.managementSubtitle}>End your Walmart+ benefits</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                    </TouchableOpacity>
                </View>

                {/* Savings Summary */}
                <View style={styles.savingsCard}>
                    <Text style={styles.savingsTitle}>Your Savings This Year</Text>
                    <Text style={styles.savingsAmount}>$156.40</Text>
                    <Text style={styles.savingsSubtitle}>
                        You've saved more than your membership cost!
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerSpacer: {
        width: 32,
    },
    scrollContainer: {
        flex: 1,
    },
    statusCard: {
        margin: 16,
        borderRadius: 12,
        padding: 20,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusInfo: {
        flex: 1,
        marginLeft: 12,
    },
    statusTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusSubtitle: {
        color: '#B3D9FF',
        fontSize: 14,
        marginTop: 2,
    },
    activeBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    activeBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    membershipDetails: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        color: '#CCE7FF',
        fontSize: 14,
    },
    detailValue: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '500',
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
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
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    featureItemLast: {
        borderBottomWidth: 0,
    },
    featureIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    featureDescription: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingItemLast: {
        borderBottomWidth: 0,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    settingSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    managementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    managementItemLast: {
        borderBottomWidth: 0,
    },
    managementIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    managementContent: {
        flex: 1,
    },
    managementTitle: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    managementSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    savingsCard: {
        backgroundColor: COLORS.success,
        margin: 16,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    savingsTitle: {
        color: COLORS.white,
        fontSize: 16,
        marginBottom: 8,
    },
    savingsAmount: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    savingsSubtitle: {
        color: COLORS.white,
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.9,
    },
});