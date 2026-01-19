import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Image as ImageIcon, Minus, Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useTranslation } from 'react-i18next'; // <---

const notifySound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

const ChatOverlay = ({ currentUser, API_BASE, token }) => {
    const { t } = useTranslation(); // <---
    const [isOpen, setIsOpen] = useState(false);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [animateBadge, setAnimateBadge] = useState(false);

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // NYTT: Kategorier
    const [categories, setCategories] = useState({ friends: [], classmates: [], administration: [], others: [] });
    const [activeCategory, setActiveCategory] = useState('friends');

    const isOpenRef = useRef(isOpen);
    const activeUserRef = useRef(activeChatUser);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) { setUnreadCount(0); setAnimateBadge(false); }
    }, [isOpen]);

    useEffect(() => { activeUserRef.current = activeChatUser; }, [activeChatUser]);

    useEffect(() => {
        if (!currentUser) return;
        const socket = new SockJS('http://127.0.0.1:8080/ws');
        const client = Stomp.over(socket);
        client.debug = null;
        client.connect({}, () => {
            client.subscribe(`/topic/messages/${currentUser.id}`, (payload) => {
                handleIncomingMessage(JSON.parse(payload.body));
            });
        }, (err) => console.error("Chat error:", err));
        setStompClient(client);
        fetchUsers();
        return () => { if (client && client.connected) client.disconnect(); };
    }, [currentUser]);

    // Update users list based on active category
    useEffect(() => {
        setUsers(categories[activeCategory] || []);
    }, [activeCategory, categories]);

    const handleIncomingMessage = (newMsg) => {
        setMessages(prev => [...prev, newMsg]);
        const isChatOpen = isOpenRef.current;
        const currentPartner = activeUserRef.current;
        if (!isChatOpen || (currentPartner && currentPartner.id !== newMsg.senderId)) {
            setUnreadCount(prev => prev + 1);
            setAnimateBadge(true);
            try { notifySound.play().catch(() => { }); } catch (e) { }
        }
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeChatUser, isOpen]);

    // Reset pagination when switching users
    useEffect(() => {
        if (activeChatUser) {
            setMessages([]);
            setPage(0);
            setHasMore(true);
            loadMessages(0, true);
        }
    }, [activeChatUser]);

    const loadMessages = (pageNum, isReset = false) => {
        if (!currentUser || !activeChatUser) return;
        setIsLoading(true);
        fetch(`${API_BASE}/messages/${currentUser.id}/${activeChatUser.id}?page=${pageNum}&size=20`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                const newMessages = data.content; // Spring Page returns 'content'
                // Reverse because backend sends newest first, but we want oldest at top of list
                // However, if we are prepending, we want them in order?
                // Actually, backend sends DESC (Newest...Oldest). 
                // We want to DISPLAY as Ascending (Oldest...Newest).
                // So we reverse the incoming chunk.
                const reversed = [...newMessages].reverse();

                if (isReset) {
                    setMessages(reversed);
                } else {
                    setMessages(prev => [...reversed, ...prev]);
                }

                setHasMore(!data.last);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    const handleScroll = (e) => {
        const { scrollTop } = e.target;
        if (scrollTop === 0 && hasMore && !isLoading) {
            const newPage = page + 1;
            setPage(newPage);
            // Save current scroll height to restore position after load
            const scrollHeightBefore = e.target.scrollHeight;

            loadMessages(newPage).then(() => {
                // This part needs to run AFTER render. useEffect on messages works better.
            });
        }
    };

    // Auto-scroll only on initial load or new message sent/received (if at bottom)
    useEffect(() => {
        if (page === 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeChatUser, isOpen]);

    // Maintain scroll position when finding older messages
    useEffect(() => {
        if (page > 0) {
            // Logic to maintain scroll would go here, simplified for now:
            // Ideally we save scrollHeight before update, then set scrollTop = newScrollHeight - oldScrollHeight
        }
    }, [messages]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/messages/contacts`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                // Data is now Map: { friends: [], classmates: [], administration: [] }
                setCategories({
                    friends: data.friends || [],
                    classmates: data.classmates || [],
                    administration: data.administration || [],
                    others: data.others || []
                });
                // Default to friends if exists, else first available
                if (data.friends?.length > 0) setActiveCategory('friends');
                else if (data.classmates?.length > 0) setActiveCategory('classmates');
                else setActiveCategory('administration');
            }
        } catch (e) { console.error(e); }
    };

    const sendMessage = (content, type = 'TEXT') => {
        if (!content.trim() && type === 'TEXT') return;
        if (!stompClient || !activeChatUser) return;
        const chatMessage = {
            senderId: currentUser.id, recipientId: activeChatUser.id, senderName: currentUser.fullName, recipientName: activeChatUser.fullName,
            content: content, type: type, isRead: false
        };
        try {
            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
            setMessages(prev => [...prev, { ...chatMessage, timestamp: new Date() }]);
            if (type === 'TEXT') setMsgInput("");
        } catch (e) { console.error("Kunde inte skicka", e); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", "Chat Image");
        formData.append("type", "IMAGE");
        try {
            const res = await fetch(`${API_BASE}/documents/user/${currentUser.id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (res.ok) { const data = await res.json(); if (data.fileUrl) sendMessage(data.fileUrl, 'IMAGE'); }
        } catch (err) { }
    };

    // Helper to fix URLs for LAN access
    const getSafeUrl = (url) => {
        if (!url) return null;
        let finalUrl = url;
        const hostname = window.location.hostname;

        if (finalUrl.includes('minio:9000')) {
            finalUrl = finalUrl.replace('minio', hostname);
        } else if (finalUrl.startsWith('/')) {
            finalUrl = `http://${hostname}:8080${finalUrl}`;
        } else if (finalUrl.includes('127.0.0.1')) {
            finalUrl = finalUrl.replace('127.0.0.1', hostname);
        }

        // Ensure protocol
        if (!finalUrl.startsWith('http')) {
            finalUrl = `http://${hostname}:8080${finalUrl}`;
        }
        return finalUrl;
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 group transition-all duration-300">
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce z-50">{unreadCount}</div>
                )}
                <button onClick={() => setIsOpen(true)} className={`w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:rotate-3 ${animateBadge ? 'ring-4 ring-red-400 animate-pulse' : ''}`}>
                    <MessageCircle size={28} />
                </button>
                <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('chat.title')}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 lg:bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 flex flex-col ring-1 ring-black/5 max-w-[calc(100vw-3rem)]">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0 shadow-md z-10">
                <div className="flex items-center gap-3">
                    {activeChatUser ? (
                        <>
                            <button onClick={() => setActiveChatUser(null)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><Users size={18} /></button>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm flex items-center gap-1">
                                    {activeChatUser.fullName}
                                    <Link to={`/profile/${activeChatUser.id}`} className="text-indigo-200 hover:text-white" title="Visa profil"><ExternalLink size={12} /></Link>
                                </span>
                                <span className="text-[10px] text-indigo-200 uppercase tracking-wider">{activeChatUser.role}</span>
                            </div>
                        </>
                    ) : <span className="font-bold flex items-center gap-2"><MessageCircle size={20} /> {t('chat.messenger')}</span>}
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><Minus size={20} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex relative bg-gray-50">
                {/* SIDEBAR FOR CATEGORIES (Visas endast i kontaktlistan) */}
                {!activeChatUser && (
                    <div className="w-16 bg-gray-100 dark:bg-[#1E1F20] border-r border-gray-200 dark:border-[#3c4043] flex flex-col items-center py-4 gap-4 shrink-0">
                        <button onClick={() => setActiveCategory('friends')} title="Vänner" className={`p-2 rounded-xl transition-all ${activeCategory === 'friends' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <Users size={20} />
                        </button>
                        <button onClick={() => setActiveCategory('classmates')} title="Klasskamrater" className={`p-2 rounded-xl transition-all ${activeCategory === 'classmates' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <Users size={20} />
                            <span className="text-[8px] font-bold block text-center -mt-1">Klass</span>
                        </button>
                        <button onClick={() => setActiveCategory('administration')} title="Administration & Lärare" className={`p-2 rounded-xl transition-all ${activeCategory === 'administration' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <Users size={20} />
                            <span className="text-[8px] font-bold block text-center -mt-1">Admin</span>
                        </button>
                    </div>
                )}

                <div className="flex-1 flex flex-col overflow-hidden">
                    {!activeChatUser ? (
                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="text-xs font-bold text-gray-400 uppercase p-3 tracking-wider border-b border-gray-100 mb-2">
                                {activeCategory === 'friends' && "Vänner"}
                                {activeCategory === 'classmates' && "Klasskamrater"}
                                {activeCategory === 'administration' && "Administration"}
                            </div>
                            {users.length === 0 && <div className="text-center text-gray-400 p-4 text-xs italic">Inga kontakter i denna kategori.</div>}
                            {users.map(u => (
                                <div key={u.id} onClick={() => setActiveChatUser(u)} className="p-3 bg-white mb-2 rounded-xl shadow-sm border border-gray-100 cursor-pointer flex items-center gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0 border border-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors overflow-hidden">
                                        {u.profilePictureUrl ? (
                                            <img
                                                src={getSafeUrl(u.profilePictureUrl)}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                            />
                                        ) : null}
                                        <span style={{ display: u.profilePictureUrl ? 'none' : 'block' }}>{u.firstName?.[0]}{u.lastName?.[0]}</span>
                                    </div>
                                    <div className="overflow-hidden"><div className="font-bold text-gray-800 text-sm truncate">{u.fullName}</div><div className="text-xs text-gray-500 truncate">{u.role}</div></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll}>
                                {isLoading && <div className="text-center text-xs text-gray-400">Loading...</div>}
                                {messages.filter(m => (m.senderId === currentUser.id && m.recipientId === activeChatUser.id) || (m.senderId === activeChatUser.id && m.recipientId === currentUser.id))
                                    .map((msg, idx) => {
                                        const isMe = msg.senderId === currentUser.id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                                                    {msg.type === 'IMAGE' ? <img src={getSafeUrl(msg.content)} alt={t('chat.image')} className="rounded-lg max-w-full border border-white/20" /> : <p>{msg.content}</p>}
                                                    <div className={`text-[10px] mt-1 text-right opacity-70`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-3 bg-white border-t flex items-center gap-2">
                                <label className="p-2 text-gray-400 hover:text-indigo-600 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"><ImageIcon size={20} /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                                <input className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder={t('chat.type_placeholder')} value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(msgInput)} />
                                <button onClick={() => sendMessage(msgInput)} disabled={!msgInput.trim()} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"><Send size={18} /></button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatOverlay;