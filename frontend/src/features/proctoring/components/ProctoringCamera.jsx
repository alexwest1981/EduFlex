import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer, useLocalParticipant } from '@livekit/components-react';
import { api } from '../../../services/api';
import { Shield, Eye, AlertTriangle } from 'lucide-react';

const VideoIntegrityEnforcer = () => {
    const { localParticipant } = useLocalParticipant();

    useEffect(() => {
        const enforceIntegrity = async () => {
            const videoTrack = Array.from(localParticipant.videoTrackPublications.values())[0]?.videoTrack;
            if (videoTrack && videoTrack.processor) {
                console.log("[INTEGRITY] Disabling video processor (blur/effects) for exam.");
                await videoTrack.stopProcessor();

                // Log this as a fix/enforcement
                api.integrity.log({
                    eventType: 'VIDEO_INTEGRITY_BREACH', // Or a new type like 'ENFORCED_CLEAR_VIDEO'
                    details: 'Bakgrundsoskärpa upptäcktes och inaktiverades automatiskt.'
                }).catch(console.error);
            }
        };

        const interval = setInterval(enforceIntegrity, 5000); // Check every 5s
        enforceIntegrity();

        return () => clearInterval(interval);
    }, [localParticipant]);

    return null;
};

const ProctoringCamera = ({ quizId, studentId }) => {
    const [token, setToken] = useState(null);
    const [serverUrl, setServerUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // We need to fetch from our new endpoints
                const tokenRes = await api.get(`/integrity/token/${quizId}?userId=${studentId}`);
                const urlRes = await api.get('/integrity/server-url');
                setToken(tokenRes);
                setServerUrl(urlRes);
            } catch (err) {
                console.error("Failed to fetch proctoring token", err);
                setError("Kunde inte starta kameraövervakning.");
            }
        };
        fetchToken();
    }, [quizId, studentId]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                <AlertTriangle size={18} />
                {error}
            </div>
        );
    }

    if (!token || !serverUrl) return null;

    return (
        <div className="fixed bottom-4 right-4 w-48 h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500 z-[60] bg-slate-900 group">
            <LiveKitRoom
                video={true}
                audio={false}
                token={token}
                serverUrl={serverUrl}
                className="w-full h-full"
            >
                {/* Custom UI for proctoring preview */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Live Övervakning
                    </div>
                </div>

                <div className="absolute top-2 right-2 z-10">
                    <Shield size={14} className="text-indigo-400 drop-shadow-md" />
                </div>

                <VideoConference
                    style={{ height: '100%' }}
                    // Prevent any controls from appearing in the preview
                    controlBar={false}
                />

                {/* The "Brain" that enforces clear video */}
                <VideoIntegrityEnforcer />

                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
};

export default ProctoringCamera;
