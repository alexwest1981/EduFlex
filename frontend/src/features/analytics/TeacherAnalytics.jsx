import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const TeacherAnalytics = ({ courseId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (courseId) fetchAnalytics();
    }, [courseId]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            // Assuming courseId might need a prefix or we use the ID directly. 
            // In Cmi5Service we saved packages with courseId. 
            // But LrsController filter by 'objectId' which contains course info.
            // For now, let's assume we pass a course prefix or the ID is enough if backend handles it.
            // Adjust backend if needed to filter properly by courseId relation.
            // For MVP: sending courseId as string.
            const response = await api.teacher.getCourseAnalytics(courseId);
            setData(response);
        } catch (err) {
            console.error("Failed to load analytics", err);
            setError("Kunde inte hämta analysdata.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
    if (error) return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
    if (!data) return null;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const completionData = [
        { name: 'Klara', value: data.completedLearners },
        { name: 'Ej Klara', value: data.totalLearners - data.completedLearners },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                        <h4 className="text-sm font-medium text-gray-500">Aktiva Studenter</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalLearners}</p>
                </div>

                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                        <h4 className="text-sm font-medium text-gray-500">Genomsnittlig Slutförande</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.completionRate.toFixed(1)}%</p>
                </div>

                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle size={20} /></div>
                        <h4 className="text-sm font-medium text-gray-500">Risk för Drop-off</h4>
                    </div>
                    {/* Just logic: if completion < 50% call it High, else Low */}
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.completionRate < 50 ? 'Hög' : 'Låg'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Slutförande Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={completionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {completionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Drop-off Analys (Per Aktivitet)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dropOffAnalysis}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="objectId" hide />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="initialized" name="Startad" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completed" name="Slutförd" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAnalytics;
