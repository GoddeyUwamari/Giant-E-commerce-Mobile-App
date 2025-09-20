#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Enhanced CSV Data Processor for Walmart Mobile App
 * Processes 551K+ records into comprehensive eCommerce format
 * Updated for 14 categories with 1000+ curated products
 */

class EnhancedWalmartCSVProcessor {
    constructor() {
        this.config = {
            // Input directories
            csvDirectory: './.temp_kaggle_data',
            outputDirectory: './constants/products/data',

            // Enhanced product curation limits
            maxProducts: 1000,
            categoryLimits: {
                // Core categories (higher limits)
                'electronics': 120,
                'appliances': 80,
                'home-kitchen': 100,
                'automotive': 60,
                'sports-fitness': 80,
                'grocery': 90,

                // Fashion & lifestyle
                'fashion': 100,
                'beauty-grooming': 70,
                'baby-products': 60,
                'pet-supplies': 50,

                // Entertainment & accessories
                'video-games': 70,
                'bags-luggage': 50,
                'cameras': 40,
                'books': 30
            },

            // Quality thresholds
            minRating: 3.8,
            minReviews: 25,
            priceRange: { min: 5, max: 800 },

            // Enhanced target files with proper mapping
            targetFiles: [
                'All Electronics.csv',
                'All Appliances.csv',
                'All Home and Kitchen.csv',
                'All Car and Motorbike Products.csv',
                'All Exercise and Fitness.csv',
                'All Grocery and Gourmet Foods.csv',
                'Amazon Fashion.csv',
                'Beauty and Grooming.csv',
                'Baby Products.csv',
                'All Pet Supplies.csv',
                'All Video Games.csv',
                'Bags and Luggage.csv',
                'Cameras.csv',
                'All Books.csv'
            ],

            // Enhanced file to category mapping
            fileToCategoryMapping: {
                'All Electronics.csv': 'electronics',
                'All Appliances.csv': 'appliances',
                'All Home and Kitchen.csv': 'home-kitchen',
                'All Car and Motorbike Products.csv': 'automotive',
                'All Exercise and Fitness.csv': 'sports-fitness',
                'All Grocery and Gourmet Foods.csv': 'grocery',
                'Amazon Fashion.csv': 'fashion',
                'Beauty and Grooming.csv': 'beauty-grooming',
                'Baby Products.csv': 'baby-products',
                'All Pet Supplies.csv': 'pet-supplies',
                'All Video Games.csv': 'video-games',
                'Bags and Luggage.csv': 'bags-luggage',
                'Cameras.csv': 'cameras',
                'All Books.csv': 'books'
            },

            // Enhanced field mapping
            fieldMapping: {
                id: ['product_id', 'id', 'asin'],
                name: ['product_name', 'name', 'title'],
                price: ['discount_price', 'actual_price', 'price'],
                originalPrice: ['actual_price', 'original_price', 'mrp'],
                image: ['image', 'img_link', 'image_url'],
                rating: ['ratings', 'rating', 'avg_rating'],
                reviewCount: ['no_of_ratings', 'rating_count', 'review_count'],
                category: ['main_category', 'category', 'primary_category'],
                subCategory: ['sub_category', 'subcategory', 'secondary_category'],
                link: ['link', 'product_link', 'url'],
                brand: ['brand', 'manufacturer']
            },

            // Enhanced category normalization
            categoryMapping: {
                'tv, audio & cameras': 'electronics',
                'appliances': 'appliances',
                'home & kitchen': 'home-kitchen',
                'car & motorbike': 'automotive',
                'sports & fitness': 'sports-fitness',
                'grocery & gourmet foods': 'grocery',
                'fashion': 'fashion',
                'beauty & grooming': 'beauty-grooming',
                'baby products': 'baby-products',
                'pet supplies': 'pet-supplies',
                'video games': 'video-games',
                'bags & luggage': 'bags-luggage',
                'cameras': 'cameras',
                'books': 'books'
            },

            // Enhanced eCommerce feature configurations
            ecommerceConfig: {
                badges: ['Best Seller', 'New', 'Sale', 'Limited Stock', 'Popular', 'Trending', 'Hot Deal', 'Editor\'s Choice', 'Customer Favorite'],
                sellers: ['Walmart', 'Amazon Basics', 'Great Value', 'Onn.', 'Better Homes & Gardens', 'Equate', 'Mainstays', 'Time and Tru'],
                shippingOptions: {
                    free: { threshold: 35, days: '2-3' },
                    standard: { cost: 5.99, days: '3-5' },
                    express: { cost: 12.99, days: '1-2' }
                }
            }
        };

        this.stats = {
            totalProcessed: 0,
            validProducts: 0,
            invalidProducts: 0,
            curatedProducts: 0,
            byCategory: {},
            qualityFiltered: 0,
            priceFiltered: 0,
            byFile: {}
        };
    }

    // Enhanced product normalization with eCommerce features
    normalizeProduct(rawProduct, sourceFile = '') {
        const normalized = {
            id: '',
            name: '',
            price: 0,
            originalPrice: null,
            image: '',
            rating: 0,
            reviewCount: 0,
            category: '',
            subCategory: '',
            link: '',
            brand: '',
            inStock: true,
            featured: false,
            freeShipping: false,
            badge: null,
            seller: 'Walmart',
            maxQuantity: 99,
            minQuantity: 1,
            sku: '',
            status: 'available',
            storeId: 'walmart-main',
            storeName: 'Walmart Supercenter',
            shipping: {
                free: false,
                cost: 0,
                estimatedDays: '2-3'
            },
            delivery: {
                option: 'pickup',
                freeShippingEligible: false
            },
            primaryImage: null,
            images: [],
            source: 'kaggle',
            sourceFile: sourceFile,
            createdAt: new Date().toISOString(),
            qualityScore: 0
        };

        // Map fields using the field mapping
        for (const [normalizedField, possibleFields] of Object.entries(this.config.fieldMapping)) {
            for (const field of possibleFields) {
                if (rawProduct[field] && rawProduct[field] !== '') {
                    normalized[normalizedField] = rawProduct[field];
                    break;
                }
            }
        }

        // Generate ID if missing
        if (!normalized.id) {
            normalized.id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        normalized.sku = normalized.id;

        // Parse numeric fields
        normalized.price = this.parsePrice(normalized.price);
        normalized.originalPrice = this.parsePrice(normalized.originalPrice);
        normalized.rating = this.parseRating(normalized.rating);
        normalized.reviewCount = this.parseReviewCount(normalized.reviewCount);

        // Set category based on source file
        if (sourceFile && this.config.fileToCategoryMapping[sourceFile]) {
            normalized.category = this.config.fileToCategoryMapping[sourceFile];
        } else {
            normalized.category = this.normalizeCategory(normalized.category);
        }

        // Enhanced image handling
        normalized.image = this.validateAndFixImageUrl(normalized.image, normalized.category);
        normalized.primaryImage = { uri: normalized.image };
        normalized.images = [{ url: normalized.image, type: 'main' }];

        // Set shipping info
        this.setShippingInfo(normalized);
        this.setDeliveryOptions(normalized);

        // Assign seller and badge
        normalized.seller = this.assignSeller(normalized);
        normalized.badge = this.generateBadge(normalized);

        // Set featured status
        normalized.featured = normalized.rating >= 4.3 && normalized.reviewCount >= 500;

        // Set stock status
        const stockProbability = this.getStockProbability(normalized.category);
        normalized.inStock = Math.random() < stockProbability;
        normalized.status = normalized.inStock ? 'available' : 'out_of_stock';

        return normalized;
    }

    getStockProbability(category) {
        const stockRates = {
            'electronics': 0.92, 'appliances': 0.88, 'home-kitchen': 0.95,
            'automotive': 0.85, 'sports-fitness': 0.90, 'grocery': 0.98,
            'fashion': 0.87, 'beauty-grooming': 0.93, 'baby-products': 0.94,
            'pet-supplies': 0.91, 'video-games': 0.85, 'bags-luggage': 0.89,
            'cameras': 0.83, 'books': 0.96
        };
        return stockRates[category] || 0.90;
    }

    getCategoryPlaceholder(category) {
        const placeholders = {
            'electronics': 'https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Electronics+Product&fontSize=16',
            'appliances': 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Appliance&fontSize=16',
            'home-kitchen': 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Kitchen+Item&fontSize=16',
            'automotive': 'https://via.placeholder.com/300x300/6B7280/FFFFFF?text=Auto+Part&fontSize=16',
            'sports-fitness': 'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=Fitness+Gear&fontSize=16',
            'grocery': 'https://via.placeholder.com/300x300/059669/FFFFFF?text=Grocery+Item&fontSize=16',
            'fashion': 'https://via.placeholder.com/300x300/EC4899/FFFFFF?text=Fashion&fontSize=16',
            'beauty-grooming': 'https://via.placeholder.com/300x300/A855F7/FFFFFF?text=Beauty&fontSize=16',
            'baby-products': 'https://via.placeholder.com/300x300/F97316/FFFFFF?text=Baby+Product&fontSize=16',
            'pet-supplies': 'https://via.placeholder.com/300x300/84CC16/FFFFFF?text=Pet+Supply&fontSize=16',
            'video-games': 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Gaming&fontSize=16',
            'bags-luggage': 'https://via.placeholder.com/300x300/0EA5E9/FFFFFF?text=Luggage&fontSize=16',
            'cameras': 'https://via.placeholder.com/300x300/14B8A6/FFFFFF?text=Camera&fontSize=16',
            'books': 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Book&fontSize=16'
        };
        return placeholders[category] || 'https://via.placeholder.com/300x300/9CA3AF/FFFFFF?text=Product&fontSize=16';
    }

    validateAndFixImageUrl(imageUrl, category) {
        // First check if imageUrl exists and is a string
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
            return this.getCategoryPlaceholder(category);
        }

        const cleanUrl = imageUrl.trim();

        // Check for valid HTTP/HTTPS URLs
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            return this.getCategoryPlaceholder(category);
        }

        // Check for broken or invalid patterns
        const brokenPatterns = [
            'javascript:', 'data:image/svg', 'blob:', 'file://', '#',
            'placeholder', 'no-image', 'missing', 'default.jpg',
            'undefined', 'null', 'NaN', 'lorem', 'dummy'
        ];

        const lowerUrl = cleanUrl.toLowerCase();
        for (const pattern of brokenPatterns) {
            if (lowerUrl.includes(pattern)) {
                return this.getCategoryPlaceholder(category);
            }
        }

        // Check URL length (extremely long URLs are often broken)
        if (cleanUrl.length > 2000) {
            return this.getCategoryPlaceholder(category);
        }

        // More selective Amazon image filtering - only block problematic ones
        if (cleanUrl.includes('amazon')) {
            // Block specific problematic Amazon patterns
            const problematicPatterns = [
                'IMAGERENDERING_521856-T2',  // These specific ones we know are broken
                '/images/W/IMAGERENDERING_521856-T2/',
                'access-denied',
                'no-access'
            ];

            for (const pattern of problematicPatterns) {
                if (cleanUrl.includes(pattern)) {
                    return this.getCategoryPlaceholder(category);
                }
            }
        }

        // Additional validation: check for common image extensions
        const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(cleanUrl);

        if (!hasImageExtension) {
            return this.getCategoryPlaceholder(category);
        }

        return cleanUrl;
    }

    setShippingInfo(product) {
        const config = this.config.ecommerceConfig.shippingOptions;
        if (product.price >= config.free.threshold) {
            product.freeShipping = true;
            product.shipping = { free: true, cost: 0, estimatedDays: config.free.days };
        } else {
            product.freeShipping = false;
            product.shipping = { free: false, cost: config.standard.cost, estimatedDays: config.standard.days };
        }
    }

    setDeliveryOptions(product) {
        product.delivery = {
            option: 'pickup',
            freeShippingEligible: product.freeShipping
        };
    }

    assignSeller(product) {
        const categorySellerMap = {
            'electronics': ['Walmart', 'Onn.'],
            'grocery': ['Great Value', 'Walmart'],
            'home-kitchen': ['Better Homes & Gardens', 'Mainstays'],
            'beauty-grooming': ['Equate', 'Walmart'],
            'fashion': ['Time and Tru', 'Walmart'],
            'baby-products': ['Walmart', 'Great Value'],
            'appliances': ['Walmart', 'Better Homes & Gardens']
        };

        const categoryOptions = categorySellerMap[product.category];
        if (categoryOptions) {
            return categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
        }
        return 'Walmart';
    }

    generateBadge(product) {
        if (product.rating >= 4.7 && product.reviewCount >= 500) {
            return 'Best Seller';
        }

        if (product.originalPrice && product.originalPrice > product.price) {
            const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
            if (discount >= 40) return 'Hot Deal';
            if (discount >= 25) return 'Sale';
        }

        if (product.reviewCount >= 1000) return 'Popular';
        if (Math.random() > 0.85) return 'New';
        if (Math.random() > 0.9) return 'Trending';

        return null;
    }

    parsePrice(priceStr) {
        if (!priceStr) return 0;
        const cleanPrice = priceStr.toString().replace(/[₹$€£¥,]/g, '').trim();
        const price = parseFloat(cleanPrice);
        return isNaN(price) ? 0 : price;
    }

    parseRating(ratingStr) {
        if (!ratingStr) return 0;
        const rating = parseFloat(ratingStr.toString());
        return isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
    }

    parseReviewCount(reviewStr) {
        if (!reviewStr) return 0;
        const cleanReviews = reviewStr.toString().replace(/[,\s]/g, '').trim();
        const reviews = parseInt(cleanReviews);
        return isNaN(reviews) ? 0 : reviews;
    }

    normalizeCategory(categoryStr) {
        if (!categoryStr) return 'general';
        const category = categoryStr.toLowerCase().trim();
        return this.config.categoryMapping[category] || category.replace(/\s+/g, '-');
    }

    isValidProduct(product) {
        return product.name && product.name.length >= 5 && product.image && product.price > 0 && product.category;
    }

    calculateQualityScore(product) {
        let score = 0;
        score += (product.rating / 5) * 35;
        score += Math.min((product.reviewCount / 10000) * 25, 25);
        score += this.calculatePriceScore(product.price) * 20;

        const nameLength = product.name.length;
        const nameScore = nameLength >= 50 && nameLength <= 150 ? 10 : nameLength >= 30 ? 7 : 5;
        score += nameScore;

        score += product.freeShipping ? 5 : 0;
        score += product.badge ? 5 : 0;

        return Math.round(score * 100) / 100;
    }

    calculatePriceScore(price) {
        if (price < this.config.priceRange.min || price > this.config.priceRange.max) return 0;
        if (price >= 25 && price <= 100) return 1;
        if (price >= 10 && price <= 25) return 0.8;
        if (price >= 100 && price <= 300) return 0.9;
        if (price >= 300 && price <= 800) return 0.7;
        return 0.5;
    }

    isQualityProduct(product) {
        return this.isValidProduct(product) &&
            product.rating >= this.config.minRating &&
            product.reviewCount >= this.config.minReviews &&
            product.price >= this.config.priceRange.min &&
            product.price <= this.config.priceRange.max;
    }

    async processCSVFile(filename) {
        const filePath = path.join(this.config.csvDirectory, filename);

        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filename}`);
            return [];
        }

        console.log(`Processing ${filename}...`);

        const products = [];
        this.stats.byFile[filename] = { totalRows: 0, validProducts: 0, qualityProducts: 0 };

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    this.stats.totalProcessed++;
                    this.stats.byFile[filename].totalRows++;

                    const normalizedProduct = this.normalizeProduct(row, filename);

                    if (this.isValidProduct(normalizedProduct)) {
                        this.stats.validProducts++;
                        this.stats.byFile[filename].validProducts++;

                        if (this.isQualityProduct(normalizedProduct)) {
                            normalizedProduct.qualityScore = this.calculateQualityScore(normalizedProduct);
                            products.push(normalizedProduct);
                            this.stats.byFile[filename].qualityProducts++;

                            const category = normalizedProduct.category;
                            this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
                        } else {
                            this.stats.qualityFiltered++;
                        }
                    } else {
                        this.stats.invalidProducts++;
                    }
                })
                .on('end', () => {
                    products.sort((a, b) => b.qualityScore - a.qualityScore);
                    console.log(`   Found ${products.length} quality products`);
                    resolve(products);
                })
                .on('error', reject);
        });
    }

    curateProducts(allProducts) {
        console.log(`\nCurating top ${this.config.maxProducts} products by category...`);

        const curatedProducts = {};
        let totalSelected = 0;

        const productsByCategory = {};
        allProducts.forEach(product => {
            const category = product.category;
            if (!productsByCategory[category]) {
                productsByCategory[category] = [];
            }
            productsByCategory[category].push(product);
        });

        for (const [category, limit] of Object.entries(this.config.categoryLimits)) {
            const categoryProducts = productsByCategory[category] || [];

            if (categoryProducts.length === 0) {
                console.log(`   No products found for category: ${category}`);
                curatedProducts[category] = [];
                continue;
            }

            categoryProducts.sort((a, b) => b.qualityScore - a.qualityScore);
            const selectedProducts = this.selectDiverseProducts(categoryProducts, limit);

            curatedProducts[category] = selectedProducts;
            totalSelected += selectedProducts.length;
            this.stats.curatedProducts += selectedProducts.length;

            console.log(`   ${category}: ${selectedProducts.length}/${categoryProducts.length} products`);
        }

        console.log(`\nTotal curated: ${totalSelected}/${this.config.maxProducts} products`);
        return curatedProducts;
    }

    selectDiverseProducts(products, limit) {
        if (products.length <= limit) return products;

        const selected = [];
        const priceRanges = {
            budget: products.filter(p => p.price >= 5 && p.price < 50),
            midRange: products.filter(p => p.price >= 50 && p.price < 200),
            premium: products.filter(p => p.price >= 200 && p.price <= 800)
        };

        const budgetTarget = Math.ceil(limit * 0.4);
        const midTarget = Math.ceil(limit * 0.4);
        const premiumTarget = limit - budgetTarget - midTarget;

        selected.push(...priceRanges.budget.slice(0, budgetTarget));
        selected.push(...priceRanges.midRange.slice(0, midTarget));
        selected.push(...priceRanges.premium.slice(0, premiumTarget));

        const usedIds = new Set(selected.map(p => p.id));
        const remaining = products.filter(p => !usedIds.has(p.id)).slice(0, limit - selected.length);
        selected.push(...remaining);

        return selected.slice(0, limit);
    }

    generateTypeScriptFiles(productsByCategory) {
        console.log('Generating TypeScript files...');

        if (!fs.existsSync(this.config.outputDirectory)) {
            fs.mkdirSync(this.config.outputDirectory, { recursive: true });
        }

        // Generate interfaces.ts
        this.generateInterfacesFile();

        // Generate category files - only for categories with products
        const validCategories = [];
        for (const [categorySlug, products] of Object.entries(productsByCategory)) {
            if (products.length > 0) {
                this.generateCategoryFile(categorySlug, products);
                validCategories.push(categorySlug);
            }
        }

        // Generate index.ts with only valid categories
        this.generateIndexFile(validCategories);
    }

    generateInterfacesFile() {
        const content = `// Auto-generated interfaces from enhanced CSV data
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  subCategory: string;
  link: string;
  brand: string;
  inStock: boolean;
  featured: boolean;
  freeShipping: boolean;
  badge?: string;
  seller: string;
  maxQuantity: number;
  minQuantity: number;
  sku: string;
  status: 'available' | 'out_of_stock';
  storeId: string;
  storeName: string;
  shipping: {
    free: boolean;
    cost: number;
    estimatedDays: string;
  };
  delivery: {
    option: 'pickup' | 'delivery';
    freeShippingEligible: boolean;
  };
  primaryImage: { uri: string };
  images: Array<{ url: string; type: string }>;
  source: 'kaggle';
  sourceFile?: string;
  createdAt: string;
  qualityScore?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  products: Product[];
  productCount: number;
  icon: string;
  color: string;
  itemCount: number;
}
`;

        fs.writeFileSync(path.join(this.config.outputDirectory, 'interfaces.ts'), content);
    }

    generateCategoryFile(categorySlug, products) {
        const categoryData = {
            id: categorySlug,
            name: this.formatCategoryName(categorySlug),
            slug: categorySlug,
            products: products,
            productCount: products.length,
            icon: this.getCategoryIcon(categorySlug),
            color: this.getCategoryColor(categorySlug),
            itemCount: products.length
        };

        const constName = categorySlug.toUpperCase().replace(/-/g, '_');

        // Create safe function name by removing special characters
        const safeFunctionName = this.formatCategoryName(categorySlug)
            .replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
            .replace(/\s+/g, ''); // Remove any remaining spaces

        const content = `// Auto-generated from ${categorySlug} CSV data
import { Product, Category } from './interfaces';

export const ${constName}_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

export const ${constName}_CATEGORY: Category = ${JSON.stringify(categoryData, null, 2)};

export const get${safeFunctionName}Products = (): Product[] => ${constName}_PRODUCTS;

export const getFeatured${safeFunctionName}Products = (): Product[] => 
  ${constName}_PRODUCTS.filter(product => product.featured);

export const get${safeFunctionName}ProductsByBadge = (badge: string): Product[] =>
  ${constName}_PRODUCTS.filter(product => product.badge === badge);

export const get${safeFunctionName}ProductsByPriceRange = (min: number, max: number): Product[] =>
  ${constName}_PRODUCTS.filter(product => product.price >= min && product.price <= max);
`;

        fs.writeFileSync(path.join(this.config.outputDirectory, `${categorySlug}.ts`), content);
    }

    generateIndexFile(categoryKeys) {
        // Filter out categories that don't have generated files
        const validCategoryKeys = categoryKeys.filter(cat => {
            const filePath = path.join(this.config.outputDirectory, `${cat}.ts`);
            return fs.existsSync(filePath);
        });

        let content = `// Auto-generated index for all categories\n`;

        // Export only valid category files
        validCategoryKeys.forEach(cat => {
            content += `export * from './${cat}';\n`;
        });
        content += `export * from './interfaces';\n\n`;

        // Import statements for valid categories only
        content += `import { Product, Category } from './interfaces';\n`;
        validCategoryKeys.forEach(cat => {
            const constName = cat.toUpperCase().replace(/-/g, '_');
            content += `import { ${constName}_PRODUCTS, ${constName}_CATEGORY } from './${cat}';\n`;
        });

        // Combined exports using only valid categories
        content += `\nexport const ALL_PRODUCTS: Product[] = [\n`;
        validCategoryKeys.forEach(cat => {
            content += `  ...${cat.toUpperCase().replace(/-/g, '_')}_PRODUCTS,\n`;
        });
        content += `];\n\n`;

        content += `export const ALL_CATEGORIES: Category[] = [\n`;
        validCategoryKeys.forEach(cat => {
            content += `  ${cat.toUpperCase().replace(/-/g, '_')}_CATEGORY,\n`;
        });
        content += `];\n\n`;

        // Enhanced utility functions
        content += `export const getProductsByCategory = (categorySlug: string): Product[] => {
  const category = ALL_CATEGORIES.find(cat => cat.slug === categorySlug);
  return category ? category.products : [];
};

export const getProductById = (id: string): Product | undefined => {
  return ALL_PRODUCTS.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return ALL_PRODUCTS.filter(product => product.featured);
};

export const getProductsByBadge = (badge: string): Product[] => {
  return ALL_PRODUCTS.filter(product => product.badge === badge);
};

export const getTrendingProducts = (): Product[] => {
  return ALL_PRODUCTS.filter(product => 
    product.badge === 'Trending' || product.rating >= 4.5
  );
};

export const getBestSellerProducts = (): Product[] => {
  return ALL_PRODUCTS.filter(product => 
    product.badge === 'Best Seller' || product.reviewCount > 500
  );
};

export const getNewArrivals = (): Product[] => {
  return ALL_PRODUCTS.filter(product => product.badge === 'New');
};

export const getSaleProducts = (): Product[] => {
  return ALL_PRODUCTS.filter(product =>
    product.originalPrice && product.originalPrice > product.price
  );
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return ALL_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getAvailableCategories = (): string[] => {
  return ALL_CATEGORIES.map(cat => cat.slug);
};

// Category statistics
export const getCategoryStats = () => ({
  totalCategories: ALL_CATEGORIES.length,
  totalProducts: ALL_PRODUCTS.length,
  categoriesWithProducts: ALL_CATEGORIES.filter(cat => cat.productCount > 0).length,
  averageProductsPerCategory: ALL_PRODUCTS.length / ALL_CATEGORIES.length
});
`;

        fs.writeFileSync(path.join(this.config.outputDirectory, 'index.ts'), content);

        // Log which categories were included/excluded
        console.log(`\nGenerated index.ts with ${validCategoryKeys.length} categories:`);
        validCategoryKeys.forEach(cat => {
            console.log(`   ✓ ${cat}`);
        });

        const excludedCategories = categoryKeys.filter(cat => !validCategoryKeys.includes(cat));
        if (excludedCategories.length > 0) {
            console.log(`\nExcluded categories (no products found):`);
            excludedCategories.forEach(cat => {
                console.log(`   ✗ ${cat}`);
            });
        }
    }
    formatCategoryName(slug) {
        const nameMap = {
            'home-kitchen': 'Home & Kitchen',
            'sports-fitness': 'Sports & Fitness',
            'beauty-grooming': 'Beauty & Grooming',
            'baby-products': 'Baby Products',
            'pet-supplies': 'Pet Supplies',
            'video-games': 'Video Games',
            'bags-luggage': 'Bags & Luggage'
        };

        if (nameMap[slug]) return nameMap[slug];
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    getCategoryIcon(categorySlug) {
        const iconMap = {
            'electronics': 'phone-portrait-outline',
            'appliances': 'home-outline',
            'home-kitchen': 'restaurant-outline',
            'automotive': 'car-outline',
            'sports-fitness': 'fitness-outline',
            'grocery': 'basket-outline',
            'fashion': 'shirt-outline',
            'beauty-grooming': 'rose-outline',
            'baby-products': 'happy-outline',
            'pet-supplies': 'paw-outline',
            'video-games': 'game-controller-outline',
            'bags-luggage': 'bag-outline',
            'cameras': 'camera-outline',
            'books': 'book-outline'
        };
        return iconMap[categorySlug] || 'cube-outline';
    }

    getCategoryColor(categorySlug) {
        const colorMap = {
            'electronics': '#3B82F6',
            'appliances': '#10B981',
            'home-kitchen': '#F59E0B',
            'automotive': '#6B7280',
            'sports-fitness': '#EF4444',
            'grocery': '#059669',
            'fashion': '#EC4899',
            'beauty-grooming': '#A855F7',
            'baby-products': '#F97316',
            'pet-supplies': '#84CC16',
            'video-games': '#8B5CF6',
            'bags-luggage': '#0EA5E9',
            'cameras': '#14B8A6',
            'books': '#F59E0B'
        };
        return colorMap[categorySlug] || '#8B5CF6';
    }

    async run() {
        try {
            console.log('Starting Enhanced CSV Processing...');
            console.log(`Target: ${this.config.maxProducts} curated products from ${this.config.targetFiles.length} files\n`);

            const allProducts = [];

            for (const filename of this.config.targetFiles) {
                const products = await this.processCSVFile(filename);
                allProducts.push(...products);
            }

            console.log(`\nFound ${allProducts.length} quality products total`);

            const curatedByCategory = this.curateProducts(allProducts);
            this.generateTypeScriptFiles(curatedByCategory);
            this.generateReport(curatedByCategory);

            console.log('Enhanced CSV Processing completed successfully!');
            return curatedByCategory;

        } catch (error) {
            console.error('Processing failed:', error);
            throw error;
        }
    }

    generateReport(productsByCategory) {
        const reportPath = path.join(this.config.outputDirectory, 'processing-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalProcessed: this.stats.totalProcessed,
                validProducts: this.stats.validProducts,
                curatedProducts: this.stats.curatedProducts,
                invalidProducts: this.stats.invalidProducts,
                successRate: ((this.stats.curatedProducts / this.stats.totalProcessed) * 100).toFixed(2) + '%'
            },
            fileStats: this.stats.byFile,
            categories: Object.fromEntries(
                Object.entries(productsByCategory).map(([category, products]) => [
                    category,
                    {
                        count: products.length,
                        limit: this.config.categoryLimits[category] || 0,
                        averageRating: this.getAverageRating(products),
                        averagePrice: this.getAveragePrice(products)
                    }
                ])
            )
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\nPROCESSING SUMMARY:');
        console.log('===================');
        console.log(`Total records processed: ${this.stats.totalProcessed.toLocaleString()}`);
        console.log(`Quality products found: ${this.stats.validProducts.toLocaleString()}`);
        console.log(`Final curated selection: ${this.stats.curatedProducts}/${this.config.maxProducts}`);
        console.log(`Overall success rate: ${report.summary.successRate}`);

        console.log('\nCurated products by category:');
        Object.entries(productsByCategory).forEach(([category, products]) => {
            const limit = this.config.categoryLimits[category];
            const avgRating = this.getAverageRating(products);
            const avgPrice = this.getAveragePrice(products);
            console.log(`   ${category}: ${products.length}/${limit} - avg rating: ${avgRating.toFixed(1)}, avg price: ${avgPrice.toFixed(0)}`);
        });

        console.log(`\nReport saved: ${reportPath}`);
    }

    getAverageRating(products) {
        if (products.length === 0) return 0;
        return products.reduce((sum, p) => sum + p.rating, 0) / products.length;
    }

    getAveragePrice(products) {
        if (products.length === 0) return 0;
        return products.reduce((sum, p) => sum + p.price, 0) / products.length;
    }
}

// CLI execution
if (require.main === module) {
    const processor = new EnhancedWalmartCSVProcessor();
    processor.run()
        .then(() => {
            console.log('\nReady for React Native integration!');
            console.log('\nNext steps:');
            console.log('1. Import: import { ALL_PRODUCTS, ALL_CATEGORIES } from "./constants/products/data"');
            console.log('2. Use 14 categories with 1000+ curated products');
            console.log('3. Access enhanced eCommerce features and search capabilities');
            process.exit(0);
        })
        .catch(error => {
            console.error('Failed:', error);
            process.exit(1);
        });
}

module.exports = EnhancedWalmartCSVProcessor;