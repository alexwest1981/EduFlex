import React, { useState } from 'react';
import { Users, BookOpen, Settings } from 'lucide-react';
import { AdminUserTable, AdminCourseRegistry } from './components/admin/AdminTables';
import SettingsTab from '../admin/SettingsTab';
import { CreateUserModal, CreateCourseModal, EditCourseModal } from './components/admin/AdminModals';
import { useNavigate } from 'react-router-dom';

const SystemAdmin = ({ users, courses, teachers, fetchStats }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showEditCourseModal, setShowEditCourseModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);

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
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 font-bold text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#282a2c] dark:hover:text-gray-300'}`}>
                    <Settings size={16} /> Inställningar
                </button>
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
                />
            )}

            {activeTab === 'settings' && <SettingsTab />}

            {/* MODALS */}
            <CreateUserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onUserCreated={fetchStats} />
            <CreateCourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} onCourseCreated={fetchStats} teachers={teachers} />
            <EditCourseModal isOpen={showEditCourseModal} onClose={() => setShowEditCourseModal(false)} onCourseUpdated={fetchStats} teachers={teachers} courseToEdit={courseToEdit} />
        </div>
    );
};

export default SystemAdmin;
