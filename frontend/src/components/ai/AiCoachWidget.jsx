import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Target, TrendingUp, Info } from 'lucide-react';
import { api } from '../../services/api';

const AiCoachWidget = ({ role, courseId }) => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            setLoading(true);
            try {
                let data;
                if (role === 'STUDENT') {
                    data = await api.aiCoach.getStudentInsight();
                } else if (role === 'TEACHER' && courseId) {
                    data = await api.aiCoach.getTeacherInsight(courseId);
                } else if (role === 'PRINCIPAL' || role === 'RECTOR') {
                    data = await api.aiCoach.getPrincipalInsight();
                }
                setInsight(data);
            } catch (error) {
                console.error('Failed to fetch AI coach insight:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [role, courseId]);

    const colors = {
        STUDENT: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
        TEACHER: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
        PRINCIPAL: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
        RECTOR: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    };

    const icons = {
        STUDENT: <Brain className="size-6" />,
        TEACHER: <Target className="size-6" />,
        PRINCIPAL: <TrendingUp className="size-6" />,
        RECTOR: <TrendingUp className="size-6" />,
    };

    const gradient = colors[role] || colors.STUDENT;

    if (loading) {
        return (
            <div className="glass-card p-6 rounded-3xl animate-pulse flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-slate-700/50" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-slate-700/50 rounded" />
                    <div className="h-4 w-2/3 bg-slate-700/50 rounded" />
                </div>
            </div>
        );
    }

    if (!insight) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-1 rounded-3xl border ${gradient.split(' ').pop()} overflow-hidden`}
        >
            <div className={`p-5 rounded-[22px] bg-gradient-to-br ${gradient} flex flex-col gap-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                            {icons[role]}
                        </div>
                        <div>
                            <h4 className="font-bold text-white leading-tight">
                                {role === 'STUDENT' ? insight.welcomeMessage : role === 'TEACHER' ? 'Teacher Coach' : 'Principal Coach'}
                            </h4>
                            <span className="text-xs opacity-70 flex items-center gap-1">
                                <Sparkles className="size-3" /> EduAI Insight
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Info className="size-5 text-white/70" />
                    </button>
                </div>

                <div className="space-y-3">
                    {role === 'STUDENT' ? (
                        <>
                            <p className="text-sm text-white/90 leading-relaxed font-medium">
                                {insight.studyRecommendation}
                            </p>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Motivation</p>
                                <p className="text-sm text-white">{insight.motivationTip}</p>
                            </div>
                        </>
                    ) : role === 'TEACHER' ? (
                        <>
                            <p className="text-sm text-white/90 leading-relaxed font-medium">
                                {insight.classSummary}
                            </p>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                                <p className="text-xs text-white/70 uppercase tracking-wider mb-2">Interventioner</p>
                                <ul className="space-y-1">
                                    {insight.interventions?.slice(0, 2).map((it, i) => (
                                        <li key={i} className="text-xs text-white flex gap-2">
                                            <span className="text-purple-400">•</span> {it}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-white/90 leading-relaxed font-medium">
                                {insight.executiveSummary}
                            </p>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Avvikelse-analys</p>
                                <p className="text-sm text-white">{insight.anomalyAlert}</p>
                            </div>
                        </>
                    )}
                </div>

                <motion.button
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl shadow-white/10"
                >
                    {role === 'STUDENT' ? insight.quickAction : 'Se full analys'}
                    <ArrowRight className="size-4" />
                </motion.button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 pt-2"
                    >
                        <hr className="border-white/10 mb-4" />
                        <div className="space-y-4">
                            {role === 'STUDENT' ? (
                                <p className="text-xs text-white/60">
                                    Denna insikt baseras på dina senaste quiz-resultat, din XP-ligastatus och din föredragna lärstil.
                                </p>
                            ) : role === 'TEACHER' ? (
                                <div>
                                    <p className="text-xs text-white/70 font-semibold mb-2">Lektionstips:</p>
                                    <p className="text-xs text-white/60">{insight.pedagogicalTip}</p>
                                    <p className="text-xs text-white/70 font-semibold mt-3 mb-2">Fokus-analys:</p>
                                    <p className="text-xs text-white/60">{insight.focusAnalysis}</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-white/70 font-semibold mb-2">Strategiskt Råd:</p>
                                    <p className="text-xs text-white/60">{insight.strategicAdvice}</p>
                                    <p className="text-xs text-white/70 font-semibold mt-3 mb-2">Trendanalys:</p>
                                    <p className="text-xs text-white/60">{insight.trendAnalysis}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AiCoachWidget;
