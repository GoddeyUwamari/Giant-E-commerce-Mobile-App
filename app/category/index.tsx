import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    RefreshControl,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import unified system
import { useCartStore } from '../../store/slices/cartSlice';
import {
    ALL_PRODUCTS,
    ALL_CATEGORIES,
    getFeaturedProducts,
    Category,
    Product
} from '../../constants/products/data';

const { width: screenWidth } = Dimensions.get('window');

// Clean category image generator
const getCategoryImage = (categorySlug: string, categoryColor: string) => {
    const imageMap: { [key: string]: string } = {
        'electronics': 'https://via.placeholder.com/120x120/3B82F6/FFFFFF?text=Electronics',
        'appliances': 'https://via.placeholder.com/120x120/10B981/FFFFFF?text=Appliances',
        'home-kitchen': 'https://via.placeholder.com/120x120/F59E0B/FFFFFF?text=Kitchen',
        'automotive': 'https://via.placeholder.com/120x120/6B7280/FFFFFF?text=Auto',
        'sports-fitness': 'https://via.placeholder.com/120x120/EF4444/FFFFFF?text=Fitness',
        'grocery': 'https://via.placeholder.com/120x120/059669/FFFFFF?text=Grocery',
        'fashion': 'https://via.placeholder.com/120x120/EC4899/FFFFFF?text=Fashion',
        'beauty-grooming': 'https://via.placeholder.com/120x120/A855F7/FFFFFF?text=Beauty',
        'baby-products': 'https://via.placeholder.com/120x120/F97316/FFFFFF?text=Baby',
        'pet-supplies': 'https://via.placeholder.com/120x120/84CC16/FFFFFF?text=Pets',
        'video-games': 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=Gaming',
        'bags-luggage': 'https://via.placeholder.com/120x120/0EA5E9/FFFFFF?text=Bags',
        'cameras': 'https://via.placeholder.com/120x120/14B8A6/FFFFFF?text=Camera',
        'books': 'https://via.placeholder.com/120x120/F59E0B/FFFFFF?text=Books'
    };

    return {
        uri: imageMap[categorySlug] || `https://via.placeholder.com/120x120/${categoryColor.replace('#', '')}/FFFFFF?text=${encodeURIComponent(categorySlug.replace('-', ' '))}`
    };
};

export default function CategoriesScreen(): JSX.Element {
    const [refreshing, setRefreshing] = useState(false);

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    // Clean categories processing
    const categoriesWithCounts = useMemo(() => {
        if (!ALL_CATEGORIES || !Array.isArray(ALL_CATEGORIES)) return [];

        return ALL_CATEGORIES.map(category => {
            const categoryProducts = category.products || [];
            const saleProducts = categoryProducts.filter(product =>
                product.originalPrice && product.originalPrice > product.price
            );

            return {
                ...category,
                itemCount: categoryProducts.length,
                hasDeals: saleProducts.length > 0,
                description: category.description || `Shop ${category.name.toLowerCase()} products`
            };
        }).sort((a, b) => b.itemCount - a.itemCount);
    }, []);

    // Featured categories (top 6 by item count)
    const featuredCategories = useMemo(() => {
        return categoriesWithCounts.slice(0, 6);
    }, [categoriesWithCounts]);

    // Quick stats
    const quickStats = useMemo(() => {
        const totalItems = categoriesWithCounts.reduce((sum, cat) => sum + cat.itemCount, 0);
        const featuredProducts = getFeaturedProducts()?.length || 0;
        const saleProducts = ALL_PRODUCTS?.filter(product =>
            product.originalPrice && product.originalPrice > product.price
        ).length || 0;

        return {
            categories: categoriesWithCounts.length,
            totalItems,
            featuredProducts,
            saleProducts
        };
    }, [categoriesWithCounts]);

    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const handleCategoryPress = useCallback((category: Category) => {
        try {
            router.push(`/category/${category.slug}`);
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate to category');
        }
    }, []);

    const handleNavigationPress = useCallback((route: string) => {
        try {
            router.push(route as any);
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate');
        }
    }, []);

    // Clean featured category renderer
    const renderFeaturedCategory = (category: any) => (
        <TouchableOpacity
            key={category.id}
            style={styles.featuredCard}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.8}
        >
            <View style={[styles.featuredIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.featuredName} numberOfLines={2}>{category.name}</Text>
            <Text style={styles.featuredCount}>{category.itemCount} items</Text>
            {category.hasDeals && (
                <View style={styles.dealsIndicator}>
                    <Ionicons name="flash" size={10} color="#EF4444" />
                </View>
            )}
        </TouchableOpacity>
    );

    // Clean category card renderer
    const renderCategory = (category: any) => (
        <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.8}
        >
            <View style={styles.categoryImageContainer}>
                <Image
                    source={getCategoryImage(category.slug, category.color)}
                    style={styles.categoryImage}
                    resizeMode="cover"
                />
                <View style={[styles.categoryOverlay, { backgroundColor: `${category.color}CC` }]}>
                    <Ionicons name={category.icon} size={28} color="#FFFFFF" />
                </View>
                {category.hasDeals && (
                    <View style={styles.dealsBadge}>
                        <Text style={styles.dealsBadgeText}>DEALS</Text>
                    </View>
                )}
            </View>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription} numberOfLines={2}>
                    {category.description}
                </Text>
                <Text style={styles.categoryCount}>
                    {category.itemCount.toLocaleString()} items
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0071CE" />

            {/* Clean Header */}
            <LinearGradient colors={['#0071CE', '#004C91']} style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>All Categories</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => handleNavigationPress('/(tabs)/search')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="search" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => handleNavigationPress('/(modals)/cart')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cartIconContainer}>
                            <Ionicons name="bag-outline" size={24} color="#FFFFFF" />
                            {summary.itemCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{summary.itemCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Categories Header */}
                <View style={styles.categoriesHeader}>
                    <Text style={styles.categoriesTitle}>Browse Categories</Text>
                    <Text style={styles.categoriesSubtitle}>
                        Find everything you need in our organized categories
                    </Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Ionicons name="grid-outline" size={24} color="#0071CE" />
                                <Text style={styles.statNumber}>{quickStats.categories}</Text>
                                <Text style={styles.statLabel}>Categories</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="cube-outline" size={24} color="#10B981" />
                                <Text style={styles.statNumber}>{quickStats.totalItems.toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Total Items</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="star-outline" size={24} color="#F59E0B" />
                                <Text style={styles.statNumber}>{quickStats.featuredProducts}</Text>
                                <Text style={styles.statLabel}>Featured</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="flash-outline" size={24} color="#EF4444" />
                                <Text style={styles.statNumber}>{quickStats.saleProducts}</Text>
                                <Text style={styles.statLabel}>On Sale</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Featured Categories */}
                <View style={styles.featuredSection}>
                    <Text style={styles.featuredTitle}>Featured Categories</Text>
                    <Text style={styles.featuredSubtitle}>Most popular categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                        <View style={styles.featuredGrid}>
                            {featuredCategories.map(renderFeaturedCategory)}
                        </View>
                    </ScrollView>
                </View>

                {/* All Categories Section */}
                <View style={styles.allCategoriesSection}>
                    <Text style={styles.sectionTitle}>All Categories</Text>
                    <Text style={styles.sectionSubtitle}>Browse our complete collection</Text>

                    <View style={styles.categoriesList}>
                        {categoriesWithCounts.map(renderCategory)}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleNavigationPress('/product')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="grid-outline" size={24} color="#0071CE" />
                            <Text style={styles.quickActionText}>Browse All Products</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleNavigationPress('/product?filter=sale')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="flash-outline" size={24} color="#EF4444" />
                            <Text style={styles.quickActionText}>Flash Deals</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleNavigationPress('/product?filter=trending')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="trending-up" size={24} color="#EC4899" />
                            <Text style={styles.quickActionText}>Trending Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleNavigationPress('/product?filter=new-arrivals')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="sparkles" size={24} color="#8B5CF6" />
                            <Text style={styles.quickActionText}>New Arrivals</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchButton: {
        padding: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    cartButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FFC220',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0071CE',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    cartBadgeText: {
        color: '#000000',
        fontSize: 11,
        fontWeight: '700',
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Categories Header
    categoriesHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoriesTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    categoriesSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
        fontWeight: '500',
    },

    // Quick Stats Section
    statsSection: {
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 6,
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        textAlign: 'center',
    },

    // Featured Section
    featuredSection: {
        paddingTop: 24,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    featuredTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    featuredSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        paddingHorizontal: 20,
        fontWeight: '500',
    },
    featuredScroll: {
        paddingLeft: 20,
    },
    featuredGrid: {
        flexDirection: 'row',
        paddingRight: 20,
    },
    featuredCard: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginRight: 16,
        minWidth: 120,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featuredIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    featuredName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 4,
        lineHeight: 18,
    },
    featuredCount: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
    dealsIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        padding: 2,
    },

    // All Categories Section
    allCategoriesSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#F8FAFC',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        fontWeight: '500',
    },
    categoriesList: {
        // Container for all category cards
    },
    categoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        position: 'relative',
    },
    categoryImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    categoryImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    categoryOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dealsBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        elevation: 2,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    dealsBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryInfo: {
        flex: 1,
        paddingRight: 8,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        lineHeight: 22,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
        lineHeight: 20,
        fontWeight: '500',
    },
    categoryCount: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },

    // Quick Actions Section
    quickActionsSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#F8FAFC',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        width: '48%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 40,
        backgroundColor: '#F8FAFC',
    },
});