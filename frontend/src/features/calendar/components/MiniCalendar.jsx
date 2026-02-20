import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendar = ({ currentDate, onDateSelect }) => {
    const [viewDate, setViewDate] = useState(currentDate || new Date());

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

    const firstDay = getFirstDayOfMonth(viewDate);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon = 0
    const daysInMonth = getDaysInMonth(viewDate);
    const today = new Date();

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`e-${i}`} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const isSelected = currentDate.getDate() === day &&
            currentDate.getMonth() === viewDate.getMonth() &&
            currentDate.getFullYear() === viewDate.getFullYear();
        const isToday = today.toDateString() === date.toDateString();

        days.push(
            <button
                key={day}
                onClick={() => onDateSelect(date)}
                className={`h-7 w-7 text-xs font-medium rounded-full flex items-center justify-center transition-colors mx-auto ${
                    isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : isToday
                            ? 'ring-1 ring-indigo-400 dark:ring-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252628]'
                }`}
            >
                {day}
            </button>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">
                    {viewDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-0.5">
                    <button onClick={handlePrevMonth} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] transition-colors">
                        <ChevronLeft size={14} />
                    </button>
                    <button onClick={handleNextMonth} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] transition-colors">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-1">
                {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
                    <div key={i} className="h-6 flex items-center justify-center text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5">
                {days}
            </div>
        </div>
    );
};

export default MiniCalendar;
