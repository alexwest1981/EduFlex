import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import { Users, Info, AlertCircle, BarChart3, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const ClassSkillsHeatmap = ({ courseId, courseName }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (courseId) {
            fetchHeatmap();
        }
    }, [courseId]);

    const fetchHeatmap = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/skills/class/${courseId}`);
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch heatmap data', err);
            setError('Kunde inte hämta heatmap-data.');
        } finally {
            setLoading(false);
        }
    };

    const getBarColor = (value) => {
        if (value >= 80) return '#22c55e'; // Green
        if (value >= 50) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-blue-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p>Genererar klassöversikt...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
                <AlertCircle />
                {error}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="p-10 text-center bg-gray-900/20 border border-gray-800 rounded-2xl">
                <Info className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Ingen kompetensdata mappad för denna kurs än.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0b1b2b] border border-[#1e3a5f]/30 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-blue-400" />
                        Kompetens-Heatmap: {courseName}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Genomsnittlig färdighetsnivå för alla aktiva studenter i kursen.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-xl text-blue-400 text-sm font-bold">
                    <Users size={16} />
                    Totalt: {data.length} Skills
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" unit="%" />
                        <YAxis
                            dataKey="skillName"
                            type="category"
                            stroke="#94a3b8"
                            width={100}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e3a5f', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`${value}%`, 'Genomsnitt']}
                        />
                        <Bar dataKey="currentLevel" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.currentLevel)} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <h4 className="text-xs font-bold text-red-400 uppercase mb-1">Största utmaningen</h4>
                    <p className="text-white font-bold">
                        {data.reduce((prev, curr) => (prev.currentLevel < curr.currentLevel) ? prev : curr).skillName}
                    </p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                    <h4 className="text-xs font-bold text-green-400 uppercase mb-1">Högsta kompetens</h4>
                    <p className="text-white font-bold">
                        {data.reduce((prev, curr) => (prev.currentLevel > curr.currentLevel) ? prev : curr).skillName}
                    </p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Målmedvetenhet</h4>
                    <p className="text-white font-bold">Över 75% i genomsnitt</p>
                </div>
            </div>
        </div>
    );
};

export default ClassSkillsHeatmap;
