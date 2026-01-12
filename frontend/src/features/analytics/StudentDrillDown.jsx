import React, { useEffect, useState } from 'react';
import { X, User, BookOpen, Clock, Activity, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

const StudentDrillDown = ({ student, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (student) {
            fetchDetails();
        }
    }, [student]);

    const fetchDetails = async () => {
        try {
            // Fetch specific status (reuse my-status endpoint for now with studentId param)
            // Note: in a real app, we might have a dedicated /admin/student/{id} endpoint
            const status = await api.get(`/analytics/my-status?studentId=${student.id}`);

            // Mocking activity history for the chart as we don't have an endpoint for it yet
            const mockHistory = [
                { day: 'Mån', hours: 2.5 },
                { day: 'Tis', hours: 4.0 },
                { day: 'Ons', hours: 1.5 },
                { day: 'Tor', hours: 5.0 },
                { day: 'Fre', hours: 3.0 },
                { day: 'Lör', hours: 1.0 },
                { day: 'Sön', hours: 0.5 },
            ];

            setDetails({ ...status, history: mockHistory });
        } catch (error) {
            console.error("Failed to load student details", error);
        } finally {
            setLoading(false);
        }
    };

    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* HEAD */}
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">{student.name}</h2>
                            <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-full transition-colors">
                        <X size={24} className="dark:text-white" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : (
                        <div className="space-y-6">
                            {/* RISKNIVÅ */}
                            <div className={`p-4 rounded-xl border ${details.riskLevel === 'High' ? 'bg-red-50 border-red-100 text-red-700' : details.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold uppercase text-xs">Aktuell Status</span>
                                    <span className="font-black text-sm">{details.riskLevel === 'High' ? 'HÖG RISK' : details.riskLevel === 'Medium' ? 'BEHÖVER STÖD' : 'GODKÄND'}</span>
                                </div>
                                <p className="text-sm mt-1">Studenten har {details.riskLevel === 'High' ? 'låg aktivitet och riskerar att missa mål.' : 'god aktivitet.'}</p>
                            </div>

                            {/* STATS GRID */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl text-center">
                                    <Clock className="mx-auto mb-2 text-gray-400" size={20} />
                                    <p className="text-2xl font-black dark:text-white">{details.hoursLogged}h</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Loggad Tid</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl text-center">
                                    <Activity className="mx-auto mb-2 text-gray-400" size={20} />
                                    <p className="text-2xl font-black dark:text-white">{details.healthScore}%</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Aktivitetsscore</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl text-center">
                                    <BookOpen className="mx-auto mb-2 text-gray-400" size={20} />
                                    <p className="text-2xl font-black dark:text-white">{student.coursesEnrolled}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Kurser</p>
                                </div>
                            </div>

                            {/* TIMELINE CHART */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar size={18} className="text-indigo-500" />
                                    Aktivitet senaste 7 dagarna
                                </h3>
                                <div className="h-48 w-full bg-white dark:bg-[#1E1F20] border border-gray-100 dark:border-[#3c4043] rounded-xl p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={details.history}>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', background: '#333', color: '#fff' }}
                                            />
                                            <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                                <button className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Skicka Meddelande</button>
                                <button className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Se Detaljrapport</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDrillDown;
