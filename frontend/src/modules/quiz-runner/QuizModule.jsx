import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Trash2, Edit, PlayCircle, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { QuizBuilderModal, QuizRunnerModal } from './QuizModals';
import { useAppContext } from '../../context/AppContext';

// Metadata för systemet (används för dynamisk laddning)
export const QuizModuleMetadata = {
    id: 'quiz_runner',
    name: 'QuizRunner Pro',
    version: '1.2.0',
    description: 'Skapa och genomför diagnostiska prov och tester.',
    icon: HelpCircle,
    settingsKey: 'module_quiz_enabled',
    permissions: ['READ', 'WRITE']
};

const QuizModule = ({ courseId, currentUser, isTeacher, mode = 'COURSE' }) => {
    const { t } = useTranslation();
    const { refreshUser } = useAppContext(); // <--- Hämta refreshUser
    const [quizzes, setQuizzes] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadQuizzes();
    }, [courseId, mode]);

    const loadQuizzes = async () => {
        setIsLoading(true);
        try {
            let data;
            if (mode === 'GLOBAL') {
                data = await api.quiz.getMy(currentUser.id);
            } else {
                data = await api.quiz.getByCourse(courseId);
            }
            setQuizzes(data || []);
        } catch (e) {
            console.error("Quiz load error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (quizData, quizId) => {
        try {
            if (quizId) await api.quiz.update(quizId, quizData);
            else {
                if (mode === 'GLOBAL') await api.quiz.createGlobal(currentUser.id, quizData);
                else await api.quiz.create(courseId, currentUser.id, quizData);
            }
            loadQuizzes();
            setShowBuilder(false);
            setEditingQuiz(null);
        } catch (e) { alert(t('quiz.save_error') || "Fel vid sparande."); }
    };

    const handleDelete = async (quizId) => {
        if (!window.confirm(t('quiz.delete_confirm'))) return;
        try {
            await api.quiz.delete(quizId);
            setQuizzes(quizzes.filter(q => q.id !== quizId));
        } catch (e) { alert(t('quiz.delete_error')); }
    };

    const handleSubmitResult = async (quizId, score, maxScore) => {
        try {
            await api.quiz.submit(quizId, { studentId: currentUser.id, score, maxScore });

            loadQuizzes();

            if (refreshUser) await refreshUser();

        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <div>
                    <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-200">{t('quiz.header')}</h2>
                    <p className="text-indigo-700 dark:text-indigo-400 text-sm">{t('quiz.subtitle')}</p>
                </div>
                {isTeacher && (
                    <button onClick={() => { setEditingQuiz(null); setShowBuilder(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                        <Plus size={18} /> {t('quiz.create_title')}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? <div className="col-span-full text-center text-gray-400">Laddar QuizRunner...</div> :
                    quizzes.length > 0 ? (
                        quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative group">
                                {isTeacher && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingQuiz(quiz); setShowBuilder(true); }} className="p-2 bg-gray-100 dark:bg-[#3c4043] hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(quiz.id)} className="p-2 bg-gray-100 dark:bg-[#3c4043] hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400"><HelpCircle size={24} /></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{quiz.questions ? quiz.questions.length : 0} {t('quiz.questions_count')}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{quiz.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 min-h-[40px]">{quiz.description || t('quiz.knowledge_check')}</p>
                                <button onClick={() => setActiveQuiz(quiz)} className="w-full bg-white dark:bg-[#1E1F20] border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 py-2 rounded-lg font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2">
                                    <PlayCircle size={18} /> {t('quiz.start_quiz')}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 dark:bg-[#131314] rounded-xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                            <Award size={48} className="mx-auto mb-2 opacity-50" /><p>{t('quiz.no_quizzes')}</p>
                        </div>
                    )}
            </div>

            {showBuilder && <QuizBuilderModal onClose={() => { setShowBuilder(false); setEditingQuiz(null); }} onSubmit={handleSave} courseId={courseId} initialData={editingQuiz} />}
            {activeQuiz && <QuizRunnerModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onSubmit={handleSubmitResult} />}
        </div>
    );
};

export default QuizModule;