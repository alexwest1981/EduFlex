import React, { useState, useEffect } from 'react';
import { X, User, Plus, Trash2, Search, Loader2, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';

const GuardianDetailsModal = ({ isOpen, onClose, guardian, onUpdate }) => {
    const { t } = useTranslation();
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchDetails = async () => {
        if (!guardian) return;
        setIsLoading(true);
        try {
            const data = await api.admin.guardians.getDetails(guardian.id);
            setLinks(data.links || []);
        } catch (error) {
            console.error("Failed to fetch guardian details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && guardian) {
            fetchDetails();
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen, guardian]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                try {
                    const results = await api.admin.guardians.searchStudents(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleLink = async (studentId) => {
        try {
            await api.admin.guardians.link(guardian.id, studentId);
            setSearchQuery('');
            setSearchResults([]);
            fetchDetails();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert("Kunde inte koppla barnet.");
        }
    };

    const handleUnlink = async (linkId) => {
        if (window.confirm("Är du säker på att du vill ta bort kopplingen?")) {
            try {
                await api.admin.guardians.unlink(linkId);
                fetchDetails();
                if (onUpdate) onUpdate();
            } catch (error) {
                alert("Kunde inte ta bort kopplingen.");
            }
        }
    };

    if (!isOpen || !guardian) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50/50 dark:bg-[#131314]/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">
                                {guardian.fullName}
                            </h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vårdnadshavare Profil</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-xl transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 space-y-8">
                    {/* Guardian Info Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-[#131314] rounded-2xl border border-gray-100 dark:border-[#3c4043]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">E-post</p>
                            <p className="font-bold text-sm text-gray-700 dark:text-gray-300 truncate">{guardian.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#131314] rounded-2xl border border-gray-100 dark:border-[#3c4043]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Användarnamn</p>
                            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{guardian.username}</p>
                        </div>
                    </div>

                    {/* Linked Children Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Kopplade Barn</h4>
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full border border-indigo-100 dark:border-indigo-800/50">
                                {links.length} st
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                <Loader2 className="animate-spin text-indigo-500" size={32} />
                                <p className="text-xs font-bold uppercase tracking-widest">Hämtar kopplingar...</p>
                            </div>
                        ) : links.length > 0 ? (
                            <div className="space-y-3">
                                {links.map((link) => (
                                    <div key={link.id} className="group flex items-center justify-between p-4 bg-white dark:bg-[#282a2c] rounded-2xl border border-gray-100 dark:border-[#3c4043] hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#131314] flex items-center justify-center text-gray-400">
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{link.student.fullName}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">{link.student.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnlink(link.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            title="Ta bort koppling"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-gray-50 dark:bg-[#131314] rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#3c4043]">
                                <p className="text-sm font-bold text-gray-400">Inga barn kopplade ännu.</p>
                            </div>
                        )}
                    </div>

                    {/* Add Child Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Plus size={16} className="text-indigo-500" /> Koppla nytt barn
                        </h4>

                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#131314] rounded-2xl border border-gray-100 dark:border-[#3c4043] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none dark:text-white font-medium transition-all"
                                placeholder="Sök barn efter namn eller e-post..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="animate-spin text-indigo-500" size={18} />
                                </div>
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-100 dark:border-[#3c4043] shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                {searchResults.map((student) => {
                                    const isAlreadyLinked = links.find(l => l.student.id === student.id);
                                    return (
                                        <button
                                            key={student.id}
                                            disabled={isAlreadyLinked}
                                            onClick={() => handleLink(student.id)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors border-b last:border-0 border-gray-50 dark:border-[#3c4043] disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 text-xs font-black">
                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.fullName}</p>
                                                    <p className="text-[10px] text-gray-500">{student.email}</p>
                                                </div>
                                            </div>
                                            {isAlreadyLinked ? (
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Redan kopplad</span>
                                            ) : (
                                                <Plus size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {searchQuery.trim().length > 1 && !isSearching && searchResults.length === 0 && (
                            <p className="text-center text-xs font-bold text-gray-400">Inga elever matchade sökningen.</p>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-[#131314] border-t border-gray-100 dark:border-[#3c4043] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-all text-sm shadow-sm"
                    >
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuardianDetailsModal;
