import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Users, BookOpen, GraduationCap, Activity, TrendingUp, HardDrive, FileText, UserCheck } from 'lucide-react';
import { api } from '../../services/api';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await api.analytics.getOverview();
                setStats(data);
            } catch (e) {
                console.error("Kunde inte hämta statistik", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, []);

    if (isLoading) return <div className="p-20 text-center text-gray-500">Laddar analysmotor...</div>;
    if (!stats) return <div className="p-20 text-center text-red-500">Ingen data tillgänglig.</div>;

    // --- DATAPREP ---
    const growthData = Object.keys(stats.usersByMonth || {}).map(key => ({ name: key, users: stats.usersByMonth[key] }));

    const fileTypeData = Object.keys(stats.fileTypeDistribution || {}).map(key => ({ name: key, value: stats.fileTypeDistribution[key] }));
    const categoryData = Object.keys(stats.courseCategoryDistribution || {}).map(key => ({ name: key, value: stats.courseCategoryDistribution[key] }));

    const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="animate-in fade-in space-y-8 pb-20">

            {/* RAD 1: KPI-KORT (5 st) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Totalt Användare" value={stats.totalUsers} icon={<Users size={20} className="text-blue-600"/>} bg="bg-blue-50 dark:bg-blue-900/20"/>
                <StatCard title="Aktiva Idag" value={stats.activeUsersToday} icon={<Activity size={20} className="text-green-600"/>} bg="bg-green-50 dark:bg-green-900/20" subText="Unika inloggningar"/>
                <StatCard title="Kurser" value={stats.totalCourses} icon={<BookOpen size={20} className="text-purple-600"/>} bg="bg-purple-50 dark:bg-purple-900/20"/>
                <StatCard title="Snitt Inloggningar" value={stats.avgLoginsPerUser} icon={<TrendingUp size={20} className="text-orange-600"/>} bg="bg-orange-50 dark:bg-orange-900/20" subText="Per användare"/>
                <StatCard title="Lagring" value={formatBytes(stats.totalStorageUsedBytes)} icon={<HardDrive size={20} className="text-indigo-600"/>} bg="bg-indigo-50 dark:bg-indigo-900/20"/>
            </div>

            {/* RAD 2: TILLVÄXT & KATEGORIER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tillväxt (Area Chart) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Användartillväxt</h3>
                    <div className="h-72 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1}/>
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false}/>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }}/>
                                <Area type="monotone" dataKey="users" stroke="#6366F1" fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Kurskategorier (Pie) */}
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Kurskategorier</h3>
                    <p className="text-xs text-gray-500 mb-4">Fördelning baserat på ämne.</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RAD 3: KURSER & FILTYPER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Populära kurser (Bar) */}
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Populärast Kurser</h3>
                    <div className="h-72 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.courseEnrollments} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1}/>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#6B7280'}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none'}} />
                                <Bar dataKey="students" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} name="Studenter" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Filtyper (Pie/List) */}
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Filarkiv & Typer</h3>
                    <p className="text-xs text-gray-500 mb-6">Totalt uppladdat material: {formatBytes(stats.totalStorageUsedBytes)}</p>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                            <PieChart>
                                <Pie data={fileTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                                    {fileTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RAD 4: TOPPLISTA AKTIVITET */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex items-center gap-2">
                    <UserCheck className="text-indigo-600"/>
                    <h3 className="font-bold text-gray-900 dark:text-white">Mest Aktiva Användare</h3>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400">
                    <tr>
                        <th className="p-4">Namn</th>
                        <th className="p-4">Roll</th>
                        <th className="p-4 text-right">Inloggningar</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                    {stats.topActiveUsers?.map((u, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50">
                            <td className="p-4 font-bold text-gray-800 dark:text-white">{u.fullName}</td>
                            <td className="p-4"><span className="bg-gray-100 dark:bg-[#3c4043] text-xs px-2 py-1 rounded font-mono">{u.role}</span></td>
                            <td className="p-4 text-right font-bold text-indigo-600">{u.loginCount}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

const StatCard = ({ title, value, icon, bg, subText }) => (
    <div className="bg-white dark:bg-[#1E1F20] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</p>
            <h4 className="text-xl font-black text-gray-900 dark:text-white">{value}</h4>
            {subText && <p className="text-[10px] text-gray-400">{subText}</p>}
        </div>
    </div>
);

export default AnalyticsDashboard;