import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import StudentTabs from './StudentTabs';
import TeacherTabs from './TeacherTabs';
import AdminTabs from './AdminTabs';
import { SyvTabs, HealthTeamTabs, GuardianTabs, MentorTabs } from './SpecializedTabs';
import api from '../api/apiClient';

const RoleRouter = () => {
    const [timedOut, setTimedOut] = React.useState(false);
    const { userInfo, userToken, setUserInfo, logout } = useContext(AuthContext);

    // Timeout-timer för att undvika oändlig spinner
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!userInfo || !userInfo.role) {
                setTimedOut(true);
            }
        }, 15000); // 15 sekunder

        return () => clearTimeout(timer);
    }, [userInfo]);

    // Om userInfo saknas men vi har token, försök hämta det
    useEffect(() => {
        console.log('[RoleRouter] Checking userInfo/userToken:', { hasInfo: !!userInfo, hasToken: !!userToken });
        if (!userInfo && userToken) {
            console.log('[RoleRouter] Fetching /users/me...');
            api.get('/users/me', {
                headers: { Authorization: `Bearer ${userToken}` }
            }).then(resp => {
                console.log('[RoleRouter] Fetch success! Full data:', JSON.stringify(resp.data));
                if (resp.data && setUserInfo) {
                    setUserInfo(resp.data);
                }
            }).catch(e => {
                console.error('[RoleRouter] Fetch failed:', e.message, e.response?.status, e.response?.data);
                // Om anropet misslyckas direkt kan vi visa timeout direkt eller låta timern gå
            });
        }
    }, [userInfo, userToken]);

    if (!userInfo || !userInfo.role) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                {!timedOut ? (
                    <ActivityIndicator size="large" color="#00F5FF" />
                ) : (
                    <>
                        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
                            Kunde inte hämta användarprofilen.
                        </Text>
                        <Text style={{ color: '#888', marginBottom: 30, textAlign: 'center' }}>
                            Kontrollera din internetanslutning eller försök igen.
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: '#00F5FF', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 15 }}
                            onPress={() => {
                                setTimedOut(false);
                                // Trigger a re-fetch by setting userToken or just waiting for useEffect
                            }}
                        >
                            <Text style={{ color: '#000', fontWeight: 'bold' }}>Försök igen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 15, width: '100%', alignItems: 'center' }}
                            onPress={logout}
                        >
                            <Text style={{ color: '#ff4444' }}>Logga ut / Gå tillbaka</Text>
                        </TouchableOpacity>
                    </>
                )}
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
