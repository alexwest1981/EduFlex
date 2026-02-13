import React, { useState, useEffect } from 'react';
import {
    Heart, Mail, Clock, CheckCircle2,
    Filter, Search, MessageSquare, Lock,
    ChevronRight, User, Tag, Calendar, Send
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const WellbeingInbox = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [reply, setReply] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        try {
            const data = await api.support.getWellbeingInbox();
            setRequests(data);
        } catch (e) {
            toast.error("Kunde inte hämta inboxen.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setStatusUpdating(true);
        try {
            await api.support.updateWellbeingStatus(id, newStatus);
            toast.success("Status uppdaterad.");
            fetchInbox();
            if (selectedRequest?.id === id) {
                setSelectedRequest({ ...selectedRequest, status: newStatus });
            }
        } catch (e) {
            toast.error("Kunde inte uppdatera status.");
        } finally {
            setStatusUpdating(false);
        }
    };

    const fetchMessages = async (requestId) => {
        setLoadingMessages(true);
        try {
            const data = await api.support.getWellbeingMessages(requestId);
            setMessages(data);
        } catch (e) {
            toast.error("Kunde inte hämta meddelanden.");
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setSendingReply(true);
        try {
            await api.support.sendWellbeingMessage(selectedRequest.id, reply);
            setReply('');
            fetchMessages(selectedRequest.id);
            // Re-fetch inbox to see updated status/assignments if any
            fetchInbox();
        } catch (e) {
            toast.error("Kunde inte skicka svar.");
        } finally {
            setSendingReply(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-teal text-white rounded-2xl shadow-lg shadow-brand-teal/20">
                        <Mail />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">E-hälsa Inbox</h1>
                        <p className="text-sm text-slate-500 font-medium">Hantera inkommande kontaktförfrågningar från elever</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Sök ärende..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-brand-teal transition-all outline-none"
                        />
                    </div>
                    <button className="p-2 bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-white/5 rounded-xl text-slate-500 hover:text-brand-teal transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List */}
                <div className="lg:col-span-5 space-y-4">
                    {requests.length === 0 ? (
                        <div className="bg-white/50 dark:bg-[#1E1F20]/50 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-white/10">
                            <CheckCircle2 className="mx-auto mb-4 text-green-500" size={48} />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Inboxen är tom! Alla ärenden är hanterade.</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <button
                                key={req.id}
                                onClick={() => {
                                    setSelectedRequest(req);
                                    fetchMessages(req.id);
                                }}
                                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${selectedRequest?.id === req.id
                                    ? 'bg-brand-teal text-white border-brand-teal shadow-xl shadow-brand-teal/20'
                                    : 'bg-white dark:bg-[#1E1F20] border-slate-100 dark:border-white/5 hover:border-brand-teal/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 dark:bg-white/5 rounded-xl flex items-center justify-center">
                                        <User size={24} className={selectedRequest?.id === req.id ? 'text-white' : 'text-slate-400'} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold truncate">
                                            {req.student.firstName} {req.student.lastName}
                                        </h4>
                                        <p className={`text-xs ${selectedRequest?.id === req.id ? 'text-white/70' : 'text-slate-400'} font-medium`}>
                                            {req.type} • {new Date(req.createdAt).toLocaleDateString('sv-SE')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${req.status === 'PENDING'
                                        ? (selectedRequest?.id === req.id ? 'bg-white/20' : 'bg-amber-100 text-amber-700')
                                        : (selectedRequest?.id === req.id ? 'bg-white/20' : 'bg-blue-100 text-blue-700')
                                        }`}>
                                        {req.status === 'PENDING' ? 'Nytt' : 'Pågår'}
                                    </span>
                                    <ChevronRight size={18} className={selectedRequest?.id === req.id ? 'text-white' : 'text-slate-300'} />
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Detail View */}
                <div className="lg:col-span-7 h-full">
                    {selectedRequest ? (
                        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl flex flex-col h-[700px] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 shrink-0">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-3">
                                        <Tag className="text-brand-teal" size={20} />
                                        {selectedRequest.subject || 'Begäran om kontakt'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">Elev: {selectedRequest.student.firstName} {selectedRequest.student.lastName}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedRequest.status !== 'CLOSED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedRequest.id, 'CLOSED')}
                                            disabled={statusUpdating}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 transition-all"
                                        >
                                            Avsluta
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Conversation Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-black/10">
                                {/* Student Info & Initial Message */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-white/5">
                                            <div className="p-2 bg-brand-teal/10 text-brand-teal rounded-lg">
                                                <User size={16} />
                                            </div>
                                            <span className="text-sm font-bold">Beskrivning från elev</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                                            "{selectedRequest.message}"
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-3 text-right">
                                            Skapad: {new Date(selectedRequest.createdAt).toLocaleString('sv-SE')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {loadingMessages ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
                                        </div>
                                    ) : (
                                        messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.sender.id !== selectedRequest.student.id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${msg.sender.id !== selectedRequest.student.id
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-white/5 text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-white/5'}`}>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="text-[10px] font-bold opacity-80">
                                                            {msg.sender.id !== selectedRequest.student.id ? 'Personal' : 'Elev'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    <p className={`text-[10px] mt-2 opacity-70 ${msg.sender.id !== selectedRequest.student.id ? 'text-right' : 'text-left'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Reply Form */}
                            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#1E1F20] shrink-0">
                                <form onSubmit={handleSendReply} className="flex gap-4">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Skriv ett svar till eleven..."
                                        rows={1}
                                        className="flex-1 bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-teal transition-all resize-none overflow-hidden"
                                        style={{ minHeight: '56px' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!reply.trim() || sendingReply}
                                        className="h-14 px-8 bg-brand-teal text-white rounded-2xl font-bold shadow-lg shadow-brand-teal/20 hover:bg-brand-teal-dark disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        <Send className={sendingReply ? 'animate-spin' : ''} size={20} />
                                        <span>Svara</span>
                                    </button>
                                </form>
                                <div className="mt-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
                                    <Lock size={14} />
                                    <p className="text-[10px] font-medium leading-none">
                                        Meddelandet krypteras automatiskt innan det skickas till eleven.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-white/30 dark:bg-[#1E1F20]/30 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400">
                            <Mail size={80} className="mb-6 opacity-10" />
                            <h3 className="text-xl font-bold text-slate-500 dark:text-slate-300">Välj ett ärende</h3>
                            <p className="text-center mt-2 max-w-xs">Förhandsvisningen visas här när du väljer ett ärende från listan till vänster.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WellbeingInbox;
