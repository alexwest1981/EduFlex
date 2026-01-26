import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus } from 'lucide-react';
import { api } from '../../../services/api';

const MonthView = ({ 
    selectedDate, 
    onDateClick, 
    onEventClick, 
    currentUser,
    events = []
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const [monthEvents, setMonthEvents] = useState([]);

    // Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfWeek = firstDay.getDay();
        
        // Adjust for Monday-first week (0 = Monday, 6 = Sunday)
        const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        return {
            daysInMonth,
            firstDayOfWeek: adjustedFirstDay,
            firstDay,
            lastDay
        };
    };

    // Generate calendar days array
    const generateCalendarDays = () => {
        const { daysInMonth, firstDayOfWeek } = getDaysInMonth(currentMonth);
        const days = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
        }
        
        return days;
    };

    // Fetch events for the current month
    const fetchMonthEvents = async () => {
        try {
            const { firstDay, lastDay } = getDaysInMonth(currentMonth);
            
            const startDateStr = firstDay.toISOString().split('T')[0];
            const endDateStr = lastDay.toISOString().split('T')[0];
            
            const response = await api.get(`/events/range/${startDateStr}/${endDateStr}`);
            setMonthEvents(response || []);
        } catch (error) {
            console.error('Error fetching month events:', error);
            setMonthEvents([]);
        }
    };

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    // Navigate to next month
    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Check if a date has events
    const getEventsForDate = (date) => {
        if (!date) return [];
        
        return monthEvents.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate.getDate() === date.getDate() &&
                   eventDate.getMonth() === date.getMonth() &&
                   eventDate.getFullYear() === date.getFullYear();
        });
    };

    // Get event color based on type
    const getEventColor = (event) => {
        const colors = {
            LESSON: 'bg-blue-500',
            MEETING: 'bg-green-500',
            WORKSHOP: 'bg-purple-500',
            EXAM: 'bg-red-500',
            ASSIGNMENT: 'bg-orange-500',
            OTHER: 'bg-gray-500'
        };
        return colors[event.type] || colors.OTHER;
    };

    // Check if date is today
    const isToday = (date) => {
        const today = new Date();
        return date && date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // Check if date is selected
    const isSelected = (date) => {
        return date && selectedDate &&
               date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    useEffect(() => {
        fetchMonthEvents();
    }, [currentMonth]);

    const calendarDays = generateCalendarDays();
    const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {currentMonth.toLocaleDateString('sv-SE', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                            <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <button
                            onClick={goToNextMonth}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                            <ChevronRight size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Week day headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {weekDays.map(day => (
                    <div key={day} className="px-2 py-2 text-center text-xs font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7">
                    {calendarDays.map((date, index) => {
                        const dayEvents = getEventsForDate(date);
                        const hasEvents = dayEvents.length > 0;
                        const isTodayDate = isToday(date);
                        const isSelectedDate = isSelected(date);
                        
                        return (
                            <div
                                key={index}
                                onClick={() => date && onDateClick(date)}
                                className={`
                                    min-h-[80px] border-r border-b border-gray-200 last:border-r-0 p-1
                                    ${!date ? 'bg-gray-50' : ''}
                                    ${isTodayDate ? 'bg-blue-50' : ''}
                                    ${isSelectedDate ? 'bg-indigo-100 ring-1 ring-indigo-500' : ''}
                                    ${date && !isTodayDate && !isSelectedDate ? 'hover:bg-gray-50 cursor-pointer' : ''}
                                `}
                            >
                                {date && (
                                    <>
                                        {/* Date number */}
                                        <div className={`
                                            text-sm font-medium mb-1
                                            ${isTodayDate ? 'text-blue-600' : 'text-gray-900'}
                                            ${isSelectedDate ? 'text-indigo-600' : ''}
                                        `}>
                                            {date.getDate()}
                                        </div>

                                        {/* Events */}
                                        {hasEvents && (
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                                    <div
                                                        key={event.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEventClick(event);
                                                        }}
                                                        className={`
                                                            text-white text-xs px-1 py-0.5 rounded truncate cursor-pointer
                                                            hover:opacity-90 transition-opacity
                                                            ${getEventColor(event)}
                                                        `}
                                                        title={event.title}
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                                
                                                {dayEvents.length > 3 && (
                                                    <div className="text-xs text-gray-500 text-center">
                                                        +{dayEvents.length - 3} mer
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Add event indicator for empty days */}
                                        {!hasEvents && currentUser && ['ADMIN', 'TEACHER', 'PRINCIPAL', 'MENTOR'].includes(currentUser.role?.name) && (
                                            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Plus size={12} className="text-gray-400" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer with month stats */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                        {monthEvents.length} händelser denna månad
                    </span>
                    <span>
                        {new Set(monthEvents.map(e => e.type)).size} olika typer
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MonthView;
