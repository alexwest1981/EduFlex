import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { Loader2, AlertTriangle, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProgressWidget = ({ currentUser }) => {
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

    if (isLoading) return <div className="p-6 text-center text-gray-400"><Loader2 className="animate-spin mx-auto" /></div>;
    if (progress.length === 0) return null;

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-4">
                Mina Kursresultat
            </h3>
            <div className="space-y-3">
                {progress.map(p => (
                    <div
                        key={p.courseId}
                        onClick={() => setSelectedCourse(p)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#282a2c] ${p.isAtRisk ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-[#3c4043]'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{p.courseName}</span>
                            {p.estimatedGrade !== 'N/A' && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.isAtRisk ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-700'}`}>
                                    {p.estimatedGrade}
                                </span>
                            )}
                        </div>
                        {p.isAtRisk ? (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                                <AlertTriangle size={12} /> {p.riskReason}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle size={12} /> Ligger bra till
                            </div>
                        )}
                        <div className="mt-2 text-[10px] text-gray-400 flex gap-3">
                            <span>Uppgifter: {p.completedAssignments}/{p.totalAssignments}</span>
                            <span>Quiz: {p.completedQuizzes}/{p.totalQuizzes}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FÖR DETALJER */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedCourse(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedCourse.courseName}</h2>
                        <p className="text-sm text-gray-500 mb-6">Detaljerad översikt</p>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                            {/* SENASTE RESULTAT */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senaste Resultat</h4>
                                {selectedCourse.recentResults && selectedCourse.recentResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedCourse.recentResults.slice(0, 10).map((res, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-[#282a2c]">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">{res.title}</span>
                                                    <span className="text-[10px] text-gray-500">{res.type}</span>
                                                </div>
                                                <span className="font-bold text-indigo-600">{res.scoreOrGrade}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Inga resultat än.</p>
                                )}
                            </div>

                            {/* STATUS ALERT */}
                            {selectedCourse.isAtRisk && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900">
                                    <h4 className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm mb-1">
                                        <AlertTriangle size={16} /> Varning
                                    </h4>
                                    <p className="text-xs text-red-600 dark:text-red-400">{selectedCourse.riskReason}. Se till att komma ikapp!</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate(`/course/${selectedCourse.courseSlug || selectedCourse.courseId}`)}
                            className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            Gå till kursen <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgressWidget;
