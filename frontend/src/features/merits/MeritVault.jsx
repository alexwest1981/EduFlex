import React, { useState, useEffect } from 'react';
import { Award, FileText, Download, ExternalLink, Shield, Calendar, Search } from 'lucide-react';
import { api } from '../../services/api';

const MeritVault = ({ currentUser }) => {
    const [merits, setMerits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMerits = async () => {
            try {
                const data = await api.documents.getMerits(currentUser.id);
                setMerits(data);
            } catch (err) {
                console.error("Failed to fetch merits", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMerits();
    }, [currentUser.id]);

    const filteredMerits = merits.filter(m =>
        m.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (category) => {
        switch (category) {
            case 'CERTIFICATE': return <Award className="text-amber-500" size={24} />;
            case 'TRANSCRIPT': return <FileText className="text-blue-500" size={24} />;
            default: return <Shield className="text-indigo-500" size={24} />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Hämtar dina meriter...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto border-4 border-indigo-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <Award size={28} />
                        </div>
                        Mina Meriter
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">
                        Ditt digitala valv för officiella kursbevis, betyg och intyg.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Sök bland dina meriter..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full md:w-64 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {merits.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Shield size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Inga officiella meriter ännu</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Här kommer dina kursbevis och betyg dyka upp automatiskt när de har utfärdats av dina lärare eller administratörer.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMerits.map((merit) => (
                        <div
                            key={merit.id}
                            className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden"
                        >
                            {/* Card Accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-indigo-100/50 transition-colors" />

                            <div className="flex items-start gap-4 relative">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all">
                                    {getIcon(merit.category)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 leading-tight mb-1 truncate group-hover:text-indigo-600 transition-colors" title={merit.fileName}>
                                        {merit.fileName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                        <Calendar size={12} />
                                        <span>Utfärdat: {merit.uploadedAt}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-2">
                                <a
                                    href={merit.fileUrl}
                                    download
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                                >
                                    <Download size={16} /> Ladda ner
                                </a>
                                <button
                                    title="Visa detaljer"
                                    className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <ExternalLink size={18} />
                                </button>
                            </div>

                            {/* Verification Badge */}
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-black text-emerald-600">
                                    <Shield size={10} /> Verifierat dokument
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">ID: {merit.id.toString().padStart(6, '0')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Security Notice */}
            <div className="mt-12 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex gap-4">
                <div className="text-indigo-600">
                    <Shield size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Säker hantering</h4>
                    <p className="text-indigo-700 text-xs mt-1 leading-relaxed">
                        Dessa dokument är signerade och utfärdade av EduFlex-plattformen. De kan inte raderas eller ändras av
                        användaren för att garantera deras äkthet mot tredje part.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MeritVault;
