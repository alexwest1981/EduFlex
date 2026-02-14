import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { X, TrendingUp, Users } from 'lucide-react';

const WellbeingDrilldown = ({ data, onClose }) => {
    if (!data) return null;

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-100 dark:border-white/5 shadow-lg p-6 mb-8 relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="w-5 h-5 text-gray-500" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-teal" />
                Välmåendeanalys
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* History Chart */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">Trend över tid (6 mån)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderRadius: '8px',
                                        border: 'none',
                                        color: '#fff'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="index"
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Class Distribution */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">Snitt per klass</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.classDistribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis
                                    dataKey="className"
                                    type="category"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={60}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderRadius: '8px',
                                        border: 'none',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="index" radius={[0, 4, 4, 0]} barSize={20}>
                                    {data.classDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.index >= 80 ? '#10b981' :
                                                entry.index >= 60 ? '#f59e0b' :
                                                    '#ef4444'
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WellbeingDrilldown;
