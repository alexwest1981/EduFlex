import React from 'react';
import { Check, X, Palette, Moon, Sun, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeModal = ({ isOpen, onClose }) => {
    const { themes, themeId, changeTheme, isThemeLocked } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] w-full max-w-4xl rounded-3xl shadow-2xl border border-[var(--border-main)] overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/5">

                {/* Header */}
                <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card)]/50 backdrop-blur-xl">
                    <div>
                        <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                            <span className="p-2 bg-brand-blue rounded-xl text-white shadow-lg shadow-brand-blue/20"><Palette size={20} /></span>
                            Temahanterare
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 ml-11 font-bold">Anpassa EduFlex utseende efter din organisation</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto bg-[var(--bg-main)]">
                    {isThemeLocked && (
                        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
                            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-black text-amber-500">Tema låst av organisation</p>
                                <p className="text-xs text-amber-500/80 mt-1 font-bold">
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
                                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-2xl
                                        ${isThemeLocked ? 'opacity-50 cursor-not-allowed' : ''}
                                        ${isActive
                                            ? 'border-brand-blue bg-[var(--bg-card)] shadow-xl shadow-brand-blue/10 scale-[1.02]'
                                            : 'border-transparent bg-[var(--bg-card)] hover:border-[var(--border-main)] hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <div className="absolute -top-3 -right-3 bg-brand-blue text-white p-1.5 rounded-full shadow-lg z-10 animate-bounce">
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                    )}

                                    {/* Preview Area */}
                                    <div className="h-32 rounded-xl mb-4 overflow-hidden relative shadow-inner border border-[var(--border-main)]">
                                        {/* Background gradient of the theme */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)]" />

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
                                            <h3 className={`font-black text-lg ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{theme.name}</h3>
                                            <div className="flex gap-1 mt-2">
                                                {[500, 600, 700].map(shade => (
                                                    <div key={shade} className="w-6 h-6 rounded-full shadow-sm border border-[var(--border-main)]" style={{ backgroundColor: theme.colors[shade] }} />
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
                <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-card)] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-bold">
                        <Moon size={16} /> <span>Dark mode anpassas automatiskt</span>
                    </div>
                    <button onClick={onClose} className="bg-brand-blue text-white px-8 py-3 rounded-xl font-black hover:opacity-90 transition-all shadow-lg shadow-brand-blue/20">
                        Klar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeModal;
