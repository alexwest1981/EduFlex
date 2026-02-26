import React, { useState, useEffect } from 'react';
import {
    Search,
    Grid,
    List,
    Plus,
    X,
    File,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    Folder as FolderIcon,
    HardDrive,
    Award,
    UploadCloud,
    Download
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import OnlyOfficeEditor from './OnlyOfficeEditor';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Sub-components
import FileSidebar from './components/FileSidebar';
import FileBreadcrumbs from './components/FileBreadcrumbs';
import FileContextMenu from './components/FileContextMenu';
import AdvancedShareModal from './components/AdvancedShareModal';

const DocumentManager = () => {
    const { currentUser } = useAppContext();
    const [currentView, setCurrentView] = useState('my-drive');
    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folderPath, setFolderPath] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [search, setSearch] = useState('');

    // UI States
    const [contextMenu, setContextMenu] = useState(null);
    const [shareModalItem, setShareModalItem] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [storageUsage, setStorageUsage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (currentUser) {
            loadContent();
            loadStorageUsage();
        }
    }, [currentUser, currentView, currentFolder]);

    const loadContent = async () => {
        setIsLoading(true);
        try {
            if (currentView === 'my-drive') {
                const data = currentFolder
                    ? await api.folders.getContent(currentFolder.id, currentUser.id)
                    : await api.folders.getRoot(currentUser.id);

                setFolders(data.folders || []);
                setDocuments(data.documents || []);
            } else if (currentView === 'shared') {
                const docs = await api.documents.getUserDocs(currentUser.id);
                setDocuments(docs.filter(d => d.owner?.id !== currentUser.id));
                setFolders([]);
            } else if (currentView === 'grades') {
                // Fetch grades - transform to document-like structure for display
                const gradesData = await api.courses.getMyResults(currentUser.id);
                const gradeDocs = (gradesData || []).map((grade, idx) => ({
                    id: `grade-${idx}`,
                    fileName: `${grade.courseName} - Betyg ${grade.grade}`,
                    mimeType: 'grade/record',
                    size: 0,
                    uploadedAt: grade.date,
                    isGrade: true,
                    gradeData: grade
                }));
                setDocuments(gradeDocs);
                setFolders([]);
            } else if (currentView === 'certificates') {
                // Fetch certificates/merits
                const certs = await api.documents.getMerits(currentUser.id);
                setDocuments(certs || []);
                setFolders([]);
            } else if (currentView === 'manuals') {
                // Fetch system/global documents
                const manuals = await api.documents.getSystemDocs();
                setDocuments(manuals || []);
                setFolders([]);
            }
        } catch (e) {
            console.error("Kunde inte hämta innehåll", e);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStorageUsage = async () => {
        if (!currentUser) return;
        try {
            const usage = await api.documents.getUsage(currentUser.id);
            setStorageUsage(usage);
        } catch (e) {
            console.error("Kunde inte hämta lagringsstatistik", e);
        }
    };

    const handleNewFolder = async () => {
        const name = prompt("Namnge din nya mapp:");
        if (!name) return;
        try {
            await api.folders.create(currentUser.id, name, currentFolder?.id);
            loadContent();
        } catch (e) { alert("Kunde inte skapa mapp"); }
    };

    const handleUpload = async (e) => {
        const files = e.target.files || e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            if (currentFolder) formData.append('folderId', currentFolder.id);
            try {
                await api.documents.upload(currentUser.id, formData);
            } catch (err) { console.error("Upload failed", err); }
        }
        loadContent();
        loadStorageUsage();
    };

    const triggerUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = handleUpload;
        input.click();
    };

    const handleNavigate = (folder) => {
        if (folder === null) {
            setCurrentFolder(null);
            setFolderPath([]);
        } else {
            setCurrentFolder(folder);
            const index = folderPath.findIndex(f => f.id === folder.id);
            if (index !== -1) {
                setFolderPath(folderPath.slice(0, index + 1));
            } else {
                setFolderPath([...folderPath, folder]);
            }
        }
    };

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    const handleAction = async (actionId, item) => {
        switch (actionId) {
            case 'open':
                if (item.type === 'folder') handleNavigate(item);
                else {
                    if (item.fileType?.startsWith('image/')) {
                        setPreviewImage(item.fileUrl);
                    } else {
                        window.open(item.fileUrl, '_blank');
                    }
                }
                break;
            case 'share':
                setShareModalItem(item);
                break;
            case 'delete':
                if (window.confirm(`Vill du verkligen radera ${item.name || item.fileName}?`)) {
                    if (item.type === 'folder') await api.folders.delete(item.id);
                    else await api.documents.delete(item.id);
                    loadContent();
                    loadStorageUsage();
                }
                break;
            case 'rename': {
                const newName = prompt("Nytt namn:", item.name || item.fileName);
                if (newName) {
                    if (item.type === 'folder') await api.folders.rename(item.id, newName);
                    loadContent();
                }
                break;
            }
            case 'download':
                if (item.type !== 'folder') {
                    const link = document.createElement('a');
                    link.href = item.fileUrl;
                    link.download = item.fileName;
                    link.click();
                }
                break;
            case 'edit':
                setEditingDoc(item);
                setShowEditor(true);
                break;
        }
    };

    const handleDownloadConsolidatedGrades = () => {
        const url = api.documents.getConsolidatedGradesUrl(currentUser.id);
        const token = localStorage.getItem('token');

        // Since we need the token, we can use a small hack or an AJAX blob download
        // Simple hack: window.open with token as query param (if backend supports it)
        // Better: create a temporary link after fetching with auth headers

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': localStorage.getItem('tenant_id') || ''
            }
        })
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `Samlade_Betyg_${currentUser.firstName}_${currentUser.lastName}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
            })
            .catch(err => {
                console.error("Download failed", err);
                alert("Kunde inte ladda ner betygsutdraget.");
            });
    };

    const getFileIcon = (mimeType) => {
        if (!mimeType) return <File size={32} className="text-slate-400" />;
        if (mimeType.startsWith('image/')) return <ImageIcon size={32} className="text-purple-500" />;
        if (mimeType.includes('pdf')) return <FileText size={32} className="text-red-500" />;
        if (mimeType.includes('word') || mimeType.includes('officedocument')) return <FileText size={32} className="text-blue-500" />;
        return <File size={32} className="text-slate-400" />;
    };

    const getShortType = (mimeType) => {
        if (!mimeType) return 'Fil';
        const type = mimeType.toLowerCase();
        if (type.includes('pdf')) return 'PDF';
        if (type.includes('wordprocessingml') || type.includes('msword')) return 'DOCX';
        if (type.includes('spreadsheetml') || type.includes('ms-excel')) return 'XLSX';
        if (type.includes('presentationml') || type.includes('ms-powerpoint')) return 'PPTX';
        if (type.includes('image/jpeg')) return 'JPG';
        if (type.includes('image/png')) return 'PNG';
        if (type.includes('image/gif')) return 'GIF';
        if (type.includes('image/webp')) return 'WEBP';
        if (type.includes('text/plain')) return 'TXT';
        return mimeType.split('/')[1]?.toUpperCase() || 'Fil';
    };

    const filteredDocs = documents.filter(doc => doc.fileName.toLowerCase().includes(search.toLowerCase()));
    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div
            className="flex h-full bg-white dark:bg-slate-900 relative"
            onDragEnter={() => setIsDragging(true)}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.relatedTarget) setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e); }}
        >
            <FileSidebar
                currentView={currentView}
                onViewChange={(v) => { setCurrentView(v); setCurrentFolder(null); setFolderPath([]); }}
                onNewFolder={handleNewFolder}
                onUpload={triggerUpload}
                storageUsage={storageUsage}
            />

            <main className="flex-1 flex flex-col p-6 min-w-0 h-full overflow-hidden">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div className="space-y-1">
                        <FileBreadcrumbs path={folderPath} onNavigate={handleNavigate} />
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {currentView === 'shared' ? 'Delat med mig' :
                                currentView === 'trash' ? 'Papperskorg' :
                                    currentView === 'grades' ? 'Mina Betyg' :
                                        currentView === 'certificates' ? 'Mina Intyg' :
                                            currentView === 'manuals' ? 'Dokumentbank' :
                                                currentFolder ? currentFolder.name : 'Min Drive'}
                        </h1>
                        {currentView === 'grades' && (
                            <button
                                onClick={handleDownloadConsolidatedGrades}
                                className="flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                <Download size={14} />
                                LADDA NER SAMLAT BETYG (PDF)
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                placeholder="Sök i dina filer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-xl outline-none text-sm font-bold transition-all"
                            />
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Laddar bibliotek...</p>
                        </div>
                    ) : (
                        filteredDocs.length === 0 && filteredFolders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-4 rotate-12">
                                    <UploadCloud size={48} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-black text-slate-400">Inga filer här än</h3>
                                <p className="text-xs font-bold text-slate-400">Dra och släpp filer för att börja</p>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-6 pb-12" : "space-y-3 pb-12"}>
                                {/* FOLDERS */}
                                {filteredFolders.map(folder => (
                                    <div
                                        key={folder.id}
                                        onDoubleClick={() => handleNavigate(folder)}
                                        onContextMenu={(e) => handleContextMenu(e, { ...folder, type: 'folder' })}
                                        className="group relative bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-500/30 dark:hover:border-blue-500/50 transition-all cursor-pointer shadow-sm hover:shadow-lg"
                                    >
                                        <div className="space-y-3">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FolderIcon className="text-blue-600" size={28} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white truncate text-xs mb-0.5" title={folder.name}>{folder.name}</h4>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight">Mapp</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* DOCUMENTS */}
                                {filteredDocs.map(doc => (
                                    <div
                                        key={doc.id}
                                        onDoubleClick={() => handleAction('open', { ...doc, type: 'file' })}
                                        onContextMenu={(e) => handleContextMenu(e, { ...doc, type: 'file' })}
                                        className="group relative bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-500/30 dark:hover:border-blue-500/50 transition-all cursor-pointer shadow-sm hover:shadow-lg text-center"
                                    >
                                        <div className="aspect-square bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                                            {doc.fileType?.startsWith('image/') ? (
                                                <img
                                                    src={doc.fileUrl}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    alt={doc.fileName}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(doc.fileUrl);
                                                    }}
                                                />
                                            ) : (
                                                <div className="group-hover:scale-105 transition-transform">{getFileIcon(doc.fileType)}</div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate mb-0.5 px-1" title={doc.fileName}>{doc.fileName}</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{getShortType(doc.fileType)}</p>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>

            {/* DRAG OVERLAY */}
            {isDragging && (
                <div className="absolute inset-0 z-[100] bg-blue-600/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-200">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <UploadCloud size={48} />
                    </div>
                    <h2 className="text-3xl font-black mb-2">Släpp filerna här!</h2>
                    <p className="text-lg font-bold opacity-80">Ladda upp till {currentFolder ? currentFolder.name : 'Min Drive'}</p>
                </div>
            )}

            {contextMenu && (
                <FileContextMenu
                    {...contextMenu}
                    onClose={() => setContextMenu(null)}
                    onAction={handleAction}
                />
            )}

            {shareModalItem && (
                <AdvancedShareModal
                    item={shareModalItem}
                    currentUser={currentUser}
                    onClose={() => setShareModalItem(null)}
                />
            )}

            {showEditor && editingDoc && (
                <div className="fixed inset-0 z-[10001] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-300">
                    <ErrorBoundary>
                        <OnlyOfficeEditor
                            entityType="DOCUMENT"
                            entityId={editingDoc.id}
                            userId={currentUser.id}
                            onClose={() => {
                                setShowEditor(false);
                                setEditingDoc(null);
                                loadContent();
                            }}
                        />
                    </ErrorBoundary>
                </div>
            )}

            {previewImage && (
                <div
                    className="fixed inset-0 z-[10002] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setPreviewImage(null)}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
