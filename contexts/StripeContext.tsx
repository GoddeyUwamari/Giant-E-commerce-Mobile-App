import React, { createContext, useContext, useMemo } from 'react';
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';
import { View, Text, ActivityIndicator } from 'react-native';
import { API, STRIPE_CONFIG } from '../config/constants';

// Stripe Context for accessing stripe configuration
interface StripeContextType {
    publishableKey: string;
    merchantIdentifier?: string;
    urlScheme?: string;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

// Hook to use Stripe context
export const useStripe = () => {
    const context = useContext(StripeContext);
    if (context === undefined) {
        throw new Error('useStripe must be used within a StripeProvider');
    }
    return context;
};

// Enhanced Stripe Provider for React Native
export function StripeProvider({ children }: { children: React.ReactNode }) {
    // Memoize stripe configuration
    const stripeConfig = useMemo(() => {
        if (!API.stripe.publishableKey) {
            console.error('Stripe publishable key is missing');
            return null;
        }

        return {
            publishableKey: API.stripe.publishableKey,
            // Optional: Add merchant identifier for Apple Pay
            merchantIdentifier: 'merchant.com.walmartmobile.app',
            // Optional: URL scheme for redirects
            urlScheme: 'walmart-mobile',
        };
    }, []);

    if (!stripeConfig) {
        console.warn('Stripe not initialized - missing publishable key');
        return <>{children}</>;
    }

    const contextValue: StripeContextType = stripeConfig;

    return (
        <StripeContext.Provider value={contextValue}>
            <StripeProviderNative
                publishableKey={stripeConfig.publishableKey}
                merchantIdentifier={stripeConfig.merchantIdentifier}
                urlScheme={stripeConfig.urlScheme}
                threeDSecureParams={{
                    timeout: 120000, // 2 minutes
                    uiCustomization: {
                        accentColor: '#0071e3', // Walmart blue
                        buttonBackgroundColor: '#0071e3',
                        buttonCornerRadius: 8,
                        buttonTextColor: '#ffffff',
                    },
                }}
            >
                {children}
            </StripeProviderNative>
        </StripeContext.Provider>
    );
}

// Loading wrapper for Stripe-dependent components
export function StripeWrapper({
                                  children,
                                  fallback,
                              }: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const { publishableKey } = useStripe();
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
        // For React Native, Stripe initializes synchronously
        if (publishableKey) {
            setIsLoaded(true);
        }
    }, [publishableKey]);

    if (!isLoaded) {
        return (
            fallback || (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0071e3" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Loading payment...</Text>
                </View>
            )
        );
    }

    return <>{children}</>;
}