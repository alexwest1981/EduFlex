import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Search,
    Plus,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertTriangle,
    MoreVertical,
    Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const IncidentManager = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newIncident, setNewIncident] = useState({
        title: '',
        description: '',
        type: 'OTHER',
        status: 'REPORTED'
    });

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        try {
            const data = await api.principal.quality.getIncidents();
            setIncidents(data);
        } catch (err) {
            toast.error('Kunde inte hämta incidenter');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.principal.quality.createIncident(newIncident);
            toast.success('Incident rapporterad');
            setShowForm(false);
            loadIncidents();
        } catch (err) {
            toast.error('Kunde inte spara incident');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'REPORTED': return 'bg-orange-100 text-orange-600';
            case 'UNDER_INVESTIGATION': return 'bg-blue-100 text-blue-600';
            case 'ACTION_TAKEN': return 'bg-indigo-100 text-indigo-600';
            case 'CLOSED': return 'bg-emerald-100 text-emerald-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const filteredIncidents = incidents.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Incidenthantering</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Kvalitet & Trygghet • Systematisk uppföljning</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-transform"
                >
                    <Plus size={20} />
                    Ny Incident
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats */}
                <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <AlertTriangle className="text-orange-500" size={24} />
                        <span className="text-2xl font-black">{incidents.filter(i => i.status === 'REPORTED').length}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Nya rapporter</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <Clock className="text-blue-500" size={24} />
                        <span className="text-2xl font-black">{incidents.filter(i => i.status === 'UNDER_INVESTIGATION').length}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Under utredning</p>
                </div>
                {/* ... more stats if needed */}
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                        <input
                            placeholder="Sök bland incidenter..."
                            className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 ring-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl font-bold text-sm">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-6 py-4">Tidpunkt</th>
                                <th className="px-6 py-4">Typ / Titel</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Rapportör</th>
                                <th className="px-6 py-4 text-right">Åtgärd</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></td></tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest opacity-50">Inga incidenter hittades</td></tr>
                            ) : filteredIncidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {new Date(incident.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                                                {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{incident.type}</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{incident.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(incident.status)}`}>
                                            {incident.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-500">
                                        {incident.reporter?.username || 'System'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Rapportera ny incident</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Titel</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 font-bold"
                                    placeholder="Kort beskrivning av vad som hänt"
                                    required
                                    value={newIncident.title}
                                    onChange={e => setNewIncident({ ...newIncident, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Typ</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 font-bold"
                                        value={newIncident.type}
                                        onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}
                                    >
                                        <option value="BULLYING">Kränkning / Mobbning</option>
                                        <option value="SAFETY">Säkerhet / Våld</option>
                                        <option value="PROPERTY_DAMAGE">Skadegörelse</option>
                                        <option value="OTHER">Övrigt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Viktighetsgrad</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 font-bold" defaultValue="PRIO">
                                        <option value="LOW">Normal</option>
                                        <option value="PRIO">Hög prioritet</option>
                                        <option value="CRITICAL">Kritisk / Akut</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Beskrivning</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 font-bold"
                                    placeholder="Detaljerad redogörelse för händelsen..."
                                    required
                                    value={newIncident.description}
                                    onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-bold text-gray-500">Avbryt</button>
                                <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-2xl font-bold p-4 shadow-lg shadow-indigo-100">Spara & Skicka</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncidentManager;
