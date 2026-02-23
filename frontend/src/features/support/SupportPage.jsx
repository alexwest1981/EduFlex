import React, { useState, useEffect, useMemo } from 'react';
import {
    Send, MessageSquare, History, AlertCircle,
    Search, Play, Shield, Zap, Globe,
    BookOpen, Video, ChevronRight, ExternalLink,
    Clock, CheckCircle, Info, Users
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
        <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-16 animate-in fade-in duration-700">
            {/* --- PREMIUM HERO SECTION --- */}
            <header className="relative py-20 px-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/10 blur-[100px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-brand-teal text-xs font-black uppercase tracking-[0.2em]">
                        <div className="w-2 h-2 bg-brand-teal rounded-full animate-ping"></div>
                        EduFlex Help Center 2.0
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
                        Hur kan vi <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-blue">hjälpa dig</span> idag?
                    </h1>
                    <p className="text-slate-300 text-xl font-medium max-w-xl leading-relaxed">
                        Sök i vår kunskapsbank, titta på guider eller kontakta våra experter för personlig assistans.
                    </p>

                    <div className="pt-6 flex items-center gap-3">
                        <div className="relative flex-grow max-w-xl group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6 group-focus-within:text-brand-teal transition-colors" />
                            <input
                                type="text"
                                placeholder="Sök efter svar (t.ex. GDPR, LTI, AI)..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (view !== 'knowledge') setView('knowledge');
                                }}
                                className="w-full bg-white/10 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-white placeholder:text-slate-600 focus:ring-4 focus:ring-brand-teal/20 focus:bg-white/15 transition-all outline-none font-bold text-lg shadow-2xl backdrop-blur-xl"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* --- NAVIGATION & MAIN CONTENT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-8">
                    <nav className="flex items-center gap-3 p-2 bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-x-auto no-scrollbar shadow-xl">
                        {[
                            { id: 'knowledge', label: 'Kunskapsbank', icon: <BookOpen className="w-4 h-4" /> },
                            { id: 'videos', label: 'Video-guider', icon: <Video className="w-4 h-4" /> },
                            { id: 'new', label: 'Skapa Ärende', icon: <Send className="w-4 h-4" /> },
                            { id: 'history', label: 'Mina Ärenden', icon: <History className="w-4 h-4" /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${view === tab.id
                                    ? 'bg-gradient-to-r from-brand-teal to-brand-emerald text-slate-900 shadow-xl shadow-brand-teal/20 scale-[1.02]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* MAIN CONTENT AREA */}
                    <div className="min-h-[500px]">
                        {view === 'knowledge' && (
                            <div className="grid grid-cols-1 gap-5 animate-in slide-in-from-bottom-4 duration-500">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, idx) => (
                                        <div key={idx} className="bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-3xl p-8 hover:bg-slate-50 dark:hover:bg-white/[0.08] hover:border-brand-teal/40 hover:-translate-y-1 transition-all duration-300 group cursor-default shadow-md hover:shadow-xl">
                                            <div className="flex items-start gap-6">
                                                <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-brand-teal group-hover:bg-brand-teal group-hover:text-slate-900 transition-all duration-500 shadow-inner">
                                                    {faqCategories.find(c => c.id === faq.category)?.icon || <Info className="w-5 h-5" />}
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-brand-teal transition-colors">
                                                        {faq.q}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-bold">
                                                        {faq.a}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-32 bg-slate-100 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                                        <Search className="w-16 h-16 text-slate-400 dark:text-slate-700 mx-auto mb-6 opacity-40" />
                                        <h3 className="text-slate-900 dark:text-white font-black text-2xl">Inga träffar</h3>
                                        <p className="text-slate-500 font-bold max-w-sm mx-auto">Vi hittade inget för "{searchQuery}". Pröva att söka på t.ex. "Säkerhet" eller "LTI".</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'videos' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                                {videoGuides.map((guide, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-brand-blue/50 hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-2xl">
                                        <div className={`aspect-video ${guide.thumbnail} relative flex items-center justify-center overflow-hidden`}>
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-20 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500">
                                                    <Play className="w-10 h-10 text-slate-900 fill-slate-900 ml-1.5" />
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-xl rounded-xl text-xs font-black text-white border border-white/10">
                                                {guide.duration}
                                            </div>
                                            <Video className="w-16 h-16 text-slate-400 dark:text-white/10 group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className="p-8 space-y-3">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors">
                                                {guide.title}
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-400 font-bold text-sm leading-relaxed">
                                                {guide.desc}
                                            </p>
                                            <div className="pt-4 flex items-center gap-2 text-brand-blue text-xs font-black uppercase tracking-widest">
                                                Visa guide <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {view === 'new' && (
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-teal/5 blur-[80px] rounded-full"></div>
                                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:ring-4 focus:ring-brand-teal/20 transition-all outline-none font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-slate-900 text-white">Välj kategori...</option>
                                                <option value="Tekniskt fel" className="bg-slate-900 text-white">Tekniskt fel</option>
                                                <option value="Fakturering" className="bg-slate-900 text-white">Fakturering</option>
                                                <option value="Säkerhet" className="bg-slate-900 text-white">Säkerhet & GDPR</option>
                                                <option value="Annat" className="bg-slate-900 text-white">Övrigt</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Prioritet</label>
                                            <select
                                                value={formData.severity}
                                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:ring-4 focus:ring-brand-teal/20 transition-all outline-none font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="LOW" className="bg-slate-900 text-white">Låg</option>
                                                <option value="MEDIUM" className="bg-slate-900 text-white">Medium</option>
                                                <option value="HIGH" className="bg-slate-900 text-white">Hög</option>
                                                <option value="CRITICAL" className="bg-slate-900 text-white">Kritisk</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Beskrivning</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:ring-4 focus:ring-brand-teal/20 transition-all outline-none font-bold min-h-[180px] resize-none"
                                            placeholder="Vad kan vi hjälpa dig med? Var så detaljerad som möjligt..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gradient-to-r from-brand-teal to-brand-emerald text-slate-950 font-black py-6 rounded-2xl shadow-2xl shadow-brand-teal/30 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                                    >
                                        {submitting ? 'Skickar...' : 'Skicka ärende'}
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        )}

                        {view === 'history' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {loading ? (
                                    <div className="p-32 flex justify-center"><div className="w-12 h-12 border-4 border-brand-teal border-t-transparent animate-spin rounded-full"></div></div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-32 bg-slate-100 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                                        <History className="w-16 h-16 text-slate-400 dark:text-slate-700 mx-auto mb-6 opacity-40" />
                                        <h3 className="text-slate-900 dark:text-white font-black text-xl">Inga ärenden ännu</h3>
                                        <p className="text-slate-500 font-bold">Dina skickade ärenden kommer att visas här.</p>
                                    </div>
                                ) : (
                                    tickets.map(ticket => (
                                        <div key={ticket.id} className="bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-3xl p-8 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all shadow-md hover:shadow-xl group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Ärende #{ticket.id}</span>
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ticket.status === 'RESOLVED' ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30' : 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                                                            }`}>
                                                            {ticket.status === 'RESOLVED' ? 'Åtgärdad' : 'Hanteras'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">{ticket.category}</h4>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] text-slate-500 font-black uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-slate-600 font-bold">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                                <p className="text-slate-700 dark:text-slate-300 text-base font-bold pl-6 leading-relaxed italic">
                                                    "{ticket.message}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- PREMIUM SIDEBAR --- */}
                <aside className="space-y-8 lg:pt-2">
                    {/* SLA DASHBOARD */}
                    <div className={`relative p-1 rounded-[2.5rem] bg-gradient-to-br ${slaInfo.color} shadow-2xl group overflow-hidden`}>
                        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"></div>
                        <div className="relative bg-white/95 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.4rem] p-8 space-y-8 border border-white/10 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div className={`p-4 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-brand-teal group-hover:scale-110 transition-transform duration-500`}>
                                    {slaInfo.icon}
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Aktiv Nivå</div>
                                    <div className="text-xl font-black text-slate-900 dark:text-white">{slaInfo.name}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Garanterad Svarstid</h3>
                                <div className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white">
                                    <Clock className="w-8 h-8 text-brand-teal" /> {slaInfo.time}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
                                {slaInfo.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-4 text-sm font-black text-slate-700 dark:text-slate-300 leading-tight">
                                        <CheckCircle className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RESOURCE LINKS */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent"></div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-[0.2em]">Resurser</h4>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all group border border-transparent hover:border-slate-300 dark:hover:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">Community Forum</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all group border border-transparent hover:border-slate-300 dark:hover:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">Systemstatus</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_10px_rgba(0,212,170,0.5)]"></div>
                                    <span className="text-[10px] font-black text-brand-emerald uppercase tracking-wider">Online</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* CONTACT CARD */}
                    <div className="bg-brand-teal rounded-[2rem] p-8 text-slate-950 flex flex-col items-center text-center space-y-4 shadow-2xl shadow-brand-teal/20">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <Play className="w-6 h-6 fill-slate-950" />
                        </div>
                        <h3 className="text-xl font-black">Personlig Demo?</h3>
                        <p className="text-sm font-bold opacity-80">Behöver ni mer djupgående hjälp? Boka ett möte med en expert.</p>
                        <button className="w-full bg-slate-950 text-white font-black py-4 rounded-xl hover:scale-105 transition-transform">Boka nu</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SupportPage;
