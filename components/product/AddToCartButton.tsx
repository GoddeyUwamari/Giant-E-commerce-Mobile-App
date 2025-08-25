import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Types
interface AddToCartButtonProps {
    onPress: () => Promise<void> | void;
    disabled?: boolean;
    loading?: boolean;
    inStock?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'outline' | 'floating' | 'walmart';
    text?: string;
    successText?: string;
    showQuantity?: boolean;
    quantity?: number;
    onQuantityChange?: (quantity: number) => void;
    maxQuantity?: number;
    showIcon?: boolean;
    hapticFeedback?: boolean;
    borderRadius?: number;
    fullWidth?: boolean;
}

// Constants
const WALMART_COLORS = {
    primary: '#0071CE',
    primaryDark: '#005AA3',
    secondary: '#FFC220',
    success: '#00A652',
    successDark: '#059669',
    error: '#E53E3E',
    warning: '#FF8C00',
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    // Button specific colors
    outOfStock: '#9CA3AF',
    disabled: '#D1D5DB',
    floatingShadow: 'rgba(0, 113, 206, 0.3)',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

const TYPOGRAPHY = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
};

const ANIMATION_DURATION = {
    fast: 100,
    normal: 150,
    slow: 300,
    success: 2000,
};

// Utility Functions
const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
        case 'small':
            return {
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.sm,
                fontSize: TYPOGRAPHY.sm,
                iconSize: 16,
                minHeight: 36,
            };
        case 'large':
            return {
                paddingHorizontal: SPACING.xxxl,
                paddingVertical: SPACING.lg,
                fontSize: TYPOGRAPHY.lg,
                iconSize: 24,
                minHeight: 56,
            };
        default:
            return {
                paddingHorizontal: SPACING.xl,
                paddingVertical: SPACING.md,
                fontSize: TYPOGRAPHY.md,
                iconSize: 20,
                minHeight: 48,
            };
    }
};

// Quantity Selector Component
const QuantitySelector = React.memo(({
                                         quantity,
                                         maxQuantity,
                                         onQuantityChange,
                                         size,
                                     }: {
    quantity: number;
    maxQuantity: number;
    onQuantityChange: (quantity: number) => void;
    size: 'small' | 'medium' | 'large';
}) => {
    const sizeConfig = getSizeConfig(size);
    const isMinimum = quantity <= 1;
    const isMaximum = quantity >= maxQuantity;

    const handleDecrease = useCallback(() => {
        if (!isMinimum) {
            onQuantityChange(quantity - 1);
        }
    }, [quantity, isMinimum, onQuantityChange]);

    const handleIncrease = useCallback(() => {
        if (!isMaximum) {
            onQuantityChange(quantity + 1);
        }
    }, [quantity, isMaximum, onQuantityChange]);

    return (
        <View style={styles.quantityContainer}>
            <TouchableOpacity
                style={[
                    styles.quantityButton,
                    isMinimum && styles.quantityButtonDisabled,
                ]}
                onPress={handleDecrease}
                disabled={isMinimum}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="remove"
                    size={sizeConfig.iconSize - 4}
                    color={isMinimum ? WALMART_COLORS.gray400 : WALMART_COLORS.gray700}
                />
            </TouchableOpacity>

            <Text style={[styles.quantityText, { fontSize: sizeConfig.fontSize }]}>
                {quantity}
            </Text>

            <TouchableOpacity
                style={[
                    styles.quantityButton,
                    isMaximum && styles.quantityButtonDisabled,
                ]}
                onPress={handleIncrease}
                disabled={isMaximum}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="add"
                    size={sizeConfig.iconSize - 4}
                    color={isMaximum ? WALMART_COLORS.gray400 : WALMART_COLORS.gray700}
                />
            </TouchableOpacity>
        </View>
    );
});

// Button Content Component
const ButtonContent = React.memo(({
                                      loading,
                                      showSuccess,
                                      inStock,
                                      showIcon,
                                      text,
                                      successText,
                                      sizeConfig,
                                      variant,
                                      bounceAnim,
                                  }: {
    loading: boolean;
    showSuccess: boolean;
    inStock: boolean;
    showIcon: boolean;
    text: string;
    successText: string;
    sizeConfig: ReturnType<typeof getSizeConfig>;
    variant: string;
    bounceAnim: Animated.Value;
}) => {
    const textColor = variant === 'outline' ? WALMART_COLORS.primary : WALMART_COLORS.white;

    if (loading) {
        return (
            <View style={styles.buttonContentRow}>
                <ActivityIndicator size="small" color={textColor} />
                <Text style={[styles.buttonText, { fontSize: sizeConfig.fontSize, color: textColor }]}>
                    Adding...
                </Text>
            </View>
        );
    }

    if (showSuccess) {
        return (
            <Animated.View
                style={[styles.buttonContentRow, { transform: [{ scale: bounceAnim }] }]}
            >
                <Ionicons
                    name="checkmark-circle"
                    size={sizeConfig.iconSize}
                    color={textColor}
                />
                <Text style={[styles.buttonText, { fontSize: sizeConfig.fontSize, color: textColor }]}>
                    {successText}
                </Text>
            </Animated.View>
        );
    }

    if (!inStock) {
        return (
            <View style={styles.buttonContentRow}>
                <Ionicons
                    name="close-circle"
                    size={sizeConfig.iconSize}
                    color={WALMART_COLORS.white}
                />
                <Text style={[styles.buttonText, { fontSize: sizeConfig.fontSize, color: WALMART_COLORS.white }]}>
                    Out of Stock
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.buttonContentRow}>
            {showIcon && (
                <Ionicons
                    name="cart-outline"
                    size={sizeConfig.iconSize}
                    color={textColor}
                />
            )}
            <Text
                style={[
                    styles.buttonText,
                    {
                        fontSize: sizeConfig.fontSize,
                        color: textColor,
                        marginLeft: showIcon ? SPACING.sm : 0,
                    }
                ]}
            >
                {text}
            </Text>
        </View>
    );
});

// Floating Button Component
const FloatingButton = React.memo(({
                                       loading,
                                       showSuccess,
                                       scaleAnim,
                                       onPress,
                                       disabled,
                                       inStock,
                                   }: {
    loading: boolean;
    showSuccess: boolean;
    scaleAnim: Animated.Value;
    onPress: () => void;
    disabled: boolean;
    inStock: boolean;
}) => (
    <View style={styles.floatingContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[
                    styles.floatingButton,
                    (!inStock || disabled) && styles.floatingButtonDisabled,
                ]}
                onPress={onPress}
                disabled={disabled || loading || !inStock}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={WALMART_COLORS.white} />
                ) : showSuccess ? (
                    <Ionicons name="checkmark" size={24} color={WALMART_COLORS.white} />
                ) : (
                    <Ionicons name="cart-outline" size={24} color={WALMART_COLORS.white} />
                )}
            </TouchableOpacity>
        </Animated.View>
    </View>
));

// Main Component
export default function AddToCartButton({
                                            onPress,
                                            disabled = false,
                                            loading = false,
                                            inStock = true,
                                            size = 'medium',
                                            variant = 'primary',
                                            text = 'Add to Cart',
                                            successText = 'Added to Cart',
                                            showQuantity = false,
                                            quantity = 1,
                                            onQuantityChange,
                                            maxQuantity = 99,
                                            showIcon = true,
                                            hapticFeedback = true,
                                            borderRadius = 12,
                                            fullWidth = true,
                                        }: AddToCartButtonProps): JSX.Element {
    // State
    const [showSuccess, setShowSuccess] = useState(false);
    const [localQuantity, setLocalQuantity] = useState(quantity);

    // Animation refs
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const successAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(1)).current;

    // Computed values
    const sizeConfig = useMemo(() => getSizeConfig(size), [size]);
    const isDisabled = disabled || loading || !inStock;

    // Callbacks
    const handleQuantityChange = useCallback((newQuantity: number) => {
        const clampedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
        setLocalQuantity(clampedQuantity);
        onQuantityChange?.(clampedQuantity);
    }, [maxQuantity, onQuantityChange]);

    const handlePress = useCallback(async () => {
        if (isDisabled) return;

        // Haptic feedback
        if (hapticFeedback) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: ANIMATION_DURATION.fast,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: ANIMATION_DURATION.fast,
                useNativeDriver: true,
            }),
        ]).start();

        try {
            await onPress();

            // Success animation
            setShowSuccess(true);
            Animated.sequence([
                Animated.timing(successAnim, {
                    toValue: 1,
                    duration: ANIMATION_DURATION.slow,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1.1,
                    duration: ANIMATION_DURATION.normal,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: ANIMATION_DURATION.normal,
                    useNativeDriver: true,
                }),
            ]).start();

            // Reset success state after delay
            setTimeout(() => {
                setShowSuccess(false);
                successAnim.setValue(0);
                bounceAnim.setValue(1);
            }, ANIMATION_DURATION.success);

        } catch (error) {
            console.error('Add to cart error:', error);
        }
    }, [isDisabled, hapticFeedback, scaleAnim, successAnim, bounceAnim, onPress]);

    // Get button style based on variant and state
    const getButtonStyle = useCallback(() => {
        const baseStyle = [
            styles.button,
            {
                paddingHorizontal: sizeConfig.paddingHorizontal,
                paddingVertical: sizeConfig.paddingVertical,
                minHeight: sizeConfig.minHeight,
                borderRadius,
            },
            fullWidth && styles.buttonFullWidth,
        ];

        if (!inStock) {
            return [...baseStyle, styles.buttonOutOfStock];
        }

        if (disabled || loading) {
            return [...baseStyle, styles.buttonDisabled];
        }

        switch (variant) {
            case 'walmart':
                return [...baseStyle, styles.buttonWalmart];
            case 'secondary':
                return [...baseStyle, styles.buttonSecondary];
            case 'outline':
                return [...baseStyle, styles.buttonOutline];
            case 'floating':
                return [...baseStyle, styles.buttonPrimary];
            default:
                return [...baseStyle, styles.buttonPrimary];
        }
    }, [
        sizeConfig,
        borderRadius,
        fullWidth,
        inStock,
        disabled,
        loading,
        variant,
    ]);

    const renderButton = useCallback(() => {
        const buttonStyle = getButtonStyle();
        const buttonContent = (
            <ButtonContent
                loading={loading}
                showSuccess={showSuccess}
                inStock={inStock}
                showIcon={showIcon}
                text={text}
                successText={successText}
                sizeConfig={sizeConfig}
                variant={variant}
                bounceAnim={bounceAnim}
            />
        );

        // Use LinearGradient for primary and walmart variants when active
        if ((variant === 'primary' || variant === 'walmart') && inStock && !disabled && !loading) {
            const gradientColors = showSuccess
                ? [WALMART_COLORS.success, WALMART_COLORS.successDark]
                : variant === 'walmart'
                    ? [WALMART_COLORS.secondary, '#E6B800']
                    : [WALMART_COLORS.primary, WALMART_COLORS.primaryDark];

            return (
                <LinearGradient
                    colors={gradientColors}
                    style={[
                        styles.button,
                        {
                            paddingHorizontal: sizeConfig.paddingHorizontal,
                            paddingVertical: sizeConfig.paddingVertical,
                            minHeight: sizeConfig.minHeight,
                            borderRadius,
                        },
                        fullWidth && styles.buttonFullWidth,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {buttonContent}
                </LinearGradient>
            );
        }

        return (
            <View style={buttonStyle}>
                {buttonContent}
            </View>
        );
    }, [
        getButtonStyle,
        loading,
        showSuccess,
        inStock,
        showIcon,
        text,
        successText,
        sizeConfig,
        variant,
        bounceAnim,
        disabled,
        borderRadius,
        fullWidth,
    ]);

    // Floating variant
    if (variant === 'floating') {
        return (
            <FloatingButton
                loading={loading}
                showSuccess={showSuccess}
                scaleAnim={scaleAnim}
                onPress={handlePress}
                disabled={isDisabled}
                inStock={inStock}
            />
        );
    }

    // Regular button with optional quantity selector
    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ scale: scaleAnim }] },
                fullWidth && styles.containerFullWidth,
            ]}
        >
            {showQuantity && onQuantityChange && (
                <QuantitySelector
                    quantity={localQuantity}
                    maxQuantity={maxQuantity}
                    onQuantityChange={handleQuantityChange}
                    size={size}
                />
            )}

            <TouchableOpacity
                style={[
                    styles.touchable,
                    showQuantity && styles.touchableWithQuantity,
                    fullWidth && styles.touchableFullWidth,
                ]}
                onPress={handlePress}
                disabled={isDisabled}
                activeOpacity={0.8}
            >
                {renderButton()}
            </TouchableOpacity>
        </Animated.View>
    );
}

// Enhanced Styles
const styles = StyleSheet.create({
    // Main Container
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerFullWidth: {
        width: '100%',
    },

    // Touchable Area
    touchable: {
        flex: 1,
    },
    touchableWithQuantity: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    touchableFullWidth: {
        width: '100%',
    },

    // Button Base
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    buttonFullWidth: {
        width: '100%',
    },

    // Button Variants
    buttonPrimary: {
        backgroundColor: WALMART_COLORS.primary,
    },
    buttonWalmart: {
        backgroundColor: WALMART_COLORS.secondary,
    },
    buttonSecondary: {
        backgroundColor: WALMART_COLORS.gray600,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: WALMART_COLORS.primary,
    },
    buttonDisabled: {
        backgroundColor: WALMART_COLORS.disabled,
        ...Platform.select({
            ios: {
                shadowOpacity: 0,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    buttonOutOfStock: {
        backgroundColor: WALMART_COLORS.outOfStock,
    },

    // Button Content
    buttonContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: '600',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },

    // Quantity Selector
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WALMART_COLORS.gray100,
        borderRadius: 20,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    quantityButton: {
        backgroundColor: WALMART_COLORS.gray200,
        borderRadius: 16,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    quantityButtonDisabled: {
        backgroundColor: WALMART_COLORS.gray100,
        ...Platform.select({
            ios: {
                shadowOpacity: 0,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    quantityText: {
        fontWeight: '600',
        color: WALMART_COLORS.gray900,
        marginHorizontal: SPACING.md,
        minWidth: 24,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },

    // Floating Button
    floatingContainer: {
        position: 'absolute',
        bottom: SPACING.xxl,
        right: SPACING.xxl,
        zIndex: 10,
    },
    floatingButton: {
        backgroundColor: WALMART_COLORS.primary,
        borderRadius: 28,
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: WALMART_COLORS.floatingShadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    floatingButtonDisabled: {
        backgroundColor: WALMART_COLORS.disabled,
        ...Platform.select({
            ios: {
                shadowOpacity: 0.1,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});