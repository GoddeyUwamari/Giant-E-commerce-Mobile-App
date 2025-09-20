import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    StatusBar,
    Animated,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// Import from unified system
import { useCartStore } from '../../store/slices/cartSlice';
import {
    ALL_PRODUCTS,
    ALL_CATEGORIES,
    getProductsByCategory,
    Product
} from '../../constants/products/data';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced Walmart colors
const COLORS = {
    primary: '#0071CE',
    primaryDark: '#004C91',
    secondary: '#FFC220',
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
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F8FAFC',
};

// Helper function for badge colors
const getBadgeColor = (badge: string) => {
    switch (badge) {
        case 'Best Seller':
            return '#EF4444';
        case 'New':
            return '#10B981';
        case 'Sale':
        case 'Hot Deal':
            return '#F59E0B';
        case 'Limited Stock':
            return '#8B5CF6';
        case 'Popular':
            return '#3B82F6';
        case 'Trending':
            return '#EC4899';
        case 'Editor\'s Choice':
            return '#6366F1';
        case 'Customer Favorite':
            return '#F97316';
        default:
            return '#6B7280';
    }
};

// Enhanced product retrieval with error handling
const getProductById = (id: string): Product | null => {
    try {
        if (!ALL_PRODUCTS || !Array.isArray(ALL_PRODUCTS)) return null;
        return ALL_PRODUCTS.find(product => product.id === id) || null;
    } catch (error) {
        console.error('Error getting product by ID:', error);
        return null;
    }
};

// Enhanced related products with better filtering
const getRelatedProducts = (productId: string): Product[] => {
    try {
        const currentProduct = getProductById(productId);
        if (!currentProduct) return [];

        // Get products from same category, excluding current product
        const categoryProducts = getProductsByCategory(currentProduct.category) || [];
        const relatedProducts = categoryProducts
            .filter(product =>
                product &&
                product.id !== productId &&
                product.inStock &&
                product.rating >= 3.5
            )
            .sort((a, b) => {
                // Sort by rating and review count
                const aScore = a.rating * Math.log(a.reviewCount + 1);
                const bScore = b.rating * Math.log(b.reviewCount + 1);
                return bScore - aScore;
            })
            .slice(0, 10);

        return relatedProducts;
    } catch (error) {
        console.error('Error getting related products:', error);
        return [];
    }
};

// Enhanced image source handler
const getImageSource = (product: Product) => {
    if (product.primaryImage?.uri) {
        return { uri: product.primaryImage.uri };
    }
    if (product.image) {
        return { uri: product.image };
    }
    // Fallback placeholder
    return { uri: `https://via.placeholder.com/400x400/E5E7EB/9CA3AF?text=${encodeURIComponent(product.name.substring(0, 10))}` };
};

// Enhanced mock review generator
const generateMockReviews = (product: Product) => {
    const reviews = [];
    const reviewCount = Math.min(product.reviewCount, 5);

    const sampleReviews = [
        { title: "Excellent quality!", comment: "This product exceeded my expectations. Great build quality and fast shipping from Walmart." },
        { title: "Great value for money", comment: "Perfect for what I needed. Works exactly as described and arrived quickly." },
        { title: "Highly recommend", comment: "Very satisfied with this purchase. Would definitely buy again and recommend to others." },
        { title: "Good product", comment: "Well made and durable. Great for everyday use. Customer service was helpful too." },
        { title: "Perfect choice", comment: "Exactly what I was looking for. Quality is impressive for the price point." },
        { title: "Love it!", comment: "This has made my life so much easier. Great design and functionality." },
        { title: "Worth every penny", comment: "Initially hesitant about the price, but it's worth every dollar. Quality is outstanding." }
    ];

    for (let i = 0; i < reviewCount; i++) {
        const baseReview = sampleReviews[i % sampleReviews.length];
        const variance = (Math.random() - 0.5) * 0.8; // ±0.4 rating variance
        const adjustedRating = Math.max(1, Math.min(5, Math.round(product.rating + variance)));

        reviews.push({
            id: `review-${product.id}-${i + 1}`,
            userName: `Customer ${String.fromCharCode(65 + (i % 26))}`,
            rating: adjustedRating,
            title: baseReview.title,
            comment: baseReview.comment,
            date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            helpful: Math.floor(Math.random() * 25) + 1,
            verified: Math.random() > 0.25 // 75% verified
        });
    }

    return reviews.sort((a, b) => b.helpful - a.helpful);
};

export default function ProductDetailsPage(): JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
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

    // Memoized data to prevent unnecessary recalculations
    const relatedProducts = useMemo(() => {
        return id ? getRelatedProducts(id) : [];
    }, [id]);

    const mockReviews = useMemo(() => {
        return product ? generateMockReviews(product) : [];
    }, [product]);

    const productStats = useMemo(() => {
        if (!product) return null;

        const savings = product.originalPrice && product.originalPrice > product.price
            ? product.originalPrice - product.price
            : 0;
        const savingsPercent = savings && product.originalPrice
            ? Math.round((savings / product.originalPrice) * 100)
            : 0;

        return { savings, savingsPercent };
    }, [product]);

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
        if (id) {
            loadProduct();
            checkIfFavorite();
        }
    }, [id]);

    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    const loadProduct = async () => {
        try {
            setIsLoading(true);

            const productData = getProductById(id);

            if (!productData) {
                Alert.alert(
                    'Product Not Found',
                    'The product you\'re looking for doesn\'t exist or has been removed.',
                    [
                        { text: 'Browse Products', onPress: () => router.replace('/product') },
                        { text: 'Go Back', onPress: () => router.back() }
                    ]
                );
                return;
            }

            setProduct(productData);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product details. Please try again.');
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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const handleAddToCart = useCallback(async () => {
        if (!product) return;

        setIsAddingToCart(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const cartItem = {
                productId: product.id,
                name: product.name,
                brand: product.brand || '',
                price: product.price,
                originalPrice: product.originalPrice,
                quantity: quantity,
                maxQuantity: product.maxQuantity || 99,
                minQuantity: product.minQuantity || 1,
                image: getImageSource(product).uri,
                category: product.category,
                sku: product.sku || product.id,
                status: product.status || (product.inStock ? 'available' : 'out_of_stock'),
                storeId: product.storeId || 'walmart-main',
                storeName: product.storeName || 'Walmart Supercenter',
                delivery: product.delivery || {
                    option: 'pickup' as const,
                    freeShippingEligible: product.freeShipping || false,
                },
            };

            const success = await addItem(cartItem);

            if (success) {
                setShowQuickAdd(true);
                setTimeout(() => setShowQuickAdd(false), 3000);

                Alert.alert(
                    'Added to Cart',
                    `${product.name} has been added to your cart.`,
                    [
                        { text: 'Continue Shopping', style: 'cancel' },
                        { text: 'View Cart', onPress: () => router.push('/(modals)/cart') }
                    ]
                );
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    }, [product, quantity, addItem]);

    const handleBuyNow = useCallback(async () => {
        await handleAddToCart();
        setTimeout(() => {
            router.push('/(modals)/cart');
        }, 500);
    }, [handleAddToCart]);

    const handleShare = async () => {
        if (!product) return;

        try {
            await Share.share({
                message: `Check out this ${product.name} for $${product.price.toFixed(2)} on Walmart!\n\n${product.name}\nRating: ${product.rating}/5 (${product.reviewCount} reviews)`,
                title: product.name,
            });
        } catch (error) {
            console.error('Error sharing product:', error);
        }
    };

    const handleRelatedProductPress = useCallback((productId: string) => {
        try {
            router.push(`/product/${productId}`);
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate to product');
        }
    }, []);

    const renderStars = useCallback((rating: number, size: number = 16) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
                    size={size}
                    color={COLORS.warning}
                />
            );
        }
        return stars;
    }, []);

    const renderRelatedProduct = useCallback(({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.relatedProductCard}
            onPress={() => handleRelatedProductPress(item.id)}
            activeOpacity={0.9}
        >
            <Image
                source={getImageSource(item)}
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
                {item.freeShipping && (
                    <View style={styles.freeShippingBadge}>
                        <Text style={styles.freeShippingText}>Free Shipping</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    ), [renderStars, handleRelatedProductPress]);

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
                    <Ionicons name="alert-circle" size={64} color={COLORS.error} />
                    <Text style={styles.errorTitle}>Product Not Found</Text>
                    <Text style={styles.errorMessage}>
                        The product you're looking for doesn't exist or has been removed.
                    </Text>
                    <View style={styles.errorActions}>
                        <TouchableOpacity
                            style={styles.errorButton}
                            onPress={() => router.push('/product')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.errorButtonText}>Browse Products</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.errorButton, styles.errorButtonSecondary]}
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.errorButtonText, styles.errorButtonTextSecondary]}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {/* Enhanced Header with dynamic opacity */}
            <SafeAreaView style={[styles.headerContainer, { backgroundColor: `rgba(0, 113, 206, ${headerOpacity})` }]}>
                <BlurView intensity={headerOpacity * 100} style={styles.headerBlur}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]} numberOfLines={1}>
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
                                        color={isFavorite ? COLORS.error : COLORS.white}
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
                {/* Product Image */}
                <View style={styles.imageSection}>
                    <View style={styles.mainImageContainer}>
                        <Image
                            source={getImageSource(product)}
                            style={styles.mainImage}
                            resizeMode="contain"
                        />

                        {/* Enhanced badges */}
                        {productStats?.savings > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{productStats.savingsPercent}% OFF</Text>
                            </View>
                        )}

                        {!product.inStock && (
                            <View style={styles.outOfStockBadge}>
                                <Text style={styles.outOfStockText}>Out of Stock</Text>
                            </View>
                        )}

                        {product.featured && (
                            <View style={styles.featuredBadge}>
                                <Text style={styles.featuredText}>FEATURED</Text>
                            </View>
                        )}

                        {product.badge && (
                            <View style={[styles.productBadge, { backgroundColor: getBadgeColor(product.badge) }]}>
                                <Text style={styles.productBadgeText}>{product.badge}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Enhanced Product Info */}
                <Animated.View style={[styles.productInfo, { opacity: fadeAnim }]}>
                    {/* Brand & Category */}
                    <View style={styles.brandContainer}>
                        <Text style={styles.brandText}>{product.brand || 'Walmart'}</Text>
                        <Text style={styles.categoryText}>{product.category.replace('-', ' ')}</Text>
                    </View>

                    {/* Product Name */}
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Rating & Reviews */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                            {renderStars(product.rating)}
                        </View>
                        <Text style={styles.ratingText}>
                            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()} reviews)
                        </Text>
                    </View>

                    {/* Enhanced Price with savings */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>
                            ${product.price.toFixed(2)}
                        </Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <>
                                <Text style={styles.originalPrice}>
                                    ${product.originalPrice.toFixed(2)}
                                </Text>
                                <View style={styles.savingsBadge}>
                                    <Text style={styles.savingsText}>
                                        Save ${productStats?.savings.toFixed(2)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Enhanced Shipping Info */}
                    <View style={styles.shippingInfo}>
                        <View style={styles.shippingHeader}>
                            <Ionicons
                                name={product.freeShipping ? "checkmark-circle" : "car-outline"}
                                size={20}
                                color={product.freeShipping ? COLORS.success : COLORS.primary}
                            />
                            <Text style={styles.shippingText}>
                                {product.freeShipping ? 'Free shipping' : 'Standard shipping available'}
                            </Text>
                        </View>
                        {product.freeShipping && (
                            <Text style={styles.shippingDetails}>
                                Estimated delivery: 2-3 business days
                            </Text>
                        )}
                        <Text style={styles.shippingNote}>
                            Sold by {product.seller || 'Walmart'}
                        </Text>
                    </View>

                    {/* Enhanced Quantity Selector */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityTitle}>Quantity</Text>
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity
                                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.gray400 : COLORS.gray700} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.quantityButton, quantity >= 99 && styles.quantityButtonDisabled]}
                                onPress={() => setQuantity(Math.min(99, quantity + 1))}
                                disabled={quantity >= 99}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add" size={20} color={quantity >= 99 ? COLORS.gray400 : COLORS.gray700} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.quantityNote}>
                            {product.maxQuantity && quantity >= product.maxQuantity
                                ? `Maximum ${product.maxQuantity} per customer`
                                : 'Choose your quantity'
                            }
                        </Text>
                    </View>

                    {/* Enhanced Key Features */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Key Features</Text>
                        <View style={styles.featuresGrid}>
                            <View style={styles.featureItem}>
                                <Ionicons name="star" size={16} color={COLORS.primary} />
                                <Text style={styles.featureText}>High Quality Product</Text>
                            </View>
                            {product.freeShipping && (
                                <View style={styles.featureItem}>
                                    <Ionicons name="car" size={16} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Free Shipping</Text>
                                </View>
                            )}
                            {product.rating >= 4.0 && (
                                <View style={styles.featureItem}>
                                    <Ionicons name="thumbs-up" size={16} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Highly Rated</Text>
                                </View>
                            )}
                            <View style={styles.featureItem}>
                                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                                <Text style={styles.featureText}>Quality Guaranteed</Text>
                            </View>
                            {product.inStock && (
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                                    <Text style={styles.featureText}>In Stock</Text>
                                </View>
                            )}
                            <View style={styles.featureItem}>
                                <Ionicons name="storefront" size={16} color={COLORS.primary} />
                                <Text style={styles.featureText}>Walmart Guarantee</Text>
                            </View>
                        </View>
                    </View>

                    {/* Enhanced Reviews Preview */}
                    <View style={styles.reviewsSection}>
                        <View style={styles.reviewsHeader}>
                            <Text style={styles.sectionTitle}>Customer Reviews</Text>
                            <View style={styles.reviewsOverview}>
                                <Text style={styles.reviewsScore}>{product.rating.toFixed(1)}</Text>
                                <View>
                                    <View style={styles.reviewsStars}>
                                        {renderStars(product.rating, 16)}
                                    </View>
                                    <Text style={styles.reviewsCount}>
                                        Based on {product.reviewCount.toLocaleString()} reviews
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Sample Reviews */}
                        {mockReviews.slice(0, 3).map((review) => (
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
                                                    <Text style={styles.verifiedText}>Verified Purchase</Text>
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
                                snapToInterval={180}
                                decelerationRate="fast"
                            />
                        </View>
                    )}
                </Animated.View>
            </Animated.ScrollView>

            {/* Enhanced Bottom Actions */}
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
                            <Text style={styles.totalLabel}>
                                Total ({quantity} {quantity === 1 ? 'item' : 'items'})
                            </Text>
                            <Text style={styles.totalAmount}>
                                ${(product.price * quantity).toFixed(2)}
                            </Text>
                            {productStats?.savings > 0 && (
                                <Text style={styles.totalSavings}>
                                    You save ${(productStats.savings * quantity).toFixed(2)}
                                </Text>
                            )}
                        </View>
                    </View>
                </BlurView>
            </SafeAreaView>

            {/* Enhanced Quick Add Success Animation */}
            {showQuickAdd && (
                <Animated.View style={styles.quickAddSuccess}>
                    <BlurView intensity={90} style={styles.quickAddBlur}>
                        <View style={styles.quickAddContent}>
                            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                            <Text style={styles.quickAddText}>Added to cart!</Text>
                            <Text style={styles.quickAddSubtext}>
                                {quantity} {quantity === 1 ? 'item' : 'items'} • ${(product.price * quantity).toFixed(2)}
                            </Text>
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
    errorActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
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
    errorButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    errorButtonTextSecondary: {
        color: COLORS.primary,
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
        backgroundColor: COLORS.error,
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

    // Image Section
    imageSection: {
        backgroundColor: COLORS.gray50,
    },
    mainImageContainer: {
        width: '100%',
        height: 400,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        position: 'relative',
    },
    mainImage: {
        width: '90%',
        height: '80%',
    },

    // Badges
    discountBadge: {
        position: 'absolute',
        top: 120,
        right: 16,
        backgroundColor: COLORS.error,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        zIndex: 10,
    },
    discountText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 120,
        right: 16,
        backgroundColor: COLORS.gray800,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        zIndex: 10,
    },
    outOfStockText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
    },
    featuredBadge: {
        position: 'absolute',
        top: 120,
        left: 16,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        zIndex: 10,
    },
    featuredText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
    },
    productBadge: {
        position: 'absolute',
        top: 160,
        left: 16,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
    },
    productBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },

    // Product Info
    productInfo: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: COLORS.white,
    },

    // Brand Container
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    brandText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryText: {
        color: COLORS.gray500,
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
    },

    productName: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.gray900,
        marginBottom: 16,
        lineHeight: 36,
    },

    // Rating
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

    // Price
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
        color: COLORS.success,
    },
    originalPrice: {
        fontSize: 24,
        color: COLORS.gray400,
        textDecorationLine: 'line-through',
    },
    savingsBadge: {
        backgroundColor: COLORS.error,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    savingsText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // Shipping Info
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
    },
    shippingNote: {
        color: COLORS.gray500,
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },

    // Quantity
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
    quantityNote: {
        color: COLORS.gray500,
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },

    // Features
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
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        gap: 12,
    },
    featureText: {
        color: COLORS.gray700,
        fontSize: 15,
        fontWeight: '500',
    },

    // Reviews
    reviewsSection: {
        marginBottom: 28,
    },
    reviewsHeader: {
        marginBottom: 16,
    },
    reviewsOverview: {
        backgroundColor: COLORS.gray50,
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
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

    // Related Products
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
    freeShippingBadge: {
        backgroundColor: COLORS.success,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    freeShippingText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '600',
    },

    // Bottom Actions
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
        gap: 8,
    },
    addToCartText: {
        color: COLORS.gray700,
        fontWeight: '600',
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
        gap: 8,
    },
    buyNowButtonDisabled: {
        backgroundColor: COLORS.gray300,
        shadowOpacity: 0,
        elevation: 0,
    },
    buyNowText: {
        color: COLORS.white,
        fontWeight: '700',
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
    totalSavings: {
        color: COLORS.success,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
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
    quickAddSubtext: {
        color: COLORS.gray600,
        fontSize: 14,
        marginBottom: 8,
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
});