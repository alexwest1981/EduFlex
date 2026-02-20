import React, { useState, useEffect } from 'react';
import { RefreshCw, Target, BookOpen, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HubQuests = () => {
    const navigate = useNavigate();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchActiveQuests();
    }, []);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-white/5 p-6 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-xl">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Aktiva Uppdrag</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Utmana dig själv för extra XP och credits.</p>
                </div>
                <button
                    onClick={generateQuests}
                    disabled={generating || quests.length >= 3}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                        ${quests.length >= 3
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-white/5'
                            : 'bg-brand-orange text-white hover:brightness-110 shadow-lg shadow-brand-orange/20 active:scale-95'}
                    `}
                >
                    <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
                    {generating ? 'Genererar...' : 'Nya Uppdrag'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange" />
                </div>
            ) : quests.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
                    <Trophy className="w-16 h-16 text-gray-300 dark:text-white/10 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Inga uppdrag just nu</h3>
                    <p className="text-gray-500 text-sm mb-8">Klicka på knappen ovan för att låta AI:n generera nya utmaningar åt dig.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {quests.map((quest, index) => (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-[#1C1D1E] border border-gray-100 dark:border-white/10 rounded-[32px] p-8 shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <span className="bg-indigo-500/10 text-indigo-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-500/20">
                                        {quest.objectiveType}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-[10px] font-black">{quest.rewardXp} XP</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-brand-orange transition-colors">
                                    {quest.title}
                                </h3>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 line-clamp-2 font-medium">
                                    {quest.description}
                                </p>

                                <button
                                    onClick={() => {
                                        if (quest.courseId) {
                                            const tab = quest.objectiveType === 'QUIZ' ? 'quiz' :
                                                quest.objectiveType === 'ASSIGNMENT' ? 'assignments' : 'material';
                                            navigate(`/course/${quest.courseId}?tab=${tab}&itemId=${quest.objectiveId}`);
                                        } else {
                                            navigate('/my-courses');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all active:scale-95"
                                >
                                    <BookOpen size={16} />
                                    Börja Uppdrag
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default HubQuests;
