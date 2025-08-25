// constants/products/home-garden.ts
// Home & Garden category products

import { Product } from './interfaces';
import { getProductImageBySize, getBannerImage } from '../../assets/images/imageLoader';

export const HOME_GARDEN_PRODUCTS: Product[] = [
    // =====================================
    // LARGE HOME & GARDEN ITEMS (prod_12-16)
    // =====================================
    {
        id: '12',
        name: 'Modern Coffee Table with Storage',
        description: 'Stylish modern coffee table with hidden storage compartment, solid wood construction, and sleek design. Perfect centerpiece for your living room.',
        shortDescription: 'Modern coffee table with hidden storage',
        price: 179.99,
        originalPrice: 299.99,
        salePrice: 179.99,

        images: [
            { id: '12-1', url: getProductImageBySize('12', 'large'), alt: 'Modern Coffee Table with Storage', size: 'large' },
            { id: '12-2', url: getProductImageBySize('12', 'medium'), alt: 'Coffee Table Open Storage', size: 'medium' },
            { id: '12-3', url: getProductImageBySize('12', 'small'), alt: 'Coffee Table Side View', size: 'small' },
        ],
        primaryImage: getProductImageBySize('12', 'large'),
        thumbnailImage: getProductImageBySize('12', 'small'),

        brand: 'ModernLiving',
        model: 'Storage Pro',
        sku: 'ML-TABLE-001',
        upc: '847619004521',
        category: 'home-garden',
        subcategory: 'furniture',
        tags: ['coffee table', 'storage', 'modern', 'furniture', 'living room'],

        rating: 4.7,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 18,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'ModernLiving',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '5-7 business days',
            methods: ['Standard', 'White Glove Setup'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        variants: {
            colors: [
                { id: '12-c1', name: 'Finish', value: 'Walnut Brown', price: 179.99, inStock: true },
                { id: '12-c2', name: 'Finish', value: 'White Oak', price: 179.99, inStock: true },
                { id: '12-c3', name: 'Finish', value: 'Espresso Black', price: 189.99, inStock: true },
                { id: '12-c4', name: 'Finish', value: 'Natural Pine', price: 169.99, inStock: false },
            ],
        },

        features: [
            'Hidden storage compartment with soft-close hinges',
            'Solid wood construction with engineered wood top',
            'Modern minimalist design',
            'Easy assembly with included hardware',
            'Scratch and water-resistant finish',
            'Weight capacity: 50 lbs',
            'Perfect for magazines, remotes, and blankets',
        ],

        specifications: {
            'Dimensions': '47.2" L x 23.6" W x 16.1" H',
            'Material': 'Solid wood legs, engineered wood top',
            'Weight': '45 lbs',
            'Storage': 'Internal compartment: 40" L x 18" W x 10" H',
            'Assembly': 'Required (tools included)',
            'Weight Capacity': '50 lbs',
            'Care': 'Wipe clean with damp cloth',
        },

        badge: 'Free Assembly',
        badgeColor: '#10B981',
        discount: '40% off',
        featured: true,
        trending: true,
        bestSeller: true,

        slug: 'modern-coffee-table-with-storage',
        relatedProducts: ['301', '302', '304'],

        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '13',
        name: 'Ceramic Plant Pot Set (3-Pack)',
        description: 'Beautiful set of three ceramic plant pots with drainage holes and matching saucers. Perfect for indoor plants, herbs, and succulents.',
        shortDescription: 'Set of 3 ceramic plant pots with drainage',
        price: 24.99,
        originalPrice: 49.99,
        salePrice: 24.99,

        images: [
            { id: '13-1', url: getProductImageBySize('13', 'large'), alt: 'Ceramic Plant Pot Set', size: 'large' },
            { id: '13-2', url: getProductImageBySize('13', 'medium'), alt: 'Plant Pots with Plants', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('13', 'large'),
        thumbnailImage: getProductImageBySize('13', 'small'),

        brand: 'GreenThumb',
        model: 'Ceramic Trio',
        sku: 'GT-POT-003',
        category: 'home-garden',
        subcategory: 'garden',
        tags: ['plant pots', 'ceramic', 'gardening', 'indoor plants', 'drainage'],

        rating: 4.6,
        reviewCount: 567,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'GreenThumb Gardens',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '3-5 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            colors: [
                { id: '13-c1', name: 'Color', value: 'Matte White', price: 24.99, inStock: true },
                { id: '13-c2', name: 'Color', value: 'Sage Green', price: 24.99, inStock: true },
                { id: '13-c3', name: 'Color', value: 'Terracotta', price: 27.99, inStock: true },
                { id: '13-c4', name: 'Color', value: 'Charcoal Gray', price: 24.99, inStock: true },
            ],
            sizes: [
                { id: '13-s1', name: 'Size Set', value: 'Small (4", 5", 6")', price: 24.99, inStock: true },
                { id: '13-s2', name: 'Size Set', value: 'Medium (5", 6", 7")', price: 29.99, inStock: true },
                { id: '13-s3', name: 'Size Set', value: 'Large (6", 7", 8")', price: 34.99, inStock: true },
            ],
        },

        features: [
            'Set includes 3 pots in graduated sizes',
            'Drainage holes prevent root rot',
            'Matching water-catching saucers included',
            'Durable ceramic construction',
            'Modern minimalist design',
            'Suitable for indoor and outdoor use',
            'Easy to clean and maintain',
        ],

        specifications: {
            'Set Contents': '3 pots + 3 saucers',
            'Sizes': '4", 5", 6" diameter (small set)',
            'Material': 'High-quality ceramic',
            'Drainage': 'Pre-drilled drainage holes',
            'Finish': 'Glazed exterior, unglazed interior',
            'Care': 'Hand wash or wipe clean',
            'Use': 'Indoor/outdoor suitable',
        },

        badge: 'Garden Essential',
        badgeColor: '#059669',
        discount: '50% off',
        featured: true,
        trending: false,

        slug: 'ceramic-plant-pot-set-3-pack',
        relatedProducts: ['307', '308', '309'],

        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-12-12'),
    },

    {
        id: '14',
        name: 'Professional Kitchen Knife Set',
        description: 'High-carbon stainless steel knife set with ergonomic handles, knife block, and honing steel. Essential tools for every home chef.',
        shortDescription: 'Professional knife set with block and honing steel',
        price: 89.99,
        originalPrice: 199.99,
        salePrice: 89.99,

        images: [
            { id: '14-1', url: getProductImageBySize('14', 'large'), alt: 'Professional Kitchen Knife Set', size: 'large' },
            { id: '14-2', url: getProductImageBySize('14', 'medium'), alt: 'Knife Set with Block', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('14', 'large'),

        brand: 'ChefMaster',
        model: 'Pro Series',
        sku: 'CM-KNIFE-SET',
        category: 'home-garden',
        subcategory: 'kitchen',
        tags: ['kitchen knives', 'knife set', 'professional', 'cooking', 'stainless steel'],

        rating: 4.8,
        reviewCount: 1234,
        reviews: [],

        inStock: true,
        stockCount: 34,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'ChefMaster',
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

        features: [
            '15-piece professional knife set',
            'High-carbon stainless steel blades',
            'Ergonomic triple-riveted handles',
            'Bamboo knife block included',
            'Honing steel for blade maintenance',
            'Kitchen shears and 6 steak knives',
            'Hand-sharpened and tested',
        ],

        specifications: {
            'Set Contents': '8" Chef, 8" Bread, 7" Santoku, 5" Utility, 3.5" Paring, 6 Steak Knives, Shears, Honing Steel, Block',
            'Blade Material': 'High-carbon stainless steel',
            'Handle Material': 'Triple-riveted polymer',
            'Block Material': 'Bamboo',
            'Dishwasher Safe': 'Hand wash recommended',
            'Warranty': 'Lifetime warranty',
            'Origin': 'Manufactured in Germany',
        },

        badge: 'Chef Quality',
        badgeColor: '#EF4444',
        discount: '55% off',
        featured: true,
        trending: true,

        slug: 'professional-kitchen-knife-set',
        relatedProducts: ['12', '305', '306'],

        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-12-10'),
    },

    {
        id: '15',
        name: 'Memory Foam Mattress Queen Size',
        description: 'Premium memory foam mattress with cooling gel infusion, medium-firm support, and pressure relief. Includes removable bamboo cover.',
        shortDescription: 'Gel-infused memory foam mattress with cooling',
        price: 299.99,
        originalPrice: 699.99,
        salePrice: 299.99,

        images: [
            { id: '15-1', url: getProductImageBySize('15', 'large'), alt: 'Memory Foam Mattress Queen', size: 'large' },
            { id: '15-2', url: getProductImageBySize('15', 'medium'), alt: 'Mattress Layers Cutaway', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('15', 'large'),

        brand: 'SleepWell',
        model: 'CoolDream Pro',
        sku: 'SW-MATTRESS-Q',
        category: 'home-garden',
        subcategory: 'bedroom',
        tags: ['mattress', 'memory foam', 'queen size', 'cooling gel', 'sleep'],

        rating: 4.7,
        reviewCount: 2156,
        reviews: [],

        inStock: true,
        stockCount: 12,
        status: 'available',
        maxQuantity: 1,
        minQuantity: 1,

        seller: 'SleepWell',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '5-10 business days',
            methods: ['Standard', 'White Glove Setup'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '15-s1', name: 'Size', value: 'Twin', price: 199.99, inStock: true },
                { id: '15-s2', name: 'Size', value: 'Full', price: 249.99, inStock: true },
                { id: '15-s3', name: 'Size', value: 'Queen', price: 299.99, inStock: true },
                { id: '15-s4', name: 'Size', value: 'King', price: 399.99, inStock: true },
                { id: '15-s5', name: 'Size', value: 'California King', price: 429.99, inStock: false },
            ],
            firmness: [
                { id: '15-f1', name: 'Firmness', value: 'Soft', price: 299.99, inStock: true },
                { id: '15-f2', name: 'Firmness', value: 'Medium-Firm', price: 299.99, inStock: true },
                { id: '15-f3', name: 'Firmness', value: 'Firm', price: 319.99, inStock: true },
            ],
        },

        features: [
            '12-inch gel-infused memory foam',
            'Medium-firm support (6/10 firmness)',
            'Cooling gel prevents overheating',
            'Pressure point relief',
            'Motion isolation technology',
            'Hypoallergenic and dust mite resistant',
            'Removable bamboo fiber cover',
            '100-night sleep trial',
        ],

        specifications: {
            'Dimensions': '80" L x 60" W x 12" H (Queen)',
            'Material': 'Gel-infused memory foam, high-density support foam',
            'Cover': 'Removable bamboo fiber blend',
            'Firmness': 'Medium-firm (6/10)',
            'Weight': '85 lbs (Queen)',
            'Warranty': '20-year limited warranty',
            'Certifications': 'CertiPUR-US certified foam',
        },

        badge: 'Sleep Trial',
        badgeColor: '#3B82F6',
        discount: '57% off',
        featured: true,
        trending: true,

        slug: 'memory-foam-mattress-queen-size',
        relatedProducts: ['16', '12', '301'],

        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-12-14'),
    },

    {
        id: '16',
        name: 'Smart LED Table Lamp',
        description: 'WiFi-enabled smart LED table lamp with adjustable brightness, color temperature control, and voice assistant compatibility. Perfect for any room.',
        shortDescription: 'Smart LED lamp with WiFi and voice control',
        price: 45.99,
        originalPrice: 89.99,
        salePrice: 45.99,

        images: [
            { id: '16-1', url: getProductImageBySize('16', 'large'), alt: 'Smart LED Table Lamp', size: 'large' },
        ],
        primaryImage: getProductImageBySize('16', 'large'),

        brand: 'SmartHome',
        model: 'LightSmart Pro',
        sku: 'SH-LAMP-001',
        category: 'home-garden',
        subcategory: 'lighting',
        tags: ['smart lamp', 'led', 'wifi', 'voice control', 'adjustable'],

        rating: 4.5,
        reviewCount: 678,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'SmartHome Tech',
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
                { id: '16-c1', name: 'Base Color', value: 'Matte Black', price: 45.99, inStock: true },
                { id: '16-c2', name: 'Base Color', value: 'White', price: 45.99, inStock: true },
                { id: '16-c3', name: 'Base Color', value: 'Brushed Silver', price: 49.99, inStock: true },
            ],
        },

        features: [
            'WiFi connectivity for smartphone control',
            'Compatible with Alexa and Google Assistant',
            'Adjustable brightness (1% to 100%)',
            'Color temperature control (2700K-6500K)',
            'Energy-efficient LED bulb included',
            'Touch controls on base',
            'Timer and scheduling functions',
            'Easy setup with mobile app',
        ],

        specifications: {
            'Dimensions': '6" base diameter x 14" height',
            'Light Source': 'Integrated LED (non-replaceable)',
            'Power': '12W LED equivalent to 60W incandescent',
            'Connectivity': 'WiFi 2.4GHz',
            'App': 'SmartHome app (iOS/Android)',
            'Voice Control': 'Alexa, Google Assistant compatible',
            'Lifespan': '25,000+ hours',
        },

        badge: 'Smart Home',
        badgeColor: '#8B5CF6',
        discount: '49% off',
        featured: false,

        slug: 'smart-led-table-lamp',
        relatedProducts: ['15', '302', '310'],

        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-08'),
    },

    // =====================================
    // MEDIUM HOME & GARDEN ITEMS (med_11-14)
    // =====================================
    {
        id: '301',
        name: 'Luxury Throw Pillow Set',
        description: 'Set of 2 premium velvet throw pillows with hidden zippers, hypoallergenic filling, and elegant design. Perfect accent for sofas and beds.',
        shortDescription: 'Set of 2 velvet throw pillows with hidden zippers',
        price: 29.99,
        originalPrice: 59.99,
        salePrice: 29.99,

        images: [
            { id: '301-1', url: getProductImageBySize('11', 'medium'), alt: 'Luxury Throw Pillow Set', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('11', 'medium'),

        brand: 'ComfortHome',
        model: 'Velvet Luxe',
        sku: 'CH-PILLOW-002',
        category: 'home-garden',
        subcategory: 'decor',
        tags: ['throw pillows', 'velvet', 'luxury', 'decor', 'accent'],

        rating: 4.6,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 145,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'ComfortHome',
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
                { id: '301-c1', name: 'Color', value: 'Deep Navy', price: 29.99, inStock: true },
                { id: '301-c2', name: 'Color', value: 'Emerald Green', price: 29.99, inStock: true },
                { id: '301-c3', name: 'Color', value: 'Blush Pink', price: 32.99, inStock: true },
                { id: '301-c4', name: 'Color', value: 'Charcoal Gray', price: 29.99, inStock: true },
                { id: '301-c5', name: 'Color', value: 'Mustard Yellow', price: 32.99, inStock: false },
            ],
            sizes: [
                { id: '301-s1', name: 'Size', value: '18" x 18"', price: 29.99, inStock: true },
                { id: '301-s2', name: 'Size', value: '20" x 20"', price: 34.99, inStock: true },
                { id: '301-s3', name: 'Size', value: '12" x 20" (Lumbar)', price: 27.99, inStock: true },
            ],
        },

        features: [
            'Premium crushed velvet fabric',
            'Hypoallergenic polyester fiber filling',
            'Hidden zipper closure',
            'Removable and washable covers',
            'Fade-resistant colors',
            'Plush and supportive',
            'Set of 2 matching pillows',
        ],

        specifications: {
            'Material': 'Crushed velvet (100% polyester)',
            'Filling': 'Hypoallergenic polyester fiber',
            'Closure': 'Hidden zipper',
            'Care': 'Machine wash cold, air dry',
            'Set Contents': '2 throw pillows',
            'Shape': 'Square',
            'Style': 'Contemporary',
        },

        badge: 'Home Accent',
        badgeColor: '#EC4899',
        discount: '50% off',
        featured: false,

        slug: 'luxury-throw-pillow-set',
        relatedProducts: ['12', '15', '302'],

        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-12-11'),
    },

    {
        id: '302',
        name: 'Bamboo Cutting Board Set',
        description: 'Eco-friendly bamboo cutting board set with juice groove, non-slip feet, and antimicrobial properties. Includes 3 sizes for all cooking needs.',
        shortDescription: 'Eco-friendly bamboo cutting board set with 3 sizes',
        price: 24.99,
        originalPrice: 49.99,
        salePrice: 24.99,

        images: [
            { id: '302-1', url: getProductImageBySize('12', 'medium'), alt: 'Bamboo Cutting Board Set', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('12', 'medium'),

        brand: 'EcoKitchen',
        model: 'Bamboo Pro',
        sku: 'EK-BOARD-003',
        category: 'home-garden',
        subcategory: 'kitchen',
        tags: ['cutting board', 'bamboo', 'eco-friendly', 'kitchen', 'set'],

        rating: 4.7,
        reviewCount: 1456,
        reviews: [],

        inStock: true,
        stockCount: 78,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'EcoKitchen',
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
                { id: '302-s1', name: 'Set Type', value: '3-Piece Basic', price: 24.99, inStock: true },
                { id: '302-s2', name: 'Set Type', value: '5-Piece Deluxe', price: 39.99, inStock: true },
            ],
        },

        features: [
            'Set of 3 bamboo cutting boards',
            'Natural antimicrobial properties',
            'Juice groove prevents spills',
            'Non-slip silicone feet',
            'Knife-friendly surface',
            'Easy to clean and maintain',
            'Sustainable bamboo construction',
        ],

        specifications: {
            'Set Contents': 'Large (18"x12"), Medium (14"x10"), Small (10"x8")',
            'Material': '100% natural bamboo',
            'Thickness': '0.75 inches',
            'Features': 'Juice groove, non-slip feet',
            'Care': 'Hand wash, oil monthly',
            'Sustainability': 'Rapidly renewable resource',
            'Durability': 'Harder than most hardwoods',
        },

        badge: 'Eco-Friendly',
        badgeColor: '#059669',
        discount: '50% off',
        featured: true,

        slug: 'bamboo-cutting-board-set',
        relatedProducts: ['14', '304', '305'],

        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-12-13'),
    },

    {
        id: '303',
        name: 'Aromatherapy Essential Oil Diffuser',
        description: 'Ultrasonic essential oil diffuser with color-changing LED lights, timer settings, and auto shut-off. Creates a relaxing atmosphere in any room.',
        shortDescription: 'Ultrasonic diffuser with LED lights and timer',
        price: 34.99,
        originalPrice: 69.99,
        salePrice: 34.99,

        images: [
            { id: '303-1', url: getProductImageBySize('13', 'medium'), alt: 'Aromatherapy Essential Oil Diffuser', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('13', 'medium'),

        brand: 'ZenScents',
        model: 'AromaFlow',
        sku: 'ZS-DIFFUSER-001',
        category: 'home-garden',
        subcategory: 'wellness',
        tags: ['essential oil', 'diffuser', 'aromatherapy', 'relaxation', 'wellness'],

        rating: 4.5,
        reviewCount: 734,
        reviews: [],

        inStock: true,
        stockCount: 56,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'ZenScents',
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
                { id: '303-c1', name: 'Color', value: 'White Wood Grain', price: 34.99, inStock: true },
                { id: '303-c2', name: 'Color', value: 'Dark Wood Grain', price: 34.99, inStock: true },
                { id: '303-c3', name: 'Color', value: 'Modern Black', price: 37.99, inStock: true },
            ],
        },

        features: [
            '400ml water tank capacity',
            'Ultrasonic misting technology',
            '7-color LED light rotation',
            'Timer settings: 1H, 3H, 6H, continuous',
            'Auto shut-off when water runs out',
            'Whisper-quiet operation',
            'BPA-free materials',
        ],

        specifications: {
            'Capacity': '400ml',
            'Runtime': 'Up to 14 hours continuous',
            'Coverage': 'Up to 430 sq ft',
            'Mist Output': '30-40ml/hour',
            'Power': '14W',
            'Dimensions': '6.7" D x 5.9" H',
            'Noise Level': '<36dB',
        },

        badge: 'Wellness',
        badgeColor: '#8B5CF6',
        discount: '50% off',
        featured: false,

        slug: 'aromatherapy-essential-oil-diffuser',
        relatedProducts: ['16', '301', '310'],

        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-12-09'),
    },

    {
        id: '304',
        name: 'ChefElite Professional Cookware Set',
        description: '10-piece professional-grade stainless steel cookware set with tri-ply construction, aluminum core for even heat distribution, and ergonomic stay-cool handles.',
        shortDescription: '10-piece professional stainless steel cookware set',
        price: 149.99,
        originalPrice: 299.99,
        salePrice: 149.99,

        images: [
            { id: '304-1', url: getProductImageBySize('14', 'medium'), alt: 'ChefElite Professional Cookware Set', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('14', 'medium'),

        brand: 'ChefElite',
        model: 'Professional Series',
        sku: 'CE-COOKWARE-10',
        category: 'home-garden',
        subcategory: 'kitchen',
        tags: ['cookware', 'stainless steel', 'professional', 'kitchen', 'pots and pans'],

        rating: 4.8,
        reviewCount: 1678,
        reviews: [],

        inStock: true,
        stockCount: 23,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'ChefElite',
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
            '10-piece complete cookware set',
            'Tri-ply stainless steel construction',
            'Aluminum core for even heat distribution',
            'Ergonomic stay-cool handles',
            'Dishwasher and oven safe up to 500°F',
            'Compatible with all cooktops including induction',
            'Lifetime warranty',
        ],

        specifications: {
            'Set Contents': '8" & 10" Skillets, 1.5QT & 3QT Saucepans with lids, 8QT Stockpot with lid, Steamer insert',
            'Material': 'Tri-ply stainless steel with aluminum core',
            'Handle': 'Ergonomic stainless steel',
            'Oven Safe': 'Up to 500°F',
            'Dishwasher Safe': 'Yes',
            'Induction Compatible': 'Yes',
            'Warranty': 'Lifetime limited warranty',
        },

        badge: 'Professional',
        badgeColor: '#EF4444',
        discount: '50% off',
        featured: true,
        trending: true,

        slug: 'stainless-steel-cookware-set',
        relatedProducts: ['14', '302', '305'],

        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-12-15'),
    },

    // =====================================
    // SMALL HOME & GARDEN ITEMS (small_13-18)
    // =====================================
    {
        id: '305',
        name: 'Silicone Baking Mat Set',
        description: 'Non-stick silicone baking mats that replace parchment paper. Heat-resistant, reusable, and easy to clean. Perfect for cookies, pastries, and more.',
        shortDescription: 'Non-stick silicone baking mats, reusable set',
        price: 16.99,
        originalPrice: 29.99,
        salePrice: 16.99,

        images: [
            { id: '305-1', url: getProductImageBySize('13', 'small'), alt: 'Silicone Baking Mat Set', size: 'small' },
        ],
        primaryImage: getProductImageBySize('13', 'small'),

        brand: 'BakeEasy',
        model: 'SiliMat Pro',
        sku: 'BE-MAT-003',
        category: 'home-garden',
        subcategory: 'kitchen',
        tags: ['baking mats', 'silicone', 'non-stick', 'reusable', 'eco-friendly'],

        rating: 4.6,
        reviewCount: 923,
        reviews: [],

        inStock: true,
        stockCount: 167,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'BakeEasy',
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
                { id: '305-s1', name: 'Set Size', value: '2-Pack Half Sheet', price: 16.99, inStock: true },
                { id: '305-s2', name: 'Set Size', value: '4-Pack Mixed Sizes', price: 24.99, inStock: true },
                { id: '305-s3', name: 'Set Size', value: '6-Pack Complete', price: 34.99, inStock: true },
            ],
        },

        features: [
            'Food-grade silicone construction',
            'Non-stick surface eliminates need for oil/butter',
            'Heat resistant from -40°F to 480°F',
            'Dishwasher safe and easy to clean',
            'Reusable - replaces parchment paper',
            'Fits standard half-sheet pans',
            'BPA and PFOA free',
        ],

        specifications: {
            'Dimensions': '16.5" x 11.6" (half sheet size)',
            'Material': '100% food-grade silicone',
            'Temperature Range': '-40°F to 480°F',
            'Thickness': '0.75mm',
            'Care': 'Dishwasher safe or hand wash',
            'Certifications': 'FDA approved, BPA free',
            'Uses': 'Baking, roasting, freezing',
        },

        badge: 'Eco-Friendly',
        badgeColor: '#059669',
        discount: '43% off',
        featured: false,

        slug: 'silicone-baking-mat-set',
        relatedProducts: ['14', '302', '304'],

        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-12-14'),
    },

    {
        id: '306',
        name: 'Glass Food Storage Container Set',
        description: 'Airtight glass food storage containers with leak-proof lids. Microwave, oven, and dishwasher safe. Perfect for meal prep and leftovers.',
        shortDescription: 'Airtight glass storage containers with leak-proof lids',
        price: 32.99,
        originalPrice: 59.99,
        salePrice: 32.99,

        images: [
            { id: '306-1', url: getProductImageBySize('14', 'small'), alt: 'Glass Food Storage Container Set', size: 'small' },
        ],
        primaryImage: getProductImageBySize('14', 'small'),

        brand: 'FreshKeep',
        model: 'Glass Guard',
        sku: 'FK-GLASS-SET',
        category: 'home-garden',
        subcategory: 'kitchen',
        tags: ['food storage', 'glass containers', 'airtight', 'meal prep', 'leak-proof'],

        rating: 4.7,
        reviewCount: 1245,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'FreshKeep',
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
                { id: '306-s1', name: 'Set Size', value: '5-Piece Starter', price: 32.99, inStock: true },
                { id: '306-s2', name: 'Set Size', value: '10-Piece Family', price: 49.99, inStock: true },
                { id: '306-s3', name: 'Set Size', value: '18-Piece Complete', price: 79.99, inStock: true },
            ],
        },

        features: [
            'Borosilicate glass construction',
            'Airtight silicone gasket lids',
            'Leak-proof and spill-proof design',
            'Microwave safe (without lids)',
            'Oven safe up to 425°F (glass only)',
            'Freezer and dishwasher safe',
            'Stackable design saves space',
        ],

        specifications: {
            'Material': 'Borosilicate glass with BPA-free plastic lids',
            'Set Contents': '5 containers: 1.1L, 800ml, 640ml, 370ml, 150ml',
            'Lid Type': 'Snap-lock with silicone gasket',
            'Temperature Range': '-20°F to 425°F (glass)',
            'Dishwasher Safe': 'Yes (top rack recommended)',
            'Microwave Safe': 'Yes (glass only)',
            'Warranty': '2-year replacement warranty',
        },

        badge: 'Meal Prep',
        badgeColor: '#3B82F6',
        discount: '45% off',
        featured: true,

        slug: 'glass-food-storage-container-set',
        relatedProducts: ['304', '305', '14'],

        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-12-13'),
    },

    {
        id: '307',
        name: 'Succulent Garden Kit',
        description: 'Complete succulent gardening kit with 6 varieties, decorative pots, soil, and care guide. Perfect for beginners and indoor gardening enthusiasts.',
        shortDescription: 'Complete succulent kit with 6 plants and supplies',
        price: 28.99,
        originalPrice: 49.99,
        salePrice: 28.99,

        images: [
            { id: '307-1', url: getProductImageBySize('15', 'small'), alt: 'Succulent Garden Kit', size: 'small' },
        ],
        primaryImage: getProductImageBySize('15', 'small'),

        brand: 'GreenThumb',
        model: 'Succulent Starter',
        sku: 'GT-SUCC-KIT',
        category: 'home-garden',
        subcategory: 'garden',
        tags: ['succulents', 'garden kit', 'plants', 'indoor gardening', 'beginner'],

        rating: 4.5,
        reviewCount: 567,
        reviews: [],

        inStock: true,
        stockCount: 45,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'GreenThumb Gardens',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '5-7 business days',
            methods: ['Standard'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        features: [
            '6 different succulent varieties',
            'Decorative ceramic pots included',
            'Premium succulent soil mix',
            'Comprehensive care guide',
            'Perfect for beginners',
            'Low maintenance plants',
            'Arrives ready to display',
        ],

        specifications: {
            'Kit Contents': '6 succulents, 6 ceramic pots, soil, care guide',
            'Plant Varieties': 'Echeveria, Jade, Haworthia, Sedum, Crassula, Aloe',
            'Pot Size': '3 inches diameter',
            'Soil': 'Well-draining succulent mix',
            'Care Level': 'Beginner friendly',
            'Light Requirements': 'Bright, indirect light',
            'Watering': 'Once every 1-2 weeks',
        },

        badge: 'Live Plants',
        badgeColor: '#059669',
        discount: '42% off',
        featured: false,

        slug: 'succulent-garden-kit',
        relatedProducts: ['13', '308', '309'],

        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '308',
        name: 'Herb Garden Starter Kit',
        description: 'Indoor herb garden kit with 10 herb seed varieties, biodegradable pots, soil pellets, and plant markers. Grow fresh herbs year-round.',
        shortDescription: 'Indoor herb garden with 10 seed varieties',
        price: 19.99,
        originalPrice: 34.99,
        salePrice: 19.99,

        images: [
            { id: '308-1', url: getProductImageBySize('16', 'small'), alt: 'Herb Garden Starter Kit', size: 'small' },
        ],
        primaryImage: getProductImageBySize('16', 'small'),

        brand: 'GreenThumb',
        model: 'Herb Master',
        sku: 'GT-HERB-KIT',
        category: 'home-garden',
        subcategory: 'garden',
        tags: ['herb garden', 'seeds', 'indoor gardening', 'cooking herbs', 'starter kit'],

        rating: 4.4,
        reviewCount: 789,
        reviews: [],

        inStock: true,
        stockCount: 123,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'GreenThumb Gardens',
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
            '10 popular herb seed varieties',
            'Biodegradable peat pots',
            'Compressed soil pellets',
            'Plant identification markers',
            'Detailed growing instructions',
            'Perfect for windowsill gardening',
            'All-natural and organic seeds',
        ],

        specifications: {
            'Seed Varieties': 'Basil, Parsley, Cilantro, Chives, Oregano, Thyme, Rosemary, Sage, Dill, Mint',
            'Pot Material': 'Biodegradable peat',
            'Soil': 'Compressed coco coir pellets',
            'Germination Time': '7-21 days depending on variety',
            'Growing Time': '6-8 weeks to harvest',
            'Light Requirements': 'Bright window or grow light',
            'Organic': 'Yes, all seeds are organic',
        },

        badge: 'Organic',
        badgeColor: '#10B981',
        discount: '43% off',
        featured: false,

        slug: 'herb-garden-starter-kit',
        relatedProducts: ['13', '307', '309'],

        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-14'),
    },

    {
        id: '309',
        name: 'Watering Can Set',
        description: 'Stylish galvanized steel watering can set with detachable rose head, ergonomic handle, and vintage design. Perfect for indoor and outdoor plants.',
        shortDescription: 'Galvanized steel watering can with rose head',
        price: 22.99,
        originalPrice: 39.99,
        salePrice: 22.99,

        images: [
            { id: '309-1', url: getProductImageBySize('17', 'small'), alt: 'Watering Can Set', size: 'small' },
        ],
        primaryImage: getProductImageBySize('17', 'small'),

        brand: 'GardenClassic',
        model: 'Vintage Steel',
        sku: 'GC-WATER-CAN',
        category: 'home-garden',
        subcategory: 'garden',
        tags: ['watering can', 'galvanized steel', 'garden tools', 'vintage', 'plants'],

        rating: 4.6,
        reviewCount: 445,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'GardenClassic',
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
                { id: '309-s1', name: 'Capacity', value: '1 Gallon', price: 22.99, inStock: true },
                { id: '309-s2', name: 'Capacity', value: '2 Gallon', price: 29.99, inStock: true },
            ],
            colors: [
                { id: '309-c1', name: 'Finish', value: 'Galvanized Silver', price: 22.99, inStock: true },
                { id: '309-c2', name: 'Finish', value: 'Sage Green', price: 24.99, inStock: true },
                { id: '309-c3', name: 'Finish', value: 'Antique Copper', price: 27.99, inStock: false },
            ],
        },

        features: [
            'Durable galvanized steel construction',
            'Detachable rose head for gentle watering',
            'Ergonomic handle for comfortable carrying',
            'Vintage-inspired design',
            'Rust-resistant finish',
            'Perfect for both indoor and outdoor use',
            'Easy-pour spout design',
        ],

        specifications: {
            'Material': 'Galvanized steel',
            'Capacity': '1 gallon (128 oz)',
            'Dimensions': '15" L x 8" W x 12" H',
            'Weight': '2.5 lbs',
            'Rose Head': 'Detachable brass rose',
            'Handle': 'Ergonomic steel handle',
            'Finish': 'Rust-resistant galvanized coating',
        },

        badge: 'Garden Essential',
        badgeColor: '#059669',
        discount: '43% off',
        featured: false,

        slug: 'watering-can-set',
        relatedProducts: ['13', '307', '308'],

        createdAt: new Date('2024-12-08'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '310',
        name: 'Smart Home Security Camera',
        description: 'WiFi security camera with 1080p HD video, night vision, motion detection, and smartphone app. Indoor/outdoor weatherproof design.',
        shortDescription: '1080p WiFi security camera with night vision',
        price: 39.99,
        originalPrice: 79.99,
        salePrice: 39.99,

        images: [
            { id: '310-1', url: getProductImageBySize('18', 'small'), alt: 'Smart Home Security Camera', size: 'small' },
        ],
        primaryImage: getProductImageBySize('18', 'small'),

        brand: 'SecureHome',
        model: 'WatchGuard Pro',
        sku: 'SH-CAM-001',
        category: 'home-garden',
        subcategory: 'security',
        tags: ['security camera', 'wifi', '1080p', 'night vision', 'smart home'],

        rating: 4.3,
        reviewCount: 1567,
        reviews: [],

        inStock: true,
        stockCount: 234,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'SecureHome',
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
            storage: [
                { id: '310-st1', name: 'Storage', value: 'Cloud Only', price: 39.99, inStock: true },
                { id: '310-st2', name: 'Storage', value: 'Cloud + SD Card', price: 49.99, inStock: true },
            ],
        },

        features: [
            '1080p Full HD video recording',
            'Color night vision up to 30 feet',
            'Motion detection with instant alerts',
            'Two-way audio communication',
            'Weatherproof IP65 rating',
            'Free cloud storage (7 days)',
            'Easy smartphone app setup',
        ],

        specifications: {
            'Video Resolution': '1080p Full HD (1920x1080)',
            'Field of View': '110° diagonal',
            'Night Vision': 'Color night vision up to 30ft',
            'Audio': 'Two-way audio with noise cancellation',
            'Storage': 'Cloud storage (7 days free)',
            'Connectivity': 'WiFi 2.4GHz, Ethernet',
            'Weather Rating': 'IP65 weatherproof',
            'Power': 'DC 12V adapter included',
        },

        badge: 'Security',
        badgeColor: '#EF4444',
        discount: '50% off',
        featured: false,

        slug: 'smart-home-security-camera',
        relatedProducts: ['16', '303', '12'],

        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
    },
];

// =====================================
// HOME & GARDEN SUBCATEGORIES
// =====================================
export const HOME_GARDEN_SUBCATEGORIES = [
    {
        id: 'furniture',
        name: 'Furniture',
        description: 'Tables, chairs, storage, and home furniture',
        icon: 'bed-outline',
        color: '#8B5CF6',
        productCount: 1,
        featured: true,
    },
    {
        id: 'kitchen',
        name: 'Kitchen & Dining',
        description: 'Cookware, utensils, and kitchen essentials',
        icon: 'restaurant-outline',
        color: '#EF4444',
        productCount: 4,
        featured: true,
    },
    {
        id: 'garden',
        name: 'Garden & Plants',
        description: 'Plants, pots, tools, and gardening supplies',
        icon: 'leaf-outline',
        color: '#059669',
        productCount: 4,
        featured: true,
    },
    {
        id: 'decor',
        name: 'Home Decor',
        description: 'Decorative items, pillows, and accents',
        icon: 'color-palette-outline',
        color: '#EC4899',
        productCount: 1,
        featured: true,
    },
    {
        id: 'bedroom',
        name: 'Bedroom',
        description: 'Mattresses, bedding, and bedroom furniture',
        icon: 'moon-outline',
        color: '#3B82F6',
        productCount: 1,
        featured: true,
    },
    {
        id: 'lighting',
        name: 'Lighting',
        description: 'Lamps, fixtures, and smart lighting',
        icon: 'bulb-outline',
        color: '#F59E0B',
        productCount: 1,
        featured: false,
    },
    {
        id: 'wellness',
        name: 'Home Wellness',
        description: 'Aromatherapy, air purifiers, and wellness products',
        icon: 'heart-outline',
        color: '#10B981',
        productCount: 1,
        featured: false,
    },
    {
        id: 'security',
        name: 'Home Security',
        description: 'Security cameras, alarms, and safety equipment',
        icon: 'shield-outline',
        color: '#6B7280',
        productCount: 1,
        featured: false,
    },
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get all home & garden products
 */
export const getAllHomeGardenProducts = (): Product[] => {
    return HOME_GARDEN_PRODUCTS;
};

/**
 * Get home & garden products by subcategory
 */
export const getHomeGardenBySubcategory = (subcategory: string): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product => product.subcategory === subcategory);
};

/**
 * Get featured home & garden products
 */
export const getFeaturedHomeGarden = (): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product => product.featured === true);
};

/**
 * Get trending home & garden products
 */
export const getTrendingHomeGarden = (): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product => product.trending === true);
};

/**
 * Get home & garden products on sale
 */
export const getHomeGardenOnSale = (): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product =>
        product.originalPrice && product.price < product.originalPrice
    );
};

/**
 * Get home & garden products by brand
 */
export const getHomeGardenByBrand = (brand: string): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );
};

/**
 * Get home & garden products by price range
 */
export const getHomeGardenByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );
};

/**
 * Search home & garden products
 */
export const searchHomeGardenProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return HOME_GARDEN_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Get home & garden product by ID
 */
export const getHomeGardenProductById = (id: string): Product | undefined => {
    return HOME_GARDEN_PRODUCTS.find(product => product.id === id);
};

/**
 * Get related home & garden products
 */
export const getRelatedHomeGardenProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getHomeGardenProductById(productId);
    if (!product || !product.relatedProducts) return [];

    return product.relatedProducts
        .map(id => getHomeGardenProductById(id))
        .filter(Boolean)
        .slice(0, limit) as Product[];
};

/**
 * Get top-rated home & garden products
 */
export const getTopRatedHomeGarden = (minRating: number = 4.5): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product => product.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Get best selling home & garden products
 */
export const getBestSellingHomeGarden = (): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product => product.bestSeller === true);
};

/**
 * Get new home & garden arrivals
 */
export const getNewHomeGardenArrivals = (): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product => product.newArrival === true);
};

/**
 * Get kitchen products
 */
export const getKitchenProducts = (): Product[] => {
    return getHomeGardenBySubcategory('kitchen');
};

/**
 * Get garden products
 */
export const getGardenProducts = (): Product[] => {
    return getHomeGardenBySubcategory('garden');
};

/**
 * Get furniture products
 */
export const getFurnitureProducts = (): Product[] => {
    return getHomeGardenBySubcategory('furniture');
};

/**
 * Get home decor products
 */
export const getHomeDecorProducts = (): Product[] => {
    return getHomeGardenBySubcategory('decor');
};

/**
 * Get bedroom products
 */
export const getBedroomProducts = (): Product[] => {
    return getHomeGardenBySubcategory('bedroom');
};

/**
 * Get products by room
 */
export const getHomeGardenByRoom = (room: 'kitchen' | 'bedroom' | 'living-room' | 'bathroom' | 'garden'): Product[] => {
    const roomKeywords = {
        kitchen: ['kitchen', 'cooking', 'cookware', 'baking', 'dining'],
        bedroom: ['bedroom', 'mattress', 'sleep', 'bed'],
        'living-room': ['living room', 'coffee table', 'lamp', 'pillow', 'decor'],
        bathroom: ['bathroom', 'bath', 'shower'],
        garden: ['garden', 'plant', 'outdoor', 'watering']
    };

    const keywords = roomKeywords[room];
    return HOME_GARDEN_PRODUCTS.filter(product =>
        keywords.some(keyword =>
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
            product.subcategory.toLowerCase().includes(keyword)
        )
    );
};

/**
 * Get smart home products
 */
export const getSmartHomeProducts = (): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product =>
        product.tags.some(tag => tag.toLowerCase().includes('smart')) ||
        product.name.toLowerCase().includes('smart') ||
        product.description.toLowerCase().includes('smart')
    );
};

/**
 * Get eco-friendly products
 */
export const getEcoFriendlyProducts = (): Product[] => {
    return HOME_GARDEN_PRODUCTS.filter(product =>
        product.tags.some(tag => ['eco-friendly', 'bamboo', 'organic', 'sustainable'].includes(tag.toLowerCase())) ||
        product.description.toLowerCase().includes('eco') ||
        product.description.toLowerCase().includes('sustainable')
    );
};

// =====================================
// EXPORT DEFAULT
// =====================================
export default {
    products: HOME_GARDEN_PRODUCTS,
    subcategories: HOME_GARDEN_SUBCATEGORIES,
    getAllProducts: getAllHomeGardenProducts,
    getBySubcategory: getHomeGardenBySubcategory,
    getFeatured: getFeaturedHomeGarden,
    getTrending: getTrendingHomeGarden,
    getOnSale: getHomeGardenOnSale,
    getByBrand: getHomeGardenByBrand,
    getByPriceRange: getHomeGardenByPriceRange,
    search: searchHomeGardenProducts,
    getById: getHomeGardenProductById,
    getRelated: getRelatedHomeGardenProducts,
    getTopRated: getTopRatedHomeGarden,
    getBestSelling: getBestSellingHomeGarden,
    getNewArrivals: getNewHomeGardenArrivals,
    getKitchen: getKitchenProducts,
    getGarden: getGardenProducts,
    getFurniture: getFurnitureProducts,
    getDecor: getHomeDecorProducts,
    getBedroom: getBedroomProducts,
    getByRoom: getHomeGardenByRoom,
    getSmartHome: getSmartHomeProducts,
    getEcoFriendly: getEcoFriendlyProducts,
};