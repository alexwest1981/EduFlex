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
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800/50">
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-2 tracking-tight text-sm">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center">
                    <AlertCircle size={14} className="text-amber-500 dark:text-amber-400" />
                </div>
                Viktiga datum
            </h3>

            <div className="space-y-1.5">
                {importantEvents.map(event => {
                    const isExam = event.type === 'EXAM';
                    const daysLeft = Math.ceil((new Date(event.start) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                        <div
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            className="group flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50"
                        >
                            <div className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl shrink-0 ${isExam
                                    ? 'bg-red-100 dark:bg-red-900/25 text-red-600 dark:text-red-400'
                                    : 'bg-amber-100 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400'
                                }`}>
                                <span className="text-[9px] font-bold uppercase leading-none">
                                    {event.start.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '')}
                                </span>
                                <span className="text-base font-black leading-tight">
                                    {event.start.getDate()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {event.title}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${isExam
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                                        {isExam ? 'Tenta' : 'Obligatorisk'}
                                    </span>
                                    {daysLeft <= 7 && (
                                        <span className={`text-[9px] font-bold ${daysLeft <= 2 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {daysLeft === 0 ? 'Idag' : daysLeft === 1 ? 'Imorgon' : `${daysLeft}d kvar`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-3 py-2 text-[11px] font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50">
                Visa alla <ArrowRight size={11} />
            </button>
        </div>
    );
};

export default ImportantDatesWidget;
