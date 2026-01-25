import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Loader2 } from 'lucide-react';
import { api, getTenantFromUrl } from '../../services/api';

const OnlyOfficeEditor = ({ entityType = 'DOCUMENT', entityId, userId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [ooUrl, setOoUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const tenantId = getTenantFromUrl();
                const tenantParam = tenantId ? `&tenantId=${tenantId}` : '';
                const data = await api.get(`/onlyoffice/config/${entityType}/${entityId}?userId=${userId}${tenantParam}`);

                // FORCE PUBLIC HTTPS URLs (Fix for OnlyOffice Iframe)
                // The browser/iframe environment cannot reach internal docker URLs.
                // We override the backend config with the browser's current public origin.
                if (data && data.document && data.editorConfig) {
                    const publicBaseUrl = window.location.origin; // https://www.eduflexlms.se

                    // Override Download URL
                    data.document.url = `${publicBaseUrl}/api/onlyoffice/download/${entityType}/${entityId}${tenantParam ? '?' + tenantParam.substring(1) : ''}`;

                    // Override Callback URL
                    data.editorConfig.callbackUrl = `${publicBaseUrl}/api/onlyoffice/callback/${entityType}/${entityId}${tenantParam ? '?' + tenantParam.substring(1) : ''}`;

                    console.log("🔒 Enforced Public URLs for OnlyOffice:", {
                        download: data.document.url,
                        callback: data.editorConfig.callbackUrl
                    });
                }

                setConfig(data);
            } catch (err) {
                console.error("Failed to load ONLYOFFICE config", err);
                setError(err.message || "Ett okänt fel inträffade vid laddning av editor.");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchOoUrl = async () => {
            // Reverting to Relative URL (Proxy) to match the HTTP Backend.
            // Vite Proxy forwards '/web-apps' -> 'http://onlyoffice-ds'
            // This avoids Mixed Content (since we are HTTPS) and CORS issues.
            setOoUrl(window.location.origin);
        };

        fetchConfig();
        fetchOoUrl();
    }, [entityType, entityId, userId]);

    // DEBUG: Log Config when it arrives
    useEffect(() => {
        if (config) {
            console.log("✅ OnlyOffice Config Received:", config);
            console.log("   Document URL:", config.document?.url);
            console.log("   Callback URL:", config.editorConfig?.callbackUrl);
        }
    }, [config]);

    // DEBUG: Log URL decision
    useEffect(() => {
        if (ooUrl) {
            console.log("ℹ️ OnlyOffice API URL set to:", ooUrl);
        }
    }, [ooUrl]);

    const [scriptLoaded, setScriptLoaded] = useState(false);
    // Ref för att hålla reda på editor-instansen utan att trigga re-renders
    const docEditorRef = useRef(null);
    const placeholderRef = useRef(null);

    // Initialisera OnlyOffice
    useEffect(() => {
        // Kör inte om scriptet inte är laddat eller config saknas
        if (!scriptLoaded || !config || !window.DocsAPI) return;

        // Kör inte om vi redan har en instans
        if (docEditorRef.current) return;

        console.log("🚀 Initializing OnlyOffice Editor...");
        try {
            // Säkra att placeholder finns
            if (!placeholderRef.current) {
                console.error("Placeholder element not found!");
                return;
            }

            // Unikt ID för denna instans för att undvika konflikter
            const uniqueId = `onlyoffice-editor-${Date.now()}`;
            placeholderRef.current.innerHTML = `<div id="${uniqueId}"></div>`;

            docEditorRef.current = new window.DocsAPI.DocEditor(uniqueId, {
                ...config,
                width: "100%",
                height: "100%",
                type: "desktop", // Tvinga desktop för att undvika mobilvy-strul
                editorConfig: {
                    ...config.editorConfig,
                    lang: "sv",
                    customization: {
                        autosave: true,
                        chat: false,
                        help: false,
                        compactHeader: true,
                        // Tvinga toolbar att visas
                        toolbar: true,
                        uiTheme: "theme-light", // Force light theme for consistency
                    }
                },
                events: {
                    "onDocumentReady": () => {
                        console.log("✅ ONLYOFFICE: Dokumentet är redo");
                        setIsLoading(false); // Göm loader när dokumentet faktiskt är redo
                    },
                    "onAppReady": () => {
                        console.log("ℹ️ ONLYOFFICE: Applikationen är redo");
                    },
                    "onError": (event) => {
                        console.error("❌ ONLYOFFICE Error:", event);
                        // Visa inte error för användaren direkt om det bara är en varning, 
                        // men logga det. OnlyOffice kastar ibland ofarliga fel.
                        if (event && event.data && event.data.errorCode) {
                            setError(`OnlyOffice Fel ${event.data.errorCode}: ${event.data.errorDescription}`);
                        }
                    }
                }
            });
        } catch (err) {
            console.error("💥 Critical OnlyOffice initialization failed", err);
            setError("Kunde inte starta OnlyOffice: " + err.message);
            setIsLoading(false);
        }

        // Cleanup function
        return () => {
            console.log("🧹 Destroying OnlyOffice Editor instance");
            if (docEditorRef.current) {
                try {
                    docEditorRef.current.destroyEditor();
                } catch (e) {
                    console.warn("Error destroying editor:", e);
                }
                docEditorRef.current = null;
            }
        };
    }, [config, scriptLoaded]); // Beroenden: Initiera bara när config eller script ändras

    // Helper för att ladda script
    useEffect(() => {
        if (!ooUrl) return;
        if (window.DocsAPI) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = `${ooUrl}/web-apps/apps/api/documents/api.js`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => {
            console.error("Failed to load OnlyOffice script from:", script.src);
            setError("Kunde inte ladda OnlyOffice-scriptet. Kontrollera nätverk/proxy.");
            setIsLoading(false);
        };
        document.body.appendChild(script);

        return () => {
            // Behåll scriptet i DOM för prestanda, ta inte bort det
        };
    }, [ooUrl]);

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200" style={{ zIndex: 99999 }}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose} // Klicka utanför för att stänga (valfritt, kanske säkrast att kräva knapptryck)
            />

            {/* Modal Window */}
            <div className="relative w-full h-full max-w-[98vw] max-h-[96vh] bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header / Toolbar */}
                <div className="flex-none px-4 py-3 border-b border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#2b2d31] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Save size={18} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">
                                {config?.document?.title || "Dokument"}
                            </h3>
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                <CheckCircle size={10} /> Auto-sparning
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                        >
                            Stäng & Spara
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 relative w-full h-full bg-[#f4f4f4] dark:bg-[#121212]">
                    {/* Loader */}
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white dark:bg-[#1E1F20]">
                            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">Laddar dokument...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white dark:bg-[#1E1F20] p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <X size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oj, något gick fel</h3>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">{error}</p>
                            <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">
                                Stäng fönstret
                            </button>
                        </div>
                    )}

                    {/* ONLYOFFICE MOUNT POINT */}
                    {/* Viktigt: Ingen width/height här, låt flex-container hantera det */}
                    <div ref={placeholderRef} className="absolute inset-0 w-full h-full" />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OnlyOfficeEditor;
