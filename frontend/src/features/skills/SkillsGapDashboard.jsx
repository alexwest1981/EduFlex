import React, { useState, useEffect } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

const SkillsGapDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/skills/gap');
            setData(response);
        } catch (err) {
            console.error('Failed to fetch skills gap data', err);
            setError('Kunde inte hämta kompetensdata.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-blue-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="animate-pulse">Analyserar dina kompetenser...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-[#0b1b2b] border border-red-500/20 rounded-3xl animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tjänsten är tillfälligt otillgänglig</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    Vi stötte på ett tekniskt problem vid hämtning av din kompetensprofil.
                    Vänligen försök igen om en liten stund.
                </p>
                <button
                    onClick={fetchData}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                    Uppdatera vy
                </button>
            </div>
        );
    }

    if (!data || !data.skills || data.skills.length === 0) {
        return (
            <div className="p-16 text-center bg-[#0b1b2b] border border-[#1e3a5f]/30 rounded-3xl animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Brain className="text-indigo-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Ingen analys tillgänglig ännu</h3>
                <p className="text-gray-400 max-w-lg mx-auto leading-relaxed mb-8">
                    Din kompetensprofil skapas automatiskt baserat på dina prestationer i kurserna.
                    När du har genomfört fler moduler och inlämningar kommer vi kunna presentera en detaljerad analys av dina styrkor och utvecklingsområden.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => window.location.href = '/courses'}
                        className="px-8 py-3 bg-white text-indigo-950 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl"
                    >
                        Utforska kurser
                    </button>
                </div>
            </div>
        );
    }

    // Formatting data for Recharts
    const chartData = data.skills.map(s => ({
        subject: s.skillName,
        current: s.currentLevel,
        target: s.targetLevel,
        fullMark: 100
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Radar Chart Section */}
                <div className="bg-[#0b1b2b] border border-[#1e3a5f]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain size={120} className="text-blue-500" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Target className="text-blue-400" />
                        Din Kompetensprofil
                    </h3>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#1e3a5f" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Nuvarande Nivå"
                                    dataKey="current"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="Mål"
                                    dataKey="target"
                                    stroke="#ef4444"
                                    fill="#ef4444"
                                    fillOpacity={0.1}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e3a5f', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            Nuvarande
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            Målkrav
                        </div>
                    </div>
                </div>

                {/* AI Insights Section */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-[#1e3a5f]/40 to-[#0b1b2b] border border-[#3b82f6]/30 rounded-3xl p-8 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Sparkles className="text-yellow-400" />
                            AI-Coach Insikter
                        </h3>
                        <div className="prose prose-invert prose-blue max-w-none">
                            <p className="text-blue-100 leading-relaxed italic line-clamp-[10]">
                                "{data.aiRecommendation}"
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#0b1b2b] border border-green-500/20 rounded-3xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 shrink-0">
                            <TrendingUp />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">Starkaste Området</h4>
                            <p className="text-green-400 font-medium">
                                {chartData.reduce((prev, current) => (prev.current > current.current) ? prev : current).subject}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Skill List */}
            <div className="bg-[#0b1b2b]/50 border border-[#1e3a5f]/20 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-8">Detaljerad Analys</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.skills.map((skill, idx) => (
                        <div
                            key={idx}
                            className="bg-[#0f172a] border border-[#1e3a5f]/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full">
                                        {skill.category || 'Allmänt'}
                                    </span>
                                    <h4 className="text-lg font-bold text-white mt-2">{skill.skillName}</h4>
                                </div>
                                {skill.gap <= 0 ? (
                                    <CheckCircle2 className="text-green-500 w-6 h-6" />
                                ) : (
                                    <TrendingUp className="text-blue-500 w-6 h-6 opacity-50 group-hover:opacity-100" />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Framsteg</span>
                                    <span className="text-white font-mono">{Math.round(skill.currentLevel)}%</span>
                                </div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${skill.currentLevel >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${skill.currentLevel}%` }}
                                    ></div>
                                </div>

                                {skill.gap > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs text-red-400/80 flex items-center gap-2">
                                            <Target size={12} />
                                            {Math.round(skill.gap)}% kvar till målnivå
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkillsGapDashboard;
