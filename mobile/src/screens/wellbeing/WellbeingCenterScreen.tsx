import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Alert,
    Platform,
    Linking,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { wellbeingService, SupportRequest, SickLeave } from '../../services/wellbeingService';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

// ─── Help line data ───────────────────────────────────────────────
interface HelpLine {
    name: string;
    description: string;
    phone: string;
    availability: string;
    isOpen: boolean;
}

const HELP_LINES: HelpLine[] = [
    {
        name: 'BRIS',
        description: 'Dygnet runt för alla under 18 år',
        phone: '116111',
        availability: 'Öppet nu',
        isOpen: true,
    },
    {
        name: 'Jourhavande medmänniska',
        description: 'När du behöver någon att prata med',
        phone: '0870216 80',
        availability: 'Kväll & natt',
        isOpen: false,
    },
    {
        name: 'Mind Självmordslinjen',
        description: 'Stöd vid tankar om självmord',
        phone: '90101',
        availability: '24/7',
        isOpen: true,
    },
];

// ─── Support request types ────────────────────────────────────────
const REQUEST_TYPES = [
    { value: 'CURATOR', label: 'Kurator' },
    { value: 'NURSE', label: 'Skolsköterska' },
    { value: 'PSYCHOLOGIST', label: 'Psykolog' },
    { value: 'OTHER', label: 'Övrigt' },
];

// ─── Status config ────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    PENDING:     { label: 'Väntar',    color: '#f59e0b', icon: 'time-outline' },
    IN_PROGRESS: { label: 'Pågår',     color: '#3b82f6', icon: 'chatbubble-ellipses-outline' },
    RESOLVED:    { label: 'Avslutad',  color: '#22c55e', icon: 'checkmark-circle-outline' },
    CLOSED:      { label: 'Stängd',    color: '#64748b', icon: 'close-circle-outline' },
};

const WellbeingCenterScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation();

    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [activeSickLeave, setActiveSickLeave] = useState<SickLeave | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreedToConfidentiality, setAgreedToConfidentiality] = useState(false);
    const [formData, setFormData] = useState({
        type: 'CURATOR',
        subject: '',
        message: '',
    });

    const styles = useMemo(() => createStyles(colors), [colors]);

    const loadData = useCallback(async () => {
        try {
            const [reqs, sick] = await Promise.all([
                wellbeingService.getMyRequests().catch(() => []),
                wellbeingService.getActiveSickLeave().catch(() => null),
            ]);
            setRequests(reqs);
            setActiveSickLeave(sick);
        } catch (error) {
            console.error('Failed to load wellbeing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    }, [loadData]);

    const handleSubmit = async () => {
        if (!formData.subject.trim() || !formData.message.trim()) {
            Alert.alert('Fyll i alla fält', 'Ämne och meddelande krävs.');
            return;
        }
        if (!agreedToConfidentiality) {
            Alert.alert('Tystnadsplikt', 'Du måste godkänna tystnadsplikten först.');
            return;
        }

        setIsSubmitting(true);
        try {
            await wellbeingService.createRequest({
                ...formData,
                confidentialityAgreed: true,
            });
            setShowForm(false);
            setFormData({ type: 'CURATOR', subject: '', message: '' });
            setAgreedToConfidentiality(false);
            loadData();
        } catch (e) {
            Alert.alert('Fel', 'Kunde inte skicka begäran. Försök igen.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const callPhone = (phone: string) => {
        const cleaned = phone.replace(/\s/g, '');
        Linking.openURL(`tel:${cleaned}`);
    };

    // ─── Main render ──────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Laddar...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* ─── Header ──────────────────────────────────────────── */}
            <View style={[styles.header, {
                backgroundColor: colors.isDark ? 'rgba(24,29,52,0.85)' : 'rgba(255,255,255,0.9)',
                borderBottomColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
            }]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}20` }]}>
                        <Ionicons name="heart" size={22} color={colors.primary} />
                    </View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Well-being Center</Text>
                </View>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="notifications-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* ─── Hero Card ────────────────────────────────────── */}
                <View style={[styles.heroCard, {
                    backgroundColor: colors.isDark ? 'rgba(24,29,52,0.6)' : 'rgba(37,71,244,0.06)',
                    borderColor: colors.isDark ? `${colors.primary}30` : `${colors.primary}20`,
                }]}>
                    <Text style={[styles.heroTitle, { color: colors.text }]}>
                        Välkommen till din trygga punkt.
                    </Text>
                    <Text style={[styles.heroDescription, { color: colors.textMuted }]}>
                        Här finns vi för dig när du behöver stöd eller har frågor om din hälsa. All kontakt är konfidentiell.
                    </Text>
                    <TouchableOpacity
                        style={[styles.heroButton, { backgroundColor: colors.primary }]}
                        onPress={() => setShowForm(true)}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.heroButtonText}>Ny kontaktbegäran</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Quick Actions ───────────────────────────────── */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickActionCard, {
                            backgroundColor: colors.isDark ? 'rgba(24,29,52,0.6)' : '#FFFFFF',
                            borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        }]}
                        onPress={() => setShowForm(true)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
                            <Ionicons name="people-outline" size={22} color={colors.primary} />
                        </View>
                        <Text style={[styles.quickActionLabel, { color: colors.text }]}>Kontakt & Stöd</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionCard, {
                            backgroundColor: colors.isDark ? 'rgba(24,29,52,0.6)' : '#FFFFFF',
                            borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        }]}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
                            <Ionicons name="medkit-outline" size={22} color={colors.primary} />
                        </View>
                        <Text style={[styles.quickActionLabel, { color: colors.text }]}>Sjukanmälan</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Active Sick Leave Banner ────────────────────── */}
                {activeSickLeave && (
                    <View style={[styles.sickLeaveBanner, {
                        backgroundColor: 'rgba(245,158,11,0.1)',
                        borderColor: 'rgba(245,158,11,0.25)',
                    }]}>
                        <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                        <View style={styles.sickLeaveInfo}>
                            <Text style={[styles.sickLeaveTitle, { color: colors.text }]}>
                                Aktiv sjukanmälan
                            </Text>
                            <Text style={[styles.sickLeaveDate, { color: colors.textMuted }]}>
                                Sedan {format(new Date(activeSickLeave.startDate), 'd MMM', { locale: sv })}
                            </Text>
                        </View>
                    </View>
                )}

                {/* ─── Help Lines ──────────────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hjälplinjer</Text>
                        <TouchableOpacity>
                            <Text style={[styles.sectionLink, { color: colors.primary }]}>Visa alla</Text>
                        </TouchableOpacity>
                    </View>

                    {HELP_LINES.map((line, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.helpLineCard, {
                                backgroundColor: colors.isDark ? 'rgba(24,29,52,0.6)' : '#FFFFFF',
                                borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            }]}
                            onPress={() => callPhone(line.phone)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.helpLineAvatar, {
                                backgroundColor: colors.isDark ? '#1e293b' : '#e2e8f0',
                            }]}>
                                <Ionicons name="call" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.helpLineInfo}>
                                <View style={styles.helpLineTop}>
                                    <Text style={[styles.helpLineName, { color: colors.text }]}>{line.name}</Text>
                                    <View style={styles.helpLineStatus}>
                                        {line.isOpen && (
                                            <View style={styles.onlinePulse} />
                                        )}
                                        <Text style={[
                                            styles.helpLineAvailability,
                                            { color: line.isOpen ? '#2dd4bf' : colors.textMuted },
                                        ]}>
                                            {line.isOpen ? 'Öppet nu' : line.availability}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.helpLineDesc, { color: colors.textMuted }]}>
                                    {line.description}
                                </Text>
                                <View style={styles.helpLinePhoneRow}>
                                    <Ionicons name="call-outline" size={13} color={colors.primary} />
                                    <Text style={[styles.helpLinePhone, { color: colors.primary }]}>
                                        {line.phone}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ─── Previous Cases ──────────────────────────────── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tidigare ärenden</Text>

                    {requests.length === 0 ? (
                        <View style={[styles.emptyCard, {
                            backgroundColor: colors.isDark ? 'rgba(24,29,52,0.6)' : '#FFFFFF',
                            borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        }]}>
                            <View style={[styles.emptyIcon, {
                                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                            }]}>
                                <Ionicons name="time-outline" size={28} color={colors.textMuted} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>Inga aktiva ärenden</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                                Dina avslutade och pågående ärenden kommer att visas här.
                            </Text>
                        </View>
                    ) : (
                        requests.map(req => {
                            const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                            return (
                                <View
                                    key={req.id}
                                    style={[styles.caseCard, {
                                        backgroundColor: colors.isDark ? 'rgba(24,29,52,0.6)' : '#FFFFFF',
                                        borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                    }]}
                                >
                                    <View style={styles.caseHeader}>
                                        <Text style={[styles.caseSubject, { color: colors.text }]} numberOfLines={1}>
                                            {req.subject}
                                        </Text>
                                        <View style={[styles.caseBadge, { backgroundColor: `${status.color}18` }]}>
                                            <Ionicons name={status.icon} size={12} color={status.color} />
                                            <Text style={[styles.caseBadgeText, { color: status.color }]}>
                                                {status.label}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.caseType, { color: colors.textMuted }]}>
                                        {REQUEST_TYPES.find(t => t.value === req.type)?.label || req.type}
                                    </Text>
                                    <Text style={[styles.caseDate, { color: colors.textMuted }]}>
                                        {format(new Date(req.createdAt), 'd MMM yyyy', { locale: sv })}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* ─── New Request Modal ───────────────────────────────── */}
            <Modal
                visible={showForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowForm(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    {/* Modal header */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => setShowForm(false)}>
                            <Text style={[styles.modalCancel, { color: colors.textMuted }]}>Avbryt</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Ny kontaktbegäran</Text>
                        <View style={{ width: 50 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        {/* Type selector */}
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>Vem vill du kontakta?</Text>
                        <View style={styles.typeGrid}>
                            {REQUEST_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeChip,
                                        {
                                            backgroundColor: formData.type === type.value
                                                ? colors.primary
                                                : (colors.isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                                            borderColor: formData.type === type.value
                                                ? colors.primary
                                                : (colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                                        },
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                >
                                    <Text style={[
                                        styles.typeChipText,
                                        { color: formData.type === type.value ? '#FFFFFF' : colors.text },
                                    ]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Subject */}
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>Ämne</Text>
                        <TextInput
                            style={[styles.textField, {
                                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                color: colors.text,
                                borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            }]}
                            value={formData.subject}
                            onChangeText={t => setFormData(prev => ({ ...prev, subject: t }))}
                            placeholder="Beskriv kort vad det gäller"
                            placeholderTextColor={colors.textMuted}
                        />

                        {/* Message */}
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>Meddelande</Text>
                        <TextInput
                            style={[styles.textField, styles.textArea, {
                                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                color: colors.text,
                                borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            }]}
                            value={formData.message}
                            onChangeText={t => setFormData(prev => ({ ...prev, message: t }))}
                            placeholder="Berätta mer om vad du behöver hjälp med..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Confidentiality */}
                        <TouchableOpacity
                            style={styles.confidentialityRow}
                            onPress={() => setAgreedToConfidentiality(!agreedToConfidentiality)}
                        >
                            <View style={[styles.checkbox, {
                                backgroundColor: agreedToConfidentiality ? colors.primary : 'transparent',
                                borderColor: agreedToConfidentiality ? colors.primary : colors.textMuted,
                            }]}>
                                {agreedToConfidentiality && (
                                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                )}
                            </View>
                            <Text style={[styles.confidentialityText, { color: colors.textMuted }]}>
                                Jag förstår att all kontakt hanteras konfidentiellt och att informationen behandlas enligt gällande sekretesslagstiftning.
                            </Text>
                        </TouchableOpacity>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitButton, {
                                backgroundColor: colors.primary,
                                opacity: isSubmitting ? 0.6 : 1,
                            }]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            activeOpacity={0.85}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={18} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Skicka begäran</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Lock notice */}
                        <View style={styles.lockNotice}>
                            <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.lockNoticeText, { color: colors.textMuted }]}>
                                Krypterad och skyddad kommunikation
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
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
        scrollContent: {
            paddingBottom: 100,
        },

        // ── Header ──────────────────────────────────────────────
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 56 : 16,
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        headerIcon: {
            width: 38,
            height: 38,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 19,
        },
        headerButton: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
        },

        // ── Hero ────────────────────────────────────────────────
        heroCard: {
            margin: 16,
            padding: 24,
            borderRadius: 18,
            borderWidth: 1,
        },
        heroTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 22,
            marginBottom: 10,
            lineHeight: 28,
        },
        heroDescription: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
            lineHeight: 20,
            marginBottom: 20,
        },
        heroButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 14,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        heroButtonText: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 15,
            color: '#FFFFFF',
        },

        // ── Quick Actions ───────────────────────────────────────
        quickActions: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            gap: 12,
        },
        quickActionCard: {
            flex: 1,
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            gap: 10,
        },
        quickActionIcon: {
            width: 38,
            height: 38,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        quickActionLabel: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 13,
        },

        // ── Sick Leave Banner ───────────────────────────────────
        sickLeaveBanner: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginHorizontal: 16,
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
        },
        sickLeaveInfo: {
            flex: 1,
        },
        sickLeaveTitle: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 13,
        },
        sickLeaveDate: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 11,
            marginTop: 2,
        },

        // ── Sections ────────────────────────────────────────────
        section: {
            marginTop: 28,
            paddingHorizontal: 16,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
        },
        sectionTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 17,
            marginBottom: 14,
        },
        sectionLink: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 13,
        },

        // ── Help Line Cards ─────────────────────────────────────
        helpLineCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            marginBottom: 10,
        },
        helpLineAvatar: {
            width: 46,
            height: 46,
            borderRadius: 23,
            alignItems: 'center',
            justifyContent: 'center',
        },
        helpLineInfo: {
            flex: 1,
        },
        helpLineTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        helpLineName: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 14,
        },
        helpLineStatus: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        onlinePulse: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#2dd4bf',
        },
        helpLineAvailability: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        helpLineDesc: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 11,
            marginTop: 2,
            marginBottom: 6,
        },
        helpLinePhoneRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        helpLinePhone: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 13,
        },

        // ── Empty state ─────────────────────────────────────────
        emptyCard: {
            padding: 32,
            borderRadius: 16,
            borderWidth: 1,
            alignItems: 'center',
        },
        emptyIcon: {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        emptyTitle: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 15,
            marginBottom: 4,
        },
        emptySubtitle: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 18,
        },

        // ── Case Cards ──────────────────────────────────────────
        caseCard: {
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            marginBottom: 10,
        },
        caseHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
            gap: 10,
        },
        caseSubject: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 14,
            flex: 1,
        },
        caseBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        caseBadgeText: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        caseType: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
            marginBottom: 2,
        },
        caseDate: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 11,
        },

        // ── Modal ───────────────────────────────────────────────
        modalContainer: {
            flex: 1,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 16 : 16,
            paddingBottom: 14,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
        },
        modalCancel: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 14,
        },
        modalTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 16,
        },
        modalContent: {
            padding: 20,
            paddingBottom: 40,
        },

        // ── Form fields ─────────────────────────────────────────
        fieldLabel: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 13,
            marginBottom: 8,
            marginTop: 16,
        },
        typeGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        typeChip: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
        },
        typeChipText: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 13,
        },
        textField: {
            borderRadius: 12,
            borderWidth: 1,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontFamily: 'Lexend_400Regular',
            fontSize: 14,
        },
        textArea: {
            height: 120,
        },
        confidentialityRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            marginTop: 20,
        },
        checkbox: {
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
        },
        confidentialityText: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
            lineHeight: 18,
            flex: 1,
        },
        submitButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 15,
            borderRadius: 14,
            marginTop: 24,
        },
        submitButtonText: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 15,
            color: '#FFFFFF',
        },
        lockNotice: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 16,
        },
        lockNoticeText: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 11,
        },
    });

export default WellbeingCenterScreen;
