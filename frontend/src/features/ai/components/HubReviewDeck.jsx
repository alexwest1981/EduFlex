import React, { useState, useEffect } from 'react';
import {
    ChevronRight, RotateCcw, Brain,
    CheckCircle2, Trophy, Loader2,
    Zap, Star, Sparkles
} from 'lucide-react';
import { api } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const HubReviewDeck = ({ onComplete }) => {
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sessionXP, setSessionXP] = useState(0);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const data = await api.ai.getReviewQueue();
            setItems(data || []);
            if (!data || data.length === 0) {
                setCompleted(true);
            }
        } catch (error) {
            console.error('Failed to fetch review queue:', error);
            setItems([]);
            setCompleted(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (quality) => {
        if (submitting || !items[currentIndex]) return;
        setSubmitting(true);
        const currentItem = items[currentIndex];

        try {
            const result = await api.ai.processReviewResult(currentItem.id, quality);

            // Track XP from the response if available, or guestimate
            const earnedXP = quality * 10; // Placeholder if backend return not used
            setSessionXP(prev => prev + earnedXP);

            if (currentIndex < items.length - 1) {
                setIsFlipped(false);
                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                    setSubmitting(false);
                }, 300);
            } else {
                setCompleted(true);
                setSubmitting(false);
                if (onComplete) onComplete();
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-black/20 rounded-3xl border border-gray-100 dark:border-white/5">
                <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Laddar din personliga kunskaps-kö...</p>
            </div>
        );
    }

    if (completed || items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-black/20 p-12 rounded-3xl border border-green-500/20 text-center shadow-2xl"
            >
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <Trophy className="text-green-500" size={48} />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" size={24} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-none">
                    {items.length === 0 ? 'Allt är repeterat!' : 'Mästerligt!'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">
                    {items.length === 0
                        ? 'Din kunskaps-kö är tom. Bra jobbat! Fortsätt studera lektioner för att fylla på mer.'
                        : 'Du har klarat av din dagliga repetition. Din hjärna är nu i toppskick!'}
                </p>

                {sessionXP > 0 && (
                    <div className="bg-brand-orange/10 border border-brand-orange/20 px-8 py-4 rounded-2xl flex items-center justify-between mb-8 max-w-xs mx-auto">
                        <div className="flex items-center gap-3">
                            <Zap className="text-brand-orange" size={24} fill="currentColor" />
                            <span className="text-gray-900 dark:text-white font-bold uppercase tracking-wider">Tjänad XP</span>
                        </div>
                        <span className="text-brand-orange font-black text-2xl">+{sessionXP}</span>
                    </div>
                )}

                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-10 py-4 bg-brand-orange hover:brightness-110 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-orange/30 uppercase tracking-widest text-sm"
                >
                    Tillbaka till Dashboard
                </button>
            </motion.div>
        );
    }

    const currentItem = items[currentIndex];
    const progress = (currentIndex / items.length) * 100;

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Session Info */}
            <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                        <Brain size={28} />
                    </div>
                    <div>
                        <h2 className="text-gray-900 dark:text-white font-black text-xl uppercase tracking-tight">Active Learning</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{currentItem.category} Session</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10">
                    <span className="text-brand-orange font-black text-lg">{currentIndex + 1}</span>
                    <span className="text-gray-400 font-bold"> / {items.length}</span>
                </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="px-4 mb-10">
                <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden p-1 border border-gray-200 dark:border-white/10 shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-brand-orange rounded-xl shadow-[0_0_20px_rgba(255,102,0,0.4)] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    </motion.div>
                </div>
            </div>

            {/* Card Content - Glassmorphic v2.0 */}
            <div
                className="group relative h-[450px] w-full perspective-2000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div
                    className={`relative h-full w-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                    {/* Front */}
                    <div className="absolute inset-0 h-full w-full bg-white dark:bg-[#1C1D1E] border border-gray-200 dark:border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-orange/5 blur-[60px] rounded-full"></div>

                        <div className="bg-brand-orange/10 px-4 py-1.5 rounded-full text-brand-orange text-[10px] font-black uppercase tracking-widest mb-8 border border-brand-orange/20">
                            Fråga / Koncept
                        </div>

                        <p className="text-3xl text-gray-900 dark:text-white font-black leading-tight max-w-md">
                            {currentItem.title}
                        </p>

                        <div className="absolute bottom-10 flex items-center gap-3 text-gray-400 font-bold text-xs">
                            <RotateCcw size={16} className="text-brand-orange animate-spin-slow" />
                            <span className="uppercase tracking-widest">Klicka för att se svar</span>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 h-full w-full bg-[#1C1D1E] dark:bg-[#0A0A0A] border-2 border-brand-orange/30 rounded-[40px] p-12 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden shadow-2xl relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full"></div>

                        <div className="bg-indigo-500/10 px-4 py-1.5 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8 border border-indigo-500/20">
                            Förklaring / Svar
                        </div>

                        <div className="max-h-[220px] overflow-y-auto scrollbar-hide pr-2">
                            <p className="text-xl text-gray-200 font-semibold leading-relaxed">
                                {currentItem.content}
                            </p>
                        </div>

                        <div className="absolute bottom-10 flex items-center gap-3 text-indigo-400/50 font-bold text-xs">
                            <RotateCcw size={16} />
                            <span className="uppercase tracking-widest">Vänd tillbaka</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls - Premium Rating Grid */}
            <div className="mt-12 px-4">
                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-100 dark:bg-white/5 p-4 rounded-[32px] border border-gray-200 dark:border-white/10 grid grid-cols-4 gap-4"
                        >
                            {[
                                { val: 1, label: 'Igen', icon: '😫', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                                { val: 3, label: 'Svårt', icon: '😟', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                                { val: 4, label: 'Bra', icon: '😊', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                                { val: 5, label: 'Enkelt', icon: '😎', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' }
                            ].map((btn) => (
                                <button
                                    key={btn.val}
                                    onClick={(e) => { e.stopPropagation(); handleRate(btn.val); }}
                                    className={`flex flex-col items-center gap-3 p-5 ${btn.bg} border ${btn.border} rounded-2xl hover:brightness-110 active:scale-95 transition-all group`}
                                >
                                    <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{btn.icon}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${btn.color}`}>{btn.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isFlipped && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center bg-brand-orange/5 py-8 rounded-[32px] border border-dashed border-brand-orange/30 border-2"
                    >
                        <p className="text-brand-orange font-black uppercase tracking-[0.2em] text-xs">
                            Klicka på kortet för att utvärdera din kunskap
                        </p>
                    </motion.div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-2000 { perspective: 2000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .animate-spin-slow { animation: spin 8s linear infinite; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default HubReviewDeck;
