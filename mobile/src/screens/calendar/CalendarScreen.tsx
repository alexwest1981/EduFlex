import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Modal,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { calendarService } from '../../services/calendarService';
import { CalendarEvent, EventType } from '../../types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';

import { useThemedStyles } from '../../hooks';

// Simple types for week view
interface DayData {
    date: Date;
    dayName: string;
    dayNumber: string;
    isToday: boolean;
    isSelected: boolean;
}

const CalendarScreen: React.FC = () => {
    const { colors, styles: themedStyles } = useThemedStyles();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await calendarService.getAllEvents();
            // Client-side filtering/sorting could be added here
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate days for the week view
    const getWeekDays = (): DayData[] => {
        const days: DayData[] = [];
        for (let i = 0; i < 7; i++) {
            const date = addDays(currentWeekStart, i);
            days.push({
                date,
                dayName: format(date, 'EEE', { locale: sv }),
                dayNumber: format(date, 'd'),
                isToday: isSameDay(date, new Date()),
                isSelected: isSameDay(date, selectedDate)
            });
        }
        return days;
    };

    const getEventsForSelectedDay = () => {
        return events.filter(e => isSameDay(new Date(e.startTime), selectedDate))
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    };

    const handlePrevWeek = () => {
        setCurrentWeekStart(prev => addDays(prev, -7));
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(prev => addDays(prev, 7));
    };

    // Helper for event type colors
    const getEventColor = (type: EventType) => {
        switch (type) {
            case 'LESSON': return colors.primary; // Indigo
            case 'EXAM': return '#DC2626'; // Red
            case 'DEADLINE': return '#CA8A04'; // Yellow/Orange
            case 'MEETING': return '#059669'; // Green
            case 'WORKSHOP': return '#7C3AED'; // Violet
            default: return colors.textSecondary; // Gray
        }
    };

    const renderEventItem = ({ item }: { item: CalendarEvent }) => (
        <View style={[styles.eventCard, { borderLeftColor: getEventColor(item.type) }]}>
            <View style={styles.eventTimeContainer}>
                <Text style={styles.eventTime}>
                    {format(new Date(item.startTime), 'HH:mm')}
                </Text>
                <Text style={styles.eventDuration}>
                    {format(new Date(item.endTime), 'HH:mm')}
                </Text>
            </View>
            <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                {item.courseName && (
                    <Text style={styles.eventCourse}>{item.courseName}</Text>
                )}
                {item.location && (
                    <Text style={styles.eventLocation}>📍 {item.location}</Text>
                )}
                <View style={[styles.eventTypeBadge, { backgroundColor: getEventColor(item.type) + '20' }]}>
                    <Text style={[styles.eventTypeText, { color: getEventColor(item.type) }]}>{item.type}</Text>
                </View>
            </View>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,  // Theme: colors.background
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            backgroundColor: colors.card,  // Theme: colors.card
            borderBottomWidth: 1,
            borderBottomColor: colors.border
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,  // Theme: colors.text
            textTransform: 'capitalize'
        },
        weekControls: {
            flexDirection: 'row',
            gap: 10
        },
        arrowButton: {
            padding: 8,
            backgroundColor: colors.border,
            borderRadius: 8
        },
        arrowText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text
        },
        weekStrip: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 10,
            backgroundColor: colors.card,  // Theme: colors.card
            borderBottomWidth: 1,
            borderBottomColor: colors.border
        },
        dayItem: {
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 12,
        },
        dayItemSelected: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary
        },
        dayName: {
            fontSize: 12,
            color: colors.textSecondary,  // Theme: colors.textSecondary
            marginBottom: 4,
            textTransform: 'uppercase'
        },
        dayNumber: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text
        },
        dayTextSelected: {
            color: colors.text
        },
        todayDot: {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.primary,
            marginTop: 4,
            position: 'absolute',
            bottom: 4
        },
        eventsContainer: {
            flex: 1,
            padding: 20
        },
        dateHeader: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textSecondary,  // Theme: colors.textSecondary
            marginBottom: 16,
            textTransform: 'capitalize'
        },
        eventCard: {
            flexDirection: 'row',
            backgroundColor: colors.card,  // Theme: colors.card
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2
        },
        eventTimeContainer: {
            marginRight: 16,
            alignItems: 'center',
            justifyContent: 'center'
        },
        eventTime: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.text
        },
        eventDuration: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        eventContent: {
            flex: 1
        },
        eventTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,  // Theme: colors.text
            marginBottom: 4
        },
        eventCourse: {
            fontSize: 14,
            color: '#4B5563',
            marginBottom: 4
        },
        eventLocation: {
            fontSize: 12,
            color: colors.textSecondary,  // Theme: colors.textSecondary
            marginBottom: 8
        },
        eventTypeBadge: {
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4
        },
        eventTypeText: {
            fontSize: 10,
            fontWeight: '700'
        },
        emptyState: {
            alignItems: 'center',
            marginTop: 40
        },
        emptyText: {
            color: colors.textSecondary,  // Theme: colors.textSecondary
            fontSize: 16
        }
    });

    return (
        <View style={styles.container}>
            {/* Header Month/Year */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {format(selectedDate, 'MMMM yyyy', { locale: sv })}
                </Text>
                <View style={styles.weekControls}>
                    <TouchableOpacity onPress={handlePrevWeek} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNextWeek} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Week Strip */}
            <View style={styles.weekStrip}>
                {getWeekDays().map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.dayItem, day.isSelected && styles.dayItemSelected]}
                        onPress={() => setSelectedDate(day.date)}
                    >
                        <Text style={[styles.dayName, day.isSelected && styles.dayTextSelected]}>{day.dayName}</Text>
                        <Text style={[styles.dayNumber, day.isSelected && styles.dayTextSelected]}>{day.dayNumber}</Text>
                        {day.isToday && <View style={styles.todayDot} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Events List */}
            <View style={styles.eventsContainer}>
                <Text style={styles.dateHeader}>
                    {format(selectedDate, 'EEEE d MMMM', { locale: sv })}
                </Text>

                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                ) : (
                    <FlatList
                        data={getEventsForSelectedDay()}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderEventItem}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Inga händelser planerade</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </View>
    );
};

export default CalendarScreen;
