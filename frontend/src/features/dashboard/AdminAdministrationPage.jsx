import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import AdministrationPanel from './AdministrationPanel';

const AdminAdministrationPage = () => {
    const { t } = useTranslation();
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

    // Helpers
    const teachers = users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN');

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administration</h1>
                <p className="text-gray-500 dark:text-gray-400">Hantera användare, rättigheter och kurser.</p>
            </header>

            <AdministrationPanel
                users={users}
                courses={courses}
                teachers={teachers}
                fetchStats={fetchStats}
            />
        </div>
    );
};

export default AdminAdministrationPage;
