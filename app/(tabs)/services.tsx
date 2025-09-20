import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    TextInput,
    Animated,
    Dimensions,
    StyleSheet,
    Platform,
    Linking,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import unified systems
import { useCartStore } from '../../store/slices/cartSlice';
import { ALL_CATEGORIES } from '../../constants/products/data';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced design system
const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    walmartYellow: '#FFC220',
    walmartYellowDark: '#E6A800',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    purple: '#8B5CF6',
    purpleLight: '#EDE9FE',
    pink: '#EC4899',
    pinkLight: '#FCE7F3',
    blue: '#3B82F6',
    blueLight: '#DBEAFE',
    orange: '#F97316',
    orangeLight: '#FED7AA',
    indigo: '#6366F1',
    indigoLight: '#E0E7FF',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

const TYPOGRAPHY = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    xxxxl: 32,
};

// Shop by Category data - clean category grid
const shopByCategories = [
    {
        id: '1',
        name: 'Electronics',
        icon: 'phone-portrait',
        color: COLORS.blue,
        itemCount: 120,
        route: '/category/electronics',
    },
    {
        id: '2',
        name: 'Home & Kitchen',
        icon: 'home',
        color: COLORS.warning,
        itemCount: 100,
        route: '/category/home-kitchen',
    },
    {
        id: '3',
        name: 'Fashion',
        icon: 'shirt',
        color: COLORS.pink,
        itemCount: 100,
        route: '/category/fashion',
    },
    {
        id: '4',
        name: 'Grocery',
        icon: 'basket',
        color: COLORS.success,
        itemCount: 90,
        route: '/category/grocery',
    },
    {
        id: '5',
        name: 'Appliances',
        icon: 'tv',
        color: COLORS.success,
        itemCount: 80,
        route: '/category/appliances',
    },
    {
        id: '6',
        name: 'Sports & Fitness',
        icon: 'fitness',
        color: COLORS.error,
        itemCount: 80,
        route: '/category/sports-fitness',
    },
];

const quickActions = [
    {
        id: '1',
        title: 'Store Finder',
        subtitle: 'Find nearby stores',
        icon: 'location',
        color: COLORS.walmartBlue,
        route: '/store/locator',
    },
    {
        id: '2',
        title: 'Track Order',
        subtitle: 'Check order status',
        icon: 'cube',
        color: COLORS.success,
        route: '/orders',
    },
    {
        id: '3',
        title: 'Support',
        subtitle: 'Get help 24/7',
        icon: 'headset',
        color: COLORS.warning,
        route: '/support/contact',
    },
    {
        id: '4',
        title: 'Gift Cards',
        subtitle: 'Buy & manage',
        icon: 'gift',
        color: COLORS.pink,
        route: '/gift-cards',
    },
];

// More Services data - clean list format
const moreServices = [
    {
        id: '1',
        name: 'Financial Services',
        description: 'Enjoy multiple financial service options',
        icon: 'card',
        color: COLORS.blue,
        route: '/services/financial',
        hasExternal: true,
    },
    {
        id: '2',
        name: 'Photo Center',
        description: 'Create prints, wall art, photo books, & more.',
        icon: 'camera',
        color: COLORS.indigo,
        route: '/services/photo',
        hasExternal: true,
    },
    {
        id: '3',
        name: 'Pet Pharmacy',
        description: 'Shop top pet supplies & medications for less.',
        icon: 'paw',
        color: COLORS.warning,
        route: '/services/pet-pharmacy',
        hasExternal: false,
    },
    {
        id: '4',
        name: 'Subscriptions',
        description: 'Enjoy easy delivery of everyday essentials.',
        icon: 'refresh',
        color: COLORS.purple,
        route: '/services/subscriptions',
        hasExternal: false,
    },
    {
        id: '5',
        name: 'Pickup & delivery',
        description: 'Come to us, or we\'ll come to you.',
        icon: 'car',
        color: COLORS.success,
        route: '/services/pickup-delivery',
        hasExternal: false,
    },
    {
        id: '6',
        name: 'Walmart Business',
        description: 'Save time, money, & hassle.',
        icon: 'business',
        color: COLORS.walmartBlue,
        route: '/services/business',
        hasExternal: false,
    },
];

// Enhanced navigation helper with better fallback handling
const enhancedNavigate = (route: string, fallbackTitle?: string, fallbackMessage?: string) => {
    try {
        if (route) {
            router.push(route);
        } else {
            throw new Error('No route provided');
        }
    } catch (error) {
        console.log(`Route ${route} not available, showing fallback`);
        const title = fallbackTitle || 'Coming Soon';
        const message = fallbackMessage || 'This feature will be available in a future update.';
        Alert.alert(title, message, [{ text: 'OK' }]);
    }
};

export default function ServicesScreen() {
    // State management - simplified
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Real cart integration
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Initialize animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Calculate cart summary
    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    // Enhanced filtered services
    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) {
            return moreServices;
        }

        const query = searchQuery.toLowerCase();
        return moreServices.filter(service =>
            service.name.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Enhanced refresh handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await calculateSummary();
            // Simulate data refresh
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [calculateSummary]);

    // Enhanced navigation handlers
    const handleCategoryPress = useCallback((category: any) => {
        enhancedNavigate(category.route, category.name, `Browse ${category.name} products`);
    }, []);

    const handleQuickActionPress = useCallback((action: any) => {
        enhancedNavigate(
            action.route,
            action.title,
            `${action.title}: ${action.subtitle}`
        );
    }, []);

    const handleServicePress = useCallback((service: any) => {
        enhancedNavigate(service.route, service.name, service.description);
    }, []);

    // Component renderers
    const renderCategory = (category: any) => (
        <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.8}
        >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon} size={24} color={COLORS.white} />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.itemCount} items</Text>
        </TouchableOpacity>
    );

    const renderQuickAction = (action: any) => (
        <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={() => handleQuickActionPress(action)}
            activeOpacity={0.8}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color={COLORS.white} />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
        </TouchableOpacity>
    );

    const renderMoreService = (service: any) => (
        <TouchableOpacity
            key={service.id}
            style={styles.moreServiceItem}
            onPress={() => handleServicePress(service)}
            activeOpacity={0.8}
        >
            <View style={[styles.moreServiceIcon, { backgroundColor: service.color }]}>
                <Ionicons name={service.icon} size={20} color={COLORS.white} />
            </View>
            <View style={styles.moreServiceContent}>
                <Text style={styles.moreServiceName}>{service.name}</Text>
                <Text style={styles.moreServiceDescription}>{service.description}</Text>
            </View>
            <Ionicons
                name={service.hasExternal ? "open-outline" : "chevron-forward"}
                size={20}
                color={COLORS.gray400}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.walmartBlue} />

            {/* Enhanced Header with Real Cart Integration */}
            <LinearGradient colors={[COLORS.walmartBlue, COLORS.walmartDarkBlue]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>Services</Text>
                            <Text style={styles.headerSubtitle}>Everything you need, all in one place</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => enhancedNavigate('/(modals)/cart', 'Shopping Cart', 'View and manage your cart items.')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.cartIconContainer}>
                                <Ionicons name="cart-outline" size={24} color={COLORS.white} />
                                {summary.itemCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{summary.itemCount}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.cartTotal}>${summary.total.toFixed(2)}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Enhanced Search Section */}
            <Animated.View
                style={[
                    styles.searchSection,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={COLORS.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.gray400}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Shop by Category Section */}
                <View style={styles.categoriesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Browse Categories</Text>
                        <TouchableOpacity onPress={() => enhancedNavigate('/category', 'All Categories', 'Browse all product categories')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {shopByCategories.map(renderCategory)}
                    </View>
                </View>

                {/* Quick Actions Section */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map(renderQuickAction)}
                    </View>
                </View>

                {/* More Services Section */}
                <View style={styles.moreServicesSection}>
                    <Text style={styles.sectionTitle}>More Services</Text>
                    <View style={styles.moreServicesList}>
                        {moreServices.map(renderMoreService)}
                    </View>
                </View>

                {/* Enhanced Store Hours Section */}
                <View style={styles.storeHoursSection}>
                    <Text style={styles.storeHoursTitle}>Store Hours</Text>
                    <View style={styles.storeHoursList}>
                        {[
                            { day: 'Monday - Sunday', hours: '6:00 AM - 11:00 PM', icon: 'storefront' },
                            { day: 'Pharmacy', hours: '9:00 AM - 9:00 PM', icon: 'medical' },
                            { day: 'Auto Center', hours: '7:00 AM - 7:00 PM', icon: 'car-sport' },
                            { day: 'Vision Center', hours: '9:00 AM - 7:00 PM', icon: 'eye' },
                        ].map((schedule, index) => (
                            <View key={index} style={styles.storeHoursRow}>
                                <View style={styles.storeHoursLeft}>
                                    <Ionicons name={schedule.icon} size={16} color={COLORS.walmartBlue} />
                                    <Text style={styles.storeHoursDay}>{schedule.day}</Text>
                                </View>
                                <Text style={styles.storeHoursTime}>{schedule.hours}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.storeHoursLink}
                        onPress={() => enhancedNavigate('/store/locator', 'Store Locator', 'Find store hours and services near you.')}
                    >
                        <Ionicons name="location" size={16} color={COLORS.walmartBlue} />
                        <Text style={styles.storeHoursLinkText}>Find Store Hours Near You</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.walmartBlue} />
                    </TouchableOpacity>
                </View>

                {/* Enhanced Help Section */}
                <View style={styles.helpSection}>
                    <LinearGradient colors={[COLORS.gray50, COLORS.white]} style={styles.helpGradient}>
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
                                    onPress={() => enhancedNavigate('/support/contact', 'Customer Support', 'Call 1-800-WALMART for assistance.')}
                                >
                                    <Ionicons name="call" size={16} color={COLORS.white} />
                                    <Text style={styles.helpButtonPrimaryText}>Call Support</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.helpButtonSecondary}
                                    onPress={() => enhancedNavigate('/support/chat', 'Live Chat', 'Chat support available 24/7 on walmart.com.')}
                                >
                                    <Ionicons name="chatbubble" size={16} color={COLORS.walmartBlue} />
                                    <Text style={styles.helpButtonSecondaryText}>Live Chat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Bottom Spacing */}
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

    // Header Styles
    header: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.md,
    },
    backButton: {
        padding: SPACING.sm,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.xxxl,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '500',
        textAlign: 'center',
    },
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        minWidth: 80,
    },
    cartIconContainer: {
        position: 'relative',
        marginRight: SPACING.sm,
    },
    cartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.walmartYellow,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: COLORS.white,
        shadowColor: COLORS.walmartYellow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    cartBadgeText: {
        color: COLORS.gray900,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '800',
        lineHeight: 16,
    },
    cartTotal: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Search Section
    searchSection: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderRadius: 16,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderWidth: 1.5,
        borderColor: COLORS.gray200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: TYPOGRAPHY.md,
        color: COLORS.gray900,
        marginLeft: SPACING.md,
        fontWeight: '500',
    },

    // Section Headers
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        color: COLORS.gray900,
        fontWeight: '800',
        fontSize: TYPOGRAPHY.xl,
        letterSpacing: -0.3,
        marginBottom: SPACING.lg,
    },
    viewAllText: {
        color: COLORS.walmartBlue,
        fontWeight: '700',
        fontSize: TYPOGRAPHY.md,
        letterSpacing: 0.2,
    },

    // Categories Section (Image 1 Pattern)
    categoriesSection: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: SPACING.md,
    },
    categoryCard: {
        width: '31%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.gray100,
        minHeight: 110,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    categoryName: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.gray900,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: SPACING.xs,
        lineHeight: 18,
    },
    categoryCount: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.gray500,
        textAlign: 'center',
        fontWeight: '600',
    },

    // Quick Actions Section (Image 2 Pattern)
    quickActionsSection: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.gray50,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: SPACING.md,
    },
    quickActionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        alignItems: 'center',
        width: '47%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.gray100,
        minHeight: 120,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    quickActionTitle: {
        color: COLORS.gray900,
        fontWeight: '700',
        textAlign: 'center',
        fontSize: TYPOGRAPHY.sm,
        marginBottom: SPACING.xs,
        letterSpacing: 0.1,
    },
    quickActionSubtitle: {
        color: COLORS.gray500,
        fontSize: TYPOGRAPHY.xs,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '500',
    },

    // More Services Section (Image 3 Pattern)
    moreServicesSection: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white,
    },
    moreServicesList: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    moreServiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
        backgroundColor: COLORS.white,
        minHeight: 72,
    },
    moreServiceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.lg,
    },
    moreServiceContent: {
        flex: 1,
        marginRight: SPACING.md,
    },
    moreServiceName: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 4,
        letterSpacing: 0.1,
    },
    moreServiceDescription: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.gray600,
        fontWeight: '500',
        lineHeight: 18,
    },

    // Store Hours Section
    storeHoursSection: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        borderRadius: 16,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    storeHoursTitle: {
        color: COLORS.gray900,
        fontWeight: '800',
        fontSize: TYPOGRAPHY.lg,
        marginBottom: SPACING.lg,
        letterSpacing: -0.2,
    },
    storeHoursList: {
        gap: SPACING.sm,
    },
    storeHoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.gray50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    storeHoursLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storeHoursDay: {
        color: COLORS.gray900,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.sm,
        marginLeft: SPACING.sm,
        letterSpacing: 0.1,
    },
    storeHoursTime: {
        color: COLORS.gray600,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    storeHoursLink: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.blueLight,
        borderRadius: 8,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    storeHoursLinkText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.sm,
        marginHorizontal: SPACING.xs,
        letterSpacing: 0.1,
    },

    // Help Section
    helpSection: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    helpGradient: {
        padding: SPACING.lg,
    },
    helpContent: {
        alignItems: 'center',
    },
    helpIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: COLORS.blueLight,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    helpTitle: {
        color: COLORS.gray900,
        fontWeight: '800',
        fontSize: TYPOGRAPHY.lg,
        marginBottom: SPACING.sm,
        textAlign: 'center',
        letterSpacing: -0.2,
    },
    helpDescription: {
        color: COLORS.gray600,
        textAlign: 'center',
        fontSize: TYPOGRAPHY.sm,
        lineHeight: 20,
        marginBottom: SPACING.lg,
        maxWidth: '90%',
        fontWeight: '500',
    },
    helpButtonsContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        width: '100%',
    },
    helpButtonPrimary: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpButtonPrimaryText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.sm,
        marginLeft: SPACING.xs,
        letterSpacing: 0.1,
    },
    helpButtonSecondary: {
        borderWidth: 1,
        borderColor: COLORS.walmartBlue,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpButtonSecondaryText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.sm,
        marginLeft: SPACING.xs,
        letterSpacing: 0.1,
    },

    // Bottom Spacing
    bottomSpacing: {
        height: SPACING.xl,
    },
});