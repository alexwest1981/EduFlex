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
            // Manual sorting placeholder (sort by severity then date)
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
            // Optional: Auto-resolve if user wants? Manual for now.
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
            default: return 'bg-gray-400 text-white';
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LIST SIDE */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Sök ärenden..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${filter === f ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'}`}
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
                            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-gray-100 hover:border-indigo-100'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${getSeverityStyles(ticket.severity)}`}>
                                    {ticket.severity}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-sm font-extrabold text-gray-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{ticket.category}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1 font-medium mt-1">{ticket.message}</p>
                            <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-gray-400 uppercase">
                                <User size={12} /> {ticket.userName}
                            </div>
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="text-center py-10 text-gray-400 font-bold">Inga ärenden hittades.</div>
                    )}
                </div>
            </div>

            {/* DETAIL SIDE */}
            <div className="lg:col-span-2">
                {selectedTicket ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
                        {/* HEADER */}
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${getSeverityStyles(selectedTicket.severity)}`}>
                                            {selectedTicket.severity}
                                        </span>
                                        <span className="text-xs font-black uppercase text-gray-400 tracking-widest bg-white px-2 py-1 rounded border border-gray-100">#T-{selectedTicket.id}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{selectedTicket.category}</h2>
                                </div>
                                <div className="flex gap-2">
                                    {selectedTicket.status !== 'RESOLVED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                                            className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-md shadow-green-100 flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Markera som klar
                                        </button>
                                    )}
                                    {selectedTicket.status === 'RESOLVED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTicket.id, 'OPEN')}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                        >
                                            <Clock size={16} /> Återöppna
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Användare</span>
                                    <span className="text-xs font-bold text-gray-900 truncate flex items-center gap-1"><User size={14} className="text-indigo-500" /> {selectedTicket.userName}</span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Skapad</span>
                                    <span className="text-xs font-bold text-gray-900 truncate flex items-center gap-1"><Clock size={14} className="text-indigo-500" /> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm col-span-2">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Sida vid fel</span>
                                    <span className="text-xs font-bold text-indigo-600 truncate flex items-center gap-1">
                                        <LinkIcon size={14} />
                                        <a href={selectedTicket.contextUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                            {selectedTicket.contextUrl || 'N/A'}
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGE BODY */}
                        <div className="p-8">
                            <div className="mb-8">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-l-4 border-indigo-500 pl-2">Beskrivning</h5>
                                <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-700 font-medium leading-relaxed italic border border-gray-100 shadow-inner">
                                    "{selectedTicket.message}"
                                </div>
                            </div>

                            {/* RESPONSE SECTION */}
                            <div className="border-t border-gray-50 pt-8 mt-8">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MessageCircle size={16} className="text-indigo-600" />
                                    Hantera & Besvara
                                </h5>

                                {selectedTicket.adminResponse && (
                                    <div className="mb-6 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                                        <span className="text-[10px] font-black text-indigo-500 uppercase block mb-1">Tidigare svar</span>
                                        <p className="text-xs font-bold text-indigo-900 leading-relaxed">{selectedTicket.adminResponse}</p>
                                    </div>
                                )}

                                <form onSubmit={handleRespond} className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <textarea
                                                value={adminResponse}
                                                onChange={(e) => setAdminResponse(e.target.value)}
                                                placeholder="Skriv ett svar till användaren..."
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 font-medium min-h-[120px] transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="w-48 space-y-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase block pl-1">Ändra svårighetsgrad</span>
                                            <select
                                                value={newSeverity || selectedTicket.severity}
                                                onChange={(e) => setNewSeverity(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-xl text-xs font-black uppercase px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="LOW">Låg (Grön)</option>
                                                <option value="MEDIUM">Medium (Gul)</option>
                                                <option value="HIGH">Hög (Orange)</option>
                                                <option value="CRITICAL">Kritisk (Röd)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!adminResponse}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                                    >
                                        Skicka svar & uppdatera
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <BadgeAlert size={64} className="text-gray-200 mb-4" />
                        <h3 className="text-gray-400 font-black uppercase tracking-widest">Välj ett ärende för att hantera det</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTicketManager;
