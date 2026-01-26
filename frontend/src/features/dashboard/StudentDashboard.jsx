import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MessageCenter from '../messages/MessageCenter';
import { useDesignSystem } from '../../context/DesignSystemContext';

// --- WIDGETS ---
import StudentCourseGrid from './components/student/StudentCourseGrid';
import StudentSidebar from './components/student/StudentSidebar';
import StudentAttendanceWidget from './widgets/StudentAttendanceWidget';
import DailyChallengesWidget from '../../components/gamification/DailyChallengesWidget';
import StudentScheduleAndDeadlinesWidget from './widgets/StudentScheduleAndDeadlinesWidget';
import StudentGamificationWidget from './widgets/StudentGamificationWidget';
import AchievementsWidget from './widgets/AchievementsWidget';
import WidgetWrapper from './components/WidgetWrapper';

// --- SHARED ---
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import DashboardCustomizer from '../../components/dashboard/DashboardCustomizer';

const StudentDashboard = ({ currentUser }) => {
    const { t } = useTranslation();
    const { isModuleActive } = useModules();
    const navigate = useNavigate();
    const { currentDesignSystem } = useDesignSystem();

    const [myCourses, setMyCourses] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [lastGradedSubmission, setLastGradedSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Widget State via Hook
    const { widgets, toggleWidget } = useDashboardWidgets('student', {
        stats: true,
        attendance: true,
        courses: true,
        sidebar: true,
        dailyChallenges: true,
        calendar: true,
        achievements: true
    });

    const widgetLabels = {
        stats: 'Gamification Status',
        attendance: 'Min Närvaro',
        courses: 'Mina Kurser',
        sidebar: 'Uppgifter & Feedback',
        dailyChallenges: 'Dagens Utmaningar',
        calendar: 'Kalender & Schema',
        achievements: 'Mina Prestationer'
    };

    useEffect(() => {
        if (currentUser) {
            fetchData();
            const pingInterval = setInterval(() => {
                api.users.ping().catch(e => console.error("Ping failed", e));
            }, 60000);
            api.users.ping();
            return () => clearInterval(pingInterval);
        }
    }, [currentUser]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const coursesData = await api.courses.getMyCourses(currentUser.id);
            setMyCourses(coursesData || []);

            let activeAssignments = [];
            let allGraded = [];

            if (coursesData && coursesData.length > 0) {
                const promises = coursesData.map(async (course) => {
                    try {
                        const assignments = await api.assignments.getByCourse(course.id);
                        const assignmentPromises = assignments.map(async (assign) => {
                            try {
                                const mySub = await api.assignments.getMySubmission(assign.id, currentUser.id);
                                if (mySub && mySub.grade) {
                                    allGraded.push({ ...mySub, assignmentTitle: assign.title, courseName: course.name, courseId: course.id });
                                }
                                if (!mySub) {
                                    return { ...assign, courseName: course.name, courseId: course.id };
                                }
                                return null;
                            } catch { return { ...assign, courseName: course.name, courseId: course.id }; }
                        });
                        const results = await Promise.all(assignmentPromises);
                        return results.filter(a => a !== null);
                    } catch { return []; }
                });

                const results = await Promise.all(promises);
                results.forEach(arr => activeAssignments.push(...arr));
            }

            const now = new Date();
            const upcoming = activeAssignments
                .map(a => ({ ...a, parsedDate: parseDate(a.dueDate) }))
                .filter(a => a.parsedDate > now)
                .sort((a, b) => a.parsedDate - b.parsedDate)
                .slice(0, 5);

            setUpcomingAssignments(upcoming);

            if (allGraded.length > 0) {
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
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20 relative p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043]">
                    <button onClick={() => setActiveTab('overview')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <LayoutDashboard size={18} /> {t('sidebar.dashboard')}
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'messages' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <MessageSquare size={18} /> {t('shortcuts.messages')}
                    </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <DashboardCustomizer
                        widgets={widgets}
                        toggleWidget={toggleWidget}
                        widgetLabels={widgetLabels}
                    />
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN (Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {widgets.calendar && (
                            <WidgetWrapper className="h-auto">
                                <StudentScheduleAndDeadlinesWidget assignments={upcomingAssignments} />
                            </WidgetWrapper>
                        )}

                        {widgets.attendance && (
                            <WidgetWrapper className="h-auto">
                                <StudentAttendanceWidget currentUser={currentUser} settings={{ enabled: true }} />
                            </WidgetWrapper>
                        )}

                        {widgets.courses && (
                            <StudentCourseGrid courses={myCourses} navigate={navigate} />
                        )}


                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="lg:col-span-1 space-y-6">
                        {widgets.stats && (
                            <WidgetWrapper className="h-auto">
                                <StudentGamificationWidget currentUser={currentUser} isModuleActive={isModuleActive} />
                            </WidgetWrapper>
                        )}

                        {widgets.sidebar && (
                            <StudentSidebar
                                upcomingAssignments={upcomingAssignments}
                                lastGraded={lastGradedSubmission}
                                isModuleActive={isModuleActive}
                                navigate={navigate}
                                currentUser={currentUser}
                            />
                        )}

                        {widgets.dailyChallenges && (
                            <WidgetWrapper className="h-auto">
                                <DailyChallengesWidget />
                            </WidgetWrapper>
                        )}
                    </div>
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
