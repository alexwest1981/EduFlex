import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

// Importera vyerna.
// OBS: Se till att filerna TeacherDashboard.jsx och StudentDashboard.jsx
// faktiskt finns i samma mapp, annars får du "Module not found".
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import MentorDashboard from './MentorDashboard';

// Import Mobile Gateway
import MobileThemeResolver from '../../components/MobileThemes/MobileThemeResolver';

const Dashboard = ({ currentUser, myCourses }) => {
    // Basic mobile detection logic
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Säkerhetskoll: Om ingen användare är laddad än
    if (!currentUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    // 2. Välj vilken Dashboard som ska visas baserat på roll
    // Vi kollar först om rollen har en specifik dashboard-konfiguration (defaultDashboard)
    // Annars faller vi tillbaka på rollnamnet.
    const dashboardType = currentUser.role?.defaultDashboard || currentUser.role?.name || currentUser.role;

    switch (dashboardType) {
        case 'ADMIN':
            // If on mobile, serve the specialized mobile experience via the Theme Resolver
            if (isMobile) {
                return (
                    <MobileThemeResolver
                        currentUser={currentUser}
                        myCourses={myCourses || []} // Admin doesn't typically have myCourses, but we pass valid empty array
                    />
                );
            }

            // VIKTIGT: Vi skickar INTE med props här längre.
            // AdminDashboard hämtar nu sin egen data (Users, Courses) från API:et.
            // Detta förhindrar att App.jsx skriver över datan med tomma arrayer.
            return <AdminDashboard />;

        case 'PRINCIPAL':
            return <PrincipalDashboard />;

        case 'MENTOR':
            return <MentorDashboard />;

        case 'TEACHER':
            // Lärare behöver sina kurser som props
            return (
                <TeacherDashboard
                    currentUser={currentUser}
                    myCourses={myCourses || []}
                />
            );

        case 'STUDENT':
            // If on mobile, serve the specialized mobile experience via the Theme Resolver
            if (isMobile) {
                return (
                    <MobileThemeResolver
                        currentUser={currentUser}
                        myCourses={myCourses || []}
                    />
                );
            }

            // Studenter behöver sina kurser som props
            return (
                <StudentDashboard
                    currentUser={currentUser}
                    myCourses={myCourses || []}
                />
            );

        default:
            return (
                <div className="flex h-screen items-center justify-center flex-col p-4 text-center">
                    <AlertCircle className="text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Behörighet saknas</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Din användarroll <strong>({dashboardType})</strong> har ingen tilldelad instrumentpanel.
                        <br />Kontakta administratören.
                    </p>
                </div>
            );
    }
};

export default Dashboard;