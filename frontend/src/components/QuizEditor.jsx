import React, { useState } from 'react';
import { Plus, Trash2, Save, X, CheckCircle, Circle } from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

const QuizEditor = ({ courseId, onClose, onSave }) => {
    const { t } = useTranslation();
    const [quiz, setQuiz] = useState({
        title: '',
        description: '',
        questions: []
    });

    const addQuestion = () => {
        setQuiz({
            ...quiz,
            questions: [
                ...quiz.questions,
                { text: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }
            ]
        });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[index][field] = value;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const removeQuestion = (index) => {
        const newQuestions = quiz.questions.filter((_, i) => i !== index);
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const addOption = (qIndex) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].options.push({ text: '', isCorrect: false });
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].options[oIndex][field] = value;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const toggleCorrect = (qIndex, oIndex) => {
        const newQuestions = [...quiz.questions];
        // För enkelhetens skull, sätt alla andra till false om du vill ha radio-beteende,
        // eller låt det vara checkbox-beteende (flera rätt). Här kör vi checkbox-stil.
        newQuestions[qIndex].options[oIndex].isCorrect = !newQuestions[qIndex].options[oIndex].isCorrect;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const handleSave = async () => {
        if (!quiz.title) return alert("Quizet måste ha en titel.");
        try {
            await api.quiz.create(courseId, quiz);
            if(onSave) onSave();
            if(onClose) onClose();
        } catch (e) {
            console.error(e);
            alert("Kunde inte spara quiz.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#3c4043]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('quiz.create_title')}</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white dark:bg-[#1E1F20]">

                    {/* Quiz Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{t('quiz.modal_quiz_title')}</label>
                            <input
                                className="w-full text-2xl font-bold border-b-2 border-gray-200 dark:border-[#3c4043] focus:border-indigo-500 bg-transparent outline-none py-2 text-gray-900 dark:text-white placeholder-gray-300"
                                placeholder={t('quiz.title_placeholder')}
                                value={quiz.title}
                                onChange={e => setQuiz({...quiz, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{t('common.description')}</label>
                            <textarea
                                className="w-full p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-200 dark:border-[#3c4043] text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="2"
                                placeholder="Beskriv vad detta quiz handlar om..."
                                value={quiz.description}
                                onChange={e => setQuiz({...quiz, description: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {quiz.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-50 dark:bg-[#282a2c] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] relative group">
                                <button onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={20}/>
                                </button>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{t('quiz.question')} {qIndex + 1}</label>
                                    <input
                                        className="w-full font-medium bg-white dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={t('quiz.question_placeholder')}
                                        value={q.text}
                                        onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/30">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleCorrect(qIndex, oIndex)}
                                                className={`p-2 rounded-full transition-colors ${opt.isCorrect ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-300 hover:text-gray-500'}`}
                                            >
                                                {opt.isCorrect ? <CheckCircle size={20}/> : <Circle size={20}/>}
                                            </button>
                                            <input
                                                className="flex-1 bg-transparent border-b border-gray-200 dark:border-[#3c4043] focus:border-indigo-500 py-1 text-sm text-gray-900 dark:text-white outline-none"
                                                placeholder={`Alternativ ${oIndex + 1}`}
                                                value={opt.text}
                                                onChange={e => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                            />
                                            <button onClick={() => removeOption(qIndex, oIndex)} className="text-gray-300 hover:text-red-400"><X size={16}/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addOption(qIndex)} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 mt-2">
                                        <Plus size={14}/> {t('quiz.add_option')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-[#3c4043] rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 font-bold flex items-center justify-center gap-2 transition-all">
                        <Plus size={20}/> {t('quiz.add_question')}
                    </button>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3c4043] transition-colors">{t('common.cancel')}</button>
                    <button onClick={handleSave} className="px-6 py-2.5 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2">
                        <Save size={18}/> {t('quiz.save_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizEditor;
