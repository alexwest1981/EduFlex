import React, { useState } from 'react';
import { Globe, Plus, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';

const SusaNavImportModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [sunCode, setSunCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleImport = async () => {
        if (!sunCode.trim()) {
            setError('Vänligen ange en SUN-kod (t.ex. 481a)');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            // This calls the new endpoint created in V114: /api/courses/susanav/build/{sunCode}
            const response = await api.post(`/courses/susanav/build/${sunCode.trim()}`);
            setSuccessMsg(`Utbildningspaket för SUN-kod ${sunCode} skapades!`);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
                // Reset for next time
                setSunCode('');
                setSuccessMsg(null);
            }, 2000);
        } catch (err) {
            console.error('SUSA-navet import error:', err);
            setError(err.response?.data?.message || 'Ett fel inträffade vid hämtning från SUSA-navet.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 relative border border-gray-100 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#131314]/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                            <Globe size={20} />
                        </div>
                        <h3 className="font-bold text-lg dark:text-white">Skapa Yrkeshögskoleprogram</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Ange en SUN-kod för att hämta nationell utbildningsstruktur från Skolverkets SUSA-nav. EduFlex kommer att bygga upp ett komplett program med moduler automatiskt.
                    </p>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">SUN-kod</label>
                        <input
                            type="text"
                            placeholder="t.ex. 481a (Systemutvecklare)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#131314] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={sunCode}
                            onChange={(e) => setSunCode(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {successMsg && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{successMsg}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#131314]/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        disabled={isLoading}
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isLoading || !sunCode.trim() || successMsg}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Genererar struktur...
                            </>
                        ) : successMsg ? (
                            <>
                                <CheckCircle2 size={18} />
                                Klart!
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Hämta & Skapa
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SusaNavImportModal;
