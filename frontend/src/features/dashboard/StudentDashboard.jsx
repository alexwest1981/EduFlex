import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Brain, Target } from 'lucide-react';
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
import OnboardingTour from '../../components/common/OnboardingTour';
import StudentGamificationWidget from './widgets/StudentGamificationWidget';
import AchievementsWidget from './widgets/AchievementsWidget';
import WidgetWrapper from './components/WidgetWrapper';
import EvaluationNotificationWidget from './widgets/EvaluationNotificationWidget';
import SurveyNotificationWidget from './widgets/SurveyNotificationWidget';
import EduQuestWidget from '../edugame/EduQuestWidget';
import EduAiHubWidget from './widgets/EduAiHubWidget';

// --- SHARED ---
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import DashboardCustomizer from '../../components/dashboard/DashboardCustomizer';
import AIPersonalizationWidget from './widgets/AIPersonalizationWidget';
import AdaptiveWidget from '../adaptive/AdaptiveWidget';
import EduAIDashboard from '../../components/gamification/EduAIDashboard';
import SkillsGapDashboard from '../skills/SkillsGapDashboard';
import CoachRecommendationBanner from '../eduai/components/CoachRecommendationBanner';
import SmartReviewDeck from '../eduai/components/SmartReviewDeck';

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
        achievements: true,
        aiInsights: true,
        eduQuest: true,
        eduAiHub: true // Default enabled
    });

    const widgetLabels = {
        stats: t('dashboard.widgets.gamification'),
        attendance: t('dashboard.widgets.attendance'),
        courses: t('dashboard.widgets.my_courses'),
        sidebar: t('dashboard.widgets.tasks'),
        dailyChallenges: t('dashboard.widgets.daily_challenges'),
        calendar: t('dashboard.widgets.calendar'),
        achievements: t('dashboard.widgets.achievements'),
        aiInsights: t('dashboard.widgets.ai_personalization'),
        eduQuest: "EduQuest Uppdrag",
        eduAiHub: "EduAI Intelligence Center"
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

    const tourSteps = [
        {
            element: '#dashboard-welcome',
            popover: {
                title: 'Välkommen till EduFlex! 👋',
                description: 'Det här är din personliga startskärm.'
            }
        },
        {
            element: '#min-larvag-card',
            popover: {
                title: 'Min Lärväg 🧠',
                description: 'Här ser du din AI-analys och din unika inlärningsprofil.'
            }
        },
        {
            element: '#daily-challenges-card',
            popover: {
                title: 'Dina Utmaningar 🏆',
                description: 'Slutför dagliga uppdrag för att tjäna XP och gå upp i nivå.'
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20 relative p-4 lg:p-8">
            <OnboardingTour steps={tourSteps} tourId="student-dashboard-v3" />

            {/* Header Section */}
            <div id="dashboard-welcome" className="flex justify-between items-center mb-6">

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043]">
                    <button onClick={() => setActiveTab('overview')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <LayoutDashboard size={18} /> {t('sidebar.dashboard')}
                    </button>
                    <button onClick={() => setActiveTab('eduai')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'eduai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <Brain size={18} /> EduAI
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'messages' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <MessageSquare size={18} /> {t('shortcuts.messages')}
                    </button>
                    <button onClick={() => setActiveTab('skills')} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'skills' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <Target size={18} /> {t('sidebar.competencies', 'Kompetenser')}
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

                        <SurveyNotificationWidget />
                        <EvaluationNotificationWidget />



                        {widgets.aiInsights && (
                            <WidgetWrapper className="h-auto" id="min-larvag-card">
                                <AdaptiveWidget />
                            </WidgetWrapper>
                        )}

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

                        {widgets.eduAiHub && (
                            <EduAiHubWidget />
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

                        {/* EduQuest Widget - Only if EDUGAME is active */}
                        {widgets.eduQuest && isModuleActive('EDUGAME') && (
                            <WidgetWrapper className="h-auto">
                                <EduQuestWidget />
                            </WidgetWrapper>
                        )}

                        {/* Legacy Daily Challenges - Hide if EduQuest is active? Or keep both? Keeping for now but maybe conditional */}
                        {widgets.dailyChallenges && !isModuleActive('EDUGAME') && (
                            <WidgetWrapper className="h-auto" id="daily-challenges-card">
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

            {activeTab === 'eduai' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <EduAIDashboard />
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <SkillsGapDashboard />
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
