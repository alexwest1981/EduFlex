import React from 'react';
import { Check, X, Palette, Moon, Sun, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeModal = ({ isOpen, onClose }) => {
    const { themes, themeId, changeTheme, isThemeLocked } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50/50 dark:bg-[#282a2c]/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <span className="p-2 bg-indigo-600 rounded-lg text-white"><Palette size={20} /></span>
                            Temahanterare
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">Anpassa EduFlex utseende efter din organisation</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#3c4043] rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto bg-gray-50 dark:bg-[#131314]">
                    {isThemeLocked && (
                        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-center gap-3">
                            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Tema låst av organisation</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                    Din organisation har valt ett standardtema. Kontakta din administratör för att ändra detta.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {themes.map((theme) => {
                            const isActive = themeId === theme.id;
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => changeTheme(theme.id)}
                                    disabled={isThemeLocked}
                                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-xl
                                        ${isThemeLocked ? 'opacity-50 cursor-not-allowed' : ''}
                                        ${isActive
                                            ? 'border-indigo-600 bg-white dark:bg-[#1E1F20] shadow-lg scale-[1.02]'
                                            : 'border-transparent bg-white dark:bg-[#1E1F20] hover:border-gray-300 dark:hover:border-[#3c4043]'
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-md z-10 animate-bounce">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}

                                    {/* Preview Area */}
                                    <div className="h-32 rounded-xl mb-4 overflow-hidden relative shadow-inner border border-gray-100 dark:border-[#3c4043]">
                                        {/* Background gradient of the theme */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#282a2c] dark:to-[#131314]" />

                                        {/* Dummy UI Elements showing Theme Colors */}
                                        <div className="absolute top-4 left-4 right-4 h-8 rounded-lg flex items-center px-3" style={{ backgroundColor: theme.colors[600] }}>
                                            <div className="w-2 h-2 rounded-full bg-white/50 mr-2"></div>
                                            <div className="w-16 h-2 rounded-full bg-white/30"></div>
                                        </div>

                                        <div className="absolute top-16 left-4 w-12 h-12 rounded-lg opacity-80" style={{ backgroundColor: theme.colors[200] }}></div>
                                        <div className="absolute top-16 left-20 right-4 h-12 rounded-lg border-2 border-dashed opacity-50 flex items-center justify-center" style={{ borderColor: theme.colors[400] }}>
                                            <div className="w-20 h-2 rounded-full" style={{ backgroundColor: theme.colors[300] }}></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className={`font-bold text-lg ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{theme.name}</h3>
                                            <div className="flex gap-1 mt-2">
                                                {[500, 600, 700].map(shade => (
                                                    <div key={shade} className="w-6 h-6 rounded-full shadow-sm border border-gray-100 dark:border-transparent" style={{ backgroundColor: theme.colors[shade] }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Moon size={16} /> <span>Dark mode anpassas automatiskt</span>
                    </div>
                    <button onClick={onClose} className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                        Klar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeModal;
