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

    const theme = {
        STUDENT: {
            bg: 'from-blue-50/90 to-indigo-50/90',
            border: 'border-blue-200',
            text: 'text-blue-900',
            subtext: 'text-blue-700/80',
            heading: 'text-indigo-950',
            accent: 'text-blue-600',
            card: 'bg-white/50 border-blue-100',
            iconBg: 'bg-blue-100 text-blue-600',
            button: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
        },
        TEACHER: {
            bg: 'from-purple-50/90 to-pink-50/90',
            border: 'border-purple-200',
            text: 'text-purple-900',
            subtext: 'text-purple-700/80',
            heading: 'text-purple-950',
            accent: 'text-purple-600',
            card: 'bg-white/50 border-purple-100',
            iconBg: 'bg-purple-100 text-purple-600',
            button: 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'
        },
        PRINCIPAL: {
            bg: 'from-emerald-50/90 to-teal-50/90',
            border: 'border-emerald-200',
            text: 'text-emerald-900',
            subtext: 'text-emerald-700/80',
            heading: 'text-emerald-950',
            accent: 'text-emerald-600',
            card: 'bg-white/50 border-emerald-100',
            iconBg: 'bg-emerald-100 text-emerald-600',
            button: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
        },
        RECTOR: {
            bg: 'from-emerald-50/90 to-teal-50/90',
            border: 'border-emerald-200',
            text: 'text-emerald-900',
            subtext: 'text-emerald-700/80',
            heading: 'text-emerald-950',
            accent: 'text-emerald-600',
            card: 'bg-white/40 border-emerald-100',
            iconBg: 'bg-emerald-100 text-emerald-600',
            button: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
        },
    };

    const icons = {
        STUDENT: <Brain className="size-6" />,
        TEACHER: <Target className="size-6" />,
        PRINCIPAL: <TrendingUp className="size-6" />,
        RECTOR: <TrendingUp className="size-6" />,
    };

    const activeTheme = theme[role] || theme.STUDENT;

    if (loading) {
        return (
            <div className="glass-card p-6 rounded-3xl animate-pulse flex items-center gap-4 border border-slate-200">
                <div className="size-12 rounded-2xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                    <div className="h-4 w-2/3 bg-slate-200 rounded" />
                </div>
            </div>
        );
    }

    if (!insight) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-1 rounded-3xl border ${activeTheme.border} overflow-hidden shadow-xl shadow-slate-200/50`}
        >
            <div className={`p-5 rounded-[22px] bg-gradient-to-br ${activeTheme.bg} flex flex-col gap-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 ${activeTheme.iconBg} rounded-xl shadow-inner`}>
                            {icons[role]}
                        </div>
                        <div>
                            <h4 className={`font-bold ${activeTheme.heading} text-lg leading-tight`}>
                                {role === 'STUDENT' ? insight.welcomeMessage : role === 'TEACHER' ? 'Teacher Coach' : 'Principal Coach'}
                            </h4>
                            <span className={`text-xs ${activeTheme.subtext} font-medium flex items-center gap-1`}>
                                <Sparkles className="size-3" /> EduAI Insight
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`p-2 hover:bg-black/5 rounded-lg transition-colors ${activeTheme.accent}`}
                    >
                        <Info className="size-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {role === 'STUDENT' ? (
                        <>
                            <p className={`text-sm ${activeTheme.text} leading-relaxed font-medium`}>
                                {insight.studyRecommendation}
                            </p>
                            <div className={`${activeTheme.card} p-3.5 rounded-2xl border`}>
                                <p className={`text-[10px] ${activeTheme.subtext} uppercase font-black tracking-widest mb-1`}>Motivation</p>
                                <p className={`text-sm ${activeTheme.text} font-semibold`}>{insight.motivationTip}</p>
                            </div>
                        </>
                    ) : role === 'TEACHER' ? (
                        <>
                            <p className={`text-sm ${activeTheme.text} leading-relaxed font-semibold`}>
                                {insight.classSummary}
                            </p>
                            <div className={`${activeTheme.card} p-3.5 rounded-2xl border`}>
                                <p className={`text-[10px] ${activeTheme.subtext} uppercase font-black tracking-widest mb-2`}>Föreslagna Interventioner</p>
                                <ul className="space-y-1.5">
                                    {insight.interventions?.slice(0, 2).map((it, i) => (
                                        <li key={i} className={`text-xs ${activeTheme.text} font-medium flex gap-2 items-start`}>
                                            <span className={`${activeTheme.accent} mt-1`}>•</span> {it}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className={`text-sm ${activeTheme.text} leading-relaxed font-medium`}>
                                {insight.executiveSummary}
                            </p>
                            <div className={`${activeTheme.card} p-3.5 rounded-2xl border`}>
                                <p className={`text-[10px] ${activeTheme.subtext} uppercase font-black tracking-widest mb-1`}>Avvikelse-analys</p>
                                <p className={`text-sm ${activeTheme.text} font-bold`}>{insight.anomalyAlert}</p>
                            </div>
                        </>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 ${activeTheme.button} rounded-2xl font-black text-sm shadow-lg transition-all`}
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
                        className={`${activeTheme.bg} px-5 pb-5 pt-2`}
                    >
                        <hr className="border-black/5 mb-4" />
                        <div className="space-y-4">
                            {role === 'STUDENT' ? (
                                <p className={`text-xs ${activeTheme.subtext} leading-relaxed font-medium italic`}>
                                    Denna insikt baseras på dina senaste quiz-resultat, din XP-ligastatus och din föredragna lärstil.
                                </p>
                            ) : role === 'TEACHER' ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className={`text-[10px] ${activeTheme.subtext} font-black uppercase mb-1`}>Lektionstips:</p>
                                        <p className={`text-xs ${activeTheme.text} font-medium`}>{insight.pedagogicalTip}</p>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] ${activeTheme.subtext} font-black uppercase mb-1`}>Fokus-analys:</p>
                                        <p className={`text-xs ${activeTheme.text} font-medium`}>{insight.focusAnalysis}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <p className={`text-[10px] ${activeTheme.subtext} font-black uppercase mb-1`}>Strategiskt Råd:</p>
                                        <p className={`text-xs ${activeTheme.text} font-medium`}>{insight.strategicAdvice}</p>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] ${activeTheme.subtext} font-black uppercase mb-1`}>Trendanalys:</p>
                                        <p className={`text-xs ${activeTheme.text} font-medium`}>{insight.trendAnalysis}</p>
                                    </div>
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
