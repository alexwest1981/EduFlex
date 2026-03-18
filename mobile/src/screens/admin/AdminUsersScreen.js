import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { Search, UserPlus, Settings2, Trash2, X, Check } from 'lucide-react-native';
import { useGetAllUsersQuery, useDeleteUserMutation } from '../../store/slices/apiSlice';

const AdminUsersScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: users, isLoading, refetch } = useGetAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    const rawUsers = users?.content || (Array.isArray(users) ? users : []);
    const filteredUsers = rawUsers.filter(u =>
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.role?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteUser = (userId) => {
        Alert.alert(
            "Ta bort användare",
            "Är du säker på att du vill ta bort denna användare permanent?",
            [
                { text: "Avbryt", style: "cancel" },
                {
                    text: "Ta bort",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteUser(userId).unwrap();
                            Alert.alert("Borttagen", "Användaren har tagits bort.");
                        } catch (err) {
                            Alert.alert("Fel", "Kunde inte ta bort användaren.");
                        }
                    }
                }
            ]
        );
    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                    {item.isActive === false && <Text style={styles.inactiveBadge}>INAKTIV</Text>}
                </View>
                <Text style={styles.userRole}>{item.role?.name || 'USER'}</Text>
                <Text style={styles.userEmail}>{item.email || item.username}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => { setSelectedUser(item); setEditModalVisible(true); }}
                >
                    <Settings2 color="#00F5FF" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}
                    onPress={() => handleDeleteUser(item.id)}
                >
                    <Trash2 color="#ff4444" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00F5FF" />
            </View>
        );
    }

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
                    placeholder="Sök namn, roll eller e-post..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.statsBar}>
                <Text style={styles.statsText}>{filteredUsers.length} användare hittades</Text>
            </View>

            {filteredUsers.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#888' }}>Inga användare hittades.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderUser}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    onRefresh={refetch}
                    refreshing={isLoading}
                />
            )}

            {/* Edit User Modal */}
            <Modal visible={isEditModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Hantera Användare</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X color="#fff" size={24} />
                            </TouchableOpacity>
                        </View>

                        {selectedUser && (
                            <View style={styles.modalBody}>
                                <Text style={styles.modalLabel}>Namn</Text>
                                <Text style={styles.modalValue}>{selectedUser.firstName} {selectedUser.lastName}</Text>

                                <Text style={styles.modalLabel}>Roll</Text>
                                <View style={styles.roleChips}>
                                    {['ADMIN', 'TEACHER', 'STUDENT', 'KURATOR'].map(role => (
                                        <TouchableOpacity
                                            key={role}
                                            style={[styles.roleChip, selectedUser.role?.name === role && styles.activeRoleChip]}
                                        >
                                            <Text style={[styles.roleChipText, selectedUser.role?.name === role && styles.activeRoleChipText]}>{role}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.saveBtn} onPress={() => setEditModalVisible(false)}>
                                    <Check color="#000" size={20} />
                                    <Text style={styles.saveBtnText}>Spara ändringar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    addBtn: { flexDirection: 'row', backgroundColor: '#00F5FF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', gap: 8 },
    addBtnText: { color: '#000', fontWeight: 'bold' },
    searchBox: { flexDirection: 'row', backgroundColor: '#1a1b1d', borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginBottom: 12 },
    searchInput: { flex: 1, color: '#fff', paddingVertical: 16, fontSize: 16 },
    statsBar: { marginBottom: 20, paddingHorizontal: 4 },
    statsText: { color: '#888', fontSize: 13 },
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
    userInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    userName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    inactiveBadge: { backgroundColor: '#ff4444', color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    userRole: { color: '#00F5FF', fontSize: 13, marginBottom: 4 },
    userEmail: { color: '#888', fontSize: 12 },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { padding: 10, backgroundColor: 'rgba(0, 245, 255, 0.1)', borderRadius: 12 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1a1b1d', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 60, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    modalBody: { gap: 20 },
    modalLabel: { color: '#888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    modalValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    roleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    roleChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
    activeRoleChip: { borderColor: '#00F5FF', backgroundColor: 'rgba(0, 245, 255, 0.1)' },
    roleChipText: { color: '#888', fontSize: 13 },
    activeRoleChipText: { color: '#00F5FF', fontWeight: 'bold' },
    saveBtn: { flexDirection: 'row', backgroundColor: '#00F5FF', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 },
    saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});

export default AdminUsersScreen;
