import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Image,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    borderColor: '#E0E0E0',
};

// Mock user data
const initialUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1990-05-15',
    profileImage: 'https://via.placeholder.com/120x120/0071CE/ffffff?text=JD',
    bio: 'Walmart+ member since 2020. Love shopping for tech and home goods!',
    preferences: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        locationServices: true,
    },
    address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        country: 'United States',
    },
    emergencyContact: {
        name: 'Jane Doe',
        phone: '(555) 987-6543',
        relationship: 'Spouse',
    },
};

const avatarOptions = [
    'https://via.placeholder.com/120x120/0071CE/ffffff?text=JD',
    'https://via.placeholder.com/120x120/FF6B6B/ffffff?text=JD',
    'https://via.placeholder.com/120x120/4ECDC4/ffffff?text=JD',
    'https://via.placeholder.com/120x120/45B7D1/ffffff?text=JD',
    'https://via.placeholder.com/120x120/96CEB4/ffffff?text=JD',
    'https://via.placeholder.com/120x120/FECA57/ffffff?text=JD',
];

export default function EditProfileScreen() {
    const [userData, setUserData] = useState(initialUserData);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const handleInputChange = (field: string, value: string | boolean, section?: string) => {
        setHasUnsavedChanges(true);

        if (section) {
            setUserData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section as keyof typeof prev],
                    [field]: value,
                }
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSave = () => {
        // TODO: Implement save logic
        Alert.alert(
            'Profile Updated',
            'Your profile information has been saved successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        setHasUnsavedChanges(false);
                        router.back();
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to leave?',
                [
                    { text: 'Stay', style: 'cancel' },
                    { text: 'Leave', style: 'destructive', onPress: () => router.back() },
                ]
            );
        } else {
            router.back();
        }
    };

    const handleAvatarSelect = (avatar: string) => {
        handleInputChange('profileImage', avatar);
        setShowAvatarModal(false);
    };

    const formatPhoneNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    };

    const renderSection = (title: string, children: React.ReactNode, sectionKey: string) => (
        <View style={styles.section}>
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setActiveSection(activeSection === sectionKey ? null : sectionKey)}
            >
                <Text style={styles.sectionTitle}>{title}</Text>
                <Ionicons
                    name={activeSection === sectionKey ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.mediumGray}
                />
            </TouchableOpacity>
            {activeSection === sectionKey && (
                <View style={styles.sectionContent}>
                    {children}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[
                        styles.headerButton,
                        hasUnsavedChanges && styles.saveButtonActive
                    ]}
                    disabled={!hasUnsavedChanges}
                >
                    <Text style={[
                        styles.saveText,
                        hasUnsavedChanges && styles.saveTextActive
                    ]}>
                        Save
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Profile Image Section */}
                    <View style={styles.profileImageSection}>
                        <TouchableOpacity
                            style={styles.profileImageContainer}
                            onPress={() => setShowAvatarModal(true)}
                        >
                            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
                            <View style={styles.editImageOverlay}>
                                <Ionicons name="camera" size={20} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.profileImageLabel}>Tap to change photo</Text>
                    </View>

                    {/* Basic Information */}
                    {renderSection('Basic Information', (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>First Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.firstName}
                                    onChangeText={(value) => handleInputChange('firstName', value)}
                                    placeholder="Enter first name"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Last Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.lastName}
                                    onChangeText={(value) => handleInputChange('lastName', value)}
                                    placeholder="Enter last name"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.email}
                                    onChangeText={(value) => handleInputChange('email', value)}
                                    placeholder="Enter email address"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.phone}
                                    onChangeText={(value) => handleInputChange('phone', formatPhoneNumber(value))}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Date of Birth</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.dateOfBirth}
                                    onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Bio</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    value={userData.bio}
                                    onChangeText={(value) => handleInputChange('bio', value)}
                                    placeholder="Tell us about yourself..."
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </>
                    ), 'basic')}

                    {/* Address Information */}
                    {renderSection('Address Information', (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Street Address</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.address.street}
                                    onChangeText={(value) => handleInputChange('street', value, 'address')}
                                    placeholder="Enter street address"
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, { flex: 2 }]}>
                                    <Text style={styles.inputLabel}>City</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={userData.address.city}
                                        onChangeText={(value) => handleInputChange('city', value, 'address')}
                                        placeholder="City"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={styles.inputLabel}>State</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={userData.address.state}
                                        onChangeText={(value) => handleInputChange('state', value, 'address')}
                                        placeholder="State"
                                        maxLength={2}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ZIP Code</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.address.zipCode}
                                    onChangeText={(value) => handleInputChange('zipCode', value, 'address')}
                                    placeholder="ZIP Code"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Country</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.address.country}
                                    onChangeText={(value) => handleInputChange('country', value, 'address')}
                                    placeholder="Country"
                                />
                            </View>
                        </>
                    ), 'address')}

                    {/* Emergency Contact */}
                    {renderSection('Emergency Contact', (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Contact Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.emergencyContact.name}
                                    onChangeText={(value) => handleInputChange('name', value, 'emergencyContact')}
                                    placeholder="Enter contact name"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.emergencyContact.phone}
                                    onChangeText={(value) => handleInputChange('phone', formatPhoneNumber(value), 'emergencyContact')}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Relationship</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.emergencyContact.relationship}
                                    onChangeText={(value) => handleInputChange('relationship', value, 'emergencyContact')}
                                    placeholder="e.g., Spouse, Parent, Friend"
                                />
                            </View>
                        </>
                    ), 'emergency')}

                    {/* Account Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Actions</Text>
                        <View style={styles.sectionContent}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="key-outline" size={20} color={COLORS.walmartBlue} />
                                <Text style={styles.actionButtonText}>Change Password</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="shield-outline" size={20} color={COLORS.walmartBlue} />
                                <Text style={styles.actionButtonText}>Privacy Settings</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                                <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete Account</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Avatar Selection Modal */}
            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAvatarModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Profile Photo</Text>
                            <TouchableOpacity
                                onPress={() => setShowAvatarModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.avatarGrid}>
                            {avatarOptions.map((avatar, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.avatarOption,
                                        userData.profileImage === avatar && styles.avatarOptionSelected
                                    ]}
                                    onPress={() => handleAvatarSelect(avatar)}
                                >
                                    <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
                                    {userData.profileImage === avatar && (
                                        <View style={styles.avatarSelectedOverlay}>
                                            <Ionicons name="checkmark" size={20} color={COLORS.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.cameraButton}>
                            <Ionicons name="camera" size={20} color={COLORS.walmartBlue} />
                            <Text style={styles.cameraButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    cancelText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    saveText: {
        fontSize: 16,
        color: COLORS.mediumGray,
        fontWeight: '500',
    },
    saveTextActive: {
        color: COLORS.walmartBlue,
        fontWeight: 'bold',
    },
    saveButtonActive: {
        backgroundColor: 'rgba(0, 113, 206, 0.1)',
        borderRadius: 8,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    profileImageSection: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 32,
        marginBottom: 16,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.white,
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 18,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    profileImageLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 12,
    },
    section: {
        backgroundColor: COLORS.white,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    sectionContent: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: COLORS.white,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    actionButtonText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        marginLeft: 12,
    },
    deleteButton: {
        borderBottomWidth: 0,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    modalCloseButton: {
        padding: 4,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        justifyContent: 'space-between',
    },
    avatarOption: {
        width: '30%',
        aspectRatio: 1,
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    avatarOptionSelected: {
        borderWidth: 3,
        borderColor: COLORS.walmartBlue,
    },
    avatarOptionImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarSelectedOverlay: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: COLORS.walmartBlue,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: COLORS.walmartBlue,
        borderRadius: 8,
        gap: 8,
    },
    cameraButtonText: {
        fontSize: 16,
        color: COLORS.walmartBlue,
        fontWeight: '500',
    },
});