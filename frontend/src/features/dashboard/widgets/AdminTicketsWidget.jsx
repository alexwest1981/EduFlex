import React, { useState, useEffect } from 'react';
import { BadgeAlert, ArrowRight, AlertCircle, AlertTriangle, Clock, Shield, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';

const AdminTicketsWidget = ({ onManage }) => {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await api.support.getAllTickets();
                // Filter open tickets and sort them
                const openTickets = data
                    .filter(t => t.status !== 'RESOLVED')
                    .sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99));
                setTickets(openTickets);
            } catch (e) {
                console.error("Kunde inte hämta ärenden", e);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
        const interval = setInterval(fetchTickets, 30000);
        return () => clearInterval(interval);
    }, []);

    const stats = {
        total: tickets.length,
        critical: tickets.filter(t => t.severity === 'CRITICAL').length,
        high: tickets.filter(t => t.severity === 'HIGH').length,
        medium: tickets.filter(t => t.severity === 'MEDIUM').length,
        low: tickets.filter(t => t.severity === 'LOW').length
    };

    if (loading) return (
        <div className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm h-full flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full animate-in slide-in-from-bottom-8">
            {/* STATS HEADER (Matches AdminStats style) */}
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('widgets.tickets.active')}</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{stats.total}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stats.critical > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
                        <BadgeAlert size={24} />
                    </div>
                </div>

                {/* BREAKDOWN (Matches AdminStats style) */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('widgets.tickets.critical')}>
                        <AlertTriangle size={11} className="text-red-500" /> {stats.critical} K
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('widgets.tickets.high')}>
                        <Shield size={11} className="text-orange-500" /> {stats.high} H
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('widgets.tickets.medium')}>
                        <AlertCircle size={11} className="text-yellow-500" /> {stats.medium} M
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('widgets.tickets.low')}>
                        <Clock size={11} className="text-green-500" /> {stats.low} L
                    </div>
                </div>
            </div>

            {/* TICKET LIST (Matches RecentUsersWidget style) */}
            <div className="px-6 pb-6 flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-100 dark:border-[#3c4043]">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('widgets.tickets.open')}</h4>
                    <button onClick={onManage} className="text-[10px] font-black uppercase text-indigo-600 hover:underline flex items-center gap-1">
                        {t('dashboard.manage')} <ArrowRight size={10} />
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                    {tickets.length > 0 ? tickets.map((t) => (
                        <div key={t.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043] hover:border-indigo-200 transition-colors cursor-pointer group" onClick={onManage}>
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${t.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' :
                                t.severity === 'HIGH' ? 'bg-orange-500' :
                                    t.severity === 'MEDIUM' ? 'bg-yellow-400' :
                                        'bg-green-500'
                                }`} />
                            <div className="overflow-hidden flex-1">
                                <div className="flex justify-between items-start mb-0.5">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                        {t.category}
                                    </p>
                                    <span className="text-[8px] font-black text-gray-400 uppercase ml-2 shrink-0">#{t.id}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                                    "{t.message}"
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase">
                                        <User size={8} /> {t.userName || t('common.unknown')}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    <div className="text-[8px] font-black text-gray-400 uppercase">
                                        {new Date(t.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Clock size={32} className="text-gray-200 mb-2" />
                            <p className="text-xs text-gray-400 italic">{t('widgets.tickets.empty')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTicketsWidget;
