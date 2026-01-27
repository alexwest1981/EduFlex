
import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

const Cmi5Player = ({ packageId, launchUrl, actor }) => {
    const [lrsAuthToken, setLrsAuthToken] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Fetch a short-lived auth token for the AU to talk to our LRS
        const init = async () => {
            try {
                // In a real app we would call /api/cmi5/auth-token
                // For now, we reuse the user's main token or a stub
                const token = localStorage.getItem('token');
                setLrsAuthToken(token);
                setIsReady(true);
            } catch (e) {
                console.error("Failed to init cmi5 session", e);
            }
        };
        init();
    }, []);

    if (!isReady) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    // Construct cmi5 Launch URL with Query Params
    // https://github.com/AICC/CMI-5_Spec_Current/blob/quark/cmi5_spec.md#launch-method
    const endpoint = window.location.origin + "/xapi";
    const fetchUrl = endpoint + "/statements";

    const fullLaunchUrl = new URL(launchUrl, window.location.origin);
    fullLaunchUrl.searchParams.append("endpoint", endpoint);
    fullLaunchUrl.searchParams.append("fetch", fetchUrl);
    fullLaunchUrl.searchParams.append("actor", JSON.stringify(actor));
    fullLaunchUrl.searchParams.append("registration", crypto.randomUUID());
    fullLaunchUrl.searchParams.append("activityId", packageId);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="bg-gray-100 p-2 text-xs text-gray-500 flex justify-between">
                <span>CMI5 Mode</span>
                <span>LRS Connected</span>
            </div>
            <iframe
                src={fullLaunchUrl.toString()}
                className="w-full flex-grow border-0"
                title="Course Content"
                allow="autoplay; fullscreen"
            />
        </div>
    );
};

export default Cmi5Player;
