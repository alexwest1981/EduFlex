import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Star, Send, ChevronRight, ChevronLeft, CheckCircle2, Info } from 'lucide-react';

const EvaluationForm = ({ instanceId, onComplete }) => {
    const navigate = useNavigate();
    const [instance, setInstance] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInstance();
    }, [instanceId]);

    const fetchInstance = async () => {
        try {
            setLoading(true);
            // In a real app, we'd have an endpoint to get an instance for a student
            // For now, we fetch from the general course instances if we have access
            const response = await api.get(`/evaluations/instance/${instanceId}/details`);
            setInstance(response);
        } catch (err) {
            setError('Kunde inte hämta utvärderingen.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await api.post(`/evaluations/instance/${instanceId}/submit`, answers);
            setCompleted(true);
            if (onComplete) onComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Kunde inte skicka svar.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
            Laddar utvärdering...
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-50 dark:bg-red-500/5 rounded-[2.5rem] border border-red-100 dark:border-red-500/20">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ett fel uppstod</h3>
            <p className="text-red-500 font-medium">{error}</p>
        </div>
    );

    if (completed) return (
        <div className="flex flex-col items-center justify-center p-12 py-20 text-center animate-in fade-in zoom-in duration-500 bg-white dark:bg-[#1e1f20] border border-gray-100 dark:border-gray-800 rounded-[3rem] shadow-xl">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Tack för ditt svar!</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-lg leading-relaxed">
                Dina åsikter är otroligt värdefulla och hjälper oss att göra kursen ännu bättre för framtida elever.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="mt-10 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
                Gå tillbaka
            </button>
        </div>
    );

    const questions = instance?.template?.questions || [];
    if (questions.length === 0) return (
        <div className="p-20 text-center bg-white dark:bg-[#1e1f20] rounded-[3rem] border border-gray-100 dark:border-gray-800">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Inga frågor hittades i denna utvärdering.</p>
        </div>
    );

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const renderQuestionInput = (question) => {
        const value = answers[question.id] || '';

        switch (question.questionType) {
            case 'LIKERT':
                return (
                    <div className="grid grid-cols-5 gap-3 mt-10">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button
                                key={num}
                                onClick={() => handleAnswer(question.id, num.toString())}
                                className={`flex flex-col items-center justify-center py-6 rounded-3xl text-2xl font-black transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${value === num.toString()
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-600/40'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-500/30'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                );
            case 'NPS':
                return (
                    <div className="flex flex-wrap justify-center gap-2 mt-10">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <button
                                key={num}
                                onClick={() => handleAnswer(question.id, num.toString())}
                                className={`w-12 h-12 flex items-center justify-center rounded-2xl text-sm font-black transition-all duration-300 transform hover:scale-110 active:scale-90 border-2 ${value === num.toString()
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                );
            case 'EMOJI': {
                const emojis = [
                    { val: '1', label: '😞', text: 'Inte alls' },
                    { val: '2', label: '😐', text: 'Sådär' },
                    { val: '3', label: '😊', text: 'Bra' },
                    { val: '4', label: '🤩', text: 'Fantastiskt' }
                ];
                return (
                    <div className="grid grid-cols-4 gap-4 mt-10">
                        {emojis.map(e => (
                            <button
                                key={e.val}
                                onClick={() => handleAnswer(question.id, e.val)}
                                className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] transition-all duration-500 transform hover:scale-110 active:scale-95 border-2 ${value === e.val
                                    ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-2xl'
                                    : 'bg-transparent border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                                    }`}
                            >
                                <span className="text-5xl">{e.label}</span>
                                <span className={`text-[10px] uppercase font-black ${value === e.val ? 'text-blue-500' : 'text-slate-400'}`}>{e.text}</span>
                            </button>
                        ))}
                    </div>
                );
            }
            case 'TEXT':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder="Dela gärna med dig av dina tankar och förslag..."
                        className="w-full mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all min-h-[180px] shadow-inner text-lg"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 py-10">
            <div className="bg-white dark:bg-[#1e1f20] border border-gray-100 dark:border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden relative">
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 h-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-8 md:p-14">
                    <div className="flex justify-between items-center mb-10">
                        <div className="px-5 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest italic">
                                Fråga {currentQuestionIndex + 1} / {questions.length}
                            </span>
                        </div>
                        <div className="flex gap-1.5">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentQuestionIndex
                                        ? 'bg-blue-600 w-6'
                                        : i < currentQuestionIndex ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div key={currentQuestionIndex} className="animate-in slide-in-from-right-12 fade-in duration-700">
                        <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                            {currentQuestion?.questionText}
                        </h3>

                        {renderQuestionInput(currentQuestion)}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-16 pt-10 border-t border-gray-50 dark:border-gray-800">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:text-gray-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" /> Föregående
                        </button>

                        <div className="flex-1" />

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!answers[currentQuestion?.id] || submitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-2xl font-black shadow-2xl shadow-blue-600/30 transition-all transform active:scale-95 group"
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                ) : (
                                    <>
                                        Skicka in svar <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                disabled={!answers[currentQuestion?.id]}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black transition-all transform active:scale-95 border border-transparent shadow-xl group"
                            >
                                Nästa fråga <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">
                Driven av EduFlex AI • Dina svar förblir anonyma
            </p>
        </div>
    );
};

export default EvaluationForm;
