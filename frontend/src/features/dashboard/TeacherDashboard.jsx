import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, CheckCircle,
    Calendar as CalendarIcon, Search, MessageSquare,
    ArrowUpRight, Plus, UserPlus, Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import MessageCenter from '../messages/MessageCenter';
import RecentMessagesWidget from './components/RecentMessagesWidget';
import TeacherAtRiskWidget from './widgets/TeacherAtRiskWidget';
import OnlineFriendsWidget from './widgets/OnlineFriendsWidget';

// --- IMPORTERA KOMPONENTER (NYTT!) ---
import TeacherStats from './components/TeacherStats'; // Keep for backward compatibility if needed, or remove? I will remove usage.
import { ActiveCoursesCard, MyStudentsCard, GradingCard, ApplicationsCard, RiskCard } from './components/TeacherWidgetComponents';
import { UngradedTable, ApplicationsTable } from './components/TeacherTables';
import { CreateCourseModal, EditCourseModal } from './components/TeacherModals';
import StudentContactModal from './components/StudentContactModal';

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

    // Data
    const [myCourses, setMyCourses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    // UI
    const [searchTerm, setSearchTerm] = useState('');
    const [messageRecipient, setMessageRecipient] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);

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
                        events.push({ date: start, title: `Kursstart: ${course.name}`, type: 'UPCOMING' });
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
                                pending.forEach(p => ungraded.push({ ...p, courseName: course.name, assignmentTitle: assign.title }));
                            }
                        }
                    }
                } catch (e) { }
            }));
            setUngradedSubmissions(ungraded);

        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const handleApplication = async (appId, action) => {
        try {
            await api.courses.handleApplication(appId, action);
            loadDashboardData();
            alert(action === 'approve' ? t('teacher_tables.admitted_msg') : t('teacher_tables.rejected_msg'));
        } catch (e) { alert(t('teacher_tables.error_msg')); }
    };

    if (isLoading) return <div className="p-20 text-center text-gray-500">{t('messages.loading')}</div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.teacher_panel')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.overview_for', { name: currentUser.fullName })}</p>
                </div>

            </div>

            {/* TAB MENY */}
            <div className="flex overflow-x-auto gap-1 border-b border-gray-200 dark:border-[#3c4043] mb-8">
                {[
                    { id: 'OVERVIEW', label: t('teacher_dashboard.tab_overview'), icon: <ArrowUpRight size={18} /> },
                    { id: 'GRADING', label: `${t('teacher_dashboard.tab_grading')} ${ungradedSubmissions.length > 0 ? `(${ungradedSubmissions.length})` : ''}`, icon: <CheckCircle size={18} /> },
                    { id: 'APPLICATIONS', label: `${t('teacher_dashboard.tab_applications')} ${applications.length > 0 ? `(${applications.length})` : ''}`, icon: <UserPlus size={18} /> },
                    { id: 'COURSES', label: t('teacher_dashboard.tab_courses'), icon: <BookOpen size={18} /> },
                    { id: 'STUDENTS', label: t('teacher_dashboard.tab_students'), icon: <Users size={18} /> },
                    { id: 'COMMUNICATION', label: t('teacher_dashboard.tab_communication'), icon: <MessageSquare size={18} /> },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}

                {/* Spacer to push Customizer to the right */}
                <div className="flex-1 border-b border-gray-200 dark:border-[#3c4043]"></div>

                {/* Dashboard Customizer (Eye Icon) */}
                {activeTab === 'OVERVIEW' && (
                    <div className="flex items-center border-b border-gray-200 dark:border-[#3c4043] pr-2">
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
                                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CalendarIcon className="text-indigo-600" /> {t('teacher_dashboard.section_schedule')}</h3>
                                    <div className="space-y-4">
                                        {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 5).map((evt, idx) => (
                                            <div key={idx} className="flex gap-4 items-center p-3 rounded-xl bg-gray-50 dark:bg-[#131314]">
                                                <div className={`shadow-sm rounded-lg p-2 text-center min-w-[50px] ${evt.type === 'ONGOING' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-[#1E1F20]'}`}>
                                                    <span className={`block text-xs font-bold uppercase ${evt.type === 'ONGOING' ? 'text-green-600' : 'text-red-500'}`}>{evt.date.toLocaleString(i18n.language, { month: 'short' })}</span>
                                                    <span className={`block text-lg font-black ${evt.type === 'ONGOING' ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{evt.date.getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{evt.title}</h4>
                                                    <p className={`text-xs ${evt.type === 'ONGOING' ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                                        {evt.type === 'ONGOING' ? t('teacher_dashboard.ongoing_course') : t('teacher_dashboard.upcoming_event')}
                                                    </p>
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-500 text-sm italic">{t('teacher_dashboard.no_events')}</p>}
                                    </div>
                                </div>
                            )}

                            {widgets.showShortcuts && (
                                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                                    <h3 className="font-bold text-lg mb-4">{t('teacher_dashboard.section_shortcuts')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => navigate('/calendar')} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-700 dark:text-indigo-300 font-bold text-sm hover:bg-indigo-100 transition-colors text-left">📅 {t('shortcuts.calendar')}</button>
                                        <button onClick={() => setActiveTab('STUDENTS')} className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-pink-700 dark:text-pink-300 font-bold text-sm hover:bg-pink-100 transition-colors text-left">🎓 {t('shortcuts.students')}</button>
                                        <button onClick={() => setActiveTab('GRADING')} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-700 dark:text-orange-300 font-bold text-sm hover:bg-orange-100 transition-colors text-left">📝 {t('shortcuts.grading')}</button>
                                        <button onClick={() => setActiveTab('COMMUNICATION')} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-300 font-bold text-sm hover:bg-green-100 transition-colors text-left">💬 {t('shortcuts.messages')}</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Meddelanden (Höger - 1 kolumn) */}
                        <div className="lg:col-span-1 h-full space-y-6">
                            {widgets.showRiskWidget && <TeacherAtRiskWidget currentUser={currentUser} settings={{ enabled: true }} />}
                            {widgets.showOnlineFriends && (
                                <div className="h-80">
                                    <OnlineFriendsWidget />
                                </div>
                            )}
                            {widgets.showMessages && <RecentMessagesWidget onViewAll={() => setActiveTab('COMMUNICATION')} />}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'GRADING' && <UngradedTable ungradedSubmissions={ungradedSubmissions} />}

            {activeTab === 'APPLICATIONS' && <ApplicationsTable applications={applications} onHandleApplication={handleApplication} />}

            {activeTab === 'COURSES' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-[#1E1F20] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043]">
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('teacher_dashboard.section_admin')}</h3>
                        <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg"><Plus size={18} /> {t('admin.create_course')}</button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {myCourses.map(course => (
                            <div key={course.id} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1"><div className={`w-3 h-3 rounded-full ${course.color || 'bg-gray-300'}`}></div><span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${course.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{course.isOpen ? t('teacher_tables.open') : t('teacher_tables.closed')}</span><h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.name}</h3></div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-mono"><span>{course.courseCode}</span><span>•</span><span>{course.students?.length}/{course.maxStudents} {t('admin.students').toLowerCase()}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/course/${course.slug || course.id}`)} className="px-4 py-2 bg-gray-100 dark:bg-[#282a2c] hover:bg-gray-200 text-gray-700 dark:text-white rounded-lg font-bold text-sm">{t('course_modal.go_to_course')}</button>
                                    <button onClick={() => { setCourseToEdit(course); setShowEditModal(true); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-100 flex items-center gap-2"><Edit2 size={16} /> {t('common.edit')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'STUDENTS' && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('teacher_tables.all_students_count', { count: allStudents.length })}</h3>
                        <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="text" placeholder={`${t('common.search')}...`} className="pl-9 pr-4 py-2 rounded-lg border dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] text-sm outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 uppercase text-xs font-bold border-b dark:border-[#3c4043]"><tr><th className="p-4">{t('teacher_tables.student')}</th><th className="p-4">{t('teacher_tables.submitted')}</th><th className="p-4 text-right">{t('common.action')}</th></tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                            {allStudents.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50"><td className="p-4 font-bold">{student.fullName}</td><td className="p-4 text-gray-500">{student.daysSinceLogin === 999 ? t('teacher_tables.never') : t('teacher_tables.days_ago', { count: student.daysSinceLogin })}</td><td className="p-4 text-right">
                                    <button onClick={() => {
                                        setMessageRecipient(student);
                                        // setActiveTab('COMMUNICATION'); // REMOVED: Now opens modal directly via messageRecipient state
                                    }} className="text-indigo-600 font-bold text-xs hover:underline">{t('teacher_tables.contact')}</button>
                                </td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'COMMUNICATION' && <MessageCenter preSelectedRecipient={messageRecipient} />}

            <CreateCourseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCourseCreated={loadDashboardData} currentUser={currentUser} />
            <EditCourseModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onCourseUpdated={loadDashboardData} courseToEdit={courseToEdit} />

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
