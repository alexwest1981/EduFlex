import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, ArrowLeft, Send, User, Clock, Lock, Folder, Loader2, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../../components/RichTextEditor.jsx';

const CourseForum = ({ courseId, currentUser }) => {
    const { t, i18n } = useTranslation();
    const [view, setView] = useState('categories'); // 'categories', 'threads', 'create', 'thread_detail'

    // Data State
    const [categories, setCategories] = useState([]);
    const [threads, setThreads] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [currentThread, setCurrentThread] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // UI State
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

    // Forms
    const [newThread, setNewThread] = useState({ title: '', content: '' });
    const [replyContent, setReplyContent] = useState('');

    // Forms för ny kategori
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [newCategoryTeacherOnly, setNewCategoryTeacherOnly] = useState(false);

    const isTeacher = currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN';

    // Helper för att kolla om Rich Text är "tom"
    const isEditorEmpty = (content) => {
        if (!content) return true;
        const stripped = content.replace(/<[^>]*>/g, '').trim();
        return stripped.length === 0;
    };

    // Ladda kategorier vid start
    useEffect(() => {
        if(courseId) loadCategories();
    }, [courseId]);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const data = await api.forum.getCategories(courseId);
            setCategories(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Fel vid hämtning av kategorier", e);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- NY FUNKTION: Skapa kategori ---
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName) return;

        try {
            // Anropar din nya funktion i api.js
            await api.forum.createCategory(courseId, {
                name: newCategoryName,
                description: newCategoryDesc,
                teacherOnly: newCategoryTeacherOnly
            });

            // Återställ formulär och stäng modal
            setShowCreateCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryDesc('');
            setNewCategoryTeacherOnly(false);

            // Ladda om listan för att visa den nya kategorin
            await loadCategories();
        } catch (e) {
            console.error(e);
            alert("Kunde inte skapa kategori.");
        }
    };

    const handleSelectCategory = async (cat) => {
        setCurrentCategory(cat);
        setIsLoading(true);
        try {
            const data = await api.forum.getThreads(cat.id);
            setThreads(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
            setView('threads');
        } catch (e) {
            console.error("Fel vid hämtning av trådar", e);
            setThreads([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateThread = async (e) => {
        e.preventDefault();
        if (!newThread.title || isEditorEmpty(newThread.content)) {
            alert("Vänligen fyll i både titel och innehåll.");
            return;
        }
        try {
            await api.forum.createThread(currentCategory.id, currentUser.id, newThread.title, newThread.content);
            setNewThread({ title: '', content: '' });
            handleSelectCategory(currentCategory);
        } catch (e) {
            console.error(e);
            alert(t('forum.create_error'));
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (isEditorEmpty(replyContent)) return;
        try {
            const updatedPost = await api.forum.reply(currentThread.id, currentUser.id, replyContent);
            const updatedThread = { ...currentThread, posts: [...(currentThread.posts || []), updatedPost] };
            setCurrentThread(updatedThread);
            setThreads(threads.map(t => t.id === updatedThread.id ? updatedThread : t));
            setReplyContent('');
        } catch (e) {
            console.error(e);
            alert(t('forum.reply_error'));
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString(i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // --- Vyer ---

    if (view === 'categories') {
        return (
            <div className="space-y-6 animate-in fade-in relative">

                {/* --- MODAL FÖR ATT SKAPA KATEGORI --- */}
                {showCreateCategoryModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                                <h3 className="font-bold">Skapa Ny Kategori</h3>
                                <button onClick={() => setShowCreateCategoryModal(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Namn</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required placeholder="T.ex. Allmänt" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Beskrivning</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} placeholder="Vad handlar kategorin om?" />
                                </div>
                                {isTeacher && (
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                        <input type="checkbox" id="teacherOnly" checked={newCategoryTeacherOnly} onChange={e => setNewCategoryTeacherOnly(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                                        <label htmlFor="teacherOnly" className="text-sm text-gray-700 select-none cursor-pointer flex items-center gap-2"><Lock size={14}/> Endast lärare kan starta trådar</label>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setShowCreateCategoryModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Avbryt</button>
                                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-colors">Skapa</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-indigo-600"/> {t('forum.title')}</h3>
                    {/* KNAPP FÖR ATT ÖPPNA MODAL (Endast för lärare/admin) */}
                    {isTeacher && (
                        <button
                            onClick={() => setShowCreateCategoryModal(true)}
                            className="text-xs bg-white text-indigo-600 px-3 py-2 rounded-lg font-bold hover:bg-indigo-50 flex items-center gap-2 border border-indigo-200 shadow-sm transition-colors"
                        >
                            <Plus size={16}/> Ny Kategori
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 flex flex-col items-center">
                        <Folder size={48} className="text-gray-300 mb-2" strokeWidth={1.5}/>
                        <p>Inga kategorier hittades för denna kurs.</p>
                        {isTeacher && <p className="text-xs mt-2 text-indigo-600 cursor-pointer hover:underline" onClick={() => setShowCreateCategoryModal(true)}>Klicka här för att skapa den första.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} onClick={() => handleSelectCategory(cat)} className={`p-6 rounded-xl border transition-all cursor-pointer flex justify-between items-center group ${cat.teacherOnly ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${cat.teacherOnly ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>{cat.teacherOnly ? <Lock size={24}/> : <Folder size={24}/>}</div>
                                    <div><h4 className={`font-bold text-lg ${cat.teacherOnly ? 'text-amber-900' : 'text-gray-900'}`}>{cat.name}</h4><p className="text-sm text-gray-500 mt-1">{cat.description}</p></div>
                                </div>
                                <div className="text-right"><span className="text-2xl font-bold text-gray-700">{cat.threads ? cat.threads.length : 0}</span><p className="text-xs text-gray-400 uppercase font-bold">{t('forum.threads')}</p></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (view === 'threads') {
        const canPost = !currentCategory?.teacherOnly || isTeacher;
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                    <button onClick={() => setView('categories')} className="text-gray-500 hover:text-gray-900 flex items-center gap-2"><ArrowLeft size={18}/> {t('forum.all_categories')}</button>
                    {canPost && (<button onClick={() => setView('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><Plus size={18}/> {t('forum.new_thread')}</button>)}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">{currentCategory?.teacherOnly && <Lock size={16} className="text-amber-500"/>}{currentCategory?.name}</h3>
                    <p className="text-sm text-gray-500">{currentCategory?.description}</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600"/></div>
                ) : threads.length === 0 ? (
                    <div className="text-center p-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">{t('forum.empty_title')} {canPost ? t('forum.empty_student') : t('forum.empty_teacher')}</div>
                ) : (
                    threads.map(thread => (
                        <div key={thread.id} onClick={() => { setCurrentThread(thread); setView('thread_detail'); }} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md cursor-pointer transition-all group">
                            <div className="flex justify-between items-start"><h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{thread.title}</h4><span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold text-gray-500">{thread.posts ? thread.posts.length : 0} {t('forum.replies')}</span></div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500"><div className="flex items-center gap-2"><User size={14}/> {thread.author?.fullName || "Okänd"}</div><div className="flex items-center gap-1"><Clock size={14}/> {formatDate(thread.createdAt)}</div></div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="max-w-2xl mx-auto animate-in fade-in">
                <button onClick={() => setView('threads')} className="mb-4 text-gray-500 hover:text-gray-900 flex items-center gap-2"><ArrowLeft size={18}/> {t('common.cancel')}</button>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-4">{t('forum.create_header', {category: currentCategory?.name})}</h3>
                    <form onSubmit={handleCreateThread} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('forum.subject')}</label>
                            <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})} placeholder={t('forum.subject_placeholder')} required />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('forum.content')}</label>
                            <RichTextEditor
                                value={newThread.content}
                                onChange={(val) => setNewThread({...newThread, content: val})}
                                placeholder={t('forum.content_placeholder')}
                            />
                        </div>

                        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">{t('forum.publish_btn')}</button>
                    </form>
                </div>
            </div>
        );
    }

    if (view === 'thread_detail' && currentThread) {
        return (
            <div className="max-w-3xl mx-auto animate-in fade-in pb-20">
                <button onClick={() => setView('threads')} className="mb-4 text-gray-500 hover:text-gray-900 flex items-center gap-2"><ArrowLeft size={18}/> {t('forum.back_to', {category: currentCategory?.name})}</button>

                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">{currentThread.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-1 font-medium text-gray-700"><div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">{currentThread.author?.fullName?.[0] || "U"}</div>{currentThread.author?.fullName}</div>
                        <span>•</span><div className="flex items-center gap-1"><Clock size={14}/> {formatDate(currentThread.createdAt)}</div>
                    </div>
                    {/* Rendera HTML korrekt */}
                    <div className="prose max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentThread.content }} />
                </div>

                <h3 className="font-bold text-gray-500 uppercase text-sm mb-4">{t('forum.answers_header')} ({currentThread.posts ? currentThread.posts.length : 0})</h3>

                <div className="space-y-6 mb-12">
                    {currentThread.posts && currentThread.posts.map(post => (
                        <div key={post.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 ml-4 md:ml-0 relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-xs shadow-sm">{post.author?.fullName?.[0]}</div><div><span className="font-bold text-sm text-gray-900 block">{post.author?.fullName}</span><span className="text-[10px] text-gray-400 block uppercase">{post.author?.role}</span></div></div>
                                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                            </div>
                            {/* Rendera HTML i svar */}
                            <div className="prose max-w-none text-gray-700 text-sm pl-10" dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 sticky bottom-4 shadow-xl ring-1 ring-black/5 z-10">
                    <form onSubmit={handleReply} className="flex flex-col gap-3">
                        <RichTextEditor
                            value={replyContent}
                            onChange={setReplyContent}
                            placeholder={t('forum.write_reply')}
                            style={{ minHeight: '100px' }}
                        />
                        <div className="flex justify-end">
                            <button disabled={isEditorEmpty(replyContent)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-colors gap-2">
                                <Send size={18}/> {t('forum.publish_btn')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    return null;
};

export default CourseForum;