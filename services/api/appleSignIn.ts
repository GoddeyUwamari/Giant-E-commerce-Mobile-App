// services/api/appleSignIn.ts
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { Platform } from 'react-native';
import { firebaseAuth } from '../../firebase/config';

export interface AppleSignInResult {
    success: boolean;
    user?: AppleAuthentication.AppleAuthenticationCredential;
    error?: string;
    cancelled?: boolean;
    notSupported?: boolean;
}

export interface AppleUserInfo {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    emailVerified: boolean;
}

class AppleSignInService {
    private initialized = false;

    constructor() {
        console.log('=== Apple Sign-In Service Check ===');
        console.log('Platform:', Platform.OS);
        console.log('iOS Support:', Platform.OS === 'ios');
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Apple Sign-In already initialized');
            return;
        }

        try {
            // Check if Apple Authentication is available on this device
            const isAvailable = await AppleAuthentication.isAvailableAsync();

            if (!isAvailable) {
                throw new Error('Apple Authentication is not available on this device');
            }

            this.initialized = true;
            console.log('Apple Sign-In initialized successfully');
        } catch (error) {
            console.error('Apple Sign-In initialization failed:', error);
            throw error;
        }
    }

    async isAppleSignInSupported(): Promise<boolean> {
        try {
            console.log('Checking Apple Sign-In availability...');

            // Apple Sign-In is only available on iOS 13+ and macOS 10.15+
            if (Platform.OS !== 'ios') {
                console.log('Apple Sign-In not supported: Not iOS platform');
                return false;
            }

            const available = await AppleAuthentication.isAvailableAsync();
            console.log('Apple Sign-In availability:', available);
            return available;
        } catch (error) {
            console.error('Error checking Apple Sign-In availability:', error);
            return false;
        }
    }

    // Alias for compatibility with useAuth hook
    async isAvailable(): Promise<boolean> {
        return this.isAppleSignInSupported();
    }

    async signIn(): Promise<AppleSignInResult> {
        try {
            console.log('Starting Apple Sign-In process...');

            // Check if Apple Sign-In is available
            const available = await this.isAppleSignInSupported();
            if (!available) {
                return {
                    success: false,
                    notSupported: true,
                    error: 'Apple Sign-In is not available on this device',
                };
            }

            await this.initialize();

            console.log('Requesting Apple authentication...');

            // Request Apple Sign-In
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            console.log('Apple Sign-In successful');
            console.log('Credential structure:', {
                user: credential.user,
                email: credential.email,
                identityToken: credential.identityToken ? 'Present' : 'Missing',
                authorizationCode: credential.authorizationCode ? 'Present' : 'Missing',
                fullName: credential.fullName
            });

            return {
                success: true,
                user: credential,
                cancelled: false,
            };
        } catch (error: any) {
            console.error('Apple Sign-In failed:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // Handle specific error codes
            if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
                return {
                    success: false,
                    cancelled: true,
                    error: 'User cancelled Apple Sign-In',
                };
            }

            if (error.code === 'ERR_REQUEST_FAILED') {
                return {
                    success: false,
                    error: 'Apple Sign-In request failed',
                };
            }

            if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
                return {
                    success: false,
                    error: 'Apple Sign-In request was not handled',
                };
            }

            if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
                return {
                    success: false,
                    error: 'Apple Sign-In request requires user interaction',
                };
            }

            if (error.code === 'ERR_REQUEST_UNKNOWN') {
                return {
                    success: false,
                    error: 'Unknown Apple Sign-In error occurred',
                };
            }

            return {
                success: false,
                error: error.message || 'Apple Sign-In failed',
            };
        }
    }

    async signInWithFirebase(): Promise<{
        success: boolean;
        userInfo?: AppleUserInfo;
        firebaseUser?: any;
        error?: string;
        cancelled?: boolean;
        notSupported?: boolean;
    }> {
        try {
            console.log('Starting Apple Firebase Sign-In...');

            // First, sign in with Apple
            const appleResult = await this.signIn();

            if (!appleResult.success) {
                return {
                    success: false,
                    error: appleResult.error,
                    cancelled: appleResult.cancelled,
                    notSupported: appleResult.notSupported,
                };
            }

            if (!appleResult.user) {
                return {
                    success: false,
                    error: 'No user data received from Apple',
                };
            }

            const { identityToken, authorizationCode } = appleResult.user;

            if (!identityToken) {
                console.error('Identity token not found in Apple response');
                console.error('Apple user data:', JSON.stringify(appleResult.user, null, 2));
                return {
                    success: false,
                    error: 'Failed to get Apple identity token',
                };
            }

            console.log('Got Apple identity token, creating Firebase credential...');

            // Create a Firebase credential with the Apple identity token
            const provider = new OAuthProvider('apple.com');
            const credential = provider.credential({
                idToken: identityToken,
                rawNonce: undefined, // You might want to implement nonce for additional security
            });

            // Sign in to Firebase with the Apple credential
            const firebaseResult = await signInWithCredential(firebaseAuth, credential);
            console.log('Firebase sign-in successful');

            // Extract user information
            // Note: Apple might not provide email/name on subsequent sign-ins
            const appleUser = appleResult.user;
            const firebaseUser = firebaseResult.user;

            const userInfo: AppleUserInfo = {
                id: firebaseUser.uid,
                email: firebaseUser.email || appleUser.email || undefined,
                firstName: firebaseUser.displayName?.split(' ')[0] || appleUser.fullName?.givenName || undefined,
                lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || appleUser.fullName?.familyName || undefined,
                displayName: firebaseUser.displayName ||
                    (appleUser.fullName ? `${appleUser.fullName.givenName || ''} ${appleUser.fullName.familyName || ''}`.trim() : undefined),
                emailVerified: firebaseUser.emailVerified,
            };

            console.log('Apple user info extracted:', userInfo);

            return {
                success: true,
                userInfo,
                firebaseUser: firebaseResult.user,
            };
        } catch (error: any) {
            console.error('Apple Firebase Sign-In failed:', error);
            return {
                success: false,
                error: this.getFirebaseErrorMessage(error),
            };
        }
    }

    async getCredentialState(userID: string): Promise<AppleAuthentication.AppleAuthenticationCredentialState> {
        try {
            await this.initialize();
            const state = await AppleAuthentication.getCredentialStateAsync(userID);
            console.log('Apple credential state for user', userID, ':', state);
            return state;
        } catch (error) {
            console.error('Error getting Apple credential state:', error);
            return AppleAuthentication.AppleAuthenticationCredentialState.UNKNOWN;
        }
    }

    async isUserSignedIn(userID: string): Promise<boolean> {
        try {
            const credentialState = await this.getCredentialState(userID);
            return credentialState === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED;
        } catch (error) {
            console.error('Error checking Apple sign-in status:', error);
            return false;
        }
    }

    async signOut(): Promise<void> {
        try {
            // Apple doesn't provide a sign-out method
            // Sign-out is handled at the Firebase level
            console.log('Apple Sign-Out: No action required (handled by Firebase)');
        } catch (error) {
            console.error('Apple Sign-Out error:', error);
        }
    }

    async revokeAccess(): Promise<void> {
        try {
            // Apple doesn't provide a revoke access method through the SDK
            // Users must revoke access through their Apple ID settings
            console.log('Apple revoke access: Users must revoke through Apple ID settings');
        } catch (error) {
            console.error('Apple revoke access error:', error);
        }
    }

    private getFirebaseErrorMessage(error: any): string {
        const errorMessages: { [key: string]: string } = {
            'auth/account-exists-with-different-credential':
                'An account already exists with this email address using a different sign-in method.',
            'auth/credential-already-in-use':
                'This Apple ID is already linked to another user.',
            'auth/operation-not-allowed':
                'Apple Sign-In is not enabled for this app.',
            'auth/user-disabled':
                'This user account has been disabled.',
            'auth/user-not-found':
                'No user found with this Apple ID.',
            'auth/wrong-password':
                'Invalid credentials provided.',
            'auth/invalid-credential':
                'The Apple credential is invalid or expired.',
            'auth/network-request-failed':
                'Network error. Please check your connection and try again.',
            'auth/too-many-requests':
                'Too many unsuccessful attempts. Please try again later.',
            'auth/invalid-verification-code':
                'The Apple verification code is invalid.',
            'auth/invalid-verification-id':
                'The Apple verification ID is invalid.',
        };

        return errorMessages[error.code] || error.message || 'Apple Sign-In failed. Please try again.';
    }

    // Helper method to check if we should show Apple Sign-In button
    async shouldShowAppleSignIn(): Promise<boolean> {
        try {
            // Only show on iOS devices that support Apple Sign-In
            return Platform.OS === 'ios' && await this.isAppleSignInSupported();
        } catch (error) {
            return false;
        }
    }

    // Helper method to get Apple button style based on iOS appearance
    getAppleButtonStyle(): {
        buttonType: AppleAuthentication.AppleAuthenticationButtonType;
        buttonStyle: AppleAuthentication.AppleAuthenticationButtonStyle;
    } {
        return {
            buttonType: AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN,
            buttonStyle: AppleAuthentication.AppleAuthenticationButtonStyle.BLACK,
        };
    }
}

// Export singleton instance
export const appleSignInService = new AppleSignInService();
export default appleSignInService;