import React, { useState } from 'react';

/**
 * MobileAvatar
 * 
 * Reusable avatar component for Mobile Themes.
 * Features:
 * - Proper URL processing for MinIO/Localhost
 * - Fallback to First + Last initial (e.g. "AW")
 * - Customizable styling
 */
const MobileAvatar = ({ user, className = "" }) => {
    const [imgError, setImgError] = useState(false);

    // 1. Process Image URL (Using same logic as MobileHeader for consistency)
    const getProfileImage = () => {
        if (!user?.profilePictureUrl) return null;
        let url = user.profilePictureUrl;

        // Replace MinIO internal hostname with actual client-accessible hostname
        if (url.includes('minio:9000')) {
            // Clean hostname from www
            let hostname = window.location.hostname.replace('www.', '');
            url = url.replace('minio', hostname);
        }

        // Ensure protocol
        if (!url.startsWith('http')) {
            const hostname = window.location.hostname;
            // Localhost / IP -> Port 8080
            if (hostname === 'localhost' || hostname.match(/^[\d.]+$/)) {
                url = `http://${hostname}:8080${url}`;
            } else {
                // Production (Cloudflare) -> https://api.domain.com
                // Remove www if present
                const domain = hostname.replace('www.', '');
                url = `https://api.${domain}${url}`;
            }
        }

        return url;
    };

    // 2. Generate Initials (Fallback)
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const profileImg = getProfileImage();
    const showImage = profileImg && !imgError;

    // 3. Render
    // Using neutral gray-200 background with gray-600 text as requested
    return (
        <div className={`relative overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold ${className}`}>
            {showImage ? (
                <img
                    src={profileImg}
                    className="w-full h-full object-cover"
                    alt={user?.name || "Avatar"}
                    onError={() => setImgError(true)}
                />
            ) : (
                <span className="text-[inherit] select-none text-[0.8em]">
                    {getInitials(user?.fullName || user?.name)}
                </span>
            )}
        </div>
    );
};

export default MobileAvatar;
