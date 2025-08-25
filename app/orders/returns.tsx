import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    RefreshControl,
    StyleSheet,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import unified systems
import { getImageById } from '../../assets/images/imageLoader';
import { useCartStore } from '../../store/slices/cartSlice';
import { ALL_PRODUCTS } from '../../constants/products';

const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    borderColor: '#E0E0E0',
};

// Enhanced interfaces with real data integration
interface ReturnItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageId: string | number; // Changed from image URL to imageId
    brand: string;
    condition: string;
    returnReason: string;
    sku?: string;
    variant?: {
        color?: string;
        size?: string;
        style?: string;
    };
}

interface TimelineEvent {
    date: string;
    status: string;
    description: string;
}

interface Return {
    id: string;
    returnNumber: string;
    orderNumber: string;
    status: 'completed' | 'processing' | 'pending' | 'cancelled';
    returnDate: string;
    refundDate?: string;
    refundAmount: number;
    returnMethod: string;
    refundMethod: string;
    item: ReturnItem;
    timeline: TimelineEvent[];
    trackingNumber?: string;
    carrier?: string;
}

interface EligibleOrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageId: string | number;
    brand: string;
    eligible: boolean;
    daysLeft: number;
    sku?: string;
    variant?: {
        color?: string;
        size?: string;
        style?: string;
    };
}

interface EligibleOrder {
    id: string;
    orderNumber: string;
    orderDate: string;
    items: EligibleOrderItem[];
}

// Generate mock returns using real product data
const generateMockReturns = (): Return[] => {
    const sampleProducts = ALL_PRODUCTS.slice(10, 15); // Use products 10-15
    const statuses: Return['status'][] = ['completed', 'processing', 'pending'];
    const returnMethods = ['Store Return', 'Mail Return', 'Pickup Return'];
    const refundMethods = ['Original Payment Method', 'Store Credit', 'Gift Card'];
    const returnReasons = [
        'Product not working properly',
        'Changed mind about purchase',
        'Ordered wrong size',
        'Defective item received',
        'Better price found elsewhere'
    ];

    return Array.from({ length: 5 }, (_, index) => {
        const product = sampleProducts[index % sampleProducts.length];
        const status = statuses[index % statuses.length];
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() - (index * 3 + 1));

        const item: ReturnItem = {
            id: `return_item_${index}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageId: product.id, // Use product ID for smart image loading
            brand: product.brand || 'Walmart',
            condition: ['Defective', 'Unwanted', 'Wrong Size'][index % 3],
            returnReason: returnReasons[index % returnReasons.length],
            sku: product.sku,
            variant: {
                color: product.variants?.colors?.[0]?.name,
                size: product.variants?.sizes?.[0]?.name,
            },
        };

        const timeline: TimelineEvent[] = [
            {
                date: returnDate.toISOString().split('T')[0],
                status: 'Return Initiated',
                description: 'Return request submitted'
            }
        ];

        if (status === 'processing' || status === 'completed') {
            const processDate = new Date(returnDate);
            processDate.setDate(processDate.getDate() + 1);
            timeline.push({
                date: processDate.toISOString().split('T')[0],
                status: 'Item Received',
                description: 'Item received at return center'
            });
        }

        if (status === 'completed') {
            const refundDate = new Date(returnDate);
            refundDate.setDate(refundDate.getDate() + 3);
            timeline.push({
                date: refundDate.toISOString().split('T')[0],
                status: 'Refund Processed',
                description: 'Refund issued to original payment method'
            });
        }

        return {
            id: `return_${index}`,
            returnNumber: `#RET${String(index + 1).padStart(9, '0')}`,
            orderNumber: `#WM${String(index + 1000).padStart(6, '0')}`,
            status,
            returnDate: returnDate.toISOString().split('T')[0],
            refundDate: status === 'completed' ? timeline[timeline.length - 1]?.date : undefined,
            refundAmount: item.price * item.quantity,
            returnMethod: returnMethods[index % returnMethods.length],
            refundMethod: refundMethods[index % refundMethods.length],
            item,
            timeline,
            trackingNumber: status !== 'pending' ? `TRK${Math.floor(Math.random() * 1000000000)}` : undefined,
            carrier: status !== 'pending' ? ['FedEx', 'UPS', 'USPS'][index % 3] : undefined,
        };
    });
};

// Generate eligible items using real product data
const generateEligibleItems = (): EligibleOrder[] => {
    const sampleProducts = ALL_PRODUCTS.slice(0, 8); // Use first 8 products

    return Array.from({ length: 3 }, (_, orderIndex) => {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - (orderIndex * 10 + 5));

        const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
        const orderProducts = sampleProducts.slice(orderIndex * 2, orderIndex * 2 + itemCount);

        const items: EligibleOrderItem[] = orderProducts.map((product, itemIndex) => {
            const daysLeft = 30 - (orderIndex * 10 + 5); // Simulate days left for return

            return {
                id: `eligible_${orderIndex}_${itemIndex}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: Math.floor(Math.random() * 2) + 1,
                imageId: product.id,
                brand: product.brand || 'Walmart',
                eligible: daysLeft > 0,
                daysLeft: Math.max(0, daysLeft),
                sku: product.sku,
                variant: {
                    color: product.variants?.colors?.[0]?.name,
                    size: product.variants?.sizes?.[0]?.name,
                },
            };
        });

        return {
            id: `eligible_order_${orderIndex}`,
            orderNumber: `#WM${String(orderIndex + 2000).padStart(6, '0')}`,
            orderDate: orderDate.toISOString().split('T')[0],
            items,
        };
    });
};

const returnReasons = [
    'Defective or damaged',
    'Wrong item received',
    'Different than described',
    'No longer needed',
    'Found better price',
    'Arrived too late',
    'Wrong size/color',
    'Quality not as expected',
    'Other',
];

const filterOptions = [
    { id: 'all', label: 'All Returns' },
    { id: 'completed', label: 'Completed' },
    { id: 'processing', label: 'Processing' },
    { id: 'pending', label: 'Pending' },
];

export default function ReturnsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [returns, setReturns] = useState<Return[]>([]);
    const [eligibleItems, setEligibleItems] = useState<EligibleOrder[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'returns' | 'eligible'>('returns');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<EligibleOrderItem | null>(null);
    const [expandedReturns, setExpandedReturns] = useState<string[]>([]);

    // Cart store for potential reorder functionality
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        loadReturnsData();
    }, []);

    // Enhanced data loading with product integration
    const loadReturnsData = async () => {
        try {
            setIsLoading(true);

            // TODO: Replace with actual API calls
            // const [returnsResponse, eligibleResponse] = await Promise.all([
            //     fetch('/api/returns'),
            //     fetch('/api/orders/eligible-for-return')
            // ]);
            // const returnsData = await returnsResponse.json();
            // const eligibleData = await eligibleResponse.json();

            // For now, use enhanced mock data
            const mockReturns = generateMockReturns();
            const mockEligible = generateEligibleItems();

            // Enhance returns with product data (for when real API data comes)
            const enhancedReturns = mockReturns.map(returnItem => ({
                ...returnItem,
                item: {
                    ...returnItem.item,
                    // Ensure we have fallbacks for missing data
                    name: returnItem.item.name || 'Unknown Product',
                    brand: returnItem.item.brand || 'Walmart',
                }
            }));

            // Enhance eligible items with product data
            const enhancedEligible = mockEligible.map(order => ({
                ...order,
                items: order.items.map(item => {
                    const productData = ALL_PRODUCTS.find(p => p.id === item.productId);
                    return {
                        ...item,
                        name: item.name || productData?.name || 'Unknown Product',
                        brand: item.brand || productData?.brand || 'Walmart',
                        imageId: item.imageId || productData?.id || item.productId,
                    };
                })
            }));

            setReturns(enhancedReturns);
            setEligibleItems(enhancedEligible);
        } catch (error) {
            console.error('Error loading returns data:', error);
            Alert.alert('Error', 'Failed to load returns data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReturnsData();
        setRefreshing(false);
    };

    // Smart image loading function
    const getReturnItemImage = (item: ReturnItem | EligibleOrderItem) => {
        try {
            return getImageById(item.imageId, 'small');
        } catch (error) {
            console.warn(`Failed to load image for item ${item.id}:`, error);
            return getImageById(1, 'small'); // Ultimate fallback
        }
    };

    const handleReturnPress = (returnId: string) => {
        router.push(`/returns/${returnId}`);
    };

    const handleTrackReturn = (trackingNumber: string, carrier?: string) => {
        let trackingUrl = '';

        if (carrier) {
            switch (carrier.toLowerCase()) {
                case 'fedex':
                    trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
                    break;
                case 'ups':
                    trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`;
                    break;
                case 'usps':
                    trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
                    break;
            }
        }

        Alert.alert(
            'Track Return',
            `Tracking Number: ${trackingNumber}${carrier ? `\nCarrier: ${carrier}` : ''}`,
            [
                { text: 'Copy Number', onPress: () => console.log('Copied:', trackingNumber) },
                { text: 'OK', style: 'cancel' }
            ]
        );
    };

    const handleStartReturn = (item: EligibleOrderItem) => {
        setSelectedItem(item);
        setShowReturnModal(true);
    };

    const handleSubmitReturn = async (reason: string) => {
        if (!selectedItem) return;

        try {
            // TODO: Submit return request to API
            // const response = await fetch('/api/returns', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         productId: selectedItem.productId,
            //         reason,
            //         quantity: selectedItem.quantity
            //     })
            // });

            Alert.alert(
                'Return Initiated',
                `Return request submitted for ${selectedItem.name}. You will receive a confirmation email shortly.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setShowReturnModal(false);
                            setSelectedItem(null);
                            // Refresh data to show new return
                            loadReturnsData();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error submitting return:', error);
            Alert.alert('Error', 'Failed to submit return request. Please try again.');
        }
    };

    // Enhanced reorder from returned item
    const handleReorderReturnedItem = async (returnItem: Return) => {
        try {
            const productData = ALL_PRODUCTS.find(p => p.id === returnItem.item.productId);

            await addItem({
                productId: returnItem.item.productId,
                name: returnItem.item.name,
                brand: returnItem.item.brand,
                price: returnItem.item.price,
                quantity: returnItem.item.quantity,
                maxQuantity: productData?.maxQuantity || 10,
                minQuantity: productData?.minQuantity || 1,
                image: returnItem.item.imageId,
                category: productData?.category || 'general',
                sku: returnItem.item.sku || `SKU-${returnItem.item.productId}`,
                status: productData?.status || 'available',
                storeId: productData?.storeId || 'store_001',
                storeName: productData?.storeName || 'Walmart Supercenter',
                delivery: productData?.delivery || {
                    option: 'pickup' as const,
                    freeShippingEligible: true,
                },
                variant: returnItem.item.variant,
            });

            Alert.alert('Success', 'Item added to cart!');
            router.push('/(modals)/cart');
        } catch (error) {
            console.error('Reorder error:', error);
            Alert.alert('Error', 'Failed to add item to cart. Please try again.');
        }
    };

    const toggleReturnExpansion = (returnId: string) => {
        setExpandedReturns(prev =>
            prev.includes(returnId)
                ? prev.filter(id => id !== returnId)
                : [...prev, returnId]
        );
    };

    const getFilteredReturns = () => {
        if (selectedFilter === 'all') {
            return returns;
        }
        return returns.filter(item => item.status === selectedFilter);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return COLORS.success;
            case 'processing':
                return COLORS.warning;
            case 'pending':
                return COLORS.mediumGray;
            case 'cancelled':
                return COLORS.error;
            default:
                return COLORS.mediumGray;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return 'checkmark-circle';
            case 'processing':
                return 'time';
            case 'pending':
                return 'ellipse';
            case 'cancelled':
                return 'close-circle';
            default:
                return 'ellipse';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderReturnItem = ({ item }: { item: Return }) => {
        const isExpanded = expandedReturns.includes(item.id);

        return (
            <View style={styles.returnCard}>
                <TouchableOpacity
                    style={styles.returnHeader}
                    onPress={() => toggleReturnExpansion(item.id)}
                    onLongPress={() => {
                        if (item.status === 'completed') {
                            Alert.alert(
                                'Reorder Item',
                                `Add ${item.item.name} to your cart again?`,
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Add to Cart', onPress: () => handleReorderReturnedItem(item) }
                                ]
                            );
                        }
                    }}
                    activeOpacity={0.7}
                >
                    <View style={styles.returnMainInfo}>
                        <View style={styles.returnTitleRow}>
                            <Text style={styles.returnNumber}>{item.returnNumber}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                <Ionicons
                                    name={getStatusIcon(item.status) as any}
                                    size={12}
                                    color={COLORS.white}
                                />
                                <Text style={styles.statusText}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.returnDate}>
                            Return initiated on {formatDate(item.returnDate)}
                        </Text>
                        <View style={styles.returnSummary}>
                            <Text style={styles.refundAmount}>${item.refundAmount.toFixed(2)}</Text>
                            <Text style={styles.originalOrder}>Order {item.orderNumber}</Text>
                        </View>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={COLORS.mediumGray}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.returnDetails}>
                        {/* Returned Item with smart image loading */}
                        <Text style={styles.sectionTitle}>Returned Item</Text>
                        <View style={styles.itemRow}>
                            <Image
                                source={getReturnItemImage(item.item)}
                                style={styles.itemImage}
                                resizeMode="cover"
                            />
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemBrand}>{item.item.brand}</Text>
                                <Text style={styles.itemName}>{item.item.name}</Text>
                                <Text style={styles.itemPrice}>${item.item.price.toFixed(2)}</Text>
                                {(item.item.variant?.color || item.item.variant?.size) && (
                                    <View style={styles.variantInfo}>
                                        {item.item.variant.color && (
                                            <Text style={styles.variantText}>Color: {item.item.variant.color}</Text>
                                        )}
                                        {item.item.variant.size && (
                                            <Text style={styles.variantText}>Size: {item.item.variant.size}</Text>
                                        )}
                                    </View>
                                )}
                                <Text style={styles.returnReason}>
                                    Reason: {item.item.returnReason}
                                </Text>
                            </View>
                        </View>

                        {/* Return Information */}
                        <View style={styles.returnInfoSection}>
                            <Text style={styles.sectionTitle}>Return Information</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Return Method:</Text>
                                <Text style={styles.infoValue}>{item.returnMethod}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Refund Method:</Text>
                                <Text style={styles.infoValue}>{item.refundMethod}</Text>
                            </View>
                            {item.refundDate && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Refund Date:</Text>
                                    <Text style={styles.infoValue}>{formatDate(item.refundDate)}</Text>
                                </View>
                            )}
                            {item.trackingNumber && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Tracking:</Text>
                                    <TouchableOpacity onPress={() => handleTrackReturn(item.trackingNumber!, item.carrier)}>
                                        <Text style={[styles.infoValue, { color: COLORS.walmartBlue }]}>
                                            {item.trackingNumber}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Timeline */}
                        <View style={styles.timelineSection}>
                            <Text style={styles.sectionTitle}>Return Timeline</Text>
                            {item.timeline.map((event, index) => (
                                <View key={index} style={styles.timelineItem}>
                                    <View style={styles.timelineDot} />
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.timelineStatus}>{event.status}</Text>
                                        <Text style={styles.timelineDescription}>{event.description}</Text>
                                        <Text style={styles.timelineDate}>{formatDate(event.date)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleReturnPress(item.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.actionButtonText}>View Details</Text>
                            </TouchableOpacity>
                            {item.trackingNumber && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.primaryButton]}
                                    onPress={() => handleTrackReturn(item.trackingNumber!, item.carrier)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                                        Track Return
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderEligibleItem = ({ item }: { item: EligibleOrder }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                <Text style={styles.orderDate}>Ordered {formatDate(item.orderDate)}</Text>
            </View>
            {item.items.map((orderItem) => (
                <View key={orderItem.id} style={styles.eligibleItemRow}>
                    <Image
                        source={getReturnItemImage(orderItem)}
                        style={styles.itemImage}
                        resizeMode="cover"
                    />
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemBrand}>{orderItem.brand}</Text>
                        <Text style={styles.itemName}>{orderItem.name}</Text>
                        <Text style={styles.itemPrice}>${orderItem.price.toFixed(2)}</Text>
                        {(orderItem.variant?.color || orderItem.variant?.size) && (
                            <View style={styles.variantInfo}>
                                {orderItem.variant.color && (
                                    <Text style={styles.variantText}>Color: {orderItem.variant.color}</Text>
                                )}
                                {orderItem.variant.size && (
                                    <Text style={styles.variantText}>Size: {orderItem.variant.size}</Text>
                                )}
                            </View>
                        )}
                        {orderItem.eligible ? (
                            <Text style={styles.eligibleText}>
                                ✓ Eligible for return ({orderItem.daysLeft} days left)
                            </Text>
                        ) : (
                            <Text style={styles.ineligibleText}>
                                ✗ Return period expired
                            </Text>
                        )}
                    </View>
                    {orderItem.eligible && (
                        <TouchableOpacity
                            style={styles.returnButton}
                            onPress={() => handleStartReturn(orderItem)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.returnButtonText}>Return</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}
        </View>
    );

    const filteredReturns = getFilteredReturns();

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.walmartBlue} />
                <Text style={styles.loadingText}>Loading returns...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Returns & Refunds</Text>
                <TouchableOpacity
                    style={styles.helpButton}
                    onPress={() => {
                        Alert.alert(
                            'Return Help',
                            'Need help with returns? Contact our support team.',
                            [
                                { text: 'Call Support', onPress: () => console.log('Call support') },
                                { text: 'Chat Support', onPress: () => router.push('/support/chat') },
                                { text: 'OK', style: 'cancel' }
                            ]
                        );
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="help-circle-outline" size={24} color={COLORS.walmartBlue} />
                </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'returns' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('returns')}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.tabButtonText,
                        activeTab === 'returns' && styles.tabButtonTextActive
                    ]}>
                        My Returns ({returns.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'eligible' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('eligible')}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.tabButtonText,
                        activeTab === 'eligible' && styles.tabButtonTextActive
                    ]}>
                        Start Return
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'returns' ? (
                <>
                    {/* Filters */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterContainer}
                        contentContainerStyle={styles.filterContent}
                    >
                        {filterOptions.map((filter) => {
                            const count = filter.id === 'all'
                                ? returns.length
                                : returns.filter(r => r.status === filter.id).length;

                            return (
                                <TouchableOpacity
                                    key={filter.id}
                                    style={[
                                        styles.filterChip,
                                        selectedFilter === filter.id && styles.filterChipActive
                                    ]}
                                    onPress={() => setSelectedFilter(filter.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        selectedFilter === filter.id && styles.filterChipTextActive
                                    ]}>
                                        {filter.label} ({count})
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Returns List */}
                    <FlatList
                        data={filteredReturns}
                        renderItem={renderReturnItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.returnsList}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[COLORS.walmartBlue]}
                                tintColor={COLORS.walmartBlue}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="return-up-back-outline" size={64} color={COLORS.mediumGray} />
                                <Text style={styles.emptyStateTitle}>No Returns Found</Text>
                                <Text style={styles.emptyStateSubtitle}>
                                    {selectedFilter === 'all'
                                        ? "You haven't initiated any returns yet"
                                        : `No ${selectedFilter} returns found`}
                                </Text>
                                {selectedFilter === 'all' && (
                                    <TouchableOpacity
                                        style={styles.startReturnButton}
                                        onPress={() => setActiveTab('eligible')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.startReturnButtonText}>Start a Return</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                    />
                </>
            ) : (
                <>
                    {/* Eligible Items Header */}
                    <View style={styles.eligibleHeader}>
                        <Text style={styles.eligibleHeaderText}>
                            Select items from recent orders to return
                        </Text>
                        <Text style={styles.eligibleSubText}>
                            Returns must be initiated within 30 days of purchase
                        </Text>
                    </View>

                    {/* Eligible Items List */}
                    <FlatList
                        data={eligibleItems}
                        renderItem={renderEligibleItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.returnsList}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[COLORS.walmartBlue]}
                                tintColor={COLORS.walmartBlue}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={64} color={COLORS.mediumGray} />
                                <Text style={styles.emptyStateTitle}>No Eligible Items</Text>
                                <Text style={styles.emptyStateSubtitle}>
                                    All your recent orders are outside the return window or you haven't placed any orders yet
                                </Text>
                                <TouchableOpacity
                                    style={styles.startShoppingButton}
                                    onPress={() => router.push('/(tabs)')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                </>
            )}

            {/* Enhanced Return Reason Modal */}
            <Modal
                visible={showReturnModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowReturnModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Return Reason</Text>
                            <TouchableOpacity
                                onPress={() => setShowReturnModal(false)}
                                style={styles.modalCloseButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {selectedItem && (
                            <View style={styles.modalItemInfo}>
                                <Image
                                    source={getReturnItemImage(selectedItem)}
                                    style={styles.modalItemImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.modalItemDetails}>
                                    <Text style={styles.modalItemBrand}>{selectedItem.brand}</Text>
                                    <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                                    <Text style={styles.modalItemPrice}>${selectedItem.price.toFixed(2)}</Text>
                                    {(selectedItem.variant?.color || selectedItem.variant?.size) && (
                                        <View style={styles.modalVariantInfo}>
                                            {selectedItem.variant.color && (
                                                <Text style={styles.modalVariantText}>
                                                    Color: {selectedItem.variant.color}
                                                </Text>
                                            )}
                                            {selectedItem.variant.size && (
                                                <Text style={styles.modalVariantText}>
                                                    Size: {selectedItem.variant.size}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        <Text style={styles.reasonsTitle}>Why are you returning this item?</Text>

                        <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
                            {returnReasons.map((reason, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.reasonOption}
                                    onPress={() => handleSubmitReturn(reason)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.reasonText}>{reason}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Text style={styles.modalFooterText}>
                                You'll receive a confirmation email with return instructions
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Main Container Styles
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },

    // Enhanced Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        marginRight: 16,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    headerTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    helpButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },

    // Enhanced Tab Navigation
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 18,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#0071CE',
        backgroundColor: '#EFF6FF',
    },
    tabButtonText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    tabButtonTextActive: {
        color: '#0071CE',
        fontWeight: '700',
    },

    // Enhanced Filter Styles
    filterContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    filterChipActive: {
        backgroundColor: '#0071CE',
        borderColor: '#0071CE',
        shadowColor: '#0071CE',
        shadowOpacity: 0.3,
        elevation: 4,
    },
    filterChipText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // Eligible Items Header
    eligibleHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    eligibleHeaderText: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 6,
    },
    eligibleSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },

    // List Container
    returnsList: {
        padding: 20,
        paddingBottom: 100,
    },

    // Enhanced Return Card Styles
    returnCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    returnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    returnMainInfo: {
        flex: 1,
    },
    returnTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    returnNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    statusText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    returnDate: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
        fontWeight: '500',
    },
    returnSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    refundAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    originalOrder: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Enhanced Return Details
    returnDetails: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        padding: 20,
        backgroundColor: '#FAFBFC',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },

    // Enhanced Item Row
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#F8FAFC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemDetails: {
        flex: 1,
    },
    itemBrand: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemName: {
        fontSize: 16,
        color: '#111827',
        marginBottom: 6,
        lineHeight: 22,
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0071CE',
        marginBottom: 8,
    },
    variantInfo: {
        marginBottom: 6,
    },
    variantText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
        fontWeight: '500',
    },
    returnReason: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        fontWeight: '500',
    },

    // Enhanced Return Info Section
    returnInfoSection: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },

    // Enhanced Timeline Section
    timelineSection: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0071CE',
        marginTop: 6,
        marginRight: 16,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    timelineContent: {
        flex: 1,
    },
    timelineStatus: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    timelineDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
        lineHeight: 20,
        fontWeight: '500',
    },
    timelineDate: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },

    // Enhanced Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButton: {
        backgroundColor: '#0071CE',
        borderColor: '#0071CE',
        shadowColor: '#0071CE',
        shadowOpacity: 0.3,
        elevation: 6,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // Enhanced Order Card Styles
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    orderDate: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    eligibleItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 12,
    },
    eligibleText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '700',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    ineligibleText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '700',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    returnButton: {
        backgroundColor: '#0071CE',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        marginLeft: 16,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    returnButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    // Enhanced Empty State
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
        marginBottom: 24,
    },
    startReturnButton: {
        backgroundColor: '#0071CE',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    startReturnButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    startShoppingButton: {
        backgroundColor: '#10B981',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    startShoppingButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },

    // Enhanced Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 34,
        maxHeight: '85%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },

    // Enhanced Modal Item Info
    modalItemInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F8FAFC',
    },
    modalItemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalItemDetails: {
        flex: 1,
    },
    modalItemBrand: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modalItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        lineHeight: 22,
    },
    modalItemPrice: {
        fontSize: 16,
        color: '#0071CE',
        fontWeight: '700',
        marginBottom: 8,
    },
    modalVariantInfo: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    modalVariantText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Enhanced Reasons Section
    reasonsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    reasonsList: {
        maxHeight: 320,
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    reasonText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
        flex: 1,
    },

    // Modal Footer
    modalFooter: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    modalFooterText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 20,
    },
});