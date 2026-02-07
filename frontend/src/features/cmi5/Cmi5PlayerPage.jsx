import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import Cmi5Player from '../../components/player/Cmi5Player';
import { useAppContext } from '../../context/AppContext';

const Cmi5PlayerPage = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                setLoading(true);
                const data = await api.cmi5.getOne(packageId);
                setPkg(data);
            } catch (err) {
                console.error("Failed to fetch CMI5 metadata", err);
                setError("Kunde inte ladda modulens metadata.");
            } finally {
                setLoading(false);
            }
        };

        if (packageId) fetchMetadata();
    }, [packageId]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#131314]">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium animate-pulse">Laddar interaktiv modul...</p>
            </div>
        );
    }

    if (error || !pkg) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#131314] p-6">
                <AlertCircle className="text-red-500 mb-4" size={64} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ett fel uppstod</h2>
                <p className="text-gray-500 mb-6">{error || "Modulen kunde inte hittas."}</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                    Gå tillbaka
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden">
            {/* Player Header */}
            <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#131314] border-b border-gray-200 dark:border-[#3c4043] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg transition-colors text-gray-500"
                        title="Stäng och gå tillbaka"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-white truncate max-w-[300px] sm:max-w-md">
                            {pkg.title}
                        </h1>
                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500">cmi5 Module</span>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-grow relative bg-gray-100 dark:bg-[#131314]">
                <Cmi5Player
                    packageId={pkg.packageId}
                    launchUrl={pkg.launchUrl}
                    registration={pkg.registration}
                    actor={{
                        objectType: 'Agent',
                        account: {
                            homePage: window.location.origin,
                            name: currentUser?.username || currentUser?.email || 'guest'
                        },
                        name: currentUser?.name || currentUser?.username || 'Gäst'
                    }}
                />
            </main>
        </div>
    );
};

export default Cmi5PlayerPage;
