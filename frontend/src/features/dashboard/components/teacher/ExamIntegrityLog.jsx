import React, { useState, useEffect } from 'react';
import { ShieldAlert, User, Clock, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../../../../services/api';
import { useTranslation } from 'react-i18next';

const ExamIntegrityLog = ({ quizIds = [] }) => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (quizIds.length === 0) {
            setLoading(false);
            return;
        }

        const fetchEvents = async () => {
            try {
                const data = await api.integrity.getRecent(quizIds);
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch integrity events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();

        const interval = setInterval(() => {
            if (!isPaused) fetchEvents();
        }, 5000); // Poll every 5 seconds for real-time feel

        return () => clearInterval(interval);
    }, [quizIds, isPaused]);

    if (loading) return <div className="p-8 text-center"><RefreshCw className="animate-spin mx-auto text-gray-400" /></div>;

    if (events.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-[#131314] rounded-2xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                <ShieldAlert className="mx-auto text-gray-300 w-12 h-12 mb-2" />
                <p className="text-gray-500 italic">Inga varningshändelser registrerade än.</p>
            </div>
        );
    }

    const getEventIcon = (type) => {
        switch (type) {
            case 'FOCUS_LOST': return <ShieldAlert className="text-red-500" />;
            case 'TAB_SWITCH': return <AlertTriangle className="text-orange-500" />;
            case 'FULLSCREEN_EXIT': return <AlertTriangle className="text-yellow-500" />;
            default: return <Clock className="text-gray-400" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold flex items-center gap-2">
                    <ShieldAlert size={20} className="text-red-600" />
                    Integritetslogg (Realtid)
                </h3>
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`text-xs px-2 py-1 rounded font-bold ${isPaused ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                >
                    {isPaused ? 'Pausad' : 'Live'}
                </button>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden shadow-sm">
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 font-bold uppercase text-[10px] sticky top-0 z-10">
                            <tr>
                                <th className="p-3">Händelse</th>
                                <th className="p-3">Student</th>
                                <th className="p-3">Tenta</th>
                                <th className="p-3">Tid</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                            {events.map(event => (
                                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors">
                                    <td className="p-3 flex items-center gap-2">
                                        {getEventIcon(event.eventType)}
                                        <span className="font-medium whitespace-nowrap">{event.eventType}</span>
                                    </td>
                                    <td className="p-3 font-bold text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] text-indigo-700 dark:text-indigo-300">
                                                <User size={12} />
                                            </div>
                                            {event.studentName || `ID: ${event.studentId}`}
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-500 italic max-w-[150px] truncate">
                                        {event.quizTitle || `ID: ${event.quizId}`}
                                    </td>
                                    <td className="p-3 text-gray-400 text-xs">
                                        {new Date(event.timestamp).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExamIntegrityLog;
