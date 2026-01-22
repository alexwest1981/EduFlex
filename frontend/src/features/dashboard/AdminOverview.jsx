import React from 'react';
import AdminStats from './components/admin/AdminStats';
import { RecentUsersWidget, RecentUploadsWidget } from './components/admin/AdminTables';
import RecentMessagesWidget from './components/RecentMessagesWidget';
import OnlineFriendsWidget from './widgets/OnlineFriendsWidget';
import AdminTicketsWidget from './widgets/AdminTicketsWidget';
import { CreateUserModal } from './components/admin/AdminModals';

import { useAppContext } from '../../context/AppContext';

const AdminOverview = ({ users, courses, documents, fetchStats, setActiveTab, widgets, unreadCount }) => {
    const { currentUser } = useAppContext();
    const [showUserModal, setShowUserModal] = React.useState(false);

    // Helpers - with null safety
    const latestUsers = users?.length > 0 ? [...users].reverse().slice(0, 5) : [];
    const latestDocs = documents?.length > 0 ? [...documents].reverse().slice(0, 5) : [];

    // Count active activity widgets
    const activeActivityCount = [widgets.recentUsers, widgets.recentDocs, widgets.onlineFriends, widgets.tickets].filter(Boolean).length;

    // Determine grid columns
    const gridColsClass = activeActivityCount === 1 ? "grid-cols-1" :
        activeActivityCount === 2 ? "grid-cols-1 lg:grid-cols-2" :
            "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* 1. Statistik (4 kort inkl. meddelanden) */}
            {widgets.stats && <AdminStats users={users} courses={courses} documents={documents} unreadCount={unreadCount} onViewMessages={() => setActiveTab('communication')} />}

            <div className={`grid ${gridColsClass} gap-8`}>
                {/* 2. Aktivitet */}
                {widgets.recentUsers && (
                    <RecentUsersWidget
                        latestUsers={latestUsers}
                        onNewUserClick={() => setShowUserModal(true)}
                    />
                )}

                {widgets.recentDocs && (
                    <RecentUploadsWidget latestDocs={latestDocs} />
                )}

                {widgets.tickets && (
                    <AdminTicketsWidget onManage={() => window.location.href = '/admin?tab=tickets'} />
                )}

                {widgets.onlineFriends && (
                    <OnlineFriendsWidget />
                )}

                {widgets.messages && (
                    <div className={widgets.onlineFriends ? "xl:col-span-2" : "xl:col-span-3"}>
                        <RecentMessagesWidget onViewAll={() => setActiveTab('communication')} />
                    </div>
                )}
            </div>

            <CreateUserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onUserCreated={fetchStats} />
        </div>
    );
};

export default AdminOverview;
