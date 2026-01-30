import React, { useState, useEffect } from 'react';
import { Book, Upload, Search, Trash2, X, Maximize2, Library, Filter, Settings, Sparkles as SparklesIcon } from 'lucide-react';
import { api } from '../../services/api';
import EpubViewer from '../../components/common/EpubViewer';
import PdfViewer from '../../components/common/PdfViewer';
import EpubThumbnail from '../../components/common/EpubThumbnail';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const EbookLibrary = () => {
    const { currentUser } = useAppContext();
    const { t } = useTranslation();
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isIndexing, setIsIndexing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        author: '',
        category: '',
        language: 'Svenska',
        description: ''
    });
    const [files, setFiles] = useState({ epub: null, cover: null });
    const [location, setLocation] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const isAdmin = currentUser?.role?.name === 'ADMIN' || currentUser?.role === 'ADMIN';
    const isTeacher = currentUser?.role?.name === 'TEACHER' || currentUser?.role === 'TEACHER';
    const isPrincipal = currentUser?.role?.name === 'PRINCIPAL' || currentUser?.role === 'PRINCIPAL';
    const canUpload = isAdmin || isTeacher || isPrincipal;

    const [selectedCategory, setSelectedCategory] = useState('Alla');
    const [categories, setCategories] = useState(['Alla', 'Matematik', 'Programmering', 'Administration', 'Ekonomi', 'Språk', 'Naturvetenskap', 'Samhällskunskap', 'Teknik', 'Övrigt']);

    useEffect(() => {
        fetchEbooks();
    }, []);

    useEffect(() => {
        // Reset location when switching books to avoid "No Section Found" errors
        setLocation(null);
    }, [selectedBook?.id]);

    const fetchEbooks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ebooks', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setEbooks(data);

            // Extract unique categories from books and merge with defaults
            const bookCategories = [...new Set(data.map(b => b.category).filter(Boolean))];
            const allCategories = ['Alla', ...new Set([...categories.slice(1), ...bookCategories])];
            setCategories(allCategories);
        } catch (error) {
            console.error('Failed to fetch ebooks:', error);
            toast.error(t('messages.error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!files.epub) return toast.error(t('library.select_file_alert') || 'Vänligen välj en EPUB-fil');

        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('author', uploadData.author);
        formData.append('category', uploadData.category);
        formData.append('language', uploadData.language);
        formData.append('description', uploadData.description);
        formData.append('file', files.epub);
        if (files.cover) formData.append('cover', files.cover);

        try {
            // Note: We use XMLHttpRequest in a wrapper (or modified fetch) to track progress
            // Since we modified api.documents.upload, maybe we should move this to an api wrapper or similar
            // But here we are using raw fetch. We need to use XHR here directly or use a helper that supports it.
            // Wait, I updated api.documents.upload but here it uses direct fetch('/api/ebooks/upload').
            // I should either switch to using api.documents.upload (if it maps to the same endpoint) 
            // OR rewrite this fetch to use XHR directly here.
            // Looking at api.js, api.documents.upload goes to /api/documents/user/${userId}, which might be wrong for ebooks.
            // Ebooks endpoint is /api/ebooks/upload.

            // Let's implement XHR directly here for the specific Ebook endpoint to match the pattern I used in api.js
            // or I can add an api.ebooks.upload method. Adding to api.js is cleaner but I can do it here locally to be safe.

            /* 
               Actually, I should check if I can just use XHR here.
            */
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/ebooks/upload');
                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percent);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(xhr.statusText));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(formData);
            });

            // If we get here, it succeeded
            toast.success(t('messages.upload_success'));
            setIsUploadModalOpen(false);
            setUploadProgress(0); // Reset
            fetchEbooks();
            setUploadData({ title: '', author: '', category: '', language: 'Svenska', description: '' });
            setFiles({ epub: null, cover: null });

        } catch (error) {
            toast.error(t('messages.upload_error'));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const payload = {
            title: uploadData.title,
            author: uploadData.author,
            category: uploadData.category,
            language: uploadData.language,
            description: uploadData.description
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
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Kunde inte spara ändringar: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('library.delete_confirm'))) return;
        try {
            await fetch(`/api/ebooks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success(t('library.delete_success') || 'Bok borttagen');
            fetchEbooks();
        } catch (error) {
            toast.error(t('messages.delete_error'));
        }
    };

    const handleIndexForAI = async (id) => {
        if (!confirm('Vill du indexera den här boken för din AI Study Pal? Detta gör att AI:n kan svara på frågor baserat på bokens innehåll.')) return;
        setIsIndexing(true);
        const loadingToast = toast.loading('Indexerar boken för AI Study Pal...');
        try {
            const response = await fetch(`/api/study-pal/index-ebook/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                toast.success('Boken har indexerats! Din AI Study Pal är nu smartare. 🧠✨', { id: loadingToast });
            } else {
                toast.error('Kunde inte indexera boken just nu.', { id: loadingToast });
            }
        } catch (error) {
            console.error('Failed to index ebook:', error);
            toast.error('Ett fel inträffade vid indexering.', { id: loadingToast });
        } finally {
            setIsIndexing(false);
        }
    };

    const filteredEbooks = ebooks.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Alla' || book.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-[#131314]">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Library className="text-indigo-600" size={32} />
                        {t('library.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('library.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('library.search_placeholder')}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-gray-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {canUpload && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none font-medium"
                        >
                            <Upload size={18} />
                            {t('common.upload')}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Sidebar Filter */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm sticky top-24">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Filter size={14} />
                            {t('library.categories')}
                        </h3>
                        <div className="flex flex-col gap-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    {cat === 'Alla' ? t('library.all_categories') : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    {/* Mobile Category Scroll */}
                    <div className="lg:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {cat === 'Alla' ? t('library.all_categories') : cat}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-80"></div>
                            ))}
                        </div>
                    ) : filteredEbooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredEbooks.map(book => (
                                <div key={book.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative">
                                    {/* Book Cover */}
                                    <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                        {book.coverUrl ? (
                                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : book.fileUrl ? (
                                            <EpubThumbnail epubUrl={book.fileUrl} title={book.title} />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <Book size={64} strokeWidth={1} />
                                                <span className="text-xs mt-2 uppercase tracking-widest font-bold">{t('library.no_cover') || 'Inget omslag'}</span>
                                            </div>
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                            {/* Primary Action: Read */}
                                            <button
                                                onClick={() => setSelectedBook(book)}
                                                className="bg-white text-gray-900 p-4 rounded-full hover:bg-indigo-50 transition-all hover:scale-110 shadow-xl mb-auto mt-auto"
                                                title={t('library.read_book')}
                                            >
                                                <Maximize2 size={28} />
                                            </button>

                                            {/* Admin Action Bar (at bottom) */}
                                            {canUpload && (
                                                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 w-fit">
                                                    <button
                                                        onClick={() => {
                                                            setUploadData({
                                                                title: book.title,
                                                                author: book.author || '',
                                                                category: book.category || '',
                                                                language: book.language || 'Svenska',
                                                                description: book.description || ''
                                                            });
                                                            setSelectedBook(book);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                                        title={t('common.edit')}
                                                    >
                                                        <Settings size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleIndexForAI(book.id)}
                                                        className="p-2 text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
                                                        title="Indexera för AI Study Pal"
                                                        disabled={isIndexing}
                                                    >
                                                        <SparklesIcon size={18} className={isIndexing ? 'animate-pulse' : ''} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(book.id)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title={t('common.delete')}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Book Details */}
                                    <div className="p-4">
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 block">
                                            {book.category || 'Allmänt'}
                                        </span>
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate" title={book.title}>{book.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{book.author || t('common.unknown')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Book className="text-gray-300" size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('library.no_books_found')}</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {t('library.no_books_desc') || 'Prova att söka på något annat eller ladda upp din första e-bok till biblioteket.'}
                            </p>
                        </div>
                    )}

                    {/* EPUB READER MODAL */}
                    {selectedBook && (
                        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col">
                            <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
                                <div className="flex items-center gap-3">
                                    <Book className="text-indigo-400" />
                                    <span className="font-bold truncate max-w-md">{selectedBook.title}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedBook(null)}
                                    className="hover:bg-white/10 p-2 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {selectedBook.fileUrl?.toLowerCase().endsWith('.pdf') ? (
                                    <PdfViewer
                                        ebookId={selectedBook.id}
                                        title={selectedBook.title}
                                    />
                                ) : (
                                    <EpubViewer
                                        url={selectedBook.fileUrl}
                                        title={selectedBook.title}
                                        location={location}
                                        onLocationChange={(loc) => setLocation(loc)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* UPLOAD MODAL */}
                    {isUploadModalOpen && (
                        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Upload className="text-indigo-600" />
                                        {t('library.upload_modal_title')}
                                    </h2>
                                    <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                                </div>
                                <form onSubmit={handleUpload} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.title_label')} *</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={uploadData.title}
                                            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.author_label')}</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={uploadData.author}
                                                onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.category_label')}</label>
                                            <select
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={uploadData.category}
                                                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                                            >
                                                <option value="">{t('common.choose')}</option>
                                                {categories.filter(c => c !== 'Alla').map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.description_label')}</label>
                                        <textarea
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                                            value={uploadData.description}
                                            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.epub_file_label')} *</label>
                                            <input
                                                type="file" accept=".epub" required
                                                onChange={(e) => setFiles({ ...files, epub: e.target.files[0] })}
                                                className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.cover_image_label')} ({t('common.optional')})</label>
                                            <input
                                                type="file" accept="image/*"
                                                onChange={(e) => setFiles({ ...files, cover: e.target.files[0] })}
                                                className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex flex-col gap-3">
                                        {uploadProgress > 0 && (
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                <p className="text-xs text-center mt-1 text-gray-500">{uploadProgress}%</p>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsUploadModalOpen(false)}
                                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={uploadProgress > 0 && uploadProgress < 100}
                                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {uploadProgress > 0 && uploadProgress < 100 ? t('common.uploading') + '...' : t('library.upload_btn')}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    {/* EDIT MODAL */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Settings size={24} className="text-indigo-600" />
                                        {t('library.edit_modal_title')}
                                    </h2>
                                    <button onClick={() => { setIsEditModalOpen(false); setSelectedBook(null); }} className="text-gray-400 hover:text-gray-600"><X /></button>
                                </div>
                                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.title_label')} *</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={uploadData.title}
                                            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.author_label')}</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={uploadData.author}
                                                onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.category_label')}</label>
                                            <select
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={uploadData.category}
                                                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                                            >
                                                <option value="">{t('common.choose')}</option>
                                                {categories.filter(c => c !== 'Alla').map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('library.description_label')}</label>
                                        <textarea
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                                            value={uploadData.description}
                                            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditModalOpen(false); setSelectedBook(null); }}
                                            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                        >
                                            {t('library.save_changes')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EbookLibrary;
