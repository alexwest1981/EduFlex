import React, { useState } from 'react';
import { Lock, Key, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const LicenseActivation = () => {
    const { setLicenseStatus } = useAppContext();
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleActivate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.system.activateLicense(key);
            alert("Licens aktiverad! Startar om...");
            setLicenseStatus('valid');
            window.location.reload(); // Ladda om för att hämta nya rättigheter
        } catch (err) {
            setError("Ogiltig licensnyckel. Kontrollera och försök igen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1E1F20] max-w-md w-full rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-red-600 p-6 text-center">
                    <div className="mx-auto bg-red-800/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Systemet är låst</h2>
                    <p className="text-red-100 text-sm mt-1">Ingen giltig licens hittades.</p>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center text-sm">
                        För att använda EduFlex måste du ha en aktiv licens. Vänligen ange din produktnyckel nedan.
                    </p>

                    <form onSubmit={handleActivate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Licensnyckel</label>
                            <textarea
                                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-[#131314] dark:border-[#3c4043] dark:text-white font-mono text-xs h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="eyJ..."
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                <ShieldAlert size={16}/> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? 'Verifierar...' : <><Key size={18}/> Aktivera Licens</>}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[#3c4043] text-center">
                        <p className="text-xs text-gray-400">Behöver du en licens? Kontakta support@eduflex.se</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LicenseActivation;