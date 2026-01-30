import React, { useState, useEffect } from 'react';
import {
    History, Search, Filter, Eye, User, Calendar,
    ArrowRight, ChevronDown, ChevronUp, Database,
    FileJson, RefreshCcw, X
} from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

const AuditLogDashboard = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterEntity, setFilterEntity] = useState('ALL');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await api.admin.getAuditLogs({
                user: searchTerm,
                action: filterAction === 'ALL' ? '' : filterAction,
                entity: filterEntity === 'ALL' ? '' : filterEntity
            });
            setLogs(data || []);
        } catch (e) {
            console.error("Failed to fetch audit logs", e);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATED': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
            case 'UPDATED': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
            case 'DELETED': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('sv-SE', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const renderJson = (jsonStr) => {
        if (!jsonStr) return <span className="text-gray-400 italic">No data available</span>;
        try {
            const data = JSON.parse(jsonStr);
            return (
                <pre className="bg-gray-50 dark:bg-[#131314] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043] text-xs font-mono overflow-auto max-h-[400px] text-gray-800 dark:text-gray-300">
                    {JSON.stringify(data, null, 2)}
                </pre>
            );
        } catch (e) {
            return <pre className="text-red-500 text-xs">{jsonStr}</pre>;
        }
    };

    const inputClass = "px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm";

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Loggar</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Övervaka systemförändringar och användaraktivitet.</p>
                    </div>
                </div>
                <button
                    onClick={() => { setIsRefreshing(true); fetchLogs(); }}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#3c4043] transition-all"
                >
                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    Uppdatera
                </button>
            </div>

            {/* Filter Bar */}
            <form onSubmit={handleSearch} className="bg-gray-50 dark:bg-[#131314] p-4 rounded-2xl border border-gray-200 dark:border-[#3c4043] flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        placeholder="Sök användare..."
                        className={inputClass + " pl-9 w-full"}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <select className={inputClass} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
                    <option value="ALL">Alla Händelser</option>
                    <option value="CREATED">Skapad</option>
                    <option value="UPDATED">Uppdaterad</option>
                    <option value="DELETED">Borttagen</option>
                </select>

                <select className={inputClass} value={filterEntity} onChange={e => setFilterEntity(e.target.value)}>
                    <option value="ALL">Alla Entiteter</option>
                    <option value="User">Användare</option>
                    <option value="Course">Kurs</option>
                    <option value="Ebook">E-bok</option>
                    <option value="Cmi5Package">cmi5 Paket</option>
                    <option value="Document">Dokument</option>
                </select>

                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors">
                    Filtrera
                </button>
            </form>

            {/* Table Area */}
            <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#282a2c] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50 dark:bg-[#131314] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#282a2c]">
                            <tr>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Tidpunkt</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Användare</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Händelse</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Entitet</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Detaljer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#282a2c]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#282a2c] rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <Database size={40} className="opacity-20" />
                                            Inga loggar hittades.
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-[#131314]/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="opacity-50" />
                                            {formatDate(log.timestamp)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                                                {log.modifiedBy?.substring(0, 1).toUpperCase() || 'S'}
                                            </div>
                                            {log.modifiedBy}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 dark:text-white font-medium">{log.entityName}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">#{log.entityId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                            title="Visa detaljer"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal / Slide-over */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end animate-in fade-in slide-in-from-right-4">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl h-full shadow-2xl border-l border-gray-200 dark:border-[#3c4043] flex flex-col p-8 overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${getActionColor(selectedLog.action)}`}>
                                    <FileJson size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Händelsedetaljer</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Log ID: #{selectedLog.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-full transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#3c4043]">
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Användare</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{selectedLog.modifiedBy}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#3c4043]">
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Tidpunkt</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{formatDate(selectedLog.timestamp)}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#3c4043]">
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Entitetstyp</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{selectedLog.entityName}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#3c4043]">
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Entity ID</span>
                                    <span className="text-gray-900 dark:text-white font-mono">#{selectedLog.entityId}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ArrowRight size={16} className="text-indigo-500" />
                                        Datatillstånd vid händelse
                                    </h4>
                                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">SNAP-SHOT</span>
                                </div>
                                {renderJson(selectedLog.changeData)}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#3c4043] flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 shadow-lg"
                            >
                                Stäng vy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogDashboard;
