import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Loader2, Plus, X, AlertCircle, AlertTriangle, Video, Users, User, ArrowLeft, ArrowRight, Check, Trash2, TrendingUp } from 'lucide-react';
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
    const isTeacherOrAdmin = ['ADMIN', 'TEACHER', 'MENTOR', 'PRINCIPAL'].includes(roleName); // Added PRINCIPAL

    // Data State
    const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [calEvents, setCalEvents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ totalStudents: 0, totalClasses: 0 });

    // Filter State
    const [primaryFilter, setPrimaryFilter] = useState(null);
    const [secondaryFilter, setSecondaryFilter] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [secondaryFilteredEvents, setSecondaryFilteredEvents] = useState([]);

    // UI State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDetail, setShowEventDetail] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', startTime: '', endTime: '', date: '',
        type: 'MEETING', courseId: '', attendeeId: '', status: 'CONFIRMED',
        platform: 'NONE', topic: '', isMandatory: false
    });
    const [availabilityStatus, setAvailabilityStatus] = useState({ isBusy: false, message: '' });
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

    const isDark = theme === 'midnight' || theme === 'voltage';

    // --- FETCHING ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const typesParam = selectedTypes.length > 0 ? `&types=${selectedTypes.join(',')}` : '';
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const queryParams = `?t=${new Date().getTime()}${typesParam}${searchParam}`;

            console.log("fetchData: query=", queryParams);
            // Fetch events: Admin/Principal see all, others see their own
            const eventsUrl = (roleName === 'ADMIN' || roleName === 'PRINCIPAL')
                ? `/events${queryParams}`
                : `/events/user/${currentUser.id}${queryParams}`;

            const [eventsRes, coursesRes, usersRes] = await Promise.all([
                api.get(eventsUrl).catch(err => { console.error("Events fetch error", err); return []; }),
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
            console.log("📥 Received events from API:", eventsData.length, "events");

            if (Array.isArray(eventsData)) {
                const mapped = eventsData.map(e => {
                    const startDate = new Date(e.startTime);
                    const endDate = new Date(e.endTime);
                    const durationMinutes = (endDate - startDate) / 60000;

                    console.log(`📅 Event: "${e.title}" | ${e.startTime} → ${e.endTime} | Duration: ${durationMinutes}min`);

                    return {
                        id: e.id,
                        title: e.title,
                        description: e.description,
                        start: startDate,
                        end: endDate,
                        type: e.type,
                        status: e.status,
                        platform: e.platform,
                        meetingLink: e.meetingLink,
                        isMandatory: e.isMandatory,
                        topic: e.topic,
                        courseId: e.course?.id,
                        ownerId: e.owner?.id,
                        ownerName: e.owner ? `${e.owner.firstName} ${e.owner.lastName}` : 'Okänd'
                    };
                });

                console.log("✅ Mapped events:", mapped.length);
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
        if (primaryFilter) fetchFilteredEvents(primaryFilter).then(setFilteredEvents);
        if (secondaryFilter) fetchFilteredEvents(secondaryFilter).then(setSecondaryFilteredEvents);
    }, [weekStart, selectedTypes, searchQuery]);

    // --- FILTER HANDLERS ---
    const fetchFilteredEvents = async (filter) => {
        if (!filter) return [];
        try {
            const typesParam = selectedTypes.length > 0 ? `&types=${selectedTypes.join(',')}` : '';
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const queryParams = `?t=${new Date().getTime()}${typesParam}${searchParam}`;

            if (filter.type === 'user') {
                const events = await api.get(`/events/user/${filter.value.id}${queryParams}`);
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
                const events = await api.get(`/events/course/${filter.value.id}${queryParams}`);
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

        if (type === 'clear_all') {
            setPrimaryFilter(null);
            setSecondaryFilter(null);
            setSelectedTypes([]);
            setFilteredEvents([]);
            setSecondaryFilteredEvents([]);
            setSearchQuery('');
            return;
        }

        if (type === 'types') {
            setSelectedTypes(value);
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

    // --- AVAILABILITY CHECK ---
    const checkAvailability = async () => {
        if (!newEvent.date || !newEvent.startTime || !newEvent.endTime) return;

        setIsCheckingAvailability(true);
        try {
            const startStr = `${newEvent.date}T${newEvent.startTime}:00`;
            const endStr = `${newEvent.date}T${newEvent.endTime}:00`;

            console.log(`[CalendarView] Checking availability: ${startStr} - ${endStr}`);

            // Check owner (current user)
            const ownerParams = new URLSearchParams({
                userId: currentUser.id,
                start: startStr,
                end: endStr
            });
            const ownerRes = await api.get(`/events/calendar/check-availability?${ownerParams.toString()}`);

            if (!ownerRes.available) {
                setAvailabilityStatus({ isBusy: true, message: 'Du är redan bokad under denna tid.' });
                return;
            }

            // Check attendee if selected
            if (newEvent.attendeeId) {
                const attendeeParams = new URLSearchParams({
                    userId: newEvent.attendeeId,
                    start: startStr,
                    end: endStr
                });
                const attendeeRes = await api.get(`/events/calendar/check-availability?${attendeeParams.toString()}`);
                if (!attendeeRes.available) {
                    const attendee = users.find(u => u.id === parseInt(newEvent.attendeeId));
                    setAvailabilityStatus({
                        isBusy: true,
                        message: `${attendee?.firstName || 'Deltagaren'} är redan bokad under denna tid.`
                    });
                    return;
                }
            }

            setAvailabilityStatus({ isBusy: false, message: '' });
        } catch (error) {
            console.error('Failed to check availability:', error);
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    useEffect(() => {
        if (showBookingModal) {
            const timer = setTimeout(() => {
                checkAvailability();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [newEvent.date, newEvent.startTime, newEvent.endTime, newEvent.attendeeId, showBookingModal]);

    // Merge events...
    const displayEvents = primaryFilter ? filteredEvents : calEvents;

    // --- HANDLERS ---
    const handlePrev = () => {
        if (viewMode === 'day') setWeekStart(addDays(weekStart, -1));
        else if (viewMode === 'week') setWeekStart(addDays(weekStart, -7));
        else if (viewMode === 'month') {
            const newDate = new Date(weekStart);
            newDate.setMonth(newDate.getMonth() - 1);
            setWeekStart(newDate); // Logic needs to ensure first day of month/grid
        }
    };
    const handleNext = () => {
        if (viewMode === 'day') setWeekStart(addDays(weekStart, 1));
        else if (viewMode === 'week') setWeekStart(addDays(weekStart, 7));
        else if (viewMode === 'month') {
            const newDate = new Date(weekStart);
            newDate.setMonth(newDate.getMonth() + 1);
            setWeekStart(newDate);
        }
    };
    // Kept for compatibility if used elsewhere, but directed to new handlers
    const handlePrevWeek = handlePrev;
    const handleNextWeek = handleNext;

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
            title: '',
            description: '',
            date: dateStr,
            startTime: timeStr,
            endTime: endTimeStr,
            type: 'MEETING',
            courseId: '',
            attendeeId: '',
            status: 'CONFIRMED',
            platform: 'NONE',
            topic: '',
            isMandatory: false
        });
        setAvailabilityStatus({ isBusy: false, message: '' });
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
                // Owner is always the current user (set by backend from JWT)
                ownerId: null,
                // If attendeeId is selected, include it
                attendeeIds: newEvent.attendeeId ? [parseInt(newEvent.attendeeId)] : []
            };

            console.log("📅 Creating event with payload:", JSON.stringify(payload, null, 2));
            console.log("📅 Start time:", startStr, "End time:", endStr);
            console.log("📅 Duration in minutes:", (new Date(endStr) - new Date(startStr)) / 60000);
            console.log("📅 Current user ID:", currentUser?.id);
            console.log("📅 attendeeIds in payload:", payload.attendeeIds);

            const response = await api.post('/events', payload);
            console.log("✅ Event created successfully:", response);

            setShowBookingModal(false);
            setNewEvent({
                title: '', description: '', startTime: '', endTime: '', date: '',
                type: 'MEETING', courseId: '', attendeeId: '', status: 'CONFIRMED',
                platform: 'NONE', topic: '', isMandatory: false
            });
            setAvailabilityStatus({ isBusy: false, message: '' });

            // Wait a moment then refresh to ensure database has committed
            setTimeout(async () => {
                console.log("🔄 Refreshing calendar data...");
                await fetchData();
                console.log("✅ Calendar data refreshed");
            }, 500);
        } catch (err) {
            console.error("❌ Booking error:", err);
            console.error("❌ Error details:", err.response || err);
            alert("Kunde inte boka händelsen: " + (err.response?.data?.message || err.message || "Okänt fel"));
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
    // --- RENDER HELPERS ---
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 - 18:00

    // Calculate days to display based on View Mode
    const getDaysToDisplay = () => {
        if (viewMode === 'day') return [new Date(weekStart)]; // Just the current day
        if (viewMode === 'week') return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        // Month view uses separate logic for grid, but header needs 'Mon-Sun'
        // We will return 7 days starting from Monday of the current week just for the header labels
        if (viewMode === 'month') {
            // Return a generic week (e.g. current week) just to get Mon-Sun headers
            // The actual month grid will be generated separately
            return Array.from({ length: 7 }, (_, i) => addDays(getMonday(new Date()), i));
        }
        return [];
    }

    const getMonthDays = () => {
        const year = weekStart.getFullYear();
        const month = weekStart.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        // Get Monday of the first week (even if previous month)
        const startDay = firstDayOfMonth.getDay();
        const diff = firstDayOfMonth.getDate() - startDay + (startDay === 0 ? -6 : 1);
        const startDate = new Date(firstDayOfMonth.setDate(diff));

        return Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
    };

    const weekDays = getDaysToDisplay();
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

        // Debug logging for height calculation
        if (duration !== 1.0) {  // Only log non-1-hour events to reduce noise
            console.log(`📐 Event "${event.title}" style:`,
                `${startHour}:${startMinute.toString().padStart(2, '0')} - ${endHour}:${endMinute.toString().padStart(2, '0')}`,
                `Duration: ${duration}h`,
                `Height: ${height}px`);
        }

        return {
            top: `${top}px`,
            height: `${height}px`
        };
    };

    const getEventTypeStyles = (type, isSecondary = false, status = 'CONFIRMED') => {
        // Lower opacity for pending status
        const isPending = status === 'PENDING';
        const secondaryOpacity = isSecondary ? 'opacity-60' : '';
        const pendingOpacity = isPending ? 'opacity-70' : '';

        // Softer pastel colors matching the reference design
        let baseClasses = '';
        switch (type) {
            case 'LESSON': baseClasses = 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-l-4 border-red-400'; break;
            case 'EXAM': baseClasses = 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-l-4 border-purple-400'; break;
            case 'WORKSHOP': baseClasses = 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-l-4 border-green-400'; break;
            case 'MEETING': baseClasses = 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-l-4 border-blue-400'; break;
            case 'ASSIGNMENT': baseClasses = 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-l-4 border-yellow-400'; break;
            default: baseClasses = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-l-4 border-gray-400'; break;
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
        <div className="max-w-7xl mx-auto flex flex-col p-4 lg:p-6">

            {/* Header - Top Row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 shrink-0 w-full">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Calendar</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your Personalized Calendar</p>
                        {isTeacherOrAdmin && (
                            <div className="relative group ml-4">
                                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Sök händelser..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-gray-100 dark:bg-gray-800 border-none rounded-full py-1.5 pl-10 pr-4 text-xs w-64 focus:ring-2 ring-indigo-500 transition-all dark:text-white"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
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
                        selectedTypes={selectedTypes}
                    />

                    {/* View Switcher */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'day' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Dag
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Vecka
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Månad
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors">
                            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="px-2 lg:px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[100px] lg:min-w-[120px] text-center capitalize">
                            {weekStart.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors">
                            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setNewEvent({
                                title: '', description: '', startTime: '', endTime: '', date: '',
                                type: 'MEETING', courseId: '', attendeeId: '', status: 'CONFIRMED',
                                platform: 'NONE', topic: '', isMandatory: false
                            });
                            setAvailabilityStatus({ isBusy: false, message: '' });
                            setShowBookingModal(true);
                        }}
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
            <div className="hidden lg:flex gap-6">

                {/* Calendar Grid */}
                <div className="flex-1 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">

                    {/* Day Headers */}
                    <div className={`grid ${viewMode === 'day' ? 'grid-cols-[60px_1fr]' : 'grid-cols-[60px_repeat(7,1fr)]'} border-b border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-[#1E1E1E]`}>
                        <div className="border-r border-gray-200 dark:border-gray-700" /> {/* Time column header */}
                        {weekDays.map((d, i) => (
                            <div key={i} className={`py-4 px-2 text-center border-r border-gray-100 dark:border-gray-800 transition-all ${d.getDay() === 0 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                <p className={`text-xs font-medium mb-1 ${d.getDay() === 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {d.toLocaleDateString('sv-SE', { weekday: 'short' })}, {String(d.getDate()).padStart(2, '0')}
                                </p>
                                {isSameDay(d, new Date()) && (
                                    <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto mt-1" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Time Slots OR Month Grid */}
                    {viewMode === 'month' ? (
                        <div className="grid grid-cols-7 grid-rows-6 bg-gray-50 dark:bg-gray-900">
                            {getMonthDays().map((d, i) => {
                                const dayEvents = getEventsForDay(d);
                                const isCurrentMonth = d.getMonth() === weekStart.getMonth();
                                return (
                                    <div
                                        key={i}
                                        className={`border-b border-r border-gray-200 dark:border-gray-800 p-2 min-h-[100px] relative group cursor-pointer transition-colors hover:bg-white dark:hover:bg-[#252525]
                                            ${!isCurrentMonth ? 'bg-gray-100/50 dark:bg-gray-900/50 opacity-50 text-gray-400' : 'bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-100'}
                                            ${d.getDay() === 0 ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                        onClick={() => {
                                            if (!isCurrentMonth) {
                                                setWeekStart(d);
                                            } else {
                                                handleSlotClick(d, 9);
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-xs font-bold p-1 rounded-md mb-1 inline-block ${isSameDay(d, new Date()) ? 'bg-indigo-600 text-white' : ''} ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                                                {d.getDate()}
                                            </span>
                                            <button
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSlotClick(d, 9);
                                                }}
                                            >
                                                <Plus size={12} className="text-gray-500" />
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            {dayEvents.map(ev => (
                                                <div
                                                    key={ev.id}
                                                    className={`text-[10px] px-1.5 py-1 rounded border border-transparent hover:border-black/10 dark:hover:border-white/10 truncate font-medium transition-all ${getEventTypeStyles(ev.type, false, ev.status)}`}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setShowEventDetail(true); }}
                                                    title={`${ev.title}`}
                                                >
                                                    <span className="truncate">{ev.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div>
                            {hours.map(hour => (
                                <div key={hour} className={`grid ${viewMode === 'day' ? 'grid-cols-[60px_1fr]' : 'grid-cols-[60px_repeat(7,1fr)]'} h-20 border-b border-gray-100 dark:border-gray-800/50 relative`}>

                                    {/* Time Label */}
                                    <div className="relative text-right pr-3 pt-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700">
                                        {String(hour).padStart(2, '0')}:00
                                    </div>

                                    {/* Days Columns */}
                                    {weekDays.map((d, i) => {
                                        const dayEvents = getEventsForDay(d);
                                        return (
                                            <div
                                                key={i}
                                                className={`relative border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer ${d.getDay() === 0 ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
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
                                                            className={`absolute inset-x-1 rounded-xl text-xs px-3 py-2 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${getEventTypeStyles(ev.type, ev.isSecondary, ev.status)}
                                                            ${ev.isSecondary ? 'z-5 hover:z-15' : 'z-10 hover:z-20'}`}
                                                            style={style}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedEvent(ev);
                                                                setShowEventDetail(true);
                                                            }}
                                                        >
                                                            <div className="font-semibold truncate mb-0.5">
                                                                {ev.title}
                                                            </div>
                                                            <div className="opacity-75 text-[10px] truncate">
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
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-80 shrink-0 space-y-6">
                    <MiniCalendar
                        currentDate={weekStart}
                        onDateSelect={(date) => {
                            // In day view, set directly to the selected date
                            // In week/month view, set to the Monday of that week
                            if (viewMode === 'day') {
                                setWeekStart(date);
                            } else {
                                setWeekStart(getMonday(date));
                            }
                            setSelectedMobileDate(date);
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mötesdeltagare (Frivilligt)</label>
                                    <select
                                        value={newEvent.attendeeId || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, attendeeId: e.target.value || null })}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Endast jag</option>
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

                            {/* Availability Feedback */}
                            {(isCheckingAvailability || availabilityStatus.message) && (
                                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${availabilityStatus.isBusy ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {isCheckingAvailability ? (
                                        <><Loader2 size={16} className="animate-spin" /> Kollar tillgänglighet...</>
                                    ) : (
                                        <><AlertTriangle size={16} /> {availabilityStatus.message}</>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={availabilityStatus.isBusy || isCheckingAvailability}
                                className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all ${availabilityStatus.isBusy ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}`}
                            >
                                {availabilityStatus.isBusy ? 'Tiden är redan bokad' : 'Bekräfta Bokning'}
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
