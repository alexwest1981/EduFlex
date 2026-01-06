import React, { useState, useEffect } from 'react';
import {
    Mail, Send, Inbox, ChevronRight, Search,
    Trash2, User, CheckCircle, Clock, Reply, X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const MessageCenter = ({ preSelectedRecipient = null }) => {
    const { currentUser } = useAppContext();

    // UI State
    const [activeTab, setActiveTab] = useState('INBOX'); // INBOX, SENT, COMPOSE
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Compose State
    const [recipientId, setRecipientId] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [users, setUsers] = useState([]);

    // NYTT: State för att hantera "Svara"-läget specifikt
    const [replyModeUser, setReplyModeUser] = useState(null); // { id, name }

    useEffect(() => {
        if (activeTab === 'COMPOSE') {
            loadUsers();

            // Om vi har en förvald mottagare från Dashboard (t.ex. läraren klickar "Kontakta")
            if (preSelectedRecipient && !replyModeUser) {
                setReplyModeUser({
                    id: preSelectedRecipient.id,
                    name: preSelectedRecipient.fullName
                });
                setRecipientId(preSelectedRecipient.id);
            }
        } else {
            // Rensa formuläret när vi lämnar Compose
            setReplyModeUser(null);
            setRecipientId('');
            setSubject('');
            setContent('');
            loadMessages();
        }
    }, [activeTab]);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const data = activeTab === 'INBOX'
                ? await api.messages.getInbox()
                : await api.messages.getSent();
            setMessages(data);
            setSelectedMessage(null);
        } catch (e) {
            console.error("Kunde inte hämta meddelanden", e);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await api.messages.getContacts();
            setUsers(data || []);
        } catch (e) { console.error("Kunde inte hämta mottagare", e); }
    };

    const handleReadMessage = async (msg) => {
        setSelectedMessage(msg);
        if (activeTab === 'INBOX' && !msg.isRead) {
            try {
                await api.messages.markAsRead(msg.id);
                setMessages(prev => prev.map(m => m.id === msg.id ? {...m, isRead: true} : m));
            } catch (e) { console.error("Kunde inte markera som läst", e); }
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!recipientId || !subject || !content) return alert("Fyll i alla fält");

        setIsLoading(true);
        try {
            await api.messages.send({ recipientId, subject, content });
            alert("Meddelande skickat!");
            setActiveTab('SENT');
        } catch (e) {
            alert("Kunde inte skicka.");
        } finally {
            setIsLoading(false);
        }
    };

    // FIX: Svarsfunktionen sätter nu ett låst läge
    const handleReply = () => {
        const targetId = activeTab === 'INBOX' ? selectedMessage.senderId : selectedMessage.recipientId;
        const targetName = activeTab === 'INBOX' ? selectedMessage.senderName : selectedMessage.recipientName;

        setReplyModeUser({ id: targetId, name: targetName });
        setRecipientId(targetId);
        setSubject(`Sv: ${selectedMessage.subject}`);
        setActiveTab('COMPOSE');
    };

    // Funktion för att starta helt nytt meddelande (rensar svar)
    const handleNewMessage = () => {
        setReplyModeUser(null);
        setRecipientId('');
        setSubject('');
        setContent('');
        setActiveTab('COMPOSE');
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">

            {/* SIDEBAR */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-[#131314] border-r border-gray-200 dark:border-[#3c4043] flex flex-col">
                <div className="p-4">
                    <button
                        onClick={handleNewMessage}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                        <Send size={18}/> Nytt Meddelande
                    </button>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    <button onClick={() => setActiveTab('INBOX')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'INBOX' ? 'bg-white dark:bg-[#1E1F20] shadow-sm text-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2c]'}`}>
                        <span className="flex items-center gap-3"><Inbox size={18}/> Inkorg</span>
                    </button>
                    <button onClick={() => setActiveTab('SENT')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'SENT' ? 'bg-white dark:bg-[#1E1F20] shadow-sm text-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2c]'}`}>
                        <span className="flex items-center gap-3"><Send size={18}/> Skickat</span>
                    </button>
                </nav>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#1E1F20]">

                {/* SKRIV-LÄGE (COMPOSE) */}
                {activeTab === 'COMPOSE' ? (
                    <div className="p-8 flex-1 overflow-y-auto animate-in fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {replyModeUser ? 'Svara på meddelande' : 'Skriv nytt meddelande'}
                            </h2>
                            <button onClick={() => setActiveTab('INBOX')} className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-full"><X size={20} className="text-gray-500"/></button>
                        </div>

                        <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Mottagare</label>

                                {/* LOGIK: Om vi svarar, visa låst fält. Annars visa lista. */}
                                {replyModeUser ? (
                                    <div className="flex items-center gap-2 w-full p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-xl text-indigo-700 dark:text-indigo-300 font-bold">
                                        <Reply size={16} />
                                        <span>{replyModeUser.name}</span>
                                        <input type="hidden" value={replyModeUser.id} />
                                    </div>
                                ) : (
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        required
                                    >
                                        <option value="">Välj mottagare...</option>
                                        {users.length > 0 ? (
                                            users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)
                                        ) : (
                                            <option disabled>Inga kontakter hittades</option>
                                        )}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Ämne</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="Vad gäller saken?"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Meddelande</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px] resize-y dark:text-white"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Skriv ditt meddelande..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setActiveTab('INBOX')} className="px-6 py-2 font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Avbryt</button>
                                <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <Send size={18}/> {isLoading ? 'Skickar...' : 'Skicka'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // INKORG / SKICKAT LISTA
                    <div className="flex h-full">
                        {/* MEDDELANDELISTA */}
                        <div className={`w-full md:w-1/3 border-r border-gray-100 dark:border-[#3c4043] overflow-y-auto ${selectedMessage ? 'hidden md:block' : 'block'}`}>
                            {isLoading ? <div className="p-10 text-center text-gray-400">Laddar meddelanden...</div> : (
                                messages.length === 0 ? <div className="p-10 text-center text-gray-400">Inga meddelanden här.</div> :
                                    <ul className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                        {messages.map(msg => (
                                            <li
                                                key={msg.id}
                                                onClick={() => handleReadMessage(msg)}
                                                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors ${selectedMessage?.id === msg.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} ${!msg.isRead && activeTab === 'INBOX' ? 'border-l-4 border-indigo-500 bg-gray-50/50' : ''}`}
                                            >
                                                <div className="flex justify-between mb-1">
                                                <span className={`text-sm font-bold ${!msg.isRead && activeTab === 'INBOX' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {activeTab === 'INBOX' ? msg.senderName : `Till: ${msg.recipientName}`}
                                                </span>
                                                    <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <p className={`text-sm mb-1 ${!msg.isRead && activeTab === 'INBOX' ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>{msg.subject}</p>
                                                <p className="text-xs text-gray-400 line-clamp-1">{msg.content}</p>
                                            </li>
                                        ))}
                                    </ul>
                            )}
                        </div>

                        {/* LÄSVY */}
                        <div className={`flex-1 overflow-y-auto p-8 bg-gray-50/30 dark:bg-[#1E1F20] ${!selectedMessage ? 'hidden md:flex items-center justify-center' : 'block'}`}>
                            {!selectedMessage ? (
                                <div className="text-center text-gray-400">
                                    <Mail size={64} className="mx-auto mb-4 opacity-10"/>
                                    <p>Välj ett meddelande för att läsa</p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in">
                                    <div className="flex justify-between items-start mb-6 border-b border-gray-200 dark:border-[#3c4043] pb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedMessage.subject}</h2>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                                                    {activeTab === 'INBOX' ? selectedMessage.senderName[0] : selectedMessage.recipientName[0]}
                                                </div>
                                                <div>
                                                    <p><span className="font-bold text-gray-900 dark:text-white">{activeTab === 'INBOX' ? selectedMessage.senderName : `Till: ${selectedMessage.recipientName}`}</span></p>
                                                    <p className="text-xs">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {activeTab === 'INBOX' && (
                                                <button onClick={handleReply} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-bold text-sm shadow-md">
                                                    <Reply size={16}/> Svara
                                                </button>
                                            )}
                                            <button onClick={() => setSelectedMessage(null)} className="md:hidden p-2 text-gray-500">
                                                <ChevronRight size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.content}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageCenter;