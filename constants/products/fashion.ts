// constants/products/fashion.ts
// Fashion category products

import { Product } from './interfaces';
import { getProductImageBySize, getBannerImage } from '../../assets/images/imageLoader';

export const FASHION_PRODUCTS: Product[] = [
    // =====================================
    // LARGE FASHION ITEMS (prod_08-11)
    // =====================================
    {
        id: '8',
        name: 'Nike Air Max 270 Running Shoes',
        description: 'Premium running shoes with Max Air cushioning technology, breathable mesh upper, and durable rubber outsole. Perfect for daily runs and athletic activities.',
        shortDescription: 'Nike running shoes with Max Air cushioning',
        price: 89.99,
        originalPrice: 130.00,
        salePrice: 89.99,

        images: [
            { id: '8-1', url: getProductImageBySize('8', 'large'), alt: 'Nike Air Max 270 Running Shoes', size: 'large' },
            { id: '8-2', url: getProductImageBySize('8', 'medium'), alt: 'Nike Shoes Side View', size: 'medium' },
            { id: '8-3', url: getProductImageBySize('8', 'small'), alt: 'Nike Shoes Back View', size: 'small' },
        ],
        primaryImage: getProductImageBySize('8', 'large'),
        thumbnailImage: getProductImageBySize('8', 'small'),

        brand: 'Nike',
        model: 'Air Max 270',
        sku: 'NIKE-AM270-001',
        upc: '192499806123',
        category: 'fashion',
        subcategory: 'footwear',
        tags: ['nike', 'running shoes', 'athletic', 'air max', 'cushioning'],

        rating: 4.6,
        reviewCount: 1847,
        reviews: [],

        inStock: true,
        stockCount: 78,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'Nike Official',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard', 'Express'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '8-s1', name: 'Size', value: '7', price: 89.99, inStock: true },
                { id: '8-s2', name: 'Size', value: '7.5', price: 89.99, inStock: true },
                { id: '8-s3', name: 'Size', value: '8', price: 89.99, inStock: true },
                { id: '8-s4', name: 'Size', value: '8.5', price: 89.99, inStock: true },
                { id: '8-s5', name: 'Size', value: '9', price: 89.99, inStock: true },
                { id: '8-s6', name: 'Size', value: '9.5', price: 89.99, inStock: true },
                { id: '8-s7', name: 'Size', value: '10', price: 89.99, inStock: true },
                { id: '8-s8', name: 'Size', value: '10.5', price: 89.99, inStock: false },
                { id: '8-s9', name: 'Size', value: '11', price: 89.99, inStock: true },
                { id: '8-s10', name: 'Size', value: '12', price: 89.99, inStock: true },
            ],
            colors: [
                { id: '8-c1', name: 'Color', value: 'Black/White', price: 89.99, inStock: true },
                { id: '8-c2', name: 'Color', value: 'Navy/Red', price: 89.99, inStock: true },
                { id: '8-c3', name: 'Color', value: 'White/Gray', price: 94.99, inStock: true },
                { id: '8-c4', name: 'Color', value: 'Triple Black', price: 99.99, inStock: false },
            ],
        },

        features: [
            'Max Air unit in heel for superior cushioning',
            'Breathable mesh upper with synthetic overlays',
            'Rubber outsole with waffle pattern for traction',
            'Padded collar and tongue for comfort',
            'Pull tabs for easy on/off',
            'Iconic Nike Swoosh branding',
        ],

        specifications: {
            'Upper Material': 'Mesh and synthetic',
            'Sole Material': 'Rubber',
            'Closure Type': 'Lace-up',
            'Heel Type': 'Flat',
            'Toe Style': 'Round toe',
            'Care Instructions': 'Spot clean with damp cloth',
            'Country of Origin': 'Vietnam',
        },

        badge: 'Athletic',
        badgeColor: '#EF4444',
        discount: '31% off',
        featured: true,
        trending: true,
        bestSeller: true,

        slug: 'nike-air-max-270-running-shoes',
        relatedProducts: ['9', '201', '207'],

        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '9',
        name: 'Adidas Ultraboost 22 Sneakers',
        description: 'Premium performance sneakers with Boost midsole technology, Primeknit upper, and Continental rubber outsole. Designed for ultimate comfort and style.',
        shortDescription: 'Adidas sneakers with Boost technology',
        price: 119.99,
        originalPrice: 180.00,
        salePrice: 119.99,

        images: [
            { id: '9-1', url: getProductImageBySize('9', 'large'), alt: 'Adidas Ultraboost 22 Sneakers', size: 'large' },
            { id: '9-2', url: getProductImageBySize('9', 'medium'), alt: 'Adidas Sneakers Profile', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('9', 'large'),
        thumbnailImage: getProductImageBySize('9', 'small'),

        brand: 'Adidas',
        model: 'Ultraboost 22',
        sku: 'ADIDAS-UB22-001',
        category: 'fashion',
        subcategory: 'footwear',
        tags: ['adidas', 'ultraboost', 'sneakers', 'boost', 'performance'],

        rating: 4.7,
        reviewCount: 1234,
        reviews: [],

        inStock: true,
        stockCount: 64,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'Adidas Official',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard', 'Express'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '9-s1', name: 'Size', value: '6', price: 119.99, inStock: true },
                { id: '9-s2', name: 'Size', value: '6.5', price: 119.99, inStock: true },
                { id: '9-s3', name: 'Size', value: '7', price: 119.99, inStock: true },
                { id: '9-s4', name: 'Size', value: '7.5', price: 119.99, inStock: true },
                { id: '9-s5', name: 'Size', value: '8', price: 119.99, inStock: true },
                { id: '9-s6', name: 'Size', value: '8.5', price: 119.99, inStock: false },
                { id: '9-s7', name: 'Size', value: '9', price: 119.99, inStock: true },
                { id: '9-s8', name: 'Size', value: '9.5', price: 119.99, inStock: true },
                { id: '9-s9', name: 'Size', value: '10', price: 119.99, inStock: true },
                { id: '9-s10', name: 'Size', value: '11', price: 119.99, inStock: true },
            ],
            colors: [
                { id: '9-c1', name: 'Color', value: 'Core Black', price: 119.99, inStock: true },
                { id: '9-c2', name: 'Color', value: 'Cloud White', price: 119.99, inStock: true },
                { id: '9-c3', name: 'Color', value: 'Solar Red', price: 124.99, inStock: true },
                { id: '9-c4', name: 'Color', value: 'Collegiate Navy', price: 119.99, inStock: true },
            ],
        },

        features: [
            'Boost midsole for energy return',
            'Primeknit+ upper adapts to foot shape',
            'Continental rubber outsole for traction',
            'Linear Energy Push system',
            'Heel counter for stability',
            'Recycled materials construction',
        ],

        specifications: {
            'Upper Material': 'Primeknit+ textile',
            'Midsole': 'Boost foam',
            'Outsole': 'Continental rubber',
            'Drop': '10mm',
            'Weight': '10.9 oz (men\'s size 9)',
            'Support Type': 'Neutral',
            'Sustainability': 'Made with recycled materials',
        },

        badge: 'Performance',
        badgeColor: '#10B981',
        discount: '33% off',
        featured: true,
        trending: true,

        slug: 'adidas-ultraboost-22-sneakers',
        relatedProducts: ['8', '201', '208'],

        createdAt: new Date('2024-04-15'),
        updatedAt: new Date('2024-12-12'),
    },

    {
        id: '201',
        name: 'Designer Leather Handbag',
        description: 'Elegant genuine leather handbag with gold-tone hardware, multiple compartments, and detachable shoulder strap. Perfect for work and special occasions.',
        shortDescription: 'Premium leather handbag with gold hardware',
        price: 149.99,
        originalPrice: 299.99,
        salePrice: 149.99,

        images: [
            { id: '201-1', url: getProductImageBySize('10', 'large'), alt: 'Designer Leather Handbag', size: 'large' },
        ],
        primaryImage: getProductImageBySize('10', 'large'),

        brand: 'LuxeStyle',
        model: 'Classic Tote',
        sku: 'LUXE-BAG-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['handbag', 'leather', 'designer', 'tote', 'luxury'],

        rating: 4.8,
        reviewCount: 567,
        reviews: [],

        inStock: true,
        stockCount: 32,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'LuxeStyle',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '3-5 business days',
            methods: ['Standard', 'Express'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        variants: {
            colors: [
                { id: '201-c1', name: 'Color', value: 'Black', price: 149.99, inStock: true },
                { id: '201-c2', name: 'Color', value: 'Brown', price: 149.99, inStock: true },
                { id: '201-c3', name: 'Color', value: 'Navy', price: 154.99, inStock: true },
                { id: '201-c4', name: 'Color', value: 'Burgundy', price: 154.99, inStock: false },
            ],
        },

        features: [
            '100% genuine leather construction',
            'Gold-tone metal hardware',
            'Multiple interior compartments',
            'Detachable adjustable shoulder strap',
            'Magnetic snap closure',
            'Interior zip pocket and phone slots',
            'Dust bag included',
        ],

        specifications: {
            'Material': '100% genuine leather',
            'Dimensions': '13" W x 10" H x 5" D',
            'Strap Drop': '8" handle, 22" shoulder strap',
            'Closure': 'Magnetic snap',
            'Interior': 'Fabric lining with pockets',
            'Care Instructions': 'Wipe clean with leather conditioner',
            'Hardware': 'Gold-tone metal',
        },

        badge: 'Luxury',
        badgeColor: '#F59E0B',
        discount: '50% off',
        featured: true,
        trending: false,

        slug: 'designer-leather-handbag',
        relatedProducts: ['8', '9', '204'],

        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-12-10'),
    },

    {
        id: '202',
        name: 'Wool Blend Winter Coat',
        description: 'Stylish wool blend winter coat with quilted lining, faux fur trim hood, and multiple pockets. Combines warmth with sophisticated urban style.',
        shortDescription: 'Wool blend winter coat with faux fur hood',
        price: 89.99,
        originalPrice: 179.99,
        salePrice: 89.99,

        images: [
            { id: '202-1', url: getProductImageBySize('11', 'large'), alt: 'Wool Blend Winter Coat', size: 'large' },
        ],
        primaryImage: getProductImageBySize('11', 'large'),

        brand: 'UrbanWarm',
        model: 'City Classic',
        sku: 'UW-COAT-001',
        category: 'fashion',
        subcategory: 'outerwear',
        tags: ['winter coat', 'wool blend', 'outerwear', 'warm', 'urban'],

        rating: 4.5,
        reviewCount: 789,
        reviews: [],

        inStock: true,
        stockCount: 28,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'UrbanWarm',
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

        variants: {
            sizes: [
                { id: '202-s1', name: 'Size', value: 'XS', price: 89.99, inStock: true },
                { id: '202-s2', name: 'Size', value: 'S', price: 89.99, inStock: true },
                { id: '202-s3', name: 'Size', value: 'M', price: 89.99, inStock: true },
                { id: '202-s4', name: 'Size', value: 'L', price: 89.99, inStock: true },
                { id: '202-s5', name: 'Size', value: 'XL', price: 89.99, inStock: false },
                { id: '202-s6', name: 'Size', value: 'XXL', price: 94.99, inStock: true },
            ],
            colors: [
                { id: '202-c1', name: 'Color', value: 'Charcoal Gray', price: 89.99, inStock: true },
                { id: '202-c2', name: 'Color', value: 'Navy Blue', price: 89.99, inStock: true },
                { id: '202-c3', name: 'Color', value: 'Camel', price: 94.99, inStock: true },
                { id: '202-c4', name: 'Color', value: 'Black', price: 89.99, inStock: true },
            ],
        },

        features: [
            '60% wool, 40% polyester blend',
            'Quilted polyester lining for warmth',
            'Detachable faux fur trim hood',
            'Two-way front zipper with snap storm flap',
            'Four exterior pockets plus interior pockets',
            'Adjustable cuffs with snap buttons',
            'Water-resistant outer shell',
        ],

        specifications: {
            'Material': '60% wool, 40% polyester',
            'Lining': 'Quilted polyester',
            'Hood': 'Detachable with faux fur trim',
            'Closure': 'Two-way zipper with snaps',
            'Fit': 'Regular fit',
            'Length': 'Mid-thigh (size M: 32")',
            'Care': 'Dry clean only',
        },

        badge: 'Winter Essential',
        badgeColor: '#3B82F6',
        discount: '50% off',
        featured: true,
        trending: true,

        slug: 'wool-blend-winter-coat',
        relatedProducts: ['203', '204', '209'],

        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-12-14'),
    },

    // =====================================
    // MEDIUM FASHION ITEMS (med_07-10)
    // =====================================
    {
        id: '203',
        name: 'Floral Print Midi Dress',
        description: 'Elegant floral print midi dress with three-quarter sleeves, wrap silhouette, and flowing skirt. Perfect for both casual and semi-formal occasions.',
        shortDescription: 'Floral midi dress with wrap silhouette',
        price: 45.99,
        originalPrice: 89.99,
        salePrice: 45.99,

        images: [
            { id: '203-1', url: getProductImageBySize('7', 'medium'), alt: 'Floral Print Midi Dress', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('7', 'medium'),

        brand: 'FloralFashion',
        model: 'Garden Party',
        sku: 'FF-DRESS-001',
        category: 'fashion',
        subcategory: 'clothing',
        tags: ['dress', 'floral', 'midi', 'wrap dress', 'feminine'],

        rating: 4.6,
        reviewCount: 456,
        reviews: [],

        inStock: true,
        stockCount: 45,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'FloralFashion',
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
                { id: '203-s1', name: 'Size', value: 'XS', price: 45.99, inStock: true },
                { id: '203-s2', name: 'Size', value: 'S', price: 45.99, inStock: true },
                { id: '203-s3', name: 'Size', value: 'M', price: 45.99, inStock: true },
                { id: '203-s4', name: 'Size', value: 'L', price: 45.99, inStock: true },
                { id: '203-s5', name: 'Size', value: 'XL', price: 45.99, inStock: true },
                { id: '203-s6', name: 'Size', value: 'XXL', price: 49.99, inStock: true },
            ],
            colors: [
                { id: '203-c1', name: 'Print', value: 'Pink Floral', price: 45.99, inStock: true },
                { id: '203-c2', name: 'Print', value: 'Blue Floral', price: 45.99, inStock: true },
                { id: '203-c3', name: 'Print', value: 'Yellow Floral', price: 48.99, inStock: false },
                { id: '203-c4', name: 'Print', value: 'White Floral', price: 45.99, inStock: true },
            ],
        },

        features: [
            'Wrap-style silhouette flatters all body types',
            'Three-quarter length sleeves',
            'Midi length falls below knee',
            'Tie waist for adjustable fit',
            'Flowing A-line skirt',
            'Soft, lightweight fabric',
            'Machine washable',
        ],

        specifications: {
            'Material': '95% polyester, 5% spandex',
            'Neckline': 'V-neck wrap style',
            'Sleeve Length': '3/4 sleeves',
            'Dress Length': 'Midi (size M: 42")',
            'Closure': 'Wrap tie closure',
            'Fit': 'Regular fit',
            'Care': 'Machine wash cold, hang dry',
        },

        badge: 'Feminine',
        badgeColor: '#EC4899',
        discount: '49% off',
        featured: false,

        slug: 'floral-print-midi-dress',
        relatedProducts: ['204', '205', '212'],

        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-08'),
    },

    {
        id: '204',
        name: 'Premium Skinny Jeans',
        description: 'High-quality stretch denim skinny jeans with mid-rise waist, classic five-pocket styling, and comfortable all-day fit. A wardrobe essential.',
        shortDescription: 'Stretch denim skinny jeans with mid-rise waist',
        price: 34.99,
        originalPrice: 69.99,
        salePrice: 34.99,

        images: [
            { id: '204-1', url: getProductImageBySize('8', 'medium'), alt: 'Premium Skinny Jeans', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('8', 'medium'),

        brand: 'DenimCo',
        model: 'Perfect Fit',
        sku: 'DC-JEANS-001',
        category: 'fashion',
        subcategory: 'clothing',
        tags: ['jeans', 'skinny', 'denim', 'stretch', 'mid-rise'],

        rating: 4.7,
        reviewCount: 1283,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'DenimCo',
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
                { id: '204-s1', name: 'Size', value: '24', price: 34.99, inStock: true },
                { id: '204-s2', name: 'Size', value: '25', price: 34.99, inStock: true },
                { id: '204-s3', name: 'Size', value: '26', price: 34.99, inStock: true },
                { id: '204-s4', name: 'Size', value: '27', price: 34.99, inStock: true },
                { id: '204-s5', name: 'Size', value: '28', price: 34.99, inStock: true },
                { id: '204-s6', name: 'Size', value: '29', price: 34.99, inStock: true },
                { id: '204-s7', name: 'Size', value: '30', price: 34.99, inStock: false },
                { id: '204-s8', name: 'Size', value: '31', price: 34.99, inStock: true },
                { id: '204-s9', name: 'Size', value: '32', price: 34.99, inStock: true },
            ],
            colors: [
                { id: '204-c1', name: 'Wash', value: 'Dark Indigo', price: 34.99, inStock: true },
                { id: '204-c2', name: 'Wash', value: 'Medium Blue', price: 34.99, inStock: true },
                { id: '204-c3', name: 'Wash', value: 'Light Wash', price: 34.99, inStock: true },
                { id: '204-c4', name: 'Wash', value: 'Black', price: 36.99, inStock: true },
            ],
            lengths: [
                { id: '204-l1', name: 'Inseam', value: '28"', price: 34.99, inStock: true },
                { id: '204-l2', name: 'Inseam', value: '30"', price: 34.99, inStock: true },
                { id: '204-l3', name: 'Inseam', value: '32"', price: 34.99, inStock: true },
                { id: '204-l4', name: 'Inseam', value: '34"', price: 34.99, inStock: true },
            ],
        },

        features: [
            '98% cotton, 2% elastane stretch denim',
            'Mid-rise waist sits at natural waistline',
            'Skinny fit through hip and thigh',
            'Classic five-pocket styling',
            'Button closure with zip fly',
            'Belt loops',
            'Machine washable',
        ],

        specifications: {
            'Material': '98% cotton, 2% elastane',
            'Rise': 'Mid-rise (9" front rise)',
            'Fit': 'Skinny through hip and thigh',
            'Leg Opening': '10" (size 27)',
            'Closure': 'Button and zip fly',
            'Pockets': 'Five-pocket styling',
            'Care': 'Machine wash cold, tumble dry low',
        },

        badge: 'Essential',
        badgeColor: '#6B7280',
        discount: '50% off',
        featured: true,
        bestSeller: true,

        slug: 'premium-skinny-jeans',
        relatedProducts: ['203', '205', '8'],

        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-12-13'),
    },

    {
        id: '205',
        name: 'Cozy Knit Sweater',
        description: 'Soft and warm knit sweater with classic crew neck, ribbed cuffs and hem. Made from premium cotton blend for ultimate comfort and style.',
        shortDescription: 'Soft cotton blend knit sweater with crew neck',
        price: 29.99,
        originalPrice: 59.99,
        salePrice: 29.99,

        images: [
            { id: '205-1', url: getProductImageBySize('9', 'medium'), alt: 'Cozy Knit Sweater', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('9', 'medium'),

        brand: 'CozyWear',
        model: 'Classic Crew',
        sku: 'CW-SWEATER-001',
        category: 'fashion',
        subcategory: 'clothing',
        tags: ['sweater', 'knit', 'crew neck', 'cozy', 'cotton'],

        rating: 4.5,
        reviewCount: 634,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'CozyWear',
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
                { id: '205-s1', name: 'Size', value: 'XS', price: 29.99, inStock: true },
                { id: '205-s2', name: 'Size', value: 'S', price: 29.99, inStock: true },
                { id: '205-s3', name: 'Size', value: 'M', price: 29.99, inStock: true },
                { id: '205-s4', name: 'Size', value: 'L', price: 29.99, inStock: true },
                { id: '205-s5', name: 'Size', value: 'XL', price: 29.99, inStock: true },
                { id: '205-s6', name: 'Size', value: 'XXL', price: 32.99, inStock: true },
            ],
            colors: [
                { id: '205-c1', name: 'Color', value: 'Cream', price: 29.99, inStock: true },
                { id: '205-c2', name: 'Color', value: 'Navy', price: 29.99, inStock: true },
                { id: '205-c3', name: 'Color', value: 'Forest Green', price: 29.99, inStock: true },
                { id: '205-c4', name: 'Color', value: 'Burgundy', price: 32.99, inStock: false },
                { id: '205-c5', name: 'Color', value: 'Charcoal Gray', price: 29.99, inStock: true },
            ],
        },

        features: [
            '70% cotton, 30% acrylic blend for softness',
            'Classic crew neck design',
            'Ribbed cuffs and hem for shape retention',
            'Regular fit for comfortable layering',
            'Soft hand feel and breathable',
            'Pre-shrunk to minimize shrinkage',
            'Machine washable',
        ],

        specifications: {
            'Material': '70% cotton, 30% acrylic',
            'Neckline': 'Crew neck',
            'Sleeve Length': 'Long sleeves',
            'Fit': 'Regular fit',
            'Care': 'Machine wash cold, reshape and lay flat to dry',
            'Weight': 'Medium weight knit',
            'Season': 'Fall/Winter',
        },

        badge: 'Comfort',
        badgeColor: '#10B981',
        discount: '50% off',
        featured: false,

        slug: 'cozy-knit-sweater',
        relatedProducts: ['202', '204', '203'],

        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-12-07'),
    },

    {
        id: '206',
        name: 'Classic Analog Watch',
        description: 'Elegant stainless steel watch with leather strap, water-resistant design, and precise quartz movement. Perfect for both business and casual wear.',
        shortDescription: 'Stainless steel watch with leather strap',
        price: 79.99,
        originalPrice: 149.99,
        salePrice: 79.99,

        images: [
            { id: '206-1', url: getProductImageBySize('10', 'medium'), alt: 'Classic Analog Watch', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('10', 'medium'),

        brand: 'TimeClassic',
        model: 'Executive',
        sku: 'TC-WATCH-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['watch', 'analog', 'leather strap', 'stainless steel', 'classic'],

        rating: 4.6,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 43,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'TimeClassic',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '2-3 business days',
            methods: ['Standard', 'Express'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            colors: [
                { id: '206-c1', name: 'Strap Color', value: 'Brown Leather', price: 79.99, inStock: true },
                { id: '206-c2', name: 'Strap Color', value: 'Black Leather', price: 79.99, inStock: true },
                { id: '206-c3', name: 'Strap Color', value: 'Navy Leather', price: 84.99, inStock: true },
            ],
            dial: [
                { id: '206-d1', name: 'Dial Color', value: 'White', price: 79.99, inStock: true },
                { id: '206-d2', name: 'Dial Color', value: 'Black', price: 79.99, inStock: true },
                { id: '206-d3', name: 'Dial Color', value: 'Blue', price: 84.99, inStock: true },
            ],
        },

        features: [
            'Stainless steel case and bezel',
            'Genuine leather strap with buckle closure',
            'Precise Japanese quartz movement',
            'Water resistant up to 50 meters',
            'Scratch-resistant mineral crystal',
            'Date display window',
            'Luminous hands for low-light reading',
        ],

        specifications: {
            'Case Material': 'Stainless steel',
            'Case Diameter': '42mm',
            'Case Thickness': '10mm',
            'Strap Material': 'Genuine leather',
            'Strap Width': '20mm',
            'Movement': 'Japanese quartz',
            'Water Resistance': '50 meters (5 ATM)',
            'Crystal': 'Mineral crystal',
        },

        badge: 'Timeless',
        badgeColor: '#F59E0B',
        discount: '47% off',
        featured: true,

        slug: 'classic-analog-watch',
        relatedProducts: ['201', '210', '211'],

        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-12-11'),
    },

    // =====================================
    // SMALL FASHION ITEMS (small_07-12)
    // =====================================
    {
        id: '207',
        name: 'Polarized Aviator Sunglasses',
        description: 'Classic aviator sunglasses with polarized lenses, UV400 protection, and durable metal frame. Essential accessory for style and eye protection.',
        shortDescription: 'Polarized aviator sunglasses with UV protection',
        price: 24.99,
        originalPrice: 59.99,
        salePrice: 24.99,

        images: [
            { id: '207-1', url: getProductImageBySize('7', 'small'), alt: 'Polarized Aviator Sunglasses', size: 'small' },
        ],
        primaryImage: getProductImageBySize('7', 'small'),

        brand: 'SunStyle',
        model: 'Classic Aviator',
        sku: 'SS-SUNGLASS-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['sunglasses', 'aviator', 'polarized', 'uv protection', 'classic'],

        rating: 4.4,
        reviewCount: 756,
        reviews: [],

        inStock: true,
        stockCount: 123,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'SunStyle',
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
                { id: '207-c1', name: 'Frame Color', value: 'Gold/Black', price: 24.99, inStock: true },
                { id: '207-c2', name: 'Frame Color', value: 'Silver/Gray', price: 24.99, inStock: true },
                { id: '207-c3', name: 'Frame Color', value: 'Black/Black', price: 24.99, inStock: true },
                { id: '207-c4', name: 'Frame Color', value: 'Rose Gold/Brown', price: 27.99, inStock: true },
            ],
        },

        features: [
            'Polarized lenses reduce glare',
            'UV400 protection blocks harmful rays',
            'Classic aviator teardrop shape',
            'Lightweight metal frame',
            'Adjustable nose pads for comfort',
            'Spring-loaded hinges',
            'Includes protective carrying case',
        ],

        specifications: {
            'Lens Material': 'Polarized TAC',
            'Frame Material': 'Metal alloy',
            'Lens Width': '58mm',
            'Bridge Width': '14mm',
            'Temple Length': '140mm',
            'UV Protection': 'UV400 (100% UVA/UVB)',
            'Polarization': 'Yes',
        },

        badge: 'UV Protection',
        badgeColor: '#F59E0B',
        discount: '58% off',
        featured: false,

        slug: 'polarized-aviator-sunglasses',
        relatedProducts: ['8', '9', '206'],

        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-12-09'),
    },

    {
        id: '208',
        name: 'Genuine Leather Belt',
        description: 'Premium full-grain leather belt with classic buckle design, adjustable sizing, and timeless style. Perfect for dress pants and jeans.',
        shortDescription: 'Full-grain leather belt with classic buckle',
        price: 19.99,
        originalPrice: 39.99,
        salePrice: 19.99,

        images: [
            { id: '208-1', url: getProductImageBySize('8', 'small'), alt: 'Genuine Leather Belt', size: 'small' },
        ],
        primaryImage: getProductImageBySize('8', 'small'),

        brand: 'LeatherCraft',
        model: 'Classic',
        sku: 'LC-BELT-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['belt', 'leather', 'genuine leather', 'classic', 'buckle'],

        rating: 4.7,
        reviewCount: 1234,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'LeatherCraft',
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
                { id: '208-s1', name: 'Size', value: '30"', price: 19.99, inStock: true },
                { id: '208-s2', name: 'Size', value: '32"', price: 19.99, inStock: true },
                { id: '208-s3', name: 'Size', value: '34"', price: 19.99, inStock: true },
                { id: '208-s4', name: 'Size', value: '36"', price: 19.99, inStock: true },
                { id: '208-s5', name: 'Size', value: '38"', price: 19.99, inStock: true },
                { id: '208-s6', name: 'Size', value: '40"', price: 19.99, inStock: false },
                { id: '208-s7', name: 'Size', value: '42"', price: 19.99, inStock: true },
            ],
            colors: [
                { id: '208-c1', name: 'Color', value: 'Black', price: 19.99, inStock: true },
                { id: '208-c2', name: 'Color', value: 'Brown', price: 19.99, inStock: true },
                { id: '208-c3', name: 'Color', value: 'Cognac', price: 22.99, inStock: true },
            ],
        },

        features: [
            '100% genuine full-grain leather',
            'Classic rectangular buckle design',
            'Adjustable with multiple hole positions',
            'Hand-stitched edges for durability',
            'Smooth finish resists cracking',
            'Versatile for dress and casual wear',
            'Gift box included',
        ],

        specifications: {
            'Material': '100% full-grain leather',
            'Width': '1.25 inches (32mm)',
            'Buckle': 'Metal rectangular buckle',
            'Holes': '5 adjustment holes',
            'Edge': 'Hand-stitched and finished',
            'Care': 'Condition regularly with leather care products',
            'Origin': 'Genuine leather',
        },

        badge: 'Quality',
        badgeColor: '#10B981',
        discount: '50% off',
        featured: false,

        slug: 'genuine-leather-belt',
        relatedProducts: ['204', '206', '209'],

        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-12-12'),
    },

    {
        id: '209',
        name: 'Wool Beanie Hat',
        description: 'Soft merino wool beanie with classic ribbed design, fold-up cuff, and warm lining. Perfect for cold weather and outdoor activities.',
        shortDescription: 'Merino wool beanie with ribbed design',
        price: 14.99,
        originalPrice: 29.99,
        salePrice: 14.99,

        images: [
            { id: '209-1', url: getProductImageBySize('9', 'small'), alt: 'Wool Beanie Hat', size: 'small' },
        ],
        primaryImage: getProductImageBySize('9', 'small'),

        brand: 'WarmWear',
        model: 'Classic Beanie',
        sku: 'WW-BEANIE-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['beanie', 'wool', 'hat', 'winter', 'warm'],

        rating: 4.5,
        reviewCount: 567,
        reviews: [],

        inStock: true,
        stockCount: 156,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'WarmWear',
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
                { id: '209-c1', name: 'Color', value: 'Charcoal Gray', price: 14.99, inStock: true },
                { id: '209-c2', name: 'Color', value: 'Navy Blue', price: 14.99, inStock: true },
                { id: '209-c3', name: 'Color', value: 'Black', price: 14.99, inStock: true },
                { id: '209-c4', name: 'Color', value: 'Burgundy', price: 16.99, inStock: true },
                { id: '209-c5', name: 'Color', value: 'Forest Green', price: 14.99, inStock: true },
                { id: '209-c6', name: 'Color', value: 'Cream', price: 16.99, inStock: false },
            ],
        },

        features: [
            '100% merino wool construction',
            'Classic ribbed knit pattern',
            'Fold-up cuff for versatile styling',
            'Soft fleece lining for extra warmth',
            'One size fits most adults',
            'Machine washable on gentle cycle',
            'Naturally odor-resistant',
        ],

        specifications: {
            'Material': '100% merino wool',
            'Lining': 'Polyester fleece',
            'Fit': 'One size fits most',
            'Care': 'Machine wash gentle, lay flat to dry',
            'Season': 'Fall/Winter',
            'Weight': 'Lightweight warmth',
            'Origin': 'Responsibly sourced wool',
        },

        badge: 'Winter Essential',
        badgeColor: '#3B82F6',
        discount: '50% off',
        featured: false,

        slug: 'wool-beanie-hat',
        relatedProducts: ['202', '205', '210'],

        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-12-14'),
    },

    {
        id: '210',
        name: 'Cashmere-Feel Scarf',
        description: 'Luxuriously soft scarf with cashmere-like feel, lightweight warmth, and elegant drape. Available in various colors to complement any outfit.',
        shortDescription: 'Soft cashmere-feel scarf with elegant drape',
        price: 16.99,
        originalPrice: 34.99,
        salePrice: 16.99,

        images: [
            { id: '210-1', url: getProductImageBySize('10', 'small'), alt: 'Cashmere-Feel Scarf', size: 'small' },
        ],
        primaryImage: getProductImageBySize('10', 'small'),

        brand: 'LuxeAccessories',
        model: 'Soft Touch',
        sku: 'LA-SCARF-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['scarf', 'cashmere feel', 'soft', 'elegant', 'warm'],

        rating: 4.6,
        reviewCount: 445,
        reviews: [],

        inStock: true,
        stockCount: 78,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'LuxeAccessories',
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
                { id: '210-c1', name: 'Color', value: 'Soft Pink', price: 16.99, inStock: true },
                { id: '210-c2', name: 'Color', value: 'Light Gray', price: 16.99, inStock: true },
                { id: '210-c3', name: 'Color', value: 'Cream', price: 16.99, inStock: true },
                { id: '210-c4', name: 'Color', value: 'Navy Blue', price: 16.99, inStock: true },
                { id: '210-c5', name: 'Color', value: 'Burgundy', price: 18.99, inStock: true },
                { id: '210-c6', name: 'Color', value: 'Black', price: 16.99, inStock: false },
            ],
        },

        features: [
            'Ultra-soft acrylic blend feels like cashmere',
            'Lightweight yet warm design',
            'Elegant drape and flow',
            'Versatile styling options',
            'Fringed edges for classic look',
            'Wrinkle-resistant material',
            'Easy care - machine washable',
        ],

        specifications: {
            'Material': '90% acrylic, 10% viscose',
            'Dimensions': '70" L x 28" W',
            'Weight': 'Lightweight (4 oz)',
            'Care': 'Machine wash cold, lay flat to dry',
            'Season': 'Fall/Winter/Spring',
            'Style': 'Rectangular wrap with fringe',
            'Feel': 'Cashmere-like softness',
        },

        badge: 'Luxe Feel',
        badgeColor: '#EC4899',
        discount: '51% off',
        featured: false,

        slug: 'cashmere-feel-scarf',
        relatedProducts: ['202', '209', '203'],

        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '211',
        name: 'RFID Blocking Wallet',
        description: 'Premium leather wallet with RFID blocking technology, multiple card slots, bill compartment, and slim profile. Protects against electronic theft.',
        shortDescription: 'Leather wallet with RFID blocking protection',
        price: 22.99,
        originalPrice: 49.99,
        salePrice: 22.99,

        images: [
            { id: '211-1', url: getProductImageBySize('11', 'small'), alt: 'RFID Blocking Wallet', size: 'small' },
        ],
        primaryImage: getProductImageBySize('11', 'small'),

        brand: 'SecureStyle',
        model: 'Guardian',
        sku: 'SS-WALLET-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['wallet', 'rfid blocking', 'leather', 'security', 'slim'],

        rating: 4.7,
        reviewCount: 823,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'SecureStyle',
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
                { id: '211-c1', name: 'Color', value: 'Black', price: 22.99, inStock: true },
                { id: '211-c2', name: 'Color', value: 'Brown', price: 22.99, inStock: true },
                { id: '211-c3', name: 'Color', value: 'Navy', price: 24.99, inStock: true },
            ],
        },

        features: [
            'RFID blocking technology protects cards',
            'Genuine leather construction',
            '8 credit card slots',
            '2 bill compartments',
            '2 additional pockets for receipts',
            'Slim profile fits in front pocket',
            'Reinforced stitching for durability',
        ],

        specifications: {
            'Material': 'Genuine leather with RFID lining',
            'Dimensions': '4.3" L x 3.4" W x 0.4" H',
            'Card Capacity': '8 credit cards',
            'Bill Compartments': '2',
            'RFID Protection': 'Blocks 13.56 MHz frequency',
            'Weight': '2.1 oz',
            'Care': 'Wipe clean with damp cloth',
        },

        badge: 'Security',
        badgeColor: '#059669',
        discount: '54% off',
        featured: false,

        slug: 'rfid-blocking-wallet',
        relatedProducts: ['208', '206', '212'],

        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '212',
        name: 'Fashion Phone Case',
        description: 'Stylish phone case with marble pattern design, shock-absorbing corners, and precise cutouts. Combines protection with fashionable aesthetics.',
        shortDescription: 'Marble pattern phone case with shock protection',
        price: 12.99,
        originalPrice: 24.99,
        salePrice: 12.99,

        images: [
            { id: '212-1', url: getProductImageBySize('12', 'small'), alt: 'Fashion Phone Case', size: 'small' },
        ],
        primaryImage: getProductImageBySize('12', 'small'),

        brand: 'CaseFashion',
        model: 'Marble Pro',
        sku: 'CF-CASE-001',
        category: 'fashion',
        subcategory: 'accessories',
        tags: ['phone case', 'fashion', 'marble', 'protection', 'stylish'],

        rating: 4.4,
        reviewCount: 1567,
        reviews: [],

        inStock: true,
        stockCount: 234,
        status: 'available',
        maxQuantity: 8,
        minQuantity: 1,

        seller: 'CaseFashion',
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
            models: [
                { id: '212-m1', name: 'Phone Model', value: 'iPhone 15 Pro', price: 12.99, inStock: true },
                { id: '212-m2', name: 'Phone Model', value: 'iPhone 15', price: 12.99, inStock: true },
                { id: '212-m3', name: 'Phone Model', value: 'iPhone 14 Pro', price: 12.99, inStock: true },
                { id: '212-m4', name: 'Phone Model', value: 'iPhone 14', price: 12.99, inStock: true },
                { id: '212-m5', name: 'Phone Model', value: 'Samsung Galaxy S24', price: 12.99, inStock: true },
                { id: '212-m6', name: 'Phone Model', value: 'Samsung Galaxy S23', price: 12.99, inStock: false },
            ],
            patterns: [
                { id: '212-p1', name: 'Pattern', value: 'White Marble', price: 12.99, inStock: true },
                { id: '212-p2', name: 'Pattern', value: 'Black Marble', price: 12.99, inStock: true },
                { id: '212-p3', name: 'Pattern', value: 'Rose Gold Marble', price: 14.99, inStock: true },
                { id: '212-p4', name: 'Pattern', value: 'Blue Marble', price: 12.99, inStock: true },
            ],
        },

        features: [
            'Elegant marble pattern design',
            'Shock-absorbing TPU material',
            'Raised edges protect screen and camera',
            'Precise cutouts for all ports',
            'Wireless charging compatible',
            'Anti-yellowing technology',
            'Easy to install and remove',
        ],

        specifications: {
            'Material': 'TPU with marble pattern coating',
            'Protection': 'Drop protection up to 6 feet',
            'Compatibility': 'Wireless charging compatible',
            'Thickness': '2mm slim profile',
            'Weight': '1.2 oz',
            'Cutouts': 'Precise for all buttons and ports',
            'Care': 'Wipe clean with damp cloth',
        },

        badge: 'Trending',
        badgeColor: '#8B5CF6',
        discount: '48% off',
        featured: false,

        slug: 'fashion-phone-case',
        relatedProducts: ['4', '207', '211'],

        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
    },
];

// =====================================
// FASHION SUBCATEGORIES
// =====================================
export const FASHION_SUBCATEGORIES = [
    {
        id: 'footwear',
        name: 'Footwear',
        description: 'Shoes, sneakers, boots, and athletic footwear',
        icon: 'footsteps-outline',
        color: '#EF4444',
        productCount: 2,
        featured: true,
    },
    {
        id: 'clothing',
        name: 'Clothing',
        description: 'Dresses, tops, bottoms, and everyday wear',
        icon: 'shirt-outline',
        color: '#3B82F6',
        productCount: 3,
        featured: true,
    },
    {
        id: 'accessories',
        name: 'Accessories',
        description: 'Bags, jewelry, belts, and fashion accessories',
        icon: 'bag-outline',
        color: '#F59E0B',
        productCount: 6,
        featured: true,
    },
    {
        id: 'outerwear',
        name: 'Outerwear',
        description: 'Coats, jackets, and seasonal wear',
        icon: 'jacket-outline',
        color: '#059669',
        productCount: 1,
        featured: true,
    },
    {
        id: 'activewear',
        name: 'Activewear',
        description: 'Athletic wear and performance clothing',
        icon: 'fitness-outline',
        color: '#8B5CF6',
        productCount: 0,
        featured: false,
    },
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get all fashion products
 */
export const getAllFashionProducts = (): Product[] => {
    return FASHION_PRODUCTS;
};

/**
 * Get fashion products by subcategory
 */
export const getFashionBySubcategory = (subcategory: string): Product[] => {
    return FASHION_PRODUCTS.filter(product => product.subcategory === subcategory);
};

/**
 * Get featured fashion products
 */
export const getFeaturedFashion = (): Product[] => {
    return FASHION_PRODUCTS.filter(product => product.featured === true);
};

/**
 * Get trending fashion products
 */
export const getTrendingFashion = (): Product[] => {
    return FASHION_PRODUCTS.filter(product => product.trending === true);
};

/**
 * Get fashion products on sale
 */
export const getFashionOnSale = (): Product[] => {
    return FASHION_PRODUCTS.filter(product =>
        product.originalPrice && product.price < product.originalPrice
    );
};

/**
 * Get fashion products by brand
 */
export const getFashionByBrand = (brand: string): Product[] => {
    return FASHION_PRODUCTS.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );
};

/**
 * Get fashion products by size
 */
export const getFashionBySize = (size: string): Product[] => {
    return FASHION_PRODUCTS.filter(product =>
        product.variants?.sizes?.some(s => s.value === size)
    );
};

/**
 * Get fashion products by color
 */
export const getFashionByColor = (color: string): Product[] => {
    return FASHION_PRODUCTS.filter(product =>
        product.variants?.colors?.some(c => c.value.toLowerCase().includes(color.toLowerCase()))
    );
};

/**
 * Get fashion products by price range
 */
export const getFashionByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return FASHION_PRODUCTS.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );
};

/**
 * Search fashion products
 */
export const searchFashionProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return FASHION_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Get fashion product by ID
 */
export const getFashionProductById = (id: string): Product | undefined => {
    return FASHION_PRODUCTS.find(product => product.id === id);
};

/**
 * Get related fashion products
 */
export const getRelatedFashionProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getFashionProductById(productId);
    if (!product || !product.relatedProducts) return [];

    return product.relatedProducts
        .map(id => getFashionProductById(id))
        .filter(Boolean)
        .slice(0, limit) as Product[];
};

/**
 * Get fashion products by rating
 */
export const getTopRatedFashion = (minRating: number = 4.5): Product[] => {
    return FASHION_PRODUCTS.filter(product => product.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Get best selling fashion items
 */
export const getBestSellingFashion = (): Product[] => {
    return FASHION_PRODUCTS.filter(product => product.bestSeller === true);
};

/**
 * Get new fashion arrivals
 */
export const getNewFashionArrivals = (): Product[] => {
    return FASHION_PRODUCTS.filter(product => product.newArrival === true);
};

/**
 * Get fashion items by gender/category
 */
export const getFashionByGender = (gender: 'men' | 'women' | 'unisex'): Product[] => {
    // This could be enhanced with a gender field in the product interface
    // For now, we'll use tags or product names to infer gender
    const genderKeywords = {
        men: ['men', 'male', 'masculine'],
        women: ['women', 'female', 'feminine', 'dress', 'handbag'],
        unisex: ['unisex', 'universal', 'sneakers', 'sunglasses', 'watch']
    };

    return FASHION_PRODUCTS.filter(product => {
        const keywords = genderKeywords[gender];
        return keywords.some(keyword =>
            product.name.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
    });
};

/**
 * Get seasonal fashion items
 */
export const getSeasonalFashion = (season: 'spring' | 'summer' | 'fall' | 'winter'): Product[] => {
    const seasonalItems = {
        spring: ['light', 'jacket', 'scarf'],
        summer: ['sunglasses', 'light'],
        fall: ['sweater', 'jacket', 'boot'],
        winter: ['coat', 'beanie', 'scarf', 'warm']
    };

    const keywords = seasonalItems[season];
    return FASHION_PRODUCTS.filter(product =>
        keywords.some(keyword =>
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
    );
};

/**
 * Get fashion items by material
 */
export const getFashionByMaterial = (material: string): Product[] => {
    return FASHION_PRODUCTS.filter(product =>
        product.specifications &&
        Object.values(product.specifications).some(spec =>
            spec.toLowerCase().includes(material.toLowerCase())
        )
    );
};

/**
 * Get fashion accessories
 */
export const getFashionAccessories = (): Product[] => {
    return getFashionBySubcategory('accessories');
};

/**
 * Get footwear products
 */
export const getFootwear = (): Product[] => {
    return getFashionBySubcategory('footwear');
};

/**
 * Get clothing products
 */
export const getClothing = (): Product[] => {
    return getFashionBySubcategory('clothing');
};

/**
 * Get outerwear products
 */
export const getOuterwear = (): Product[] => {
    return getFashionBySubcategory('outerwear');
};

/**
 * Get products by style/occasion
 */
export const getFashionByOccasion = (occasion: 'casual' | 'formal' | 'athletic' | 'work'): Product[] => {
    const occasionKeywords = {
        casual: ['casual', 'everyday', 'comfort'],
        formal: ['elegant', 'dress', 'formal', 'business'],
        athletic: ['athletic', 'running', 'sports', 'performance'],
        work: ['business', 'professional', 'work', 'office']
    };

    const keywords = occasionKeywords[occasion];
    return FASHION_PRODUCTS.filter(product =>
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
    products: FASHION_PRODUCTS,
    subcategories: FASHION_SUBCATEGORIES,
    getAllProducts: getAllFashionProducts,
    getBySubcategory: getFashionBySubcategory,
    getFeatured: getFeaturedFashion,
    getTrending: getTrendingFashion,
    getOnSale: getFashionOnSale,
    getByBrand: getFashionByBrand,
    getBySize: getFashionBySize,
    getByColor: getFashionByColor,
    getByPriceRange: getFashionByPriceRange,
    search: searchFashionProducts,
    getById: getFashionProductById,
    getRelated: getRelatedFashionProducts,
    getTopRated: getTopRatedFashion,
    getBestSelling: getBestSellingFashion,
    getNewArrivals: getNewFashionArrivals,
    getByGender: getFashionByGender,
    getSeasonal: getSeasonalFashion,
    getByMaterial: getFashionByMaterial,
    getAccessories: getFashionAccessories,
    getFootwear: getFootwear,
    getClothing: getClothing,
    getOuterwear: getOuterwear,
    getByOccasion: getFashionByOccasion,
};