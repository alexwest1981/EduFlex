import React from 'react';
import { X, Bot, Info, ShieldCheck, Cpu } from 'lucide-react';

/**
 * AiExplanationModal
 * 
 * Displays the "Why" behind an AI recommendation or decision.
 * Promotes transparency and trust (XAI - Explainable AI).
 * 
 * @param {boolean} isOpen - If the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {string} title - The title of the recommendation
 * @param {string} reasoning - The explanation text (why this was recommended)
 * @param {string} aiModel - The model used (optional)
 * @param {object} contextData - Key-value pairs of what data was used (optional)
 */
const AiExplanationModal = ({ isOpen, onClose, title, reasoning, aiModel = "Gemini 1.5 Flash", contextData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">AI-Analys</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* The "What" */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            <Info size={14} /> Vad rekommenderas?
                        </h4>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {title}
                        </p>
                    </div>

                    {/* The "Why" */}
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">
                            <Cpu size={14} /> Varför just detta?
                        </h4>
                        <p className="text-gray-700 dark:text-indigo-100 leading-relaxed">
                            {reasoning || "Ingen specifik förklaring tillgänglig för detta beslut."}
                        </p>
                    </div>

                    {/* The "Review" */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            <ShieldCheck size={14} /> Datagrundlag
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                <span className="block text-xs text-gray-500 mb-1">Modell</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">{aiModel}</span>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                <span className="block text-xs text-gray-500 mb-1">Sekretess</span>
                                <span className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <ShieldCheck size={12} /> Skyddad
                                </span>
                            </div>
                        </div>
                        {contextData && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                                {JSON.stringify(contextData, null, 2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiExplanationModal;
