import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Share,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

interface PrivacySection {
    id: string;
    title: string;
    content: string;
    subsections?: PrivacySubsection[];
    icon: keyof typeof Ionicons.glyphMap;
}

interface PrivacySubsection {
    id: string;
    title: string;
    content: string;
}

interface TableOfContentsItem {
    id: string;
    title: string;
    level: number;
}

const PrivacyPolicyScreen: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('');
    const [showTableOfContents, setShowTableOfContents] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const lastUpdated = 'July 15, 2025';
    const effectiveDate = 'July 22, 2025';

    const privacySections: PrivacySection[] = [
        {
            id: 'overview',
            title: 'Privacy Policy Overview',
            icon: 'document-text-outline',
            content: 'At Walmart, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your information when you use our mobile application, website, and services.\n\nWe believe in transparency and want you to understand exactly how your data is handled. This policy applies to all Walmart services, including our mobile app, website, in-store services, and any other platforms where this policy is referenced.',
        },
        {
            id: 'information-collection',
            title: 'Information We Collect',
            icon: 'folder-outline',
            content: 'We collect various types of information to provide and improve our services to you.',
            subsections: [
                {
                    id: 'personal-info',
                    title: 'Personal Information',
                    content: 'This includes information you provide directly to us, such as:\n• Name, email address, and phone number\n• Billing and shipping addresses\n• Payment information (processed securely)\n• Date of birth and demographic information\n• Account preferences and communication settings',
                },
                {
                    id: 'usage-info',
                    title: 'Usage Information',
                    content: 'We automatically collect information about how you use our services:\n• Pages visited and time spent on our app/website\n• Search queries and product interactions\n• Device information (type, operating system, browser)\n• IP address and location data (with your permission)\n• Shopping behavior and purchase history',
                },
                {
                    id: 'device-info',
                    title: 'Device and Technical Information',
                    content: 'To provide optimal app performance and security:\n• Device identifiers and hardware information\n• Operating system and app version\n• Network connection details\n• Crash reports and performance metrics\n• Camera and microphone access (only when you grant permission)',
                },
            ],
        },
        {
            id: 'information-use',
            title: 'How We Use Your Information',
            icon: 'settings-outline',
            content: 'We use your information for the following purposes:',
            subsections: [
                {
                    id: 'service-provision',
                    title: 'Providing Our Services',
                    content: '• Processing your orders and payments\n• Delivering products to you\n• Managing your account and preferences\n• Providing customer support\n• Enabling pickup and delivery services',
                },
                {
                    id: 'personalization',
                    title: 'Personalization and Recommendations',
                    content: '• Customizing your shopping experience\n• Showing relevant products and offers\n• Personalizing search results\n• Recommending products based on your interests\n• Tailoring promotional content',
                },
                {
                    id: 'communication',
                    title: 'Communication',
                    content: '• Sending order confirmations and updates\n• Providing customer service responses\n• Sharing promotional offers (with your consent)\n• Sending important policy or service updates\n• Notifying you about account activity',
                },
                {
                    id: 'analytics',
                    title: 'Analytics and Improvement',
                    content: '• Analyzing app performance and usage patterns\n• Conducting research to improve our services\n• Testing new features and functionality\n• Preventing fraud and ensuring security\n• Complying with legal requirements',
                },
            ],
        },
        {
            id: 'information-sharing',
            title: 'Information Sharing and Disclosure',
            icon: 'share-outline',
            content: 'We may share your information in the following circumstances:',
            subsections: [
                {
                    id: 'service-providers',
                    title: 'Service Providers and Partners',
                    content: 'We work with trusted third-party service providers who help us operate our business:\n• Payment processors (for secure transaction handling)\n• Shipping and delivery companies\n• Customer service platforms\n• Marketing and analytics providers\n• Cloud storage and hosting services\n\nThese partners are contractually obligated to protect your information and use it only for authorized purposes.',
                },
                {
                    id: 'legal-compliance',
                    title: 'Legal Requirements and Safety',
                    content: 'We may disclose information when required by law or to protect safety:\n• Response to legal process (subpoenas, court orders)\n• Compliance with government investigations\n• Protection of our rights and property\n• Prevention of fraud or illegal activities\n• Emergency situations involving public safety',
                },
                {
                    id: 'business-transfers',
                    title: 'Business Transfers',
                    content: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to the same privacy protections outlined in this policy.',
                },
            ],
        },
        {
            id: 'data-security',
            title: 'Data Security and Protection',
            icon: 'shield-checkmark-outline',
            content: 'We implement comprehensive security measures to protect your personal information:',
            subsections: [
                {
                    id: 'technical-safeguards',
                    title: 'Technical Safeguards',
                    content: '• Advanced encryption for data transmission and storage\n• Secure servers with restricted access\n• Regular security audits and vulnerability testing\n• Multi-factor authentication for sensitive operations\n• Automated monitoring for suspicious activities',
                },
                {
                    id: 'organizational-safeguards',
                    title: 'Organizational Safeguards',
                    content: '• Employee training on privacy and security practices\n• Access controls limiting data access to authorized personnel\n• Regular security policy updates and compliance reviews\n• Incident response procedures for potential breaches\n• Third-party security certifications and audits',
                },
                {
                    id: 'data-retention',
                    title: 'Data Retention',
                    content: 'We retain your information only as long as necessary to:\n• Provide our services to you\n• Comply with legal obligations\n• Resolve disputes and enforce agreements\n• Improve our services and prevent fraud\n\nWhen information is no longer needed, we securely delete or anonymize it.',
                },
            ],
        },
        {
            id: 'user-rights',
            title: 'Your Privacy Rights and Choices',
            icon: 'person-outline',
            content: 'You have several rights regarding your personal information:',
            subsections: [
                {
                    id: 'access-control',
                    title: 'Access and Control',
                    content: '• View and update your account information\n• Download a copy of your personal data\n• Delete your account and associated data\n• Opt out of promotional communications\n• Manage cookie and tracking preferences',
                },
                {
                    id: 'location-permissions',
                    title: 'Location and Device Permissions',
                    content: '• Control location sharing through device settings\n• Manage camera and microphone access\n• Adjust notification preferences\n• Control app permissions for contacts and photos\n• Disable automatic data collection features',
                },
                {
                    id: 'marketing-preferences',
                    title: 'Marketing and Communication Preferences',
                    content: '• Unsubscribe from promotional emails\n• Opt out of targeted advertising\n• Control push notification settings\n• Manage SMS/text message preferences\n• Adjust personalization settings',
                },
            ],
        },
        {
            id: 'cookies-tracking',
            title: 'Cookies and Tracking Technologies',
            icon: 'analytics-outline',
            content: 'We use various technologies to collect information and improve your experience:',
            subsections: [
                {
                    id: 'cookie-types',
                    title: 'Types of Cookies We Use',
                    content: '• Essential cookies (required for basic functionality)\n• Performance cookies (analyze site usage and performance)\n• Functional cookies (remember your preferences)\n• Targeting cookies (provide relevant advertisements)\n• Social media cookies (enable sharing features)',
                },
                {
                    id: 'tracking-technologies',
                    title: 'Other Tracking Technologies',
                    content: '• Web beacons and pixel tags\n• Mobile app analytics tools\n• Session replay technology (anonymized)\n• A/B testing platforms\n• Customer feedback and survey tools',
                },
                {
                    id: 'managing-cookies',
                    title: 'Managing Cookies and Tracking',
                    content: 'You can control cookies through:\n• Browser settings (disable or delete cookies)\n• App privacy settings\n• Our cookie preference center\n• Device advertising settings\n• Third-party opt-out tools',
                },
            ],
        },
        {
            id: 'international-transfers',
            title: 'International Data Transfers',
            icon: 'globe-outline',
            content: 'Walmart operates globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers:\n\n• Standard Contractual Clauses for EU data transfers\n• Adequacy decisions for approved countries\n• Binding Corporate Rules for intra-group transfers\n• Additional security measures for sensitive data\n• Compliance with local data protection laws',
        },
        {
            id: 'childrens-privacy',
            title: "Children's Privacy",
            icon: 'happy-outline',
            content: 'Protecting children\'s privacy is important to us:\n\n• Our services are not directed to children under 13\n• We do not knowingly collect personal information from children under 13\n• If we learn we have collected information from a child under 13, we will delete it promptly\n• Parents can contact us to review, update, or delete their child\'s information\n• We comply with COPPA (Children\'s Online Privacy Protection Act) requirements',
        },
        {
            id: 'state-specific',
            title: 'State-Specific Privacy Rights',
            icon: 'location-outline',
            content: 'Residents of certain states have additional privacy rights:',
            subsections: [
                {
                    id: 'california-rights',
                    title: 'California Residents (CCPA/CPRA)',
                    content: 'Under California law, you have the right to:\n• Know what personal information we collect and how it\'s used\n• Delete your personal information\n• Opt out of the sale or sharing of personal information\n• Correct inaccurate personal information\n• Limit the use of sensitive personal information\n• Non-discrimination for exercising your rights',
                },
                {
                    id: 'other-states',
                    title: 'Other State Laws',
                    content: 'We also comply with privacy laws in:\n• Virginia (VCDPA)\n• Colorado (CPA)\n• Connecticut (CTDPA)\n• Utah (UCPA)\n• Other states with applicable privacy legislation\n\nContact us to exercise rights under applicable state laws.',
                },
            ],
        },
        {
            id: 'contact-info',
            title: 'Contact Information and Requests',
            icon: 'mail-outline',
            content: 'For privacy-related questions or to exercise your rights, contact us through:',
            subsections: [
                {
                    id: 'privacy-office',
                    title: 'Privacy Office',
                    content: 'Email: privacy@walmart.com\nPhone: 1-800-WALMART (1-800-925-6278)\nMail: Walmart Privacy Office\n702 SW 8th Street\nBentonville, AR 72716',
                },
                {
                    id: 'data-requests',
                    title: 'Data Subject Requests',
                    content: 'To exercise your privacy rights:\n• Use our online Privacy Request Portal\n• Call our dedicated privacy hotline\n• Submit requests through the mobile app\n• Contact customer service for assistance\n\nWe will respond to valid requests within 30 days (or as required by applicable law).',
                },
            ],
        },
    ];

    const generateTableOfContents = (): TableOfContentsItem[] => {
        const toc: TableOfContentsItem[] = [];

        privacySections.forEach(section => {
            toc.push({
                id: section.id,
                title: section.title,
                level: 1,
            });

            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    toc.push({
                        id: subsection.id,
                        title: subsection.title,
                        level: 2,
                    });
                });
            }
        });

        return toc;
    };

    const scrollToSection = (sectionId: string) => {
        // In a real implementation, you would calculate the Y offset and scroll to it
        setActiveSection(sectionId);
        setShowTableOfContents(false);
        console.log(`Scrolling to section: ${sectionId}`);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Walmart Privacy Policy - Learn how we protect your personal information',
                url: 'https://www.walmart.com/privacy-policy',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handlePrint = () => {
        Alert.alert(
            'Print Privacy Policy',
            'Would you like to open this privacy policy in your browser for printing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open in Browser',
                    onPress: () => Linking.openURL('https://www.walmart.com/privacy-policy')
                },
            ]
        );
    };

    const handleContactPrivacy = () => {
        Alert.alert(
            'Contact Privacy Office',
            'How would you like to contact our Privacy Office?',
            [
                { text: 'Email', onPress: () => Linking.openURL('mailto:privacy@walmart.com') },
                { text: 'Phone', onPress: () => Linking.openURL('tel:18009256278') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const tableOfContents = generateTableOfContents();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0071ce" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionButton} onPress={() => setShowTableOfContents(!showTableOfContents)}>
                        <Ionicons name="list-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
                        <Ionicons name="share-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Table of Contents Overlay */}
            {showTableOfContents && (
                <View style={styles.tocOverlay}>
                    <View style={styles.tocContainer}>
                        <View style={styles.tocHeader}>
                            <Text style={styles.tocTitle}>Table of Contents</Text>
                            <TouchableOpacity onPress={() => setShowTableOfContents(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.tocContent}>
                            {tableOfContents.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.tocItem,
                                        item.level === 2 && styles.tocSubItem,
                                    ]}
                                    onPress={() => scrollToSection(item.id)}
                                >
                                    <Text style={[
                                        styles.tocItemText,
                                        item.level === 2 && styles.tocSubItemText,
                                    ]}>
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            {/* Main Content */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Policy Header */}
                <View style={styles.policyHeader}>
                    <View style={styles.policyHeaderIcon}>
                        <Ionicons name="shield-checkmark" size={32} color="#0071ce" />
                    </View>
                    <Text style={styles.policyTitle}>Walmart Privacy Policy</Text>
                    <Text style={styles.policySubtitle}>
                        Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                    </Text>

                    <View style={styles.policyDates}>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>Last Updated:</Text>
                            <Text style={styles.dateValue}>{lastUpdated}</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>Effective Date:</Text>
                            <Text style={styles.dateValue}>{effectiveDate}</Text>
                        </View>
                    </View>

                    <View style={styles.quickActions}>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleContactPrivacy}>
                            <Ionicons name="mail-outline" size={16} color="#0071ce" />
                            <Text style={styles.quickActionText}>Contact Privacy Office</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handlePrint}>
                            <Ionicons name="print-outline" size={16} color="#0071ce" />
                            <Text style={styles.quickActionText}>Print Policy</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Privacy Sections */}
                {privacySections.map((section, index) => (
                    <View key={section.id} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Ionicons name={section.icon} size={24} color="#0071ce" />
                            </View>
                            <View style={styles.sectionHeaderText}>
                                <Text style={styles.sectionNumber}>{index + 1}.</Text>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionContent}>{section.content}</Text>

                        {section.subsections && (
                            <View style={styles.subsections}>
                                {section.subsections.map((subsection, subIndex) => (
                                    <View key={subsection.id} style={styles.subsection}>
                                        <Text style={styles.subsectionTitle}>
                                            {index + 1}.{subIndex + 1} {subsection.title}
                                        </Text>
                                        <Text style={styles.subsectionContent}>{subsection.content}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerSection}>
                        <Text style={styles.footerTitle}>Questions About This Policy?</Text>
                        <Text style={styles.footerText}>
                            If you have any questions about this Privacy Policy or our privacy practices,
                            please don't hesitate to contact our Privacy Office.
                        </Text>
                        <TouchableOpacity style={styles.footerButton} onPress={handleContactPrivacy}>
                            <Ionicons name="chatbubble-outline" size={18} color="white" />
                            <Text style={styles.footerButtonText}>Contact Us</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerDivider} />

                    <View style={styles.footerInfo}>
                        <Text style={styles.footerCopyright}>
                            © 2025 Walmart Inc. All rights reserved.
                        </Text>
                        <Text style={styles.footerDisclaimer}>
                            This privacy policy is available in multiple languages.
                            If there are any conflicts between versions, the English version will prevail.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#0071ce',
        paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerActionButton: {
        padding: 8,
        marginLeft: 4,
    },
    tocOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tocContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        margin: 20,
        maxHeight: '80%',
        width: '90%',
    },
    tocHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tocTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    tocContent: {
        maxHeight: 400,
    },
    tocItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tocSubItem: {
        paddingLeft: 32,
        backgroundColor: '#f8f8f8',
    },
    tocItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    tocSubItemText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666',
    },
    content: {
        flex: 1,
    },
    policyHeader: {
        backgroundColor: 'white',
        padding: 24,
        alignItems: 'center',
    },
    policyHeaderIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    policyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    policySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    policyDates: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 24,
    },
    dateItem: {
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
    },
    quickActionText: {
        color: '#0071ce',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    section: {
        backgroundColor: 'white',
        margin: 16,
        marginBottom: 0,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionHeaderText: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0071ce',
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    sectionContent: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 16,
    },
    subsections: {
        marginTop: 8,
    },
    subsection: {
        marginBottom: 20,
        paddingLeft: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#e3f2fd',
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    subsectionContent: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    footer: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    footerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    footerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    footerButton: {
        backgroundColor: '#0071ce',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    footerDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 24,
    },
    footerInfo: {
        alignItems: 'center',
    },
    footerCopyright: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    footerDisclaimer: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
    },
});