import React, {
    useEffect,
    useRef,
    useState,
    createContext,
    useContext,
    useCallback,
    useMemo
} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    PanGestureHandler,
    State,
    ViewStyle,
    TextStyle,
    StyleSheet,
    Platform,
    Vibration,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ToastProps {
    id: string;
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'default' | 'loading';
    duration?: number;
    position?: 'top' | 'bottom' | 'center';
    showIcon?: boolean;
    showCloseButton?: boolean;
    persistent?: boolean;
    hapticFeedback?: boolean;
    swipeable?: boolean;
    pauseOnHover?: boolean;
    maxWidth?: number;
    action?: {
        label: string;
        onPress: () => void;
        variant?: 'primary' | 'secondary';
    };
    onDismiss?: () => void;
    onShow?: () => void;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    messageStyle?: TextStyle;
    testID?: string;
}

export interface ToastManagerProps {
    toasts: ToastProps[];
    onDismiss: (id: string) => void;
    position?: 'top' | 'bottom' | 'center';
    maxToasts?: number;
    stackSpacing?: number;
    animationDuration?: number;
}

export interface ToastContextType {
    show: (toast: Omit<ToastProps, 'id'>) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    update: (id: string, updates: Partial<ToastProps>) => void;
    isVisible: (id: string) => boolean;
}

// Create Toast Context
const ToastContext = createContext<ToastContextType | null>(null);

// Toast variants configuration
const TOAST_VARIANTS = {
    success: {
        backgroundColor: '#D1FAE5',
        borderColor: '#A7F3D0',
        iconName: 'checkmark-circle' as const,
        iconColor: '#059669',
        titleColor: '#064E3B',
        messageColor: '#065F46',
    },
    error: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FECACA',
        iconName: 'close-circle' as const,
        iconColor: '#DC2626',
        titleColor: '#7F1D1D',
        messageColor: '#991B1B',
    },
    warning: {
        backgroundColor: '#FEF3C7',
        borderColor: '#FDE68A',
        iconName: 'warning' as const,
        iconColor: '#D97706',
        titleColor: '#78350F',
        messageColor: '#92400E',
    },
    info: {
        backgroundColor: '#DBEAFE',
        borderColor: '#BFDBFE',
        iconName: 'information-circle' as const,
        iconColor: '#2563EB',
        titleColor: '#1E3A8A',
        messageColor: '#1E40AF',
    },
    loading: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        iconName: 'reload' as const,
        iconColor: '#6B7280',
        titleColor: '#374151',
        messageColor: '#4B5563',
    },
    default: {
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
        iconName: 'chatbubble' as const,
        iconColor: '#6B7280',
        titleColor: '#374151',
        messageColor: '#4B5563',
    },
};

function Toast({
                   id,
                   title,
                   message,
                   type = 'default',
                   duration = 4000,
                   position = 'top',
                   showIcon = true,
                   showCloseButton = true,
                   persistent = false,
                   hapticFeedback = true,
                   swipeable = true,
                   pauseOnHover = true,
                   maxWidth = screenWidth - 32,
                   action,
                   onDismiss,
                   onShow,
                   style,
                   titleStyle,
                   messageStyle,
                   testID,
               }: ToastProps): JSX.Element {
    const translateY = useRef(new Animated.Value(getInitialTranslateY())).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const [isVisible, setIsVisible] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const remainingTimeRef = useRef<number>(duration);

    const variant = TOAST_VARIANTS[type];
    const insets = useSafeAreaInsets();

    function getInitialTranslateY() {
        switch (position) {
            case 'top':
                return -100;
            case 'bottom':
                return 100;
            case 'center':
                return 0;
            default:
                return -100;
        }
    }

    const containerStyle = useMemo(() => [
        styles.container,
        {
            backgroundColor: variant.backgroundColor,
            borderColor: variant.borderColor,
            maxWidth,
        },
        position === 'center' && styles.centerContainer,
        style,
    ], [variant, maxWidth, position, style]);

    const titleStyles = useMemo(() => [
        styles.title,
        { color: variant.titleColor },
        titleStyle,
    ], [variant.titleColor, titleStyle]);

    const messageStyles = useMemo(() => [
        styles.message,
        { color: variant.messageColor },
        messageStyle,
    ], [variant.messageColor, messageStyle]);

    const startTimer = useCallback(() => {
        if (persistent || duration <= 0) return;

        startTimeRef.current = Date.now();
        timerRef.current = setTimeout(() => {
            handleDismiss();
        }, remainingTimeRef.current);
    }, [persistent, duration]);

    const pauseTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
            const elapsed = Date.now() - startTimeRef.current;
            remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        }
    }, []);

    const resumeTimer = useCallback(() => {
        if (!isPaused && remainingTimeRef.current > 0) {
            startTimer();
        }
    }, [isPaused, startTimer]);

    useEffect(() => {
        // Entrance animation
        const entranceAnimations = [
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
        ];

        if (position !== 'center') {
            entranceAnimations.push(
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                })
            );
        }

        // Loading animation for loading type
        if (type === 'loading') {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ).start();
        }

        Animated.parallel(entranceAnimations).start(() => {
            onShow?.();
            startTimer();
        });

        // Haptic feedback
        if (hapticFeedback) {
            if (Platform.OS === 'ios' && global.HapticFeedback) {
                const feedbackType = type === 'success'
                    ? global.HapticFeedback.NotificationFeedbackType.Success
                    : type === 'error'
                        ? global.HapticFeedback.NotificationFeedbackType.Error
                        : global.HapticFeedback.NotificationFeedbackType.Warning;
                global.HapticFeedback.notificationOccurred(feedbackType);
            } else if (Platform.OS === 'android') {
                Vibration.vibrate(type === 'error' ? [0, 100, 50, 100] : 100);
            }
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const handleDismiss = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setIsVisible(false);

        const exitAnimations = [
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.9,
                duration: 250,
                useNativeDriver: true,
            }),
        ];

        if (position !== 'center') {
            exitAnimations.push(
                Animated.timing(translateY, {
                    toValue: getInitialTranslateY(),
                    duration: 250,
                    useNativeDriver: true,
                })
            );
        }

        Animated.parallel(exitAnimations).start(() => {
            onDismiss?.();
        });
    }, [onDismiss, position]);

    const handlePanGestureEvent = useCallback(
        Animated.event([{ nativeEvent: { translationX: translateX } }], {
            useNativeDriver: true,
        }),
        []
    );

    const handlePanStateChange = useCallback((event: any) => {
        if (event.nativeEvent.state === State.BEGAN) {
            if (pauseOnHover) {
                setIsPaused(true);
                pauseTimer();
            }
        } else if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;

            // Dismiss if swiped far enough or fast enough
            if (Math.abs(translationX) > screenWidth * 0.3 || Math.abs(velocityX) > 500) {
                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: translationX > 0 ? screenWidth : -screenWidth,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    onDismiss?.();
                });
            } else {
                // Spring back to center
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start(() => {
                    if (pauseOnHover) {
                        setIsPaused(false);
                        resumeTimer();
                    }
                });
            }
        }
    }, [pauseOnHover, pauseTimer, resumeTimer, onDismiss]);

    const renderIcon = () => {
        if (!showIcon) return null;

        const iconTransform = type === 'loading' ? [
            {
                rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                }),
            },
        ] : [];

        return (
            <View style={styles.iconContainer}>
                <Animated.View style={{ transform: iconTransform }}>
                    <Ionicons
                        name={variant.iconName}
                        size={20}
                        color={variant.iconColor}
                    />
                </Animated.View>
            </View>
        );
    };

    const renderAction = () => {
        if (!action) return null;

        return (
            <TouchableOpacity
                onPress={action.onPress}
                style={[
                    styles.actionButton,
                    action.variant === 'primary' && {
                        backgroundColor: variant.iconColor,
                    },
                ]}
                testID={`${testID}-action`}
            >
                <Text
                    style={[
                        styles.actionText,
                        {
                            color: action.variant === 'primary'
                                ? '#FFFFFF'
                                : variant.iconColor,
                        },
                    ]}
                >
                    {action.label}
                </Text>
            </TouchableOpacity>
        );
    };

    if (!isVisible) return <></>;

    const toastContent = (
        <Animated.View
            style={[
                containerStyle,
                {
                    transform: [
                        { translateY },
                        { translateX },
                        { scale },
                    ],
                    opacity,
                },
            ]}
            testID={testID}
        >
            <View style={styles.content}>
                {renderIcon()}

                <View style={styles.textContainer}>
                    {title && (
                        <Text style={titleStyles} numberOfLines={2}>
                            {title}
                        </Text>
                    )}
                    <Text style={messageStyles} numberOfLines={4}>
                        {message}
                    </Text>
                    {renderAction()}
                </View>

                {showCloseButton && (
                    <TouchableOpacity
                        onPress={handleDismiss}
                        style={styles.closeButton}
                        testID={`${testID}-close`}
                        accessibilityRole="button"
                        accessibilityLabel="Close notification"
                    >
                        <Ionicons
                            name="close"
                            size={18}
                            color={variant.iconColor}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Progress indicator for non-persistent toasts */}
            {!persistent && duration > 0 && (
                <View style={styles.progressContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            {
                                backgroundColor: variant.iconColor,
                                opacity: 0.3,
                            },
                        ]}
                    />
                </View>
            )}
        </Animated.View>
    );

    return swipeable ? (
        <PanGestureHandler
            onGestureEvent={handlePanGestureEvent}
            onHandlerStateChange={handlePanStateChange}
        >
            {toastContent}
        </PanGestureHandler>
    ) : (
        toastContent
    );
}

function ToastManager({
                          toasts,
                          onDismiss,
                          position = 'top',
                          maxToasts = 5,
                          stackSpacing = 8,
                          animationDuration = 300,
                      }: ToastManagerProps): JSX.Element {
    const insets = useSafeAreaInsets();
    const visibleToasts = toasts.slice(0, maxToasts);

    const containerStyle = useMemo(() => [
        styles.manager,
        {
            [position === 'top' ? 'top' : position === 'bottom' ? 'bottom' : 'top']:
                position === 'center' ? '50%' : 0,
        },
        position === 'center' && {
            transform: [{ translateY: -50 }],
            justifyContent: 'center',
            alignItems: 'center',
        },
    ], [position]);

    const safeAreaStyle = useMemo(() => ({
        paddingTop: position === 'top' ? insets.top : 0,
        paddingBottom: position === 'bottom' ? insets.bottom : 0,
    }), [position, insets]);

    return (
        <View style={containerStyle} pointerEvents="box-none">
            <View style={safeAreaStyle}>
                <View style={position === 'bottom' ? styles.reverseColumn : undefined}>
                    {visibleToasts.map((toast, index) => (
                        <View
                            key={toast.id}
                            style={[
                                styles.toastWrapper,
                                {
                                    marginBottom: position === 'top' || position === 'center' ? stackSpacing : 0,
                                    marginTop: position === 'bottom' ? stackSpacing : 0,
                                    zIndex: visibleToasts.length - index,
                                },
                            ]}
                        >
                            <Toast
                                {...toast}
                                position={position}
                                onDismiss={() => onDismiss(toast.id)}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// Toast Hook
export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Provider Component
export function ToastProvider({
                                  children,
                                  position = 'top',
                                  maxToasts = 5,
                                  stackSpacing = 8,
                              }: {
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'center';
    maxToasts?: number;
    stackSpacing?: number;
}): JSX.Element {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const show = useCallback((toast: Omit<ToastProps, 'id'>): string => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast: ToastProps = { ...toast, id };

        setToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        setToasts([]);
    }, []);

    const update = useCallback((id: string, updates: Partial<ToastProps>) => {
        setToasts(prev =>
            prev.map(toast =>
                toast.id === id ? { ...toast, ...updates } : toast
            )
        );
    }, []);

    const isVisible = useCallback((id: string): boolean => {
        return toasts.some(toast => toast.id === id);
    }, [toasts]);

    const contextValue = useMemo(() => ({
        show,
        dismiss,
        dismissAll,
        update,
        isVisible,
    }), [show, dismiss, dismissAll, update, isVisible]);

    const handleDismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastManager
                toasts={toasts}
                onDismiss={handleDismiss}
                position={position}
                maxToasts={maxToasts}
                stackSpacing={stackSpacing}
            />
        </ToastContext.Provider>
    );
}

// Static methods for quick usage
Toast.success = (message: string, options?: Partial<Omit<ToastProps, 'id'>>) => ({
    type: 'success' as const,
    message,
    ...options,
});

Toast.error = (message: string, options?: Partial<Omit<ToastProps, 'id'>>) => ({
    type: 'error' as const,
    message,
    ...options,
});

Toast.warning = (message: string, options?: Partial<Omit<ToastProps, 'id'>>) => ({
    type: 'warning' as const,
    message,
    ...options,
});

Toast.info = (message: string, options?: Partial<Omit<ToastProps, 'id'>>) => ({
    type: 'info' as const,
    message,
    ...options,
});

Toast.loading = (message: string, options?: Partial<Omit<ToastProps, 'id'>>) => ({
    type: 'loading' as const,
    message,
    persistent: true,
    ...options,
});

Toast.Manager = ToastManager;
Toast.Provider = ToastProvider;

export default Toast;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },

    centerContainer: {
        alignSelf: 'center',
        maxWidth: screenWidth * 0.9,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },

    iconContainer: {
        marginRight: 12,
        marginTop: 2,
    },

    textContainer: {
        flex: 1,
    },

    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 22,
    },

    message: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },

    closeButton: {
        padding: 4,
        margin: -4,
        marginLeft: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    actionButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 8,
    },

    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },

    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },

    progressBar: {
        height: '100%',
        width: '100%',
    },

    manager: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 9999,
    },

    reverseColumn: {
        flexDirection: 'column-reverse',
    },

    toastWrapper: {
        width: '100%',
    },
});