import React, { useState, forwardRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
    TextInputProps,
    StyleSheet,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    placeholder?: string;
    helperText?: string;
    errorText?: string;
    successText?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'filled' | 'outlined' | 'underlined' | 'borderless';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    onLeftIconPress?: () => void;
    showPasswordToggle?: boolean;
    prefix?: string;
    suffix?: string;
    maxLength?: number;
    showCharacterCount?: boolean;
    floatingLabel?: boolean;
    clearable?: boolean;
    onClear?: () => void;
    validationIcon?: boolean;
    hapticFeedback?: boolean;
    animateOnFocus?: boolean;
    style?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    helperStyle?: TextStyle;
    errorStyle?: TextStyle;
    successStyle?: TextStyle;
    testID?: string;
}

const Input = forwardRef<TextInput, InputProps>(({
                                                     label,
                                                     placeholder,
                                                     helperText,
                                                     errorText,
                                                     successText,
                                                     required = false,
                                                     disabled = false,
                                                     loading = false,
                                                     variant = 'outlined',
                                                     size = 'md',
                                                     leftIcon,
                                                     rightIcon,
                                                     onRightIconPress,
                                                     onLeftIconPress,
                                                     showPasswordToggle = false,
                                                     prefix,
                                                     suffix,
                                                     maxLength,
                                                     showCharacterCount = false,
                                                     floatingLabel = false,
                                                     clearable = false,
                                                     onClear,
                                                     validationIcon = true,
                                                     hapticFeedback = true,
                                                     animateOnFocus = true,
                                                     style,
                                                     inputStyle,
                                                     labelStyle,
                                                     helperStyle,
                                                     errorStyle,
                                                     successStyle,
                                                     testID,
                                                     value = '',
                                                     onFocus,
                                                     onBlur,
                                                     onChangeText,
                                                     secureTextEntry,
                                                     ...props
                                                 }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [labelAnimation] = useState(new Animated.Value(0));

    const hasError = !!errorText;
    const hasSuccess = !!successText && !hasError;
    const hasValue = !!value;
    const isFloatingActive = floatingLabel && (isFocused || hasValue);

    const containerStyle = useMemo(() => [
        styles.base,
        styles.variants[variant].container,
        styles.sizes[size].container,
        isFocused && styles.variants[variant].focused,
        hasError && styles.variants[variant].error,
        hasSuccess && styles.variants[variant].success,
        disabled && styles.variants[variant].disabled,
        style,
    ], [variant, size, isFocused, hasError, hasSuccess, disabled, style]);

    const inputStyles = useMemo(() => [
        styles.input,
        styles.sizes[size].text,
        disabled && styles.inputDisabled,
        floatingLabel && styles.inputFloating,
        inputStyle,
    ], [size, disabled, floatingLabel, inputStyle]);

    const labelStyles = useMemo(() => [
        styles.label,
        styles.sizes[size].label,
        hasError && styles.labelError,
        hasSuccess && styles.labelSuccess,
        disabled && styles.labelDisabled,
        labelStyle,
    ], [size, hasError, hasSuccess, disabled, labelStyle]);

    const floatingLabelStyles = useMemo(() => [
        styles.floatingLabel,
        styles.sizes[size].floatingLabel,
        hasError && styles.labelError,
        hasSuccess && styles.labelSuccess,
        disabled && styles.labelDisabled,
        {
            transform: [{
                translateY: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                }),
            }, {
                scale: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.85],
                }),
            }],
        },
        labelStyle,
    ], [size, hasError, hasSuccess, disabled, labelAnimation, labelStyle]);

    const helperStyles = useMemo(() => [
        styles.helper,
        hasError && styles.helperError,
        hasSuccess && styles.helperSuccess,
        hasError ? errorStyle : hasSuccess ? successStyle : helperStyle,
    ], [hasError, hasSuccess, helperStyle, errorStyle, successStyle]);

    const handleFocus = useCallback((e: any) => {
        setIsFocused(true);

        if (animateOnFocus && floatingLabel) {
            Animated.timing(labelAnimation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        if (hapticFeedback && global.HapticFeedback) {
            global.HapticFeedback.selection();
        }

        onFocus?.(e);
    }, [animateOnFocus, floatingLabel, hapticFeedback, labelAnimation, onFocus]);

    const handleBlur = useCallback((e: any) => {
        setIsFocused(false);

        if (animateOnFocus && floatingLabel && !hasValue) {
            Animated.timing(labelAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        onBlur?.(e);
    }, [animateOnFocus, floatingLabel, hasValue, labelAnimation, onBlur]);

    const handleChangeText = useCallback((text: string) => {
        onChangeText?.(text);

        if (floatingLabel && animateOnFocus) {
            const shouldFloat = text.length > 0 || isFocused;
            Animated.timing(labelAnimation, {
                toValue: shouldFloat ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [onChangeText, floatingLabel, animateOnFocus, isFocused, labelAnimation]);

    const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible(!isPasswordVisible);

        if (hapticFeedback && global.HapticFeedback) {
            global.HapticFeedback.impact(global.HapticFeedback.ImpactFeedbackStyle.Light);
        }
    }, [isPasswordVisible, hapticFeedback]);

    const handleClear = useCallback(() => {
        onClear?.();
        onChangeText?.('');

        if (hapticFeedback && global.HapticFeedback) {
            global.HapticFeedback.impact(global.HapticFeedback.ImpactFeedbackStyle.Light);
        }
    }, [onClear, onChangeText, hapticFeedback]);

    const getIconColor = useCallback(() => {
        if (disabled) return '#9CA3AF';
        if (hasError) return '#EF4444';
        if (hasSuccess) return '#10B981';
        if (isFocused) return '#3B82F6';
        return '#6B7280';
    }, [disabled, hasError, hasSuccess, isFocused]);

    const characterCount = value?.toString().length || 0;
    const isOverLimit = maxLength ? characterCount > maxLength : false;
    const iconSize = styles.sizes[size].iconSize;

    const renderValidationIcon = () => {
        if (!validationIcon || (!hasError && !hasSuccess)) return null;

        return (
            <View style={styles.validationIcon}>
                <Ionicons
                    name={hasError ? "alert-circle" : "checkmark-circle"}
                    size={iconSize}
                    color={hasError ? '#EF4444' : '#10B981'}
                />
            </View>
        );
    };

    const renderRightContent = () => {
        const elements = [];

        // Clearable button
        if (clearable && hasValue && !disabled) {
            elements.push(
                <TouchableOpacity
                    key="clear"
                    onPress={handleClear}
                    style={styles.iconButton}
                    testID={`${testID}-clear-button`}
                >
                    <Ionicons
                        name="close-circle"
                        size={iconSize}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            );
        }

        // Password toggle
        if (showPasswordToggle) {
            elements.push(
                <TouchableOpacity
                    key="password"
                    onPress={togglePasswordVisibility}
                    style={styles.iconButton}
                    disabled={disabled}
                    testID={`${testID}-password-toggle`}
                >
                    <Ionicons
                        name={isPasswordVisible ? "eye-off" : "eye"}
                        size={iconSize}
                        color={getIconColor()}
                    />
                </TouchableOpacity>
            );
        }

        // Custom right icon
        if (rightIcon && !showPasswordToggle) {
            elements.push(
                <TouchableOpacity
                    key="right-icon"
                    onPress={onRightIconPress}
                    style={styles.iconButton}
                    disabled={disabled || !onRightIconPress}
                    testID={`${testID}-right-icon`}
                >
                    <Ionicons
                        name={rightIcon}
                        size={iconSize}
                        color={getIconColor()}
                    />
                </TouchableOpacity>
            );
        }

        // Validation icon
        elements.push(renderValidationIcon());

        return elements;
    };

    return (
        <View style={style} testID={testID}>
            {/* Static Label */}
            {label && !floatingLabel && (
                <View style={styles.labelContainer}>
                    <Text style={labelStyles}>
                        {label}
                        {required && <Text style={styles.required}>*</Text>}
                    </Text>
                </View>
            )}

            {/* Input Container */}
            <View style={containerStyle}>
                {/* Floating Label */}
                {label && floatingLabel && (
                    <Animated.Text style={floatingLabelStyles}>
                        {label}
                        {required && <Text style={styles.required}>*</Text>}
                    </Animated.Text>
                )}

                {/* Left Icon */}
                {leftIcon && (
                    <TouchableOpacity
                        onPress={onLeftIconPress}
                        style={styles.leftIcon}
                        disabled={disabled || !onLeftIconPress}
                        testID={`${testID}-left-icon`}
                    >
                        <Ionicons
                            name={leftIcon}
                            size={iconSize}
                            color={getIconColor()}
                        />
                    </TouchableOpacity>
                )}

                {/* Content Container */}
                <View style={styles.contentContainer}>
                    {/* Prefix */}
                    {prefix && (
                        <Text style={[styles.affix, styles.sizes[size].text]}>
                            {prefix}
                        </Text>
                    )}

                    {/* Text Input */}
                    <TextInput
                        ref={ref}
                        style={inputStyles}
                        placeholder={floatingLabel && isFloatingActive ? '' : placeholder}
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChangeText={handleChangeText}
                        editable={!disabled && !loading}
                        secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
                        maxLength={maxLength}
                        selectionColor="#3B82F6"
                        underlineColorAndroid="transparent"
                        testID={`${testID}-input`}
                        accessibilityLabel={label}
                        accessibilityHint={helperText}
                        accessibilityState={{
                            disabled: disabled,
                            selected: isFocused,
                        }}
                        {...props}
                    />

                    {/* Suffix */}
                    {suffix && (
                        <Text style={[styles.affix, styles.sizes[size].text]}>
                            {suffix}
                        </Text>
                    )}
                </View>

                {/* Right Content */}
                <View style={styles.rightContent}>
                    {renderRightContent()}
                </View>

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <Ionicons name="reload" size={iconSize} color="#3B82F6" />
                    </View>
                )}
            </View>

            {/* Bottom Row */}
            <View style={styles.bottomRow}>
                {/* Helper/Error/Success Text */}
                <View style={styles.helperContainer}>
                    {(helperText || errorText || successText) && (
                        <Text style={helperStyles} testID={`${testID}-helper-text`}>
                            {errorText || successText || helperText}
                        </Text>
                    )}
                </View>

                {/* Character Count */}
                {showCharacterCount && maxLength && (
                    <Text
                        style={[
                            styles.characterCount,
                            isOverLimit && styles.characterCountError
                        ]}
                        testID={`${testID}-character-count`}
                    >
                        {characterCount}/{maxLength}
                    </Text>
                )}
            </View>
        </View>
    );
});

Input.displayName = 'Input';

export default Input;

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },

    input: {
        flex: 1,
        color: '#111827',
        includeFontPadding: false,
        textAlignVertical: 'center',
        ...Platform.select({
            web: {
                outline: 'none',
            },
        }),
    },

    inputDisabled: {
        color: '#9CA3AF',
    },

    inputFloating: {
        paddingTop: 20,
    },

    labelContainer: {
        marginBottom: 8,
    },

    label: {
        fontWeight: '500',
        color: '#374151',
    },

    labelError: {
        color: '#EF4444',
    },

    labelSuccess: {
        color: '#10B981',
    },

    labelDisabled: {
        color: '#9CA3AF',
    },

    floatingLabel: {
        position: 'absolute',
        left: 16,
        top: 0,
        fontWeight: '500',
        color: '#6B7280',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 4,
        zIndex: 1,
    },

    required: {
        color: '#EF4444',
        marginLeft: 4,
    },

    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    leftIcon: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconButton: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },

    validationIcon: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingContainer: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    affix: {
        color: '#6B7280',
        marginHorizontal: 4,
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 8,
    },

    helperContainer: {
        flex: 1,
    },

    helper: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },

    helperError: {
        color: '#EF4444',
    },

    helperSuccess: {
        color: '#10B981',
    },

    characterCount: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 8,
    },

    characterCountError: {
        color: '#EF4444',
    },

    // Size variants
    sizes: {
        xs: {
            container: {
                paddingHorizontal: 8,
                paddingVertical: 4,
                minHeight: 28,
            },
            text: {
                fontSize: 12,
                lineHeight: 16,
            },
            label: {
                fontSize: 12,
                lineHeight: 16,
            },
            floatingLabel: {
                fontSize: 12,
            },
            iconSize: 14,
        },
        sm: {
            container: {
                paddingHorizontal: 12,
                paddingVertical: 8,
                minHeight: 36,
            },
            text: {
                fontSize: 14,
                lineHeight: 18,
            },
            label: {
                fontSize: 14,
                lineHeight: 18,
            },
            floatingLabel: {
                fontSize: 14,
            },
            iconSize: 16,
        },
        md: {
            container: {
                paddingHorizontal: 16,
                paddingVertical: 12,
                minHeight: 44,
            },
            text: {
                fontSize: 16,
                lineHeight: 20,
            },
            label: {
                fontSize: 16,
                lineHeight: 20,
            },
            floatingLabel: {
                fontSize: 16,
            },
            iconSize: 18,
        },
        lg: {
            container: {
                paddingHorizontal: 20,
                paddingVertical: 16,
                minHeight: 52,
            },
            text: {
                fontSize: 18,
                lineHeight: 24,
            },
            label: {
                fontSize: 18,
                lineHeight: 24,
            },
            floatingLabel: {
                fontSize: 18,
            },
            iconSize: 20,
        },
        xl: {
            container: {
                paddingHorizontal: 24,
                paddingVertical: 20,
                minHeight: 60,
            },
            text: {
                fontSize: 20,
                lineHeight: 28,
            },
            label: {
                fontSize: 20,
                lineHeight: 28,
            },
            floatingLabel: {
                fontSize: 20,
            },
            iconSize: 22,
        },
    },

    // Variant styles
    variants: {
        default: {
            container: {
                borderBottomWidth: 1,
                borderBottomColor: '#D1D5DB',
                backgroundColor: 'transparent',
            },
            focused: {
                borderBottomColor: '#3B82F6',
            },
            error: {
                borderBottomColor: '#EF4444',
            },
            success: {
                borderBottomColor: '#10B981',
            },
            disabled: {
                borderBottomColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
            },
        },
        filled: {
            container: {
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'transparent',
            },
            focused: {
                backgroundColor: '#FFFFFF',
                borderColor: '#3B82F6',
                shadowColor: '#3B82F6',
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
            },
            error: {
                backgroundColor: '#FEF2F2',
                borderColor: '#EF4444',
            },
            success: {
                backgroundColor: '#F0FDF4',
                borderColor: '#10B981',
            },
            disabled: {
                backgroundColor: '#E5E7EB',
                borderColor: '#D1D5DB',
            },
        },
        outlined: {
            container: {
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
            },
            focused: {
                borderColor: '#3B82F6',
                shadowColor: '#3B82F6',
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
            },
            error: {
                borderColor: '#EF4444',
            },
            success: {
                borderColor: '#10B981',
            },
            disabled: {
                borderColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
            },
        },
        underlined: {
            container: {
                borderBottomWidth: 2,
                borderBottomColor: '#E5E7EB',
                backgroundColor: 'transparent',
            },
            focused: {
                borderBottomColor: '#3B82F6',
            },
            error: {
                borderBottomColor: '#EF4444',
            },
            success: {
                borderBottomColor: '#10B981',
            },
            disabled: {
                borderBottomColor: '#D1D5DB',
                backgroundColor: '#F9FAFB',
            },
        },
        borderless: {
            container: {
                backgroundColor: 'transparent',
                borderWidth: 0,
            },
            focused: {
                backgroundColor: '#F9FAFB',
            },
            error: {
                backgroundColor: '#FEF2F2',
            },
            success: {
                backgroundColor: '#F0FDF4',
            },
            disabled: {
                backgroundColor: '#E5E7EB',
            },
        },
    },
});