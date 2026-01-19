import React from 'react';
import { useBranding } from '../../../context/BrandingContext';

/**
 * MobileWidget - A standardized container for mobile content.
 * Automatically adapts to the active Mobile Theme (Glassmorphism, Radius, Depth).
 */
const MobileWidget = ({ children, title, icon: Icon, actionComponent, className = '' }) => {
    const { getCustomTheme } = useBranding();
    const customTheme = getCustomTheme();
    const mobileTheme = customTheme?.mobile || {};

    // Theme Token Extraction
    const borderRadius = mobileTheme.borderRadius || '24px';
    const depth = mobileTheme.componentDepth || 'floating'; // flat, shadow, floating, glass
    const isGlass = mobileTheme.glassmorphism || false;
    const bgColor = mobileTheme.backgroundColor || '#ffffff';

    // Compute Dynamic Styles
    const getWidgetStyles = () => {
        const isGlassEffect = depth === 'glass' || isGlass;
        const bgOpacity = isGlassEffect ? 'cc' : 'ff'; // cc = 80%, ff = 100%

        return {
            borderRadius: borderRadius,
            backgroundColor: `${bgColor}${bgOpacity}`,
            backdropFilter: isGlassEffect ? 'blur(12px) saturate(180%)' : 'none',
            border: (isGlassEffect || depth === 'flat') ? '1px solid rgba(255,255,255,0.1)' : 'none',
            boxShadow: getShadow(depth, mobileTheme.activeColor),
            marginBottom: '16px' // Standard spacing
        };
    };

    const getShadow = (depthType, accentColor) => {
        switch (depthType) {
            case 'floating':
                return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            case 'shadow':
                return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            case 'glass':
                return '0 8px 32px 0 rgba(31, 38, 135, 0.07)';
            default:
                return 'none';
        }
    };

    return (
        <div
            className={`relative p-5 transition-all duration-300 ${className}`}
            style={getWidgetStyles()}
        >
            {/* Header Section */}
            {(title || Icon) && (
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div
                                className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400"
                                style={{ borderRadius: parseInt(borderRadius) > 12 ? '12px' : borderRadius }}
                            >
                                <Icon size={20} className="stroke-[2.5]" />
                            </div>
                        )}
                        {title && (
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                                {title}
                            </h3>
                        )}
                    </div>
                    {actionComponent && (
                        <div>{actionComponent}</div>
                    )}
                </div>
            )}

            {/* Content Section */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

export default MobileWidget;
