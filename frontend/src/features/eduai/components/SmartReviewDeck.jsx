import React, { useState, useEffect } from 'react';
import { ChevronRight, RotateCcw, Brain, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import eduAiService from '../services/eduAiService';

const SmartReviewDeck = () => {
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDueCards();
    }, []);

    const fetchDueCards = async () => {
        setLoading(true);
        try {
            const response = await eduAiService.getDueCards();
            const flashcards = Array.isArray(response) ? response : response?.data ?? [];
            setCards(flashcards);
            if (!flashcards || flashcards.length === 0) {
                setCompleted(true);
            }
        } catch (error) {
            console.error('Failed to fetch due cards:', error);
            // Don't just log, update state so UI doesn't hang in loading or crash
            setCards([]);
            setCompleted(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (quality) => {
        if (submitting || !cards[currentIndex]) return;
        setSubmitting(true);
        const currentCard = cards[currentIndex];

        try {
            await eduAiService.submitReview(currentCard.id, quality);

            if (currentIndex < cards.length - 1) {
                // Next card
                setIsFlipped(false);
                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                    setSubmitting(false);
                }, 300);
            } else {
                // Done
                setCompleted(true);
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-[#0b1b2b] rounded-3xl border border-white/5">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-400">Hämtar din dagliga repetition...</p>
            </div>
        );
    }

    if (completed || cards.length === 0) {
        return (
            <div className="bg-[#0b1b2b] p-12 rounded-3xl border border-indigo-500/20 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="text-indigo-500" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                    {cards.length === 0 ? 'Inga kort att repetera' : 'Snyggt jobbat!'}
                </h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    {cards.length === 0
                        ? 'Du har inga kort som behöver repeteras just nu. Kom tillbaka senare!'
                        : 'Du har klarat av dagens repetitioner. SM-2 algoritmen har nu optimerat din nästa studiesession.'}
                </p>
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-4 rounded-2xl flex items-center justify-between mb-8 max-w-xs mx-auto">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-green-500" size={24} />
                        <span className="text-white font-bold">Session klar</span>
                    </div>
                    <span className="text-indigo-400 font-black">+50 XP</span>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                    Tillbaka till Dashboard
                </button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    // Final defensive check before rendering
    if (!currentCard) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-400">Ett fel uppstod vid laddning av kortet. Försök ladda om sidan.</p>
            </div>
        );
    }

    const progress = (currentIndex / cards.length) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header / Progress */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <Brain className="text-indigo-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold">Dagens Smart Review</h2>
                        <p className="text-gray-400 text-xs">SM-2 optimerad repetition</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-indigo-400 font-bold">{currentIndex + 1}</span>
                    <span className="text-gray-500"> / {cards.length}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-white/5 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Flashcard Component */}
            <div
                className="group relative h-80 w-full perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div
                    className={`relative h-full w-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                    {/* Front */}
                    <div className="absolute inset-0 h-full w-full bg-[#162a3d] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl">
                        <span className="absolute top-6 left-8 text-indigo-500/50 font-black text-4xl select-none">?</span>
                        <p className="text-2xl text-white font-medium leading-relaxed">
                            {currentCard.front}
                        </p>
                        <div className="absolute bottom-8 flex items-center gap-2 text-gray-400 text-sm opacity-50">
                            <RotateCcw size={14} />
                            <span>Klicka för att vända</span>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 h-full w-full bg-[#1e293b] border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden shadow-2xl shadow-indigo-500/5">
                        <span className="absolute top-6 left-8 text-indigo-500/50 font-black text-4xl select-none">!</span>
                        <p className="text-xl text-indigo-100 leading-relaxed font-semibold">
                            {currentCard.back}
                        </p>
                        <div className="absolute bottom-8 flex items-center gap-2 text-indigo-300 text-sm opacity-50">
                            <RotateCcw size={14} />
                            <span>Klicka för att se frågan igen</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-10 grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-500" style={{ opacity: isFlipped ? 1 : 0.3, pointerEvents: isFlipped ? 'auto' : 'none' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); handleRate(1); }}
                    className="flex flex-col items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all group"
                >
                    <span className="text-2xl group-hover:scale-125 transition-transform">😫</span>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-tighter">Igen</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleRate(3); }}
                    className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl hover:bg-orange-500/20 transition-all group"
                >
                    <span className="text-2xl group-hover:scale-125 transition-transform">😕</span>
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-tighter">Svårt</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleRate(4); }}
                    className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all group"
                >
                    <span className="text-2xl group-hover:scale-125 transition-transform">😊</span>
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-tighter">Bra</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleRate(5); }}
                    className="flex flex-col items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl hover:bg-green-500/20 transition-all group"
                >
                    <span className="text-2xl group-hover:scale-125 transition-transform">😎</span>
                    <span className="text-xs font-bold text-green-500 uppercase tracking-tighter">Enkelt</span>
                </button>
            </div>

            {!isFlipped && (
                <p className="text-center mt-6 text-gray-500 animate-pulse">
                    Vänd på kortet för att välja svårighet
                </p>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}} />
        </div>
    );
};

export default SmartReviewDeck;
