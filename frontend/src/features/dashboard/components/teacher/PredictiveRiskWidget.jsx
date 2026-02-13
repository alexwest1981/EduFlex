```
import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { AlertTriangle, Info, Brain, ChevronRight, User, RefreshCw } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';
import { toast } from 'react-hot-toast';

const PredictiveRiskWidget = ({ mentorId }) => {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchRisks();
    }, [mentorId]);

    const fetchRisks = async () => {
        try {
            setLoading(true);
            const response = mentorId
                ? await api.analytics.predictive.getHighRiskForMentor(mentorId)
                : await api.analytics.predictive.getHighRisk();
            setRisks(response);
        } catch (error) {
            console.error('Failed to fetch risk flags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReanalyze = async () => {
        try {
            setAnalyzing(true);
            toast.loading('Kör batch-analys...', { id: 'batch-risk' });
            await api.analytics.predictive.analyzeAll();
            toast.success('Analys startad!', { id: 'batch-risk' });
            // We wait a bit then refresh
            setTimeout(fetchRisks, 5000);
        } catch (error) {
            toast.error('Misslyckades att starta analys', { id: 'batch-risk' });
        } finally {
            setAnalyzing(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            case 'HIGH': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
        }
    };

    const getRiskIcon = (level) => {
        if (level === 'CRITICAL' || level === 'HIGH') return <AlertTriangle size={16} />;
        return <Info size={16} />;
    };

    return (
        <WidgetWrapper
            title="Prediktiv Riskövervakning"
            icon={<AlertTriangle size={20} className="text-orange-500" />}
            subtitle="AI-identifierade elever med behov av stöd"
            actions={
                <button
                    onClick={handleReanalyze}
                    disabled={analyzing}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 group"
                    title="Kör ny batch-analys"
                >
                    <RefreshCw size={16} className={`${ analyzing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500' } `} />
                </button>
            }
        >
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : risks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                            <Info className="text-green-600" size={24} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Inga elever flaggade som högrisk just nu.</p>
                    </div>
                ) : (
                    risks.map((risk) => (
                        <div
                            key={risk.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                            {risk.student.fullName}
                                        </h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text - [10px] px - 1.5 py - 0.5 rounded - full font - medium flex items - center gap - 1 ${ getRiskColor(risk.riskLevel) } `}>
                                                {getRiskIcon(risk.riskLevel)}
                                                {risk.riskLevel}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                {risk.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md text-gray-400 hover:text-orange-500 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <div className="mt-3 bg-white/50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                                    "{risk.aiReasoning}"
                                </p>
                            </div>

                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-orange-600 dark:text-orange-400">
                                <Brain size={12} />
                                <span>AI-förslag: {risk.aiSuggestions.substring(0, 40)}...</span>
                            </div>
                        </div>
                    ))
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button className="w-full py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        Visa Fullständig Analysrapport
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default PredictiveRiskWidget;
