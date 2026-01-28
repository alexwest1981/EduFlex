import { useState, useEffect } from 'react';
import { Zap, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';

const StudentGamificationWidget = ({ currentUser, isModuleActive }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState([]);
    const [userProgress, setUserProgress] = useState([]);
    const [userData, setUserData] = useState({ points: 0, level: 1 });

    useEffect(() => {
        if (!isModuleActive('GAMIFICATION') || !currentUser?.id) return;

        const fetchGamificationData = async () => {
            try {
                // Fetch user's current points/level
                const user = await api.users.getById(currentUser.id);
                setUserData({
                    points: user?.points || 0,
                    level: user?.level || 1
                });

                // Fetch achievements
                const [all, my] = await Promise.all([
                    api.get('/gamification/achievements').catch(() => []),
                    api.get('/gamification/achievements/my').catch(() => [])
                ]);
                setAchievements(all || []);
                setUserProgress(my || []);
            } catch (e) {
                console.error("Failed to load gamification data", e);
            }
        };

        fetchGamificationData();
    }, [currentUser?.id, isModuleActive]);

    if (!isModuleActive('GAMIFICATION')) return null;

    const pointsPerLevel = 100;
    const currentPoints = userData.points;
    const currentLevel = userData.level;
    const pointsInLevel = currentPoints % pointsPerLevel;
    const progressPercent = (pointsInLevel / pointsPerLevel) * 100;
    const pointsToNext = pointsPerLevel - pointsInLevel;

    // Get unlocked achievements for badge display
    const unlockedAchievements = userProgress.filter(ua => ua.unlocked);
    const displayBadges = unlockedAchievements.slice(0, 4).map(ua => {
        const achievement = achievements.find(a => a.id === ua.achievementId);
        return { ...ua, achievement };
    });

    return (
        <div className="h-full w-full relative overflow-hidden p-5">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Zap size={80} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t('gamification.level_title')}</p>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {currentLevel}
                            <span className="text-sm font-medium text-gray-400 bg-white dark:bg-[#3c4043] px-2 py-0.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">{t('gamification.student_rank')}</span>
                        </h2>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-500 dark:text-gray-400">{currentPoints} XP</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{t('gamification.points_to_next', { count: pointsToNext })}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-black/40 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* Mini Badge Gallery */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('gamification.my_badges')}</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {displayBadges.length > 0 ? (
                            displayBadges.map((item) => {
                                const achievement = item.achievement || {};
                                return (
                                    <div key={item.id} className="aspect-square rounded-xl bg-white dark:bg-[#3c4043] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-indigo-500" title={achievement.name}>
                                        {achievement.iconUrl ? (
                                            <span className="text-xl">{achievement.iconUrl}</span>
                                        ) : (
                                            <Award size={20} />
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-4 text-center py-2 text-xs text-gray-400 italic bg-white/50 dark:bg-black/20 rounded-lg">
                                {t('gamification.no_awards')}
                            </div>
                        )}
                        {/* Placeholder slots if few badges */}
                        {displayBadges.length > 0 && [...Array(Math.max(0, 4 - displayBadges.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                <Star size={14} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigate('/profile?tab=achievements')}
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]"
            >
                {t('gamification.view_all')}
            </button>
        </div>
    );
};

export default StudentGamificationWidget;
