import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext'; // Uppdaterad sökväg

// Importera vyerna från SAMMA mapp (.)
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = ({ currentUser, myCourses, upcomingAssignments, users, allCourses, documents, ungradedSubmissions, handleToggleCourseStatus }) => {

    // Fallback om currentUser inte laddats än
    if (!currentUser) return null;

    if (currentUser.role === 'ADMIN') {
        return (
            <AdminDashboard
                users={users}
                courses={allCourses}
                documents={documents}
                handleToggleCourseStatus={handleToggleCourseStatus}
            />
        );
    }

    if (currentUser.role === 'TEACHER') {
        return (
            <TeacherDashboard
                currentUser={currentUser}
                myCourses={myCourses}
                ungradedSubmissions={ungradedSubmissions}
            />
        );
    }

    return (
        <StudentDashboard
            currentUser={currentUser}
            myCourses={myCourses}
            upcomingAssignments={upcomingAssignments}
        />
    );
};

export default Dashboard;