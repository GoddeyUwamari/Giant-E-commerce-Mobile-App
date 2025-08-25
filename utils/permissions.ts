export interface Permission {
    id: string;
    name: string;
    description: string;
    category: PermissionCategory;
    level: PermissionLevel;
    dependencies?: string[];
}

export enum PermissionCategory {
    AUTHENTICATION = 'authentication',
    PROFILE = 'profile',
    SHOPPING = 'shopping',
    PAYMENT = 'payment',
    LOCATION = 'location',
    NOTIFICATIONS = 'notifications',
    CAMERA = 'camera',
    CONTACTS = 'contacts',
    CALENDAR = 'calendar',
    FILES = 'files',
    BIOMETRICS = 'biometrics',
    ADMIN = 'admin',
}

export enum PermissionLevel {
    NONE = 'none',
    READ = 'read',
    WRITE = 'write',
    ADMIN = 'admin',
}

export interface UserPermissions {
    userId: string;
    permissions: Record<string, PermissionLevel>;
    roles: Role[];
    lastUpdated: string;
    grantedBy?: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isDefault: boolean;
    isSystem: boolean;
}

export interface PermissionRequest {
    permissionId: string;
    reason: string;
    requestedLevel: PermissionLevel;
    expiresAt?: string;
}

export interface PermissionGrant {
    id: string;
    userId: string;
    permissionId: string;
    level: PermissionLevel;
    grantedBy: string;
    grantedAt: string;
    expiresAt?: string;
    reason?: string;
    isActive: boolean;
}

// Default permissions for Walmart app
export const DEFAULT_PERMISSIONS: Permission[] = [
    // Authentication
    {
        id: 'auth.login',
        name: 'Login',
        description: 'Ability to log into the application',
        category: PermissionCategory.AUTHENTICATION,
        level: PermissionLevel.READ,
    },
    {
        id: 'auth.register',
        name: 'Register',
        description: 'Ability to create new account',
        category: PermissionCategory.AUTHENTICATION,
        level: PermissionLevel.WRITE,
    },
    {
        id: 'auth.social_login',
        name: 'Social Login',
        description: 'Ability to login with social providers',
        category: PermissionCategory.AUTHENTICATION,
        level: PermissionLevel.READ,
    },
    {
        id: 'auth.biometric',
        name: 'Biometric Authentication',
        description: 'Use fingerprint/face ID for authentication',
        category: PermissionCategory.BIOMETRICS,
        level: PermissionLevel.READ,
    },

    // Profile Management
    {
        id: 'profile.view',
        name: 'View Profile',
        description: 'View own profile information',
        category: PermissionCategory.PROFILE,
        level: PermissionLevel.READ,
    },
    {
        id: 'profile.edit',
        name: 'Edit Profile',
        description: 'Edit own profile information',
        category: PermissionCategory.PROFILE,
        level: PermissionLevel.WRITE,
        dependencies: ['profile.view'],
    },
    {
        id: 'profile.delete',
        name: 'Delete Account',
        description: 'Delete own account permanently',
        category: PermissionCategory.PROFILE,
        level: PermissionLevel.ADMIN,
        dependencies: ['profile.view', 'profile.edit'],
    },

    // Shopping
    {
        id: 'shopping.browse',
        name: 'Browse Products',
        description: 'Browse and search products',
        category: PermissionCategory.SHOPPING,
        level: PermissionLevel.READ,
    },
    {
        id: 'shopping.cart',
        name: 'Shopping Cart',
        description: 'Add/remove items from cart',
        category: PermissionCategory.SHOPPING,
        level: PermissionLevel.WRITE,
        dependencies: ['shopping.browse'],
    },
    {
        id: 'shopping.wishlist',
        name: 'Wishlist',
        description: 'Manage wishlist items',
        category: PermissionCategory.SHOPPING,
        level: PermissionLevel.WRITE,
        dependencies: ['shopping.browse'],
    },
    {
        id: 'shopping.orders',
        name: 'Order Management',
        description: 'View and manage orders',
        category: PermissionCategory.SHOPPING,
        level: PermissionLevel.READ,
    },
    {
        id: 'shopping.reviews',
        name: 'Product Reviews',
        description: 'Write and manage product reviews',
        category: PermissionCategory.SHOPPING,
        level: PermissionLevel.WRITE,
    },

    // Payment
    {
        id: 'payment.methods',
        name: 'Payment Methods',
        description: 'Manage payment methods',
        category: PermissionCategory.PAYMENT,
        level: PermissionLevel.WRITE,
    },
    {
        id: 'payment.process',
        name: 'Process Payments',
        description: 'Process payments for orders',
        category: PermissionCategory.PAYMENT,
        level: PermissionLevel.WRITE,
        dependencies: ['payment.methods'],
    },
    {
        id: 'payment.refunds',
        name: 'Request Refunds',
        description: 'Request refunds for orders',
        category: PermissionCategory.PAYMENT,
        level: PermissionLevel.WRITE,
    },
    {
        id: 'payment.walmart_plus',
        name: 'Walmart+ Membership',
        description: 'Manage Walmart+ subscription',
        category: PermissionCategory.PAYMENT,
        level: PermissionLevel.WRITE,
    },

    // Location
    {
        id: 'location.access',
        name: 'Location Access',
        description: 'Access device location for store finder and delivery',
        category: PermissionCategory.LOCATION,
        level: PermissionLevel.READ,
    },
    {
        id: 'location.stores',
        name: 'Store Locator',
        description: 'Find nearby Walmart stores',
        category: PermissionCategory.LOCATION,
        level: PermissionLevel.READ,
        dependencies: ['location.access'],
    },
    {
        id: 'location.delivery',
        name: 'Delivery Tracking',
        description: 'Track delivery location in real-time',
        category: PermissionCategory.LOCATION,
        level: PermissionLevel.READ,
        dependencies: ['location.access'],
    },

    // Notifications
    {
        id: 'notifications.push',
        name: 'Push Notifications',
        description: 'Receive push notifications',
        category: PermissionCategory.NOTIFICATIONS,
        level: PermissionLevel.READ,
    },
    {
        id: 'notifications.email',
        name: 'Email Notifications',
        description: 'Receive email notifications',
        category: PermissionCategory.NOTIFICATIONS,
        level: PermissionLevel.READ,
    },
    {
        id: 'notifications.sms',
        name: 'SMS Notifications',
        description: 'Receive SMS notifications',
        category: PermissionCategory.NOTIFICATIONS,
        level: PermissionLevel.READ,
    },
    {
        id: 'notifications.marketing',
        name: 'Marketing Communications',
        description: 'Receive marketing and promotional content',
        category: PermissionCategory.NOTIFICATIONS,
        level: PermissionLevel.READ,
    },

    // Camera
    {
        id: 'camera.access',
        name: 'Camera Access',
        description: 'Access device camera',
        category: PermissionCategory.CAMERA,
        level: PermissionLevel.READ,
    },
    {
        id: 'camera.barcode_scan',
        name: 'Barcode Scanner',
        description: 'Scan product barcodes',
        category: PermissionCategory.CAMERA,
        level: PermissionLevel.READ,
        dependencies: ['camera.access'],
    },
    {
        id: 'camera.product_photos',
        name: 'Product Photos',
        description: 'Take photos for reviews or returns',
        category: PermissionCategory.CAMERA,
        level: PermissionLevel.WRITE,
        dependencies: ['camera.access'],
    },

    // Files
    {
        id: 'files.read',
        name: 'Read Files',
        description: 'Read files from device storage',
        category: PermissionCategory.FILES,
        level: PermissionLevel.READ,
    },
    {
        id: 'files.write',
        name: 'Write Files',
        description: 'Save files to device storage',
        category: PermissionCategory.FILES,
        level: PermissionLevel.WRITE,
    },

    // Contacts
    {
        id: 'contacts.access',
        name: 'Contacts Access',
        description: 'Access device contacts for sharing',
        category: PermissionCategory.CONTACTS,
        level: PermissionLevel.READ,
    },

    // Calendar
    {
        id: 'calendar.access',
        name: 'Calendar Access',
        description: 'Access calendar for delivery scheduling',
        category: PermissionCategory.CALENDAR,
        level: PermissionLevel.READ,
    },
    {
        id: 'calendar.events',
        name: 'Calendar Events',
        description: 'Create calendar events for deliveries',
        category: PermissionCategory.CALENDAR,
        level: PermissionLevel.WRITE,
        dependencies: ['calendar.access'],
    },
];

// Default roles
export const DEFAULT_ROLES: Role[] = [
    {
        id: 'customer',
        name: 'Customer',
        description: 'Standard customer with basic shopping permissions',
        permissions: [
            'auth.login',
            'auth.register',
            'auth.social_login',
            'profile.view',
            'profile.edit',
            'shopping.browse',
            'shopping.cart',
            'shopping.wishlist',
            'shopping.orders',
            'shopping.reviews',
            'payment.methods',
            'payment.process',
            'payment.refunds',
            'location.access',
            'location.stores',
            'location.delivery',
            'notifications.push',
            'notifications.email',
            'camera.access',
            'camera.barcode_scan',
            'camera.product_photos',
        ],
        isDefault: true,
        isSystem: true,
    },
    {
        id: 'walmart_plus_member',
        name: 'Walmart+ Member',
        description: 'Walmart+ member with premium features',
        permissions: [
            'auth.login',
            'auth.register',
            'auth.social_login',
            'auth.biometric',
            'profile.view',
            'profile.edit',
            'shopping.browse',
            'shopping.cart',
            'shopping.wishlist',
            'shopping.orders',
            'shopping.reviews',
            'payment.methods',
            'payment.process',
            'payment.refunds',
            'payment.walmart_plus',
            'location.access',
            'location.stores',
            'location.delivery',
            'notifications.push',
            'notifications.email',
            'notifications.sms',
            'notifications.marketing',
            'camera.access',
            'camera.barcode_scan',
            'camera.product_photos',
            'files.read',
            'files.write',
            'contacts.access',
            'calendar.access',
            'calendar.events',
        ],
        isDefault: false,
        isSystem: true,
    },
    {
        id: 'guest',
        name: 'Guest',
        description: 'Guest user with limited permissions',
        permissions: [
            'shopping.browse',
            'location.stores',
        ],
        isDefault: false,
        isSystem: true,
    },
];

// Permission utility functions
export class PermissionManager {
    static hasPermission(
        userPermissions: UserPermissions,
        permissionId: string,
        requiredLevel: PermissionLevel = PermissionLevel.READ
    ): boolean {
        const userLevel = userPermissions.permissions[permissionId];
        if (!userLevel) return false;

        const levels = [PermissionLevel.NONE, PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN];
        const userLevelIndex = levels.indexOf(userLevel);
        const requiredLevelIndex = levels.indexOf(requiredLevel);

        return userLevelIndex >= requiredLevelIndex;
    }

    static hasAnyPermission(
        userPermissions: UserPermissions,
        permissionIds: string[],
        requiredLevel: PermissionLevel = PermissionLevel.READ
    ): boolean {
        return permissionIds.some(permissionId =>
            this.hasPermission(userPermissions, permissionId, requiredLevel)
        );
    }

    static hasAllPermissions(
        userPermissions: UserPermissions,
        permissionIds: string[],
        requiredLevel: PermissionLevel = PermissionLevel.READ
    ): boolean {
        return permissionIds.every(permissionId =>
            this.hasPermission(userPermissions, permissionId, requiredLevel)
        );
    }

    static checkDependencies(
        userPermissions: UserPermissions,
        permission: Permission
    ): boolean {
        if (!permission.dependencies) return true;

        return permission.dependencies.every(depId =>
            this.hasPermission(userPermissions, depId)
        );
    }

    static getPermissionsByCategory(
        category: PermissionCategory,
        permissions: Permission[] = DEFAULT_PERMISSIONS
    ): Permission[] {
        return permissions.filter(permission => permission.category === category);
    }

    static getRolePermissions(roleId: string, roles: Role[] = DEFAULT_ROLES): string[] {
        const role = roles.find(r => r.id === roleId);
        return role ? role.permissions : [];
    }

    static getUserPermissionsFromRoles(roles: Role[]): Record<string, PermissionLevel> {
        const permissions: Record<string, PermissionLevel> = {};

        roles.forEach(role => {
            role.permissions.forEach(permissionId => {
                // If permission already exists, keep the higher level
                const existingLevel = permissions[permissionId];
                if (!existingLevel) {
                    permissions[permissionId] = PermissionLevel.READ;
                }
            });
        });

        return permissions;
    }

    static isPermissionExpired(grant: PermissionGrant): boolean {
        if (!grant.expiresAt) return false;
        return new Date(grant.expiresAt) < new Date();
    }

    static getActivePermissions(grants: PermissionGrant[]): PermissionGrant[] {
        return grants.filter(grant => grant.isActive && !this.isPermissionExpired(grant));
    }

    static canRequestPermission(
        userPermissions: UserPermissions,
        permissionId: string,
        requestedLevel: PermissionLevel
    ): boolean {
        const currentLevel = userPermissions.permissions[permissionId];
        if (!currentLevel) return true;

        const levels = [PermissionLevel.NONE, PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN];
        const currentLevelIndex = levels.indexOf(currentLevel);
        const requestedLevelIndex = levels.indexOf(requestedLevel);

        // Can only request higher levels
        return requestedLevelIndex > currentLevelIndex;
    }
}

export default PermissionManager;