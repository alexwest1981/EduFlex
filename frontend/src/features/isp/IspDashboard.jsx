import React, { useState, useEffect } from 'react';
import {
    GraduationCap, Plus, Search, Filter, Clock, User, CheckCircle,
    AlertCircle, FileText, ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import IspFormModal from './IspFormModal';
import IspDetailModal from './IspDetailModal';

const STATUS_CONFIG = {
    DRAFT:     { label: 'Utkast',       color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
    ACTIVE:    { label: 'Aktiv',        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    REVISED:   { label: 'Under revision', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    COMPLETED: { label: 'Avslutad',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ARCHIVED:  { label: 'Arkiverad',    color: 'bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600' },
};

const IspDashboard = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await api.get('/isp');
            setPlans(data || []);
        } catch (err) {
            console.error('Failed to fetch ISPs', err);
            toast.error('Kunde inte hämta studieplaner');
        } finally {
            setLoading(false);
        }
    };

    const filtered = plans.filter(p => {
        const name = `${p.student?.firstName || ''} ${p.student?.lastName || ''}`.toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const openDetail = (plan) => {
        setSelectedPlan(plan);
    };

    const openEdit = (plan, e) => {
        e.stopPropagation();
        setEditingPlan(plan);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingPlan(null);
    };

    const handleFormSaved = () => {
        handleFormClose();
        fetchPlans();
    };

    const handleDetailClose = () => {
        setSelectedPlan(null);
        fetchPlans(); // Refresh after any status changes
    };

    const totalActive = plans.filter(p => p.status === 'ACTIVE').length;
    const totalDraft = plans.filter(p => p.status === 'DRAFT').length;
    const totalUnacknowledged = plans.filter(p => p.status === 'ACTIVE' && !p.studentAcknowledgedAt).length;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Studieplaner (ISP)</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Individuella studieplaner · Skollagen 20:11</p>
                </div>
                <button
                    onClick={() => { setEditingPlan(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:scale-105"
                >
                    <Plus size={16} />
                    Ny studieplan
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Totalt', value: plans.length, icon: <FileText size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    { label: 'Aktiva', value: totalActive, icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Ej kvitterade', value: totalUnacknowledged, icon: <AlertCircle size={20} />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input
                        placeholder="Sök student..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-[#1c1c1e] border-none rounded-2xl pl-11 pr-4 py-3 text-sm shadow-sm focus:ring-2 ring-indigo-500 transition-all font-medium"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...Object.keys(STATUS_CONFIG)].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                statusFilter === s
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-[#1c1c1e] text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {s === 'ALL' ? 'Alla' : STATUS_CONFIG[s]?.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchPlans}
                    className="p-3 bg-white dark:bg-[#1c1c1e] rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all"
                    title="Uppdatera"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-indigo-400" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-black">Inga studieplaner hittades</p>
                        <p className="text-xs mt-1">Klicka på "Ny studieplan" för att skapa den första.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-8 py-5">Student</th>
                                    <th className="px-4 py-5">Status</th>
                                    <th className="px-4 py-5">Studietakt</th>
                                    <th className="px-4 py-5">Period</th>
                                    <th className="px-4 py-5">Kvitterad</th>
                                    <th className="px-4 py-5">Version</th>
                                    <th className="px-4 py-5">Senast uppdaterad</th>
                                    <th className="px-4 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {filtered.map(plan => {
                                    const cfg = STATUS_CONFIG[plan.status] || STATUS_CONFIG.DRAFT;
                                    const acknowledged = !!plan.studentAcknowledgedAt;
                                    return (
                                        <tr
                                            key={plan.id}
                                            onClick={() => openDetail(plan)}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                                        <User size={16} className="text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                                                            {plan.student?.firstName} {plan.student?.lastName}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-bold">{plan.student?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                                                {plan.studyPacePct}%
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400 font-bold">
                                                {plan.plannedStart ? (
                                                    <>{plan.plannedStart} → {plan.plannedEnd || '—'}</>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-4">
                                                {acknowledged ? (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <CheckCircle size={14} />
                                                        <span className="text-[10px] font-black">
                                                            {new Date(plan.studentAcknowledgedAt).toLocaleDateString('sv-SE')}
                                                        </span>
                                                    </div>
                                                ) : plan.status === 'ACTIVE' ? (
                                                    <div className="flex items-center gap-1.5 text-amber-500">
                                                        <AlertCircle size={14} />
                                                        <span className="text-[10px] font-black">Ej kvitterad</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 font-bold">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs font-black text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                                                    v{plan.version}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400 font-bold">
                                                {plan.updatedAt
                                                    ? new Date(plan.updatedAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })
                                                    : new Date(plan.createdAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <IspFormModal
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSaved={handleFormSaved}
                existingPlan={editingPlan}
            />

            {selectedPlan && (
                <IspDetailModal
                    plan={selectedPlan}
                    onClose={handleDetailClose}
                    onEdit={(plan) => { setSelectedPlan(null); setEditingPlan(plan); setIsFormOpen(true); }}
                />
            )}
        </div>
    );
};

export default IspDashboard;
