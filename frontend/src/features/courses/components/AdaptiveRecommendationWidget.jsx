import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../../services/api';

const AdaptiveRecommendationWidget = ({ courseId, studentId }) => {
    const [recommendation, setRecommendation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadRecommendation = async () => {
        setIsLoading(true);
        try {
            const data = await api.adaptiveLearning.getRecommendation(courseId, studentId);
            setRecommendation(data);
        } catch (e) {
            console.error('Failed to load recommendation', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId && studentId) {
            loadRecommendation();
        }
    }, [courseId, studentId]);

    if (isLoading) {
        return (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 animate-pulse mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="animate-spin text-indigo-600" size={16} />
                    <span className="text-sm font-bold text-indigo-600">Analyserar ditt lärande...</span>
                </div>
            </div>
        );
    }

    if (!recommendation) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={80} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={20} className="text-yellow-300" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI-driven rekommendation</span>
                </div>

                <h3 className="text-xl font-bold mb-2">Ditt nästa steg</h3>
                <p className="text-indigo-100 leading-relaxed mb-4 max-w-2xl text-sm italic">
                    "{recommendation}"
                </p>

                <button
                    onClick={loadRecommendation}
                    className="text-[10px] font-bold flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                >
                    Uppdatera analys <ArrowRight size={10} />
                </button>
            </div>
        </div>
    );
};

export default AdaptiveRecommendationWidget;
