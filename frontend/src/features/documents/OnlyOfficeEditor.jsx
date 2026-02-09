import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Loader2 } from 'lucide-react';
import { api, getTenantFromUrl } from '../../services/api';

const OnlyOfficeEditor = ({ entityType = 'DOCUMENT', entityId, userId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [error, setError] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const docEditorRef = useRef(null);
    const placeholderRef = useRef(null);
    const editorId = useRef(`oo-editor-${Date.now()}`);

    // 1. Load config AND script sequentially
    useEffect(() => {
        let isMounted = true;

        const initOnlyOffice = async () => {
            try {
                // Step 1: Fetch Config
                const tenantId = getTenantFromUrl();
                const tenantParam = tenantId ? `&tenantId=${tenantId}` : '';
                const configData = await api.get(`/onlyoffice/config/${entityType}/${entityId}?userId=${userId}${tenantParam}`);

                if (!isMounted) return;
                setConfig(configData);
                console.log("✅ Config loaded:", configData);

                // Step 2: Load Script from the correct URL
                if (window.DocsAPI) {
                    setScriptLoaded(true);
                    return;
                }

                const serverUrl = configData.documentServerUrl || '';
                // Ensure no trailing slash
                const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
                const scriptUrl = `${baseUrl}/web-apps/apps/api/documents/api.js`;

                console.log("📥 Loading OnlyOffice script from:", scriptUrl);

                const script = document.createElement("script");
                script.src = scriptUrl;
                script.async = true;
                script.onload = () => {
                    console.log("✅ OnlyOffice script loaded");
                    if (isMounted) setScriptLoaded(true);
                };
                script.onerror = () => {
                    console.error("❌ Failed to load OnlyOffice script from", scriptUrl);
                    if (isMounted) {
                        setError("Kunde inte ladda OnlyOffice. Kontrollera att servern är igång.");
                        setIsLoading(false);
                    }
                };
                document.body.appendChild(script);

            } catch (err) {
                console.error("Failed to initialize OnlyOffice", err);
                if (isMounted) {
                    setError(err.message || "Kunde inte initiera OnlyOffice");
                    setIsLoading(false);
                }
            }
        };

        initOnlyOffice();

        return () => { isMounted = false; };
    }, [entityType, entityId, userId]);

    // 2. Initialize Editor when ready
    useEffect(() => {
        if (!scriptLoaded || !config || !window.DocsAPI || !placeholderRef.current) return;
        if (docEditorRef.current) return;

        console.log("🚀 Creating OnlyOffice editor...");

        if (typeof window.DocsAPI.DocEditor !== 'function') {
            console.error("❌ DocsAPI.DocEditor is not a function!");
            setError("OnlyOffice API loading failed.");
            setIsLoading(false);
            return;
        }
        console.log("📋 Full config:", JSON.stringify(config, null, 2));

        // Skapa container för editorn
        const containerId = editorId.current;
        placeholderRef.current.innerHTML = `<div id="${containerId}" style="width:100%;height:100%;background:#fff;"></div>`;

        // Verify container exists
        const container = document.getElementById(containerId);
        console.log("📦 Container element:", container ? "✅ Found" : "❌ Not found");

        try {
            const editorConfig = {
                ...config,
                width: "100%",
                height: "100%",
                type: "desktop",
                editorConfig: {
                    ...config.editorConfig,
                    lang: "sv",
                    customization: {
                        autosave: true,
                        chat: false,
                        help: false,
                        compactHeader: true,
                        toolbar: true,
                        uiTheme: "theme-light",
                    }
                },
                events: {
                    onDocumentReady: () => {
                        console.log("✅ Document ready!");
                        setIsLoading(false);
                    },
                    onAppReady: () => {
                        console.log("✅ App ready!");
                    },
                    onError: (event) => {
                        console.error("❌ OnlyOffice error:", event);
                        const errorCode = event.data?.errorCode;
                        const errorDesc = event.data?.errorDescription;
                        console.error(`OnlyOffice Error Details: Code=${errorCode}, Desc=${errorDesc}`);
                        setError(`OnlyOffice-fel (Kod: ${errorCode || 'Okänd'}): ${errorDesc || 'Kolla konsolen'}`);
                        setIsLoading(false);
                    },
                    onWarning: (event) => {
                        console.warn("⚠️ OnlyOffice warning:", event);
                    },
                    onInfo: (event) => {
                        console.log("ℹ️ OnlyOffice info:", event);
                    },
                    onDownloadAs: (event) => {
                        console.log("📥 OnlyOffice download:", event);
                    }
                }
            };

            console.log("🔧 Creating DocEditor with config:", editorConfig);
            docEditorRef.current = new window.DocsAPI.DocEditor(containerId, editorConfig);
            console.log("✅ DocEditor created, instance:", docEditorRef.current);

            // Check if iframe was created after a short delay
            setTimeout(() => {
                const iframes = document.querySelectorAll('iframe');
                console.log(`📺 Iframes after 500ms: ${iframes.length}`);
                iframes.forEach((iframe, i) => {
                    console.log(`  - iframe[${i}]: src="${iframe.src}", style="${iframe.style.cssText}"`);
                });
            }, 500);

        } catch (err) {
            console.error("❌ Failed to create editor:", err);
            setError("Kunde inte starta editorn: " + err.message);
            setIsLoading(false);
        }

        // Cleanup
        return () => {
            if (docEditorRef.current) {
                console.log("🧹 Destroying editor");
                try {
                    docEditorRef.current.destroyEditor();
                } catch (e) {
                    console.warn("Destroy error:", e);
                }
                docEditorRef.current = null;
            }
        };
    }, [scriptLoaded, config]);

    return createPortal(
        <div className="onlyoffice-editor fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 999999 }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full h-full max-w-[98vw] max-h-[96vh] bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex-none px-4 py-3 border-b border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#2b2d31] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Save size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                {config?.document?.title || "Dokument"}
                            </h3>
                            <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle size={10} /> Auto-sparning
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
                            Stäng & Spara
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative bg-[#f4f4f4] dark:bg-[#121212]">
                    {/* Loader */}
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white dark:bg-[#1E1F20]">
                            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">Laddar dokument...</p>
                            <p className="text-xs text-gray-400 mt-2">
                                {!scriptLoaded ? "Laddar OnlyOffice..." : !config ? "Hämtar config..." : "Initierar editor..."}
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white dark:bg-[#1E1F20] p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <X size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Något gick fel</h3>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">{error}</p>
                            <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black">
                                Stäng
                            </button>
                        </div>
                    )}

                    {/* OnlyOffice Mount Point */}
                    <div ref={placeholderRef} className="absolute inset-0 w-full h-full" />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OnlyOfficeEditor;
