import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Settings, Database, Edit3, Server, Globe } from 'lucide-react';

const AdminNavbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query param or active route
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'administration';
    const isWhitelabel = location.pathname.startsWith('/enterprise/whitelabel');

    const tabs = [
        { id: 'administration', label: t('admin_tabs.administration') || 'Administration', icon: Users, path: '/admin?tab=administration' },
        { id: 'tenants', label: 'Tenants', icon: Server, path: '/admin?tab=tenants' },
        { id: 'system', label: t('admin_tabs.system_settings') || 'Systeminställningar', icon: Settings, path: '/admin?tab=system' },
        { id: 'skolverket', label: t('admin_tabs.skolverket_import') || 'Skolverket Import', icon: Database, path: '/admin?tab=skolverket' },
        { id: 'skolverket-edit', label: 'Skolverket Data', icon: Edit3, path: '/admin?tab=skolverket-edit' },
        { id: 'whitelabel', label: 'Whitelabel', icon: Globe, path: '/enterprise/whitelabel' }
    ];

    const handleNavigation = (tab) => {
        navigate(tab.path);
    };

    return (
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map(tab => {
                const Icon = tab.icon;
                // Determine active state
                // If on whitelabel route, that tab is active
                // If on /admin, check query param matches tab.id
                let isActive = false;
                if (tab.id === 'whitelabel') {
                    isActive = isWhitelabel;
                } else if (!isWhitelabel) {
                    // Default to administration if no query param
                    isActive = currentTab === tab.id;
                    if (currentTab === 'administration' && !searchParams.get('tab') && tab.id === 'administration') {
                        isActive = true;
                    }
                }

                return (
                    <button
                        key={tab.id}
                        onClick={() => handleNavigation(tab)}
                        className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${isActive
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <Icon size={20} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default AdminNavbar;
