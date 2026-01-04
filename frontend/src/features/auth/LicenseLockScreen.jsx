import React, { useState } from 'react';
import { Shield, AlertTriangle, Key, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // <---

const LicenseLockScreen = ({ onActivate, error, isLoading }) => {
    const { t } = useTranslation(); // <---
    const [keyInput, setKeyInput] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onActivate(keyInput); };
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white font-sans animate-in fade-in duration-700">
            <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mb-4 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]"><Shield size={40} className="text-red-500" /></div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('license.locked_title')}</h1>
                    <p className="text-gray-400 mt-2 text-sm">{t('license.locked_desc')}</p>
                </div>
                {error && <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm"><AlertTriangle size={18}/> {error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('license.key_label')}</label>
                        <div className="relative"><Key className="absolute left-3 top-3 text-gray-500" size={18} /><input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-100 font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder={t('license.key_placeholder')} value={keyInput} onChange={(e) => setKeyInput(e.target.value)} autoFocus /></div>
                    </div>
                    <button disabled={isLoading || !keyInput} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"><Unlock size={20}/> {t('license.activate_btn')}</button>
                </form>
            </div>
        </div>
    );
};

export default LicenseLockScreen;