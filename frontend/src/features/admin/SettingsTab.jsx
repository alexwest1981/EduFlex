import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useModules } from '../../context/ModuleContext';
import { useAppContext } from '../../context/AppContext'; // <--- Hämta settings från context
import { api } from '../../services/api';
import { Settings, Box, Zap, MessageSquare, Moon, FileText, CheckCircle, Save, Palette, Download, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ThemeModal from '../system/ThemeModal';

const SettingsTab = () => {
    const { t, i18n } = useTranslation();
    const { modules, refreshModules } = useModules();
    const { systemSettings, updateSystemSetting } = useAppContext(); // <---
    const [toggling, setToggling] = useState(null);

    // State för formulär
    const [siteName, setSiteName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [license, setLicense] = useState(null);

    // Theme Stuff
    const { themeId, themes } = useTheme();
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const currentTheme = themes.find(t => t.id === themeId) || themes[0];

    useEffect(() => {
        if (systemSettings?.site_name) setSiteName(systemSettings.site_name);
        fetchLicense();
    }, [systemSettings]);

    const fetchLicense = async () => {
        try {
            const res = await api.license.getStatus();
            setLicense(res);
        } catch (e) {
            console.error("Failed to fetch license", e);
        }
    };

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
            alert(e.response?.data?.message || "Kunde inte ändra modulstatus. Uppgradera licens?");
        } finally {
            setToggling(null);
        }
    };

    const getIcon = (key) => {
        switch (key) {
            case 'DARK_MODE': return <Moon size={24} className="text-indigo-500" />;
            case 'CHAT': return <MessageSquare size={24} className="text-green-500" />;
            case 'GAMIFICATION': return <Zap size={24} className="text-yellow-500" />;
            case 'QUIZ': return <CheckCircle size={24} className="text-purple-500" />;
            case 'SUBMISSIONS': return <FileText size={24} className="text-blue-500" />;
            case 'REVENUE': return <DollarSign size={24} className="text-emerald-500" />;
            default: return <Box size={24} className="text-gray-500" />;
        }
    };

    const isLocked = (key) => {
        if (!license || !license.tier) return false;
        // Hardcoded frontend logic to match backend Enums for instant feedback
        // BASIC: No Quiz, Chat, Forum, Analytics, Gamification
        // PRO: No Analytics, Gamification
        // ENTERPRISE: All allowed
        const tier = license.tier;
        if (tier === 'ENTERPRISE') return false;

        if (tier === 'BASIC') {
            if (['QUIZ', 'CHAT', 'FORUM', 'ANALYTICS', 'GAMIFICATION'].includes(key)) return true;
        }
        if (tier === 'PRO') {
            if (['ANALYTICS', 'GAMIFICATION'].includes(key)) return true;
        }
        return false;
    };

    return (
        <div className="animate-in fade-in space-y-8">

            {/* 1. GENERAL SETTINGS (Namnbyte) */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skolans Profil</h2>
                        <p className="text-gray-500 text-sm">Anpassa namnet som visas i sidomenyn.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-end max-w-lg">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Standardspråk</label>
                        <select
                            className="w-full p-3 border rounded-xl dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                            value={systemSettings?.default_language || 'sv'}
                            onChange={async (e) => {
                                const newLang = e.target.value;
                                await api.settings.update('default_language', newLang);
                                updateSystemSetting('default_language', newLang);
                                i18n.changeLanguage(newLang); // Immediate visible feedback
                            }}
                        >
                            <option value="sv">Svenska</option>
                            <option value="en">English</option>
                            <option value="no">Norsk</option>
                            <option value="da">Dansk</option>
                            <option value="fi">Suomi</option>
                            <option value="ar">العربية</option>
                            <option value="de">Deutsch</option>
                            <option value="fr">Français</option>
                            <option value="es">Español</option>
                        </select>
                    </div>

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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Systemmoduler</h2>
                            <p className="text-gray-500 text-sm">Aktivera eller inaktivera funktioner globalt.</p>
                        </div>
                    </div>
                    {license && (
                        <div className="px-4 py-2 bg-gray-100 dark:bg-[#131314] rounded-lg border dark:border-[#3c4043]">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mr-2">Plan:</span>
                            <span className={`text-sm font-bold ${license.tier === 'ENTERPRISE' ? 'text-purple-600' : license.tier === 'PRO' ? 'text-indigo-600' : 'text-gray-600'}`}>
                                {license.tier}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* THEME MANAGER CARD (Manual Injection) */}
                    <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10 col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full">
                            <div className="p-3 bg-white dark:bg-[#1E1F20] rounded-lg shadow-sm text-indigo-600">
                                <Palette size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Temahanterare</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-gray-500">Aktivt tema:</p>
                                    <span className="text-sm font-bold px-2 py-0.5 rounded flex items-center gap-2 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/10" style={{ color: currentTheme?.colors[600] }}>
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentTheme?.colors[500] }}></div>
                                        {currentTheme?.name}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Anpassa systemets utseende (PRO/ENTERPRISE)</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsThemeModalOpen(true)}
                            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <Settings size={16} /> Hantera Tema
                        </button>
                    </div>

                    {modules.map(mod => {
                        const locked = isLocked(mod.moduleKey);
                        return (
                            <div key={mod.id} className={`p-5 rounded-xl border transition-all ${mod.active ? 'border-green-200 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10' : 'border-gray-200 bg-gray-50 dark:border-[#3c4043] dark:bg-[#131314]'} ${locked ? 'opacity-70 grayscale' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-[#1E1F20] rounded-lg shadow-sm">
                                            {getIcon(mod.moduleKey)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {mod.name}
                                                {locked && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded flex items-center gap-1">🔒 LÅST</span>}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono bg-gray-200 dark:bg-[#3c4043] px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">v{mod.version}</span>
                                                {/* {mod.requiresLicense && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">LICENS</span>} */}
                                            </div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={mod.active}
                                            onChange={() => handleToggle(mod.moduleKey, mod.active)}
                                            disabled={toggling === mod.moduleKey || locked}
                                        />
                                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${locked ? 'cursor-not-allowed' : 'peer-checked:bg-green-500'}`}></div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{mod.description}</p>
                                {locked && <p className="text-[10px] text-red-500 mt-1 font-semibold">Kräver uppgradering till PRO/ENTERPRISE</p>}
                            </div>
                        )
                    })}
                </div>
            </div>

            <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
        </div>
    );
};

export default SettingsTab;
