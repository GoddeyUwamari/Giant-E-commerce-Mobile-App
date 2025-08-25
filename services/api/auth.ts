import { apiClient } from './client';
import { API } from '@/config/constants';

// Types
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    deviceInfo?: {
        deviceId: string;
        platform: string;
        version: string;
        model: string;
    };
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    acceptTerms: boolean;
    marketingOptIn?: boolean;
    preferredStore?: string;
}

export interface RegisterResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    emailVerificationRequired: boolean;
    phoneVerificationRequired: boolean;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    emailVerified: boolean;
    phoneVerified: boolean;
    preferredStore?: string;
    walmartPlusMember: boolean;
    membershipExpiry?: string;
    addresses: UserAddress[];
    paymentMethods: PaymentMethod[];
    preferences: UserPreferences;
    loyaltyProgram?: {
        pointsBalance: number;
        tier: string;
        nextTierThreshold: number;
    };
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
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
    isValid: boolean;
    deliveryInstructions?: string;
}

export interface PaymentMethod {
    id: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'walmart_pay';
    isDefault: boolean;
    lastFourDigits?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardBrand?: string;
    cardholderName?: string;
    billingAddress?: UserAddress;
    isExpired: boolean;
    isValid: boolean;
}

export interface UserPreferences {
    language: string;
    currency: string;
    timezone: string;
    notifications: {
        push: boolean;
        email: boolean;
        sms: boolean;
        orderUpdates: boolean;
        promotions: boolean;
        recommendations: boolean;
        priceAlerts: boolean;
    };
    privacy: {
        profileVisibility: 'public' | 'private';
        shareDataForPersonalization: boolean;
        allowTargetedAds: boolean;
        shareDataWithPartners: boolean;
    };
    shopping: {
        autoSaveToWishlist: boolean;
        showOutOfStockItems: boolean;
        preferredDeliveryMethod: 'delivery' | 'pickup' | 'both';
        defaultTipPercentage: number;
    };
}

export interface RefreshTokenRequest {
    refreshToken: string;
    deviceId?: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface ForgotPasswordRequest {
    email: string;
    captchaToken?: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface VerifyPhoneRequest {
    phone: string;
    code: string;
}

export interface SendVerificationRequest {
    type: 'email' | 'phone';
    destination: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    avatar?: string;
    preferredStore?: string;
}

export interface BiometricSetupRequest {
    enabled: boolean;
    biometricType: 'fingerprint' | 'face' | 'iris';
    deviceId: string;
}

export interface TwoFactorSetupRequest {
    enabled: boolean;
    method: 'sms' | 'email' | 'authenticator';
    phone?: string;
    email?: string;
}

// Auth API Service
export const authAPI = {
    // Authentication
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>(API.ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await apiClient.post<RegisterResponse>(API.ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post(API.ENDPOINTS.AUTH.LOGOUT);
    },

    refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
        const response = await apiClient.post<RefreshTokenResponse>(API.ENDPOINTS.AUTH.REFRESH, data);
        return response.data;
    },

    // Password Management
    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        await apiClient.post(API.ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        await apiClient.post(API.ENDPOINTS.AUTH.RESET_PASSWORD, data);
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await apiClient.put('/auth/change-password', data);
    },

    // Email Verification
    verifyEmail: async (data: VerifyEmailRequest): Promise<void> => {
        await apiClient.post(API.ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    },

    sendEmailVerification: async (): Promise<void> => {
        await apiClient.post('/auth/send-email-verification');
    },

    // Phone Verification
    verifyPhone: async (data: VerifyPhoneRequest): Promise<void> => {
        await apiClient.post('/auth/verify-phone', data);
    },

    sendPhoneVerification: async (phone: string): Promise<void> => {
        await apiClient.post('/auth/send-phone-verification', { phone });
    },

    // Profile Management
    getProfile: async (): Promise<User> => {
        const response = await apiClient.get<User>(API.ENDPOINTS.USER.PROFILE);
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        const response = await apiClient.put<User>(API.ENDPOINTS.USER.PROFILE, data);
        return response.data;
    },

    deleteAccount: async (password: string): Promise<void> => {
        await apiClient.delete('/auth/account', { data: { password } });
    },

    // Security Settings
    setupBiometric: async (data: BiometricSetupRequest): Promise<void> => {
        await apiClient.post('/auth/biometric-setup', data);
    },

    setupTwoFactor: async (data: TwoFactorSetupRequest): Promise<void> => {
        await apiClient.post('/auth/two-factor-setup', data);
    },

    disableTwoFactor: async (code: string): Promise<void> => {
        await apiClient.post('/auth/disable-two-factor', { code });
    },

    // Session Management
    getSessions: async (): Promise<UserSession[]> => {
        const response = await apiClient.get<UserSession[]>('/auth/sessions');
        return response.data;
    },

    revokeSession: async (sessionId: string): Promise<void> => {
        await apiClient.delete(`/auth/sessions/${sessionId}`);
    },

    revokeAllSessions: async (): Promise<void> => {
        await apiClient.delete('/auth/sessions');
    },

    // Address Management
    getAddresses: async (): Promise<UserAddress[]> => {
        const response = await apiClient.get<UserAddress[]>(API.ENDPOINTS.USER.ADDRESSES);
        return response.data;
    },

    addAddress: async (address: Omit<UserAddress, 'id'>): Promise<UserAddress> => {
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

    validateAddress: async (address: Partial<UserAddress>): Promise<{ isValid: boolean; suggestions?: UserAddress[] }> => {
        const response = await apiClient.post('/auth/validate-address', address);
        return response.data;
    },

    // Payment Methods
    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        const response = await apiClient.get<PaymentMethod[]>(API.ENDPOINTS.USER.PAYMENT_METHODS);
        return response.data;
    },

    addPaymentMethod: async (paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
        const response = await apiClient.post<PaymentMethod>(API.ENDPOINTS.USER.PAYMENT_METHODS, paymentMethod);
        return response.data;
    },

    updatePaymentMethod: async (id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod> => {
        const response = await apiClient.put<PaymentMethod>(`${API.ENDPOINTS.USER.PAYMENT_METHODS}/${id}`, paymentMethod);
        return response.data;
    },

    deletePaymentMethod: async (id: string): Promise<void> => {
        await apiClient.delete(`${API.ENDPOINTS.USER.PAYMENT_METHODS}/${id}`);
    },

    setDefaultPaymentMethod: async (id: string): Promise<void> => {
        await apiClient.put(`${API.ENDPOINTS.USER.PAYMENT_METHODS}/${id}/default`);
    },

    // Preferences
    getPreferences: async (): Promise<UserPreferences> => {
        const response = await apiClient.get<UserPreferences>(API.ENDPOINTS.USER.PREFERENCES);
        return response.data;
    },

    updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
        const response = await apiClient.put<UserPreferences>(API.ENDPOINTS.USER.PREFERENCES, preferences);
        return response.data;
    },

    // Walmart+ Membership
    getWalmartPlusStatus: async (): Promise<WalmartPlusStatus> => {
        const response = await apiClient.get<WalmartPlusStatus>('/auth/walmart-plus-status');
        return response.data;
    },

    subscribeToWalmartPlus: async (planType: 'monthly' | 'annual'): Promise<WalmartPlusSubscription> => {
        const response = await apiClient.post<WalmartPlusSubscription>('/auth/walmart-plus-subscribe', { planType });
        return response.data;
    },

    cancelWalmartPlus: async (): Promise<void> => {
        await apiClient.post('/auth/walmart-plus-cancel');
    },

    // Social Login
    socialLogin: async (provider: 'google' | 'facebook' | 'apple', token: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>(`/auth/social/${provider}`, { token });
        return response.data;
    },

    linkSocialAccount: async (provider: 'google' | 'facebook' | 'apple', token: string): Promise<void> => {
        await apiClient.post(`/auth/link-social/${provider}`, { token });
    },

    unlinkSocialAccount: async (provider: 'google' | 'facebook' | 'apple'): Promise<void> => {
        await apiClient.delete(`/auth/link-social/${provider}`);
    },

    // Device Management
    registerDevice: async (deviceInfo: DeviceInfo): Promise<void> => {
        await apiClient.post('/auth/register-device', deviceInfo);
    },

    unregisterDevice: async (deviceId: string): Promise<void> => {
        await apiClient.delete(`/auth/register-device/${deviceId}`);
    },

    getRegisteredDevices: async (): Promise<DeviceInfo[]> => {
        const response = await apiClient.get<DeviceInfo[]>('/auth/devices');
        return response.data;
    },
};

// Additional Types
export interface UserSession {
    id: string;
    deviceId: string;
    deviceName: string;
    platform: string;
    ipAddress: string;
    location?: string;
    lastActive: string;
    createdAt: string;
    isCurrent: boolean;
}

export interface WalmartPlusStatus {
    isActive: boolean;
    planType?: 'monthly' | 'annual';
    startDate?: string;
    expiryDate?: string;
    renewalDate?: string;
    benefits: string[];
    savingsToDate: number;
}

export interface WalmartPlusSubscription {
    subscriptionId: string;
    planType: 'monthly' | 'annual';
    amount: number;
    startDate: string;
    nextBillingDate: string;
    paymentMethodId: string;
}

export interface DeviceInfo {
    id: string;
    name: string;
    platform: string;
    version: string;
    model: string;
    pushToken?: string;
    registeredAt: string;
    lastUsed: string;
}

export default authAPI;