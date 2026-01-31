import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Sparkles, AlertTriangle, ArrowRight, BookOpen, Clock, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AIPersonalizationWidget = ({ userId, isTeacher = false, variant = 'full' }) => {
    const { t } = useTranslation();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalysis();
    }, [userId]);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const data = userId
                ? await api.personalization.getUserAnalysis(userId)
                : await api.personalization.getMyAnalysis();
            setAnalysis(data);
        } catch (error) {
            console.error("Failed to fetch AI analysis", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#202124] rounded-2xl p-6 border border-gray-100 dark:border-[#3c4043] shadow-sm animate-pulse">
                <div className="h-6 w-48 bg-gray-200 dark:bg-[#303134] rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-20 bg-gray-100 dark:bg-[#303134] rounded-xl"></div>
                    <div className="h-20 bg-gray-100 dark:bg-[#303134] rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!analysis || (analysis.recommendations?.length === 0 && analysis.riskLevel === 0)) {
        return null;
    }

    const getRiskColor = (level) => {
        if (level > 70) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
        if (level > 40) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    };

    const getRiskLabel = (level) => {
        if (level > 70) return 'Hög risk';
        if (level > 40) return 'Medelrisk';
        return 'Låg risk';
    };

    return (
        <div className={variant === 'compact' ? 'flex flex-col h-full' : 'bg-white dark:bg-[#202124] rounded-2xl border border-gray-100 dark:border-[#3c4043] shadow-sm overflow-hidden flex flex-col h-full'}>
            <div className={`p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center ${variant === 'compact' ? 'py-4' : 'bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent'}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Sparkles size={variant === 'compact' ? 16 : 20} />
                    </div>
                    <h3 className={`font-bold text-gray-900 dark:text-white ${variant === 'compact' ? 'text-sm' : ''}`}>
                        {isTeacher ? "AI-Insikter & Rekommendationer" : "Personliga Studietips"}
                    </h3>
                </div>
                {isTeacher && analysis.riskLevel > 0 && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getRiskColor(analysis.riskLevel)}`}>
                        <AlertTriangle size={14} />
                        {getRiskLabel(analysis.riskLevel)} ({analysis.riskLevel}%)
                    </div>
                )}
            </div>

            <div className={`${variant === 'compact' ? 'p-4' : 'p-6'} space-y-6 flex-grow`}>
                {/* Risk Rationale - Only for teachers */}
                {isTeacher && analysis.riskRationale && (
                    <div className="bg-gray-50 dark:bg-[#303134] p-4 rounded-xl border-l-4 border-indigo-500">
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            "{analysis.riskRationale}"
                        </p>
                    </div>
                )}

                {/* Recommendations */}
                <div className={variant === 'compact' ? 'space-y-2' : ''}>
                    {!isTeacher && variant === 'compact' ? null : (
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Target size={14} /> Föreslagna aktiviteter
                        </h4>
                    )}
                    <div className={variant === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
                        {analysis.recommendations.map((rec, idx) => (
                            <div key={idx} className="group relative bg-white dark:bg-[#202124] border border-gray-100 dark:border-[#3c4043] hover:border-indigo-200 dark:hover:border-indigo-900/50 p-3 rounded-xl transition-all hover:shadow-md cursor-pointer">
                                <div className="flex gap-3">
                                    <div className="shrink-0 p-2 bg-gray-50 dark:bg-[#303134] rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                        {rec.type === 'LESSON' ? <BookOpen size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600" /> : <Clock size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600" />}
                                    </div>
                                    <div className="flex-grow">
                                        <h5 className="font-bold text-[13px] text-gray-900 dark:text-white line-clamp-1">{rec.title}</h5>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{rec.reason}</p>
                                    </div>
                                    <div className="flex items-center text-gray-300 group-hover:text-indigo-600 transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coaching Advice */}
                {analysis.studyPathAdvice && (
                    <div className="pt-2">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Coachande råd</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {analysis.studyPathAdvice}
                        </p>
                    </div>
                )}
            </div>

            {isTeacher && (
                <div className="p-4 bg-gray-50/50 dark:bg-[#1a1b1e] border-t border-gray-100 dark:border-[#3c4043] text-center">
                    <button
                        onClick={fetchAnalysis}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                        Uppdatera AI-analys
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIPersonalizationWidget;
