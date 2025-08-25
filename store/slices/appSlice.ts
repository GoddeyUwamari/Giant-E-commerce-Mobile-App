import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import asyncStorage, { STORAGE_KEYS } from '../storage/asyncStorage';

// App theme options
export type ThemeMode = 'light' | 'dark' | 'system';

// Language options
export type Language = 'en' | 'es' | 'fr' | 'zh' | 'hi' | 'ar';

// Currency options
export type Currency = 'USD' | 'CAD' | 'MXN' | 'EUR' | 'GBP';

// App status
export type AppStatus = 'idle' | 'loading' | 'error' | 'offline';

// Network connection status
export interface NetworkStatus {
    isConnected: boolean;
    connectionType: 'wifi' | 'cellular' | 'unknown';
    isExpensive: boolean;
}

// App configuration
export interface AppConfig {
    apiUrl: string;
    version: string;
    buildNumber: string;
    environment: 'development' | 'staging' | 'production';
    features: {
        enablePushNotifications: boolean;
        enableBiometrics: boolean;
        enableLocationServices: boolean;
        enableAnalytics: boolean;
        enableCrashReporting: boolean;
        enableDebugMode: boolean;
    };
}

// Notification settings
export interface NotificationSettings {
    push: boolean;
    email: boolean;
    sms: boolean;
    promotions: boolean;
    orderUpdates: boolean;
    stockAlerts: boolean;
    priceDrops: boolean;
    newArrivals: boolean;
}

// Location settings
export interface LocationSettings {
    autoDetect: boolean;
    shareLocation: boolean;
    trackDelivery: boolean;
    storeNotifications: boolean;
}

// Accessibility settings
export interface AccessibilitySettings {
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    voiceOver: boolean;
}

// App state interface
export interface AppState {
    // App status
    status: AppStatus;
    isInitialized: boolean;
    isOnboardingCompleted: boolean;
    isFirstLaunch: boolean;

    // Theme and UI
    theme: ThemeMode;
    isDarkMode: boolean;

    // Localization
    language: Language;
    currency: Currency;
    region: string;

    // Network
    networkStatus: NetworkStatus;
    isOnline: boolean;

    // Configuration
    config: AppConfig;

    // User preferences
    notifications: NotificationSettings;
    location: LocationSettings;
    accessibility: AccessibilitySettings;

    // Error handling
    error: string | null;
    lastError: Date | null;

    // Performance
    performanceMetrics: {
        appStartTime: number;
        lastUpdateCheck: Date | null;
        cacheSize: number;
    };
}

// App actions interface
export interface AppActions {
    // Initialization
    initializeApp: () => Promise<void>;
    completeOnboarding: () => void;
    resetApp: () => Promise<void>;

    // Theme
    setTheme: (theme: ThemeMode) => void;
    toggleDarkMode: () => void;

    // Localization
    setLanguage: (language: Language) => void;
    setCurrency: (currency: Currency) => void;
    setRegion: (region: string) => void;

    // Network
    setNetworkStatus: (status: NetworkStatus) => void;
    setOnlineStatus: (isOnline: boolean) => void;

    // Configuration
    updateConfig: (config: Partial<AppConfig>) => void;
    toggleFeature: (feature: keyof AppConfig['features']) => void;

    // Preferences
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
    updateLocationSettings: (settings: Partial<LocationSettings>) => void;
    updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;

    // Error handling
    setError: (error: string | null) => void;
    clearError: () => void;

    // Performance
    updatePerformanceMetrics: (metrics: Partial<AppState['performanceMetrics']>) => void;

    // Utilities
    checkForUpdates: () => Promise<boolean>;
    clearCache: () => Promise<void>;
    exportSettings: () => Promise<string>;
    importSettings: (settings: string) => Promise<boolean>;
}

// Initial state
const initialState: AppState = {
    // App status
    status: 'idle',
    isInitialized: false,
    isOnboardingCompleted: false,
    isFirstLaunch: true,

    // Theme and UI
    theme: 'system',
    isDarkMode: false,

    // Localization
    language: 'en',
    currency: 'USD',
    region: 'US',

    // Network
    networkStatus: {
        isConnected: true,
        connectionType: 'unknown',
        isExpensive: false,
    },
    isOnline: true,

    // Configuration
    config: {
        apiUrl: 'https://api.walmart.com',
        version: '1.0.0',
        buildNumber: '1',
        environment: 'production',
        features: {
            enablePushNotifications: true,
            enableBiometrics: true,
            enableLocationServices: true,
            enableAnalytics: true,
            enableCrashReporting: true,
            enableDebugMode: false,
        },
    },

    // User preferences
    notifications: {
        push: true,
        email: true,
        sms: false,
        promotions: true,
        orderUpdates: true,
        stockAlerts: true,
        priceDrops: true,
        newArrivals: false,
    },

    location: {
        autoDetect: true,
        shareLocation: true,
        trackDelivery: true,
        storeNotifications: true,
    },

    accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false,
        screenReader: false,
        voiceOver: false,
    },

    // Error handling
    error: null,
    lastError: null,

    // Performance
    performanceMetrics: {
        appStartTime: Date.now(),
        lastUpdateCheck: null,
        cacheSize: 0,
    },
};

// Create the store
export const useAppStore = create<AppState & AppActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,

                // Initialization
                initializeApp: async () => {
                    set((state) => {
                        state.status = 'loading';
                    });

                    try {
                        // Load persisted settings
                        const onboardingCompleted = await asyncStorage.getItem<boolean>(
                            STORAGE_KEYS.ONBOARDING_COMPLETED
                        );
                        const isFirstLaunch = await asyncStorage.getItem<boolean>(
                            STORAGE_KEYS.FIRST_LAUNCH
                        ) ?? true;

                        // Check app version for migrations
                        const lastVersion = await asyncStorage.getItem<string>(
                            STORAGE_KEYS.LAST_APP_VERSION
                        );

                        set((state) => {
                            state.isOnboardingCompleted = onboardingCompleted ?? false;
                            state.isFirstLaunch = isFirstLaunch;
                            state.isInitialized = true;
                            state.status = 'idle';
                            state.performanceMetrics.appStartTime = Date.now();
                        });

                        // Perform migration if needed
                        if (lastVersion && lastVersion !== get().config.version) {
                            await asyncStorage.migrateData(lastVersion, get().config.version);
                        }

                        // Mark first launch as complete
                        if (isFirstLaunch) {
                            await asyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, false);
                        }

                    } catch (error) {
                        console.error('App initialization error:', error);
                        set((state) => {
                            state.status = 'error';
                            state.error = 'Failed to initialize app';
                            state.lastError = new Date();
                        });
                    }
                },

                completeOnboarding: () => {
                    set((state) => {
                        state.isOnboardingCompleted = true;
                    });
                    asyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
                },

                resetApp: async () => {
                    try {
                        await asyncStorage.clear();
                        set(initialState);
                        return Promise.resolve();
                    } catch (error) {
                        console.error('Error resetting app:', error);
                        get().setError('Failed to reset app');
                        return Promise.reject(error);
                    }
                },

                // Theme
                setTheme: (theme: ThemeMode) => {
                    set((state) => {
                        state.theme = theme;
                        // Update dark mode based on theme and system preference
                        if (theme === 'dark') {
                            state.isDarkMode = true;
                        } else if (theme === 'light') {
                            state.isDarkMode = false;
                        }
                        // For 'system', this would be handled by a system listener
                    });
                },

                toggleDarkMode: () => {
                    set((state) => {
                        state.isDarkMode = !state.isDarkMode;
                        state.theme = state.isDarkMode ? 'dark' : 'light';
                    });
                },

                // Localization
                setLanguage: (language: Language) => {
                    set((state) => {
                        state.language = language;
                    });
                },

                setCurrency: (currency: Currency) => {
                    set((state) => {
                        state.currency = currency;
                    });
                },

                setRegion: (region: string) => {
                    set((state) => {
                        state.region = region;
                    });
                },

                // Network
                setNetworkStatus: (networkStatus: NetworkStatus) => {
                    set((state) => {
                        state.networkStatus = networkStatus;
                        state.isOnline = networkStatus.isConnected;
                    });
                },

                setOnlineStatus: (isOnline: boolean) => {
                    set((state) => {
                        state.isOnline = isOnline;
                        state.networkStatus.isConnected = isOnline;
                    });
                },

                // Configuration
                updateConfig: (config: Partial<AppConfig>) => {
                    set((state) => {
                        Object.assign(state.config, config);
                    });
                },

                toggleFeature: (feature: keyof AppConfig['features']) => {
                    set((state) => {
                        state.config.features[feature] = !state.config.features[feature];
                    });
                },

                // Preferences
                updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
                    set((state) => {
                        Object.assign(state.notifications, settings);
                    });
                },

                updateLocationSettings: (settings: Partial<LocationSettings>) => {
                    set((state) => {
                        Object.assign(state.location, settings);
                    });
                },

                updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => {
                    set((state) => {
                        Object.assign(state.accessibility, settings);
                    });
                },

                // Error handling
                setError: (error: string | null) => {
                    set((state) => {
                        state.error = error;
                        state.lastError = error ? new Date() : null;
                    });
                },

                clearError: () => {
                    set((state) => {
                        state.error = null;
                    });
                },

                // Performance
                updatePerformanceMetrics: (metrics: Partial<AppState['performanceMetrics']>) => {
                    set((state) => {
                        Object.assign(state.performanceMetrics, metrics);
                    });
                },

                // Utilities
                checkForUpdates: async () => {
                    try {
                        // Implementation would check app store or update server
                        const lastCheck = new Date();
                        set((state) => {
                            state.performanceMetrics.lastUpdateCheck = lastCheck;
                        });
                        return false; // No updates available
                    } catch (error) {
                        console.error('Error checking for updates:', error);
                        return false;
                    }
                },

                clearCache: async () => {
                    try {
                        // Clear app cache
                        set((state) => {
                            state.performanceMetrics.cacheSize = 0;
                        });
                    } catch (error) {
                        console.error('Error clearing cache:', error);
                        get().setError('Failed to clear cache');
                    }
                },

                exportSettings: async () => {
                    try {
                        const settings = {
                            theme: get().theme,
                            language: get().language,
                            currency: get().currency,
                            notifications: get().notifications,
                            location: get().location,
                            accessibility: get().accessibility,
                        };
                        return JSON.stringify(settings, null, 2);
                    } catch (error) {
                        console.error('Error exporting settings:', error);
                        throw new Error('Failed to export settings');
                    }
                },

                importSettings: async (settingsJson: string) => {
                    try {
                        const settings = JSON.parse(settingsJson);

                        set((state) => {
                            if (settings.theme) state.theme = settings.theme;
                            if (settings.language) state.language = settings.language;
                            if (settings.currency) state.currency = settings.currency;
                            if (settings.notifications) Object.assign(state.notifications, settings.notifications);
                            if (settings.location) Object.assign(state.location, settings.location);
                            if (settings.accessibility) Object.assign(state.accessibility, settings.accessibility);
                        });

                        return true;
                    } catch (error) {
                        console.error('Error importing settings:', error);
                        get().setError('Failed to import settings');
                        return false;
                    }
                },
            })),
            {
                name: 'walmart-app-store',
                storage: {
                    getItem: (name) => asyncStorage.getItem(name as any),
                    setItem: (name, value) => asyncStorage.setItem(name as any, value),
                    removeItem: (name) => asyncStorage.removeItem(name as any),
                },
                partialize: (state) => ({
                    // Only persist certain parts of the state
                    theme: state.theme,
                    language: state.language,
                    currency: state.currency,
                    region: state.region,
                    notifications: state.notifications,
                    location: state.location,
                    accessibility: state.accessibility,
                    isOnboardingCompleted: state.isOnboardingCompleted,
                    config: state.config,
                }),
            }
        ),
        {
            name: 'app-store',
        }
    )
);

// Selectors for common use cases
export const useAppTheme = () => useAppStore((state) => ({
    theme: state.theme,
    isDarkMode: state.isDarkMode,
    setTheme: state.setTheme,
    toggleDarkMode: state.toggleDarkMode,
}));

export const useAppLocalization = () => useAppStore((state) => ({
    language: state.language,
    currency: state.currency,
    region: state.region,
    setLanguage: state.setLanguage,
    setCurrency: state.setCurrency,
    setRegion: state.setRegion,
}));

export const useAppNetwork = () => useAppStore((state) => ({
    networkStatus: state.networkStatus,
    isOnline: state.isOnline,
    setNetworkStatus: state.setNetworkStatus,
    setOnlineStatus: state.setOnlineStatus,
}));

export const useAppError = () => useAppStore((state) => ({
    error: state.error,
    lastError: state.lastError,
    setError: state.setError,
    clearError: state.clearError,
}));

export const useAppSettings = () => useAppStore((state) => ({
    notifications: state.notifications,
    location: state.location,
    accessibility: state.accessibility,
    updateNotificationSettings: state.updateNotificationSettings,
    updateLocationSettings: state.updateLocationSettings,
    updateAccessibilitySettings: state.updateAccessibilitySettings,
}));