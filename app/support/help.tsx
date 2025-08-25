import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
    Platform,
    Animated,
    LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    helpful: number;
    notHelpful: number;
    tags: string[];
}

interface HelpCategory {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    description: string;
    itemCount: number;
}

interface GuideStep {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const HelpScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [userFeedback, setUserFeedback] = useState<{[key: string]: 'helpful' | 'not-helpful' | null}>({});
    const [fadeAnim] = useState(new Animated.Value(1));

    const helpCategories: HelpCategory[] = [
        {
            id: 'all',
            title: 'All Topics',
            icon: 'apps-outline',
            color: '#0071ce',
            description: 'Browse all help topics',
            itemCount: 45,
        },
        {
            id: 'account',
            title: 'Account & Profile',
            icon: 'person-outline',
            color: '#4CAF50',
            description: 'Account settings, profile, login issues',
            itemCount: 8,
        },
        {
            id: 'orders',
            title: 'Orders & Shipping',
            icon: 'cube-outline',
            color: '#FF9800',
            description: 'Order tracking, delivery, pickup',
            itemCount: 12,
        },
        {
            id: 'payment',
            title: 'Payment & Billing',
            icon: 'card-outline',
            color: '#9C27B0',
            description: 'Payment methods, billing, refunds',
            itemCount: 7,
        },
        {
            id: 'returns',
            title: 'Returns & Exchanges',
            icon: 'return-up-back-outline',
            color: '#FF5722',
            description: 'Return policy, exchanges, refunds',
            itemCount: 6,
        },
        {
            id: 'app',
            title: 'App & Technical',
            icon: 'phone-portrait-outline',
            color: '#607D8B',
            description: 'App issues, bugs, troubleshooting',
            itemCount: 9,
        },
        {
            id: 'walmart-plus',
            title: 'Walmart+',
            icon: 'star-outline',
            color: '#FFC107',
            description: 'Membership benefits, subscription',
            itemCount: 3,
        },
    ];

    const faqData: FAQItem[] = [
        {
            id: '1',
            question: 'How do I track my order?',
            answer: 'You can track your order by going to "Account" > "Purchase History" and selecting your order. You\'ll see real-time tracking information including estimated delivery time. You can also use the order number to track via the main search bar.',
            category: 'orders',
            helpful: 156,
            notHelpful: 8,
            tags: ['tracking', 'delivery', 'order status'],
        },
        {
            id: '2',
            question: 'What is Walmart+ and how much does it cost?',
            answer: 'Walmart+ is our membership program that costs $12.95/month or $98/year. Benefits include free unlimited delivery, member prices on fuel, mobile scan & go, and early access to special offers and events.',
            category: 'walmart-plus',
            helpful: 203,
            notHelpful: 12,
            tags: ['membership', 'subscription', 'benefits'],
        },
        {
            id: '3',
            question: 'How do I return an item I purchased online?',
            answer: 'You can return most items within 90 days. Start a return in the app by going to "Account" > "Purchase History" > select item > "Return". You can return to any Walmart store or schedule a pickup. Some items have different return policies.',
            category: 'returns',
            helpful: 189,
            notHelpful: 15,
            tags: ['return', 'refund', 'exchange'],
        },
        {
            id: '4',
            question: 'Why can\'t I log into my account?',
            answer: 'If you\'re having trouble logging in, try resetting your password by tapping "Forgot Password" on the login screen. Make sure you\'re using the correct email or phone number. Clear the app cache or try logging in via a web browser if issues persist.',
            category: 'account',
            helpful: 145,
            notHelpful: 23,
            tags: ['login', 'password', 'account access'],
        },
        {
            id: '5',
            question: 'How do I add or change my payment method?',
            answer: 'Go to "Account" > "Payment Methods" to add, edit, or remove payment options. We accept major credit cards, debit cards, PayPal, and Walmart Pay. You can also manage your payment methods during checkout.',
            category: 'payment',
            helpful: 167,
            notHelpful: 9,
            tags: ['payment', 'credit card', 'billing'],
        },
        {
            id: '6',
            question: 'What are the delivery options available?',
            answer: 'We offer standard delivery (3-5 business days), express delivery (1-2 days), and same-day delivery in select areas. Walmart+ members get free unlimited delivery on orders over $35. Pickup is also available at most stores.',
            category: 'orders',
            helpful: 178,
            notHelpful: 11,
            tags: ['delivery', 'shipping', 'pickup'],
        },
        {
            id: '7',
            question: 'The app keeps crashing. What should I do?',
            answer: 'Try these steps: 1) Force close and restart the app, 2) Update to the latest version, 3) Restart your device, 4) Clear app cache in device settings, 5) Uninstall and reinstall the app. Contact support if issues continue.',
            category: 'app',
            helpful: 134,
            notHelpful: 18,
            tags: ['crash', 'bug', 'technical issue'],
        },
        {
            id: '8',
            question: 'How do I cancel an order?',
            answer: 'You can cancel most orders before they ship by going to "Account" > "Purchase History" and selecting "Cancel Items". If your order has already shipped, you\'ll need to return it once delivered. Cancellation options vary by item type.',
            category: 'orders',
            helpful: 156,
            notHelpful: 7,
            tags: ['cancel', 'order', 'refund'],
        },
    ];

    const quickGuides = [
        {
            id: 'setup-account',
            title: 'Setting Up Your Account',
            steps: [
                { id: '1', title: 'Download the App', description: 'Get the Walmart app from your app store', icon: 'download-outline' as keyof typeof Ionicons.glyphMap },
                { id: '2', title: 'Create Account', description: 'Tap "Sign Up" and enter your information', icon: 'person-add-outline' as keyof typeof Ionicons.glyphMap },
                { id: '3', title: 'Verify Email', description: 'Check your email and verify your account', icon: 'mail-outline' as keyof typeof Ionicons.glyphMap },
                { id: '4', title: 'Start Shopping', description: 'Browse products and add to cart', icon: 'cart-outline' as keyof typeof Ionicons.glyphMap },
            ],
        },
        {
            id: 'place-order',
            title: 'How to Place an Order',
            steps: [
                { id: '1', title: 'Search Products', description: 'Use search or browse categories', icon: 'search-outline' as keyof typeof Ionicons.glyphMap },
                { id: '2', title: 'Add to Cart', description: 'Select items and add to your cart', icon: 'add-circle-outline' as keyof typeof Ionicons.glyphMap },
                { id: '3', title: 'Choose Delivery', description: 'Select delivery or pickup option', icon: 'location-outline' as keyof typeof Ionicons.glyphMap },
                { id: '4', title: 'Complete Payment', description: 'Enter payment details and place order', icon: 'card-outline' as keyof typeof Ionicons.glyphMap },
            ],
        },
    ];

    useEffect(() => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
    }, [expandedFAQ]);

    const filteredFAQs = faqData.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    const handleFAQPress = (faqId: string) => {
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
    };

    const handleFeedback = (faqId: string, feedback: 'helpful' | 'not-helpful') => {
        setUserFeedback(prev => ({
            ...prev,
            [faqId]: feedback,
        }));

        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.5,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        Alert.alert(
            'Thank you!',
            `Your feedback helps us improve our help content.`,
            [{ text: 'OK' }]
        );
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'Choose how you\'d like to get help:',
            [
                { text: 'Live Chat', onPress: () => router.push('/support/chat') },
                { text: 'Call Support', onPress: () => router.push('/support/contact') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const renderGuideStep = (step: GuideStep, index: number, isLast: boolean) => (
        <View key={step.id} style={styles.guideStep}>
            <View style={styles.guideStepHeader}>
                <View style={styles.guideStepIcon}>
                    <Ionicons name={step.icon} size={20} color="#0071ce" />
                </View>
                <View style={styles.guideStepContent}>
                    <Text style={styles.guideStepTitle}>{step.title}</Text>
                    <Text style={styles.guideStepDescription}>{step.description}</Text>
                </View>
                <View style={styles.guideStepNumber}>
                    <Text style={styles.guideStepNumberText}>{index + 1}</Text>
                </View>
            </View>
            {!isLast && <View style={styles.guideStepConnector} />}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0071ce" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                    <Ionicons name="headset-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search Section */}
                <View style={styles.searchSection}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search help topics..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Popular Searches */}
                {searchQuery === '' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Popular Searches</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.popularSearches}>
                                {['Track order', 'Return item', 'Payment help', 'Walmart+', 'Login issues'].map((search) => (
                                    <TouchableOpacity
                                        key={search}
                                        style={styles.popularSearchTag}
                                        onPress={() => setSearchQuery(search)}
                                    >
                                        <Text style={styles.popularSearchText}>{search}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Help Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoriesContainer}>
                            {helpCategories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryCard,
                                        selectedCategory === category.id && styles.categoryCardSelected,
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                                        <Ionicons name={category.icon} size={24} color="white" />
                                    </View>
                                    <Text style={styles.categoryTitle}>{category.title}</Text>
                                    <Text style={styles.categoryCount}>{category.itemCount} articles</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Quick Guides */}
                {searchQuery === '' && selectedCategory === 'all' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Step-by-Step Guides</Text>
                        {quickGuides.map((guide) => (
                            <View key={guide.id} style={styles.guideCard}>
                                <Text style={styles.guideTitle}>{guide.title}</Text>
                                <View style={styles.guideSteps}>
                                    {guide.steps.map((step, index) =>
                                        renderGuideStep(step, index, index === guide.steps.length - 1)
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* FAQ Section */}
                <View style={styles.section}>
                    <View style={styles.faqHeader}>
                        <Text style={styles.sectionTitle}>
                            {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Frequently Asked Questions'}
                        </Text>
                        {filteredFAQs.length === 0 && searchQuery && (
                            <Text style={styles.noResultsText}>
                                No results found. Try different keywords or contact support.
                            </Text>
                        )}
                    </View>

                    <Animated.View style={[styles.faqContainer, { opacity: fadeAnim }]}>
                        {filteredFAQs.map((faq) => (
                            <View key={faq.id} style={styles.faqItem}>
                                <TouchableOpacity
                                    style={styles.faqQuestion}
                                    onPress={() => handleFAQPress(faq.id)}
                                >
                                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                    <Ionicons
                                        name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>

                                {expandedFAQ === faq.id && (
                                    <View style={styles.faqAnswer}>
                                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>

                                        {/* Tags */}
                                        <View style={styles.faqTags}>
                                            {faq.tags.map((tag) => (
                                                <View key={tag} style={styles.faqTag}>
                                                    <Text style={styles.faqTagText}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Feedback */}
                                        <View style={styles.faqFeedback}>
                                            <Text style={styles.feedbackQuestion}>Was this helpful?</Text>
                                            <View style={styles.feedbackButtons}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.feedbackButton,
                                                        userFeedback[faq.id] === 'helpful' && styles.feedbackButtonSelected,
                                                    ]}
                                                    onPress={() => handleFeedback(faq.id, 'helpful')}
                                                >
                                                    <Ionicons
                                                        name="thumbs-up-outline"
                                                        size={16}
                                                        color={userFeedback[faq.id] === 'helpful' ? '#4CAF50' : '#666'}
                                                    />
                                                    <Text style={[
                                                        styles.feedbackButtonText,
                                                        userFeedback[faq.id] === 'helpful' && styles.feedbackButtonTextSelected,
                                                    ]}>
                                                        Yes ({faq.helpful})
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.feedbackButton,
                                                        userFeedback[faq.id] === 'not-helpful' && styles.feedbackButtonSelected,
                                                    ]}
                                                    onPress={() => handleFeedback(faq.id, 'not-helpful')}
                                                >
                                                    <Ionicons
                                                        name="thumbs-down-outline"
                                                        size={16}
                                                        color={userFeedback[faq.id] === 'not-helpful' ? '#F44336' : '#666'}
                                                    />
                                                    <Text style={[
                                                        styles.feedbackButtonText,
                                                        userFeedback[faq.id] === 'not-helpful' && styles.feedbackButtonTextSelected,
                                                    ]}>
                                                        No ({faq.notHelpful})
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}
                    </Animated.View>
                </View>

                {/* Still Need Help */}
                <View style={styles.section}>
                    <View style={styles.supportCard}>
                        <View style={styles.supportHeader}>
                            <Ionicons name="help-circle-outline" size={32} color="#0071ce" />
                            <View style={styles.supportHeaderText}>
                                <Text style={styles.supportTitle}>Still need help?</Text>
                                <Text style={styles.supportSubtitle}>
                                    Our support team is available 24/7 to assist you
                                </Text>
                            </View>
                        </View>

                        <View style={styles.supportActions}>
                            <TouchableOpacity style={styles.supportActionButton} onPress={() => router.push('/support/chat')}>
                                <Ionicons name="chatbubble-outline" size={20} color="white" />
                                <Text style={styles.supportActionText}>Live Chat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.supportActionButton, styles.supportActionButtonSecondary]} onPress={() => router.push('/support/contact')}>
                                <Ionicons name="call-outline" size={20} color="#0071ce" />
                                <Text style={[styles.supportActionText, styles.supportActionTextSecondary]}>Call Us</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Can't find what you're looking for? Send us feedback to help improve our help content.
                    </Text>
                    <TouchableOpacity style={styles.feedbackLink}>
                        <Text style={styles.feedbackLinkText}>Send Feedback</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HelpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#0071ce',
        paddingHorizontal: 16,
        paddingVertical: 16,
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
    contactButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    searchSection: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 4,
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    popularSearches: {
        flexDirection: 'row',
        paddingRight: 16,
    },
    popularSearchTag: {
        backgroundColor: '#e3f2fd',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#0071ce',
    },
    popularSearchText: {
        color: '#0071ce',
        fontSize: 14,
        fontWeight: '500',
    },
    categoriesContainer: {
        flexDirection: 'row',
        paddingRight: 16,
    },
    categoryCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 120,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryCardSelected: {
        backgroundColor: '#e3f2fd',
        borderWidth: 2,
        borderColor: '#0071ce',
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    guideCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    guideTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    guideSteps: {
        position: 'relative',
    },
    guideStep: {
        position: 'relative',
    },
    guideStepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    guideStepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    guideStepContent: {
        flex: 1,
    },
    guideStepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    guideStepDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    guideStepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0071ce',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideStepNumberText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    guideStepConnector: {
        position: 'absolute',
        left: 19,
        top: 40,
        bottom: -16,
        width: 2,
        backgroundColor: '#e0e0e0',
    },
    faqHeader: {
        marginBottom: 16,
    },
    noResultsText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8,
    },
    faqContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginRight: 12,
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    faqTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    faqTag: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    faqTagText: {
        fontSize: 12,
        color: '#666',
    },
    faqFeedback: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },



    feedbackQuestion: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    feedbackButtons: {
        flexDirection: 'row',
    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: '#f8f8f8',
    },
    feedbackButtonSelected: {
        backgroundColor: '#e3f2fd',
    },
    feedbackButtonText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    feedbackButtonTextSelected: {
        fontWeight: '600',
    },
    supportCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    supportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    supportHeaderText: {
        flex: 1,
        marginLeft: 16,
    },
    supportTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    supportSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    supportActions: {
        flexDirection: 'row',
    },
    supportActionButton: {
        flex: 1,
        backgroundColor: '#0071ce',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    supportActionButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#0071ce',
        marginRight: 0,
        marginLeft: 8,
    },
    supportActionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    supportActionTextSecondary: {
        color: '#0071ce',
    },
    footer: {
        backgroundColor: 'white',
        margin: 16,
        marginTop: 0,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 12,
    },
    feedbackLink: {
        paddingVertical: 8,
    },
    feedbackLinkText: {
        fontSize: 14,
        color: '#0071ce',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});