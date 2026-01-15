import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, Settings, Database, Edit3 } from 'lucide-react';
import { api } from '../../services/api';
import AdministrationPanel from './AdministrationPanel';
import SkolverketImport from '../admin/SkolverketImport';
import SkolverketDataEntry from '../admin/SkolverketDataEntry';
import SystemSettings from '../system/SystemSettings';

const AdminAdministrationPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('administration');

    const tabs = [
        { id: 'administration', label: t('admin_tabs.administration'), icon: Users },
        { id: 'system', label: t('admin_tabs.system_settings'), icon: Settings },
        { id: 'skolverket', label: t('admin_tabs.skolverket_import'), icon: Database },
        { id: 'skolverket-edit', label: t('admin_tabs.skolverket_data'), icon: Edit3 }
    ];
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [uData, c] = await Promise.all([
                api.users.getAll(0, 1000),
                api.courses.getAll()
            ]);
            setUsers(uData.content || uData || []);
            setCourses(c);
        } catch (error) {
            console.error("Kunde inte hämta administrationsdata", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    // Helpers - Support both old string-based roles and new role objects
    const teachers = users.filter(u => {
        const roleName = typeof u.role === 'string' ? u.role : u.role?.name;
        return roleName === 'TEACHER' || roleName === 'ADMIN';
    });

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administration</h1>
                <p className="text-gray-500 dark:text-gray-400">Hantera användare, rättigheter och kurser.</p>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === tab.id
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

            {/* Tab Content */}
            <div className="flex-1">
                {activeTab === 'administration' && (
                    <AdministrationPanel
                        users={users}
                        courses={courses}
                        teachers={teachers}
                        fetchStats={fetchStats}
                    />
                )}
                {activeTab === 'system' && <SystemSettings asTab={true} />}
                {activeTab === 'skolverket' && <SkolverketImport />}
                {activeTab === 'skolverket-edit' && <SkolverketDataEntry />}
            </div>
        </div>
    );
};

export default AdminAdministrationPage;
