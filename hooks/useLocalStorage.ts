import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface UseLocalStorageOptions<T> {
    serializer?: {
        serialize: (value: T) => string;
        deserialize: (value: string) => T;
    };
    syncAcrossInstances?: boolean;
    onError?: (error: Error) => void;
    defaultValue?: T;
}

export interface UseLocalStorageReturn<T> {
    value: T | null;
    setValue: (value: T | ((prev: T | null) => T)) => Promise<void>;
    removeValue: () => Promise<void>;
    loading: boolean;
    error: Error | null;
    isStored: boolean;
}

// Default serializer for JSON serialization
const defaultSerializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
};

// Storage event emitter for cross-instance synchronization
class StorageEventEmitter {
    private listeners: Map<string, Set<(value: any) => void>> = new Map();

    subscribe(key: string, callback: (value: any) => void) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(callback);

        return () => {
            const keyListeners = this.listeners.get(key);
            if (keyListeners) {
                keyListeners.delete(callback);
                if (keyListeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

    emit(key: string, value: any) {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(callback => callback(value));
        }
    }
}

const storageEmitter = new StorageEventEmitter();

// Main useLocalStorage hook
export function useLocalStorage<T = any>(
    key: string,
    options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
    const {
        serializer = defaultSerializer,
        syncAcrossInstances = true,
        onError,
        defaultValue,
    } = options;

    const [value, setValue] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isStored, setIsStored] = useState(false);

    const isInitialized = useRef(false);

    // Error handler
    const handleError = useCallback((error: Error) => {
        setError(error);
        onError?.(error);
        console.error(`LocalStorage error for key "${key}":`, error);
    }, [key, onError]);

    // Load value from storage
    const loadValue = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const storedValue = await AsyncStorage.getItem(key);

            if (storedValue !== null) {
                try {
                    const deserializedValue = serializer.deserialize(storedValue);
                    setValue(deserializedValue);
                    setIsStored(true);
                } catch (deserializeError) {
                    handleError(new Error(`Failed to deserialize value for key "${key}": ${deserializeError}`));
                    // If deserialization fails, remove the corrupted data
                    await AsyncStorage.removeItem(key);
                    setValue(defaultValue ?? null);
                    setIsStored(false);
                }
            } else {
                setValue(defaultValue ?? null);
                setIsStored(false);
            }
        } catch (storageError) {
            handleError(new Error(`Failed to load value for key "${key}": ${storageError}`));
            setValue(defaultValue ?? null);
            setIsStored(false);
        } finally {
            setLoading(false);
            isInitialized.current = true;
        }
    }, [key, serializer, defaultValue, handleError]);

    // Set value in storage
    const setStoredValue = useCallback(async (newValue: T | ((prev: T | null) => T)) => {
        try {
            setError(null);

            const valueToStore = typeof newValue === 'function'
                ? (newValue as (prev: T | null) => T)(value)
                : newValue;

            if (valueToStore === null || valueToStore === undefined) {
                await AsyncStorage.removeItem(key);
                setValue(null);
                setIsStored(false);
            } else {
                const serializedValue = serializer.serialize(valueToStore);
                await AsyncStorage.setItem(key, serializedValue);
                setValue(valueToStore);
                setIsStored(true);
            }

            // Emit storage event for cross-instance sync
            if (syncAcrossInstances) {
                storageEmitter.emit(key, valueToStore);
            }
        } catch (storageError) {
            handleError(new Error(`Failed to set value for key "${key}": ${storageError}`));
        }
    }, [key, value, serializer, syncAcrossInstances, handleError]);

    // Remove value from storage
    const removeValue = useCallback(async () => {
        try {
            setError(null);
            await AsyncStorage.removeItem(key);
            setValue(null);
            setIsStored(false);

            // Emit storage event for cross-instance sync
            if (syncAcrossInstances) {
                storageEmitter.emit(key, null);
            }
        } catch (storageError) {
            handleError(new Error(`Failed to remove value for key "${key}": ${storageError}`));
        }
    }, [key, syncAcrossInstances, handleError]);

    // Cross-instance synchronization
    useEffect(() => {
        if (!syncAcrossInstances || !isInitialized.current) return;

        const unsubscribe = storageEmitter.subscribe(key, (newValue) => {
            setValue(newValue);
            setIsStored(newValue !== null && newValue !== undefined);
        });

        return unsubscribe;
    }, [key, syncAcrossInstances]);

    // Initialize on mount
    useEffect(() => {
        loadValue();
    }, [loadValue]);

    return {
        value,
        setValue: setStoredValue,
        removeValue,
        loading,
        error,
        isStored,
    };
}

// Specialized hooks for common data types

// String storage
export function useStringStorage(
    key: string,
    defaultValue?: string,
    options?: Omit<UseLocalStorageOptions<string>, 'serializer' | 'defaultValue'>
): UseLocalStorageReturn<string> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
        serializer: {
            serialize: (value: string) => value,
            deserialize: (value: string) => value,
        },
    });
}

// Number storage
export function useNumberStorage(
    key: string,
    defaultValue?: number,
    options?: Omit<UseLocalStorageOptions<number>, 'serializer' | 'defaultValue'>
): UseLocalStorageReturn<number> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
        serializer: {
            serialize: (value: number) => value.toString(),
            deserialize: (value: string) => {
                const parsed = parseFloat(value);
                if (isNaN(parsed)) {
                    throw new Error(`Invalid number: ${value}`);
                }
                return parsed;
            },
        },
    });
}

// Boolean storage
export function useBooleanStorage(
    key: string,
    defaultValue?: boolean,
    options?: Omit<UseLocalStorageOptions<boolean>, 'serializer' | 'defaultValue'>
): UseLocalStorageReturn<boolean> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
        serializer: {
            serialize: (value: boolean) => value ? 'true' : 'false',
            deserialize: (value: string) => {
                if (value === 'true') return true;
                if (value === 'false') return false;
                throw new Error(`Invalid boolean: ${value}`);
            },
        },
    });
}

// Array storage
export function useArrayStorage<T>(
    key: string,
    defaultValue?: T[],
    options?: Omit<UseLocalStorageOptions<T[]>, 'defaultValue'>
): UseLocalStorageReturn<T[]> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
    });
}

// Object storage
export function useObjectStorage<T extends Record<string, any>>(
    key: string,
    defaultValue?: T,
    options?: Omit<UseLocalStorageOptions<T>, 'defaultValue'>
): UseLocalStorageReturn<T> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
    });
}

// Date storage
export function useDateStorage(
    key: string,
    defaultValue?: Date,
    options?: Omit<UseLocalStorageOptions<Date>, 'serializer' | 'defaultValue'>
): UseLocalStorageReturn<Date> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
        serializer: {
            serialize: (value: Date) => value.toISOString(),
            deserialize: (value: string) => {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error(`Invalid date: ${value}`);
                }
                return date;
            },
        },
    });
}

// Set storage
export function useSetStorage<T>(
    key: string,
    defaultValue?: Set<T>,
    options?: Omit<UseLocalStorageOptions<Set<T>>, 'serializer' | 'defaultValue'>
): UseLocalStorageReturn<Set<T>> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
        serializer: {
            serialize: (value: Set<T>) => JSON.stringify(Array.from(value)),
            deserialize: (value: string) => new Set(JSON.parse(value)),
        },
    });
}

// Map storage
export function useMapStorage<K, V>(
    key: string,
    defaultValue?: Map<K, V>,
    options?: Omit<UseLocalStorageOptions<Map<K, V>>, 'serializer' | 'defaultValue'>
): UseLocalStorageReturn<Map<K, V>> {
    return useLocalStorage(key, {
        ...options,
        defaultValue,
        serializer: {
            serialize: (value: Map<K, V>) => JSON.stringify(Array.from(value.entries())),
            deserialize: (value: string) => new Map(JSON.parse(value)),
        },
    });
}

// Storage utilities
export const storageUtils = {
    // Get all keys
    getAllKeys: async (): Promise<string[]> => {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            console.error('Failed to get all keys:', error);
            return [];
        }
    },

    // Get multiple values
    getMultiple: async (keys: string[]): Promise<Record<string, string | null>> => {
        try {
            const values = await AsyncStorage.multiGet(keys);
            return values.reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, string | null>);
        } catch (error) {
            console.error('Failed to get multiple values:', error);
            return {};
        }
    },

    // Set multiple values
    setMultiple: async (keyValuePairs: [string, string][]): Promise<void> => {
        try {
            await AsyncStorage.multiSet(keyValuePairs);
        } catch (error) {
            console.error('Failed to set multiple values:', error);
            throw error;
        }
    },

    // Remove multiple values
    removeMultiple: async (keys: string[]): Promise<void> => {
        try {
            await AsyncStorage.multiRemove(keys);
        } catch (error) {
            console.error('Failed to remove multiple values:', error);
            throw error;
        }
    },

    // Clear all storage
    clear: async (): Promise<void> => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Failed to clear storage:', error);
            throw error;
        }
    },

    // Get storage size (approximate)
    getStorageSize: async (): Promise<number> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            if (keys.length === 0) return 0;

            const values = await AsyncStorage.multiGet(keys);
            return values.reduce((total, [key, value]) => {
                return total + key.length + (value?.length || 0);
            }, 0);
        } catch (error) {
            console.error('Failed to get storage size:', error);
            return 0;
        }
    },

    // Check if key exists
    hasKey: async (key: string): Promise<boolean> => {
        try {
            const value = await AsyncStorage.getItem(key);
            return value !== null;
        } catch (error) {
            console.error(`Failed to check key existence for "${key}":`, error);
            return false;
        }
    },

    // Merge object with existing stored object
    mergeObject: async (key: string, objectToMerge: Record<string, any>): Promise<void> => {
        try {
            await AsyncStorage.mergeItem(key, JSON.stringify(objectToMerge));
        } catch (error) {
            console.error(`Failed to merge object for key "${key}":`, error);
            throw error;
        }
    },
};

// Storage cleanup utilities
export const storageCleanup = {
    // Remove expired items based on timestamp
    removeExpired: async (prefix: string, maxAge: number): Promise<void> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const prefixedKeys = keys.filter(key => key.startsWith(prefix));
            const now = Date.now();

            for (const key of prefixedKeys) {
                try {
                    const value = await AsyncStorage.getItem(key);
                    if (value) {
                        const data = JSON.parse(value);
                        if (data.timestamp && (now - data.timestamp) > maxAge) {
                            await AsyncStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // If parsing fails, consider it corrupted and remove it
                    await AsyncStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Failed to remove expired items:', error);
        }
    },

    // Remove items by prefix
    removeByPrefix: async (prefix: string): Promise<void> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const prefixedKeys = keys.filter(key => key.startsWith(prefix));
            await AsyncStorage.multiRemove(prefixedKeys);
        } catch (error) {
            console.error(`Failed to remove items with prefix "${prefix}":`, error);
            throw error;
        }
    },

    // Remove oldest items when storage is full
    removeOldest: async (maxItems: number): Promise<void> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            if (keys.length <= maxItems) return;

            // Get all items with timestamps
            const itemsWithTimestamps: { key: string; timestamp: number }[] = [];

            for (const key of keys) {
                try {
                    const value = await AsyncStorage.getItem(key);
                    if (value) {
                        const data = JSON.parse(value);
                        itemsWithTimestamps.push({
                            key,
                            timestamp: data.timestamp || 0,
                        });
                    }
                } catch (error) {
                    // If parsing fails, mark for removal
                    itemsWithTimestamps.push({ key, timestamp: 0 });
                }
            }

            // Sort by timestamp and remove oldest
            itemsWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);
            const itemsToRemove = itemsWithTimestamps.slice(0, keys.length - maxItems);
            const keysToRemove = itemsToRemove.map(item => item.key);

            await AsyncStorage.multiRemove(keysToRemove);
        } catch (error) {
            console.error('Failed to remove oldest items:', error);
            throw error;
        }
    },
};

// Export default hook
export default useLocalStorage;