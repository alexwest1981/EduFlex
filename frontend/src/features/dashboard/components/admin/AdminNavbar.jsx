import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Settings, Database, Edit3, Server, Globe, MessageSquare, Store, Trophy, BookOpen, Rocket } from 'lucide-react';
import { useModules } from '../../../../context/ModuleContext';

const AdminNavbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { isModuleActive } = useModules();

    // Parse query param or active route
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'administration';
    const isWhitelabel = location.pathname.startsWith('/enterprise/whitelabel');
    const isCommunity = location.pathname === '/admin/community';
    const isGamification = location.pathname === '/admin/gamification-management';

    const tabs = [
        { id: 'administration', label: t('admin_tabs.administration') || 'Administration', icon: Users, path: '/admin?tab=administration' },
        { id: 'pilot', label: 'Pilot Kit', icon: Rocket, path: '/admin?tab=pilot', color: 'text-orange-500' },
        { id: 'system', label: t('admin_tabs.system_settings') || 'Systeminställningar', icon: Settings, path: '/admin?tab=system' },
        { id: 'tickets', label: t('admin_tabs.tickets') || 'Ärenden', icon: MessageSquare, path: '/admin?tab=tickets' },
        { id: 'support-content', label: 'Support Innehåll', icon: BookOpen, path: '/admin?tab=support-content' },
        { id: 'gamification', label: 'Gamification', icon: Trophy, path: '/admin/gamification-management', visible: isModuleActive('GAMIFICATION') },
        { id: 'community', label: 'Community', icon: Store, path: '/admin/community' }
    ].filter(tab => tab.visible !== false);

    const handleNavigation = (tab) => {
        navigate(tab.path);
    };

    return (
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map(tab => {
                const Icon = tab.icon;
                // Determine active state
                // If on whitelabel route, that tab is active
                // If on /admin/community, that tab is active
                // If on /admin, check query param matches tab.id
                let isActive = false;
                if (tab.id === 'whitelabel') {
                    isActive = isWhitelabel;
                } else if (tab.id === 'community') {
                    isActive = isCommunity;
                } else if (tab.id === 'gamification') {
                    isActive = isGamification;
                } else if (!isWhitelabel && !isCommunity && !isGamification) {
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
                        <Icon size={20} className={isActive && tab.color ? tab.color : ''} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default AdminNavbar;
