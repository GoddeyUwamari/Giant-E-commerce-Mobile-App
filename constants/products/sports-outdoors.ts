// constants/products/sports-outdoors.ts
// Sports & Outdoors category products

import { Product } from './interfaces';
import { getProductImageBySize, getBannerImage } from '../../assets/images/imageLoader';

export const SPORTS_OUTDOORS_PRODUCTS: Product[] = [
    // =====================================
    // LARGE SPORTS & OUTDOORS ITEMS (prod_22-26)
    // =====================================
    {
        id: '22',
        name: 'Professional Treadmill for Home',
        description: 'Heavy-duty folding treadmill with 3.0 HP motor, 15% incline, built-in workout programs, and heart rate monitoring. Perfect for home fitness.',
        shortDescription: 'Professional folding treadmill with incline and programs',
        price: 599.99,
        originalPrice: 999.99,
        salePrice: 599.99,

        images: [
            { id: '22-1', url: getProductImageBySize('22', 'large'), alt: 'Professional Treadmill for Home', size: 'large' },
            { id: '22-2', url: getProductImageBySize('22', 'medium'), alt: 'Treadmill Control Panel', size: 'medium' },
            { id: '22-3', url: getProductImageBySize('22', 'small'), alt: 'Treadmill Folded View', size: 'small' },
        ],
        primaryImage: getProductImageBySize('22', 'large'),
        thumbnailImage: getProductImageBySize('22', 'small'),

        brand: 'FitPro',
        model: 'Elite Runner 3000',
        sku: 'FP-TREAD-001',
        upc: '847619006945',
        category: 'sports-outdoors',
        subcategory: 'fitness-equipment',
        tags: ['treadmill', 'fitness', 'cardio', 'home gym', 'running'],

        rating: 4.6,
        reviewCount: 1234,
        reviews: [],

        inStock: true,
        stockCount: 12,
        status: 'available',
        maxQuantity: 1,
        minQuantity: 1,

        seller: 'FitPro',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '7-10 business days',
            methods: ['Standard', 'White Glove Setup'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        features: [
            '3.0 HP continuous duty motor',
            '0-12 mph speed range with 15% incline',
            '20" x 55" running surface',
            '15 built-in workout programs',
            'Heart rate monitoring grips',
            'Foldable design saves space',
            'Weight capacity: 300 lbs',
        ],

        specifications: {
            'Motor': '3.0 HP continuous duty',
            'Speed Range': '0.5-12 mph',
            'Incline': '0-15% automatic',
            'Running Surface': '20" W x 55" L',
            'Programs': '15 built-in workouts',
            'Weight Capacity': '300 lbs',
            'Dimensions': '70" L x 34" W x 55" H',
            'Folded Size': '38" L x 34" W x 65" H',
            'Weight': '180 lbs',
        },

        badge: 'Home Gym',
        badgeColor: '#EF4444',
        discount: '40% off',
        featured: true,
        trending: true,
        bestSeller: true,

        slug: 'professional-treadmill-home',
        relatedProducts: ['501', '502', '23'],

        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '23',
        name: '4-Person Camping Tent',
        description: 'Waterproof family camping tent with easy setup, vestibule area, and excellent ventilation. Perfect for weekend getaways and outdoor adventures.',
        shortDescription: 'Waterproof 4-person camping tent with easy setup',
        price: 89.99,
        originalPrice: 149.99,
        salePrice: 89.99,

        images: [
            { id: '23-1', url: getProductImageBySize('23', 'large'), alt: '4-Person Camping Tent', size: 'large' },
            { id: '23-2', url: getProductImageBySize('23', 'medium'), alt: 'Tent Interior View', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('23', 'large'),
        thumbnailImage: getProductImageBySize('23', 'small'),

        brand: 'OutdoorPro',
        model: 'Family Base',
        sku: 'OP-TENT-004',
        category: 'sports-outdoors',
        subcategory: 'camping',
        tags: ['camping tent', 'waterproof', 'family', 'outdoor', 'hiking'],

        rating: 4.5,
        reviewCount: 2187,
        reviews: [],

        inStock: true,
        stockCount: 34,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'OutdoorPro',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '3-5 business days',
            methods: ['Standard', 'Express'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            colors: [
                { id: '23-c1', name: 'Color', value: 'Green/Gray', price: 89.99, inStock: true },
                { id: '23-c2', name: 'Color', value: 'Blue/Gray', price: 89.99, inStock: true },
                { id: '23-c3', name: 'Color', value: 'Orange/Gray', price: 94.99, inStock: true },
            ],
            sizes: [
                { id: '23-s1', name: 'Capacity', value: '2-Person', price: 69.99, inStock: true },
                { id: '23-s2', name: 'Capacity', value: '4-Person', price: 89.99, inStock: true },
                { id: '23-s3', name: 'Capacity', value: '6-Person', price: 119.99, inStock: true },
            ],
        },

        features: [
            'Waterproof 3000mm coated fabric',
            '10-minute easy setup with color-coded poles',
            'Spacious vestibule for gear storage',
            'Excellent ventilation system',
            'Reinforced stress points',
            'Compact carry bag included',
            'Stakes and guylines included',
        ],

        specifications: {
            'Capacity': '4 people',
            'Dimensions': '9\' x 7\' x 4.5\' H',
            'Weight': '8.5 lbs',
            'Waterproof Rating': '3000mm',
            'Poles': 'Lightweight aluminum',
            'Setup Time': '10 minutes',
            'Packed Size': '24" x 6" x 6"',
            'Season Rating': '3-season',
        },

        badge: 'Outdoor Essential',
        badgeColor: '#059669',
        discount: '40% off',
        featured: true,
        trending: true,

        slug: '4-person-camping-tent',
        relatedProducts: ['24', '503', '505'],

        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-12'),
    },

    {
        id: '24',
        name: 'Mountain Bike 21-Speed',
        description: 'Durable mountain bike with 21-speed Shimano shifting, front suspension, and all-terrain tires. Built for trails and outdoor adventures.',
        shortDescription: '21-speed mountain bike with front suspension',
        price: 249.99,
        originalPrice: 399.99,
        salePrice: 249.99,

        images: [
            { id: '24-1', url: getProductImageBySize('24', 'large'), alt: 'Mountain Bike 21-Speed', size: 'large' },
            { id: '24-2', url: getProductImageBySize('24', 'medium'), alt: 'Bike Side Profile', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('24', 'large'),

        brand: 'TrailRider',
        model: 'Adventure 21',
        sku: 'TR-BIKE-021',
        category: 'sports-outdoors',
        subcategory: 'cycling',
        tags: ['mountain bike', '21 speed', 'cycling', 'outdoor', 'trails'],

        rating: 4.4,
        reviewCount: 876,
        reviews: [],

        inStock: true,
        stockCount: 18,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'TrailRider',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '5-7 business days',
            methods: ['Standard', 'Assembly Service'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '24-s1', name: 'Frame Size', value: 'Small (15")', price: 249.99, inStock: true },
                { id: '24-s2', name: 'Frame Size', value: 'Medium (17")', price: 249.99, inStock: true },
                { id: '24-s3', name: 'Frame Size', value: 'Large (19")', price: 249.99, inStock: true },
                { id: '24-s4', name: 'Frame Size', value: 'X-Large (21")', price: 269.99, inStock: false },
            ],
            colors: [
                { id: '24-c1', name: 'Color', value: 'Black/Red', price: 249.99, inStock: true },
                { id: '24-c2', name: 'Color', value: 'Blue/Silver', price: 249.99, inStock: true },
                { id: '24-c3', name: 'Color', value: 'Green/Black', price: 259.99, inStock: true },
            ],
        },

        features: [
            '21-speed Shimano drivetrain',
            'Front suspension fork',
            'All-terrain knobby tires',
            'Lightweight aluminum frame',
            'Linear pull brakes',
            'Quick-release wheels',
            'Adjustable seat height',
        ],

        specifications: {
            'Frame': 'Aluminum alloy',
            'Gears': '21-speed Shimano',
            'Brakes': 'Linear pull (V-brake)',
            'Suspension': 'Front fork',
            'Wheel Size': '26 inches',
            'Weight': '35 lbs',
            'Rider Height': '5\'4" - 6\'2"',
            'Assembly': '85% pre-assembled',
        },

        badge: 'Trail Ready',
        badgeColor: '#F59E0B',
        discount: '38% off',
        featured: true,
        trending: false,

        slug: 'mountain-bike-21-speed',
        relatedProducts: ['23', '501', '506'],

        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-12-10'),
    },

    {
        id: '25',
        name: 'Kayak Inflatable 2-Person',
        description: 'Durable inflatable kayak for two people with paddles, pump, and repair kit. Perfect for lakes, rivers, and calm ocean waters.',
        shortDescription: 'Inflatable 2-person kayak with paddles and pump',
        price: 159.99,
        originalPrice: 249.99,
        salePrice: 159.99,

        images: [
            { id: '25-1', url: getProductImageBySize('25', 'large'), alt: 'Kayak Inflatable 2-Person', size: 'large' },
        ],
        primaryImage: getProductImageBySize('25', 'large'),

        brand: 'AquaAdventure',
        model: 'Explorer Duo',
        sku: 'AA-KAYAK-002',
        category: 'sports-outdoors',
        subcategory: 'water-sports',
        tags: ['kayak', 'inflatable', 'water sports', 'paddle', 'recreation'],

        rating: 4.3,
        reviewCount: 654,
        reviews: [],

        inStock: true,
        stockCount: 23,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'AquaAdventure',
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

        features: [
            'Durable puncture-resistant material',
            'Seats 2 adults comfortably',
            'Includes 2 aluminum paddles',
            'High-pressure pump included',
            'Repair kit for emergencies',
            'Multiple air chambers for safety',
            'Compact storage bag',
        ],

        specifications: {
            'Length': '10.5 feet',
            'Width': '3 feet',
            'Weight Capacity': '400 lbs',
            'Material': 'Heavy-duty PVC',
            'Air Chambers': '3 independent chambers',
            'Setup Time': '10-15 minutes',
            'Packed Weight': '25 lbs',
            'Includes': 'Kayak, 2 paddles, pump, repair kit, bag',
        },

        badge: 'Water Ready',
        badgeColor: '#06B6D4',
        discount: '36% off',
        featured: true,
        trending: true,

        slug: 'kayak-inflatable-2-person',
        relatedProducts: ['23', '507', '508'],

        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-12-08'),
    },

    {
        id: '26',
        name: 'Golf Club Set Complete 12-Piece',
        description: 'Complete golf set for beginners and intermediate players. Includes driver, irons, putter, and cart bag. Everything needed to hit the course.',
        shortDescription: 'Complete 12-piece golf club set with bag',
        price: 199.99,
        originalPrice: 349.99,
        salePrice: 199.99,

        images: [
            { id: '26-1', url: getProductImageBySize('26', 'large'), alt: 'Golf Club Set Complete 12-Piece', size: 'large' },
        ],
        primaryImage: getProductImageBySize('26', 'large'),

        brand: 'ProSwing',
        model: 'Starter Pro',
        sku: 'PS-GOLF-012',
        category: 'sports-outdoors',
        subcategory: 'golf',
        tags: ['golf clubs', 'golf set', 'beginner', 'complete set', 'cart bag'],

        rating: 4.2,
        reviewCount: 543,
        reviews: [],

        inStock: true,
        stockCount: 28,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'ProSwing',
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
            handed: [
                { id: '26-h1', name: 'Handed', value: 'Right-Handed', price: 199.99, inStock: true },
                { id: '26-h2', name: 'Handed', value: 'Left-Handed', price: 199.99, inStock: true },
            ],
            flex: [
                { id: '26-f1', name: 'Shaft Flex', value: 'Regular', price: 199.99, inStock: true },
                { id: '26-f2', name: 'Shaft Flex', value: 'Stiff', price: 219.99, inStock: true },
            ],
        },

        features: [
            'Complete 12-piece club set',
            'Forgiving oversized club heads',
            'Lightweight graphite shafts',
            'Durable cart bag with stand',
            'Perfect for beginners to intermediate',
            'All essential clubs included',
            'Professional grip wraps',
        ],

        specifications: {
            'Set Contents': 'Driver, 3-wood, 4-hybrid, 5-9 irons, PW, SW, putter, bag',
            'Shaft Material': 'Graphite (woods) / Steel (irons)',
            'Hand': 'Right or left-handed available',
            'Bag Type': 'Cart bag with 14-way divider',
            'Club Count': '12 clubs',
            'Skill Level': 'Beginner to intermediate',
            'Warranty': '1-year manufacturer warranty',
        },

        badge: 'Complete Set',
        badgeColor: '#10B981',
        discount: '43% off',
        featured: true,
        trending: false,

        slug: 'golf-club-set-complete-12-piece',
        relatedProducts: ['24', '502', '509'],

        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-12-11'),
    },

    // =====================================
    // MEDIUM SPORTS & OUTDOORS ITEMS (med_19-22)
    // =====================================
    {
        id: '501',
        name: 'Adjustable Dumbbell Set',
        description: 'Space-saving adjustable dumbbells with quick-change weight system. Perfect for home workouts and strength training.',
        shortDescription: 'Adjustable dumbbells with quick-change system',
        price: 149.99,
        originalPrice: 249.99,
        salePrice: 149.99,

        images: [
            { id: '501-1', url: getProductImageBySize('19', 'medium'), alt: 'Adjustable Dumbbell Set', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('19', 'medium'),

        brand: 'PowerFit',
        model: 'SelectWeight Pro',
        sku: 'PF-DUMBBELL-001',
        category: 'sports-outdoors',
        subcategory: 'fitness-equipment',
        tags: ['dumbbells', 'adjustable', 'home gym', 'strength training', 'weights'],

        rating: 4.7,
        reviewCount: 1876,
        reviews: [],

        inStock: true,
        stockCount: 45,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'PowerFit',
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
            weightRange: [
                { id: '501-w1', name: 'Weight Range', value: '5-50 lbs (per dumbbell)', price: 149.99, inStock: true },
                { id: '501-w2', name: 'Weight Range', value: '5-75 lbs (per dumbbell)', price: 199.99, inStock: true },
            ],
        },

        features: [
            'Quick-change weight selection',
            '5-50 lbs per dumbbell (15 weight settings)',
            'Compact design saves space',
            'Durable steel construction',
            'Comfortable grip handles',
            'Safety locking mechanism',
            'Includes storage tray',
        ],

        specifications: {
            'Weight Range': '5-50 lbs per dumbbell',
            'Weight Increments': '5 lb increments',
            'Total Weight': '100 lbs (2 dumbbells)',
            'Dimensions': '17" L x 8" W x 9" H (per dumbbell)',
            'Handle': 'Textured for secure grip',
            'Storage': 'Compact tray included',
            'Warranty': '2-year limited warranty',
        },

        badge: 'Space Saver',
        badgeColor: '#8B5CF6',
        discount: '40% off',
        featured: false,

        slug: 'adjustable-dumbbell-set',
        relatedProducts: ['22', '502', '503'],

        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-09'),
    },

    {
        id: '502',
        name: 'Yoga Mat Premium Non-Slip',
        description: 'High-quality yoga mat with superior grip and cushioning. Eco-friendly materials, perfect for yoga, pilates, and floor exercises.',
        shortDescription: 'Premium non-slip yoga mat with extra cushioning',
        price: 34.99,
        originalPrice: 59.99,
        salePrice: 34.99,

        images: [
            { id: '502-1', url: getProductImageBySize('20', 'medium'), alt: 'Yoga Mat Premium Non-Slip', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('20', 'medium'),

        brand: 'ZenFlow',
        model: 'Pro Grip',
        sku: 'ZF-YOGA-001',
        category: 'sports-outdoors',
        subcategory: 'fitness-equipment',
        tags: ['yoga mat', 'non-slip', 'yoga', 'pilates', 'exercise'],

        rating: 4.8,
        reviewCount: 2134,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'ZenFlow',
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
                { id: '502-c1', name: 'Color', value: 'Purple', price: 34.99, inStock: true },
                { id: '502-c2', name: 'Color', value: 'Blue', price: 34.99, inStock: true },
                { id: '502-c3', name: 'Color', value: 'Pink', price: 34.99, inStock: true },
                { id: '502-c4', name: 'Color', value: 'Black', price: 34.99, inStock: true },
                { id: '502-c5', name: 'Color', value: 'Green', price: 37.99, inStock: true },
            ],
            thickness: [
                { id: '502-t1', name: 'Thickness', value: '6mm Standard', price: 34.99, inStock: true },
                { id: '502-t2', name: 'Thickness', value: '8mm Extra Cushion', price: 39.99, inStock: true },
            ],
        },

        features: [
            'Superior non-slip texture on both sides',
            'Extra cushioning for joint protection',
            'Eco-friendly TPE material',
            'Lightweight and portable',
            'Easy to clean and maintain',
            'Includes carrying strap',
            'Odor-resistant surface',
        ],

        specifications: {
            'Dimensions': '72" L x 24" W x 6mm thick',
            'Material': 'Eco-friendly TPE (Thermoplastic Elastomer)',
            'Weight': '2.2 lbs',
            'Grip': 'Dual-sided non-slip texture',
            'Care': 'Wipe clean with damp cloth',
            'Carrying': 'Included carrying strap',
            'Warranty': '1-year satisfaction guarantee',
        },

        badge: 'Eco-Friendly',
        badgeColor: '#059669',
        discount: '42% off',
        featured: true,

        slug: 'yoga-mat-premium-non-slip',
        relatedProducts: ['501', '22', '504'],

        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-12-07'),
    },

    {
        id: '503',
        name: 'Camping Sleeping Bag',
        description: 'Lightweight mummy sleeping bag rated for 3-season use. Compact design with compression sack for easy packing and transport.',
        shortDescription: 'Lightweight 3-season mummy sleeping bag',
        price: 49.99,
        originalPrice: 79.99,
        salePrice: 49.99,

        images: [
            { id: '503-1', url: getProductImageBySize('21', 'medium'), alt: 'Camping Sleeping Bag', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('21', 'medium'),

        brand: 'SleepWild',
        model: 'Compact Pro',
        sku: 'SW-SLEEP-001',
        category: 'sports-outdoors',
        subcategory: 'camping',
        tags: ['sleeping bag', 'camping', 'lightweight', 'mummy', 'backpacking'],

        rating: 4.4,
        reviewCount: 967,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'SleepWild',
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
                { id: '503-c1', name: 'Color', value: 'Forest Green', price: 49.99, inStock: true },
                { id: '503-c2', name: 'Color', value: 'Navy Blue', price: 49.99, inStock: true },
                { id: '503-c3', name: 'Color', value: 'Orange', price: 52.99, inStock: true },
            ],
            sizes: [
                { id: '503-s1', name: 'Size', value: 'Regular (up to 6\')', price: 49.99, inStock: true },
                { id: '503-s2', name: 'Size', value: 'Long (up to 6\'6")', price: 54.99, inStock: true },
            ],
        },

        features: [
            'Mummy shape for thermal efficiency',
            'Rated for 35°F comfort temperature',
            'Lightweight synthetic insulation',
            'Water-resistant shell',
            'Full-length zipper with draft tube',
            'Includes compression sack',
            'Machine washable',
        ],

        specifications: {
            'Temperature Rating': '35°F comfort / 20°F limit',
            'Fill': 'Synthetic hollow fiber insulation',
            'Shell': 'Water-resistant polyester',
            'Weight': '2.8 lbs',
            'Packed Size': '14" x 8" (compressed)',
            'Length': '80" (regular) / 84" (long)',
            'Shoulder Width': '32"',
        },

        badge: '3-Season',
        badgeColor: '#F59E0B',
        discount: '38% off',
        featured: false,

        slug: 'camping-sleeping-bag',
        relatedProducts: ['23', '504', '505'],

        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-12-05'),
    },

    {
        id: '504',
        name: 'Resistance Bands Set',
        description: 'Complete resistance bands workout set with multiple resistance levels, door anchor, and exercise guide. Perfect for home fitness.',
        shortDescription: 'Complete resistance bands set with door anchor',
        price: 24.99,
        originalPrice: 39.99,
        salePrice: 24.99,

        images: [
            { id: '504-1', url: getProductImageBySize('22', 'medium'), alt: 'Resistance Bands Set', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('22', 'medium'),

        brand: 'FlexFit',
        model: 'Power Bands Pro',
        sku: 'FF-BANDS-001',
        category: 'sports-outdoors',
        subcategory: 'fitness-equipment',
        tags: ['resistance bands', 'home workout', 'strength training', 'portable', 'exercise'],

        rating: 4.6,
        reviewCount: 1543,
        reviews: [],

        inStock: true,
        stockCount: 123,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'FlexFit',
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
            '5 resistance bands (10-50 lbs each)',
            'Door anchor for versatile workouts',
            'Comfortable foam handles',
            'Ankle straps included',
            'Protective sleeve covers',
            'Exercise guide with 30+ workouts',
            'Portable carrying bag',
        ],

        specifications: {
            'Bands': '5 bands with different resistance levels',
            'Resistance Range': '10-150 lbs combined',
            'Material': 'Natural latex',
            'Handles': 'Foam-padded for comfort',
            'Accessories': 'Door anchor, ankle straps, guide',
            'Portability': 'Compact carrying bag',
            'Warranty': '1-year replacement guarantee',
        },

        badge: 'Portable Gym',
        badgeColor: '#EC4899',
        discount: '38% off',
        featured: false,

        slug: 'resistance-bands-set',
        relatedProducts: ['501', '502', '22'],

        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-12-03'),
    },

    // =====================================
    // SMALL SPORTS & OUTDOORS ITEMS (small_25-30)
    // =====================================
    {
        id: '505',
        name: 'LED Camping Lantern',
        description: 'Bright LED camping lantern with multiple light modes, USB charging, and power bank function. Essential for outdoor adventures.',
        shortDescription: 'Rechargeable LED camping lantern with power bank',
        price: 19.99,
        originalPrice: 34.99,
        salePrice: 19.99,

        images: [
            { id: '505-1', url: getProductImageBySize('32', 'small'), alt: 'LED Camping Lantern', size: 'small' },
        ],
        primaryImage: getProductImageBySize('32', 'small'),
        brand: 'BrightCamp',
        model: 'Power Light Pro',
        sku: 'BC-LANTERN-001',
        category: 'sports-outdoors',
        subcategory: 'camping',
        tags: ['camping lantern', 'led', 'rechargeable', 'power bank', 'outdoor'],

        rating: 4.5,
        reviewCount: 1234,
        reviews: [],

        inStock: true,
        stockCount: 189,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'BrightCamp',
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
                { id: '505-c1', name: 'Color', value: 'Black', price: 19.99, inStock: true },
                { id: '505-c2', name: 'Color', value: 'Green', price: 19.99, inStock: true },
                { id: '505-c3', name: 'Color', value: 'Orange', price: 22.99, inStock: true },
            ],
        },

        features: [
            'Ultra-bright 1000 lumen LED',
            '4 light modes (high, medium, low, strobe)',
            'Built-in power bank (charges devices)',
            'USB-C rechargeable battery',
            'Water-resistant IPX4 rating',
            'Collapsible design for portability',
            'Up to 24 hours runtime',
        ],

        specifications: {
            'Brightness': '1000 lumens maximum',
            'Light Modes': '4 modes with dimming',
            'Battery': '10,000mAh rechargeable',
            'Runtime': '6-24 hours (mode dependent)',
            'Charging': 'USB-C input, USB-A output',
            'Water Resistance': 'IPX4',
            'Weight': '1.2 lbs',
        },

        badge: 'Multi-Function',
        badgeColor: '#F59E0B',
        discount: '43% off',
        featured: false,

        slug: 'led-camping-lantern',
        relatedProducts: ['23', '503', '506'],

        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-12-01'),
    },

    {
        id: '506',
        name: 'Bike Helmet Safety Certified',
        description: 'Lightweight bike helmet with CPSC safety certification, adjustable fit system, and excellent ventilation for comfortable riding.',
        shortDescription: 'CPSC certified bike helmet with adjustable fit',
        price: 29.99,
        originalPrice: 49.99,
        salePrice: 29.99,

        images: [
            { id: '506-1', url: getProductImageBySize('26', 'small'), alt: 'Bike Helmet Safety Certified', size: 'small' },
        ],
        primaryImage: getProductImageBySize('26', 'small'),

        brand: 'SafeRide',
        model: 'Aero Protect',
        sku: 'SR-HELMET-001',
        category: 'sports-outdoors',
        subcategory: 'cycling',
        tags: ['bike helmet', 'safety', 'cpsc certified', 'cycling', 'protection'],

        rating: 4.7,
        reviewCount: 2156,
        reviews: [],

        inStock: true,
        stockCount: 234,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'SafeRide',
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
                { id: '506-s1', name: 'Size', value: 'Small (54-57cm)', price: 29.99, inStock: true },
                { id: '506-s2', name: 'Size', value: 'Medium (57-61cm)', price: 29.99, inStock: true },
                { id: '506-s3', name: 'Size', value: 'Large (61-64cm)', price: 29.99, inStock: true },
            ],
            colors: [
                { id: '506-c1', name: 'Color', value: 'Matte Black', price: 29.99, inStock: true },
                { id: '506-c2', name: 'Color', value: 'White', price: 29.99, inStock: true },
                { id: '506-c3', name: 'Color', value: 'Red', price: 32.99, inStock: true },
                { id: '506-c4', name: 'Color', value: 'Blue', price: 32.99, inStock: true },
            ],
        },

        features: [
            'CPSC safety certified',
            'Lightweight in-mold construction',
            '21 ventilation holes for airflow',
            'Adjustable dial fit system',
            'Removable, washable padding',
            'Reflective rear decals',
            'Quick-release buckle',
        ],

        specifications: {
            'Certification': 'CPSC, CE certified',
            'Construction': 'In-mold polycarbonate shell',
            'Ventilation': '21 strategically placed vents',
            'Weight': '280 grams (medium)',
            'Fit System': 'Micro-adjustable dial',
            'Padding': 'Moisture-wicking, removable',
            'Sizes': 'Small, Medium, Large available',
        },

        badge: 'Safety First',
        badgeColor: '#EF4444',
        discount: '40% off',
        featured: false,

        slug: 'bike-helmet-safety-certified',
        relatedProducts: ['24', '507', '508'],

        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-11-30'),
    },

    {
        id: '507',
        name: 'Waterproof Dry Bag Set',
        description: 'Set of 3 waterproof dry bags in different sizes. Perfect for kayaking, hiking, and protecting gear from water damage.',
        shortDescription: 'Waterproof dry bag set for outdoor adventures',
        price: 16.99,
        originalPrice: 27.99,
        salePrice: 16.99,

        images: [
            { id: '507-1', url: getProductImageBySize('27', 'small'), alt: 'Waterproof Dry Bag Set', size: 'small' },
        ],
        primaryImage: getProductImageBySize('27', 'small'),

        brand: 'AquaShield',
        model: 'DryPack Pro',
        sku: 'AS-DRYBAG-003',
        category: 'sports-outdoors',
        subcategory: 'water-sports',
        tags: ['dry bag', 'waterproof', 'kayaking', 'hiking', 'gear protection'],

        rating: 4.4,
        reviewCount: 876,
        reviews: [],

        inStock: true,
        stockCount: 156,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'AquaShield',
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
                { id: '507-c1', name: 'Color Set', value: 'Blue Set', price: 16.99, inStock: true },
                { id: '507-c2', name: 'Color Set', value: 'Orange Set', price: 16.99, inStock: true },
                { id: '507-c3', name: 'Color Set', value: 'Mixed Colors', price: 18.99, inStock: true },
            ],
        },

        features: [
            '100% waterproof construction',
            'Set of 3 bags (5L, 10L, 20L)',
            'Welded seams prevent leaks',
            'Roll-top closure system',
            'Reinforced attachment points',
            'Translucent window for contents',
            'Lightweight and durable',
        ],

        specifications: {
            'Set Contents': '5L, 10L, and 20L dry bags',
            'Material': 'Heavy-duty PVC with welded seams',
            'Closure': 'Roll-top with buckle clip',
            'Water Rating': '100% waterproof',
            'Weight': '8 oz total (all 3 bags)',
            'Temperature Range': '-20°F to 158°F',
            'Colors': 'High-visibility options',
        },

        badge: '100% Waterproof',
        badgeColor: '#06B6D4',
        discount: '39% off',
        featured: false,

        slug: 'waterproof-dry-bag-set',
        relatedProducts: ['25', '505', '508'],

        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-28'),
    },

    {
        id: '508',
        name: 'Hiking Backpack 40L',
        description: 'Durable hiking backpack with multiple compartments, hydration compatibility, and comfortable suspension system for day hikes and overnight trips.',
        shortDescription: '40L hiking backpack with hydration system',
        price: 59.99,
        originalPrice: 99.99,
        salePrice: 59.99,

        images: [
            { id: '508-1', url: getProductImageBySize('28', 'small'), alt: 'Hiking Backpack 40L', size: 'small' },
        ],
        primaryImage: getProductImageBySize('28', 'small'),

        brand: 'TrailMaster',
        model: 'Explorer 40',
        sku: 'TM-PACK-040',
        category: 'sports-outdoors',
        subcategory: 'hiking',
        tags: ['hiking backpack', 'day pack', 'hydration', 'outdoor', 'trekking'],

        rating: 4.6,
        reviewCount: 1345,
        reviews: [],

        inStock: true,
        stockCount: 78,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'TrailMaster',
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
                { id: '508-c1', name: 'Color', value: 'Forest Green', price: 59.99, inStock: true },
                { id: '508-c2', name: 'Color', value: 'Navy Blue', price: 59.99, inStock: true },
                { id: '508-c3', name: 'Color', value: 'Charcoal Gray', price: 62.99, inStock: true },
                { id: '508-c4', name: 'Color', value: 'Orange', price: 64.99, inStock: true },
            ],
        },

        features: [
            '40L capacity for day hikes and overnight trips',
            'Adjustable suspension system',
            'Hydration reservoir compatible',
            'Multiple external pockets',
            'Rain cover included',
            'Padded shoulder straps and hip belt',
            'Durable ripstop fabric construction',
        ],

        specifications: {
            'Capacity': '40 liters',
            'Dimensions': '24" H x 14" W x 8" D',
            'Weight': '2.8 lbs',
            'Material': 'Ripstop nylon with DWR coating',
            'Load Capacity': '35 lbs recommended',
            'Hydration': 'Compatible with 2-3L reservoirs',
            'Features': 'Rain cover, multiple pockets',
        },

        badge: 'Trail Ready',
        badgeColor: '#059669',
        discount: '40% off',
        featured: false,

        slug: 'hiking-backpack-40l',
        relatedProducts: ['23', '503', '507'],

        createdAt: new Date('2024-11-10'),
        updatedAt: new Date('2024-11-25'),
    },

    {
        id: '509',
        name: 'Sports Water Bottle Insulated',
        description: 'Stainless steel insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Perfect for sports and outdoor activities.',
        shortDescription: 'Insulated stainless steel water bottle',
        price: 22.99,
        originalPrice: 34.99,
        salePrice: 22.99,

        images: [
            { id: '509-1', url: getProductImageBySize('29', 'small'), alt: 'Sports Water Bottle Insulated', size: 'small' },
        ],
        primaryImage: getProductImageBySize('29', 'small'),

        brand: 'HydroSport',
        model: 'ThermoMax',
        sku: 'HS-BOTTLE-001',
        category: 'sports-outdoors',
        subcategory: 'fitness-equipment',
        tags: ['water bottle', 'insulated', 'stainless steel', 'sports', 'hydration'],

        rating: 4.8,
        reviewCount: 3421,
        reviews: [],

        inStock: true,
        stockCount: 345,
        status: 'available',
        maxQuantity: 6,
        minQuantity: 1,

        seller: 'HydroSport',
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
                { id: '509-s1', name: 'Size', value: '18 oz', price: 19.99, inStock: true },
                { id: '509-s2', name: 'Size', value: '25 oz', price: 22.99, inStock: true },
                { id: '509-s3', name: 'Size', value: '32 oz', price: 26.99, inStock: true },
            ],
            colors: [
                { id: '509-c1', name: 'Color', value: 'Matte Black', price: 22.99, inStock: true },
                { id: '509-c2', name: 'Color', value: 'Stainless Steel', price: 22.99, inStock: true },
                { id: '509-c3', name: 'Color', value: 'Ocean Blue', price: 24.99, inStock: true },
                { id: '509-c4', name: 'Color', value: 'Forest Green', price: 24.99, inStock: true },
                { id: '509-c5', name: 'Color', value: 'Coral Pink', price: 24.99, inStock: true },
            ],
        },

        features: [
            'Double-wall vacuum insulation',
            'Keeps cold 24+ hours, hot 12+ hours',
            'Leak-proof sport cap',
            'BPA-free materials',
            'Wide mouth for easy filling',
            'Powder-coated finish',
            'Dishwasher safe (top rack)',
        ],

        specifications: {
            'Capacity': '25 oz (740ml)',
            'Material': '18/8 stainless steel',
            'Insulation': 'Double-wall vacuum',
            'Cap Type': 'Leak-proof sport flip cap',
            'Dimensions': '10.5" H x 3" diameter',
            'Weight': '12 oz',
            'Temperature': 'Cold 24hrs, Hot 12hrs',
        },

        badge: 'Temperature Lock',
        badgeColor: '#3B82F6',
        discount: '34% off',
        featured: false,

        slug: 'sports-water-bottle-insulated',
        relatedProducts: ['502', '504', '506'],

        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-22'),
    },

    {
        id: '510',
        name: 'Fitness Tracker Watch',
        description: 'Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and smartphone notifications. Perfect for active lifestyles.',
        shortDescription: 'Advanced fitness tracker with GPS and heart rate',
        price: 79.99,
        originalPrice: 129.99,
        salePrice: 79.99,

        images: [
            { id: '510-1', url: getProductImageBySize('30', 'small'), alt: 'Fitness Tracker Watch', size: 'small' },
        ],
        primaryImage: getProductImageBySize('30', 'small'),

        brand: 'ActiveTrack',
        model: 'Pulse Pro',
        sku: 'AT-TRACKER-001',
        category: 'sports-outdoors',
        subcategory: 'fitness-equipment',
        tags: ['fitness tracker', 'heart rate', 'gps', 'smartwatch', 'health'],

        rating: 4.3,
        reviewCount: 2876,
        reviews: [],

        inStock: true,
        stockCount: 123,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'ActiveTrack',
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
                { id: '510-c1', name: 'Band Color', value: 'Black', price: 79.99, inStock: true },
                { id: '510-c2', name: 'Band Color', value: 'Navy Blue', price: 79.99, inStock: true },
                { id: '510-c3', name: 'Band Color', value: 'Rose Pink', price: 84.99, inStock: true },
                { id: '510-c4', name: 'Band Color', value: 'Mint Green', price: 84.99, inStock: true },
            ],
        },

        features: [
            '24/7 heart rate monitoring',
            'Built-in GPS for route tracking',
            'Sleep quality analysis',
            'Smartphone notifications',
            '7-day battery life',
            'Water-resistant IP68',
            '20+ sport modes',
        ],

        specifications: {
            'Display': '1.3" color touchscreen',
            'Battery Life': '7 days typical use',
            'Water Resistance': 'IP68 (50m swimming)',
            'Connectivity': 'Bluetooth 5.0',
            'Sensors': 'Heart rate, GPS, accelerometer',
            'Compatibility': 'iOS and Android',
            'Charging': 'Magnetic USB charger',
        },

        badge: 'Health Monitor',
        badgeColor: '#10B981',
        discount: '38% off',
        featured: false,

        slug: 'fitness-tracker-watch',
        relatedProducts: ['501', '502', '509'],

        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-15'),
    },
];

// =====================================
// SPORTS & OUTDOORS SUBCATEGORIES
// =====================================
export const SPORTS_OUTDOORS_SUBCATEGORIES = [
    {
        id: 'fitness-equipment',
        name: 'Fitness Equipment',
        description: 'Home gym, cardio, and strength training equipment',
        icon: 'fitness-outline',
        color: '#EF4444',
        productCount: 5,
        featured: true,
    },
    {
        id: 'camping',
        name: 'Camping & Hiking',
        description: 'Tents, sleeping bags, and outdoor gear',
        icon: 'triangle-outline',
        color: '#059669',
        productCount: 3,
        featured: true,
    },
    {
        id: 'cycling',
        name: 'Cycling',
        description: 'Bikes, helmets, and cycling accessories',
        icon: 'bicycle-outline',
        color: '#3B82F6',
        productCount: 2,
        featured: true,
    },
    {
        id: 'water-sports',
        name: 'Water Sports',
        description: 'Kayaks, paddleboards, and water equipment',
        icon: 'water-outline',
        color: '#06B6D4',
        productCount: 2,
        featured: true,
    },
    {
        id: 'golf',
        name: 'Golf',
        description: 'Golf clubs, balls, and accessories',
        icon: 'golf-outline',
        color: '#10B981',
        productCount: 1,
        featured: false,
    },
    {
        id: 'hiking',
        name: 'Hiking & Backpacking',
        description: 'Backpacks, boots, and trail equipment',
        icon: 'trail-sign-outline',
        color: '#8B5CF6',
        productCount: 1,
        featured: false,
    },
    {
        id: 'team-sports',
        name: 'Team Sports',
        description: 'Basketball, football, soccer equipment',
        icon: 'basketball-outline',
        color: '#F59E0B',
        productCount: 0,
        featured: false,
    },
    {
        id: 'winter-sports',
        name: 'Winter Sports',
        description: 'Skiing, snowboarding, and winter gear',
        icon: 'snow-outline',
        color: '#84CC16',
        productCount: 0,
        featured: false,
    },
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get all sports & outdoors products
 */
export const getAllSportsOutdoorsProducts = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS;
};

/**
 * Get sports & outdoors products by subcategory
 */
export const getSportsOutdoorsBySubcategory = (subcategory: string): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product => product.subcategory === subcategory);
};

/**
 * Get featured sports & outdoors products
 */
export const getFeaturedSportsOutdoors = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product => product.featured === true);
};

/**
 * Get trending sports & outdoors products
 */
export const getTrendingSportsOutdoors = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product => product.trending === true);
};

/**
 * Get sports & outdoors products on sale
 */
export const getSportsOutdoorsOnSale = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        product.originalPrice && product.price < product.originalPrice
    );
};

/**
 * Get sports & outdoors products by brand
 */
export const getSportsOutdoorsByBrand = (brand: string): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );
};

/**
 * Get sports & outdoors products by activity type
 */
export const getSportsOutdoorsByActivity = (activity: 'fitness' | 'outdoor' | 'water' | 'cycling' | 'team'): Product[] => {
    const activityKeywords = {
        fitness: ['fitness', 'gym', 'workout', 'training', 'exercise'],
        outdoor: ['camping', 'hiking', 'outdoor', 'adventure', 'trail'],
        water: ['water', 'kayak', 'swimming', 'aqua', 'marine'],
        cycling: ['bike', 'cycling', 'bicycle', 'helmet'],
        team: ['basketball', 'football', 'soccer', 'volleyball', 'team']
    };

    const keywords = activityKeywords[activity];
    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        keywords.some(keyword =>
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
            product.subcategory.toLowerCase().includes(keyword)
        )
    );
};

/**
 * Get sports & outdoors products by price range
 */
export const getSportsOutdoorsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );
};

/**
 * Search sports & outdoors products
 */
export const searchSportsOutdoorsProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Get sports & outdoors product by ID
 */
export const getSportsOutdoorsProductById = (id: string): Product | undefined => {
    return SPORTS_OUTDOORS_PRODUCTS.find(product => product.id === id);
};

/**
 * Get related sports & outdoors products
 */
export const getRelatedSportsOutdoorsProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getSportsOutdoorsProductById(productId);
    if (!product || !product.relatedProducts) return [];

    return product.relatedProducts
        .map(id => getSportsOutdoorsProductById(id))
        .filter(Boolean)
        .slice(0, limit) as Product[];
};

/**
 * Get sports & outdoors products by rating
 */
export const getTopRatedSportsOutdoors = (minRating: number = 4.5): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product => product.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Get best selling sports & outdoors products
 */
export const getBestSellingSportsOutdoors = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product => product.bestSeller === true);
};

/**
 * Get new sports & outdoors arrivals
 */
export const getNewSportsOutdoorsArrivals = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product => product.newArrival === true);
};

/**
 * Get fitness equipment products
 */
export const getFitnessEquipment = (): Product[] => {
    return getSportsOutdoorsBySubcategory('fitness-equipment');
};

/**
 * Get camping products
 */
export const getCampingProducts = (): Product[] => {
    return getSportsOutdoorsBySubcategory('camping');
};

/**
 * Get cycling products
 */
export const getCyclingProducts = (): Product[] => {
    return getSportsOutdoorsBySubcategory('cycling');
};

/**
 * Get water sports products
 */
export const getWaterSportsProducts = (): Product[] => {
    return getSportsOutdoorsBySubcategory('water-sports');
};

/**
 * Get products by season
 */
export const getSportsOutdoorsBySeason = (season: 'spring' | 'summer' | 'fall' | 'winter'): Product[] => {
    const seasonalItems = {
        spring: ['hiking', 'cycling', 'outdoor', 'camping'],
        summer: ['water', 'camping', 'cycling', 'hiking'],
        fall: ['hiking', 'camping', 'fitness'],
        winter: ['fitness', 'indoor', 'gym']
    };

    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        keywords.some(keyword =>
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
            product.subcategory.toLowerCase().includes(keyword)
        )
    );
};

/**
 * Get home gym equipment
 */
export const getHomeGymEquipment = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        product.tags.some(tag =>
            ['fitness', 'home gym', 'exercise', 'workout', 'strength training'].includes(tag.toLowerCase())
        )
    );
};

/**
 * Get outdoor adventure gear
 */
export const getOutdoorAdventureGear = (): Product[] => {
    return SPORTS_OUTDOORS_PRODUCTS.filter(product =>
        product.tags.some(tag =>
            ['camping', 'hiking', 'outdoor', 'adventure', 'backpacking'].includes(tag.toLowerCase())
        )
    );
};

// =====================================
// EXPORT DEFAULT
// =====================================
export default {
    products: SPORTS_OUTDOORS_PRODUCTS,
    subcategories: SPORTS_OUTDOORS_SUBCATEGORIES,
    getAllProducts: getAllSportsOutdoorsProducts,
    getBySubcategory: getSportsOutdoorsBySubcategory,
    getFeatured: getFeaturedSportsOutdoors,
    getTrending: getTrendingSportsOutdoors,
    getOnSale: getSportsOutdoorsOnSale,
    getByBrand: getSportsOutdoorsByBrand,
    getByActivity: getSportsOutdoorsByActivity,
    getByPriceRange: getSportsOutdoorsByPriceRange,
    search: searchSportsOutdoorsProducts,
    getById: getSportsOutdoorsProductById,
    getRelated: getRelatedSportsOutdoorsProducts,
    getTopRated: getTopRatedSportsOutdoors,
    getBestSelling: getBestSellingSportsOutdoors,
    getNewArrivals: getNewSportsOutdoorsArrivals,
    getFitnessEquipment: getFitnessEquipment,
    getCamping: getCampingProducts,
    getCycling: getCyclingProducts,
    getWaterSports: getWaterSportsProducts,
    getBySeason: getSportsOutdoorsBySeason,
    getHomeGym: getHomeGymEquipment,
    getOutdoorGear: getOutdoorAdventureGear,
};