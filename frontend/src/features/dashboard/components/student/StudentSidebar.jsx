import React from 'react';
import { Clock, Calendar, CheckCircle } from 'lucide-react';

import StudentProgressWidget from './StudentProgressWidget';

const StudentSidebar = ({ upcomingAssignments, lastGraded, isModuleActive, navigate, currentUser }) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4">

            {/* UPCOMING ASSIGNMENTS (Återanvänder din modul) */}


            {/* SENASTE FEEDBACK (NY!) */}
            {lastGraded && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 dark:bg-green-900/10 rounded-bl-full -mr-4 -mt-4"></div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" /> Ny Feedback
                    </h3>
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Kurs: {lastGraded.courseName}</p>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{lastGraded.assignmentTitle}</h4>
                    </div>
                    <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800">
                        <div className="text-3xl font-black text-green-600 dark:text-green-400">{lastGraded.grade}</div>
                        <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                            {lastGraded.feedback ? `"${lastGraded.feedback}"` : "Bra jobbat!"}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/course/${lastGraded.courseId}`)}
                        className="w-full mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        Visa detaljer
                    </button>
                </div>
            )}

            {/* KURS-RESULTAT & RISK-ZON (NY WIDGET) */}
            <StudentProgressWidget currentUser={currentUser} />
        </div>
    );
};

export default StudentSidebar;
