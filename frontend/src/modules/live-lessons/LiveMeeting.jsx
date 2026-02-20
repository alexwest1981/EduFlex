import React, { useState, useEffect } from 'react';
import {
    LiveKitRoom,
    VideoConference,
    GridLayout,
    ParticipantTile,
    RoomAudioRenderer,
    ControlBar,
    useTracks,
    Chat,
    useParticipants,
    useLocalParticipant,
    useConnectionState
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import '@livekit/components-styles';
import { X, Users, MessageSquare, Settings, Share2, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, User, Sparkles } from 'lucide-react';

const MyParticipantList = () => {
    const participants = useParticipants();
    return (
        <div className="p-4 space-y-2">
            {participants.map((p) => (
                <div key={p.sid} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <User size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-medium">{p.identity}</span>
                            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{p.isLocal ? 'Du' : 'Deltagare'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {p.isMicrophoneEnabled ? <Mic size={14} className="text-emerald-500" /> : <MicOff size={14} className="text-white/20" />}
                        {p.isCameraEnabled ? <VideoIcon size={14} className="text-emerald-500" /> : <VideoOff size={14} className="text-white/20" />}
                    </div>
                </div>
            ))}
        </div>
    );
};

const MeetingUI = ({ activePanel, setActivePanel, onLeave, isBlurActive, setIsBlurActive, isProcessing, setIsProcessing }) => {
    const { localParticipant } = useLocalParticipant();
    const connectionState = useConnectionState();

    const getStatusColor = () => {
        switch (connectionState) {
            case ConnectionState.Connected: return 'bg-emerald-500';
            case ConnectionState.Connecting: return 'bg-amber-500 animate-pulse';
            case ConnectionState.Reconnecting: return 'bg-orange-500 animate-pulse';
            case ConnectionState.Disconnected: return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    const toggleBlur = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const videoTrack = Array.from(localParticipant.videoTrackPublications.values())[0]?.videoTrack;
            if (!videoTrack) {
                console.warn("No video track found for background blur");
                return;
            }

            if (isBlurActive) {
                await videoTrack.stopProcessor();
                setIsBlurActive(false);
            } else {
                const { BackgroundBlur, supportsBackgroundProcessors } = await import('@livekit/track-processors');
                if (!supportsBackgroundProcessors()) {
                    alert("Denna webbläsare stöder inte suddig bakgrund.");
                    return;
                }
                const blur = BackgroundBlur(15);
                await videoTrack.setProcessor(blur);
                setIsBlurActive(true);
            }
        } catch (err) {
            console.error("Failed to toggle blur:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden font-sans">
            {/* Premium Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <VideoIcon size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-semibold text-lg leading-tight">Live Lesson</h1>
                        <p className="text-white/40 text-xs flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`}></span>
                            {connectionState === ConnectionState.Connected ? 'Ansluten' :
                                connectionState === ConnectionState.Connecting ? 'Ansluter media...' :
                                    connectionState === ConnectionState.Reconnecting ? 'Återansluter...' : 'Frånkopplad'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActivePanel(prev => prev === 'participants' ? null : 'participants')}
                        className={`p-2.5 rounded-xl transition-all ${activePanel === 'participants' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5 text-white/70'}`}
                    >
                        <Users size={20} />
                    </button>
                    <button
                        onClick={() => setActivePanel(prev => prev === 'chat' ? null : 'chat')}
                        className={`p-2.5 rounded-xl transition-all ${activePanel === 'chat' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5 text-white/70'}`}
                    >
                        <MessageSquare size={20} />
                    </button>
                    <button
                        onClick={() => setActivePanel(prev => prev === 'settings' ? null : 'settings')}
                        className={`p-2.5 rounded-xl transition-all ${activePanel === 'settings' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5 text-white/70'}`}
                    >
                        <Settings size={20} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <button
                        onClick={onLeave}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all font-medium border border-red-500/20"
                    >
                        <PhoneOff size={18} />
                        <span>Lämna</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex bg-slate-950 min-h-0">
                <div className="flex-1 relative p-4 flex flex-col min-h-0">
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 bg-slate-900/30 shadow-2xl flex flex-col relative">
                        <div className="flex-1 relative">
                            <VideoConference />
                        </div>
                        <RoomAudioRenderer />

                        {/* Side Panel Overlay/Container */}
                        {activePanel && (
                            <div className="absolute top-4 right-4 bottom-4 w-96 z-40 flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                                <div className="flex-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                        <h3 className="text-white font-medium capitalize">{activePanel === 'settings' ? 'Inställningar' : activePanel}</h3>
                                        <button onClick={() => setActivePanel(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {activePanel === 'chat' && <Chat />}
                                        {activePanel === 'participants' && <MyParticipantList />}
                                        {activePanel === 'settings' && (
                                            <div className="p-6 space-y-6">
                                                <div>
                                                    <h4 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                                                        <Sparkles size={16} className="text-indigo-400" />
                                                        Videoförbättringar
                                                    </h4>
                                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-white text-sm font-medium">Suddig bakgrund (Blur)</p>
                                                                <p className="text-white/40 text-[11px]">Dölj det som finns bakom dig</p>
                                                            </div>
                                                            <button
                                                                onClick={toggleBlur}
                                                                disabled={isProcessing}
                                                                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${isBlurActive ? 'bg-indigo-500' : 'bg-white/10'}`}
                                                            >
                                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isBlurActive ? 'translate-x-6' : 'translate-x-0'} ${isProcessing ? 'animate-pulse' : ''}`}></div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                                                        <Settings size={16} className="text-white/40" />
                                                        Enhetsinställningar
                                                    </h4>
                                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                        <p className="text-xs text-white/60 leading-relaxed">
                                                            Använd kontrollfältet längst ner för att snabbt byta mellan mikrofoner och kameror.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PremiumLiveMeeting = ({ lessonId, token, serverUrl, onLeave }) => {
    const [activePanel, setActivePanel] = useState(null); // 'chat', 'participants', 'settings'
    const [isBlurActive, setIsBlurActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Sanitize serverUrl: Handle protocol mismatch (ws vs wss) and localhost in non-local environments
    const sanitizedServerUrl = React.useMemo(() => {
        if (!serverUrl) return serverUrl;
        let url = serverUrl;

        // Auto-upgrade to wss if page is secure
        if (window.location.protocol === 'https:' && url.startsWith('ws://')) {
            url = url.replace('ws://', 'wss://');
            console.log('Upgraded LiveKit protocol to wss:// for secure page');
        }

        // Detect if we are in production but the server sent localhost
        const isProdDomain = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
        if (isProdDomain && url.includes('localhost')) {
            // Fallback: Try to use the current domain instead of localhost
            // Keep the port if it was specified (e.g. 7880), but ideally the user should set a proper LIVEKIT_URL
            url = url.replace('localhost', window.location.hostname);
            console.warn('Detected localhost in production environment, falling back to current domain:', url);
        }

        return url;
    }, [serverUrl]);

    if (!token) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Laddar möte...</div>;

    const handleError = (error) => {
        console.error('LiveKit Room Error:', error);
        setError(`Anslutningsfel: ${error.message || 'Okänt fel'}`);
    };

    const handleDisconnected = (reason) => {
        console.warn('LiveKit Room Disconnected:', reason);
        // If it was a natural exit, just leave
        if (!reason) {
            onLeave();
            return;
        }
        setError(`Frånkopplad: ${reason}`);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                    <X size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ett fel uppstod</h2>
                <p className="text-white/60 mb-8 max-w-md">{error}</p>
                <button
                    onClick={onLeave}
                    className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                    Gå tillbaka
                </button>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={sanitizedServerUrl}
            onDisconnected={handleDisconnected}
            onError={handleError}
            className="fixed inset-0"
        >
            <MeetingUI
                activePanel={activePanel}
                setActivePanel={setActivePanel}
                onLeave={onLeave}
                isBlurActive={isBlurActive}
                setIsBlurActive={setIsBlurActive}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
            />

            {/* Global Meeting Styles */}
            <style>{`
        /* Global LiveKit Overrides */
        .lk-video-conference {
          background: transparent !important;
          border: none !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .lk-video-conference-inner {
          background: transparent !important;
          flex: 1 !important;
          min-height: 0 !important;
        }

        /* Control Bar - Fixed & Premium */
        .lk-control-bar {
          position: fixed !important;
          bottom: 2rem !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: rgba(15, 23, 42, 0.75) !important;
          backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1.25rem !important;
          padding: 0.75rem 1.25rem !important;
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5) !important;
          z-index: 50 !important;
          width: fit-content !important;
        }

        .lk-button {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 0.85rem !important;
          color: white !important;
          transition: all 0.2s ease !important;
          padding: 0.6rem !important;
        }
        .lk-button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-1px);
        }
        .lk-button-menu {
          background: #1e293b !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
          padding: 0.5rem !important;
          z-index: 100 !important;
        }

        /* Chat Styling */
        .lk-chat {
          background: transparent !important;
          border: none !important;
        }
        .lk-chat-entries {
          padding: 1rem !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.75rem !important;
        }
        .lk-chat-entry {
          background: rgba(255, 255, 255, 0.03) !important;
          border-radius: 1rem !important;
          padding: 0.75rem !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          max-width: 90% !important;
        }
        .lk-chat-entry[data-self="true"] {
          background: rgba(99, 102, 241, 0.15) !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
          align-self: flex-end !important;
        }
        .lk-chat-form {
          padding: 1rem !important;
          border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .lk-chat-form input {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.75rem !important;
          padding: 0.6rem 1rem !important;
          color: white !important;
        }

        /* Participant List Styling */
        .lk-participant-list {
          background: transparent !important;
          padding: 1rem !important;
        }
        .lk-participant-list-item {
          background: rgba(255, 255, 255, 0.03) !important;
          border-radius: 0.85rem !important;
          margin-bottom: 0.5rem !important;
          padding: 0.75rem !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Layout Grid Gap */
        .lk-grid-layout {
          gap: 1.25rem !important;
          padding: 1rem !important;
        }
      `}</style>
        </LiveKitRoom>
    );
};

export default PremiumLiveMeeting;
