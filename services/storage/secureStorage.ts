import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Secure storage keys for sensitive data
export const SECURE_KEYS = {
    // Authentication tokens
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    ID_TOKEN: 'id_token',

    // User credentials
    BIOMETRIC_TOKEN: 'biometric_token',
    PIN_HASH: 'pin_hash',

    // Payment information
    PAYMENT_TOKEN: 'payment_token',
    STRIPE_CUSTOMER_ID: 'stripe_customer_id',

    // Personal data
    SSN_ENCRYPTED: 'ssn_encrypted',
    CREDIT_CARD_TOKENS: 'credit_card_tokens',

    // Device security
    DEVICE_FINGERPRINT: 'device_fingerprint',
    ENCRYPTION_KEY: 'encryption_key',

    // API keys
    FIREBASE_TOKEN: 'firebase_token',
    ANALYTICS_ID: 'analytics_id',
} as const;

export type SecureKey = typeof SECURE_KEYS[keyof typeof SECURE_KEYS];

// Security options for SecureStore
interface SecureStoreOptions {
    requireAuthentication?: boolean;
    authenticationPrompt?: string;
    keychainService?: string;
    touchID?: boolean;
    showModal?: boolean;
}

/**
 * Secure storage service for sensitive data using Expo SecureStore
 */
class SecureStorageService {
    private readonly defaultOptions: SecureStoreOptions = {
        requireAuthentication: false,
        authenticationPrompt: 'Authenticate to access your secure data',
        keychainService: 'walmart-mobile-app',
        touchID: true,
        showModal: true,
    };

    /**
     * Store sensitive data securely
     */
    async setItem(
        key: SecureKey,
        value: string,
        options: SecureStoreOptions = {}
    ): Promise<boolean> {
        try {
            const secureOptions = { ...this.defaultOptions, ...options };

            await SecureStore.setItemAsync(key, value, {
                requireAuthentication: secureOptions.requireAuthentication,
                authenticationPrompt: secureOptions.authenticationPrompt,
                keychainService: secureOptions.keychainService,
            });

            return true;
        } catch (error) {
            console.error(`Error storing secure data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Retrieve sensitive data securely
     */
    async getItem(
        key: SecureKey,
        options: SecureStoreOptions = {}
    ): Promise<string | null> {
        try {
            const secureOptions = { ...this.defaultOptions, ...options };

            const value = await SecureStore.getItemAsync(key, {
                requireAuthentication: secureOptions.requireAuthentication,
                authenticationPrompt: secureOptions.authenticationPrompt,
                keychainService: secureOptions.keychainService,
            });

            return value;
        } catch (error) {
            console.error(`Error retrieving secure data for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Remove sensitive data
     */
    async removeItem(
        key: SecureKey,
        options: SecureStoreOptions = {}
    ): Promise<boolean> {
        try {
            const secureOptions = { ...this.defaultOptions, ...options };

            await SecureStore.deleteItemAsync(key, {
                requireAuthentication: secureOptions.requireAuthentication,
                authenticationPrompt: secureOptions.authenticationPrompt,
                keychainService: secureOptions.keychainService,
            });

            return true;
        } catch (error) {
            console.error(`Error removing secure data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Check if secure key exists
     */
    async hasKey(key: SecureKey): Promise<boolean> {
        try {
            const value = await this.getItem(key);
            return value !== null;
        } catch (error) {
            console.error(`Error checking secure key ${key}:`, error);
            return false;
        }
    }

    /**
     * Store JSON object securely
     */
    async setObject<T>(
        key: SecureKey,
        value: T,
        options: SecureStoreOptions = {}
    ): Promise<boolean> {
        try {
            const jsonValue = JSON.stringify(value);
            return await this.setItem(key, jsonValue, options);
        } catch (error) {
            console.error(`Error storing secure object for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Retrieve JSON object securely
     */
    async getObject<T>(
        key: SecureKey,
        options: SecureStoreOptions = {}
    ): Promise<T | null> {
        try {
            const jsonValue = await this.getItem(key, options);
            return jsonValue ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error(`Error retrieving secure object for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Encrypt data before storing
     */
    async setEncrypted(
        key: SecureKey,
        value: string,
        encryptionKey?: string,
        options: SecureStoreOptions = {}
    ): Promise<boolean> {
        try {
            const keyToUse = encryptionKey || await this.getOrCreateEncryptionKey();
            const encrypted = await this.encrypt(value, keyToUse);
            return await this.setItem(key, encrypted, options);
        } catch (error) {
            console.error(`Error storing encrypted data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Decrypt data after retrieving
     */
    async getDecrypted(
        key: SecureKey,
        encryptionKey?: string,
        options: SecureStoreOptions = {}
    ): Promise<string | null> {
        try {
            const encrypted = await this.getItem(key, options);
            if (!encrypted) return null;

            const keyToUse = encryptionKey || await this.getOrCreateEncryptionKey();
            return await this.decrypt(encrypted, keyToUse);
        } catch (error) {
            console.error(`Error retrieving decrypted data for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Clear all secure storage data
     */
    async clearAll(): Promise<boolean> {
        try {
            const keys = Object.values(SECURE_KEYS);
            const promises = keys.map(key => this.removeItem(key));
            await Promise.allSettled(promises);
            return true;
        } catch (error) {
            console.error('Error clearing all secure storage:', error);
            return false;
        }
    }

    /**
     * Generate or retrieve encryption key
     */
    private async getOrCreateEncryptionKey(): Promise<string> {
        try {
            let key = await this.getItem(SECURE_KEYS.ENCRYPTION_KEY);

            if (!key) {
                // Generate a new encryption key
                key = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    `${Date.now()}-${Math.random()}-walmart-mobile`,
                    { encoding: Crypto.CryptoEncoding.HEX }
                );

                await this.setItem(SECURE_KEYS.ENCRYPTION_KEY, key);
            }

            return key;
        } catch (error) {
            console.error('Error managing encryption key:', error);
            throw new Error('Failed to manage encryption key');
        }
    }

    /**
     * Simple encryption using base64 and XOR (for demonstration - consider stronger encryption for production)
     */
    private async encrypt(data: string, key: string): Promise<string> {
        try {
            // In production, use a proper encryption library like crypto-js
            const keyBytes = new TextEncoder().encode(key.slice(0, 32));
            const dataBytes = new TextEncoder().encode(data);

            const encrypted = dataBytes.map((byte, index) =>
                byte ^ keyBytes[index % keyBytes.length]
            );

            return btoa(String.fromCharCode(...encrypted));
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Simple decryption
     */
    private async decrypt(encryptedData: string, key: string): Promise<string> {
        try {
            const keyBytes = new TextEncoder().encode(key.slice(0, 32));
            const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

            const decrypted = encryptedBytes.map((byte, index) =>
                byte ^ keyBytes[index % keyBytes.length]
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Generate device fingerprint for security
     */
    async generateDeviceFingerprint(): Promise<string> {
        try {
            const timestamp = Date.now().toString();
            const random = Math.random().toString();
            const fingerprint = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                `${timestamp}-${random}`,
                { encoding: Crypto.CryptoEncoding.HEX }
            );

            await this.setItem(SECURE_KEYS.DEVICE_FINGERPRINT, fingerprint);
            return fingerprint;
        } catch (error) {
            console.error('Error generating device fingerprint:', error);
            throw new Error('Failed to generate device fingerprint');
        }
    }

    /**
     * Validate token expiration
     */
    async isTokenValid(key: SecureKey): Promise<boolean> {
        try {
            const token = await this.getItem(key);
            if (!token) return false;

            // Basic JWT token validation (decode payload without verification)
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);

            return payload.exp && payload.exp > now;
        } catch (error) {
            console.error(`Error validating token for key ${key}:`, error);
            return false;
        }
    }
}

// Create and export singleton instance
const secureStorage = new SecureStorageService();

// Specific helper functions for common secure operations
export const authTokens = {
    setAccess: (token: string) =>
        secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, token),
    getAccess: () =>
        secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN),
    setRefresh: (token: string) =>
        secureStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, token),
    getRefresh: () =>
        secureStorage.getItem(SECURE_KEYS.REFRESH_TOKEN),
    clearAll: async () => {
        await secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN);
        await secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN);
        await secureStorage.removeItem(SECURE_KEYS.ID_TOKEN);
    },
    isAccessTokenValid: () =>
        secureStorage.isTokenValid(SECURE_KEYS.ACCESS_TOKEN),
    isRefreshTokenValid: () =>
        secureStorage.isTokenValid(SECURE_KEYS.REFRESH_TOKEN),
};

export const biometricAuth = {
    setToken: (token: string) =>
        secureStorage.setItem(SECURE_KEYS.BIOMETRIC_TOKEN, token, {
            requireAuthentication: true,
            authenticationPrompt: 'Use biometric authentication to access your account'
        }),
    getToken: () =>
        secureStorage.getItem(SECURE_KEYS.BIOMETRIC_TOKEN, {
            requireAuthentication: true,
            authenticationPrompt: 'Use biometric authentication to access your account'
        }),
    clear: () =>
        secureStorage.removeItem(SECURE_KEYS.BIOMETRIC_TOKEN),
};

export const paymentSecurity = {
    setStripeCustomerId: (customerId: string) =>
        secureStorage.setItem(SECURE_KEYS.STRIPE_CUSTOMER_ID, customerId),
    getStripeCustomerId: () =>
        secureStorage.getItem(SECURE_KEYS.STRIPE_CUSTOMER_ID),
    setPaymentToken: (token: string) =>
        secureStorage.setEncrypted(SECURE_KEYS.PAYMENT_TOKEN, token),
    getPaymentToken: () =>
        secureStorage.getDecrypted(SECURE_KEYS.PAYMENT_TOKEN),
    setCreditCardTokens: (tokens: CreditCardToken[]) =>
        secureStorage.setObject(SECURE_KEYS.CREDIT_CARD_TOKENS, tokens),
    getCreditCardTokens: () =>
        secureStorage.getObject<CreditCardToken[]>(SECURE_KEYS.CREDIT_CARD_TOKENS),
};

// Type definitions for secure data
interface CreditCardToken {
    id: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    token: string;
    isDefault: boolean;
    createdAt: string;
}

export default secureStorage;