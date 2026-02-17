import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Database } from 'lucide-react';
import { api } from '../../services/api';

const SkolverketImport = () => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [stats, setStats] = useState(null);

    const fetchStats = async () => {
        try {
            const response = await api.get('/skolverket/stats');
            setStats(response);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
    };

    const handleImport = async () => {
        if (!file) {
            alert('Välj en CSV-fil först');
            return;
        }

        setImporting(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        const getTenantId = () => {
            const hostname = window.location.hostname;
            const forcedTenant = localStorage.getItem('force_tenant');
            if (forcedTenant) return forcedTenant;
            if (hostname.endsWith('.localhost') && hostname !== 'localhost') return hostname.split('.')[0];
            const parts = hostname.split('.');
            if (parts.length > 2) return parts[0];
            return null;
        };

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        const tenantId = getTenantId();
        if (tenantId) headers['X-Tenant-ID'] = tenantId;

        try {
            const response = await fetch(`${window.location.origin}/api/skolverket/import`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            const data = await response.json();
            setResult(data);
            if (data.success) {
                fetchStats();
            }
        } catch (error) {
            setResult({ success: false, error: error.message });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="text-indigo-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importera Skolverkets Kurskatalog</h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ladda upp CSV-filen från Skolverket för att importera officiella kurskoder, kursnamn, poäng och ämnen.
                </p>

                {stats && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Totalt kurser</p>
                                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Antal ämnen</p>
                                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.subjects}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Välj CSV-fil
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="w-full p-2 border border-gray-300 dark:border-[#3c4043] rounded-lg dark:bg-[#131314] dark:text-white"
                        />
                        {file && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Vald fil: {file.name}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={!file || importing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Upload size={20} />
                        {importing ? 'Importerar...' : 'Importera Kurskatalog'}
                    </button>
                </div>

                {result && (
                    <div className={`mt-6 p-4 rounded-lg border ${result.success
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        }`}>
                        <div className="flex items-start gap-3">
                            {result.success ? (
                                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                            ) : (
                                <XCircle className="text-red-600 flex-shrink-0" size={24} />
                            )}
                            <div className="flex-1">
                                <h3 className={`font-bold ${result.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                                    {result.success ? 'Import lyckades!' : 'Import misslyckades'}
                                </h3>
                                {result.success ? (
                                    <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                                        <p>{result.imported} nya kurser importerades</p>
                                        <p>Totalt: {result.total} kurser i databasen</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        {result.error || 'Ett fel uppstod vid import'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 dark:bg-[#131314] rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Format</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        CSV-filen måste ha följande format:
                    </p>
                    <code className="block mt-2 p-2 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded text-xs">
                        Kurskod,Kursnamn,Poäng,Ämne<br />
                        "ADIADM51","Administration 1","100","Administration"
                    </code>
                </div>
            </div>
        </div>
    );
};

export default SkolverketImport;
