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
                    className={`h-8 w-8 text-xs font-medium rounded-full flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-indigo-600 text-white' :
                            isToday ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' :
                                'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                    {viewDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ChevronLeft size={16} className="text-gray-500" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ChevronRight size={16} className="text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
                    <div key={i} className="h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default MiniCalendar;
