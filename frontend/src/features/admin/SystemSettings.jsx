import React, { useState, useEffect } from 'react';
import {
    Save, Database, Server, HardDrive, RefreshCw,
    Shield, Activity, Clock, Download, Upload,
    Trash2, AlertTriangle, CheckCircle, XCircle, Settings,
    Sparkles, Percent, Zap, MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SystemSettings = () => {
    const { systemSettings, updateSystemSetting } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [backups, setBackups] = useState([]);
    const [dbConnections, setDbConnections] = useState([]);
    const [activeTab, setActiveTab] = useState('general'); // general, database, backup

    // General Settings State
    const [generalForm, setGeneralForm] = useState({
        log_retention_days: 30
    });

    const [eduAiForm, setEduAiForm] = useState({
        eduai_xp_ratio: '1.0',
        eduai_credit_earn_rate: '5',
        eduai_proactivity: 'MEDIUM'
    });

    useEffect(() => {
        if (systemSettings) {
            setGeneralForm({
                site_name: systemSettings.site_name || '',
                support_email: systemSettings.support_email || '',
                maintenance_mode: systemSettings.maintenance_mode === 'true',
                log_retention_days: parseInt(systemSettings.log_retention_days || '30')
            });
            setEduAiForm({
                eduai_xp_ratio: systemSettings.eduai_xp_ratio || '1.0',
                eduai_credit_earn_rate: systemSettings.eduai_credit_earn_rate || '5',
                eduai_proactivity: systemSettings.eduai_proactivity || 'MEDIUM'
            });
        }
    }, [systemSettings]);

    useEffect(() => {
        if (activeTab === 'backup') fetchBackupData();
        if (activeTab === 'database') fetchDatabaseConnections();
    }, [activeTab]);

    const fetchBackupData = async () => {
        try {
            const data = await api.admin.listBackups();
            setBackups(data || []);
        } catch (err) {
            console.error('Failed to fetch backups:', err);
            // toast.error('Kunde inte hämta backuper'); // Optional: suppress error on initial load if API not ready
        }
    };

    const fetchDatabaseConnections = async () => {
        try {
            const data = await api.admin.getDatabaseConnections();
            setDbConnections(data || []);
        } catch (err) {
            console.error('Failed to fetch DB connections:', err);
        }
    };

    const handleSaveGeneral = async () => {
        setLoading(true);
        try {
            // Save each setting individually or via bulk update if API supports it
            await api.system.updateSetting('site_name', generalForm.site_name);
            await api.system.updateSetting('support_email', generalForm.support_email);
            await api.system.updateSetting('maintenance_mode', generalForm.maintenance_mode.toString());
            await api.system.updateSetting('log_retention_days', generalForm.log_retention_days.toString());

            // Update context
            updateSystemSetting('site_name', generalForm.site_name);
            updateSystemSetting('support_email', generalForm.support_email);
            updateSystemSetting('maintenance_mode', generalForm.maintenance_mode.toString());
            updateSystemSetting('log_retention_days', generalForm.log_retention_days.toString());

            toast.success('Inställningar sparade');
        } catch (err) {
            console.error('Failed to save settings:', err);
            toast.error('Kunde inte spara inställningar');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        if (!window.confirm('Vill du skapa en ny systembackup nu?')) return;
        try {
            await api.admin.createBackup();
            toast.success('Backup startad');
            fetchBackupData();
        } catch (err) {
            toast.error('Kunde inte starta backup');
        }
    };

    const handleRestoreBackup = async (backupId) => {
        if (!window.confirm('VARNING: Detta kommer att skriva över all nuvarande data. Är du säker?')) return;
        try {
            await api.admin.restoreBackup(backupId);
            toast.success('Återställning startad');
        } catch (err) {
            toast.error('Kunde inte starta återställning');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-[#3c4043] pb-1">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'bg-white dark:bg-[#1E1F20] text-indigo-600 dark:text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Settings size={16} /> Generellt
                </button>
                <button
                    onClick={() => setActiveTab('database')}
                    className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'database' ? 'bg-white dark:bg-[#1E1F20] text-indigo-600 dark:text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Database size={16} /> Databas
                </button>
                <button
                    onClick={() => setActiveTab('backup')}
                    className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'backup' ? 'bg-white dark:bg-[#1E1F20] text-indigo-600 dark:text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <HardDrive size={16} /> Backup & Återställning
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">

                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Systemkonfiguration</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webbplatsens namn</label>
                                    <input
                                        type="text"
                                        value={generalForm.site_name}
                                        onChange={(e) => setGeneralForm({ ...generalForm, site_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                                    <input
                                        type="email"
                                        value={generalForm.support_email}
                                        onChange={(e) => setGeneralForm({ ...generalForm, support_email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-lg border border-gray-200 dark:border-[#3c4043]">
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white block">Underhållsläge</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Stänger ner åtkomst för icke-administratörer</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={generalForm.maintenance_mode}
                                            onChange={(e) => setGeneralForm({ ...generalForm, maintenance_mode: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-[#3c4043]">
                            <button
                                onClick={handleSaveGeneral}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                Spara ändringar
                            </button>
                        </div>
                    </div>
                )}

                {/* EduAI TAB */}
                {activeTab === 'eduai' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">EduAI Center Inställningar</h3>
                                <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-[10px] font-bold rounded-full uppercase">Premium</span>
                            </div>

                            <div className="space-y-5">
                                <div className="p-4 bg-brand-orange/5 border border-brand-orange/10 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
                                            <Percent size={20} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 dark:text-white">XP Multiplikator</label>
                                            <p className="text-xs text-gray-500">Hur mycket extra XP ger AI-aktiviteter jämfört med vanliga kurser.</p>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="5.0"
                                        step="0.1"
                                        value={eduAiForm.eduai_xp_ratio}
                                        onChange={(e) => setEduAiForm({ ...eduAiForm, eduai_xp_ratio: e.target.value })}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                                    />
                                    <div className="flex justify-between mt-2 text-xs font-bold text-brand-orange">
                                        <span>0.1x</span>
                                        <span className="bg-brand-orange text-white px-2 py-0.5 rounded-full">{eduAiForm.eduai_xp_ratio}x</span>
                                        <span>5.0x</span>
                                    </div>
                                </div>



                                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 dark:text-white">AI-Coach Proaktivitet</label>
                                            <p className="text-xs text-gray-500">Bestämmer hur ofta coachen tar kontakt med studenten.</p>
                                        </div>
                                    </div>
                                    <select
                                        value={eduAiForm.eduai_proactivity}
                                        onChange={(e) => setEduAiForm({ ...eduAiForm, eduai_proactivity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                                    >
                                        <option value="LOW">Låg (Endast vid behov)</option>
                                        <option value="MEDIUM">Medel (Balanserad)</option>
                                        <option value="HIGH">Hög (Aktiv coachning)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-[#3c4043]">
                            <button
                                onClick={handleSaveEduAi}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-brand-orange text-white rounded-lg font-bold hover:bg-brand-orange/90 disabled:opacity-50 transition-colors shadow-lg shadow-brand-orange/20"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                Spara EduAI-inställningar
                            </button>
                        </div>
                    </div>
                )}

                {/* DATABASE TAB */}
                {activeTab === 'database' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Databasanslutningar</h3>
                            <button
                                onClick={fetchDatabaseConnections}
                                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg transition-colors"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {dbConnections.map((conn, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl border border-gray-200 dark:border-[#3c4043] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${conn.active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                            <Database size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{conn.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{conn.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${conn.status === 'CONNECTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {conn.status}
                                        </span>
                                        <span className="text-xs text-gray-400">{conn.poolSize} anslutningar</span>
                                    </div>
                                </div>
                            ))}
                            {dbConnections.length === 0 && (
                                <div className="text-center py-8 text-gray-500">Inga anslutningar hittades.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* BACKUP TAB */}
                {activeTab === 'backup' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Systembackuper</h3>
                                <p className="text-sm text-gray-500">Hantera manuella och schemalagda backuper.</p>
                            </div>
                            <button
                                onClick={handleCreateBackup}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                            >
                                <Plus size={18} /> Skapa Backup
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#3c4043]">
                                    <tr>
                                        <th className="px-4 py-3">Filnamn</th>
                                        <th className="px-4 py-3">Datum</th>
                                        <th className="px-4 py-3">Storlek</th>
                                        <th className="px-4 py-3">Typ</th>
                                        <th className="px-4 py-3 text-right">Åtgärder</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {backups.map((backup) => (
                                        <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{backup.filename}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(backup.createdAt).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{backup.size}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${backup.type === 'AUTO' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {backup.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRestoreBackup(backup.id)}
                                                        title="Återställ"
                                                        className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                    >
                                                        <RefreshCw size={16} />
                                                    </button>
                                                    <a
                                                        href={api.admin.downloadBackup(backup.id)}
                                                        title="Ladda ner"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                    <button
                                                        onClick={() => {/* Delete logic */ }}
                                                        title="Radera"
                                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {backups.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-500">Inga backuper hittades.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper icon for Plus since it was missing in imports
const Plus = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default SystemSettings;
