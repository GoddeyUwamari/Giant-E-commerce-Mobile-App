import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    showCart?: boolean;
    showBack?: boolean;
    showLogo?: boolean;
    onSearch?: (query: string) => void;
    cartItemCount?: number;
    backgroundColor?: string;
    textColor?: string;
    showNotifications?: boolean;
    notificationCount?: number;
    searchPlaceholder?: string;
    rightComponent?: React.ReactNode;
    leftComponent?: React.ReactNode;
    transparent?: boolean;
    blurred?: boolean;
    sticky?: boolean;
}

export default function Header({
                                   title,
                                   showSearch = false,
                                   showCart = true,
                                   showBack = false,
                                   showLogo = false,
                                   onSearch,
                                   cartItemCount = 0,
                                   backgroundColor = '#FFFFFF',
                                   textColor = '#111827',
                                   showNotifications = false,
                                   notificationCount = 0,
                                   searchPlaceholder = 'Search products...',
                                   rightComponent,
                                   leftComponent,
                                   transparent = false,
                                   blurred = false,
                                   sticky = false,
                               }: HeaderProps): JSX.Element {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        loadRecentSearches();
    }, []);

    const loadRecentSearches = async () => {
        try {
            const searches = await AsyncStorage.getItem('recent_searches');
            if (searches) {
                setRecentSearches(JSON.parse(searches));
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const saveRecentSearch = async (query: string) => {
        try {
            const trimmedQuery = query.trim();
            if (!trimmedQuery) return;

            let searches = [...recentSearches];

            // Remove existing occurrence
            searches = searches.filter(search => search.toLowerCase() !== trimmedQuery.toLowerCase());

            // Add to beginning
            searches.unshift(trimmedQuery);

            // Keep only last 10 searches
            searches = searches.slice(0, 10);

            setRecentSearches(searches);
            await AsyncStorage.setItem('recent_searches', JSON.stringify(searches));
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const handleSearch = (query: string) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            saveRecentSearch(trimmedQuery);
            onSearch?.(trimmedQuery);
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        }
    };

    const handleCartPress = () => {
        router.push('/(modals)/cart');
    };

    const handleNotificationPress = () => {
        router.push('/(modals)/notifications');
    };

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/(tabs)');
        }
    };

    const handleLogoPress = () => {
        router.push('/(tabs)');
    };

    const renderLogo = () => (
        <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
            <View style={styles.logoIcon}>
                <Text style={styles.logoText}>W</Text>
            </View>
            <Text style={styles.logoTitle}>Walmart</Text>
        </TouchableOpacity>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={[
                styles.searchBar,
                isSearchFocused && styles.searchBarFocused
            ]}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onSubmitEditing={() => handleSearch(searchQuery)}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                    >
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => handleSearch(searchQuery)}
                        style={styles.searchButton}
                    >
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderBadge = (count: number) => {
        if (count <= 0) return null;

        return (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>
                    {count > 99 ? '99+' : count.toString()}
                </Text>
            </View>
        );
    };

    const renderRightActions = () => (
        <View style={styles.rightActionsContainer}>
            {showNotifications && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleNotificationPress}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="notifications-outline" size={24} color={textColor} />
                        {renderBadge(notificationCount)}
                    </View>
                </TouchableOpacity>
            )}

            {showCart && (
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={handleCartPress}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="bag-outline" size={24} color={textColor} />
                        {renderBadge(cartItemCount)}
                    </View>
                </TouchableOpacity>
            )}

            {rightComponent}
        </View>
    );

    const renderLeftSection = () => {
        if (leftComponent) return leftComponent;

        if (showBack) {
            return (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                >
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
            );
        }

        if (showLogo) {
            return renderLogo();
        }

        return null;
    };

    const renderTitle = () => {
        if (!title || showSearch || showLogo) return null;

        return (
            <View style={styles.titleContainer}>
                <Text
                    style={[styles.titleText, { color: textColor }]}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </View>
        );
    };

    const headerContent = (
        <View style={styles.headerContent}>
            {renderLeftSection()}
            {showSearch ? renderSearchBar() : renderTitle()}
            {renderRightActions()}
        </View>
    );

    if (transparent || blurred) {
        return (
            <View style={sticky ? styles.stickyContainer : undefined}>
                <StatusBar
                    barStyle={transparent ? 'light-content' : 'dark-content'}
                    backgroundColor="transparent"
                    translucent
                />
                <SafeAreaView>
                    {blurred ? (
                        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
                            {headerContent}
                        </BlurView>
                    ) : (
                        <View style={{
                            backgroundColor: transparent ? 'transparent' : backgroundColor
                        }}>
                            {headerContent}
                        </View>
                    )}
                </SafeAreaView>
            </View>
        );
    }

    return (
        <SafeAreaView
            style={[
                { backgroundColor },
                sticky && styles.stickyContainer
            ]}
        >
            <StatusBar
                barStyle={backgroundColor === '#FFFFFF' ? 'dark-content' : 'light-content'}
                backgroundColor={backgroundColor}
            />
            <View style={[styles.headerContainer, { backgroundColor }]}>
                {headerContent}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Main Container Styles
    headerContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 56,
    },
    stickyContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    blurContainer: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(229, 231, 235, 0.5)',
    },

    // Logo Styles
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#0071CE',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    logoText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    logoTitle: {
        color: '#0071CE',
        fontWeight: 'bold',
        fontSize: 20,
        letterSpacing: -0.5,
    },

    // Search Bar Styles
    searchContainer: {
        flex: 1,
        marginHorizontal: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchBarFocused: {
        backgroundColor: '#FFFFFF',
        borderColor: '#0071CE',
        shadowColor: '#0071CE',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: '#111827',
        fontSize: 16,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
    searchButton: {
        marginLeft: 8,
        backgroundColor: '#0071CE',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },

    // Title Styles
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: -0.3,
    },

    // Action Button Styles
    rightActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginRight: 4,
    },
    cartButton: {
        padding: 8,
    },
    backButton: {
        marginRight: 12,
        padding: 8,
    },
    iconContainer: {
        position: 'relative',
    },

    // Badge Styles
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});