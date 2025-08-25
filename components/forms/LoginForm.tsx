import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    StyleSheet,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as AppleAuthentication from 'expo-apple-authentication';
import { debounce } from 'lodash';

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface LoginFormProps {
    onSubmit: (data: LoginFormData) => Promise<void>;
    onForgotPassword?: () => void;
    onSignUp?: () => void;
    isLoading?: boolean;
    showSocialLogin?: boolean;
    showBiometric?: boolean;
    showRememberMe?: boolean;
    autoFillCredentials?: boolean;
    title?: string;
    subtitle?: string;
    enablePasswordStrength?: boolean;
    maxLoginAttempts?: number;
}

interface LoginAttempt {
    timestamp: number;
    email: string;
}

export default function LoginForm({
                                      onSubmit,
                                      onForgotPassword,
                                      onSignUp,
                                      isLoading = false,
                                      showSocialLogin = true,
                                      showBiometric = true,
                                      showRememberMe = true,
                                      autoFillCredentials = true,
                                      title = 'Welcome back',
                                      subtitle = 'Sign in to your Walmart account',
                                      enablePasswordStrength = true,
                                      maxLoginAttempts = 5,
                                  }: LoginFormProps): JSX.Element {
    const [showPassword, setShowPassword] = useState(false);
    const [biometricType, setBiometricType] = useState<string | null>(null);
    const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);
    const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState<number>(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
    const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid, touchedFields },
        reset,
        setError,
        clearErrors,
    } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        mode: 'onChange',
    });

    const watchedEmail = watch('email');
    const watchedPassword = watch('password');
    const rememberMe = watch('rememberMe');

    // Enhanced keyboard handling
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

        checkBiometricAvailability();
        checkAppleSignInAvailability();
        loadSavedCredentials();
        checkLockoutStatus();
    }, []);

    // Real-time email validation
    const debouncedEmailValidation = debounce((email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(email));

        // Show email suggestions for common domains
        if (email.includes('@') && !emailRegex.test(email)) {
            setShowEmailSuggestions(true);
        } else {
            setShowEmailSuggestions(false);
        }
    }, 300);

    useEffect(() => {
        if (watchedEmail && touchedFields.email) {
            debouncedEmailValidation(watchedEmail);
        }
    }, [watchedEmail, touchedFields.email]);

    // Password strength checking
    useEffect(() => {
        if (enablePasswordStrength && watchedPassword && touchedFields.password) {
            const strength = calculatePasswordStrength(watchedPassword);
            setPasswordStrength(strength);
        }
    }, [watchedPassword, touchedFields.password, enablePasswordStrength]);

    const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
        let score = 0;

        // Length check
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Character variety checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    };

    const checkLockoutStatus = async () => {
        try {
            const attempts = await AsyncStorage.getItem('login_attempts');
            if (attempts) {
                const parsedAttempts: LoginAttempt[] = JSON.parse(attempts);
                const recentAttempts = parsedAttempts.filter(
                    attempt => Date.now() - attempt.timestamp < 15 * 60 * 1000 // 15 minutes
                );

                if (recentAttempts.length >= maxLoginAttempts) {
                    const lastAttempt = Math.max(...recentAttempts.map(a => a.timestamp));
                    const lockoutEnd = lastAttempt + (15 * 60 * 1000);

                    if (Date.now() < lockoutEnd) {
                        setIsLocked(true);
                        setLockoutTime(lockoutEnd);
                        startLockoutTimer(lockoutEnd);
                    }
                }

                setLoginAttempts(recentAttempts);
            }
        } catch (error) {
            console.error('Error checking lockout status:', error);
        }
    };

    const startLockoutTimer = (endTime: number) => {
        const timer = setInterval(() => {
            if (Date.now() >= endTime) {
                setIsLocked(false);
                setLockoutTime(0);
                clearInterval(timer);
            }
        }, 1000);
    };

    const recordFailedAttempt = async (email: string) => {
        try {
            const newAttempt: LoginAttempt = {
                timestamp: Date.now(),
                email: email,
            };

            const updatedAttempts = [...loginAttempts, newAttempt];
            await AsyncStorage.setItem('login_attempts', JSON.stringify(updatedAttempts));

            setLoginAttempts(updatedAttempts);

            if (updatedAttempts.length >= maxLoginAttempts) {
                const lockoutEnd = Date.now() + (15 * 60 * 1000);
                setIsLocked(true);
                setLockoutTime(lockoutEnd);
                startLockoutTimer(lockoutEnd);

                Alert.alert(
                    'Account Temporarily Locked',
                    `Too many failed login attempts. Please try again in 15 minutes or reset your password.`,
                    [
                        { text: 'OK' },
                        onForgotPassword ? { text: 'Reset Password', onPress: onForgotPassword } : null,
                    ].filter(Boolean) as any
                );
            }
        } catch (error) {
            console.error('Error recording failed attempt:', error);
        }
    };

    const clearFailedAttempts = async () => {
        try {
            await AsyncStorage.removeItem('login_attempts');
            setLoginAttempts([]);
        } catch (error) {
            console.error('Error clearing failed attempts:', error);
        }
    };

    const checkBiometricAvailability = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled && supportedTypes.length > 0) {
                if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                    setBiometricType('Face ID');
                } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                    setBiometricType('Touch ID');
                } else {
                    setBiometricType('Biometric');
                }

                const savedBiometric = await AsyncStorage.getItem('biometric_enabled');
                setHasBiometricCredentials(savedBiometric === 'true');
            }
        } catch (error) {
            console.error('Error checking biometric availability:', error);
        }
    };

    const checkAppleSignInAvailability = async () => {
        if (Platform.OS === 'ios') {
            try {
                const isAvailable = await AppleAuthentication.isAvailableAsync();
                setIsAppleSignInAvailable(isAvailable);
            } catch (error) {
                console.error('Error checking Apple Sign In availability:', error);
            }
        }
    };

    const loadSavedCredentials = async () => {
        if (!autoFillCredentials) return;

        try {
            const savedEmail = await AsyncStorage.getItem('saved_email');
            const savedRememberMe = await AsyncStorage.getItem('remember_me');

            if (savedEmail) {
                setValue('email', savedEmail, { shouldValidate: true });
            }
            if (savedRememberMe === 'true') {
                setValue('rememberMe', true);
            }
        } catch (error) {
            console.error('Error loading saved credentials:', error);
        }
    };

    const saveCredentials = async (email: string, remember: boolean) => {
        try {
            if (remember) {
                await AsyncStorage.setItem('saved_email', email);
                await AsyncStorage.setItem('remember_me', 'true');
            } else {
                await AsyncStorage.removeItem('saved_email');
                await AsyncStorage.removeItem('remember_me');
            }
        } catch (error) {
            console.error('Error saving credentials:', error);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Sign in with ${biometricType}`,
                fallbackLabel: 'Use password instead',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (result.success) {
                const savedCredentials = await AsyncStorage.getItem('biometric_credentials');
                if (savedCredentials) {
                    const credentials = JSON.parse(savedCredentials);
                    await onSubmit(credentials);
                    await clearFailedAttempts();
                } else {
                    Alert.alert(
                        'No Saved Credentials',
                        'Please sign in with your email and password first to enable biometric login.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('Biometric authentication error:', error);
            Alert.alert(
                'Authentication Error',
                'Biometric authentication failed. Please try again or use your password.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleAppleSignIn = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            // TODO: Send credential to your backend for verification
            console.log('Apple Sign In credential:', credential);

            // Clear failed attempts on successful social login
            await clearFailedAttempts();

            Alert.alert('Success', 'Apple Sign In successful!');
        } catch (error: any) {
            if (error.code === 'ERR_CANCELED') {
                return;
            }
            console.error('Apple Sign In error:', error);
            Alert.alert(
                'Sign In Error',
                'Apple Sign In failed. Please try again or use your email and password.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleGoogleSignIn = async () => {
        // TODO: Implement Google Sign In
        Alert.alert('Coming Soon', 'Google Sign In will be available in a future update.');
    };

    const handleFacebookSignIn = async () => {
        // TODO: Implement Facebook Sign In
        Alert.alert('Coming Soon', 'Facebook Sign In will be available in a future update.');
    };

    const validateEmail = (value: string) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Please enter a valid email address';
    };

    const validatePassword = (value: string) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return true;
    };

    const triggerShakeAnimation = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const onFormSubmit = async (data: LoginFormData) => {
        if (isLocked) {
            Alert.alert(
                'Account Locked',
                'Your account is temporarily locked due to too many failed attempts. Please try again later.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            await saveCredentials(data.email, data.rememberMe);
            await onSubmit(data);
            await clearFailedAttempts();

            // Save biometric credentials if biometric is available and user wants to remember
            if (biometricType && data.rememberMe) {
                await AsyncStorage.setItem('biometric_credentials', JSON.stringify(data));
                await AsyncStorage.setItem('biometric_enabled', 'true');
                setHasBiometricCredentials(true);
            }
        } catch (error: any) {
            console.error('Login error:', error);

            // Record failed attempt
            await recordFailedAttempt(data.email);

            // Trigger shake animation
            triggerShakeAnimation();

            // Show appropriate error message
            const remainingAttempts = maxLoginAttempts - (loginAttempts.length + 1);
            let errorMessage = 'Invalid email or password. Please try again.';

            if (remainingAttempts > 0 && remainingAttempts <= 2) {
                errorMessage += ` You have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`;
            }

            setError('password', { message: errorMessage });
        }
    };

    const renderLockoutTimer = () => {
        if (!isLocked) return null;

        const remainingTime = Math.max(0, lockoutTime - Date.now());
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        return (
            <View style={styles.lockoutContainer}>
                <Ionicons name="lock-closed" size={24} color="#EF4444" />
                <Text style={styles.lockoutText}>
                    Account locked. Try again in {minutes}:{seconds.toString().padStart(2, '0')}
                </Text>
            </View>
        );
    };

    const renderPasswordStrength = () => {
        if (!enablePasswordStrength || !passwordStrength || !touchedFields.password) return null;

        const getStrengthColor = () => {
            switch (passwordStrength) {
                case 'weak': return '#EF4444';
                case 'medium': return '#F59E0B';
                case 'strong': return '#10B981';
                default: return '#D1D5DB';
            }
        };

        const getStrengthWidth = () => {
            switch (passwordStrength) {
                case 'weak': return '33%';
                case 'medium': return '66%';
                case 'strong': return '100%';
                default: return '0%';
            }
        };

        return (
            <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                    <View
                        style={[
                            styles.passwordStrengthFill,
                            {
                                backgroundColor: getStrengthColor(),
                                width: getStrengthWidth(),
                            }
                        ]}
                    />
                </View>
                <Text style={[styles.passwordStrengthText, { color: getStrengthColor() }]}>
                    Password strength: {passwordStrength}
                </Text>
            </View>
        );
    };

    const renderEmailSuggestions = () => {
        if (!showEmailSuggestions || !watchedEmail.includes('@')) return null;

        const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const currentDomain = watchedEmail.split('@')[1] || '';
        const suggestions = commonDomains
            .filter(domain => domain.toLowerCase().includes(currentDomain.toLowerCase()))
            .slice(0, 3);

        if (suggestions.length === 0) return null;

        return (
            <View style={styles.emailSuggestionsContainer}>
                {suggestions.map((domain) => (
                    <TouchableOpacity
                        key={domain}
                        style={styles.emailSuggestionItem}
                        onPress={() => {
                            const username = watchedEmail.split('@')[0];
                            setValue('email', `${username}@${domain}`, { shouldValidate: true });
                            setShowEmailSuggestions(false);
                        }}
                    >
                        <Text style={styles.emailSuggestionText}>
                            {watchedEmail.split('@')[0]}@{domain}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderHeader = () => (
        <Animated.View
            style={[
                styles.headerContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.logoContainer}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>W</Text>
                </View>
                <Text style={styles.logoTitle}>Walmart</Text>
            </View>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </Animated.View>
    );

    const renderBiometricButton = () => {
        if (!showBiometric || !biometricType || !hasBiometricCredentials || isLocked) return null;

        return (
            <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
                    size={24}
                    color="#0071CE"
                />
                <Text style={styles.biometricButtonText}>
                    Sign in with {biometricType}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderSocialLoginButtons = () => {
        if (!showSocialLogin || isLocked) return null;

        return (
            <View style={styles.socialLoginContainer}>
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or sign in with</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtonsContainer}>
                    {isAppleSignInAvailable && (
                        <TouchableOpacity
                            style={styles.appleButton}
                            onPress={handleAppleSignIn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="logo-apple" size={20} color="white" />
                            <Text style={styles.appleButtonText}>
                                Continue with Apple
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleSignIn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="logo-google" size={20} color="#EA4335" />
                        <Text style={styles.googleButtonText}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.facebookButton}
                        onPress={handleFacebookSignIn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="logo-facebook" size={20} color="white" />
                        <Text style={styles.facebookButtonText}>
                            Continue with Facebook
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: Math.max(keyboardHeight / 4, 20),
                }}
            >
                {/* Header */}
                {renderHeader()}

                {/* Lockout Timer */}
                {renderLockoutTimer()}

                {/* Biometric Login */}
                {renderBiometricButton()}

                {/* Social Login */}
                {renderSocialLoginButtons()}

                {/* Login Form */}
                <Animated.View
                    style={[
                        styles.formContainer,
                        { transform: [{ translateX: shakeAnim }] }
                    ]}
                >
                    {/* Email Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Email Address</Text>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: 'Email is required',
                                validate: validateEmail,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View>
                                    <View style={[
                                        styles.inputContainer,
                                        errors.email && styles.inputContainerError,
                                        isEmailValid === true && styles.inputContainerSuccess,
                                    ]}>
                                        <Ionicons name="mail" size={20} color="#9CA3AF" />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter your email"
                                            placeholderTextColor="#9CA3AF"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            editable={!isLocked}
                                        />
                                        {isEmailValid === true && (
                                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                        )}
                                    </View>
                                    {renderEmailSuggestions()}
                                </View>
                            )}
                        />
                        {errors.email && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                <Text style={styles.errorText}>{errors.email.message}</Text>
                            </View>
                        )}
                    </View>

                    {/* Password Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Password</Text>
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: 'Password is required',
                                validate: validatePassword,
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={[
                                    styles.inputContainer,
                                    errors.password && styles.inputContainerError,
                                ]}>
                                    <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry={!showPassword}
                                        editable={!isLocked}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                        disabled={isLocked}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye' : 'eye-off'}
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {renderPasswordStrength()}
                        {errors.password && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                <Text style={styles.errorText}>{errors.password.message}</Text>
                            </View>
                        )}
                    </View>

                    {/* Security Info */}
                    {loginAttempts.length > 2 && !isLocked && (
                        <View style={styles.warningContainer}>
                            <Ionicons name="warning" size={16} color="#F59E0B" />
                            <Text style={styles.warningText}>
                                {maxLoginAttempts - loginAttempts.length} attempt{maxLoginAttempts - loginAttempts.length === 1 ? '' : 's'} remaining before account lockout
                            </Text>
                        </View>
                    )}

                    {/* Remember Me & Forgot Password */}
                    <View style={styles.optionsContainer}>
                        {showRememberMe && (
                            <Controller
                                control={control}
                                name="rememberMe"
                                render={({ field: { onChange, value } }) => (
                                    <TouchableOpacity
                                        style={styles.rememberMeContainer}
                                        onPress={() => onChange(!value)}
                                        disabled={isLocked}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.checkbox,
                                                value && styles.checkboxSelected,
                                            ]}
                                        >
                                            {value && (
                                                <Ionicons name="checkmark" size={12} color="white" />
                                            )}
                                        </View>
                                        <Text style={styles.rememberMeText}>Remember me</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        {onForgotPassword && (
                            <TouchableOpacity
                                onPress={onForgotPassword}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            isValid && !isLoading && !isLocked ? styles.loginButtonEnabled : styles.loginButtonDisabled,
                        ]}
                        onPress={handleSubmit(onFormSubmit)}
                        disabled={!isValid || isLoading || isLocked}
                        activeOpacity={0.7}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="white" />
                                <Text style={styles.loginButtonText}>Signing In...</Text>
                            </View>
                        ) : (
                            <Text style={styles.loginButtonText}>
                                {isLocked ? 'Account Locked' : 'Sign In'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    {onSignUp && (
                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
                                <Text style={styles.signUpLink}>Sign up</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // Header
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 48,
        height: 48,
        backgroundColor: '#0071CE',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 24,
    },
    logoTitle: {
        color: '#0071CE',
        fontWeight: 'bold',
        fontSize: 28,
        letterSpacing: -0.5,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Lockout Container
    lockoutContainer: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 24,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    lockoutText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },

    // Biometric Button
    biometricButton: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    biometricButtonText: {
        color: '#0071CE',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },

    // Social Login
    socialLoginContainer: {
        marginHorizontal: 24,
        marginBottom: 32,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D1D5DB',
    },
    dividerText: {
        paddingHorizontal: 16,
        color: '#9CA3AF',
        fontSize: 14,
    },
    socialButtonsContainer: {
        gap: 12,
    },
    appleButton: {
        backgroundColor: '#000000',
        borderRadius: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    appleButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    googleButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        borderRadius: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1877F2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    facebookButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },

    // Form
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    fieldLabel: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputContainerError: {
        borderColor: '#EF4444',
        borderWidth: 2,
    },
    inputContainerSuccess: {
        borderColor: '#10B981',
        borderWidth: 2,
    },
    textInput: {
        flex: 1,
        paddingVertical: 12,
        paddingLeft: 12,
        fontSize: 16,
        color: '#111827',
    },
    eyeButton: {
        padding: 4,
    },

    // Email Suggestions
    emailSuggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
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
    emailSuggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    emailSuggestionText: {
        color: '#374151',
        fontSize: 14,
    },

    // Password Strength
    passwordStrengthContainer: {
        marginTop: 8,
    },
    passwordStrengthBar: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 4,
    },
    passwordStrengthFill: {
        height: '100%',
        borderRadius: 2,
        transition: 'width 0.3s ease',
    },
    passwordStrengthText: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Error and Warning States
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginLeft: 4,
        flex: 1,
    },
    warningContainer: {
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    warningText: {
        color: '#92400E',
        fontSize: 12,
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },

    // Options Row
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxSelected: {
        backgroundColor: '#0071CE',
        borderColor: '#0071CE',
    },
    rememberMeText: {
        color: '#374151',
        fontSize: 14,
    },
    forgotPasswordText: {
        color: '#0071CE',
        fontSize: 14,
        fontWeight: '600',
    },

    // Login Button
    loginButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    loginButtonEnabled: {
        backgroundColor: '#0071CE',
        shadowColor: '#0071CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    // Sign Up
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    signUpText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signUpLink: {
        color: '#0071CE',
        fontSize: 14,
        fontWeight: '600',
    },
});