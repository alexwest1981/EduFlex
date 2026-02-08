import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGamificationAssetPath } from '../../utils/gamificationUtils';
import { api, getSafeUrl } from '../../services/api';
import { User, Mail, Phone, MapPin, Globe, Loader, Lock, Check, UserPlus, Clock, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PublicProfile = ({ currentUser, showMessage }) => {
    const { userId } = useParams();
    const { t } = useTranslation();
    const [profileUser, setProfileUser] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('NONE'); // NONE, PENDING, ACCEPTED, REJECTED
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setImgError(false);
            try {
                const [userData, statusData] = await Promise.all([
                    api.users.getById(userId),
                    api.connections.getStatus(userId)
                ]);
                setProfileUser(userData);
                setConnectionStatus(statusData.status);
            } catch (e) {
                console.error("Failed to load profile", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleConnect = async () => {
        try {
            await api.connections.request(userId);
            setConnectionStatus('PENDING');
            showMessage("Förfrågan skickad!");
        } catch (e) {
            console.error(e);
            showMessage("Misslyckades att skicka förfrågan");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;
    if (!profileUser) return <div className="p-20 text-center">Användaren hittades inte.</div>;

    const isConnected = connectionStatus === 'ACCEPTED';
    const isPending = connectionStatus === 'PENDING';

    return (
        <div className="animate-in fade-in max-w-4xl mx-auto pb-20 pt-10">
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                {/* Header / Banner area could go here */}
                <div
                    className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[#282a2c] dark:to-[#3c4043] relative overflow-hidden"
                    style={{
                        backgroundImage: profileUser.gamificationProfile?.activeBackground ? `url(${getGamificationAssetPath(profileUser.gamificationProfile.activeBackground, 'BACKGROUND')})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Dark overlay if background exists */}
                    {profileUser.gamificationProfile?.activeBackground && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative w-32 h-32 flex items-center justify-center -mt-6">
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#1E1F20] shadow-md bg-gray-50 dark:bg-[#131314] flex items-center justify-center z-10">
                                {profileUser.profilePictureUrl && !imgError ? (
                                    <img
                                        src={(() => {
                                            let url = profileUser.profilePictureUrl;
                                            if (url.includes('minio:9000')) url = url.replace('minio:9000', 'localhost:9000');
                                            if (url.startsWith('http')) return url;
                                            if (!url.startsWith('/')) {
                                                if (!url.includes('/')) url = '/uploads/' + url;
                                                else url = '/' + url;
                                            }
                                            return `${window.location.origin}${url}`;
                                        })()}
                                        onError={() => setImgError(true)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">{profileUser.firstName?.[0]}</span>
                                )}
                            </div>

                            {/* Frame Overlay with Ring Mask */}
                            {profileUser.gamificationProfile?.activeFrame && (
                                <img
                                    src={getGamificationAssetPath(profileUser.gamificationProfile.activeFrame, 'FRAME')}
                                    alt="Frame"
                                    className="absolute inset-0 w-32 h-32 z-20 pointer-events-none rounded-full object-cover"
                                    style={{
                                        mixBlendMode: profileUser.gamificationProfile.activeFrame.includes('circular') ? 'multiply' : 'screen',
                                        maskImage: 'radial-gradient(circle, transparent 72%, black 76%, black 92%, transparent 96%)',
                                        WebkitMaskImage: 'radial-gradient(circle, transparent 72%, black 76%, black 92%, transparent 96%)',
                                        filter: 'contrast(110%) brightness(1.1)'
                                    }}
                                />
                            )}
                        </div>

                        <div>
                            {isConnected ? (
                                <button disabled className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 cursor-default">
                                    <Check size={18} /> Ansluten
                                </button>
                            ) : isPending ? (
                                <button disabled className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2 cursor-default">
                                    <Clock size={18} /> Förfrågan skickad
                                </button>
                            ) : (
                                <button onClick={handleConnect} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                                    <UserPlus size={18} /> Anslut
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {profileUser.firstName} {profileUser.lastName}
                                {profileUser.gamificationProfile?.forumRankIcon && (
                                    <span title="Forum Rank">{profileUser.gamificationProfile.forumRankIcon}</span>
                                )}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">@{profileUser.username} • {profileUser.role?.name}</p>
                        </div>

                        {isConnected ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white uppercase text-sm tracking-wider">Kontaktuppgifter</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-[#282a2c] rounded-lg">
                                            <Mail size={18} className="text-gray-400" /> {profileUser.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-[#282a2c] rounded-lg">
                                            <Phone size={18} className="text-gray-400" /> {profileUser.phone || "Ej angivet"}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-[#282a2c] rounded-lg">
                                            <MapPin size={18} className="text-gray-400" /> {profileUser.city || "Ej angivet"}, {profileUser.country}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white uppercase text-sm tracking-wider">Sociala Medier</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {profileUser.linkedinUrl ? (
                                            <a href={profileUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                                <Linkedin size={20} /> LinkedIn
                                            </a>
                                        ) : <div className="p-3 border border-dashed border-gray-300 rounded-lg text-gray-400 flex items-center gap-2"><Linkedin size={20} /> Ej länkat</div>}

                                        {profileUser.instagramUrl ? (
                                            <a href={profileUser.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors">
                                                <Instagram size={20} /> Instagram
                                            </a>
                                        ) : <div className="p-3 border border-dashed border-gray-300 rounded-lg text-gray-400 flex items-center gap-2"><Instagram size={20} /> Ej länkat</div>}

                                        {profileUser.facebookUrl ? (
                                            <a href={profileUser.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors">
                                                <Facebook size={20} /> Facebook
                                            </a>
                                        ) : <div className="p-3 border border-dashed border-gray-300 rounded-lg text-gray-400 flex items-center gap-2"><Facebook size={20} /> Ej länkat</div>}

                                        {profileUser.twitterUrl ? (
                                            <a href={profileUser.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                                                <Twitter size={20} /> Twitter
                                            </a>
                                        ) : <div className="p-3 border border-dashed border-gray-300 rounded-lg text-gray-400 flex items-center gap-2"><Twitter size={20} /> Ej länkat</div>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-[#282a2c] rounded-xl p-8 text-center border border-gray-100 dark:border-[#3c4043]">
                                <Lock size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Denna profil är privat</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">Du måste vara ansluten till denna användare för att se deras kontaktuppgifter och sociala medier.</p>
                                <button onClick={handleConnect} disabled={isPending} className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
                                    {isPending ? 'Förfrågan skickad' : 'Skicka förfrågan'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
