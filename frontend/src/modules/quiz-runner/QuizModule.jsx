import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Lock, Clock, HelpCircle, Plus, Trash2, Edit, PlayCircle, Award, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { QuizBuilderModal, QuizRunnerModal, QuizGeneratorModal } from './QuizModals';
import PracticeQuizSetupModal from '../../features/ai/PracticeQuizSetupModal';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { QuizLibrary } from './QuizLibrary';
import { QuestionBankManager } from './QuestionBankManager';

export const QuizModuleBasicMetadata = {
    id: 'QUIZ_BASIC',
    name: 'QuizRunner Basic',
    version: '1.2.0',
    description: 'Skapa och genomför egna quiz (Manuellt).',
    icon: HelpCircle,
    settingsKey: 'module_quiz_basic_enabled',
    permissions: ['READ', 'WRITE']
};

export const QuizModuleProMetadata = {
    id: 'QUIZ_PRO',
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

    if (from && now < from) return { status: 'LOCKED', message: `Öppnar ${from.toLocaleString()} ` };
    if (to && now > to) return { status: 'CLOSED', message: `Stängde ${to.toLocaleString()} ` };
    return { status: 'OPEN', message: to ? `Öppet t.o.m ${to.toLocaleString()} ` : 'Tillgänglig' };
};

const QuizModule = ({ courseId, currentUser, isTeacher, mode = 'COURSE' }) => {
    const { t } = useTranslation();
    const { refreshUser } = useAppContext();
    const { isModuleActive } = useModules(); // <--- Access module context
    const navigate = useNavigate();

    // Check if Pro features are valid
    const isPro = isModuleActive('QUIZ_PRO') || isModuleActive('quiz_runner_pro');

    const [quizzes, setQuizzes] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [showPracticeSetup, setShowPracticeSetup] = useState(false);
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
            if (!quizId) {
                // Handle Practice Quiz submission (no persistent ID)
                await api.ai.completePractice({
                    userId: currentUser.id,
                    courseId,
                    score,
                    maxScore,
                    difficulty: 3 // Default if not provided
                });
                // Do NOT refresh user here for practice quizzes to prevent re-renders that might close the modal
            } else {
                await api.quiz.submit(quizId, { studentId: currentUser.id, score, maxScore });
                if (refreshUser) await refreshUser();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-200 tracking-tight">{t('quiz.header')}</h2>
                    <p className="text-indigo-700/80 dark:text-indigo-400/80 text-sm mt-1 flex items-center gap-2">
                        {t('quiz.subtitle')}
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${isPro ? 'bg-indigo-600 text-white' : 'bg-gray-400 text-white'}`}>
                            {isPro ? 'Pro' : 'Basic'}
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Student Practice Button */}
                    {!isTeacher && isPro && (
                        <button
                            onClick={() => setShowPracticeSetup(true)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Sparkles size={18} />
                            {t('quiz.practice_ai') || 'Öva med AI'}
                        </button>
                    )}

                    {/* Navigation Tabs for PRO Teachers */}
                    {isTeacher && isPro && (
                        <div className="flex bg-white/80 dark:bg-[#1E1F20]/80 backdrop-blur-sm rounded-xl p-1 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                            {[
                                { id: 'COURSE', label: mode === 'GLOBAL' ? 'Mina Quiz' : 'Kursquiz', icon: HelpCircle },
                                { id: 'LIBRARY', label: 'Bibliotek', icon: Library },
                                { id: 'BANK', label: 'Frågebank', icon: Award }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Secondary Actions */}
                    {isTeacher && (
                        <div className="flex gap-2">
                            {isPro && (
                                <button
                                    onClick={() => setShowGenerator(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-100 dark:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Sparkles size={18} />
                                    Generera Quiz
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setEditingQuiz(null);
                                    setShowBuilder(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 dark:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus size={22} />
                                {t('quiz.create_title') || 'Skapa Quiz'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'LIBRARY' && isPro ? (
                    <QuizLibrary />
                ) : activeTab === 'BANK' && isPro ? (
                    <QuestionBankManager currentUser={currentUser} />
                ) : (
                    <>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Clock className="animate-spin mb-4" size={48} />
                                <p className="font-medium">Hämtar quiz...</p>
                            </div>
                        ) : quizzes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {quizzes.map(quiz => {
                                    const avail = getAvailabilityStatus(quiz);
                                    const isLocked = avail.status !== 'OPEN' && !isTeacher;

                                    return (
                                        <div
                                            key={quiz.id}
                                            className={`group relative flex flex-col bg-white dark:bg-[#1E1F20] border border-gray-100 dark:border-[#3c4043] rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all duration-300 ${isLocked ? 'opacity-70' : ''}`}
                                        >
                                            {/* Teacher Controls */}
                                            {isTeacher && (
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-5px] group-hover:translate-y-0 z-10">
                                                    <button
                                                        onClick={() => { setEditingQuiz(quiz); setShowBuilder(true); }}
                                                        className="p-2.5 bg-white dark:bg-[#282a2c] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-500 hover:text-indigo-600 rounded-xl border border-gray-100 dark:border-[#3c4043] shadow-sm transition-all"
                                                        title="Redigera"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(quiz.id)}
                                                        className="p-2.5 bg-white dark:bg-[#282a2c] hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 rounded-xl border border-gray-100 dark:border-[#3c4043] shadow-sm transition-all"
                                                        title="Ta bort"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                                    <HelpCircle size={24} />
                                                </div>
                                                <span className="px-3 py-1 bg-gray-50 dark:bg-[#282a2c] rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-[#3c4043]">
                                                    {quiz.questions?.length || 0} {t('quiz.questions_count')}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {quiz.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 min-h-[40px]">
                                                {quiz.description || t('quiz.knowledge_check')}
                                            </p>

                                            <div className="mt-auto pt-6 border-t border-gray-50 dark:border-[#282a2c]">
                                                <div className={`text-xs font-bold mb-4 flex items-center gap-1.5 ${avail.status === 'OPEN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    <Clock size={14} />
                                                    {avail.message}
                                                </div>

                                                <button
                                                    onClick={() => !isLocked && setActiveQuiz(quiz)}
                                                    disabled={isLocked}
                                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${isLocked
                                                        ? 'bg-gray-100 dark:bg-[#282a2c] text-gray-400 cursor-not-allowed border border-gray-200 dark:border-[#3c4043]'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none transform active:scale-[0.98]'
                                                        }`}
                                                >
                                                    {isLocked ? <Lock size={18} /> : <PlayCircle size={20} />}
                                                    {isLocked ? 'Låst' : t('quiz.start_quiz')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 dark:bg-[#131314] rounded-3xl border-2 border-dashed border-gray-200 dark:border-[#3c4043]">
                                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm mb-4">
                                    <Award size={64} className="text-indigo-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('quiz.no_quizzes') || 'Inga quiz ännu'}</h3>
                                <p className="text-gray-500 max-w-sm">Här dyker de quiz upp som skapas för den här kursen eller läggs till i ditt bibliotek.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Error states for non-pro */}
            {!isPro && activeTab === 'LIBRARY' && (
                <div className="p-12 text-center bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/20">
                    <Award size={64} className="mx-auto mb-6 text-indigo-300" />
                    <h3 className="text-2xl font-extrabold mb-3 text-indigo-900 dark:text-indigo-200">QuizRunner Pro krävs</h3>
                    <p className="text-indigo-700/70 dark:text-indigo-400/70 max-w-md mx-auto mb-8">Uppgradera till Pro för att få tillgång till ditt personliga quiz-bibliotek och AI-generering.</p>
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">
                        Uppgradera nu
                    </button>
                </div>
            )}

            {showBuilder && <QuizBuilderModal onClose={() => { setShowBuilder(false); setEditingQuiz(null); }} onSubmit={handleSave} courseId={courseId} initialData={editingQuiz} isPro={isPro} />}
            {showGenerator && <QuizGeneratorModal onClose={() => setShowGenerator(false)} onSubmit={handleSave} />}
            {activeQuiz && <QuizRunnerModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onSubmit={handleSubmitResult} />}
            {showPracticeSetup && <PracticeQuizSetupModal course={{ id: courseId, name: t('quiz.course_quiz') }} currentUser={currentUser} onClose={() => setShowPracticeSetup(false)} onStartQuiz={(generatedQuiz) => { setShowPracticeSetup(false); setActiveQuiz(generatedQuiz); }} />}
        </div>
    );
};

export default QuizModule;
