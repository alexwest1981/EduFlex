import React from 'react';
import { Flame, Clock, Trophy } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';

const XPBoostIndicator = ({ assignment }) => {
    const { isEnabled } = useGamification();

    // Don't show if gamification is disabled
    if (!isEnabled || !assignment) return null;

    const hasBoost = assignment.xpMultiplier > 1.0;
    const hasTimeBonus = assignment.timeBonusMinutes && assignment.timeBonusXp;

    if (!hasBoost && !hasTimeBonus) return null;

    const totalXP = Math.round((assignment.xpReward || 100) * (assignment.xpMultiplier || 1.0));
    const bonusXP = hasTimeBonus ? assignment.timeBonusXp : 0;
    const maxXP = totalXP + bonusXP;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* XP Boost Badge */}
            {hasBoost && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-orange-500/30">
                    <Flame size={16} className="animate-pulse" />
                    <span className="font-bold text-sm">{assignment.xpMultiplier}x XP</span>
                </div>
            )}

            {/* Time Bonus Badge */}
            {hasTimeBonus && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-purple-500/30">
                    <Clock size={16} />
                    <span className="font-bold text-sm">+{bonusXP} XP</span>
                    <span className="text-xs opacity-90">({assignment.timeBonusMinutes} min)</span>
                </div>
            )}

            {/* Total XP Display */}
            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                <Trophy size={16} />
                <span className="font-bold text-sm">
                    {hasTimeBonus ? `${totalXP}-${maxXP}` : totalXP} XP
                </span>
            </div>
        </div>
    );
};

export default XPBoostIndicator;
