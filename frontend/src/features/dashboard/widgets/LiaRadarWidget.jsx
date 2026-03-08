import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle as ShieldExclamationIcon, FileText as DocumentTextIcon, CheckCircle as CheckCircleIcon, Loader2 } from 'lucide-react';
import api from '../../../services/api';

const LiaRadarWidget = () => {
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLiaWarnings = async () => {
            try {
                const response = await api.admin.getLiaRadar();
                setWarnings(response.data || []);
            } catch (err) {
                console.error('Failed to load LIA Radar data:', err);
                setError(err.response?.data?.message || 'Kunde inte hämta LIA-efterlevnadsdata.');
            } finally {
                setLoading(false);
            }
        };

        fetchLiaWarnings();
    }, []);

    if (loading) {
        return (
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <ShieldExclamationIcon className="w-6 h-6" />
                    <h3 className="text-xl font-bold">LIA Compliance Radar</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl">
                    <ShieldExclamationIcon className="w-6 h-6" />
                    <h3 className="text-lg font-bold">LIA Compliance Radar</h3>
                </div>
                {warnings?.length > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                        {warnings.length} varningar (MYH)
                    </div>
                )}
            </div>

            <div className="overflow-y-auto pr-2" style={{ maxHeight: '350px' }}>
                {(!warnings || warnings.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 text-green-500">
                        <CheckCircleIcon className="w-16 h-16 mb-4 opacity-50" />
                        <p className="font-semibold text-lg">Inga LIA-varningar</p>
                        <p className="text-sm opacity-80 mt-1">Alla dokument ser ut att vara på plats för aktuella LIA-perioder.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {warnings.map((warning, index) => (
                            <div key={index} className="flex flex-col bg-red-50 dark:bg-red-500/5 text-red-900 dark:text-red-100 p-4 rounded-xl border border-red-100 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg">{warning.studentName}</span>
                                        <div className="flex items-center gap-1 opacity-70 mt-1">
                                            <DocumentTextIcon className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-wider font-semibold">
                                                {warning.companyName}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-red-200 dark:bg-red-500/30 text-red-700 dark:text-red-300 px-2 py-1 rounded font-bold uppercase">
                                        {warning.status}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm bg-white/50 dark:bg-black/20 p-3 rounded-lg flex items-start gap-2 border border-red-500/10">
                                    <ShieldExclamationIcon className="w-5 h-5 flex-shrink-0 text-red-500" />
                                    <span>{warning.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {warnings?.length > 0 && (
                <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                    Säkerställ MYH-kompliance (dokumentation & intyg) enligt förordning.
                </div>
            )}
        </div>
    );
};

export default LiaRadarWidget;
