import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Moon, Sun, LogOut, Bell } from 'lucide-react-native';

const SettingsScreen = () => {
    const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);
    const { logout } = useContext(AuthContext);

    const [pushEnabled, setPushEnabled] = React.useState(true);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Inställningar</Text>

            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.row}>
                    <View style={styles.iconRow}>
                        {isDarkMode ? <Moon color={theme.colors.primary} size={24} /> : <Sun color="#FBBF24" size={24} />}
                        <Text style={[styles.rowText, { color: theme.colors.text }]}>Mörkt Tema</Text>
                    </View>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: '#00F5FF' }}
                        thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                    />
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.row}>
                    <View style={styles.iconRow}>
                        <Bell color={theme.colors.primary} size={24} />
                        <Text style={[styles.rowText, { color: theme.colors.text }]}>Push-Notiser</Text>
                    </View>
                    <Switch
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        trackColor={{ false: '#767577', true: '#00F5FF' }}
                        thumbColor={pushEnabled ? '#fff' : '#f4f3f4'}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.logoutBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                onPress={logout}
            >
                <LogOut color="#ff4444" size={20} />
                <Text style={styles.logoutText}>Logga ut</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30 },
    section: { borderRadius: 16, borderWidth: 1, marginBottom: 24 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    iconRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    rowText: { fontSize: 18, fontWeight: '500' },
    divider: { height: 1 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1 },
    logoutText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' }
});

export default SettingsScreen;
