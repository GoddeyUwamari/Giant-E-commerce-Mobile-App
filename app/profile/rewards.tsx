import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    RefreshControl,
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

// Mock rewards data
const rewardsData = {
    totalBalance: 245.50,
    totalEarned: 1847.25,
    totalRedeemed: 1601.75,
    memberSince: 'January 2023',
    nextTierRequirement: 500,
    currentTierPoints: 245.50,
    tier: 'Silver',
    nextTier: 'Gold',
};

const recentTransactions = [
    {
        id: '1',
        type: 'earned',
        amount: 12.50,
        description: 'Purchase at Walmart Store #1234',
        date: '2024-01-25',
        orderId: 'WM123456789',
        status: 'completed',
    },
    {
        id: '2',
        type: 'redeemed',
        amount: -25.00,
        description: 'Redeemed for grocery purchase',
        date: '2024-01-24',
        orderId: 'WM123456788',
        status: 'completed',
    },
    {
        id: '3',
        type: 'earned',
        amount: 8.75,
        description: 'Online order delivery',
        date: '2024-01-23',
        orderId: 'WM123456787',
        status: 'completed',
    },
    {
        id: '4',
        type: 'earned',
        amount: 15.25,
        description: 'Walmart+ membership bonus',
        date: '2024-01-22',
        orderId: 'WM123456786',
        status: 'completed',
    },
    {
        id: '5',
        type: 'pending',
        amount: 6.50,
        description: 'Purchase pending review',
        date: '2024-01-21',
        orderId: 'WM123456785',
        status: 'pending',
    },
];

const rewardsTiers = [
    {
        name: 'Bronze',
        minPoints: 0,
        maxPoints: 99,
        benefits: ['1% cashback', 'Birthday bonus'],
        color: '#CD7F32',
        completed: true,
    },
    {
        name: 'Silver',
        minPoints: 100,
        maxPoints: 499,
        benefits: ['1.5% cashback', 'Free shipping', 'Priority support'],
        color: '#C0C0C0',
        completed: true,
    },
    {
        name: 'Gold',
        minPoints: 500,
        maxPoints: 999,
        benefits: ['2% cashback', 'Exclusive deals', 'Early access'],
        color: '#FFD700',
        completed: false,
    },
    {
        name: 'Platinum',
        minPoints: 1000,
        maxPoints: 9999,
        benefits: ['2.5% cashback', 'Personal shopper', 'VIP events'],
        color: '#E5E4E2',
        completed: false,
    },
];

const quickActions = [
    {
        id: 'redeem',
        title: 'Redeem Rewards',
        subtitle: 'Use your points',
        icon: 'gift-outline',
        color: COLORS.success,
        action: 'redeem',
    },
    {
        id: 'earn',
        title: 'Earn More',
        subtitle: 'Shop to earn points',
        icon: 'add-circle-outline',
        color: COLORS.walmartBlue,
        action: 'earn',
    },
    {
        id: 'refer',
        title: 'Refer Friends',
        subtitle: 'Get bonus points',
        icon: 'people-outline',
        color: COLORS.warning,
        action: 'refer',
    },
];

export default function RewardsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'transactions' | 'tiers'>('transactions');

    const handleRefresh = async () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'redeem':
                Alert.alert('Redeem Rewards', 'Navigate to redemption options');
                break;
            case 'earn':
                router.push('/(tabs)/');
                break;
            case 'refer':
                Alert.alert('Refer Friends', 'Share your referral code');
                break;
        }
    };

    const handleTransactionPress = (transaction: any) => {
        Alert.alert(
            'Transaction Details',
            `Order ID: ${transaction.orderId}\nAmount: $${Math.abs(transaction.amount)}\nDate: ${transaction.date}\nStatus: ${transaction.status}`
        );
    };

    const renderTransaction = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.transactionItem}
            onPress={() => handleTransactionPress(item)}
        >
            <View style={[
                styles.transactionIcon,
                { backgroundColor: item.type === 'earned' ? COLORS.success :
                        item.type === 'redeemed' ? COLORS.walmartBlue : COLORS.warning }
            ]}>
                <Ionicons
                    name={
                        item.type === 'earned' ? 'add' :
                            item.type === 'redeemed' ? 'remove' : 'time'
                    }
                    size={20}
                    color={COLORS.white}
                />
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>{item.description}</Text>
                <Text style={styles.transactionDate}>{item.date}</Text>
                <Text style={styles.transactionOrder}>Order: {item.orderId}</Text>
            </View>
            <View style={styles.transactionAmount}>
                <Text style={[
                    styles.transactionAmountText,
                    { color: item.type === 'earned' ? COLORS.success :
                            item.type === 'redeemed' ? COLORS.error : COLORS.warning }
                ]}>
                    {item.type === 'earned' ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
                </Text>
                <Text style={styles.transactionStatus}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderTier = (tier: any, index: number) => (
        <View key={tier.name} style={styles.tierItem}>
            <View style={styles.tierHeader}>
                <View style={[styles.tierIcon, { backgroundColor: tier.color }]}>
                    <Ionicons
                        name={tier.completed ? 'checkmark' : 'lock-closed'}
                        size={20}
                        color={COLORS.white}
                    />
                </View>
                <View style={styles.tierInfo}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierRange}>
                        ${tier.minPoints} - ${tier.maxPoints} points
                    </Text>
                </View>
                {tier.name === rewardsData.tier && (
                    <View style={styles.currentTierBadge}>
                        <Text style={styles.currentTierText}>CURRENT</Text>
                    </View>
                )}
            </View>
            <View style={styles.tierBenefits}>
                {tier.benefits.map((benefit: string, benefitIndex: number) => (
                    <View key={benefitIndex} style={styles.benefitItem}>
                        <Ionicons name="checkmark" size={16} color={COLORS.success} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                ))}
            </View>
            {tier.name === rewardsData.nextTier && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        ${rewardsData.nextTierRequirement - rewardsData.currentTierPoints} more to unlock
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${(rewardsData.currentTierPoints / rewardsData.nextTierRequirement) * 100}%`
                                }
                            ]}
                        />
                    </View>
                </View>
            )}
        </View>
    );

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
                <Text style={styles.headerTitle}>Rewards</Text>
                <TouchableOpacity style={styles.historyButton}>
                    <Ionicons name="document-text-outline" size={24} color={COLORS.walmartBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.walmartBlue]}
                    />
                }
            >
                {/* Balance Card */}
                <LinearGradient
                    colors={[COLORS.walmartBlue, COLORS.walmartDarkBlue]}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceTitle}>Available Balance</Text>
                        <View style={styles.tierBadge}>
                            <Text style={styles.tierBadgeText}>{rewardsData.tier} Member</Text>
                        </View>
                    </View>
                    <Text style={styles.balanceAmount}>${rewardsData.totalBalance}</Text>
                    <Text style={styles.balanceSubtitle}>
                        Member since {rewardsData.memberSince}
                    </Text>

                    {/* Progress to Next Tier */}
                    <View style={styles.nextTierContainer}>
                        <Text style={styles.nextTierText}>
                            ${rewardsData.nextTierRequirement - rewardsData.currentTierPoints} away from {rewardsData.nextTier}
                        </Text>
                        <View style={styles.tierProgressBar}>
                            <View
                                style={[
                                    styles.tierProgressFill,
                                    {
                                        width: `${(rewardsData.currentTierPoints / rewardsData.nextTierRequirement) * 100}%`
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </LinearGradient>

                {/* Summary Stats */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryAmount}>${rewardsData.totalEarned}</Text>
                        <Text style={styles.summaryLabel}>Total Earned</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryAmount}>${rewardsData.totalRedeemed}</Text>
                        <Text style={styles.summaryLabel}>Total Redeemed</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryAmount}>
                            ${(rewardsData.totalEarned - rewardsData.totalRedeemed).toFixed(2)}
                        </Text>
                        <Text style={styles.summaryLabel}>Net Rewards</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.quickActionItem}
                                onPress={() => handleQuickAction(action.action)}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                                    <Ionicons name={action.icon} size={24} color={COLORS.white} />
                                </View>
                                <Text style={styles.quickActionTitle}>{action.title}</Text>
                                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'transactions' && styles.tabButtonActive
                        ]}
                        onPress={() => setSelectedTab('transactions')}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            selectedTab === 'transactions' && styles.tabButtonTextActive
                        ]}>
                            Recent Activity
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'tiers' && styles.tabButtonActive
                        ]}
                        onPress={() => setSelectedTab('tiers')}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            selectedTab === 'tiers' && styles.tabButtonTextActive
                        ]}>
                            Membership Tiers
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {selectedTab === 'transactions' ? (
                        <FlatList
                            data={recentTransactions}
                            renderItem={renderTransaction}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            style={styles.transactionsList}
                        />
                    ) : (
                        <View style={styles.tiersList}>
                            {rewardsTiers.map(renderTier)}
                        </View>
                    )}
                </View>

                {/* Footer Info */}
                <View style={styles.footerInfo}>
                    <Text style={styles.footerTitle}>How Rewards Work</Text>
                    <Text style={styles.footerText}>
                        • Earn 1-2.5% cashback on purchases based on your tier
                    </Text>
                    <Text style={styles.footerText}>
                        • Points never expire as long as your account is active
                    </Text>
                    <Text style={styles.footerText}>
                        • Redeem rewards for purchases or statement credits
                    </Text>
                    <Text style={styles.footerText}>
                        • Earn bonus points with Walmart+ membership
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
    historyButton: {
        padding: 4,
    },
    scrollContainer: {
        flex: 1,
    },
    balanceCard: {
        margin: 16,
        borderRadius: 16,
        padding: 24,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceTitle: {
        color: COLORS.white,
        fontSize: 16,
        opacity: 0.9,
    },
    tierBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tierBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    balanceAmount: {
        color: COLORS.white,
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    balanceSubtitle: {
        color: COLORS.white,
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 20,
    },
    nextTierContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
    },
    nextTierText: {
        color: COLORS.white,
        fontSize: 12,
        marginBottom: 8,
    },
    tierProgressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    tierProgressFill: {
        height: '100%',
        backgroundColor: COLORS.walmartYellow,
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: COLORS.borderColor,
        marginHorizontal: 16,
    },
    quickActionsContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionItem: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    tabButtonActive: {
        backgroundColor: COLORS.walmartBlue,
    },
    tabButtonText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    tabButtonTextActive: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    tabContent: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    transactionsList: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    transactionOrder: {
        fontSize: 11,
        color: COLORS.mediumGray,
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    transactionAmountText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    transactionStatus: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    tiersList: {
        gap: 16,
    },
    tierItem: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
    },
    tierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tierIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    tierInfo: {
        flex: 1,
    },
    tierName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    tierRange: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    currentTierBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    currentTierText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    tierBenefits: {
        marginBottom: 12,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    benefitText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    progressContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
    },
    progressText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: COLORS.borderColor,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.walmartBlue,
    },
    footerInfo: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 12,
        padding: 16,
    },
    footerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    footerText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
        lineHeight: 18,
    },
});