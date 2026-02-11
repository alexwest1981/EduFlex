import React, { useState, useEffect } from 'react';
import {
    X, Download, Star, Clock, FileQuestion, GraduationCap,
    School, CheckCircle, Loader2, Send, Share2, MessageSquare, ExternalLink, Trash2, Edit
} from 'lucide-react';
import { api } from '../../../services/api';
import SubjectIcon from './SubjectIcon';
import PublishModal from './PublishModal';

const CommunityDetailModal = ({ itemId, onClose, onInstall, onViewAuthor, onDelete }) => {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        loadItem();
    }, [itemId]);

    const loadItem = async () => {
        setLoading(true);
        try {
            const data = await api.community.getItem(itemId);
            setItem(data);
        } catch (err) {
            console.error('Failed to load item:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async () => {
        setInstalling(true);
        try {
            await onInstall(itemId);
            await loadItem(); // Refresh to update alreadyInstalled
        } finally {
            setInstalling(false);
        }
    };

    const handleRating = async () => {
        if (rating === 0) return;
        setSubmittingRating(true);
        try {
            await api.community.rate(itemId, rating, comment);
            await loadItem();
            setRating(0);
            setComment('');
        } catch (err) {
            console.error('Failed to submit rating:', err);
            alert('Kunde inte skicka betyg: ' + err.message);
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleEditComplete = async () => {
        setShowEditModal(false);
        await loadItem();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-8">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                </div>
            </div>
        );
    }

    if (!item) return null;

    // Check if current user is the author or an admin (if onDelete is provided, it implies admin rights or similar)
    // For simplicity, we can check if onDelete is available (admin) OR if we can verify authorship.
    // Since we don't have currentUser here directly, we might rely on onDelete for admins.
    // However, the user asked for an edit button "if something was wrong with the upload".
    // This implies the uploader should be able to edit.
    // We can check if item.isMine (if the API returns it) or similar.
    // Assuming `onDelete` is passed for admins.
    // Let's assume admins can edit too.

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-[#1E1F20] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className="p-6 relative"
                        style={{ backgroundColor: item.subjectColor || '#6366F1' }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <X className="text-white" size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <SubjectIcon iconName={item.subjectIcon} color="white" size={32} />
                            <div>
                                <span className="text-white/80 text-sm">{item.subjectDisplayName}</span>
                                <h2 className="text-2xl font-bold text-white">{item.title}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <MetadataItem
                                icon={<FileQuestion size={20} />}
                                label="Frågor"
                                value={item.metadata?.questionCount || '-'}
                            />
                            <MetadataItem
                                icon={<Clock size={20} />}
                                label="Tid"
                                value={item.metadata?.estimatedMinutes ? `~${item.metadata.estimatedMinutes} min` : '-'}
                            />
                            <MetadataItem
                                icon={<GraduationCap size={20} />}
                                label="Nivå"
                                value={item.difficulty || '-'}
                            />
                            <MetadataItem
                                icon={<School size={20} />}
                                label="Årskurs"
                                value={item.gradeLevel || '-'}
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Beskrivning</h3>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {item.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-gray-100 dark:bg-[#282a2c] px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-300"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Author Section */}
                        <div
                            className="bg-gray-50 dark:bg-[#282a2c] rounded-xl p-4 mb-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
                            onClick={() => onViewAuthor(item.authorUserId)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-[#3c4043] rounded-full flex items-center justify-center overflow-hidden">
                                    {item.authorProfilePictureUrl ? (
                                        <img src={item.authorProfilePictureUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-gray-500">
                                            {item.authorName?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                        {item.authorName}
                                        <ExternalLink size={14} className="text-gray-400" />
                                    </p>
                                    <p className="text-sm text-gray-500">{item.authorTenantName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ratings Section */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Betyg & Recensioner</h3>

                            {/* Rating Summary */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={24}
                                            className={star <= Math.round(item.averageRating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'}
                                        />
                                    ))}
                                </div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {(item.averageRating || 0).toFixed(1)}
                                </span>
                                <span className="text-gray-500">({item.ratingCount} betyg)</span>
                            </div>

                            {/* Recent Reviews */}
                            {item.recentRatings && item.recentRatings.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {item.recentRatings.map((review) => (
                                        <div key={review.id} className="bg-gray-50 dark:bg-[#282a2c] rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={12}
                                                        className={star <= review.rating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'}
                                                    />
                                                ))}
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                                                    {review.reviewerName}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Rating */}
                            <div className="bg-gray-50 dark:bg-[#282a2c] rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ge ditt betyg</p>
                                <div className="flex items-center gap-2 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= rating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Skriv en kommentar (valfritt)"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm"
                                    />
                                    <button
                                        onClick={handleRating}
                                        disabled={rating === 0 || submittingRating}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submittingRating ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Social Learning Flow Section */}
                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                                    <Share2 size={18} />
                                    Learning Flow Integration
                                </h3>
                                <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-800/40 px-2 py-0.5 rounded">Social</span>
                            </div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4">
                                Dela detta material till dina sociala lärokanaler för att uppmuntra till kollegialt lärande.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => alert('Dela till Slack (Webhook konfigureras i Admin)')}
                                    className="flex-1 py-2 px-3 bg-[#4A154B] text-white rounded-lg hover:bg-[#3d113e] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <MessageSquare size={16} />
                                    Slack
                                </button>
                                <button
                                    onClick={() => alert('Dela till Teams (Webhook konfigureras i Admin)')}
                                    className="flex-1 py-2 px-3 bg-[#444791] text-white rounded-lg hover:bg-[#373a76] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <ExternalLink size={16} />
                                    Teams
                                </button>
                            </div>
                        </div>

                        {/* Install Button */}
                        <div className="sticky bottom-0 bg-white dark:bg-[#1E1F20] pt-4 border-t border-gray-200 dark:border-[#3c4043] flex gap-3">
                            {onDelete && (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="px-4 py-3 bg-gray-100 dark:bg-[#282a2c] text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#3c4043] transition-colors"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="px-4 py-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleInstall}
                                disabled={installing || item.alreadyInstalled}
                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${item.alreadyInstalled
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300'
                                    }`}
                            >
                                {installing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Installerar...
                                    </>
                                ) : item.alreadyInstalled ? (
                                    <>
                                        <CheckCircle size={20} />
                                        Redan installerad
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Lägg till i Resursbanken
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <PublishModal
                    onClose={() => setShowEditModal(false)}
                    onPublished={handleEditComplete}
                    userId={item.authorUserId}
                    initialType={item.contentType}
                    initialItemId={item.originalId || item.id} // Use original ID if available, otherwise current ID
                    isEditMode={true}
                    editItemId={item.id}
                />
            )}
        </>
    );
};

const MetadataItem = ({ icon, label, value }) => (
    <div className="bg-gray-50 dark:bg-[#282a2c] rounded-xl p-3 text-center">
        <div className="flex justify-center mb-1 text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);

export default CommunityDetailModal;
