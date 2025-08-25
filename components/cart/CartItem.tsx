import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CartItemProps {
    item: {
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
    };
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string) => void;
    showRemoveButton?: boolean;
    showQuantityControls?: boolean;
    compact?: boolean;
}

export default function CartItem({
                                     item,
                                     onUpdateQuantity,
                                     onRemove,
                                     showRemoveButton = true,
                                     showQuantityControls = true,
                                     compact = false,
                                 }: CartItemProps): JSX.Element {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuantityUpdate = async (newQuantity: number) => {
        if (newQuantity < 1) {
            onRemove(item.id);
            return;
        }

        if (item.maxQuantity && newQuantity > item.maxQuantity) {
            Alert.alert(
                'Quantity Limit',
                `Maximum quantity for this item is ${item.maxQuantity}.`,
                [{ text: 'OK' }]
            );
            return;
        }

        setIsUpdating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
            onUpdateQuantity(item.id, newQuantity);
        } catch (error) {
            console.error('Error updating quantity:', error);
            Alert.alert('Error', 'Failed to update quantity. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleProductPress = () => {
        router.push(`/product/${item.id}`);
    };

    const renderVariants = () => {
        if (!item.variants) return null;

        const variants = [];
        if (item.variants.color) variants.push(`Color: ${item.variants.color}`);
        if (item.variants.size) variants.push(`Size: ${item.variants.size}`);
        if (item.variants.storage) variants.push(`Storage: ${item.variants.storage}`);

        if (variants.length === 0) return null;

        return (
            <Text style={styles.variantText}>
                {variants.join(' • ')}
            </Text>
        );
    };

    const renderPricing = () => (
        <View style={styles.pricingContainer}>
            <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                </Text>
                {item.originalPrice && item.originalPrice > item.price && (
                    <Text style={styles.originalPrice}>
                        ${(item.originalPrice * item.quantity).toFixed(2)}
                    </Text>
                )}
            </View>
            <Text style={styles.unitPrice}>
                ${item.price.toFixed(2)} each
            </Text>
            {item.originalPrice && item.originalPrice > item.price && (
                <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                        Save ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                    </Text>
                </View>
            )}
        </View>
    );

    const renderQuantityControls = () => {
        if (!showQuantityControls) return null;

        const canDecrease = item.quantity > 1 && !isUpdating;
        const canIncrease = (!item.maxQuantity || item.quantity < item.maxQuantity) && !isUpdating && item.inStock;

        return (
            <View style={styles.quantityContainer}>
                <TouchableOpacity
                    style={[styles.quantityButton, !canDecrease && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityUpdate(item.quantity - 1)}
                    disabled={!canDecrease}
                >
                    <Ionicons
                        name="remove"
                        size={18}
                        color={canDecrease ? '#374151' : '#9CA3AF'}
                    />
                </TouchableOpacity>

                <View style={styles.quantityDisplay}>
                    {isUpdating ? (
                        <ActivityIndicator size="small" color="#0071CE" />
                    ) : (
                        <Text style={styles.quantityText}>
                            {item.quantity}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.quantityButton, !canIncrease && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityUpdate(item.quantity + 1)}
                    disabled={!canIncrease}
                >
                    <Ionicons
                        name="add"
                        size={18}
                        color={canIncrease ? '#374151' : '#9CA3AF'}
                    />
                </TouchableOpacity>

                {item.maxQuantity && item.quantity >= item.maxQuantity && (
                    <Text style={styles.maxQuantityText}>
                        Max qty reached
                    </Text>
                )}
            </View>
        );
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <TouchableOpacity onPress={handleProductPress}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.compactImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                <View style={styles.compactContent}>
                    <TouchableOpacity onPress={handleProductPress}>
                        <Text style={styles.compactProductName} numberOfLines={1}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.compactDetails}>
                        Qty: {item.quantity} • ${item.price.toFixed(2)} each
                    </Text>
                </View>

                <Text style={styles.compactPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContent}>
                {/* Product Image */}
                <TouchableOpacity onPress={handleProductPress}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                        {!item.inStock && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>
                                    Out of Stock
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Product Details */}
                <View style={styles.productDetails}>
                    <View style={styles.productHeader}>
                        <View style={styles.productInfo}>
                            <TouchableOpacity onPress={handleProductPress}>
                                <Text style={styles.productName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>

                            {renderVariants()}

                            <Text style={styles.sellerText}>
                                Sold by {item.seller}
                            </Text>

                            {!item.inStock && (
                                <View style={styles.unavailableContainer}>
                                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                    <Text style={styles.unavailableText}>
                                        Currently unavailable
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Pricing */}
                        {renderPricing()}
                    </View>

                    {/* Controls Section */}
                    <View style={styles.controlsSection}>
                        <View style={styles.quantitySection}>
                            {renderQuantityControls()}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleProductPress}
                            >
                                <Ionicons name="eye-outline" size={20} color="#6B7280" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    // TODO: Add to favorites
                                    console.log('Add to favorites:', item.id);
                                }}
                            >
                                <Ionicons name="heart-outline" size={20} color="#6B7280" />
                            </TouchableOpacity>

                            {showRemoveButton && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => onRemove(item.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Main Container Styles
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    // Compact View Styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    compactImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    compactContent: {
        flex: 1,
        marginLeft: 12,
    },
    compactProductName: {
        fontWeight: '500',
        color: '#111827',
        fontSize: 14,
        lineHeight: 20,
    },
    compactDetails: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 2,
    },
    compactPrice: {
        color: '#0071CE',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Main Content Layout
    mainContent: {
        flexDirection: 'row',
    },

    // Product Image Styles
    imageContainer: {
        position: 'relative',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    outOfStockOverlay: {
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
    outOfStockText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Product Details
    productDetails: {
        flex: 1,
        marginLeft: 16,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    productInfo: {
        flex: 1,
        marginRight: 12,
    },
    productName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 4,
    },
    variantText: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    sellerText: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 4,
    },
    unavailableContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    unavailableText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },

    // Pricing Styles
    pricingContainer: {
        alignItems: 'flex-end',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentPrice: {
        color: '#0071CE',
        fontWeight: 'bold',
        fontSize: 18,
    },
    originalPrice: {
        color: '#9CA3AF',
        fontSize: 14,
        textDecorationLine: 'line-through',
        marginLeft: 8,
    },
    unitPrice: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 2,
    },
    savingsBadge: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    savingsText: {
        color: '#DC2626',
        fontSize: 11,
        fontWeight: '600',
    },

    // Controls Section
    controlsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    quantitySection: {
        flex: 1,
    },

    // Quantity Controls
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quantityButtonDisabled: {
        backgroundColor: '#F9FAFB',
        borderColor: '#F3F4F6',
    },
    quantityDisplay: {
        marginHorizontal: 16,
        minWidth: 32,
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    maxQuantityText: {
        color: '#F59E0B',
        fontSize: 11,
        marginLeft: 12,
        fontWeight: '500',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    actionButton: {
        padding: 8,
        marginLeft: 4,
    },
});