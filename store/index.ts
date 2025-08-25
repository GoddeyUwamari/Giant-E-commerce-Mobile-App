// Store slices exports
export * from './appSlice';
export * from './authSlice';
export * from './cartSlice';
export * from './productSlice';
export * from './userSlice';

// Import all stores for unified access
import { useAppStore } from './appSlice';
import { useAuthStore } from './authSlice';
import { useCartStore } from './cartSlice';
import { useProductStore } from './productSlice';
import { useUserStore } from './userSlice';

// Combined store interface for type safety
export interface RootStore {
    app: ReturnType<typeof useAppStore.getState>;
    auth: ReturnType<typeof useAuthStore.getState>;
    cart: ReturnType<typeof useCartStore.getState>;
    product: ReturnType<typeof useProductStore.getState>;
    user: ReturnType<typeof useUserStore.getState>;
}

// Store reset functionality
export const resetAllStores = async () => {
    try {
        // Reset all stores to their initial state
        useAppStore.getState().resetApp();
        useAuthStore.getState().resetAuth();
        useCartStore.getState().clearCart();
        useProductStore.getState().clearCache();
        useUserStore.getState().deleteUserData();

        console.log('All stores reset successfully');
    } catch (error) {
        console.error('Error resetting stores:', error);
        throw error;
    }
};

// Store initialization
export const initializeStores = async () => {
    try {
        // Initialize app store first
        await useAppStore.getState().initializeApp();

        // Check authentication status
        await useAuthStore.getState().checkAuthStatus();

        // Load cart if user is authenticated
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (isAuthenticated) {
            await useCartStore.getState().loadCart();
            await useUserStore.getState().fetchOrderHistory();
            await useUserStore.getState().fetchLoyaltyProgram();
        }

        // Load categories and featured products
        await useProductStore.getState().fetchCategories();
        await useProductStore.getState().fetchTrendingProducts();
        await useProductStore.getState().fetchDealProducts();

        console.log('Stores initialized successfully');
    } catch (error) {
        console.error('Error initializing stores:', error);
        throw error;
    }
};

// Store sync functionality
export const syncAllStores = async () => {
    try {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (isAuthenticated) {
            // Sync cart
            await useCartStore.getState().syncCart();

            // Update user statistics
            await useUserStore.getState().updateStatistics();

            // Validate tokens
            await useAuthStore.getState().validateTokens();
        }

        console.log('Stores synced successfully');
    } catch (error) {
        console.error('Error syncing stores:', error);
        throw error;
    }
};

// Store persistence check
export const checkStorePersistence = () => {
    try {
        const stores = {
            app: useAppStore.persist.hasHydrated(),
            auth: useAuthStore.persist.hasHydrated(),
            cart: useCartStore.persist.hasHydrated(),
            product: useProductStore.persist.hasHydrated(),
            user: useUserStore.persist.hasHydrated(),
        };

        const allHydrated = Object.values(stores).every(Boolean);

        return {
            stores,
            allHydrated,
        };
    } catch (error) {
        console.error('Error checking store persistence:', error);
        return {
            stores: {},
            allHydrated: false,
        };
    }
};

// Store cleanup on logout
export const cleanupOnLogout = async () => {
    try {
        // Clear authentication data
        await useAuthStore.getState().logout();

        // Clear cart
        await useCartStore.getState().clearCart();

        // Clear user-specific product data
        useProductStore.getState().clearSearch();
        useProductStore.getState().clearRecentlyViewed();

        // Reset user store
        await useUserStore.getState().deleteUserData();

        console.log('Cleanup on logout completed');
    } catch (error) {
        console.error('Error during logout cleanup:', error);
        throw error;
    }
};

// Store migration helper
export const migrateStores = async (fromVersion: string, toVersion: string) => {
    try {
        // App store migration
        await useAppStore.getState().initializeApp();

        // Add version-specific migrations here
        if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
            // Example migration logic
            console.log('Migrating from 1.0.0 to 1.1.0');
        }

        console.log(`Store migration from ${fromVersion} to ${toVersion} completed`);
    } catch (error) {
        console.error('Error during store migration:', error);
        throw error;
    }
};

// Debug utilities for development
export const debugStores = () => {
    if (__DEV__) {
        return {
            app: useAppStore.getState(),
            auth: useAuthStore.getState(),
            cart: useCartStore.getState(),
            product: useProductStore.getState(),
            user: useUserStore.getState(),
        };
    }
    return null;
};

// Store subscriptions for debugging
export const subscribeToStores = (callback: (state: RootStore) => void) => {
    const unsubscribeApp = useAppStore.subscribe((state) => {
        callback({
            app: state,
            auth: useAuthStore.getState(),
            cart: useCartStore.getState(),
            product: useProductStore.getState(),
            user: useUserStore.getState(),
        });
    });

    const unsubscribeAuth = useAuthStore.subscribe((state) => {
        callback({
            app: useAppStore.getState(),
            auth: state,
            cart: useCartStore.getState(),
            product: useProductStore.getState(),
            user: useUserStore.getState(),
        });
    });

    const unsubscribeCart = useCartStore.subscribe((state) => {
        callback({
            app: useAppStore.getState(),
            auth: useAuthStore.getState(),
            cart: state,
            product: useProductStore.getState(),
            user: useUserStore.getState(),
        });
    });

    const unsubscribeProduct = useProductStore.subscribe((state) => {
        callback({
            app: useAppStore.getState(),
            auth: useAuthStore.getState(),
            cart: useCartStore.getState(),
            product: state,
            user: useUserStore.getState(),
        });
    });

    const unsubscribeUser = useUserStore.subscribe((state) => {
        callback({
            app: useAppStore.getState(),
            auth: useAuthStore.getState(),
            cart: useCartStore.getState(),
            product: useProductStore.getState(),
            user: state,
        });
    });

    // Return cleanup function
    return () => {
        unsubscribeApp();
        unsubscribeAuth();
        unsubscribeCart();
        unsubscribeProduct();
        unsubscribeUser();
    };
};

// Store health check
export const checkStoreHealth = () => {
    try {
        const health = {
            app: {
                initialized: useAppStore.getState().isInitialized,
                error: useAppStore.getState().error,
                status: 'healthy',
            },
            auth: {
                authenticated: useAuthStore.getState().isAuthenticated,
                error: useAuthStore.getState().error,
                status: 'healthy',
            },
            cart: {
                itemCount: useCartStore.getState().summary.itemCount,
                error: useCartStore.getState().error,
                status: 'healthy',
            },
            product: {
                cacheSize: Object.keys(useProductStore.getState().productCache).length,
                error: useProductStore.getState().error,
                status: 'healthy',
            },
            user: {
                profileComplete: useUserStore.getState().validateProfile(),
                error: useUserStore.getState().error,
                status: 'healthy',
            },
        };

        // Mark stores with errors as unhealthy
        Object.keys(health).forEach(key => {
            const store = health[key as keyof typeof health];
            if (store.error) {
                store.status = 'unhealthy';
            }
        });

        const overallHealth = Object.values(health).every(store => store.status === 'healthy');

        return {
            overall: overallHealth ? 'healthy' : 'unhealthy',
            stores: health,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error checking store health:', error);
        return {
            overall: 'error',
            stores: {},
            timestamp: new Date().toISOString(),
            error: error.message,
        };
    }
};

// Performance monitoring
export const monitorStorePerformance = () => {
    const performance = {
        app: {
            initTime: useAppStore.getState().performanceMetrics.appStartTime,
            lastSync: useAppStore.getState().performanceMetrics.lastUpdateCheck,
        },
        cart: {
            lastSync: useCartStore.getState().lastSyncedAt,
            itemCount: useCartStore.getState().summary.itemCount,
        },
        product: {
            cacheSize: Object.keys(useProductStore.getState().productCache).length,
            recentlyViewedCount: useProductStore.getState().recentlyViewed.length,
        },
        user: {
            sessionCount: useUserStore.getState().sessionCount,
            lastActive: useUserStore.getState().lastActiveAt,
        },
    };

    return performance;
};

// Error recovery
export const recoverFromErrors = async () => {
    try {
        const stores = ['app', 'auth', 'cart', 'product', 'user'] as const;

        for (const storeName of stores) {
            let store;
            switch (storeName) {
                case 'app':
                    store = useAppStore.getState();
                    break;
                case 'auth':
                    store = useAuthStore.getState();
                    break;
                case 'cart':
                    store = useCartStore.getState();
                    break;
                case 'product':
                    store = useProductStore.getState();
                    break;
                case 'user':
                    store = useUserStore.getState();
                    break;
            }

            if (store.error) {
                console.log(`Recovering ${storeName} store from error:`, store.error);
                store.clearError();

                // Store-specific recovery logic
                if (storeName === 'cart' && store.items?.length > 0) {
                    await store.validateCart();
                }

                if (storeName === 'auth' && store.isAuthenticated) {
                    await store.validateTokens();
                }
            }
        }

        console.log('Error recovery completed');
    } catch (error) {
        console.error('Error during recovery:', error);
        throw error;
    }
};

// Store configuration
export const storeConfig = {
    // Persistence settings
    persistence: {
        version: 1,
        migrate: migrateStores,
        blacklist: ['error', 'isLoading', 'currentProductLoading'],
    },

    // Development settings
    development: {
        devtools: __DEV__,
        logging: __DEV__,
        errorBoundary: true,
    },

    // Performance settings
    performance: {
        debounceTime: 300,
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        maxCacheSize: 100,
    },

    // Sync settings
    sync: {
        interval: 5 * 60 * 1000, // 5 minutes
        retryAttempts: 3,
        retryDelay: 1000,
    },
};

// Store middleware
export const storeMiddleware = {
    // Logging middleware
    logger: (storeName: string) => (config: any) => (set: any, get: any) =>
        config(
            (...args: any[]) => {
                if (__DEV__) {
                    console.log(`[${storeName}] State update:`, args);
                }
                set(...args);
            },
            get
        ),

    // Error boundary middleware
    errorBoundary: (storeName: string) => (config: any) => (set: any, get: any) =>
        config(
            (...args: any[]) => {
                try {
                    set(...args);
                } catch (error) {
                    console.error(`[${storeName}] Store error:`, error);
                    // Reset to safe state or handle error
                }
            },
            get
        ),

    // Performance middleware
    performance: (storeName: string) => (config: any) => (set: any, get: any) => {
        const startTime = performance.now();
        const result = config(set, get);
        const endTime = performance.now();

        if (__DEV__ && endTime - startTime > 10) {
            console.warn(`[${storeName}] Slow store operation: ${endTime - startTime}ms`);
        }

        return result;
    },
};

// Default export for easy importing
export default {
    // Stores
    useAppStore,
    useAuthStore,
    useCartStore,
    useProductStore,
    useUserStore,

    // Utilities
    initializeStores,
    syncAllStores,
    resetAllStores,
    cleanupOnLogout,
    checkStoreHealth,
    monitorStorePerformance,
    recoverFromErrors,

    // Configuration
    storeConfig,
    storeMiddleware,

    // Debug utilities
    debugStores,
    subscribeToStores,
    checkStorePersistence,
};