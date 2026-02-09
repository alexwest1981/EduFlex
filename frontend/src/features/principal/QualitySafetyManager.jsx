import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    ShieldAlert,
    Eye,
    Plus,
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    User,
    MessageSquare,
    ChevronRight,
    Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const QualitySafetyManager = () => {
    const [incidents, setIncidents] = useState([]);
    const [observations, setObservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('incidents');
    const [showNewIncident, setShowNewIncident] = useState(false);

    // Form states
    const [newIncident, setNewIncident] = useState({
        type: 'BEHAVIOR',
        description: '',
        studentId: '',
        location: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const iData = await api.principal.quality.getIncidents();
            setIncidents(iData || []);
        } catch (err) {
            toast.error('Kunde inte ladda incidenter');
        } finally {
            setLoading(false);
        }
    };

    const handleReportIncident = async () => {
        if (!newIncident.description) return;
        try {
            await api.principal.quality.reportIncident(newIncident);
            setNewIncident({ type: 'BEHAVIOR', description: '', studentId: '', location: '' });
            setShowNewIncident(false);
            loadData();
            toast.success('Incident rapporterad');
        } catch (err) {
            toast.error('Kunde inte rapportera incident');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.principal.quality.updateIncident(id, status);
            loadData();
            toast.success(`Status uppdaterad: ${status}`);
        } catch (err) {
            toast.error('Kunde inte uppdatera status');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-lg">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kvalitet & Trygghet</h1>
                        <p className="text-sm text-gray-500">Hantera incidenter, utredningar och pedagogiska observationer.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowNewIncident(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                    <Plus size={18} /> Rapportera Incident
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 gap-8 mb-6">
                <button
                    onClick={() => setActiveTab('incidents')}
                    className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'incidents' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'}`}
                >
                    Incidentrapporter
                </button>
                <button
                    onClick={() => setActiveTab('observations')}
                    className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'observations' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'}`}
                >
                    Pedagogiska Observationer
                </button>
            </div>

            {activeTab === 'incidents' ? (
                <div className="space-y-4">
                    {incidents.length > 0 ? incidents.map(incident => (
                        <div key={incident.id} className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-xl ${incident.status === 'CLOSED' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-600'}`}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-900/10 px-2 py-0.5 rounded">
                                                    {incident.type}
                                                </span>
                                                <span className="text-xs text-gray-400">#INC-{incident.id} • {new Date(incident.reportedAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                Incident vid {incident.location || 'Okänd plats'}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={incident.status}
                                            onChange={(e) => updateStatus(incident.id, e.target.value)}
                                            className="text-xs font-bold bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="REPORTED">Anmäld</option>
                                            <option value="UNDER_INVESTIGATION">Under utredning</option>
                                            <option value="ACTION_TAKEN">Åtgärdad</option>
                                            <option value="CLOSED">Avslutad</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl italic">
                                    "{incident.description}"
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User size={14} />
                                            <span>Rapportör: <span className="font-bold text-gray-700 dark:text-gray-300">{incident.reporter?.fullName || 'System'}</span></span>
                                        </div>
                                        {incident.student && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Users size={14} />
                                                <span>Inblandad Elev: <span className="font-bold text-gray-700 dark:text-gray-300">{incident.student.fullName}</span></span>
                                            </div>
                                        )}
                                    </div>
                                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                                        Visa fullständig logg <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
                            Inga incidenter rapporterade
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-[500px]">
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Lärare</h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <input placeholder="Sök lärare..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border-none" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl cursor-default">
                                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Välj lärare i listan för att se loggar</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-[#1c1c1e] p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400">
                            <Eye size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="font-medium text-gray-500">Pedagogisk Ledning</p>
                            <p className="text-sm mt-1">Här kan du föra loggar över klassrumsbesök och ge feedforward till lärare.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for reporting incident */}
            {showNewIncident && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rapportera ny incident</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Typ av incident</label>
                                    <select
                                        value={newIncident.type}
                                        onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3"
                                    >
                                        <option value="BEHAVIOR">Uppförande</option>
                                        <option value="SAFETY">Säkerhetsrisk</option>
                                        <option value="BULLYING">Kränkning / Mobbning</option>
                                        <option value="PROPERTY">Skadegörelse</option>
                                        <option value="OTHER">Övrigt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Plats</label>
                                    <input
                                        value={newIncident.location}
                                        onChange={e => setNewIncident({ ...newIncident, location: e.target.value })}
                                        placeholder="t.ex. Matsalen, Korridoren vån 2"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Beskrivning</label>
                                    <textarea
                                        rows={4}
                                        value={newIncident.description}
                                        onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                                        placeholder="Vad hände? Var så objektiv som möjligt."
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowNewIncident(false)}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        onClick={handleReportIncident}
                                        className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
                                    >
                                        Skicka rapport
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualitySafetyManager;
