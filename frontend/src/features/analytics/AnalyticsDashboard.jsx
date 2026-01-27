
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, BookOpen, Download, MessageSquare } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboard = () => {
    const [trendRange, setTrendRange] = useState('30d');
    const [trendData, setTrendData] = useState([]);
    const [courseData, setCourseData] = useState([]);
    const [atRiskData, setAtRiskData] = useState([]);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [trendRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [trend, courses, risk, ov] = await Promise.all([
                api.analytics.getActivityTrend(trendRange),
                api.analytics.getCoursePerformance(),
                api.analytics.getAtRiskStudents(),
                api.analytics.getOverview()
            ]);
            setTrendData(trend);
            setCourseData(courses);
            setAtRiskData(risk);
            setOverview(ov);
        } catch (e) {
            console.error("Failed to load analytics", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !overview) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-8 p-6 lg:p-10 max-w-[1600px] mx-auto animate-fade-in">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <TrendingUp className="text-indigo-600" />
                        Education Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Realtidsinsikter om studenternas engagemang och prestation.</p>
                </div>

                <div className="flex gap-2 bg-white dark:bg-[#1E1F20] p-1 rounded-lg border border-gray-200 dark:border-[#3c4043]">
                    {['7d', '30d', '90d'].map(r => (
                        <button
                            key={r}
                            onClick={() => setTrendRange(r)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${trendRange === r
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                }`}
                        >
                            {r === '7d' ? 'Senaste Veckan' : r === '30d' ? 'Månad' : 'Kvartal'}
                        </button>
                    ))}
                    <button onClick={loadData} className="ml-2 px-3 text-gray-400 hover:text-indigo-600">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Aktiva Studenter" value={overview?.activeSessions || 0} sub="Just nu" icon={<Users className="text-blue-500" />} />
                <KPICard title="Riskflaggade" value={atRiskData.length} sub="Behöver åtgärd" icon={<AlertTriangle className="text-rose-500" />} />
                <KPICard title="Snittbetyg" value={`${calculateAvgGrade(courseData)}%`} sub="Över alla kurser" icon={<TrendingUp className="text-emerald-500" />} />
                <KPICard title="Kurser" value={overview?.totalCourses || 0} sub="Aktiva" icon={<BookOpen className="text-indigo-500" />} />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* User Activity Line Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043]">
                    <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Användaraktivitet</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={d => d.slice(8)} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="activeUsers" name="Aktiva Användare" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="actions" name="Interaktioner" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* At Risk List (Sidebar) */}
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-between">
                        <span>Riskzonen</span>
                        <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full">{atRiskData.length} st</span>
                    </h3>
                    <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                        {atRiskData.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">Inga studenter i riskzonen! 🎉</div>
                        ) : (
                            atRiskData.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#282a2c] group hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-200 dark:bg-rose-900 flex items-center justify-center text-rose-700 font-bold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{student.name}</div>
                                            <div className="text-xs text-gray-500">{student.completionRate} klart • {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Aldrig inloggad'}</div>
                                        </div>
                                    </div>
                                    <button className="text-gray-300 hover:text-indigo-600 transition-colors" title="Kontakta">
                                        <MessageSquare size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Course Performance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043]">
                    <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Kursgenomströmning (%)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={courseData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" fontSize={12} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px' }} />
                                <Bar dataKey="completionRate" name="Genomförandegrad" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20}>
                                    {courseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.completionRate < 50 ? '#ef4444' : '#4f46e5'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043]">
                    <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Betygsfördelning (Snitt)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={courseData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis domain={[0, 100]} stroke="#9ca3af" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px' }} />
                                <Bar dataKey="avgGrade" name="Snittbetyg (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, sub, icon }) => (
    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] flex items-center justify-between hover:scale-[1.02] transition-transform cursor-default">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</h3>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                {sub}
            </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#282a2c] flex items-center justify-center text-xl shadow-inner">
            {icon}
        </div>
    </div>
);

// Helper
const calculateAvgGrade = (courses) => {
    if (!courses.length) return 0;
    const sum = courses.reduce((acc, c) => acc + (c.avgGrade || 0), 0);
    return Math.round(sum / courses.length);
};

export default AnalyticsDashboard;
