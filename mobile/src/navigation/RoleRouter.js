import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import StudentTabs from './StudentTabs';
import TeacherTabs from './TeacherTabs';
import AdminTabs from './AdminTabs';
import { SyvTabs, HealthTeamTabs, GuardianTabs, MentorTabs } from './SpecializedTabs';
import api from '../api/apiClient';

const RoleRouter = () => {
    const { userInfo, userToken, setUserInfo } = useContext(AuthContext);

    // Om userInfo saknas men vi har token, försök hämta det
    useEffect(() => {
        console.log('[RoleRouter] Checking userInfo/userToken:', { hasInfo: !!userInfo, hasToken: !!userToken });
        if (!userInfo && userToken) {
            console.log('[RoleRouter] Fetching /user/me...');
            api.get('/user/me', {
                headers: { Authorization: `Bearer ${userToken}` }
            }).then(resp => {
                console.log('[RoleRouter] Fetch success:', resp.data?.role);
                if (resp.data && setUserInfo) {
                    setUserInfo(resp.data);
                }
            }).catch(e => {
                console.error('[RoleRouter] Fetch failed:', e.message);
            });
        }
    }, [userInfo, userToken]);

    if (!userInfo || !userInfo.role) {
        // Visa spinner tills userInfo har laddats
        return (
            <View style={{ flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00F5FF" />
            </View>
        );
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
