import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Ban, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';

const TeacherAtRiskWidget = ({ currentUser, settings, onSelectStudent }) => {
    // ...
    // Note: I will only replace the specific lines that need changing to avoid replacing the whole file if not needed.
    // Wait, replacing chunks is better.
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                // Fetch user insights (currently returns all students, acceptable for MVP)
                const data = await api.get('/analytics/students');
                // Filter for High Risk and take top 5
                const atRisk = data.filter(s => s.riskFactor === 'High').slice(0, 5);
                setStudents(atRisk);
            } catch (error) {
                console.error("Failed to load risk data", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.role?.name === 'TEACHER' || currentUser?.role === 'TEACHER' || currentUser?.role?.name === 'ADMIN') {
            fetchRiskData();
        }
    }, [currentUser]);

    if (!settings?.enabled) return null;
    if (loading) return <div className="animate-pulse h-48 bg-gray-100 dark:bg-[#131314] rounded-xl"></div>;

    return (
        <div className="bg-white dark:bg-[#1E1F20] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-500" />
                    {t('teacher_widgets.at_risk_title')}
                </h3>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                    {t('teacher_widgets.students_count', { count: students.length })}
                </span>
            </div>

            <div className="space-y-3">
                {students.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">
                        {t('teacher_widgets.no_at_risk')}
                    </div>
                ) : (
                    students.map(student => (
                        <div key={student.id} onClick={() => onSelectStudent && onSelectStudent(student)} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-[#282a2c] rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                                    <User size={14} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{student.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Ban size={10} /> {student.completionRate} {t('teacher_widgets.completion_prefix')}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    ))
                )}
            </div>

            {students.length > 0 && (
                <button className="w-full mt-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                    {t('teacher_widgets.view_all_risk')}
                </button>
            )}
        </div>
    );
};

export default TeacherAtRiskWidget;
