import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    shape?: 'rounded' | 'pill' | 'square';
    outline?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    testID?: string;
}

export default function Badge({
                                  children,
                                  variant = 'default',
                                  size = 'md',
                                  shape = 'pill',
                                  outline = false,
                                  style,
                                  textStyle,
                                  disabled = false,
                                  testID,
                              }: BadgeProps): JSX.Element {
    const containerStyle = [
        styles.base,
        styles.sizes[size],
        styles.shapes[shape],
        outline ? styles.variants[variant].outline : styles.variants[variant].solid,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.baseText,
        styles.textSizes[size],
        outline ? styles.textVariants[variant].outline : styles.textVariants[variant].solid,
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <View style={containerStyle} testID={testID}>
            <Text style={textStyles} numberOfLines={1} adjustsFontSizeToFit>
                {children}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },

    baseText: {
        fontWeight: '600',
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },

    disabled: {
        opacity: 0.5,
    },

    disabledText: {
        opacity: 0.7,
    },

    // Size variants
    sizes: {
        sm: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            minHeight: 20,
        },
        md: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            minHeight: 28,
        },
        lg: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            minHeight: 36,
        },
    },

    // Text sizes
    textSizes: {
        sm: {
            fontSize: 11,
            lineHeight: 12,
        },
        md: {
            fontSize: 13,
            lineHeight: 16,
        },
        lg: {
            fontSize: 15,
            lineHeight: 20,
        },
    },

    // Shape variants
    shapes: {
        rounded: {
            borderRadius: 6,
        },
        pill: {
            borderRadius: 100,
        },
        square: {
            borderRadius: 0,
        },
    },

    // Color variants - Solid backgrounds
    variants: {
        default: {
            solid: {
                backgroundColor: '#F3F4F6',
                borderWidth: 0,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#D1D5DB',
            },
        },
        primary: {
            solid: {
                backgroundColor: '#3B82F6',
                borderWidth: 0,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#3B82F6',
            },
        },
        secondary: {
            solid: {
                backgroundColor: '#6B7280',
                borderWidth: 0,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#6B7280',
            },
        },
        success: {
            solid: {
                backgroundColor: '#10B981',
                borderWidth: 0,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#10B981',
            },
        },
        warning: {
            solid: {
                backgroundColor: '#F59E0B',
                borderWidth: 0,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#F59E0B',
            },
        },
        error: {
            solid: {
                backgroundColor: '#EF4444',
                borderWidth: 0,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#EF4444',
            },
        },
        info: {
            solid: {
                backgroundColor: '#06B6D4',
                borderWidth: 0,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#06B6D4',
            },
        },
    },

    // Text color variants
    textVariants: {
        default: {
            solid: {
                color: '#374151',
            },
            outline: {
                color: '#374151',
            },
        },
        primary: {
            solid: {
                color: '#FFFFFF',
            },
            outline: {
                color: '#3B82F6',
            },
        },
        secondary: {
            solid: {
                color: '#FFFFFF',
            },
            outline: {
                color: '#6B7280',
            },
        },
        success: {
            solid: {
                color: '#FFFFFF',
            },
            outline: {
                color: '#10B981',
            },
        },
        warning: {
            solid: {
                color: '#FFFFFF',
            },
            outline: {
                color: '#D97706',
            },
        },
        error: {
            solid: {
                color: '#FFFFFF',
            },
            outline: {
                color: '#EF4444',
            },
        },
        info: {
            solid: {
                color: '#FFFFFF',
            },
            outline: {
                color: '#06B6D4',
            },
        },
    },
});