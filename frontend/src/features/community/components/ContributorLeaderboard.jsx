import React, { useState, useEffect } from 'react';
import {
    Trophy, Award, Star, Download,
    BookOpen, ChevronRight, User, Loader2, Sparkles,
    TrendingUp
} from 'lucide-react';
import { api } from '../../../services/api';

const ContributorLeaderboard = ({ onSelectAuthor }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const data = await api.community.getLeaderboard();
            setLeaderboard(data || []);
        } catch (err) {
            console.error('Failed to load leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center bg-white dark:bg-[#1E1F20] rounded-3xl border border-gray-100 dark:border-transparent">
                <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
                <p className="text-sm text-gray-500">Hämtar topplistan...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-gray-100 dark:border-transparent shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-50 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/5 dark:to-purple-900/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-amber-500" size={20} />
                        <h3 className="font-bold text-gray-900 dark:text-white">EduFlex Champions</h3>
                    </div>
                    <Sparkles className="text-indigo-400" size={16} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Topp-pedagoger i communityt</p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px]">
                {leaderboard.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {leaderboard.map((contributor, index) => (
                            <button
                                key={contributor.userId}
                                onClick={() => onSelectAuthor(contributor.userId)}
                                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors group text-left"
                            >
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-xl overflow-hidden shadow-sm ${index === 0 ? 'ring-2 ring-amber-400' :
                                            index === 1 ? 'ring-2 ring-gray-300' :
                                                index === 2 ? 'ring-2 ring-amber-600/50' : ''
                                        }`}>
                                        {contributor.profilePictureUrl ? (
                                            <img
                                                src={contributor.profilePictureUrl}
                                                alt={contributor.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-[#282a2c] flex items-center justify-center text-gray-400 text-xs">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    {index < 3 && (
                                        <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${index === 0 ? 'bg-amber-400' :
                                                index === 1 ? 'bg-gray-300' : 'bg-amber-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1">
                                        {contributor.name}
                                        {index === 0 && <Award size={14} className="text-amber-500" />}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                        <span className="flex items-center gap-0.5">
                                            <BookOpen size={10} /> {contributor.resourceCount}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <Download size={10} /> {contributor.downloadCount}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <Star size={10} className="text-amber-400" /> {contributor.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                        {contributor.score}
                                    </div>
                                    <div className="text-[10px] text-gray-400">XP</div>
                                </div>

                                <ChevronRight className="text-gray-200 group-hover:text-indigo-500 transition-colors" size={16} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400 italic text-sm">
                        Inga aktiva bidragsgivare än.
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-50 dark:border-gray-800">
                <button className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center justify-center gap-1 bg-white dark:bg-[#282a2c] rounded-xl shadow-sm border border-gray-100 dark:border-transparent">
                    <TrendingUp size={12} />
                    Hur beräknas rankningen?
                </button>
            </div>
        </div>
    );
};

export default ContributorLeaderboard;
