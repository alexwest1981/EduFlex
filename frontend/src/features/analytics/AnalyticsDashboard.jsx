import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Server, ShieldCheck, Download, GraduationCap, Clock, AlertTriangle, Calendar, Wallet, FileText } from 'lucide-react';
import { api } from '../../services/api';
import RevenueAnalytics from './RevenueAnalytics';
import StudentDrillDown from './StudentDrillDown';

const AnalyticsDashboard = ({ widgets, customizer }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students'
    const [timeRange, setTimeRange] = useState('month'); // 'day' | 'week' | 'month' | 'year'
    const [overview, setOverview] = useState(null);
    const [growthData, setGrowthData] = useState([]);
    const [engagement, setEngagement] = useState(null);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        // Refetch data when time range changes
        fetchAllData();
    }, [timeRange]);

    const fetchAllData = async () => {
        try {
            const [ovRes, grRes, enRes, stuRes] = await Promise.all([
                api.get(`/analytics/overview?range=${timeRange}`),
                api.get(`/analytics/growth?range=${timeRange}`),
                api.get('/analytics/engagement'),
                api.get('/analytics/students')
            ]);
            setOverview(ovRes);
            setGrowthData(grRes);
            setEngagement(enRes);
            setStudents(stuRes);
        } catch (e) {
            console.error("Failed to load analytics", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-mono animate-pulse">{t('common.loading')}</div>;

    const cards = [
        { title: t('analytics.monthly_recurring_revenue'), value: `$${overview?.mrr?.toLocaleString()}`, change: "+12.5%", icon: <DollarSign size={24} />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { title: t('analytics.total_users'), value: overview?.totalUsers, change: "+8.2%", icon: <Users size={24} />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { title: t('analytics.active_sessions'), value: overview?.activeSessions, change: "+24%", icon: <Activity size={24} />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        { title: t('analytics.server_health'), value: overview?.serverHealth, change: t('analytics.stable'), icon: <Server size={24} />, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    ];

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${activeTab === id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
        >
            {icon} {label}
        </button>
    );

    const handleExport = () => {
        if (!students || students.length === 0) return;

        // Define CSV headers
        const headers = ["ID", "Name", "Email", "Role", "Last Login", "Login Count", "Total Time (min)", "Courses Enrolled", "Completion Rate", "Risk Factor"];

        // Map data to CSV rows
        const rows = students.map(s => [
            s.id,
            `"${s.name}"`,
            s.email,
            "Student", // Hardcoded as we filter by student
            s.lastLogin || "Never",
            s.loginCount,
            s.totalTimeOnline,
            s.coursesEnrolled,
            s.completionRate,
            s.riskFactor
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        downloadCSV(csvContent, `eduflex_student_export_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleCSNExport = async () => {
        try {
            const reportData = await api.get('/analytics/csn-report');
            if (!reportData || reportData.length === 0) {
                alert("Ingen data för CSN-rapport.");
                return;
            }

            const headers = ["Student ID", "Namn", "Personnummer", "Närvaro %", "Status", "Kommentar"];
            const rows = reportData.map(r => [
                r.id,
                `"${r.name}"`,
                r.personnummer,
                r.attendancePercent,
                r.status,
                r.comment
            ]);

            const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
            downloadCSV(csvContent, `csn_rapport_${new Date().toISOString().split('T')[0]}.csv`);

        } catch (error) {
            console.error("Failed to generate CSN report", error);
            alert("Kunde inte generera CSN-rapport.");
        }
    };

    const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <TrendingUp className="text-indigo-600" /> {t('analytics.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('analytics.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCSNExport}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors shadow-sm">
                        <FileText size={16} /> CSN Rapport
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors shadow-sm">
                        <Download size={16} /> {t('analytics.export_csv')}
                    </button>
                    {customizer}
                </div>
            </div>

            {/* TABS */}
            <div className="flex mb-8 border-b border-gray-200 dark:border-[#3c4043]">
                <TabButton id="overview" label={t('analytics.financial_overview')} icon={<TrendingUp size={16} />} />
                <TabButton id="revenue" label={t('analytics.revenue_analytics')} icon={<Wallet size={16} />} />
                <TabButton id="students" label={t('analytics.student_insights')} icon={<GraduationCap size={16} />} />
                <TabButton id="infrastructure" label={t('analytics.system_infrastructure')} icon={<Server size={16} />} />
            </div>

            {activeTab === 'overview' && (
                <div className="animate-in slide-in-from-bottom-2">
                    {/* TIME RANGE FILTER */}
                    <div className="flex justify-end mb-6">
                        <div className="inline-flex items-center gap-2 bg-white dark:bg-[#1E1F20] p-1.5 rounded-lg border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <Calendar size={16} className="text-gray-400 ml-2" />
                            {['day', 'week', 'month', 'year'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeRange === range
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2c]'
                                        }`}
                                >
                                    {t(`analytics.${range}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* KPI CARDS */}
                    {(!widgets || widgets.kpiCards) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {cards.map((card, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.title}</p>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{card.value}</h3>
                                        </div>
                                        <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <TrendingUp size={12} /> {card.change} <span className="text-gray-400 font-normal ml-1">{t('analytics.vs_last_month')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {(!widgets || widgets.revenueChart) && (
                            <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                                    {t('analytics.revenue_growth')} ({timeRange === 'day' ? 'Last 24 Hours' : timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'Last 30 Days' : 'Last 12 Months'})
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1F2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {(!widgets || widgets.acquisitionChart) && (
                            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">{t('analytics.user_acquisition')}</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={growthData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                                contentStyle={{ backgroundColor: '#1F2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="users" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {(!widgets || widgets.systemStatus) && (
                        <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldCheck size={200} />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-2">{t('analytics.system_status')}: {t('analytics.operational')}</h2>
                                <p className="text-indigo-200 max-w-2xl mb-6">{t('analytics.all_systems_normal')}</p>
                                <div className="flex gap-4">
                                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                        <p className="text-xs uppercase font-bold text-indigo-200">{t('analytics.uptime')}</p>
                                        <p className="text-2xl font-mono font-bold">99.99%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'revenue' && (
                <RevenueAnalytics />
            )}

            {activeTab === 'students' && (
                <div className="animate-in slide-in-from-bottom-2 space-y-8">
                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20"><Users size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">{t('analytics.total_students')}</p>
                                <p className="text-3xl font-black">{students.length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/20"><AlertTriangle size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">{t('analytics.at_risk')}</p>
                                <p className="text-3xl font-black">{students.filter(s => s.riskFactor === 'High').length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20"><Clock size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">{t('analytics.avg_time_online')}</p>
                                <p className="text-3xl font-black">2.4h</p>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-[#3c4043]">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('analytics.student_performance_registry')}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">{t('analytics.student_name')}</th>
                                        <th className="px-6 py-4">{t('analytics.status')}</th>
                                        <th className="px-6 py-4">{t('analytics.courses')}</th>
                                        <th className="px-6 py-4">{t('analytics.completion')}</th>
                                        <th className="px-6 py-4">{t('analytics.total_time_online')}</th>
                                        <th className="px-6 py-4">{t('analytics.risk_factor')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {students.map((student) => (
                                        <tr
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className="hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 items-center gap-3 font-medium text-gray-900 dark:text-white">
                                                {student.name}
                                                <div className="text-xs font-normal text-gray-500">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{student.coursesEnrolled}</td>
                                            <td className="px-6 py-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px]">
                                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: student.completionRate }}></div>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1 block">{student.completionRate}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                                                {Math.floor(student.totalTimeOnline / 60)}h {student.totalTimeOnline % 60}m
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1 font-bold ${student.riskFactor === 'High' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {student.riskFactor === 'High' && <AlertTriangle size={14} />}
                                                    {student.riskFactor}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">{t('analytics.no_student_data')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'infrastructure' && (
                <div className="animate-in slide-in-from-bottom-2 space-y-6">
                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('analytics.grafana_dashboard')}</h3>
                                <p className="text-gray-500 text-sm">{t('analytics.grafana_description')}</p>
                            </div>
                            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-2">
                                <Activity size={16} /> {t('analytics.open_full_grafana')}
                            </a>
                        </div>
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 dark:border-[#3c4043]">
                            <iframe
                                src="http://localhost:3000/d-solo/eduflex-main/eduflex-dashboard?orgId=1&refresh=5s&theme=light&panelId=2"
                                className="w-full h-full"
                                frameBorder="0"
                                title="Grafana"
                            ></iframe>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="aspect-[4/2] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-[#3c4043]">
                                <iframe
                                    src="http://localhost:3000/d-solo/eduflex-main/eduflex-dashboard?orgId=1&refresh=5s&theme=light&panelId=4"
                                    className="w-full h-full"
                                    frameBorder="0"
                                    title="CPU"
                                ></iframe>
                            </div>
                            <div className="aspect-[4/2] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-[#3c4043]">
                                <iframe
                                    src="http://localhost:3000/d-solo/eduflex-main/eduflex-dashboard?orgId=1&refresh=5s&theme=light&panelId=6"
                                    className="w-full h-full"
                                    frameBorder="0"
                                    title="HTTP"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('analytics.prometheus_metrics')}</h3>
                                <p className="text-gray-500 text-sm">{t('analytics.prometheus_description')}</p>
                            </div>
                            <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer" className="text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-100 flex items-center gap-2">
                                <Activity size={16} /> {t('analytics.open_prometheus')}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {selectedStudent && (
                <StudentDrillDown
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default AnalyticsDashboard;
