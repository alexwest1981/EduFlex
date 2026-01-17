import React, { useEffect } from 'react';
import { Award, X } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';

const AchievementToast = () => {
    const { achievementNotification, dismissNotification } = useGamification();

    useEffect(() => {
        if (achievementNotification) {
            const timer = setTimeout(() => {
                dismissNotification();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [achievementNotification, dismissNotification]);

    if (!achievementNotification) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-gray-900 border-2 border-yellow-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px] relative overflow-hidden">
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] animate-shine pointer-events-none"></div>

                <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500 border border-yellow-500/50">
                    <Award size={32} />
                </div>

                <div className="flex-1">
                    <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-0.5">Achievement Unlocked</p>
                    <h4 className="font-bold text-lg leading-tight">{achievementNotification.name}</h4>
                    <p className="text-sm text-gray-300 mt-1">+{achievementNotification.xpReward} XP</p>
                </div>

                <button
                    onClick={dismissNotification}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default AchievementToast;
