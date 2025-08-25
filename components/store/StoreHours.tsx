import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HoursInfo {
    day: string;
    openTime: string;
    closeTime: string;
    isToday: boolean;
    isClosed: boolean;
    isHoliday?: boolean;
    holidayName?: string;
}

interface ServiceHours {
    serviceName: string;
    hours: HoursInfo[];
    icon: string;
    color: string;
    isCurrentlyOpen: boolean;
}

interface StoreHoursProps {
    storeId: string;
    storeName: string;
    generalHours: HoursInfo[];
    serviceHours?: ServiceHours[];
    timeZone: string;
    lastUpdated: string;
    onEditHours?: () => void;
    showServiceHours?: boolean;
    compact?: boolean;
}

export default function StoreHours({
                                       storeId,
                                       storeName,
                                       generalHours,
                                       serviceHours = [],
                                       timeZone,
                                       lastUpdated,
                                       onEditHours,
                                       showServiceHours = true,
                                       compact = false,
                                   }: StoreHoursProps): JSX.Element {
    const formatTime = (time: string) => {
        if (!time || time === 'Closed') return 'Closed';

        // Convert 24-hour to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getCurrentStatus = (hours: HoursInfo[]) => {
        const today = hours.find(h => h.isToday);
        if (!today) return { isOpen: false, message: 'Hours unavailable' };

        if (today.isClosed || today.isHoliday) {
            return {
                isOpen: false,
                message: today.isHoliday ? `Closed - ${today.holidayName}` : 'Closed today'
            };
        }

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [openHour, openMin] = today.openTime.split(':').map(Number);
        const [closeHour, closeMin] = today.closeTime.split(':').map(Number);
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;

        if (currentTime >= openTime && currentTime < closeTime) {
            return {
                isOpen: true,
                message: `Open until ${formatTime(today.closeTime)}`
            };
        } else if (currentTime < openTime) {
            return {
                isOpen: false,
                message: `Opens at ${formatTime(today.openTime)}`
            };
        } else {
            return {
                isOpen: false,
                message: 'Closed'
            };
        }
    };

    const mainStatus = getCurrentStatus(generalHours);

    const renderHoursRow = (hours: HoursInfo, showIcon: boolean = false, iconName?: string, iconColor?: string) => (
        <View
            key={hours.day}
            style={[styles.hoursRow, hours.isToday && styles.todayRow]}
        >
            <View style={styles.hoursRowLeft}>
                {showIcon && iconName && (
                    <View style={styles.hoursIcon}>
                        <Ionicons name={iconName as any} size={16} color={iconColor || '#6B7280'} />
                    </View>
                )}
                <Text style={[styles.dayText, hours.isToday && styles.todayDayText]}>
                    {hours.day}
                    {hours.isToday && ' (Today)'}
                </Text>
                {hours.isHoliday && (
                    <View style={styles.holidayBadge}>
                        <Text style={styles.holidayBadgeText}>Holiday</Text>
                    </View>
                )}
            </View>

            <View style={styles.hoursRowRight}>
                {hours.isClosed || hours.isHoliday ? (
                    <Text style={styles.closedText}>Closed</Text>
                ) : (
                    <Text style={[styles.timeText, hours.isToday && styles.todayTimeText]}>
                        {formatTime(hours.openTime)} - {formatTime(hours.closeTime)}
                    </Text>
                )}
                {hours.isToday && (
                    <View style={[styles.statusIndicator, {
                        backgroundColor: mainStatus.isOpen ? '#10B981' : '#EF4444'
                    }]} />
                )}
            </View>
        </View>
    );

    const renderServiceHours = (service: ServiceHours) => (
        <View key={service.serviceName} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
                <View style={styles.serviceHeaderLeft}>
                    <View style={[styles.serviceIcon, { backgroundColor: `${service.color}20` }]}>
                        <Ionicons name={service.icon as any} size={20} color={service.color} />
                    </View>
                    <View>
                        <Text style={styles.serviceName}>{service.serviceName}</Text>
                        <View style={styles.serviceStatus}>
                            <View style={[styles.serviceStatusDot, {
                                backgroundColor: service.isCurrentlyOpen ? '#10B981' : '#EF4444'
                            }]} />
                            <Text style={[styles.serviceStatusText, {
                                color: service.isCurrentlyOpen ? '#10B981' : '#EF4444'
                            }]}>
                                {service.isCurrentlyOpen ? 'Open' : 'Closed'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.serviceHoursContainer}>
                {service.hours.map(hours => renderHoursRow(hours, false))}
            </View>
        </View>
    );

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactContent}>
                    <View style={styles.compactHeader}>
                        <Text style={styles.compactTitle}>Store Hours</Text>
                        <View style={styles.compactStatus}>
                            <View style={[styles.compactStatusDot, {
                                backgroundColor: mainStatus.isOpen ? '#10B981' : '#EF4444'
                            }]} />
                            <Text style={[styles.compactStatusText, {
                                color: mainStatus.isOpen ? '#10B981' : '#EF4444'
                            }]}>
                                {mainStatus.isOpen ? 'Open' : 'Closed'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.compactMessage}>{mainStatus.message}</Text>

                    {generalHours.filter(h => h.isToday).map(hours => (
                        <View key={hours.day} style={styles.compactTodayRow}>
                            <Text style={styles.compactTodayLabel}>Today</Text>
                            <Text style={styles.compactTodayTime}>
                                {hours.isClosed ? 'Closed' : `${formatTime(hours.openTime)} - ${formatTime(hours.closeTime)}`}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Store Hours</Text>
                    {onEditHours && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={onEditHours}
                        >
                            <Ionicons name="pencil" size={16} color="#2563EB" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.storeNameText}>{storeName}</Text>
            </View>

            {/* Current Status */}
            <View style={styles.statusCard}>
                <View style={styles.statusCardHeader}>
                    <Text style={styles.statusCardTitle}>Current Status</Text>
                    <View style={styles.statusCardStatus}>
                        <View style={[styles.statusCardDot, {
                            backgroundColor: mainStatus.isOpen ? '#10B981' : '#EF4444'
                        }]} />
                        <Text style={[styles.statusCardText, {
                            color: mainStatus.isOpen ? '#10B981' : '#EF4444'
                        }]}>
                            {mainStatus.isOpen ? 'OPEN' : 'CLOSED'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.statusMessage}>{mainStatus.message}</Text>
            </View>

            {/* General Store Hours */}
            <View style={styles.generalHoursCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>General Store Hours</Text>
                </View>
                <View style={styles.cardContent}>
                    {generalHours.map(hours => renderHoursRow(hours))}
                </View>
            </View>

            {/* Service Hours */}
            {showServiceHours && serviceHours.length > 0 && (
                <View style={styles.serviceHoursSection}>
                    <Text style={styles.sectionTitle}>Department Hours</Text>
                    {serviceHours.map(renderServiceHours)}
                </View>
            )}

            {/* Additional Information */}
            <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                    <Ionicons name="information-circle" size={20} color="#6B7280" />
                    <Text style={styles.infoTitle}>Additional Information</Text>
                </View>

                <View style={styles.infoContent}>
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>Time Zone: {timeZone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="refresh" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>Last Updated: {lastUpdated}</Text>
                    </View>

                    <View style={styles.warningBox}>
                        <View style={styles.warningContent}>
                            <Ionicons name="warning" size={16} color="#F59E0B" />
                            <Text style={styles.warningText}>
                                Store hours may vary on holidays. Please call ahead to confirm hours during holiday periods.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    // Compact View
    compactContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    compactContent: {
        padding: 16,
    },
    compactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    compactTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
    },
    compactStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactStatusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    compactStatusText: {
        fontWeight: '500',
    },
    compactMessage: {
        color: '#6B7280',
        marginBottom: 12,
    },
    compactTodayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    compactTodayLabel: {
        color: '#111827',
        fontWeight: '500',
    },
    compactTodayTime: {
        color: '#6B7280',
    },

    // Header
    header: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 20,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButtonText: {
        color: '#2563EB',
        fontWeight: '500',
        marginLeft: 4,
    },
    storeNameText: {
        color: '#6B7280',
    },

    // Status Card
    statusCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
    },
    statusCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusCardTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
    },
    statusCardStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusCardDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    statusCardText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    statusMessage: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 18,
    },

    // General Hours Card
    generalHoursCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cardTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
    },
    cardContent: {
        padding: 16,
    },

    // Hours Row
    hoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    todayRow: {
        backgroundColor: '#EFF6FF',
    },
    hoursRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    hoursIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    dayText: {
        fontWeight: '500',
        color: '#111827',
    },
    todayDayText: {
        color: '#2563EB',
    },
    holidayBadge: {
        marginLeft: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    holidayBadgeText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: 'bold',
    },
    hoursRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closedText: {
        color: '#DC2626',
        fontWeight: '500',
    },
    timeText: {
        color: '#6B7280',
    },
    todayTimeText: {
        color: '#2563EB',
        fontWeight: '600',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 8,
    },

    // Service Hours
    serviceHoursSection: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    sectionTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 16,
    },
    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    serviceHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    serviceName: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
    },
    serviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    serviceStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    serviceStatusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    serviceHoursContainer: {
        padding: 16,
    },

    // Info Card
    infoCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
    },
    infoContent: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        color: '#6B7280',
        marginLeft: 8,
    },
    warningBox: {
        backgroundColor: '#FFFBEB',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    warningContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    warningText: {
        color: '#92400E',
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },
});