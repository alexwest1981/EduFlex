import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { useAuth } from '../../context/AuthContext';
import { documentService, UserDocument, Folder } from '../../services/documentService';
import * as DocumentPicker from 'expo-document-picker';
import { format, formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RECENT_CARD_WIDTH = SCREEN_WIDTH * 0.6;

const FILE_TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  'application/pdf': { icon: 'document-text', color: '#ef4444', label: 'PDF' },
  'image/png': { icon: 'image', color: '#3b82f6', label: 'PNG' },
  'image/jpeg': { icon: 'image', color: '#3b82f6', label: 'JPG' },
  'image/gif': { icon: 'image', color: '#8b5cf6', label: 'GIF' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'document', color: '#10b981', label: 'DOCX' },
  'application/msword': { icon: 'document', color: '#10b981', label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'grid', color: '#10b981', label: 'XLSX' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: 'easel', color: '#f59e0b', label: 'PPTX' },
  'text/plain': { icon: 'document-text-outline', color: '#6b7280', label: 'TXT' },
  'application/zip': { icon: 'archive', color: '#f59e0b', label: 'ZIP' },
};

const FOLDER_ICONS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'document-text-outline', label: 'Uppgifter' },
  { icon: 'school-outline', label: 'Kursmaterial' },
  { icon: 'person-outline', label: 'Personligt' },
  { icon: 'clipboard-outline', label: 'Prov' },
];

const getFileConfig = (fileType: string) => {
  return FILE_TYPE_CONFIG[fileType] || { icon: 'document-outline' as keyof typeof Ionicons.glyphMap, color: '#6b7280', label: fileType?.split('/').pop()?.toUpperCase() || 'FIL' };
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileManagerScreen: React.FC = () => {
  const { currentTheme } = useTheme();
  const colors = getThemeColors(currentTheme);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: number | null; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadContent = useCallback(async () => {
    if (!user) return;
    try {
      if (currentFolderId === null) {
        const data = await documentService.getRootContent(user.id);
        setFolders(data.folders);
        setDocuments(data.documents);
      } else {
        const data = await documentService.getFolderContent(currentFolderId, user.id);
        setFolders(data.folders);
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      // Fallback: load all documents
      try {
        const allDocs = await documentService.getUserDocuments(user.id);
        setDocuments(allDocs);
        setFolders([]);
      } catch {
        setDocuments([]);
        setFolders([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, currentFolderId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadContent();
    setIsRefreshing(false);
  };

  const navigateToFolder = (folder: Folder) => {
    setFolderStack(prev => [...prev, { id: currentFolderId, name: currentFolderId === null ? 'Filhanterare' : 'Tillbaka' }]);
    setCurrentFolderId(folder.id);
    setIsLoading(true);
  };

  const navigateBack = () => {
    if (folderStack.length > 0) {
      const prev = folderStack[folderStack.length - 1];
      setFolderStack(s => s.slice(0, -1));
      setCurrentFolderId(prev.id);
      setIsLoading(true);
    }
  };

  const handleUploadFile = async () => {
    if (!user) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      const file = result.assets[0];
      setIsUploading(true);
      await documentService.uploadFile(user.id, file, currentFolderId ?? undefined);
      await loadContent();
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte ladda upp filen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (doc: UserDocument) => {
    if (doc.official) {
      Alert.alert('Skyddad fil', 'Officiella dokument kan inte raderas');
      return;
    }
    Alert.alert('Radera fil', `Vill du radera "${doc.fileName}"?`, [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Radera', style: 'destructive', onPress: async () => {
          try {
            await documentService.deleteDocument(doc.id);
            await loadContent();
          } catch {
            Alert.alert('Fel', 'Kunde inte radera filen');
          }
        }
      },
    ]);
  };

  // Recent files = all docs sorted by uploadedAt desc, top 5
  const recentFiles = useMemo(() => {
    return [...documents]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 5);
  }, [documents]);

  // Filtered files
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(d => d.fileName.toLowerCase().includes(q));
  }, [documents, searchQuery]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter(f => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  if (isLoading && documents.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isInSubfolder = folderStack.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {isInSubfolder ? (
            <TouchableOpacity style={styles.headerBtn} onPress={navigateBack}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          ) : null}
          <Text style={[styles.headerTitle, isInSubfolder && { textAlign: 'center', flex: 1 }]}>
            {isInSubfolder ? (folders.length > 0 ? 'Mapp' : 'Filhanterare') : 'Filhanterare'}
          </Text>
          <View style={styles.headerAvatar}>
            <Ionicons name="person" size={18} color={colors.primary} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginLeft: 14 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök i dina filer..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Recent Files - Horizontal Scroll (only on root level) */}
        {!isInSubfolder && !searchQuery && recentFiles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Senaste filer</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Visa alla</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={recentFiles}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              renderItem={({ item }) => {
                const config = getFileConfig(item.fileType);
                return (
                  <TouchableOpacity
                    style={styles.recentCard}
                    onLongPress={() => handleDeleteDocument(item)}
                  >
                    <View style={styles.recentPreview}>
                      <Ionicons name={config.icon} size={40} color={`${config.color}80`} />
                      <View style={[styles.recentBadge, { backgroundColor: config.color }]}>
                        <Text style={styles.recentBadgeText}>{config.label}</Text>
                      </View>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentFileName} numberOfLines={1}>{item.fileName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                        <Text style={styles.recentDate}>
                          {formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true, locale: sv })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Folders Grid */}
        {!searchQuery && filteredFolders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mappar</Text>
            <View style={styles.foldersGrid}>
              {filteredFolders.map((folder, index) => {
                const folderIcon = FOLDER_ICONS[index % FOLDER_ICONS.length];
                return (
                  <TouchableOpacity
                    key={folder.id}
                    style={styles.folderCard}
                    onPress={() => navigateToFolder(folder)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.folderIconWrap}>
                      <Ionicons name="folder" size={28} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.folderName}>{folder.name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Search results for folders */}
        {searchQuery && filteredFolders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mappar</Text>
            {filteredFolders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={styles.fileItem}
                onPress={() => navigateToFolder(folder)}
              >
                <View style={[styles.fileIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name="folder" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName}>{folder.name}</Text>
                  <Text style={styles.fileMeta}>Mapp</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* All Files List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Sökresultat' : 'Alla filer'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity>
                <Ionicons name="funnel-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const config = getFileConfig(doc.fileType);
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.fileItem}
                  onLongPress={() => handleDeleteDocument(doc)}
                >
                  <View style={[styles.fileIconWrap, { backgroundColor: `${config.color}15` }]}>
                    <Ionicons name={config.icon} size={24} color={config.color} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.fileName} numberOfLines={1}>{doc.fileName}</Text>
                    <Text style={styles.fileMeta}>
                      {format(new Date(doc.uploadedAt), 'd MMM yyyy', { locale: sv })} • {formatFileSize(doc.size)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteDocument(doc)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Inga filer hittades' : 'Inga filer ännu'}
              </Text>
              <Text style={styles.emptyHint}>
                {searchQuery ? 'Prova med ett annat sökord' : 'Tryck + för att ladda upp en fil'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB Upload Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleUploadFile}
        disabled={isUploading}
        activeOpacity={0.8}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="add" size={32} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getThemeColors>, insets: { top: number }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Header
    header: {
      paddingTop: insets.top + 8,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.isDark ? 'rgba(10,12,22,0.8)' : 'rgba(245,246,248,0.9)',
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 28,
      color: colors.text,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: `${colors.primary}50`,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceGlass,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 14,
      height: 50,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 15,
      color: colors.text,
      marginLeft: 10,
      marginRight: 14,
    },

    // Scroll
    scrollContent: {
      paddingBottom: 120,
    },

    // Sections
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 17,
      color: colors.text,
      marginBottom: 4,
    },
    viewAll: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 13,
      color: colors.primary,
    },

    // Recent Cards (Horizontal)
    recentCard: {
      width: RECENT_CARD_WIDTH,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      overflow: 'hidden',
      marginRight: 12,
    },
    recentPreview: {
      height: 110,
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    recentBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    recentBadgeText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 9,
      color: '#fff',
    },
    recentInfo: {
      padding: 14,
    },
    recentFileName: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 14,
      color: colors.text,
      marginBottom: 6,
    },
    recentDate: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
      color: colors.textMuted,
    },

    // Folders Grid
    foldersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 8,
    },
    folderCard: {
      width: '48%' as any,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    folderIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${colors.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    folderName: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 14,
      color: colors.text,
    },

    // File Items (List)
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      marginBottom: 4,
    },
    fileIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fileName: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 14,
      color: colors.text,
    },
    fileMeta: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: 50,
      gap: 8,
    },
    emptyText: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 16,
      color: colors.textMuted,
    },
    emptyHint: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: colors.textMuted,
      opacity: 0.7,
    },

    // FAB
    fab: {
      position: 'absolute',
      bottom: 90,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  });

export default FileManagerScreen;
