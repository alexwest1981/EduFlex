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
    ShieldAlert,
    Plus
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-main)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 border border-[var(--border-main)]">
                <div className="p-8 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card)]">
                    <div>
                        <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
                            <Plus className="text-indigo-600" size={24} />
                            Dela
                        </h2>
                        <p className="text-[var(--text-secondary)] font-medium truncate max-w-[300px]">{item.name || item.fileName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-all shadow-sm text-[var(--text-secondary)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Tabs */}
                    <div className="flex bg-[var(--bg-input)] p-1.5 rounded-2xl mb-8">
                        <button
                            onClick={() => { setSharingType('user'); setSelectedTarget(null); setResults([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${sharingType === 'user' ? 'bg-[var(--bg-card)] shadow-lg text-indigo-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            <User size={18} /> Användare
                        </button>
                        <button
                            onClick={() => { setSharingType('course'); setSelectedTarget(null); setResults([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${sharingType === 'course' ? 'bg-[var(--bg-card)] shadow-lg text-indigo-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            <BookOpen size={18} /> Kurs
                        </button>
                        <button
                            onClick={() => { setSharingType('link'); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${sharingType === 'link' ? 'bg-[var(--bg-card)] shadow-lg text-indigo-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            <Link2 size={18} /> Länk
                        </button>
                    </div>

                    {sharingType !== 'link' ? (
                        <div className="space-y-6">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder={`Sök ${sharingType === 'user' ? 'användare' : 'kurs'} efter namn...`}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-indigo-500/20 rounded-2xl outline-none transition-all font-medium text-[var(--text-primary)]"
                                />
                            </div>

                            {results.length > 0 && !selectedTarget && (
                                <div className="max-h-56 overflow-y-auto border border-[var(--border-main)] rounded-2xl divide-y divide-[var(--border-main)] shadow-inner">
                                    {results.map(res => (
                                        <button
                                            key={res.id}
                                            onClick={() => setSelectedTarget(res)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-input)] transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                                                {(res.firstName?.[0] || res.title?.[0] || '?').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate text-[var(--text-primary)]">
                                                    {res.title || `${res.firstName} ${res.lastName}`}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                                                    {res.email || (res.subject ? `Kurs: ${res.subject}` : 'Resurs')}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedTarget && (
                                <div className="bg-indigo-600 text-white rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-indigo-500/30 animate-in zoom-in-95">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <Check size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-black">Vald: {selectedTarget.title || `${selectedTarget.firstName} ${selectedTarget.lastName}`}</p>
                                            <p className="text-xs text-indigo-100 font-medium">Klicka för att ändra mottagare</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedTarget(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-main)]">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert size={18} className="text-[var(--text-secondary)]" />
                                    <span className="text-sm text-[var(--text-secondary)] font-bold">Inställningar</span>
                                </div>
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="bg-transparent text-sm font-black text-indigo-600 border-none outline-none cursor-pointer focus:ring-0"
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
                                <div className="text-center py-10 bg-[var(--bg-input)] rounded-3xl border border-dashed border-[var(--border-main)]">
                                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 rotate-3">
                                        <Link2 className="text-white" size={32} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2 text-[var(--text-primary)]">Dela via länk</h3>
                                    <p className="text-sm text-[var(--text-secondary)] font-medium mb-8 max-w-[250px] mx-auto">Alla med den unika länken kan se detta innehåll.</p>
                                    <button
                                        onClick={createLink}
                                        disabled={loading}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? 'Genererar...' : 'Skapa länk nu'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-[var(--bg-card)] rounded-3xl p-6 space-y-4 shadow-2xl border border-[var(--border-main)]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-widest">Offentlig Länk</span>
                                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full flex items-center gap-1">
                                            <Clock size={10} /> AKTIV
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={`${window.location.origin}/share/${publicLink.linkToken}`}
                                            className="flex-1 bg-[var(--bg-input)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-sm text-indigo-400 font-mono outline-none shadow-inner"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/share/${publicLink.linkToken}`);
                                                alert("Kopierad!");
                                            }}
                                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                        >
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] font-bold text-center">
                                        Försiktigt: Vem som helst med denna länk kan komma åt filen.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-8 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex gap-4">
                    <button onClick={onClose} className="flex-1 px-4 py-4 text-[var(--text-secondary)] font-black hover:bg-[var(--bg-input)] rounded-2xl transition-all">
                        Avbryt
                    </button>
                    {sharingType !== 'link' && (
                        <button
                            disabled={!selectedTarget || loading}
                            onClick={handleShare}
                            className={`flex-1 px-4 py-4 text-white font-black rounded-2xl transition-all shadow-xl ${selectedTarget && !loading ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 hover:-translate-y-1' : 'bg-[var(--bg-input)] cursor-not-allowed text-[var(--text-secondary)]'}`}
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
