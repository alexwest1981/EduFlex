import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Store, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import SubjectSidebar from './components/SubjectSidebar';
import ContentGrid from './components/ContentGrid';
import CommunityDetailModal from './components/CommunityDetailModal';
import PublishModal from './components/PublishModal';
import AuthorProfile from './components/AuthorProfile';
import ContributorLeaderboard from './components/ContributorLeaderboard';

const CommunityHub = ({ minimal = false }) => {
    const { currentUser } = useAppContext();

    // State
    const [items, setItems] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modals
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [selectedAuthorId, setSelectedAuthorId] = useState(null);

    // Listen for external publish event (e.g. from ResourceBank header)
    useEffect(() => {
        const handlePublishEvent = () => setShowPublishModal(true);
        window.addEventListener('community:publish', handlePublishEvent);
        return () => window.removeEventListener('community:publish', handlePublishEvent);
    }, []);

    // Load subjects on mount
    useEffect(() => {
        loadSubjects();
    }, []);

    // Load items when filters change
    useEffect(() => {
        if (searchTerm) {
            searchItems();
        } else {
            loadItems();
        }
    }, [selectedSubject, selectedType, sortBy, page]);

    const loadSubjects = async () => {
        try {
            const data = await api.community.getSubjects();
            setSubjects(data || []);
        } catch (err) {
            console.error('Failed to load subjects:', err);
        }
    };

    const loadItems = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: 20,
                sort: sortBy
            };
            if (selectedSubject !== 'ALL') params.subject = selectedSubject;
            if (selectedType !== 'ALL') params.type = selectedType;

            const data = await api.community.browse(params);
            setItems(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error('Failed to load community items:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchItems = async () => {
        if (!searchTerm.trim()) {
            loadItems();
            return;
        }
        setLoading(true);
        try {
            const data = await api.community.search(searchTerm, page);
            setItems(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error('Failed to search:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback((e) => {
        if (e.key === 'Enter') {
            setPage(0);
            searchItems();
        }
    }, [searchTerm]);

    const handleInstall = async (itemId) => {
        try {
            await api.community.install(itemId);
            // Refresh item to show "already installed"
            if (selectedItem?.id === itemId) {
                const updated = await api.community.getItem(itemId);
                setSelectedItem(updated);
            }
            alert('Innehållet har installerats till dina resurser!');
        } catch (err) {
            console.error('Failed to install:', err);
            alert('Kunde inte installera: ' + err.message);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Är du säker på att du vill ta bort detta innehåll?')) return;
        try {
            await api.community.delete(itemId);
            setSelectedItem(null);
            loadItems();
        } catch (err) {
            console.error('Failed to delete:', err);
            alert('Kunde inte ta bort: ' + err.message);
        }
    };

    const isTeacherOrAdmin = currentUser?.role?.name?.includes('TEACHER') ||
        currentUser?.role?.name?.includes('ADMIN') ||
        currentUser?.role?.isSuperAdmin;

    const isAdmin = currentUser?.role?.name?.includes('ADMIN') || currentUser?.role?.isSuperAdmin;

    return (
        <div className={`max-w-7xl mx-auto animate-in fade-in pb-20 ${minimal ? '' : 'p-4 md:p-8'}`}>
            {/* Header */}
            {!minimal && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <Store className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                EduFlex Community
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Utforska och dela utbildningsmaterial
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Sök material..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#282a2c] border border-gray-200
                                         dark:border-transparent rounded-xl text-sm focus:ring-2 focus:ring-indigo-500
                                         focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Publish Button (Teachers/Admins only) */}
                        {isTeacherOrAdmin && (
                            <button
                                onClick={() => setShowPublishModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700
                                         text-white font-semibold rounded-xl transition-colors shadow-lg
                                         hover:shadow-indigo-500/25"
                            >
                                <Plus size={18} />
                                <span className="hidden md:inline">Publicera</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Subjects & Leaderboard */}
                <div className="lg:col-span-1 space-y-6 sticky top-4 self-start">
                    <SubjectSidebar
                        subjects={subjects}
                        selectedSubject={selectedSubject}
                        onSelectSubject={(s) => {
                            setSelectedSubject(s);
                            setPage(0);
                        }}
                    />

                    <ContributorLeaderboard
                        onSelectAuthor={setSelectedAuthorId}
                    />
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {/* Type Filter */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#282a2c] rounded-xl">
                            {['ALL', 'QUIZ', 'ASSIGNMENT', 'LESSON'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setPage(0);
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${selectedType === type
                                        ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white shadow'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {type === 'ALL' ? 'Alla' : type === 'QUIZ' ? 'Quiz' : type === 'ASSIGNMENT' ? 'Uppgift' : 'Lektion'}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative ml-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(0);
                                }}
                                className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#282a2c] border
                                         border-gray-200 dark:border-transparent rounded-xl text-sm
                                         focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option value="newest">Nyast</option>
                                <option value="popular">Populärt</option>
                                <option value="rating">Bäst betyg</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Content Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                            <p className="text-gray-500">Laddar innehåll...</p>
                        </div>
                    ) : (
                        <ContentGrid
                            items={items}
                            onSelectItem={setSelectedItem}
                        />
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 bg-white dark:bg-[#282a2c] border border-gray-200
                                         dark:border-transparent rounded-lg disabled:opacity-50"
                            >
                                Föregående
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-500">
                                Sida {page + 1} av {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 bg-white dark:bg-[#282a2c] border border-gray-200
                                         dark:border-transparent rounded-lg disabled:opacity-50"
                            >
                                Nästa
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <CommunityDetailModal
                    itemId={selectedItem.id}
                    onClose={() => setSelectedItem(null)}
                    onInstall={handleInstall}
                    onDelete={isAdmin ? handleDelete : undefined}
                    onViewAuthor={(authorId) => {
                        setSelectedItem(null);
                        setSelectedAuthorId(authorId);
                    }}
                />
            )}

            {/* Publish Modal */}
            {showPublishModal && (
                <PublishModal
                    onClose={() => setShowPublishModal(false)}
                    onPublished={() => {
                        setShowPublishModal(false);
                        loadItems();
                    }}
                    userId={currentUser?.id}
                />
            )}
            {/* Author Profile Modal */}
            {selectedAuthorId && (
                <AuthorProfile
                    userId={selectedAuthorId}
                    onClose={() => setSelectedAuthorId(null)}
                    onSelectItem={(item) => {
                        setSelectedAuthorId(null);
                        setSelectedItem(item);
                    }}
                />
            )}
        </div>
    );
};

export default CommunityHub;
