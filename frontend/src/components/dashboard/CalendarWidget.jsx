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
                const data = await api.events.getDashboardSummary();
                setSummary(data);
            } catch (err) {
                console.error("Failed to fetch calendar summary", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (isLoading) return (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--card-shadow)] border border-[var(--border-main)] h-full flex flex-col items-center justify-center animate-pulse">
            <div className="h-4 w-32 bg-[var(--bg-input)] rounded mb-4"></div>
            <div className="h-20 w-full bg-[var(--bg-input)] rounded"></div>
        </div>
    );

    if (error) return (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--card-shadow)] border border-red-500/20 h-full flex flex-col items-center justify-center text-red-500">
            <AlertCircle size={24} className="mb-2" />
            <p className="text-sm">Kunde inte ladda kalender</p>
        </div>
    );

    const { todayEvents, stats } = summary;

    return (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--card-shadow)] border border-[var(--border-main)] h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
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
                        <div key={event.id} className="flex gap-3 p-3 rounded-lg bg-[var(--bg-input)]/50 border border-[var(--border-main)] hover:border-indigo-500 transition-colors group">
                            <div className="flex flex-col items-center justify-center min-w-[50px] text-center border-r border-[var(--border-main)] pr-3">
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                    {new Date(event.startTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-[var(--text-secondary)]">
                                    {new Date(event.endTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-indigo-500 transition-colors">
                                    {event.title}
                                </h4>
                                {event.topic && (
                                    <p className="text-xs text-[var(--text-secondary)] truncate flex items-center gap-1 mt-0.5">
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
            <div className="border-t border-[var(--border-main)] pt-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-[var(--bg-input)]">
                    <span className="block text-xl font-bold text-[var(--text-primary)]">{stats.today}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">Idag</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-[var(--bg-input)]">
                    <span className="block text-xl font-bold text-[var(--text-primary)]">{stats.week}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">Vecka</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-[var(--bg-input)]">
                    <span className="block text-xl font-bold text-[var(--text-primary)]">{stats.month}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">Månad</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;
