import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, ArrowRight, Zap } from 'lucide-react';
import { api } from '../../services/api';

const AdaptiveWidget = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);

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

                <button
                    onClick={() => navigate('/adaptive-learning')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                    Visa Min Lärväg <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default AdaptiveWidget;
