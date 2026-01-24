import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, Settings, Database, Edit3, Server } from 'lucide-react';
import { api } from '../../services/api';
import AdministrationPanel from './AdministrationPanel';
import SkolverketManager from '../admin/SkolverketManager';
import SystemSettings from '../system/SystemSettings';
import TenantManagement from '../admin/TenantManagement';
import AdminNavbar from './components/admin/AdminNavbar';
import AdminHeader from './components/admin/AdminHeader';
import AdminTicketManager from '../support/AdminTicketManager';
import AdminIntegrations from './admin/AdminIntegrations';
import { useSearchParams } from 'react-router-dom';

const AdminAdministrationPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'administration';
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
            <AdminHeader />

            {/* Tab Navigation */}
            {/* Tab Navigation REPLACED with AdminNavbar */}
            <AdminNavbar />

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
                {activeTab === 'tenants' && <TenantManagement />}
                {activeTab === 'system' && <SystemSettings asTab={true} />}
                {activeTab === 'skolverket' && <SkolverketManager />}
                {activeTab === 'integrations' && <AdminIntegrations />}
                {activeTab === 'tickets' && <AdminTicketManager />}
            </div>
        </div>
    );
};

export default AdminAdministrationPage;
