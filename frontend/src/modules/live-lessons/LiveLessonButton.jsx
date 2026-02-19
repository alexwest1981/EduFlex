import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Loader2, Plus, Wifi } from 'lucide-react';
import { api } from '../../services/api';
import LiveMeeting from './LiveMeeting';

const LiveLessonButton = ({ courseId, courseName, currentUser, isTeacher }) => {
    const [activeLesson, setActiveLesson] = useState(null);
    const [upcomingLessons, setUpcomingLessons] = useState([]);
    const [showMeeting, setShowMeeting] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [joinConfig, setJoinConfig] = useState(null);

    const [scheduleForm, setScheduleForm] = useState({
        title: '',
        description: '',
        scheduledStart: '',
        scheduledEnd: ''
    });

    useEffect(() => {
        loadLessons();
    }, [courseId]);

    const loadLessons = async () => {
        try {
            const lessons = await api.get(`/live-lessons/course/${courseId}`) || [];
            const live = lessons.find(l => l.status === 'LIVE');
            setActiveLesson(live || null);
            const upcoming = lessons.filter(l =>
                l.status === 'SCHEDULED' &&
                new Date(l.scheduledStart) > new Date()
            ).slice(0, 3);
            setUpcomingLessons(upcoming);
        } catch (err) {
            console.error('Failed to load live lessons:', err);
        }
    };

    const handleStartInstant = async () => {
        setLoading(true);
        try {
            const lesson = await api.post('/live-lessons', {
                courseId: courseId,
                title: `Live-lektion: ${courseName || 'Kurs'}`
            });
            handleJoinLesson(lesson);
        } catch (err) {
            console.error('Failed to start lesson:', err);
            alert('Kunde inte starta lektionen');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleLesson = async () => {
        if (!scheduleForm.title || !scheduleForm.scheduledStart) {
            alert('Fyll i titel och starttid');
            return;
        }
        setLoading(true);
        try {
            await api.post('/live-lessons', {
                courseId: courseId,
                title: scheduleForm.title,
                description: scheduleForm.description,
                scheduledStart: scheduleForm.scheduledStart,
                scheduledEnd: scheduleForm.scheduledEnd || null
            });
            setShowScheduleModal(false);
            setScheduleForm({ title: '', description: '', scheduledStart: '', scheduledEnd: '' });
            loadLessons();
        } catch (err) {
            console.error('Failed to schedule lesson:', err);
            alert('Kunde inte schemalägga lektionen');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinLesson = async (lesson) => {
        setLoading(true);
        try {
            if (isTeacher && lesson.status === 'SCHEDULED') {
                await api.post(`/live-lessons/${lesson.id}/start`);
            }
            const config = await api.get(`/live-lessons/${lesson.id}/join`);
            setJoinConfig(config);
            setActiveLesson({ ...lesson, ...config });
            setShowMeeting(true);
        } catch (err) {
            console.error('Failed to join lesson:', err);
            alert('Kunde inte ansluta till lektionen');
        } finally {
            setLoading(false);
        }
    };

    const handleEndLesson = async () => {
        if (activeLesson && isTeacher) {
            try {
                await api.post(`/live-lessons/${activeLesson.id}/end`);
            } catch (err) {
                console.error('Failed to end lesson:', err);
            }
        }
        setShowMeeting(false);
        setActiveLesson(null);
        setJoinConfig(null);
        loadLessons();
    };

    if (showMeeting && joinConfig) {
        return (
            <LiveMeeting
                lessonId={joinConfig.id}
                token={joinConfig.token}
                serverUrl={joinConfig.serverUrl}
                onLeave={handleEndLesson}
            />
        );
    }

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
                {activeLesson ? (
                    <button
                        onClick={() => handleJoinLesson(activeLesson)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all animate-pulse"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Wifi size={18} />}
                        <span>Gå med Live</span>
                    </button>
                ) : isTeacher ? (
                    <button
                        onClick={handleStartInstant}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
                        <span>Starta Live</span>
                    </button>
                ) : null}

                {isTeacher && (
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                        title="Schemalägg lektion"
                    >
                        <Calendar size={18} />
                    </button>
                )}
            </div>

            {upcomingLessons.length > 0 && !activeLesson && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                    <Clock size={12} />
                    <span>
                        Nästa: {upcomingLessons[0].title} ({new Date(upcomingLessons[0].scheduledStart).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                    {!isTeacher && (
                        <button
                            onClick={() => handleJoinLesson(upcomingLessons[0])}
                            className="text-indigo-600 font-bold ml-1 hover:underline"
                        >
                            Gå med
                        </button>
                    )}
                </div>
            )}

            {showScheduleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-[#3c4043]">
                        <div className="p-6 border-b border-gray-200 dark:border-[#3c4043]">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="text-indigo-500" size={24} />
                                Schemalägg Live-lektion
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <input
                                type="text"
                                value={scheduleForm.title}
                                onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                                placeholder="Titel *"
                                className="w-full p-3 border border-gray-200 dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="datetime-local"
                                    value={scheduleForm.scheduledStart}
                                    onChange={e => setScheduleForm({ ...scheduleForm, scheduledStart: e.target.value })}
                                    className="w-full p-3 border border-gray-200 dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                                />
                                <input
                                    type="datetime-local"
                                    value={scheduleForm.scheduledEnd}
                                    onChange={e => setScheduleForm({ ...scheduleForm, scheduledEnd: e.target.value })}
                                    className="w-full p-3 border border-gray-200 dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-[#3c4043] flex justify-end gap-3">
                            <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-gray-500">Avbryt</button>
                            <button onClick={handleScheduleLesson} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl">Schemalägg</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveLessonButton;
