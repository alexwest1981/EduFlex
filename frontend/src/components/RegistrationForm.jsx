import React, { useState } from 'react';
import { RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // <---

const PROFANITY_LIST = ['root', 'support', 'skit', 'fan', 'helvete', 'sex', 'xxx'];

const RegistrationForm = ({
                              isAdminContext,
                              registerForm,
                              setRegisterForm,
                              handleRegister,
                              handleGenerateUsernames,
                              usernameSuggestions,
                              checkUsernameAvailability
                          }) => {
    const { t } = useTranslation(); // <---
    const [usernameStatus, setUsernameStatus] = useState(null);

    const handleUsernameChange = (e) => {
        const val = e.target.value.toLowerCase().replace(/\s/g, '');
        setRegisterForm(prev => ({...prev, username: val}));
        setUsernameStatus(null);

        if (PROFANITY_LIST.some(badWord => val.includes(badWord))) {
            setUsernameStatus('profane');
        }
    };

    const handleUsernameBlur = async () => {
        if (!registerForm.username || usernameStatus === 'profane') return;
        setUsernameStatus('checking');
        const isTaken = await checkUsernameAvailability(registerForm.username);
        if (isTaken) setUsernameStatus('taken');
        else setUsernameStatus('available');
    };

    return (
        <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('auth.firstname')}</label>
                    <input className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" value={registerForm.firstName} onChange={e => setRegisterForm(prev => ({...prev, firstName: e.target.value}))} required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('auth.lastname')}</label>
                    <input className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" value={registerForm.lastName} onChange={e => setRegisterForm(prev => ({...prev, lastName: e.target.value}))} required />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t('auth.ssn')}</label>
                <input className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" value={registerForm.ssn} onChange={e => setRegisterForm(prev => ({...prev, ssn: e.target.value}))} placeholder="19900101-1234" required />
            </div>

            {/* --- USERNAME SECTION --- */}
            <div className={`p-4 rounded-lg border ${usernameStatus === 'profane' || usernameStatus === 'taken' ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
                <label className="block text-xs font-bold text-indigo-700 mb-2">{t('auth.username')}</label>

                <div className="flex gap-2 mb-3">
                    <button type="button" onClick={handleGenerateUsernames} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 transition-colors">
                        <RefreshCw size={12}/> {t('auth.generate')}
                    </button>
                    {usernameSuggestions.length > 0 && usernameSuggestions.map(uname => (
                        <button key={uname} type="button" onClick={() => { setRegisterForm(prev => ({...prev, username: uname})); setUsernameStatus('available'); }} className="px-3 py-1 rounded-full text-xs border bg-white text-gray-700 hover:border-indigo-400">{uname}</button>
                    ))}
                </div>

                <div className="relative">
                    <input
                        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${usernameStatus === 'profane' || usernameStatus === 'taken' ? 'border-red-300 focus:ring-red-500' : 'focus:ring-indigo-500'}`}
                        placeholder={t('auth.choose_or_generate')}
                        value={registerForm.username}
                        onChange={handleUsernameChange}
                        onBlur={handleUsernameBlur}
                        required
                    />
                    <div className="absolute right-3 top-2.5">
                        {usernameStatus === 'available' && <Check size={18} className="text-green-500"/>}
                        {(usernameStatus === 'taken' || usernameStatus === 'profane') && <X size={18} className="text-red-500"/>}
                    </div>
                </div>

                {usernameStatus === 'profane' && <p className="text-xs text-red-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {t('auth.profane')}</p>}
                {usernameStatus === 'taken' && <p className="text-xs text-red-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {t('auth.taken')}</p>}
                {usernameStatus === 'available' && <p className="text-xs text-green-600 mt-1 font-bold">{t('auth.available')}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('auth.password')}</label>
                    <input type="password" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={registerForm.password} onChange={e => setRegisterForm(prev => ({...prev, password: e.target.value}))} required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('auth.role')}</label>
                    <select className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500" value={registerForm.role} onChange={e => setRegisterForm(prev => ({...prev, role: e.target.value}))}>
                        <option value="STUDENT">{t('auth.student')}</option>
                        <option value="ADMIN">{t('auth.admin')}</option>
                        {isAdminContext && <option value="TEACHER">{t('auth.teacher')}</option>}
                        {isAdminContext && <option value="ADMIN">{t('auth.admin')}</option>}
                    </select>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase">{t('auth.contact_address')}</h4>
                <div><input type="email" placeholder={t('auth.email')} className="w-full px-4 py-2 border rounded-lg text-sm" value={registerForm.email} onChange={e => setRegisterForm(prev => ({...prev, email: e.target.value}))} required /></div>
                <div><input type="text" placeholder={t('auth.phone')} className="w-full px-4 py-2 border rounded-lg text-sm" value={registerForm.phone} onChange={e => setRegisterForm(prev => ({...prev, phone: e.target.value}))} /></div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3"><input type="text" placeholder={t('auth.street')} className="w-full px-4 py-2 border rounded-lg text-sm" value={registerForm.street} onChange={e => setRegisterForm(prev => ({...prev, street: e.target.value}))} required /></div>
                    <input type="text" placeholder={t('auth.zip')} className="w-full px-4 py-2 border rounded-lg text-sm" value={registerForm.zip} onChange={e => setRegisterForm(prev => ({...prev, zip: e.target.value}))} required />
                    <input type="text" placeholder={t('auth.city')} className="w-full px-4 py-2 border rounded-lg text-sm" value={registerForm.city} onChange={e => setRegisterForm(prev => ({...prev, city: e.target.value}))} required />
                    <input type="text" placeholder={t('auth.country')} className="w-full px-4 py-2 border rounded-lg text-sm" value={registerForm.country} onChange={e => setRegisterForm(prev => ({...prev, country: e.target.value}))} required />
                </div>
            </div>

            <button disabled={usernameStatus === 'profane' || usernameStatus === 'taken'} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isAdminContext ? t('auth.register_user_btn') : t('auth.create_account_btn')}
            </button>
        </form>
    );
};

export default RegistrationForm;
