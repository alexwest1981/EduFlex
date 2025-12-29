import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Save, Lock, User, AlertTriangle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

const UserProfile = ({ currentUser, showMessage, refreshUser }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('details');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        street: '', zip: '', city: '', country: '',
        language: 'sv'
    });

    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [fullUserData, setFullUserData] = useState(null);

    // --- HÄMTA FULLSTÄNDIG DATA ---
    useEffect(() => {
        const fetchFullProfile = async () => {
            if (currentUser?.id) {
                try {
                    const data = await api.users.getById(currentUser.id);
                    setFullUserData(data);
                    parseAndSetUserData(data);
                } catch (e) {
                    console.error("Kunde inte hämta profil:", e);
                    parseAndSetUserData(currentUser);
                }
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
            } else {
                street = user.address;
            }
        }

        const userLang = user.language || 'sv';

        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            street, zip, city, country,
            language: userLang
        });

        if (userLang !== i18n.language) {
            i18n.changeLanguage(userLang);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreviewImage(URL.createObjectURL(file));
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            // Använd api.documents.upload eller manuell fetch om api saknar avatar-stöd specifikt
            // Här använder vi en direkt fetch men med token från localStorage då api.js inte hade avatar-metod
            const token = localStorage.getItem('token');
            const res = await fetch(`http://127.0.0.1:8080/api/users/${currentUser.id}/avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });
            if (res.ok) {
                showMessage(t('messages.profile_updated'));
                refreshUser();
            }
        } catch (err) { console.error(err); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const fullAddress = `${formData.street}, ${formData.zip} ${formData.city}, ${formData.country}`;

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: fullAddress,
            language: formData.language
        };

        try {
            // FIX: Använd api.users.update istället för fetch.
            // Detta löser Content-Type felet eftersom api.js sätter 'application/json'
            await api.users.update(currentUser.id, payload);

            showMessage(t('messages.profile_updated'));
            i18n.changeLanguage(formData.language);
            refreshUser();
        } catch (err) {
            console.error(err);
            alert("Kunde inte spara profil. Kontrollera att alla fält är korrekta.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) {
            alert(t('profile.password_mismatch'));
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://127.0.0.1:8080/api/users/${currentUser.id}/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // VIKTIGT
                },
                body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
            });
            if (res.ok) {
                showMessage(t('messages.password_changed'));
                setPassData({ current: '', new: '', confirm: '' });
            } else {
                alert(t('profile.password_error'));
            }
        } catch (err) { console.error(err); }
    };

    const displayUser = fullUserData || currentUser;

    return (
        <div className="animate-in fade-in max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">{t('profile.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* VÄNSTER: Profilkort */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center h-fit">
                    <div className="relative group mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                            {previewImage || displayUser.profilePictureUrl ? (
                                <img src={previewImage || `http://127.0.0.1:8080${displayUser.profilePictureUrl}`} alt="Profil" className="w-full h-full object-cover"/>
                            ) : (
                                <span className="text-4xl font-bold text-gray-400">{displayUser.firstName?.[0]}</span>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
                            <Camera size={16}/>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                    <h2 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-sm text-gray-500 mb-4">@{currentUser.username} • {currentUser.role}</p>
                    <div className="w-full border-t pt-4 text-left space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600"><Mail size={16} className="text-indigo-500"/> {formData.email || "-"}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-600"><Phone size={16} className="text-indigo-500"/> {formData.phone || "-"}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-600"><MapPin size={16} className="text-indigo-500"/> {formData.city || "-"}</div>
                    </div>
                </div>

                {/* HÖGER: Redigering */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="flex border-b">
                        <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'details' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <div className="flex items-center justify-center gap-2"><User size={18}/> {t('profile.details')}</div>
                        </button>
                        <button onClick={() => setActiveTab('security')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <div className="flex items-center justify-center gap-2"><Lock size={18}/> {t('profile.security')}</div>
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'details' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Globe size={14}/> {t('profile.language')}</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg bg-white"
                                        value={formData.language}
                                        onChange={(e) => {
                                            setFormData({...formData, language: e.target.value});
                                        }}
                                    >
                                        <option value="sv">Svenska</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.firstname')}</label><input className="w-full px-4 py-2 border rounded-lg" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.lastname')}</label><input className="w-full px-4 py-2 border rounded-lg" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.email')}</label><input className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.phone')}</label><input className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase">{t('profile.address_header')}</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-3"><input placeholder={t('profile.street')} className="w-full px-4 py-2 border rounded-lg" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} /></div>
                                        <input placeholder={t('profile.zip')} className="w-full px-4 py-2 border rounded-lg" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                                        <input placeholder={t('profile.city')} className="w-full px-4 py-2 border rounded-lg" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                        <input placeholder={t('profile.country')} className="w-full px-4 py-2 border rounded-lg" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button disabled={isLoading} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50">
                                        <Save size={18}/> {isLoading ? 'Sparar...' : t('profile.save_changes')}
                                    </button>
                                </div>
                            </form>
                        )}
                        {activeTab === 'security' && (
                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md mx-auto py-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3 text-sm text-yellow-800"><AlertTriangle size={20} className="shrink-0"/><p>{t('profile.choose_strong_password')}</p></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.current_password')}</label><input type="password" className="w-full px-4 py-2 border rounded-lg" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} required /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.new_password')}</label><input type="password" className="w-full px-4 py-2 border rounded-lg" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.confirm_password')}</label><input type="password" className="w-full px-4 py-2 border rounded-lg" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required /></div>
                                <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 shadow-sm flex items-center justify-center gap-2 mt-4"><Lock size={18}/> {t('profile.update_password')}</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;