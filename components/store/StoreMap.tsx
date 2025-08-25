import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Animated,
    StyleSheet,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface StoreLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    distance: number;
    isOpen: boolean;
    storeType: 'supercenter' | 'neighborhood' | 'express';
    hasGrocery: boolean;
    hasPharmacy: boolean;
    hasGasStation: boolean;
    phone: string;
}

interface StoreMapProps {
    stores: StoreLocation[];
    selectedStore?: StoreLocation;
    onStoreSelect?: (store: StoreLocation) => void;
    onDirectionsPress?: (store: StoreLocation) => void;
    onCallPress?: (store: StoreLocation) => void;
    showUserLocation?: boolean;
    showTraffic?: boolean;
    mapType?: 'standard' | 'satellite' | 'hybrid';
    initialRegion?: Region;
    compact?: boolean;
}

export default function StoreMap({
                                     stores,
                                     selectedStore,
                                     onStoreSelect,
                                     onDirectionsPress,
                                     onCallPress,
                                     showUserLocation = true,
                                     showTraffic = false,
                                     mapType = 'standard',
                                     initialRegion,
                                     compact = false,
                                 }: StoreMapProps): JSX.Element {
    const [region, setRegion] = useState<Region>(
        initialRegion || {
            latitude: 39.8283,
            longitude: -98.5795,
            latitudeDelta: 50,
            longitudeDelta: 50,
        }
    );
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [locationPermission, setLocationPermission] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(selectedStore?.id || null);

    const mapRef = useRef<MapView>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showUserLocation) {
            requestLocationPermission();
        } else {
            setLoading(false);
        }
    }, [showUserLocation]);

    useEffect(() => {
        if (selectedStore) {
            setSelectedMarkerId(selectedStore.id);
            animateToStore(selectedStore);
        }
    }, [selectedStore]);

    useEffect(() => {
        if (selectedMarkerId) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        } else {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }
    }, [selectedMarkerId]);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                setLocationPermission(true);
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setUserLocation(location);

                // Center map on user location if no initial region provided
                if (!initialRegion && stores.length > 0) {
                    const newRegion = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    };
                    setRegion(newRegion);
                }
            } else {
                Alert.alert(
                    'Location Permission',
                    'Location permission is needed to show your position on the map.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
        } finally {
            setLoading(false);
        }
    };

    const animateToStore = (store: StoreLocation) => {
        const newRegion = {
            latitude: store.latitude,
            longitude: store.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        };

        mapRef.current?.animateToRegion(newRegion, 1000);
    };

    const handleMarkerPress = (store: StoreLocation) => {
        setSelectedMarkerId(store.id);
        onStoreSelect?.(store);
        animateToStore(store);
    };

    const handleMapPress = () => {
        setSelectedMarkerId(null);
        onStoreSelect?.(undefined);
    };

    const getMarkerColor = (storeType: string) => {
        switch (storeType) {
            case 'supercenter':
                return '#2563EB';
            case 'neighborhood':
                return '#10B981';
            case 'express':
                return '#F59E0B';
            default:
                return '#6B7280';
        }
    };

    const renderCustomMarker = (store: StoreLocation) => (
        <View style={styles.markerContainer}>
            <View
                style={[
                    styles.markerIcon,
                    selectedMarkerId === store.id && styles.markerIconSelected,
                    { backgroundColor: getMarkerColor(store.storeType) }
                ]}
            >
                <Ionicons
                    name="storefront"
                    size={selectedMarkerId === store.id ? 20 : 16}
                    color="white"
                />
            </View>
            {!store.isOpen && (
                <View style={styles.closedIndicator}>
                    <Text style={styles.closedIndicatorText}>!</Text>
                </View>
            )}
        </View>
    );

    const renderStoreInfo = () => {
        const store = stores.find(s => s.id === selectedMarkerId);
        if (!store) return null;

        return (
            <Animated.View
                style={[
                    styles.storeInfoContainer,
                    {
                        transform: [
                            {
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [200, 0],
                                }),
                            },
                        ],
                    }
                ]}
            >
                <View style={styles.storeInfoContent}>
                    <View style={styles.storeInfoHeader}>
                        <View style={styles.storeInfoMain}>
                            <View style={styles.storeNameRow}>
                                <Text style={styles.storeName}>{store.name}</Text>
                                <View
                                    style={[
                                        styles.storeTypeBadge,
                                        { backgroundColor: `${getMarkerColor(store.storeType)}20` }
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.storeTypeBadgeText,
                                            { color: getMarkerColor(store.storeType) }
                                        ]}
                                    >
                                        {store.storeType.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.storeAddress}>
                                {store.address}
                            </Text>
                            <Text style={styles.storeAddress}>
                                {store.city}, {store.state} {store.zipCode}
                            </Text>

                            <View style={styles.storeStatusRow}>
                                <View style={styles.storeStatus}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: store.isOpen ? '#10B981' : '#EF4444' }
                                    ]} />
                                    <Text style={[
                                        styles.statusText,
                                        { color: store.isOpen ? '#10B981' : '#EF4444' }
                                    ]}>
                                        {store.isOpen ? 'Open' : 'Closed'}
                                    </Text>
                                </View>

                                <Text style={styles.distanceText}>
                                    {store.distance.toFixed(1)} mi
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedMarkerId(null)}
                        >
                            <Ionicons name="close" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.directionsButton}
                            onPress={() => onDirectionsPress?.(store)}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="navigate" size={16} color="white" />
                                <Text style={styles.directionsButtonText}>Directions</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => onCallPress?.(store)}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="call" size={16} color="#374151" />
                                <Text style={styles.callButtonText}>Call</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const renderMapControls = () => (
        <View style={styles.mapControls}>
            <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                    if (userLocation) {
                        const newRegion = {
                            latitude: userLocation.coords.latitude,
                            longitude: userLocation.coords.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        };
                        mapRef.current?.animateToRegion(newRegion, 1000);
                    }
                }}
            >
                <Ionicons name="locate" size={20} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                    if (stores.length > 0) {
                        const latitudes = stores.map(s => s.latitude);
                        const longitudes = stores.map(s => s.longitude);

                        const minLat = Math.min(...latitudes);
                        const maxLat = Math.max(...latitudes);
                        const minLng = Math.min(...longitudes);
                        const maxLng = Math.max(...longitudes);

                        const newRegion = {
                            latitude: (minLat + maxLat) / 2,
                            longitude: (minLng + maxLng) / 2,
                            latitudeDelta: (maxLat - minLat) * 1.2,
                            longitudeDelta: (maxLng - minLng) * 1.2,
                        };

                        mapRef.current?.animateToRegion(newRegion, 1000);
                    }
                }}
            >
                <Ionicons name="resize" size={20} color="#2563EB" />
            </TouchableOpacity>
        </View>
    );

    const renderStoreFilter = () => (
        <View style={styles.storeFilter}>
            <View style={styles.filterRow}>
                <TouchableOpacity style={[styles.filterItem, styles.filterItemBorder]}>
                    <View style={styles.filterContent}>
                        <View style={[styles.filterDot, styles.supercenterDot]} />
                        <Text style={styles.filterText}>Supercenter</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterItem, styles.filterItemBorder]}>
                    <View style={styles.filterContent}>
                        <View style={[styles.filterDot, styles.neighborhoodDot]} />
                        <Text style={styles.filterText}>Neighborhood</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterItem}>
                    <View style={styles.filterContent}>
                        <View style={[styles.filterDot, styles.expressDot]} />
                        <Text style={styles.filterText}>Express</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                mapType={mapType}
                showsUserLocation={showUserLocation && locationPermission}
                showsMyLocationButton={false}
                showsTraffic={showTraffic}
                onPress={handleMapPress}
                onRegionChangeComplete={setRegion}
            >
                {stores.map((store) => (
                    <Marker
                        key={store.id}
                        coordinate={{
                            latitude: store.latitude,
                            longitude: store.longitude,
                        }}
                        onPress={() => handleMarkerPress(store)}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        {renderCustomMarker(store)}
                    </Marker>
                ))}
            </MapView>

            {!compact && renderMapControls()}
            {!compact && renderStoreFilter()}
            {renderStoreInfo()}
        </View>
    );
}

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 16,
    },

    // Markers
    markerContainer: {
        alignItems: 'center',
    },
    markerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerIconSelected: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    closedIndicator: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closedIndicatorText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: 16,
    },

    // Store Info
    storeInfoContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    storeInfoContent: {
        padding: 16,
    },
    storeInfoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    storeInfoMain: {
        flex: 1,
    },
    storeNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    storeName: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
    },
    storeTypeBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    storeTypeBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    storeAddress: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 4,
    },
    storeStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    storeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    distanceText: {
        color: '#2563EB',
        fontWeight: 'bold',
        fontSize: 14,
    },
    closeButton: {
        padding: 8,
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingVertical: 12,
    },
    callButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 12,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    directionsButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
        marginLeft: 8,
    },
    callButtonText: {
        color: '#374151',
        fontWeight: '500',
        marginLeft: 8,
    },

    // Map Controls
    mapControls: {
        position: 'absolute',
        top: 16,
        right: 16,
        gap: 8,
    },
    controlButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    // Store Filter
    storeFilter: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterRow: {
        flexDirection: 'row',
    },
    filterItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterItemBorder: {
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    filterContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    supercenterDot: {
        backgroundColor: '#2563EB',
    },
    neighborhoodDot: {
        backgroundColor: '#10B981',
    },
    expressDot: {
        backgroundColor: '#F59E0B',
    },
    filterText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
    },
});