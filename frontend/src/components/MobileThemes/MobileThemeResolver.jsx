import React from 'react';
import { useBranding } from '../../context/BrandingContext';

// Available Themes
import EduFlexCosmic from './EduFlexCosmic';
import EduFlexFresh from './EduFlexFresh';
import EduFlexFinsights from './EduFlexFinsights';

/**
 * MobileThemeResolver - The Gatekeeper for Mobile Themes.
 * Reads the 'mobile.id' from BrandingContext and renders the corresponding EduFlex* component.
 */
const MobileThemeResolver = (props) => {
    const { getCustomTheme } = useBranding();
    const customTheme = getCustomTheme();
    /**
     * Logic:
     * 1. Get current theme ID.
     * 2. Get list of ENABLED themes (from whitelabel config).
     * 3. If current theme is NOT in enabled list, fallback to first enabled theme.
     */
    const mobileConfig = customTheme?.mobile || {};
    const enabledThemes = mobileConfig.enabledThemes || ['finsights-dark', 'cosmic-growth', 'eduflex-fresh'];

    // 1. Check User Preference (LocalStorage)
    const userPref = localStorage.getItem('active_mobile_theme');
    const globalDefault = mobileConfig.id || 'finsights-dark';

    // 2. Determine Candidate (User Pref if valid, else Global Default)
    let themeId = (userPref && enabledThemes.includes(userPref)) ? userPref : globalDefault;

    // 3. Final Safety Check: If current choice is not enabled, fallback to first available
    if (!enabledThemes.includes(themeId) && enabledThemes.length > 0) {
        themeId = enabledThemes[0];
    }

    // Force full-screen overlay to hide default layout/nav
    const overlayClass = "fixed inset-0 z-[9999] bg-[#0F0F11] overflow-y-auto overflow-x-hidden";

    // Helper to wrap theme
    const renderTheme = (Component) => (
        <div className={overlayClass}>
            <Component {...props} />
        </div>
    );

    switch (themeId) {
        case 'finsights-dark':
            return renderTheme(EduFlexFinsights);

        case 'cosmic-growth':
            return renderTheme(EduFlexCosmic);

        case 'eduflex-fresh':
            return <EduFlexFresh {...props} />;

        case 'midnight-glass':
            // Fallback or specific implementation if created
            return <EduFlexFresh {...props} />;

        case 'clean-light':
            return <EduFlexFresh {...props} />;

        default:
            // Safety fallback
            return <EduFlexFresh {...props} />;
    }
};

export default MobileThemeResolver;
