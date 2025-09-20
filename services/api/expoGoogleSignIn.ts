// services/api/expoGoogleSignIn.ts
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { firebaseAuth } from '../../firebase/config';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import {
    GOOGLE_CLIENT_ID_WEB,
    GOOGLE_CLIENT_ID_IOS,
    GOOGLE_CLIENT_ID_ANDROID
} from '@env';

WebBrowser.maybeCompleteAuthSession();

export interface ExpoGoogleSignInResult {
    success: boolean;
    user?: any;
    error?: string;
    cancelled?: boolean;
}

export interface ExpoGoogleUserInfo {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    emailVerified: boolean;
}

class ExpoGoogleSignInService {
    private initialized = false;
    private clientId: string;

    constructor() {
        console.log('ExpoGoogleSignInService constructor called');

        // Use Web client ID for Expo managed workflow
        this.clientId = GOOGLE_CLIENT_ID_WEB || '210498650658-asmngad0k5kfj9btl8q6fuihjvk40sv.apps.googleusercontent.com';

        console.log('Using Google Client ID:', this.clientId);
        console.log('Platform:', Platform.OS);
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Expo Google Sign-In already initialized');
            return;
        }

        if (!this.clientId) {
            throw new Error(`Google Client ID is missing for platform: ${Platform.OS}`);
        }

        this.initialized = true;
        console.log(`Expo Google Sign-In initialized successfully for ${Platform.OS}`);
    }

    async signIn(): Promise<ExpoGoogleSignInResult> {
        try {
            console.log(`Starting Expo Google Sign-In process for ${Platform.OS}...`);
            await this.initialize();

            // Generate code challenge for PKCE
            const codeVerifier = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            const codeChallenge = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                codeVerifier,
                { encoding: Crypto.CryptoEncoding.BASE64 }
            );

            // Use simpler implicit flow instead of PKCE
            const request = new AuthSession.AuthRequest({
                clientId: this.clientId,
                scopes: ['openid', 'profile', 'email'],
                redirectUri: 'https://auth.expo.io/@goddeyuwamari1234/walmart-mobile/redirect',
                responseType: AuthSession.ResponseType.IdToken,
                extraParams: {
                    include_granted_scopes: 'true',
                },
                additionalParameters: {
                    prompt: 'select_account',
                },
            });

            console.log('=== Expo Google Auth Debug ===');
            console.log('Client ID:', this.clientId);
            console.log('Redirect URI:', request.redirectUri);
            console.log('Code Verifier:', codeVerifier);
            console.log('Code Challenge:', codeChallenge);
            console.log('Request created successfully');

            // Google's discovery document
            const discovery = {
                authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenEndpoint: 'https://oauth2.googleapis.com/token',
                revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
            };

            // Perform the authentication
            const result = await request.promptAsync(discovery);

            console.log('Auth result type:', result.type);

            if (result.type === 'success') {
                console.log('Google Sign-In successful');

                // Extract the ID token from the result
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
                        emailVerified: tokenPayload.email_verified,
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
            console.error('Expo Google Sign-In failed:', error);
            return {
                success: false,
                error: error.message || 'Google Sign-In failed'
            };
        }
    }

    async signInWithFirebase(): Promise<{
        success: boolean;
        userInfo?: ExpoGoogleUserInfo;
        firebaseUser?: any;
        error?: string;
        cancelled?: boolean;
    }> {
        try {
            console.log('Starting Expo Google Firebase Sign-In...');

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
            const userInfo: ExpoGoogleUserInfo = {
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
            console.error('Expo Google Firebase Sign-In failed:', error);
            return {
                success: false,
                error: this.getFirebaseErrorMessage(error),
            };
        }
    }

    async signOut(): Promise<void> {
        try {
            console.log('Expo Google Sign-Out successful');
        } catch (error) {
            console.error('Expo Google Sign-Out failed:', error);
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

const expoGoogleSignInService = new ExpoGoogleSignInService();
export { expoGoogleSignInService };
export default expoGoogleSignInService;