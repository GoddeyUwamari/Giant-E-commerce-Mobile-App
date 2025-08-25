import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import secureStorage, { authTokens, biometricAuth, SECURE_KEYS } from '../storage/secureStorage';
import asyncStorage, { STORAGE_KEYS } from '../storage/asyncStorage';

// Authentication status
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Authentication methods
export type AuthMethod = 'email' | 'phone' | 'social' | 'biometric' | 'guest';

// Social login providers
export type SocialProvider = 'google' | 'facebook' | 'apple' | 'amazon';

// User roles
export type UserRole = 'customer' | 'employee' | 'manager' | 'admin';

// Account status
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'deactivated';

// User profile information
export interface UserProfile {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    addresses: UserAddress[];
    defaultAddressId?: string;
    role: UserRole;
    accountStatus: AccountStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
}

// User address
export interface UserAddress {
    id: string;
    type: 'home' | 'work' | 'other';
    name: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    latitude?: number;
    longitude?: number;
}

// Authentication tokens
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    idToken?: string;
    expiresAt: number;
    tokenType: 'Bearer';
}

// Login credentials
export interface LoginCredentials {
    email?: string;
    phone?: string;
    password: string;
    rememberMe?: boolean;
}

// Registration data
export interface RegistrationData {
    email?: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    agreeToTerms: boolean;
    subscribeToNewsletter?: boolean;
}

// Social login data
export interface SocialLoginData {
    provider: SocialProvider;
    accessToken: string;
    idToken?: string;
    profile: {
        id: string;
        email: string;
        name: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
}

// Biometric authentication settings
export interface BiometricSettings {
    enabled: boolean;
    supportedTypes: ('fingerprint' | 'face' | 'iris')[];
    enrolledTypes: ('fingerprint' | 'face' | 'iris')[];
    lastUsed?: string;
}

// Security settings
export interface SecuritySettings {
    twoFactorAuth: {
        enabled: boolean;
        method: 'sms' | 'email' | 'authenticator';
        backupCodes: string[];
    };
    loginNotifications: boolean;
    deviceTrust: {
        trustThisDevice: boolean;
        trustedDevices: Array<{
            id: string;
            name: string;
            lastUsed: string;
            trusted: boolean;
        }>;
    };
    sessionTimeout: number; // minutes
}

// Session information
export interface SessionInfo {
    id: string;
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    location?: string;
    userAgent: string;
    startedAt: string;
    lastActiveAt: string;
    expiresAt: string;
}

// Auth state interface
export interface AuthState {
    // Authentication status
    status: AuthStatus;
    isAuthenticated: boolean;
    isLoading: boolean;
    isGuest: boolean;

    // User data
    user: UserProfile | null;
    tokens: AuthTokens | null;
    session: SessionInfo | null;

    // Authentication methods
    authMethod: AuthMethod | null;
    lastLoginMethod: AuthMethod | null;

    // Security
    biometric: BiometricSettings;
    security: SecuritySettings;

    // Error handling
    error: string | null;
    lastError: Date | null;

    // Preferences
    preferences: {
        stayLoggedIn: boolean;
        enableBiometric: boolean;
        requireAuthForPurchase: boolean;
    };
}

// Auth actions interface
export interface AuthActions {
    // Authentication
    login: (credentials: LoginCredentials) => Promise<boolean>;
    loginWithSocial: (data: SocialLoginData) => Promise<boolean>;
    loginWithBiometric: () => Promise<boolean>;
    register: (data: RegistrationData) => Promise<boolean>;
    logout: (allDevices?: boolean) => Promise<void>;

    // Guest mode
    loginAsGuest: () => void;
    convertGuestToUser: (data: RegistrationData) => Promise<boolean>;

    // Token management
    refreshTokens: () => Promise<boolean>;
    validateTokens: () => Promise<boolean>;
    clearTokens: () => Promise<void>;

    // User profile
    updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
    addAddress: (address: Omit<UserAddress, 'id'>) => Promise<boolean>;
    updateAddress: (addressId: string, updates: Partial<UserAddress>) => Promise<boolean>;
    deleteAddress: (addressId: string) => Promise<boolean>;
    setDefaultAddress: (addressId: string) => Promise<boolean>;

    // Security
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    enableTwoFactor: (method: 'sms' | 'email' | 'authenticator') => Promise<boolean>;
    disableTwoFactor: (code: string) => Promise<boolean>;
    setupBiometric: () => Promise<boolean>;
    disableBiometric: () => Promise<boolean>;

    // Session management
    createSession: (sessionInfo: Omit<SessionInfo, 'id'>) => void;
    updateSession: (updates: Partial<SessionInfo>) => void;
    endSession: () => void;

    // Error handling
    setError: (error: string | null) => void;
    clearError: () => void;

    // Utilities
    checkAuthStatus: () => Promise<void>;
    resetAuth: () => void;
    exportUserData: () => Promise<string>;
    deleteAccount: (password: string) => Promise<boolean>;
}

// Initial state
const initialState: AuthState = {
    // Authentication status
    status: 'idle',
    isAuthenticated: false,
    isLoading: false,
    isGuest: false,

    // User data
    user: null,
    tokens: null,
    session: null,

    // Authentication methods
    authMethod: null,
    lastLoginMethod: null,

    // Security
    biometric: {
        enabled: false,
        supportedTypes: [],
        enrolledTypes: [],
    },
    security: {
        twoFactorAuth: {
            enabled: false,
            method: 'sms',
            backupCodes: [],
        },
        loginNotifications: true,
        deviceTrust: {
            trustThisDevice: false,
            trustedDevices: [],
        },
        sessionTimeout: 30, // 30 minutes
    },

    // Error handling
    error: null,
    lastError: null,

    // Preferences
    preferences: {
        stayLoggedIn: false,
        enableBiometric: false,
        requireAuthForPurchase: true,
    },
};

// Create the store
export const useAuthStore = create<AuthState & AuthActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,

                // Authentication
                login: async (credentials: LoginCredentials) => {
                    set((state) => {
                        state.status = 'loading';
                        state.isLoading = true;
                        state.error = null;
                    });

                    try {
                        // Mock API call - replace with actual authentication
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Mock successful response
                        const tokens: AuthTokens = {
                            accessToken: 'mock_access_token',
                            refreshToken: 'mock_refresh_token',
                            expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
                            tokenType: 'Bearer',
                        };

                        const user: UserProfile = {
                            id: 'user_123',
                            email: credentials.email || '',
                            firstName: 'John',
                            lastName: 'Doe',
                            displayName: 'John Doe',
                            addresses: [],
                            role: 'customer',
                            accountStatus: 'active',
                            emailVerified: true,
                            phoneVerified: false,
                            twoFactorEnabled: false,
                            lastLoginAt: new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };

                        // Store tokens securely
                        await authTokens.setAccess(tokens.accessToken);
                        await authTokens.setRefresh(tokens.refreshToken);

                        // Store user data
                        await asyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, user);

                        set((state) => {
                            state.status = 'authenticated';
                            state.isAuthenticated = true;
                            state.isLoading = false;
                            state.user = user;
                            state.tokens = tokens;
                            state.authMethod = 'email';
                            state.lastLoginMethod = 'email';
                            state.isGuest = false;
                        });

                        return true;
                    } catch (error) {
                        console.error('Login error:', error);
                        set((state) => {
                            state.status = 'error';
                            state.isLoading = false;
                            state.error = 'Login failed. Please check your credentials.';
                            state.lastError = new Date();
                        });
                        return false;
                    }
                },

                loginWithSocial: async (data: SocialLoginData) => {
                    set((state) => {
                        state.status = 'loading';
                        state.isLoading = true;
                        state.error = null;
                    });

                    try {
                        // Mock social login implementation
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Similar to regular login but with social method
                        set((state) => {
                            state.status = 'authenticated';
                            state.isAuthenticated = true;
                            state.isLoading = false;
                            state.authMethod = 'social';
                            state.lastLoginMethod = 'social';
                        });

                        return true;
                    } catch (error) {
                        console.error('Social login error:', error);
                        get().setError('Social login failed');
                        return false;
                    }
                },

                loginWithBiometric: async () => {
                    if (!get().biometric.enabled) {
                        get().setError('Biometric authentication not enabled');
                        return false;
                    }

                    try {
                        set((state) => {
                            state.status = 'loading';
                            state.isLoading = true;
                        });

                        const biometricToken = await biometricAuth.getToken();
                        if (!biometricToken) {
                            throw new Error('Biometric authentication failed');
                        }

                        // Validate biometric token and refresh session
                        const success = await get().refreshTokens();
                        if (success) {
                            set((state) => {
                                state.authMethod = 'biometric';
                                state.lastLoginMethod = 'biometric';
                                state.biometric.lastUsed = new Date().toISOString();
                            });
                        }

                        return success;
                    } catch (error) {
                        console.error('Biometric login error:', error);
                        get().setError('Biometric authentication failed');
                        return false;
                    }
                },

                register: async (data: RegistrationData) => {
                    set((state) => {
                        state.status = 'loading';
                        state.isLoading = true;
                        state.error = null;
                    });

                    try {
                        // Mock registration API call
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        // Auto-login after successful registration
                        return await get().login({
                            email: data.email,
                            password: data.password,
                        });
                    } catch (error) {
                        console.error('Registration error:', error);
                        get().setError('Registration failed');
                        return false;
                    }
                },

                logout: async (allDevices = false) => {
                    try {
                        // Clear secure tokens
                        await authTokens.clearAll();
                        await biometricAuth.clear();

                        // Clear user data
                        await asyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

                        // API call to logout (if needed)
                        if (allDevices) {
                            // Mock API call to logout from all devices
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }

                        set((state) => {
                            state.status = 'unauthenticated';
                            state.isAuthenticated = false;
                            state.user = null;
                            state.tokens = null;
                            state.session = null;
                            state.authMethod = null;
                            state.isGuest = false;
                            state.error = null;
                        });
                    } catch (error) {
                        console.error('Logout error:', error);
                        get().setError('Logout failed');
                    }
                },

                // Guest mode
                loginAsGuest: () => {
                    set((state) => {
                        state.status = 'authenticated';
                        state.isAuthenticated = true;
                        state.isGuest = true;
                        state.authMethod = 'guest';
                        state.user = {
                            id: 'guest_' + Date.now(),
                            email: '',
                            firstName: 'Guest',
                            lastName: 'User',
                            displayName: 'Guest User',
                            addresses: [],
                            role: 'customer',
                            accountStatus: 'active',
                            emailVerified: false,
                            phoneVerified: false,
                            twoFactorEnabled: false,
                            lastLoginAt: new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                    });
                },

                convertGuestToUser: async (data: RegistrationData) => {
                    if (!get().isGuest) {
                        get().setError('Not in guest mode');
                        return false;
                    }

                    try {
                        const success = await get().register(data);
                        if (success) {
                            set((state) => {
                                state.isGuest = false;
                            });
                        }
                        return success;
                    } catch (error) {
                        console.error('Guest conversion error:', error);
                        return false;
                    }
                },

                // Token management
                refreshTokens: async () => {
                    try {
                        const refreshToken = await authTokens.getRefresh();
                        if (!refreshToken) {
                            throw new Error('No refresh token available');
                        }

                        // Mock token refresh API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        const newTokens: AuthTokens = {
                            accessToken: 'new_access_token',
                            refreshToken: 'new_refresh_token',
                            expiresAt: Date.now() + (60 * 60 * 1000),
                            tokenType: 'Bearer',
                        };

                        await authTokens.setAccess(newTokens.accessToken);
                        await authTokens.setRefresh(newTokens.refreshToken);

                        set((state) => {
                            state.tokens = newTokens;
                            state.status = 'authenticated';
                            state.isAuthenticated = true;
                        });

                        return true;
                    } catch (error) {
                        console.error('Token refresh error:', error);
                        await get().logout();
                        return false;
                    }
                },

                validateTokens: async () => {
                    try {
                        const isAccessValid = await authTokens.isAccessTokenValid();
                        const isRefreshValid = await authTokens.isRefreshTokenValid();

                        if (!isAccessValid && isRefreshValid) {
                            return await get().refreshTokens();
                        }

                        return isAccessValid;
                    } catch (error) {
                        console.error('Token validation error:', error);
                        return false;
                    }
                },

                clearTokens: async () => {
                    await authTokens.clearAll();
                    set((state) => {
                        state.tokens = null;
                    });
                },

                // User profile
                updateProfile: async (updates: Partial<UserProfile>) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        set((state) => {
                            if (state.user) {
                                Object.assign(state.user, updates);
                                state.user.updatedAt = new Date().toISOString();
                            }
                        });

                        // Update stored profile
                        const currentUser = get().user;
                        if (currentUser) {
                            await asyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, currentUser);
                        }

                        return true;
                    } catch (error) {
                        console.error('Profile update error:', error);
                        get().setError('Failed to update profile');
                        return false;
                    }
                },

                addAddress: async (address: Omit<UserAddress, 'id'>) => {
                    try {
                        const newAddress: UserAddress = {
                            ...address,
                            id: 'addr_' + Date.now(),
                        };

                        set((state) => {
                            if (state.user) {
                                state.user.addresses.push(newAddress);
                                if (newAddress.isDefault) {
                                    // Unset other default addresses
                                    state.user.addresses.forEach(addr => {
                                        if (addr.id !== newAddress.id) {
                                            addr.isDefault = false;
                                        }
                                    });
                                    state.user.defaultAddressId = newAddress.id;
                                }
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Add address error:', error);
                        get().setError('Failed to add address');
                        return false;
                    }
                },

                updateAddress: async (addressId: string, updates: Partial<UserAddress>) => {
                    try {
                        set((state) => {
                            if (state.user) {
                                const addressIndex = state.user.addresses.findIndex(addr => addr.id === addressId);
                                if (addressIndex !== -1) {
                                    Object.assign(state.user.addresses[addressIndex], updates);

                                    if (updates.isDefault) {
                                        // Unset other default addresses
                                        state.user.addresses.forEach((addr, index) => {
                                            if (index !== addressIndex) {
                                                addr.isDefault = false;
                                            }
                                        });
                                        state.user.defaultAddressId = addressId;
                                    }
                                }
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Update address error:', error);
                        get().setError('Failed to update address');
                        return false;
                    }
                },

                deleteAddress: async (addressId: string) => {
                    try {
                        set((state) => {
                            if (state.user) {
                                state.user.addresses = state.user.addresses.filter(addr => addr.id !== addressId);
                                if (state.user.defaultAddressId === addressId) {
                                    state.user.defaultAddressId = undefined;
                                    // Set first address as default if available
                                    if (state.user.addresses.length > 0) {
                                        state.user.addresses[0].isDefault = true;
                                        state.user.defaultAddressId = state.user.addresses[0].id;
                                    }
                                }
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Delete address error:', error);
                        get().setError('Failed to delete address');
                        return false;
                    }
                },

                setDefaultAddress: async (addressId: string) => {
                    try {
                        set((state) => {
                            if (state.user) {
                                state.user.addresses.forEach(addr => {
                                    addr.isDefault = addr.id === addressId;
                                });
                                state.user.defaultAddressId = addressId;
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Set default address error:', error);
                        get().setError('Failed to set default address');
                        return false;
                    }
                },

                // Security
                changePassword: async (currentPassword: string, newPassword: string) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return true;
                    } catch (error) {
                        console.error('Change password error:', error);
                        get().setError('Failed to change password');
                        return false;
                    }
                },

                enableTwoFactor: async (method: 'sms' | 'email' | 'authenticator') => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        set((state) => {
                            state.security.twoFactorAuth.enabled = true;
                            state.security.twoFactorAuth.method = method;
                            if (state.user) {
                                state.user.twoFactorEnabled = true;
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Enable 2FA error:', error);
                        get().setError('Failed to enable two-factor authentication');
                        return false;
                    }
                },

                disableTwoFactor: async (code: string) => {
                    try {
                        // Mock API call to verify code and disable 2FA
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        set((state) => {
                            state.security.twoFactorAuth.enabled = false;
                            if (state.user) {
                                state.user.twoFactorEnabled = false;
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Disable 2FA error:', error);
                        get().setError('Failed to disable two-factor authentication');
                        return false;
                    }
                },

                setupBiometric: async () => {
                    try {
                        // Generate biometric token
                        const biometricToken = 'biometric_token_' + Date.now();
                        await biometricAuth.setToken(biometricToken);

                        set((state) => {
                            state.biometric.enabled = true;
                            state.preferences.enableBiometric = true;
                        });

                        return true;
                    } catch (error) {
                        console.error('Setup biometric error:', error);
                        get().setError('Failed to setup biometric authentication');
                        return false;
                    }
                },

                disableBiometric: async () => {
                    try {
                        await biometricAuth.clear();

                        set((state) => {
                            state.biometric.enabled = false;
                            state.preferences.enableBiometric = false;
                        });

                        return true;
                    } catch (error) {
                        console.error('Disable biometric error:', error);
                        get().setError('Failed to disable biometric authentication');
                        return false;
                    }
                },

                // Session management
                createSession: (sessionInfo: Omit<SessionInfo, 'id'>) => {
                    const session: SessionInfo = {
                        ...sessionInfo,
                        id: 'session_' + Date.now(),
                    };

                    set((state) => {
                        state.session = session;
                    });
                },

                updateSession: (updates: Partial<SessionInfo>) => {
                    set((state) => {
                        if (state.session) {
                            Object.assign(state.session, updates);
                        }
                    });
                },

                endSession: () => {
                    set((state) => {
                        state.session = null;
                    });
                },

                // Error handling
                setError: (error: string | null) => {
                    set((state) => {
                        state.error = error;
                        state.lastError = error ? new Date() : null;
                        state.isLoading = false;
                        if (error) {
                            state.status = 'error';
                        }
                    });
                },

                clearError: () => {
                    set((state) => {
                        state.error = null;
                    });
                },

                // Utilities
                checkAuthStatus: async () => {
                    try {
                        const isTokenValid = await get().validateTokens();
                        const storedUser = await asyncStorage.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);

                        if (isTokenValid && storedUser) {
                            set((state) => {
                                state.status = 'authenticated';
                                state.isAuthenticated = true;
                                state.user = storedUser;
                            });
                        } else {
                            set((state) => {
                                state.status = 'unauthenticated';
                                state.isAuthenticated = false;
                                state.user = null;
                            });
                        }
                    } catch (error) {
                        console.error('Auth status check error:', error);
                        set((state) => {
                            state.status = 'unauthenticated';
                            state.isAuthenticated = false;
                        });
                    }
                },

                resetAuth: () => {
                    set(initialState);
                },

                exportUserData: async () => {
                    try {
                        const userData = {
                            profile: get().user,
                            security: get().security,
                            preferences: get().preferences,
                        };
                        return JSON.stringify(userData, null, 2);
                    } catch (error) {
                        console.error('Export user data error:', error);
                        throw new Error('Failed to export user data');
                    }
                },

                deleteAccount: async (password: string) => {
                    try {
                        // Mock API call to delete account
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Clear all data
                        await get().logout(true);
                        await asyncStorage.clear();
                        await secureStorage.clearAll();

                        return true;
                    } catch (error) {
                        console.error('Delete account error:', error);
                        get().setError('Failed to delete account');
                        return false;
                    }
                },
            })),
            {
                name: 'walmart-auth-store',
                storage: {
                    getItem: (name) => asyncStorage.getItem(name as any),
                    setItem: (name, value) => asyncStorage.setItem(name as any, value),
                    removeItem: (name) => asyncStorage.removeItem(name as any),
                },
                partialize: (state) => ({
                    // Only persist non-sensitive data
                    lastLoginMethod: state.lastLoginMethod,
                    biometric: state.biometric,
                    security: state.security,
                    preferences: state.preferences,
                    isGuest: state.isGuest,
                }),
            }
        ),
        {
            name: 'auth-store',
        }
    )
);

// Selectors for common use cases
export const useAuthStatus = () => useAuthStore((state) => ({
    status: state.status,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isGuest: state.isGuest,
    error: state.error,
}));

export const useCurrentUser = () => useAuthStore((state) => ({
    user: state.user,
    updateProfile: state.updateProfile,
}));

export const useUserAddresses = () => useAuthStore((state) => ({
    addresses: state.user?.addresses || [],
    defaultAddressId: state.user?.defaultAddressId,
    addAddress: state.addAddress,
    updateAddress: state.updateAddress,
    deleteAddress: state.deleteAddress,
    setDefaultAddress: state.setDefaultAddress,
}));

export const useAuthSecurity = () => useAuthStore((state) => ({
    security: state.security,
    biometric: state.biometric,
    preferences: state.preferences,
    enableTwoFactor: state.enableTwoFactor,
    disableTwoFactor: state.disableTwoFactor,
    setupBiometric: state.setupBiometric,
    disableBiometric: state.disableBiometric,
    changePassword: state.changePassword,
}));

export const useAuthActions = () => useAuthStore((state) => ({
    login: state.login,
    loginWithSocial: state.loginWithSocial,
    loginWithBiometric: state.loginWithBiometric,
    register: state.register,
    logout: state.logout,
    loginAsGuest: state.loginAsGuest,
    convertGuestToUser: state.convertGuestToUser,
}));