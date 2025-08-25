// Authentication Status
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error' | 'expired';

// Authentication Methods
export type AuthMethod = 'email' | 'phone' | 'social' | 'biometric' | 'guest' | 'sso';

// Social Authentication Providers
export type SocialProvider = 'google' | 'facebook' | 'apple' | 'amazon' | 'twitter' | 'microsoft';

// User Roles and Permissions
export type UserRole = 'customer' | 'employee' | 'manager' | 'admin' | 'super_admin' | 'guest';

export type Permission =
    | 'read_profile'
    | 'edit_profile'
    | 'delete_account'
    | 'manage_orders'
    | 'access_admin'
    | 'manage_users'
    | 'view_analytics'
    | 'manage_inventory'
    | 'process_payments'
    | 'customer_support';

// Account Status
export type AccountStatus =
    | 'active'
    | 'pending_verification'
    | 'suspended'
    | 'deactivated'
    | 'locked'
    | 'banned'
    | 'pending_deletion';

// Two-Factor Authentication
export type TwoFactorMethod = 'sms' | 'email' | 'authenticator' | 'backup_codes';

export interface TwoFactorSetup {
    method: TwoFactorMethod;
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
    phoneNumber?: string;
    email?: string;
}

export interface TwoFactorChallenge {
    id: string;
    method: TwoFactorMethod;
    expiresAt: string;
    attemptsRemaining: number;
    cooldownUntil?: string;
}

// Biometric Authentication
export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'voice';

export interface BiometricInfo {
    available: boolean;
    enrolled: boolean;
    supportedTypes: BiometricType[];
    enrolledTypes: BiometricType[];
    securityLevel: 'weak' | 'strong';
    lastUsed?: string;
}

export interface BiometricChallenge {
    challengeId: string;
    type: BiometricType;
    prompt: string;
    fallbackAllowed: boolean;
    expiresAt: string;
}

// JWT Token Structure
export interface JWTPayload {
    sub: string; // Subject (user ID)
    iss: string; // Issuer
    aud: string; // Audience
    exp: number; // Expiration time
    iat: number; // Issued at
    nbf?: number; // Not before
    jti?: string; // JWT ID

    // Custom claims
    email?: string;
    email_verified?: boolean;
    phone?: string;
    phone_verified?: boolean;
    role: UserRole;
    permissions: Permission[];
    session_id: string;
    device_id?: string;
    store_id?: string;
    employee_id?: string;
    two_factor_verified?: boolean;
}

// Authentication Tokens
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    idToken?: string;
    tokenType: 'Bearer';
    expiresIn: number;
    expiresAt: number;
    scope?: string[];
    sessionId: string;
}

// Login Credentials
export interface EmailLoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
    deviceId?: string;
    deviceName?: string;
}

export interface PhoneLoginCredentials {
    phoneNumber: string;
    password?: string;
    verificationCode?: string;
    rememberMe?: boolean;
    deviceId?: string;
    deviceName?: string;
}

export interface SocialLoginCredentials {
    provider: SocialProvider;
    accessToken: string;
    idToken?: string;
    refreshToken?: string;
    profile: SocialProfile;
    deviceId?: string;
    deviceName?: string;
}

export interface BiometricLoginCredentials {
    biometricToken: string;
    deviceId: string;
    biometricType: BiometricType;
    fallbackCredentials?: EmailLoginCredentials | PhoneLoginCredentials;
}

// Social Profile Data
export interface SocialProfile {
    id: string;
    email?: string;
    emailVerified?: boolean;
    name?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
    locale?: string;
    timezone?: string;
    provider: SocialProvider;
    providerData?: Record<string, any>;
}

// Registration Data
export interface RegistrationData {
    email?: string;
    phoneNumber?: string;
    password: string;
    confirmPassword?: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    agreeToTerms: boolean;
    subscribeToNewsletter?: boolean;
    referralCode?: string;
    captchaToken?: string;
    deviceId?: string;
    deviceName?: string;
}

// Password Reset
export interface PasswordResetRequest {
    email?: string;
    phoneNumber?: string;
    captchaToken?: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    logoutOtherSessions?: boolean;
}

// Email/Phone Verification
export interface VerificationRequest {
    email?: string;
    phoneNumber?: string;
    type: 'registration' | 'login' | 'password_reset' | 'profile_update';
}

export interface VerificationConfirm {
    token: string;
    code: string;
    type: 'email' | 'sms';
}

// Session Management
export interface UserSession {
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string;
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv';
    platform: 'ios' | 'android' | 'web' | 'other';
    ipAddress: string;
    userAgent: string;
    location?: {
        country?: string;
        region?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
    };
    createdAt: string;
    lastActiveAt: string;
    expiresAt: string;
    isCurrent: boolean;
    isValid: boolean;
}

// Security Events
export type SecurityEventType =
    | 'login_success'
    | 'login_failed'
    | 'login_blocked'
    | 'logout'
    | 'password_changed'
    | 'email_verified'
    | 'phone_verified'
    | 'two_factor_enabled'
    | 'two_factor_disabled'
    | 'suspicious_activity'
    | 'account_locked'
    | 'account_unlocked'
    | 'device_registered'
    | 'device_removed';

export interface SecurityEvent {
    id: string;
    type: SecurityEventType;
    userId: string;
    sessionId?: string;
    deviceId?: string;
    ipAddress: string;
    userAgent: string;
    location?: {
        country?: string;
        city?: string;
    };
    metadata?: Record<string, any>;
    riskScore?: number;
    blocked?: boolean;
    timestamp: string;
}

// Device Management
export interface RegisteredDevice {
    id: string;
    name: string;
    type: 'mobile' | 'tablet' | 'desktop' | 'tv';
    platform: 'ios' | 'android' | 'web' | 'other';
    fingerprint: string;
    trusted: boolean;
    biometricEnabled: boolean;
    lastUsed: string;
    registeredAt: string;
    pushToken?: string;
    location?: {
        country?: string;
        city?: string;
    };
}

// Account Security Settings
export interface SecuritySettings {
    twoFactorAuth: {
        enabled: boolean;
        methods: TwoFactorMethod[];
        primaryMethod?: TwoFactorMethod;
        backupCodes: string[];
        lastUsed?: string;
    };
    biometric: {
        enabled: boolean;
        types: BiometricType[];
        lastUsed?: string;
    };
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        expiryDays?: number;
        historyCount?: number;
    };
    loginSettings: {
        allowRememberMe: boolean;
        sessionTimeout: number; // minutes
        maxConcurrentSessions: number;
        requireTwoFactorForSensitive: boolean;
    };
    notifications: {
        loginAlerts: boolean;
        newDeviceAlerts: boolean;
        suspiciousActivityAlerts: boolean;
        passwordChangeAlerts: boolean;
        methods: ('email' | 'sms' | 'push')[];
    };
    trustedDevices: RegisteredDevice[];
}

// Risk Assessment
export interface RiskAssessment {
    score: number; // 0-100
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
        factor: string;
        score: number;
        description: string;
    }>;
    recommendations: string[];
    requiresAction: boolean;
    timestamp: string;
}

// Authentication Context
export interface AuthContext {
    isAuthenticated: boolean;
    user?: AuthUser;
    session?: UserSession;
    tokens?: AuthTokens;
    permissions: Permission[];
    securityLevel: 'none' | 'basic' | 'enhanced' | 'high';
    lastActivity: string;
    requiresTwoFactor: boolean;
    riskAssessment?: RiskAssessment;
}

// User Profile (Auth-specific fields)
export interface AuthUser {
    id: string;
    email?: string;
    emailVerified: boolean;
    phoneNumber?: string;
    phoneVerified: boolean;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    role: UserRole;
    permissions: Permission[];
    accountStatus: AccountStatus;
    createdAt: string;
    lastLoginAt?: string;
    loginCount: number;
    failedLoginAttempts: number;
    lockedUntil?: string;
    passwordChangedAt?: string;
    emailChangedAt?: string;
    phoneChangedAt?: string;
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    preferredLanguage?: string;
    timezone?: string;
    metadata?: Record<string, any>;
}

// Authentication Responses
export interface LoginResponse {
    success: boolean;
    user: AuthUser;
    tokens: AuthTokens;
    session: UserSession;
    requiresTwoFactor?: boolean;
    twoFactorChallenge?: TwoFactorChallenge;
    requiresEmailVerification?: boolean;
    requiresPhoneVerification?: boolean;
    securityWarnings?: string[];
    riskAssessment?: RiskAssessment;
}

export interface RegistrationResponse {
    success: boolean;
    user: AuthUser;
    tokens?: AuthTokens;
    session?: UserSession;
    requiresEmailVerification: boolean;
    requiresPhoneVerification: boolean;
    verificationToken?: string;
}

export interface RefreshTokenResponse {
    success: boolean;
    tokens: AuthTokens;
    user?: AuthUser;
    session?: UserSession;
}

export interface LogoutResponse {
    success: boolean;
    message: string;
    loggedOutSessions: string[];
}

// Authentication Errors
export type AuthErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'ACCOUNT_LOCKED'
    | 'ACCOUNT_SUSPENDED'
    | 'ACCOUNT_DISABLED'
    | 'ACCOUNT_NOT_VERIFIED'
    | 'PASSWORD_EXPIRED'
    | 'TWO_FACTOR_REQUIRED'
    | 'TWO_FACTOR_INVALID'
    | 'BIOMETRIC_FAILED'
    | 'TOKEN_EXPIRED'
    | 'TOKEN_INVALID'
    | 'REFRESH_TOKEN_INVALID'
    | 'SESSION_EXPIRED'
    | 'DEVICE_NOT_TRUSTED'
    | 'SUSPICIOUS_ACTIVITY'
    | 'RATE_LIMITED'
    | 'CAPTCHA_REQUIRED'
    | 'EMAIL_ALREADY_EXISTS'
    | 'PHONE_ALREADY_EXISTS'
    | 'WEAK_PASSWORD'
    | 'REGISTRATION_DISABLED'
    | 'SOCIAL_AUTH_FAILED'
    | 'VERIFICATION_FAILED'
    | 'PERMISSION_DENIED';

export interface AuthError {
    code: AuthErrorCode;
    message: string;
    details?: Record<string, any>;
    retryAfter?: number;
    lockoutUntil?: string;
    attemptsRemaining?: number;
    requiresCaptcha?: boolean;
    suggestions?: string[];
}

// Single Sign-On (SSO)
export interface SSOConfig {
    provider: string;
    enabled: boolean;
    clientId: string;
    redirectUri: string;
    scopes: string[];
    additionalParams?: Record<string, string>;
}

export interface SSOInitResponse {
    authUrl: string;
    state: string;
    codeVerifier?: string;
    nonce?: string;
}

export interface SSOCallbackData {
    code: string;
    state: string;
    error?: string;
    errorDescription?: string;
}

// OAuth 2.0 / OpenID Connect
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    tokenType: string;
    expiresIn: number;
    scope: string;
}

export interface OIDCUserInfo {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    email_verified?: boolean;
    phone_number?: string;
    phone_number_verified?: boolean;
    picture?: string;
    locale?: string;
    zoneinfo?: string;
    updated_at?: number;
}

// Enterprise Features
export interface LDAPConfig {
    server: string;
    port: number;
    bindDN: string;
    bindPassword: string;
    searchBase: string;
    searchFilter: string;
    attributeMapping: {
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        groups: string;
    };
    enableTLS: boolean;
}

export interface SAMLConfig {
    entityId: string;
    ssoUrl: string;
    x509Certificate: string;
    attributeMapping: {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    signRequests: boolean;
    encryptAssertions: boolean;
}

// Authentication Hooks/Events
export interface AuthHooks {
    beforeLogin?: (credentials: any) => Promise<void> | void;
    afterLogin?: (user: AuthUser, session: UserSession) => Promise<void> | void;
    beforeLogout?: (userId: string, sessionId: string) => Promise<void> | void;
    afterLogout?: (userId: string, sessionId: string) => Promise<void> | void;
    onRegistration?: (user: AuthUser) => Promise<void> | void;
    onPasswordChange?: (userId: string) => Promise<void> | void;
    onSecurityEvent?: (event: SecurityEvent) => Promise<void> | void;
    onRiskDetection?: (assessment: RiskAssessment) => Promise<void> | void;
}

// Rate Limiting
export interface AuthRateLimit {
    login: {
        maxAttempts: number;
        windowMs: number;
        blockDurationMs: number;
    };
    registration: {
        maxAttempts: number;
        windowMs: number;
    };
    passwordReset: {
        maxAttempts: number;
        windowMs: number;
    };
    verification: {
        maxAttempts: number;
        windowMs: number;
    };
}

// Type Guards
export const isAuthenticatedUser = (user: any): user is AuthUser => {
    return user && typeof user.id === 'string' && user.accountStatus === 'active';
};

export const hasPermission = (user: AuthUser, permission: Permission): boolean => {
    return user.permissions.includes(permission);
};

export const isValidSession = (session: UserSession): boolean => {
    return session.isValid && new Date(session.expiresAt) > new Date();
};

export const requiresTwoFactor = (user: AuthUser, action: string): boolean => {
    const sensitiveActions = ['payment', 'profile_change', 'security_change'];
    return user.twoFactorEnabled && sensitiveActions.includes(action);
};

// Utility Functions
export const getRiskLevel = (score: number): RiskAssessment['level'] => {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload;
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};

export const parseJWTPayload = (token: string): JWTPayload | null => {
    try {
        return JSON.parse(atob(token.split('.')[1])) as JWTPayload;
    } catch {
        return null;
    }
};

// Default Configurations
export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
    twoFactorAuth: {
        enabled: false,
        methods: [],
        backupCodes: [],
    },
    biometric: {
        enabled: false,
        types: [],
    },
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
    },
    loginSettings: {
        allowRememberMe: true,
        sessionTimeout: 30,
        maxConcurrentSessions: 5,
        requireTwoFactorForSensitive: false,
    },
    notifications: {
        loginAlerts: true,
        newDeviceAlerts: true,
        suspiciousActivityAlerts: true,
        passwordChangeAlerts: true,
        methods: ['email'],
    },
    trustedDevices: [],
};

export const DEFAULT_AUTH_RATE_LIMITS: AuthRateLimit = {
    login: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        blockDurationMs: 30 * 60 * 1000, // 30 minutes
    },
    registration: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    passwordReset: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    verification: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
};