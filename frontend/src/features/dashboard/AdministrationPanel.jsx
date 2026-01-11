import React, { useState } from 'react';
import { Users, BookOpen, DollarSign, FileText, Settings, Tag } from 'lucide-react';
import { AdminUserTable, AdminCourseRegistry } from './components/admin/AdminTables';
import { CreateUserModal, CreateCourseModal, EditCourseModal } from './components/admin/AdminModals';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useModules } from '../../context/ModuleContext';
import SubscriptionPlans from '../admin/SubscriptionPlans';
import InvoiceManagement from '../admin/InvoiceManagement';
import PaymentGatewaySettings from '../admin/PaymentGatewaySettings';
import PromoCodeManagement from '../admin/PromoCodeManagement';

const AdministrationPanel = ({ users, courses, teachers, fetchStats }) => {
    const navigate = useNavigate();
    const { isModuleActive } = useModules();
    const [activeTab, setActiveTabState] = useState(() => localStorage.getItem('admin_panel_tab') || 'users');

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        localStorage.setItem('admin_panel_tab', tab);
    };

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showEditCourseModal, setShowEditCourseModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Är du säker på att du vill ta bort denna kurs? Detta går inte att ångra.")) {
            try {
                await api.courses.delete(courseId);
                fetchStats();
            } catch (error) {
                console.error("Failed to delete course", error);
                alert("Kunde inte ta bort kursen. Kontrollera att den inte har aktiva studenter.");
            }
        }
    };

    return (
        <div className="animate-in fade-in space-y-6">
            {/* SUB-TABS */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-[#3c4043] pb-1">
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}>
                    <Users size={16} /> Användare
                </button>
                <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'courses' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}>
                    <BookOpen size={16} /> Kurser
                </button>
                {isModuleActive('REVENUE') && (
                    <button onClick={() => setActiveTab('revenue')} className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}>
                        <DollarSign size={16} /> Revenue
                    </button>
                )}
            </div>

            {/* CONTENT */}
            {activeTab === 'users' && (
                <AdminUserTable
                    users={users}
                    onNewUser={() => setShowUserModal(true)}
                />
            )}

            {activeTab === 'courses' && (
                <AdminCourseRegistry
                    courses={courses}
                    onNewCourse={() => setShowCourseModal(true)}
                    onEdit={(course) => { setCourseToEdit(course); setShowEditCourseModal(true); }}
                    onManage={(id) => navigate(`/course/${id}`)}
                    onDelete={handleDeleteCourse}
                />
            )}

            {activeTab.startsWith('revenue') && (
                <div className="space-y-6">
                    {/* Revenue Sub-Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-[#3c4043] pb-1">
                        <button
                            onClick={() => setActiveTab('revenue-plans')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-plans' || activeTab === 'revenue' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <DollarSign size={16} /> Subscription Plans
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue-invoices')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-invoices' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <FileText size={16} /> Invoices
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue-payments')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-payments' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <Settings size={16} /> Payment Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue-promocodes')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-promocodes' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <Tag size={16} /> Promo Codes
                        </button>
                    </div>

                    {(activeTab === 'revenue-plans' || activeTab === 'revenue') && <SubscriptionPlans />}
                    {activeTab === 'revenue-invoices' && <InvoiceManagement />}
                    {activeTab === 'revenue-payments' && <PaymentGatewaySettings />}
                    {activeTab === 'revenue-promocodes' && <PromoCodeManagement />}
                </div>
            )}

            {/* MODALS */}
            <CreateUserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onUserCreated={fetchStats} />
            <CreateCourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} onCourseCreated={fetchStats} teachers={teachers} />
            <EditCourseModal isOpen={showEditCourseModal} onClose={() => setShowEditCourseModal(false)} onCourseUpdated={fetchStats} teachers={teachers} courseToEdit={courseToEdit} />
        </div>
    );
};

export default AdministrationPanel;
