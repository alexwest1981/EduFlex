import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const UngradedTable = ({ ungradedSubmissions }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (ungradedSubmissions.length === 0) {
        return (
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-12 text-center animate-in fade-in">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('teacher_tables.all_graded_title')}</h3>
                <p className="text-gray-500">{t('teacher_tables.all_graded_desc')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] overflow-hidden shadow-sm animate-in fade-in">
            <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] font-bold text-gray-700 dark:text-white flex justify-between items-center">
                <span>{t('teacher_tables.pending_submissions_count', { count: ungradedSubmissions.length })}</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">{t('teacher_tables.action_required')}</span>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 font-bold uppercase text-xs">
                    <tr><th className="p-4">{t('teacher_tables.student')}</th><th className="p-4">{t('teacher_tables.assignment')}</th><th className="p-4">{t('teacher_tables.course')}</th><th className="p-4">{t('teacher_tables.submitted')}</th><th className="p-4 text-right">{t('teacher_tables.action')}</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                    {ungradedSubmissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50">
                            <td className="p-4 font-bold text-gray-900 dark:text-white">{sub.student?.fullName}</td>
                            <td className="p-4 text-indigo-600 font-medium">{sub.assignmentTitle}</td>
                            <td className="p-4 text-gray-500">{sub.courseName}</td>
                            <td className="p-4 text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => {
                                        const tab = sub.isQuiz ? 'quiz' : 'assignments';
                                        navigate(`/course/${sub.courseSlug || sub.courseCode || sub.courseId || ''}?tab=${tab}`);
                                    }}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
                                >
                                    {t('teacher_tables.go_to_grading')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ApplicationsTable = ({ applications, onHandleApplication }) => {
    const { t } = useTranslation();
    if (applications.length === 0) {
        return (
            <div className="text-center p-10 bg-white dark:bg-[#1E1F20] rounded-xl border border-dashed border-gray-300 dark:border-[#3c4043] animate-in fade-in">
                <p className="text-gray-500">{t('teacher_tables.no_pending_applications')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] overflow-hidden shadow-sm animate-in fade-in">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 font-bold uppercase text-xs">
                    <tr><th className="p-4">{t('teacher_tables.student')}</th><th className="p-4">{t('teacher_tables.applies_to_course')}</th><th className="p-4">{t('teacher_tables.date')}</th><th className="p-4 text-right">{t('teacher_tables.decision')}</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                    {applications.map(app => (
                        <tr key={app.id}>
                            <td className="p-4 font-bold text-gray-900 dark:text-white">{app.student?.fullName || t('common.unknown')}</td>
                            <td className="p-4 text-indigo-600">{app.course?.name}</td>
                            <td className="p-4 text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                <button onClick={() => onHandleApplication(app.id, 'approve')} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200">{t('teacher_tables.approve')}</button>
                                <button onClick={() => onHandleApplication(app.id, 'reject')} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100">{t('teacher_tables.reject')}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
