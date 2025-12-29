import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Trash2, PlusCircle, Award, CheckCircle, AlertTriangle } from 'lucide-react';

// --- QUIZ BUILDER (SKAPA / REDIGERA) ---
export const QuizBuilderModal = ({ onClose, onSubmit, courseId, initialData }) => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([
        { id: Date.now(), text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
    ]);

    // Ladda in data om vi redigerar ett befintligt quiz
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            if (initialData.questions && initialData.questions.length > 0) {
                const formattedQuestions = initialData.questions.map(q => ({
                    ...q,
                    options: q.options || [{ text: '', isCorrect: true }, { text: '', isCorrect: false }]
                }));
                setQuestions(formattedQuestions);
            }
        }
    }, [initialData]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now() + Math.random(), text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
        ]);
    };

    const updateQuestionText = (idx, text) => {
        const newQ = [...questions];
        newQ[idx].text = text;
        setQuestions(newQ);
    };

    const updateOptionText = (qIdx, oIdx, text) => {
        const newQ = [...questions];
        newQ[qIdx].options[oIdx].text = text;
        setQuestions(newQ);
    };

    const setCorrectOption = (qIdx, oIdx) => {
        const newQ = [...questions];
        newQ[qIdx].options.forEach(o => o.isCorrect = false);
        newQ[qIdx].options[oIdx].isCorrect = true;
        setQuestions(newQ);
    };

    const addOption = (qIdx) => {
        const newQ = [...questions];
        newQ[qIdx].options.push({ text: '', isCorrect: false });
        setQuestions(newQ);
    };

    const removeQuestion = (idx) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const quizData = {
            title,
            questions: questions.map(q => ({
                text: q.text,
                options: q.options.map(o => ({
                    text: o.text,
                    // VIKTIGT: Tvinga värdet till boolean (true/false) för att undvika null-fel i backend
                    isCorrect: o.isCorrect === true
                }))
            }))
        };
        // Skicka med ID om vi redigerar (initialData finns)
        onSubmit(quizData, initialData ? initialData.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <HelpCircle /> {initialData ? 'Redigera Quiz' : 'Skapa Quiz'}
                    </h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="mb-6">
                        <label className="block font-bold mb-1">Quiz Titel</label>
                        <input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="T.ex. Kunskapskontroll Java Basics" />
                    </div>

                    {questions.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="bg-gray-50 p-4 rounded-xl border mb-4 relative">
                            <button onClick={() => removeQuestion(qIdx)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button>

                            <label className="text-sm font-bold text-gray-500 mb-1">Fråga {qIdx + 1}</label>
                            <input
                                className="w-full border p-2 rounded mb-3 bg-white"
                                value={q.text}
                                onChange={e => updateQuestionText(qIdx, e.target.value)}
                                placeholder="Skriv frågan här..."
                            />

                            <div className="space-y-2">
                                {q.options.map((opt, oIdx) => (
                                    <div key={opt.id || oIdx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-${q.id || qIdx}`}
                                            checked={opt.isCorrect === true}
                                            onChange={() => setCorrectOption(qIdx, oIdx)}
                                            className="w-4 h-4 accent-green-600 cursor-pointer"
                                        />
                                        <input
                                            className="flex-1 border p-1 rounded text-sm"
                                            value={opt.text}
                                            onChange={e => updateOptionText(qIdx, oIdx, e.target.value)}
                                            placeholder={`Alternativ ${oIdx + 1}`}
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOption(qIdx)} className="text-xs text-indigo-600 font-bold hover:underline">+ Lägg till alternativ</button>
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors font-bold flex items-center justify-center gap-2">
                        <PlusCircle size={20} /> Lägg till fråga
                    </button>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600">Avbryt</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">
                        {initialData ? 'Spara Ändringar' : 'Skapa Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const QuizRunnerModal = ({ quiz, onClose, onSubmit }) => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (qId, optionId) => {
        if (submitted) return;
        setAnswers({ ...answers, [qId]: optionId });
    };

    const finishQuiz = () => {
        let correctCount = 0;
        quiz.questions.forEach(q => {
            const selectedOptionId = answers[q.id];
            const selectedOption = q.options.find(o => o.id === selectedOptionId);
            if (selectedOption && selectedOption.isCorrect) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setSubmitted(true);
        if(onSubmit) onSubmit(quiz.id, correctCount, quiz.questions.length);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {submitted && (
                        <div className="bg-green-100 border border-green-300 text-green-800 p-6 rounded-xl text-center mb-6">
                            <Award size={48} className="mx-auto mb-2 text-green-600"/>
                            <h3 className="text-2xl font-bold">Resultat: {score} / {quiz.questions.length}</h3>
                            <p>Bra jobbat! Ditt resultat har sparats.</p>
                        </div>
                    )}
                    <div className="space-y-8">
                        {quiz.questions.map((q, idx) => {
                            const selectedOptId = answers[q.id];
                            const correctOpt = q.options.find(o => o.isCorrect);
                            const isCorrect = submitted && selectedOptId && q.options.find(o => o.id === selectedOptId)?.isCorrect;
                            return (
                                <div key={q.id} className={`border-b pb-6 last:border-0 ${submitted ? (isCorrect ? 'opacity-100' : 'opacity-70') : ''}`}>
                                    <h4 className="font-bold text-lg mb-3 flex gap-2">
                                        <span className="text-gray-400">#{idx + 1}</span> {q.text}
                                        {submitted && isCorrect && <CheckCircle size={20} className="text-green-500" />}
                                        {submitted && !isCorrect && selectedOptId && <AlertTriangle size={20} className="text-red-500" />}
                                    </h4>
                                    <div className="space-y-2">
                                        {q.options.map((opt) => {
                                            const isSelected = answers[q.id] === opt.id;
                                            let bgClass = "bg-white border-gray-200 hover:bg-gray-50";
                                            if (isSelected) bgClass = "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500";
                                            if (submitted) {
                                                if (opt.isCorrect) bgClass = "!bg-green-100 !border-green-500";
                                                else if (isSelected && !opt.isCorrect) bgClass = "!bg-red-100 !border-red-500";
                                            }
                                            return (
                                                <div key={opt.id} onClick={() => handleSelect(q.id, opt.id)} className={`p-3 rounded-lg cursor-pointer border transition-colors flex items-center justify-between ${bgClass}`}>
                                                    <span>{opt.text}</span>
                                                    {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {!submitted && (
                    <div className="p-6 border-t bg-gray-50 flex justify-end">
                        <button onClick={finishQuiz} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105">Lämna in Quiz</button>
                    </div>
                )}
            </div>
        </div>
    );
};