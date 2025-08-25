import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    RefreshControl,
    Alert,
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
interface OrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    imageId: string | number; // Changed from image URL to imageId
    brand: string;
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
    date: string;
    status: 'delivered' | 'shipped' | 'processing' | 'cancelled' | 'returned';
    total: number;
    itemCount: number;
    deliveryDate?: string;
    shippingMethod: string;
    items: OrderItem[];
    paymentMethod: string;
    trackingNumber?: string;
    cancellationReason?: string;
    returnDate?: string;
    returnReason?: string;
    estimatedDelivery?: string;
}

// Generate mock orders using real product data
const generateMockOrders = (): Order[] => {
    const sampleProducts = ALL_PRODUCTS.slice(0, 15); // Use first 15 products
    const statuses: Order['status'][] = ['delivered', 'shipped', 'processing', 'cancelled', 'returned'];
    const paymentMethods = ['Visa •••• 1234', 'Mastercard •••• 5678', 'PayPal', 'Apple Pay'];
    const shippingMethods = ['Free 2-Day Delivery', 'Standard Shipping', 'Express Delivery', 'Walmart+ Free Delivery'];

    return Array.from({ length: 8 }, (_, orderIndex) => {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - (orderIndex * 5 + Math.floor(Math.random() * 5)));

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const itemCount = Math.floor(Math.random() * 4) + 1; // 1-4 items per order

        // Select random products for this order
        const orderProducts = sampleProducts
            .sort(() => 0.5 - Math.random())
            .slice(0, itemCount);

        const items: OrderItem[] = orderProducts.map((product, itemIndex) => ({
            id: `${orderIndex}_${itemIndex}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            quantity: Math.floor(Math.random() * 2) + 1, // 1-2 quantity
            imageId: product.id, // Use product ID for smart image loading
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

        let deliveryDate: string | undefined;
        let trackingNumber: string | undefined;

        if (status === 'delivered') {
            const delivery = new Date(orderDate);
            delivery.setDate(delivery.getDate() + Math.floor(Math.random() * 5) + 2);
            deliveryDate = delivery.toISOString().split('T')[0];
        }

        if (['delivered', 'shipped', 'processing'].includes(status)) {
            trackingNumber = `TRK${Math.floor(Math.random() * 1000000000)}`;
        }

        const order: Order = {
            id: `WM12345678${orderIndex}`,
            orderNumber: `#12345678${orderIndex}`,
            date: orderDate.toISOString().split('T')[0],
            status,
            total: Math.round(total * 100) / 100,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
            deliveryDate,
            shippingMethod: shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
            items,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            trackingNumber,
        };

        // Add specific data for cancelled/returned orders
        if (status === 'cancelled') {
            order.cancellationReason = 'Customer requested cancellation';
        } else if (status === 'returned') {
            order.returnDate = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            order.returnReason = 'Defective item';
        }

        return order;
    });
};

const timeFilters = [
    { id: 'all', label: 'All Time' },
    { id: '30days', label: 'Last 30 Days' },
    { id: '6months', label: 'Last 6 Months' },
    { id: 'year', label: 'This Year' },
];

export default function OrderHistoryScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
    const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

    // Cart store for reorder functionality
    const addItem = useCartStore((state) => state.addItem);

    // Dynamic filter options based on actual data
    const filterOptions = [
        { id: 'all', label: 'All Orders', count: orders.length },
        { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
        { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
        { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
        { id: 'returned', label: 'Returned', count: orders.filter(o => o.status === 'returned').length },
    ].filter(option => option.count > 0); // Only show filters with orders

    useEffect(() => {
        loadOrderHistory();
    }, []);

    // Enhanced order loading with product data integration
    const loadOrderHistory = async () => {
        try {
            setIsLoading(true);

            // TODO: Replace with actual API call
            // const response = await fetch('/api/orders/history');
            // if (!response.ok) throw new Error('Failed to fetch orders');
            // const orderData = await response.json();

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
            console.error('Error loading order history:', error);
            Alert.alert('Error', 'Failed to load order history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadOrderHistory();
        setRefreshing(false);
    };

    const handleOrderPress = (orderId: string) => {
        router.push(`/orders/${orderId}`);
    };

    // Enhanced reorder with cart store integration
    const handleReorder = async (order: Order) => {
        Alert.alert(
            'Reorder Items',
            `Add ${order.itemCount} items from order ${order.orderNumber} to your cart?`,
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
                                    brand: item.brand,
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

    const handleTrackOrder = (trackingNumber: string) => {
        Alert.alert(
            'Track Order',
            `Track your package using: ${trackingNumber}`,
            [
                { text: 'Copy Number', onPress: () => console.log('Copied:', trackingNumber) },
                { text: 'OK', style: 'cancel' }
            ]
        );
    };

    const toggleOrderExpansion = (orderId: string) => {
        setExpandedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const getFilteredOrders = () => {
        let filtered = orders;

        // Filter by status
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(order => order.status === selectedFilter);
        }

        // Filter by time
        if (selectedTimeFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (selectedTimeFilter) {
                case '30days':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case '6months':
                    filterDate.setMonth(now.getMonth() - 6);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear());
                    filterDate.setMonth(0);
                    filterDate.setDate(1);
                    break;
            }

            filtered = filtered.filter(order => new Date(order.date) >= filterDate);
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return COLORS.success;
            case 'shipped':
                return COLORS.walmartBlue;
            case 'processing':
                return COLORS.warning;
            case 'cancelled':
                return COLORS.error;
            case 'returned':
                return COLORS.mediumGray;
            default:
                return COLORS.mediumGray;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'checkmark-circle';
            case 'shipped':
                return 'car';
            case 'processing':
                return 'time';
            case 'cancelled':
                return 'close-circle';
            case 'returned':
                return 'return-up-back';
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

    const renderOrderItem = ({ item }: { item: Order }) => {
        const isExpanded = expandedOrders.includes(item.id);

        return (
            <View style={styles.orderCard}>
                <TouchableOpacity
                    style={styles.orderHeader}
                    onPress={() => toggleOrderExpansion(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.orderMainInfo}>
                        <View style={styles.orderTitleRow}>
                            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
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
                        <Text style={styles.orderDate}>Ordered on {formatDate(item.date)}</Text>
                        <View style={styles.orderSummary}>
                            <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
                            <Text style={styles.orderItems}>{item.itemCount} items</Text>
                        </View>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={COLORS.mediumGray}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.orderDetails}>
                        {/* Order Items with smart image loading */}
                        <Text style={styles.sectionTitle}>Items Ordered</Text>
                        {item.items.map((orderItem, index) => (
                            <View key={orderItem.id} style={styles.orderItemRow}>
                                <Image
                                    source={getOrderItemImage(orderItem)}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemBrand}>{orderItem.brand}</Text>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {orderItem.name}
                                    </Text>
                                    {(orderItem.variant?.color || orderItem.variant?.size) && (
                                        <View style={styles.variantContainer}>
                                            {orderItem.variant.color && (
                                                <Text style={styles.variantText}>Color: {orderItem.variant.color}</Text>
                                            )}
                                            {orderItem.variant.size && (
                                                <Text style={styles.variantText}>Size: {orderItem.variant.size}</Text>
                                            )}
                                        </View>
                                    )}
                                    <View style={styles.itemPriceRow}>
                                        <View style={styles.priceContainer}>
                                            <Text style={styles.itemPrice}>${orderItem.price.toFixed(2)}</Text>
                                            {orderItem.originalPrice && orderItem.originalPrice > orderItem.price && (
                                                <Text style={styles.itemOriginalPrice}>
                                                    ${orderItem.originalPrice.toFixed(2)}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.itemQuantity}>Qty: {orderItem.quantity}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}

                        {/* Order Information */}
                        <View style={styles.orderInfoSection}>
                            <Text style={styles.sectionTitle}>Order Information</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Payment Method:</Text>
                                <Text style={styles.infoValue}>{item.paymentMethod}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Shipping Method:</Text>
                                <Text style={styles.infoValue}>{item.shippingMethod}</Text>
                            </View>
                            {item.deliveryDate && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Delivered:</Text>
                                    <Text style={styles.infoValue}>{formatDate(item.deliveryDate)}</Text>
                                </View>
                            )}
                            {item.trackingNumber && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Tracking:</Text>
                                    <TouchableOpacity onPress={() => handleTrackOrder(item.trackingNumber!)}>
                                        <Text style={[styles.infoValue, { color: COLORS.walmartBlue }]}>
                                            {item.trackingNumber}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {item.cancellationReason && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Cancelled:</Text>
                                    <Text style={styles.infoValue}>{item.cancellationReason}</Text>
                                </View>
                            )}
                            {item.returnReason && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Return Reason:</Text>
                                    <Text style={styles.infoValue}>{item.returnReason}</Text>
                                </View>
                            )}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleOrderPress(item.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.actionButtonText}>View Details</Text>
                            </TouchableOpacity>
                            {item.status === 'delivered' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.primaryButton]}
                                    onPress={() => handleReorder(item)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                                        Reorder
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const filteredOrders = getFilteredOrders();

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.walmartBlue} />
                <Text style={styles.loadingText}>Loading your orders...</Text>
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
                <Text style={styles.headerTitle}>Purchase History</Text>
                <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
                    <Ionicons name="search-outline" size={24} color={COLORS.walmartBlue} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScrollView}
                    contentContainerStyle={styles.filterContent}
                >
                    {filterOptions.map((filter) => (
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
                                {filter.label} ({filter.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.timeFilterScrollView}
                    contentContainerStyle={styles.filterContent}
                >
                    {timeFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.timeFilterChip,
                                selectedTimeFilter === filter.id && styles.timeFilterChipActive
                            ]}
                            onPress={() => setSelectedTimeFilter(filter.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.timeFilterChipText,
                                selectedTimeFilter === filter.id && styles.timeFilterChipTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results Summary */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                </Text>
                <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.sortButton}>Sort by Date ↓</Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.ordersList}
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
                        <Ionicons name="receipt-outline" size={64} color={COLORS.mediumGray} />
                        <Text style={styles.emptyStateTitle}>No Orders Found</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            {selectedFilter === 'all'
                                ? "You haven't placed any orders yet. Start shopping to see your order history here!"
                                : "Try adjusting your filters or check back later"}
                        </Text>
                        {selectedFilter === 'all' && (
                            <TouchableOpacity
                                style={styles.shopNowButton}
                                onPress={() => router.push('/(tabs)/')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.shopNowButtonText}>Start Shopping</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    searchButton: {
        padding: 4,
    },
    filtersContainer: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterScrollView: {
        paddingVertical: 12,
    },
    timeFilterScrollView: {
        paddingBottom: 12,
    },
    filterContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    filterChipActive: {
        backgroundColor: COLORS.walmartBlue,
        borderColor: COLORS.walmartBlue,
        shadowColor: COLORS.walmartBlue,
        shadowOpacity: 0.3,
        elevation: 3,
    },
    filterChipText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    timeFilterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: COLORS.lightGray,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    timeFilterChipActive: {
        backgroundColor: COLORS.walmartBlue,
        shadowColor: COLORS.walmartBlue,
        shadowOpacity: 0.3,
        elevation: 2,
    },
    timeFilterChipText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    timeFilterChipTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    resultsCount: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    sortButton: {
        fontSize: 14,
        color: COLORS.walmartBlue,
        fontWeight: '500',
    },
    ordersList: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    orderMainInfo: {
        flex: 1,
    },
    orderTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    statusText: {
        fontSize: 11,
        color: COLORS.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    orderDate: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    orderSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    orderItems: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    orderDetails: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        padding: 16,
        backgroundColor: '#FAFBFC',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    orderItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        marginBottom: 8,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: COLORS.lightGray,
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
        color: COLORS.textSecondary,
        marginBottom: 2,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.textPrimary,
        marginBottom: 6,
        lineHeight: 18,
        fontWeight: '600',
    },
    variantContainer: {
        marginBottom: 6,
    },
    variantText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
        fontWeight: '500',
    },
    itemPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    itemOriginalPrice: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },
    itemQuantity: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    orderInfoSection: {
        marginTop: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        alignItems: 'center',
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryButton: {
        backgroundColor: COLORS.walmartBlue,
        borderColor: COLORS.walmartBlue,
        shadowColor: COLORS.walmartBlue,
        shadowOpacity: 0.3,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: COLORS.white,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    shopNowButton: {
        backgroundColor: COLORS.walmartBlue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    shopNowButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
});