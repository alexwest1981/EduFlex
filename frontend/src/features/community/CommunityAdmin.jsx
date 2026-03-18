import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Eye, Clock, FileQuestion,
    ClipboardList, BookOpen, Loader2, AlertTriangle, RefreshCw,
    User, Building2, Calendar, Trash2
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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

    const handleDelete = async () => {
        if (!selectedItem) return;

        setActionLoading(selectedItem.id);
        try {
            await api.community.delete(selectedItem.id);
            setPendingItems(prev => prev.filter(item => item.id !== selectedItem.id));
            setPendingCount(prev => prev - 1);
            setShowDeleteModal(false);
            setSelectedItem(null);
        } catch (err) {
            console.error('Failed to delete item:', err);
            alert('Kunde inte ta bort: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (item) => {
        setSelectedItem(item);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
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
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20 px-6">
            <AdminHeader />
            <AdminNavbar />

            <div className="space-y-8 flex-1 mt-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl shadow-xl border border-amber-500/20">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none">
                                    Community Granskning
                                </h1>
                                <p className="text-[10px] text-[var(--text-secondary)]/50 font-black uppercase tracking-[0.2em] mt-2">
                                    {pendingCount} {pendingCount === 1 ? 'objekt' : 'objekt'} väntar på din granskning
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={loadPendingItems}
                        disabled={loading}
                        className="relative z-10 flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] rounded-2xl transition-all border border-white/5 font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Uppdatera kö
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] shadow-xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-blue/20 blur-2xl rounded-full animate-pulse"></div>
                            <Loader2 className="animate-spin text-brand-blue relative z-10" size={48} />
                        </div>
                        <p className="text-[10px] font-black text-[var(--text-secondary)]/50 uppercase tracking-[0.3em] mt-8">Hämtar innehåll...</p>
                    </div>
                ) : pendingItems.length === 0 ? (
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-20 text-center border border-[var(--border-main)] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-green-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CheckCircle className="mx-auto text-green-500 mb-8 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" size={64} />
                        <h3 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tighter uppercase">
                            Allt är granskat!
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]/60 font-medium max-w-sm mx-auto">
                            Det finns inga objekt som väntar på granskning just nu. Bra jobbat!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {pendingItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] overflow-hidden hover:border-brand-blue/30 transition-all duration-500 shadow-xl group/card"
                            >
                                <div className="p-10">
                                    <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
                                        {/* Left: Content Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4 mb-6">
                                                {item.subject && (
                                                    <div
                                                        className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-lg"
                                                        style={{
                                                            backgroundColor: `${item.subjectColor || '#6366F1'}15`,
                                                            borderColor: `${item.subjectColor || '#6366F1'}30`,
                                                            color: item.subjectColor || '#6366F1'
                                                        }}
                                                    >
                                                        <SubjectIcon iconName={item.subjectIcon} size={16} />
                                                        {item.subjectDisplayName || item.subject}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] shadow-inner">
                                                    {getTypeIcon(item.contentType)}
                                                    {getTypeLabel(item.contentType)}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase leading-tight group-hover/card:text-brand-blue transition-colors">
                                                {item.title}
                                            </h3>

                                            <p className="text-[var(--text-secondary)]/70 text-sm font-medium leading-relaxed max-w-2xl line-clamp-2 mb-8 bg-white/[0.02] p-6 rounded-3xl border border-white/5 shadow-inner">
                                                {item.description || 'Ingen beskrivning angiven för detta innehåll.'}
                                            </p>

                                            {/* Metadata */}
                                            <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]/40">
                                                <div className="flex items-center gap-2 group/meta hover:text-[var(--text-primary)] transition-colors">
                                                    <div className="p-2 bg-white/5 rounded-xl border border-white/5"><User size={14} className="text-brand-blue" /></div>
                                                    <span>{item.authorName}</span>
                                                </div>
                                                {item.authorTenantName && (
                                                    <div className="flex items-center gap-2 group/meta hover:text-[var(--text-primary)] transition-colors">
                                                        <div className="p-2 bg-white/5 rounded-xl border border-white/5"><Building2 size={14} className="text-brand-blue" /></div>
                                                        <span>{item.authorTenantName}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 group/meta hover:text-[var(--text-primary)] transition-colors">
                                                    <div className="p-2 bg-white/5 rounded-xl border border-white/5"><Calendar size={14} className="text-brand-blue" /></div>
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>
                                                {item.metadata?.questionCount && (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-xl border border-brand-blue/20">
                                                        <span>{item.metadata.questionCount} frågor</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-48">
                                            <button
                                                onClick={() => handleApprove(item.id)}
                                                disabled={actionLoading === item.id}
                                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-600/20"
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
                                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/5 text-red-500 rounded-2xl hover:bg-red-500/10 hover:border-red-500/20 disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-inner"
                                            >
                                                <XCircle size={18} />
                                                Avvisa
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                                disabled={actionLoading === item.id}
                                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/5 text-[var(--text-secondary)] rounded-2xl hover:bg-white/10 disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest"
                                            >
                                                <Trash2 size={18} />
                                                Ta bort
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="mt-10 pt-8 border-t border-white/5">
                                            <div className="flex flex-wrap gap-3">
                                                {item.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]/60 hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-default"
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
            </div>

            {/* Reject Modal */}
            {showRejectModal && selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setShowRejectModal(false)}
                >
                    <div
                        className="bg-[var(--bg-card)] w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30"></div>
                        <div className="p-10 border-b border-white/5">
                            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter flex items-center gap-3">
                                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                                    <AlertTriangle size={24} />
                                </div>
                                Avvisa innehåll
                            </h3>
                            <p className="text-[10px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.2em] mt-4">
                                "{selectedItem.title}"
                            </p>
                        </div>

                        <div className="p-10 space-y-4">
                            <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em]">
                                Motivering (visas för användaren) *
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Förklara varför innehållet inte godkänns..."
                                rows={5}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-3xl p-6 text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner resize-none"
                            />
                            <div className="flex items-start gap-2 text-red-500/60 mt-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold italic">
                                    T.ex. "Innehållet uppfyller inte kvalitetskraven" eller "Felaktiga svarsalternativ"
                                </p>
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 flex justify-end gap-4 bg-white/[0.01]">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-8 py-4 text-[10px] font-black text-[var(--text-secondary)]/60 uppercase tracking-widest hover:text-[var(--text-primary)] transition-all"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading === selectedItem.id}
                                className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20"
                            >
                                {actionLoading === selectedItem.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <XCircle size={18} />
                                )}
                                Skicka beslut
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-[var(--bg-card)] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600/30"></div>
                        <div className="p-10 border-b border-white/5">
                            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter flex items-center gap-3 text-red-500">
                                <Trash2 size={24} />
                                Permanent radering
                            </h3>
                            <p className="text-[10px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.2em] mt-4">
                                Är du säker på att du vill ta bort "{selectedItem.title}"?
                            </p>
                        </div>

                        <div className="p-10">
                            <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10 mb-2">
                                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                                    Detta kommer att permanent ta bort innehållet från communityn. Denna åtgärd kan inte ångras och författaren kommer att förlora sina insamlade poäng för detta föremål.
                                </p>
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 flex justify-end gap-4 bg-white/[0.01]">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-8 py-4 text-[10px] font-black text-[var(--text-secondary)]/60 uppercase tracking-widest hover:text-[var(--text-primary)] transition-all"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading === selectedItem.id}
                                className="flex items-center gap-3 px-10 py-4 bg-red-600 text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-red-600/30"
                            >
                                {actionLoading === selectedItem.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Trash2 size={18} />
                                )}
                                Bekräfta radering
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityAdmin;
