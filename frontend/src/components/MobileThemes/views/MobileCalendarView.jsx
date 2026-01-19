import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { api } from '../../../services/api';

/**
 * MobileCalendarView
 * Full calendar with Month/Week/Day tabs.
 */
const MobileCalendarView = () => {
    const [viewMode, setViewMode] = useState('MONTH'); // MONTH, WEEK, DAY
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);

    useEffect(() => {
        // Mock fetching events or real API
        loadEvents();
    }, [currentDate]);

    const loadEvents = async () => {
        // In a real scenario, fetch based on range. 
        // For now, we fetch course schedule from API if possible, or use placeholders.
        try {
            const allCourses = await api.courses.getAll();
            // Transform courses into events (start/end dates)
            const evts = [];
            allCourses.forEach(c => {
                if (c.startDate) evts.push({ date: new Date(c.startDate), title: `Start: ${c.name}`, type: 'COURSE' });
                if (c.endDate) evts.push({ date: new Date(c.endDate), title: `Slut: ${c.name}`, type: 'COURSE_END' });
            });
            // Add some dummy events for today/tomorrow for demo
            const today = new Date();
            evts.push({ date: today, title: 'Personalmöte', type: 'MEETING', time: '10:00' });
            evts.push({ date: new Date(today.getTime() + 86400000), title: 'Workshop', type: 'WORKSHOP', time: '14:00' });

            setEvents(evts);
        } catch (e) { console.error(e); }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        return { days, firstDay: firstDay === 0 ? 6 : firstDay - 1 }; // Adjust for Mon start
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];

    const handleDayClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEvents = events.filter(e => e.date.toDateString() === clickedDate.toDateString());
        setSelectedDateEvents(dayEvents.length > 0 ? dayEvents : [{ title: 'Inga händelser', type: 'NONE' }]);
    };

    return (
        <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
            <h2 className="text-3xl font-bold text-white">Kalender</h2>

            {/* View Switcher */}
            <div className="flex bg-[#1C1C1E] p-1 rounded-xl">
                {['MONTH', 'WEEK', 'DAY'].map(m => (
                    <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === m ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        {m === 'MONTH' ? 'Månad' : m === 'WEEK' ? 'Vecka' : 'Dag'}
                    </button>
                ))}
            </div>

            {/* Calendar Widget */}
            <div className="bg-[#1C1C1E] rounded-[32px] p-6 text-white min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft /></button>
                    <span className="font-bold text-xl">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight /></button>
                </div>

                {viewMode === 'MONTH' && (
                    <>
                        <div className="grid grid-cols-7 mb-4 text-center text-xs font-bold text-gray-500 uppercase">
                            <span>Må</span><span>Ti</span><span>On</span><span>To</span><span>Fr</span><span>Lö</span><span>Sö</span>
                        </div>
                        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center font-medium text-sm">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: days }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                                const hasEvent = events.some(e => e.date.toDateString() === dateStr);
                                const isSelected = false; // Add selection logic if needed

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDayClick(day)}
                                        className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${hasEvent ? 'bg-[#FF6D5A] text-white shadow-lg shadow-orange-500/20' : 'hover:bg-white/10'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Event List for Selected Day */}
                <div className="mt-8 border-t border-white/10 pt-6 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Händelser</p>
                    {selectedDateEvents.length > 0 ? selectedDateEvents.map((e, i) => (
                        <div key={i} className="flex gap-3 items-center">
                            <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                            <div>
                                <p className="font-bold text-sm">{e.title}</p>
                                {e.time && <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {e.time}</p>}
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm opacity-50">Välj ett datum för att se detaljer.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileCalendarView;
