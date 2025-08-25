import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string | null;
    reportSent: boolean;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    enableReporting?: boolean;
    showErrorDetails?: boolean;
    customErrorComponent?: (error: Error, retry: () => void) => ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            reportSent: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
            errorId: Date.now().toString(),
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call custom error handler
        this.props.onError?.(error, errorInfo);

        // Report error to crash analytics (if enabled)
        if (this.props.enableReporting) {
            this.reportError(error, errorInfo);
        }

        // Store error for offline reporting
        this.storeErrorOffline(error, errorInfo);
    }

    private async reportError(error: Error, errorInfo: ErrorInfo) {
        try {
            // TODO: Replace with your crash reporting service (e.g., Crashlytics, Sentry)
            const errorReport = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                platform: 'react-native',
                version: '1.0.0', // App version
            };

            // Mock API call to error reporting service
            console.log('Reporting error:', errorReport);

            this.setState({ reportSent: true });
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError);
        }
    }

    private async storeErrorOffline(error: Error, errorInfo: ErrorInfo) {
        try {
            const errorData = {
                id: this.state.errorId,
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
            };

            const existingErrors = await AsyncStorage.getItem('offline_errors');
            const errors = existingErrors ? JSON.parse(existingErrors) : [];
            errors.push(errorData);

            // Keep only last 10 errors
            const recentErrors = errors.slice(-10);
            await AsyncStorage.setItem('offline_errors', JSON.stringify(recentErrors));
        } catch (storageError) {
            console.error('Failed to store error offline:', storageError);
        }
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            reportSent: false,
        });
    };

    private handleGoHome = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            reportSent: false,
        });
        router.push('/(tabs)');
    };

    private handleReportProblem = () => {
        const { error, errorId } = this.state;
        const subject = `App Error Report - ${errorId}`;
        const body = `Hi Walmart Support,

I encountered an error in the app:

Error ID: ${errorId}
Error Message: ${error?.message}
Time: ${new Date().toLocaleString()}

Please let me know if you need any additional information.

Thank you!`;

        const mailto = `mailto:support@walmart.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        Linking.openURL(mailto).catch(() => {
            Alert.alert(
                'Email Not Available',
                'Please contact support at support@walmart.com',
                [{ text: 'OK' }]
            );
        });
    };

    private handleShowDetails = () => {
        const { error, errorInfo } = this.state;

        Alert.alert(
            'Error Details',
            `Error: ${error?.message}\n\nStack: ${error?.stack?.substring(0, 200)}...`,
            [
                { text: 'Close', style: 'cancel' },
                {
                    text: 'Copy',
                    onPress: () => {
                        // TODO: Implement clipboard copy
                        console.log('Copy error details');
                    }
                }
            ]
        );
    };

    private renderErrorScreen() {
        const { error, errorId, reportSent } = this.state;
        const { customErrorComponent } = this.props;

        // Use custom error component if provided
        if (customErrorComponent && error) {
            return customErrorComponent(error, this.handleRetry);
        }

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Error Icon and Title */}
                    <View style={styles.headerSection}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="warning" size={48} color="#EF4444" />
                        </View>
                        <Text style={styles.titleText}>
                            Oops! Something went wrong
                        </Text>
                        <Text style={styles.subtitleText}>
                            We're sorry for the inconvenience. The app encountered an unexpected error.
                        </Text>
                    </View>

                    {/* Error ID */}
                    {errorId && (
                        <View style={styles.errorIdContainer}>
                            <Text style={styles.errorIdLabel}>Error ID</Text>
                            <Text style={styles.errorIdValue}>{errorId}</Text>
                        </View>
                    )}

                    {/* Report Status */}
                    {reportSent && (
                        <View style={styles.reportStatusContainer}>
                            <View style={styles.reportStatusContent}>
                                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                                <Text style={styles.reportStatusText}>
                                    Error report sent successfully
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={this.handleRetry}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="refresh" size={20} color="white" />
                                <Text style={styles.primaryButtonText}>
                                    Try Again
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={this.handleGoHome}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="home" size={20} color="#374151" />
                                <Text style={styles.secondaryButtonText}>
                                    Go to Home
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.reportButton}
                            onPress={this.handleReportProblem}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="mail" size={20} color="#DC2626" />
                                <Text style={styles.reportButtonText}>
                                    Report Problem
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Additional Actions */}
                    <View style={styles.additionalActionsContainer}>
                        {this.props.showErrorDetails && (
                            <TouchableOpacity
                                onPress={this.handleShowDetails}
                                style={styles.linkButton}
                            >
                                <Text style={styles.linkText}>View Details</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://help.walmart.com')}
                            style={styles.linkButton}
                        >
                            <Text style={styles.linkText}>Help Center</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Troubleshooting Tips */}
                    <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>Troubleshooting Tips:</Text>
                        <Text style={styles.tipsText}>
                            • Make sure you have a stable internet connection{'\n'}
                            • Try closing and reopening the app{'\n'}
                            • Check if there's an app update available{'\n'}
                            • Restart your device if the problem persists
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    render() {
        if (this.state.hasError) {
            // Use fallback component if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return this.renderErrorScreen();
        }

        return this.props.children;
    }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
    const handleError = (error: Error, errorInfo?: string) => {
        console.error('Manual error report:', error, errorInfo);

        // You can integrate this with your error reporting service
        // For example, send to Crashlytics or Sentry
    };

    return { handleError };
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}

// Utility function to clear stored offline errors
export async function clearOfflineErrors() {
    try {
        await AsyncStorage.removeItem('offline_errors');
    } catch (error) {
        console.error('Failed to clear offline errors:', error);
    }
}

// Utility function to get stored offline errors
export async function getOfflineErrors() {
    try {
        const errors = await AsyncStorage.getItem('offline_errors');
        return errors ? JSON.parse(errors) : [];
    } catch (error) {
        console.error('Failed to get offline errors:', error);
        return [];
    }
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 32,
    },

    // Header Section
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 96,
        height: 96,
        backgroundColor: '#FEF2F2',
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#FECACA',
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
        lineHeight: 32,
    },
    subtitleText: {
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        fontSize: 16,
        paddingHorizontal: 16,
    },

    // Error ID Section
    errorIdContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    errorIdLabel: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    errorIdValue: {
        color: '#111827',
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: '600',
    },

    // Report Status Section
    reportStatusContainer: {
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    reportStatusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportStatusText: {
        color: '#065F46',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 15,
    },

    // Action Buttons
    actionButtonsContainer: {
        marginBottom: 32,
        gap: 12,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#0071CE',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 18,
        marginLeft: 8,
    },
    reportButton: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    reportButtonText: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 18,
        marginLeft: 8,
    },

    // Additional Actions
    additionalActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 24,
    },
    linkButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    linkText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },

    // Troubleshooting Tips
    tipsContainer: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    tipsTitle: {
        color: '#1E40AF',
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 16,
    },
    tipsText: {
        color: '#1E40AF',
        fontSize: 14,
        lineHeight: 20,
    },
});