import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Server, ShieldCheck, Download, GraduationCap, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

const AnalyticsDashboard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students'
    const [overview, setOverview] = useState(null);
    const [growthData, setGrowthData] = useState([]);
    const [engagement, setEngagement] = useState(null);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [ovRes, grRes, enRes, stuRes] = await Promise.all([
                api.get('/analytics/overview'),
                api.get('/analytics/growth'),
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

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-mono animate-pulse">BOOTING ANALYTICS ENGINE...</div>;

    const cards = [
        { title: "Monthly Recurring Revenue", value: `$${overview?.mrr?.toLocaleString()}`, change: "+12.5%", icon: <DollarSign size={24} />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { title: "Total Users", value: overview?.totalUsers, change: "+8.2%", icon: <Users size={24} />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { title: "Active Sessions", value: overview?.activeSessions, change: "+24%", icon: <Activity size={24} />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        { title: "Server Health", value: overview?.serverHealth, change: "Stable", icon: <Server size={24} />, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
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

        // Create Blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `eduflex_student_export_${new Date().toISOString().split('T')[0]}.csv`);
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
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors shadow-sm">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex mb-8 border-b border-gray-200 dark:border-[#3c4043]">
                <TabButton id="overview" label="Financial Overview" icon={<TrendingUp size={16} />} />
                <TabButton id="students" label="Student Insights" icon={<GraduationCap size={16} />} />
            </div>

            {activeTab === 'overview' && (
                <div className="animate-in slide-in-from-bottom-2">
                    {/* KPI CARDS */}
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
                                    <TrendingUp size={12} /> {card.change} <span className="text-gray-400 font-normal ml-1">vs last month</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Revenue Growth (2024)</h3>
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

                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">User Acquisition</h3>
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
                    </div>

                    <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck size={200} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">System Status: Operational</h2>
                            <p className="text-indigo-200 max-w-2xl mb-6">All systems running normally.</p>
                            <div className="flex gap-4">
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                    <p className="text-xs uppercase font-bold text-indigo-200">Uptime</p>
                                    <p className="text-2xl font-mono font-bold">99.99%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'students' && (
                <div className="animate-in slide-in-from-bottom-2 space-y-8">
                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20"><Users size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Total Students</p>
                                <p className="text-3xl font-black">{students.length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/20"><AlertTriangle size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">At Risk</p>
                                <p className="text-3xl font-black">{students.filter(s => s.riskFactor === 'High').length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20"><Clock size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Avg Time Online</p>
                                <p className="text-3xl font-black">2.4h</p>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-[#3c4043]">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Student Performance Registry</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Student Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Courses</th>
                                        <th className="px-6 py-4">Completion</th>
                                        <th className="px-6 py-4">Total Time Online</th>
                                        <th className="px-6 py-4">Risk Factor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors">
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
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No student data available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;