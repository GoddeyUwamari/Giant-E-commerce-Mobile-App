// Auto-generated interfaces from enhanced CSV data
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
