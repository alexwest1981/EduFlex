import React, { useState, useEffect, useMemo } from 'react';
import {
    Send, MessageSquare, History, AlertCircle,
    Search, Play, Shield, Zap, Globe,
    BookOpen, Video, ChevronRight, ExternalLink,
    Clock, CheckCircle, Info
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SupportPage = () => {
    const { currentUser, licenseTier } = useAppContext();
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('knowledge'); // 'knowledge', 'videos', 'new', 'history'
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        category: '',
        message: '',
        severity: 'MEDIUM'
    });

    const faqCategories = [
        { id: 'system', name: 'System & Inloggning', icon: <Globe className="w-4 h-4" /> },
        { id: 'pedagogy', name: 'Pedagogik & Kurser', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'ai', name: 'EduAI & Innovation', icon: <Zap className="w-4 h-4" /> },
        { id: 'security', name: 'Säkerhet & GDPR', icon: <Shield className="w-4 h-4" /> }
    ];

    const faqs = [
        {
            category: 'security',
            q: "Hur hanterar EduFlex GDPR och datalagring?",
            a: "EduFlex är byggt för svenska myndighetskrav. All data lagras lokalt eller via MinIO i er egen infrastruktur. Vi använder kryptering (AES-256) för känsliga personuppgifter som personnummer och adresser."
        },
        {
            category: 'system',
            q: "Vilka lärplattformar kan EduFlex integreras med?",
            a: "Vi har fullt stöd för LTI 1.3 (Advantage), vilket möjliggör sömlös integration med Canvas, itslearning och Moodle. Vi stödjer även Google Classroom och Microsoft Teams."
        },
        {
            category: 'pedagogy',
            q: "Hur fungerar spelifiering (Gamification) för eleverna?",
            a: "Elever tjänar XP och märken genom att vara aktiva. Som admin kan du styra exakt vilka funktioner som ska vara aktiva (t.ex. Ligor, Streaks eller Achievements) via Gamification-panelen."
        },
        {
            category: 'system',
            q: "Vad ingår i vår support-SLA?",
            a: "För Pilot-kunder erbjuder vi prioriterad support via chat och e-post med en svarsgaranti inom 4 arbetstimmar för kritiska fel."
        },
        {
            category: 'ai',
            q: "Hur krediteras AI-credits för PRO-användare?",
            a: "PRO-konton får automatiskt 1000 credits vid första användning. Dessa förnyas enligt ert avtal. Enterprise-konton har obegränsad tillgång."
        }
    ];

    const videoGuides = [
        {
            title: "Kom igång med EduFlex",
            duration: "3:45",
            thumbnail: "bg-brand-teal/20",
            desc: "En snabb genomgång av dashboarden och de viktigaste funktionerna."
        },
        {
            title: "Skapa din första AI-kurs",
            duration: "5:20",
            thumbnail: "bg-brand-blue/20",
            desc: "Lär dig hur du använder AI Quiz Generator och Indexering."
        },
        {
            title: "Integration med LTI 1.3",
            duration: "8:10",
            thumbnail: "bg-purple-500/20",
            desc: "Teknisk guide för att koppla ihop EduFlex med Canvas/Moodle."
        }
    ];

    useEffect(() => {
        if (currentUser) {
            fetchMyTickets();
        }
    }, [currentUser]);

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

    const filteredFaqs = useMemo(() => {
        if (!searchQuery) return faqs;
        const lowQuery = searchQuery.toLowerCase();
        return faqs.filter(f =>
            f.q.toLowerCase().includes(lowQuery) ||
            f.a.toLowerCase().includes(lowQuery)
        );
    }, [searchQuery]);

    const slaInfo = useMemo(() => {
        const tier = licenseTier || 'BASIC';
        switch (tier) {
            case 'ENTERPRISE':
                return {
                    name: 'Enterprise Support',
                    time: 'Direkt / < 1h',
                    features: ['Personlig Case Manager', 'Obegränsad Chat', 'On-prem assistans'],
                    color: 'from-brand-teal to-brand-emerald',
                    icon: <Shield className="w-8 h-8" />
                };
            case 'PRO':
                return {
                    name: 'Priority Support',
                    time: 'Inom 4h',
                    features: ['Prioriterad kö', 'E-post & Chat', 'Månadsvis uppföljning'],
                    color: 'from-brand-blue to-indigo-500',
                    icon: <Zap className="w-8 h-8" />
                };
            default:
                return {
                    name: 'Standard Support',
                    time: 'Inom 24h',
                    features: ['FAQ & Knowledge Base', 'E-post support', 'Community Forum'],
                    color: 'from-slate-600 to-slate-800',
                    icon: <Info className="w-8 h-8" />
                };
        }
    }, [licenseTier]);

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
                contextUrl: window.location.origin + window.location.pathname
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

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-12 animate-in fade-in duration-500">
            {/* --- PREMIUM HERO SECTION --- */}
            <header className="relative py-12 px-8 rounded-[2rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/10 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-wider">
                        <MessageSquare className="w-3 h-3" /> EduFlex Help Center
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Hur kan vi hjälpa dig idag?</h1>
                    <p className="text-slate-400 text-lg font-medium">Sök i vår kunskapsbank, titta på guider eller kontakta våra experter.</p>

                    <div className="pt-4 flex items-center gap-3">
                        <div className="relative flex-grow max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Sök efter svar (t.ex. GDPR, LTI, AI)..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (view !== 'knowledge') setView('knowledge');
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all outline-none font-medium"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* --- NAVIGATION & SLA --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <nav className="flex items-center gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-2xl overflow-x-auto no-scrollbar">
                        {[
                            { id: 'knowledge', label: 'Kunskapsbank', icon: <BookOpen className="w-4 h-4" /> },
                            { id: 'videos', label: 'Video-guider', icon: <Video className="w-4 h-4" /> },
                            { id: 'new', label: 'Skapa Ärende', icon: <Send className="w-4 h-4" /> },
                            { id: 'history', label: 'Mina Ärenden', icon: <History className="w-4 h-4" /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${view === tab.id
                                        ? 'bg-brand-teal text-slate-900 shadow-lg shadow-brand-teal/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* MAIN CONTENT AREA */}
                    <div className="min-h-[400px]">
                        {view === 'knowledge' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, idx) => (
                                        <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 hover:border-brand-teal/30 transition-colors group">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-slate-800 rounded-lg text-brand-teal group-hover:scale-110 transition-transform">
                                                    {faqCategories.find(c => c.id === faq.category)?.icon || <Info className="w-4 h-4" />}
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold text-white leading-snug">{faq.q}</h3>
                                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{faq.a}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                                        <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <h3 className="text-white font-bold text-xl">Inga träffar</h3>
                                        <p className="text-slate-500">Vi kunde inte hitta något svar på "{searchQuery}". Testa ett annat ord eller kontakta support.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'videos' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2">
                                {videoGuides.map((guide, idx) => (
                                    <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden group border hover:border-brand-blue/30 transition-all">
                                        <div className={`aspect-video ${guide.thumbnail} relative flex items-center justify-center`}>
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                                                    <Play className="w-8 h-8 text-slate-900 fill-slate-900 ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-black text-white">
                                                {guide.duration}
                                            </div>
                                            <Video className="w-12 h-12 text-white/20" />
                                        </div>
                                        <div className="p-6 space-y-2">
                                            <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors">{guide.title}</h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">{guide.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {view === 'new' && (
                            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 animate-in slide-in-from-bottom-2">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Kategori</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-brand-teal transition-all outline-none font-medium appearance-none"
                                            >
                                                <option value="" className="bg-slate-900 text-white">Välj kategori...</option>
                                                <option value="Tekniskt fel" className="bg-slate-900 text-white">Tekniskt fel</option>
                                                <option value="Fakturering" className="bg-slate-900 text-white">Fakturering</option>
                                                <option value="Säkerhet" className="bg-slate-900 text-white">Säkerhet & GDPR</option>
                                                <option value="Annat" className="bg-slate-900 text-white">Övrigt</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Prioritet</label>
                                            <select
                                                value={formData.severity}
                                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-brand-teal transition-all outline-none font-medium appearance-none"
                                            >
                                                <option value="LOW" className="bg-slate-900 text-white">Låg</option>
                                                <option value="MEDIUM" className="bg-slate-900 text-white">Medium</option>
                                                <option value="HIGH" className="bg-slate-900 text-white">Hög</option>
                                                <option value="CRITICAL" className="bg-slate-900 text-white">Kritisk</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Beskrivning</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-brand-teal transition-all outline-none font-medium min-h-[150px]"
                                            placeholder="Vad kan vi hjälpa dig med?"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-brand-teal text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-brand-teal/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {submitting ? 'Skickar...' : 'Skicka ärende'}
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        )}

                        {view === 'history' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                {loading ? (
                                    <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-brand-teal border-t-transparent animate-spin rounded-full"></div></div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                                        <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <h3 className="text-white font-bold">Inga ärenden ännu</h3>
                                    </div>
                                ) : (
                                    tickets.map(ticket => (
                                        <div key={ticket.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase">#{ticket.id}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ticket.status === 'RESOLVED' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-gold/10 text-brand-gold'
                                                            }`}>
                                                            {ticket.status === 'RESOLVED' ? 'Klar' : 'Pågående'}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-white">{ticket.category}</h4>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 font-medium bg-white/5 p-4 rounded-xl italic">"{ticket.message}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SLA DASHBOARD (SIDEBAR) --- */}
                <aside className="space-y-6">
                    <div className={`bg-gradient-to-br ${slaInfo.color} p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            {slaInfo.icon}
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Din Supportnivå</h3>
                        <div className="text-3xl font-black mb-1">{slaInfo.name}</div>
                        <div className="text-sm opacity-90 font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Svarstid: {slaInfo.time}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-white/20">
                            {slaInfo.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs font-bold leading-tight">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {f}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-4">
                        <h4 className="font-black text-white text-sm uppercase tracking-widest">Resurser</h4>
                        <div className="space-y-2">
                            <a href="#" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                                <span className="text-sm font-bold text-slate-300">Community Forum</span>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-brand-teal transition-colors" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                                <span className="text-sm font-bold text-slate-300">Systemstatus</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-brand-emerald uppercase">Online</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SupportPage;
