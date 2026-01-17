import React, { useState, useEffect } from 'react';
import { Target, Flame, Trophy, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { gamificationAPI } from '../../services/gamificationAPI';
import { useAppContext } from '../../context/AppContext';
import { useGamification } from '../../context/GamificationContext';

const DailyChallengesWidget = () => {
    const { currentUser } = useAppContext();
    const { isEnabled, isDailyChallengesEnabled } = useGamification();
    const [challenges, setChallenges] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.id && isEnabled && isDailyChallengesEnabled) {
            fetchDailyChallenges();
        } else {
            setLoading(false);
        }
    }, [currentUser, isEnabled, isDailyChallengesEnabled]);

    const fetchDailyChallenges = async () => {
        try {
            const [challengesData, streakData] = await Promise.all([
                gamificationAPI.getDailyChallenges(currentUser.id),
                gamificationAPI.getLoginStreak(currentUser.id)
            ]);

            const mappedChallenges = (challengesData || []).map(challenge => ({
                ...challenge,
                progress: challenge.currentProgress || 0,
                target: challenge.targetValue || 1,
                icon: getIconType(challenge.challengeType)
            }));

            setChallenges(mappedChallenges);
            setStreak(streakData?.streak || 0);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch daily challenges:', error);
            setChallenges([]);
            setStreak(0);
            setLoading(false);
        }
    };

    const getIconType = (challengeType) => {
        switch (challengeType) {
            case 'COMPLETE_ASSIGNMENTS': return 'target';
            case 'HIGH_SCORE': return 'trophy';
            case 'LOGIN_STREAK': return 'flame';
            default: return 'target';
        }
    };

    const getIcon = (iconType) => {
        switch (iconType) {
            case 'target': return <Target size={20} />;
            case 'trophy': return <Trophy size={20} />;
            case 'flame': return <Flame size={20} />;
            default: return <Target size={20} />;
        }
    };

    const getProgressPercentage = (progress, target) => {
        return Math.min((progress / target) * 100, 100);
    };

    // Don't render if gamification is disabled
    if (!isEnabled || !isDailyChallengesEnabled) {
        return null;
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl">
                        <Target className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dagens Utmaningar</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Slutför för att tjäna XP</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-xl">
                    <Flame className="text-orange-500" size={20} />
                    <span className="font-bold text-orange-600 dark:text-orange-400">{streak} dagar</span>
                </div>
            </div>

            <div className="space-y-3">
                {challenges.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>Inga utmaningar tillgängliga än</p>
                    </div>
                ) : (
                    challenges.map((challenge) => {
                        const progressPercent = getProgressPercentage(challenge.progress, challenge.target);
                        const isCompleted = challenge.completed || challenge.progress >= challenge.target;

                        return (
                            <div
                                key={challenge.id}
                                className={`relative p-4 rounded-xl border-2 transition-all ${isCompleted
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${isCompleted
                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                                        }`}>
                                        {isCompleted ? <CheckCircle size={20} /> : getIcon(challenge.icon)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {challenge.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {challenge.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
                                                <TrendingUp size={12} className="text-amber-600 dark:text-amber-400" />
                                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                    +{challenge.xpReward} XP
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {challenge.progress} / {challenge.target}
                                                </span>
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                    {Math.round(progressPercent)}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${isCompleted
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                                        }`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isCompleted && (
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            ✓ Klar
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={16} />
                    <span>Nya utmaningar om {24 - new Date().getHours()}h {60 - new Date().getMinutes()}m</span>
                </div>
            </div>
        </div>
    );
};

export default DailyChallengesWidget;
