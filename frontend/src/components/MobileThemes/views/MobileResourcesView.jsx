import React, { useState, useEffect, useRef } from 'react';
import { Folder, MoreVertical, FileText, Download, Share2, Trash2, Plus, Image, Grid, List } from 'lucide-react';
import { api } from '../../../services/api';

/**
 * MobileResourcesView
 * "Google Drive" style file manager.
 */
const MobileResourcesView = ({ currentUser, themeMode = 'dark' }) => {
    const [docs, setDocs] = useState([]);
    const [isGridView, setIsGridView] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Theme Styles
    const isLight = themeMode === 'light';
    const theme = {
        bg: isLight ? 'bg-white' : 'bg-[#0F0F11]',
        cardBg: isLight ? 'bg-white border border-gray-100 shadow-sm' : 'bg-[#1C1C1E]',
        text: isLight ? 'text-gray-900' : 'text-white',
        textMuted: isLight ? 'text-gray-500' : 'text-white/60',
        buttonBg: isLight ? 'bg-gray-100' : 'bg-[#1C1C1E]'
    };

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        try {
            // Permission Logic
            if (!currentUser) return; // Safety

            const isAdmin = currentUser.role === 'ADMIN' || currentUser.role?.name === 'ADMIN';

            let d = [];
            if (isAdmin) {
                d = await api.documents.getAll();
            } else {
                d = await api.documents.getUserDocs(currentUser.id);
            }

            const allDocs = Array.isArray(d) ? d : [];
            setDocs(allDocs);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Är du säker på att du vill ta bort filen?")) {
            await api.documents.delete(id);
            loadDocs();
        }
    };

    const handleUploadClick = () => {
        if (!uploading) fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.documents.upload(currentUser.id, formData);
            await loadDocs(); // Wait for reload
            alert("Fil uppladdad! ✅");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Kunde inte ladda upp filen.");
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <div className="flex justify-between items-center mb-2">
                <h2 className={`text-3xl font-bold ${theme.text}`}>Resurser</h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsGridView(!isGridView)} className={`p-2 ${theme.buttonBg} rounded-full ${theme.textMuted} hover:${theme.text}`}>
                        {isGridView ? <List size={20} /> : <Grid size={20} />}
                    </button>
                    <button onClick={handleUploadClick} disabled={uploading} className="p-2 bg-[#FF6D5A] text-white rounded-full shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all">
                        {uploading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={24} />}
                    </button>
                </div>
            </div>

            {/* MOCK FOLDERS */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {['Kursmaterial', 'Bilder', 'Dokument', 'Backup'].map((f, i) => (
                    <div key={i} className={`min-w-[120px] h-32 ${theme.cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
                        <Folder className="text-indigo-400" size={28} />
                        <p className={`font-bold text-sm ${theme.text}`}>{f}</p>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Filer</h3>

            {isGridView ? (
                <div className="grid grid-cols-2 gap-3">
                    {docs.map((doc, i) => (
                        <div key={i} onClick={() => window.open(doc.url || doc.path || `/api/documents/${doc.id}/download`, '_blank')} className="bg-[#1C1C1E] p-4 rounded-2xl relative aspect-square flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
                            <div className="flex justify-between items-start">
                                <div className="bg-white/10 p-2 rounded-lg">
                                    {(doc.type?.startsWith('image') || doc.name?.match(/\.(jpg|jpeg|png|gif)$/i)) ?
                                        <Image size={20} className="text-white" /> :
                                        <FileText size={20} className="text-white" />
                                    }
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="text-white/30 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm truncate">{doc.title || doc.name}</h4>
                                <p className="text-[10px] text-white/50">{new Date(doc.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {docs.map((doc, i) => (
                        <div key={i} className="bg-[#1C1C1E] p-4 rounded-2xl flex items-center gap-4 group">
                            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => window.open(doc.url || doc.path || `/api/documents/${doc.id}/download`, '_blank')}>
                                <h3 className="font-bold text-white truncate">{doc.title || doc.name}</h3>
                                <p className="text-xs text-white/50">{doc.size ? `${doc.size} KB` : 'FIL'} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.open(doc.url || doc.path || `/api/documents/${doc.id}/download`, '_blank')} className="p-2 bg-white/10 rounded-full text-white"><Download size={14} /></button>
                                <button onClick={() => handleDelete(doc.id)} className="p-2 bg-red-500/20 text-red-500 rounded-full"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MobileResourcesView;
