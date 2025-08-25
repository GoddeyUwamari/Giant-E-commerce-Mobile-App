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
    const { login, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

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

    const handleGoogleSignIn = () => {
        Alert.alert('Google Sign In', 'Google authentication coming soon!');
    };

    const handleAppleSignIn = () => {
        Alert.alert('Apple Sign In', 'Apple authentication coming soon!');
    };

    const handleBackPress = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                    activeOpacity={0.7}
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
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowPassword(!showPassword)}
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
                                <TouchableOpacity style={styles.forgotPasswordButton}>
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
                                (isValid && !isLoading) ? styles.signInButtonActive : styles.signInButtonDisabled
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid || isLoading}
                        >
                            <Text style={[
                                styles.signInButtonText,
                                (!isValid || isLoading) && styles.signInButtonTextDisabled
                            ]}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login Buttons */}
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleGoogleSignIn}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-google" size={20} color={COLORS.googleBlue} />
                            <Text style={styles.socialButtonText}>
                                Continue with Google
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleAppleSignIn}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-apple" size={20} color={COLORS.appleBlack} />
                            <Text style={styles.socialButtonText}>
                                Continue with Apple
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>New to Walmart? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
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
    socialButtonText: {
        marginLeft: 12,
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
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