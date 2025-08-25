import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

// Import our AI hook and cart store
import { useAI } from '../../hooks/useAI';
import { useCartStore } from '../../store/slices/cartSlice';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: Date;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    isAI?: boolean;
}

interface SupportAgent {
    name: string;
    status: 'online' | 'typing' | 'away';
    avatar: string;
}

const ChatScreen: React.FC = () => {
    // Get search parameters from Expo Router
    const params = useLocalSearchParams<{
        supportAgentName?: string;
        supportAgentStatus?: 'online' | 'typing' | 'away';
        supportAgentAvatar?: string;
        chatId?: string;
    }>();

    // AI Hook
    const {
        chat,
        getShoppingAssistance,
        loading: aiLoading,
        error: aiError
    } = useAI();

    // Cart store for context
    const cartItems = useCartStore((state) => state.items);
    const cartSummary = useCartStore((state) => state.summary);

    // Chat conversation state for AI
    const [conversation, setConversation] = useState<Array<{role: 'user' | 'assistant'; content: string}>>([]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your AI-powered Walmart shopping assistant. I can help you with:\n\n• Product recommendations and questions\n• Order tracking and support\n• Finding deals and comparing items\n• Store information and services\n• Returns and refunds\n\nHow can I assist you today?',
            sender: 'support',
            timestamp: new Date(Date.now() - 60000),
            status: 'read',
            isAI: true,
        },
    ]);

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const supportAgent: SupportAgent = {
        name: params.supportAgentName || 'AI Assistant',
        status: (params.supportAgentStatus as 'online' | 'typing' | 'away') || 'online',
        avatar: params.supportAgentAvatar || '🤖',
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    // Handle back navigation
    const handleBackPress = () => {
        router.back();
    };

    // Navigate to different screens using Expo Router
    const navigateToOrders = () => {
        router.push('/orders');
    };

    const navigateToProfile = () => {
        router.push('/profile');
    };

    const navigateToHelp = () => {
        router.push('/support/help');
    };

    const sendMessage = async () => {
        if (inputText.trim() === '') return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date(),
            status: 'sending',
        };

        setMessages(prev => [...prev, userMessage]);
        const messageText = inputText.trim();
        setInputText('');

        // Update conversation history for AI
        const newConversation = [
            ...conversation,
            { role: 'user' as const, content: messageText }
        ];
        setConversation(newConversation);

        // Simulate message status updates
        setTimeout(() => {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
                )
            );
        }, 500);

        setTimeout(() => {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
                )
            );
        }, 1000);

        // Get AI response
        await getAIResponse(messageText, newConversation);
    };

    const getAIResponse = async (userMessage: string, currentConversation: Array<{role: 'user' | 'assistant'; content: string}>) => {
        setIsTyping(true);

        try {
            // Prepare context for the AI
            const context = {
                currentPage: 'chat',
                cartItems: cartItems,
                userProfile: { name: 'Customer' }, // You can get this from your user store
                currentProduct: null
            };

            // Get AI response using shopping assistance
            const aiResponse = await getShoppingAssistance(userMessage, context);

            if (aiResponse) {
                // Update conversation history
                const updatedConversation = [
                    ...currentConversation,
                    { role: 'assistant' as const, content: aiResponse }
                ];
                setConversation(updatedConversation);

                // Add AI message to chat
                const supportMessage: Message = {
                    id: Date.now().toString(),
                    text: aiResponse,
                    sender: 'support',
                    timestamp: new Date(),
                    status: 'read',
                    isAI: true,
                };

                setMessages(prev => [...prev, supportMessage]);
            } else {
                // Fallback response
                const fallbackMessage: Message = {
                    id: Date.now().toString(),
                    text: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our human support team for assistance.',
                    sender: 'support',
                    timestamp: new Date(),
                    status: 'read',
                    isAI: true,
                };

                setMessages(prev => [...prev, fallbackMessage]);
            }
        } catch (error) {
            console.error('AI response error:', error);

            // Error fallback message
            const errorMessage: Message = {
                id: Date.now().toString(),
                text: 'I\'m experiencing some technical difficulties. Would you like to try again or speak with a human representative?',
                sender: 'support',
                timestamp: new Date(),
                status: 'read',
                isAI: true,
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'sending':
                return <Ionicons name="time-outline" size={12} color="#999" />;
            case 'sent':
                return <Ionicons name="checkmark-outline" size={12} color="#999" />;
            case 'delivered':
                return <Ionicons name="checkmark-done-outline" size={12} color="#999" />;
            case 'read':
                return <Ionicons name="checkmark-done-outline" size={12} color="#0071ce" />;
            default:
                return null;
        }
    };

    const showQuickActions = () => {
        Alert.alert(
            'Quick Actions',
            'What would you like to do?',
            [
                {
                    text: 'Track Order',
                    onPress: () => navigateToOrders()
                },
                {
                    text: 'Return Item',
                    onPress: () => {
                        setInputText('I need help with returning an item');
                    }
                },
                {
                    text: 'Account Help',
                    onPress: () => navigateToProfile()
                },
                {
                    text: 'Clear Chat',
                    onPress: () => {
                        setMessages([{
                            id: '1',
                            text: 'Chat cleared! How can I help you today?',
                            sender: 'support',
                            timestamp: new Date(),
                            status: 'read',
                            isAI: true,
                        }]);
                        setConversation([]);
                    }
                },
                {
                    text: 'Human Support',
                    onPress: () => {
                        Alert.alert(
                            'Connect to Human Support',
                            'Would you like to be transferred to a human representative? This may take a few minutes.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Yes, Transfer Me',
                                    onPress: () => {
                                        const transferMessage: Message = {
                                            id: Date.now().toString(),
                                            text: 'I\'m connecting you to a human representative. Please hold while I transfer your chat...',
                                            sender: 'support',
                                            timestamp: new Date(),
                                            status: 'read',
                                            isAI: true,
                                        };
                                        setMessages(prev => [...prev, transferMessage]);
                                    }
                                },
                            ]
                        );
                    }
                },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const handleQuickReply = (text: string) => {
        setInputText(text);
    };

    // Enhanced quick replies with smart suggestions
    const getSmartQuickReplies = () => {
        const baseReplies = [
            'Track my order',
            'Find deals on electronics',
            'Help with returns',
            'Store locations near me'
        ];

        // Add context-aware suggestions based on cart
        if (cartItems.length > 0) {
            baseReplies.unshift('Questions about my cart');
        }

        return baseReplies;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StatusBar barStyle="light-content" backgroundColor="#0071ce" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <View style={styles.agentInfo}>
                            <Text style={styles.agentAvatar}>{supportAgent.avatar}</Text>
                            <View>
                                <Text style={styles.agentName}>{supportAgent.name}</Text>
                                <View style={styles.statusContainer}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: supportAgent.status === 'online' ? '#4CAF50' : '#FFC107' }
                                    ]} />
                                    <Text style={styles.statusText}>
                                        {isTyping ? 'Thinking...' : 'AI-Powered Support'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.moreButton} onPress={showQuickActions}>
                        <Ionicons name="ellipsis-vertical" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageWrapper,
                                message.sender === 'user' ? styles.userMessageWrapper : styles.supportMessageWrapper,
                            ]}
                        >
                            {message.sender === 'support' && (
                                <Text style={styles.messageAvatar}>{supportAgent.avatar}</Text>
                            )}

                            <View
                                style={[
                                    styles.messageBubble,
                                    message.sender === 'user' ? styles.userMessage : styles.supportMessage,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.messageText,
                                        message.sender === 'user' ? styles.userMessageText : styles.supportMessageText,
                                    ]}
                                >
                                    {message.text}
                                </Text>

                                <View style={styles.messageFooter}>
                                    <Text style={styles.messageTime}>
                                        {formatTime(message.timestamp)}
                                    </Text>
                                    {message.isAI && message.sender === 'support' && (
                                        <View style={styles.aiIndicator}>
                                            <Ionicons name="sparkles" size={10} color="#0071ce" />
                                        </View>
                                    )}
                                    {message.sender === 'user' && getStatusIcon(message.status)}
                                </View>
                            </View>
                        </View>
                    ))}

                    {(isTyping || aiLoading) && (
                        <View style={styles.typingIndicator}>
                            <Text style={styles.messageAvatar}>{supportAgent.avatar}</Text>
                            <View style={styles.typingBubble}>
                                <View style={styles.typingDots}>
                                    <ActivityIndicator size="small" color="#0071ce" />
                                    <Text style={styles.typingText}>AI is thinking...</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {aiError && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning" size={16} color="#ff6b6b" />
                            <Text style={styles.errorText}>Connection issue. Trying again...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Smart Quick Reply Suggestions */}
                <View style={styles.quickReplies}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {getSmartQuickReplies().map((reply, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickReplyButton}
                                onPress={() => handleQuickReply(reply)}
                            >
                                <Text style={styles.quickReplyText}>{reply}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity style={styles.attachButton}>
                            <Ionicons name="add-circle-outline" size={24} color="#666" />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask me anything about shopping at Walmart..."
                            placeholderTextColor="#999"
                            multiline
                            maxLength={500}
                            editable={!aiLoading && !isTyping}
                        />

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (inputText.trim() && !aiLoading && !isTyping) ? styles.sendButtonActive : null
                            ]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || aiLoading || isTyping}
                        >
                            {aiLoading || isTyping ? (
                                <ActivityIndicator size="small" color="#999" />
                            ) : (
                                <Ionicons
                                    name="paper-plane"
                                    size={20}
                                    color={inputText.trim() ? 'white' : '#999'}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    // ... (keeping all your existing styles)
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardContainer: {
        flex: 1,
    },
    header: {
        backgroundColor: '#0071ce',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerInfo: {
        flex: 1,
    },
    agentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    agentAvatar: {
        fontSize: 24,
        marginRight: 12,
    },
    agentName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    moreButton: {
        padding: 8,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageWrapper: {
        marginBottom: 16,
        flexDirection: 'row',
    },
    userMessageWrapper: {
        justifyContent: 'flex-end',
    },
    supportMessageWrapper: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        fontSize: 18,
        marginRight: 8,
        marginTop: 4,
    },
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userMessage: {
        backgroundColor: '#0071ce',
        borderBottomRightRadius: 6,
    },
    supportMessage: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 6,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: 'white',
    },
    supportMessageText: {
        color: '#333',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginRight: 4,
    },
    // New AI-specific styles
    aiIndicator: {
        marginLeft: 4,
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    typingBubble: {
        backgroundColor: 'white',
        borderRadius: 20,
        borderBottomLeftRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        marginLeft: 8,
        color: '#0071ce',
        fontSize: 14,
        fontStyle: 'italic',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    errorText: {
        marginLeft: 8,
        color: '#ff6b6b',
        fontSize: 14,
    },
    quickReplies: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    quickReplyButton: {
        backgroundColor: '#f0f8ff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#0071ce',
    },
    quickReplyText: {
        color: '#0071ce',
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#f8f8f8',
        borderRadius: 24,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    attachButton: {
        padding: 8,
    },
    textInput: {
        flex: 1,
        minHeight: 36,
        maxHeight: 100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
    },
    sendButtonActive: {
        backgroundColor: '#0071ce',
    },
});