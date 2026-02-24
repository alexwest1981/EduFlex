import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Loader2,
    Plus, X, AlertTriangle, Video, Users, User, Check, Trash2,
    Rss, Copy, ExternalLink, CheckCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useDesignSystem } from '../../context/DesignSystemContext';
import EventDetailPanel from './EventDetailPanel';
import MiniCalendar from './components/MiniCalendar';
import ImportantDatesWidget from './components/ImportantDatesWidget';
import CalendarFilter from './components/CalendarFilter';

// ─── Utils ───────────────────────────────────────────────────────────────────
function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
function addDays(d, days) {
    const date = new Date(d.valueOf());
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
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ─── Event type config ────────────────────────────────────────────────────────
const EVENT_CONFIG = {
    LESSON: { label: 'Lektion', dot: 'bg-indigo-500', pill: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-l-2 border-indigo-400' },
    EXAM: { label: 'Tenta', dot: 'bg-rose-500', pill: 'bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-200 border-l-2 border-rose-400' },
    WORKSHOP: { label: 'Workshop', dot: 'bg-emerald-500', pill: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-l-2 border-emerald-400' },
    MEETING: { label: 'Möte', dot: 'bg-sky-500', pill: 'bg-sky-50 dark:bg-sky-500/15 text-sky-800 dark:text-sky-200 border-l-2 border-sky-400' },
    ASSIGNMENT: { label: 'Uppgift', dot: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 border-l-2 border-amber-400' },
    OTHER: { label: 'Annat', dot: 'bg-gray-400', pill: 'bg-gray-50 dark:bg-gray-500/15 text-gray-700 dark:text-gray-300 border-l-2 border-gray-400' },
};
const getConfig = (type) => EVENT_CONFIG[type] || EVENT_CONFIG.OTHER;

const SE_DAYS = ['M', 'Ti', 'On', 'To', 'Fr', 'Lö', 'Sö'];

// ─── Component ────────────────────────────────────────────────────────────────
const CalendarView = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const { theme } = useDesignSystem();

    const roleName = currentUser?.role?.name || currentUser?.role || '';
    const isTeacherOrAdmin = ['ADMIN', 'TEACHER', 'MENTOR', 'PRINCIPAL'].includes(roleName);

    // ── State ──
    const [viewMode, setViewMode] = useState('week');
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [calEvents, setCalEvents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [primaryFilter, setPrimaryFilter] = useState(null);
    const [secondaryFilter, setSecondaryFilter] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [secondaryFilteredEvents, setSecondaryFilteredEvents] = useState([]);

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
    const [selectedMobileDate, setSelectedMobileDate] = useState(new Date());

    const [showSyncModal, setShowSyncModal] = useState(false);
    const [icalInfo, setIcalInfo] = useState(null);
    const [icalLoading, setIcalLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Live clock tick for current-time indicator
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    // ── Fetch ──
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const typesParam = selectedTypes.length > 0 ? `&types=${selectedTypes.join(',')}` : '';
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const queryParams = `?t=${new Date().getTime()}${typesParam}${searchParam}`;

            const eventsUrl = (roleName === 'ADMIN' || roleName === 'PRINCIPAL')
                ? `/events${queryParams}`
                : `/events/user/${currentUser.id}${queryParams}`;

            const [eventsRes, coursesRes, usersRes] = await Promise.all([
                api.get(eventsUrl).catch(() => []),
                (!isTeacherOrAdmin && currentUser?.id)
                    ? api.courses.getMyCourses(currentUser.id).catch(() => [])
                    : api.get('/courses').catch(() => []),
                (!isTeacherOrAdmin)
                    ? api.users.getRelated().catch(() => [])
                    : api.users.getAll().catch(() => ({ content: [] }))
            ]);

            setCourses(coursesRes || []);
            const rawUsers = usersRes?.content || usersRes || [];
            setUsers(Array.isArray(rawUsers) ? rawUsers : []);

            if (Array.isArray(eventsRes)) {
                setCalEvents(eventsRes.map(e => ({
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
                })));
            }
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

    // ── Filters ──
    const mapEvent = (e, extra = {}) => ({
        id: e.id, title: e.title, description: e.description,
        start: new Date(e.startTime), end: new Date(e.endTime),
        type: e.type, status: e.status, platform: e.platform,
        meetingLink: e.meetingLink, isMandatory: e.isMandatory, topic: e.topic,
        courseId: e.course?.id, ownerId: e.owner?.id,
        ownerName: e.owner ? `${e.owner.firstName} ${e.owner.lastName}` : 'Okänd',
        ...extra
    });

    const fetchFilteredEvents = async (filter) => {
        if (!filter) return [];
        try {
            const typesParam = selectedTypes.length > 0 ? `&types=${selectedTypes.join(',')}` : '';
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const queryParams = `?t=${new Date().getTime()}${typesParam}${searchParam}`;
            const url = filter.type === 'user'
                ? `/events/user/${filter.value.id}${queryParams}`
                : `/events/course/${filter.value.id}${queryParams}`;
            const events = await api.get(url);
            return events.map(e => mapEvent(e, { isFiltered: true }));
        } catch {
            return [];
        }
    };

    const handleFilterChange = async ({ type, value, isPrimary }) => {
        if (type === 'clear') {
            if (isPrimary) { setPrimaryFilter(null); setFilteredEvents([]); }
            else { setSecondaryFilter(null); setSecondaryFilteredEvents([]); }
            return;
        }
        if (type === 'clear_all') {
            setPrimaryFilter(null); setSecondaryFilter(null); setSelectedTypes([]);
            setFilteredEvents([]); setSecondaryFilteredEvents([]); setSearchQuery('');
            return;
        }
        if (type === 'types') { setSelectedTypes(value); return; }

        const filter = { type, value };
        if (isPrimary) { setPrimaryFilter(filter); setFilteredEvents(await fetchFilteredEvents(filter)); }
        else { setSecondaryFilter(filter); setSecondaryFilteredEvents(await fetchFilteredEvents(filter)); }
    };

    // ── Availability ──
    const checkAvailability = async () => {
        if (!newEvent.date || !newEvent.startTime || !newEvent.endTime) return;
        setIsCheckingAvailability(true);
        try {
            const startStr = `${newEvent.date}T${newEvent.startTime}:00`;
            const endStr = `${newEvent.date}T${newEvent.endTime}:00`;
            const ownerRes = await api.get(`/events/calendar/check-availability?${new URLSearchParams({ userId: currentUser.id, start: startStr, end: endStr })}`);
            if (!ownerRes.available) { setAvailabilityStatus({ isBusy: true, message: 'Du är redan bokad under denna tid.' }); return; }
            if (newEvent.attendeeId) {
                const attRes = await api.get(`/events/calendar/check-availability?${new URLSearchParams({ userId: newEvent.attendeeId, start: startStr, end: endStr })}`);
                if (!attRes.available) {
                    const att = users.find(u => u.id === parseInt(newEvent.attendeeId));
                    setAvailabilityStatus({ isBusy: true, message: `${att?.firstName || 'Deltagaren'} är redan bokad under denna tid.` });
                    return;
                }
            }
            setAvailabilityStatus({ isBusy: false, message: '' });
        } catch { /* silent */ } finally { setIsCheckingAvailability(false); }
    };

    useEffect(() => {
        if (!showBookingModal) return;
        const timer = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timer);
    }, [newEvent.date, newEvent.startTime, newEvent.endTime, newEvent.attendeeId, showBookingModal]);

    // Auto-select Platform based on Type
    useEffect(() => {
        if (newEvent.type === 'EXAM' && newEvent.platform === 'NONE') {
            setNewEvent(prev => ({ ...prev, platform: 'EXAM_ROOM' }));
        }
    }, [newEvent.type]);

    // ── Derived ──
    const displayEvents = primaryFilter ? filteredEvents : calEvents;

    const handlePrev = () => {
        if (viewMode === 'day') setWeekStart(addDays(weekStart, -1));
        else if (viewMode === 'week') setWeekStart(addDays(weekStart, -7));
        else { const d = new Date(weekStart); d.setMonth(d.getMonth() - 1); setWeekStart(d); }
    };
    const handleNext = () => {
        if (viewMode === 'day') setWeekStart(addDays(weekStart, 1));
        else if (viewMode === 'week') setWeekStart(addDays(weekStart, 7));
        else { const d = new Date(weekStart); d.setMonth(d.getMonth() + 1); setWeekStart(d); }
    };
    const goToday = () => { setWeekStart(viewMode === 'day' ? new Date() : getMonday(new Date())); setSelectedMobileDate(new Date()); };

    const handleSlotClick = (dayDate, hour) => {
        const year = dayDate.getFullYear();
        const month = String(dayDate.getMonth() + 1).padStart(2, '0');
        const day = String(dayDate.getDate()).padStart(2, '0');
        setNewEvent({
            title: '', description: '', date: `${year}-${month}-${day}`,
            startTime: `${String(hour).padStart(2, '0')}:00`,
            endTime: `${String(hour + 1).padStart(2, '0')}:00`,
            type: 'MEETING', courseId: '', attendeeId: '', status: 'CONFIRMED',
            platform: 'NONE', topic: '', isMandatory: false
        });
        setAvailabilityStatus({ isBusy: false, message: '' });
        setShowBookingModal(true);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const startStr = `${newEvent.date}T${newEvent.startTime}:00`;
            const endStr = `${newEvent.date}T${newEvent.endTime}:00`;
            await api.post('/events', {
                title: newEvent.title || 'Ny händelse',
                description: newEvent.description,
                startTime: startStr, endTime: endStr,
                type: isTeacherOrAdmin ? newEvent.type : 'MEETING',
                status: isTeacherOrAdmin ? newEvent.status : 'PENDING',
                platform: newEvent.platform, topic: newEvent.topic,
                isMandatory: isTeacherOrAdmin ? (newEvent.isMandatory || false) : false,
                courseId: newEvent.courseId ? parseInt(newEvent.courseId) : null,
                ownerId: null,
                attendeeIds: newEvent.attendeeId ? [parseInt(newEvent.attendeeId)] : []
            });
            setShowBookingModal(false);
            setNewEvent({ title: '', description: '', startTime: '', endTime: '', date: '', type: 'MEETING', courseId: '', attendeeId: '', status: 'CONFIRMED', platform: 'NONE', topic: '', isMandatory: false });
            setAvailabilityStatus({ isBusy: false, message: '' });
            setTimeout(fetchData, 500);
        } catch (err) {
            alert("Kunde inte boka händelsen: " + (err.response?.data?.message || err.message || "Okänt fel"));
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Är du säker på att du vill ta bort denna bokning?')) return;
        try { await api.delete(`/events/${eventId}`); fetchData(); } catch { alert("Kunde inte ta bort händelsen."); }
    };

    const handleUpdateEventStatus = async (eventId, newStatus) => {
        try { await api.patch(`/events/${eventId}/status`, { status: newStatus }); fetchData(); } catch { alert("Kunde inte uppdatera status."); }
    };

    // ── Grid helpers ──
    const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08–18
    const HOUR_H = 60; // px per hour

    const getDaysToDisplay = () => {
        if (viewMode === 'day') return [new Date(weekStart)];
        if (viewMode === 'week') return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        return Array.from({ length: 7 }, (_, i) => addDays(getMonday(new Date()), i));
    };

    const getMonthDays = () => {
        const year = weekStart.getFullYear();
        const month = weekStart.getMonth();
        const first = new Date(year, month, 1);
        const startDay = first.getDay();
        const diff = first.getDate() - startDay + (startDay === 0 ? -6 : 1);
        const startDate = new Date(first.setDate(diff));
        return Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
    };

    const weekDays = getDaysToDisplay();

    const getEventsForDay = (dayDate) => {
        const primary = displayEvents.filter(e =>
            isSameDay(e.start, dayDate)
        );
        const secondary = secondaryFilter
            ? secondaryFilteredEvents.filter(e => isSameDay(e.start, dayDate)).map(e => ({ ...e, isSecondary: true }))
            : [];
        return [...primary, ...secondary];
    };

    const getEventStyle = (event) => {
        const startOffset = (event.start.getHours() - 8) + event.start.getMinutes() / 60;
        const endOffset = (event.end.getHours() - 8) + event.end.getMinutes() / 60;
        return {
            top: `${startOffset * HOUR_H}px`,
            height: `${Math.max((endOffset - startOffset) * HOUR_H, 22)}px`
        };
    };

    const getCurrentTimeTop = () => {
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        if (h < 8 || h >= 19) return null;
        return ((h - 8) + m / 60) * HOUR_H;
    };

    const timeTop = viewMode !== 'month' ? getCurrentTimeTop() : null;

    const getEventPillClass = (type, isSecondary = false, status = 'CONFIRMED') => {
        const base = getConfig(type).pill;
        const modifiers = [isSecondary && 'opacity-50', status === 'PENDING' && 'opacity-60 ring-1 ring-inset ring-current/20'].filter(Boolean).join(' ');
        return `${base} ${modifiers}`;
    };

    // ── Label helpers ──
    const getNavLabel = () => {
        if (viewMode === 'day') {
            return weekStart.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
        }
        if (viewMode === 'week') {
            const end = addDays(weekStart, 6);
            const sameMonth = weekStart.getMonth() === end.getMonth();
            return sameMonth
                ? `${weekStart.getDate()}–${end.getDate()} ${weekStart.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}`
                : `${weekStart.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        return weekStart.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
    };

    const fetchIcalInfo = async () => {
        if (icalInfo) { setShowSyncModal(true); return; }
        setIcalLoading(true);
        try {
            const data = await api.get('/calendar/ical/token');
            const base = window.location.origin;
            setIcalInfo({ ...data, fullUrl: `${base}${data.feedPath}` });
            setShowSyncModal(true);
        } catch (e) {
            console.error('Could not fetch iCal token', e);
        } finally {
            setIcalLoading(false);
        }
    };

    const copyIcalUrl = () => {
        if (!icalInfo) return;
        navigator.clipboard.writeText(icalInfo.fullUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const inputCls = "w-full bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow";
    const labelCls = "block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5";

    // ── Mobile event card ──
    const renderMobileEventCard = (event) => {
        const cfg = getConfig(event.type);
        return (
            <div
                key={`${event.id}-${event.isSecondary}`}
                onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                className={`flex items-stretch gap-0 rounded-xl overflow-hidden border border-gray-100 dark:border-[#2a2b2d] cursor-pointer active:scale-[0.98] transition-transform ${event.isSecondary ? 'opacity-60' : ''}`}
            >
                <div className={`w-1 shrink-0 ${cfg.dot}`} />
                <div className="flex-1 bg-white dark:bg-[#1a1b1d] px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{event.title}</h3>
                        <span className="text-[10px] font-bold text-gray-400 shrink-0">
                            {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {event.description || cfg.label}
                        {event.platform && event.platform !== 'NONE' && ` · ${event.platform}`}
                    </p>
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full max-h-screen min-h-0 bg-gray-50 dark:bg-[#0f1012] rounded-2xl overflow-hidden shadow-xl shadow-gray-200/70 dark:shadow-black/30 border border-gray-200 dark:border-[#2a2b2d]">

            {/* ── TOOLBAR ── */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#1a1b1d] border-b border-gray-200 dark:border-[#2a2b2d] shrink-0">

                {/* Left: title + nav */}
                <div className="flex items-center gap-3">
                    <h1 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight hidden md:block uppercase tracking-widest text-gray-400">Kalender</h1>

                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={handlePrev}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize select-none">
                        {getNavLabel()}
                    </span>

                    {viewMode === 'week' && (
                        <span className="text-xs text-gray-400 font-medium hidden lg:inline">
                            v.{getWeekNumber(weekStart)}
                        </span>
                    )}

                    <button
                        onClick={goToday}
                        className="hidden md:inline-flex text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-gray-200 dark:border-[#2a2b2d] hover:border-gray-300 dark:hover:border-[#3a3b3d] transition-all"
                    >
                        Idag
                    </button>
                </div>

                {/* Right: search + filter + view + new */}
                <div className="flex items-center gap-2">
                    {isTeacherOrAdmin && (
                        <div className="relative hidden lg:block">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Sök händelser..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-50 dark:bg-[#252628] border border-gray-200 dark:border-[#2a2b2d] rounded-xl py-1.5 pl-8 pr-3 text-xs w-48 focus:ring-2 focus:ring-indigo-500/40 outline-none dark:text-white transition-all"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={11} />
                                </button>
                            )}
                        </div>
                    )}

                    <CalendarFilter
                        onFilterChange={handleFilterChange}
                        primaryFilter={primaryFilter}
                        secondaryFilter={secondaryFilter}
                        selectedTypes={selectedTypes}
                    />

                    {/* View switcher */}
                    <div className="flex items-center bg-gray-100 dark:bg-[#252628] rounded-xl p-0.5 text-xs font-semibold">
                        {[['day', 'Dag'], ['week', 'Vecka'], ['month', 'Månad']].map(([mode, label]) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === mode
                                    ? 'bg-white dark:bg-[#1a1b1d] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* iCal sync button */}
                    <button
                        onClick={fetchIcalInfo}
                        disabled={icalLoading}
                        title="Synkronisera med extern kalender"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                    >
                        {icalLoading ? <Loader2 size={15} className="animate-spin" /> : <Rss size={15} />}
                    </button>

                    <button
                        onClick={() => {
                            setNewEvent({ title: '', description: '', startTime: '', endTime: '', date: '', type: 'MEETING', courseId: '', attendeeId: '', status: 'CONFIRMED', platform: 'NONE', topic: '', isMandatory: false });
                            setAvailabilityStatus({ isBusy: false, message: '' });
                            setShowBookingModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">Ny händelse</span>
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* ── MOBILE ── */}
                <div className="flex flex-col flex-1 min-h-0 lg:hidden px-4 pt-4 gap-3">
                    {/* Day strip */}
                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map((d, i) => {
                            const isSelected = isSameDay(d, selectedMobileDate);
                            const isToday = isSameDay(d, new Date());
                            const hasEvent = getEventsForDay(d).length > 0;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedMobileDate(d)}
                                    className={`flex flex-col items-center py-2 rounded-xl transition-all ${isSelected
                                        ? 'bg-indigo-600 text-white'
                                        : isToday
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252628]'
                                        }`}
                                >
                                    <span className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-70">
                                        {d.toLocaleDateString('sv-SE', { weekday: 'short' }).slice(0, 2)}
                                    </span>
                                    <span className="text-sm font-black">{d.getDate()}</span>
                                    {hasEvent && (
                                        <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white/70' : 'bg-indigo-400'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Event list */}
                    <div className="flex-1 overflow-y-auto pb-20">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-0.5">
                            {isSameDay(selectedMobileDate, new Date()) ? 'Idag' : selectedMobileDate.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        {getEventsForDay(selectedMobileDate).length > 0 ? (
                            <div className="space-y-2">
                                {getEventsForDay(selectedMobileDate)
                                    .sort((a, b) => a.start - b.start)
                                    .map(renderMobileEventCard)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-[#252628] rounded-2xl flex items-center justify-center mb-3">
                                    <CalIcon size={20} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">Inga händelser</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── DESKTOP ── */}
                <div className="hidden lg:flex flex-1 min-h-0 gap-0">

                    {/* Grid */}
                    <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white dark:bg-[#1a1b1d] border-r border-gray-200 dark:border-[#2a2b2d]">

                        {/* Day headers */}
                        <div className={`grid ${viewMode === 'day' ? 'grid-cols-[44px_1fr]' : 'grid-cols-[44px_repeat(7,1fr)]'} border-b border-gray-200 dark:border-[#2a2b2d] shrink-0`}>
                            <div className="border-r border-gray-200 dark:border-[#2a2b2d]" />
                            {weekDays.map((d, i) => {
                                const isToday = isSameDay(d, new Date());
                                const isSunday = d.getDay() === 0;
                                return (
                                    <div key={i} className={`py-2 px-1 text-center border-r border-gray-100 dark:border-[#252628] last:border-r-0 ${isToday ? 'bg-indigo-50/60 dark:bg-indigo-500/5' : ''} ${isSunday && !isToday ? 'bg-gray-50/60 dark:bg-[#1e1f21]' : ''}`}>
                                        <span className={`text-[10px] font-semibold block mb-0.5 ${isSunday ? 'text-rose-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {SE_DAYS[i === 0 && viewMode !== 'day' ? 0 : (viewMode === 'day' ? (d.getDay() + 6) % 7 : i)]}
                                        </span>
                                        <span className={`text-xs font-black inline-flex items-center justify-center w-6 h-6 rounded-full mx-auto ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-200'
                                            }`}>
                                            {d.getDate()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Month grid */}
                        {viewMode === 'month' ? (
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-7 h-full" style={{ minHeight: 0 }}>
                                    {getMonthDays().map((d, i) => {
                                        const dayEvents = getEventsForDay(d);
                                        const isCurrentMonth = d.getMonth() === weekStart.getMonth();
                                        const isToday = isSameDay(d, new Date());
                                        return (
                                            <div
                                                key={i}
                                                className={`border-b border-r border-gray-100 dark:border-[#252628] p-1.5 min-h-[76px] group cursor-pointer transition-colors
                                                    ${isCurrentMonth ? 'hover:bg-gray-50/60 dark:hover:bg-[#252628]/40' : 'opacity-40'}
                                                    ${d.getDay() === 0 ? 'bg-gray-50/40 dark:bg-[#1e1f21]/60' : ''}`}
                                                onClick={() => isCurrentMonth ? handleSlotClick(d, 9) : setWeekStart(d)}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {d.getDate()}
                                                    </span>
                                                    <button
                                                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-opacity"
                                                        onClick={(e) => { e.stopPropagation(); handleSlotClick(d, 9); }}
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                                <div className="space-y-0.5">
                                                    {dayEvents.slice(0, 3).map(ev => (
                                                        <div
                                                            key={ev.id}
                                                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity ${getEventPillClass(ev.type, false, ev.status)}`}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setShowEventDetail(true); }}
                                                        >
                                                            {ev.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 3 && (
                                                        <p className="text-[10px] text-gray-400 font-medium px-1">+{dayEvents.length - 3} till</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Day / Week time grid */
                            <div className="flex-1 overflow-y-auto relative">
                                <div className={`grid ${viewMode === 'day' ? 'grid-cols-[44px_1fr]' : 'grid-cols-[44px_repeat(7,1fr)]'} relative`}
                                    style={{ height: `${HOURS.length * HOUR_H}px` }}
                                >
                                    {/* Hour rows — background lines */}
                                    {HOURS.map(hour => (
                                        <React.Fragment key={hour}>
                                            {/* Time label column */}
                                            <div
                                                className="border-r border-gray-200 dark:border-[#2a2b2d] text-right pr-2 text-[9px] font-medium text-gray-400 dark:text-gray-600 select-none"
                                                style={{ gridColumn: 1, gridRow: 1, position: 'absolute', top: `${(hour - 8) * HOUR_H}px`, width: '44px' }}
                                            >
                                                <span className="inline-block -translate-y-2">{String(hour).padStart(2, '0')}:00</span>
                                            </div>
                                        </React.Fragment>
                                    ))}

                                    {/* Horizontal hour lines */}
                                    {HOURS.map(hour => (
                                        <div
                                            key={`line-${hour}`}
                                            className="absolute left-11 right-0 border-t border-gray-100 dark:border-[#252628]"
                                            style={{ top: `${(hour - 8) * HOUR_H}px` }}
                                        />
                                    ))}

                                    {/* Day columns */}
                                    {weekDays.map((d, colIdx) => {
                                        const dayEvents = getEventsForDay(d);
                                        const isToday = isSameDay(d, new Date());
                                        const isSunday = d.getDay() === 0;

                                        return (
                                            <div
                                                key={colIdx}
                                                className={`relative border-r border-gray-100 dark:border-[#252628] last:border-r-0 cursor-pointer group
                                                    ${isToday ? 'bg-indigo-50/40 dark:bg-indigo-500/[0.04]' : ''}
                                                    ${isSunday && !isToday ? 'bg-gray-50/50 dark:bg-[#1e1f21]/40' : ''}`}
                                                style={{ gridColumn: colIdx + 2, gridRow: '1 / -1', height: `${HOURS.length * HOUR_H}px`, minWidth: 0 }}
                                            >
                                                {/* Click zones per hour */}
                                                {HOURS.map(hour => (
                                                    <div
                                                        key={hour}
                                                        className="absolute w-full hover:bg-indigo-50/60 dark:hover:bg-indigo-500/[0.06] transition-colors"
                                                        style={{ top: `${(hour - 8) * HOUR_H}px`, height: `${HOUR_H}px` }}
                                                        onClick={() => handleSlotClick(d, hour)}
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                            <Plus size={13} className="text-indigo-400" />
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Current time line */}
                                                {isToday && timeTop !== null && (
                                                    <div
                                                        className="absolute left-0 right-0 z-20 pointer-events-none"
                                                        style={{ top: `${timeTop}px` }}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                                            <div className="h-px flex-1 bg-rose-500" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Events */}
                                                {dayEvents.map(ev => {
                                                    const style = getEventStyle(ev);
                                                    return (
                                                        <div
                                                            key={`${ev.id}-${ev.isSecondary}`}
                                                            className={`absolute inset-x-1 rounded-lg text-[11px] px-2 py-1.5 overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:brightness-95 transition-all ${getEventPillClass(ev.type, ev.isSecondary, ev.status)} ${ev.isSecondary ? 'z-[5]' : 'z-10'}`}
                                                            style={{ ...style, zIndex: ev.isSecondary ? 5 : 10 }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setShowEventDetail(true); }}
                                                        >
                                                            <div className="font-semibold truncate leading-snug">{ev.title}</div>
                                                            <div className="opacity-60 truncate mt-0.5">
                                                                {ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{ev.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div className="w-60 shrink-0 flex flex-col gap-0 border-l border-gray-200 dark:border-[#2a2b2d] bg-white dark:bg-[#1a1b1d] overflow-y-auto">
                        <div className="p-3">
                            <MiniCalendar
                                currentDate={weekStart}
                                onDateSelect={(date) => {
                                    setWeekStart(viewMode === 'day' ? date : getMonday(date));
                                    setSelectedMobileDate(date);
                                }}
                            />
                        </div>
                        <div className="border-t border-gray-100 dark:border-[#252628] p-3">
                            <ImportantDatesWidget
                                events={calEvents}
                                onEventClick={(ev) => { setSelectedEvent(ev); setShowEventDetail(true); }}
                            />
                        </div>

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-6 text-gray-400">
                                <Loader2 size={16} className="animate-spin mr-2" />
                                <span className="text-xs">Laddar...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BOOKING MODAL ── */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1a1b1d] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden">
                        <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
                        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-[#2a2b2d] flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Ny händelse</h2>
                            <button onClick={() => setShowBookingModal(false)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Title */}
                            <div>
                                <label className={labelCls}>Titel *</label>
                                <input className={inputCls} placeholder="Namnge händelsen..." required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                            </div>

                            {/* Date + times */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-3 sm:col-span-1">
                                    <label className={labelCls}>Datum</label>
                                    <input type="date" className={inputCls} required value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Start</label>
                                    <input type="time" className={inputCls} required value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Slut</label>
                                    <input type="time" className={inputCls} required value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                                </div>
                            </div>

                            {/* Type + Course */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Typ</label>
                                    <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} className={inputCls}>
                                        <option value="LESSON">Lektion</option>
                                        <option value="MEETING">Möte</option>
                                        <option value="WORKSHOP">Workshop</option>
                                        <option value="EXAM">Tenta</option>
                                        <option value="ASSIGNMENT">Uppgift</option>
                                        <option value="OTHER">Annat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Kurs</label>
                                    <select value={newEvent.courseId || ''} onChange={e => setNewEvent({ ...newEvent, courseId: e.target.value || null })} className={inputCls}>
                                        <option value="">Ingen kurs</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Attendee + Platform */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Deltagare</label>
                                    <select value={newEvent.attendeeId || ''} onChange={e => setNewEvent({ ...newEvent, attendeeId: e.target.value || null })} className={inputCls}>
                                        <option value="">Endast jag</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Plattform</label>
                                    <select
                                        value={newEvent.platform || 'NONE'}
                                        onChange={e => setNewEvent({ ...newEvent, platform: e.target.value })}
                                        className={inputCls}
                                    >
                                        <option value="NONE">Fysisk / Ingen</option>
                                        <option value="EXAM_ROOM">Tentarum</option>
                                        <option value="ZOOM">Zoom</option>
                                        <option value="TEAMS">Teams</option>
                                        <option value="MEETS">Google Meet</option>
                                    </select>
                                </div>
                            </div>

                            {/* Topic */}
                            <div>
                                <label className={labelCls}>Ämne / Fokus</label>
                                <input type="text" value={newEvent.topic || ''} onChange={e => setNewEvent({ ...newEvent, topic: e.target.value })} placeholder="T.ex. Genomgång av modul 3" className={inputCls} />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelCls}>Beskrivning</label>
                                <textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className={`${inputCls} resize-none`} rows={2} />
                            </div>

                            {/* Mandatory */}
                            {isTeacherOrAdmin && (
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.isMandatory || false}
                                        onChange={e => setNewEvent({ ...newEvent, isMandatory: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Obligatorisk närvaro</span>
                                </label>
                            )}

                            {/* Availability */}
                            {(isCheckingAvailability || availabilityStatus.message) && (
                                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${availabilityStatus.isBusy
                                    ? 'bg-rose-50 dark:bg-rose-900/15 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
                                    : 'bg-sky-50 dark:bg-sky-900/15 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800/30'
                                    }`}>
                                    {isCheckingAvailability
                                        ? <><Loader2 size={13} className="animate-spin" /> Kollar tillgänglighet...</>
                                        : <><AlertTriangle size={13} /> {availabilityStatus.message}</>
                                    }
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={availabilityStatus.isBusy || isCheckingAvailability}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                            >
                                {availabilityStatus.isBusy ? 'Tid redan bokad' : 'Bekräfta bokning'}
                            </button>
                        </form>
                    </div>
                </div >
            )}

            {/* ── EVENT DETAIL PANEL ── */}
            <EventDetailPanel
                event={selectedEvent}
                isOpen={showEventDetail}
                onClose={() => { setShowEventDetail(false); setSelectedEvent(null); }}
                onDelete={handleDeleteEvent}
                onUpdateStatus={handleUpdateEventStatus}
                isTeacherOrAdmin={isTeacherOrAdmin}
            />

            {/* ── CALENDAR SYNC MODAL ── */}
            {
                showSyncModal && icalInfo && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1a1b1d] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden">
                            <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

                            {/* Header */}
                            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-[#2a2b2d] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Rss size={15} className="text-indigo-500" />
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Synka kalender</h2>
                                </div>
                                <button onClick={() => setShowSyncModal(false)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] rounded-lg transition-colors">
                                    <X size={15} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Prenumerera på din personliga kalenderadress för att få dina lektioner och möten i Google Calendar, Apple Calendar, Outlook eller annan kalenderapp.
                                </p>

                                {/* Feed URL */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Din kalenderadress</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 min-w-0 bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-300 truncate font-mono">
                                            {icalInfo.fullUrl}
                                        </div>
                                        <button
                                            onClick={copyIcalUrl}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${copied
                                                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-gray-100 dark:bg-[#252628] text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600'
                                                }`}
                                        >
                                            {copied ? <><CheckCheck size={13} /> Kopierad</> : <><Copy size={13} /> Kopiera</>}
                                        </button>
                                    </div>
                                </div>

                                {/* App links */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Lägg till i din kalenderapp</label>
                                    <div className="space-y-2">
                                        <a
                                            href={`https://calendar.google.com/calendar/r/settings/addbyurl?url=${encodeURIComponent(icalInfo.fullUrl)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-md bg-white dark:bg-[#252628] shadow-sm flex items-center justify-center text-sm">🗓️</div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Google Calendar</span>
                                            </div>
                                            <ExternalLink size={12} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        </a>
                                        <a
                                            href={`https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(icalInfo.fullUrl)}&name=EduFlex`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-md bg-white dark:bg-[#252628] shadow-sm flex items-center justify-center text-sm">📅</div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Outlook / Microsoft 365</span>
                                            </div>
                                            <ExternalLink size={12} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        </a>
                                        <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl">
                                            <div className="w-6 h-6 shrink-0 rounded-md bg-white dark:bg-[#252628] shadow-sm flex items-center justify-center text-sm mt-0.5">🍎</div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 block">Apple Calendar</span>
                                                <span className="text-[11px] text-gray-400 leading-relaxed">Öppna Kalender → Arkiv → Ny kalenderprenumeration → klistra in adressen ovan.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#252628] pt-3">
                                    Adressen är personlig och privat — dela den inte med andra. Kalendern uppdateras automatiskt i din app ungefär en gång per timme.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CalendarView;
