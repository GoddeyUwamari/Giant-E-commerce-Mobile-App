import React, { useState, useEffect } from 'react';
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
    ActivityIndicator,
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
    error: '#D32F2F',
    borderColor: '#E0E0E0',
    inputBackground: '#F8F9FA',
    disabledBackground: '#F5F5F5',
    disabledText: '#BDBDBD',
    dividerColor: '#E5E7EB',
    googleBlue: '#4285F4',
    appleBlack: '#000000',
};

import { useAuth } from '../../hooks/useAuth';

// Types
interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginScreen(): JSX.Element {
    const {
        login,
        signInWithGoogle,
        signInWithApple,
        isGoogleSignInAvailable,
        isAppleSignInAvailable,
        isLoading
    } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState({
        google: false,
        apple: false,
    });
    const [socialAvailability, setSocialAvailability] = useState({
        google: false,
        apple: false,
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormData>({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Check social sign-in availability on mount
    useEffect(() => {
        const checkAvailability = async () => {
            try {
                const [googleAvailable, appleAvailable] = await Promise.all([
                    isGoogleSignInAvailable(),
                    isAppleSignInAvailable(),
                ]);

                setSocialAvailability({
                    google: googleAvailable,
                    apple: appleAvailable,
                });
            } catch (error) {
                console.warn('Error checking social sign-in availability:', error);
            }
        };

        checkAvailability();
    }, [isGoogleSignInAvailable, isAppleSignInAvailable]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login({
                email: data.email,
                password: data.password,
                rememberMe: false,
            });
        } catch (error) {
            Alert.alert('Login Failed', error instanceof Error ? error.message : 'Please check your credentials and try again.');
        }
    };

    const handleGoogleSignIn = async () => {
        if (!socialAvailability.google) {
            Alert.alert('Google Sign-In', 'Google Sign-In is not available on this device.');
            return;
        }

        try {
            setSocialLoading(prev => ({ ...prev, google: true }));

            const result = await signInWithGoogle();

            if (!result.success) {
                if (result.cancelled) {
                    // User cancelled - no need to show error
                    return;
                }

                Alert.alert(
                    'Google Sign-In Failed',
                    result.error || 'Failed to sign in with Google. Please try again.'
                );
            }
            // Success case is handled by the auth hook (navigation)
        } catch (error) {
            console.error('Google sign-in error:', error);
            Alert.alert(
                'Google Sign-In Error',
                error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
            );
        } finally {
            setSocialLoading(prev => ({ ...prev, google: false }));
        }
    };

    const handleAppleSignIn = async () => {
        if (!socialAvailability.apple) {
            Alert.alert('Apple Sign-In', 'Apple Sign-In is not available on this device.');
            return;
        }

        try {
            setSocialLoading(prev => ({ ...prev, apple: true }));

            const result = await signInWithApple();

            if (!result.success) {
                if (result.cancelled) {
                    // User cancelled - no need to show error
                    return;
                }

                if (result.notSupported) {
                    Alert.alert('Apple Sign-In', 'Apple Sign-In is not supported on this device.');
                    return;
                }

                Alert.alert(
                    'Apple Sign-In Failed',
                    result.error || 'Failed to sign in with Apple. Please try again.'
                );
            }
            // Success case is handled by the auth hook (navigation)
        } catch (error) {
            console.error('Apple sign-in error:', error);
            Alert.alert(
                'Apple Sign-In Error',
                error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
            );
        } finally {
            setSocialLoading(prev => ({ ...prev, apple: false }));
        }
    };

    const handleBackPress = () => {
        router.back();
    };

    // Check if any loading state is active
    const isAnyLoading = isLoading || socialLoading.google || socialLoading.apple;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                    activeOpacity={0.7}
                    disabled={isAnyLoading}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={!isAnyLoading}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="star" size={32} color={COLORS.walmartBlue} />
                        </View>
                        <Text style={styles.welcomeTitle}>
                            Welcome to Walmart
                        </Text>
                        <Text style={styles.welcomeSubtitle}>
                            Sign in to your account for a personalized{'\n'}shopping experience
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
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
                                            editable={!isAnyLoading}
                                        />
                                        <View style={styles.inputIcon}>
                                            <Ionicons name="mail-outline" size={20} color={COLORS.mediumGray} />
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

                        {/* Password Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <Controller
                                control={control}
                                name="password"
                                rules={{
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                styles.passwordInput,
                                                errors.password && styles.textInputError
                                            ]}
                                            placeholder="Enter your password"
                                            placeholderTextColor={COLORS.mediumGray}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            editable={!isAnyLoading}
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowPassword(!showPassword)}
                                            disabled={isAnyLoading}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off' : 'eye'}
                                                size={20}
                                                color={COLORS.mediumGray}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                            {errors.password && (
                                <Text style={styles.errorText}>
                                    {errors.password.message}
                                </Text>
                            )}
                        </View>

                        {/* Forgot Password Link */}
                        <View style={styles.forgotPasswordContainer}>
                            <Link href="/(auth)/forgot-password" asChild>
                                <TouchableOpacity
                                    style={styles.forgotPasswordButton}
                                    disabled={isAnyLoading}
                                >
                                    <Text style={styles.forgotPasswordText}>
                                        Forgot Password?
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={[
                                styles.signInButton,
                                (isValid && !isAnyLoading) ? styles.signInButtonActive : styles.signInButtonDisabled
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid || isAnyLoading}
                        >
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color={COLORS.white} size="small" />
                                    <Text style={styles.signInButtonText}>Signing In...</Text>
                                </View>
                            ) : (
                                <Text style={[
                                    styles.signInButtonText,
                                    (!isValid || isAnyLoading) && styles.signInButtonTextDisabled
                                ]}>
                                    Sign In
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login Buttons */}
                        {/* Google Sign-In Button */}
                        {socialAvailability.google && (
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    socialLoading.google && styles.socialButtonLoading
                                ]}
                                onPress={handleGoogleSignIn}
                                activeOpacity={0.8}
                                disabled={isAnyLoading}
                            >
                                {socialLoading.google ? (
                                    <View style={styles.socialLoadingContainer}>
                                        <ActivityIndicator color={COLORS.googleBlue} size="small" />
                                        <Text style={styles.socialButtonText}>
                                            Signing in with Google...
                                        </Text>
                                    </View>
                                ) : (
                                    <>
                                        <Ionicons name="logo-google" size={20} color={COLORS.googleBlue} />
                                        <Text style={styles.socialButtonText}>
                                            Continue with Google
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Apple Sign-In Button */}
                        {socialAvailability.apple && (
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    socialLoading.apple && styles.socialButtonLoading
                                ]}
                                onPress={handleAppleSignIn}
                                activeOpacity={0.8}
                                disabled={isAnyLoading}
                            >
                                {socialLoading.apple ? (
                                    <View style={styles.socialLoadingContainer}>
                                        <ActivityIndicator color={COLORS.appleBlack} size="small" />
                                        <Text style={styles.socialButtonText}>
                                            Signing in with Apple...
                                        </Text>
                                    </View>
                                ) : (
                                    <>
                                        <Ionicons name="logo-apple" size={20} color={COLORS.appleBlack} />
                                        <Text style={styles.socialButtonText}>
                                            Continue with Apple
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>New to Walmart? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity disabled={isAnyLoading}>
                                <Text style={styles.footerLink}>Create Account</Text>
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

    // Header with Back Button
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
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
        justifyContent: 'center',
    },

    // Header
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.walmartYellow,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 22,
        paddingHorizontal: 20,
    },

    // Form Container
    formContainer: {
        paddingBottom: 32,
    },

    // Input Sections
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        color: COLORS.textPrimary,
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 16,
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
        fontSize: 16,
        color: COLORS.textPrimary,
        paddingRight: 48,
    },
    textInputError: {
        borderColor: COLORS.error,
        backgroundColor: '#FEF2F2',
    },
    passwordInput: {
        paddingRight: 52,
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    passwordToggle: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 2,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        marginTop: 6,
        marginLeft: 4,
    },

    // Forgot Password
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordButton: {
        padding: 4,
    },
    forgotPasswordText: {
        color: COLORS.walmartBlue,
        fontWeight: '500',
        fontSize: 16,
    },

    // Sign In Button
    signInButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    signInButtonActive: {
        backgroundColor: COLORS.walmartBlue,
    },
    signInButtonDisabled: {
        backgroundColor: COLORS.disabledBackground,
    },
    signInButtonText: {
        fontWeight: '600',
        fontSize: 18,
        color: COLORS.white,
    },
    signInButtonTextDisabled: {
        color: COLORS.disabledText,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    // Divider
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.dividerColor,
    },
    dividerText: {
        paddingHorizontal: 16,
        color: COLORS.textSecondary,
        fontSize: 14,
    },

    // Social Login Buttons
    socialButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    socialButtonLoading: {
        opacity: 0.7,
    },
    socialButtonText: {
        marginLeft: 12,
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    socialLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    // Footer
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 24,
        paddingTop: 16,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    footerLink: {
        color: COLORS.walmartBlue,
        fontWeight: '600',
        fontSize: 16,
    },
});