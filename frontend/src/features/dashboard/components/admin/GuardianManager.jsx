import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../../services/api';
import GuardianDetailsModal from './GuardianDetailsModal';

const GuardianManager = () => {
    const [guardians, setGuardians] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGuardian, setSelectedGuardian] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    const fetchGuardians = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.admin.guardians.getAll();
            setGuardians(data || []);
        } catch (error) {
            console.error("Failed to fetch guardians", error);
            setError("Kunde inte hämta vårdnadshavare. Kontrollera behörighet och nätverk.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGuardians();
    }, []);

    const filteredGuardians = guardians.filter(g =>
        g.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGuardianClick = (guardian) => {
        setSelectedGuardian(guardian);
        setShowModal(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section with Stats & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="text-indigo-600" size={28} />
                        Vårdnadshavare
                    </h2>
                    <p className="text-sm text-gray-500 font-bold dark:text-gray-400 mt-1">
                        Hantera kopplingar mellan föräldrar och elever
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Sök vårdnadshavare..."
                        className="pl-12 pr-4 py-3 w-full md:w-80 bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-medium shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content area */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-gray-200 dark:border-[#3c4043] overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Loader2 className="animate-spin text-indigo-500" size={48} />
                        <p className="text-sm font-black uppercase tracking-widest animate-pulse">Laddar vårdnadshavare...</p>
                    </div>
                ) : error ? (
                    <div className="py-24 flex flex-col items-center justify-center text-red-500 gap-4">
                        <AlertCircle size={48} />
                        <p className="font-bold">{error}</p>
                        <button
                            onClick={fetchGuardians}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                        >
                            Försök igen
                        </button>
                    </div>
                ) : filteredGuardians.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-[#131314]/50 border-b border-gray-100 dark:border-[#3c4043]">
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Namn</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Kontakt</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Användarnamn</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {filteredGuardians.map((guardian) => (
                                    <tr
                                        key={guardian.id}
                                        onClick={() => handleGuardianClick(guardian)}
                                        className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 cursor-pointer transition-all"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                                                    {guardian.firstName?.[0]}{guardian.lastName?.[0]}
                                                </div>
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {guardian.fullName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="font-medium">{guardian.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-[#131314] text-gray-600 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-200 dark:border-[#3c4043]">
                                                {guardian.username}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <Users className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-lg font-bold text-gray-400 italic">Inga vårdnadshavare matchar din sökning</h3>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Prova ett annat namn eller användarnamn.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <GuardianDetailsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                guardian={selectedGuardian}
                onUpdate={fetchGuardians}
            />
        </div>
    );
};

export default GuardianManager;
