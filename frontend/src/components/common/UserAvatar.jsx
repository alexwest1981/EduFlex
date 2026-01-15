import React, { useState } from 'react';

const UserAvatar = ({ user, size = "w-12 h-12", fontSize = "text-base" }) => {
    const [error, setError] = useState(false);

    if (!user?.profilePictureUrl || error) {
        return (
            <div className={`${size} rounded-full bg-gray-200 dark:bg-[#282a2c] flex items-center justify-center font-bold text-gray-500 overflow-hidden shrink-0`}>
                <span className={fontSize}>{user?.firstName?.[0]}</span>
            </div>
        );
    }

    const getUrl = (url) => {
        if (!url) return '';
        if (url.includes('minio:9000')) url = url.replace('minio:9000', 'localhost:9000');
        if (url.startsWith('http')) return url;
        if (!url.startsWith('/')) {
            if (!url.includes('/')) url = '/uploads/' + url;
            else url = '/' + url;
        }
        return `http://localhost:8080${url}`;
    };

    return (
        <div className={`${size} rounded-full overflow-hidden bg-gray-200 dark:bg-[#282a2c] shrink-0`}>
            <img
                src={getUrl(user.profilePictureUrl)}
                onError={() => setError(true)}
                className="w-full h-full object-cover"
                alt={user.firstName}
            />
        </div>
    );
};

export default UserAvatar;
