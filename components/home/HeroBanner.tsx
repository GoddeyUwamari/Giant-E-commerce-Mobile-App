import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

// Types
interface BannerItem {
    id: string;
    title: string;
    subtitle: string;
    buttonText: string;
    backgroundColor: string;
    textColor: string;
    image?: string;
    onPress: () => void;
}

interface HeroBannerProps {
    banners: BannerItem[];
    autoPlayInterval?: number;
    showIndicators?: boolean;
    height?: number;
    borderRadius?: number;
    showDefaultIcon?: boolean;
    pauseOnTouch?: boolean;
}

// Constants
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WALMART_COLORS = {
    primary: '#0071CE',
    primaryDark: '#005AA3',
    secondary: '#FFC220',
    success: '#00A652',
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
    // Banner specific colors
    backdropBlur: 'rgba(255, 255, 255, 0.2)',
    indicatorActive: '#0071CE',
    indicatorInactive: '#D1D5DB',
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
    xxxl: 28,
    xxxxl: 32,
};

const ANIMATION_DURATION = {
    fast: 100,
    normal: 200,
    slow: 300,
    indicator: 300,
};

// Utility Functions
const createGradientColors = (backgroundColor: string): string[] => {
    // Create a subtle gradient effect
    return [backgroundColor, `${backgroundColor}DD`];
};

const getContainerHeight = (height: number): number => {
    // Ensure minimum and maximum heights
    const minHeight = 150;
    const maxHeight = screenHeight * 0.4;
    return Math.max(minHeight, Math.min(height, maxHeight));
};

// Banner Content Component
const BannerContent = React.memo(({
                                      banner,
                                      height,
                                      showDefaultIcon,
                                      onPress,
                                  }: {
    banner: BannerItem;
    height: number;
    showDefaultIcon: boolean;
    onPress: () => void;
}) => {
    const handleButtonPress = useCallback((e: any) => {
        e.stopPropagation();
        onPress();
    }, [onPress]);

    return (
        <View style={[styles.bannerContent, { height }]}>
            <View style={styles.textContent}>
                <Text
                    style={[styles.bannerTitle, { color: banner.textColor }]}
                    numberOfLines={2}
                >
                    {banner.title}
                </Text>
                <Text
                    style={[styles.bannerSubtitle, { color: banner.textColor }]}
                    numberOfLines={3}
                >
                    {banner.subtitle}
                </Text>
                <TouchableOpacity
                    style={styles.bannerButton}
                    onPress={handleButtonPress}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.bannerButtonText, { color: banner.textColor }]}>
                        {banner.buttonText}
                    </Text>
                    <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={banner.textColor}
                        style={styles.bannerButtonIcon}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.imageContent}>
                {banner.image ? (
                    <Image
                        source={{ uri: banner.image }}
                        style={styles.bannerImage}
                        contentFit="cover"
                        transition={200}
                    />
                ) : showDefaultIcon ? (
                    <View style={styles.defaultIconContainer}>
                        <Ionicons
                            name="storefront"
                            size={64}
                            color={banner.textColor}
                            style={styles.defaultIcon}
                        />
                    </View>
                ) : null}
            </View>
        </View>
    );
});

// Banner Slide Component
const BannerSlide = React.memo(({
                                    banner,
                                    height,
                                    borderRadius,
                                    showDefaultIcon,
                                    fadeAnim,
                                    scaleAnim,
                                    onPress,
                                }: {
    banner: BannerItem;
    height: number;
    borderRadius: number;
    showDefaultIcon: boolean;
    fadeAnim: Animated.Value;
    scaleAnim: Animated.Value;
    onPress: (banner: BannerItem) => void;
}) => {
    const gradientColors = useMemo(
        () => createGradientColors(banner.backgroundColor),
        [banner.backgroundColor]
    );

    const handlePress = useCallback(() => {
        onPress(banner);
    }, [banner, onPress]);

    return (
        <Animated.View
            style={[
                styles.slideContainer,
                {
                    width: screenWidth,
                    height: getContainerHeight(height),
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.slideTouchable}
                onPress={handlePress}
                activeOpacity={0.95}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradientContainer, { borderRadius }]}
                >
                    <BannerContent
                        banner={banner}
                        height={height}
                        showDefaultIcon={showDefaultIcon}
                        onPress={handlePress}
                    />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
});

// Indicators Component
const BannerIndicators = React.memo(({
                                         banners,
                                         currentIndex,
                                         showIndicators,
                                         onIndicatorPress,
                                     }: {
    banners: BannerItem[];
    currentIndex: number;
    showIndicators: boolean;
    onIndicatorPress: (index: number) => void;
}) => {
    if (!showIndicators || banners.length <= 1) return null;

    return (
        <View style={styles.indicatorContainer}>
            {banners.map((_, index) => {
                const isActive = index === currentIndex;
                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.indicatorTouchable}
                        onPress={() => onIndicatorPress(index)}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            style={[
                                styles.indicator,
                                isActive ? styles.indicatorActive : styles.indicatorInactive,
                            ]}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

// Main Component
export default function HeroBanner({
                                       banners,
                                       autoPlayInterval = 4000,
                                       showIndicators = true,
                                       height = 200,
                                       borderRadius = 16,
                                       showDefaultIcon = true,
                                       pauseOnTouch = true,
                                   }: HeroBannerProps): JSX.Element {
    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Refs
    const scrollViewRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-play functionality
    const startAutoPlay = useCallback(() => {
        if (banners.length <= 1 || isPaused) return;

        intervalRef.current = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0.8,
                duration: ANIMATION_DURATION.normal,
                useNativeDriver: true,
            }).start(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % banners.length;
                    scrollViewRef.current?.scrollTo({
                        x: nextIndex * screenWidth,
                        animated: true,
                    });
                    return nextIndex;
                });

                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: ANIMATION_DURATION.slow,
                    useNativeDriver: true,
                }).start();
            });
        }, autoPlayInterval);
    }, [banners.length, autoPlayInterval, fadeAnim, isPaused]);

    const stopAutoPlay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Effects
    useEffect(() => {
        startAutoPlay();
        return stopAutoPlay;
    }, [startAutoPlay, stopAutoPlay]);

    useEffect(() => {
        if (isPaused) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    }, [isPaused, startAutoPlay, stopAutoPlay]);

    // Callbacks
    const handleScroll = useCallback((event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);

        if (roundIndex !== currentIndex && roundIndex >= 0 && roundIndex < banners.length) {
            setCurrentIndex(roundIndex);
        }
    }, [currentIndex, banners.length]);

    const handleBannerPress = useCallback((banner: BannerItem) => {
        // Scale animation on press
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: ANIMATION_DURATION.fast,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: ANIMATION_DURATION.fast,
                useNativeDriver: true,
            }),
        ]).start();

        banner.onPress();
    }, [scaleAnim]);

    const handleIndicatorPress = useCallback((index: number) => {
        setCurrentIndex(index);
        scrollViewRef.current?.scrollTo({
            x: index * screenWidth,
            animated: true,
        });
    }, []);

    const handleTouchStart = useCallback(() => {
        if (pauseOnTouch) {
            setIsPaused(true);
        }
    }, [pauseOnTouch]);

    const handleTouchEnd = useCallback(() => {
        if (pauseOnTouch) {
            // Resume after a delay
            setTimeout(() => {
                setIsPaused(false);
            }, 1000);
        }
    }, [pauseOnTouch]);

    // Render empty state
    if (!banners.length) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="image-outline" size={48} color={WALMART_COLORS.gray400} />
                <Text style={styles.emptyText}>No banners available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onScrollEndDrag={handleTouchEnd}
                decelerationRate="fast"
                style={styles.scrollView}
            >
                {banners.map((banner) => (
                    <BannerSlide
                        key={banner.id}
                        banner={banner}
                        height={height}
                        borderRadius={borderRadius}
                        showDefaultIcon={showDefaultIcon}
                        fadeAnim={fadeAnim}
                        scaleAnim={scaleAnim}
                        onPress={handleBannerPress}
                    />
                ))}
            </ScrollView>

            <BannerIndicators
                banners={banners}
                currentIndex={currentIndex}
                showIndicators={showIndicators}
                onIndicatorPress={handleIndicatorPress}
            />
        </View>
    );
}

// Enhanced Styles
const styles = StyleSheet.create({
    // Main Container
    container: {
        marginBottom: SPACING.xxl,
    },

    // Scroll View
    scrollView: {
        flexGrow: 0,
    },

    // Slide Container
    slideContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideTouchable: {
        flex: 1,
        marginHorizontal: SPACING.lg,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },

    // Gradient Container
    gradientContainer: {
        flex: 1,
        overflow: 'hidden',
        minHeight: 150,
    },

    // Banner Content
    bannerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.xxl,
        paddingVertical: SPACING.xl,
    },
    textContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: SPACING.lg,
    },
    bannerTitle: {
        fontSize: TYPOGRAPHY.xxxl,
        fontWeight: '700',
        marginBottom: SPACING.sm,
        lineHeight: 36,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    bannerSubtitle: {
        fontSize: TYPOGRAPHY.md,
        marginBottom: SPACING.lg,
        opacity: 0.9,
        lineHeight: 22,
    },

    // Banner Button
    bannerButton: {
        backgroundColor: WALMART_COLORS.backdropBlur,
        borderRadius: 24,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    bannerButtonText: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
    },
    bannerButtonIcon: {
        marginLeft: SPACING.sm,
    },

    // Image Content
    imageContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerImage: {
        width: 96,
        height: 96,
        borderRadius: 16,
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
    defaultIconContainer: {
        width: 96,
        height: 96,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    defaultIcon: {
        opacity: 0.6,
    },

    // Indicators
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    indicatorTouchable: {
        padding: SPACING.xs,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    indicatorActive: {
        backgroundColor: WALMART_COLORS.indicatorActive,
        width: 24,
    },
    indicatorInactive: {
        backgroundColor: WALMART_COLORS.indicatorInactive,
        width: 8,
    },

    // Empty State
    emptyContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 16,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xxl,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray500,
        marginTop: SPACING.md,
        fontWeight: '500',
    },
});