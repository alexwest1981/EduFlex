import React, { useState, useEffect } from 'react';
import {
    Activity,
    TrendingDown,
    TrendingUp,
    AlertCircle,
    Lightbulb,
    ChevronRight,
    Users,
    Target,
    Mail,
    MessageSquare,
    X,
    Loader2,
    Calendar,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const TeacherAnalyticsDashboard = ({ courseId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lessonPlan, setLessonPlan] = useState(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleEndTime, setScheduleEndTime] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [courseId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.teacher.getCourseAnalytics(courseId);
            setData(res);
        } catch (error) {
            console.error('Failed to fetch teacher analytics:', error);
            // toast.error('Kunde inte hämta analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateLesson = async () => {
        setIsGenerating(true);
        try {
            const res = await api.teacher.generateLessonPlan(courseId);
            setLessonPlan(res);
        } catch (error) {
            console.error('Failed to generate lesson plan:', error);
            toast.error('Kunde inte generera lektionsförslag just nu.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveLesson = async () => {
        if (!scheduleDate || !scheduleTime || !scheduleEndTime || !lessonTitle) {
            toast.error("Vänligen fyll i titel, datum, starttid och sluttid.");
            return;
        }

        setIsGenerating(true);
        try {
            const startDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
            const endDateTime = new Date(`${scheduleDate}T${scheduleEndTime}:00`);

            if (endDateTime <= startDateTime) {
                toast.error("Sluttiden måste vara efter starttiden.");
                setIsGenerating(false);
                return;
            }

            await api.teacher.saveLessonPlanToCalendar(courseId, {
                title: lessonTitle,
                description: lessonPlan,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString()
            });

            toast.success("Lektion sparad i kurskalendern!");
            setIsScheduling(false);
            setLessonPlan(null);
        } catch (error) {
            console.error('Failed to save lesson plan:', error);
            toast.error('Kunde inte spara lektionen just nu.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!data) return null;

    const radarData = Object.entries(data.aggregateRadar).map(([name, value]) => ({
        subject: name,
        value: value,
        fullMark: 100
    }));

    return (
        <div className="space-y-6">
            {/* Header / Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
                            <Activity size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Klass-avg Mastery</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {Math.round(radarData.reduce((acc, curr) => acc + curr.value, 0) / radarData.length)}%
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Områden under 60%</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {data.learningGaps.length}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600">
                            <TrendingDown size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Risk-flaggade</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {data.lowPerformingStudents.length}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Aggregate Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center"
                >
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 w-full">
                        <Target size={20} className="text-indigo-500" />
                        Klassens Kunskapsprofil (Live Radar)
                    </h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Radar
                                    name="Klass-snitt"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                        {radarData.map((item) => (
                            <div key={item.subject} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                <span className="text-xs font-medium text-slate-500">{item.subject}</span>
                                <span className={`text-sm font-bold ${item.value < 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {item.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* AI Insight & Support List */}
                <div className="space-y-6">
                    {/* AI Insight Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Lightbulb size={20} className="text-amber-300" />
                                AI Mission Control: Insikt
                            </h3>
                            <p className="text-indigo-50 leading-relaxed italic">
                                "{data.aiInsight}"
                            </p>
                            <button
                                onClick={handleGenerateLesson}
                                disabled={isGenerating}
                                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Genererar AI-förslag...
                                    </>
                                ) : (
                                    <>
                                        Generera lektionsförslag baserat på insikt
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                        {/* Decorative background circle */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </motion.div>

                    {/* Low mastery list */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-rose-500" />
                            Behöver Extra Stöd (&lt; 40%)
                        </h3>
                        {data.lowPerformingStudents.length > 0 ? (
                            <div className="space-y-3">
                                {data.lowPerformingStudents.map(student => (
                                    <div key={student.userId} className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-rose-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs uppercase">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{student.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-rose-500">{student.masteryScore}% Mastery</span>
                                            <TrendingDown size={14} className="text-rose-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-500 italic text-sm">
                                Inga elever under tröskelvärdet just nu. Gott jobb!
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Lesson Plan Modal */}
            <AnimatePresence>
                {lessonPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                                    <Lightbulb className="text-amber-500" size={24} />
                                    AI Lektionsförslag
                                </h2>
                                <button
                                    onClick={() => setLessonPlan(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div
                                    className="prose prose-indigo max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-800 prose-h3:text-lg prose-h3:font-semibold prose-h3:text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: lessonPlan.replace(/```html/g, '').replace(/```/g, '') }}
                                />
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                {isScheduling ? (
                                    <div className="flex-1 flex flex-col md:flex-row items-center gap-3 w-full">
                                        <input
                                            type="text"
                                            placeholder="Ange lektionens titel"
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={lessonTitle}
                                            onChange={e => setLessonTitle(e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            className="px-3 py-2 rounded-lg border border-slate-300"
                                            value={scheduleDate}
                                            onChange={e => setScheduleDate(e.target.value)}
                                            title="Datum"
                                        />
                                        <div className="flex items-center gap-1 border border-slate-300 rounded-lg px-2 bg-white">
                                            <span className="text-slate-500 text-sm">Start:</span>
                                            <input
                                                type="time"
                                                className="py-2 bg-transparent outline-none"
                                                value={scheduleTime}
                                                onChange={e => setScheduleTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 border border-slate-300 rounded-lg px-2 bg-white">
                                            <span className="text-slate-500 text-sm">Slut:</span>
                                            <input
                                                type="time"
                                                className="py-2 bg-transparent outline-none"
                                                value={scheduleEndTime}
                                                onChange={e => setScheduleEndTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleSaveLesson}
                                                disabled={isGenerating}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                                            >
                                                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                                Spara
                                            </button>
                                            <button
                                                onClick={() => setIsScheduling(false)}
                                                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                                                title="Avbryt"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsScheduling(true);
                                                if (!lessonTitle) setLessonTitle('AI Lektion');
                                            }}
                                            className="px-6 py-2 border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-medium rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Calendar size={18} />
                                            Spara som lektion i kurskalender
                                        </button>
                                        <button
                                            onClick={() => setLessonPlan(null)}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            Stäng & Återgå
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherAnalyticsDashboard;
