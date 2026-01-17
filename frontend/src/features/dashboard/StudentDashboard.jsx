import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MessageCenter from '../messages/MessageCenter';

// --- NYA KOMPONENTER ---
import StudentCourseGrid from './components/student/StudentCourseGrid';
import StudentSidebar from './components/student/StudentSidebar';
import StudentAttendanceWidget from './widgets/StudentAttendanceWidget';
import DailyChallengesWidget from '../../components/gamification/DailyChallengesWidget';
import StudentScheduleAndDeadlinesWidget from './widgets/StudentScheduleAndDeadlinesWidget';
import StudentGamificationWidget from './widgets/StudentGamificationWidget';

// --- SHARED ---
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import DashboardCustomizer from '../../components/dashboard/DashboardCustomizer';

const StudentDashboard = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const { isModuleActive } = useModules();
    const navigate = useNavigate();

    const [myCourses, setMyCourses] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [lastGradedSubmission, setLastGradedSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showGreeting, setShowGreeting] = useState(true);

    // Widget State via Hook
    const { widgets, toggleWidget } = useDashboardWidgets('student', {
        stats: true,
        attendance: true,
        courses: true,
        sidebar: true,
        dailyChallenges: true,
        calendar: true
    });

    const widgetLabels = {
        stats: 'Gamification Status',
        attendance: 'Min Närvaro',
        courses: 'Mina Kurser',
        sidebar: 'Uppgifter & Feedback',
        dailyChallenges: 'Dagens Utmaningar',
        calendar: 'Kalender & Schema'
    };

    useEffect(() => {
        if (currentUser) {
            fetchData();
            // Ping activity every minute to stay "Online"
            const pingInterval = setInterval(() => {
                api.users.ping().catch(e => console.error("Ping failed", e));
            }, 60000);
            api.users.ping(); // Initial ping

            return () => clearInterval(pingInterval);
        }
    }, [currentUser]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const coursesData = await api.courses.getMyCourses(currentUser.id);
            setMyCourses(coursesData || []);

            let activeAssignments = [];
            let allGraded = []; // Samla alla rättade uppgifter

            if (coursesData && coursesData.length > 0) {
                // Hämta uppgifter för varje kurs
                const promises = coursesData.map(async (course) => {
                    try {
                        const assignments = await api.assignments.getByCourse(course.id);

                        // Kolla inlämningsstatus för varje uppgift
                        const assignmentPromises = assignments.map(async (assign) => {
                            try {
                                const mySub = await api.assignments.getMySubmission(assign.id, currentUser.id);

                                // 1. Om rättad -> Lägg till i graded-lista
                                if (mySub && mySub.grade) {
                                    allGraded.push({
                                        ...mySub,
                                        assignmentTitle: assign.title,
                                        courseName: course.name,
                                        courseId: course.id
                                    });
                                }

                                // 2. Om ej inlämnad -> Lägg till i upcoming-lista
                                if (!mySub) {
                                    return { ...assign, courseName: course.name, courseId: course.id };
                                }
                                return null;
                            } catch {
                                return { ...assign, courseName: course.name, courseId: course.id };
                            }
                        });

                        const results = await Promise.all(assignmentPromises);
                        return results.filter(a => a !== null);
                    } catch { return []; }
                });

                const results = await Promise.all(promises);
                results.forEach(arr => activeAssignments.push(...arr));
            }

            // Sortera deadlines (närmast först)
            const now = new Date();
            const upcoming = activeAssignments
                .map(a => ({ ...a, parsedDate: parseDate(a.dueDate) }))
                .filter(a => a.parsedDate > now)
                .sort((a, b) => a.parsedDate - b.parsedDate)
                .slice(0, 5);

            setUpcomingAssignments(upcoming);

            // Hitta senaste feedbacken
            if (allGraded.length > 0) {
                // Sortera så nyaste submittedAt kommer först
                allGraded.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                setLastGradedSubmission(allGraded[0]);
            }

        } catch (e) {
            console.error("Kunde inte hämta dashboard-data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const parseDate = (dateInput) => {
        if (!dateInput) return new Date();
        if (Array.isArray(dateInput)) {
            return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
        }
        return new Date(dateInput);
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">{t('messages.loading')}</div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20 relative">
            <div className="flex justify-between items-start mb-6">
                <div>
                    {/* Greeting moved to Layout Header */}
                </div>
                <DashboardCustomizer
                    widgets={widgets}
                    toggleWidget={toggleWidget}
                    widgetLabels={widgetLabels}
                />
            </div>

            <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043] mb-8">
                <button onClick={() => setActiveTab('overview')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                    <LayoutDashboard size={18} /> {t('sidebar.dashboard')}
                </button>
                <button onClick={() => setActiveTab('messages')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'messages' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                    <MessageSquare size={18} /> {t('shortcuts.messages')}
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* VÄNSTER KOLUMN (Huvudinnehåll - 2/3 bredd) */}
                    <div className={`transition-all duration-300 ${widgets.sidebar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>

                        {/* 0. Schedule & Deadlines Widget (Combined) */}
                        {widgets.calendar && (
                            <StudentScheduleAndDeadlinesWidget assignments={upcomingAssignments} />
                        )}

                        {/* 1. Attendance Widget */}
                        {widgets.attendance && <StudentAttendanceWidget currentUser={currentUser} settings={{ enabled: true }} />}

                        {/* 2. Mina Kurser */}
                        {widgets.courses && <StudentCourseGrid courses={myCourses} navigate={navigate} />}

                        {!widgets.stats && !widgets.courses && !widgets.calendar && !widgets.attendance && (
                            <div className="text-center p-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-[#3c4043] rounded-xl">
                                Inga widgets aktiva. Klicka på "Anpassa" för att visa innehåll.
                            </div>
                        )}
                    </div>

                    {/* HÖGER KOLUMN (Sidebar - 1/3 bredd) */}
                    {widgets.sidebar && (
                        <div className="lg:col-span-1 animate-in slide-in-from-right-4 space-y-6">

                            {/* 1. Gamification Widget */}
                            {widgets.stats && (
                                <StudentGamificationWidget currentUser={currentUser} isModuleActive={isModuleActive} />
                            )}

                            {/* 2. Upcoming Assignments & Feedback (Existing) */}
                            <StudentSidebar
                                upcomingAssignments={upcomingAssignments}
                                lastGraded={lastGradedSubmission}
                                isModuleActive={isModuleActive}
                                navigate={navigate}
                                currentUser={currentUser}
                            />

                            {/* 3. Daily Challenges */}
                            {widgets.dailyChallenges && (
                                <DailyChallengesWidget />
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <MessageCenter />
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;