import React, { useEffect, useState } from 'react';
import { X, Save, CheckCircle, Loader2 } from 'lucide-react';

const OnlyOfficeEditor = ({ documentId, userId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(`/api/onlyoffice/config/${documentId}?userId=${userId}`);
                if (!response.ok) throw new Error("Kunde inte hämta editor-inställningar");
                const data = await response.json();
                setConfig(data);
            } catch (error) {
                console.error("Failed to load ONLYOFFICE config", error);
                alert("Tekniskt fel vid laddning av editor: " + error.message);
                onClose();
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, [documentId, userId, onClose]);

    useEffect(() => {
        if (!config || !window.DocsAPI) return;

        // Initialize ONLYOFFICE
        const docEditor = new window.DocsAPI.DocEditor("onlyoffice-editor", {
            ...config,
            width: "100%",
            height: "100%",
            editorConfig: {
                ...config.editorConfig,
                lang: "sv",
                customization: {
                    autosave: true,
                    chat: false,
                    help: false,
                    compactHeader: true,
                    status: true
                }
            },
            events: {
                "onDocumentReady": () => {
                    console.log("ONLYOFFICE: Dokumentet är redo");
                },
                "onAppReady": () => {
                    console.log("ONLYOFFICE: Editorn är redo");
                }
            }
        });

        return () => {
            if (docEditor) docEditor.destroyEditor();
        };
    }, [config]);

    // Load script om den inte redan finns
    useEffect(() => {
        if (window.DocsAPI) return;

        const script = document.createElement("script");
        // Vi antar att ONLYOFFICE körs på port 8081 lokalt (se docker-compose)
        script.src = `http://${window.location.hostname}:8081/web-apps/apps/api/documents/api.js`;
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Behåll scriptet i DOM för att undvika flera laddningar
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col animate-in fade-in overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white dark:bg-[#1E1F20] px-6 py-3 flex items-center justify-between border-b border-gray-200 dark:border-[#3c4043] shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Save size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-none mb-1">
                            {config?.document?.title || "Öppnar dokument..."}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={10} className="text-green-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Auto-sparning aktiv</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold shadow-md hover:transform hover:scale-105 transition-all"
                    >
                        Stäng & Spara
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full transition-colors text-gray-400"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-[#F4F4F4] relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50">
                        <div className="flex flex-col items-center gap-4 bg-white dark:bg-[#1E1F20] p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300">
                            <Loader2 className="animate-spin text-indigo-600" size={48} />
                            <div className="text-center">
                                <p className="font-black text-xl text-gray-900 dark:text-white mb-1">Laddar ONLYOFFICE</p>
                                <p className="text-sm text-gray-500">Förbereder din arbetsyta...</p>
                            </div>
                        </div>
                    </div>
                )}
                <div id="onlyoffice-editor" className="w-full h-full"></div>
            </div>
        </div>
    );
};

export default OnlyOfficeEditor;
