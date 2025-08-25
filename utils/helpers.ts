import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, UI_CONSTANTS } from './constants';

// Debounce function for search and API calls
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Throttle function for scroll events and frequent actions
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Deep clone function for objects
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
        const clonedObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj as T;
    }

    return obj;
};

// Deep merge function for combining objects
export const deepMerge = <T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
): T => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {} as any;
                }
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key] as any;
            }
        }
    }

    return deepMerge(target, ...sources);
};

// Generate unique ID
export const generateId = (prefix: string = ''): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

// Generate UUID v4
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Sleep/delay function
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function with exponential backoff
export const retry = async <T>(
    fn: () => Promise<T>,
    options: {
        attempts?: number;
        delay?: number;
        backoff?: number;
        shouldRetry?: (error: any, attempt: number) => boolean;
    } = {}
): Promise<T> => {
    const {
        attempts = 3,
        delay = 1000,
        backoff = 2,
        shouldRetry = () => true
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === attempts || !shouldRetry(error, attempt)) {
                throw error;
            }

            const waitTime = delay * Math.pow(backoff, attempt - 1);
            await sleep(waitTime);
        }
    }

    throw lastError;
};

// Array utilities
export const arrayUtils = {
    // Remove duplicates from array
    unique: <T>(array: T[]): T[] => [...new Set(array)],

    // Remove duplicates by key
    uniqueBy: <T>(array: T[], key: keyof T): T[] => {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    // Group array by key
    groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
        return array.reduce((groups, item) => {
            const groupKey = String(item[key]);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {} as Record<string, T[]>);
    },

    // Sort array by key
    sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    // Chunk array into smaller arrays
    chunk: <T>(array: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    // Shuffle array randomly
    shuffle: <T>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Get random item from array
    random: <T>(array: T[]): T | undefined => {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Move item in array
    move: <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
        const result = [...array];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        return result;
    },
};

// Object utilities
export const objectUtils = {
    // Pick specific keys from object
    pick: <T extends Record<string, any>, K extends keyof T>(
        obj: T,
        keys: K[]
    ): Pick<T, K> => {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    },

    // Omit specific keys from object
    omit: <T extends Record<string, any>, K extends keyof T>(
        obj: T,
        keys: K[]
    ): Omit<T, K> => {
        const result = { ...obj };
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    },

    // Check if object is empty
    isEmpty: (obj: Record<string, any>): boolean => {
        return Object.keys(obj).length === 0;
    },

    // Get nested property safely
    get: (obj: any, path: string, defaultValue?: any): any => {
        const keys = path.split('.');
        let result = obj;

        for (const key of keys) {
            if (result == null || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[key];
        }

        return result !== undefined ? result : defaultValue;
    },

    // Set nested property
    set: (obj: any, path: string, value: any): void => {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    },

    // Flatten nested object
    flatten: (obj: Record<string, any>, prefix: string = ''): Record<string, any> => {
        const flattened: Record<string, any> = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = prefix ? `${prefix}.${key}` : key;

                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    Object.assign(flattened, objectUtils.flatten(obj[key], newKey));
                } else {
                    flattened[newKey] = obj[key];
                }
            }
        }

        return flattened;
    },
};

// String utilities
export const stringUtils = {
    // Convert to camelCase
    toCamelCase: (str: string): string => {
        return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
    },

    // Convert to kebab-case
    toKebabCase: (str: string): string => {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '');
    },

    // Convert to snake_case
    toSnakeCase: (str: string): string => {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
    },

    // Generate slug
    toSlug: (str: string): string => {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Escape HTML
    escapeHtml: (str: string): string => {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
        };
        return str.replace(/[&<>"']/g, char => map[char]);
    },

    // Remove HTML tags
    stripHtml: (str: string): string => {
        return str.replace(/<[^>]*>/g, '');
    },

    // Extract initials
    getInitials: (name: string, maxLength: number = 2): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, maxLength)
            .join('');
    },

    // Mask sensitive data
    mask: (str: string, options: {
        start?: number;
        end?: number;
        char?: string;
    } = {}): string => {
        const { start = 0, end = 4, char = '*' } = options;
        if (str.length <= start + end) return str;

        const masked = char.repeat(str.length - start - end);
        return str.slice(0, start) + masked + str.slice(-end);
    },
};

// Storage utilities
export const storageUtils = {
    // Set item with expiration
    setWithExpiry: async (key: string, value: any, ttl: number): Promise<void> => {
        const item = {
            value,
            expiry: Date.now() + ttl,
        };
        await AsyncStorage.setItem(key, JSON.stringify(item));
    },

    // Get item with expiration check
    getWithExpiry: async <T>(key: string): Promise<T | null> => {
        try {
            const itemStr = await AsyncStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);

            if (Date.now() > item.expiry) {
                await AsyncStorage.removeItem(key);
                return null;
            }

            return item.value;
        } catch {
            return null;
        }
    },

    // Clear expired items
    clearExpired: async (): Promise<void> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            const expiredKeys: string[] = [];

            items.forEach(([key, value]) => {
                if (value) {
                    try {
                        const item = JSON.parse(value);
                        if (item.expiry && Date.now() > item.expiry) {
                            expiredKeys.push(key);
                        }
                    } catch {
                        // Invalid JSON, ignore
                    }
                }
            });

            if (expiredKeys.length > 0) {
                await AsyncStorage.multiRemove(expiredKeys);
            }
        } catch (error) {
            console.error('Error clearing expired storage items:', error);
        }
    },

    // Get storage size
    getStorageSize: async (): Promise<{ used: number; total: number }> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);

            let totalSize = 0;
            items.forEach(([key, value]) => {
                totalSize += key.length + (value?.length || 0);
            });

            // Rough estimate of total available storage (6MB typical limit)
            const totalAvailable = 6 * 1024 * 1024;

            return {
                used: totalSize,
                total: totalAvailable,
            };
        } catch {
            return { used: 0, total: 0 };
        }
    },
};

// Device utilities
export const deviceUtils = {
    // Check if device has network
    hasNetwork: (): boolean => {
        // This would typically use NetInfo in a real app
        return navigator.onLine;
    },

    // Get device info
    getDeviceInfo: () => {
        const userAgent = navigator.userAgent;
        return {
            platform: process.env.EXPO_OS || 'unknown',
            isIOS: process.env.EXPO_OS === 'ios',
            isAndroid: process.env.EXPO_OS === 'android',
            isWeb: process.env.EXPO_OS === 'web',
            userAgent,
        };
    },

    // Check if device supports feature
    supportsFeature: (feature: 'camera' | 'location' | 'biometric' | 'push'): boolean => {
        // This would check actual device capabilities in a real app
        switch (feature) {
            case 'camera':
                return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            case 'location':
                return !!navigator.geolocation;
            case 'biometric':
                return process.env.EXPO_OS === 'ios' || process.env.EXPO_OS === 'android';
            case 'push':
                return 'serviceWorker' in navigator && 'PushManager' in window;
            default:
                return false;
        }
    },

    // Get screen dimensions
    getScreenDimensions: () => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
        };
    },
};

// Math utilities
export const mathUtils = {
    // Clamp value between min and max
    clamp: (value: number, min: number, max: number): number => {
        return Math.min(Math.max(value, min), max);
    },

    // Linear interpolation
    lerp: (start: number, end: number, factor: number): number => {
        return start + (end - start) * factor;
    },

    // Map value from one range to another
    mapRange: (
        value: number,
        fromMin: number,
        fromMax: number,
        toMin: number,
        toMax: number
    ): number => {
        const factor = (value - fromMin) / (fromMax - fromMin);
        return mathUtils.lerp(toMin, toMax, factor);
    },

    // Round to specific decimal places
    roundTo: (value: number, decimals: number): number => {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    },

    // Calculate percentage
    percentage: (value: number, total: number): number => {
        return total === 0 ? 0 : (value / total) * 100;
    },

    // Calculate distance between two points
    distance: (x1: number, y1: number, x2: number, y2: number): number => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    // Generate random number in range
    randomInRange: (min: number, max: number): number => {
        return Math.random() * (max - min) + min;
    },

    // Calculate average
    average: (numbers: number[]): number => {
        return numbers.length === 0 ? 0 : numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    },
};

// URL utilities
export const urlUtils = {
    // Build URL with query parameters
    buildUrl: (baseUrl: string, params: Record<string, any> = {}): string => {
        const url = new URL(baseUrl);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });

        return url.toString();
    },

    // Parse query parameters
    parseQuery: (queryString: string): Record<string, string> => {
        const params = new URLSearchParams(queryString);
        const result: Record<string, string> = {};

        params.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    },

    // Extract domain from URL
    getDomain: (url: string): string => {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    },

    // Check if URL is valid
    isValidUrl: (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
};

// Color utilities
export const colorUtils = {
    // Convert hex to RGB
    hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    },

    // Convert RGB to hex
    rgbToHex: (r: number, g: number, b: number): string => {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    },

    // Get contrasting color (black or white)
    getContrastColor: (hex: string): string => {
        const rgb = colorUtils.hexToRgb(hex);
        if (!rgb) return '#000000';

        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    },

    // Add opacity to hex color
    addOpacity: (hex: string, opacity: number): string => {
        const rgb = colorUtils.hexToRgb(hex);
        if (!rgb) return hex;

        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${mathUtils.clamp(opacity, 0, 1)})`;
    },
};

// Date utilities
export const dateUtils = {
    // Check if date is today
    isToday: (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    // Check if date is this week
    isThisWeek: (date: Date): boolean => {
        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date > oneWeekAgo && date <= today;
    },

    // Add days to date
    addDays: (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // Get start of day
    startOfDay: (date: Date): Date => {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    },

    // Get end of day
    endOfDay: (date: Date): Date => {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    },

    // Get days between dates
    daysBetween: (date1: Date, date2: Date): number => {
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    },
};

// Performance utilities
export const performanceUtils = {
    // Measure execution time
    measureTime: async <T>(fn: () => Promise<T> | T, label?: string): Promise<T> => {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();

        if (label) {
            console.log(`${label}: ${end - start}ms`);
        }

        return result;
    },

    // Create performance marker
    mark: (name: string): void => {
        if (performance.mark) {
            performance.mark(name);
        }
    },

    // Measure between markers
    measure: (name: string, startMark: string, endMark?: string): void => {
        if (performance.measure) {
            performance.measure(name, startMark, endMark);
        }
    },
};

// Export all utilities
export default {
    debounce,
    throttle,
    deepClone,
    deepMerge,
    generateId,
    generateUUID,
    sleep,
    retry,
    arrayUtils,
    objectUtils,
    stringUtils,
    storageUtils,
    deviceUtils,
    mathUtils,
    urlUtils,
    colorUtils,
    dateUtils,
    performanceUtils,
};