import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, X, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const PasswordConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { API_BASE = '/api' } = useAppContext() || {};
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Tenant detection (same logic as api.js)
    const getTenant = () => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 2) {
            const subdomain = parts[0];
            if (!['www', 'api', 'eduflexlms'].includes(subdomain)) return subdomain;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        const tenant = getTenant();

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        if (tenant) headers['X-Tenant-ID'] = tenant;
        try {
            const res = await fetch(`${API_BASE}/auth/verify-password`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                onConfirm(password);
                setPassword('');
                onClose();
            } else {
                const msg = await res.text();
                setError(msg || 'Fel lösenord, försök igen.');
            }
        } catch (err) {
            setError('Ett fel uppstod vid verifiering');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title || 'Bekräfta lösenord'}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        {message || 'För din säkerhet måste du ange ditt lösenord för att visa känslig information.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                                placeholder="Ditt lösenord"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold px-1 animate-in shake duration-300">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verifiera'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordConfirmModal;
