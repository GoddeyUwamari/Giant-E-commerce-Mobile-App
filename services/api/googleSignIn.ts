// services/api/googleSignIn.ts
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { firebaseAuth } from '../../firebase/config';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import {
    GOOGLE_CLIENT_ID_WEB,
    GOOGLE_CLIENT_ID_IOS,
    GOOGLE_CLIENT_ID_ANDROID
} from '@env';

console.log('googleSignIn.ts module loading...');

// Complete the auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInResult {
    success: boolean;
    user?: any;
    error?: string;
    cancelled?: boolean;
}

export interface GoogleUserInfo {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    emailVerified: boolean;
}

class GoogleSignInService {
    private initialized = false;
    private clientId: string;

    constructor() {
        console.log('GoogleSignInService constructor called');

        // Debug environment variables
        console.log('=== Google Sign-In Environment Check ===');
        console.log('Platform:', Platform.OS);
        console.log('Web Client ID:', GOOGLE_CLIENT_ID_WEB ? 'Present' : 'Missing');
        console.log('iOS Client ID:', GOOGLE_CLIENT_ID_IOS ? 'Present' : 'Missing');
        console.log('Android Client ID:', GOOGLE_CLIENT_ID_ANDROID ? 'Present' : 'Missing');

        // For Expo development, use Web client ID which supports auth proxy
        this.clientId = GOOGLE_CLIENT_ID_WEB ||
            Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID_WEB ||
            '210498650658-asmngad0k5kfj9btl8q6fuihjvk40sv.apps.googleusercontent.com';

        console.log(`Selected client ID for ${Platform.OS}:`, this.clientId);
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Google Sign-In already initialized');
            return;
        }

        if (!this.clientId) {
            throw new Error(`Google Client ID is missing for platform: ${Platform.OS}`);
        }

        this.initialized = true;
        console.log(`Google Sign-In initialized successfully for ${Platform.OS}`);
    }

    async signIn(): Promise<GoogleSignInResult> {
        try {
            console.log(`Starting Google Sign-In process for ${Platform.OS}...`);
            await this.initialize();

            // Use Web client ID for all platforms when using Expo auth proxy
            const webClientId = GOOGLE_CLIENT_ID_WEB || '210498650658-asmngad0k5kfj9btl8q6fuihjvk40sv.apps.googleusercontent.com';

            // For Expo managed workflow, we need to use the proxy correctly
            let redirectUri;

            try {
                // Use Expo's makeRedirectUri with proxy enabled
                redirectUri = AuthSession.makeRedirectUri({
                    useProxy: true,
                });
                console.log('Method 1 - AuthSession.makeRedirectUri with proxy:', redirectUri);

                // If it doesn't generate the expected format, manually construct it
                if (!redirectUri.includes('auth.expo.io')) {
                    redirectUri = `https://auth.expo.io/@goddeyuwamari1234/walmart-mobile`;
                    console.log('Proxy URI not generated, using manual construction:', redirectUri);
                }
            } catch (error) {
                console.error('AuthSession.makeRedirectUri failed:', error);
                redirectUri = 'https://auth.expo.io/@goddeyuwamari1234/walmart-mobile';
            }

            console.log('=== Google Sign-In Debug Info ===');
            console.log('Client ID being used:', webClientId);
            console.log('Final redirect URI:', redirectUri);
            console.log('Platform:', Platform.OS);
            console.log('Expo Config Owner:', Constants.expoConfig?.owner);
            console.log('Expo Config Slug:', Constants.expoConfig?.slug);

            // Create the auth request
            const request = new AuthSession.AuthRequest({
                clientId: webClientId,
                scopes: ['openid', 'profile', 'email'],
                redirectUri: redirectUri,
                responseType: AuthSession.ResponseType.IdToken,
                extraParams: {
                    include_granted_scopes: 'true',
                },
                additionalParameters: {
                    prompt: 'select_account',
                },
            });

            console.log('Auth request created:', {
                clientId: webClientId,
                redirectUri: request.redirectUri,
                scopes: request.scopes,
                platform: Platform.OS
            });

            // Google's discovery document
            const discovery = {
                authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenEndpoint: 'https://oauth2.googleapis.com/token',
                revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
            };

            // Perform the authentication
            const result = await request.promptAsync(discovery);

            console.log('Auth result:', result.type);
            console.log('Auth result params:', result.params);

            if (result.type === 'success') {
                console.log('Google Sign-In successful');

                const { id_token } = result.params;

                if (!id_token) {
                    throw new Error('No ID token received from Google');
                }

                // Decode the ID token to get user info
                const tokenPayload = this.decodeIdToken(id_token);

                const userInfo = {
                    idToken: id_token,
                    user: {
                        id: tokenPayload.sub,
                        name: tokenPayload.name,
                        givenName: tokenPayload.given_name,
                        familyName: tokenPayload.family_name,
                        email: tokenPayload.email,
                        photo: tokenPayload.picture,
                    }
                };

                return {
                    success: true,
                    user: userInfo,
                    cancelled: false,
                };
            } else if (result.type === 'cancel') {
                return {
                    success: false,
                    cancelled: true,
                    error: 'User cancelled sign-in'
                };
            } else {
                console.error('Auth result error:', result);
                return {
                    success: false,
                    error: `Authentication failed: ${result.type}`
                };
            }

        } catch (error: any) {
            console.error('Google Sign-In failed:', error);
            return {
                success: false,
                error: error.message || 'Google Sign-In failed'
            };
        }
    }

    async signInWithFirebase(): Promise<{
        success: boolean;
        userInfo?: GoogleUserInfo;
        firebaseUser?: any;
        error?: string;
        cancelled?: boolean;
    }> {
        try {
            console.log('Starting Google Firebase Sign-In...');

            // First, sign in with Google
            const googleResult = await this.signIn();

            if (!googleResult.success) {
                return {
                    success: false,
                    error: googleResult.error,
                    cancelled: googleResult.cancelled,
                };
            }

            if (!googleResult.user) {
                return {
                    success: false,
                    error: 'No user data received from Google'
                };
            }

            // Extract ID token from response
            const idToken = googleResult.user.idToken;

            if (!idToken) {
                console.error('ID token not found in user data');
                console.error('User data structure:', JSON.stringify(googleResult.user, null, 2));
                return {
                    success: false,
                    error: 'Failed to get Google ID token'
                };
            }

            console.log('Got Google ID token, creating Firebase credential...');

            // Create Firebase credential
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign in to Firebase
            const firebaseResult = await signInWithCredential(firebaseAuth, googleCredential);
            console.log('Firebase sign-in successful');

            // Extract user information
            const userInfo: GoogleUserInfo = {
                id: firebaseResult.user.uid,
                email: firebaseResult.user.email || googleResult.user.user?.email || '',
                firstName: googleResult.user.user?.givenName || '',
                lastName: googleResult.user.user?.familyName || '',
                displayName: firebaseResult.user.displayName || googleResult.user.user?.name || '',
                avatar: firebaseResult.user.photoURL || googleResult.user.user?.photo || undefined,
                emailVerified: firebaseResult.user.emailVerified,
            };

            console.log('User info extracted:', userInfo);

            return {
                success: true,
                userInfo,
                firebaseUser: firebaseResult.user,
            };

        } catch (error: any) {
            console.error('Google Firebase Sign-In failed:', error);
            return {
                success: false,
                error: this.getFirebaseErrorMessage(error),
            };
        }
    }

    async signOut(): Promise<void> {
        try {
            console.log('Google Sign-Out successful');
        } catch (error) {
            console.error('Google Sign-Out failed:', error);
        }
    }

    async revokeAccess(): Promise<void> {
        try {
            console.log('Google access revoked');
        } catch (error) {
            console.error('Google revoke access failed:', error);
        }
    }

    async getCurrentUser(): Promise<any | null> {
        try {
            return firebaseAuth.currentUser;
        } catch (error) {
            console.error('Get current Google user failed:', error);
            return null;
        }
    }

    async isSignedIn(): Promise<boolean> {
        try {
            return !!firebaseAuth.currentUser;
        } catch (error) {
            console.error('Check Google sign-in status failed:', error);
            return false;
        }
    }

    async getTokens(): Promise<{ accessToken: string; idToken?: string } | null> {
        try {
            const user = firebaseAuth.currentUser;
            if (user) {
                const idToken = await user.getIdToken();
                return {
                    accessToken: idToken,
                    idToken: idToken
                };
            }
            return null;
        } catch (error) {
            console.error('Get Google tokens failed:', error);
            return null;
        }
    }

    isAvailable(): boolean {
        return true;
    }

    private decodeIdToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Failed to decode ID token:', error);
            return {};
        }
    }

    private getFirebaseErrorMessage(error: any): string {
        const errorMessages: { [key: string]: string } = {
            'auth/account-exists-with-different-credential':
                'An account already exists with this email using a different sign-in method.',
            'auth/credential-already-in-use':
                'This Google account is already linked to another user.',
            'auth/operation-not-allowed':
                'Google Sign-In is not enabled for this app.',
            'auth/user-disabled':
                'This user account has been disabled.',
            'auth/user-not-found':
                'No user found with this Google account.',
            'auth/invalid-credential':
                'The Google credential is invalid or expired.',
            'auth/network-request-failed':
                'Network error. Please check your connection and try again.',
            'auth/too-many-requests':
                'Too many unsuccessful attempts. Please try again later.',
        };

        return errorMessages[error.code] || error.message || 'Google Sign-In failed. Please try again.';
    }
}

console.log('Creating GoogleSignInService instance...');
const googleSignInService = new GoogleSignInService();
console.log('GoogleSignInService instance created');

export { googleSignInService };
export default googleSignInService;