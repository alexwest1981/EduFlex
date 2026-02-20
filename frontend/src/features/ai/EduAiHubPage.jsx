import React, { useState, useEffect } from 'react';
import {
    Brain, Sparkles, Zap, Target,
    TrendingUp, Calendar, Trophy,
    Star, ArrowRight, Play, Gamepad2,
    Shield, Activity, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import HubReviewDeck from './components/HubReviewDeck';

const IntelligenceBar = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
            { label: 'Kunskaps-kö', val: stats.queueSize, icon: Brain, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
            { label: 'AI Credits', val: stats.aiCredits || 0, icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'XP Multiplier', val: `${stats.xpMultiplier}x`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { label: 'Mastery Score', val: '84%', icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' }
        ].map((item, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${item.bg} p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group`}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-3 rounded-2xl bg-white dark:bg-black/20 ${item.color} shadow-sm`}>
                        <item.icon size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                        <p className={`text-2xl font-black ${item.color} leading-none`}>{item.val}</p>
                    </div>
                </div>
            </motion.div>
        ))}
    </div>
);

const MiniGameTile = ({ title, icon: Icon, color, xp, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-[#1C1D1E] p-6 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-xl group cursor-pointer relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 ${color}/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2`}></div>

        <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center ${color.replace('bg-', 'text-')} mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={32} />
        </div>

        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed font-medium">{description}</p>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                <Star size={14} fill="currentColor" />
                <span className="text-[10px] font-black">{xp} XP</span>
            </div>
            <div className="text-gray-400 group-hover:text-brand-orange transition-colors">
                <ArrowRight size={20} />
            </div>
        </div>
    </motion.div>
);

const EduAiHubPage = () => {
    const [stats, setStats] = useState({ queueSize: 0, xpMultiplier: '1.0' });
    const [isReviewing, setIsReviewing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.ai.getHubStats();
            setStats(data || { queueSize: 0, xpMultiplier: '1.0' });
        } catch (err) {
            console.error("Failed to fetch hub stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (isReviewing) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                <HubReviewDeck onComplete={() => {
                    setIsReviewing(false);
                    fetchStats();
                }} />
                <button
                    onClick={() => setIsReviewing(false)}
                    className="mt-8 text-gray-500 hover:text-brand-orange font-bold text-xs uppercase tracking-widest transition-colors"
                >
                    Avbryt Session
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-brand-orange/10 p-2 rounded-lg text-brand-orange">
                            <Sparkles size={20} />
                        </div>
                        <span className="text-brand-orange font-black uppercase tracking-[0.3em] text-[10px]">Intelligence Center v2.0</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">EduAI Hub</h1>
                </div>

                <div className="flex gap-4">
                    <button className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all">
                        <Info size={18} />
                        Hur fungerar det?
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <IntelligenceBar stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Action: Daily Review */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group"
                    >
                        {/* Background Visuals */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <h2 className="text-4xl font-black mb-4 leading-tight">Dags för din <br /> Daily Review?</h2>
                                <p className="text-indigo-100 text-lg mb-8 font-medium leading-relaxed opacity-80">
                                    {stats.queueSize > 0
                                        ? `Du har ${stats.queueSize} koncept som väntar på din uppmärksamhet. Optimera ditt minne med SM-2.`
                                        : 'Snyggt jobbat! Du har inga objekt som behöver repeteras just nu.'}
                                </p>

                                <button
                                    onClick={() => setIsReviewing(true)}
                                    disabled={stats.queueSize === 0}
                                    className={`
                                        flex items-center gap-3 px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-2xl relative overflow-hidden
                                        ${stats.queueSize > 0
                                            ? 'bg-brand-orange text-white hover:brightness-110 shadow-brand-orange/40 active:scale-95'
                                            : 'bg-white/10 text-white/50 cursor-not-allowed shadow-none'}
                                    `}
                                >
                                    <Play size={20} fill="currentColor" />
                                    Starta Session
                                </button>
                            </div>

                            <div className="w-64 h-64 relative flex items-center justify-center animate-spin-slow">
                                <div className="absolute inset-0 border-4 border-dashed border-white/20 rounded-full"></div>
                                <div className="absolute inset-4 border-2 border-indigo-400/30 rounded-full"></div>
                                <Brain size={80} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />

                                {/* Orbiting Dots */}
                                {[0, 120, 240].map((deg) => (
                                    <div
                                        key={deg}
                                        className="absolute w-4 h-4 bg-brand-orange rounded-full shadow-[0_0_15px_rgba(255,102,0,1)]"
                                        style={{ transform: `rotate(${deg}deg) translateX(128px)` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Radar Mockup / Mastery Widget */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-[48px] p-8 border border-gray-100 dark:border-white/10 h-full shadow-xl flex flex-col">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-gray-900 dark:text-white uppercase tracking-tight">
                            <Activity size={20} className="text-brand-orange" />
                            Kunskaps-radar
                        </h3>

                        <div className="flex-1 flex items-center justify-center relative">
                            {/* SVG Radar */}
                            <svg viewBox="0 0 100 100" className="w-full h-full max-w-[200px]">
                                {[0.2, 0.4, 0.6, 0.8, 1.0].map(r => (
                                    <circle key={r} cx="50" cy="50" r={45 * r} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-100 dark:text-white/5" />
                                ))}

                                {/* Axes */}
                                {[0, 72, 144, 216, 288].map(deg => {
                                    const x = 50 + 45 * Math.cos((deg - 90) * Math.PI / 180);
                                    const y = 50 + 45 * Math.sin((deg - 90) * Math.PI / 180);
                                    return <line key={deg} x1="50" y1="50" x2={x} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-gray-100 dark:text-white/5" />;
                                })}

                                {/* Mastery Shape */}
                                <polygon
                                    points="50,25 85,45 75,75 25,75 15,45"
                                    fill="rgba(255, 102, 0, 0.4)"
                                    stroke="#FF6600"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            {/* Labels */}
                            <span className="absolute top-0 text-[10px] font-black text-gray-400 uppercase">Teori</span>
                            <span className="absolute bottom-[20%] right-0 text-[10px] font-black text-gray-400 uppercase">Praktik</span>
                            <span className="absolute bottom-0 text-[10px] font-black text-gray-400 uppercase">Focus</span>
                            <span className="absolute bottom-[20%] left-0 text-[10px] font-black text-gray-400 uppercase">Analys</span>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <span>Total Mastery</span>
                                <span className="text-brand-orange">84%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-orange w-[84%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Games Section */}
            <div className="mt-12">
                <div className="flex items-center gap-3 mb-8">
                    <Gamepad2 size={24} className="text-indigo-500" />
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Mini-Games (GamiLearn)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MiniGameTile
                        title="Memory Match"
                        icon={Brain}
                        color="bg-purple-500"
                        xp="80"
                        description="Hitta matchande par mellan koncept och förklaringar."
                        delay={0.1}
                    />
                    <MiniGameTile
                        title="Time Attack"
                        icon={Zap}
                        color="bg-cyan-500"
                        xp="120"
                        description="Repetera så många kort som möjligt under intensiv tidspress."
                        delay={0.2}
                    />
                    <MiniGameTile
                        title="Boss Battle"
                        icon={Shield}
                        color="bg-red-500"
                        xp="500"
                        description="Utmanande test som täcker hela din kurs."
                        delay={0.3}
                    />
                    <MiniGameTile
                        title="Flash Quiz"
                        icon={Star}
                        color="bg-amber-500"
                        xp="50"
                        description="Snabba slumpmässiga frågor för att hålla minnet fräscht."
                        delay={0.4}
                    />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin-slow { animation: spin 20s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default EduAiHubPage;
