import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Animated,
    Modal,
    Keyboard,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchSuggestion {
    id: string;
    text: string;
    type: 'product' | 'category' | 'recent' | 'trending';
    icon?: string;
    count?: number;
}

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onSearch?: (query: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    showSuggestions?: boolean;
    suggestions?: SearchSuggestion[];
    autoFocus?: boolean;
    showFilters?: boolean;
    filterCount?: number;
    onFiltersPress?: () => void;
    showVoice?: boolean;
    showBarcode?: boolean;
    onVoicePress?: () => void;
    onBarcodePress?: () => void;
    style?: 'default' | 'minimal' | 'rounded' | 'bordered';
    size?: 'small' | 'medium' | 'large';
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    placeholderColor?: string;
}

// Mock data for suggestions
const mockTrendingSearches: SearchSuggestion[] = [
    { id: '1', text: 'iPhone 15', type: 'trending', count: 1250 },
    { id: '2', text: 'Winter coats', type: 'trending', count: 892 },
    { id: '3', text: 'PlayStation 5', type: 'trending', count: 743 },
    { id: '4', text: 'Christmas decorations', type: 'trending', count: 634 },
    { id: '5', text: 'Air fryer', type: 'trending', count: 567 },
];

const mockCategories: SearchSuggestion[] = [
    { id: '1', text: 'Electronics', type: 'category', icon: 'phone-portrait' },
    { id: '2', text: 'Clothing', type: 'category', icon: 'shirt' },
    { id: '3', text: 'Home & Garden', type: 'category', icon: 'home' },
    { id: '4', text: 'Sports & Outdoors', type: 'category', icon: 'football' },
    { id: '5', text: 'Beauty & Personal Care', type: 'category', icon: 'rose' },
];

export default function SearchBar({
                                      placeholder = 'Search everything at Walmart',
                                      value = '',
                                      onChangeText,
                                      onSearch,
                                      onFocus,
                                      onBlur,
                                      showSuggestions = true,
                                      suggestions,
                                      autoFocus = false,
                                      showFilters = false,
                                      filterCount = 0,
                                      onFiltersPress,
                                      showVoice = true,
                                      showBarcode = true,
                                      onVoicePress,
                                      onBarcodePress,
                                      style = 'default',
                                      size = 'medium',
                                      backgroundColor = '#F3F4F6',
                                      borderColor = '#E5E7EB',
                                      textColor = '#111827',
                                      placeholderColor = '#9CA3AF',
                                  }: SearchBarProps): JSX.Element {
    const [searchText, setSearchText] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
    const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);

    const textInputRef = useRef<TextInput>(null);
    const suggestionAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setSearchText(value);
    }, [value]);

    useEffect(() => {
        loadRecentSearches();
    }, []);

    useEffect(() => {
        if (isFocused && showSuggestions) {
            setShowSuggestionsModal(true);
            Animated.timing(suggestionAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(suggestionAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                if (!isFocused) setShowSuggestionsModal(false);
            });
        }
    }, [isFocused, showSuggestions]);

    useEffect(() => {
        filterSuggestions();
    }, [searchText, recentSearches, suggestions]);

    const loadRecentSearches = async () => {
        try {
            const searches = await AsyncStorage.getItem('recent_searches');
            if (searches) {
                const parsedSearches = JSON.parse(searches);
                const recentSuggestions: SearchSuggestion[] = parsedSearches.map((search: string, index: number) => ({
                    id: `recent_${index}`,
                    text: search,
                    type: 'recent' as const,
                    icon: 'time',
                }));
                setRecentSearches(recentSuggestions);
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const saveRecentSearch = async (query: string) => {
        try {
            const trimmedQuery = query.trim();
            if (!trimmedQuery) return;

            let searches = recentSearches.map(item => item.text);
            searches = searches.filter(search => search.toLowerCase() !== trimmedQuery.toLowerCase());
            searches.unshift(trimmedQuery);
            searches = searches.slice(0, 10);

            await AsyncStorage.setItem('recent_searches', JSON.stringify(searches));
            loadRecentSearches();
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const filterSuggestions = () => {
        if (!searchText.trim()) {
            const allSuggestions = [
                ...recentSearches.slice(0, 5),
                ...mockTrendingSearches.slice(0, 5),
                ...mockCategories.slice(0, 3),
            ];
            setFilteredSuggestions(allSuggestions);
            return;
        }

        const query = searchText.toLowerCase();
        const filtered: SearchSuggestion[] = [];

        // Add matching suggestions from props
        if (suggestions) {
            const matchingSuggestions = suggestions.filter(suggestion =>
                suggestion.text.toLowerCase().includes(query)
            );
            filtered.push(...matchingSuggestions);
        }

        // Add matching recent searches
        const matchingRecent = recentSearches.filter(suggestion =>
            suggestion.text.toLowerCase().includes(query)
        );
        filtered.push(...matchingRecent.slice(0, 3));

        // Add matching categories
        const matchingCategories = mockCategories.filter(category =>
            category.text.toLowerCase().includes(query)
        );
        filtered.push(...matchingCategories.slice(0, 2));

        setFilteredSuggestions(filtered.slice(0, 10));
    };

    const handleTextChange = (text: string) => {
        setSearchText(text);
        onChangeText?.(text);
    };

    const handleFocus = () => {
        setIsFocused(true);
        onFocus?.();
    };

    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };

    const handleSearch = (query?: string) => {
        const searchQuery = query || searchText;
        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery) {
            saveRecentSearch(trimmedQuery);
            onSearch?.(trimmedQuery);
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
            textInputRef.current?.blur();
            setShowSuggestionsModal(false);
        }
    };

    const handleSuggestionPress = (suggestion: SearchSuggestion) => {
        if (suggestion.type === 'category') {
            router.push(`/category/${suggestion.text.toLowerCase().replace(/\s+/g, '-')}`);
        } else {
            setSearchText(suggestion.text);
            handleSearch(suggestion.text);
        }
    };

    const clearRecentSearches = async () => {
        try {
            await AsyncStorage.removeItem('recent_searches');
            setRecentSearches([]);
        } catch (error) {
            console.error('Error clearing recent searches:', error);
        }
    };

    const getInputStyle = () => {
        const baseStyle = [styles.searchInput];

        // Size variations
        if (size === 'small') baseStyle.push(styles.inputSmall);
        else if (size === 'large') baseStyle.push(styles.inputLarge);
        else baseStyle.push(styles.inputMedium);

        // Style variations
        if (style === 'minimal') baseStyle.push(styles.inputMinimal);
        else if (style === 'rounded') baseStyle.push(styles.inputRounded);
        else if (style === 'bordered') baseStyle.push(styles.inputBordered);
        else baseStyle.push(styles.inputDefault);

        return baseStyle;
    };

    const renderSuggestionItem = ({ item }: { item: SearchSuggestion }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(item)}
        >
            <View style={styles.suggestionIcon}>
                <Ionicons
                    name={
                        item.icon as any ||
                        (item.type === 'recent' ? 'time' :
                            item.type === 'trending' ? 'trending-up' :
                                item.type === 'category' ? 'grid' : 'search')
                    }
                    size={18}
                    color="#6B7280"
                />
            </View>
            <View style={styles.suggestionContent}>
                <Text style={styles.suggestionText}>{item.text}</Text>
                {item.type === 'trending' && item.count && (
                    <Text style={styles.suggestionSubText}>{item.count} searches</Text>
                )}
                {item.type === 'category' && (
                    <Text style={styles.suggestionSubText}>Category</Text>
                )}
            </View>
            <Ionicons name="arrow-up-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const renderSuggestionsModal = () => {
        if (!showSuggestionsModal) return null;

        return (
            <Modal
                visible={showSuggestionsModal}
                transparent
                animationType="none"
                onRequestClose={() => {
                    setShowSuggestionsModal(false);
                    textInputRef.current?.blur();
                }}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setShowSuggestionsModal(false);
                        textInputRef.current?.blur();
                    }}
                >
                    <Animated.View
                        style={[
                            styles.suggestionsContainer,
                            {
                                opacity: suggestionAnim,
                                transform: [{
                                    translateY: suggestionAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-20, 0],
                                    })
                                }]
                            }
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1}>
                            {/* Header */}
                            <View style={styles.suggestionsHeader}>
                                <View style={styles.suggestionsHeaderContent}>
                                    <Text style={styles.suggestionsTitle}>
                                        {searchText ? 'Suggestions' : 'Popular Searches'}
                                    </Text>
                                    {recentSearches.length > 0 && !searchText && (
                                        <TouchableOpacity onPress={clearRecentSearches}>
                                            <Text style={styles.clearAllText}>Clear All</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Suggestions List */}
                            <FlatList
                                data={filteredSuggestions}
                                renderItem={renderSuggestionItem}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                style={styles.suggestionsList}
                                ListEmptyComponent={() => (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="search" size={48} color="#9CA3AF" />
                                        <Text style={styles.emptyStateText}>No suggestions found</Text>
                                    </View>
                                )}
                                ListHeaderComponent={
                                    !searchText && recentSearches.length > 0 ? (
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionHeaderText}>Recent Searches</Text>
                                        </View>
                                    ) : null
                                }
                            />

                            {/* Quick Actions */}
                            <View style={styles.quickActions}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.quickActionsContent}>
                                        {showVoice && (
                                            <TouchableOpacity
                                                style={styles.quickActionButton}
                                                onPress={() => {
                                                    onVoicePress?.();
                                                    setShowSuggestionsModal(false);
                                                }}
                                            >
                                                <Ionicons name="mic" size={16} color="#0071CE" />
                                                <Text style={styles.quickActionText}>Voice Search</Text>
                                            </TouchableOpacity>
                                        )}

                                        {showBarcode && (
                                            <TouchableOpacity
                                                style={styles.quickActionButtonGreen}
                                                onPress={() => {
                                                    onBarcodePress?.();
                                                    setShowSuggestionsModal(false);
                                                }}
                                            >
                                                <Ionicons name="barcode" size={16} color="#059669" />
                                                <Text style={styles.quickActionTextGreen}>Scan Barcode</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={styles.quickActionButtonPurple}
                                            onPress={() => {
                                                router.push('/categories');
                                                setShowSuggestionsModal(false);
                                            }}
                                        >
                                            <Ionicons name="grid" size={16} color="#7C3AED" />
                                            <Text style={styles.quickActionTextPurple}>Browse Categories</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View
                style={[
                    ...getInputStyle(),
                    {
                        backgroundColor: isFocused ? '#FFFFFF' : backgroundColor,
                        borderColor: isFocused ? '#0071CE' : borderColor,
                    }
                ]}
            >
                <Ionicons name="search" size={20} color={placeholderColor} />

                <TextInput
                    ref={textInputRef}
                    style={[styles.textInput, { color: textColor }]}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor}
                    value={searchText}
                    onChangeText={handleTextChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onSubmitEditing={() => handleSearch()}
                    returnKeyType="search"
                    autoFocus={autoFocus}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Clear Button */}
                {searchText.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            setSearchText('');
                            onChangeText?.('');
                        }}
                    >
                        <Ionicons name="close-circle" size={18} color={placeholderColor} />
                    </TouchableOpacity>
                )}

                {/* Voice Search */}
                {showVoice && !searchText && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onVoicePress}
                    >
                        <Ionicons name="mic" size={20} color="#0071CE" />
                    </TouchableOpacity>
                )}

                {/* Barcode Scanner */}
                {showBarcode && !searchText && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onBarcodePress}
                    >
                        <Ionicons name="barcode" size={20} color="#059669" />
                    </TouchableOpacity>
                )}

                {/* Filters */}
                {showFilters && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onFiltersPress}
                    >
                        <View style={styles.filterIconContainer}>
                            <Ionicons name="options" size={20} color="#6B7280" />
                            {filterCount > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>
                                        {filterCount > 9 ? '9+' : filterCount.toString()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {/* Suggestions Modal */}
            {renderSuggestionsModal()}
        </View>
    );
}

// Preset configurations
export const SearchBarPresets = {
    default: {
        style: 'default' as const,
        size: 'medium' as const,
        showSuggestions: true,
    },

    minimal: {
        style: 'minimal' as const,
        size: 'small' as const,
        showSuggestions: false,
        backgroundColor: 'transparent',
    },

    home: {
        style: 'rounded' as const,
        size: 'large' as const,
        showSuggestions: true,
        showVoice: true,
        showBarcode: true,
        placeholder: 'What are you looking for?',
    },

    category: {
        style: 'default' as const,
        size: 'medium' as const,
        showFilters: true,
        showSuggestions: true,
        placeholder: 'Search in this category',
    },
};

const styles = StyleSheet.create({
    // Main Container
    container: {
        position: 'relative',
    },

    // Search Input Styles
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    // Size Variants
    inputSmall: {
        height: 40,
    },
    inputMedium: {
        height: 48,
    },
    inputLarge: {
        height: 56,
    },

    // Style Variants
    inputDefault: {
        borderRadius: 8,
    },
    inputMinimal: {
        borderRadius: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 2,
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    inputRounded: {
        borderRadius: 24,
    },
    inputBordered: {
        borderRadius: 8,
        borderWidth: 2,
    },

    // Text Input
    textInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        paddingVertical: 0,
    },

    // Action Buttons
    clearButton: {
        padding: 4,
    },
    actionButton: {
        marginLeft: 8,
        padding: 4,
    },

    // Filter Badge
    filterIconContainer: {
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        marginTop: 80,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        maxHeight: '70%',
    },

    // Suggestions Header
    suggestionsHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    suggestionsHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    suggestionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    clearAllText: {
        color: '#0071CE',
        fontWeight: '600',
        fontSize: 14,
    },

    // Suggestions List
    suggestionsList: {
        maxHeight: 400,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionText: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 16,
    },
    suggestionSubText: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 2,
    },

    // Section Header
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionHeaderText: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 13,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        color: '#9CA3AF',
        marginTop: 8,
        fontSize: 14,
    },

    // Quick Actions
    quickActions: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        padding: 16,
    },
    quickActionsContent: {
        flexDirection: 'row',
    },
    quickActionButton: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    quickActionButtonGreen: {
        backgroundColor: '#ECFDF5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    quickActionButtonPurple: {
        backgroundColor: '#F3E8FF',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    quickActionText: {
        color: '#0071CE',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
    quickActionTextGreen: {
        color: '#059669',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
    quickActionTextPurple: {
        color: '#7C3AED',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
});