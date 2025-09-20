#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const { execSync } = require('child_process');

// Enhanced Image Processor Class
class EnhancedImageProcessor {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.delayBetweenRequests = options.delayBetweenRequests || 150; // ms
        this.timeout = options.timeout || 10000; // 10 seconds
        this.validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    }

    // Validate if URL is potentially a valid image URL
    isValidImageUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, reason: 'URL is empty or not a string' };
        }

        // Check if it starts with http/https
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return { valid: false, reason: 'URL does not start with http/https' };
        }

        // Check for common invalid patterns
        const invalidPatterns = [
            'javascript:',
            'data:image/svg',
            'blob:',
            'file://',
            '#',
            'mailto:'
        ];

        for (const pattern of invalidPatterns) {
            if (url.toLowerCase().includes(pattern)) {
                return { valid: false, reason: `Contains invalid pattern: ${pattern}` };
            }
        }

        // Check if URL is too long (likely malformed)
        if (url.length > 2000) {
            return { valid: false, reason: 'URL too long (>2000 chars)' };
        }

        return { valid: true };
    }

    // Enhanced delay function with jitter to avoid thundering herd
    async delay(ms = null) {
        const actualDelay = ms || this.delayBetweenRequests;
        const jitter = Math.random() * 50; // Add 0-50ms random jitter
        await new Promise(resolve => setTimeout(resolve, actualDelay + jitter));
    }

    // Download single image with enhanced error handling
    async downloadImage(imageUrl, outputPath, productId) {
        const validation = this.isValidImageUrl(imageUrl);
        if (!validation.valid) {
            console.log(`⚠️  Skipping ${productId}: ${validation.reason}`);
            return { success: false, reason: validation.reason, skipped: true };
        }

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await axios({
                    method: 'GET',
                    url: imageUrl,
                    responseType: 'stream',
                    timeout: this.timeout,
                    headers: {
                        'User-Agent': this.userAgent,
                        'Accept': 'image/*,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                    },
                    maxRedirects: 5,
                    validateStatus: (status) => status < 400,
                });

                // Check content type
                const contentType = response.headers['content-type'];
                if (contentType && !contentType.startsWith('image/')) {
                    console.log(`⚠️  ${productId}: Not an image (${contentType})`);
                    return { success: false, reason: `Not an image: ${contentType}`, skipped: true };
                }

                // Save the image
                const writer = fs.createWriteStream(outputPath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Verify file was created and has reasonable size
                const stats = fs.statSync(outputPath);
                if (stats.size < 100) {
                    fs.unlinkSync(outputPath);
                    throw new Error(`File too small (${stats.size} bytes)`);
                }

                return { success: true, size: stats.size };

            } catch (error) {
                // Clean up partial downloads
                if (fs.existsSync(outputPath)) {
                    try {
                        fs.unlinkSync(outputPath);
                    } catch (cleanupError) {
                        // Ignore cleanup errors
                    }
                }

                if (attempt === this.maxRetries) {
                    const errorType = this.categorizeError(error);
                    return { success: false, reason: errorType.reason, fatal: errorType.fatal };
                }

                // Wait before retrying (with exponential backoff)
                await this.delay(this.delayBetweenRequests * Math.pow(2, attempt - 1));
            }
        }
    }

    // Categorize errors to determine if we should continue processing
    categorizeError(error) {
        const message = error.message.toLowerCase();
        const status = error.response?.status;

        if (status === 400) {
            return { reason: 'Bad request (likely invalid URL)', fatal: false };
        } else if (status === 403) {
            return { reason: 'Access forbidden', fatal: false };
        } else if (status === 404) {
            return { reason: 'Image not found', fatal: false };
        } else if (status === 429) {
            return { reason: 'Rate limited', fatal: false };
        } else if (message.includes('timeout')) {
            return { reason: 'Request timeout', fatal: false };
        } else if (message.includes('network')) {
            return { reason: 'Network error', fatal: true };
        } else {
            return { reason: error.message, fatal: false };
        }
    }

    // Process multiple images for a category with progress tracking
    async processCategory(categoryName, products, outputDir) {
        console.log(`🎨 Processing ${categoryName}: ${products.length} products`);

        const results = {
            total: products.length,
            successful: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const productId = `${categoryName}_${String(i + 1).padStart(3, '0')}`;

            // Show progress every 10 items
            if ((i + 1) % 10 === 0) {
                console.log(`📊 Progress: ${i + 1}/${products.length} images processed for ${categoryName}`);
            }

            try {
                const imagePath = path.join(outputDir, `${productId}.jpg`);
                const result = await this.downloadImage(product.img_link, imagePath, productId);

                if (result.success) {
                    results.successful++;
                } else if (result.skipped) {
                    results.skipped++;
                } else {
                    results.failed++;
                    results.errors.push({ productId, reason: result.reason });
                }

                // Add delay between requests
                await this.delay();

            } catch (error) {
                console.log(`💥 Unexpected error processing ${productId}: ${error.message}`);
                results.failed++;
                results.errors.push({ productId, reason: error.message });
            }
        }

        // Summary for this category
        console.log(`📈 ${categoryName} Summary: ${results.successful} successful, ${results.skipped} skipped, ${results.failed} failed`);

        return results;
    }
}

// Main Integration Class
class KaggleDatasetIntegration {
    constructor() {
        this.baseDir = path.join(process.cwd(), 'kaggle-walmart-data');
        this.imageProcessor = new EnhancedImageProcessor({
            maxRetries: 3,
            delayBetweenRequests: 200,
            timeout: 15000
        });
    }

    // Create enhanced directory structure
    createDirectoryStructure() {
        console.log('🏗️  Setting up enhanced directory structure...');

        const dirs = [
            'raw-data',
            'processed-data',
            'images',
            'images/electronics',
            'images/fashion',
            'images/baby-kids',
            'images/health-beauty',
            'images/home-garden',
            'images/sports-outdoors',
            'reports',
            'logs'
        ];

        dirs.forEach(dir => {
            const fullPath = path.join(this.baseDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });

        console.log('✅ Directory structure created successfully');
    }

    // Download Kaggle dataset with fallback options
    async downloadDataset() {
        console.log('📦 Attempting to download Kaggle dataset...');

        const datasets = [
            'lokeshparab/amazon-products-dataset',
            'karkavelrajaj/amazon-sales-dataset',
            'shivamb/amazon-fba-inventory-dataset'
        ];

        // Try different ways to run kagglehub
        const kagglehubCommands = [
            'kagglehub download',
            'python -m kagglehub download',
            'python3 -m kagglehub download',
            '/Users/user/anaconda3/bin/python -m kagglehub download'
        ];

        for (const dataset of datasets) {
            console.log(`🔄 Trying dataset: ${dataset}`);

            for (const command of kagglehubCommands) {
                try {
                    console.log(`   📋 Using command: ${command.split(' ')[0]}...`);
                    execSync(`${command} ${dataset}`, { stdio: 'pipe' });
                    console.log(`✅ Successfully downloaded: ${dataset}`);
                    return dataset;
                } catch (error) {
                    // Continue to next command variant
                    continue;
                }
            }
            console.log(`❌ Failed to download ${dataset} with all command variants`);
        }

        throw new Error('❌ Failed to download any dataset - try running: python -m kagglehub download lokeshparab/amazon-products-dataset');
    }

    // Parse CSV with enhanced error handling
    async parseCSV(datasetPath) {
        console.log(`🔄 Processing products from: ${datasetPath}`);

        // Find CSV files in the dataset
        const files = this.findCSVFiles(datasetPath);
        console.log(`📁 Directory contains ${files.length} files`);

        if (files.length === 0) {
            throw new Error('No CSV files found in dataset');
        }

        // Prioritize certain file names
        const priorityFiles = ['Amazon-Products.csv', 'products.csv', 'amazon.csv', 'data.csv'];
        let csvFile = files.find(file => priorityFiles.includes(path.basename(file)));

        if (!csvFile) {
            csvFile = files[0]; // Use first CSV file found
        }

        console.log(`📄 Using priority file: ${path.basename(csvFile)}`);

        return new Promise((resolve, reject) => {
            const products = [];
            let rowCount = 0;

            fs.createReadStream(csvFile)
                .pipe(csv())
                .on('data', (row) => {
                    rowCount++;
                    if (this.isValidProduct(row)) {
                        products.push(this.normalizeProduct(row));
                    }
                })
                .on('end', () => {
                    console.log(`✅ CSV parsed successfully: ${rowCount} total rows, ${products.length} valid products`);
                    resolve(products);
                })
                .on('error', (error) => {
                    console.error(`❌ Error parsing CSV: ${error.message}`);
                    reject(error);
                });
        });
    }

    // Find CSV files in directory
    findCSVFiles(dirPath) {
        const files = [];

        function scanDirectory(currentPath) {
            const items = fs.readdirSync(currentPath);

            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (path.extname(item).toLowerCase() === '.csv') {
                    files.push(fullPath);
                }
            }
        }

        scanDirectory(dirPath);
        return files;
    }

    // Validate product data
    isValidProduct(product) {
        return product &&
            (product.img_link || product.image_url || product.image) &&
            (product.product_name || product.title || product.name) &&
            (product.category || product.main_category || this.inferCategory(product));
    }

    // Normalize product data to consistent format
    normalizeProduct(product) {
        return {
            id: product.product_id || product.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: product.product_name || product.title || product.name || 'Unknown Product',
            category: product.category || product.main_category || this.inferCategory(product),
            img_link: product.img_link || product.image_url || product.image,
            price: product.actual_price || product.price || product.discounted_price || 'N/A',
            rating: product.rating || product.rating_count || 'N/A',
            reviews: product.rating_count || product.no_of_ratings || 'N/A'
        };
    }

    // Infer category from product name or other fields
    inferCategory(product) {
        const name = (product.product_name || product.title || product.name || '').toLowerCase();

        if (name.includes('phone') || name.includes('laptop') || name.includes('electronics')) return 'electronics';
        if (name.includes('dress') || name.includes('shirt') || name.includes('fashion')) return 'fashion';
        if (name.includes('baby') || name.includes('kids') || name.includes('toy')) return 'baby-kids';
        if (name.includes('beauty') || name.includes('health') || name.includes('skincare')) return 'health-beauty';
        if (name.includes('home') || name.includes('garden') || name.includes('furniture')) return 'home-garden';
        if (name.includes('sports') || name.includes('outdoor') || name.includes('fitness')) return 'sports-outdoors';

        return 'general';
    }

    // Categorize products with balanced distribution
    categorizeProducts(products, targetPerCategory = 20) {
        console.log(`🎯 Categorizing ${Math.min(products.length, targetPerCategory * 6)} products...`);

        const categories = {
            'electronics': [],
            'fashion': [],
            'baby-kids': [],
            'health-beauty': [],
            'home-garden': [],
            'sports-outdoors': []
        };

        // First pass: distribute products naturally
        for (const product of products) {
            const category = product.category;
            if (categories[category] && categories[category].length < targetPerCategory) {
                categories[category].push(product);
            }
        }

        // Second pass: fill categories that need more products
        for (const [categoryName, categoryProducts] of Object.entries(categories)) {
            if (categoryProducts.length < targetPerCategory) {
                const needed = targetPerCategory - categoryProducts.length;
                console.log(`📈 Filling ${categoryName} with ${needed} additional products`);

                const additionalProducts = products
                    .filter(p => !Object.values(categories).flat().includes(p))
                    .slice(0, needed);

                categories[categoryName].push(...additionalProducts);
            }
        }

        return categories;
    }

    // Process images with enhanced error handling
    async processImages(categorizedProducts) {
        console.log('🖼️  Processing images with enhanced pipeline...');

        const overallResults = {
            totalCategories: 0,
            totalProducts: 0,
            totalSuccessful: 0,
            totalSkipped: 0,
            totalFailed: 0,
            categoryResults: {}
        };

        for (const [category, products] of Object.entries(categorizedProducts)) {
            if (products.length === 0) continue;

            const categoryDir = path.join(this.baseDir, 'images', category);

            // Ensure directory exists
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            const categoryResult = await this.imageProcessor.processCategory(category, products, categoryDir);

            overallResults.totalCategories++;
            overallResults.totalProducts += categoryResult.total;
            overallResults.totalSuccessful += categoryResult.successful;
            overallResults.totalSkipped += categoryResult.skipped;
            overallResults.totalFailed += categoryResult.failed;
            overallResults.categoryResults[category] = categoryResult;
        }

        // Final summary
        console.log('\n🎯 FINAL RESULTS:');
        console.log(`📊 Processed ${overallResults.totalCategories} categories`);
        console.log(`📊 Total products: ${overallResults.totalProducts}`);
        console.log(`✅ Successful downloads: ${overallResults.totalSuccessful}`);
        console.log(`⚠️  Skipped (invalid URLs): ${overallResults.totalSkipped}`);
        console.log(`❌ Failed downloads: ${overallResults.totalFailed}`);

        if (overallResults.totalProducts > 0) {
            console.log(`📈 Success rate: ${((overallResults.totalSuccessful / overallResults.totalProducts) * 100).toFixed(1)}%`);
        }

        return overallResults;
    }

    // Save processing results and generate reports
    saveResults(categorizedProducts, imageResults, datasetInfo) {
        const timestamp = new Date().toISOString();

        // Save detailed results
        const resultsPath = path.join(this.baseDir, 'reports', 'processing-results.json');
        const detailedResults = {
            timestamp,
            dataset: datasetInfo,
            totalProductsProcessed: Object.values(categorizedProducts).reduce((sum, products) => sum + products.length, 0),
            imageProcessingResults: imageResults,
            categories: Object.keys(categorizedProducts),
            productsByCategory: Object.fromEntries(
                Object.entries(categorizedProducts).map(([cat, products]) => [
                    cat,
                    products.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        rating: p.rating
                    }))
                ])
            )
        };

        fs.writeFileSync(resultsPath, JSON.stringify(detailedResults, null, 2));
        console.log(`📄 Detailed results saved to: ${resultsPath}`);

        // Save summary report
        const summaryPath = path.join(this.baseDir, 'reports', 'processing-summary.json');
        const summary = {
            processingDate: timestamp,
            dataset: datasetInfo,
            totalImages: imageResults.totalProducts,
            successRate: imageResults.totalProducts > 0 ?
                ((imageResults.totalSuccessful / imageResults.totalProducts) * 100).toFixed(1) + '%' : '0%',
            breakdown: {
                successful: imageResults.totalSuccessful,
                skipped: imageResults.totalSkipped,
                failed: imageResults.totalFailed
            },
            categoryBreakdown: {}
        };

        // Add category-specific details
        for (const [category, categoryResult] of Object.entries(imageResults.categoryResults)) {
            summary.categoryBreakdown[category] = {
                total: categoryResult.total,
                successful: categoryResult.successful,
                successRate: categoryResult.total > 0 ?
                    ((categoryResult.successful / categoryResult.total) * 100).toFixed(1) + '%' : '0%',
                commonErrors: categoryResult.errors.slice(0, 3)
            };
        }

        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log(`📋 Processing summary saved to: ${summaryPath}`);

        return { detailedResults, summary };
    }

    // Main execution function
    async run() {
        try {
            console.log('🚀 Starting Enhanced Kaggle Dataset Integration...');

            // Setup
            this.createDirectoryStructure();

            // Check for existing data first
            let datasetPath = path.join(process.cwd(), '.temp_kaggle_data');
            let datasetName = 'local-amazon-products';

            if (fs.existsSync(datasetPath)) {
                console.log(`📁 Found existing Kaggle data at: ${datasetPath}`);
            } else {
                console.log('❌ No local data found at .temp_kaggle_data');
                throw new Error('No data source available');
            }

            // Parse data
            const products = await this.parseCSV(datasetPath);
            // ... rest of method stays the same
            // Categorize products
            const categorizedProducts = this.categorizeProducts(products);

            // Process images
            const imageResults = await this.processImages(categorizedProducts);

            // Save results
            const results = this.saveResults(categorizedProducts, imageResults, datasetName);

            console.log('✅ Enhanced Kaggle Dataset Integration completed!');
            console.log(`📁 All files saved to: ${this.baseDir}`);

            return results;

        } catch (error) {
            console.error('💥 Integration failed:', error.message);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    // Find dataset path in Kaggle cache
    findDatasetPath(cacheDir, datasetName) {
        const datasetParts = datasetName.split('/');
        const expectedPath = path.join(cacheDir, ...datasetParts, 'versions');

        if (fs.existsSync(expectedPath)) {
            const versions = fs.readdirSync(expectedPath);
            if (versions.length > 0) {
                return path.join(expectedPath, versions[versions.length - 1]); // Use latest version
            }
        }

        return null;
    }
}

// Execute if run directly
if (require.main === module) {
    const integration = new KaggleDatasetIntegration();
    integration.run()
        .then((results) => {
            console.log('🎉 Integration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Integration failed:', error.message);
            process.exit(1);
        });
}

module.exports = { KaggleDatasetIntegration, EnhancedImageProcessor };