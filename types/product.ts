// Product Status and Availability
export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'pending' | 'draft' | 'archived';

export type AvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'preorder' | 'discontinued';

export type ProductCondition = 'new' | 'refurbished' | 'open_box' | 'used' | 'damaged' | 'display_model';

// Product Types and Categories
export type ProductType =
    | 'simple'           // Basic product without variants
    | 'variable'         // Product with variants (size, color, etc.)
    | 'grouped'          // Related products sold together
    | 'bundle'           // Multiple products packaged as one
    | 'digital'          // Digital/downloadable products
    | 'subscription'     // Recurring products
    | 'gift_card'        // Gift cards and store credit
    | 'service';         // Services and appointments

// Age and Content Ratings
export type AgeRating = 'all_ages' | '3+' | '7+' | '13+' | '17+' | '18+' | '21+';

export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'M' | 'AO' | 'RP';

// Product Dimensions and Weight
export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm' | 'mm' | 'ft' | 'm';
    weight?: number;
    weightUnit?: 'oz' | 'lb' | 'g' | 'kg';
    packageDimensions?: {
        length: number;
        width: number;
        height: number;
        weight: number;
        unit: 'in' | 'cm';
        weightUnit: 'oz' | 'lb' | 'g' | 'kg';
    };
}

// Product Variants and Options
export interface ProductVariant {
    id: string;
    sku: string;
    upc?: string;
    gtin?: string;
    name: string;
    attributes: Record<string, string>; // color: "red", size: "large"

    // Pricing
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    priceModifier?: number;

    // Inventory
    inventory: ProductInventory;

    // Media
    image?: string;
    images?: string[];

    // Physical Properties
    weight?: number;
    dimensions?: Omit<ProductDimensions, 'packageDimensions'>;

    // Availability
    available: boolean;
    availableFrom?: string;
    availableUntil?: string;

    // SEO
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;

    // Status
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;
}

// Product Attributes and Options
export interface ProductAttribute {
    id: string;
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'image';
    displayName: string;
    description?: string;
    required: boolean;
    searchable: boolean;
    filterable: boolean;
    sortOrder: number;

    // Options for select/multiselect
    options?: Array<{
        id: string;
        value: string;
        label: string;
        color?: string;
        image?: string;
        sortOrder: number;
    }>;

    // Validation
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        allowedValues?: string[];
    };
}

// Product Specifications
export interface ProductSpecification {
    id: string;
    name: string;
    value: string;
    displayName: string;
    category: 'general' | 'technical' | 'physical' | 'performance' | 'warranty' | 'environmental';
    unit?: string;
    sortOrder: number;
    searchable: boolean;
    comparable: boolean;
}

// Product Media
export interface ProductMedia {
    id: string;
    type: 'image' | 'video' | '360' | 'ar_model' | 'pdf' | 'audio';
    url: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;

    // Image specific
    width?: number;
    height?: number;
    format?: string;

    // Video specific
    duration?: number;
    autoplay?: boolean;
    controls?: boolean;

    // AR/3D specific
    modelFormat?: 'gltf' | 'usdz' | 'fbx';

    // File metadata
    fileSize?: number;
    mimeType?: string;
    tags?: string[];
}

// Product Pricing
export interface ProductPricing {
    // Base pricing
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    msrp?: number;
    currency: string;

    // Dynamic pricing
    priceRange?: {
        min: number;
        max: number;
    };

    // Discounts
    discountPercentage?: number;
    discountAmount?: number;
    salePrice?: number;
    saleStart?: string;
    saleEnd?: string;

    // Bulk pricing
    tierPricing?: Array<{
        minQuantity: number;
        maxQuantity?: number;
        price: number;
        discountPercentage?: number;
    }>;

    // Member pricing
    memberPrice?: number;
    memberDiscount?: number;

    // Regional pricing
    regionalPricing?: Array<{
        region: string;
        price: number;
        currency: string;
    }>;

    // Price history
    priceHistory?: Array<{
        price: number;
        effectiveDate: string;
        reason?: string;
    }>;

    // Tax information
    taxable: boolean;
    taxCategory?: string;
    taxRate?: number;
}

// Product Inventory
export interface ProductInventory {
    // Stock levels
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    backorderQuantity?: number;

    // Stock management
    trackQuantity: boolean;
    allowBackorder: boolean;
    lowStockThreshold: number;
    outOfStockThreshold: number;

    // Location-based inventory
    locations?: Array<{
        locationId: string;
        locationName: string;
        quantity: number;
        reservedQuantity: number;
        lastUpdated: string;
    }>;

    // Restock information
    restockDate?: string;
    restockQuantity?: number;
    leadTime?: number; // days

    // Inventory tracking
    lastStockUpdate: string;
    stockStatus: AvailabilityStatus;
    stockMessage?: string;

    // Fulfillment
    availableForPickup: boolean;
    availableForDelivery: boolean;
    availableForShipping: boolean;
}

// Product Reviews and Ratings
export interface ProductReview {
    id: string;
    productId: string;
    variantId?: string;

    // User information
    userId: string;
    userName: string;
    userAvatar?: string;
    isVerifiedPurchaser: boolean;

    // Review content
    rating: number;
    title: string;
    content: string;
    pros?: string[];
    cons?: string[];

    // Media
    photos?: string[];
    videos?: string[];

    // Metadata
    helpfulCount: number;
    reportCount: number;
    isRecommended: boolean;
    purchaseDate?: string;
    reviewDate: string;

    // Moderation
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    moderatedBy?: string;
    moderatedAt?: string;

    // Responses
    response?: {
        content: string;
        respondedBy: string;
        respondedAt: string;
        isVendor: boolean;
    };

    // Analytics
    viewCount?: number;
    clickCount?: number;
}

export interface ProductRating {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };

    // Calculated metrics
    recommendationPercentage: number;
    verifiedPurchasePercentage: number;

    // Review insights
    commonPros: string[];
    commonCons: string[];
    frequentlyMentioned: string[];

    // Trend data
    ratingTrend?: Array<{
        period: string;
        averageRating: number;
        reviewCount: number;
    }>;
}

// Product Categories and Taxonomy
export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    level: number;
    path: string; // "Electronics > Computers > Laptops"

    // Display
    image?: string;
    icon?: string;
    color?: string;
    sortOrder: number;

    // SEO
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];

    // Properties
    isActive: boolean;
    isVisible: boolean;
    productCount: number;

    // Attributes
    availableAttributes: string[];
    requiredAttributes: string[];

    // Children
    subcategories?: ProductCategory[];

    // Metadata
    createdAt: string;
    updatedAt: string;
}

// Product Brand Information
export interface ProductBrand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;

    // Contact
    contactEmail?: string;
    supportPhone?: string;

    // Social
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
    };

    // SEO
    metaTitle?: string;
    metaDescription?: string;

    // Status
    isActive: boolean;
    isFeatured: boolean;
    productCount: number;

    // Metrics
    averageRating?: number;
    popularityScore?: number;

    // Metadata
    createdAt: string;
    updatedAt: string;
}

// Product Nutrition (for food items)
export interface ProductNutrition {
    servingSize: string;
    servingsPerContainer?: number;

    // Macronutrients
    calories: number;
    totalFat: number;
    saturatedFat?: number;
    transFat?: number;
    cholesterol?: number;
    sodium: number;
    totalCarbohydrates: number;
    dietaryFiber?: number;
    totalSugars?: number;
    addedSugars?: number;
    protein: number;

    // Vitamins and minerals
    vitamins?: Array<{
        name: string;
        amount: string;
        dailyValue?: string;
    }>;

    // Additional nutrients
    additionalNutrients?: Array<{
        name: string;
        amount: string;
        unit: string;
        dailyValue?: string;
    }>;

    // Allergens and dietary info
    allergens: string[];
    dietaryInfo: string[]; // vegetarian, vegan, gluten-free, etc.
    ingredients: string[];

    // Certifications
    certifications?: string[]; // organic, non-gmo, fair-trade, etc.

    // Storage and handling
    storageInstructions?: string;
    handlingInstructions?: string;
    shelfLife?: string;

    // Regulatory
    nutritionFactsImage?: string;
    regulatoryInfo?: Record<string, string>;
}

// Product Warranty and Support
export interface ProductWarranty {
    type: 'manufacturer' | 'extended' | 'store' | 'third_party';
    duration: number;
    unit: 'days' | 'months' | 'years';
    description: string;
    coverage: string[];
    exclusions?: string[];

    // Terms
    termsUrl?: string;
    registrationRequired: boolean;
    transferable: boolean;

    // Support
    supportContact?: {
        phone: string;
        email: string;
        website: string;
        hours: string;
    };

    // Claims
    claimProcess?: string;
    claimUrl?: string;

    // Cost
    cost?: number;
    currency?: string;
}

// Product Shipping Information
export interface ProductShipping {
    // Shipping classes
    shippingClass: 'standard' | 'oversized' | 'heavy' | 'fragile' | 'hazmat' | 'refrigerated';

    // Restrictions
    restrictions: {
        countries?: string[];
        states?: string[];
        zipCodes?: string[];
        shippingMethods?: string[];
    };

    // Handling
    specialHandling: {
        fragile: boolean;
        refrigerated: boolean;
        freezable: boolean;
        hazmat: boolean;
        oversized: boolean;
        signature: boolean;
        adultSignature: boolean;
    };

    // Dimensions and weight
    packagedDimensions: ProductDimensions;
    shippingWeight: number;

    // Fulfillment
    fulfillmentMethods: ('pickup' | 'delivery' | 'shipping')[];
    processingTime: number; // days

    // Costs
    shippingCost?: number;
    freeShippingThreshold?: number;
    freeShippingEligible: boolean;

    // International
    hsCode?: string;
    countryOfOrigin?: string;
    customsValue?: number;
    customsDescription?: string;
}

// Product SEO and Marketing
export interface ProductSEO {
    // Basic SEO
    slug: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    canonicalUrl?: string;

    // Open Graph
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;

    // Twitter Card
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;

    // Schema.org
    structuredData?: Record<string, any>;

    // Search optimization
    searchKeywords: string[];
    searchBoost?: number;
    excludeFromSearch: boolean;

    // URL structure
    urlPattern?: string;
    redirects?: Array<{
        from: string;
        to: string;
        type: 301 | 302;
    }>;
}

// Product Analytics and Insights
export interface ProductAnalytics {
    // Performance metrics
    views: number;
    uniqueViews: number;
    addToCartRate: number;
    conversionRate: number;
    wishlistAdds: number;
    shareCount: number;

    // Sales metrics
    unitsSold: number;
    revenue: number;
    averageOrderValue: number;
    returnRate: number;

    // Search metrics
    searchImpressions: number;
    searchClicks: number;
    searchCTR: number;
    searchRanking?: Record<string, number>;

    // Time-based data
    period: string;
    trendsData?: Array<{
        date: string;
        views: number;
        sales: number;
        revenue: number;
    }>;

    // Comparative data
    categoryAverage?: {
        conversionRate: number;
        addToCartRate: number;
        returnRate: number;
    };

    // Customer insights
    customerSegments?: Array<{
        segment: string;
        percentage: number;
        averageOrderValue: number;
    }>;
}

// Main Product Interface
export interface Product {
    // Basic Information
    id: string;
    sku: string;
    upc?: string;
    gtin?: string;
    mpn?: string; // Manufacturer Part Number
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;

    // Classification
    type: ProductType;
    status: ProductStatus;
    condition: ProductCondition;

    // Brand and Category
    brandId?: string;
    brand?: ProductBrand;
    categoryId: string;
    category?: ProductCategory;
    additionalCategories?: string[];

    // Pricing and Inventory
    pricing: ProductPricing;
    inventory: ProductInventory;

    // Physical Properties
    dimensions?: ProductDimensions;
    weight?: number;
    weightUnit?: 'oz' | 'lb' | 'g' | 'kg';

    // Media
    featuredImage: string;
    images: string[];
    media: ProductMedia[];

    // Variants and Options
    hasVariants: boolean;
    variants: ProductVariant[];
    attributes: Record<string, string>;
    options?: ProductAttribute[];

    // Product Details
    specifications: ProductSpecification[];
    features: string[];
    benefits?: string[];
    includedItems?: string[];
    requiredItems?: string[];
    compatibleWith?: string[];

    // Reviews and Ratings
    rating: ProductRating;
    reviews?: ProductReview[];

    // Nutrition (for food items)
    nutrition?: ProductNutrition;

    // Warranty and Support
    warranty?: ProductWarranty;

    // Shipping
    shipping: ProductShipping;

    // Age and Content Restrictions
    ageRestriction?: {
        minimumAge: number;
        ageRating?: AgeRating;
        contentRating?: ContentRating;
        requiresVerification: boolean;
    };

    // Prescription requirements (for pharmacy items)
    prescription?: {
        required: boolean;
        type: 'rx' | 'otc' | 'supplement';
        controlledSubstance: boolean;
        genericAvailable: boolean;
        brandName?: string;
        activeIngredients?: string[];
        dosageForm?: string;
        strength?: string;
    };

    // Subscription options
    subscription?: {
        available: boolean;
        frequencies: string[];
        discount?: number;
        minFrequency?: string;
        maxFrequency?: string;
    };

    // Related products
    relatedProducts?: string[];
    crossSellProducts?: string[];
    upSellProducts?: string[];
    accessories?: string[];
    bundles?: string[];

    // SEO and Marketing
    seo: ProductSEO;
    tags: string[];
    marketingBadges?: string[];

    // Analytics
    analytics?: ProductAnalytics;

    // Compliance and Certifications
    certifications?: string[];
    regulatoryInfo?: Record<string, string>;
    safetyWarnings?: string[];

    // Vendor/Marketplace
    vendorId?: string;
    vendorName?: string;
    isMarketplaceItem: boolean;
    dropShipping: boolean;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    lastModifiedBy?: string;

    // Custom fields
    customFields?: Record<string, any>;
    metadata?: Record<string, any>;
}

// Product Search and Filtering
export interface ProductSearchFilters {
    // Basic filters
    query?: string;
    categoryId?: string;
    brandId?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;

    // Availability
    inStock?: boolean;
    availability?: AvailabilityStatus[];
    condition?: ProductCondition[];

    // Product attributes
    attributes?: Record<string, string | string[]>;

    // Shipping and fulfillment
    freeShipping?: boolean;
    fulfillmentMethods?: string[];

    // Product features
    hasReviews?: boolean;
    hasImages?: boolean;
    hasVideo?: boolean;
    onSale?: boolean;

    // Special categories
    newArrivals?: boolean;
    trending?: boolean;
    topRated?: boolean;

    // Age restrictions
    ageAppropriate?: number;

    // Custom filters
    customFilters?: Record<string, any>;
}

export interface ProductSearchSort {
    field: 'relevance' | 'price' | 'rating' | 'reviews' | 'newest' | 'popularity' | 'name' | 'brand';
    direction: 'asc' | 'desc';
}

export interface ProductSearchResult {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;

    // Search metadata
    query?: string;
    searchTime: number;
    appliedFilters: ProductSearchFilters;

    // Aggregations
    facets: {
        categories: Array<{ id: string; name: string; count: number }>;
        brands: Array<{ id: string; name: string; count: number }>;
        priceRanges: Array<{ min: number; max: number; count: number }>;
        ratings: Array<{ rating: number; count: number }>;
        attributes: Record<string, Array<{ value: string; count: number }>>;
    };

    // Suggestions
    suggestions?: string[];
    didYouMean?: string;

    // Related searches
    relatedSearches?: string[];
}

// Product Creation and Updates
export interface CreateProductRequest {
    name: string;
    description: string;
    categoryId: string;
    brandId?: string;
    type: ProductType;

    // Basic details
    sku?: string;
    pricing: Omit<ProductPricing, 'priceHistory'>;
    inventory: Omit<ProductInventory, 'lastStockUpdate' | 'stockStatus'>;

    // Media
    featuredImage: string;
    images?: string[];

    // Optional details
    specifications?: Omit<ProductSpecification, 'id'>[];
    features?: string[];
    shipping?: Partial<ProductShipping>;
    seo?: Partial<ProductSEO>;

    // Status
    status?: ProductStatus;
    publishedAt?: string;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    shortDescription?: string;
    categoryId?: string;
    brandId?: string;

    // Pricing updates
    pricing?: Partial<ProductPricing>;
    inventory?: Partial<ProductInventory>;

    // Media updates
    featuredImage?: string;
    images?: string[];
    mediaUpdates?: Array<{
        action: 'add' | 'remove' | 'update';
        media: Partial<ProductMedia>;
    }>;

    // Detail updates
    specifications?: ProductSpecification[];
    features?: string[];
    tags?: string[];

    // Status changes
    status?: ProductStatus;

    // Metadata
    lastModifiedBy?: string;
}

// Type Guards and Utilities
export const isVariableProduct = (product: Product): boolean => {
    return product.type === 'variable' && product.variants.length > 0;
};

export const isInStock = (product: Product): boolean => {
    return product.inventory.stockStatus === 'in_stock' && product.inventory.availableQuantity > 0;
};

export const isOnSale = (product: Product): boolean => {
    return !!(product.pricing.salePrice && product.pricing.salePrice < product.pricing.price);
};

export const getDiscountPercentage = (product: Product): number => {
    if (!product.pricing.salePrice) return 0;
    return Math.round(((product.pricing.price - product.pricing.salePrice) / product.pricing.price) * 100);
};

export const getEffectivePrice = (product: Product, variantId?: string): number => {
    if (variantId && product.variants.length > 0) {
        const variant = product.variants.find(v => v.id === variantId);
        if (variant) {
            return variant.price;
        }
    }
    return product.pricing.salePrice || product.pricing.price;
};

export const canPurchase = (product: Product): boolean => {
    return product.status === 'active' &&
        (product.inventory.availableQuantity > 0 || product.inventory.allowBackorder);
};

export const requiresAgeVerification = (product: Product): boolean => {
    return !!(product.ageRestriction && product.ageRestriction.requiresVerification);
};

// Default configurations
export const DEFAULT_PRODUCT_SHIPPING: ProductShipping = {
    shippingClass: 'standard',
    restrictions: {},
    specialHandling: {
        fragile: false,
        refrigerated: false,
        freezable: false,
        hazmat: false,
        oversized: false,
        signature: false,
        adultSignature: false,
    },
    packagedDimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'in',
    },
    shippingWeight: 0,
    fulfillmentMethods: ['pickup', 'delivery', 'shipping'],
    processingTime: 1,
    freeShippingEligible: true,
};

export const DEFAULT_PRODUCT_INVENTORY: ProductInventory = {
    quantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    trackQuantity: true,
    allowBackorder: false,
    lowStockThreshold: 10,
    outOfStockThreshold: 0,
    lastStockUpdate: new Date().toISOString(),
    stockStatus: 'out_of_stock',
    availableForPickup: true,
    availableForDelivery: true,
    availableForShipping: true,
};