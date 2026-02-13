import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    ScrollView,
    RefreshControl,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { calendarService } from '../../services/calendarService';
import { CalendarEvent } from '../../types';
import { format, startOfWeek, addDays, isSameDay, addWeeks } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

// ─── Event type config ────────────────────────────────────────────
type EventConfig = {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
    label: string;
};

const EVENT_CONFIG: Record<string, EventConfig> = {
    LESSON:   { icon: 'book-outline',     color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)',  label: 'Lektion' },
    WORKSHOP: { icon: 'flask-outline',     color: '#a855f7', bgColor: 'rgba(168,85,247,0.12)', label: 'Labb' },
    EXAM:     { icon: 'school-outline',    color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)',   label: 'Prov' },
    DEADLINE: { icon: 'alert-circle-outline', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)', label: 'Deadline' },
    MEETING:  { icon: 'people-outline',    color: '#10b981', bgColor: 'rgba(16,185,129,0.12)', label: 'Möte' },
    OTHER:    { icon: 'ellipsis-horizontal', color: '#64748b', bgColor: 'rgba(100,116,139,0.12)', label: 'Övrigt' },
    BREAK:    { icon: 'restaurant-outline', color: '#f97316', bgColor: 'rgba(249,115,22,0.08)', label: 'Rast' },
};

// ─── View modes ───────────────────────────────────────────────────
type ViewMode = 'timeline' | 'list';

// ─── Weekday names ────────────────────────────────────────────────
const WEEKDAY_LABELS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre'];

const CalendarScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeekStart, setCurrentWeekStart] = useState(
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');

    // ─── Data loading ─────────────────────────────────────────────
    const loadEvents = useCallback(async () => {
        try {
            const data = await calendarService.getAllEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadEvents();
        setIsRefreshing(false);
    }, [loadEvents]);

    // ─── Week days (Mon–Fri) ──────────────────────────────────────
    const weekDays = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => {
            const date = addDays(currentWeekStart, i);
            return {
                date,
                label: WEEKDAY_LABELS[i],
                dayNumber: format(date, 'd'),
                isToday: isSameDay(date, new Date()),
                isSelected: isSameDay(date, selectedDate),
            };
        });
    }, [currentWeekStart, selectedDate]);

    // ─── Filtered + sorted events for selected day ────────────────
    const dayEvents = useMemo(() => {
        return events
            .filter(e => isSameDay(new Date(e.startTime), selectedDate))
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [events, selectedDate]);

    // ─── Navigation ───────────────────────────────────────────────
    const goToPrevWeek = () => setCurrentWeekStart(prev => addWeeks(prev, -1));
    const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));

    // ─── Helpers ──────────────────────────────────────────────────
    const getConfig = (event: CalendarEvent): EventConfig => {
        const titleLower = event.title.toLowerCase();
        if (titleLower.includes('lunch') || titleLower.includes('rast') || titleLower.includes('break')) {
            return EVENT_CONFIG.BREAK;
        }
        return EVENT_CONFIG[event.type] || EVENT_CONFIG.OTHER;
    };

    const formatTime = (dateStr: string) =>
        format(new Date(dateStr), 'HH:mm');

    // ─── Styles (theme-aware) ─────────────────────────────────────
    const styles = useMemo(() => createStyles(colors), [colors]);

    // ─── Render: Timeline event item ──────────────────────────────
    const renderTimelineItem = (event: CalendarEvent, index: number) => {
        const config = getConfig(event);
        const isFirst = index === 0;
        const isLast = index === dayEvents.length - 1;
        const isBreak = config === EVENT_CONFIG.BREAK;

        return (
            <View key={event.id} style={styles.timelineRow}>
                {/* Left column: icon + line */}
                <View style={styles.timelineLeftCol}>
                    {!isFirst && (
                        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                    <View style={[
                        styles.timelineIcon,
                        { backgroundColor: config.bgColor, borderColor: colors.background },
                    ]}>
                        <Ionicons name={config.icon} size={18} color={config.color} />
                    </View>
                    {!isLast && (
                        <View style={[
                            styles.timelineLine,
                            styles.timelineLineGrow,
                            { backgroundColor: colors.border },
                            isBreak && styles.timelineLineDashed,
                        ]} />
                    )}
                </View>

                {/* Right column: card */}
                <View style={[
                    styles.timelineCard,
                    {
                        backgroundColor: isBreak
                            ? 'rgba(249,115,22,0.06)'
                            : (colors.isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                        borderColor: isBreak
                            ? (colors.isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.15)')
                            : (colors.isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                    },
                ]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                            {event.title}
                        </Text>
                        {!isBreak && (
                            <View style={[styles.typeBadge, { backgroundColor: config.bgColor }]}>
                                <Text style={[styles.typeBadgeText, { color: config.color }]}>
                                    {config.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {(event.location || event.ownerName) && (
                        <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                            {[event.location, event.ownerName].filter(Boolean).join(' • ')}
                        </Text>
                    )}

                    <View style={styles.cardTimeRow}>
                        <Ionicons name="time-outline" size={13} color={isBreak ? config.color : colors.primary} />
                        <Text style={[styles.cardTimeText, { color: isBreak ? config.color : colors.primary }]}>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // ─── Render: List view event item ─────────────────────────────
    const renderListItem = ({ item }: { item: CalendarEvent }) => {
        const config = getConfig(item);
        return (
            <View style={[styles.listCard, {
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                borderLeftColor: config.color,
                borderColor: colors.isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            }]}>
                <View style={styles.listTimeCol}>
                    <Text style={[styles.listTimeStart, { color: colors.text }]}>
                        {formatTime(item.startTime)}
                    </Text>
                    <Text style={[styles.listTimeEnd, { color: colors.textMuted }]}>
                        {formatTime(item.endTime)}
                    </Text>
                </View>
                <View style={styles.listContent}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    {item.courseName && (
                        <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                            {item.courseName}
                        </Text>
                    )}
                    {item.location && (
                        <Text style={[styles.listLocation, { color: colors.textMuted }]}>
                            {item.location}
                        </Text>
                    )}
                    <View style={[styles.typeBadge, { backgroundColor: config.bgColor, alignSelf: 'flex-start', marginTop: 6 }]}>
                        <Text style={[styles.typeBadgeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // ─── Empty state component ────────────────────────────────────
    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Inga händelser</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Det finns inga schemalagda händelser denna dag
            </Text>
        </View>
    );

    // ─── Main render ──────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Laddar schema...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* ─── Top App Bar ─────────────────────────────────────── */}
            <View style={[styles.topBar, {
                backgroundColor: colors.isDark ? 'rgba(16,22,34,0.85)' : 'rgba(255,255,255,0.85)',
                borderBottomColor: colors.border,
            }]}>
                <TouchableOpacity
                    style={styles.topBarButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.topBarTitleContainer}>
                    <Text style={[styles.topBarTitle, { color: colors.text }]}>Veckoschema</Text>
                    <Text style={[styles.topBarSubtitle, { color: colors.textMuted }]}>
                        v.{format(currentWeekStart, 'w', { locale: sv })} {format(currentWeekStart, '• MMM yyyy', { locale: sv })}
                    </Text>
                </View>

                <View style={styles.topBarRight}>
                    <TouchableOpacity style={styles.topBarButton} onPress={goToPrevWeek}>
                        <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topBarButton} onPress={goToNextWeek}>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── Segmented Toggle ────────────────────────────────── */}
            <View style={styles.segmentContainer}>
                <View style={[styles.segmentTrack, {
                    backgroundColor: colors.isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                }]}>
                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            viewMode === 'timeline' && [styles.segmentActive, {
                                backgroundColor: colors.isDark ? '#334155' : '#FFFFFF',
                            }],
                        ]}
                        onPress={() => setViewMode('timeline')}
                    >
                        <Text style={[
                            styles.segmentText,
                            { color: viewMode === 'timeline' ? colors.primary : colors.textMuted },
                        ]}>
                            Tidslinje
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            viewMode === 'list' && [styles.segmentActive, {
                                backgroundColor: colors.isDark ? '#334155' : '#FFFFFF',
                            }],
                        ]}
                        onPress={() => setViewMode('list')}
                    >
                        <Text style={[
                            styles.segmentText,
                            { color: viewMode === 'list' ? colors.primary : colors.textMuted },
                        ]}>
                            Listvy
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── Day Chips ───────────────────────────────────────── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayChipsContainer}
            >
                {weekDays.map((day, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.dayChip,
                            {
                                backgroundColor: day.isSelected
                                    ? colors.primary
                                    : (colors.isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                                borderColor: day.isSelected
                                    ? colors.primary
                                    : (colors.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                            },
                        ]}
                        onPress={() => setSelectedDate(day.date)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.dayChipLabel,
                            { color: day.isSelected ? '#FFFFFF' : colors.textMuted },
                        ]}>
                            {day.label}
                        </Text>
                        <Text style={[
                            styles.dayChipNumber,
                            { color: day.isSelected ? '#FFFFFF' : colors.text },
                        ]}>
                            {day.dayNumber}
                        </Text>
                        {day.isToday && !day.isSelected && (
                            <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* ─── Date header ─────────────────────────────────────── */}
            <View style={styles.dateHeaderContainer}>
                <Text style={[styles.dateHeaderText, { color: colors.textMuted }]}>
                    {format(selectedDate, 'EEEE d MMMM', { locale: sv })}
                </Text>
                <Text style={[styles.eventCount, { color: colors.textMuted }]}>
                    {dayEvents.length} {dayEvents.length === 1 ? 'händelse' : 'händelser'}
                </Text>
            </View>

            {/* ─── Content ─────────────────────────────────────────── */}
            {viewMode === 'timeline' ? (
                <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContentInner}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {dayEvents.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <View style={styles.timelineContainer}>
                            {dayEvents.map((event, index) => renderTimelineItem(event, index))}
                        </View>
                    )}
                </ScrollView>
            ) : (
                <FlatList
                    data={dayEvents}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderListItem}
                    contentContainerStyle={styles.listContentContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={<EmptyState />}
                />
            )}

            {/* ─── FAB ─────────────────────────────────────────────── */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────
const createStyles = (colors: ReturnType<typeof getThemeColors>) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 14,
            marginTop: 12,
        },

        // ── Top App Bar ──────────────────────────────────────────
        topBar: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 56 : 16,
            paddingBottom: 10,
            paddingHorizontal: 8,
            borderBottomWidth: 1,
        },
        topBarButton: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
        },
        topBarTitleContainer: {
            flex: 1,
            alignItems: 'center',
        },
        topBarTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 17,
        },
        topBarSubtitle: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 11,
            marginTop: 1,
        },
        topBarRight: {
            flexDirection: 'row',
            gap: 2,
        },

        // ── Segmented Toggle ─────────────────────────────────────
        segmentContainer: {
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 4,
        },
        segmentTrack: {
            flexDirection: 'row',
            height: 44,
            borderRadius: 12,
            padding: 4,
        },
        segmentButton: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
        },
        segmentActive: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
        },
        segmentText: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 13,
        },

        // ── Day Chips ────────────────────────────────────────────
        dayChipsContainer: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 10,
        },
        dayChip: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 14,
            borderWidth: 1,
            minWidth: 56,
        },
        dayChipLabel: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 2,
        },
        dayChipNumber: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 16,
        },
        todayDot: {
            width: 5,
            height: 5,
            borderRadius: 3,
            marginTop: 4,
        },

        // ── Date header ──────────────────────────────────────────
        dateHeaderContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 8,
        },
        dateHeaderText: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 13,
            textTransform: 'capitalize',
        },
        eventCount: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
        },

        // ── Timeline ─────────────────────────────────────────────
        scrollContent: {
            flex: 1,
        },
        scrollContentInner: {
            paddingHorizontal: 16,
            paddingBottom: 100,
        },
        timelineContainer: {
            paddingTop: 8,
        },
        timelineRow: {
            flexDirection: 'row',
        },
        timelineLeftCol: {
            width: 48,
            alignItems: 'center',
        },
        timelineIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            zIndex: 2,
        },
        timelineLine: {
            width: 2,
            height: 16,
        },
        timelineLineGrow: {
            flexGrow: 1,
        },
        timelineLineDashed: {
            opacity: 0.4,
        },
        timelineCard: {
            flex: 1,
            marginLeft: 12,
            marginBottom: 12,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 3,
            elevation: 1,
        },

        // ── Card content ─────────────────────────────────────────
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
            gap: 8,
        },
        cardTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 15,
            flex: 1,
        },
        cardSubtitle: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
            marginBottom: 8,
        },
        cardTimeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        cardTimeText: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 12,
        },
        typeBadge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
        },
        typeBadgeText: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },

        // ── List view cards ──────────────────────────────────────
        listContentContainer: {
            paddingHorizontal: 16,
            paddingBottom: 100,
        },
        listCard: {
            flexDirection: 'row',
            borderRadius: 14,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderLeftWidth: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
        },
        listTimeCol: {
            marginRight: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        listTimeStart: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 14,
        },
        listTimeEnd: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
            marginTop: 2,
        },
        listContent: {
            flex: 1,
        },
        listLocation: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
            marginTop: 2,
        },

        // ── Empty state ──────────────────────────────────────────
        emptyState: {
            alignItems: 'center',
            marginTop: 60,
            paddingHorizontal: 32,
        },
        emptyTitle: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 17,
            marginTop: 14,
        },
        emptySubtitle: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
            marginTop: 6,
            textAlign: 'center',
        },

        // ── FAB ──────────────────────────────────────────────────
        fab: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 100 : 80,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 8,
            zIndex: 30,
        },
    });

export default CalendarScreen;
