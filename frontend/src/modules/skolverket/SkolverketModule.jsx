import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, Loader2, Download, Check, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

import ImportCourseModal from './ImportCourseModal';

const SkolverketModule = () => {
    // API_BASE and token are handled by api service
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const handleSyncAll = async () => {
        if (!confirm('Detta kommer att synka ALLA kurser i katalogen med Skolverkets API. Detta kan ta några minuter. Vill du fortsätta?')) return;

        setSyncing(true);
        try {
            const res = await api.post('/skolverket/api/sync-all');
            toast.success(`Synk slutförd! ${res.synced} kurser uppdaterades.`);
        } catch (error) {
            toast.error('Synk misslyckades: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            // Use api.get which handles Authorization and X-Tenant-ID automatically
            const data = await api.get('/skolverket/api/subjects');
            // API returns object with "subjects" array or similar
            const subjectList = Array.isArray(data) ? data : data.subjects || [];
            setSubjects(subjectList);
        } catch (err) {
            console.error("Failed to fetch subjects", err);
            toast.error("Kunde inte hämta ämnen.");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjectDetails = async (code) => {
        setDetailsLoading(true);
        try {
            // Use api.get
            const data = await api.get(`/skolverket/api/subjects/${code}`);
            setSelectedSubject(data);
        } catch (err) {
            console.error("Failed to fetch subject details", err);
            toast.error("Kunde inte hämta detaljer.");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleImportClick = () => {
        if (!selectedSubject) return;
        setShowImportModal(true);
    };

    const handleImportSubmit = async (payload) => {
        try {
            const res = await api.post('/skolverket/api/import', payload);
            if (res.success) {
                toast.success(`Importerade ${payload.name} till kurskatalogen!`);
                setShowImportModal(false);
            } else {
                toast.success("Kursen importerad!");
                setShowImportModal(false);
            }
        } catch (err) {
            console.error("Import failed", err);
            // Check if it's "Already exists"
            if (err.message && err.message.includes("exists")) {
                toast.error("Kursen finns redan i katalogen.");
            } else {
                toast.error("Kunde inte importera kursen.");
            }
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.name?.toLowerCase().includes(filter.toLowerCase()) ||
        s.code?.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            {showImportModal && selectedSubject && (
                <ImportCourseModal
                    subject={selectedSubject.subject}
                    onClose={() => setShowImportModal(false)}
                    onImport={handleImportSubmit}
                />
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skolverket Integration</h1>
                    <p className="text-gray-500 dark:text-gray-400">Utforska kursplaner och ämnen direkt från Skolverkets API</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSyncAll}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 shadow-sm transition-all"
                    >
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Synkar katalog...' : 'Synka All Kurskatalog'}
                    </button>
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium">
                        API Status: {loading ? 'Checking...' : 'Connected'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
                {/* Left: Search & List */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-100 dark:border-[#282a2c] flex flex-col overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100 dark:border-[#282a2c]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Sök ämne eller kod..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#131314] rounded-xl border-none outline-none focus:ring-2 ring-indigo-500/50 text-gray-900 dark:text-white"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : filteredSubjects.length > 0 ? (
                            filteredSubjects.map((sub) => (
                                <button
                                    key={sub.code}
                                    onClick={() => fetchSubjectDetails(sub.code)}
                                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${selectedSubject?.subject?.code === sub.code ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <div>
                                        <div className="font-semibold">{sub.name}</div>
                                        <div className="text-xs opacity-70">{sub.code}</div>
                                    </div>
                                    <ChevronRight size={16} className="opacity-50" />
                                </button>
                            ))
                        ) : (
                            <div className="text-center p-8 text-gray-500">Inga ämnen funna.</div>
                        )}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-100 dark:border-[#282a2c] flex flex-col overflow-hidden shadow-sm p-6 relative">
                    {detailsLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                        </div>
                    ) : selectedSubject ? (
                        <div className="h-full overflow-y-auto custom-scrollbar space-y-6">
                            <div className="border-b border-gray-100 dark:border-[#282a2c] pb-4 flex justify-between items-start">
                                <div>
                                    <div className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold mb-2">Subject</div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedSubject.subject?.name}</h2>
                                    <p className="text-gray-500 font-mono text-sm mt-1">Code: {selectedSubject.subject?.code}</p>
                                </div>
                                <button
                                    onClick={handleImportClick}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    <Download size={18} />
                                    Importera till Katalog
                                </button>
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                <h3 className="text-lg font-bold">Beskrivning</h3>
                                <div dangerouslySetInnerHTML={{ __html: selectedSubject.subject?.description || "Ingen beskrivning tillgänglig." }} />

                                {/* Raw JSON Dump for Debugging */}
                                <div className="mt-8">
                                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Technical Data (Raw Response)</h4>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-xs font-mono">
                                        {JSON.stringify(selectedSubject, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <BookOpen size={64} className="mb-4 opacity-20" />
                            <p className="text-lg">Välj ett ämne från listan för att se detaljer</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkolverketModule;
