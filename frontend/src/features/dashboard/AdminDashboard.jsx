import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShieldCheck, Loader2, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

// --- KOMPONENTER ---
import AdminOverview from './AdminOverview';
import SystemAdmin from './SystemAdmin';
import MessageCenter from '../messages/MessageCenter';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [u, c, d] = await Promise.all([
                api.users.getAll(),
                api.courses.getAll(),
                api.documents.getAll()
            ]);
            setUsers(u);
            setCourses(c);
            setDocuments(d);
        } catch (error) {
            console.error("Kunde inte hämta dashboard-data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    // Helpers
    const teachers = users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN');

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.live_overview')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.realtime_data')}</p>
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
                    <MessageSquare size={20} /> Kommunikation
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
                />
            )}

            {/* --- FLIK: SYSTEMADMIN --- */}
            {activeTab === 'system' && (
                <SystemAdmin
                    users={users}
                    courses={courses}
                    teachers={teachers}
                    fetchStats={fetchStats}
                />
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