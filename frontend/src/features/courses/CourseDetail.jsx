import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, BookOpen, MessageSquare, FileText, Users, HelpCircle, Video, Monitor, Camera, Calendar, Package, Activity } from 'lucide-react';
import StudentActivityBoard from '../../components/StudentActivityBoard';
import ScormList from '../scorm/ScormList';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import SkolverketCourseInfo from '../../components/SkolverketCourseInfo';

// --- CONTEXT ---
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';

// --- MODULER ---
import CourseContentModule, { CourseContentModuleMetadata } from '../../modules/course-content/CourseContentModule';
import QuizModule, { QuizModuleMetadata } from '../../modules/quiz-runner/QuizModule';
import AssignmentsModule, { AssignmentsModuleMetadata } from '../../modules/assignments/AssignmentsModule';
import ForumModule, { ForumModuleMetadata } from '../../modules/forum/ForumModule';
import ParticipantsModule, { ParticipantsModuleMetadata } from '../../modules/participants/ParticipantsModule';
import AttendanceView from '../../components/AttendanceView';
import TeacherAttendanceView from '../dashboard/components/teacher/TeacherAttendanceView';
import EvaluationModal from '../../components/EvaluationModal';
import TeacherEvaluationModal from '../../components/TeacherEvaluationModal';
import { LiveLessonButton } from '../../modules/live-lessons';

const CourseDetail = ({ currentUser }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isModuleActive } = useModules();

    // Core State
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('material');
    const [isLoading, setIsLoading] = useState(true);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [showTeacherEvaluationModal, setShowTeacherEvaluationModal] = useState(false); // New state
    const [isSavingEvaluation, setIsSavingEvaluation] = useState(false); // New state
    const [myResult, setMyResult] = useState(null);
    const [canClaim, setCanClaim] = useState(false);
    const { API_BASE, token } = useAppContext();

    const userRole = currentUser?.role?.name || currentUser?.role;
    const isTeacher = currentUser && (userRole === 'TEACHER' || userRole === 'ADMIN' || userRole === 'REKTOR');

    // --- MODULE CONFIG ---
    const modules = [
        {
            key: 'material',
            comp: CourseContentModule,
            meta: CourseContentModuleMetadata,
            icon: <BookOpen size={18} />,
            enabled: true,
            visibleFor: 'ALL'
        },
        {
            key: 'assignments',
            comp: AssignmentsModule,
            meta: AssignmentsModuleMetadata,
            icon: <FileText size={18} />,
            enabled: isModuleActive('SUBMISSIONS'),
            visibleFor: 'ALL'
        },
        {
            key: 'quiz',
            comp: QuizModule,
            meta: QuizModuleMetadata,
            icon: <HelpCircle size={18} />,
            enabled: isModuleActive('QUIZ'),
            visibleFor: 'ALL'
        },
        {
            key: 'forum',
            comp: ForumModule,
            meta: ForumModuleMetadata,
            icon: <MessageSquare size={18} />,
            enabled: isModuleActive('FORUM'),
            visibleFor: 'ALL'
        },
        {
            key: 'scorm',
            comp: ScormList,
            meta: { name: 'Interactive Modules' },
            icon: <Package size={18} />,
            enabled: isModuleActive('SCORM'),
            visibleFor: 'ALL'
        },
        {
            key: 'students',
            comp: ParticipantsModule,
            meta: ParticipantsModuleMetadata,
            icon: <Users size={18} />,
            enabled: true,
            visibleFor: 'TEACHER'
        },
        {
            key: 'attendance',
            comp: ({ courseId, isTeacher, currentUser, course }) => {
                const { API_BASE, token } = useAppContext();
                // Visible only for teachers defined in config below, but double check safety
                if (!isTeacher) return null;

                return (
                    <div className="space-y-12">
                        <TeacherAttendanceView course={course} currentUser={currentUser} API_BASE={API_BASE} token={token} />

                        <div className="pt-8 border-t border-gray-200 dark:border-[#3c4043]">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Activity size={24} className="text-indigo-600 dark:text-indigo-400" />
                                Aktivitetslogg
                            </h3>
                            <StudentActivityBoard courseId={courseId} />
                        </div>
                    </div>
                );
            },
            meta: { name: 'Närvaro & Aktivitet' },
            icon: <Calendar size={18} />,
            enabled: true,
            visibleFor: 'TEACHER'
        },
        {
            key: 'kursinformation',
            comp: ({ course }) => <SkolverketCourseInfo skolverketCourse={course?.skolverketCourse} />,
            meta: { name: 'Kursinformation' },
            icon: <BookOpen size={18} />,
            enabled: !!course?.skolverketCourse,
            visibleFor: 'ALL'
        },
        {
            key: 'grouprooms',
            comp: ({ course }) => {
                if (!course?.groupRooms?.length) return <div className="text-center p-12 text-gray-500">Inga grupprum tillgängliga.</div>;
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {course.groupRooms.map(room => (
                            <div key={room.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{room.name}</h3>
                                <div className="text-sm text-gray-500 mb-4 flex items-center gap-2"><Video size={14} /> {room.type}</div>
                                <a href={room.link} target="_blank" rel="noreferrer" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors">
                                    Gå med
                                </a>
                            </div>
                        ))}
                    </div>
                );
            },
            meta: { name: 'Grupprum' },
            icon: <Users size={18} />,
            enabled: true, // Always enabled, handles empty inside
            visibleFor: 'ALL'
        }
    ];

    // --- DATA LOADING ---
    useEffect(() => {
        const loadCourseData = async () => {
            setIsLoading(true);
            try {
                const courseData = await api.courses.getOne(id);
                setCourse(courseData);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        const loadResult = async () => {
            try {
                const res = await api.courses.getResult(id, currentUser.id);
                setMyResult(res);

                // Om ej klar, kolla om vi KAN bli klara
                if (!res || res.status !== 'PASSED') {
                    const completed = await api.courses.checkCompletion(id, currentUser.id);
                    setCanClaim(completed);
                }
            } catch (e) { /* ignore */ }
        };

        if (id) {
            loadCourseData();
            if (!isTeacher) loadResult();
        }
    }, [id, currentUser, isTeacher]);

    useEffect(() => {
        const currentMod = modules.find(m => m.key === activeTab);
        if (currentMod && !currentMod.enabled) {
            setActiveTab('material');
        }
    }, [modules, activeTab]);

    // --- HELPER FÖR DIGITALT KLASSRUM ---
    const getServiceIcon = (type) => {
        switch (type) {
            case 'ZOOM': return <Video size={18} />;
            case 'TEAMS': return <Users size={18} />;
            case 'MEET': return <Camera size={18} />;
            default: return <Monitor size={18} />;
        }
    };

    const getServiceColor = (type) => {
        switch (type) {
            case 'ZOOM': return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
            case 'TEAMS': return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
            case 'MEET': return 'bg-green-600 hover:bg-green-700 shadow-green-200';
            default: return 'bg-gray-700 hover:bg-gray-800';
        }
    };

    const getServiceName = (type) => {
        switch (type) {
            case 'ZOOM': return 'Zoom';
            case 'TEAMS': return 'Teams';
            case 'MEET': return 'Google Meet';
            default: return t('course.connect_classroom');
        }
    };

    // --- CERTIFICATE HANDLER ---
    const downloadCertificate = async () => {
        try {
            const response = await fetch(`${window.location.origin}/api/certificates/download/${id}/${currentUser.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${course.name}_Certificate.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Kunde inte ladda ner certifikat. Kontrollera att du är klar med kursen.");
            }
        } catch (e) {
            console.error(e);
            alert("Ett fel inträffade vid nedladdning.");
        }
    };

    // --- TEACHER EVALUATION HANDLER ---
    const handleSaveEvaluation = async (evaluationData) => {
        setIsSavingEvaluation(true);
        try {
            const res = await fetch(`${API_BASE}/courses/${id}/evaluation`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(evaluationData)
            });

            if (res.ok) {
                const updatedEvaluation = await res.json();
                setCourse(prev => ({ ...prev, evaluation: updatedEvaluation }));
                setShowTeacherEvaluationModal(false);
                alert(t('evaluation.saved_success') || "Utvärdering sparad!");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error(error);
            alert(t('evaluation.save_error') || "Kunde inte spara utvärderingen.");
        } finally {
            setIsSavingEvaluation(false);
        }
    };

    if (isLoading) return <div className="h-full flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
    if (!course) return <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Kursen hittades inte.</div>;

    return (
        <div className="max-w-screen-2xl mx-auto pb-20 animate-in fade-in duration-500">

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* --- LEFT SIDEBAR (Navigation & Context) --- */}
                <aside className="w-full lg:w-72 shrink-0 space-y-6">
                    {/* Back & Title Card */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] p-6">
                        <button onClick={() => navigate('/')} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 font-medium transition-colors text-sm">
                            <ArrowLeft size={16} className="mr-2" /> {t('course.back')}
                        </button>

                        <div className="mb-4">
                            <span className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs font-mono font-bold mb-2">
                                {course.courseCode}
                            </span>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">{course.name}</h1>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                                <span>{course.teacher?.fullName}</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> {course.startDate} - {course.endDate}</span>
                            </div>
                        </div>

                        {/* Actions that fit in sidebar */}
                        <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                            {/* INTERNAL LIVE LESSON (Jitsi) */}
                            <LiveLessonButton
                                courseId={id}
                                currentUser={currentUser}
                                isTeacher={isTeacher}
                            />

                            {/* EXTERNAL DIGITAL CLASSROOM (Zoom/Teams/Meet) */}
                            {course.classroomLink && (
                                <a
                                    href={course.classroomLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`w-full text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:opacity-90 ${getServiceColor(course.classroomType)}`}
                                    title={t('course.external_classroom_hint') || 'Externt klassrum'}
                                >
                                    {getServiceIcon(course.classroomType)} Anslut till {getServiceName(course.classroomType)}
                                </a>
                            )}

                            {/* TEACHER: MANAGE EVALUATION BUTTON (Sidebar) */}
                            {isTeacher && (
                                <button
                                    onClick={() => setShowTeacherEvaluationModal(true)}
                                    className="w-full bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#303336] transition-colors shadow-sm"
                                >
                                    <MessageSquare size={16} /> {t('evaluation.manage_btn') || 'Hantera Utvärdering'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] p-2 flex flex-col gap-1 sticky top-6">
                        {modules.map(mod => {
                            const isVisible = mod.enabled && (mod.visibleFor === 'ALL' || (mod.visibleFor === 'TEACHER' && isTeacher));
                            if (!isVisible) return null;
                            const isActive = activeTab === mod.key;
                            return (
                                <button
                                    key={mod.key}
                                    onClick={() => setActiveTab(mod.key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c] hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                >
                                    <span className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {mod.icon}
                                    </span>
                                    <span>{t(`course.${mod.key}`, mod.meta.name)}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* --- RIGHT CONTENT AREA --- */}
                <main className="flex-1 min-w-0">
                    {/* Top Actions Bar (Certificate, Eval, etc) - ONLY VISIBLE IF CONTENT EXISTS */}
                    {!isTeacher && ((myResult?.status === 'PASSED' || canClaim) || (course.evaluation && course.evaluation.active)) && (
                        <div className="flex flex-wrap gap-3 mb-6 justify-end">
                            {/* CERTIFICATE BUTTON (STUDENT ONLY) */}
                            {(myResult?.status === 'PASSED' || canClaim) && (
                                <button
                                    onClick={async () => {
                                        if (myResult?.status !== 'PASSED') {
                                            try {
                                                await api.courses.claimCertificate(id, currentUser.id);
                                                setMyResult({ ...myResult, status: 'PASSED' });
                                            } catch (e) {
                                                alert("Kunde inte utfärda certifikat.");
                                                return;
                                            }
                                        }
                                        navigate(`/certificate/${id}`);
                                    }}
                                    className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 border border-amber-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:from-amber-300 hover:to-yellow-500 transition-all shadow-sm"
                                >
                                    <Users size={16} /> {myResult?.status === 'PASSED' ? t('course.view_certificate') : t('course.claim_certificate')}
                                </button>
                            )}



                            {/* STUDENT: EVALUATE COURSE BUTTON */}
                            {course.evaluation && course.evaluation.active && (
                                <button
                                    onClick={() => setShowEvaluationModal(true)}
                                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-pink-200 transition-all hover:-translate-y-0.5"
                                >
                                    <MessageSquare size={16} /> {t('course.evaluate_course')}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Active Module Content */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] p-6 lg:p-8 min-h-[1000px]">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-[#3c4043]">
                            {modules.find(m => m.key === activeTab)?.meta.name || t(`course.${activeTab}`)}
                        </h2>
                        {modules.map(mod => (
                            activeTab === mod.key && mod.enabled && (
                                <mod.comp key={mod.key} courseId={id} currentUser={currentUser} isTeacher={isTeacher} course={course} />
                            )
                        ))}
                    </div>
                </main>
            </div>

            {/* EVALUATION MODAL (STUDENT) */}
            {showEvaluationModal && (
                <EvaluationModal
                    course={course}
                    onClose={() => setShowEvaluationModal(false)}
                    onSubmit={(courseId, answers) => {
                        fetch(`${API_BASE}/courses/${courseId}/evaluation/submit`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studentId: currentUser.id, answers })
                        })
                            .then(async res => {
                                if (res.ok) { alert(t('course.feedback_thanks')); setShowEvaluationModal(false); }
                                else { alert(t('course.error_occurred') + " " + await res.text()); }
                            })
                            .catch(err => console.error(err));
                    }}
                />
            )}

            {/* TEACHER EVALUATION MODAL */}
            {showTeacherEvaluationModal && (
                <TeacherEvaluationModal
                    course={course}
                    onClose={() => setShowTeacherEvaluationModal(false)}
                    onSave={handleSaveEvaluation}
                    isLoading={isSavingEvaluation}
                />
            )}
        </div>
    );
};

export default CourseDetail;
