import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Share, ChevronRight, Sparkles } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

const PwaInstallPrompt = () => {
    const { canInstall, install, isInstalled } = usePwaInstall();
    const [isVisible, setIsVisible] = useState(false);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        // Detect iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIos(ios);

        // Show prompt after a short delay if not installed
        if (!isInstalled) {
            const timer = setTimeout(() => {
                // Show if we can install via browser OR if it's iOS (manual guide)
                if (canInstall || ios) {
                    // Don't show if already dismissed this session
                    if (!sessionStorage.getItem('pwa_prompt_dismissed')) {
                        setIsVisible(true);
                    }
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isInstalled, canInstall]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    const handleInstall = async () => {
        const success = await install();
        if (success) {
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-[100] max-w-sm w-[calc(100vw-2rem)]"
            >
                <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-[#1E1F20]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-indigo-500/10">
                    {/* Decorative background flare */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="p-6 relative z-10">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-400"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                                {isIos ? <Smartphone size={24} /> : <Monitor size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Upplev EduFlex som App
                                    <Sparkles size={16} className="text-yellow-500" />
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Installera direkt på din enhet för snabbare åtkomst och en renare upplevelse.
                                </p>
                            </div>
                        </div>

                        {isIos ? (
                            <div className="space-y-3">
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/20">
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Instruktioner för iOS</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                                <Share size={14} className="text-blue-500" />
                                            </div>
                                            <span>Klicka på <strong>Dela</strong>-knappen</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                                <X size={14} className="rotate-45" />
                                            </div>
                                            <span>Välj <strong>Lägg till på hemskärmen</strong></span>
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Jag förstår
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleInstall}
                                    className="w-full py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Download size={18} />
                                    Installera Nu
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
                                >
                                    Kanske senare
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Feature badges */}
                    <div className="px-6 py-3 bg-gray-50/50 dark:bg-black/20 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                        <Badge label="Offline-stöd" />
                        <Badge label="Snabbare UI" />
                        <Badge label="Ingen webbläsarrad" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const Badge = ({ label }) => (
    <div className="flex items-center gap-1.5 opacity-60">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">{label}</span>
    </div>
);

export default PwaInstallPrompt;
