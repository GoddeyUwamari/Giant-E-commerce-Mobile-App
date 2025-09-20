import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Platform,
    StyleSheet,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, Store, StoreInventory } from '../../services/api/apiService';
import { ALL_PRODUCTS, Product } from '../../constants/products/data';

// Walmart brand colors
const COLORS = {
    primary: '#0071CE',
    primaryDark: '#004C91',
    secondary: '#FFC220',
    white: '#FFFFFF',
    black: '#1F2937',
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
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F8FAFC',
};

interface UserLocation {
    latitude: number;
    longitude: number;
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
}

export default function StoreDetailScreen() {
    const params = useLocalSearchParams();
    const storeId = params.storeId as string;
    const productId = params.productId as string | undefined;

    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const queryClient = useQueryClient();

    // Load saved location on mount
    useEffect(() => {
        loadSavedLocation();
    }, []);

    // Fetch all stores to find the specific one
    const {
        data: stores = [],
        isLoading: storesLoading,
        error: storesError,
        refetch: refetchStores,
    } = useQuery({
        queryKey: ['stores', userLocation?.latitude, userLocation?.longitude],
        queryFn: () => apiService.fetchStores(userLocation || undefined),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Find the specific store
    const store = useMemo(() => {
        if (!stores || stores.length === 0) return null;

        // First check for exact ID match
        let foundStore = stores.find(s => s.id === storeId);

        // If not found, try mapping different ID formats
        if (!foundStore) {
            const idMap: { [key: string]: string } = {
                // Old format mappings to new format
                'store_1': 'walmart-main',
                'store_2': 'walmart-neighborhood-milpitas',
                'store_3': 'walmart-san-jose',
                'store_4': 'walmart-pickup-mountain-view',

                // Handle both old and new format mappings
                'walmart-neighborhood-1': 'walmart-neighborhood-milpitas',
                'walmart-supercenter-2': 'walmart-san-jose',
                'walmart-pickup-1': 'walmart-pickup-mountain-view',
                'walmart-fremont': 'walmart-fremont',

                // Add reverse mappings for fallback data
                'walmart-main': 'walmart-main',
                'walmart-neighborhood-milpitas': 'walmart-neighborhood-milpitas',
                'walmart-san-jose': 'walmart-san-jose',
                'walmart-pickup-mountain-view': 'walmart-pickup-mountain-view'
            };

            const mappedId = idMap[storeId];
            if (mappedId) {
                foundStore = stores.find(s => s.id === mappedId);
            }

            // If still not found and we have Google Places IDs, try partial matching
            if (!foundStore && storeId) {
                // Try to find by store name or other identifiers
                foundStore = stores.find(s =>
                    s.storeNumber === storeId ||
                    s.name.toLowerCase().includes(storeId.toLowerCase()) ||
                    s.address?.city?.toLowerCase().includes(storeId.toLowerCase())
                );
            }
        }

        console.log('Store ID being searched:', storeId);
        console.log('Available store IDs:', stores.map(s => s.id));
        console.log('Found store:', foundStore?.name || 'Not found');

        return foundStore;
    }, [stores, storeId]);

    // Fetch product availability if productId is provided
    const { data: productAvailability } = useQuery({
        queryKey: ['product-availability', productId, store?.id],
        queryFn: () => apiService.fetchProductAvailability(productId!, [store!.id]),
        enabled: !!productId && !!store,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Get store's available products
    const storeProducts = useMemo(() => {
        if (!store || !ALL_PRODUCTS) return [];
        return ALL_PRODUCTS.filter(product =>
            product.storeId === store.id || product.storeId === 'walmart-main'
        );
    }, [store]);

    const loadSavedLocation = async () => {
        try {
            const savedLocation = await AsyncStorage.getItem('user_location');
            if (savedLocation) {
                setUserLocation(JSON.parse(savedLocation));
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
        }
    };

    const calculateDistance = (
        from: UserLocation,
        to: { latitude: number; longitude: number }
    ): number => {
        const R = 3959; // Earth's radius in miles
        const dLat = (to.latitude - from.latitude) * Math.PI / 180;
        const dLon = (to.longitude - from.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetchStores();
        if (productId && store) {
            queryClient.invalidateQueries({
                queryKey: ['product-availability', productId, store.id]
            });
        }
        setRefreshing(false);
    };

    const handleDirections = () => {
        if (!store) return;

        const { latitude, longitude } = store.coordinates;

        if (Platform.OS === 'ios') {
            Linking.openURL(`maps://app?daddr=${latitude},${longitude}&dirflg=d&t=m`);
        } else {
            Linking.openURL(`google.navigation:q=${latitude},${longitude}&mode=d`);
        }
    };

    const handleCall = () => {
        if (!store) return;

        const phoneNumber = store.phone.replace(/[^\d]/g, '');
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleShare = async () => {
        if (!store) return;

        try {
            await Share.share({
                message: `Check out ${store.name} at ${store.address.fullAddress}. ${store.phone}`,
                title: store.name,
            });
        } catch (error) {
            console.error('Error sharing store:', error);
        }
    };

    const getStoreTypeBadgeStyle = (storeType: string) => {
        switch (storeType) {
            case 'Supercenter':
                return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
            case 'Neighborhood Market':
                return { backgroundColor: '#D1FAE5', color: '#047857' };
            case 'Pickup Only':
                return { backgroundColor: '#FED7AA', color: '#9A3412' };
            case 'Express':
                return { backgroundColor: '#FCE7F3', color: '#BE185D' };
            default:
                return { backgroundColor: COLORS.gray100, color: COLORS.gray700 };
        }
    };

    const getCurrentDayHours = (store: Store) => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = dayNames[new Date().getDay()];
        return store.hours[currentDay];
    };

    const formatHours = (hours: { [key: string]: { open: string; close: string; isOpen: boolean } }) => {
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return dayOrder.map((day, index) => ({
            day: dayLabels[index],
            hours: hours[day] ? `${hours[day].open} - ${hours[day].close}` : 'Closed',
            isToday: day === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()],
        }));
    };

    const getProductAvailabilityInfo = () => {
        if (!productId || !productAvailability || productAvailability.length === 0) {
            return null;
        }

        const availability = productAvailability[0];
        return availability;
    };

    const renderProductAvailability = () => {
        const availability = getProductAvailabilityInfo();
        if (!availability) return null;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Availability</Text>
                <View style={[
                    styles.availabilityCard,
                    availability.inStock ? styles.inStockCard : styles.outOfStockCard
                ]}>
                    <View style={styles.availabilityHeader}>
                        <Ionicons
                            name={availability.inStock ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={availability.inStock ? COLORS.success : COLORS.error}
                        />
                        <Text style={[
                            styles.availabilityStatus,
                            availability.inStock ? styles.inStockText : styles.outOfStockText
                        ]}>
                            {availability.inStock ? 'In Stock' : 'Out of Stock'}
                        </Text>
                    </View>
                    {availability.quantity && availability.inStock && (
                        <Text style={styles.availabilityQuantity}>
                            {availability.quantity}+ available
                        </Text>
                    )}
                    {availability.estimatedAvailability && !availability.inStock && (
                        <Text style={styles.availabilityEstimate}>
                            Estimated availability: {availability.estimatedAvailability}
                        </Text>
                    )}
                    <Text style={styles.availabilityUpdated}>
                        Last updated: {new Date(availability.lastUpdated).toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    };

    // Loading state
    if (storesLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading store details...</Text>
            </SafeAreaView>
        );
    }

    // Error state
    if (storesError || !store) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="storefront" size={64} color={COLORS.gray400} />
                <Text style={styles.errorTitle}>Store Not Found</Text>
                <Text style={styles.errorMessage}>
                    {storesError
                        ? "We're having trouble loading store information. Please try again."
                        : "The store you're looking for could not be found. It may have been moved or closed."
                    }
                </Text>
                <View style={styles.errorActions}>
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.errorButton, styles.errorButtonSecondary]}
                        onPress={() => refetchStores()}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.errorButtonText, styles.errorButtonTextSecondary]}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const distance = userLocation ? calculateDistance(userLocation, store.coordinates) : null;
    const todayHours = getCurrentDayHours(store);
    const formattedHours = formatHours(store.hours);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Store Details</Text>
                </View>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    activeOpacity={0.7}
                >
                    <Ionicons name="share" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Store Header Card */}
                <View style={styles.storeCard}>
                    <View style={styles.storeHeader}>
                        <View style={styles.storeHeaderInfo}>
                            <View style={styles.storeNameRow}>
                                <Text style={styles.storeName}>{store.name}</Text>
                                <View style={[styles.storeTypeBadge, getStoreTypeBadgeStyle(store.storeType)]}>
                                    <Text style={[styles.storeTypeBadgeText, { color: getStoreTypeBadgeStyle(store.storeType).color }]}>
                                        {store.storeType}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.storeNumber}>Store #{store.storeNumber}</Text>
                            <View style={styles.storeMetaRow}>
                                <Ionicons name="star" size={16} color={COLORS.warning} />
                                <Text style={styles.storeRating}>
                                    {store.rating} ({store.reviewCount.toLocaleString()} reviews)
                                </Text>
                                {distance && (
                                    <>
                                        <Text style={styles.storeDivider}>•</Text>
                                        <Text style={styles.storeDistance}>
                                            {distance.toFixed(1)} mi away
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            store.isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed
                        ]}>
                            <Text style={[
                                styles.statusBadgeText,
                                store.isOpen ? styles.statusBadgeTextOpen : styles.statusBadgeTextClosed
                            ]}>
                                {store.isOpen ? 'Open' : 'Closed'}
                            </Text>
                        </View>
                    </View>

                    {/* Current Hours */}
                    {todayHours && (
                        <View style={styles.currentHours}>
                            <Ionicons name="time" size={16} color={COLORS.primary} />
                            <Text style={styles.currentHoursText}>
                                {store.isOpen
                                    ? `Open until ${todayHours.close}`
                                    : `Opens at ${todayHours.open}`
                                }
                            </Text>
                        </View>
                    )}

                    {/* Store Features */}
                    <View style={styles.storeFeatures}>
                        {store.pickupAvailable && (
                            <View style={styles.featureBadge}>
                                <Ionicons name="car" size={14} color={COLORS.primary} />
                                <Text style={styles.featureBadgeText}>Pickup</Text>
                            </View>
                        )}
                        {store.deliveryAvailable && (
                            <View style={styles.featureBadge}>
                                <Ionicons name="bicycle" size={14} color={COLORS.success} />
                                <Text style={styles.featureBadgeText}>Delivery</Text>
                            </View>
                        )}
                        {store.curbsideAvailable && (
                            <View style={styles.featureBadge}>
                                <Ionicons name="flash" size={14} color={COLORS.warning} />
                                <Text style={styles.featureBadgeText}>Curbside</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Product Availability */}
                {renderProductAvailability()}

                {/* Contact & Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact & Location</Text>
                    <View style={styles.contactCard}>
                        <View style={styles.contactItem}>
                            <Ionicons name="location" size={20} color={COLORS.primary} />
                            <View style={styles.contactText}>
                                <Text style={styles.contactLabel}>Address</Text>
                                <Text style={styles.contactValue}>{store.address.street}</Text>
                                <Text style={styles.contactValue}>
                                    {store.address.city}, {store.address.state} {store.address.zipCode}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.contactItem}>
                            <Ionicons name="call" size={20} color={COLORS.primary} />
                            <View style={styles.contactText}>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>{store.phone}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Store Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Store Hours</Text>
                    <View style={styles.hoursCard}>
                        {formattedHours.map((dayInfo, index) => (
                            <View key={index} style={[
                                styles.hoursRow,
                                dayInfo.isToday && styles.todayRow
                            ]}>
                                <Text style={[
                                    styles.dayLabel,
                                    dayInfo.isToday && styles.todayLabel
                                ]}>
                                    {dayInfo.day}
                                </Text>
                                <Text style={[
                                    styles.hoursText,
                                    dayInfo.isToday && styles.todayHours
                                ]}>
                                    {dayInfo.hours}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Services */}
                {store.services.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Services</Text>
                        <View style={styles.servicesGrid}>
                            {store.services.map((service, index) => (
                                <View key={index} style={styles.serviceItem}>
                                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                                    <Text style={styles.serviceText}>{service}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Features */}
                {store.features.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Store Features</Text>
                        <View style={styles.servicesGrid}>
                            {store.features.map((feature, index) => (
                                <View key={index} style={styles.serviceItem}>
                                    <Ionicons name="star" size={16} color={COLORS.warning} />
                                    <Text style={styles.serviceText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Store Stats */}
                {(store.currentCapacity || store.estimatedWaitTime) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Current Status</Text>
                        <View style={styles.statsRow}>
                            {store.currentCapacity && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{store.currentCapacity}%</Text>
                                    <Text style={styles.statLabel}>Capacity</Text>
                                </View>
                            )}
                            {store.estimatedWaitTime && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{store.estimatedWaitTime} min</Text>
                                    <Text style={styles.statLabel}>Wait Time</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={handleDirections}
                    activeOpacity={0.8}
                >
                    <Ionicons name="navigate" size={20} color={COLORS.white} />
                    <Text style={styles.directionsButtonText}>Get Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.callButton}
                    onPress={handleCall}
                    activeOpacity={0.8}
                >
                    <Ionicons name="call" size={20} color={COLORS.primary} />
                    <Text style={styles.callButtonText}>Call Store</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    errorActions: {
        width: '100%',
        gap: 12,
    },
    errorButton: {
        backgroundColor: '#0071CE',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 14,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    errorButtonSecondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#0071CE',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    errorButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    errorButtonTextSecondary: {
        color: '#0071CE',
    },

    // Header
    header: {
        backgroundColor: '#0071CE',
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    // Scroll Content
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Store Card
    storeCard: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        marginBottom: 8,
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    storeHeaderInfo: {
        flex: 1,
        marginRight: 12,
    },
    storeNameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        flexWrap: 'wrap',
        gap: 8,
    },
    storeName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        minWidth: 200,
        lineHeight: 26,
    },
    storeNumber: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    storeTypeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    storeTypeBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    storeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    storeRating: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    storeDivider: {
        color: '#9CA3AF',
        marginHorizontal: 4,
        fontSize: 12,
    },
    storeDistance: {
        color: '#0071CE',
        fontSize: 14,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        minWidth: 70,
        alignItems: 'center',
        elevation: 2,
    },
    statusBadgeOpen: {
        backgroundColor: '#D1FAE5',
        shadowColor: '#10B981',
        shadowOpacity: 0.2,
    },
    statusBadgeClosed: {
        backgroundColor: '#FEE2E2',
        shadowColor: '#EF4444',
        shadowOpacity: 0.2,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusBadgeTextOpen: {
        color: '#047857',
    },
    statusBadgeTextClosed: {
        color: '#DC2626',
    },
    currentHours: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 16,
        gap: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#0071CE',
        elevation: 1,
    },
    currentHoursText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    storeFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    featureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 6,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        elevation: 1,
    },
    featureBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0071CE',
    },

    // Sections
    section: {
        marginHorizontal: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },

    // Product Availability
    availabilityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inStockCard: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    outOfStockCard: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    availabilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    availabilityStatus: {
        fontSize: 16,
        fontWeight: '700',
    },
    inStockText: {
        color: '#10B981',
    },
    outOfStockText: {
        color: '#EF4444',
    },
    availabilityQuantity: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    availabilityEstimate: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    availabilityUpdated: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },

    // Contact & Location
    contactCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        gap: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    contactText: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
        lineHeight: 22,
    },

    // Store Hours
    hoursCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        gap: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    todayRow: {
        backgroundColor: '#F0F9FF',
        marginHorizontal: -16,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderBottomColor: 'transparent',
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    dayLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        minWidth: 40,
    },
    todayLabel: {
        color: '#0071CE',
        fontWeight: '700',
    },
    hoursText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    todayHours: {
        color: '#0071CE',
        fontWeight: '700',
    },

    // Services & Features
    servicesGrid: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
    },
    serviceText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
        flex: 1,
    },

    // Store Stats
    statsRow: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0071CE',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    // Action Buttons
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 32,
        flexDirection: 'row',
        gap: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#0071CE',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    directionsButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    callButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: '#0071CE',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    callButtonText: {
        color: '#0071CE',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },
});