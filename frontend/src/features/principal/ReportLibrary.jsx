import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Download,
    Filter,
    BookOpen,
    Archive,
    FileSpreadsheet,
    FileType,
    ExternalLink,
    Clock,
    Folder,
    ShieldAlert,
    FileCheck,
    AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import ReportGeneratorModal from './ReportGeneratorModal';

const ReportLibrary = () => {
    const [reports, setReports] = useState([
        { id: 1, title: 'Terminsrapport HT25', type: 'ACADEMIC', date: '2025-12-20', size: '2.4 MB', author: 'System' },
        { id: 2, title: 'Kvalitetsanalys Q4', type: 'QUALITY', date: '2026-01-15', size: '1.8 MB', author: 'Gert Lundgren' },
        { id: 3, title: 'Ekonomisk översikt Jan', type: 'FINANCE', date: '2026-02-01', size: '540 KB', author: 'Ekobyrån' },
        { id: 4, title: 'Likabehandlingsplan 2026', type: 'POLICY', date: '2026-01-05', size: '3.2 MB', author: 'EHT-Team' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gdprLogs, setGdprLogs] = useState([]);
    const [generatedCsnData, setGeneratedCsnData] = useState(null);

    const filteredReports = reports.filter(r =>
        (activeTab === 'ALL' || r.type === activeTab) &&
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (activeTab === 'GDPR') {
            fetchGdprLogs();
        }
    }, [activeTab]);

    const fetchGdprLogs = async () => {
        try {
            const response = await api.get('/reports/gdpr/audit-logs');
            setGdprLogs(response || []);
        } catch (error) {
            console.error('Failed to fetch GDPR logs', error);
            toast.error('Kunde inte hämta GDPR-loggar');
        }
    };

    const downloadCsv = (data, filename) => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csvContent = `${headers}\n${rows}`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ACADEMIC': return <FileText className="text-blue-500" />;
            case 'FINANCE': return <FileSpreadsheet className="text-emerald-500" />;
            case 'POLICY': return <BookOpen className="text-purple-500" />;
            case 'CSN': return <FileCheck className="text-indigo-500" />;
            case 'GDPR': return <ShieldAlert className="text-rose-500" />;
            default: return <Archive className="text-gray-400" />;
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Rapportarkiv</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bibliotek • Dokumentation • Insyn</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                        <input
                            placeholder="Sök rapporter..."
                            className="w-full bg-white dark:bg-[#1c1c1e] border-none rounded-2xl pl-12 pr-4 py-3 text-sm shadow-sm focus:ring-2 ring-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['ALL', 'ACADEMIC', 'QUALITY', 'FINANCE', 'POLICY', 'CSN', 'GDPR'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                            : 'bg-white dark:bg-[#1c1c1e] text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab === 'ALL' ? 'Alla' : tab}
                    </button>
                ))}
            </div>

            {activeTab === 'GDPR' ? (
                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">GDPR Audit Loggar</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spårbarhet för känslig personuppgifts-åtkomst</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm font-bold">
                            <thead>
                                <tr className="text-gray-400 uppercase text-[10px] tracking-widest border-b border-gray-100 dark:border-gray-800">
                                    <th className="pb-4 pl-2">Tidpunkt</th>
                                    <th className="pb-4">Aktion</th>
                                    <th className="pb-4">Användare</th>
                                    <th className="pb-4">Entitet</th>
                                    <th className="pb-4">Detaljer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {gdprLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4 pl-2 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="py-4">
                                            <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-3 py-1 rounded-lg text-[10px] uppercase">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4">{log.modifiedBy}</td>
                                        <td className="py-4">{log.entityName} #{log.entityId}</td>
                                        <td className="py-4 text-[10px] text-gray-400 font-mono truncate max-w-[200px]">{log.changeData}</td>
                                    </tr>
                                ))}
                                {gdprLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-gray-400 font-bold">Inga GDPR-loggar hittades</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'CSN' ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-100 dark:shadow-none flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black">CSN Rapportering</h2>
                            <p className="text-indigo-100 font-bold text-sm max-w-lg opacity-80">
                                Generera officiella närvaro-sammanställningar för svenska myndighetskrav.
                                Välj kurs och tidsperiod för att sammanställa elevers närvarograd.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                            >
                                Generera ny rapport
                            </button>
                        </div>
                        <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20">
                            <FileCheck size={80} strokeWidth={1.5} />
                        </div>
                    </div>

                    {generatedCsnData && (
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black">Senaste Resultat ({generatedCsnData.length} elever)</h3>
                                <button
                                    onClick={() => downloadCsv(generatedCsnData, `CSN_Report_${new Date().toISOString().split('T')[0]}.csv`)}
                                    className="flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                    <Download size={16} />
                                    Hämta CSV-fil
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-bold">
                                    <thead>
                                        <tr className="text-gray-400 uppercase text-[10px] tracking-widest border-b border-gray-100 dark:border-gray-800">
                                            <th className="pb-4 pl-2">Elev</th>
                                            <th className="pb-4">Personnr (SSN)</th>
                                            <th className="pb-4 text-center">Närvaro %</th>
                                            <th className="pb-4 text-center">Lektioner (Närv/Tot)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {generatedCsnData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="py-4 pl-2">{row.studentName}</td>
                                                <td className="py-4 font-mono text-gray-500">{row.ssn || 'Saknas'}</td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] ${row.attendancePercentage < 80 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                                        {row.attendancePercentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center text-gray-400">{row.attendedLessons} / {row.totalLessons}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredReports.map((report) => (
                        <div key={report.id} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:scale-110 transition-transform">
                                        {getIcon(report.type)}
                                    </div>
                                    <button className="text-gray-300 hover:text-indigo-600">
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                                <h3 className="font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{report.title}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{report.type}</p>

                                <div className="space-y-2 mt-4 text-[10px] font-bold text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} /> {report.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileType size={12} /> {report.size}
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all text-xs">
                                <Download size={14} />
                                Hämta PDF
                            </button>
                        </div>
                    ))}

                    {/* Template for generating new reports */}
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                        <div className="p-4 bg-white dark:bg-indigo-900/20 rounded-full text-indigo-600">
                            <Archive size={32} />
                        </div>
                        <div>
                            <h4 className="font-black text-indigo-900 dark:text-indigo-200">Ny Rapport</h4>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase">Generera sammanställning</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            <ReportGeneratorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGenerated={(data) => {
                    setGeneratedCsnData(data);
                    setActiveTab('CSN');
                }}
            />

            {/* Collections / Folders */}
            <div className="space-y-4 pt-8">
                <h2 className="text-lg font-black flex items-center gap-2">
                    <Folder className="text-amber-500" size={20} />
                    Samlingar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Nationalprov 2025', 'Policy-dokument', 'Elevvårdsarkiv'].map(col => (
                        <div key={col} className="bg-white dark:bg-[#1c1c1e] p-5 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-gray-800 shadow-sm hover:border-indigo-200 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <Archive className="text-gray-400 group-hover:text-indigo-500" size={20} />
                                <span className="text-sm font-bold">{col}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">12</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportLibrary;
