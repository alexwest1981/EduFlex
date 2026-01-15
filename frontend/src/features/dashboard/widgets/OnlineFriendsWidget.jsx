import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import UserAvatar from '../../../components/common/UserAvatar';

const OnlineFriendsWidget = () => {
    const { t } = useTranslation();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOnlineFriends = async () => {
            try {
                // Get all contacts
                const data = await api.messages.getContacts();
                const allFriends = data.friends || [];

                // Filter by lastLogin (Active in last 15 minutes)
                const now = new Date();
                const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

                const online = allFriends.filter(f => {
                    if (!f.lastLogin) return false;
                    const loginTime = new Date(f.lastLogin);
                    return loginTime > fifteenMinutesAgo;
                });

                setFriends(online);
            } catch (e) {
                console.error("Failed to load online friends", e);
            } finally {
                setLoading(false);
            }
        };

        fetchOnlineFriends();
        // Poll every minute
        const interval = setInterval(fetchOnlineFriends, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    Online Vänner
                </h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {friends.length} online
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {friends.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 text-sm italic">
                        Inga vänner online just nu.
                    </div>
                ) : (
                    friends.map(friend => (
                        <Link key={friend.id} to={`/profile/${friend.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#282a2c] rounded-xl transition-colors group">
                            <div className="relative">
                                <UserAvatar user={friend} size="w-10 h-10" fontSize="text-sm" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1E1F20] rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{friend.fullName}</h4>
                                <p className="text-xs text-gray-500 truncate">{friend.role}</p>
                            </div>
                            <div className="text-[10px] text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                Profil
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <div className="pt-4 mt-auto border-t border-gray-100 dark:border-[#3c4043]">
                <Link to="/profile" className="text-xs text-indigo-600 hover:underline font-bold block text-center">
                    Visa alla vänner
                </Link>
            </div>
        </div>
    );
};

export default OnlineFriendsWidget;
