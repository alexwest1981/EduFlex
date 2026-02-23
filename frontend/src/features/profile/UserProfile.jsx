import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Camera, Mail, Phone, MapPin, Save, Lock, User, AlertTriangle, Globe,
    Layout, Download, Shield, CreditCard, Check, X,
    Linkedin, Instagram, Facebook, Twitter, Search, UserPlus, UserMinus, Ban, Award,
    Briefcase, LogOut, Zap, Bell, Smartphone, MessageSquare, Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getSafeUrl } from '../../services/api.js';
import UserBilling from '../billing/UserBilling';
import { useModules } from '../../context/ModuleContext';

import UserAvatar from '../../components/common/UserAvatar';
import ImageCropDialog from '../../components/common/ImageCropDialog';
import AchievementsGallery from '../../components/gamification/AchievementsGallery';
import { getGamificationAssetPath } from '../../utils/gamificationUtils';
import eduGameService from '../../services/eduGameService';

// ... (Keep existing ConnectionRequests and ConnectionManager components if not extracting them yet, 
// for simplicity in this step I will include them or keep the logic inline if they were inline. 
// The prompt implies refactoring existing file. The existing file had them inline. 
// I will keep them inline to avoid file sprawl unless verification fails.)

// --- Inline Components for context (Simulated extraction for cleaner code in future) ---
const ConnectionRequestsComponent = ({ currentUser, showMessage }) => {
    // ... Copy logic from original ConnectionRequests
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

const ConnectionManagerComponent = ({ currentUser, showMessage }) => {
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

const UserProfile = ({ currentUser, showMessage, refreshUser, logout }) => {
    const { t, i18n } = useTranslation();
    const { isModuleActive } = useModules();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        street: '', zip: '', city: '', country: '', language: 'sv',
        dashboardSettings: { showCalendar: true, showMessages: true, showStats: true },
        linkedinUrl: '', instagramUrl: '', facebookUrl: '', twitterUrl: ''
    });

    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [fullUserData, setFullUserData] = useState(null);

    // --- GAMES / THEMES STATE ---
    const [themesTab, setThemesTab] = useState('FRAME'); // 'FRAME', 'BACKGROUND', 'TITLE'
    const [inventory, setInventory] = useState([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [streakCount, setStreakCount] = useState(0);

    // --- NOTIFICATION PREFERENCES ---
    const [preferences, setPreferences] = useState([]);
    const [isPrefLoading, setIsPrefLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'notifications') {
            fetchPreferences();
        }
    }, [activeTab]);

    const fetchPreferences = async () => {
        setIsPrefLoading(true);
        try {
            const data = await api.notifications.getPreferences(currentUser.id);
            setPreferences(data);
        } catch (e) {
            console.error("Failed to fetch notification preferences", e);
        } finally {
            setIsPrefLoading(false);
        }
    };

    const handlePrefToggle = async (category, channel, enabled) => {
        try {
            await api.notifications.updatePreference(currentUser.id, category, channel, enabled);
            // Optimistic update
            setPreferences(prev => {
                const index = prev.findIndex(p => p.category === category && p.channel === channel);
                if (index > -1) {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], enabled };
                    return updated;
                } else {
                    return [...prev, { category, channel, enabled }];
                }
            });
        } catch (e) {
            showMessage("Kunde inte uppdatera inställningen", "error");
        }
    };

    // Sync activeTab with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }

        // Load inventory if landing on themes
        if (tab === 'themes' && isModuleActive('GAMIFICATION')) {
            loadInventory();
        }
    }, [searchParams]);

    const handleTabChange = (id) => {
        setActiveTab(id);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', id);
        setSearchParams(newParams);

        if (id === 'themes' && isModuleActive('GAMIFICATION')) {
            loadInventory();
        }
    };

    const loadInventory = async () => {
        setIsLoadingInventory(true);
        try {
            const data = await eduGameService.getMyInventory();
            setInventory(data);
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setIsLoadingInventory(false);
        }
    };

    const handleEquipItem = async (item) => {
        try {
            await eduGameService.equipItem(item.id);
            showMessage(`${item.name} aktiverad!`);
            refreshUser();
        } catch (error) {
            console.error("Failed to equip item", error);
            alert("Kunde inte byta föremål.");
        }
    };

    const handleUnequipItem = async (type) => {
        try {
            await eduGameService.unequipItem(type);
            showMessage("Standard inställd!");
            refreshUser();
        } catch (error) {
            console.error("Failed to unequip item", error);
            alert("Kunde inte återställa till standard.");
        }
    };

    useEffect(() => {
        const fetchFullProfile = async () => {
            if (currentUser?.id) {
                try {
                    const data = await api.users.getById(currentUser.id);
                    setFullUserData(data);
                    parseAndSetUserData(data);
                } catch (e) { console.error(e); parseAndSetUserData(currentUser); }

                // Fetch streak separately
                try {
                    const streakData = await api.gamification.getMyStreak();
                    setStreakCount(streakData?.streak || 0);
                } catch (e) { console.error("Failed to load streak", e); }
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCropImageSrc(URL.createObjectURL(file));
        setCropDialogOpen(true);
        e.target.value = '';
    };

    const handleCroppedImage = async (blob) => {
        setCropDialogOpen(false);
        setCropImageSrc(null);
        setPreviewImage(URL.createObjectURL(blob));
        const formDataUpload = new FormData();
        formDataUpload.append('file', blob, 'avatar.jpg');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${window.location.origin}/api/users/${currentUser.id}/avatar`, {
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
            const res = await fetch(`${window.location.origin}/api/users/${currentUser.id}/password`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
            });
            if (res.ok) { showMessage(t('messages.password_changed')); setPassData({ current: '', new: '', confirm: '' }); }
            else alert(t('profile.password_error'));
        } catch (err) { console.error(err); }
    };

    const displayUser = fullUserData || currentUser;

    // MENU ITEMS CONFIGURATION
    const menuItems = [
        { id: 'details', icon: User, label: t('profile.details') },
        { id: 'security_privacy', icon: Shield, label: 'Säkerhet & Integritet' },
        { id: 'themes', icon: Layout, label: 'Tema & Utseende', visible: isModuleActive('GAMIFICATION') },
        { id: 'achievements', icon: Award, label: 'Prestationer', visible: isModuleActive('GAMIFICATION') },
        { id: 'notifications', icon: Bell, label: 'Notiser & Kanaler' },
        { id: 'connections', icon: UserPlus, label: 'Vänner & Relationer' },
        ...(isModuleActive('REVENUE') ? [{ id: 'billing', icon: CreditCard, label: 'Fakturering' }] : []),
    ].filter(item => item.visible !== false);

    return (
        <div className="animate-in fade-in max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-[#E3E3E3] transition-colors">{t('profile.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* --- LEFT SIDEBAR (Navigation & Mini Profile) --- */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Profile Summary Card */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#282a2c] shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Background Preview (Subtle) */}
                        {currentUser?.gamificationProfile?.activeBackground && (
                            <div
                                className="absolute inset-0 z-0 opacity-10"
                                style={{
                                    backgroundImage: `url(${getGamificationAssetPath(currentUser.gamificationProfile.activeBackground, 'BACKGROUND')})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                        )}

                        <div className="relative mb-4 z-10 cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-[#282a2c] bg-gray-50 dark:bg-[#131314] flex items-center justify-center z-10">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profil" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserAvatar user={displayUser} size="w-full h-full" fontSize="text-2xl" />
                                    )}
                                </div>
                                {/* Frame */}
                                {currentUser?.gamificationProfile?.activeFrame && (
                                    <img
                                        src={`${getGamificationAssetPath(currentUser.gamificationProfile.activeFrame, 'FRAME')}?t=${new Date().getTime()}`}
                                        alt="Frame"
                                        className="absolute inset-0 w-full h-full scale-125 z-20 pointer-events-none rounded-full object-cover mix-blend-multiply"
                                    />
                                )}
                                {/* Edit Hover */}
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                    <Camera size={16} className="text-white" />
                                </div>
                            </div>
                            <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>

                        <h2 className="text-lg font-bold text-gray-900 dark:text-white z-10">
                            {displayUser.firstName} {displayUser.lastName}
                            {currentUser?.gamificationProfile?.forumRankIcon && <span className="ml-1">{currentUser.gamificationProfile.forumRankIcon}</span>}
                        </h2>
                        <p className="text-sm text-gray-500 z-10">@{displayUser.username}</p>

                        {currentUser?.gamificationProfile?.currentTitle && (
                            <span className="mt-2 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full z-10">
                                {currentUser.gamificationProfile.currentTitle}
                            </span>
                        )}

                        {/* Streak Indicator (New) */}
                        {isModuleActive('GAMIFICATION') && (
                            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50 rounded-xl z-20 shadow-sm animate-in slide-in-from-bottom-2">
                                <Zap size={14} fill="currentColor" className="animate-pulse" />
                                <span className="text-xs font-black">{streakCount} Dagars Streak</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <nav className="bg-white dark:bg-[#1E1F20] rounded-2xl p-2 border border-gray-200 dark:border-[#282a2c] shadow-sm">
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                </div>

                {/* --- RIGHT CONTENT AREA --- */}
                <div className="lg:col-span-3 bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#282a2c] shadow-sm p-6 sm:p-8 min-h-[600px]">
                    <div className="animate-in slide-in-from-right-4 duration-300">

                        {/* 1. DETAILS TAB */}
                        {activeTab === 'details' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Personuppgifter</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.firstname')}</label><input className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} /></div>
                                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.lastname')}</label><input className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} /></div>
                                    </div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.language')}</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500"
                                            value={formData.language}
                                            onChange={(e) => {
                                                setFormData({ ...formData, language: e.target.value });
                                                i18n.changeLanguage(e.target.value);
                                            }}
                                        >
                                            <option value="sv">Svenska</option>
                                            <option value="en">English</option>
                                            {/* Add other languages */}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Kontaktinformation</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.email')}</label><input className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.phone')}</label><input className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                    </div>
                                    <div className="space-y-3">
                                        <input placeholder={t('profile.street')} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                                        <div className="grid grid-cols-3 gap-3">
                                            <input placeholder={t('profile.zip')} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                                            <input placeholder={t('profile.city')} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                            <input placeholder={t('profile.country')} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Sociala Medier</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { icon: Linkedin, label: 'LinkedIn', key: 'linkedinUrl' },
                                            { icon: Instagram, label: 'Instagram', key: 'instagramUrl' },
                                            { icon: Facebook, label: 'Facebook', key: 'facebookUrl' },
                                            { icon: Twitter, label: 'Twitter / X', key: 'twitterUrl' },
                                        ].map(social => {
                                            const Icon = social.icon;
                                            return (
                                                <div key={social.key}>
                                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 mb-1"><Icon size={14} /> {social.label}</label>
                                                    <input placeholder="https://..." className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-sm" value={formData[social.key]} onChange={e => setFormData({ ...formData, [social.key]: e.target.value })} />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button disabled={isLoading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50 transition-all">
                                        <Save size={18} /> {isLoading ? 'Sparar...' : t('profile.save_changes')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* 2. SECURITY TAB */}
                        {activeTab === 'security_privacy' && (
                            <div className="space-y-12 max-w-2xl">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2"><Lock size={24} className="text-indigo-500" /> Lösenord & Säkerhet</h3>
                                    <form onSubmit={handleChangePassword} className="space-y-6 bg-gray-50 dark:bg-black/20 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex gap-3 text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                            <AlertTriangle size={20} className="shrink-0" />
                                            <p>{t('profile.choose_strong_password')}</p>
                                        </div>
                                        <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('profile.current_password')}</label><input type="password" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} required className="w-full p-2.5 border rounded-lg dark:bg-black dark:border-gray-700" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('profile.new_password')}</label><input type="password" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} required className="w-full p-2.5 border rounded-lg dark:bg-black dark:border-gray-700" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('profile.confirm_password')}</label><input type="password" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} required className="w-full p-2.5 border rounded-lg dark:bg-black dark:border-gray-700" /></div>
                                        <button className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            {t('profile.update_password')}
                                        </button>
                                    </form>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                                    <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2"><Shield size={24} className="text-green-500" /> Integritet & Data</h3>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600">
                                                    <Globe size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">Offentlig Profil</h4>
                                                    <p className="text-sm text-gray-500">Gör din profil synlig för andra användare.</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500"
                                                checked={formData.dashboardSettings?.publicProfile !== false}
                                                onChange={(e) => {
                                                    const newSettings = { ...formData.dashboardSettings, publicProfile: e.target.checked };
                                                    setFormData({ ...formData, dashboardSettings: newSettings });
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600">
                                                    <Download size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">Exportera Data</h4>
                                                    <p className="text-sm text-gray-500">Ladda ner en kopia av din data.</p>
                                                </div>
                                            </div>
                                            <button onClick={() => alert("Funktion kommer snart")} className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                                Exportera
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. THEMES TAB */}
                        {activeTab === 'themes' && (
                            <div className="space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Anpassa din profil</h2>
                                    <p className="text-gray-500">Välj bland dina upplåsta föremål för att skapa en unik stil.</p>
                                </div>

                                {/* PREVIEW CARD (Visible here too for context) */}
                                <div className="bg-white dark:bg-black/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-6 max-w-2xl mx-auto mb-8 relative overflow-hidden">
                                    {currentUser?.gamificationProfile?.activeBackground && (
                                        <div
                                            className="absolute inset-0 opacity-20 pointer-events-none"
                                            style={{
                                                backgroundImage: `url(${getGamificationAssetPath(currentUser.gamificationProfile.activeBackground, 'BACKGROUND')})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                    )}
                                    <div className="relative z-10">
                                        <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-md relative">
                                            <UserAvatar user={currentUser} size="w-full h-full" />
                                            {currentUser?.gamificationProfile?.activeFrame && (
                                                <img
                                                    src={`${getGamificationAssetPath(currentUser.gamificationProfile.activeFrame, 'FRAME')}?t=${new Date().getTime()}`}
                                                    className="absolute inset-0 w-full h-full scale-125 z-20 pointer-events-none object-cover mix-blend-multiply"
                                                    alt="Frame"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                            {currentUser.firstName} {currentUser.lastName}
                                            {currentUser?.gamificationProfile?.currentTitle && (
                                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                                                    {currentUser.gamificationProfile.currentTitle}
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500">@{currentUser.username}</p>
                                    </div>
                                </div>

                                {/* CATEGORY TABS */}
                                <div className="flex justify-center gap-2 mb-8">
                                    {['FRAME', 'BACKGROUND', 'TITLE'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setThemesTab(type)}
                                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${themesTab === type
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {type === 'FRAME' ? 'Ramar' : type === 'BACKGROUND' ? 'Bakgrunder' : 'Titlar'}
                                        </button>
                                    ))}
                                </div>

                                {/* INVENTORY GRID */}
                                {isLoadingInventory ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        <p className="text-gray-500">Laddar din samling...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Reset/Standard Option */}
                                        <div
                                            onClick={() => handleUnequipItem(themesTab)}
                                            className={`bg-white dark:bg-gray-800 p-4 rounded-xl border-2 transition-all cursor-pointer relative group overflow-hidden ${((themesTab === 'FRAME' && !currentUser.gamificationProfile?.activeFrame) ||
                                                (themesTab === 'BACKGROUND' && !currentUser.gamificationProfile?.activeBackground) ||
                                                (themesTab === 'TITLE' && !currentUser.gamificationProfile?.currentTitle))
                                                ? 'border-indigo-500 shadow-indigo-500/20 shadow-lg'
                                                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="h-32 mb-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center relative border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                <X className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-xs font-bold text-gray-500">Standard</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Återställ</h4>
                                                    <p className="text-xs text-gray-500 mt-1">Ingen aktiv {themesTab === 'FRAME' ? 'ram' : themesTab === 'BACKGROUND' ? 'bakgrund' : 'titel'}</p>
                                                </div>
                                                {((themesTab === 'FRAME' && !currentUser.gamificationProfile?.activeFrame) ||
                                                    (themesTab === 'BACKGROUND' && !currentUser.gamificationProfile?.activeBackground) ||
                                                    (themesTab === 'TITLE' && !currentUser.gamificationProfile?.currentTitle)) ? (
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">Aktiv</span>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Välj</span>
                                                )}
                                            </div>
                                        </div>

                                        {inventory
                                            .filter(inv => inv.item.type === themesTab)
                                            .map(inv => {
                                                const isEquipped =
                                                    (themesTab === 'FRAME' && currentUser.gamificationProfile?.activeFrame === inv.item.imageUrl) ||
                                                    (themesTab === 'BACKGROUND' && currentUser.gamificationProfile?.activeBackground === inv.item.imageUrl) ||
                                                    (themesTab === 'TITLE' && currentUser.gamificationProfile?.currentTitle === inv.item.name); // Title typically uses name

                                                return (
                                                    <div
                                                        key={inv.id}
                                                        onClick={() => handleEquipItem(inv.item)}
                                                        className={`bg-white dark:bg-gray-800 p-4 rounded-xl border-2 transition-all cursor-pointer relative group overflow-hidden ${isEquipped
                                                            ? 'border-indigo-500 shadow-indigo-500/20 shadow-lg'
                                                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className={`h-32 mb-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center relative overflow-hidden ${themesTab === 'BACKGROUND' ? '' : 'p-4'
                                                            }`}>
                                                            {themesTab === 'TITLE' ? (
                                                                <span className="font-bold text-lg dark:text-white px-4 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                                                                    {inv.item.name}
                                                                </span>
                                                            ) : (
                                                                <img
                                                                    src={getGamificationAssetPath(inv.item.imageUrl, inv.item.type)}
                                                                    alt={inv.item.name}
                                                                    className={`object-contain ${themesTab === 'BACKGROUND' ? 'w-full h-full object-cover' : 'w-24 h-24'
                                                                        }`}
                                                                />
                                                            )}

                                                            {isEquipped && (
                                                                <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg z-10">
                                                                    <Check size={12} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{inv.item.name}</h4>
                                                                <p className="text-xs text-gray-500 mt-1">{inv.item.rarity || 'COMMON'}</p>
                                                            </div>
                                                            {isEquipped ? (
                                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">Aktiv</span>
                                                            ) : (
                                                                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Välj</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        {/* EMPTY STATE */}
                                        {inventory.filter(inv => inv.item.type === themesTab).length === 0 && (
                                            <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                                <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <Layout className="text-gray-400" />
                                                </div>
                                                <p className="font-bold text-gray-600 dark:text-gray-400">Du har inga {themesTab === 'FRAME' ? 'ramar' : themesTab === 'BACKGROUND' ? 'bakgrunder' : 'titlar'} än.</p>
                                                <Link to="/shop" className="text-indigo-600 font-bold hover:underline text-sm mt-2 inline-block">Besök Butiken</Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 max-w-4xl">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2"><Bell size={24} className="text-indigo-500" /> Mina Notiser</h3>
                                    <p className="text-sm text-gray-500 mb-8 -mt-4">Välj exakt vilka kanaler du vill använda för olika typer av händelser.</p>

                                    {/* Preference Matrix */}
                                    <div className="overflow-hidden bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 dark:bg-[#131314]">
                                                <tr>
                                                    <th className="p-4 font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#3c4043]">Kategori</th>
                                                    <th className="p-4 text-center font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#3c4043]"><Mail size={18} className="mx-auto mb-1 text-blue-500" /> E-post</th>
                                                    <th className="p-4 text-center font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#3c4043]"><Smartphone size={18} className="mx-auto mb-1 text-green-500" /> SMS</th>
                                                    <th className="p-4 text-center font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#3c4043]"><Globe size={18} className="mx-auto mb-1 text-indigo-500" /> Push</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {[
                                                    { id: 'CHAT', label: 'Chatt-meddelanden', icon: MessageSquare },
                                                    { id: 'MESSAGE', label: 'Interna meddelanden', icon: Mail },
                                                    { id: 'CALENDAR', label: 'Kalenderpåminnelser', icon: Calendar },
                                                    { id: 'FEEDBACK', label: 'Lärarfeedback', icon: Award }
                                                ].map(cat => (
                                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <cat.icon size={18} className="text-gray-400" />
                                                                <span className="font-medium text-gray-700 dark:text-gray-300">{cat.label}</span>
                                                            </div>
                                                        </td>
                                                        {['MAIL', 'SMS', 'PUSH'].map(channel => {
                                                            const pref = preferences.find(p => p.category === cat.id && p.channel === channel);
                                                            const isEnabled = pref ? pref.enabled : true;
                                                            return (
                                                                <td key={channel} className="p-4 text-center">
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="sr-only peer"
                                                                            checked={isEnabled}
                                                                            onChange={(e) => handlePrefToggle(cat.id, channel, e.target.checked)}
                                                                        />
                                                                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                                                    </label>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                        <div className="flex gap-3">
                                            <Globe className="text-indigo-600 shrink-0" size={20} />
                                            <div>
                                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Push-notiser (PWA)</h4>
                                                <p className="text-xs text-indigo-700/70 dark:text-indigo-300/60 mt-1">För att ta emot push-notiser måste du först prenumerera på den här enheten.</p>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const permission = await Notification.requestPermission();
                                                            if (permission === 'granted') {
                                                                showMessage("Push-notiser aktiverade på denna enhet!");
                                                            } else {
                                                                alert("Du nekade behörighet för notiser.");
                                                            }
                                                        } catch (e) { console.error(e); }
                                                    }}
                                                    className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                >
                                                    Aktivera på denna enhet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. CONNECTIONS TAB */}
                        {activeTab === 'connections' && (
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><UserPlus size={20} className="text-indigo-500" /> Vänförfrågningar</h3>
                                    <ConnectionRequestsComponent currentUser={currentUser} showMessage={showMessage} />
                                </section>
                                <hr className="border-gray-100 dark:border-gray-800" />
                                <section>
                                    <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><User size={20} className="text-green-500" /> Hantera Vänner</h3>
                                    <ConnectionManagerComponent currentUser={currentUser} showMessage={showMessage} />
                                </section>
                            </div>
                        )}

                        {/* 5. ACHIEVEMENTS TAB */}
                        {activeTab === 'achievements' && (
                            <AchievementsGallery currentUser={currentUser} />
                        )}

                        {/* 6. BILLING TAB */}
                        {activeTab === 'billing' && (
                            <UserBilling userId={currentUser?.id} />
                        )}

                    </div>
                </div>
            </div>

            {cropDialogOpen && cropImageSrc && (
                <ImageCropDialog
                    imageSrc={cropImageSrc}
                    onComplete={handleCroppedImage}
                    onCancel={() => {
                        setCropDialogOpen(false);
                        setCropImageSrc(null);
                    }}
                />
            )}
        </div>
    );
};

export default UserProfile;
