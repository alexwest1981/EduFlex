import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { api } from '../../services/api';

const OnlyOfficeSettings = () => {
    const [settings, setSettings] = useState({
        onlyoffice_url: 'http://localhost:8080',
        onlyoffice_enabled: 'true'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [health, setHealth] = useState(null);
    const [checkingHealth, setCheckingHealth] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await api.system.getSettings();
            const ooSettings = {};
            data.forEach(s => {
                if (s.settingKey === 'onlyoffice_url' || s.settingKey === 'onlyoffice_enabled') {
                    ooSettings[s.settingKey] = s.settingValue;
                }
            });
            setSettings(prev => ({ ...prev, ...ooSettings }));
        } catch (e) {
            console.error('Failed to fetch ONLYOFFICE settings:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                api.system.updateSetting('onlyoffice_url', settings.onlyoffice_url),
                api.system.updateSetting('onlyoffice_enabled', settings.onlyoffice_enabled)
            ]);
            alert('Inställningar sparade!');
        } catch (e) {
            alert('Kunde inte spara: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const checkHealth = async () => {
        setCheckingHealth(true);
        try {
            const status = await api.onlyoffice.checkHealth();
            setHealth(status);
        } catch (e) {
            setHealth({ status: 'error', message: e.message });
        } finally {
            setCheckingHealth(false);
        }
    };

    if (loading) {
        return <div className="p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        </div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ONLYOFFICE-integration</h2>
                <p className="text-gray-500 dark:text-gray-400">Konfigurera anslutningen till din ONLYOFFICE Document Server.</p>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                        <Cloud size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Serverinställningar</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ange URL och status för dokumentredigering</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Document Server URL
                        </label>
                        <input
                            type="text"
                            value={settings.onlyoffice_url}
                            onChange={(e) => setSettings({ ...settings, onlyoffice_url: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-mono text-sm"
                            placeholder="https://onlyoffice.example.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">Säkerställ att servern är åtkomlig för både frontend och backend via denna URL.</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                        <div>
                            <span className="font-medium text-gray-900 dark:text-white">Aktivera integration</span>
                            <p className="text-xs text-gray-500">Tillämpar ONLYOFFICE för alla kompatibla dokumenttyper (docx, xlsx, pptx)</p>
                        </div>
                        <div className="flex-shrink-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.onlyoffice_enabled === 'true'}
                                    onChange={(e) => setSettings({ ...settings, onlyoffice_enabled: e.target.checked ? 'true' : 'false' })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg hover:transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        Spara inställningar
                    </button>
                    <button
                        onClick={checkHealth}
                        disabled={checkingHealth}
                        className="px-6 py-3 bg-gray-100 dark:bg-[#282a2c] text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition-all flex items-center justify-center gap-2"
                    >
                        {checkingHealth ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        Testa anslutning
                    </button>
                </div>

                {health && (
                    <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${health.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                        {health.status === 'success' ? <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" /> : <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />}
                        <div>
                            <p className="font-bold">{health.status === 'success' ? 'Anslutning lyckades!' : 'Anslutning misslyckades'}</p>
                            <p className="text-sm">{health.message || (health.status === 'success' ? 'Document Server svarar korrekt.' : 'Kunde inte nå Document Server.')}</p>
                            {health.version && (
                                <div className="mt-2 flex items-center gap-2 text-xs font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded w-fit">
                                    Version: {health.version}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnlyOfficeSettings;
