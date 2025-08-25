// constants/products/index.ts
// Central hub for all product categories and utilities

import { Product } from './interfaces';

// Category imports - using relative paths since index.ts is in the same directory
import electronicsData from './electronics';
import fashionData from './fashion';
import homeGardenData from './home-garden';
import healthBeautyData from './health-beauty';
import babyKidsData from './baby-kids';
import sportsOutdoorsData from './sports-outdoors';
import bannersData from './banners';

// Type imports for better developer experience
export type { Product, ProductVariant, ProductImage, ProductReview, ProductShipping, ProductFeatures } from './interfaces';

// =====================================
// CATEGORY DATA EXPORTS
// =====================================

// Electronics
export const ELECTRONICS_PRODUCTS = electronicsData.products;
export const ELECTRONICS_SUBCATEGORIES = electronicsData.subcategories;
export const electronicsHelpers = electronicsData;

// Fashion
export const FASHION_PRODUCTS = fashionData.products;
export const FASHION_SUBCATEGORIES = fashionData.subcategories;
export const fashionHelpers = fashionData;

// Home & Garden
export const HOME_GARDEN_PRODUCTS = homeGardenData.products;
export const HOME_GARDEN_SUBCATEGORIES = homeGardenData.subcategories;
export const homeGardenHelpers = homeGardenData;

// Health & Beauty
export const HEALTH_BEAUTY_PRODUCTS = healthBeautyData.products;
export const HEALTH_BEAUTY_SUBCATEGORIES = healthBeautyData.subcategories;
export const healthBeautyHelpers = healthBeautyData;

// Baby & Kids
export const BABY_KIDS_PRODUCTS = babyKidsData.products;
export const BABY_KIDS_SUBCATEGORIES = babyKidsData.subcategories;
export const babyKidsHelpers = babyKidsData;

// Sports & Outdoors
export const SPORTS_OUTDOORS_PRODUCTS = sportsOutdoorsData.products;
export const SPORTS_OUTDOORS_SUBCATEGORIES = sportsOutdoorsData.subcategories;
export const sportsOutdoorsHelpers = sportsOutdoorsData;

// Banners
export const BANNERS_DATA = bannersData.banners;
export const bannersHelpers = bannersData;

// =====================================
// COMBINED DATA COLLECTIONS
// =====================================

/**
 * All products from all categories combined
 */
export const ALL_PRODUCTS: Product[] = [
    ...ELECTRONICS_PRODUCTS,
    ...FASHION_PRODUCTS,
    ...HOME_GARDEN_PRODUCTS,
    ...HEALTH_BEAUTY_PRODUCTS,
    ...BABY_KIDS_PRODUCTS,
    ...SPORTS_OUTDOORS_PRODUCTS,
];

/**
 * All subcategories from all categories
 */
export const ALL_SUBCATEGORIES = [
    ...ELECTRONICS_SUBCATEGORIES,
    ...FASHION_SUBCATEGORIES,
    ...HOME_GARDEN_SUBCATEGORIES,
    ...HEALTH_BEAUTY_SUBCATEGORIES,
    ...BABY_KIDS_SUBCATEGORIES,
    ...SPORTS_OUTDOORS_SUBCATEGORIES,
];

/**
 * Category mapping for easy access
 */
export const CATEGORIES = {
    electronics: {
        name: 'Electronics',
        products: ELECTRONICS_PRODUCTS,
        subcategories: ELECTRONICS_SUBCATEGORIES,
        helpers: electronicsHelpers,
        icon: 'phone-portrait-outline',
        color: '#3B82F6',
    },
    fashion: {
        name: 'Fashion',
        products: FASHION_PRODUCTS,
        subcategories: FASHION_SUBCATEGORIES,
        helpers: fashionHelpers,
        icon: 'shirt-outline',
        color: '#EC4899',
    },
    'home-garden': {
        name: 'Home & Garden',
        products: HOME_GARDEN_PRODUCTS,
        subcategories: HOME_GARDEN_SUBCATEGORIES,
        helpers: homeGardenHelpers,
        icon: 'home-outline',
        color: '#059669',
    },
    'health-beauty': {
        name: 'Health & Beauty',
        products: HEALTH_BEAUTY_PRODUCTS,
        subcategories: HEALTH_BEAUTY_SUBCATEGORIES,
        helpers: healthBeautyHelpers,
        icon: 'heart-outline',
        color: '#10B981',
    },
    'baby-kids': {
        name: 'Baby & Kids',
        products: BABY_KIDS_PRODUCTS,
        subcategories: BABY_KIDS_SUBCATEGORIES,
        helpers: babyKidsHelpers,
        icon: 'baby-outline',
        color: '#F59E0B',
    },
    'sports-outdoors': {
        name: 'Sports & Outdoors',
        products: SPORTS_OUTDOORS_PRODUCTS,
        subcategories: SPORTS_OUTDOORS_SUBCATEGORIES,
        helpers: sportsOutdoorsHelpers,
        icon: 'fitness-outline',
        color: '#EF4444',
    },
} as const;

// =====================================
// UNIVERSAL HELPER FUNCTIONS
// =====================================

/**
 * Get all products across all categories
 */
export const getAllProducts = (): Product[] => {
    return ALL_PRODUCTS;
};

/**
 * Get products by category
 */
export const getProductsByCategory = (category: keyof typeof CATEGORIES): Product[] => {
    return CATEGORIES[category]?.products || [];
};

/**
 * Get product by ID across all categories
 */
export const getProductById = (id: string): Product | undefined => {
    return ALL_PRODUCTS.find(product => product.id === id);
};

/**
 * Search products across all categories
 */
export const searchAllProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) return [];

    return ALL_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm)) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Get featured products across all categories
 */
export const getAllFeaturedProducts = (): Product[] => {
    return ALL_PRODUCTS.filter(product => product.featured === true);
};

/**
 * Get featured categories for display in navigation/cart
 */
export const getFeaturedCategories = () => {
    return Object.entries(CATEGORIES).map(([slug, category]) => ({
        id: slug,
        name: category.name,
        icon: category.icon,
        color: category.color,
        slug: slug,
        description: `Shop ${category.name.toLowerCase()}`,
        itemCount: category.products.length,
        products: category.products,
        featured: category.products.some(product => product.featured),
    })).filter(category => category.featured || category.itemCount > 0);
};

/**
 * Get trending products across all categories
 */
export const getAllTrendingProducts = (): Product[] => {
    return ALL_PRODUCTS.filter(product => product.trending === true);
};

/**
 * Get products on sale across all categories
 */
export const getAllSaleProducts = (): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.originalPrice && product.price < product.originalPrice
    );
};

/**
 * Get best selling products across all categories
 */
export const getAllBestSellers = (): Product[] => {
    return ALL_PRODUCTS.filter(product => product.bestSeller === true);
};

/**
 * Get new arrivals across all categories
 */
export const getAllNewArrivals = (): Product[] => {
    return ALL_PRODUCTS.filter(product => product.newArrival === true);
};

/**
 * Get products by price range across all categories
 */
export const getProductsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );
};

/**
 * Get products by brand across all categories
 */
export const getProductsByBrand = (brand: string): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );
};

/**
 * Get top-rated products across all categories
 */
export const getTopRatedProducts = (minRating: number = 4.5): Product[] => {
    return ALL_PRODUCTS.filter(product => product.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Get products by rating range
 */
export const getProductsByRating = (minRating: number, maxRating: number = 5): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.rating >= minRating && product.rating <= maxRating
    );
};

/**
 * Get products in stock across all categories
 */
export const getInStockProducts = (): Product[] => {
    return ALL_PRODUCTS.filter(product => product.inStock === true);
};

/**
 * Get products by subcategory across all categories
 */
export const getProductsBySubcategory = (subcategory: string): Product[] => {
    return ALL_PRODUCTS.filter(product => product.subcategory === subcategory);
};

/**
 * Get random products for recommendations
 */
export const getRandomProducts = (count: number = 4): Product[] => {
    const shuffled = [...ALL_PRODUCTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

/**
 * Get related products by category
 */
export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getProductById(productId);
    if (!product) return [];

    // Get products from same category excluding the current product
    const relatedProducts = ALL_PRODUCTS.filter(p =>
        p.category === product.category &&
        p.id !== productId
    );

    // Sort by rating and return limited results
    return relatedProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
};

/**
 * Get products with discount/sale
 */
export const getDiscountedProducts = (): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.discount || (product.originalPrice && product.originalPrice > product.price)
    );
};

/**
 * Get products by activity (for sports/fitness)
 */
export const getProductsByActivity = (activity: string): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.tags.some(tag => tag.toLowerCase().includes(activity.toLowerCase())) ||
        product.name.toLowerCase().includes(activity.toLowerCase()) ||
        product.description.toLowerCase().includes(activity.toLowerCase())
    );
};

/**
 * Get products by skin concern (for health & beauty)
 */
export const getProductsBySkinConcern = (concern: string): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.category === 'health-beauty' &&
        (product.tags.some(tag => tag.toLowerCase().includes(concern.toLowerCase())) ||
            product.name.toLowerCase().includes(concern.toLowerCase()) ||
            product.description.toLowerCase().includes(concern.toLowerCase()))
    );
};

/**
 * Get products by age group (for baby & kids)
 */
export const getProductsByAgeGroup = (ageGroup: string): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.category === 'baby-kids' &&
        (product.specifications['Age Range']?.toLowerCase().includes(ageGroup.toLowerCase()) ||
            product.description.toLowerCase().includes(ageGroup.toLowerCase()))
    );
};

/**
 * Get eco-friendly products across all categories
 */
export const getEcoFriendlyProducts = (): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.tags.some(tag =>
            ['eco-friendly', 'organic', 'sustainable', 'bamboo', 'natural'].includes(tag.toLowerCase())
        ) ||
        product.description.toLowerCase().includes('eco') ||
        product.description.toLowerCase().includes('organic') ||
        product.description.toLowerCase().includes('sustainable')
    );
};

/**
 * Get products by material
 */
export const getProductsByMaterial = (material: string): Product[] => {
    return ALL_PRODUCTS.filter(product =>
        product.tags.some(tag => tag.toLowerCase().includes(material.toLowerCase())) ||
        (product.specifications &&
            Object.values(product.specifications).some(spec =>
                spec.toLowerCase().includes(material.toLowerCase())
            ))
    );
};

/**
 * Get product statistics
 */
export const getProductStats = () => {
    return {
        totalProducts: ALL_PRODUCTS.length,
        totalCategories: Object.keys(CATEGORIES).length,
        totalSubcategories: ALL_SUBCATEGORIES.length,
        inStockProducts: ALL_PRODUCTS.filter(p => p.inStock).length,
        featuredProducts: ALL_PRODUCTS.filter(p => p.featured).length,
        trendingProducts: ALL_PRODUCTS.filter(p => p.trending).length,
        onSaleProducts: getAllSaleProducts().length,
        bestSellers: ALL_PRODUCTS.filter(p => p.bestSeller).length,
        newArrivals: ALL_PRODUCTS.filter(p => p.newArrival).length,
        averageRating: Number((ALL_PRODUCTS.reduce((sum, p) => sum + p.rating, 0) / ALL_PRODUCTS.length).toFixed(2)),
        averagePrice: Number((ALL_PRODUCTS.reduce((sum, p) => sum + p.price, 0) / ALL_PRODUCTS.length).toFixed(2)),
        categoryBreakdown: Object.keys(CATEGORIES).reduce((acc, category) => {
            acc[category] = CATEGORIES[category as keyof typeof CATEGORIES].products.length;
            return acc;
        }, {} as Record<string, number>),
    };
};

// =====================================
// DEFAULT EXPORT
// =====================================

export default {
    // Data
    ALL_PRODUCTS,
    ALL_SUBCATEGORIES,
    CATEGORIES,
    BANNERS_DATA,

    // Category helpers
    electronicsHelpers,
    fashionHelpers,
    homeGardenHelpers,
    healthBeautyHelpers,
    babyKidsHelpers,
    sportsOutdoorsHelpers,
    bannersHelpers,

    // Universal functions
    getAllProducts,
    getProductsByCategory,
    getProductById,
    searchAllProducts,
    getAllFeaturedProducts,
    getFeaturedCategories,
    getAllTrendingProducts,
    getAllSaleProducts,
    getAllBestSellers,
    getAllNewArrivals,
    getProductsByPriceRange,
    getProductsByBrand,
    getTopRatedProducts,
    getProductsByRating,
    getInStockProducts,
    getProductsBySubcategory,
    getRandomProducts,
    getRelatedProducts,
    getDiscountedProducts,
    getProductsByActivity,
    getProductsBySkinConcern,
    getProductsByAgeGroup,
    getEcoFriendlyProducts,
    getProductsByMaterial,
    getProductStats,
};