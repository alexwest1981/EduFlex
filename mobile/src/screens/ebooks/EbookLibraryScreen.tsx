import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    Image,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { ebookService } from '../../services/ebookService';
import { tokenManager } from '../../services/api';
import { Ebook } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = 200;

// ─── Category config ──────────────────────────────────────────────
interface CategoryConfig {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
    Matematik:   { icon: 'calculator-outline',  color: '#2547f4', bgColor: 'rgba(37,71,244,0.12)' },
    Litteratur:  { icon: 'book-outline',        color: '#10b981', bgColor: 'rgba(16,185,129,0.12)' },
    Vetenskap:   { icon: 'flask-outline',        color: '#f97316', bgColor: 'rgba(249,115,22,0.12)' },
    Historia:    { icon: 'time-outline',         color: '#a855f7', bgColor: 'rgba(168,85,247,0.12)' },
    Teknik:      { icon: 'hardware-chip-outline', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.12)' },
    Språk:       { icon: 'language-outline',     color: '#ec4899', bgColor: 'rgba(236,72,153,0.12)' },
};

const DEFAULT_CATEGORY: CategoryConfig = {
    icon: 'library-outline',
    color: '#64748b',
    bgColor: 'rgba(100,116,139,0.12)',
};

const EbookLibraryScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation();

    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);

    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        loadEbooks();
        tokenManager.getToken().then(setAuthToken);
    }, []);

    const loadEbooks = useCallback(async () => {
        try {
            const data = await ebookService.getAllEbooks();
            setEbooks(data);
        } catch (error) {
            console.error('Failed to load ebooks:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadEbooks();
        setIsRefreshing(false);
    }, [loadEbooks]);

    // ─── Derived data ─────────────────────────────────────────────
    const categories = useMemo(() => {
        const cats = [...new Set(ebooks.map(b => b.category).filter(Boolean))] as string[];
        return cats.sort();
    }, [ebooks]);

    const filteredEbooks = useMemo(() => {
        let list = ebooks;
        if (selectedCategory) {
            list = list.filter(b => b.category === selectedCategory);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q)
            );
        }
        return list;
    }, [ebooks, selectedCategory, searchTerm]);

    const featuredBooks = useMemo(() => ebooks.slice(0, 6), [ebooks]);

    const myLibrary = useMemo(() =>
        ebooks.filter(b => (b.readingProgress ?? 0) > 0).slice(0, 5),
        [ebooks]
    );

    const getCategoryConfig = (cat?: string): CategoryConfig => {
        if (!cat) return DEFAULT_CATEGORY;
        return CATEGORY_MAP[cat] || DEFAULT_CATEGORY;
    };

    const getCoverSource = (book: Ebook) => ({
        uri: ebookService.getCoverUrl(book.id),
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });

    // ─── Render: Featured book card ───────────────────────────────
    const renderFeaturedCard = (book: Ebook) => (
        <TouchableOpacity
            key={book.id}
            style={styles.featuredCard}
            activeOpacity={0.85}
        >
            <View style={[styles.featuredCover, {
                backgroundColor: colors.isDark ? '#1a1e35' : '#e2e8f0',
            }]}>
                <Image
                    source={getCoverSource(book)}
                    style={styles.featuredCoverImage}
                    resizeMode="cover"
                />
                {book.category && (
                    <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.featuredBadgeText}>{book.category}</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.featuredTitle, { color: colors.text }]} numberOfLines={2}>
                {book.title}
            </Text>
            <Text style={[styles.featuredAuthor, { color: colors.textMuted }]} numberOfLines={1}>
                {book.author}
            </Text>
        </TouchableOpacity>
    );

    // ─── Render: My library book item ─────────────────────────────
    const renderLibraryItem = (book: Ebook) => {
        const progress = book.readingProgress ?? 0;
        return (
            <TouchableOpacity
                key={book.id}
                style={[styles.libraryItem, {
                    backgroundColor: colors.isDark ? '#1a1e35' : '#FFFFFF',
                    borderColor: colors.isDark ? '#2a2f4a' : '#e2e8f0',
                }]}
                activeOpacity={0.8}
            >
                <View style={[styles.libraryThumb, {
                    backgroundColor: colors.isDark ? '#252a45' : '#f1f5f9',
                }]}>
                    <Image
                        source={getCoverSource(book)}
                        style={styles.libraryThumbImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.libraryInfo}>
                    <View>
                        <Text style={[styles.libraryTitle, { color: colors.text }]} numberOfLines={1}>
                            {book.title}
                        </Text>
                        <Text style={[styles.libraryAuthor, { color: colors.textMuted }]} numberOfLines={1}>
                            {book.author}
                        </Text>
                    </View>
                    <View style={styles.progressSection}>
                        <View style={styles.progressLabels}>
                            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                                {progress}% Läst
                            </Text>
                            {book.currentChapter && (
                                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                                    {book.currentChapter}
                                </Text>
                            )}
                        </View>
                        <View style={[styles.progressTrack, {
                            backgroundColor: colors.isDark ? '#334155' : '#e2e8f0',
                        }]}>
                            <View style={[styles.progressFill, {
                                width: `${progress}%` as any,
                                backgroundColor: colors.primary,
                            }]} />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Render: Category card ────────────────────────────────────
    const renderCategoryCard = (cat: string) => {
        const config = getCategoryConfig(cat);
        const count = ebooks.filter(b => b.category === cat).length;
        return (
            <TouchableOpacity
                key={cat}
                style={[styles.categoryCard, {
                    backgroundColor: config.bgColor,
                    borderColor: `${config.color}30`,
                }]}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                activeOpacity={0.7}
            >
                <View style={[styles.categoryIcon, { backgroundColor: config.color }]}>
                    <Ionicons name={config.icon} size={22} color="#FFFFFF" />
                </View>
                <Text style={[styles.categoryName, { color: colors.text }]}>{cat}</Text>
                <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
                    {count} {count === 1 ? 'bok' : 'böcker'}
                </Text>
            </TouchableOpacity>
        );
    };

    // ─── Main render ──────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Laddar bibliotek...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                {/* ─── Header ──────────────────────────────────────── */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Digitalt Bibliotek</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                            Upptäck din nästa bok
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.notifButton, {
                            backgroundColor: `${colors.primary}20`,
                            borderColor: `${colors.primary}30`,
                        }]}
                    >
                        <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* ─── Search Bar ───────────────────────────────────── */}
                <View style={[styles.searchContainer, {
                    backgroundColor: colors.isDark ? '#1a1e35' : '#FFFFFF',
                }]}>
                    <Ionicons name="search" size={18} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Sök titel, författare eller ISBN"
                        placeholderTextColor={colors.textMuted}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* ─── Search results ──────────────────────────────── */}
                {searchTerm.trim().length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Sökresultat ({filteredEbooks.length})
                        </Text>
                        {filteredEbooks.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                    Inga böcker hittades
                                </Text>
                            </View>
                        ) : (
                            filteredEbooks.map(book => renderLibraryItem(book))
                        )}
                    </View>
                ) : (
                    <>
                        {/* ─── Featured Picks ──────────────────────────── */}
                        {featuredBooks.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        Utvalda Böcker
                                    </Text>
                                    <TouchableOpacity>
                                        <Text style={[styles.sectionLink, { color: colors.primary }]}>
                                            Visa alla
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.featuredScroll}
                                    decelerationRate="fast"
                                    snapToInterval={FEATURED_CARD_WIDTH + 16}
                                >
                                    {featuredBooks.map(book => renderFeaturedCard(book))}
                                </ScrollView>
                            </View>
                        )}

                        {/* ─── My Library ───────────────────────────────── */}
                        {myLibrary.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        Mitt Bibliotek
                                    </Text>
                                    <TouchableOpacity>
                                        <Text style={[styles.sectionLink, { color: colors.primary }]}>
                                            Fortsätt läsa
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {myLibrary.map(book => renderLibraryItem(book))}
                            </View>
                        )}

                        {/* ─── Browse Categories ───────────────────────── */}
                        {categories.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Bläddra Kategorier
                                </Text>
                                <View style={styles.categoryGrid}>
                                    {categories.map(cat => renderCategoryCard(cat))}
                                </View>
                            </View>
                        )}

                        {/* ─── All books (when category is selected) ──── */}
                        {selectedCategory && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        {selectedCategory}
                                    </Text>
                                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                                        <Text style={[styles.sectionLink, { color: colors.primary }]}>
                                            Rensa filter
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {filteredEbooks.map(book => renderLibraryItem(book))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
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
            paddingTop: Platform.OS === 'ios' ? 60 : 20,
            paddingBottom: 100,
        },

        // ── Header ──────────────────────────────────────────────
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 20,
        },
        headerTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 24,
            letterSpacing: -0.5,
        },
        headerSubtitle: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
            marginTop: 2,
        },
        notifButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
        },

        // ── Search ──────────────────────────────────────────────
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 20,
            paddingHorizontal: 14,
            height: 46,
            borderRadius: 14,
            gap: 10,
            marginBottom: 8,
        },
        searchInput: {
            flex: 1,
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
        },

        // ── Sections ────────────────────────────────────────────
        section: {
            marginTop: 24,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 14,
        },
        sectionTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 19,
            paddingHorizontal: 20,
            marginBottom: 14,
        },
        sectionLink: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 13,
        },

        // ── Featured carousel ───────────────────────────────────
        featuredScroll: {
            paddingHorizontal: 20,
            gap: 16,
        },
        featuredCard: {
            width: FEATURED_CARD_WIDTH,
        },
        featuredCover: {
            width: FEATURED_CARD_WIDTH,
            height: FEATURED_CARD_WIDTH * 1.4,
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: 10,
        },
        featuredCoverImage: {
            width: '100%',
            height: '100%',
        },
        featuredBadge: {
            position: 'absolute',
            top: 10,
            left: 10,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 99,
        },
        featuredBadgeText: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 9,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        featuredTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 15,
            lineHeight: 20,
        },
        featuredAuthor: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
            marginTop: 2,
        },

        // ── Library items ───────────────────────────────────────
        libraryItem: {
            flexDirection: 'row',
            gap: 14,
            padding: 10,
            marginHorizontal: 20,
            marginBottom: 10,
            borderRadius: 14,
            borderWidth: 1,
        },
        libraryThumb: {
            width: 72,
            height: 100,
            borderRadius: 10,
            overflow: 'hidden',
        },
        libraryThumbImage: {
            width: '100%',
            height: '100%',
        },
        libraryInfo: {
            flex: 1,
            justifyContent: 'space-between',
            paddingVertical: 4,
        },
        libraryTitle: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 15,
        },
        libraryAuthor: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 12,
            marginTop: 2,
        },
        progressSection: {
            gap: 6,
        },
        progressLabels: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        progressLabel: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        progressTrack: {
            height: 5,
            borderRadius: 3,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            borderRadius: 3,
        },

        // ── Category grid ───────────────────────────────────────
        categoryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 20,
            gap: 12,
        },
        categoryCard: {
            width: (SCREEN_WIDTH - 52) / 2,
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            gap: 10,
        },
        categoryIcon: {
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        categoryName: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 14,
        },
        categoryCount: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 11,
        },

        // ── Empty state ─────────────────────────────────────────
        emptyState: {
            alignItems: 'center',
            paddingVertical: 40,
        },
        emptyText: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 14,
            marginTop: 10,
        },
    });

export default EbookLibraryScreen;
