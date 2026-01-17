import React, { useState, useEffect } from 'react';
import { MessageCircle, User, X } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const OnlineFriendsPanel = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOnlineFriends();
            const interval = setInterval(fetchOnlineFriends, 30000); // Update every 30s
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const fetchOnlineFriends = async () => {
        setIsLoading(true);
        try {
            const users = await api.users.getRelated();

            // Filter by online status (lastActive within 5 mins)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            const onlineUsers = users.filter(user => {
                if (!user.lastActive) return false;
                let lastActiveDate;
                if (Array.isArray(user.lastActive)) {
                    lastActiveDate = new Date(
                        user.lastActive[0],
                        user.lastActive[1] - 1,
                        user.lastActive[2],
                        user.lastActive[3],
                        user.lastActive[4],
                        user.lastActive[5] || 0
                    );
                } else {
                    lastActiveDate = new Date(user.lastActive);
                }
                return lastActiveDate > fiveMinutesAgo;
            }).map(user => ({
                id: user.id,
                name: user.fullName || `${user.firstName} ${user.lastName}`,
                status: 'online',
                avatar: user.profilePictureUrl
            }));

            setFriends(onlineUsers);
        } catch (error) {
            console.error("Failed to fetch friends", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-20 w-80 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border border-gray-100 dark:border-[#3c4043] z-50 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#282a2c]">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User size={18} className="text-indigo-500" />
                    Online Vänner
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        {friends.length}
                    </span>
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={18} />
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                {isLoading && friends.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">Laddar...</div>
                ) : friends.length > 0 ? (
                    <div className="space-y-1">
                        {friends.map((friend) => (
                            <div key={friend.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold overflow-hidden">
                                            {friend.avatar ? (
                                                <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                            ) : (
                                                friend.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1E1F20] bg-green-500"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{friend.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">Online</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/messages', { state: { recipientId: friend.id } })}
                                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Skicka meddelande"
                                >
                                    <MessageCircle size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Inga vänner online just nu.
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#282a2c]">
                <button className="w-full py-2 text-xs font-bold text-center text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Visa alla vänner
                </button>
            </div>
        </div>
    );
};

export default OnlineFriendsPanel;
