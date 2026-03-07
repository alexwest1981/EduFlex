import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { Loader2, AlertTriangle, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StudentProgressWidget = ({ currentUser }) => {
    const { t } = useTranslation();
    const [progress, setProgress] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            loadProgress();
        }
    }, [currentUser]);

    const loadProgress = async () => {
        try {
            const data = await api.analytics.getStudentProgress(currentUser.id);
            setProgress(data || []);
        } catch (e) {
            console.error("Failed to load progress", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-6 text-center text-[var(--text-secondary)]"><Loader2 className="animate-spin mx-auto" /></div>;
    if (progress.length === 0) return null;

    return (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] shadow-sm p-6">
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mb-4">
                {t('widgets.student_progress.title')}
            </h3>
            <div className="space-y-3">
                {progress.map(p => (
                    <div
                        key={p.courseId}
                        onClick={() => setSelectedCourse(p)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${p.isAtRisk ? 'border-rose-500/20 bg-rose-500/10' : 'border-[var(--border-main)]'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{p.courseName}</span>
                            {p.estimatedGrade !== 'N/A' && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.isAtRisk ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                    {p.estimatedGrade}
                                </span>
                            )}
                        </div>
                        {p.isAtRisk ? (
                            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                                <AlertTriangle size={12} /> {p.riskReason}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                <CheckCircle size={12} /> {t('widgets.student_progress.on_track')}
                            </div>
                        )}
                        <div className="mt-2 text-[10px] text-[var(--text-secondary)] flex gap-3">
                            <span>{t('widgets.student_progress.assignments')}: {p.completedAssignments}/{p.totalAssignments}</span>
                            <span>{t('widgets.student_progress.quizzes')}: {p.completedQuizzes}/{p.totalQuizzes}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FÖR DETALJER */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-2xl border border-[var(--border-main)] shadow-2xl p-6 relative">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedCourse(null); }} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{selectedCourse.courseName}</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">{t('widgets.student_progress.detailed_overview')}</p>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* SENASTE RESULTAT */}
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">{t('widgets.student_progress.latest_results')}</h4>
                                {selectedCourse.recentResults && selectedCourse.recentResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedCourse.recentResults.slice(0, 10).map((res, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 rounded bg-[var(--bg-input)]">
                                                <div>
                                                    <span className="text-xs font-bold text-[var(--text-primary)] block">{res.title}</span>
                                                    <span className="text-[10px] text-[var(--text-secondary)]">{res.type}</span>
                                                </div>
                                                <span className="font-bold text-indigo-400">{res.scoreOrGrade}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-secondary)] italic font-normal">{t('widgets.student_progress.no_results')}</p>
                                )}
                            </div>

                            {/* STATUS ALERT */}
                            {selectedCourse.isAtRisk && (
                                <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                                    <h4 className="flex items-center gap-2 text-rose-500 font-bold text-sm mb-1">
                                        <AlertTriangle size={16} /> {t('widgets.student_progress.at_risk')}
                                    </h4>
                                    <p className="text-xs text-rose-400">{selectedCourse.riskReason}. {t('widgets.student_progress.catch_up')}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate(`/course/${selectedCourse.courseSlug || selectedCourse.courseId}`)}
                            className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            {t('widgets.student_progress.go_to_course')} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgressWidget;
