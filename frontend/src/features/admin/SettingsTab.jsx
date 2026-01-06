import React, { useState, useEffect } from 'react';
import { useModules } from '../../context/ModuleContext';
import { useAppContext } from '../../context/AppContext'; // <--- Hämta settings från context
import { api } from '../../services/api';
import { Settings, Box, Zap, MessageSquare, Moon, FileText, CheckCircle, Save } from 'lucide-react';

const SettingsTab = () => {
    const { modules, refreshModules } = useModules();
    const { systemSettings, updateSystemSetting } = useAppContext(); // <---
    const [toggling, setToggling] = useState(null);

    // State för formulär
    const [siteName, setSiteName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(systemSettings?.site_name) setSiteName(systemSettings.site_name);
    }, [systemSettings]);

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        try {
            await api.settings.update('site_name', siteName);
            updateSystemSetting('site_name', siteName); // Uppdatera context live
            // Du kan lägga till en toast/notifikation här
        } catch (e) {
            alert("Kunde inte spara inställningar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = async (key, currentState) => {
        setToggling(key);
        try {
            await api.modules.toggle(key, !currentState);
            await refreshModules();
        } catch (e) {
            alert("Kunde inte ändra modulstatus.");
        } finally {
            setToggling(null);
        }
    };

    const getIcon = (key) => {
        switch(key) {
            case 'DARK_MODE': return <Moon size={24} className="text-indigo-500"/>;
            case 'CHAT': return <MessageSquare size={24} className="text-green-500"/>;
            case 'GAMIFICATION': return <Zap size={24} className="text-yellow-500"/>;
            case 'QUIZ': return <CheckCircle size={24} className="text-purple-500"/>;
            case 'SUBMISSIONS': return <FileText size={24} className="text-blue-500"/>;
            default: return <Box size={24} className="text-gray-500"/>;
        }
    };

    return (
        <div className="animate-in fade-in space-y-8">

            {/* 1. GENERAL SETTINGS (Namnbyte) */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                        <Settings size={24}/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skolans Profil</h2>
                        <p className="text-gray-500 text-sm">Anpassa namnet som visas i sidomenyn.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-end max-w-lg">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Skolans Namn (SITE_NAME)</label>
                        <input
                            className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            placeholder="T.ex. EduFlex"
                        />
                    </div>
                    <button
                        onClick={handleSaveGeneral}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Sparar...' : 'Spara'}
                    </button>
                </div>
            </div>

            {/* 2. MODULES (App Store) */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                        <Zap size={24}/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Systemmoduler</h2>
                        <p className="text-gray-500 text-sm">Aktivera eller inaktivera funktioner globalt.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modules.map(mod => (
                        <div key={mod.id} className={`p-5 rounded-xl border transition-all ${mod.active ? 'border-green-200 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10' : 'border-gray-200 bg-gray-50 dark:border-[#3c4043] dark:bg-[#131314]'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-[#1E1F20] rounded-lg shadow-sm">
                                        {getIcon(mod.moduleKey)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{mod.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-mono bg-gray-200 dark:bg-[#3c4043] px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">v{mod.version}</span>
                                            {mod.requiresLicense && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">LICENS</span>}
                                        </div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={mod.active}
                                        onChange={() => handleToggle(mod.moduleKey, mod.active)}
                                        disabled={toggling === mod.moduleKey}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{mod.description}</p>
                            <div className="mt-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider">{mod.active ? 'Active' : 'Disabled'}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;