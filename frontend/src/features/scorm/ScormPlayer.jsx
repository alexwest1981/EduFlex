import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Loader2, Maximize, Minimize } from 'lucide-react';

const ScormPlayer = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const { API_BASE, token } = useAppContext();
    const [scormPackage, setScormPackage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // SCORM Data State
    const [cmiData, setCmiData] = useState({
        'cmi.core.student_id': 'user_123', // TODO: Get from context
        'cmi.core.student_name': 'Student, Test',
        'cmi.core.lesson_status': 'not attempted',
        'cmi.suspend_data': ''
    });

    const iframeRef = useRef(null);

    useEffect(() => {
        // Find basic info about package
        // In a real app, we'd fetch this from API. For now, we assume we passed launchUrl or fetch it.
        // Let's implement a fetch:
        const fetchPackage = async () => {
            // We can't fetch single package details easily without a new endpoint, 
            // so for now let's hope the user navigates from a list that passes state,
            // OR we assume we can list course packages and find it (inefficient but works for MVP).
            // Actually, let's just cheat and assume we know the URL structure if we had the directory.
            // Better: Let's assume the parent component passes the object via location state or we add a GET /api/scorm/{id} later.
            // For MVP: We will just try to load it assuming a standard pattern or mocked interaction.
            setLoading(false);
        };
        fetchPackage();

        // --- SCORM 1.2 API Implementation ---
        window.API = {
            LMSInitialize: (param) => {
                console.log("LMSInitialize", param);
                return "true";
            },
            LMSFinish: (param) => {
                console.log("LMSFinish", param);
                return "true";
            },
            LMSGetValue: (element) => {
                console.log("LMSGetValue", element);
                return cmiData[element] || "";
            },
            LMSSetValue: (element, value) => {
                console.log("LMSSetValue", element, value);
                setCmiData(prev => ({ ...prev, [element]: value }));
                return "true";
            },
            LMSCommit: (param) => {
                console.log("LMSCommit: Saving to server...");
                // Here we would POST cmiData to backend
                return "true";
            },
            LMSGetLastError: () => "0",
            LMSGetErrorString: () => "No error",
            LMSGetDiagnostic: () => ""
        };

        return () => {
            delete window.API;
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Helper to resolve URL (needs backend endpoint to give us the specific launch path)
    // WORKAROUND: For MVP, we pass the full launch URL via router state or prop, 
    // OR we just hardcode a known test location if we don't have the data connected yet.
    // Let's assume we are passed the object.

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    // TODO: Connect this to real Launch URL from backend
    // For now, show a placeholder or expect it from router state
    // const launchUrl = `${API_BASE.replace('/api', '')}/uploads/${scormPackage.directoryPath}${scormPackage.launchFile}`;

    return (
        <div className={`flex flex-col h-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>

            {/* Header */}
            {!isFullscreen && (
                <div className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-bold text-gray-800">SCORM Module Player</h1>
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <Maximize size={20} />
                    </button>
                </div>
            )}

            {/* Iframe */}
            <div className="flex-1 bg-black relative">
                {/* 
                   Ideally we load the iframe source here.
                   Since we haven't connected the full "List -> Click -> Play" flow with data yet,
                   we will show a message.
                 */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <p>Select a SCORM package from the course list to play.</p>
                </div>
            </div>
        </div>
    );
};

export default ScormPlayer;
