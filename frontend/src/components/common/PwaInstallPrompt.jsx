import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePwaInstall } from '../../hooks/usePwaInstall'; // Import the hook

/**
 * PwaInstallPrompt
 * 
 * Listens for the 'beforeinstallprompt' event and displays a custom install UI.
 * This allows users to install EduFlex as a native-like app on their device.
 */
const PwaInstallPrompt = () => {
    const { isInstalled, canInstall, install } = usePwaInstall();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (canInstall) {
            setIsVisible(true);
        }
    }, [canInstall]);

    const handleInstallClick = async () => {
        const success = await install();
        if (success) {
            setIsVisible(false);
            toast.success('EduFlex installeras...');
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    }

    if (!canInstall || isInstalled || !isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-2 p-1 pr-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-3 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                >
                    <Download size={18} />
                    <div className="text-left">
                        <p className="text-[10px] uppercase tracking-wider opacity-90 font-semibold">Installera</p>
                        <p className="text-sm font-bold leading-tight">EduFlex App</p>
                    </div>
                </button>
                <button
                    onClick={handleDismiss}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default PwaInstallPrompt;
