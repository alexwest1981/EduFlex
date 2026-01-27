import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckCircle2, XCircle, Clock, MessageSquare, HelpCircle, FileText, ChevronRight, AlertCircle, Award } from 'lucide-react';
import { api } from '../../services/api';

const FeedbackModal = ({ assignment, onClose }) => {
    if (!assignment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in transition-all">
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <MessageSquare size={20} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Lärarens Feedback</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#282a2c] transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="p-8">
                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Uppgift</p>
                        <p className="text-lg font-bold dark:text-white">{assignment.title}</p>
                    </div>
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-6 border border-indigo-100/50 dark:border-indigo-800/20">
                        <p className="text-sm dark:text-gray-300 leading-relaxed italic">
                            "{assignment.feedback || 'Ingen skriftlig feedback lämnad än, men ditt betyg är registrerat.'}"
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#131314] flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};

const SummaryModule = ({ courseId, currentUser }) => {
    const [quizResults, setQuizResults] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState({ completedQuizzes: 0, completedAssignments: 0, pendingGrades: 0 });
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSummaryData();
    }, [courseId]);

    const loadSummaryData = async () => {
        setIsLoading(true);
        try {
            // Fetch everything we need in parallel. 
            // We use the new endpoints that return lists for the specific student in this course.
            const [quizzesList, assignmentsList, submissionsList, quizResultsList] = await Promise.all([
                api.quiz.getByCourse(courseId),
                api.get(`/courses/${courseId}/assignments`),
                api.get(`/submissions/student/${currentUser.id}/course/${courseId}`),
                api.get(`/quizzes/results/student/${currentUser.id}/course/${courseId}`)
            ]);

            // Process Quiz Results: Match each quiz with its result (if any)
            const processedQuizzes = quizzesList.map(q => {
                // Find result for this specific quiz
                const res = quizResultsList.find(r => r.quiz && (r.quiz.id === q.id || r.quiz === q.id));
                return { ...q, result: res || null };
            });
            setQuizResults(processedQuizzes);

            // Process Assignments: Match each assignment with its submission
            const processedAssignments = assignmentsList.map(a => {
                const sub = submissionsList.find(s => s.assignment && (s.assignment.id === a.id || s.assignment === a.id));
                return {
                    ...a,
                    status: sub ? (sub.grade ? 'GRADED' : 'SUBMITTED') : 'PENDING',
                    grade: sub?.grade || null,
                    feedback: sub?.feedback || null,
                    submittedAt: sub?.submittedAt || null
                };
            });
            setAssignments(processedAssignments);

            // Calculate stats
            setStats({
                completedQuizzes: processedQuizzes.filter(r => r.result).length,
                totalQuizzes: processedQuizzes.length,
                completedAssignments: processedAssignments.filter(a => a.status !== 'PENDING').length,
                totalAssignments: processedAssignments.length,
                pendingGrades: processedAssignments.filter(a => a.status === 'SUBMITTED').length
            });

        } catch (e) {
            console.error("Failed to load summary", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-gray-400">Laddar sammanställning...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-[#1E1F20] rounded-xl text-indigo-600 shadow-sm"><Award size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Quiz Genomförda</p>
                        <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200">{stats.completedQuizzes} / {stats.totalQuizzes}</p>
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-[#1E1F20] rounded-xl text-emerald-600 shadow-sm"><CheckCircle2 size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Inlämnade Uppgifter</p>
                        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{stats.completedAssignments} / {stats.totalAssignments}</p>
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30 flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-[#1E1F20] rounded-xl text-amber-600 shadow-sm"><Clock size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Väntar på rättning</p>
                        <p className="text-2xl font-black text-amber-900 dark:text-amber-200">{stats.pendingGrades} st</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* QUIZ SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <HelpCircle size={20} className="text-purple-600" />
                        <h3 className="text-lg font-bold dark:text-white">Dina Quiz-resultat</h3>
                    </div>
                    <div className="bg-white dark:bg-[#131314] rounded-2xl border border-gray-100 dark:border-[#3c4043] overflow-hidden shadow-sm">
                        {quizResults.length === 0 ? (
                            <p className="p-8 text-center text-gray-400 text-sm">Inga quiz tillgängliga i denna kurs.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {quizResults.map(q => (
                                    <div key={q.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1E1F20] transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm dark:text-white">{q.title}</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">{q.questions?.length || 0} frågor</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {q.result ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-green-600">{q.result.score} / {q.result.maxScore}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(q.result.date || q.result.submittedAt).toLocaleDateString()}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">Ej påbörjad</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ASSIGNMENT SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold dark:text-white">Inlämningsstatus</h3>
                    </div>
                    <div className="bg-white dark:bg-[#131314] rounded-2xl border border-gray-100 dark:border-[#3c4043] overflow-hidden shadow-sm">
                        {assignments.length === 0 ? (
                            <p className="p-8 text-center text-gray-400 text-sm">Inga inlämningar registrerade.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {assignments.map(a => (
                                    <div
                                        key={a.id}
                                        onClick={() => a.status === 'GRADED' && setSelectedFeedback(a)}
                                        className={`p-4 flex items-center justify-between transition-all ${a.status === 'GRADED' ? 'cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10' : ''}`}
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div className={`p-2 rounded-lg ${a.status === 'GRADED' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 dark:bg-[#1E1F20]'}`}>
                                                {a.status === 'GRADED' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm dark:text-white">{a.title}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Deadline: {a.dueDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {a.status === 'GRADED' ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{a.grade}</p>
                                                        <p className="text-[9px] text-gray-400 uppercase font-bold flex items-center gap-1 justify-end">
                                                            Feedback <ChevronRight size={10} />
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : a.status === 'SUBMITTED' ? (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-900/40">Inlämnad</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full border border-rose-100 dark:border-rose-900/40">Ej inskickad</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {assignments.some(a => a.grade) && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-2 mx-1">
                            <AlertCircle size={12} /> Klicka på en rättad uppgift för att läsa lärarens kommentarer.
                        </p>
                    )}
                </div>
            </div>

            {selectedFeedback && (
                <FeedbackModal
                    assignment={selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                />
            )}
        </div>
    );
};

export default SummaryModule;
