import React, { useState, useEffect } from 'react';
import {
    Heart, ShieldAlert, Send, Clock,
    CheckCircle2, AlertCircle, MessageCircle,
    Lock, Info, ChevronRight, Plus, Thermometer,
    Calendar, XCircle, FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const WellbeingCenter = () => {
    const { currentUser } = useAppContext();
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('support'); // 'support' or 'sickleave'
    const [loading, setLoading] = useState(true); // Added missing loading state
    const [showForm, setShowForm] = useState(false); // Added missing showForm state
    const [agreedToConfidentiality, setAgreedToConfidentiality] = useState(false); // Added missing state

    // Support Form State
    const [formData, setFormData] = useState({
        type: 'CURATOR',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Sick Leave State
    const [activeSickLeave, setActiveSickLeave] = useState(null);
    const [sickLeaveHistory, setSickLeaveHistory] = useState([]);
    const [sickLeaveLoading, setSickLeaveLoading] = useState(false);
    const [sickLeaveForm, setSickLeaveForm] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        reason: ''
    });
    const [sickLeaveSubmitting, setSickLeaveSubmitting] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchRequests(),
                fetchSickLeaveData()
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const data = await api.get('/wellbeing/requests/my');
            setRequests(data);
        } catch (e) {
            console.error("Failed to fetch requests", e);
        }
    };

    const fetchSickLeaveData = async () => {
        try {
            // Reusing existing API structure if available, else standard routes
            const active = await api.sickLeave.getActive();
            const history = await api.sickLeave.getMy();
            setActiveSickLeave(active);
            setSickLeaveHistory(history || []);
        } catch (err) {
            console.error('Failed to load sick leave data', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreedToConfidentiality) {
            toast.error("Du måste godkänna tystnadsplikten först.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/wellbeing/requests', {
                ...formData,
                confidentialityAgreed: true
            });
            toast.success("Din begäran har skickats!");
            setShowForm(false);
            setFormData({ type: 'CURATOR', subject: '', message: '' });
            fetchRequests();
        } catch (e) {
            toast.error("Kunde inte skicka begäran. Försök igen senare.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSickLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!sickLeaveForm.startDate) {
            toast.error('Ange ett startdatum');
            return;
        }
        setSickLeaveSubmitting(true);
        try {
            await api.sickLeave.report({
                startDate: sickLeaveForm.startDate,
                endDate: sickLeaveForm.endDate || null,
                reason: sickLeaveForm.reason || null,
            });
            toast.success('Sjukanmälan registrerad');
            setSickLeaveForm({
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                reason: ''
            });
            fetchSickLeaveData();
        } catch (err) {
            toast.error('Kunde inte registrera sjukanmälan');
        } finally {
            setSickLeaveSubmitting(false);
        }
    };

    const handleCancelSickLeave = async () => {
        if (!activeSickLeave) return;
        if (!window.confirm('Vill du avbryta din sjukanmälan?')) return;
        try {
            await api.sickLeave.cancel(activeSickLeave.id);
            toast.success('Sjukanmälan avbruten');
            fetchSickLeaveData();
        } catch (err) {
            toast.error('Kunde inte avbryta sjukanmälan');
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
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header / Intro */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-teal/20 to-indigo-500/10 dark:from-brand-teal/10 dark:to-indigo-500/5 rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-2xl shadow-brand-teal/5">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm text-brand-teal">
                                <Heart className="fill-current" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                Well-being Center
                            </h1>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
                            Välkommen till din trygga punkt. Här kan du kontakta hälsoteamet under tystnadsplikt eller hantera din sjukfrånvaro.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {activeTab === 'support' && !showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-brand-teal hover:bg-brand-teal-dark text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-brand-teal/20 hover:transform hover:scale-105 transition-all flex items-center gap-3"
                            >
                                <Plus size={20} />
                                Ny kontaktbegäran
                            </button>
                        )}
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-teal/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => { setActiveTab('support'); setShowForm(false); }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'support' ? 'bg-white dark:bg-[#1E1F20] text-brand-teal shadow-md shadow-brand-teal/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <Heart size={18} />
                    Kontakt & Stöd
                </button>
                <button
                    onClick={() => { setActiveTab('sickleave'); setShowForm(false); }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sickleave' ? 'bg-white dark:bg-[#1E1F20] text-rose-500 shadow-md shadow-rose-500/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <Thermometer size={18} />
                    Sjukanmälan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {activeTab === 'support' ? (
                        <>
                            {showForm ? (
                                <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold flex items-center gap-3">
                                                <MessageCircle className="text-brand-teal" />
                                                Ny kontaktbegäran
                                            </h2>
                                            <button
                                                onClick={() => setShowForm(false)}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                Avbryt
                                            </button>
                                        </div>

                                        {/* Tystnadsplikt Warning */}
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl flex items-start gap-4">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                                                <Lock size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-amber-800 dark:text-amber-300">Strikt Tystnadsplikt</p>
                                                <p className="text-sm text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                                                    All kommunikation via Well-being Center omfattas av tystnadsplikt. Dina meddelanden är krypterade och kan endast läsas av dig och legitimerad personal i hälsoteamet.
                                                </p>
                                                <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={agreedToConfidentiality}
                                                        onChange={(e) => setAgreedToConfidentiality(e.target.checked)}
                                                        className="w-5 h-5 rounded border-amber-300 text-brand-teal focus:ring-brand-teal"
                                                    />
                                                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200 group-hover:text-brand-teal transition-colors">
                                                        Jag förstår och önskar gå vidare
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase ml-1">Vem vill du kontakta?</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-[#131314] border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-teal transition-all"
                                                >
                                                    <option value="CURATOR">Skolkurator</option>
                                                    <option value="NURSE">Skolsköterska</option>
                                                    <option value="DOCTOR">Skolläkare</option>
                                                    <option value="OTHER">Hälsoteamet (Allmänt)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase ml-1">Ämne (Frivilligt)</label>
                                                <input
                                                    type="text"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    placeholder="T.ex. Behöver prata, fundering kring hälsa..."
                                                    className="w-full bg-slate-50 dark:bg-[#131314] border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-teal transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase ml-1">Ditt meddelande</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Berätta lite kort om vad du vill ha hjälp med..."
                                                className="w-full bg-slate-50 dark:bg-[#131314] border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-teal transition-all resize-none"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={submitting || !agreedToConfidentiality}
                                                className="bg-brand-teal hover:bg-brand-teal-dark disabled:opacity-50 disabled:grayscale text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-teal/20 transition-all flex items-center gap-2"
                                            >
                                                {submitting ? <Clock className="animate-spin" /> : <Send size={18} />}
                                                Skicka meddelande
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-3 ml-2 text-slate-700 dark:text-slate-300">
                                        <Clock className="text-slate-400" />
                                        Tidigare ärenden
                                    </h3>

                                    {requests.length === 0 ? (
                                        <div className="bg-white/50 dark:bg-[#1E1F20]/50 rounded-3xl p-12 border border-dashed border-slate-200 dark:border-white/10 text-center">
                                            <Info className="mx-auto mb-4 text-slate-300" size={48} />
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Du har inga tidigare kontaktförfrågningar.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {requests.map(req => (
                                                <div key={req.id} className="bg-white dark:bg-[#1E1F20] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl ${req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                                                            req.status === 'ACTIVE' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                                                                'bg-green-100 dark:bg-green-900/20 text-green-600'
                                                            }`}>
                                                            {req.status === 'PENDING' ? <Clock size={20} /> :
                                                                req.status === 'ACTIVE' ? <MessageCircle size={20} /> :
                                                                    <CheckCircle2 size={20} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 dark:text-white capitalize">
                                                                {req.type.toLowerCase()} - {req.subject || 'Inget ämne'}
                                                            </h4>
                                                            <p className="text-xs text-slate-400 font-medium mt-1">
                                                                Skapad: {new Date(req.createdAt).toLocaleDateString('sv-SE')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right hidden sm:block">
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                                req.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {req.status === 'PENDING' ? 'Mottagen' :
                                                                    req.status === 'ACTIVE' ? 'Pågående' : 'Avslutad'}
                                                            </span>
                                                        </div>
                                                        <ChevronRight className="text-slate-300 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" size={20} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Active Sick Leave */}
                            {activeSickLeave && (
                                <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-3xl border border-rose-200 dark:border-rose-800/30 space-y-4 shadow-lg shadow-rose-500/5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-rose-700 dark:text-rose-400 flex items-center gap-3">
                                            <AlertCircle className="w-6 h-6" />
                                            Du är sjukanmäld
                                        </h3>
                                        <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                                            Aktiv
                                        </span>
                                    </div>
                                    <div className="text-rose-600 dark:text-rose-300 space-y-2">
                                        <p className="flex items-center gap-3 font-medium">
                                            <Calendar className="w-5 h-5 opacity-60" />
                                            Från: {activeSickLeave.startDate}
                                            {activeSickLeave.endDate ? ` — Till: ${activeSickLeave.endDate}` : ' (tills vidare)'}
                                        </p>
                                        {activeSickLeave.reason && (
                                            <p className="flex items-center gap-3 italic">
                                                <FileText className="w-5 h-5 opacity-60" />
                                                "{activeSickLeave.reason}"
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleCancelSickLeave}
                                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-black/20 text-rose-600 border border-rose-200 dark:border-rose-800/30 rounded-2xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all shadow-sm"
                                    >
                                        <XCircle size={18} />
                                        Friskanmäl mig / Avbryt
                                    </button>
                                </div>
                            )}

                            {/* Sick Leave Form */}
                            {!activeSickLeave && (
                                <div className="bg-white dark:bg-[#1E1F20] p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                                            <Thermometer size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Anmäl sjukdom</h3>
                                    </div>

                                    <form onSubmit={handleSickLeaveSubmit} className="space-y-6 text-slate-800 dark:text-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase ml-1">Startdatum *</label>
                                                <input
                                                    type="date"
                                                    value={sickLeaveForm.startDate}
                                                    onChange={e => setSickLeaveForm({ ...sickLeaveForm, startDate: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-[#131314] border-none rounded-2xl p-4 focus:ring-2 focus:ring-rose-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase ml-1">Beräknat Slut (valfritt)</label>
                                                <input
                                                    type="date"
                                                    value={sickLeaveForm.endDate}
                                                    onChange={e => setSickLeaveForm({ ...sickLeaveForm, endDate: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-[#131314] border-none rounded-2xl p-4 focus:ring-2 focus:ring-rose-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase ml-1">Anledning (valfritt)</label>
                                            <textarea
                                                value={sickLeaveForm.reason}
                                                onChange={e => setSickLeaveForm({ ...sickLeaveForm, reason: e.target.value })}
                                                placeholder="T.ex. influensa, läkarbesök..."
                                                rows={2}
                                                className="w-full bg-slate-50 dark:bg-[#131314] border-none rounded-2xl p-4 focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sickLeaveSubmitting}
                                            className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Thermometer size={20} />
                                            {sickLeaveSubmitting ? 'Skickar...' : 'Sjukanmäl mig'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* History */}
                            {sickLeaveHistory.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-3 ml-2 text-slate-700 dark:text-slate-300">
                                        <Clock className="text-slate-400" />
                                        Historik
                                    </h3>
                                    <div className="grid gap-3">
                                        {sickLeaveHistory.map(r => (
                                            <div key={r.id} className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${r.status === 'ACTIVE' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        <Thermometer size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                            {r.startDate}{r.endDate ? ` — ${r.endDate}` : ''}
                                                        </p>
                                                        {r.reason && <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[200px]">{r.reason}</p>}
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${r.status === 'ACTIVE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {r.status === 'ACTIVE' ? 'Aktiv' : 'Avslutad'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-brand-teal text-white rounded-3xl p-6 shadow-xl shadow-brand-teal/20">
                        <h3 className="font-black uppercase tracking-wider mb-4 border-b border-white/20 pb-2">Hjälplinjer</h3>
                        <div className="space-y-4">
                            <div className="bg-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
                                <p className="text-xs font-bold text-white/60 mb-1 uppercase">BRIS (BUP)</p>
                                <p className="text-xl font-black">116 111</p>
                                <p className="text-xs opacity-70 mt-1">Öppet dygnet runt</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
                                <p className="text-xs font-bold text-white/60 mb-1 uppercase">Jourhavande medmänniska</p>
                                <p className="text-xl font-black">08 – 702 16 80</p>
                                <p className="text-xs opacity-70 mt-1">Kl 21:00 – 06:00 varje kväll</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
                                <p className="text-xs font-bold text-white/60 mb-1 uppercase">Vid akuta lägen</p>
                                <p className="text-xl font-black">112</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border border-slate-100 dark:border-white/5 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <ShieldAlert className="text-brand-teal" size={18} />
                            Din trygghet
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Systemet loggar aldrig dina meddelanden till rektorer eller lärare. Endast den specifika personen i hälsoteamet du har valt får läsa vad du skriver.
                        </p>
                        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center gap-3">
                            <Lock className="text-brand-teal" size={16} />
                            <span className="text-xs font-bold uppercase tracking-tight text-slate-400">E2E Krypterad data</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WellbeingCenter;
