import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    User,
    Users,
    BookOpen,
    GraduationCap,
    Link2,
    Check,
    Copy,
    Clock,
    ShieldAlert
} from 'lucide-react';
import { api } from '../../../services/api';

const AdvancedShareModal = ({ item, onClose, currentUser }) => {
    const [sharingType, setSharingType] = useState('user'); // user, course, lesson, link
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [permission, setPermission] = useState('VIEW');
    const [publicLink, setPublicLink] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) {
            setResults([]);
            return;
        }

        try {
            if (sharingType === 'user') {
                const users = await api.users.search(q);
                setResults(Array.isArray(users) ? users.filter(u => u.id !== currentUser.id) : []);
            } else if (sharingType === 'course') {
                const courses = await api.courses.getAll();
                setResults(courses.filter(c => c.title.toLowerCase().includes(q.toLowerCase())));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleShare = async () => {
        if (!selectedTarget) return;
        setLoading(true);

        try {
            await api.shares.create(item.id, currentUser.id, {
                targetType: sharingType.toUpperCase(),
                targetId: selectedTarget.id,
                permission: permission
            });
            alert(`Delat med ${selectedTarget.firstName || selectedTarget.title}!`);
            onClose();
        } catch (e) {
            alert("Kunde inte dela: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const createLink = async () => {
        setLoading(true);
        try {
            const share = await api.shares.createPublicLink(item.id, currentUser.id);
            setPublicLink(share);
        } catch (e) {
            alert("Kunde inte skapa länk");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Plus className="text-blue-600" size={24} />
                            Dela
                        </h2>
                        <p className="text-slate-500 font-medium truncate max-w-[300px]">{item.name || item.fileName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
                        <button
                            onClick={() => { setSharingType('user'); setSelectedTarget(null); setResults([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${sharingType === 'user' ? 'bg-white dark:bg-slate-700 shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <User size={18} /> Användare
                        </button>
                        <button
                            onClick={() => { setSharingType('course'); setSelectedTarget(null); setResults([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${sharingType === 'course' ? 'bg-white dark:bg-slate-700 shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <BookOpen size={18} /> Kurs
                        </button>
                        <button
                            onClick={() => { setSharingType('link'); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${sharingType === 'link' ? 'bg-white dark:bg-slate-700 shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Link2 size={18} /> Länk
                        </button>
                    </div>

                    {sharingType !== 'link' ? (
                        <div className="space-y-6">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder={`Sök ${sharingType === 'user' ? 'användare' : 'kurs'} efter namn...`}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-medium text-slate-900 dark:text-white"
                                />
                            </div>

                            {results.length > 0 && !selectedTarget && (
                                <div className="max-h-56 overflow-y-auto border-2 border-slate-100 dark:border-slate-800 rounded-2xl divide-y dark:divide-slate-800 shadow-inner">
                                    {results.map(res => (
                                        <button
                                            key={res.id}
                                            onClick={() => setSelectedTarget(res)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                                                {(res.firstName?.[0] || res.title?.[0] || '?').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate text-slate-900 dark:text-white">
                                                    {res.title || `${res.firstName} ${res.lastName}`}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium truncate">
                                                    {res.email || (res.subject ? `Kurs: ${res.subject}` : 'Resurs')}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedTarget && (
                                <div className="bg-blue-600 text-white rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-blue-500/30 animate-in zoom-in-95">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <Check size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-black">Vald: {selectedTarget.title || `${selectedTarget.firstName} ${selectedTarget.lastName}`}</p>
                                            <p className="text-xs text-blue-100 font-medium">Klicka för att ändra mottagare</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedTarget(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert size={18} className="text-slate-400" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">Inställningar</span>
                                </div>
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="bg-transparent text-sm font-black text-blue-600 border-none outline-none cursor-pointer focus:ring-0"
                                >
                                    <option value="VIEW">👀 Kan visa</option>
                                    <option value="EDIT">✏️ Kan redigera</option>
                                    <option value="MANAGE">👑 Full kontroll</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!publicLink ? (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 rotate-3">
                                        <Link2 className="text-white" size={32} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Dela via länk</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-8 max-w-[250px] mx-auto">Alla med den unika länken kan se detta innehåll.</p>
                                    <button
                                        onClick={createLink}
                                        disabled={loading}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? 'Genererar...' : 'Skapa länk nu'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Offentlig Länk</span>
                                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full flex items-center gap-1">
                                            <Clock size={10} /> AKTIV
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={`${window.location.origin}/share/${publicLink.linkToken}`}
                                            className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-blue-400 font-mono outline-none shadow-inner"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/share/${publicLink.linkToken}`);
                                                alert("Kopierad!");
                                            }}
                                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold text-center">
                                        Försiktigt: Vem som helst med denna länk kan komma åt filen.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/80 flex gap-4">
                    <button onClick={onClose} className="flex-1 px-4 py-4 text-slate-600 dark:text-slate-400 font-black hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all">
                        Avbryt
                    </button>
                    {sharingType !== 'link' && (
                        <button
                            disabled={!selectedTarget || loading}
                            onClick={handleShare}
                            className={`flex-1 px-4 py-4 text-white font-black rounded-2xl transition-all shadow-xl ${selectedTarget && !loading ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:-translate-y-1' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-100'}`}
                        >
                            {loading ? 'Dela...' : 'Slutför delning'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedShareModal;
