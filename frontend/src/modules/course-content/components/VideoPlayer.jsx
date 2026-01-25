import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, List, Settings, Loader2 } from 'lucide-react';

/**
 * VideoPlayer - Course video player with chapters support
 *
 * Props:
 * - src: Video URL
 * - title: Video title
 * - chapters: Array of {time: number (seconds), title: string}
 * - onProgress: Callback with current time and duration
 * - onEnded: Callback when video ends
 * - onMetadataLoaded: Callback with {duration} when video loads
 * - autoPlay: Whether to autoplay
 */
const VideoPlayer = ({
    src,
    title,
    chapters = [],
    onProgress,
    onEnded,
    onMetadataLoaded,
    autoPlay = false,
    poster
}) => {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showChapters, setShowChapters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [buffered, setBuffered] = useState(0);

    // Format time as MM:SS or HH:MM:SS
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get current chapter based on time
    const getCurrentChapter = () => {
        if (!chapters || chapters.length === 0) return null;
        for (let i = chapters.length - 1; i >= 0; i--) {
            if (currentTime >= chapters[i].time) {
                return chapters[i];
            }
        }
        return chapters[0];
    };

    // Video event handlers
    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (video) {
            setDuration(video.duration);
            setIsLoading(false);
            if (onMetadataLoaded) {
                onMetadataLoaded({ duration: video.duration });
            }
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video) {
            setCurrentTime(video.currentTime);
            if (onProgress) {
                onProgress({ currentTime: video.currentTime, duration: video.duration });
            }
            // Update buffered amount
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered((bufferedEnd / video.duration) * 100);
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
    };

    // Controls
    const togglePlay = () => {
        const video = videoRef.current;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (video) {
            video.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        const video = videoRef.current;
        if (video) {
            video.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        const progressBar = progressRef.current;
        if (video && progressBar) {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * duration;
        }
    };

    const seekToChapter = (chapter) => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = chapter.time;
            setShowChapters(false);
            if (!isPlaying) {
                video.play();
                setIsPlaying(true);
            }
        }
    };

    const skip = (seconds) => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
        }
    };

    const toggleFullscreen = () => {
        const container = videoRef.current?.parentElement?.parentElement;
        if (container) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                container.requestFullscreen();
            }
        }
    };

    const changePlaybackRate = (rate) => {
        const video = videoRef.current;
        if (video) {
            video.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSettings(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleVolumeChange({ target: { value: Math.min(1, volume + 0.1) } });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleVolumeChange({ target: { value: Math.max(0, volume - 0.1) } });
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, volume, isMuted]);

    const currentChapter = getCurrentChapter();
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl group">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full aspect-video"
                onClick={togglePlay}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                autoPlay={autoPlay}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
            )}

            {/* Play/Pause Big Button (center) */}
            {!isPlaying && !isLoading && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                {/* Current Chapter Display */}
                {currentChapter && (
                    <div className="mb-3 px-1">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                            {currentChapter.title}
                        </span>
                    </div>
                )}

                {/* Progress Bar */}
                <div
                    ref={progressRef}
                    className="h-1.5 bg-white/30 rounded-full cursor-pointer mb-4 relative group/progress"
                    onClick={handleSeek}
                >
                    {/* Buffered */}
                    <div
                        className="absolute h-full bg-white/20 rounded-full"
                        style={{ width: `${buffered}%` }}
                    />
                    {/* Progress */}
                    <div
                        className="absolute h-full bg-indigo-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                    {/* Chapter markers */}
                    {chapters.map((chapter, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-3 bg-white/60 rounded-full -top-0.5 cursor-pointer hover:bg-white"
                            style={{ left: `${(chapter.time / duration) * 100}%` }}
                            onClick={(e) => {
                                e.stopPropagation();
                                seekToChapter(chapter);
                            }}
                            title={chapter.title}
                        />
                    ))}
                    {/* Hover thumb */}
                    <div
                        className="absolute w-4 h-4 bg-indigo-500 rounded-full -top-1.5 -ml-2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `${progress}%` }}
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>

                        {/* Skip Back */}
                        <button
                            onClick={() => skip(-10)}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="-10 sekunder"
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>

                        {/* Skip Forward */}
                        <button
                            onClick={() => skip(10)}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="+10 sekunder"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-indigo-500"
                            />
                        </div>

                        {/* Time Display */}
                        <span className="text-white text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Chapters */}
                        {chapters.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowChapters(!showChapters)}
                                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                    title="Kapitel"
                                >
                                    <List className="w-5 h-5" />
                                </button>

                                {showChapters && (
                                    <div className="absolute bottom-full right-0 mb-2 w-64 max-h-64 overflow-y-auto bg-gray-900 rounded-xl shadow-2xl border border-white/10">
                                        <div className="p-2 border-b border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Kapitel</span>
                                        </div>
                                        {chapters.map((chapter, i) => (
                                            <button
                                                key={i}
                                                onClick={() => seekToChapter(chapter)}
                                                className={`w-full p-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 ${currentChapter === chapter ? 'bg-indigo-500/20 text-indigo-400' : 'text-white'
                                                    }`}
                                            >
                                                <span className="text-xs font-mono text-gray-400 w-12">
                                                    {formatTime(chapter.time)}
                                                </span>
                                                <span className="text-sm font-medium truncate flex-1">
                                                    {chapter.title}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Playback Speed */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                title="Hastighet"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                                    <div className="p-2 border-b border-white/10">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Hastighet</span>
                                    </div>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => changePlaybackRate(rate)}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${playbackRate === rate ? 'text-indigo-400 bg-indigo-500/20' : 'text-white'
                                                }`}
                                        >
                                            {rate === 1 ? 'Normal' : `${rate}x`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="Helskärm"
                        >
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Title Overlay (top) */}
            {title && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white font-bold text-lg truncate">{title}</h3>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
