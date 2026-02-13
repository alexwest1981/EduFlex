// Theme configuration interfaces and definitions

export interface MobileThemeConfig {
    id: string;
    name: string;
    description: string;
    backgroundColor: string;
    activeColor: string;
    inactiveColor: string;
    glassmorphism: boolean;
    borderRadius: string;
    animationPreset: 'smooth' | 'bouncy' | 'minimal';
    componentDepth: 'flat' | 'floating' | 'shadow' | 'glass';
}

export interface MobileThemeSettings {
    backgroundColor: string;
    activeColor: string;
    inactiveColor: string;
    glassmorphism: boolean;
    borderRadius: string;
    animationPreset: string;
    componentDepth: string;
    enabledThemes?: string[];
}

// Predefined mobile themes (fallback if API fails)
export const MOBILE_THEMES: MobileThemeConfig[] = [
    {
        id: 'finsights-dark',
        name: 'Finsights Dark',
        description: 'Ultra-modern, mörk bento-grid design (High Contrast).',
        backgroundColor: '#0F0F11',
        activeColor: '#FF6D5A',
        inactiveColor: '#333333',
        glassmorphism: false,
        borderRadius: '32px',
        animationPreset: 'smooth',
        componentDepth: 'flat'
    },
    {
        id: 'eduflex-fresh',
        name: 'EduFresh',
        description: 'Lekfull, studsig och modern (Bubble Pop).',
        backgroundColor: '#111827',
        activeColor: '#f59e0b',
        inactiveColor: '#9ca3af',
        glassmorphism: false,
        borderRadius: '24px',
        animationPreset: 'bouncy',
        componentDepth: 'floating'
    },
    {
        id: 'cosmic-growth',
        name: 'Cosmic Growth',
        description: 'Topografisk, rymd-inspirerad (Topographic Gradient).',
        backgroundColor: '#F9F9F9',
        activeColor: '#FF5A5F',
        inactiveColor: '#9CA3AF',
        glassmorphism: false,
        borderRadius: '28px',
        animationPreset: 'smooth',
        componentDepth: 'shadow'
    },
    {
        id: 'midnight-glass',
        name: 'Midnight Glass',
        description: 'Futuristisk, mörk och elegant (Neo-Glass).',
        backgroundColor: '#000000',
        activeColor: '#ffffff',
        inactiveColor: '#6b7280',
        glassmorphism: true,
        borderRadius: '9999px',
        animationPreset: 'smooth',
        componentDepth: 'glass'
    },
    {
        id: 'clean-light',
        name: 'Clean Light',
        description: 'Minimalistisk, snabb och skarp (Minimal).',
        backgroundColor: '#ffffff',
        activeColor: '#4f46e5',
        inactiveColor: '#6b7280',
        glassmorphism: true,
        borderRadius: '8px',
        animationPreset: 'minimal',
        componentDepth: 'flat'
    },
    {
        id: 'stitch-dark',
        name: 'Stitch Dark',
        description: 'Modernt mörkt tema med glassmorphism, inspirerat av Stitch-designen.',
        backgroundColor: '#0a0e17',
        activeColor: '#135bec',
        inactiveColor: '#64748b',
        glassmorphism: true,
        borderRadius: '16px',
        animationPreset: 'smooth',
        componentDepth: 'glass'
    }
];

// Get theme by ID
export const getThemeById = (id: string): MobileThemeConfig | undefined => {
    return MOBILE_THEMES.find(theme => theme.id === id);
};

// Get default theme
export const getDefaultTheme = (): MobileThemeConfig => {
    return MOBILE_THEMES[1]; // EduFresh as default
};

// Parse border radius to number (remove 'px' suffix)
export const parseBorderRadius = (borderRadius: string): number => {
    if (borderRadius === '9999px') return 9999; // Full circle
    return parseInt(borderRadius.replace('px', ''), 10) || 24;
};
