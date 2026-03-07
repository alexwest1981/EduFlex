import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StudentCourseGrid = ({ courses, navigate }) => {
    const { t } = useTranslation();
    return (
        <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <BookOpen className="text-indigo-500" /> {t('dashboard.my_courses')}
            </h3>

            {courses.length === 0 ? (
                <div className="text-center py-10 bg-[var(--bg-card)] rounded-xl border border-dashed border-[var(--border-main)]">
                    <BookOpen size={40} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-2" />
                    <p className="text-[var(--text-secondary)]">{t('dashboard.not_registered')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-6">
                    {courses.map(course => (
                        <div key={course.id} onClick={() => navigate(`/course/${course.slug || course.id}`)} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-main)] shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${course.isOpen ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {course.courseCode || t('admin.table.course')}
                                    </div>
                                    <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h4 className="font-bold text-lg text-[var(--text-primary)] mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">{course.name}</h4>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{course.description}</p>
                            </div>

                            <div className="space-y-3">
                                {/* Fake Progress för visuellt djup (kan kopplas till riktig data sen) */}
                                <div className="w-full bg-[var(--bg-input)] h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[15%]"></div>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-main)]">
                                    <div className="w-6 h-6 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                                        {course.teacher?.firstName?.charAt(0) || 'L'}
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)] font-medium">{course.teacher?.fullName || t('common.unknown')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCourseGrid;
