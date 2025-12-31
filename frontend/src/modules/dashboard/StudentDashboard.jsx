import React from 'react';
import { CheckCircle, BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

// --- MODULER ---
import UpcomingAssignmentsWidget from '../assignments/components/UpcomingAssignmentsWidget';
import { AssignmentsModuleMetadata } from '../assignments/AssignmentsModule';

// Lägg till Gamification imports
import { LevelProgressWidget, BadgeShowcaseWidget, GamificationModuleMetadata } from '../gamification/GamificationModule';

const StudentDashboard = ({ currentUser, myCourses, upcomingAssignments }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { systemSettings } = useAppContext();

    // Checka vilka moduler som är på
    const showAssignmentsWidget = systemSettings?.[AssignmentsModuleMetadata.settingsKey] === 'true';
    const showGamification = systemSettings?.[GamificationModuleMetadata.settingsKey] === 'true';

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.hi_student', {name: currentUser.firstName})}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.student_subtitle')}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vänster kolumn: Kurser */}
                <div className="lg:col-span-2 space-y-8">

                    {/* GAMIFICATION SECTION (TOP) */}
                    {showGamification && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <LevelProgressWidget user={currentUser} />
                            <BadgeShowcaseWidget userBadges={currentUser.earnedBadges || []} />
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <CheckCircle size={20} className="text-indigo-600 dark:text-indigo-400"/> {t('dashboard.my_courses')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCourses.length === 0 ? (
                                <p className="text-gray-400 italic bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043]">{t('dashboard.not_registered')}</p>
                            ) : (
                                myCourses.map(course => (
                                    <div key={course.id} onClick={() => navigate(`/course/${course.id}`)} className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group overflow-hidden">
                                        <div className={`h-3 w-full ${course.color || 'bg-indigo-600'}`}></div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#282a2c] px-2 py-1 rounded">{course.courseCode}</span>
                                                {!course.isOpen && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded font-bold">{t('dashboard.closed')}</span>}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{course.description || "Ingen beskrivning"}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Höger kolumn: Widgets */}
                <div className="space-y-6">
                    {/* WIDGET 1: Kommande Inlämningar */}
                    {showAssignmentsWidget && (
                        <UpcomingAssignmentsWidget assignments={upcomingAssignments} />
                    )}

                    {/* WIDGET 2: Betyg */}
                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-gray-100 dark:border-[#3c4043] shadow-sm">
                        <h3 className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase mb-1 flex items-center gap-2">
                            <BarChart2 size={16}/> {t('dashboard.avg_grade')}
                        </h3>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">B</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t('dashboard.based_on', {count: 4})}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;