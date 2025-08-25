import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface QuickAddButtonProps {
    productId?: string;
    productName: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating?: number;
    inStock?: boolean;
    onAdd: (productId?: string) => void;
    showDetails?: boolean;
    compact?: boolean;
}

export default function QuickAddButton({
                                           productId,
                                           productName,
                                           price,
                                           originalPrice,
                                           image,
                                           rating,
                                           inStock = true,
                                           onAdd,
                                           showDetails = true,
                                           compact = false,
                                       }: QuickAddButtonProps): JSX.Element {
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = async () => {
        if (!inStock) return;

        setIsAdding(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));

            onAdd(productId);
            setIsAdded(true);

            // Reset added state after 2 seconds
            setTimeout(() => setIsAdded(false), 2000);

        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleProductPress = () => {
        if (productId) {
            router.push(`/product/${productId}`);
        }
    };

    const getAddButtonStyle = () => {
        if (!inStock) return styles.addButtonDisabled;
        if (isAdded) return styles.addButtonSuccess;
        return styles.addButton;
    };

    if (compact) {
        return (
            <View style={[
                styles.compactContainer,
                !inStock && styles.containerDisabled
            ]}>
                <TouchableOpacity onPress={handleProductPress} disabled={!productId}>
                    <Image
                        source={{ uri: image }}
                        style={styles.compactImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                <View style={styles.compactContent}>
                    <TouchableOpacity onPress={handleProductPress} disabled={!productId}>
                        <Text style={styles.compactProductName} numberOfLines={1}>
                            {productName}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.compactPriceRow}>
                        <Text style={styles.compactPrice}>
                            ${price.toFixed(2)}
                        </Text>
                        {originalPrice && originalPrice > price && (
                            <Text style={styles.compactOriginalPrice}>
                                ${originalPrice.toFixed(2)}
                            </Text>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.compactAddButton, getAddButtonStyle()]}
                    onPress={handleAddToCart}
                    disabled={!inStock || isAdding || isAdded}
                >
                    {isAdding ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : isAdded ? (
                        <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                        <Ionicons
                            name="add"
                            size={16}
                            color={!inStock ? '#9CA3AF' : 'white'}
                        />
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[
            styles.container,
            !inStock && styles.containerDisabled
        ]}>
            <View style={styles.mainContent}>
                {/* Product Image */}
                <TouchableOpacity onPress={handleProductPress} disabled={!productId}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: image }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                        {!inStock && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>
                                    Out
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Product Details */}
                <View style={styles.productDetails}>
                    <TouchableOpacity onPress={handleProductPress} disabled={!productId}>
                        <Text style={styles.productName} numberOfLines={2}>
                            {productName}
                        </Text>
                    </TouchableOpacity>

                    {/* Rating */}
                    {rating && showDetails && (
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text style={styles.ratingText}>
                                {rating}
                            </Text>
                        </View>
                    )}

                    {/* Pricing */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>
                            ${price.toFixed(2)}
                        </Text>
                        {originalPrice && originalPrice > price && (
                            <Text style={styles.originalPrice}>
                                ${originalPrice.toFixed(2)}
                            </Text>
                        )}
                    </View>

                    {/* Discount Badge */}
                    {originalPrice && originalPrice > price && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                Save ${(originalPrice - price).toFixed(2)}
                            </Text>
                        </View>
                    )}

                    {/* Stock Status */}
                    {!inStock && (
                        <View style={styles.stockStatusContainer}>
                            <Ionicons name="alert-circle" size={14} color="#EF4444" />
                            <Text style={styles.stockStatusText}>
                                Out of stock
                            </Text>
                        </View>
                    )}
                </View>

                {/* Add Button */}
                <View style={styles.addButtonContainer}>
                    <TouchableOpacity
                        style={[styles.addButtonLarge, getAddButtonStyle()]}
                        onPress={handleAddToCart}
                        disabled={!inStock || isAdding || isAdded}
                    >
                        {isAdding ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : isAdded ? (
                            <Ionicons name="checkmark" size={20} color="white" />
                        ) : (
                            <Ionicons
                                name="add"
                                size={20}
                                color={!inStock ? '#9CA3AF' : 'white'}
                            />
                        )}
                    </TouchableOpacity>

                    {inStock && (
                        <Text style={styles.addButtonLabel}>
                            {isAdded ? 'Added!' : 'Quick Add'}
                        </Text>
                    )}
                </View>
            </View>

            {/* Additional Actions */}
            {showDetails && productId && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleProductPress}
                    >
                        <Ionicons name="eye-outline" size={16} color="#6B7280" />
                        <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            // TODO: Add to favorites functionality
                            console.log('Add to favorites:', productId);
                        }}
                    >
                        <Ionicons name="heart-outline" size={16} color="#6B7280" />
                        <Text style={styles.actionButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Main Container Styles
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
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
    containerDisabled: {
        borderColor: '#E5E7EB',
        opacity: 0.6,
    },

    // Compact View Styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
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
    compactPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    compactPrice: {
        color: '#0071CE',
        fontWeight: 'bold',
        fontSize: 14,
    },
    compactOriginalPrice: {
        color: '#9CA3AF',
        fontSize: 12,
        textDecorationLine: 'line-through',
        marginLeft: 8,
    },
    compactAddButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
        width: 64,
        height: 64,
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
    productName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 4,
    },

    // Rating Styles
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        color: '#6B7280',
        fontSize: 13,
        marginLeft: 4,
        fontWeight: '500',
    },

    // Pricing Styles
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
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

    // Discount Badge
    discountBadge: {
        backgroundColor: '#FEF2F2',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    discountText: {
        color: '#DC2626',
        fontSize: 11,
        fontWeight: '600',
    },

    // Stock Status
    stockStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    stockStatusText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },

    // Add Button Styles
    addButtonContainer: {
        marginLeft: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonLarge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    addButton: {
        backgroundColor: '#0071CE',
    },
    addButtonSuccess: {
        backgroundColor: '#10B981',
    },
    addButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    addButtonLabel: {
        color: '#6B7280',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
    },

    // Actions Section
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#F9FAFB',
    },
    actionButtonText: {
        color: '#6B7280',
        fontSize: 13,
        marginLeft: 4,
        fontWeight: '500',
    },
});