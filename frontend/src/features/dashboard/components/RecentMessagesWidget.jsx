import React, { useEffect, useState } from 'react';
import { Mail, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';

const RecentMessagesWidget = ({ onViewAll }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await api.messages.getInbox();
            // Ta de 10 senaste
            const recent = Array.isArray(data) ? data.slice(0, 10) : [];
            setMessages(recent);
        } catch (e) {
            console.error("Failed to load recent messages", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="text-indigo-600" size={20} /> {t('widgets.recent_messages.title')}
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                >
                    {t('widgets.recent_messages.view_all')} <ArrowRight size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">{t('messages.loading')}</div>
                ) : messages.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic">{t('widgets.recent_messages.empty')}</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={onViewAll}
                                className={`p-3 rounded-xl cursor-pointer transition-colors border border-transparent ${!msg.isRead
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800'
                                    : 'hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm ${!msg.isRead ? 'font-black text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                        {msg.senderName}
                                    </span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Clock size={10} /> {new Date(msg.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${!msg.isRead ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                                    {msg.subject}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentMessagesWidget;
