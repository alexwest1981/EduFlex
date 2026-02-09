import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Paperclip, Minimize2, MoreVertical, Users, ExternalLink, Image as ImageIcon, Minus, Bot, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useTranslation } from 'react-i18next';
import { api, API_BASE } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const notifySound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

const ChatOverlay = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const location = useLocation(); // For detecting course
    const [isOpen, setIsOpen] = useState(false);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [animateBadge, setAnimateBadge] = useState(false);

    // AI State
    const [isAIMode, setIsAIMode] = useState(false);
    const [aiMessages, setAiMessages] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);

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
    const aiMessagesEndRef = useRef(null);

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) { setUnreadCount(0); setAnimateBadge(false); }
    }, [isOpen]);

    useEffect(() => { activeUserRef.current = activeChatUser; }, [activeChatUser]);

    useEffect(() => {
        if (!currentUser) return;
        const socket = new SockJS(`${window.location.origin}/ws`);
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
            try { notifySound.play().catch(() => { /* ignore */ }); } catch (e) { /* ignore */ }
        }
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeChatUser, isOpen]);
    useEffect(() => { aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages, isAIMode]);

    // Reset pagination when switching users
    useEffect(() => {
        if (activeChatUser) {
            setMessages([]);
            setPage(0);
            setHasMore(true);
            loadMessages(0, true);
        }
    }, [activeChatUser]);

    // Initial AI Message
    useEffect(() => {
        if (aiMessages.length === 0) {
            setAiMessages([{ role: 'ai', text: 'Hej! 👋 Jag är din AI-tutor. Öppna en kurs för att ställa frågor om materialet.' }]);
        }
    }, []);

    const loadMessages = (pageNum, isReset = false) => {
        if (!currentUser || !activeChatUser) return;
        setIsLoading(true);
        const token = localStorage.getItem('token');
        fetch(`${API_BASE}/messages/${currentUser.id}/${activeChatUser.id}?page=${pageNum}&size=20`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                const newMessages = data.content;
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
        if (scrollTop === 0 && hasMore && !isLoading && !isAIMode) {
            const newPage = page + 1;
            setPage(newPage);
            loadMessages(newPage);
        }
    };

    // Auto-scroll only on initial load or new message sent/received (if at bottom)
    useEffect(() => {
        if (page === 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeChatUser, isOpen]);

    const fetchUsers = async () => {
        try {
            const data = await api.messages.getContacts();
            setCategories({
                friends: data.friends || [],
                classmates: data.classmates || [],
                administration: data.administration || [],
                others: data.others || []
            });
            if (data.friends?.length > 0) setActiveCategory('friends');
            else if (data.classmates?.length > 0) setActiveCategory('classmates');
            else setActiveCategory('administration');
        } catch (e) { console.error(e); }
    };

    const sendMessage = (content, type = 'TEXT') => {
        if (!content.trim() && type === 'TEXT') return;

        // AI CHAT LOGIC
        if (isAIMode) {
            sendAIMessage(content);
            return;
        }

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

    const sendAIMessage = async (content) => {
        // Extract course ID from URL if possible
        // Format: /course/:id
        const match = location.pathname.match(/\/course\/(\d+)/);
        const courseId = match ? match[1] : null;

        setAiMessages(prev => [...prev, { role: 'user', text: content }]);
        setMsgInput('');
        setAiLoading(true);

        if (!courseId) {
            setTimeout(() => {
                setAiMessages(prev => [...prev, { role: 'ai', text: '⚠️ Du måste vara inne på en kurssida för att jag ska kunna svara på frågor om kursen.' }]);
                setAiLoading(false);
            }, 500);
            return;
        }

        try {
            const response = await api.ai.tutor.chat(courseId, content);
            setAiMessages(prev => [...prev, { role: 'ai', text: response.answer }]);
        } catch (error) {
            console.error("Failed to chat with AI", error);
            if (error.message && error.message.includes("403")) {
                setAiMessages(prev => [...prev, {
                    role: 'ai',
                    text: '🔒 **Denna funktion kräver PRO eller ENTERPRISE.**\n\nUppgradera din licens för att få tillgång till din personliga AI-tutor.'
                }]);
            } else {
                setAiMessages(prev => [...prev, { role: 'ai', text: 'Ojdå, något gick fel. Försök igen senare. 🤕' }]);
            }
        } finally {
            setAiLoading(false);
        }
    }

    const handleImageUpload = async (e) => {
        if (isAIMode) return; // No images for AI yet
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", "Chat Image");
        formData.append("type", "IMAGE");
        try {
            const data = await api.documents.upload(currentUser.id, formData);
            if (data && data.fileUrl) sendMessage(data.fileUrl, 'IMAGE');
        } catch (err) { /* ignore */ }
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
            {/* HEADERS */}
            <div className={`p-4 text-white flex justify-between items-center shrink-0 shadow-md z-10 transition-colors duration-300 ${isAIMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-indigo-600'}`}>
                <div className="flex items-center gap-3">
                    {isAIMode ? (
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <span className="font-bold text-sm">AI Tutor</span>
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">BETA</span>
                        </div>
                    ) : activeChatUser ? (
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
                {/* SIDEBAR FOR CATEGORIES (Visas endast i kontaktlistan eller AI mode om ej aktiv user förutom AI) */}
                {!activeChatUser && (
                    <div className="w-16 bg-gray-100 dark:bg-[#1E1F20] border-r border-gray-200 dark:border-[#3c4043] flex flex-col items-center py-4 gap-4 shrink-0">
                        <button onClick={() => { setIsAIMode(false); setActiveCategory('friends'); }} title="Vänner" className={`p-2 rounded-xl transition-all ${!isAIMode && activeCategory === 'friends' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <Users size={20} />
                        </button>
                        <button onClick={() => { setIsAIMode(false); setActiveCategory('classmates'); }} title="Klasskamrater" className={`p-2 rounded-xl transition-all ${!isAIMode && activeCategory === 'classmates' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <Users size={20} />
                            <span className="text-[8px] font-bold block text-center -mt-1">Klass</span>
                        </button>
                        <button onClick={() => { setIsAIMode(false); setActiveCategory('administration'); }} title="Administration & Lärare" className={`p-2 rounded-xl transition-all ${!isAIMode && activeCategory === 'administration' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <Users size={20} />
                            <span className="text-[8px] font-bold block text-center -mt-1">Admin</span>
                        </button>

                        <div className="w-8 h-[1px] bg-gray-300 dark:bg-gray-700 my-1"></div>

                        {/* AI BUTTON */}
                        <button onClick={() => { setIsAIMode(true); setActiveChatUser(null); }} title="AI Tutor" className={`p-2 rounded-xl transition-all ${isAIMode ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md' : 'text-purple-600 hover:bg-purple-100'}`}>
                            <Sparkles size={20} />
                            <span className="text-[8px] font-bold block text-center -mt-1">AI</span>
                        </button>
                    </div>
                )}

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* MODE SWITCHING */}
                    {isAIMode ? (
                        // AI CHAT INTERFACE
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" >
                                {aiMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}>
                                            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br/>") }}></div>
                                        </div>
                                    </div>
                                ))}
                                {aiLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={aiMessagesEndRef} />
                            </div>
                            <div className="p-3 bg-white border-t flex items-center gap-2">
                                <input className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Fråga AI om kursen..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(msgInput)} />
                                <button onClick={() => sendMessage(msgInput)} disabled={!msgInput.trim() || aiLoading} className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"><Send size={18} /></button>
                            </div>
                        </>
                    ) : (
                        // REGULAR CHAT INTERFACE
                        !activeChatUser ? (
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
                                                    src={u.profilePictureUrl}
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
                                                        {msg.type === 'IMAGE' ? <img src={msg.content} alt={t('chat.image')} className="rounded-lg max-w-full border border-white/20" /> : <p>{msg.content}</p>}
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
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatOverlay;
