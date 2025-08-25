import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

// Types
interface Category {
    id: string;
    name: string;
    icon: string;
    image?: string;
    color: string;
    itemCount?: number;
    onPress: () => void;
}

interface CategoryTilesProps {
    categories: Category[];
    title?: string;
    showItemCount?: boolean;
    tilesPerRow?: number;
    showSeeAll?: boolean;
    onSeeAllPress?: () => void;
    variant?: 'grid' | 'horizontal' | 'auto';
    showImages?: boolean;
    tileSize?: 'small' | 'medium' | 'large';
}

// Constants
const { width: screenWidth } = Dimensions.get('window');

const WALMART_COLORS = {
    primary: '#0071CE',
    primaryDark: '#005AA3',
    secondary: '#FFC220',
    success: '#00A652',
    error: '#E53E3E',
    warning: '#FF8C00',
    white: '#FFFFFF',
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
    // Badge colors
    badgeRed: '#EF4444',
    badgeBackground: 'rgba(239, 68, 68, 0.1)',
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
};

// Utility Functions
const getTileSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
        case 'small':
            return 60;
        case 'medium':
            return 80;
        case 'large':
            return 100;
        default:
            return 80;
    }
};

const getTileWidth = (tilesPerRow: number, containerPadding: number = SPACING.xxl) => {
    const availableWidth = screenWidth - (containerPadding * 2);
    const gapWidth = SPACING.md * (tilesPerRow - 1);
    return (availableWidth - gapWidth) / tilesPerRow;
};

const getIconSize = (tileSize: 'small' | 'medium' | 'large') => {
    switch (tileSize) {
        case 'small':
            return 24;
        case 'medium':
            return 32;
        case 'large':
            return 40;
        default:
            return 32;
    }
};

// Animated Tile Component
const AnimatedCategoryTile = React.memo(({
                                             category,
                                             index,
                                             tilesPerRow,
                                             showItemCount,
                                             showImages,
                                             tileSize,
                                             onPress,
                                             isPressed,
                                         }: {
    category: Category;
    index: number;
    tilesPerRow: number;
    showItemCount: boolean;
    showImages: boolean;
    tileSize: 'small' | 'medium' | 'large';
    onPress: (category: Category) => void;
    isPressed: boolean;
}) => {
    const tileWidth = useMemo(() => getTileWidth(tilesPerRow), [tilesPerRow]);
    const iconSize = useMemo(() => getIconSize(tileSize), [tileSize]);

    const animatedScale = new Animated.Value(1);

    const handlePressIn = useCallback(() => {
        Animated.spring(animatedScale, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    }, []);

    const handlePressOut = useCallback(() => {
        Animated.spring(animatedScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    }, []);

    const handlePress = useCallback(() => {
        onPress(category);
    }, [category, onPress]);

    const tileBackgroundColor = useMemo(() => {
        // Convert hex color to rgba with 15% opacity
        const hex = category.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, 0.15)`;
    }, [category.color]);

    const overlayColor = useMemo(() => {
        // Convert hex color to rgba with 20% opacity for image overlay
        const hex = category.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }, [category.color]);

    return (
        <TouchableOpacity
            style={[
                styles.tileContainer,
                { width: tileWidth },
                index % tilesPerRow !== tilesPerRow - 1 && styles.tileMarginRight,
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
        >
            <Animated.View
                style={[
                    styles.tileContent,
                    { transform: [{ scale: animatedScale }] },
                ]}
            >
                {/* Tile Container */}
                <View
                    style={[
                        styles.tile,
                        { backgroundColor: tileBackgroundColor },
                        tileSize === 'small' && styles.tileSmall,
                        tileSize === 'large' && styles.tileLarge,
                    ]}
                >
                    {showImages && category.image ? (
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: category.image }}
                                style={styles.tileImage}
                                contentFit="cover"
                                transition={200}
                            />
                            <View
                                style={[
                                    styles.imageOverlay,
                                    { backgroundColor: overlayColor },
                                ]}
                            />
                            <View style={styles.imageIconContainer}>
                                <Ionicons
                                    name={category.icon as any}
                                    size={iconSize}
                                    color={WALMART_COLORS.white}
                                    style={styles.imageIcon}
                                />
                            </View>
                        </View>
                    ) : (
                        <Ionicons
                            name={category.icon as any}
                            size={iconSize}
                            color={category.color}
                        />
                    )}

                    {/* Item Count Badge */}
                    {showItemCount && category.itemCount && category.itemCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {category.itemCount > 99 ? '99+' : category.itemCount.toString()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Category Name */}
                <Text
                    style={[
                        styles.categoryName,
                        tileSize === 'small' && styles.categoryNameSmall,
                        tileSize === 'large' && styles.categoryNameLarge,
                    ]}
                    numberOfLines={2}
                >
                    {category.name}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
});

// Header Component
const CategoryHeader = React.memo(({
                                       title,
                                       showSeeAll,
                                       onSeeAllPress,
                                   }: {
    title: string;
    showSeeAll: boolean;
    onSeeAllPress?: () => void;
}) => (
    <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {showSeeAll && onSeeAllPress && (
            <TouchableOpacity
                style={styles.seeAllButton}
                onPress={onSeeAllPress}
                activeOpacity={0.7}
            >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={WALMART_COLORS.primary}
                />
            </TouchableOpacity>
        )}
    </View>
));

// Main Component
export default function CategoryTiles({
                                          categories,
                                          title = 'Shop by Category',
                                          showItemCount = true,
                                          tilesPerRow = 4,
                                          showSeeAll = true,
                                          onSeeAllPress,
                                          variant = 'auto',
                                          showImages = true,
                                          tileSize = 'medium',
                                      }: CategoryTilesProps): JSX.Element {
    // State
    const [pressedTileId, setPressedTileId] = useState<string | null>(null);

    // Memoized values
    const shouldUseGrid = useMemo(() => {
        if (variant === 'grid') return true;
        if (variant === 'horizontal') return false;
        return categories.length <= 8; // auto mode
    }, [variant, categories.length]);

    // Callbacks
    const handleTilePress = useCallback((category: Category) => {
        setPressedTileId(category.id);

        // Reset pressed state after animation
        setTimeout(() => {
            setPressedTileId(null);
        }, 150);

        category.onPress();
    }, []);

    // Render Functions
    const renderGridTiles = useCallback(() => (
        <View style={styles.gridContainer}>
            {categories.map((category, index) => (
                <AnimatedCategoryTile
                    key={category.id}
                    category={category}
                    index={index}
                    tilesPerRow={tilesPerRow}
                    showItemCount={showItemCount}
                    showImages={showImages}
                    tileSize={tileSize}
                    onPress={handleTilePress}
                    isPressed={pressedTileId === category.id}
                />
            ))}
        </View>
    ), [categories, tilesPerRow, showItemCount, showImages, tileSize, handleTilePress, pressedTileId]);

    const renderHorizontalTiles = useCallback(() => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            style={styles.horizontalScroll}
        >
            {categories.map((category, index) => (
                <View
                    key={category.id}
                    style={[
                        styles.horizontalTileWrapper,
                        index === categories.length - 1 && styles.horizontalTileLastWrapper,
                    ]}
                >
                    <AnimatedCategoryTile
                        category={category}
                        index={0} // No margin calculation needed for horizontal
                        tilesPerRow={1}
                        showItemCount={showItemCount}
                        showImages={showImages}
                        tileSize={tileSize}
                        onPress={handleTilePress}
                        isPressed={pressedTileId === category.id}
                    />
                </View>
            ))}
        </ScrollView>
    ), [categories, showItemCount, showImages, tileSize, handleTilePress, pressedTileId]);

    const renderEmptyState = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="grid-outline"
                size={48}
                color={WALMART_COLORS.gray400}
            />
            <Text style={styles.emptyText}>No categories available</Text>
        </View>
    ), []);

    // Early return for empty categories
    if (!categories.length) {
        return renderEmptyState();
    }

    return (
        <View style={styles.container}>
            <CategoryHeader
                title={title}
                showSeeAll={showSeeAll}
                onSeeAllPress={onSeeAllPress}
            />

            {shouldUseGrid ? renderGridTiles() : renderHorizontalTiles()}
        </View>
    );
}

// Enhanced Styles
const styles = StyleSheet.create({
    // Main Container
    container: {
        marginBottom: SPACING.xxl,
    },

    // Header Styles
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: 8,
        backgroundColor: WALMART_COLORS.gray50,
    },
    seeAllText: {
        color: WALMART_COLORS.primary,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        marginRight: SPACING.xs,
    },

    // Grid Layout
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    // Horizontal Scroll Layout
    horizontalScroll: {
        marginHorizontal: -SPACING.sm,
    },
    horizontalScrollContent: {
        paddingHorizontal: SPACING.sm,
    },
    horizontalTileWrapper: {
        width: getTileSize('medium') + SPACING.lg,
        marginRight: SPACING.md,
    },
    horizontalTileLastWrapper: {
        marginRight: SPACING.sm,
    },

    // Tile Styles
    tileContainer: {
        marginBottom: SPACING.lg,
    },
    tileMarginRight: {
        marginRight: SPACING.md,
    },
    tileContent: {
        alignItems: 'center',
    },
    tile: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
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
    tileSmall: {
        borderRadius: 12,
    },
    tileLarge: {
        borderRadius: 20,
    },

    // Image Styles
    imageContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    tileImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 16,
    },
    imageIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    // Badge Styles
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: WALMART_COLORS.badgeRed,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    badgeText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
        lineHeight: TYPOGRAPHY.xs,
    },

    // Category Name Styles
    categoryName: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
        color: WALMART_COLORS.gray800,
        marginTop: SPACING.sm,
        lineHeight: 18,
        maxWidth: '100%',
    },
    categoryNameSmall: {
        fontSize: TYPOGRAPHY.xs,
        marginTop: SPACING.xs,
    },
    categoryNameLarge: {
        fontSize: TYPOGRAPHY.md,
        marginTop: SPACING.md,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray500,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
});