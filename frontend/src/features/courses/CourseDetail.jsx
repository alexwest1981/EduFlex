import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, BookOpen, MessageSquare, FileText, Users, HelpCircle, Video, Monitor, Camera, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

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
    const [myResult, setMyResult] = useState(null);
    const { API_BASE, token } = useAppContext();

    const isTeacher = currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN');

    // --- MODULE CONFIG (DIN GAMLA STRUKTUR) ---
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
                if (isTeacher) return <TeacherAttendanceView course={course} currentUser={currentUser} API_BASE={API_BASE} token={token} />;
                return <AttendanceView courseId={courseId} currentUser={currentUser} API_BASE={API_BASE} token={token} />;
            },
            meta: { name: 'Närvaro' }, // Hardcoded metadata for now
            icon: <Calendar size={18} />,
            enabled: true,
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

    // --- HELPER FÖR DIGITALT KLASSRUM (NYTT) ---
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

    // --- CERTIFICATE HANDLER (BEHÅLLEN) ---
    const downloadCertificate = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8080/api/certificates/download/${id}/${currentUser.id}`, {
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

    if (isLoading) return <div className="h-full flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
    if (!course) return <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Kursen hittades inte.</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 font-medium transition-colors">
                <ArrowLeft size={20} className="mr-2" /> {t('course.back')}
            </button>

            {/* Course Header */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-8 -mt-8"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{course.name}</h1>
                        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded font-mono font-bold">{course.courseCode}</span>
                            <span>{course.teacher?.fullName}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {/* --- NYTT: DIGITALT KLASSRUM KNAPP --- */}
                        {course.classroomLink && (
                            <a
                                href={course.classroomLink}
                                target="_blank"
                                rel="noreferrer"
                                className={`text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 ${getServiceColor(course.classroomType)}`}
                            >
                                {getServiceIcon(course.classroomType)} {t('course.connect_classroom')}
                            </a>
                        )}

                        {/* --- CERTIFIKAT KNAPP (BEHÅLLEN MEN VILLKORAD) --- */}
                        {/* --- CERTIFIKAT KNAPP (BEHÅLLEN MEN VILLKORAD) --- */}
                        {/* OBS: Tog bort datumkoll för att underlätta testning. Lägg till '&& new Date(course.endDate) < new Date()' om strikt datum krävs. */}
                        {!isTeacher && myResult?.status === 'PASSED' && (
                            <button
                                onClick={downloadCertificate}
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Download size={18} /> {t('course.certificate')}
                            </button>
                        )}

                        {/* För lärare visar vi den alltid eller inaktiverad? Låt oss dölja den för lärare om de inte har certifikatfunktion själva */}

                        {/* --- EVALUATION BUTTON --- */}
                        {course.evaluation && course.evaluation.active && !isTeacher && (
                            <button
                                onClick={() => setShowEvaluationModal(true)}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-pink-200 transition-all hover:-translate-y-0.5"
                            >
                                <MessageSquare size={18} /> {t('course.evaluate_course')}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 max-w-3xl relative z-10">{course.description}</p>

                {/* DYNAMISK MODUL-MENY */}
                <div className="flex gap-6 mt-8 border-b border-gray-100 dark:border-[#3c4043] overflow-x-auto">
                    {modules.map(mod => {
                        const isVisible = mod.enabled && (mod.visibleFor === 'ALL' || (mod.visibleFor === 'TEACHER' && isTeacher));
                        if (!isVisible) return null;
                        return (
                            <button
                                key={mod.key}
                                onClick={() => setActiveTab(mod.key)}
                                className={`pb-3 flex gap-2 items-center whitespace-nowrap transition-colors ${activeTab === mod.key ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                            >
                                {mod.icon} {t(`course.${mod.key}`) || mod.meta.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[400px]">
                {modules.map(mod => (
                    activeTab === mod.key && mod.enabled && (
                        <mod.comp key={mod.key} courseId={id} currentUser={currentUser} isTeacher={isTeacher} course={course} />
                    )
                ))}
            </div>

            {/* EVALUATION MODAL */}
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
        </div>
    );
};

export default CourseDetail;