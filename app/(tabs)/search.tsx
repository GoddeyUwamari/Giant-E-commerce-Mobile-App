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
    Vibration,
    Keyboard,
    StatusBar,
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
    ALL_CATEGORIES,
    getProductsByCategory,
    Product
} from '../../constants/products/data';

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
    aiGradientStart: '#667eea',
    aiGradientEnd: '#764ba2',
};

// Enhanced search function
const searchProducts = (query) => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return ALL_PRODUCTS.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const brandMatch = product.brand?.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category.toLowerCase().includes(searchTerm);

        return nameMatch || brandMatch || categoryMatch;
    }).sort((a, b) => {
        const aRelevance = a.name.toLowerCase().includes(query.toLowerCase()) ? 10 : 5;
        const bRelevance = b.name.toLowerCase().includes(query.toLowerCase()) ? 10 : 5;
        return (bRelevance + b.rating) - (aRelevance + a.rating);
    });
};

// Smart fallback suggestions
const getSmartFallbackSuggestions = (query) => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const suggestions = new Set();

    ALL_PRODUCTS.forEach(product => {
        const name = product.name.toLowerCase();
        const brand = product.brand?.toLowerCase() || '';

        if (name.includes(searchTerm)) {
            suggestions.add(product.name);
        }
        if (brand.includes(searchTerm)) {
            suggestions.add(product.brand || '');
        }
    });

    ALL_CATEGORIES.forEach(category => {
        if (category.name.toLowerCase().includes(searchTerm)) {
            suggestions.add(category.name);
        }
    });

    return Array.from(suggestions).filter(Boolean).slice(0, 8);
};

export default function SearchScreen() {
    const { search: initialSearch } = useLocalSearchParams();

    const [searchQuery, setSearchQuery] = useState(initialSearch || '');
    const [searchResults, setSearchResults] = useState([]);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [searchMode, setSearchMode] = useState('text');
    const [voiceSearching, setVoiceSearching] = useState(false);

    const searchInputRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const suggestionsAnim = useRef(new Animated.Value(0)).current;
    const aiPulseAnim = useRef(new Animated.Value(1)).current;
    const debounceTimer = useRef();

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const addItem = useCartStore((state) => state.addItem);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    // Trending searches
    const trendingSearches = useMemo(() => {
        const trendingTerms = new Set();

        ALL_CATEGORIES.slice(0, 4).forEach(category => {
            trendingTerms.add(category.name);
        });

        const contextualTrends = [
            'Wireless Earbuds', 'Smart Home', 'Fitness Tracker', 'Gaming Setup',
            'Coffee Maker', 'Air Fryer', 'Skincare', 'Office Chair'
        ];

        contextualTrends.forEach(trend => {
            const hasProducts = ALL_PRODUCTS.some(product =>
                product.name.toLowerCase().includes(trend.toLowerCase())
            );
            if (hasProducts) trendingTerms.add(trend);
        });

        return Array.from(trendingTerms).slice(0, 12);
    }, []);

    // Popular categories
    const popularCategories = useMemo(() => {
        return ALL_CATEGORIES
            .map(category => ({
                id: category.slug,
                name: category.name,
                icon: category.icon,
                color: category.color,
                productCount: category.products?.length || 0,
                avgRating: category.products?.length > 0 ?
                    category.products.reduce((sum, p) => sum + p.rating, 0) / category.products.length : 0,
                trending: category.products?.some(p => p.featured) || false
            }))
            .sort((a, b) => {
                if (a.trending !== b.trending) return b.trending ? 1 : -1;
                if (a.productCount !== b.productCount) return b.productCount - a.productCount;
                return b.avgRating - a.avgRating;
            })
            .slice(0, 8);
    }, []);

    // AI pulse animation
    useEffect(() => {
        if (aiEnabled) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(aiPulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(aiPulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [aiEnabled]);

    useEffect(() => {
        loadRecentSearches();
        calculateSummary();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(suggestionsAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        if (initialSearch) {
            performSearch(initialSearch);
        } else {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 300);
        }
    }, []);

    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    // Debounced search suggestions
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (searchQuery.length > 1) {
            debounceTimer.current = setTimeout(() => {
                handleSearchSuggestions(searchQuery);
            }, 300);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery]);

    const handleSearchSuggestions = async (query) => {
        if (!query.trim()) return;

        setSuggestionsLoading(true);
        setShowSuggestions(true);

        Animated.timing(suggestionsAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        try {
            const fallbackSuggestions = getSmartFallbackSuggestions(query);
            setSearchSuggestions(fallbackSuggestions);
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            setShowSuggestions(false);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const loadRecentSearches = async () => {
        try {
            const recent = await AsyncStorage.getItem('recent_searches_v2');
            if (recent) {
                const searches = JSON.parse(recent);
                const validSearches = searches.filter((search) =>
                    typeof search === 'string' && search.trim().length > 0
                ).slice(0, 20);
                setRecentSearches(validSearches);
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const saveRecentSearch = async (query) => {
        if (!query.trim()) return;

        try {
            const recent = await AsyncStorage.getItem('recent_searches_v2');
            let searches = recent ? JSON.parse(recent) : [];

            searches = searches.filter((s) => s.toLowerCase() !== query.toLowerCase());
            searches.unshift(query.trim());
            searches = searches.slice(0, 20);

            await AsyncStorage.setItem('recent_searches_v2', JSON.stringify(searches));
            setRecentSearches(searches);
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const clearRecentSearches = async () => {
        Alert.alert(
            'Clear Search History',
            'This will remove all your recent searches. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('recent_searches_v2');
                            setRecentSearches([]);
                            if (Platform.OS === 'ios') {
                                Vibration.vibrate(50);
                            }
                        } catch (error) {
                            console.error('Error clearing recent searches:', error);
                        }
                    }
                }
            ]
        );
    };

    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsLoading(true);
        setIsSearching(true);
        setShowSuggestions(false);
        Keyboard.dismiss();

        Animated.timing(suggestionsAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        try {
            let searchResults = searchProducts(query.trim());
            setSearchResults(searchResults);
            await saveRecentSearch(query.trim());

            if (Platform.OS === 'ios' && searchResults.length > 0) {
                Vibration.vibrate(20);
            }

            console.log(`Found ${searchResults.length} products for: "${query}"`);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Search Error', 'Failed to perform search. Please try again.');
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceSearch = async () => {
        if (voiceSearching) return;

        setVoiceSearching(true);
        setSearchMode('voice');

        try {
            Alert.alert(
                'Voice Search',
                'Voice search feature coming soon! Speak your search query.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Try Text Search',
                        onPress: () => {
                            setSearchMode('text');
                            searchInputRef.current?.focus();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Voice search error:', error);
            Alert.alert('Error', 'Voice search is not available right now.');
        } finally {
            setVoiceSearching(false);
            setSearchMode('text');
        }
    };

    const handleBarcodeSearch = () => {
        setSearchMode('barcode');
        Alert.alert(
            'Barcode Scanner',
            'Point your camera at a product barcode to search.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Camera',
                    onPress: () => {
                        console.log('Opening barcode scanner...');
                        setSearchMode('text');
                    }
                }
            ]
        );
    };

    const handleSearch = (query) => {
        performSearch(query);
    };

    const handleSuggestionPress = useCallback((suggestion) => {
        const searchTerm = typeof suggestion === 'string' ? suggestion : suggestion.text;
        setSearchQuery(searchTerm);
        performSearch(searchTerm);

        if (Platform.OS === 'ios') {
            Vibration.vibrate(10);
        }
    }, []);

    const handleRecentSearchPress = useCallback((searchTerm) => {
        setSearchQuery(searchTerm);
        performSearch(searchTerm);
    }, []);

    const handleTrendingSearchPress = useCallback((searchTerm) => {
        setSearchQuery(searchTerm);
        performSearch(searchTerm);
    }, []);

    const handleCategoryPress = useCallback((categoryKey) => {
        router.push(`/category/${categoryKey}`);
    }, []);

    const handleProductPress = useCallback((productId) => {
        router.push(`/product/${productId}`);
    }, []);

    const handleAddToCart = useCallback(async (product) => {
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
                image: product.image,
                category: product.category,
                sku: product.sku,
                status: product.status,
                storeId: product.storeId,
                storeName: product.storeName,
                delivery: product.delivery,
            });

            if (success) {
                if (Platform.OS === 'ios') {
                    Vibration.vibrate(30);
                }

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
        }
    }, [addItem]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        setShowSuggestions(false);

        Animated.timing(suggestionsAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        searchInputRef.current?.focus();
    };

    const toggleAI = () => {
        setAiEnabled(!aiEnabled);

        if (Platform.OS === 'ios') {
            Vibration.vibrate(!aiEnabled ? 20 : 50);
        }

        if (!aiEnabled) {
            if (searchQuery.length > 1) {
                handleSearchSuggestions(searchQuery);
            }
        }
    };

    // Quick actions
    const quickActions = useMemo(() => [
        {
            title: 'New Arrivals',
            icon: 'sparkles',
            iconColor: COLORS.success,
            backgroundColor: '#ECFDF5',
            onPress: () => router.push('/product?filter=new-arrivals'),
            badge: 'Hot'
        },
        {
            title: 'Flash Sale',
            icon: 'flash',
            iconColor: COLORS.error,
            backgroundColor: '#FEE2E2',
            onPress: () => router.push('/product?filter=sale'),
            badge: '50% Off'
        },
        {
            title: 'All Products',
            icon: 'grid',
            iconColor: COLORS.walmartBlue,
            backgroundColor: '#EFF6FF',
            onPress: () => router.push('/product'),
            badge: `${ALL_PRODUCTS.length}+`
        },
        {
            title: 'Top Rated',
            icon: 'star',
            iconColor: COLORS.warning,
            backgroundColor: '#FEF3C7',
            onPress: () => router.push('/product?filter=top-rated'),
            badge: '4.5★'
        }
    ], []);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.walmartBlue}
                translucent={false}
            />

            {/* Header with Full Background Coverage */}
            <View style={styles.headerContainer}>
                <SafeAreaView style={styles.safeAreaHeader}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <View style={styles.searchContainer}>
                            <Ionicons
                                name={searchMode === 'voice' ? 'mic' : searchMode === 'barcode' ? 'barcode' : 'search'}
                                size={20}
                                color={searchMode === 'text' ? COLORS.mediumGray : COLORS.walmartBlue}
                            />
                            <TextInput
                                ref={searchInputRef}
                                style={[styles.searchInput, searchMode !== 'text' && styles.searchInputDisabled]}
                                placeholder={
                                    searchMode === 'voice' ? 'Listening...' :
                                        searchMode === 'barcode' ? 'Scan barcode...' :
                                            'Search Walmart with AI'
                                }
                                placeholderTextColor={COLORS.mediumGray}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={() => handleSearch(searchQuery)}
                                returnKeyType="search"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={searchMode === 'text'}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                    <Ionicons name="close-circle" size={20} color={COLORS.mediumGray} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.voiceButton}
                            onPress={handleVoiceSearch}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={voiceSearching ? "mic" : "mic-outline"}
                                size={20}
                                color={voiceSearching ? COLORS.error : COLORS.white}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.barcodeButton}
                            onPress={handleBarcodeSearch}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="barcode-outline" size={20} color={COLORS.white} />
                        </TouchableOpacity>

                        <Animated.View style={{ transform: [{ scale: aiPulseAnim }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.aiToggleButton,
                                    {
                                        backgroundColor: aiEnabled ? COLORS.aiGreen : 'rgba(255,255,255,0.2)',
                                        borderWidth: aiEnabled ? 2 : 0,
                                        borderColor: aiEnabled ? COLORS.white : 'transparent'
                                    }
                                ]}
                                onPress={toggleAI}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="sparkles" size={16} color={COLORS.white} />
                            </TouchableOpacity>
                        </Animated.View>

                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => router.push('/(modals)/cart')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cartIconContainer}>
                                <Ionicons name="bag-outline" size={24} color={COLORS.white} />
                                {summary.itemCount > 0 && (
                                    <Animated.View
                                        style={[
                                            styles.cartBadge,
                                            { transform: [{ scale: aiPulseAnim }] }
                                        ]}
                                    >
                                        <Text style={styles.cartBadgeText}>{summary.itemCount}</Text>
                                    </Animated.View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {/* Main content wrapper */}
            <SafeAreaView style={styles.mainContent}>
                {/* Search Suggestions */}
                {showSuggestions && (
                    <Animated.View
                        style={[
                            styles.suggestionsContainer,
                            {
                                opacity: suggestionsAnim,
                                transform: [{
                                    translateY: suggestionsAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-20, 0],
                                    })
                                }]
                            }
                        ]}
                    >
                        {suggestionsLoading ? (
                            <View style={styles.suggestionsLoading}>
                                <ActivityIndicator size="small" color={COLORS.aiGreen} />
                                <Text style={styles.suggestionsLoadingText}>
                                    {aiEnabled ? 'AI is thinking...' : 'Searching suggestions...'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={searchSuggestions}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={styles.suggestionItem}
                                        onPress={() => handleSuggestionPress(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="search" size={16} color={COLORS.mediumGray} />
                                        <Text style={styles.suggestionText}>{item}</Text>
                                        <Ionicons name="arrow-up-outline" size={14} color={COLORS.mediumGray} />
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => `suggestion-${index}`}
                                style={styles.suggestionsList}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </Animated.View>
                )}

                {/* Content Container */}
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                    {isSearching && searchResults.length === 0 && !isLoading ? (
                        // No Results State
                        <View style={styles.noResultsContainer}>
                            <Ionicons name="search-outline" size={64} color={COLORS.mediumGray} />
                            <Text style={styles.noResultsTitle}>No results found</Text>
                            <Text style={styles.noResultsText}>
                                Try different keywords or browse our categories
                            </Text>

                            <TouchableOpacity
                                style={styles.browseAllButton}
                                onPress={() => router.push('/product')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="grid-outline" size={20} color={COLORS.white} />
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
                            </View>

                            <FlatList
                                data={searchResults}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={styles.productCard}
                                        onPress={() => handleProductPress(item.id)}
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: item.image }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />

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
                                )}
                                keyExtractor={(item) => item.id}
                                numColumns={2}
                                contentContainerStyle={styles.resultsGrid}
                                columnWrapperStyle={styles.resultsRow}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    ) : (
                        // Default Search Home
                        <ScrollView
                            style={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {/* AI Status Banner */}
                            <View style={styles.sectionCard}>
                                <View style={styles.aiStatusContent}>
                                    <View style={styles.aiStatusLeft}>
                                        <Ionicons
                                            name="sparkles"
                                            size={24}
                                            color={aiEnabled ? COLORS.aiGreen : COLORS.mediumGray}
                                        />
                                        <View style={styles.aiStatusTextContainer}>
                                            <Text style={styles.aiStatusTitle}>
                                                AI-Powered Search
                                            </Text>
                                            <Text style={styles.aiStatusSubtitle}>
                                                {aiEnabled ? 'Getting smarter results' : 'Basic search mode'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.aiToggle,
                                            { backgroundColor: aiEnabled ? COLORS.aiGreen : COLORS.mediumGray }
                                        ]}
                                        onPress={toggleAI}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.aiToggleText}>{aiEnabled ? 'ON' : 'OFF'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.aiStatusDescription}>
                                    {aiEnabled
                                        ? 'AI analyzes your search to provide personalized results, smart filters, and better product discovery.'
                                        : 'Enable AI for enhanced search suggestions, smart filtering, and personalized recommendations.'
                                    }
                                </Text>
                            </View>

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <View style={styles.sectionCard}>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionTitleContainer}>
                                            <Ionicons name="time-outline" size={20} color={COLORS.textPrimary} />
                                            <Text style={styles.sectionTitle}>Recent Searches</Text>
                                        </View>
                                        <TouchableOpacity onPress={clearRecentSearches}>
                                            <Text style={styles.clearAllText}>Clear All</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.recentSearchesContainer}>
                                        {recentSearches.slice(0, 6).map((search, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.recentSearchItem}
                                                onPress={() => handleRecentSearchPress(search)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="search" size={14} color={COLORS.mediumGray} />
                                                <Text style={styles.recentSearchText}>{search}</Text>
                                                <Ionicons name="arrow-up-outline" size={14} color={COLORS.mediumGray} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Trending Searches */}
                            <View style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Ionicons name="trending-up" size={20} color={COLORS.error} />
                                        <Text style={styles.sectionTitle}>Trending Now</Text>
                                    </View>
                                </View>
                                <FlatList
                                    data={trendingSearches}
                                    renderItem={({ item, index }) => (
                                        <TouchableOpacity
                                            style={styles.trendingTag}
                                            onPress={() => handleTrendingSearchPress(item)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="trending-up" size={14} color={COLORS.walmartBlue} />
                                            <Text style={styles.trendingTagText}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => `trending-${index}`}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.trendingScrollContainer}
                                />
                            </View>

                            {/* Popular Categories */}
                            <View style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Ionicons name="grid-outline" size={20} color={COLORS.walmartBlue} />
                                        <Text style={styles.sectionTitle}>Browse Categories</Text>
                                    </View>
                                </View>
                                <View style={styles.categoriesList}>
                                    {popularCategories.map((category, index) => (
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
                                                <Text style={styles.categoryCount}>
                                                    {category.productCount} items • {category.avgRating.toFixed(1)}★
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Quick Actions */}
                            <View style={styles.quickActionsContainer}>
                                <FlatList
                                    data={quickActions}
                                    renderItem={({ item, index }) => (
                                        <TouchableOpacity
                                            style={styles.quickAction}
                                            onPress={item.onPress}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.quickActionIcon, { backgroundColor: item.backgroundColor }]}>
                                                <Ionicons name={item.icon} size={24} color={item.iconColor} />
                                            </View>
                                            <Text style={styles.quickActionText}>{item.title}</Text>
                                            {item.badge && (
                                                <View style={styles.quickActionBadge}>
                                                    <Text style={styles.quickActionBadgeText}>{item.badge}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => `action-${index}`}
                                    numColumns={2}
                                    columnWrapperStyle={styles.quickActionsRow}
                                    scrollEnabled={false}
                                />
                            </View>
                        </ScrollView>
                    )}
                </Animated.View>

                {/* Loading Overlay */}
                {isLoading && (
                    <Animated.View
                        style={[
                            styles.loadingOverlay,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <View style={styles.loadingContent}>
                            <ActivityIndicator size="large" color={COLORS.walmartBlue} />
                            <Text style={styles.loadingText}>
                                {aiEnabled ? 'AI is searching...' : 'Searching...'}
                            </Text>
                        </View>
                    </Animated.View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    headerContainer: {
        backgroundColor: COLORS.walmartBlue,
        paddingTop: 0,
    },
    safeAreaHeader: {
        backgroundColor: COLORS.walmartBlue,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    searchInputDisabled: {
        color: COLORS.mediumGray,
    },
    clearButton: {
        padding: 4,
    },
    voiceButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    barcodeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiToggleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartButton: {
        padding: 4,
    },
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    mainContent: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    suggestionsContainer: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        maxHeight: 300,
    },
    suggestionsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    suggestionsLoadingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    suggestionsList: {
        paddingVertical: 8,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    suggestionText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    contentContainer: {
        flex: 1,
    },
    noResultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 16,
    },
    noResultsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    noResultsText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    browseAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.walmartBlue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
        marginTop: 16,
    },
    browseAllText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    resultsHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    resultsCount: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    resultsGrid: {
        padding: 16,
    },
    resultsRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        width: (screenWidth - 48) / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    productInfo: {
        gap: 4,
    },
    productBrand: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        lineHeight: 18,
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 1,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    originalPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.walmartBlue,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
        marginTop: 8,
    },
    addToCartText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    outOfStockButton: {
        backgroundColor: COLORS.mediumGray,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    outOfStockText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        gap: 12,
    },
    aiStatusTextContainer: {
        gap: 2,
    },
    aiStatusTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    aiStatusSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    aiToggle: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiToggleText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    aiStatusDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    clearAllText: {
        fontSize: 14,
        color: COLORS.walmartBlue,
        fontWeight: '600',
    },
    recentSearchesContainer: {
        gap: 8,
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.recentSearchGray,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    recentSearchText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    trendingScrollContainer: {
        paddingRight: 16,
        gap: 8,
    },
    trendingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightBlue,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        marginRight: 8,
    },
    trendingTagText: {
        fontSize: 14,
        color: COLORS.walmartBlue,
        fontWeight: '500',
    },
    categoriesList: {
        gap: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    categoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryContent: {
        flex: 1,
        gap: 2,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    categoryCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    quickActionsContainer: {
        marginTop: 8,
    },
    quickActionsRow: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    quickAction: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        width: (screenWidth - 48) / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    quickActionBadge: {
        backgroundColor: COLORS.error,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    quickActionBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContent: {
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
});