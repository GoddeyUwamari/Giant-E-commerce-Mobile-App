import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    Linking,
    Platform,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Constants from 'expo-constants';
import { apiService } from '../../services/api/apiService';

// Import product data integration
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

// Enhanced Store interface with product integration
interface Store {
    id: string;
    name: string;
    storeNumber: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        fullAddress: string;
    };
    phone: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    distance?: number;
    rating: number;
    reviewCount: number;
    isOpen: boolean;
    hours: {
        [key: string]: { open: string; close: string; isOpen: boolean };
    };
    services: string[];
    storeType: 'Supercenter' | 'Neighborhood Market' | 'Pickup Only' | 'Express';
    features: string[];
    availableProducts?: number;
    popularCategories?: string[];
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
    curbsideAvailable: boolean;
    currentCapacity?: number;
    estimatedWaitTime?: number;
    lastUpdated: string;
}

interface UserLocation {
    latitude: number;
    longitude: number;
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
}

interface StoreInventory {
    storeId: string;
    productId: string;
    inStock: boolean;
    quantity?: number;
    lastUpdated: string;
    estimatedAvailability?: 'high' | 'medium' | 'low';
    error?: string;
}

// API configuration
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'https://api.walmart.com';

// Enhanced store filters with product integration
const storeFilters = [
    { id: 'all', label: 'All Stores', icon: 'storefront' },
    { id: 'Supercenter', label: 'Supercenters', icon: 'business' },
    { id: 'Neighborhood Market', label: 'Markets', icon: 'basket' },
    { id: 'Pickup Only', label: 'Pickup', icon: 'car' },
    { id: 'Express', label: 'Express', icon: 'flash' },
];

const serviceFilters = [
    { id: 'Pharmacy', label: 'Pharmacy', icon: 'medical' },
    { id: 'Auto Center', label: 'Auto Center', icon: 'car-sport' },
    { id: 'Vision Center', label: 'Vision', icon: 'glasses' },
    { id: 'Grocery Pickup', label: 'Pickup', icon: 'bag' },
    { id: 'Money Services', label: 'Money Services', icon: 'card' },
    { id: 'Photo Center', label: 'Photo', icon: 'camera' },
    { id: 'Garden Center', label: 'Garden', icon: 'leaf' },
    { id: 'Tire & Lube', label: 'Auto Service', icon: 'construct' },
];

const featureFilters = [
    { id: 'pickupAvailable', label: 'Curbside Pickup', icon: 'car' },
    { id: 'deliveryAvailable', label: 'Delivery', icon: 'bicycle' },
    { id: 'curbsideAvailable', label: 'Express Pickup', icon: 'flash' },
];

export default function StoreLocatorScreen() {
    const params = useLocalSearchParams<{
        productId?: string;
        category?: string;
        searchProduct?: string;
    }>();

    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStoreFilter, setSelectedStoreFilter] = useState('all');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');

    const queryClient = useQueryClient();


    // Load saved location on mount
    useEffect(() => {
        loadSavedLocation();
    }, []);

    // Fetch stores data with React Query - Updated to use apiService
    const {
        data: stores = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['stores',
            userLocation?.latitude ? Math.round(userLocation.latitude * 100) / 100 : null,
            userLocation?.longitude ? Math.round(userLocation.longitude * 100) / 100 : null
        ],
        queryFn: () => fetchStores(userLocation),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: true,
    });

    const storeIds = useMemo(() => stores.map(s => s.id), [stores]);

    // Updated product availability query using apiService
    const { data: productAvailability } = useQuery({
        queryKey: ['product-availability', params.productId, storeIds],
        queryFn: () => apiService.fetchProductAvailability(params.productId!, storeIds),
        enabled: !!params.productId && stores.length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2, // Reduce retries since we have fallback
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });


    const fetchStores = async (location: UserLocation | null): Promise<Store[]> => {
        try {
            console.log('🔍 Calling apiService.fetchStores with location:', location);
            const apiStores = await apiService.fetchStores(location || undefined);

            // ADD THESE DEBUG LOGS HERE:
            console.log('📊 Raw stores from Firebase:', apiStores.length, apiStores);
            console.log('📊 First store example:', JSON.stringify(apiStores[0], null, 2));

            // Enhance stores with product data integration
            const enhancedStores = apiStores.map(store => ({
                ...store,
                availableProducts: getAvailableProductsForStore(store.id),
                popularCategories: getPopularCategoriesForStore(store.id),
                distance: location ? calculateDistance(location, store.coordinates) : undefined,
            }));

            return enhancedStores;
        } catch (error) {
            console.error('Error fetching stores:', error);
            // Fallback to enhanced mock data if API fails
            return getEnhancedMockStores(location);
        }
    };

    // Enhanced mock data with product integration
    const getEnhancedMockStores = (location: UserLocation | null): Store[] => {
        const mockStores: Store[] = [
            {
                id: 'walmart-main',
                name: 'Walmart Supercenter',
                storeNumber: '4700',
                address: {
                    street: '4700 Kearny Mesa Rd',
                    city: 'San Diego',
                    state: 'CA',
                    zipCode: '92111',
                    fullAddress: '4700 Kearny Mesa Rd, San Diego, CA 92111',
                },
                phone: '(858) 279-6845',
                coordinates: { latitude: 32.8197, longitude: -117.1411 },
                rating: 4.2,
                reviewCount: 1847,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup', 'Photo Center'],
                storeType: 'Supercenter',
                features: ['24/7 ATM', 'Free WiFi', 'Garden Center', 'McDonald\'s'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 85,
                estimatedWaitTime: 5,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-neighborhood-1',
                name: 'Walmart Neighborhood Market',
                storeNumber: '8745',
                address: {
                    street: '8745 Villa La Jolla Dr',
                    city: 'La Jolla',
                    state: 'CA',
                    zipCode: '92037',
                    fullAddress: '8745 Villa La Jolla Dr, La Jolla, CA 92037',
                },
                phone: '(858) 622-0090',
                coordinates: { latitude: 32.8328, longitude: -117.2713 },
                rating: 4.0,
                reviewCount: 892,
                isOpen: false,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: false },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: false },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: false },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: false },
                    friday: { open: '6:00 AM', close: '12:00 AM', isOpen: false },
                    saturday: { open: '6:00 AM', close: '12:00 AM', isOpen: false },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: false },
                },
                services: ['Pharmacy', 'Grocery Pickup'],
                storeType: 'Neighborhood Market',
                features: ['Fresh Produce', 'Deli', 'Bakery'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: false,
                currentCapacity: 0,
                estimatedWaitTime: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-supercenter-2',
                name: 'Walmart Supercenter',
                storeNumber: '2201',
                address: {
                    street: '220 Towne Centre Pkwy',
                    city: 'Santee',
                    state: 'CA',
                    zipCode: '92071',
                    fullAddress: '220 Towne Centre Pkwy, Santee, CA 92071',
                },
                phone: '(619) 449-6215',
                coordinates: { latitude: 32.8583, longitude: -116.9739 },
                rating: 4.1,
                reviewCount: 2156,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '12:00 AM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '12:00 AM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Money Services', 'Garden Center'],
                storeType: 'Supercenter',
                features: ['Garden Center', 'Tire & Lube', 'McDonald\'s', 'Free WiFi'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 72,
                estimatedWaitTime: 3,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-pickup-1',
                name: 'Walmart Pickup Point',
                storeNumber: '1605',
                address: {
                    street: '1605 Hotel Cir N',
                    city: 'San Diego',
                    state: 'CA',
                    zipCode: '92108',
                    fullAddress: '1605 Hotel Cir N, San Diego, CA 92108',
                },
                phone: '(619) 291-7730',
                coordinates: { latitude: 32.7685, longitude: -117.1664 },
                rating: 4.5,
                reviewCount: 234,
                isOpen: true,
                hours: {
                    monday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    tuesday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    wednesday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    thursday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    friday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    saturday: { open: '8:00 AM', close: '8:00 PM', isOpen: true },
                    sunday: { open: '8:00 AM', close: '6:00 PM', isOpen: true },
                },
                services: ['Grocery Pickup', 'Online Order Pickup'],
                storeType: 'Pickup Only',
                features: ['Curbside Pickup', 'Express Pickup'],
                pickupAvailable: true,
                deliveryAvailable: false,
                curbsideAvailable: true,
                currentCapacity: 95,
                estimatedWaitTime: 2,
                lastUpdated: new Date().toISOString(),
            },
        ];

        return mockStores.map(store => ({
            ...store,
            availableProducts: getAvailableProductsForStore(store.id),
            popularCategories: getPopularCategoriesForStore(store.id),
            distance: location ? calculateDistance(location, store.coordinates) : undefined,
        }));
    };

    // Product integration helpers
    const getAvailableProductsForStore = (storeId: string): number => {
        return ALL_PRODUCTS?.filter(product =>
            product.storeId === storeId || product.storeId === 'walmart-main'
        ).length || 0;
    };

    const getPopularCategoriesForStore = (storeId: string): string[] => {
        const storeProducts = ALL_PRODUCTS?.filter(product =>
            product.storeId === storeId || product.storeId === 'walmart-main'
        ) || [];

        const categoryCount: { [key: string]: number } = {};
        storeProducts.forEach(product => {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        });

        return Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);
    };

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

    const getCurrentLocation = async () => {
        setIsLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to find nearby stores.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Settings', onPress: () => Linking.openSettings() }
                    ]
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 10000,
            });

            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            const geocode = reverseGeocode[0];
            const newLocation: UserLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address: geocode ? `${geocode.city}, ${geocode.region}` : undefined,
                city: geocode?.city,
                state: geocode?.region,
                zipCode: geocode?.postalCode,
            };

            setUserLocation(newLocation);
            await AsyncStorage.setItem('user_location', JSON.stringify(newLocation));

            // Trigger stores refetch with new location
            queryClient.invalidateQueries({ queryKey: ['stores'] });
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get your location. Please try again.');
        } finally {
            setIsLoadingLocation(false);
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

    const filteredAndSortedStores = useMemo(() => {
        console.log('🔍 Starting with stores:', stores.length);
        let filtered = stores;

        // Filter by store type
        if (selectedStoreFilter !== 'all') {
            console.log('🔍 Before store type filter:', filtered.length);
            filtered = filtered.filter(store => store.storeType === selectedStoreFilter);
            console.log('🔍 After store type filter:', filtered.length, 'selectedFilter:', selectedStoreFilter);
        }

        // Filter by services
        if (selectedServices.length > 0) {
            filtered = filtered.filter(store =>
                selectedServices.some(service => store.services.includes(service))
            );
        }

        // Filter by features
        if (selectedFeatures.length > 0) {
            filtered = filtered.filter(store => {
                return selectedFeatures.every(feature => {
                    switch (feature) {
                        case 'pickupAvailable':
                            return store.pickupAvailable;
                        case 'deliveryAvailable':
                            return store.deliveryAvailable;
                        case 'curbsideAvailable':
                            return store.curbsideAvailable;
                        default:
                            return true;
                    }
                });
            });
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(store =>
                store.name.toLowerCase().includes(query) ||
                store.address.city.toLowerCase().includes(query) ||
                store.address.zipCode.includes(query) ||
                store.address.street.toLowerCase().includes(query) ||
                store.storeNumber.includes(query)
            );
        }

        // Filter by product availability if productId provided
        if (params.productId && productAvailability) {
            const availableStoreIds = productAvailability
                .filter(item => item.inStock)
                .map(item => item.storeId);
            filtered = filtered.filter(store => availableStoreIds.includes(store.id));
        }

        // Sort stores
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'distance':
                    return (a.distance || 0) - (b.distance || 0);
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [stores, selectedStoreFilter, selectedServices, selectedFeatures, searchQuery, params.productId, productAvailability, sortBy]);

    // useEffect(() => {
    //     setFilteredStores(filteredAndSortedStores);
    // }, [filteredAndSortedStores]);

    const onRefresh = useCallback(async () => {
        await refetch();
        if (userLocation) {
            queryClient.invalidateQueries({ queryKey: ['stores'] });
        }
    }, [refetch, userLocation, queryClient]);

    const toggleService = useCallback((service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    }, []);

    const toggleFeature = useCallback((feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        );
    }, []);

    const handleStoreSelect = useCallback((store: Store) => {
        router.push({
            pathname: '/store/[id]',
            params: {
                id: store.id,
                ...(params.productId && { productId: params.productId })
            }
        });
    }, [params.productId]);

    const handleDirections = useCallback((store: Store) => {
        const { latitude, longitude } = store.coordinates;

        if (Platform.OS === 'ios') {
            Linking.openURL(`maps://app?daddr=${latitude},${longitude}&dirflg=d&t=m`);
        } else {
            Linking.openURL(`google.navigation:q=${latitude},${longitude}&mode=d`);
        }
    }, []);

    const handleCall = useCallback((store: Store) => {
        const phoneNumber = store.phone.replace(/[^\d]/g, '');
        Linking.openURL(`tel:${phoneNumber}`);
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedStoreFilter('all');
        setSelectedServices([]);
        setSelectedFeatures([]);
        setSearchQuery('');
    }, []);

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

    const getProductAvailabilityText = (store: Store): string => {
        if (params.productId && productAvailability) {
            const availability = productAvailability.find(item => item.storeId === store.id);
            if (availability) {
                if (availability.error) {
                    return 'Availability unknown';
                }
                return availability.inStock
                    ? `In stock${availability.quantity ? ` (${availability.quantity}+ available)` : ''}`
                    : 'Out of stock';
            }
        }
        return `${store.availableProducts?.toLocaleString() || 0} products available`;
    };

    const getStoreHoursText = (store: Store): string => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = dayNames[new Date().getDay()];
        const todayHours = store.hours[currentDay];

        if (store.isOpen && todayHours) {
            return `Open until ${todayHours.close}`;
        } else if (!store.isOpen && todayHours) {
            return `Opens at ${todayHours.open}`;
        }
        return 'Hours not available';
    };

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            {/* Store Type Filters */}
            <Text style={styles.filterSectionTitle}>Store Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                <View style={styles.filterRow}>
                    {storeFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterButton,
                                selectedStoreFilter === filter.id
                                    ? styles.filterButtonSelected
                                    : styles.filterButtonUnselected
                            ]}
                            onPress={() => setSelectedStoreFilter(filter.id)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={filter.icon as any}
                                size={16}
                                color={selectedStoreFilter === filter.id ? COLORS.white : COLORS.gray700}
                            />
                            <Text style={[
                                styles.filterButtonText,
                                selectedStoreFilter === filter.id
                                    ? styles.filterButtonTextSelected
                                    : styles.filterButtonTextUnselected
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Service Filters */}
            <Text style={styles.filterSectionTitle}>Services</Text>
            <View style={styles.serviceFiltersContainer}>
                {serviceFilters.map((service) => (
                    <TouchableOpacity
                        key={service.id}
                        style={[
                            styles.serviceFilterButton,
                            selectedServices.includes(service.id)
                                ? styles.serviceFilterButtonSelected
                                : styles.serviceFilterButtonUnselected
                        ]}
                        onPress={() => toggleService(service.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={service.icon as any}
                            size={16}
                            color={selectedServices.includes(service.id) ? COLORS.white : COLORS.gray700}
                        />
                        <Text style={[
                            styles.filterButtonText,
                            selectedServices.includes(service.id)
                                ? styles.filterButtonTextSelected
                                : styles.filterButtonTextUnselected
                        ]}>
                            {service.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Feature Filters */}
            <Text style={styles.filterSectionTitle}>Features</Text>
            <View style={styles.serviceFiltersContainer}>
                {featureFilters.map((feature) => (
                    <TouchableOpacity
                        key={feature.id}
                        style={[
                            styles.serviceFilterButton,
                            selectedFeatures.includes(feature.id)
                                ? styles.serviceFilterButtonSelected
                                : styles.serviceFilterButtonUnselected
                        ]}
                        onPress={() => toggleFeature(feature.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={feature.icon as any}
                            size={16}
                            color={selectedFeatures.includes(feature.id) ? COLORS.white : COLORS.gray700}
                        />
                        <Text style={[
                            styles.filterButtonText,
                            selectedFeatures.includes(feature.id)
                                ? styles.filterButtonTextSelected
                                : styles.filterButtonTextUnselected
                        ]}>
                            {feature.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sort Options */}
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.sortContainer}>
                {[
                    { id: 'distance', label: 'Distance', icon: 'location' },
                    { id: 'rating', label: 'Rating', icon: 'star' },
                    { id: 'name', label: 'Name', icon: 'text' },
                ].map((sort) => (
                    <TouchableOpacity
                        key={sort.id}
                        style={[
                            styles.sortButton,
                            sortBy === sort.id ? styles.sortButtonSelected : styles.sortButtonUnselected
                        ]}
                        onPress={() => setSortBy(sort.id as any)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={sort.icon as any}
                            size={16}
                            color={sortBy === sort.id ? COLORS.white : COLORS.gray700}
                        />
                        <Text style={[
                            styles.sortButtonText,
                            sortBy === sort.id ? styles.sortButtonTextSelected : styles.sortButtonTextUnselected
                        ]}>
                            {sort.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Clear Filters */}
            {(selectedStoreFilter !== 'all' || selectedServices.length > 0 || selectedFeatures.length > 0 || searchQuery) && (
                <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={clearFilters}
                    activeOpacity={0.8}
                >
                    <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderStoreCard = ({ item: store }: { item: Store }) => {
        const storeProductAvailability = params.productId ?
            productAvailability?.find(item => item.storeId === store.id) : null;

        return (
            <TouchableOpacity
                style={styles.storeCard}
                onPress={() => handleStoreSelect(store)}
                activeOpacity={0.8}
            >
                {/* Store Header */}
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
                        <Text style={styles.storeAddress}>{store.address.street}</Text>
                        <Text style={styles.storeAddress}>
                            {store.address.city}, {store.address.state} {store.address.zipCode}
                        </Text>
                        <View style={styles.storeMetaRow}>
                            <Ionicons name="star" size={14} color={COLORS.warning} />
                            <Text style={styles.storeRating}>
                                {store.rating} ({store.reviewCount.toLocaleString()})
                            </Text>
                            {store.distance && (
                                <>
                                    <Text style={styles.storeDivider}>•</Text>
                                    <Text style={styles.storeDistance}>
                                        {store.distance.toFixed(1)} mi
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

                {/* Store Hours */}
                <View style={styles.storeHours}>
                    <Text style={styles.storeHoursText}>
                        {getStoreHoursText(store)}
                    </Text>
                </View>

                {/* Product Availability */}
                {(params.productId || store.availableProducts) && (
                    <View style={styles.productAvailability}>
                        <Ionicons
                            name={storeProductAvailability?.inStock ? "checkmark-circle" : "cube"}
                            size={16}
                            color={storeProductAvailability?.inStock ? COLORS.success : COLORS.gray500}
                        />
                        <Text style={[
                            styles.productAvailabilityText,
                            storeProductAvailability?.inStock ? styles.inStockText : styles.outOfStockText
                        ]}>
                            {getProductAvailabilityText(store)}
                        </Text>
                    </View>
                )}

                {/* Store Features */}
                <View style={styles.storeFeatures}>
                    {store.pickupAvailable && (
                        <View style={styles.featureBadge}>
                            <Ionicons name="car" size={12} color={COLORS.primary} />
                            <Text style={styles.featureBadgeText}>Pickup</Text>
                        </View>
                    )}
                    {store.deliveryAvailable && (
                        <View style={styles.featureBadge}>
                            <Ionicons name="bicycle" size={12} color={COLORS.success} />
                            <Text style={styles.featureBadgeText}>Delivery</Text>
                        </View>
                    )}
                    {store.curbsideAvailable && (
                        <View style={styles.featureBadge}>
                            <Ionicons name="flash" size={12} color={COLORS.warning} />
                            <Text style={styles.featureBadgeText}>Express</Text>
                        </View>
                    )}
                </View>

                {/* Services */}
                {store.services.length > 0 && (
                    <View style={styles.servicesContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.servicesRow}>
                                {store.services.slice(0, 4).map((service, index) => (
                                    <View key={index} style={styles.serviceTag}>
                                        <Text style={styles.serviceTagText}>{service}</Text>
                                    </View>
                                ))}
                                {store.services.length > 4 && (
                                    <View style={styles.serviceTag}>
                                        <Text style={styles.serviceTagText}>
                                            +{store.services.length - 4} more
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => handleDirections(store)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="navigate" size={16} color={COLORS.white} />
                        <Text style={styles.directionsButtonText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCall(store)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="call" size={16} color={COLORS.gray700} />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.viewStoreButton}
                        onPress={() => handleStoreSelect(store)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="storefront" size={16} color={COLORS.primary} />
                        <Text style={styles.viewStoreButtonText}>View Store</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding stores near you...</Text>
                {userLocation?.city && (
                    <Text style={styles.loadingSubtext}>
                        Searching in {userLocation.city}, {userLocation.state}
                    </Text>
                )}
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="warning" size={64} color={COLORS.error} />
                <Text style={styles.errorTitle}>Unable to Load Stores</Text>
                <Text style={styles.errorMessage}>
                    We're having trouble connecting to our servers. Please check your internet connection and try again.
                </Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => refetch()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Store Locator</Text>
                        {params.productId && (
                            <Text style={styles.headerSubtitle}>
                                Product availability
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.filtersToggle}
                        onPress={() => setShowFilters(!showFilters)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="options" size={24} color={COLORS.white} />
                        {(selectedStoreFilter !== 'all' || selectedServices.length > 0 || selectedFeatures.length > 0) && (
                            <View style={styles.filterIndicator} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search and Location */}
            <View style={styles.searchSection}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by city, ZIP code, or store number"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        placeholderTextColor={COLORS.gray400}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Location Info */}
                <View style={styles.locationRow}>
                    <View style={styles.locationInfo}>
                        {userLocation?.address ? (
                            <Text style={styles.locationText}>
                                Near {userLocation.address}
                            </Text>
                        ) : (
                            <Text style={styles.locationTextEmpty}>
                                Enable location for nearby stores
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.useLocationButton}
                        onPress={getCurrentLocation}
                        disabled={isLoadingLocation}
                        activeOpacity={0.8}
                    >
                        {isLoadingLocation ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <View style={styles.useLocationButtonContent}>
                                <Ionicons name="location" size={16} color={COLORS.white} />
                                <Text style={styles.useLocationButtonText}>Use Location</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters */}
            {showFilters && renderFilters()}

            {/* Results Header */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                    {filteredAndSortedStores.length} store{filteredAndSortedStores.length !== 1 ? 's' : ''} found
                    {userLocation?.city && ` near ${userLocation.city}`}
                </Text>
                {params.productId && (
                    <Text style={styles.resultsSubtext}>
                        Showing stores with product availability
                    </Text>
                )}
            </View>

            {/* Stores List */}
            {filteredAndSortedStores.length === 0 ? (
                <ScrollView
                    style={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    contentContainerStyle={styles.emptyContentContainer}
                >
                    <View style={styles.emptyState}>
                        <Ionicons name="storefront" size={64} color={COLORS.gray400} />
                        <Text style={styles.emptyTitle}>No stores found</Text>
                        <Text style={styles.emptyMessage}>
                            {params.productId
                                ? "No stores have this product in stock nearby. Try expanding your search area or check back later."
                                : "Try adjusting your search or filters to find stores in your area."
                            }
                        </Text>
                        <View style={styles.emptyActions}>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={clearFilters}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.emptyButtonText}>Clear Filters</Text>
                            </TouchableOpacity>
                            {!userLocation && (
                                <TouchableOpacity
                                    style={[styles.emptyButton, styles.emptyButtonSecondary]}
                                    onPress={getCurrentLocation}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.emptyButtonText, styles.emptyButtonTextSecondary]}>
                                        Enable Location
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={filteredAndSortedStores}
                    renderItem={renderStoreCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Main Container
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
        color: '#4B5563',
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    loadingSubtext: {
        color: '#6B7280',
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
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
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    retryButton: {
        backgroundColor: '#0071CE',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
        elevation: 3,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Header
    header: {
        backgroundColor: '#0071CE',
        paddingHorizontal: 16,
        paddingVertical: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
        textAlign: 'center',
    },
    filtersToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        position: 'relative',
    },
    filterIndicator: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFC220',
    },

    // Search Section
    searchSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: '#111827',
        fontSize: 16,
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationInfo: {
        flex: 1,
    },
    locationText: {
        color: '#4B5563',
        fontSize: 14,
        fontWeight: '500',
    },
    locationTextEmpty: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    useLocationButton: {
        backgroundColor: '#0071CE',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        elevation: 2,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    useLocationButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    useLocationButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },

    // Filters
    filtersContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 1,
        maxHeight: 400,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        marginTop: 8,
    },
    filterScrollView: {
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 4,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        minWidth: 100,
    },
    filterButtonSelected: {
        backgroundColor: '#0071CE',
        borderColor: '#0071CE',
        elevation: 4,
        shadowColor: '#0071CE',
        shadowOpacity: 0.3,
        transform: [{ scale: 1.02 }],
    },
    filterButtonUnselected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
    },
    filterButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    filterButtonTextSelected: {
        color: '#FFFFFF',
    },
    filterButtonTextUnselected: {
        color: '#374151',
    },
    serviceFiltersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8,
    },
    serviceFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    serviceFilterButtonSelected: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        elevation: 3,
        shadowColor: '#10B981',
        shadowOpacity: 0.3,
        transform: [{ scale: 1.02 }],
    },
    serviceFilterButtonUnselected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
    },
    sortContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    sortButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1.5,
        gap: 4,
        elevation: 1,
    },
    sortButtonSelected: {
        backgroundColor: '#0071CE',
        borderColor: '#0071CE',
        elevation: 3,
        shadowColor: '#0071CE',
        shadowOpacity: 0.3,
    },
    sortButtonUnselected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
    },
    sortButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    sortButtonTextSelected: {
        color: '#FFFFFF',
    },
    sortButtonTextUnselected: {
        color: '#374151',
    },
    clearFiltersButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        elevation: 1,
    },
    clearFiltersText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },

    // Results Header
    resultsHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 1,
    },
    resultsText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsSubtext: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 2,
    },

    // Store Cards - Enhanced
    storeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
        marginHorizontal: 2,
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    storeHeaderInfo: {
        flex: 1,
        marginRight: 12,
    },
    storeNameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        flexWrap: 'wrap',
        gap: 8,
    },
    storeName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        minWidth: 180,
        lineHeight: 22,
    },
    storeNumber: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    storeTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        elevation: 1,
    },
    storeTypeBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    storeAddress: {
        color: '#4B5563',
        fontSize: 14,
        marginBottom: 2,
        fontWeight: '500',
        lineHeight: 18,
    },
    storeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    storeRating: {
        color: '#4B5563',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 2,
    },
    storeDivider: {
        color: '#9CA3AF',
        marginHorizontal: 6,
        fontSize: 12,
    },
    storeDistance: {
        color: '#0071CE',
        fontSize: 14,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        elevation: 2,
        minWidth: 60,
        alignItems: 'center',
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
    storeHours: {
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#0071CE',
    },
    storeHoursText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },

    // Product Availability - Enhanced
    productAvailability: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        elevation: 1,
    },
    productAvailabilityText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
    inStockText: {
        color: '#10B981',
    },
    outOfStockText: {
        color: '#EF4444',
    },

    // Store Features - Enhanced
    storeFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 14,
        gap: 8,
    },
    featureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        gap: 4,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        elevation: 1,
    },
    featureBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0071CE',
    },

    // Services - Enhanced
    servicesContainer: {
        marginBottom: 16,
    },
    servicesRow: {
        flexDirection: 'row',
        gap: 8,
    },
    serviceTag: {
        backgroundColor: '#EBF8FF',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#93C5FD',
        elevation: 1,
    },
    serviceTagText: {
        color: '#1E40AF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Action Buttons - Enhanced
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#0071CE',
        borderRadius: 10,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        elevation: 3,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    directionsButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
    },
    callButton: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        elevation: 1,
    },
    callButtonText: {
        color: '#374151',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
    },
    viewStoreButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 2,
        borderColor: '#0071CE',
        elevation: 2,
    },
    viewStoreButtonText: {
        color: '#0071CE',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
    },

    // List Container
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },

    // Empty State - Enhanced
    emptyContainer: {
        flex: 1,
    },
    emptyContentContainer: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 28,
    },
    emptyMessage: {
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 16,
        lineHeight: 24,
        maxWidth: 300,
        fontWeight: '500',
    },
    emptyActions: {
        width: '100%',
        gap: 12,
    },
    emptyButton: {
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
    emptyButtonSecondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#0071CE',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    emptyButtonTextSecondary: {
        color: '#0071CE',
    },
});