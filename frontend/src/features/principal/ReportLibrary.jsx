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
    Folder
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ReportLibrary = () => {
    const [reports, setReports] = useState([
        { id: 1, title: 'Terminsrapport HT25', type: 'ACADEMIC', date: '2025-12-20', size: '2.4 MB', author: 'System' },
        { id: 2, title: 'Kvalitetsanalys Q4', type: 'QUALITY', date: '2026-01-15', size: '1.8 MB', author: 'Gert Lundgren' },
        { id: 3, title: 'Ekonomisk översikt Jan', type: 'FINANCE', date: '2026-02-01', size: '540 KB', author: 'Ekobyrån' },
        { id: 4, title: 'Likabehandlingsplan 2026', type: 'POLICY', date: '2026-01-05', size: '3.2 MB', author: 'EHT-Team' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');

    const filteredReports = reports.filter(r =>
        (activeTab === 'ALL' || r.type === activeTab) &&
        (r.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIcon = (type) => {
        switch (type) {
            case 'ACADEMIC': return <FileText className="text-blue-500" />;
            case 'FINANCE': return <FileSpreadsheet className="text-emerald-500" />;
            case 'POLICY': return <BookOpen className="text-purple-500" />;
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
                {['ALL', 'ACADEMIC', 'QUALITY', 'FINANCE', 'POLICY'].map(tab => (
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
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-indigo-100 transition-colors">
                    <div className="p-4 bg-white dark:bg-indigo-900/20 rounded-full text-indigo-600">
                        <Archive size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-indigo-900 dark:text-indigo-200">Ny Rapport</h4>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">Generera sammanställning</p>
                    </div>
                </div>
            </div>

            {/* Collections / Folders */}
            <div className="space-y-4">
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
