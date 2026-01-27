import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Eye, Clock, FileQuestion,
    ClipboardList, BookOpen, Loader2, AlertTriangle, RefreshCw,
    User, Building2, Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import SubjectIcon from './components/SubjectIcon';
import AdminNavbar from '../dashboard/components/admin/AdminNavbar';
import AdminHeader from '../dashboard/components/admin/AdminHeader';

const CommunityAdmin = () => {
    const [pendingItems, setPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        loadPendingItems();
    }, []);

    const loadPendingItems = async () => {
        setLoading(true);
        try {
            const data = await api.community.admin.getPending();
            setPendingItems(data.content || []);
            setPendingCount(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to load pending items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (itemId) => {
        setActionLoading(itemId);
        try {
            await api.community.admin.approve(itemId);
            setPendingItems(prev => prev.filter(item => item.id !== itemId));
            setPendingCount(prev => prev - 1);
        } catch (err) {
            console.error('Failed to approve item:', err);
            alert('Kunde inte godkänna: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedItem || !rejectReason.trim()) return;

        setActionLoading(selectedItem.id);
        try {
            await api.community.admin.reject(selectedItem.id, rejectReason);
            setPendingItems(prev => prev.filter(item => item.id !== selectedItem.id));
            setPendingCount(prev => prev - 1);
            setShowRejectModal(false);
            setSelectedItem(null);
            setRejectReason('');
        } catch (err) {
            console.error('Failed to reject item:', err);
            alert('Kunde inte avvisa: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (item) => {
        setSelectedItem(item);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'QUIZ': return <FileQuestion size={20} className="text-purple-500" />;
            case 'ASSIGNMENT': return <ClipboardList size={20} className="text-blue-500" />;
            case 'LESSON': return <BookOpen size={20} className="text-green-500" />;
            default: return <FileQuestion size={20} className="text-gray-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'QUIZ': return 'Quiz';
            case 'ASSIGNMENT': return 'Uppgift';
            case 'LESSON': return 'Lektion';
            default: return type;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('sv-SE', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <AdminHeader />
            <AdminNavbar />

            <div className="space-y-6 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Clock className="text-amber-500" />
                            Community Granskning
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {pendingCount} {pendingCount === 1 ? 'objekt' : 'objekt'} väntar på granskning
                        </p>
                    </div>
                    <button
                        onClick={loadPendingItems}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#282a2c] hover:bg-gray-200 dark:hover:bg-[#3c4043] rounded-xl transition-colors"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Uppdatera
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                    </div>
                ) : pendingItems.length === 0 ? (
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-12 text-center border border-gray-200 dark:border-[#3c4043]">
                        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Allt är granskat!
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Det finns inga objekt som väntar på granskning just nu.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Content Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {item.subject && (
                                                    <div
                                                        className="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
                                                        style={{
                                                            backgroundColor: `${item.subjectColor || '#6366F1'}20`,
                                                            color: item.subjectColor || '#6366F1'
                                                        }}
                                                    >
                                                        <SubjectIcon iconName={item.subjectIcon} size={14} />
                                                        {item.subjectDisplayName || item.subject}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-[#282a2c] rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {getTypeIcon(item.contentType)}
                                                    {getTypeLabel(item.contentType)}
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                {item.title}
                                            </h3>

                                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                                                {item.description || 'Ingen beskrivning'}
                                            </p>

                                            {/* Metadata */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={14} />
                                                    <span>{item.authorName}</span>
                                                </div>
                                                {item.authorTenantName && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 size={14} />
                                                        <span>{item.authorTenantName}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>
                                                {item.metadata?.questionCount && (
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                        {item.metadata.questionCount} frågor
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => handleApprove(item.id)}
                                                disabled={actionLoading === item.id}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                                            >
                                                {actionLoading === item.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle size={18} />
                                                )}
                                                Godkänn
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(item)}
                                                disabled={actionLoading === item.id}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors font-medium"
                                            >
                                                <XCircle size={18} />
                                                Avvisa
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#282a2c]">
                                            <div className="flex flex-wrap gap-2">
                                                {item.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-gray-100 dark:bg-[#282a2c] rounded-full text-xs text-gray-600 dark:text-gray-400"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedItem && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowRejectModal(false)}
                    >
                        <div
                            className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-[#3c4043]">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="text-amber-500" size={20} />
                                    Avvisa innehåll
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    "{selectedItem.title}"
                                </p>
                            </div>

                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Motivering (visas för användaren) *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Förklara varför innehållet inte godkänns..."
                                    rows={4}
                                    className="w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    T.ex. "Innehållet uppfyller inte kvalitetskraven" eller "Felaktiga svarsalternativ"
                                </p>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-[#3c4043] flex justify-end gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-xl transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectReason.trim() || actionLoading === selectedItem.id}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {actionLoading === selectedItem.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <XCircle size={18} />
                                    )}
                                    Avvisa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityAdmin;
