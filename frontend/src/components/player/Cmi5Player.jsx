import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, X, Maximize2, Minimize2, Activity, Globe } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Cmi5Player = ({ packageId, launchUrl, registration, onClose }) => {
    const { currentUser } = useAppContext();
    const [isReady, setIsReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = React.useRef(null);

    useEffect(() => {
        // 1. Initialize Launch State (LMS.LaunchData)
        // 2. Fetch Auth Token (handled by internal fetch URL, but we need session setup)
        const init = async () => {
            try {
                // Actor identifier logic to match LrsController extraction
                const actorName = currentUser?.username || currentUser?.email || 'guest';

                // Call the new init endpoint
                const res = await fetch('/api/cmi5/init-launch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        packageId,
                        registration: registration || packageId,
                        actor: actorName
                    })
                });

                if (!res.ok) throw new Error("Init failed");

                setIsReady(true);
            } catch (e) {
                console.error("Failed to init cmi5 launch", e);
                alert("Kunde inte initiera cmi5-sessionen. (Har du startat om backend?)");
            }
        };

        if (packageId) {
            init();
        }
    }, [packageId, registration, currentUser]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (!isReady) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#131314] min-h-[500px]">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium animate-pulse">Initierar cmi5-session...</p>
            </div>
        );
    }

    // Construct cmi5 Launch URL with Query Params
    const endpoint = window.location.origin + "/api/lrs";
    const fetchUrl = endpoint + "/fetch";

    // Trace launch params
    console.log("[CMI5] Preparing launch with:", { endpoint, fetchUrl, packageId, registration });

    const fullLaunchUrl = new URL(launchUrl, window.location.origin);
    fullLaunchUrl.searchParams.append("endpoint", endpoint);
    fullLaunchUrl.searchParams.append("fetch", fetchUrl);

    if (!registration || registration === "undefined") {
        console.warn("[CMI5] Registration is missing or undefined! Using packageId as fallback.");
    }

    // cmi5 spec for actor
    const actor = {
        objectType: 'Agent',
        account: {
            homePage: window.location.origin,
            name: currentUser?.username || currentUser?.email || 'guest'
        },
        name: currentUser?.name || currentUser?.username || 'Learner'
    };

    console.log("[CMI5] Actor:", actor);

    fullLaunchUrl.searchParams.append("actor", JSON.stringify(actor));
    fullLaunchUrl.searchParams.append("registration", (registration && registration !== "undefined") ? registration : packageId);
    fullLaunchUrl.searchParams.append("activityId", packageId);

    return (
        <div ref={containerRef} className="h-full w-full flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden relative">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#131314] border-b border-gray-200 dark:border-[#3c4043] shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                        <Activity size={16} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                            cmi5 Modul: {packageId}
                        </h1>
                        <span className="text-[9px] uppercase font-black tracking-widest text-green-500 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            Connected to Internal LRS
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <div className="hidden sm:flex items-center gap-2 mr-4 px-3 py-1 bg-gray-50 dark:bg-[#282a2c] rounded-full text-[10px] text-gray-500 font-mono">
                        <Globe size={10} /> {window.location.host}
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg text-gray-500" title="Fullskärm">
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded-lg ml-2" title="Stäng">
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Content area */}
            <main className="flex-grow relative bg-gray-100 dark:bg-[#131314]">
                <iframe
                    src={fullLaunchUrl.toString()}
                    className="w-full h-full border-0 absolute inset-0 bg-white"
                    title="Course Content"
                    allow="autoplay; fullscreen; camera; microphone"
                />
            </main>
        </div>
    );
};

export default Cmi5Player;
