// User Types and Roles
export type UserType = 'customer' | 'employee' | 'vendor' | 'partner' | 'admin' | 'guest';

export type UserRole =
    | 'customer'           // Regular customer
    | 'premium_customer'   // Premium/VIP customer
    | 'employee'           // Store employee
    | 'manager'            // Store manager
    | 'district_manager'   // District manager
    | 'regional_manager'   // Regional manager
    | 'admin'              // System administrator
    | 'super_admin'        // Super administrator
    | 'vendor'             // Product vendor
    | 'partner'            // Business partner
    | 'guest';             // Guest user

// User Status
export type UserStatus =
    | 'active'             // Active user
    | 'inactive'           // Inactive user
    | 'pending'            // Pending verification
    | 'suspended'          // Temporarily suspended
    | 'banned'             // Permanently banned
    | 'deactivated'        // User deactivated account
    | 'deleted';           // Account deleted

// Verification Status
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';

// User Demographics
export interface UserDemographics {
    dateOfBirth?: string;
    age?: number;
    ageRange?: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'prefer_not_to_say';
    occupation?: string;
    industry?: string;
    education?: 'high_school' | 'some_college' | 'bachelors' | 'masters' | 'doctorate' | 'other';
    householdSize?: number;
    householdIncome?: 'under_25k' | '25k_50k' | '50k_75k' | '75k_100k' | '100k_150k' | 'over_150k' | 'prefer_not_to_say';
    children?: Array<{
        age: number;
        gender?: 'male' | 'female' | 'other';
    }>;
    pets?: Array<{
        type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
        breed?: string;
        age?: number;
    }>;
}

// User Address
export interface UserAddress {
    id: string;
    type: 'home' | 'work' | 'billing' | 'shipping' | 'other';
    name: string;
    company?: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    county?: string;

    // Geographic data
    latitude?: number;
    longitude?: number;
    timezone?: string;

    // Contact
    phone?: string;
    email?: string;

    // Preferences
    isDefault: boolean;
    isVerified: boolean;
    isPrimary?: boolean;

    // Delivery instructions
    deliveryInstructions?: string;
    accessCode?: string;
    gateCode?: string;
    securityInfo?: string;

    // Business address specific
    businessHours?: string;
    contactPerson?: string;
    department?: string;
    floor?: string;
    suite?: string;

    // Metadata
    createdAt: string;
    updatedAt: string;
    lastUsed?: string;
    usageCount?: number;
}

// User Contact Information
export interface UserContact {
    // Primary contact
    primaryEmail: string;
    primaryPhone?: string;

    // Additional contact methods
    secondaryEmail?: string;
    secondaryPhone?: string;
    workEmail?: string;
    workPhone?: string;

    // Communication preferences
    preferredContactMethod: 'email' | 'phone' | 'sms' | 'app_notification';
    languagePreference: string;

    // Verification status
    emailVerified: boolean;
    phoneVerified: boolean;
    emailVerificationDate?: string;
    phoneVerificationDate?: string;

    // Opt-in preferences
    allowMarketing: boolean;
    allowTransactional: boolean;
    allowSurveys: boolean;
    allowThirdParty: boolean;

    // Emergency contact
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
    };
}

// User Preferences
export interface UserPreferences {
    // App preferences
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    timezone: string;
    region: string;

    // Shopping preferences
    shopping: {
        defaultStore?: string;
        preferredFulfillment: 'pickup' | 'delivery' | 'shipping';
        substituteItems: boolean;
        organicPreference: boolean;
        brandPreferences: string[];
        categoryPreferences: string[];
        budgetAlerts: boolean;
        priceAlerts: boolean;
        stockAlerts: boolean;
        dealAlerts: boolean;
    };

    // Dietary preferences and restrictions
    dietary: {
        restrictions: string[];
        allergies: string[];
        preferences: string[];
        certifications: string[]; // organic, kosher, halal, etc.
    };

    // Notification preferences
    notifications: {
        push: {
            enabled: boolean;
            orderUpdates: boolean;
            promotions: boolean;
            recommendations: boolean;
            stockAlerts: boolean;
            priceDrops: boolean;
            appointmentReminders: boolean;
            securityAlerts: boolean;
        };
        email: {
            enabled: boolean;
            newsletters: boolean;
            promotions: boolean;
            orderConfirmations: boolean;
            receipts: boolean;
            surveys: boolean;
            recommendations: boolean;
            weeklyDigest: boolean;
        };
        sms: {
            enabled: boolean;
            orderUpdates: boolean;
            appointmentReminders: boolean;
            deliveryNotifications: boolean;
            securityAlerts: boolean;
            promotions: boolean;
        };
    };

    // Privacy preferences
    privacy: {
        profileVisibility: 'public' | 'friends' | 'private';
        allowDataCollection: boolean;
        allowPersonalization: boolean;
        allowLocationTracking: boolean;
        allowAnalytics: boolean;
        allowThirdPartySharing: boolean;
        allowCookies: boolean;
        allowSocialLogin: boolean;
    };

    // Accessibility preferences
    accessibility: {
        fontSize: 'small' | 'medium' | 'large' | 'extra_large';
        highContrast: boolean;
        reduceMotion: boolean;
        screenReader: boolean;
        voiceCommands: boolean;
        hapticFeedback: boolean;
        closedCaptions: boolean;
    };

    // Personalization
    personalization: {
        showRecommendations: boolean;
        usePersonalizedPricing: boolean;
        adaptiveInterface: boolean;
        smartNotifications: boolean;
        contentPersonalization: boolean;
    };
}

// User Membership and Loyalty
export interface UserMembership {
    // Program details
    programId: string;
    programName: string;
    membershipType: 'free' | 'paid' | 'premium' | 'vip' | 'employee';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

    // Status and dates
    status: 'active' | 'inactive' | 'suspended' | 'expired' | 'cancelled';
    joinDate: string;
    expiryDate?: string;
    renewalDate?: string;
    lastActivity: string;

    // Points and rewards
    points: {
        current: number;
        lifetime: number;
        pending: number;
        expiring: number;
        expiryDate?: string;
    };

    // Benefits and perks
    benefits: Array<{
        id: string;
        name: string;
        description: string;
        type: 'discount' | 'free_shipping' | 'early_access' | 'exclusive' | 'cashback';
        value?: number;
        isActive: boolean;
        expiryDate?: string;
    }>;

    // Cashback
    cashback: {
        available: number;
        pending: number;
        lifetime: number;
        lastEarned?: string;
    };

    // Membership metrics
    metrics: {
        ordersCount: number;
        totalSpent: number;
        avgOrderValue: number;
        lastOrderDate?: string;
        referralsCount: number;
        reviewsCount: number;
    };

    // Auto-renewal
    autoRenewal: {
        enabled: boolean;
        paymentMethodId?: string;
        nextBillingDate?: string;
        billingAmount?: number;
    };
}

// User Activity and Behavior
export interface UserActivity {
    id: string;
    userId: string;
    type: 'login' | 'logout' | 'purchase' | 'search' | 'view' | 'review' | 'wishlist' | 'cart' | 'share' | 'support';
    action: string;
    description: string;

    // Context
    metadata: {
        productId?: string;
        orderId?: string;
        categoryId?: string;
        searchQuery?: string;
        deviceType?: string;
        browser?: string;
        ipAddress?: string;
        location?: {
            city?: string;
            state?: string;
            country?: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            };
        };
        sessionId?: string;
        referrer?: string;
        userAgent?: string;
    };

    // Timing
    timestamp: string;
    duration?: number;

    // Privacy
    isPublic: boolean;
    canDelete: boolean;
}

// User Statistics and Analytics
export interface UserStatistics {
    // Account metrics
    accountAge: number; // days
    lastActiveDate: string;
    loginCount: number;
    sessionCount: number;
    averageSessionDuration: number;

    // Shopping behavior
    shopping: {
        totalOrders: number;
        totalSpent: number;
        averageOrderValue: number;
        totalSavings: number;
        favoriteCategories: Array<{
            category: string;
            count: number;
            spending: number;
        }>;
        favoriteBrands: Array<{
            brand: string;
            count: number;
            spending: number;
        }>;
        preferredFulfillment: Record<string, number>;
        seasonalSpending: Record<string, number>;
    };

    // Engagement metrics
    engagement: {
        reviewsWritten: number;
        helpfulVotes: number;
        wishlistItems: number;
        sharedProducts: number;
        referralsCount: number;
        socialConnections: number;
        appRating?: number;
        npsScore?: number;
    };

    // Support and service
    support: {
        ticketsCreated: number;
        averageResolutionTime: number;
        satisfactionScore: number;
        contactPreference: string;
    };

    // Predictive metrics
    predictive: {
        lifetimeValue: number;
        churnRisk: number;
        nextPurchaseProbability: number;
        recommendedProducts: string[];
        segments: string[];
    };
}

// User Social Features
export interface UserSocial {
    // Profile
    displayName: string;
    username?: string;
    bio?: string;
    avatar?: string;
    coverPhoto?: string;

    // Social connections
    followers: number;
    following: number;
    friends: number;
    connections: Array<{
        userId: string;
        type: 'friend' | 'follower' | 'following';
        since: string;
        source: string;
    }>;

    // Content and contributions
    reviews: {
        count: number;
        averageRating: number;
        helpfulVotes: number;
        featuredReviews: string[];
    };

    lists: Array<{
        id: string;
        name: string;
        type: 'wishlist' | 'favorites' | 'shopping' | 'gift';
        itemCount: number;
        isPublic: boolean;
        followers?: number;
    }>;

    // Achievements and badges
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        earnedDate: string;
        category: string;
        rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    }>;

    badges: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        type: 'reviewer' | 'shopper' | 'helper' | 'early_adopter' | 'brand_advocate';
        level: number;
    }>;

    // Social settings
    settings: {
        profileVisibility: 'public' | 'friends' | 'private';
        allowFriendRequests: boolean;
        allowMessages: boolean;
        showActivity: boolean;
        showPurchases: boolean;
        showReviews: boolean;
        showLists: boolean;
    };
}

// User Security and Privacy
export interface UserSecurity {
    // Authentication
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    passwordLastChanged: string;
    securityQuestions: Array<{
        question: string;
        answerHash: string;
        createdAt: string;
    }>;

    // Trusted devices
    trustedDevices: Array<{
        id: string;
        name: string;
        type: 'mobile' | 'tablet' | 'desktop' | 'tv';
        platform: string;
        lastUsed: string;
        isActive: boolean;
        fingerprint: string;
    }>;

    // Login sessions
    activeSessions: Array<{
        id: string;
        deviceId: string;
        ipAddress: string;
        location: string;
        browser: string;
        startedAt: string;
        lastActivity: string;
        isCurrent: boolean;
    }>;

    // Security events
    securityEvents: Array<{
        id: string;
        type: 'login' | 'logout' | 'password_change' | 'suspicious_activity' | 'data_access';
        description: string;
        ipAddress: string;
        location: string;
        timestamp: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;

    // Privacy settings
    dataRetention: {
        retainPurchaseHistory: boolean;
        retainBrowsingHistory: boolean;
        retainLocationData: boolean;
        retainSearchHistory: boolean;
        autoDeleteAfter?: number; // months
    };

    dataExport: {
        lastExported?: string;
        exportRequests: Array<{
            requestDate: string;
            format: 'json' | 'csv' | 'pdf';
            status: 'pending' | 'completed' | 'failed';
            downloadUrl?: string;
            expiresAt?: string;
        }>;
    };

    // Consent management
    consents: Array<{
        type: string;
        version: string;
        granted: boolean;
        grantedAt: string;
        revokedAt?: string;
        source: string;
    }>;
}

// User Support and Help
export interface UserSupport {
    // Support tickets
    tickets: Array<{
        id: string;
        subject: string;
        category: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        status: 'open' | 'in_progress' | 'resolved' | 'closed';
        createdAt: string;
        resolvedAt?: string;
        satisfaction?: number;
    }>;

    // Help preferences
    preferences: {
        preferredChannel: 'chat' | 'email' | 'phone' | 'in_person';
        preferredLanguage: string;
        preferredTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
        needsAssistance: boolean;
        accessibilityNeeds: string[];
    };

    // Self-service usage
    selfService: {
        faqViews: number;
        searchQueries: number;
        videoWatches: number;
        guideDownloads: number;
        forumPosts: number;
        helpfulVotes: number;
    };

    // Feedback and surveys
    feedback: Array<{
        id: string;
        type: 'survey' | 'feedback' | 'suggestion' | 'complaint';
        category: string;
        rating?: number;
        comment?: string;
        submittedAt: string;
        responded: boolean;
    }>;
}

// Main User Interface
export interface User {
    // Basic information
    id: string;
    type: UserType;
    role: UserRole;
    status: UserStatus;

    // Personal information
    firstName: string;
    lastName: string;
    displayName: string;
    username?: string;
    avatar?: string;

    // Contact and verification
    contact: UserContact;
    demographics?: UserDemographics;
    addresses: UserAddress[];

    // Account details
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    lastActiveAt: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    profileCompleted: boolean;

    // Preferences and settings
    preferences: UserPreferences;

    // Membership and loyalty
    membership?: UserMembership;

    // Social features
    social?: UserSocial;

    // Security and privacy
    security: UserSecurity;

    // Support and help
    support: UserSupport;

    // Analytics and behavior
    statistics: UserStatistics;
    activities: UserActivity[];

    // Employee specific (if applicable)
    employee?: {
        employeeId: string;
        department: string;
        position: string;
        manager?: string;
        storeId?: string;
        hireDate: string;
        permissions: string[];
        workSchedule?: Array<{
            day: string;
            startTime: string;
            endTime: string;
        }>;
    };

    // Vendor specific (if applicable)
    vendor?: {
        vendorId: string;
        companyName: string;
        businessType: string;
        taxId?: string;
        contactPerson: string;
        products: string[];
        certifications: string[];
        contractStatus: 'active' | 'pending' | 'suspended' | 'terminated';
    };

    // Custom fields and metadata
    customFields?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: string[];

    // Compliance and legal
    compliance: {
        termsAccepted: boolean;
        termsVersion: string;
        termsDate: string;
        privacyPolicyAccepted: boolean;
        privacyPolicyVersion: string;
        privacyPolicyDate: string;
        cookieConsent?: boolean;
        marketingConsent?: boolean;
        dataProcessingConsent?: boolean;
        minorStatus?: boolean;
        parentalConsent?: boolean;
    };
}

// User Creation and Updates
export interface CreateUserRequest {
    // Required fields
    firstName: string;
    lastName: string;
    email: string;
    password: string;

    // Optional fields
    phone?: string;
    dateOfBirth?: string;
    addresses?: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>[];
    preferences?: Partial<UserPreferences>;

    // Marketing and consent
    agreeToTerms: boolean;
    acceptPrivacyPolicy: boolean;
    allowMarketing?: boolean;

    // Source and referral
    source?: string;
    referralCode?: string;

    // Additional data
    demographics?: Partial<UserDemographics>;
    customFields?: Record<string, any>;
}

export interface UpdateUserRequest {
    // Basic information
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;

    // Contact updates
    email?: string;
    phone?: string;
    addresses?: UserAddress[];

    // Preferences
    preferences?: Partial<UserPreferences>;
    demographics?: Partial<UserDemographics>;

    // Settings
    privacy?: Partial<UserSecurity['dataRetention']>;
    notifications?: Partial<UserPreferences['notifications']>;

    // Custom fields
    customFields?: Record<string, any>;
    tags?: string[];
}

// User Search and Filtering
export interface UserSearchFilters {
    // Basic filters
    role?: UserRole[];
    status?: UserStatus[];
    type?: UserType[];

    // Demographics
    ageRange?: string;
    gender?: string;
    location?: {
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };

    // Membership
    membershipTier?: string[];
    membershipStatus?: string[];

    // Activity
    lastActiveAfter?: string;
    lastActiveBefore?: string;
    registeredAfter?: string;
    registeredBefore?: string;

    // Behavior
    totalSpentMin?: number;
    totalSpentMax?: number;
    orderCountMin?: number;
    orderCountMax?: number;

    // Engagement
    hasReviews?: boolean;
    hasWishlist?: boolean;
    isFollower?: boolean;

    // Custom filters
    customFilters?: Record<string, any>;
    tags?: string[];
}

// Type Guards and Utilities
export const isActiveUser = (user: User): boolean => {
    return user.status === 'active' && user.emailVerified;
};

export const isPremiumMember = (user: User): boolean => {
    return user.membership?.membershipType === 'premium' ||
        user.membership?.membershipType === 'paid';
};

export const canMakeOrders = (user: User): boolean => {
    return user.status === 'active' &&
        user.emailVerified &&
        user.addresses.length > 0;
};

export const getUserAge = (user: User): number | null => {
    if (!user.demographics?.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(user.demographics.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

export const getProfileCompletionPercentage = (user: User): number => {
    const fields = [
        user.firstName,
        user.lastName,
        user.contact.primaryEmail,
        user.avatar,
        user.addresses.length > 0,
        user.demographics?.dateOfBirth,
        user.demographics?.gender,
        user.contact.primaryPhone,
        user.preferences.shopping.defaultStore,
        user.preferences.dietary.restrictions.length > 0 || user.preferences.dietary.preferences.length > 0,
    ];

    const completedFields = fields.filter(field => {
        if (typeof field === 'boolean') return field;
        if (typeof field === 'string') return field.trim() !== '';
        return field != null;
    }).length;

    return Math.round((completedFields / fields.length) * 100);
};

export const hasPermission = (user: User, permission: string): boolean => {
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    if (user.employee?.permissions) {
        return user.employee.permissions.includes(permission);
    }

    return false;
};

// Default configurations
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    theme: 'auto',
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
    region: 'US',

    shopping: {
        preferredFulfillment: 'pickup',
        substituteItems: true,
        organicPreference: false,
        brandPreferences: [],
        categoryPreferences: [],
        budgetAlerts: false,
        priceAlerts: true,
        stockAlerts: true,
        dealAlerts: true,
    },

    dietary: {
        restrictions: [],
        allergies: [],
        preferences: [],
        certifications: [],
    },

    notifications: {
        push: {
            enabled: true,
            orderUpdates: true,
            promotions: false,
            recommendations: false,
            stockAlerts: true,
            priceDrops: true,
            appointmentReminders: true,
            securityAlerts: true,
        },
        email: {
            enabled: true,
            newsletters: false,
            promotions: false,
            orderConfirmations: true,
            receipts: true,
            surveys: false,
            recommendations: false,
            weeklyDigest: false,
        },
        sms: {
            enabled: false,
            orderUpdates: false,
            appointmentReminders: false,
            deliveryNotifications: false,
            securityAlerts: true,
            promotions: false,
        },
    },

    privacy: {
        profileVisibility: 'private',
        allowDataCollection: true,
        allowPersonalization: true,
        allowLocationTracking: true,
        allowAnalytics: true,
        allowThirdPartySharing: false,
        allowCookies: true,
        allowSocialLogin: true,
    },

    accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false,
        screenReader: false,
        voiceCommands: false,
        hapticFeedback: true,
        closedCaptions: false,
    },

    personalization: {
        showRecommendations: true,
        usePersonalizedPricing: true,
        adaptiveInterface: true,
        smartNotifications: true,
        contentPersonalization: true,
    },
};