import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, History, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const SupportPage = ({ currentUser }) => {
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('new'); // 'new' or 'history'

    const [formData, setFormData] = useState({
        category: '',
        message: '',
        severity: 'MEDIUM'
    });

    const categories = [
        "Tekniskt fel",
        "Fel i kursinnehåll",
        "Inloggningsproblem",
        "Funktionsförslag",
        "Allmän feedback",
        "Säkerhetsfråga",
        "Fakturering & Prenumeration",
        "Problem med användarprofil",
        "Systemet är långsamt",
        "Problem i mobilappen",
        "Fråga om tillgänglighet",
        "Integritet & GDPR",
        "Fel i gamification",
        "Saknad behörighet",
        "Övrigt"
    ];

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const fetchMyTickets = async () => {
        try {
            const data = await api.support.getMyTickets(currentUser.id);
            setTickets(data);
        } catch (e) {
            console.error("Kunde inte hämta ärenden", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category || !formData.message) {
            toast.error("Vänligen fyll i alla fält");
            return;
        }

        setSubmitting(true);
        try {
            await api.support.createTicket({
                ...formData,
                userId: currentUser.id,
                contextUrl: window.location.origin + window.location.pathname // Fångar var de är
            });
            toast.success("Ditt ärende har skickats!");
            setFormData({ category: '', message: '', severity: 'MEDIUM' });
            fetchMyTickets();
            setView('history');
        } catch (e) {
            toast.error("Kunde inte skicka ärendet");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'RESOLVED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold ring-1 ring-green-200">Åtgärdad</span>;
            case 'IN_PROGRESS': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-200">Under behandling</span>;
            default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold ring-1 ring-yellow-200">Öppen</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Support & Kontakt</h1>
                <p className="text-gray-500 mt-2">Vi finns här för att hjälpa dig. Skicka ett ärende så återkommer vi så snart som möjligt.</p>
            </header>

            {/* TAB NAVIGATION */}
            <div className="flex gap-4 mb-8 border-b border-gray-100 pb-1">
                <button
                    onClick={() => setView('new')}
                    className={`pb-3 px-2 text-sm font-bold transition-all ${view === 'new' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Skapa nytt ärende
                </button>
                <button
                    onClick={() => setView('history')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative ${view === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Mina tidigare ärenden
                    {tickets.filter(t => t.status === 'OPEN').length > 0 && (
                        <span className="ml-2 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase">
                            {tickets.filter(t => t.status === 'OPEN').length} aktiva
                        </span>
                    )}
                </button>
            </div>

            {view === 'new' ? (
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/20 border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Vad gäller det?</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                >
                                    <option value="">Välj kategori...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Prioritet (valfritt)</label>
                                <select
                                    value={formData.severity}
                                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                >
                                    <option value="LOW">Låg - Allmän fråga / Förslag</option>
                                    <option value="MEDIUM">Medium - Något fungerar inte som det ska</option>
                                    <option value="HIGH">Hög - Viktig funktion är trasig</option>
                                    <option value="CRITICAL">Kritisk - Systemet går ej att använda</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Meddelande</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Beskriv ditt problem eller din fråga så detaljerat som möjligt..."
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[160px]"
                            />
                        </div>

                        <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                                <AlertCircle size={20} />
                            </div>
                            <div className="text-xs text-indigo-700 leading-relaxed font-medium">
                                <strong>Notera:</strong> Vi sparar din nuvarande plats i systemet ({window.location.pathname}) för att snabbare kunna hjälpa dig hitta felet. Ingen känslig privat information sparas utanför ditt konto.
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full bg-indigo-600 text-white rounded-2xl py-4 font-extrabold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group ${submitting ? 'opacity-50' : ''}`}
                        >
                            {submitting ? 'Skickar...' : 'Skicka ärende'}
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <History size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold">Du har inga tidigare ärenden.</p>
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">#T-{ticket.id}</span>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                        <h3 className="font-extrabold text-gray-900">{ticket.category}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium bg-gray-50 p-4 rounded-xl italic">
                                    "{ticket.message}"
                                </p>

                                {ticket.adminResponse && (
                                    <div className="mt-4 border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black">A</div>
                                            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Svar från Admin</span>
                                            {ticket.resolvedAt && (
                                                <span className="text-[10px] text-gray-400 font-medium ml-auto">Åtgärdad {new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <div className="bg-indigo-50/50 rounded-xl p-4 text-sm text-indigo-900 font-bold leading-relaxed">
                                            {ticket.adminResponse}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SupportPage;
