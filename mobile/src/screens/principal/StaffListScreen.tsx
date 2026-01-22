import React from 'react';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';

// Mock data for Staff
const MOCK_STAFF = [
    { id: 1, name: 'Sven Svensson', role: 'TEACHER', email: 'sven@eduflex.se', activeCourses: 4 },
    { id: 2, name: 'Karin Karlsson', role: 'MENTOR', email: 'karin@eduflex.se', mentees: 12 },
    { id: 3, name: 'Anders Andersson', role: 'TEACHER', email: 'anders@eduflex.se', activeCourses: 2 },
];

const StaffListScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);

    const handleContact = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    };

    const renderItem = ({ item }: { item: typeof MOCK_STAFF[0] }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role}</Text>
                <Text style={styles.details}>
                    {item.role === 'TEACHER' ? `${item.activeCourses} Kurser` : `${item.mentees} Elever`}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact(item.email)}
            >
                <Text style={styles.contactIcon}>✉️</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={MOCK_STAFF}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4F46E5',  // Theme: '#4F46E5'
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
    },
    role: {
        fontSize: 12,
        color: '#4F46E5',  // Theme: '#4F46E5'
        fontWeight: '700',
        marginTop: 2,
    },
    details: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        marginTop: 2,
    },
    contactButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    contactIcon: {
        fontSize: 20,
    },
});

export default StaffListScreen;
