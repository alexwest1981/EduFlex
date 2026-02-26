import React, { useState, useEffect } from 'react';
import { QuizRunnerModal } from '../quiz-runner/QuizModals';
import { BookOpen, Plus, Edit2, Trash2, Save, ChevronRight, Video, Download, Paperclip, Loader2, Image as ImageIcon, Film, HelpCircle, Trophy, PlayCircle, Sparkles, Share2 } from 'lucide-react';
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
            const token = localStorage.getItem('token');
            let url = `${window.location.origin}/api/courses/${courseId}/materials`;
            let quizUrl = `${window.location.origin}/api/quizzes/course/${courseId}`;

            if (mode === 'GLOBAL') {
                // Fetch generic Resources of type LESSON
                url = `${window.location.origin}/api/resources/my?userId=${currentUser?.id}&type=LESSON`;
                quizUrl = `${window.location.origin}/api/quizzes/my?userId=${currentUser?.id}`;
            }

            const [resLessons, resQuizzes] = await Promise.all([
                fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(quizUrl, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            let mappedLessons = [];
            let qData = [];

            if (resLessons.ok) {
                const data = await resLessons.json();

                // MAP resources to Lesson format
                mappedLessons = data.map(item => {
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

            if (resQuizzes.ok) {
                qData = await resQuizzes.json();
                setQuizzes(qData);
            }

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
                if (resQuizzes.ok) {
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
        const token = localStorage.getItem('token');
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
            let url = `${window.location.origin}/api/courses/${courseId}/materials?userId=${currentUser?.id}`;
            let method = 'POST';

            if (mode === 'GLOBAL') {
                url = `${window.location.origin}/api/lessons/create?userId=${currentUser?.id}`;
            }

            if (selectedLesson && selectedLesson.id) {
                // Vid update är det samma endpoint oavsett global/course
                url = `${window.location.origin}/api/courses/materials/${selectedLesson.id}`;
                method = 'PUT'; // LessonController har @PutMapping("/{id}") för update
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (res.ok) {
                const savedItem = await res.json();

                if (method === 'POST') {
                    setLessons([...lessons, savedItem]);
                    setSelectedLesson(savedItem);
                } else {
                    setLessons(lessons.map(l => l.id === savedItem.id ? savedItem : l));
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
                        console.log("Saving to calendar with payload:", eventReq);
                        const calRes = await fetch(`${window.location.origin}/api/events`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(eventReq)
                        });

                        if (!calRes.ok) {
                            console.error("Failed to save to calendar", await calRes.text());
                            alert("Lektionen sparades, men det gick inte att lägga till den i kalendern.");
                        }
                    } catch (calErr) {
                        console.error("Error saving to calendar", calErr);
                        alert("Ett nätverksfel uppstod när lektionen skulle läggas till i kalendern.");
                    }
                }
                // --- END CALENDAR INTEGRATION ---

                setIsEditing(false);
                setFile(null);
            } else {
                const errText = await res.text();
                alert(`Kunde inte spara: ${errText || "Okänt fel"}`);
            }
        } catch (e) {
            console.error(e);
            alert("Kunde inte ansluta till servern.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Är du säker på att du vill radera lektionen?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${window.location.origin}/api/courses/materials/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

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

                    {/* LESSONS LIST */}
                    {lessons.map((lesson, idx) => {
                        const isLocked = !isTeacher && lesson.availableFrom && new Date(lesson.availableFrom) > new Date();
                        const isScheduled = isTeacher && lesson.availableFrom && new Date(lesson.availableFrom) > new Date();

                        return (
                            <div
                                key={`lesson-${lesson.id}`}
                                id={`lesson-item-${lesson.id}`}
                                onClick={() => {
                                    if (!isLocked) {
                                        setSelectedLesson(lesson);
                                        setSelectedQuiz(null);
                                        setIsEditing(false);
                                    }
                                }}
                                className={`p-3 rounded-lg cursor-pointer text-sm flex items-center justify-between group transition-colors ${selectedLesson?.id === lesson.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-black/20' : ''}`}
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-[#3c4043] text-xs font-mono">
                                        {isLocked ? <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> : (idx + 1)}
                                    </span>
                                    <div className="truncate flex-1">
                                        <span className="truncate block font-medium flex items-center gap-2">
                                            {lesson.title}
                                            {isScheduled && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Kommande</span>}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 flex gap-2">
                                            <span>
                                                {lesson.type === 'STUDY_MATERIAL' && 'Studiematerial'}
                                                {lesson.type === 'QUESTIONS' && 'Instuderingsfrågor'}
                                                {lesson.type === 'LINK' && 'Länk'}
                                                {(!lesson.type || lesson.type === 'LESSON' || lesson.type === 'VIDEO') && 'Lektion'}
                                            </span>
                                            {isLocked && <span>• Tillgänglig {new Date(lesson.availableFrom).toLocaleDateString()}</span>}
                                        </span>
                                    </div>
                                    {/* Visibility Toggle & Share for GLOBAL mode */}
                                    {isTeacher && mode === 'GLOBAL' && lesson.isResource && (
                                        <div className="flex gap-1 flex-shrink-0">
                                            {/* Visibility Toggle */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newVisibility = lesson.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
                                                    api.resources.updateVisibility(lesson.id, newVisibility)
                                                        .then(() => {
                                                            setLessons(lessons.map(l =>
                                                                l.id === lesson.id ? { ...l, visibility: newVisibility } : l
                                                            ));
                                                        })
                                                        .catch(err => {
                                                            console.error('Failed to update visibility:', err);
                                                            alert('Kunde inte uppdatera synlighet');
                                                        });
                                                }}
                                                className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${lesson.visibility === 'PUBLIC'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                title={lesson.visibility === 'PUBLIC' ? 'Klicka för att göra privat' : 'Klicka för att göra publik'}
                                            >
                                                {lesson.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                                            </button>

                                            {/* Share to Community Button (only if PUBLIC) */}
                                            {lesson.visibility === 'PUBLIC' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPublishingLesson(lesson);
                                                        setShowPublishModal(true);
                                                    }}
                                                    className="px-2 py-1 rounded text-[9px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-1"
                                                    title="Dela i Community"
                                                >
                                                    <Share2 size={10} /> Dela
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {selectedLesson?.id === lesson.id && <ChevronRight size={14} />}
                            </div>
                        );
                    })}

                    {/* QUIZZES LIST */}
                    {quizzes.length > 0 && <div className="px-3 pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Quiz & Förhör</div>}
                    {quizzes.map((quiz, idx) => {
                        const isLocked = !isTeacher && quiz.availableFrom && new Date(quiz.availableFrom) > new Date();

                        return (
                            <div
                                key={`quiz-${quiz.id}`}
                                id={`quiz-item-${quiz.id}`}
                                onClick={() => {
                                    if (!isLocked) {
                                        setSelectedQuiz(quiz);
                                        setSelectedLesson(null);
                                        setIsEditing(false);
                                    }
                                }}
                                className={`p-3 rounded-lg cursor-pointer text-sm flex items-center justify-between group transition-colors ${selectedQuiz?.id === quiz.id ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'} ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-xs">
                                        <HelpCircle size={12} />
                                    </span>
                                    <div className="truncate">
                                        <span className="truncate block font-medium">
                                            {quiz.title}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">
                                            {quiz.questions?.length || 0} Frågor
                                        </span>
                                    </div>
                                </div>
                                {selectedQuiz?.id === quiz.id && <ChevronRight size={14} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* HÖGER: INNEHÅLL */}
            <div className="lg:col-span-3 min-w-0 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-8 flex flex-col">
                {isEditing ? (
                    /* EDITOR MODE */
                    <div className="space-y-4 flex-1 animate-in fade-in relative">
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

                        <div className="flex gap-3 pt-4 border-t dark:border-[#3c4043]">
                            <button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"><Save size={18} /> Spara Lektion</button>
                            <button onClick={() => { setIsEditing(false); if (!selectedLesson && lessons.length > 0) setSelectedLesson(lessons[0]); }} disabled={isSaving} className="bg-gray-100 dark:bg-[#3c4043] text-gray-700 dark:text-white px-6 py-2.5 rounded-lg font-bold">Avbryt</button>
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
                                <div className="flex gap-2">
                                    <button onClick={() => startEditing(selectedLesson)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-lg transition-colors"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(selectedLesson.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-lg transition-colors"><Trash2 size={18} /></button>
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
                                        onLoad={() => {
                                            // TODO: YouTube tracking is limited with iframe, sticking to VIEW_LESSON for now
                                        }}
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
                                        // Track progress for student analytics
                                        if (!isTeacher && currentTime > 0 && currentTime % 30 < 1) {
                                            // Log every ~30 seconds
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
                                    onMetadataLoaded={({ duration }) => {
                                        // Could update backend with duration if not set
                                        if (!selectedLesson.videoDuration && duration && isTeacher) {
                                            api.patch(`/videos/${selectedLesson.id}/metadata`, {
                                                duration: Math.floor(duration)
                                            }).catch(console.error);
                                        }
                                    }}
                                />
                            )}

                            {/* 3. BILD (NYTT!) */}
                            {selectedLesson.fileUrl && isImageFile(selectedLesson.fileUrl) && (
                                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#3c4043]">
                                    <img src={getSafeUrl(selectedLesson.fileUrl)} alt="Lektionsmaterial" className="w-full h-auto object-contain max-h-[600px] bg-gray-50 dark:bg-black/50" />
                                </div>
                            )}

                            {/* 4. EPUB E-BOK (NYTT!) */}
                            {selectedLesson.fileUrl && isEpubFile(selectedLesson.fileUrl) && (
                                <div className="h-[700px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#3c4043]">
                                    <EpubViewer
                                        url={getSafeUrl(selectedLesson.fileUrl)}
                                        title={selectedLesson.title}
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
                                <a
                                    href={getSafeUrl(selectedLesson.fileUrl)}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1F20] hover:bg-gray-50 dark:hover:bg-[#282a2c] text-sm font-bold text-gray-700 dark:text-gray-200 rounded-lg shadow-sm border border-gray-200 dark:border-[#3c4043] transition-colors"
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
                                >
                                    <Download size={16} /> Ladda ner
                                </a>
                                {isTeacher && isEditable(selectedLesson.fileUrl) && (
                                    <button
                                        onClick={() => setOnlyOfficeDoc(selectedLesson)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-lg shadow-sm border border-transparent transition-colors"
                                    >
                                        <Edit2 size={16} /> Redigera Inline
                                    </button>
                                )}
                                {isTeacher && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm("Vill du indexera detta dokument för AI-tutorn?")) return;
                                            try {
                                                await api.ai.tutor.ingest(courseId, selectedLesson.id);
                                                alert("Dokumentet har indexerats!");
                                            } catch (e) {
                                                console.error(e);
                                                if (e.message && e.message.includes("403")) {
                                                    alert("🔒 Denna funktion kräver en PRO eller ENTERPRISE licens.");
                                                } else {
                                                    alert("Kunde inte indexera dokumentet.");
                                                }
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-sm font-bold text-purple-700 rounded-lg shadow-sm border border-transparent transition-colors"
                                        title="Indexera för AI-tutor"
                                    >
                                        <Sparkles size={16} /> Indexera
                                    </button>
                                )}
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
