import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Loader2, Plus, X, AlertCircle, Video, Users, User, ArrowLeft, ArrowRight, Check, Trash2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useDesignSystem } from '../../context/DesignSystemContext';
import EventDetailPanel from './EventDetailPanel';
import MiniCalendar from './components/MiniCalendar';
import ImportantDatesWidget from './components/ImportantDatesWidget';
import CalendarFilter from './components/CalendarFilter';

// --- UTILS ---
function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function addDays(d, days) {
    var date = new Date(d.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

const CalendarView = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const { theme } = useDesignSystem();

    // Auth Logic
    const roleName = currentUser?.role?.name || currentUser?.role || '';
    const isTeacherOrAdmin = ['ADMIN', 'TEACHER', 'MENTOR'].includes(roleName); // Added MENTOR just in case

    // Data State
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [calEvents, setCalEvents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ totalStudents: 0, totalClasses: 0 });

    // Filter State
    const [primaryFilter, setPrimaryFilter] = useState(null);
    const [secondaryFilter, setSecondaryFilter] = useState(null);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [secondaryFilteredEvents, setSecondaryFilteredEvents] = useState([]);

    // UI State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDetail, setShowEventDetail] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', startTime: '', endTime: '', date: '',
        type: 'MEETING', courseId: '', ownerId: '', status: 'CONFIRMED',
        platform: 'NONE', topic: '', isMandatory: false
    });

    const isDark = theme === 'midnight' || theme === 'voltage';

    // --- FETCHING ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            console.log("fetchData: isTeacherOrAdmin=", isTeacherOrAdmin, "currentUser.id=", currentUser?.id);
            const [eventsRes, coursesRes, usersRes] = await Promise.all([
                // Fetch only current user's events by default
                currentUser?.id
                    ? api.get(`/events/user/${currentUser.id}`).catch(err => { console.error("Events fetch error", err); return []; })
                    : api.get('/events').catch(err => { console.error("Events fetch error", err); return []; }),
                (!isTeacherOrAdmin && currentUser?.id)
                    ? api.courses.getMyCourses(currentUser.id).catch(err => { console.error("My Courses fetch error", err); return []; })
                    : api.get('/courses').catch(err => { console.error("Courses fetch error", err); return []; }),
                (!isTeacherOrAdmin)
                    ? api.users.getRelated().catch(err => { console.error("Related fetch error", err); return []; })
                    : api.users.getAll().catch(err => { console.error("Users fetch error", err); return { content: [] }; })
            ]);

            console.log("fetchData: coursesRes=", coursesRes);
            setCourses(coursesRes || []);
            // Handle both Page<User> (content) and List<User> (direct array)
            const rawUsersData = usersRes?.content || usersRes || [];
            const usersData = Array.isArray(rawUsersData) ? rawUsersData : [];
            setUsers(usersData);

            const eventsData = eventsRes || [];
            if (Array.isArray(eventsData)) {
                const mapped = eventsData.map(e => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    start: new Date(e.startTime),
                    end: new Date(e.endTime),
                    type: e.type,
                    status: e.status,
                    platform: e.platform,
                    meetingLink: e.meetingLink,
                    isMandatory: e.isMandatory,
                    topic: e.topic,
                    courseId: e.course?.id,
                    ownerId: e.owner?.id,
                    ownerName: e.owner ? `${e.owner.firstName} ${e.owner.lastName}` : 'Okänd'
                }));
                setCalEvents(mapped);
            }

            // Calculate statistics (with safety checks)
            const studentCount = Array.isArray(usersData) ? usersData.filter(u => u.role?.name === 'STUDENT' || u.role === 'STUDENT').length : 0;
            const classCount = Array.isArray(eventsData) ? eventsData.filter(e => e.type === 'LESSON').length : 0;
            setStats({ totalStudents: studentCount, totalClasses: classCount });
        } catch (error) {
            console.error("Failed to load calendar data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [weekStart]);

    // --- FILTER HANDLERS ---
    const fetchFilteredEvents = async (filter) => {
        if (!filter) return [];
        try {
            if (filter.type === 'user') {
                const events = await api.get(`/events/user/${filter.value.id}`);
                return events.map(e => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    start: new Date(e.startTime),
                    end: new Date(e.endTime),
                    type: e.type,
                    status: e.status,
                    platform: e.platform,
                    meetingLink: e.meetingLink,
                    isMandatory: e.isMandatory,
                    topic: e.topic,
                    courseId: e.course?.id,
                    ownerId: e.owner?.id,
                    ownerName: e.owner ? `${e.owner.firstName} ${e.owner.lastName}` : 'Okänd',
                    isFiltered: true
                }));
            } else if (filter.type === 'course') {
                const events = await api.get(`/events/course/${filter.value.id}`);
                return events.map(e => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    start: new Date(e.startTime),
                    end: new Date(e.endTime),
                    type: e.type,
                    status: e.status,
                    platform: e.platform,
                    meetingLink: e.meetingLink,
                    isMandatory: e.isMandatory,
                    topic: e.topic,
                    courseId: e.course?.id,
                    ownerId: e.owner?.id,
                    ownerName: e.owner ? `${e.owner.firstName} ${e.owner.lastName}` : 'Okänd',
                    isFiltered: true
                }));
            }
        } catch (error) {
            console.error('Failed to fetch filtered events:', error);
            return [];
        }
    };

    const handleFilterChange = async ({ type, value, isPrimary }) => {
        if (type === 'clear') {
            if (isPrimary) {
                setPrimaryFilter(null);
                setFilteredEvents([]);
            } else {
                setSecondaryFilter(null);
                setSecondaryFilteredEvents([]);
            }
            return;
        }

        const filter = { type, value };

        if (isPrimary) {
            setPrimaryFilter(filter);
            const events = await fetchFilteredEvents(filter);
            setFilteredEvents(events);
        } else {
            setSecondaryFilter(filter);
            const events = await fetchFilteredEvents(filter);
            setSecondaryFilteredEvents(events);
        }
    };

    // Merge events: use filtered if available, otherwise use all events
    const displayEvents = primaryFilter ? filteredEvents : calEvents;

    // --- HANDLERS ---
    const handlePrevWeek = () => setWeekStart(addDays(weekStart, -7));
    const handleNextWeek = () => setWeekStart(addDays(weekStart, 7));

    const handleSlotClick = (dayDate, hour) => {
        // if (!isTeacherOrAdmin) {
        //     // Optional: Show toast "You cannot book"
        //     return;
        // }
        // Use local date formatting to avoid timezone shifts
        const year = dayDate.getFullYear();
        const month = String(dayDate.getMonth() + 1).padStart(2, '0');
        const day = String(dayDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`;

        setNewEvent({
            ...newEvent,
            date: dateStr,
            startTime: timeStr,
            endTime: endTimeStr,
            type: 'MEETING',
            ownerId: '' // Reset
        });
        setShowBookingModal(true);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const startStr = `${newEvent.date}T${newEvent.startTime}:00`;
            const endStr = `${newEvent.date}T${newEvent.endTime}:00`;

            const payload = {
                title: newEvent.title || 'Ny händelse',
                description: newEvent.description,
                startTime: startStr,
                endTime: endStr,
                type: isTeacherOrAdmin ? newEvent.type : 'MEETING',
                status: isTeacherOrAdmin ? newEvent.status : 'PENDING',
                platform: newEvent.platform,
                topic: newEvent.topic,
                isMandatory: isTeacherOrAdmin ? (newEvent.isMandatory || false) : false,
                courseId: newEvent.courseId ? parseInt(newEvent.courseId) : null,
                ownerId: newEvent.ownerId ? parseInt(newEvent.ownerId) : null
            };

            console.log("Creating event with payload:", payload);
            await api.post('/events', payload);
            setShowBookingModal(false);
            fetchData(); // Refresh
        } catch (err) {
            console.error("Booking error", err);
            alert("Kunde inte boka händelsen.");
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Är du säker på att du vill ta bort denna bokning?')) return;
        try {
            await api.delete(`/events/${eventId}`);
            fetchData(); // Refresh
        } catch (err) {
            console.error("Delete error", err);
            alert("Kunde inte ta bort händelsen.");
        }
    };

    const handleUpdateEventStatus = async (eventId, newStatus) => {
        try {
            await api.patch(`/events/${eventId}/status`, { status: newStatus });
            fetchData(); // Refresh
        } catch (err) {
            console.error("Status update error", err);
            alert("Kunde inte uppdatera status.");
        }
    };

    // --- RENDER HELPERS ---
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 - 18:00
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)); // Mon-Sun
    const [selectedMobileDate, setSelectedMobileDate] = useState(new Date()); // State for mobile selection

    const getEventsForSlot = (dayDate, hour) => {
        return displayEvents.filter(e => {
            const eDate = e.start;
            return eDate.getDate() === dayDate.getDate() &&
                eDate.getMonth() === dayDate.getMonth() &&
                eDate.getHours() === hour;
        });
    };

    // Get all events for a specific day (for absolute positioning)
    const getEventsForDay = (dayDate) => {
        const primaryEvents = displayEvents.filter(e => {
            const eDate = e.start;
            return eDate.getDate() === dayDate.getDate() &&
                eDate.getMonth() === dayDate.getMonth() &&
                eDate.getFullYear() === dayDate.getFullYear();
        });

        // Add secondary filtered events with a flag
        const secondaryEvents = secondaryFilter ? secondaryFilteredEvents.filter(e => {
            const eDate = e.start;
            return eDate.getDate() === dayDate.getDate() &&
                eDate.getMonth() === dayDate.getMonth() &&
                eDate.getFullYear() === dayDate.getFullYear();
        }).map(e => ({ ...e, isSecondary: true })) : [];

        return [...primaryEvents, ...secondaryEvents];
    };

    // Calculate event position and height
    const getEventStyle = (event) => {
        const startHour = event.start.getHours();
        const startMinute = event.start.getMinutes();
        const endHour = event.end.getHours();
        const endMinute = event.end.getMinutes();

        // Calculate position from 8:00 (first hour)
        const startOffset = (startHour - 8) + (startMinute / 60);
        const endOffset = (endHour - 8) + (endMinute / 60);
        const duration = endOffset - startOffset;

        // Each hour block is 80px (h-20 = 5rem = 80px)
        const hourHeight = 80;
        const top = startOffset * hourHeight;
        const height = Math.max(duration * hourHeight, 20); // Minimum 20px

        return {
            top: `${top}px`,
            height: `${height}px`
        };
    };

    const getEventTypeStyles = (type, isSecondary = false, status = 'CONFIRMED') => {
        // Lower opacity for pending status
        const isPending = status === 'PENDING';
        const secondaryOpacity = isSecondary ? 'opacity-50' : '';
        const pendingOpacity = isPending ? 'opacity-70' : '';

        let baseClasses = '';
        switch (type) {
            case 'LESSON': baseClasses = 'bg-orange-500 text-white'; break;
            case 'EXAM': baseClasses = 'bg-red-500 text-white'; break;
            case 'WORKSHOP': baseClasses = 'bg-teal-500 text-white'; break;
            case 'MEETING': baseClasses = 'bg-purple-500 text-white'; break;
            case 'ASSIGNMENT': baseClasses = 'bg-yellow-500 text-white'; break;
            default: baseClasses = 'bg-gray-500 text-white'; break;
        }

        return `${baseClasses} ${secondaryOpacity} ${pendingOpacity}`;
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'LESSON': return <Users size={16} />;
            case 'EXAM': return <AlertCircle size={16} />;
            case 'WORKSHOP': return <Video size={16} />;
            case 'MEETING': return <User size={16} />;
            default: return <Clock size={16} />;
        }
    };

    // Mobile Event Card Render
    const renderMobileEventCard = (event) => (
        <div
            key={event.id}
            onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
            className={`p-4 rounded-xl shadow-sm mb-3 flex items-start gap-4 transition-transform active:scale-95 ${getEventTypeStyles(event.type, event.isSecondary, event.status)}`}
        >
            <div className="mt-1 p-2 rounded-full bg-white/50 dark:bg-black/20 shrink-0">
                {getEventTypeIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{event.title}</h3>
                <p className="text-sm opacity-90 truncate">{event.description || t('calendar.no_description', 'No description')}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold opacity-75">
                    <span className="flex items-center gap-1"><Clock size={12} /> {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {event.platform !== 'NONE' && <span className="uppercase">{event.platform}</span>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto flex flex-col p-4 lg:p-6 h-full lg:h-[calc(100vh-120px)]">

            {/* Header - Top Row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 shrink-0 w-full">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Calendar</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your Personalized Calendar: The Smart Way to Stay on Top of Things</p>
                </div>

                <div className="flex items-center gap-2 mt-3 lg:mt-0">
                    {/* Sync Google Calendar Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <CalIcon size={16} />
                        <span className="hidden lg:inline">Sync Google Calendar</span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
                        </div>
                        <div className="hidden lg:block">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {currentUser?.firstName} {currentUser?.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {currentUser?.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics & Controls Row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 shrink-0 w-full gap-4">
                {/* Statistics */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-[#1E1E1E] flex items-center justify-center">
                                <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 border-2 border-white dark:border-[#1E1E1E] flex items-center justify-center">
                                <Users size={14} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-[#1E1E1E] flex items-center justify-center">
                                <Users size={14} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stats.totalStudents} Students</span>
                    </div>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <TrendingUp size={14} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stats.totalClasses} Classes</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    {/* Calendar Filter */}
                    <CalendarFilter
                        onFilterChange={handleFilterChange}
                        primaryFilter={primaryFilter}
                        secondaryFilter={secondaryFilter}
                    />

                    {/* Month Navigation */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button onClick={handlePrevWeek} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors">
                            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="px-2 lg:px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[100px] lg:min-w-[120px] text-center capitalize">
                            {weekStart.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextWeek} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors">
                            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowBookingModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 lg:w-auto lg:px-4 lg:py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                        <Plus size={20} />
                        <span className="hidden lg:inline">New Event</span>
                    </button>
                </div>
            </div>

            {/* MOBILE VIEW: Day Strip + List */}
            <div className="lg:hidden flex-1 flex flex-col gap-4 overflow-hidden">

                {/* Mobile Week Navigation */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-2 rounded-xl mb-2">
                    <button onClick={handlePrevWeek} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all border border-gray-200 dark:border-gray-700">
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {weekStart.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })} v.{getWeekNumber(weekStart)}
                    </span>
                    <button onClick={handleNextWeek} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all border border-gray-200 dark:border-gray-700">
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* 7-Day Grid (No Scrolling) */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {weekDays.map((d, i) => {
                        const isSelected = isSameDay(d, selectedMobileDate);
                        const isToday = isSameDay(d, new Date());
                        const hasEvent = getEventsForDay(d).length > 0;

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedMobileDate(d)}
                                className={`
                                    flex flex-col items-center justify-center py-2 h-16 rounded-xl border transition-all relative
                                    ${isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105 z-10'
                                        : hasEvent
                                            ? 'bg-orange-50/50 dark:bg-orange-500/10 text-gray-800 dark:text-gray-200 border-orange-200 dark:border-orange-500/30'
                                            : 'bg-white dark:bg-[#1E1E1E] text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800'
                                    }
                                    ${isToday && !isSelected ? 'ring-1 ring-indigo-400 dark:ring-indigo-500 border-transparent' : ''}
                                `}
                            >
                                <span className={`text-[10px] font-bold uppercase tracking-tighter mb-0.5 ${isSelected ? 'text-indigo-200' : hasEvent ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                                    {d.toLocaleDateString('sv-SE', { weekday: 'short' }).substring(0, 2)}
                                </span>
                                <span className={`text-base font-black leading-none ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                    {d.getDate()}
                                </span>

                                {/* Dot indicator for events */}
                                {hasEvent && (
                                    <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full shadow-sm ${isSelected ? 'bg-white' : 'bg-orange-500'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Vertical Event List */}
                <div className="flex-1 overflow-y-auto pb-20">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-1">
                        {isSameDay(selectedMobileDate, new Date()) ? 'Idag' : selectedMobileDate.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>

                    {getEventsForDay(selectedMobileDate).length > 0 ? (
                        <div className="space-y-1">
                            {getEventsForDay(selectedMobileDate)
                                .sort((a, b) => a.start - b.start)
                                .map(renderMobileEventCard)
                            }
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <CalIcon size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Inga händelser inbokade.</p>
                        </div>
                    )}
                </div>
            </div>


            {/* DESKTOP VIEW: Grid */}
            <div className="flex-1 hidden lg:flex gap-6 overflow-hidden">

                {/* Calendar Grid (Flex-1) */}
                <div className="flex-1 bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">

                    {/* Day Headers */}
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b-2 border-indigo-100 dark:border-indigo-900/30 shrink-0 bg-gray-50 dark:bg-gray-900">
                        <div className="bg-gray-100 dark:bg-[#2A2A2A] border-r-2 border-gray-200 dark:border-gray-700" /> {/* Time column header */}
                        {weekDays.map((d, i) => (
                            <div key={i} className={`py-5 px-2 text-center border-r border-gray-100 dark:border-gray-800 transition-all ${isSameDay(d, new Date()) ? 'bg-indigo-100 dark:bg-indigo-950/50' : ''}`}>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-[0.15em] mb-2">{d.toLocaleDateString('sv-SE', { weekday: 'short' })}</p>
                                <div className={`text-2xl font-black inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${isSameDay(d, new Date()) ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/50 scale-110' : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    {d.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="flex-1 overflow-y-auto">
                        {hours.map(hour => (
                            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] h-20 border-b border-gray-100 dark:border-gray-800/50 relative hover:bg-gray-50/30 dark:hover:bg-white/[0.02] transition-colors">

                                {/* Time Label */}
                                <div className="relative text-right pr-4 pt-2 text-xs font-black text-gray-500 dark:text-gray-400 font-mono border-r-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2A2A2A]">
                                    {hour}:00
                                </div>

                                {/* Days Columns */}
                                {weekDays.map((d, i) => {
                                    const dayEvents = getEventsForDay(d);
                                    return (
                                        <div
                                            key={i}
                                            className="relative border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                            onClick={() => handleSlotClick(d, hour)}
                                            title={`Klicka för att boka ${hour}:00`}
                                        >
                                            {/* Add Button Hint - Only show on first hour */}
                                            {hour === 8 && dayEvents.length === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-0">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                        <Plus size={16} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Events with absolute positioning - Only render on first hour to avoid duplicates */}
                                            {hour === 8 && dayEvents.map(ev => {
                                                const style = getEventStyle(ev);

                                                return (
                                                    <div
                                                        key={`${ev.id}-${ev.isSecondary ? 'secondary' : 'primary'}`}
                                                        className={`absolute inset-x-2 rounded-2xl text-xs px-4 py-3 overflow-hidden shadow-lg transition-all hover:shadow-xl hover:scale-105 cursor-pointer ${getEventTypeStyles(ev.type, ev.isSecondary, ev.status)}
                                                            ${ev.isSecondary ? 'z-5 hover:z-15' : 'z-10 hover:z-20'}`}
                                                        style={style}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(ev);
                                                            setShowEventDetail(true);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                                                {getEventTypeIcon(ev.type)}
                                                            </div>
                                                            <div className="font-bold truncate flex-1">
                                                                {ev.title}
                                                            </div>
                                                            {ev.isSecondary && (
                                                                <div className="w-2 h-2 rounded-full bg-white" title="Sekundär kalender" />
                                                            )}
                                                        </div>
                                                        <div className="opacity-90 text-[11px] truncate ml-7">
                                                            {ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {ev.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-80 shrink-0 flex flex-col gap-6">
                    <MiniCalendar
                        currentDate={weekStart}
                        onDateSelect={(date) => {
                            setWeekStart(getMonday(date));
                            setSelectedMobileDate(date); // Also update mobile selection
                        }}
                    />
                    <ImportantDatesWidget
                        events={calEvents}
                        onEventClick={(ev) => {
                            setSelectedEvent(ev);
                            setShowEventDetail(true);
                        }}
                    />
                </div>

            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#2A2A2A] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Boka Händelse</h2>
                            <button onClick={() => setShowBookingModal(false)}><X size={20} className="text-gray-500" /></button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4">

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titel</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-lg p-3 outline-none focus:ring-2 ring-indigo-500 dark:text-white"
                                    placeholder="Möte med..."
                                    required
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            {/* Type & Course */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
                                    <select
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="LESSON">Lektion</option>
                                        <option value="MEETING">Möte / One-on-One</option>
                                        <option value="WORKSHOP">Workshop</option>
                                        <option value="EXAM">Prov</option>
                                        <option value="ASSIGNMENT">Uppgift</option>
                                        <option value="OTHER">Annat</option>
                                    </select>
                                </div>

                                {/* Course Selection (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kurs (Frivilligt)</label>
                                    <select
                                        value={newEvent.courseId || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, courseId: e.target.value || null })}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Ingen kurs vald</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Participant Selection (Optional - for One-on-One) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Elev / Deltagare (Frivilligt)</label>
                                    <select
                                        value={newEvent.ownerId || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, ownerId: e.target.value || null })}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Ingen specifik deltagare (Jag bokar)</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role?.name || 'Student'})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* ADVANCED FIELDS */}

                                {/* Platform Selection (Only for Online types effectively, but show for all non-Exams maybe?) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plats / Plattform</label>
                                    <select
                                        value={newEvent.platform || 'NONE'}
                                        onChange={(e) => setNewEvent({ ...newEvent, platform: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="NONE">Fysisk / Ingen specifik</option>
                                        <option value="ZOOM">Zoom</option>
                                        <option value="TEAMS">Microsoft Teams</option>
                                        <option value="MEETS">Google Meet</option>
                                    </select>
                                </div>

                                {/* Topic */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ämne / Fokus</label>
                                    <input
                                        type="text"
                                        value={newEvent.topic || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, topic: e.target.value })}
                                        placeholder="T.ex. Genomgång av modul 3"
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Mandatory Checkbox (Teacher Only) */}
                                {isTeacherOrAdmin && (
                                    <div className="md:col-span-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isMandatory"
                                            checked={newEvent.isMandatory || false}
                                            onChange={(e) => setNewEvent({ ...newEvent, isMandatory: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="isMandatory" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Obligatorisk närvaro
                                        </label>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beskrivning</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="3"
                                    />
                                </div>    </div>

                            {/* Time */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Datum</label>
                                    <input type="date" className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-lg p-3 dark:text-white" required value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start</label>
                                    <input type="time" className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-lg p-3 dark:text-white" required value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slut</label>
                                    <input type="time" className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-lg p-3 dark:text-white" required value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all">
                                Bekräfta Bokning
                            </button>

                        </form>
                    </div>
                </div>
            )
            }

            {/* Event Detail Panel */}
            <EventDetailPanel
                event={selectedEvent}
                isOpen={showEventDetail}
                onClose={() => {
                    setShowEventDetail(false);
                    setSelectedEvent(null);
                }}
                onDelete={handleDeleteEvent}
                onUpdateStatus={handleUpdateEventStatus}
                isTeacherOrAdmin={isTeacherOrAdmin}
            />

        </div >
    );
};

// Utils

export default CalendarView;
