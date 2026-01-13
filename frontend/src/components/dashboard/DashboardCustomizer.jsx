import React, { useState } from 'react';
import { Settings, X, Eye, EyeOff } from 'lucide-react';

/**
 * Component for customizing dashboard widgets.
 * @param {Object} widgets - Current widget state
 * @param {Function} toggleWidget - Function to toggle a widget
 * @param {Object} widgetLabels - Map of widget keys to display names
 */
const DashboardCustomizer = ({ widgets, toggleWidget, widgetLabels }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#282a2c]"
            >
                <Settings size={16} /> Anpassa
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-[#3c4043] animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Anpassa instrumentpanel</h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-full">
                                <X size={20} className="dark:text-white" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(widgetLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleWidget(key)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#282a2c]"
                                >
                                    <span className="font-bold dark:text-white">{label}</span>
                                    {widgets[key] ? (
                                        <Eye className="text-indigo-600" size={20} />
                                    ) : (
                                        <EyeOff className="text-gray-400" size={20} />
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700"
                        >
                            Klar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardCustomizer;
