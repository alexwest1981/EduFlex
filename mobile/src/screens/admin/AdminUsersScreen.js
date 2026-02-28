import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Search, UserPlus, Settings2 } from 'lucide-react-native';

const AdminUsersScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const users = [
        { id: 1, name: 'Alice Andersson', role: 'Student', email: 'alice@eduflex.se' },
        { id: 2, name: 'Bob Bergström', role: 'Teacher', email: 'bob@eduflex.se' },
        { id: 3, name: 'Charlie Carlsson', role: 'Admin', email: 'charlie@eduflex.se' }
    ];

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>{item.role}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
                <Settings2 color="#00F5FF" size={20} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Användare</Text>
                <TouchableOpacity style={styles.addBtn}>
                    <UserPlus color="#000" size={20} />
                    <Text style={styles.addBtnText}>Ny</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
                <Search color="#888" size={20} style={{ marginHorizontal: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Sök namn eller roll..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={item => item.id.toString()}
                renderItem={renderUser}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    addBtn: { flexDirection: 'row', backgroundColor: '#00F5FF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', gap: 8 },
    addBtnText: { color: '#000', fontWeight: 'bold' },
    searchBox: { flexDirection: 'row', backgroundColor: '#1a1b1d', borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginBottom: 20 },
    searchInput: { flex: 1, color: '#fff', paddingVertical: 16, fontSize: 16 },
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
    userInfo: { flex: 1 },
    userName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    userRole: { color: '#00F5FF', fontSize: 13, marginBottom: 4 },
    userEmail: { color: '#888', fontSize: 12 },
    editBtn: { padding: 10, backgroundColor: 'rgba(0, 245, 255, 0.1)', borderRadius: 12 }
});

export default AdminUsersScreen;
