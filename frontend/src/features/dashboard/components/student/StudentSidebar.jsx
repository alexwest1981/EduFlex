import React from 'react';
import { Clock, Calendar, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import StudentProgressWidget from './StudentProgressWidget';

const StudentSidebar = ({ upcomingAssignments, lastGraded, isModuleActive, navigate, currentUser }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4">

            {/* UPCOMING ASSIGNMENTS (Återanvänder din modul) */}


            {/* SENASTE FEEDBACK (NY!) */}
            {lastGraded && (
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                    <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-500" /> {t('dashboard.feedback.new')}
                    </h3>
                    <div className="mb-4">
                        <p className="text-xs text-[var(--text-secondary)] mb-1">{t('dashboard.feedback.course', { name: lastGraded.courseName })}</p>
                        <h4 className="font-bold text-[var(--text-primary)] text-lg">{lastGraded.assignmentTitle}</h4>
                    </div>
                    <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                        <div className="text-3xl font-black text-emerald-500">{lastGraded.grade}</div>
                        <div className="text-xs text-emerald-500/80 font-medium">
                            {lastGraded.feedback ? `"${lastGraded.feedback}"` : t('dashboard.feedback.praise')}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/course/${lastGraded.courseSlug || lastGraded.courseId}`)}
                        className="w-full mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                        {t('dashboard.feedback.details')}
                    </button>
                </div>
            )}

            {/* KURS-RESULTAT & RISK-ZON (NY WIDGET) */}
            <StudentProgressWidget currentUser={currentUser} />
        </div>
    );
};

export default StudentSidebar;
