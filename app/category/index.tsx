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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import unified system - FIXED IMPORTS
import { useCartStore } from '../../store/slices/cartSlice';
import {
    ALL_PRODUCTS,
    getAllFeaturedProducts,
    getAllSaleProducts,
    getProductsByCategory,
    CATEGORIES
} from '../../constants/products';
import { getBannerImage } from '../../assets/images/imageLoader';

// Create category images mapping using your banner images
const getCategoryImage = (categorySlug: string) => {
    const imageMap: { [key: string]: string } = {
        'electronics': 'banner_01',
        'fashion': 'banner_02',
        'home-garden': 'banner_03',
        'health-beauty': 'banner_05',
        'baby-kids': 'banner_07',
        'sports-outdoors': 'banner_08',
    };

    return getBannerImage(imageMap[categorySlug] || 'banner_01');
};

export default function CategoriesScreen(): JSX.Element {
    const { name } = useLocalSearchParams<{ name?: string }>();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categoriesWithCounts, setCategoriesWithCounts] = useState<any[]>([]);

    // Zustand cart store
    const cartItems = useCartStore((state) => state.items);
    const summary = useCartStore((state) => state.summary);
    const calculateSummary = useCartStore((state) => state.calculateSummary);

    useEffect(() => {
        calculateSummary();
    }, [cartItems, calculateSummary]);

    useEffect(() => {
        if (name) {
            setSelectedCategory(name);
        }

        // Calculate real product counts for each category
        updateCategoryCounts();
    }, [name]);

    // FIXED: Update category counts using unified system
    const updateCategoryCounts = () => {
        const categoriesArray = Object.values(CATEGORIES).map(category => {
            const products = getProductsByCategory(Object.keys(CATEGORIES).find(key =>
                CATEGORIES[key as keyof typeof CATEGORIES].name === category.name
            ) as keyof typeof CATEGORIES);

            return {
                id: Object.keys(CATEGORIES).find(key => CATEGORIES[key as keyof typeof CATEGORIES].name === category.name),
                name: category.name,
                description: category.name, // You can enhance this with proper descriptions
                icon: category.icon,
                color: category.color,
                slug: Object.keys(CATEGORIES).find(key => CATEGORIES[key as keyof typeof CATEGORIES].name === category.name),
                itemCount: products.length,
                featured: products.some(product => product.featured),
            };
        });

        setCategoriesWithCounts(categoriesArray);
    };

    const handleCategoryPress = (category: any) => {
        console.log('✅ Navigating to category with slug:', category.slug);
        router.push(`/category/${category.slug}`);
    };

    const renderCategory = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.categoryImageContainer}>
                <Image
                    source={getCategoryImage(item.slug)}
                    style={styles.categoryImage}
                    resizeMode="cover"
                />
                <View style={[styles.categoryOverlay, { backgroundColor: `${item.color}CC` }]}>
                    <Ionicons name={item.icon} size={32} color="#FFFFFF" />
                </View>
            </View>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDescription}>
                    {item.description || `Shop ${item.name.toLowerCase()} products`}
                </Text>
                <Text style={styles.categoryCount}>
                    {item.itemCount.toLocaleString()} items
                </Text>
            </View>
            <View style={styles.categoryArrow}>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    const renderFeaturedCategories = () => {
        const featuredCategories = categoriesWithCounts.filter(cat => cat.featured);

        return (
            <View style={styles.featuredSection}>
                <Text style={styles.featuredTitle}>Featured Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.featuredGrid}>
                        {featuredCategories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.featuredCard, { backgroundColor: `${category.color}15` }]}
                                onPress={() => handleCategoryPress(category)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.featuredIcon, { backgroundColor: category.color }]}>
                                    <Ionicons name={category.icon} size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.featuredName}>{category.name}</Text>
                                <Text style={styles.featuredCount}>{category.itemCount} items</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderQuickStats = () => {
        const totalItems = categoriesWithCounts.reduce((sum, cat) => sum + cat.itemCount, 0);
        const featuredCount = categoriesWithCounts.filter(cat => cat.featured).length;

        return (
            <View style={styles.statsSection}>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{categoriesWithCounts.length}</Text>
                        <Text style={styles.statLabel}>Categories</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{totalItems.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Total Items</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{featuredCount}</Text>
                        <Text style={styles.statLabel}>Featured</Text>
                    </View>
                </View>
            </View>
        );
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

                <Text style={styles.headerTitle}>
                    {selectedCategory ?
                        `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Category` :
                        'All Categories'
                    }
                </Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => router.push('/(tabs)/search')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="search" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => router.push('/(modals)/cart')}
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

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Categories Header */}
                <View style={styles.categoriesHeader}>
                    <Text style={styles.categoriesTitle}>Shop by Category</Text>
                    <Text style={styles.categoriesSubtitle}>
                        Find everything you need in our organized categories
                    </Text>
                </View>

                {/* Quick Stats */}
                {renderQuickStats()}

                {/* Featured Categories */}
                {renderFeaturedCategories()}

                {/* All Categories Section */}
                <View style={styles.allCategoriesSection}>
                    <Text style={styles.sectionTitle}>All Categories</Text>
                    <View style={styles.categoriesList}>
                        {categoriesWithCounts.map((category) => (
                            <View key={category.id}>
                                {renderCategory({ item: category })}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Browse by Popular Categories */}
                <View style={styles.popularSection}>
                    <Text style={styles.sectionTitle}>Popular This Week</Text>
                    <Text style={styles.sectionSubtitle}>Most browsed categories</Text>

                    <View style={styles.popularGrid}>
                        {categoriesWithCounts
                            .sort((a, b) => b.itemCount - a.itemCount)
                            .slice(0, 4)
                            .map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={styles.popularCard}
                                    onPress={() => handleCategoryPress(category)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.popularIconContainer, { backgroundColor: `${category.color}20` }]}>
                                        <Ionicons name={category.icon} size={20} color={category.color} />
                                    </View>
                                    <Text style={styles.popularName}>{category.name}</Text>
                                    <Text style={styles.popularCount}>{category.itemCount}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </View>

                {/* Bottom Actions */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={styles.browseAllButton}
                        onPress={() => router.push('/product')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.browseAllText}>Browse All Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dealsButton}
                        onPress={() => router.push('/product?filter=flash-deals')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="flash-outline" size={20} color="#0071CE" />
                        <Text style={styles.dealsText}>View Flash Deals</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

// Keep all your existing styles - they're perfect!
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchButton: {
        padding: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    cartButton: {
        padding: 8,
        borderRadius: 20,
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
    },
    cartBadgeText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '700',
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Categories Header
    categoriesHeader: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    },
    categoriesTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    categoriesSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },

    // Quick Stats
    statsSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0071CE',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Featured Section
    featuredSection: {
        paddingBottom: 24,
    },
    featuredTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    featuredGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    featuredCard: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginRight: 16,
        minWidth: 120,
    },
    featuredIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    featuredName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 4,
    },
    featuredCount: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },

    // All Categories Section
    allCategoriesSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    categoriesList: {
        // Container for all categories
    },
    categoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    categoryImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
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
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    categoryArrow: {
        marginLeft: 8,
    },

    // Popular Section
    popularSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    popularGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    popularCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    popularIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    popularName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 4,
    },
    popularCount: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Bottom Actions
    bottomActions: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    browseAllButton: {
        flex: 1,
        backgroundColor: '#0071CE',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    browseAllText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    dealsButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0071CE',
    },
    dealsText: {
        color: '#0071CE',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 32,
    },
});