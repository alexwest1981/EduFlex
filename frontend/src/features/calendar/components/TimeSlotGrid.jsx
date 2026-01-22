import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar as CalIcon, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

const TimeSlotGrid = ({ 
    selectedDate, 
    onSlotClick, 
    onEventClick, 
    currentUser,
    viewMode = 'week',
    compact = false 
}) => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);

    // Generate time slots for a single day (10-minute granularity)
    const generateDayTimeSlots = (date) => {
        const slots = [];
        const startTime = new Date(date);
        startTime.setHours(8, 0, 0, 0); // 08:00
        const endTime = new Date(date);
        endTime.setHours(18, 0, 0, 0); // 18:00

        const currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime);
            slotEnd.setMinutes(currentTime.getMinutes() + 10); // 10-minute granularity

            slots.push({
                id: `${date.toISOString().split('T')[0]}-${currentTime.toTimeString()}`,
                startTime: new Date(currentTime),
                endTime: slotEnd,
                isAvailable: true,
                events: []
            });

            currentTime.setTime(slotEnd.getTime());
        }

        return slots;
    };

    // Generate time slots for a week
    const generateWeekTimeSlots = (weekStart) => {
        const weekSlots = {};
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);
            
            weekSlots[i] = generateDayTimeSlots(currentDate);
        }

        return weekSlots;
    };

    // Fetch time slots from API
    const fetchTimeSlots = async () => {
        setIsLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await api.get(`/events/timeslots/${dateStr}`);
            
            if (Array.isArray(response)) {
                setTimeSlots(response);
            } else {
                // Fallback to client-side generation
                if (viewMode === 'day') {
                    setTimeSlots(generateDayTimeSlots(selectedDate));
                } else {
                    setTimeSlots(generateWeekTimeSlots(selectedDate));
                }
            }
        } catch (error) {
            console.error('Error fetching time slots:', error);
            // Fallback to client-side generation
            if (viewMode === 'day') {
                setTimeSlots(generateDayTimeSlots(selectedDate));
            } else {
                setTimeSlots(generateWeekTimeSlots(selectedDate));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch events for the selected period
    const fetchEvents = async () => {
        try {
            let startDate, endDate;
            
            if (viewMode === 'day') {
                startDate = new Date(selectedDate);
                endDate = new Date(selectedDate);
            } else {
                startDate = new Date(selectedDate);
                endDate = new Date(selectedDate);
                endDate.setDate(startDate.getDate() + 6); // Week view
            }

            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            
            const response = await api.get(`/events/range/${startStr}/${endStr}`);
            setEvents(response || []);
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
        }
    };

    useEffect(() => {
        fetchTimeSlots();
        fetchEvents();
    }, [selectedDate, viewMode]);

    // Format time for display
    const formatTime = (date) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Get events for a specific time slot
    const getEventsForSlot = (slot) => {
        return events.filter(event => {
            const eventStart = new Date(event.startTime || event.start);
            const eventEnd = new Date(event.endTime || event.end);
            const slotStart = slot.startTime instanceof Date ? slot.startTime : new Date(slot.startTime);
            const slotEnd = slot.endTime instanceof Date ? slot.endTime : new Date(slot.endTime);

            return (eventStart < slotEnd && eventEnd > slotStart);
        });
    };

    // Handle slot click
    const handleSlotClick = (slot, dayIndex = 0) => {
        const slotEvents = getEventsForSlot(slot);
        
        if (slotEvents.length === 0 && onSlotClick) {
            onSlotClick(slot);
        } else if (slotEvents.length > 0 && onEventClick) {
            onEventClick(slotEvents[0]); // Click first event in slot
        }
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (viewMode === 'day') {
        // Calculate event position and height for flexible display
        const calculateEventStyle = (event, dayStart) => {
            const eventStart = new Date(event.startTime || event.start);
            const eventEnd = new Date(event.endTime || event.end);
            const dayStartMinutes = dayStart.getHours() * 60 + dayStart.getMinutes();
            const eventStartMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
            const eventEndMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();

            const topOffset = eventStartMinutes - dayStartMinutes;
            const durationMinutes = eventEndMinutes - eventStartMinutes;

            // Position relative to 8:00 start (1px per minute)
            const top = topOffset;
            const height = Math.max(durationMinutes, 20); // Minimum 20px

            return {
                position: 'absolute',
                top: `${top}px`,
                height: `${height}px`,
                left: '80px', // After time column
                right: '8px',
                zIndex: 10
            };
        };

        const dayStart = new Date(selectedDate);
        dayStart.setHours(8, 0, 0, 0);
        
        return (
            <div className={`bg-white rounded-lg shadow overflow-hidden ${compact ? 'h-96' : 'h-full'}`}>
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {selectedDate.toLocaleDateString('sv-SE', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Fleksibel tidsbokning
                        </div>
                    </div>
                </div>
                
                <div className="relative overflow-y-auto" style={{ height: compact ? '320px' : '600px' }}>
                    {/* Time grid (10 hours from 8:00 to 18:00 = 600px) */}
                    <div className="relative" style={{ height: '600px' }}>
                        
                        {/* Hour grid lines */}
                        {Array.from({ length: 11 }, (_, i) => {
                            const hour = 8 + i;
                            return (
                                <div
                                    key={`hour-${hour}`}
                                    className="absolute left-0 right-0 border-t border-gray-100"
                                    style={{ top: `${i * 60}px`, height: '60px' }}
                                >
                                    <div className="absolute left-0 w-20 px-3 py-2 text-sm text-gray-500 font-medium">
                                        {hour}:00
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Events */}
                        {events.map((event) => {
                            const style = calculateEventStyle(event, dayStart);
                            return (
                                <div
                                    key={event.id}
                                    className={`text-white px-2 py-1 rounded text-xs shadow-sm 
                                               hover:opacity-90 transition-opacity cursor-pointer
                                               ${getEventColor(event)}`}
                                    style={style}
                                    onClick={() => onEventClick && onEventClick(event)}
                                >
                                    <div className="font-medium truncate">{event.title}</div>
                                    <div className="opacity-90 text-xs">
                                        {formatTime(event.startTime || event.start)} - {formatTime(event.endTime || event.end)}
                                    </div>
                                    {event.description && (
                                        <div className="opacity-80 text-xs truncate">{event.description}</div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Click areas for empty slots */}
                        {generateDayTimeSlots(selectedDate).map((slot) => {
                            const slotHasEvent = events.some(event => {
                                const eventStart = new Date(event.startTime || event.start);
                                const eventEnd = new Date(event.endTime || event.end);
                                return (eventStart < slot.endTime && eventEnd > slot.startTime);
                            });
                            
                            if (!slotHasEvent) {
                                const top = (slot.startTime.getHours() - 8) * 60 + slot.startTime.getMinutes();
                                const height = 10; // 10 minutes = 10px
                                
                                return (
                                    <div
                                        key={slot.id}
                                        className="absolute left-20 right-0 hover:bg-green-50 cursor-pointer transition-colors group"
                                        style={{ 
                                            top: `${top}px`, 
                                            height: `${height}px`,
                                            zIndex: 1
                                        }}
                                        onClick={() => onSlotClick && onSlotClick(slot)}
                                    >
                                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-3 h-3 text-green-600" />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Week view
    return (
        <div className={`bg-white rounded-lg shadow overflow-hidden ${compact ? 'h-96' : 'h-full'}`}>
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Veckovy</h3>
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        10-minuters block
                    </div>
                </div>
            </div>
            
            <div className="overflow-y-auto" style={{ height: compact ? '320px' : '600px' }}>
                {/* Day headers */}
                <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                    <div className="px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-200">
                        Tid
                    </div>
                    {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day, index) => {
                        const currentDate = new Date(selectedDate);
                        currentDate.setDate(selectedDate.getDate() + index);
                        
                        return (
                            <div key={day} className="px-2 py-2 text-center border-r border-gray-200 last:border-r-0">
                                <div className="text-sm font-medium text-gray-700">{day}</div>
                                <div className="text-xs text-gray-500">
                                    {currentDate.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time slots */}
                {timeSlots[0] && timeSlots[0].map((slot, slotIndex) => (
                    <div key={slotIndex} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50">
                        {/* Time column */}
                        <div className="px-3 py-1 text-sm text-gray-500 font-medium border-r border-gray-200">
                            {formatTime(slot.startTime)}
                        </div>
                        
                        {/* Day columns */}
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                            const daySlot = timeSlots[dayIndex]?.[slotIndex];
                            if (!daySlot) return <div key={dayIndex} className="border-r border-gray-200 last:border-r-0"></div>;
                            
                            const slotEvents = getEventsForSlot(daySlot);
                            const hasEvents = slotEvents.length > 0;
                            
                            return (
                                    <div
                                        key={dayIndex}
                                        className={`border-r border-gray-200 last:border-r-0 min-h-[32px] relative
                                                   hover:bg-green-50 cursor-pointer transition-colors`}
                                        onClick={() => handleSlotClick(daySlot, dayIndex)}
                                    >
                                        {hasEvents ? (
                                            <div className="p-1 space-y-0.5">
                                                {slotEvents.map((event) => {
                                                    const eventStart = new Date(event.startTime || event.start);
                                                    const eventEnd = new Date(event.endTime || event.end);
                                                    const duration = Math.round((eventEnd - eventStart) / (1000 * 60));
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={`text-white px-1 py-0.5 rounded text-xs ${getEventColor(event)}
                                                                       hover:opacity-90 transition-opacity cursor-pointer`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onEventClick) onEventClick(event);
                                                            }}
                                                            title={`${event.title} (${duration} min)`}
                                                        >
                                                            <div className="font-medium truncate">{event.title}</div>
                                                            <div className="opacity-90 text-xs">
                                                                {formatTime(eventStart)} ({duration}min)
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Plus className="w-3 h-3 text-green-600" />
                                            </div>
                                        )}
                                    </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimeSlotGrid;