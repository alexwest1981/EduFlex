import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagesStackParamList } from '../../navigation/types';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

import { useThemedStyles } from '../../hooks';

const MessagesScreen: React.FC = () => {
    const { colors, styles: themedStyles } = useThemedStyles();
    const navigation = useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
    const [isLoading, setIsLoading] = useState(true);
    const [sections, setSections] = useState<{ title: string; data: any[] }[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const data = await messageService.getContacts();

            // Transform Map<String, List> to SectionList format
            // data: { friends: [], classmates: [], administration: [], others: [] }
            const newSections = [];

            if (data.administration?.length > 0) newSections.push({ title: 'Administration & Lärare', data: data.administration });
            if (data.friends?.length > 0) newSections.push({ title: 'Vänner', data: data.friends });
            if (data.classmates?.length > 0) newSections.push({ title: 'Klasskamrater', data: data.classmates });
            if (data.others?.length > 0) newSections.push({ title: 'Övriga', data: data.others });

            setSections(newSections);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,  // Theme: colors.background
        },
        header: {
            padding: 20,
            backgroundColor: colors.card,  // Theme: colors.card
            borderBottomWidth: 1,
            borderBottomColor: colors.border
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text
        },
        sectionHeader: {
            backgroundColor: colors.border,
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 14,
            fontWeight: '700',
            color: colors.text,
            textTransform: 'uppercase'
        },
        conversationItem: {
            flexDirection: 'row',
            padding: 16,
            backgroundColor: colors.card,  // Theme: colors.card
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            alignItems: 'center'
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
        },
        avatarText: {
            fontSize: 16,
            color: colors.primary,  // Theme: colors.primary
            fontWeight: '600'
        },
        content: {
            flex: 1
        },
        topRow: {
            flexDirection: 'column',
        },
        name: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text
        },
        role: {
            fontSize: 12,
            color: colors.textSecondary
        },
        emptyState: {
            padding: 40,
            alignItems: 'center'
        },
        emptyText: {
            color: colors.textSecondary
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Meddelanden</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id.toString()}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.conversationItem}
                            onPress={() => navigation.navigate('Conversation', { userId: item.id, userName: item.fullName })}
                        >
                            <View style={styles.avatar}>
                                {item.profilePictureUrl ? (
                                    // TODO: Implement Image component with fallback
                                    <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
                                ) : (
                                    <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
                                )}

                            </View>
                            <View style={styles.content}>
                                <View style={styles.topRow}>
                                    <Text style={styles.name}>{item.fullName}</Text>
                                    <Text style={styles.role}>{item.role}</Text>
                                </View>
                                {/* Status or last message could go here if available */}
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Inga kontakter hittades</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default MessagesScreen;
