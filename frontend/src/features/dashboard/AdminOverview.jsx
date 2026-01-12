import React from 'react';
import AdminStats from './components/admin/AdminStats';
import { RecentUsersWidget, RecentUploadsWidget } from './components/admin/AdminTables';
import RecentMessagesWidget from './components/RecentMessagesWidget';
import { CreateUserModal } from './components/admin/AdminModals';

import { useAppContext } from '../../context/AppContext';

const AdminOverview = ({ users, courses, documents, fetchStats, setActiveTab }) => {
    const { currentUser } = useAppContext();
    const [showUserModal, setShowUserModal] = React.useState(false);

    // Helpers
    const latestUsers = [...users].reverse().slice(0, 5);
    const latestDocs = [...documents].reverse().slice(0, 5);

    // Parse Settings
    let settings = {
        showStats: true,
        showRecentUsers: true,
        showRecentDocs: true,
        showMessages: true
    };
    try {
        if (currentUser?.settings) {
            settings = { ...settings, ...JSON.parse(currentUser.settings) };
        }
    } catch (e) {
        console.error("Failed to parse settings", e);
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* 1. Statistik */}
            {settings.showStats && <AdminStats users={users} courses={courses} documents={documents} />}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* 2. Aktivitet (Delat i två widgets) */}
                <div className={settings.showMessages ? "xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8" : "xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
                    {settings.showRecentUsers && (
                        <div className={settings.showMessages ? "" : "lg:col-span-1"}>
                            <RecentUsersWidget
                                latestUsers={latestUsers}
                                onNewUserClick={() => setShowUserModal(true)}
                            />
                        </div>
                    )}

                    {settings.showRecentDocs && (
                        <div className={settings.showMessages ? "" : "lg:col-span-1"}>
                            <RecentUploadsWidget latestDocs={latestDocs} />
                        </div>
                    )}
                </div>

                {/* 3. Meddelanden Preview (1/3 bredd) */}
                {settings.showMessages && (
                    <div className={(settings.showRecentUsers || settings.showRecentDocs) ? "xl:col-span-1" : "xl:col-span-3"}>
                        <RecentMessagesWidget onViewAll={() => setActiveTab('communication')} />
                    </div>
                )}
            </div>

            <CreateUserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onUserCreated={fetchStats} />
        </div>
    );
};

export default AdminOverview;
