import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { courseService } from '../../services/courseService';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

const CreateCourseScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !code) {
            Alert.alert('Fel', 'Vänligen fyll i kursnamn och kurskod.');
            return;
        }

        setIsLoading(true);
        try {
            await courseService.createCourse({
                name,
                code,
                description,
                isOpen,
                startDate: new Date().toISOString(), // Default to now
            });
            Alert.alert('Succé', 'Kursen har skapats!');
            navigation.goBack();
        } catch (error) {
            console.error('Create course failed', error);
            Alert.alert('Fel', 'Kunde inte skapa kursen.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Kursnamn</Text>
                <TextInput
                    style={styles.input}
                    placeholder="T.ex. Matematik 1b"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Kurskod</Text>
                <TextInput
                    style={styles.input}
                    placeholder="T.ex. MATMAT01b"
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="characters"
                />

                <Text style={styles.label}>Beskrivning</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Kort beskrivning av kursen..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>Öppen för anmälan</Text>
                    <Switch
                        value={isOpen}
                        onValueChange={setIsOpen}
                        trackColor={{ false: '#767577', true: '#818cf8' }}
                        thumbColor={isOpen ? '#4F46E5' : '#f4f3f4'}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleCreate}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Skapar...' : 'Skapa Kurs'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CreateCourseScreen;
