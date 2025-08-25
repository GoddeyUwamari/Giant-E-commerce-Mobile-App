import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Animated,
    ViewStyle,
    Dimensions,
    StyleSheet,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    variant?: 'text' | 'rectangular' | 'circular' | 'rounded' | 'square';
    animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
    lines?: number;
    speed?: 'slow' | 'normal' | 'fast';
    backgroundColor?: string;
    highlightColor?: string;
    borderRadius?: number;
    style?: ViewStyle;
    testID?: string;
}

export interface SkeletonGroupProps {
    children: React.ReactNode;
    loading: boolean;
    fallback?: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
    testID?: string;
}

export interface SkeletonCardProps {
    showAvatar?: boolean;
    showImage?: boolean;
    imageHeight?: number;
    lines?: number;
    showActions?: boolean;
    showBadge?: boolean;
    variant?: 'default' | 'product' | 'article' | 'profile';
    style?: ViewStyle;
    testID?: string;
}

export interface SkeletonListProps {
    items?: number;
    showAvatar?: boolean;
    avatarSize?: 'sm' | 'md' | 'lg';
    lines?: number;
    showLeading?: boolean;
    showTrailing?: boolean;
    itemHeight?: number;
    style?: ViewStyle;
    testID?: string;
}

const ANIMATION_SPEEDS = {
    slow: 2000,
    normal: 1500,
    fast: 1000,
};

const AVATAR_SIZES = {
    sm: 32,
    md: 48,
    lg: 64,
};

function Skeleton({
                      width = '100%',
                      height = 16,
                      variant = 'rectangular',
                      animation = 'pulse',
                      lines = 1,
                      speed = 'normal',
                      backgroundColor = '#E5E7EB',
                      highlightColor = '#F3F4F6',
                      borderRadius,
                      style,
                      testID,
                  }: SkeletonProps): JSX.Element {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(-screenWidth)).current;
    const shimmerOpacity = useRef(new Animated.Value(0)).current;

    const animationDuration = ANIMATION_SPEEDS[speed];

    const skeletonStyle = useMemo(() => [
        styles.base,
        styles.variants[variant],
        {
            width,
            height: variant === 'text' ? 16 : height,
            backgroundColor,
        },
        borderRadius !== undefined && { borderRadius },
        style,
    ], [width, height, variant, backgroundColor, borderRadius, style]);

    const startAnimation = useCallback(() => {
        if (animation === 'pulse') {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: animationDuration / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0.3,
                        duration: animationDuration / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                ])
            );
            pulseAnimation.start();
            return pulseAnimation;
        } else if (animation === 'wave') {
            const waveAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(translateX, {
                        toValue: screenWidth,
                        duration: animationDuration,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateX, {
                        toValue: -screenWidth,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
            waveAnimation.start();
            return waveAnimation;
        } else if (animation === 'shimmer') {
            const shimmerAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerOpacity, {
                        toValue: 1,
                        duration: animationDuration / 3,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerOpacity, {
                        toValue: 0,
                        duration: animationDuration / 3,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.delay(animationDuration / 3),
                ])
            );
            shimmerAnimation.start();
            return shimmerAnimation;
        }
        return null;
    }, [animation, animationDuration, animatedValue, translateX, shimmerOpacity]);

    useEffect(() => {
        const runningAnimation = startAnimation();
        return () => {
            runningAnimation?.stop();
        };
    }, [startAnimation]);

    const getAnimatedStyle = useCallback(() => {
        if (animation === 'pulse') {
            return {
                opacity: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                }),
            };
        }
        return {};
    }, [animation, animatedValue]);

    const renderShimmerEffect = () => {
        if (animation === 'wave') {
            return (
                <Animated.View
                    style={[
                        styles.shimmerOverlay,
                        { transform: [{ translateX }] }
                    ]}
                >
                    <LinearGradient
                        colors={['transparent', highlightColor, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
            );
        } else if (animation === 'shimmer') {
            return (
                <Animated.View
                    style={[
                        styles.shimmerOverlay,
                        { opacity: shimmerOpacity, backgroundColor: highlightColor }
                    ]}
                />
            );
        }
        return null;
    };

    if (lines > 1 && variant === 'text') {
        return (
            <View testID={testID}>
                {Array.from({ length: lines }).map((_, index) => (
                    <View key={index} style={[styles.textLine, index === lines - 1 && styles.lastTextLine]}>
                        <Animated.View
                            style={[
                                styles.base,
                                styles.variants.text,
                                {
                                    width: index === lines - 1 ? '75%' : '100%',
                                    height: 16,
                                    backgroundColor,
                                },
                                getAnimatedStyle(),
                            ]}
                        >
                            {renderShimmerEffect()}
                        </Animated.View>
                    </View>
                ))}
            </View>
        );
    }

    return (
        <Animated.View
            style={[skeletonStyle, getAnimatedStyle()]}
            testID={testID}
        >
            {renderShimmerEffect()}
        </Animated.View>
    );
}

function SkeletonGroup({
                           children,
                           loading,
                           fallback,
                           delay = 0,
                           style,
                           testID,
                       }: SkeletonGroupProps): JSX.Element {
    const [showSkeleton, setShowSkeleton] = React.useState(loading);

    useEffect(() => {
        if (loading && delay > 0) {
            const timer = setTimeout(() => setShowSkeleton(true), delay);
            return () => clearTimeout(timer);
        } else {
            setShowSkeleton(loading);
        }
    }, [loading, delay]);

    if (!showSkeleton) {
        return <>{children}</>;
    }

    return (
        <View style={style} testID={testID}>
            {fallback || children}
        </View>
    );
}

function SkeletonCard({
                          showAvatar = false,
                          showImage = false,
                          imageHeight = 200,
                          lines = 3,
                          showActions = false,
                          showBadge = false,
                          variant = 'default',
                          style,
                          testID,
                      }: SkeletonCardProps): JSX.Element {
    const cardStyle = useMemo(() => [
        styles.card,
        styles.cardVariants[variant],
        style,
    ], [variant, style]);

    const renderCardContent = () => {
        switch (variant) {
            case 'product':
                return (
                    <>
                        <Skeleton variant="rounded" width="100%" height={imageHeight} style={styles.cardImage} />
                        {showBadge && (
                            <View style={styles.badgeContainer}>
                                <Skeleton variant="rounded" width={60} height={24} />
                            </View>
                        )}
                        <View style={styles.cardContent}>
                            <Skeleton variant="text" lines={2} style={styles.cardText} />
                            <View style={styles.ratingRow}>
                                <Skeleton variant="circular" width={12} height={12} />
                                <Skeleton variant="text" width="60%" style={styles.ratingText} />
                            </View>
                            <View style={styles.priceRow}>
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="30%" />
                            </View>
                        </View>
                    </>
                );
            case 'article':
                return (
                    <>
                        {showImage && (
                            <Skeleton variant="rounded" width="100%" height={imageHeight} style={styles.cardImage} />
                        )}
                        <View style={styles.cardContent}>
                            <Skeleton variant="text" width="80%" style={styles.titleSkeleton} />
                            <Skeleton variant="text" lines={lines} style={styles.cardText} />
                            <View style={styles.metaRow}>
                                <Skeleton variant="circular" width={24} height={24} />
                                <Skeleton variant="text" width="40%" style={styles.metaText} />
                                <Skeleton variant="text" width="20%" />
                            </View>
                        </View>
                    </>
                );
            case 'profile':
                return (
                    <View style={styles.profileContent}>
                        <Skeleton variant="circular" width={80} height={80} style={styles.profileAvatar} />
                        <Skeleton variant="text" width="60%" style={styles.profileName} />
                        <Skeleton variant="text" width="40%" style={styles.profileRole} />
                        <Skeleton variant="text" lines={2} style={styles.profileBio} />
                        {showActions && (
                            <View style={styles.profileActions}>
                                <Skeleton variant="rounded" width={100} height={36} />
                                <Skeleton variant="rounded" width={100} height={36} />
                            </View>
                        )}
                    </View>
                );
            default:
                return (
                    <>
                        {showAvatar && (
                            <View style={styles.avatarRow}>
                                <Skeleton variant="circular" width={40} height={40} style={styles.avatar} />
                                <View style={styles.avatarContent}>
                                    <Skeleton variant="text" width="60%" style={styles.avatarName} />
                                    <Skeleton variant="text" width="40%" />
                                </View>
                            </View>
                        )}
                        {showImage && (
                            <Skeleton variant="rounded" width="100%" height={imageHeight} style={styles.cardImage} />
                        )}
                        <View style={styles.cardContent}>
                            <Skeleton variant="text" lines={lines} />
                        </View>
                        {showActions && (
                            <View style={styles.actionRow}>
                                <Skeleton variant="rounded" width={80} height={36} />
                                <Skeleton variant="rounded" width={80} height={36} />
                            </View>
                        )}
                    </>
                );
        }
    };

    return (
        <View style={cardStyle} testID={testID}>
            {renderCardContent()}
        </View>
    );
}

function SkeletonList({
                          items = 5,
                          showAvatar = true,
                          avatarSize = 'md',
                          lines = 2,
                          showLeading = false,
                          showTrailing = true,
                          itemHeight,
                          style,
                          testID,
                      }: SkeletonListProps): JSX.Element {
    const size = AVATAR_SIZES[avatarSize];

    return (
        <View style={style} testID={testID}>
            {Array.from({ length: items }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.listItem,
                        itemHeight && { height: itemHeight },
                        index !== items - 1 && styles.listItemBorder,
                    ]}
                >
                    {showLeading && (
                        <Skeleton
                            variant="rectangular"
                            width={24}
                            height={24}
                            style={styles.listLeading}
                        />
                    )}

                    {showAvatar && (
                        <Skeleton
                            variant="circular"
                            width={size}
                            height={size}
                            style={styles.listAvatar}
                        />
                    )}

                    <View style={styles.listContent}>
                        <Skeleton variant="text" lines={lines} />
                    </View>

                    {showTrailing && (
                        <Skeleton
                            variant="rounded"
                            width={24}
                            height={24}
                            style={styles.listTrailing}
                        />
                    )}
                </View>
            ))}
        </View>
    );
}

// Specialized Skeleton Components
function SkeletonProduct(): JSX.Element {
    return (
        <View style={styles.productCard}>
            <Skeleton variant="rounded" width="100%" height={120} style={styles.productImage} />
            <View style={styles.productContent}>
                <Skeleton variant="text" lines={2} style={styles.productTitle} />
                <View style={styles.productRating}>
                    <Skeleton variant="circular" width={12} height={12} style={styles.productStar} />
                    <Skeleton variant="text" width="60%" />
                </View>
                <View style={styles.productPrice}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="30%" />
                </View>
            </View>
        </View>
    );
}

function SkeletonStore(): JSX.Element {
    return (
        <View style={styles.storeCard}>
            <Skeleton variant="rectangular" width="100%" height={80} />
            <View style={styles.storeContent}>
                <View style={styles.storeHeader}>
                    <Skeleton variant="text" width="70%" style={styles.storeName} />
                    <Skeleton variant="rounded" width={60} height={20} />
                </View>
                <Skeleton variant="text" lines={2} style={styles.storeDescription} />
                <View style={styles.storeInfo}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="30%" />
                </View>
                <View style={styles.storeActions}>
                    <Skeleton variant="rounded" width="48%" height={36} />
                    <Skeleton variant="rounded" width="48%" height={36} />
                </View>
            </View>
        </View>
    );
}

function SkeletonSearch(): JSX.Element {
    return (
        <View>
            {Array.from({ length: 8 }).map((_, index) => (
                <View key={index} style={styles.searchItem}>
                    <Skeleton variant="rounded" width={64} height={64} style={styles.searchImage} />
                    <View style={styles.searchContent}>
                        <Skeleton variant="text" lines={2} style={styles.searchTitle} />
                        <View style={styles.searchMeta}>
                            <Skeleton variant="circular" width={12} height={12} style={styles.searchIcon} />
                            <Skeleton variant="text" width="40%" />
                        </View>
                        <View style={styles.searchPrice}>
                            <Skeleton variant="text" width="30%" />
                            <Skeleton variant="text" width="25%" />
                        </View>
                    </View>
                    <Skeleton variant="circular" width={20} height={20} style={styles.searchAction} />
                </View>
            ))}
        </View>
    );
}

function SkeletonGrid({ columns = 2, rows = 3, spacing = 12 }: { columns?: number; rows?: number; spacing?: number }): JSX.Element {
    const itemWidth = `${(100 - (columns - 1) * (spacing / 10)) / columns}%`;

    return (
        <View style={[styles.grid, { gap: spacing }]}>
            {Array.from({ length: rows * columns }).map((_, index) => (
                <View key={index} style={[styles.gridItem, { width: itemWidth }]}>
                    <SkeletonCard variant="product" />
                </View>
            ))}
        </View>
    );
}

// Export compound component
Skeleton.Group = SkeletonGroup;
Skeleton.Card = SkeletonCard;
Skeleton.List = SkeletonList;
Skeleton.Product = SkeletonProduct;
Skeleton.Store = SkeletonStore;
Skeleton.Search = SkeletonSearch;
Skeleton.Grid = SkeletonGrid;

export default Skeleton;

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },

    // Variant styles
    variants: {
        text: {
            height: 16,
            borderRadius: 4,
        },
        rectangular: {
            borderRadius: 6,
        },
        circular: {
            borderRadius: 9999,
        },
        rounded: {
            borderRadius: 8,
        },
        square: {
            borderRadius: 0,
        },
    },

    // Animation overlay
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    gradient: {
        flex: 1,
        width: screenWidth,
    },

    // Text lines
    textLine: {
        marginBottom: 8,
    },

    lastTextLine: {
        marginBottom: 0,
    },

    // Card styles
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },

    cardVariants: {
        default: {
            padding: 16,
        },
        product: {
            padding: 12,
            width: 160,
            marginRight: 12,
        },
        article: {
            marginBottom: 16,
        },
        profile: {
            padding: 24,
            alignItems: 'center',
        },
    },

    cardImage: {
        marginBottom: 12,
    },

    cardContent: {
        flex: 1,
    },

    cardText: {
        marginBottom: 8,
    },

    titleSkeleton: {
        marginBottom: 12,
    },

    // Avatar row
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    avatar: {
        marginRight: 12,
    },

    avatarContent: {
        flex: 1,
    },

    avatarName: {
        marginBottom: 8,
    },

    // Action row
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },

    // Product specific
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        width: 160,
        marginRight: 12,
    },

    productImage: {
        marginBottom: 12,
    },

    productContent: {
        flex: 1,
    },

    productTitle: {
        marginBottom: 8,
    },

    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    productStar: {
        marginRight: 4,
    },

    productPrice: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    ratingText: {
        marginLeft: 8,
    },

    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // Badge
    badgeContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
    },

    // Meta row
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },

    metaText: {
        marginLeft: 8,
        marginRight: 8,
    },

    // Profile specific
    profileContent: {
        alignItems: 'center',
    },

    profileAvatar: {
        marginBottom: 16,
    },

    profileName: {
        marginBottom: 8,
    },

    profileRole: {
        marginBottom: 16,
    },

    profileBio: {
        marginBottom: 20,
        textAlign: 'center',
    },

    profileActions: {
        flexDirection: 'row',
        gap: 12,
    },

    // Store specific
    storeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
        overflow: 'hidden',
    },

    storeContent: {
        padding: 16,
    },

    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    storeName: {
        marginRight: 8,
    },

    storeDescription: {
        marginBottom: 12,
    },

    storeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    storeActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },

    // List specific
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        minHeight: 72,
    },

    listItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    listLeading: {
        marginRight: 12,
    },

    listAvatar: {
        marginRight: 16,
    },

    listContent: {
        flex: 1,
    },

    listTrailing: {
        marginLeft: 16,
    },

    // Search specific
    searchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    searchImage: {
        marginRight: 16,
    },

    searchContent: {
        flex: 1,
    },

    searchTitle: {
        marginBottom: 8,
    },

    searchMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchPrice: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    searchAction: {
        marginLeft: 16,
    },

    // Grid specific
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    gridItem: {
        marginBottom: 12,
    },
});