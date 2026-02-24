import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MiniCalendar = ({ currentDate, onDateSelect }) => {
    const [viewDate, setViewDate] = useState(currentDate || new Date());

    // Get first day of month
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    // Get days in month
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDay = getFirstDayOfMonth(viewDate);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon = 0
    const daysInMonth = getDaysInMonth(viewDate);

    // Navigation
    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // Generate calendar grid
    const renderCalendarDays = () => {
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const isSelected = currentDate.getDate() === day &&
                currentDate.getMonth() === viewDate.getMonth() &&
                currentDate.getFullYear() === viewDate.getFullYear();

            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
                <button
                    key={day}
                    onClick={() => onDateSelect(date)}
                    className={`h-7 w-7 text-xs rounded-full flex items-center justify-center transition-all
                        ${isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-400/30'
                            : isToday
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-extrabold ring-1 ring-indigo-300 dark:ring-indigo-700'
                                : 'text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white capitalize tracking-tight">
                    {viewDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-0.5">
                    <button onClick={handlePrevMonth} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <ChevronLeft size={14} className="text-gray-400" />
                    </button>
                    <button onClick={handleNextMonth} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <ChevronRight size={14} className="text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-1">
                {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
                    <div key={i} className={`h-7 flex items-center justify-center text-[10px] font-bold tracking-wide ${i === 6 ? 'text-red-400' : 'text-gray-300 dark:text-gray-600'}`}>
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5 justify-items-center">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default MiniCalendar;
