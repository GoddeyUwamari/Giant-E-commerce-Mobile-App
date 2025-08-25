// Store Types and Categories
export type StoreType =
    | 'supercenter'        // Full-service Walmart Supercenter
    | 'neighborhood'       // Walmart Neighborhood Market
    | 'express'            // Walmart Express (smaller format)
    | 'pickup'             // Pickup-only location
    | 'distribution'       // Distribution center
    | 'fulfillment'        // Fulfillment center
    | 'sam_club'           // Sam's Club
    | 'pharmacy'           // Standalone pharmacy
    | 'gas_station'        // Standalone gas station
    | 'auto_center'        // Automotive service center
    | 'vision_center';     // Vision/optical center

// Store Status
export type StoreStatus = 'active' | 'inactive' | 'temporarily_closed' | 'permanently_closed' | 'coming_soon' | 'under_renovation';

// Store Format
export type StoreFormat = 'standard' | 'compact' | 'urban' | 'rural' | 'highway' | 'mall' | 'strip_center' | 'standalone';

// Operating Hours
export interface StoreHours {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isOpen: boolean;
    openTime?: string; // "08:00"
    closeTime?: string; // "22:00"
    is24Hours: boolean;
    breaks?: Array<{
        startTime: string;
        endTime: string;
        reason: string;
    }>;
    notes?: string;
}

// Special Hours (holidays, events, etc.)
export interface SpecialHours {
    id: string;
    date: string;
    type: 'holiday' | 'event' | 'maintenance' | 'weather' | 'emergency';
    name: string;
    description?: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    affectedServices?: string[];
    isRecurring: boolean;
    recurringPattern?: {
        frequency: 'yearly' | 'monthly' | 'weekly';
        interval: number;
        endDate?: string;
    };
}

// Store Location and Geography
export interface StoreLocation {
    // Address information
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    county?: string;
    region?: string;

    // Geographic coordinates
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;

    // Geographic features
    timezone: string;
    utcOffset: string;
    daylightSaving: boolean;

    // Transportation and accessibility
    publicTransport?: Array<{
        type: 'bus' | 'train' | 'subway' | 'light_rail';
        line: string;
        stop: string;
        distance: number;
    }>;

    highways?: string[];
    landmarks?: string[];

    // Delivery zones
    deliveryZones?: Array<{
        id: string;
        name: string;
        zipCodes: string[];
        radius: number;
        deliveryFee: number;
        minimumOrder?: number;
    }>;
}

// Store Services and Amenities
export interface StoreService {
    id: string;
    name: string;
    type: 'department' | 'service' | 'amenity' | 'specialty';
    category: string;
    description?: string;
    isAvailable: boolean;
    hours?: StoreHours[];
    specialHours?: SpecialHours[];

    // Service details
    phone?: string;
    email?: string;
    website?: string;
    appointmentRequired?: boolean;
    walkInsAccepted?: boolean;

    // Capacity and wait times
    capacity?: number;
    averageWaitTime?: number;
    currentWaitTime?: number;

    // Pricing
    pricing?: Array<{
        service: string;
        price: number;
        duration?: number;
        description?: string;
    }>;

    // Staff
    staffCount?: number;
    specialistAvailable?: boolean;

    // Features
    features?: string[];
    equipment?: string[];
    limitations?: string[];
}

// Store Department
export interface StoreDepartment {
    id: string;
    name: string;
    code: string;
    category: string;
    description?: string;

    // Location within store
    floor?: number;
    section?: string;
    aisle?: string;
    position?: {
        x: number;
        y: number;
        floor: number;
    };

    // Staff and management
    managerId?: string;
    managerName?: string;
    staffCount: number;

    // Hours (if different from store)
    hours?: StoreHours[];

    // Inventory and products
    productCount?: number;
    categories: string[];
    brands?: string[];

    // Services offered
    services: StoreService[];

    // Features
    features?: string[];
    isActive: boolean;
}

// Store Facilities and Infrastructure
export interface StoreFacilities {
    // Building information
    buildingSize: number; // square feet
    salesFloor: number;
    backroom: number;
    parkingSpaces: number;
    floors: number;

    // Accessibility
    accessibility: {
        wheelchairAccessible: boolean;
        automaticDoors: boolean;
        elevators: boolean;
        brailleSigns: boolean;
        hearingLoop: boolean;
        accessibleParking: boolean;
        accessibleRestrooms: boolean;
    };

    // Amenities
    amenities: {
        restrooms: boolean;
        waterFountains: boolean;
        seatingArea: boolean;
        foodCourt: boolean;
        cafe: boolean;
        playground: boolean;
        wifi: boolean;
        chargingStations: boolean;
        atmMachines: boolean;
        lockers: boolean;
    };

    // Safety and security
    security: {
        cameras: number;
        securityGuards: boolean;
        emergencyExits: number;
        fireExtinguishers: number;
        defibrillator: boolean;
        firstAidStation: boolean;
    };

    // Technology
    technology: {
        selfCheckout: boolean;
        scanAndGo: boolean;
        mobilePayment: boolean;
        priceCheckers: boolean;
        digitalSigns: boolean;
        interactiveKiosks: boolean;
    };

    // Environmental
    environmental: {
        solarPanels: boolean;
        ledLighting: boolean;
        recyclingCenter: boolean;
        electricVehicleCharging: boolean;
        rainwaterHarvesting: boolean;
        energyRating?: string;
    };
}

// Store Contact Information
export interface StoreContact {
    // General contact
    phone: string;
    fax?: string;
    email?: string;
    website?: string;

    // Management contacts
    manager?: {
        name: string;
        phone?: string;
        email?: string;
    };

    // Department contacts
    departments?: Record<string, {
        phone?: string;
        email?: string;
        extension?: string;
    }>;

    // Emergency contacts
    emergency?: {
        phone: string;
        afterHours?: string;
        security?: string;
    };

    // Customer service
    customerService?: {
        phone: string;
        email: string;
        hours: string;
    };
}

// Store Inventory and Availability
export interface StoreInventory {
    storeId: string;
    productId: string;
    sku: string;

    // Stock levels
    quantity: number;
    reserved: number;
    available: number;
    incoming: number;

    // Location in store
    location?: {
        aisle: string;
        shelf: string;
        bin?: string;
        section?: string;
    };

    // Pricing
    price: number;
    salePrice?: number;
    memberPrice?: number;
    clearancePrice?: number;

    // Status
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'seasonal';
    restockDate?: string;
    lastUpdated: string;

    // Fulfillment options
    availableForPickup: boolean;
    availableForDelivery: boolean;
    pickupTime?: number; // minutes

    // Special handling
    refrigerated: boolean;
    fragile: boolean;
    oversized: boolean;
    ageRestricted: boolean;
    prescriptionRequired: boolean;
}

// Store Performance Metrics
export interface StoreMetrics {
    storeId: string;
    period: string;

    // Sales metrics
    revenue: number;
    transactions: number;
    averageTransactionValue: number;
    unitsPerTransaction: number;

    // Customer metrics
    footTraffic: number;
    conversionRate: number;
    customerSatisfaction: number;
    repeatCustomers: number;

    // Operational metrics
    staffCount: number;
    salesPerEmployee: number;
    salesPerSquareFoot: number;
    inventoryTurnover: number;

    // Service metrics
    averageWaitTime: number;
    serviceLevel: number;
    onTimePickup: number;
    onTimeDelivery: number;

    // Digital metrics
    onlineOrders: number;
    clickAndCollect: number;
    mobileAppUsage: number;
    digitalPayments: number;

    // Trends
    growthRate: number;
    seasonalIndex: number;
    benchmarkComparison: number;
}

// Store Events and Promotions
export interface StoreEvent {
    id: string;
    storeId: string;
    title: string;
    description: string;
    type: 'sale' | 'promotion' | 'grand_opening' | 'seasonal' | 'community' | 'demo' | 'class' | 'health';

    // Timing
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    allDay: boolean;

    // Location
    location?: string;
    department?: string;

    // Details
    targetAudience?: string[];
    ageRestriction?: number;
    registrationRequired: boolean;
    cost?: number;
    capacity?: number;
    currentRegistrations?: number;

    // Marketing
    image?: string;
    promotional: boolean;
    featured: boolean;
    tags: string[];

    // Contact
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;

    // Status
    status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'postponed';

    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

// Store Pickup and Delivery Options
export interface StorePickupOptions {
    // Curbside pickup
    curbside: {
        available: boolean;
        hours?: StoreHours[];
        spots: number;
        averageWaitTime: number;
        instructions?: string;
        requiresApp: boolean;
    };

    // In-store pickup
    inStore: {
        available: boolean;
        hours?: StoreHours[];
        location: string;
        instructions?: string;
        counterHours?: StoreHours[];
    };

    // Locker pickup
    lockers: {
        available: boolean;
        count: number;
        sizes: Array<{
            size: 'small' | 'medium' | 'large' | 'xlarge';
            count: number;
            dimensions: {
                width: number;
                height: number;
                depth: number;
            };
        }>;
        hours?: StoreHours[];
        accessCode: boolean;
    };

    // Drive-through pickup
    driveThrough: {
        available: boolean;
        lanes: number;
        hours?: StoreHours[];
        averageWaitTime: number;
        restrictions?: string[];
    };
}

export interface StoreDeliveryOptions {
    // Same-day delivery
    sameDay: {
        available: boolean;
        cutoffTime: string;
        fee: number;
        freeThreshold?: number;
        zones: string[];
        estimatedTime: number;
    };

    // Scheduled delivery
    scheduled: {
        available: boolean;
        timeSlots: Array<{
            start: string;
            end: string;
            fee: number;
            available: boolean;
        }>;
        advanceBooking: number; // days
        zones: string[];
    };

    // Express delivery
    express: {
        available: boolean;
        timeOptions: Array<{
            duration: number; // minutes
            fee: number;
            cutoffTime: string;
        }>;
        zones: string[];
    };

    // Grocery delivery
    grocery: {
        available: boolean;
        minimumOrder: number;
        fee: number;
        freeThreshold?: number;
        zones: string[];
        timeSlots: Array<{
            start: string;
            end: string;
            fee: number;
            available: boolean;
        }>;
    };
}

// Main Store Interface
export interface Store {
    // Basic Information
    id: string;
    storeNumber: string;
    name: string;
    displayName?: string;
    type: StoreType;
    format: StoreFormat;
    status: StoreStatus;

    // Location and Contact
    location: StoreLocation;
    contact: StoreContact;

    // Operating Information
    hours: StoreHours[];
    specialHours: SpecialHours[];
    timezone: string;

    // Facilities and Services
    facilities: StoreFacilities;
    departments: StoreDepartment[];
    services: StoreService[];

    // Pickup and Delivery
    pickupOptions: StorePickupOptions;
    deliveryOptions: StoreDeliveryOptions;

    // Inventory and Products
    inventoryCount?: number;
    productCategories: string[];
    brands?: string[];

    // Marketing and Events
    events: StoreEvent[];
    promotions?: Array<{
        id: string;
        title: string;
        description: string;
        validUntil: string;
        image?: string;
    }>;

    // Performance and Ratings
    metrics?: StoreMetrics;
    rating?: {
        average: number;
        count: number;
        breakdown: {
            cleanliness: number;
            service: number;
            selection: number;
            prices: number;
            convenience: number;
        };
    };

    // Management
    management: {
        managerId: string;
        managerName: string;
        districtManagerId?: string;
        regionManagerId?: string;
    };

    // Operational Details
    openingDate?: string;
    lastRenovation?: string;
    nextRenovation?: string;
    employeeCount?: number;

    // Digital Integration
    features: {
        mobileOrdering: boolean;
        curbsidePickup: boolean;
        scanAndGo: boolean;
        selfCheckout: boolean;
        digitalReceipts: boolean;
        wifiAvailable: boolean;
        appIntegration: boolean;
    };

    // Compliance and Certifications
    licenses?: string[];
    certifications?: string[];
    inspections?: Array<{
        type: string;
        date: string;
        score?: number;
        passed: boolean;
    }>;

    // Images and Media
    images: string[];
    floorPlan?: string;
    streetView?: string;

    // Metadata
    createdAt: string;
    updatedAt: string;
    lastInventoryUpdate?: string;

    // Custom fields
    customFields?: Record<string, any>;
    metadata?: Record<string, any>;
}

// Store Search and Filtering
export interface StoreSearchFilters {
    // Location-based
    latitude?: number;
    longitude?: number;
    radius?: number; // miles
    zipCode?: string;
    city?: string;
    state?: string;

    // Store attributes
    type?: StoreType[];
    status?: StoreStatus[];
    format?: StoreFormat[];

    // Services and features
    services?: string[];
    departments?: string[];
    features?: string[];

    // Hours and availability
    openNow?: boolean;
    open24Hours?: boolean;
    openOnDate?: string;

    // Accessibility
    wheelchairAccessible?: boolean;

    // Pickup and delivery
    curbsidePickup?: boolean;
    sameDay Delivery?: boolean;
    groceryDelivery?: boolean;

    // Performance
    minRating?: number;

    // Custom filters
    customFilters?: Record<string, any>;
}

export interface StoreSearchResult {
    stores: Store[];
    total: number;

    // Search metadata
    searchLocation?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    searchRadius?: number;

    // Distance calculations
    distances?: Record<string, number>;

    // Suggestions
    nearbyStores?: Store[];
    alternativeLocations?: string[];
}

// Store Operations
export interface StoreHoursUpdate {
    storeId: string;
    hours: StoreHours[];
    effectiveDate?: string;
    reason?: string;
    updatedBy: string;
}

export interface StoreInventoryUpdate {
    storeId: string;
    updates: Array<{
        productId: string;
        sku: string;
        quantity?: number;
        price?: number;
        status?: StoreInventory['status'];
        location?: StoreInventory['location'];
    }>;
    source: 'manual' | 'system' | 'pos' | 'import';
    timestamp: string;
    updatedBy: string;
}

export interface StoreServiceUpdate {
    storeId: string;
    serviceId: string;
    updates: {
        isAvailable?: boolean;
        hours?: StoreHours[];
        waitTime?: number;
        capacity?: number;
        notes?: string;
    };
    updatedBy: string;
    timestamp: string;
}

// Store Analytics
export interface StoreAnalytics {
    storeId: string;
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate: string;
    endDate: string;

    // Customer analytics
    customerMetrics: {
        totalVisitors: number;
        uniqueVisitors: number;
        repeatVisitRate: number;
        averageVisitDuration: number;
        peakHours: Array<{
            hour: number;
            visitors: number;
        }>;
        demographicBreakdown: Record<string, number>;
    };

    // Sales analytics
    salesMetrics: {
        totalRevenue: number;
        transactionCount: number;
        averageBasketSize: number;
        conversionRate: number;
        topCategories: Array<{
            category: string;
            revenue: number;
            units: number;
        }>;
        paymentMethods: Record<string, number>;
    };

    // Service analytics
    serviceMetrics: {
        pickupOrders: number;
        deliveryOrders: number;
        averagePickupTime: number;
        customerSatisfaction: number;
        serviceIssues: number;
    };

    // Operational analytics
    operationalMetrics: {
        staffUtilization: number;
        inventoryTurnover: number;
        outOfStockIncidents: number;
        maintenanceIssues: number;
        energyConsumption: number;
    };
}

// Store Notifications and Alerts
export interface StoreNotification {
    id: string;
    storeId: string;
    type: 'hours_change' | 'service_update' | 'inventory_alert' | 'promotion' | 'event' | 'emergency';
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;

    // Targeting
    audience: 'all' | 'customers' | 'employees' | 'management';
    channels: ('app' | 'email' | 'sms' | 'website')[];

    // Timing
    createdAt: string;
    scheduledFor?: string;
    expiresAt?: string;

    // Metadata
    createdBy: string;
    acknowledged: boolean;
    actionRequired: boolean;
    actionUrl?: string;
}

// Type Guards and Utilities
export const isStoreOpen = (store: Store, date: Date = new Date()): boolean => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()] as StoreHours['day'];

    // Check special hours first
    const dateString = date.toISOString().split('T')[0];
    const specialHour = store.specialHours.find(sh => sh.date === dateString);
    if (specialHour) {
        return specialHour.isOpen;
    }

    // Check regular hours
    const dayHours = store.hours.find(h => h.day === dayName);
    if (!dayHours || !dayHours.isOpen) {
        return false;
    }

    if (dayHours.is24Hours) {
        return true;
    }

    const currentTime = date.toTimeString().substring(0, 5);
    return currentTime >= dayHours.openTime! && currentTime <= dayHours.closeTime!;
};

export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export const getStoreDistance = (store: Store, userLat: number, userLon: number): number => {
    return calculateDistance(userLat, userLon, store.location.latitude, store.location.longitude);
};

export const hasService = (store: Store, serviceName: string): boolean => {
    return store.services.some(service =>
        service.name.toLowerCase().includes(serviceName.toLowerCase()) && service.isAvailable
    );
};

export const getNextOpenTime = (store: Store): string | null => {
    const now = new Date();
    const today = now.getDay();

    // Check if store is currently open
    if (isStoreOpen(store, now)) {
        return 'Open now';
    }

    // Find next opening time
    for (let i = 0; i < 7; i++) {
        const checkDay = (today + i) % 7;
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[checkDay] as StoreHours['day'];

        const dayHours = store.hours.find(h => h.day === dayName);
        if (dayHours && dayHours.isOpen && dayHours.openTime) {
            if (i === 0) {
                // Same day - check if opening time is in the future
                const currentTime = now.toTimeString().substring(0, 5);
                if (currentTime < dayHours.openTime) {
                    return `Opens today at ${dayHours.openTime}`;
                }
            } else {
                return `Opens ${dayName} at ${dayHours.openTime}`;
            }
        }
    }

    return null; // Store never opens (shouldn't happen)
};

// Default configurations
export const DEFAULT_STORE_HOURS: StoreHours[] = [
    { day: 'monday', isOpen: true, openTime: '06:00', closeTime: '23:00', is24Hours: false },
    { day: 'tuesday', isOpen: true, openTime: '06:00', closeTime: '23:00', is24Hours: false },
    { day: 'wednesday', isOpen: true, openTime: '06:00', closeTime: '23:00', is24Hours: false },
    { day: 'thursday', isOpen: true, openTime: '06:00', closeTime: '23:00', is24Hours: false },
    { day: 'friday', isOpen: true, openTime: '06:00', closeTime: '23:00', is24Hours: false },
    { day: 'saturday', isOpen: true, openTime: '06:00', closeTime: '23:00', is24Hours: false },
    { day: 'sunday', isOpen: true, openTime: '06:00', closeTime: '23:00', is24Hours: false },
];

export const COMMON_STORE_SERVICES = [
    'Pharmacy',
    'Vision Center',
    'Auto Care Center',
    'Tire & Lube Express',
    'Photo Center',
    'Money Services',
    'Deli',
    'Bakery',
    'Grocery Pickup',
    'Curbside Pickup',
    'Self-Checkout',
    'Customer Service',
    'Returns & Exchanges',
    'Layaway',
    'Site to Store',
] as const;