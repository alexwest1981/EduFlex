import React from 'react';
import { X, Clock, Users, Video, MapPin, Check, Trash2, Edit, Share2, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

const EventDetailPanel = ({ event, isOpen, onClose, onDelete, onUpdateStatus, isTeacherOrAdmin }) => {
    if (!isOpen || !event) return null;

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'LESSON': return 'bg-purple-500';
            case 'EXAM': return 'bg-red-500';
            case 'WORKSHOP': return 'bg-blue-500';
            case 'MEETING': return 'bg-amber-500';
            default: return 'bg-gray-500';
        }
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'LESSON': return <Users size={20} />;
            case 'EXAM': return <AlertCircle size={20} />;
            case 'WORKSHOP': return <Video size={20} />;
            case 'MEETING': return <Users size={20} />;
            default: return <Calendar size={20} />;
        }
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'ZOOM':
            case 'TEAMS':
            case 'MEETS':
                return <Video size={16} />;
            default:
                return <MapPin size={16} />;
        }
    };

    const formatDuration = () => {
        const diff = event.end - event.start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getStatusBadge = () => {
        switch (event.status) {
            case 'CONFIRMED':
                return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                    <Check size={14} /> Godkänd
                </span>;
            case 'PENDING':
                return <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock size={14} /> Väntar
                </span>;
            case 'REJECTED':
                return <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-1">
                    <X size={14} /> Avvisad
                </span>;
            default:
                return null;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#1E1E1E] shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className={`${getEventTypeColor(event.type)} p-6 text-white relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-1">{event.title}</h2>
                            <p className="text-white/80 text-sm">{event.type}</p>
                        </div>
                    </div>

                    {getStatusBadge()}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Time & Duration */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <Clock size={20} className="text-gray-400" />
                            <div>
                                <p className="font-semibold">
                                    {event.start.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {event.start.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} ({formatDuration()})
                                </p>
                            </div>
                        </div>

                        {/* Platform/Location */}
                        {event.platform && event.platform !== 'NONE' && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                {getPlatformIcon(event.platform)}
                                <div>
                                    <p className="font-semibold">{event.platform}</p>
                                    {event.meetingLink && (
                                        <a
                                            href={event.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            Gå med i möte <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Owner */}
                        {event.ownerName && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <Users size={20} className="text-gray-400" />
                                <div>
                                    <p className="font-semibold">Organiserad av</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.ownerName}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Beskrivning</h3>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{event.description}</p>
                        </div>
                    )}

                    {/* Topic */}
                    {event.topic && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ämne</h3>
                            <p className="text-gray-600 dark:text-gray-400">{event.topic}</p>
                        </div>
                    )}

                    {/* Mandatory Badge */}
                    {event.isMandatory && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                            <p className="text-amber-800 dark:text-amber-400 font-semibold text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                Obligatorisk närvaro
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                        {/* Pending Approval Actions */}
                        {isTeacherOrAdmin && event.status === 'PENDING' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        onUpdateStatus(event.id, 'CONFIRMED');
                                        onClose();
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    Godkänn
                                </button>
                                <button
                                    onClick={() => {
                                        onUpdateStatus(event.id, 'REJECTED');
                                        onClose();
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={18} />
                                    Avvisa
                                </button>
                            </div>
                        )}

                        {/* Share Link */}
                        <button className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Share2 size={18} />
                            Dela länk
                        </button>

                        {/* Delete */}
                        {isTeacherOrAdmin && (
                            <button
                                onClick={() => {
                                    onDelete(event.id);
                                    onClose();
                                }}
                                className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                Ta bort händelse
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EventDetailPanel;
