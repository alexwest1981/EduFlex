import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Calendar, ChevronLeft, ChevronRight,
    Info, Activity, Zap
} from 'lucide-react';

const ActivityHeatmap = ({ userId = null }) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, peakHour: 'N/A' });

    useEffect(() => {
        fetchHeatmapData();
    }, [userId]);

    const fetchHeatmapData = async () => {
        try {
            setLoading(true);
            const heatmap = await api.analytics.getHeatmap(userId);
            setData(heatmap || {});

            const values = Object.values(heatmap || {});
            const total = values.reduce((a, b) => a + b, 0);

            // Find most active hour
            let maxVal = -1;
            let peak = 'N/A';
            if (heatmap) {
                Object.entries(heatmap).forEach(([key, val]) => {
                    if (val > maxVal) {
                        maxVal = val;
                        const [d, h] = key.split(':');
                        peak = `${getDayName(parseInt(d))} kl ${h}:00`;
                    }
                });
            }

            setStats({ total, peakHour: peak });
        } catch (e) {
            console.error("Failed to fetch heatmap data", e);
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (day) => {
        const names = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
        return names[day] || '';
    };

    const getColor = (value) => {
        if (!value || value === 0) return 'bg-gray-100 dark:bg-gray-800/40';
        if (value < 2) return 'bg-emerald-200 dark:bg-emerald-900/30';
        if (value < 5) return 'bg-emerald-400 dark:bg-emerald-700/50';
        if (value < 10) return 'bg-emerald-600 dark:bg-emerald-600';
        return 'bg-emerald-800 dark:bg-emerald-500';
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = [1, 2, 3, 4, 5, 6, 7];

    return (
        <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-2xl p-6 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Aktivitetsmönster (7x24)</h3>
                        <p className="text-[10px] text-gray-500">Aktivitet per veckodag och timme</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mest aktiv</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.peakHour}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 animate-pulse bg-gray-50 dark:bg-[#131314] rounded-xl flex items-center justify-center">
                    <span className="text-xs text-gray-400">Genererar heatmap...</span>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="grid grid-cols-[30px_1fr] gap-2 flex-1">
                        {/* Day labels */}
                        <div className="flex flex-col justify-between py-1 text-[10px] font-bold text-gray-400">
                            {days.map(d => <div key={d} className="h-4 flex items-center">{getDayName(d)}</div>)}
                        </div>

                        {/* Grid container */}
                        <div className="relative overflow-x-auto custom-scrollbar-hide">
                            <div
                                className="grid gap-1 min-w-[420px]"
                                style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                            >
                                {days.map(day => (
                                    <React.Fragment key={day}>
                                        {hours.map(hour => {
                                            const count = data[`${day}:${hour}`] || 0;
                                            return (
                                                <div
                                                    key={`${day}-${hour}`}
                                                    className={`aspect-square rounded-[2px] transition-all cursor-help relative group ${getColor(count)}`}
                                                >
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30">
                                                        <div className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
                                                            {getDayName(day)} kl {hour}:00: {count} händelser
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Hour labels */}
                            <div
                                className="grid gap-1 mt-2 text-[8px] text-gray-400 font-medium min-w-[420px]"
                                style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                            >
                                {hours.map(h => (
                                    <div key={h} className="text-center">{h % 4 === 0 ? `${h}:00`.padStart(5, '0') : ''}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 text-[10px] text-gray-400 font-medium border-t border-gray-100 dark:border-[#3c4043] mt-4">
                        <div className="flex items-center gap-2">
                            <span>Låg</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded bg-gray-100 dark:bg-gray-800/40" />
                                <div className="w-2 h-2 rounded bg-emerald-200 dark:bg-emerald-900/30" />
                                <div className="w-2 h-2 rounded bg-emerald-600 dark:bg-emerald-500" />
                            </div>
                            <span>Hög</span>
                        </div>
                        <div className="flex items-center gap-1 italic">
                            <Zap size={10} className="text-yellow-500" />
                            Totalt {stats.total} händelser senaste 30 dagarna.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityHeatmap;
