import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, Globe, Library, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetGlobalLibraryQuery } from '../../store/slices/apiSlice';

const GlobalLibraryScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: globalItems, isLoading } = useGetGlobalLibraryQuery();

    const filteredItems = globalItems ? globalItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : [];

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                {item.type === 'COURSE' ? <Globe color="#00F5FF" size={24} /> : <Library color="#00F5FF" size={24} />}
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardAuthor}>{item.type} • {item.owner?.username || 'EduFlex'}</Text>
            </View>
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('StripeCheckout', { itemName: item.name, price: "149 kr" })}
            >
                <Plus color="#00F5FF" size={20} />
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00F5FF" />
                <Text style={{ color: '#888', marginTop: 10 }}>Laddar biblioteket...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Globalt Bibliotek</Text>
            </View>

            <View style={styles.searchBox}>
                <Search color="#888" size={20} style={{ marginHorizontal: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Sök globala resurser..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {filteredItems.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#888' }}>Inga resurser hittades.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    searchBox: { flexDirection: 'row', backgroundColor: '#1a1b1d', borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginBottom: 20 },
    searchInput: { flex: 1, color: '#fff', paddingVertical: 16, fontSize: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
    iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 245, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardInfo: { flex: 1 },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardAuthor: { color: '#888', fontSize: 13 },
    addBtn: { padding: 10, backgroundColor: 'rgba(0, 245, 255, 0.1)', borderRadius: 12 }
});

export default GlobalLibraryScreen;
