import React, { useState, useEffect } from 'react';
import {
    X, User, Globe, Linkedin, Twitter, Download,
    Star, BookOpen, Calendar, ShieldCheck,
    ChevronRight, Award, ExternalLink, Loader2
} from 'lucide-react';
import { api } from '../../../services/api';

const AuthorProfile = ({ userId, onClose, onSelectItem }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            loadProfile();
        }
    }, [userId]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await api.community.getAuthorProfile(userId);
            setProfile(data);
        } catch (err) {
            console.error('Failed to load author profile:', err);
            setError('Kunde inte ladda profilen.');
        } finally {
            setLoading(false);
        }
    };

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header/Banner Area */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-700">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Profile Picture Overlap */}
                    <div className="absolute -bottom-16 left-8 p-1 bg-white dark:bg-[#1E1F20] rounded-3xl shadow-xl">
                        {profile?.profilePictureUrl ? (
                            <img
                                src={profile.profilePictureUrl}
                                alt={profile.name}
                                className="w-32 h-32 rounded-2xl object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-[#282a2c] flex items-center justify-center text-gray-400">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pt-20 px-8 pb-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                            <p>Hämtar lärarprofil...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500 font-medium">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Info & Stats */}
                            <div className="lg:col-span-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {profile.name}
                                        {profile.totalResources > 10 && (
                                            <Award alt="EduFlex Champion" className="text-amber-500" size={20} />
                                        )}
                                    </h2>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                        <ShieldCheck size={16} />
                                        {profile.tenantName} Teacher
                                    </p>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {profile.bio || 'Ingen biografi tillgänglig.'}
                                </p>

                                {/* Social Links */}
                                <div className="flex items-center gap-3">
                                    {profile.linkedinUrl && (
                                        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:scale-110 transition-transform">
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                    {profile.twitterUrl && (
                                        <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="p-2 bg-sky-50 dark:bg-sky-900/20 text-sky-500 rounded-lg hover:scale-110 transition-transform">
                                            <Twitter size={18} />
                                        </a>
                                    )}
                                    <button className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-lg hover:scale-110 transition-transform">
                                        <Globe size={18} />
                                    </button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl">
                                        <div className="text-indigo-600 dark:text-indigo-400 mb-1">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            {profile.totalResources}
                                        </div>
                                        <div className="text-xs text-gray-500">Resurser</div>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl">
                                        <div className="text-purple-600 dark:text-purple-400 mb-1">
                                            <Download size={20} />
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            {profile.totalDownloads}
                                        </div>
                                        <div className="text-xs text-gray-500">Nedladdningar</div>
                                    </div>
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl">
                                        <div className="text-amber-500 mb-1">
                                            <Star size={20} />
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            {profile.averageRating.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-500">Snittbetyg</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                        <div className="text-gray-500 mb-1">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {new Date(profile.memberSince).getFullYear()}
                                        </div>
                                        <div className="text-xs text-gray-500">Gick med</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Resources */}
                            <div className="lg:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    Senaste Bidrag
                                </h3>
                                <div className="space-y-3">
                                    {profile.recentResources?.length > 0 ? (
                                        profile.recentResources.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => onSelectItem(item)}
                                                className="w-full flex items-center gap-4 p-4 bg-white dark:bg-[#282a2c] border border-gray-100 dark:border-transparent rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all group text-left"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1E1F20] flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                                                    <BookOpen size={24} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md font-medium uppercase">
                                                            {item.contentType}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Star size={12} className="text-amber-400" />
                                                            {item.averageRating.toFixed(1)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Download size={12} />
                                                            {item.downloadCount}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center text-gray-400 italic">
                                            Inga publicerade resurser än.
                                        </div>
                                    )}
                                </div>

                                {profile.totalResources > 5 && (
                                    <button className="w-full mt-4 py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors flex items-center justify-center gap-2">
                                        Visa alla resurser
                                        <ExternalLink size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthorProfile;
