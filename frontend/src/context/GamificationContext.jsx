import React, { createContext, useContext, useState, useEffect } from 'react';
import { useModules } from './ModuleContext';
import { api } from '../services/api';

const GamificationContext = createContext();

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within GamificationProvider');
    }
    return context;
};

export const GamificationProvider = ({ children }) => {
    const { isModuleActive } = useModules();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUnlockedIds, setLastUnlockedIds] = useState([]);
    const [notificationQueue, setNotificationQueue] = useState([]);

    useEffect(() => {
        // Poll for achievements if enabled
        if (isModuleActive('GAMIFICATION')) {
            const pollAchievements = async () => {
                try {
                    const myAchievements = await api.get('/gamification/achievements/my');
                    if (myAchievements && Array.isArray(myAchievements)) {
                        const unlocked = myAchievements.filter(a => a.unlocked);
                        const currentIds = unlocked.map(a => a.achievementId);

                        // First load: just sync state, don't notify regarding old achievements
                        setLastUnlockedIds(prev => {
                            if (prev.length === 0 && currentIds.length > 0) return currentIds;

                            // Check for new IDs
                            const newIds = currentIds.filter(id => !prev.includes(id));
                            if (newIds.length > 0) {
                                // Find achievement details for notification
                                // We might need to fetch full achievement details or rely on what's in 'myAchievements'
                                // Assuming 'myAchievements' includes 'achievement' object thanks to @ManyToOne
                                newIds.forEach(id => {
                                    const ua = unlocked.find(u => u.achievementId === id);
                                    if (ua && ua.achievement) {
                                        setNotificationQueue(q => [...q, ua.achievement]);
                                    }
                                });
                            }
                            return currentIds;
                        });
                    }
                } catch (e) {
                    console.error("Polling achievements failed", e);
                }
            };

            // Initial check
            pollAchievements();

            // Poll every 60s
            const interval = setInterval(pollAchievements, 60000);
            return () => clearInterval(interval);
        }
    }, [isModuleActive]);

    useEffect(() => {
        // Only fetch config if module is active
        if (isModuleActive('GAMIFICATION')) {
            fetchGamificationConfig();
        } else {
            setLoading(false);
        }
    }, [isModuleActive]);

    const fetchGamificationConfig = React.useCallback(async () => {
        try {
            const data = await api.gamification.getConfig();
            setConfig(data);
        } catch (error) {
            console.error('Failed to fetch gamification config:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Gamification is enabled if:
    // 1. Module is active in system modules panel
    // 2. Config enabled is true (optional, defaults to module status)
    const moduleActive = isModuleActive('GAMIFICATION');
    const configEnabled = config?.enabled !== false; // Default to true if config doesn't exist
    const isEnabled = React.useMemo(() => moduleActive && configEnabled, [moduleActive, configEnabled]);

    const value = React.useMemo(() => ({
        isEnabled,
        config,
        loading,
        refreshConfig: fetchGamificationConfig,

        // Feature flags - all require main toggle to be on
        isLeaderboardsEnabled: isEnabled && (config?.leaderboardsEnabled !== false),
        isAchievementsEnabled: isEnabled && (config?.achievementsEnabled !== false),
        isStreaksEnabled: isEnabled && (config?.streaksEnabled !== false),
        isDailyChallengesEnabled: isEnabled && (config?.dailyChallengesEnabled !== false),
        isTimeBonusEnabled: isEnabled && (config?.timeBonusEnabled !== false),
        isShopEnabled: isEnabled && (config?.shopEnabled === true),

        // Limits
        xpMultiplierMax: config?.xpMultiplierMax || 5,

        // Notifications
        achievementNotification: notificationQueue.length > 0 ? notificationQueue[0] : null,
        dismissNotification: () => setNotificationQueue(q => q.slice(1))
    }), [isEnabled, config, loading, fetchGamificationConfig, notificationQueue]);

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};
