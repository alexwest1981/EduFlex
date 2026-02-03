import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HelpCircle, FileText, BookOpen, Store, Search, Filter, Download, Star, Loader2, RefreshCw, Plus, Sparkles, Send, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';

// Modules (Now supporting mode="GLOBAL")
import QuizModule from '../../modules/quiz-runner/QuizModule';
import AssignmentsModule from '../../modules/assignments/AssignmentsModule';
import CourseContentModule from '../../modules/course-content/CourseContentModule';

// Community components
import SubjectIcon from '../community/components/SubjectIcon';
import CommunityDetailModal from '../community/components/CommunityDetailModal';
import PublishModal from '../community/components/PublishModal';

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

    // Community state
    const [communityItems, setCommunityItems] = useState([]);
    const [communityLoading, setCommunityLoading] = useState(false);
    const [communitySearch, setCommunitySearch] = useState('');
    const [communitySubject, setCommunitySubject] = useState('ALL');
    const [communityType, setCommunityType] = useState('ALL');
    const [subjects, setSubjects] = useState([]);
    const [selectedCommunityItem, setSelectedCommunityItem] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showPublishModal, setShowPublishModal] = useState(false);

    // AI Generation state
    const [aiType, setAiType] = useState('QUIZ');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiContext, setAiContext] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [generatedResource, setGeneratedResource] = useState(null);

    const roleName = currentUser?.role?.name || currentUser?.role;
    const canPublish = roleName === 'TEACHER' || roleName === 'ADMIN';

    useEffect(() => {
        api.courses.getAll().then(data => setCourses(data));
    }, []);

    // Load community data when tab is active
    useEffect(() => {
        if (activeTab === 'community') {
            loadCommunityData();
            loadSubjects();
        }
    }, [activeTab, communitySubject, communityType]);

    const loadSubjects = async () => {
        try {
            const data = await api.community.getSubjects();
            setSubjects(data);
        } catch (err) {
            console.error('Failed to load subjects:', err);
        }
    };

    const loadCommunityData = async () => {
        setCommunityLoading(true);
        try {
            const params = {
                subject: communitySubject !== 'ALL' ? communitySubject : undefined,
                type: communityType !== 'ALL' ? communityType : undefined,
                size: 50
            };
            const data = await api.community.browse(params);
            setCommunityItems(data.content || []);
        } catch (err) {
            console.error('Failed to load community:', err);
        } finally {
            setCommunityLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!communitySearch.trim()) {
            loadCommunityData();
            return;
        }
        setCommunityLoading(true);
        try {
            const data = await api.community.search(communitySearch);
            setCommunityItems(data.content || []);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setCommunityLoading(false);
        }
    };

    const handleInstall = async (itemId) => {
        try {
            await api.community.install(itemId);
            // Trigger refresh of the modules
            setRefreshKey(prev => prev + 1);
            return true;
        } catch (err) {
            console.error('Install failed:', err);
            throw err;
        }
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setAiGenerating(true);
        setGeneratedResource(null);
        try {
            const data = await api.ai.resources.generate(currentUser.id, aiType, aiPrompt, aiContext);
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
        { key: 'ai-generate', label: 'AI Generator', icon: <Sparkles size={18} />, highlight: true }
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
                            onClick={() => setShowPublishModal(true)}
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
                    <CommunityBrowser
                        items={communityItems}
                        loading={communityLoading}
                        search={communitySearch}
                        setSearch={setCommunitySearch}
                        onSearch={handleSearch}
                        subject={communitySubject}
                        setSubject={setCommunitySubject}
                        type={communityType}
                        setType={setCommunityType}
                        subjects={subjects}
                        onSelectItem={setSelectedCommunityItem}
                        onRefresh={loadCommunityData}
                    />
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
                    />
                )}
            </div>

            {/* Detail Modal */}
            {selectedCommunityItem && (
                <CommunityDetailModal
                    itemId={selectedCommunityItem.id}
                    onClose={() => setSelectedCommunityItem(null)}
                    onInstall={handleInstall}
                />
            )}

            {/* Publish Modal */}
            {showPublishModal && (
                <PublishModal
                    onClose={() => setShowPublishModal(false)}
                    onPublished={() => {
                        loadCommunityData();
                        setRefreshKey(prev => prev + 1);
                    }}
                    userId={currentUser?.id}
                />
            )}
        </div>
    );
};

// Inline Community Browser Component
const CommunityBrowser = ({
    items, loading, search, setSearch, onSearch,
    subject, setSubject, type, setType, subjects,
    onSelectItem, onRefresh
}) => {
    const typeOptions = [
        { value: 'ALL', label: 'Alla typer' },
        { value: 'QUIZ', label: 'Quiz' },
        { value: 'ASSIGNMENT', label: 'Uppgifter' },
        { value: 'LESSON', label: 'Lektioner' }
    ];

    const typeConfig = {
        QUIZ: { color: 'purple', label: 'Quiz' },
        ASSIGNMENT: { color: 'blue', label: 'Uppgift' },
        LESSON: { color: 'green', label: 'Lektion' }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                            placeholder="Sök i Community..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Subject Filter */}
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl text-sm"
                    >
                        <option value="ALL">Alla ämnen</option>
                        {subjects.map(s => (
                            <option key={s.name} value={s.name}>{s.displayName}</option>
                        ))}
                    </select>

                    {/* Type Filter */}
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl text-sm"
                    >
                        {typeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* Refresh */}
                    <button
                        onClick={onRefresh}
                        className="p-2.5 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
                    >
                        <RefreshCw size={20} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-purple-600" size={40} />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20">
                    <Store className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Inget innehåll hittades
                    </h3>
                    <p className="text-gray-500">
                        Prova att ändra dina filter eller sök efter något annat.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map(item => {
                        const typeInfo = typeConfig[item.contentType] || typeConfig.QUIZ;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelectItem(item)}
                                className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group"
                            >
                                {/* Subject Header */}
                                <div
                                    className="h-10 px-3 flex items-center gap-2"
                                    style={{ backgroundColor: item.subjectColor || '#8B5CF6' }}
                                >
                                    <SubjectIcon iconName={item.subjectIcon} color="white" size={16} />
                                    <span className="text-white font-semibold text-xs truncate">
                                        {item.subjectDisplayName}
                                    </span>
                                </div>

                                <div className="p-4">
                                    {/* Type Badge */}
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-${typeInfo.color}-100 text-${typeInfo.color}-700 dark:bg-${typeInfo.color}-900/30 dark:text-${typeInfo.color}-300 mb-2`}>
                                        {typeInfo.label}
                                    </span>

                                    {/* Title */}
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {item.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                                        {item.description}
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-[#3c4043] rounded-full flex items-center justify-center overflow-hidden">
                                            {item.authorProfilePictureUrl ? (
                                                <img src={item.authorProfilePictureUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[8px] font-bold text-gray-500">
                                                    {item.authorName?.charAt(0)?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="truncate">{item.authorName}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#3c4043]">
                                        <div className="flex items-center gap-1">
                                            <Star className="text-yellow-400 fill-yellow-400" size={14} />
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {(item.averageRating || 0).toFixed(1)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ({item.ratingCount || 0})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Download size={14} />
                                            <span className="text-xs">{item.downloadCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex items-start gap-3">
                <Store className="text-purple-600 shrink-0 mt-0.5" size={20} />
                <div>
                    <p className="font-medium text-purple-800 dark:text-purple-200">
                        Installera material direkt till dina resurser
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        Klicka på ett kort för att se detaljer och installera. Materialet läggs automatiskt till
                        i rätt flik (Quiz, Uppgifter eller Lektioner). Quiz-frågor kopieras även till din Frågebank
                        (under Mina Quiz) så du kan återanvända dem i egna quiz.
                    </p>
                </div>
            </div>
        </div>
    );
};

// AI Generator Tab Component
const AIGeneratorTab = ({
    type, setType, prompt, setPrompt, context, setContext,
    generating, onGenerate, generatedResource, setActiveTab
}) => {
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
