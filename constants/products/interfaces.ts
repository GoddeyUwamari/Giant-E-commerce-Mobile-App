// constants/products/interfaces.ts
// All product-related TypeScript interfaces

interface ProductVariant {
    id: string;
    name: string;
    value: string;
    price?: number;
    inStock: boolean;
    image?: string;
}

interface ProductImage {
    id: string;
    url: any; // React Native image require
    alt: string;
    size?: 'small' | 'medium' | 'large';
}

interface ProductReview {
    id: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    date: Date;
    helpful: number;
    verified: boolean;
}

interface ProductShipping {
    free: boolean;
    cost?: number;
    estimatedDays: string;
    methods: string[];
}

interface ProductFeatures {
    key: string;
    value: string;
    icon?: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;

    // Images - using your local image system
    images: ProductImage[];
    primaryImage: any; // Main product image
    thumbnailImage?: any; // Thumbnail version

    // Product Info
    brand: string;
    model?: string;
    sku: string;
    upc?: string;
    category: string;
    subcategory?: string;
    tags: string[];

    // Ratings & Reviews
    rating: number;
    reviewCount: number;
    reviews: ProductReview[];

    // Stock & Availability
    inStock: boolean;
    stockCount?: number;
    status: 'available' | 'out_of_stock' | 'limited_stock' | 'discontinued';
    maxQuantity: number;
    minQuantity: number;

    // Store Info
    seller: string;
    storeId: string;
    storeName: string;

    // Shipping & Delivery
    shipping: ProductShipping;
    delivery: {
        option: 'pickup' | 'delivery' | 'shipping';
        estimatedDate?: string;
        fee?: number;
        freeShippingEligible: boolean;
    };

    // Product Variants (colors, sizes, etc.)
    variants?: {
        colors?: ProductVariant[];
        sizes?: ProductVariant[];
        storage?: ProductVariant[];
        [key: string]: ProductVariant[] | undefined;
    };

    // Features & Specifications
    features: string[];
    specifications: { [key: string]: string };

    // Marketing
    badge?: string;
    badgeColor?: string;
    discount?: string;
    featured?: boolean;
    trending?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;

    // SEO & Navigation
    slug: string;
    relatedProducts?: string[];

    // Dates
    createdAt: Date;
    updatedAt: Date;
}

// ================================
// EXPORT ALL INTERFACES
// ================================
export type {
    Product,
    ProductVariant,
    ProductImage,
    ProductReview,
    ProductShipping,
    ProductFeatures
};