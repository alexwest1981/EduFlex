import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, Mic, MicOff, Video, VideoOff, Users, Settings, PhoneOff, Loader2 } from 'lucide-react';

/**
 * JitsiMeeting - Embedded Jitsi Meet video conference component
 *
 * Props:
 * - roomName: Unique room identifier
 * - displayName: User's display name
 * - email: User's email (for gravatar)
 * - isHost: Whether the user is the meeting host
 * - onClose: Callback when meeting ends/closes
 * - onParticipantJoined: Callback when someone joins
 * - onParticipantLeft: Callback when someone leaves
 */
const JitsiMeeting = ({
    roomName,
    displayName,
    email,
    isHost = false,
    onClose,
    onParticipantJoined,
    onParticipantLeft,
    jitsiDomain = 'meet.eduflexlms.se' // Self-hosted Jitsi instance via Cloudflare
}) => {
    const containerRef = useRef(null);
    const apiRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);
    const [isMuted, setIsMuted] = useState(!isHost);
    const [isVideoOff, setIsVideoOff] = useState(!isHost);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Always use HTTPS for meet.jit.si
        const domain = jitsiDomain;
        const isLocalhost = domain.includes('localhost') || domain.includes('127.0.0.1');
        const protocol = isLocalhost ? 'http' : 'https';

        // Load Jitsi Meet External API
        const script = document.createElement('script');
        script.src = `${protocol}://${domain}/external_api.js`;
        script.async = true;
        script.onload = () => {
            setIsLoading(false);
            initJitsi(domain);
        };
        script.onerror = () => {
            console.error('Failed to load Jitsi API from', domain);
            setIsLoading(false);
        };
        document.body.appendChild(script);

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, [roomName]);

    const initJitsi = (domain = jitsiDomain) => {
        if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

        const options = {
            roomName: roomName,
            parentNode: containerRef.current,
            width: '100%',
            height: '100%',
            configOverwrite: {
                // === Standard Config for meet.jit.si ===
                // Disable prejoin page for smoother entry (if allowed by server)
                prejoinPageEnabled: false,

                // Start settings
                startWithAudioMuted: !isHost,
                startWithVideoMuted: !isHost,

                // Toolbar
                toolbarButtons: [
                    'microphone', 'camera', 'desktop', 'chat',
                    'raisehand', 'participants-pane', 'tileview',
                    'fullscreen', 'settings'
                ],

                // Swedish language
                defaultLanguage: 'sv',

                // === PERFORMANCE OPTIMIZATIONS ===
                resolution: 480, // Lower resolution for better performance
                constraints: {
                    video: {
                        height: { ideal: 480, max: 720, min: 180 },
                        width: { ideal: 854, max: 1280, min: 320 },
                        frameRate: { ideal: 24, max: 30 }
                    }
                },
                // Enable layer suspension
                enableLayerSuspension: true,
                // Only receive video from 4 most active speakers
                channelLastN: 4,
                // Disable CPU-intensive features
                disableAudioLevels: true,
                enableNoisyMicDetection: false,
                enableNoAudioDetection: false,
                disableVirtualBackground: true,
                disableScreensharingVirtualBackground: true,

                // P2P mode for 2 participants
                p2p: {
                    enabled: true,
                    preferH264: true,
                    useStunTurn: true
                },

                // Disable stats gathering
                callStatsID: '',
                enableDisplayNameInStats: false
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_BRAND_WATERMARK: false,
                BRAND_WATERMARK_LINK: '',
                SHOW_CHROME_EXTENSION_BANNER: false,
                MOBILE_APP_PROMO: false,
                TOOLBAR_ALWAYS_VISIBLE: true,
                DEFAULT_BACKGROUND: '#1E1F20',
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                FILM_STRIP_MAX_HEIGHT: 100,
                DISABLE_FOCUS_INDICATOR: true,
                TILE_VIEW_MAX_COLUMNS: 3,
                // Hide promotional stuff
                HIDE_INVITE_MORE_HEADER: true,
                DISABLE_RINGING: true
            },
            userInfo: {
                displayName: displayName || 'Deltagare',
                email: email
            }
        };

        try {
            apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            // Event listeners
            apiRef.current.addListener('participantJoined', (participant) => {
                setParticipantCount(prev => prev + 1);
                if (onParticipantJoined) onParticipantJoined(participant);
            });

            apiRef.current.addListener('participantLeft', (participant) => {
                setParticipantCount(prev => Math.max(1, prev - 1));
                if (onParticipantLeft) onParticipantLeft(participant);
            });

            // Track if we actually joined successfully
            let hasJoined = false;

            apiRef.current.addListener('videoConferenceJoined', () => {
                hasJoined = true;
                console.log('Successfully joined Jitsi conference');
            });

            apiRef.current.addListener('videoConferenceLeft', () => {
                // Only close if we had actually joined the conference
                // This prevents closing when lobby kicks us before joining or during transient state
                if (hasJoined && onClose) {
                    console.log('User naturally left conference, closing modal');
                    onClose();
                } else if (!hasJoined) {
                    console.log('Left conference before fully joining (possibly transient state or lobby)');
                    // We DO NOT close the modal here to allow the user to stay/retry
                    // This fixed the issue where the button "disappears" (modal closes) instantly
                }
            });

            // Handle lobby events
            apiRef.current.addListener('knockingParticipant', () => {
                console.log('Someone is knocking (lobby active)');
            });

            // Auto-approve knocking if we're the host
            if (isHost) {
                apiRef.current.addListener('knockingParticipant', (participant) => {
                    // Auto-approve all knocking participants
                    apiRef.current.executeCommand('answerKnockingParticipant', participant.id, true);
                });
            }

            apiRef.current.addListener('audioMuteStatusChanged', ({ muted }) => {
                setIsMuted(muted);
            });

            apiRef.current.addListener('videoMuteStatusChanged', ({ muted }) => {
                setIsVideoOff(muted);
            });

        } catch (error) {
            console.error('Failed to initialize Jitsi:', error);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.parentElement?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const toggleMute = () => {
        if (apiRef.current) {
            apiRef.current.executeCommand('toggleAudio');
        }
    };

    const toggleVideo = () => {
        if (apiRef.current) {
            apiRef.current.executeCommand('toggleVideo');
        }
    };

    const hangUp = () => {
        if (apiRef.current) {
            apiRef.current.executeCommand('hangup');
        }
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-white text-lg">Ansluter till mötet...</p>
                        <p className="text-gray-400 text-sm mt-2">Laddar Jitsi Meet</p>
                    </div>
                </div>
            )}

            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-bold">LIVE</span>
                    </div>
                    <span className="text-gray-400 text-sm">{roomName}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white text-sm">
                        <Users size={16} />
                        <span>{participantCount}</span>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        title={isFullscreen ? 'Avsluta helskärm' : 'Helskärm'}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>

                    <button
                        onClick={hangUp}
                        className="p-2 text-white hover:bg-red-500 rounded-lg transition-colors"
                        title="Lämna mötet"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Jitsi Container */}
            <div ref={containerRef} className="flex-1" />

            {/* Bottom Controls removed to use native Jitsi toolbar */}
        </div>
    );
};

export default JitsiMeeting;
