import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../../services/api';

const StudentAttendanceWidget = ({ currentUser, settings }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchStatus = async () => {
            try {
                const data = await api.get(`/analytics/my-status?studentId=${currentUser.id}`);
                setStatus(data);
            } catch (error) {
                console.error("Failed to load attendance status", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [currentUser]);

    if (!settings?.enabled) return null;
    if (loading) return <div className="animate-pulse h-32 bg-gray-100 dark:bg-[#131314] rounded-xl"></div>;
    if (!status) return null;

    const getStatusColor = (risk) => {
        switch (risk) {
            case 'High': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30';
            case 'Medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30';
            case 'Low': default: return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30';
        }
    };

    const getStatusIcon = (risk) => {
        switch (risk) {
            case 'High': return <AlertTriangle size={24} />;
            case 'Medium': return <Clock size={24} />;
            case 'Low': default: return <CheckCircle size={24} />;
        }
    };

    const riskColorClass = getStatusColor(status.riskLevel);

    return (
        <div className="bg-white dark:bg-[#1E1F20] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity size={18} className="text-indigo-500" />
                    Min Digitala Närvaro
                </h3>
                <div className={`p-2 rounded-lg border ${riskColorClass}`}>
                    {getStatusIcon(status.riskLevel)}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Aktivitetsnivå</span>
                        <span className="font-bold text-gray-900 dark:text-white">{status.healthScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${status.riskLevel === 'High' ? 'bg-red-500' : status.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${status.healthScore}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-gray-50 dark:bg-[#282a2c] rounded-lg">
                        <p className="text-gray-500 mb-1">Registrerad tid</p>
                        <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{status.hoursLogged}h</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-[#282a2c] rounded-lg">
                        <p className="text-gray-500 mb-1">Mål (Vecka)</p>
                        <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{status.expectedHours}h</p>
                    </div>
                </div>

                {status.riskLevel === 'High' && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                        Obs! Din närvaro är låg. Kontakta din mentor.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendanceWidget;
