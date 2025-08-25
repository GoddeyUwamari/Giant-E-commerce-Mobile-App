import { REGEX_PATTERNS, BUSINESS_RULES, ERROR_MESSAGES } from './constants';

// Validation result interface
export interface ValidationResult {
    isValid: boolean;
    error?: string;
    field?: string;
}

// Validation options interface
export interface ValidationOptions {
    required?: boolean;
    trim?: boolean;
    customMessage?: string;
}

// Base validator function type
export type ValidatorFunction = (value: any, options?: ValidationOptions) => ValidationResult;

// Helper function to create validation result
const createResult = (isValid: boolean, error?: string, field?: string): ValidationResult => ({
    isValid,
    error,
    field,
});

// Required field validator
export const required = (value: any, options: ValidationOptions = {}): ValidationResult => {
    const { customMessage } = options;

    if (value === null || value === undefined || value === '') {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    if (typeof value === 'string' && value.trim() === '') {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    if (Array.isArray(value) && value.length === 0) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    return createResult(true);
};

// Email validator
export const email = (value: string, options: ValidationOptions = {}): ValidationResult => {
    const { required: isRequired = false, trim = true, customMessage } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    if (!REGEX_PATTERNS.EMAIL.test(processedValue)) {
        return createResult(false, customMessage || ERROR_MESSAGES.INVALID_EMAIL);
    }

    // Additional email validation
    if (processedValue.length > 254) {
        return createResult(false, 'Email address is too long');
    }

    const [localPart, domain] = processedValue.split('@');
    if (localPart.length > 64) {
        return createResult(false, 'Email local part is too long');
    }

    return createResult(true);
};

// Phone number validator
export const phone = (value: string, options: ValidationOptions = {}): ValidationResult => {
    const { required: isRequired = false, trim = true, customMessage } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    // Remove all non-digit characters for validation
    const digits = processedValue.replace(/\D/g, '');

    // US phone numbers: 10 digits, or 11 digits starting with 1
    if (digits.length === 10 || (digits.length === 11 && digits[0] === '1')) {
        return createResult(true);
    }

    // International format validation
    if (processedValue.startsWith('+') && digits.length >= 10 && digits.length <= 15) {
        return createResult(true);
    }

    return createResult(false, customMessage || ERROR_MESSAGES.INVALID_PHONE);
};

// Password validator
export const password = (
    value: string,
    options: ValidationOptions & {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
        maxLength?: number;
    } = {}
): ValidationResult => {
    const {
        required: isRequired = true,
        trim = true,
        customMessage,
        minLength = 8,
        maxLength = 128,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = true,
    } = options;

    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    if (processedValue.length < minLength) {
        return createResult(false, `Password must be at least ${minLength} characters long`);
    }

    if (processedValue.length > maxLength) {
        return createResult(false, `Password must be no more than ${maxLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(processedValue)) {
        return createResult(false, 'Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(processedValue)) {
        return createResult(false, 'Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !/\d/.test(processedValue)) {
        return createResult(false, 'Password must contain at least one number');
    }

    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(processedValue)) {
        return createResult(false, 'Password must contain at least one special character');
    }

    // Check for common weak passwords
    const weakPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    if (weakPasswords.includes(processedValue.toLowerCase())) {
        return createResult(false, 'Password is too common. Please choose a stronger password');
    }

    return createResult(true);
};

// Confirm password validator
export const confirmPassword = (
    value: string,
    originalPassword: string,
    options: ValidationOptions = {}
): ValidationResult => {
    const { required: isRequired = true, trim = true, customMessage } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    if (processedValue !== originalPassword) {
        return createResult(false, customMessage || ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH);
    }

    return createResult(true);
};

// ZIP code validator
export const zipCode = (value: string, options: ValidationOptions = {}): ValidationResult => {
    const { required: isRequired = false, trim = true, customMessage } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    if (!REGEX_PATTERNS.ZIP_CODE.test(processedValue)) {
        return createResult(false, customMessage || ERROR_MESSAGES.INVALID_ZIP_CODE);
    }

    return createResult(true);
};

// Credit card validator
export const creditCard = (value: string, options: ValidationOptions = {}): ValidationResult => {
    const { required: isRequired = false, trim = true, customMessage } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    // Remove spaces and dashes
    const cardNumber = processedValue.replace(/[\s-]/g, '');

    // Check if all characters are digits
    if (!/^\d+$/.test(cardNumber)) {
        return createResult(false, 'Credit card number must contain only digits');
    }

    // Check length (13-19 digits for most cards)
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return createResult(false, 'Credit card number must be between 13 and 19 digits');
    }

    // Luhn algorithm validation
    if (!luhnCheck(cardNumber)) {
        return createResult(false, 'Invalid credit card number');
    }

    return createResult(true);
};

// CVV validator
export const cvv = (
    value: string,
    cardType?: 'amex' | 'other',
    options: ValidationOptions = {}
): ValidationResult => {
    const { required: isRequired = false, trim = true, customMessage } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    // Check if all characters are digits
    if (!/^\d+$/.test(processedValue)) {
        return createResult(false, 'CVV must contain only digits');
    }

    // American Express uses 4 digits, others use 3
    const expectedLength = cardType === 'amex' ? 4 : 3;

    if (processedValue.length !== expectedLength) {
        return createResult(false, `CVV must be ${expectedLength} digits`);
    }

    return createResult(true);
};

// Date validator
export const date = (
    value: string | Date,
    options: ValidationOptions & {
        minDate?: Date;
        maxDate?: Date;
        format?: 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'MM/YYYY';
    } = {}
): ValidationResult => {
    const { required: isRequired = false, customMessage, minDate, maxDate, format } = options;

    if (!isRequired && (!value || value === '')) {
        return createResult(true);
    }

    if (!value) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    let dateObj: Date;

    if (typeof value === 'string') {
        // Validate format
        if (format === 'MM/DD/YYYY' && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return createResult(false, 'Date must be in MM/DD/YYYY format');
        }

        if (format === 'YYYY-MM-DD' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return createResult(false, 'Date must be in YYYY-MM-DD format');
        }

        if (format === 'MM/YYYY' && !/^\d{2}\/\d{4}$/.test(value)) {
            return createResult(false, 'Date must be in MM/YYYY format');
        }

        dateObj = new Date(value);
    } else {
        dateObj = value;
    }

    if (isNaN(dateObj.getTime())) {
        return createResult(false, 'Invalid date');
    }

    if (minDate && dateObj < minDate) {
        return createResult(false, `Date must be on or after ${minDate.toLocaleDateString()}`);
    }

    if (maxDate && dateObj > maxDate) {
        return createResult(false, `Date must be on or before ${maxDate.toLocaleDateString()}`);
    }

    return createResult(true);
};

// Age validator (for date of birth)
export const age = (
    dateOfBirth: string | Date,
    options: ValidationOptions & {
        minAge?: number;
        maxAge?: number;
    } = {}
): ValidationResult => {
    const { required: isRequired = false, customMessage, minAge = 0, maxAge = 120 } = options;

    if (!isRequired && (!dateOfBirth || dateOfBirth === '')) {
        return createResult(true);
    }

    const dobResult = date(dateOfBirth, { required: isRequired });
    if (!dobResult.isValid) {
        return dobResult;
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();

    if (dob > today) {
        return createResult(false, 'Date of birth cannot be in the future');
    }

    let userAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        userAge--;
    }

    if (userAge < minAge) {
        return createResult(false, `You must be at least ${minAge} years old`);
    }

    if (userAge > maxAge) {
        return createResult(false, `Age cannot exceed ${maxAge} years`);
    }

    return createResult(true);
};

// Numeric validator
export const numeric = (
    value: string | number,
    options: ValidationOptions & {
        min?: number;
        max?: number;
        allowDecimals?: boolean;
        decimalPlaces?: number;
    } = {}
): ValidationResult => {
    const {
        required: isRequired = false,
        customMessage,
        min,
        max,
        allowDecimals = true,
        decimalPlaces
    } = options;

    if (!isRequired && (value === '' || value === null || value === undefined)) {
        return createResult(true);
    }

    if (value === '' || value === null || value === undefined) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return createResult(false, 'Must be a valid number');
    }

    if (!allowDecimals && numValue % 1 !== 0) {
        return createResult(false, 'Must be a whole number');
    }

    if (decimalPlaces !== undefined) {
        const decimalPart = value.toString().split('.')[1];
        if (decimalPart && decimalPart.length > decimalPlaces) {
            return createResult(false, `Cannot have more than ${decimalPlaces} decimal places`);
        }
    }

    if (min !== undefined && numValue < min) {
        return createResult(false, `Must be at least ${min}`);
    }

    if (max !== undefined && numValue > max) {
        return createResult(false, `Cannot exceed ${max}`);
    }

    return createResult(true);
};

// String length validator
export const stringLength = (
    value: string,
    options: ValidationOptions & {
        min?: number;
        max?: number;
        exact?: number;
    } = {}
): ValidationResult => {
    const { required: isRequired = false, trim = true, customMessage, min, max, exact } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    const length = processedValue.length;

    if (exact !== undefined && length !== exact) {
        return createResult(false, `Must be exactly ${exact} characters long`);
    }

    if (min !== undefined && length < min) {
        return createResult(false, `Must be at least ${min} characters long`);
    }

    if (max !== undefined && length > max) {
        return createResult(false, `Cannot exceed ${max} characters`);
    }

    return createResult(true);
};

// URL validator
export const url = (value: string, options: ValidationOptions = {}): ValidationResult => {
    const { required: isRequired = false, trim = true, customMessage } = options;
    const processedValue = trim ? value?.trim() : value;

    if (!isRequired && (!processedValue || processedValue === '')) {
        return createResult(true);
    }

    if (!processedValue) {
        return createResult(false, customMessage || ERROR_MESSAGES.REQUIRED_FIELD);
    }

    try {
        new URL(processedValue);
        return createResult(true);
    } catch {
        return createResult(false, 'Must be a valid URL');
    }
};

// Array validator
export const array = (
    value: any[],
    options: ValidationOptions & {
        minLength?: number;
        maxLength?: number;
        uniqueItems?: boolean;
    } = {}
): ValidationResult => {
    const { required: isRequired = false, customMessage, minLength, maxLength, uniqueItems } = options;

    if (!isRequired && (!value || value.length === 0)) {
        return createResult(true);
    }

    if (!Array.isArray(value)) {
        return createResult(false, 'Must be an array');
    }

    if (isRequired && value.length === 0) {
        return createResult(false, customMessage || 'At least one item is required');
    }

    if (minLength !== undefined && value.length < minLength) {
        return createResult(false, `Must have at least ${minLength} items`);
    }

    if (maxLength !== undefined && value.length > maxLength) {
        return createResult(false, `Cannot have more than ${maxLength} items`);
    }

    if (uniqueItems) {
        const uniqueValues = new Set(value);
        if (uniqueValues.size !== value.length) {
            return createResult(false, 'All items must be unique');
        }
    }

    return createResult(true);
};

// Business rule validators
export const businessValidators = {
    // Cart quantity validator
    cartQuantity: (quantity: number): ValidationResult => {
        return numeric(quantity, {
            required: true,
            min: 1,
            max: BUSINESS_RULES.MAX_ITEM_QUANTITY,
            allowDecimals: false,
        });
    },

    // Order value validator
    orderValue: (amount: number): ValidationResult => {
        return numeric(amount, {
            required: true,
            min: BUSINESS_RULES.MIN_ORDER_VALUE,
            max: BUSINESS_RULES.MAX_ORDER_VALUE,
        });
    },

    // SKU validator
    sku: (value: string): ValidationResult => {
        const lengthResult = stringLength(value, { required: true, min: 6, max: 20 });
        if (!lengthResult.isValid) return lengthResult;

        if (!REGEX_PATTERNS.SKU.test(value)) {
            return createResult(false, 'SKU must contain only letters, numbers, and hyphens');
        }

        return createResult(true);
    },

    // UPC validator
    upc: (value: string): ValidationResult => {
        if (!REGEX_PATTERNS.UPC.test(value)) {
            return createResult(false, 'UPC must be exactly 12 digits');
        }

        return createResult(true);
    },

    // Review text validator
    reviewText: (value: string): ValidationResult => {
        return stringLength(value, {
            required: true,
            min: BUSINESS_RULES.MIN_REVIEW_LENGTH,
            max: BUSINESS_RULES.MAX_REVIEW_LENGTH,
        });
    },

    // Search query validator
    searchQuery: (value: string): ValidationResult => {
        return stringLength(value, {
            required: true,
            min: BUSINESS_RULES.MIN_SEARCH_QUERY_LENGTH,
            max: BUSINESS_RULES.MAX_SEARCH_QUERY_LENGTH,
        });
    },
};

// Form validator - validates multiple fields
export const validateForm = (
    data: Record<string, any>,
    rules: Record<string, ValidatorFunction[]>
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const [field, validators] of Object.entries(rules)) {
        const value = data[field];

        for (const validator of validators) {
            const result = validator(value);
            if (!result.isValid) {
                errors[field] = result.error!;
                isValid = false;
                break; // Stop on first error for this field
            }
        }
    }

    return { isValid, errors };
};

// Async validator wrapper
export const asyncValidator = <T extends any[]>(
    validatorFn: (...args: T) => ValidationResult,
    delay: number = 300
) => {
    return (...args: T): Promise<ValidationResult> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(validatorFn(...args));
            }, delay);
        });
    };
};

// Utility functions
const luhnCheck = (cardNumber: string): boolean => {
    let sum = 0;
    let isEven = false;

    // Iterate from right to left
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};

// Credit card type detection
export const detectCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');

    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    if (/^35/.test(number)) return 'jcb';
    if (/^30[0-5]/.test(number)) return 'diners';

    return 'unknown';
};

// Export commonly used validator combinations
export const commonValidators = {
    // User registration
    firstName: (value: string) => stringLength(value, { required: true, min: 1, max: 50 }),
    lastName: (value: string) => stringLength(value, { required: true, min: 1, max: 50 }),

    // Address fields
    street: (value: string) => stringLength(value, { required: true, min: 5, max: 100 }),
    city: (value: string) => stringLength(value, { required: true, min: 2, max: 50 }),
    state: (value: string) => stringLength(value, { required: true, min: 2, max: 2 }),

    // Product fields
    productName: (value: string) => stringLength(value, { required: true, min: 3, max: 100 }),
    productPrice: (value: number) => numeric(value, { required: true, min: 0.01, decimalPlaces: 2 }),
    productDescription: (value: string) => stringLength(value, { required: true, min: 10, max: 2000 }),

    // Order fields
    orderQuantity: (value: number) => businessValidators.cartQuantity(value),
    orderTotal: (value: number) => businessValidators.orderValue(value),
};

// Export all validators
export default {
    required,
    email,
    phone,
    password,
    confirmPassword,
    zipCode,
    creditCard,
    cvv,
    date,
    age,
    numeric,
    stringLength,
    url,
    array,
    businessValidators,
    commonValidators,
    validateForm,
    asyncValidator,
    detectCardType,
};