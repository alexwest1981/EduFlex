import React from 'react';
import { Zap, Award, Trophy, Star, Flag, Clock } from 'lucide-react';

const StudentStats = ({ currentUser, isModuleActive }) => {
    // Om gamification är avstängt, visa inget
    if (!isModuleActive('GAMIFICATION')) return null;

    // Logik
    const pointsPerLevel = 100;
    const currentPoints = currentUser?.points || 0;
    const currentLevel = currentUser?.level || 1;
    const pointsInLevel = currentPoints % pointsPerLevel;
    const progressPercent = (pointsInLevel / pointsPerLevel) * 100;
    const pointsToNext = pointsPerLevel - pointsInLevel;

    const getBadgeIcon = (iconKey) => {
        switch (iconKey) {
            case 'TROPHY': return <Trophy size={24} className="text-amber-500" />;
            case 'STAR': return <Star size={24} className="text-yellow-400" />;
            case 'FLAG': return <Flag size={24} className="text-blue-500" />;
            case 'CLOCK': return <Clock size={24} className="text-purple-500" />;
            default: return <Award size={24} className="text-indigo-500" />;
        }
    };

    return (
        <div className="space-y-6 mb-8 animate-in slide-in-from-top-4">
            {/* LEVEL CARD */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={120} /></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Nuvarande Nivå</p>
                            <h2 className="text-5xl font-black mt-1">{currentLevel}</h2>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end text-yellow-300 font-bold text-xl">
                                <Zap fill="currentColor" /> {currentPoints}
                            </div>
                            <p className="text-indigo-100 text-xs mt-1">{pointsToNext} poäng till nästa nivå</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden backdrop-blur-sm relative">
                        <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* BADGES SCROLLER */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="text-indigo-500" size={20}/> Mina Utmärkelser
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {currentUser?.earnedBadges && currentUser.earnedBadges.length > 0 ? (
                        currentUser.earnedBadges.map((userBadge) => (
                            <div key={userBadge.id} className="flex flex-col items-center min-w-[100px] p-3 rounded-xl bg-gray-50 dark:bg-[#282a2c] border border-gray-100 dark:border-[#3c4043] hover:shadow-md transition-all">
                                <div className="bg-white dark:bg-[#131314] p-3 rounded-full shadow-sm mb-2">{getBadgeIcon(userBadge.badge?.iconKey)}</div>
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center">{userBadge.badge?.name}</span>
                                <span className="text-[10px] text-gray-500 text-center line-clamp-1">{userBadge.badge?.description}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 text-sm italic w-full text-center py-4 border-2 border-dashed border-gray-100 dark:border-[#3c4043] rounded-xl">
                            Du har inga utmärkelser än. Gör klart uppgifter för att samla!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentStats;
