import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../services/api';

const LeagueStatusWidget = () => {
    const [leagueData, setLeagueData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeague = async () => {
            try {
                const data = await api.get('/gamification/league/my');
                setLeagueData(data);
            } catch (e) {
                console.error("Failed to load league data", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeague();
    }, []);

    if (isLoading) return <div className="animate-pulse bg-white/20 h-40 rounded-2xl" />;
    if (!leagueData) return null;

    const { current, displayName, icon, nextThreshold, nextLeague, xp } = leagueData;

    // Calculate progress to next league
    const currentLeagueMin = 0; // Simplified for UI
    const progressToNext = nextThreshold > 0
        ? Math.min(100, Math.max(0, (xp / nextThreshold) * 100))
        : 100;

    const getLeagueColor = (league) => {
        switch (league) {
            case 'RUBY': return 'from-rose-500 to-red-600';
            case 'PLATINUM': return 'from-cyan-400 to-blue-500';
            case 'GOLD': return 'from-amber-400 to-yellow-600';
            case 'SILVER': return 'from-slate-300 to-gray-500';
            default: return 'from-orange-400 to-orange-600';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl p-6 group"
        >
            {/* Animated Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${getLeagueColor(current)} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700`} />

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getLeagueColor(current)} flex items-center justify-center text-4xl shadow-lg shadow-black/10 transform group-hover:scale-110 transition-transform duration-500`}>
                        {icon || '🏆'}
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 opacity-80">Din Aktuella Liga</span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">
                            {displayName}
                        </h3>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-500 animate-pulse" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {xp} <span className="text-[10px] font-medium opacity-60">TOTAL XP</span>
                            </span>
                        </div>
                        {nextThreshold > 0 && (
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">
                                {nextThreshold - xp} XP kvar till {nextLeague}
                            </span>
                        )}
                    </div>

                    <div className="h-3 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden border border-white/10 p-[2px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNext}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${getLeagueColor(current)} shadow-[0_0_15px_rgba(255,255,255,0.3)] relative`}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                        </motion.div>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <span>Liganivå {current}</span>
                        <div className="flex items-center gap-1">
                            <TrendingUp size={10} />
                            <span>Håll tempot uppe!</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LeagueStatusWidget;
