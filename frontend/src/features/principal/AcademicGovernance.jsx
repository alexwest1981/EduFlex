import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Calendar,
    ShieldCheck,
    Plus,
    Lock,
    Unlock,
    FileText,
    UserCheck,
    Clock,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicGovernance = () => {
    const [terms, setTerms] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('terms');

    // Form states
    const [newTerm, setNewTerm] = useState({ name: '', startDate: '', endDate: '', academicYear: '' });
    const [newPolicy, setNewPolicy] = useState({ title: '', content: '', version: '1.0' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tData, pData] = await Promise.all([
                api.principal.governance.getTerms(),
                api.principal.governance.getPolicies()
            ]);
            setTerms(tData || []);
            setPolicies(pData || []);
        } catch (err) {
            toast.error('Kunde inte ladda data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTerm = async () => {
        if (!newTerm.name || !newTerm.startDate || !newTerm.endDate) return;
        try {
            await api.principal.governance.createTerm(newTerm);
            setNewTerm({ name: '', startDate: '', endDate: '', academicYear: '' });
            loadData();
            toast.success('Termin skapad');
        } catch (err) {
            toast.error('Kunde inte skapa termin');
        }
    };

    const toggleTermLock = async (termId, currentLocked) => {
        try {
            await api.principal.governance.lockTerm(termId, !currentLocked);
            loadData();
            toast.success(currentLocked ? 'Termin upplåst' : 'Termin låst för betygssättning');
        } catch (err) {
            toast.error('Kunde inte ändra lås-status');
        }
    };

    const handleCreatePolicy = async () => {
        if (!newPolicy.title || !newPolicy.content) return;
        try {
            await api.principal.governance.createPolicy(newPolicy);
            setNewPolicy({ title: '', content: '', version: '1.0' });
            loadData();
            toast.success('Policy publicerad');
        } catch (err) {
            toast.error('Kunde inte skapa policy');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Läsårsstyrning & Policy</h1>
                    <p className="text-sm text-gray-500">Administrera terminer, betygslås och skolövergripande regelverk.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 gap-8 mb-6">
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'terms' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
                >
                    Terminer & Betygslås
                </button>
                <button
                    onClick={() => setActiveTab('policies')}
                    className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'policies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
                >
                    Skolpolicy & Efterlevnad
                </button>
            </div>

            {activeTab === 'terms' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Term */}
                    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-600" />
                            Skapa ny termin
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Namn</label>
                                <input
                                    value={newTerm.name}
                                    onChange={e => setNewTerm({ ...newTerm, name: e.target.value })}
                                    placeholder="t.ex. Vårterminen 2026"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Startdatum</label>
                                    <input
                                        type="date"
                                        value={newTerm.startDate}
                                        onChange={e => setNewTerm({ ...newTerm, startDate: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Slutdatum</label>
                                    <input
                                        type="date"
                                        value={newTerm.endDate}
                                        onChange={e => setNewTerm({ ...newTerm, endDate: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Läsår</label>
                                <input
                                    value={newTerm.academicYear}
                                    onChange={e => setNewTerm({ ...newTerm, academicYear: e.target.value })}
                                    placeholder="t.ex. 25/26"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm"
                                />
                            </div>
                            <button
                                onClick={handleCreateTerm}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                            >
                                Spara termin
                            </button>
                        </div>
                    </div>

                    {/* Term List */}
                    <div className="lg:col-span-2 space-y-4">
                        {terms.length > 0 ? terms.map(term => (
                            <div key={term.id} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${term.locked ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{term.name}</h4>
                                        <p className="text-xs text-gray-500">{term.startDate} — {term.endDate} • {term.academicYear}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {term.locked ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/10 text-red-600 text-xs font-bold rounded-full">
                                            <Lock size={12} /> Betyg låsta
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 text-xs font-bold rounded-full">
                                            <Unlock size={12} /> Betygsläge aktivt
                                        </span>
                                    )}
                                    <button
                                        onClick={() => toggleTermLock(term.id, term.locked)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-indigo-600"
                                    >
                                        <Settings2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
                                Inga terminer definierade
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Policy */}
                    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-indigo-600" />
                            Publicera Skolpolicy
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Titel</label>
                                <input
                                    value={newPolicy.title}
                                    onChange={e => setNewPolicy({ ...newPolicy, title: e.target.value })}
                                    placeholder="t.ex. Ordningsregler 2026"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Innehåll</label>
                                <textarea
                                    rows={6}
                                    value={newPolicy.content}
                                    onChange={e => setNewPolicy({ ...newPolicy, content: e.target.value })}
                                    placeholder="Policytext..."
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm resize-none"
                                />
                            </div>
                            <button
                                onClick={handleCreatePolicy}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                            >
                                Publicera Policy
                            </button>
                        </div>
                    </div>

                    {/* Policy List */}
                    <div className="lg:col-span-2 space-y-4">
                        {policies.length > 0 ? policies.map(policy => (
                            <div key={policy.id} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{policy.title}</h4>
                                            <p className="text-xs text-gray-500">Version {policy.version} • {new Date(policy.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">85%</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Acceptans</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent flex items-center justify-center text-[10px] font-bold text-emerald-500">
                                            OK
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {policy.content}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white dark:border-[#1c1c1e] flex items-center justify-center text-[10px] font-bold text-gray-500">U{i}</div>
                                        ))}
                                        <div className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white dark:border-[#1c1c1e] flex items-center justify-center text-[10px] font-bold text-white">+12</div>
                                    </div>
                                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                                        <UserCheck size={14} /> Visa alla acceptanser
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
                                Inga policys publicerade
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicGovernance;
