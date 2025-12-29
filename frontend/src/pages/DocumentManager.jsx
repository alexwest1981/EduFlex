import React, { useState } from 'react';
import { FileText, Trash2, Upload, Search, Download, File as FileIcon, Image as ImageIcon, Film } from 'lucide-react'; // <--- VIKTIGT: Alias här

const DocumentManager = ({
                             documents = [],
                             handleUploadDoc,
                             handleDeleteDoc,
                             currentUser
                         }) => {
    const [uploadFile, setUploadFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const safeDocuments = Array.isArray(documents) ? documents : [];

    const onUpload = (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        setIsUploading(true);

        setTimeout(() => {
            const newDoc = {
                id: Date.now(),
                name: uploadFile.name,
                size: (uploadFile.size / 1024).toFixed(1) + ' KB',
                type: uploadFile.type || 'unknown',
                date: new Date().toISOString().split('T')[0],
                owner: currentUser?.fullName || currentUser?.name || currentUser?.username || 'Jag'
            };

            handleUploadDoc(newDoc);
            setUploadFile(null);
            setIsUploading(false);

            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = "";
        }, 800);
    };

    const getIcon = (mimeType) => {
        const type = mimeType ? mimeType.toLowerCase() : '';
        if (type.includes('image')) return <ImageIcon size={20} className="text-purple-500" />;
        if (type.includes('video')) return <Film size={20} className="text-red-500" />;
        if (type.includes('pdf')) return <FileText size={20} className="text-red-600" />;
        return <FileIcon size={20} className="text-blue-500" />; // <--- Använd FileIcon
    };

    const filteredDocs = safeDocuments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dokumenthantering</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* UPLOAD SECTION */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-indigo-600"/> Ladda upp fil
                    </h3>
                    <form onSubmit={onUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative group">
                            <input
                                id="file-upload"
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <Upload size={32} className="text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors"/>
                                <span className="text-sm font-bold text-gray-600 truncate max-w-[200px]">
                                    {uploadFile ? uploadFile.name : "Klicka eller dra fil hit"}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG (Max 10MB)</span>
                            </div>
                        </div>

                        <button
                            disabled={!uploadFile || isUploading}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                                !uploadFile || isUploading
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transform active:scale-95'
                            }`}
                        >
                            {isUploading ? 'Sparar...' : 'Spara fil'}
                        </button>
                    </form>
                </div>

                {/* LIST SECTION */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 bg-white border rounded-xl px-4 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow">
                            <Search size={18} className="text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Sök bland filer..."
                                className="w-full outline-none text-sm bg-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs border-b">
                            <tr>
                                <th className="p-4">Namn</th>
                                <th className="p-4 hidden sm:table-cell">Storlek</th>
                                <th className="p-4 hidden sm:table-cell">Datum</th>
                                <th className="p-4 text-right">Åtgärd</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 font-medium text-gray-900">
                                            <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                                                {getIcon(doc.type)}
                                            </div>
                                            <div>
                                                <div className="truncate max-w-[150px] sm:max-w-xs">{doc.name}</div>
                                                <div className="text-xs text-gray-400 sm:hidden">{doc.size} • {doc.date}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 font-mono text-xs hidden sm:table-cell">{doc.size}</td>
                                    <td className="p-4 text-gray-500 hidden sm:table-cell">{doc.date}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors" title="Ladda ner">
                                                <Download size={18}/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDoc(doc.id)}
                                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                title="Radera"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <FileIcon size={48} className="text-gray-200 mb-2"/> {/* <--- Använd FileIcon */}
                                            <p>Inga dokument hittades.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentManager;