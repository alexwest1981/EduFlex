import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Globe,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const LanguageManager = () => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [newLang, setNewLang] = useState({ code: '', name: '', nativeName: '' });

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            const response = await axios.get('/api/languages');
            setLanguages(response.data);
        } catch (error) {
            toast.error('Kunde inte hämta språklista');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id, enabled) => {
        try {
            await axios.patch(`/api/languages/${id}/toggle?enabled=${enabled}`);
            setLanguages(languages.map(l => l.id === id ? { ...l, isEnabled: enabled } : l));
            toast.success(enabled ? 'Språk aktiverat' : 'Språk inaktiverat');
        } catch (error) {
            toast.error('Kunde inte ändra status');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newLang.code || !newLang.name) return;

        setAdding(true);
        const toastId = toast.loading('AI genererar översättningar... Detta kan ta en stund.');

        try {
            const response = await axios.post('/api/languages', newLang);
            setLanguages([...languages, response.data]);
            setNewLang({ code: '', name: '', nativeName: '' });
            toast.success('Nytt språk skapat och översatt av AI!', { id: toastId });
        } catch (error) {
            toast.error('Fel vid skapande av språk. Kontrollera att koden är unik.', { id: toastId });
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (code) => {
        if (window.confirm(`Är du säker på att du vill ta bort ${code}?`)) {
            try {
                await axios.delete(`/api/languages/${code}`);
                setLanguages(languages.filter(l => l.code !== code));
                toast.success('Språk borttaget');
            } catch (error) {
                toast.error('Kunde inte ta bort språket');
            }
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        const toastId = toast.loading('Synkar alla språk... Detta tar en stund.');
        try {
            await axios.post('/api/languages/sync');
            toast.success('Alla språk har synkroniserats med AI!', { id: toastId });
        } catch (error) {
            toast.error('Fel vid synkronisering', { id: toastId });
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Globe className="text-blue-400" />
                        Språkhantering
                    </h2>
                    <p className="text-gray-400 text-sm">Hantera systemets tillgängliga språk och generera nya med AI.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 text-xs bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/30 transition-all font-bold"
                    >
                        {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Synka alla språk
                    </button>
                    <div className="flex items-center gap-2 text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                        <RefreshCw className="w-3 h-3 animate-spin duration-[3000ms]" />
                        Powered by Gemini AI
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {languages.map(lang => (
                    <div
                        key={lang.id}
                        className={`relative group p-4 rounded-xl border transition-all duration-300 ${lang.isEnabled
                            ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-blue-500/20 shadow-lg'
                            : 'bg-gray-500/5 border-gray-500/10'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-gray-300">
                                {lang.code}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggle(lang.id, !lang.isEnabled)}
                                    className={`p-1 rounded-full transition-colors ${lang.isEnabled ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-500 hover:bg-gray-500/10'
                                        }`}
                                    title={lang.isEnabled ? "Inaktivera" : "Aktivera"}
                                >
                                    {lang.isEnabled ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                </button>
                                {lang.code !== 'sv' && (
                                    <button
                                        onClick={() => handleDelete(lang.code)}
                                        className="p-1 text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Radera permanent"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 className="font-semibold text-white">{lang.name}</h3>
                        <p className="text-sm text-gray-400 italic">{lang.nativeName}</p>

                        {lang.isDefault && (
                            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                DEFAULT
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Language Form */}
            <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="text-green-400" />
                    Lägg till nytt språk
                </h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase ml-1">Språkkod (ISO)</label>
                        <input
                            type="text"
                            placeholder="t.ex. es"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 transition-all outline-none"
                            value={newLang.code}
                            onChange={e => setNewLang({ ...newLang, code: e.target.value.toLowerCase() })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase ml-1">Namn (Engelska)</label>
                        <input
                            type="text"
                            placeholder="Spanish"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 transition-all outline-none"
                            value={newLang.name}
                            onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase ml-1">Namn (Lokalt)</label>
                        <input
                            type="text"
                            placeholder="Español"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 transition-all outline-none"
                            value={newLang.nativeName}
                            onChange={e => setNewLang({ ...newLang, nativeName: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={adding}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={20} />}
                        Skapa med AI
                    </button>
                </form>
                <div className="mt-4 flex items-start gap-2 text-xs text-yellow-500/80 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <p>
                        Att lägga till ett nytt språk skapar automatiskt översättningar av alla existerande svenska språkfiler i systemet med hjälp av Gemini AI.
                        Detta inkluderar kontrollcenter, kursmaterial och studentgränssnittet.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LanguageManager;
