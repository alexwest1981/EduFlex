import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { Brain, TrendingUp, Target, Zap, ChevronRight, Loader2 } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';

const PrincipalCoachWidget = () => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsight();
    }, []);

    const fetchInsight = async () => {
        try {
            setLoading(true);
            const response = await api.analytics.predictive.getPrincipalCoach();
            setInsight(response);
        } catch (error) {
            console.error('Failed to fetch principal insight:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WidgetWrapper
            title="AI Rektorscoach"
            icon={<Brain size={20} className="text-purple-500" />}
            subtitle="Strategiska insikter för skolledningen"
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-purple-500" size={24} />
                    </div>
                ) : insight ? (
                    <>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={16} className="text-purple-500" />
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                    Veckans Fokus: {insight.priorityArea}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                "{insight.summary}"
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                    <Target size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rekommenderad Åtgärd</p>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white mt-0.5">
                                        {insight.actionPoint}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors border border-dashed border-purple-200 dark:border-purple-800">
                            Öppna Ledningsrapport <ChevronRight size={14} />
                        </button>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-500">Kunde inte hämta insikter.</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};

export default PrincipalCoachWidget;
