import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    FlatList,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, isThisYear, isToday, isYesterday, subDays } from 'date-fns';

// Import unified systems
import { getImageById } from '../../assets/images/imageLoader';
import { useCartStore } from '../../store/slices/cartSlice';
import { ALL_PRODUCTS } from '../../constants/products';

// Enhanced interfaces with real data integration
interface OrderItem {
    id: string;
    productId: string;
    name: string;
    imageId: string | number; // Changed from image URL to imageId
    quantity: number;
    price: number;
    originalPrice?: number;
    brand?: string;
    sku?: string;
    variant?: {
        color?: string;
        size?: string;
        style?: string;
    };
}

interface Order {
    id: string;
    orderNumber: string;
    status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
    items: OrderItem[];
    total: number;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    createdAt: Date;
    trackingNumber?: string;
    carrier?: string;
}

// Generate mock orders using real product data
const generateMockOrders = (): Order[] => {
    const sampleProducts = ALL_PRODUCTS.slice(0, 20); // Use first 20 products
    const statuses: Order['status'][] = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    const carriers = ['FedEx', 'UPS', 'USPS', 'DHL'];

    return Array.from({ length: 8 }, (_, orderIndex) => {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - (orderIndex * 2 + Math.floor(Math.random() * 3)));

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order

        // Select random products for this order
        const orderProducts = sampleProducts
            .sort(() => 0.5 - Math.random())
            .slice(0, itemCount);

        const items: OrderItem[] = orderProducts.map((product, itemIndex) => ({
            id: `${orderIndex}_${itemIndex}`,
            productId: product.id,
            name: product.name,
            imageId: product.id, // Use product ID for smart image loading
            quantity: Math.floor(Math.random() * 2) + 1, // 1-2 quantity
            price: product.price,
            originalPrice: product.originalPrice,
            brand: product.brand || 'Walmart',
            sku: product.sku,
            variant: {
                color: product.variants?.colors?.[0]?.name,
                size: product.variants?.sizes?.[0]?.name,
            },
        }));

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const shipping = subtotal > 35 ? 0 : 7.95;
        const total = subtotal + tax + shipping;

        let estimatedDelivery: Date | undefined;
        let actualDelivery: Date | undefined;
        let trackingNumber: string | undefined;
        let carrier: string | undefined;

        if (status === 'delivered') {
            const delivery = new Date(orderDate);
            delivery.setDate(delivery.getDate() + Math.floor(Math.random() * 5) + 2);
            actualDelivery = delivery;
        } else if (['shipped', 'out_for_delivery'].includes(status)) {
            const estimated = new Date();
            estimated.setDate(estimated.getDate() + Math.floor(Math.random() * 3) + 1);
            estimatedDelivery = estimated;
        } else if (['confirmed', 'processing'].includes(status)) {
            const estimated = new Date();
            estimated.setDate(estimated.getDate() + Math.floor(Math.random() * 5) + 3);
            estimatedDelivery = estimated;
        }

        if (['shipped', 'out_for_delivery', 'delivered'].includes(status)) {
            trackingNumber = `TRK${Math.floor(Math.random() * 1000000000)}`;
            carrier = carriers[Math.floor(Math.random() * carriers.length)];
        }

        return {
            id: `order_${orderIndex + 1}`,
            orderNumber: `WM-2025-${String(orderIndex + 1).padStart(6, '0')}`,
            status,
            items,
            total: Math.round(total * 100) / 100,
            estimatedDelivery,
            actualDelivery,
            createdAt: orderDate,
            trackingNumber,
            carrier,
        };
    });
};

export default function OrdersPage(): JSX.Element {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Cart store for potential reorder functionality
    const addItem = useCartStore((state) => state.addItem);

    // Dynamic status filters based on actual data
    const statusFilters = [
        { id: 'all', label: 'All Orders', count: orders.length },
        { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
        { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
        { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { id: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter(o => o.status === 'out_for_delivery').length },
        { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
        { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
        { id: 'returned', label: 'Returned', count: orders.filter(o => o.status === 'returned').length },
    ].filter(filter => filter.count > 0 || filter.id === 'all'); // Show all filters that have orders, plus "all"

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, selectedFilter, searchQuery]);

    // Enhanced order loading with product data integration
    const loadOrders = async () => {
        try {
            setIsLoading(true);

            // TODO: Replace with actual API call
            // const response = await fetch('/api/orders');
            // if (!response.ok) throw new Error('Failed to fetch orders');
            // const ordersData = await response.json();

            // For now, use enhanced mock data
            const mockOrders = generateMockOrders();

            // Enhance orders with product data (for when real API data comes)
            const enhancedOrders = mockOrders.map(order => ({
                ...order,
                items: order.items.map(item => {
                    const productData = ALL_PRODUCTS.find(p => p.id === item.productId);
                    return {
                        ...item,
                        // Ensure we have fallbacks for missing data
                        name: item.name || productData?.name || 'Unknown Product',
                        brand: item.brand || productData?.brand || 'Walmart',
                        imageId: item.imageId || productData?.id || item.productId,
                        sku: item.sku || productData?.sku || `SKU-${item.productId}`,
                    };
                })
            }));

            setOrders(enhancedOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Filter by status
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(order => order.status === selectedFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(query) ||
                order.items.some(item => item.name.toLowerCase().includes(query))
            );
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFilteredOrders(filtered);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    // Smart image loading function
    const getOrderItemImage = (item: OrderItem) => {
        try {
            return getImageById(item.imageId, 'small');
        } catch (error) {
            console.warn(`Failed to load image for item ${item.id}:`, error);
            return getImageById(1, 'small'); // Ultimate fallback
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return { backgroundColor: '#DBEAFE', color: '#2563EB' };
            case 'processing': return { backgroundColor: '#FEF3C7', color: '#D97706' };
            case 'shipped': return { backgroundColor: '#EDE9FE', color: '#7C3AED' };
            case 'out_for_delivery': return { backgroundColor: '#FED7AA', color: '#EA580C' };
            case 'delivered': return { backgroundColor: '#D1FAE5', color: '#059669' };
            case 'cancelled': return { backgroundColor: '#FEE2E2', color: '#DC2626' };
            case 'returned': return { backgroundColor: '#F3F4F6', color: '#6B7280' };
            default: return { backgroundColor: '#F3F4F6', color: '#6B7280' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return 'checkmark-circle';
            case 'processing': return 'time';
            case 'shipped': return 'car';
            case 'out_for_delivery': return 'bicycle';
            case 'delivered': return 'home';
            case 'cancelled': return 'close-circle';
            case 'returned': return 'return-up-back';
            default: return 'ellipse';
        }
    };

    const formatOrderDate = (date: Date) => {
        if (isToday(date)) {
            return 'Today';
        } else if (isYesterday(date)) {
            return 'Yesterday';
        } else if (isThisYear(date)) {
            return format(date, 'MMM d');
        } else {
            return format(date, 'MMM d, yyyy');
        }
    };

    const handleOrderPress = (order: Order) => {
        router.push(`/orders/${order.id}`);
    };

    const handleTrackOrder = (order: Order) => {
        if (order.trackingNumber && order.carrier) {
            let trackingUrl = '';
            switch (order.carrier.toLowerCase()) {
                case 'fedex':
                    trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`;
                    break;
                case 'ups':
                    trackingUrl = `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
                    break;
                case 'usps':
                    trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
                    break;
                default:
                    Alert.alert('Tracking', `Tracking number: ${order.trackingNumber}`);
                    return;
            }

            Linking.openURL(trackingUrl).catch(() => {
                Alert.alert(
                    'Track Package',
                    `Tracking Number: ${order.trackingNumber}\nCarrier: ${order.carrier}\n\n(Link opening not available in simulator)`,
                    [
                        { text: 'Copy Number', onPress: () => console.log('Copied:', order.trackingNumber) },
                        { text: 'OK', style: 'cancel' }
                    ]
                );
            });
        }
    };

    // Enhanced reorder functionality
    const handleReorderFromOrder = async (order: Order) => {
        Alert.alert(
            'Reorder Items',
            `Add ${order.items.reduce((sum, item) => sum + item.quantity, 0)} items from order ${order.orderNumber} to your cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add to Cart',
                    onPress: async () => {
                        try {
                            for (const item of order.items) {
                                const productData = ALL_PRODUCTS.find(p => p.id === item.productId);

                                await addItem({
                                    productId: item.productId,
                                    name: item.name,
                                    brand: item.brand || 'Walmart',
                                    price: item.price,
                                    originalPrice: item.originalPrice,
                                    quantity: item.quantity,
                                    maxQuantity: productData?.maxQuantity || 10,
                                    minQuantity: productData?.minQuantity || 1,
                                    image: item.imageId,
                                    category: productData?.category || 'general',
                                    sku: item.sku || `SKU-${item.productId}`,
                                    status: productData?.status || 'available',
                                    storeId: productData?.storeId || 'store_001',
                                    storeName: productData?.storeName || 'Walmart Supercenter',
                                    delivery: productData?.delivery || {
                                        option: 'pickup' as const,
                                        freeShippingEligible: true,
                                    },
                                    variant: item.variant,
                                });
                            }

                            Alert.alert('Success', 'Items added to cart!');
                            router.push('/(modals)/cart');
                        } catch (error) {
                            console.error('Reorder error:', error);
                            Alert.alert('Error', 'Failed to add items to cart. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleGetHelp = () => {
        Alert.alert(
            'Get Help',
            'How would you like to contact support?',
            [
                {
                    text: 'Call',
                    onPress: () => {
                        Linking.openURL('tel:+18009256278').catch(() => {
                            Alert.alert(
                                'Call Support',
                                '📞 1-800-925-6278\n\n(Phone dialer not available in simulator)',
                                [
                                    { text: 'Copy Number', onPress: () => Alert.alert('Number', '1-800-925-6278') },
                                    { text: 'OK', style: 'cancel' }
                                ]
                            );
                        });
                    }
                },
                {
                    text: 'Chat',
                    onPress: () => router.push('/support/chat')
                },
                {
                    text: 'Email',
                    onPress: () => {
                        const emailUrl = 'mailto:support@walmart.com?subject=Need%20Help%20with%20Orders';
                        Linking.openURL(emailUrl).catch(() => {
                            Alert.alert(
                                'Email Support',
                                '📧 support@walmart.com\n\nSubject: Need Help with Orders',
                                [
                                    { text: 'Copy Email', onPress: () => Alert.alert('Email', 'support@walmart.com') },
                                    { text: 'OK', style: 'cancel' }
                                ]
                            );
                        });
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const renderOrderItem = ({ item: order }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOrderPress(order)}
            onLongPress={() => {
                if (order.status === 'delivered') {
                    handleReorderFromOrder(order);
                }
            }}
            activeOpacity={0.7}
        >
            {/* Order Header */}
            <View style={styles.orderHeader}>
                <View style={styles.orderHeaderInfo}>
                    <Text style={styles.orderNumber}>
                        {order.orderNumber}
                    </Text>
                    <Text style={styles.orderMeta}>
                        Ordered {formatOrderDate(order.createdAt)} • ${order.total.toFixed(2)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, getStatusBadgeStyle(order.status)]}>
                    <View style={styles.statusBadgeContent}>
                        <Ionicons
                            name={getStatusIcon(order.status) as any}
                            size={14}
                            color={getStatusBadgeStyle(order.status).color}
                        />
                        <Text style={[styles.statusText, { color: getStatusBadgeStyle(order.status).color }]}>
                            {order.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Order Items with smart image loading */}
            <View style={styles.orderItemsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScrollView}>
                    <View style={styles.itemsRow}>
                        {order.items.slice(0, 4).map((item, index) => (
                            <View key={item.id} style={styles.itemImageContainer}>
                                <Image
                                    source={getOrderItemImage(item)}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                                {item.quantity > 1 && (
                                    <View style={styles.quantityBadge}>
                                        <Text style={styles.quantityText}>
                                            {item.quantity}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                        {order.items.length > 4 && (
                            <View style={styles.moreItemsIndicator}>
                                <Text style={styles.moreItemsText}>
                                    +{order.items.length - 4}
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* Item Names */}
            <Text style={styles.itemNames} numberOfLines={2}>
                {order.items.map(item => item.name).join(', ')}
            </Text>

            {/* Delivery Info */}
            {order.status !== 'cancelled' && (
                <View style={styles.deliveryInfo}>
                    {order.actualDelivery ? (
                        <View style={styles.deliveryRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#059669" />
                            <Text style={styles.deliveredText}>
                                Delivered {formatOrderDate(order.actualDelivery)}
                            </Text>
                        </View>
                    ) : order.estimatedDelivery ? (
                        <View style={styles.deliveryRow}>
                            <Ionicons name="time" size={16} color="#6B7280" />
                            <Text style={styles.expectedText}>
                                Expected {formatOrderDate(order.estimatedDelivery)}
                            </Text>
                        </View>
                    ) : (
                        <View />
                    )}

                    {order.trackingNumber && (
                        <TouchableOpacity
                            style={styles.trackButton}
                            onPress={() => handleTrackOrder(order)}
                        >
                            <Ionicons name="location" size={16} color="#004C98" />
                            <Text style={styles.trackText}>
                                Track
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004C98" />
                <Text style={styles.loadingText}>Loading your orders...</Text>
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
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Your Orders
                    </Text>
                    <TouchableOpacity
                        style={styles.searchHeaderButton}
                        onPress={() => {
                            Alert.alert('Search', 'Use the search bar below to find orders');
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="search" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search orders by number or item name"
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
            </View>

            {/* Status Filters */}
            <View style={styles.filtersSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScrollView}>
                    <View style={styles.filtersRow}>
                        {statusFilters.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterButton,
                                    selectedFilter === filter.id
                                        ? styles.filterButtonActive
                                        : styles.filterButtonInactive
                                ]}
                                onPress={() => setSelectedFilter(filter.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedFilter === filter.id
                                        ? styles.filterTextActive
                                        : styles.filterTextInactive
                                ]}>
                                    {filter.label}
                                    {filter.count > 0 && (
                                        <Text style={[
                                            styles.filterCount,
                                            selectedFilter === filter.id
                                                ? styles.filterCountActive
                                                : styles.filterCountInactive
                                        ]}>
                                            {' '}({filter.count})
                                        </Text>
                                    )}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <ScrollView
                    style={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#004C98']}
                            tintColor="#004C98"
                        />
                    }
                    contentContainerStyle={styles.emptyContentContainer}
                >
                    <View style={styles.emptyState}>
                        <Ionicons
                            name={searchQuery ? "search" : "bag-outline"}
                            size={64}
                            color="#9CA3AF"
                        />
                        <Text style={styles.emptyTitle}>
                            {searchQuery
                                ? 'No matching orders'
                                : selectedFilter === 'all'
                                    ? 'No orders yet'
                                    : `No ${selectedFilter.replace('_', ' ')} orders`
                            }
                        </Text>
                        <Text style={styles.emptyMessage}>
                            {searchQuery
                                ? 'Try adjusting your search terms'
                                : selectedFilter === 'all'
                                    ? 'Start shopping to see your orders here'
                                    : `You don't have any ${selectedFilter.replace('_', ' ')} orders`
                            }
                        </Text>
                        {!searchQuery && selectedFilter === 'all' && (
                            <TouchableOpacity
                                style={styles.startShoppingButton}
                                onPress={() => router.push('/(tabs)')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.startShoppingText}>Start Shopping</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#004C98']}
                            tintColor="#004C98"
                        />
                    }
                />
            )}

            {/* Quick Actions */}
            {filteredOrders.length > 0 && (
                <View style={styles.quickActions}>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity
                            style={styles.helpButton}
                            onPress={handleGetHelp}
                            activeOpacity={0.7}
                        >
                            <View style={styles.quickActionContent}>
                                <Ionicons name="help-circle" size={20} color="#6B7280" />
                                <Text style={styles.helpButtonText}>Get Help</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.shopAgainButton}
                            onPress={() => router.push('/(tabs)')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.quickActionContent}>
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.shopAgainButtonText}>Shop Again</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
        marginRight: 16,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
    },
    searchHeaderButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },

    // Enhanced Search Section
    searchSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        color: '#111827',
        fontSize: 16,
        fontWeight: '500',
    },

    // Enhanced Filters Section
    filtersSection: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filtersScrollView: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    filtersRow: {
        flexDirection: 'row',
        gap: 12,
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    filterButtonActive: {
        backgroundColor: '#004C98',
        shadowColor: '#004C98',
        shadowOpacity: 0.3,
        elevation: 4,
    },
    filterButtonInactive: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterText: {
        fontWeight: '600',
        fontSize: 14,
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    filterTextInactive: {
        color: '#374151',
    },
    filterCount: {
        fontSize: 12,
        fontWeight: '500',
    },
    filterCountActive: {
        color: '#BFDBFE',
    },
    filterCountInactive: {
        color: '#9CA3AF',
    },

    // Enhanced Order Card Styles
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    orderHeaderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    orderMeta: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    statusBadgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'capitalize',
        letterSpacing: 0.5,
    },

    // Enhanced Order Items
    orderItemsContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    itemsScrollView: {
        flex: 1,
    },
    itemsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    itemImageContainer: {
        alignItems: 'center',
        position: 'relative',
    },
    itemImage: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quantityBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#004C98',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    quantityText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    moreItemsIndicator: {
        width: 56,
        height: 56,
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    moreItemsText: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '700',
    },
    itemNames: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 22,
        fontWeight: '500',
    },

    // Enhanced Delivery Info
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
        backgroundColor: '#FAFBFC',
        marginHorizontal: -20,
        marginBottom: -20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deliveredText: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 14,
    },
    expectedText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    trackText: {
        color: '#004C98',
        fontWeight: '700',
        fontSize: 14,
    },

    // Enhanced Empty State
    emptyContainer: {
        flex: 1,
    },
    emptyContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyMessage: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    startShoppingButton: {
        backgroundColor: '#004C98',
        borderRadius: 16,
        paddingHorizontal: 32,
        paddingVertical: 16,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    startShoppingText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },

    // List Container
    listContainer: {
        padding: 20,
        paddingBottom: 100, // Extra space for quick actions
    },

    // Enhanced Quick Actions
    quickActions: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    helpButton: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shopAgainButton: {
        flex: 1,
        backgroundColor: '#004C98',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    quickActionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    helpButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
    shopAgainButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
});