import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, MessageCircle, AlertTriangle,
    Filter, ArrowUpDown, ChevronDown, ChevronUp, Clock,
    Search, User, Link as LinkIcon, BadgeAlert
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AdminTicketManager = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'
    const [search, setSearch] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [newSeverity, setNewSeverity] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await api.support.getAllTickets();
            const sorted = data.sort((a, b) => {
                const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
                const aOrder = severityOrder[a.severity] ?? 99;
                const bOrder = severityOrder[b.severity] ?? 99;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setTickets(sorted);
        } catch (e) {
            toast.error("Kunde inte hämta ärenden");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.support.updateStatus(id, status);
            toast.success(`Status uppdaterad till ${status}`);
            fetchTickets();
            if (selectedTicket?.id === id) {
                setSelectedTicket(prev => ({ ...prev, status }));
            }
        } catch (e) {
            toast.error("Kunde inte uppdatera status");
        }
    };

    const handleRespond = async (e) => {
        e.preventDefault();
        if (!adminResponse) return;

        try {
            await api.support.respond(selectedTicket.id, adminResponse, newSeverity || selectedTicket.severity);
            toast.success("Svar skickat!");
            setAdminResponse('');
            setNewSeverity('');
            fetchTickets();
        } catch (e) {
            toast.error("Kunde inte skicka svar");
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesFilter = filter === 'ALL' || t.status === filter;
        const searchLower = search.toLowerCase();
        const matchesSearch =
            t.message.toLowerCase().includes(searchLower) ||
            t.userName.toLowerCase().includes(searchLower) ||
            t.category.toLowerCase().includes(searchLower);
        return matchesFilter && matchesSearch;
    });

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500 text-white';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'MEDIUM': return 'bg-yellow-400 text-gray-900';
            case 'LOW': return 'bg-green-500 text-white';
            default: return 'bg-white/10 text-[var(--text-secondary)]';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em]">Hämtar ärenden...</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LIST SIDE */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/50" size={18} />
                        <input
                            type="text"
                            placeholder="Sök ärenden..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-[var(--border-main)] rounded-2xl text-sm focus:ring-1 focus:ring-brand-blue transition-all font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${filter === f ? 'bg-brand-blue border-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'bg-white/5 border-white/5 text-[var(--text-secondary)] hover:border-brand-blue/30'}`}
                            >
                                {f === 'ALL' ? 'Alla' : f === 'OPEN' ? 'Öppna' : f === 'IN_PROGRESS' ? 'Pågår' : 'Klart'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${selectedTicket?.id === ticket.id ? 'bg-brand-blue/5 border-brand-blue/30 shadow-2xl' : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-brand-blue/20 active:scale-[0.98]'}`}
                        >
                            {selectedTicket?.id === ticket.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue"></div>}
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-lg ${getSeverityStyles(ticket.severity)}`}>
                                    {ticket.severity}
                                </span>
                                <span className="text-[9px] text-[var(--text-secondary)]/50 font-black uppercase tracking-tighter">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xs font-black text-[var(--text-primary)] truncate transition-colors uppercase tracking-widest">{ticket.category}</h4>
                            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 font-bold mt-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{ticket.message}</p>
                            <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.1em]">
                                <User size={12} className="text-brand-blue/50" /> {ticket.userName}
                            </div>
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-main)]">
                            <BadgeAlert size={40} className="mx-auto text-[var(--text-secondary)]/20 mb-4" />
                            <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px]">Inga ärenden hittades</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAIL SIDE */}
            <div className="lg:col-span-2">
                {selectedTicket ? (
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl overflow-hidden animate-in slide-in-from-right-4 duration-500 group/detail relative">
                        {/* DECORATION */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                        {/* HEADER */}
                        <div className="p-10 border-b border-[var(--border-main)] bg-white/[0.02] relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-xl ${getSeverityStyles(selectedTicket.severity)}`}>
                                            {selectedTicket.severity}
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]/40 tracking-[0.25em] bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">#T-{selectedTicket.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">{selectedTicket.category}</h2>
                                </div>
                                <div className="flex gap-3">
                                    {selectedTicket.status !== 'RESOLVED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                                            className="px-6 py-3 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-green-500/20 flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Markera som klar
                                        </button>
                                    )}
                                    {selectedTicket.status === 'RESOLVED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTicket.id, 'OPEN')}
                                            className="px-6 py-3 bg-white/5 text-[var(--text-secondary)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                                        >
                                            <Clock size={18} /> Återöppna
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                                    <span className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase mb-2 tracking-widest">Användare</span>
                                    <span className="text-xs font-black text-[var(--text-primary)] truncate flex items-center gap-2 tracking-tight"><User size={14} className="text-brand-blue" /> {selectedTicket.userName}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                                    <span className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase mb-2 tracking-widest">Skapad</span>
                                    <span className="text-xs font-black text-[var(--text-primary)] truncate flex items-center gap-2 tracking-tight"><Clock size={14} className="text-brand-blue" /> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner col-span-2 group/link cursor-pointer hover:bg-white/[0.07] transition-all">
                                    <span className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase mb-2 tracking-widest">Sida vid fel</span>
                                    <span className="text-xs font-black text-brand-blue truncate flex items-center gap-2 tracking-tight">
                                        <LinkIcon size={14} />
                                        <a href={selectedTicket.contextUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                            {selectedTicket.contextUrl || 'N/A'}
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGE BODY */}
                        <div className="p-10 relative z-10">
                            <div className="mb-10">
                                <h5 className="text-[10px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                    <div className="w-8 h-[2px] bg-brand-blue/30"></div>
                                    Beskrivning
                                </h5>
                                <div className="bg-white/[0.03] rounded-3xl p-8 text-sm text-[var(--text-primary)] font-bold italic leading-relaxed border border-white/[0.03] shadow-inner backdrop-blur-sm">
                                    "{selectedTicket.message}"
                                </div>
                            </div>

                            {/* RESPONSE SECTION */}
                            <div className="border-t border-[var(--border-main)] pt-10 mt-10">
                                <h5 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                    <MessageCircle size={18} className="text-brand-blue" />
                                    Hantera & Besvara
                                </h5>

                                {selectedTicket.adminResponse && (
                                    <div className="mb-8 bg-brand-blue/5 rounded-[2rem] p-6 border border-brand-blue/10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-2xl rounded-full -mr-16 -mt-16"></div>
                                        <span className="text-[9px] font-black text-brand-blue uppercase block mb-3 tracking-widest relative z-10">Tidigare svar</span>
                                        <p className="text-xs font-black text-[var(--text-primary)] leading-relaxed relative z-10">{selectedTicket.adminResponse}</p>
                                    </div>
                                )}

                                <form onSubmit={handleRespond} className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <textarea
                                                value={adminResponse}
                                                onChange={(e) => setAdminResponse(e.target.value)}
                                                placeholder="Skriv ett svar till användaren..."
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-6 py-6 text-sm focus:ring-1 focus:ring-brand-blue font-bold min-h-[160px] transition-all shadow-inner text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/20"
                                            />
                                        </div>
                                        <div className="md:w-64 space-y-4">
                                            <span className="text-[9px] font-black text-[var(--text-secondary)]/40 uppercase block pl-1 tracking-[0.2em]">Sätt prioritering</span>
                                            <select
                                                value={newSeverity || selectedTicket.severity}
                                                onChange={(e) => setNewSeverity(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black uppercase px-4 py-3 focus:ring-1 focus:ring-brand-blue transition-all appearance-none cursor-pointer text-[var(--text-primary)] shadow-inner"
                                            >
                                                <option value="LOW" className="bg-[#000000]">Låg (Grön)</option>
                                                <option value="MEDIUM" className="bg-[#000000]">Medium (Gul)</option>
                                                <option value="HIGH" className="bg-[#000000]">Hög (Orange)</option>
                                                <option value="CRITICAL" className="bg-[#000000]">Kritisk (Röd)</option>
                                            </select>

                                            <div className="pt-4 p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10">
                                                <p className="text-[9px] font-bold text-[var(--text-secondary)] leading-tight opacity-60">
                                                    Användaren meddelas automatiskt via e-post och systemnotis när du skickar svaret.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!adminResponse}
                                            className="bg-brand-blue text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-2xl shadow-brand-blue/30 disabled:opacity-50 disabled:scale-100 group/btn relative overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                Skicka svar & uppdatera <ArrowUpDown size={14} className="group-hover/btn:translate-y-[-2px] transition-transform" />
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-20 bg-[var(--bg-card)] rounded-[3rem] border border-dashed border-[var(--border-main)] group relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-blue/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 group-hover:bg-brand-blue/10 group-hover:border-brand-blue/20 transition-all duration-500 shadow-inner">
                                <BadgeAlert size={48} className="text-[var(--text-secondary)]/20 group-hover:text-brand-blue transition-colors duration-500" />
                            </div>
                            <h3 className="text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] text-xs text-center opacity-40 group-hover:opacity-100 transition-opacity duration-500">Välj ett ärende för att hantera det</h3>
                            <div className="mt-8 flex gap-3 opacity-20 group-hover:opacity-100 transition-all duration-700 delay-100">
                                <div className="h-1.5 w-1.5 bg-brand-blue rounded-full pulse"></div>
                                <div className="h-1.5 w-1.5 bg-brand-blue rounded-full pulse delay-75"></div>
                                <div className="h-1.5 w-1.5 bg-brand-blue rounded-full pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTicketManager;
