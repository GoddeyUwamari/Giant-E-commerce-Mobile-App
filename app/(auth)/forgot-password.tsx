import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StyleSheet,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

// Walmart brand colors
const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    walmartYellow: '#FFC220',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    success: '#388E3C',
    successLight: '#E8F5E8',
    error: '#D32F2F',
    borderColor: '#E0E0E0',
    inputBackground: '#F8F9FA',
    lightBlue: '#E3F2FD',
    disabledBackground: '#F5F5F5',
    disabledText: '#BDBDBD',
};

// Types
interface ForgotPasswordFormData {
    email: string;
}

export default function ForgotPasswordScreen(): JSX.Element {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        mode: 'onChange',
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            // TODO: Implement actual password reset logic
            console.log('Password reset for:', data.email);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success state
            setEmailSent(true);
        } catch (error) {
            Alert.alert(
                'Error',
                'Unable to send reset email. Please try again later.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
        const email = getValues('email');
        if (email) {
            setIsLoading(true);
            try {
                // Simulate resend
                await new Promise(resolve => setTimeout(resolve, 1000));
                Alert.alert('Email Sent', 'Password reset email has been resent.');
            } catch (error) {
                Alert.alert('Error', 'Unable to resend email. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBackToLogin = () => {
        router.replace('/(auth)/login');
    };

    if (emailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.successContentContainer}
                >
                    <View style={styles.successContainer}>
                        {/* Success Icon */}
                        <View style={styles.successIconContainer}>
                            <Ionicons name="mail-outline" size={48} color={COLORS.success} />
                        </View>

                        {/* Success Message */}
                        <Text style={styles.successTitle}>
                            Check Your Email
                        </Text>
                        <View style={styles.successMessageContainer}>
                            <Text style={styles.successMessage}>
                                We've sent a password reset link to
                            </Text>
                            <Text style={styles.emailText}>
                                {getValues('email')}
                            </Text>
                        </View>

                        {/* Instructions */}
                        <View style={styles.instructionsContainer}>
                            <Text style={styles.instructionsText}>
                                <Text style={styles.instructionsTitle}>Next steps:</Text>{'\n'}
                                1. Check your email inbox{'\n'}
                                2. Click the reset link in the email{'\n'}
                                3. Create a new password{'\n'}
                                4. Sign in with your new password
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleBackToLogin}
                        >
                            <Text style={styles.primaryButtonText}>
                                Back to Sign In
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResendEmail}
                            disabled={isLoading}
                        >
                            <Text style={styles.resendButtonText}>
                                {isLoading ? 'Resending...' : 'Resend Email'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header with Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            Reset Password
                        </Text>
                    </View>

                    {/* Content */}
                    <View style={styles.mainContent}>
                        {/* Icon and Title */}
                        <View style={styles.iconSection}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="key-outline" size={40} color={COLORS.walmartBlue} />
                            </View>
                            <Text style={styles.title}>
                                Forgot Password?
                            </Text>
                            <Text style={styles.subtitle}>
                                No worries! Enter your email address and we'll send you a link to reset your password.
                            </Text>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <Controller
                                control={control}
                                name="email"
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Please enter a valid email address',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                errors.email && styles.textInputError
                                            ]}
                                            placeholder="Enter your email address"
                                            placeholderTextColor={COLORS.mediumGray}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            autoFocus
                                        />
                                        <View style={styles.inputIcon}>
                                            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                                        </View>
                                    </View>
                                )}
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>
                                    {errors.email.message}
                                </Text>
                            )}
                        </View>

                        {/* Send Reset Email Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (isValid && !isLoading) ? styles.submitButtonActive : styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid || isLoading}
                        >
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.submitButtonText}>
                                        Sending...
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    Send Reset Email
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Help Text */}
                        <View style={styles.helpContainer}>
                            <Text style={styles.helpText}>
                                <Text style={styles.helpTitle}>Can't find the email?</Text>{'\n'}
                                Check your spam folder or try a different email address.
                            </Text>
                        </View>
                    </View>

                    {/* Back to Login Link */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Remember your password? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    contentContainer: {
        flexGrow: 1,
    },
    successContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 32,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },

    // Main Content
    mainContent: {
        flex: 1,
        justifyContent: 'center',
    },

    // Icon Section
    iconSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.lightBlue,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: 16,
    },

    // Input Section
    inputSection: {
        marginBottom: 24,
    },
    inputLabel: {
        color: COLORS.darkGray,
        fontWeight: '500',
        marginBottom: 12,
        fontSize: 14,
    },
    inputContainer: {
        position: 'relative',
    },
    textInput: {
        backgroundColor: COLORS.inputBackground,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingRight: 48,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    textInputError: {
        borderColor: COLORS.error,
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        marginTop: 8,
    },

    // Submit Button
    submitButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    submitButtonActive: {
        backgroundColor: COLORS.walmartBlue,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.disabledBackground,
    },
    submitButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 18,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Help Section
    helpContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    helpText: {
        color: COLORS.darkGray,
        fontSize: 14,
        lineHeight: 20,
    },
    helpTitle: {
        fontWeight: '500',
    },

    // Footer
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 24,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    footerLink: {
        color: COLORS.walmartBlue,
        fontWeight: '500',
        fontSize: 14,
    },

    // Success State
    successContainer: {
        alignItems: 'center',
    },
    successIconContainer: {
        width: 96,
        height: 96,
        backgroundColor: COLORS.successLight,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
    },
    successMessageContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successMessage: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
    emailText: {
        fontWeight: '500',
        color: COLORS.textPrimary,
        fontSize: 16,
    },

    // Instructions
    instructionsContainer: {
        backgroundColor: COLORS.lightBlue,
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
        width: '100%',
    },
    instructionsText: {
        color: COLORS.walmartBlue,
        fontSize: 14,
        lineHeight: 20,
    },
    instructionsTitle: {
        fontWeight: '500',
    },

    // Success Buttons
    primaryButton: {
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        paddingVertical: 16,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 18,
    },
    resendButton: {
        paddingVertical: 12,
    },
    resendButtonText: {
        color: COLORS.walmartBlue,
        fontWeight: '500',
        fontSize: 14,
    },
});