import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    TextInput,
    StyleSheet,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import unified system
import {
    ALL_PRODUCTS,
    CATEGORIES,
    Product
} from '../../constants/products';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
};

interface FilterState {
    categories: string[];
    brands: string[];
    priceRange: [number, number];
    rating: number | null;
    shipping: string[];
    inStock: boolean;
    onSale: boolean;
    newArrivals: boolean;
    featured: boolean;
}

const shippingOptions = [
    { id: 'free', label: 'Free shipping' },
    { id: 'pickup', label: 'Free pickup' },
    { id: 'sameday', label: 'Same day delivery' },
    { id: 'nextday', label: 'Next day delivery' },
];

const ratings = [
    { stars: 4, label: '4 stars & up' },
    { stars: 3, label: '3 stars & up' },
    { stars: 2, label: '2 stars & up' },
    { stars: 1, label: '1 star & up' },
];

export default function FilterModal(): JSX.Element {
    const {
        category: initialCategory,
        search: searchQuery
    } = useLocalSearchParams<{
        category?: string;
        search?: string;
    }>();

    const [filters, setFilters] = useState<FilterState>({
        categories: initialCategory ? [initialCategory] : [],
        brands: [],
        priceRange: [0, 1000],
        rating: null,
        shipping: [],
        inStock: false,
        onSale: false,
        newArrivals: false,
        featured: false,
    });

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: false,
        price: true,
        rating: true,
        shipping: true,
        features: true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const bounceValue = useRef(new Animated.Value(0)).current;

    // Extract categories from unified system
    const availableCategories = useMemo(() => {
        return Object.entries(CATEGORIES).map(([key, category]) => ({
            id: key,
            name: category.name,
            icon: category.icon,
            color: category.color,
            count: category.products.length
        }));
    }, []);

    // Extract brands from actual product data
    const availableBrands = useMemo(() => {
        const brandCounts = ALL_PRODUCTS.reduce((acc, product) => {
            const brand = product.brand;
            acc[brand] = (acc[brand] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(brandCounts)
            .map(([brand, count]) => ({ brand, count }))
            .sort((a, b) => b.count - a.count) // Sort by popularity
            .slice(0, 20); // Top 20 brands
    }, []);

    // Calculate price range from actual products
    const priceRange = useMemo(() => {
        const prices = ALL_PRODUCTS.map(p => p.price);
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
        };
    }, []);

    useEffect(() => {
        loadSavedFilters();
    }, []);

    const loadSavedFilters = async () => {
        try {
            const savedFilters = await AsyncStorage.getItem('filter_preferences');
            if (savedFilters) {
                const parsed = JSON.parse(savedFilters);
                setFilters(prevFilters => ({
                    ...parsed,
                    // Keep URL-provided category if exists
                    categories: initialCategory ? [initialCategory] : parsed.categories || [],
                    // Reset price range to current product range
                    priceRange: [priceRange.min, priceRange.max]
                }));
            } else {
                // Set default price range
                setFilters(prev => ({
                    ...prev,
                    priceRange: [priceRange.min, priceRange.max]
                }));
            }
        } catch (error) {
            console.error('Error loading saved filters:', error);
        }
    };

    const saveFilters = async (filtersToSave: FilterState) => {
        try {
            await AsyncStorage.setItem('filter_preferences', JSON.stringify(filtersToSave));
        } catch (error) {
            console.error('Error saving filters:', error);
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        LayoutAnimation.configureNext({
            duration: 300,
            create: { type: 'easeInEaseOut', property: 'opacity' },
            update: { type: 'easeInEaseOut' },
        });

        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleCategory = useCallback((categoryId: string) => {
        // Add haptic feedback animation
        Animated.sequence([
            Animated.timing(bounceValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(bounceValue, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(c => c !== categoryId)
                : [...prev.categories, categoryId],
        }));
    }, [bounceValue]);

    const toggleBrand = useCallback((brand: string) => {
        setFilters(prev => ({
            ...prev,
            brands: prev.brands.includes(brand)
                ? prev.brands.filter(b => b !== brand)
                : [...prev.brands, brand],
        }));
    }, []);

    const toggleShipping = useCallback((option: string) => {
        setFilters(prev => ({
            ...prev,
            shipping: prev.shipping.includes(option)
                ? prev.shipping.filter(s => s !== option)
                : [...prev.shipping, option],
        }));
    }, []);

    const clearAllFilters = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const clearedFilters: FilterState = {
            categories: [],
            brands: [],
            priceRange: [priceRange.min, priceRange.max],
            rating: null,
            shipping: [],
            inStock: false,
            onSale: false,
            newArrivals: false,
            featured: false,
        };

        setFilters(clearedFilters);
        saveFilters(clearedFilters);
    }, [priceRange]);

    const applyFilters = useCallback(async () => {
        setIsLoading(true);
        try {
            // Save current filters
            await saveFilters(filters);

            // Build filter URL parameters
            const filterParams = new URLSearchParams();

            if (filters.categories.length > 0) {
                filterParams.set('categories', filters.categories.join(','));
            }
            if (filters.brands.length > 0) {
                filterParams.set('brands', filters.brands.join(','));
            }
            if (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max) {
                filterParams.set('priceMin', filters.priceRange[0].toString());
                filterParams.set('priceMax', filters.priceRange[1].toString());
            }
            if (filters.rating !== null) {
                filterParams.set('rating', filters.rating.toString());
            }
            if (filters.shipping.length > 0) {
                filterParams.set('shipping', filters.shipping.join(','));
            }
            if (filters.inStock) {
                filterParams.set('inStock', 'true');
            }
            if (filters.onSale) {
                filterParams.set('onSale', 'true');
            }
            if (filters.newArrivals) {
                filterParams.set('newArrivals', 'true');
            }
            if (filters.featured) {
                filterParams.set('featured', 'true');
            }
            if (searchQuery) {
                filterParams.set('search', searchQuery);
            }

            console.log('Applied filters:', filters);
            console.log('Filter URL params:', filterParams.toString());

            // Navigate to filtered results
            const baseUrl = searchQuery ? '/(tabs)/search' : '/product';  // ✅ FIXED - Updated route
            const fullUrl = filterParams.toString()
                ? `${baseUrl}?${filterParams.toString()}`
                : baseUrl;

            router.dismiss();
            router.push(fullUrl);

        } catch (error) {
            console.error('Error applying filters:', error);
            Alert.alert('Error', 'Failed to apply filters');
        } finally {
            setIsLoading(false);
        }
    }, [filters, searchQuery, priceRange]);

    const getActiveFiltersCount = useCallback(() => {
        return (
            filters.categories.length +
            filters.brands.length +
            filters.shipping.length +
            (filters.rating ? 1 : 0) +
            (filters.inStock ? 1 : 0) +
            (filters.onSale ? 1 : 0) +
            (filters.newArrivals ? 1 : 0) +
            (filters.featured ? 1 : 0) +
            (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max ? 1 : 0)
        );
    }, [filters, priceRange]);

    const FilterSection = ({
                               title,
                               sectionKey,
                               children
                           }: {
        title: string;
        sectionKey: keyof typeof expandedSections;
        children: React.ReactNode;
    }) => (
        <View style={styles.filterSection}>
            <TouchableOpacity
                style={styles.filterSectionHeader}
                onPress={() => toggleSection(sectionKey)}
                activeOpacity={0.7}
            >
                <Text style={styles.filterSectionTitle}>{title}</Text>
                <Animated.View style={{
                    transform: [{
                        rotate: expandedSections[sectionKey] ? '180deg' : '0deg'
                    }]
                }}>
                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color={COLORS.textSecondary}
                    />
                </Animated.View>
            </TouchableOpacity>
            {expandedSections[sectionKey] && (
                <View style={styles.filterSectionContent}>
                    {children}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => router.dismiss()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Filters</Text>
                </View>
                <TouchableOpacity
                    onPress={clearAllFilters}
                    style={styles.clearButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.filtersContainer}>
                    {/* Categories */}
                    <FilterSection title="Categories" sectionKey="categories">
                        <View style={styles.categoryGrid}>
                            {availableCategories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryChip,
                                        filters.categories.includes(category.id) && styles.categoryChipSelected
                                    ]}
                                    onPress={() => toggleCategory(category.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.categoryChipContent}>
                                        <Ionicons
                                            name={category.icon}
                                            size={16}
                                            color={filters.categories.includes(category.id) ? COLORS.white : category.color}
                                            style={styles.categoryIcon}
                                        />
                                        <Text
                                            style={[
                                                styles.categoryChipText,
                                                filters.categories.includes(category.id) && styles.categoryChipTextSelected
                                            ]}
                                        >
                                            {category.name}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.categoryCount,
                                            filters.categories.includes(category.id) && styles.categoryCountSelected
                                        ]}
                                    >
                                        {category.count}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FilterSection>

                    {/* Price Range */}
                    <FilterSection title="Price Range" sectionKey="price">
                        <View style={styles.priceContainer}>
                            <View style={styles.priceInputRow}>
                                <View style={styles.priceInputContainer}>
                                    <Text style={styles.priceInputLabel}>Min Price</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        value={`$${filters.priceRange[0]}`}
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            const value = parseInt(text.replace('$', '')) || priceRange.min;
                                            setFilters(prev => ({
                                                ...prev,
                                                priceRange: [Math.max(value, priceRange.min), prev.priceRange[1]],
                                            }));
                                        }}
                                    />
                                </View>
                                <View style={styles.priceInputContainer}>
                                    <Text style={styles.priceInputLabel}>Max Price</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        value={`$${filters.priceRange[1]}`}
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            const value = parseInt(text.replace('$', '')) || priceRange.max;
                                            setFilters(prev => ({
                                                ...prev,
                                                priceRange: [prev.priceRange[0], Math.min(value, priceRange.max)],
                                            }));
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={styles.sliderContainer}>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={priceRange.min}
                                    maximumValue={priceRange.max}
                                    value={filters.priceRange[1]}
                                    minimumTrackTintColor={COLORS.walmartBlue}
                                    maximumTrackTintColor={COLORS.borderColor}
                                    thumbStyle={styles.sliderThumb}
                                    onValueChange={(value) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            priceRange: [prev.priceRange[0], Math.round(value)],
                                        }));
                                    }}
                                />
                                <View style={styles.priceRangeIndicator}>
                                    <Text style={styles.priceRangeText}>
                                        ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </FilterSection>

                    {/* Customer Rating */}
                    <FilterSection title="Customer Rating" sectionKey="rating">
                        <View>
                            {ratings.map((rating) => (
                                <TouchableOpacity
                                    key={rating.stars}
                                    style={[
                                        styles.ratingOption,
                                        filters.rating === rating.stars && styles.ratingOptionSelected
                                    ]}
                                    onPress={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            rating: prev.rating === rating.stars ? null : rating.stars,
                                        }));
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.starsContainer}>
                                        {[...Array(5)].map((_, i) => (
                                            <Ionicons
                                                key={i}
                                                name="star"
                                                size={16}
                                                color={i < rating.stars ? COLORS.warning : COLORS.borderColor}
                                                style={styles.starIcon}
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.ratingLabel}>
                                        {rating.label}
                                    </Text>
                                    {filters.rating === rating.stars && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color={COLORS.walmartBlue}
                                            style={styles.checkmarkIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FilterSection>

                    {/* Brands */}
                    <FilterSection title="Brands" sectionKey="brands">
                        <View>
                            {availableBrands.slice(0, expandedSections.brands ? availableBrands.length : 8).map((brandData) => (
                                <TouchableOpacity
                                    key={brandData.brand}
                                    style={styles.checkboxOption}
                                    onPress={() => toggleBrand(brandData.brand)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            filters.brands.includes(brandData.brand) && styles.checkboxSelected
                                        ]}
                                    >
                                        {filters.brands.includes(brandData.brand) && (
                                            <Ionicons name="checkmark" size={12} color={COLORS.white} />
                                        )}
                                    </View>
                                    <View style={styles.brandInfo}>
                                        <Text style={styles.checkboxLabel}>{brandData.brand}</Text>
                                        <Text style={styles.brandCount}>({brandData.count} products)</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {availableBrands.length > 8 && (
                                <TouchableOpacity
                                    style={styles.showMoreButton}
                                    onPress={() => toggleSection('brands')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.showMoreText}>
                                        {expandedSections.brands ? 'Show Less' : `Show More (${availableBrands.length - 8} more)`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </FilterSection>

                    {/* Shipping Options */}
                    <FilterSection title="Shipping" sectionKey="shipping">
                        <View>
                            {shippingOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.checkboxOption}
                                    onPress={() => toggleShipping(option.id)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            filters.shipping.includes(option.id) && styles.checkboxSelected
                                        ]}
                                    >
                                        {filters.shipping.includes(option.id) && (
                                            <Ionicons name="checkmark" size={12} color={COLORS.white} />
                                        )}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FilterSection>

                    {/* Special Features */}
                    <FilterSection title="Special Features" sectionKey="features">
                        <View>
                            <View style={styles.switchOption}>
                                <Text style={styles.switchLabel}>In Stock Only</Text>
                                <Switch
                                    value={filters.inStock}
                                    onValueChange={(value) =>
                                        setFilters(prev => ({ ...prev, inStock: value }))
                                    }
                                    trackColor={{ false: COLORS.borderColor, true: '#BFDBFE' }}
                                    thumbColor={filters.inStock ? COLORS.walmartBlue : COLORS.lightGray}
                                    style={styles.switch}
                                />
                            </View>
                            <View style={styles.switchOption}>
                                <Text style={styles.switchLabel}>On Sale</Text>
                                <Switch
                                    value={filters.onSale}
                                    onValueChange={(value) =>
                                        setFilters(prev => ({ ...prev, onSale: value }))
                                    }
                                    trackColor={{ false: COLORS.borderColor, true: '#BFDBFE' }}
                                    thumbColor={filters.onSale ? COLORS.walmartBlue : COLORS.lightGray}
                                    style={styles.switch}
                                />
                            </View>
                            <View style={styles.switchOption}>
                                <Text style={styles.switchLabel}>New Arrivals</Text>
                                <Switch
                                    value={filters.newArrivals}
                                    onValueChange={(value) =>
                                        setFilters(prev => ({ ...prev, newArrivals: value }))
                                    }
                                    trackColor={{ false: COLORS.borderColor, true: '#BFDBFE' }}
                                    thumbColor={filters.newArrivals ? COLORS.walmartBlue : COLORS.lightGray}
                                    style={styles.switch}
                                />
                            </View>
                            <View style={styles.switchOption}>
                                <Text style={styles.switchLabel}>Featured Products</Text>
                                <Switch
                                    value={filters.featured}
                                    onValueChange={(value) =>
                                        setFilters(prev => ({ ...prev, featured: value }))
                                    }
                                    trackColor={{ false: COLORS.borderColor, true: '#BFDBFE' }}
                                    thumbColor={filters.featured ? COLORS.walmartBlue : COLORS.lightGray}
                                    style={styles.switch}
                                />
                            </View>
                        </View>
                    </FilterSection>
                </View>
            </ScrollView>

            {/* Apply Button */}
            <View style={styles.applyButtonContainer}>
                <TouchableOpacity
                    style={[styles.applyButton, isLoading && styles.applyButtonDisabled]}
                    onPress={applyFilters}
                    disabled={isLoading}
                    activeOpacity={0.9}
                >
                    {isLoading ? (
                        <Text style={styles.applyButtonText}>Applying...</Text>
                    ) : (
                        <Text style={styles.applyButtonText}>
                            Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
    },
    clearButtonText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    filtersContainer: {
        paddingHorizontal: 16,
    },
    filterSection: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        marginBottom: 4,
    },
    filterSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    filterSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    filterSectionContent: {
        paddingBottom: 16,
    },
    categoryGrid: {
        gap: 8,
        marginTop: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
        marginBottom: 8,
    },
    categoryChipSelected: {
        backgroundColor: COLORS.walmartBlue,
        borderColor: COLORS.walmartBlue,
        elevation: 2,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    categoryChipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        marginRight: 8,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    categoryChipTextSelected: {
        color: COLORS.white,
    },
    categoryCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        textAlign: 'center',
    },
    categoryCountSelected: {
        color: COLORS.walmartBlue,
        backgroundColor: COLORS.white,
    },
    priceContainer: {
        marginTop: 8,
    },
    priceInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    priceInputContainer: {
        flex: 1,
    },
    priceInputLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
        fontWeight: '500',
    },
    priceInput: {
        borderWidth: 1.5,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        backgroundColor: COLORS.lightGray,
    },
    sliderContainer: {
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderThumb: {
        backgroundColor: COLORS.walmartBlue,
        width: 20,
        height: 20,
        borderRadius: 10,
        elevation: 3,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    priceRangeIndicator: {
        alignItems: 'center',
        marginTop: 8,
    },
    priceRangeText: {
        fontSize: 14,
        color: COLORS.walmartBlue,
        fontWeight: '600',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    ratingOptionSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 12,
    },
    starIcon: {
        marginRight: 2,
    },
    ratingLabel: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
        flex: 1,
    },
    checkmarkIcon: {
        marginLeft: 'auto',
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: COLORS.borderColor,
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    checkboxSelected: {
        backgroundColor: COLORS.walmartBlue,
        borderColor: COLORS.walmartBlue,
    },
    checkboxLabel: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
        flex: 1,
    },
    brandInfo: {
        flex: 1,
    },
    brandCount: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    showMoreButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    showMoreText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: 16,
    },
    switchOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    switchLabel: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
        flex: 1,
    },
    switch: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
    applyButtonContainer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        padding: 16,
        backgroundColor: COLORS.white,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    applyButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    applyButtonDisabled: {
        backgroundColor: COLORS.mediumGray,
        elevation: 0,
        shadowOpacity: 0,
    },
    applyButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
});