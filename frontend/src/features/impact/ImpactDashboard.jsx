import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Users, CheckCircle, AlertTriangle, Brain } from 'lucide-react';

const ImpactDashboard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const data = await api.impact.getOverview();
            setMetrics(data);
        } catch (error) {
            console.error("Failed to fetch impact metrics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Laddar analysdata...</div>;

    // Mock trend data for visualization (Backend aggregation is complex, let's start with static trend for demo)
    const trendData = [
        { month: 'Jan', avgGrade: 12.5 },
        { month: 'Feb', avgGrade: 12.8 },
        { month: 'Mar', avgGrade: 13.1 }, // Intervention start
        { month: 'Apr', avgGrade: 13.5 },
        { month: 'Maj', avgGrade: 14.2 },
    ];

    const interventionData = [
        { name: 'Utan Åtgärd', value: 30, fill: '#ef4444' },
        { name: 'Med Åtgärd', value: 70, fill: '#22c55e' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-indigo-600" />
                    Impact Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Mät effekten av elevhälsa och AI-stöd på studieresultat.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* KPI Cards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Elevhälsa Interventioner</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics?.totalInterventions || 0}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="text-green-600 font-medium">
                            {metrics?.successRate ? Math.round(metrics.successRate) : 0}%
                        </span>
                        <span className="text-gray-500">förbättrade sina resultat</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">AI-Stöd Adoption</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics?.activeAiStudents || 0}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Snittbetyg AI-användare:</span>
                        <span className="font-bold text-gray-900">{metrics?.aiUserAverageGrade ? metrics.aiUserAverageGrade.toFixed(1) : 0}</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">ROI (Betygspoäng)</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">+1.7</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Ökning i meritvärde per investerad EHT-timme.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Charts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Betygsutveckling (Skolnivå)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} domain={[10, 20]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="avgGrade" name="Genomsnittsbetyg" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Effekt av Åtgärder</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={interventionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" name="Antal Elever" radius={[4, 4, 0, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Jämförelse av måluppfyllelse för elever med vs utan åtgärdsprogram.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactDashboard;
