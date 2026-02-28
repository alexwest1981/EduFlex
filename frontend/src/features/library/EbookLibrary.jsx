import React, { useState, useEffect, useMemo } from 'react';
import {
    Book, Upload, Search, Trash2, X, Filter,
    Settings, Sparkles as SparklesIcon, Volume2, Music, RefreshCw,
    LayoutGrid, List, BookOpen, Headphones, Tag, SortAsc
} from 'lucide-react';
import EpubViewer from '../../components/common/EpubViewer';
import PdfViewer from '../../components/common/PdfViewer';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Defined OUTSIDE the component so it never gets recreated on re-render
const ModalShell = ({ title, icon: Icon, onClose, children }) => (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1b1d] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-[#2a2b2d] max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2a2b2d] flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon size={18} className="text-indigo-500" />
                    {title}
                </h2>
                <button
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
            {children}
        </div>
    </div>
);

const isAdmin = (user) =>
    user?.role?.name === 'ROLE_TEACHER' ||
    user?.role?.name === 'ROLE_ADMIN' ||
    user?.role === 'TEACHER' ||
    user?.role === 'ADMIN' ||
    user?.username === 'admin';

const EbookLibrary = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const { currentUser, setActiveAudiobook } = useAppContext();
    const { t } = useTranslation();
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Alla');
    const [sortBy, setSortBy] = useState('title');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [files, setFiles] = useState({ epub: null, cover: null });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadData, setUploadData] = useState({
        title: '', author: '', category: '', language: 'Svenska', description: '', isbn: ''
    });
    const [savedBookIds, setSavedBookIds] = useState([]);
    const [ttsLoading, setTtsLoading] = useState(false);
    const [gridSize, setGridSize] = useState('medium');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const availableCategories = useMemo(() => {
        const cats = [...new Set(ebooks.map(b => b.category).filter(Boolean))].sort();
        return ['Alla', ...cats];
    }, [ebooks]);

    const newsBooks = useMemo(() => {
        return [...ebooks]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 10);
    }, [ebooks]);

    const gridColsClass = useMemo(() => {
        if (gridSize === 'small') return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7';
        if (gridSize === 'large') return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    }, [gridSize]);

    const audiobookCount = useMemo(() => ebooks.filter(b => b.type === 'AUDIO').length, [ebooks]);
    const categoryCount = useMemo(() => availableCategories.length - 1, [availableCategories]);

    const filteredBooks = useMemo(() => {
        let result = ebooks.filter(book => {
            let matchesCat = true;
            if (categoryFilter === 'Alla') matchesCat = true;
            else if (categoryFilter === 'Sparade') matchesCat = savedBookIds.includes(book.id);
            else if (categoryFilter === 'Ljudböcker') matchesCat = book.type === 'AUDIO';
            else matchesCat = book.category === categoryFilter;

            const q = searchTerm.toLowerCase();
            const matchesSearch = book.title?.toLowerCase().includes(q) || book.author?.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });
        if (sortBy === 'title') result.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'sv'));
        else if (sortBy === 'author') result.sort((a, b) => (a.author || '').localeCompare(b.author || '', 'sv'));
        else if (sortBy === 'type') result.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
        return result;
    }, [ebooks, categoryFilter, searchTerm, sortBy]);

    const paginatedBooks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredBooks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredBooks, currentPage]);

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

    const fetchEbooks = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
            const [ebRes, savedRes] = await Promise.all([
                fetch('/api/ebooks', { headers }),
                fetch('/api/ebooks/saved-ids', { headers })
            ]);

            if (ebRes.ok) setEbooks(await ebRes.json());
            if (savedRes.ok) setSavedBookIds(await savedRes.json());
        } catch {
            toast.error(t('messages.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) setCourses(await response.json());
        } catch { /* silent */ }
    };

    useEffect(() => { fetchEbooks(); fetchCourses(); }, []);

    const handleFetchIsbn = async () => {
        if (!uploadData.isbn) return toast.error('Ange ett ISBN-nummer');
        const id = toast.loading('Hämtar bokinformation...');
        try {
            const res = await fetch(`/api/ebooks/metadata/fetch?isbn=${uploadData.isbn}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUploadData(prev => ({ ...prev, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v)) }));
                toast.success('Information hämtad!', { id });
            } else {
                toast.error('Kunde inte hitta boken via ISBN', { id });
            }
        } catch {
            toast.error('Fel vid hämtning av metadata', { id });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!files.epub) return toast.error(t('library.select_file_alert') || 'Välj en fil');
        const formData = new FormData();
        // Always send required fields even if empty string — backend has no required=false on them
        formData.append('title', uploadData.title);
        formData.append('author', uploadData.author || '');
        // Limit description length for UI stability, though DB now supports TEXT
        const cleanDescription = (uploadData.description || '').substring(0, 30000);
        formData.append('description', cleanDescription);
        formData.append('category', uploadData.category || '');
        formData.append('language', uploadData.language || 'Svenska');
        if (uploadData.isbn) formData.append('isbn', uploadData.isbn);
        formData.append('file', files.epub);
        if (files.cover) formData.append('cover', files.cover);

        // Append course IDs individually so Spring's List<Long> can parse them correctly
        if (selectedCourses.length > 0) {
            selectedCourses.forEach(id => formData.append('courseIds', id));
        }

        try {
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/ebooks/upload');
                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                xhr.upload.onprogress = (ev) => {
                    if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                };
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject();
                xhr.onerror = reject;
                xhr.send(formData);
            });
            toast.success(t('messages.upload_success'));
            setIsUploadModalOpen(false);
            setUploadProgress(0);
            setUploadData({ title: '', author: '', category: '', language: 'Svenska', description: '', isbn: '' });
            setFiles({ epub: null, cover: null });
            setSelectedCourses([]);
            fetchEbooks();
        } catch {
            toast.error(t('messages.upload_error'));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/ebooks/${selectedBook.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...uploadData, courseIds: selectedCourses })
            });
            if (res.ok) {
                toast.success(t('messages.setting_saved'));
                setIsEditModalOpen(false);
                setSelectedBook(null);
                setSelectedCourses([]);
                fetchEbooks();
            } else throw new Error();
        } catch {
            toast.error('Kunde inte spara ändringar');
        }
    };

    const toggleSaveBook = async (e, bookId) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/ebooks/${bookId}/toggle-saved`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const { saved } = await res.json();
                setSavedBookIds(prev => saved ? [...prev, bookId] : prev.filter(id => id !== bookId));
                toast.success(saved ? 'Boken har sparats' : 'Boken har tagits bort från sparade');
            }
        } catch {
            toast.error('Kunde inte ändra spara-status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('common.confirm_delete') || 'Är du säker?')) return;
        try {
            const res = await fetch(`/api/ebooks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) { toast.success(t('messages.delete_success') || 'Boken har tagits bort'); fetchEbooks(); }
            else throw new Error();
        } catch {
            toast.error(t('messages.delete_error') || 'Kunde inte ta bort boken');
        }
    };

    const handleIndexForAI = async (id) => {
        if (!confirm('Vill du indexera den här boken för din AI Study Pal?')) return;
        const loadId = toast.loading('Indexerar boken för AI Study Pal...');
        try {
            const res = await fetch(`/api/ai-tutor/ingest-ebook/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) toast.success('Boken har indexerats! Din AI Study Pal är nu smartare.', { id: loadId });
            else toast.error('Kunde inte indexera: ' + await res.text(), { id: loadId });
        } catch {
            toast.error('Ett fel inträffade vid indexering.', { id: loadId });
        }
    };

    const handleListenWithAI = async (book) => {
        setTtsLoading(true);
        const loadId = toast.loading('Förbereder AI-uppläsning...');
        try {
            const text = book.description || `Uppläsning av boken ${book.title}.`;
            const res = await fetch(`/api/ebooks/${book.id}/tts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                const audioUrl = URL.createObjectURL(await res.blob());
                setActiveAudiobook({ ...book, fileUrl: audioUrl, type: 'AUDIO' });
                toast.success('AI-rösten är redo!', { id: loadId });
            } else {
                toast.error('Kunde inte generera AI-röst.', { id: loadId });
            }
        } catch {
            toast.error('Ett fel inträffade vid AI-uppläsning.', { id: loadId });
        } finally {
            setTtsLoading(false);
        }
    };

    const handleRegenerateAudio = async (book) => {
        const loadId = toast.loading('Genererar ljudbok till servern...');
        try {
            const res = await fetch(`/api/ebooks/${book.id}/regenerate-audio`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const updated = await res.json();
                toast.success('Ljudboken har återskapats och sparats!', { id: loadId });
                fetchEbooks();
                if (selectedBook?.id === book.id) setSelectedBook(updated);
            } else {
                const err = await res.json();
                toast.error('Misslyckades: ' + (err.message || 'Okänt fel'), { id: loadId });
            }
        } catch {
            toast.error('Tekniskt fel vid återskapande.', { id: loadId });
        }
    };

    const toggleCourse = (id) =>
        setSelectedCourses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

    const openBook = (book) => {
        if (book.type === 'AUDIO') setActiveAudiobook(book);
        else setSelectedBook(book);
    };

    // Shared input style
    const inputCls = "w-full bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow";
    const labelCls = "block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5";

    // Shared course selector JSX (rendered inline, not as a sub-component)
    const renderCourseSelector = () => (
        <div>
            <label className={labelCls}>Koppla till kurser (för AI)</label>
            <div className="bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl p-3 max-h-28 overflow-y-auto custom-scrollbar">
                {courses.length === 0
                    ? <p className="text-xs text-gray-400">Inga kurser hittades.</p>
                    : courses.map(course => (
                        <label key={course.id} className="flex items-center gap-2 py-1 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCourses.includes(course.id)}
                                onChange={() => toggleCourse(course.id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                {course.name} <span className="text-gray-400">({course.courseCode})</span>
                            </span>
                        </label>
                    ))
                }
            </div>
            <p className="text-[10px] text-gray-400 mt-1">AI:n kan svara på frågor om boken i valda kurser.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] pb-24 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">

            {/* ─── HERO ─── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/3 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2" />
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl -translate-y-1/3" />
                </div>
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '28px 28px' }}
                />
                <div className="relative max-w-7xl mx-auto px-8 pt-10 pb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/15 border border-violet-500/25 rounded-full text-violet-300 text-xs font-semibold tracking-wider uppercase mb-5">
                        Digitalt Bibliotek
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                        Ditt{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                            bibliotek
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-lg mb-8">
                        E-böcker, PDF:er och ljudböcker — allt på ett ställe, redo att läsa eller lyssna på.
                    </p>

                    <div className="flex flex-wrap gap-8 mb-8">
                        {[
                            { label: 'Böcker totalt', value: ebooks.length },
                            { label: 'Kategorier', value: categoryCount },
                            { label: 'Ljudböcker', value: audiobookCount },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tabular-nums">
                                    {loading ? '–' : stat.value}
                                </span>
                                <span className="text-slate-400 text-sm">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 items-center max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                            <input
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:bg-white/15 transition-all text-sm font-medium"
                                placeholder={t('library.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {isAdmin(currentUser) && (
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-colors shadow-lg shadow-indigo-900/40 shrink-0"
                            >
                                <Upload size={16} />
                                {t('library.upload_btn')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── MAIN ─── */}
            <div className="max-w-7xl mx-auto px-8 py-7">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{filteredBooks.length}</span>
                        {' '}böcker
                        {categoryFilter !== 'Alla' && (
                            <span className="ml-1 text-indigo-600 dark:text-indigo-400">· {categoryFilter}</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        {/* Grid Size Selector */}
                        <div className="flex bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-xl overflow-hidden mr-2">
                            {[
                                { id: 'small', icon: <LayoutGrid size={12} />, label: 'S' },
                                { id: 'medium', icon: <LayoutGrid size={14} />, label: 'M' },
                                { id: 'large', icon: <LayoutGrid size={16} />, label: 'L' }
                            ].map(size => (
                                <button
                                    key={size.id}
                                    onClick={() => setGridSize(size.id)}
                                    className={`px-2.5 py-1.5 transition-colors text-xs font-bold flex items-center gap-1.5 ${gridSize === size.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    title={`Ikonstorlek: ${size.id}`}
                                >
                                    {size.icon}
                                    <span>{size.label}</span>
                                </button>
                            ))}
                        </div>

                        <label className="flex items-center gap-2 bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-xl px-3 py-2 cursor-pointer">
                            <SortAsc size={13} className="text-gray-400 shrink-0" />
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="text-xs text-gray-600 dark:text-gray-300 bg-transparent outline-none cursor-pointer"
                            >
                                <option value="title">Titel A–Ö</option>
                                <option value="author">Författare</option>
                                <option value="type">Typ</option>
                            </select>
                        </label>
                        <div className="flex bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                <LayoutGrid size={15} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                <List size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-7">
                    {/* ─── NEWS SECTION (Top) ─── */}
                    {newsBooks.length > 0 && categoryFilter === 'Alla' && !searchTerm && (
                        <div className="lg:col-span-4 mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <SparklesIcon size={16} className="text-amber-500" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Senaste Nyheterna</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-[#2a2b2d]" />
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 px-1 custom-scrollbar scroll-smooth">
                                {newsBooks.map(book => (
                                    <div
                                        key={`news-${book.id}`}
                                        className="relative shrink-0 w-24 group cursor-pointer"
                                        onClick={() => openBook(book)}
                                    >
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-gray-100 dark:border-[#2a2b2d] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/20 group-hover:z-10 group-hover:-translate-y-1">
                                            <img
                                                src={`/api/ebooks/${book.id}/cover`}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x150/1e1b4b/818cf8?text=📚`; }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                <p className="text-[8px] leading-tight font-bold text-white truncate">{book.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── SIDEBAR ─── */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden sticky top-6 shadow-sm">
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2a2b2d] flex items-center gap-2">
                                <Filter size={14} className="text-violet-500" />
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Kategorier</h3>
                            </div>
                            <div className="p-3 max-h-[72vh] overflow-y-auto custom-scrollbar">
                                <button
                                    onClick={() => setCategoryFilter('Alla')}
                                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 mb-0.5 ${categoryFilter === 'Alla'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232426]'
                                        }`}
                                >
                                    <BookOpen size={14} className="shrink-0" />
                                    <span>Alla böcker</span>
                                </button>
                                <button
                                    onClick={() => setCategoryFilter('Sparade')}
                                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 mb-0.5 ${categoryFilter === 'Sparade'
                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232426]'
                                        }`}
                                >
                                    <SparklesIcon size={14} className="shrink-0 text-pink-400" />
                                    <span>Sparade böcker</span>
                                </button>
                                <button
                                    onClick={() => setCategoryFilter('Ljudböcker')}
                                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 mb-2 ${categoryFilter === 'Ljudböcker'
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232426]'
                                        }`}
                                >
                                    <Headphones size={14} className="shrink-0 text-violet-400" />
                                    <span>Ljudböcker</span>
                                </button>

                                <div className="px-3.5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 dark:border-[#2a2b2d] mt-2 mb-1">
                                    Andra kategorier
                                </div>

                                {availableCategories.filter(c => c !== 'Alla').map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 mb-0.5 ${categoryFilter === cat
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232426]'
                                            }`}
                                    >
                                        <Tag size={14} className="shrink-0" />
                                        <span className="truncate">{cat}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ─── BOOKS ─── */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-5' : 'flex flex-col gap-3'}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-[#1a1b1d] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2a2b2d] animate-pulse">
                                        <div className={`bg-gradient-to-b from-gray-200 to-gray-100 dark:from-[#252628] dark:to-[#222] ${viewMode === 'grid' ? 'aspect-[2/3]' : 'h-20'}`} />
                                        {viewMode === 'grid' && (
                                            <div className="p-4 space-y-2">
                                                <div className="h-3.5 bg-gray-200 dark:bg-[#252628] rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 dark:bg-[#222] rounded w-1/2" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : ebooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-3xl flex items-center justify-center mb-5">
                                    <BookOpen size={28} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-bold text-lg mb-1">{t('library.no_books')}</p>
                                <p className="text-gray-400 text-sm mb-5">{t('library.no_books_desc')}</p>
                                {isAdmin(currentUser) && (
                                    <button
                                        onClick={() => setIsUploadModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                                    >
                                        <Upload size={15} /> Ladda upp din första bok
                                    </button>
                                )}
                            </div>
                        ) : filteredBooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-2xl flex items-center justify-center mb-4">
                                    <Search size={22} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">Inga böcker hittades</p>
                                <p className="text-gray-400 text-sm mb-4">Prova en annan sökterm eller kategori</p>
                                {categoryFilter !== 'Alla' && (
                                    <button onClick={() => setCategoryFilter('Alla')} className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">
                                        Visa alla böcker
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            <>
                                <div className={`grid ${gridColsClass} gap-5`}>
                                    {paginatedBooks.map(book => (
                                        <div key={book.id} className="group bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                                            <div className="relative overflow-hidden cursor-pointer aspect-[2/3]" onClick={() => openBook(book)}>
                                                <img
                                                    src={`/api/ebooks/${book.id}/cover`}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x450/1e1b4b/818cf8?text=${encodeURIComponent(book.title?.slice(0, 20) || 'Bok')}`; }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl">
                                                        {book.type === 'AUDIO' ? <Headphones size={22} className="text-indigo-600" /> : <BookOpen size={22} className="text-indigo-600" />}
                                                    </div>
                                                </div>
                                                {book.category && (
                                                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg max-w-[70%] truncate">{book.category}</span>
                                                )}
                                                <button
                                                    onClick={(e) => toggleSaveBook(e, book.id)}
                                                    className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-md transition-all ${savedBookIds.includes(book.id)
                                                        ? 'bg-pink-500 text-white'
                                                        : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
                                                        }`}
                                                >
                                                    <SparklesIcon size={14} fill={savedBookIds.includes(book.id) ? "currentColor" : "none"} />
                                                </button>
                                                {book.type === 'AUDIO' && (
                                                    <div className="absolute top-2 left-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                        <Music size={9} /> AUDIO
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 mb-0.5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => openBook(book)}>
                                                    {book.title}
                                                </h3>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 truncate">{book.author}</p>
                                                {isAdmin(currentUser) && (
                                                    <div className="mt-auto flex items-center justify-end gap-0.5 pt-2 border-t border-gray-100 dark:border-[#2a2b2d]">
                                                        {book.type === 'AUDIO' && (
                                                            <button onClick={() => handleRegenerateAudio(book)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Återskapa ljudfil"><RefreshCw size={14} /></button>
                                                        )}
                                                        <button onClick={() => handleListenWithAI(book)} className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors" title="Lyssna med AI"><Volume2 size={14} /></button>
                                                        <button onClick={() => handleIndexForAI(book.id)} className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors" title="Indexera för AI"><SparklesIcon size={14} /></button>
                                                        <button onClick={() => { setUploadData({ ...book, description: book.description || '' }); setSelectedCourses(book.courses?.map(c => c.id) || []); setSelectedBook(book); setIsEditModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Redigera"><Settings size={14} /></button>
                                                        <button onClick={() => handleDelete(book.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Ta bort"><Trash2 size={14} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-10 flex items-center justify-center gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="p-2 rounded-xl border border-gray-200 dark:border-[#2a2b2d] bg-white dark:bg-[#1a1b1d] text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#252628] transition-colors"
                                        >
                                            <Search size={14} className="rotate-180" />
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252628]'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="p-2 rounded-xl border border-gray-200 dark:border-[#2a2b2d] bg-white dark:bg-[#1a1b1d] text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#252628] transition-colors"
                                        >
                                            <Search size={14} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {paginatedBooks.map(book => (
                                    <div key={book.id} className="group bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200 flex items-center">
                                        <div className="w-14 h-20 shrink-0 overflow-hidden cursor-pointer" onClick={() => openBook(book)}>
                                            <img
                                                src={`/api/ebooks/${book.id}/cover`}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/120x180/1e1b4b/818cf8?text=📚`; }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 px-4 py-3 flex-1 min-w-0 flex-wrap md:flex-nowrap">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    {book.type === 'AUDIO' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1.5 py-0.5 rounded-md"><Music size={9} /> AUDIO</span>
                                                    )}
                                                    {book.category && (
                                                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#252628] px-1.5 py-0.5 rounded-md">{book.category}</span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => openBook(book)}>{book.title}</h3>
                                                <p className="text-xs text-gray-400 truncate">{book.author}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={(e) => toggleSaveBook(e, book.id)}
                                                    className={`p-2 rounded-xl transition-all ${savedBookIds.includes(book.id) ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20'}`}
                                                >
                                                    <SparklesIcon size={15} fill={savedBookIds.includes(book.id) ? "currentColor" : "none"} />
                                                </button>
                                                <button onClick={() => openBook(book)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 mr-1">
                                                    {book.type === 'AUDIO' ? <Headphones size={12} /> : <BookOpen size={12} />}
                                                    {book.type === 'AUDIO' ? 'Lyssna' : 'Läs'}
                                                </button>
                                                {isAdmin(currentUser) && (
                                                    <>
                                                        {book.type === 'AUDIO' && <button onClick={() => handleRegenerateAudio(book)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Återskapa"><RefreshCw size={14} /></button>}
                                                        <button onClick={() => handleListenWithAI(book)} className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors" title="AI-röst"><Volume2 size={14} /></button>
                                                        <button onClick={() => handleIndexForAI(book.id)} className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors" title="Indexera AI"><SparklesIcon size={14} /></button>
                                                        <button onClick={() => { setUploadData({ ...book, description: book.description || '' }); setSelectedCourses(book.courses?.map(c => c.id) || []); setSelectedBook(book); setIsEditModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Redigera"><Settings size={14} /></button>
                                                        <button onClick={() => handleDelete(book.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Ta bort"><Trash2 size={14} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── UPLOAD MODAL ─── */}
            {isUploadModalOpen && (
                <ModalShell
                    title={t('library.upload_modal_title')}
                    icon={Upload}
                    onClose={() => { setIsUploadModalOpen(false); setUploadProgress(0); }}
                >
                    <form onSubmit={handleUpload} className="p-6 space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className={labelCls}>ISBN (valfritt)</label>
                                <input type="text" placeholder="978-..." className={inputCls} value={uploadData.isbn || ''} onChange={(e) => setUploadData(prev => ({ ...prev, isbn: e.target.value }))} />
                            </div>
                            <button type="button" onClick={handleFetchIsbn} className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800/30">Hämta</button>
                        </div>
                        <div>
                            <label className={labelCls}>{t('library.title_label')} *</label>
                            <input type="text" required className={inputCls} value={uploadData.title} onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>{t('library.author_label')}</label>
                                <input type="text" className={inputCls} value={uploadData.author} onChange={(e) => setUploadData(prev => ({ ...prev, author: e.target.value }))} />
                            </div>
                            <div>
                                <label className={labelCls}>{t('library.category_label')}</label>
                                <input type="text" list="upload-cat-suggestions" className={inputCls} value={uploadData.category} onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))} />
                                <datalist id="upload-cat-suggestions">
                                    {availableCategories.filter(c => c !== 'Alla').map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>
                        {renderCourseSelector()}
                        <div>
                            <label className={labelCls}>{t('library.description_label')}</label>
                            <textarea className={`${inputCls} h-20 resize-none`} value={uploadData.description} onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>{t('library.epub_file_label')} *</label>
                                <input type="file" accept=".epub,.pdf,.mp3,.m4b" required onChange={(e) => setFiles(prev => ({ ...prev, epub: e.target.files[0] }))} className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100" />
                            </div>
                            <div>
                                <label className={labelCls}>{t('library.cover_image_label')} ({t('common.optional')})</label>
                                <input type="file" accept="image/*" onChange={(e) => setFiles(prev => ({ ...prev, cover: e.target.files[0] }))} className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100" />
                            </div>
                        </div>
                        {uploadProgress > 0 && (
                            <div>
                                <div className="w-full bg-gray-200 dark:bg-[#252628] rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                                <p className="text-xs text-gray-400 text-center mt-1">{uploadProgress}%</p>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setIsUploadModalOpen(false); setUploadProgress(0); }} className="flex-1 py-2.5 bg-gray-100 dark:bg-[#252628] text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors">{t('common.cancel')}</button>
                            <button type="submit" disabled={uploadProgress > 0 && uploadProgress < 100} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed">
                                {uploadProgress > 0 && uploadProgress < 100 ? `${t('common.uploading')}...` : t('library.upload_btn')}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* ─── EDIT MODAL ─── */}
            {isEditModalOpen && (
                <ModalShell
                    title={t('library.edit_modal_title')}
                    icon={Settings}
                    onClose={() => { setIsEditModalOpen(false); setSelectedBook(null); }}
                >
                    <form onSubmit={handleUpdate} className="p-6 space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className={labelCls}>ISBN</label>
                                <input type="text" placeholder="978-..." className={inputCls} value={uploadData.isbn || ''} onChange={(e) => setUploadData(prev => ({ ...prev, isbn: e.target.value }))} />
                            </div>
                            <button type="button" onClick={handleFetchIsbn} className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800/30">Hämta</button>
                        </div>
                        <div>
                            <label className={labelCls}>{t('library.title_label')} *</label>
                            <input type="text" required className={inputCls} value={uploadData.title} onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>{t('library.author_label')}</label>
                                <input type="text" className={inputCls} value={uploadData.author} onChange={(e) => setUploadData(prev => ({ ...prev, author: e.target.value }))} />
                            </div>
                            <div>
                                <label className={labelCls}>{t('library.category_label')}</label>
                                <input type="text" list="edit-cat-suggestions" className={inputCls} value={uploadData.category} onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))} />
                                <datalist id="edit-cat-suggestions">
                                    {availableCategories.filter(c => c !== 'Alla').map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>
                        {renderCourseSelector()}
                        <div>
                            <label className={labelCls}>{t('library.description_label')}</label>
                            <textarea className={`${inputCls} h-20 resize-none`} value={uploadData.description} onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedBook(null); }} className="flex-1 py-2.5 bg-gray-100 dark:bg-[#252628] text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors">{t('common.cancel')}</button>
                            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30">{t('library.save_changes')}</button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* ─── READER MODAL ─── */}
            {selectedBook && !isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col">
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-[#2a2b2d] flex justify-between items-center bg-white dark:bg-[#1a1b1d] shadow-sm z-10">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                <Book size={15} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedBook.title}</h2>
                                <p className="text-xs text-gray-400 truncate">{selectedBook.author}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#252628] rounded-xl transition-colors ml-4 shrink-0">
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-900 overflow-hidden relative">
                        {selectedBook.type === 'AUDIO' ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-indigo-300/40 dark:shadow-indigo-900/60">
                                        <Music className="text-white" size={42} />
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white mb-1">Ljudbok</h3>
                                    <p className="text-gray-400 text-sm mb-6">Spelaren visas i ett flytande fönster.</p>
                                    <button onClick={() => { setActiveAudiobook(selectedBook); setSelectedBook(null); }} className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                                        <Headphones size={15} /> Öppna spelare
                                    </button>
                                </div>
                            </div>
                        ) : (selectedBook.fileUrl?.toLowerCase().endsWith('.epub') || selectedBook.type === 'EPUB') ? (
                            <EpubViewer ebookId={selectedBook.id} url={selectedBook.fileUrl} title={selectedBook.title} />
                        ) : (
                            <PdfViewer ebookId={selectedBook.id} title={selectedBook.title} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EbookLibrary;
