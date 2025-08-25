import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Linking,
    Platform,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Mock store data - replace with actual API data
const mockStores = [
    {
        id: '1',
        name: 'Walmart Supercenter',
        address: '123 Main Street, New York, NY 10001',
        phone: '(555) 123-4567',
        distance: '0.8 miles',
        isOpen: true,
        hours: {
            today: '6:00 AM - 11:00 PM',
            week: {
                'Mon-Sun': '6:00 AM - 11:00 PM',
            }
        },
        services: ['Pharmacy', 'Grocery Pickup', 'Auto Center', 'Vision Center'],
        coordinates: {
            latitude: 40.7831,
            longitude: -73.9712,
        },
        rating: 4.2,
        reviews: 1248,
    },
    {
        id: '2',
        name: 'Walmart Neighborhood Market',
        address: '456 Oak Avenue, New York, NY 10002',
        phone: '(555) 234-5678',
        distance: '1.2 miles',
        isOpen: false,
        hours: {
            today: 'Closed',
            week: {
                'Mon-Sat': '6:00 AM - 10:00 PM',
                'Sunday': '7:00 AM - 9:00 PM',
            }
        },
        services: ['Pharmacy', 'Grocery Pickup'],
        coordinates: {
            latitude: 40.7589,
            longitude: -73.9851,
        },
        rating: 4.0,
        reviews: 892,
    },
    {
        id: '3',
        name: 'Walmart Supercenter',
        address: '789 Broadway, New York, NY 10003',
        phone: '(555) 345-6789',
        distance: '2.1 miles',
        isOpen: true,
        hours: {
            today: '6:00 AM - 11:00 PM',
            week: {
                'Mon-Sun': '6:00 AM - 11:00 PM',
            }
        },
        services: ['Pharmacy', 'Grocery Pickup', 'Auto Center', 'Vision Center', 'Garden Center'],
        coordinates: {
            latitude: 40.7505,
            longitude: -73.9934,
        },
        rating: 4.5,
        reviews: 2156,
    },
];

interface Store {
    id: string;
    name: string;
    address: string;
    phone: string;
    distance: string;
    isOpen: boolean;
    hours: {
        today: string;
        week: Record<string, string>;
    };
    services: string[];
    coordinates: {
        latitude: number;
        longitude: number;
    };
    rating: number;
    reviews: number;
}

export default function StoreFinderModal(): JSX.Element {
    const [searchQuery, setSearchQuery] = useState('');
    const [stores, setStores] = useState<Store[]>(mockStores);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [viewType, setViewType] = useState<'list' | 'map'>('list');
    const [isLoading, setIsLoading] = useState(false);

    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const searchInputRef = useRef<TextInput>(null);

    useEffect(() => {
        getCurrentLocation();
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
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

    useEffect(() => {
        if (selectedStore) {
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedStore]);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission',
                    'Please enable location access to find nearby stores.'
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        } catch (error) {
            console.log('Error getting location:', error);
        }
    };

    const searchStores = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            // TODO: Implement actual store search API
            console.log('Searching for stores near:', searchQuery);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo, filter existing stores
            const filtered = mockStores.filter(store =>
                store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                store.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setStores(filtered);
        } catch (error) {
            Alert.alert('Error', 'Unable to search stores. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const callStore = (phone: string) => {
        const phoneNumber = Platform.OS === 'ios' ? `tel:${phone}` : `tel:${phone}`;
        Linking.openURL(phoneNumber);
    };

    const getDirections = (store: Store) => {
        const { latitude, longitude } = store.coordinates;
        const url = Platform.select({
            ios: `maps:0,0?q=${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}`,
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    const StoreCard = ({ store }: { store: Store }) => (
        <TouchableOpacity
            style={styles.storeCard}
            onPress={() => setSelectedStore(store)}
            activeOpacity={0.8}
        >
            <View style={styles.storeHeader}>
                <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>
                        {store.name}
                    </Text>
                    <Text style={styles.storeAddress}>
                        {store.address}
                    </Text>
                </View>
                <View style={styles.storeMetrics}>
                    <Text style={styles.storeDistance}>
                        {store.distance}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FCD34D" />
                        <Text style={styles.ratingText}>
                            {store.rating} ({store.reviews})
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.storeStatus}>
                <View
                    style={[
                        styles.statusDot,
                        { backgroundColor: store.isOpen ? '#10B981' : '#EF4444' }
                    ]}
                />
                <Text
                    style={[
                        styles.statusText,
                        { color: store.isOpen ? '#059669' : '#DC2626' }
                    ]}
                >
                    {store.isOpen ? 'Open' : 'Closed'} • {store.hours.today}
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.servicesContainer}
                contentContainerStyle={styles.servicesContent}
            >
                {store.services.map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                        <Text style={styles.serviceText}>
                            {service}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.storeActions}>
                <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => getDirections(store)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="navigate" size={16} color="white" />
                    <Text style={styles.directionsButtonText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => callStore(store.phone)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="call" size={16} color="#2563EB" />
                    <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.dismiss()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Find Stores</Text>
                    </View>
                    <View style={styles.viewToggle}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                viewType === 'list' && styles.toggleButtonActive
                            ]}
                            onPress={() => setViewType('list')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="list"
                                size={20}
                                color={viewType === 'list' ? '#2563EB' : '#6B7280'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                viewType === 'map' && styles.toggleButtonActive
                            ]}
                            onPress={() => setViewType('map')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="map"
                                size={20}
                                color={viewType === 'map' ? '#2563EB' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Enter ZIP code, city, or address"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={searchStores}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                style={styles.clearSearchButton}
                            >
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.currentLocationButton}
                        onPress={getCurrentLocation}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location" size={16} color="#2563EB" />
                        <Text style={styles.currentLocationText}>
                            Use my current location
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {viewType === 'list' ? (
                    <ScrollView
                        style={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <Animated.View style={styles.loadingSpinner}>
                                    <Ionicons name="refresh" size={24} color="#2563EB" />
                                </Animated.View>
                                <Text style={styles.loadingText}>Searching for stores...</Text>
                            </View>
                        ) : stores.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="location-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyTitle}>
                                    No stores found
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    Try searching with a different location or ZIP code
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.resultsHeader}>
                                    <Text style={styles.resultsCount}>
                                        {stores.length} stores found
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.sortButton}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.sortButtonText}>Sort by</Text>
                                        <Ionicons name="chevron-down" size={16} color="#2563EB" />
                                    </TouchableOpacity>
                                </View>

                                {stores.map((store) => (
                                    <StoreCard key={store.id} store={store} />
                                ))}
                            </>
                        )}
                    </ScrollView>
                ) : (
                    <View style={styles.mapContainer}>
                        {userLocation && (
                            <MapView
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: userLocation.latitude,
                                    longitude: userLocation.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }}
                                showsUserLocation={true}
                                showsMyLocationButton={true}
                                customMapStyle={mapStyle}
                            >
                                {stores.map((store) => (
                                    <Marker
                                        key={store.id}
                                        coordinate={store.coordinates}
                                        title={store.name}
                                        description={store.address}
                                        onPress={() => setSelectedStore(store)}
                                    >
                                        <View style={styles.markerContainer}>
                                            <Ionicons name="storefront" size={20} color="white" />
                                        </View>
                                    </Marker>
                                ))}
                            </MapView>
                        )}

                        {/* Selected Store Bottom Sheet */}
                        {selectedStore && (
                            <Animated.View
                                style={[
                                    styles.bottomSheet,
                                    {
                                        transform: [{ translateY: slideAnim }]
                                    }
                                ]}
                            >
                                <View style={styles.bottomSheetHandle} />
                                <StoreCard store={selectedStore} />
                                <TouchableOpacity
                                    style={styles.closeBottomSheet}
                                    onPress={() => setSelectedStore(null)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.closeBottomSheetText}>Close</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>
                )}
            </Animated.View>
        </SafeAreaView>
    );
}

const mapStyle = [
    {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 2,
    },
    toggleButton: {
        padding: 8,
        borderRadius: 8,
        marginHorizontal: 2,
    },
    toggleButtonActive: {
        backgroundColor: '#EFF6FF',
        elevation: 1,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#ffffff',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#111827',
        fontWeight: '400',
    },
    clearSearchButton: {
        padding: 4,
    },
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },
    currentLocationText: {
        color: '#2563EB',
        fontWeight: '500',
        marginLeft: 8,
        fontSize: 16,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    loadingSpinner: {
        marginBottom: 12,
    },
    loadingText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    resultsCount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    sortButtonText: {
        color: '#2563EB',
        fontWeight: '500',
        marginRight: 4,
        fontSize: 16,
    },
    storeCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    storeInfo: {
        flex: 1,
        marginRight: 12,
    },
    storeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
        lineHeight: 24,
    },
    storeAddress: {
        color: '#6B7280',
        fontSize: 14,
        lineHeight: 20,
    },
    storeMetrics: {
        alignItems: 'flex-end',
    },
    storeDistance: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#6B7280',
        fontSize: 14,
        marginLeft: 4,
    },
    storeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    servicesContainer: {
        marginBottom: 16,
    },
    servicesContent: {
        paddingRight: 16,
    },
    serviceTag: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    serviceText: {
        color: '#1D4ED8',
        fontSize: 12,
        fontWeight: '500',
    },
    storeActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        elevation: 2,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    directionsButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#2563EB',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        backgroundColor: '#ffffff',
    },
    callButtonText: {
        color: '#2563EB',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        backgroundColor: '#2563EB',
        padding: 8,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        maxHeight: height * 0.7,
    },
    bottomSheetHandle: {
        width: 48,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    closeBottomSheet: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    closeBottomSheetText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
});