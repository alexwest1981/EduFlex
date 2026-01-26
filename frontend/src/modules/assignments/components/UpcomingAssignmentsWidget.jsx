import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UpcomingAssignmentsWidget = ({ assignments }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden flex flex-col h-full animate-in fade-in">
            <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Bell size={20} className="text-orange-500"/> {t('dashboard.comming_assignments')}
                </h3>
                <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                    {assignments.length}
                </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#3c4043] overflow-y-auto max-h-[300px]">
                {assignments.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                        {t('dashboard.no_upcoming_assignments')}
                    </div>
                ) : (
                    assignments.map(a => (
                        <div key={a.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors group">
                            <div className="min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{a.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.courseName}</p>
                            </div>
                            <button
                                onClick={() => navigate(`/course/${a.courseId}`)}
                                className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {t('dashboard.go_to')}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingAssignmentsWidget;
