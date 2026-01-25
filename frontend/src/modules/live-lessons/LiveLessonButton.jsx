import React, { useState, useEffect } from 'react';
import { Video, Play, Calendar, Clock, Users, Loader2, Plus, Wifi } from 'lucide-react';
import { api } from '../../services/api';
import JitsiMeeting from './JitsiMeeting';

/**
 * LiveLessonButton - Button to start or join a live lesson
 * For use in course views and material pages
 *
 * Props:
 * - courseId: The course ID
 * - currentUser: Current logged in user
 * - isTeacher: Whether user is teacher of this course
 */
const LiveLessonButton = ({ courseId, currentUser, isTeacher }) => {
    const [activeLesson, setActiveLesson] = useState(null);
    const [upcomingLessons, setUpcomingLessons] = useState([]);
    const [showMeeting, setShowMeeting] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [joinConfig, setJoinConfig] = useState(null);

    // Form state for scheduling
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

            // Find active (LIVE) lesson
            const live = lessons.find(l => l.status === 'LIVE');
            setActiveLesson(live || null);

            // Find upcoming scheduled lessons
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
                title: `Live-lektion`
            });

            // Get join config
            const joinConfig = await api.get(`/live-lessons/${lesson.id}/join`);
            setJoinConfig(joinConfig);
            setActiveLesson({ ...lesson, ...joinConfig });
            setShowMeeting(true);

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
            // If teacher and lesson is scheduled, start it first
            if (isTeacher && lesson.status === 'SCHEDULED') {
                await api.post(`/live-lessons/${lesson.id}/start`);
            }

            const joinConfig = await api.get(`/live-lessons/${lesson.id}/join`);
            setJoinConfig(joinConfig);
            setActiveLesson({ ...lesson, ...joinConfig });
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

    // If there's an active live lesson, show join button
    if (activeLesson && !showMeeting) {
        return (
            <>
                <button
                    onClick={() => handleJoinLesson(activeLesson)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all animate-pulse"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            <Wifi size={18} />
                            <span>LIVE - Gå med nu</span>
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </>
                    )}
                </button>

                {showMeeting && joinConfig && (
                    <JitsiMeeting
                        roomName={joinConfig.roomName}
                        displayName={currentUser?.firstName + ' ' + currentUser?.lastName}
                        email={currentUser?.email}
                        isHost={joinConfig.isHost}
                        onClose={handleEndLesson}
                    />
                )}
            </>
        );
    }

    // Teacher view - can start or schedule lessons
    if (isTeacher) {
        return (
            <>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleStartInstant}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Video size={18} />
                                <span>Starta Live</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                        title="Schemalägg lektion"
                    >
                        <Calendar size={18} />
                    </button>
                </div>

                {/* Upcoming lessons indicator */}
                {upcomingLessons.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                        <Clock size={12} />
                        <span>
                            Nästa: {upcomingLessons[0].title} ({new Date(upcomingLessons[0].scheduledStart).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })})
                        </span>
                    </div>
                )}

                {/* Schedule Modal */}
                {showScheduleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-[#3c4043]">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="text-indigo-500" size={24} />
                                    Schemalägg Live-lektion
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                        Titel *
                                    </label>
                                    <input
                                        type="text"
                                        value={scheduleForm.title}
                                        onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                                        placeholder="T.ex. Genomgång Kapitel 5"
                                        className="w-full p-3 border border-gray-200 dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                        Beskrivning
                                    </label>
                                    <textarea
                                        value={scheduleForm.description}
                                        onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                                        placeholder="Valfri beskrivning..."
                                        rows={2}
                                        className="w-full p-3 border border-gray-200 dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                            Starttid *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduleForm.scheduledStart}
                                            onChange={e => setScheduleForm({ ...scheduleForm, scheduledStart: e.target.value })}
                                            className="w-full p-3 border border-gray-200 dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                            Sluttid
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduleForm.scheduledEnd}
                                            onChange={e => setScheduleForm({ ...scheduleForm, scheduledEnd: e.target.value })}
                                            className="w-full p-3 border border-gray-200 dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-[#3c4043] flex justify-end gap-3">
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-xl transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleScheduleLesson}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Schemalägg
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showMeeting && joinConfig && (
                    <JitsiMeeting
                        roomName={joinConfig.roomName}
                        displayName={currentUser?.firstName + ' ' + currentUser?.lastName}
                        email={currentUser?.email}
                        isHost={joinConfig.isHost}
                        onClose={handleEndLesson}
                    />
                )}
            </>
        );
    }

    // Student view - show upcoming lessons or nothing
    if (upcomingLessons.length > 0) {
        const nextLesson = upcomingLessons[0];
        const startsIn = Math.round((new Date(nextLesson.scheduledStart) - new Date()) / 60000);

        // Only show button if lesson starts within 30 minutes
        if (startsIn <= 30) {
            return (
                <button
                    onClick={() => handleJoinLesson(nextLesson)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            <Video size={18} />
                            <span>Lektion om {startsIn} min</span>
                        </>
                    )}
                </button>
            );
        }
    }

    return null;
};

export default LiveLessonButton;
