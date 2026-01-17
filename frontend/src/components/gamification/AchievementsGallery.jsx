import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Award, Lock, Star, Shield, Zap, BookOpen, Users, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AchievementsGallery = ({ currentUser }) => {
    const { t } = useTranslation();
    const [achievements, setAchievements] = useState([]);
    const [userProgress, setUserProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all system achievements
                const all = await api.get('/gamification/achievements');

                // Fetch user's progress
                let my = [];
                try {
                    my = await api.get('/gamification/achievements/my');
                } catch (e) {
                    console.warn("Could not fetch user achievements", e);
                }

                setAchievements(all || []);
                setUserProgress(my || []);
            } catch (err) {
                console.error("Failed to load achievements", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const getIcon = (iconName) => {
        // Map icon strings to Lucide icons
        const icons = {
            '✨': <Star size={24} />,
            '📚': <BookOpen size={24} />,
            '🔥': <Zap size={24} />,
            '👋': <Users size={24} />,
            '🌙': <Clock size={24} />,
            'default': <Award size={24} />
        };
        // If it's an emoji (length 1-2), render as text, else component
        if (iconName && iconName.length < 5) return <span className="text-2xl">{iconName}</span>;
        return icons[iconName] || icons['default'];
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 'COMMON': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
            case 'RARE': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'EPIC': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            case 'LEGENDARY': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Laddar achievements...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <Award className="text-yellow-500" /> Prestationer
                </h3>
                <div className="text-sm text-gray-500">
                    {userProgress.filter(ua => ua.unlocked).length} / {achievements.length} Upplåsta
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(achievement => {
                    const progress = userProgress.find(ua => ua.achievementId === achievement.id);
                    const isUnlocked = progress?.unlocked;
                    const tierClass = getTierColor(achievement.tier);

                    return (
                        <div
                            key={achievement.id}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isUnlocked
                                    ? `border-transparent shadow-sm ${tierClass}` // Unlocked style
                                    : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131314] opacity-70 grayscale' // Locked style
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className={`p-3 rounded-full bg-white dark:bg-[#1E1F20] shadow-sm ${isUnlocked ? '' : 'opacity-50'}`}>
                                    {getIcon(achievement.iconUrl)}
                                </div>
                                <div className="text-xs font-bold px-2 py-1 rounded bg-white/50 dark:bg-black/20">
                                    {achievement.xpReward} XP
                                </div>
                            </div>

                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{achievement.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>

                            {!isUnlocked && (
                                <div className="absolute top-4 right-4 text-gray-400">
                                    <Lock size={16} />
                                </div>
                            )}

                            {/* Optional Progress Bar if we track partial progress */}
                            {progress && !isUnlocked && progress.progress > 0 && (
                                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-indigo-500 h-1.5 rounded-full"
                                        style={{ width: `${Math.min(100, progress.progress)}%` }} // Need to normalize progress based on criteria logic if complex
                                    ></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsGallery;
