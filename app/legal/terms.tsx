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

interface TermsSection {
    id: string;
    title: string;
    content: string;
    subsections?: TermsSubsection[];
    icon: keyof typeof Ionicons.glyphMap;
    important?: boolean;
}

interface TermsSubsection {
    id: string;
    title: string;
    content: string;
    highlight?: boolean;
}

interface TableOfContentsItem {
    id: string;
    title: string;
    level: number;
}

const TermsOfServiceScreen: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('');
    const [showTableOfContents, setShowTableOfContents] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const lastUpdated = 'July 15, 2025';
    const effectiveDate = 'July 22, 2025';

    const termsSections: TermsSection[] = [
        {
            id: 'acceptance',
            title: 'Acceptance of Terms',
            icon: 'checkmark-circle-outline',
            important: true,
            content: 'By accessing or using the Walmart mobile application, website, or any of our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.\n\nThese terms constitute a legally binding agreement between you and Walmart Inc. Your continued use of our services indicates your acceptance of any updates or modifications to these terms.',
        },
        {
            id: 'services-description',
            title: 'Description of Services',
            icon: 'storefront-outline',
            content: 'Walmart provides an online and mobile platform that allows users to browse, search, and purchase products, as well as access various services including:',
            subsections: [
                {
                    id: 'shopping-services',
                    title: 'Shopping and E-commerce',
                    content: '• Browse and purchase millions of products\n• Access product information, reviews, and recommendations\n• Manage shopping cart and checkout processes\n• Track orders and delivery status\n• Access digital receipts and purchase history',
                },
                {
                    id: 'delivery-services',
                    title: 'Delivery and Pickup Services',
                    content: '• Standard and express delivery options\n• Same-day delivery in select areas\n• Curbside pickup and in-store pickup\n• Grocery pickup and delivery\n• Installation and assembly services for select products',
                },
                {
                    id: 'membership-services',
                    title: 'Walmart+ Membership',
                    content: '• Free unlimited delivery on orders over $35\n• Member prices on fuel at select stations\n• Mobile scan & go for faster checkout\n• Early access to special offers and events\n• Free shipping with no order minimum',
                },
                {
                    id: 'digital-services',
                    title: 'Digital and Financial Services',
                    content: '• Walmart Pay for secure mobile payments\n• Photo printing and personalization services\n• Gift card purchases and management\n• Money transfer and check cashing services\n• Pharmacy services and prescription management',
                },
            ],
        },
        {
            id: 'user-accounts',
            title: 'User Accounts and Registration',
            icon: 'person-add-outline',
            content: 'To access certain features of our services, you must create an account. When creating an account, you agree to:',
            subsections: [
                {
                    id: 'account-requirements',
                    title: 'Account Requirements',
                    content: '• Provide accurate, current, and complete information\n• Maintain and update your account information\n• Keep your login credentials secure and confidential\n• Be at least 18 years old or have parental consent\n• Use only one account per person',
                },
                {
                    id: 'account-security',
                    title: 'Account Security',
                    content: '• You are responsible for all activities under your account\n• Notify us immediately of any unauthorized access\n• Use strong passwords and enable two-factor authentication when available\n• Do not share your account with others\n• We may suspend accounts that show suspicious activity',
                    highlight: true,
                },
                {
                    id: 'account-termination',
                    title: 'Account Termination',
                    content: '• You may close your account at any time\n• We may terminate accounts for violations of these terms\n• Upon termination, you lose access to account-specific features\n• Some data may be retained as required by law\n• Outstanding orders and obligations remain valid after termination',
                },
            ],
        },
        {
            id: 'acceptable-use',
            title: 'Acceptable Use Policy',
            icon: 'shield-outline',
            important: true,
            content: 'You agree to use our services only for lawful purposes and in accordance with these terms. Prohibited activities include:',
            subsections: [
                {
                    id: 'prohibited-activities',
                    title: 'Prohibited Activities',
                    content: '• Violating any applicable laws or regulations\n• Infringing on intellectual property rights\n• Transmitting harmful or malicious code\n• Attempting to gain unauthorized access to our systems\n• Creating fake accounts or impersonating others\n• Engaging in fraudulent activities or money laundering',
                    highlight: true,
                },
                {
                    id: 'content-restrictions',
                    title: 'Content and Communication Restrictions',
                    content: '• Do not post offensive, discriminatory, or harmful content\n• Respect other users and our employees\n• Do not spam or send unsolicited communications\n• Do not share false or misleading information\n• Respect privacy of other users',
                },
                {
                    id: 'commercial-restrictions',
                    title: 'Commercial Use Restrictions',
                    content: '• Do not use our services for unauthorized commercial purposes\n• Do not resell or redistribute our services\n• Do not use automated tools without permission\n• Do not attempt to reverse engineer our systems\n• Respect our robots.txt and other technical limitations',
                },
            ],
        },
        {
            id: 'orders-payments',
            title: 'Orders, Payments, and Pricing',
            icon: 'card-outline',
            content: 'When you place an order through our services, the following terms apply:',
            subsections: [
                {
                    id: 'order-process',
                    title: 'Order Process and Acceptance',
                    content: '• Orders are subject to acceptance and availability\n• We may cancel orders due to pricing errors or product unavailability\n• Order confirmation does not guarantee acceptance\n• We reserve the right to limit quantities\n• Some products may have geographic restrictions',
                },
                {
                    id: 'pricing-terms',
                    title: 'Pricing and Payment Terms',
                    content: '• Prices are subject to change without notice\n• We strive for accuracy but errors may occur\n• Payment is due at time of order unless otherwise specified\n• We accept major credit cards, debit cards, and other specified payment methods\n• Sales tax will be added where applicable',
                    highlight: true,
                },
                {
                    id: 'delivery-terms',
                    title: 'Delivery and Risk of Loss',
                    content: '• Delivery times are estimates and not guaranteed\n• Risk of loss transfers upon delivery\n• You must inspect items upon receipt\n• Report damages or missing items within specified timeframes\n• Delivery may require signature confirmation',
                },
                {
                    id: 'returns-exchanges',
                    title: 'Returns and Exchanges',
                    content: '• Most items can be returned within 90 days\n• Some items have different return policies\n• Items must be in original condition for return\n• Return shipping may be charged unless item is defective\n• Refunds will be processed to original payment method',
                },
            ],
        },
        {
            id: 'intellectual-property',
            title: 'Intellectual Property Rights',
            icon: 'document-lock-outline',
            content: 'Our services contain proprietary content protected by intellectual property laws:',
            subsections: [
                {
                    id: 'walmart-ip',
                    title: 'Walmart Intellectual Property',
                    content: '• All content, trademarks, and service marks are owned by Walmart or our licensors\n• You may not use our trademarks without written permission\n• The Walmart name, logo, and spark design are registered trademarks\n• Product descriptions and images are protected by copyright\n• Our software and technology are proprietary',
                },
                {
                    id: 'user-content',
                    title: 'User-Generated Content',
                    content: '• You retain ownership of content you submit\n• You grant us a license to use, display, and distribute your content\n• You represent that you have rights to submit the content\n• We may remove content that violates these terms\n• You are responsible for your content and its legality',
                },
                {
                    id: 'dmca-policy',
                    title: 'Copyright Infringement Policy',
                    content: '• We respect intellectual property rights of others\n• Report copyright infringement to our designated agent\n• We will remove infringing content upon valid notice\n• Repeat infringers may have accounts terminated\n• False claims may result in liability for damages',
                },
            ],
        },
        {
            id: 'privacy-data',
            title: 'Privacy and Data Protection',
            icon: 'lock-closed-outline',
            content: 'Your privacy is important to us. Our data practices are governed by our Privacy Policy:',
            subsections: [
                {
                    id: 'data-collection',
                    title: 'Data Collection and Use',
                    content: '• We collect information as described in our Privacy Policy\n• Data is used to provide and improve our services\n• We implement security measures to protect your information\n• You have rights regarding your personal data\n• We comply with applicable privacy laws',
                },
                {
                    id: 'cookies-tracking',
                    title: 'Cookies and Tracking',
                    content: '• We use cookies and similar technologies\n• You can control cookie settings in your browser\n• Some features may require cookies to function\n• We may use analytics and advertising technologies\n• Third parties may also use tracking technologies',
                },
                {
                    id: 'data-sharing',
                    title: 'Data Sharing and Third Parties',
                    content: '• We may share data with service providers\n• Data may be shared for legal compliance\n• We do not sell personal information to third parties\n• Business transfers may involve data transfer\n• International transfers are protected by appropriate safeguards',
                },
            ],
        },
        {
            id: 'disclaimers-warranties',
            title: 'Disclaimers and Warranties',
            icon: 'warning-outline',
            important: true,
            content: 'Our services are provided "as is" and "as available" without warranties of any kind:',
            subsections: [
                {
                    id: 'service-disclaimers',
                    title: 'Service Availability and Performance',
                    content: '• We do not guarantee uninterrupted or error-free service\n• Services may be temporarily unavailable for maintenance\n• We disclaim warranties of merchantability and fitness for purpose\n• Third-party services are not under our control\n• Information may not always be accurate or current',
                    highlight: true,
                },
                {
                    id: 'product-disclaimers',
                    title: 'Product Information and Quality',
                    content: '• Product descriptions are provided by manufacturers or suppliers\n• We strive for accuracy but cannot guarantee completeness\n• Colors and images may vary from actual products\n• Third-party seller products are subject to their own terms\n• We disclaim liability for product defects beyond our control',
                },
                {
                    id: 'third-party-disclaimers',
                    title: 'Third-Party Content and Services',
                    content: '• Third-party content is not endorsed by Walmart\n• External links are provided for convenience only\n• We are not responsible for third-party practices\n• Third-party terms and policies apply to their services\n• Use third-party services at your own risk',
                },
            ],
        },
        {
            id: 'limitation-liability',
            title: 'Limitation of Liability',
            icon: 'shield-checkmark-outline',
            important: true,
            content: 'To the maximum extent permitted by law, Walmart limits its liability as follows:',
            subsections: [
                {
                    id: 'liability-exclusions',
                    title: 'Exclusion of Damages',
                    content: '• We exclude liability for indirect, incidental, or consequential damages\n• This includes loss of profits, data, or business opportunities\n• Punitive and exemplary damages are excluded\n• Some jurisdictions may not allow these exclusions\n• Our total liability is limited to the amount you paid for the service',
                    highlight: true,
                },
                {
                    id: 'liability-caps',
                    title: 'Liability Limitations',
                    content: '• Our maximum liability for any claim is $100 or the amount you paid, whichever is greater\n• This applies regardless of the theory of liability\n• Limitations apply even if we have been advised of potential damages\n• Some states may not allow liability limitations\n• These limitations do not apply to personal injury caused by our negligence',
                },
                {
                    id: 'indemnification',
                    title: 'User Indemnification',
                    content: '• You agree to indemnify Walmart against claims arising from your use\n• This includes claims related to your violation of these terms\n• You will defend, indemnify, and hold us harmless\n• This includes reasonable attorneys\' fees and costs\n• Indemnification survives termination of these terms',
                },
            ],
        },
        {
            id: 'dispute-resolution',
            title: 'Dispute Resolution and Arbitration',
            icon: 'balance-outline',
            important: true,
            content: 'Disputes arising from these terms or our services will be resolved as follows:',
            subsections: [
                {
                    id: 'informal-resolution',
                    title: 'Informal Dispute Resolution',
                    content: '• Contact customer service first to resolve disputes informally\n• We will work in good faith to resolve issues\n• Many disputes can be resolved quickly through customer service\n• Provide specific details about your concern\n• Allow reasonable time for resolution attempts',
                },
                {
                    id: 'binding-arbitration',
                    title: 'Binding Arbitration',
                    content: '• Disputes that cannot be resolved informally will go to arbitration\n• Arbitration will be conducted by the American Arbitration Association\n• Arbitration is binding and final\n• You waive the right to jury trial\n• Class action lawsuits are not permitted',
                    highlight: true,
                },
                {
                    id: 'arbitration-procedures',
                    title: 'Arbitration Procedures',
                    content: '• Arbitration will be conducted under AAA Consumer Arbitration Rules\n• Location will be in your state of residence or Arkansas\n• We will pay arbitration fees for claims under $75,000\n• Discovery will be limited to keep costs reasonable\n• Arbitrator may award attorney fees in exceptional cases',
                },
                {
                    id: 'exceptions-arbitration',
                    title: 'Exceptions to Arbitration',
                    content: '• Small claims court disputes (under jurisdictional limits)\n• Intellectual property disputes\n• Injunctive relief for terms violations\n• Individual basis only (no class actions)\n• 30-day opt-out period for arbitration',
                },
            ],
        },
        {
            id: 'general-provisions',
            title: 'General Provisions',
            icon: 'document-outline',
            content: 'Additional terms that govern your use of our services:',
            subsections: [
                {
                    id: 'governing-law',
                    title: 'Governing Law and Jurisdiction',
                    content: '• These terms are governed by Arkansas law\n• Federal law applies where applicable\n• Venue for non-arbitrated disputes is in Arkansas\n• You consent to jurisdiction in Arkansas courts\n• Arkansas law applies regardless of conflict of law principles',
                },
                {
                    id: 'modifications',
                    title: 'Modifications to Terms',
                    content: '• We may update these terms from time to time\n• Changes will be posted with an updated effective date\n• Continued use constitutes acceptance of changes\n• We may notify you of significant changes\n• You should review terms periodically',
                },
                {
                    id: 'severability',
                    title: 'Severability and Waiver',
                    content: '• If any provision is invalid, the remainder remains in effect\n• Invalid provisions will be modified to be enforceable\n• Our failure to enforce terms does not waive our rights\n• Waivers must be in writing to be effective\n• These terms cannot be assigned by you without our consent',
                },
                {
                    id: 'entire-agreement',
                    title: 'Entire Agreement',
                    content: '• These terms constitute the complete agreement\n• They supersede all prior agreements and communications\n• Additional terms may apply to specific services\n• No oral modifications are valid\n• Only authorized Walmart representatives can modify terms',
                },
            ],
        },
        {
            id: 'contact-information',
            title: 'Contact Information and Support',
            icon: 'call-outline',
            content: 'For questions about these terms or our services, contact us through:',
            subsections: [
                {
                    id: 'customer-service',
                    title: 'Customer Service',
                    content: 'Phone: 1-800-WALMART (1-800-925-6278)\nEmail: help@walmart.com\nLive Chat: Available 24/7 in the app\nSupport Hours: 24 hours a day, 7 days a week',
                },
                {
                    id: 'legal-notices',
                    title: 'Legal Notices and Correspondence',
                    content: 'Legal Department\nWalmart Inc.\n702 SW 8th Street\nBentonville, AR 72716\nEmail: legal@walmart.com',
                },
                {
                    id: 'accessibility',
                    title: 'Accessibility Support',
                    content: 'We are committed to making our services accessible to everyone. For accessibility assistance:\nEmail: accessibility@walmart.com\nPhone: 1-800-WALMART\nOnline: walmart.com/accessibility',
                },
            ],
        },
    ];

    const generateTableOfContents = (): TableOfContentsItem[] => {
        const toc: TableOfContentsItem[] = [];

        termsSections.forEach(section => {
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
        setActiveSection(sectionId);
        setShowTableOfContents(false);
        console.log(`Scrolling to section: ${sectionId}`);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Walmart Terms of Service - Read our terms and conditions',
                url: 'https://www.walmart.com/terms-of-use',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handlePrint = () => {
        Alert.alert(
            'Print Terms of Service',
            'Would you like to open these terms in your browser for printing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open in Browser',
                    onPress: () => Linking.openURL('https://www.walmart.com/terms-of-use')
                },
            ]
        );
    };

    const handleContactLegal = () => {
        Alert.alert(
            'Contact Legal Department',
            'How would you like to contact our Legal Department?',
            [
                { text: 'Email', onPress: () => Linking.openURL('mailto:legal@walmart.com') },
                { text: 'Customer Service', onPress: () => Linking.openURL('tel:18009256278') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleAcceptTerms = () => {
        setAcceptedTerms(!acceptedTerms);
        if (!acceptedTerms) {
            Alert.alert(
                'Terms Accepted',
                'Thank you for accepting our Terms of Service. You can continue using our services.',
                [{ text: 'OK' }]
            );
        }
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
                <Text style={styles.headerTitle}>Terms of Service</Text>
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
                {/* Terms Header */}
                <View style={styles.termsHeader}>
                    <View style={styles.termsHeaderIcon}>
                        <Ionicons name="document-text" size={32} color="#0071ce" />
                    </View>
                    <Text style={styles.termsTitle}>Walmart Terms of Service</Text>
                    <Text style={styles.termsSubtitle}>
                        These terms govern your use of Walmart's services. Please read them carefully as they contain important information about your rights and obligations.
                    </Text>

                    <View style={styles.termsDates}>
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
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleContactLegal}>
                            <Ionicons name="mail-outline" size={16} color="#0071ce" />
                            <Text style={styles.quickActionText}>Contact Legal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handlePrint}>
                            <Ionicons name="print-outline" size={16} color="#0071ce" />
                            <Text style={styles.quickActionText}>Print Terms</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Important Notice */}
                <View style={styles.importantNotice}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="warning" size={24} color="#FF9800" />
                        <Text style={styles.noticeTitle}>Important Notice</Text>
                    </View>
                    <Text style={styles.noticeText}>
                        These terms contain a binding arbitration clause and class action waiver that affect your legal rights.
                        Please review Section 9 (Dispute Resolution) carefully.
                    </Text>
                </View>

                {/* Terms Sections */}
                {termsSections.map((section, index) => (
                    <View key={section.id} style={[
                        styles.section,
                        section.important && styles.importantSection,
                    ]}>
                        <View style={styles.sectionHeader}>
                            <View style={[
                                styles.sectionIcon,
                                section.important && styles.importantSectionIcon,
                            ]}>
                                <Ionicons
                                    name={section.icon}
                                    size={24}
                                    color={section.important ? "#FF5722" : "#0071ce"}
                                />
                            </View>
                            <View style={styles.sectionHeaderText}>
                                <Text style={styles.sectionNumber}>{index + 1}.</Text>
                                <Text style={[
                                    styles.sectionTitle,
                                    section.important && styles.importantSectionTitle,
                                ]}>
                                    {section.title}
                                </Text>
                            </View>
                            {section.important && (
                                <View style={styles.importantBadge}>
                                    <Text style={styles.importantBadgeText}>Important</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.sectionContent}>{section.content}</Text>

                        {section.subsections && (
                            <View style={styles.subsections}>
                                {section.subsections.map((subsection, subIndex) => (
                                    <View key={subsection.id} style={[
                                        styles.subsection,
                                        subsection.highlight && styles.highlightedSubsection,
                                    ]}>
                                        <Text style={styles.subsectionTitle}>
                                            {index + 1}.{subIndex + 1} {subsection.title}
                                        </Text>
                                        <Text style={styles.subsectionContent}>{subsection.content}</Text>
                                        {subsection.highlight && (
                                            <View style={styles.highlightBadge}>
                                                <Ionicons name="star" size={12} color="#FF9800" />
                                                <Text style={styles.highlightBadgeText}>Key Provision</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {/* Acceptance Section */}
                <View style={styles.acceptanceSection}>
                    <View style={styles.acceptanceHeader}>
                        <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                        <Text style={styles.acceptanceTitle}>Agreement Acknowledgment</Text>
                    </View>

                    <Text style={styles.acceptanceText}>
                        By using Walmart's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.acceptanceButton,
                            acceptedTerms && styles.acceptanceButtonAccepted,
                        ]}
                        onPress={handleAcceptTerms}
                    >
                        <Ionicons
                            name={acceptedTerms ? "checkmark-circle" : "ellipse-outline"}
                            size={20}
                            color={acceptedTerms ? "white" : "#666"}
                        />
                        <Text style={[
                            styles.acceptanceButtonText,
                            acceptedTerms && styles.acceptanceButtonTextAccepted,
                        ]}>
                            {acceptedTerms ? "Terms Accepted" : "I Accept These Terms"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerSection}>
                        <Text style={styles.footerTitle}>Questions About These Terms?</Text>
                        <Text style={styles.footerText}>
                            If you have any questions about these Terms of Service or need clarification
                            on any provisions, please contact our Legal Department or Customer Service.
                        </Text>
                        <TouchableOpacity style={styles.footerButton} onPress={handleContactLegal}>
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
                            These terms are effective as of the date shown above and supersede all previous versions.
                            Walmart reserves the right to update these terms at any time.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default TermsOfServiceScreen;

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
    termsHeader: {
        backgroundColor: 'white',
        padding: 24,
        alignItems: 'center',
    },
    termsHeaderIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    termsTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    termsSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    termsDates: {
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
    importantNotice: {
        backgroundColor: '#fff3e0',
        margin: 16,
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF9800',
        marginLeft: 8,
    },
    noticeText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
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
    importantSection: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF5722',
        backgroundColor: '#fef7f0',
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
    importantSectionIcon: {
        backgroundColor: '#ffebee',
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
    importantSectionTitle: {
        color: '#FF5722',
    },
    importantBadge: {
        backgroundColor: '#FF5722',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    importantBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
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
    highlightedSubsection: {
        backgroundColor: '#fff9c4',
        borderLeftColor: '#FF9800',
        borderRadius: 8,
        padding: 12,
        marginLeft: -4,
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
    highlightBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    highlightBadgeText: {
        fontSize: 12,
        color: '#FF9800',
        fontWeight: '500',
        marginLeft: 4,
    },
    acceptanceSection: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    acceptanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    acceptanceTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    acceptanceText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    acceptanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    acceptanceButtonAccepted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    acceptanceButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
        marginLeft: 8,
    },
    acceptanceButtonTextAccepted: {
        color: 'white',
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