import React, { useState, useEffect } from 'react';
import {
    Bot, Search, FileJson, Calendar, RefreshCcw, Eye, X,
    BrainCircuit, MessageSquare, Sparkles, AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

const AiAuditDashboard = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await api.ai.audit.getAll(page, 20);
            // Handle Spring Page response
            setLogs(Array.isArray(data) ? data : (data.content || []));
        } catch (e) {
            console.error("Failed to fetch AI audit logs", e);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('sv-SE', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const getActionIcon = (type) => {
        switch (type) {
            case 'ADAPTIVE_ANALYSIS': return <BrainCircuit size={16} className="text-purple-500" />;
            case 'CHAT_INTERACTION': return <MessageSquare size={16} className="text-blue-500" />;
            case 'CONTENT_GENERATION': return <Sparkles size={16} className="text-amber-500" />;
            default: return <Bot size={16} className="text-gray-500" />;
        }
    };

    const renderJson = (jsonStr) => {
        if (!jsonStr) return <span className="text-gray-400 italic">No output recorded</span>;
        try {
            const data = JSON.parse(jsonStr);
            return (
                <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-hidden">
                    <pre className="text-xs font-mono text-green-400 overflow-auto max-h-[400px]">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            );
        } catch (e) {
            return (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900">
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold mb-2">Raw Text Output (Non-JSON)</p>
                    <pre className="text-xs whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">{jsonStr}</pre>
                </div>
            );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Compliance Portal</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Inspektera alla AI-beslut och resonemang för regelefterlevnad.</p>
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

            {/* Table */}
            <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#282a2c] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50 dark:bg-[#131314] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#282a2c]">
                            <tr>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Tidpunkt</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Typ</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Användare (ID)</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Modell</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Resonemang (Trace)</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Inspektera</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#282a2c]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#282a2c] rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                        Inga AI-loggar hittades.
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            {getActionIcon(log.actionType)}
                                            {log.actionType}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        User #{log.actorId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                                            {log.modelId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-gray-500 dark:text-gray-400 italic">
                                        {log.reasoningTrace || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
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

            {/* Inspector Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end animate-in fade-in slide-in-from-right-4">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-4xl h-full shadow-2xl border-l border-gray-200 dark:border-[#3c4043] flex flex-col p-8 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                                    <BrainCircuit size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Decision Inspector</h3>
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

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-10">
                            {/* Reasoning Trace */}
                            {selectedLog.reasoningTrace && (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">
                                        <Sparkles size={14} />
                                        AI Reasoning Trace
                                    </h4>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                                        "{selectedLog.reasoningTrace}"
                                    </p>
                                </div>
                            )}

                            {/* Prompt (Input) */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                                    <span>Input Context (Prompt)</span>
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                        {selectedLog.inputContext?.length || 0} chars
                                    </span>
                                </h4>
                                <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-hidden">
                                    <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-auto max-h-[300px]">
                                        {selectedLog.inputContext}
                                    </pre>
                                </div>
                            </div>

                            {/* Response (Output) */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Output Result (JSON)</h4>
                                {renderJson(selectedLog.aiResponse)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiAuditDashboard;
