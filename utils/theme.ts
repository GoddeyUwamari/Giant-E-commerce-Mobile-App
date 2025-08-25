export interface Colors {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    accent: string;
    accentDark: string;
    accentLight: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    surfaceSecondary: string;
    surfaceTertiary: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    border: string;
    borderLight: string;
    borderDark: string;
    shadow: string;
    overlay: string;
    success: string;
    successDark: string;
    successLight: string;
    error: string;
    errorDark: string;
    errorLight: string;
    warning: string;
    warningDark: string;
    warningLight: string;
    info: string;
    infoDark: string;
    infoLight: string;
    disabled: string;
    placeholder: string;
    link: string;
    linkVisited: string;
    favorite: string;
    rating: string;
    price: string;
    discount: string;
    outOfStock: string;
    inStock: string;
    walmartBlue: string;
    walmartYellow: string;
    walmartPlusBlue: string;
}

export interface Typography {
    fontFamily: {
        regular: string;
        medium: string;
        semiBold: string;
        bold: string;
        light: string;
    };
    fontSize: {
        xs: number;
        sm: number;
        base: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
        '5xl': number;
        '6xl': number;
    };
    lineHeight: {
        xs: number;
        sm: number;
        base: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
        '5xl': number;
        '6xl': number;
    };
    letterSpacing: {
        tighter: number;
        tight: number;
        normal: number;
        wide: number;
        wider: number;
        widest: number;
    };
}

export interface Spacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
    '6xl': number;
}

export interface BorderRadius {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    full: number;
}

export interface Shadows {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
}

export interface Elevation {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
}

export interface Breakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
}

export interface Theme {
    colors: Colors;
    typography: Typography;
    spacing: Spacing;
    borderRadius: BorderRadius;
    shadows: Shadows;
    elevation: Elevation;
    breakpoints: Breakpoints;
    isDark: boolean;
}

// Light Theme
export const lightColors: Colors = {
    primary: '#0071CE',
    primaryDark: '#004C97',
    primaryLight: '#4A96E0',
    secondary: '#FFC220',
    secondaryDark: '#E6A500',
    secondaryLight: '#FFD966',
    accent: '#FF6900',
    accentDark: '#E55100',
    accentLight: '#FF8A50',
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundTertiary: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFC',
    surfaceTertiary: '#F1F5F9',
    text: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderDark: '#CBD5E1',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    success: '#10B981',
    successDark: '#059669',
    successLight: '#6EE7B7',
    error: '#EF4444',
    errorDark: '#DC2626',
    errorLight: '#FCA5A5',
    warning: '#F59E0B',
    warningDark: '#D97706',
    warningLight: '#FCD34D',
    info: '#3B82F6',
    infoDark: '#2563EB',
    infoLight: '#93C5FD',
    disabled: '#9CA3AF',
    placeholder: '#9CA3AF',
    link: '#0071CE',
    linkVisited: '#7C3AED',
    favorite: '#EF4444',
    rating: '#F59E0B',
    price: '#10B981',
    discount: '#EF4444',
    outOfStock: '#6B7280',
    inStock: '#10B981',
    walmartBlue: '#0071CE',
    walmartYellow: '#FFC220',
    walmartPlusBlue: '#004C97',
};

// Dark Theme
export const darkColors: Colors = {
    primary: '#4A96E0',
    primaryDark: '#0071CE',
    primaryLight: '#7DB4E8',
    secondary: '#FFD966',
    secondaryDark: '#FFC220',
    secondaryLight: '#FFE799',
    accent: '#FF8A50',
    accentDark: '#FF6900',
    accentLight: '#FFB380',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    surfaceTertiary: '#475569',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#1E293B',
    border: '#475569',
    borderLight: '#334155',
    borderDark: '#64748B',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    success: '#6EE7B7',
    successDark: '#10B981',
    successLight: '#A7F3D0',
    error: '#FCA5A5',
    errorDark: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#FCD34D',
    warningDark: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#93C5FD',
    infoDark: '#3B82F6',
    infoLight: '#DBEAFE',
    disabled: '#64748B',
    placeholder: '#64748B',
    link: '#4A96E0',
    linkVisited: '#A78BFA',
    favorite: '#FCA5A5',
    rating: '#FCD34D',
    price: '#6EE7B7',
    discount: '#FCA5A5',
    outOfStock: '#9CA3AF',
    inStock: '#6EE7B7',
    walmartBlue: '#4A96E0',
    walmartYellow: '#FFD966',
    walmartPlusBlue: '#7DB4E8',
};

export const typography: Typography = {
    fontFamily: {
        regular: 'Inter-Regular',
        medium: 'Inter-Medium',
        semiBold: 'Inter-SemiBold',
        bold: 'Inter-Bold',
        light: 'Inter-Light',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        '6xl': 60,
    },
    lineHeight: {
        xs: 16,
        sm: 20,
        base: 24,
        lg: 28,
        xl: 28,
        '2xl': 32,
        '3xl': 36,
        '4xl': 40,
        '5xl': 48,
        '6xl': 60,
    },
    letterSpacing: {
        tighter: -0.05,
        tight: -0.025,
        normal: 0,
        wide: 0.025,
        wider: 0.05,
        widest: 0.1,
    },
};

export const spacing: Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 80,
    '5xl': 96,
    '6xl': 128,
};

export const borderRadius: BorderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
};

export const shadows: Shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const elevation: Elevation = {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    '2xl': 16,
};

export const breakpoints: Breakpoints = {
    xs: 320,
    sm: 375,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

// Theme objects
export const lightTheme: Theme = {
    colors: lightColors,
    typography,
    spacing,
    borderRadius,
    shadows,
    elevation,
    breakpoints,
    isDark: false,
};

export const darkTheme: Theme = {
    colors: darkColors,
    typography,
    spacing,
    borderRadius,
    shadows,
    elevation,
    breakpoints,
    isDark: true,
};

// Component-specific theme tokens
export const componentThemes = {
    button: {
        primary: {
            backgroundColor: (theme: Theme) => theme.colors.primary,
            color: (theme: Theme) => theme.colors.textInverse,
            borderRadius: (theme: Theme) => theme.borderRadius.md,
            paddingVertical: (theme: Theme) => theme.spacing.md,
            paddingHorizontal: (theme: Theme) => theme.spacing.lg,
        },
        secondary: {
            backgroundColor: (theme: Theme) => theme.colors.surface,
            color: (theme: Theme) => theme.colors.primary,
            borderColor: (theme: Theme) => theme.colors.primary,
            borderWidth: 1,
            borderRadius: (theme: Theme) => theme.borderRadius.md,
            paddingVertical: (theme: Theme) => theme.spacing.md,
            paddingHorizontal: (theme: Theme) => theme.spacing.lg,
        },
        ghost: {
            backgroundColor: 'transparent',
            color: (theme: Theme) => theme.colors.primary,
            borderRadius: (theme: Theme) => theme.borderRadius.md,
            paddingVertical: (theme: Theme) => theme.spacing.md,
            paddingHorizontal: (theme: Theme) => theme.spacing.lg,
        },
        destructive: {
            backgroundColor: (theme: Theme) => theme.colors.error,
            color: (theme: Theme) => theme.colors.textInverse,
            borderRadius: (theme: Theme) => theme.borderRadius.md,
            paddingVertical: (theme: Theme) => theme.spacing.md,
            paddingHorizontal: (theme: Theme) => theme.spacing.lg,
        },
    },
    card: {
        default: {
            backgroundColor: (theme: Theme) => theme.colors.surface,
            borderColor: (theme: Theme) => theme.colors.border,
            borderWidth: 1,
            borderRadius: (theme: Theme) => theme.borderRadius.lg,
            padding: (theme: Theme) => theme.spacing.md,
            shadowColor: (theme: Theme) => theme.colors.shadow,
            elevation: (theme: Theme) => theme.elevation.sm,
        },
        elevated: {
            backgroundColor: (theme: Theme) => theme.colors.surface,
            borderRadius: (theme: Theme) => theme.borderRadius.lg,
            padding: (theme: Theme) => theme.spacing.md,
            shadowColor: (theme: Theme) => theme.colors.shadow,
            elevation: (theme: Theme) => theme.elevation.md,
        },
    },
    input: {
        default: {
            backgroundColor: (theme: Theme) => theme.colors.surface,
            borderColor: (theme: Theme) => theme.colors.border,
            borderWidth: 1,
            borderRadius: (theme: Theme) => theme.borderRadius.md,
            paddingVertical: (theme: Theme) => theme.spacing.md,
            paddingHorizontal: (theme: Theme) => theme.spacing.md,
            fontSize: (theme: Theme) => theme.typography.fontSize.base,
            color: (theme: Theme) => theme.colors.text,
        },
        focused: {
            borderColor: (theme: Theme) => theme.colors.primary,
            borderWidth: 2,
        },
        error: {
            borderColor: (theme: Theme) => theme.colors.error,
            borderWidth: 2,
        },
    },
    badge: {
        primary: {
            backgroundColor: (theme: Theme) => theme.colors.primary,
            color: (theme: Theme) => theme.colors.textInverse,
            borderRadius: (theme: Theme) => theme.borderRadius.full,
            paddingVertical: (theme: Theme) => theme.spacing.xs,
            paddingHorizontal: (theme: Theme) => theme.spacing.sm,
            fontSize: (theme: Theme) => theme.typography.fontSize.xs,
        },
        success: {
            backgroundColor: (theme: Theme) => theme.colors.success,
            color: (theme: Theme) => theme.colors.textInverse,
            borderRadius: (theme: Theme) => theme.borderRadius.full,
            paddingVertical: (theme: Theme) => theme.spacing.xs,
            paddingHorizontal: (theme: Theme) => theme.spacing.sm,
            fontSize: (theme: Theme) => theme.typography.fontSize.xs,
        },
        error: {
            backgroundColor: (theme: Theme) => theme.colors.error,
            color: (theme: Theme) => theme.colors.textInverse,
            borderRadius: (theme: Theme) => theme.borderRadius.full,
            paddingVertical: (theme: Theme) => theme.spacing.xs,
            paddingHorizontal: (theme: Theme) => theme.spacing.sm,
            fontSize: (theme: Theme) => theme.typography.fontSize.xs,
        },
        warning: {
            backgroundColor: (theme: Theme) => theme.colors.warning,
            color: (theme: Theme) => theme.colors.textInverse,
            borderRadius: (theme: Theme) => theme.borderRadius.full,
            paddingVertical: (theme: Theme) => theme.spacing.xs,
            paddingHorizontal: (theme: Theme) => theme.spacing.sm,
            fontSize: (theme: Theme) => theme.typography.fontSize.xs,
        },
    },
};

// Theme utility functions
export class ThemeManager {
    static getThemedStyle(
        styleFunction: (theme: Theme) => any,
        theme: Theme
    ): any {
        return styleFunction(theme);
    }

    static interpolateColor(
        theme: Theme,
        colorKey: keyof Colors,
        opacity: number = 1
    ): string {
        const color = theme.colors[colorKey];
        if (opacity === 1) return color;

        // Convert hex to rgba
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    static getResponsiveValue<T>(
        values: { [key in keyof Breakpoints]?: T },
        screenWidth: number,
        theme: Theme
    ): T | undefined {
        const sortedBreakpoints = Object.entries(theme.breakpoints)
            .sort(([, a], [, b]) => b - a);

        for (const [breakpoint, width] of sortedBreakpoints) {
            if (screenWidth >= width && values[breakpoint as keyof Breakpoints]) {
                return values[breakpoint as keyof Breakpoints];
            }
        }

        return undefined;
    }

    static createComponentStyle(
        componentName: keyof typeof componentThemes,
        variant: string,
        theme: Theme
    ): any {
        const componentTheme = componentThemes[componentName];
        const variantTheme = componentTheme[variant as keyof typeof componentTheme];

        if (!variantTheme) return {};

        const style: any = {};

        Object.entries(variantTheme).forEach(([key, value]) => {
            if (typeof value === 'function') {
                style[key] = value(theme);
            } else {
                style[key] = value;
            }
        });

        return style;
    }

    static isDarkColor(color: string): boolean {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
    }

    static getContrastColor(backgroundColor: string, theme: Theme): string {
        return this.isDarkColor(backgroundColor)
            ? theme.colors.textInverse
            : theme.colors.text;
    }
}

// Default theme
export const defaultTheme = lightTheme;

export default {
    lightTheme,
    darkTheme,
    defaultTheme,
    ThemeManager,
    componentThemes,
};