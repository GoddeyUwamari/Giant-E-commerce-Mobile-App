import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';

// Firebase JS SDK imports
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile as updateFirebaseProfile,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

// Import your Firebase config
import { firebaseAuth, firebaseFirestore } from '../firebase/config';

// Storage keys - Updated for SecureStore vs AsyncStorage
const STORAGE_KEYS = {
    // SecureStore (sensitive data)
    AUTH_TOKEN: 'walmart_auth_token',
    REFRESH_TOKEN: 'walmart_refresh_token',
    BIOMETRIC_ENABLED: 'walmart_biometric_enabled',

    // AsyncStorage (non-sensitive data)
    USER_DATA: '@walmart_user_data',
};

// Routes
const ROUTES = {
    TABS: {
        ROOT: '/(tabs)',
    },
    AUTH: {
        LOGIN: '/(auth)/login',
    },
};

// Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    preferredStore?: string;
    walmartPlusMember: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    accessToken: string | null;
    refreshToken: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    acceptTerms: boolean;
    marketingOptIn?: boolean;
}

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    biometricType?: 'fingerprint' | 'face' | 'iris' | 'none';
}

export interface AuthError {
    code: string;
    message: string;
    field?: string;
}

// Helper function to get auth error message
const getAuthErrorMessage = (error: any): string => {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Incorrect email or password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        default:
            return error.message || 'An unexpected error occurred. Please try again.';
    }
};

// Helper function to create user document
const createUserDocument = async (firebaseUser: FirebaseUser, additionalData: Partial<User> = {}): Promise<User> => {
    const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        phone: additionalData.phone || '',
        avatar: firebaseUser.photoURL || '',
        emailVerified: firebaseUser.emailVerified,
        phoneVerified: false,
        preferredStore: '',
        walmartPlusMember: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...additionalData,
    };

    // Save to Firestore with server timestamp
    const userDocRef = doc(firebaseFirestore, 'users', firebaseUser.uid);
    const userDataWithTimestamp = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, userDataWithTimestamp);

    return userData;
};

// Helper function to get user document
const getUserDocument = async (uid: string): Promise<User | null> => {
    try {
        const userDocRef = doc(firebaseFirestore, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            if (!data) return null;

            return {
                id: uid,
                email: data.email || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phone: data.phone || '',
                avatar: data.avatar || '',
                emailVerified: data.emailVerified || false,
                phoneVerified: data.phoneVerified || false,
                preferredStore: data.preferredStore || '',
                walmartPlusMember: data.walmartPlusMember || false,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting user document:', error);
        return null;
    }
};

// SecureStore helpers
const secureStorage = {
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error(`SecureStore setItem error for ${key}:`, error);
            throw error;
        }
    },

    getItem: async (key: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error(`SecureStore getItem error for ${key}:`, error);
            return null;
        }
    },

    removeItem: async (key: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error(`SecureStore removeItem error for ${key}:`, error);
        }
    },
};

export function useAuth() {
    const router = useRouter();

    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        accessToken: null,
        refreshToken: null,
    });

    // Initialize auth state
    const initializeAuth = useCallback(async () => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            // Check for stored auth data using SecureStore for tokens
            const [accessToken, userJson] = await Promise.all([
                secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
                AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
            ]);

            if (accessToken && userJson) {
                const user: User = JSON.parse(userJson);
                setAuthState(prev => ({
                    ...prev,
                    user,
                    isAuthenticated: true,
                    accessToken,
                    isLoading: false,
                    isInitialized: true,
                }));
            } else {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    isInitialized: true,
                }));
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                isInitialized: true,
            }));
        }
    }, []);

    // Clear auth data from storage
    const clearAuthData = useCallback(async () => {
        try {
            await Promise.all([
                secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
                secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
            ]);
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    }, []);

    // Login
    const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            // Use Firebase JS SDK
            const userCredential = await signInWithEmailAndPassword(
                firebaseAuth,
                credentials.email,
                credentials.password
            );

            const firebaseUser = userCredential.user;
            const accessToken = await firebaseUser.getIdToken();

            // Get or create user data
            let userData = await getUserDocument(firebaseUser.uid);

            if (!userData) {
                userData = await createUserDocument(firebaseUser);
            }

            // Store tokens in SecureStore and user data in AsyncStorage
            await Promise.all([
                secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
                AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
            ]);

            setAuthState(prev => ({
                ...prev,
                user: userData,
                isAuthenticated: true,
                accessToken,
                refreshToken: null,
                isLoading: false,
            }));

            // Navigate to main app
            router.replace(ROUTES.TABS.ROOT);
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw new Error(getAuthErrorMessage(error));
        }
    }, [router]);

    // Register
    const register = useCallback(async (data: RegisterData): Promise<void> => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            // Use Firebase JS SDK
            const userCredential = await createUserWithEmailAndPassword(
                firebaseAuth,
                data.email,
                data.password
            );

            const firebaseUser = userCredential.user;

            // Update profile
            await updateFirebaseProfile(firebaseUser, {
                displayName: `${data.firstName} ${data.lastName}`,
            });

            // Send email verification
            await sendEmailVerification(firebaseUser);

            // Create user document
            const userData = await createUserDocument(firebaseUser, {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            });

            const accessToken = await firebaseUser.getIdToken();

            // Store tokens in SecureStore and user data in AsyncStorage
            await Promise.all([
                secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
                AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
            ]);

            setAuthState(prev => ({
                ...prev,
                user: userData,
                isAuthenticated: true,
                accessToken,
                refreshToken: null,
                isLoading: false,
            }));

            // Show verification message
            Alert.alert(
                'Account Created!',
                'Please check your email to verify your account.',
                [{ text: 'OK' }]
            );

            // Navigate to main app
            router.replace(ROUTES.TABS.ROOT);
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw new Error(getAuthErrorMessage(error));
        }
    }, [router]);

    // Logout
    const logout = useCallback(async (showConfirmation: boolean = true): Promise<void> => {
        const performLogout = async () => {
            try {
                setAuthState(prev => ({ ...prev, isLoading: true }));

                // Use Firebase JS SDK
                await signOut(firebaseAuth);
                await clearAuthData();

                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    isInitialized: true,
                    accessToken: null,
                    refreshToken: null,
                });

                router.replace(ROUTES.AUTH.LOGIN);
            } catch (error) {
                console.error('Logout error:', error);
                await clearAuthData();
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    isInitialized: true,
                    accessToken: null,
                    refreshToken: null,
                });
                router.replace(ROUTES.AUTH.LOGIN);
            }
        };

        if (showConfirmation) {
            Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', style: 'destructive', onPress: performLogout },
                ]
            );
        } else {
            await performLogout();
        }
    }, [clearAuthData, router]);

    // Forgot password
    const forgotPassword = useCallback(async (email: string): Promise<void> => {
        try {
            // Use Firebase JS SDK
            await sendPasswordResetEmail(firebaseAuth, email);
        } catch (error) {
            throw new Error(getAuthErrorMessage(error));
        }
    }, []);

    // Verify email
    const verifyEmail = useCallback(async (): Promise<void> => {
        try {
            const currentUser = firebaseAuth.currentUser;
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            await sendEmailVerification(currentUser);
        } catch (error) {
            throw new Error(getAuthErrorMessage(error));
        }
    }, []);

    // Update profile
    const updateProfile = useCallback(async (updates: Partial<User>): Promise<void> => {
        try {
            if (!authState.user) {
                throw new Error('Not authenticated');
            }

            // Update in Firestore
            const userDocRef = doc(firebaseFirestore, 'users', authState.user.id);
            const updateData = {
                ...updates,
                updatedAt: serverTimestamp(),
            };

            await updateDoc(userDocRef, updateData);

            const updatedUser = {
                ...authState.user,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            setAuthState(prev => ({
                ...prev,
                user: updatedUser,
            }));

            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Profile update error:', error);
            throw new Error('Failed to update profile. Please try again.');
        }
    }, [authState.user]);

    // Biometric authentication
    const authenticateWithBiometrics = useCallback(async (): Promise<BiometricAuthResult> => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                return { success: false, error: 'Biometric hardware not available', biometricType: 'none' };
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                return { success: false, error: 'No biometrics enrolled', biometricType: 'none' };
            }

            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const biometricType = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
                ? 'face'
                : supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
                    ? 'fingerprint'
                    : 'none';

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access your Walmart account',
                cancelLabel: 'Cancel',
                fallbackLabel: 'Use Password',
            });

            return {
                success: result.success,
                error: result.success ? undefined : (result.error || 'Authentication failed'),
                biometricType,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Biometric authentication error',
                biometricType: 'none',
            };
        }
    }, []);

    // Check if biometric is enabled
    const isBiometricEnabled = useCallback(async (): Promise<boolean> => {
        try {
            const enabled = await secureStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
            return enabled === 'true';
        } catch (error) {
            return false;
        }
    }, []);

    // Set biometric enabled
    const setBiometricEnabled = useCallback(async (enabled: boolean): Promise<void> => {
        try {
            await secureStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
        } catch (error) {
            throw error;
        }
    }, []);

    // Add Firebase auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                try {
                    const userData = await getUserDocument(firebaseUser.uid);
                    if (userData) {
                        const accessToken = await firebaseUser.getIdToken();

                        setAuthState(prev => ({
                            ...prev,
                            user: userData,
                            isAuthenticated: true,
                            accessToken,
                            isLoading: false,
                        }));

                        // Update stored data
                        await Promise.all([
                            secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
                            AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
                        ]);
                    }
                } catch (error) {
                    console.error('Auth state change error:', error);
                }
            } else {
                // User is signed out
                setAuthState(prev => ({
                    ...prev,
                    user: null,
                    isAuthenticated: false,
                    accessToken: null,
                    refreshToken: null,
                    isLoading: false,
                }));
            }
        });

        return unsubscribe;
    }, []);

    // Initialize auth on mount
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return {
        // State
        ...authState,

        // Actions
        login,
        register,
        logout,
        forgotPassword,
        verifyEmail,
        updateProfile,

        // Biometric
        authenticateWithBiometrics,
        isBiometricEnabled,
        setBiometricEnabled,

        // Utilities
        initializeAuth,
        clearAuthData,
    };
}