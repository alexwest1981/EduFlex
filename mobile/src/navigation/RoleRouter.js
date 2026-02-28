import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StudentTabs from './StudentTabs';
import TeacherTabs from './TeacherTabs';
import AdminTabs from './AdminTabs';
import { SyvTabs, HealthTeamTabs, GuardianTabs, MentorTabs } from './SpecializedTabs';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const RoleRouter = () => {
    const { userInfo } = useContext(AuthContext);

    if (!userInfo || !userInfo.role) {
        // Fallback or loading state
        return <PlaceholderScreen />;
    }

    const roleName = userInfo.role.name || userInfo.role;

    switch (roleName) {
        case 'ADMIN':
        case 'ROLE_ADMIN':
            return <AdminTabs />;
        case 'TEACHER':
        case 'ROLE_TEACHER':
            return <TeacherTabs />;
        case 'STUDENT':
        case 'ROLE_STUDENT':
            return <StudentTabs />;
        case 'SYV':
        case 'ROLE_SYV':
            return <SyvTabs />;
        case 'MENTOR':
        case 'ROLE_MENTOR':
            return <MentorTabs />;
        case 'GUARDIAN':
        case 'ROLE_GUARDIAN':
            return <GuardianTabs />;
        case 'HEALTH_TEAM':
        case 'ROLE_HEALTH':
            return <HealthTeamTabs />;
        default:
            return <StudentTabs />; // Fallback 
    }
};

export default RoleRouter;
