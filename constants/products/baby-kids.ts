// constants/products/baby-kids.ts
// Baby & Kids category products

import { Product } from './interfaces';
import { getProductImageBySize, getBannerImage } from '../../assets/images/imageLoader';

export const BABY_KIDS_PRODUCTS: Product[] = [
    // =====================================
    // MEDIUM BABY & KIDS ITEMS (med_17-18)
    // =====================================
    {
        id: '501',
        name: 'Educational Building Blocks Set',
        description: 'Colorful wooden building blocks set with 100 pieces including letters, numbers, and shapes. Promotes creativity, motor skills, and early learning.',
        shortDescription: '100-piece wooden building blocks with letters and numbers',
        price: 34.99,
        originalPrice: 59.99,
        salePrice: 34.99,

        images: [
            { id: '501-1', url: getProductImageBySize('17', 'medium'), alt: 'Educational Building Blocks Set', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('17', 'medium'),

        brand: 'LearnPlay',
        model: 'ABC-123 Builder',
        sku: 'LP-BLOCKS-100',
        category: 'baby-kids',
        subcategory: 'toys',
        tags: ['building blocks', 'educational', 'wooden toys', 'learning', 'toddler'],

        rating: 4.7,
        reviewCount: 1456,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'LearnPlay',
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
            sets: [
                { id: '501-s1', name: 'Set Size', value: '50 Pieces', price: 24.99, inStock: true },
                { id: '501-s2', name: 'Set Size', value: '100 Pieces', price: 34.99, inStock: true },
                { id: '501-s3', name: 'Set Size', value: '150 Pieces Deluxe', price: 49.99, inStock: true },
            ],
        },

        features: [
            '100 colorful wooden blocks',
            'Letters A-Z and numbers 0-9',
            'Various geometric shapes',
            'Non-toxic, child-safe paint',
            'Smooth, splinter-free edges',
            'Develops fine motor skills',
            'Encourages creative thinking',
            'Comes with storage bag',
        ],

        specifications: {
            'Age Range': '18 months - 6 years',
            'Material': '100% natural wood with non-toxic paint',
            'Block Size': 'Various sizes, largest 2" x 2"',
            'Set Contents': '26 letter blocks, 10 number blocks, 64 shape blocks',
            'Safety Standards': 'CPSIA compliant, ASTM certified',
            'Care Instructions': 'Wipe clean with damp cloth',
            'Storage': 'Cotton drawstring bag included',
        },

        badge: 'Educational',
        badgeColor: '#10B981',
        discount: '42% off',
        featured: true,
        trending: true,
        bestSeller: true,

        slug: 'educational-building-blocks-set',
        relatedProducts: ['502', '505', '506'],

        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '502',
        name: 'Baby Safety Kit - Complete Set',
        description: 'Comprehensive baby safety kit with outlet covers, cabinet locks, corner guards, and door knob covers. Everything you need to baby-proof your home.',
        shortDescription: 'Complete baby safety kit with outlet covers and locks',
        price: 29.99,
        originalPrice: 49.99,
        salePrice: 29.99,

        images: [
            { id: '502-1', url: getProductImageBySize('18', 'medium'), alt: 'Baby Safety Kit Complete Set', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('18', 'medium'),

        brand: 'SafeBaby',
        model: 'Complete Protection',
        sku: 'SB-SAFETY-KIT',
        category: 'baby-kids',
        subcategory: 'safety',
        tags: ['baby safety', 'childproofing', 'outlet covers', 'cabinet locks', 'baby gear'],

        rating: 4.6,
        reviewCount: 2134,
        reviews: [],

        inStock: true,
        stockCount: 156,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'SafeBaby',
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

        features: [
            '46-piece comprehensive safety kit',
            '30 outlet covers with sliding mechanism',
            '8 cabinet and drawer locks',
            '4 corner and edge guards',
            '2 door knob covers',
            '2 toilet locks',
            'Easy installation with 3M adhesive',
            'No tools required for most items',
        ],

        specifications: {
            'Kit Contents': '46 pieces total safety items',
            'Outlet Covers': '30 sliding outlet plugs',
            'Cabinet Locks': '8 magnetic locks with keys',
            'Corner Guards': '4 soft foam corner protectors',
            'Material': 'BPA-free plastic and foam',
            'Installation': 'Adhesive backing, no drilling',
            'Age Range': '0-5 years',
            'Certification': 'CPSC safety standards',
        },

        badge: 'Safety First',
        badgeColor: '#EF4444',
        discount: '40% off',
        featured: true,
        trending: false,

        slug: 'baby-safety-kit-complete-set',
        relatedProducts: ['503', '504', '507'],

        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-12'),
    },

    // =====================================
    // SMALL BABY & KIDS ITEMS (small_25-26)
    // =====================================
    {
        id: '503',
        name: 'Soft Plush Teddy Bear',
        description: 'Adorable soft plush teddy bear made from premium hypoallergenic materials. Perfect cuddle companion for babies and toddlers.',
        shortDescription: 'Soft hypoallergenic plush teddy bear for babies',
        price: 18.99,
        originalPrice: 29.99,
        salePrice: 18.99,

        images: [
            { id: '503-1', url: getProductImageBySize('25', 'small'), alt: 'Soft Plush Teddy Bear', size: 'small' },
        ],
        primaryImage: getProductImageBySize('25', 'small'),

        brand: 'CuddleBear',
        model: 'Honey Bear',
        sku: 'CB-TEDDY-001',
        category: 'baby-kids',
        subcategory: 'toys',
        tags: ['plush toy', 'teddy bear', 'soft toy', 'cuddle', 'baby comfort'],

        rating: 4.8,
        reviewCount: 934,
        reviews: [],

        inStock: true,
        stockCount: 234,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'CuddleBear',
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
            colors: [
                { id: '503-c1', name: 'Color', value: 'Honey Brown', price: 18.99, inStock: true },
                { id: '503-c2', name: 'Color', value: 'Cream White', price: 18.99, inStock: true },
                { id: '503-c3', name: 'Color', value: 'Soft Pink', price: 19.99, inStock: true },
                { id: '503-c4', name: 'Color', value: 'Light Blue', price: 19.99, inStock: false },
            ],
            sizes: [
                { id: '503-s1', name: 'Size', value: '12 inches', price: 18.99, inStock: true },
                { id: '503-s2', name: 'Size', value: '16 inches', price: 24.99, inStock: true },
                { id: '503-s3', name: 'Size', value: '20 inches', price: 34.99, inStock: true },
            ],
        },

        features: [
            'Ultra-soft premium plush fabric',
            'Hypoallergenic polyester filling',
            'Safety-tested button eyes',
            'Machine washable',
            'Perfect size for little hands',
            'Comforting weight for sleep',
            'Embroidered facial features',
            'CE marked for safety',
        ],

        specifications: {
            'Size': '12 inches tall',
            'Material': '100% polyester plush',
            'Filling': 'Hypoallergenic polyester fiber',
            'Eyes': 'Safety-tested plastic buttons',
            'Age Range': '0+ months',
            'Care': 'Machine wash gentle, air dry',
            'Safety Standards': 'CE marked, CPSIA compliant',
            'Weight': '8 oz',
        },

        badge: 'Comfort',
        badgeColor: '#EC4899',
        discount: '37% off',
        featured: false,

        slug: 'soft-plush-teddy-bear',
        relatedProducts: ['501', '504', '505'],

        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-12-10'),
    },

    {
        id: '504',
        name: 'Musical Activity Table',
        description: 'Interactive musical activity table with lights, sounds, and educational games. Helps develop motor skills and cognitive abilities.',
        shortDescription: 'Interactive musical table with lights and learning games',
        price: 49.99,
        originalPrice: 79.99,
        salePrice: 49.99,

        images: [
            { id: '504-1', url: getProductImageBySize('26', 'small'), alt: 'Musical Activity Table', size: 'small' },
        ],
        primaryImage: getProductImageBySize('26', 'small'),

        brand: 'BabyGenius',
        model: 'Music & Learn',
        sku: 'BG-MUSIC-TABLE',
        category: 'baby-kids',
        subcategory: 'toys',
        tags: ['musical toy', 'activity table', 'learning toy', 'interactive', 'development'],

        rating: 4.5,
        reviewCount: 756,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'BabyGenius',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '3-5 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        features: [
            '6 interactive activity areas',
            'Colorful LED lights',
            '15+ songs and melodies',
            'Animal sounds and phrases',
            'Piano keys and drum pads',
            'Shape sorting activities',
            'Volume control settings',
            'Removable legs for floor play',
        ],

        specifications: {
            'Age Range': '6 months - 3 years',
            'Dimensions': '16" L x 16" W x 16" H',
            'Weight': '4.5 lbs',
            'Power': '3 AA batteries (included)',
            'Languages': 'English and Spanish',
            'Play Modes': '3 different modes',
            'Volume Levels': '2 adjustable levels',
            'Material': 'BPA-free plastic',
        },

        badge: 'Interactive',
        badgeColor: '#3B82F6',
        discount: '38% off',
        featured: true,

        slug: 'musical-activity-table',
        relatedProducts: ['501', '502', '506'],

        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-12-14'),
    },

    // =====================================
    // ADDITIONAL BABY & KIDS ITEMS - FIXED IMAGE NUMBERS
    // =====================================
    {
        id: '505',
        name: 'Organic Baby Onesies 5-Pack',
        description: 'Super soft organic cotton onesies in adorable prints. Hypoallergenic and gentle on sensitive skin. Perfect for everyday wear.',
        shortDescription: '5-pack organic cotton onesies with cute prints',
        price: 24.99,
        originalPrice: 39.99,
        salePrice: 24.99,

        images: [
            { id: '505-1', url: getProductImageBySize('25', 'small'), alt: 'Organic Baby Onesies 5-Pack', size: 'small' },
        ],
        primaryImage: getProductImageBySize('25', 'small'),

        brand: 'OrganicBaby',
        model: 'Essential Collection',
        sku: 'OB-ONESIE-5PK',
        category: 'baby-kids',
        subcategory: 'clothing',
        tags: ['baby clothes', 'organic cotton', 'onesies', 'infant wear', 'soft'],

        rating: 4.7,
        reviewCount: 1245,
        reviews: [],

        inStock: true,
        stockCount: 189,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'OrganicBaby',
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
                { id: '505-s1', name: 'Size', value: 'Newborn', price: 24.99, inStock: true },
                { id: '505-s2', name: 'Size', value: '0-3 months', price: 24.99, inStock: true },
                { id: '505-s3', name: 'Size', value: '3-6 months', price: 24.99, inStock: true },
                { id: '505-s4', name: 'Size', value: '6-9 months', price: 26.99, inStock: true },
                { id: '505-s5', name: 'Size', value: '9-12 months', price: 26.99, inStock: true },
            ],
            prints: [
                { id: '505-p1', name: 'Print Set', value: 'Animal Friends', price: 24.99, inStock: true },
                { id: '505-p2', name: 'Print Set', value: 'Rainbow Colors', price: 24.99, inStock: true },
                { id: '505-p3', name: 'Print Set', value: 'Space Adventure', price: 27.99, inStock: true },
            ],
        },

        features: [
            '100% certified organic cotton',
            'GOTS certified fabric',
            'Hypoallergenic and breathable',
            'Snap closure at bottom',
            'Envelope neckline for easy dressing',
            'Pre-shrunk fabric',
            'Machine washable',
            '5 different adorable prints',
        ],

        specifications: {
            'Material': '100% organic cotton',
            'Certification': 'GOTS certified organic',
            'Weight': '180 GSM fabric',
            'Closure': 'Nickel-free snaps',
            'Neckline': 'Expandable envelope style',
            'Care': 'Machine wash cold, tumble dry low',
            'Origin': 'Made with organic cotton',
            'Pack Size': '5 onesies per pack',
        },

        badge: 'Organic',
        badgeColor: '#059669',
        discount: '38% off',
        featured: true,

        slug: 'organic-baby-onesies-5-pack',
        relatedProducts: ['503', '506', '507'],

        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-12-11'),
    },

    {
        id: '506',
        name: 'Stacking Rings Toy',
        description: 'Classic colorful stacking rings toy that helps develop hand-eye coordination and problem-solving skills. Made from safe, non-toxic materials.',
        shortDescription: 'Classic colorful stacking rings for motor skill development',
        price: 12.99,
        originalPrice: 19.99,
        salePrice: 12.99,

        images: [
            { id: '506-1', url: getProductImageBySize('26', 'small'), alt: 'Stacking Rings Toy', size: 'small' },
        ],
        primaryImage: getProductImageBySize('26', 'small'),

        brand: 'PlayTime',
        model: 'Rainbow Stacker',
        sku: 'PT-STACK-RINGS',
        category: 'baby-kids',
        subcategory: 'toys',
        tags: ['stacking toy', 'motor skills', 'colorful', 'classic toy', 'learning'],

        rating: 4.6,
        reviewCount: 678,
        reviews: [],

        inStock: true,
        stockCount: 145,
        status: 'available',
        maxQuantity: 8,
        minQuantity: 1,

        seller: 'PlayTime',
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

        features: [
            '6 colorful stacking rings',
            'Smooth, rounded edges',
            'Non-toxic BPA-free plastic',
            'Different sizes for sorting',
            'Wobble base for extra fun',
            'Bright rainbow colors',
            'Easy to clean',
            'Classic developmental toy',
        ],

        specifications: {
            'Age Range': '6 months - 2 years',
            'Ring Count': '6 graduated rings',
            'Colors': 'Red, orange, yellow, green, blue, purple',
            'Material': 'BPA-free plastic',
            'Base Type': 'Wobble base',
            'Dimensions': '5.5" diameter x 8" height',
            'Weight': '12 oz',
            'Safety': 'CPSIA compliant',
        },

        badge: 'Classic',
        badgeColor: '#F59E0B',
        discount: '35% off',
        featured: false,

        slug: 'stacking-rings-toy',
        relatedProducts: ['501', '504', '508'],

        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-13'),
    },

    {
        id: '507',
        name: 'Baby Bottle Feeding Set',
        description: 'Complete baby bottle feeding set with anti-colic bottles, nipples in different flow rates, and bottle brush. Everything for stress-free feeding.',
        shortDescription: 'Complete anti-colic bottle feeding set with accessories',
        price: 32.99,
        originalPrice: 54.99,
        salePrice: 32.99,

        images: [
            { id: '507-1', url: getProductImageBySize('25', 'small'), alt: 'Baby Bottle Feeding Set', size: 'small' },
        ],
        primaryImage: getProductImageBySize('25', 'small'),

        brand: 'FeedWell',
        model: 'Complete Feeding',
        sku: 'FW-BOTTLE-SET',
        category: 'baby-kids',
        subcategory: 'feeding',
        tags: ['baby bottles', 'feeding', 'anti-colic', 'bottle set', 'baby gear'],

        rating: 4.5,
        reviewCount: 1567,
        reviews: [],

        inStock: true,
        stockCount: 98,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'FeedWell',
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

        features: [
            '6 anti-colic bottles (4oz and 8oz)',
            'Multiple nipple flow rates',
            'BPA-free materials',
            'Wide neck for easy cleaning',
            'Anti-colic venting system',
            'Bottle brush included',
            'Dishwasher safe',
            'Compatible with most breast pumps',
        ],

        specifications: {
            'Set Contents': '4 bottles (2x4oz, 2x8oz), 6 nipples, bottle brush',
            'Material': 'BPA-free polypropylene',
            'Nipple Flow': 'Slow, medium, fast flow options',
            'Anti-Colic': 'Advanced venting system',
            'Neck Type': 'Wide neck design',
            'Age Range': '0-12 months',
            'Capacity': '4oz and 8oz bottles',
            'Care': 'Dishwasher safe (top rack)',
        },

        badge: 'Feeding Essential',
        badgeColor: '#8B5CF6',
        discount: '40% off',
        featured: true,

        slug: 'baby-bottle-feeding-set',
        relatedProducts: ['502', '505', '508'],

        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '508',
        name: 'Kids Backpack with Lunch Box',
        description: 'Adorable kids backpack set with matching insulated lunch box. Perfect for preschool and kindergarten. Features fun animal designs.',
        shortDescription: 'Kids backpack and lunch box set with animal designs',
        price: 26.99,
        originalPrice: 42.99,
        salePrice: 26.99,

        images: [
            { id: '508-1', url: getProductImageBySize('26', 'small'), alt: 'Kids Backpack with Lunch Box', size: 'small' },
        ],
        primaryImage: getProductImageBySize('26', 'small'),

        brand: 'SchoolBuddy',
        model: 'Animal Friends',
        sku: 'SB-BACKPACK-SET',
        category: 'baby-kids',
        subcategory: 'school-supplies',
        tags: ['backpack', 'lunch box', 'school supplies', 'kids bag', 'preschool'],

        rating: 4.4,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 123,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'SchoolBuddy',
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
            designs: [
                { id: '508-d1', name: 'Design', value: 'Elephant', price: 26.99, inStock: true },
                { id: '508-d2', name: 'Design', value: 'Lion', price: 26.99, inStock: true },
                { id: '508-d3', name: 'Design', value: 'Unicorn', price: 29.99, inStock: true },
                { id: '508-d4', name: 'Design', value: 'Dinosaur', price: 26.99, inStock: false },
            ],
        },

        features: [
            'Matching backpack and lunch box',
            'Insulated lunch box keeps food fresh',
            'Adjustable padded shoulder straps',
            'Multiple compartments and pockets',
            'Easy-clean wipeable fabric',
            'Name tag holder',
            'Child-safe zippers',
            'Perfect size for preschoolers',
        ],

        specifications: {
            'Backpack Size': '12" H x 10" W x 5" D',
            'Lunch Box Size': '9" W x 7" H x 4" D',
            'Material': 'Polyester with PVC lining',
            'Insulation': 'Thermal insulated lunch compartment',
            'Age Range': '3-6 years',
            'Capacity': 'Backpack: 12L, Lunch box: 2L',
            'Care': 'Spot clean with damp cloth',
            'Weight': '1.2 lbs combined',
        },

        badge: 'School Ready',
        badgeColor: '#3B82F6',
        discount: '37% off',
        featured: false,

        slug: 'kids-backpack-with-lunch-box',
        relatedProducts: ['501', '505', '506'],

        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-12-14'),
    },
];

// =====================================
// BABY & KIDS SUBCATEGORIES
// =====================================
export const BABY_KIDS_SUBCATEGORIES = [
    {
        id: 'toys',
        name: 'Toys & Games',
        description: 'Educational toys, building blocks, and fun games',
        icon: 'game-controller-outline',
        color: '#EC4899',
        productCount: 4,
        featured: true,
    },
    {
        id: 'clothing',
        name: 'Baby & Kids Clothing',
        description: 'Comfortable clothing for babies and children',
        icon: 'shirt-outline',
        color: '#8B5CF6',
        productCount: 1,
        featured: true,
    },
    {
        id: 'feeding',
        name: 'Feeding & Nursing',
        description: 'Bottles, sippy cups, and feeding accessories',
        icon: 'nutrition-outline',
        color: '#10B981',
        productCount: 1,
        featured: true,
    },
    {
        id: 'safety',
        name: 'Baby Safety',
        description: 'Childproofing and safety products',
        icon: 'shield-outline',
        color: '#EF4444',
        productCount: 1,
        featured: true,
    },
    {
        id: 'school-supplies',
        name: 'School Supplies',
        description: 'Backpacks, lunch boxes, and school essentials',
        icon: 'school-outline',
        color: '#3B82F6',
        productCount: 1,
        featured: false,
    },
    {
        id: 'baby-gear',
        name: 'Baby Gear',
        description: 'Strollers, car seats, and travel accessories',
        icon: 'car-outline',
        color: '#F59E0B',
        productCount: 0,
        featured: false,
    },
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get all baby & kids products
 */
export const getAllBabyKidsProducts = (): Product[] => {
    return BABY_KIDS_PRODUCTS;
};

/**
 * Get baby & kids products by subcategory
 */
export const getBabyKidsBySubcategory = (subcategory: string): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product => product.subcategory === subcategory);
};

/**
 * Get featured baby & kids products
 */
export const getFeaturedBabyKids = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product => product.featured === true);
};

/**
 * Get trending baby & kids products
 */
export const getTrendingBabyKids = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product => product.trending === true);
};

/**
 * Get baby & kids products on sale
 */
export const getBabyKidsOnSale = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.originalPrice && product.price < product.originalPrice
    );
};

/**
 * Get baby & kids products by brand
 */
export const getBabyKidsByBrand = (brand: string): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );
};

/**
 * Get baby & kids products by price range
 */
export const getBabyKidsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );
};

/**
 * Search baby & kids products
 */
export const searchBabyKidsProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Get baby & kids product by ID
 */
export const getBabyKidsProductById = (id: string): Product | undefined => {
    return BABY_KIDS_PRODUCTS.find(product => product.id === id);
};

/**
 * Get related baby & kids products
 */
export const getRelatedBabyKidsProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getBabyKidsProductById(productId);
    if (!product || !product.relatedProducts) return [];

    return product.relatedProducts
        .map(id => getBabyKidsProductById(id))
        .filter(Boolean)
        .slice(0, limit) as Product[];
};

/**
 * Get baby & kids products by rating
 */
export const getTopRatedBabyKids = (minRating: number = 4.5): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product => product.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Get best selling baby & kids items
 */
export const getBestSellingBabyKids = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product => product.bestSeller === true);
};

/**
 * Get new baby & kids arrivals
 */
export const getNewBabyKidsArrivals = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product => product.newArrival === true);
};

/**
 * Get baby & kids products by age range
 */
export const getBabyKidsByAgeRange = (ageRange: string): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.specifications['Age Range']?.toLowerCase().includes(ageRange.toLowerCase())
    );
};

/**
 * Get educational baby & kids products
 */
export const getEducationalBabyKids = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.tags.includes('educational') ||
        product.tags.includes('learning') ||
        product.description.toLowerCase().includes('educational') ||
        product.description.toLowerCase().includes('learning')
    );
};

/**
 * Get baby & kids products by material
 */
export const getBabyKidsByMaterial = (material: string): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.specifications &&
        Object.values(product.specifications).some(spec =>
            spec.toLowerCase().includes(material.toLowerCase())
        )
    );
};

/**
 * Get organic/natural baby & kids products
 */
export const getOrganicBabyKids = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.tags.includes('organic') ||
        product.description.toLowerCase().includes('organic') ||
        product.description.toLowerCase().includes('natural')
    );
};

/**
 * Get baby & kids products by specific subcategories
 */
export const getToys = (): Product[] => {
    return getBabyKidsBySubcategory('toys');
};

export const getBabyClothing = (): Product[] => {
    return getBabyKidsBySubcategory('clothing');
};

export const getFeedingProducts = (): Product[] => {
    return getBabyKidsBySubcategory('feeding');
};

export const getSafetyProducts = (): Product[] => {
    return getBabyKidsBySubcategory('safety');
};

export const getSchoolSupplies = (): Product[] => {
    return getBabyKidsBySubcategory('school-supplies');
};

export const getBabyGear = (): Product[] => {
    return getBabyKidsBySubcategory('baby-gear');
};

/**
 * Get baby & kids products by safety standards
 */
export const getBabyKidsBySafety = (): Product[] => {
    return BABY_KIDS_PRODUCTS.filter(product =>
        product.specifications &&
        (product.specifications['Safety Standards'] ||
            product.specifications['Safety'] ||
            product.specifications['Certification'])
    );
};

/**
 * Get baby & kids products suitable for specific age groups
 */
export const getBabyKidsByAgeGroup = (ageGroup: 'newborn' | 'infant' | 'toddler' | 'preschool' | 'school-age'): Product[] => {
    const ageKeywords = {
        newborn: ['newborn', '0-3 months', '0 months'],
        infant: ['infant', '3-6 months', '6-9 months', '9-12 months'],
        toddler: ['toddler', '12 months', '18 months', '1 year', '2 years'],
        preschool: ['preschool', '3 years', '4 years', '5 years'],
        'school-age': ['school', '6 years', '7 years', '8 years', '9 years', '10 years']
    };

    const keywords = ageKeywords[ageGroup];
    return BABY_KIDS_PRODUCTS.filter(product => {
        const ageRange = product.specifications['Age Range']?.toLowerCase() || '';
        return keywords.some(keyword => ageRange.includes(keyword));
    });
};

// =====================================
// EXPORT DEFAULT
// =====================================
export default {
    products: BABY_KIDS_PRODUCTS,
    subcategories: BABY_KIDS_SUBCATEGORIES,
    getAllProducts: getAllBabyKidsProducts,
    getBySubcategory: getBabyKidsBySubcategory,
    getFeatured: getFeaturedBabyKids,
    getTrending: getTrendingBabyKids,
    getOnSale: getBabyKidsOnSale,
    getByBrand: getBabyKidsByBrand,
    getByPriceRange: getBabyKidsByPriceRange,
    search: searchBabyKidsProducts,
    getById: getBabyKidsProductById,
    getRelated: getRelatedBabyKidsProducts,
    getTopRated: getTopRatedBabyKids,
    getBestSelling: getBestSellingBabyKids,
    getNewArrivals: getNewBabyKidsArrivals,
    getByAgeRange: getBabyKidsByAgeRange,
    getEducational: getEducationalBabyKids,
    getByMaterial: getBabyKidsByMaterial,
    getOrganic: getOrganicBabyKids,
    getToys: getToys,
    getBabyClothing: getBabyClothing,
    getFeedingProducts: getFeedingProducts,
    getSafetyProducts: getSafetyProducts,
    getSchoolSupplies: getSchoolSupplies,
    getBabyGear: getBabyGear,
    getBySafety: getBabyKidsBySafety,
    getByAgeGroup: getBabyKidsByAgeGroup,
};