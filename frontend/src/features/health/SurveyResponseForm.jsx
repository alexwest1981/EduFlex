import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, Clock } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const SurveyResponseForm = () => {
    const { distributionId } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        api.elevhalsa.getSurveyDetails(distributionId)
            .then(data => {
                setSurvey(data);
                const initial = {};
                (data.questions || []).forEach(q => {
                    initial[q.id] = '';
                });
                setAnswers(initial);
            })
            .catch(err => {
                toast.error('Kunde inte ladda enkäten');
            })
            .finally(() => setLoading(false));
    }, [distributionId]);

    const setAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (!survey) return;

        const required = survey.questions.filter(q => q.required !== false);
        const missing = required.filter(q => {
            const val = answers[q.id];
            return val === '' || val === undefined || val === null;
        });

        if (missing.length > 0) {
            toast.error(`Besvara alla obligatoriska frågor (${missing.length} saknas)`);
            return;
        }

        setSubmitting(true);
        try {
            await api.elevhalsa.submitSurvey(distributionId, { answers });
            setSubmitted(true);
            toast.success('Tack för ditt svar!');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Kunde inte skicka in svaret';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 animate-in fade-in duration-500">
                <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mb-4">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Tack för ditt svar!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Dina svar har sparats.</p>
                <button onClick={() => navigate('/')}
                    className="px-6 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-medium hover:bg-brand-teal/90 transition-colors">
                    Tillbaka till startsidan
                </button>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Enkäten kunde inte hittas.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand-teal/20 rounded-xl shrink-0">
                        <FileText className="w-6 h-6 text-brand-teal" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{survey.title}</h1>
                        {survey.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{survey.description}</p>
                        )}
                        {survey.deadline && (
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Deadline: {new Date(survey.deadline).toLocaleDateString('sv-SE')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Questions */}
            {(survey.questions || []).map((q, idx) => (
                <div key={q.id} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
                    <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 mt-0.5">{idx + 1}.</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                                {q.questionText}
                                {q.required !== false && <span className="text-rose-500 ml-1">*</span>}
                            </p>
                        </div>
                    </div>

                    {/* RATING 1-5 */}
                    {q.questionType === 'RATING_1_5' && (
                        <div className="flex gap-2 pt-1">
                            {[1, 2, 3, 4, 5].map(val => (
                                <button key={val}
                                    onClick={() => setAnswer(q.id, val)}
                                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all
                                        ${answers[q.id] === val
                                            ? 'bg-brand-teal text-white scale-110 shadow-lg'
                                            : 'bg-slate-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}>
                                    {val}
                                </button>
                            ))}
                            <div className="flex items-center ml-2 text-[10px] text-gray-400 gap-4">
                                <span>1 = Instämmer inte</span>
                                <span>5 = Instämmer helt</span>
                            </div>
                        </div>
                    )}

                    {/* FREE TEXT */}
                    {q.questionType === 'FREE_TEXT' && (
                        <textarea
                            value={answers[q.id] || ''}
                            onChange={e => setAnswer(q.id, e.target.value)}
                            placeholder="Skriv ditt svar..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 ring-brand-teal/30 dark:text-white resize-none"
                        />
                    )}

                    {/* MULTIPLE CHOICE */}
                    {q.questionType === 'MULTIPLE_CHOICE' && (() => {
                        let options = [];
                        try { options = JSON.parse(q.optionsJson); } catch (e) { console.error("Error parsing question options", e); }
                        return (
                            <div className="space-y-2 pt-1">
                                {options.map((opt, oi) => (
                                    <button key={oi}
                                        onClick={() => setAnswer(q.id, opt)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border
                                            ${answers[q.id] === opt
                                                ? 'bg-brand-teal/10 border-brand-teal text-brand-teal font-bold'
                                                : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-brand-teal/30'
                                            }`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        );
                    })()}

                    {/* YES/NO */}
                    {q.questionType === 'YES_NO' && (
                        <div className="flex gap-3 pt-1">
                            {[{ label: 'Ja', value: '1' }, { label: 'Nej', value: '0' }].map(opt => (
                                <button key={opt.value}
                                    onClick={() => setAnswer(q.id, opt.value)}
                                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all border
                                        ${String(answers[q.id]) === opt.value
                                            ? 'bg-brand-teal/10 border-brand-teal text-brand-teal'
                                            : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-brand-teal/30'
                                        }`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Submit */}
            <div className="flex justify-end pb-8">
                <button onClick={handleSubmit} disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-teal text-white rounded-xl text-sm font-bold hover:bg-brand-teal/90 disabled:opacity-50 transition-colors shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                    {submitting ? 'Skickar...' : 'Skicka in svar'}
                </button>
            </div>
        </div>
    );
};

export default SurveyResponseForm;
