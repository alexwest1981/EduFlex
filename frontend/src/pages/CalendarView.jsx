import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';

const CalendarView = ({ events = [], navigateTo }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        "Januari", "Februari", "Mars", "April", "Maj", "Juni",
        "Juli", "Augusti", "September", "Oktober", "November", "December"
    ];

    // --- DATUM-LOGIK ---
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const getFirstDayOfMonth = (date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1; // Måndag = 0
    };

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // Filtrera events för aktuell månad för listan under kalendern
    const currentMonthEvents = events.filter(e => {
        const d = new Date(e.dueDate);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // --- RENDERING ---
    const renderCalendarGrid = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Tomma rutor före den 1:a
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/30 border-b border-r border-gray-100"></div>);
        }

        // Dagar
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Hitta events för denna dag
            const daysEvents = events.filter(e => e.dueDate.startsWith(dateStr));
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            days.push(
                <div key={day} className={`h-32 border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 relative group ${isToday ? 'bg-indigo-50/30' : ''}`}>
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700'}`}>
                        {day}
                    </span>

                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {daysEvents.map((evt, idx) => (
                            <div
                                key={idx}
                                title={`${evt.title} (${evt.courseCode})`}
                                className={`text-xs px-2 py-1 rounded truncate cursor-pointer shadow-sm border-l-2 ${
                                    evt.type === 'COURSE_START'
                                        ? 'bg-blue-100 text-blue-800 border-blue-500'
                                        : 'bg-red-100 text-red-800 border-red-500'
                                }`}
                            >
                                {evt.type === 'COURSE_START' ? '🚀 ' : '⏰ '}{evt.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="animate-in fade-in h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kalender</h1>
                    <p className="text-gray-500">Håll koll på dina deadlines och kursstarter.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft/></button>
                    <span className="font-bold text-lg w-32 text-center">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight/></button>
                </div>
            </div>

            <div className="flex gap-8 flex-1 overflow-hidden">
                {/* Själva Kalendern */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden">
                    <div className="grid grid-cols-7 border-b bg-gray-50">
                        {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(d => (
                            <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 overflow-y-auto flex-1">
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Sidopanel med lista */}
                <div className="w-80 bg-white rounded-2xl shadow-sm border p-6 overflow-y-auto hidden xl:block">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CalendarIcon size={18} className="text-indigo-600"/> Händer i {months[currentDate.getMonth()]}
                    </h3>

                    {currentMonthEvents.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Ingenting inplanerat denna månad.</p>
                    ) : (
                        <div className="space-y-3">
                            {currentMonthEvents.map((evt, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border hover:shadow-md transition-shadow bg-gray-50">
                                    <div className={`mt-1 p-1.5 rounded-full ${evt.type === 'COURSE_START' ? 'bg-blue-200 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                                        {evt.type === 'COURSE_START' ? <CalendarIcon size={14}/> : <Clock size={14}/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{evt.title}</div>
                                        <div className="text-xs text-gray-500 mb-1">{evt.courseName}</div>
                                        <div className={`text-xs font-bold ${evt.type === 'COURSE_START' ? 'text-blue-600' : 'text-red-500'}`}>
                                            {new Date(evt.dueDate).toLocaleDateString()}
                                            {evt.type !== 'COURSE_START' && `, kl ${new Date(evt.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;