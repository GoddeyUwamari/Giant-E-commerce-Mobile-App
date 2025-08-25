// constants/products/health-beauty.ts
// Health & Beauty category products

import { Product } from './interfaces';
import { getProductImageBySize, getBannerImage } from '../../assets/images/imageLoader';

export const HEALTH_BEAUTY_PRODUCTS: Product[] = [
    // =====================================
    // MEDIUM HEALTH & BEAUTY ITEMS (med_15-16)
    // =====================================
    {
        id: '401',
        name: 'Vitamin C Brightening Serum',
        description: 'Powerful 20% Vitamin C serum with hyaluronic acid and antioxidants. Brightens skin, reduces dark spots, and provides anti-aging benefits.',
        shortDescription: '20% Vitamin C serum with hyaluronic acid',
        price: 24.99,
        originalPrice: 49.99,
        salePrice: 24.99,

        images: [
            { id: '401-1', url: getProductImageBySize('15', 'medium'), alt: 'Vitamin C Brightening Serum', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('15', 'medium'),

        brand: 'GlowSkin',
        model: 'Radiance Pro',
        sku: 'GS-VITC-001',
        category: 'health-beauty',
        subcategory: 'skincare',
        tags: ['vitamin c', 'serum', 'brightening', 'anti-aging', 'skincare'],

        rating: 4.6,
        reviewCount: 1847,
        reviews: [],

        inStock: true,
        stockCount: 156,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'GlowSkin',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '401-s1', name: 'Size', value: '1 fl oz (30ml)', price: 24.99, inStock: true },
                { id: '401-s2', name: 'Size', value: '2 fl oz (60ml)', price: 39.99, inStock: true },
            ],
        },

        features: [
            '20% stabilized L-Ascorbic Acid (Vitamin C)',
            'Hyaluronic acid for deep hydration',
            'Vitamin E and Ferulic Acid antioxidants',
            'Brightens and evens skin tone',
            'Reduces appearance of dark spots',
            'Boosts collagen production',
            'Lightweight, fast-absorbing formula',
            'Suitable for all skin types',
        ],

        specifications: {
            'Active Ingredients': '20% L-Ascorbic Acid, Hyaluronic Acid, Vitamin E',
            'Volume': '1 fl oz (30ml)',
            'pH Level': '3.5-4.0',
            'Skin Type': 'All skin types',
            'Usage': 'Apply morning and evening',
            'Storage': 'Store in cool, dark place',
            'Shelf Life': '12 months after opening',
            'Cruelty Free': 'Yes',
        },

        badge: 'Dermatologist Tested',
        badgeColor: '#10B981',
        discount: '50% off',
        featured: true,
        trending: true,
        bestSeller: true,

        slug: 'vitamin-c-brightening-serum',
        relatedProducts: ['402', '405', '406'],

        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '402',
        name: 'Daily Multivitamin Gummies',
        description: 'Complete daily nutrition in delicious gummy form. Contains 13 essential vitamins and minerals to support overall health and wellness.',
        shortDescription: 'Complete multivitamin gummies with 13 nutrients',
        price: 16.99,
        originalPrice: 29.99,
        salePrice: 16.99,

        images: [
            { id: '402-1', url: getProductImageBySize('16', 'medium'), alt: 'Daily Multivitamin Gummies', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('16', 'medium'),

        brand: 'VitaBoost',
        model: 'Complete Daily',
        sku: 'VB-MULTI-GUMMY',
        category: 'health-beauty',
        subcategory: 'vitamins',
        tags: ['multivitamin', 'gummies', 'vitamins', 'daily nutrition', 'wellness'],

        rating: 4.5,
        reviewCount: 2156,
        reviews: [],

        inStock: true,
        stockCount: 234,
        status: 'available',
        maxQuantity: 8,
        minQuantity: 1,

        seller: 'VitaBoost',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            flavors: [
                { id: '402-f1', name: 'Flavor', value: 'Mixed Berry', price: 16.99, inStock: true },
                { id: '402-f2', name: 'Flavor', value: 'Tropical Fruit', price: 16.99, inStock: true },
                { id: '402-f3', name: 'Flavor', value: 'Cherry', price: 16.99, inStock: false },
            ],
            counts: [
                { id: '402-c1', name: 'Count', value: '60 Gummies (30 days)', price: 16.99, inStock: true },
                { id: '402-c2', name: 'Count', value: '120 Gummies (60 days)', price: 29.99, inStock: true },
                { id: '402-c3', name: 'Count', value: '180 Gummies (90 days)', price: 39.99, inStock: true },
            ],
        },

        features: [
            '13 essential vitamins and minerals',
            'Delicious gummy format',
            'No artificial colors or flavors',
            'Gluten-free and non-GMO',
            'Easy to chew and digest',
            'Supports immune system',
            'Promotes energy and metabolism',
            'Third-party tested for purity',
        ],

        specifications: {
            'Serving Size': '2 gummies daily',
            'Servings Per Container': '30',
            'Key Nutrients': 'Vitamins A, C, D, E, B-Complex, Biotin, Folic Acid, Zinc',
            'Sugar Content': '3g per serving',
            'Calories': '15 per serving',
            'Allergens': 'None (gluten-free, dairy-free)',
            'Age Group': 'Adults 18+',
            'Certifications': 'GMP certified, third-party tested',
        },

        badge: 'Daily Essential',
        badgeColor: '#3B82F6',
        discount: '43% off',
        featured: true,
        trending: false,

        slug: 'daily-multivitamin-gummies',
        relatedProducts: ['403', '404', '407'],

        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-12'),
    },

    // =====================================
    // SMALL HEALTH & BEAUTY ITEMS (small_19-22)
    // =====================================
    {
        id: '403',
        name: 'Collagen Boost Supplements',
        description: 'Premium collagen peptides supplement with biotin and vitamin C. Supports skin elasticity, hair growth, and joint health.',
        shortDescription: 'Collagen peptides with biotin and vitamin C',
        price: 22.99,
        originalPrice: 39.99,
        salePrice: 22.99,

        images: [
            { id: '403-1', url: getProductImageBySize('19', 'small'), alt: 'Collagen Boost Supplements', size: 'small' },
        ],
        primaryImage: getProductImageBySize('19', 'small'),

        brand: 'BeautyWell',
        model: 'Collagen Plus',
        sku: 'BW-COLLAGEN-001',
        category: 'health-beauty',
        subcategory: 'supplements',
        tags: ['collagen', 'supplements', 'beauty', 'joint health', 'anti-aging'],

        rating: 4.7,
        reviewCount: 923,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'BeautyWell',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            forms: [
                { id: '403-f1', name: 'Form', value: 'Capsules (60 count)', price: 22.99, inStock: true },
                { id: '403-f2', name: 'Form', value: 'Powder (30 servings)', price: 27.99, inStock: true },
            ],
        },

        features: [
            'Hydrolyzed collagen peptides Type I & III',
            'Enhanced with biotin for hair and nails',
            'Vitamin C for collagen synthesis',
            'Supports skin elasticity and hydration',
            'Promotes joint flexibility',
            'Easy-to-swallow capsules',
            'Grass-fed, pasture-raised sources',
            'Third-party tested for quality',
        ],

        specifications: {
            'Serving Size': '2 capsules daily',
            'Collagen Content': '1000mg per serving',
            'Biotin': '5000mcg per serving',
            'Vitamin C': '60mg per serving',
            'Source': 'Grass-fed bovine collagen',
            'Form': 'Hydrolyzed peptides',
            'Certifications': 'Non-GMO, gluten-free',
            'Container': '60 capsules (30-day supply)',
        },

        badge: 'Beauty Support',
        badgeColor: '#EC4899',
        discount: '43% off',
        featured: false,

        slug: 'collagen-boost-supplements',
        relatedProducts: ['401', '402', '404'],

        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-12-10'),
    },

    {
        id: '404',
        name: 'Probiotic Digestive Health Capsules',
        description: '50 billion CFU probiotic supplement with 10 strains for digestive health, immune support, and overall gut wellness.',
        shortDescription: '50 billion CFU probiotic with 10 strains',
        price: 19.99,
        originalPrice: 34.99,
        salePrice: 19.99,

        images: [
            { id: '404-1', url: getProductImageBySize('20', 'small'), alt: 'Probiotic Digestive Health Capsules', size: 'small' },
        ],
        primaryImage: getProductImageBySize('20', 'small'),

        brand: 'GutHealth Pro',
        model: 'Advanced Formula',
        sku: 'GHP-PROB-50B',
        category: 'health-beauty',
        subcategory: 'supplements',
        tags: ['probiotics', 'digestive health', 'gut health', 'immune support', 'wellness'],

        rating: 4.6,
        reviewCount: 1456,
        reviews: [],

        inStock: true,
        stockCount: 167,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'GutHealth Pro',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            strengths: [
                { id: '404-st1', name: 'Strength', value: '50 Billion CFU', price: 19.99, inStock: true },
                { id: '404-st2', name: 'Strength', value: '100 Billion CFU', price: 29.99, inStock: true },
            ],
        },

        features: [
            '50 billion CFU per capsule',
            '10 clinically studied probiotic strains',
            'Delayed-release capsules for maximum survival',
            'Supports digestive and immune health',
            'Promotes healthy gut microbiome',
            'No refrigeration required',
            'Vegetarian capsules',
            'Shelf-stable formula',
        ],

        specifications: {
            'CFU Count': '50 billion per capsule',
            'Strain Count': '10 probiotic strains',
            'Key Strains': 'Lactobacillus acidophilus, Bifidobacterium lactis, L. plantarum',
            'Capsule Type': 'Delayed-release vegetarian',
            'Serving Size': '1 capsule daily',
            'Container Size': '60 capsules (60-day supply)',
            'Storage': 'Room temperature stable',
            'Allergens': 'Free from dairy, soy, gluten',
        },

        badge: 'Gut Health',
        badgeColor: '#059669',
        discount: '43% off',
        featured: true,

        slug: 'probiotic-digestive-health-capsules',
        relatedProducts: ['402', '403', '405'],

        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-12-14'),
    },

    {
        id: '405',
        name: 'Hydrating Face Moisturizer',
        description: 'Lightweight daily moisturizer with hyaluronic acid, ceramides, and SPF 30. Provides 24-hour hydration and sun protection.',
        shortDescription: 'Daily moisturizer with hyaluronic acid and SPF 30',
        price: 18.99,
        originalPrice: 32.99,
        salePrice: 18.99,

        images: [
            { id: '405-1', url: getProductImageBySize('21', 'small'), alt: 'Hydrating Face Moisturizer', size: 'small' },
        ],
        primaryImage: getProductImageBySize('21', 'small'),

        brand: 'SkinEssentials',
        model: 'Daily Defense',
        sku: 'SE-MOIST-SPF30',
        category: 'health-beauty',
        subcategory: 'skincare',
        tags: ['moisturizer', 'spf', 'hyaluronic acid', 'daily skincare', 'sun protection'],

        rating: 4.5,
        reviewCount: 1234,
        reviews: [],

        inStock: true,
        stockCount: 78,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'SkinEssentials',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            types: [
                { id: '405-t1', name: 'Formula', value: 'Normal to Dry Skin', price: 18.99, inStock: true },
                { id: '405-t2', name: 'Formula', value: 'Oily to Combination', price: 18.99, inStock: true },
                { id: '405-t3', name: 'Formula', value: 'Sensitive Skin', price: 21.99, inStock: true },
            ],
        },

        features: [
            'Broad spectrum SPF 30 protection',
            'Hyaluronic acid for deep hydration',
            'Ceramides restore skin barrier',
            'Lightweight, non-greasy formula',
            '24-hour moisturization',
            'Fast-absorbing texture',
            'Fragrance-free and non-comedogenic',
            'Suitable for daily use',
        ],

        specifications: {
            'Volume': '1.7 fl oz (50ml)',
            'SPF Level': 'SPF 30 broad spectrum',
            'Key Ingredients': 'Hyaluronic Acid, Ceramides, Zinc Oxide',
            'Skin Type': 'All skin types',
            'Application': 'Apply morning as last step',
            'Water Resistance': '40 minutes',
            'Fragrance': 'Fragrance-free',
            'Testing': 'Dermatologist tested',
        },

        badge: 'SPF Protection',
        badgeColor: '#F59E0B',
        discount: '42% off',
        featured: true,

        slug: 'hydrating-face-moisturizer',
        relatedProducts: ['401', '406', '407'],

        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-12-11'),
    },

    {
        id: '406',
        name: 'Gentle Foaming Face Cleanser',
        description: 'pH-balanced foaming cleanser with salicylic acid and niacinamide. Removes makeup and impurities while maintaining skin hydration.',
        shortDescription: 'pH-balanced cleanser with salicylic acid',
        price: 12.99,
        originalPrice: 22.99,
        salePrice: 12.99,

        images: [
            { id: '406-1', url: getProductImageBySize('22', 'small'), alt: 'Gentle Foaming Face Cleanser', size: 'small' },
        ],
        primaryImage: getProductImageBySize('22', 'small'),

        brand: 'CleanSkin',
        model: 'Pure Balance',
        sku: 'CS-CLEAN-FOAM',
        category: 'health-beauty',
        subcategory: 'skincare',
        tags: ['cleanser', 'foaming', 'salicylic acid', 'gentle', 'daily skincare'],

        rating: 4.4,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 145,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'CleanSkin',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '406-s1', name: 'Size', value: '5 fl oz (150ml)', price: 12.99, inStock: true },
                { id: '406-s2', name: 'Size', value: '8 fl oz (240ml)', price: 18.99, inStock: true },
            ],
        },

        features: [
            'pH-balanced formula (5.5-6.5)',
            'Salicylic acid gently exfoliates',
            'Niacinamide reduces redness',
            'Removes makeup and impurities',
            'Maintains skin moisture barrier',
            'Rich, creamy foam texture',
            'Suitable for daily use',
            'Free from sulfates and parabens',
        ],

        specifications: {
            'Volume': '5 fl oz (150ml)',
            'pH Level': '5.5-6.5',
            'Active Ingredients': '0.5% Salicylic Acid, 2% Niacinamide',
            'Skin Type': 'All skin types, including sensitive',
            'Usage': 'Morning and evening',
            'Texture': 'Foaming gel',
            'Fragrance': 'Light, fresh scent',
            'Sulfate Free': 'Yes',
        },

        badge: 'Gentle Formula',
        badgeColor: '#8B5CF6',
        discount: '43% off',
        featured: false,

        slug: 'gentle-foaming-face-cleanser',
        relatedProducts: ['401', '405', '407'],

        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-13'),
    },

    {
        id: '407',
        name: 'Omega-3 Fish Oil Capsules',
        description: 'High-potency omega-3 supplement with EPA and DHA. Supports heart health, brain function, and reduces inflammation.',
        shortDescription: 'High-potency omega-3 with EPA and DHA',
        price: 21.99,
        originalPrice: 36.99,
        salePrice: 21.99,

        images: [
            { id: '407-1', url: getProductImageBySize('23', 'small'), alt: 'Omega-3 Fish Oil Capsules', size: 'small' },
        ],
        primaryImage: getProductImageBySize('23', 'small'),

        brand: 'PureOmega',
        model: 'Triple Strength',
        sku: 'PO-OMEGA3-TS',
        category: 'health-beauty',
        subcategory: 'supplements',
        tags: ['omega-3', 'fish oil', 'heart health', 'brain support', 'supplements'],

        rating: 4.7,
        reviewCount: 1678,
        reviews: [],

        inStock: true,
        stockCount: 123,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'PureOmega',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            strengths: [
                { id: '407-st1', name: 'Strength', value: '1000mg (60 softgels)', price: 21.99, inStock: true },
                { id: '407-st2', name: 'Strength', value: '1500mg (90 softgels)', price: 29.99, inStock: true },
                { id: '407-st3', name: 'Strength', value: '2000mg (120 softgels)', price: 39.99, inStock: true },
            ],
        },

        features: [
            '1000mg of pure omega-3 per softgel',
            '600mg EPA and 400mg DHA',
            'Triple-strength concentrated formula',
            'Molecularly distilled for purity',
            'Supports cardiovascular health',
            'Promotes brain and eye function',
            'Anti-inflammatory properties',
            'Enteric-coated to reduce fishy aftertaste',
        ],

        specifications: {
            'Serving Size': '1 softgel daily',
            'Total Omega-3': '1000mg per softgel',
            'EPA Content': '600mg per softgel',
            'DHA Content': '400mg per softgel',
            'Source': 'Wild-caught fish (anchovies, sardines)',
            'Purity': 'Molecularly distilled, heavy metals tested',
            'Container': '60 softgels (60-day supply)',
            'Certifications': 'Third-party tested, mercury-free',
        },

        badge: 'Heart Health',
        badgeColor: '#EF4444',
        discount: '41% off',
        featured: true,
        trending: true,

        slug: 'omega-3-fish-oil-capsules',
        relatedProducts: ['402', '403', '404'],

        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '408',
        name: 'Retinol Night Serum',
        description: 'Advanced retinol serum with vitamin E and hyaluronic acid. Reduces fine lines, improves skin texture, and promotes cell renewal.',
        shortDescription: 'Advanced retinol serum for anti-aging',
        price: 26.99,
        originalPrice: 45.99,
        salePrice: 26.99,

        images: [
            { id: '408-1', url: getProductImageBySize('24', 'small'), alt: 'Retinol Night Serum', size: 'small' },
        ],
        primaryImage: getProductImageBySize('24', 'small'),

        brand: 'AgelessSkin',
        model: 'Renewal Complex',
        sku: 'AS-RETINOL-001',
        category: 'health-beauty',
        subcategory: 'skincare',
        tags: ['retinol', 'anti-aging', 'night serum', 'fine lines', 'skincare'],

        rating: 4.8,
        reviewCount: 756,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'AgelessSkin',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            concentrations: [
                { id: '408-c1', name: 'Concentration', value: '0.5% Retinol (Beginner)', price: 26.99, inStock: true },
                { id: '408-c2', name: 'Concentration', value: '1.0% Retinol (Advanced)', price: 32.99, inStock: true },
            ],
        },

        features: [
            'Encapsulated retinol for gentle release',
            'Vitamin E provides antioxidant protection',
            'Hyaluronic acid prevents dryness',
            'Reduces appearance of fine lines',
            'Improves skin texture and tone',
            'Promotes cellular renewal',
            'Lightweight, fast-absorbing formula',
            'Suitable for evening use only',
        ],

        specifications: {
            'Volume': '1 fl oz (30ml)',
            'Retinol Concentration': '0.5%',
            'Supporting Ingredients': 'Vitamin E, Hyaluronic Acid, Squalane',
            'Usage': 'Evening only, 2-3 times per week initially',
            'Skin Type': 'Normal to mature skin',
            'pH Level': '6.0-7.0',
            'Packaging': 'Dark glass bottle with dropper',
            'Storage': 'Store in cool, dark place',
        },

        badge: 'Anti-Aging',
        badgeColor: '#6B7280',
        discount: '41% off',
        featured: true,
        trending: false,

        slug: 'retinol-night-serum',
        relatedProducts: ['401', '405', '406'],

        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-12-14'),
    },
];

// =====================================
// HEALTH & BEAUTY SUBCATEGORIES
// =====================================
export const HEALTH_BEAUTY_SUBCATEGORIES = [
    {
        id: 'skincare',
        name: 'Skincare',
        description: 'Cleansers, serums, moisturizers, and treatments',
        icon: 'leaf-outline',
        color: '#10B981',
        productCount: 5,
        featured: true,
    },
    {
        id: 'supplements',
        name: 'Vitamins & Supplements',
        description: 'Vitamins, minerals, and health supplements',
        icon: 'medical-outline',
        color: '#3B82F6',
        productCount: 4,
        featured: true,
    },
    {
        id: 'vitamins',
        name: 'Daily Vitamins',
        description: 'Essential daily vitamins and multivitamins',
        icon: 'nutrition-outline',
        color: '#F59E0B',
        productCount: 1,
        featured: true,
    },
    {
        id: 'wellness',
        name: 'Health & Wellness',
        description: 'Overall health and wellness products',
        icon: 'heart-outline',
        color: '#EF4444',
        productCount: 0,
        featured: false,
    },
    {
        id: 'personal-care',
        name: 'Personal Care',
        description: 'Body care, oral care, and hygiene products',
        icon: 'person-outline',
        color: '#8B5CF6',
        productCount: 0,
        featured: false,
    },
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get all health & beauty products
 */
export const getAllHealthBeautyProducts = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS;
};

/**
 * Get health & beauty products by subcategory
 */
export const getHealthBeautyBySubcategory = (subcategory: string): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product => product.subcategory === subcategory);
};

/**
 * Get featured health & beauty products
 */
export const getFeaturedHealthBeauty = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product => product.featured === true);
};

/**
 * Get trending health & beauty products
 */
export const getTrendingHealthBeauty = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product => product.trending === true);
};

/**
 * Get health & beauty products on sale
 */
export const getHealthBeautyOnSale = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.originalPrice && product.price < product.originalPrice
    );
};

/**
 * Get health & beauty products by brand
 */
export const getHealthBeautyByBrand = (brand: string): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );
};

/**
 * Get health & beauty products by price range
 */
export const getHealthBeautyByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );
};

/**
 * Search health & beauty products
 */
export const searchHealthBeautyProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Get health & beauty product by ID
 */
export const getHealthBeautyProductById = (id: string): Product | undefined => {
    return HEALTH_BEAUTY_PRODUCTS.find(product => product.id === id);
};

/**
 * Get related health & beauty products
 */
export const getRelatedHealthBeautyProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getHealthBeautyProductById(productId);
    if (!product || !product.relatedProducts) return [];

    return product.relatedProducts
        .map(id => getHealthBeautyProductById(id))
        .filter(Boolean)
        .slice(0, limit) as Product[];
};

/**
 * Get top-rated health & beauty products
 */
export const getTopRatedHealthBeauty = (minRating: number = 4.5): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product => product.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Get best selling health & beauty products
 */
export const getBestSellingHealthBeauty = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product => product.bestSeller === true);
};

/**
 * Get new health & beauty arrivals
 */
export const getNewHealthBeautyArrivals = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product => product.newArrival === true);
};

/**
 * Get skincare products
 */
export const getSkincareProducts = (): Product[] => {
    return getHealthBeautyBySubcategory('skincare');
};

/**
 * Get vitamin and supplement products
 */
export const getSupplementProducts = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.subcategory === 'supplements' || product.subcategory === 'vitamins'
    );
};

/**
 * Get products by skin concern
 */
export const getProductsBySkinConcern = (concern: 'anti-aging' | 'acne' | 'hydration' | 'brightening' | 'sensitive'): Product[] => {
    const concernKeywords = {
        'anti-aging': ['retinol', 'anti-aging', 'fine lines', 'collagen', 'wrinkles'],
        'acne': ['salicylic acid', 'acne', 'blemish', 'clear skin', 'oil control'],
        'hydration': ['hyaluronic acid', 'moisturizer', 'hydrating', 'dry skin', 'ceramides'],
        'brightening': ['vitamin c', 'brightening', 'dark spots', 'radiance', 'glow'],
        'sensitive': ['gentle', 'sensitive', 'fragrance-free', 'hypoallergenic', 'soothing']
    };

    const keywords = concernKeywords[concern];
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        keywords.some(keyword =>
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
    );
};

/**
 * Get products by health goal
 */
export const getProductsByHealthGoal = (goal: 'immune-support' | 'heart-health' | 'brain-health' | 'digestive-health' | 'beauty-support'): Product[] => {
    const goalKeywords = {
        'immune-support': ['immune', 'vitamin c', 'zinc', 'immunity', 'defense'],
        'heart-health': ['omega-3', 'heart', 'cardiovascular', 'fish oil', 'circulation'],
        'brain-health': ['omega-3', 'dha', 'brain', 'cognitive', 'memory'],
        'digestive-health': ['probiotic', 'digestive', 'gut health', 'fiber', 'enzymes'],
        'beauty-support': ['collagen', 'biotin', 'beauty', 'hair', 'skin', 'nails']
    };

    const keywords = goalKeywords[goal];
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        keywords.some(keyword =>
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
    );
};

/**
 * Get products by ingredient
 */
export const getProductsByIngredient = (ingredient: string): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.description.toLowerCase().includes(ingredient.toLowerCase()) ||
        (product.specifications &&
            Object.values(product.specifications).some(spec =>
                spec.toLowerCase().includes(ingredient.toLowerCase())
            ))
    );
};

/**
 * Get cruelty-free products
 */
export const getCrueltyFreeProducts = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.description.toLowerCase().includes('cruelty free') ||
        (product.specifications &&
            Object.values(product.specifications).some(spec =>
                spec.toLowerCase().includes('cruelty free')
            ))
    );
};

/**
 * Get organic/natural products
 */
export const getNaturalProducts = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.tags.some(tag => ['organic', 'natural', 'plant-based'].includes(tag.toLowerCase())) ||
        product.description.toLowerCase().includes('organic') ||
        product.description.toLowerCase().includes('natural')
    );
};

/**
 * Get dermatologist tested products
 */
export const getDermatologistTestedProducts = (): Product[] => {
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        product.badge === 'Dermatologist Tested' ||
        product.description.toLowerCase().includes('dermatologist') ||
        (product.specifications &&
            Object.values(product.specifications).some(spec =>
                spec.toLowerCase().includes('dermatologist')
            ))
    );
};

/**
 * Get products suitable for specific age groups
 */
export const getProductsByAgeGroup = (ageGroup: '20s' | '30s' | '40s' | '50+'): Product[] => {
    const ageKeywords = {
        '20s': ['preventive', 'hydrating', 'gentle', 'daily', 'basic'],
        '30s': ['anti-aging', 'preventive', 'vitamin c', 'retinol', 'hydrating'],
        '40s': ['anti-aging', 'firm', 'collagen', 'retinol', 'mature'],
        '50+': ['anti-aging', 'intensive', 'firming', 'mature', 'renewal']
    };

    const keywords = ageKeywords[ageGroup];
    return HEALTH_BEAUTY_PRODUCTS.filter(product =>
        keywords.some(keyword =>
            product.description.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
    );
};

// =====================================
// EXPORT DEFAULT
// =====================================
export default {
    products: HEALTH_BEAUTY_PRODUCTS,
    subcategories: HEALTH_BEAUTY_SUBCATEGORIES,
    getAllProducts: getAllHealthBeautyProducts,
    getBySubcategory: getHealthBeautyBySubcategory,
    getFeatured: getFeaturedHealthBeauty,
    getTrending: getTrendingHealthBeauty,
    getOnSale: getHealthBeautyOnSale,
    getByBrand: getHealthBeautyByBrand,
    getByPriceRange: getHealthBeautyByPriceRange,
    search: searchHealthBeautyProducts,
    getById: getHealthBeautyProductById,
    getRelated: getRelatedHealthBeautyProducts,
    getTopRated: getTopRatedHealthBeauty,
    getBestSelling: getBestSellingHealthBeauty,
    getNewArrivals: getNewHealthBeautyArrivals,
    getSkincare: getSkincareProducts,
    getSupplements: getSupplementProducts,
    getBySkinConcern: getProductsBySkinConcern,
    getByHealthGoal: getProductsByHealthGoal,
    getByIngredient: getProductsByIngredient,
    getCrueltyFree: getCrueltyFreeProducts,
    getNatural: getNaturalProducts,
    getDermatologistTested: getDermatologistTestedProducts,
    getByAgeGroup: getProductsByAgeGroup,
};