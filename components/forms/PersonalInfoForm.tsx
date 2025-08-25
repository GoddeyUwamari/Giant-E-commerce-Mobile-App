import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PersonalInfoData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
}

interface PersonalInfoFormProps {
    initialData: PersonalInfoData;
    onSave: (data: PersonalInfoData) => Promise<void>;
    isEditing: boolean;
    onToggleEdit: () => void;
}

// Validation functions
const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!phone.trim()) return 'Phone number is required';
    if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
    return null;
};

const validateName = (name: string, fieldName: string): string | null => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    return null;
};

const validateDateOfBirth = (date: string): string | null => {
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!date.trim()) return 'Date of birth is required';
    if (!dateRegex.test(date)) return 'Please enter date in MM/DD/YYYY format';

    const [month, day, year] = date.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13) return 'You must be at least 13 years old';
    if (age > 120) return 'Please enter a valid birth date';

    return null;
};

export default function PersonalInfoForm({
                                             initialData,
                                             onSave,
                                             isEditing,
                                             onToggleEdit
                                         }: PersonalInfoFormProps): JSX.Element {
    const [formData, setFormData] = useState<PersonalInfoData>(initialData);
    const [errors, setErrors] = useState<Partial<PersonalInfoData>>({});
    const [loading, setLoading] = useState(false);

    const updateField = (field: keyof PersonalInfoData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<PersonalInfoData> = {};

        // Validate all fields
        const firstNameError = validateName(formData.firstName, 'First name');
        const lastNameError = validateName(formData.lastName, 'Last name');
        const emailError = validateEmail(formData.email);
        const phoneError = validatePhone(formData.phone);
        const dobError = validateDateOfBirth(formData.dateOfBirth);

        if (firstNameError) newErrors.firstName = firstNameError;
        if (lastNameError) newErrors.lastName = lastNameError;
        if (emailError) newErrors.email = emailError;
        if (phoneError) newErrors.phone = phoneError;
        if (dobError) newErrors.dateOfBirth = dobError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fix the errors below and try again.');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            Alert.alert(
                'Success',
                'Your personal information has been updated successfully.',
                [{ text: 'OK', onPress: onToggleEdit }]
            );
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert(
                'Error',
                'Failed to update your information. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(initialData);
        setErrors({});
        onToggleEdit();
    };

    const renderInputField = (
        label: string,
        value: string,
        field: keyof PersonalInfoData,
        placeholder: string,
        keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
        maxLength?: number
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    !isEditing && styles.inputDisabled,
                    errors[field] && styles.inputError
                ]}
                value={value}
                onChangeText={(text) => updateField(field, text)}
                placeholder={placeholder}
                keyboardType={keyboardType}
                editable={isEditing}
                maxLength={maxLength}
                autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
                autoCorrect={false}
            />
            {errors[field] && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#D32F2F" />
                    <Text style={styles.errorText}>{errors[field]}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.formContent}>
                {renderInputField(
                    'First Name',
                    formData.firstName,
                    'firstName',
                    'Enter your first name',
                    'default',
                    50
                )}

                {renderInputField(
                    'Last Name',
                    formData.lastName,
                    'lastName',
                    'Enter your last name',
                    'default',
                    50
                )}

                {renderInputField(
                    'Email Address',
                    formData.email,
                    'email',
                    'Enter your email address',
                    'email-address',
                    100
                )}

                {renderInputField(
                    'Phone Number',
                    formData.phone,
                    'phone',
                    'Enter your phone number',
                    'phone-pad',
                    20
                )}

                {renderInputField(
                    'Date of Birth',
                    formData.dateOfBirth,
                    'dateOfBirth',
                    'MM/DD/YYYY',
                    'default',
                    10
                )}
            </View>

            {/* Action Buttons */}
            {isEditing && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>
                                    Saving...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContent: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212121',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#212121',
        backgroundColor: '#FFFFFF',
    },
    inputDisabled: {
        backgroundColor: '#F5F5F5',
        color: '#757575',
    },
    inputError: {
        borderColor: '#D32F2F',
        borderWidth: 2,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    errorText: {
        fontSize: 12,
        color: '#D32F2F',
        marginLeft: 4,
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212121',
    },
    saveButton: {
        backgroundColor: '#0071CE',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});