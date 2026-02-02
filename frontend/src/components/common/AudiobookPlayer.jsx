import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, FastForward, Rewind, Music } from 'lucide-react';

const AudiobookPlayer = ({ book, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        setProgress((current / total) * 100);
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/10 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8 pb-12 flex flex-col items-center">
                    {/* Cover Art Area */}
                    <div className="w-56 h-56 rounded-[30px] shadow-2xl mb-8 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group relative">
                        <img
                            src={`/api/ebooks/${book.id}/cover`}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                // Show fallback icon
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div style={{ display: 'none' }} className="absolute inset-0 items-center justify-center">
                            <Music size={64} className="text-white/40" />
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Info */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 px-4">
                            {book.title}
                        </h2>
                        <p className="text-indigo-500 font-medium">
                            {book.author}
                        </p>
                    </div>

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

                        <div className="flex items-center gap-6">
                            <button
                                onClick={togglePlay}
                                className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
                            >
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>
                        </div>

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
                                    audioRef.current.volume = parseFloat(e.target.value);
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
                </div>

                <audio
                    ref={audioRef}
                    src={book.fileUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                />
            </div>
        </div>
    );
};

export default AudiobookPlayer;
