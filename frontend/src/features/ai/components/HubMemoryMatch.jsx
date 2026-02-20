import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Clock, Zap, ArrowLeft, Brain } from 'lucide-react';
import { api } from '../../../services/api';

const HubMemoryMatch = ({ onBack, onComplete }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);
    const [running, setRunning] = useState(false);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [xpAwarded, setXpAwarded] = useState(0);

    const loadQueue = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.ai.getHubStats(); // We need the queue, maybe better to call getQueue
            const token = localStorage.getItem('token');
            const queueRes = await fetch('/api/ai/hub/queue', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const queue = await queueRes.json();

            if (queue.length < 2) {
                setCards([]);
                setLoading(false);
                return;
            }

            // Pick up to 6 items
            const selected = queue.slice(0, 6);
            const pairs = selected.flatMap((item, i) => [
                { id: `t-${item.id}`, pairId: item.id, text: item.title, type: 'title' },
                { id: `c-${item.id}`, pairId: item.id, text: item.content, type: 'content' },
            ]);

            // Shuffle
            for (let j = pairs.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [pairs[j], pairs[k]] = [pairs[k], pairs[j]];
            }

            setCards(pairs);
            setFlipped([]);
            setMatched([]);
            setMoves(0);
            setTimer(0);
            setRunning(false);
            setFinished(false);
        } catch (err) {
            console.error("Failed to load memory match data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadQueue(); }, [loadQueue]);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [running]);

    useEffect(() => {
        if (cards.length > 0 && matched.length === cards.length) {
            setRunning(false);
            setFinished(true);
            const reward = (cards.length / 2) * 15;
            setXpAwarded(reward);

            // Award XP
            const token = localStorage.getItem('token');
            fetch('/api/gamification/xp/award', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: reward, source: 'MEMORY_MATCH' }),
            }).catch(() => { });

            if (onComplete) onComplete(reward);
        }
    }, [matched, cards]);

    const handleFlip = (index) => {
        if (flipped.length === 2 || flipped.includes(index) || matched.includes(index) || finished) return;
        if (!running) setRunning(true);

        const next = [...flipped, index];
        setFlipped(next);

        if (next.length === 2) {
            setMoves(m => m + 1);
            if (cards[next[0]].pairId === cards[next[1]].pairId) {
                setMatched(prev => [...prev, ...next]);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Laddar dina kunskapsfragment...</p>
        </div>
    );

    if (cards.length === 0) return (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
            <Brain className="w-16 h-16 text-gray-300 dark:text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">För få objekt i kön</h3>
            <p className="text-gray-500 text-sm mb-8 px-6">Du behöver minst 2 objekt i din Daily Review-kö för att spela Memory Match.</p>
            <button onClick={onBack} className="text-indigo-600 font-black text-xs uppercase tracking-widest">Gå tillbaka</button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 hover:brightness-110 transition-all group">
                    <ArrowLeft size={20} className="text-gray-500 group-hover:text-brand-orange" />
                </button>
                <div className="flex gap-6">
                    <div className="bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-2">
                        <Clock size={16} className="text-brand-orange" />
                        <span className="font-black text-gray-900 dark:text-white tabular-nums">{formatTime(timer)}</span>
                    </div>
                    <div className="bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-2">
                        <Zap size={16} className="text-indigo-500" />
                        <span className="font-black text-gray-900 dark:text-white">{moves} Drag</span>
                    </div>
                </div>
                <button onClick={loadQueue} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 hover:brightness-110 transition-all">
                    <RotateCcw size={20} className="text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((card, i) => {
                    const isFlipped = flipped.includes(i) || matched.includes(i);
                    const isMatched = matched.includes(i);
                    return (
                        <motion.button
                            key={card.id}
                            onClick={() => handleFlip(i)}
                            layout
                            className={`
                                relative aspect-[3/4] rounded-[24px] border-2 transition-all overflow-hidden p-4 flex items-center justify-center text-center
                                ${isMatched
                                    ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                                    : isFlipped
                                        ? 'bg-white dark:bg-[#1C1D1E] border-brand-orange shadow-xl scale-105 z-10'
                                        : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-brand-orange/30 cursor-pointer'}
                            `}
                        >
                            <AnimatePresence mode="wait">
                                {isFlipped ? (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, rotateY: 90 }}
                                        animate={{ opacity: 1, rotateY: 0 }}
                                        className="text-xs font-bold leading-relaxed dark:text-white"
                                    >
                                        {card.text}
                                        <div className={`mt-2 text-[8px] uppercase tracking-widest ${card.type === 'title' ? 'text-indigo-500' : 'text-brand-orange'}`}>
                                            {card.type === 'title' ? 'Begrepp' : 'Beskrivning'}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="back"
                                        className="text-4xl text-gray-200 dark:text-white/5 font-black uppercase tracking-tighter"
                                    >
                                        EduAI
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>

            {finished && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                >
                    <div className="bg-white dark:bg-[#1E1F20] rounded-[48px] p-12 max-w-md w-full text-center border border-white/10 shadow-2xl">
                        <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-none uppercase tracking-tighter">Fantastiskt!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Du matchade alla fragment på {formatTime(timer)}!</p>
                        <div className="flex items-center justify-center gap-3 bg-brand-orange/10 px-8 py-4 rounded-3xl border border-brand-orange/20 mb-8">
                            <Star className="text-brand-orange" fill="currentColor" />
                            <span className="text-2xl font-black text-brand-orange">+{xpAwarded} XP</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={onBack} className="py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all">
                                Avsluta
                            </button>
                            <button onClick={loadQueue} className="bg-brand-orange text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 shadow-lg shadow-brand-orange/20 transition-all">
                                Spela Igen
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default HubMemoryMatch;
