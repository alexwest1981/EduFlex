import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Clock, Zap, ArrowLeft, Brain, FastForward, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../../services/api';

const HubTimeAttack = ({ onBack, onComplete }) => {
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [running, setRunning] = useState(false);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [xpAwarded, setXpAwarded] = useState(0);
    const [showContent, setShowContent] = useState(false);

    const loadQueue = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queueRes = await fetch('/api/ai/hub/queue', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await queueRes.json();

            if (data.length === 0) {
                setQueue([]);
                setLoading(false);
                return;
            }

            // Shuffle queue
            const shuffled = [...data].sort(() => Math.random() - 0.5);
            setQueue(shuffled);
            setCurrentIndex(0);
            setScore(0);
            setTimeLeft(60);
            setRunning(false);
            setFinished(false);
            setShowContent(false);
        } catch (err) {
            console.error("Failed to load time attack data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadQueue(); }, [loadQueue]);

    useEffect(() => {
        if (!running || timeLeft <= 0) {
            if (timeLeft <= 0 && running) {
                setRunning(false);
                finishGame();
            }
            return;
        }
        const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [running, timeLeft]);

    const start = () => setRunning(true);

    const finishGame = () => {
        setFinished(true);
        const reward = score * 5;
        setXpAwarded(reward);

        // Award XP
        const token = localStorage.getItem('token');
        fetch('/api/gamification/xp/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: reward, source: 'TIME_ATTACK' }),
        }).catch(() => { });

        if (onComplete) onComplete(reward);
    };

    const handleAnswer = (correct) => {
        if (!running) start();
        if (correct) setScore(s => s + 1);

        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowContent(false);
        } else {
            setRunning(false);
            finishGame();
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Laddar utmaningar...</p>
        </div>
    );

    if (queue.length === 0) return (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
            <Zap className="w-16 h-16 text-gray-300 dark:text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Inga objekt att repetera</h3>
            <p className="text-gray-500 text-sm mb-8 px-6">Din kö är tom. Lägg till material eller vänta på nya repetitioner.</p>
            <button onClick={onBack} className="text-indigo-600 font-black text-xs uppercase tracking-widest">Gå tillbaka</button>
        </div>
    );

    const currentItem = queue[currentIndex];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <button onClick={onBack} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 hover:brightness-110 transition-all group">
                    <ArrowLeft size={20} className="text-gray-500 group-hover:text-brand-orange" />
                </button>
                <div className="flex gap-6">
                    <div className={`bg-white dark:bg-white/5 px-8 py-4 rounded-3xl border ${timeLeft < 10 ? 'border-red-500/50 animate-pulse' : 'border-gray-100 dark:border-white/10'} flex items-center gap-3 transition-colors`}>
                        <Clock size={24} className={timeLeft < 10 ? 'text-red-500' : 'text-brand-orange'} />
                        <span className={`text-3xl font-black tabular-nums ${timeLeft < 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{timeLeft}s</span>
                    </div>
                    <div className="bg-white dark:bg-white/5 px-8 py-4 rounded-3xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <Trophy size={24} className="text-indigo-500" />
                        <span className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{score}</span>
                    </div>
                </div>
                <button onClick={loadQueue} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 hover:brightness-110 transition-all">
                    <RotateCcw size={20} className="text-gray-400" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {!finished ? (
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white dark:bg-[#1C1D1E] rounded-[48px] p-12 border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] border border-brand-orange/20">
                                Quest {currentIndex + 1} / {queue.length}
                            </span>
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 leading-tight uppercase tracking-tight">
                            {currentItem.title}
                        </h2>

                        <div
                            onClick={() => setShowContent(!showContent)}
                            className={`
                                cursor-pointer p-8 rounded-3xl border-2 border-dashed transition-all mb-12 flex flex-col items-center justify-center min-h-[160px]
                                ${showContent
                                    ? 'bg-indigo-500/5 border-indigo-500/20 text-gray-700 dark:text-indigo-100'
                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 italic'}
                            `}
                        >
                            {showContent ? (
                                <p className="text-lg font-medium text-center">{currentItem.content}</p>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Brain size={32} />
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Klicka för att se svar</span>
                                </div>
                            )}
                        </div>

                        <div className={`grid grid-cols-2 gap-4 transition-opacity ${!showContent ? 'opacity-30 pointer-events-none' : ''}`}>
                            <button
                                onClick={() => handleAnswer(false)}
                                className="bg-red-500/10 text-red-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <XCircle size={20} /> Jag missade
                            </button>
                            <button
                                onClick={() => handleAnswer(true)}
                                className="bg-green-500/10 text-green-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] border border-green-500/20 hover:bg-green-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                            >
                                <CheckCircle2 size={20} /> Kommer ihåg!
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#1E1F20] rounded-[48px] p-12 text-center border border-white/10 shadow-2xl"
                    >
                        <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-none uppercase tracking-tighter">Time's Up!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Snyggt jobbat, du klarade {score} repetitioner!</p>

                        <div className="flex items-center justify-center gap-3 bg-brand-orange/10 px-8 py-4 rounded-3xl border border-brand-orange/20 mb-8">
                            <Star className="text-brand-orange" fill="currentColor" />
                            <span className="text-2xl font-black text-brand-orange">+{xpAwarded} XP</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={loadQueue} className="bg-brand-orange text-white py-6 rounded-3xl font-black uppercase text-sm tracking-widest hover:brightness-110 shadow-lg shadow-brand-orange/20 transition-all active:scale-95">
                                Ny Runda
                            </button>
                            <button onClick={onBack} className="py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all">
                                Avbryt
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HubTimeAttack;
