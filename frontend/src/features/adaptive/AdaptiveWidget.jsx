import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, ArrowRight, Zap, Lightbulb, Sparkles, X } from 'lucide-react';
import { api } from '../../services/api';

const AdaptiveWidget = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReasoning, setShowReasoning] = useState(false);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const response = await api.adaptive.getDashboard();
                if (response.recommendations && response.recommendations.length > 0) {
                    setRecommendation(response.recommendations[0]);
                }
            } catch (error) {
                console.error("Failed to fetch adaptive widget data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecs();
    }, []);

    if (loading) return null; // Don't show if loading

    // Fallback if no recommendation exists
    if (!recommendation) {
        return (
            <div className="bg-gradient-to-br from-brand-teal/10 to-brand-purple/10 rounded-xl p-5 border border-brand-teal/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Brain size={80} className="text-brand-teal" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-brand-teal/20 text-brand-teal text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Zap size={12} />
                            AI-Learning
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Starta din adaptiva resa
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Låt AI analysera din studietakt och ge personliga rekommendationer för att nå dina mål snabbare.
                    </p>

                    <button
                        onClick={() => navigate('/adaptive-learning')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-teal text-white text-sm font-medium rounded-lg shadow-sm hover:bg-brand-teal/90 transition-colors"
                    >
                        Aktivera Nu <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-purple/10 rounded-xl p-5 border border-brand-teal/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain size={80} className="text-brand-teal" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-brand-teal/20 text-brand-teal text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap size={12} />
                        AI-Rekommendation
                    </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {recommendation.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 min-h-[40px]">
                    {recommendation.description}
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/adaptive-learning')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        Visa Min Lärväg <ArrowRight size={16} />
                    </button>
                    <button
                        onClick={() => setShowReasoning(true)}
                        className="px-3 py-2 bg-brand-teal/10 text-brand-teal rounded-lg hover:bg-brand-teal/20 transition-colors"
                        title="Varför rekommenderas detta?"
                    >
                        <Lightbulb size={20} />
                    </button>
                </div>
            </div>

            {/* Reasoning Modal */}
            {showReasoning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 scale-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-teal/10 rounded-xl">
                                    <Sparkles className="text-brand-teal" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI-Insikt</h3>
                                    <p className="text-sm text-slate-500">Varför rekommenderas detta?</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowReasoning(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                "{recommendation.reasoningTrace || recommendation.aiReasoning || 'Ingen detaljerad analys tillgänglig.'}"
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowReasoning(false)}
                                className="px-5 py-2.5 bg-brand-teal text-white font-medium rounded-xl hover:bg-brand-teal/90 transition-colors"
                            >
                                Jag förstår
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdaptiveWidget;
