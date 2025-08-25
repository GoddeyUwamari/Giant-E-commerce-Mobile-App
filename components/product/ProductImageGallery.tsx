import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Modal,
    PanGestureHandler,
    PinchGestureHandler,
    State,
    Animated,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface ProductImage {
    id: string;
    url: string;
    alt?: string;
    type?: 'main' | 'variant' | 'detail' | 'lifestyle';
    caption?: string;
}

interface ProductImageGalleryProps {
    images: ProductImage[];
    initialIndex?: number;
    showThumbnails?: boolean;
    showZoom?: boolean;
    showFullscreen?: boolean;
    aspectRatio?: number;
    onImageChange?: (index: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProductImageGallery({
                                                images,
                                                initialIndex = 0,
                                                showThumbnails = true,
                                                showZoom = true,
                                                showFullscreen = true,
                                                aspectRatio = 1,
                                                onImageChange,
                                            }: ProductImageGalleryProps): JSX.Element {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const fullscreenScrollRef = useRef<ScrollView>(null);

    // Zoom and pan animations
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const lastScale = useRef(1);
    const lastTranslateX = useRef(0);
    const lastTranslateY = useRef(0);

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);

        if (index !== currentIndex && index >= 0 && index < images.length) {
            setCurrentIndex(index);
            onImageChange?.(index);
        }
    };

    const goToImage = (index: number) => {
        setCurrentIndex(index);
        onImageChange?.(index);

        scrollViewRef.current?.scrollTo({
            x: index * screenWidth,
            animated: true,
        });

        if (isFullscreen) {
            fullscreenScrollRef.current?.scrollTo({
                x: index * screenWidth,
                animated: true,
            });
        }
    };

    const handleImagePress = () => {
        if (showFullscreen) {
            setIsFullscreen(true);
        }
    };

    const handleDoubleTap = () => {
        if (!showZoom) return;

        const newScale = isZoomed ? 1 : 2;
        setIsZoomed(!isZoomed);

        Animated.parallel([
            Animated.timing(scale, {
                toValue: newScale,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        lastScale.current = newScale;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
    };

    const onPinchGestureEvent = Animated.event(
        [{ nativeEvent: { scale: scale } }],
        { useNativeDriver: true }
    );

    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            lastScale.current *= event.nativeEvent.scale;
            scale.setValue(lastScale.current);
            setIsZoomed(lastScale.current > 1);
        }
    };

    const onPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: true }
    );

    const onPanHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            lastTranslateX.current += event.nativeEvent.translationX;
            lastTranslateY.current += event.nativeEvent.translationY;
            translateX.setValue(lastTranslateX.current);
            translateY.setValue(lastTranslateY.current);
        }
    };

    const renderThumbnails = () => {
        if (!showThumbnails || images.length <= 1) return null;

        return (
            <View style={styles.thumbnailsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailsScrollContent}
                >
                    {images.map((image, index) => (
                        <TouchableOpacity
                            key={image.id}
                            style={[
                                styles.thumbnailButton,
                                index === currentIndex ? styles.thumbnailButtonActive : styles.thumbnailButtonInactive,
                            ]}
                            onPress={() => goToImage(index)}
                        >
                            <Image
                                source={{ uri: image.url }}
                                style={styles.thumbnailImage}
                                contentFit="cover"
                            />
                            {index === currentIndex && (
                                <View style={styles.thumbnailOverlay} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderImageIndicators = () => {
        if (images.length <= 1) return null;

        return (
            <View style={styles.indicatorsContainer}>
                {images.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.indicator,
                            index === currentIndex ? styles.indicatorActive : styles.indicatorInactive,
                        ]}
                        onPress={() => goToImage(index)}
                    />
                ))}
            </View>
        );
    };

    const renderImageBadges = () => {
        const currentImage = images[currentIndex];
        if (!currentImage?.type || currentImage.type === 'main') return null;

        const badgeConfig = {
            variant: { label: 'Variant', color: '#8B5CF6' },
            detail: { label: 'Detail', color: '#06B6D4' },
            lifestyle: { label: 'Lifestyle', color: '#10B981' },
        };

        const config = badgeConfig[currentImage.type as keyof typeof badgeConfig];
        if (!config) return null;

        return (
            <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
                    <Text style={[styles.badgeText, { color: config.color }]}>
                        {config.label}
                    </Text>
                </View>
            </View>
        );
    };

    const renderMainGallery = () => (
        <View style={styles.mainGalleryContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
            >
                {images.map((image, index) => (
                    <TouchableOpacity
                        key={image.id}
                        onPress={handleImagePress}
                        activeOpacity={0.9}
                        style={{ width: screenWidth }}
                    >
                        <View style={[styles.imageContainer, { aspectRatio }]}>
                            <Image
                                source={{ uri: image.url }}
                                style={styles.mainImage}
                                contentFit="cover"
                                placeholder="Loading..."
                            />

                            {/* Overlay gradient for better text visibility */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.3)']}
                                style={styles.imageGradient}
                            />

                            {image.caption && (
                                <View style={styles.captionContainer}>
                                    <Text style={styles.captionText}>
                                        {image.caption}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {renderImageBadges()}
            {renderImageIndicators()}

            {/* Image Counter */}
            {images.length > 1 && (
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {currentIndex + 1} / {images.length}
                    </Text>
                </View>
            )}

            {/* Zoom Hint */}
            {showZoom && (
                <View style={styles.zoomHintContainer}>
                    <View style={styles.zoomHint}>
                        <Ionicons name="expand" size={12} color="white" />
                        <Text style={styles.zoomHintText}>Tap to zoom</Text>
                    </View>
                </View>
            )}
        </View>
    );

    const renderFullscreenGallery = () => (
        <Modal
            visible={isFullscreen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsFullscreen(false)}
        >
            <View style={styles.fullscreenContainer}>
                {/* Header */}
                <View style={styles.fullscreenHeader}>
                    <View style={styles.fullscreenHeaderContent}>
                        <TouchableOpacity
                            style={styles.fullscreenButton}
                            onPress={() => setIsFullscreen(false)}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>

                        <Text style={styles.fullscreenCounter}>
                            {currentIndex + 1} of {images.length}
                        </Text>

                        <TouchableOpacity
                            style={styles.fullscreenButton}
                            onPress={() => {/* Share functionality */}}
                        >
                            <Ionicons name="share" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Fullscreen Images */}
                <ScrollView
                    ref={fullscreenScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    contentContainerStyle={styles.fullscreenScrollContent}
                >
                    {images.map((image) => (
                        <View
                            key={image.id}
                            style={styles.fullscreenImageContainer}
                        >
                            <PinchGestureHandler
                                onGestureEvent={onPinchGestureEvent}
                                onHandlerStateChange={onPinchHandlerStateChange}
                            >
                                <Animated.View>
                                    <PanGestureHandler
                                        onGestureEvent={onPanGestureEvent}
                                        onHandlerStateChange={onPanHandlerStateChange}
                                        enabled={isZoomed}
                                    >
                                        <Animated.View
                                            style={{
                                                transform: [
                                                    { scale: scale },
                                                    { translateX: translateX },
                                                    { translateY: translateY },
                                                ],
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={handleDoubleTap}
                                                activeOpacity={0.9}
                                            >
                                                <Image
                                                    source={{ uri: image.url }}
                                                    style={styles.fullscreenImage}
                                                    contentFit="contain"
                                                />
                                            </TouchableOpacity>
                                        </Animated.View>
                                    </PanGestureHandler>
                                </Animated.View>
                            </PinchGestureHandler>
                        </View>
                    ))}
                </ScrollView>

                {/* Bottom Controls */}
                <View style={styles.fullscreenControls}>
                    <View style={styles.fullscreenControlsContent}>
                        <TouchableOpacity
                            style={styles.fullscreenControlButton}
                            onPress={() => goToImage(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color={currentIndex === 0 ? "#666" : "white"}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.fullscreenControlButton}
                            onPress={handleDoubleTap}
                        >
                            <Ionicons
                                name={isZoomed ? "contract" : "expand"}
                                size={24}
                                color="white"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.fullscreenControlButton}
                            onPress={() => goToImage(Math.min(images.length - 1, currentIndex + 1))}
                            disabled={currentIndex === images.length - 1}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={24}
                                color={currentIndex === images.length - 1 ? "#666" : "white"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (!images.length) {
        return (
            <View style={[styles.emptyContainer, { aspectRatio }]}>
                <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No images available</Text>
            </View>
        );
    }

    return (
        <View>
            {renderMainGallery()}
            {renderThumbnails()}
            {showFullscreen && renderFullscreenGallery()}
        </View>
    );
}

const styles = StyleSheet.create({
    // Thumbnails
    thumbnailsContainer: {
        marginTop: 16,
    },
    thumbnailsScrollContent: {
        paddingHorizontal: 16,
    },
    thumbnailButton: {
        marginRight: 12,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
    },
    thumbnailButtonActive: {
        borderColor: '#2563EB',
    },
    thumbnailButtonInactive: {
        borderColor: '#E5E7EB',
    },
    thumbnailImage: {
        width: 64,
        height: 64,
    },
    thumbnailOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
    },

    // Main Gallery
    mainGalleryContainer: {
        position: 'relative',
    },
    imageContainer: {
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    captionContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
    captionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },

    // Indicators
    indicatorsContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    indicatorActive: {
        backgroundColor: '#FFFFFF',
    },
    indicatorInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },

    // Badges
    badgeContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
    },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Counter
    counterContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    counterText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },

    // Zoom Hint
    zoomHintContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
    },
    zoomHint: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    zoomHintText: {
        color: '#FFFFFF',
        fontSize: 12,
        marginLeft: 4,
    },

    // Fullscreen
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    fullscreenHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    fullscreenHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fullscreenButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
    fullscreenCounter: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    fullscreenScrollContent: {
        alignItems: 'center',
    },
    fullscreenImageContainer: {
        width: screenWidth,
        height: screenHeight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullscreenImage: {
        width: screenWidth,
        height: screenWidth,
    },
    fullscreenControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 16,
    },
    fullscreenControlsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    fullscreenControlButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 12,
    },

    // Empty State
    emptyContainer: {
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#6B7280',
        marginTop: 8,
    },
});