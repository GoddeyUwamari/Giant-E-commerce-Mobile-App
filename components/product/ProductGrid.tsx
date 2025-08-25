import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from './ProductCard';

const { width: screenWidth } = Dimensions.get('window');

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    brand?: string;
    category?: string;
    isNew?: boolean;
    isBestseller?: boolean;
    isFavorite?: boolean;
    inStock?: boolean;
    stockCount?: number;
    freeShipping?: boolean;
    fastDelivery?: boolean;
    deliveryDate?: string;
    discount?: number;
    variants?: {
        colors?: string[];
        sizes?: string[];
    };
}

interface SortOption {
    id: string;
    label: string;
    sortFn: (a: Product, b: Product) => number;
}

interface FilterOption {
    id: string;
    label: string;
    filterFn: (product: Product) => boolean;
    count?: number;
}

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    refreshing?: boolean;
    hasMore?: boolean;
    layout?: 'grid' | 'list';
    columns?: number;
    showFilters?: boolean;
    showSort?: boolean;
    showLayoutToggle?: boolean;
    emptyTitle?: string;
    emptyMessage?: string;
    onProductPress: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    onQuickView?: (product: Product) => void;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    onFilterChange?: (filters: string[]) => void;
    onSortChange?: (sortId: string) => void;
}

const SORT_OPTIONS: SortOption[] = [
    {
        id: 'featured',
        label: 'Featured',
        sortFn: (a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0),
    },
    {
        id: 'price_low',
        label: 'Price: Low to High',
        sortFn: (a, b) => a.price - b.price,
    },
    {
        id: 'price_high',
        label: 'Price: High to Low',
        sortFn: (a, b) => b.price - a.price,
    },
    {
        id: 'rating',
        label: 'Customer Rating',
        sortFn: (a, b) => b.rating - a.rating,
    },
    {
        id: 'newest',
        label: 'Newest First',
        sortFn: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0),
    },
    {
        id: 'reviews',
        label: 'Most Reviews',
        sortFn: (a, b) => b.reviewCount - a.reviewCount,
    },
];

const FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'in_stock',
        label: 'In Stock',
        filterFn: (product) => product.inStock !== false,
    },
    {
        id: 'free_shipping',
        label: 'Free Shipping',
        filterFn: (product) => product.freeShipping === true,
    },
    {
        id: 'on_sale',
        label: 'On Sale',
        filterFn: (product) => product.originalPrice && product.originalPrice > product.price,
    },
    {
        id: 'new',
        label: 'New Arrivals',
        filterFn: (product) => product.isNew === true,
    },
    {
        id: 'bestseller',
        label: 'Bestsellers',
        filterFn: (product) => product.isBestseller === true,
    },
    {
        id: 'high_rated',
        label: '4+ Stars',
        filterFn: (product) => product.rating >= 4,
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        padding: 16,
    },
    resultsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    resultsText: {
        color: '#6B7280',
        fontSize: 14,
    },
    filteredText: {
        color: '#2563EB',
    },
    layoutToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
    },
    layoutButton: {
        padding: 8,
        borderRadius: 6,
    },
    layoutButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    controlButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
    },
    controlButtonActive: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
    },
    controlButtonText: {
        marginLeft: 8,
        fontWeight: '500',
        color: '#374151',
    },
    controlButtonTextActive: {
        color: '#2563EB',
    },
    activeFiltersContainer: {
        marginTop: 12,
    },
    activeFiltersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    filterChip: {
        marginRight: 8,
        marginBottom: 8,
    },
    filterChipInner: {
        backgroundColor: '#DBEAFE',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterChipText: {
        color: '#1E40AF',
        fontSize: 12,
        fontWeight: '500',
    },
    filterChipClose: {
        marginLeft: 8,
    },
    clearAllButton: {
        marginBottom: 8,
    },
    clearAllText: {
        color: '#2563EB',
        fontSize: 12,
        fontWeight: '500',
    },
    productItemGrid: {
        flex: 1,
        marginHorizontal: 8,
    },
    productItemList: {
        paddingHorizontal: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyMessage: {
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    clearFiltersButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginTop: 16,
    },
    clearFiltersButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadMoreButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    loadMoreText: {
        color: '#374151',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    clearAllModalText: {
        color: '#2563EB',
        fontWeight: '500',
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sortOptionText: {
        color: '#111827',
        fontSize: 16,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxUnchecked: {
        borderColor: '#D1D5DB',
    },
    checkboxChecked: {
        borderColor: '#2563EB',
        backgroundColor: '#2563EB',
    },
    filterOptionText: {
        flex: 1,
        color: '#111827',
        fontSize: 16,
    },
});

export default function ProductGrid({
                                        products,
                                        loading = false,
                                        refreshing = false,
                                        hasMore = false,
                                        layout = 'grid',
                                        columns = 2,
                                        showFilters = true,
                                        showSort = true,
                                        showLayoutToggle = true,
                                        emptyTitle = 'No Products Found',
                                        emptyMessage = 'Try adjusting your filters or search terms',
                                        onProductPress,
                                        onAddToCart,
                                        onToggleFavorite,
                                        onQuickView,
                                        onRefresh,
                                        onLoadMore,
                                        onFilterChange,
                                        onSortChange,
                                    }: ProductGridProps): JSX.Element {
    const [currentLayout, setCurrentLayout] = useState(layout);
    const [selectedSort, setSelectedSort] = useState('featured');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [showSortModal, setShowSortModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products;

        // Apply filters
        if (selectedFilters.length > 0) {
            filtered = products.filter(product => {
                return selectedFilters.every(filterId => {
                    const filter = FILTER_OPTIONS.find(f => f.id === filterId);
                    return filter ? filter.filterFn(product) : true;
                });
            });
        }

        // Apply sorting
        const sortOption = SORT_OPTIONS.find(s => s.id === selectedSort);
        if (sortOption) {
            filtered = [...filtered].sort(sortOption.sortFn);
        }

        return filtered;
    }, [products, selectedFilters, selectedSort]);

    const handleSortChange = (sortId: string) => {
        setSelectedSort(sortId);
        setShowSortModal(false);
        onSortChange?.(sortId);
    };

    const handleFilterToggle = (filterId: string) => {
        const newFilters = selectedFilters.includes(filterId)
            ? selectedFilters.filter(id => id !== filterId)
            : [...selectedFilters, filterId];

        setSelectedFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const clearAllFilters = () => {
        setSelectedFilters([]);
        onFilterChange?.([]);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Results Count */}
            <View style={styles.resultsRow}>
                <Text style={styles.resultsText}>
                    {filteredAndSortedProducts.length} results
                    {selectedFilters.length > 0 && (
                        <Text style={styles.filteredText}> (filtered)</Text>
                    )}
                </Text>

                {showLayoutToggle && (
                    <View style={styles.layoutToggleContainer}>
                        {[
                            { key: 'grid', icon: 'grid' },
                            { key: 'list', icon: 'list' },
                        ].map((layoutOption) => (
                            <TouchableOpacity
                                key={layoutOption.key}
                                style={[
                                    styles.layoutButton,
                                    currentLayout === layoutOption.key && styles.layoutButtonActive,
                                ]}
                                onPress={() => setCurrentLayout(layoutOption.key as 'grid' | 'list')}
                            >
                                <Ionicons
                                    name={layoutOption.icon as any}
                                    size={20}
                                    color={currentLayout === layoutOption.key ? '#2563EB' : '#6B7280'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Filter and Sort Controls */}
            <View style={styles.controlsRow}>
                {showFilters && (
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            selectedFilters.length > 0 && styles.controlButtonActive,
                        ]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Ionicons
                            name="filter"
                            size={16}
                            color={selectedFilters.length > 0 ? '#2563EB' : '#6B7280'}
                        />
                        <Text
                            style={[
                                styles.controlButtonText,
                                selectedFilters.length > 0 && styles.controlButtonTextActive,
                            ]}
                        >
                            Filter
                            {selectedFilters.length > 0 && ` (${selectedFilters.length})`}
                        </Text>
                    </TouchableOpacity>
                )}

                {showSort && (
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Ionicons name="swap-vertical" size={16} color="#6B7280" />
                        <Text style={styles.controlButtonText}>
                            {SORT_OPTIONS.find(s => s.id === selectedSort)?.label}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Active Filters */}
            {selectedFilters.length > 0 && (
                <View style={styles.activeFiltersContainer}>
                    <View style={styles.activeFiltersRow}>
                        {selectedFilters.map((filterId) => {
                            const filter = FILTER_OPTIONS.find(f => f.id === filterId);
                            return (
                                <View key={filterId} style={styles.filterChip}>
                                    <View style={styles.filterChipInner}>
                                        <Text style={styles.filterChipText}>
                                            {filter?.label}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.filterChipClose}
                                            onPress={() => handleFilterToggle(filterId)}
                                        >
                                            <Ionicons name="close" size={14} color="#1E40AF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                        <TouchableOpacity
                            style={styles.clearAllButton}
                            onPress={clearAllFilters}
                        >
                            <Text style={styles.clearAllText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    const renderProduct = ({ item, index }: { item: Product; index: number }) => (
        <View
            style={[
                currentLayout === 'list' ? styles.productItemList : styles.productItemGrid,
                currentLayout === 'grid' && index % columns !== 0 && { marginLeft: 8 },
            ]}
        >
            <ProductCard
                product={item}
                layout={currentLayout}
                onPress={onProductPress}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                onQuickView={onQuickView}
            />
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
                {emptyTitle}
            </Text>
            <Text style={styles.emptyMessage}>
                {emptyMessage}
            </Text>
            {selectedFilters.length > 0 && (
                <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={clearAllFilters}
                >
                    <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderFooter = () => {
        if (!hasMore) return null;

        return (
            <View style={styles.footer}>
                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                    <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={onLoadMore}
                    >
                        <Text style={styles.loadMoreText}>Load More</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderSortModal = () => (
        <Modal
            visible={showSortModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSortModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sort By</Text>
                        <TouchableOpacity onPress={() => setShowSortModal(false)}>
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {SORT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.sortOption}
                                onPress={() => handleSortChange(option.id)}
                            >
                                <Text style={styles.sortOptionText}>{option.label}</Text>
                                {selectedSort === option.id && (
                                    <Ionicons name="checkmark" size={20} color="#2563EB" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderFilterModal = () => (
        <Modal
            visible={showFilterModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <View style={styles.modalHeaderActions}>
                            <TouchableOpacity onPress={clearAllFilters}>
                                <Text style={styles.clearAllModalText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView>
                        {FILTER_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.filterOption}
                                onPress={() => handleFilterToggle(option.id)}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        selectedFilters.includes(option.id)
                                            ? styles.checkboxChecked
                                            : styles.checkboxUnchecked,
                                    ]}
                                >
                                    {selectedFilters.includes(option.id) && (
                                        <Ionicons name="checkmark" size={14} color="white" />
                                    )}
                                </View>
                                <Text style={styles.filterOptionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredAndSortedProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={currentLayout === 'grid' ? columns : 1}
                key={`${currentLayout}-${columns}`}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={!loading ? renderEmptyState : null}
                ListFooterComponent={renderFooter}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2563EB']}
                        />
                    ) : undefined
                }
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.1}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    filteredAndSortedProducts.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
                }
            />

            {renderSortModal()}
            {renderFilterModal()}
        </View>
    );
}