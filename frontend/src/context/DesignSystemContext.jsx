import { createContext, useContext, useState, useEffect } from 'react';
import { useBranding } from './BrandingContext';

const DesignSystemContext = createContext();

// Enterprise Design Systems - These define the visual language of the entire UI
export const DESIGN_SYSTEMS = {
    // Design 0: EduFlex Focus (f.d. Donezo)
    // Deep green, 20px radius, floating layout.
    focus: {
        id: 'focus',
        name: 'EduFlex Focus',
        description: 'Djupt fokus. Grön, lugnande och avskalad.',
        card: {
            radius: {
                sm: '8px', md: '12px', lg: '16px', xl: '20px', '2xl': '24px', '3xl': '32px', full: '9999px'
            },
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)', // Very subtle
            background: '#ffffff',
            backgroundDark: '#1e1f20',
            backdrop: 'none',
            border: '1px solid transparent',
            borderDark: '1px solid #3c4043',
        },
        button: {
            radius: '20px',
            shadow: 'none',
            hoverScale: '1.02',
        },
        page: {
            light: '#F8F9FA', // Off-white
            dark: '#131314',
        },
        colors: {
            primary: {
                50: '#F0F9F4', 100: '#D9F0E3', 200: '#B5E0C8', 300: '#8CCBA8',
                400: '#64B58A', 500: '#3FA06D', 600: '#2D8A5B', 700: '#1F6D48',
                800: '#14452F', 900: '#0E3323', 950: '#061D13',
            }
        },
        layout: { spacing: '32px', maxWidth: '1600px', style: 'floating' },
        effects: { useGradients: 'false', useBlur: 'false', useGlow: 'false' }
    },

    // Design 1: EduFlex Horizon (Crextio Match)
    // Gold/Yellow, Top Nav, Beige Gradient.
    horizon: {
        id: 'horizon',
        name: 'EduFlex Horizon',
        description: 'Expansiv vy. Guld, beige och topp-navigering.',
        card: {
            radius: {
                sm: '12px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px', full: '9999px'
            },
            shadow: '0 20px 40px -4px rgba(0, 0, 0, 0.05)', // Soft float
            background: '#ffffff',
            backgroundDark: '#1e1f20',
            backdrop: 'none',
            border: 'none',
            borderDark: '1px solid #3c4043',
        },
        button: {
            radius: '30px', // Pill buttons
            shadow: '0 4px 12px rgba(255, 213, 79, 0.3)', // Gold glow
            hoverScale: '1.05',
        },
        page: {
            light: 'linear-gradient(135deg, #fdfbf7 0%, #f4eecf 100%)', // Beige/Gold Mist
            dark: 'linear-gradient(135deg, #131314 0%, #1c1c1a 100%)', // Warm Dark
        },
        colors: {
            primary: {
                50: '#FFFBE6', 100: '#FFF6C6', 200: '#FFEB8F', 300: '#FFD54F', // 300 is Gold Main
                400: '#FFCA28', 500: '#FFC107', 600: '#FFA000', 700: '#FF8F00',
                800: '#FF6F00', 900: '#E65100', 950: '#F57F17',
            }
        },
        layout: { spacing: '32px', maxWidth: '100%', style: 'horizon' },
        effects: { useGradients: 'true', useBlur: 'true', useGlow: 'false' }
    },

    // Design 2: EduFlex Nebula (Bryzos Match)
    // Purple/Lavender, Glassmorphism, Coral Accents.
    nebula: {
        id: 'nebula',
        name: 'EduFlex Nebula',
        description: 'Futuristisk glas-estetik. Lila toner med korall-accenter.',
        card: {
            radius: {
                sm: '12px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px', full: '9999px'
            },
            shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)', // Glass shadow
            background: 'rgba(255, 255, 255, 0.65)',
            backgroundDark: 'rgba(30, 31, 32, 0.70)',
            backdrop: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderDark: '1px solid rgba(255, 255, 255, 0.05)',
        },
        button: {
            radius: '16px',
            shadow: '0 4px 15px rgba(255, 138, 101, 0.4)', // Coral glow
            hoverScale: '1.05',
        },
        page: {
            light: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)', // Subtle Metallic
            dark: 'linear-gradient(to top, #09203f 0%, #537895 100%)', // Deep Nebula
        },
        colors: {
            // Coral / Orange Accent for Buttons
            primary: {
                50: '#FBE9E7', 100: '#FFCCBC', 200: '#FFAB91', 300: '#FF8A65', // 300 Coral
                400: '#FF7043', 500: '#FF5722', 600: '#F4511E', 700: '#E64A19',
                800: '#D84315', 900: '#BF360C', 950: '#3E1205',
            }
        },
        layout: { spacing: '40px', maxWidth: '100%', style: 'nebula' },
        effects: { useGradients: 'true', useBlur: 'true', useGlow: 'true' }
    },

    // Design 3: EduFlex Ember (Oppo Match)
    // Energetic Orange, Dark Green Background, Clean White Card.
    ember: {
        id: 'ember',
        name: 'EduFlex Ember',
        description: 'Energisk och avskalad. Orangea accenter på mörk bakgrund.',
        card: {
            radius: {
                sm: '12px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px', full: '9999px'
            },
            shadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: '#ffffff',
            backgroundDark: '#1E1F20',
            backdrop: 'none',
            border: 'none',
            borderDark: '1px solid #333',
        },
        button: {
            radius: '100px', // Full pill
            shadow: '0 4px 14px rgba(255, 87, 34, 0.4)', // Orange glow
            hoverScale: '1.05',
        },
        page: {
            light: '#263238', // Dark Blue/Green Grey (Oppo BG)
            dark: '#000000',
        },
        colors: {
            // High Energy Orange
            primary: {
                50: '#FBE9E7', 100: '#FFCCBC', 200: '#FFAB91', 300: '#FF8A65',
                400: '#FF7043', 500: '#FF5722', 600: '#F4511E', 700: '#E64A19',
                800: '#D84315', 900: '#BF360C', 950: '#3E1205',
            }
        },
        layout: { spacing: '32px', maxWidth: '1800px', style: 'ember' },
        effects: { useGradients: 'false', useBlur: 'false', useGlow: 'false' }
    },

    // Design 4: EduFlex Voltage (Acid Contrast)
    // Acid Lime, Deep Black Sidebar, Soft Grey Content.
    voltage: {
        id: 'voltage',
        name: 'EduFlex Voltage',
        description: 'Högspänning. Syrlig lime och djup svärta.',
        card: {
            radius: {
                sm: '16px', md: '20px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px', full: '9999px'
            },
            shadow: '0 4px 0px rgba(0,0,0,0.1)', // Hard pop shadow
            background: '#ffffff',
            backgroundDark: '#1E1E1E',
            backdrop: 'none',
            border: '2px solid #E5E7EB',
            borderDark: '2px solid #333',
        },
        button: {
            radius: '16px',
            shadow: '4px 4px 0px rgba(0,0,0,1)', // Brutalist shadow pop
            hoverScale: '1.02',
        },
        page: {
            light: '#C7C9CB', // Concrete Grey
            dark: '#000000',
        },
        colors: {
            // Acid Lime Accent
            primary: {
                50: '#F9FFD1', 100: '#F1FF99', 200: '#E6FF5C', 300: '#DBFF1F',
                400: '#CCFF00', 500: '#B3E600', 600: '#8FB300', 700: '#6B8600',
                800: '#4A5C00', 900: '#2C3600', 950: '#1A2100',
            }
        },
        layout: { spacing: '40px', maxWidth: '1600px', style: 'voltage' },
        effects: { useGradients: 'true', useBlur: 'false', useGlow: 'true' }
    },

    // Design 5: EduFlex Midnight (FinTech Dark)
    // Deep Black, Mint Green Accents, Pill Nav.
    midnight: {
        id: 'midnight',
        name: 'EduFlex Midnight',
        description: 'Fintech-inspirerad. Djupsvart med mintgröna accenter.',
        card: {
            radius: {
                sm: '12px', md: '16px', lg: '24px', xl: '30px', '2xl': '36px', '3xl': '48px', full: '9999px'
            },
            shadow: '0 8px 32px rgba(0,0,0,0.4)', // Deep dark shadow
            background: '#1A1A1A',
            backgroundDark: '#1A1A1A',
            backdrop: 'none',
            border: '1px solid rgba(255,255,255,0.05)',
            borderDark: '1px solid rgba(255,255,255,0.05)',
        },
        button: {
            radius: '100px', // Pills
            shadow: '0 4px 12px rgba(0, 220, 130, 0.2)', // Mint glow
            hoverScale: '1.05',
        },
        page: {
            light: '#050505', // Always dark
            dark: '#050505',
        },
        colors: {
            // Mint Green Accent
            primary: {
                50: '#E6FFF5', 100: '#CCFFE6', 200: '#99FFCC', 300: '#66FFB3',
                400: '#33FF99', 500: '#00DC82', 600: '#00B36B', 700: '#008A52',
                800: '#00613A', 900: '#003822', 950: '#001F12',
            }
        },
        layout: { spacing: '32px', maxWidth: '1600px', style: 'midnight' },
        effects: { useGradients: 'true', useBlur: 'false', useGlow: 'true' }
    },

    // Design 6: EduFlex Pulse (Music Player Vibe)
    // Bright Red, Circular Nav, Soft UI.
    pulse: {
        id: 'pulse',
        name: 'EduFlex Pulse',
        description: 'Musikspelare-inspirerad. Röd accent, runda former.',
        card: {
            radius: {
                sm: '16px', md: '24px', lg: '32px', xl: '40px', '2xl': '48px', '3xl': '60px', full: '9999px'
            },
            shadow: '0 10px 40px rgba(0,0,0,0.05)', // Soft diffuse shadow
            background: '#F4F4F4',
            backgroundDark: '#1E1E1E',
            backdrop: 'none',
            border: 'none',
            borderDark: 'none',
        },
        button: {
            radius: '999px', // Circle/Pill
            shadow: '0 4px 15px rgba(255, 45, 45, 0.3)', // Red glow
            hoverScale: '1.05',
        },
        page: {
            light: '#E8E8E8', // Light Grey
            dark: '#121212',
        },
        colors: {
            // Bright Red Accent (Lunio)
            primary: {
                50: '#FFEBEE', 100: '#FFCDD2', 200: '#EF9A9A', 300: '#E57373',
                400: '#EF5350', 500: '#FF2D2D', 600: '#E53935', 700: '#D32F2F',
                800: '#C62828', 900: '#B71C1C', 950: '#FF0000',
            }
        },
        layout: { spacing: '32px', maxWidth: '1500px', style: 'pulse' },
        effects: { useGradients: 'true', useBlur: 'true', useGlow: 'false' }
    },

    // Design 7: EduFlex Classic (f.d. Neo-Professional)
    classic: {
        id: 'classic',
        name: 'EduFlex Classic',
        description: 'Tidlös standard. Ren och professionell.',
        card: {
            radius: {
                sm: '6px', md: '10px', lg: '14px', xl: '20px', '2xl': '24px', '3xl': '32px', full: '9999px'
            },
            shadow: '0 2px 10px rgba(0, 0, 0, 0.03), 0 10px 25px -5px rgba(0, 0, 0, 0.04)',
            background: '#ffffff',
            backgroundDark: '#1e1f20',
            backdrop: 'none',
            border: '1px solid #f1f5f9',
            borderDark: '1px solid #3c4043',
        },
        button: {
            radius: '10px',
            shadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            hoverScale: '1.02',
        },
        page: {
            light: '#f9fafb',
            dark: '#131314',
        },
        layout: { spacing: '24px', maxWidth: '1600px', style: 'standard' },
        effects: { useGradients: 'false', useBlur: 'false', useGlow: 'false' }
    },

    // Design 2: Glass OS (Inspired by "Crextio")
    // Heavy use of blur, gradients, and very rounded corners.
    glassmorphism: {
        id: 'glassmorphism',
        name: 'Glass OS',
        description: 'Modern, transparent design med levande gradienter.',
        card: {
            radius: {
                sm: '12px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px', full: '9999px'
            },
            shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            background: 'rgba(255, 255, 255, 0.65)',
            backgroundDark: 'rgba(30, 31, 32, 0.65)',
            backdrop: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderDark: '1px solid rgba(255, 255, 255, 0.1)',
        },
        button: {
            radius: '20px',
            shadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            hoverScale: '1.05',
        },
        page: {
            light: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', // Subtle blue gradient
            dark: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)', // Deep space
        },
        layout: { spacing: '32px', maxWidth: '1400px' },
        effects: { useGradients: 'true', useBlur: 'true', useGlow: 'true' }
    },

    // Design 3: Soft UI (Inspired by "Bryzos/Neomorphism")
    // Very clean, monochrome, soft shadows.
    soft: {
        id: 'soft',
        name: 'Soft UI',
        description: 'Mjuk, minimalistisk design med fokus på innehåll.',
        card: {
            radius: {
                sm: '8px', md: '12px', lg: '20px', xl: '28px', '2xl': '36px', '3xl': '48px', full: '9999px'
            },
            shadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
            background: '#ffffff', // Pure white
            backgroundDark: '#1e1f20',
            backdrop: 'none',
            border: 'none',
        },
        button: {
            radius: '14px',
            shadow: '0 4px 12px rgba(0,0,0,0.08)',
            hoverScale: '1.01',
        },
        page: {
            light: '#e0e5ec', // Classic Neumorphism gray base
            dark: '#1e1f20',
        },
        layout: { spacing: '28px', maxWidth: '1500px' },
        effects: { useGradients: 'false', useBlur: 'false', useGlow: 'false' }
    },

    // Design 4: Brutalist Bold (Inspired by "Oppo/Brutalism")
    // High contrast, sharp edges, distinct borders.
    brutalist: {
        id: 'brutalist',
        name: 'Brutalist Bold',
        description: 'Stark kontrast och skarpa linjer.',
        card: {
            radius: {
                sm: '0px', md: '0px', lg: '0px', xl: '0px', '2xl': '0px', '3xl': '0px', full: '0px'
            },
            shadow: '4px 4px 0px 0px rgba(0,0,0,1)', // Hard shadow
            background: '#ffffff',
            backgroundDark: '#000000',
            backdrop: 'none',
            border: '2px solid #000000',
            borderDark: '2px solid #ffffff',
        },
        button: {
            radius: '0px',
            shadow: '3px 3px 0px 0px rgba(0,0,0,1)',
            hoverScale: '1.0',
        },
        page: {
            light: '#ffffff', // Stark white
            dark: '#121212',
        },
        layout: { spacing: '24px', maxWidth: '1400px' },
        effects: { useGradients: 'false', useBlur: 'false', useGlow: 'false' }
    },

    // Design 5: Enterprise Dark (Inspired by "Managing Your Team")
    // Dark defaults, premium feel.
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise Dark',
        description: 'Optimerad för stora skärmar och mörkt läge.',
        card: {
            radius: {
                sm: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px', '3xl': '24px', full: '9999px'
            },
            shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            background: '#ffffff',
            backgroundDark: '#161b22', // GitHub-like dark
            backdrop: 'none',
            border: '1px solid #e5e7eb',
            borderDark: '1px solid #30363d',
        },
        button: {
            radius: '6px',
            shadow: 'none',
            hoverScale: '1.0',
        },
        page: {
            light: '#f6f8fa',
            dark: '#0d1117', // Github Dark background
        },
        layout: { spacing: '16px', maxWidth: '1920px' }, // Full width focus
        effects: { useGradients: 'false', useBlur: 'false', useGlow: 'false' }
    }
};

export const DesignSystemProvider = ({ children }) => {
    const { branding } = useBranding();
    const [designSystem, setDesignSystem] = useState('classic'); // Default to classic

    useEffect(() => {
        // Handle Legacy Name Mappings
        let targetSystemId = branding?.designSystem;
        if (targetSystemId === 'professional') targetSystemId = 'classic';
        if (targetSystemId === 'donezo') targetSystemId = 'focus';

        if (targetSystemId && DESIGN_SYSTEMS[targetSystemId]) {
            setDesignSystem(targetSystemId);
            applyDesignSystem(DESIGN_SYSTEMS[targetSystemId]);
        } else {
            // Default design system
            applyDesignSystem(DESIGN_SYSTEMS.classic);
        }
    }, [branding]);

    const applyDesignSystem = (ds) => {
        const root = document.documentElement;

        // Card styles - Radius
        root.style.setProperty('--radius-sm', ds.card.radius.sm);
        root.style.setProperty('--radius-md', ds.card.radius.md);
        root.style.setProperty('--radius-lg', ds.card.radius.lg);
        root.style.setProperty('--radius-xl', ds.card.radius.xl);
        root.style.setProperty('--radius-2xl', ds.card.radius['2xl']);

        // Page Backgrounds
        if (ds.page) {
            root.style.setProperty('--app-background', ds.page.light);
            root.style.setProperty('--app-background-dark', ds.page.dark);
        } else {
            root.style.setProperty('--app-background', '#f9fafb');
            root.style.setProperty('--app-background-dark', '#131314');
        }

        // Primary Color Injection
        if (ds.colors && ds.colors.primary) {
            Object.keys(ds.colors.primary).forEach(key => {
                root.style.setProperty(`--color - primary - ${key} `, ds.colors.primary[key]);
            });
        } else {
            // Revert to Indigo (Default)
            const defaultIndigo = {
                50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
                400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
                800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
            };
            Object.keys(defaultIndigo).forEach(key => {
                root.style.setProperty(`--color - primary - ${key} `, defaultIndigo[key]);
            });
        }

        root.style.setProperty('--radius-3xl', ds.card.radius['3xl']);
        root.style.setProperty('--radius-full', ds.card.radius.full);

        // Card styles - Other
        root.style.setProperty('--card-shadow', ds.card.shadow);
        root.style.setProperty('--card-shadow-dark', ds.card.shadowDark || ds.card.shadow);
        root.style.setProperty('--card-background', ds.card.background);
        root.style.setProperty('--card-background-dark', ds.card.backgroundDark);
        root.style.setProperty('--card-backdrop', ds.card.backdrop);
        root.style.setProperty('--card-border', ds.card.border || 'none');
        root.style.setProperty('--card-border-dark', ds.card.borderDark || 'none');

        // Button styles
        root.style.setProperty('--button-border-radius', ds.button.radius);
        root.style.setProperty('--button-shadow', ds.button.shadow);
        root.style.setProperty('--button-shadow-dark', ds.button.shadowDark || ds.button.shadow);
        root.style.setProperty('--button-hover-scale', ds.button.hoverScale);

        // Layout
        root.style.setProperty('--layout-spacing', ds.layout.spacing);
        root.style.setProperty('--layout-max-width', ds.layout.maxWidth);

        // Effects flags (stored as data attributes)
        root.setAttribute('data-use-gradients', ds.effects.useGradients);
        root.setAttribute('data-use-blur', ds.effects.useBlur);
        root.setAttribute('data-use-glow', ds.effects.useGlow);
    };

    const getDesignSystem = () => {
        return DESIGN_SYSTEMS[designSystem] || DESIGN_SYSTEMS.minimal;
    };

    const value = {
        designSystem,
        availableDesignSystems: Object.values(DESIGN_SYSTEMS),
        currentDesignSystem: getDesignSystem(),
    };

    return (
        <DesignSystemContext.Provider value={value}>
            {children}
        </DesignSystemContext.Provider>
    );
};

export const useDesignSystem = () => {
    const context = useContext(DesignSystemContext);
    if (!context) {
        throw new Error('useDesignSystem must be used within DesignSystemProvider');
    }
    return context;
};
