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
    ActivityIndicator,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

// ✅ FIXED - Import from correct path with new CSV system
import {
    ALL_PRODUCTS,
    ALL_CATEGORIES,
    Product,
    getProductsByCategory
} from '../../constants/products/data';

const { width: screenWidth } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Enhanced Walmart brand colors
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
    backgroundGray: '#F8FAFC',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
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
    freeShipping: boolean;
}

const shippingOptions = [
    { id: 'free', label: 'Free shipping', icon: 'gift-outline' },
    { id: 'pickup', label: 'Free pickup', icon: 'storefront-outline' },
    { id: 'sameday', label: 'Same day delivery', icon: 'flash-outline' },
    { id: 'nextday', label: 'Next day delivery', icon: 'time-outline' },
];

const ratings = [
    { stars: 4, label: '4 stars & up' },
    { stars: 3, label: '3 stars & up' },
    { stars: 2, label: '2 stars & up' },
    { stars: 1, label: '1 star & up' },
];

const sortOptions = [
    { id: 'relevance', label: 'Best Match' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Customer Rating' },
    { id: 'newest', label: 'Newest First' },
    { id: 'bestseller', label: 'Best Sellers' },
];

export default function FilterModal(): JSX.Element {
    const {
        category: initialCategory,
        search: searchQuery,
        subcategory: initialSubcategory,
    } = useLocalSearchParams<{
        category?: string;
        search?: string;
        subcategory?: string;
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
        freeShipping: false,
    });

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: false,
        price: true,
        rating: false,
        shipping: false,
        features: false,
        sort: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [showPreview, setShowPreview] = useState(false);
    const [previewCount, setPreviewCount] = useState(0);

    const bounceValue = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // ✅ FIXED - Extract categories from unified CSV system
    const availableCategories = useMemo(() => {
        return ALL_CATEGORIES.map((category) => ({
            id: category.slug,
            name: category.name,
            icon: category.icon || 'cube-outline',
            color: category.color || COLORS.walmartBlue,
            count: category.productCount || 0
        }));
    }, []);

    // ✅ ENHANCED - Extract brands from actual product data with better sorting
    const availableBrands = useMemo(() => {
        const brandCounts = ALL_PRODUCTS.reduce((acc, product) => {
            if (product.brand && product.brand.trim()) {
                const brand = product.brand.trim();
                acc[brand] = (acc[brand] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(brandCounts)
            .map(([brand, count]) => ({ brand, count }))
            .sort((a, b) => {
                // Sort by count first, then alphabetically
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.brand.localeCompare(b.brand);
            })
            .slice(0, 50); // Top 50 brands
    }, []);

    // ✅ ENHANCED - Calculate price range from actual products with better logic
    const priceRange = useMemo(() => {
        const prices = ALL_PRODUCTS
            .map(p => p.price)
            .filter(price => price > 0 && price < 10000); // Filter unrealistic prices

        if (prices.length === 0) {
            return { min: 0, max: 500 };
        }

        const sortedPrices = prices.sort((a, b) => a - b);
        // Use 95th percentile for max to avoid outliers
        const maxIndex = Math.floor(sortedPrices.length * 0.95);

        return {
            min: Math.floor(sortedPrices[0]),
            max: Math.ceil(sortedPrices[maxIndex] || sortedPrices[sortedPrices.length - 1])
        };
    }, []);

    // ✅ ENHANCED - Preview filtered results count
    const getFilteredProductsCount = useCallback(() => {
        let filteredProducts = [...ALL_PRODUCTS];

        // Apply category filters
        if (filters.categories.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
                filters.categories.includes(product.category)
            );
        }

        // Apply brand filters
        if (filters.brands.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
                filters.brands.includes(product.brand)
            );
        }

        // Apply price range
        filteredProducts = filteredProducts.filter(product =>
            product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
        );

        // Apply rating filter
        if (filters.rating !== null) {
            filteredProducts = filteredProducts.filter(product =>
                product.rating >= filters.rating!
            );
        }

        // Apply feature filters
        if (filters.inStock) {
            filteredProducts = filteredProducts.filter(product => product.inStock);
        }

        if (filters.onSale) {
            filteredProducts = filteredProducts.filter(product =>
                product.originalPrice && product.originalPrice > product.price
            );
        }

        if (filters.featured) {
            filteredProducts = filteredProducts.filter(product => product.featured);
        }

        if (filters.freeShipping) {
            filteredProducts = filteredProducts.filter(product => product.freeShipping);
        }

        return filteredProducts.length;
    }, [filters]);

    // ✅ ENHANCED - Real-time preview updates
    useEffect(() => {
        const count = getFilteredProductsCount();
        setPreviewCount(count);
    }, [filters, getFilteredProductsCount]);

    // ✅ ENHANCED - Entrance animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
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
            freeShipping: false,
        };

        setFilters(clearedFilters);
        saveFilters(clearedFilters);
        setSortBy('relevance');
    }, [priceRange]);

    // ✅ FIXED - Enhanced route navigation with proper paths
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
            if (filters.freeShipping) {
                filterParams.set('freeShipping', 'true');
            }
            if (sortBy !== 'relevance') {
                filterParams.set('sort', sortBy);
            }
            if (searchQuery) {
                filterParams.set('search', searchQuery);
            }
            if (initialSubcategory) {
                filterParams.set('subcategory', initialSubcategory);
            }

            console.log('Applied filters:', filters);
            console.log('Filter URL params:', filterParams.toString());

            // ✅ FIXED - Enhanced route navigation logic
            let baseUrl: string;

            if (searchQuery) {
                // If there's a search query, go to search results
                baseUrl = '/(tabs)/search';
            } else if (filters.categories.length === 1) {
                // If only one category selected, go to category page
                baseUrl = `/category/${filters.categories[0]}`;
            } else {
                // Otherwise go to general product listing
                baseUrl = '/(tabs)/product';
            }

            const fullUrl = filterParams.toString()
                ? `${baseUrl}?${filterParams.toString()}`
                : baseUrl;

            // Dismiss modal first, then navigate
            router.dismiss();

            // Small delay to ensure smooth transition
            setTimeout(() => {
                router.push(fullUrl);
            }, 100);

        } catch (error) {
            console.error('Error applying filters:', error);
            Alert.alert('Error', 'Failed to apply filters. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, searchQuery, priceRange, sortBy, initialSubcategory]);

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
            (filters.freeShipping ? 1 : 0) +
            (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max ? 1 : 0) +
            (sortBy !== 'relevance' ? 1 : 0)
        );
    }, [filters, priceRange, sortBy]);

    // ✅ ENHANCED - Filter section component with animations
    const FilterSection = ({
                               title,
                               sectionKey,
                               children,
                               badge
                           }: {
        title: string;
        sectionKey: keyof typeof expandedSections;
        children: React.ReactNode;
        badge?: number;
    }) => (
        <View style={styles.filterSection}>
            <TouchableOpacity
                style={styles.filterSectionHeader}
                onPress={() => toggleSection(sectionKey)}
                activeOpacity={0.7}
            >
                <View style={styles.filterSectionTitleContainer}>
                    <Text style={styles.filterSectionTitle}>{title}</Text>
                    {badge !== undefined && badge > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{badge}</Text>
                        </View>
                    )}
                </View>
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
                <Animated.View
                    style={[
                        styles.filterSectionContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {children}
                </Animated.View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.walmartBlue} barStyle="light-content" />

            {/* ✅ ENHANCED - Header with gradient background */}
            <SafeAreaView style={styles.headerSafeArea}>
                <BlurView intensity={95} style={styles.headerBlur}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => router.dismiss()}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Filters & Sort</Text>
                        </View>
                        <TouchableOpacity
                            onPress={clearAllFilters}
                            style={styles.clearButton}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </SafeAreaView>

            {/* ✅ ENHANCED - Preview bar */}
            <View style={styles.previewBar}>
                <View style={styles.previewContent}>
                    <Text style={styles.previewText}>
                        {previewCount.toLocaleString()} products found
                    </Text>
                    {getActiveFiltersCount() > 0 && (
                        <View style={styles.activeFiltersIndicator}>
                            <Ionicons name="filter" size={14} color={COLORS.walmartBlue} />
                            <Text style={styles.activeFiltersText}>
                                {getActiveFiltersCount()} active
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View
                    style={[
                        styles.filtersContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* ✅ ENHANCED - Sort Options */}
                    <FilterSection title="Sort By" sectionKey="sort" badge={sortBy !== 'relevance' ? 1 : 0}>
                        <View style={styles.sortGrid}>
                            {sortOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.sortOption,
                                        sortBy === option.id && styles.sortOptionSelected
                                    ]}
                                    onPress={() => setSortBy(option.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.sortOptionText,
                                            sortBy === option.id && styles.sortOptionTextSelected
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {sortBy === option.id && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={18}
                                            color={COLORS.walmartBlue}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FilterSection>

                    {/* Categories */}
                    <FilterSection title="Categories" sectionKey="categories" badge={filters.categories.length}>
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
                                            name={category.icon as any}
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

                    {/* ✅ ENHANCED - Price Range with dual slider */}
                    <FilterSection title="Price Range" sectionKey="price"
                                   badge={filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max ? 1 : 0}>
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
                                                priceRange: [
                                                    Math.max(Math.min(value, prev.priceRange[1] - 1), priceRange.min),
                                                    prev.priceRange[1]
                                                ],
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
                                                priceRange: [
                                                    prev.priceRange[0],
                                                    Math.min(Math.max(value, prev.priceRange[0] + 1), priceRange.max)
                                                ],
                                            }));
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={styles.sliderContainer}>
                                <Text style={styles.sliderLabel}>Min: ${filters.priceRange[0]}</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={priceRange.min}
                                    maximumValue={filters.priceRange[1] - 1}
                                    value={filters.priceRange[0]}
                                    minimumTrackTintColor={COLORS.walmartBlue}
                                    maximumTrackTintColor={COLORS.borderColor}
                                    thumbStyle={styles.sliderThumb}
                                    onValueChange={(value) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            priceRange: [Math.round(value), prev.priceRange[1]],
                                        }));
                                    }}
                                />

                                <Text style={styles.sliderLabel}>Max: ${filters.priceRange[1]}</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={filters.priceRange[0] + 1}
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
                    <FilterSection title="Customer Rating" sectionKey="rating" badge={filters.rating ? 1 : 0}>
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

                    {/* ✅ ENHANCED - Brands with search */}
                    <FilterSection title="Brands" sectionKey="brands" badge={filters.brands.length}>
                        <View>
                            {availableBrands.slice(0, expandedSections.brands ? availableBrands.length : 10).map((brandData) => (
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
                            {availableBrands.length > 10 && (
                                <TouchableOpacity
                                    style={styles.showMoreButton}
                                    onPress={() => toggleSection('brands')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.showMoreText}>
                                        {expandedSections.brands ? 'Show Less' : `Show More (${availableBrands.length - 10} more)`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </FilterSection>

                    {/* ✅ ENHANCED - Shipping Options with icons */}
                    <FilterSection title="Shipping" sectionKey="shipping" badge={filters.shipping.length}>
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
                                    <Ionicons
                                        name={option.icon as any}
                                        size={18}
                                        color={COLORS.textSecondary}
                                        style={styles.shippingIcon}
                                    />
                                    <Text style={styles.checkboxLabel}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FilterSection>

                    {/* ✅ ENHANCED - Special Features with better layout */}
                    <FilterSection title="Special Features" sectionKey="features"
                                   badge={[filters.inStock, filters.onSale, filters.newArrivals, filters.featured, filters.freeShipping].filter(Boolean).length}>
                        <View>
                            <View style={styles.switchOption}>
                                <View style={styles.switchLabelContainer}>
                                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
                                    <Text style={styles.switchLabel}>In Stock Only</Text>
                                </View>
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
                                <View style={styles.switchLabelContainer}>
                                    <Ionicons name="pricetag-outline" size={20} color={COLORS.error} />
                                    <Text style={styles.switchLabel}>On Sale</Text>
                                </View>
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
                                <View style={styles.switchLabelContainer}>
                                    <Ionicons name="sparkles-outline" size={20} color={COLORS.warning} />
                                    <Text style={styles.switchLabel}>New Arrivals</Text>
                                </View>
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
                                <View style={styles.switchLabelContainer}>
                                    <Ionicons name="star-outline" size={20} color={COLORS.walmartBlue} />
                                    <Text style={styles.switchLabel}>Featured Products</Text>
                                </View>
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
                            <View style={styles.switchOption}>
                                <View style={styles.switchLabelContainer}>
                                    <Ionicons name="gift-outline" size={20} color={COLORS.success} />
                                    <Text style={styles.switchLabel}>Free Shipping</Text>
                                </View>
                                <Switch
                                    value={filters.freeShipping}
                                    onValueChange={(value) =>
                                        setFilters(prev => ({ ...prev, freeShipping: value }))
                                    }
                                    trackColor={{ false: COLORS.borderColor, true: '#BFDBFE' }}
                                    thumbColor={filters.freeShipping ? COLORS.walmartBlue : COLORS.lightGray}
                                    style={styles.switch}
                                />
                            </View>
                        </View>
                    </FilterSection>
                </Animated.View>
            </ScrollView>

            {/* ✅ ENHANCED - Apply Button with loading state and preview */}
            <SafeAreaView style={styles.applyButtonSafeArea}>
                <BlurView intensity={95} style={styles.applyButtonBlur}>
                    <View style={styles.applyButtonContainer}>
                        {/* Quick actions row */}
                        <View style={styles.quickActionsRow}>
                            <TouchableOpacity
                                style={styles.previewButton}
                                onPress={() => setShowPreview(!showPreview)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="eye-outline" size={16} color={COLORS.walmartBlue} />
                                <Text style={styles.previewButtonText}>Preview</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => saveFilters(filters)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="bookmark-outline" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.applyButton,
                                isLoading && styles.applyButtonDisabled,
                                previewCount === 0 && styles.applyButtonWarning
                            ]}
                            onPress={applyFilters}
                            disabled={isLoading}
                            activeOpacity={0.9}
                        >
                            <View style={styles.applyButtonContent}>
                                {isLoading ? (
                                    <>
                                        <ActivityIndicator size="small" color={COLORS.white} />
                                        <Text style={styles.applyButtonText}>Applying...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="search" size={18} color={COLORS.white} />
                                        <View style={styles.applyButtonTextContainer}>
                                            <Text style={styles.applyButtonText}>
                                                Show {previewCount.toLocaleString()} Results
                                            </Text>
                                            {getActiveFiltersCount() > 0 && (
                                                <Text style={styles.applyButtonSubtext}>
                                                    {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
                                                </Text>
                                            )}
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundGray,
    },

    // ✅ ENHANCED - Header styles
    headerSafeArea: {
        backgroundColor: COLORS.walmartBlue,
    },
    headerBlur: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
    },
    clearButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    clearButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },

    // ✅ ENHANCED - Preview bar
    previewBar: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        elevation: 1,
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    previewContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    previewText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    activeFiltersIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    activeFiltersText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.walmartBlue,
    },

    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    filtersContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    // ✅ ENHANCED - Filter section styles
    filterSection: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    filterSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    filterSectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    filterBadge: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    filterBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    filterSectionContent: {
        padding: 16,
    },

    // ✅ ENHANCED - Sort styles
    sortGrid: {
        gap: 8,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    sortOptionSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: COLORS.walmartBlue,
    },
    sortOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
        flex: 1,
    },
    sortOptionTextSelected: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
    },

    // Category styles
    categoryGrid: {
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    categoryChipSelected: {
        backgroundColor: COLORS.walmartBlue,
        borderColor: COLORS.walmartBlue,
        elevation: 3,
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
        marginRight: 10,
    },
    categoryChipText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    categoryChipTextSelected: {
        color: COLORS.white,
        fontWeight: '600',
    },
    categoryCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        minWidth: 24,
        textAlign: 'center',
        fontWeight: '600',
    },
    categoryCountSelected: {
        color: COLORS.walmartBlue,
        backgroundColor: COLORS.white,
    },

    // ✅ ENHANCED - Price styles
    priceContainer: {
        gap: 16,
    },
    priceInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    priceInputContainer: {
        flex: 1,
    },
    priceInputLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
        fontWeight: '600',
    },
    priceInput: {
        borderWidth: 1.5,
        borderColor: COLORS.borderColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: COLORS.lightGray,
        color: COLORS.textPrimary,
    },
    sliderContainer: {
        gap: 8,
    },
    sliderLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderThumb: {
        backgroundColor: COLORS.walmartBlue,
        width: 24,
        height: 24,
        borderRadius: 12,
        elevation: 4,
        shadowColor: COLORS.walmartBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    priceRangeIndicator: {
        alignItems: 'center',
        marginTop: 8,
    },
    priceRangeText: {
        fontSize: 16,
        color: COLORS.walmartBlue,
        fontWeight: '700',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },

    // Rating styles
    ratingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 6,
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

    // Checkbox styles
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
        fontWeight: '500',
    },
    showMoreButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    showMoreText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: 14,
    },

    // ✅ ENHANCED - Shipping styles
    shippingIcon: {
        marginRight: 8,
    },

    // ✅ ENHANCED - Switch styles
    switchOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    switchLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    switchLabel: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    switch: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },

    // ✅ ENHANCED - Apply button styles
    applyButtonSafeArea: {
        backgroundColor: 'transparent',
    },
    applyButtonBlur: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    applyButtonContainer: {
        gap: 12,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    previewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        gap: 6,
    },
    previewButtonText: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: 14,
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
        gap: 6,
    },
    saveButtonText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    applyButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        elevation: 4,
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
    applyButtonWarning: {
        backgroundColor: COLORS.warning,
    },
    applyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    applyButtonTextContainer: {
        alignItems: 'center',
    },
    applyButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 18,
    },
    applyButtonSubtext: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
});