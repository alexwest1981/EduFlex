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
                        <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-tight">Gamification Engine</h1>
                        <p className="text-[var(--text-secondary)] font-bold opacity-60">Hantera butik, ligor och belöningssystem.</p>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex space-x-1 bg-white/[0.03] p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'shop'
                            ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20'
                            : 'text-[var(--text-secondary)]/50 hover:text-[var(--text-primary)] hover:bg-white/5'
                            }`}
                    >
                        <ShoppingBag size={18} /> Butik
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'settings'
                            ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20'
                            : 'text-[var(--text-secondary)]/50 hover:text-[var(--text-primary)] hover:bg-white/5'
                            }`}
                    >
                        <Settings size={18} /> Inställningar
                    </button>
                </div>

                {activeTab === 'shop' ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-brand-blue/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 relative z-10">
                                {['ALL', 'FRAME', 'BACKGROUND', 'BADGE', 'TITLE', 'PET'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === type
                                            ? 'bg-brand-blue border-brand-blue text-white shadow-xl shadow-brand-blue/20'
                                            : 'bg-white/5 border-white/5 text-[var(--text-secondary)] hover:border-brand-blue/30'
                                            }`}
                                    >
                                        {type === 'ALL' ? 'Alla' : type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleCreate}
                                className="px-8 py-4 bg-brand-blue text-white rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-brand-blue/30 relative z-10"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Nytt föremål
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-40 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-main)] relative overflow-hidden gap-4">
                                <div className="absolute inset-0 bg-brand-blue/[0.01]"></div>
                                <div className="w-16 h-16 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.4em] relative z-10">Laddar butiken...</p>
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] overflow-hidden">
                                <table className="min-w-full divide-y divide-[var(--border-main)]">
                                    <thead className="bg-white/[0.02]">
                                        <tr>
                                            <th className="px-8 py-6 text-left text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em]">Förhandsvisning</th>
                                            <th className="px-8 py-6 text-left text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em]">Detaljer</th>
                                            <th className="px-8 py-6 text-left text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em]">Typ</th>
                                            <th className="px-8 py-6 text-left text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em]">Pris/Sällsynthet</th>
                                            <th className="px-8 py-6 text-right text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em]">Åtgärder</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-main)]">
                                        {filteredItems.map(item => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group relative">
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5 group-hover:scale-105 group-hover:border-brand-blue/30 transition-all shadow-inner">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={getGamificationAssetPath(item.imageUrl, item.type)}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="w-8 h-8 text-brand-blue/20" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm font-black text-[var(--text-primary)] group-hover:text-brand-blue transition-colors uppercase tracking-tight leading-none mb-2">{item.name}</div>
                                                    <div className="text-[11px] text-[var(--text-secondary)]/50 font-bold italic line-clamp-1 max-w-xs">{item.description}</div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span className={`px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-xl border
                                                    ${item.type === 'FRAME' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            item.type === 'BACKGROUND' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                item.type === 'BADGE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                                    'bg-white/5 text-[var(--text-secondary)] border-white/10'}`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-base font-black text-[var(--text-primary)] mb-1 uppercase tracking-tighter">
                                                        <Zap size={16} className="text-yellow-500" /> {item.cost}
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] 
                                                    ${item.rarity === 'LEGENDARY' ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]' :
                                                            item.rarity === 'EPIC' ? 'text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]' :
                                                                item.rarity === 'RARE' ? 'text-blue-500' :
                                                                    'text-[var(--text-secondary)]/40'}`}>
                                                        {item.rarity}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-3 bg-white/5 text-brand-blue hover:bg-brand-blue hover:text-white rounded-2xl transition-all shadow-xl hover:shadow-brand-blue/20"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-3 bg-white/5 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-xl hover:shadow-red-500/20"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
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
                    <div className="space-y-8 animate-in slide-in-from-right-2 duration-500">
                        {/* LIGOR SECTION */}
                        <div className="bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="flex items-center gap-4 mb-10 relative z-10">
                                <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-2xl shadow-xl border border-yellow-500/20">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none mb-1">Ligakonfiguration</h2>
                                    <p className="text-[10px] text-[var(--text-secondary)]/50 font-black uppercase tracking-[0.2em]">Ställ in poänggränser och namn för systemets ligor.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                {leagues.map(league => (
                                    <div key={league.id} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] relative group/card overflow-hidden transition-all hover:bg-white/[0.04] hover:border-brand-blue/20">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-all scale-75 group-hover/card:scale-100">
                                            <button
                                                onClick={() => handleUpdateLeague(league)}
                                                className="p-3 bg-brand-blue text-white rounded-2xl shadow-xl shadow-brand-blue/20 hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Save size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="text-3xl bg-white/5 w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-white/5 group-hover/card:border-brand-blue/30 transition-all">
                                                {league.icon}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={league.displayName}
                                                    onChange={(e) => setLeagues(prev => prev.map(l => l.id === league.id ? { ...l, displayName: e.target.value } : l))}
                                                    className="w-full bg-transparent font-black text-[var(--text-primary)] border-0 p-0 focus:ring-0 text-xl tracking-tighter uppercase leading-none"
                                                />
                                                <p className="text-[9px] text-[var(--text-secondary)]/40 font-black tracking-[0.3em] uppercase mt-1">{league.leagueKey}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div>
                                                <label className="text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] block mb-2">Minsta poäng (XP)</label>
                                                <div className="relative">
                                                    <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" />
                                                    <input
                                                        type="number"
                                                        value={league.minPoints}
                                                        onChange={(e) => setLeagues(prev => prev.map(l => l.id === league.id ? { ...l, minPoints: parseInt(e.target.value) } : l))}
                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] block mb-2">Beskrivning av belöning</label>
                                                <textarea
                                                    value={league.rewardDescription || ''}
                                                    placeholder="t.ex. 'Exklusiva märken'"
                                                    onChange={(e) => setLeagues(prev => prev.map(l => l.id === league.id ? { ...l, rewardDescription: e.target.value } : l))}
                                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-xs font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all h-24 resize-none shadow-inner"
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
                                <div className="bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] p-8">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-4 bg-brand-blue/10 text-brand-blue rounded-2xl shadow-xl border border-brand-blue/20">
                                            <Zap size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase">Global Gamification</h2>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] block mb-4">Maximal XP-Multiplikator</label>
                                            <div className="flex items-center gap-6">
                                                <div className="flex-1 h-2 bg-white/5 rounded-full relative overflow-hidden group/range">
                                                    <input
                                                        type="range"
                                                        min="1.0"
                                                        max="5.0"
                                                        step="0.1"
                                                        value={systemConfig?.xpMultiplierMax || 1.0}
                                                        onChange={(e) => handleUpdateSystemConfig({ xpMultiplierMax: parseFloat(e.target.value) })}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-brand-blue shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
                                                        style={{ width: `${((systemConfig?.xpMultiplierMax || 1.0) - 1.0) / 4.0 * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-2xl font-black text-brand-blue w-20 text-right">{systemConfig?.xpMultiplierMax?.toFixed(1) || '1.0'}x</span>
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
                                                <div key={feature.key} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-brand-blue/20 transition-all group/toggle">
                                                    <span className="text-[10px] font-black text-[var(--text-secondary)]/60 uppercase tracking-widest group-hover/toggle:text-[var(--text-primary)] transition-colors">{feature.label}</span>
                                                    <button
                                                        onClick={() => handleUpdateSystemConfig({ [feature.key]: !systemConfig?.[feature.key] })}
                                                        className={`w-12 h-6 rounded-full relative transition-all duration-500 shadow-inner ${systemConfig?.[feature.key] ? 'bg-brand-blue' : 'bg-white/5'}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-xl ${systemConfig?.[feature.key] ? 'right-1' : 'left-1'}`}></div>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* EduAI Hub Rewards */}
                            <div className="bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] p-8">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl shadow-xl border border-purple-500/20">
                                        <Star size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase">EduAI Hub Belöningar</h2>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] block mb-2">XP-Ratio per AI-interaktion</label>
                                        <div className="flex items-center gap-6">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={eduAiSettings?.eduai_xp_ratio || '1.0'}
                                                onChange={(e) => handleUpdateEduAiSettings({ eduai_xp_ratio: e.target.value })}
                                                className="w-24 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner"
                                            />
                                            <p className="text-[11px] text-[var(--text-secondary)]/40 font-bold italic">Mängden XP som ges i förhållande till poäng i AI-aktiviteter.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] block mb-2">Credits per Review</label>
                                        <input
                                            type="number"
                                            value={eduAiSettings?.eduai_credit_earn_rate || '5'}
                                            onChange={(e) => handleUpdateEduAiSettings({ eduai_credit_earn_rate: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner mb-2"
                                        />
                                        <p className="text-[9px] text-[var(--text-secondary)]/40 font-black tracking-widest uppercase">Antal AI-tokens som tjänas vid en godkänd granskning.</p>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] block mb-2">AI Proaktivitet</label>
                                        <select
                                            value={eduAiSettings?.eduai_proactivity || 'medium'}
                                            onChange={(e) => handleUpdateEduAiSettings({ eduai_proactivity: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner appearance-none cursor-pointer"
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
                        <div className="bg-brand-blue/5 rounded-[3rem] border-2 border-dashed border-brand-blue/20 p-10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-brand-blue/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="p-6 bg-brand-blue text-white rounded-[2rem] shadow-2xl shadow-brand-blue/30 group-hover:scale-110 transition-transform">
                                        <Zap size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none mb-2">Pilot-läge: Demo Data Engine</h2>
                                        <p className="text-sm text-[var(--text-secondary)]/60 font-medium max-w-xl">Blixtsnabb setup för möten. Generera realistiska svenska användare, kurser och resultat direkt i systemet.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateDemoData}
                                    disabled={loading}
                                    className="w-full lg:w-auto px-12 py-5 bg-brand-blue text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-blue/40 flex items-center justify-center gap-3 whitespace-nowrap disabled:opacity-50"
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
