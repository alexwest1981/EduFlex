import React, { useState, useEffect } from 'react';
import {
    Brain, Sparkles, Zap, Target,
    TrendingUp, Calendar, Trophy,
    Star, ArrowRight, Play, Gamepad2,
    Shield, Activity, Info, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import HubReviewDeck from './components/HubReviewDeck';
import HubQuests from './components/HubQuests';
import MemoryMatch from '../eduai/components/MemoryMatch';
import TimeAttack from '../eduai/components/TimeAttack';
import AdaptiveLearningDashboard from '../adaptive/AdaptiveLearningDashboard';
import FlashcardDashboard from '../../modules/flashcards/FlashcardDashboard';
import { useLocation } from 'react-router-dom';

const HubGameTile = ({ title, icon: Icon, color, xp, description, onClick }) => (
    <motion.div
        whileHover={{ y: -5 }}
        onClick={onClick}
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

const IntelligenceBar = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
            { label: 'Kunskaps-kö', val: stats.queueSize || 0, icon: Brain, color: 'text-brand-orange', bg: 'bg-brand-orange/10', tooltip: 'Antalet koncept från tidigare kurser som behöver repeteras idag för att stanna i långtidsminnet enligt SM-2 algoritmen.' },
            { label: 'Intjänad XP', val: stats.totalXp || 0, icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-400/10', tooltip: 'Din totala erfarenhetspoäng insamlad från repetitioner och avklarade uppdrag.' },
            { label: 'XP Multiplier', val: `${stats.xpMultiplier || '1.0'}x`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10', tooltip: 'Din nuvarande poäng-multiplikator. Bibehåll en \'streak\' genom att fullfölja dagliga sessioner för att låsa upp högre multiplier!' },
            { label: 'Mastery Score', val: `${stats.masteryScore || 0}%`, icon: Target, color: 'text-green-500', bg: 'bg-green-500/10', tooltip: 'Ett övergripande mått på din inlärningsstabilitet. Ju högre poäng du har, desto lägre chans är det att du glömmer bort kursmaterialet.' }
        ].map((item, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${item.bg} p-6 rounded-3xl border border-white/10 shadow-xl relative group hover:z-50`}
            >
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-3 rounded-2xl bg-white dark:bg-black/20 ${item.color} shadow-sm`}>
                        <item.icon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1 relative group/tooltip">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{item.label}</p>
                            <HelpCircle size={12} className="text-gray-400 cursor-help" />

                            {/* Tooltip Hover */}
                            <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-900 text-white text-[11px] leading-relaxed p-3 rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-[100] shadow-2xl pointer-events-none">
                                {item.tooltip}
                                <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                        <p className={`text-2xl font-black ${item.color} leading-none`}>{item.val}</p>
                    </div>
                </div>
            </motion.div>
        ))}
    </div>
);

const HubRecommendations = ({ recommendations, onAction }) => {
    if (!recommendations || recommendations.length === 0) return null;

    const primary = recommendations[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-white dark:bg-[#1E1F20] rounded-[32px] p-6 border-2 border-brand-orange/20 shadow-xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-orange/10 transition-all duration-700"></div>

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                    {primary.type === 'SESSION' ? <Play size={32} /> : <Zap size={32} />}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <Sparkles size={14} className="text-brand-orange" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Dagens Rekommendation</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{primary.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{primary.description}</p>
                </div>

                <div className="shrink-0">
                    <button
                        onClick={() => onAction(primary)}
                        className="brand-gradient text-white font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-2 uppercase text-xs tracking-widest"
                    >
                        {primary.actionLabel} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const EduAiHubPage = () => {
    const [stats, setStats] = useState({
        queueSize: 0,
        xpMultiplier: '1.0',
        masteryScore: 0,
        radarStats: { Teori: 0, Praktik: 0, Focus: 0, Analys: 0 }
    });
    const [recommendations, setRecommendations] = useState([]);
    const [isReviewing, setIsReviewing] = useState(false);
    const [recommendedPass, setRecommendedPass] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Parse tab from URL or state if available, otherwise default to 'overview'
    const getInitialTab = () => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (['overview', 'adaptive', 'games', 'quests', 'memory', 'time-attack'].includes(tabParam)) {
            return tabParam;
        }
        return location.state?.activeTab || 'overview';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    useEffect(() => {
        fetchStats();

        const handleXpUpdate = () => {
            fetchStats();
        };
        window.addEventListener('xpUpdated', handleXpUpdate);
        return () => window.removeEventListener('xpUpdated', handleXpUpdate);
    }, []);

    const fetchStats = async () => {
        try {
            const [statsData, recsData] = await Promise.all([
                api.ai.getHubStats(),
                api.ai.getRecommendations()
            ]);

            setStats({
                ...statsData,
                queueSize: statsData.queueSize || 0,
                xpMultiplier: statsData.xpMultiplier || '1.0',
                masteryScore: statsData.masteryScore || 0,
                radarStats: statsData.radarStats || { Teori: 0, Praktik: 0, Focus: 0, Analys: 0 }
            });

            setRecommendations(recsData || []);
        } catch (err) {
            console.error("Failed to fetch hub data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecommendationAction = (rec) => {
        if (rec.type === 'SESSION') {
            setRecommendedPass({ sessionType: rec.sessionType });
            setIsReviewing(true);
        } else if (rec.type === 'REVIEW') {
            setIsReviewing(true);
        }
    };

    const getRadarPath = () => {
        const { Teori, Praktik, Focus, Analys } = stats.radarStats;
        const pts = [
            { x: 50, y: 50 - (45 * (Teori || 0) / 100) }, // Teori (top)
            { x: 50 + (45 * (Praktik || 0) / 100), y: 50 }, // Praktik (right)
            { x: 50, y: 50 + (45 * (Focus || 0) / 100) }, // Focus (bottom)
            { x: 50 - (45 * (Analys || 0) / 100), y: 50 } // Analys (left)
        ];
        return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y} L ${pts[2].x},${pts[2].y} L ${pts[3].x},${pts[3].y} Z`;
    };

    if (isReviewing) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                <HubReviewDeck
                    initialSessionType={recommendedPass?.sessionType}
                    onComplete={() => {
                        setIsReviewing(false);
                        setRecommendedPass(null);
                        fetchStats();
                    }}
                />
                <button
                    onClick={() => {
                        setIsReviewing(false);
                        setRecommendedPass(null);
                    }}
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
                        <span className="text-brand-orange font-black uppercase tracking-[0.3em] text-[10px]">Intelligence Center v2.2.0</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">EduAI Hub</h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-x-auto">
                    {['overview', 'adaptive', 'games', 'flashcards', 'quests'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            {tab === 'overview' ? 'Översikt' : tab === 'adaptive' ? 'Min Lärväg' : tab === 'games' ? 'Spel' : tab === 'flashcards' ? 'Flashcards' : 'Uppdrag'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    <HubRecommendations
                        recommendations={recommendations}
                        onAction={handleRecommendationAction}
                    />
                    <IntelligenceBar stats={stats} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group h-full"
                            >
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className="flex-1">
                                        <h2 className="text-4xl font-black mb-4 leading-tight">Dags för din <br /> Session?</h2>
                                        <p className="text-indigo-100 text-lg mb-8 font-medium leading-relaxed opacity-80">
                                            Starta en interaktiv studiesession med din AI-tutorn. Välj ett ämne och låt AI:n skapa skräddarsytt material och övningsfrågor för dig.
                                        </p>
                                        <button
                                            onClick={() => setIsReviewing(true)}
                                            className="flex items-center gap-3 px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-2xl relative overflow-hidden bg-brand-orange text-white hover:brightness-110"
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

                        <div className="lg:col-span-1 border-t-0 hover:z-50 relative">
                            <div className="bg-white dark:bg-[#1E1F20] rounded-[48px] p-8 border border-gray-100 dark:border-white/10 h-full shadow-xl flex flex-col relative z-20">
                                <div className="flex items-center gap-3 mb-8">
                                    <h3 className="text-xl font-black flex items-center gap-3 text-gray-900 dark:text-white uppercase tracking-tight">
                                        <Activity size={20} className="text-brand-orange" />
                                        Live Radar
                                    </h3>

                                    <div className="relative group/radar-tooltip ml-auto">
                                        <HelpCircle size={16} className="text-gray-400 cursor-help" />
                                        <div className="absolute right-0 bottom-full mb-2 w-72 bg-gray-900 text-white text-xs leading-relaxed p-4 rounded-xl opacity-0 invisible group-hover/radar-tooltip:opacity-100 group-hover/radar-tooltip:visible transition-all z-[100] shadow-2xl pointer-events-none text-left font-normal normal-case">
                                            <p className="font-bold mb-1 text-brand-orange">Hur fungerar Live Radar?</p>
                                            <p className="mb-2 text-gray-300">Radarn är en visuell representation av din kognitiva profil baserat på ditt lärande.</p>
                                            <ul className="space-y-1 text-gray-400 list-disc pl-4">
                                                <li><strong className="text-gray-200">Teori:</strong> Bedöms från quiz med begrepp/läsförståelse.</li>
                                                <li><strong className="text-gray-200">Praktik:</strong> Ökar när du slutför uppgifter och labbar.</li>
                                                <li><strong className="text-gray-200">Focus:</strong> Bygger på hur snabbt och ihärdigt du slutför repetitioner (Time Attack, Streak).</li>
                                                <li><strong className="text-gray-200">Analys:</strong> Ökar av djupdykande diskussioner med AI-tutorn och utvärderingar.</li>
                                            </ul>
                                            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
                                    <svg viewBox="0 0 100 100" className="w-full h-full max-w-[200px]">
                                        {[0.2, 0.4, 0.6, 0.8, 1.0].map(r => (
                                            <circle key={r} cx="50" cy="50" r={45 * r} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-100 dark:text-white/5" />
                                        ))}
                                        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" className="text-gray-100 dark:text-white/5" />
                                        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-gray-100 dark:text-white/5" />

                                        <motion.path
                                            initial={{ d: "M 50,50 L 50,50 L 50,50 L 50,50 Z" }}
                                            animate={{ d: getRadarPath() }}
                                            fill="rgba(255, 102, 0, 0.3)"
                                            stroke="#FF6600"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span className="absolute top-0 text-[10px] font-black text-gray-400 uppercase">Teori ({stats.radarStats.Teori}%)</span>
                                    <span className="absolute bottom-[20%] right-0 text-[10px] font-black text-gray-400 uppercase">Praktik ({stats.radarStats.Praktik}%)</span>
                                    <span className="absolute bottom-0 text-[10px] font-black text-gray-400 uppercase">Focus ({stats.radarStats.Focus}%)</span>
                                    <span className="absolute bottom-[20%] left-0 text-[10px] font-black text-gray-400 uppercase">Analys ({stats.radarStats.Analys}%)</span>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <span>Total Mastery</span>
                                        <span className="text-brand-orange">{stats.masteryScore}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-orange" style={{ width: `${stats.masteryScore}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'adaptive' && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AdaptiveLearningDashboard />
                </div>
            )}

            {activeTab === 'quests' && (
                <div className="mt-8">
                    <HubQuests />
                </div>
            )}

            {activeTab === 'games' && (
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Gamepad2 size={24} className="text-indigo-500" />
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Mini-Games (GamiLearn)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
                        <HubGameTile
                            title="Memory Match"
                            icon={Brain}
                            color="bg-purple-500"
                            xp="80"
                            description="Hitta matchande par mellan koncept och förklaringar från din personliga kö."
                            onClick={() => setActiveTab('memory')}
                        />
                        <HubGameTile
                            title="Time Attack"
                            icon={Zap}
                            color="bg-cyan-500"
                            xp="120"
                            description="Repetera så många kort som möjligt under intensiv tidspress."
                            onClick={() => setActiveTab('time-attack')}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'memory' && (
                <div className="mt-8">
                    <button onClick={() => setActiveTab('games')} className="mb-4 text-indigo-600 font-bold text-sm hover:underline">
                        &larr; Tillbaka till Spel
                    </button>
                    <div className="bg-[#1E1F20] p-4 md:p-8 rounded-[32px] shadow-2xl overflow-hidden min-h-[500px]">
                        <MemoryMatch />
                    </div>
                </div>
            )}

            {activeTab === 'time-attack' && (
                <div className="mt-8">
                    <button onClick={() => setActiveTab('games')} className="mb-4 text-indigo-600 font-bold text-sm hover:underline">
                        &larr; Tillbaka till Spel
                    </button>
                    <div className="bg-[#1E1F20] p-4 md:p-8 rounded-[32px] shadow-2xl overflow-hidden min-h-[500px]">
                        <TimeAttack />
                    </div>
                </div>
            )}

            {activeTab === 'flashcards' && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <FlashcardDashboard />
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin-slow { animation: spin 20s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default EduAiHubPage;
