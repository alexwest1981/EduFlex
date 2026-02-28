import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Search, Globe, Library, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const GlobalLibraryScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const libraryItems = [
        { id: 1, title: 'AI Grundkurs', category: 'Course', author: 'EduFlex' },
        { id: 2, title: 'Avancerad Matematik', category: 'Module', author: 'Anna Larsson' },
        { id: 3, title: 'Programmering 1 PDF', category: 'Resource', author: 'EduFlex' }
    ];

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                {item.category === 'Course' ? <Globe color="#00F5FF" size={24} /> : <Library color="#00F5FF" size={24} />}
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardAuthor}>Av: {item.author}</Text>
            </View>
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('StripeCheckout', { itemName: item.title, price: "149 kr" })}
            >
                <Plus color="#00F5FF" size={20} />
            </TouchableOpacity>
        </View>
    );

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

            <FlatList
                data={libraryItems}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
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
