import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
    Share,
    FlatList,
    Modal,
    StyleSheet,
    StatusBar,
    Animated,
    PanResponder,
    Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

// Import unified system - FIXED IMPORTS
import { useCartStore } from '../../store/slices/cartSlice';
import {
    ALL_PRODUCTS,
    getProductsByCategory,
    Product,
    CATEGORIES
} from '../../constants/products';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced colors for better UI
const COLORS = {
    primary: '#10B981',
    primaryDark: '#059669',
    secondary: '#3B82F6',
    white: '#FFFFFF',
    black: '#1F2937',
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
    red: '#EF4444',
    yellow: '#F59E0B',
    green: '#10B981',
    blue: '#3B82F6',
};

// FIXED: Create getProductById function
const getProductById = (id: string): Product | null => {
    return ALL_PRODUCTS.find(product => product.id === id) || null;
};

// FIXED: Create getRelatedProducts function
const getRelatedProducts = (productId: string): Product[] => {
    const currentProduct = getProductById(productId);
    if (!currentProduct) return [];

    // Get products from same category, excluding current product
    const categoryProducts = getProductsByCategory(currentProduct.category as keyof typeof CATEGORIES);
    const relatedProducts = categoryProducts
        .filter(product => product.id !== productId)
        .slice(0, 10);

    return relatedProducts;
};

// FIXED: Create variant interface that matches your system
interface ProductVariant {
    id: string;
    type: 'color' | 'size' | 'storage' | 'style';
    value: string;
    price?: number;
    inStock: boolean;
    image?: any;
}

export default function ProductDetailsPage(): JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: ProductVariant }>({});
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [headerOpacity, setHeaderOpacity] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    // Enhanced animations
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    // Scroll listener for header animation
    useEffect(() => {
        const listener = scrollY.addListener(({ value }) => {
            const opacity = Math.min(value / 200, 1);
            setHeaderOpacity(opacity);
        });

        return () => scrollY.removeListener(listener);
    }, []);

    useEffect(() => {
        loadProduct();
        checkIfFavorite();
    }, [id]);

    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    const loadProduct = async () => {
        try {
            setIsLoading(true);

            // Get product from unified system
            const productData = getProductById(id);

            if (!productData) {
                Alert.alert('Error', 'Product not found');
                router.back();
                return;
            }

            setProduct(productData);

            // Load related products
            const related = getRelatedProducts(id);
            setRelatedProducts(related);

            // FIXED: Set default variants if available (using your product structure)
            if (productData.variants?.colors && productData.variants.colors.length > 0) {
                const defaultColor: ProductVariant = {
                    id: productData.variants.colors[0].id,
                    type: 'color',
                    value: productData.variants.colors[0].name,
                    price: productData.variants.colors[0].price,
                    inStock: productData.variants.colors[0].inStock,
                    image: productData.variants.colors[0].image
                };
                setSelectedVariants(prev => ({
                    ...prev,
                    color: defaultColor
                }));
            }

            if (productData.variants?.sizes && productData.variants.sizes.length > 0) {
                const defaultSize: ProductVariant = {
                    id: productData.variants.sizes[0].id,
                    type: 'size',
                    value: productData.variants.sizes[0].name,
                    price: productData.variants.sizes[0].price,
                    inStock: productData.variants.sizes[0].inStock
                };
                setSelectedVariants(prev => ({
                    ...prev,
                    size: defaultSize
                }));
            }

        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setIsLoading(false);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const favorites = await AsyncStorage.getItem('favorite_products');
            if (favorites) {
                const favoriteList = JSON.parse(favorites);
                setIsFavorite(favoriteList.includes(id));
            }
        } catch (error) {
            console.error('Error checking favorites:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            // Haptic feedback
            Vibration.vibrate(50);

            // Animate heart
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.3,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            const favorites = await AsyncStorage.getItem('favorite_products');
            let favoriteList = favorites ? JSON.parse(favorites) : [];

            if (isFavorite) {
                favoriteList = favoriteList.filter((favId: string) => favId !== id);
            } else {
                favoriteList.push(id);
            }

            await AsyncStorage.setItem('favorite_products', JSON.stringify(favoriteList));
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    const handleVariantSelect = (variantType: string, variant: ProductVariant) => {
        if (!variant.inStock) return;

        setSelectedVariants(prev => ({
            ...prev,
            [variantType]: variant
        }));
    };

    const calculateCurrentPrice = (): number => {
        if (!product) return 0;

        let price = product.price;
        Object.values(selectedVariants).forEach(variant => {
            if (variant.price) {
                price = variant.price;
            }
        });
        return price;
    };

    const handleAddToCart = async () => {
        if (!product) return;

        setIsAddingToCart(true);
        Vibration.vibrate(100);

        try {
            const success = await addItem({
                productId: product.id,
                name: product.name,
                brand: product.brand,
                price: calculateCurrentPrice(),
                originalPrice: product.originalPrice,
                quantity: quantity,
                maxQuantity: product.maxQuantity,
                minQuantity: product.minQuantity,
                image: product.primaryImage,
                category: product.category,
                sku: product.sku,
                status: product.status,
                storeId: product.storeId,
                storeName: product.storeName,
                delivery: product.delivery,
                // FIXED: Use variant structure that matches cart store
                variant: selectedVariants,
            });

            if (success) {
                setShowQuickAdd(true);
                setTimeout(() => setShowQuickAdd(false), 3000);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        handleAddToCart();
        setTimeout(() => {
            router.push('/(modals)/cart');
        }, 500);
    };

    const handleShare = async () => {
        if (!product) return;

        try {
            await Share.share({
                message: `Check out this ${product.name} for $${calculateCurrentPrice().toFixed(2)} on Walmart!\n\nhttps://walmart.com/product/${product.id}`,
                title: product.name,
            });
        } catch (error) {
            console.error('Error sharing product:', error);
        }
    };

    const renderStars = (rating: number, size: number = 16) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
                    size={size}
                    color="#F59E0B"
                />
            );
        }
        return stars;
    };

    // FIXED: Create renderVariantOptions for your product structure
    const renderVariantOptions = (variantType: string, variants: any[]) => (
        <View style={styles.variantSection}>
            <Text style={styles.variantTitle}>
                {variantType}: {selectedVariants[variantType]?.value || 'Select'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.variantOptionsRow}>
                    {variants.map((variant) => {
                        const variantOption: ProductVariant = {
                            id: variant.id,
                            type: variantType as any,
                            value: variant.name,
                            price: variant.price,
                            inStock: variant.inStock,
                            image: variant.image
                        };

                        return (
                            <TouchableOpacity
                                key={variant.id}
                                style={[
                                    styles.variantOption,
                                    selectedVariants[variantType]?.id === variant.id
                                        ? styles.variantOptionSelected
                                        : variant.inStock
                                            ? styles.variantOptionAvailable
                                            : styles.variantOptionUnavailable
                                ]}
                                onPress={() => handleVariantSelect(variantType, variantOption)}
                                disabled={!variant.inStock}
                                activeOpacity={0.8}
                            >
                                {variant.image && (
                                    <Image
                                        source={variant.image}
                                        style={styles.variantImage}
                                        resizeMode="cover"
                                    />
                                )}
                                <Text style={[
                                    styles.variantText,
                                    selectedVariants[variantType]?.id === variant.id
                                        ? styles.variantTextSelected
                                        : variant.inStock
                                            ? styles.variantTextAvailable
                                            : styles.variantTextUnavailable
                                ]}>
                                    {variant.name}
                                </Text>
                                {variant.price && variant.price !== product?.price && (
                                    <Text style={[
                                        styles.variantPrice,
                                        selectedVariants[variantType]?.id === variant.id
                                            ? styles.variantPriceSelected
                                            : variant.inStock
                                                ? styles.variantPriceAvailable
                                                : styles.variantPriceUnavailable
                                    ]}>
                                        ${variant.price.toFixed(2)}
                                    </Text>
                                )}
                                {!variant.inStock && (
                                    <Text style={styles.outOfStockText}>
                                        Out of Stock
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );

    const renderRelatedProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.relatedProductCard}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.9}
        >
            <Image
                source={item.primaryImage}
                style={styles.relatedProductImage}
                resizeMode="cover"
            />
            <View style={styles.relatedProductInfo}>
                <Text style={styles.relatedProductName} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.relatedProductPricing}>
                    <Text style={styles.relatedProductPrice}>
                        ${item.price.toFixed(2)}
                    </Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <Text style={styles.relatedProductOriginalPrice}>
                            ${item.originalPrice.toFixed(2)}
                        </Text>
                    )}
                </View>
                <View style={styles.relatedProductRating}>
                    {renderStars(item.rating, 12)}
                    <Text style={styles.relatedProductRatingText}>({item.reviewCount})</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // FIXED: Create product images array from your structure
    const getProductImages = () => {
        if (!product) return [];

        // If product has images array, use it, otherwise create array with primaryImage
        if (product.images && Array.isArray(product.images)) {
            return product.images;
        }

        // Fallback to primaryImage
        return [{ id: '1', url: product.primaryImage }];
    };

    const productImages = getProductImages();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
                <SafeAreaView style={styles.loadingContent}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading product...</Text>
                </SafeAreaView>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
                <SafeAreaView style={styles.errorContent}>
                    <Ionicons name="alert-circle" size={64} color={COLORS.red} />
                    <Text style={styles.errorTitle}>Product Not Found</Text>
                    <Text style={styles.errorMessage}>
                        The product you're looking for doesn't exist.
                    </Text>
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {/* Enhanced Header with dynamic opacity */}
            <SafeAreaView style={[styles.headerContainer, { backgroundColor: `rgba(16, 185, 129, ${headerOpacity})` }]}>
                <BlurView intensity={headerOpacity * 100} style={styles.headerBlur}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>
                            {product.name}
                        </Animated.Text>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={handleShare}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="share-outline" size={24} color={COLORS.white} />
                            </TouchableOpacity>

                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <TouchableOpacity
                                    style={styles.headerButton}
                                    onPress={toggleFavorite}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={isFavorite ? "heart" : "heart-outline"}
                                        size={24}
                                        color={isFavorite ? COLORS.red : COLORS.white}
                                    />
                                </TouchableOpacity>
                            </Animated.View>

                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => router.push('/(modals)/cart')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.cartIconContainer}>
                                    <Ionicons name="bag-outline" size={24} color={COLORS.white} />
                                    {summary.itemCount > 0 && (
                                        <View style={styles.cartBadge}>
                                            <Text style={styles.cartBadgeText}>{summary.itemCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </SafeAreaView>

            <Animated.ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Enhanced Product Images with better interaction */}
                <View style={styles.imageSection}>
                    <TouchableOpacity
                        onPress={() => setShowImageModal(true)}
                        activeOpacity={0.95}
                        style={styles.mainImageContainer}
                    >
                        <Image
                            source={productImages[selectedImageIndex]?.url || product.primaryImage}
                            style={styles.mainImage}
                            resizeMode="contain"
                        />

                        {/* Enhanced zoom indicator */}
                        <View style={styles.zoomIndicator}>
                            <Ionicons name="expand-outline" size={20} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>

                    {/* Enhanced Badges with better positioning */}
                    {product.badge && (
                        <View style={[styles.productBadge, { backgroundColor: product.badgeColor || COLORS.red }]}>
                            <Text style={styles.productBadgeText}>{product.badge}</Text>
                        </View>
                    )}

                    {product.discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{product.discount}</Text>
                        </View>
                    )}

                    {!product.inStock && (
                        <View style={styles.stockBadge}>
                            <Text style={styles.stockBadgeText}>Out of Stock</Text>
                        </View>
                    )}

                    {/* Enhanced Image Indicators */}
                    {productImages.length > 1 && (
                        <View style={styles.imageIndicators}>
                            {productImages.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedImageIndex(index)}
                                    style={[
                                        styles.indicator,
                                        index === selectedImageIndex ? styles.indicatorActive : styles.indicatorInactive
                                    ]}
                                    activeOpacity={0.7}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Enhanced Image Thumbnails */}
                {productImages.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsScrollView}>
                        <View style={styles.thumbnailsContainer}>
                            {productImages.map((image, index) => (
                                <TouchableOpacity
                                    key={image.id || index}
                                    style={[
                                        styles.thumbnail,
                                        index === selectedImageIndex ? styles.thumbnailSelected : styles.thumbnailUnselected
                                    ]}
                                    onPress={() => setSelectedImageIndex(index)}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={image.url || product.primaryImage}
                                        style={styles.thumbnailImage}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                )}

                {/* Enhanced Product Info */}
                <Animated.View style={[styles.productInfo, { opacity: fadeAnim }]}>
                    {/* Brand & Name with better hierarchy */}
                    <View style={styles.brandContainer}>
                        <Text style={styles.brandText}>{product.brand}</Text>
                        {product.newArrival && (
                            <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>NEW</Text>
                            </View>
                        )}
                        {product.bestSeller && (
                            <View style={styles.bestSellerBadge}>
                                <Text style={styles.bestSellerBadgeText}>BEST SELLER</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.productName}>{product.name}</Text>

                    {product.shortDescription && (
                        <Text style={styles.shortDescription}>{product.shortDescription}</Text>
                    )}

                    {/* Enhanced Rating & Reviews */}
                    <TouchableOpacity
                        style={styles.ratingContainer}
                        onPress={() => setShowReviews(true)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.starsContainer}>
                            {renderStars(product.rating)}
                        </View>
                        <Text style={styles.ratingText}>
                            {product.rating} ({product.reviewCount} reviews)
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.gray400} />
                    </TouchableOpacity>

                    {/* Enhanced Price with savings indicator */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>
                            ${calculateCurrentPrice().toFixed(2)}
                        </Text>
                        {product.originalPrice && product.originalPrice > calculateCurrentPrice() && (
                            <>
                                <Text style={styles.originalPrice}>
                                    ${product.originalPrice.toFixed(2)}
                                </Text>
                                <View style={styles.savingsBadge}>
                                    <Text style={styles.savingsText}>
                                        Save ${(product.originalPrice - calculateCurrentPrice()).toFixed(2)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Enhanced Shipping Info */}
                    <View style={styles.shippingInfo}>
                        <View style={styles.shippingHeader}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                            <Text style={styles.shippingText}>
                                {product.shipping.free ? 'Free shipping' : `Shipping: $${product.shipping.cost}`}
                            </Text>
                        </View>
                        <Text style={styles.shippingDetails}>
                            Estimated delivery: {product.shipping.estimatedDays}
                        </Text>
                        {product.shipping.free && (
                            <View style={styles.freeShippingBadge}>
                                <Ionicons name="flash" size={16} color={COLORS.primary} />
                                <Text style={styles.freeShippingText}>Fast & Free</Text>
                            </View>
                        )}
                    </View>

                    {/* Enhanced Seller Info */}
                    <View style={styles.sellerInfo}>
                        <View style={styles.sellerDetails}>
                            <Text style={styles.sellerLabel}>Sold by</Text>
                            <Text style={styles.sellerName}>{product.seller}</Text>
                        </View>
                        {product.stockCount && product.stockCount < 50 && (
                            <View style={styles.lowStockBadge}>
                                <Ionicons name="time-outline" size={16} color={COLORS.yellow} />
                                <Text style={styles.lowStockText}>
                                    Only {product.stockCount} left!
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* FIXED: Enhanced Variants */}
                    {product.variants?.colors && renderVariantOptions('color', product.variants.colors)}
                    {product.variants?.sizes && renderVariantOptions('size', product.variants.sizes)}

                    {/* Enhanced Quantity Selector */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityTitle}>Quantity</Text>
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity
                                style={[styles.quantityButton, quantity <= product.minQuantity && styles.quantityButtonDisabled]}
                                onPress={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                                disabled={quantity <= product.minQuantity}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="remove" size={20} color={quantity <= product.minQuantity ? COLORS.gray400 : COLORS.gray700} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.quantityButton, quantity >= product.maxQuantity && styles.quantityButtonDisabled]}
                                onPress={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                                disabled={quantity >= product.maxQuantity}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add" size={20} color={quantity >= product.maxQuantity ? COLORS.gray400 : COLORS.gray700} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Enhanced Features */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Key Features</Text>
                        <View style={styles.featuresGrid}>
                            {product.features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <View style={styles.featureIcon}>
                                        <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Enhanced Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>

                    {/* Enhanced Specifications */}
                    <View style={styles.specificationsSection}>
                        <Text style={styles.sectionTitle}>Specifications</Text>
                        <View style={styles.specificationsContainer}>
                            {Object.entries(product.specifications).map(([key, value], index) => (
                                <View
                                    key={key}
                                    style={[
                                        styles.specificationRow,
                                        index < Object.entries(product.specifications).length - 1 && styles.specificationBorder
                                    ]}
                                >
                                    <Text style={styles.specificationKey}>{key}</Text>
                                    <Text style={styles.specificationValue}>{value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Enhanced Reviews Preview */}
                    <View style={styles.reviewsSection}>
                        <TouchableOpacity
                            style={styles.reviewsHeader}
                            onPress={() => setShowReviews(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sectionTitle}>Customer Reviews</Text>
                            <View style={styles.seeAllButton}>
                                <Text style={styles.seeAllText}>See all</Text>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.reviewsOverview}>
                            <View style={styles.reviewsStats}>
                                <Text style={styles.reviewsScore}>{product.rating}</Text>
                                <View>
                                    <View style={styles.reviewsStars}>
                                        {renderStars(product.rating, 16)}
                                    </View>
                                    <Text style={styles.reviewsCount}>Based on {product.reviewCount} reviews</Text>
                                </View>
                            </View>
                        </View>

                        {product.reviews.slice(0, 2).map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewUserInfo}>
                                        <View style={styles.reviewAvatar}>
                                            <Text style={styles.reviewAvatarText}>
                                                {review.userName.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.reviewUserName}>
                                                {review.userName}
                                            </Text>
                                            {review.verified && (
                                                <View style={styles.verifiedBadge}>
                                                    <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
                                                    <Text style={styles.verifiedText}>Verified</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.reviewStars}>
                                        {renderStars(review.rating, 14)}
                                    </View>
                                </View>
                                <Text style={styles.reviewTitle}>{review.title}</Text>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                                <View style={styles.reviewFooter}>
                                    <Text style={styles.reviewHelpful}>
                                        {review.helpful} people found this helpful
                                    </Text>
                                    <Text style={styles.reviewDate}>
                                        {review.date.toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Enhanced Related Products */}
                    {relatedProducts.length > 0 && (
                        <View style={styles.relatedSection}>
                            <Text style={styles.sectionTitle}>You might also like</Text>
                            <FlatList
                                data={relatedProducts}
                                renderItem={renderRelatedProduct}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.relatedProductsList}
                                snapToInterval={160}
                                decelerationRate="fast"
                            />
                        </View>
                    )}
                </Animated.View>
            </Animated.ScrollView>

            {/* Enhanced Bottom Actions with floating design */}
            <SafeAreaView style={styles.bottomContainer}>
                <BlurView intensity={95} style={styles.bottomActionsBlur}>
                    <View style={styles.bottomActions}>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.addToCartButton,
                                    !product.inStock && styles.disabledButton
                                ]}
                                onPress={handleAddToCart}
                                disabled={!product.inStock || isAddingToCart}
                                activeOpacity={0.8}
                            >
                                {isAddingToCart ? (
                                    <ActivityIndicator size="small" color={COLORS.gray700} />
                                ) : (
                                    <>
                                        <Ionicons name="bag-add" size={20} color={COLORS.gray700} />
                                        <Text style={styles.addToCartText}>Add to Cart</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.buyNowButton,
                                    !product.inStock && styles.buyNowButtonDisabled
                                ]}
                                onPress={handleBuyNow}
                                disabled={!product.inStock || isAddingToCart}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="flash"
                                    size={20}
                                    color={product.inStock ? COLORS.white : COLORS.gray400}
                                />
                                <Text style={[
                                    styles.buyNowText,
                                    !product.inStock && styles.buyNowTextDisabled
                                ]}>
                                    {product.inStock ? 'Buy Now' : 'Out of Stock'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Enhanced Total Price Display */}
                        <View style={styles.totalPrice}>
                            <Text style={styles.totalLabel}>Total ({quantity} {quantity === 1 ? 'item' : 'items'})</Text>
                            <Text style={styles.totalAmount}>
                                ${(calculateCurrentPrice() * quantity).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </BlurView>
            </SafeAreaView>

            {/* Enhanced Quick Add Success Animation */}
            {showQuickAdd && (
                <Animated.View style={styles.quickAddSuccess}>
                    <BlurView intensity={90} style={styles.quickAddBlur}>
                        <View style={styles.quickAddContent}>
                            <Ionicons name="checkmark-circle" size={32} color={COLORS.primary} />
                            <Text style={styles.quickAddText}>Added to cart!</Text>
                            <TouchableOpacity
                                style={styles.viewCartButton}
                                onPress={() => {
                                    setShowQuickAdd(false);
                                    router.push('/(modals)/cart');
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.viewCartText}>View Cart</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animated.View>
            )}

            {/* Enhanced Image Modal */}
            <Modal
                visible={showImageModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={styles.imageModalContainer}>
                    <StatusBar backgroundColor="#000000" barStyle="light-content" />
                    <SafeAreaView style={styles.imageModalContent}>
                        <TouchableOpacity
                            style={styles.imageModalClose}
                            onPress={() => setShowImageModal(false)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        {productImages.length > 1 ? (
                            <FlatList
                                data={productImages}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                initialScrollIndex={selectedImageIndex}
                                getItemLayout={(_, index) => ({
                                    length: screenWidth,
                                    offset: screenWidth * index,
                                    index,
                                })}
                                onMomentumScrollEnd={(event) => {
                                    const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                                    setSelectedImageIndex(newIndex);
                                }}
                                renderItem={({ item }) => (
                                    <View style={styles.imageModalImageContainer}>
                                        <Image
                                            source={item.url || product.primaryImage}
                                            style={styles.imageModalImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                )}
                                keyExtractor={(item) => item.id || Math.random().toString()}
                            />
                        ) : (
                            <View style={styles.imageModalImageContainer}>
                                <Image
                                    source={product.primaryImage}
                                    style={styles.imageModalImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        {/* Enhanced Image Counter */}
                        {productImages.length > 1 && (
                            <View style={styles.imageCounter}>
                                <BlurView intensity={80} style={styles.imageCounterBadge}>
                                    <Text style={styles.imageCounterText}>
                                        {selectedImageIndex + 1} of {productImages.length}
                                    </Text>
                                </BlurView>
                            </View>
                        )}
                    </SafeAreaView>
                </View>
            </Modal>

            {/* Enhanced Reviews Modal */}
            <Modal
                visible={showReviews}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.reviewsModalContainer}>
                    <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
                    <SafeAreaView style={styles.reviewsModalSafeArea}>
                        <View style={styles.reviewsModalHeader}>
                            <View style={styles.reviewsModalHeaderContent}>
                                <Text style={styles.reviewsModalTitle}>Customer Reviews</Text>
                                <TouchableOpacity
                                    onPress={() => setShowReviews(false)}
                                    style={styles.modalCloseButton}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.gray700} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.ratingSummary}>
                                <Text style={styles.ratingSummaryScore}>
                                    {product.rating}
                                </Text>
                                <View>
                                    <View style={styles.ratingSummaryStars}>
                                        {renderStars(product.rating, 20)}
                                    </View>
                                    <Text style={styles.ratingSummaryText}>
                                        Based on {product.reviewCount} reviews
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <FlatList
                            data={product.reviews}
                            contentContainerStyle={styles.reviewsList}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item: review }) => (
                                <View style={styles.reviewModalCard}>
                                    <View style={styles.reviewModalHeader}>
                                        <View style={styles.reviewModalUserInfo}>
                                            <View style={styles.reviewModalAvatar}>
                                                <Text style={styles.reviewModalAvatarText}>
                                                    {review.userName.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View>
                                                <View style={styles.reviewModalUserDetails}>
                                                    <Text style={styles.reviewModalUserName}>
                                                        {review.userName}
                                                    </Text>
                                                    {review.verified && (
                                                        <View style={styles.reviewModalVerifiedBadge}>
                                                            <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
                                                            <Text style={styles.reviewModalVerifiedText}>
                                                                Verified Purchase
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.reviewModalDate}>
                                                    {review.date.toLocaleDateString()}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.reviewModalStars}>
                                            {renderStars(review.rating, 16)}
                                        </View>
                                    </View>

                                    <Text style={styles.reviewModalTitle}>
                                        {review.title}
                                    </Text>
                                    <Text style={styles.reviewModalComment}>
                                        {review.comment}
                                    </Text>

                                    <View style={styles.reviewModalActions}>
                                        <TouchableOpacity
                                            style={styles.reviewModalHelpful}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="thumbs-up-outline" size={16} color={COLORS.gray500} />
                                            <Text style={styles.reviewModalHelpfulText}>
                                                Helpful ({review.helpful})
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={0.7}>
                                            <Text style={styles.reviewModalReport}>Report</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            keyExtractor={(item) => item.id}
                            ListFooterComponent={() => (
                                <TouchableOpacity
                                    style={styles.writeReviewButton}
                                    onPress={() => {
                                        setShowReviews(false);
                                        router.push(`/product/${product.id}/review`);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="create-outline" size={20} color={COLORS.white} />
                                    <Text style={styles.writeReviewText}>Write a Review</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    // Loading States
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        color: COLORS.gray600,
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },

    // Error States
    errorContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    errorContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.gray900,
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    errorMessage: {
        color: COLORS.gray600,
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 16,
        lineHeight: 24,
    },
    errorButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    errorButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 16,
    },

    // Enhanced Header
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    headerBlur: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 56,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.white,
        marginHorizontal: 16,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: COLORS.red,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },

    // Content
    scrollView: {
        flex: 1,
    },

    // Enhanced Image Section
    imageSection: {
        position: 'relative',
        backgroundColor: COLORS.gray50,
    },
    mainImageContainer: {
        width: '100%',
        height: 400,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    mainImage: {
        width: '90%',
        height: '80%',
    },
    zoomIndicator: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Enhanced Badges
    productBadge: {
        position: 'absolute',
        top: 120,
        left: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    productBadgeText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    discountBadge: {
        position: 'absolute',
        top: 120,
        right: 16,
        backgroundColor: COLORS.red,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        zIndex: 10,
        shadowColor: COLORS.red,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    discountText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    stockBadge: {
        position: 'absolute',
        top: 120,
        right: 16,
        backgroundColor: COLORS.gray800,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        zIndex: 10,
    },
    stockBadgeText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
    },

    // Enhanced Image Indicators
    imageIndicators: {
        position: 'absolute',
        bottom: 20,
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
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 3,
    },
    indicatorInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },

    // Enhanced Thumbnails
    thumbnailsScrollView: {
        paddingVertical: 16,
        backgroundColor: COLORS.white,
    },
    thumbnailsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    thumbnail: {
        borderWidth: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    thumbnailSelected: {
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    thumbnailUnselected: {
        borderColor: COLORS.gray200,
    },
    thumbnailImage: {
        width: 64,
        height: 64,
    },

    // Enhanced Product Info
    productInfo: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: COLORS.white,
    },

    // Enhanced Brand Container
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    brandText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    newBadge: {
        backgroundColor: COLORS.yellow,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    newBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    bestSellerBadge: {
        backgroundColor: COLORS.red,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    bestSellerBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    productName: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.gray900,
        marginBottom: 12,
        lineHeight: 36,
    },
    shortDescription: {
        fontSize: 16,
        color: COLORS.gray600,
        marginBottom: 16,
        lineHeight: 24,
    },

    // Enhanced Rating
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 12,
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        color: COLORS.gray700,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },

    // Enhanced Price
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
    },
    currentPrice: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.primary,
    },
    originalPrice: {
        fontSize: 24,
        color: COLORS.gray400,
        textDecorationLine: 'line-through',
    },
    savingsBadge: {
        backgroundColor: COLORS.red,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    savingsText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // Enhanced Shipping Info
    shippingInfo: {
        backgroundColor: COLORS.gray50,
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    shippingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    shippingText: {
        color: COLORS.gray800,
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    shippingDetails: {
        color: COLORS.gray600,
        fontSize: 14,
        marginBottom: 8,
    },
    freeShippingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    freeShippingText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },

    // Enhanced Seller Info
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        padding: 16,
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
    },
    sellerDetails: {
        flex: 1,
    },
    sellerLabel: {
        color: COLORS.gray500,
        fontSize: 14,
        marginBottom: 4,
    },
    sellerName: {
        color: COLORS.gray900,
        fontWeight: '600',
        fontSize: 16,
    },
    lowStockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.yellow,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    lowStockText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },

    // Enhanced Variants
    variantSection: {
        marginBottom: 28,
    },
    variantTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 16,
    },
    variantOptionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    variantOption: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    variantOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    variantOptionAvailable: {
        borderColor: COLORS.gray200,
        backgroundColor: COLORS.white,
    },
    variantOptionUnavailable: {
        borderColor: COLORS.gray200,
        backgroundColor: COLORS.gray100,
    },
    variantImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginBottom: 8,
    },
    variantText: {
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },
    variantTextSelected: {
        color: COLORS.primary,
    },
    variantTextAvailable: {
        color: COLORS.gray900,
    },
    variantTextUnavailable: {
        color: COLORS.gray400,
    },
    variantPrice: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
    },
    variantPriceSelected: {
        color: COLORS.primary,
    },
    variantPriceAvailable: {
        color: COLORS.gray600,
    },
    variantPriceUnavailable: {
        color: COLORS.gray400,
    },
    outOfStockText: {
        fontSize: 10,
        color: COLORS.red,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
    },

    // Enhanced Quantity
    quantitySection: {
        marginBottom: 28,
    },
    quantityTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 16,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        padding: 4,
        alignSelf: 'flex-start',
    },
    quantityButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    quantityButtonDisabled: {
        backgroundColor: COLORS.gray100,
        shadowOpacity: 0,
        elevation: 0,
    },
    quantityText: {
        marginHorizontal: 24,
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.gray900,
        minWidth: 40,
        textAlign: 'center',
    },

    // Enhanced Features
    featuresSection: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 16,
    },
    featuresGrid: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.gray50,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    featureIcon: {
        width: 24,
        height: 24,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    featureText: {
        color: COLORS.gray700,
        flex: 1,
        lineHeight: 22,
        fontSize: 15,
    },

    // Enhanced Description
    descriptionSection: {
        marginBottom: 28,
    },
    descriptionText: {
        color: COLORS.gray700,
        lineHeight: 26,
        fontSize: 16,
    },

    // Enhanced Specifications
    specificationsSection: {
        marginBottom: 28,
    },
    specificationsContainer: {
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        overflow: 'hidden',
    },
    specificationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    specificationBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    specificationKey: {
        color: COLORS.gray600,
        fontWeight: '500',
        fontSize: 14,
        flex: 1,
    },
    specificationValue: {
        color: COLORS.gray900,
        flex: 1,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '500',
    },

    // Enhanced Reviews
    reviewsSection: {
        marginBottom: 28,
    },
    reviewsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    seeAllText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: 4,
        fontSize: 14,
    },
    reviewsOverview: {
        backgroundColor: COLORS.gray50,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    reviewsStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    reviewsScore: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    reviewsStars: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    reviewsCount: {
        color: COLORS.gray600,
        fontSize: 14,
    },
    reviewCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    reviewUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    reviewAvatarText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
    reviewUserName: {
        fontWeight: '600',
        color: COLORS.gray900,
        marginBottom: 2,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    verifiedText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewTitle: {
        fontWeight: '600',
        color: COLORS.gray900,
        marginBottom: 8,
        fontSize: 16,
    },
    reviewComment: {
        color: COLORS.gray700,
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 22,
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reviewHelpful: {
        color: COLORS.gray500,
        fontSize: 12,
    },
    reviewDate: {
        color: COLORS.gray400,
        fontSize: 12,
    },

    // Enhanced Related Products
    relatedSection: {
        marginBottom: 32,
    },
    relatedProductsList: {
        paddingLeft: 0,
    },
    relatedProductCard: {
        width: 160,
        marginRight: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    relatedProductImage: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: COLORS.gray50,
    },
    relatedProductInfo: {
        flex: 1,
    },
    relatedProductName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray900,
        marginBottom: 8,
        lineHeight: 18,
    },
    relatedProductPricing: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    relatedProductPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    relatedProductOriginalPrice: {
        fontSize: 12,
        color: COLORS.gray400,
        textDecorationLine: 'line-through',
    },
    relatedProductRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    relatedProductRatingText: {
        fontSize: 12,
        color: COLORS.gray500,
    },

    // Enhanced Bottom Actions
    bottomContainer: {
        backgroundColor: 'transparent',
    },
    bottomActionsBlur: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    bottomActions: {
        gap: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.gray200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    addToCartText: {
        color: COLORS.gray700,
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buyNowButtonDisabled: {
        backgroundColor: COLORS.gray300,
        shadowOpacity: 0,
        elevation: 0,
    },
    buyNowText: {
        color: COLORS.white,
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 16,
    },
    buyNowTextDisabled: {
        color: COLORS.gray500,
    },
    disabledButton: {
        backgroundColor: COLORS.gray100,
        borderColor: COLORS.gray200,
        shadowOpacity: 0,
        elevation: 0,
    },
    totalPrice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
    totalLabel: {
        color: COLORS.gray600,
        fontSize: 16,
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.primary,
    },

    // Quick Add Success
    quickAddSuccess: {
        position: 'absolute',
        top: '50%',
        left: 20,
        right: 20,
        zIndex: 2000,
        transform: [{ translateY: -50 }],
    },
    quickAddBlur: {
        borderRadius: 16,
        padding: 20,
    },
    quickAddContent: {
        alignItems: 'center',
        gap: 12,
    },
    quickAddText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    viewCartButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    viewCartText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },

    // Enhanced Image Modal
    imageModalContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    imageModalContent: {
        flex: 1,
    },
    imageModalClose: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageModalImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: screenWidth,
        height: screenHeight,
    },
    imageModalImage: {
        width: screenWidth * 0.9,
        height: screenWidth * 0.9,
    },
    imageCounter: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    imageCounterBadge: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    imageCounterText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },

    // Enhanced Reviews Modal
    reviewsModalContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    reviewsModalSafeArea: {
        flex: 1,
    },
    reviewsModalHeader: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
        backgroundColor: COLORS.white,
    },
    reviewsModalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    reviewsModalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.gray100,
    },
    ratingSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    ratingSummaryScore: {
        fontSize: 48,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    ratingSummaryStars: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    ratingSummaryText: {
        color: COLORS.gray600,
        fontSize: 16,
        fontWeight: '500',
    },
    reviewsList: {
        padding: 20,
        paddingBottom: 100,
    },
    reviewModalCard: {
        backgroundColor: COLORS.gray50,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    reviewModalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    reviewModalUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    reviewModalAvatar: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    reviewModalAvatarText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 18,
    },
    reviewModalUserDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    reviewModalUserName: {
        fontWeight: '600',
        color: COLORS.gray900,
        fontSize: 16,
    },
    reviewModalVerifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    reviewModalVerifiedText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    reviewModalDate: {
        color: COLORS.gray500,
        fontSize: 14,
    },
    reviewModalStars: {
        flexDirection: 'row',
    },
    reviewModalTitle: {
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 12,
        fontSize: 18,
        lineHeight: 24,
    },
    reviewModalComment: {
        color: COLORS.gray700,
        marginBottom: 16,
        lineHeight: 24,
        fontSize: 16,
    },
    reviewModalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
    reviewModalHelpful: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        gap: 6,
    },
    reviewModalHelpfulText: {
        color: COLORS.gray600,
        fontSize: 14,
        fontWeight: '500',
    },
    reviewModalReport: {
        color: COLORS.red,
        fontSize: 14,
        fontWeight: '600',
    },
    writeReviewButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        gap: 8,
    },
    writeReviewText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 18,
    },
});