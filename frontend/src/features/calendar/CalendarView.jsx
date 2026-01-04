import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Loader2, Plus, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const CalendarView = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAppContext();

    // State för data
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);

    // State för Modaler
    const [showBookingModal, setShowBookingModal] = useState(false); // För att skapa
    const [showDetailsModal, setShowDetailsModal] = useState(false); // För att visa detaljer
    const [selectedDay, setSelectedDay] = useState(null);            // Dagen man klickat på

    // Form data för bokning
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', date: '', startTime: '09:00', endTime: '10:00', type: 'LECTURE', courseId: ''
    });

    const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

    // --- DATA FETCHING ---
    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const allCourses = await api.courses.getAll();
            setCourses(allCourses);

            // Filtrera kurser för visning
            const myCourses = allCourses.filter(c => {
                if (currentUser.role === 'ADMIN') return true;
                if (currentUser.role === 'TEACHER') return c.teacher?.id === currentUser.id;
                return c.students?.some(s => s.id === currentUser.id);
            });

            // Hämta manuella events
            let manualEvents = [];
            try {
                manualEvents = await api.events.getAll();
            } catch (e) { console.log("Inga manuella events kunde hämtas"); }

            // Hämta inlämningsuppgifter (Assignments)
            // Detta är viktigt för att se deadlines i kalendern!
            let assignmentEvents = [];
            if (myCourses.length > 0) {
                const assignPromises = myCourses.map(c =>
                    api.assignments.getByCourse(c.id).then(assigns => assigns.map(a => ({
                        ...a,
                        type: 'ASSIGNMENT',
                        date: new Date(a.dueDate),
                        title: `Inlämning: ${a.title}`,
                        courseId: c.id,
                        courseName: c.name
                    }))).catch(() => [])
                );
                const results = await Promise.all(assignPromises);
                results.forEach(arr => assignmentEvents.push(...arr));
            }

            const loadedEvents = [];

            // 1. Lägg till Kursstart/Slut
            myCourses.forEach(course => {
                if (course.startDate) {
                    loadedEvents.push({
                        id: `start-${course.id}`,
                        date: new Date(course.startDate),
                        title: `Kursstart: ${course.name}`,
                        type: 'course-start',
                        courseId: course.id
                    });
                }
                if (course.endDate) {
                    loadedEvents.push({
                        id: `end-${course.id}`,
                        date: new Date(course.endDate),
                        title: `Kursslut: ${course.name}`,
                        type: 'course-end',
                        courseId: course.id
                    });
                }
            });

            // 2. Lägg till manuella events
            if(manualEvents) {
                manualEvents.forEach(evt => {
                    const belongsToMyCourse = myCourses.some(c => c.id === evt.course?.id);
                    if (belongsToMyCourse) {
                        loadedEvents.push({
                            id: `evt-${evt.id}`,
                            date: new Date(evt.startTime),
                            startTime: new Date(evt.startTime),
                            endTime: new Date(evt.endTime),
                            title: evt.title,
                            description: evt.description,
                            type: evt.type,
                            courseId: evt.course?.id
                        });
                    }
                });
            }

            // 3. Lägg till Assignments
            loadedEvents.push(...assignmentEvents);

            setEvents(loadedEvents);
        } catch (error) {
            console.error("Kunde inte hämta kalenderdata:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- INTERAKTION ---
    const handleDayClick = (date) => {
        setSelectedDay(date);
        setShowDetailsModal(true);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const startDateTime = `${newEvent.date}T${newEvent.startTime}:00`;
            const endDateTime = `${newEvent.date}T${newEvent.endTime}:00`;

            const payload = {
                title: newEvent.title,
                description: newEvent.description,
                startTime: startDateTime,
                endTime: endDateTime,
                type: newEvent.type,
                courseId: newEvent.courseId
            };

            await api.events.create(payload);
            alert("Händelse bokad!");
            setShowBookingModal(false);
            fetchData();
        } catch (err) {
            alert("Kunde inte skapa händelse.");
        }
    };

    // --- KALENDER-HJÄLPFUNKTIONER ---
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1; // Måndag = 0
    };
    const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

    const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
    const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();

    const currentMonthEvents = events.filter(e =>
        e.date.getMonth() === currentDate.getMonth() &&
        e.date.getFullYear() === currentDate.getFullYear()
    ).sort((a, b) => a.date - b.date);

    // Filter events for selected day modal
    const selectedDayEvents = selectedDay ? events.filter(e => isSameDay(e.date, selectedDay)) : [];

    if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32}/><p className="mt-4 text-gray-500">Laddar kalender...</p></div>;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in pb-10 relative">

            {/* --- HEADER --- */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <CalIcon className="text-indigo-600" size={32}/>
                        Kalender & Schema
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Översikt över kurser, föreläsningar och inlämningar.</p>
                </div>

                <div className="flex items-center gap-4">
                    {isTeacherOrAdmin && (
                        <button onClick={() => setShowBookingModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm">
                            <Plus size={18} /> Boka Händelse
                        </button>
                    )}

                    <div className="flex items-center gap-2 bg-white dark:bg-[#1E1F20] p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043]">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg"><ChevronLeft size={20}/></button>
                        <span className="font-bold text-sm w-28 text-center text-gray-900 dark:text-white capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg"><ChevronRight size={20}/></button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- KALENDER-RUTNÄT --- */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#3c4043]">
                    <div className="grid grid-cols-7 mb-4">
                        {dayNames.map(d => (
                            <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                            const isToday = isSameDay(thisDate, today);
                            const dayEvents = events.filter(e => isSameDay(e.date, thisDate));

                            return (
                                <div
                                    key={dayNum}
                                    onClick={() => handleDayClick(thisDate)}
                                    className={`aspect-square rounded-xl border p-2 relative flex flex-col justify-between transition-all cursor-pointer group 
                                        ${isToday ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-gray-100 dark:border-[#3c4043] bg-gray-50/30 dark:bg-[#282a2c]/50 hover:border-indigo-300 dark:hover:border-indigo-500'}
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>{dayNum}</span>

                                    {/* Små färgade prickar för events */}
                                    <div className="flex gap-1 flex-wrap content-end">
                                        {dayEvents.slice(0, 4).map((evt, idx) => {
                                            let color = 'bg-blue-500';
                                            if (evt.type === 'course-start') color = 'bg-green-500';
                                            if (evt.type === 'course-end') color = 'bg-red-500';
                                            if (evt.type === 'LECTURE') color = 'bg-purple-500';
                                            if (evt.type === 'EXAM') color = 'bg-orange-500';
                                            if (evt.type === 'ASSIGNMENT') color = 'bg-red-600';
                                            return <div key={idx} className={`w-2 h-2 rounded-full ${color}`} title={evt.title}></div>;
                                        })}
                                        {dayEvents.length > 4 && <span className="text-[8px] text-gray-400">+</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex gap-4 text-xs text-gray-500 justify-center flex-wrap">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Start</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Slut</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Föreläsning</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600"></div> Deadline</div>
                    </div>
                </div>

                {/* --- KOMMANDE HÄNDELSER (Sidolista) --- */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#3c4043] h-fit max-h-[600px] overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-500"/> Månadens Schema
                    </h3>
                    <div className="space-y-3">
                        {currentMonthEvents.length > 0 ? currentMonthEvents.map((evt, idx) => (
                            <div key={idx} onClick={() => navigate(`/course/${evt.courseId}`)} className="p-3 rounded-xl bg-gray-50 dark:bg-[#282a2c] border border-gray-100 dark:border-[#3c4043] hover:bg-gray-100 dark:hover:bg-[#3c4043] cursor-pointer transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${evt.type === 'LECTURE' ? 'bg-purple-500' : evt.type === 'ASSIGNMENT' ? 'bg-red-600' : evt.type === 'course-start' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                        {evt.type === 'course-start' ? 'START' : evt.type === 'ASSIGNMENT' ? 'DEADLINE' : evt.type}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">{evt.date.toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{evt.title}</h4>
                            </div>
                        )) : <p className="text-gray-500 text-sm italic text-center py-4">Inget schema denna månad.</p>}
                    </div>
                </div>
            </div>

            {/* --- MODAL 1: DAGSDETALJER --- */}
            {showDetailsModal && selectedDay && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-[#3c4043] animate-in zoom-in-95">
                        <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#282a2c]">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {selectedDay.getDate()} {monthNames[selectedDay.getMonth()]}
                                </h3>
                                <p className="text-xs font-bold text-gray-500 uppercase">{dayNames[selectedDay.getDay() === 0 ? 6 : selectedDay.getDay() - 1]}</p>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-[#3c4043] rounded-full text-gray-500"><X size={20}/></button>
                        </div>

                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            {selectedDayEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedDayEvents.map((ev, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#3c4043] hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => navigate(`/course/${ev.courseId}`)}>
                                            <div className={`p-3 rounded-lg flex items-center justify-center h-fit text-white
                                                ${ev.type === 'ASSIGNMENT' ? 'bg-red-500' : ev.type === 'LECTURE' ? 'bg-purple-500' : 'bg-indigo-500'}
                                            `}>
                                                {ev.type === 'ASSIGNMENT' ? <AlertCircle size={20}/> : <Clock size={20}/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{ev.title}</h4>
                                                <p className="text-xs text-gray-500">{ev.courseName || 'Kurs'}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                    {ev.startTime && <span>{ev.startTime.getHours()}:{String(ev.startTime.getMinutes()).padStart(2,'0')} - {ev.endTime.getHours()}:{String(ev.endTime.getMinutes()).padStart(2,'0')}</span>}
                                                    {ev.type === 'ASSIGNMENT' && <span className="text-red-500 font-bold uppercase">Deadline</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-[#282a2c] rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300"><CalIcon size={24}/></div>
                                    <p className="text-gray-500 text-sm">Inga händelser.</p>
                                </div>
                            )}
                        </div>
                        {isTeacherOrAdmin && (
                            <div className="p-4 bg-gray-50 dark:bg-[#282a2c] border-t border-gray-100 dark:border-[#3c4043] text-center">
                                <button onClick={() => {
                                    setNewEvent(prev => ({ ...prev, date: selectedDay.toISOString().split('T')[0] }));
                                    setShowDetailsModal(false);
                                    setShowBookingModal(true);
                                }} className="text-indigo-600 text-sm font-bold hover:underline">
                                    + Lägg till händelse detta datum
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL 2: BOKA HÄNDELSE --- */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold">Boka Händelse</h3>
                            <button onClick={() => setShowBookingModal(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Titel</label>
                                <input className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="T.ex. Föreläsning" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Typ</label>
                                    <select className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                                        <option value="LECTURE">Föreläsning</option>
                                        <option value="EXAM">Prov / Tenta</option>
                                        <option value="WORKSHOP">Workshop</option>
                                        <option value="OTHER">Övrigt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Kurs</label>
                                    <select className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" required value={newEvent.courseId} onChange={e => setNewEvent({...newEvent, courseId: e.target.value})}>
                                        <option value="">Välj kurs...</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Datum</label>
                                <input type="date" className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Starttid</label><input type="time" className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" required value={newEvent.startTime} onChange={e => setNewEvent({...newEvent, startTime: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Sluttid</label><input type="time" className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" required value={newEvent.endTime} onChange={e => setNewEvent({...newEvent, endTime: e.target.value})} /></div>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700">Boka</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;