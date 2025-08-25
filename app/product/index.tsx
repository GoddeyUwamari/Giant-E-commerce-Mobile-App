import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import unified system - FIXED IMPORTS
import { useCartStore } from '../../store/slices/cartSlice';
import {
    ALL_PRODUCTS,
    getProductsByCategory,
    getAllSaleProducts,
    getAllFeaturedProducts,
    CATEGORIES,
    Product
} from '../../constants/products';

// FIXED: Create proper sorting function
const sortProducts = (products: Product[], sortBy: string): Product[] => {
    const sorted = [...products];

    switch (sortBy) {
        case 'featured':
            return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'newest':
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        default:
            return sorted;
    }
};

// FIXED: Create search function
const searchProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return ALL_PRODUCTS;

    return ALL_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
    );
};

// FIXED: Get trending products (products with high ratings and recent)
const getTrendingProducts = (): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.rating >= 4.0 && product.featured
    ).slice(0, 20);
};

// FIXED: Get new arrivals (most recent products)
const getNewArrivals = (): Product[] => {
    return ALL_PRODUCTS
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);
};

// FIXED: Get available categories from your unified system
const getAvailableCategories = () => {
    const categoryKeys = Object.keys(CATEGORIES);
    const categoryDisplayNames = categoryKeys.map(key =>
        CATEGORIES[key as keyof typeof CATEGORIES].name
    );

    return [
        'All',
        ...categoryDisplayNames,
        'Sale Items',
        'Trending',
        'New Arrivals'
    ];
};

const categories = getAvailableCategories();

export default function ProductsScreen(): JSX.Element {
    const {
        id,
        filter,
        category: categoryParam,
        search
    } = useLocalSearchParams<{
        id?: string;
        filter?: string;
        category?: string;
        search?: string;
    }>();

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState(ALL_PRODUCTS);
    const [sortOrder, setSortOrder] = useState('featured');

    // Use Zustand store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    // FIXED: Set initial category based on URL params
    useEffect(() => {
        if (categoryParam) {
            // Find matching category by slug or name
            const matchingCategory = Object.entries(CATEGORIES).find(([slug, category]) =>
                slug === categoryParam || category.name.toLowerCase().replace(/\s+/g, '-') === categoryParam
            );

            if (matchingCategory) {
                setSelectedCategory(matchingCategory[1].name);
            }
        } else if (filter) {
            // Handle special filters
            switch (filter) {
                case 'flash-deals':
                case 'summer-deals':
                case 'sale':
                    setSelectedCategory('Sale Items');
                    break;
                case 'trending':
                    setSelectedCategory('Trending');
                    break;
                case 'new-arrivals':
                    setSelectedCategory('New Arrivals');
                    break;
                default:
                    setSelectedCategory('All');
            }
        }
    }, [categoryParam, filter]);

    // FIXED: Filter products based on selected category, search, and filters
    useEffect(() => {
        let products: Product[] = [...ALL_PRODUCTS];

        // Apply search filter first if exists
        if (search && search.trim()) {
            products = searchProducts(search.trim());
        }

        // Apply category filter
        if (selectedCategory === 'All') {
            // Keep all products (or search results)
        } else if (selectedCategory === 'Sale Items') {
            const saleProducts = getAllSaleProducts();
            products = products.filter(p => saleProducts.some(sp => sp.id === p.id));
        } else if (selectedCategory === 'Trending') {
            const trendingProducts = getTrendingProducts();
            products = products.filter(p => trendingProducts.some(tp => tp.id === p.id));
        } else if (selectedCategory === 'New Arrivals') {
            const newProducts = getNewArrivals();
            products = products.filter(p => newProducts.some(np => np.id === p.id));
        } else {
            // Find category by display name and get its products
            const categoryEntry = Object.entries(CATEGORIES).find(([key, category]) =>
                category.name === selectedCategory
            );

            if (categoryEntry) {
                const [categoryKey] = categoryEntry;
                products = getProductsByCategory(categoryKey as keyof typeof CATEGORIES);
            }
        }

        // Apply sorting
        products = sortProducts(products, sortOrder);

        setFilteredProducts(products);
    }, [selectedCategory, search, sortOrder]);

    // Calculate summary when cart changes
    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    const handleAddToCart = async (product: Product) => {
        const success = await addItem({
            productId: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            quantity: 1,
            maxQuantity: product.maxQuantity,
            minQuantity: product.minQuantity,
            image: product.primaryImage,
            category: product.category,
            sku: product.sku,
            status: product.status,
            storeId: product.storeId,
            storeName: product.storeName,
            delivery: product.delivery,
        });

        if (success) {
            Alert.alert(
                'Added to Cart',
                `${product.name} has been added to your cart.`,
                [
                    { text: 'Continue Shopping', style: 'cancel' },
                    { text: 'View Cart', onPress: () => router.push('/(modals)/cart') }
                ]
            );
        }
    };

    const updateQuantity = async (productId: string, change: number) => {
        const existingItem = cartItems.find(item => item.productId === productId);

        if (!existingItem) return;

        const newQuantity = existingItem.quantity + change;

        if (newQuantity <= 0) {
            await removeItem(existingItem.id);
        } else {
            await updateItemQuantity(existingItem.id, newQuantity);
        }
    };

    const getQuantityInCart = (productId: string): number => {
        const item = cartItems.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    };

    const renderCategoryTab = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.categoryTab,
                selectedCategory === item && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory(item)}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.categoryTabText,
                selectedCategory === item && styles.categoryTabTextActive
            ]}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    const renderProduct = ({ item }: { item: Product }) => {
        const quantityInCart = getQuantityInCart(item.id);

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.9}
            >
                {item.badge && (
                    <View style={[styles.productBadge, { backgroundColor: item.badgeColor || '#EF4444' }]}>
                        <Text style={styles.productBadgeText}>{item.badge}</Text>
                    </View>
                )}

                {!item.inStock && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}

                <Image
                    source={item.primaryImage}
                    style={[styles.productImage, !item.inStock && styles.productImageFaded]}
                    resizeMode="cover"
                />

                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    <View style={styles.productRating}>
                        <View style={styles.starsContainer}>
                            {[...Array(5)].map((_, i) => (
                                <Ionicons
                                    key={i}
                                    name="star"
                                    size={12}
                                    color={i < Math.floor(item.rating) ? "#FFC107" : "#E0E0E0"}
                                />
                            ))}
                        </View>
                        <Text style={styles.productRatingText}>
                            {item.rating} ({item.reviewCount})
                        </Text>
                    </View>

                    <View style={styles.productPricing}>
                        <Text style={styles.productPrice}>
                            ${item.price.toFixed(2)}
                        </Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.productOriginalPrice}>
                                ${item.originalPrice.toFixed(2)}
                            </Text>
                        )}
                    </View>

                    {/* Add to Cart / Quantity Controls */}
                    {item.inStock ? (
                        quantityInCart === 0 ? (
                            <TouchableOpacity
                                style={styles.addToCartButton}
                                onPress={() => handleAddToCart(item)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, -1)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="remove" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantityInCart}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, 1)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View style={styles.outOfStockButton}>
                            <Text style={styles.outOfStockButtonText}>Out of Stock</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const getHeaderTitle = () => {
        if (search) return `Search: "${search}"`;
        if (selectedCategory === 'All') return 'All Products';
        return selectedCategory;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0071CE" />

            {/* Header */}
            <LinearGradient
                colors={['#0071CE', '#004C91']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>

                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => router.push('/(modals)/cart')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
                    {summary.itemCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>
                                {summary.itemCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </LinearGradient>

            {/* Filter Bar */}
            <View style={styles.filterBar}>
                {/* Category Tabs */}
                <View style={styles.categoryTabs}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryTab}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryTabsContent}
                    />
                </View>

                {/* Sort Options */}
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => {
                        // Cycle through sort options
                        const sortOptions = ['featured', 'price-low', 'price-high', 'rating', 'newest'];
                        const currentIndex = sortOptions.indexOf(sortOrder);
                        const nextIndex = (currentIndex + 1) % sortOptions.length;
                        setSortOrder(sortOptions[nextIndex]);
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="swap-vertical" size={16} color="#0071CE" />
                    <Text style={styles.sortButtonText}>
                        {sortOrder === 'price-low' ? 'Price: Low to High' :
                            sortOrder === 'price-high' ? 'Price: High to Low' :
                                sortOrder === 'rating' ? 'Rating' :
                                    sortOrder === 'newest' ? 'Newest' : 'Featured'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Results Count */}
            <View style={styles.resultsBar}>
                <Text style={styles.resultsText}>
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
                </Text>
            </View>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.productsContainer}
                    columnWrapperStyle={styles.productRow}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyStateTitle}>No products found</Text>
                    <Text style={styles.emptyStateText}>
                        Try adjusting your filters or search terms
                    </Text>
                    <TouchableOpacity
                        style={styles.clearFiltersButton}
                        onPress={() => {
                            setSelectedCategory('All');
                            setSortOrder('featured');
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearFiltersText}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 8,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    cartButton: {
        padding: 8,
        borderRadius: 20,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#EF4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },

    // Filter Bar
    filterBar: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    categoryTabs: {
        paddingVertical: 12,
    },
    categoryTabsContent: {
        paddingHorizontal: 16,
    },
    categoryTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    categoryTabActive: {
        backgroundColor: '#0071CE',
    },
    categoryTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    categoryTabTextActive: {
        color: '#FFFFFF',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    sortButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0071CE',
        marginLeft: 8,
    },

    // Results Bar
    resultsBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    resultsText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Products
    productsContainer: {
        padding: 16,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
    },
    productBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
    },
    productBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
    },
    outOfStockText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
    },
    productImageFaded: {
        opacity: 0.5,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        lineHeight: 18,
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 4,
    },
    productRatingText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    productPricing: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10B981',
    },
    productOriginalPrice: {
        fontSize: 12,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginLeft: 6,
    },

    // Add to Cart
    addToCartButton: {
        backgroundColor: '#0071CE',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
        marginLeft: 4,
    },

    // Quantity Controls
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0071CE',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    quantityButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        padding: 4,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        minWidth: 20,
        textAlign: 'center',
    },

    // Out of Stock
    outOfStockButton: {
        backgroundColor: '#9CA3AF',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },

    // Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    clearFiltersButton: {
        backgroundColor: '#0071CE',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    clearFiltersText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});