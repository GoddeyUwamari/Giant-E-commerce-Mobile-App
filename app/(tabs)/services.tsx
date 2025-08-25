import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
    StyleSheet,
    TextInput,
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
    borderColor: '#E0E0E0',
    lightBlue: '#E3F2FD',
    cardShadow: '#000000',
};

// Services data
const featuredServices = [
    {
        id: '1',
        title: 'Walmart+',
        subtitle: 'Free delivery, gas discounts & more',
        description: 'Get unlimited free delivery, member prices on fuel, and exclusive perks.',
        icon: 'add-circle',
        color: COLORS.walmartBlue,
        gradient: [COLORS.walmartBlue, COLORS.walmartDarkBlue],
        badge: 'Most Popular',
        action: 'Start Free Trial',
    },
    {
        id: '2',
        title: 'Grocery Pickup',
        subtitle: 'Order online, pickup today',
        description: 'Shop groceries online and pick them up at your convenience.',
        icon: 'car',
        color: COLORS.success,
        gradient: [COLORS.success, '#2E7D32'],
        badge: 'Free',
        action: 'Start Shopping',
    },
];

const allServices = [
    {
        id: '1',
        category: 'Health & Wellness',
        services: [
            {
                id: '1-1',
                name: 'Pharmacy',
                description: 'Prescriptions, vaccines, health screenings',
                icon: 'medical',
                color: COLORS.error,
                available: true,
                hours: 'Mon-Sun 9AM-9PM',
            },
            {
                id: '1-2',
                name: 'Vision Center',
                description: 'Eye exams, glasses, contacts',
                icon: 'eye',
                color: COLORS.purple,
                available: true,
                hours: 'Mon-Sat 9AM-7PM',
            },
            {
                id: '1-3',
                name: 'Health Screening',
                description: 'Blood pressure, wellness checks',
                icon: 'heart',
                color: '#E91E63',
                available: true,
                hours: 'Mon-Sun 9AM-6PM',
            },
        ],
    },
    {
        id: '2',
        category: 'Auto Services',
        services: [
            {
                id: '2-1',
                name: 'Auto Care Center',
                description: 'Oil changes, tire installation, battery service',
                icon: 'car-sport',
                color: COLORS.warning,
                available: true,
                hours: 'Mon-Sat 7AM-7PM',
            },
            {
                id: '2-2',
                name: 'Tire Installation',
                description: 'Professional tire mounting and balancing',
                icon: 'disc',
                color: '#607D8B',
                available: true,
                hours: 'Mon-Sat 7AM-7PM',
            },
            {
                id: '2-3',
                name: 'Battery Installation',
                description: 'Car battery testing and replacement',
                icon: 'battery-full',
                color: '#00ACC1',
                available: true,
                hours: 'Mon-Sat 7AM-7PM',
            },
        ],
    },
    {
        id: '3',
        category: 'Photo & Tech',
        services: [
            {
                id: '3-1',
                name: 'Photo Center',
                description: 'Prints, photo books, custom gifts',
                icon: 'camera',
                color: COLORS.walmartBlue,
                available: true,
                hours: '24/7 Online',
            },
            {
                id: '3-2',
                name: 'Tech Services',
                description: 'Device setup, data transfer, repairs',
                icon: 'phone-portrait',
                color: COLORS.purple,
                available: true,
                hours: 'Mon-Sun 10AM-8PM',
            },
            {
                id: '3-3',
                name: 'Gaming',
                description: 'Trade-ins, pre-orders, gift cards',
                icon: 'game-controller',
                color: COLORS.success,
                available: true,
                hours: 'Mon-Sun 10AM-9PM',
            },
        ],
    },
    {
        id: '4',
        category: 'Financial Services',
        services: [
            {
                id: '4-1',
                name: 'Money Services',
                description: 'Check cashing, money orders, transfers',
                icon: 'card',
                color: COLORS.error,
                available: true,
                hours: 'Mon-Sun 8AM-8PM',
            },
            {
                id: '4-2',
                name: 'Tax Services',
                description: 'Tax preparation and filing',
                icon: 'document-text',
                color: '#8D6E63',
                available: false,
                hours: 'Seasonal',
            },
            {
                id: '4-3',
                name: 'Credit Card',
                description: 'Walmart Rewards Card application',
                icon: 'wallet',
                color: '#1565C0',
                available: true,
                hours: 'Apply Online',
            },
        ],
    },
];

const quickActions = [
    {
        id: '1',
        title: 'Store Finder',
        icon: 'location',
        color: COLORS.walmartBlue,
        action: () => router.push('/store/locator'),
    },
    {
        id: '2',
        title: 'Track Order',
        icon: 'cube',
        color: COLORS.success,
        action: () => router.push('/orders'),
    },
    {
        id: '3',
        title: 'Customer Service',
        icon: 'headset',
        color: COLORS.warning,
        action: () => router.push('/support/contact'),
    },
    {
        id: '4',
        title: 'Gift Cards',
        icon: 'gift',
        color: '#E91E63',
        action: () => Alert.alert('Gift Cards', 'Purchase and manage gift cards.'),
    },
];

export default function ServicesScreen(): JSX.Element {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleServicePress = (service: any) => {
        if (!service.available) {
            Alert.alert(
                'Service Unavailable',
                `${service.name} is currently unavailable. ${service.hours}`
            );
            return;
        }

        Alert.alert(
            service.name,
            `${service.description}\n\nHours: ${service.hours}`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Learn More', onPress: () => console.log(`Learn more about ${service.name}`) },
                { text: 'Get Directions', onPress: () => router.push('/store/locator') },
            ]
        );
    };

    const handleViewAll = (category: any) => {
        console.log(`View all ${category.category} services`);

        switch (category.category) {
            case 'Health & Wellness':
                Alert.alert(
                    'Health & Wellness Services',
                    'Pharmacy, Vision Center, Health Screening, and more health services.',
                    [
                        { text: 'OK', style: 'default' },
                        { text: 'Find Nearest Store', onPress: () => router.push('/store/locator') }
                    ]
                );
                break;
            case 'Auto Services':
                Alert.alert(
                    'Auto Services',
                    'Auto Care Center, Tire Installation, Battery Service, and more.',
                    [
                        { text: 'OK', style: 'default' },
                        { text: 'Schedule Service', onPress: () => Alert.alert('Schedule', 'Call your local store to schedule auto service.') }
                    ]
                );
                break;
            case 'Photo & Tech':
                Alert.alert(
                    'Photo & Tech Services',
                    'Photo printing, tech support, gaming services, and more.',
                    [
                        { text: 'OK', style: 'default' },
                        { text: 'Order Photos Online', onPress: () => Alert.alert('Photo Orders', 'Visit walmart.com/photos to place orders.') }
                    ]
                );
                break;
            case 'Financial Services':
                Alert.alert(
                    'Financial Services',
                    'Money transfers, check cashing, tax services, and credit cards.',
                    [
                        { text: 'OK', style: 'default' },
                        { text: 'Apply for Credit Card', onPress: () => Alert.alert('Credit Card', 'Visit walmart.com to apply for a Walmart credit card.') }
                    ]
                );
                break;
            default:
                Alert.alert(category.category, `View all ${category.category.toLowerCase()} services`);
        }
    };

    const renderFeaturedService = (service: any) => (
        <TouchableOpacity
            key={service.id}
            style={styles.featuredCard}
            onPress={() => {
                if (service.title === 'Walmart+') {
                    Alert.alert('Walmart+', 'Start your free 30-day trial today!');
                } else {
                    router.push('/(tabs)/search');
                }
            }}
        >
            <LinearGradient
                colors={service.gradient}
                style={styles.featuredGradient}
            >
                <View style={styles.featuredContent}>
                    <View style={styles.featuredTextContainer}>
                        {service.badge && (
                            <View style={styles.featuredBadge}>
                                <Text style={styles.featuredBadgeText}>{service.badge}</Text>
                            </View>
                        )}
                        <Text style={styles.featuredTitle}>
                            {service.title}
                        </Text>
                        <Text style={styles.featuredSubtitle}>
                            {service.subtitle}
                        </Text>
                        <Text style={styles.featuredDescription}>
                            {service.description}
                        </Text>
                        <TouchableOpacity style={styles.featuredButton}>
                            <Text style={[styles.featuredButtonText, { color: service.color }]}>
                                {service.action}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.featuredIconContainer}>
                        <Ionicons name={service.icon} size={48} color={COLORS.white} />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderServiceCard = (service: any) => (
        <TouchableOpacity
            key={service.id}
            style={[
                styles.serviceCard,
                !service.available && styles.serviceCardDisabled
            ]}
            onPress={() => handleServicePress(service)}
            disabled={!service.available}
        >
            <View style={styles.serviceCardContent}>
                <View
                    style={[
                        styles.serviceIconContainer,
                        { backgroundColor: `${service.color}20` },
                        !service.available && styles.serviceIconDisabled
                    ]}
                >
                    <Ionicons
                        name={service.icon}
                        size={24}
                        color={service.available ? service.color : COLORS.mediumGray}
                    />
                </View>
                <View style={styles.serviceInfo}>
                    <Text style={[
                        styles.serviceName,
                        !service.available && styles.serviceTextDisabled
                    ]}>
                        {service.name}
                    </Text>
                    <Text style={[
                        styles.serviceDescription,
                        !service.available && styles.serviceDescriptionDisabled
                    ]}>
                        {service.description}
                    </Text>
                    <View style={styles.serviceHours}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={service.available ? COLORS.textSecondary : COLORS.mediumGray}
                        />
                        <Text style={[
                            styles.serviceHoursText,
                            !service.available && styles.serviceTextDisabled
                        ]}>
                            {service.hours}
                        </Text>
                    </View>
                </View>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={service.available ? COLORS.mediumGray : '#D1D5DB'}
                />
            </View>
            {!service.available && (
                <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableBadgeText}>Unavailable</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header - Updated with back arrow */}
            <LinearGradient
                colors={[COLORS.walmartBlue, COLORS.walmartDarkBlue]}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        {/* Back Arrow */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        {/* Search Bar */}
                        <TouchableOpacity
                            style={styles.searchContainer}
                            onPress={() => router.push('/(tabs)/search')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="search" size={20} color={COLORS.mediumGray} />
                            <Text style={styles.searchPlaceholder}>Search Walmart</Text>
                            <TouchableOpacity style={styles.barcodeButton}>
                                <Ionicons name="barcode-outline" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        {/* Cart Button */}
                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => router.push('/(modals)/cart')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cartIconContainer}>
                                <Ionicons name="cart-outline" size={24} color={COLORS.white} />
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>12</Text>
                                </View>
                            </View>
                            <Text style={styles.cartTotal}>$669.65</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Services Title */}
            <View style={styles.servicesHeader}>
                <Text style={styles.servicesTitle}>Services</Text>
                <Text style={styles.servicesSubtitle}>Everything you need, all in one place</Text>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Featured Services */}
                <View style={styles.featuredSection}>
                    {featuredServices.map(renderFeaturedService)}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.quickActionCard}
                                onPress={action.action}
                            >
                                <View
                                    style={[
                                        styles.quickActionIcon,
                                        { backgroundColor: `${action.color}20` }
                                    ]}
                                >
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={styles.quickActionText}>
                                    {action.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* All Services by Category */}
                <View style={styles.servicesSection}>
                    {allServices.map((category) => (
                        <View key={category.id} style={styles.categorySection}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>
                                    {category.category}
                                </Text>
                                <TouchableOpacity onPress={() => handleViewAll(category)}>
                                    <Text style={styles.viewAllText}>
                                        View All
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.categoryContainer}>
                                {category.services.map(renderServiceCard)}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <View style={styles.helpContent}>
                        <View style={styles.helpIconContainer}>
                            <Ionicons name="help-circle" size={32} color={COLORS.walmartBlue} />
                        </View>
                        <Text style={styles.helpTitle}>Need Help?</Text>
                        <Text style={styles.helpDescription}>
                            Our customer service team is here to help with any questions about our services.
                        </Text>
                        <View style={styles.helpButtonsContainer}>
                            <TouchableOpacity
                                style={styles.helpButtonPrimary}
                                onPress={() => router.push('/support/contact')}
                            >
                                <Text style={styles.helpButtonPrimaryText}>
                                    Call Support
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.helpButtonSecondary}
                                onPress={() => router.push('/support/chat')}
                            >
                                <Text style={styles.helpButtonSecondaryText}>
                                    Live Chat
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Store Hours */}
                <View style={styles.storeHoursSection}>
                    <Text style={styles.storeHoursTitle}>Store Hours</Text>
                    <View style={styles.storeHoursList}>
                        {[
                            { day: 'Monday - Sunday', hours: '6:00 AM - 11:00 PM' },
                            { day: 'Pharmacy', hours: '9:00 AM - 9:00 PM' },
                            { day: 'Auto Center', hours: '7:00 AM - 7:00 PM' },
                            { day: 'Vision Center', hours: '9:00 AM - 7:00 PM' },
                        ].map((schedule, index) => (
                            <View key={index} style={styles.storeHoursRow}>
                                <Text style={styles.storeHoursDay}>{schedule.day}</Text>
                                <Text style={styles.storeHoursTime}>{schedule.hours}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.storeHoursLink}
                        onPress={() => router.push('/store/locator')}
                    >
                        <Text style={styles.storeHoursLinkText}>
                            Find Store Hours Near You
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContainer: {
        flex: 1,
    },

    // Header - Updated to include back arrow
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchPlaceholder: {
        color: COLORS.mediumGray,
        marginLeft: 12,
        flex: 1,
        fontSize: 16,
    },
    barcodeButton: {
        padding: 4,
    },
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cartIconContainer: {
        position: 'relative',
        marginRight: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.walmartYellow,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    cartTotal: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // Services Header
    servicesHeader: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    servicesTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    servicesSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },

    // Featured Services
    featuredSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
        backgroundColor: COLORS.white,
    },
    featuredCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    featuredGradient: {
        padding: 24,
    },
    featuredContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    featuredTextContainer: {
        flex: 1,
    },
    featuredBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    featuredBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    featuredTitle: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 24,
        marginBottom: 8,
    },
    featuredSubtitle: {
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: 16,
        marginBottom: 6,
        fontWeight: '500',
    },
    featuredDescription: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    featuredButton: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 14,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featuredButtonText: {
        fontWeight: '700',
        fontSize: 14,
    },
    featuredIconContainer: {
        marginLeft: 16,
        opacity: 0.9,
    },

    // Quick Actions
    quickActionsSection: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        backgroundColor: COLORS.white,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        alignItems: 'center',
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quickActionText: {
        color: COLORS.textPrimary,
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 18,
    },

    // Services Section
    servicesSection: {
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
    },
    categorySection: {
        marginBottom: 32,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    categoryTitle: {
        color: COLORS.textPrimary,
        fontWeight: '700',
        fontSize: 20,
    },
    viewAllText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: 14,
    },
    categoryContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    // Service Cards
    serviceCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginVertical: 4,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        position: 'relative',
    },
    serviceCardDisabled: {
        borderColor: '#E5E7EB',
        opacity: 0.6,
    },
    serviceCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    serviceIconDisabled: {
        opacity: 0.5,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
        color: COLORS.textPrimary,
    },
    serviceTextDisabled: {
        color: COLORS.mediumGray,
    },
    serviceDescription: {
        fontSize: 14,
        lineHeight: 18,
        marginBottom: 8,
        color: COLORS.textSecondary,
    },
    serviceDescriptionDisabled: {
        color: '#9CA3AF',
    },
    serviceHours: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceHoursText: {
        fontSize: 12,
        marginLeft: 4,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    unavailableBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: COLORS.mediumGray,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    unavailableBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },

    // Help Section
    helpSection: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    helpContent: {
        alignItems: 'center',
    },
    helpIconContainer: {
        width: 72,
        height: 72,
        backgroundColor: '#E3F2FD',
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#BBDEFB',
    },
    helpTitle: {
        color: COLORS.textPrimary,
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    helpDescription: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    helpButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    helpButtonPrimary: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 14,
        flex: 1,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    helpButtonPrimaryText: {
        color: COLORS.white,
        fontWeight: '700',
        textAlign: 'center',
        fontSize: 14,
    },
    helpButtonSecondary: {
        borderWidth: 2,
        borderColor: COLORS.walmartBlue,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 14,
        flex: 1,
    },
    helpButtonSecondaryText: {
        color: COLORS.walmartBlue,
        fontWeight: '700',
        textAlign: 'center',
        fontSize: 14,
    },

    // Store Hours Section
    storeHoursSection: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    storeHoursTitle: {
        color: COLORS.textPrimary,
        fontWeight: '700',
        fontSize: 18,
        marginBottom: 16,
    },
    storeHoursList: {
        gap: 12,
    },
    storeHoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    storeHoursDay: {
        color: COLORS.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    storeHoursTime: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    storeHoursLink: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    storeHoursLinkText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 24,
    },
});