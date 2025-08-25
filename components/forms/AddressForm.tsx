import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    StyleSheet,
    Keyboard,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import * as Location from 'expo-location';
import { debounce } from 'lodash';

interface AddressFormData {
    type: 'home' | 'work' | 'other';
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    instructions?: string;
    isDefault: boolean;
}

interface AddressFormProps {
    initialData?: Partial<AddressFormData>;
    onSubmit: (data: AddressFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    submitText?: string;
    title?: string;
    showTypeSelection?: boolean;
    showDefaultOption?: boolean;
    showInstructions?: boolean;
    autoDetectLocation?: boolean;
    enableAddressValidation?: boolean;
}

interface AddressSuggestion {
    formatted_address: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

const US_STATES = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
];

const ADDRESS_TYPES = [
    { value: 'home', label: 'Home', icon: 'home' },
    { value: 'work', label: 'Work', icon: 'business' },
    { value: 'other', label: 'Other', icon: 'location' },
];

export default function AddressForm({
                                        initialData = {},
                                        onSubmit,
                                        onCancel,
                                        isLoading = false,
                                        submitText = 'Save Address',
                                        title = 'Add Address',
                                        showTypeSelection = true,
                                        showDefaultOption = true,
                                        showInstructions = true,
                                        autoDetectLocation = true,
                                        enableAddressValidation = true,
                                    }: AddressFormProps): JSX.Element {
    const [showStateModal, setShowStateModal] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isValidatingAddress, setIsValidatingAddress] = useState(false);
    const [addressValidationError, setAddressValidationError] = useState<string | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors, isValid, touchedFields },
        reset,
    } = useForm<AddressFormData>({
        defaultValues: {
            type: 'home',
            firstName: '',
            lastName: '',
            phone: '',
            street: '',
            apartment: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US',
            instructions: '',
            isDefault: false,
            ...initialData,
        },
        mode: 'onChange',
    });

    const watchedValues = watch();
    const selectedState = watch('state');
    const streetAddress = watch('street');
    const city = watch('city');
    const zipCode = watch('zipCode');

    // Enhanced keyboard handling
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    useEffect(() => {
        if (initialData) {
            reset({ ...initialData } as AddressFormData);
        }
    }, [initialData, reset]);

    // Enhanced address validation with debounce
    const debouncedAddressValidation = useCallback(
        debounce(async (street: string, city: string, state: string, zip: string) => {
            if (!enableAddressValidation || !street || !city || !state || !zip) return;

            setIsValidatingAddress(true);
            setAddressValidationError(null);

            try {
                // Mock address validation - replace with actual service
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Simulate validation result
                const isValidAddress = true; // Replace with actual validation logic

                if (!isValidAddress) {
                    setAddressValidationError('Address could not be verified. Please check your entry.');
                }
            } catch (error) {
                console.error('Address validation error:', error);
                setAddressValidationError('Unable to validate address. Please verify manually.');
            } finally {
                setIsValidatingAddress(false);
            }
        }, 1500),
        [enableAddressValidation]
    );

    // Address autocomplete with debounce
    const debouncedAddressSearch = useCallback(
        debounce(async (query: string) => {
            if (!query || query.length < 5) {
                setAddressSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                // Mock address suggestions - replace with actual service (Google Places, etc.)
                const mockSuggestions: AddressSuggestion[] = [
                    {
                        formatted_address: `${query}, New York, NY 10001`,
                        street: query,
                        city: 'New York',
                        state: 'NY',
                        zipCode: '10001',
                    },
                    {
                        formatted_address: `${query}, Los Angeles, CA 90210`,
                        street: query,
                        city: 'Los Angeles',
                        state: 'CA',
                        zipCode: '90210',
                    },
                ];

                setAddressSuggestions(mockSuggestions);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Address search error:', error);
                setAddressSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500),
        []
    );

    // Trigger address validation when relevant fields change
    useEffect(() => {
        if (touchedFields.street && touchedFields.city && touchedFields.state && touchedFields.zipCode) {
            debouncedAddressValidation(streetAddress, city, selectedState, zipCode);
        }
    }, [streetAddress, city, selectedState, zipCode, debouncedAddressValidation, touchedFields]);

    // Enhanced location detection
    const detectCurrentLocation = async () => {
        setIsDetectingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'We need access to your location to auto-fill your address. Please enable location services in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Location.openAppSettingsAsync() },
                    ]
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 10000,
            });

            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];

                // Auto-fill form fields
                if (addr.street && addr.streetNumber) {
                    setValue('street', `${addr.streetNumber} ${addr.street}`, { shouldValidate: true });
                }
                if (addr.city) setValue('city', addr.city, { shouldValidate: true });
                if (addr.region) {
                    const state = US_STATES.find(s => s.name === addr.region || s.code === addr.region);
                    if (state) setValue('state', state.code, { shouldValidate: true });
                }
                if (addr.postalCode) setValue('zipCode', addr.postalCode, { shouldValidate: true });

                // Trigger validation after auto-fill
                await trigger(['street', 'city', 'state', 'zipCode']);

                Alert.alert(
                    'Location Detected!',
                    'Your address has been auto-filled. Please review and verify all details are correct.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Location Not Found',
                    'We could not determine your address from your current location. Please enter your address manually.'
                );
            }
        } catch (error) {
            console.error('Location detection error:', error);
            Alert.alert(
                'Location Error',
                'Failed to detect your location. Please check your internet connection and try again, or enter your address manually.'
            );
        } finally {
            setIsDetectingLocation(false);
        }
    };

    // Enhanced validation functions
    const validateZipCode = (value: string) => {
        if (!value.trim()) return 'ZIP code is required';
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(value) || 'Please enter a valid ZIP code (12345 or 12345-6789)';
    };

    const validatePhone = (value: string) => {
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]*([0-9]{3})[-.\s]*([0-9]{4})$/;
        return phoneRegex.test(value) || 'Please enter a valid US phone number';
    };

    const validateName = (value: string, fieldName: string) => {
        if (!value.trim()) return `${fieldName} is required`;
        if (value.trim().length < 2) return `${fieldName} must be at least 2 characters`;
        if (value.trim().length > 50) return `${fieldName} must be less than 50 characters`;
        return true;
    };

    const validateStreetAddress = (value: string) => {
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Please enter a complete street address';
        return true;
    };

    // Enhanced form submission with better error handling
    const onFormSubmit = async (data: AddressFormData) => {
        try {
            Keyboard.dismiss();

            // Clean up and format data
            const cleanedData = {
                ...data,
                phone: data.phone.replace(/[^\d+]/g, ''),
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                street: data.street.trim(),
                apartment: data.apartment?.trim() || '',
                city: data.city.trim(),
                instructions: data.instructions?.trim() || '',
            };

            await onSubmit(cleanedData);
        } catch (error) {
            console.error('Form submission error:', error);
            Alert.alert(
                'Submission Error',
                'There was an error saving your address. Please check your information and try again.',
                [{ text: 'OK' }]
            );
        }
    };

    // Handle address suggestion selection
    const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
        setValue('street', suggestion.street, { shouldValidate: true });
        setValue('city', suggestion.city, { shouldValidate: true });
        setValue('state', suggestion.state, { shouldValidate: true });
        setValue('zipCode', suggestion.zipCode, { shouldValidate: true });
        setShowSuggestions(false);
        setAddressSuggestions([]);
    };

    const renderTypeSelection = () => {
        if (!showTypeSelection) return null;

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Address Type</Text>
                <View style={styles.typeSelectionContainer}>
                    {ADDRESS_TYPES.map((type, index) => (
                        <Controller
                            key={type.value}
                            control={control}
                            name="type"
                            render={({ field: { onChange, value } }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        value === type.value && styles.typeButtonSelected,
                                        index < ADDRESS_TYPES.length - 1 && styles.typeButtonMargin,
                                    ]}
                                    onPress={() => onChange(type.value)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={type.icon as any}
                                        size={20}
                                        color={value === type.value ? '#0071CE' : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            value === type.value && styles.typeButtonTextSelected,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderFormField = (
        name: keyof AddressFormData,
        label: string,
        placeholder: string,
        options: {
            required?: boolean;
            keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
            autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
            multiline?: boolean;
            validation?: (value: string) => string | boolean;
            maxLength?: number;
            showSuggestions?: boolean;
        } = {}
    ) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
                {label} {options.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <Controller
                control={control}
                name={name}
                rules={{
                    required: options.required ? `${label} is required` : false,
                    validate: options.validation,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                        <TextInput
                            style={[
                                styles.textInput,
                                options.multiline && styles.textInputMultiline,
                                errors[name] && styles.textInputError,
                                (name === 'street' && isValidatingAddress) && styles.textInputValidating,
                            ]}
                            placeholder={placeholder}
                            placeholderTextColor="#9CA3AF"
                            value={value as string}
                            onChangeText={(text) => {
                                onChange(text);
                                if (name === 'street' && options.showSuggestions) {
                                    debouncedAddressSearch(text);
                                }
                            }}
                            onBlur={() => {
                                onBlur();
                                if (name === 'street') {
                                    setShowSuggestions(false);
                                }
                            }}
                            keyboardType={options.keyboardType || 'default'}
                            autoCapitalize={options.autoCapitalize || 'sentences'}
                            autoCorrect={false}
                            multiline={options.multiline}
                            numberOfLines={options.multiline ? 3 : 1}
                            textAlignVertical={options.multiline ? 'top' : 'center'}
                            maxLength={options.maxLength}
                        />

                        {/* Address validation indicator */}
                        {name === 'street' && isValidatingAddress && (
                            <View style={styles.validationIndicator}>
                                <ActivityIndicator size="small" color="#0071CE" />
                                <Text style={styles.validationText}>Validating address...</Text>
                            </View>
                        )}

                        {/* Address suggestions */}
                        {name === 'street' && showSuggestions && addressSuggestions.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                {addressSuggestions.map((suggestion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.suggestionItem}
                                        onPress={() => selectAddressSuggestion(suggestion)}
                                    >
                                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                                        <Text style={styles.suggestionText}>
                                            {suggestion.formatted_address}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            />

            {/* Field errors */}
            {errors[name] && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors[name]?.message}</Text>
                </View>
            )}

            {/* Address validation error */}
            {name === 'zipCode' && addressValidationError && (
                <View style={styles.warningContainer}>
                    <Ionicons name="warning" size={16} color="#F59E0B" />
                    <Text style={styles.warningText}>{addressValidationError}</Text>
                </View>
            )}
        </View>
    );

    const renderStateSelector = () => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
                State <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Controller
                control={control}
                name="state"
                rules={{ required: 'State is required' }}
                render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                        style={[
                            styles.selectorButton,
                            errors.state && styles.textInputError,
                        ]}
                        onPress={() => setShowStateModal(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.selectorButtonText,
                            !value && styles.selectorButtonPlaceholder,
                        ]}>
                            {value
                                ? US_STATES.find(state => state.code === value)?.name || value
                                : 'Select State'
                            }
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            />
            {errors.state && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.state.message}</Text>
                </View>
            )}
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: Math.max(keyboardHeight, 20) }}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    {autoDetectLocation && (
                        <TouchableOpacity
                            style={[
                                styles.locationButton,
                                isDetectingLocation && styles.locationButtonDisabled
                            ]}
                            onPress={detectCurrentLocation}
                            disabled={isDetectingLocation}
                            activeOpacity={0.7}
                        >
                            {isDetectingLocation ? (
                                <ActivityIndicator size="small" color="#0071CE" />
                            ) : (
                                <Ionicons name="location" size={20} color="#0071CE" />
                            )}
                            <Text style={styles.locationButtonText}>
                                {isDetectingLocation ? 'Detecting Location...' : 'Use Current Location'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Address Type */}
                {renderTypeSelection()}

                {/* Name Fields */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfField}>
                        {renderFormField('firstName', 'First Name', 'John', {
                            required: true,
                            autoCapitalize: 'words',
                            validation: (value) => validateName(value, 'First name'),
                            maxLength: 50,
                        })}
                    </View>
                    <View style={styles.halfField}>
                        {renderFormField('lastName', 'Last Name', 'Doe', {
                            required: true,
                            autoCapitalize: 'words',
                            validation: (value) => validateName(value, 'Last name'),
                            maxLength: 50,
                        })}
                    </View>
                </View>

                {/* Phone */}
                {renderFormField('phone', 'Phone Number', '+1 (555) 123-4567', {
                    required: true,
                    keyboardType: 'phone-pad',
                    validation: validatePhone,
                    maxLength: 20,
                })}

                {/* Street Address with autocomplete */}
                {renderFormField('street', 'Street Address', '123 Main Street', {
                    required: true,
                    autoCapitalize: 'words',
                    validation: validateStreetAddress,
                    maxLength: 100,
                    showSuggestions: true,
                })}

                {/* Apartment/Suite */}
                {renderFormField('apartment', 'Apartment/Suite (Optional)', 'Apt 4B, Suite 200', {
                    autoCapitalize: 'words',
                    maxLength: 50,
                })}

                {/* City */}
                {renderFormField('city', 'City', 'New York', {
                    required: true,
                    autoCapitalize: 'words',
                    validation: (value) => !value.trim() ? 'City is required' : true,
                    maxLength: 50,
                })}

                {/* State and ZIP */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfField}>
                        {renderStateSelector()}
                    </View>
                    <View style={styles.halfField}>
                        {renderFormField('zipCode', 'ZIP Code', '10001', {
                            required: true,
                            keyboardType: 'numeric',
                            validation: validateZipCode,
                            maxLength: 10,
                        })}
                    </View>
                </View>

                {/* Delivery Instructions */}
                {showInstructions && (
                    <View>
                        {renderFormField(
                            'instructions',
                            'Delivery Instructions (Optional)',
                            'Leave at front door, ring bell, etc.',
                            {
                                multiline: true,
                                maxLength: 200,
                            }
                        )}
                    </View>
                )}

                {/* Set as Default */}
                {showDefaultOption && (
                    <View style={styles.checkboxContainer}>
                        <Controller
                            control={control}
                            name="isDefault"
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
                                            <Ionicons name="checkmark" size={14} color="white" />
                                        )}
                                    </View>
                                    <View style={styles.checkboxTextContainer}>
                                        <Text style={styles.checkboxLabel}>
                                            Set as default address
                                        </Text>
                                        <Text style={styles.checkboxSubtext}>
                                            This will be used as your primary shipping address
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    {onCancel && (
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.submitButton,
                            isValid && !isLoading ? styles.submitButtonEnabled : styles.submitButtonDisabled,
                            onCancel && styles.submitButtonFlex,
                        ]}
                        onPress={handleSubmit(onFormSubmit)}
                        disabled={!isValid || isLoading}
                        activeOpacity={0.7}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="white" />
                                <Text style={styles.submitButtonText}>Saving...</Text>
                            </View>
                        ) : (
                            <Text style={styles.submitButtonText}>{submitText}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* State Selection Modal */}
            <Modal
                visible={showStateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowStateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select State</Text>
                            <TouchableOpacity
                                onPress={() => setShowStateModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalList}>
                            {US_STATES.map((state) => (
                                <TouchableOpacity
                                    key={state.code}
                                    style={[
                                        styles.modalItem,
                                        selectedState === state.code && styles.modalItemSelected
                                    ]}
                                    onPress={() => {
                                        setValue('state', state.code, { shouldValidate: true });
                                        setShowStateModal(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedState === state.code && styles.modalItemTextSelected
                                    ]}>{state.name}</Text>
                                    {selectedState === state.code && (
                                        <Ionicons name="checkmark" size={20} color="#0071CE" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Main Container
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 16,
    },

    // Header
    headerContainer: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    locationButton: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    locationButtonDisabled: {
        opacity: 0.6,
    },
    locationButtonText: {
        color: '#0071CE',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },

    // Section Container
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#111827',
        fontWeight: '600',
        marginBottom: 12,
        fontSize: 16,
    },

    // Type Selection
    typeSelectionContainer: {
        flexDirection: 'row',
    },
    typeButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    typeButtonSelected: {
        borderColor: '#0071CE',
        backgroundColor: '#EFF6FF',
    },
    typeButtonMargin: {
        marginRight: 8,
    },
    typeButtonText: {
        fontWeight: '600',
        marginTop: 4,
        color: '#374151',
        fontSize: 14,
    },
    typeButtonTextSelected: {
        color: '#0071CE',
    },

    // Form Fields
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        color: '#111827',
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 16,
    },
    requiredStar: {
        color: '#EF4444',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    textInputMultiline: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    textInputError: {
        borderColor: '#EF4444',
        borderWidth: 2,
    },
    textInputValidating: {
        borderColor: '#0071CE',
    },

    // Validation Indicator
    validationIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    validationText: {
        color: '#0071CE',
        fontSize: 12,
        marginLeft: 6,
        fontStyle: 'italic',
    },

    // Address Suggestions
    suggestionsContainer: {
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
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionText: {
        color: '#374151',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
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
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: '#FEF3C7',
        padding: 8,
        borderRadius: 6,
    },
    warningText: {
        color: '#92400E',
        fontSize: 12,
        marginLeft: 4,
        flex: 1,
    },

    // Row Layout
    rowContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    halfField: {
        flex: 1,
    },

    // State Selector
    selectorButton: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
    },
    selectorButtonText: {
        color: '#111827',
        fontSize: 16,
    },
    selectorButtonPlaceholder: {
        color: '#9CA3AF',
    },

    // Checkbox
    checkboxContainer: {
        marginBottom: 24,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginTop: 2,
    },
    checkboxSelected: {
        borderColor: '#0071CE',
        backgroundColor: '#0071CE',
    },
    checkboxTextContainer: {
        flex: 1,
    },
    checkboxLabel: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 2,
    },
    checkboxSubtext: {
        color: '#6B7280',
        fontSize: 14,
        lineHeight: 18,
    },

    // Buttons
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        paddingHorizontal: 32,
        minWidth: 120,
    },
    submitButtonFlex: {
        flex: 1,
    },
    submitButtonEnabled: {
        backgroundColor: '#0071CE',
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalList: {
        maxHeight: 400,
    },
    modalItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    modalItemText: {
        color: '#111827',
        fontSize: 16,
    },
    modalItemTextSelected: {
        color: '#0071CE',
        fontWeight: '600',
    },
});