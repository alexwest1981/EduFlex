import React, { useState, useEffect } from 'react';
import {
    Activity, ShieldAlert, Users, TrendingUp, AlertTriangle,
    CheckCircle, Plus, Search, Clock,
    ChevronRight, Info, Heart, FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const statusLabels = {
    OPEN: 'Öppet',
    IN_PROGRESS: 'Pågående',
    RESOLVED: 'Löst',
    CLOSED: 'Stängt'
};

const statusColors = {
    OPEN: 'bg-blue-500/10 text-blue-600',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-600',
    RESOLVED: 'bg-emerald-500/10 text-emerald-600',
    CLOSED: 'bg-gray-500/10 text-gray-500'
};

const categoryLabels = {
    PSYKOSOCIALT: 'Psykosocialt',
    FYSISKT: 'Fysiskt',
    ATGARDSPROGRAM: 'Åtgärdsprogram',
    OTHER: 'Övrigt'
};

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min sedan`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} tim sedan`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} dagar sedan`;
    return date.toLocaleDateString('sv-SE');
};

const HealthTeamDashboard = () => {
    const { currentUser } = useAppContext();
    const [metrics, setMetrics] = useState(null);
    const [risks, setRisks] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [riskSearch, setRiskSearch] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [metricsData, risksData, casesData] = await Promise.all([
                    api.elevhalsa.getMetrics(),
                    api.elevhalsa.getRisks(),
                    api.elevhalsa.getCases()
                ]);
                setMetrics(metricsData);
                setRisks(risksData || []);
                setCases(casesData || []);
            } catch (error) {
                console.error("Failed to load health team data", error);
                toast.error("Kunde inte hämta dashboard-data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredRisks = riskSearch.length >= 2
        ? risks.filter(r => r.name?.toLowerCase().includes(riskSearch.toLowerCase()))
        : risks;

    const activeCases = cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const recentCases = [...cases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    const kpis = [
        {
            label: 'Aktiva Ärenden',
            value: metrics?.activeCases ?? 0,
            icon: <Activity className="w-6 h-6" />,
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            subtitle: `${cases.length} totalt`
        },
        {
            label: 'Risk-elever',
            value: metrics?.atRiskStudentsCount ?? 0,
            icon: <ShieldAlert className="w-6 h-6" />,
            color: 'text-rose-500',
            bgColor: 'bg-rose-500/10',
            subtitle: risks.filter(r => r.riskLevel === 'HIGH').length > 0
                ? `${risks.filter(r => r.riskLevel === 'HIGH').length} hög risk`
                : 'Inga högrisk'
        },
        {
            label: 'Lösta denna månad',
            value: metrics?.resolvedThisMonth ?? 0,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            subtitle: 'Stängda ärenden'
        },
        {
            label: 'Välmåendeindex',
            value: metrics?.wellbeingIndex ? `${metrics.wellbeingIndex}%` : 'N/A',
            icon: <Heart className="w-6 h-6" />,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
            subtitle: 'Baserat på enkäter'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-teal/20 rounded-xl">
                            <Heart className="w-8 h-8 text-brand-teal fill-brand-teal/20" />
                        </div>
                        Elevhälsa
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">
                        Övervakning och proaktivt stöd för elevhälsan.
                    </p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start">
                            <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-xl transition-transform group-hover:scale-110`}>
                                {kpi.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{kpi.subtitle}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{kpi.label}</p>
                            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Grid */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            Prioriterade Risker
                        </h2>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Sök elev..."
                                    value={riskSearch}
                                    onChange={(e) => setRiskSearch(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 ring-brand-teal/30 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-black/10 text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Elev</th>
                                    <th className="px-6 py-4">Riskfaktor</th>
                                    <th className="px-6 py-4">Nivå</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {filteredRisks.map((risk, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">
                                                    {risk.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="font-bold text-slate-800 dark:text-white">{risk.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {risk.attendance < 80 && (
                                                    <span className="text-xs text-rose-500 font-bold flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {Math.round(risk.attendance)}% Närvaro
                                                    </span>
                                                )}
                                                {risk.warnings > 0 && (
                                                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                                                        <Info className="w-3 h-3" />
                                                        {risk.warnings} F-varningar
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${risk.riskLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-500' :
                                                    risk.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-emerald-500/10 text-emerald-500'
                                                }`}>
                                                {risk.riskLevel === 'HIGH' ? 'Hög' : risk.riskLevel === 'MEDIUM' ? 'Medel' : 'Låg'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRisks.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">
                                            {riskSearch ? 'Inga resultat för sökningen.' : 'Inga riskelever identifierade.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Recent Cases */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-brand-teal" />
                            Senaste ärenden
                        </h2>
                        <div className="space-y-3">
                            {recentCases.length === 0 ? (
                                <p className="text-sm text-gray-400 italic py-4 text-center">Inga ärenden registrerade.</p>
                            ) : (
                                recentCases.map(c => (
                                    <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 hover:border-brand-teal/30 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                    {c.title || 'Namnlöst ärende'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {c.student ? `${c.student.firstName} ${c.student.lastName}` : 'Okänd elev'}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusColors[c.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {statusLabels[c.status] || c.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(c.createdAt)}
                                            </span>
                                            {c.category && (
                                                <span className="text-[10px] text-gray-400">
                                                    {categoryLabels[c.category] || c.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Case Summary */}
                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Ärendeöversikt
                        </h2>
                        <div className="space-y-3">
                            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => {
                                const count = cases.filter(c => c.status === status).length;
                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${status === 'OPEN' ? 'bg-blue-500' :
                                                    status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                        status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-gray-400'
                                                }`} />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{statusLabels[status]}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{count}</span>
                                    </div>
                                );
                            })}
                            <div className="border-t border-slate-100 dark:border-white/5 pt-3 mt-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Totalt</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">{cases.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthTeamDashboard;
