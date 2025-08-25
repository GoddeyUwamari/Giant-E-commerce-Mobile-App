// constants/products/banners.ts
// Banner content, hero slides, and promotional campaigns

import { getBannerImage } from '../../assets/images/imageLoader';

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
        ctaLink: '/sale',
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
        description: 'iPhone, Samsung, laptops, and more with free shipping',
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
        title: 'Fashion Winter Collection',
        subtitle: 'Stay Warm, Look Great',
        description: 'New arrivals in coats, sweaters, and winter accessories',
        image: getBannerImage('hero-fashion'),
        imageAlt: 'Winter fashion collection banner',
        backgroundColor: '#7C2D12',
        textColor: '#FFFFFF',
        ctaText: 'Shop Fashion',
        ctaLink: '/category/fashion',
        priority: 3,
        active: true,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-02-28'),
        category: 'fashion',
        featured: true,
    },
    {
        id: 'hero-4',
        title: 'Home & Garden Refresh',
        subtitle: 'Transform Your Space',
        description: 'Furniture, decor, and garden essentials for every room',
        image: getBannerImage('hero-home'),
        imageAlt: 'Home and garden products display',
        backgroundColor: '#059669',
        textColor: '#FFFFFF',
        ctaText: 'Shop Home',
        ctaLink: '/category/home-garden',
        priority: 4,
        active: true,
        startDate: new Date('2024-12-01'),
        category: 'home-garden',
        featured: true,
    },
    {
        id: 'hero-5',
        title: 'Health & Beauty Essentials',
        subtitle: 'Feel Your Best Every Day',
        description: 'Skincare, makeup, vitamins, and wellness products',
        image: getBannerImage('hero-beauty'),
        imageAlt: 'Health and beauty products collection',
        backgroundColor: '#BE185D',
        textColor: '#FFFFFF',
        ctaText: 'Shop Beauty',
        ctaLink: '/category/health-beauty',
        priority: 5,
        active: true,
        startDate: new Date('2024-12-01'),
        category: 'health-beauty',
        featured: false,
    },
];

// =====================================
// FLASH DEALS
// =====================================

export const FLASH_DEALS: FlashDeal[] = [
    {
        id: 'flash-1',
        productId: '4', // iPhone 15 Pro Max
        title: 'iPhone 15 Pro Max 256GB',
        originalPrice: 1299.99,
        salePrice: 1199.99,
        discount: '8% off',
        timeLeft: '2h 34m',
        image: getBannerImage('flash-iphone'),
        ctaText: 'Grab Deal',
        limited: true,
        stockCount: 12,
    },
    {
        id: 'flash-2',
        productId: '2', // Bluebow Air Fryer
        title: 'Bluebow 5.3QT Air Fryer',
        originalPrice: 159.98,
        salePrice: 64.99,
        discount: '59% off',
        timeLeft: '4h 18m',
        image: getBannerImage('flash-airfryer'),
        ctaText: 'Shop Now',
        limited: true,
        stockCount: 8,
    },
    {
        id: 'flash-3',
        productId: '8', // Nike Air Max
        title: 'Nike Air Max 270 Running Shoes',
        originalPrice: 130.00,
        salePrice: 89.99,
        discount: '31% off',
        timeLeft: '6h 42m',
        image: getBannerImage('flash-nike'),
        ctaText: 'Get Yours',
        limited: true,
        stockCount: 24,
    },
    {
        id: 'flash-4',
        productId: '15', // Memory Foam Mattress
        title: 'Queen Memory Foam Mattress',
        originalPrice: 699.99,
        salePrice: 299.99,
        discount: '57% off',
        timeLeft: '8h 15m',
        image: getBannerImage('flash-mattress'),
        ctaText: 'Save Big',
        limited: true,
        stockCount: 5,
    },
    {
        id: 'flash-5',
        productId: '304', // ChefElite Cookware
        title: 'ChefElite 10-Piece Cookware Set',
        originalPrice: 299.99,
        salePrice: 149.99,
        discount: '50% off',
        timeLeft: '12h 28m',
        image: getBannerImage('flash-cookware'),
        ctaText: 'Cook Pro',
        limited: false,
    },
    {
        id: 'flash-6',
        productId: '6', // AirPods Pro
        title: 'Apple AirPods Pro 2nd Gen',
        originalPrice: 249.99,
        salePrice: 199.99,
        discount: '20% off',
        timeLeft: '14h 56m',
        image: getBannerImage('flash-airpods'),
        ctaText: 'Listen Up',
        limited: true,
        stockCount: 18,
    },
];

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
// CATEGORY BANNERS
// =====================================

export const CATEGORY_BANNERS: Banner[] = [
    {
        id: 'cat-electronics',
        title: 'Tech Deals',
        subtitle: 'Latest Gadgets',
        image: getBannerImage('cat-electronics'),
        imageAlt: 'Electronics category banner',
        backgroundColor: '#1E40AF',
        textColor: '#FFFFFF',
        ctaText: 'Shop Tech',
        ctaLink: '/category/electronics',
        priority: 1,
        active: true,
        startDate: new Date('2024-01-01'),
        category: 'electronics',
        featured: true,
    },
    {
        id: 'cat-fashion',
        title: 'Style Central',
        subtitle: 'Fashion Finds',
        image: getBannerImage('cat-fashion'),
        imageAlt: 'Fashion category banner',
        backgroundColor: '#BE185D',
        textColor: '#FFFFFF',
        ctaText: 'Shop Style',
        ctaLink: '/category/fashion',
        priority: 2,
        active: true,
        startDate: new Date('2024-01-01'),
        category: 'fashion',
        featured: true,
    },
    {
        id: 'cat-home',
        title: 'Home Sweet Home',
        subtitle: 'Decor & More',
        image: getBannerImage('cat-home'),
        imageAlt: 'Home and garden category banner',
        backgroundColor: '#059669',
        textColor: '#FFFFFF',
        ctaText: 'Shop Home',
        ctaLink: '/category/home-garden',
        priority: 3,
        active: true,
        startDate: new Date('2024-01-01'),
        category: 'home-garden',
        featured: true,
    },
    {
        id: 'cat-beauty',
        title: 'Beauty Boost',
        subtitle: 'Glow Up',
        image: getBannerImage('cat-beauty'),
        imageAlt: 'Health and beauty category banner',
        backgroundColor: '#7C2D12',
        textColor: '#FFFFFF',
        ctaText: 'Shop Beauty',
        ctaLink: '/category/health-beauty',
        priority: 4,
        active: true,
        startDate: new Date('2024-01-01'),
        category: 'health-beauty',
        featured: true,
    },
];

// =====================================
// HELPER FUNCTIONS
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