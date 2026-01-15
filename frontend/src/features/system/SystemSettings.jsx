import React, { useState } from 'react';
import { Palette, ShieldCheck, Zap, Server, Database, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useBranding } from '../../context/BrandingContext';
import ThemeModal from './ThemeModal';

import { useModules } from '../../context/ModuleContext';
import { api } from '../../services/api';

const SystemSettings = ({ asTab = false }) => {
    const navigate = useNavigate();
    const { themeId, themes } = useTheme();
    const { modules, refreshModules } = useModules();
    const { currentUser } = useAppContext();
    const { hasAccess } = useBranding();
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [toggling, setToggling] = useState(null);

    const currentTheme = themes.find(t => t.id === themeId) || themes[0];
    const isAdmin = currentUser?.role?.name === 'ADMIN' || currentUser?.role === 'ADMIN';

    const handleToggleModule = async (key, currentStatus) => {
        setToggling(key);
        try {
            await api.modules.toggle(key, !currentStatus);
            await refreshModules();
        } catch (e) {
            alert("Kunde inte ändra modulstatus: " + e.message);
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className={asTab ? "animate-in fade-in" : "p-8 max-w-7xl mx-auto animate-in fade-in pb-20"}>
            {!asTab && (
                <>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Systeminställningar</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Hantera globala inställningar, utseende och licenser för EduFlex.</p>
                </>
            )}

            {/* TOP GRID: THEME, WHITELABEL (IF ADMIN), LICENSE, SERVER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* TEMA HANTERARE */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-1 border border-gray-200 dark:border-[#3c4043] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-[#282a2c] dark:to-[#131314] rounded-[20px] p-6 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <Palette size={120} />
                        </div>

                        <div>
                            <div className="w-12 h-12 bg-white dark:bg-[#1E1F20] rounded-xl flex items-center justify-center shadow-sm text-indigo-600 mb-4">
                                <Palette size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Tema & Utseende</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Anpassa systemets färger och känsla.</p>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                <span>Aktivt Tema</span>
                                <div className="h-px bg-gray-200 dark:bg-[#3c4043] flex-1"></div>
                            </div>
                            <div className="flex items-center gap-3 mb-6 bg-white/50 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                                <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: currentTheme.colors[600] }}></div>
                                <span className="font-bold text-gray-900 dark:text-white">{currentTheme.name}</span>
                            </div>
                            <button
                                onClick={() => setIsThemeModalOpen(true)}
                                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg hover:transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={18} /> Öppna Temahanterare
                            </button>
                        </div>
                    </div>
                </div>

                {/* ENTERPRISE WHITELABEL - Only show for admins */}
                {isAdmin && (
                    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-1 border border-gray-200 dark:border-[#3c4043] shadow-sm hover:shadow-md transition-shadow group">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-[#282a2c] dark:to-[#131314] rounded-[20px] p-6 h-full flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                <Sparkles size={120} />
                            </div>

                            <div>
                                <div className="w-12 h-12 bg-white dark:bg-[#1E1F20] rounded-xl flex items-center justify-center shadow-sm text-purple-600 mb-4">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Enterprise Whitelabel</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fullt anpassningsbar branding för din organisation.</p>
                            </div>

                            <div className="mt-8">
                                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <span>Status</span>
                                    <div className="h-px bg-gray-200 dark:bg-[#3c4043] flex-1"></div>
                                </div>
                                <div className="mb-6 bg-white/50 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                                    {hasAccess ? (
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            ENTERPRISE-licens aktiv
                                        </span>
                                    ) : (
                                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                            <Lock size={16} />
                                            Kräver ENTERPRISE-licens
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate('/enterprise/whitelabel')}
                                    className={`w-full py-3 rounded-xl font-bold shadow-lg hover:transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${
                                        hasAccess
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}
                                    disabled={!hasAccess}
                                >
                                    <Sparkles size={18} /> {hasAccess ? 'Öppna Whitelabel' : 'Uppgradera för access'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LICENS STATUS */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center shadow-sm text-green-600 mb-4">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Licensstatus</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Information om din nuvarande plan.</p>

                    <div className="space-y-4 mt-auto">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Plan</span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black uppercase rounded">PRO / ENTERPRISE</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</span>
                            <span className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white"><CheckMark /> Aktiv</span>
                        </div>
                    </div>
                </div>

                {/* SERVER STATUS */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col opacity-60 pointer-events-none grayscale">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-[#282a2c] rounded-xl flex items-center justify-center shadow-sm text-gray-400 mb-4">
                        <Server size={24} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Serverinställningar</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hantera databas och cache.</p>
                        </div>
                        <Lock size={16} className="text-gray-400" />
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#3c4043] mt-auto">
                        <p className="text-xs text-center font-bold uppercase text-gray-400">Kommer snart</p>
                    </div>
                </div>
            </div>

            {/* MODULES SECTION */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Database size={24} className="text-indigo-500" /> Systemmoduler
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Aktivera eller inaktivera funktioner globalt. Vissa kräver högre licens.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {modules.map(mod => (
                        <div key={mod.moduleKey} className={`bg-white dark:bg-[#1E1F20] border ${mod.active ? 'border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-[#3c4043]'} p-6 rounded-2xl shadow-sm transition-all hover:shadow-md`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{mod.name}</h3>
                                        {mod.requiresLicense && (
                                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-200 dark:border-amber-800">PRO</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{mod.version}</p>
                                </div>
                                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        name={mod.moduleKey}
                                        id={mod.moduleKey}
                                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                                        style={{ transform: mod.active ? 'translateX(100%)' : 'translateX(0)' }}
                                        checked={mod.active}
                                        onChange={() => handleToggleModule(mod.moduleKey, mod.active)}
                                        disabled={toggling === mod.moduleKey}
                                    />
                                    <label
                                        htmlFor={mod.moduleKey}
                                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${mod.active ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    ></label>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{mod.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
        </div>
    );
};

const CheckMark = () => (
    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
);

export default SystemSettings;
