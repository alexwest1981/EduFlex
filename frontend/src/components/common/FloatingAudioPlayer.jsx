import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, FastForward, Rewind, Music, Maximize2, Minimize2, ChevronUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const FloatingAudioPlayer = () => {
    const { activeAudiobook, setActiveAudiobook, isAudioPlayerMinimized, setIsAudioPlayerMinimized } = useAppContext();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [error, setError] = useState(null);
    const [lastFetchId, setLastFetchId] = useState(null);
    const audioRef = useRef(null);

    // Fetch progress when activeAudiobook changes
    const fetchProgress = async (ebookId) => {
        setLastFetchId(ebookId);
        try {
            const response = await fetch(`/api/ebooks/${ebookId}/progress`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.timestamp && audioRef.current) {
                    audioRef.current.currentTime = data.timestamp;
                }
            }
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        }
    };

    const saveProgress = async () => {
        if (!activeAudiobook || !audioRef.current) return;
        try {
            const currentTime = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            await fetch(`/api/ebooks/${activeAudiobook.id}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: currentTime,
                    percentage: total ? (currentTime / total) * 100 : 0
                })
            });
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    };

    // Reset error and sync isPlaying when activeAudiobook changes
    useEffect(() => {
        if (activeAudiobook && audioRef.current) {
            setError(null);
            if (activeAudiobook.fileUrl) {
                audioRef.current.src = activeAudiobook.fileUrl;
                audioRef.current.load(); // Ensure it loads the new source
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        if (e.name !== 'AbortError') {
                            console.warn("Playback prevented:", e);
                        }
                    });
                }
                setIsPlaying(true);
                fetchProgress(activeAudiobook.id);
            }
        }
    }, [activeAudiobook?.id]);

    // Save progress periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeAudiobook && audioRef.current && isPlaying) {
                saveProgress();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeAudiobook?.id, isPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    if (!activeAudiobook) return null;

    const togglePlay = (e) => {
        if (e) e.stopPropagation();
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(e => {
                        if (e.name !== 'AbortError') {
                            console.warn("Playback failed:", e);
                        }
                    });
            }
        }
        saveProgress();
    };

    const handleTimeUpdate = () => {
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        if (total) {
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const seekTime = (e.target.value / 100) * duration;
        audioRef.current.currentTime = seekTime;
        setProgress(e.target.value);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const skip = (amount) => {
        audioRef.current.currentTime += amount;
    };

    const handleAudioError = (e) => {
        console.error("Audio playback error:", e);
        if (audioRef.current && audioRef.current.error && audioRef.current.error.code === 4) {
            setError("Filen saknas på servern (404).");
        } else {
            setError("Kunde inte ladda ljudfilen.");
        }
        setIsPlaying(false);
    };

    const handleClose = (e) => {
        if (e) e.stopPropagation();
        if (audioRef.current) {
            saveProgress();
            audioRef.current.pause();
        }
        setActiveAudiobook(null);
    };

    return (
        <>
            {/* AUDIO ELEMENT - Always mounted while activeAudiobook exists */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={handleAudioError}
            />

            {isAudioPlayerMinimized ? (
                /* RENDER MINIMIZED */
                <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-10 duration-500">
                    <div className={`shadow-2xl rounded-2xl border flex items-center p-2 gap-4 w-72 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 ${error ? 'bg-red-50 dark:bg-red-900/40 border-red-500/20' : 'bg-white dark:bg-[#1E1F20] border-indigo-500/20'}`}>
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-indigo-600 relative group cursor-pointer" onClick={() => setIsAudioPlayerMinimized(false)}>
                            <img
                                src={`/api/ebooks/${activeAudiobook.id}/cover`}
                                alt={activeAudiobook.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div style={{ display: 'none' }} className="absolute inset-0 items-center justify-center">
                                <Music size={20} className="text-white/40" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronUp className="text-white" size={20} />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsAudioPlayerMinimized(false)}>
                            <h4 className={`text-sm font-bold truncate ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                {error ? 'Fel vid laddning' : activeAudiobook.title}
                            </h4>
                            <p className="text-[10px] text-gray-500 truncate">
                                {error ? error : `${formatTime(audioRef.current?.currentTime || 0)} / ${formatTime(duration)}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-1">
                            {!error && (
                                <button onClick={togglePlay} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                </button>
                            )}
                            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {!error && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* RENDER EXPANDED */
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/10 relative">
                        {/* Header Controls */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                            <button
                                onClick={() => setIsAudioPlayerMinimized(true)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                title="Minimize"
                            >
                                <Minimize2 size={20} />
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 pb-12 flex flex-col items-center">
                            {/* Cover Art Area */}
                            <div className="w-56 h-56 rounded-[30px] shadow-2xl mb-8 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group relative">
                                <img
                                    src={`/api/ebooks/${activeAudiobook.id}/cover`}
                                    alt={activeAudiobook.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div style={{ display: 'none' }} className="absolute inset-0 items-center justify-center">
                                    <Music size={64} className="text-white/40" />
                                </div>
                                {error && (
                                    <div className="absolute inset-0 bg-red-600/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                                        <p className="text-white text-sm font-bold leading-tight">{error}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Info */}
                            <div className="text-center mb-8 w-full px-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                    {activeAudiobook.title}
                                </h2>
                                <p className="text-indigo-500 font-medium">
                                    {activeAudiobook.author}
                                </p>
                            </div>

                            {/* Error State or Controls */}
                            {error ? (
                                <div className="w-full text-center">
                                    <p className="text-gray-500 text-sm mb-6 px-8">Testa att ladda om biblioteket och återskapa ljudfilen med "Återskapa"-knappen om felet kvarstår.</p>
                                    <button
                                        onClick={handleClose}
                                        className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Stäng spelaren
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Progress Bar */}
                                    <div className="w-full mb-8">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={progress}
                                            onChange={handleSeek}
                                            className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-2"
                                        />
                                        <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between w-full px-4 mb-8">
                                        <button
                                            onClick={() => skip(-15)}
                                            className="p-3 text-gray-400 hover:text-indigo-500 transition-colors"
                                            title="Back 15s"
                                        >
                                            <Rewind size={24} />
                                        </button>

                                        <button
                                            onClick={togglePlay}
                                            className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
                                        >
                                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                        </button>

                                        <button
                                            onClick={() => skip(15)}
                                            className="p-3 text-gray-400 hover:text-indigo-500 transition-colors"
                                            title="Forward 15s"
                                        >
                                            <FastForward size={24} />
                                        </button>
                                    </div>

                                    {/* Bottom Settings */}
                                    <div className="flex items-center justify-between w-full bg-gray-50 dark:bg-white/5 rounded-3xl p-4">
                                        <div className="flex items-center gap-3">
                                            <Volume2 size={18} className="text-gray-400" />
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={volume}
                                                onChange={(e) => {
                                                    setVolume(parseFloat(e.target.value));
                                                    if (audioRef.current) {
                                                        audioRef.current.volume = parseFloat(e.target.value);
                                                    }
                                                }}
                                                className="w-20 h-1 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                const speeds = [1, 1.25, 1.5, 2, 0.75];
                                                const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                                                setPlaybackSpeed(speeds[nextIndex]);
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-white/5"
                                        >
                                            {playbackSpeed}x
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingAudioPlayer;
