import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, CheckCircle,
    Calendar as CalendarIcon, Search, MessageSquare,
    ArrowUpRight, Plus, UserPlus, Edit2, Target, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import MessageCenter from '../messages/MessageCenter';
import RecentMessagesWidget from './components/RecentMessagesWidget';
import PredictiveRiskWidget from './components/teacher/PredictiveRiskWidget';
import OnlineFriendsWidget from './widgets/OnlineFriendsWidget';
import SurveyNotificationWidget from './widgets/SurveyNotificationWidget';
import MentorCoachWidget from './components/teacher/MentorCoachWidget';
import AiCoachWidget from '../../components/ai/AiCoachWidget';

// --- IMPORTERA KOMPONENTER (NYTT!) ---
import TeacherStats from './components/TeacherStats'; // Keep for backward compatibility if needed, or remove? I will remove usage.
import { ActiveCoursesCard, MyStudentsCard, GradingCard, ApplicationsCard, RiskCard } from './components/TeacherWidgetComponents';
import { UngradedTable, ApplicationsTable } from './components/TeacherTables';
import { CreateCourseModal, EditCourseModal } from './components/TeacherModals';
import StudentContactModal from './components/StudentContactModal';
import ClassSkillsHeatmap from '../skills/ClassSkillsHeatmap';
import TentaManager from '../../components/TentaManager';
import ProctoringDashboard from '../proctoring/ProctoringDashboard';

// --- SHARED ---
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import DashboardCustomizer from '../../components/dashboard/DashboardCustomizer';

const TeacherDashboard = ({ currentUser }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // --- STATE ---
    // Handle tab deep linking from URL (e.g. /?tab=COURSES)
    const query = new URLSearchParams(window.location.search);
    const initialTab = query.get('tab') || 'OVERVIEW';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isLoading, setIsLoading] = useState(true);

    // Sync activeTab with URL query params
    useEffect(() => {
        const currentParams = new URLSearchParams(window.location.search);
        const currentTabInUrl = currentParams.get('tab') || 'OVERVIEW';
        if (currentTabInUrl !== activeTab) {
            const newSearch = activeTab === 'OVERVIEW' ? '' : `?tab=${activeTab}`;
            navigate({ search: newSearch }, { replace: true });
        }
    }, [activeTab, navigate]);

    // Data
    const [myCourses, setMyCourses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [activeExams, setActiveExams] = useState([]);

    // UI
    const [searchTerm, setSearchTerm] = useState('');
    const [messageRecipient, setMessageRecipient] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [showTentaModal, setShowTentaModal] = useState(false);
    const [tentaCourseId, setTentaCourseId] = useState(null);
    const [selectedProctoringQuiz, setSelectedProctoringQuiz] = useState(null);

    // Widget State via Hook
    const { widgets, toggleWidget } = useDashboardWidgets('teacher', {
        showActiveCourses: true,
        showMyStudents: true,
        showToGrade: true,
        showApplications: true,
        showAtRisk: true,
        showRiskWidget: true,
        showSchedule: true,
        showShortcuts: true,
        showMessages: true,
        showOnlineFriends: true
    });


    const widgetLabels = {
        showActiveCourses: t('teacher_widgets.active_courses'),
        showMyStudents: t('teacher_widgets.my_students'),
        showToGrade: t('teacher_widgets.to_grade'),
        showApplications: t('teacher_widgets.applications'),
        showAtRisk: t('teacher_dashboard.tab_students'),
        showRiskWidget: t('teacher_widgets.risk_zone'),
        showSchedule: t('teacher_dashboard.section_schedule'),
        showShortcuts: t('teacher_dashboard.section_shortcuts'),
        showMessages: t('dashboard.widgets.messages'),
        showOnlineFriends: t('dashboard.widgets.online_friends')
    };

    useEffect(() => {
        if (currentUser) {
            loadDashboardData();
        }
    }, [currentUser]);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const allCourses = await api.courses.getAll();
            const teacherCourses = allCourses.filter(c => c.teacher?.id === currentUser.id);
            setMyCourses(teacherCourses);

            const uniqueStudentsMap = new Map();
            teacherCourses.forEach(c => {
                c.students?.forEach(s => {
                    if (!uniqueStudentsMap.has(s.id)) {
                        const lastLoginDate = s.lastLogin ? new Date(s.lastLogin) : null;
                        const lastActiveDate = s.lastActive ? new Date(s.lastActive) : null;

                        // Use the most recent of login or active
                        const latestActivity = (lastActiveDate && lastLoginDate)
                            ? (lastActiveDate > lastLoginDate ? lastActiveDate : lastLoginDate)
                            : (lastActiveDate || lastLoginDate);

                        const daysSinceLogin = latestActivity ? Math.floor((new Date() - latestActivity) / (1000 * 60 * 60 * 24)) : 999;
                        uniqueStudentsMap.set(s.id, { ...s, daysSinceLogin, riskLevel: daysSinceLogin > 14 ? 'HIGH' : daysSinceLogin > 7 ? 'MEDIUM' : 'LOW' });
                    }
                });
            });
            setAllStudents(Array.from(uniqueStudentsMap.values()));

            let events = [];
            const now = new Date();
            for (const course of teacherCourses) {
                if (course.startDate) {
                    const start = new Date(course.startDate);
                    const end = course.endDate ? new Date(course.endDate) : null;

                    if (start <= now && (!end || end > now)) {
                        events.push({ date: start, title: `${course.name}`, type: 'ONGOING' });
                    } else if (start > now) {
                        events.push({ date: start, title: t('teacher_dashboard.course_start', { name: course.name }), type: 'UPCOMING' });
                    }
                }
            }
            setUpcomingEvents(events.sort((a, b) => a.date - b.date));

            // Ansökningar
            try {
                const apps = await api.courses.getApplications(currentUser.id);
                if (Array.isArray(apps)) setApplications(apps);
            } catch (e) { console.error("Kunde inte hämta ansökningar"); }

            // Orättade inlämningar
            let ungraded = [];
            await Promise.all(teacherCourses.map(async (course) => {
                try {
                    const assignments = await api.assignments.getByCourse(course.id);
                    if (assignments && assignments.length > 0) {
                        for (const assign of assignments) {
                            const subs = await api.assignments.getSubmissions(assign.id);
                            if (Array.isArray(subs)) {
                                const pending = subs.filter(s => !s.grade);
                                pending.forEach(p => ungraded.push({
                                    ...p,
                                    courseName: course.name,
                                    assignmentTitle: assign.title,
                                    courseId: course.id,
                                    courseSlug: course.slug,
                                    courseCode: course.courseCode
                                }));
                            }
                        }
                    }
                } catch (e) { /* ignore */ }
            }));
            setUngradedSubmissions(ungraded);

            // Also fetch quizzes that need manual grading
            await Promise.all(teacherCourses.map(async (course) => {
                try {
                    const quizzes = await api.quiz.getByCourse(course.id);
                    for (const quiz of quizzes) {
                        if (quiz.gradingType === 'MANUAL' || quiz.isExam) {
                            const results = await api.quiz.getResults(quiz.id); // Assuming this endpoint exists or similar
                            const pending = results.filter(r => r.score === null || r.score === 0 && !r.teacherFeedback);
                            pending.forEach(p => ungraded.push({
                                ...p,
                                courseName: course.name,
                                assignmentTitle: quiz.title,
                                courseId: course.id,
                                courseSlug: course.slug,
                                isQuiz: true
                            }));
                        }
                    }
                } catch (e) { /* ignore */ }
            }));
            setUngradedSubmissions([...ungraded]);

            // Active Exams for Proctoring
            try {
                const active = await api.quiz.getActiveExams();
                setActiveExams(active || []);
            } catch (e) { console.error("Kunde inte hämta aktiva tentor"); }

        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const handleApplication = async (appId, action) => {
        try {
            await api.courses.handleApplication(appId, action);
            loadDashboardData();
            alert(action === 'approve' ? t('teacher_tables.admitted_msg') : t('teacher_tables.rejected_msg'));
        } catch (e) { alert(t('teacher_tables.error_msg')); }
    };

    if (isLoading) return <div className="p-20 text-center text-[var(--text-secondary)]">{t('messages.loading')}</div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('dashboard.teacher_panel')}</h1>
                    <p className="text-[var(--text-secondary)]">{t('dashboard.overview_for', { name: currentUser.fullName })}</p>
                </div>

            </div>

            {/* TAB MENY */}
            <div className="flex overflow-x-auto gap-1 border-b border-[var(--border-main)] mb-8">
                {[
                    { id: 'OVERVIEW', label: t('teacher_dashboard.tab_overview'), icon: <ArrowUpRight size={18} /> },
                    { id: 'GRADING', label: `${t('teacher_dashboard.tab_grading')} ${ungradedSubmissions.length > 0 ? `(${ungradedSubmissions.length})` : ''}`, icon: <CheckCircle size={18} /> },
                    { id: 'APPLICATIONS', label: `${t('teacher_dashboard.tab_applications')} ${applications.length > 0 ? `(${applications.length})` : ''}`, icon: <UserPlus size={18} /> },
                    { id: 'PROCTORING', label: `Tentamensvakt ${activeExams.length > 0 ? `(${activeExams.length})` : ''}`, icon: <ShieldCheck size={18} /> },
                    { id: 'STUDENTS', label: t('teacher_dashboard.tab_students'), icon: <Users size={18} /> },
                    { id: 'SKILLS', label: t('teacher_dashboard.tab_skills', 'Kompetensanalys'), icon: <Target size={18} /> },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}

                {/* Spacer to push Customizer to the right */}
                <div className="flex-1 border-b border-[var(--border-main)]"></div>

                {/* Dashboard Customizer (Eye Icon) */}
                {activeTab === 'OVERVIEW' && (
                    <div className="flex items-center border-b border-[var(--border-main)] pr-2">
                        <DashboardCustomizer
                            widgets={widgets}
                            toggleWidget={toggleWidget}
                            widgetLabels={widgetLabels}
                        />
                    </div>
                )}
            </div>

            {/* --- VYER --- */}

            {activeTab === 'OVERVIEW' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">

                    <SurveyNotificationWidget />
                    <AiCoachWidget role="TEACHER" courseId={myCourses[0]?.id} />

                    {/* STATS ROW */}
                    <div className="flex flex-wrap gap-6">
                        {widgets.showActiveCourses && <ActiveCoursesCard count={myCourses.length} />}
                        {widgets.showMyStudents && <MyStudentsCard count={allStudents.length} />}
                        {widgets.showToGrade && <GradingCard count={ungradedSubmissions.length} onClick={() => setActiveTab('GRADING')} />}
                        {widgets.showApplications && <ApplicationsCard count={applications.length} onClick={() => setActiveTab('APPLICATIONS')} />}
                        {widgets.showAtRisk && <RiskCard count={allStudents.filter(s => s.riskLevel === 'HIGH').length} onClick={() => setActiveTab('STUDENTS')} />}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Schema & Genvägar (Vänster - 2 kolumner bred) */}
                        <div className="lg:col-span-2 space-y-8">
                            {widgets.showSchedule && (
                                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] shadow-sm p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-[var(--text-primary)]"><CalendarIcon className="text-indigo-500" /> {t('teacher_dashboard.section_schedule')}</h3>
                                    <div className="space-y-4">
                                        {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 5).map((evt, idx) => (
                                            <div key={idx} className="flex gap-4 items-center p-3 rounded-xl bg-[var(--bg-input)]">
                                                <div className={`shadow-sm rounded-lg p-2 text-center min-w-[50px] ${evt.type === 'ONGOING' ? 'bg-emerald-500/10' : 'bg-[var(--bg-card)] border border-[var(--border-main)]'}`}>
                                                    <span className={`block text-xs font-bold uppercase ${evt.type === 'ONGOING' ? 'text-emerald-500' : 'text-rose-500'}`}>{evt.date.toLocaleString(i18n.language, { month: 'short' })}</span>
                                                    <span className={`block text-lg font-black ${evt.type === 'ONGOING' ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>{evt.date.getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{evt.title}</h4>
                                                    <p className={`text-xs ${evt.type === 'ONGOING' ? 'text-emerald-500 font-bold' : 'text-[var(--text-secondary)]'}`}>
                                                        {evt.type === 'ONGOING' ? t('teacher_dashboard.ongoing_course') : t('teacher_dashboard.upcoming_event')}
                                                    </p>
                                                </div>
                                            </div>
                                        )) : <p className="text-[var(--text-secondary)] text-sm italic">{t('teacher_dashboard.no_events')}</p>}
                                    </div>
                                </div>
                            )}

                            {widgets.showMessages && (
                                <RecentMessagesWidget onViewAll={() => setActiveTab('COMMUNICATION')} />
                            )}

                            {widgets.showShortcuts && (
                                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] shadow-sm p-6">
                                    <h3 className="font-bold text-lg mb-4 text-[var(--text-primary)]">{t('teacher_dashboard.section_shortcuts')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => navigate('/calendar')} className="p-4 bg-indigo-500/10 rounded-xl text-indigo-400 font-bold text-sm hover:bg-indigo-500/20 transition-colors text-left flex items-center gap-2">📅 {t('shortcuts.calendar')}</button>
                                        <button
                                            onClick={() => {
                                                setTentaCourseId(myCourses[0]?.id);
                                                setShowTentaModal(true);
                                            }}
                                            className="p-4 bg-amber-500/10 rounded-xl text-amber-500 font-bold text-sm hover:bg-amber-500/20 transition-colors text-left flex items-center gap-2"
                                        >
                                            📝 Boka Tentamen
                                        </button>
                                        <button onClick={() => setActiveTab('STUDENTS')} className="p-4 bg-pink-500/10 rounded-xl text-pink-400 font-bold text-sm hover:bg-pink-500/20 transition-colors text-left flex items-center gap-2">🎓 {t('shortcuts.students')}</button>
                                        <button onClick={() => setActiveTab('GRADING')} className="p-4 bg-orange-500/10 rounded-xl text-orange-400 font-bold text-sm hover:bg-orange-500/20 transition-colors text-left flex items-center gap-2">📋 {t('shortcuts.grading')}</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Meddelanden (Höger - 1 kolumn) */}
                        <div className="lg:col-span-1 h-full space-y-6">
                            {widgets.showRiskWidget && (
                                <>
                                    <MentorCoachWidget mentorId={currentUser.id} />
                                    <PredictiveRiskWidget mentorId={currentUser.id} />
                                </>
                            )}
                            {widgets.showOnlineFriends && (
                                <div className="h-80">
                                    <OnlineFriendsWidget />
                                </div>
                            )}
                            {widgets.showMessages && null}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'GRADING' && <UngradedTable ungradedSubmissions={ungradedSubmissions} />}

            {activeTab === 'APPLICATIONS' && <ApplicationsTable applications={applications} onHandleApplication={handleApplication} />}

            {activeTab === 'PROCTORING' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)]">Tentamensvakt Pro</h2>
                                <p className="text-[var(--text-secondary)] text-sm mt-1">Övervaka pågående tentamina med realtidsvideo och AI-analys.</p>
                            </div>
                            {selectedProctoringQuiz && (
                                <button
                                    onClick={() => setSelectedProctoringQuiz(null)}
                                    className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-indigo-400 transition-colors"
                                >
                                    ← Tillbaka till listan
                                </button>
                            )}
                        </div>

                        {selectedProctoringQuiz ? (
                            <ProctoringDashboard
                                quizId={selectedProctoringQuiz.quizId}
                                quizTitle={selectedProctoringQuiz.title}
                            />
                        ) : activeExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeExams.map(exam => (
                                    <div
                                        key={exam.id}
                                        className="p-6 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-input)] hover:border-indigo-500/50 transition-all cursor-pointer group"
                                        onClick={() => setSelectedProctoringQuiz(exam)}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Aktiv
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{exam.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)] mb-6">{exam.courseName}</p>

                                        <button className="w-full py-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-sm font-bold text-[var(--text-primary)] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                                            Öppna Övervakning
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-24 text-center bg-[var(--bg-input)] rounded-3xl border-2 border-dashed border-[var(--border-main)]">
                                <ShieldCheck className="mx-auto text-[var(--text-secondary)] opacity-20 w-24 h-24 mb-6" />
                                <h3 className="text-xl font-bold text-[var(--text-secondary)]">Inga aktiva tentamina</h3>
                                <p className="text-[var(--text-secondary)] opacity-60 text-sm max-w-sm mx-auto mt-2">När en student startar en tentamen kommer den att dyka upp här för övervakning.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'COURSES' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-main)]">
                        <h3 className="font-bold text-[var(--text-primary)]">{t('teacher_dashboard.section_admin')}</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setTentaCourseId(myCourses[0]?.id); // Default to first course if none selected
                                    setShowTentaModal(true);
                                }}
                                className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-700 shadow-lg"
                            >
                                <CalendarIcon size={18} /> Boka Tentamen
                            </button>
                            <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg"><Plus size={18} /> {t('admin.create_course')}</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {myCourses.map(course => (
                            <div key={course.id} className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1"><div className={`w-3 h-3 rounded-full ${course.color || 'bg-gray-300'}`}></div><span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${course.isOpen ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>{course.isOpen ? t('teacher_tables.open') : t('teacher_tables.closed')}</span><h3 className="text-lg font-bold text-[var(--text-primary)]">{course.name}</h3></div>
                                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-mono"><span>{course.courseCode}</span><span>•</span><span>{course.students?.length}/{course.maxStudents} {t('admin.students').toLowerCase()}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setTentaCourseId(course.id);
                                            setShowTentaModal(true);
                                        }}
                                        className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg font-bold text-sm hover:bg-amber-500/20 flex items-center gap-2"
                                    >
                                        <CalendarIcon size={16} /> Tenta
                                    </button>
                                    <button onClick={() => navigate(`/course/${course.slug || course.id}`)} className="px-4 py-2 bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-primary)] rounded-lg font-bold text-sm">{t('course_modal.go_to_course')}</button>
                                    <button onClick={() => { setCourseToEdit(course); setShowEditModal(true); }} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg font-bold text-sm hover:bg-indigo-500/20 flex items-center gap-2"><Edit2 size={16} /> {t('common.edit')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'STUDENTS' && (
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 border-b border-[var(--border-main)] flex justify-between items-center">
                        <h3 className="font-bold text-[var(--text-primary)]">{t('teacher_tables.all_students_count', { count: allStudents.length })}</h3>
                        <div className="relative"><Search className="absolute left-3 top-2.5 text-[var(--text-secondary)]" size={16} /><input type="text" placeholder={`${t('common.search')}...`} className="pl-9 pr-4 py-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-input)] text-sm outline-none text-[var(--text-primary)]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] uppercase text-xs font-bold border-b border-[var(--border-main)]"><tr><th className="p-4">{t('teacher_tables.student')}</th><th className="p-4">{t('teacher_tables.submitted')}</th><th className="p-4 text-right">{t('common.action')}</th></tr></thead>
                        <tbody className="divide-y divide-[var(--border-main)]">
                            {allStudents.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                                <tr key={student.id} className="hover:bg-white/5"><td className="p-4 font-bold text-[var(--text-primary)]">{student.fullName}</td><td className="p-4 text-[var(--text-secondary)]">{student.daysSinceLogin === 999 ? t('teacher_tables.never') : t('teacher_tables.days_ago', { count: student.daysSinceLogin })}</td><td className="p-4 text-right">
                                    <button onClick={() => {
                                        setMessageRecipient(student);
                                        // setActiveTab('COMMUNICATION'); // REMOVED: Now opens modal directly via messageRecipient state
                                    }} className="text-indigo-400 font-bold text-xs hover:underline">{t('teacher_tables.contact')}</button>
                                </td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'COMMUNICATION' && <MessageCenter preSelectedRecipient={messageRecipient} />}

            {activeTab === 'SKILLS' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)] shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Analysera klasskompetens</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCourses.map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => setCourseToEdit(course)} // Use courseToEdit as a temp course holder for heatmap view
                                    className={`p-6 rounded-2xl border transition-all text-left ${courseToEdit?.id === course.id
                                        ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                                        : 'border-[var(--border-main)] hover:border-indigo-500/50'
                                        }`}
                                >
                                    <h3 className="font-bold text-[var(--text-primary)] uppercase text-xs tracking-wider mb-1 opacity-60">{course.courseCode}</h3>
                                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{course.name}</h4>
                                </button>
                            ))}
                        </div>
                    </div>

                    {courseToEdit && (
                        <ClassSkillsHeatmap courseId={courseToEdit.id} courseName={courseToEdit.name} />
                    )}
                </div>
            )}

            <CreateCourseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCourseCreated={loadDashboardData} currentUser={currentUser} />
            <EditCourseModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onCourseUpdated={loadDashboardData} courseToEdit={courseToEdit} />

            {showTentaModal && (
                <TentaManager
                    courseId={tentaCourseId}
                    teacherId={currentUser.id}
                    onClose={() => setShowTentaModal(false)}
                    onSave={() => loadDashboardData()}
                />
            )}

            {/* Kontakt Modal */}
            <StudentContactModal
                isOpen={!!messageRecipient}
                onClose={() => setMessageRecipient(null)}
                student={messageRecipient}
                currentUser={currentUser}
            />
        </div>
    );
};

export default TeacherDashboard;
