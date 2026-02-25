import React, { useState, useEffect } from 'react';
import {
    GraduationCap, CheckCircle, AlertCircle, Users, BarChart2,
    Clock, Loader2, RefreshCw, ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    DRAFT:     { label: 'Utkast',         color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
    ACTIVE:    { label: 'Aktiv',          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    REVISED:   { label: 'Under revision', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    COMPLETED: { label: 'Avslutad',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ARCHIVED:  { label: 'Arkiverad',      color: 'bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600' },
};

const PrincipalIspOverview = () => {
    const [plans, setPlans] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansData, statsData] = await Promise.all([
                api.get('/isp'),
                api.get('/isp/stats'),
            ]);
            setPlans(plansData || []);
            setStats(statsData || {});
        } catch (err) {
            console.error('Failed to fetch ISP data', err);
            toast.error('Kunde inte hämta studieplansdata');
        } finally {
            setLoading(false);
        }
    };

    const total = Object.values(stats).reduce((sum, v) => sum + (v || 0), 0);
    const activeCount = stats.ACTIVE || 0;
    const draftCount = stats.DRAFT || 0;
    const unacknowledged = plans.filter(p => p.status === 'ACTIVE' && !p.studentAcknowledgedAt).length;

    // Plans with expired plannedEnd
    const today = new Date().toISOString().split('T')[0];
    const expired = plans.filter(p =>
        p.status === 'ACTIVE' && p.plannedEnd && p.plannedEnd < today
    ).length;

    const filtered = plans.filter(p => {
        const name = `${p.student?.firstName || ''} ${p.student?.lastName || ''}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const complianceCards = [
        {
            label: 'Totalt antal ISP',
            value: total,
            icon: <GraduationCap size={22} />,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
            label: 'Aktiva planer',
            value: activeCount,
            icon: <CheckCircle size={22} />,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Ej kvitterade',
            value: unacknowledged,
            icon: <AlertCircle size={22} />,
            color: unacknowledged > 0 ? 'text-amber-600' : 'text-gray-400',
            bg: unacknowledged > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-900',
        },
        {
            label: 'Utgångna planer',
            value: expired,
            icon: <ShieldAlert size={22} />,
            color: expired > 0 ? 'text-red-600' : 'text-gray-400',
            bg: expired > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900',
        },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Studieplaner — Compliance</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">ISP · Skollagen 20:11 · Rektorsöversikt</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-all shadow-sm"
                >
                    <RefreshCw size={14} />
                    Uppdatera
                </button>
            </header>

            {/* Compliance cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {complianceCards.map(card => (
                    <div key={card.label} className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shrink-0 ${card.bg} ${card.color}`}>
                            {card.icon}
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">{card.value}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight mt-0.5">{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status breakdown */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart2 size={16} />
                    Fördelning per status
                </h2>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(stats).map(([status, count]) => {
                        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
                        return (
                            <div key={status} className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                                    {cfg.label}
                                </span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* All plans table */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Users size={18} />
                        Alla studieplaner
                    </h2>
                    <input
                        placeholder="Sök student..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-2 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all w-56"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="animate-spin text-indigo-400" size={28} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <GraduationCap size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="font-black text-sm">Inga studieplaner hittades</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-4 py-4">SYV</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Kvitterad</th>
                                    <th className="px-4 py-4">Period</th>
                                    <th className="px-4 py-4">Uppdaterad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {filtered.map(plan => {
                                    const cfg = STATUS_CONFIG[plan.status] || STATUS_CONFIG.DRAFT;
                                    const isExpired = plan.status === 'ACTIVE' && plan.plannedEnd && plan.plannedEnd < today;
                                    const acknowledged = !!plan.studentAcknowledgedAt;
                                    return (
                                        <tr key={plan.id} className={`transition-colors ${isExpired ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}>
                                            <td className="px-8 py-4">
                                                <div className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {plan.student?.firstName} {plan.student?.lastName}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400">{plan.student?.email}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-500 dark:text-gray-400">
                                                {plan.counselor?.firstName} {plan.counselor?.lastName}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                                {isExpired && (
                                                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase">
                                                        Utgången
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {acknowledged ? (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle size={13} />
                                                        <span className="text-[10px] font-black">
                                                            {new Date(plan.studentAcknowledgedAt).toLocaleDateString('sv-SE')}
                                                        </span>
                                                    </div>
                                                ) : plan.status === 'ACTIVE' ? (
                                                    <div className="flex items-center gap-1 text-amber-500">
                                                        <AlertCircle size={13} />
                                                        <span className="text-[10px] font-black">Ej kvitterad</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 font-bold">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400 font-bold">
                                                {plan.plannedStart ? `${plan.plannedStart}${plan.plannedEnd ? ' → ' + plan.plannedEnd : ''}` : '—'}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400 font-bold">
                                                {plan.updatedAt
                                                    ? new Date(plan.updatedAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })
                                                    : new Date(plan.createdAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrincipalIspOverview;
