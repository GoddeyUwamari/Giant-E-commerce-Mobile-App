import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform, Linking } from 'react-native';

export enum PermissionCategory {
    AUTHENTICATION = 'authentication',
    PROFILE = 'profile',
    SHOPPING = 'shopping',
    PAYMENT = 'payment',
    LOCATION = 'location',
    LOCATION_BACKGROUND = 'location_background',
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

export interface Permission {
    id: string;
    name: string;
    description: string;
    category: PermissionCategory;
    level: PermissionLevel;
    dependencies?: string[];
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

export interface PermissionStatus {
    granted: boolean;
    canAskAgain?: boolean;
    status: string;
    expires?: 'never' | number;
}

export interface PermissionResult {
    [key: string]: PermissionStatus;
}

export interface PermissionContext {
    feature: string;
    reason: string;
    isRequired: boolean;
}

export class WalmartPermissionService {
    private static instance: WalmartPermissionService;
    private permissionContexts: Map<PermissionCategory, PermissionContext[]> = new Map();

    public static getInstance(): WalmartPermissionService {
        if (!WalmartPermissionService.instance) {
            WalmartPermissionService.instance = new WalmartPermissionService();
        }
        return WalmartPermissionService.instance;
    }

    constructor() {
        this.initializePermissionContexts();
    }

    private initializePermissionContexts() {
        this.permissionContexts.set(PermissionCategory.CAMERA, [
            { feature: 'Barcode Scanning', reason: 'scan product barcodes for price checks and shopping', isRequired: true },
            { feature: 'Photo Capture', reason: 'take photos of receipts and products', isRequired: false }
        ]);

        this.permissionContexts.set(PermissionCategory.LOCATION, [
            { feature: 'Store Finder', reason: 'find nearby Walmart stores and get directions', isRequired: true },
            { feature: 'Local Deals', reason: 'show location-specific deals and inventory', isRequired: false }
        ]);

        this.permissionContexts.set(PermissionCategory.LOCATION_BACKGROUND, [
            { feature: 'Curbside Pickup', reason: 'notify when you arrive for pickup orders', isRequired: false },
            { feature: 'Store Arrival', reason: 'automatically check you in when arriving at stores', isRequired: false }
        ]);

        this.permissionContexts.set(PermissionCategory.NOTIFICATIONS, [
            { feature: 'Order Updates', reason: 'receive updates about your orders and deliveries', isRequired: false },
            { feature: 'Deal Alerts', reason: 'get notified about sales and special offers', isRequired: false }
        ]);
    }

    /**
     * Request permission with contextual explanation
     */
    async requestPermissionWithContext(
        category: PermissionCategory,
        featureName?: string
    ): Promise<PermissionStatus> {
        const contexts = this.permissionContexts.get(category) || [];
        const context = featureName
            ? contexts.find(c => c.feature === featureName)
            : contexts[0];

        if (context) {
            const title = `${context.feature} Permission`;
            const description = `To use ${context.feature}, Walmart needs permission to ${context.reason}.`;

            return await this.requestPermissionWithExplanation(category, title, description);
        }

        return await this.requestPermissionByCategory(category);
    }

    /**
     * Request all essential permissions for Walmart app
     */
    async requestAllPermissions(): Promise<PermissionResult> {
        const results: PermissionResult = {};

        try {
            // Camera permissions
            const cameraResult = await Camera.requestCameraPermissionsAsync();
            results['camera'] = {
                granted: cameraResult.granted,
                canAskAgain: cameraResult.canAskAgain,
                status: cameraResult.status,
            };

            // Media library for saving photos
            const mediaResult = await MediaLibrary.requestPermissionsAsync();
            results['media'] = {
                granted: mediaResult.granted,
                canAskAgain: mediaResult.canAskAgain,
                status: mediaResult.status,
            };

            // Location for store finder
            const locationResult = await Location.requestForegroundPermissionsAsync();
            results['location'] = {
                granted: locationResult.granted,
                canAskAgain: locationResult.canAskAgain,
                status: locationResult.status,
            };

            // Background location for curbside pickup
            if (locationResult.granted) {
                try {
                    const backgroundLocationResult = await Location.requestBackgroundPermissionsAsync();
                    results['location_background'] = {
                        granted: backgroundLocationResult.granted,
                        canAskAgain: backgroundLocationResult.canAskAgain,
                        status: backgroundLocationResult.status,
                    };
                } catch (error) {
                    console.warn('Background location permission not available');
                    results['location_background'] = { granted: false, status: 'unavailable' };
                }
            }

            // Push notifications
            const notificationResult = await Notifications.requestPermissionsAsync();
            results['notifications'] = {
                granted: notificationResult.granted,
                canAskAgain: notificationResult.canAskAgain,
                status: notificationResult.status,
            };

            // Contacts (optional)
            try {
                const contactsResult = await Contacts.requestPermissionsAsync();
                results['contacts'] = {
                    granted: contactsResult.granted,
                    canAskAgain: contactsResult.canAskAgain,
                    status: contactsResult.status,
                };
            } catch (error) {
                console.warn('Contacts permission not available on this platform');
                results['contacts'] = { granted: false, status: 'unavailable' };
            }

            // Calendar (optional)
            try {
                const calendarResult = await Calendar.requestCalendarPermissionsAsync();
                results['calendar'] = {
                    granted: calendarResult.granted,
                    canAskAgain: calendarResult.canAskAgain,
                    status: calendarResult.status,
                };
            } catch (error) {
                console.warn('Calendar permission not available on this platform');
                results['calendar'] = { granted: false, status: 'unavailable' };
            }

            return results;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            throw new Error('Failed to request permissions');
        }
    }

    /**
     * Request specific permission by category
     */
    async requestPermissionByCategory(category: PermissionCategory): Promise<PermissionStatus> {
        switch (category) {
            case PermissionCategory.CAMERA:
                const cameraResult = await Camera.requestCameraPermissionsAsync();
                return {
                    granted: cameraResult.granted,
                    canAskAgain: cameraResult.canAskAgain,
                    status: cameraResult.status,
                };

            case PermissionCategory.LOCATION:
                const locationResult = await Location.requestForegroundPermissionsAsync();
                return {
                    granted: locationResult.granted,
                    canAskAgain: locationResult.canAskAgain,
                    status: locationResult.status,
                };

            case PermissionCategory.LOCATION_BACKGROUND:
                const backgroundLocationResult = await Location.requestBackgroundPermissionsAsync();
                return {
                    granted: backgroundLocationResult.granted,
                    canAskAgain: backgroundLocationResult.canAskAgain,
                    status: backgroundLocationResult.status,
                };

            case PermissionCategory.NOTIFICATIONS:
                const notificationResult = await Notifications.requestPermissionsAsync();
                return {
                    granted: notificationResult.granted,
                    canAskAgain: notificationResult.canAskAgain,
                    status: notificationResult.status,
                };

            case PermissionCategory.BIOMETRICS:
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                return {
                    granted: hasHardware && isEnrolled,
                    status: hasHardware && isEnrolled ? 'granted' : 'denied',
                };

            case PermissionCategory.CONTACTS:
                const contactsResult = await Contacts.requestPermissionsAsync();
                return {
                    granted: contactsResult.granted,
                    canAskAgain: contactsResult.canAskAgain,
                    status: contactsResult.status,
                };

            case PermissionCategory.CALENDAR:
                const calendarResult = await Calendar.requestCalendarPermissionsAsync();
                return {
                    granted: calendarResult.granted,
                    canAskAgain: calendarResult.canAskAgain,
                    status: calendarResult.status,
                };

            default:
                throw new Error(`Permission category ${category} not supported`);
        }
    }

    /**
     * Check current status of all permissions
     */
    async checkAllPermissions(): Promise<PermissionResult> {
        const results: PermissionResult = {};

        try {
            // Camera
            const cameraStatus = await Camera.getCameraPermissionsAsync();
            results['camera'] = {
                granted: cameraStatus.granted,
                canAskAgain: cameraStatus.canAskAgain,
                status: cameraStatus.status,
            };

            // Location
            const locationStatus = await Location.getForegroundPermissionsAsync();
            results['location'] = {
                granted: locationStatus.granted,
                canAskAgain: locationStatus.canAskAgain,
                status: locationStatus.status,
            };

            // Background Location
            const backgroundLocationStatus = await Location.getBackgroundPermissionsAsync();
            results['location_background'] = {
                granted: backgroundLocationStatus.granted,
                canAskAgain: backgroundLocationStatus.canAskAgain,
                status: backgroundLocationStatus.status,
            };

            // Media Library
            const mediaStatus = await MediaLibrary.getPermissionsAsync();
            results['media'] = {
                granted: mediaStatus.granted,
                canAskAgain: mediaStatus.canAskAgain,
                status: mediaStatus.status,
            };

            // Notifications
            const notificationStatus = await Notifications.getPermissionsAsync();
            results['notifications'] = {
                granted: notificationStatus.granted,
                canAskAgain: notificationStatus.canAskAgain,
                status: notificationStatus.status,
            };

            // Contacts
            try {
                const contactsStatus = await Contacts.getPermissionsAsync();
                results['contacts'] = {
                    granted: contactsStatus.granted,
                    canAskAgain: contactsStatus.canAskAgain,
                    status: contactsStatus.status,
                };
            } catch (error) {
                results['contacts'] = { granted: false, status: 'unavailable' };
            }

            // Calendar
            try {
                const calendarStatus = await Calendar.getCalendarPermissionsAsync();
                results['calendar'] = {
                    granted: calendarStatus.granted,
                    canAskAgain: calendarStatus.canAskAgain,
                    status: calendarStatus.status,
                };
            } catch (error) {
                results['calendar'] = { granted: false, status: 'unavailable' };
            }

            return results;
        } catch (error) {
            console.error('Error checking permissions:', error);
            throw new Error('Failed to check permissions');
        }
    }

    /**
     * Show permission denied alert with guidance
     */
    showPermissionDeniedAlert(permissionName: string, reason: string) {
        Alert.alert(
            `${permissionName} Permission Required`,
            `Walmart app needs ${permissionName.toLowerCase()} access to ${reason}. Please enable it in your device settings.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => this.openAppSettings() },
            ]
        );
    }

    /**
     * Open device app settings
     */
    private async openAppSettings() {
        try {
            if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
            } else {
                await Linking.openSettings();
            }
        } catch (error) {
            console.error('Failed to open app settings:', error);
            Alert.alert('Error', 'Unable to open settings. Please manually navigate to Settings > Apps > Walmart to manage permissions.');
        }
    }

    /**
     * Request permissions with user-friendly explanations
     */
    async requestPermissionWithExplanation(
        category: PermissionCategory,
        title: string,
        description: string
    ): Promise<PermissionStatus> {
        return new Promise((resolve) => {
            Alert.alert(
                title,
                description,
                [
                    {
                        text: 'Not Now',
                        style: 'cancel',
                        onPress: () => resolve({ granted: false, status: 'denied' }),
                    },
                    {
                        text: 'Allow',
                        onPress: async () => {
                            try {
                                const result = await this.requestPermissionByCategory(category);
                                resolve(result);
                            } catch (error) {
                                console.error(`Error requesting ${category} permission:`, error);
                                resolve({ granted: false, status: 'error' });
                            }
                        },
                    },
                ]
            );
        });
    }

    /**
     * Get critical permissions that are required for app to function
     */
    getCriticalPermissions(): PermissionCategory[] {
        return [
            PermissionCategory.CAMERA, // For barcode scanning
            PermissionCategory.LOCATION, // For store finder
        ];
    }

    /**
     * Get optional permissions that enhance user experience
     */
    getOptionalPermissions(): PermissionCategory[] {
        return [
            PermissionCategory.LOCATION_BACKGROUND,
            PermissionCategory.NOTIFICATIONS,
            PermissionCategory.CONTACTS,
            PermissionCategory.CALENDAR,
            PermissionCategory.BIOMETRICS,
        ];
    }

    /**
     * Check if all critical permissions are granted
     */
    async areCriticalPermissionsGranted(): Promise<boolean> {
        const criticalPermissions = this.getCriticalPermissions();
        const results = await this.checkAllPermissions();

        return criticalPermissions.every(permission => {
            const key = permission.toLowerCase();
            return results[key]?.granted ?? false;
        });
    }

    /**
     * Request only critical permissions with context
     */
    async requestCriticalPermissions(): Promise<boolean> {
        const criticalPermissions = this.getCriticalPermissions();
        const results: boolean[] = [];

        for (const permission of criticalPermissions) {
            try {
                const result = await this.requestPermissionWithContext(permission);
                results.push(result.granted);
            } catch (error) {
                console.error(`Failed to request ${permission} permission:`, error);
                results.push(false);
            }
        }

        return results.every(granted => granted);
    }

    /**
     * Setup permissions on app first launch
     */
    async setupInitialPermissions(): Promise<{
        critical: boolean;
        optional: PermissionResult;
    }> {
        // Request critical permissions first with context
        const criticalGranted = await this.requestCriticalPermissions();

        if (!criticalGranted) {
            Alert.alert(
                'Essential Permissions Required',
                'Walmart app needs camera and location permissions to provide core features like barcode scanning and store finding. Please grant these permissions to continue using the app.',
                [{ text: 'OK' }]
            );
        }

        // Request optional permissions with context
        const optionalResults: PermissionResult = {};
        const optionalPermissions = this.getOptionalPermissions();

        for (const permission of optionalPermissions) {
            try {
                const result = await this.requestPermissionWithContext(permission);
                optionalResults[permission.toLowerCase()] = result;
            } catch (error) {
                console.warn(`Optional permission ${permission} failed:`, error);
                optionalResults[permission.toLowerCase()] = { granted: false, status: 'error' };
            }
        }

        return {
            critical: criticalGranted,
            optional: optionalResults,
        };
    }

    /**
     * Request permission at the point of use
     */
    async requestJustInTimePermission(
        category: PermissionCategory,
        featureName: string
    ): Promise<boolean> {
        try {
            // First check if we already have permission
            const currentStatus = await this.checkPermissionStatus(category);
            if (currentStatus.granted) {
                return true;
            }

            // If we can't ask again, show settings alert
            if (currentStatus.canAskAgain === false) {
                const contexts = this.permissionContexts.get(category) || [];
                const context = contexts.find(c => c.feature === featureName);
                if (context) {
                    this.showPermissionDeniedAlert(featureName, context.reason);
                }
                return false;
            }

            // Request permission with context
            const result = await this.requestPermissionWithContext(category, featureName);
            return result.granted;
        } catch (error) {
            console.error(`Failed to request just-in-time permission for ${category}:`, error);
            return false;
        }
    }

    /**
     * Check status of a specific permission
     */
    async checkPermissionStatus(category: PermissionCategory): Promise<PermissionStatus> {
        const allPermissions = await this.checkAllPermissions();
        const key = category.toLowerCase();
        return allPermissions[key] || { granted: false, status: 'undetermined' };
    }
}

// Export singleton instance
export const permissionService = WalmartPermissionService.getInstance();

// Enhanced utility function
export const requestAllPermissions = async (): Promise<boolean> => {
    try {
        const results = await permissionService.requestAllPermissions();

        // Check if all critical permissions are granted
        const criticalPermissions = ['camera', 'location'];
        const criticalGranted = criticalPermissions.every(permission =>
            results[permission]?.granted ?? false
        );

        if (!criticalGranted) {
            console.warn('Critical permissions not granted:', results);
        }

        return criticalGranted;
    } catch (error) {
        console.error('Failed to request all permissions:', error);
        return false;
    }
};

// Utility function for just-in-time permission requests
export const requestFeaturePermission = async (
    feature: 'barcode-scan' | 'store-finder' | 'curbside-pickup' | 'notifications' | 'photo-capture'
): Promise<boolean> => {
    const featurePermissionMap: Record<string, { category: PermissionCategory; name: string }> = {
        'barcode-scan': { category: PermissionCategory.CAMERA, name: 'Barcode Scanning' },
        'store-finder': { category: PermissionCategory.LOCATION, name: 'Store Finder' },
        'curbside-pickup': { category: PermissionCategory.LOCATION_BACKGROUND, name: 'Curbside Pickup' },
        'notifications': { category: PermissionCategory.NOTIFICATIONS, name: 'Order Updates' },
        'photo-capture': { category: PermissionCategory.CAMERA, name: 'Photo Capture' },
    };

    const mapping = featurePermissionMap[feature];
    if (!mapping) {
        console.error(`Unknown feature: ${feature}`);
        return false;
    }

    return await permissionService.requestJustInTimePermission(mapping.category, mapping.name);
};