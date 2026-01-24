import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const CalendarWidget = () => {
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // We need to add this method to api.js or call fetch directly
                // Using direct fetch for likely un-updated api service file
                const token = localStorage.getItem('token');
                const tenantId = localStorage.getItem('tenantId'); // Assuming stored

                // Construct Headers
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };
                if (tenantId) headers['X-Tenant-ID'] = tenantId;

                // Use api.events.getDashboardSummary if available, else fetch
                // Let's try to stick to api.js pattern if possible, but for speed I'll assume 
                // we might need to patch api.js. 
                // Actually, let's just use the direct fetch pattern to be safe for this new endpoint.
                const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
                const res = await fetch(`${BASE_URL}/events/dashboard-summary`, { headers });

                if (!res.ok) throw new Error("Failed to fetch calendar summary");

                const data = await res.json();
                setSummary(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (isLoading) return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center animate-pulse">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-20 w-full bg-gray-100 dark:bg-gray-900 rounded"></div>
        </div>
    );

    if (error) return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 h-full flex flex-col items-center justify-center text-red-500">
            <AlertCircle size={24} className="mb-2" />
            <p className="text-sm">Kunde inte ladda kalender</p>
        </div>
    );

    const { todayEvents, stats } = summary;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Dagens Schema
                </h3>
                <span className="text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                    {new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
            </div>

            {/* Today's Events List */}
            <div className="flex-1 overflow-y-auto min-h-[150px] mb-4 space-y-3 custom-scrollbar">
                {todayEvents && todayEvents.length > 0 ? (
                    todayEvents.map(event => (
                        <div key={event.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 transition-colors group">
                            <div className="flex flex-col items-center justify-center min-w-[50px] text-center border-r border-gray-200 dark:border-gray-600 pr-3">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {new Date(event.startTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {new Date(event.endTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {event.title}
                                </h4>
                                {event.topic && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                                        {event.topic}
                                    </p>
                                )}
                            </div>
                            <div className={`w-1.5 rounded-full ${event.type === 'MEETING' ? 'bg-orange-400' :
                                    event.type === 'LESSON' ? 'bg-blue-500' :
                                        event.type === 'EXAM' ? 'bg-red-500' : 'bg-gray-400'
                                }`} />
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 italic text-sm">
                        <Clock size={32} className="mb-2 opacity-20" />
                        Inga händelser idag
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="block text-xl font-bold text-gray-900 dark:text-white">{stats.today}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Idag</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="block text-xl font-bold text-gray-900 dark:text-white">{stats.week}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Vecka</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="block text-xl font-bold text-gray-900 dark:text-white">{stats.month}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Månad</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;
