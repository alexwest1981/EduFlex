import React, { useState, useEffect } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { DESIGN_SYSTEMS } from '../../context/DesignSystemContext';
import { useTheme } from '../../context/ThemeContext';
import { Upload, Save, RotateCcw, AlertCircle, CheckCircle, Eye, EyeOff, Palette, Image as ImageIcon, Globe, Layers, Settings, Layout, Type, Shield, LayoutDashboard, MousePointer2, Monitor, Smartphone, ChevronDown, User, Download } from 'lucide-react';
import AdminNavbar from '../../features/dashboard/components/admin/AdminNavbar';
import AdminHeader from '../../features/dashboard/components/admin/AdminHeader';

const EnterpriseWhitelabel = () => {
    const { branding, hasAccess, updateBranding, uploadLogo, uploadFavicon, uploadLoginBackground, uploadPwaIcon192, uploadPwaIcon512, resetBranding } = useBranding();
    const { themes } = useTheme();

    /**
     * Helper to resize image using Canvas before upload
     */
    const resizeImage = (file, size) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    // Draw image scaled to fill the square canvas (center crop)
                    const scale = Math.max(size / img.width, size / img.height);
                    const x = (size / 2) - (img.width / 2) * scale;
                    const y = (size / 2) - (img.height / 2) * scale;

                    // Smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/png' }));
                    }, 'image/png', 0.95);
                };
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    // Form state
    const [formData, setFormData] = useState({
        brandName: '',
        footerText: '',
        welcomeMessage: '',
        defaultThemeId: 'default',
        designSystem: 'minimal',
        showPoweredBy: true,
        enforceOrgTheme: false,
        customEmailTemplates: false,
        customCss: '',
    });

    const [customTheme, setCustomTheme] = useState({
        name: 'Custom Theme',
        colors: {
            50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
            300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
            600: '#4f46e5', 700: '#4338ca', 800: '#3730a3',
            900: '#312e81', 950: '#1e1b4b'
        },
        mobile: {
            backgroundColor: '#111827', // EduFresh Navy
            activeColor: '#f59e0b',     // EduFresh Amber
            inactiveColor: '#9ca3af',   // EduFresh Gray
            glassmorphism: false,
            borderRadius: '24px',       // EduFresh Rounded
            animationPreset: 'bouncy',  // Playful
            componentDepth: 'floating', // Modern
            enabledThemes: ['finsights-dark', 'cosmic-growth', 'eduflex-fresh'] // Default enabled
        },
        pwa: {
            appName: 'EduFlex LMS',
            shortName: 'EduFlex',
            backgroundColor: '#ffffff',
            themeColor: '#6366f1'
        }
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Predefined enterprise themes based on design references
    const enterpriseThemes = [
        {
            id: 'eduflex-focus',
            name: 'EduFlex Focus',
            description: 'Lognt och pålitligt tema för studiero',
            colors: {
                50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
                300: '#86efac', 400: '#4ade80', 500: '#22c55e',
                600: '#16a34a', 700: '#15803d', 800: '#166534',
                900: '#14532d', 950: '#052e16'
            }
        },
        {
            id: 'warm-sand',
            name: 'Warm Sand',
            description: 'Comfortable beige and cream tones',
            colors: {
                50: '#fefce8', 100: '#fef9c3', 200: '#fef08a',
                300: '#fde047', 400: '#facc15', 500: '#eab308',
                600: '#ca8a04', 700: '#a16207', 800: '#854d0e',
                900: '#713f12', 950: '#422006'
            }
        },
        {
            id: 'modern-purple',
            name: 'Modern Purple',
            description: 'Contemporary purple with glassmorphism',
            colors: {
                50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff',
                300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7',
                600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8',
                900: '#581c87', 950: '#3b0764'
            }
        },
        {
            id: 'forest-dark',
            name: 'Forest Dark',
            description: 'Deep forest green with orange accents',
            colors: {
                50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
                300: '#6ee7b7', 400: '#34d399', 500: '#10b981',
                600: '#047857', 700: '#065f46', 800: '#064e3b',
                900: '#022c22', 950: '#021713'
            }
        },
        {
            id: 'neon-lime',
            name: 'Neon Lime',
            description: 'Bold neon lime for modern dashboards',
            colors: {
                50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d',
                300: '#bef264', 400: '#a3e635', 500: '#84cc16',
                600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212',
                900: '#365314', 950: '#1a2e05'
            }
        },
        {
            id: 'ocean-blue',
            name: 'Ocean Blue',
            description: 'Trustworthy blue for corporate environments',
            colors: {
                50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
                300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
                600: '#0284c7', 700: '#0369a1', 800: '#075985',
                900: '#0c4a6e', 950: '#082f49'
            }
        },
        {
            id: 'sunset-orange',
            name: 'Sunset Orange',
            description: 'Energetic orange for creative teams',
            colors: {
                50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
                300: '#fdba74', 400: '#fb923c', 500: '#f97316',
                600: '#ea580c', 700: '#c2410c', 800: '#9a3412',
                900: '#7c2d12', 950: '#431407'
            }
        },
        {
            id: 'ruby-red',
            name: 'Ruby Red',
            description: 'Bold red for attention-grabbing interfaces',
            colors: {
                50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca',
                300: '#fca5a5', 400: '#f87171', 500: '#ef4444',
                600: '#dc2626', 700: '#b91c1c', 800: '#991b1b',
                900: '#7f1d1d', 950: '#450a0a'
            }
        }
    ];

    // Dedicated Mobile Themes
    const mobileThemes = [
        {
            id: 'finsights-dark',
            name: 'Finsights Dark',
            description: 'Ultra-modern, mörk bento-grid design (High Contrast).',
            config: {
                backgroundColor: '#0F0F11',
                activeColor: '#FF6D5A',
                inactiveColor: '#333333',
                glassmorphism: false,
                borderRadius: '32px',
                animationPreset: 'smooth',
                componentDepth: 'flat'
            }
        },
        {
            id: 'eduflex-fresh',
            name: 'EduFresh',
            description: 'Lekfull, studsig och modern (Bubble Pop).',
            config: {
                backgroundColor: '#111827',
                activeColor: '#f59e0b',
                inactiveColor: '#9ca3af',
                glassmorphism: false,
                borderRadius: '24px',
                animationPreset: 'bouncy',
                componentDepth: 'floating'
            }
        },
        {
            id: 'cosmic-growth',
            name: 'Cosmic Growth',
            description: 'Topografisk, rymd-inspirerad (Topographic Gradient).',
            config: {
                backgroundColor: '#F9F9F9',
                activeColor: '#FF5A5F',
                inactiveColor: '#9CA3AF',
                glassmorphism: false,
                borderRadius: '28px',
                animationPreset: 'smooth',
                componentDepth: 'shadow'
            }
        },
        {
            id: 'midnight-glass',
            name: 'Midnight Glass',
            description: 'Futuristisk, mörk och elegant (Neo-Glass).',
            config: {
                backgroundColor: '#000000',
                activeColor: '#ffffff',
                inactiveColor: '#6b7280',
                glassmorphism: true,
                borderRadius: '9999px',
                animationPreset: 'smooth',
                componentDepth: 'glass'
            }
        },
        {
            id: 'clean-light',
            name: 'Clean Light',
            description: 'Minimalistisk, snabb och skarp (Minimal).',
            config: {
                backgroundColor: '#ffffff',
                activeColor: '#4f46e5',
                inactiveColor: '#6b7280',
                glassmorphism: true,
                borderRadius: '8px',
                animationPreset: 'minimal',
                componentDepth: 'flat'
            }
        }
    ];

    useEffect(() => {
        if (branding && !loading) {
            setFormData({
                brandName: branding.brandName || '',
                footerText: branding.footerText || '',
                welcomeMessage: branding.welcomeMessage || '',
                defaultThemeId: branding.defaultThemeId || 'default',
                designSystem: branding.designSystem || 'minimal',
                showPoweredBy: branding.showPoweredBy ?? true,
                enforceOrgTheme: branding.enforceOrgTheme ?? false,
                customEmailTemplates: branding.customEmailTemplates ?? false,
                customCss: branding.customCss || '',
            });

            // Load custom theme if exists
            if (branding.customTheme) {
                try {
                    const parsed = JSON.parse(branding.customTheme);
                    // Merge with defaults to ensure mobile field exists
                    setCustomTheme(prev => ({
                        ...prev,
                        ...parsed,
                        mobile: {
                            ...prev.mobile,
                            ...(parsed.mobile || {})
                        }
                    }));
                } catch (e) {
                    console.error('Failed to parse custom theme:', e);
                }
            }
        }
    }, [branding, loading]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleColorChange = (shade, color) => {
        setCustomTheme(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                [shade]: color
            }
        }));
    };

    const handlePwaColorChange = (field, value) => {
        setCustomTheme(prev => {
            const newPwa = { ...prev.pwa, [field]: value };
            // Auto-sync themeColor to mobile.activeColor for consistency
            const newMobile = field === 'themeColor'
                ? { ...prev.mobile, activeColor: value }
                : prev.mobile;

            return {
                ...prev,
                pwa: newPwa,
                mobile: newMobile
            };
        });
    };

    const handleMobileColorChange = (field, value) => {
        setCustomTheme(prev => ({
            ...prev,
            mobile: {
                ...prev.mobile,
                [field]: value
            }
        }));
    };

    const handleToggleTheme = (themeId) => {
        setCustomTheme(prev => {
            const currentEnabled = prev.mobile?.enabledThemes || [];
            const isEnabled = currentEnabled.includes(themeId);

            let newEnabled;
            if (isEnabled) {
                // Prevent disabling the last theme
                if (currentEnabled.length <= 1) return prev;
                newEnabled = currentEnabled.filter(id => id !== themeId);
            } else {
                newEnabled = [...currentEnabled, themeId];
            }

            return {
                ...prev,
                mobile: {
                    ...prev.mobile,
                    enabledThemes: newEnabled
                }
            };
        });
    };

    const handleSaveGeneral = async () => {
        setLoading(true);
        try {
            await updateBranding(formData);
            showMessage('Branding-inställningar sparade!', 'success');
        } catch (error) {
            showMessage(error.message || 'Ett fel uppstod', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCustomTheme = async () => {
        setLoading(true);
        try {
            await updateBranding({
                customTheme: JSON.stringify(customTheme),
                defaultThemeId: 'custom' // Set to use custom theme
            });
            showMessage('Anpassat tema och mobilinställningar sparade!', 'success');
        } catch (error) {
            showMessage(error.message || 'Ett fel uppstod', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (type, file) => {
        // ... (existing upload logic) ...
        if (!file) return;

        setLoading(true);
        try {
            if (type === 'logo') {
                await uploadLogo(file);
                showMessage('Logotyp uppladdad!', 'success');
            } else if (type === 'favicon') {
                await uploadFavicon(file);
                showMessage('Favicon uppladdad!', 'success');
            } else if (type === 'background') {
                await uploadLoginBackground(file);
                showMessage('Bakgrundsbild uppladdad!', 'success');
            } else if (type === 'pwa192' || type === 'pwa512') {
                const targetSize = type === 'pwa192' ? 192 : 512;
                const resizedFile = await resizeImage(file, targetSize);

                if (type === 'pwa192') {
                    await uploadPwaIcon192(resizedFile);
                } else {
                    await uploadPwaIcon512(resizedFile);
                }

                showMessage(`PWA-ikon (${targetSize}x${targetSize}) uppladdad och klar!`, 'success');
                // Force reload branding to get new URLs
                await updateBranding({});
            }
        } catch (error) {
            showMessage(error.message || 'Ett fel uppstod vid uppladdning', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        // ... (existing reset logic) ...
        if (!window.confirm('Är du säker på att du vill återställa all branding till standardinställningar?')) {
            return;
        }

        setLoading(true);
        try {
            await resetBranding();
            showMessage('Branding återställd till standard!', 'success');
        } catch (error) {
            showMessage(error.message || 'Ett fel uppstod', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!hasAccess) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        <div>
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                                Enterprise-licens krävs
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                Enterprise Whitelabel-modulen kräver en aktiv ENTERPRISE-licens. Kontakta din administratör för att uppgradera.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const menuItems = [
        {
            category: 'Varumärke',
            items: [
                { id: 'general', label: 'Allmänt', icon: Globe },
                { id: 'assets', label: 'Grafiska resurser', icon: ImageIcon },
                { id: 'text', label: 'Texter & Meddelanden', icon: Globe },
                { id: 'custom-css', label: 'Avancerad CSS', icon: Settings }
            ]
        },
        {
            category: 'Utseende',
            items: [
                { id: 'design', label: 'Design System', icon: Layers },
                { id: 'theme', label: 'Anpassat tema', icon: Palette },
                { id: 'pwa', label: 'PWA & Mobil-app', icon: Smartphone }
            ]
        }
    ];
    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <AdminHeader />

            {/* Admin Navigation */}
            <AdminNavbar />

            {/* Main Content Area with Internal Sidebar */}
            <div className="flex bg-gray-50 dark:bg-[#151718] min-h-[600px] rounded-lg border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                {/* SIDEBAR */}
                <aside className={`bg-white dark:bg-[#1e2022] w-64 border-r border-gray-200 dark:border-[#3c4043] flex-shrink-0 flex flex-col ${mobileMenuOpen ? 'block absolute z-50 h-full' : 'hidden md:flex'}`}>
                    <div className="p-4 border-b border-gray-200 dark:border-[#3c4043] flex items-center justify-between">
                        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">Whitelabel</h2>
                        <button className="md:hidden" onClick={() => setMobileMenuOpen(false)}>X</button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                        {menuItems.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                    {group.category}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                                ? 'bg-indigo-50 text-indigo-700 dark:!bg-[#333537] dark:text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282a2c]'
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#151718]">
                    {/* Mobile Header */}
                    <div className="md:hidden p-4 bg-white dark:bg-[#1e2022] border-b border-gray-200 dark:border-[#3c4043] flex justify-between items-center">
                        <span className="font-bold">Meny</span>
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-gray-100 rounded">
                            <Settings size={20} />
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Header for content area */}
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {menuItems.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {activeTab === 'general' && 'Hantera grundläggande varumärkesinställningar.'}
                                    {activeTab === 'assets' && 'Ladda upp logotyper och ikoner.'}
                                    {activeTab === 'design' && 'Välj ett globalt designsystem för hela plattformen.'}
                                    {activeTab === 'theme' && 'Skapa eller välj färgteman.'}
                                    {activeTab === 'text' && 'Anpassa systemets texter, titlar och meddelanden.'}
                                    {activeTab === 'custom-css' && 'Skriv egen CSS för att finjustera utseendet på djupet.'}
                                    {activeTab === 'pwa' && 'Konfigurera appen för mobila enheter, inkl. ikoner, färger och navigering.'}
                                </p>
                            </div>
                            {(activeTab === 'general' || activeTab === 'design' || activeTab === 'text' || activeTab === 'custom-css') && (
                                <button
                                    onClick={handleSaveGeneral}
                                    disabled={loading}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                    title="Spara"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                            )}
                            {(activeTab === 'theme' || activeTab === 'pwa') && (
                                <button
                                    onClick={handleSaveCustomTheme}
                                    disabled={loading}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                    title="Spara anpassat tema"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                        Varumärkesinformation
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Standard-tema (används om inget anpassat tema är aktivt)
                                            </label>
                                            <select
                                                name="defaultThemeId"
                                                value={formData.defaultThemeId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                             bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                            >
                                                {themes.map(theme => (
                                                    <option key={theme.id} value={theme.id}>
                                                        {theme.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                        Inställningar
                                    </h2>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="showPoweredBy"
                                                checked={formData.showPoweredBy}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-indigo-600 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Visa "Powered by EduFlex"
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Visa EduFlex-branding i footern
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="enforceOrgTheme"
                                                checked={formData.enforceOrgTheme}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-indigo-600 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    Tvinga organisationens tema
                                                    {formData.enforceOrgTheme && <EyeOff className="w-4 h-4 text-yellow-500" />}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Användare kan inte ändra tema om aktiverat
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="customEmailTemplates"
                                                checked={formData.customEmailTemplates}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-indigo-600 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Anpassade e-postmallar
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Använd varumärkesanpassade e-postmallar (framtida funktion)
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg
                                     flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Återställ allt
                                </button>
                            </div>
                        )}

                        {/* Assets Tab */}
                        {activeTab === 'assets' && (
                            <div className="space-y-6">
                                <AssetUploader
                                    title="Logotyp"
                                    description="Huvudlogotyp som visas i systemet. Rekommenderad storlek: 200x50px (PNG eller SVG)"
                                    currentUrl={branding.logoUrl}
                                    onUpload={(file) => handleFileUpload('logo', file)}
                                    accept="image/*"
                                    loading={loading}
                                />

                                <AssetUploader
                                    title="Favicon"
                                    description="Ikon som visas i webbläsarfliken. Rekommenderad storlek: 32x32px (ICO, PNG eller SVG)"
                                    currentUrl={branding.faviconUrl}
                                    onUpload={(file) => handleFileUpload('favicon', file)}
                                    accept="image/*,.ico"
                                    loading={loading}
                                />

                                <AssetUploader
                                    title="Inloggningsbakgrund"
                                    description="Bakgrundsbild för inloggningssidan. Rekommenderad storlek: 1920x1080px"
                                    currentUrl={branding.loginBackgroundUrl}
                                    onUpload={(file) => handleFileUpload('background', file)}
                                    accept="image/*"
                                    loading={loading}
                                    isBackground
                                />
                            </div>
                        )}

                        {/* Design System Tab */}
                        {activeTab === 'design' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                        Välj Design System
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        Design Systems ändrar hela UI:ts utseende - kort, knappar, skuggor och mer. Detta är en exklusiv Enterprise-feature.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Object.values(DESIGN_SYSTEMS).map((theme) => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setFormData({ ...formData, designSystem: theme.id })}
                                                className={`group relative p-6 rounded-2xl border-2 transition-all text-left overflow-hidden flex flex-col h-full ${formData.designSystem === theme.id
                                                    ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20'
                                                    : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300'
                                                    }`}
                                                style={{
                                                    // Dynamic preview background for the card container
                                                    background: formData.designSystem === theme.id
                                                        ? (localStorage.getItem('theme') === 'dark' ? theme.page.dark : theme.page.light)
                                                        : 'transparent'
                                                }}
                                            >
                                                {/* Preview Mockup Area */}
                                                <div className="relative w-full aspect-video mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner"
                                                    style={{
                                                        background: localStorage.getItem('theme') === 'dark' ? theme.page.dark : theme.page.light
                                                    }}>

                                                    {/* Abstract Representation of the Theme */}
                                                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                                                        <div
                                                            className="w-3/4 h-24 flex items-center justify-center relative transition-all"
                                                            style={{
                                                                borderRadius: theme.card.radius.xl,
                                                                boxShadow: theme.card.shadow,
                                                                background: localStorage.getItem('theme') === 'dark' ? theme.card.backgroundDark : theme.card.background,
                                                                border: localStorage.getItem('theme') === 'dark' ? theme.card.borderDark : theme.card.border,
                                                                backdropFilter: theme.card.backdrop
                                                            }}
                                                        >
                                                            {/* Mini Element inside */}
                                                            <div
                                                                className="w-12 h-12 flex items-center justify-center font-bold text-xs"
                                                                style={{
                                                                    borderRadius: theme.button.radius,
                                                                    boxShadow: theme.button.shadow,
                                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                                    color: '#6366f1'
                                                                }}
                                                            >
                                                                Aa
                                                            </div>

                                                            {/* Corner indicator */}
                                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white flex items-center justify-between">
                                                        {theme.name}
                                                        {formData.designSystem === theme.id && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 min-h-[40px]">
                                                        {theme.description}
                                                    </p>
                                                </div>

                                                {/* Tech Specs Helpers */}
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                        R: {theme.card.radius.xl}
                                                    </span>
                                                    {theme.card.backdrop !== 'none' && (
                                                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded border border-blue-100 dark:border-blue-800">
                                                            Blur
                                                        </span>
                                                    )}
                                                    {theme.id === 'brutalist' && (
                                                        <span className="px-2 py-1 bg-black text-white dark:bg-white dark:text-black rounded">
                                                            BOLD
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-4 bg-indigo-50 dark:!bg-gray-900 border border-indigo-200 dark:!border-gray-700 rounded-lg">
                                        <h4 className="font-semibold text-indigo-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                            <Layers className="w-5 h-5" />
                                            Valt Design System: {formData.designSystem}
                                        </h4>
                                        <p className="text-sm text-indigo-700 dark:text-gray-300">
                                            Design systemet påverkar alla kort, knappar och UI-element i hela applikationen. Ändringar träder i kraft direkt när du sparar.
                                        </p>
                                    </div>

                                </div>
                            </div >
                        )}

                        {/* Texts Tab */}
                        {activeTab === 'text' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                        <Type className="w-5 h-5 text-indigo-600" />
                                        Systemtexter & Meddelanden
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Varumärkesnamn
                                            </label>
                                            <input
                                                type="text"
                                                name="brandName"
                                                value={formData.brandName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                             bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                                placeholder="EduFlex"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Namnet som visas i webbläsarfliken och i systemet.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Välkomstmeddelande (Inloggning)
                                            </label>
                                            <textarea
                                                name="welcomeMessage"
                                                value={formData.welcomeMessage}
                                                onChange={handleInputChange}
                                                rows={4}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                             bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                                placeholder="Välkommen till vårt lärandesystem..."
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Texten som visas bredvid inloggningsformuläret.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Footer-text
                                            </label>
                                            <input
                                                type="text"
                                                name="footerText"
                                                value={formData.footerText}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                             bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                                placeholder="Powered by EduFlex"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Texten som visas längst ner i systemet.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Custom CSS Tab */}
                        {activeTab === 'custom-css' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-indigo-600" />
                                        Avancerad CSS
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        Här kan du skriva egen CSS för att skriva över systemets standardstilar. Var försiktig då felaktig CSS kan förstöra layouten.
                                    </p>

                                    <div className="space-y-4">
                                        <textarea
                                            value={formData.customCss}
                                            onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
                                            rows={15}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                                         bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white font-mono text-sm leading-relaxed"
                                            placeholder="/* Exempel: */
.logo-container {
  height: 60px !important;
}

.bg-indigo-600 {
  background-color: var(--primary-600) !important;
}"
                                        />

                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl">
                                            <div className="flex gap-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                                                <div className="text-xs text-yellow-700 dark:text-gray-300">
                                                    <span className="font-bold">Tips:</span> Använd CSS-variabler som <code>--primary-600</code> för att matcha ditt tema, och dölj element med <code>display: none !important;</code>.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Custom Theme Tab */}
                        {
                            activeTab === 'theme' && (
                                <div className="space-y-6">
                                    {/* Predefined Enterprise Themes */}
                                    <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                            Fördefinierade Enterprise-teman
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                            Välj ett professionellt fördesignat tema eller skapa ett eget anpassat tema nedan.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {enterpriseThemes.map(theme => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => {
                                                        setCustomTheme(prev => ({
                                                            ...prev,
                                                            name: theme.name,
                                                            colors: theme.colors
                                                        }));
                                                    }}
                                                    className="group relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700
                                             hover:border-indigo-500 dark:hover:border-indigo-500 transition-all
                                             bg-white dark:bg-[#282a2c] text-left"
                                                >
                                                    {/* Color Preview */}
                                                    <div className="flex gap-1 mb-3">
                                                        {[500, 600, 700].map(shade => (
                                                            <div
                                                                key={shade}
                                                                style={{ backgroundColor: theme.colors[shade] }}
                                                                className="h-12 flex-1 rounded-lg shadow-sm first:rounded-l-lg last:rounded-r-lg"
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Theme Info */}
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                        {theme.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {theme.description}
                                                    </p>

                                                    {/* Hover Effect */}
                                                    <div className="absolute inset-0 bg-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Custom Builder (Collapsed) */}
                                    <details className="group bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 open:ring-2 open:ring-indigo-500/20">
                                        <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-semibold text-gray-900 dark:text-white">
                                            <span>Avancerad färgpalett (Manuell)</span>
                                            <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                                        </summary>
                                        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                                            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white hidden">
                                                Anpassad färgpalett
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                                Finjustera färgerna manuellt för att skapa ett helt unikt tema.
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                                {Object.keys(customTheme.colors).map(shade => (
                                                    <div key={shade}>
                                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                            Shade {shade}
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                value={customTheme.colors[shade]}
                                                                onChange={(e) => handleColorChange(shade, e.target.value)}
                                                                className="w-12 h-10 rounded cursor-pointer"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={customTheme.colors[shade]}
                                                                onChange={(e) => handleColorChange(shade, e.target.value)}
                                                                className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600
                                                     bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Theme Preview */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#131314] dark:to-[#1e1f20]">
                                                <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                                                    Live-förhandsvisning
                                                </h3>
                                                <div className="space-y-4">
                                                    {/* Buttons Preview */}
                                                    <div className="flex gap-3 flex-wrap">
                                                        <button
                                                            style={{ backgroundColor: customTheme.colors[600] }}
                                                            className="px-5 py-2.5 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow"
                                                        >
                                                            Primär knapp
                                                        </button>
                                                        <button
                                                            style={{
                                                                borderColor: customTheme.colors[600],
                                                                color: customTheme.colors[600]
                                                            }}
                                                            className="px-5 py-2.5 bg-transparent border-2 rounded-lg font-medium"
                                                        >
                                                            Sekundär knapp
                                                        </button>
                                                    </div>

                                                    {/* Color Swatches */}
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Färgskala:</p>
                                                        <div className="flex gap-1">
                                                            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(shade => (
                                                                <div
                                                                    key={shade}
                                                                    style={{ backgroundColor: customTheme.colors[shade] }}
                                                                    className="flex-1 h-12 rounded shadow-sm first:rounded-l-lg last:rounded-r-lg"
                                                                    title={`${shade}: ${customTheme.colors[shade]}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* UI Elements Preview */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div
                                                            style={{ backgroundColor: customTheme.colors[50] }}
                                                            className="p-3 rounded-lg"
                                                        >
                                                            <div
                                                                style={{ backgroundColor: customTheme.colors[600] }}
                                                                className="w-8 h-8 rounded-full mb-2"
                                                            />
                                                            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-1" />
                                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                                        </div>
                                                        <div
                                                            style={{
                                                                backgroundColor: customTheme.colors[600],
                                                                color: 'white'
                                                            }}
                                                            className="p-3 rounded-lg"
                                                        >
                                                            <div className="text-xs font-semibold mb-1">Widget</div>
                                                            <div className="text-2xl font-bold">2,540</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            )
                        }


                        {/* PWA & Mobil-app Tab */}
                        {activeTab === 'pwa' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                        PWA Inställningar (Progressive Web App)
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Appens fullständiga namn
                                            </label>
                                            <input
                                                type="text"
                                                value={customTheme.pwa?.appName || ''}
                                                onChange={(e) => setCustomTheme({
                                                    ...customTheme,
                                                    pwa: { ...customTheme.pwa, appName: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                                placeholder="EduFlex LMS"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Kortnamn (för hemskärmen)
                                            </label>
                                            <input
                                                type="text"
                                                value={customTheme.pwa?.shortName || ''}
                                                onChange={(e) => setCustomTheme({
                                                    ...customTheme,
                                                    pwa: { ...customTheme.pwa, shortName: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                                placeholder="EduFlex"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Bakgrundsfärg (Splash Screen)
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={customTheme.pwa?.backgroundColor || '#ffffff'}
                                                    onChange={(e) => setCustomTheme({
                                                        ...customTheme,
                                                        pwa: { ...customTheme.pwa, backgroundColor: e.target.value }
                                                    })}
                                                    className="w-12 h-10 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={customTheme.pwa?.backgroundColor || '#ffffff'}
                                                    onChange={(e) => setCustomTheme({
                                                        ...customTheme,
                                                        pwa: { ...customTheme.pwa, backgroundColor: e.target.value }
                                                    })}
                                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-[#282a2c] dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Temafärg (Statusfält)
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={customTheme.pwa?.themeColor || '#6366f1'}
                                                    onChange={(e) => handlePwaColorChange('themeColor', e.target.value)}
                                                    className="w-12 h-10 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={customTheme.pwa?.themeColor || '#6366f1'}
                                                    onChange={(e) => handlePwaColorChange('themeColor', e.target.value)}
                                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-[#282a2c] dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Integrated Mobile Nav Settings */}
                                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                            <Smartphone size={20} className="text-indigo-600" />
                                            Mobilnavigering & Gränssnitt
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                        Menystil
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => handleMobileColorChange('componentDepth', 'standard')}
                                                            className={`p-3 rounded-xl border-2 text-left transition-all ${customTheme.mobile?.componentDepth === 'standard' || !customTheme.mobile?.componentDepth ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 dark:border-gray-700'}`}
                                                        >
                                                            <div className="font-bold text-sm">Standard</div>
                                                            <div className="text-[10px] text-gray-500">Fixerad botten</div>
                                                        </button>
                                                        <button
                                                            onClick={() => handleMobileColorChange('componentDepth', 'floating')}
                                                            className={`p-3 rounded-xl border-2 text-left transition-all ${customTheme.mobile?.componentDepth === 'floating' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 dark:border-gray-700'}`}
                                                        >
                                                            <div className="font-bold text-sm">Flytande</div>
                                                            <div className="text-[10px] text-gray-500">Modern svävande</div>
                                                        </button>
                                                    </div>
                                                </div>

                                                <label className="flex items-center gap-3 cursor-pointer pt-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={customTheme.mobile?.glassmorphism || false}
                                                        onChange={(e) => handleMobileColorChange('glassmorphism', e.target.checked)}
                                                        className="w-5 h-5 text-indigo-600 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                            Glassmorphism
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            Blur-effekt på menyn
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 text-sm">Inaktiv Färg (Ikoner)</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={customTheme.mobile?.inactiveColor || '#6b7280'}
                                                            onChange={(e) => handleMobileColorChange('inactiveColor', e.target.value)}
                                                            className="w-10 h-8 rounded cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={customTheme.mobile?.inactiveColor || '#6b7280'}
                                                            onChange={(e) => handleMobileColorChange('inactiveColor', e.target.value)}
                                                            className="flex-1 px-3 py-1 text-sm border rounded-lg dark:bg-[#282a2c] dark:border-gray-600 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 italic mt-1">
                                                    * Aktiv färg synkas automatiskt med "Temafärg" ovan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AssetUploader
                                            title="App Ikon (192x192)"
                                            description="Ikon som visas på hemskärmen (Android/Chrome). Rekommenderad storlek: 192x192px (PNG)"
                                            currentUrl={customTheme.pwa?.icon192}
                                            onUpload={(file) => handleFileUpload('pwa192', file)}
                                            accept="image/png"
                                            loading={loading}
                                        />
                                        <AssetUploader
                                            title="App Ikon (512x512)"
                                            description="Stor ikon för splash-screens och högupplösta skärmar. Rekommenderad storlek: 512x512px (PNG)"
                                            currentUrl={customTheme.pwa?.icon512}
                                            onUpload={(file) => handleFileUpload('pwa512', file)}
                                            accept="image/png"
                                            loading={loading}
                                        />
                                    </div>

                                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl">
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-indigo-900 dark:text-gray-100">Viktig information</h4>
                                                <p className="text-xs text-indigo-700 dark:text-gray-300 mt-1">
                                                    Dessa inställningar påverkar hur din app identifierar sig när användare installerar den på sina mobiler eller datorer.
                                                    Efter att du sparat kan det ta en stund innan webbläsaren uppdaterar installations-manifestet.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Förhandsvisning (Installation)</h3>
                                    <div className="flex justify-center py-8">
                                        <div className="w-64 bg-gray-50 dark:bg-black/40 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xl">
                                            <div
                                                className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg flex items-center justify-center text-white font-bold text-2xl overflow-hidden"
                                                style={{ backgroundColor: customTheme.pwa?.themeColor || '#6366f1' }}
                                            >
                                                {customTheme.pwa?.icon192 || customTheme.pwa?.icon512 ? (
                                                    <img
                                                        src={customTheme.pwa?.icon192 || customTheme.pwa?.icon512}
                                                        alt="App Icon"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    customTheme.pwa?.shortName?.[0] || 'E'
                                                )}
                                            </div>
                                            <h4 className="text-center font-bold dark:text-white">{customTheme.pwa?.appName || 'EduFlex LMS'}</h4>
                                            <p className="text-center text-xs text-gray-500 mt-1">{window.location.host}</p>
                                            <div className="mt-6 flex flex-col gap-2">
                                                <div
                                                    className="h-10 rounded-xl w-full flex items-center justify-center text-white text-sm font-bold"
                                                    style={{ backgroundColor: customTheme.pwa?.themeColor || '#6366f1' }}
                                                >
                                                    Installera
                                                </div>
                                                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full flex items-center justify-center text-xs dark:text-gray-400">Avbryt</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button for PWA Tab */}
                                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleSaveCustomTheme}
                                        disabled={loading}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
                                                     flex items-center gap-2 disabled:opacity-50 shadow-sm transition-colors"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        Spara ändringar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main >
            </div >
        </div >
    );
};

// Asset Uploader Component
const AssetUploader = ({ title, description, currentUrl, onUpload, accept, loading, isBackground }) => {
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {description}
            </p>

            {currentUrl && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Nuvarande:</p>
                    {isBackground ? (
                        <div
                            className="w-full h-32 bg-cover bg-center rounded-lg border border-gray-200 dark:border-gray-600"
                            style={{ backgroundImage: `url(${currentUrl})` }}
                        />
                    ) : (
                        <img
                            src={currentUrl}
                            alt={title}
                            className="max-h-16 object-contain bg-gray-100 dark:bg-gray-800 p-2 rounded"
                        />
                    )}
                </div>
            )}

            <label className="inline-block">
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                />
                <span className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
                    cursor-pointer inline-flex items-center gap-2 disabled:opacity-50">
                    <Upload className="w-4 h-4" />
                    Ladda upp {title}
                </span>
            </label>
        </div>
    );
};

export default EnterpriseWhitelabel;
