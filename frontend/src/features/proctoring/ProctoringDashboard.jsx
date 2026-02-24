import React, { useState, useEffect, useRef } from 'react';
import { LiveKitRoom, VideoTrack, useParticipants, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { Shield, Eye, AlertCircle, Users, Layout, Activity, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const ParticipantVideo = ({ participant }) => {
    const tracks = useTracks([{ source: Track.Source.Camera, participant }]);
    const track = tracks[0];

    return (
        <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg group">
            {track ? (
                <VideoTrack
                    trackRef={track}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                    <Video size={32} className="opacity-20" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Ingen video</span>
                </div>
            )}

            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent z-10">
                <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-bold truncate">
                        {participant.name || participant.identity}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] text-emerald-400 font-bold">LIVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Custom VideoTrack wrapper is no longer needed since we import it, 
// but if we want custom behavior we can keep it. 
// Replacing it with the library one in the render above.

const ProctoringDashboard = ({ quizId, quizTitle }) => {
    const { API_BASE, token, currentUser } = useAppContext();
    const [lkToken, setLkToken] = useState(null);
    const [serverUrl, setServerUrl] = useState(null);
    const [events, setEvents] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    const stompClientRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                const tk = await api.get(`/integrity/token/${quizId}?userId=${currentUser.id}`);
                const url = await api.get('/integrity/server-url');
                setLkToken(tk);
                setServerUrl(url);

                // Fetch initial events
                const initialEvents = await api.integrity.getByQuiz(quizId);
                setEvents(initialEvents);

                connectWebSocket();
            } catch (err) {
                console.error("Dashboard init error", err);
            }
        };
        init();

        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, [quizId]);

    const connectWebSocket = () => {
        const baseUrl = API_BASE.replace(/\/api\/?$/, '');
        const wsUrl = `${baseUrl}/ws-forum`; // Reusing established WS endpoint
        const client = Stomp.over(() => new SockJS(wsUrl));

        client.connectHeaders = { 'Authorization': `Bearer ${token}` };
        client.onConnect = () => {
            client.subscribe(`/topic/proctoring/${quizId}`, (message) => {
                const event = JSON.parse(message.body);
                setEvents(prev => [event, ...prev]);

                if (event.eventType !== 'PROCTORING_STARTED') {
                    toast.error(`Integritetslarm: ${event.studentName} - ${event.eventType}`, {
                        icon: '⚠️',
                        duration: 5000
                    });
                }
            });
        };
        client.activate();
        stompClientRef.current = client;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="text-indigo-600" />
                        {quizTitle || 'Exam Integrity Pro'}
                    </h2>
                    <p className="text-sm text-slate-500">Övervakar {quizTitle} i realtid</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                    >
                        <Layout size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                    >
                        <Activity size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Video Grid Section */}
                <div className="lg:col-span-3 space-y-4">
                    {lkToken && serverUrl ? (
                        <LiveKitRoom
                            token={lkToken}
                            serverUrl={serverUrl}
                            connect={true}
                            className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 min-h-[600px] border border-slate-100 dark:border-slate-800"
                        >
                            <VideoGrid />
                        </LiveKitRoom>
                    ) : (
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl flex items-center justify-center">
                            <span className="text-slate-400 font-bold">Ansluter till LiveKit...</span>
                        </div>
                    )}
                </div>

                {/* Event Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col h-full max-h-[600px]">
                        <div className="p-4 border-bottom border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                Integritetslogg
                            </h3>
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                                {events.length} händelser
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {events.map((event, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{event.studentName}</span>
                                        <span className="text-[9px] text-slate-400">
                                            {new Date(event.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-red-600 font-bold uppercase mb-1">{event.eventType}</div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">{event.details}</p>
                                </div>
                            ))}

                            {events.length === 0 && (
                                <div className="text-center py-20 text-slate-400">
                                    <Activity size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Inga incidenter registrerade</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoGrid = () => {
    const { currentUser } = useAppContext();
    const participants = useParticipants();
    // Filter out teacher (local participant) from the grid
    const students = participants.filter(p => p.identity !== currentUser?.id?.toString());

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {students.map(p => (
                <ParticipantVideo key={p.sid} participant={p} />
            ))}

            {students.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-40 text-slate-400">
                    <Users size={48} className="mb-4 opacity-10" />
                    <p className="font-medium">Väntar på att studenter ska ansluta...</p>
                </div>
            )}
        </div>
    );
};

export default ProctoringDashboard;
