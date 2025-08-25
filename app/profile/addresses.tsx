import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    StyleSheet,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock address data - replace with actual data from your store/API
interface Address {
    id: string;
    type: 'home' | 'work' | 'other';
    label: string;
    name: string;
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    isValidated: boolean;
    deliveryInstructions?: string;
    lastUsed?: string;
}

const mockAddresses: Address[] = [
    {
        id: '1',
        type: 'home',
        label: 'Home',
        name: 'John Smith',
        street: '123 Main Street',
        street2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        phone: '+1 (555) 123-4567',
        isDefault: true,
        isValidated: true,
        deliveryInstructions: 'Leave at front door',
        lastUsed: '2024-01-15',
    },
    {
        id: '2',
        type: 'work',
        label: 'Office',
        name: 'John Smith',
        street: '456 Business Ave',
        street2: 'Suite 200',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'US',
        phone: '+1 (555) 987-6543',
        isDefault: false,
        isValidated: true,
        deliveryInstructions: 'Reception desk',
        lastUsed: '2024-01-10',
    },
    {
        id: '3',
        type: 'other',
        label: 'Mom\'s House',
        name: 'Mary Smith',
        street: '789 Family Lane',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'US',
        phone: '+1 (555) 456-7890',
        isDefault: false,
        isValidated: false,
        lastUsed: '2023-12-25',
    },
];

const addressTypeIcons = {
    home: 'home-outline',
    work: 'business-outline',
    other: 'location-outline',
} as const;

const addressTypeColors = {
    home: { icon: '#10B981', bg: '#D1FAE5' },
    work: { icon: '#3B82F6', bg: '#EBF8FF' },
    other: { icon: '#F59E0B', bg: '#FEF3C7' },
} as const;

export default function AddressesScreen(): JSX.Element {
    const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Implement actual data refresh
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleSetDefault = (addressId: string) => {
        setAddresses(prev =>
            prev.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId
            }))
        );
    };

    const handleDeleteAddress = (addressId: string) => {
        const address = addresses.find(addr => addr.id === addressId);
        if (address?.isDefault) {
            Alert.alert(
                'Cannot Delete',
                'You cannot delete your default address. Please set another address as default first.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
                    }
                }
            ]
        );
    };

    const handleEditAddress = (addressId: string) => {
        // TODO: Navigate to edit address screen with address data
        router.push(`/(modals)/edit-address?id=${addressId}`);
    };

    const handleAddNewAddress = () => {
        // TODO: Navigate to add address screen
        router.push('/(modals)/add-address');
    };

    const formatAddress = (address: Address): string => {
        const parts = [
            address.street,
            address.street2,
            `${address.city}, ${address.state} ${address.zipCode}`
        ].filter(Boolean);
        return parts.join(', ');
    };

    const getLastUsedText = (lastUsed?: string): string => {
        if (!lastUsed) return 'Never used';

        const date = new Date(lastUsed);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Used yesterday';
        if (diffDays < 7) return `Used ${diffDays} days ago`;
        if (diffDays < 30) return `Used ${Math.ceil(diffDays / 7)} weeks ago`;
        return `Used ${Math.ceil(diffDays / 30)} months ago`;
    };

    const renderAddressCard = (address: Address) => {
        const isExpanded = expandedCard === address.id;
        const typeConfig = addressTypeColors[address.type];

        return (
            <View key={address.id} style={styles.addressCard}>
                {/* Header */}
                <TouchableOpacity
                    style={styles.addressHeader}
                    onPress={() => setExpandedCard(isExpanded ? null : address.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.addressHeaderLeft}>
                        <View style={[styles.addressTypeIcon, { backgroundColor: typeConfig.bg }]}>
                            <Ionicons
                                name={addressTypeIcons[address.type]}
                                size={20}
                                color={typeConfig.icon}
                            />
                        </View>
                        <View style={styles.addressHeaderInfo}>
                            <View style={styles.addressLabelRow}>
                                <Text style={styles.addressLabel}>{address.label}</Text>
                                {address.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                    </View>
                                )}
                                {!address.isValidated && (
                                    <View style={styles.warningBadge}>
                                        <Ionicons name="warning" size={12} color="#F59E0B" />
                                        <Text style={styles.warningBadgeText}>Verify</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.addressName}>{address.name}</Text>
                            <Text style={styles.addressSummary} numberOfLines={1}>
                                {formatAddress(address)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.addressHeaderRight}>
                        <Text style={styles.lastUsedText}>{getLastUsedText(address.lastUsed)}</Text>
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#9CA3AF"
                        />
                    </View>
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Full Address */}
                        <View style={styles.fullAddressSection}>
                            <Text style={styles.sectionTitle}>Full Address</Text>
                            <Text style={styles.fullAddressText}>
                                {address.street}
                                {address.street2 && `\n${address.street2}`}
                                {`\n${address.city}, ${address.state} ${address.zipCode}`}
                                {`\n${address.country}`}
                            </Text>
                            {address.phone && (
                                <View style={styles.contactInfo}>
                                    <Ionicons name="call-outline" size={16} color="#6B7280" />
                                    <Text style={styles.contactText}>{address.phone}</Text>
                                </View>
                            )}
                        </View>

                        {/* Delivery Instructions */}
                        {address.deliveryInstructions && (
                            <View style={styles.instructionsSection}>
                                <Text style={styles.sectionTitle}>Delivery Instructions</Text>
                                <Text style={styles.instructionsText}>
                                    {address.deliveryInstructions}
                                </Text>
                            </View>
                        )}

                        {/* Validation Status */}
                        <View style={styles.validationSection}>
                            <View style={styles.validationRow}>
                                <Ionicons
                                    name={address.isValidated ? "checkmark-circle" : "alert-circle"}
                                    size={16}
                                    color={address.isValidated ? "#10B981" : "#F59E0B"}
                                />
                                <Text style={[
                                    styles.validationText,
                                    { color: address.isValidated ? "#10B981" : "#F59E0B" }
                                ]}>
                                    {address.isValidated ? "Address verified" : "Address needs verification"}
                                </Text>
                            </View>
                            {!address.isValidated && (
                                <TouchableOpacity style={styles.verifyButton} activeOpacity={0.7}>
                                    <Text style={styles.verifyButtonText}>Verify Address</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            {!address.isDefault && (
                                <TouchableOpacity
                                    style={styles.setDefaultButton}
                                    onPress={() => handleSetDefault(address.id)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="star-outline" size={16} color="#0071CE" />
                                    <Text style={styles.setDefaultButtonText}>Set as Default</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => handleEditAddress(address.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="create-outline" size={16} color="#6B7280" />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteAddress(address.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0071CE" />

            {/* Header */}
            <LinearGradient
                colors={['#0071CE', '#004C91']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>My Addresses</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddNewAddress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0071CE']}
                        tintColor="#0071CE"
                    />
                }
            >
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Ionicons name="information-circle" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Manage Your Addresses</Text>
                        <Text style={styles.infoText}>
                            Add, edit, or delete delivery addresses. Set a default address for faster checkout.
                        </Text>
                    </View>
                </View>

                {/* Address Count */}
                <View style={styles.addressCount}>
                    <Text style={styles.addressCountText}>
                        {addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved
                    </Text>
                </View>

                {/* Address List */}
                {addresses.length > 0 ? (
                    <View style={styles.addressList}>
                        {addresses.map(renderAddressCard)}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyStateTitle}>No Addresses Yet</Text>
                        <Text style={styles.emptyStateText}>
                            Add your first delivery address to get started with faster checkout.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={handleAddNewAddress}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.emptyStateButtonText}>Add Your First Address</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Add New Address Button */}
                {addresses.length > 0 && (
                    <TouchableOpacity
                        style={styles.addNewButton}
                        onPress={handleAddNewAddress}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#0071CE" />
                        <Text style={styles.addNewButtonText}>Add New Address</Text>
                    </TouchableOpacity>
                )}

                {/* Address Limits Info */}
                <View style={styles.limitsInfo}>
                    <Text style={styles.limitsText}>
                        You can save up to 10 addresses. {10 - addresses.length} remaining.
                    </Text>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 8,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    addButton: {
        padding: 8,
        borderRadius: 20,
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },

    // Info Card
    infoCard: {
        backgroundColor: '#EBF8FF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
    },

    // Address Count
    addressCount: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    addressCountText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Address List
    addressList: {
        marginTop: 12,
    },

    // Address Card
    addressCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },

    // Address Header
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    addressHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    addressTypeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    addressHeaderInfo: {
        flex: 1,
    },
    addressLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    addressLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginRight: 8,
    },
    defaultBadge: {
        backgroundColor: '#0071CE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 8,
    },
    defaultBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    warningBadgeText: {
        color: '#F59E0B',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 2,
    },
    addressName: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    addressSummary: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    addressHeaderRight: {
        alignItems: 'flex-end',
    },
    lastUsedText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },

    // Expanded Content
    expandedContent: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        padding: 16,
    },

    // Full Address Section
    fullAddressSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    fullAddressText: {
        fontSize: 15,
        color: '#111827',
        lineHeight: 22,
        marginBottom: 8,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
    },

    // Instructions Section
    instructionsSection: {
        marginBottom: 16,
    },
    instructionsText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#0071CE',
    },

    // Validation Section
    validationSection: {
        marginBottom: 16,
    },
    validationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    validationText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    verifyButton: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    verifyButtonText: {
        color: '#F59E0B',
        fontSize: 14,
        fontWeight: '600',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    setDefaultButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF8FF',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0071CE',
    },
    setDefaultButtonText: {
        color: '#0071CE',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    editButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    deleteButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    emptyStateButton: {
        backgroundColor: '#0071CE',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyStateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Add New Button
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#0071CE',
        borderStyle: 'dashed',
    },
    addNewButtonText: {
        color: '#0071CE',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Limits Info
    limitsInfo: {
        marginHorizontal: 16,
        marginTop: 16,
        alignItems: 'center',
    },
    limitsText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 32,
    },
});