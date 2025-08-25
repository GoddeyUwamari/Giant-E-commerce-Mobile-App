// assets/images/imageLoader.ts
// Enhanced lazy loading system for images with SMART FALLBACK SYSTEM
// Handles missing images gracefully with intelligent mapping

export type ImageCategory = 'products' | 'banners' | 'thumbnails' | 'medium' | 'small';
export type ImageSize = 'small' | 'medium' | 'large';

// ================================
// PRODUCT IMAGES (16 large products)
// ================================
const PRODUCT_IMAGES = {
    'prod_01': require('./products/prod_01.jpg'),
    'prod_02': require('./products/prod_02.jpg'),
    'prod_03': require('./products/prod_03.jpg'),
    'prod_04': require('./products/prod_04.jpg'),
    // 'prod_05': require('./products/prod_05.jpg'),
    'prod_06': require('./products/prod_06.jpg'),
    'prod_07': require('./products/prod_07.jpg'),
    'prod_08': require('./products/prod_08.jpg'),
    'prod_09': require('./products/prod_09.jpg'),
    'prod_10': require('./products/prod_10.jpg'),
    'prod_11': require('./products/prod_11.jpg'),
    'prod_12': require('./products/prod_12.jpg'),
    'prod_13': require('./products/prod_13.jpg'),
    'prod_14': require('./products/prod_14.jpg'),
    'prod_15': require('./products/prod_15.jpg'),
    'prod_16': require('./products/prod_16.jpg'),
} as const;

// ================================
// MEDIUM IMAGES (18 images)
// ================================
const MEDIUM_IMAGES = {
    'med_01': require('./products/med_01.jpg'),
    'med_02': require('./products/med_02.jpg'),
    'med_03': require('./products/med_03.jpg'),
    'med_04': require('./products/med_04.jpg'),
    'med_05': require('./products/med_05.jpg'),
    'med_06': require('./products/med_06.jpg'),
    'med_07': require('./products/med_07.jpg'),
    'med_08': require('./products/med_08.jpg'),
    'med_09': require('./products/med_09.jpg'),
    'med_10': require('./products/med_10.jpg'),
    'med_11': require('./products/med_11.jpg'),
    'med_12': require('./products/med_12.jpg'),
    'med_13': require('./products/med_13.jpg'),
    'med_14': require('./products/med_14.jpg'),
    'med_15': require('./products/med_15.jpg'),
    'med_16': require('./products/med_16.jpg'),
    'med_17': require('./products/med_17.jpg'),
    'med_18': require('./products/med_18.jpg'),
} as const;

// ================================
// SMALL IMAGES (26 images)
// ================================
const SMALL_IMAGES = {
    'small_01': require('./products/small_01.jpg'),
    'small_02': require('./products/small_02.jpg'),
    'small_03': require('./products/small_03.jpg'),
    'small_04': require('./products/small_04.jpg'),
    'small_05': require('./products/small_05.jpg'),
    'small_06': require('./products/small_06.jpg'),
    'small_07': require('./products/small_07.jpg'),
    'small_08': require('./products/small_08.jpg'),
    'small_09': require('./products/small_09.jpg'),
    'small_10': require('./products/small_10.jpg'),
    'small_11': require('./products/small_11.jpg'),
    'small_12': require('./products/small_12.jpg'),
    'small_13': require('./products/small_13.jpg'),
    'small_14': require('./products/small_14.jpg'),
    'small_15': require('./products/small_15.jpg'),
    'small_16': require('./products/small_16.jpg'),
    'small_17': require('./products/small_17.jpg'),
    'small_18': require('./products/small_18.jpg'),
    'small_19': require('./products/small_19.jpg'),
    'small_20': require('./products/small_20.jpg'),
    'small_21': require('./products/small_21.jpg'),
    'small_22': require('./products/small_22.jpg'),
    'small_23': require('./products/small_23.jpg'),
    'small_24': require('./products/small_24.jpg'),
    'small_25': require('./products/small_25.jpg'),
    'small_26': require('./products/small_26.jpg'),
    // ADD THESE TO SMALL_IMAGES in imageLoader.ts:
    // 'small_27': require('./products/small_27.jpg'),
    // 'small_28': require('./products/small_28.jpg'),
    // 'small_29': require('./products/small_29.jpg'),
    // 'small_30': require('./products/small_30.jpg'),
    // 'small_31': require('./products/small_31.jpg'),
} as const;

// ================================
// BANNER IMAGES (42 images)
// ================================
const BANNER_IMAGES = {
    'banner_01': require('./banners/banner_01.jpg'),
    'banner_02': require('./banners/banner_02.jpg'),
    'banner_03': require('./banners/banner_03.jpg'),
    'banner_04': require('./banners/banner_04.jpg'),
    'banner_05': require('./banners/banner_05.jpg'),
    'banner_06': require('./banners/banner_06.jpg'),
    'banner_07': require('./banners/banner_07.jpg'),
    'banner_08': require('./banners/banner_08.jpg'),
    'banner_09': require('./banners/banner_09.jpg'),
    'banner_10': require('./banners/banner_10.jpg'),
    'banner_11': require('./banners/banner_11.jpg'),
    'banner_12': require('./banners/banner_12.jpg'),
    'banner_13': require('./banners/banner_13.jpg'),
    'banner_14': require('./banners/banner_14.jpg'),
    'banner_15': require('./banners/banner_15.jpg'),
    'banner_16': require('./banners/banner_16.jpg'),
    'banner_17': require('./banners/banner_17.jpg'),
    'banner_18': require('./banners/banner_18.jpg'),
    'banner_19': require('./banners/banner_19.jpg'),
    'banner_20': require('./banners/banner_20.jpg'),
    'banner_21': require('./banners/banner_21.jpg'),
    'banner_22': require('./banners/banner_22.jpg'),
    'banner_23': require('./banners/banner_23.jpg'),
    'banner_24': require('./banners/banner_24.jpg'),
    'banner_25': require('./banners/banner_25.jpg'),
    'banner_26': require('./banners/banner_26.jpg'),
    'banner_27': require('./banners/banner_27.jpg'),
    'banner_28': require('./banners/banner_28.jpg'),
    'banner_29': require('./banners/banner_29.jpg'),
    'banner_30': require('./banners/banner_30.jpg'),
    'banner_31': require('./banners/banner_31.jpg'),
    'banner_32': require('./banners/banner_32.jpg'),
    'banner_33': require('./banners/banner_33.jpg'),
    'banner_34': require('./banners/banner_34.jpg'),
    'banner_35': require('./banners/banner_35.jpg'),
    'banner_36': require('./banners/banner_36.jpg'),
    'banner_37': require('./banners/banner_37.jpg'),
    'banner_38': require('./banners/banner_38.jpg'),
    'banner_39': require('./banners/banner_39.jpg'),
    'banner_40': require('./banners/banner_40.jpg'),
    'banner_41': require('./banners/banner_41.jpg'),
    'banner_42': require('./banners/banner_42.jpg'),
} as const;

// ================================
// THUMBNAIL IMAGES (27 images)
// ================================
const THUMBNAIL_IMAGES = {
    // 'thumb_01': require('./thumbnails/thumb_01.jpg'),
    'thumb_02': require('./thumbnails/thumb_02.jpg'),
    'thumb_03': require('./thumbnails/thumb_03.jpg'),
    'thumb_04': require('./thumbnails/thumb_04.jpg'),
    // 'thumb_05': require('./thumbnails/thumb_05.jpg'),
    'thumb_06': require('./thumbnails/thumb_06.jpg'),
    'thumb_07': require('./thumbnails/thumb_07.jpg'),
    'thumb_08': require('./thumbnails/thumb_08.jpg'),
    'thumb_09': require('./thumbnails/thumb_09.jpg'),
    'thumb_10': require('./thumbnails/thumb_10.jpg'),
    'thumb_11': require('./thumbnails/thumb_11.jpg'),
    'thumb_12': require('./thumbnails/thumb_12.jpg'),
    'thumb_13': require('./thumbnails/thumb_13.jpg'),
    'thumb_14': require('./thumbnails/thumb_14.jpg'),
    'thumb_15': require('./thumbnails/thumb_15.jpg'),
    'thumb_16': require('./thumbnails/thumb_16.jpg'),
    'thumb_17': require('./thumbnails/thumb_17.jpg'),
    'thumb_18': require('./thumbnails/thumb_18.jpg'),
    'thumb_19': require('./thumbnails/thumb_19.jpg'),
    'thumb_20': require('./thumbnails/thumb_20.jpg'),
    'thumb_21': require('./thumbnails/thumb_21.jpg'),
    'thumb_22': require('./thumbnails/thumb_22.jpg'),
    'thumb_23': require('./thumbnails/thumb_23.jpg'),
    'thumb_24': require('./thumbnails/thumb_24.jpg'),
    'thumb_25': require('./thumbnails/thumb_25.jpg'),
    'thumb_26': require('./thumbnails/thumb_26.jpg'),
    'thumb_27': require('./thumbnails/thumb_27.jpg'),
} as const;

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================

// Available image keys for smart mapping
const AVAILABLE_PRODUCT_KEYS = Object.keys(PRODUCT_IMAGES).filter(key => key !== 'prod_05');
const AVAILABLE_MEDIUM_KEYS = Object.keys(MEDIUM_IMAGES);
const AVAILABLE_SMALL_KEYS = Object.keys(SMALL_IMAGES);
const AVAILABLE_THUMBNAIL_KEYS = Object.keys(THUMBNAIL_IMAGES).filter(key => !['thumb_01', 'thumb_05'].includes(key));

// Image mapping cache to ensure consistency
const imageMapping = new Map<string, string>();

// 🚀 NEW: Results cache to prevent repeated calculations
const resultsCache = new Map<string, any>();

// 🚀 NEW: Logged warnings tracker to prevent spam
const loggedWarnings = new Set<string>();

/**
 * Smart image ID mapper - maps any image ID to an available image
 * Uses consistent mapping so the same ID always returns the same image
 */
const mapImageId = (imageId: string | number, availableKeys: string[], prefix: string): string => {
    const id = String(imageId);
    const cacheKey = `${prefix}_${id}`;

    // Return cached mapping if exists
    if (imageMapping.has(cacheKey)) {
        return imageMapping.get(cacheKey)!;
    }

    // Convert ID to number for mapping
    const numericId = parseInt(id.replace(/\D/g, '')) || 1;

    // Smart mapping: use modulo to cycle through available images
    const mappedIndex = (numericId - 1) % availableKeys.length;
    const mappedKey = availableKeys[mappedIndex];

    // Cache the mapping
    imageMapping.set(cacheKey, mappedKey);

    // 🚀 OPTIMIZED: Only log once per unique mapping in dev mode
    if (__DEV__ && !loggedWarnings.has(cacheKey)) {
        console.log(`📸 Image mapping: ${id} → ${mappedKey} (${prefix})`);
        loggedWarnings.add(cacheKey);
    }

    return mappedKey;
};

/**
 * 🚀 OPTIMIZED: Debug logging for missing images - only logs once per unique case
 */
const logMissingImage = (originalId: string | number, mappedKey: string, category: string) => {
    const logKey = `missing_${originalId}_${category}_${mappedKey}`;

    if (__DEV__ && !loggedWarnings.has(logKey)) {
        console.warn(`⚠️  Missing image: ${originalId} in ${category}, using fallback: ${mappedKey}`);
        loggedWarnings.add(logKey);
    }
};

// ================================
// TYPE DEFINITIONS
// ================================
export type ProductImageKey = keyof typeof PRODUCT_IMAGES;
export type MediumImageKey = keyof typeof MEDIUM_IMAGES;
export type SmallImageKey = keyof typeof SMALL_IMAGES;
export type BannerImageKey = keyof typeof BANNER_IMAGES;
export type ThumbnailImageKey = keyof typeof THUMBNAIL_IMAGES;

// ================================
// ENHANCED SMART IMAGE GETTER FUNCTIONS WITH CACHING
// ================================

/**
 * 🚀 OPTIMIZED: Get a product image by name with smart fallback and caching
 */
export const getProductImage = (imageName: string | number): any => {
    const cacheKey = `prod_${imageName}`;

    // Check cache first
    if (resultsCache.has(cacheKey)) {
        return resultsCache.get(cacheKey);
    }

    const id = String(imageName);

    // Handle direct key access
    if (typeof imageName === 'string' && imageName.startsWith('prod_')) {
        const directImage = PRODUCT_IMAGES[imageName as ProductImageKey];
        if (directImage) {
            resultsCache.set(cacheKey, directImage);
            return directImage;
        }
    }

    // Smart mapping for numeric IDs or missing images
    const numericId = parseInt(id.replace(/\D/g, '')) || 1;
    const paddedId = String(numericId).padStart(2, '0');
    const targetKey = `prod_${paddedId}`;

    // Try direct access first
    const directImage = PRODUCT_IMAGES[targetKey as ProductImageKey];
    if (directImage) {
        resultsCache.set(cacheKey, directImage);
        return directImage;
    }

    // Use smart mapping
    const mappedKey = mapImageId(numericId, AVAILABLE_PRODUCT_KEYS, 'product');
    logMissingImage(imageName, mappedKey, 'products');
    const result = PRODUCT_IMAGES[mappedKey as ProductImageKey];

    // Cache result
    resultsCache.set(cacheKey, result);
    return result;
};

/**
 * 🚀 OPTIMIZED: Get a medium-sized product image with smart fallback and caching
 */
export const getMediumImage = (imageName: string | number): any => {
    const cacheKey = `med_${imageName}`;

    // Check cache first
    if (resultsCache.has(cacheKey)) {
        return resultsCache.get(cacheKey);
    }

    const id = String(imageName);

    // Handle direct key access
    if (typeof imageName === 'string' && imageName.startsWith('med_')) {
        const directImage = MEDIUM_IMAGES[imageName as MediumImageKey];
        if (directImage) {
            resultsCache.set(cacheKey, directImage);
            return directImage;
        }
    }

    // Smart mapping for numeric IDs
    const numericId = parseInt(id.replace(/\D/g, '')) || 1;
    const paddedId = String(numericId).padStart(2, '0');
    const targetKey = `med_${paddedId}`;

    // Try direct access first
    const directImage = MEDIUM_IMAGES[targetKey as MediumImageKey];
    if (directImage) {
        resultsCache.set(cacheKey, directImage);
        return directImage;
    }

    // Use smart mapping
    const mappedKey = mapImageId(numericId, AVAILABLE_MEDIUM_KEYS, 'medium');
    logMissingImage(imageName, mappedKey, 'medium');
    const result = MEDIUM_IMAGES[mappedKey as MediumImageKey];

    // Cache result
    resultsCache.set(cacheKey, result);
    return result;
};

/**
 * 🚀 OPTIMIZED: Get a small product image with smart fallback and caching
 */
export const getSmallImage = (imageName: string | number): any => {
    const cacheKey = `small_${imageName}`;

    // Check cache first
    if (resultsCache.has(cacheKey)) {
        return resultsCache.get(cacheKey);
    }

    const id = String(imageName);

    // Handle direct key access
    if (typeof imageName === 'string' && imageName.startsWith('small_')) {
        const directImage = SMALL_IMAGES[imageName as SmallImageKey];
        if (directImage) {
            resultsCache.set(cacheKey, directImage);
            return directImage;
        }
    }

    // Smart mapping for numeric IDs
    const numericId = parseInt(id.replace(/\D/g, '')) || 1;
    const paddedId = String(numericId).padStart(2, '0');
    const targetKey = `small_${paddedId}`;

    // Try direct access first
    const directImage = SMALL_IMAGES[targetKey as SmallImageKey];
    if (directImage) {
        resultsCache.set(cacheKey, directImage);
        return directImage;
    }

    // Use smart mapping
    const mappedKey = mapImageId(numericId, AVAILABLE_SMALL_KEYS, 'small');
    logMissingImage(imageName, mappedKey, 'small');
    const result = SMALL_IMAGES[mappedKey as SmallImageKey];

    // Cache result
    resultsCache.set(cacheKey, result);
    return result;
};

/**
 * Get a banner image with smart fallback
 */
export const getBannerImage = (imageName: string | number): any => {
    const cacheKey = `banner_${imageName}`;

    if (resultsCache.has(cacheKey)) {
        return resultsCache.get(cacheKey);
    }

    const id = String(imageName);

    // Handle direct key access
    if (typeof imageName === 'string' && imageName.startsWith('banner_')) {
        const directImage = BANNER_IMAGES[imageName as BannerImageKey];
        if (directImage) {
            resultsCache.set(cacheKey, directImage);
            return directImage;
        }
    }

    // Smart mapping for numeric IDs
    const numericId = parseInt(id.replace(/\D/g, '')) || 1;
    const paddedId = String(numericId).padStart(2, '0');
    const targetKey = `banner_${paddedId}`;

    // Try direct access first
    const directImage = BANNER_IMAGES[targetKey as BannerImageKey];
    if (directImage) {
        resultsCache.set(cacheKey, directImage);
        return directImage;
    }

    // Use smart mapping - banners have 42 images
    const availableKeys = Object.keys(BANNER_IMAGES);
    const mappedKey = mapImageId(numericId, availableKeys, 'banner');
    logMissingImage(imageName, mappedKey, 'banners');
    const result = BANNER_IMAGES[mappedKey as BannerImageKey];

    resultsCache.set(cacheKey, result);
    return result;
};

/**
 * Get a thumbnail image with smart fallback
 */
export const getThumbnailImage = (imageName: string | number): any => {
    const cacheKey = `thumb_${imageName}`;

    if (resultsCache.has(cacheKey)) {
        return resultsCache.get(cacheKey);
    }

    const id = String(imageName);

    // Handle direct key access
    if (typeof imageName === 'string' && imageName.startsWith('thumb_')) {
        const directImage = THUMBNAIL_IMAGES[imageName as ThumbnailImageKey];
        if (directImage) {
            resultsCache.set(cacheKey, directImage);
            return directImage;
        }
    }

    // Smart mapping for numeric IDs
    const numericId = parseInt(id.replace(/\D/g, '')) || 2; // Default to 2 since thumb_01 is missing
    const paddedId = String(numericId).padStart(2, '0');
    const targetKey = `thumb_${paddedId}`;

    // Try direct access first
    const directImage = THUMBNAIL_IMAGES[targetKey as ThumbnailImageKey];
    if (directImage) {
        resultsCache.set(cacheKey, directImage);
        return directImage;
    }

    // Use smart mapping
    const mappedKey = mapImageId(numericId, AVAILABLE_THUMBNAIL_KEYS, 'thumbnail');
    logMissingImage(imageName, mappedKey, 'thumbnails');
    const result = THUMBNAIL_IMAGES[mappedKey as ThumbnailImageKey];

    resultsCache.set(cacheKey, result);
    return result;
};

/**
 * 🚀 UNIVERSAL IMAGE RESOLVER - MAIN FUNCTION
 * This is the main function you should use in your cart/components
 * Automatically handles any image ID and returns the best available image
 */
export const getImageById = (
    imageId: string | number,
    size: ImageSize = 'medium',
    category?: ImageCategory
): any => {
    if (!imageId && imageId !== 0) {
        return getSmallImage(1); // Ultimate fallback
    }

    // If category is specified, use it directly
    if (category) {
        switch (category) {
            case 'products':
                return getProductImage(imageId);
            case 'medium':
                return getMediumImage(imageId);
            case 'small':
                return getSmallImage(imageId);
            case 'banners':
                return getBannerImage(imageId);
            case 'thumbnails':
                return getThumbnailImage(imageId);
        }
    }

    // Auto-select based on size preference with smart fallback
    switch (size) {
        case 'small':
            return getSmallImage(imageId);
        case 'large':
            return getProductImage(imageId);
        case 'medium':
        default:
            return getMediumImage(imageId);
    }
};

/**
 * Smart image resolver - automatically determines the best image size and type
 * @param productId - Product ID (e.g., "1", "2", "3", 25, 67)
 * @param size - Preferred size: "small", "medium", "large"
 * @param category - Image category preference
 */
export const getProductImageBySize = (
    productId: string | number,
    size: ImageSize = 'large',
    category?: 'products' | 'medium' | 'small'
): any => {
    return getImageById(productId, size, category);
};

/**
 * Get multiple images for a product (for galleries, carousels, etc.)
 * Returns all available sizes with smart fallbacks
 */
export const getProductImages = (productId: string | number): {
    large: any;
    medium: any;
    small: any;
    thumbnail: any;
} => {
    return {
        large: getProductImage(productId),
        medium: getMediumImage(productId),
        small: getSmallImage(productId),
        thumbnail: getThumbnailImage(productId),
    };
};

/**
 * Check if an image exists for a given product ID and size
 * Now always returns true since we have smart fallbacks
 */
export const hasProductImage = (productId: string | number, size: ImageSize = 'large'): boolean => {
    // With smart fallbacks, we always have an image available
    return true;
};

/**
 * Get the actual mapped image key for debugging
 */
export const getImageMappingInfo = (imageId: string | number, size: ImageSize = 'medium'): {
    originalId: string | number;
    mappedKey: string;
    category: string;
    image: any;
} => {
    const image = getImageById(imageId, size);
    const numericId = parseInt(String(imageId).replace(/\D/g, '')) || 1;

    let availableKeys: string[];
    let prefix: string;
    let category: string;

    switch (size) {
        case 'small':
            availableKeys = AVAILABLE_SMALL_KEYS;
            prefix = 'small';
            category = 'small';
            break;
        case 'large':
            availableKeys = AVAILABLE_PRODUCT_KEYS;
            prefix = 'product';
            category = 'products';
            break;
        case 'medium':
        default:
            availableKeys = AVAILABLE_MEDIUM_KEYS;
            prefix = 'medium';
            category = 'medium';
            break;
    }

    const mappedKey = mapImageId(numericId, availableKeys, prefix);

    return {
        originalId: imageId,
        mappedKey,
        category,
        image
    };
};

/**
 * 🚀 NEW: Clear caches for memory management (call this when needed)
 */
export const clearImageCaches = (): void => {
    resultsCache.clear();
    loggedWarnings.clear();
    imageMapping.clear();
    console.log('🧹 Image caches cleared');
};

/**
 * 🚀 NEW: Get cache statistics for debugging
 */
export const getCacheStats = (): {
    resultsCacheSize: number;
    mappingCacheSize: number;
    loggedWarningsSize: number;
} => {
    return {
        resultsCacheSize: resultsCache.size,
        mappingCacheSize: imageMapping.size,
        loggedWarningsSize: loggedWarnings.size,
    };
};

// ================================
// CONVENIENCE EXPORTS
// ================================

/**
 * For direct access to image collections
 */
export const images = {
    products: PRODUCT_IMAGES,
    medium: MEDIUM_IMAGES,
    small: SMALL_IMAGES,
    banners: BANNER_IMAGES,
    thumbnails: THUMBNAIL_IMAGES,
} as const;

/**
 * Export individual collections for backwards compatibility
 */
export {
    PRODUCT_IMAGES as productImages,
    MEDIUM_IMAGES as mediumImages,
    SMALL_IMAGES as smallImages,
    BANNER_IMAGES as bannerImages,
    THUMBNAIL_IMAGES as thumbnailImages,
};

// ================================
// USAGE EXAMPLES:
// ================================

/*
// 🚀 PERFORMANCE OPTIMIZED USAGE:
import { getImageById, clearImageCaches, getCacheStats } from '../assets/images/imageLoader';

// Works with ANY image ID - now with caching for better performance
const image25 = getImageById(25); // First call: maps and caches
const image25Again = getImageById(25); // Subsequent calls: instant from cache

// Monitor performance
const stats = getCacheStats();
console.log('Cache stats:', stats);

// Clear caches if memory becomes an issue
if (stats.resultsCacheSize > 1000) {
    clearImageCaches();
}

// 📱 CART USAGE (unchanged):
const cartItemImage = getImageById(item.image, 'medium');

// All other functions work exactly the same - just faster now!
*/