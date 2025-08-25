import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import asyncStorage, { STORAGE_KEYS } from '../storage/asyncStorage';

// User subscription types
export type SubscriptionType = 'walmart_plus' | 'basic' | 'premium' | 'family';

// User activity types
export type ActivityType =
    | 'purchase'
    | 'review'
    | 'search'
    | 'wishlist_add'
    | 'cart_add'
    | 'store_visit'
    | 'product_view'
    | 'promotion_use'
    | 'support_contact'
    | 'profile_update'
    | 'avatar_upload'
    | 'avatar_delete';

// Notification preferences
export interface NotificationPreferences {
    pushNotifications: {
        enabled: boolean;
        orderUpdates: boolean;
        promotions: boolean;
        stockAlerts: boolean;
        priceDrops: boolean;
        recommendations: boolean;
        security: boolean;
    };
    emailNotifications: {
        enabled: boolean;
        newsletter: boolean;
        orderConfirmations: boolean;
        promotions: boolean;
        accountUpdates: boolean;
        weeklyDigest: boolean;
        abandonedCart: boolean;
    };
    smsNotifications: {
        enabled: boolean;
        orderUpdates: boolean;
        deliveryAlerts: boolean;
        securityAlerts: boolean;
        promotions: boolean;
    };
}

// Privacy settings
export interface PrivacySettings {
    dataCollection: {
        analytics: boolean;
        personalization: boolean;
        marketing: boolean;
        location: boolean;
    };
    sharing: {
        socialMedia: boolean;
        thirdPartyPartners: boolean;
        advertisers: boolean;
    };
    visibility: {
        profile: 'public' | 'private' | 'friends';
        purchases: 'public' | 'private' | 'friends';
        reviews: 'public' | 'private';
        wishlist: 'public' | 'private' | 'friends';
    };
}

// Shopping preferences
export interface ShoppingPreferences {
    defaultStore: string | null;
    preferredDeliveryMethod: 'pickup' | 'delivery' | 'shipping';
    autoReorder: boolean;
    substituteItems: boolean;
    organicPreference: boolean;
    allergyRestrictions: string[];
    dietaryRestrictions: string[];
    budgetAlerts: {
        enabled: boolean;
        monthlyLimit: number;
        weeklyLimit: number;
    };
    recommendations: {
        enabled: boolean;
        basedOnPurchases: boolean;
        basedOnBrowsing: boolean;
        basedOnWishlist: boolean;
    };
}

// Payment method
export interface PaymentMethod {
    id: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'gift_card';
    nickname: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    billingAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    addedAt: string;
    lastUsed?: string;
}

// Order history item
export interface OrderHistoryItem {
    id: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    total: number;
    itemCount: number;
    orderDate: string;
    deliveryDate?: string;
    deliveryMethod: 'pickup' | 'delivery' | 'shipping';
    storeId?: string;
    storeName?: string;
    items: Array<{
        productId: string;
        name: string;
        image: string;
        quantity: number;
        price: number;
    }>;
    tracking?: {
        number: string;
        carrier: string;
        url: string;
    };
}

// User activity log
export interface UserActivity {
    id: string;
    type: ActivityType;
    description: string;
    metadata: Record<string, any>;
    timestamp: string;
    location?: {
        storeId?: string;
        city?: string;
        state?: string;
    };
}

// Loyalty program info
export interface LoyaltyProgram {
    id: string;
    name: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    points: number;
    pointsToNextTier: number;
    benefits: string[];
    expirationDate?: string;
    cashbackEarned: number;
    cashbackAvailable: number;
}

// Subscription info
export interface UserSubscription {
    type: SubscriptionType;
    status: 'active' | 'cancelled' | 'expired' | 'paused';
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    benefits: string[];
    price: number;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
}

// User statistics
export interface UserStatistics {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteCategory: string;
    totalSavings: number;
    reviewsWritten: number;
    helpfulVotes: number;
    accountAge: number; // days
    lastOrderDate?: string;
    mostOrderedProducts: Array<{
        productId: string;
        name: string;
        orderCount: number;
    }>;
}

// Support ticket
export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'order' | 'payment' | 'technical' | 'product' | 'delivery' | 'refund' | 'other';
    createdAt: string;
    updatedAt: string;
    messages: Array<{
        id: string;
        sender: 'user' | 'support';
        message: string;
        timestamp: string;
        attachments?: string[];
    }>;
}

// User state interface
export interface UserState {
    // Profile information
    profile: {
        displayName: string;
        avatar?: string;
        bio?: string;
        dateOfBirth?: string;
        gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
        phoneNumber?: string;
        alternateEmail?: string;
        emergencyContact?: {
            name: string;
            phone: string;
            relationship: string;
        };
    };

    // Preferences
    notifications: NotificationPreferences;
    privacy: PrivacySettings;
    shopping: ShoppingPreferences;

    // Payment and billing
    paymentMethods: PaymentMethod[];
    defaultPaymentMethod: string | null;

    // Order history
    orderHistory: OrderHistoryItem[];
    orderHistoryLoading: boolean;

    // Activity and analytics
    activityLog: UserActivity[];
    statistics: UserStatistics;

    // Loyalty and subscriptions
    loyaltyProgram: LoyaltyProgram | null;
    subscription: UserSubscription | null;

    // Support
    supportTickets: SupportTicket[];
    activeSupportTicket: SupportTicket | null;

    // Social features
    following: string[];
    followers: string[];
    friends: string[];

    // Preferences and settings
    language: string;
    currency: string;
    timezone: string;

    // App usage
    lastActiveAt: string;
    sessionCount: number;
    appRating?: number;
    feedbackGiven: boolean;

    // Loading states
    isLoading: boolean;
    error: string | null;
}

// User actions interface
export interface UserActions {
    // Profile management
    updateProfile: (updates: Partial<UserState['profile']>) => Promise<boolean>;
    uploadAvatar: (imageUri: string) => Promise<boolean>;
    deleteAvatar: () => Promise<boolean>;

    // Preferences
    updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
    updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<boolean>;
    updateShoppingPreferences: (preferences: Partial<ShoppingPreferences>) => Promise<boolean>;

    // Batch operations
    batchUpdatePreferences: (updates: {
        notifications?: Partial<NotificationPreferences>;
        privacy?: Partial<PrivacySettings>;
        shopping?: Partial<ShoppingPreferences>;
    }) => Promise<boolean>;

    // Payment methods
    addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'addedAt'>) => Promise<boolean>;
    updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => Promise<boolean>;
    removePaymentMethod: (methodId: string) => Promise<boolean>;
    setDefaultPaymentMethod: (methodId: string) => Promise<boolean>;

    // Order history
    fetchOrderHistory: (page?: number, limit?: number) => Promise<void>;
    getOrderDetails: (orderId: string) => Promise<OrderHistoryItem | null>;
    reorderItems: (orderId: string) => Promise<boolean>;
    cancelOrder: (orderId: string) => Promise<boolean>;
    returnOrder: (orderId: string, items?: string[]) => Promise<boolean>;

    // Activity tracking
    logActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => void;
    getActivityByType: (type: ActivityType) => UserActivity[];
    clearActivityLog: () => Promise<boolean>;

    // Loyalty program
    fetchLoyaltyProgram: () => Promise<void>;
    redeemPoints: (points: number, rewardId: string) => Promise<boolean>;

    // Subscription management
    upgradeSubscription: (type: SubscriptionType) => Promise<boolean>;
    cancelSubscription: () => Promise<boolean>;
    renewSubscription: () => Promise<boolean>;

    // Support
    createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => Promise<string>;
    updateSupportTicket: (ticketId: string, message: string, attachments?: string[]) => Promise<boolean>;
    closeSupportTicket: (ticketId: string) => Promise<boolean>;
    fetchSupportTickets: () => Promise<void>;

    // Social features
    followUser: (userId: string) => Promise<boolean>;
    unfollowUser: (userId: string) => Promise<boolean>;
    addFriend: (userId: string) => Promise<boolean>;
    removeFriend: (userId: string) => Promise<boolean>;

    // Settings
    updateLanguage: (language: string) => Promise<boolean>;
    updateCurrency: (currency: string) => Promise<boolean>;
    updateTimezone: (timezone: string) => Promise<boolean>;

    // App feedback
    rateApp: (rating: number, feedback?: string) => Promise<boolean>;
    submitFeedback: (feedback: string, category: string) => Promise<boolean>;

    // Data management
    exportUserData: () => Promise<string>;
    deleteUserData: () => Promise<boolean>;

    // Statistics
    updateStatistics: () => Promise<void>;

    // Session management
    updateLastActive: () => void;
    incrementSessionCount: () => void;

    // Error handling
    setError: (error: string | null) => void;
    clearError: () => void;

    // Utilities
    validateProfile: () => { isValid: boolean; errors: string[] };
    getProfileCompletion: () => number;
    getSavingsThisMonth: () => number;
    getOrdersThisMonth: () => number;
}

// Validation utilities
export const ValidationUtils = {
    isValidEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhoneNumber: (phone: string): boolean => {
        const phoneRegex = /^\+?[\d\s-()]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    isValidDisplayName: (name: string): boolean => {
        return name.trim().length >= 2 && name.trim().length <= 50;
    },

    validateProfile: (profile: UserState['profile']): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!ValidationUtils.isValidDisplayName(profile.displayName)) {
            errors.push('Display name must be between 2 and 50 characters');
        }

        if (profile.alternateEmail && !ValidationUtils.isValidEmail(profile.alternateEmail)) {
            errors.push('Please enter a valid email address');
        }

        if (profile.phoneNumber && !ValidationUtils.isValidPhoneNumber(profile.phoneNumber)) {
            errors.push('Please enter a valid phone number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Error handling wrapper
const withErrorHandling = <T extends any[], R>(
    operation: string,
    fn: (...args: T) => Promise<R>
) => {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`${operation} error:`, error);
            throw error;
        }
    };
};

// Initial state
const initialState: UserState = {
    // Profile information
    profile: {
        displayName: '',
    },

    // Preferences
    notifications: {
        pushNotifications: {
            enabled: true,
            orderUpdates: true,
            promotions: true,
            stockAlerts: true,
            priceDrops: true,
            recommendations: false,
            security: true,
        },
        emailNotifications: {
            enabled: true,
            newsletter: false,
            orderConfirmations: true,
            promotions: false,
            accountUpdates: true,
            weeklyDigest: false,
            abandonedCart: true,
        },
        smsNotifications: {
            enabled: false,
            orderUpdates: false,
            deliveryAlerts: false,
            securityAlerts: true,
            promotions: false,
        },
    },

    privacy: {
        dataCollection: {
            analytics: true,
            personalization: true,
            marketing: false,
            location: true,
        },
        sharing: {
            socialMedia: false,
            thirdPartyPartners: false,
            advertisers: false,
        },
        visibility: {
            profile: 'private',
            purchases: 'private',
            reviews: 'public',
            wishlist: 'private',
        },
    },

    shopping: {
        defaultStore: null,
        preferredDeliveryMethod: 'pickup',
        autoReorder: false,
        substituteItems: true,
        organicPreference: false,
        allergyRestrictions: [],
        dietaryRestrictions: [],
        budgetAlerts: {
            enabled: false,
            monthlyLimit: 0,
            weeklyLimit: 0,
        },
        recommendations: {
            enabled: true,
            basedOnPurchases: true,
            basedOnBrowsing: true,
            basedOnWishlist: true,
        },
    },

    // Payment and billing
    paymentMethods: [],
    defaultPaymentMethod: null,

    // Order history
    orderHistory: [],
    orderHistoryLoading: false,

    // Activity and analytics
    activityLog: [],
    statistics: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteCategory: '',
        totalSavings: 0,
        reviewsWritten: 0,
        helpfulVotes: 0,
        accountAge: 0,
        mostOrderedProducts: [],
    },

    // Loyalty and subscriptions
    loyaltyProgram: null,
    subscription: null,

    // Support
    supportTickets: [],
    activeSupportTicket: null,

    // Social features
    following: [],
    followers: [],
    friends: [],

    // Preferences and settings
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',

    // App usage
    lastActiveAt: new Date().toISOString(),
    sessionCount: 0,
    feedbackGiven: false,

    // Loading states
    isLoading: false,
    error: null,
};

// Helper functions
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create the store
export const useUserStore = create<UserState & UserActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,

                // Profile management
                updateProfile: withErrorHandling('update profile', async (updates: Partial<UserState['profile']>) => {
                    // Validate updates
                    const currentProfile = get().profile;
                    const updatedProfile = { ...currentProfile, ...updates };
                    const validation = ValidationUtils.validateProfile(updatedProfile);

                    if (!validation.isValid) {
                        get().setError(validation.errors.join(', '));
                        throw new Error(validation.errors.join(', '));
                    }

                    set((state) => {
                        state.isLoading = true;
                        state.error = null;
                    });

                    // Mock API call
                    await new Promise(resolve => setTimeout(resolve, 500));

                    set((state) => {
                        Object.assign(state.profile, updates);
                        state.isLoading = false;
                    });

                    // Log activity
                    get().logActivity({
                        type: 'profile_update',
                        description: 'Profile updated',
                        metadata: { updates },
                    });

                    return true;
                }),

                uploadAvatar: async (imageUri: string) => {
                    try {
                        set((state) => {
                            state.isLoading = true;
                        });

                        // Mock upload
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        // Mock uploaded URL
                        const avatarUrl = `https://via.placeholder.com/150x150/0071ce/ffffff?text=Avatar`;

                        set((state) => {
                            state.profile.avatar = avatarUrl;
                            state.isLoading = false;
                        });

                        get().logActivity({
                            type: 'avatar_upload',
                            description: 'Avatar uploaded',
                            metadata: { imageUri },
                        });

                        return true;
                    } catch (error) {
                        console.error('Upload avatar error:', error);
                        get().setError('Failed to upload avatar');
                        return false;
                    }
                },

                deleteAvatar: async () => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        set((state) => {
                            state.profile.avatar = undefined;
                        });

                        get().logActivity({
                            type: 'avatar_delete',
                            description: 'Avatar deleted',
                            metadata: {},
                        });

                        return true;
                    } catch (error) {
                        console.error('Delete avatar error:', error);
                        get().setError('Failed to delete avatar');
                        return false;
                    }
                },

                // Preferences
                updateNotificationPreferences: async (preferences: Partial<NotificationPreferences>) => {
                    try {
                        set((state) => {
                            Object.assign(state.notifications, preferences);
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Update notification preferences error:', error);
                        get().setError('Failed to update notification preferences');
                        return false;
                    }
                },

                updatePrivacySettings: async (settings: Partial<PrivacySettings>) => {
                    try {
                        set((state) => {
                            Object.assign(state.privacy, settings);
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Update privacy settings error:', error);
                        get().setError('Failed to update privacy settings');
                        return false;
                    }
                },

                updateShoppingPreferences: async (preferences: Partial<ShoppingPreferences>) => {
                    try {
                        set((state) => {
                            Object.assign(state.shopping, preferences);
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Update shopping preferences error:', error);
                        get().setError('Failed to update shopping preferences');
                        return false;
                    }
                },

                // Batch operations
                batchUpdatePreferences: async (updates: {
                    notifications?: Partial<NotificationPreferences>;
                    privacy?: Partial<PrivacySettings>;
                    shopping?: Partial<ShoppingPreferences>;
                }) => {
                    try {
                        set((state) => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        // Mock API call for batch update
                        await new Promise(resolve => setTimeout(resolve, 800));

                        set((state) => {
                            if (updates.notifications) {
                                Object.assign(state.notifications, updates.notifications);
                            }
                            if (updates.privacy) {
                                Object.assign(state.privacy, updates.privacy);
                            }
                            if (updates.shopping) {
                                Object.assign(state.shopping, updates.shopping);
                            }
                            state.isLoading = false;
                        });

                        get().logActivity({
                            type: 'profile_update',
                            description: 'Preferences updated in batch',
                            metadata: { updatedSections: Object.keys(updates) },
                        });

                        return true;
                    } catch (error) {
                        console.error('Batch update preferences error:', error);
                        get().setError('Failed to update preferences');
                        return false;
                    }
                },

                // Payment methods
                addPaymentMethod: async (method: Omit<PaymentMethod, 'id' | 'addedAt'>) => {
                    try {
                        const newMethod: PaymentMethod = {
                            ...method,
                            id: generateId(),
                            addedAt: new Date().toISOString(),
                        };

                        set((state) => {
                            state.paymentMethods.push(newMethod);

                            // Set as default if it's the first payment method
                            if (state.paymentMethods.length === 1) {
                                state.defaultPaymentMethod = newMethod.id;
                                newMethod.isDefault = true;
                            }
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 800));

                        return true;
                    } catch (error) {
                        console.error('Add payment method error:', error);
                        get().setError('Failed to add payment method');
                        return false;
                    }
                },

                updatePaymentMethod: async (methodId: string, updates: Partial<PaymentMethod>) => {
                    try {
                        set((state) => {
                            const methodIndex = state.paymentMethods.findIndex(m => m.id === methodId);
                            if (methodIndex !== -1) {
                                Object.assign(state.paymentMethods[methodIndex], updates);
                            }
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        return true;
                    } catch (error) {
                        console.error('Update payment method error:', error);
                        get().setError('Failed to update payment method');
                        return false;
                    }
                },

                removePaymentMethod: async (methodId: string) => {
                    try {
                        set((state) => {
                            state.paymentMethods = state.paymentMethods.filter(m => m.id !== methodId);

                            // Update default if removed method was default
                            if (state.defaultPaymentMethod === methodId) {
                                state.defaultPaymentMethod = state.paymentMethods.length > 0 ? state.paymentMethods[0].id : null;
                                if (state.paymentMethods.length > 0) {
                                    state.paymentMethods[0].isDefault = true;
                                }
                            }
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Remove payment method error:', error);
                        get().setError('Failed to remove payment method');
                        return false;
                    }
                },

                setDefaultPaymentMethod: async (methodId: string) => {
                    try {
                        set((state) => {
                            state.paymentMethods.forEach(method => {
                                method.isDefault = method.id === methodId;
                            });
                            state.defaultPaymentMethod = methodId;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Set default payment method error:', error);
                        get().setError('Failed to set default payment method');
                        return false;
                    }
                },

                // Order history
                fetchOrderHistory: async (page: number = 1, limit: number = 20) => {
                    try {
                        set((state) => {
                            state.orderHistoryLoading = true;
                            state.error = null;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 800));

                        // Mock order history
                        const mockOrders: OrderHistoryItem[] = Array.from({ length: limit }, (_, i) => ({
                            id: `order_${page}_${i}`,
                            orderNumber: `ORD${String(page * 1000 + i).padStart(6, '0')}`,
                            status: ['delivered', 'shipped', 'confirmed', 'preparing'][Math.floor(Math.random() * 4)] as any,
                            total: Math.round((Math.random() * 200 + 50) * 100) / 100,
                            itemCount: Math.floor(Math.random() * 5) + 1,
                            orderDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                            deliveryMethod: ['pickup', 'delivery', 'shipping'][Math.floor(Math.random() * 3)] as any,
                            storeId: `store_${Math.floor(Math.random() * 10)}`,
                            storeName: `Walmart Store #${Math.floor(Math.random() * 1000)}`,
                            items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
                                productId: `product_${i}_${j}`,
                                name: `Product ${i}-${j}`,
                                image: `https://via.placeholder.com/100x100/0071ce/ffffff?text=Item+${j + 1}`,
                                quantity: Math.floor(Math.random() * 3) + 1,
                                price: Math.round((Math.random() * 50 + 10) * 100) / 100,
                            })),
                        }));

                        set((state) => {
                            if (page === 1) {
                                state.orderHistory = mockOrders;
                            } else {
                                state.orderHistory.push(...mockOrders);
                            }
                            state.orderHistoryLoading = false;
                        });
                    } catch (error) {
                        console.error('Fetch order history error:', error);
                        set((state) => {
                            state.orderHistoryLoading = false;
                            state.error = 'Failed to load order history';
                        });
                    }
                },

                getOrderDetails: async (orderId: string) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        const order = get().orderHistory.find(o => o.id === orderId);
                        return order || null;
                    } catch (error) {
                        console.error('Get order details error:', error);
                        get().setError('Failed to load order details');
                        return null;
                    }
                },

                reorderItems: async (orderId: string) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // In a real app, this would add items to cart
                        get().logActivity({
                            type: 'purchase',
                            description: 'Items reordered',
                            metadata: { orderId },
                        });

                        return true;
                    } catch (error) {
                        console.error('Reorder items error:', error);
                        get().setError('Failed to reorder items');
                        return false;
                    }
                },

                cancelOrder: async (orderId: string) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 800));

                        set((state) => {
                            const orderIndex = state.orderHistory.findIndex(o => o.id === orderId);
                            if (orderIndex !== -1) {
                                state.orderHistory[orderIndex].status = 'cancelled';
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Cancel order error:', error);
                        get().setError('Failed to cancel order');
                        return false;
                    }
                },

                returnOrder: async (orderId: string, items?: string[]) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        set((state) => {
                            const orderIndex = state.orderHistory.findIndex(o => o.id === orderId);
                            if (orderIndex !== -1) {
                                state.orderHistory[orderIndex].status = 'returned';
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Return order error:', error);
                        get().setError('Failed to return order');
                        return false;
                    }
                },

                // Activity tracking
                logActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
                    const newActivity: UserActivity = {
                        ...activity,
                        id: generateId(),
                        timestamp: new Date().toISOString(),
                    };

                    set((state) => {
                        state.activityLog.unshift(newActivity);

                        // Keep only last 100 activities
                        if (state.activityLog.length > 100) {
                            state.activityLog = state.activityLog.slice(0, 100);
                        }
                    });
                },

                getActivityByType: (type: ActivityType) => {
                    return get().activityLog.filter(activity => activity.type === type);
                },

                clearActivityLog: async () => {
                    try {
                        set((state) => {
                            state.activityLog = [];
                        });

                        return true;
                    } catch (error) {
                        console.error('Clear activity log error:', error);
                        get().setError('Failed to clear activity log');
                        return false;
                    }
                },

                // Loyalty program
                fetchLoyaltyProgram: async () => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 600));

                        const mockLoyalty: LoyaltyProgram = {
                            id: 'walmart_rewards',
                            name: 'Walmart Rewards',
                            tier: 'silver',
                            points: 2450,
                            pointsToNextTier: 550,
                            benefits: [
                                'Free shipping on orders over $35',
                                '2% cashback on purchases',
                                'Early access to sales',
                                'Birthday rewards',
                            ],
                            cashbackEarned: 125.50,
                            cashbackAvailable: 45.75,
                        };

                        set((state) => {
                            state.loyaltyProgram = mockLoyalty;
                        });
                    } catch (error) {
                        console.error('Fetch loyalty program error:', error);
                        get().setError('Failed to load loyalty program');
                    }
                },

                redeemPoints: async (points: number, rewardId: string) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 800));

                        set((state) => {
                            if (state.loyaltyProgram && state.loyaltyProgram.points >= points) {
                                state.loyaltyProgram.points -= points;
                            }
                        });

                        get().logActivity({
                            type: 'promotion_use',
                            description: `Redeemed ${points} points`,
                            metadata: { points, rewardId },
                        });

                        return true;
                    } catch (error) {
                        console.error('Redeem points error:', error);
                        get().setError('Failed to redeem points');
                        return false;
                    }
                },

                // Subscription management
                upgradeSubscription: async (type: SubscriptionType) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        const mockSubscription: UserSubscription = {
                            type,
                            status: 'active',
                            startDate: new Date().toISOString(),
                            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                            autoRenew: true,
                            benefits: [
                                'Free shipping',
                                'Member prices',
                                'Early access',
                                'Free delivery',
                            ],
                            price: type === 'walmart_plus' ? 98 : 49,
                            billingCycle: 'yearly',
                            nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        };

                        set((state) => {
                            state.subscription = mockSubscription;
                        });

                        return true;
                    } catch (error) {
                        console.error('Upgrade subscription error:', error);
                        get().setError('Failed to upgrade subscription');
                        return false;
                    }
                },

                cancelSubscription: async () => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 800));

                        set((state) => {
                            if (state.subscription) {
                                state.subscription.status = 'cancelled';
                                state.subscription.autoRenew = false;
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Cancel subscription error:', error);
                        get().setError('Failed to cancel subscription');
                        return false;
                    }
                },

                renewSubscription: async () => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 800));

                        set((state) => {
                            if (state.subscription) {
                                state.subscription.status = 'active';
                                state.subscription.autoRenew = true;
                                state.subscription.startDate = new Date().toISOString();
                                state.subscription.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
                                state.subscription.nextBillingDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
                            }
                        });

                        return true;
                    } catch (error) {
                        console.error('Renew subscription error:', error);
                        get().setError('Failed to renew subscription');
                        return false;
                    }
                },

                // Support
                createSupportTicket: async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => {
                    try {
                        const newTicket: SupportTicket = {
                            ...ticket,
                            id: generateId(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            messages: [
                                {
                                    id: generateId(),
                                    sender: 'user',
                                    message: ticket.description,
                                    timestamp: new Date().toISOString(),
                                },
                            ],
                        };

                        set((state) => {
                            state.supportTickets.unshift(newTicket);
                            state.activeSupportTicket = newTicket;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 600));

                        get().logActivity({
                            type: 'support_contact',
                            description: 'Support ticket created',
                            metadata: { ticketId: newTicket.id, subject: ticket.subject },
                        });

                        return newTicket.id;
                    } catch (error) {
                        console.error('Create support ticket error:', error);
                        get().setError('Failed to create support ticket');
                        throw error;
                    }
                },

                updateSupportTicket: async (ticketId: string, message: string, attachments?: string[]) => {
                    try {
                        const newMessage = {
                            id: generateId(),
                            sender: 'user' as const,
                            message,
                            timestamp: new Date().toISOString(),
                            attachments,
                        };

                        set((state) => {
                            const ticketIndex = state.supportTickets.findIndex(t => t.id === ticketId);
                            if (ticketIndex !== -1) {
                                state.supportTickets[ticketIndex].messages.push(newMessage);
                                state.supportTickets[ticketIndex].updatedAt = new Date().toISOString();
                            }
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 400));

                        return true;
                    } catch (error) {
                        console.error('Update support ticket error:', error);
                        get().setError('Failed to update support ticket');
                        return false;
                    }
                },

                closeSupportTicket: async (ticketId: string) => {
                    try {
                        set((state) => {
                            const ticketIndex = state.supportTickets.findIndex(t => t.id === ticketId);
                            if (ticketIndex !== -1) {
                                state.supportTickets[ticketIndex].status = 'closed';
                                state.supportTickets[ticketIndex].updatedAt = new Date().toISOString();
                            }

                            if (state.activeSupportTicket?.id === ticketId) {
                                state.activeSupportTicket = null;
                            }
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Close support ticket error:', error);
                        get().setError('Failed to close support ticket');
                        return false;
                    }
                },

                fetchSupportTickets: async () => {
                    try {
                        set((state) => {
                            state.isLoading = true;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 600));

                        // Mock support tickets would be loaded from the server
                        set((state) => {
                            state.isLoading = false;
                        });
                    } catch (error) {
                        console.error('Fetch support tickets error:', error);
                        set((state) => {
                            state.isLoading = false;
                            state.error = 'Failed to load support tickets';
                        });
                    }
                },

                // Social features
                followUser: async (userId: string) => {
                    try {
                        set((state) => {
                            if (!state.following.includes(userId)) {
                                state.following.push(userId);
                            }
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 400));

                        return true;
                    } catch (error) {
                        console.error('Follow user error:', error);
                        get().setError('Failed to follow user');
                        return false;
                    }
                },

                unfollowUser: async (userId: string) => {
                    try {
                        set((state) => {
                            state.following = state.following.filter(id => id !== userId);
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 400));

                        return true;
                    } catch (error) {
                        console.error('Unfollow user error:', error);
                        get().setError('Failed to unfollow user');
                        return false;
                    }
                },

                addFriend: async (userId: string) => {
                    try {
                        set((state) => {
                            if (!state.friends.includes(userId)) {
                                state.friends.push(userId);
                            }
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        return true;
                    } catch (error) {
                        console.error('Add friend error:', error);
                        get().setError('Failed to add friend');
                        return false;
                    }
                },

                removeFriend: async (userId: string) => {
                    try {
                        set((state) => {
                            state.friends = state.friends.filter(id => id !== userId);
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 400));

                        return true;
                    } catch (error) {
                        console.error('Remove friend error:', error);
                        get().setError('Failed to remove friend');
                        return false;
                    }
                },

                // Settings
                updateLanguage: async (language: string) => {
                    try {
                        set((state) => {
                            state.language = language;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Update language error:', error);
                        get().setError('Failed to update language');
                        return false;
                    }
                },

                updateCurrency: async (currency: string) => {
                    try {
                        set((state) => {
                            state.currency = currency;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Update currency error:', error);
                        get().setError('Failed to update currency');
                        return false;
                    }
                },

                updateTimezone: async (timezone: string) => {
                    try {
                        set((state) => {
                            state.timezone = timezone;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 300));

                        return true;
                    } catch (error) {
                        console.error('Update timezone error:', error);
                        get().setError('Failed to update timezone');
                        return false;
                    }
                },

                // App feedback
                rateApp: async (rating: number, feedback?: string) => {
                    try {
                        set((state) => {
                            state.appRating = rating;
                            state.feedbackGiven = true;
                        });

                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 500));

                        get().logActivity({
                            type: 'support_contact',
                            description: 'App rated',
                            metadata: { rating, feedback },
                        });

                        return true;
                    } catch (error) {
                        console.error('Rate app error:', error);
                        get().setError('Failed to rate app');
                        return false;
                    }
                },

                submitFeedback: async (feedback: string, category: string) => {
                    try {
                        // Mock API call
                        await new Promise(resolve => setTimeout(resolve, 600));

                        get().logActivity({
                            type: 'support_contact',
                            description: 'Feedback submitted',
                            metadata: { feedback, category },
                        });

                        return true;
                    } catch (error) {
                        console.error('Submit feedback error:', error);
                        get().setError('Failed to submit feedback');
                        return false;
                    }
                },

                // Data management
                exportUserData: async () => {
                    try {
                        // Mock data export
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        const userData = {
                            profile: get().profile,
                            preferences: {
                                notifications: get().notifications,
                                privacy: get().privacy,
                                shopping: get().shopping,
                            },
                            orderHistory: get().orderHistory,
                            activityLog: get().activityLog,
                            statistics: get().statistics,
                            exportDate: new Date().toISOString(),
                        };

                        return JSON.stringify(userData, null, 2);
                    } catch (error) {
                        console.error('Export user data error:', error);
                        get().setError('Failed to export user data');
                        throw error;
                    }
                },

                deleteUserData: async () => {
                    try {
                        // Mock API call for data deletion
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Reset state to initial values
                        set(initialState);

                        return true;
                    } catch (error) {
                        console.error('Delete user data error:', error);
                        get().setError('Failed to delete user data');
                        return false;
                    }
                },

                // Statistics
                updateStatistics: async () => {
                    try {
                        const orderHistory = get().orderHistory;
                        const activityLog = get().activityLog;

                        // Calculate statistics from order history
                        const totalOrders = orderHistory.length;
                        const totalSpent = orderHistory.reduce((sum, order) => sum + order.total, 0);
                        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

                        // Find most frequent categories
                        const categoryCount: Record<string, number> = {};
                        activityLog.forEach(activity => {
                            if (activity.type === 'product_view' && activity.metadata.category) {
                                categoryCount[activity.metadata.category] = (categoryCount[activity.metadata.category] || 0) + 1;
                            }
                        });

                        const favoriteCategory = Object.entries(categoryCount).reduce(
                            (max, [category, count]) => count > max.count ? { category, count } : max,
                            { category: '', count: 0 }
                        ).category;

                        // Count reviews
                        const reviewsWritten = activityLog.filter(a => a.type === 'review').length;

                        // Calculate account age
                        const accountAge = Math.floor((Date.now() - new Date(get().profile.displayName ? Date.now() - 30 * 24 * 60 * 60 * 1000 : Date.now()).getTime()) / (24 * 60 * 60 * 1000));

                        set((state) => {
                            state.statistics = {
                                totalOrders,
                                totalSpent: Math.round(totalSpent * 100) / 100,
                                averageOrderValue: Math.round(averageOrderValue * 100) / 100,
                                favoriteCategory,
                                totalSavings: Math.round(totalSpent * 0.15 * 100) / 100, // Mock 15% savings
                                reviewsWritten,
                                helpfulVotes: reviewsWritten * 3, // Mock helpful votes
                                accountAge,
                                lastOrderDate: orderHistory.length > 0 ? orderHistory[0].orderDate : undefined,
                                mostOrderedProducts: [], // Would be calculated from order details
                            };
                        });
                    } catch (error) {
                        console.error('Update statistics error:', error);
                        get().setError('Failed to update statistics');
                    }
                },

                // Session management
                updateLastActive: () => {
                    set((state) => {
                        state.lastActiveAt = new Date().toISOString();
                    });
                },

                incrementSessionCount: () => {
                    set((state) => {
                        state.sessionCount += 1;
                    });
                },

                // Error handling
                setError: (error: string | null) => {
                    set((state) => {
                        state.error = error;
                        state.isLoading = false;
                    });
                },

                clearError: () => {
                    set((state) => {
                        state.error = null;
                    });
                },

                // Utilities
                validateProfile: () => {
                    const profile = get().profile;
                    return ValidationUtils.validateProfile(profile);
                },

                getProfileCompletion: () => {
                    const profile = get().profile;
                    const fields = ['displayName', 'avatar', 'bio', 'dateOfBirth', 'phoneNumber'];
                    const completedFields = fields.filter(field => {
                        const value = profile[field as keyof typeof profile];
                        return value && String(value).trim();
                    });

                    return Math.round((completedFields.length / fields.length) * 100);
                },

                getSavingsThisMonth: () => {
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();

                    const monthlyOrders = get().orderHistory.filter(order => {
                        const orderDate = new Date(order.orderDate);
                        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                    });

                    // Mock savings calculation (15% of total spent)
                    const totalSpent = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
                    return Math.round(totalSpent * 0.15 * 100) / 100;
                },

                getOrdersThisMonth: () => {
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();

                    return get().orderHistory.filter(order => {
                        const orderDate = new Date(order.orderDate);
                        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                    }).length;
                },
            })),
            {
                name: 'walmart-user-store',
                storage: {
                    getItem: (name) => asyncStorage.getItem(name as any),
                    setItem: (name, value) => asyncStorage.setItem(name as any, value),
                    removeItem: (name) => asyncStorage.removeItem(name as any),
                },
                partialize: (state) => ({
                    // Persist user data and preferences
                    profile: state.profile,
                    notifications: state.notifications,
                    privacy: state.privacy,
                    shopping: state.shopping,
                    paymentMethods: state.paymentMethods,
                    defaultPaymentMethod: state.defaultPaymentMethod,
                    orderHistory: state.orderHistory.slice(0, 50), // Limit persisted order history
                    activityLog: state.activityLog.slice(0, 50), // Limit persisted activity log
                    statistics: state.statistics,
                    loyaltyProgram: state.loyaltyProgram,
                    subscription: state.subscription,
                    supportTickets: state.supportTickets.slice(0, 10), // Limit persisted tickets
                    following: state.following,
                    followers: state.followers,
                    friends: state.friends,
                    language: state.language,
                    currency: state.currency,
                    timezone: state.timezone,
                    sessionCount: state.sessionCount,
                    appRating: state.appRating,
                    feedbackGiven: state.feedbackGiven,
                }),
            }
        ),
        {
            name: 'user-store',
        }
    )
);

// Selectors for common use cases
export const useUserProfile = () => useUserStore((state) => ({
    profile: state.profile,
    updateProfile: state.updateProfile,
    uploadAvatar: state.uploadAvatar,
    deleteAvatar: state.deleteAvatar,
    validateProfile: state.validateProfile,
    getProfileCompletion: state.getProfileCompletion,
}));

export const useUserPreferences = () => useUserStore((state) => ({
    notifications: state.notifications,
    privacy: state.privacy,
    shopping: state.shopping,
    updateNotificationPreferences: state.updateNotificationPreferences,
    updatePrivacySettings: state.updatePrivacySettings,
    updateShoppingPreferences: state.updateShoppingPreferences,
    batchUpdatePreferences: state.batchUpdatePreferences,
}));

export const usePaymentMethods = () => useUserStore((state) => ({
    paymentMethods: state.paymentMethods,
    defaultPaymentMethod: state.defaultPaymentMethod,
    addPaymentMethod: state.addPaymentMethod,
    updatePaymentMethod: state.updatePaymentMethod,
    removePaymentMethod: state.removePaymentMethod,
    setDefaultPaymentMethod: state.setDefaultPaymentMethod,
}));

export const useOrderHistory = () => useUserStore((state) => ({
    orderHistory: state.orderHistory,
    orderHistoryLoading: state.orderHistoryLoading,
    fetchOrderHistory: state.fetchOrderHistory,
    getOrderDetails: state.getOrderDetails,
    reorderItems: state.reorderItems,
    cancelOrder: state.cancelOrder,
    returnOrder: state.returnOrder,
}));

export const useUserActivity = () => useUserStore((state) => ({
    activityLog: state.activityLog,
    logActivity: state.logActivity,
    getActivityByType: state.getActivityByType,
    clearActivityLog: state.clearActivityLog,
}));

export const useUserStatistics = () => useUserStore((state) => ({
    statistics: state.statistics,
    updateStatistics: state.updateStatistics,
    getSavingsThisMonth: state.getSavingsThisMonth,
    getOrdersThisMonth: state.getOrdersThisMonth,
}));

export const useLoyaltyProgram = () => useUserStore((state) => ({
    loyaltyProgram: state.loyaltyProgram,
    fetchLoyaltyProgram: state.fetchLoyaltyProgram,
    redeemPoints: state.redeemPoints,
}));

export const useUserSubscription = () => useUserStore((state) => ({
    subscription: state.subscription,
    upgradeSubscription: state.upgradeSubscription,
    cancelSubscription: state.cancelSubscription,
    renewSubscription: state.renewSubscription,
}));

export const useSupportTickets = () => useUserStore((state) => ({
    supportTickets: state.supportTickets,
    activeSupportTicket: state.activeSupportTicket,
    createSupportTicket: state.createSupportTicket,
    updateSupportTicket: state.updateSupportTicket,
    closeSupportTicket: state.closeSupportTicket,
    fetchSupportTickets: state.fetchSupportTickets,
}));

export const useUserSettings = () => useUserStore((state) => ({
    language: state.language,
    currency: state.currency,
    timezone: state.timezone,
    updateLanguage: state.updateLanguage,
    updateCurrency: state.updateCurrency,
    updateTimezone: state.updateTimezone,
}));

export const useUserSocial = () => useUserStore((state) => ({
    following: state.following,
    followers: state.followers,
    friends: state.friends,
    followUser: state.followUser,
    unfollowUser: state.unfollowUser,
    addFriend: state.addFriend,
    removeFriend: state.removeFriend,
}));
