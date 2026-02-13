import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, X, Maximize2, Minimize2, AlertCircle, RefreshCw, Terminal, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

/**
 * Universal SCORM Player (Modal-compatible)
 * Supports SCORM 1.1, 1.2, and 2004 (3rd & 4th Edition)
 * Aggressively attaches API to window, parent, top, and opener.
 */
const ScormPlayer = ({ packageId, onClose }) => {
    const { currentUser } = useAppContext();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const [activeVersion, setActiveVersion] = useState(null); // '1.2' or '2004'
    const containerRef = useRef(null);

    const addLog = useCallback((ver, method, ...args) => {
        const entry = {
            id: Date.now() + Math.random(),
            ver,
            method,
            args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)),
            timestamp: new Date().toLocaleTimeString()
        };
        setLogs(prev => [entry, ...prev].slice(0, 100));

        // Console log with distinct colors for versions
        const color = ver === '2004' ? '#8b5cf6' : '#0ea5e9'; // Violet for 2004, Sky for 1.2
        console.log(`%c[SCORM ${ver}] ${method}`, `color: ${color}; font-weight: bold`, ...args);

        if (method === 'LMSInitialize' || method === 'Initialize') {
            setActiveVersion(ver);
        }
    }, []);

    // --- UNIVERSAL SCORM API ---
    const initApi = useCallback(() => {
        const state = {
            initialized: false,
            terminated: false,
            lastError: "0",
            data: {
                // SCORM 1.1 / 1.2 Defaults
                "cmi.core.lesson_status": "not attempted",
                "cmi.core.entry": "ab-initio",
                "cmi.core.lesson_mode": "normal",
                "cmi.core.credit": "credit",
                "cmi.core.student_name": currentUser?.name || "Student",
                "cmi.core.student_id": currentUser?.id || String(currentUser?.id || "user_0"),
                "cmi.suspend_data": "",
                "cmi.launch_data": "",

                // SCORM 2004 Defaults (covers 2nd, 3rd, 4th Edition basic data model)
                "cmi.mode": "normal",
                "cmi.entry": "ab-initio",
                "cmi.credit": "credit",
                "cmi.completion_status": "unknown",
                "cmi.success_status": "unknown",
                "cmi.learner_name": currentUser?.name || "Learner",
                "cmi.learner_id": String(currentUser?.id || "user_0"),
                "cmi._version": "1.0", // Represents the data model version
            }
        };

        // SCORM 1.1 / 1.2 API Adapter
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
            LMSGetErrorString: (errCode) => {
                const msgs = { "0": "No error", "404": "Not Implemented" };
                return msgs[errCode] || "Unknown Error";
            },
            LMSGetDiagnostic: (errCode) => "No diagnostic"
        };

        // SCORM 2004 (all editions) API Adapter
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
            try { if (window.parent && window.parent !== window) targets.push(window.parent); } catch (e) { /* ignore */ }
            try { if (window.top && window.top !== window) targets.push(window.top); } catch (e) { /* ignore */ }
            try { if (window.opener) targets.push(window.opener); } catch (e) { /* ignore */ }

            targets.forEach(t => {
                try {
                    // Standard SCORM 1.2
                    if (!t.API) t.API = api12;
                    // Standard SCORM 2004
                    if (!t.API_1484_11) t.API_1484_11 = api2004;
                } catch (e) { /* Cross-origin protection */ }
            });
        };

        const interval = setInterval(attach, 500); // Poll more frequently (500ms)
        attach();

        return () => {
            clearInterval(interval);
            const clear = (h) => {
                try {
                    if (h.API === api12) delete h.API;
                    if (h.API_1484_11 === api2004) delete h.API_1484_11;
                } catch (e) { /* ignore */ }
            };
            clear(window);
            try { if (window.parent) clear(window.parent); } catch (e) { /* ignore */ }
            try { if (window.top) clear(window.top); } catch (e) { /* ignore */ }
            try { if (window.opener) clear(window.opener); } catch (e) { /* ignore */ }
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
                setError(err.message || "Kunde inte ladda modulens metadata.");
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
                <div className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-[#1e1e1e] p-4 rounded-lg max-w-lg overflow-auto">
                    Tip: Ensure the SCORM package contains a valid 'imsmanifest.xml' and is zipped correctly.
                </div>
                <button onClick={onClose} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                    Stäng
                </button>
            </div>
        );
    }

    const launchUrl = `${window.location.origin}/api/files/${pkg.directoryPath}${pkg.launchFile}`;

    return (
        <div ref={containerRef} className="h-full w-full flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden relative">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#131314] border-b border-gray-200 dark:border-[#3c4043] shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                        <Terminal size={16} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                            {pkg.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-black tracking-widest text-gray-500">Universal SCORM Runtime</span>
                            {activeVersion && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeVersion === '2004' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                                    {activeVersion === '2004' ? 'SCORM 2004' : 'SCORM 1.2'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showLogs ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-[#282a2c] text-gray-500'}`}
                        title="Visa debug-logg"
                    >
                        <Activity size={18} />
                        {logs.length > 0 && <span className="text-xs font-bold">{logs.length}</span>}
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
                    <div className="absolute bottom-4 right-4 w-96 max-h-[500px] bg-[#1a1b1e]/95 backdrop-blur-md text-[#00ff00] font-mono text-[11px] p-4 rounded-xl border border-gray-800 overflow-y-auto z-30 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2 sticky top-0 bg-[#1a1b1e/95]">
                            <span className="font-bold text-white">SCORM RUNTIME LOGS</span>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `scorm-logs-${Date.now()}.json`;
                                    a.click();
                                }} className="text-xs text-indigo-400 hover:text-indigo-300">Download</button>
                                <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-white">Clear</button>
                            </div>
                        </div>
                        <div className="flex-grow space-y-1.5">
                            {logs.length === 0 ? (
                                <div className="text-gray-500 italic text-center py-4">Waiting for SCORM API calls...</div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="group hover:bg-white/5 p-1 rounded transition-colors break-all">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-gray-500 text-[9px]">{log.timestamp}</span>
                                            <span className={`text-[9px] font-bold px-1 rounded ${log.ver === '2004' ? 'bg-violet-500/20 text-violet-300' : 'bg-sky-500/20 text-sky-300'}`}>
                                                {log.ver}
                                            </span>
                                            <span className="text-white font-semibold">{log.method}</span>
                                        </div>
                                        <div className="pl-1 text-gray-300 opacity-90 font-mono">
                                            {log.args.join(', ')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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
