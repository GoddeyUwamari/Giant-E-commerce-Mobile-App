import React, { useState, useEffect } from 'react';
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
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Store {
    id: string;
    name: string;
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
    openUntil?: string;
    opensAt?: string;
    services: string[];
    storeType: 'Supercenter' | 'Neighborhood Market' | 'Pickup Only';
    features: string[];
}

interface UserLocation {
    latitude: number;
    longitude: number;
    address?: string;
}

// Mock stores data - replace with actual API call
const mockStores: Store[] = [
    {
        id: 'store_1',
        name: 'Walmart Supercenter',
        address: {
            street: '4700 Kearny Mesa Rd',
            city: 'San Diego',
            state: 'CA',
            zipCode: '92111',
            fullAddress: '4700 Kearny Mesa Rd, San Diego, CA 92111',
        },
        phone: '(858) 279-6845',
        coordinates: { latitude: 32.8197, longitude: -117.1411 },
        distance: 2.3,
        rating: 4.2,
        reviewCount: 1847,
        isOpen: true,
        openUntil: '11:00 PM',
        services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup'],
        storeType: 'Supercenter',
        features: ['24/7 ATM', 'Free WiFi', 'Garden Center', 'Photo Center'],
    },
    {
        id: 'store_2',
        name: 'Walmart Neighborhood Market',
        address: {
            street: '8745 Villa La Jolla Dr',
            city: 'La Jolla',
            state: 'CA',
            zipCode: '92037',
            fullAddress: '8745 Villa La Jolla Dr, La Jolla, CA 92037',
        },
        phone: '(858) 622-0090',
        coordinates: { latitude: 32.8328, longitude: -117.2713 },
        distance: 5.7,
        rating: 4.0,
        reviewCount: 892,
        isOpen: false,
        opensAt: '6:00 AM',
        services: ['Pharmacy', 'Grocery Pickup'],
        storeType: 'Neighborhood Market',
        features: ['Fresh Produce', 'Deli', 'Bakery'],
    },
    {
        id: 'store_3',
        name: 'Walmart Supercenter',
        address: {
            street: '220 Towne Centre Pkwy',
            city: 'Santee',
            state: 'CA',
            zipCode: '92071',
            fullAddress: '220 Towne Centre Pkwy, Santee, CA 92071',
        },
        phone: '(619) 449-6215',
        coordinates: { latitude: 32.8583, longitude: -116.9739 },
        distance: 8.2,
        rating: 4.1,
        reviewCount: 2156,
        isOpen: true,
        openUntil: '11:00 PM',
        services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Money Services'],
        storeType: 'Supercenter',
        features: ['Garden Center', 'Tire & Lube', 'McDonald\'s'],
    },
    {
        id: 'store_4',
        name: 'Walmart Pickup Point',
        address: {
            street: '1605 Hotel Cir N',
            city: 'San Diego',
            state: 'CA',
            zipCode: '92108',
            fullAddress: '1605 Hotel Cir N, San Diego, CA 92108',
        },
        phone: '(619) 291-7730',
        coordinates: { latitude: 32.7685, longitude: -117.1664 },
        distance: 3.1,
        rating: 4.5,
        reviewCount: 234,
        isOpen: true,
        openUntil: '8:00 PM',
        services: ['Grocery Pickup', 'Online Order Pickup'],
        storeType: 'Pickup Only',
        features: ['Curbside Pickup', 'Express Pickup'],
    },
];

const storeFilters = [
    { id: 'all', label: 'All Stores', icon: 'storefront' },
    { id: 'Supercenter', label: 'Supercenters', icon: 'business' },
    { id: 'Neighborhood Market', label: 'Markets', icon: 'basket' },
    { id: 'Pickup Only', label: 'Pickup', icon: 'car' },
];

const serviceFilters = [
    { id: 'Pharmacy', label: 'Pharmacy', icon: 'medical' },
    { id: 'Auto Center', label: 'Auto Center', icon: 'car-sport' },
    { id: 'Vision Center', label: 'Vision', icon: 'glasses' },
    { id: 'Grocery Pickup', label: 'Pickup', icon: 'bag' },
];

export default function StoreLocatorPage(): JSX.Element {
    const [stores, setStores] = useState<Store[]>([]);
    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStoreFilter, setSelectedStoreFilter] = useState('all');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadStores();
        loadSavedLocation();
    }, []);

    useEffect(() => {
        filterStores();
    }, [stores, selectedStoreFilter, selectedServices, searchQuery, userLocation]);

    const loadStores = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/stores');
            // const storesData = await response.json();
            // setStores(storesData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStores(mockStores);
        } catch (error) {
            console.error('Error loading stores:', error);
            Alert.alert('Error', 'Failed to load stores');
        } finally {
            setIsLoading(false);
        }
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
                Alert.alert('Permission Denied', 'Location permission is required to find nearby stores.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            const newLocation: UserLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address: reverseGeocode[0] ?
                    `${reverseGeocode[0].city}, ${reverseGeocode[0].region}` :
                    undefined,
            };

            setUserLocation(newLocation);
            await AsyncStorage.setItem('user_location', JSON.stringify(newLocation));

            // Calculate distances for stores
            const updatedStores = stores.map(store => ({
                ...store,
                distance: calculateDistance(newLocation, store.coordinates),
            }));
            setStores(updatedStores);
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get your location');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const calculateDistance = (from: UserLocation, to: { latitude: number; longitude: number }): number => {
        const R = 3959; // Earth's radius in miles
        const dLat = (to.latitude - from.latitude) * Math.PI / 180;
        const dLon = (to.longitude - from.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const filterStores = () => {
        let filtered = stores;

        // Filter by store type
        if (selectedStoreFilter !== 'all') {
            filtered = filtered.filter(store => store.storeType === selectedStoreFilter);
        }

        // Filter by services
        if (selectedServices.length > 0) {
            filtered = filtered.filter(store =>
                selectedServices.some(service => store.services.includes(service))
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(store =>
                store.name.toLowerCase().includes(query) ||
                store.address.city.toLowerCase().includes(query) ||
                store.address.zipCode.includes(query) ||
                store.address.street.toLowerCase().includes(query)
            );
        }

        // Sort by distance if user location is available
        if (userLocation) {
            filtered = filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setFilteredStores(filtered);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStores();
        if (userLocation) {
            await getCurrentLocation();
        }
        setRefreshing(false);
    };

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const handleStoreSelect = (store: Store) => {
        router.push(`/store/${store.id}`);
    };

    const handleDirections = (store: Store) => {
        const { latitude, longitude } = store.coordinates;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url);
    };

    const handleCall = (store: Store) => {
        const phoneNumber = store.phone.replace(/[^\d]/g, '');
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const clearFilters = () => {
        setSelectedStoreFilter('all');
        setSelectedServices([]);
        setSearchQuery('');
    };

    const getStoreTypeBadgeStyle = (storeType: string) => {
        switch (storeType) {
            case 'Supercenter':
                return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
            case 'Neighborhood Market':
                return { backgroundColor: '#D1FAE5', color: '#047857' };
            case 'Pickup Only':
                return { backgroundColor: '#FED7AA', color: '#9A3412' };
            default:
                return { backgroundColor: '#F3F4F6', color: '#374151' };
        }
    };

    const renderStoreCard = ({ item: store }: { item: Store }) => (
        <TouchableOpacity
            style={styles.storeCard}
            onPress={() => handleStoreSelect(store)}
        >
            {/* Store Header */}
            <View style={styles.storeHeader}>
                <View style={styles.storeHeaderInfo}>
                    <View style={styles.storeNameRow}>
                        <Text style={styles.storeName}>
                            {store.name}
                        </Text>
                        <View style={[styles.storeTypeBadge, getStoreTypeBadgeStyle(store.storeType)]}>
                            <Text style={[styles.storeTypeBadgeText, { color: getStoreTypeBadgeStyle(store.storeType).color }]}>
                                {store.storeType}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.storeAddress}>
                        {store.address.street}
                    </Text>
                    <Text style={styles.storeAddress}>
                        {store.address.city}, {store.address.state} {store.address.zipCode}
                    </Text>
                    <View style={styles.storeMetaRow}>
                        <Ionicons name="star" size={14} color="#FCD34D" />
                        <Text style={styles.storeRating}>
                            {store.rating} ({store.reviewCount})
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
                    {store.isOpen
                        ? `Open until ${store.openUntil}`
                        : `Opens at ${store.opensAt}`
                    }
                </Text>
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
                >
                    <View style={styles.buttonContent}>
                        <Ionicons name="navigate" size={16} color="white" />
                        <Text style={styles.directionsButtonText}>Directions</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(store)}
                >
                    <View style={styles.buttonContent}>
                        <Ionicons name="call" size={16} color="#374151" />
                        <Text style={styles.callButtonText}>Call</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

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
                        >
                            <View style={styles.filterButtonContent}>
                                <Ionicons
                                    name={filter.icon as any}
                                    size={16}
                                    color={selectedStoreFilter === filter.id ? 'white' : '#374151'}
                                />
                                <Text style={[
                                    styles.filterButtonText,
                                    selectedStoreFilter === filter.id
                                        ? styles.filterButtonTextSelected
                                        : styles.filterButtonTextUnselected
                                ]}>
                                    {filter.label}
                                </Text>
                            </View>
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
                    >
                        <View style={styles.filterButtonContent}>
                            <Ionicons
                                name={service.icon as any}
                                size={16}
                                color={selectedServices.includes(service.id) ? 'white' : '#374151'}
                            />
                            <Text style={[
                                styles.filterButtonText,
                                selectedServices.includes(service.id)
                                    ? styles.filterButtonTextSelected
                                    : styles.filterButtonTextUnselected
                            ]}>
                                {service.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Clear Filters */}
            {(selectedStoreFilter !== 'all' || selectedServices.length > 0) && (
                <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={clearFilters}
                >
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004C98" />
                <Text style={styles.loadingText}>Finding stores near you...</Text>
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
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Store Locator
                    </Text>
                    <TouchableOpacity
                        style={styles.filtersToggle}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons name="options" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search and Location */}
            <View style={styles.searchSection}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by city, ZIP code, or address"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        placeholderTextColor="#9CA3AF"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
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
                    >
                        {isLoadingLocation ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <View style={styles.useLocationButtonContent}>
                                <Ionicons name="location" size={16} color="white" />
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
                    {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} found
                    {userLocation ? ' near you' : ''}
                </Text>
            </View>

            {/* Stores List */}
            {filteredStores.length === 0 ? (
                <ScrollView
                    style={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.emptyContentContainer}
                >
                    <View style={styles.emptyState}>
                        <Ionicons name="storefront" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>
                            No stores found
                        </Text>
                        <Text style={styles.emptyMessage}>
                            Try adjusting your search or filters to find stores in your area.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={clearFilters}
                        >
                            <Text style={styles.emptyButtonText}>Clear Filters</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={filteredStores}
                    renderItem={renderStoreCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
        backgroundColor: '#F7F8FA',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 8,
        fontSize: 16,
    },

    // Header
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        marginRight: 12,
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
    },
    filtersToggle: {
        padding: 8,
    },

    // Search Section
    searchSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: '#111827',
        fontSize: 16,
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
        color: '#6B7280',
        fontSize: 14,
    },
    locationTextEmpty: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    useLocationButton: {
        backgroundColor: '#004C98',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    useLocationButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    useLocationButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
        marginLeft: 4,
        fontSize: 14,
    },

    // Filters
    filtersContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    filterScrollView: {
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
    },
    filterButton: {
        marginRight: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterButtonSelected: {
        backgroundColor: '#004C98',
        borderColor: '#004C98',
    },
    filterButtonUnselected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
    },
    filterButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterButtonText: {
        marginLeft: 8,
        fontWeight: '500',
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
    },
    serviceFilterButton: {
        marginRight: 12,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    serviceFilterButtonSelected: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    serviceFilterButtonUnselected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
    },
    clearFiltersButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
    },
    clearFiltersText: {
        color: '#374151',
        fontWeight: '500',
    },

    // Results Header
    resultsHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    resultsText: {
        color: '#6B7280',
        fontSize: 14,
    },

    // Store Cards
    storeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    storeHeaderInfo: {
        flex: 1,
    },
    storeNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    storeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    storeTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    storeTypeBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    storeAddress: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 2,
    },
    storeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    storeRating: {
        color: '#6B7280',
        fontSize: 14,
        marginLeft: 4,
    },
    storeDivider: {
        color: '#9CA3AF',
        marginHorizontal: 8,
    },
    storeDistance: {
        color: '#6B7280',
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusBadgeOpen: {
        backgroundColor: '#D1FAE5',
    },
    statusBadgeClosed: {
        backgroundColor: '#FEE2E2',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusBadgeTextOpen: {
        color: '#047857',
    },
    statusBadgeTextClosed: {
        color: '#DC2626',
    },
    storeHours: {
        marginBottom: 12,
    },
    storeHoursText: {
        color: '#6B7280',
        fontSize: 14,
    },

    // Services
    servicesContainer: {
        marginBottom: 12,
    },
    servicesRow: {
        flexDirection: 'row',
    },
    serviceTag: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginRight: 8,
    },
    serviceTagText: {
        color: '#374151',
        fontSize: 12,
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#004C98',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    callButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    directionsButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
        marginLeft: 4,
    },
    callButtonText: {
        color: '#374151',
        fontWeight: '500',
        marginLeft: 4,
    },

    // List Container
    listContainer: {
        padding: 16,
    },

    // Empty State
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
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMessage: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 16,
        lineHeight: 24,
    },
    emptyButton: {
        backgroundColor: '#004C98',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});