import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Loader2, MessageSquare, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

// --- COMPONENTS ---
import AdminOverview from './AdminOverview';
import MessageCenter from '../messages/MessageCenter';
import CompanyLicenses from './CompanyLicenses';

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
        calendar: true,
        recentUsers: true,
        recentDocs: true,
        messages: true,
        onlineFriends: true,
        tickets: true
    });

    const widgetLabels = {
        stats: t('dashboard.widgets.stats'),
        calendar: t('dashboard.widgets.calendar'),
        recentUsers: t('dashboard.widgets.recent_users'),
        recentDocs: t('dashboard.widgets.recent_docs'),
        messages: t('dashboard.widgets.messages'),
        onlineFriends: t('dashboard.widgets.online_friends'),
        tickets: t('dashboard.widgets.tickets')
    };

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [uData, c, d, unread] = await Promise.all([
                api.users.getAll(0, 1000).catch(err => { console.error("Users fetch error:", err); return []; }),
                api.courses.getAll().catch(err => { console.error("Courses fetch error:", err); return []; }),
                api.documents.getAll().catch(err => { console.error("Documents fetch error:", err); return []; }),
                api.messages.getUnreadCount().catch(err => { console.error("Unread fetch error:", err); return 0; })
            ]);
            // Hantera om users är en Page (pagination) eller Array
            const usersArray = Array.isArray(uData) ? uData : (uData?.content || []);
            const coursesArray = Array.isArray(c) ? c : (c?.content || []);
            const docsArray = Array.isArray(d) ? d : (d?.content || []);


            setUsers(usersArray);
            setCourses(coursesArray);
            setDocuments(docsArray);
            setUnreadCount(typeof unread === 'number' ? unread : 0);
        } catch (error) {
            console.error("Kunde inte hämta dashboard-data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700 pb-20 space-y-8 overflow-x-hidden">
            {/* --- PREMIUM HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pt-2">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-[#1c1c1e] p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <LayoutDashboard className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('dashboard.live_overview')}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            {new Date().toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })} •
                            <span className="text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === 'overview' && (
                        <DashboardCustomizer
                            widgets={widgets}
                            toggleWidget={toggleWidget}
                            widgetLabels={widgetLabels}
                        />
                    )}
                </div>
            </header>

            {/* --- SYSTEM INTELLIGENCE BAR --- */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-indigo-600/5 dark:bg-indigo-400/5 border border-indigo-100 dark:border-indigo-900/30 p-3 sm:p-4 rounded-2xl overflow-hidden shrink-0">
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest sm:tracking-[0.2em] whitespace-nowrap">Intelligence</p>
                <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-800 mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">Användare:</span>
                        <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">{users.length}</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full"></span>
                        Sync OK
                    </div>
                </div>
            </div>

            {/* --- TAB NAVIGATION (MISSION CONTROL STYLE) --- */}
            <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                        ${activeTab === 'overview'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <LayoutDashboard size={18} />
                    {t('dashboard.tabs.overview')}
                </button>
                <button
                    onClick={() => setActiveTab('communication')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative
                        ${activeTab === 'communication'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <MessageSquare size={18} />
                    {t('dashboard.tabs.communication')}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black border-2 border-white dark:border-[#0c0c0e]">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('licenses')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                        ${activeTab === 'licenses'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <Shield size={18} />
                    Företagslicenser
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <main className="animate-in slide-in-from-bottom-4 duration-700">
                {activeTab === 'overview' && (
                    <AdminOverview
                        users={users}
                        courses={courses}
                        documents={documents}
                        fetchStats={fetchStats}
                        setActiveTab={setActiveTab}
                        widgets={widgets}
                        unreadCount={unreadCount}
                    />
                )}

                {activeTab === 'communication' && (
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm h-[750px] overflow-hidden">
                        <MessageCenter />
                    </div>
                )}

                {activeTab === 'licenses' && (
                    <div className="p-2 sm:p-0">
                        <CompanyLicenses />
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
