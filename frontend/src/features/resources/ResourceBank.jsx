import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HelpCircle, FileText, BookOpen, Store, Search, Loader2, Plus, Sparkles, Send, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';

// Modules (Now supporting mode="GLOBAL")
import QuizModule from '../../modules/quiz-runner/QuizModule';
import AssignmentsModule from '../../modules/assignments/AssignmentsModule';
import CourseContentModule from '../../modules/course-content/CourseContentModule';

// Community components
import CommunityHub from '../community/CommunityHub';

const ResourceBank = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial tab from URL params (e.g., /resources?tab=community)
    const initialTab = searchParams.get('tab') || 'quiz';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedCourse, setSelectedCourse] = useState('ALL');
    const [courses, setCourses] = useState([]);

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'quiz') {
            searchParams.delete('tab');
        } else {
            searchParams.set('tab', tab);
        }
        setSearchParams(searchParams, { replace: true });
    };

    const [refreshKey, setRefreshKey] = useState(0);

    // AI Generation state
    const [aiType, setAiType] = useState('QUIZ');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiContext, setAiContext] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [generatedResource, setGeneratedResource] = useState(null);
    const [globalResources, setGlobalResources] = useState([]);
    const [globalLoading, setGlobalLoading] = useState(false);

    const roleName = currentUser?.role?.name || currentUser?.role;
    const canPublish = roleName === 'TEACHER' || roleName === 'ADMIN';

    useEffect(() => {
        api.courses.getAll().then(data => setCourses(data));
    }, []);

    useEffect(() => {
        if (activeTab === 'global-library') {
            setGlobalLoading(true);
            api.globalLibrary.getAll()
                .then(setGlobalResources)
                .catch(err => console.error('Failed to load global resources:', err))
                .finally(() => setGlobalLoading(false));
        }
    }, [activeTab]);

    const handleInstallGlobal = async (resourceId) => {
        try {
            await api.globalLibrary.install(resourceId);
            alert('Innehållet har lagts till i din personliga resursbank!');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('Failed to install global resource:', err);
            alert('Kunde inte lägga till resurs: ' + (err.message || 'Okänt fel'));
        }
    };



    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setAiGenerating(true);
        setGeneratedResource(null);
        try {
            const data = await api.ai.resources.generate(
                currentUser.id,
                aiType,
                aiPrompt,
                aiContext,
                selectedCourse === 'ALL' ? null : selectedCourse
            );
            setGeneratedResource(data);
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('AI Generation failed:', err);
        } finally {
            setAiGenerating(false);
        }
    };

    const tabs = [
        { key: 'quiz', label: 'Mina Quiz', icon: <HelpCircle size={18} /> },
        { key: 'assignments', label: 'Mina Uppgifter', icon: <FileText size={18} /> },
        { key: 'lessons', label: 'Mina Lektioner', icon: <BookOpen size={18} /> },
        { key: 'community', label: 'Community', icon: <Store size={18} />, highlight: true },
        { key: 'ai-generate', label: 'AI Generator', icon: <Sparkles size={18} />, highlight: true },
        { key: 'global-library', label: 'Global Library', icon: <Store size={18} />, highlight: true }
    ];

    const viewingMode = selectedCourse === 'ALL' ? 'GLOBAL' : 'COURSE';
    const viewingCourseId = selectedCourse === 'ALL' ? null : selectedCourse;

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resursbank</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {activeTab === 'community'
                            ? 'Hämta quiz, uppgifter och lektioner från andra lärare.'
                            : 'Hantera ditt undervisningsmaterial samlat på ett ställe.'}
                    </p>
                </div>

                {activeTab === 'community' ? (
                    canPublish && (
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('community:publish'))}
                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-bold shadow-lg shadow-purple-500/20"
                        >
                            <Plus size={20} />
                            Publicera i Community
                        </button>
                    )
                ) : (
                    <div className="flex items-center gap-2 bg-white dark:bg-[#1E1F20] p-1 rounded-lg border border-gray-200 dark:border-[#3c4043] shadow-sm">
                        <span className="text-xs font-bold text-gray-500 px-2 uppercase">Visar för:</span>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="bg-gray-50 dark:bg-[#131314] border-none text-sm font-bold text-gray-900 dark:text-white rounded-md py-1.5 pl-2 pr-8 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">Alla Kurser (Globalt)</option>
                            {courses.filter(c => roleName === 'ADMIN' || (c.teacherId === currentUser.id || c.teacher?.id === currentUser.id)).map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </header>

            {/* TAB NAVIGATION */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043] mb-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === tab.key
                            ? tab.highlight
                                ? 'border-purple-600 text-purple-600'
                                : 'border-indigo-600 text-indigo-600'
                            : tab.highlight
                                ? 'border-transparent text-purple-500 hover:text-purple-700 dark:text-purple-400'
                                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.highlight && activeTab !== tab.key && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                                NY
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="min-h-[500px]">
                {activeTab === 'quiz' && (
                    <QuizModule
                        key={`quiz-${refreshKey}`}
                        courseId={viewingCourseId}
                        currentUser={currentUser}
                        isTeacher={true}
                        mode={viewingMode}
                    />
                )}
                {activeTab === 'assignments' && (
                    <AssignmentsModule
                        key={`assignments-${refreshKey}`}
                        courseId={viewingCourseId}
                        currentUser={currentUser}
                        isTeacher={true}
                        mode={viewingMode}
                    />
                )}
                {activeTab === 'lessons' && (
                    <CourseContentModule
                        key={`lessons-${refreshKey}`}
                        courseId={viewingCourseId}
                        isTeacher={true}
                        currentUser={currentUser}
                        mode={viewingMode}
                    />
                )}
                {activeTab === 'community' && (
                    <CommunityHub minimal={true} />
                )}
                {activeTab === 'ai-generate' && (
                    <AIGeneratorTab
                        type={aiType}
                        setType={setAiType}
                        prompt={aiPrompt}
                        setPrompt={setAiPrompt}
                        context={aiContext}
                        setContext={setAiContext}
                        generating={aiGenerating}
                        onGenerate={handleAiGenerate}
                        generatedResource={generatedResource}
                        setActiveTab={setActiveTab}
                        courses={courses}
                        selectedCourse={selectedCourse}
                        setSelectedCourse={setSelectedCourse}
                        currentUser={currentUser}
                    />
                )}
                {activeTab === 'global-library' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 tracking-wider uppercase">Färdigt innehåll</span>
                                <h2 className="text-4xl font-black mb-4 leading-tight">Built-in Content Library</h2>
                                <p className="text-indigo-100 max-w-xl text-lg opacity-90">
                                    Upptäck professionella kurspaket, certifieringar och djupdykningar. Allt här är verifierat och klart att importeras direkt till din undervisning.
                                </p>
                            </div>
                            <Store className="absolute right-[-40px] bottom-[-40px] size-72 text-white/10 -rotate-12 transition-transform hover:rotate-0 duration-700" />
                        </div>

                        {globalLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                                <p className="text-gray-500 font-bold">Hämtar bibliotek...</p>
                            </div>
                        ) : globalResources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {globalResources.map((item) => (
                                    <div key={item.id} className="group bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-3xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                                                    {item.type}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-tighter">System Verified</span>
                                            </div>
                                            <button
                                                onClick={() => handleInstallGlobal(item.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                            >
                                                Importera
                                            </button>
                                        </div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{item.description}</p>

                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-[#3c4043]">
                                            {(item.tags || '').split(',').map((tag, i) => (
                                                <span key={i} className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-[#282a2c] px-2 py-1 rounded-md">
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-[#1E1F20] rounded-3xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-[#3c4043]">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Biblioteket är tomt för tillfället</h3>
                                <p className="text-gray-500">Kontakta systemadministratören för att lägga till globalt material.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};


// AI Generator Tab Component
const AIGeneratorTab = ({
    type, setType, prompt, setPrompt, context, setContext,
    generating, onGenerate, generatedResource, setActiveTab,
    courses, selectedCourse, setSelectedCourse, currentUser
}) => {
    const roleName = currentUser?.role?.name || currentUser?.role;
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-gray-200 dark:border-[#3c4043] p-8 shadow-xl shadow-purple-500/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-2xl">
                        <BrainCircuit className="text-purple-600 dark:text-purple-400" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">EduAI Generator</h2>
                        <p className="text-gray-500">Skapa undervisningsmaterial på sekunder med AI.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {['QUIZ', 'TASK', 'LESSON'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${type === t
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-100 dark:border-[#3c4043] hover:border-purple-200 dark:hover:border-purple-800'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${type === t ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-[#282a2c] text-gray-500 group-hover:text-purple-500'
                                }`}>
                                {t === 'QUIZ' && <HelpCircle size={24} />}
                                {t === 'TASK' && <FileText size={24} />}
                                {t === 'LESSON' && <BookOpen size={24} />}
                            </div>
                            <span className={`font-bold capitalize ${type === t ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                {t === 'QUIZ' ? 'Quiz' : t === 'TASK' ? 'Uppgift' : 'Lektion'}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Beskriv vad du vill skapa
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                type === 'QUIZ' ? 'T.ex. "Ett quiz om fotosyntesen för årskurs 7, 5 frågor"' :
                                    type === 'TASK' ? 'T.ex. "En inlämningsuppgift om Java-loopar med fokus på arrays"' :
                                        'T.ex. "En lektionsplan för källkritik på nätet"'
                            }
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Extra kontext / Material (Valfritt)
                        </label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Klistra in text, mål eller instruktioner som AI:n ska utgå ifrån..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <button
                        onClick={onGenerate}
                        disabled={generating || !prompt.trim()}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${generating
                            ? 'bg-gray-100 dark:bg-[#3c4043] text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'
                            }`}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Genererar {type.toLowerCase()}...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Generera med AI
                            </>
                        )}
                    </button>
                </div>
            </div>

            {generatedResource && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-2 border-green-500/30 p-6 flex items-center justify-between gap-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-2xl">
                            <CheckCircle2 className="text-green-600 dark:text-green-400" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Klart! Din {type.toLowerCase()} är skapad</h3>
                            <p className="text-gray-500">Den finns nu i din resursbank under "Mina {type === 'QUIZ' ? 'Quiz' : type === 'TASK' ? 'Uppgifter' : 'Lektioner'}".</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveTab(type.toLowerCase() === 'quiz' ? 'quiz' : type.toLowerCase() === 'task' ? 'assignments' : 'lessons')}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                        Visa mina resurser
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResourceBank;
