import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import QuickAddButton from './QuickAddButton';

const { height: screenHeight } = Dimensions.get('window');

interface CartItemType {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    quantity: number;
    seller: string;
    variants?: {
        color?: string;
        size?: string;
        storage?: string;
    };
    inStock: boolean;
    maxQuantity?: number;
}

interface CartDrawerProps {
    visible: boolean;
    onClose: () => void;
    items?: CartItemType[];
    onUpdateQuantity?: (itemId: string, quantity: number) => void;
    onRemoveItem?: (itemId: string) => void;
    onCheckout?: () => void;
}

// Mock cart items - replace with actual cart state management
const mockCartItems: CartItemType[] = [
    {
        id: '1',
        name: 'iPhone 15 Pro Max 256GB Deep Purple',
        price: 1199.99,
        originalPrice: 1299.99,
        image: 'https://via.placeholder.com/80x80/3B82F6/ffffff?text=iPhone',
        quantity: 1,
        seller: 'Apple',
        variants: { color: 'Deep Purple', storage: '256GB' },
        inStock: true,
        maxQuantity: 10,
    },
    {
        id: '2',
        name: 'AirPods Pro (2nd Generation)',
        price: 249.99,
        image: 'https://via.placeholder.com/80x80/8B5CF6/ffffff?text=AirPods',
        quantity: 2,
        seller: 'Apple',
        inStock: true,
        maxQuantity: 5,
    },
    {
        id: '3',
        name: 'MagSafe Charger',
        price: 39.99,
        originalPrice: 49.99,
        image: 'https://via.placeholder.com/80x80/10B981/ffffff?text=MagSafe',
        quantity: 1,
        seller: 'Apple',
        inStock: false,
        maxQuantity: 3,
    },
];

export default function CartDrawer({
                                       visible,
                                       onClose,
                                       items = mockCartItems,
                                       onUpdateQuantity,
                                       onRemoveItem,
                                       onCheckout,
                                   }: CartDrawerProps): JSX.Element {
    const [cartItems, setCartItems] = useState<CartItemType[]>(items);
    const [isLoading, setIsLoading] = useState(false);
    const [slideAnim] = useState(new Animated.Value(screenHeight));

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        } else {
            Animated.spring(slideAnim, {
                toValue: screenHeight,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }
    }, [visible]);

    useEffect(() => {
        setCartItems(items);
    }, [items]);

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }

        const updatedItems = cartItems.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);

        // Save to storage
        try {
            await AsyncStorage.setItem('cart_items', JSON.stringify(updatedItems));
        } catch (error) {
            console.error('Error saving cart:', error);
        }

        // Call parent callback if provided
        onUpdateQuantity?.(itemId, newQuantity);
    };

    const handleRemoveItem = async (itemId: string) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedItems = cartItems.filter(item => item.id !== itemId);
                        setCartItems(updatedItems);

                        // Save to storage
                        try {
                            await AsyncStorage.setItem('cart_items', JSON.stringify(updatedItems));
                        } catch (error) {
                            console.error('Error saving cart:', error);
                        }

                        // Call parent callback if provided
                        onRemoveItem?.(itemId);
                    }
                }
            ]
        );
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
            return;
        }

        // Check for out of stock items
        const outOfStockItems = cartItems.filter(item => !item.inStock);
        if (outOfStockItems.length > 0) {
            Alert.alert(
                'Items Out of Stock',
                'Some items in your cart are out of stock. Please remove them to continue.',
                [{ text: 'OK' }]
            );
            return;
        }

        onClose();
        if (onCheckout) {
            onCheckout();
        } else {
            router.push('/checkout');
        }
    };

    const handleContinueShopping = () => {
        onClose();
        router.push('/(tabs)');
    };

    const handleClearCart = () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        setCartItems([]);
                        try {
                            await AsyncStorage.removeItem('cart_items');
                        } catch (error) {
                            console.error('Error clearing cart:', error);
                        }
                    }
                }
            ]
        );
    };

    const calculateSubtotal = (): number => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateSavings = (): number => {
        return cartItems.reduce((total, item) => {
            if (item.originalPrice && item.originalPrice > item.price) {
                return total + ((item.originalPrice - item.price) * item.quantity);
            }
            return total;
        }, 0);
    };

    const renderEmptyCart = () => (
        <View style={styles.emptyCartContainer}>
            <View style={styles.emptyCartIcon}>
                <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyCartTitle}>
                Your cart is empty
            </Text>
            <Text style={styles.emptyCartSubtitle}>
                Discover amazing products and start saving with Walmart
            </Text>
            <TouchableOpacity
                style={styles.startShoppingButton}
                onPress={handleContinueShopping}
                activeOpacity={0.8}
            >
                <Ionicons name="storefront" size={20} color="#FFFFFF" />
                <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
            </TouchableOpacity>

            {/* Popular Categories */}
            <View style={styles.popularCategories}>
                <Text style={styles.popularCategoriesTitle}>Popular Categories</Text>
                <View style={styles.categoriesGrid}>
                    <TouchableOpacity style={styles.categoryItem} onPress={() => {
                        onClose();
                        router.push('/category/electronics');
                    }}>
                        <Ionicons name="phone-portrait" size={24} color="#004C98" />
                        <Text style={styles.categoryText}>Electronics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryItem} onPress={() => {
                        onClose();
                        router.push('/category/home');
                    }}>
                        <Ionicons name="home" size={24} color="#004C98" />
                        <Text style={styles.categoryText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryItem} onPress={() => {
                        onClose();
                        router.push('/category/grocery');
                    }}>
                        <Ionicons name="basket" size={24} color="#004C98" />
                        <Text style={styles.categoryText}>Grocery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryItem} onPress={() => {
                        onClose();
                        router.push('/category/fashion');
                    }}>
                        <Ionicons name="shirt" size={24} color="#004C98" />
                        <Text style={styles.categoryText}>Fashion</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderCartContent = () => (
        <>
            {/* Cart Items */}
            <View style={styles.cartItemsContainer}>
                <FlatList
                    data={cartItems}
                    renderItem={({ item }) => (
                        <CartItem
                            item={item}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={handleRemoveItem}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.cartItemsList}
                    ItemSeparatorComponent={() => <View style={styles.cartItemSeparator} />}
                />
            </View>

            {/* Quick Add Section */}
            <View style={styles.quickAddSection}>
                <Text style={styles.quickAddTitle}>
                    Frequently Bought Together
                </Text>
                <QuickAddButton
                    productName="iPhone 15 Pro Case"
                    price={29.99}
                    image="https://via.placeholder.com/60x60/EF4444/ffffff?text=Case"
                    onAdd={() => {
                        // Handle quick add
                        console.log('Quick add item');
                    }}
                />
            </View>

            {/* Cart Summary */}
            <CartSummary
                subtotal={calculateSubtotal()}
                savings={calculateSavings()}
                itemCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
                onCheckout={handleCheckout}
            />
        </>
    );

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="none"
        >
            {/* Backdrop */}
            <BlurView intensity={20} style={styles.backdrop} tint="dark">
                <TouchableOpacity
                    style={styles.backdropTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    {/* Cart Drawer */}
                    <Animated.View
                        style={[
                            styles.cartDrawer,
                            {
                                transform: [{ translateY: slideAnim }],
                                height: screenHeight * 0.85,
                                marginTop: screenHeight * 0.15,
                            }
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1} style={styles.drawerContent}>
                            {/* Handle */}
                            <View style={styles.handleContainer}>
                                <View style={styles.handle} />
                            </View>

                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <View style={styles.cartIconContainer}>
                                        <Ionicons name="bag" size={24} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.headerTitle}>
                                        Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                                    </Text>
                                </View>
                                <View style={styles.headerRight}>
                                    {cartItems.length > 0 && (
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={handleClearCart}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                            <Text style={styles.clearButtonText}>Clear</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={onClose}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="close" size={24} color="#374151" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Content */}
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#004C98" />
                                    <Text style={styles.loadingText}>Loading cart...</Text>
                                </View>
                            ) : cartItems.length === 0 ? (
                                renderEmptyCart()
                            ) : (
                                renderCartContent()
                            )}

                            {/* Savings Banner */}
                            {calculateSavings() > 0 && (
                                <View style={styles.savingsBanner}>
                                    <View style={styles.savingsContent}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                        <Text style={styles.savingsText}>
                                            You're saving ${calculateSavings().toFixed(2)} on this order!
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    // Backdrop and Modal
    backdrop: {
        flex: 1,
    },
    backdropTouchable: {
        flex: 1,
    },
    cartDrawer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    drawerContent: {
        flex: 1,
    },

    // Handle
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 48,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cartIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#004C98',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#FEF2F2',
    },
    clearButtonText: {
        color: '#EF4444',
        fontWeight: '500',
        marginLeft: 4,
        fontSize: 14,
    },
    closeButton: {
        padding: 4,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 8,
        fontSize: 16,
    },

    // Empty Cart
    emptyCartContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyCartIcon: {
        width: 96,
        height: 96,
        backgroundColor: '#F3F4F6',
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyCartTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyCartSubtitle: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 16,
        lineHeight: 24,
    },
    startShoppingButton: {
        backgroundColor: '#004C98',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        elevation: 3,
        shadowColor: '#004C98',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    startShoppingButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
    },

    // Popular Categories
    popularCategories: {
        width: '100%',
        maxWidth: 320,
    },
    popularCategoriesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '48%',
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    categoryText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
    },

    // Cart Items
    cartItemsContainer: {
        flex: 1,
    },
    cartItemsList: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    cartItemSeparator: {
        height: 12,
    },

    // Quick Add Section
    quickAddSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#F8FAFC',
    },
    quickAddTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },

    // Savings Banner
    savingsBanner: {
        backgroundColor: '#ECFDF5',
        padding: 12,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    savingsContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingsText: {
        color: '#065F46',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
});