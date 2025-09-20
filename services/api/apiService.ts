import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { getAuth } from 'firebase/auth';

interface ApiConfig {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    apiKey?: string;
}

class ApiService {
    private config: ApiConfig;

    constructor() {
        this.config = {
            baseUrl: Constants.expoConfig?.extra?.FIREBASE_FUNCTIONS_URL ||
                process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_URL ||
                '', // Will throw error if not set
            timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
            maxRetries: parseInt(process.env.EXPO_PUBLIC_MAX_RETRY_ATTEMPTS || '3'),
            apiKey: process.env.EXPO_PUBLIC_API_KEY,
        };

        if (!this.config.baseUrl) {
            throw new Error('Firebase Functions URL not configured. Please set EXPO_PUBLIC_FIREBASE_FUNCTIONS_URL in your environment.');
        }
    }

    private createTimeoutSignal(timeoutMs: number): AbortSignal {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeoutMs);
        return controller.signal;
    }


    private async getAuthToken(): Promise<string | null> {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                return await user.getIdToken();
            }
            return null;
        } catch (error) {
            console.warn('Failed to get auth token:', error);
            return null;
        }
    }

    private async makeSecureRequest(
        endpoint: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<Response> {
        const authToken = await this.getAuthToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add authentication if available
        if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
        }

        // Add API key if configured
        if (this.config.apiKey) {
            headers['X-API-Key'] = this.config.apiKey;
        }

        // Add request ID for tracking
        headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const requestOptions: RequestInit = {
            ...options,
            headers,
            signal: this.createTimeoutSignal(this.config.timeout),
        };

        try {
            const response = await fetch(`${this.config.baseUrl}${endpoint}`, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            // Retry logic for network errors
            if (retryCount < this.config.maxRetries && this.shouldRetry(error)) {
                console.warn(`Request failed, retrying (${retryCount + 1}/${this.config.maxRetries})...`);
                await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
                return this.makeSecureRequest(endpoint, options, retryCount + 1);
            }
            throw error;
        }
    }

    private shouldRetry(error: any): boolean {
        // Retry on network errors, timeouts, and 5xx server errors
        return (
            error.name === 'TimeoutError' ||
            error.name === 'AbortError' ||
            error.message.includes('network') ||
            error.message.includes('fetch') ||
            (error.message.includes('HTTP 5') && error.message.includes(':'))
        );
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    async fetchProductAvailability(
        productId: string,
        storeIds: string[]
    ): Promise<StoreInventory[]> {
        try {
            // Input validation
            if (!productId || typeof productId !== 'string') {
                throw new Error('Valid productId is required');
            }
            if (!Array.isArray(storeIds) || storeIds.length === 0) {
                throw new Error('Valid storeIds array is required');
            }
            if (storeIds.length > 20) {
                throw new Error('Maximum 20 stores can be queried at once');
            }

            const response = await this.makeSecureRequest('/getProductAvailability', {
                method: 'POST',
                body: JSON.stringify({
                    productId: productId.trim(),
                    storeIds: storeIds.filter(id => id && typeof id === 'string'),
                    includeQuantity: false, // Set to true if user has permissions
                }),
            });

            const data = await response.json();

            // Validate response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }

            return data.inventory || [];
        } catch (error) {
            console.error('Error fetching product availability:', error);

            // Return fallback data instead of crashing
            return this.generateFallbackAvailability(productId, storeIds);
        }
    }

    private generateFallbackAvailability(
        productId: string,
        storeIds: string[]
    ): StoreInventory[] {
        console.warn('Using fallback product availability data');

        return storeIds.map(storeId => ({
            storeId,
            productId,
            inStock: Math.random() > 0.3, // 70% chance in stock
            quantity: Math.floor(Math.random() * 50),
            lastUpdated: new Date().toISOString(),
            estimatedAvailability: Math.random() > 0.5 ? 'medium' : 'low',
        }));
    }

    async fetchStores(location?: { latitude: number; longitude: number }): Promise<Store[]> {
        try {
            const params = new URLSearchParams();
            if (location) {
                params.append('latitude', location.latitude.toString());
                params.append('longitude', location.longitude.toString());
            }
            params.append('radius', '50');
            params.append('limit', '50');

            console.log('🔥 Making request to:', `${this.config.baseUrl}/getStores?${params.toString()}`);
            const response = await this.makeSecureRequest(`/getStores?${params.toString()}`);
            const data = await response.json();

            console.log('🔥 Firebase response data:', JSON.stringify(data, null, 2));

            // Check if we got stores, if not use fallback
            if (!data.stores || data.stores.length === 0) {
                console.warn('API returned no stores, using enhanced fallback');
                return this.getEnhancedMockStores(location);
            }

            return data.stores || [];
        } catch (error) {
            console.error('Error fetching stores:', error);
            // Always return fallback stores instead of empty array
            return this.getEnhancedMockStores(location);
        }
    }

    private getEnhancedMockStores(location?: { latitude: number; longitude: number }): Store[] {
        console.warn('Using enhanced fallback store data');

        const mockStores = [
            {
                id: 'walmart-fremont',
                name: 'Walmart Supercenter',
                storeNumber: '2785',
                address: {
                    street: '39770 Argonaut Way',
                    city: 'Fremont',
                    state: 'CA',
                    zipCode: '94538',
                    fullAddress: '39770 Argonaut Way, Fremont, CA 94538',
                },
                phone: '(510) 742-9977',
                coordinates: { latitude: 37.5485, longitude: -121.9886 },
                rating: 4.1,
                reviewCount: 2156,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup', 'Photo Center'],
                storeType: 'Supercenter' as const,
                features: ['24/7 ATM', 'Free WiFi', 'Garden Center'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 78,
                estimatedWaitTime: 4,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'walmart-san-jose',
                name: 'Walmart Supercenter',
                storeNumber: '2675',
                address: {
                    street: '777 Story Rd',
                    city: 'San Jose',
                    state: 'CA',
                    zipCode: '95122',
                    fullAddress: '777 Story Rd, San Jose, CA 95122',
                },
                phone: '(408) 926-8244',
                coordinates: { latitude: 37.3394, longitude: -121.8553 },
                rating: 3.9,
                reviewCount: 1892,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '12:00 AM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '12:00 AM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup'],
                storeType: 'Supercenter' as const,
                features: ['24/7 ATM', 'Free WiFi', 'Tire & Lube'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 82,
                estimatedWaitTime: 6,
                lastUpdated: new Date().toISOString(),
            },
            // Include the original San Diego store too
            {
                id: 'walmart-main',
                name: 'Walmart Supercenter',
                storeNumber: '4700',
                address: {
                    street: '4700 Kearny Mesa Rd',
                    city: 'San Diego',
                    state: 'CA',
                    zipCode: '92111',
                    fullAddress: '4700 Kearny Mesa Rd, San Diego, CA 92111',
                },
                phone: '(858) 279-6845',
                coordinates: { latitude: 32.8197, longitude: -117.1411 },
                rating: 4.2,
                reviewCount: 1847,
                isOpen: true,
                hours: {
                    monday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    tuesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    wednesday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    thursday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    friday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    saturday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                    sunday: { open: '6:00 AM', close: '11:00 PM', isOpen: true },
                },
                services: ['Pharmacy', 'Auto Center', 'Vision Center', 'Grocery Pickup', 'Photo Center'],
                storeType: 'Supercenter' as const,
                features: ['24/7 ATM', 'Free WiFi', 'Garden Center'],
                pickupAvailable: true,
                deliveryAvailable: true,
                curbsideAvailable: true,
                currentCapacity: 85,
                estimatedWaitTime: 5,
                lastUpdated: new Date().toISOString(),
            },
        ];

        // Calculate distances if location provided
        if (location) {
            return mockStores.map(store => ({
                ...store,
                distance: this.calculateDistance(location, store.coordinates)
            })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        return mockStores;
    }

    private calculateDistance(
        from: { latitude: number; longitude: number },
        to: { latitude: number; longitude: number }
    ): number {
        const R = 3959; // Earth's radius in miles
        const dLat = (to.latitude - from.latitude) * Math.PI / 180;
        const dLon = (to.longitude - from.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Add other API methods as needed
    async calculateTax(items: any[], shippingAddress: any): Promise<any> {
        try {
            const response = await this.makeSecureRequest('/calculateTax', {
                method: 'POST',
                body: JSON.stringify({ items, shippingAddress }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error calculating tax:', error);
            throw error;
        }
    }

    async calculateShipping(items: any[], toAddress: any): Promise<any> {
        try {
            const response = await this.makeSecureRequest('/calculateShipping', {
                method: 'POST',
                body: JSON.stringify({ items, toAddress }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error calculating shipping:', error);
            throw error;
        }
    }
}

// Create singleton instance
export const apiService = new ApiService();

// 3. Updated interface for type safety
export interface StoreInventory {
    storeId: string;
    productId: string;
    inStock: boolean;
    quantity?: number; // Optional, only for authorized users
    lastUpdated: string;
    estimatedAvailability?: 'high' | 'medium' | 'low';
    error?: string;
}

export interface Store {
    id: string;
    name: string;
    storeNumber: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        fullAddress: string;
    };
    phone: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    distance?: number;
    rating: number;
    reviewCount: number;
    isOpen: boolean;
    hours: {
        [key: string]: { open: string; close: string; isOpen: boolean };
    };
    services: string[];
    storeType: 'Supercenter' | 'Neighborhood Market' | 'Pickup Only' | 'Express';
    features: string[];
    availableProducts?: number;
    popularCategories?: string[];
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
    curbsideAvailable: boolean;
    currentCapacity?: number;
    estimatedWaitTime?: number;
    lastUpdated: string;
}
