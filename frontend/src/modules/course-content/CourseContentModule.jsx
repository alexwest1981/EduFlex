import React, { useState, useEffect } from 'react';
import { QuizRunnerModal } from '../quiz-runner/QuizModals';
import { BookOpen, Plus, Edit2, Trash2, Save, ChevronRight, Video, Download, Paperclip, Loader2, Image as ImageIcon, Film, HelpCircle, Trophy, PlayCircle, Sparkles, Share2, FileText, ChevronDown, Book, ExternalLink } from 'lucide-react';
import { api, getSafeUrl } from '../../services/api';
import OnlyOfficeEditor from '../../features/documents/OnlyOfficeEditor';
import VideoPlayer from './components/VideoPlayer';
import EpubViewer from '../../components/common/EpubViewer';
import PublishModal from '../../features/community/components/PublishModal';
import CommentSection from '../../features/social/components/CommentSection';
import RichTextEditor from '../../components/RichTextEditor';

export const CourseContentModuleMetadata = {
    key: 'material',
    name: 'Kursinnehåll',
    icon: BookOpen,
    settingsKey: 'module_content_enabled'
};

const CourseContentModule = ({ courseId, isTeacher, currentUser, mode = 'COURSE' }) => {
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]); // New Quiz State
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null); // New Quiz Selection
    const [activeQuizRunner, setActiveQuizRunner] = useState(null); // For Modal
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [isPPTGenerating, setIsPPTGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSavingFile, setIsSavingFile] = useState(false);
    const [onlyOfficeDoc, setOnlyOfficeDoc] = useState(null);

    // Calendar Integration
    const [addToCalendar, setAddToCalendar] = useState(false);
    const [calendarStart, setCalendarStart] = useState('');
    const [calendarEnd, setCalendarEnd] = useState('');

    // Community Publishing
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishingLesson, setPublishingLesson] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        videoUrl: '',
        difficultyLevel: 3,
        estimatedTimeMinutes: 15,
        prerequisiteMaterialId: ''
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        loadLessons();
    }, [courseId, mode]);

    // --- TRACKING: VIEW_LESSON ---
    useEffect(() => {
        if (selectedLesson && !isTeacher && currentUser) {
            // Debounce or just log immediately? Let's log immediately but prevent dupes if strict mode double-renders
            // Better: Just fire and forget
            api.activity.log({
                userId: currentUser.id,
                courseId: courseId,
                materialId: selectedLesson.id,
                type: 'VIEW_LESSON',
                details: `Opened lesson: ${selectedLesson.title}`
            }).catch(console.error);
        }
    }, [selectedLesson?.id]); // Only re-run if ID changes

    const loadLessons = async () => {
        try {
            const [lessonsData, quizzesData] = await Promise.all([
                mode === 'GLOBAL'
                    ? api.lessons.getMy(currentUser.id)
                    : api.lessons.getByCourse(courseId),
                mode === 'GLOBAL'
                    ? api.quiz.getMy(currentUser.id)
                    : api.quiz.getByCourse(courseId)
            ]);

            let mappedLessons = [];
            let qData = quizzesData || [];

            if (lessonsData) {
                // MAP resources to Lesson format
                mappedLessons = lessonsData.map(item => {
                    // If it's a generic Resource, map it. If it's a legacy Lesson, keep it.
                    if (item.content && typeof item.content === 'string' && item.content.startsWith('{')) {
                        try {
                            // Try to parse JSON content from Resource
                            const jsonContent = JSON.parse(item.content);

                            // Transform JSON structure to flat string for display if needed
                            let displayContent = "";
                            if (jsonContent.outline) {
                                displayContent = jsonContent.outline.map(o => `### ${o.title}\n${o.content}`).join("\n\n");
                            } else if (jsonContent.instructions) {
                                displayContent = `## Instruktioner\n${jsonContent.instructions}`;
                            } else {
                                displayContent = "Ingen förhandsvisning tillgänglig.";
                            }

                            return {
                                id: item.id,
                                title: item.name,
                                content: displayContent,
                                type: 'LESSON', // Force type for UI
                                availableFrom: item.createdAt,
                                visibility: item.visibility, // Add visibility field
                                isResource: true // Flag to identify generic resource
                            };
                        } catch (e) {
                            // Fallback if parsing fails or it's not JSON
                            return item;
                        }
                    } else if (item.name && !item.title) {
                        // It's a Resource but maybe content is simple string?
                        return {
                            ...item,
                            title: item.name,
                            visibility: item.visibility
                        };
                    }
                    return item;
                });

                setLessons(mappedLessons);

                // Select first item if nothing selected
                if (mappedLessons.length > 0 && !selectedLesson && !selectedQuiz) {
                    setSelectedLesson(mappedLessons[0]);
                }
            }

            setQuizzes(qData);

            // --- AUTO SELECT ITEM FROM URL ---
            const query = new URLSearchParams(window.location.search);
            const itemId = query.get('itemId');
            if (itemId) {
                // Check lessons
                const foundLesson = mappedLessons.find(l => String(l.id) === itemId);
                if (foundLesson) {
                    setSelectedLesson(foundLesson);
                    setSelectedQuiz(null);
                    // Add a small delay to allow the list to render before scrolling
                    setTimeout(() => {
                        const element = document.getElementById(`lesson-item-${itemId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                    return;
                }
                // Check quizzes
                const foundQuiz = qData.find(q => String(q.id) === itemId);
                if (foundQuiz) {
                    setSelectedQuiz(foundQuiz);
                    setSelectedLesson(null);
                    // Add a small delay to allow the list to render before scrolling
                    setTimeout(() => {
                        const element = document.getElementById(`quiz-item-${itemId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                }
            }
        } catch (e) {
            console.error("Failed to load content", e);
        }
    };

    const handleCreateClick = () => {
        setFormData({ title: 'Nytt Innehåll', content: '', videoUrl: '', type: 'LESSON', availableFrom: '' });
        setFile(null);
        setSelectedLesson(null);
        setSelectedQuiz(null);
        setAddToCalendar(false);
        setCalendarStart('');
        setCalendarEnd('');
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const fd = new FormData();

        // --- VIKTIGT: Mappar datan korrekt mot backend ---
        fd.append('title', formData.title || 'Namnlös lektion');
        fd.append('content', formData.content || '');

        // Mappa videoUrl till 'link' som backend förväntar sig
        if (formData.videoUrl) fd.append('link', formData.videoUrl);

        // Sätt typen från formuläret
        fd.append('type', formData.type || 'LESSON');

        // Datumstyrning
        if (formData.availableFrom) fd.append('availableFrom', formData.availableFrom);
        else fd.append('availableFrom', ''); // Skicka tom sträng för att rensa om man tömt fältet

        // Flyttade metadata för adaptivt lärande
        if (formData.difficultyLevel) fd.append('difficulty', formData.difficultyLevel);
        if (formData.estimatedTimeMinutes) fd.append('estimatedTime', formData.estimatedTimeMinutes);
        if (formData.prerequisiteMaterialId) fd.append('prerequisiteId', formData.prerequisiteMaterialId);

        // Skicka fil om det finns
        if (file) fd.append('file', file);

        try {
            let savedItem;
            if (selectedLesson && selectedLesson.id) {
                // UPDATE
                savedItem = await api.lessons.update(selectedLesson.id, fd);
            } else if (mode === 'GLOBAL') {
                // CREATE GLOBAL
                savedItem = await api.lessons.createGlobal(currentUser.id, fd);
            } else {
                // CREATE FOR COURSE
                savedItem = await api.lessons.create(courseId, currentUser.id, fd);
            }

            if (savedItem) {
                if (selectedLesson && selectedLesson.id) {
                    setLessons(lessons.map(l => l.id === savedItem.id ? savedItem : l));
                    setSelectedLesson(savedItem);
                } else {
                    setLessons([...lessons, savedItem]);
                    setSelectedLesson(savedItem);
                }

                // --- CALENDAR INTEGRATION ---
                if (addToCalendar && calendarStart && calendarEnd) {
                    try {
                        const eventReq = {
                            title: formData.title,
                            description: `Ny lektion: ${formData.title}.\nLäs mer under Material-fliken.`,
                            startTime: new Date(calendarStart).toISOString(),
                            endTime: new Date(calendarEnd).toISOString(),
                            type: 'LESSON',
                            status: 'CONFIRMED',
                            courseId: courseId
                        };

                        await api.events.create(eventReq);
                    } catch (calErr) {
                        console.error("Error saving to calendar", calErr);
                        alert("Lektionen sparades, men det gick inte att lägga till den i kalendern.");
                    }
                }
                // --- END CALENDAR INTEGRATION ---

                setIsEditing(false);
                setFile(null);
            } else {
                alert("Kunde inte spara: Okänt fel på servern.");
            }
        } catch (e) {
            console.error(e);
            alert("Kunde inte spara lektionen: " + (e.message || "Anslutningsfel"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Är du säker på att du vill radera lektionen?")) return;
        try {
            await api.lessons.delete(id);
            const remaining = lessons.filter(l => l.id !== id);
            setLessons(remaining);
            setSelectedLesson(remaining.length > 0 ? remaining[0] : null);
        } catch (e) { alert("Kunde inte radera"); }
    };

    // Helper: Identifiera filtyp
    const isVideoFile = (url) => url && url.match(/\.(mp4|webm|ogg|mov)$/i);
    const isImageFile = (url) => url && url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isEpubFile = (url) => url && url.match(/\.epub$/i);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const isEditable = (url) => {
        if (!url) return false;
        const parts = url.split('.');
        if (parts.length < 2) return false;
        const ext = parts.pop().toLowerCase();
        const editableExts = ['docx', 'doc', 'odt', 'xlsx', 'xls', 'ods', 'pptx', 'ppt', 'odp', 'txt'];
        return editableExts.includes(ext);
    };

    const handleSaveToMyFiles = async (lesson) => {
        if (!lesson || !lesson.fileUrl) return;
        setIsSavingFile(true);
        try {
            const token = localStorage.getItem('token');
            const tenantId = localStorage.getItem('tenant_id') || '';
            const fetchUrl = getSafeUrl(lesson.fileUrl);

            const reqHeaders = { 'Authorization': `Bearer ${token}` };
            if (tenantId) reqHeaders['X-Tenant-ID'] = tenantId;

            const response = await fetch(fetchUrl, { headers: reqHeaders });
            if (!response.ok) throw new Error("Kunde inte hämta filen");

            const blob = await response.blob();
            // Get original filename or set a fallback
            const filename = lesson.fileUrl.split('/').pop() || 'dokument';

            const fileObj = new File([blob], filename, { type: blob.type });
            const formData = new FormData();
            formData.append('file', fileObj);

            await api.documents.upload(currentUser.id, formData);
            alert("Filen har sparats i 'Filer & Dokument'!");
        } catch (error) {
            console.error(error);
            alert("Kunde inte spara filen: " + error.message);
        } finally {
            setIsSavingFile(false);
        }
    };

    const startEditing = (lesson) => {
        setFormData({
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.link, // Mappa tillbaka 'link' till 'videoUrl'
            type: lesson.type || 'LESSON',
            availableFrom: lesson.availableFrom || '',
            difficultyLevel: lesson.difficultyLevel || 3,
            estimatedTimeMinutes: lesson.estimatedTimeMinutes || 15,
            prerequisiteMaterialId: lesson.prerequisiteMaterial?.id || ''
        });
        setFile(null);
        setSelectedLesson(lesson);
        setSelectedQuiz(null);
        setIsEditing(true);
    };

    const handleQuizSubmit = async (quizId, score, maxScore) => {
        try {
            await api.quiz.submit(quizId, { studentId: currentUser.id, score, maxScore });
            setActiveQuizRunner(null);
            alert("Bra jobbat! Ditt resultat är sparat.");
            // Optionally reload to update specific stats if we had them
        } catch (e) {
            console.error(e);
            alert("Kunde inte spara resultatet.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">

            {/* VÄNSTER: LEKTIONSLISTA */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] flex flex-col overflow-hidden min-h-[400px] lg:max-h-[calc(100vh-200px)] lg:sticky lg:top-8">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Kursplan</h3>
                    {isTeacher && <button onClick={handleCreateClick} className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center shadow-sm" title="Lägg till nytt material"><Plus size={20} /></button>}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {lessons.length === 0 && quizzes.length === 0 && <p className="text-sm text-gray-400 text-center py-10">Inget innehåll än.</p>}

                    {/* DYNAMIC LISTS: Lektioner, Quiz, Filer, Videos */}
                    {[
                        { title: null, items: lessons.filter(l => !['FILE', 'EPUB', 'VIDEO', 'STUDY_MATERIAL'].includes(l.type)), isQuiz: false },
                        { title: 'Quiz & Förhör', items: quizzes, isQuiz: true },
                        { title: 'Filer', items: lessons.filter(l => ['FILE', 'EPUB', 'STUDY_MATERIAL'].includes(l.type)), isQuiz: false, icon: <Paperclip size={12} /> },
                        { title: 'Videos', items: lessons.filter(l => l.type === 'VIDEO'), isQuiz: false, icon: <Film size={12} /> }
                    ].map((group, groupIdx) => (
                        <React.Fragment key={`group-${groupIdx}`}>
                            {group.title && group.items.length > 0 && <div className="px-3 pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">{group.title}</div>}
                            {group.items.map((item, idx) => {
                                const isLocked = !isTeacher && item.availableFrom && new Date(item.availableFrom) > new Date();
                                const isScheduled = isTeacher && item.availableFrom && new Date(item.availableFrom) > new Date();

                                if (group.isQuiz) {
                                    return (
                                        <div
                                            key={`quiz-${item.id}`}
                                            id={`quiz-item-${item.id}`}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setSelectedQuiz(item);
                                                    setSelectedLesson(null);
                                                    setIsEditing(false);
                                                }
                                            }}
                                            className={`p-3 rounded-lg cursor-pointer text-sm flex items-center justify-between group transition-colors ${selectedQuiz?.id === item.id ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'} ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-xs">
                                                    <HelpCircle size={12} />
                                                </span>
                                                <div className="truncate">
                                                    <span className="truncate block font-medium">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">
                                                        {item.questions?.length || 0} Frågor
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedQuiz?.id === item.id && <ChevronRight size={14} />}
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={`lesson-${item.id}`}
                                            id={`lesson-item-${item.id}`}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setSelectedLesson(item);
                                                    setSelectedQuiz(null);
                                                    setIsEditing(false);
                                                }
                                            }}
                                            className={`p-3 rounded-lg cursor-pointer text-sm flex items-center justify-between group transition-colors ${selectedLesson?.id === item.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-black/20' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-[#3c4043] text-xs font-mono text-gray-500">
                                                    {isLocked ? <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> : (group.icon || (idx + 1))}
                                                </span>
                                                <div className="truncate flex-1">
                                                    <span className="truncate block font-medium flex items-center gap-2">
                                                        {item.title}
                                                        {isScheduled && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Kommande</span>}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex gap-2">
                                                        <span>
                                                            {item.type === 'STUDY_MATERIAL' && 'Studiematerial'}
                                                            {item.type === 'QUESTIONS' && 'Instuderingsfrågor'}
                                                            {item.type === 'LINK' && 'Länk'}
                                                            {item.type === 'FILE' && 'Fil'}
                                                            {item.type === 'EPUB' && 'E-bok'}
                                                            {item.type === 'VIDEO' && 'Video'}
                                                            {(!item.type || item.type === 'LESSON') && 'Lektion'}
                                                        </span>
                                                        {isLocked && <span>• Tillgänglig {new Date(item.availableFrom).toLocaleDateString()}</span>}
                                                    </span>
                                                </div>
                                                {/* Visibility Toggle & Share for GLOBAL mode */}
                                                {isTeacher && mode === 'GLOBAL' && item.isResource && (
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        {/* Visibility Toggle */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newVisibility = item.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
                                                                api.resources.updateVisibility(item.id, newVisibility)
                                                                    .then(() => {
                                                                        setLessons(lessons.map(l =>
                                                                            l.id === item.id ? { ...l, visibility: newVisibility } : l
                                                                        ));
                                                                    })
                                                                    .catch(err => {
                                                                        console.error('Failed to update visibility:', err);
                                                                        alert('Kunde inte uppdatera synlighet');
                                                                    });
                                                            }}
                                                            className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${item.visibility === 'PUBLIC'
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                            title={item.visibility === 'PUBLIC' ? 'Klicka för att göra privat' : 'Klicka för att göra publik'}
                                                        >
                                                            {item.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                                                        </button>

                                                        {/* Share to Community Button (only if PUBLIC) */}
                                                        {item.visibility === 'PUBLIC' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPublishingLesson(item);
                                                                    setShowPublishModal(true);
                                                                }}
                                                                className="px-2 py-1 rounded text-[9px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-1"
                                                                title="Dela i Community"
                                                            >
                                                                <Share2 size={10} /> Dela
                                                            </button>
                                                        )}

                                                        {/* Publish to Global Library (Admins only) */}
                                                        {currentUser?.role?.name === 'ADMIN' && item.visibility !== 'GLOBAL_LIBRARY' && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm('Varning: Detta kommer göra materialet tillgängligt för alla tenants i systemets Global Library. Är du säker?')) {
                                                                        try {
                                                                            await api.globalLibrary.publish(item.id);
                                                                            alert('Materialet har publicerats till Global Library!');
                                                                            setLessons(lessons.map(l => l.id === item.id ? { ...l, visibility: 'GLOBAL_LIBRARY' } : l));
                                                                        } catch (err) {
                                                                            alert('Kunde inte publicera till Global Library: ' + (err.message || 'Okänt fel'));
                                                                        }
                                                                    }
                                                                }}
                                                                className="px-2 py-1 rounded text-[9px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                                title="Publicera till Global Library"
                                                            >
                                                                🌍 Publicera Globalt
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedLesson?.id === item.id && <ChevronRight size={14} />}
                                        </div>
                                    );
                                }
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* HÖGER: INNEHÅLL */}
            <div className="lg:col-span-3 min-w-0 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-8 flex flex-col">
                {isEditing ? (
                    /* EDITOR MODE */
                    <div className="space-y-4 flex-1 animate-in fade-in relative pb-24">
                        {isSaving && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Sparar lektion...</span>
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-bold dark:text-white mb-4">{selectedLesson?.id ? 'Redigera Lektion' : 'Ny Lektion'}</h2>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Titel</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="T.ex. Introduktion till Java" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Typ av innehåll</label>
                            <select
                                className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={formData.type || 'LESSON'}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="LESSON">Lektion (Text/Video/Blandat)</option>
                                <option value="VIDEO">Videolektion (Egen uppladdning)</option>
                                <option value="STUDY_MATERIAL">Studiematerial (Fil/Dokument)</option>
                                <option value="QUESTIONS">Instuderingsfrågor</option>
                                <option value="LINK">Extern Länk</option>
                                <option value="EPUB">E-bok (EPUB)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Publiceras (Valfritt schema)</label>
                            <input
                                type="datetime-local"
                                className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={formData.availableFrom}
                                onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Låt stå tomt för att publicera direkt.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Svårighetsgrad (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                    value={formData.difficultyLevel}
                                    onChange={e => setFormData({ ...formData, difficultyLevel: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Uppskattad tid (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                    value={formData.estimatedTimeMinutes}
                                    onChange={e => setFormData({ ...formData, estimatedTimeMinutes: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Förkunskap (Valfritt)</label>
                                <select
                                    className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                    value={formData.prerequisiteMaterialId}
                                    onChange={e => setFormData({ ...formData, prerequisiteMaterialId: e.target.value })}
                                >
                                    <option value="">Ingen specifik</option>
                                    {lessons.filter(l => l.id !== selectedLesson?.id).map(l => (
                                        <option key={l.id} value={l.id}>{l.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">YouTube URL (Valfritt)</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="https://youtube.com/..." value={formData.videoUrl || ''} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                {formData.type === 'VIDEO' ? (
                                    <span className="flex items-center gap-2">
                                        <Film size={14} className="text-indigo-500" />
                                        Ladda upp video (MP4, WebM, MOV - Max 500MB)
                                    </span>
                                ) : (
                                    'Ladda upp fil / Bild / Video (Valfritt)'
                                )}
                            </label>
                            <input
                                type="file"
                                accept={formData.type === 'VIDEO'
                                    ? '.mp4,.mov,.webm,.avi,.mkv'
                                    : '.pdf,.epub,.doc,.docx,.ppt,.pptx,.zip,.mp4,.mov,.webm,.jpg,.jpeg,.png,.gif,.webp'}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                onChange={e => {
                                    const selectedFile = e.target.files[0];
                                    if (selectedFile) {
                                        // Validate video size (500MB max)
                                        if (formData.type === 'VIDEO' && selectedFile.size > 500 * 1024 * 1024) {
                                            alert('Filen är för stor. Max 500MB för video.');
                                            e.target.value = '';
                                            return;
                                        }
                                        setFile(selectedFile);
                                    }
                                }}
                            />
                            {file && (
                                <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                                    <Film size={12} /> {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </p>
                            )}
                            {selectedLesson?.fileUrl && !file && (
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <Paperclip size={12} /> Fil finns redan sparad. Ladda upp ny för att ersätta.
                                </p>
                            )}
                            {formData.type === 'VIDEO' && (
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Videor spelas upp direkt i webbläsaren med kapitel-stöd och hastighetsval.
                                </p>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Innehåll / Beskrivning</label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={val => setFormData({ ...formData, content: val })}
                                placeholder="Skriv lektionsinnehållet här..."
                                style={{ height: '350px', marginBottom: '40px' }}
                            />
                        </div>

                        {/* CALENDAR INTEGRATION SECTION */}
                        <div className="bg-gray-50 dark:bg-[#2A2B2C] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043] my-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={addToCalendar}
                                        onChange={(e) => setAddToCalendar(e.target.checked)}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${addToCalendar ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${addToCalendar ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Schemalägg lektion i Kalendern</span>
                                    <span className="text-xs text-gray-500">Lägg automatiskt till en kalenderhändelse för denna lektion som eleverna kan se.</span>
                                </div>
                            </label>

                            {addToCalendar && (
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-[#3c4043] animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Starttid</label>
                                        <input
                                            type="datetime-local"
                                            value={calendarStart}
                                            onChange={(e) => setCalendarStart(e.target.value)}
                                            className="w-full bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3c4043] rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Sluttid</label>
                                        <input
                                            type="datetime-local"
                                            value={calendarEnd}
                                            onChange={(e) => setCalendarEnd(e.target.value)}
                                            className="w-full bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3c4043] rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-6 border-t dark:border-[#3c4043] mt-8">
                            <button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"><Save size={18} /> Spara Lektion</button>
                            <button onClick={() => { setIsEditing(false); if (!selectedLesson && lessons.length > 0) setSelectedLesson(lessons[0]); }} disabled={isSaving} className="bg-gray-100 dark:bg-[#3c4043] text-gray-700 dark:text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-[#4a4d51] transition-colors">Avbryt</button>
                        </div>
                    </div>
                ) : selectedQuiz ? (
                    /* QUIZ VIEW MODE */
                    <div className="flex flex-col h-full animate-in fade-in">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded mb-2 inline-block">QUIZ</span>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedQuiz.title}</h2>
                                <div className="h-1 w-20 bg-purple-500 rounded-full"></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#131314] rounded-xl border border-gray-100 dark:border-[#3c4043] p-8 text-center max-w-2xl mx-auto shadow-sm mt-8">
                            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
                                <HelpCircle size={40} />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dags för {selectedQuiz.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                                {selectedQuiz.description || 'Detta quiz testar dina kunskaper på området. Lycka till!'}
                            </p>

                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                                <div className="bg-gray-50 dark:bg-[#1E1F20] p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Frågor</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedQuiz.questions?.length || 0} st</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1E1F20] p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tidsgräns</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">Ingen</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveQuizRunner(selectedQuiz)}
                                className="w-full max-w-xs mx-auto bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-none flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
                            >
                                <PlayCircle size={24} /> Starta Quiz
                            </button>
                        </div>
                    </div>
                ) : selectedLesson ? (
                    /* VIEW MODE */
                    <div className="flex flex-col h-full animate-in fade-in">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedLesson.title}</h2>
                                <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
                            </div>
                            {isTeacher && (
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={async () => {
                                            if (isVideoGenerating) return;
                                            if (!confirm("Vill du skapa en AI-videoförklaring för denna lektion? Det tar ca 1-2 minuter.")) return;
                                            setIsVideoGenerating(true);
                                            try {
                                                const res = await api.ai.tutor.generateVideo(courseId, selectedLesson.id);
                                                alert(res.message || "Videogenerering har startats!");
                                            } catch (e) {
                                                console.error(e);
                                                if (e.message && e.message.includes("403")) {
                                                    alert("🔒 Denna funktion kräver en PRO eller ENTERPRISE licens.");
                                                } else {
                                                    alert("Kunde inte starta videogenerering.");
                                                }
                                            } finally {
                                                setIsVideoGenerating(false);
                                            }
                                        }}
                                        disabled={isVideoGenerating}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm border border-transparent transition-all ${isVideoGenerating
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-200 dark:shadow-none'
                                            }`}
                                        title="Skapa AI-videoförklaring"
                                    >
                                        {isVideoGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                        {isVideoGenerating ? 'Genererar...' : 'AI-Video'}
                                    </button>

                                    {/* GENERATE / EXPORT DROP-DOWN */}
                                    <div className="relative group">
                                        <button
                                            disabled={isExporting || isPPTGenerating}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm border border-transparent transition-all ${isExporting || isPPTGenerating
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                }`}
                                        >
                                            {isExporting || isPPTGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                            {isExporting ? 'Exporterar...' : isPPTGenerating ? 'Genererar...' : 'Exportera'}
                                            <ChevronDown size={12} />
                                        </button>

                                        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-[#202124] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2 overflow-hidden">
                                            <button
                                                onClick={async () => {
                                                    if (isPPTGenerating) return;
                                                    if (!confirm("Vill du skapa ett PowerPoint-presentation baserat på denna lektion?")) return;
                                                    setIsPPTGenerating(true);
                                                    try {
                                                        const res = await api.ai.powerpoint.generate(courseId, selectedLesson.id);
                                                        alert(res.message || "PowerPoint har genererats!");
                                                        loadLessons();
                                                    } catch (e) { alert("Kunde inte generera PowerPoint."); }
                                                    finally { setIsPPTGenerating(false); }
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-[#3c4043] flex items-center gap-2 group/item"
                                            >
                                                <ImageIcon size={14} className="text-orange-500 transition-transform group-hover/item:scale-110" /> PowerPoint (.pptx)
                                            </button>


                                            <button
                                                onClick={async () => {
                                                    setIsExporting(true);
                                                    try {
                                                        const res = await api.ai.export.pdf(courseId, selectedLesson.id);
                                                        alert(res.message);
                                                        loadLessons();
                                                    } catch (e) { alert("PDF-export misslyckades."); }
                                                    finally { setIsExporting(false); }
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-[#3c4043] flex items-center gap-2"
                                            >
                                                <FileText size={14} className="text-red-500" /> PDF Dokument
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setIsExporting(true);
                                                    try {
                                                        const res = await api.ai.export.word(courseId, selectedLesson.id);
                                                        alert(res.message);
                                                        loadLessons();
                                                    } catch (e) { alert("Word-export misslyckades."); }
                                                    finally { setIsExporting(false); }
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-[#3c4043] flex items-center gap-2"
                                            >
                                                <FileText size={14} className="text-blue-500" /> Word (.docx)
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setIsExporting(true);
                                                    try {
                                                        const res = await api.ai.export.excel(courseId, selectedLesson.id);
                                                        alert(res.message);
                                                        loadLessons();
                                                    } catch (e) { alert("Excel-export misslyckades."); }
                                                    finally { setIsExporting(false); }
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-[#3c4043] flex items-center gap-2"
                                            >
                                                <FileText size={14} className="text-green-500" /> Excel (.xlsx)
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setIsExporting(true);
                                                    try {
                                                        const res = await api.ai.export.epub(courseId, selectedLesson.id);
                                                        alert(res.message);
                                                        loadLessons();
                                                    } catch (e) { alert("EPUB-export misslyckades."); }
                                                    finally { setIsExporting(false); }
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-[#3c4043] flex items-center gap-2"
                                            >
                                                <Book size={14} className="text-purple-500" /> E-bok (.epub)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                                    <button onClick={() => startEditing(selectedLesson)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-lg transition-colors" title="Redigera"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(selectedLesson.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-lg transition-colors" title="Ta bort"><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>

                        {/* --- MEDIA VISARE --- */}
                        <div className="space-y-6 mb-8">

                            {/* 1. YOUTUBE */}
                            {selectedLesson.link && getEmbedUrl(selectedLesson.link) && (
                                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10">
                                    <iframe
                                        src={getEmbedUrl(selectedLesson.link)}
                                        title={selectedLesson.title}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}

                            {/* 2. EGEN VIDEO - with enhanced player */}
                            {selectedLesson.fileUrl && isVideoFile(selectedLesson.fileUrl) && (
                                <VideoPlayer
                                    src={getSafeUrl(selectedLesson.fileUrl)}
                                    title={selectedLesson.title}
                                    chapters={selectedLesson.videoChapters ? JSON.parse(selectedLesson.videoChapters) : []}
                                    poster={getSafeUrl(selectedLesson.thumbnailUrl)}
                                    onProgress={({ currentTime, duration }) => {
                                        if (!isTeacher && currentTime > 0 && currentTime % 30 < 1) {
                                            const percent = Math.round((currentTime / duration) * 100);
                                            console.log(`Video progress: ${percent}%`);
                                        }
                                    }}
                                    onEnded={() => {
                                        if (!isTeacher) {
                                            api.activity.log({
                                                userId: currentUser.id,
                                                courseId: courseId,
                                                materialId: selectedLesson.id,
                                                type: 'COMPLETE_VIDEO',
                                                details: `Completed: ${selectedLesson.title}`
                                            }).catch(console.error);
                                        }
                                    }}
                                />
                            )}

                            {/* 3. BILD */}
                            {selectedLesson.fileUrl && isImageFile(selectedLesson.fileUrl) && (
                                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#3c4043]">
                                    <img src={getSafeUrl(selectedLesson.fileUrl)} alt="Lektionsmaterial" className="w-full h-auto object-contain max-h-[600px] bg-gray-50 dark:bg-black/50" />
                                </div>
                            )}

                            {/* 4. EPUB E-BOK */}
                            {selectedLesson.fileUrl && isEpubFile(selectedLesson.fileUrl) && (
                                <div className="h-[700px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#3c4043]">
                                    <EpubViewer
                                        url={getSafeUrl(selectedLesson.fileUrl)}
                                        title={selectedLesson.title}
                                    />
                                </div>
                            )}

                            {/* 5. AI GENERATED VIDEO */}
                            {selectedLesson.aiVideoUrl && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                        <Sparkles size={16} />
                                        <span>AI-Förklaring för denna lektion</span>
                                    </div>
                                    <VideoPlayer
                                        src={getSafeUrl(selectedLesson.aiVideoUrl)}
                                        title={`AI Förklaring: ${selectedLesson.title}`}
                                        poster={getSafeUrl(selectedLesson.thumbnailUrl)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* --- BIFOGAD FIL (Om det inte är video/bild) --- */}
                        {selectedLesson.fileUrl && !isVideoFile(selectedLesson.fileUrl) && !isImageFile(selectedLesson.fileUrl) && (
                            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-[#1E1F20] rounded-lg shadow-sm text-indigo-600"><Paperclip size={20} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Resurs</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Bifogad fil</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1F20] hover:bg-gray-50 dark:hover:bg-[#282a2c] text-sm font-bold text-gray-700 dark:text-gray-200 rounded-lg shadow-sm border border-gray-200 dark:border-[#3c4043] transition-colors focus:ring-2 focus:ring-indigo-500/20">
                                            Filalternativ <ChevronDown size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        </button>
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[var(--dark-surface)] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-100 dark:border-[var(--dark-border)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                                            <div className="py-2">
                                                {/* Öppna */}
                                                {isEditable(selectedLesson.fileUrl) ? (
                                                    <button
                                                        onClick={() => setOnlyOfficeDoc(selectedLesson)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[var(--dark-bg)] hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                                                    >
                                                        <ExternalLink size={16} /> Öppna
                                                    </button>
                                                ) : (
                                                    <a
                                                        href={getSafeUrl(selectedLesson.fileUrl)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[var(--dark-bg)] hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                                                    >
                                                        <ExternalLink size={16} /> Öppna
                                                    </a>
                                                )}

                                                {/* Spara till mina filer */}
                                                <button
                                                    onClick={() => handleSaveToMyFiles(selectedLesson)}
                                                    disabled={isSavingFile}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[var(--dark-bg)] hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors disabled:opacity-50"
                                                >
                                                    {isSavingFile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                    {isSavingFile ? 'Sparar...' : 'Spara till mina filer'}
                                                </button>

                                                {/* Ladda ner */}
                                                <a
                                                    href={getSafeUrl(selectedLesson.fileUrl)}
                                                    download
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => {
                                                        if (!isTeacher) {
                                                            api.activity.log({
                                                                userId: currentUser.id,
                                                                courseId: courseId,
                                                                materialId: selectedLesson.id,
                                                                type: 'DOWNLOAD_FILE',
                                                                details: selectedLesson.fileUrl.split('/').pop()
                                                            }).catch(console.error);
                                                        }
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[var(--dark-bg)] hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                                                >
                                                    <Download size={16} /> Ladda ner
                                                </a>

                                                {/* Separator if teacher tools are shown */}
                                                {isTeacher && (
                                                    <div className="mx-3 my-1 border-b border-gray-100 dark:border-[var(--dark-border)]"></div>
                                                )}

                                                {/* Redigera Inline */}
                                                {isTeacher && isEditable(selectedLesson.fileUrl) && (
                                                    <button
                                                        onClick={() => setOnlyOfficeDoc(selectedLesson)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[var(--dark-bg)] hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                                                    >
                                                        <Edit2 size={16} /> Redigera Inline
                                                    </button>
                                                )}

                                                {/* Indexera */}
                                                {isTeacher && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm("Vill du indexera detta dokument för AI-tutorn?")) return;
                                                            try {
                                                                await api.ai.tutor.ingest(courseId, selectedLesson.id);
                                                                alert("Dokumentet har indexerats!");
                                                            } catch (e) {
                                                                console.error(e);
                                                                alert("Kunde inte indexera.");
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left transition-colors"
                                                    >
                                                        <Sparkles size={16} /> Lägg till i AI-Tutor
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TEXT CONTENT */}
                        <div
                            className="prose dark:prose-invert max-w-full overflow-hidden text-gray-700 dark:text-gray-300 leading-relaxed mb-12 prose-pre:overflow-x-auto prose-pre:max-w-full break-words"
                            dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                        />

                        {/* --- SOCIAL: COMMENTS --- */}
                        <div className="border-t border-gray-100 dark:border-[#3c4043] pt-8">
                            <CommentSection
                                targetType="LESSON"
                                targetId={selectedLesson.id}
                                title="Diskussion & Frågor"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen size={64} className="mb-4 opacity-10" />
                        <p className="text-lg font-medium">Välj en lektion från listan för att börja plugga.</p>
                        {isTeacher && <button onClick={handleCreateClick} className="mt-4 text-indigo-600 hover:underline">Eller skapa en ny</button>}
                    </div>
                )}
            </div>

            {onlyOfficeDoc && (
                <OnlyOfficeEditor
                    entityType={mode === 'COURSE' ? 'MATERIAL' : 'LESSON'}
                    entityId={onlyOfficeDoc.id}
                    userId={currentUser?.id}
                    onClose={() => {
                        setOnlyOfficeDoc(null);
                        loadLessons();
                    }}
                />
            )}

            {activeQuizRunner && (
                <QuizRunnerModal
                    quiz={activeQuizRunner}
                    onClose={() => setActiveQuizRunner(null)}
                    onSubmit={handleQuizSubmit}
                />
            )}

            {showPublishModal && publishingLesson && (
                <PublishModal
                    initialType={publishingLesson.isResource ? "RESOURCE" : "LESSON"}
                    initialItemId={publishingLesson.id}
                    userId={currentUser?.id}
                    onClose={() => {
                        setShowPublishModal(false);
                        setPublishingLesson(null);
                    }}
                    onPublished={() => {
                        alert('✅ Lektion publicerad i Community för granskning!');
                        setShowPublishModal(false);
                        setPublishingLesson(null);
                        loadLessons(); // Reload to get updated data
                    }}
                />
            )}
        </div>
    );
};

export default CourseContentModule;
