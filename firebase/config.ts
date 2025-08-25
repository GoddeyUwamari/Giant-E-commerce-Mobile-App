// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get values from app.json extra section
const extra = Constants.expoConfig?.extra || {};

export const firebaseConfig = {
    apiKey: extra.FIREBASE_API_KEY,
    authDomain: extra.FIREBASE_AUTH_DOMAIN,
    projectId: extra.FIREBASE_PROJECT_ID,
    storageBucket: extra.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
    appId: extra.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (error) {
    // If already initialized, get existing instance
    auth = getAuth(app);
}

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Export Firebase services
export const firebaseAuth = auth;
export const firebaseFirestore = firestore;
export const firebaseStorage = storage;

export default {
    auth: firebaseAuth,
    firestore: firebaseFirestore,
    storage: firebaseStorage,
    config: firebaseConfig,
};