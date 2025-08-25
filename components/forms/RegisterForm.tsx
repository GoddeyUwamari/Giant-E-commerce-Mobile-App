import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Animated,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { debounce } from 'lodash';

// Types
interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    dateOfBirth: string;
    agreeToTerms: boolean;
    subscribeToMarketing: boolean;
}

interface RegisterFormProps {
    onSubmit: (data: RegisterFormData) => Promise<void>;
    onSignIn?: () => void;
    isLoading?: boolean;
    showSocialSignUp?: boolean;
    showPhoneField?: boolean;
    showDateOfBirth?: boolean;
    showMarketingConsent?: boolean;
    title?: string;
    subtitle?: string;
    enableEmailVerification?: boolean;
    enablePhoneVerification?: boolean;
    enablePasswordHints?: boolean;
}

interface EmailSuggestion {
    domain: string;
    display: string;
}

// Constants
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WALMART_COLORS = {
    primary: '#0071CE',
    primaryDark: '#005AA3',
    secondary: '#FFC220',
    success: '#00A652',
    error: '#E53E3E',
    warning: '#FF8C00',
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    // Social colors
    google: '#EA4335',
    facebook: '#1877F2',
    apple: '#000000',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

const TYPOGRAPHY = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    xxxxl: 32,
};

const EMAIL_DOMAINS: EmailSuggestion[] = [
    { domain: 'gmail.com', display: 'Gmail' },
    { domain: 'yahoo.com', display: 'Yahoo' },
    { domain: 'outlook.com', display: 'Outlook' },
    { domain: 'hotmail.com', display: 'Hotmail' },
    { domain: 'icloud.com', display: 'iCloud' },
];

const PASSWORD_REQUIREMENTS = [
    { key: 'length', text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { key: 'lowercase', text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { key: 'uppercase', text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { key: 'number', text: 'One number', test: (pwd: string) => /\d/.test(pwd) },
    { key: 'special', text: 'One special character', test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
];

// Utility Functions
const validateEmail = (value: string): string | boolean => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
};

const validatePassword = (value: string): string | boolean => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return true;
};

const validatePhone = (value: string, showPhoneField: boolean): string | boolean => {
    if (!showPhoneField || !value) return true;
    const phoneRegex = /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]*([0-9]{3})[-.\s]*([0-9]{4})$/;
    return phoneRegex.test(value) || 'Please enter a valid phone number';
};

const validateAge = (value: string, showDateOfBirth: boolean): string | boolean => {
    if (!showDateOfBirth || !value) return true;

    // Parse MM/DD/YYYY format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(dateRegex);

    if (!match) return 'Please enter date in MM/DD/YYYY format';

    const [, month, day, year] = match;
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();

    // Check if date is valid
    if (birthDate.getMonth() !== parseInt(month) - 1) {
        return 'Please enter a valid date';
    }

    // Check if date is in the future
    if (birthDate > today) {
        return 'Birth date cannot be in the future';
    }

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 13 || 'You must be at least 13 years old to create an account';
};

const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
};

const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const match = digits.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
};

const formatDateOfBirth = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 6) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length >= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length >= 2) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
};

// Enhanced Password Strength Component
const PasswordStrengthIndicator = React.memo(({
                                                  password,
                                                  enableHints = false
                                              }: {
    password: string;
    enableHints?: boolean;
}) => {
    const strength = useMemo(() => calculatePasswordStrength(password), [password]);

    const getStrengthInfo = (score: number) => {
        switch (score) {
            case 0:
            case 1:
                return { text: 'Very Weak', color: WALMART_COLORS.error };
            case 2:
                return { text: 'Weak', color: WALMART_COLORS.warning };
            case 3:
                return { text: 'Fair', color: WALMART_COLORS.secondary };
            case 4:
                return { text: 'Good', color: WALMART_COLORS.primary };
            case 5:
                return { text: 'Strong', color: WALMART_COLORS.success };
            default:
                return { text: '', color: WALMART_COLORS.gray300 };
        }
    };

    const getSegmentColor = (index: number, score: number) => {
        if (index >= score) return WALMART_COLORS.gray200;
        if (score <= 2) return WALMART_COLORS.error;
        if (score <= 3) return WALMART_COLORS.secondary;
        if (score <= 4) return WALMART_COLORS.primary;
        return WALMART_COLORS.success;
    };

    if (!password) return null;

    const strengthInfo = getStrengthInfo(strength);

    return (
        <View style={styles.passwordStrengthContainer}>
            <View style={styles.passwordStrengthHeader}>
                <Text style={styles.passwordStrengthLabel}>Password strength:</Text>
                <Text style={[styles.passwordStrengthText, { color: strengthInfo.color }]}>
                    {strengthInfo.text}
                </Text>
            </View>
            <View style={styles.passwordStrengthBar}>
                {[0, 1, 2, 3, 4].map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.passwordStrengthSegment,
                            { backgroundColor: getSegmentColor(index, strength) }
                        ]}
                    />
                ))}
            </View>

            {enableHints && (
                <View style={styles.passwordRequirements}>
                    {PASSWORD_REQUIREMENTS.map((req) => (
                        <View key={req.key} style={styles.passwordRequirement}>
                            <Ionicons
                                name={req.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                                size={16}
                                color={req.test(password) ? WALMART_COLORS.success : WALMART_COLORS.gray400}
                            />
                            <Text style={[
                                styles.passwordRequirementText,
                                { color: req.test(password) ? WALMART_COLORS.success : WALMART_COLORS.gray600 }
                            ]}>
                                {req.text}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
});

// Email Suggestions Component
const EmailSuggestions = React.memo(({
                                         email,
                                         onSelect,
                                         visible
                                     }: {
    email: string;
    onSelect: (email: string) => void;
    visible: boolean;
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (!visible || !email.includes('@')) {
            setSuggestions([]);
            return;
        }

        const [username, currentDomain] = email.split('@');
        if (!currentDomain || username.length < 2) {
            setSuggestions([]);
            return;
        }

        const matchingDomains = EMAIL_DOMAINS
            .filter(({ domain }) =>
                domain.toLowerCase().includes(currentDomain.toLowerCase()) &&
                domain !== currentDomain
            )
            .slice(0, 3)
            .map(({ domain }) => `${username}@${domain}`);

        setSuggestions(matchingDomains);
    }, [email, visible]);

    if (!visible || suggestions.length === 0) return null;

    return (
        <View style={styles.emailSuggestions}>
            {suggestions.map((suggestion) => (
                <TouchableOpacity
                    key={suggestion}
                    style={styles.emailSuggestion}
                    onPress={() => onSelect(suggestion)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="at" size={16} color={WALMART_COLORS.gray400} />
                    <Text style={styles.emailSuggestionText}>{suggestion}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
});

// Social Sign Up Buttons Component
const SocialSignUpButtons = React.memo(({
                                            showSocialSignUp,
                                            isAppleSignInAvailable,
                                            onAppleSignUp,
                                            onGoogleSignUp,
                                            onFacebookSignUp,
                                            isLoading,
                                        }: {
    showSocialSignUp: boolean;
    isAppleSignInAvailable: boolean;
    onAppleSignUp: () => void;
    onGoogleSignUp: () => void;
    onFacebookSignUp: () => void;
    isLoading: boolean;
}) => {
    if (!showSocialSignUp) return null;

    return (
        <View style={styles.socialSignUpContainer}>
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or sign up with</Text>
                <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
                {isAppleSignInAvailable && (
                    <TouchableOpacity
                        style={[styles.socialButton, styles.appleButton]}
                        onPress={onAppleSignUp}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="logo-apple" size={20} color={WALMART_COLORS.white} />
                        <Text style={styles.appleButtonText}>Sign up with Apple</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={onGoogleSignUp}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Ionicons name="logo-google" size={20} color={WALMART_COLORS.google} />
                    <Text style={styles.googleButtonText}>Sign up with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.facebookButton]}
                    onPress={onFacebookSignUp}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Ionicons name="logo-facebook" size={20} color={WALMART_COLORS.white} />
                    <Text style={styles.facebookButtonText}>Sign up with Facebook</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

// Main Component
export default function RegisterForm({
                                         onSubmit,
                                         onSignIn,
                                         isLoading = false,
                                         showSocialSignUp = true,
                                         showPhoneField = true,
                                         showDateOfBirth = false,
                                         showMarketingConsent = true,
                                         title = 'Create Account',
                                         subtitle = 'Join Walmart to start shopping',
                                         enableEmailVerification = true,
                                         enablePhoneVerification = true,
                                         enablePasswordHints = true,
                                     }: RegisterFormProps): JSX.Element {
    // State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
    const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [emailVerificationStatus, setEmailVerificationStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'exists'>('idle');

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Form
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid, touchedFields },
        getValues,
        trigger,
    } = useForm<RegisterFormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            dateOfBirth: '',
            agreeToTerms: false,
            subscribeToMarketing: false,
        },
        mode: 'onChange',
    });

    // Watched values
    const password = watch('password');
    const email = watch('email');
    const agreeToTerms = watch('agreeToTerms');

    // Keyboard handling
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            keyboardWillShow?.remove();
            keyboardWillHide?.remove();
        };
    }, []);

    // Initial animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        checkAppleSignInAvailability();
    }, []);

    // Email verification with debounce
    const debouncedEmailCheck = useCallback(
        debounce(async (emailValue: string) => {
            if (!enableEmailVerification || !emailValue || !validateEmail(emailValue)) {
                setEmailVerificationStatus('idle');
                return;
            }

            setEmailVerificationStatus('checking');

            try {
                // Mock email verification - replace with actual API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Simulate different outcomes
                const existingEmails = ['test@example.com', 'user@gmail.com'];
                if (existingEmails.includes(emailValue.toLowerCase())) {
                    setEmailVerificationStatus('exists');
                } else {
                    setEmailVerificationStatus('valid');
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setEmailVerificationStatus('invalid');
            }
        }, 1000),
        [enableEmailVerification]
    );

    useEffect(() => {
        if (email && touchedFields.email) {
            debouncedEmailCheck(email);
        }
    }, [email, touchedFields.email, debouncedEmailCheck]);

    // Callbacks
    const checkAppleSignInAvailability = useCallback(async () => {
        if (Platform.OS === 'ios') {
            try {
                const isAvailable = await AppleAuthentication.isAvailableAsync();
                setIsAppleSignInAvailable(isAvailable);
            } catch (error) {
                console.error('Error checking Apple Sign In availability:', error);
            }
        }
    }, []);

    const validateConfirmPassword = useCallback((value: string) => {
        const passwordValue = getValues('password');
        return value === passwordValue || 'Passwords do not match';
    }, [getValues]);

    const handleAppleSignUp = useCallback(async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            console.log('Apple Sign Up credential:', credential);
            Alert.alert('Success', 'Apple Sign Up successful!');
        } catch (error: any) {
            if (error.code === 'ERR_CANCELED') {
                return;
            }
            console.error('Apple Sign Up error:', error);
            Alert.alert(
                'Sign Up Error',
                'Apple Sign Up failed. Please try again or use email registration.',
                [{ text: 'OK' }]
            );
        }
    }, []);

    const handleGoogleSignUp = useCallback(async () => {
        Alert.alert('Coming Soon', 'Google Sign Up will be available in a future update.');
    }, []);

    const handleFacebookSignUp = useCallback(async () => {
        Alert.alert('Coming Soon', 'Facebook Sign Up will be available in a future update.');
    }, []);

    const onFormSubmit = useCallback(async (data: RegisterFormData) => {
        if (!data.agreeToTerms) {
            Alert.alert('Terms Required', 'Please agree to the Terms of Service to continue.');
            return;
        }

        if (emailVerificationStatus === 'exists') {
            Alert.alert(
                'Email Already Exists',
                'An account with this email already exists. Please sign in instead.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    onSignIn ? { text: 'Sign In', onPress: onSignIn } : null,
                ].filter(Boolean) as any
            );
            return;
        }

        try {
            Keyboard.dismiss();
            await onSubmit(data);
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert(
                'Registration Error',
                'There was an error creating your account. Please try again.',
                [{ text: 'OK' }]
            );
        }
    }, [onSubmit, emailVerificationStatus, onSignIn]);

    const handleEmailSelect = useCallback((selectedEmail: string) => {
        setValue('email', selectedEmail, { shouldValidate: true });
        setShowEmailSuggestions(false);
    }, [setValue]);

    const handlePhoneChange = useCallback((value: string) => {
        const formatted = formatPhoneNumber(value);
        return formatted;
    }, []);

    const handleDateChange = useCallback((value: string) => {
        const formatted = formatDateOfBirth(value);
        return formatted;
    }, []);

    const renderEmailVerificationStatus = () => {
        if (!enableEmailVerification || !touchedFields.email) return null;

        switch (emailVerificationStatus) {
            case 'checking':
                return (
                    <View style={styles.verificationStatus}>
                        <ActivityIndicator size="small" color={WALMART_COLORS.primary} />
                        <Text style={styles.verificationText}>Checking email...</Text>
                    </View>
                );
            case 'valid':
                return (
                    <View style={styles.verificationStatus}>
                        <Ionicons name="checkmark-circle" size={16} color={WALMART_COLORS.success} />
                        <Text style={[styles.verificationText, { color: WALMART_COLORS.success }]}>
                            Email is available
                        </Text>
                    </View>
                );
            case 'exists':
                return (
                    <View style={styles.verificationStatus}>
                        <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.warning} />
                        <Text style={[styles.verificationText, { color: WALMART_COLORS.warning }]}>
                            Email already exists
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(keyboardHeight / 4, 20) }
                ]}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Ionicons
                                name="storefront"
                                size={40}
                                color={WALMART_COLORS.primary}
                            />
                        </View>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <Text style={styles.headerSubtitle}>{subtitle}</Text>
                    </View>

                    {/* Name Fields */}
                    <View style={styles.rowContainer}>
                        <View style={styles.halfField}>
                            <Text style={styles.fieldLabel}>
                                First Name <Text style={styles.requiredText}>*</Text>
                            </Text>
                            <Controller
                                control={control}
                                name="firstName"
                                rules={{
                                    required: 'First name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'First name must be at least 2 characters'
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: 'First name must be less than 50 characters'
                                    }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            errors.firstName && styles.textInputError,
                                        ]}
                                        placeholder="John"
                                        placeholderTextColor={WALMART_COLORS.gray400}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="words"
                                        autoComplete="given-name"
                                        maxLength={50}
                                    />
                                )}
                            />
                            {errors.firstName && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                    <Text style={styles.errorText}>{errors.firstName.message}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.fieldLabel}>
                                Last Name <Text style={styles.requiredText}>*</Text>
                            </Text>
                            <Controller
                                control={control}
                                name="lastName"
                                rules={{
                                    required: 'Last name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Last name must be at least 2 characters'
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: 'Last name must be less than 50 characters'
                                    }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            errors.lastName && styles.textInputError,
                                        ]}
                                        placeholder="Doe"
                                        placeholderTextColor={WALMART_COLORS.gray400}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="words"
                                        autoComplete="family-name"
                                        maxLength={50}
                                    />
                                )}
                            />
                            {errors.lastName && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                    <Text style={styles.errorText}>{errors.lastName.message}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Email Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            Email Address <Text style={styles.requiredText}>*</Text>
                        </Text>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: 'Email is required',
                                validate: validateEmail,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View>
                                    <View style={styles.inputContainer}>
                                        <Ionicons
                                            name="mail-outline"
                                            size={20}
                                            color={WALMART_COLORS.gray400}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                styles.textInputWithIcon,
                                                errors.email && styles.textInputError,
                                                emailVerificationStatus === 'valid' && styles.textInputSuccess,
                                                emailVerificationStatus === 'exists' && styles.textInputWarning,
                                            ]}
                                            placeholder="john.doe@example.com"
                                            placeholderTextColor={WALMART_COLORS.gray400}
                                            value={value}
                                            onChangeText={(text) => {
                                                onChange(text);
                                                setShowEmailSuggestions(text.includes('@'));
                                            }}
                                            onBlur={() => {
                                                onBlur();
                                                setShowEmailSuggestions(false);
                                            }}
                                            onFocus={() => {
                                                if (value.includes('@')) {
                                                    setShowEmailSuggestions(true);
                                                }
                                            }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect={false}
                                        />
                                        {emailVerificationStatus === 'checking' && (
                                            <ActivityIndicator
                                                size="small"
                                                color={WALMART_COLORS.primary}
                                                style={styles.inputStatusIcon}
                                            />
                                        )}
                                        {emailVerificationStatus === 'valid' && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={20}
                                                color={WALMART_COLORS.success}
                                                style={styles.inputStatusIcon}
                                            />
                                        )}
                                        {emailVerificationStatus === 'exists' && (
                                            <Ionicons
                                                name="alert-circle"
                                                size={20}
                                                color={WALMART_COLORS.warning}
                                                style={styles.inputStatusIcon}
                                            />
                                        )}
                                    </View>
                                    <EmailSuggestions
                                        email={value}
                                        onSelect={handleEmailSelect}
                                        visible={showEmailSuggestions}
                                    />
                                </View>
                            )}
                        />
                        {renderEmailVerificationStatus()}
                        {errors.email && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                <Text style={styles.errorText}>{errors.email.message}</Text>
                            </View>
                        )}
                    </View>

                    {/* Phone Field */}
                    {showPhoneField && (
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Phone Number</Text>
                            <Controller
                                control={control}
                                name="phone"
                                rules={{
                                    validate: (value) => validatePhone(value, showPhoneField),
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <Ionicons
                                            name="call-outline"
                                            size={20}
                                            color={WALMART_COLORS.gray400}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                styles.textInputWithIcon,
                                                errors.phone && styles.textInputError,
                                            ]}
                                            placeholder="+1 (555) 123-4567"
                                            placeholderTextColor={WALMART_COLORS.gray400}
                                            value={value}
                                            onChangeText={(text) => {
                                                const formatted = handlePhoneChange(text);
                                                onChange(formatted);
                                            }}
                                            onBlur={onBlur}
                                            keyboardType="phone-pad"
                                            autoComplete="tel"
                                            maxLength={14}
                                        />
                                    </View>
                                )}
                            />
                            {errors.phone && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                    <Text style={styles.errorText}>{errors.phone.message}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Date of Birth */}
                    {showDateOfBirth && (
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                Date of Birth <Text style={styles.requiredText}>*</Text>
                            </Text>
                            <Controller
                                control={control}
                                name="dateOfBirth"
                                rules={{
                                    required: 'Date of birth is required',
                                    validate: (value) => validateAge(value, showDateOfBirth),
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={20}
                                            color={WALMART_COLORS.gray400}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                styles.textInputWithIcon,
                                                errors.dateOfBirth && styles.textInputError,
                                            ]}
                                            placeholder="MM/DD/YYYY"
                                            placeholderTextColor={WALMART_COLORS.gray400}
                                            value={value}
                                            onChangeText={(text) => {
                                                const formatted = handleDateChange(text);
                                                onChange(formatted);
                                            }}
                                            onBlur={onBlur}
                                            keyboardType="numeric"
                                            maxLength={10}
                                        />
                                    </View>
                                )}
                            />
                            {errors.dateOfBirth && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                    <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Password Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            Password <Text style={styles.requiredText}>*</Text>
                        </Text>
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: 'Password is required',
                                validate: validatePassword,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color={WALMART_COLORS.gray400}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            styles.textInputWithIcon,
                                            styles.passwordInput,
                                            errors.password && styles.textInputError,
                                        ]}
                                        placeholder="Create a strong password"
                                        placeholderTextColor={WALMART_COLORS.gray400}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoComplete="new-password"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() => setShowPassword(!showPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={WALMART_COLORS.gray400}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        <PasswordStrengthIndicator
                            password={password}
                            enableHints={enablePasswordHints}
                        />
                        {errors.password && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                <Text style={styles.errorText}>{errors.password.message}</Text>
                            </View>
                        )}
                    </View>

                    {/* Confirm Password Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            Confirm Password <Text style={styles.requiredText}>*</Text>
                        </Text>
                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: 'Please confirm your password',
                                validate: validateConfirmPassword,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color={WALMART_COLORS.gray400}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            styles.textInputWithIcon,
                                            styles.passwordInput,
                                            errors.confirmPassword && styles.textInputError,
                                            value && value === password && value.length > 0 && styles.textInputSuccess,
                                        ]}
                                        placeholder="Confirm your password"
                                        placeholderTextColor={WALMART_COLORS.gray400}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        autoComplete="new-password"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={WALMART_COLORS.gray400}
                                        />
                                    </TouchableOpacity>
                                    {value && value === password && value.length > 0 && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color={WALMART_COLORS.success}
                                            style={[styles.inputStatusIcon, { right: 48 }]}
                                        />
                                    )}
                                </View>
                            )}
                        />
                        {errors.confirmPassword && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                            </View>
                        )}
                    </View>

                    {/* Terms and Conditions */}
                    <View style={styles.checkboxContainer}>
                        <Controller
                            control={control}
                            name="agreeToTerms"
                            rules={{ required: 'You must agree to the Terms of Service' }}
                            render={({ field: { onChange, value } }) => (
                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => onChange(!value)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            value && styles.checkboxSelected,
                                        ]}
                                    >
                                        {value && (
                                            <Ionicons
                                                name="checkmark"
                                                size={12}
                                                color={WALMART_COLORS.white}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.checkboxTextContainer}>
                                        <Text style={styles.checkboxLabel}>
                                            I agree to the{' '}
                                            <Text style={styles.linkText}>Terms of Service</Text>
                                            {' '}and{' '}
                                            <Text style={styles.linkText}>Privacy Policy</Text>
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                        {errors.agreeToTerms && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color={WALMART_COLORS.error} />
                                <Text style={styles.errorText}>{errors.agreeToTerms.message}</Text>
                            </View>
                        )}
                    </View>

                    {/* Marketing Consent */}
                    {showMarketingConsent && (
                        <View style={styles.checkboxContainer}>
                            <Controller
                                control={control}
                                name="subscribeToMarketing"
                                render={({ field: { onChange, value } }) => (
                                    <TouchableOpacity
                                        style={styles.checkboxRow}
                                        onPress={() => onChange(!value)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.checkbox,
                                                value && styles.checkboxSelected,
                                            ]}
                                        >
                                            {value && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={12}
                                                    color={WALMART_COLORS.white}
                                                />
                                            )}
                                        </View>
                                        <Text style={[styles.checkboxLabel, styles.flexOne]}>
                                            Send me promotional emails about Walmart products, services, and offers
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            isValid && agreeToTerms && !isLoading && emailVerificationStatus !== 'exists'
                                ? styles.submitButtonEnabled
                                : styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit(onFormSubmit)}
                        disabled={!isValid || !agreeToTerms || isLoading || emailVerificationStatus === 'exists'}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={WALMART_COLORS.white} />
                                <Text style={styles.loadingText}>Creating account...</Text>
                            </View>
                        ) : (
                            <Text style={styles.submitButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Social Sign Up */}
                    <SocialSignUpButtons
                        showSocialSignUp={showSocialSignUp}
                        isAppleSignInAvailable={isAppleSignInAvailable}
                        onAppleSignUp={handleAppleSignUp}
                        onGoogleSignUp={handleGoogleSignUp}
                        onFacebookSignUp={handleFacebookSignUp}
                        isLoading={isLoading}
                    />

                    {/* Sign In Link */}
                    {onSignIn && (
                        <View style={styles.signInLinkContainer}>
                            <Text style={styles.signInText}>Already have an account? </Text>
                            <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
                                <Text style={styles.signInLink}>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Security Notice */}
                    <View style={styles.securityNotice}>
                        <Ionicons
                            name="shield-checkmark"
                            size={20}
                            color={WALMART_COLORS.primary}
                        />
                        <Text style={styles.securityText}>
                            Your information is encrypted and secure
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Enhanced Styles
const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: WALMART_COLORS.white,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: SPACING.xxl,
        paddingBottom: SPACING.xxxl,
    },

    // Header Styles
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
        paddingVertical: SPACING.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: WALMART_COLORS.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.xxxxl,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    headerSubtitle: {
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.lg,
        textAlign: 'center',
        maxWidth: screenWidth * 0.8,
        lineHeight: 24,
    },

    // Form Field Styles
    fieldContainer: {
        marginBottom: SPACING.xl,
    },
    fieldLabel: {
        color: WALMART_COLORS.gray900,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.md,
        marginBottom: SPACING.sm,
    },
    requiredText: {
        color: WALMART_COLORS.error,
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: SPACING.md,
        zIndex: 1,
    },
    inputStatusIcon: {
        position: 'absolute',
        right: SPACING.md,
        zIndex: 1,
    },
    textInput: {
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray300,
        borderRadius: 12,
        paddingHorizontal: SPACING.lg,
        paddingVertical: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray900,
        backgroundColor: WALMART_COLORS.white,
        minHeight: 50,
        flex: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    textInputWithIcon: {
        paddingLeft: 48,
    },
    passwordInput: {
        paddingRight: 48,
    },
    textInputError: {
        borderColor: WALMART_COLORS.error,
        borderWidth: 2,
    },
    textInputSuccess: {
        borderColor: WALMART_COLORS.success,
        borderWidth: 2,
    },
    textInputWarning: {
        borderColor: WALMART_COLORS.warning,
        borderWidth: 2,
    },

    // Error States
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    errorText: {
        color: WALMART_COLORS.error,
        fontSize: TYPOGRAPHY.xs,
        marginLeft: SPACING.xs,
        fontWeight: '500',
        flex: 1,
    },

    // Verification Status
    verificationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    verificationText: {
        fontSize: TYPOGRAPHY.xs,
        marginLeft: SPACING.xs,
        fontWeight: '500',
        color: WALMART_COLORS.gray600,
    },

    // Email Suggestions
    emailSuggestions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: WALMART_COLORS.white,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray300,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emailSuggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: WALMART_COLORS.gray100,
    },
    emailSuggestionText: {
        marginLeft: SPACING.sm,
        color: WALMART_COLORS.gray700,
        fontSize: TYPOGRAPHY.sm,
    },

    // Password Toggle
    passwordToggle: {
        position: 'absolute',
        right: SPACING.md,
        padding: SPACING.xs,
    },

    // Password Strength Styles
    passwordStrengthContainer: {
        marginTop: SPACING.sm,
    },
    passwordStrengthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    passwordStrengthLabel: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray600,
    },
    passwordStrengthText: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },
    passwordStrengthBar: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: SPACING.sm,
    },
    passwordStrengthSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },

    // Password Requirements
    passwordRequirements: {
        gap: SPACING.xs,
    },
    passwordRequirement: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    passwordRequirementText: {
        fontSize: TYPOGRAPHY.xs,
        flex: 1,
    },

    // Layout Styles
    rowContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    halfField: {
        flex: 1,
    },

    // Checkbox Styles
    checkboxContainer: {
        marginBottom: SPACING.lg,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: SPACING.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: WALMART_COLORS.gray300,
        borderRadius: 4,
        marginRight: SPACING.md,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: WALMART_COLORS.white,
    },
    checkboxSelected: {
        backgroundColor: WALMART_COLORS.primary,
        borderColor: WALMART_COLORS.primary,
    },
    checkboxTextContainer: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray700,
        lineHeight: 20,
    },
    flexOne: {
        flex: 1,
    },
    linkText: {
        color: WALMART_COLORS.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // Submit Button Styles
    submitButton: {
        borderRadius: 12,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    submitButtonEnabled: {
        backgroundColor: WALMART_COLORS.primary,
    },
    submitButtonDisabled: {
        backgroundColor: WALMART_COLORS.gray300,
    },
    submitButtonText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },

    // Social Sign Up Styles
    socialSignUpContainer: {
        marginBottom: SPACING.xl,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: WALMART_COLORS.gray300,
    },
    dividerText: {
        paddingHorizontal: SPACING.lg,
        color: WALMART_COLORS.gray500,
        fontSize: TYPOGRAPHY.sm,
    },
    socialButtonsContainer: {
        gap: SPACING.md,
    },
    socialButton: {
        borderRadius: 12,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    appleButton: {
        backgroundColor: WALMART_COLORS.apple,
    },
    appleButtonText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },
    googleButton: {
        backgroundColor: WALMART_COLORS.white,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray300,
    },
    googleButtonText: {
        color: WALMART_COLORS.gray700,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },
    facebookButton: {
        backgroundColor: WALMART_COLORS.facebook,
    },
    facebookButtonText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },

    // Sign In Link Styles
    signInLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    signInText: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray600,
    },
    signInLink: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // Security Notice Styles
    securityNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 8,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray200,
    },
    securityText: {
        fontSize: TYPOGRAPHY.sm,
        color: WALMART_COLORS.gray600,
        marginLeft: SPACING.sm,
        fontWeight: '500',
    },
});