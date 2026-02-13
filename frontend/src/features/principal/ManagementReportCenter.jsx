import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Calendar,
    Search,
    Clock,
    ChevronRight,
    Download,
    Trash2,
    Eye,
    Loader2,
    CheckCircle,
    AlertCircle,
    BarChart
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const ManagementReportCenter = () => {
    const { currentUser } = useAppContext();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newReportData, setNewReportData] = useState({
        period: 'VT 2026',
        title: ''
    });

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await api.get('/reports');
            setReports(data);
        } catch (err) {
            console.error(err);
            toast.error("Kunde inte ladda rapporter");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!newReportData.period) {
            toast.error("Vänligen ange en period");
            return;
        }

        setGenerating(true);
        try {
            const report = await api.post('/reports/generate', {
                ...newReportData,
                authorId: currentUser.id
            });
            toast.success("Rapport genererad!");
            setReports([report, ...reports]);
            setSelectedReport(report);
            setShowNewModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Generering misslyckades");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Är du säker på att du vill ta bort denna rapport?")) return;

        try {
            await api.delete(`/reports/${id}`);
            setReports(reports.filter(r => r.id !== id));
            if (selectedReport?.id === id) setSelectedReport(null);
            toast.success("Rapport borttagen");
        } catch (err) {
            toast.error("Kunde inte ta bort rapport");
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
            {/* Left Sidebar: Archive */}
            <div className="w-80 bg-white dark:bg-[#1c1c1e] rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col shadow-sm">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">Arkiv</h2>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            placeholder="Sök i arkivet..."
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : reports.length === 0 ? (
                        <div className="text-center p-8">
                            <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inga rapporter än</p>
                        </div>
                    ) : reports.map(report => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border group ${selectedReport?.id === report.id
                                ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'
                                : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`text-sm font-black truncate max-w-[180px] ${selectedReport?.id === report.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                                    {report.title}
                                </h3>
                                <button onClick={(e) => handleDelete(report.id, e)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <Calendar size={10} /> {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${report.status === 'FINAL' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {report.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content: Report Viewer */}
            <div className="flex-1 bg-white dark:bg-[#1c1c1e] rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col shadow-sm overflow-hidden">
                {!selectedReport ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                            <BarChart size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Välj en rapport</h2>
                        <p className="text-gray-500 max-w-sm font-medium">
                            Välj en rapport från arkivet för att läsa analysen eller generera en ny för att få insikter om skolans status.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{selectedReport.title}</h1>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                        <Clock size={14} /> {selectedReport.period}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">•</span>
                                    <span className="text-xs text-gray-400 font-medium">Författare: {selectedReport.author?.fullName || 'System'}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                    <Download size={16} /> Exportera PDF
                                </button>
                                {selectedReport.status === 'DRAFT' && (
                                    <button
                                        onClick={async () => {
                                            const updated = await api.patch(`/reports/${selectedReport.id}/status`, { status: 'FINAL' });
                                            setReports(reports.map(r => r.id === updated.id ? updated : r));
                                            setSelectedReport(updated);
                                            toast.success("Rapport arkiverad som slutgiltig");
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                                    >
                                        <CheckCircle size={16} /> Slutför & Arkivera
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 prose dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight custom-scrollbar">
                            <ReactMarkdown>{selectedReport.content}</ReactMarkdown>

                            {/* Raw Data Snapshot (Collapsible) */}
                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 pb-12">
                                <details className="group">
                                    <summary className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-indigo-500 transition-colors list-none">
                                        <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                        Visa underliggande data-snapshot
                                    </summary>
                                    <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                        <pre className="text-[10px] text-gray-500 overflow-x-auto">
                                            {JSON.stringify(JSON.parse(selectedReport.dataSnapshot || '{}'), null, 2)}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal: New Report */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !generating && setShowNewModal(false)}></div>
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-0">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                                <Plus size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Ny ledningsrapport</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">AI kommer att analysera all systemdata för att skapa rapporten.</p>
                        </div>

                        <div className="p-8 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Period (t.ex. VT 2026 / Vecka 12)</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                    value={newReportData.period}
                                    onChange={(e) => setNewReportData({ ...newReportData, period: e.target.value })}
                                    placeholder="VT 2026"
                                    disabled={generating}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Titel (Valfri)</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                    value={newReportData.title}
                                    onChange={(e) => setNewReportData({ ...newReportData, title: e.target.value })}
                                    placeholder="Lämna tom för autogenererad"
                                    disabled={generating}
                                />
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl flex gap-3 border border-amber-100 dark:border-amber-900/30">
                                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                                    Detta kan ta upp till 30 sekunder. AI:n sammanställer data från SKA, elevhälsa, närvaro och betyg.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex gap-4 mt-4">
                            <button
                                onClick={() => setShowNewModal(false)}
                                disabled={generating}
                                className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-100 dark:border-gray-600"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                {generating ? <><Loader2 className="animate-spin" size={18} /> Genererar...</> : 'Börja generera'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagementReportCenter;
