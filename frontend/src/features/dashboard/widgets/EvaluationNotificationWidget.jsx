import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, Star, Clock } from 'lucide-react';
import { api } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EvaluationNotificationWidget = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchEvaluations = async () => {
            try {
                const data = await api.evaluations.getMyActive();
                setEvaluations(data || []);
            } catch (error) {
                console.error("Failed to fetch evaluations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvaluations();
    }, []);

    if (isLoading) return null;
    if (evaluations.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 dark:shadow-none overflow-hidden relative group transition-all hover:scale-[1.01]">
            {/* Decoration */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <div className="absolute top-1/2 -left-8 w-24 h-24 bg-rose-400/20 rounded-full blur-xl animate-pulse"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <MessageSquare size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Din röst är viktig!</h3>
                        <p className="text-rose-100 text-xs font-medium uppercase tracking-wider">Väntande utvärderingar ({evaluations.length})</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {evaluations.map(evaluation => (
                        <div
                            key={evaluation.id}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 transition-all cursor-pointer group/item"
                            onClick={() => navigate(`/evaluations/student/${evaluation.id}`)}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate mb-1">{evaluation.title}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-rose-100">
                                        <Clock size={10} />
                                        <span>Aktiverad {new Date(evaluation.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="bg-white text-rose-600 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all translate-x-2 group-hover/item:translate-x-0">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-rose-100/80">
                    <div className="flex items-center gap-1">
                        <Star size={10} className="fill-current" />
                        <span>Hjälp oss bli bättre</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationNotificationWidget;
