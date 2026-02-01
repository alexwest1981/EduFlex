import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Sparkles, Users, TrendingUp, MessageSquare, BrainCircuit, RefreshCw, ChevronLeft } from 'lucide-react';

const EvaluationAnalytics = ({ instanceId, onBack }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, [instanceId]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/evaluations/instance/${instanceId}/summary`);
            setSummary(response);
        } catch (err) {
            console.error('Failed to fetch summary', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAI = async () => {
        try {
            setAnalyzing(true);
            const response = await api.post(`/evaluations/instance/${instanceId}/analyze`);
            setSummary(prev => ({ ...prev, aiSummary: response.summary }));
        } catch (err) {
            alert('Kunde inte generera AI-analys.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
            Laddar analys...
        </div>
    );

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" /> Tillbaka till listan
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">{summary.instanceTitle}</h1>
                        <div className="flex items-center gap-4 text-slate-500">
                            <span className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                <Users className="w-3.5 h-3.5" /> {summary.responseCount} totala svar
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${summary.status === 'ACTIVE' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                • {summary.status}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Stats Grid */}
                <div className="lg:col-span-8 space-y-10">
                    {Object.values(summary.questionStats).map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#1e1f20] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="flex items-start justify-between mb-10">
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight max-w-[80%] tracking-tight">{stat.text}</h3>
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>

                            {stat.type === 'LIKERT' || stat.type === 'NPS' ? (
                                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                                        <div className="relative w-32 h-32 rounded-full border-[6px] border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">{stat.average.toFixed(1)}</span>
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Snitt</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                <span>Prestation</span>
                                                <span className="text-blue-500">{Math.round((stat.average / (stat.type === 'LIKERT' ? 5 : 10)) * 100)}%</span>
                                            </div>
                                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000"
                                                    style={{ width: `${(stat.average / (stat.type === 'LIKERT' ? 5 : 10)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hämta data</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Trendar uppåt</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jämförelse</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Bäst i klassen</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : stat.type === 'TEXT' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Elevkommentarer</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {stat.comments.slice(0, 4).map((comment, i) => (
                                            <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 rounded-2xl text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed group hover:border-blue-500/30 transition-colors">
                                                "{comment}"
                                            </div>
                                        ))}
                                    </div>
                                    {stat.comments.length > 4 && (
                                        <button className="w-full py-4 text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-500/5 rounded-2xl transition-all border border-dashed border-blue-200 dark:border-blue-500/20 mt-4">
                                            Visa alla {stat.comments.length} kommentarer
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="h-[250px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={Object.entries(stat.distribution || {}).map(([name, value]) => ({ name, value }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b22" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}
                                            />
                                            <Bar
                                                dataKey="value"
                                                fill="url(#colorBar)"
                                                radius={[8, 8, 8, 8]}
                                                barSize={40}
                                            >
                                                <defs>
                                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={1} />
                                                    </linearGradient>
                                                </defs>
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* AI Insights Sidebar */}
                <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-8">
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 rounded-[2.5rem] p-1 shadow-2xl shadow-indigo-500/20">
                        <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-[2.3rem] p-8 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                <BrainCircuit className="w-48 h-48 text-white" />
                            </div>

                            <div className="flex items-center gap-3 mb-8 relative z-10">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">AI Analys</h2>
                            </div>

                            {summary.aiSummary ? (
                                <div className="space-y-6 relative z-10">
                                    <div className="text-base text-blue-50/90 leading-relaxed font-medium whitespace-pre-wrap">
                                        {summary.aiSummary}
                                    </div>
                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={analyzing}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all backdrop-blur-md border border-white/10"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} /> Uppdatera insikter
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10 space-y-6 relative z-10">
                                    <p className="text-blue-100/60 font-medium">Ingen automatisk analys har genererats ännu för denna utvärdering.</p>
                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={analyzing || summary.responseCount < 1}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-30 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95"
                                    >
                                        {analyzing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5 text-indigo-600" />}
                                        Generera analys
                                    </button>
                                    {summary.responseCount < 1 && (
                                        <p className="text-[10px] text-blue-200/40 font-black uppercase tracking-widest italic">Kräver minst 1 svar för att analysera</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1e1f20] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" /> Prestanda
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Svarsfrekvens</span>
                                    <span className="text-gray-900 dark:text-white">84%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '84%' }} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Benchmark</span>
                                <span className="text-green-500 font-black text-sm uppercase">+12% försprång</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationAnalytics;
