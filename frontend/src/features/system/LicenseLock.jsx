import React, { useState } from 'react';
import { ShieldAlert, Key, Upload, Lock, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const LicenseLock = () => {
    const [licenseKey, setLicenseKey] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [msg, setMsg] = useState('');

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const content = ev.target.result;
            // Trim whitespace
            setLicenseKey(content.trim());
        };
        reader.readAsText(file);
    };

    const activate = async () => {
        setStatus('loading');
        try {
            await api.system.activateLicense(licenseKey);
            setStatus('success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (e) {
            setStatus('error');
            setMsg("Ogiltig licensfil. Kontrollera att filen ej är modifierad.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                <div className="bg-red-500/10 p-6 border-b border-red-500/20 flex flex-col items-center text-center">
                    <div className="bg-red-500/20 p-4 rounded-full mb-4">
                        <Lock size={48} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Systemet är Låst</h1>
                    <p className="text-red-200 text-sm">Valid licens saknas eller har gått ut.</p>
                </div>

                <div className="p-8 space-y-6">
                    {status === 'success' ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in">
                            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white">Licens Aktiverad!</h2>
                            <p className="text-gray-400">Startar om systemet...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-900/50 p-4 rounded-xl border border-dashed border-gray-600 hover:border-indigo-500 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    onChange={handleUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-white">
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-sm font-medium">Klicka för att ladda upp .lic fil</span>
                                </div>
                            </div>

                            {licenseKey && (
                                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase">
                                        <Key size={12} />
                                        Licensnyckel (Laddad)
                                    </div>
                                    <code className="text-[10px] text-gray-500 break-all line-clamp-3">
                                        {licenseKey}
                                    </code>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    {msg}
                                </div>
                            )}

                            <button
                                onClick={activate}
                                disabled={!licenseKey || status === 'loading'}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
                            >
                                {status === 'loading' ? 'Verifierar...' : 'Lås Upp Systemet'}
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-gray-900 p-4 text-center text-xs text-gray-600 border-t border-gray-700">
                    EduFlex Secure Systems • ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}
                </div>
            </div>
        </div>
    );
};

export default LicenseLock;
