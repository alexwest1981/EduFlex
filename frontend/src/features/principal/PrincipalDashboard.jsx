import React, { useState, useEffect } from 'react';
import {
    Users,
    ShieldAlert,
    GraduationCap,
    UserCheck,
    TrendingUp,
    Heart,
    BarChart3,
    CreditCard,
    Search,
    Bell,
    Cloud,
    MessageSquare,
    Plus,
    UserPlus,
    FileText,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Target,
    Activity
} from 'lucide-react';
import PrincipalCoachWidget from '../dashboard/components/teacher/PrincipalCoachWidget';
import SKADashboard from './components/SKADashboard';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const PrincipalDashboard = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [latestReport, setLatestReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drillDown, setDrillDown] = useState(null);
    const [activeTab, setActiveTab] = useState('intel');

    useEffect(() => {
        loadMetrics();
        const interval = setInterval(loadMetrics, 60000); // 1 min auto-refresh
        return () => clearInterval(interval);
    }, []);

    const loadMetrics = async () => {
        try {
            const [metricsData, reports] = await Promise.all([
                api.principal.dashboard.getMetrics(),
                api.get('/reports') // Use the existing report fetcher
            ]);
            setMetrics(metricsData);
            if (reports && reports.length > 0) {
                setLatestReport(reports[0]); // Archive is sorted by date desc
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    const kpiCards = [
        {
            id: 'attendance',
            title: 'Närvaro idag',
            value: `${metrics?.attendancePercentage ?? 0}%`,
            sub: `${metrics?.presentCount ?? 0}/${metrics?.totalAttendanceExpected ?? 0} elever`,
            trend: 'Live närvaro',
            icon: Users,
            color: (metrics?.attendancePercentage ?? 0) > 90 ? 'green' : 'red',
            drillData: 'Lista risk-elever'
        },
        {
            id: 'alerts',
            title: 'Kritiska alerts',
            value: (metrics?.activeIncidents ?? 0) + (metrics?.unmannedLessons ?? 0),
            sub: `${metrics?.activeIncidents ?? 0} incidenter, ${metrics?.unmannedLessons ?? 0} obemannade`,
            trend: 'Prioriterad åtgärd',
            icon: ShieldAlert,
            color: (metrics?.activeIncidents ?? 0) > 0 ? 'red' : 'green',
            drillData: 'Ärendeöversikt'
        },
        {
            id: 'knowledge',
            title: 'Kunskapsstatus',
            value: `${metrics?.gradingProgressPercentage ?? 0}%`,
            sub: `${metrics?.npRiskCount ?? 0} NP-risk`,
            trend: 'Total progression',
            icon: GraduationCap,
            color: 'blue',
            drillData: 'Progression per klass'
        },
        {
            id: 'staff',
            title: 'Personal-status',
            value: `${metrics?.staffManningPercentage ?? 0}%`,
            sub: `${metrics?.sickStaffCount ?? 0} sjuka / frånvarande`,
            trend: 'Daglig bemanning',
            icon: UserCheck,
            color: 'green',
            drillData: 'Frånvarolista'
        },
        {
            id: 'grading',
            title: 'Betygstrender',
            value: `${metrics?.gradesACPercentage ?? 0}%`,
            sub: 'A-C fördelning',
            trend: 'Aggregerat resultat',
            icon: TrendingUp,
            color: 'orange',
            drillData: 'Resultatuppföljning'
        },
        {
            id: 'health',
            title: 'Elevhälsa',
            value: metrics?.openHealthCases ?? 0,
            sub: 'Öppna EHT-ärenden',
            trend: 'Aktiva utredningar',
            icon: Heart,
            color: 'red',
            drillData: 'EHT Dashboard'
        },
        {
            id: 'engagement',
            title: 'Engagemang',
            value: metrics?.avgLoginsPerDay ?? 0,
            sub: 'Snitt logins/dag',
            trend: 'Systemaktivitet',
            icon: BarChart3,
            color: 'indigo',
            drillData: 'Aktivitetslogg'
        },
        {
            id: 'economy',
            title: 'Ekonomi/Avgifter',
            value: `${metrics?.paymentPercentage ?? 0}%`,
            sub: `${metrics?.unpaidFeesCount ?? 0} obetalda`,
            trend: 'Faktureringsstatus',
            icon: CreditCard,
            color: 'emerald',
            drillData: 'Ekonomiöversikt'
        }
    ];

    const tabs = [
        { id: 'intel', label: 'Quick Intel', icon: Activity },
        { id: 'ska', label: 'Kvalitetsarbete (SKA)', icon: Target },
        { id: 'kpi', label: 'Key Metrics', icon: TrendingUp },
    ];

    const quickActions = [
        { label: 'Massmeddelande', icon: MessageSquare, color: 'indigo', action: () => navigate('/principal/tools') },
        { label: 'Ny incident', icon: Plus, color: 'orange', action: () => navigate('/principal/quality') },
        { label: 'Vikarie', icon: UserPlus, color: 'emerald', action: () => navigate('/principal/staffing') },
        { label: 'Risk-lista', icon: ShieldAlert, color: 'red', action: () => navigate('/principal/reports') },
        { label: 'Ledningsrapport', icon: TrendingUp, color: 'blue', action: () => navigate('/principal/management-reports') },
        { label: 'Arkiv', icon: FileText, color: 'indigo', action: () => navigate('/principal/reports') },
        { label: 'Kalender', icon: Calendar, color: 'amber', action: () => navigate('/calendar') },
    ];

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length === 1) return name.substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getTrendDate = (index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    };

    const currentWeek = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0e] p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">

            {/* --- TOP HEADER (10%) --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-[#1c1c1e] p-3 rounded-2xl shadow-sm">
                        <Cloud className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">EduFlex Mission Control</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            {new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })} • <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live System</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            placeholder="Sök elev, personal eller kurs..."
                            className="bg-white dark:bg-[#1c1c1e] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm w-64 lg:w-96 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <button className="p-2.5 bg-white dark:bg-[#1c1c1e] text-gray-500 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1c1c1e]"></span>
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200 cursor-pointer overflow-hidden">
                        {getInitials(currentUser?.fullName)}
                    </div>
                </div>
            </header>

            {/* --- QUICK INTEL BAR --- */}
            <div className="flex flex-wrap items-center gap-4 bg-indigo-600/5 dark:bg-indigo-400/5 border border-indigo-100 dark:border-indigo-900/30 p-2 rounded-2xl px-6">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">System Intelligence</p>
                <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-800 mx-2 hidden md:block"></div>
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Totalt antal elever:</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{metrics?.totalStudents ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Senaste Rapport:</span>
                        <span className={`text-sm font-black ${latestReport ? 'text-indigo-600' : 'text-amber-500'}`}>
                            {latestReport ? latestReport.title : 'Ingen skapad'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Datasync OK
                    </div>
                </div>
            </div>

            {/* --- TAB NAVIGATION --- */}
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- MITTEN: KPI-GRID (60%) / SKA DASHBOARD --- */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(activeTab === 'intel' || activeTab === 'kpi') && (
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                        {kpiCards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => setDrillDown(drillDown === card.id ? null : card.id)}
                                className={`bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${drillDown === card.id ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}
                            >
                                {/* Decorative background element */}
                                <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform text-current text-${card.color}-500`}>
                                    <card.icon size={120} />
                                </div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`p-3 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/10 text-${card.color}-600 dark:text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                                        <card.icon size={22} />
                                    </div>
                                    <button className="text-gray-300 hover:text-gray-500 transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{card.value}</h3>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{card.title}</p>

                                    <div className="mt-6 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{card.sub}</span>
                                            {card.id === 'attendance' && <ArrowUpRight size={16} className="text-emerald-500" />}
                                            {card.id === 'knowledge' && <ArrowDownRight size={16} className="text-red-500" />}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400">{card.trend}</p>
                                    </div>
                                </div>

                                {/* Inline Drilldown Placeholder */}
                                {drillDown === card.id && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 -mx-6 -mb-6 p-6 animate-in slide-in-from-top-4 duration-300">
                                        <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider">Expandrad vy</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-gray-500">{card.drillData}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (card.id === 'alerts') navigate('/principal/quality');
                                                        if (card.id === 'staff') navigate('/principal/staffing');
                                                        if (card.id === 'economy') navigate('/principal/reports');
                                                        if (card.id === 'knowledge') navigate('/principal/reports');
                                                    }}
                                                    className="font-bold text-indigo-600 hover:scale-105 transition-transform"
                                                >
                                                    Öppna Modul
                                                </button>
                                            </div>
                                            <div className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-gray-500">Senaste uppdatering</span>
                                                <span className="font-bold">Realtid</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'ska' && (
                    <div className="lg:col-span-4">
                        <SKADashboard />
                    </div>
                )}
            </main>

            {/* --- BOTTEN: TRENDS & QUICK ACTIONS (30%) --- */}
            <footer className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Trends Carousel Placeholder (3/4 width) */}
                <div className="lg:col-span-3 bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Trend-analys</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Vecka {currentWeek()} • Jämförande data</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold rounded-lg hover:bg-gray-100">Dag</button>
                            <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">Vecka</button>
                            <button className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold rounded-lg hover:bg-gray-100">Månad</button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-4 px-4 overflow-x-auto no-scrollbar">
                        {metrics?.trendData ? metrics.trendData.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-[20px]">
                                <div className="w-full relative bg-gray-50 dark:bg-gray-800/50 rounded-full overflow-hidden h-48">
                                    <div
                                        style={{ height: `${h}%` }}
                                        className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 group-hover:opacity-80
                                            ${h > 80 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : h > 60 ? 'bg-indigo-500' : 'bg-orange-500'}
                                        `}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{getTrendDate(i)}</span>
                            </div>
                        )) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-2">
                                <TrendingUp size={48} className="animate-pulse" />
                                <p className="text-sm font-bold uppercase tracking-widest">Samlar in Trenddata...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & AI Coach (1/4 width) */}
                <div className="space-y-4">
                    <PrincipalCoachWidget />
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={action.action}
                                className="bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
                            >
                                <div className={`p-4 rounded-2xl bg-${action.color}-50 dark:bg-${action.color}-900/10 text-${action.color}-600 dark:text-${action.color}-400 group-hover:scale-110 transition-transform`}>
                                    <action.icon size={24} />
                                </div>
                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Floating Alert / Heatmap Context */}
            {metrics?.activeIncidents > 0 && (
                <div className="fixed bottom-8 left-72 p-4 bg-red-600 text-white rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce hover:animate-none cursor-pointer z-[100]">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest">Kritisk Alert</h4>
                        <p className="text-sm font-medium">{metrics?.activeIncidents} incidenter kräver tillsyn</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PrincipalDashboard;
