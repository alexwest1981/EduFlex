import React, { useState, useEffect } from 'react';
import {
    Sparkles, Brain, Zap, Target,
    ChevronRight, ChevronLeft,
    TrendingUp, MessageSquare,
    Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

/**
 * AI Coach Sidebar for EduAI Center v2.0.
 * A slim, premium, glassmorphic sidebar that provides contextual help and review access.
 */
const AiCoachSidebar = () => {
    const { currentUser } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [stats, setStats] = useState({ queueSize: 0, xpMultiplier: '1.0' });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show for students
        if (currentUser && currentUser.role === 'STUDENT') {
            setIsVisible(true);
            fetchStats();
        } else {
            setIsVisible(false);
        }
    }, [currentUser]);

    const fetchStats = async () => {
        try {
            const data = await api.ai.getHubStats();
            setStats(data || { queueSize: 0, xpMultiplier: '1.0' });
        } catch (err) {
            console.error("Failed to fetch AI stats", err);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-[100] transition-all duration-500 flex items-center ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-48px)]'}`}>

            {/* Toggle Tab */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-24 bg-brand-orange text-white rounded-l-2xl flex flex-col items-center justify-center gap-2 shadow-2xl hover:brightness-110 active:scale-95 transition-all group"
            >
                {isOpen ? <ChevronRight size={18} /> : <div className="flex flex-col items-center gap-2">
                    <Sparkles size={20} className="animate-pulse" />
                    <span className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-widest uppercase">Coach</span>
                </div>}
            </button>

            {/* Sidebar Content */}
            <div className="w-72 bg-white/80 dark:bg-[#1E1F20]/90 backdrop-blur-xl border-l border-white/20 dark:border-white/5 h-[600px] rounded-l-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] p-6 overflow-hidden relative">

                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">EduAI Coach</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Live Support</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-2 text-brand-orange mb-1">
                            <Target size={14} />
                            <span className="text-[10px] font-bold uppercase">I kön</span>
                        </div>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stats.queueSize}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-bold uppercase">XP Bonus</span>
                        </div>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stats.xpMultiplier}x</p>
                    </div>
                </div>

                {/* Main Action */}
                <Link
                    to="/ai-hub"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand-orange/30 mb-8 overflow-hidden group relative"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Play size={20} fill="white" className="relative z-10" />
                    <span className="relative z-10">Starta Daily Review</span>
                </Link>

                {/* AI Tip / Message */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-orange flex-shrink-0 flex items-center justify-center text-white border-2 border-white dark:border-[#1E1F20] shadow-md shadow-brand-orange/20">
                            <Sparkles size={16} />
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/10">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                "Snyggt jobbat med matten! Du har 5 frågor som behöver repeteras idag för att stanna i minnet."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex border-t border-gray-100 dark:border-white/10 pt-4 gap-2">
                        <button className="flex-1 p-2 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 hover:text-brand-orange transition-colors flex items-center justify-center">
                            <MessageSquare size={18} />
                        </button>
                        <button className="flex-1 p-2 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 hover:text-brand-orange transition-colors flex items-center justify-center">
                            <Zap size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiCoachSidebar;
