import React, { useState, useEffect } from 'react';
import {
    Heart, Mail, Clock, CheckCircle2,
    Filter, Search, MessageSquare, Lock,
    ChevronRight, User, Tag, Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const WellbeingInbox = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        try {
            const data = await api.get('/wellbeing/requests/inbox');
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
            await api.patch(`/wellbeing/requests/${id}/status`, { status: newStatus });
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
                                onClick={() => setSelectedRequest(req)}
                                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${selectedRequest?.id === req.id
                                        ? 'bg-brand-teal text-white border-brand-teal shadow-xl shadow-brand-teal/20'
                                        : 'bg-white dark:bg-[#1E1F20] border-slate-100 dark:border-white/5 hover:border-brand-teal/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 dark:bg-white/5 rounded-xl flex items-center justify-center">
                                        <User size={24} className={selectedRequest?.id === req.id ? 'text-white' : 'text-slate-400'} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold truncate max-w-[180px]">
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
                <div className="lg:col-span-7">
                    {selectedRequest ? (
                        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 font-bold">
                                <div className="flex items-center gap-4">
                                    <Tag className="text-brand-teal" size={20} />
                                    {selectedRequest.subject || 'Begäran om kontakt'}
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedRequest.status !== 'CLOSED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedRequest.id, 'CLOSED')}
                                            disabled={statusUpdating}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm transition-all"
                                        >
                                            Avsluta ärende
                                        </button>
                                    )}
                                    {selectedRequest.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedRequest.id, 'ACTIVE')}
                                            disabled={statusUpdating}
                                            className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl text-sm transition-all"
                                        >
                                            Påbörja hantering
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Elev</p>
                                        <p className="font-bold text-slate-700 dark:text-white">{selectedRequest.student.firstName} {selectedRequest.student.lastName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klass</p>
                                        <p className="font-bold text-slate-700 dark:text-white">{selectedRequest.student.classGroup?.name || 'Ej angiven'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datum</p>
                                        <p className="font-bold text-slate-700 dark:text-white">{new Date(selectedRequest.createdAt).toLocaleString('sv-SE')}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-slate-400 border-b border-slate-100 dark:border-white/5 pb-3">
                                        <MessageSquare size={18} />
                                        <span className="text-sm font-bold uppercase tracking-tight">Meddelande</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                                        "{selectedRequest.message}"
                                    </p>
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-4">
                                    <Lock className="text-amber-600" size={20} />
                                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                                        Detta meddelande är personligt och omfattas av lagen om tystnadsplikt. Innehållet får inte arkiveras i pedagogiska system eller spridas utanför legitimerad hälso- och sjukvårdspersonal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-white/30 dark:bg-[#1E1F20]/30 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400">
                            <Mail size={64} className="mb-4 opacity-20" />
                            <p className="font-bold">Välj ett ärende från listan för att läsa meddelandet</p>
                            <p className="text-sm">Endast du och behörig personal har tillgång till denna information.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WellbeingInbox;
