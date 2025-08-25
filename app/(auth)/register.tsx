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
    success: '#388E3C',
    borderColor: '#E0E0E0',
    inputBackground: '#F8F9FA',
    disabledBackground: '#F5F5F5',
    disabledText: '#BDBDBD',
    checkboxBackground: '#E3F2FD',
};

import { useAuth } from '../../hooks/useAuth';

// Types
interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export default function RegisterScreen(): JSX.Element {
    const { register, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<RegisterFormData>({
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false,
        },
    });

    const watchPassword = watch('password');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await register({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                acceptTerms: data.agreeToTerms,
                marketingOptIn: false,
            });
        } catch (error) {
            Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Please try again.');
        }
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
                            <Ionicons name="person-add" size={32} color={COLORS.walmartBlue} />
                        </View>
                        <Text style={styles.title}>
                            Join Walmart
                        </Text>
                        <Text style={styles.subtitle}>
                            Create your account for exclusive deals, fast delivery,{'\n'}and personalized shopping
                        </Text>
                    </View>

                    {/* Registration Form */}
                    <View style={styles.formContainer}>
                        {/* Name Row */}
                        <View style={styles.nameRow}>
                            {/* First Name */}
                            <View style={styles.nameField}>
                                <Text style={styles.inputLabel}>First Name</Text>
                                <Controller
                                    control={control}
                                    name="firstName"
                                    rules={{
                                        required: 'First name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Must be at least 2 characters',
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                styles.nameInput,
                                                errors.firstName && styles.textInputError
                                            ]}
                                            placeholder="First name"
                                            placeholderTextColor={COLORS.mediumGray}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            autoCapitalize="words"
                                        />
                                    )}
                                />
                                {errors.firstName && (
                                    <Text style={styles.errorTextSmall}>
                                        {errors.firstName.message}
                                    </Text>
                                )}
                            </View>

                            {/* Last Name */}
                            <View style={styles.nameField}>
                                <Text style={styles.inputLabel}>Last Name</Text>
                                <Controller
                                    control={control}
                                    name="lastName"
                                    rules={{
                                        required: 'Last name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Must be at least 2 characters',
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                styles.nameInput,
                                                errors.lastName && styles.textInputError
                                            ]}
                                            placeholder="Last name"
                                            placeholderTextColor={COLORS.mediumGray}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            autoCapitalize="words"
                                        />
                                    )}
                                />
                                {errors.lastName && (
                                    <Text style={styles.errorTextSmall}>
                                        {errors.lastName.message}
                                    </Text>
                                )}
                            </View>
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

                        {/* Phone Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <Controller
                                control={control}
                                name="phone"
                                rules={{
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^[\+]?[1-9][\d]{0,15}$/,
                                        message: 'Please enter a valid phone number',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                errors.phone && styles.textInputError
                                            ]}
                                            placeholder="(555) 123-4567"
                                            placeholderTextColor={COLORS.mediumGray}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="phone-pad"
                                        />
                                        <View style={styles.inputIcon}>
                                            <Ionicons name="call-outline" size={20} color={COLORS.mediumGray} />
                                        </View>
                                    </View>
                                )}
                            />
                            {errors.phone && (
                                <Text style={styles.errorText}>
                                    {errors.phone.message}
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
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Password must contain uppercase, lowercase, and number',
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
                                            placeholder="Create a strong password"
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

                        {/* Confirm Password Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Confirm Password</Text>
                            <Controller
                                control={control}
                                name="confirmPassword"
                                rules={{
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                        value === watchPassword || 'Passwords do not match',
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                styles.passwordInput,
                                                errors.confirmPassword && styles.textInputError
                                            ]}
                                            placeholder="Confirm your password"
                                            placeholderTextColor={COLORS.mediumGray}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            secureTextEntry={!showConfirmPassword}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? 'eye-off' : 'eye'}
                                                size={20}
                                                color={COLORS.mediumGray}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                            {errors.confirmPassword && (
                                <Text style={styles.errorText}>
                                    {errors.confirmPassword.message}
                                </Text>
                            )}
                        </View>

                        {/* Terms Agreement */}
                        <View style={styles.termsSection}>
                            <View style={styles.termsRow}>
                                <Controller
                                    control={control}
                                    name="agreeToTerms"
                                    rules={{
                                        required: 'You must agree to the terms and conditions',
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.checkbox,
                                                value ? styles.checkboxChecked : styles.checkboxUnchecked
                                            ]}
                                            onPress={() => onChange(!value)}
                                            activeOpacity={0.8}
                                        >
                                            {value && (
                                                <Ionicons name="checkmark" size={14} color={COLORS.white} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                                <View style={styles.termsTextContainer}>
                                    <Text style={styles.termsText}>
                                        I agree to Walmart's{' '}
                                        <TouchableOpacity onPress={() => Alert.alert('Terms of Service', 'Terms of Service content...')}>
                                            <Text style={styles.termsLink}>Terms of Service</Text>
                                        </TouchableOpacity>
                                        {' '}and{' '}
                                        <TouchableOpacity onPress={() => Alert.alert('Privacy Policy', 'Privacy Policy content...')}>
                                            <Text style={styles.termsLink}>Privacy Policy</Text>
                                        </TouchableOpacity>
                                    </Text>
                                    {errors.agreeToTerms && (
                                        <Text style={styles.errorText}>
                                            {errors.agreeToTerms.message}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                (isValid && !isLoading) ? styles.registerButtonActive : styles.registerButtonDisabled
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid || isLoading}
                        >
                            <Text style={[
                                styles.registerButtonText,
                                (!isValid || isLoading) && styles.registerButtonTextDisabled
                            ]}>
                                {isLoading ? 'Creating Your Account...' : 'Create Walmart Account'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Link */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
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
    },

    // Header
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.checkboxBackground,
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
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 22,
        paddingHorizontal: 20,
    },

    // Form Container
    formContainer: {
        paddingBottom: 16,
    },

    // Name Row
    nameRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    nameField: {
        flex: 1,
    },
    nameInput: {
        paddingHorizontal: 16,
        paddingRight: 16,
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
    errorTextSmall: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },

    // Terms Section
    termsSection: {
        marginBottom: 32,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 4,
        marginRight: 12,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxUnchecked: {
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    checkboxChecked: {
        borderColor: COLORS.walmartBlue,
        backgroundColor: COLORS.walmartBlue,
    },
    termsTextContainer: {
        flex: 1,
    },
    termsText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        lineHeight: 20,
    },
    termsLink: {
        color: COLORS.walmartBlue,
        textDecorationLine: 'underline',
        fontWeight: '500',
    },

    // Register Button
    registerButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    registerButtonActive: {
        backgroundColor: COLORS.walmartBlue,
    },
    registerButtonDisabled: {
        backgroundColor: COLORS.disabledBackground,
    },
    registerButtonText: {
        fontWeight: '600',
        fontSize: 18,
        color: COLORS.white,
    },
    registerButtonTextDisabled: {
        color: COLORS.disabledText,
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