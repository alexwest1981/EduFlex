import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Smartphone, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const MfaSetupModal = ({ isOpen, onClose, onComplete }) => {
    const { API_BASE = '/api' } = useAppContext() || {};
    const [step, setStep] = useState(1); // 1: Info, 2: Scan QR, 3: Verify
    const [loading, setLoading] = useState(false);
    const [setupData, setSetupData] = useState(null); // { secret, qrCodeUrl }
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const handleStartSetup = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/auth/mfa/setup`, {
                method: 'POST',
                headers
            });
            if (!res.ok) throw new Error('Kunde inte initiera MFA-inställningar');
            const data = await res.json();
            setSetupData(data);
            setStep(2);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndEnable = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/auth/mfa/enable`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    secret: setupData.secret,
                    code: code
                })
            });

            if (res.ok) {
                toast.success('MFA har aktiverats!');
                setStep(4); // Success step
                if (onComplete) onComplete();
            } else {
                const msg = await res.text();
                setError(msg || 'Ogiltig kod, försök igen.');
            }
        } catch (err) {
            setError('Ett fel uppstod vid verifiering');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tvåstegsverifiering</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Skydda ditt konto med MFA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-8">
                    {/* STEP 1: INFO */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Smartphone size={40} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Öka din säkerhet</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                                Genom att aktivera MFA kommer du behöva en engångskod från din autentiseringsapp (t.ex. Google Authenticator) varje gång du loggar in.
                            </p>
                            <button
                                onClick={handleStartSetup}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Kom igång'}
                            </button>
                        </div>
                    )}

                    {/* STEP 2: SCAN QR */}
                    {step === 2 && setupData && (
                        <div className="text-center animate-in slide-in-from-right-4">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Steg 1: Skanna QR-koden</p>
                            <div className="bg-white p-4 rounded-3xl inline-block shadow-inner mb-6 border border-gray-100">
                                <QRCodeSVG value={setupData.qrCodeUrl} size={180} level="H" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                                Öppna din valda autentiseringsapp och skanna koden ovan.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all"
                                >
                                    Jag har skannat koden
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-xs text-gray-400 hover:text-indigo-600 font-bold uppercase tracking-widest"
                                >
                                    Gå tillbaka
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: VERIFY */}
                    {step === 3 && (
                        <div className="text-center animate-in slide-in-from-right-4">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Steg 2: Verifiera din setup</p>
                            <form onSubmit={handleVerifyAndEnable}>
                                <div className="mb-8">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3 px-1 text-left">Ange 6-siffrig kod</label>
                                    <input
                                        type="text"
                                        placeholder="000 000"
                                        value={code}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setCode(val);
                                            setError('');
                                        }}
                                        className="w-full text-center text-3xl font-black tracking-[0.5em] py-5 bg-gray-50 dark:bg-[#131314] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-200 dark:placeholder:text-gray-800 text-gray-900 dark:text-white"
                                        required
                                    />
                                    {error && (
                                        <div className="mt-3 flex items-center justify-center gap-2 text-red-500 text-sm font-bold animate-in shake duration-300">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || code.length !== 6}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Aktivera nu'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="mt-4 text-xs text-gray-400 hover:text-indigo-600 font-bold uppercase tracking-widest"
                                >
                                    Visa QR-kod igen
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <div className="text-center py-4 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Klart!</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                                Tvåstegsverifiering har aktiverats för ditt konto. Kom ihåg att alltid ha tillgång till din autentiseringsapp när du loggar in.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-black py-4 rounded-2xl transition-all"
                            >
                                Stäng
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MfaSetupModal;
