import React from 'react';
import AdminStats from './components/admin/AdminStats';
import { AdminRecentActivity } from './components/admin/AdminTables';
import RecentMessagesWidget from './components/RecentMessagesWidget';
import { CreateUserModal } from './components/admin/AdminModals';

const AdminOverview = ({ users, courses, documents, fetchStats, setActiveTab }) => {
    const [showUserModal, setShowUserModal] = React.useState(false);

    // Helpers
    const latestUsers = [...users].reverse().slice(0, 5);
    const latestDocs = [...documents].reverse().slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* 1. Statistik */}
            <AdminStats users={users} courses={courses} documents={documents} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* 2. Aktivitet (2/3 bredd) */}
                <div className="xl:col-span-2">
                    <AdminRecentActivity
                        latestUsers={latestUsers}
                        latestDocs={latestDocs}
                        onNewUserClick={() => setShowUserModal(true)}
                    />
                </div>

                {/* 3. Meddelanden Preview (1/3 bredd) */}
                <div className="xl:col-span-1">
                    <RecentMessagesWidget onViewAll={() => setActiveTab('communication')} />
                </div>
            </div>



            <CreateUserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onUserCreated={fetchStats} />
        </div>
    );
};

export default AdminOverview;
