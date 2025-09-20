import { Camera } from 'expo-camera';
// import { BarCodeScanner } from 'expo-barcode-scanner';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Linking, Platform } from 'react-native';
import { PermissionCategory, PermissionLevel } from '../../utils/permissions';

export interface PermissionStatus {
    granted: boolean;
    canAskAgain?: boolean;
    status: string;
    expires?: 'never' | number;
}

export interface PermissionResult {
    [key: string]: PermissionStatus;
}

export interface PermissionSetupResult {
    critical: boolean;
    optional: PermissionResult;
    summary: {
        totalRequested: number;
        totalGranted: number;
        criticalGranted: number;
        optionalGranted: number;
    };
}

export class WalmartPermissionService {
    private static instance: WalmartPermissionService;

    public static getInstance(): WalmartPermissionService {
        if (!WalmartPermissionService.instance) {
            WalmartPermissionService.instance = new WalmartPermissionService();
        }
        return WalmartPermissionService.instance;
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
            //
            // // Barcode scanner (uses camera)
            // const barcodeResult = await BarCodeScanner.requestPermissionsAsync();
            // results['barcode'] = {
            //     granted: barcodeResult.granted,
            //     canAskAgain: barcodeResult.canAskAgain,
            //     status: barcodeResult.status,
            // };

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
        try {
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

                case PermissionCategory.FILES:
                    const mediaResult = await MediaLibrary.requestPermissionsAsync();
                    return {
                        granted: mediaResult.granted,
                        canAskAgain: mediaResult.canAskAgain,
                        status: mediaResult.status,
                    };

                default:
                    throw new Error(`Permission category ${category} not supported`);
            }
        } catch (error) {
            console.error(`Error requesting ${category} permission:`, error);
            return {
                granted: false,
                status: 'error',
            };
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

            // // Barcode Scanner
            // const barcodeStatus = await BarCodeScanner.getPermissionsAsync();
            // results['barcode'] = {
            //     granted: barcodeStatus.granted,
            //     canAskAgain: barcodeStatus.canAskAgain,
            //     status: barcodeStatus.status,
            // };

            // Optional permissions with error handling
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
    showPermissionDeniedAlert(permissionName: string, reason: string): void {
        Alert.alert(
            `${permissionName} Permission Required`,
            `Walmart app needs ${permissionName.toLowerCase()} access to ${reason}. Please enable it in your device settings.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => this.openAppSettings(),
                    style: 'default'
                },
            ]
        );
    }

    /**
     * Show permission rationale before requesting
     */
    showPermissionRationale(
        permissionName: string,
        reason: string,
        onAccept: () => void,
        onDecline: () => void
    ): void {
        Alert.alert(
            `Allow ${permissionName}?`,
            `Walmart app would like to access ${permissionName.toLowerCase()} to ${reason}. This helps us provide you with better shopping experience.`,
            [
                {
                    text: 'Not Now',
                    style: 'cancel',
                    onPress: onDecline
                },
                {
                    text: 'Allow',
                    onPress: onAccept,
                    style: 'default'
                },
            ]
        );
    }

    /**
     * Open device app settings
     */
    private async openAppSettings(): Promise<void> {
        try {
            if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
            } else {
                await Linking.openSettings();
            }
        } catch (error) {
            console.error('Error opening app settings:', error);
            Alert.alert(
                'Settings',
                'Please open your device settings manually and grant the required permissions to Walmart app.'
            );
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
            this.showPermissionRationale(
                title,
                description,
                async () => {
                    const result = await this.requestPermissionByCategory(category);
                    resolve(result);
                },
                () => {
                    resolve({ granted: false, status: 'denied' });
                }
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
            PermissionCategory.NOTIFICATIONS,
            PermissionCategory.CONTACTS,
            PermissionCategory.CALENDAR,
            PermissionCategory.BIOMETRICS,
            PermissionCategory.FILES,
        ];
    }

    /**
     * Check if all critical permissions are granted
     */
    async areCriticalPermissionsGranted(): Promise<boolean> {
        try {
            const results = await this.checkAllPermissions();

            // Check camera permission (for barcode scanning)
            const cameraGranted = results['camera']?.granted ?? false;

            // Check location permission (for store finder)
            const locationGranted = results['location']?.granted ?? false;

            return cameraGranted && locationGranted;
        } catch (error) {
            console.error('Error checking critical permissions:', error);
            return false;
        }
    }

    /**
     * Request only critical permissions
     */
    async requestCriticalPermissions(): Promise<boolean> {
        try {
            const cameraResult = await this.requestPermissionByCategory(PermissionCategory.CAMERA);
            const locationResult = await this.requestPermissionByCategory(PermissionCategory.LOCATION);

            const allGranted = cameraResult.granted && locationResult.granted;

            if (!allGranted) {
                console.warn('Critical permissions not fully granted:', {
                    camera: cameraResult.granted,
                    location: locationResult.granted
                });
            }

            return allGranted;
        } catch (error) {
            console.error('Error requesting critical permissions:', error);
            return false;
        }
    }

    /**
     * Setup permissions on app first launch
     */
    async setupInitialPermissions(): Promise<PermissionSetupResult> {
        let totalRequested = 0;
        let totalGranted = 0;
        let criticalGranted = 0;
        let optionalGranted = 0;

        // Request critical permissions first
        console.log('Requesting critical permissions...');
        const criticalSuccess = await this.requestCriticalPermissions();
        totalRequested += 2; // camera + location

        if (criticalSuccess) {
            criticalGranted = 2;
            totalGranted += 2;
        }

        if (!criticalSuccess) {
            Alert.alert(
                'Permissions Required',
                'Walmart app needs camera and location permissions to function properly. Please grant these permissions to continue.',
                [{ text: 'OK' }]
            );
        }

        // Request optional permissions
        console.log('Requesting optional permissions...');
        const optionalResults: PermissionResult = {};
        const optionalPermissions = this.getOptionalPermissions();

        for (const permission of optionalPermissions) {
            try {
                totalRequested++;
                const result = await this.requestPermissionByCategory(permission);
                optionalResults[permission.toLowerCase()] = result;

                if (result.granted) {
                    optionalGranted++;
                    totalGranted++;
                }
            } catch (error) {
                console.warn(`Optional permission ${permission} failed:`, error);
                optionalResults[permission.toLowerCase()] = {
                    granted: false,
                    status: 'error'
                };
            }
        }

        const setupResult: PermissionSetupResult = {
            critical: criticalSuccess,
            optional: optionalResults,
            summary: {
                totalRequested,
                totalGranted,
                criticalGranted,
                optionalGranted,
            }
        };

        console.log('Permission setup complete:', setupResult.summary);
        return setupResult;
    }

    /**
     * Check if permission can be requested again
     */
    async canRequestPermission(category: PermissionCategory): Promise<boolean> {
        try {
            const results = await this.checkAllPermissions();
            const key = category.toLowerCase();
            const permission = results[key];

            if (!permission) return true; // Not requested yet
            if (permission.granted) return false; // Already granted

            return permission.canAskAgain ?? true;
        } catch (error) {
            console.error('Error checking if permission can be requested:', error);
            return false;
        }
    }

    /**
     * Get permission status summary for UI display
     */
    async getPermissionSummary(): Promise<{
        critical: { granted: number; total: number; };
        optional: { granted: number; total: number; };
        overall: { granted: number; total: number; };
    }> {
        try {
            const results = await this.checkAllPermissions();

            let criticalGranted = 0;
            let optionalGranted = 0;

            // Check critical permissions
            const criticalKeys = ['camera', 'location'];
            for (const key of criticalKeys) {
                if (results[key]?.granted) {
                    criticalGranted++;
                }
            }

            // Check optional permissions
            const optionalKeys = ['notifications', 'contacts', 'calendar', 'media'];
            for (const key of optionalKeys) {
                if (results[key]?.granted) {
                    optionalGranted++;
                }
            }

            return {
                critical: { granted: criticalGranted, total: criticalKeys.length },
                optional: { granted: optionalGranted, total: optionalKeys.length },
                overall: {
                    granted: criticalGranted + optionalGranted,
                    total: criticalKeys.length + optionalKeys.length
                }
            };
        } catch (error) {
            console.error('Error getting permission summary:', error);
            return {
                critical: { granted: 0, total: 2 },
                optional: { granted: 0, total: 4 },
                overall: { granted: 0, total: 6 }
            };
        }
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

export default permissionService;