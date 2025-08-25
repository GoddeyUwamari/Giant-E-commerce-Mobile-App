import React, { useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
    StyleSheet,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'flat' | 'ghost' | 'primary';
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    pressable?: boolean;
    disabled?: boolean;
    loading?: boolean;
    borderColor?: string;
    backgroundColor?: string;
    style?: ViewStyle;
    hapticFeedback?: boolean;
    testID?: string;
}

export interface CardHeaderProps {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    avatar?: React.ReactNode;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    centerContent?: boolean;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    testID?: string;
}

export interface CardContentProps {
    children: React.ReactNode;
    centerContent?: boolean;
    style?: ViewStyle;
    testID?: string;
}

export interface CardFooterProps {
    children: React.ReactNode;
    borderTop?: boolean;
    centerContent?: boolean;
    style?: ViewStyle;
    testID?: string;
}

export interface CardActionsProps {
    children: React.ReactNode;
    alignment?: 'left' | 'center' | 'right' | 'between' | 'around' | 'evenly';
    direction?: 'row' | 'column';
    spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
    style?: ViewStyle;
    testID?: string;
}

function Card({
                  children,
                  variant = 'default',
                  padding = 'md',
                  margin = 'none',
                  rounded = 'lg',
                  shadow = 'none',
                  pressable = false,
                  disabled = false,
                  loading = false,
                  borderColor,
                  backgroundColor,
                  style,
                  hapticFeedback = true,
                  testID,
                  onPress,
                  ...props
              }: CardProps): JSX.Element {
    const cardStyle = useMemo(() => [
        styles.base,
        styles.variants[variant],
        styles.padding[padding],
        styles.margin[margin],
        styles.rounded[rounded],
        styles.shadows[shadow],
        disabled && styles.disabled,
        borderColor && { borderColor },
        backgroundColor && { backgroundColor },
        style,
    ], [variant, padding, margin, rounded, shadow, disabled, borderColor, backgroundColor, style]);

    const handlePress = (event: any) => {
        if (disabled || loading) return;

        if (hapticFeedback && global.HapticFeedback) {
            global.HapticFeedback.impact(global.HapticFeedback.ImpactFeedbackStyle.Light);
        }

        onPress?.(event);
    };

    if (pressable && onPress) {
        return (
            <TouchableOpacity
                style={cardStyle}
                onPress={handlePress}
                disabled={disabled || loading}
                activeOpacity={disabled || loading ? 1 : 0.85}
                testID={testID}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled || loading }}
                {...props}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View style={cardStyle} testID={testID}>
            {children}
        </View>
    );
}

function CardHeader({
                        children,
                        title,
                        subtitle,
                        action,
                        avatar,
                        icon,
                        iconColor = '#6B7280',
                        centerContent = false,
                        style,
                        titleStyle,
                        subtitleStyle,
                        testID,
                    }: CardHeaderProps): JSX.Element {
    const headerStyle = useMemo(() => [
        styles.header,
        centerContent && styles.centerContent,
        style,
    ], [centerContent, style]);

    if (title || subtitle || action || avatar || icon) {
        return (
            <View style={headerStyle} testID={testID}>
                <View style={styles.headerContent}>
                    {(avatar || icon) && (
                        <View style={styles.headerLeading}>
                            {avatar || (icon && (
                                <Ionicons
                                    name={icon}
                                    size={24}
                                    color={iconColor}
                                />
                            ))}
                        </View>
                    )}
                    <View style={styles.headerText}>
                        {title && (
                            <Text
                                style={[styles.headerTitle, titleStyle]}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text
                                style={[styles.headerSubtitle, subtitleStyle]}
                                numberOfLines={3}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>
                {action && (
                    <View style={styles.headerAction}>
                        {action}
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={headerStyle} testID={testID}>
            {children}
        </View>
    );
}

function CardContent({
                         children,
                         centerContent = false,
                         style,
                         testID,
                     }: CardContentProps): JSX.Element {
    const contentStyle = useMemo(() => [
        styles.content,
        centerContent && styles.centerContent,
        style,
    ], [centerContent, style]);

    return (
        <View style={contentStyle} testID={testID}>
            {children}
        </View>
    );
}

function CardFooter({
                        children,
                        borderTop = true,
                        centerContent = false,
                        style,
                        testID,
                    }: CardFooterProps): JSX.Element {
    const footerStyle = useMemo(() => [
        styles.footer,
        borderTop && styles.footerBorder,
        centerContent && styles.centerContent,
        style,
    ], [borderTop, centerContent, style]);

    return (
        <View style={footerStyle} testID={testID}>
            {children}
        </View>
    );
}

function CardActions({
                         children,
                         alignment = 'right',
                         direction = 'row',
                         spacing = 'md',
                         style,
                         testID,
                     }: CardActionsProps): JSX.Element {
    const actionsStyle = useMemo(() => [
        styles.actions,
        direction === 'column' ? styles.actionsColumn : styles.actionsRow,
        styles.alignments[alignment],
        styles.spacing[spacing],
        style,
    ], [alignment, direction, spacing, style]);

    return (
        <View style={actionsStyle} testID={testID}>
            {children}
        </View>
    );
}

// Export compound component
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Actions = CardActions;

export default Card;

const styles = StyleSheet.create({
    base: {
        borderRadius: 8,
        overflow: 'hidden',
    },

    disabled: {
        opacity: 0.6,
    },

    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Variant styles
    variants: {
        default: {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
        },
        elevated: {
            backgroundColor: '#FFFFFF',
            borderWidth: 0,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        outlined: {
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            borderColor: '#D1D5DB',
        },
        flat: {
            backgroundColor: '#F9FAFB',
            borderWidth: 0,
        },
        ghost: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#F3F4F6',
        },
        primary: {
            backgroundColor: '#EBF8FF',
            borderWidth: 1,
            borderColor: '#3B82F6',
        },
    },

    // Padding variants
    padding: {
        none: {
            padding: 0,
        },
        xs: {
            padding: 4,
        },
        sm: {
            padding: 8,
        },
        md: {
            padding: 16,
        },
        lg: {
            padding: 24,
        },
        xl: {
            padding: 32,
        },
    },

    // Margin variants
    margin: {
        none: {
            margin: 0,
        },
        xs: {
            margin: 4,
        },
        sm: {
            margin: 8,
        },
        md: {
            margin: 16,
        },
        lg: {
            margin: 24,
        },
        xl: {
            margin: 32,
        },
    },

    // Border radius variants
    rounded: {
        none: {
            borderRadius: 0,
        },
        xs: {
            borderRadius: 2,
        },
        sm: {
            borderRadius: 4,
        },
        md: {
            borderRadius: 6,
        },
        lg: {
            borderRadius: 8,
        },
        xl: {
            borderRadius: 12,
        },
        full: {
            borderRadius: 9999,
        },
    },

    // Shadow variants
    shadows: {
        none: {},
        xs: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.05,
            shadowRadius: 1,
            elevation: 1,
        },
        sm: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.15,
            shadowRadius: 15,
            elevation: 4,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 20,
            },
            shadowOpacity: 0.2,
            shadowRadius: 25,
            elevation: 5,
        },
    },

    // Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    headerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },

    headerLeading: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerText: {
        flex: 1,
        justifyContent: 'center',
    },

    headerAction: {
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        lineHeight: 24,
    },

    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },

    // Content styles
    content: {
        flex: 1,
    },

    // Footer styles
    footer: {
        marginTop: 16,
        paddingTop: 16,
    },

    footerBorder: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },

    // Actions styles
    actions: {
        marginTop: 16,
    },

    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    actionsColumn: {
        flexDirection: 'column',
    },

    // Alignment styles
    alignments: {
        left: {
            justifyContent: 'flex-start',
        },
        center: {
            justifyContent: 'center',
        },
        right: {
            justifyContent: 'flex-end',
        },
        between: {
            justifyContent: 'space-between',
        },
        around: {
            justifyContent: 'space-around',
        },
        evenly: {
            justifyContent: 'space-evenly',
        },
    },

    // Spacing styles
    spacing: {
        none: {
            gap: 0,
        },
        xs: {
            gap: 4,
        },
        sm: {
            gap: 8,
        },
        md: {
            gap: 12,
        },
        lg: {
            gap: 16,
        },
    },
});