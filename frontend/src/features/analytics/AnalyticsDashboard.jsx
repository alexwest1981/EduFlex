
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, BookOpen, Download, MessageSquare, Activity, Filter, Sparkles, X } from 'lucide-react';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import CourseDropOffAnalysis from '../../components/dashboard/CourseDropOffAnalysis';
import RoiCenter from './RoiCenter';
import AiCoachWidget from '../../components/ai/AiCoachWidget';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [trendRange, setTrendRange] = useState('30d');
    const [trendData, setTrendData] = useState([]);
    const [courseData, setCourseData] = useState([]);
    const [atRiskData, setAtRiskData] = useState([]);
    const [overview, setOverview] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [loading, setLoading] = useState(true);

    // AI Summary State
    const [aiSummary, setAiSummary] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiStudent, setAiStudent] = useState(null);

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
            if (courses.length > 0 && !selectedCourseId) {
                setSelectedCourseId(courses[0].id);
            }
            setAtRiskData(risk);
            setOverview(ov);
        } catch (e) {
            console.error("Failed to load analytics", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAiSummary = async (student) => {
        setAiStudent(student);
        setAiLoading(true);
        setAiSummary(null);
        try {
            const response = await api.analytics.getAtRiskAiSummary(student.id);
            setAiSummary(response.summary);
        } catch (e) {
            setAiSummary("Kunde inte hämta AI-analys för tillfället.");
        } finally {
            setAiLoading(false);
        }
    };

    if (loading && !overview) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-8 p-6 lg:p-10 max-w-[1600px] mx-auto animate-fade-in">

            {/* Header Tabs */}
            <div className="flex border-b border-[var(--border-main)] mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                    Allmän Översikt
                </button>
                <button
                    onClick={() => setActiveTab('roi')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'roi' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                    ROI & Prestation
                </button>
            </div>

            {activeTab === 'roi' ? (
                <div className="-mx-6 lg:-mx-10 -mt-8">
                    <RoiCenter />
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
                                <TrendingUp className="text-brand-blue" />
                                Education Analytics
                            </h1>
                            <p className="text-[var(--text-secondary)] mt-1">Realtidsinsikter om studenternas engagemang och prestation.</p>
                        </div>

                        <div className="flex gap-2 bg-[var(--bg-card)] p-1 rounded-lg border border-[var(--border-main)]">
                            {['7d', '30d', '90d'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setTrendRange(r)}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${trendRange === r
                                        ? 'bg-brand-blue/10 text-brand-blue'
                                        : 'text-[var(--text-secondary)] hover:bg-white/5'
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

                    <AiCoachWidget role="PRINCIPAL" />

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
                        <div className="lg:col-span-2 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)]">
                            <h3 className="text-lg font-black mb-6 text-[var(--text-primary)]">Användaraktivitet</h3>
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
                        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)] overflow-hidden flex flex-col">
                            <h3 className="text-lg font-black mb-4 text-[var(--text-primary)] flex items-center justify-between">
                                <span>Riskzonen</span>
                                <span className="bg-rose-500/10 text-rose-400 text-xs px-2 py-1 rounded-full">{atRiskData.length} st</span>
                            </h3>
                            <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                                {atRiskData.length === 0 ? (
                                    <div className="text-center text-gray-400 py-10">Inga studenter i riskzonen! 🎉</div>
                                ) : (
                                    atRiskData.map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-rose-500/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[var(--text-primary)]">{student.name}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{student.completionRate} klart • {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Aldrig inloggad'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => fetchAiSummary(student)}
                                                    className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                                                    title="AI Analys"
                                                >
                                                    <Sparkles size={18} />
                                                </button>
                                                <button className="p-2 text-[var(--text-secondary)] hover:text-brand-blue hover:bg-white/5 rounded-lg transition-colors" title="Kontakta">
                                                    <MessageSquare size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Summary Modal */}
                    {(aiLoading || aiSummary) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                            <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border-main)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-xl">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--text-primary)]">AI-Insikt: {aiStudent?.name}</h3>
                                            <p className="text-xs text-[var(--text-secondary)] italic">Genererad av Gemini AI</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setAiSummary(null); setAiLoading(false); }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8">
                                    {aiLoading ? (
                                        <div className="space-y-4">
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full"></div>
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-5/6"></div>
                                            <p className="text-center text-xs text-gray-400 mt-6 font-medium animate-pulse">Analyserar studentdata och mönster...</p>
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-[var(--text-primary)] leading-relaxed text-lg">
                                                {aiSummary}
                                            </p>
                                            <div className="mt-8 p-4 bg-brand-blue/5 rounded-xl border border-brand-blue/20">
                                                <p className="text-xs text-brand-blue font-bold flex items-center gap-2">
                                                    <AlertTriangle size={14} />
                                                    Sammanfattningen är baserad på inlämningar, quizzar och aktivitetsloggar.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 bg-white/5 flex justify-end">
                                    <button
                                        onClick={() => { setAiSummary(null); setAiLoading(false); }}
                                        className="px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-blue/20"
                                    >
                                        Stäng
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Heatmap & Drop-off Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <ActivityHeatmap />
                        </div>
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                                    <Filter size={14} />
                                    <span>Välj kurs för analys:</span>
                                </div>
                                <select
                                    className="bg-[var(--bg-input)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue outline-none"
                                    value={selectedCourseId || ''}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                >
                                    {courseData.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedCourseId && <CourseDropOffAnalysis courseId={selectedCourseId} />}
                        </div>
                    </div>

                    {/* Course Performance Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)]">
                            <h3 className="text-lg font-black mb-6 text-[var(--text-primary)]">Kursgenomströmning (%)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={courseData} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" fontSize={12} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px' }} />
                                        <Bar dataKey="completionRate" name="Genomförandegrad" fill="var(--brand-blue)" radius={[0, 4, 4, 0]} barSize={20}>
                                            {courseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.completionRate < 50 ? '#ef4444' : 'var(--brand-blue)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)]">
                            <h3 className="text-lg font-black mb-6 text-[var(--text-primary)]">Betygsfördelning (Snitt)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={courseData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                                        <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '12px', border: '1px solid var(--border-main)' }} />
                                        <Bar dataKey="avgGrade" name="Snittbetyg (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const KPICard = ({ title, value, sub, icon }) => (
    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)] flex items-center justify-between hover:scale-[1.02] transition-transform cursor-default">
        <div>
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-[var(--text-primary)]">{value}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                {sub}
            </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
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
