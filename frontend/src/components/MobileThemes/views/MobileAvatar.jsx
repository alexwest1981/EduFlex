import React, { useState } from 'react';
import { getSafeUrl } from '../../../services/api';

const MobileAvatar = ({ user, className = "" }) => {
    const [imgError, setImgError] = useState(false);

    // 1. Process Image URL
    const profileImg = getSafeUrl(user?.profilePictureUrl);
    const showImage = profileImg && !imgError;

    // 2. Generate Initials (Fallback)
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

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
