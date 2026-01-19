import React from 'react';
import { useBranding } from '../../../context/BrandingContext';

/**
 * MobileBanner - A rich decorative banner for the mobile dashboard.
 * Supports gradients and background patterns (topographic lines).
 */
const MobileBanner = ({ title, subtitle, ctaText = 'Start quick' }) => {
    const { getCustomTheme } = useBranding();
    const customTheme = getCustomTheme();
    const radius = customTheme?.mobile?.borderRadius || '24px';

    return (
        <div
            className="relative w-full overflow-hidden p-6 mb-6"
            style={{
                borderRadius: radius,
                background: 'linear-gradient(135deg, #1F2235 0%, #151828 100%)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
        >
            {/* Topographic Background Pattern (CSS SVG) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' version='1.1' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 C 20 40 40 10 60 50 S 80 90 100 100' stroke='white' fill='none' stroke-width='0.5'/%3E%3Cpath d='M0 20 C 30 60 50 30 70 70 S 90 100 100 80' stroke='white' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: 'cover'
                }}
            />

            <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white leading-tight">
                        {title}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
                            {subtitle}
                        </span>
                    </h2>
                </div>

                <button
                    className="px-6 py-3 bg-[#FF5A5F] text-white text-sm font-bold shadow-lg hover:bg-[#ff4046] transition-colors active:scale-95"
                    style={{ borderRadius: '14px' }}
                >
                    {ctaText}
                </button>
            </div>

            {/* Glowing Orb Decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-pink-500 rounded-full blur-[60px] opacity-30 animate-pulse" />
        </div>
    );
};

export default MobileBanner;
