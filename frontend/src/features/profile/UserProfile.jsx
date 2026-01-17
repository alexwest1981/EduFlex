import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Mail, Phone, MapPin, Save, Lock, User, AlertTriangle, Globe, Settings as SettingsIcon, Layout, Download, Shield, CreditCard, Check, X, Linkedin, Instagram, Facebook, Twitter, Search, UserPlus, UserMinus, Ban, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api.js';
import UserBilling from '../billing/UserBilling';
import { useModules } from '../../context/ModuleContext';

import UserAvatar from '../../components/common/UserAvatar';
import AchievementsGallery from '../../components/gamification/AchievementsGallery';

const ConnectionRequests = ({ currentUser, showMessage }) => {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState('loading');

    const fetchRequests = async () => {
        try {
            const data = await api.connections.getRequests();
            setRequests(data);
            setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (id) => {
        try {
            await api.connections.accept(id);
            showMessage("Förfrågan accepterad");
            fetchRequests();
        } catch (e) {
            console.error(e);
        }
    };

    const handleReject = async (id) => {
        try {
            await api.connections.reject(id);
            showMessage("Förfrågan avvisad");
            fetchRequests();
        } catch (e) {
            console.error(e);
        }
    };

    if (status === 'loading') return <div className="p-4 text-center">Laddar...</div>;
    if (requests.length === 0) return <div className="p-8 text-center text-gray-500">Inga väntande förfrågningar.</div>;

    return (
        <div className="space-y-4">
            {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#131314] rounded-xl border border-gray-100 dark:border-[#3c4043] shadow-sm">
                    <div className="flex items-center gap-4">
                        <UserAvatar user={req.requester} size="w-12 h-12" />
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{req.requester.firstName} {req.requester.lastName}</h4>
                            <p className="text-sm text-gray-500">@{req.requester.username}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleAccept(req.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                            <Check size={20} />
                        </button>
                        <button onClick={() => handleReject(req.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ConnectionManager = ({ currentUser, showMessage }) => {
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch friends on mount
    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            const data = await api.messages.getContacts();
            setFriends(data.friends || []);
        } catch (e) { console.error(e); }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await api.users.search(searchQuery);
            // Filter out self
            setSearchResults(results.filter(u => u.id !== currentUser.id));
        } catch (e) { console.error(e); }
        setIsSearching(false);
    };

    const sendRequest = async (userId) => {
        try {
            await api.connections.request(userId);
            showMessage("Vänförfrågan skickad");
            // Update UI state if possible (remove from search results or mark as pending)
            setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, requestSent: true } : u));
        } catch (e) { alert(e.message); }
    };

    const removeFriend = async (userId) => {
        if (!window.confirm("Är du säker på att du vill ta bort den här vännen?")) return;
        try {
            await api.connections.remove(userId);
            showMessage("Vän borttagen");
            loadFriends();
        } catch (e) { alert(e.message); }
    };

    const blockUser = async (userId) => {
        if (!window.confirm("Är du säker på att du vill blockera den här användaren? De kommer inte kunna kontakta dig.")) return;
        try {
            await api.connections.block(userId);
            showMessage("Användare blockerad");
            loadFriends();
            // Also remove from search results if present
            setSearchResults(prev => prev.filter(u => u.id !== userId));
        } catch (e) { alert(e.message); }
    };

    return (
        <div className="space-y-8">
            {/* SEARCH SECTION */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2"><UserPlus size={20} /> Hitta vänner</h3>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            placeholder="Sök efter namn, användarnamn eller e-post..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="button" onClick={handleSearch} disabled={isSearching} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {isSearching ? 'Söker...' : 'Sök'}
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div className="space-y-2">
                        {searchResults.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043]">
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={user} size="w-10 h-10" fontSize="text-sm" />
                                    <div>
                                        <div className="font-bold text-sm dark:text-white">{user.fullName}</div>
                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {user.requestSent ? (
                                        <span className="text-xs text-green-600 font-bold px-3 py-1 bg-green-100 rounded-full">Skickat</span>
                                    ) : (
                                        <button onClick={() => sendRequest(user.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Lägg till vän">
                                            <UserPlus size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => blockUser(user.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Blockera">
                                        <Ban size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MY FRIENDS LIST */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-white">Mina Vänner ({friends.length})</h3>
                {friends.length === 0 && <p className="text-gray-500 italic">Du har inga vänner än.</p>}
                <div className="grid grid-cols-1 gap-3">
                    {friends.map(friend => (
                        <div key={friend.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm group hover:border-indigo-200 transition-colors">
                            <Link to={`/profile/${friend.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                <UserAvatar user={friend} size="w-12 h-12" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{friend.fullName}</h4>
                                    <p className="text-sm text-gray-500">{friend.role}</p>
                                </div>
                            </Link>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => removeFriend(friend.id)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                    <UserMinus size={14} /> Ta bort
                                </button>
                                <button onClick={() => blockUser(friend.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors" title="Blockera">
                                    <Ban size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const UserProfile = ({ currentUser, showMessage, refreshUser }) => {
    const { t, i18n } = useTranslation();
    const { isModuleActive } = useModules();
    const [activeTab, setActiveTab] = useState('details');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        street: '', zip: '', city: '', country: '', language: 'sv',
        dashboardSettings: { showCalendar: true, showMessages: true, showStats: true },
        linkedinUrl: '', instagramUrl: '', facebookUrl: '', twitterUrl: ''
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
        let dbSettings = {
            showActiveCourses: true,
            showMyStudents: true,
            showToGrade: true,
            showApplications: true,
            showAtRisk: true,
            showSchedule: true,
            showShortcuts: true,
            showMessages: true,
            publicProfile: true // Default to true
        };
        try {
            if (user.settings) {
                const parsed = JSON.parse(user.settings);
                // Merge parsed settings with defaults to ensure all keys exist
                dbSettings = { ...dbSettings, ...parsed };
            }
        } catch (e) { console.error("Could not parse settings", e); }

        setFormData({
            firstName: user.firstName || '', lastName: user.lastName || '',
            email: user.email || '', phone: user.phone || '',
            street, zip, city, country, language: userLang,
            dashboardSettings: dbSettings,
            linkedinUrl: user.linkedinUrl || '',
            instagramUrl: user.instagramUrl || '',
            facebookUrl: user.facebookUrl || '',
            twitterUrl: user.twitterUrl || ''
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
            const res = await fetch(`http://localhost:8080/api/users/${currentUser.id}/avatar`, {
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
            firstName: formData.firstName, lastName: formData.lastName,
            email: formData.email, phone: formData.phone,
            address: fullAddress, language: formData.language,
            settings: JSON.stringify(formData.dashboardSettings),
            linkedinUrl: formData.linkedinUrl,
            instagramUrl: formData.instagramUrl,
            facebookUrl: formData.facebookUrl,
            twitterUrl: formData.twitterUrl
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
            const res = await fetch(`http://localhost:8080/api/users/${currentUser.id}/password`, {
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
        <div className="animate-in fade-in max-w-7xl mx-auto pb-20">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-[#E3E3E3] transition-colors">{t('profile.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* VÄNSTER: Profilkort (Gemini Surface: #1E1F20) */}
                <div className="p-6 flex flex-col items-center text-center h-fit bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] transition-colors">
                    <div className="relative group mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-[#282a2c] shadow-sm bg-gray-50 dark:bg-[#131314] flex items-center justify-center">
                            {(() => {
                                if (previewImage) return <img src={previewImage} alt="Profil" className="w-full h-full object-cover" />;
                                if (displayUser.profilePictureUrl) {
                                    let url = displayUser.profilePictureUrl;
                                    if (url.includes('minio:9000')) url = url.replace('minio:9000', 'localhost:9000');
                                    const finalUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
                                    return <img src={finalUrl} alt="Profil" className="w-full h-full object-cover" />;
                                }
                                return <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">{displayUser.firstName?.[0]}</span>;
                            })()}
                        </div>
                        {/* Kamera-knapp */}
                        <label className="absolute bottom-0 right-0 bg-black dark:bg-[#3c4043] text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-md border border-white dark:border-[#1E1F20]">
                            <Camera size={16} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#E3E3E3]">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">@{currentUser.username} • {currentUser.role?.name || currentUser.role}</p>
                    <div className="w-full border-t border-gray-100 dark:border-[#282a2c] pt-4 text-left space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><Mail size={16} className="text-gray-400" /> {formData.email || "-"}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><Phone size={16} className="text-gray-400" /> {formData.phone || "-"}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><MapPin size={16} className="text-gray-400" /> {formData.city || "-"}</div>
                    </div>
                </div>

                {/* HÖGER: Redigering (Gemini Surface: #1E1F20) */}
                <div className="md:col-span-2 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#282a2c] overflow-hidden transition-colors">
                    <div className="flex border-b border-gray-200 dark:border-[#282a2c] overflow-x-auto">
                        {/* Tabbar: Subtil border, vit text */}
                        <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 font-bold text-sm min-w-[120px] transition-colors ${activeTab === 'details' ? 'bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}>
                            <div className="flex items-center justify-center gap-2"><User size={18} /> {t('profile.details')}</div>
                        </button>

                        <button onClick={() => setActiveTab('connections')} className={`flex-1 py-4 font-bold text-sm min-w-[120px] transition-colors ${activeTab === 'connections' ? 'bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}>
                            <div className="flex items-center justify-center gap-2"><User size={18} /> Relationer</div>
                        </button>

                        <button onClick={() => setActiveTab('achievements')} className={`flex-1 py-4 font-bold text-sm min-w-[120px] transition-colors ${activeTab === 'achievements' ? 'bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}>
                            <div className="flex items-center justify-center gap-2"><Award size={18} /> Prestationer</div>
                        </button>

                        <button onClick={() => setActiveTab('security_privacy')} className={`flex-1 py-4 font-bold text-sm min-w-[120px] transition-colors ${activeTab === 'security_privacy' ? 'bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}>
                            <div className="flex items-center justify-center gap-2"><Shield size={18} /> Säkerhet & Integritet</div>
                        </button>

                        {isModuleActive('REVENUE') && (
                            <button onClick={() => setActiveTab('billing')} className={`flex-1 py-4 font-bold text-sm min-w-[120px] transition-colors ${activeTab === 'billing' ? 'bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}>
                                <div className="flex items-center justify-center gap-2"><CreditCard size={18} /> Fakturering</div>
                            </button>
                        )}
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
                                        <option value="no">Norsk (Norwegian)</option>
                                        <option value="da">Dansk (Danish)</option>
                                        <option value="fi">Suomi (Finnish)</option>
                                        <option value="ar">العربية (Arabic)</option>
                                        <option value="de">Deutsch (German)</option>
                                        <option value="fr">Français (French)</option>
                                        <option value="es">Español (Spanish)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.firstname')}</label><input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.lastname')}</label><input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.email')}</label><input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.phone')}</label><input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                </div>

                                <div className="bg-gray-50 dark:bg-[#282a2c] p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] space-y-3 transition-colors">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sociala Medier</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Linkedin size={14} /> LinkedIn</label>
                                            <input placeholder="URL" className="w-full p-2 rounded-lg border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#131314] text-sm" value={formData.linkedinUrl} onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Instagram size={14} /> Instagram</label>
                                            <input placeholder="URL" className="w-full p-2 rounded-lg border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#131314] text-sm" value={formData.instagramUrl} onChange={e => setFormData({ ...formData, instagramUrl: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Facebook size={14} /> Facebook</label>
                                            <input placeholder="URL" className="w-full p-2 rounded-lg border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#131314] text-sm" value={formData.facebookUrl} onChange={e => setFormData({ ...formData, facebookUrl: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Twitter size={14} /> Twitter / X</label>
                                            <input placeholder="URL" className="w-full p-2 rounded-lg border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#131314] text-sm" value={formData.twitterUrl} onChange={e => setFormData({ ...formData, twitterUrl: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-[#282a2c] p-4 rounded-xl border border-gray-100 dark:border-[#3c4043] space-y-3 transition-colors">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('profile.address_header')}</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-3"><input placeholder={t('profile.street')} value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} /></div>
                                        <input placeholder={t('profile.zip')} value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                                        <input placeholder={t('profile.city')} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                        <input placeholder={t('profile.country')} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    {/* KNAPP: Vit/Svart för maximal kontrast */}
                                    <button disabled={isLoading} className="bg-gray-900 dark:bg-[#c2e7ff] text-white dark:text-[#001d35] px-6 py-2.5 rounded-lg font-bold hover:bg-black dark:hover:bg-[#b3d7ef] shadow-sm flex items-center gap-2 disabled:opacity-50 transition-colors">
                                        <Save size={18} /> {isLoading ? 'Sparar...' : t('profile.save_changes')}
                                    </button>
                                </div>
                            </form>
                        )}
                        {activeTab === 'security_privacy' && (
                            <div className="space-y-12 py-4">
                                <div className="max-w-xl">
                                    <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><Lock size={20} /> Lösenord & Säkerhet</h3>
                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 mb-6 flex gap-3 text-sm text-amber-800 dark:text-amber-500"><AlertTriangle size={20} className="shrink-0" /><p>{t('profile.choose_strong_password')}</p></div>
                                        <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.current_password')}</label><input type="password" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} required className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043]" /></div>
                                        <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.new_password')}</label><input type="password" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} required className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043]" /></div>
                                        <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('profile.confirm_password')}</label><input type="password" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} required className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043]" /></div>
                                        <button className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold hover:bg-black dark:hover:bg-gray-100 shadow-sm flex items-center justify-center gap-2 mt-4 transition-colors"><Lock size={16} /> {t('profile.update_password')}</button>
                                    </form>
                                </div>

                                <div className="border-t border-gray-200 dark:border-[#3c4043] pt-8">
                                    <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2"><Shield size={20} /> Integritet & Data</h3>

                                    {/* NY Sektion: Synlighet */}
                                    <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm mb-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                                                    <Globe size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Offentlig Profil</h2>
                                                    <p className="text-gray-500 text-sm">Gör din profil sökbar och synlig för andra användare.</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.dashboardSettings?.publicProfile !== false}
                                                    onChange={(e) => {
                                                        const newSettings = { ...formData.dashboardSettings, publicProfile: e.target.checked };
                                                        setFormData({ ...formData, dashboardSettings: newSettings });
                                                    }}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                                                    <Download size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dataskydd (GDPR)</h2>
                                                    <p className="text-gray-500 text-sm">Hantera din personliga data och export.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#131314] rounded-xl border border-gray-100 dark:border-[#3c4043]">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">Exportera min data</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Ladda ner en JSON-fil med all din information.</p>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const data = await api.users.exportData();
                                                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = `gdpr-export-${new Date().toISOString().split('T')[0]}.json`;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                        } catch (e) {
                                                            alert("Kunde inte exportera data: " + e.message);
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    <Download size={16} />
                                                    Ladda ner
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 p-6">
                                            <h3 className="font-bold text-red-800 dark:text-red-400 mb-2">Radera konto</h3>
                                            <p className="text-sm text-red-700 dark:text-red-300 mb-4">Om du raderar ditt konto försvinner all din data permanent. Detta går inte att ångra.</p>
                                            <button onClick={() => alert("Kontakta admin för att radera ditt konto.")} className="text-xs bg-red-600 text-white px-3 py-2 rounded font-bold hover:bg-red-700">
                                                Begär radering av konto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold dark:text-white">Förfrågningar</h3>
                                <ConnectionRequests currentUser={currentUser} showMessage={showMessage} />
                                <div className="border-t border-gray-100 dark:border-[#3c4043] my-8"></div>
                                <ConnectionManager currentUser={currentUser} showMessage={showMessage} />
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <AchievementsGallery currentUser={currentUser} />
                        )}



                        {activeTab === 'billing' && (
                            <UserBilling userId={currentUser?.id} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;