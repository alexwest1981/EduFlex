import React, { useState } from 'react';
import { RotateCw, CheckCircle, Clock, XCircle, Play } from 'lucide-react';
import { api } from '../../services/api';

const FlashcardPlayer = ({ deck, onSessionComplete, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionResults, setSessionResults] = useState([]);
    const [isFinished, setIsFinished] = useState(false);

    // Filter cards due for review (or all if none due, or simplistic approach for MVP)
    // MVP: Just study all cards in the deck for now, or the ones returned by backend
    const cards = deck?.cards || [];
    const currentCard = cards[currentIndex];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleRate = async (quality) => {
        // Quality: 0 (Again), 3 (Hard), 4 (Good), 5 (Easy)
        const result = {
            cardId: currentCard.id,
            quality: quality
        };

        const newResults = [...sessionResults, result];
        setSessionResults(newResults);

        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsFinished(true);
            await submitSession(newResults);
        }
    };

    const submitSession = async (results) => {
        try {
            await api.post(`/flashcards/deck/${deck.id}/study-session`, results);
            if (onSessionComplete) onSessionComplete();
        } catch (error) {
            console.error('Failed to submit session:', error);
        }
    };

    if (!deck || cards.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Inga kort i denna lek.</p>
                <button onClick={onBack} className="mt-4 text-indigo-600 hover:underline">
                    Gå tillbaka
                </button>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-8 text-center border border-gray-100 dark:border-[#3c4043] shadow-sm animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bra jobbat!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Du har gått igenom alla kort för idag.</p>
                <button
                    onClick={onBack}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    Tillbaka till menyn
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Kort {currentIndex + 1} av {cards.length}</span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card Area - 3D Flip Effect Container */}
            <div className="group h-80 w-full [perspective:1000px] mb-8 cursor-pointer" onClick={handleFlip}>
                <div className={`relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

                    {/* Front */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-white dark:bg-[#1E1F20] border-2 border-indigo-100 dark:border-[#3c4043] shadow-xl p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
                        <span className="text-xs uppercase tracking-wider text-indigo-500 font-bold mb-4">Fråga</span>
                        <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-100">
                            {currentCard.front}
                        </h3>
                        <p className="absolute bottom-4 text-xs text-gray-400 flex items-center gap-1">
                            <RotateCw size={12} /> Klicka för att vända
                        </p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-indigo-50 dark:bg-[#282a2c] border-2 border-indigo-500 dark:border-indigo-800 shadow-xl p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <span className="text-xs uppercase tracking-wider text-indigo-500 font-bold mb-4">Svar</span>
                        <p className="text-xl text-gray-800 dark:text-gray-200">
                            {currentCard.back}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            {isFlipped ? (
                <div className="grid grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4">
                    <button onClick={() => handleRate(0)} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 transition-colors">
                        <span className="text-xs font-bold uppercase">Igen</span>
                        <span className="text-xs opacity-75">&lt; 1m</span>
                    </button>
                    <button onClick={() => handleRate(3)} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-colors">
                        <span className="text-xs font-bold uppercase">Svårt</span>
                        <span className="text-xs opacity-75">2d</span>
                    </button>
                    <button onClick={() => handleRate(4)} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                        <span className="text-xs font-bold uppercase">Bra</span>
                        <span className="text-xs opacity-75">4d</span>
                    </button>
                    <button onClick={() => handleRate(5)} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-200 transition-colors">
                        <span className="text-xs font-bold uppercase">Lätt</span>
                        <span className="text-xs opacity-75">7d</span>
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <button
                        onClick={handleFlip}
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        Visa Svar
                    </button>
                </div>
            )}
        </div>
    );
};

export default FlashcardPlayer;
