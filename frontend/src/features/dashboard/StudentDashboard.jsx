import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Settings, X, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MessageCenter from '../messages/MessageCenter';

// --- NYA KOMPONENTER ---
import StudentStats from './components/student/StudentStats';
import StudentCourseGrid from './components/student/StudentCourseGrid';
import StudentSidebar from './components/student/StudentSidebar';
import StudentAttendanceWidget from './widgets/StudentAttendanceWidget';

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

    // Widget State
    const [widgets, setWidgets] = useState({
        stats: true,
        attendance: true,
        courses: true,
        sidebar: true
    });
    const [showWidgetModal, setShowWidgetModal] = useState(false);

    useEffect(() => {
        // Load widgets from localStorage
        const saved = localStorage.getItem('student_widgets');
        if (saved) setWidgets(JSON.parse(saved));
        if (currentUser) fetchData();
    }, [currentUser]);

    const toggleWidget = (key) => {
        const newWidgets = { ...widgets, [key]: !widgets[key] };
        setWidgets(newWidgets);
        localStorage.setItem('student_widgets', JSON.stringify(newWidgets));
    };

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.hi_student', { name: currentUser?.firstName })}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.student_subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowWidgetModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#282a2c]"
                >
                    <Settings size={16} /> Anpassa
                </button>
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
                    {/* VÄNSTER KOLUMN (Huvudinnehåll) */}
                    <div className={`transition-all duration-300 ${widgets.sidebar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        {/* 1. Stats & Badges */}
                        {widgets.stats && <StudentStats currentUser={currentUser} isModuleActive={isModuleActive} />}

                        {/* 2. Attendance Widget */}
                        {widgets.attendance && <StudentAttendanceWidget currentUser={currentUser} settings={{ enabled: true }} />}

                        {/* 3. Mina Kurser */}
                        {widgets.courses && <StudentCourseGrid courses={myCourses} navigate={navigate} />}

                        {!widgets.stats && !widgets.courses && (
                            <div className="text-center p-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-[#3c4043] rounded-xl">
                                Inga widgets aktiva. Klicka på "Anpassa" för att visa innehåll.
                            </div>
                        )}
                    </div>

                    {/* HÖGER KOLUMN (Sidebar) */}
                    {widgets.sidebar && (
                        <div className="lg:col-span-1 animate-in slide-in-from-right-4">
                            <StudentSidebar
                                upcomingAssignments={upcomingAssignments}
                                lastGraded={lastGradedSubmission}
                                isModuleActive={isModuleActive}
                                navigate={navigate}
                                currentUser={currentUser}
                            />
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <MessageCenter />
                </div>
            )}

            {/* WIDGET CONFIG MODAL */}
            {showWidgetModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-[#3c4043] animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Anpassa instrumentpanel</h3>
                            <button onClick={() => setShowWidgetModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-full"><X size={20} className="dark:text-white" /></button>
                        </div>
                        <div className="space-y-3">
                            <button onClick={() => toggleWidget('stats')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <span className="font-bold dark:text-white">Statistik & Utmärkelser</span>
                                {widgets.stats ? <Eye className="text-indigo-600" size={20} /> : <EyeOff className="text-gray-400" size={20} />}
                            </button>
                            <button onClick={() => toggleWidget('attendance')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <span className="font-bold dark:text-white">Min Närvaro</span>
                                {widgets.attendance ? <Eye className="text-indigo-600" size={20} /> : <EyeOff className="text-gray-400" size={20} />}
                            </button>
                            <button onClick={() => toggleWidget('courses')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <span className="font-bold dark:text-white">Mina Kurser</span>
                                {widgets.courses ? <Eye className="text-indigo-600" size={20} /> : <EyeOff className="text-gray-400" size={20} />}
                            </button>
                            <button onClick={() => toggleWidget('sidebar')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <span className="font-bold dark:text-white">Sidopanel (Uppgifter & Feedback)</span>
                                {widgets.sidebar ? <Eye className="text-indigo-600" size={20} /> : <EyeOff className="text-gray-400" size={20} />}
                            </button>
                        </div>
                        <button onClick={() => setShowWidgetModal(false)} className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">Klar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;