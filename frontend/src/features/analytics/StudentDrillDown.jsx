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
            const statusPromise = api.get(`/analytics/my-status?studentId=${student.id}`);
            const logsPromise = api.activity.getGlobalStudentLogs(student.id);

            const [status, logs] = await Promise.all([statusPromise, logsPromise]);

            // Process logs for chart
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return {
                    dateStr: d.toLocaleDateString('sv-SE'), // 2024-01-01
                    label: d.toLocaleDateString('sv-SE', { weekday: 'short' }) // Mån
                };
            });

            // Map logs to days (count activities as a proxy for "hours" or "activity")
            const history = last7Days.map(({ dateStr, label }) => {
                const count = logs ? logs.filter(l => new Date(l.timestamp).toLocaleDateString('sv-SE') === dateStr).length : 0;
                // Assuming roughly 0.5h per activity if we want to keep "hours" scale, or just show count
                return { day: label, hours: count * 0.5 };
            });

            setDetails({ ...status, logs: logs || [], history });
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

                            {/* SENASTE HÄNDELSER */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock size={18} className="text-indigo-500" />
                                    Senaste Händelser
                                </h3>
                                <div className="bg-white dark:bg-[#1E1F20] border border-gray-100 dark:border-[#3c4043] rounded-xl overflow-hidden">
                                    {details.logs && details.logs.length > 0 ? (
                                        <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                            {details.logs.slice(0, 5).map((log, idx) => (
                                                <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${log.activityType === 'LOGIN' ? 'bg-green-100 text-green-600' :
                                                            log.activityType === 'VIEW_LESSON' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {log.activityType === 'LOGIN' ? <User size={16} /> : <BookOpen size={16} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {log.activityType === 'LOGIN' ? 'Inloggning' :
                                                                    log.activityType === 'VIEW_LESSON' ? 'Öppnade lektion' :
                                                                        log.activityType}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{log.details || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="p-4 text-sm text-gray-500 italic text-center">Ingen aktivitet registrerad än.</p>
                                    )}
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
