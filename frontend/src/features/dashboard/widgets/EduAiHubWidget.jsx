import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Trophy, Play, Target, TrendingUp, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { motion } from 'framer-motion';

const EduAiHubWidget = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ queueSize: 0, xpMultiplier: '1.0', totalXp: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.ai.getHubStats();
            setStats(data || { queueSize: 0, xpMultiplier: '1.0', totalXp: 0 });
        } catch (err) {
            console.error("Failed to fetch Hub stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center bg-white/50 dark:bg-[#1E1F20]/50 backdrop-blur-sm rounded-3xl border border-white/20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    return (
        <div className="relative group bg-white dark:bg-[#1E1F20] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-orange/10 transition-colors"></div>
            </div>

            <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">EduAI Intelligence</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Center</p>
                        </div>
                    </div>
                    {stats.queueSize > 0 && (
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange"></span>
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 group-hover:scale-[1.02] transition-transform group/tooltip relative">
                        <div className="flex items-center gap-1.5 text-brand-orange mb-1">
                            <Target size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Att repetera</span>
                            <HelpCircle size={10} className="text-gray-400 cursor-help" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.queueSize}</p>
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-gray-900 text-white text-[10px] leading-relaxed p-2 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-[100] pointer-events-none shadow-xl">
                            Antal begrepp i din EduAI-kö som behöver repeteras idag för optimalt minne.
                            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 group-hover:scale-[1.02] transition-transform delay-75 group/tooltip relative">
                        <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                            <Trophy size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Total XP</span>
                            <HelpCircle size={10} className="text-gray-400 cursor-help" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalXp}</p>
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-900 text-white text-[10px] leading-relaxed p-2 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-[100] pointer-events-none shadow-xl">
                            Din samlade erfarenhetspoäng från minispel, repetitioner och utmaningar.
                            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/ai-hub')}
                    className="w-full bg-gradient-to-r from-brand-orange to-[#ff7e5f] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand-orange/20"
                >
                    <Play size={18} fill="white" />
                    Börja Session
                </button>

                <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                    Underhåll ditt minne och tjäna XP genom dagliga utmaningar.
                </p>
            </div>
        </div>
    );
};

export default EduAiHubWidget;
