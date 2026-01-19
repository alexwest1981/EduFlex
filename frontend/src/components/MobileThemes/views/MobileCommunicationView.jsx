import React, { useState, useEffect } from 'react';
import { Search, PenSquare, Send, X, MessageSquare, ChevronLeft, User, Check, MoreVertical } from 'lucide-react';
import { api } from '../../../services/api';
import MobileAvatar from './MobileAvatar';

const MobileCommunicationView = ({ currentUser, themeMode = 'dark' }) => {
    // MODES: 'list', 'chat', 'new'
    const [mode, setMode] = useState('list');
    const [activeConversation, setActiveConversation] = useState(null); // The user we are chatting with

    // Theme Styles
    const isLight = themeMode === 'light';
    const theme = {
        bg: isLight ? 'bg-white' : 'bg-[#0F0F11]',
        cardBg: isLight ? 'bg-white border border-gray-100 shadow-sm' : 'bg-[#1C1C1E]',
        text: isLight ? 'text-gray-900' : 'text-white',
        textMuted: isLight ? 'text-gray-500' : 'text-white/60',
        inputBg: isLight ? 'bg-gray-50 border border-gray-200' : 'bg-white/10',
        bubbleOut: isLight ? 'bg-indigo-600 text-white' : 'bg-[#FF6D5A] text-white',
        bubbleIn: isLight ? 'bg-gray-100 text-gray-900' : 'bg-[#2C2C2E] text-white'
    };

    // DATA
    const [conversations, setConversations] = useState({}); // { [userId]: { user: UserObj, messages: [] } }
    const [loading, setLoading] = useState(true);

    // COMPOSE / REPLY STATE
    const [replyText, setReplyText] = useState('');

    // NEW MSG STATE
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const [inbox, sent] = await Promise.all([
                api.messages.getInbox(),
                api.messages.getSent()
            ]);

            // Normalizing helpers
            const safeInbox = Array.isArray(inbox) ? inbox : [];
            const safeSent = Array.isArray(sent) ? sent : [];

            const convoMap = {};

            // Process Inbox (Messages from others)
            safeInbox.forEach(msg => {
                const partnerId = msg.sender?.id || msg.senderId;
                if (!partnerId) return;

                if (!convoMap[partnerId]) {
                    convoMap[partnerId] = {
                        user: msg.sender || { id: partnerId, name: msg.senderName || 'Okänd' },
                        messages: []
                    };
                }
                // Add direction flag
                convoMap[partnerId].messages.push({ ...msg, direction: 'in' });
            });

            // Process Sent (Messages to others)
            safeSent.forEach(msg => {
                const partnerId = msg.recipient?.id || msg.recipientId;
                if (!partnerId) return;

                if (!convoMap[partnerId]) {
                    convoMap[partnerId] = {
                        user: msg.recipient || { id: partnerId, name: msg.recipientName || 'Okänd' },
                        messages: []
                    };
                }
                // Add direction flag
                convoMap[partnerId].messages.push({ ...msg, direction: 'out' });
            });

            // Sort messages within conversations
            Object.values(convoMap).forEach(convo => {
                convo.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                convo.lastMessage = convo.messages[convo.messages.length - 1];
            });

            setConversations(convoMap);
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoading(false);
        }
    };

    const openConversation = (convo) => {
        setActiveConversation(convo);
        setMode('chat');
        // TODO: Mark as read
    };

    const handleSend = async () => {
        const recipient = mode === 'chat' ? activeConversation.user : selectedRecipient;
        const text = mode === 'chat' ? replyText : replyText; // Same state used for simplification? No, let's keep it simple.

        if (!recipient || !text) return;

        try {
            // Optimistic Update
            const tempMsg = {
                id: Date.now(),
                content: text,
                subject: 'Snabbsvar',
                direction: 'out',
                createdAt: new Date().toISOString(),
                sender: currentUser
            };

            if (mode === 'chat') {
                // Add to current conversation instantly
                const updatedConvo = { ...activeConversation };
                updatedConvo.messages.push(tempMsg);
                setActiveConversation(updatedConvo);
                setReplyText('');
            }

            await api.messages.send({
                recipientId: recipient.id,
                subject: 'Meddelande', // SMS style usually ignores subject
                content: text
            });

            // Reload to sync ID and real state
            loadMessages();

            if (mode === 'new') {
                setMode('list');
                setSelectedRecipient(null);
                setReplyText('');
            }
        } catch (error) {
            console.error(error);
            alert('Kunde inte skicka.');
        }
    };

    const handleSearchUsers = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await api.users.search(query);
            setSearchResults(results.content || results || []);
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    // Sort conversations by latest message
    const sortedConversations = Object.values(conversations).sort((a, b) => {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    return (
        <div className={`${theme.bg} h-full flex flex-col pt-14 pb-24 relative`}>

            {/* HEADER */}
            <div className="px-6 flex justify-between items-center mb-4">
                {mode === 'list' && (
                    <>
                        <h2 className={`text-3xl font-bold ${theme.text}`}>Meddelanden</h2>
                        <button onClick={() => setMode('new')} className="bg-[#FF6D5A] p-3 rounded-full text-white shadow-lg active:scale-95">
                            <PenSquare size={24} />
                        </button>
                    </>
                )}

                {(mode === 'chat' || mode === 'new') && (
                    <>
                        <button onClick={() => setMode('list')} className="p-2 bg-white/10 rounded-full text-white">
                            <ChevronLeft size={24} />
                        </button>

                        {mode === 'chat' && (
                            <div className="flex flex-col items-center">
                                <span className="font-bold">{activeConversation?.user?.fullName || activeConversation?.user?.name}</span>
                                <span className="text-[10px] text-white/50">{activeConversation?.user?.role || 'Användare'}</span>
                            </div>
                        )}
                        {mode === 'new' && <span className="font-bold">Nytt meddelande</span>}

                        <button className="p-2 opacity-0"><MoreVertical size={24} /></button>
                    </>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">

                {/* LIST MODE */}
                {mode === 'list' && (
                    <div className="space-y-2">
                        {loading && <p className="text-center opacity-50 mt-10">Laddar konversationer...</p>}
                        {!loading && sortedConversations.length === 0 && (
                            <div className="text-center py-10 opacity-50 flex flex-col items-center">
                                <MessageSquare size={48} className="mb-4 text-white/20" />
                                <p>Inga meddelanden än.</p>
                            </div>
                        )}
                        {sortedConversations.map((convo, i) => (
                            <div key={i} onClick={() => openConversation(convo)} className={`p-4 rounded-2xl ${theme.cardBg} active:scale-95 transition-transform flex gap-4 cursor-pointer`}>
                                <MobileAvatar user={convo.user} className="w-12 h-12 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-bold truncate ${theme.text}`}>{convo.user.fullName || convo.user.name}</h3>
                                        <span className="text-[10px] text-white/40 whitespace-nowrap ml-2">
                                            {new Date(convo.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${convo.lastMessage.direction === 'in' && !convo.lastMessage.read ? 'text-white font-bold' : 'text-white/60'}`}>
                                        {convo.lastMessage.direction === 'out' && <span className="text-[#FF6D5A] mr-1">Du:</span>}
                                        {convo.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CHAT MODE */}
                {mode === 'chat' && activeConversation && (
                    <div className="space-y-4">
                        {activeConversation.messages.map((msg, i) => {
                            const isMe = msg.direction === 'out';
                            return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                        ? `${theme.bubbleOut} rounded-br-none`
                                        : `${theme.bubbleIn} rounded-bl-none`
                                        }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-white/40'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && <Check size={12} className="inline ml-1 opacity-70" />}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Spacing for bottom input */}
                        <div className="h-16"></div>
                    </div>
                )}

                {/* NEW MESSAGE MODE */}
                {mode === 'new' && (
                    <div className={`${theme.cardBg} p-6 rounded-[32px] space-y-6`}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Till</label>
                            {selectedRecipient ? (
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <MobileAvatar user={selectedRecipient} className="w-8 h-8 rounded-full" />
                                        <span className="font-bold text-white">{selectedRecipient.fullName || selectedRecipient.name}</span>
                                    </div>
                                    <button onClick={() => setSelectedRecipient(null)}><X size={18} className="text-white opacity-50" /></button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchUsers(e.target.value)}
                                        placeholder="Sök mottagare..."
                                        className="w-full bg-white/10 text-white placeholder:text-gray-500 p-3 pl-10 rounded-xl outline-none focus:ring-1 focus:ring-[#FF6D5A]"
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2E] rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto border border-white/10">
                                            {searchResults.map(u => (
                                                <button key={u.id} onClick={() => { setSelectedRecipient(u); setSearchResults([]); setSearchQuery(''); }} className="w-full text-left p-3 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0 border-white/10">
                                                    <MobileAvatar user={u} className="w-8 h-8 rounded-full" />
                                                    <span className="text-sm font-bold text-white">{u.fullName || u.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT BAR (Chat & New) */}
            {(mode === 'chat' || mode === 'new') && (
                <div className="fixed bottom-24 left-4 right-4 z-50">
                    <div className="bg-[#1C1C1E]/90 backdrop-blur-md p-2 rounded-[28px] border border-white/10 flex items-end gap-2 shadow-2xl">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Skriv ett meddelande..."
                            className="flex-1 bg-transparent text-white p-4 max-h-32 min-h-[56px] resize-none outline-none placeholder:text-gray-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!replyText.trim() || (mode === 'new' && !selectedRecipient)}
                            className="bg-[#FF6D5A] w-12 h-12 rounded-full flex items-center justify-center text-white mb-1 shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            <Send size={20} className={replyText.trim() ? "ml-1" : ""} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileCommunicationView;
