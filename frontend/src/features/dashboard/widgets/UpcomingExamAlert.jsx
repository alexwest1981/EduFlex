import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';
import { AlertCircle, Calendar, Clock, Lock, ArrowRight } from 'lucide-react';

const UpcomingExamAlert = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
        const interval = setInterval(fetchExams, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchExams = async () => {
        try {
            const data = await api.quiz.getUpcoming();
            setExams(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch upcoming exams:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (exams.length === 0) return null;

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('sv-SE', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-100 dark:border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Kommande Tentamina</h3>
                </div>
                <span className="text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    {exams.length} {exams.length === 1 ? 'aktuell' : 'aktuella'}
                </span>
            </div>

            <div className="p-2">
                {exams.map((exam) => (
                    <div
                        key={exam.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white leading-tight">{exam.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatDate(exam.startTime)} | {exam.courseName}
                                </p>
                            </div>
                        </div>

                        <div>
                            {exam.isActive ? (
                                <button
                                    onClick={() => navigate(`/quiz/${exam.quizId}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Starta Tenta
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm cursor-not-allowed border border-gray-200 dark:border-gray-700">
                                    <Lock className="w-4 h-4" />
                                    Låst
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingExamAlert;
