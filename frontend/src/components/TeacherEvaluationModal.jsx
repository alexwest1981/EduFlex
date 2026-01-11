import React, { useState } from 'react';
import { X, Save, Plus, Trash2, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TeacherEvaluationModal = ({ course, onClose, onSave, isLoading }) => {
    const { t } = useTranslation();

    // Default questions if none exist
    const defaultQuestions = [
        "Hur upplevde du kursinnehållet?",
        "Var svårighetsgraden lagom?",
        "Hur fungerade kommunikationen med läraren?"
    ];

    const [questions, setQuestions] = useState(
        course.evaluation?.questions?.length > 0 ? course.evaluation.questions : defaultQuestions
    );
    const [isActive, setIsActive] = useState(course.evaluation?.active || false);

    const handleAddQuestion = () => {
        setQuestions([...questions, ""]);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Filter out empty questions
        const filteredQuestions = questions.filter(q => q.trim() !== "");
        onSave({ questions: filteredQuestions, active: isActive });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-indigo-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-indigo-900">{t('evaluation.teacher_title') || 'Hantera Kursutvärdering'}</h2>
                        <p className="text-indigo-700 text-sm">{course.name}</p>
                    </div>
                    <button onClick={onClose}><X className="text-indigo-400 hover:text-indigo-700" /></button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Status Toggle */}
                    <div className="bg-gray-50 p-4 rounded-xl border flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-gray-800">{t('course.status') || 'Status'}</h4>
                            <p className="text-sm text-gray-500">
                                {isActive
                                    ? (t('evaluation.active_desc') || 'Utvärderingen är synlig för studenter.')
                                    : (t('evaluation.inactive_desc') || 'Utvärderingen är dold.')}
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {/* Questions Editor */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <HelpCircle size={18} className="text-indigo-600" />
                                {t('evaluation.questions') || 'Frågor'}
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="text-sm text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Plus size={16} /> {t('common.add') || 'Lägg till'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {questions.map((q, idx) => (
                                <div key={idx} className="flex gap-2 items-center group">
                                    <span className="text-gray-400 font-mono text-xs w-6 text-center">{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={q}
                                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder={`Fråga ${idx + 1}...`}
                                    />
                                    <button
                                        onClick={() => handleRemoveQuestion(idx)}
                                        className="text-gray-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {questions.length === 0 && (
                            <div className="text-center py-8 text-gray-400 italic text-sm border-2 border-dashed rounded-xl">
                                {t('evaluation.no_questions') || 'Inga frågor tillagda än.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 transition-all"
                    >
                        <Save size={18} />
                        {isLoading ? (t('common.saving') || 'Sparar...') : (t('common.save_changes') || 'Spara Ändringar')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherEvaluationModal;
