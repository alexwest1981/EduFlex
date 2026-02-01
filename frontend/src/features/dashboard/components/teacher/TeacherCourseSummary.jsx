import React, { useState, useEffect } from 'react';
import {
    BookOpen, HelpCircle, FileText, CheckCircle,
    XCircle, User, Loader2, ChevronRight, BarChart
} from 'lucide-react';
import { useAppContext } from '../../../../context/AppContext';

const ItemDetailModal = ({ item, courseId, onClose }) => {
    const { API_BASE, token } = useAppContext();
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!item || !token || token === 'undefined' || token === 'null') return;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/analytics/course/${courseId}/item-details?itemId=${item.id}&type=${item.type}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDetails(data);
                }
            } catch (error) {
                console.error("Failed to fetch details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [item, courseId, API_BASE, token]);

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {item.type === 'LESSON' && <BookOpen size={20} className="text-blue-500" />}
                            {item.type === 'QUIZ' && <HelpCircle size={20} className="text-purple-500" />}
                            {item.type === 'ASSIGNMENT' && <FileText size={20} className="text-orange-500" />}
                            {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.completedCount} av {item.totalStudents} studenter klara
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-full transition-colors">
                        <XCircle size={24} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
                    ) : (
                        <div className="space-y-2">
                            {details.map((student) => (
                                <div key={student.studentId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                            ${student.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-400'}`}>
                                            {student.firstName ? student.firstName[0] : (student.name ? student.name[0] : '?')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.status === 'COMPLETED' ? 'Klar' : 'Ej klar'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {student.status === 'COMPLETED' ? (
                                            <>
                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">{student.info}</p>
                                                <p className="text-xs text-gray-400">{student.date ? new Date(student.date).toLocaleDateString() : ''}</p>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TeacherCourseSummary = ({ courseId }) => {
    const { API_BASE, token } = useAppContext();
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!token || token === 'undefined' || token === 'null') return;
            try {
                const res = await fetch(`${API_BASE}/analytics/course/${courseId}/completion-summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSummary(data);
                }
            } catch (error) {
                console.error("Failed to fetch summary", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [courseId, API_BASE, token]);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

    const sections = {
        'LESSON': summary.filter(i => i.type === 'LESSON'),
        'QUIZ': summary.filter(i => i.type === 'QUIZ'),
        'ASSIGNMENT': summary.filter(i => i.type === 'ASSIGNMENT')
    };

    const ProgressBar = ({ current, total }) => {
        const percent = total > 0 ? (current / total) * 100 : 0;
        let color = 'bg-blue-500';
        if (percent > 80) color = 'bg-green-500';
        else if (percent < 40) color = 'bg-amber-500';

        return (
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <BarChart size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kursöversikt & Progression</h2>
                    <p className="text-gray-500 dark:text-gray-400">Analysera studenternas framsteg i detalj.</p>
                </div>
            </div>

            {['QUIZ', 'ASSIGNMENT', 'LESSON'].map((type) => {
                const items = sections[type];
                if (!items || items.length === 0) return null;

                let title = "Lektioner";
                let icon = <BookOpen size={20} className="text-blue-500" />;
                if (type === 'QUIZ') { title = "Quiz & Prov"; icon = <HelpCircle size={20} className="text-purple-500" />; }
                if (type === 'ASSIGNMENT') { title = "Inlämningsuppgifter"; icon = <FileText size={20} className="text-orange-500" />; }

                return (
                    <div key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            {icon}
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="bg-white dark:bg-[#282a2c] text-left p-5 rounded-xl border border-gray-100 dark:border-[#3c4043] shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{item.title}</h4>
                                        <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Klara</span>
                                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{item.completedCount} / {item.totalStudents}</span>
                                    </div>
                                    <ProgressBar current={item.completedCount} total={item.totalStudents} />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}

            {(!sections.LESSON.length && !sections.QUIZ.length && !sections.ASSIGNMENT.length) && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-[#282a2c] rounded-2xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                    <p>Ingen spårbar aktivitet hittades i kursen än.</p>
                </div>
            )}

            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    courseId={courseId}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
};

export default TeacherCourseSummary;
