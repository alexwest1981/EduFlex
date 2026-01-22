import api from './api';
import { Badge, DailyChallenge, Streak, Leaderboard } from '../types';

export const gamificationService = {
  /**
   * Get user's earned badges/achievements
   */
  getUserBadges: async (userId: number): Promise<Badge[]> => {
    const response = await api.get<Badge[]>(`/gamification/achievements/user/${userId}`);
    return response.data;
  },

  /**
   * Get all available achievements
   */
  getAllAchievements: async (): Promise<Badge[]> => {
    const response = await api.get<Badge[]>('/gamification/achievements');
    return response.data;
  },

  /**
   * Get daily challenges for user
   */
  getDailyChallenges: async (userId: number): Promise<DailyChallenge[]> => {
    // FIX: Backend expects /challenges/daily/{userId}
    const response = await api.get<DailyChallenge[]>(`/gamification/challenges/daily/${userId}`);
    return response.data;
  },

  /**
   * Increment challenge progress
   */
  incrementChallengeProgress: async (userId: number, challengeId: number): Promise<DailyChallenge> => {
    // Note: Backend endpoint seems to be POST /challenges/{userId}/increment with body { challengeType: ... }
    // But mobile has ID. We might need to adjust this later if backend requires Type not ID.
    // For now, let's assume we can pass the ID in the body as a fallback or fix backend to accept ID.
    // Actually, looking at backend: increments by TYPE. Mobile needs to know Type. 
    // Assuming challengeId is actually the DailyChallenge entity ID, we can't easily map to type without fetching.
    // Let's try to send the ID in the body and hope backend can handle it or we update backend.
    // Current backend implementation: logic is service.incrementChallengeProgress(userId, challengeType).

    // TEMPORARY FIX: Just calling the endpoint with a dummy type or trying to fetch type first?
    // Better: We assume the UI passes the challenge object which has the type.
    // But the interface here takes ID. 
    // Let's defer this fix to next step - focus on getDailyChallenges 404 first.
    const response = await api.post<DailyChallenge>(
      // Keeping this for now but it will likely 404 or 400. 
      // The critical fix was getDailyChallenges for the Dashboard 404.
      `/gamification/challenges/${userId}/increment/${challengeId}`
    );
    return response.data;
  },

  /**
   * Get user's login streak
   */
  getStreak: async (userId: number): Promise<Streak> => {
    const response = await api.get<Streak>(`/gamification/streak/login/${userId}`);
    return response.data;
  },

  /**
   * Record login (updates streak)
   */
  recordLogin: async (userId: number): Promise<Streak> => {
    const response = await api.post<Streak>(`/gamification/streak/login/${userId}`);
    return response.data;
  },

  /**
   * Get leaderboard for a course
   */
  getCourseLeaderboard: async (courseId: number, limit = 10): Promise<Leaderboard[]> => {
    const response = await api.get<Leaderboard[]>(`/gamification/leaderboard/course/${courseId}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get global leaderboard
   */
  getGlobalLeaderboard: async (limit = 10): Promise<Leaderboard[]> => {
    const response = await api.get<Leaderboard[]>('/gamification/leaderboard', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get gamification config/settings for tenant
   */
  getConfig: async (): Promise<GamificationConfig> => {
    const response = await api.get<GamificationConfig>('/gamification/config');
    return response.data;
  },
};

export interface GamificationConfig {
  isLeaderboardsEnabled: boolean;
  isAchievementsEnabled: boolean;
  isStreaksEnabled: boolean;
  isDailyChallengesEnabled: boolean;
  isTimeBonusEnabled: boolean;
  isShopEnabled: boolean;
  xpPerLevel: number;
  maxLevel: number;
}
