import React from 'react';
import { useTranslation } from 'react-i18next';

const AdminHeader = () => {
    return (
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administration</h1>
            <p className="text-gray-500 dark:text-gray-400">Hantera användare, rättigheter och kurser.</p>
        </header>
    );
};

export default AdminHeader;
