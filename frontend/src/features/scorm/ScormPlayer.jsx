import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, X, Maximize2, Minimize2, AlertCircle, RefreshCw, Terminal } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

/**
 * Universal SCORM Player (Modal-compatible)
 * Provides both window.API (1.2) and window.API_1484_11 (2004)
 * aggressively attached to window, parent, top, and opener for maximum compatibility.
 */
const ScormPlayer = ({ packageId, onClose }) => {
    const { currentUser } = useAppContext();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const containerRef = useRef(null);

    const addLog = useCallback((ver, method, ...args) => {
        const entry = {
            id: Date.now() + Math.random(),
            ver,
            method,
            args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)),
            timestamp: new Date().toLocaleTimeString()
        };
        setLogs(prev => [entry, ...prev].slice(0, 50));
        console.log(`%c[SCORM ${ver}] ${method}`, "color: #6366f1; font-weight: bold", ...args);
    }, []);

    // --- UNIVERSAL SCORM API ---
    const initApi = useCallback(() => {
        const state = {
            initialized: false,
            terminated: false,
            lastError: "0",
            data: {
                // SCORM 1.2 Defaults
                "cmi.core.lesson_status": "not attempted",
                "cmi.core.entry": "ab-initio",
                "cmi.core.lesson_mode": "normal",
                "cmi.core.credit": "credit",
                "cmi.core.student_name": currentUser?.name || "Student",
                "cmi.core.student_id": currentUser?.id || String(currentUser?.id || "user_0"),
                "cmi.suspend_data": "",
                "cmi.launch_data": "",

                // SCORM 2004 Defaults
                "cmi.mode": "normal",
                "cmi.entry": "ab-initio",
                "cmi.credit": "credit",
                "cmi.completion_status": "unknown",
                "cmi.success_status": "unknown",
                "cmi.learner_name": currentUser?.name || "Learner",
                "cmi.learner_id": String(currentUser?.id || "user_0"),
                "cmi._version": "1.0"
            }
        };

        // SCORM 1.2 Object
        const api12 = {
            LMSInitialize: (param) => {
                addLog("1.2", "LMSInitialize", param);
                state.initialized = true;
                state.lastError = "0";
                return "true";
            },
            LMSFinish: (param) => {
                addLog("1.2", "LMSFinish", param);
                state.terminated = true;
                return "true";
            },
            LMSGetValue: (element) => {
                const val = state.data[element] || "";
                addLog("1.2", "LMSGetValue", element, "=>", val);
                return val;
            },
            LMSSetValue: (element, value) => {
                addLog("1.2", "LMSSetValue", element, "=", value);
                state.data[element] = value;
                return "true";
            },
            LMSCommit: (param) => {
                addLog("1.2", "LMSCommit", param);
                return "true";
            },
            LMSGetLastError: () => state.lastError,
            LMSGetErrorString: (errCode) => "No error",
            LMSGetDiagnostic: (errCode) => "No diagnostic"
        };

        // SCORM 2004 Object
        const api2004 = {
            Initialize: (param) => {
                addLog("2004", "Initialize", param);
                state.initialized = true;
                state.lastError = "0";
                return "true";
            },
            Terminate: (param) => {
                addLog("2004", "Terminate", param);
                state.terminated = true;
                return "true";
            },
            GetValue: (element) => {
                if (!state.initialized) { state.lastError = "301"; return ""; }
                const val = state.data[element] || "";
                addLog("2004", "GetValue", element, "=>", val);
                return val;
            },
            SetValue: (element, value) => {
                addLog("2004", "SetValue", element, "=", value);
                state.data[element] = value;
                return "true";
            },
            Commit: (param) => {
                addLog("2004", "Commit", param);
                return "true";
            },
            GetLastError: () => state.lastError,
            GetErrorString: (errCode) => "No error",
            GetDiagnostic: (errCode) => "No diagnostic"
        };

        // Aggressive Attachment with Polling
        const attach = () => {
            const targets = [window];
            try { if (window.parent && window.parent !== window) targets.push(window.parent); } catch (e) { }
            try { if (window.top && window.top !== window) targets.push(window.top); } catch (e) { }
            try { if (window.opener) targets.push(window.opener); } catch (e) { }

            targets.forEach(t => {
                try {
                    t.API = api12;
                    t.API_1484_11 = api2004;
                } catch (e) { /* Cross-origin protection */ }
            });
        };

        const interval = setInterval(attach, 1000);
        attach();

        return () => {
            clearInterval(interval);
            const clear = (h) => {
                try { delete h.API; delete h.API_1484_11; } catch (e) { }
            };
            clear(window);
            try { if (window.parent) clear(window.parent); } catch (e) { }
            try { if (window.top) clear(window.top); } catch (e) { }
            try { if (window.opener) clear(window.opener); } catch (e) { }
        };
    }, [currentUser, addLog]);

    useEffect(() => {
        const cleanupApi = initApi();

        const fetchMetadata = async () => {
            try {
                setLoading(true);
                const data = await api.scorm.getOne(packageId);
                setPkg(data);
            } catch (err) {
                console.error("Failed to fetch SCORM metadata", err);
                setError("Kunde inte ladda modulens metadata.");
            } finally {
                setLoading(false);
            }
        };

        if (packageId) fetchMetadata();

        return cleanupApi;
    }, [packageId, initApi]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#131314] min-h-[500px]">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium animate-pulse">Laddar interaktiv modul...</p>
            </div>
        );
    }

    if (error || !pkg) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#131314] p-6 min-h-[500px]">
                <AlertCircle className="text-red-500 mb-4" size={64} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ett fel uppstod</h2>
                <p className="text-gray-500 mb-6">{error || "Modulen kunde inte hittas."}</p>
                <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                    Stäng
                </button>
            </div>
        );
    }

    const launchUrl = `${window.location.origin}/uploads/${pkg.directoryPath}${pkg.launchFile}`;

    return (
        <div ref={containerRef} className="h-full w-full flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden relative">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#131314] border-b border-gray-200 dark:border-[#3c4043] shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                        <Terminal size={16} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                            {pkg.title}
                        </h1>
                        <span className="text-[9px] uppercase font-black tracking-widest text-indigo-500">Universal SCORM Runtime</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className={`p-2 rounded-lg transition-colors ${showLogs ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-[#282a2c] text-gray-500'}`}
                        title="Visa debug-logg"
                    >
                        <Terminal size={18} />
                    </button>
                    <button onClick={() => window.location.reload()} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg text-gray-500" title="Ladda om">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg text-gray-500" title="Fullskärm">
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded-lg ml-2" title="Stäng">
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Launch Notice (Subtle overlay during load) */}
            <div className="absolute top-14 left-0 right-0 h-1 bg-indigo-600/10 z-20">
                <div className="h-full bg-indigo-600 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
            </div>

            {/* Content area */}
            <main className="flex-grow relative bg-gray-100 dark:bg-[#131314]">
                <iframe
                    name="LMSFrame"
                    id="LMSFrame"
                    src={launchUrl}
                    className="w-full h-full border-0 absolute inset-0 bg-white"
                    title={pkg.title}
                    allow="autoplay; fullscreen; camera; microphone"
                />

                {/* Debug Logs Overlay */}
                {showLogs && (
                    <div className="absolute bottom-4 right-4 w-80 max-h-[400px] bg-black/90 backdrop-blur-md text-[#00ff00] font-mono text-[10px] p-4 rounded-2xl border border-[#00ff00]/20 overflow-y-auto z-30 shadow-2xl">
                        <div className="flex justify-between items-center mb-2 border-b border-[#00ff00]/20 pb-1">
                            <span>SCORM RUNTIME LOGS</span>
                            <button onClick={() => setLogs([])} className="hover:text-white underline">Clear</button>
                        </div>
                        {logs.length === 0 ? (
                            <div className="opacity-50">Waiting for API calls...</div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="mb-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <span className="opacity-40">[{log.timestamp}]</span>
                                    <span className="text-indigo-400 font-bold ml-1">[{log.ver}]</span>
                                    <span className="ml-1 font-bold">{log.method}</span>
                                    <div className="pl-4 opacity-80 break-words">
                                        {log.args.join(', ')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}} />
        </div>
    );
};

export default ScormPlayer;
