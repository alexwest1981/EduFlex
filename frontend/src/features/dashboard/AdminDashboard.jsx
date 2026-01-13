import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShieldCheck, Loader2, MessageSquare, Users } from 'lucide-react'; // Added Users
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

// --- COMPONENTS ---
import AdminOverview from './AdminOverview';
import SettingsTab from '../admin/SettingsTab'; // System tab
import MessageCenter from '../messages/MessageCenter';
import LicenseStatusCard from '../admin/LicenseStatusCard';

// --- SHARED ---
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import DashboardCustomizer from '../../components/dashboard/DashboardCustomizer';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [unreadCount, setUnreadCount] = useState(0);

    // Widget State via Hook
    const { widgets, toggleWidget } = useDashboardWidgets('admin', {
        stats: true,
        recentUsers: true,
        recentDocs: true,
        messages: true
    });

    const widgetLabels = {
        stats: 'Statistik',
        recentUsers: 'Senaste Användare',
        recentDocs: 'Nyligen Uppladdat',
        messages: 'Senaste Meddelanden'
    };

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [uData, c, d, unread] = await Promise.all([
                api.users.getAll(0, 1000), // Tillfällig fix: Hämta fler för korrekt statistik tills backend-stats endpoints finns
                api.courses.getAll(),
                api.documents.getAll(),
                api.messages.getUnreadCount()
            ]);
            // Hantera om users är en Page (pagination) eller Array
            setUsers(uData.content || uData || []);
            setCourses(c);
            setDocuments(d);
            setUnreadCount(unread);
        } catch (error) {
            console.error("Kunde inte hämta dashboard-data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.live_overview')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.realtime_data')}</p>
                </div>
                {activeTab === 'overview' && (
                    <DashboardCustomizer
                        widgets={widgets}
                        toggleWidget={toggleWidget}
                        widgetLabels={widgetLabels}
                    />
                )}
            </header>

            {/* TAB MENY - HUVUDNIVÅ */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043] mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 flex items-center gap-2 font-bold text-lg transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <LayoutDashboard size={20} /> Översikt
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`pb-3 flex items-center gap-2 font-bold text-lg transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === 'system' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <ShieldCheck size={20} /> System
                </button>
                <button
                    onClick={() => setActiveTab('communication')}
                    className={`pb-3 flex items-center gap-2 font-bold text-lg transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === 'communication' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <div className="relative">
                        <MessageSquare size={20} />
                        {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{unreadCount}</span>}
                    </div>
                    Kommunikation
                </button>
            </div>

            {/* --- FLIK: ÖVERSIKT --- */}
            {activeTab === 'overview' && (
                <AdminOverview
                    users={users}
                    courses={courses}
                    documents={documents}
                    fetchStats={fetchStats}
                    setActiveTab={setActiveTab}
                    widgets={widgets}
                />
            )}

            {/* --- FLIK: SYSTEM (ENBART SETTINGS NU) --- */}
            {activeTab === 'system' && (
                <div className="space-y-8">
                    <LicenseStatusCard />
                    <SettingsTab />
                </div>
            )}

            {/* --- FLIK: KOMMUNIKATION --- */}
            {activeTab === 'communication' && (
                <div className="h-[700px]">
                    <MessageCenter />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;