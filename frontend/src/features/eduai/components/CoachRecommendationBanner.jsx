import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, BrainCircuit } from 'lucide-react';
import eduAiService from '../services/eduAiService';

const CoachRecommendationBanner = () => {
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchRecommendation();
    }, []);

    const fetchRecommendation = async () => {
        try {
            const response = await eduAiService.getCoachRecommendation();
            setRecommendation(response.data);
        } catch (error) {
            console.error('Failed to fetch coach recommendation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async () => {
        if (!recommendation) return;
        setIsVisible(false);
        try {
            await eduAiService.markRecommendationAsRead(recommendation.id);
        } catch (error) {
            console.error('Failed to mark recommendation as read:', error);
        }
    };

    if (loading || !recommendation || !isVisible) return null;

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 border border-indigo-500/30 rounded-3xl p-6 mb-8 shadow-xl shadow-indigo-500/10 animate-in fade-in slide-in-from-top duration-500">
            {/* Animated background particles */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 blur-[80px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 blur-[80px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="relative flex items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                    <BrainCircuit className="text-indigo-300 w-8 h-8 animate-pulse" />
                </div>

                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="text-yellow-400 w-4 h-4" />
                        <span className="text-indigo-200 text-sm font-bold tracking-wider uppercase">Coach EduAI Tipsar</span>
                    </div>
                    <h3 className="text-white text-lg font-bold mb-1 leading-tight">
                        {recommendation.type === 'DAILY_TIP' ? 'Dagens tips!' :
                            recommendation.type === 'NEXT_ACTION' ? 'Ditt nästa steg' :
                                'Heja dig!'}
                    </h3>
                    <p className="text-indigo-100 text-md opacity-90 max-w-2xl">
                        {recommendation.content}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {recommendation.actionUrl && (
                        <a
                            href={recommendation.actionUrl}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                        >
                            Gör det nu
                            <ArrowRight size={18} />
                        </a>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Dölj tips"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoachRecommendationBanner;
