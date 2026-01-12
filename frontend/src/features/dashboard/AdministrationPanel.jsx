import React, { useState } from 'react';
import { Users, BookOpen, DollarSign, FileText, Settings, Tag, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminUserTable, AdminCourseRegistry } from './components/admin/AdminTables';
import RolesAdmin from './components/admin/RolesAdmin';
import { CreateUserModal, CreateCourseModal, EditCourseModal, EditUserModal } from './components/admin/AdminModals';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useModules } from '../../context/ModuleContext';
import SubscriptionPlans from '../admin/SubscriptionPlans';
import InvoiceManagement from '../admin/InvoiceManagement';
import PaymentGatewaySettings from '../admin/PaymentGatewaySettings';
import PromoCodeManagement from '../admin/PromoCodeManagement';

const AdministrationPanel = ({ users, courses, teachers, fetchStats }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isModuleActive } = useModules();
    const [activeTab, setActiveTabState] = useState(() => localStorage.getItem('admin_panel_tab') || 'users');

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        localStorage.setItem('admin_panel_tab', tab);
    };

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
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

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Är du säker på att du vill ta bort denna användare? Detta går inte att ångra.")) {
            try {
                await api.users.delete(userId);
                fetchStats();
            } catch (error) {
                console.error("Failed to delete user", error);
                alert("Kunde inte ta bort användaren.");
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
                <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'roles' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}>
                    <Shield size={16} /> Roller
                </button>
                {isModuleActive('REVENUE') && (
                    <button onClick={() => setActiveTab('revenue')} className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}>
                        <DollarSign size={16} /> {t('admin_tabs.revenue')}
                    </button>
                )}
            </div>

            {/* CONTENT */}
            {activeTab === 'users' && (
                <AdminUserTable
                    users={users}
                    onNewUser={() => setShowUserModal(true)}
                    onEdit={(user) => { setUserToEdit(user); setShowEditUserModal(true); }}
                    onDelete={handleDeleteUser}
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

            {activeTab === 'roles' && <RolesAdmin />}

            {activeTab.startsWith('revenue') && (
                <div className="space-y-6">
                    {/* Revenue Sub-Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-[#3c4043] pb-1">
                        <button
                            onClick={() => setActiveTab('revenue-plans')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-plans' || activeTab === 'revenue' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <DollarSign size={16} /> {t('admin_tabs.subscription_plans')}
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue-invoices')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-invoices' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <FileText size={16} /> {t('admin_tabs.invoices')}
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue-payments')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-payments' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <Settings size={16} /> {t('admin_tabs.payment_settings')}
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue-promocodes')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'revenue-promocodes' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}
                        >
                            <Tag size={16} /> {t('admin_tabs.promo_codes')}
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
            <EditUserModal isOpen={showEditUserModal} onClose={() => setShowEditUserModal(false)} onUserUpdated={fetchStats} userToEdit={userToEdit} />
            <CreateCourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} onCourseCreated={fetchStats} teachers={teachers} />
            <EditCourseModal isOpen={showEditCourseModal} onClose={() => setShowEditCourseModal(false)} onCourseUpdated={fetchStats} teachers={teachers} courseToEdit={courseToEdit} />
        </div>
    );
};

export default AdministrationPanel;
