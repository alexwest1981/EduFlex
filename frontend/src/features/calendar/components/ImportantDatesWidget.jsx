import React from 'react';
import { ArrowRight } from 'lucide-react';

const TYPE_COLORS = {
    EXAM:       'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300',
    ASSIGNMENT: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
    default:    'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
};

const TYPE_LABEL = { EXAM: 'Tenta', ASSIGNMENT: 'Uppgift', default: 'Obligatorisk' };

const ImportantDatesWidget = ({ events = [], onEventClick }) => {
    const importantEvents = events
        .filter(e => e.type === 'EXAM' || e.isMandatory || e.type === 'ASSIGNMENT')
        .filter(e => new Date(e.start) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5);

    if (importantEvents.length === 0) return null;

    return (
        <div>
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Viktiga datum
            </p>

            <div className="space-y-1">
                {importantEvents.map(event => {
                    const colorCls = TYPE_COLORS[event.type] || TYPE_COLORS.default;
                    const label = TYPE_LABEL[event.type] || TYPE_LABEL.default;
                    return (
                        <div
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#252628] cursor-pointer transition-colors"
                        >
                            <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl shrink-0 text-center ${colorCls}`}>
                                <span className="text-[9px] font-bold uppercase leading-none">
                                    {event.start.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '')}
                                </span>
                                <span className="text-base font-black leading-tight">
                                    {event.start.getDate()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {event.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        {label}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        · {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImportantDatesWidget;
