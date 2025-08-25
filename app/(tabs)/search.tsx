import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    Image,
    FlatList,
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import unified system
import { useCartStore } from '../../store/slices/cartSlice';
import { useAI } from '../../hooks/useAI';
import {
    ALL_PRODUCTS,
    getAllSaleProducts,
    getAllFeaturedProducts,
    getProductsByCategory,
    CATEGORIES,
    Product
} from '../../constants/products';
import { getProductImageBySize } from '../../assets/images/imageLoader';

const { width: screenWidth } = Dimensions.get('window');

// Walmart brand colors
const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    walmartYellow: '#FFC220',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    borderColor: '#E0E0E0',
    lightBlue: '#E3F2FD',
    recentSearchGray: '#F8F8F8',
    aiGreen: '#10B981',
    aiPurple: '#8B5CF6',
};

// Enhanced search function with AI suggestions
const searchProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return ALL_PRODUCTS.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const brandMatch = product.brand?.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
        const featuresMatch = product.features?.some(feature =>
            feature.toLowerCase().includes(searchTerm)
        );

        return nameMatch || brandMatch || categoryMatch || descriptionMatch || featuresMatch;
    });
};

// Basic search suggestions (fallback when AI is unavailable)
const getBasicSearchSuggestions = (query: string): string[] => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const suggestions = new Set<string>();

    // Get matching product names and brands
    ALL_PRODUCTS.forEach(product => {
        if (product.name.toLowerCase().includes(searchTerm)) {
            suggestions.add(product.name);
        }
        if (product.brand?.toLowerCase().includes(searchTerm)) {
            suggestions.add(product.brand);
        }
    });

    // Get matching categories
    Object.values(CATEGORIES).forEach(category => {
        if (category.name.toLowerCase().includes(searchTerm)) {
            suggestions.add(category.name);
        }
    });

    return Array.from(suggestions).slice(0, 6);
};

export default function SearchScreen(): JSX.Element {
    const { search: initialSearch } = useLocalSearchParams<{ search?: string }>();

    const [searchQuery, setSearchQuery] = useState(initialSearch || '');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const searchInputRef = useRef<TextInput>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // AI Hook
    const { getSearchSuggestions: getAISuggestions, loading: aiLoading } = useAI();

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    // Enhanced trending searches with AI insights
    const trendingSearches = useMemo(() => {
        const featuredProducts = getAllFeaturedProducts();
        const saleProducts = getAllSaleProducts();
        const trendingTerms = new Set<string>();

        // Extract popular brands from featured products
        featuredProducts.slice(0, 5).forEach(product => {
            if (product.brand) {
                trendingTerms.add(product.brand);
            }
        });

        // Add category-based trending terms
        Object.values(CATEGORIES).forEach(category => {
            if (category.products.length > 5) {
                trendingTerms.add(category.name);
            }
        });

        // Add AI-powered trending terms
        ['iPhone', 'Samsung', 'Wireless Headphones', 'Smart TV', 'Air Fryer', 'Gaming', 'Fitness Tracker', 'Coffee Maker'].forEach(term => {
            const hasProducts = ALL_PRODUCTS.some(product =>
                product.name.toLowerCase().includes(term.toLowerCase())
            );
            if (hasProducts) {
                trendingTerms.add(term);
            }
        });

        return Array.from(trendingTerms).slice(0, 8);
    }, []);

    // Popular categories from your system
    const popularCategories = useMemo(() => {
        return Object.entries(CATEGORIES)
            .map(([key, category]) => ({
                id: key,
                name: category.name,
                icon: category.icon,
                color: category.color,
                productCount: category.products.length
            }))
            .sort((a, b) => b.productCount - a.productCount)
            .slice(0, 6);
    }, []);

    useEffect(() => {
        loadRecentSearches();
        calculateSummary();

        // Entrance animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // If initial search provided, perform search
        if (initialSearch) {
            performSearch(initialSearch);
        } else {
            // Auto-focus search input only if no initial search
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, []);

    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    // Enhanced search suggestions with AI
    useEffect(() => {
        if (searchQuery.length > 1) {
            handleSearchSuggestions(searchQuery);
        } else {
            setSearchSuggestions([]);
            setAiSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    const handleSearchSuggestions = async (query: string) => {
        setSuggestionsLoading(true);

        try {
            // Always get basic suggestions as fallback
            const basicSuggestions = getBasicSearchSuggestions(query);
            setSearchSuggestions(basicSuggestions);

            // Try to get AI-enhanced suggestions
            if (aiEnabled) {
                try {
                    const categories = Object.values(CATEGORIES).map(cat => cat.name);
                    const aiResults = await getAISuggestions(query, categories);

                    if (aiResults && aiResults.length > 0) {
                        setAiSuggestions(aiResults);
                        setShowSuggestions(true);
                    } else {
                        // Use basic suggestions if AI fails
                        setShowSuggestions(basicSuggestions.length > 0);
                    }
                } catch (aiError) {
                    console.warn('AI suggestions failed, using basic suggestions:', aiError);
                    setAiSuggestions([]);
                    setShowSuggestions(basicSuggestions.length > 0);
                }
            } else {
                setShowSuggestions(basicSuggestions.length > 0);
            }
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            setShowSuggestions(false);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const loadRecentSearches = async () => {
        try {
            const recent = await AsyncStorage.getItem('recent_searches');
            if (recent) {
                setRecentSearches(JSON.parse(recent));
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const saveRecentSearch = async (query: string) => {
        try {
            const recent = await AsyncStorage.getItem('recent_searches');
            let searches = recent ? JSON.parse(recent) : [];

            // Remove if exists and add to front
            searches = searches.filter((s: string) => s !== query);
            searches.unshift(query);

            // Keep only last 15 searches
            searches = searches.slice(0, 15);

            await AsyncStorage.setItem('recent_searches', JSON.stringify(searches));
            setRecentSearches(searches);
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const clearRecentSearches = async () => {
        Alert.alert(
            'Clear Search History',
            'Are you sure you want to clear all recent searches?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('recent_searches');
                            setRecentSearches([]);
                        } catch (error) {
                            console.error('Error clearing recent searches:', error);
                        }
                    }
                }
            ]
        );
    };

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsLoading(true);
        setIsSearching(true);
        setShowSuggestions(false);

        try {
            // Simulate search delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));

            // Perform actual search
            const results = searchProducts(query.trim());
            setSearchResults(results);

            // Save to recent searches
            await saveRecentSearch(query.trim());

            console.log(`Found ${results.length} products for: "${query}"`);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to perform search');
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        performSearch(query);
    };

    const handleSuggestionPress = useCallback((suggestion: string | any) => {
        const searchTerm = typeof suggestion === 'string' ? suggestion : suggestion.text;
        setSearchQuery(searchTerm);
        performSearch(searchTerm);
    }, []);

    const handleRecentSearchPress = useCallback((searchTerm: string) => {
        setSearchQuery(searchTerm);
        performSearch(searchTerm);
    }, []);

    const handleTrendingSearchPress = useCallback((searchTerm: string) => {
        setSearchQuery(searchTerm);
        performSearch(searchTerm);
    }, []);

    const handleCategoryPress = useCallback((categoryKey: string) => {
        router.push(`/category/${categoryKey}`);
    }, []);

    const handleProductPress = useCallback((productId: string) => {
        router.push(`/product/${productId}`);
    }, []);

    const handleAddToCart = useCallback(async (product: Product) => {
        try {
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
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart');
        }
    }, [addItem]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        setShowSuggestions(false);
        setAiSuggestions([]);
        searchInputRef.current?.focus();
    };

    const toggleAI = () => {
        setAiEnabled(!aiEnabled);
        if (!aiEnabled) {
            // Re-fetch suggestions with AI when enabling
            if (searchQuery.length > 1) {
                handleSearchSuggestions(searchQuery);
            }
        }
    };

    const renderSearchResult = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleProductPress(item.id)}
            activeOpacity={0.9}
        >
            <Image
                source={getProductImageBySize(item.id, 'medium')}
                style={styles.productImage}
                resizeMode="cover"
            />

            {item.badge && (
                <View style={[styles.productBadge, { backgroundColor: item.badgeColor || COLORS.error }]}>
                    <Text style={styles.productBadgeText}>{item.badge}</Text>
                </View>
            )}

            <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{item.brand}</Text>
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
                    <Text style={styles.ratingText}>
                        {item.rating} ({item.reviewCount})
                    </Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <Text style={styles.originalPrice}>
                            ${item.originalPrice.toFixed(2)}
                        </Text>
                    )}
                </View>

                <Text style={styles.shippingInfo}>
                    {item.shipping?.free ? 'FREE shipping' : `Shipping: $${item.shipping?.cost || 0}`}
                </Text>

                {item.inStock ? (
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color={COLORS.white} />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.outOfStockButton}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderSearchSuggestion = ({ item, index }: { item: string | any, index: number }) => {
        const isAISuggestion = typeof item === 'object';
        const suggestionText = isAISuggestion ? item.text : item;
        const suggestionType = isAISuggestion ? item.type : 'basic';
        const popularity = isAISuggestion ? item.popularity : 0;

        return (
            <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.suggestionLeft}>
                    <Ionicons
                        name={
                            suggestionType === 'product' ? 'cube-outline' :
                                suggestionType === 'category' ? 'grid-outline' :
                                    suggestionType === 'brand' ? 'business-outline' :
                                        'search'
                        }
                        size={16}
                        color={isAISuggestion ? COLORS.aiPurple : COLORS.mediumGray}
                    />
                    <Text style={[
                        styles.suggestionText,
                        isAISuggestion && styles.aiSuggestionText
                    ]}>
                        {suggestionText}
                    </Text>
                </View>

                <View style={styles.suggestionRight}>
                    {isAISuggestion && (
                        <View style={styles.aiSuggestionBadge}>
                            <Ionicons name="sparkles" size={12} color={COLORS.aiGreen} />
                            <Text style={styles.aiSuggestionBadgeText}>AI</Text>
                        </View>
                    )}
                    {popularity && popularity > 80 && (
                        <View style={styles.hotBadge}>
                            <Text style={styles.hotBadgeText}>HOT</Text>
                        </View>
                    )}
                    <Ionicons name="arrow-up-outline" size={14} color={COLORS.mediumGray} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={COLORS.mediumGray} />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Search Walmart"
                            placeholderTextColor={COLORS.mediumGray}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => handleSearch(searchQuery)}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.aiToggleButton, { backgroundColor: aiEnabled ? COLORS.aiGreen : 'rgba(255,255,255,0.2)' }]}
                        onPress={toggleAI}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="sparkles" size={18} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.barcodeButton}
                        onPress={() => Alert.alert('Barcode Scanner', 'Barcode scanning feature coming soon!')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="barcode-outline" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cartButton}
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

            {/* Search Suggestions Overlay */}
            {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                    {suggestionsLoading ? (
                        <View style={styles.suggestionsLoading}>
                            <ActivityIndicator size="small" color={COLORS.walmartBlue} />
                            <Text style={styles.suggestionsLoadingText}>Getting smart suggestions...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={aiSuggestions.length > 0 ? aiSuggestions : searchSuggestions}
                            renderItem={renderSearchSuggestion}
                            keyExtractor={(item, index) => `suggestion-${index}`}
                            style={styles.suggestionsList}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    {aiEnabled && !suggestionsLoading && (
                        <View style={styles.aiPoweredFooter}>
                            <Ionicons name="sparkles" size={12} color={COLORS.aiGreen} />
                            <Text style={styles.aiPoweredText}>AI-powered suggestions</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Content */}
            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                {isSearching && searchResults.length === 0 && !isLoading ? (
                    // No Results State
                    <View style={styles.noResultsContainer}>
                        <Ionicons name="search-outline" size={64} color={COLORS.mediumGray} />
                        <Text style={styles.noResultsTitle}>No results found</Text>
                        <Text style={styles.noResultsText}>
                            Try different keywords or check your spelling
                        </Text>
                        <TouchableOpacity
                            style={styles.browseAllButton}
                            onPress={() => router.push('/product')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.browseAllText}>Browse All Products</Text>
                        </TouchableOpacity>
                    </View>
                ) : isSearching && searchResults.length > 0 ? (
                    // Search Results
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsCount}>
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                            </Text>
                            {aiEnabled && (
                                <View style={styles.aiResultsBadge}>
                                    <Ionicons name="sparkles" size={12} color={COLORS.aiGreen} />
                                    <Text style={styles.aiResultsText}>AI Enhanced</Text>
                                </View>
                            )}
                        </View>
                        <FlatList
                            data={searchResults}
                            renderItem={renderSearchResult}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            contentContainerStyle={styles.resultsGrid}
                            columnWrapperStyle={styles.resultsRow}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                ) : (
                    // Default Search Home
                    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        {/* AI Status Banner */}
                        <View style={[styles.sectionCard, styles.aiStatusCard]}>
                            <View style={styles.aiStatusContent}>
                                <View style={styles.aiStatusLeft}>
                                    <Ionicons name="sparkles" size={20} color={aiEnabled ? COLORS.aiGreen : COLORS.mediumGray} />
                                    <Text style={styles.aiStatusTitle}>
                                        AI-Powered Search {aiEnabled ? 'Enabled' : 'Disabled'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.aiToggle, { backgroundColor: aiEnabled ? COLORS.aiGreen : COLORS.mediumGray }]}
                                    onPress={toggleAI}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.aiToggleText}>{aiEnabled ? 'ON' : 'OFF'}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.aiStatusDescription}>
                                {aiEnabled ? 'Get smarter search suggestions powered by AI for better product discovery.' : 'Enable AI for enhanced search suggestions and personalized recommendations.'}
                            </Text>
                        </View>

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <View style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                                    <TouchableOpacity onPress={clearRecentSearches}>
                                        <Text style={styles.clearAllText}>Clear All</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.recentSearchesContainer}>
                                    {recentSearches.slice(0, 5).map((search, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.recentSearchItem}
                                            onPress={() => handleRecentSearchPress(search)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="time-outline" size={16} color={COLORS.mediumGray} />
                                            <Text style={styles.recentSearchText}>{search}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Trending Searches */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Trending Now</Text>
                            </View>
                            <View style={styles.trendingContainer}>
                                {trendingSearches.map((trend, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.trendingTag}
                                        onPress={() => handleTrendingSearchPress(trend)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="trending-up" size={14} color={COLORS.walmartBlue} />
                                        <Text style={styles.trendingTagText}>{trend}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Popular Categories */}
                        <View style={[styles.sectionCard, styles.lastSection]}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Shop by Category</Text>
                            </View>
                            <View style={styles.categoriesList}>
                                {popularCategories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={styles.categoryItem}
                                        onPress={() => handleCategoryPress(category.id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                                            <Ionicons name={category.icon} size={24} color={COLORS.white} />
                                        </View>
                                        <View style={styles.categoryContent}>
                                            <Text style={styles.categoryText}>{category.name}</Text>
                                            <Text style={styles.categoryCount}>{category.productCount} items</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.quickActionsContainer}>
                            <TouchableOpacity
                                style={styles.quickAction}
                                onPress={() => router.push('/product?filter=new-arrivals')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
                                    <Ionicons name="sparkles" size={24} color={COLORS.success} />
                                </View>
                                <Text style={styles.quickActionText}>New Arrivals</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickAction}
                                onPress={() => router.push('/product?filter=trending')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
                                    <Ionicons name="trending-up" size={24} color={COLORS.error} />
                                </View>
                                <Text style={styles.quickActionText}>Trending</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickAction}
                                onPress={() => router.push('/product')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
                                    <Ionicons name="grid" size={24} color={COLORS.walmartBlue} />
                                </View>
                                <Text style={styles.quickActionText}>All Products</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickAction}
                                onPress={() => router.push('/product?filter=sale')}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                                    <Ionicons name="pricetag" size={24} color={COLORS.warning} />
                                </View>
                                <Text style={styles.quickActionText}>On Sale</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </Animated.View>

            {/* Loading Overlay */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.walmartBlue} />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    contentContainer: {
        flex: 1,
    },

    // Header - Enhanced Walmart Blue Design
    header: {
        backgroundColor: COLORS.walmartBlue,
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingVertical: 12,
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
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '400',
        lineHeight: 20,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif',
            },
        }),
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
        borderRadius: 12,
    },
    aiToggleButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    barcodeButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cartButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        position: 'relative',
    },
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.walmartYellow,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: COLORS.walmartBlue,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cartBadgeText: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '700',
    },

    // Search Suggestions Overlay - Enhanced for AI
    suggestionsContainer: {
        position: 'absolute',
        top: 88,
        left: 16,
        right: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        zIndex: 1000,
        maxHeight: 350,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    suggestionsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    suggestionsLoadingText: {
        marginLeft: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    suggestionsList: {
        borderRadius: 16,
        maxHeight: 280,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    suggestionText: {
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
        flex: 1,
    },
    aiSuggestionText: {
        color: COLORS.aiPurple,
        fontWeight: '600',
    },
    suggestionRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiSuggestionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    aiSuggestionBadgeText: {
        color: COLORS.aiGreen,
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 3,
        letterSpacing: 0.5,
    },
    hotBadge: {
        backgroundColor: '#FED7AA',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#FDBA74',
    },
    hotBadgeText: {
        color: '#EA580C',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    aiPoweredFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    aiPoweredText: {
        marginLeft: 6,
        fontSize: 12,
        color: COLORS.aiGreen,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Scroll Container
    scrollContainer: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },

    // AI Status Card - New Section
    aiStatusCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.15)',
        marginTop: 8,
    },
    aiStatusContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    aiStatusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    aiStatusTitle: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    aiToggle: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 50,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    aiToggleText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    aiStatusDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        fontStyle: 'italic',
    },

    // Section Cards - Enhanced Design
    sectionCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    lastSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontWeight: '700',
        fontSize: 22,
        lineHeight: 28,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    clearAllText: {
        color: COLORS.walmartBlue,
        fontSize: 16,
        fontWeight: '600',
    },

    // Recent Searches - Enhanced Layout
    recentSearchesContainer: {
        gap: 12,
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.recentSearchGray,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    recentSearchText: {
        marginLeft: 12,
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
    },

    // Trending Tags - Enhanced Design
    trendingContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    trendingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightBlue,
        borderWidth: 1,
        borderColor: '#BBDEFB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.walmartBlue,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    trendingTagText: {
        marginLeft: 6,
        color: COLORS.walmartBlue,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },

    // Categories List - Enhanced Design
    categoriesList: {
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    categoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
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
    categoryContent: {
        flex: 1,
    },
    categoryText: {
        color: COLORS.textPrimary,
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
        marginBottom: 2,
    },
    categoryCount: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 18,
    },

    // Quick Actions - Enhanced Section
    quickActionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 32,
    },
    quickAction: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
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
    quickActionText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
    },

    // Search Results - Enhanced Grid
    resultsContainer: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    resultsHeader: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    resultsCount: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
        flex: 1,
    },
    aiResultsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    aiResultsText: {
        marginLeft: 4,
        fontSize: 12,
        color: COLORS.aiGreen,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    resultsGrid: {
        padding: 16,
        paddingBottom: 32,
    },
    resultsRow: {
        justifyContent: 'space-between',
    },

    // Product Cards - Enhanced Design
    productCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        width: '48%',
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    productBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    productBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    productImage: {
        width: '100%',
        height: 140,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#F8FAFC',
    },
    productInfo: {
        flex: 1,
    },
    productBrand: {
        fontSize: 12,
        color: COLORS.walmartBlue,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 18,
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 6,
    },
    ratingText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.success,
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.mediumGray,
        textDecorationLine: 'line-through',
        marginLeft: 6,
    },
    shippingInfo: {
        fontSize: 11,
        color: COLORS.success,
        fontWeight: '500',
        marginBottom: 12,
    },

    // Action Buttons - Enhanced Design
    addToCartButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.walmartBlue,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    addToCartText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 4,
    },
    outOfStockButton: {
        backgroundColor: COLORS.mediumGray,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 12,
    },

    // No Results State - Enhanced Design
    noResultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    noResultsTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    noResultsText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    browseAllButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.walmartBlue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    browseAllText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },

    // Loading Overlay - Enhanced Design
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
});

