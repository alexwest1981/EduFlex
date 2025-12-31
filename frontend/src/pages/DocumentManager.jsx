import React, { useState, useMemo } from 'react';
import { FileText, Search, Download, Trash2, User, Calendar, File, Image as ImageIcon, Filter, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DocumentManager = ({ documents, myCourses, handleDeleteDoc, currentUser }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    // --- SMART FILTRERINGSLOGIK ---
    const visibleDocuments = useMemo(() => {
        // Skydd: Om documents är null/undefined, använd tom array
        let docs = documents || [];

        // 1. Roll-baserad filtrering
        if (currentUser?.role === 'TEACHER') {
            // Hämta alla IDn på studenter som går i lärarens kurser
            const myStudentIds = new Set();
            if (myCourses && Array.isArray(myCourses)) {
                myCourses.forEach(course => {
                    course.students?.forEach(student => myStudentIds.add(student.id));
                });
            }

            // Visa filer om: Du äger den ELLER ägaren är din student
            docs = docs.filter(doc =>
                doc.owner?.id === currentUser.id ||
                (doc.owner && myStudentIds.has(doc.owner.id))
            );
        }
        else if (currentUser?.role === 'STUDENT') {
            // Dubbelkoll: Visa bara mina egna
            docs = docs.filter(doc => doc.owner?.id === currentUser.id);
        }
        // ADMIN ser allt

        return docs;
    }, [documents, currentUser, myCourses]);

    // --- SÖK & TYPFILTRERING ---
    const filteredDocs = visibleDocuments.filter(doc => {
        // SKYDDSKOD HÄR: Vi använder ( || "") för att garantera att det är en sträng
        const filename = doc.filename || "";
        const ownerName = doc.owner?.fullName || "";
        const searchTerm = search.toLowerCase();

        // 1. Söktext
        const matchesSearch =
            filename.toLowerCase().includes(searchTerm) ||
            ownerName.toLowerCase().includes(searchTerm);

        // 2. Filtyp
        let matchesType = true;
        const ext = filename.split('.').pop().toLowerCase();

        if (filterType === 'PDF') matchesType = ext === 'pdf';
        if (filterType === 'IMAGE') matchesType = ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
        if (filterType === 'WORD') matchesType = ['doc', 'docx'].includes(ext);

        return matchesSearch && matchesType;
    });

    const getFileIcon = (filename) => {
        // Skydd även här
        const safeName = filename || "";
        const ext = safeName.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <ImageIcon size={20} className="text-purple-500"/>;
        if (['pdf'].includes(ext)) return <FileText size={20} className="text-red-500"/>;
        if (['doc', 'docx'].includes(ext)) return <FileText size={20} className="text-blue-500"/>;
        return <File size={20} className="text-gray-500"/>;
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        {currentUser?.role === 'ADMIN' && <Shield size={24} className="text-indigo-500"/>}
                        {t('sidebar.documents') || 'Dokumentarkiv'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {currentUser?.role === 'ADMIN' ? 'Hantera skolans alla filer.' :
                            currentUser?.role === 'TEACHER' ? 'Dina filer och dina elevers inlämningar.' :
                                'Dina uppladdade filer.'}
                    </p>
                </div>

                {/* Verktygsfält */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input
                            type="text"
                            placeholder="Sök fil eller person..."
                            className="w-full px-4 py-2 pl-10 border rounded-lg outline-none transition-all shadow-sm bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:ring-slate-500 dark:focus:border-slate-400"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="w-auto px-4 py-2 border rounded-lg outline-none transition-all shadow-sm bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-slate-400 focus:border-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-400"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="ALL">Alla typer</option>
                        <option value="PDF">PDF</option>
                        <option value="IMAGE">Bilder</option>
                        <option value="WORD">Word</option>
                    </select>
                </div>
            </div>

            {/* Tabell */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#282a2c] overflow-hidden shadow-sm transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#282a2c]">
                        <tr>
                            <th className="px-6 py-4 font-medium">Filnamn</th>
                            <th className="px-6 py-4 font-medium">Ägare</th>
                            <th className="px-6 py-4 font-medium">Datum</th>
                            <th className="px-6 py-4 font-medium text-right">Åtgärd</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#282a2c]">
                        {filteredDocs.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Inga filer hittades.</td></tr>
                        ) : (
                            filteredDocs.map(doc => (
                                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-[#131314] rounded-lg border border-transparent dark:border-[#3c4043]">
                                                {getFileIcon(doc.filename)}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{doc.filename || "Namnlös fil"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400"/>
                                            {doc.owner?.id === currentUser?.id ? <span className="font-bold">Du</span> : (doc.owner?.fullName || "Okänd")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14}/> {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`http://127.0.0.1:8080${doc.fileUrl}`}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Ladda ner"
                                            >
                                                <Download size={18}/>
                                            </a>
                                            {/* Man får bara radera sina egna filer eller om man är ADMIN */}
                                            {(currentUser?.role === 'ADMIN' || currentUser?.id === doc.owner?.id) && (
                                                <button
                                                    onClick={() => handleDeleteDoc(doc.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Ta bort"
                                                >
                                                    <Trash2 size={18}/>
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

export default DocumentManager;