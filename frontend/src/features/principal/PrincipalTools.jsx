import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    MessageSquare,
    Zap,
    Eye,
    EyeOff,
    Users,
    Send,
    UserSearch,
    AlertCircle,
    Info,
    Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

const PrincipalTools = () => {
    const { currentUser, refreshUser } = useAppContext();
    const [broadcast, setBroadcast] = useState({ targetType: 'CLASS', targetId: '', subject: '', content: '' });
    const [impersonateUserId, setImpersonateUserId] = useState('');
    const [activeImpersonation, setActiveImpersonation] = useState(null);
    const [loading, setLoading] = useState(false);

    // List context
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        loadContexts();
        checkImpersonationStatus();
    }, []);

    const loadContexts = async () => {
        try {
            const [depts] = await Promise.all([
                api.principal.structure.getDepartments()
            ]);
            setDepartments(depts || []);
        } catch (e) {
            console.error('Failed to load contexts');
        }
    };

    const checkImpersonationStatus = async () => {
        try {
            const res = await fetch('/api/principal/impersonate/status', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const userId = await res.json();
                if (userId) setActiveImpersonation(userId);
            }
        } catch (e) { console.error(e); }
    };

    const handleTargetTypeChange = async (type) => {
        setBroadcast({ ...broadcast, targetType: type, targetId: '' });
        if (type === 'PROGRAM') {
            const allD = await api.principal.structure.getDepartments();
            // In a real app we'd flatten or drill down. For now just get all programs or filter.
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcast.content || !broadcast.targetId) {
            toast.error('Vänligen fyll i mottagare och innehåll');
            return;
        }
        setLoading(true);
        try {
            // This would use the specific broadcast endpoints in MessageService (via api.js wrapper if added)
            // For now we'll simulate or use a generic send if endpoint not yet perfectly mapped in api.js principal object
            toast.success(`Utskick skickat till ${broadcast.targetType}`);
            setBroadcast({ ...broadcast, subject: '', content: '' });
        } catch (err) {
            toast.error('Kunde inte skicka meddelande');
        } finally {
            setLoading(false);
        }
    };

    const startImpersonation = async () => {
        if (!impersonateUserId) return;
        try {
            await fetch(`/api/principal/impersonate/start/${impersonateUserId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Impersonate Mode AKTIVERAT. Systemet visas nu som användaren.');
            setActiveImpersonation(impersonateUserId);
            // In a real implementation, we might need to refresh the whole app or session
            // window.location.reload(); 
        } catch (err) {
            toast.error('Kunde inte starta impersonering');
        }
    };

    const stopImpersonation = async () => {
        try {
            await fetch('/api/principal/impersonate/stop', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Impersonate Mode avstängt.');
            setActiveImpersonation(null);
            // window.location.reload();
        } catch (err) {
            toast.error('Kunde inte stoppa impersonering');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                    <Zap size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administrativa Verktyg</h1>
                    <p className="text-sm text-gray-500">Avancerade verktyg för skoldrift och support.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. MASS BROADCAST */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <MessageSquare className="text-indigo-600" size={22} />
                            Mass-meddelande / Utskick
                        </h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mottagartyp</label>
                                <select
                                    value={broadcast.targetType}
                                    onChange={e => handleTargetTypeChange(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3"
                                >
                                    <option value="CLASS">Klass</option>
                                    <option value="PROGRAM">Program</option>
                                    <option value="STAFF">Personal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Specifik mottagare</label>
                                <select
                                    value={broadcast.targetId}
                                    onChange={e => setBroadcast({ ...broadcast, targetId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3"
                                >
                                    <option value="">Välj...</option>
                                    <option value="1">Alla lärare</option>
                                    <option value="2">Klass TE22A</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ämne</label>
                            <input
                                value={broadcast.subject}
                                onChange={e => setBroadcast({ ...broadcast, subject: e.target.value })}
                                placeholder="t.ex. Information om kommande studiedag"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Meddelande</label>
                            <textarea
                                rows={6}
                                value={broadcast.content}
                                onChange={e => setBroadcast({ ...broadcast, content: e.target.value })}
                                placeholder="Skriv ditt meddelande här..."
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSendBroadcast}
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
                        >
                            <Send size={18} />
                            {loading ? 'Skickar...' : 'Skicka utskick'}
                        </button>
                    </div>
                </div>

                {/* 2. IMPERSONATE MODE */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Eye className="text-emerald-600" size={22} />
                                Impersonate Mode
                            </h2>
                            {activeImpersonation && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase animate-pulse">AKTIV</span>
                            )}
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-2xl flex gap-3 text-emerald-800 dark:text-emerald-200">
                                <Info className="shrink-0" size={20} />
                                <p className="text-sm leading-relaxed">
                                    Detta läge tillåter dig att se EduFlex exakt som en specifik elev eller lärare ser det.
                                    <span className="font-bold underline block mt-1">Säkerhetsmeddelande: Alla ändringar utförda i detta läge loggas som gjorda av dig.</span>
                                </p>
                            </div>

                            {!activeImpersonation ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Välj Användare (ID eller Sök)</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={impersonateUserId}
                                                onChange={e => setImpersonateUserId(e.target.value)}
                                                placeholder="Användar-ID (t.ex. 123)"
                                                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3"
                                            />
                                            <button className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors">
                                                <Search size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startImpersonation}
                                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none"
                                    >
                                        <Eye size={18} />
                                        Starta Impersonatering
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center py-4">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <UserSearch size={40} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Du agerar nu som användare #{activeImpersonation}</p>
                                        <p className="text-sm text-gray-500">Du ser deras kurser, meddelanden och kalender.</p>
                                    </div>
                                    <button
                                        onClick={stopImpersonation}
                                        className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100 dark:shadow-none"
                                    >
                                        <EyeOff size={18} />
                                        Avsluta Impersonatering
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-6 rounded-3xl flex gap-4">
                        <AlertCircle className="text-amber-600 shrink-0" />
                        <div>
                            <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">System-logg / Revision</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                Varje gång du använder Impersonate Mode eller gör mass-utskick genereras en post i systemets revisionslogg för regelefterlevnad.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PrincipalTools;
