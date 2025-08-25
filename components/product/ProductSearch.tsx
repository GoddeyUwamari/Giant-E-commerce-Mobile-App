import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Animated,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface SearchSuggestion {
    id: string;
    text: string;
    type: 'product' | 'category' | 'brand' | 'recent';
    category?: string;
    image?: string;
    popularity?: number;
}

interface SearchResult {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    category: string;
    brand?: string;
    inStock: boolean;
}

interface ProductSearchProps {
    placeholder?: string;
    showSuggestions?: boolean;
    showRecentSearches?: boolean;
    showTrendingSearches?: boolean;
    recentSearches?: string[];
    trendingSearches?: string[];
    suggestions?: SearchSuggestion[];
    results?: SearchResult[];
    loading?: boolean;
    onSearch: (query: string) => void;
    onSuggestionPress?: (suggestion: SearchSuggestion) => void;
    onResultPress?: (result: SearchResult) => void;
    onClearRecent?: () => void;
    onVoiceSearch?: () => void;
    onBarcodeSearch?: () => void;
    onFilterPress?: () => void;
}

export default function ProductSearch({
                                          placeholder = 'Search products...',
                                          showSuggestions = true,
                                          showRecentSearches = true,
                                          showTrendingSearches = true,
                                          recentSearches = [],
                                          trendingSearches = [],
                                          suggestions = [],
                                          results = [],
                                          loading = false,
                                          onSearch,
                                          onSuggestionPress,
                                          onResultPress,
                                          onClearRecent,
                                          onVoiceSearch,
                                          onBarcodeSearch,
                                          onFilterPress,
                                      }: ProductSearchProps): JSX.Element {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isFocused || query.length > 0 ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isFocused, query, fadeAnim]);

    useEffect(() => {
        if (query.length >= 2) {
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    }, [query]);

    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
            setQuery(searchQuery);
            setShowResults(true);
        }
    };

    const handleSuggestionPress = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.text);
        handleSearch(suggestion.text);
        onSuggestionPress?.(suggestion);
        inputRef.current?.blur();
    };

    const clearSearch = () => {
        setQuery('');
        setShowResults(false);
        inputRef.current?.focus();
    };

    const renderSearchBar = () => (
        <View style={styles.searchBarContainer}>
            <View style={[styles.searchInputContainer, isFocused && styles.searchInputFocused]}>
                <Ionicons name="search" size={20} color="#6B7280" />

                <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={() => handleSearch(query)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    returnKeyType="search"
                    autoCorrect={false}
                />

                {query.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}

                <View style={styles.actionButtons}>
                    {onVoiceSearch && (
                        <TouchableOpacity onPress={onVoiceSearch} style={styles.actionButton}>
                            <Ionicons name="mic" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    )}

                    {onBarcodeSearch && (
                        <TouchableOpacity onPress={onBarcodeSearch} style={styles.actionButton}>
                            <Ionicons name="barcode" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    )}

                    {onFilterPress && (
                        <TouchableOpacity onPress={onFilterPress} style={styles.actionButton}>
                            <Ionicons name="options" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    const renderRecentSearches = () => {
        if (!showRecentSearches || !recentSearches.length || query.length > 0) return null;

        return (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    {onClearRecent && (
                        <TouchableOpacity onPress={onClearRecent}>
                            <Text style={styles.clearAllText}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.chipContainer}>
                    {recentSearches.slice(0, 6).map((search, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.recentChip}
                            onPress={() => handleSearch(search)}
                        >
                            <View style={styles.recentChipContent}>
                                <Ionicons name="time" size={14} color="#6B7280" />
                                <Text style={styles.recentChipText}>{search}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderTrendingSearches = () => {
        if (!showTrendingSearches || !trendingSearches.length || query.length > 0) return null;

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Trending Now</Text>

                <View style={styles.listContainer}>
                    {trendingSearches.slice(0, 5).map((search, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.trendingItem}
                            onPress={() => handleSearch(search)}
                        >
                            <View style={styles.trendingRank}>
                                <Text style={styles.trendingRankText}>
                                    {index + 1}
                                </Text>
                            </View>
                            <Ionicons name="trending-up" size={16} color="#EF4444" />
                            <Text style={styles.trendingText}>{search}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderSuggestions = () => {
        if (!showSuggestions || !suggestions.length || query.length === 0) return null;

        const filteredSuggestions = suggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(query.toLowerCase())
        );

        if (!filteredSuggestions.length) return null;

        return (
            <Animated.View style={{ opacity: fadeAnim }}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Suggestions</Text>

                    <View style={styles.listContainer}>
                        {filteredSuggestions.slice(0, 8).map((suggestion) => (
                            <TouchableOpacity
                                key={suggestion.id}
                                style={styles.suggestionItem}
                                onPress={() => handleSuggestionPress(suggestion)}
                            >
                                <View style={styles.suggestionIcon}>
                                    {suggestion.image ? (
                                        <Image
                                            source={{ uri: suggestion.image }}
                                            style={styles.suggestionImage}
                                        />
                                    ) : (
                                        <View style={styles.suggestionIconDefault}>
                                            <Ionicons
                                                name={
                                                    suggestion.type === 'product' ? 'cube' :
                                                        suggestion.type === 'category' ? 'grid' :
                                                            suggestion.type === 'brand' ? 'business' : 'search'
                                                }
                                                size={16}
                                                color="#6B7280"
                                            />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.suggestionContent}>
                                    <Text style={styles.suggestionText}>
                                        {suggestion.text}
                                    </Text>
                                    {suggestion.category && (
                                        <Text style={styles.suggestionCategory}>
                                            in {suggestion.category}
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.suggestionActions}>
                                    {suggestion.type === 'recent' && (
                                        <Ionicons name="time" size={16} color="#9CA3AF" />
                                    )}
                                    {suggestion.popularity && suggestion.popularity > 80 && (
                                        <View style={styles.hotBadge}>
                                            <Text style={styles.hotBadgeText}>
                                                HOT
                                            </Text>
                                        </View>
                                    )}
                                    <Ionicons name="arrow-up" size={16} color="#9CA3AF" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Animated.View>
        );
    };

    const renderSearchResults = () => {
        if (!showResults) return null;

        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            );
        }

        if (!results.length) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No Results Found</Text>
                    <Text style={styles.emptySubtitle}>
                        Try adjusting your search terms or browse our categories
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.resultsContainer}>
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsText}>
                        {results.length} results for "{query}"
                    </Text>
                </View>

                <ScrollView style={styles.resultsList}>
                    {results.map((result) => (
                        <TouchableOpacity
                            key={result.id}
                            style={styles.resultItem}
                            onPress={() => onResultPress?.(result)}
                        >
                            <View style={styles.resultImageContainer}>
                                <Image
                                    source={{ uri: result.image }}
                                    style={styles.resultImage}
                                />
                                {!result.inStock && (
                                    <View style={styles.outOfStockOverlay}>
                                        <Text style={styles.outOfStockText}>
                                            OUT OF STOCK
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.resultContent}>
                                <Text style={styles.resultName} numberOfLines={2}>
                                    {result.name}
                                </Text>

                                <View style={styles.resultMeta}>
                                    <View style={styles.resultRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name="star"
                                                size={12}
                                                color={star <= result.rating ? "#F59E0B" : "#E5E7EB"}
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.resultCategory}>
                                        {result.category}
                                    </Text>
                                </View>

                                <View style={styles.resultFooter}>
                                    <Text style={styles.resultPrice}>
                                        ${result.price.toFixed(2)}
                                    </Text>

                                    {result.brand && (
                                        <Text style={styles.resultBrand}>
                                            {result.brand}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderQuickActions = () => {
        if (query.length > 0 || (!recentSearches.length && !trendingSearches.length)) return null;

        const quickActions = [
            { icon: 'flash', label: 'Flash Deals', color: '#EF4444' },
            { icon: 'star', label: 'Best Sellers', color: '#F59E0B' },
            { icon: 'pricetag', label: 'On Sale', color: '#10B981' },
            { icon: 'gift', label: 'New Arrivals', color: '#8B5CF6' },
        ];

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickActionItem}
                            onPress={() => handleSearch(action.label)}
                        >
                            <View
                                style={[
                                    styles.quickActionIcon,
                                    { backgroundColor: `${action.color}20` }
                                ]}
                            >
                                <Ionicons
                                    name={action.icon as any}
                                    size={24}
                                    color={action.color}
                                />
                            </View>
                            <Text style={styles.quickActionLabel}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderSearchCategories = () => {
        if (query.length > 0) return null;

        const categories = [
            { name: 'Electronics', icon: 'phone-portrait', count: '2.5k' },
            { name: 'Clothing', icon: 'shirt', count: '1.8k' },
            { name: 'Home & Garden', icon: 'home', count: '3.2k' },
            { name: 'Sports', icon: 'basketball', count: '890' },
            { name: 'Books', icon: 'book', count: '567' },
            { name: 'Beauty', icon: 'flower', count: '1.2k' },
        ];

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Browse Categories</Text>

                <View style={styles.listContainer}>
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.categoryItem}
                            onPress={() => handleSearch(category.name)}
                        >
                            <View style={styles.categoryIcon}>
                                <Ionicons
                                    name={category.icon as any}
                                    size={20}
                                    color="#2563EB"
                                />
                            </View>

                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryName}>
                                    {category.name}
                                </Text>
                                <Text style={styles.categoryCount}>
                                    {category.count} products
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderSearchBar()}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {showResults ? (
                    renderSearchResults()
                ) : (
                    <>
                        {renderSuggestions()}
                        {renderRecentSearches()}
                        {renderTrendingSearches()}
                        {renderQuickActions()}
                        {renderSearchCategories()}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
    },

    // Search Bar
    searchBarContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchInputFocused: {
        borderColor: '#2563EB',
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        color: '#111827',
        fontSize: 16,
        fontWeight: '400',
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
    actionButtons: {
        flexDirection: 'row',
        marginLeft: 8,
        gap: 8,
    },
    actionButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
    },

    // Sections
    sectionContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
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
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 14,
    },
    listContainer: {
        gap: 8,
    },

    // Recent Searches
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    recentChip: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    recentChipContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recentChipText: {
        color: '#374151',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },

    // Trending
    trendingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
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
    trendingRank: {
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    trendingRankText: {
        color: '#DC2626',
        fontWeight: '700',
        fontSize: 12,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    trendingText: {
        color: '#111827',
        marginLeft: 8,
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },

    // Suggestions
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    suggestionIcon: {
        marginRight: 12,
    },
    suggestionImage: {
        width: 32,
        height: 32,
        borderRadius: 6,
    },
    suggestionIconDefault: {
        width: 32,
        height: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionText: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 2,
    },
    suggestionCategory: {
        color: '#6B7280',
        fontSize: 13,
        fontStyle: 'italic',
    },
    suggestionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hotBadge: {
        backgroundColor: '#FED7AA',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#FDBA74',
    },
    hotBadgeText: {
        color: '#EA580C',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Quick Actions
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    quickActionItem: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        minHeight: 100,
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
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        color: '#111827',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 18,
    },

    // Categories
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    categoryIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#DBEAFE',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    categoryContent: {
        flex: 1,
    },
    categoryName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 2,
    },
    categoryCount: {
        color: '#6B7280',
        fontSize: 13,
    },

    // Results
    resultsContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    resultsHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#F9FAFB',
    },
    resultsText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    resultsList: {
        flex: 1,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    resultImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    resultImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    resultContent: {
        flex: 1,
    },
    resultName: {
        color: '#111827',
        fontWeight: '600',
        marginBottom: 6,
        fontSize: 15,
        lineHeight: 20,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    resultRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    resultCategory: {
        color: '#6B7280',
        fontSize: 13,
        textTransform: 'capitalize',
    },
    resultFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    resultBrand: {
        color: '#6B7280',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '500',
    },

    // Loading & Empty States
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        color: '#6B7280',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#FFFFFF',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
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
    emptySubtitle: {
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 20,
        paddingHorizontal: 16,
    },
});