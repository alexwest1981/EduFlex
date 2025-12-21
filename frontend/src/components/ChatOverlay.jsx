import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Image as ImageIcon, Minus, Users } from 'lucide-react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// Enkelt notifikationsljud (valfritt)
const notifySound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

const ChatOverlay = ({ currentUser, API_BASE, token }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState("");
    const [stompClient, setStompClient] = useState(null);

    // NOTIFIKATION STATE
    const [unreadCount, setUnreadCount] = useState(0);
    const [animateBadge, setAnimateBadge] = useState(false);

    // Refs för att komma åt senaste state inuti WebSocket-callbacken
    const isOpenRef = useRef(isOpen);
    const activeUserRef = useRef(activeChatUser);
    const messagesEndRef = useRef(null);

    // Håll refs synkade med state
    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            // Nollställ notiser när man öppnar
            setUnreadCount(0);
            setAnimateBadge(false);
        }
    }, [isOpen]);

    useEffect(() => {
        activeUserRef.current = activeChatUser;
    }, [activeChatUser]);

    // 1. Koppla upp WebSocket
    useEffect(() => {
        if (!currentUser) return;

        const socket = new SockJS('http://127.0.0.1:8080/ws');
        const client = Stomp.over(socket);
        client.debug = null;

        client.connect({}, () => {
            // Lyssnar på min personliga kanal
            client.subscribe(`/topic/messages/${currentUser.id}`, (payload) => {
                const newMsg = JSON.parse(payload.body);
                handleIncomingMessage(newMsg);
            });
        }, (err) => console.error("Chat error:", err));

        setStompClient(client);
        fetchUsers();

        return () => { if (client && client.connected) client.disconnect(); };
    }, [currentUser]);

    // --- LOGIK FÖR INKOMMANDE MEDDELANDE ---
    const handleIncomingMessage = (newMsg) => {
        // Lägg alltid till meddelandet i listan så det syns när man öppnar
        setMessages(prev => [...prev, newMsg]);

        // LOGIK: Ska vi visa en röd notis?
        const isChatOpen = isOpenRef.current;
        const currentPartner = activeUserRef.current;

        // Om chatten är stängd, ELLER om vi pratar med någon annan än avsändaren
        if (!isChatOpen || (currentPartner && currentPartner.id !== newMsg.senderId)) {
            setUnreadCount(prev => prev + 1);
            setAnimateBadge(true);

            // Spela ljud (om användaren interagerat med sidan)
            try { notifySound.play().catch(() => {}); } catch(e){}
        }
    };

    // 2. Scrolla ner vid nytt meddelande
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChatUser, isOpen]);

    // 3. Hämta historik
    useEffect(() => {
        if (activeChatUser && currentUser) {
            fetch(`${API_BASE}/messages/${currentUser.id}/${activeChatUser.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.error(err));
        }
    }, [activeChatUser, currentUser, token]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.filter(u => u.id !== currentUser.id));
            }
        } catch (e) {}
    };

    const sendMessage = (content, type = 'TEXT') => {
        if (!content.trim() && type === 'TEXT') return;
        if (!stompClient || !activeChatUser) return;

        const chatMessage = {
            senderId: currentUser.id,
            recipientId: activeChatUser.id,
            senderName: currentUser.fullName,
            recipientName: activeChatUser.fullName,
            content: content,
            type: type,
            isRead: false // Viktigt för backend
        };

        try {
            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
            setMessages(prev => [...prev, { ...chatMessage, timestamp: new Date() }]);
            if(type === 'TEXT') setMsgInput("");
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
            const res = await fetch(`${API_BASE}/documents/user/${currentUser.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if(res.ok) {
                const data = await res.json();
                if (data.fileUrl) sendMessage(data.fileUrl, 'IMAGE');
            }
        } catch(err) {}
    };

    // --- RENDER ---

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 group">
                {/* --- RÖD NOTIFIKATIONSCIRKEL (MARKERINGEN) --- */}
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce z-50">
                        {unreadCount}
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(true)}
                    className={`w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:rotate-3 ${animateBadge ? 'ring-4 ring-red-400 animate-pulse' : ''}`}
                >
                    <MessageCircle size={28} />
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Chatt & Support
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 flex flex-col ring-1 ring-black/5">
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0 shadow-md z-10">
                <div className="flex items-center gap-3">
                    {activeChatUser ? (
                        <>
                            <button onClick={() => setActiveChatUser(null)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><Users size={18}/></button>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{activeChatUser.fullName}</span>
                                <span className="text-[10px] text-indigo-200 uppercase tracking-wider">{activeChatUser.role}</span>
                            </div>
                        </>
                    ) : (
                        <span className="font-bold flex items-center gap-2"><MessageCircle size={20}/> Messenger</span>
                    )}
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><Minus size={20}/></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-gray-50">
                {!activeChatUser ? (
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="text-xs font-bold text-gray-400 uppercase p-3 tracking-wider">Kontakter</div>
                        {users.map(u => (
                            <div key={u.id} onClick={() => setActiveChatUser(u)} className="p-3 bg-white mb-2 rounded-xl shadow-sm border border-gray-100 cursor-pointer flex items-center gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0 border border-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-bold text-gray-800 text-sm truncate">{u.fullName}</div>
                                    <div className="text-xs text-gray-500 truncate">{u.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages
                                .filter(m => (m.senderId === currentUser.id && m.recipientId === activeChatUser.id) || (m.senderId === activeChatUser.id && m.recipientId === currentUser.id))
                                .map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                                                {msg.type === 'IMAGE' ? (
                                                    <img src={`http://127.0.0.1:8080${msg.content}`} alt="Chattbild" className="rounded-lg max-w-full border border-white/20"/>
                                                ) : <p>{msg.content}</p>}
                                                <div className={`text-[10px] mt-1 text-right opacity-70`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 bg-white border-t flex items-center gap-2">
                            <label className="p-2 text-gray-400 hover:text-indigo-600 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"><ImageIcon size={20}/><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/></label>
                            <input className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Skriv..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(msgInput)}/>
                            <button onClick={() => sendMessage(msgInput)} disabled={!msgInput.trim()} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"><Send size={18}/></button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatOverlay;