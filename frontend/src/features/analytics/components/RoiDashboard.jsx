import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ZAxis, LabelList, Cell
} from 'recharts';
import { TrendingUp, Download, Sparkles, Filter, ChevronRight, BarChart2, Info, Plus } from 'lucide-react';

const RoiDashboard = ({ courseId }) => {
    const [stats, setStats] = useState(null);
    const [dataPoints, setDataPoints] = useState([]);
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insightLoading, setInsightLoading] = useState(false);

    useEffect(() => {
        if (courseId) {
            loadRoiData();
        }
    }, [courseId]);

    const loadRoiData = async () => {
        setLoading(true);
        try {
            const [s, d] = await Promise.all([
                api.analytics.roi.getStats(courseId),
                api.analytics.roi.getData(courseId)
            ]);
            setStats(s);
            setDataPoints(d);
            // Fetch insight separately if needed or on demand
        } catch (e) {
            console.error("Failed to load ROI data", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchInsight = async () => {
        setInsightLoading(true);
        try {
            const res = await api.analytics.roi.getInsight(courseId);
            setInsight(res.insight);
        } catch (e) {
            setInsight("Kunde inte generera AI-insikt just nu.");
        } finally {
            setInsightLoading(false);
        }
    };

    const handleExport = (format) => {
        const url = api.analytics.roi.getExportUrl(courseId, format);
        window.open(url, '_blank');
    };

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div></div>;
    }

    if (!dataPoints.length) {
        return (
            <div className="bg-[var(--bg-card)] p-10 rounded-2xl border border-dashed border-[var(--border-main)] text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-[var(--text-secondary)]" size={32} />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Ingen ROI-data ännu</h3>
                <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6 font-bold">
                    För att se korrelationer behöver du importera affärsmål (KPI:er) för studenterna i denna kurs.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-1 font-bold uppercase tracking-wider">Korrelation (Pearson)</p>
                    <div className="flex items-end gap-3">
                        <h3 className={`text-4xl font-black ${stats?.correlation > 0.4 ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
                            {stats?.correlation.toFixed(2)}
                        </h3>
                        <span className="text-sm font-bold text-[var(--text-secondary)] mb-1">r-värde</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
                        <TrendingUp size={12} className={stats?.correlation > 0 ? 'text-emerald-500' : 'text-rose-500'} />
                        Trend: {stats?.trend}
                    </p>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-1 font-bold uppercase tracking-wider">Datapunkter</p>
                    <h3 className="text-4xl font-black text-[var(--text-primary)]">{stats?.dataPointsCount}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 uppercase font-bold tracking-tighter">Kopplade studenter</p>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-brand-blue/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles size={48} className="text-brand-blue" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1 font-bold uppercase tracking-wider flex items-center gap-2">
                        AI ROI-Insikt
                        <span className="bg-brand-blue/10 text-brand-blue text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Gemini</span>
                    </p>
                    {insight ? (
                        <p className="text-sm text-[var(--text-primary)] italic line-clamp-3">"{insight}"</p>
                    ) : (
                        <button
                            onClick={fetchInsight}
                            disabled={insightLoading}
                            className="mt-2 flex items-center gap-2 text-brand-blue font-black text-sm hover:translate-x-1 transition-transform"
                        >
                            {insightLoading ? 'Analyserar...' : 'Generera Insikt'}
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Scatter Plot */}
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                        <BarChart2 className="text-brand-blue" size={20} />
                        Kunskap vs. Prestation Correlation
                    </h3>
                    <div className="flex gap-2">
                        <div className="dropdown relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-[var(--border-main)] text-[var(--text-primary)]">
                                <Download size={14} />
                                Exportera Rapport
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] rounded-xl shadow-xl border border-[var(--border-main)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10 p-2">
                                {['JSON', 'CSV', 'XML', 'XLSX'].map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => handleExport(fmt)}
                                        className="w-full text-left px-4 py-2 hover:bg-brand-blue/10 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-brand-blue transition-colors"
                                    >
                                        Exportera som {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="var(--border-main)" />
                            <XAxis
                                type="number"
                                dataKey="masteryScore"
                                name="Kunskapsnivå"
                                unit="%"
                                domain={[0, 100]}
                                stroke="var(--text-secondary)"
                                fontSize={12}
                                label={{ value: 'Mastery Score (%)', position: 'bottom', offset: 20, fill: 'var(--text-secondary)' }}
                            />
                            <YAxis
                                type="number"
                                dataKey="metricValue"
                                name="Prestation"
                                stroke="var(--text-secondary)"
                                fontSize={12}
                                label={{ value: 'Affärsvärde (KPI)', angle: -90, position: 'left', fill: 'var(--text-secondary)' }}
                            />
                            <ZAxis type="number" range={[100, 100]} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '12px', border: '1px solid var(--border-main)' }}
                                bodyStyle={{ color: '#fff' }}
                                formatter={(value, name) => [value, name]}
                                labelFormatter={() => ''}
                            />
                            <Scatter name="ROI Correlation" data={dataPoints} fill="var(--brand-blue)">
                                {dataPoints.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.masteryScore > 70 ? '#10b981' : 'var(--brand-blue)'} />
                                ))}
                                <LabelList dataKey="studentName" position="top" style={{ fill: 'var(--text-secondary)', fontSize: '10px', fontWeight: 'bold' }} />
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 flex items-center gap-4 p-4 bg-brand-blue/5 rounded-xl border border-brand-blue/20">
                    <Info size={20} className="text-brand-blue shrink-0" />
                    <p className="text-xs text-brand-blue font-bold italic">
                        Diagrammet visar hur studenternas kunskapsnivå (Mastery Score) korrelerar med deras faktiska affärsprestation (KPI).
                        En hög positiv korrelation (nära 1.0) indikerar att utbildningen har en direkt påverkan på resultatet.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoiDashboard;
