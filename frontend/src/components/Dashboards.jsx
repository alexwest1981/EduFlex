import React from 'react';
import { useTranslation } from 'react-i18next';
import AdminDashboard from '../modules/dashboard/AdminDashboard';
import TeacherDashboard from '../modules/dashboard/TeacherDashboard';
import StudentDashboard from '../modules/dashboard/StudentDashboard';

const Dashboard = ({
                       currentUser,
                       myCourses,
                       allCourses,
                       documents,
                       upcomingAssignments,
                       ungradedSubmissions,
                       users,
                       handleToggleCourseStatus
                   }) => {
    // Enkel routing baserat på roll
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

    // Default: Student
    return (
        <StudentDashboard
            currentUser={currentUser}
            myCourses={myCourses}
            upcomingAssignments={upcomingAssignments}
        />
    );
};

export default Dashboard;