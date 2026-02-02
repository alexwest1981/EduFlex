import React, { useState, useEffect } from 'react';
import { Book, Upload, Search, Trash2, X, Maximize2, Library, Filter, Settings, Sparkles as SparklesIcon, Volume2, Music } from 'lucide-react';
import { api } from '../../services/api';
import EpubViewer from '../../components/common/EpubViewer';
import PdfViewer from '../../components/common/PdfViewer';
import EpubThumbnail from '../../components/common/EpubThumbnail';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AudiobookPlayer from '../../components/common/AudiobookPlayer';


const EbookLibrary = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const { currentUser } = useAppContext();
    const { t } = useTranslation();
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Alla');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [files, setFiles] = useState({ epub: null, cover: null });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadData, setUploadData] = useState({
        title: '',
        author: '',
        category: '',
        language: 'Svenska',
        description: '',
        isbn: ''
    });
    const [isIndexing, setIsIndexing] = useState(false);
    const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
    const [ttsLoading, setTtsLoading] = useState(false);


    // Derive available categories dynamically from the loaded ebooks
    const availableCategories = ['Alla', ...new Set(ebooks.map(book => book.category).filter(Boolean))].sort();

    const fetchEbooks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ebooks', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEbooks(data);
            }
        } catch (error) {
            console.error('Failed to fetch ebooks:', error);
            toast.error(t('messages.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEbooks();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // Assuming /api/courses/list exists or similar. Checking api.js usually reveals it. 
            // If not, /api/courses usually returns list for teacher/admin.
            const response = await fetch('/api/courses', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    // ... (keep fetchEbooks)

    const handleFetchIsbn = async () => {
        if (!uploadData.isbn) return toast.error('Ange ett ISBN-nummer');
        const loadingToast = toast.loading('Hämtar bokinformation...');
        try {
            const response = await fetch(`/api/ebooks/metadata/fetch?isbn=${uploadData.isbn}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUploadData(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    author: data.author || prev.author,
                    description: data.description || prev.description,
                    category: data.category || prev.category,
                    language: data.language || prev.language
                }));
                // Try to set cover if URL provided? We'd need to fetch blob.
                // For now just fill text fields.
                toast.success('Information hämtad!', { id: loadingToast });
            } else {
                toast.error('Kunde inte hitta boken via ISBN', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Fel vid hämtning av metadata', { id: loadingToast });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!files.epub) return toast.error(t('library.select_file_alert') || 'Vänligen välj en fil');

        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('author', uploadData.author);
        formData.append('category', uploadData.category);
        formData.append('language', uploadData.language);
        formData.append('description', uploadData.description);
        if (uploadData.isbn) formData.append('isbn', uploadData.isbn);
        formData.append('file', files.epub);
        if (files.cover) formData.append('cover', files.cover);

        // Append course IDs
        if (selectedCourses.length > 0) {
            // Spring expects duplicate keys for list: courseIds=1&courseIds=2
            // Or comma separated? RequestParam List<Long> usually handles both but duplicate keys is safer for FormData
            // If we used @RequestParam List<Long> courseIds in controller, comma separated string often works too.
            // Let's try appending multiple times.
            const courseIdsStr = selectedCourses.join(',');
            // Actually, for @RequestParam List<Long>, sending comma separated value is often easiest with FormData in JS
            formData.append('courseIds', courseIdsStr);
        }

        try {
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/ebooks/upload');
                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setUploadProgress(Math.round((event.loaded / event.total) * 100));
                    }
                };
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error(xhr.statusText));
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(formData);
            });

            toast.success(t('messages.upload_success'));
            setIsUploadModalOpen(false);
            setUploadProgress(0);
            fetchEbooks();
            setUploadData({ title: '', author: '', category: '', language: 'Svenska', description: '', isbn: '' });
            setFiles({ epub: null, cover: null });
            setSelectedCourses([]);
        } catch (error) {
            toast.error(t('messages.upload_error'));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const payload = {
            ...uploadData,
            courseIds: selectedCourses // JSON array works for @RequestBody map parsing we did
        };

        try {
            const response = await fetch(`/api/ebooks/${selectedBook.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(t('messages.setting_saved'));
                setIsEditModalOpen(false);
                setSelectedBook(null);
                fetchEbooks();
                setSelectedCourses([]);
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Kunde inte spara ändringar');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('common.confirm_delete') || 'Are you sure?')) return;
        try {
            const response = await fetch(`/api/ebooks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                toast.success(t('messages.delete_success') || 'Boken har tagits bort');
                fetchEbooks();
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            toast.error(t('messages.delete_error') || 'Kunde inte ta bort boken');
        }
    };

    const handleIndexForAI = async (id) => {
        if (!confirm('Vill du indexera den här boken för din AI Study Pal? Detta gör att AI:n kan svara på frågor baserat på bokens innehåll för ALLA länkade kurser.')) return;
        setIsIndexing(true);
        const loadingToast = toast.loading('Indexerar boken för AI Study Pal...');
        try {
            // Updated endpoint
            const response = await fetch(`/api/ai-tutor/ingest-ebook/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                toast.success('Boken har indexerats! Din AI Study Pal är nu smartare. 🧠✨', { id: loadingToast });
            } else {
                const err = await response.text();
                toast.error('Kunde inte indexera: ' + err, { id: loadingToast });
            }
        } catch (error) {
            console.error('Failed to index ebook:', error);
            toast.error('Ett fel inträffade vid indexering.', { id: loadingToast });
        } finally {
            setIsIndexing(false);
        }
    };

    const handleListenWithAI = async (book) => {
        setTtsLoading(true);
        const loadingToast = toast.loading('Förbereder AI-uppläsning...');
        try {
            // 1. Fetch metadata/chapters to get text (simple version: get first 5000 chars of chapter 1)
            // Implementation detail: for now we just send a request to our new TTS endpoint
            // with a sample text extracted from the book service.

            // In a better version, we'd open the reader, then click "Read this page"
            // For now, let's just show it's working by reading the book's description or a placeholder.
            const textToRead = book.description || `Detta är en uppläsning av boken ${book.title}. Tyvärr saknas beskrivning.`;

            const response = await fetch(`/api/ebooks/${book.id}/tts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: textToRead })
            });

            if (response.ok) {
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                setSelectedBook({ ...book, fileUrl: audioUrl, type: 'AUDIO' });
                setIsAudioPlayerOpen(true);
                toast.success('AI-rösten är redo! 🎧', { id: loadingToast });
            } else {
                toast.error('Kunde inte generera AI-röst.', { id: loadingToast });
            }
        } catch (error) {
            console.error('TTS error:', error);
            toast.error('Ett fel inträffade vid AI-uppläsning.', { id: loadingToast });
        } finally {
            setTtsLoading(false);
        }
    };

    // ... (keeping render logic)

    // Helper to toggle course selection
    const toggleCourse = (id) => {
        if (selectedCourses.includes(id)) {
            setSelectedCourses(selectedCourses.filter(c => c !== id));
        } else {
            setSelectedCourses([...selectedCourses, id]);
        }
    };

    console.log('Current User Role:', currentUser?.role);
    console.log('Role Check:', {
        roleName: currentUser?.role?.name,
        roleDirect: currentUser?.role,
        isTeacherName: currentUser?.role?.name === 'ROLE_TEACHER',
        isAdminName: currentUser?.role?.name === 'ROLE_ADMIN',
        isTeacherDirect: currentUser?.role === 'TEACHER',
        isAdminDirect: currentUser?.role === 'ADMIN'
    });

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-[#131314]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Book className="w-8 h-8 text-indigo-600" />
                        {t('library.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('library.subtitle')}</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Upload size={20} />
                        {t('library.upload_btn')}
                    </button>
                    <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}><Library size={20} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}><Filter size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid md:grid-cols-[240px_1fr] gap-8">
                {/* SIDEBAR (Desktop) */}
                <div className="hidden md:block space-y-2 sticky top-4 self-start">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">Kategorier</h2>
                    {availableCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === cat
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* MOBILE CATEGORY DROPDOWN (Visible only on small screens) */}
                <div className="md:hidden">
                    <select
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-6">
                    {/* Search Bar - Now Full Width in its column */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t('library.search_placeholder')}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                    ) : ebooks.length === 0 ? (
                        <div className="text-center py-20">
                            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('library.no_books')}</h3>
                            <p className="text-gray-500">{t('library.no_books_desc')}</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6" : "space-y-4"}>
                            {ebooks.filter(book => (categoryFilter === 'Alla' || book.category === categoryFilter) && (book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase()))).map(book => (
                                <div key={book.id} className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'flex flex-col'}`}>
                                    <div className={`relative overflow-hidden cursor-pointer ${viewMode === 'list' ? 'w-24 h-32 rounded-lg flex-shrink-0' : 'aspect-[3/4] w-full'}`} onClick={() => { console.log('Opening book:', book.fileUrl); setSelectedBook(book); }}>
                                        {/* Server-side Cached Cover */}
                                        <img
                                            src={`/api/ebooks/${book.id}/cover`}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/400x600?text=' + encodeURIComponent(book.title); // Fallback
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="bg-white/90 dark:bg-gray-900/90 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                <Maximize2 size={24} className="text-indigo-600" />
                                            </div>
                                        </div>
                                        <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">{book.category}</span>
                                        {book.type === 'AUDIO' && (
                                            <div className="absolute top-2 left-2 bg-indigo-600 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                                <Music size={10} /> AUDIO
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 py-0' : 'p-5 flex-1'}`}>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">{book.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{book.author}</p>
                                        <div className="mt-auto flex items-center gap-2 justify-end">
                                            {(currentUser?.role?.name === 'ROLE_TEACHER' || currentUser?.role?.name === 'ROLE_ADMIN' || currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN' || currentUser?.username === 'admin') && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleListenWithAI(book); }} className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-lg transition-colors" title="Lyssna med AI (TTS)">
                                                        <Volume2 size={18} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleIndexForAI(book.id); }} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Indexera för AI Study Pal">
                                                        <SparklesIcon size={18} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setUploadData({ ...book, description: book.description || '' }); setSelectedCourses(book.courses?.map(c => c.id) || []); setSelectedBook(book); setIsEditModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                                        <Settings size={18} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(book.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* UPLOAD MODAL - Update to include Course Selector */}
                    {isUploadModalOpen && (
                        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                                {/* ... Header ... */}
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Upload className="text-indigo-600" />
                                        {t('library.upload_modal_title')}
                                    </h2>
                                    <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                                </div>

                                <form onSubmit={handleUpload} className="p-6 space-y-4">
                                    {/* ISBN Lookup */}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ISBN (Valfritt)</label>
                                            <input type="text" placeholder="978..." className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.isbn || ''} onChange={(e) => setUploadData({ ...uploadData, isbn: e.target.value })} />
                                        </div>
                                        <button type="button" onClick={handleFetchIsbn} className="px-4 py-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-xl font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">Hämta info</button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.title_label')} *</label>
                                        <input type="text" required className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.author_label')}</label>
                                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.author} onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.category_label')}</label>
                                            <input type="text" list="category-suggestions" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })} />
                                            <datalist id="category-suggestions">
                                                {availableCategories.filter(c => c !== 'Alla').map(cat => <option key={cat} value={cat} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    {/* COURSE SELECTOR */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Koppla till kurser (för AI)</label>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 max-h-32 overflow-y-auto border border-gray-100 dark:border-gray-700">
                                            {courses.length === 0 && <p className="text-xs text-gray-400">Inga kurser hittades.</p>}
                                            {courses.map(course => (
                                                <div key={course.id} className="flex items-center gap-2 mb-1 last:mb-0">
                                                    <input
                                                        type="checkbox"
                                                        id={`course-${course.id}`}
                                                        checked={selectedCourses.includes(course.id)}
                                                        onChange={() => toggleCourse(course.id)}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor={`course-${course.id}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none truncate">
                                                        {course.name} <span className="text-xs text-gray-400">({course.courseCode})</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">AI:n kommer kunna svara på frågor om boken i de valda kurserna.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.description_label')}</label>
                                        <textarea className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} />
                                    </div>

                                    {/* ... File Inputs ... */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.epub_file_label')} *</label>
                                            <input type="file" accept=".epub,.pdf,.mp3,.m4b" required onChange={(e) => setFiles({ ...files, epub: e.target.files[0] })} className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.cover_image_label')} ({t('common.optional')})</label>
                                            <input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, cover: e.target.files[0] })} className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                        </div>
                                    </div>

                                    {/* ... Footer Buttons ... */}
                                    <div className="pt-4 flex flex-col gap-3">
                                        {uploadProgress > 0 && (<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"> <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div> <p className="text-xs text-center mt-1 text-gray-500">{uploadProgress}%</p> </div>)}
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                                            <button type="submit" disabled={uploadProgress > 0 && uploadProgress < 100} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">{uploadProgress > 0 && uploadProgress < 100 ? t('common.uploading') + '...' : t('library.upload_btn')}</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* EDIT MODAL - Update to include Course Selector */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Settings size={24} className="text-indigo-600" />
                                        {t('library.edit_modal_title')}
                                    </h2>
                                    <button onClick={() => { setIsEditModalOpen(false); setSelectedBook(null); }} className="text-gray-400 hover:text-gray-600"><X /></button>
                                </div>
                                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                    {/* ISBN Lookup */}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ISBN</label>
                                            <input type="text" placeholder="978..." className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.isbn || ''} onChange={(e) => setUploadData({ ...uploadData, isbn: e.target.value })} />
                                        </div>
                                        <button type="button" onClick={handleFetchIsbn} className="px-4 py-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-xl font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">Hämta info</button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.title_label')} *</label>
                                        <input type="text" required className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.author_label')}</label>
                                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.author} onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.category_label')}</label>
                                            <input type="text" list="edit-category-suggestions" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })} />
                                            <datalist id="edit-category-suggestions">
                                                {availableCategories.filter(c => c !== 'Alla').map(cat => <option key={cat} value={cat} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    {/* COURSE SELECTOR */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Koppla till kurser (för AI)</label>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 max-h-32 overflow-y-auto border border-gray-100 dark:border-gray-700">
                                            {courses.length === 0 && <p className="text-xs text-gray-400">Inga kurser hittades.</p>}
                                            {courses.map(course => (
                                                <div key={course.id} className="flex items-center gap-2 mb-1 last:mb-0">
                                                    <input
                                                        type="checkbox"
                                                        id={`edit-course-${course.id}`}
                                                        checked={selectedCourses.includes(course.id)}
                                                        onChange={() => toggleCourse(course.id)}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor={`edit-course-${course.id}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none truncate">
                                                        {course.name} <span className="text-xs text-gray-400">({course.courseCode})</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.description_label')}</label>
                                        <textarea className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedBook(null); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">{t('library.save_changes')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {selectedBook && !isEditModalOpen && (
                        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col animate-in fade-in duration-200">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm z-10">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-2xl flex items-center gap-2">
                                    <Book className="text-indigo-600" size={20} />
                                    {selectedBook.title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline-block">{selectedBook.author}</span>
                                    <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X /></button>
                                </div>
                            </div>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
                                {selectedBook.type === 'AUDIO' ? (
                                    <AudiobookPlayer book={selectedBook} onClose={() => setSelectedBook(null)} />
                                ) : (selectedBook.fileUrl && selectedBook.fileUrl.toLowerCase().endsWith('.epub')) || selectedBook.type === 'EPUB' ? (
                                    <EpubViewer url={selectedBook.fileUrl} title={selectedBook.title} />
                                ) : (
                                    <PdfViewer ebookId={selectedBook.id} title={selectedBook.title} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default EbookLibrary;
