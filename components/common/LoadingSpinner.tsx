import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Animated,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface LoadingSpinnerProps {
    visible?: boolean;
    text?: string;
    subText?: string;
    size?: 'small' | 'large';
    color?: string;
    backgroundColor?: string;
    overlay?: boolean;
    transparent?: boolean;
    style?: 'default' | 'minimal' | 'dots' | 'pulse' | 'walmart';
    icon?: string;
    showProgress?: boolean;
    progress?: number;
}

export default function LoadingSpinner({
                                           visible = true,
                                           text = 'Loading...',
                                           subText,
                                           size = 'large',
                                           color = '#0071CE',
                                           backgroundColor = 'rgba(0, 0, 0, 0.5)',
                                           overlay = true,
                                           transparent = false,
                                           style = 'default',
                                           icon,
                                           showProgress = false,
                                           progress = 0,
                                       }: LoadingSpinnerProps): JSX.Element | null {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Fade in animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            // Continuous animations for different styles
            if (style === 'walmart') {
                startWalmartAnimation();
            } else if (style === 'pulse') {
                startPulseAnimation();
            }
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, style]);

    const startWalmartAnimation = () => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const renderDefaultSpinner = () => (
        <ActivityIndicator size={size} color={color} />
    );

    const renderMinimalSpinner = () => (
        <View style={styles.minimalSpinnerContainer}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );

    const renderDotsSpinner = () => {
        const DotIndicator = ({ delay }: { delay: number }) => {
            const dotAnim = useRef(new Animated.Value(0.3)).current;

            useEffect(() => {
                if (visible) {
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(dotAnim, {
                                toValue: 1,
                                duration: 600,
                                delay,
                                useNativeDriver: true,
                            }),
                            Animated.timing(dotAnim, {
                                toValue: 0.3,
                                duration: 600,
                                useNativeDriver: true,
                            }),
                        ])
                    ).start();
                }
            }, [visible, delay]);

            return (
                <Animated.View
                    style={[
                        styles.dot,
                        {
                            backgroundColor: color,
                            opacity: dotAnim,
                        }
                    ]}
                />
            );
        };

        return (
            <View style={styles.dotsContainer}>
                <DotIndicator delay={0} />
                <DotIndicator delay={200} />
                <DotIndicator delay={400} />
            </View>
        );
    };

    const renderPulseSpinner = () => (
        <Animated.View
            style={[
                styles.pulseContainer,
                {
                    backgroundColor: `${color}20`,
                    transform: [{ scale: pulseAnim }],
                }
            ]}
        >
            <View
                style={[
                    styles.pulseInner,
                    { backgroundColor: color }
                ]}
            />
        </Animated.View>
    );

    const renderWalmartSpinner = () => {
        const spin = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <Animated.View
                style={[
                    styles.walmartSpinnerContainer,
                    { transform: [{ rotate: spin }] }
                ]}
            >
                <View style={styles.walmartSpinner}>
                    <Text style={styles.walmartSpinnerText}>W</Text>
                </View>
            </Animated.View>
        );
    };

    const renderSpinner = () => {
        switch (style) {
            case 'minimal':
                return renderMinimalSpinner();
            case 'dots':
                return renderDotsSpinner();
            case 'pulse':
                return renderPulseSpinner();
            case 'walmart':
                return renderWalmartSpinner();
            default:
                return renderDefaultSpinner();
        }
    };

    const renderIcon = () => {
        if (!icon) return null;
        return (
            <View style={styles.iconContainer}>
                <Ionicons name={icon as any} size={48} color={color} />
            </View>
        );
    };

    const renderProgress = () => {
        if (!showProgress) return null;

        const progressWidth = Math.max(0, Math.min(100, progress));

        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progressWidth}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {Math.round(progress)}% complete
                </Text>
            </View>
        );
    };

    const renderContent = () => (
        <Animated.View
            style={[
                styles.contentContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }
            ]}
        >
            {/* Background Card */}
            <View style={styles.card}>
                {renderIcon()}
                {renderSpinner()}

                {text && (
                    <Text style={styles.mainText}>
                        {text}
                    </Text>
                )}

                {subText && (
                    <Text style={styles.subText}>
                        {subText}
                    </Text>
                )}

                {renderProgress()}
            </View>
        </Animated.View>
    );

    const renderInlineContent = () => (
        <View style={styles.inlineContainer}>
            {renderSpinner()}
            {text && (
                <Text style={[styles.inlineText, { color }]}>
                    {text}
                </Text>
            )}
        </View>
    );

    if (!visible) return null;

    // Inline spinner (no overlay)
    if (!overlay) {
        return renderInlineContent();
    }

    // Overlay spinner
    return (
        <Animated.View
            style={[
                styles.overlay,
                {
                    backgroundColor: transparent ? 'transparent' : backgroundColor,
                    opacity: fadeAnim,
                }
            ]}
        >
            {renderContent()}
        </Animated.View>
    );
}

// Preset configurations for common use cases
export const LoadingPresets = {
    default: {
        style: 'default' as const,
        text: 'Loading...',
    },

    walmart: {
        style: 'walmart' as const,
        text: 'Loading...',
        color: '#0071CE',
    },

    minimal: {
        style: 'minimal' as const,
        overlay: false,
    },

    searching: {
        style: 'dots' as const,
        text: 'Searching...',
        icon: 'search',
    },

    checkout: {
        style: 'pulse' as const,
        text: 'Processing your order...',
        subText: 'This may take a few moments',
        icon: 'card',
    },

    upload: {
        style: 'default' as const,
        text: 'Uploading...',
        showProgress: true,
        icon: 'cloud-upload',
    },

    sync: {
        style: 'walmart' as const,
        text: 'Syncing data...',
        icon: 'sync',
    },

    loading_products: {
        style: 'dots' as const,
        text: 'Loading products...',
        overlay: false,
    },
};

const styles = StyleSheet.create({
    // Overlay Styles
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },

    // Content Container
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },

    // Card Styles
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        minWidth: 200,
    },

    // Text Styles
    mainText: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 18,
        marginTop: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    subText: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Icon Container
    iconContainer: {
        marginBottom: 16,
    },

    // Spinner Variants
    minimalSpinnerContainer: {
        alignItems: 'center',
    },

    // Dots Spinner
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 4,
    },

    // Pulse Spinner
    pulseContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseInner: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },

    // Walmart Spinner
    walmartSpinnerContainer: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    walmartSpinner: {
        width: 64,
        height: 64,
        backgroundColor: '#0071CE',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0071CE',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    walmartSpinnerText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 32,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    // Progress Bar
    progressContainer: {
        width: 256,
        marginTop: 16,
    },
    progressBar: {
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        height: 8,
        overflow: 'hidden',
    },
    progressFill: {
        backgroundColor: '#0071CE',
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Inline Styles
    inlineContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    inlineText: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
});