import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, Settings, ShoppingBag, Save, Trophy, Star, Award, Zap } from 'lucide-react';
import { api } from '../../../services/api';
import { getGamificationAssetPath } from '../../../utils/gamificationUtils';
import ShopItemEditor from './ShopItemEditor';
import AdminHeader from '../../dashboard/components/admin/AdminHeader';
import AdminNavbar from '../../dashboard/components/admin/AdminNavbar';
import toast from 'react-hot-toast';

const AdminShopDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('shop'); // shop, settings
    const [items, setItems] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [systemConfig, setSystemConfig] = useState(null);
    const [eduAiSettings, setEduAiSettings] = useState({
        eduai_xp_ratio: '1.0',
        eduai_credit_earn_rate: '5',
        eduai_proactivity: 'medium'
    });
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, FRAME, BACKGROUND, BADGE, TITLE

    useEffect(() => {
        if (activeTab === 'shop') {
            fetchItems();
        } else {
            fetchLeagues();
            fetchSystemConfig();
            fetchEduAiSettings();
        }
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/shop/items');
            setItems(response || []);
        } catch (err) {
            console.error("Failed to fetch shop items", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeagues = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/gamification/leagues');
            setLeagues(response || []);
        } catch (err) {
            console.error("Failed to fetch leagues", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemConfig = async () => {
        try {
            const res = await api.get('/admin/gamification/config');
            setSystemConfig(res);
        } catch (err) {
            console.error("Failed to fetch system config", err);
        }
    };

    const fetchEduAiSettings = async () => {
        try {
            const res = await api.get('/admin/gamification/eduai-center');
            setEduAiSettings(res || {
                eduai_xp_ratio: '1.0',
                eduai_credit_earn_rate: '5',
                eduai_proactivity: 'medium'
            });
        } catch (err) {
            console.error("Failed to fetch EduAI settings", err);
        }
    };

    const handleCreate = () => {
        setEditingItem(null); // Create mode
        setIsEditorOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item); // Edit mode
        setIsEditorOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Är du säker på att du vill ta bort detta föremål?")) return;
        try {
            await api.delete(`/admin/shop/items/${id}`);
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success("Föremål borttaget");
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Kunde inte ta bort föremålet.");
        }
    };

    const handleSave = async (itemPayload) => {
        try {
            if (editingItem) {
                // Update
                const res = await api.put(`/admin/shop/items/${editingItem.id}`, itemPayload);
                setItems(prev => prev.map(i => i.id === editingItem.id ? res : i));
                toast.success("Föremål uppdaterat");
            } else {
                // Create
                const res = await api.post('/admin/shop/items', itemPayload);
                setItems(prev => [...prev, res]);
                toast.success("Nytt föremål skapat");
            }
            setIsEditorOpen(false);
        } catch (err) {
            console.error("Save failed", err);
            throw err;
        }
    };

    const handleUpdateLeague = async (league) => {
        try {
            await api.put(`/admin/gamification/leagues/${league.id}`, league);
            toast.success(`${league.displayName} uppdaterad!`);
        } catch (err) {
            console.error("League update failed", err);
            toast.error("Kunde inte uppdatera ligan.");
        }
    };

    const handleUpdateSystemConfig = async (updates) => {
        try {
            const newConfig = { ...systemConfig, ...updates };
            const res = await api.put('/admin/gamification/config', newConfig);
            setSystemConfig(res);
            toast.success("Systeminställningar uppdaterade!");
        } catch (err) {
            console.error("Config update failed", err);
            toast.error("Kunde inte uppdatera inställningarna.");
        }
    };

    const handleUpdateEduAiSettings = async (updates) => {
        try {
            const newSettings = { ...eduAiSettings, ...updates };
            await api.put('/admin/gamification/eduai-center', newSettings);
            setEduAiSettings(newSettings);
            toast.success("EduAI Hub-inställningar uppdaterade!");
        } catch (err) {
            console.error("EduAI update failed", err);
            toast.error("Kunde inte uppdatera AI-inställningarna.");
        }
    };

    const handleGenerateDemoData = async () => {
        if (!window.confirm("Detta kommer att generera realistisk svensk demo-data (användare, kurser, resultat). Vill du fortsätta?")) return;
        setLoading(true);
        try {
            await api.post('/admin/demo/generate');
            toast.success("🚀 Demo-data har genererats framgångsrikt!");
        } catch (err) {
            console.error("Demo generation failed", err);
            toast.error("Kunde inte generera demo-data.");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = filter === 'ALL' ? items : items.filter(i => i.type === filter);

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <AdminHeader />
            <AdminNavbar />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Gamification Engine</h1>
                        <p className="text-gray-500 dark:text-gray-400">Hantera butik, ligor och belöningssystem.</p>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-[#1E1F20] p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'shop'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <ShoppingBag size={18} /> Butik
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'settings'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Settings size={18} /> Inställningar
                    </button>
                </div>

                {activeTab === 'shop' ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-gray-200 dark:border-[#282a2c]">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-2">
                                {['ALL', 'FRAME', 'BACKGROUND', 'BADGE', 'TITLE', 'PET'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filter === type
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400'
                                            }`}
                                    >
                                        {type === 'ALL' ? 'Alla' : type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Nytt föremål
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-20">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-gray-800"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Förhandsvisning</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Detaljer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Typ</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Pris/Sällsynthet</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Åtgärder</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredItems.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-transform">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={getGamificationAssetPath(item.imageUrl, item.type)}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</div>
                                                    <div className="text-[11px] text-gray-500 truncate max-w-xs">{item.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-[10px] font-black rounded-md uppercase tracking-tighter shadow-sm
                                                    ${item.type === 'FRAME' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                            item.type === 'BACKGROUND' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                                item.type === 'BADGE' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                                    'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm font-black text-gray-900 dark:text-white">
                                                        <Zap size={14} className="text-yellow-500 fill-yellow-500" /> {item.cost}
                                                    </div>
                                                    <div className={`text-[10px] font-bold uppercase tracking-widest 
                                                    ${item.rarity === 'LEGENDARY' ? 'text-orange-500' :
                                                            item.rarity === 'EPIC' ? 'text-purple-500' :
                                                                item.rarity === 'RARE' ? 'text-blue-500' :
                                                                    'text-gray-500'}`}>
                                                        {item.rarity}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    /* SETTINGS TAB */
                    <div className="space-y-8 animate-in slide-in-from-right-2 duration-300">
                        {/* LIGOR SECTION */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Ligakonfiguration</h2>
                                    <p className="text-xs text-gray-500">Ställ in poänggränser och namn för systemets ligor.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {leagues.map(league => (
                                    <div key={league.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleUpdateLeague(league)}
                                                className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Save size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-3xl bg-white dark:bg-gray-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-600">
                                                {league.icon}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={league.displayName}
                                                    onChange={(e) => setLeagues(prev => prev.map(l => l.id === league.id ? { ...l, displayName: e.target.value } : l))}
                                                    className="w-full bg-transparent font-black text-gray-900 dark:text-white border-0 p-0 focus:ring-0 text-lg tracking-tight uppercase"
                                                />
                                                <p className="text-[10px] text-gray-400 font-bold tracking-widest">{league.leagueKey}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Minsta poäng (XP)</label>
                                                <div className="relative">
                                                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                                                    <input
                                                        type="number"
                                                        value={league.minPoints}
                                                        onChange={(e) => setLeagues(prev => prev.map(l => l.id === league.id ? { ...l, minPoints: parseInt(e.target.value) } : l))}
                                                        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-9 pr-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Beskrivning av belöning</label>
                                                <textarea
                                                    value={league.rewardDescription || ''}
                                                    placeholder="t.ex. 'Exklusiva märken'"
                                                    onChange={(e) => setLeagues(prev => prev.map(l => l.id === league.id ? { ...l, rewardDescription: e.target.value } : l))}
                                                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all h-20 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DETAILED GLOBAL SETTINGS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Gamification Features & XP */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                            <Zap size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Global Gamification</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Maximal XP-Multiplikator</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="1.0"
                                                    max="5.0"
                                                    step="0.1"
                                                    value={systemConfig?.xpMultiplierMax || 1.0}
                                                    onChange={(e) => handleUpdateSystemConfig({ xpMultiplierMax: parseFloat(e.target.value) })}
                                                    className="flex-1 accent-indigo-600"
                                                />
                                                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 w-12">{systemConfig?.xpMultiplierMax?.toFixed(1) || '1.0'}x</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Topplistor', key: 'leaderboardsEnabled' },
                                                { label: 'Achievements', key: 'achievementsEnabled' },
                                                { label: 'Streaks', key: 'streaksEnabled' },
                                                { label: 'Dagliga utmaningar', key: 'dailyChallengesEnabled' },
                                                { label: 'Shop', key: 'shopEnabled' },
                                                { label: 'Tidsbonus', key: 'timeBonusEnabled' }
                                            ].map(feature => (
                                                <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{feature.label}</span>
                                                    <button
                                                        onClick={() => handleUpdateSystemConfig({ [feature.key]: !systemConfig?.[feature.key] })}
                                                        className={`w-10 h-5 rounded-full relative transition-colors ${systemConfig?.[feature.key] ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${systemConfig?.[feature.key] ? 'right-1' : 'left-1'}`}></div>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* EduAI Hub Rewards */}
                            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                        <Star size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">EduAI Hub Belöningar</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">XP-Ratio per AI-interaktion</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={eduAiSettings?.eduai_xp_ratio || '1.0'}
                                                onChange={(e) => handleUpdateEduAiSettings({ eduai_xp_ratio: e.target.value })}
                                                className="w-24 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold"
                                            />
                                            <p className="text-[11px] text-gray-500">Mängden XP som ges i förhållande till poäng i AI-aktiviteter.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Credits per Review</label>
                                        <input
                                            type="number"
                                            value={eduAiSettings?.eduai_credit_earn_rate || '5'}
                                            onChange={(e) => handleUpdateEduAiSettings({ eduai_credit_earn_rate: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold mb-1"
                                        />
                                        <p className="text-[10px] text-gray-500 font-medium">Antal AI-tokens som tjänas vid en godkänd granskning.</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">AI Proaktivitet</label>
                                        <select
                                            value={eduAiSettings?.eduai_proactivity || 'medium'}
                                            onChange={(e) => handleUpdateEduAiSettings({ eduai_proactivity: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold"
                                        >
                                            <option value="low">Låg (Endast vid förfrågan)</option>
                                            <option value="medium">Normal (Balanserad)</option>
                                            <option value="high">Hög (Proaktiv hjälp)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PILOT KIT: DEMO ENGINE */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Pilot-läge: Demo Data Engine</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Blixtsnabb setup för möten. Generera realistiska svenska användare, kurser och resultat direkt.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateDemoData}
                                    disabled={loading}
                                    className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                                >
                                    {loading ? 'Genererar...' : '🚀 Fyll med Demo-data'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isEditorOpen && (
                <ShopItemEditor
                    item={editingItem}
                    onSave={handleSave}
                    onCancel={() => setIsEditorOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminShopDashboard;
