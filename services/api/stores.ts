import { apiClient } from './client';
import { API } from '@/config/constants';

// Types
export interface Store {
    id: string;
    storeNumber: string;
    name: string;
    type: StoreType;
    status: StoreStatus;

    // Location
    address: StoreAddress;
    coordinates: StoreCoordinates;
    timezone: string;

    // Contact Information
    contact: StoreContact;

    // Operating Information
    hours: StoreHours;
    services: StoreService[];
    departments: StoreDepartment[];

    // Features & Amenities
    features: StoreFeature[];
    amenities: StoreAmenity[];
    accessibility: AccessibilityFeature[];

    // Ratings & Reviews
    rating: StoreRating;

    // Capacity & Traffic
    capacity: StoreCapacity;

    // Special Programs
    programs: StoreProgram[];

    // Media
    images: StoreImage[];
    virtualTour?: string;

    // Metadata
    metadata: StoreMetadata;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    lastVerified: string;
}

export type StoreType = 'supercenter' | 'neighborhood_market' | 'express' | 'pickup_point' | 'gas_station';
export type StoreStatus = 'open' | 'closed' | 'temporarily_closed' | 'coming_soon' | 'permanently_closed';

export interface StoreAddress {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    formattedAddress: string;
    isVerified: boolean;
    lastVerified?: string;
}

export interface StoreCoordinates {
    latitude: number;
    longitude: number;
    accuracy?: number;
    source: 'gps' | 'address_geocoding' | 'manual';
}

export interface StoreContact {
    phone: string;
    fax?: string;
    email?: string;
    website?: string;
    managerName?: string;
    managerEmail?: string;
}

export interface StoreHours {
    regular: WeeklyHours;
    holiday: HolidayHours[];
    special: SpecialHours[];
    isOpen24Hours: boolean;
    timezone: string;
    lastUpdated: string;
}

export interface WeeklyHours {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
}

export interface DayHours {
    open: string; // HH:MM format
    close: string; // HH:MM format
    isClosed: boolean;
    is24Hours: boolean;
    breaks?: TimeBreak[];
}

export interface TimeBreak {
    start: string;
    end: string;
    reason: string;
}

export interface HolidayHours {
    holiday: string;
    date: string;
    hours?: DayHours;
    isClosed: boolean;
    note?: string;
}

export interface SpecialHours {
    date: string;
    reason: string;
    hours?: DayHours;
    isClosed: boolean;
    note?: string;
}

export interface StoreService {
    id: string;
    name: string;
    category: ServiceCategory;
    description: string;
    isAvailable: boolean;
    hours?: ServiceHours;
    location?: ServiceLocation;
    contact?: ServiceContact;
    pricing?: ServicePricing;
    requirements?: string[];
    features: string[];
    waitTime?: ServiceWaitTime;
    appointment?: AppointmentInfo;
    rating?: ServiceRating;
}

export type ServiceCategory =
    | 'pharmacy'
    | 'vision_center'
    | 'auto_care'
    | 'photo_center'
    | 'money_services'
    | 'grocery'
    | 'deli'
    | 'bakery'
    | 'tire_installation'
    | 'oil_change'
    | 'customer_service';

export interface ServiceHours {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
    holidays?: HolidayHours[];
}

export interface ServiceLocation {
    department: string;
    floor?: number;
    section?: string;
    directions?: string;
}

export interface ServiceContact {
    phone?: string;
    extension?: string;
    email?: string;
}

export interface ServicePricing {
    currency: string;
    basePrice?: number;
    priceRange?: {
        min: number;
        max: number;
    };
    pricingModel: 'flat_rate' | 'hourly' | 'per_item' | 'variable';
    description?: string;
}

export interface ServiceWaitTime {
    current: number; // minutes
    average: number; // minutes
    peak: number; // minutes
    lastUpdated: string;
}

export interface AppointmentInfo {
    required: boolean;
    online: boolean;
    phone: boolean;
    walkIn: boolean;
    advanceNotice: number; // hours
    maxAdvanceBooking: number; // days
}

export interface ServiceRating {
    average: number;
    count: number;
    lastUpdated: string;
}

export interface StoreDepartment {
    id: string;
    name: string;
    category: DepartmentCategory;
    location: DepartmentLocation;
    isOpen: boolean;
    hours?: ServiceHours;
    manager?: string;
    phone?: string;
    features: string[];
    specialties: string[];
}

export type DepartmentCategory =
    | 'grocery'
    | 'electronics'
    | 'clothing'
    | 'home_garden'
    | 'automotive'
    | 'pharmacy'
    | 'vision'
    | 'photo'
    | 'jewelry'
    | 'toys'
    | 'sports'
    | 'health_beauty';

export interface DepartmentLocation {
    floor: number;
    section: string;
    entrance?: string;
    directions?: string;
}

export interface StoreFeature {
    type: FeatureType;
    name: string;
    description?: string;
    isAvailable: boolean;
    cost?: number;
    requirements?: string[];
}

export type FeatureType =
    | 'pickup'
    | 'delivery'
    | 'same_day_delivery'
    | 'grocery_pickup'
    | 'pharmacy_drive_thru'
    | 'gas_station'
    | 'tire_installation'
    | 'auto_care'
    | 'money_center'
    | 'photo_center'
    | 'vision_center'
    | 'restaurant'
    | 'wifi'
    | 'restrooms'
    | 'cart_sanitization';

export interface StoreAmenity {
    type: AmenityType;
    name: string;
    location?: string;
    isAvailable: boolean;
    cost?: number;
    hours?: string;
}

export type AmenityType =
    | 'parking'
    | 'restrooms'
    | 'wifi'
    | 'atm'
    | 'food_court'
    | 'pharmacy'
    | 'vision_center'
    | 'photo_center'
    | 'gas_station'
    | 'tire_center'
    | 'bank'
    | 'restaurant'
    | 'charging_station';

export interface AccessibilityFeature {
    type: AccessibilityType;
    description: string;
    isAvailable: boolean;
    location?: string;
}

export type AccessibilityType =
    | 'wheelchair_accessible'
    | 'handicap_parking'
    | 'accessible_restrooms'
    | 'mobility_carts'
    | 'hearing_assistance'
    | 'braille_signage'
    | 'service_animal_friendly'
    | 'accessible_entrance'
    | 'elevator'
    | 'wide_aisles';

export interface StoreRating {
    overall: number;
    count: number;
    breakdown: RatingBreakdown;
    recentTrend: 'up' | 'down' | 'stable';
    lastUpdated: string;
}

export interface RatingBreakdown {
    cleanliness: number;
    service: number;
    selection: number;
    prices: number;
    convenience: number;
}

export interface StoreCapacity {
    maxOccupancy: number;
    currentOccupancy?: number;
    occupancyPercent?: number;
    parkingSpaces: number;
    availableParking?: number;
    peakHours: PeakHour[];
    averageWaitTime?: number;
    lastUpdated?: string;
}

export interface PeakHour {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    occupancyLevel: 'low' | 'medium' | 'high' | 'very_high';
}

export interface StoreProgram {
    type: ProgramType;
    name: string;
    description: string;
    isActive: boolean;
    requirements?: string[];
    benefits: string[];
    enrollment?: EnrollmentInfo;
}

export type ProgramType =
    | 'walmart_plus'
    | 'pharmacy_rewards'
    | 'gas_rewards'
    | 'vision_insurance'
    | 'auto_care_membership'
    | 'grocery_delivery_unlimited'
    | 'photo_printing_rewards';

export interface EnrollmentInfo {
    method: 'online' | 'in_store' | 'phone' | 'app';
    cost?: number;
    duration?: string;
    autoRenewal?: boolean;
}

export interface StoreImage {
    id: string;
    url: string;
    type: 'exterior' | 'interior' | 'department' | 'parking' | 'entrance';
    caption?: string;
    department?: string;
    isMain: boolean;
    sortOrder: number;
    takenAt?: string;
}

export interface StoreMetadata {
    squareFootage?: number;
    employeeCount?: number;
    yearOpened?: number;
    lastRenovated?: string;
    districtManager?: string;
    regionalManager?: string;
    marketArea?: string;
    competitorStores?: CompetitorStore[];
    demographics?: StoreDemographics;
}

export interface CompetitorStore {
    name: string;
    distance: number;
    type: string;
}

export interface StoreDemographics {
    populationRadius5mi?: number;
    medianIncome?: number;
    averageAge?: number;
    householdSize?: number;
}

// Request/Response Types
export interface StoreSearchRequest {
    location?: {
        latitude: number;
        longitude: number;
    } | {
        zipCode: string;
    } | {
        city: string;
        state: string;
    };
    radius?: number; // miles
    storeTypes?: StoreType[];
    services?: ServiceCategory[];
    features?: FeatureType[];
    isOpen?: boolean;
    sort?: StoreSort;
    page?: number;
    limit?: number;
}

export interface StoreSort {
    field: 'distance' | 'rating' | 'name' | 'newest';
    direction: 'asc' | 'desc';
}

export interface StoreSearchResponse {
    stores: StoreSearchResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    searchCenter?: {
        latitude: number;
        longitude: number;
        address: string;
    };
}

export interface StoreSearchResult {
    id: string;
    name: string;
    type: StoreType;
    address: StoreAddress;
    distance: number;
    isOpen: boolean;
    hours: {
        today: string;
        tomorrow: string;
    };
    rating: number;
    reviewCount: number;
    phone: string;
    features: string[];
    services: string[];
    coordinates: StoreCoordinates;
}

export interface StoreAvailabilityRequest {
    productId: string;
    variantId?: string;
    stores?: string[];
    location?: {
        latitude: number;
        longitude: number;
        radius?: number;
    };
}

export interface StoreAvailabilityResponse {
    product: {
        id: string;
        name: string;
        image: string;
    };
    availability: StoreProductAvailability[];
}

export interface StoreProductAvailability {
    storeId: string;
    storeName: string;
    distance: number;
    inStock: boolean;
    quantity: number;
    price: number;
    lastUpdated: string;
    pickupAvailable: boolean;
    reserveAvailable: boolean;
}

export interface DirectionsRequest {
    storeId: string;
    origin?: {
        latitude: number;
        longitude: number;
    };
    travelMode?: 'driving' | 'walking' | 'transit';
}

export interface DirectionsResponse {
    routes: Route[];
    distance: string;
    duration: string;
    steps: DirectionStep[];
}

export interface Route {
    summary: string;
    distance: number;
    duration: number;
    polyline: string;
}

export interface DirectionStep {
    instruction: string;
    distance: string;
    duration: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

// Store Events & Promotions
export interface StoreEvent {
    id: string;
    title: string;
    description: string;
    type: 'sale' | 'demonstration' | 'workshop' | 'community' | 'seasonal';
    startDate: string;
    endDate: string;
    location: string;
    isRecurring: boolean;
    recurrencePattern?: string;
    cost?: number;
    registration?: {
        required: boolean;
        maxParticipants?: number;
        currentParticipants?: number;
        registrationUrl?: string;
    };
    contact?: {
        name: string;
        phone?: string;
        email?: string;
    };
}

// Store Reviews
export interface StoreReview {
    id: string;
    userId?: string;
    userName: string;
    rating: number;
    title: string;
    review: string;
    visitDate?: string;
    wouldRecommend: boolean;
    photos: string[];
    categories: {
        cleanliness: number;
        service: number;
        selection: number;
        prices: number;
    };
    helpfulVotes: number;
    createdAt: string;
    verified: boolean;
}

// Stores API Service
export const storesAPI = {
    // Store Discovery
    searchStores: async (params: StoreSearchRequest): Promise<StoreSearchResponse> => {
        const response = await apiClient.get<StoreSearchResponse>(API.ENDPOINTS.STORES.SEARCH, {
            params,
        });
        return response.data;
    },

    getStore: async (storeId: string): Promise<Store> => {
        const response = await apiClient.get<Store>(
            API.ENDPOINTS.STORES.DETAILS.replace(':id', storeId)
        );
        return response.data;
    },

    getNearbyStores: async (
        latitude: number,
        longitude: number,
        radius: number = 25,
        limit: number = 10
    ): Promise<StoreSearchResult[]> => {
        const response = await apiClient.get<StoreSearchResult[]>('/stores/nearby', {
            params: { latitude, longitude, radius, limit },
        });
        return response.data;
    },

    // Store Hours & Status
    getStoreHours: async (storeId: string): Promise<StoreHours> => {
        const response = await apiClient.get<StoreHours>(
            API.ENDPOINTS.STORES.HOURS.replace(':id', storeId)
        );
        return response.data;
    },

    isStoreOpen: async (storeId: string): Promise<{
        isOpen: boolean;
        nextStateChange?: string;
        currentHours?: string;
    }> => {
        const response = await apiClient.get(`/stores/${storeId}/is-open`);
        return response.data;
    },

    getHolidayHours: async (storeId: string, year?: number): Promise<HolidayHours[]> => {
        const response = await apiClient.get<HolidayHours[]>(`/stores/${storeId}/holiday-hours`, {
            params: { year },
        });
        return response.data;
    },

    // Store Services
    getStoreServices: async (storeId: string): Promise<StoreService[]> => {
        const response = await apiClient.get<StoreService[]>(
            API.ENDPOINTS.STORES.SERVICES.replace(':id', storeId)
        );
        return response.data;
    },

    getServiceDetails: async (storeId: string, serviceId: string): Promise<StoreService> => {
        const response = await apiClient.get<StoreService>(
            `/stores/${storeId}/services/${serviceId}`
        );
        return response.data;
    },

    getServiceWaitTime: async (storeId: string, serviceId: string): Promise<ServiceWaitTime> => {
        const response = await apiClient.get<ServiceWaitTime>(
            `/stores/${storeId}/services/${serviceId}/wait-time`
        );
        return response.data;
    },

    bookServiceAppointment: async (
        storeId: string,
        serviceId: string,
        appointment: {
            date: string;
            time: string;
            customerInfo: {
                name: string;
                phone: string;
                email?: string;
            };
            notes?: string;
        }
    ): Promise<{ appointmentId: string; confirmationNumber: string }> => {
        const response = await apiClient.post(
            `/stores/${storeId}/services/${serviceId}/appointments`,
            appointment
        );
        return response.data;
    },

    // Product Availability
    checkProductAvailability: async (
        params: StoreAvailabilityRequest
    ): Promise<StoreAvailabilityResponse> => {
        const response = await apiClient.post<StoreAvailabilityResponse>(
            '/stores/product-availability',
            params
        );
        return response.data;
    },

    reserveProduct: async (
        storeId: string,
        productId: string,
        quantity: number = 1,
        customerInfo?: {
            name: string;
            phone: string;
            email?: string;
        }
    ): Promise<{ reservationId: string; expiresAt: string }> => {
        const response = await apiClient.post(`/stores/${storeId}/reserve-product`, {
            productId,
            quantity,
            customerInfo,
        });
        return response.data;
    },

    // Directions & Navigation
    getDirections: async (params: DirectionsRequest): Promise<DirectionsResponse> => {
        const response = await apiClient.post<DirectionsResponse>('/stores/directions', params);
        return response.data;
    },

    // Store Events
    getStoreEvents: async (
        storeId: string,
        startDate?: string,
        endDate?: string
    ): Promise<StoreEvent[]> => {
        const response = await apiClient.get<StoreEvent[]>(`/stores/${storeId}/events`, {
            params: { startDate, endDate },
        });
        return response.data;
    },

    registerForEvent: async (
        eventId: string,
        participantInfo: {
            name: string;
            email: string;
            phone?: string;
            additionalInfo?: Record<string, any>;
        }
    ): Promise<{ registrationId: string }> => {
        const response = await apiClient.post(`/stores/events/${eventId}/register`, participantInfo);
        return response.data;
    },

    // Store Reviews
    getStoreReviews: async (
        storeId: string,
        page: number = 1,
        limit: number = 20,
        sort: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest'
    ): Promise<{
        reviews: StoreReview[];
        pagination: any;
        averageRating: number;
    }> => {
        const response = await apiClient.get(`/stores/${storeId}/reviews`, {
            params: { page, limit, sort },
        });
        return response.data;
    },

    createStoreReview: async (
        storeId: string,
        review: {
            rating: number;
            title: string;
            review: string;
            categories: {
                cleanliness: number;
                service: number;
                selection: number;
                prices: number;
            };
            wouldRecommend: boolean;
            visitDate?: string;
            photos?: File[];
        }
    ): Promise<StoreReview> => {
        const formData = new FormData();

        Object.keys(review).forEach(key => {
            if (key !== 'photos' && review[key as keyof typeof review] !== undefined) {
                formData.append(key, JSON.stringify(review[key as keyof typeof review]));
            }
        });

        if (review.photos) {
            review.photos.forEach((photo, index) => {
                formData.append(`photos[${index}]`, photo);
            });
        }

        const response = await apiClient.post<StoreReview>(
            `/stores/${storeId}/reviews`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // Store Analytics
    getStoreTraffic: async (storeId: string, date?: string): Promise<{
        current: number;
        capacity: number;
        percentage: number;
        peakHours: PeakHour[];
        historicalData: Array<{ time: string; occupancy: number }>;
    }> => {
        const response = await apiClient.get(`/stores/${storeId}/traffic`, {
            params: { date },
        });
        return response.data;
    },

    reportStoreIssue: async (
        storeId: string,
        issue: {
            category: 'cleanliness' | 'service' | 'accessibility' | 'safety' | 'other';
            description: string;
            location?: string;
            priority: 'low' | 'medium' | 'high' | 'urgent';
            photos?: File[];
        }
    ): Promise<{ issueId: string }> => {
        const formData = new FormData();

        Object.keys(issue).forEach(key => {
            if (key !== 'photos' && issue[key as keyof typeof issue] !== undefined) {
                formData.append(key, String(issue[key as keyof typeof issue]));
            }
        });

        if (issue.photos) {
            issue.photos.forEach((photo, index) => {
                formData.append(`photos[${index}]`, photo);
            });
        }

        const response = await apiClient.post(`/stores/${storeId}/report-issue`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Store Notifications
    subscribeToStoreUpdates: async (
        storeId: string,
        notifications: {
            hours: boolean;
            events: boolean;
            promotions: boolean;
            services: boolean;
        }
    ): Promise<void> => {
        await apiClient.post(`/stores/${storeId}/subscribe`, notifications);
    },

    unsubscribeFromStoreUpdates: async (storeId: string): Promise<void> => {
        await apiClient.delete(`/stores/${storeId}/subscribe`);
    },
};

export default storesAPI;