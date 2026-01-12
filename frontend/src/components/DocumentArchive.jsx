import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, Trash2, Filter, User, Calendar, File, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

const DocumentArchive = () => {
    const { currentUser } = useAppContext();
    const [documents, setDocuments] = useState([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PDF', 'IMAGE', 'WORD'
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            // OBS: Vi behöver en endpoint i api.js som heter documents.getAll()
            // Om du bara är elev kanske du bara ska se dina egna + kursfiler
            const data = await api.documents.getAll();
            setDocuments(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Kunde inte hämta dokument", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Är du säker på att du vill radera filen?")) return;
        try {
            await api.documents.delete(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (e) {
            alert("Kunde inte radera filen.");
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <ImageIcon size={20} className="text-purple-500" />;
        if (['pdf'].includes(ext)) return <FileText size={20} className="text-red-500" />;
        if (['doc', 'docx'].includes(ext)) return <FileText size={20} className="text-blue-500" />;
        return <File size={20} className="text-gray-500" />;
    };

    // --- FILTRERINGSLOGIK ---
    const filteredDocs = documents.filter(doc => {
        // 1. Söktext (Filnamn eller ägare)
        const matchesSearch =
            doc.filename.toLowerCase().includes(search.toLowerCase()) ||
            (doc.owner && doc.owner.fullName.toLowerCase().includes(search.toLowerCase()));

        // 2. Filtyp
        let matchesType = true;
        const ext = doc.filename.split('.').pop().toLowerCase();
        if (filterType === 'PDF') matchesType = ext === 'pdf';
        if (filterType === 'IMAGE') matchesType = ['jpg', 'jpeg', 'png'].includes(ext);
        if (filterType === 'WORD') matchesType = ['doc', 'docx'].includes(ext);

        return matchesSearch && matchesType;
    });

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dokumentarkiv</h1>
                    <p className="text-gray-500 dark:text-gray-400">Hantera alla filer i systemet.</p>
                </div>

                {/* SÖK OCH FILTER */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Sök filnamn eller ägare..."
                            className="pl-10 w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="bg-white dark:bg-[#282a2c] border border-gray-300 dark:border-transparent rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-500"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="ALL">Alla typer</option>
                        <option value="PDF">PDF-filer</option>
                        <option value="IMAGE">Bilder</option>
                        <option value="WORD">Word-dok.</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#282a2c] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#282a2c]">
                            <tr>
                                <th className="px-6 py-4 font-medium">Filnamn</th>
                                <th className="px-6 py-4 font-medium">Ägare</th>
                                <th className="px-6 py-4 font-medium">Uppladdad</th>
                                <th className="px-6 py-4 font-medium text-right">Åtgärd</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#282a2c]">
                            {isLoading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Laddar filer...</td></tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Inga dokument matchade din sökning.</td></tr>
                            ) : (
                                filteredDocs.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-[#282a2c] rounded-lg">
                                                    {getFileIcon(doc.filename)}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{doc.filename}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" /> {doc.owner?.fullName || "Okänd"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} /> {new Date(doc.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`http://127.0.0.1:8080${doc.fileUrl}`}
                                                    download
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Ladda ner"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                {((currentUser.role?.name || currentUser.role) === 'ADMIN' || currentUser.id === doc.owner?.id) && (
                                                    <button
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Ta bort"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DocumentArchive;