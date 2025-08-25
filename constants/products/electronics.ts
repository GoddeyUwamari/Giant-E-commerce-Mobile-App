// constants/products/electronics.ts
// Electronics category products

import { Product } from './interfaces';
import { getProductImageBySize, getBannerImage } from '../../assets/images/imageLoader';

export const ELECTRONICS_PRODUCTS: Product[] = [
    // =====================================
    // LARGE ELECTRONICS (prod_01-07)
    // =====================================
    {
        id: '1',
        name: 'SKIM Hair Dryer Professional',
        description: 'Professional-grade hair dryer with ionic technology for faster drying and reduced frizz. Features multiple heat and speed settings for all hair types.',
        shortDescription: 'Professional ionic hair dryer with multiple settings',
        price: 21.99,
        originalPrice: 79.99,
        salePrice: 21.99,

        images: [
            { id: '1-1', url: getProductImageBySize('1', 'large'), alt: 'SKIM Hair Dryer Front View', size: 'large' },
            { id: '1-2', url: getProductImageBySize('1', 'medium'), alt: 'SKIM Hair Dryer Side View', size: 'medium' },
            { id: '1-3', url: getProductImageBySize('1', 'small'), alt: 'SKIM Hair Dryer Back View', size: 'small' },
        ],
        primaryImage: getProductImageBySize('1', 'large'),
        thumbnailImage: getProductImageBySize('1', 'small'),

        brand: 'SKIM',
        model: 'Pro-2000',
        sku: 'SKIM-HD-001',
        upc: '123456789012',
        category: 'electronics',
        subcategory: 'personal-care',
        tags: ['hair dryer', 'ionic', 'professional', 'beauty'],

        rating: 4.5,
        reviewCount: 1250,
        reviews: [],

        inStock: true,
        stockCount: 47,
        status: 'available',
        maxQuantity: 10,
        minQuantity: 1,

        seller: 'SKIM Official',
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
                { id: '1-c1', name: 'Color', value: 'Black', price: 21.99, inStock: true },
                { id: '1-c2', name: 'Color', value: 'White', price: 24.99, inStock: true },
                { id: '1-c3', name: 'Color', value: 'Pink', price: 26.99, inStock: false },
            ],
        },

        features: [
            'Ionic technology for reduced frizz',
            '1875 watts of power',
            '3 heat and 2 speed settings',
            'Cool shot button',
            'Removable filter for easy cleaning',
            'Lightweight design',
        ],

        specifications: {
            'Power': '1875 Watts',
            'Voltage': '110-120V',
            'Cord Length': '6 feet',
            'Weight': '1.2 lbs',
            'Warranty': '2 years',
            'Dimensions': '9.5 x 3.5 x 10 inches',
        },

        badge: 'Best Seller',
        badgeColor: '#EF4444',
        discount: '72% off',
        featured: true,
        trending: true,
        bestSeller: true,

        slug: 'skim-hair-dryer-professional',
        relatedProducts: ['2', '6', '13'],

        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '2',
        name: 'Bluebow Electric 5.3QT Air Fryer',
        description: 'Large capacity air fryer with digital touchscreen controls. Cook healthier meals with up to 85% less oil while maintaining great taste and texture.',
        shortDescription: 'Digital air fryer with 5.3QT capacity',
        price: 64.99,
        originalPrice: 159.98,
        salePrice: 64.99,

        images: [
            { id: '2-1', url: getProductImageBySize('2', 'large'), alt: 'Bluebow Air Fryer Front', size: 'large' },
            { id: '2-2', url: getProductImageBySize('2', 'medium'), alt: 'Bluebow Air Fryer Open', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('2', 'large'),
        thumbnailImage: getProductImageBySize('2', 'small'),

        brand: 'Bluebow',
        model: 'AF-5300',
        sku: 'BB-ELE-5QT',
        category: 'electronics',
        subcategory: 'kitchen-appliances',
        tags: ['air fryer', 'kitchen', 'healthy cooking', 'digital'],

        rating: 4.6,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 23,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'Bluebow Direct',
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

        features: [
            '5.3 quart capacity serves 3-4 people',
            'Digital touchscreen with 8 preset programs',
            'Temperature range: 180°F - 400°F',
            'Timer up to 60 minutes',
            'Non-stick basket and crisper plate',
            'Auto shut-off safety feature',
        ],

        specifications: {
            'Capacity': '5.3 Quarts',
            'Power': '1700 Watts',
            'Temperature Range': '180°F - 400°F',
            'Timer': '1-60 minutes',
            'Dimensions': '14.2 x 11 x 12.7 inches',
            'Weight': '11.5 lbs',
        },

        badge: 'Hot Deal',
        badgeColor: '#F59E0B',
        discount: '59% off',
        featured: true,
        trending: false,

        slug: 'bluebow-electric-air-fryer-5qt',
        relatedProducts: ['8', '12'],

        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-10'),
    },

    {
        id: '3',
        name: 'Samsung 65" QLED 4K Smart TV',
        description: 'Stunning 65-inch QLED 4K Smart TV with Quantum Dot technology delivering vibrant colors and sharp detail. Built-in streaming apps and voice control.',
        shortDescription: '65-inch QLED 4K Smart TV with streaming',
        price: 899.99,
        originalPrice: 1499.99,
        salePrice: 899.99,

        images: [
            { id: '3-1', url: getProductImageBySize('3', 'large'), alt: 'Samsung 65" QLED TV Front', size: 'large' },
            { id: '3-2', url: getProductImageBySize('3', 'medium'), alt: 'Samsung TV Side Profile', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('3', 'large'),

        brand: 'Samsung',
        model: 'QN65Q70C',
        sku: 'TV-65-SMT',
        category: 'electronics',
        subcategory: 'tvs-audio',
        tags: ['tv', 'smart tv', '4k', 'qled', 'samsung'],

        rating: 4.8,
        reviewCount: 1856,
        reviews: [],

        inStock: true,
        stockCount: 8,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'Samsung Official',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '3-5 business days',
            methods: ['Standard', 'White Glove Setup'],
        },
        delivery: {
            option: 'delivery',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '3-s1', name: 'Screen Size', value: '55"', price: 799.99, inStock: true },
                { id: '3-s2', name: 'Screen Size', value: '65"', price: 899.99, inStock: true },
                { id: '3-s3', name: 'Screen Size', value: '75"', price: 1199.99, inStock: true },
                { id: '3-s4', name: 'Screen Size', value: '85"', price: 1599.99, inStock: false },
            ],
        },

        features: [
            'QLED Quantum Dot technology',
            '4K UHD resolution (3840 x 2160)',
            'HDR10+ and Dolby Vision support',
            'Smart TV with Tizen OS',
            'Built-in streaming apps (Netflix, Prime Video, etc.)',
            'Voice control with Bixby and Alexa',
            'Multiple HDMI and USB ports',
        ],

        specifications: {
            'Screen Size': '65 inches',
            'Resolution': '4K UHD (3840 x 2160)',
            'Display Technology': 'QLED',
            'Smart Platform': 'Tizen OS',
            'HDR': 'HDR10+, Dolby Vision',
            'Connectivity': '4 HDMI, 2 USB, Wi-Fi, Bluetooth',
            'Dimensions': '57.1 x 32.7 x 2.3 inches',
        },

        badge: 'Save $600',
        badgeColor: '#10B981',
        discount: '40% off',
        featured: true,
        trending: true,

        slug: 'samsung-65-qled-4k-smart-tv',
        relatedProducts: ['4', '6'],

        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-12-08'),
    },

    {
        id: '4',
        name: 'iPhone 15 Pro Max 256GB Deep Purple',
        description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and 48MP camera system. Features USB-C, Action Button, and all-day battery life.',
        shortDescription: 'Latest iPhone with A17 Pro chip and 48MP camera',
        price: 1199.99,
        originalPrice: 1299.99,
        salePrice: 1199.99,

        images: [
            { id: '4-1', url: getProductImageBySize('4', 'large'), alt: 'iPhone 15 Pro Max Front', size: 'large' },
            { id: '4-2', url: getProductImageBySize('4', 'medium'), alt: 'iPhone 15 Pro Max Back', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('4', 'large'),

        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        sku: 'APL-IP15PM-256',
        category: 'electronics',
        subcategory: 'smartphones',
        tags: ['iphone', 'apple', 'smartphone', '5g', 'pro'],

        rating: 4.9,
        reviewCount: 2847,
        reviews: [],

        inStock: true,
        stockCount: 25,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'Apple Store',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '1-2 business days',
            methods: ['Express', 'Same Day'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            colors: [
                { id: '4-c1', name: 'Color', value: 'Deep Purple', price: 1199.99, inStock: true },
                { id: '4-c2', name: 'Color', value: 'Space Black', price: 1199.99, inStock: true },
                { id: '4-c3', name: 'Color', value: 'Silver', price: 1199.99, inStock: true },
                { id: '4-c4', name: 'Color', value: 'Gold', price: 1199.99, inStock: false },
            ],
            storage: [
                { id: '4-s1', name: 'Storage', value: '128GB', price: 1099.99, inStock: true },
                { id: '4-s2', name: 'Storage', value: '256GB', price: 1199.99, inStock: true },
                { id: '4-s3', name: 'Storage', value: '512GB', price: 1399.99, inStock: true },
                { id: '4-s4', name: 'Storage', value: '1TB', price: 1599.99, inStock: true },
            ],
        },

        features: [
            'A17 Pro chip with 6-core GPU',
            '6.7-inch Super Retina XDR display',
            '48MP Main camera with 5x optical zoom',
            'Titanium design with Action Button',
            'USB-C connector',
            'Up to 29 hours video playback',
            'Face ID for secure authentication',
            '5G connectivity',
        ],

        specifications: {
            'Display': '6.7-inch Super Retina XDR OLED',
            'Chip': 'A17 Pro',
            'Storage': '256GB',
            'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
            'Battery': 'Up to 29 hours video playback',
            'Operating System': 'iOS 17',
            'Connectivity': '5G, Wi-Fi 6E, Bluetooth 5.3',
            'Dimensions': '6.33 × 3.05 × 0.32 inches',
        },

        badge: 'New',
        badgeColor: '#3B82F6',
        featured: true,
        newArrival: true,

        slug: 'iphone-15-pro-max-256gb-deep-purple',
        relatedProducts: ['6', '7', '13'],

        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-12-14'),
    },

    {
        id: '6',
        name: 'Apple AirPods Pro (2nd Generation)',
        description: 'AirPods Pro with advanced Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio for an immersive listening experience.',
        shortDescription: 'AirPods Pro with Active Noise Cancellation',
        price: 199.99,
        originalPrice: 249.99,
        salePrice: 199.99,

        images: [
            { id: '6-1', url: getProductImageBySize('6', 'large'), alt: 'AirPods Pro Case', size: 'large' },
            { id: '6-2', url: getProductImageBySize('6', 'medium'), alt: 'AirPods Pro Open Case', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('6', 'large'),

        brand: 'Apple',
        model: 'AirPods Pro 2nd Gen',
        sku: 'APL-APP-2GEN',
        category: 'electronics',
        subcategory: 'headphones',
        tags: ['airpods', 'apple', 'wireless', 'noise cancellation'],

        rating: 4.7,
        reviewCount: 2105,
        reviews: [],

        inStock: true,
        stockCount: 156,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'Apple Store',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '1-2 business days',
            methods: ['Standard', 'Express'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        features: [
            'Active Noise Cancellation',
            'Adaptive Transparency mode',
            'Personalized Spatial Audio',
            'Up to 6 hours listening time',
            'Up to 30 hours with charging case',
            'Sweat and water resistant (IPX4)',
            'Touch control',
        ],

        specifications: {
            'Battery Life': 'Up to 6 hours (30 hours with case)',
            'Connectivity': 'Bluetooth 5.3',
            'Water Resistance': 'IPX4',
            'Chip': 'Apple H2',
            'Case Charging': 'Lightning, MagSafe, Qi wireless',
            'Weight': '5.3g each AirPod',
            'Included': 'AirPods Pro, Lightning Charging Case, Silicone ear tips',
        },

        badge: 'Limited Time',
        badgeColor: '#F59E0B',
        discount: '20% off',
        featured: true,
        trending: true,

        slug: 'apple-airpods-pro-2nd-generation',
        relatedProducts: ['4', '7', '1'],

        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-12-11'),
    },

    {
        id: '7',
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and crystal-clear hands-free calling.',
        shortDescription: 'Premium noise canceling over-ear headphones',
        price: 349.99,
        originalPrice: 399.99,
        salePrice: 349.99,

        images: [
            { id: '7-1', url: getProductImageBySize('7', 'large'), alt: 'Sony WH-1000XM5 Headphones', size: 'large' },
        ],
        primaryImage: getProductImageBySize('7', 'large'),

        brand: 'Sony',
        model: 'WH-1000XM5',
        sku: 'SONY-WH1000XM5',
        category: 'electronics',
        subcategory: 'headphones',
        tags: ['headphones', 'sony', 'noise canceling', 'wireless'],

        rating: 4.7,
        reviewCount: 743,
        reviews: [],

        inStock: true,
        stockCount: 45,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'Sony Official',
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
            colors: [
                { id: '7-c1', name: 'Color', value: 'Black', price: 349.99, inStock: true },
                { id: '7-c2', name: 'Color', value: 'Silver', price: 349.99, inStock: true },
            ],
        },

        features: [
            'Industry-leading noise canceling',
            '30-hour battery life',
            'Quick charge: 3 min = 3 hours playback',
            'Crystal clear hands-free calling',
            'Multipoint connection',
            'Touch sensor controls',
            'Speak-to-Chat technology',
        ],

        specifications: {
            'Battery Life': '30 hours',
            'Charging': 'USB-C',
            'Weight': '250g',
            'Driver': '30mm',
            'Frequency Response': '4Hz-40,000Hz',
            'Connectivity': 'Bluetooth 5.2',
            'Included': 'Headphones, carrying case, cable',
        },

        badge: 'Popular',
        badgeColor: '#8B5CF6',
        discount: '13% off',
        featured: true,
        trending: true,

        slug: 'sony-wh-1000xm5-headphones',
        relatedProducts: ['6', '4'],

        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-12-09'),
    },

    // =====================================
    // MEDIUM ELECTRONICS (using med_01-06)
    // =====================================
    {
        id: '101',
        name: 'Dell 27" 4K Gaming Monitor',
        description: 'Professional 27-inch 4K gaming monitor with 144Hz refresh rate, HDR support, and ultra-thin bezels. Perfect for gaming and productivity.',
        shortDescription: '27-inch 4K gaming monitor with 144Hz',
        price: 329.99,
        originalPrice: 449.99,
        salePrice: 329.99,

        images: [
            { id: '101-1', url: getProductImageBySize('1', 'medium'), alt: 'Dell 4K Gaming Monitor Front', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('1', 'medium'),

        brand: 'Dell',
        model: 'S2722DC',
        sku: 'DELL-MON-27-4K',
        category: 'electronics',
        subcategory: 'computers-tablets',
        tags: ['monitor', 'gaming', '4k', 'dell', 'hdr'],

        rating: 4.6,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 34,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'Dell Official',
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
            '27-inch 4K UHD display (3840x2160)',
            '144Hz refresh rate for smooth gaming',
            'HDR10 support for vivid colors',
            'Ultra-thin bezels for multi-monitor setup',
            'USB-C connectivity with 65W power delivery',
            'Height, tilt, and swivel adjustments',
        ],

        specifications: {
            'Screen Size': '27 inches',
            'Resolution': '4K UHD (3840x2160)',
            'Refresh Rate': '144Hz',
            'Panel Type': 'IPS',
            'Connectivity': 'HDMI 2.1, USB-C, DisplayPort',
            'Response Time': '1ms',
            'Color Gamut': '99% sRGB',
        },

        badge: 'Gaming',
        badgeColor: '#EF4444',
        discount: '27% off',
        featured: true,
        trending: true,

        slug: 'dell-27-4k-gaming-monitor',
        relatedProducts: ['3', '4'],

        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-12-10'),
    },

    {
        id: '102',
        name: 'Logitech MX Master 3 Wireless Mouse',
        description: 'Advanced wireless mouse with precision scrolling, customizable buttons, and multi-device connectivity. Works on any surface including glass.',
        shortDescription: 'Premium wireless mouse with precision control',
        price: 79.99,
        originalPrice: 99.99,
        salePrice: 79.99,

        images: [
            { id: '102-1', url: getProductImageBySize('2', 'medium'), alt: 'Logitech MX Master 3 Mouse', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('2', 'medium'),

        brand: 'Logitech',
        model: 'MX Master 3',
        sku: 'LOG-MX3-MOUSE',
        category: 'electronics',
        subcategory: 'computers-tablets',
        tags: ['mouse', 'wireless', 'logitech', 'productivity'],

        rating: 4.8,
        reviewCount: 1567,
        reviews: [],

        inStock: true,
        stockCount: 78,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'Logitech Official',
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
                { id: '102-c1', name: 'Color', value: 'Graphite', price: 79.99, inStock: true },
                { id: '102-c2', name: 'Color', value: 'Mid Grey', price: 79.99, inStock: true },
                { id: '102-c3', name: 'Color', value: 'Pale Grey', price: 84.99, inStock: true },
            ],
        },

        features: [
            'MagSpeed electromagnetic scrolling',
            'Connect up to 3 devices via Bluetooth or USB',
            '70-day battery life on single charge',
            'Works on any surface, even glass',
            '7 customizable buttons',
            'USB-C fast charging',
        ],

        specifications: {
            'Connectivity': 'Bluetooth, USB-C receiver',
            'Battery Life': 'Up to 70 days',
            'Sensor': 'Darkfield high precision',
            'DPI': '200-4000 (adjustable)',
            'Weight': '141g',
            'Dimensions': '5.2 x 3.3 x 2.0 inches',
        },

        badge: 'Productivity',
        badgeColor: '#10B981',
        discount: '20% off',
        featured: false,

        slug: 'logitech-mx-master-3-wireless-mouse',
        relatedProducts: ['103', '104'],

        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-12-05'),
    },

    {
        id: '103',
        name: 'Mechanical Gaming Keyboard RGB',
        description: 'Full-size mechanical gaming keyboard with Cherry MX switches, customizable RGB backlighting, and programmable macro keys.',
        shortDescription: 'RGB mechanical keyboard with macro keys',
        price: 129.99,
        originalPrice: 179.99,
        salePrice: 129.99,

        images: [
            { id: '103-1', url: getProductImageBySize('3', 'medium'), alt: 'RGB Gaming Keyboard', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('3', 'medium'),

        brand: 'TechGear',
        model: 'TG-K87',
        sku: 'TG-KEYBOARD-RGB',
        category: 'electronics',
        subcategory: 'computers-tablets',
        tags: ['keyboard', 'gaming', 'mechanical', 'rgb'],

        rating: 4.5,
        reviewCount: 634,
        reviews: [],

        inStock: true,
        stockCount: 52,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'TechGear Direct',
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
            switches: [
                { id: '103-s1', name: 'Switch Type', value: 'Cherry MX Red', price: 129.99, inStock: true },
                { id: '103-s2', name: 'Switch Type', value: 'Cherry MX Blue', price: 129.99, inStock: true },
                { id: '103-s3', name: 'Switch Type', value: 'Cherry MX Brown', price: 134.99, inStock: true },
            ],
        },

        features: [
            'Cherry MX mechanical switches',
            'Per-key RGB backlighting',
            '6 programmable macro keys',
            'Anti-ghosting technology',
            'Detachable USB-C cable',
            'Aluminum top plate for durability',
        ],

        specifications: {
            'Switch Type': 'Cherry MX (various)',
            'Layout': 'Full-size (104 keys)',
            'Backlighting': 'Per-key RGB',
            'Connectivity': 'USB-C',
            'Key Rollover': 'N-key rollover',
            'Dimensions': '17.3 x 5.1 x 1.4 inches',
        },

        badge: 'Gaming',
        badgeColor: '#8B5CF6',
        discount: '28% off',
        featured: false,

        slug: 'mechanical-gaming-keyboard-rgb',
        relatedProducts: ['102', '104'],

        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-01'),
    },

    {
        id: '104',
        name: 'iPad Air 11" M2 Chip 256GB',
        description: 'Powerful iPad Air with M2 chip, 11-inch Liquid Retina display, and all-day battery life. Perfect for creativity, productivity, and entertainment.',
        shortDescription: '11-inch iPad Air with M2 chip and 256GB storage',
        price: 749.99,
        originalPrice: 899.99,
        salePrice: 749.99,

        images: [
            { id: '104-1', url: getProductImageBySize('4', 'medium'), alt: 'iPad Air M2 Front View', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('4', 'medium'),

        brand: 'Apple',
        model: 'iPad Air M2',
        sku: 'APL-IPAD-AIR-M2',
        category: 'electronics',
        subcategory: 'computers-tablets',
        tags: ['ipad', 'tablet', 'apple', 'm2', 'productivity'],

        rating: 4.8,
        reviewCount: 1234,
        reviews: [],

        inStock: true,
        stockCount: 42,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'Apple Store',
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
                { id: '104-c1', name: 'Color', value: 'Space Gray', price: 749.99, inStock: true },
                { id: '104-c2', name: 'Color', value: 'Starlight', price: 749.99, inStock: true },
                { id: '104-c3', name: 'Color', value: 'Pink', price: 749.99, inStock: true },
                { id: '104-c4', name: 'Color', value: 'Purple', price: 749.99, inStock: false },
                { id: '104-c5', name: 'Color', value: 'Blue', price: 749.99, inStock: true },
            ],
            storage: [
                { id: '104-s1', name: 'Storage', value: '128GB', price: 649.99, inStock: true },
                { id: '104-s2', name: 'Storage', value: '256GB', price: 749.99, inStock: true },
                { id: '104-s3', name: 'Storage', value: '512GB', price: 949.99, inStock: true },
                { id: '104-s4', name: 'Storage', value: '1TB', price: 1149.99, inStock: true },
            ],
        },

        features: [
            'M2 chip with 8-core CPU and 10-core GPU',
            '11-inch Liquid Retina display',
            '12MP Wide camera with Smart HDR 4',
            '12MP Ultra Wide front camera',
            'Compatible with Apple Pencil (2nd generation)',
            'Magic Keyboard and Smart Keyboard Folio support',
            'All-day battery life',
            'Touch ID for secure authentication',
        ],

        specifications: {
            'Display': '11-inch Liquid Retina LED-backlit Multi‑Touch',
            'Chip': 'Apple M2 chip',
            'Storage': '256GB',
            'Camera': '12MP Wide, 12MP Ultra Wide front',
            'Battery': 'Up to 10 hours of surfing the web on Wi‑Fi',
            'Operating System': 'iPadOS 17',
            'Connectivity': 'Wi-Fi 6E, Bluetooth 5.3',
            'Dimensions': '9.74 × 7.02 × 0.24 inches',
        },

        badge: 'Popular',
        badgeColor: '#3B82F6',
        discount: '17% off',
        featured: true,
        trending: true,

        slug: 'ipad-air-11-m2-chip-256gb',
        relatedProducts: ['4', '102', '103'],

        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-12-12'),
    },

    {
        id: '105',
        name: 'Apple Watch Series 9 GPS 45mm',
        description: 'Advanced smartwatch with health monitoring, fitness tracking, and seamless iPhone integration. Features the powerful S9 chip and always-on Retina display.',
        shortDescription: 'Apple Watch Series 9 with GPS and health monitoring',
        price: 429.99,
        originalPrice: 479.99,
        salePrice: 429.99,

        images: [
            { id: '105-1', url: getProductImageBySize('5', 'medium'), alt: 'Apple Watch Series 9', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('5', 'medium'),

        brand: 'Apple',
        model: 'Watch Series 9',
        sku: 'APL-WATCH-S9-45',
        category: 'electronics',
        subcategory: 'wearables',
        tags: ['apple watch', 'smartwatch', 'fitness', 'health', 'gps'],

        rating: 4.9,
        reviewCount: 2891,
        reviews: [],

        inStock: true,
        stockCount: 67,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'Apple Store',
        storeId: 'store_001',
        storeName: 'Walmart Supercenter',

        shipping: {
            free: true,
            estimatedDays: '1-2 business days',
            methods: ['Standard', 'Express'],
        },
        delivery: {
            option: 'pickup',
            freeShippingEligible: true,
        },

        variants: {
            sizes: [
                { id: '105-s1', name: 'Case Size', value: '41mm', price: 399.99, inStock: true },
                { id: '105-s2', name: 'Case Size', value: '45mm', price: 429.99, inStock: true },
            ],
            colors: [
                { id: '105-c1', name: 'Case Color', value: 'Midnight Aluminum', price: 429.99, inStock: true },
                { id: '105-c2', name: 'Case Color', value: 'Starlight Aluminum', price: 429.99, inStock: true },
                { id: '105-c3', name: 'Case Color', value: 'Silver Aluminum', price: 429.99, inStock: true },
                { id: '105-c4', name: 'Case Color', value: 'Pink Aluminum', price: 429.99, inStock: true },
                { id: '105-c5', name: 'Case Color', value: 'Product RED Aluminum', price: 429.99, inStock: false },
            ],
        },

        features: [
            'S9 SiP with 64-bit dual-core processor',
            'Always-On Retina display',
            'Blood Oxygen app and ECG app',
            'High and low heart rate notifications',
            'Fall Detection and Crash Detection',
            'Water resistant to 50 meters',
            'GPS and cellular options available',
            'Digital Crown with haptic feedback',
        ],

        specifications: {
            'Case Size': '45mm',
            'Display': 'Always-On Retina LTPO OLED',
            'Chip': 'S9 SiP with 64-bit dual-core processor',
            'Storage': '64GB',
            'Connectivity': 'GPS, Wi-Fi, Bluetooth 5.3',
            'Battery': 'Up to 18 hours',
            'Water Resistance': '50 meters',
            'Operating System': 'watchOS 10',
        },

        badge: 'Health & Fitness',
        badgeColor: '#10B981',
        discount: '10% off',
        featured: true,
        trending: true,

        slug: 'apple-watch-series-9-gps-45mm',
        relatedProducts: ['4', '6', '104'],

        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-12-13'),
    },

    {
        id: '106',
        name: 'Anker PowerCore Wireless Power Bank',
        description: 'High-capacity wireless power bank with 10,000mAh battery, Qi wireless charging, and multiple ports for charging multiple devices simultaneously.',
        shortDescription: 'Wireless power bank with 10,000mAh capacity',
        price: 49.99,
        originalPrice: 79.99,
        salePrice: 49.99,

        images: [
            { id: '106-1', url: getProductImageBySize('6', 'medium'), alt: 'Anker Wireless Power Bank', size: 'medium' },
        ],
        primaryImage: getProductImageBySize('6', 'medium'),

        brand: 'Anker',
        model: 'PowerCore 10K Wireless',
        sku: 'ANK-PC10K-WL',
        category: 'electronics',
        subcategory: 'accessories',
        tags: ['power bank', 'wireless charging', 'portable', 'anker'],

        rating: 4.6,
        reviewCount: 1456,
        reviews: [],

        inStock: true,
        stockCount: 123,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'Anker Official',
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
                { id: '106-c1', name: 'Color', value: 'Black', price: 49.99, inStock: true },
                { id: '106-c2', name: 'Color', value: 'White', price: 49.99, inStock: true },
                { id: '106-c3', name: 'Color', value: 'Blue', price: 52.99, inStock: true },
            ],
        },

        features: [
            '10,000mAh high-capacity battery',
            'Qi wireless charging (up to 10W)',
            'USB-C and USB-A ports',
            'Charge 3 devices simultaneously',
            'LED power indicator',
            'MultiProtect safety technology',
            'Compact and portable design',
        ],

        specifications: {
            'Capacity': '10,000mAh / 37Wh',
            'Wireless Output': '5W / 7.5W / 10W',
            'USB-C Output': '18W',
            'USB-A Output': '12W',
            'Input': 'USB-C 18W',
            'Dimensions': '6.3 × 2.7 × 0.7 inches',
            'Weight': '8.1 oz',
        },

        badge: 'Portable',
        badgeColor: '#F59E0B',
        discount: '38% off',
        featured: false,

        slug: 'anker-powercore-wireless-power-bank',
        relatedProducts: ['4', '105', '107'],

        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-12-07'),
    },

    // =====================================
    // SMALL ELECTRONICS (using small_01-06)
    // =====================================
    {
        id: '107',
        name: 'Premium Wireless Bluetooth Earbuds',
        description: 'High-quality wireless earbuds with active noise cancellation, premium sound quality, and long-lasting battery life with charging case.',
        shortDescription: 'Wireless earbuds with noise cancellation',
        price: 59.99,
        originalPrice: 149.99,
        salePrice: 59.99,

        images: [
            { id: '107-1', url: getProductImageBySize('1', 'small'), alt: 'Wireless Bluetooth Earbuds', size: 'small' },
        ],
        primaryImage: getProductImageBySize('1', 'small'),

        brand: 'SoundMax',
        model: 'SM-TWS300',
        sku: 'SM-TWS-300',
        category: 'electronics',
        subcategory: 'headphones',
        tags: ['earbuds', 'wireless', 'bluetooth', 'noise cancellation'],

        rating: 4.4,
        reviewCount: 823,
        reviews: [],

        inStock: true,
        stockCount: 89,
        status: 'available',
        maxQuantity: 5,
        minQuantity: 1,

        seller: 'SoundMax Direct',
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
                { id: '107-c1', name: 'Color', value: 'Black', price: 59.99, inStock: true },
                { id: '107-c2', name: 'Color', value: 'White', price: 59.99, inStock: true },
                { id: '107-c3', name: 'Color', value: 'Rose Gold', price: 64.99, inStock: true },
            ],
        },

        features: [
            'Active noise cancellation',
            '6 hours playback + 24 hours with case',
            'Quick charge: 15 min = 2 hours playback',
            'IPX5 water resistance',
            'Touch controls',
            'Built-in microphone for calls',
            'Auto-pairing technology',
        ],

        specifications: {
            'Battery Life': '6 hours (30 hours with case)',
            'Connectivity': 'Bluetooth 5.2',
            'Water Resistance': 'IPX5',
            'Driver Size': '10mm',
            'Frequency Response': '20Hz-20kHz',
            'Charging': 'USB-C',
            'Weight': '4.5g each earbud',
        },

        badge: 'Value',
        badgeColor: '#10B981',
        discount: '60% off',
        featured: false,

        slug: 'premium-wireless-bluetooth-earbuds',
        relatedProducts: ['6', '7', '4'],

        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-12-14'),
    },

    {
        id: '108',
        name: 'Fast Charging USB-C Cable 6ft',
        description: 'Durable braided USB-C cable with fast charging support up to 100W and 480Mbps data transfer. Compatible with most USB-C devices.',
        shortDescription: 'Braided USB-C cable with 100W fast charging',
        price: 12.99,
        originalPrice: 24.99,
        salePrice: 12.99,

        images: [
            { id: '108-1', url: getProductImageBySize('2', 'small'), alt: 'USB-C Charging Cable', size: 'small' },
        ],
        primaryImage: getProductImageBySize('2', 'small'),

        brand: 'ChargeMax',
        model: 'CM-USBC-6FT',
        sku: 'CM-CABLE-USBC',
        category: 'electronics',
        subcategory: 'accessories',
        tags: ['usb-c', 'cable', 'fast charging', 'braided'],

        rating: 4.7,
        reviewCount: 2156,
        reviews: [],

        inStock: true,
        stockCount: 234,
        status: 'available',
        maxQuantity: 10,
        minQuantity: 1,

        seller: 'ChargeMax',
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
                { id: '108-c1', name: 'Color', value: 'Black', price: 12.99, inStock: true },
                { id: '108-c2', name: 'Color', value: 'White', price: 12.99, inStock: true },
                { id: '108-c3', name: 'Color', value: 'Red', price: 12.99, inStock: true },
                { id: '108-c4', name: 'Color', value: 'Blue', price: 12.99, inStock: true },
            ],
            lengths: [
                { id: '108-l1', name: 'Length', value: '3ft', price: 9.99, inStock: true },
                { id: '108-l2', name: 'Length', value: '6ft', price: 12.99, inStock: true },
                { id: '108-l3', name: 'Length', value: '10ft', price: 16.99, inStock: true },
            ],
        },

        features: [
            'Fast charging up to 100W (20V/5A)',
            'Data transfer up to 480Mbps',
            'Durable braided nylon exterior',
            'Reinforced connector joints',
            'Universal USB-C compatibility',
            'Tangle-free design',
            'Lifetime warranty',
        ],

        specifications: {
            'Cable Type': 'USB-C to USB-C',
            'Power Delivery': 'Up to 100W (20V/5A)',
            'Data Transfer': '480Mbps (USB 2.0)',
            'Length': '6 feet',
            'Material': 'Braided nylon + aluminum connectors',
            'Compatibility': 'All USB-C devices',
            'Warranty': 'Lifetime replacement',
        },

        badge: 'Essential',
        badgeColor: '#6B7280',
        discount: '48% off',
        featured: false,

        slug: 'fast-charging-usb-c-cable-6ft',
        relatedProducts: ['4', '104', '106'],

        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-12-15'),
    },

    {
        id: '109',
        name: 'Compact Bluetooth Speaker',
        description: 'Portable wireless speaker with 360-degree sound, waterproof design, and 12-hour battery life. Perfect for outdoor adventures and home listening.',
        shortDescription: 'Waterproof Bluetooth speaker with 360° sound',
        price: 39.99,
        originalPrice: 79.99,
        salePrice: 39.99,

        images: [
            { id: '109-1', url: getProductImageBySize('3', 'small'), alt: 'Compact Bluetooth Speaker', size: 'small' },
        ],
        primaryImage: getProductImageBySize('3', 'small'),

        brand: 'AudioBlast',
        model: 'AB-360',
        sku: 'AB-SPEAKER-360',
        category: 'electronics',
        subcategory: 'speakers',
        tags: ['bluetooth speaker', 'portable', 'waterproof', '360 sound'],

        rating: 4.5,
        reviewCount: 967,
        reviews: [],

        inStock: true,
        stockCount: 156,
        status: 'available',
        maxQuantity: 4,
        minQuantity: 1,

        seller: 'AudioBlast',
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
                { id: '109-c1', name: 'Color', value: 'Black', price: 39.99, inStock: true },
                { id: '109-c2', name: 'Color', value: 'Blue', price: 39.99, inStock: true },
                { id: '109-c3', name: 'Color', value: 'Red', price: 39.99, inStock: true },
                { id: '109-c4', name: 'Color', value: 'Gray', price: 39.99, inStock: true },
            ],
        },

        features: [
            '360-degree immersive sound',
            '12-hour battery life',
            'IPX7 waterproof rating',
            'Bluetooth 5.0 connectivity',
            'Built-in microphone for hands-free calls',
            'Compact and lightweight design',
            'Quick charge: 1 hour = 4 hours playback',
        ],

        specifications: {
            'Battery Life': '12 hours',
            'Connectivity': 'Bluetooth 5.0',
            'Water Resistance': 'IPX7',
            'Driver': '52mm full-range driver',
            'Frequency Response': '65Hz-20kHz',
            'Dimensions': '3.9 × 3.9 × 2.8 inches',
            'Weight': '1.2 lbs',
        },

        badge: 'Outdoor',
        badgeColor: '#059669',
        discount: '50% off',
        featured: false,

        slug: 'compact-bluetooth-speaker',
        relatedProducts: ['6', '7', '107'],

        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-12-08'),
    },

    {
        id: '110',
        name: 'Portable Power Bank 20000mAh',
        description: 'High-capacity portable charger with dual USB ports, LED display, and fast charging technology. Keep your devices powered on the go.',
        shortDescription: 'High-capacity power bank with LED display',
        price: 29.99,
        originalPrice: 59.99,
        salePrice: 29.99,

        images: [
            { id: '110-1', url: getProductImageBySize('4', 'small'), alt: 'Portable Power Bank', size: 'small' },
        ],
        primaryImage: getProductImageBySize('4', 'small'),

        brand: 'PowerMax',
        model: 'PM-20K',
        sku: 'PM-BANK-20K',
        category: 'electronics',
        subcategory: 'accessories',
        tags: ['power bank', 'portable charger', 'high capacity', 'led display'],

        rating: 4.6,
        reviewCount: 1789,
        reviews: [],

        inStock: true,
        stockCount: 98,
        status: 'available',
        maxQuantity: 3,
        minQuantity: 1,

        seller: 'PowerMax',
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
            '20,000mAh ultra-high capacity',
            'Dual USB outputs (2.4A each)',
            'LED digital display shows exact battery level',
            'Fast charging input and output',
            'Multiple safety protections',
            'Compatible with all smartphones and tablets',
            'Compact design despite high capacity',
        ],

        specifications: {
            'Capacity': '20,000mAh / 74Wh',
            'Input': 'Micro USB & USB-C (5V/2A)',
            'Output': '2 × USB-A (5V/2.4A)',
            'Total Output': '5V/2.4A Max',
            'Display': 'LED digital percentage',
            'Dimensions': '6.3 × 2.8 × 0.9 inches',
            'Weight': '13.4 oz',
        },

        badge: 'High Capacity',
        badgeColor: '#3B82F6',
        discount: '50% off',
        featured: false,

        slug: 'portable-power-bank-20000mah',
        relatedProducts: ['4', '105', '106'],

        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-12-11'),
    },

    {
        id: '111',
        name: 'Smart Home Mini Speaker',
        description: 'Voice-controlled smart speaker with AI assistant, smart home integration, and premium sound quality in a compact design.',
        shortDescription: 'Smart speaker with voice control and AI assistant',
        price: 49.99,
        originalPrice: 99.99,
        salePrice: 49.99,

        images: [
            { id: '111-1', url: getProductImageBySize('5', 'small'), alt: 'Smart Home Mini Speaker', size: 'small' },
        ],
        primaryImage: getProductImageBySize('5', 'small'),

        brand: 'SmartHome',
        model: 'SH-Mini',
        sku: 'SH-SPEAKER-MINI',
        category: 'electronics',
        subcategory: 'smart-home',
        tags: ['smart speaker', 'voice control', 'ai assistant', 'smart home'],

        rating: 4.3,
        reviewCount: 1267,
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
                { id: '111-c1', name: 'Color', value: 'Charcoal', price: 49.99, inStock: true },
                { id: '111-c2', name: 'Color', value: 'Chalk', price: 49.99, inStock: true },
                { id: '111-c3', name: 'Color', value: 'Aqua', price: 52.99, inStock: true },
            ],
        },

        features: [
            'Built-in AI voice assistant',
            'Control smart home devices',
            'Stream music from popular services',
            'Far-field voice recognition',
            'Privacy mute button',
            'Compact design fits anywhere',
            'Multi-room audio support',
        ],

        specifications: {
            'Speaker': '40mm full-range driver',
            'Microphones': '4-microphone array',
            'Connectivity': 'Wi-Fi 802.11ac, Bluetooth 5.0',
            'Voice Control': 'Built-in AI assistant',
            'Audio Formats': 'MP3, FLAC, WAV, AAC',
            'Dimensions': '3.9 × 3.9 × 1.7 inches',
            'Weight': '12 oz',
        },

        badge: 'Smart Home',
        badgeColor: '#8B5CF6',
        discount: '50% off',
        featured: false,

        slug: 'smart-home-mini-speaker',
        relatedProducts: ['109', '6', '105'],

        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-12-09'),
    },

    {
        id: '112',
        name: 'Action Camera 4K Ultra HD',
        description: 'Compact 4K action camera with image stabilization, waterproof housing, and wide-angle lens. Perfect for adventure recording and sports.',
        shortDescription: '4K action camera with stabilization and waterproof case',
        price: 89.99,
        originalPrice: 199.99,
        salePrice: 89.99,

        images: [
            { id: '112-1', url: getProductImageBySize('6', 'small'), alt: '4K Action Camera', size: 'small' },
        ],
        primaryImage: getProductImageBySize('6', 'small'),

        brand: 'AdventureCam',
        model: 'AC-4K Pro',
        sku: 'AC-CAM-4K',
        category: 'electronics',
        subcategory: 'cameras',
        tags: ['action camera', '4k', 'waterproof', 'sports camera'],

        rating: 4.4,
        reviewCount: 892,
        reviews: [],

        inStock: true,
        stockCount: 45,
        status: 'available',
        maxQuantity: 2,
        minQuantity: 1,

        seller: 'AdventureCam',
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
            '4K Ultra HD video recording at 60fps',
            '20MP high-resolution photos',
            'Electronic image stabilization',
            'Waterproof up to 30 meters',
            '170° ultra-wide angle lens',
            '2-inch touchscreen display',
            'Wi-Fi connectivity for remote control',
            'Multiple mounting accessories included',
        ],

        specifications: {
            'Video Resolution': '4K@60fps, 2.7K@60fps, 1080p@120fps',
            'Photo Resolution': '20MP',
            'Lens': '170° ultra-wide angle',
            'Display': '2-inch touchscreen',
            'Battery': '1200mAh (up to 90 minutes recording)',
            'Storage': 'MicroSD up to 128GB',
            'Connectivity': 'Wi-Fi, micro HDMI, USB-C',
            'Dimensions': '2.3 × 1.6 × 1.2 inches',
            'Weight': '2.1 oz',
        },

        badge: 'Adventure',
        badgeColor: '#EF4444',
        discount: '55% off',
        featured: false,

        slug: 'action-camera-4k-ultra-hd',
        relatedProducts: ['3', '105', '109'],

        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-15'),
    },
];

// =====================================
// ELECTRONICS SUBCATEGORIES
// =====================================
export const ELECTRONICS_SUBCATEGORIES = [
    {
        id: 'smartphones',
        name: 'Smartphones',
        description: 'Latest smartphones and mobile devices',
        icon: 'phone-portrait-outline',
        color: '#3B82F6',
        productCount: 1,
        featured: true,
    },
    {
        id: 'headphones',
        name: 'Headphones & Audio',
        description: 'Headphones, earbuds, and audio equipment',
        icon: 'headset-outline',
        color: '#8B5CF6',
        productCount: 4,
        featured: true,
    },
    {
        id: 'computers-tablets',
        name: 'Computers & Tablets',
        description: 'Laptops, tablets, and computer accessories',
        icon: 'laptop-outline',
        color: '#10B981',
        productCount: 4,
        featured: true,
    },
    {
        id: 'tvs-audio',
        name: 'TVs & Audio',
        description: 'Smart TVs, soundbars, and home audio',
        icon: 'tv-outline',
        color: '#F59E0B',
        productCount: 1,
        featured: true,
    },
    {
        id: 'kitchen-appliances',
        name: 'Kitchen Appliances',
        description: 'Small kitchen appliances and gadgets',
        icon: 'restaurant-outline',
        color: '#EF4444',
        productCount: 1,
        featured: false,
    },
    {
        id: 'personal-care',
        name: 'Personal Care',
        description: 'Hair dryers, shavers, and personal electronics',
        icon: 'cut-outline',
        color: '#EC4899',
        productCount: 1,
        featured: false,
    },
    {
        id: 'wearables',
        name: 'Wearables',
        description: 'Smartwatches and fitness trackers',
        icon: 'watch-outline',
        color: '#06B6D4',
        productCount: 1,
        featured: true,
    },
    {
        id: 'accessories',
        name: 'Accessories',
        description: 'Cables, chargers, and device accessories',
        icon: 'extension-puzzle-outline',
        color: '#6B7280',
        productCount: 3,
        featured: false,
    },
    {
        id: 'speakers',
        name: 'Speakers',
        description: 'Bluetooth speakers and sound systems',
        icon: 'volume-high-outline',
        color: '#059669',
        productCount: 1,
        featured: false,
    },
    {
        id: 'smart-home',
        name: 'Smart Home',
        description: 'Smart speakers and home automation',
        icon: 'home-outline',
        color: '#7C3AED',
        productCount: 1,
        featured: false,
    },
    {
        id: 'cameras',
        name: 'Cameras',
        description: 'Action cameras and photography equipment',
        icon: 'camera-outline',
        color: '#DC2626',
        productCount: 1,
        featured: false,
    },
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get all electronics products
 */
export const getAllElectronicsProducts = (): Product[] => {
    return ELECTRONICS_PRODUCTS;
};

/**
 * Get electronics products by subcategory
 */
export const getElectronicsBySubcategory = (subcategory: string): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product => product.subcategory === subcategory);
};

/**
 * Get featured electronics products
 */
export const getFeaturedElectronics = (): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product => product.featured === true);
};

/**
 * Get trending electronics products
 */
export const getTrendingElectronics = (): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product => product.trending === true);
};

/**
 * Get electronics products on sale
 */
export const getElectronicsOnSale = (): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product =>
        product.originalPrice && product.price < product.originalPrice
    );
};

/**
 * Get electronics products by brand
 */
export const getElectronicsByBrand = (brand: string): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );
};

/**
 * Get electronics products by price range
 */
export const getElectronicsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );
};

/**
 * Search electronics products
 */
export const searchElectronicsProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return ELECTRONICS_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Get electronics product by ID
 */
export const getElectronicsProductById = (id: string): Product | undefined => {
    return ELECTRONICS_PRODUCTS.find(product => product.id === id);
};

/**
 * Get related electronics products
 */
export const getRelatedElectronicsProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getElectronicsProductById(productId);
    if (!product || !product.relatedProducts) return [];

    return product.relatedProducts
        .map(id => getElectronicsProductById(id))
        .filter(Boolean)
        .slice(0, limit) as Product[];
};

/**
 * Get electronics products by rating
 */
export const getTopRatedElectronics = (minRating: number = 4.5): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product => product.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Get best selling electronics
 */
export const getBestSellingElectronics = (): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product => product.bestSeller === true);
};

/**
 * Get new electronics arrivals
 */
export const getNewElectronicsArrivals = (): Product[] => {
    return ELECTRONICS_PRODUCTS.filter(product => product.newArrival === true);
};

// =====================================
// EXPORT DEFAULT
// =====================================
export default {
    products: ELECTRONICS_PRODUCTS,
    subcategories: ELECTRONICS_SUBCATEGORIES,
    getAllProducts: getAllElectronicsProducts,
    getBySubcategory: getElectronicsBySubcategory,
    getFeatured: getFeaturedElectronics,
    getTrending: getTrendingElectronics,
    getOnSale: getElectronicsOnSale,
    getByBrand: getElectronicsByBrand,
    getByPriceRange: getElectronicsByPriceRange,
    search: searchElectronicsProducts,
    getById: getElectronicsProductById,
    getRelated: getRelatedElectronicsProducts,
    getTopRated: getTopRatedElectronics,
    getBestSelling: getBestSellingElectronics,
    getNewArivals: getNewElectronicsArrivals,
};