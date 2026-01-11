import React, { useState, useEffect } from 'react';
import { Library, Lock, Clock, HelpCircle, Plus, Trash2, Edit, PlayCircle, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { QuizBuilderModal, QuizRunnerModal, QuizGeneratorModal } from './QuizModals';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { QuizLibrary } from './QuizLibrary';
import { QuestionBankManager } from './QuestionBankManager';

export const QuizModuleBasicMetadata = {
    id: 'quiz_runner_basic',
    name: 'QuizRunner Basic',
    version: '1.2.0',
    description: 'Skapa och genomför egna quiz (Manuellt).',
    icon: HelpCircle,
    settingsKey: 'module_quiz_basic_enabled',
    permissions: ['READ', 'WRITE']
};

export const QuizModuleProMetadata = {
    id: 'quiz_runner_pro',
    name: 'QuizRunner Pro',
    version: '2.0.0',
    description: 'Avancerad quizhantering med frågebank och AI-generering.',
    icon: Award,
    settingsKey: 'module_quiz_pro_enabled',
    permissions: ['READ', 'WRITE', 'PRO_ACCESS']
};

// Default export for backward compatibility or direct import
export const QuizModuleMetadata = QuizModuleProMetadata;

// Helper to check availability
const getAvailabilityStatus = (quiz) => {
    const now = new Date();
    const from = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const to = quiz.availableTo ? new Date(quiz.availableTo) : null;

    if (from && now < from) return { status: 'LOCKED', message: `Öppnar ${from.toLocaleString()}` };
    if (to && now > to) return { status: 'CLOSED', message: `Stängde ${to.toLocaleString()}` };
    return { status: 'OPEN', message: to ? `Öppet t.o.m ${to.toLocaleString()}` : 'Tillgänglig' };
};

const QuizModule = ({ courseId, currentUser, isTeacher, mode = 'COURSE' }) => {
    const { t } = useTranslation();
    const { refreshUser } = useAppContext();
    const { isModuleActive } = useModules(); // <--- Access module context

    // Check if Pro features are valid
    const isPro = isModuleActive('quiz_runner_pro') || isModuleActive('QUIZ_RUNNER_PRO');

    const [quizzes, setQuizzes] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Tab State for Teachers
    const [activeTab, setActiveTab] = useState('COURSE');

    useEffect(() => {
        loadQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            if (quizData.generationParams) {
                await api.quiz.generate({
                    ...quizData.generationParams,
                    userId: currentUser.id,
                    courseId: mode === 'GLOBAL' ? null : courseId,
                    title: quizData.title
                });
            } else if (quizId) {
                await api.quiz.update(quizId, quizData);
            } else {
                if (mode === 'GLOBAL') await api.quiz.createGlobal(currentUser.id, quizData);
                else await api.quiz.create(courseId, currentUser.id, quizData);
            }
            loadQuizzes();
            setShowBuilder(false);
            setShowGenerator(false);
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
                    <p className="text-indigo-700 dark:text-indigo-400 text-sm">
                        {t('quiz.subtitle')}
                        {!isPro && <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">Basic</span>}
                        {isPro && <span className="ml-2 text-xs bg-indigo-200 dark:bg-indigo-800 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300">Pro</span>}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Library Tab only for PRO */}
                    {isTeacher && isPro && (
                        <div className="flex bg-white dark:bg-[#1E1F20] rounded-lg p-1 border border-indigo-100 dark:border-indigo-900/30 mr-4">
                            <button onClick={() => setActiveTab('COURSE')} className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'COURSE' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}>
                                <HelpCircle size={16} /> {mode === 'GLOBAL' ? 'Mina Quiz' : 'Kursquiz'}
                            </button>
                            <button onClick={() => setActiveTab('LIBRARY')} className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'LIBRARY' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}>
                                <Library size={16} /> Mitt Bibliotek
                            </button>
                            <button onClick={() => setActiveTab('BANK')} className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'BANK' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}>
                                <Award size={16} /> Frågebank
                            </button>
                        </div>
                    )}

                    {isTeacher && (
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingQuiz(null); setShowBuilder(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                                <Plus size={18} /> {t('quiz.create_title')}
                            </button>
                            {isPro && (
                                <button onClick={() => setShowGenerator(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 flex items-center gap-2 transition-colors">
                                    <Award size={18} /> Generera Quiz
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'LIBRARY' && isPro ? (
                <QuizLibrary />
            ) : activeTab === 'BANK' && isPro ? (
                <QuestionBankManager currentUser={currentUser} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? <div className="col-span-full text-center text-gray-400">Laddar QuizRunner...</div> :
                        quizzes.length > 0 ? (
                            quizzes.map(quiz => {
                                const avail = getAvailabilityStatus(quiz);
                                const isLocked = avail.status !== 'OPEN' && !isTeacher;

                                return (
                                    <div key={quiz.id} className={`bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative group ${isLocked ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                        {isTeacher && (
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button onClick={() => { setEditingQuiz(quiz); setShowBuilder(true); }} className="p-2 bg-gray-100 dark:bg-[#3c4043] hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-colors"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(quiz.id)} className="p-2 bg-gray-100 dark:bg-[#3c4043] hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400"><HelpCircle size={24} /></div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{quiz.questions ? quiz.questions.length : 0} {t('quiz.questions_count')}</span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{quiz.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{quiz.description || t('quiz.knowledge_check')}</p>

                                        {/* Availability Info */}
                                        <div className={`text-xs font-bold mb-4 flex items-center gap-1 ${avail.status === 'OPEN' ? 'text-green-600' : 'text-orange-600'}`}>
                                            <Clock size={12} /> {avail.message}
                                        </div>

                                        <button
                                            onClick={() => !isLocked && setActiveQuiz(quiz)}
                                            disabled={isLocked}
                                            className={`w-full py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}
                                        >
                                            {isLocked ? <Lock size={18} /> : <PlayCircle size={18} />}
                                            {isLocked ? 'Låst' : t('quiz.start_quiz')}
                                        </button>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 dark:bg-[#131314] rounded-xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                                <Award size={48} className="mx-auto mb-2 opacity-50" /><p>{t('quiz.no_quizzes')}</p>
                            </div>
                        )}
                </div>
            )}

            {!isPro && activeTab === 'LIBRARY' && (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed dark:bg-[#131314] dark:border-[#3c4043]">
                    <Award size={48} className="mx-auto mb-4 text-indigo-300" />
                    <h3 className="text-lg font-bold mb-2">QuizRunner Pro krävs</h3>
                    <p className="text-gray-500">Uppgradera till Pro för att få tillgång till ditt personliga quiz-bibliotek.</p>
                </div>
            )}

            {showBuilder && <QuizBuilderModal onClose={() => { setShowBuilder(false); setEditingQuiz(null); }} onSubmit={handleSave} courseId={courseId} initialData={editingQuiz} isPro={isPro} />}
            {showGenerator && <QuizGeneratorModal onClose={() => setShowGenerator(false)} onSubmit={handleSave} />}
            {activeQuiz && <QuizRunnerModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onSubmit={handleSubmitResult} />}
        </div>
    );
};

export default QuizModule;