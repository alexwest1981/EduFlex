import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, Plus, Edit2, Trash2, Save, FileText, ChevronRight, Video, Download, Paperclip } from 'lucide-react';
// Vi använder fetch direkt här för att ha full kontroll över FormData
// (Du kan använda api.js också men detta minimerar risken för missförstånd med parametrarna)

export const CourseContentModuleMetadata = {
    key: 'material',
    name: 'Kursinnehåll',
    icon: BookOpen,
    settingsKey: 'module_content_enabled'
};

const CourseContentModule = ({ courseId, isTeacher }) => {
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form data
    const [formData, setFormData] = useState({ title: '', content: '', videoUrl: '' });
    const [file, setFile] = useState(null);

    useEffect(() => {
        loadLessons();
    }, [courseId]);

    const loadLessons = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://127.0.0.1:8080/api/courses/${courseId}/materials`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filtrera eller sortera om du vill. Nu tar vi allt.
                setLessons(data);

                // Om vi har data men inget valt, välj första
                if (data.length > 0 && !selectedLesson) {
                    setSelectedLesson(data[0]);
                }
            }
        } catch (e) {
            console.error("Failed to load lessons", e);
        }
    };

    const handleCreateClick = () => {
        setFormData({ title: 'Ny Lektion', content: '', videoUrl: '' });
        setFile(null);
        setSelectedLesson(null); // Deselecta för att visa editor
        setIsEditing(true);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('content', formData.content || '');
        fd.append('link', formData.videoUrl || ''); // Vi mappar videoUrl -> link i backend
        fd.append('type', 'LESSON'); // Vi sätter typen hårt till LESSON

        if (file) fd.append('file', file);

        try {
            let url = `http://127.0.0.1:8080/api/courses/${courseId}/materials`;
            let method = 'POST';

            if (selectedLesson && selectedLesson.id) {
                // UPDATE
                url = `http://127.0.0.1:8080/api/courses/materials/${selectedLesson.id}`;
                method = 'PUT'; // Vi använder PUT för uppdatering
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
                alert("Kunde inte spara. Kontrollera filstorleken.");
            }
        } catch(e) {
            console.error(e);
            alert("Ett fel inträffade.");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Är du säker på att du vill radera lektionen?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://127.0.0.1:8080/api/courses/materials/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const remaining = lessons.filter(l => l.id !== id);
            setLessons(remaining);
            setSelectedLesson(remaining.length > 0 ? remaining[0] : null);
        } catch(e) { alert("Kunde inte radera"); }
    };

    const getEmbedUrl = (url) => {
        if (!url) return null;
        // Enkel regex för YouTube ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // Helper för att ladda editor med befintlig data
    const startEditing = (lesson) => {
        setFormData({
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.link // Mappa 'link' från backend till 'videoUrl' i frontend
        });
        setSelectedLesson(lesson); // Behåll selection så vi vet ID
        setIsEditing(true);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in min-h-[600px]">

            {/* VÄNSTER: LEKTIONSLISTA */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] flex flex-col overflow-hidden h-[600px]">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Kursplan</h3>
                    {isTeacher && <button onClick={handleCreateClick} className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"><Plus size={16}/></button>}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {lessons.length === 0 && <p className="text-sm text-gray-400 text-center py-10">Inga lektioner än.</p>}
                    {lessons.map((lesson, idx) => (
                        <div
                            key={lesson.id}
                            onClick={() => { setSelectedLesson(lesson); setIsEditing(false); }}
                            className={`p-3 rounded-lg cursor-pointer text-sm flex items-center justify-between group transition-colors ${selectedLesson?.id === lesson.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-[#3c4043] text-xs font-mono">{idx + 1}</span>
                                <span className="truncate">{lesson.title}</span>
                            </div>
                            {selectedLesson?.id === lesson.id && <ChevronRight size={14}/>}
                        </div>
                    ))}
                </div>
            </div>

            {/* HÖGER: INNEHÅLL */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-8 overflow-y-auto custom-scrollbar h-[600px] flex flex-col">
                {isEditing ? (
                    /* EDITOR MODE */
                    <div className="space-y-4 flex-1 animate-in fade-in">
                        <h2 className="text-xl font-bold dark:text-white mb-4">{selectedLesson ? 'Redigera Lektion' : 'Ny Lektion'}</h2>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Titel</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="T.ex. Introduktion till Java" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Video URL (YouTube)</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="https://youtube.com/..." value={formData.videoUrl || ''} onChange={e => setFormData({...formData, videoUrl: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Bifoga Fil (PDF, PPT, Zip)</label>
                            <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={e => setFile(e.target.files[0])} />
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Innehåll / Beskrivning</label>
                            <textarea className="w-full h-64 p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white font-mono text-sm" placeholder="Skriv lektionsinnehållet här..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                        </div>

                        <div className="flex gap-3 pt-4 border-t dark:border-[#3c4043]">
                            <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700"><Save size={18}/> Spara Lektion</button>
                            <button onClick={() => { setIsEditing(false); if(!selectedLesson && lessons.length > 0) setSelectedLesson(lessons[0]); }} className="bg-gray-100 dark:bg-[#3c4043] text-gray-700 dark:text-white px-6 py-2.5 rounded-lg font-bold">Avbryt</button>
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
                                    <button onClick={() => startEditing(selectedLesson)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-lg transition-colors"><Edit2 size={18}/></button>
                                    <button onClick={() => handleDelete(selectedLesson.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-lg transition-colors"><Trash2 size={18}/></button>
                                </div>
                            )}
                        </div>

                        {/* VIDEO PLAYER */}
                        {selectedLesson.link && getEmbedUrl(selectedLesson.link) && (
                            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mb-8 shadow-lg ring-1 ring-black/10">
                                <iframe
                                    src={getEmbedUrl(selectedLesson.link)}
                                    title={selectedLesson.title}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        {/* ATTACHMENT */}
                        {selectedLesson.fileUrl && (
                            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-[#1E1F20] rounded-lg shadow-sm text-indigo-600">
                                        <Paperclip size={20}/>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Resurs</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Bifogad fil</p>
                                    </div>
                                </div>
                                <a href={`http://127.0.0.1:8080${selectedLesson.fileUrl}`} download target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1F20] hover:bg-gray-50 dark:hover:bg-[#282a2c] text-sm font-bold text-gray-700 dark:text-gray-200 rounded-lg shadow-sm border border-gray-200 dark:border-[#3c4043] transition-colors">
                                    <Download size={16}/> Ladda ner
                                </a>
                            </div>
                        )}

                        {/* TEXT CONTENT */}
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {selectedLesson.content}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen size={64} className="mb-4 opacity-10"/>
                        <p className="text-lg font-medium">Välj en lektion från listan för att börja plugga.</p>
                        {isTeacher && <button onClick={handleCreateClick} className="mt-4 text-indigo-600 hover:underline">Eller skapa en ny</button>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseContentModule;