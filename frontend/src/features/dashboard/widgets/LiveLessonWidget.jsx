import React, { useState, useEffect } from 'react';
import { Video, Users, Clock, Play, Calendar, ExternalLink, Loader2, Wifi, WifiOff } from 'lucide-react';
import { api } from '../../../services/api';

/**
 * LiveLessonWidget - Shows upcoming and live video lessons on the dashboard
 * Displays countdown for scheduled lessons and "Join Now" for active ones
 */
const LiveLessonWidget = ({ currentUser }) => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joiningId, setJoiningId] = useState(null);

    useEffect(() => {
        loadLessons();
        // Refresh every 30 seconds to update countdowns
        const interval = setInterval(loadLessons, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadLessons = async () => {
        try {
            const lessons = await api.get('/live-lessons/upcoming');
            setLessons(lessons || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load live lessons:', err);
            setError('Kunde inte ladda lektioner');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (lesson) => {
        setJoiningId(lesson.id);
        try {
            const joinData = await api.get(`/live-lessons/${lesson.id}/join`);
            const { joinUrl, jitsiConfig } = joinData;

            // Open Jitsi in a new window or modal
            // For now, open in new tab with config
            const jitsiUrl = buildJitsiUrl(joinUrl, jitsiConfig);
            window.open(jitsiUrl, '_blank', 'width=1200,height=800');

        } catch (err) {
            console.error('Failed to join lesson:', err);
            alert('Kunde inte ansluta till lektionen');
        } finally {
            setJoiningId(null);
        }
    };

    const buildJitsiUrl = (baseUrl, config) => {
        const params = new URLSearchParams();
        if (config.displayName) params.set('userInfo.displayName', config.displayName);
        if (config.email) params.set('userInfo.email', config.email);

        // Jitsi config options
        const configStr = [
            'config.prejoinPageEnabled=false',
            `config.startWithAudioMuted=${config.startWithAudioMuted}`,
            `config.startWithVideoMuted=${config.startWithVideoMuted}`,
            'config.disableDeepLinking=true'
        ].join('&');

        return `${baseUrl}#${configStr}&${params.toString()}`;
    };

    const getStatusBadge = (lesson) => {
        if (lesson.status === 'LIVE') {
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    <Wifi size={10} /> LIVE
                </span>
            );
        }
        if (lesson.minutesUntilStart <= 5) {
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                    <Clock size={10} /> Snart
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-bold rounded-full">
                <Calendar size={10} /> {lesson.startsIn}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-6">
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
            </div>
        );
    }

    // Don't show widget if no upcoming lessons
    if (lessons.length === 0 && !error) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Video className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Live-lektioner</h3>
                            <p className="text-xs text-white/70">Kommande videomöten</p>
                        </div>
                    </div>
                    {lessons.some(l => l.status === 'LIVE') && (
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                </div>
            </div>

            {/* Lessons List */}
            <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                {error && (
                    <div className="p-4 text-center text-red-500 text-sm">
                        <WifiOff size={20} className="mx-auto mb-2 opacity-50" />
                        {error}
                    </div>
                )}

                {lessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors ${
                            lesson.status === 'LIVE' ? 'bg-red-50 dark:bg-red-900/10' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getStatusBadge(lesson)}
                                    {lesson.isHost && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#3c4043] text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                            Värd
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                    {lesson.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {lesson.courseName}
                                </p>
                                {!lesson.isHost && lesson.hostName && (
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Users size={12} /> {lesson.hostName}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => handleJoin(lesson)}
                                disabled={joiningId === lesson.id}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    lesson.status === 'LIVE'
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                                        : lesson.minutesUntilStart <= 15
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        : 'bg-gray-100 dark:bg-[#3c4043] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#4c4043]'
                                } disabled:opacity-50`}
                            >
                                {joiningId === lesson.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : lesson.status === 'LIVE' ? (
                                    <>
                                        <Play size={16} fill="currentColor" /> Gå med
                                    </>
                                ) : lesson.minutesUntilStart <= 15 ? (
                                    <>
                                        <Video size={16} /> Förbered
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={16} /> Visa
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Time info for scheduled lessons */}
                        {lesson.status !== 'LIVE' && lesson.scheduledStart && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#3c4043] flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(lesson.scheduledStart).toLocaleTimeString('sv-SE', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                <span>
                                    {new Date(lesson.scheduledStart).toLocaleDateString('sv-SE', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer link */}
            {lessons.length > 0 && (
                <div className="p-3 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314]">
                    <a
                        href="/calendar"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
                    >
                        Se alla i kalendern <ExternalLink size={12} />
                    </a>
                </div>
            )}
        </div>
    );
};

export default LiveLessonWidget;
