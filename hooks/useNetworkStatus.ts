import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// Types
export interface NetworkState {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: NetInfoStateType;
    isWifiEnabled?: boolean;
    connectionType: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'vpn' | 'other' | 'unknown' | 'none';
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'unknown';
    strength?: 'poor' | 'moderate' | 'good' | 'excellent' | 'unknown';
    details: {
        ssid?: string;
        bssid?: string;
        subnet?: string;
        ipAddress?: string;
        frequency?: number;
        linkSpeed?: number;
        rxLinkSpeed?: number;
        txLinkSpeed?: number;
        isConnectionExpensive?: boolean;
    };
}

export interface NetworkStatusOptions {
    enableConnectivityChecks?: boolean;
    connectivityCheckUrl?: string;
    connectivityCheckTimeout?: number;
    enableSpeedTest?: boolean;
    reachabilityUrl?: string;
    reachabilityTimeout?: number;
    reachabilityTest?: boolean;
    reachabilityShortTimeout?: number;
    reachabilityRequestTimeout?: number;
    shouldFetchWiFiSSID?: boolean;
    showOfflineAlert?: boolean;
    showOnlineAlert?: boolean;
    offlineAlertTitle?: string;
    offlineAlertMessage?: string;
    onlineAlertTitle?: string;
    onlineAlertMessage?: string;
}

export interface SpeedTestResult {
    downloadSpeed: number; // Mbps
    uploadSpeed: number; // Mbps
    ping: number; // ms
    jitter: number; // ms
    timestamp: number;
}

export interface ConnectivityHistory {
    timestamp: number;
    isConnected: boolean;
    connectionType: string;
    duration?: number; // Duration of this state in ms
}

// Default options
const defaultOptions: NetworkStatusOptions = {
    enableConnectivityChecks: true,
    connectivityCheckUrl: 'https://www.google.com',
    connectivityCheckTimeout: 5000,
    enableSpeedTest: false,
    reachabilityUrl: 'https://www.google.com',
    reachabilityTimeout: 10000,
    reachabilityTest: true,
    reachabilityShortTimeout: 5000,
    reachabilityRequestTimeout: 15000,
    shouldFetchWiFiSSID: true,
    showOfflineAlert: false,
    showOnlineAlert: false,
    offlineAlertTitle: 'No Internet Connection',
    offlineAlertMessage: 'Please check your internet connection and try again.',
    onlineAlertTitle: 'Connection Restored',
    onlineAlertMessage: 'Your internet connection has been restored.',
};

// Speed test utility
const performSpeedTest = async (): Promise<SpeedTestResult> => {
    const startTime = performance.now();

    try {
        // Simple download speed test using a small file
        const downloadStart = performance.now();
        const response = await fetch('https://httpbin.org/bytes/1024', {
            method: 'GET',
            cache: 'no-cache',
        });
        await response.blob();
        const downloadEnd = performance.now();

        // Simple upload speed test
        const uploadStart = performance.now();
        await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: new Array(1024).fill('a').join(''),
            headers: { 'Content-Type': 'text/plain' },
        });
        const uploadEnd = performance.now();

        // Ping test
        const pingStart = performance.now();
        await fetch('https://httpbin.org/get', { method: 'HEAD' });
        const pingEnd = performance.now();

        const downloadTime = (downloadEnd - downloadStart) / 1000; // seconds
        const uploadTime = (uploadEnd - uploadStart) / 1000; // seconds
        const ping = pingEnd - pingStart; // ms

        // Calculate speeds (very rough approximation)
        const downloadSpeed = (1024 * 8) / (downloadTime * 1024 * 1024); // Mbps
        const uploadSpeed = (1024 * 8) / (uploadTime * 1024 * 1024); // Mbps

        return {
            downloadSpeed: Math.round(downloadSpeed * 100) / 100,
            uploadSpeed: Math.round(uploadSpeed * 100) / 100,
            ping: Math.round(ping),
            jitter: Math.round(Math.random() * 10), // Mock jitter
            timestamp: Date.now(),
        };
    } catch (error) {
        throw new Error('Speed test failed');
    }
};

// Connectivity check utility
const checkConnectivity = async (url: string, timeout: number): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-cache',
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Get connection strength based on type and details
const getConnectionStrength = (state: NetInfoState): 'poor' | 'moderate' | 'good' | 'excellent' | 'unknown' => {
    if (!state.isConnected) return 'poor';

    if (state.type === 'wifi' && state.details) {
        const details = state.details as any;
        const linkSpeed = details.linkSpeed || details.rxLinkSpeed || 0;

        if (linkSpeed >= 100) return 'excellent';
        if (linkSpeed >= 50) return 'good';
        if (linkSpeed >= 20) return 'moderate';
        return 'poor';
    }

    if (state.type === 'cellular' && state.details) {
        const details = state.details as any;
        const cellularGeneration = details.cellularGeneration;

        if (cellularGeneration === '5g') return 'excellent';
        if (cellularGeneration === '4g') return 'good';
        if (cellularGeneration === '3g') return 'moderate';
        return 'poor';
    }

    return 'unknown';
};

// Get effective connection type
const getEffectiveType = (state: NetInfoState): 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'unknown' => {
    if (!state.isConnected) return 'unknown';

    if (state.type === 'wifi') {
        const details = state.details as any;
        const linkSpeed = details?.linkSpeed || details?.rxLinkSpeed || 0;

        if (linkSpeed >= 100) return '5g';
        if (linkSpeed >= 50) return '4g';
        if (linkSpeed >= 20) return '3g';
        return '2g';
    }

    if (state.type === 'cellular' && state.details) {
        const details = state.details as any;
        const cellularGeneration = details.cellularGeneration;

        if (cellularGeneration === '5g') return '5g';
        if (cellularGeneration === '4g') return '4g';
        if (cellularGeneration === '3g') return '3g';
        if (cellularGeneration === '2g') return '2g';
        return 'slow-2g';
    }

    return 'unknown';
};

export function useNetworkStatus(options: NetworkStatusOptions = {}) {
    const opts = { ...defaultOptions, ...options };

    const [networkState, setNetworkState] = useState<NetworkState>({
        isConnected: false,
        isInternetReachable: null,
        type: NetInfoStateType.unknown,
        connectionType: 'unknown',
        strength: 'unknown',
        details: {},
    });

    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [connectivityHistory, setConnectivityHistory] = useState<ConnectivityHistory[]>([]);
    const [lastSpeedTest, setLastSpeedTest] = useState<SpeedTestResult | null>(null);
    const [isPerformingSpeedTest, setIsPerformingSpeedTest] = useState(false);

    const unsubscribeRef = useRef<(() => void) | null>(null);
    const lastStateRef = useRef<NetworkState | null>(null);
    const stateChangeTimeRef = useRef<number>(Date.now());

    // Update connectivity history
    const updateConnectivityHistory = useCallback((newState: NetworkState) => {
        const now = Date.now();
        const lastState = lastStateRef.current;

        if (lastState && lastState.isConnected !== newState.isConnected) {
            const duration = now - stateChangeTimeRef.current;

            setConnectivityHistory(prev => {
                const updated = [...prev];

                // Update duration of the last entry
                if (updated.length > 0) {
                    updated[updated.length - 1].duration = duration;
                }

                // Add new entry
                updated.push({
                    timestamp: now,
                    isConnected: newState.isConnected,
                    connectionType: newState.connectionType,
                });

                // Keep only last 50 entries
                return updated.slice(-50);
            });

            stateChangeTimeRef.current = now;
        }

        lastStateRef.current = newState;
    }, []);

    // Show connectivity alerts
    const showConnectivityAlert = useCallback((isConnected: boolean) => {
        if (isConnected && opts.showOnlineAlert) {
            Alert.alert(opts.onlineAlertTitle!, opts.onlineAlertMessage!);
        } else if (!isConnected && opts.showOfflineAlert) {
            Alert.alert(opts.offlineAlertTitle!, opts.offlineAlertMessage!);
        }
    }, [opts]);

    // Handle network state change
    const handleNetworkStateChange = useCallback(async (state: NetInfoState) => {
        const connectionType = state.type === NetInfoStateType.none ? 'none' :
            state.type === NetInfoStateType.wifi ? 'wifi' :
                state.type === NetInfoStateType.cellular ? 'cellular' :
                    state.type === NetInfoStateType.ethernet ? 'ethernet' :
                        state.type === NetInfoStateType.bluetooth ? 'bluetooth' :
                            state.type === NetInfoStateType.vpn ? 'vpn' :
                                state.type === NetInfoStateType.other ? 'other' : 'unknown';

        const newNetworkState: NetworkState = {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
            connectionType,
            effectiveType: getEffectiveType(state),
            strength: getConnectionStrength(state),
            details: {
                ssid: (state.details as any)?.ssid,
                bssid: (state.details as any)?.bssid,
                subnet: (state.details as any)?.subnet,
                ipAddress: (state.details as any)?.ipAddress,
                frequency: (state.details as any)?.frequency,
                linkSpeed: (state.details as any)?.linkSpeed,
                rxLinkSpeed: (state.details as any)?.rxLinkSpeed,
                txLinkSpeed: (state.details as any)?.txLinkSpeed,
                isConnectionExpensive: (state.details as any)?.isConnectionExpensive,
            },
        };

        // Additional connectivity check if enabled
        if (opts.enableConnectivityChecks && newNetworkState.isConnected) {
            try {
                const isReachable = await checkConnectivity(
                    opts.connectivityCheckUrl!,
                    opts.connectivityCheckTimeout!
                );
                newNetworkState.isInternetReachable = isReachable;
            } catch (error) {
                newNetworkState.isInternetReachable = false;
            }
        }

        const wasOnline = isOnline;
        const isNowOnline = newNetworkState.isConnected && newNetworkState.isInternetReachable !== false;

        setNetworkState(newNetworkState);
        setIsOnline(isNowOnline);

        // Update history
        updateConnectivityHistory(newNetworkState);

        // Show alerts for connectivity changes
        if (wasOnline !== isNowOnline) {
            showConnectivityAlert(isNowOnline);
        }
    }, [isOnline, opts, updateConnectivityHistory, showConnectivityAlert]);

    // Run speed test
    const runSpeedTest = useCallback(async (): Promise<SpeedTestResult | null> => {
        if (!networkState.isConnected || isPerformingSpeedTest) {
            return null;
        }

        try {
            setIsPerformingSpeedTest(true);
            const result = await performSpeedTest();
            setLastSpeedTest(result);
            return result;
        } catch (error) {
            console.error('Speed test failed:', error);
            return null;
        } finally {
            setIsPerformingSpeedTest(false);
        }
    }, [networkState.isConnected, isPerformingSpeedTest]);

    // Check internet connectivity manually
    const checkInternetConnectivity = useCallback(async (): Promise<boolean> => {
        if (!networkState.isConnected) return false;

        try {
            const isReachable = await checkConnectivity(
                opts.reachabilityUrl!,
                opts.reachabilityTimeout!
            );

            setNetworkState(prev => ({
                ...prev,
                isInternetReachable: isReachable,
            }));

            return isReachable;
        } catch (error) {
            setNetworkState(prev => ({
                ...prev,
                isInternetReachable: false,
            }));
            return false;
        }
    }, [networkState.isConnected, opts.reachabilityUrl, opts.reachabilityTimeout]);

    // Get connection quality
    const getConnectionQuality = useCallback((): 'excellent' | 'good' | 'poor' | 'offline' => {
        if (!networkState.isConnected) return 'offline';

        if (networkState.connectionType === 'wifi') {
            const linkSpeed = networkState.details.linkSpeed || 0;
            if (linkSpeed >= 50) return 'excellent';
            if (linkSpeed >= 20) return 'good';
            return 'poor';
        }

        if (networkState.connectionType === 'cellular') {
            if (networkState.effectiveType === '5g' || networkState.effectiveType === '4g') return 'excellent';
            if (networkState.effectiveType === '3g') return 'good';
            return 'poor';
        }

        return 'good'; // Default for other connection types
    }, [networkState]);

    // Get network info summary
    const getNetworkSummary = useCallback((): string => {
        if (!networkState.isConnected) return 'Offline';

        const { connectionType, effectiveType, strength } = networkState;

        if (connectionType === 'wifi') {
            const ssid = networkState.details.ssid;
            return `WiFi${ssid ? ` (${ssid})` : ''} - ${strength || 'unknown'} signal`;
        }

        if (connectionType === 'cellular') {
            return `Cellular ${effectiveType?.toUpperCase() || 'Unknown'} - ${strength || 'unknown'} signal`;
        }

        return `${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} connection`;
    }, [networkState]);

    // Calculate average uptime
    const getUptimePercentage = useCallback((timeframe: number = 24 * 60 * 60 * 1000): number => {
        const now = Date.now();
        const cutoffTime = now - timeframe;

        const relevantHistory = connectivityHistory.filter(
            entry => entry.timestamp >= cutoffTime
        );

        if (relevantHistory.length === 0) return 0;

        let totalTime = 0;
        let upTime = 0;

        for (let i = 0; i < relevantHistory.length; i++) {
            const entry = relevantHistory[i];
            const duration = entry.duration || (now - entry.timestamp);

            totalTime += duration;
            if (entry.isConnected) {
                upTime += duration;
            }
        }

        return totalTime > 0 ? Math.round((upTime / totalTime) * 100) : 0;
    }, [connectivityHistory]);

    // Initialize network monitoring
    useEffect(() => {
        // Configure NetInfo
        NetInfo.configure({
            reachabilityUrl: opts.reachabilityUrl,
            reachabilityTest: opts.reachabilityTest ? async (response) => {
                return Promise.resolve(response.status === 200);
            } : undefined,
            reachabilityShortTimeout: opts.reachabilityShortTimeout,
            reachabilityLongTimeout: opts.reachabilityTimeout,
            reachabilityRequestTimeout: opts.reachabilityRequestTimeout,
            shouldFetchWiFiSSID: opts.shouldFetchWiFiSSID,
        });

        // Subscribe to network state changes
        const unsubscribe = NetInfo.addEventListener(handleNetworkStateChange);
        unsubscribeRef.current = unsubscribe;

        // Get initial state
        NetInfo.fetch().then(handleNetworkStateChange);

        // Cleanup
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [handleNetworkStateChange, opts]);

    return {
        // Current state
        ...networkState,
        isOnline,

        // Speed test
        lastSpeedTest,
        isPerformingSpeedTest,
        runSpeedTest,

        // Connectivity history
        connectivityHistory,
        getUptimePercentage,

        // Actions
        checkInternetConnectivity,
        refresh: () => NetInfo.refresh(),

        // Utilities
        getConnectionQuality,
        getNetworkSummary,

        // Computed properties
        isSlowConnection: networkState.effectiveType === 'slow-2g' || networkState.effectiveType === '2g',
        isFastConnection: networkState.effectiveType === '4g' || networkState.effectiveType === '5g',
        isWifi: networkState.connectionType === 'wifi',
        isCellular: networkState.connectionType === 'cellular',
        isExpensiveConnection: networkState.details.isConnectionExpensive || networkState.connectionType === 'cellular',
        hasStrongSignal: networkState.strength === 'excellent' || networkState.strength === 'good',
    };
}