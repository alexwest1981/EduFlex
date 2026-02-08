import React, { useState, useEffect } from 'react';
import { Server, Database, HardDrive, Download, Upload, RefreshCw, AlertTriangle, CheckCircle, Clock, Trash2, Plus, Settings, Folder, User, Calendar, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import AddDatabaseModal from '../../components/AddDatabaseModal';
import SwitchDatabaseModal from '../../components/SwitchDatabaseModal';

const SystemConfigField = ({ configKey, placeholder }) => {
    const { systemSettings, updateSystemSetting } = useAppContext();
    const [value, setValue] = useState(systemSettings?.[configKey] || '');
    const [saving, setSaving] = useState(false);

    // Update local state when systemSettings loads
    useEffect(() => {
        if (systemSettings?.[configKey]) setValue(systemSettings[configKey]);
    }, [systemSettings, configKey]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.system.updateSetting(configKey, value);
            updateSystemSetting(configKey, value);
            alert('Sparat!');
        } catch (e) {
            console.error(e);
            alert('Kunde inte spara.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex gap-2 w-full">
            <input
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
            />
            <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
                {saving ? '...' : 'Spara'}
            </button>
        </div>
    );
};

const ServerSettings = () => {
    const [backups, setBackups] = useState([]);
    const [backupStatus, setBackupStatus] = useState({ running: false, lastBackup: null });
    const [dbConnections, setDbConnections] = useState([]);
    const [activeDb, setActiveDb] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [isAddDbModalOpen, setIsAddDbModalOpen] = useState(false);
    const [isSwitchDbModalOpen, setIsSwitchDbModalOpen] = useState(false);
    const [targetDatabase, setTargetDatabase] = useState(null);

    useEffect(() => {
        loadBackups();
        loadDatabaseConnections();
        loadBackupStatus();
    }, []);

    const loadBackups = async () => {
        try {
            const response = await api.get('/admin/backups');
            setBackups(response || []);
        } catch (error) {
            console.error('Failed to load backups:', error);
        }
    };

    const loadDatabaseConnections = async () => {
        try {
            const response = await api.get('/admin/database/connections');
            const data = response || [];
            // Handle both object wrapper and direct array response
            const connections = Array.isArray(data) ? data : (data.connections || []);
            setDbConnections(connections);
            // Find active DB from the list
            const activeConnection = connections.find(c => c.active);
            setActiveDb(activeConnection ? activeConnection.id : null);
        } catch (error) {
            console.error('Failed to load database connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBackupStatus = async () => {
        try {
            const response = await api.get('/admin/backups/status');
            setBackupStatus(response || { running: false, lastBackup: null });
        } catch (error) {
            console.error('Failed to load backup status:', error);
        }
    };

    const createBackup = async () => {
        setCreatingBackup(true);
        try {
            await api.post('/admin/backups/create');
            await loadBackups();
            await loadBackupStatus();
            alert('Backup skapad framgångsrikt!');
        } catch (error) {
            console.error('Failed to create backup:', error);
            alert('Misslyckades med att skapa backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    const restoreBackup = async (backupId) => {
        if (!confirm('Är du säker på att du vill återställa denna backup? Detta kommer att skriva över nuvarande data.')) {
            return;
        }

        try {
            await api.post(`/admin/backups/restore/${backupId}`);
            alert('Backup återställd framgångsrikt! Systemet startar om...');
            window.location.reload();
        } catch (error) {
            console.error('Failed to restore backup:', error);
            alert('Misslyckades med att återställa backup');
        }
    };

    const deleteBackup = async (backupId) => {
        if (!confirm('Är du säker på att du vill radera denna backup?')) {
            return;
        }

        try {
            await api.delete(`/admin/backups/${backupId}`);
            await loadBackups();
            alert('Backup raderad');
        } catch (error) {
            console.error('Failed to delete backup:', error);
            alert('Misslyckades med att radera backup');
        }
    };

    const downloadBackup = (backupId) => {
        window.open(api.admin.downloadBackup(backupId), '_blank');
    };

    const handleAddDatabase = async (formData) => {
        try {
            await api.post('/admin/database/add', formData);
            await loadDatabaseConnections();
            alert('Databas tillagd framgångsrikt!');
        } catch (error) {
            console.error('Failed to add database:', error);
            throw new Error(error.response?.data?.message || 'Misslyckades med att lägga till databas');
        }
    };

    const handleSwitchDatabase = (db) => {
        setTargetDatabase(db);
        setIsSwitchDbModalOpen(true);
    };

    const handleConfirmSwitch = async (adminPassword) => {
        try {
            await api.post(`/admin/database/switch/${targetDatabase.id}`, { adminPassword });
            alert('Databas bytt framgångsrikt! Systemet startar om...');
            window.location.reload();
        } catch (error) {
            console.error('Failed to switch database:', error);
            throw new Error(error.response?.data?.message || 'Fel lösenord eller operation misslyckades');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('sv-SE');
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* GENERAL SERVER SETTINGS */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-8 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <Settings size={24} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Allmän Serverinfo</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Konfigurera systemets offentliga profil.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 disabled:opacity-50 uppercase mb-2 block">Offentlig URL</label>
                        <div className="flex gap-2">
                            {/* Note: This assumes useAppContext is available or passed down. ServerSettings doesn't use it yet. 
                                I need to import useAppContext at the top and destruct systemSettings, updateSystemSetting.
                             */}
                            <SystemConfigField configKey="site_url" placeholder="https://www.eduflexlms.se" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Används för inbjudningar och länkar.</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 disabled:opacity-50 uppercase mb-2 block">Fysisk Adress</label>
                        <SystemConfigField configKey="site_address" placeholder="Gatuadress, Postnr Ort" />
                        <p className="text-xs text-gray-400 mt-2">Visas på fakturor och i sidfoten.</p>
                    </div>
                </div>
            </div>
            {/* BACKUP MANAGEMENT */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-8 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <HardDrive size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Automatiska Backups</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Senaste backup: {backupStatus?.lastBackup ? formatDate(backupStatus.lastBackup) : 'Aldrig'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={createBackup}
                        disabled={creatingBackup}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {creatingBackup ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Skapar...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Skapa Backup Nu
                            </>
                        )}
                    </button>
                </div>

                {/* Backup Schedule Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <Clock size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Backup-schema</h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Dagliga backups kl 02:00 (behålls i 7 dagar)</li>
                                <li>• Veckovisa backups på söndagar (behålls i 4 veckor)</li>
                                <li>• Månatliga backups den 1:a (behålls i 12 månader)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Backup List */}
                <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Folder size={20} className="text-blue-600" />
                        Tillgängliga Backups
                    </h4>

                    {!backups || backups.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Inga backups tillgängliga</p>
                    ) : (
                        <div className="space-y-8">
                            {[
                                { key: 'manual', label: 'Manuella Backupper', icon: <User size={18} /> },
                                { key: 'daily', label: 'Dagliga (Auto)', icon: <Clock size={18} /> },
                                { key: 'weekly', label: 'Veckovisa (Auto)', icon: <Calendar size={18} /> },
                                { key: 'monthly', label: 'Månatliga (Auto)', icon: <Calendar size={18} /> },
                                { key: 'last', label: 'Senaste (System)', icon: <Database size={18} /> },
                                { key: 'other', label: 'Övriga', icon: <FileText size={18} /> }
                            ].map(category => {
                                const filtered = backups.filter(b => b.type === category.key || (!b.type && category.key === 'other'));
                                if (filtered.length === 0) return null;

                                return (
                                    <div key={category.key} className="space-y-3">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#3c4043]">
                                            <div className="text-gray-600 dark:text-gray-400">
                                                {category.icon}
                                            </div>
                                            <h5 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {category.label} ({filtered.length})
                                            </h5>
                                        </div>
                                        <div className="space-y-2">
                                            {filtered.map((backup) => (
                                                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl border border-gray-200 dark:border-[#3c4043] hover:border-blue-400 dark:hover:border-blue-500 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white dark:bg-[#1E1F20] rounded-lg flex items-center justify-center border border-gray-200 dark:border-[#3c4043] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                                            <Database size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{backup.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDate(backup.createdAt)} • {formatSize(backup.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => downloadBackup(backup.id)}
                                                            title="Ladda ner"
                                                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => restoreBackup(backup.id)}
                                                            title="Återställ"
                                                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                                                        >
                                                            <Upload size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteBackup(backup.id)}
                                                            title="Radera"
                                                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* DATABASE MANAGEMENT */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-8 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Server size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Databashantering</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Byt databas vid nödfall eller underhåll</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddDbModalOpen(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Lägg till Databas
                    </button>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Varning</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                Att byta databas kommer att starta om systemet. Se till att alla användare är informerade innan du fortsätter.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Database Connections */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Tillgängliga Databasanslutningar</h4>
                    {dbConnections.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Inga databasanslutningar konfigurerade</p>
                    ) : (
                        <div className="space-y-2">
                            {dbConnections.map((db) => (
                                <div key={db.id} className={`flex items-center justify-between p-4 rounded-xl border ${db.id === activeDb
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                                    : 'bg-gray-50 dark:bg-[#282a2c] border-gray-200 dark:border-[#3c4043]'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <Database size={20} className={db.id === activeDb ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 dark:text-white">{db.name}</p>
                                                {db.id === activeDb && (
                                                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                        <CheckCircle size={12} />
                                                        AKTIV
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {db.host}:{db.port} • {db.database}
                                            </p>
                                        </div>
                                    </div>
                                    {db.id !== activeDb && (
                                        <button
                                            onClick={() => handleSwitchDatabase(db)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition text-sm"
                                        >
                                            Byt till denna
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddDatabaseModal
                isOpen={isAddDbModalOpen}
                onClose={() => setIsAddDbModalOpen(false)}
                onAdd={handleAddDatabase}
            />
            <SwitchDatabaseModal
                isOpen={isSwitchDbModalOpen}
                onClose={() => {
                    setIsSwitchDbModalOpen(false);
                    setTargetDatabase(null);
                }}
                onConfirm={handleConfirmSwitch}
                targetDatabase={targetDatabase}
            />
        </div>
    );
};

export default ServerSettings;
