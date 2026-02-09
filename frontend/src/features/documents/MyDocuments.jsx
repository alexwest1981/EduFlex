import React, { useState, useEffect } from 'react';
import { Award, FileText, Download, ExternalLink, Shield, Calendar, Search, BookOpen, GraduationCap, FolderOpen } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import { useAppContext } from '../../context/AppContext';

const MyDocuments = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('grades'); // grades, merits, manuals
    const [loading, setLoading] = useState(false);

    // Data states
    const [grades, setGrades] = useState([]);
    const [merits, setMerits] = useState([]);
    const [manuals, setManuals] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab, currentUser.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'grades') {
                const data = await api.courses.getMyResults(currentUser.id);
                setGrades(data || []);
            } else if (activeTab === 'merits') {
                const data = await api.documents.getMerits(currentUser.id);
                setMerits(data || []);
            } else if (activeTab === 'manuals') {
                const data = await api.documents.getSystemDocs();
                setManuals(data || []);
            }
        } catch (error) {
            console.error(`Failed to load ${activeTab}`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (doc) => {
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getIcon = (type) => {
        if (type === 'CERTIFICATE') return <Award className="text-amber-500" size={24} />;
        if (type === 'TRANSCRIPT') return <FileText className="text-blue-500" size={24} />;
        if (type === 'MANUAL') return <BookOpen className="text-indigo-500" size={24} />;
        return <Shield className="text-indigo-500" size={24} />;
    };

    const filteredData = (data) => {
        if (!searchTerm) return data;
        const lower = searchTerm.toLowerCase();
        return data.filter(item => {
            if (activeTab === 'grades') {
                return (item.courseName?.toLowerCase().includes(lower) ||
                    item.courseCode?.toLowerCase().includes(lower));
            }
            return item.fileName?.toLowerCase().includes(lower);
        });
    };

    const renderGrades = () => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kurs</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kod</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Betyg</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Datum</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData(grades).length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                    Inga betyg registrerade ännu.
                                </td>
                            </tr>
                        ) : (
                            filteredData(grades).map((grade, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{grade.courseName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600">
                                            {grade.courseCode}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm
                                            ${grade.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                grade.grade === 'B' ? 'bg-green-100 text-green-700' :
                                                    grade.grade === 'C' ? 'bg-lime-100 text-lime-700' :
                                                        grade.grade === 'D' ? 'bg-yellow-100 text-yellow-700' :
                                                            grade.grade === 'E' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-red-100 text-red-700'}`}>
                                            {grade.grade}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                        {formatDate(grade.date)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                            <Shield size={12} />
                                            Verifierat
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDocumentGrid = (docs, emptyMessage) => (
        <>
            {filteredData(docs).length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <FolderOpen size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Inga dokument hittades</h3>
                    <p className="text-gray-500 max-w-md mx-auto">{emptyMessage}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData(docs).map((doc) => (
                        <div key={doc.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-indigo-100/50 transition-colors" />

                            <div className="flex items-start gap-4 relative">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all">
                                    {getIcon(activeTab === 'manuals' ? 'MANUAL' : doc.category || 'CERTIFICATE')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 leading-tight mb-1 truncate group-hover:text-indigo-600 transition-colors" title={doc.fileName}>
                                        {doc.fileName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                        <Calendar size={12} />
                                        <span>{doc.uploadedAt ? formatDate(doc.uploadedAt) : 'N/A'}</span>
                                    </div>
                                    {doc.description && (
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{doc.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                                >
                                    <Download size={16} /> Ladda ner
                                </button>
                                <button
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                    className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    title="Öppna"
                                >
                                    <ExternalLink size={18} />
                                </button>
                            </div>

                            {activeTab === 'merits' && (
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-black text-emerald-600">
                                        <Shield size={10} /> Verifierat
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">ID: {doc.id.toString().padStart(6, '0')}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <FolderOpen size={28} />
                        </div>
                        Mina Dokument
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">
                        Dina betyg, intyg och viktig dokumentation samlat på ett ställe.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Sök dokument..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full md:w-64 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('grades')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all relative top-0.5
                        ${activeTab === 'grades'
                            ? 'bg-white text-indigo-600 border border-gray-200 border-b-white z-10'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'}`}
                >
                    <GraduationCap size={18} />
                    Mina Betyg
                </button>
                <button
                    onClick={() => setActiveTab('merits')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all relative top-0.5
                        ${activeTab === 'merits'
                            ? 'bg-white text-indigo-600 border border-gray-200 border-b-white z-10'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'}`}
                >
                    <Award size={18} />
                    Mina Intyg
                </button>
                <button
                    onClick={() => setActiveTab('manuals')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all relative top-0.5
                        ${activeTab === 'manuals'
                            ? 'bg-white text-indigo-600 border border-gray-200 border-b-white z-10'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'}`}
                >
                    <BookOpen size={18} />
                    Dokumentbank
                </button>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in duration-300">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-gray-500 animate-pulse">Hämtar information...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'grades' && renderGrades()}
                        {activeTab === 'merits' && renderDocumentGrid(merits, 'Här kommer dina kursbevis och intyg att visas när de är utfärdade.')}
                        {activeTab === 'manuals' && renderDocumentGrid(manuals, 'Inga gemensamma dokument tillgängliga just nu.')}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyDocuments;
