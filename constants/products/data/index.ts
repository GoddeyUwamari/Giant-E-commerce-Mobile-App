// Auto-generated index for all categories
export * from './electronics';
export * from './appliances';
export * from './home-kitchen';
export * from './automotive';
export * from './sports-fitness';
export * from './grocery';
export * from './fashion';
export * from './beauty-grooming';
export * from './baby-products';
export * from './pet-supplies';
export * from './bags-luggage';
export * from './cameras';
export * from './interfaces';

import { Product, Category } from './interfaces';
import { ELECTRONICS_PRODUCTS, ELECTRONICS_CATEGORY } from './electronics';
import { APPLIANCES_PRODUCTS, APPLIANCES_CATEGORY } from './appliances';
import { HOME_KITCHEN_PRODUCTS, HOME_KITCHEN_CATEGORY } from './home-kitchen';
import { AUTOMOTIVE_PRODUCTS, AUTOMOTIVE_CATEGORY } from './automotive';
import { SPORTS_FITNESS_PRODUCTS, SPORTS_FITNESS_CATEGORY } from './sports-fitness';
import { GROCERY_PRODUCTS, GROCERY_CATEGORY } from './grocery';
import { FASHION_PRODUCTS, FASHION_CATEGORY } from './fashion';
import { BEAUTY_GROOMING_PRODUCTS, BEAUTY_GROOMING_CATEGORY } from './beauty-grooming';
import { BABY_PRODUCTS_PRODUCTS, BABY_PRODUCTS_CATEGORY } from './baby-products';
import { PET_SUPPLIES_PRODUCTS, PET_SUPPLIES_CATEGORY } from './pet-supplies';
import { BAGS_LUGGAGE_PRODUCTS, BAGS_LUGGAGE_CATEGORY } from './bags-luggage';
import { CAMERAS_PRODUCTS, CAMERAS_CATEGORY } from './cameras';

export const ALL_PRODUCTS: Product[] = [
  ...ELECTRONICS_PRODUCTS,
  ...APPLIANCES_PRODUCTS,
  ...HOME_KITCHEN_PRODUCTS,
  ...AUTOMOTIVE_PRODUCTS,
  ...SPORTS_FITNESS_PRODUCTS,
  ...GROCERY_PRODUCTS,
  ...FASHION_PRODUCTS,
  ...BEAUTY_GROOMING_PRODUCTS,
  ...BABY_PRODUCTS_PRODUCTS,
  ...PET_SUPPLIES_PRODUCTS,
  ...BAGS_LUGGAGE_PRODUCTS,
  ...CAMERAS_PRODUCTS,
];

export const ALL_CATEGORIES: Category[] = [
  ELECTRONICS_CATEGORY,
  APPLIANCES_CATEGORY,
  HOME_KITCHEN_CATEGORY,
  AUTOMOTIVE_CATEGORY,
  SPORTS_FITNESS_CATEGORY,
  GROCERY_CATEGORY,
  FASHION_CATEGORY,
  BEAUTY_GROOMING_CATEGORY,
  BABY_PRODUCTS_CATEGORY,
  PET_SUPPLIES_CATEGORY,
  BAGS_LUGGAGE_CATEGORY,
  CAMERAS_CATEGORY,
];

export const getProductsByCategory = (categorySlug: string): Product[] => {
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
