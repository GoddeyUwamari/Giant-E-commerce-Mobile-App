import { CURRENCY_CONFIG, DATE_FORMATS } from './constants';

// Currency Formatting
export const formatCurrency = (
    amount: number,
    currency: string = CURRENCY_CONFIG.DEFAULT_CURRENCY,
    options: {
        showSymbol?: boolean;
        showCode?: boolean;
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
    } = {}
): string => {
    const {
        showSymbol = true,
        showCode = false,
        minimumFractionDigits = CURRENCY_CONFIG.DECIMAL_PLACES,
        maximumFractionDigits = CURRENCY_CONFIG.DECIMAL_PLACES,
    } = options;

    try {
        const formatter = new Intl.NumberFormat('en-US', {
            style: showSymbol ? 'currency' : 'decimal',
            currency,
            minimumFractionDigits,
            maximumFractionDigits,
        });

        const formatted = formatter.format(amount);

        if (showCode && !showSymbol) {
            return `${formatted} ${currency}`;
        }

        return formatted;
    } catch (error) {
        // Fallback formatting
        const symbol = showSymbol ? CURRENCY_CONFIG.SYMBOLS[currency as keyof typeof CURRENCY_CONFIG.SYMBOLS] || '$' : '';
        const fixed = amount.toFixed(maximumFractionDigits);
        const withCommas = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY_CONFIG.THOUSAND_SEPARATOR);

        return showCode ? `${symbol}${withCommas} ${currency}` : `${symbol}${withCommas}`;
    }
};

// Price formatting with special handling for free items
export const formatPrice = (
    price: number,
    originalPrice?: number,
    currency: string = CURRENCY_CONFIG.DEFAULT_CURRENCY
): {
    price: string;
    originalPrice?: string;
    isOnSale: boolean;
    discount?: string;
    discountPercentage?: number;
} => {
    if (price === 0) {
        return {
            price: 'Free',
            isOnSale: false,
        };
    }

    const formattedPrice = formatCurrency(price, currency);
    const isOnSale = originalPrice ? originalPrice > price : false;

    let result: any = {
        price: formattedPrice,
        isOnSale,
    };

    if (isOnSale && originalPrice) {
        result.originalPrice = formatCurrency(originalPrice, currency);
        result.discount = formatCurrency(originalPrice - price, currency);
        result.discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    return result;
};

// Percentage formatting
export const formatPercentage = (
    value: number,
    options: {
        decimals?: number;
        showSign?: boolean;
        showSymbol?: boolean;
    } = {}
): string => {
    const { decimals = 0, showSign = false, showSymbol = true } = options;

    const sign = showSign && value > 0 ? '+' : '';
    const symbol = showSymbol ? '%' : '';

    return `${sign}${value.toFixed(decimals)}${symbol}`;
};

// Number formatting with units
export const formatNumber = (
    value: number,
    options: {
        unit?: string;
        decimals?: number;
        compact?: boolean;
        showThousands?: boolean;
    } = {}
): string => {
    const { unit = '', decimals = 0, compact = false, showThousands = true } = options;

    if (compact) {
        // Format large numbers compactly (1.2K, 1.5M, etc.)
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M${unit}`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K${unit}`;
        }
    }

    const formatted = showThousands
        ? value.toLocaleString('en-US', { maximumFractionDigits: decimals })
        : value.toFixed(decimals);

    return unit ? `${formatted} ${unit}` : formatted;
};

// Distance formatting
export const formatDistance = (
    distance: number,
    unit: 'miles' | 'kilometers' | 'feet' | 'meters' = 'miles',
    precision: number = 1
): string => {
    if (distance === 0) {
        return unit === 'miles' || unit === 'feet' ? '0 ft' : '0 m';
    }

    let value = distance;
    let displayUnit = unit;

    // Convert to more appropriate units for small distances
    if (unit === 'miles' && distance < 1) {
        value = distance * 5280; // Convert to feet
        displayUnit = 'feet';
        precision = 0;
    } else if (unit === 'kilometers' && distance < 1) {
        value = distance * 1000; // Convert to meters
        displayUnit = 'meters';
        precision = 0;
    }

    const abbreviated = {
        miles: 'mi',
        kilometers: 'km',
        feet: 'ft',
        meters: 'm',
    };

    return `${formatNumber(value, { decimals: precision })} ${abbreviated[displayUnit]}`;
};

// Weight formatting
export const formatWeight = (
    weight: number,
    unit: 'pounds' | 'ounces' | 'grams' | 'kilograms' = 'pounds'
): string => {
    const abbreviated = {
        pounds: 'lbs',
        ounces: 'oz',
        grams: 'g',
        kilograms: 'kg',
    };

    const decimals = unit === 'grams' || unit === 'ounces' ? 0 : 1;

    return `${formatNumber(weight, { decimals })} ${abbreviated[unit]}`;
};

// Date and Time Formatting
export const formatDate = (
    date: Date | string | number,
    format: keyof typeof DATE_FORMATS | string = 'SHORT_DATE',
    options: {
        timezone?: string;
        locale?: string;
    } = {}
): string => {
    const { timezone, locale = 'en-US' } = options;
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
    };

    try {
        switch (format) {
            case 'FULL_DATE':
                return dateObj.toLocaleDateString(locale, {
                    ...formatOptions,
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

            case 'SHORT_DATE':
                return dateObj.toLocaleDateString(locale, {
                    ...formatOptions,
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });

            case 'NUMERIC_DATE':
                return dateObj.toLocaleDateString(locale, {
                    ...formatOptions,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                });

            case 'ISO_DATE':
                return dateObj.toISOString().split('T')[0];

            case 'TIME_12':
                return dateObj.toLocaleTimeString(locale, {
                    ...formatOptions,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });

            case 'TIME_24':
                return dateObj.toLocaleTimeString(locale, {
                    ...formatOptions,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });

            case 'DATETIME':
                return dateObj.toLocaleString(locale, {
                    ...formatOptions,
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });

            case 'RELATIVE':
                return formatRelativeTime(dateObj);

            default:
                // Custom format string
                return dateObj.toLocaleDateString(locale, formatOptions);
        }
    } catch (error) {
        return dateObj.toLocaleDateString();
    }
};

// Relative time formatting (e.g., "2 hours ago", "in 3 days")
export const formatRelativeTime = (
    date: Date | string | number,
    baseDate: Date = new Date(),
    options: {
        style?: 'long' | 'short' | 'narrow';
        numeric?: 'always' | 'auto';
    } = {}
): string => {
    const { style = 'long', numeric = 'auto' } = options;
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((targetDate.getTime() - baseDate.getTime()) / 1000);

    try {
        const rtf = new Intl.RelativeTimeFormat('en-US', { style, numeric });

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2628000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
            if (count >= 1) {
                return rtf.format(diffInSeconds < 0 ? -count : count, interval.label as Intl.RelativeTimeFormatUnit);
            }
        }

        return rtf.format(0, 'second');
    } catch (error) {
        // Fallback for environments without Intl.RelativeTimeFormat
        const absDiff = Math.abs(diffInSeconds);
        const isPast = diffInSeconds < 0;

        if (absDiff < 60) return isPast ? 'just now' : 'in a moment';
        if (absDiff < 3600) return isPast ? `${Math.floor(absDiff / 60)}m ago` : `in ${Math.floor(absDiff / 60)}m`;
        if (absDiff < 86400) return isPast ? `${Math.floor(absDiff / 3600)}h ago` : `in ${Math.floor(absDiff / 3600)}h`;
        return isPast ? `${Math.floor(absDiff / 86400)}d ago` : `in ${Math.floor(absDiff / 86400)}d`;
    }
};

// Duration formatting (e.g., "2h 30m", "1d 5h")
export const formatDuration = (
    seconds: number,
    options: {
        compact?: boolean;
        maxUnits?: number;
        showSeconds?: boolean;
    } = {}
): string => {
    const { compact = false, maxUnits = 2, showSeconds = true } = options;

    if (seconds === 0) {
        return compact ? '0s' : '0 seconds';
    }

    const units = [
        { label: compact ? 'd' : 'day', seconds: 86400 },
        { label: compact ? 'h' : 'hour', seconds: 3600 },
        { label: compact ? 'm' : 'minute', seconds: 60 },
        { label: compact ? 's' : 'second', seconds: 1 },
    ];

    const parts: string[] = [];
    let remaining = Math.abs(seconds);

    for (const unit of units) {
        if (!showSeconds && unit.label.includes('s') && unit.seconds === 1) continue;

        const count = Math.floor(remaining / unit.seconds);
        if (count > 0 && parts.length < maxUnits) {
            const label = compact ? unit.label : count === 1 ? unit.label : `${unit.label}s`;
            parts.push(compact ? `${count}${unit.label}` : `${count} ${label}`);
            remaining -= count * unit.seconds;
        }
    }

    return parts.length > 0 ? parts.join(compact ? ' ' : ', ') : (compact ? '0s' : '0 seconds');
};

// Phone number formatting
export const formatPhoneNumber = (
    phoneNumber: string,
    format: 'national' | 'international' | 'e164' | 'masked' = 'national'
): string => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    if (digits.length === 0) return '';

    // Handle US/Canada numbers (10-11 digits)
    if (digits.length === 10 || (digits.length === 11 && digits[0] === '1')) {
        const number = digits.length === 11 ? digits.slice(1) : digits;
        const areaCode = number.slice(0, 3);
        const exchange = number.slice(3, 6);
        const lineNumber = number.slice(6, 10);

        switch (format) {
            case 'national':
                return `(${areaCode}) ${exchange}-${lineNumber}`;
            case 'international':
                return `+1 (${areaCode}) ${exchange}-${lineNumber}`;
            case 'e164':
                return `+1${number}`;
            case 'masked':
                return `(${areaCode}) ***-${lineNumber.slice(-2)}`;
            default:
                return `(${areaCode}) ${exchange}-${lineNumber}`;
        }
    }

    // For other international numbers, just add spaces every 3-4 digits
    if (format === 'international' && !digits.startsWith('1')) {
        return `+${digits.replace(/(\d{1,3})(\d{1,4})?(\d{1,4})?(\d{1,4})?/, '$1 $2 $3 $4').trim()}`;
    }

    return phoneNumber; // Return original if can't format
};

// Credit card formatting
export const formatCreditCard = (
    cardNumber: string,
    options: {
        mask?: boolean;
        showLast?: number;
        separator?: string;
    } = {}
): string => {
    const { mask = false, showLast = 4, separator = ' ' } = options;
    const digits = cardNumber.replace(/\D/g, '');

    if (digits.length === 0) return '';

    if (mask) {
        // Show only last N digits
        const visibleDigits = digits.slice(-showLast);
        const maskedLength = Math.max(0, digits.length - showLast);
        const masked = '*'.repeat(maskedLength);

        // Add spacing for readability
        const fullMasked = masked + visibleDigits;
        return fullMasked.replace(/(.{4})/g, '$1' + separator).trim();
    }

    // Format with spaces every 4 digits
    return digits.replace(/(.{4})/g, '$1' + separator).trim();
};

// Address formatting
export const formatAddress = (
    address: {
        street?: string;
        apartment?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    },
    options: {
        multiline?: boolean;
        includeCountry?: boolean;
        compact?: boolean;
    } = {}
): string => {
    const { multiline = false, includeCountry = false, compact = false } = options;
    const parts: string[] = [];

    // Street address
    if (address.street) {
        let streetLine = address.street;
        if (address.apartment) {
            streetLine += compact ? ` #${address.apartment}` : `, ${address.apartment}`;
        }
        parts.push(streetLine);
    }

    // City, state, zip
    const cityStateZip: string[] = [];
    if (address.city) cityStateZip.push(address.city);
    if (address.state) cityStateZip.push(address.state);
    if (address.zipCode) cityStateZip.push(address.zipCode);

    if (cityStateZip.length > 0) {
        if (compact) {
            parts.push(cityStateZip.join(', '));
        } else {
            const stateZip = [address.state, address.zipCode].filter(Boolean).join(' ');
            if (address.city && stateZip) {
                parts.push(`${address.city}, ${stateZip}`);
            } else {
                parts.push(cityStateZip.join(', '));
            }
        }
    }

    // Country
    if (includeCountry && address.country && address.country !== 'US') {
        parts.push(address.country);
    }

    return parts.join(multiline ? '\n' : ', ');
};

// File size formatting
export const formatFileSize = (
    bytes: number,
    options: {
        decimals?: number;
        binary?: boolean;
    } = {}
): string => {
    const { decimals = 1, binary = false } = options;

    if (bytes === 0) return '0 B';

    const base = binary ? 1024 : 1000;
    const units = binary
        ? ['B', 'KiB', 'MiB', 'GiB', 'TiB']
        : ['B', 'KB', 'MB', 'GB', 'TB'];

    const exponent = Math.floor(Math.log(bytes) / Math.log(base));
    const value = bytes / Math.pow(base, exponent);

    return `${value.toFixed(decimals)} ${units[exponent]}`;
};

// SKU/Product code formatting
export const formatSKU = (sku: string): string => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = sku.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Add hyphens for readability (every 4 characters)
    return cleaned.replace(/(.{4})/g, '$1-').replace(/-$/, '');
};

// Order number formatting
export const formatOrderNumber = (orderNumber: string): string => {
    // Format as WM-XXXX-XXXX-XXXX
    const digits = orderNumber.replace(/\D/g, '');

    if (digits.length >= 12) {
        return `WM-${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    }

    return orderNumber;
};

// Rating formatting
export const formatRating = (
    rating: number,
    options: {
        maxRating?: number;
        showMax?: boolean;
        symbol?: string;
        decimals?: number;
    } = {}
): string => {
    const { maxRating = 5, showMax = false, symbol = '★', decimals = 1 } = options;

    const formattedRating = rating.toFixed(decimals);
    const stars = symbol.repeat(Math.floor(rating));

    if (showMax) {
        return `${formattedRating}/${maxRating}`;
    }

    return `${formattedRating} ${stars}`;
};

// List formatting (e.g., "Apple, Orange, and Banana")
export const formatList = (
    items: string[],
    options: {
        conjunction?: 'and' | 'or';
        style?: 'long' | 'short' | 'narrow';
        maxItems?: number;
        moreText?: string;
    } = {}
): string => {
    const { conjunction = 'and', style = 'long', maxItems, moreText = 'more' } = options;

    if (items.length === 0) return '';

    let displayItems = items;
    let hasMore = false;

    if (maxItems && items.length > maxItems) {
        displayItems = items.slice(0, maxItems);
        hasMore = true;
    }

    try {
        const formatter = new Intl.ListFormat('en-US', { style, type: conjunction });
        let result = formatter.format(displayItems);

        if (hasMore) {
            const remainingCount = items.length - maxItems!;
            result += ` ${conjunction} ${remainingCount} ${moreText}`;
        }

        return result;
    } catch (error) {
        // Fallback for environments without Intl.ListFormat
        if (displayItems.length === 1) return displayItems[0];
        if (displayItems.length === 2) return `${displayItems[0]} ${conjunction} ${displayItems[1]}`;

        const allButLast = displayItems.slice(0, -1).join(', ');
        const last = displayItems[displayItems.length - 1];
        let result = `${allButLast}, ${conjunction} ${last}`;

        if (hasMore) {
            const remainingCount = items.length - maxItems!;
            result += ` ${conjunction} ${remainingCount} ${moreText}`;
        }

        return result;
    }
};

// Truncate text with ellipsis
export const truncateText = (
    text: string,
    options: {
        maxLength?: number;
        wordBoundary?: boolean;
        ellipsis?: string;
        stripHtml?: boolean;
    } = {}
): string => {
    const { maxLength = 100, wordBoundary = true, ellipsis = '...', stripHtml = false } = options;

    let processedText = text;

    // Strip HTML tags if requested
    if (stripHtml) {
        processedText = text.replace(/<[^>]*>/g, '');
    }

    if (processedText.length <= maxLength) {
        return processedText;
    }

    let truncated = processedText.slice(0, maxLength);

    if (wordBoundary) {
        // Find the last space to avoid cutting words
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            truncated = truncated.slice(0, lastSpace);
        }
    }

    return truncated + ellipsis;
};

// Capitalize text
export const capitalizeText = (
    text: string,
    style: 'first' | 'words' | 'sentences' = 'first'
): string => {
    if (!text) return '';

    switch (style) {
        case 'first':
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

        case 'words':
            return text.replace(/\w\S*/g, (txt) =>
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );

        case 'sentences':
            return text.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (txt) =>
                txt.toUpperCase()
            );

        default:
            return text;
    }
};