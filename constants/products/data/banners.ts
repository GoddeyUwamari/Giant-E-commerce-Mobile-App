// constants/products/banners.ts
// Banner content, hero slides, and promotional campaigns using CSV product data
import { ALL_PRODUCTS, ALL_CATEGORIES } from './index'

// =====================================
// BANNER INTERFACES
// =====================================

export interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    image: string;
    imageAlt: string;
    backgroundColor: string;
    textColor: string;
    ctaText: string;
    ctaLink: string;
    priority: number;
    active: boolean;
    startDate: Date;
    endDate?: Date;
    category?: string;
    discount?: string;
    featured: boolean;
}

export interface FlashDeal {
    id: string;
    productId: string;
    title: string;
    originalPrice: number;
    salePrice: number;
    discount: string;
    timeLeft: string;
    image: string;
    ctaText: string;
    limited: boolean;
    stockCount?: number;
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get banner image URL (placeholder system)
 */
const getBannerImage = (bannerType: string): string => {
    // Use placeholder images for banners
    const bannerImages: Record<string, string> = {
        'hero-holiday': 'https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Holiday+Savings',
        'hero-electronics': 'https://via.placeholder.com/800x400/1E3A8A/FFFFFF?text=Electronics+Sale',
        'hero-fashion': 'https://via.placeholder.com/800x400/7C2D12/FFFFFF?text=Fashion+Collection',
        'hero-home': 'https://via.placeholder.com/800x400/059669/FFFFFF?text=Home+%26+Garden',
        'hero-beauty': 'https://via.placeholder.com/800x400/BE185D/FFFFFF?text=Health+%26+Beauty',
        'promo-shipping': 'https://via.placeholder.com/600x200/1F2937/FFFFFF?text=Free+Shipping',
        'promo-plus': 'https://via.placeholder.com/600x200/0F172A/FCD34D?text=Walmart%2B',
        'promo-delivery': 'https://via.placeholder.com/600x200/065F46/FFFFFF?text=Same+Day+Delivery',
        'cat-electronics': 'https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=Tech+Deals',
        'cat-fashion': 'https://via.placeholder.com/400x300/BE185D/FFFFFF?text=Style+Central',
        'cat-home': 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Home+Sweet+Home',
        'cat-beauty': 'https://via.placeholder.com/400x300/7C2D12/FFFFFF?text=Beauty+Boost',
    };

    return bannerImages[bannerType] || 'https://via.placeholder.com/600x300/6B7280/FFFFFF?text=Banner';
};

/**
 * Get flash deal products from actual CSV data
 */
const getFlashDealProducts = (): FlashDeal[] => {
    // Get products that have original prices (indicating sales)
    const saleProducts = ALL_PRODUCTS
        .filter(product => product.originalPrice && product.originalPrice > product.price)
        .slice(0, 10); // Take first 10 for flash deals

    return saleProducts.map((product, index) => {
        const discount = Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);

        // Generate random time left (for demo purposes)
        const hours = Math.floor(Math.random() * 24) + 1;
        const minutes = Math.floor(Math.random() * 60);

        return {
            id: `flash-${index + 1}`,
            productId: product.id,
            title: product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
            originalPrice: product.originalPrice!,
            salePrice: product.price,
            discount: `${discount}% off`,
            timeLeft: `${hours}h ${minutes}m`,
            image: product.image,
            ctaText: discount > 50 ? 'Grab Deal' : 'Shop Now',
            limited: discount > 30,
            stockCount: discount > 50 ? Math.floor(Math.random() * 20) + 5 : undefined,
        };
    });
};

// =====================================
// HERO SLIDES
// =====================================

export const HERO_SLIDES: Banner[] = [
    {
        id: 'hero-1',
        title: 'Holiday Savings',
        subtitle: 'Up to 70% Off Everything',
        description: 'Shop the biggest sale of the year with amazing deals across all categories',
        image: getBannerImage('hero-holiday'),
        imageAlt: 'Holiday sale banner with gift boxes',
        backgroundColor: '#DC2626',
        textColor: '#FFFFFF',
        ctaText: 'Shop Now',
        ctaLink: '/product?filter=flash-deals',
        priority: 1,
        active: true,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-01-15'),
        discount: 'Up to 70% off',
        featured: true,
    },
    {
        id: 'hero-2',
        title: 'Electronics Mega Sale',
        subtitle: 'Latest Tech at Unbeatable Prices',
        description: 'Phones, laptops, and more with free shipping',
        image: getBannerImage('hero-electronics'),
        imageAlt: 'Electronics sale with phones and laptops',
        backgroundColor: '#1E3A8A',
        textColor: '#FFFFFF',
        ctaText: 'Shop Electronics',
        ctaLink: '/category/electronics',
        priority: 2,
        active: true,
        startDate: new Date('2024-12-10'),
        endDate: new Date('2024-12-31'),
        category: 'electronics',
        discount: 'Up to 50% off',
        featured: true,
    },
    {
        id: 'hero-3',
        title: 'Home & Kitchen',
        subtitle: 'Transform Your Space',
        description: 'Appliances, furniture, and kitchen essentials',
        image: getBannerImage('hero-home'),
        imageAlt: 'Home and kitchen products display',
        backgroundColor: '#059669',
        textColor: '#FFFFFF',
        ctaText: 'Shop Home',
        ctaLink: '/category/home-kitchen',
        priority: 3,
        active: true,
        startDate: new Date('2024-12-01'),
        category: 'home-kitchen',
        featured: true,
    },
    {
        id: 'hero-4',
        title: 'Sports & Fitness',
        subtitle: 'Get Active, Stay Healthy',
        description: 'Equipment and gear for every fitness goal',
        image: getBannerImage('hero-beauty'),
        imageAlt: 'Sports and fitness equipment',
        backgroundColor: '#BE185D',
        textColor: '#FFFFFF',
        ctaText: 'Shop Fitness',
        ctaLink: '/category/sports-fitness',
        priority: 4,
        active: true,
        startDate: new Date('2024-12-01'),
        category: 'sports-fitness',
        featured: false,
    },
];

// =====================================
// FLASH DEALS - Generated from actual products
// =====================================

export const FLASH_DEALS: FlashDeal[] = getFlashDealProducts();

// =====================================
// PROMOTIONAL BANNERS
// =====================================

export const PROMOTIONAL_BANNERS: Banner[] = [
    {
        id: 'promo-1',
        title: 'Free Shipping',
        subtitle: 'On Orders Over $35',
        description: 'Get free standard shipping on qualifying orders',
        image: getBannerImage('promo-shipping'),
        imageAlt: 'Free shipping promotion',
        backgroundColor: '#1F2937',
        textColor: '#FFFFFF',
        ctaText: 'Learn More',
        ctaLink: '/shipping-info',
        priority: 1,
        active: true,
        startDate: new Date('2024-01-01'),
        featured: false,
    },
    {
        id: 'promo-2',
        title: 'Walmart+ Members',
        subtitle: 'Save Even More',
        description: 'Exclusive deals, free delivery, and member prices',
        image: getBannerImage('promo-plus'),
        imageAlt: 'Walmart+ membership benefits',
        backgroundColor: '#0F172A',
        textColor: '#FCD34D',
        ctaText: 'Join Now',
        ctaLink: '/walmart-plus',
        priority: 2,
        active: true,
        startDate: new Date('2024-01-01'),
        featured: false,
    },
    {
        id: 'promo-3',
        title: 'Same-Day Delivery',
        subtitle: 'Order by 2PM',
        description: 'Get your essentials delivered the same day',
        image: getBannerImage('promo-delivery'),
        imageAlt: 'Same day delivery service',
        backgroundColor: '#065F46',
        textColor: '#FFFFFF',
        ctaText: 'Order Now',
        ctaLink: '/same-day-delivery',
        priority: 3,
        active: true,
        startDate: new Date('2024-01-01'),
        featured: false,
    },
];

// =====================================
// CATEGORY BANNERS - Using actual categories
// =====================================

export const CATEGORY_BANNERS: Banner[] = ALL_CATEGORIES.map((category, index) => ({
    id: `cat-${category.slug}`,
    title: category.name,
    subtitle: `${category.productCount} Products`,
    image: getBannerImage(`cat-${category.slug}`),
    imageAlt: `${category.name} category banner`,
    backgroundColor: category.color,
    textColor: '#FFFFFF',
    ctaText: `Shop ${category.name}`,
    ctaLink: `/category/${category.slug}`,
    priority: index + 1,
    active: true,
    startDate: new Date('2024-01-01'),
    category: category.slug,
    featured: category.productCount > 50, // Featured if has many products
}));

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Get active hero slides
 */
export const getActiveHeroSlides = (): Banner[] => {
    const now = new Date();
    return HERO_SLIDES.filter(slide =>
        slide.active &&
        slide.startDate <= now &&
        (!slide.endDate || slide.endDate >= now)
    ).sort((a, b) => a.priority - b.priority);
};

/**
 * Get featured hero slides
 */
export const getFeaturedHeroSlides = (): Banner[] => {
    return getActiveHeroSlides().filter(slide => slide.featured);
};

/**
 * Get flash deals by time remaining
 */
export const getActiveFlashDeals = (): FlashDeal[] => {
    return FLASH_DEALS.filter(deal => {
        // In a real app, you'd calculate actual time remaining
        return true; // For demo, all deals are active
    });
};

/**
 * Get limited flash deals (low stock)
 */
export const getLimitedFlashDeals = (): FlashDeal[] => {
    return FLASH_DEALS.filter(deal =>
        deal.limited && deal.stockCount && deal.stockCount < 20
    );
};

/**
 * Get promotional banners
 */
export const getActivePromotionalBanners = (): Banner[] => {
    const now = new Date();
    return PROMOTIONAL_BANNERS.filter(banner =>
        banner.active &&
        banner.startDate <= now &&
        (!banner.endDate || banner.endDate >= now)
    ).sort((a, b) => a.priority - b.priority);
};

/**
 * Get category banners
 */
export const getCategoryBanners = (): Banner[] => {
    return CATEGORY_BANNERS.filter(banner => banner.active)
        .sort((a, b) => a.priority - b.priority);
};

/**
 * Get banner by category
 */
export const getBannersByCategory = (category: string): Banner[] => {
    return [...HERO_SLIDES, ...CATEGORY_BANNERS].filter(banner =>
        banner.category === category && banner.active
    );
};

/**
 * Get flash deal by product ID
 */
export const getFlashDealByProductId = (productId: string): FlashDeal | undefined => {
    return FLASH_DEALS.find(deal => deal.productId === productId);
};

/**
 * Get banner by ID
 */
export const getBannerById = (id: string): Banner | undefined => {
    return [...HERO_SLIDES, ...PROMOTIONAL_BANNERS, ...CATEGORY_BANNERS]
        .find(banner => banner.id === id);
};

/**
 * Get banners for home screen
 */
export const getHomeScreenBanners = () => {
    return {
        heroSlides: getFeaturedHeroSlides(),
        flashDeals: getActiveFlashDeals().slice(0, 6),
        promotionalBanners: getActivePromotionalBanners().slice(0, 3),
        categoryBanners: getCategoryBanners(),
    };
};

// =====================================
// EXPORT DEFAULT
// =====================================

export default {
    HERO_SLIDES,
    FLASH_DEALS,
    PROMOTIONAL_BANNERS,
    CATEGORY_BANNERS,
    getActiveHeroSlides,
    getFeaturedHeroSlides,
    getActiveFlashDeals,
    getLimitedFlashDeals,
    getActivePromotionalBanners,
    getCategoryBanners,
    getBannersByCategory,
    getFlashDealByProductId,
    getBannerById,
    getHomeScreenBanners,
};