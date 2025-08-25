import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Types
interface ProductSpec {
    label: string;
    value: string;
    type?: 'text' | 'list' | 'boolean';
}

interface ProductFeature {
    id: string;
    title: string;
    description: string;
    icon?: string;
    highlight?: boolean;
}

interface ProductDetailsProps {
    description: string;
    specifications: ProductSpec[];
    features: ProductFeature[];
    brand?: string;
    model?: string;
    sku?: string;
    weight?: string;
    dimensions?: string;
    warranty?: string;
    materials?: string[];
    careInstructions?: string[];
    showExpandable?: boolean;
    maxDescriptionLines?: number;
    defaultTab?: 'overview' | 'specs' | 'features';
}

// Constants
const WALMART_COLORS = {
    primary: '#0071CE',
    primaryDark: '#005AA3',
    secondary: '#FFC220',
    success: '#00A652',
    error: '#E53E3E',
    warning: '#FF8C00',
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    // Product details specific colors
    tabActive: '#0071CE',
    tabInactive: '#6B7280',
    highlightBlue: '#2563EB',
    highlightBlueBg: 'rgba(37, 99, 235, 0.05)',
    highlightBlueBorder: 'rgba(37, 99, 235, 0.2)',
    materialBlue: '#1E40AF',
    materialBlueBg: 'rgba(30, 64, 175, 0.1)',
    careAmber: '#F59E0B',
    careAmberBg: 'rgba(245, 158, 11, 0.05)',
    careAmberBorder: 'rgba(245, 158, 11, 0.2)',
    highlightGradient: ['#F59E0B', '#D97706'],
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

const TYPOGRAPHY = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
};

// Tab Configuration
const TAB_CONFIG = [
    { key: 'overview', label: 'Overview', icon: 'document-text-outline' },
    { key: 'specs', label: 'Specs', icon: 'list-outline' },
    { key: 'features', label: 'Features', icon: 'star-outline' },
] as const;

// Tab Header Component
const TabHeader = React.memo(({
                                  activeTab,
                                  onTabChange,
                              }: {
    activeTab: string;
    onTabChange: (tab: 'overview' | 'specs' | 'features') => void;
}) => (
    <View style={styles.tabContainer}>
        <View style={styles.tabHeader}>
            {TAB_CONFIG.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tabButton,
                            isActive && styles.tabButtonActive,
                        ]}
                        onPress={() => onTabChange(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={16}
                            color={isActive ? WALMART_COLORS.tabActive : WALMART_COLORS.tabInactive}
                            style={styles.tabIcon}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                isActive ? styles.tabTextActive : styles.tabTextInactive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
));

// Description Component
const ProductDescription = React.memo(({
                                           description,
                                           showExpandable,
                                           maxDescriptionLines,
                                           expanded,
                                           onToggleExpanded,
                                       }: {
    description: string;
    showExpandable: boolean;
    maxDescriptionLines: number;
    expanded: boolean;
    onToggleExpanded: () => void;
}) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Product Description</Text>
        <View style={styles.descriptionContainer}>
            <Text
                style={styles.descriptionText}
                numberOfLines={showExpandable && !expanded ? maxDescriptionLines : undefined}
            >
                {description}
            </Text>

            {showExpandable && description.length > 150 && (
                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={onToggleExpanded}
                    activeOpacity={0.7}
                >
                    <Text style={styles.expandButtonText}>
                        {expanded ? 'Read Less' : 'Read More'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    </View>
));

// Basic Info Component
const BasicInfo = React.memo(({
                                  brand,
                                  model,
                                  sku,
                                  weight,
                                  dimensions,
                                  warranty,
                              }: {
    brand?: string;
    model?: string;
    sku?: string;
    weight?: string;
    dimensions?: string;
    warranty?: string;
}) => {
    const basicInfo = useMemo(() => [
        { label: 'Brand', value: brand },
        { label: 'Model', value: model },
        { label: 'SKU', value: sku },
        { label: 'Weight', value: weight },
        { label: 'Dimensions', value: dimensions },
        { label: 'Warranty', value: warranty },
    ].filter(item => item.value), [brand, model, sku, weight, dimensions, warranty]);

    if (!basicInfo.length) return null;

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Product Information</Text>
            <View style={styles.infoCard}>
                {basicInfo.map((item, index) => (
                    <View
                        key={item.label}
                        style={[
                            styles.infoRow,
                            index !== basicInfo.length - 1 && styles.infoRowBorder,
                        ]}
                    >
                        <Text style={styles.infoLabel}>{item.label}</Text>
                        <Text style={styles.infoValue}>{item.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
});

// Materials Component
const Materials = React.memo(({ materials }: { materials: string[] }) => {
    if (!materials.length) return null;

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Materials</Text>
            <View style={styles.materialsContainer}>
                {materials.map((material, index) => (
                    <View key={index} style={styles.materialChip}>
                        <Text style={styles.materialText}>{material}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
});

// Care Instructions Component
const CareInstructions = React.memo(({ careInstructions }: { careInstructions: string[] }) => {
    if (!careInstructions.length) return null;

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Care Instructions</Text>
            <View style={styles.careContainer}>
                {careInstructions.map((instruction, index) => (
                    <View key={index} style={styles.careItem}>
                        <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={WALMART_COLORS.careAmber}
                        />
                        <Text style={styles.careText}>{instruction}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
});

// Specifications Component
const Specifications = React.memo(({
                                       specifications,
                                       showExpandable,
                                       expanded,
                                       onToggleExpanded,
                                   }: {
    specifications: ProductSpec[];
    showExpandable: boolean;
    expanded: boolean;
    onToggleExpanded: () => void;
}) => {
    if (!specifications.length) return null;

    const displaySpecs = showExpandable && !expanded
        ? specifications.slice(0, 5)
        : specifications;

    const renderSpecValue = useCallback((spec: ProductSpec) => {
        if (spec.type === 'list') {
            return (
                <View style={styles.specListContainer}>
                    {spec.value.split(',').map((item, idx) => (
                        <Text key={idx} style={styles.specListItem}>
                            • {item.trim()}
                        </Text>
                    ))}
                </View>
            );
        }

        if (spec.type === 'boolean') {
            return (
                <View style={styles.specBooleanContainer}>
                    <Ionicons
                        name={spec.value === 'true' ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={spec.value === 'true' ? WALMART_COLORS.success : WALMART_COLORS.error}
                    />
                </View>
            );
        }

        return (
            <Text style={styles.specValue}>{spec.value}</Text>
        );
    }, []);

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specsCard}>
                {displaySpecs.map((spec, index) => (
                    <View
                        key={index}
                        style={[
                            styles.specRow,
                            index !== displaySpecs.length - 1 && styles.specRowBorder,
                        ]}
                    >
                        <View style={styles.specContent}>
                            <Text style={styles.specLabel}>{spec.label}</Text>
                            <View style={styles.specValueContainer}>
                                {renderSpecValue(spec)}
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {showExpandable && specifications.length > 5 && (
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={onToggleExpanded}
                    activeOpacity={0.7}
                >
                    <Text style={styles.showMoreText}>
                        {expanded ? 'Show Less' : `Show ${specifications.length - 5} More`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

// Features Component
const Features = React.memo(({
                                 features,
                                 showExpandable,
                                 expanded,
                                 onToggleExpanded,
                             }: {
    features: ProductFeature[];
    showExpandable: boolean;
    expanded: boolean;
    onToggleExpanded: () => void;
}) => {
    if (!features.length) return null;

    const displayFeatures = showExpandable && !expanded
        ? features.slice(0, 4)
        : features;

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresContainer}>
                {displayFeatures.map((feature) => (
                    <View
                        key={feature.id}
                        style={[
                            styles.featureCard,
                            feature.highlight && styles.featureCardHighlight,
                        ]}
                    >
                        <View style={styles.featureContent}>
                            {feature.icon && (
                                <View style={[
                                    styles.featureIconContainer,
                                    feature.highlight && styles.featureIconContainerHighlight,
                                ]}>
                                    <Ionicons
                                        name={feature.icon as any}
                                        size={20}
                                        color={feature.highlight ? WALMART_COLORS.highlightBlue : WALMART_COLORS.gray600}
                                    />
                                </View>
                            )}
                            <View style={styles.featureTextContainer}>
                                <Text style={[
                                    styles.featureTitle,
                                    feature.highlight && styles.featureTitleHighlight,
                                ]}>
                                    {feature.title}
                                </Text>
                                <Text style={[
                                    styles.featureDescription,
                                    feature.highlight && styles.featureDescriptionHighlight,
                                ]}>
                                    {feature.description}
                                </Text>
                            </View>
                            {feature.highlight && (
                                <View style={styles.highlightBadgeContainer}>
                                    <LinearGradient
                                        colors={WALMART_COLORS.highlightGradient}
                                        style={styles.highlightBadge}
                                    >
                                        <Text style={styles.highlightBadgeText}>
                                            HIGHLIGHT
                                        </Text>
                                    </LinearGradient>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </View>

            {showExpandable && features.length > 4 && (
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={onToggleExpanded}
                    activeOpacity={0.7}
                >
                    <Text style={styles.showMoreText}>
                        {expanded ? 'Show Less' : `Show ${features.length - 4} More Features`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

// Main Component
export default function ProductDetails({
                                           description,
                                           specifications,
                                           features,
                                           brand,
                                           model,
                                           sku,
                                           weight,
                                           dimensions,
                                           warranty,
                                           materials = [],
                                           careInstructions = [],
                                           showExpandable = true,
                                           maxDescriptionLines = 3,
                                           defaultTab = 'overview',
                                       }: ProductDetailsProps): JSX.Element {
    // State
    const [expandedDescription, setExpandedDescription] = useState(false);
    const [expandedSpecs, setExpandedSpecs] = useState(false);
    const [expandedFeatures, setExpandedFeatures] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'features'>(defaultTab);

    // Animation
    const fadeAnim = useMemo(() => new Animated.Value(1), []);

    // Callbacks
    const handleTabChange = useCallback((tab: 'overview' | 'specs' | 'features') => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
        setActiveTab(tab);
    }, [fadeAnim]);

    const toggleExpandedDescription = useCallback(() => {
        setExpandedDescription(!expandedDescription);
    }, [expandedDescription]);

    const toggleExpandedSpecs = useCallback(() => {
        setExpandedSpecs(!expandedSpecs);
    }, [expandedSpecs]);

    const toggleExpandedFeatures = useCallback(() => {
        setExpandedFeatures(!expandedFeatures);
    }, [expandedFeatures]);

    // Render functions
    const renderOverviewTab = useCallback(() => (
        <Animated.View style={{ opacity: fadeAnim }}>
            <ProductDescription
                description={description}
                showExpandable={showExpandable}
                maxDescriptionLines={maxDescriptionLines}
                expanded={expandedDescription}
                onToggleExpanded={toggleExpandedDescription}
            />
            <BasicInfo
                brand={brand}
                model={model}
                sku={sku}
                weight={weight}
                dimensions={dimensions}
                warranty={warranty}
            />
            <Materials materials={materials} />
            <CareInstructions careInstructions={careInstructions} />
        </Animated.View>
    ), [
        fadeAnim,
        description,
        showExpandable,
        maxDescriptionLines,
        expandedDescription,
        toggleExpandedDescription,
        brand,
        model,
        sku,
        weight,
        dimensions,
        warranty,
        materials,
        careInstructions,
    ]);

    const renderSpecsTab = useCallback(() => (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Specifications
                specifications={specifications}
                showExpandable={showExpandable}
                expanded={expandedSpecs}
                onToggleExpanded={toggleExpandedSpecs}
            />
        </Animated.View>
    ), [fadeAnim, specifications, showExpandable, expandedSpecs, toggleExpandedSpecs]);

    const renderFeaturesTab = useCallback(() => (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Features
                features={features}
                showExpandable={showExpandable}
                expanded={expandedFeatures}
                onToggleExpanded={toggleExpandedFeatures}
            />
        </Animated.View>
    ), [fadeAnim, features, showExpandable, expandedFeatures, toggleExpandedFeatures]);

    return (
        <View style={styles.container}>
            <TabHeader activeTab={activeTab} onTabChange={handleTabChange} />

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'specs' && renderSpecsTab()}
                {activeTab === 'features' && renderFeaturesTab()}
            </ScrollView>
        </View>
    );
}

// Enhanced Styles
const styles = StyleSheet.create({
    // Main Container
    container: {
        backgroundColor: WALMART_COLORS.white,
        flex: 1,
    },

    // Scroll Container
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xxxl,
    },

    // Tab Styles
    tabContainer: {
        marginBottom: SPACING.xxl,
    },
    tabHeader: {
        flexDirection: 'row',
        backgroundColor: WALMART_COLORS.gray100,
        borderRadius: 16,
        padding: SPACING.xs,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 12,
    },
    tabButtonActive: {
        backgroundColor: WALMART_COLORS.white,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    tabIcon: {
        marginRight: SPACING.sm,
    },
    tabText: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
    },
    tabTextActive: {
        color: WALMART_COLORS.tabActive,
    },
    tabTextInactive: {
        color: WALMART_COLORS.tabInactive,
    },

    // Section Styles
    sectionContainer: {
        marginBottom: SPACING.xxl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.md,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },

    // Description Styles
    descriptionContainer: {
        backgroundColor: WALMART_COLORS.gray50,
        borderRadius: 16,
        padding: SPACING.lg,
    },
    descriptionText: {
        color: WALMART_COLORS.gray700,
        fontSize: TYPOGRAPHY.md,
        lineHeight: 24,
    },
    expandButton: {
        alignSelf: 'flex-start',
        marginTop: SPACING.md,
    },
    expandButtonText: {
        color: WALMART_COLORS.primary,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
    },

    // Info Card Styles
    infoCard: {
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray200,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: WALMART_COLORS.gray100,
    },
    infoLabel: {
        color: WALMART_COLORS.gray600,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
    },
    infoValue: {
        color: WALMART_COLORS.gray900,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: SPACING.lg,
    },

    // Materials Styles
    materialsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    materialChip: {
        backgroundColor: WALMART_COLORS.materialBlueBg,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    materialText: {
        color: WALMART_COLORS.materialBlue,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: '600',
    },

    // Care Instructions Styles
    careContainer: {
        backgroundColor: WALMART_COLORS.careAmberBg,
        borderRadius: 16,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: WALMART_COLORS.careAmberBorder,
    },
    careItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    careText: {
        color: WALMART_COLORS.careAmber,
        fontSize: TYPOGRAPHY.md,
        marginLeft: SPACING.sm,
        flex: 1,
        lineHeight: 20,
    },

    // Specifications Styles
    specsCard: {
        backgroundColor: WALMART_COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: WALMART_COLORS.gray200,
        overflow: 'hidden',
    },
    specRow: {
        padding: SPACING.lg,
    },
    specRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: WALMART_COLORS.gray100,
    },
    specContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    specLabel: {
        color: WALMART_COLORS.gray600,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        flex: 1,
    },
    specValueContainer: {
        flex: 1,
        marginLeft: SPACING.lg,
    },
    specValue: {
        color: WALMART_COLORS.gray900,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
        textAlign: 'right',
    },
    specListContainer: {
        alignItems: 'flex-end',
    },
    specListItem: {
        color: WALMART_COLORS.gray900,
        fontSize: TYPOGRAPHY.md,
        textAlign: 'right',
    },
    specBooleanContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    // Features Styles
    featuresContainer: {
        gap: SPACING.md,
    },
    featureCard: {
        borderRadius: 16,
        padding: SPACING.lg,
        backgroundColor: WALMART_COLORS.gray50,
    },
    featureCardHighlight: {
        backgroundColor: WALMART_COLORS.highlightBlueBg,
        borderWidth: 1,
        borderColor: WALMART_COLORS.highlightBlueBorder,
    },
    featureContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    featureIconContainer: {
        marginRight: SPACING.md,
        padding: SPACING.sm,
        borderRadius: 20,
        backgroundColor: WALMART_COLORS.white,
    },
    featureIconContainerHighlight: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: '700',
        color: WALMART_COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    featureTitleHighlight: {
        color: WALMART_COLORS.highlightBlue,
    },
    featureDescription: {
        fontSize: TYPOGRAPHY.md,
        color: WALMART_COLORS.gray700,
        lineHeight: 20,
    },
    featureDescriptionHighlight: {
        color: WALMART_COLORS.highlightBlue,
    },
    highlightBadgeContainer: {
        marginLeft: SPACING.sm,
    },
    highlightBadge: {
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    highlightBadgeText: {
        color: WALMART_COLORS.white,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: '700',
    },

    // Show More Button
    showMoreButton: {
        alignSelf: 'center',
        backgroundColor: WALMART_COLORS.gray100,
        borderRadius: 20,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        marginTop: SPACING.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    showMoreText: {
        color: WALMART_COLORS.gray700,
        fontSize: TYPOGRAPHY.md,
        fontWeight: '600',
    },
});