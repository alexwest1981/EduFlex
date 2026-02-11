import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BarChart3, Users, CheckCircle,
    MessageSquare, TrendingUp, FileText
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const SurveyResults = () => {
    const { distributionId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.elevhalsa.getSurveyResults(distributionId)
            .then(data => setResults(data))
            .catch(() => toast.error('Kunde inte ladda resultat'))
            .finally(() => setLoading(false));
    }, [distributionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="text-center py-20 text-gray-400">Inga resultat att visa.</div>
        );
    }

    const statusLabel = { DRAFT: 'Utkast', ACTIVE: 'Aktiv', CLOSED: 'Stängd' };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/health-dashboard')}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-indigo-500" />
                        </div>
                        Resultat: {results.templateTitle}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {statusLabel[results.status] || results.status} &middot; Målgrupp: {results.targetRole?.replace('ROLE_', '')}
                    </p>
                </div>
            </div>

            {/* Response Rate */}
            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-teal" />
                        Svarsfrekvens
                    </h3>
                    <span className="text-2xl font-extrabold text-brand-teal">{results.responseRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-black/20 rounded-full h-3 overflow-hidden">
                    <div className="bg-brand-teal h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${results.responseRate}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {results.totalResponded} av {results.totalTargeted} har svarat
                </p>
            </div>

            {/* Question Stats */}
            {(results.questionStats || []).map((qs, idx) => (
                <div key={qs.questionId} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 bg-slate-100 dark:bg-black/20 px-2 py-1 rounded-lg">{idx + 1}</span>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{qs.questionText}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">
                                {qs.questionType === 'RATING_1_5' ? 'Betyg 1-5' :
                                    qs.questionType === 'FREE_TEXT' ? 'Fritext' :
                                        qs.questionType === 'MULTIPLE_CHOICE' ? 'Flerval' : 'Ja/Nej'}
                                &nbsp;&middot;&nbsp;{qs.answerCount} svar
                            </p>
                        </div>
                    </div>

                    {/* RATING 1-5 */}
                    {qs.questionType === 'RATING_1_5' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-brand-teal" />
                                <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{qs.average}</span>
                                <span className="text-sm text-gray-400">/ 5</span>
                            </div>
                            <div className="space-y-1.5">
                                {[5, 4, 3, 2, 1].map(val => {
                                    const count = qs.distribution?.[val] || qs.distribution?.[String(val)] || 0;
                                    const pct = qs.answerCount > 0 ? Math.round(count / qs.answerCount * 100) : 0;
                                    return (
                                        <div key={val} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-gray-500 w-4 text-right">{val}</span>
                                            <div className="flex-1 bg-slate-100 dark:bg-black/20 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-brand-teal/70 h-2.5 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-400 w-12 text-right">{count} ({pct}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* YES/NO */}
                    {qs.questionType === 'YES_NO' && (
                        <div className="flex gap-6">
                            {[{ label: 'Ja', count: qs.yes || 0, color: 'bg-emerald-500' },
                            { label: 'Nej', count: qs.no || 0, color: 'bg-rose-500' }].map(opt => {
                                const total = (qs.yes || 0) + (qs.no || 0);
                                const pct = total > 0 ? Math.round(opt.count / total * 100) : 0;
                                return (
                                    <div key={opt.label} className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{opt.label}</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{pct}%</span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-black/20 rounded-full h-3 overflow-hidden">
                                            <div className={`${opt.color} h-3 rounded-full transition-all duration-700`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{opt.count} svar</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* MULTIPLE CHOICE */}
                    {qs.questionType === 'MULTIPLE_CHOICE' && qs.optionCounts && (
                        <div className="space-y-2">
                            {Object.entries(qs.optionCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([option, count]) => {
                                    const pct = qs.answerCount > 0 ? Math.round(count / qs.answerCount * 100) : 0;
                                    return (
                                        <div key={option}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-slate-700 dark:text-gray-300">{option}</span>
                                                <span className="text-xs font-bold text-gray-500">{count} ({pct}%)</span>
                                            </div>
                                            <div className="bg-slate-100 dark:bg-black/20 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-indigo-500/70 h-2.5 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {/* FREE TEXT */}
                    {qs.questionType === 'FREE_TEXT' && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {(qs.freeTextAnswers || []).length === 0 ? (
                                <p className="text-sm text-gray-400 italic">Inga fritextsvar.</p>
                            ) : (
                                (qs.freeTextAnswers || []).map((text, ti) => (
                                    <div key={ti} className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="pb-8" />
        </div>
    );
};

export default SurveyResults;
