import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Heart, Sparkles, GraduationCap } from 'lucide-react';

const StudyPalWidget = ({ courseId, lessonTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'pal', text: 'Hej kompis! 🌟 Jag är din Study Pal. Jag finns här för att peppa dig och hjälpa dig förstå allt i den här kursen. Vad har du på hjärtat?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isTyping]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = message;
        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const response = await fetch('/api/study-pal/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    courseId,
                    lessonTitle,
                    question: userMsg
                })
            });

            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'pal', text: data.response }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'pal', text: 'Hoppsan kompis! Min hjärna fick lite hicka. Kan vi prova igen? Jag tror på dig!' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <Sparkles size={20} className="text-yellow-200" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Study Pal</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Din bäste vän i studierna</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/50 dark:bg-gray-950/20">
                        {chatHistory.map((chat, idx) => (
                            <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${chat.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-750'
                                    }`}>
                                    {chat.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ställ en fråga till din Pal..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-gray-200"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                            Hejar på dig! <Heart size={10} className="text-red-400 fill-red-400" />
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 group relative ${isOpen
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-600'
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white hover:scale-110 rotate-3 hover:rotate-0'
                    }`}
            >
                {isOpen ? <X size={28} /> : <GraduationCap size={32} />}

                {!isOpen && (
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-900 animate-bounce">
                        HEJ!
                    </div>
                )}
            </button>
        </div>
    );
};

export default StudyPalWidget;
