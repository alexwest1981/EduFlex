import React, { useState, useEffect } from 'react';
import {
    Globe, Plus, Trash2, CheckCircle2, XCircle,
    RefreshCcw, AlertCircle, Languages, Search,
    Settings2, Info, Loader2, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import i18n from '../../i18n';

const LanguageManager = () => {
    const [languages, setLanguages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLang, setNewLang] = useState({ code: '', name: '', nativeName: '', flagIcon: '' });
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/languages');
            const data = response.data || [];
            
            // Sorting priority: Nordic first, then by commonality
            const nordicCodes = ['sv', 'no', 'da', 'fi', 'se'];
            const commonCodes = ['en', 'de', 'fr', 'es', 'ar'];
            
            const sortedLangs = data.sort((a, b) => {
                const indexA = [...nordicCodes, ...commonCodes].indexOf(a.code);
                const indexB = [...nordicCodes, ...commonCodes].indexOf(b.code);
                
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.code.localeCompare(b.code);
            });

            setLanguages(sortedLangs);
            setStatus(null);
        } catch (error) {
            console.error("Failed to load languages from API", error);
            setStatus({ type: 'error', message: 'Kunde inte hämta språk från servern.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLanguage = async (e) => {
        e.preventDefault();
        setIsActionLoading(true);
        setStatus({ type: 'info', message: 'Skapar språk och genererar AI-översättningar... Detta kan ta en minut.' });

        try {
            await api.post('/languages', newLang);
            await fetchLanguages();
            setShowAddModal(false);
            setNewLang({ code: '', name: '', nativeName: '', flagIcon: '' });
            setStatus({ type: 'success', message: `Språket ${newLang.name} har lagts till och översatts!` });
        } catch (error) {
            console.error("Failed to add language", error);
            setStatus({ type: 'error', message: 'Ett fel uppstod vid skapandet av språket.' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleEnabled = async (code, enabled) => {
        try {
            await api.put(`/languages/${code}/toggle`, { enabled: !enabled });
            setLanguages(prev => prev.map(l => l.code === code ? { ...l, enabled: !enabled } : l));
            setStatus({ type: 'success', message: 'Status uppdaterad.' });
        } catch (error) {
            console.error("Failed to toggle language", error);
            setStatus({ type: 'error', message: 'Kunde inte ändra status.' });
        }
    };

    const handleSyncLanguages = async () => {
        if (!window.confirm("Vill du tvinga fram en ny AI-översättning för alla aktiva språk? Detta kan ta flera minuter.")) return;

        setIsActionLoading(true);
        setStatus({ type: 'info', message: 'Synkar och uppdaterar alla översättningar med Gemini AI... Vänligen vänta.' });

        try {
            await api.post('/languages/sync');
            setStatus({ type: 'success', message: 'Alla språk har synkroniserats och översatts på nytt!' });
        } catch (error) {
            console.error("Failed to sync languages", error);
            setStatus({ type: 'error', message: 'Ett fel uppstod vid synkronisering.' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteLanguage = async (code) => {
        if (!window.confirm("Är du säker på att du vill ta bort detta språk? Alla översättningsfiler i MinIO kommer att raderas.")) return;

        setIsActionLoading(true);
        try {
            await api.delete(`/languages/${code}`);
            setLanguages(prev => prev.filter(l => l.code !== code));
            setStatus({ type: 'success', message: 'Språket har tagits bort.' });
        } catch (error) {
            console.error("Failed to delete language", error);
            setStatus({ type: 'error', message: 'Kunde inte ta bort språket.' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredLanguages = languages.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Globe className="text-indigo-600" size={28} />
                        Språkhantering <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full ml-2">v3.8.1</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Hantera systemets tillgängliga språk och generera AI-översättningar.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSyncLanguages}
                        disabled={isActionLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl font-bold transition-all shadow-sm hidden md:flex disabled:opacity-50"
                        title="Tvinga fram ny AI-översättning för alla aktiva språk"
                    >
                        {isActionLoading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCcw size={20} />}
                        Synka alla språk
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus size={20} />
                        Lägg till språk
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100 dark:border-red-900/20' :
                    status.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-100 dark:border-green-900/20' :
                        'bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-100 dark:border-blue-900/20'
                    }`}>
                    {status.type === 'info' ? <Loader2 className="animate-spin" size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{status.message}</span>
                    <button onClick={() => setStatus(null)} className="ml-auto hover:opacity-70"><XCircle size={18} /></button>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Sök språk på namn eller kod..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-indigo-50 dark:bg-indigo-900/10 px-4 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                    <Info size={16} className="text-indigo-600" />
                    <span>Nya språk översätts automatiskt med Gemini AI</span>
                </div>
            </div>

            {/* Languages Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-gray-500 font-medium animate-pulse">Hämtar språkinställningar...</p>
                </div>
            ) : filteredLanguages.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
                    <Languages className="mx-auto text-gray-300 dark:text-white/20 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inga språk hittades</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Justera din sökning eller lägg till ett nytt språk för att komma igång.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-900 dark:text-white">
                    {filteredLanguages.map((lang) => (
                        <div
                            key={lang.code}
                            className={`group relative p-6 bg-white dark:bg-[#1E1F20] rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${lang.enabled ? 'border-indigo-100 dark:border-indigo-800/30' : 'border-gray-200 dark:border-white/5 opacity-80'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl text-2xl shadow-inner">
                                        {lang.flagIcon || '🌐'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{lang.nativeName || lang.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-black px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded uppercase">
                                                {lang.code}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">{lang.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteLanguage(lang.code)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Ta bort språk"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${lang.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                    <span className={`text-xs font-bold ${lang.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                        {lang.enabled ? 'Aktiv' : 'Inaktiv'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleToggleEnabled(lang.code, lang.enabled)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${lang.enabled
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'
                                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    {lang.enabled ? 'Avaktivera' : 'Aktivera'}
                                </button>
                            </div>

                            {lang.isDefault && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                    <CheckCircle2 size={10} /> Default
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Language Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 text-gray-900 dark:text-white">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isActionLoading && setShowAddModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#1E1F20] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <Sparkles size={30} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Lägg till nytt språk</h3>
                                    <p className="text-gray-500 text-sm">Systemet kommer automatiskt att översätta alla moduler med AI.</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddLanguage} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-gray-400 ml-1">Språkkod (t.ex. 'no')</label>
                                        <input
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={newLang.code}
                                            onChange={e => setNewLang({ ...newLang, code: e.target.value.toLowerCase() })}
                                            placeholder="no"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-gray-400 ml-1">Flagga (Emoji)</label>
                                        <input
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl"
                                            value={newLang.flagIcon}
                                            onChange={e => setNewLang({ ...newLang, flagIcon: e.target.value })}
                                            placeholder="🇳🇴"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-gray-400 ml-1">Namn (Svenska)</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newLang.name}
                                        onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                                        placeholder="Norska"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-gray-400 ml-1">Namn (Originalspråk)</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newLang.nativeName}
                                        onChange={e => setNewLang({ ...newLang, nativeName: e.target.value })}
                                        placeholder="Norsk"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all"
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isActionLoading}
                                        className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Översätter...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCcw size={18} />
                                                Skapa & Översätt
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageManager;
