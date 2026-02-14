import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAppContext } from '../../../context/AppContext';
import {
    Book,
    Lock,
    Share2,
    Globe,
    Send,
    User,
    Clock,
    AlertCircle
} from 'lucide-react';

const JournalSystem = ({ caseId }) => {
    const { currentUser } = useAppContext();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEntry, setNewEntry] = useState('');
    const [visibility, setVisibility] = useState('INTERNAL');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJournal();
    }, [caseId]);

    const fetchJournal = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/elevhalsa/cases/${caseId}/journal`);
            setEntries(data);
        } catch (err) {
            console.error('Failed to fetch journal:', err);
            setError('Kunde inte hämta journalanteckningar.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntry.trim()) return;

        try {
            setSubmitting(true);
            const entry = await api.elevhalsa.addJournalEntry(caseId, newEntry, visibility);

            setNewEntry('');
            await fetchJournal(); // Refresh list
        } catch (err) {
            console.error('Failed to add entry:', err);
            setError('Kunde inte spara anteckningen.');
        } finally {
            setSubmitting(false);
        }
    };

    const canView = (entry) => {
        // Frontend filtering logic (security is handled by backend too)
        if (entry.visibilityLevel === 'INTERNAL') {
            return ['ADMIN', 'REKTOR', 'HALSOTEAM'].some(r => currentUser.roles.includes(r));
        }
        return true;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Book className="w-5 h-5 text-indigo-500" />
                    Journal & Anteckningar
                </h3>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Add New Entry Form */}
            <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Ny anteckning
                </label>
                <textarea
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="Skriv en ny journalanteckning..."
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1F20] text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px] resize-y"
                />

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Synlighet:</span>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-white/10 rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="INTERNAL">🔒 Intern (Endast EHT)</option>
                            <option value="SHARED">👥 Delad (Elev/Vårdnadshavare)</option>
                            {/* <option value="PUBLIC">🌐 Publik</option> */}
                        </select>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !newEntry.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Sparar...' : (
                            <>
                                <Send className="w-4 h-4" />
                                Spara
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Laddar journal...</div>
                ) : entries.filter(canView).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Inga anteckningar ännu.</div>
                ) : (
                    entries.filter(canView).map((entry) => (
                        <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-slate-50 dark:bg-[#1E1F20] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                {entry.visibilityLevel === 'INTERNAL' ? (
                                    <Lock className="w-5 h-5 text-rose-500" />
                                ) : entry.visibilityLevel === 'SHARED' ? (
                                    <Share2 className="w-5 h-5 text-indigo-500" />
                                ) : (
                                    <Globe className="w-5 h-5 text-emerald-500" />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <User className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                                            {entry.author ? `${entry.author.firstName} ${entry.author.lastName}` : 'Okänd'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(entry.createdAt)}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {entry.content}
                                </p>

                                <div className="mt-3 flex items-center justify-end">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entry.visibilityLevel === 'INTERNAL'
                                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                        }`}>
                                        {entry.visibilityLevel === 'INTERNAL' ? 'INTERN' : 'DELAD'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JournalSystem;
