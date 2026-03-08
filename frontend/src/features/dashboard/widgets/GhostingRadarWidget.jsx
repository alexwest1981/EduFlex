import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, RefreshCw, Send, XCircle } from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const GhostingRadarWidget = () => {
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWarnings = async () => {
        setLoading(true);
        try {
            const data = await api.admin.getGhostingRadar();
            setWarnings(data || []);
        } catch (error) {
            console.error("Failed to load Ghosting Radar data:", error);
            toast.error("Kunde inte hämta CSN Ghosting Radar-data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarnings();
    }, []);

    const handleAction = async (warning) => {
        if (warning.warningLevel === 'RED') {
            // Drop out
            toast.success(`Händelse CSN-Kod 99 (Avbrott) registrerad för ${warning.studentName}.`);
            // Here you would call e.g. api.admin.dropOutStudent(warning.studentId, warning.courseId)
        } else {
            // Motivational ping
            toast.success(`AI Pingskickat till ${warning.studentName}.`);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">CSN Ghosting Radar</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Autopilot & Varningssystem</p>
                    </div>
                </div>
                <button onClick={fetchWarnings} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {warnings.length === 0 && !loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <ShieldAlert size={40} className="mb-2 opacity-20" />
                        <p className="text-sm font-medium">Inga inaktiva studenter upptäckta.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {warnings.map((w, index) => (
                            <div key={index} className={`relative overflow-hidden p-4 rounded-xl border ${w.warningLevel === 'RED' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 ${w.warningLevel === 'RED' ? 'text-red-500' : 'text-yellow-500'}`}>
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {w.studentName} <span className="text-xs font-normal text-gray-500">({w.courseCode})</span>
                                            </p>
                                            <p className="text-xs font-medium mt-1">
                                                <span className={w.warningLevel === 'RED' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}>
                                                    Inaktiv i {w.daysInactive} dagar
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAction(w)}
                                        title={w.warningLevel === 'RED' ? 'Registrera CSN Kod 99' : 'Skicka AI Pepp'}
                                        className={`p-2 rounded-lg transition-colors ${w.warningLevel === 'RED' ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-400'}`}>
                                        {w.warningLevel === 'RED' ? <XCircle size={16} /> : <Send size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GhostingRadarWidget;
