import React, { useState, useEffect } from 'react';
import { Target, RefreshCw, Trophy, Star, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FlashcardDashboard from '../../modules/flashcards/FlashcardDashboard';

const EduAIDashboard = () => {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('quests'); // 'quests' or 'flashcards'

    useEffect(() => {
        if (activeTab === 'quests') {
            fetchActiveQuests();
        }
    }, [activeTab]);

    const fetchActiveQuests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/gamification/eduai/active', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setQuests(data);
            }
        } catch (error) {
            console.error('Failed to fetch quests', error);
        } finally {
            setLoading(false);
        }
    };

    const generateQuests = async () => {
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/gamification/eduai/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                await fetchActiveQuests();
            }
        } catch (error) {
            console.error('Failed to generate quests', error);
        } finally {
            setGenerating(false);
        }
    };

    const completeQuest = async (questId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/gamification/eduai/complete/${questId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchActiveQuests();
                window.dispatchEvent(new Event('xpUpdated'));
            }
        } catch (error) {
            console.error('Failed to complete quest', error);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white mb-8 border border-white/10">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                EduAI Center
                            </span>
                            <Target className="w-6 h-6 text-cyan-400" />
                        </h2>
                        <p className="text-indigo-200 text-sm">Din personliga AI-assistent för lärande.</p>
                    </div>

                    {/* TABS */}
                    <div className="flex bg-black/20 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('quests')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'quests' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Quests
                        </button>
                        <button
                            onClick={() => setActiveTab('flashcards')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'flashcards' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Flashcards
                        </button>
                    </div>
                </div>

                {activeTab === 'quests' && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={generateQuests}
                                disabled={generating || quests.length >= 3}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                                    ${quests.length >= 3
                                        ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                                        : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-500/20'}
                                `}
                            >
                                <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                                {generating ? 'Genererar...' : 'Nya Uppdrag'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-pulse flex flex-col items-center gap-2 text-indigo-300">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                    <span className="text-xs uppercase tracking-wider">Hämtar data...</span>
                                </div>
                            </div>
                        ) : quests.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-80" />
                                <h3 className="text-lg font-medium text-white mb-2">Inga aktiva uppdrag</h3>
                                <p className="text-indigo-300 text-sm mb-4 max-w-md mx-auto">
                                    Ditt äventyr väntar! Generera nya AI-uppdrag för att tjäna XP och levla upp din kunskap.
                                </p>
                                <button
                                    onClick={generateQuests}
                                    disabled={generating}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
                                >
                                    Starta Äventyret
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {quests.map((quest, index) => (
                                        <motion.div
                                            key={quest.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/30 rounded-2xl p-5 backdrop-blur-md transition-all group relative overflow-hidden"
                                        >
                                            {/* Glow Effect on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <span className={`
                                                text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider
                                                ${quest.objectiveType === 'QUIZ' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                                                        quest.objectiveType === 'LESSON' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'}
                                            `}>
                                                    {quest.objectiveType}
                                                </span>
                                                <div className="flex items-center gap-1 text-yellow-400 bg-black/30 px-2 py-1 rounded-full border border-yellow-500/20">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span className="text-xs font-bold">{quest.rewardXp} XP</span>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-cyan-300 transition-colors">
                                                    {quest.title}
                                                </h3>

                                                {quest.narrative && (
                                                    <div className="mb-4 text-sm text-indigo-200 italic bg-black/20 p-3 rounded-xl border border-white/5">
                                                        "{quest.narrative}"
                                                    </div>
                                                )}

                                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                                    {quest.description}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    // TODO: Navigera till rätt ställe baserat på quest.objectiveType och quest.objectiveId
                                                    alert(`Gå till ${quest.objectiveType} med ID ${quest.objectiveId} för att slutföra uppdraget!`);
                                                }}
                                                className="relative z-10 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 rounded-xl font-medium transition-all shadow-lg shadow-cyan-900/50 group-hover:shadow-cyan-500/20"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                Gå till Uppdrag
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'flashcards' && (
                    <div className="mt-4">
                        <FlashcardDashboard />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EduAIDashboard;
