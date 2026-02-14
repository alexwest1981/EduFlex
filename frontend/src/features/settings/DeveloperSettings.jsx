import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Key, Trash2, Copy, Plus, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DeveloperSettings = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newKey, setNewKey] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [keyName, setKeyName] = useState('');

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            setLoading(true);
            const response = await api.get('/developer/keys');
            setKeys(response.data);
        } catch (error) {
            console.error("Failed to fetch keys", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (!keyName.trim()) return;
        try {
            setIsCreating(true);
            const response = await api.post('/developer/keys', { name: keyName });
            setNewKey(response.data.key);
            setKeyName('');
            toast.success("API-nyckel skapad");
            fetchKeys();
        } catch (error) {
            toast.error("Kunde inte skapa nyckel");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm("Är du säker på att du vill återkalla denna nyckel? Den kommer sluta fungera omedelbart.")) return;
        try {
            await api.delete(`/developer/keys/${id}`);
            toast.success("Nyckel återkallad");
            setKeys(keys.filter(k => k.id !== id));
        } catch (error) {
            toast.error("Kunde inte återkalla nyckel");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Kopierad till urklipp");
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Key className="w-6 h-6 text-indigo-600" />
                    Developer API Keys
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Hantera API-nycklar för att integrera EduFlex med externa system.
                </p>
            </div>

            {/* CREATE NEW KEY SECTION */}
            <div className="bg-white dark:bg-[#1E1E1F] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Skapa ny nyckel</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="Namn på nyckel (t.ex. 'Zapier Integration')"
                        className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                        onClick={handleCreateKey}
                        disabled={!keyName.trim() || isCreating}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Generera
                    </button>
                </div>

                {newKey && (
                    <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                                <Key className="w-5 h-5 text-green-700 dark:text-green-300" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-green-800 dark:text-green-200 mb-1">Nyckel skapad!</h4>
                                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                    Detta är enda gången du kommer se denna nyckel. Kopiera den nu och spara den säkert.
                                </p>
                                <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded border border-green-200 dark:border-green-800">
                                    <code className="flex-1 font-mono text-sm break-all text-gray-800 dark:text-gray-200 select-all">
                                        {newKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(newKey)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500"
                                        title="Kopiera"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* KEY LIST */}
            <div className="bg-white dark:bg-[#1E1E1F] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Aktiva Nycklar</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400">Laddar...</div>
                ) : keys.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        Du har inga aktiva API-nycklar.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {keys.map(key => (
                            <div key={key.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white mb-0.5">{key.name}</div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                            {key.prefix}
                                        </span>
                                        <span>•</span>
                                        <span>Skapad: {new Date(key.createdAt).toLocaleDateString()}</span>
                                        {key.lastUsed && (
                                            <>
                                                <span>•</span>
                                                <span className="text-indigo-500">Användes: {new Date(key.lastUsed).toLocaleDateString()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevoke(key.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Återkalla nyckel"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3 text-sm text-blue-800 dark:text-blue-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>
                    <strong>Säkerhetsvarning:</strong> Dina API-nycklar ger full tillgång till ditt konto.
                    Dela dem aldrig med någon. Om du misstänker att en nyckel läckt, återkalla den omedelbart.
                </p>
            </div>
        </div>
    );
};

export default DeveloperSettings;
