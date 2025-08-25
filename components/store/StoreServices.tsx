import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    FlatList,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ServiceInfo {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    isAvailable: boolean;
    hours?: {
        openTime: string;
        closeTime: string;
        isOpen: boolean;
    };
    phone?: string;
    location?: string;
    features?: string[];
    estimatedWaitTime?: number;
    requiresAppointment?: boolean;
    onlineBookingAvailable?: boolean;
    additionalInfo?: string;
    rating?: number;
    reviewCount?: number;
    specialty?: string;
    staffCount?: number;
    lastUpdated?: string;
}

interface ServiceCategory {
    id: string;
    name: string;
    icon: string;
    services: ServiceInfo[];
    description?: string;
    priority?: number;
}

interface StoreServicesProps {
    storeId: string;
    storeName: string;
    categories: ServiceCategory[];
    onServicePress?: (service: ServiceInfo) => void;
    onBookAppointment?: (service: ServiceInfo) => void;
    onCallService?: (service: ServiceInfo) => void;
    onGetDirections?: (location: string) => void;
    onViewAllServices?: () => void;
    showSearch?: boolean;
    compact?: boolean;
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export default function StoreServices({
                                          storeId,
                                          storeName,
                                          categories,
                                          onServicePress,
                                          onBookAppointment,
                                          onCallService,
                                          onGetDirections,
                                          onViewAllServices,
                                          showSearch = true,
                                          compact = false,
                                          isLoading = false,
                                          refreshing = false,
                                          onRefresh,
                                      }: StoreServicesProps): JSX.Element {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
    const [favoriteServices, setFavoriteServices] = useState<Set<string>>(new Set());

    const filteredCategories = categories.map(category => ({
        ...category,
        services: category.services.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (service.specialty && service.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
    })).filter(category => category.services.length > 0);

    const allServices = categories.flatMap(cat => cat.services);
    const availableServices = allServices.filter(service => service.isAvailable);
    const urgentServices = availableServices.filter(service =>
        service.estimatedWaitTime && service.estimatedWaitTime < 15
    );

    const toggleServiceDetails = useCallback((serviceId: string) => {
        const newExpanded = new Set(expandedServices);
        if (newExpanded.has(serviceId)) {
            newExpanded.delete(serviceId);
        } else {
            newExpanded.add(serviceId);
        }
        setExpandedServices(newExpanded);
    }, [expandedServices]);

    const toggleFavorite = useCallback((serviceId: string) => {
        const newFavorites = new Set(favoriteServices);
        if (newFavorites.has(serviceId)) {
            newFavorites.delete(serviceId);
        } else {
            newFavorites.add(serviceId);
        }
        setFavoriteServices(newFavorites);
    }, [favoriteServices]);

    const formatTime = (time: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={14}
                    color="#F59E0B"
                    style={styles.starIcon}
                />
            );
        }
        return stars;
    };

    const renderSearchBar = () => {
        if (!showSearch) return null;

        return (
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                {urgentServices.length > 0 && (
                    <View style={styles.urgentBadge}>
                        <Ionicons name="flash" size={14} color="#F59E0B" />
                        <Text style={styles.urgentText}>
                            {urgentServices.length} services with short wait times
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderCategoryFilter = () => {
        if (compact) return null;

        const categoryOptions = [
            { id: 'all', name: 'All Services', count: allServices.length },
            { id: 'available', name: 'Available Now', count: availableServices.length },
            ...categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                count: cat.services.length,
            })),
        ];

        return (
            <View style={styles.categoryFilterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {categoryOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.categoryButton,
                                selectedCategory === option.id && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(option.id)}
                        >
                            <Text
                                style={[
                                    styles.categoryButtonText,
                                    selectedCategory === option.id && styles.categoryButtonTextActive
                                ]}
                            >
                                {option.name} ({option.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderServiceCard = (service: ServiceInfo) => {
        const isExpanded = expandedServices.has(service.id);
        const isFavorite = favoriteServices.has(service.id);

        return (
            <TouchableOpacity
                key={service.id}
                style={[
                    styles.serviceCard,
                    !service.isAvailable && styles.serviceCardDisabled
                ]}
                onPress={() => toggleServiceDetails(service.id)}
                activeOpacity={0.7}
            >
                <View style={styles.serviceCardContent}>
                    <View style={styles.serviceHeader}>
                        <View
                            style={[
                                styles.serviceIcon,
                                { backgroundColor: `${service.color}20` }
                            ]}
                        >
                            <Ionicons name={service.icon as any} size={24} color={service.color} />
                        </View>

                        <View style={styles.serviceInfo}>
                            <View style={styles.serviceTitleRow}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                <View style={styles.serviceActions}>
                                    <TouchableOpacity
                                        onPress={() => toggleFavorite(service.id)}
                                        style={styles.favoriteButton}
                                    >
                                        <Ionicons
                                            name={isFavorite ? "heart" : "heart-outline"}
                                            size={18}
                                            color={isFavorite ? "#EF4444" : "#9CA3AF"}
                                        />
                                    </TouchableOpacity>
                                    {!service.isAvailable && (
                                        <View style={styles.unavailableBadge}>
                                            <Text style={styles.unavailableText}>Unavailable</Text>
                                        </View>
                                    )}
                                    <Ionicons
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </View>
                            </View>

                            <Text style={styles.serviceDescription}>{service.description}</Text>

                            {service.specialty && (
                                <Text style={styles.serviceSpecialty}>Specialty: {service.specialty}</Text>
                            )}

                            {service.rating && (
                                <View style={styles.ratingRow}>
                                    <View style={styles.starsContainer}>
                                        {renderStars(service.rating)}
                                    </View>
                                    <Text style={styles.ratingText}>
                                        {service.rating.toFixed(1)} ({service.reviewCount || 0} reviews)
                                    </Text>
                                </View>
                            )}

                            <View style={styles.serviceStatus}>
                                {service.hours && (
                                    <View style={styles.statusItem}>
                                        <Ionicons
                                            name="time"
                                            size={16}
                                            color={service.hours.isOpen ? "#10B981" : "#EF4444"}
                                        />
                                        <Text
                                            style={[
                                                styles.statusText,
                                                service.hours.isOpen ? styles.statusOpen : styles.statusClosed
                                            ]}
                                        >
                                            {service.hours.isOpen ? "Open" : "Closed"}
                                        </Text>
                                        <Text style={styles.hoursText}>
                                            {formatTime(service.hours.openTime)} - {formatTime(service.hours.closeTime)}
                                        </Text>
                                    </View>
                                )}

                                {service.estimatedWaitTime && service.isAvailable && (
                                    <View style={styles.statusItem}>
                                        <Ionicons name="hourglass" size={16} color="#F59E0B" />
                                        <Text style={styles.waitTimeText}>
                                            Wait: ~{service.estimatedWaitTime} min
                                        </Text>
                                        {service.estimatedWaitTime < 15 && (
                                            <View style={styles.quickServiceBadge}>
                                                <Text style={styles.quickServiceText}>Quick</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {service.staffCount && (
                                    <View style={styles.statusItem}>
                                        <Ionicons name="people" size={16} color="#6B7280" />
                                        <Text style={styles.staffText}>
                                            {service.staffCount} staff available
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {isExpanded && (
                        <View style={styles.expandedContent}>
                            {service.location && (
                                <View style={styles.locationRow}>
                                    <Ionicons name="location" size={16} color="#6B7280" />
                                    <Text style={styles.locationText}>{service.location}</Text>
                                    <TouchableOpacity
                                        onPress={() => onGetDirections?.(service.location)}
                                        style={styles.directionsButton}
                                    >
                                        <Text style={styles.directionsText}>Get Directions</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {service.features && service.features.length > 0 && (
                                <View style={styles.featuresSection}>
                                    <Text style={styles.featuresTitle}>Features & Services:</Text>
                                    <View style={styles.featuresContainer}>
                                        {service.features.map((feature, index) => (
                                            <View key={index} style={styles.featureTag}>
                                                <Text style={styles.featureText}>{feature}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {service.additionalInfo && (
                                <View style={styles.infoSection}>
                                    <Ionicons name="information-circle" size={16} color="#3B82F6" />
                                    <Text style={styles.infoText}>{service.additionalInfo}</Text>
                                </View>
                            )}

                            <View style={styles.actionButtons}>
                                {service.requiresAppointment && service.onlineBookingAvailable && (
                                    <TouchableOpacity
                                        style={styles.primaryButton}
                                        onPress={() => onBookAppointment?.(service)}
                                    >
                                        <Ionicons name="calendar" size={16} color="white" />
                                        <Text style={styles.primaryButtonText}>Book Appointment</Text>
                                    </TouchableOpacity>
                                )}

                                {service.phone && (
                                    <TouchableOpacity
                                        style={styles.secondaryButton}
                                        onPress={() => onCallService?.(service)}
                                    >
                                        <Ionicons name="call" size={16} color="#374151" />
                                        <Text style={styles.secondaryButtonText}>Call Now</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.tertiaryButton}
                                    onPress={() => onServicePress?.(service)}
                                >
                                    <Ionicons name="information-circle" size={16} color="#10B981" />
                                    <Text style={styles.tertiaryButtonText}>More Details</Text>
                                </TouchableOpacity>
                            </View>

                            {service.lastUpdated && (
                                <Text style={styles.lastUpdated}>
                                    Last updated: {service.lastUpdated}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderQuickAccess = () => {
        if (compact) return null;

        const popularServices = allServices
            .filter(service => service.isAvailable)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4);

        return (
            <View style={styles.quickAccessContainer}>
                <View style={styles.quickAccessHeader}>
                    <Text style={styles.quickAccessTitle}>Quick Access</Text>
                    <Text style={styles.quickAccessSubtitle}>Popular services</Text>
                </View>
                <View style={styles.quickAccessGrid}>
                    {popularServices.map((service) => (
                        <TouchableOpacity
                            key={service.id}
                            style={styles.quickAccessItem}
                            onPress={() => onServicePress?.(service)}
                        >
                            <View
                                style={[
                                    styles.quickAccessIcon,
                                    { backgroundColor: `${service.color}20` }
                                ]}
                            >
                                <Ionicons name={service.icon as any} size={20} color={service.color} />
                            </View>
                            <Text style={styles.quickAccessName}>{service.name}</Text>
                            {service.estimatedWaitTime && (
                                <Text style={styles.quickAccessWait}>
                                    ~{service.estimatedWaitTime}m
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderServicesList = () => {
        let categoriesToShow = filteredCategories;

        if (selectedCategory === 'available') {
            categoriesToShow = categories.map(category => ({
                ...category,
                services: category.services.filter(service =>
                    service.isAvailable &&
                    (service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        service.description.toLowerCase().includes(searchQuery.toLowerCase()))
                ),
            })).filter(category => category.services.length > 0);
        } else if (selectedCategory !== 'all') {
            categoriesToShow = filteredCategories.filter(cat => cat.id === selectedCategory);
        }

        return (
            <ScrollView
                style={styles.servicesList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    onRefresh ? (
                        <ScrollView
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    ) : undefined
                }
            >
                {categoriesToShow.map((category) => (
                    <View key={category.id} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                            <Ionicons name={category.icon as any} size={24} color="#374151" />
                            <Text style={styles.categoryTitle}>{category.name}</Text>
                            <Text style={styles.categoryCount}>({category.services.length})</Text>
                        </View>
                        {category.description && (
                            <Text style={styles.categoryDescription}>{category.description}</Text>
                        )}
                        {category.services.map(renderServiceCard)}
                    </View>
                ))}

                {categoriesToShow.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="search" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyStateTitle}>No Services Found</Text>
                        <Text style={styles.emptyStateText}>
                            Try adjusting your search terms or category filter
                        </Text>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                        >
                            <Text style={styles.resetButtonText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading services...</Text>
            </View>
        );
    }

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactContent}>
                    <View style={styles.compactHeader}>
                        <Text style={styles.compactTitle}>Store Services</Text>
                        <Text style={styles.compactSubtitle}>
                            {availableServices.length} services available
                        </Text>
                    </View>
                    <FlatList
                        data={availableServices.slice(0, 3)}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.compactServiceItem}
                                onPress={() => onServicePress?.(item)}
                            >
                                <View
                                    style={[
                                        styles.compactServiceIcon,
                                        { backgroundColor: `${item.color}20` }
                                    ]}
                                >
                                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                                </View>
                                <View style={styles.compactServiceInfo}>
                                    <Text style={styles.compactServiceName}>{item.name}</Text>
                                    <View style={styles.compactServiceStatus}>
                                        {item.hours && (
                                            <Text style={[
                                                styles.compactStatusText,
                                                item.hours.isOpen ? styles.compactStatusOpen : styles.compactStatusClosed
                                            ]}>
                                                {item.hours.isOpen ? 'Open' : 'Closed'}
                                            </Text>
                                        )}
                                        {item.estimatedWaitTime && (
                                            <Text style={styles.compactWaitTime}>
                                                • ~{item.estimatedWaitTime}m wait
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    />
                    {availableServices.length > 3 && (
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={onViewAllServices}
                        >
                            <Text style={styles.viewAllText}>
                                View All {availableServices.length} Services
                            </Text>
                            <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Store Services</Text>
                <Text style={styles.headerSubtitle}>{storeName}</Text>
                <View style={styles.headerStats}>
                    <Text style={styles.availableCount}>
                        {availableServices.length} services available
                    </Text>
                    {urgentServices.length > 0 && (
                        <Text style={styles.urgentCount}>
                            • {urgentServices.length} with quick service
                        </Text>
                    )}
                </View>
            </View>

            {renderSearchBar()}
            {renderCategoryFilter()}
            {renderQuickAccess()}
            {renderServicesList()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availableCount: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    urgentCount: {
        fontSize: 14,
        color: '#F59E0B',
        fontWeight: '500',
        marginLeft: 4,
    },
    searchContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchInputContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#111827',
    },
    clearButton: {
        padding: 4,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    urgentText: {
        fontSize: 12,
        color: '#D97706',
        fontWeight: '600',
        marginLeft: 4,
    },
    categoryFilterContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    categoryScrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    categoryButton: {
        marginRight: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: 'white',
    },
    categoryButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    categoryButtonTextActive: {
        color: 'white',
    },
    quickAccessContainer: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
    },
    quickAccessHeader: {
        marginBottom: 16,
    },
    quickAccessTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    quickAccessSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    quickAccessGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickAccessItem: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 8,
    },
    quickAccessIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickAccessName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 4,
    },
    quickAccessWait: {
        fontSize: 11,
        color: '#6B7280',
    },
    servicesList: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    categorySection: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 12,
    },
    categoryCount: {
        fontSize: 16,
        color: '#6B7280',
        marginLeft: 8,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        marginLeft: 36,
    },
    serviceCard: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    serviceCardDisabled: {
        opacity: 0.6,
    },
    serviceCardContent: {
        padding: 16,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
    },
    serviceActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favoriteButton: {
        padding: 4,
        marginRight: 8,
    },
    unavailableBadge: {
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
    },
    unavailableText: {
        fontSize: 12,
        color: '#DC2626',
        fontWeight: '600',
    },
    serviceDescription: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
        lineHeight: 22,
    },
    serviceSpecialty: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    starIcon: {
        marginRight: 2,
    },
    ratingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    serviceStatus: {
        gap: 8,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    statusOpen: {
        color: '#10B981',
    },
    statusClosed: {
        color: '#EF4444',
    },
    hoursText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    waitTimeText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    quickServiceBadge: {
        backgroundColor: '#D1FAE5',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
    },
    quickServiceText: {
        fontSize: 11,
        color: '#047857',
        fontWeight: '600',
    },
    staffText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    directionsButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#EBF8FF',
        borderRadius: 8,
    },
    directionsText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    featuresSection: {
        marginBottom: 16,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    featureTag: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    infoSection: {
        flexDirection: 'row',
        backgroundColor: '#EBF8FF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        marginLeft: 8,
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    tertiaryButton: {
        flex: 1,
        backgroundColor: '#D1FAE5',
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tertiaryButtonText: {
        color: '#047857',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    resetButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 32,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
    },
    // Compact mode styles
    compactContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    compactContent: {
        padding: 16,
    },
    compactHeader: {
        marginBottom: 16,
    },
    compactTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    compactSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    compactServiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    compactServiceIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    compactServiceInfo: {
        flex: 1,
    },
    compactServiceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    compactServiceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactStatusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    compactStatusOpen: {
        color: '#10B981',
    },
    compactStatusClosed: {
        color: '#EF4444',
    },
    compactWaitTime: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    viewAllButton: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    viewAllText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
        marginRight: 4,
    },
});