import { apiClient } from './client';
import { API } from '@/config/constants';

// Types
export interface User {
    id: string;
    email: string;
    username?: string;
    firstName: string;
    lastName: string;
    displayName: string;
    phone?: string;
    avatar?: UserAvatar;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';

    // Account Status
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    isActive: boolean;
    isSuspended: boolean;
    suspensionReason?: string;

    // Membership
    walmartPlus: WalmartPlusMembership;
    loyaltyProgram?: LoyaltyProgram;

    // Profile Information
    addresses: UserAddress[];
    paymentMethods: UserPaymentMethod[];
    preferences: UserPreferences;
    privacy: PrivacySettings;
    notifications: NotificationSettings;

    // Shopping Behavior
    shoppingProfile: ShoppingProfile;
    interests: UserInterest[];

    // Account Security
    security: SecuritySettings;

    // Social Features
    social: SocialProfile;

    // Statistics
    statistics: UserStatistics;

    // Metadata
    metadata: UserMetadata;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    lastActiveAt: string;
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending_verification';

export interface UserAvatar {
    url: string;
    thumbnailUrl: string;
    isDefault: boolean;
    uploadedAt: string;
}

export interface WalmartPlusMembership {
    isActive: boolean;
    planType?: 'monthly' | 'annual';
    startDate?: string;
    expiryDate?: string;
    renewalDate?: string;
    autoRenewal: boolean;
    benefits: MembershipBenefit[];
    savings: MembershipSavings;
    paymentMethodId?: string;
}

export interface MembershipBenefit {
    type: 'free_delivery' | 'fuel_discount' | 'scan_and_go' | 'early_access' | 'streaming' | 'pharmacy';
    name: string;
    description: string;
    isActive: boolean;
    usage?: BenefitUsage;
}

export interface BenefitUsage {
    timesUsed: number;
    lastUsed?: string;
    estimatedSavings: number;
}

export interface MembershipSavings {
    totalSavings: number;
    deliverySavings: number;
    fuelSavings: number;
    currentMonthSavings: number;
    lastUpdated: string;
}

export interface LoyaltyProgram {
    programId: string;
    programName: string;
    tier: string;
    points: number;
    pointsToNextTier?: number;
    nextTier?: string;
    lifetimePoints: number;
    expiringPoints?: ExpiringPoints[];
    benefits: string[];
    memberSince: string;
}

export interface ExpiringPoints {
    points: number;
    expiryDate: string;
}

export interface UserAddress {
    id: string;
    type: 'home' | 'work' | 'other';
    label?: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    isVerified: boolean;
    deliveryInstructions?: string;
    accessCodes?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface UserPaymentMethod {
    id: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'walmart_pay' | 'gift_card';
    isDefault: boolean;
    nickname?: string;

    // Card Details (masked)
    lastFourDigits?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardBrand?: string;
    cardType?: string;

    // Billing Information
    cardholderName?: string;
    billingAddress?: UserAddress;

    // Status
    isActive: boolean;
    isExpired: boolean;
    isVerified: boolean;

    // Digital Wallet Info
    walletProvider?: string;
    walletAccountId?: string;

    // Metadata
    addedAt: string;
    lastUsed?: string;
    usageCount: number;
}

export interface UserPreferences {
    // Language & Region
    language: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    measurementUnit: 'metric' | 'imperial';

    // Shopping Preferences
    shopping: ShoppingPreferences;

    // Communication Preferences
    communication: CommunicationPreferences;

    // Accessibility
    accessibility: AccessibilityPreferences;

    // App Experience
    app: AppPreferences;
}

export interface ShoppingPreferences {
    defaultShippingAddress?: string;
    defaultPaymentMethod?: string;
    defaultDeliveryMethod: 'delivery' | 'pickup' | 'fastest';
    preferredStore?: string;
    autoSaveToWishlist: boolean;
    showOutOfStockItems: boolean;
    priceAlerts: boolean;
    stockAlerts: boolean;
    sizePreferences: Record<string, string>; // category -> preferred size
    brandPreferences: string[];
    categoryPreferences: string[];
    budgetAlerts: boolean;
    monthlyBudget?: number;
}

export interface CommunicationPreferences {
    emailMarketing: boolean;
    smsMarketing: boolean;
    pushNotifications: boolean;
    orderUpdates: boolean;
    promotionalOffers: boolean;
    productRecommendations: boolean;
    priceDropAlerts: boolean;
    restockNotifications: boolean;
    reviewReminders: boolean;
    surveyInvitations: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface AccessibilityPreferences {
    largeText: boolean;
    highContrast: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
    audioDescriptions: boolean;
    subtitles: boolean;
    colorBlindAssist: boolean;
}

export interface AppPreferences {
    theme: 'light' | 'dark' | 'auto';
    startupScreen: 'home' | 'search' | 'categories' | 'account';
    showTutorials: boolean;
    hapticFeedback: boolean;
    autoPlayVideos: boolean;
    dataUsageMode: 'normal' | 'low' | 'unlimited';
    locationTracking: boolean;
    analytics: boolean;
}

export interface PrivacySettings {
    profileVisibility: 'public' | 'friends' | 'private';
    showActivity: boolean;
    showWishlist: boolean;
    showReviews: boolean;
    shareDataForPersonalization: boolean;
    allowTargetedAds: boolean;
    shareDataWithPartners: boolean;
    trackingConsent: boolean;
    cookieConsent: boolean;
    marketingConsent: boolean;
    dataRetention: 'minimal' | 'standard' | 'extended';
}

export interface NotificationSettings {
    push: PushNotificationSettings;
    email: EmailNotificationSettings;
    sms: SMSNotificationSettings;
    inApp: InAppNotificationSettings;
}

export interface PushNotificationSettings {
    enabled: boolean;
    orderUpdates: boolean;
    deliveryNotifications: boolean;
    promotions: boolean;
    priceAlerts: boolean;
    stockAlerts: boolean;
    recommendations: boolean;
    social: boolean;
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    };
}

export interface EmailNotificationSettings {
    enabled: boolean;
    orderConfirmations: boolean;
    shippingUpdates: boolean;
    promotions: boolean;
    newsletters: boolean;
    recommendations: boolean;
    priceAlerts: boolean;
    reviewReminders: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
}

export interface SMSNotificationSettings {
    enabled: boolean;
    orderUpdates: boolean;
    deliveryNotifications: boolean;
    promotions: boolean;
    securityAlerts: boolean;
    frequency: 'immediate' | 'daily';
}

export interface InAppNotificationSettings {
    enabled: boolean;
    showBadges: boolean;
    playSound: boolean;
    vibration: boolean;
    showPreviews: boolean;
}

export interface ShoppingProfile {
    averageOrderValue: number;
    orderFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'occasional';
    preferredCategories: CategoryPreference[];
    shoppingPatterns: ShoppingPattern[];
    seasonalTrends: SeasonalTrend[];
    priceRange: {
        min: number;
        max: number;
        preferred: number;
    };
    brandLoyalty: BrandLoyalty[];
}

export interface CategoryPreference {
    categoryId: string;
    categoryName: string;
    purchaseFrequency: number;
    averageSpending: number;
    lastPurchase?: string;
    preference: 'high' | 'medium' | 'low';
}

export interface ShoppingPattern {
    type: 'bulk_buyer' | 'deal_hunter' | 'brand_loyal' | 'trend_follower' | 'practical_shopper';
    strength: number; // 0-1
    description: string;
}

export interface SeasonalTrend {
    season: 'spring' | 'summer' | 'fall' | 'winter';
    categories: string[];
    spendingIncrease: number;
}

export interface BrandLoyalty {
    brand: string;
    loyaltyScore: number; // 0-1
    totalPurchases: number;
    totalSpent: number;
    lastPurchase: string;
}

export interface UserInterest {
    category: string;
    subcategories: string[];
    interestLevel: 'high' | 'medium' | 'low';
    source: 'explicit' | 'inferred' | 'behavior';
    lastUpdated: string;
}

export interface SecuritySettings {
    twoFactorAuth: TwoFactorAuthSettings;
    loginAlerts: boolean;
    sessionTimeout: number; // minutes
    biometricAuth: BiometricAuthSettings;
    passwordStrength: PasswordStrength;
    securityQuestions: SecurityQuestion[];
    trustedDevices: TrustedDevice[];
    loginHistory: LoginHistoryEntry[];
}

export interface TwoFactorAuthSettings {
    enabled: boolean;
    method: 'sms' | 'email' | 'authenticator' | 'backup_codes';
    backupCodes?: string[];
    lastUsed?: string;
}

export interface BiometricAuthSettings {
    enabled: boolean;
    types: ('fingerprint' | 'face' | 'voice')[];
    fallbackToPassword: boolean;
}

export interface PasswordStrength {
    score: number; // 0-4
    requirements: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        numbers: boolean;
        symbols: boolean;
    };
    lastChanged: string;
}

export interface SecurityQuestion {
    id: string;
    question: string;
    isAnswered: boolean;
    createdAt: string;
}

export interface TrustedDevice {
    id: string;
    name: string;
    type: 'mobile' | 'tablet' | 'desktop' | 'other';
    os: string;
    browser?: string;
    lastUsed: string;
    addedAt: string;
    isActive: boolean;
}

export interface LoginHistoryEntry {
    id: string;
    timestamp: string;
    ipAddress: string;
    location?: string;
    device: string;
    success: boolean;
    method: 'password' | 'biometric' | 'social' | 'magic_link';
}

export interface SocialProfile {
    connections: SocialConnection[];
    followers: number;
    following: number;
    publicProfile: boolean;
    shareActivity: boolean;
    allowFriendRequests: boolean;
    allowMessages: boolean;
}

export interface SocialConnection {
    platform: 'facebook' | 'google' | 'apple' | 'twitter';
    connectedAt: string;
    permissions: string[];
    isActive: boolean;
    profileUrl?: string;
}

export interface UserStatistics {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteCategory: string;
    memberSince: string;
    loyaltyPoints: number;
    reviewsWritten: number;
    wishlistItems: number;
    referrals: number;
    achievements: UserAchievement[];
}

export interface UserAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    category: 'shopping' | 'social' | 'loyalty' | 'reviews';
    progress?: {
        current: number;
        target: number;
    };
}

export interface UserMetadata {
    referralSource?: string;
    registrationMethod: 'email' | 'phone' | 'social' | 'guest_conversion';
    deviceInfo?: DeviceInfo;
    acquisitionChannel?: string;
    customerSegment?: string;
    riskScore?: number;
    notes?: AdminNote[];
}

export interface DeviceInfo {
    platform: 'ios' | 'android' | 'web';
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    pushToken?: string;
}

export interface AdminNote {
    id: string;
    author: string;
    content: string;
    category: 'general' | 'support' | 'fraud' | 'vip';
    isInternal: boolean;
    createdAt: string;
}

// Request/Response Types
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    avatar?: File;
}

export interface UpdatePreferencesRequest {
    shopping?: Partial<ShoppingPreferences>;
    communication?: Partial<CommunicationPreferences>;
    accessibility?: Partial<AccessibilityPreferences>;
    app?: Partial<AppPreferences>;
}

export interface UpdatePrivacyRequest {
    profileVisibility?: 'public' | 'friends' | 'private';
    showActivity?: boolean;
    showWishlist?: boolean;
    showReviews?: boolean;
    shareDataForPersonalization?: boolean;
    allowTargetedAds?: boolean;
    shareDataWithPartners?: boolean;
}

export interface UpdateNotificationsRequest {
    push?: Partial<PushNotificationSettings>;
    email?: Partial<EmailNotificationSettings>;
    sms?: Partial<SMSNotificationSettings>;
    inApp?: Partial<InAppNotificationSettings>;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface SetupTwoFactorRequest {
    method: 'sms' | 'email' | 'authenticator';
    phone?: string;
    email?: string;
}

export interface VerifyTwoFactorRequest {
    code: string;
    backupCode?: string;
}

export interface UserSearchRequest {
    query?: string;
    filters?: {
        status?: UserStatus[];
        membershipType?: ('walmart_plus' | 'standard')[];
        registrationDate?: {
            start: string;
            end: string;
        };
        lastLoginDate?: {
            start: string;
            end: string;
        };
        totalSpent?: {
            min: number;
            max: number;
        };
        location?: {
            city?: string;
            state?: string;
            country?: string;
        };
    };
    sort?: {
        field: 'name' | 'email' | 'registrationDate' | 'lastLogin' | 'totalSpent';
        direction: 'asc' | 'desc';
    };
    page?: number;
    limit?: number;
}

export interface UserAnalyticsRequest {
    userId?: string;
    dateRange: {
        start: string;
        end: string;
    };
    metrics?: ('orders' | 'spending' | 'activity' | 'engagement')[];
}

export interface UserAnalyticsResponse {
    userId: string;
    period: {
        start: string;
        end: string;
    };
    metrics: {
        orders: OrderMetrics;
        spending: SpendingMetrics;
        activity: ActivityMetrics;
        engagement: EngagementMetrics;
    };
    trends: TrendData[];
    insights: UserInsight[];
}

export interface OrderMetrics {
    totalOrders: number;
    averageOrderValue: number;
    orderFrequency: number;
    cancelationRate: number;
    returnRate: number;
    repeatPurchaseRate: number;
}

export interface SpendingMetrics {
    totalSpent: number;
    averageMonthlySpending: number;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    savingsFromDeals: number;
    walmartPlusSavings: number;
}

export interface ActivityMetrics {
    loginCount: number;
    sessionDuration: number;
    pageViews: number;
    searchQueries: number;
    productViews: number;
    cartAdds: number;
    wishlistAdds: number;
}

export interface EngagementMetrics {
    reviewsWritten: number;
    questionsAsked: number;
    socialShares: number;
    referrals: number;
    supportTickets: number;
    appRating?: number;
}

export interface TrendData {
    metric: string;
    data: Array<{ period: string; value: number }>;
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
}

export interface UserInsight {
    type: 'behavior' | 'preference' | 'risk' | 'opportunity';
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    recommendation?: string;
}

// Users API Service
export const usersAPI = {
    // Profile Management
    getProfile: async (): Promise<User> => {
        const response = await apiClient.get<User>(API.ENDPOINTS.USER.PROFILE);
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if (key === 'avatar' && data.avatar instanceof File) {
                formData.append('avatar', data.avatar);
            } else if (data[key as keyof UpdateProfileRequest] !== undefined) {
                formData.append(key, String(data[key as keyof UpdateProfileRequest]));
            }
        });

        const response = await apiClient.put<User>(API.ENDPOINTS.USER.PROFILE, formData, {
            headers: data.avatar ? { 'Content-Type': 'multipart/form-data' } : undefined,
        });
        return response.data;
    },

    uploadAvatar: async (avatar: File): Promise<UserAvatar> => {
        const formData = new FormData();
        formData.append('avatar', avatar);

        const response = await apiClient.post<UserAvatar>('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteAvatar: async (): Promise<void> => {
        await apiClient.delete('/users/avatar');
    },

    // Preferences Management
    getPreferences: async (): Promise<UserPreferences> => {
        const response = await apiClient.get<UserPreferences>(API.ENDPOINTS.USER.PREFERENCES);
        return response.data;
    },

    updatePreferences: async (data: UpdatePreferencesRequest): Promise<UserPreferences> => {
        const response = await apiClient.put<UserPreferences>(API.ENDPOINTS.USER.PREFERENCES, data);
        return response.data;
    },

    // Privacy Settings
    getPrivacySettings: async (): Promise<PrivacySettings> => {
        const response = await apiClient.get<PrivacySettings>('/users/privacy');
        return response.data;
    },

    updatePrivacySettings: async (data: UpdatePrivacyRequest): Promise<PrivacySettings> => {
        const response = await apiClient.put<PrivacySettings>('/users/privacy', data);
        return response.data;
    },

    // Notification Settings
    getNotificationSettings: async (): Promise<NotificationSettings> => {
        const response = await apiClient.get<NotificationSettings>(API.ENDPOINTS.USER.NOTIFICATIONS);
        return response.data;
    },

    updateNotificationSettings: async (data: UpdateNotificationsRequest): Promise<NotificationSettings> => {
        const response = await apiClient.put<NotificationSettings>(API.ENDPOINTS.USER.NOTIFICATIONS, data);
        return response.data;
    },

    // Security Management
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await apiClient.post('/users/change-password', data);
    },

    setupTwoFactor: async (data: SetupTwoFactorRequest): Promise<{
        qrCode?: string;
        secret?: string;
        backupCodes?: string[];
    }> => {
        const response = await apiClient.post('/users/setup-2fa', data);
        return response.data;
    },

    verifyTwoFactor: async (data: VerifyTwoFactorRequest): Promise<void> => {
        await apiClient.post('/users/verify-2fa', data);
    },

    disableTwoFactor: async (code: string): Promise<void> => {
        await apiClient.post('/users/disable-2fa', { code });
    },

    getSecuritySettings: async (): Promise<SecuritySettings> => {
        const response = await apiClient.get<SecuritySettings>('/users/security');
        return response.data;
    },

    getTrustedDevices: async (): Promise<TrustedDevice[]> => {
        const response = await apiClient.get<TrustedDevice[]>('/users/trusted-devices');
        return response.data;
    },

    removeTrustedDevice: async (deviceId: string): Promise<void> => {
        await apiClient.delete(`/users/trusted-devices/${deviceId}`);
    },

    getLoginHistory: async (limit: number = 50): Promise<LoginHistoryEntry[]> => {
        const response = await apiClient.get<LoginHistoryEntry[]>('/users/login-history', {
            params: { limit },
        });
        return response.data;
    },

    // Address Management
    getAddresses: async (): Promise<UserAddress[]> => {
        const response = await apiClient.get<UserAddress[]>(API.ENDPOINTS.USER.ADDRESSES);
        return response.data;
    },

    addAddress: async (address: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAddress> => {
        const response = await apiClient.post<UserAddress>(API.ENDPOINTS.USER.ADDRESSES, address);
        return response.data;
    },

    updateAddress: async (id: string, address: Partial<UserAddress>): Promise<UserAddress> => {
        const response = await apiClient.put<UserAddress>(`${API.ENDPOINTS.USER.ADDRESSES}/${id}`, address);
        return response.data;
    },

    deleteAddress: async (id: string): Promise<void> => {
        await apiClient.delete(`${API.ENDPOINTS.USER.ADDRESSES}/${id}`);
    },

    setDefaultAddress: async (id: string): Promise<void> => {
        await apiClient.put(`${API.ENDPOINTS.USER.ADDRESSES}/${id}/default`);
    },

    // Payment Methods
    getPaymentMethods: async (): Promise<UserPaymentMethod[]> => {
        const response = await apiClient.get<UserPaymentMethod[]>(API.ENDPOINTS.USER.PAYMENT_METHODS);
        return response.data;
    },

    addPaymentMethod: async (paymentMethod: Partial<UserPaymentMethod>): Promise<UserPaymentMethod> => {
        const response = await apiClient.post<UserPaymentMethod>(API.ENDPOINTS.USER.PAYMENT_METHODS, paymentMethod);
        return response.data;
    },

    updatePaymentMethod: async (id: string, updates: Partial<UserPaymentMethod>): Promise<UserPaymentMethod> => {
        const response = await apiClient.put<UserPaymentMethod>(`${API.ENDPOINTS.USER.PAYMENT_METHODS}/${id}`, updates);
        return response.data;
    },

    deletePaymentMethod: async (id: string): Promise<void> => {
        await apiClient.delete(`${API.ENDPOINTS.USER.PAYMENT_METHODS}/${id}`);
    },

    setDefaultPaymentMethod: async (id: string): Promise<void> => {
        await apiClient.put(`${API.ENDPOINTS.USER.PAYMENT_METHODS}/${id}/default`);
    },

    // Walmart+ Membership
    getWalmartPlusStatus: async (): Promise<WalmartPlusMembership> => {
        const response = await apiClient.get<WalmartPlusMembership>('/users/walmart-plus');
        return response.data;
    },

    subscribeToWalmartPlus: async (planType: 'monthly' | 'annual', paymentMethodId: string): Promise<WalmartPlusMembership> => {
        const response = await apiClient.post<WalmartPlusMembership>('/users/walmart-plus/subscribe', {
            planType,
            paymentMethodId,
        });
        return response.data;
    },

    cancelWalmartPlus: async (reason?: string): Promise<void> => {
        await apiClient.post('/users/walmart-plus/cancel', { reason });
    },

    // User Analytics
    getUserAnalytics: async (params: UserAnalyticsRequest): Promise<UserAnalyticsResponse> => {
        const response = await apiClient.post<UserAnalyticsResponse>('/users/analytics', params);
        return response.data;
    },

    getUserStatistics: async (): Promise<UserStatistics> => {
        const response = await apiClient.get<UserStatistics>('/users/statistics');
        return response.data;
    },

    getUserInsights: async (): Promise<UserInsight[]> => {
        const response = await apiClient.get<UserInsight[]>('/users/insights');
        return response.data;
    },

    // Social Features
    getSocialProfile: async (): Promise<SocialProfile> => {
        const response = await apiClient.get<SocialProfile>('/users/social');
        return response.data;
    },

    linkSocialAccount: async (platform: 'facebook' | 'google' | 'apple' | 'twitter', token: string): Promise<void> => {
        await apiClient.post(`/users/social/link/${platform}`, { token });
    },

    unlinkSocialAccount: async (platform: 'facebook' | 'google' | 'apple' | 'twitter'): Promise<void> => {
        await apiClient.delete(`/users/social/link/${platform}`);
    },

    // Account Management
    deactivateAccount: async (reason: string, password: string): Promise<void> => {
        await apiClient.post('/users/deactivate', { reason, password });
    },

    reactivateAccount: async (email: string): Promise<void> => {
        await apiClient.post('/users/reactivate', { email });
    },

    deleteAccount: async (password: string, reason: string): Promise<void> => {
        await apiClient.post('/users/delete', { password, reason });
    },

    exportUserData: async (format: 'json' | 'csv'): Promise<{ downloadUrl: string }> => {
        const response = await apiClient.post('/users/export-data', { format });
        return response.data;
    },

    // Admin Functions (if user has admin privileges)
    searchUsers: async (params: UserSearchRequest): Promise<{
        users: User[];
        pagination: any;
        summary: any;
    }> => {
        const response = await apiClient.post('/admin/users/search', params);
        return response.data;
    },

    getUserById: async (userId: string): Promise<User> => {
        const response = await apiClient.get<User>(`/admin/users/${userId}`);
        return response.data;
    },

    updateUserStatus: async (userId: string, status: UserStatus, reason?: string): Promise<User> => {
        const response = await apiClient.put<User>(`/admin/users/${userId}/status`, { status, reason });
        return response.data;
    },

    addAdminNote: async (userId: string, note: {
        content: string;
        category: 'general' | 'support' | 'fraud' | 'vip';
        isInternal: boolean;
    }): Promise<AdminNote> => {
        const response = await apiClient.post<AdminNote>(`/admin/users/${userId}/notes`, note);
        return response.data;
    },

    // Referral System
    getReferralCode: async (): Promise<{ code: string; url: string; stats: ReferralStats }> => {
        const response = await apiClient.get('/users/referral-code');
        return response.data;
    },

    getReferralHistory: async (): Promise<ReferralEntry[]> => {
        const response = await apiClient.get<ReferralEntry[]>('/users/referral-history');
        return response.data;
    },

    // Communication
    sendVerificationEmail: async (): Promise<void> => {
        await apiClient.post('/users/send-verification-email');
    },

    sendVerificationSMS: async (phone: string): Promise<void> => {
        await apiClient.post('/users/send-verification-sms', { phone });
    },

    verifyEmail: async (token: string): Promise<void> => {
        await apiClient.post('/users/verify-email', { token });
    },

    verifyPhone: async (code: string): Promise<void> => {
        await apiClient.post('/users/verify-phone', { code });
    },
};

// Additional Types
export interface ReferralStats {
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
    availableRewards: number;
}

export interface ReferralEntry {
    id: string;
    referredEmail: string;
    referredName?: string;
    status: 'pending' | 'completed' | 'expired';
    reward: {
        type: 'discount' | 'credit' | 'points';
        value: number;
        description: string;
    };
    referredAt: string;
    completedAt?: string;
    orderValue?: number;
}

export default usersAPI;