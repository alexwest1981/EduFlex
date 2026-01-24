import {
    Search, UploadCloud, Grid, List, HardDrive, FileCode, Share2, UserPlus, X, Download, Trash2, File, FileText, Image as ImageIcon, Edit3
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import OnlyOfficeEditor from './OnlyOfficeEditor';

const DocumentManager = () => {
    const { currentUser } = useAppContext();
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [editingDoc, setEditingDoc] = useState(null);

    // Drag & Drop State
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (currentUser) loadDocuments();
    }, [currentUser]);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const data = currentUser.role === 'ADMIN'
                ? await api.documents.getAll()
                : await api.documents.getUserDocs(currentUser.id);

            // Handle both Array and Pagination object
            const docArray = Array.isArray(data) ? data : (data?.content || []);
            setDocuments(docArray);
        } catch (e) {
            console.error("Kunde inte hämta filer", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;

        // Loopa igenom filer
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            try {
                await api.documents.upload(currentUser.id, formData);
            } catch (e) {
                alert(`Fel vid uppladdning av ${files[i].name}`);
            }
        }
        loadDocuments();
    };

    const openShareModal = async (doc) => {
        setSelectedDoc(doc);
        setShareModalOpen(true);
        try {
            // Hämta användare att dela med (kan optimeras till contacts)
            const usersRes = await api.users.getAll(0, 1000);
            const users = usersRes?.content || usersRes || [];
            setAllUsers(users.filter(u => u.id !== currentUser.id));
        } catch (e) {
            console.error("Failed to load users");
        }
    };

    const handleShare = async (userId) => {
        try {
            await api.documents.share(selectedDoc.id, userId);
            alert(`Filen delad!`);
            setShareModalOpen(false);
        } catch (e) {
            alert("Kunde inte dela filen.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Vill du verkligen ta bort filen?")) return;
        try {
            await api.documents.delete(id);
            setDocuments(documents.filter(d => d.id !== id));
        } catch (e) { alert("Kunde inte ta bort fil."); }
    };

    // --- NY SÄKER DRAG & DROP-LOGIK ---

    // 1. Aktivera drag-läge när man drar in något i fönstret
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    // 2. Hantera drop (Sker på overlayen)
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    // 3. Stäng om man drar utanför (Sker på overlayen)
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    // 4. Nödvändigt för att tillåta drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };


    // --- HELPERS ---
    const getFileIcon = (mimeType) => {
        if (!mimeType) return <File size={40} className="text-gray-400" />;
        if (mimeType.startsWith('image/')) return <ImageIcon size={40} className="text-purple-500" />;
        if (mimeType.includes('pdf')) return <FileText size={40} className="text-red-500" />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText size={40} className="text-blue-500" />;
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return <FileText size={40} className="text-green-500" />;
        if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('html')) return <FileCode size={40} className="text-yellow-500" />;
        return <File size={40} className="text-gray-400" />;
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateArray) => {
        if (!dateArray) return "-";
        // Hantera Java LocalDateTime array [2024, 1, 4, 12, 30] eller sträng
        if (Array.isArray(dateArray)) {
            const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4]);
            return date.toLocaleString();
        }
        return new Date(dateArray).toLocaleString();
    };

    const isEditable = (fileName) => {
        if (!fileName) return false;
        const parts = fileName.split('.');
        if (parts.length < 2) return false;
        const ext = parts.pop().toLowerCase();
        const editableExts = ['docx', 'doc', 'odt', 'xlsx', 'xls', 'ods', 'pptx', 'ppt', 'odp', 'txt'];
        return editableExts.includes(ext);
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.fileName.toLowerCase().includes(search.toLowerCase());
        const matchesType = filter === 'all'
            ? true
            : filter === 'image' ? doc.fileType?.startsWith('image/')
                : !doc.fileType?.startsWith('image/');
        return matchesSearch && matchesType;
    });

    return (
        <div
            className="max-w-7xl mx-auto animate-in fade-in h-full flex flex-col relative"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDrop={(e) => e.preventDefault()} // Förhindra drop på "bakgrunden"
        >
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Filer & Dokument</h1>
                    <p className="text-gray-500 text-sm">Hantera dina uppgifter och kursmaterial.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-[#1E1F20] p-1 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-gray-400'}`}><Grid size={20} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-gray-400'}`}><List size={20} /></button>
                </div>
            </div>

            {/* --- TOOLBAR --- */}
            <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'document', 'image'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-[#282a2c] dark:text-gray-300 hover:bg-gray-200'}`}
                        >
                            {f === 'all' ? 'Alla' : f === 'image' ? 'Bilder' : 'Dokument'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Sök fil..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-200 transition-all">
                        <UploadCloud size={18} /> <span className="hidden sm:inline">Ladda upp</span>
                        <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e.target.files)} />
                    </label>
                </div>
            </div>

            {/* --- DROPZONE OVERLAY (FIXAT BLINKANDE) --- */}
            {isDragging && (
                <div
                    className="absolute inset-0 z-50 bg-indigo-600/90 rounded-3xl flex flex-col items-center justify-center text-white backdrop-blur-sm animate-in fade-in"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="bg-white/20 p-8 rounded-full mb-6 animate-bounce">
                        <UploadCloud size={64} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Släpp filerna här!</h2>
                    <p className="text-indigo-100">Ladda upp till ditt arkiv</p>
                </div>
            )}

            {/* --- CONTENT --- */}
            {isLoading ? <div className="text-center py-20 text-gray-400">Laddar filer...</div> :
                filteredDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-[#3c4043] rounded-2xl bg-gray-50/50">
                        <HardDrive size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Här var det tomt.</p>
                        <p className="text-gray-400 text-sm">Ladda upp filer eller dra dem hit.</p>
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredDocs.map(doc => (
                                <div key={doc.id} className="group bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043] hover:border-indigo-400 hover:shadow-md transition-all relative flex flex-col items-center text-center">
                                    <div className="mb-3 p-4 bg-gray-50 dark:bg-[#131314] rounded-xl w-full flex justify-center h-32 items-center overflow-hidden">
                                        {doc.fileType?.startsWith('image/') ?
                                            <img src={`http://127.0.0.1:8080${doc.fileUrl}`} alt={doc.fileName} className="h-full w-full object-cover rounded" />
                                            : getFileIcon(doc.fileType)
                                        }
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate w-full mb-1" title={doc.fileName}>{doc.fileName}</h4>
                                    <p className="text-xs text-gray-400 mb-2">{formatSize(doc.size)}</p>
                                    <p className="text-[10px] text-gray-300">{formatDate(doc.uploadedAt)}</p>

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                        {isEditable(doc.fileName) && (
                                            <button onClick={() => setEditingDoc(doc)} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 shadow-lg animate-in zoom-in" title="Redigera">
                                                <Edit3 size={18} />
                                            </button>
                                        )}
                                        <a href={`http://127.0.0.1:8080${doc.fileUrl}`} download target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-gray-800 hover:text-indigo-600"><Download size={18} /></a>
                                        <button onClick={() => openShareModal(doc)} className="p-2 bg-white rounded-full text-gray-800 hover:text-blue-600"><Share2 size={18} /></button>
                                        <button onClick={() => handleDelete(doc.id)} className="p-2 bg-white rounded-full text-gray-800 hover:text-red-600"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 text-xs uppercase font-bold border-b border-gray-200 dark:border-[#3c4043]">
                                    <tr>
                                        <th className="p-4">Namn</th>
                                        <th className="p-4">Datum</th>
                                        <th className="p-4">Storlek</th>
                                        <th className="p-4">Typ</th>
                                        <th className="p-4 text-right">Åtgärd</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {filteredDocs.map(doc => (
                                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors group">
                                            <td className="p-4 flex items-center gap-3">
                                                {getFileIcon(doc.fileType)}
                                                <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{doc.fileName}</span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">{formatDate(doc.uploadedAt)}</td>
                                            <td className="p-4 text-sm text-gray-500">{formatSize(doc.size)}</td>
                                            <td className="p-4 text-sm text-gray-500 uppercase">{doc.fileType?.split('/')[1] || 'FIL'}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isEditable(doc.fileName) && (
                                                        <button onClick={() => setEditingDoc(doc)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded text-indigo-600" title="Redigera i ONLYOFFICE">
                                                            <Edit3 size={16} />
                                                        </button>
                                                    )}
                                                    <a href={`http://127.0.0.1:8080${doc.fileUrl}`} download target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-200 rounded text-gray-600"><Download size={16} /></a>
                                                    <button onClick={() => openShareModal(doc)} className="p-2 hover:bg-blue-100 rounded text-blue-600"><Share2 size={16} /></button>
                                                    <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-red-100 rounded text-red-600"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            {
                shareModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                            <button onClick={() => setShareModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            <h3 className="text-xl font-bold mb-4 dark:text-white">Dela fil</h3>
                            <p className="text-sm text-gray-500 mb-4 truncate">Fil: <strong>{selectedDoc?.fileName}</strong></p>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    className="w-full pl-9 p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm"
                                    placeholder="Sök användare..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                                {allUsers.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.fullName.toLowerCase().includes(userSearch.toLowerCase())).map(user => (
                                    <div key={user.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-[#282a2c] rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-[#3c4043] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                {user.firstName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm dark:text-white">{user.fullName}</p>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleShare(user.id)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold text-xs">Dela</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
            {
                editingDoc && (
                    <OnlyOfficeEditor
                        entityType="DOCUMENT"
                        entityId={editingDoc.id}
                        userId={currentUser.id}
                        onClose={() => {
                            setEditingDoc(null);
                            loadDocuments(); // Ladda om för att visa uppdaterad storlek/datum
                        }}
                    />
                )
            }
        </div >
    );
};

export default DocumentManager;