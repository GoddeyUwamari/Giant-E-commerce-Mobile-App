// firebase/auth.ts
// Temporarily commented out for build issues
/*
import auth from '@react-native-firebase/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
*/

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
}

// Mock implementations (will replace with real Firebase later)

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<AuthUser> => {
    console.log('Firebase not connected yet - signUp called with:', email);
    // Return mock user for now
    return {
        uid: 'mock-uid-' + Date.now(),
        email,
        displayName: null,
        emailVerified: false,
    };
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser> => {
    console.log('Firebase not connected yet - signIn called with:', email);
    // Return mock user for now
    return {
        uid: 'mock-uid-' + Date.now(),
        email,
        displayName: null,
        emailVerified: false,
    };
};

// Sign out
export const signOut = async (): Promise<void> => {
    console.log('Firebase not connected yet - signOut called');
    // Mock implementation
};

// Get current user
export const getCurrentUser = (): any => {
    console.log('Firebase not connected yet - getCurrentUser called');
    return null;
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
    console.log('Firebase not connected yet - resetPassword called for:', email);
    // Mock implementation
};

// Update user profile
export const updateProfile = async (displayName: string): Promise<void> => {
    console.log('Firebase not connected yet - updateProfile called with:', displayName);
    // Mock implementation
};

// Send email verification
export const sendEmailVerification = async (): Promise<void> => {
    console.log('Firebase not connected yet - sendEmailVerification called');
    // Mock implementation
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: AuthUser | null) => void) => {
    console.log('Firebase not connected yet - onAuthStateChanged called');
    // Mock implementation - call callback with null user
    setTimeout(() => callback(null), 100);
    return () => {}; // Return unsubscribe function
};