import React from 'react';
import { AlertCircle, Calendar, ArrowRight } from 'lucide-react';

const ImportantDatesWidget = ({ events = [], onEventClick }) => {
    // Filter for "Important" events: EXAM, or isMandatory, or ASSIGNMENT
    const importantEvents = events
        .filter(e => e.type === 'EXAM' || e.isMandatory || e.type === 'ASSIGNMENT')
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .filter(e => new Date(e.start) >= new Date(new Date().setHours(0, 0, 0, 0))) // Future only
        .slice(0, 5); // Take top 5

    if (importantEvents.length === 0) return null;

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 mt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                Viktiga Datum
            </h3>

            <div className="space-y-3">
                {importantEvents.map(event => (
                    <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="group flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                    >
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${event.type === 'EXAM' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            }`}>
                            <span className="text-xs font-bold uppercase">
                                {event.start.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '')}
                            </span>
                            <span className="text-lg font-black leading-none">
                                {event.start.getDate()}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                                {event.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                    {event.type === 'EXAM' ? 'Tenta' : 'Obligatorisk'}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                    {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1">
                Visa alla <ArrowRight size={12} />
            </button>
        </div>
    );
};

export default ImportantDatesWidget;
