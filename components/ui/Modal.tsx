import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
    TextStyle,
    ModalProps as RNModalProps,
    StatusBar,
    BackHandler,
    StyleSheet,
    PanGestureHandler,
    State,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export interface ModalProps extends Omit<RNModalProps, 'visible'> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    position?: 'center' | 'bottom' | 'top' | 'left' | 'right';
    showCloseButton?: boolean;
    closeOnBackdrop?: boolean;
    closeOnBackButton?: boolean;
    showBackdrop?: boolean;
    backdropOpacity?: number;
    animationType?: 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'none';
    animationDuration?: number;
    scrollable?: boolean;
    avoidKeyboard?: boolean;
    persistent?: boolean;
    swipeToClose?: boolean;
    swipeDirection?: 'down' | 'up' | 'left' | 'right';
    hapticFeedback?: boolean;
    blurBackground?: boolean;
    fullScreen?: boolean;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    headerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    backdropStyle?: ViewStyle;
    testID?: string;
    onShow?: () => void;
    onDismiss?: () => void;
}

export interface ModalHeaderProps {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
    onClose?: () => void;
    showCloseButton?: boolean;
    centerContent?: boolean;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    testID?: string;
}

export interface ModalContentProps {
    children: React.ReactNode;
    scrollable?: boolean;
    centerContent?: boolean;
    noPadding?: boolean;
    style?: ViewStyle;
    testID?: string;
}

export interface ModalFooterProps {
    children: React.ReactNode;
    centerContent?: boolean;
    noBorder?: boolean;
    sticky?: boolean;
    style?: ViewStyle;
    testID?: string;
}

function Modal({
                   isOpen,
                   onClose,
                   title,
                   subtitle,
                   children,
                   size = 'md',
                   position = 'center',
                   showCloseButton = true,
                   closeOnBackdrop = true,
                   closeOnBackButton = true,
                   showBackdrop = true,
                   backdropOpacity = 0.5,
                   animationType = 'fade',
                   animationDuration = 300,
                   scrollable = false,
                   avoidKeyboard = true,
                   persistent = false,
                   swipeToClose = false,
                   swipeDirection = 'down',
                   hapticFeedback = true,
                   blurBackground = false,
                   fullScreen = false,
                   style,
                   contentStyle,
                   headerStyle,
                   titleStyle,
                   subtitleStyle,
                   backdropStyle,
                   testID,
                   onShow,
                   onDismiss,
                   ...props
               }: ModalProps): JSX.Element {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(getInitialSlideValue())).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const panRef = useRef<PanGestureHandler>(null);
    const insets = useSafeAreaInsets();

    function getInitialSlideValue() {
        switch (animationType) {
            case 'slideUp':
            case 'slideDown':
                return screenHeight;
            case 'slideLeft':
            case 'slideRight':
                return screenWidth;
            default:
                return 0;
        }
    }

    const containerStyle = useMemo(() => [
        styles.container,
        styles.sizes[size],
        styles.positions[position],
        position === 'bottom' && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
        position === 'top' && { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
        fullScreen && styles.fullScreen,
        style,
    ], [size, position, fullScreen, style]);

    const backdropStyles = useMemo(() => [
        styles.backdrop,
        { backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` },
        blurBackground && styles.blurBackdrop,
        backdropStyle,
    ], [backdropOpacity, blurBackground, backdropStyle]);

    const animateIn = useCallback(() => {
        const animations = [];

        if (animationType === 'fade' || animationType === 'scale') {
            animations.push(
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: animationDuration,
                    useNativeDriver: true,
                })
            );
        }

        if (animationType === 'scale') {
            animations.push(
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                })
            );
        }

        if (animationType.includes('slide')) {
            animations.push(
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                })
            );
        }

        if (animations.length > 0) {
            Animated.parallel(animations).start();
        }
    }, [animationType, animationDuration, fadeAnim, scaleAnim, slideAnim]);

    const animateOut = useCallback(() => {
        const animations = [];

        if (animationType === 'fade' || animationType === 'scale') {
            animations.push(
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: animationDuration * 0.8,
                    useNativeDriver: true,
                })
            );
        }

        if (animationType === 'scale') {
            animations.push(
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: animationDuration * 0.8,
                    useNativeDriver: true,
                })
            );
        }

        if (animationType.includes('slide')) {
            animations.push(
                Animated.timing(slideAnim, {
                    toValue: getInitialSlideValue(),
                    duration: animationDuration * 0.8,
                    useNativeDriver: true,
                })
            );
        }

        if (animations.length > 0) {
            Animated.parallel(animations).start(() => {
                onDismiss?.();
            });
        } else {
            onDismiss?.();
        }
    }, [animationType, animationDuration, fadeAnim, scaleAnim, slideAnim, onDismiss]);

    const handleClose = useCallback(() => {
        if (persistent) return;

        if (hapticFeedback && global.HapticFeedback) {
            global.HapticFeedback.impact(global.HapticFeedback.ImpactFeedbackStyle.Light);
        }

        onClose();
    }, [persistent, hapticFeedback, onClose]);

    const handleBackdropPress = useCallback(() => {
        if (closeOnBackdrop) {
            handleClose();
        }
    }, [closeOnBackdrop, handleClose]);

    useEffect(() => {
        if (isOpen) {
            animateIn();
            onShow?.();
        } else {
            animateOut();
        }
    }, [isOpen, animateIn, animateOut, onShow]);

    useEffect(() => {
        if (!closeOnBackButton) return;

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isOpen) {
                handleClose();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [isOpen, closeOnBackButton, handleClose]);

    const getAnimatedStyle = useCallback(() => {
        const transforms = [];

        if (animationType === 'fade') {
            return { opacity: fadeAnim };
        }

        if (animationType === 'scale') {
            return {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
            };
        }

        if (animationType === 'slideUp') {
            transforms.push({ translateY: slideAnim });
        } else if (animationType === 'slideDown') {
            transforms.push({ translateY: slideAnim.interpolate({
                    inputRange: [0, screenHeight],
                    outputRange: [0, -screenHeight],
                }) });
        } else if (animationType === 'slideLeft') {
            transforms.push({ translateX: slideAnim });
        } else if (animationType === 'slideRight') {
            transforms.push({ translateX: slideAnim.interpolate({
                    inputRange: [0, screenWidth],
                    outputRange: [0, -screenWidth],
                }) });
        }

        return transforms.length > 0 ? { transform: transforms } : {};
    }, [animationType, fadeAnim, scaleAnim, slideAnim]);

    const renderHeader = () => {
        if (!title && !subtitle && !showCloseButton) return null;

        return (
            <View style={[styles.header, headerStyle]} testID={`${testID}-header`}>
                <View style={styles.headerContent}>
                    {title && (
                        <Text style={[styles.title, titleStyle]} numberOfLines={2}>
                            {title}
                        </Text>
                    )}
                    {subtitle && (
                        <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={3}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {showCloseButton && (
                    <TouchableOpacity
                        onPress={handleClose}
                        style={styles.closeButton}
                        testID={`${testID}-close-button`}
                        accessibilityRole="button"
                        accessibilityLabel="Close modal"
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderContent = () => {
        const content = scrollable ? (
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={Platform.OS === 'ios'}
                keyboardShouldPersistTaps="handled"
            >
                {children}
            </ScrollView>
        ) : (
            <View style={styles.content}>
                {children}
            </View>
        );

        return (
            <View style={[styles.contentContainer, contentStyle]} testID={`${testID}-content`}>
                {content}
            </View>
        );
    };

    const modalContent = (
        <TouchableOpacity
            activeOpacity={1}
            style={backdropStyles}
            onPress={handleBackdropPress}
            testID={`${testID}-backdrop`}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {}} // Prevent event bubbling
                >
                    <Animated.View
                        style={[containerStyle, getAnimatedStyle()]}
                        testID={testID}
                    >
                        {renderHeader()}
                        {renderContent()}
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const wrappedContent = avoidKeyboard && Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
            {modalContent}
        </KeyboardAvoidingView>
    ) : modalContent;

    return (
        <RNModal
            visible={isOpen}
            transparent
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
            {...props}
        >
            <SafeAreaView style={styles.safeArea} edges={fullScreen ? [] : ['top', 'bottom']}>
                {wrappedContent}
            </SafeAreaView>
        </RNModal>
    );
}

function ModalHeader({
                         children,
                         title,
                         subtitle,
                         onClose,
                         showCloseButton = true,
                         centerContent = false,
                         leftAction,
                         rightAction,
                         style,
                         titleStyle,
                         subtitleStyle,
                         testID,
                     }: ModalHeaderProps): JSX.Element {
    const headerStyle = useMemo(() => [
        styles.header,
        centerContent && styles.centerContent,
        style,
    ], [centerContent, style]);

    return (
        <View style={headerStyle} testID={testID}>
            {/* Left Action */}
            {leftAction && (
                <View style={styles.headerAction}>
                    {leftAction}
                </View>
            )}

            {/* Content */}
            <View style={styles.headerContent}>
                {children || (
                    <>
                        {title && (
                            <Text style={[styles.title, titleStyle]} numberOfLines={2}>
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={3}>
                                {subtitle}
                            </Text>
                        )}
                    </>
                )}
            </View>

            {/* Right Action or Close Button */}
            <View style={styles.headerAction}>
                {rightAction || (showCloseButton && onClose && (
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        testID={`${testID}-close`}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

function ModalContent({
                          children,
                          scrollable = false,
                          centerContent = false,
                          noPadding = false,
                          style,
                          testID,
                      }: ModalContentProps): JSX.Element {
    const contentStyle = useMemo(() => [
        styles.modalContentBase,
        !noPadding && styles.modalContentPadding,
        centerContent && styles.centerContent,
        style,
    ], [noPadding, centerContent, style]);

    if (scrollable) {
        return (
            <ScrollView
                style={[styles.scrollView, style]}
                contentContainerStyle={[
                    styles.scrollContent,
                    !noPadding && styles.modalContentPadding,
                    centerContent && styles.centerContent,
                ]}
                showsVerticalScrollIndicator={false}
                bounces={Platform.OS === 'ios'}
                keyboardShouldPersistTaps="handled"
                testID={testID}
            >
                {children}
            </ScrollView>
        );
    }

    return (
        <View style={contentStyle} testID={testID}>
            {children}
        </View>
    );
}

function ModalFooter({
                         children,
                         centerContent = false,
                         noBorder = false,
                         sticky = false,
                         style,
                         testID,
                     }: ModalFooterProps): JSX.Element {
    const footerStyle = useMemo(() => [
        styles.footer,
        !noBorder && styles.footerBorder,
        centerContent && styles.centerContent,
        sticky && styles.footerSticky,
        style,
    ], [noBorder, centerContent, sticky, style]);

    return (
        <View style={footerStyle} testID={testID}>
            {children}
        </View>
    );
}

// Export compound component
Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },

    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    blurBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    keyboardAvoid: {
        flex: 1,
    },

    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: screenHeight * 0.9,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },

    fullScreen: {
        width: screenWidth,
        height: screenHeight,
        borderRadius: 0,
        maxHeight: screenHeight,
    },

    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Size variants
    sizes: {
        xs: {
            width: screenWidth * 0.7,
            maxWidth: 300,
        },
        sm: {
            width: screenWidth * 0.8,
            maxWidth: 400,
        },
        md: {
            width: screenWidth * 0.85,
            maxWidth: 500,
        },
        lg: {
            width: screenWidth * 0.9,
            maxWidth: 600,
        },
        xl: {
            width: screenWidth * 0.95,
            maxWidth: 800,
        },
        full: {
            width: screenWidth,
            height: screenHeight,
        },
    },

    // Position variants
    positions: {
        center: {
            alignSelf: 'center',
        },
        bottom: {
            alignSelf: 'center',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            marginBottom: 0,
        },
        top: {
            alignSelf: 'center',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            marginTop: 0,
        },
        left: {
            alignSelf: 'flex-start',
            height: screenHeight,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            marginLeft: 0,
        },
        right: {
            alignSelf: 'flex-end',
            height: screenHeight,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            marginRight: 0,
        },
    },

    // Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        minHeight: 70,
    },

    headerContent: {
        flex: 1,
        marginRight: 16,
    },

    headerAction: {
        minWidth: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        lineHeight: 28,
    },

    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },

    closeButton: {
        padding: 8,
        margin: -8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Content styles
    contentContainer: {
        flex: 1,
    },

    content: {
        flex: 1,
    },

    modalContentBase: {
        flex: 1,
    },

    modalContentPadding: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    // Footer styles
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        minHeight: 60,
    },

    footerBorder: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },

    footerSticky: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
    },
});