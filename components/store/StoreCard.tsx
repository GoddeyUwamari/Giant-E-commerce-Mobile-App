import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StoreLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    distance: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    storeType: 'supercenter' | 'neighborhood' | 'express';
    services: string[];
    rating: number;
    reviewCount: number;
    image?: string;
    hasGrocery: boolean;
    hasPharmacy: boolean;
    hasGasStation: boolean;
    hasPickup: boolean;
    hasDelivery: boolean;
}

interface StoreCardProps {
    store: StoreLocation;
    onPress?: (store: StoreLocation) => void;
    onDirectionsPress?: (store: StoreLocation) => void;
    onCallPress?: (store: StoreLocation) => void;
    onServicesPress?: (store: StoreLocation) => void;
    showDistance?: boolean;
    showServices?: boolean;
    compact?: boolean;
}

export default function StoreCard({
                                      store,
                                      onPress,
                                      onDirectionsPress,
                                      onCallPress,
                                      onServicesPress,
                                      showDistance = true,
                                      showServices = true,
                                      compact = false,
                                  }: StoreCardProps): JSX.Element {
    const getStoreTypeColor = (type: string) => {
        switch (type) {
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

    const getStoreTypeLabel = (type: string) => {
        switch (type) {
            case 'supercenter':
                return 'Supercenter';
            case 'neighborhood':
                return 'Neighborhood Market';
            case 'express':
                return 'Express';
            default:
                return 'Store';
        }
    };

    const formatDistance = (distance: number) => {
        if (distance < 1) {
            return `${(distance * 5280).toFixed(0)} ft`;
        }
        return `${distance.toFixed(1)} mi`;
    };

    const renderStoreImage = () => {
        if (compact) return null;

        return (
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri: store.image || 'https://via.placeholder.com/120x80/0071ce/ffffff?text=Walmart'
                    }}
                    style={styles.storeImage}
                    resizeMode="cover"
                />
                {!store.isOpen && (
                    <View style={styles.closedOverlay}>
                        <Text style={styles.closedText}>CLOSED</Text>
                    </View>
                )}
                {showDistance && (
                    <View style={styles.distanceBadge}>
                        <Text style={styles.distanceBadgeText}>
                            {formatDistance(store.distance)}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderStoreInfo = () => (
        <View style={compact ? styles.compactInfoContainer : styles.infoContainer}>
            <View style={styles.headerRow}>
                <View style={styles.nameSection}>
                    <View style={styles.nameRow}>
                        <Text style={compact ? styles.compactStoreName : styles.storeName}>
                            {store.name}
                        </Text>
                        <View
                            style={[
                                styles.storeTypeBadge,
                                { backgroundColor: `${getStoreTypeColor(store.storeType)}20` }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.storeTypeText,
                                    { color: getStoreTypeColor(store.storeType) }
                                ]}
                            >
                                {getStoreTypeLabel(store.storeType)}
                            </Text>
                        </View>
                    </View>

                    <Text style={compact ? styles.compactAddress : styles.address}>
                        {store.address}
                    </Text>
                    <Text style={compact ? styles.compactAddress : styles.address}>
                        {store.city}, {store.state} {store.zipCode}
                    </Text>
                </View>

                {showDistance && compact && (
                    <View style={styles.compactDistanceContainer}>
                        <Text style={styles.compactDistanceText}>
                            {formatDistance(store.distance)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.statusRow}>
                <View style={styles.statusLeft}>
                    <View style={styles.openStatus}>
                        <Ionicons
                            name="time"
                            size={14}
                            color={store.isOpen ? "#10B981" : "#EF4444"}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                { color: store.isOpen ? "#10B981" : "#EF4444" }
                            ]}
                        >
                            {store.isOpen ? "Open" : "Closed"}
                        </Text>
                    </View>
                    <Text style={styles.hoursText}>
                        {store.openTime} - {store.closeTime}
                    </Text>
                </View>

                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>
                        {store.rating} ({store.reviewCount})
                    </Text>
                </View>
            </View>

            {showServices && !compact && (
                <View style={styles.servicesContainer}>
                    {store.hasGrocery && (
                        <View style={[styles.serviceBadge, styles.groceryBadge]}>
                            <Text style={styles.groceryText}>Grocery</Text>
                        </View>
                    )}
                    {store.hasPharmacy && (
                        <View style={[styles.serviceBadge, styles.pharmacyBadge]}>
                            <Text style={styles.pharmacyText}>Pharmacy</Text>
                        </View>
                    )}
                    {store.hasGasStation && (
                        <View style={[styles.serviceBadge, styles.gasBadge]}>
                            <Text style={styles.gasText}>Gas</Text>
                        </View>
                    )}
                    {store.hasPickup && (
                        <View style={[styles.serviceBadge, styles.pickupBadge]}>
                            <Text style={styles.pickupText}>Pickup</Text>
                        </View>
                    )}
                    {store.hasDelivery && (
                        <View style={[styles.serviceBadge, styles.deliveryBadge]}>
                            <Text style={styles.deliveryText}>Delivery</Text>
                        </View>
                    )}
                </View>
            )}

            {!compact && (
                <View style={styles.actionsRow}>
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
            )}

            {compact && (
                <View style={styles.compactActionsRow}>
                    <TouchableOpacity
                        style={styles.compactAction}
                        onPress={() => onDirectionsPress?.(store)}
                    >
                        <Ionicons name="navigate" size={16} color="#2563EB" />
                        <Text style={styles.compactDirectionsText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.compactAction}
                        onPress={() => onCallPress?.(store)}
                    >
                        <Ionicons name="call" size={16} color="#374151" />
                        <Text style={styles.compactCallText}>Call</Text>
                    </TouchableOpacity>

                    {showServices && (
                        <TouchableOpacity
                            style={styles.compactAction}
                            onPress={() => onServicesPress?.(store)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={16} color="#6B7280" />
                            <Text style={styles.compactMoreText}>More</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <TouchableOpacity
            style={[styles.cardContainer, compact && styles.compactCardContainer]}
            onPress={() => onPress?.(store)}
            activeOpacity={0.7}
        >
            {compact ? (
                <View style={styles.compactLayout}>
                    <View style={styles.compactIconContainer}>
                        <Ionicons name="storefront" size={24} color="#2563EB" />
                        {!store.isOpen && (
                            <View style={styles.compactClosedOverlay}>
                                <Text style={styles.compactClosedText}>CLOSED</Text>
                            </View>
                        )}
                    </View>
                    {renderStoreInfo()}
                </View>
            ) : (
                <View>
                    {renderStoreImage()}
                    {renderStoreInfo()}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Card Container
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
    },
    compactCardContainer: {
        padding: 16,
    },

    // Layout
    compactLayout: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    // Image
    imageContainer: {
        position: 'relative',
    },
    storeImage: {
        width: '100%',
        height: 80,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    closedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closedText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    distanceBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    distanceBadgeText: {
        color: '#111827',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Compact Icon
    compactIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#DBEAFE',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        position: 'relative',
    },
    compactClosedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactClosedText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Info Container
    infoContainer: {
        padding: 16,
    },
    compactInfoContainer: {
        flex: 1,
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    nameSection: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    storeName: {
        fontWeight: 'bold',
        color: '#111827',
        fontSize: 16,
    },
    compactStoreName: {
        fontWeight: 'bold',
        color: '#111827',
        fontSize: 14,
    },
    storeTypeBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    storeTypeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    address: {
        color: '#6B7280',
        fontSize: 14,
    },
    compactAddress: {
        color: '#6B7280',
        fontSize: 12,
    },
    compactDistanceContainer: {
        marginLeft: 8,
    },
    compactDistanceText: {
        color: '#2563EB',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Status Row
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    openStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    statusText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    hoursText: {
        color: '#6B7280',
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#6B7280',
        fontSize: 12,
        marginLeft: 4,
    },

    // Services
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    serviceBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    groceryBadge: {
        backgroundColor: '#DCFCE7',
    },
    groceryText: {
        color: '#15803D',
        fontSize: 12,
        fontWeight: '500',
    },
    pharmacyBadge: {
        backgroundColor: '#FEE2E2',
    },
    pharmacyText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '500',
    },
    gasBadge: {
        backgroundColor: '#FED7AA',
    },
    gasText: {
        color: '#EA580C',
        fontSize: 12,
        fontWeight: '500',
    },
    pickupBadge: {
        backgroundColor: '#DBEAFE',
    },
    pickupText: {
        color: '#1D4ED8',
        fontSize: 12,
        fontWeight: '500',
    },
    deliveryBadge: {
        backgroundColor: '#E9D5FF',
    },
    deliveryText: {
        color: '#7C3AED',
        fontSize: 12,
        fontWeight: '500',
    },

    // Actions
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingVertical: 12,
        marginRight: 8,
    },
    callButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 12,
        marginLeft: 8,
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

    // Compact Actions
    compactActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    compactAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactDirectionsText: {
        color: '#2563EB',
        fontWeight: '500',
        marginLeft: 4,
        fontSize: 14,
    },
    compactCallText: {
        color: '#374151',
        fontWeight: '500',
        marginLeft: 4,
        fontSize: 14,
    },
    compactMoreText: {
        color: '#6B7280',
        fontWeight: '500',
        marginLeft: 4,
        fontSize: 14,
    },
});