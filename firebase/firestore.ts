// firebase/firestore.ts
// import firestore from '@react-native-firebase/firestore';

// Collections
export const collections = {
    USERS: 'users',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    CART: 'cart',
    CATEGORIES: 'categories',
    REVIEWS: 'reviews',
} as const;

// User functions
export const createUser = async (uid: string, userData: any) => {
    try {
        await firestore().collection(collections.USERS).doc(uid).set({
            ...userData,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
};

export const getUser = async (uid: string) => {
    try {
        const doc = await firestore().collection(collections.USERS).doc(uid).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};

export const updateUser = async (uid: string, userData: any) => {
    try {
        await firestore().collection(collections.USERS).doc(uid).update({
            ...userData,
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
};

// Product functions
export const getProducts = async (limit: number = 20) => {
    try {
        const snapshot = await firestore()
            .collection(collections.PRODUCTS)
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Get products error:', error);
        throw error;
    }
};

export const getProductsByCategory = async (category: string, limit: number = 20) => {
    try {
        const snapshot = await firestore()
            .collection(collections.PRODUCTS)
            .where('category', '==', category)
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Get products by category error:', error);
        throw error;
    }
};

export const searchProducts = async (searchTerm: string, limit: number = 20) => {
    try {
        const snapshot = await firestore()
            .collection(collections.PRODUCTS)
            .where('name', '>=', searchTerm)
            .where('name', '<=', searchTerm + '\uf8ff')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Search products error:', error);
        throw error;
    }
};

// Cart functions
export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
    try {
        const cartRef = firestore()
            .collection(collections.USERS)
            .doc(userId)
            .collection(collections.CART);

        const existingItem = await cartRef.doc(productId).get();

        if (existingItem.exists) {
            await cartRef.doc(productId).update({
                quantity: firestore.FieldValue.increment(quantity),
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
        } else {
            await cartRef.doc(productId).set({
                productId,
                quantity,
                createdAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
    }
};

export const getCartItems = async (userId: string) => {
    try {
        const snapshot = await firestore()
            .collection(collections.USERS)
            .doc(userId)
            .collection(collections.CART)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Get cart items error:', error);
        throw error;
    }
};

export const removeFromCart = async (userId: string, productId: string) => {
    try {
        await firestore()
            .collection(collections.USERS)
            .doc(userId)
            .collection(collections.CART)
            .doc(productId)
            .delete();
    } catch (error) {
        console.error('Remove from cart error:', error);
        throw error;
    }
};

// Order functions
export const createOrder = async (userId: string, orderData: any) => {
    try {
        const orderRef = await firestore().collection(collections.ORDERS).add({
            userId,
            ...orderData,
            status: 'pending',
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        return orderRef.id;
    } catch (error) {
        console.error('Create order error:', error);
        throw error;
    }
};

export const getUserOrders = async (userId: string) => {
    try {
        const snapshot = await firestore()
            .collection(collections.ORDERS)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Get user orders error:', error);
        throw error;
    }
};