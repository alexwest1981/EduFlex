import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Save, Lock, User, AlertTriangle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api.js';

const UserProfile = ({ currentUser, showMessage, refreshUser }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('details');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        street: '', zip: '', city: '', country: '', language: 'sv'
    });

    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [fullUserData, setFullUserData] = useState(null);

    useEffect(() => {
        const fetchFullProfile = async () => {
            if (currentUser?.id) {
                try {
                    const data = await api.users.getById(currentUser.id);
                    setFullUserData(data);
                    parseAndSetUserData(data);
                } catch (e) { console.error(e); parseAndSetUserData(currentUser); }
            }
        };
        fetchFullProfile();
    }, [currentUser]);

    const parseAndSetUserData = (user) => {
        let street = '', zip = '', city = '', country = '';
        if (user.address) {
            const parts = user.address.split(', ');
            if (parts.length >= 3) {
                street = parts[0];
                const zipCity = parts[1].split(' ');
                zip = zipCity[0];
                city = zipCity.slice(1).join(' ');
                country = parts[2];
            } else { street = user.address; }
        }
        const userLang = user.language || 'sv';
        setFormData({
            firstName: user.firstName || '', lastName: user.lastName || '',
            email: user.email || '', phone: user.phone || '',
            street, zip, city, country, language: userLang
        });
        if (userLang !== i18n.language) i18n.changeLanguage(userLang);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreviewImage(URL.createObjectURL(file));
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://127.0.0.1:8080/api/users/${currentUser.id}/avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });
            if (res.ok) { showMessage(t('messages.profile_updated')); refreshUser(); }
        } catch (err) { console.error(err); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const fullAddress = `${formData.street}, ${formData.zip} ${formData.city}, ${formData.country}`;
        const payload = {
            firstName: formData.firstName, lastName: formData.lastName,
            email: formData.email, phone: formData.phone,
            address: fullAddress, language: formData.language
        };
        try {
            await api.users.update(currentUser.id, payload);
            showMessage(t('messages.profile_updated'));
            i18n.changeLanguage(formData.language);
            refreshUser();
        } catch (err) { alert("Fel vid sparande."); }
        finally { setIsLoading(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) return alert(t('profile.password_mismatch'));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://127.0.0.1:8080/api/users/${currentUser.id}/password`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
            });
            if (res.ok) { showMessage(t('messages.password_changed')); setPassData({ current: '', new: '', confirm: '' }); }
            else alert(t('profile.password_error'));
        } catch (err) { console.error(err); }
    };

    const displayUser = fullUserData || currentUser;

    return (
        <div className="animate-in fade-in max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-[#E3E3E3] transition-colors">{t('profile.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* VÄNSTER: Profilkort (Gemini Surface: #1E1F20) */}
                <div className="p-6 flex flex-col items-center text-center h-fit bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] transition-colors">
                    <div className="relative group mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-[#282a2c] shadow-sm bg-gray-50 dark:bg-[#131314] flex items-center justify-center">
                            {previewImage || displayUser.profilePictureUrl ? (
                                <img src={previewImage || `http://127.0.0.1:8080${displayUser.profilePictureUrl}`} alt="Profil" className="w-full h-full object-cover"/>
                            ) : (
                                <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">{displayUser.firstName?.[0]}</span>
                            )}
                        </div>
                        {/* Kamera-knapp */}
                        <label className="absolute bottom-0 right-0 bg-black dark:bg-[#3c4043] text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-md border border-white dark:border-[#1E1F20]">
                            <Camera size={16}/>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#E3E3E3]">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">@{currentUser.username} • {currentUser.role}</p>
                    <div className="w-full border-t border-gray-100 dark:border-[#282a2c] pt-4 text-left space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><Mail size={16} className="text-gray-400"/> {formData.email || "-"}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><Phone size={16} className="text-gray-400"/> {formData.phone || "-"}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><MapPin size={16} className="text-gray-400"/> {formData.city || "-"}</div>
                    </div>
                </div>

                {/* HÖGER: Redigering (Gemini Surface: #1E1F20) */}
                <div className="md:col-span-2 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] overflow-hidden transition-colors">
                    <div className="flex border-b border-gray-200 dark:border-[#282a2c]">
                        {/* Tabbar: Subtil border, vit text */}
                        <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'details' ? 'bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}>
                            <div className="flex items-center justify-center gap-2"><User size={18}/> {t('profile.details')}</div>
                        </button>
                        <button onClick={() => setActiveTab('security')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'security' ? 'bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}>
                            <div className="flex items-center justify-center gap-2"><Lock size={18}/> {t('profile.security')}</div>
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'details' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                                        {t('profile.language')}
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={formData.language}
                                        onChange={(e) => {
                                            setFormData({ ...formData, language: e.target.value });
                                            i18n.changeLanguage(e.target.value); // Byt språk direkt i UI
                                        }}
                                    >
                                        <option value="sv">Svenska</option>
                                        <option value="en">English</option>
                                        <option value="ar">العربية (Arabic)</option>
                                        <option value="de">Deutsch (German)</option>
                                        <option value="fr">Français (French)</option>
                                        <option value="es">Español (Spanish)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.firstname')}</label><input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.lastname')}</label><input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.email')}</label><input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.phone')}</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#282a2c] p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] space-y-3 transition-colors">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('profile.address_header')}</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-3"><input placeholder={t('profile.street')} value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} /></div>
                                        <input placeholder={t('profile.zip')} value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                                        <input placeholder={t('profile.city')} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                        <input placeholder={t('profile.country')} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    {/* KNAPP: Vit/Svart för maximal kontrast */}
                                    <button disabled={isLoading} className="bg-gray-900 dark:bg-[#c2e7ff] text-white dark:text-[#001d35] px-6 py-2.5 rounded-lg font-bold hover:bg-black dark:hover:bg-[#b3d7ef] shadow-sm flex items-center gap-2 disabled:opacity-50 transition-colors">
                                        <Save size={18}/> {isLoading ? 'Sparar...' : t('profile.save_changes')}
                                    </button>
                                </div>
                            </form>
                        )}
                        {activeTab === 'security' && (
                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md mx-auto py-4">
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 mb-6 flex gap-3 text-sm text-amber-800 dark:text-amber-500"><AlertTriangle size={20} className="shrink-0"/><p>{t('profile.choose_strong_password')}</p></div>
                                <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.current_password')}</label><input type="password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} required /></div>
                                <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.new_password')}</label><input type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required /></div>
                                <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.confirm_password')}</label><input type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required /></div>
                                <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-bold hover:bg-black dark:hover:bg-gray-100 shadow-sm flex items-center justify-center gap-2 mt-4 transition-colors"><Lock size={18}/> {t('profile.update_password')}</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;