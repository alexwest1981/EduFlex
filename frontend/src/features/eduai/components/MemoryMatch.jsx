import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Clock, Zap } from 'lucide-react';
import eduAiService from '../services/eduAiService';
import { api } from '../../../services/api';

const MemoryMatch = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);
    const [running, setRunning] = useState(false);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [xpAwarded, setXpAwarded] = useState(0);

    const loadCards = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await eduAiService.getDueCards();
            const flashcards = Array.isArray(res) ? res : res?.data ?? [];
            if (flashcards.length < 2) {
                setError('Du behöver minst 2 kort för att spela Memory Match. Skapa fler flashcards först!');
                setLoading(false);
                return;
            }
            // Pick up to 6 cards, create front/back pairs
            const selected = flashcards.slice(0, 6);
            const pairs = selected.flatMap((card, i) => [
                { id: `f-${i}`, pairId: i, text: card.front, type: 'front', cardId: card.id },
                { id: `b-${i}`, pairId: i, text: card.back, type: 'back', cardId: card.id },
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
            setXpAwarded(0);
        } catch {
            setError('Kunde inte hämta kort. Försök igen senare.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCards(); }, [loadCards]);

    // Timer
    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [running]);

    // Check win
    useEffect(() => {
        if (cards.length > 0 && matched.length === cards.length) {
            setRunning(false);
            setFinished(true);
            const pairCount = cards.length / 2;
            const baseXp = pairCount * 10;
            const timeBonus = timer < pairCount * 10 ? 20 : 0;
            const total = baseXp + timeBonus;
            setXpAwarded(total);
            // Award XP via backend
            api.post('/gamification/xp/award', { amount: total, source: 'MEMORY_MATCH' })
                .then(() => {
                    window.dispatchEvent(new Event('xpUpdated'));
                })
                .catch(err => console.error("Kunde inte registrera XP", err));
        }
    }, [matched, cards, timer]);

    const handleFlip = (index) => {
        if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
        if (!running) setRunning(true);

        const next = [...flipped, index];
        setFlipped(next);

        if (next.length === 2) {
            setMoves(m => m + 1);
            const [a, b] = next;
            if (cards[a].pairId === cards[b].pairId) {
                setMatched(prev => [...prev, a, b]);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-indigo-300 mb-4">{error}</p>
                <button onClick={loadCards} className="text-cyan-400 hover:text-cyan-300 underline text-sm">
                    Försök igen
                </button>
            </div>
        );
    }

    if (finished) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
            >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Bra jobbat!</h3>
                <p className="text-indigo-200 mb-1">Du matchade alla {cards.length / 2} par!</p>
                <p className="text-indigo-300 text-sm mb-1">Tid: {formatTime(timer)} | Drag: {moves}</p>
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-6">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold text-lg">+{xpAwarded} XP</span>
                </div>
                <button
                    onClick={loadCards}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all"
                >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Spela igen
                </button>
            </motion.div>
        );
    }

    // Grid columns based on card count
    const cols = cards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-6';

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4 text-sm text-indigo-200">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(timer)}</span>
                    <span>Drag: {moves}</span>
                    <span>Matchade: {matched.length / 2} / {cards.length / 2}</span>
                </div>
                <button onClick={loadCards} className="text-gray-400 hover:text-white transition-colors" title="Starta om">
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
            <div className={`grid ${cols} gap-3`}>
                {cards.map((card, i) => {
                    const isFlipped = flipped.includes(i) || matched.includes(i);
                    const isMatched = matched.includes(i);
                    return (
                        <motion.button
                            key={card.id}
                            onClick={() => handleFlip(i)}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative h-28 rounded-xl font-medium text-sm transition-all cursor-pointer select-none
                                ${isMatched
                                    ? 'bg-green-500/20 border-green-400/40 border text-green-300'
                                    : isFlipped
                                        ? 'bg-white/10 border-cyan-400/40 border text-white'
                                        : 'bg-white/5 border-white/10 border text-transparent hover:bg-white/10 hover:border-indigo-400/30'
                                }
                            `}
                        >
                            <div className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden">
                                {isFlipped ? (
                                    <span className="text-center leading-tight line-clamp-4">{card.text}</span>
                                ) : (
                                    <span className="text-2xl text-indigo-400">?</span>
                                )}
                            </div>
                            {isFlipped && (
                                <span className={`absolute top-1 right-2 text-[10px] uppercase tracking-wider ${card.type === 'front' ? 'text-cyan-400/60' : 'text-purple-400/60'}`}>
                                    {card.type === 'front' ? 'Fram' : 'Bak'}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default MemoryMatch;
