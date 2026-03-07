import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Clock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateUtils'; // Assuming utility exists or I'll use inline
import { useAppContext } from '../../context/AppContext';

const StudentCoursesPage = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchCoursesData();
        }
    }, [currentUser]);

    const fetchCoursesData = async () => {
        setLoading(true);
        try {
            const myCourses = await api.courses.getMyCourses(currentUser.id);

            // For each course, fetch additional "next up" info
            const detailedCourses = await Promise.all(myCourses.map(async (course) => {
                let nextAssignment = null;
                let nextEvent = null;

                try {
                    // Fetch assignments
                    const assignments = await api.assignments.getByCourse(course.id);
                    // Filter pending and future
                    const now = new Date();
                    const pending = assignments.filter(a => new Date(a.dueDate) > now).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                    if (pending.length > 0) nextAssignment = pending[0];

                    // Fetch events (this might be heavy if getting ALL events, optimization: get by course if API supports, otherwise filter ALL)
                    // Currently api.events.getAll() is what we have. Ideally we'd have api.events.getByCourse(courseId)
                    // Let's rely on global events filtering for now to avoid N+1 heavy calls if possible, or just call getAll once outside.
                    // Actually, let's just use the basic course info first, and maybe optimize event fetching.
                    // A better pattern: Fetch ALL events once, then filter by course.
                } catch (e) {
                    console.warn(`Failed to fetch details for course ${course.id}`, e);
                }

                return { ...course, nextAssignment, nextEvent };
            }));

            // Fetch events centrally to avoid spamming API
            try {
                const allEvents = await api.events.getAll();
                const now = new Date();

                detailedCourses.forEach(course => {
                    // Find next event for this course
                    // Assuming event titles might contain course names or we filter logic. 
                    // Actually, real generic events might not link to course ID explicitly in current API response based on previous files.
                    // Let's try to match by some logic or just skip if no direct link.
                    // DocumentManager showed us events have 'title', 'startTime'.
                    // Let's assume for now we can't easily link events to courses without a courseId on the event.
                    // WE WILL SKIP EVENT FETCHING PER COURSE FOR NOW UNLESS WE FIND A LINK.
                    // Re-reading StudentScheduleAndDeadlinesWidget: it filters allEvents. 
                    // Let's see if events have a courseId. Previous file view didn't explicitly show it in the map, but it might be there.

                    // Let's try to find events where title includes course name?
                    const courseEvents = allEvents.filter(e => {
                        // Parse starTime
                        let start = null;
                        if (Array.isArray(e.startTime)) start = new Date(e.startTime[0], e.startTime[1] - 1, e.startTime[2], e.startTime[3], e.startTime[4]);
                        else start = new Date(e.startTime);

                        return start > now && (e.title && e.title.includes(course.name));
                    }).sort((a, b) => {
                        // sort
                        let startA = Array.isArray(a.startTime) ? new Date(a.startTime[0], a.startTime[1] - 1, a.startTime[2], a.startTime[3], a.startTime[4]) : new Date(a.startTime);
                        let startB = Array.isArray(b.startTime) ? new Date(b.startTime[0], b.startTime[1] - 1, b.startTime[2], b.startTime[3], b.startTime[4]) : new Date(b.startTime);
                        return startA - startB;
                    });

                    if (courseEvents.length > 0) course.nextEvent = courseEvents[0];
                });
            } catch (e) { console.error("Failed to fetch events", e); }

            setCourses(detailedCourses);
        } catch (e) {
            console.error("Failed to load courses", e);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateArr) => {
        if (!dateArr) return "";
        if (Array.isArray(dateArr)) {
            const d = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3], dateArr[4]);
            return d.toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });
        }
        return new Date(dateArr).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });
    };

    if (loading) return <div className="p-10 text-center text-[var(--text-secondary)]">Laddar kurser...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 animate-in fade-in">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Mina Kurser</h1>
            <p className="text-[var(--text-secondary)] mb-8">Här hittar du alla kurser du är registrerad på samt kommande händelser.</p>

            <div className="space-y-6">
                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--bg-card)] rounded-2xl border-2 border-dashed border-[var(--border-main)]">
                        <BookOpen size={48} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-4" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Inga kurser hittades</h3>
                        <p className="text-[var(--text-secondary)]">Du är inte registrerad på några kurser just nu.</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <div key={course.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row">
                                {/* Left Color Strip */}
                                <div className={`h-2 md:h-auto md:w-3 ${course.isOpen ? (course.color || 'bg-indigo-500') : 'bg-[#1e1e1e]'}`}></div>

                                <div className="p-6 flex-1">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-input)] px-2 py-0.5 rounded">
                                                    {course.courseCode}
                                                </span>
                                                {!course.isOpen && <span className="text-xs font-bold text-red-500 border border-red-500/20 px-2 py-0.5 rounded">AVSLUTAD</span>}
                                            </div>
                                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{course.name}</h2>
                                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 max-w-2xl">{course.description || 'Ingen beskrivning tillgänglig.'}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/course/${course.slug || course.id}`)}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center gap-2 whitespace-nowrap"
                                        >
                                            Gå till kurs <ArrowRight size={16} />
                                        </button>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border-main)]">

                                        {/* Next Assignment */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-0.5">Nästa inlämning</p>
                                                {course.nextAssignment ? (
                                                    <div>
                                                        <p className="font-bold text-sm text-[var(--text-primary)]">{course.nextAssignment.title}</p>
                                                        <p className="text-xs text-rose-500 font-medium">{formatDate(course.nextAssignment.dueDate, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-[var(--text-secondary)] italic font-normal">Inga kommande inlämningar</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Next Lesson */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-0.5">Nästa lektion</p>
                                                {course.nextEvent ? (
                                                    <div>
                                                        <p className="font-bold text-sm text-[var(--text-primary)]">{course.nextEvent.title}</p>
                                                        <p className="text-xs text-indigo-400 font-medium">{formatTime(course.nextEvent.startTime)}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-[var(--text-secondary)] italic font-normal">Inget inplanerat schema</p>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Teacher Info */}
                                    <div className="mt-4 pt-4 border-t border-[var(--border-main)] md:border-t-0 md:pt-0 md:mt-0 md:absolute md:bottom-6 md:right-6 md:w-auto">
                                        <div className="flex items-center gap-2 justify-end">
                                            <div className="w-6 h-6 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                                                {course.teacher?.firstName?.charAt(0) || 'L'}
                                            </div>
                                            <span className="text-xs text-[var(--text-secondary)]">Lärare: <span className="font-medium text-[var(--text-primary)]">{course.teacher?.fullName}</span></span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentCoursesPage;
