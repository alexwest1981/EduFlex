import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

const QuizPlayer = ({ quiz, currentUser, onClose }) => {
    const { t } = useTranslation();
    const [answers, setAnswers] = useState({}); // { questionId: optionId }
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    const handleSelect = (questionId, optionId) => {
        if (submitted) return;
        setAnswers({ ...answers, [questionId]: optionId });
    };

    const handleSubmit = async () => {
        // --- RÄTTNINGSLOGIK (Client-side för att matcha din nuvarande backend) ---
        let score = 0;
        let maxScore = quiz.questions.length;

        quiz.questions.forEach(q => {
            const selectedOptId = answers[q.id];
            const correctOpt = q.options.find(o => o.isCorrect);

            // Om eleven valt rätt alternativ (och alternativet finns)
            if (selectedOptId && correctOpt && selectedOptId === correctOpt.id) {
                score++;
            }
        });

        // Förbered payload enligt din QuizController
        const payload = {
            studentId: currentUser.id,
            score: score,
            maxScore: maxScore
        };

        try {
            await api.quiz.submit(quiz.id, payload);
            setResult({ score, maxScore });
            setSubmitted(true);
        } catch (e) {
            console.error(e);
            alert("Kunde inte skicka in resultat.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#3c4043]">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-[#3c4043] bg-indigo-600 text-white">
                    <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    <p className="text-indigo-100 mt-2">{quiz.description}</p>
                </div>

                {/* Questions List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50 dark:bg-[#131314]">
                    {quiz.questions.map((q, index) => (
                        <div key={q.id} className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex gap-3">
                                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 w-8 h-8 rounded-lg flex items-center justify-center text-sm">{index + 1}</span>
                                {q.text}
                            </h3>

                            <div className="space-y-3 pl-11">
                                {q.options.map(opt => {
                                    const isSelected = answers[q.id] === opt.id;
                                    const isCorrect = opt.isCorrect;

                                    let optionStyle = "border-gray-200 hover:bg-gray-50 dark:border-[#3c4043] dark:hover:bg-[#282a2c]";

                                    if (submitted) {
                                        if (isCorrect) optionStyle = "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400";
                                        else if (isSelected && !isCorrect) optionStyle = "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400";
                                    } else if (isSelected) {
                                        optionStyle = "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600";
                                    }

                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => handleSelect(q.id, opt.id)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${optionStyle}`}
                                        >
                                            <span className="font-medium dark:text-gray-300">{opt.text}</span>
                                            {submitted && isCorrect && <CheckCircle size={20} className="text-green-600"/>}
                                            {submitted && isSelected && !isCorrect && <XCircle size={20} className="text-red-600"/>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] flex justify-between items-center">
                    {submitted ? (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold">Ditt Resultat</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {result.score} <span className="text-lg text-gray-400">/ {result.maxScore}</span>
                                </p>
                            </div>
                            <button onClick={onClose} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl">
                                Stäng
                            </button>
                        </div>
                    ) : (
                        <>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold">{t('common.cancel')}</button>
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length < quiz.questions.length}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {t('quiz.submit_btn')} <ChevronRight size={18}/>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPlayer;
