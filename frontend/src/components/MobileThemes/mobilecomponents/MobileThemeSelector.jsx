import React from 'react';
import { useBranding } from '../../../context/BrandingContext';
import { Check, Smartphone } from 'lucide-react';

const AVAILABLE_THEMES = [
    { id: 'finsights-dark', name: 'Finsights Dark', color: '#0F0F11', badge: 'Pro' },
    { id: 'cosmic-growth', name: 'Cosmic Growth', color: '#1F2235', badge: 'New' },
    { id: 'eduflex-fresh', name: 'EduFresh', color: '#FFFFFF', badge: 'Light' },
    { id: 'midnight-glass', name: 'Midnight Glass', color: '#000000' },
    { id: 'clean-light', name: 'Clean Light', color: '#F3F4F6' }
];

const MobileThemeSelector = ({ onSelect }) => {
    const { getCustomTheme, updateBranding } = useBranding();
    const customTheme = getCustomTheme() || {};
    const mobileConfig = customTheme.mobile || {};

    // Default allowed themes if none configured (fallback)
    const allowedIds = mobileConfig.enabledThemes || ['finsights-dark', 'cosmic-growth', 'eduflex-fresh'];

    // Resolve current theme: LocalStorage > Global Default > Fallback
    const storedTheme = localStorage.getItem('active_mobile_theme');
    const currentThemeId = storedTheme && allowedIds.includes(storedTheme)
        ? storedTheme
        : (mobileConfig.id || 'finsights-dark');

    // Filter available themes based on admin config
    const visibleThemes = AVAILABLE_THEMES.filter(t => allowedIds.includes(t.id));

    const handleThemeChange = (themeId) => {
        // Save using LocalStorage (User Preference)
        localStorage.setItem('active_mobile_theme', themeId);

        // Callback if provided
        if (onSelect) onSelect(themeId);

        // Reload to apply changes via MobileThemeResolver
        window.location.reload();
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Välj utseende</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{visibleThemes.length} tillgängliga</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {visibleThemes.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`group relative flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:scale-95
                        ${currentThemeId === theme.id
                                ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/20'
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl shadow-sm border border-black/10 flex items-center justify-center"
                                style={{ backgroundColor: theme.color }}
                            >
                                <Smartphone size={18} className={theme.color === '#FFFFFF' || theme.color === '#F3F4F6' ? 'text-black' : 'text-white'} />
                            </div>
                            <div className="text-left">
                                <h4 className={`text-sm font-bold ${currentThemeId === theme.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {theme.name}
                                </h4>
                                {theme.badge && (
                                    <span className="text-[10px] text-gray-400 border border-gray-200 dark:border-white/10 px-1.5 rounded">{theme.badge}</span>
                                )}
                            </div>
                        </div>

                        {currentThemeId === theme.id && (
                            <div className="bg-indigo-600 text-white p-1 rounded-full">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {visibleThemes.length === 0 && (
                <p className="text-xs text-red-400 text-center py-4">Inga teman tillgängliga.</p>
            )}
        </div>
    );
};

export default MobileThemeSelector;
