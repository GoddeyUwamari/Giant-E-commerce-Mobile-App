import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export interface CameraPermissionResult {
    camera: boolean;
    mediaLibrary: boolean;
    barcode: boolean;
}

export interface BarcodeResult {
    data: string;
    type: string;
    bounds?: {
        origin: { x: number; y: number };
        size: { width: number; height: number };
    };
}

export interface CaptureResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
}

export interface ProductAnalysisResult {
    productName?: string;
    barcode?: string;
    category?: string;
    confidence: number;
    error?: string;
}

export interface CameraService {
    requestPermissions(): Promise<CameraPermissionResult>;
    scanBarcode(): Promise<BarcodeResult | null>;
    captureReceipt(): Promise<CaptureResult | null>;
    capturePhoto(): Promise<CaptureResult | null>;
    analyzeProduct(imageUri: string): Promise<ProductAnalysisResult>;
    saveToGallery(uri: string): Promise<boolean>;
    checkPermissions(): Promise<CameraPermissionResult>;
}

export class WalmartCameraService implements CameraService {
    async requestPermissions(): Promise<CameraPermissionResult> {
        try {
            const [cameraPermission, mediaPermission, barcodePermission] = await Promise.all([
                Camera.requestCameraPermissionsAsync(),
                MediaLibrary.requestPermissionsAsync(),
                BarCodeScanner.requestPermissionsAsync(),
            ]);

            return {
                camera: cameraPermission.granted,
                mediaLibrary: mediaPermission.granted,
                barcode: barcodePermission.granted,
            };
        } catch (error) {
            console.error('Error requesting camera permissions:', error);
            return {
                camera: false,
                mediaLibrary: false,
                barcode: false,
            };
        }
    }

    async checkPermissions(): Promise<CameraPermissionResult> {
        try {
            const [cameraStatus, mediaStatus, barcodeStatus] = await Promise.all([
                Camera.getCameraPermissionsAsync(),
                MediaLibrary.getPermissionsAsync(),
                BarCodeScanner.getPermissionsAsync(),
            ]);

            return {
                camera: cameraStatus.granted,
                mediaLibrary: mediaStatus.granted,
                barcode: barcodeStatus.granted,
            };
        } catch (error) {
            console.error('Error checking permissions:', error);
            return {
                camera: false,
                mediaLibrary: false,
                barcode: false,
            };
        }
    }

    async scanBarcode(): Promise<BarcodeResult | null> {
        // This would typically be implemented in a component with Camera view
        throw new Error('scanBarcode should be implemented in a camera component');
    }

    async captureReceipt(): Promise<CaptureResult | null> {
        // This would typically be implemented in a component with Camera view
        throw new Error('captureReceipt should be implemented in a camera component');
    }

    async capturePhoto(): Promise<CaptureResult | null> {
        // This would typically be implemented in a component with Camera view
        throw new Error('capturePhoto should be implemented in a camera component');
    }

    async analyzeProduct(imageUri: string): Promise<ProductAnalysisResult> {
        try {
            // This would integrate with your AI service (Anthropic API)
            // For now, return a mock result
            return {
                confidence: 0,
                error: 'Product analysis not implemented yet',
            };
        } catch (error) {
            return {
                confidence: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async saveToGallery(uri: string): Promise<boolean> {
        try {
            const permissions = await this.checkPermissions();
            if (!permissions.mediaLibrary) {
                throw new Error('Media library permission not granted');
            }

            await MediaLibrary.saveToLibraryAsync(uri);
            return true;
        } catch (error) {
            console.error('Error saving to gallery:', error);
            return false;
        }
    }
}

export const cameraService = new WalmartCameraService();