import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/constants';

// Types
export interface LocationCoords {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
}

export interface LocationData {
    coords: LocationCoords;
    timestamp: number;
}

export interface GeocodeResult {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    name?: string;
    district?: string;
    streetNumber?: string;
    formattedAddress?: string;
}

export interface LocationState {
    location: LocationData | null;
    address: GeocodeResult | null;
    isLoading: boolean;
    isWatching: boolean;
    hasPermission: boolean;
    permissionStatus: Location.PermissionStatus | null;
    error: Error | null;
    lastUpdated: string | null;
}

export interface LocationOptions {
    accuracy?: Location.Accuracy;
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceInterval?: number;
    timeInterval?: number;
    mayShowUserSettingsDialog?: boolean;
    geocode?: boolean;
    saveToStorage?: boolean;
    watchLocation?: boolean;
}

export interface NearbyPlace {
    id: string;
    name: string;
    category: string;
    distance: number;
    latitude: number;
    longitude: number;
    address?: string;
    rating?: number;
    isOpen?: boolean;
}

// Default options
const defaultOptions: LocationOptions = {
    accuracy: Location.Accuracy.Balanced,
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
    distanceInterval: 10, // 10 meters
    timeInterval: 10000, // 10 seconds
    mayShowUserSettingsDialog: true,
    geocode: true,
    saveToStorage: true,
    watchLocation: false,
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Format location for display
const formatLocation = (location: LocationData, address?: GeocodeResult): string => {
    if (address?.formattedAddress) {
        return address.formattedAddress;
    }

    if (address?.city && address?.region) {
        return `${address.city}, ${address.region}`;
    }

    return `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
};

export function useLocation(options: LocationOptions = {}) {
    const opts = { ...defaultOptions, ...options };

    const [locationState, setLocationState] = useState<LocationState>({
        location: null,
        address: null,
        isLoading: false,
        isWatching: false,
        hasPermission: false,
        permissionStatus: null,
        error: null,
        lastUpdated: null,
    });

    const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
    const lastLocationRef = useRef<LocationData | null>(null);

    // Load saved location from storage
    const loadSavedLocation = useCallback(async () => {
        if (!opts.saveToStorage) return;

        try {
            const savedLocation = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PERMISSION);
            if (savedLocation) {
                const parsedLocation: LocationData = JSON.parse(savedLocation);
                setLocationState(prev => ({
                    ...prev,
                    location: parsedLocation,
                    lastUpdated: new Date(parsedLocation.timestamp).toISOString(),
                }));
                lastLocationRef.current = parsedLocation;
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
        }
    }, [opts.saveToStorage]);

    // Save location to storage
    const saveLocation = useCallback(async (location: LocationData) => {
        if (!opts.saveToStorage) return;

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_PERMISSION, JSON.stringify(location));
        } catch (error) {
            console.error('Error saving location:', error);
        }
    }, [opts.saveToStorage]);

    // Request location permissions
    const requestPermissions = useCallback(async (): Promise<boolean> => {
        try {
            setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

            // Check current permission status
            const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

            if (currentStatus === Location.PermissionStatus.GRANTED) {
                setLocationState(prev => ({
                    ...prev,
                    hasPermission: true,
                    permissionStatus: currentStatus,
                    isLoading: false,
                }));
                return true;
            }

            // Request permissions
            const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

            const hasPermission = newStatus === Location.PermissionStatus.GRANTED;

            setLocationState(prev => ({
                ...prev,
                hasPermission,
                permissionStatus: newStatus,
                isLoading: false,
            }));

            if (!hasPermission) {
                const error = new Error('Location permission denied');
                setLocationState(prev => ({ ...prev, error }));

                // Show settings dialog if permission was denied
                if (newStatus === Location.PermissionStatus.DENIED && opts.mayShowUserSettingsDialog) {
                    Alert.alert(
                        'Location Permission Required',
                        'Please enable location services in your device settings to use this feature.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                }
            }

            return hasPermission;
        } catch (error) {
            const locationError = error instanceof Error ? error : new Error('Permission request failed');
            setLocationState(prev => ({
                ...prev,
                error: locationError,
                isLoading: false,
                hasPermission: false,
            }));
            return false;
        }
    }, [opts.mayShowUserSettingsDialog]);

    // Reverse geocode coordinates to address
    const reverseGeocode = useCallback(async (coords: LocationCoords): Promise<GeocodeResult | null> => {
        if (!opts.geocode) return null;

        try {
            const results = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
            });

            if (results.length > 0) {
                const result = results[0];
                const geocodeResult: GeocodeResult = {
                    street: result.street || undefined,
                    city: result.city || undefined,
                    region: result.region || undefined,
                    postalCode: result.postalCode || undefined,
                    country: result.country || undefined,
                    name: result.name || undefined,
                    district: result.district || undefined,
                    streetNumber: result.streetNumber || undefined,
                };

                // Create formatted address
                const addressParts = [
                    result.streetNumber,
                    result.street,
                    result.city,
                    result.region,
                    result.postalCode,
                ].filter(Boolean);

                geocodeResult.formattedAddress = addressParts.join(', ');

                return geocodeResult;
            }
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
        }

        return null;
    }, [opts.geocode]);

    // Get current location
    const getCurrentLocation = useCallback(async (forceRefresh: boolean = false): Promise<LocationData | null> => {
        try {
            // Check if we have a recent location and don't need to refresh
            if (!forceRefresh && lastLocationRef.current) {
                const timeSinceLastUpdate = Date.now() - lastLocationRef.current.timestamp;
                if (timeSinceLastUpdate < (opts.maximumAge || 300000)) {
                    return lastLocationRef.current;
                }
            }

            setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

            // Check permissions first
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                setLocationState(prev => ({ ...prev, isLoading: false }));
                return null;
            }

            // Get current position
            const locationResult = await Location.getCurrentPositionAsync({
                accuracy: opts.accuracy,
                mayShowUserSettingsDialog: opts.mayShowUserSettingsDialog,
            });

            const locationData: LocationData = {
                coords: {
                    latitude: locationResult.coords.latitude,
                    longitude: locationResult.coords.longitude,
                    altitude: locationResult.coords.altitude,
                    accuracy: locationResult.coords.accuracy,
                    altitudeAccuracy: locationResult.coords.altitudeAccuracy,
                    heading: locationResult.coords.heading,
                    speed: locationResult.coords.speed,
                },
                timestamp: locationResult.timestamp,
            };

            // Reverse geocode if enabled
            const address = await reverseGeocode(locationData.coords);

            // Update state
            setLocationState(prev => ({
                ...prev,
                location: locationData,
                address,
                isLoading: false,
                lastUpdated: new Date().toISOString(),
            }));

            // Save to storage
            await saveLocation(locationData);
            lastLocationRef.current = locationData;

            return locationData;
        } catch (error) {
            const locationError = error instanceof Error ? error : new Error('Failed to get location');
            setLocationState(prev => ({
                ...prev,
                error: locationError,
                isLoading: false,
            }));
            return null;
        }
    }, [opts.accuracy, opts.maximumAge, opts.mayShowUserSettingsDialog, requestPermissions, reverseGeocode, saveLocation]);

    // Start watching location
    const startWatching = useCallback(async (): Promise<boolean> => {
        try {
            // Check permissions first
            const hasPermission = await requestPermissions();
            if (!hasPermission) return false;

            // Stop existing subscription
            if (watchSubscriptionRef.current) {
                watchSubscriptionRef.current.remove();
            }

            setLocationState(prev => ({ ...prev, isWatching: true, error: null }));

            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: opts.accuracy,
                    timeInterval: opts.timeInterval,
                    distanceInterval: opts.distanceInterval,
                    mayShowUserSettingsDialog: opts.mayShowUserSettingsDialog,
                },
                async (locationResult) => {
                    const locationData: LocationData = {
                        coords: {
                            latitude: locationResult.coords.latitude,
                            longitude: locationResult.coords.longitude,
                            altitude: locationResult.coords.altitude,
                            accuracy: locationResult.coords.accuracy,
                            altitudeAccuracy: locationResult.coords.altitudeAccuracy,
                            heading: locationResult.coords.heading,
                            speed: locationResult.coords.speed,
                        },
                        timestamp: locationResult.timestamp,
                    };

                    // Reverse geocode if enabled
                    const address = await reverseGeocode(locationData.coords);

                    // Update state
                    setLocationState(prev => ({
                        ...prev,
                        location: locationData,
                        address,
                        lastUpdated: new Date().toISOString(),
                    }));

                    // Save to storage
                    await saveLocation(locationData);
                    lastLocationRef.current = locationData;
                }
            );

            watchSubscriptionRef.current = subscription;
            return true;
        } catch (error) {
            const locationError = error instanceof Error ? error : new Error('Failed to start watching location');
            setLocationState(prev => ({
                ...prev,
                error: locationError,
                isWatching: false,
            }));
            return false;
        }
    }, [opts.accuracy, opts.timeInterval, opts.distanceInterval, opts.mayShowUserSettingsDialog, requestPermissions, reverseGeocode, saveLocation]);

    // Stop watching location
    const stopWatching = useCallback(() => {
        if (watchSubscriptionRef.current) {
            watchSubscriptionRef.current.remove();
            watchSubscriptionRef.current = null;
        }
        setLocationState(prev => ({ ...prev, isWatching: false }));
    }, []);

    // Calculate distance from current location
    const getDistanceFrom = useCallback((targetLat: number, targetLon: number): number | null => {
        if (!locationState.location) return null;

        return calculateDistance(
            locationState.location.coords.latitude,
            locationState.location.coords.longitude,
            targetLat,
            targetLon
        );
    }, [locationState.location]);

    // Get nearby places (mock implementation - replace with actual API)
    const getNearbyPlaces = useCallback(async (
        category: string,
        radius: number = 5
    ): Promise<NearbyPlace[]> => {
        if (!locationState.location) {
            throw new Error('Current location not available');
        }

        // Mock implementation - replace with actual places API
        const mockPlaces: NearbyPlace[] = [
            {
                id: '1',
                name: 'Walmart Supercenter',
                category: 'retail',
                distance: 2.5,
                latitude: locationState.location.coords.latitude + 0.01,
                longitude: locationState.location.coords.longitude + 0.01,
                address: '123 Main St',
                rating: 4.2,
                isOpen: true,
            },
            {
                id: '2',
                name: 'Walmart Neighborhood Market',
                category: 'grocery',
                distance: 1.8,
                latitude: locationState.location.coords.latitude - 0.005,
                longitude: locationState.location.coords.longitude + 0.008,
                address: '456 Oak Ave',
                rating: 4.0,
                isOpen: true,
            },
        ];

        // Filter by radius and category
        return mockPlaces.filter(
            place => place.distance <= radius && place.category.includes(category.toLowerCase())
        );
    }, [locationState.location]);

    // Open location in maps app
    const openInMaps = useCallback((latitude: number, longitude: number, label?: string) => {
        const url = `maps:0,0?q=${latitude},${longitude}${label ? `(${label})` : ''}`;
        Linking.openURL(url).catch(() => {
            // Fallback to Google Maps web
            const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            Linking.openURL(webUrl);
        });
    }, []);

    // Get directions to location
    const getDirections = useCallback((
        targetLat: number,
        targetLon: number,
        mode: 'driving' | 'walking' | 'transit' = 'driving'
    ) => {
        if (!locationState.location) {
            Alert.alert('Error', 'Current location not available');
            return;
        }

        const { latitude: currentLat, longitude: currentLon } = locationState.location.coords;
        let url = '';

        // Try Apple Maps first on iOS, Google Maps on Android
        if (mode === 'driving') {
            url = `maps:?saddr=${currentLat},${currentLon}&daddr=${targetLat},${targetLon}&dirflg=d`;
        } else if (mode === 'walking') {
            url = `maps:?saddr=${currentLat},${currentLon}&daddr=${targetLat},${targetLon}&dirflg=w`;
        } else {
            url = `maps:?saddr=${currentLat},${currentLon}&daddr=${targetLat},${targetLon}&dirflg=r`;
        }

        Linking.openURL(url).catch(() => {
            // Fallback to Google Maps web
            const webUrl = `https://www.google.com/maps/dir/${currentLat},${currentLon}/${targetLat},${targetLon}`;
            Linking.openURL(webUrl);
        });
    }, [locationState.location]);

    // Initialize on mount
    useEffect(() => {
        loadSavedLocation();

        // Auto-start watching if enabled
        if (opts.watchLocation) {
            startWatching();
        } else {
            // Get initial location if not watching
            getCurrentLocation();
        }

        // Cleanup on unmount
        return () => {
            stopWatching();
        };
    }, []);

    return {
        // State
        ...locationState,

        // Location data
        formattedLocation: locationState.location && locationState.address
            ? formatLocation(locationState.location, locationState.address)
            : null,

        // Actions
        getCurrentLocation,
        requestPermissions,
        startWatching,
        stopWatching,

        // Utilities
        getDistanceFrom,
        getNearbyPlaces,
        openInMaps,
        getDirections,
        calculateDistance,

        // Helpers
        isLocationFresh: locationState.location
            ? (Date.now() - locationState.location.timestamp) < (opts.maximumAge || 300000)
            : false,
        coordinates: locationState.location?.coords || null,
        hasRecentLocation: !!lastLocationRef.current,
    };
}