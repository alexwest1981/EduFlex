import React, { useState, useEffect } from 'react';
import {
    MessageSquare, Plus, ArrowLeft, Send, User, Clock,
    Lock, Folder, Loader2, X, Trash2, Unlock,
    Zap, ShieldAlert
} from 'lucide-react';
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
    const [xpNotification, setXpNotification] = useState(null);

    // Forms
    const [newThread, setNewThread] = useState({ title: '', content: '' });
    const [replyContent, setReplyContent] = useState('');

    // Forms för ny kategori
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [newCategoryTeacherOnly, setNewCategoryTeacherOnly] = useState(false);

    const isTeacher = currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN';

    // --- GAMIFICATION HELPER ---
    const triggerXp = (amount, text) => {
        setXpNotification({ amount, text });
        setTimeout(() => setXpNotification(null), 3000);
    };

    const isEditorEmpty = (content) => {
        if (!content) return true;
        const stripped = content.replace(/<[^>]*>/g, '').trim();
        return stripped.length === 0;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString(i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // --- DATA LOADING ---
    useEffect(() => {
        if(courseId) loadCategories();
    }, [courseId]);

    // FIX: Hämtar nu även antalet trådar för varje kategori
    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const cats = await api.forum.getCategories(courseId);

            if (Array.isArray(cats)) {
                // Vi måste hämta trådarna (eller count) för varje kategori för att siffran ska stämma
                const catsWithCounts = await Promise.all(cats.map(async (cat) => {
                    try {
                        const catThreads = await api.forum.getThreads(cat.id);
                        return {
                            ...cat,
                            threadCount: Array.isArray(catThreads) ? catThreads.length : 0
                        };
                    } catch {
                        return { ...cat, threadCount: 0 };
                    }
                }));
                setCategories(catsWithCounts);
            } else {
                setCategories([]);
            }
        } catch (e) {
            console.error("Fel vid hämtning av kategorier", e);
            setCategories([]);
        } finally {
            setIsLoading(false);
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

    // --- ACTIONS ---
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName) return;
        try {
            await api.forum.createCategory(courseId, {
                name: newCategoryName,
                description: newCategoryDesc,
                teacherOnly: newCategoryTeacherOnly
            });
            setShowCreateCategoryModal(false);
            setNewCategoryName(''); setNewCategoryDesc(''); setNewCategoryTeacherOnly(false);
            await loadCategories();
            triggerXp(50, "Kategori skapad!");
        } catch (e) { alert("Kunde inte skapa kategori."); }
    };

    const handleCreateThread = async (e) => {
        e.preventDefault();
        if (!newThread.title || isEditorEmpty(newThread.content)) return alert("Fyll i allt.");
        try {
            await api.forum.createThread(currentCategory.id, currentUser.id, newThread.title, newThread.content);
            setNewThread({ title: '', content: '' });
            handleSelectCategory(currentCategory);
            triggerXp(20, "Tråd skapad!");
        } catch (e) { alert(t('forum.create_error')); }
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
            triggerXp(10, "Svar postat!");
        } catch (e) { alert(t('forum.reply_error')); }
    };

    const handleDeleteThread = async (threadId, e) => {
        e.stopPropagation();
        if(!window.confirm("Är du säker på att du vill ta bort denna tråd?")) return;
        try {
            await api.forum.deleteThread(threadId);
            setThreads(threads.filter(t => t.id !== threadId));
            // Uppdatera även kategorilistan i bakgrunden så count stämmer nästa gång
            loadCategories();
        } catch (e) { alert("Kunde inte ta bort tråd."); }
    };

    const handleToggleLock = async (thread, e) => {
        e.stopPropagation();
        try {
            const newStatus = !thread.locked;
            await api.forum.toggleLockThread(thread.id, newStatus);
            const updated = { ...thread, locked: newStatus };
            setThreads(threads.map(t => t.id === thread.id ? updated : t));
            if(currentThread?.id === thread.id) setCurrentThread(updated);
        } catch (e) { alert("Kunde inte ändra status."); }
    };

    const handleDeletePost = async (postId) => {
        if(!window.confirm("Ta bort detta inlägg?")) return;
        try {
            await api.forum.deletePost(postId);
            const updatedPosts = currentThread.posts.filter(p => p.id !== postId);
            setCurrentThread({ ...currentThread, posts: updatedPosts });
        } catch (e) { alert("Kunde inte ta bort inlägg."); }
    };

    // --- RENDERERS ---
    const renderXpToast = () => {
        if (!xpNotification) return null;
        return (
            <div className="fixed top-20 right-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-right z-50">
                <div className="bg-white/20 p-1 rounded-full"><Zap size={20} fill="white"/></div>
                <div><span className="font-black text-lg">+{xpNotification.amount} XP</span><p className="text-xs font-medium opacity-90">{xpNotification.text}</p></div>
            </div>
        );
    };

    if (view === 'categories') {
        return (
            <div className="space-y-6 animate-in fade-in relative">
                {renderXpToast()}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div><h3 className="text-2xl font-bold text-gray-900">Forum</h3><p className="text-gray-500 text-sm">Diskutera, fråga och lär dig tillsammans.</p></div>
                    {isTeacher && (
                        <button onClick={() => setShowCreateCategoryModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg hover:shadow-indigo-200 transition-all"><Plus size={18}/> Ny Kategori</button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500"><Folder size={48} className="mx-auto text-gray-300 mb-2"/><p>Inga kategorier än.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} onClick={() => handleSelectCategory(cat)} className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group h-40 relative overflow-hidden ${cat.teacherOnly ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400' : 'bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md'}`}>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-3 rounded-xl w-fit ${cat.teacherOnly ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'}`}>{cat.teacherOnly ? <Lock size={20}/> : <MessageSquare size={20}/>}</div>

                                        {/* FIX: Visar nu threadCount som vi beräknade i loadCategories */}
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-gray-300 group-hover:text-indigo-200 transition-colors">
                                                {cat.threadCount !== undefined ? cat.threadCount : (cat.threads ? cat.threads.length : 0)}
                                            </span>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase">Trådar</p>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-900">{cat.name}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-1">{cat.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showCreateCategoryModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                            <div className="bg-gray-50 p-4 border-b flex justify-between items-center"><h3 className="font-bold text-gray-900">Skapa Kategori</h3><button onClick={() => setShowCreateCategoryModal(false)}><X size={20} className="text-gray-500"/></button></div>
                            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                                <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required placeholder="Kategorinamn" />
                                <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500" value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} placeholder="Beskrivning" />
                                {isTeacher && (<label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"><input type="checkbox" checked={newCategoryTeacherOnly} onChange={e => setNewCategoryTeacherOnly(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><Lock size={14}/> Lås för studenter (Endast läs)</label>)}
                                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Skapa</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (view === 'threads') {
        const canPost = !currentCategory?.teacherOnly || isTeacher;
        return (
            <div className="space-y-6 animate-in fade-in">
                {renderXpToast()}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-10">
                    <button onClick={() => { setView('categories'); loadCategories(); }} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"><ArrowLeft size={18}/> Tillbaka</button>
                    <div className="text-center hidden md:block"><h3 className="font-bold text-gray-900">{currentCategory?.name}</h3><p className="text-xs text-gray-500">{threads.length} trådar</p></div>
                    {canPost ? (<button onClick={() => setView('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm"><Plus size={18}/> <span className="hidden sm:inline">Ny Tråd</span></button>) : <div className="w-24"></div>}
                </div>

                {isLoading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600"/></div> : threads.length === 0 ? (
                    <div className="text-center p-12 text-gray-400 bg-white border border-gray-200 rounded-2xl shadow-sm"><p>Inga trådar här än. Bli den första att skriva!</p></div>
                ) : (
                    <div className="space-y-3">
                        {threads.map(thread => (
                            <div key={thread.id} onClick={() => { setCurrentThread(thread); setView('thread_detail'); }} className={`bg-white p-5 rounded-xl border hover:shadow-md cursor-pointer transition-all group relative flex gap-4 ${thread.locked ? 'border-red-100 bg-red-50/30' : 'border-gray-200 hover:border-indigo-300'}`}>
                                <div className="flex-shrink-0"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${thread.author?.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{thread.author?.fullName?.[0] || <User size={16}/>}</div></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors truncate flex items-center gap-2">{thread.locked && <Lock size={16} className="text-red-500" title="Låst"/>}{thread.title}</h4>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-bold text-gray-500 flex-shrink-0 flex items-center gap-1"><MessageSquare size={12}/> {thread.posts ? thread.posts.length : 0}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500"><span className="font-medium">{thread.author?.fullName}</span><span>•</span><span>{formatDate(thread.createdAt)}</span>{thread.author?.role === 'TEACHER' && <span className="bg-indigo-50 text-indigo-700 px-1.5 rounded border border-indigo-100 text-[10px] font-bold">LÄRARE</span>}</div>
                                </div>
                                {isTeacher && (
                                    <div className="absolute top-4 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleToggleLock(thread, e)} className="p-2 bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-700 rounded-lg">{thread.locked ? <Unlock size={14}/> : <Lock size={14}/>}</button>
                                        <button onClick={(e) => handleDeleteThread(thread.id, e)} className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg"><Trash2 size={14}/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="max-w-3xl mx-auto animate-in fade-in">
                <button onClick={() => setView('threads')} className="mb-4 text-gray-500 hover:text-gray-900 flex items-center gap-2"><ArrowLeft size={18}/> Avbryt</button>
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Starta ny diskussion</h3>
                    <form onSubmit={handleCreateThread} className="space-y-6">
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Rubrik</label><input className="w-full border p-4 rounded-xl text-lg font-medium focus:ring-2 focus:ring-indigo-500 outline-none" value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})} placeholder="Vad vill du diskutera?" required /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Innehåll</label><div className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500"><RichTextEditor value={newThread.content} onChange={(val) => setNewThread({...newThread, content: val})} placeholder="Skriv ditt inlägg här..." style={{ minHeight: '200px' }} /></div></div>
                        <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all flex justify-center items-center gap-2"><Send size={20}/> Publicera Tråd</button>
                    </form>
                </div>
            </div>
        );
    }

    if (view === 'thread_detail' && currentThread) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in pb-40">
                {renderXpToast()}
                <button onClick={() => setView('threads')} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg w-fit transition-colors"><ArrowLeft size={18}/> Tillbaka till {currentCategory?.name}</button>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex justify-between items-start">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{currentThread.title}</h1>
                            {isTeacher && (<div className="flex gap-2"><button onClick={(e) => handleToggleLock(currentThread, e)} className={`p-2 rounded-lg ${currentThread.locked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{currentThread.locked ? <Lock size={18}/> : <Unlock size={18}/>}</button><button onClick={(e) => handleDeleteThread(currentThread.id, e)} className="p-2 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg"><Trash2 size={18}/></button></div>)}
                        </div>
                        <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${currentThread.author?.role === 'TEACHER' ? 'bg-indigo-600' : 'bg-gray-400'}`}>{currentThread.author?.fullName?.[0]}</div><div><p className="text-sm font-bold text-gray-900 flex items-center gap-2">{currentThread.author?.fullName}{currentThread.author?.role === 'TEACHER' && <ShieldAlert size={14} className="text-indigo-600"/>}</p><p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {formatDate(currentThread.createdAt)}</p></div></div>
                    </div>
                    <div className="p-6 md:p-8 prose max-w-none text-gray-800 leading-relaxed bg-white min-h-[150px]" dangerouslySetInnerHTML={{ __html: currentThread.content }} />
                </div>

                <div className="flex items-center gap-4 mb-6"><div className="h-px bg-gray-200 flex-1"></div><span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{currentThread.posts ? currentThread.posts.length : 0} Svar</span><div className="h-px bg-gray-200 flex-1"></div></div>

                <div className="space-y-6">
                    {currentThread.posts && currentThread.posts.map(post => (
                        <div key={post.id} className={`group relative p-6 rounded-2xl border transition-all ${post.author?.role === 'TEACHER' ? 'bg-indigo-50/30 border-indigo-100 ml-4 md:ml-8' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${post.author?.role === 'TEACHER' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{post.author?.fullName?.[0]}</div>
                                    <div><div className="flex items-center gap-2"><span className="font-bold text-sm text-gray-900">{post.author?.fullName}</span>{post.author?.role === 'TEACHER' && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 rounded font-bold border border-indigo-200">LÄRARE</span>}</div><span className="text-xs text-gray-400 block">{formatDate(post.createdAt)}</span></div>
                                </div>
                                {(isTeacher || post.author?.id === currentUser.id) && (<button onClick={() => handleDeletePost(post.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>)}
                            </div>
                            <div className="prose max-w-none text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>
                    ))}
                </div>

                {!currentThread.locked ? (
                    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                        <div className="max-w-4xl mx-auto flex gap-4">
                            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all"><RichTextEditor value={replyContent} onChange={setReplyContent} placeholder={t('forum.write_reply')} style={{ minHeight: '60px', maxHeight: '150px', background: 'transparent', border: 'none' }} /></div>
                            <button onClick={handleReply} disabled={isEditorEmpty(replyContent)} className="bg-indigo-600 disabled:bg-gray-300 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-lg disabled:shadow-none h-auto"><Send size={20}/></button>
                        </div>
                    </div>
                ) : (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-6 py-3 rounded-full border border-red-200 font-bold shadow-lg flex items-center gap-2"><Lock size={18}/> Denna tråd har låsts av en lärare.</div>
                )}
            </div>
        );
    }
    return null;
};

export default CourseForum;