import React from 'react';
import {
    View,
    StatusBar,
    Platform,
    ViewStyle,
    StyleSheet,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
    children: React.ReactNode;
    backgroundColor?: string;
    statusBarStyle?: 'default' | 'light-content' | 'dark-content';
    statusBarBackgroundColor?: string;
    statusBarTranslucent?: boolean;
    edges?: ('top' | 'right' | 'bottom' | 'left')[];
    mode?: 'padding' | 'margin';
    style?: ViewStyle;
    forceInsets?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
    walmartTheme?: boolean;
}

function SafeAreaContent({
                             children,
                             backgroundColor = '#FFFFFF',
                             statusBarStyle = 'dark-content',
                             statusBarBackgroundColor,
                             statusBarTranslucent = false,
                             edges = ['top', 'right', 'bottom', 'left'],
                             mode = 'padding',
                             style,
                             forceInsets,
                             walmartTheme = true,
                         }: SafeAreaWrapperProps): JSX.Element {
    const insets = useSafeAreaInsets();

    // Apply Walmart theme colors if enabled
    const themeBackgroundColor = walmartTheme && backgroundColor === '#FFFFFF'
        ? styles.walmartBackground.backgroundColor
        : backgroundColor;

    const themeStatusBarColor = walmartTheme && statusBarBackgroundColor === undefined
        ? themeBackgroundColor
        : statusBarBackgroundColor || backgroundColor;

    // Calculate insets based on mode and forced values
    const getInsets = () => {
        const calculatedInsets = {
            paddingTop: edges.includes('top') ? (forceInsets?.top ?? insets.top) : 0,
            paddingRight: edges.includes('right') ? (forceInsets?.right ?? insets.right) : 0,
            paddingBottom: edges.includes('bottom') ? (forceInsets?.bottom ?? insets.bottom) : 0,
            paddingLeft: edges.includes('left') ? (forceInsets?.left ?? insets.left) : 0,
        };

        if (mode === 'margin') {
            return {
                marginTop: calculatedInsets.paddingTop,
                marginRight: calculatedInsets.paddingRight,
                marginBottom: calculatedInsets.paddingBottom,
                marginLeft: calculatedInsets.paddingLeft,
            };
        }

        return calculatedInsets;
    };

    const containerStyle: ViewStyle = {
        ...styles.container,
        backgroundColor: themeBackgroundColor,
        ...getInsets(),
        ...style,
    };

    return (
        <>
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={themeStatusBarColor}
                translucent={statusBarTranslucent}
            />
            <View style={containerStyle}>
                {children}
            </View>
        </>
    );
}

export default function SafeAreaWrapper(props: SafeAreaWrapperProps): JSX.Element {
    return (
        <SafeAreaProvider>
            <SafeAreaContent {...props} />
        </SafeAreaProvider>
    );
}

// Hook to get safe area insets in any component
export function useSafeArea() {
    return useSafeAreaInsets();
}

// Enhanced preset configurations for Walmart app layouts
export const SafeAreaPresets = {
    // Main app screen with Walmart branding
    screen: {
        edges: ['top', 'right', 'bottom', 'left'] as const,
        backgroundColor: '#FFFFFF',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Walmart home screen
    homeScreen: {
        edges: ['top', 'right', 'bottom', 'left'] as const,
        backgroundColor: '#F8FAFC',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Product detail screen
    productScreen: {
        edges: ['top', 'right', 'left'] as const,
        backgroundColor: '#FFFFFF',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Modal with Walmart styling
    modal: {
        edges: ['top', 'right', 'left'] as const,
        backgroundColor: '#FFFFFF',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Cart/Checkout screens
    cartScreen: {
        edges: ['top', 'right', 'left'] as const,
        backgroundColor: '#F8FAFC',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Tab screen (no bottom padding for tab bar)
    tabScreen: {
        edges: ['top', 'right', 'left'] as const,
        backgroundColor: '#FFFFFF',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Search screen
    searchScreen: {
        edges: ['top', 'right', 'left'] as const,
        backgroundColor: '#F8FAFC',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Transparent overlay (for image viewers, etc.)
    transparent: {
        edges: ['top', 'right', 'bottom', 'left'] as const,
        backgroundColor: 'transparent',
        statusBarStyle: 'light-content' as const,
        statusBarTranslucent: true,
        walmartTheme: false,
    },

    // Walmart branded header only
    headerOnly: {
        edges: ['top'] as const,
        backgroundColor: '#0071CE',
        statusBarStyle: 'light-content' as const,
        walmartTheme: true,
    },

    // No bottom safe area (for custom bottom navigation)
    noBottom: {
        edges: ['top', 'right', 'left'] as const,
        backgroundColor: '#FFFFFF',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Keyboard-aware layout
    keyboard: {
        edges: ['top', 'right', 'left'] as const,
        backgroundColor: '#FFFFFF',
        statusBarStyle: 'dark-content' as const,
        mode: 'padding' as const,
        walmartTheme: true,
    },

    // Settings/Profile screens
    settingsScreen: {
        edges: ['top', 'right', 'bottom', 'left'] as const,
        backgroundColor: '#F1F5F9',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },

    // Error/Loading screens
    fullScreen: {
        edges: ['top', 'right', 'bottom', 'left'] as const,
        backgroundColor: '#FFFFFF',
        statusBarStyle: 'dark-content' as const,
        walmartTheme: true,
    },
};

// Safe area aware components with Walmart styling
export function SafeAreaTop({
                                backgroundColor = '#FFFFFF',
                                height,
                                walmartTheme = true,
                            }: {
    backgroundColor?: string;
    height?: number;
    walmartTheme?: boolean;
}): JSX.Element {
    const insets = useSafeAreaInsets();

    const themeBackgroundColor = walmartTheme && backgroundColor === '#FFFFFF'
        ? styles.walmartBackground.backgroundColor
        : backgroundColor;

    return (
        <View
            style={[
                styles.safeAreaTop,
                {
                    height: height ?? insets.top,
                    backgroundColor: themeBackgroundColor,
                }
            ]}
        />
    );
}

export function SafeAreaBottom({
                                   backgroundColor = '#FFFFFF',
                                   height,
                                   walmartTheme = true,
                               }: {
    backgroundColor?: string;
    height?: number;
    walmartTheme?: boolean;
}): JSX.Element {
    const insets = useSafeAreaInsets();

    const themeBackgroundColor = walmartTheme && backgroundColor === '#FFFFFF'
        ? styles.walmartBackground.backgroundColor
        : backgroundColor;

    return (
        <View
            style={[
                styles.safeAreaBottom,
                {
                    height: height ?? insets.bottom,
                    backgroundColor: themeBackgroundColor,
                }
            ]}
        />
    );
}

// Enhanced keyboard avoiding component with Walmart theming
export function KeyboardSafeArea({
                                     children,
                                     backgroundColor = '#FFFFFF',
                                     keyboardVerticalOffset = 0,
                                     walmartTheme = true,
                                 }: {
    children: React.ReactNode;
    backgroundColor?: string;
    keyboardVerticalOffset?: number;
    walmartTheme?: boolean;
}): JSX.Element {
    const insets = useSafeAreaInsets();

    const themeBackgroundColor = walmartTheme && backgroundColor === '#FFFFFF'
        ? styles.walmartBackground.backgroundColor
        : backgroundColor;

    if (Platform.OS === 'ios') {
        const { KeyboardAvoidingView } = require('react-native');
        return (
            <KeyboardAvoidingView
                style={[
                    styles.keyboardContainer,
                    { backgroundColor: themeBackgroundColor }
                ]}
                behavior="padding"
                keyboardVerticalOffset={keyboardVerticalOffset + insets.top}
            >
                {children}
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={[
            styles.keyboardContainer,
            { backgroundColor: themeBackgroundColor }
        ]}>
            {children}
        </View>
    );
}

// Walmart-specific safe area components
export function WalmartHeader({
                                  children,
                                  height = 56,
                              }: {
    children: React.ReactNode;
    height?: number;
}): JSX.Element {
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.walmartHeader,
            {
                paddingTop: insets.top,
                height: height + insets.top,
            }
        ]}>
            {children}
        </View>
    );
}

export function WalmartScreenContainer({
                                           children,
                                           style,
                                       }: {
    children: React.ReactNode;
    style?: ViewStyle;
}): JSX.Element {
    return (
        <SafeAreaWrapper {...SafeAreaPresets.screen} style={style}>
            <View style={styles.screenContent}>
                {children}
            </View>
        </SafeAreaWrapper>
    );
}

const styles = StyleSheet.create({
    // Main container
    container: {
        flex: 1,
    },

    // Walmart theme colors
    walmartBackground: {
        backgroundColor: '#FFFFFF',
    },
    walmartPrimary: {
        backgroundColor: '#0071CE',
    },
    walmartSecondary: {
        backgroundColor: '#F8FAFC',
    },

    // Safe area components
    safeAreaTop: {
        width: '100%',
    },
    safeAreaBottom: {
        width: '100%',
    },

    // Keyboard container
    keyboardContainer: {
        flex: 1,
    },

    // Walmart-specific components
    walmartHeader: {
        backgroundColor: '#0071CE',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Screen content wrapper
    screenContent: {
        flex: 1,
    },

    // Walmart theme variants
    primaryTheme: {
        backgroundColor: '#0071CE',
    },
    secondaryTheme: {
        backgroundColor: '#F8FAFC',
    },
    lightTheme: {
        backgroundColor: '#FFFFFF',
    },
    darkTheme: {
        backgroundColor: '#1F2937',
    },
});