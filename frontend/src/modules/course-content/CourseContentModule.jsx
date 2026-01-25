import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Save, ChevronRight, Video, Download, Paperclip, Loader2, Image as ImageIcon, Film } from 'lucide-react';
import { api } from '../../services/api';
import OnlyOfficeEditor from '../../features/documents/OnlyOfficeEditor';
import VideoPlayer from './components/VideoPlayer';

export const CourseContentModuleMetadata = {
    key: 'material',
    name: 'Kursinnehåll',
    icon: BookOpen,
    settingsKey: 'module_content_enabled'
};

const CourseContentModule = ({ courseId, isTeacher, currentUser, mode = 'COURSE' }) => {
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [onlyOfficeDoc, setOnlyOfficeDoc] = useState(null);

    // Form data
    const [formData, setFormData] = useState({ title: '', content: '', videoUrl: '' });
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
            // Refaktorerad för att använda api service eller url-switch
            // Men för att behålla befintlig struktur med fetch:
            const token = localStorage.getItem('token');
            let url = `http://127.0.0.1:8080/api/courses/${courseId}/materials`;

            if (mode === 'GLOBAL') {
                url = `http://127.0.0.1:8080/api/lessons/my?userId=${currentUser?.id}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLessons(data);
                if (data.length > 0 && !selectedLesson) {
                    setSelectedLesson(data[0]);
                }
            }
        } catch (e) {
            console.error("Failed to load lessons", e);
        }
    };

    const handleCreateClick = () => {
        setFormData({ title: 'Nytt Innehåll', content: '', videoUrl: '', type: 'LESSON', availableFrom: '' });
        setFile(null);
        setSelectedLesson(null);
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

        // Skicka fil om det finns
        if (file) fd.append('file', file);

        try {
            let url = `http://127.0.0.1:8080/api/courses/${courseId}/materials?userId=${currentUser?.id}`;
            let method = 'POST';

            if (mode === 'GLOBAL') {
                url = `http://127.0.0.1:8080/api/lessons/create?userId=${currentUser?.id}`;
            }

            if (selectedLesson && selectedLesson.id) {
                // Vid update är det samma endpoint oavsett global/course
                url = `http://127.0.0.1:8080/api/courses/materials/${selectedLesson.id}`;
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
            await fetch(`http://127.0.0.1:8080/api/courses/materials/${id}`, {
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
            availableFrom: lesson.availableFrom || ''
        });
        setFile(null);
        setSelectedLesson(lesson);
        setIsEditing(true);
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
                    {lessons.length === 0 && <p className="text-sm text-gray-400 text-center py-10">Inga lektioner än.</p>}
                    {lessons.map((lesson, idx) => {
                        const isLocked = !isTeacher && lesson.availableFrom && new Date(lesson.availableFrom) > new Date();
                        const isScheduled = isTeacher && lesson.availableFrom && new Date(lesson.availableFrom) > new Date();

                        return (
                            <div
                                key={lesson.id}
                                onClick={() => {
                                    if (!isLocked) {
                                        setSelectedLesson(lesson);
                                        setIsEditing(false);
                                    }
                                }}
                                className={`p-3 rounded-lg cursor-pointer text-sm flex items-center justify-between group transition-colors ${selectedLesson?.id === lesson.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-black/20' : ''}`}
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-[#3c4043] text-xs font-mono">
                                        {isLocked ? <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> : (idx + 1)}
                                    </span>
                                    <div className="truncate">
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
                                </div>
                                {selectedLesson?.id === lesson.id && <ChevronRight size={14} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* HÖGER: INNEHÅLL */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-8 flex flex-col">
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
                                    : '.pdf,.doc,.docx,.ppt,.pptx,.zip,.mp4,.mov,.webm,.jpg,.jpeg,.png,.gif,.webp'}
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
                            <textarea className="w-full h-64 p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white font-mono text-sm" placeholder="Skriv lektionsinnehållet här..." value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                        </div>

                        <div className="flex gap-3 pt-4 border-t dark:border-[#3c4043]">
                            <button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"><Save size={18} /> Spara Lektion</button>
                            <button onClick={() => { setIsEditing(false); if (!selectedLesson && lessons.length > 0) setSelectedLesson(lessons[0]); }} disabled={isSaving} className="bg-gray-100 dark:bg-[#3c4043] text-gray-700 dark:text-white px-6 py-2.5 rounded-lg font-bold">Avbryt</button>
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
                                    src={selectedLesson.fileUrl.startsWith('http')
                                        ? selectedLesson.fileUrl
                                        : `http://127.0.0.1:8080${selectedLesson.fileUrl}`}
                                    title={selectedLesson.title}
                                    chapters={selectedLesson.videoChapters ? JSON.parse(selectedLesson.videoChapters) : []}
                                    poster={selectedLesson.thumbnailUrl}
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
                                    <img src={`http://127.0.0.1:8080${selectedLesson.fileUrl}`} alt="Lektionsmaterial" className="w-full h-auto object-contain max-h-[600px] bg-gray-50 dark:bg-black/50" />
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
                                    href={`http://127.0.0.1:8080${selectedLesson.fileUrl}`}
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
                            </div>
                        )}

                        {/* TEXT CONTENT */}
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {selectedLesson.content}
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
        </div>
    );
};

export default CourseContentModule;