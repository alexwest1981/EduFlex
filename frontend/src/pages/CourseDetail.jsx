import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download } from 'lucide-react'; // Importerade Download
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

// --- CONTEXT ---
import { useAppContext } from '../context/AppContext';

// --- MODULER ---
import CourseContentModule, { CourseContentModuleMetadata } from '../modules/course-content/CourseContentModule';
import QuizModule, { QuizModuleMetadata } from '../modules/quiz-runner/QuizModule';
import AssignmentsModule, { AssignmentsModuleMetadata } from '../modules/assignments/AssignmentsModule';
import ForumModule, { ForumModuleMetadata } from '../modules/forum/ForumModule';
import ParticipantsModule, { ParticipantsModuleMetadata } from '../modules/participants/ParticipantsModule';

const CourseDetail = ({ currentUser }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { systemSettings } = useAppContext();

    // Core State
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('material');
    const [isLoading, setIsLoading] = useState(true);

    const isTeacher = currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN');

    // --- MODULE CONFIG ---
    // Här definierar vi exakt vilka moduler som ska finnas i kursvyn
    const modules = [
        // CORE: Alltid på
        {
            key: 'material',
            comp: CourseContentModule,
            meta: CourseContentModuleMetadata,
            enabled: true,
            visibleFor: 'ALL'
        },
        // VALBARA: Styrs av systeminställningar
        {
            key: 'assignments',
            comp: AssignmentsModule,
            meta: AssignmentsModuleMetadata,
            enabled: systemSettings?.[AssignmentsModuleMetadata.settingsKey] === 'true',
            visibleFor: 'ALL'
        },
        {
            key: 'quiz',
            comp: QuizModule,
            meta: QuizModuleMetadata,
            enabled: systemSettings?.[QuizModuleMetadata.settingsKey] === 'true',
            visibleFor: 'ALL'
        },
        {
            key: 'forum',
            comp: ForumModule,
            meta: ForumModuleMetadata,
            enabled: systemSettings?.[ForumModuleMetadata.settingsKey] === 'true',
            visibleFor: 'ALL'
        },
        // CORE: Men endast synlig för lärare
        {
            key: 'students',
            comp: ParticipantsModule,
            meta: ParticipantsModuleMetadata,
            enabled: true,
            visibleFor: 'TEACHER' // Egen logik för visning
        },
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
        if (id) loadCourseData();
    }, [id]);

    // Fallback: Om man står på en flik som stängs av, hoppa till material
    useEffect(() => {
        const currentMod = modules.find(m => m.key === activeTab);
        if (currentMod && !currentMod.enabled) {
            setActiveTab('material');
        }
    }, [systemSettings, activeTab]);

    // --- CERTIFICATE HANDLER ---
    const downloadCertificate = async () => {
        try {
            // OBS: I produktion bör du använda din api-tjänst, men för blob-nedladdning är fetch ofta enklast
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

    if (isLoading) return <div className="h-full flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>;
    if (!course) return <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Kursen hittades inte.</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 font-medium transition-colors">
                <ArrowLeft size={20} className="mr-2" /> {t('course.back')}
            </button>

            {/* Course Header */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-8 -mt-8"></div>

                {/* Titel & Certifikat-knapp */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.name}</h1>

                    {/* Visa knappen för alla (för test) eller lägg till villkor: && course.isCompleted */}
                    <button
                        onClick={downloadCertificate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                    >
                        <Download size={18} /> {t('common.download') || "Hämta"} Certifikat
                    </button>
                </div>

                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm mb-6 relative z-10">
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded font-mono font-bold">{course.courseCode}</span>
                    <span>{course.teacher?.fullName}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl relative z-10">{course.description}</p>

                {/* DYNAMISK MODUL-MENY */}
                <div className="flex gap-6 mt-8 border-b border-gray-100 dark:border-[#3c4043] overflow-x-auto">
                    {modules.map(mod => {
                        // Kontrollera om modulen ska visas (enabled + rätt roll)
                        const isVisible = mod.enabled && (mod.visibleFor === 'ALL' || (mod.visibleFor === 'TEACHER' && isTeacher));
                        if (!isVisible) return null;

                        return (
                            <button
                                key={mod.key}
                                onClick={() => setActiveTab(mod.key)}
                                className={`pb-3 flex gap-2 items-center whitespace-nowrap transition-colors ${activeTab === mod.key ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                            >
                                <mod.meta.icon size={18} /> {t(`course.${mod.key}`) || mod.meta.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTENT AREA - Renderar aktiv modul */}
            <div className="min-h-[400px]">
                {modules.map(mod => (
                    activeTab === mod.key && mod.enabled && (
                        <mod.comp
                            key={mod.key}
                            courseId={id}
                            currentUser={currentUser}
                            isTeacher={isTeacher}
                        />
                    )
                ))}
            </div>
        </div>
    );
};

export default CourseDetail;