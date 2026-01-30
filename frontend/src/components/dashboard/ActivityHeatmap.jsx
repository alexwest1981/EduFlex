import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Calendar, ChevronLeft, ChevronRight,
    Info, Activity, Zap
} from 'lucide-react';

const ActivityHeatmap = ({ userId = null }) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, streak: 0, mostActive: 0 });

    useEffect(() => {
        fetchHeatmapData();
    }, [userId]);

    const fetchHeatmapData = async () => {
        try {
            setLoading(true);
            const heatmap = await api.analytics.getHeatmap(userId);
            setData(heatmap || {});

            // Calculate stats
            const values = Object.values(heatmap || {});
            const total = values.reduce((a, b) => a + b, 0);
            const mostActive = values.length > 0 ? Math.max(...values) : 0;

            // Simple streak calculation (consecutive days from now backwards)
            let streak = 0;
            const today = new Date().toISOString().split('T')[0];
            let checkDate = new Date();

            while (true) {
                const dateKey = checkDate.toISOString().split('T')[0];
                if (heatmap && heatmap[dateKey] > 0) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            setStats({ total, streak, mostActive });
        } catch (e) {
            console.error("Failed to fetch heatmap data", e);
        } finally {
            setLoading(false);
        }
    };

    // Generate last 30 days of dates
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    const getColor = (value) => {
        if (!value || value === 0) return 'bg-gray-100 dark:bg-gray-800/40 text-transparent';
        if (value < 2) return 'bg-emerald-200 dark:bg-emerald-900/30';
        if (value < 5) return 'bg-emerald-400 dark:bg-emerald-700/50';
        if (value < 10) return 'bg-emerald-500 dark:bg-emerald-600';
        return 'bg-emerald-600 dark:bg-emerald-500';
    };

    const dates = generateDates();

    return (
        <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#282a2c] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Aktivitetsnivå</h3>
                        <p className="text-[10px] text-gray-500">De senaste 30 dagarna</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.total} händelser</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Streak</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1">
                            <Zap size={12} fill="currentColor" />
                            {stats.streak} dagar
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-24 animate-pulse bg-gray-50 dark:bg-[#131314] rounded-xl flex items-center justify-center">
                    <span className="text-xs text-gray-400">Analyserar mönster...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5 justify-between">
                        {dates.map(date => {
                            const count = data[date] || 0;
                            const dayName = new Date(date).toLocaleDateString('sv-SE', { weekday: 'short' });
                            return (
                                <div
                                    key={date}
                                    className={`w-6 h-6 md:w-8 md:h-8 rounded-md transition-all cursor-help relative group ${getColor(count)}`}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                        <div className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
                                            {date}: {count} händelser
                                        </div>
                                    </div>
                                    {/* Marker for high activity */}
                                    {count >= 10 && (
                                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-white dark:border-gray-900" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[10px] text-gray-400 font-medium border-t border-gray-100 dark:border-[#282a2c]">
                        <div className="flex items-center gap-2">
                            <span>Låg</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded bg-gray-100 dark:bg-gray-800/40" />
                                <div className="w-2 h-2 rounded bg-emerald-200 dark:bg-emerald-900/30" />
                                <div className="w-2 h-2 rounded bg-emerald-400 dark:bg-emerald-700/50" />
                                <div className="w-2 h-2 rounded bg-emerald-600 dark:bg-emerald-500" />
                            </div>
                            <span>Hög</span>
                        </div>
                        <div className="flex items-center gap-1 italic">
                            <Info size={10} />
                            Händelser inkluderar inloggningar, visat material och avslutade uppgifter.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityHeatmap;
