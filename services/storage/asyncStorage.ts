import AsyncStorage from '@react-native-async-storage/async-storage';

// Import CartItem type from your cart slice
// Adjust the path based on your actual file structure
import type { CartItem } from '../../store/slices/cartSlice';

// Storage keys used throughout the app
export const STORAGE_KEYS = {
    // User preferences
    USER_PREFERENCES: 'user_preferences',
    THEME_PREFERENCE: 'theme_preference',
    LANGUAGE_PREFERENCE: 'language_preference',
    NOTIFICATION_SETTINGS: 'notification_settings',

    // User data
    USER_PROFILE: 'user_profile',
    USER_ADDRESSES: 'user_addresses',
    PAYMENT_METHODS: 'payment_methods',
    RECENT_SEARCHES: 'recent_searches',
    SEARCH_HISTORY: 'search_history',

    // Shopping data
    CART_ITEMS: 'cart_items',
    WISHLIST_ITEMS: 'wishlist_items',
    RECENTLY_VIEWED: 'recently_viewed',
    FAVORITE_STORES: 'favorite_stores',

    // App state
    ONBOARDING_COMPLETED: 'onboarding_completed',
    LAST_APP_VERSION: 'last_app_version',
    FIRST_LAUNCH: 'first_launch',

    // Location data
    SELECTED_STORE: 'selected_store',
    RECENT_STORES: 'recent_stores',
    LOCATION_PERMISSION: 'location_permission',

    // Auth tokens (consider using secure storage for sensitive data)
    REFRESH_TOKEN: 'refresh_token',
    DEVICE_ID: 'device_id',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Generic async storage service with type safety and error handling
 */
class AsyncStorageService {
    /**
     * Store data in AsyncStorage
     */
    async setItem<T>(key: StorageKey, value: T): Promise<boolean> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
            return true;
        } catch (error) {
            console.error(`Error storing data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Retrieve data from AsyncStorage
     */
    async getItem<T>(key: StorageKey): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error(`Error retrieving data for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Remove item from AsyncStorage
     */
    async removeItem(key: StorageKey): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Clear all data from AsyncStorage
     */
    async clear(): Promise<boolean> {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing AsyncStorage:', error);
            return false;
        }
    }

    /**
     * Get multiple items at once
     */
    async getMultiple<T>(keys: StorageKey[]): Promise<Record<string, T | null>> {
        try {
            const keyValuePairs = await AsyncStorage.multiGet(keys);
            const result: Record<string, T | null> = {};

            keyValuePairs.forEach(([key, value]) => {
                try {
                    result[key] = value ? JSON.parse(value) : null;
                } catch (parseError) {
                    console.error(`Error parsing value for key ${key}:`, parseError);
                    result[key] = null;
                }
            });

            return result;
        } catch (error) {
            console.error('Error getting multiple items:', error);
            return {};
        }
    }

    /**
     * Set multiple items at once
     */
    async setMultiple<T>(keyValuePairs: Array<[StorageKey, T]>): Promise<boolean> {
        try {
            const serializedPairs: Array<[string, string]> = keyValuePairs.map(([key, value]) => [
                key,
                JSON.stringify(value),
            ]);

            await AsyncStorage.multiSet(serializedPairs);
            return true;
        } catch (error) {
            console.error('Error setting multiple items:', error);
            return false;
        }
    }

    /**
     * Check if a key exists in storage
     */
    async hasKey(key: StorageKey): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value !== null;
        } catch (error) {
            console.error(`Error checking key ${key}:`, error);
            return false;
        }
    }

    /**
     * Get all keys in storage
     */
    async getAllKeys(): Promise<string[]> {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    /**
     * Get storage usage information
     */
    async getStorageSize(): Promise<{ used: number; total: number } | null> {
        try {
            const keys = await this.getAllKeys();
            const keyValuePairs = await AsyncStorage.multiGet(keys);

            let totalSize = 0;
            keyValuePairs.forEach(([key, value]) => {
                if (value) {
                    totalSize += key.length + value.length;
                }
            });

            // AsyncStorage doesn't have a built-in way to get total capacity
            // This is an estimate based on typical mobile storage limits
            const estimatedTotal = 6 * 1024 * 1024; // 6MB typical limit

            return {
                used: totalSize,
                total: estimatedTotal,
            };
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return null;
        }
    }

    /**
     * Migrate data when app updates
     */
    async migrateData(fromVersion: string, toVersion: string): Promise<boolean> {
        try {
            console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);

            // Add migration logic here based on version changes
            // Example:
            // if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
            //   // Perform specific migration
            // }

            await this.setItem(STORAGE_KEYS.LAST_APP_VERSION, toVersion);
            return true;
        } catch (error) {
            console.error('Error during data migration:', error);
            return false;
        }
    }
}

// Create and export singleton instance
const asyncStorage = new AsyncStorageService();

// Specific helper functions for common operations
export const userPreferences = {
    get: () => asyncStorage.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES),
    set: (prefs: UserPreferences) => asyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, prefs),
};

export const cartItems = {
    get: () => asyncStorage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS),
    set: (items: CartItem[]) => asyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, items),
    clear: () => asyncStorage.removeItem(STORAGE_KEYS.CART_ITEMS),
};

export const recentSearches = {
    get: () => asyncStorage.getItem<string[]>(STORAGE_KEYS.RECENT_SEARCHES),
    set: (searches: string[]) => asyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, searches),
    add: async (search: string) => {
        const current = await asyncStorage.getItem<string[]>(STORAGE_KEYS.RECENT_SEARCHES) || [];
        const updated = [search, ...current.filter(s => s !== search)].slice(0, 10); // Keep last 10
        return asyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, updated);
    },
};

export const favoriteStores = {
    get: () => asyncStorage.getItem<string[]>(STORAGE_KEYS.FAVORITE_STORES),
    set: (stores: string[]) => asyncStorage.setItem(STORAGE_KEYS.FAVORITE_STORES, stores),
    add: async (storeId: string) => {
        const current = await asyncStorage.getItem<string[]>(STORAGE_KEYS.FAVORITE_STORES) || [];
        if (!current.includes(storeId)) {
            return asyncStorage.setItem(STORAGE_KEYS.FAVORITE_STORES, [...current, storeId]);
        }
        return true;
    },
    remove: async (storeId: string) => {
        const current = await asyncStorage.getItem<string[]>(STORAGE_KEYS.FAVORITE_STORES) || [];
        return asyncStorage.setItem(STORAGE_KEYS.FAVORITE_STORES, current.filter(id => id !== storeId));
    },
};

// Type definitions for commonly stored data
interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    notifications: {
        push: boolean;
        email: boolean;
        sms: boolean;
        promotions: boolean;
        orderUpdates: boolean;
    };
    location: {
        autoDetect: boolean;
        shareLocation: boolean;
    };
}

// NOTE: CartItem interface is now imported from cartSlice.js
// Remove the old CartItem interface that was defined here

export default asyncStorage;