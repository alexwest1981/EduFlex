import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, CheckCircle, XCircle, RotateCcw, Trophy, Flame } from 'lucide-react';
import eduAiService from '../services/eduAiService';
import { api } from '../../../services/api';

const ROUND_SECONDS = 60;

const TimeAttack = () => {
    const [allCards, setAllCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
    const [running, setRunning] = useState(false);
    const [finished, setFinished] = useState(false);
    const [correct, setCorrect] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [xpAwarded, setXpAwarded] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        try { return parseInt(localStorage.getItem('eduai_timeattack_highscore') || '0', 10); }
        catch { return 0; }
    });
    const [comboFlash, setComboFlash] = useState(false);
    const timerRef = useRef(null);

    const loadCards = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await eduAiService.getDueCards();
            const flashcards = Array.isArray(res) ? res : res?.data ?? [];
            if (flashcards.length < 3) {
                setError('Du behöver minst 3 kort för Time Attack. Skapa fler flashcards!');
                setLoading(false);
                return;
            }
            // Shuffle
            const shuffled = [...flashcards];
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }
            setAllCards(shuffled);
            resetGame();
        } catch {
            setError('Kunde inte hämta kort. Försök igen.');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetGame = () => {
        setCurrentIndex(0);
        setShowAnswer(false);
        setTimeLeft(ROUND_SECONDS);
        setRunning(false);
        setFinished(false);
        setCorrect(0);
        setWrong(0);
        setCombo(0);
        setMaxCombo(0);
        setXpAwarded(0);
    };

    useEffect(() => { loadCards(); }, [loadCards]);

    // Timer countdown
    useEffect(() => {
        if (!running) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    setRunning(false);
                    setFinished(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [running]);

    // Award XP on finish
    useEffect(() => {
        if (!finished) return;
        const base = correct * 5;
        const comboBonus = maxCombo >= 5 ? 25 : maxCombo >= 3 ? 10 : 0;
        const total = base + comboBonus;
        setXpAwarded(total);

        if (correct > highScore) {
            setHighScore(correct);
            try { localStorage.setItem('eduai_timeattack_highscore', String(correct)); } catch { }
        }

        api.post('/gamification/xp/award', { amount: total, source: 'TIME_ATTACK' })
            .then(() => {
                window.dispatchEvent(new Event('xpUpdated'));
            })
            .catch(err => console.error("Kunde inte registrera XP", err));
    }, [finished, correct, maxCombo, highScore]);

    const startGame = () => {
        resetGame();
        setRunning(true);
    };

    const handleAnswer = (isCorrect) => {
        if (!running) return;
        if (isCorrect) {
            setCorrect(c => c + 1);
            const newCombo = combo + 1;
            setCombo(newCombo);
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            if (newCombo > 0 && newCombo % 3 === 0) {
                setComboFlash(true);
                setTimeout(() => setComboFlash(false), 600);
            }
        } else {
            setWrong(w => w + 1);
            setCombo(0);
        }
        setShowAnswer(false);
        // Advance to next card, loop around
        setCurrentIndex(i => (i + 1) % allCards.length);
    };

    const currentCard = allCards[currentIndex];
    const timePercent = (timeLeft / ROUND_SECONDS) * 100;
    const timeColor = timeLeft > 20 ? 'bg-cyan-400' : timeLeft > 10 ? 'bg-yellow-400' : 'bg-red-500';

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
                <button onClick={loadCards} className="text-cyan-400 hover:text-cyan-300 underline text-sm">Försök igen</button>
            </div>
        );
    }

    // Pre-game screen
    if (!running && !finished) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <Timer className="w-14 h-14 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Time Attack</h3>
                <p className="text-indigo-200 text-sm mb-2">Svara på så många flashcards som möjligt på {ROUND_SECONDS} sekunder!</p>
                {highScore > 0 && (
                    <p className="text-yellow-400 text-sm mb-4 flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4" /> Highscore: {highScore} rätt
                    </p>
                )}
                <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                >
                    Starta!
                </button>
            </div>
        );
    }

    // Finished screen
    if (finished) {
        const isNewHighScore = correct >= highScore && correct > 0;
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
            >
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${isNewHighScore ? 'text-yellow-400' : 'text-indigo-400'}`} />
                {isNewHighScore && <p className="text-yellow-400 font-bold text-sm mb-2 uppercase tracking-wider">Nytt Highscore!</p>}
                <h3 className="text-2xl font-bold text-white mb-3">Tiden är ute!</h3>
                <div className="flex justify-center gap-6 mb-4 text-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{correct}</div>
                        <div className="text-indigo-300">Rätt</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{wrong}</div>
                        <div className="text-indigo-300">Fel</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{maxCombo}</div>
                        <div className="text-indigo-300">Max Combo</div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-6">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold text-lg">+{xpAwarded} XP</span>
                </div>
                <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all"
                >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Spela igen
                </button>
            </motion.div>
        );
    }

    // Active game
    return (
        <div>
            {/* Timer bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-indigo-200 flex items-center gap-1"><Timer className="w-4 h-4" /> {timeLeft}s</span>
                    <div className="flex items-center gap-4">
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {correct}</span>
                        {combo >= 2 && (
                            <motion.span
                                key={combo}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className="text-orange-400 flex items-center gap-1 font-bold"
                            >
                                <Flame className="w-4 h-4" /> {combo}x
                            </motion.span>
                        )}
                    </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${timeColor}`}
                        initial={false}
                        animate={{ width: `${timePercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Combo flash overlay */}
            <AnimatePresence>
                {comboFlash && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <span className="text-5xl font-black text-orange-400 drop-shadow-lg">{combo}x COMBO!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card */}
            {currentCard && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center min-h-[200px] flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-wider text-indigo-400 mb-3">{showAnswer ? 'Svar' : 'Fråga'}</p>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={`${currentIndex}-${showAnswer}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="text-xl text-white font-medium leading-relaxed"
                        >
                            {showAnswer ? currentCard.back : currentCard.front}
                        </motion.p>
                    </AnimatePresence>
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-3 mt-4">
                {!showAnswer ? (
                    <button
                        onClick={() => setShowAnswer(true)}
                        className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10 hover:border-cyan-400/30"
                    >
                        Visa svar
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => handleAnswer(false)}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-xl font-bold transition-all border border-red-500/20"
                        >
                            <XCircle className="w-5 h-5" /> Fel
                        </button>
                        <button
                            onClick={() => handleAnswer(true)}
                            className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-6 py-3 rounded-xl font-bold transition-all border border-green-500/20"
                        >
                            <CheckCircle className="w-5 h-5" /> Rätt
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TimeAttack;
