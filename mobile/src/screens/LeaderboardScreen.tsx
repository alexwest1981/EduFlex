import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from '../context/AuthContext';
import { Leaderboard } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from '../hooks';

const LeaderboardScreen: React.FC = () => {
  const { colors, styles: themedStyles } = useThemedStyles();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const data = await gamificationService.getGlobalLeaderboard(50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const renderItem = ({ item, index }: { item: Leaderboard; index: number }) => {
    const isMe = user?.id === item.userId;
    const isTop3 = index < 3;

    return (
      <View style={[styles.itemContainer, { backgroundColor: colors.card, borderColor: colors.border }, isMe && { borderColor: colors.primary, borderWidth: 2 }]}>
        <View style={styles.rankBadge}>
          <Text style={[styles.rankText, { color: colors.textSecondary }, isTop3 && styles.topRankText]}>#{index + 1}</Text>
        </View>

        <Image
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, { color: colors.text }, isMe && { color: colors.primary }]}>
            {item.fullName} {isMe && '(Du)'}
          </Text>
          <Text style={[styles.levelText, { color: colors.textSecondary }]}>Level {item.level}</Text>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>{item.points} XP</Text>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    headerSubtitle: {
      color: '#E0E7FF',
      marginTop: 5,
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
      borderWidth: 1,
    },
    rankBadge: {
      width: 40,
      alignItems: 'center',
    },
    rankText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    topRankText: {
      color: '#F59E0B',
      fontSize: 20,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: '#E5E7EB',
    },
    infoContainer: {
      flex: 1,
    },
    nameText: {
      fontWeight: '600',
      fontSize: 16,
    },
    levelText: {
      fontSize: 12,
    },
    xpContainer: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    xpText: {
      color: '#D97706',
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primary]} style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Topplista</Text>
        <Text style={styles.headerSubtitle}>Vem leder ligan?</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Ingen data tillgänglig än.</Text>}
        />
      )}
    </View>
  );
};

export default LeaderboardScreen;
