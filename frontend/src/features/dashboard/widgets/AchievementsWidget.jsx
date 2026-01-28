import React from 'react';
import { Trophy, Medal, Star, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignSystem } from '../../../context/DesignSystemContext';

const AchievementsWidget = ({ currentUser }) => {
    const { t } = useTranslation();
    const { currentDesignSystem } = useDesignSystem();

    // Fallback data if user is loading or has no data
    const badges = currentUser?.earnedBadges || [];
    const level = currentUser?.level || 1;
    const points = currentUser?.points || 0;
    const nextLevelPoints = level * 100;
    const progress = Math.min((points / nextLevelPoints) * 100, 100);

    return (
        <div className="h-full w-full flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg dark:bg-yellow-900/30">
                        <Trophy size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">
                        {t('gamification.achievements', 'Mina Prestationer')}
                    </h3>
                </div>
                <div className="text-sm font-medium text-gray-500">
                    {badges.length} / 15 {t('gamification.unlocked', 'Upplåsta')}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">

                {/* Level Progress */}
                <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('gamification.level_title')}</span>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                {level}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold text-gray-500">{points} XP / {nextLevelPoints} XP</span>
                        </div>
                    </div>

                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {badges.length > 0 ? (
                        badges.map((badge, index) => (
                            <div
                                key={index}
                                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-default"
                                title={badge.description || badge.name}
                            >
                                <div className="mb-2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                                    {badge.iconUrl ? (
                                        <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8 object-contain" />
                                    ) : (
                                        <Medal size={24} className="text-yellow-500" />
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-center text-gray-700 dark:text-gray-300 line-clamp-1">
                                    {badge.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(badge.earnedAt || new Date()).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-4 text-gray-400 text-sm">
                            {t('gamification.no_badges')}
                        </div>
                    )}

                    {/* Placeholder for locked badges */}
                    {[...Array(Math.max(0, 3 - badges.length))].map((_, i) => (
                        <div key={`locked-${i}`} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 opacity-60">
                            <div className="mb-2 p-2 text-gray-300 dark:text-gray-600">
                                <Lock size={20} />
                            </div>
                            <span className="text-xs text-gray-400">{t('gamification.locked')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AchievementsWidget;
