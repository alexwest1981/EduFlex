import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Download,
    BookOpen,
    Archive,
    FileSpreadsheet,
    FileType,
    ExternalLink,
    Clock,
    Folder,
    ShieldAlert,
    FileCheck,
    AlertCircle,
    User,
    Loader2,
    Settings,
    Save,
    Trash2,
    Eye
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import ReportGeneratorModal from './ReportGeneratorModal';

/**
 * Rapportarkiv med CSN-, GDPR- och allmänna rapporter.
 * CSN-fliken visar närvaro, aktivitetsdata och kursresultat per elev.
 * GDPR-fliken visar audit-loggar och registerutdrag.
 */
const ReportLibrary = () => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gdprLogs, setGdprLogs] = useState([]);
    const [generatedCsnData, setGeneratedCsnData] = useState(null);

    // GDPR Registerutdrag
    const [registerSearchId, setRegisterSearchId] = useState('');
    const [registerData, setRegisterData] = useState(null);
    const [registerLoading, setRegisterLoading] = useState(false);

    // CSN-inställningar
    const [csnSettings, setCsnSettings] = useState({
        'csn.school.code': '',
        'csn.municipality.code': '',
        'csn.default.education.type': 'KOMVUX',
        'csn.default.study.scope': '100'
    });
    const [csnSettingsLoading, setCsnSettingsLoading] = useState(false);
    const [csnSettingsSaving, setCsnSettingsSaving] = useState(false);

    const filteredReports = reports.filter(r =>
        (activeTab === 'ALL' || r.reportType === activeTab) &&
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchArchivedReports();
    }, []);

    useEffect(() => {
        if (activeTab === 'GDPR') {
            fetchGdprLogs();
        }
        if (activeTab === 'CSN') {
            fetchCsnSettings();
        }
    }, [activeTab]);

    const fetchArchivedReports = async () => {
        try {
            const response = await api.get('/reports/archive');
            setReports(response || []);
        } catch (error) {
            console.error('Failed to fetch archived reports', error);
        }
    };

    const openArchivedReport = async (report) => {
        if (report.format !== 'JSON') {
            toast('XML- och Excel-rapporter laddas ned direkt och sparas inte i arkivet.', { icon: 'ℹ️' });
            return;
        }
        try {
            const full = await api.get(`/reports/archive/${report.id}`);
            const data = JSON.parse(full.dataJson);
            setGeneratedCsnData(data);
            setActiveTab('CSN');
            toast.success(`Rapport öppnad: ${report.title}`);
        } catch (error) {
            console.error('Failed to open archived report', error);
            toast.error('Kunde inte öppna rapporten');
        }
    };

    const deleteArchivedReport = async (report, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/reports/archive/${report.id}`);
            setReports(prev => prev.filter(r => r.id !== report.id));
            toast.success('Rapport borttagen');
        } catch (error) {
            console.error('Failed to delete report', error);
            toast.error('Kunde inte ta bort rapporten');
        }
    };

    const fetchGdprLogs = async () => {
        try {
            const response = await api.get('/reports/gdpr/audit-logs');
            setGdprLogs(response || []);
        } catch (error) {
            console.error('Failed to fetch GDPR logs', error);
            toast.error('Kunde inte hämta GDPR-loggar');
        }
    };

    const fetchCsnSettings = async () => {
        setCsnSettingsLoading(true);
        try {
            const all = await api.get('/settings');
            const keys = Object.keys(csnSettings);
            const updates = {};
            keys.forEach(key => {
                const found = all.find(s => s.settingKey === key);
                if (found) updates[key] = found.settingValue || '';
            });
            setCsnSettings(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error('Failed to fetch CSN settings', error);
        } finally {
            setCsnSettingsLoading(false);
        }
    };

    const saveCsnSettings = async () => {
        setCsnSettingsSaving(true);
        try {
            await Promise.all(
                Object.entries(csnSettings).map(([key, value]) =>
                    api.put(`/settings/${key}`, { value })
                )
            );
            toast.success('CSN-inställningar sparade');
        } catch (error) {
            console.error('Failed to save CSN settings', error);
            toast.error('Kunde inte spara CSN-inställningar');
        } finally {
            setCsnSettingsSaving(false);
        }
    };

    const fetchRegisterExtract = async () => {
        if (!registerSearchId) {
            toast.error('Ange ett student-ID');
            return;
        }
        setRegisterLoading(true);
        try {
            const response = await api.get(`/reports/gdpr/student/${registerSearchId}`);
            setRegisterData(response);
            toast.success('Registerutdrag hämtat');
        } catch (error) {
            console.error('Register extract failed', error);
            toast.error('Kunde inte hämta registerutdrag');
        } finally {
            setRegisterLoading(false);
        }
    };

    const downloadCsv = (data, filename) => {
        if (!data || data.length === 0) return;

        // Anpassade svenska rubriker
        const headerMap = {
            studentName: 'Elev',
            ssn: 'Personnummer',
            courseName: 'Kursnamn',
            courseCode: 'Kurskod',
            totalLessons: 'Totalt Lektioner',
            attendedLessons: 'Närvarade Lektioner',
            attendancePercentage: 'Närvaro %',
            lastLogin: 'Senaste Inloggning',
            lastActive: 'Senast Aktiv',
            activeMinutes: 'Aktiva Minuter',
            courseResult: 'Kursresultat'
        };

        const keys = Object.keys(headerMap);
        const headers = keys.map(k => headerMap[k]).join(',');
        const rows = data.map(obj =>
            keys.map(k => {
                const val = obj[k];
                if (val === null || val === undefined) return '';
                // Escape kommatecken i strängar
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
            }).join(',')
        ).join('\n');
        const csvContent = `\uFEFF${headers}\n${rows}`; // BOM för korrekt encoding i Excel

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

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'Aldrig';
        const date = new Date(dateStr);
        return date.toLocaleDateString('sv-SE') + ' ' + date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Rapportarkiv</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bibliotek • CSN • GDPR • Insyn</p>
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
                <div className="space-y-6">
                    {/* GDPR Audit Loggar */}
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

                    {/* GDPR Registerutdrag (Art. 15) */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">Registerutdrag (Art. 15)</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All sparad persondata per elev – GDPR</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="number"
                                placeholder="Ange Student-ID"
                                value={registerSearchId}
                                onChange={(e) => setRegisterSearchId(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-3.5 text-sm font-bold shadow-inner focus:ring-2 ring-amber-500 transition-all"
                            />
                            <button
                                onClick={fetchRegisterExtract}
                                disabled={registerLoading}
                                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
                            >
                                {registerLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                                Hämta
                            </button>
                        </div>

                        {registerData && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-3">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">
                                    Registerutdrag för: {registerData.firstName} {registerData.lastName}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {Object.entries(registerData).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key}</span>
                                            <span className="font-bold text-gray-900 dark:text-white truncate">
                                                {value !== null && value !== undefined ? String(value) : '—'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'CSN' ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* CSN Hero-sektion */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-100 dark:shadow-none flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black">CSN Rapportering</h2>
                            <p className="text-indigo-100 font-bold text-sm max-w-lg opacity-80">
                                Generera fullständiga närvarorapporter för CSN med aktivitetsdata, kursresultat och exportfunktion.
                                Välj en eller flera kurser och tidsperiod.
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

                    {/* CSN-inställningar */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl text-violet-600">
                                <Settings size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black">CSN-inställningar</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skolkod och kommunkod för XML-rapporter</p>
                            </div>
                        </div>

                        {csnSettingsLoading ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="animate-spin text-violet-400" size={24} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Skolkod (CSN)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="T.ex. 1234"
                                            value={csnSettings['csn.school.code']}
                                            onChange={e => setCsnSettings(p => ({ ...p, 'csn.school.code': e.target.value }))}
                                            maxLength={5}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-violet-500 transition-all"
                                        />
                                        <p className="text-[10px] text-gray-400 font-bold ml-1">4–5 siffror, tilldelas av CSN</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Kommunkod
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="T.ex. 1280"
                                            value={csnSettings['csn.municipality.code']}
                                            onChange={e => setCsnSettings(p => ({ ...p, 'csn.municipality.code': e.target.value }))}
                                            maxLength={4}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-violet-500 transition-all"
                                        />
                                        <p className="text-[10px] text-gray-400 font-bold ml-1">4 siffror – läns- och kommunkod</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Standard utbildningstyp
                                        </label>
                                        <select
                                            value={csnSettings['csn.default.education.type']}
                                            onChange={e => setCsnSettings(p => ({ ...p, 'csn.default.education.type': e.target.value }))}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-violet-500 transition-all"
                                        >
                                            <option value="KOMVUX">Komvux</option>
                                            <option value="YH">Yrkeshögskola (YH)</option>
                                            <option value="HOGSKOLA">Högskola</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Standard studietakt
                                        </label>
                                        <select
                                            value={csnSettings['csn.default.study.scope']}
                                            onChange={e => setCsnSettings(p => ({ ...p, 'csn.default.study.scope': e.target.value }))}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-violet-500 transition-all"
                                        >
                                            <option value="100">100% – Heltid</option>
                                            <option value="75">75%</option>
                                            <option value="50">50% – Halvtid</option>
                                            <option value="25">25%</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={saveCsnSettings}
                                        disabled={csnSettingsSaving}
                                        className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                                    >
                                        {csnSettingsSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Spara inställningar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CSN-resultat med nya kolumner */}
                    {generatedCsnData && (
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black">Senaste Resultat ({generatedCsnData.length} elever)</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => downloadCsv(generatedCsnData, `CSN_Report_${new Date().toISOString().split('T')[0]}.csv`)}
                                        className="flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all"
                                    >
                                        <Download size={16} />
                                        Hämta CSV
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-bold">
                                    <thead>
                                        <tr className="text-gray-400 uppercase text-[10px] tracking-widest border-b border-gray-100 dark:border-gray-800">
                                            <th className="pb-4 pl-2">Elev</th>
                                            <th className="pb-4">Personnr (SSN)</th>
                                            <th className="pb-4">Kurs</th>
                                            <th className="pb-4 text-center">Närvaro %</th>
                                            <th className="pb-4 text-center">Lektioner</th>
                                            <th className="pb-4 text-center">Senaste Inlogg</th>
                                            <th className="pb-4 text-center">Aktiva min</th>
                                            <th className="pb-4 text-center">Resultat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {generatedCsnData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="py-4 pl-2">{row.studentName}</td>
                                                <td className="py-4 font-mono text-gray-500">{row.ssn || 'Saknas'}</td>
                                                <td className="py-4 text-gray-500">
                                                    <div>{row.courseName}</div>
                                                    {row.courseCode && <div className="text-[10px] text-gray-400">{row.courseCode}</div>}
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] ${row.attendancePercentage < 50 ? 'bg-red-50 text-red-600' :
                                                        row.attendancePercentage < 80 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                                        {row.attendancePercentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center text-gray-400">{row.attendedLessons} / {row.totalLessons}</td>
                                                <td className="py-4 text-center text-gray-400 text-xs">{formatDateTime(row.lastLogin)}</td>
                                                <td className="py-4 text-center">
                                                    <span className="text-xs font-bold">{row.activeMinutes || 0} min</span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${row.courseResult === 'PASSED' ? 'bg-green-50 text-green-600' :
                                                        row.courseResult === 'FAILED' ? 'bg-red-50 text-red-600' :
                                                            'bg-gray-100 text-gray-500'}`}>
                                                        {row.courseResult === 'PASSED' ? 'Godkänd' :
                                                            row.courseResult === 'FAILED' ? 'Underkänd' : 'Ej bedömd'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {filteredReports.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <Archive size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-black">Inga rapporter i arkivet</p>
                            <p className="text-xs mt-1">Generera en CSN-rapport så sparas den automatiskt här.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => openArchivedReport(report)}
                                className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group flex flex-col justify-between cursor-pointer"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:scale-110 transition-transform">
                                            {getIcon(report.reportType)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                                                report.format === 'JSON' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                                                report.format === 'XML'  ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20' :
                                                                           'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                            }`}>
                                                {report.format}
                                            </span>
                                            <button
                                                onClick={(e) => deleteArchivedReport(report, e)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                                                title="Ta bort"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors text-sm leading-snug">
                                        {report.title}
                                    </h3>
                                    {report.educationType && (
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            {report.educationType}
                                        </p>
                                    )}

                                    <div className="space-y-1.5 mt-4 text-[10px] font-bold text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Clock size={11} />
                                            {new Date(report.createdAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                        {report.periodStart && (
                                            <div className="flex items-center gap-2">
                                                <FileType size={11} />
                                                {report.periodStart} → {report.periodEnd}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <User size={11} />
                                            {report.rowCount} elev{report.rowCount !== 1 ? 'er' : ''} · {report.generatedBy}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all text-xs">
                                    {report.format === 'JSON' ? <Eye size={14} /> : <Download size={14} />}
                                    {report.format === 'JSON' ? 'Öppna rapport' : 'Återgenerera för nedladdning'}
                                </div>
                            </div>
                        ))}

                        {/* Knapp för att generera ny rapport */}
                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors min-h-[220px]"
                        >
                            <div className="p-4 bg-white dark:bg-indigo-900/20 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                                <Archive size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900 dark:text-indigo-200">Ny Rapport</h4>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">Generera sammanställning</p>
                            </div>
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
                    // Uppdatera arkivet i bakgrunden så nyaste rapporten syns direkt
                    fetchArchivedReports();
                }}
            />

            {/* Samlingar */}
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
