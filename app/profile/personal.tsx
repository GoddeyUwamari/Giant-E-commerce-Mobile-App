import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PersonalInfoForm from '../../components/forms/PersonalInfoForm';

// You would replace this with your actual user state/context
import { useAuth } from '../../hooks/useAuth'; // Assuming you have this hook

interface PersonalInfoData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
}

export default function PersonalInformationScreen(): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<PersonalInfoData>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '01/15/1990',
    });

    // TODO: Replace with actual user data fetching
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await api.getUserProfile();
            // setUserData(response.data);

            // Mock data for now
            console.log('Fetching user data...');
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load user information.');
        }
    };

    const handleSave = async (formData: PersonalInfoData): Promise<void> => {
        try {
            // TODO: Replace with actual API call
            // await api.updateUserProfile(formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update local state
            setUserData(formData);

            console.log('Saved user data:', formData);
        } catch (error) {
            console.error('Error saving user data:', error);
            throw new Error('Failed to save user information');
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#212121" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Information</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={toggleEdit}
                >
                    <Ionicons
                        name={isEditing ? "close" : "create-outline"}
                        size={24}
                        color="#0071CE"
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Personal Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Basic Information</Text>
                        <Text style={styles.cardSubtitle}>
                            Manage your basic account information
                        </Text>
                    </View>

                    <View style={styles.cardContent}>
                        <PersonalInfoForm
                            initialData={userData}
                            onSave={handleSave}
                            isEditing={isEditing}
                            onToggleEdit={toggleEdit}
                        />
                    </View>
                </View>

                {/* Account Security Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Account Security</Text>
                        <Text style={styles.cardSubtitle}>
                            Manage your account security settings
                        </Text>
                    </View>

                    <View style={styles.cardContent}>
                        <TouchableOpacity
                            style={styles.securityItem}
                            onPress={() => {
                                // TODO: Navigate to change password screen
                                Alert.alert('Coming Soon', 'Password change feature coming soon!');
                            }}
                        >
                            <View style={styles.securityItemLeft}>
                                <Ionicons name="key-outline" size={20} color="#424242" />
                                <View style={styles.securityItemText}>
                                    <Text style={styles.securityItemTitle}>Change Password</Text>
                                    <Text style={styles.securityItemSubtitle}>Last changed 3 months ago</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.securityItem, styles.securityItemLast]}
                            onPress={() => {
                                // TODO: Navigate to two-factor auth screen
                                Alert.alert('Coming Soon', 'Two-factor authentication setup coming soon!');
                            }}
                        >
                            <View style={styles.securityItemLeft}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#424242" />
                                <View style={styles.securityItemText}>
                                    <Text style={styles.securityItemTitle}>Two-Factor Authentication</Text>
                                    <Text style={styles.securityItemSubtitle}>Add an extra layer of security</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Important Notice */}
                <View style={styles.noticeCard}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="information-circle" size={20} color="#0071CE" />
                        <Text style={styles.noticeTitle}>Important</Text>
                    </View>
                    <Text style={styles.noticeText}>
                        Changes to your email address will require verification.
                        You'll receive a confirmation email at your new address.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    editButton: {
        padding: 8,
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#757575',
    },
    cardContent: {
        padding: 16,
    },
    securityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    securityItemLast: {
        borderBottomWidth: 0,
    },
    securityItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    securityItemText: {
        marginLeft: 12,
    },
    securityItemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212121',
        marginBottom: 2,
    },
    securityItemSubtitle: {
        fontSize: 14,
        color: '#757575',
    },
    noticeCard: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0071CE',
        marginLeft: 8,
    },
    noticeText: {
        fontSize: 14,
        color: '#757575',
        lineHeight: 20,
    },
});