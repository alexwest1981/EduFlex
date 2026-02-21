import React, { useState, useEffect } from 'react';
import {
    Brain, CheckCircle2, Trophy, Loader2,
    Zap, Sparkles, BookOpen, Target, ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

const HubReviewDeck = ({ onComplete }) => {
    const [step, setStep] = useState('SETUP'); // SETUP, LOADING, LEARNING, QUIZ, RESULTS
    const [courses, setCourses] = useState([]);
    const [config, setConfig] = useState({ courseId: '', sessionType: 'SUMMARY' });
    const [sessionData, setSessionData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [earnedXP, setEarnedXP] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [improvementData, setImprovementData] = useState(null);
    const [oldMaxScore, setOldMaxScore] = useState(0); // Added oldMaxScore state

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const myCourses = await api.courses.getMyCourses(user.id);
                    setCourses(myCourses || []);
                }
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            }
        };
        fetchCourses();
    }, []);

    const handleGenerate = async () => {
        setStep('LOADING');
        try {
            const data = await api.ai.generateSession({
                courseId: config.courseId === '' ? null : Number(config.courseId),
                sessionType: config.sessionType
            });
            if (!data || !data.material) {
                throw new Error("Invalid format from AI");
            }
            setSessionData(data);
            setStep('LEARNING');
        } catch (error) {
            console.error("Failed to generate session", error);
            alert("Kunde inte generera sessionen. AI:n kanske behöver vila lite. Försök igen.");
            setStep('SETUP');
        }
    };

    const finishSession = async (finalAnswers) => {
        setIsSubmitting(true);
        toast.loading("Utvärderar session..."); // Using toast from react-hot-toast

        try {
            const correctCount = finalAnswers.filter(a => a.isCorrect).length;
            const xpToAward = correctCount * 50;

            const payload = {
                courseId: config.courseId === '' ? null : Number(config.courseId), // Use config.courseId
                sessionType: config.sessionType, // Use config.sessionType
                score: correctCount,
                maxScore: finalAnswers.length
            };

            // Call backend: save AiSessionResult & add points
            const response = await api.ai.completeSession(payload, xpToAward);

            if (response.data) {
                setImprovementData(response.data);
                if (response.data.previousBestScore) {
                    setOldMaxScore(response.data.previousBestScore.maxScore);
                }
            }

            setEarnedXP(xpToAward);

            // Trigger background refresh of Radar
            api.ai.getHubStats().then(res => {
                if (window.updateHubStats) {
                    window.updateHubStats(res.data);
                }
            }).catch(console.error);

            toast.success(`Session slutförd! ${xpToAward} XP intjänat.`);
            setStep('RESULTS');

        } catch (error) {
            console.error("Kunde inte avsluta session:", error);
            toast.error("Kunde inte registrera resultat.");
            setStep('RESULTS');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswerQuestion = (selectedIdx) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const isCorrect = selectedIdx === sessionData.questions[currentQuestionIndex].correctAnswerIndex;
        const newAnswers = [...answers, { selected: selectedIdx, isCorrect }];
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentQuestionIndex < sessionData.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setIsSubmitting(false);
            } else {
                finishSession(newAnswers);
            }
        }, 800);
    };


    if (step === 'SETUP') {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1C1D1E] p-8 md:p-12 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-xl w-full max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                        <Brain size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ny Studiesession</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">Låt AI:n skapa en personlig lektion för dig.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Välj Ämne (Valfritt)</label>
                        <select
                            value={config.courseId}
                            onChange={(e) => setConfig({ ...config, courseId: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-[#282A2C] border-2 border-gray-100 dark:border-white/5 rounded-xl px-4 py-4 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
                        >
                            <option value="">-- Allmänt --</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Typ av Session</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['SUMMARY', 'PRACTICE', 'EXAM_PREP'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setConfig({ ...config, sessionType: type })}
                                    className={`px-4 py-4 rounded-xl border-2 font-bold transition-all text-sm flex flex-col items-center gap-2 ${config.sessionType === type ? 'border-brand-orange bg-brand-orange/10 text-brand-orange dark:text-brand-orange' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#282A2C] text-gray-500 hover:border-brand-orange/40'}`}
                                >
                                    {type === 'SUMMARY' ? <BookOpen size={20} /> : type === 'PRACTICE' ? <Target size={20} /> : <Zap size={20} />}
                                    {type === 'SUMMARY' ? 'Sammanfattning' : type === 'PRACTICE' ? 'Övningar' : 'Tentaplugg'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full mt-4 bg-brand-orange text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2"
                    >
                        <Sparkles size={18} />
                        Börja Generera
                    </button>
                </div>
            </motion.div>
        );
    }

    if (step === 'LOADING') {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-[#1C1D1E] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl max-w-xl mx-auto w-full text-center">
                <div className="relative mb-8">
                    <Loader2 className="w-16 h-16 text-brand-orange animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">AI:n läser in materialet...</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">Din tutor bygger ihop en strukturerad session baserat på ditt kursinnehåll.</p>
            </div>
        );
    }

    if (step === 'LEARNING') {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1C1D1E] p-6 sm:p-10 md:p-12 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl w-full max-w-4xl mx-auto text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                        {sessionData?.title || "Interaktiv Lektion"}
                    </h2>
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2 w-fit">
                        <BookOpen size={16} /> Läs Fas
                    </div>
                </div>

                <div className="prose dark:prose-invert prose-indigo max-w-none text-left prose-pre:bg-[#1E1F20] prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-white/10 prose-pre:shadow-inner prose-code:font-mono">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {sessionData?.material}
                    </ReactMarkdown>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex justify-end">
                    <button
                        onClick={() => {
                            if (sessionData?.questions?.length > 0) {
                                setStep('QUIZ');
                            } else {
                                finishSession([]);
                            }
                        }}
                        className="w-full sm:w-auto bg-brand-orange text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-3"
                    >
                        Testa mina kunskaper
                        <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        );
    }

    if (step === 'QUIZ') {
        const question = sessionData.questions[currentQuestionIndex];
        const isAnswered = answers.length > currentQuestionIndex;
        const currentAnswer = isAnswered ? answers[currentQuestionIndex] : null;

        return (
            <AnimatePresence mode="wait">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key={currentQuestionIndex} className="bg-white dark:bg-[#1C1D1E] p-8 md:p-12 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl w-full max-w-3xl mx-auto text-center">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                        Fråga {currentQuestionIndex + 1} av {sessionData.questions.length}
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-10 leading-tight">
                        {question.question}
                    </h3>

                    <div className="space-y-3 relative">
                        {question.options.map((opt, idx) => {
                            let btnClass = "w-full text-left p-5 rounded-2xl border-2 font-semibold text-lg transition-all ";

                            if (isAnswered) {
                                if (idx === question.correctAnswerIndex) {
                                    btnClass += "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                } else if (idx === currentAnswer.selected && !currentAnswer.isCorrect) {
                                    btnClass += "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                                } else {
                                    btnClass += "border-gray-100 dark:border-white/5 bg-transparent opacity-50";
                                }
                            } else {
                                btnClass += "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#282A2C] text-gray-700 dark:text-gray-300 hover:border-brand-orange hover:bg-brand-orange/5 dark:hover:bg-brand-orange/10 cursor-pointer";
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={isAnswered || isSubmitting}
                                    onClick={() => handleAnswerQuestion(idx)}
                                    className={btnClass}
                                >
                                    <span className="inline-block w-8 font-black opacity-50">{String.fromCharCode(65 + idx)}.</span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (step === 'RESULTS') {
        const correctCount = answers.filter(a => a.isCorrect).length;
        const allCorrect = correctCount === answers.length && answers.length > 0;

        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1C1D1E] p-12 rounded-[32px] border-2 border-green-500/20 text-center shadow-2xl w-full max-w-xl mx-auto">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <Trophy className="text-green-500" size={48} />
                    {allCorrect && <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" size={24} />}
                </div>

                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-none">
                    {allCorrect ? 'Perfekt Resultat!' : 'Mycket bra jobbat!'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">
                    Du svarade rätt på {correctCount} av {answers.length} frågor i denna session.
                </p>

                {earnedXP > 0 && (
                    <div className="bg-brand-orange/10 border border-brand-orange/20 px-8 py-5 rounded-2xl flex items-center justify-between mb-6 mx-auto transform hover:scale-105 transition-transform max-w-sm">
                        <div className="flex items-center gap-3">
                            <Zap className="text-brand-orange" size={24} />
                            <span className="font-bold text-brand-orange uppercase tracking-wider text-sm">Intjänad XP</span>
                        </div>
                        <span className="text-2xl font-black text-brand-orange">+{earnedXP}</span>
                    </div>
                )}

                {improvementData?.improvementPercentage !== undefined && (
                    <div className="bg-gray-50 dark:bg-[#282A2C] border border-gray-100 dark:border-white/5 p-6 rounded-2xl text-left mb-10 max-w-sm mx-auto flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                Utveckling
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Senaste: {improvementData.previousScore}/{improvementData.previousMaxScore} rätt
                            </div>
                        </div>
                        <div className={`text-xl font-black flex items-center gap-1 ${improvementData.improvementPercentage > 0 ? 'text-green-500' :
                            improvementData.improvementPercentage < 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                            {improvementData.improvementPercentage > 0 ? '+' : ''}{improvementData.improvementPercentage}%
                        </div>
                    </div>
                )}

                <button
                    onClick={onComplete}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 w-full sm:w-auto mx-auto rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center gap-2 justify-center"
                >
                    <CheckCircle2 size={20} />
                    Avsluta Session
                </button>
            </motion.div>
        );
    }

    return null;
};

export default HubReviewDeck;
