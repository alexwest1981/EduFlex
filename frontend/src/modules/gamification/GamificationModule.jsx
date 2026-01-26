import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Zap, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

// --- METADATA ---
export const GamificationModuleMetadata = {
    id: 'GAMIFICATION',
    name: 'Gamification Engine',
    version: '1.0.0',
    description: 'Engagera studenter med poäng, levlar och utmärkelser.',
    icon: Trophy,
    settingsKey: 'gamification_enabled',
    permissions: ['READ', 'WRITE']
};

// --- API HOOK (Hjälpfunktion) ---
// I en riktig app skulle detta ligga i api.js, men vi håller det modulärt här
const useGamification = (userId) => {
    const [stats, setStats] = useState({ points: 0, level: 1, badges: [] });

    useEffect(() => {
        if (!userId) return;
        // Vi simulerar ett anrop eller hämtar från user-objektet om backend skickar det
        // Om du uppdaterat User-controllern att returnera points/badges kan du ta dem direkt.
        // Annars, gör ett fetch-anrop här:
        /*
        fetch(`/api/users/${userId}/gamification`)
            .then(res => res.json())
            .then(data => setStats(data));
        */

        // För nu, låt oss anta att 'currentUser' redan har fälten vi lade till i Java
        // eller så mockar vi det snyggt så du ser resultatet direkt:
    }, [userId]);

    return stats;
};

// --- WIDGET: LEVEL PROGRESS ---
export const LevelProgressWidget = ({ user }) => {
    const { t } = useTranslation();

    // Räkna ut progress till nästa level (Level * 100 poäng)
    const currentPoints = user.points || 0;
    const currentLevel = user.level || 1;
    const pointsForNextLevel = currentLevel * 100;
    const progressPercent = Math.min(100, Math.max(0, (currentPoints % 100) / 100 * 100)); // Enkel logik: 0-99 progress per level

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden animate-in fade-in">
            {/* Dekorativ bakgrund */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>

            <div className="flex justify-between items-end mb-2 relative z-10">
                <div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t('gamification.level_title')}</p>
                    <h3 className="text-4xl font-black">{currentLevel}</h3>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold flex items-center justify-end gap-2">
                        <Zap size={20} className="text-yellow-300 fill-yellow-300" /> {currentPoints}
                    </p>
                    <p className="text-xs text-indigo-200">{pointsForNextLevel - (currentPoints % 100)} {t('gamification.points_to_next')}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 mt-4">
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <p className="text-[10px] text-center mt-1 text-indigo-200 font-mono">{progressPercent.toFixed(0)}% EXP</p>
            </div>
        </div>
    );
};

// --- WIDGET: BADGE SHOWCASE ---
export const BadgeShowcaseWidget = ({ userBadges = [] }) => {
    const { t } = useTranslation();

    // Exempel-badges om listan är tom (för demo)
    const displayBadges = userBadges.length > 0 ? userBadges : [
        { id: 1, name: 'Newbie', icon: 'FLAG', earned: true, desc: 'Skapade ett konto' },
        { id: 2, name: 'Quiz Master', icon: 'TROPHY', earned: false, desc: 'Få alla rätt på ett prov' },
        { id: 3, name: 'Bookworm', icon: 'BOOK', earned: false, desc: 'Läs 5 dokument' }
    ];

    const getIcon = (key) => {
        switch (key) {
            case 'TROPHY': return <Trophy size={20} />;
            case 'FLAG': return <Star size={20} />;
            case 'BOOK': return <Award size={20} />;
            default: return <Award size={20} />;
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] p-6 animate-in fade-in">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <Award size={20} className="text-purple-500" /> {t('gamification.my_badges')}
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {displayBadges.map((b, idx) => (
                    <div key={idx} className={`flex flex-col items-center min-w-[80px] group ${b.earned ? '' : 'opacity-40 grayscale'}`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-sm transition-transform group-hover:scale-110 ${b.earned ? 'bg-gradient-to-br from-yellow-100 to-amber-200 text-amber-700' : 'bg-gray-100 dark:bg-[#282a2c] text-gray-400'}`}>
                            {b.earned ? getIcon(b.icon) : <Lock size={18} />}
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">{b.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Default export ifall vi vill använda den som en sida senare
const GamificationModule = () => {
    return null;
};

export default GamificationModule;
