import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Users,
    AlertTriangle,
    CheckCircle,
    TrendingDown,
    ShieldAlert,
    Building2,
    ChevronRight,
    Search,
    MessageSquare,
    Eye,
    EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PrincipalDashboard = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const data = await api.principal.dashboard.getMetrics();
            setMetrics(data);
        } catch (err) {
            console.error('Failed to load metrics', err);
            toast.error('Kunde inte ladda rektors-statistik');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const cards = [
        {
            title: 'Totalt antal elever',
            innerTitle: 'Inskrivna elever',
            value: metrics?.totalStudents || 0,
            icon: Users,
            color: 'blue'
        },
        {
            title: 'F-Varningar',
            innerTitle: 'Elever med F-risk',
            value: metrics?.fWarningCount || 0,
            icon: AlertTriangle,
            color: 'red'
        },
        {
            title: 'Omdömen/Betyg',
            innerTitle: 'Satta betyg (%)',
            value: metrics?.gradingProgressPercentage ? `${metrics.gradingProgressPercentage}%` : '0%',
            icon: CheckCircle,
            color: 'green'
        },
        {
            title: 'Aktiva Incidenter',
            innerTitle: 'Obehandlade ärenden',
            value: metrics?.activeIncidents || 0,
            icon: ShieldAlert,
            color: 'orange'
        }
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rektors-översikt</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Status och nyckeltal för hela skolan.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadMetrics}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Uppdatera data
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Exportera Rapport
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.title}</span>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{card.value}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.innerTitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: School Structure & Quick Links */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Placeholder for real charts or detailed listings */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Building2 size={20} className="text-indigo-600" />
                                Skolans Organisation
                            </h2>
                            <button
                                onClick={() => navigate('/principal/structure')}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Hantera hierarki
                            </button>
                        </div>
                        <div className="p-0">
                            {/* Simple Table/List of Departments */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {metrics?.departments?.length > 0 ? metrics.departments.map((dept, i) => (
                                    <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h4>
                                            <p className="text-sm text-gray-500">{dept.programCount} Program • {dept.studentCount} Elever</p>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300" />
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-gray-400 italic">Ingen organisationsdata laddad</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quality & Safety Preview */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShieldAlert size={20} className="text-orange-600" />
                                Incidenter & Trygghet
                            </h2>
                            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Kritiskt</span>
                        </div>
                        <div className="p-6">
                            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 p-4 rounded-xl flex gap-4">
                                <AlertTriangle className="text-orange-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">Behöver uppmärksamhet</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">Det finns 3 nya incidentrapporter som väntar på utredning.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Operations & Tools */}
                <div className="space-y-8">
                    {/* Quick Administrative Actions */}
                    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Administrativa Verktyg</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => navigate('/principal/tools')}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                            >
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <MessageSquare size={18} />
                                </div>
                                <span className="text-sm font-medium">Mass-meddelande</span>
                            </button>
                            <button
                                onClick={() => navigate('/principal/tools')}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                            >
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <Eye size={18} />
                                </div>
                                <span className="text-sm font-medium">Impersonate Mode</span>
                            </button>
                            <button
                                onClick={() => navigate('/principal/governance')}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
                            >
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <Search size={18} />
                                </div>
                                <span className="text-sm font-medium">Betygsrevision / Terminer</span>
                            </button>
                        </div>
                    </div>

                    {/* Academic Governance Status */}
                    <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                        <h3 className="font-bold mb-2">Läsårsstatus</h3>
                        <p className="text-xs text-indigo-100 mb-4 italic opacity-80">Nuvarande period: Vårterminen 2026</p>
                        <div className="space-y-4">
                            <div className="bg-white/10 p-3 rounded-xl">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>65%</span>
                                </div>
                                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-white h-full w-[65%]"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <TrendingDown size={14} className="text-indigo-200" />
                                    Betygslås
                                </span>
                                <span className="bg-red-400/30 text-red-200 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Låst</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalDashboard;
