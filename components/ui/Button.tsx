import React, { useMemo } from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    View,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
    StyleSheet,
    Pressable,
    PressableProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'success' | 'warning';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'rounded' | 'pill' | 'square';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    iconSize?: number;
    style?: ViewStyle;
    textStyle?: TextStyle;
    loadingText?: string;
    hapticFeedback?: boolean;
    animatePress?: boolean;
    testID?: string;
}

export default function Button({
                                   children,
                                   variant = 'primary',
                                   size = 'md',
                                   shape = 'rounded',
                                   fullWidth = false,
                                   loading = false,
                                   disabled = false,
                                   leftIcon,
                                   rightIcon,
                                   iconSize,
                                   style,
                                   textStyle,
                                   loadingText,
                                   hapticFeedback = true,
                                   animatePress = true,
                                   testID,
                                   onPress,
                                   ...props
                               }: ButtonProps): JSX.Element {
    const isDisabled = disabled || loading;

    const containerStyle = useMemo(() => [
        styles.base,
        styles.sizes[size].container,
        styles.shapes[shape],
        styles.variants[variant].container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.variants[variant].disabled,
        style,
    ], [variant, size, shape, fullWidth, isDisabled, style]);

    const textStyles = useMemo(() => [
        styles.baseText,
        styles.sizes[size].text,
        styles.variants[variant].text,
        isDisabled && styles.variants[variant].disabledText,
        textStyle,
    ], [variant, size, isDisabled, textStyle]);

    const finalIconSize = iconSize || styles.sizes[size].iconSize;
    const iconColor = getIconColor(variant, isDisabled);

    const handlePress = (event: any) => {
        if (isDisabled) return;

        if (hapticFeedback && global.HapticFeedback) {
            global.HapticFeedback.impact(global.HapticFeedback.ImpactFeedbackStyle.Light);
        }

        onPress?.(event);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="small"
                        color={iconColor}
                        style={loadingText ? styles.loadingIndicator : undefined}
                    />
                    {loadingText && (
                        <Text style={textStyles} numberOfLines={1}>
                            {loadingText}
                        </Text>
                    )}
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={finalIconSize}
                        color={iconColor}
                        style={styles.leftIcon}
                    />
                )}

                <Text style={textStyles} numberOfLines={1} adjustsFontSizeToFit>
                    {children}
                </Text>

                {rightIcon && (
                    <Ionicons
                        name={rightIcon}
                        size={finalIconSize}
                        color={iconColor}
                        style={styles.rightIcon}
                    />
                )}
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={animatePress ? (isDisabled ? 1 : 0.7) : 1}
            testID={testID}
            accessibilityRole="button"
            accessibilityState={{
                disabled: isDisabled,
                busy: loading,
            }}
            accessibilityLabel={typeof children === 'string' ? children : undefined}
            {...props}
        >
            {renderContent()}
        </TouchableOpacity>
    );
}

// Helper function to determine icon color
function getIconColor(variant: string, isDisabled: boolean): string {
    if (isDisabled) {
        switch (variant) {
            case 'outline':
            case 'ghost':
            case 'link':
                return '#9CA3AF'; // gray-400
            default:
                return 'rgba(255, 255, 255, 0.5)';
        }
    }

    switch (variant) {
        case 'primary':
        case 'destructive':
        case 'success':
            return '#FFFFFF';
        case 'secondary':
            return '#111827'; // gray-900
        case 'outline':
        case 'ghost':
            return '#374151'; // gray-700
        case 'link':
            return '#2563EB'; // blue-600
        case 'warning':
            return '#FFFFFF';
        default:
            return '#374151';
    }
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    baseText: {
        fontWeight: '600',
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },

    fullWidth: {
        width: '100%',
    },

    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingIndicator: {
        marginRight: 8,
    },

    leftIcon: {
        marginRight: 8,
    },

    rightIcon: {
        marginLeft: 8,
    },

    // Size variants
    sizes: {
        xs: {
            container: {
                paddingHorizontal: 8,
                paddingVertical: 4,
                minHeight: 24,
            },
            text: {
                fontSize: 11,
                lineHeight: 16,
            },
            iconSize: 12,
        },
        sm: {
            container: {
                paddingHorizontal: 12,
                paddingVertical: 8,
                minHeight: 32,
            },
            text: {
                fontSize: 13,
                lineHeight: 18,
            },
            iconSize: 14,
        },
        md: {
            container: {
                paddingHorizontal: 16,
                paddingVertical: 12,
                minHeight: 40,
            },
            text: {
                fontSize: 15,
                lineHeight: 20,
            },
            iconSize: 16,
        },
        lg: {
            container: {
                paddingHorizontal: 24,
                paddingVertical: 16,
                minHeight: 48,
            },
            text: {
                fontSize: 17,
                lineHeight: 24,
            },
            iconSize: 18,
        },
        xl: {
            container: {
                paddingHorizontal: 32,
                paddingVertical: 20,
                minHeight: 56,
            },
            text: {
                fontSize: 19,
                lineHeight: 28,
            },
            iconSize: 20,
        },
    },

    // Shape variants
    shapes: {
        rounded: {
            borderRadius: 8,
        },
        pill: {
            borderRadius: 100,
        },
        square: {
            borderRadius: 0,
        },
    },

    // Color and style variants
    variants: {
        primary: {
            container: {
                backgroundColor: '#3B82F6',
                borderColor: '#3B82F6',
            },
            text: {
                color: '#FFFFFF',
            },
            disabled: {
                backgroundColor: '#93C5FD',
                borderColor: '#93C5FD',
            },
            disabledText: {
                color: 'rgba(255, 255, 255, 0.7)',
            },
        },
        secondary: {
            container: {
                backgroundColor: '#F3F4F6',
                borderColor: '#F3F4F6',
            },
            text: {
                color: '#111827',
            },
            disabled: {
                backgroundColor: '#E5E7EB',
                borderColor: '#E5E7EB',
            },
            disabledText: {
                color: '#9CA3AF',
            },
        },
        outline: {
            container: {
                backgroundColor: 'transparent',
                borderColor: '#D1D5DB',
            },
            text: {
                color: '#374151',
            },
            disabled: {
                backgroundColor: 'transparent',
                borderColor: '#E5E7EB',
            },
            disabledText: {
                color: '#9CA3AF',
            },
        },
        ghost: {
            container: {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
            },
            text: {
                color: '#374151',
            },
            disabled: {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
            },
            disabledText: {
                color: '#9CA3AF',
            },
        },
        destructive: {
            container: {
                backgroundColor: '#EF4444',
                borderColor: '#EF4444',
            },
            text: {
                color: '#FFFFFF',
            },
            disabled: {
                backgroundColor: '#FCA5A5',
                borderColor: '#FCA5A5',
            },
            disabledText: {
                color: 'rgba(255, 255, 255, 0.7)',
            },
        },
        link: {
            container: {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                shadowOpacity: 0,
                elevation: 0,
            },
            text: {
                color: '#2563EB',
                textDecorationLine: 'underline',
            },
            disabled: {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
            },
            disabledText: {
                color: '#9CA3AF',
                textDecorationLine: 'none',
            },
        },
        success: {
            container: {
                backgroundColor: '#10B981',
                borderColor: '#10B981',
            },
            text: {
                color: '#FFFFFF',
            },
            disabled: {
                backgroundColor: '#6EE7B7',
                borderColor: '#6EE7B7',
            },
            disabledText: {
                color: 'rgba(255, 255, 255, 0.7)',
            },
        },
        warning: {
            container: {
                backgroundColor: '#F59E0B',
                borderColor: '#F59E0B',
            },
            text: {
                color: '#FFFFFF',
            },
            disabled: {
                backgroundColor: '#FCD34D',
                borderColor: '#FCD34D',
            },
            disabledText: {
                color: 'rgba(255, 255, 255, 0.7)',
            },
        },
    },
});