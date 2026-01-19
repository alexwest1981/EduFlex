import React, { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, Clock, Bell, ArrowRight } from 'lucide-react';
import { api } from '../../../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StudentScheduleAndDeadlinesWidget = ({ assignments = [] }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const allEvents = await api.events.getAll();
                // Filter for TODAY
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];

                const todaysLessons = allEvents.filter(event => {
                    if (!event.startTime) return false;
                    let eventDateStr = '';
                    if (Array.isArray(event.startTime)) {
                        const d = new Date(event.startTime[0], event.startTime[1] - 1, event.startTime[2]);
                        eventDateStr = d.toISOString().split('T')[0];
                    } else {
                        eventDateStr = event.startTime.split('T')[0];
                    }
                    return eventDateStr === todayStr;
                }).map(event => {
                    // Normalize time format
                    let startTimeStr = '';
                    let endTimeStr = '';

                    if (Array.isArray(event.startTime)) {
                        startTimeStr = `${String(event.startTime[3]).padStart(2, '0')}:${String(event.startTime[4]).padStart(2, '0')}`;
                    } else {
                        startTimeStr = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }

                    if (Array.isArray(event.endTime)) {
                        endTimeStr = `${String(event.endTime[3]).padStart(2, '0')}:${String(event.endTime[4]).padStart(2, '0')}`;
                    } else {
                        endTimeStr = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }

                    return {
                        id: event.id,
                        subject: event.title,
                        time: `${startTimeStr} - ${endTimeStr}`,
                        type: event.type === 'LECTURE' || event.meetingLink ? 'online' : 'campus',
                        platform: event.platform || (event.meetingLink ? 'Zoom' : null),
                        link: event.meetingLink,
                        room: event.location || 'Sal saknas'
                    };
                });

                setLessons(todaysLessons);
            } catch (error) {
                console.error("Failed to fetch calendar events", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const getPlatformIcon = (platform) => {
        if (!platform) return <MapPin size={14} />;
        return <Video size={14} />;
    };

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#3c4043]">

                {/* COLUMN 1: DAGENS LEKTIONER */}
                <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="text-indigo-500" size={20} />
                        Dagens Lektioner
                    </h3>

                    <div className="space-y-3 min-h-[150px]">
                        {isLoading ? (
                            <div className="text-center text-sm text-gray-400 py-4">Laddar schema...</div>
                        ) : lessons.length > 0 ? (
                            lessons.map((lesson) => (
                                <div key={lesson.id} className="relative pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 py-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Clock size={10} /> {lesson.time}
                                        </span>
                                        {lesson.type === 'online' ? (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${lesson.platform === 'Zoom' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                }`}>
                                                {lesson.platform || 'Online'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                Campus
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 truncate">{lesson.subject}</h4>

                                    {lesson.type === 'online' && lesson.link ? (
                                        <a href={lesson.link} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-[#282a2c] dark:hover:bg-[#3c4043] text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-colors">
                                            {getPlatformIcon(lesson.platform)} Anslut
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <MapPin size={12} /> {lesson.room}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm py-4">
                                <p>Inga lektioner idag</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/calendar')}
                        className="w-full mt-4 flex items-center justify-center gap-1 text-xs font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Se hela schemat <ArrowRight size={12} />
                    </button>
                </div>

                {/* COLUMN 2: KOMMANDE DEADLINES */}
                <div className="p-5 bg-gray-50/50 dark:bg-[#282a2c]/20">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bell className="text-orange-500" size={20} />
                        Kommande Inlämningar
                        {assignments.length > 0 && (
                            <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                                {assignments.length}
                            </span>
                        )}
                    </h3>

                    <div className="space-y-3 min-h-[150px]">
                        {assignments.length > 0 ? (
                            assignments.slice(0, 3).map(a => (
                                <div key={a.id} className="group p-3 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-100 dark:border-[#3c4043] shadow-sm hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate pr-2">{a.title}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                            {new Date(a.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{a.courseName}</p>
                                    <button
                                        onClick={() => navigate(`/course/${a.courseId}`)}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                                    >
                                        Gå till uppgift <ArrowRight size={10} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm py-4">
                                <p>Inga kommande deadlines</p>
                            </div>
                        )}
                    </div>

                    {assignments.length > 3 && (
                        <button className="w-full mt-4 text-xs font-bold text-center text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                            Visa alla ({assignments.length})
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StudentScheduleAndDeadlinesWidget;
