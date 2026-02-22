import React, { useState, useEffect } from 'react';
import { Users, Shield, Award, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';

const ClassPrideWidget = () => {
    const [classData, setClassData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClassProgress = async () => {
            try {
                const data = await api.get('/gamification/class/progress');
                setClassData(data);
            } catch (e) {
                console.error("Failed to load class progress", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClassProgress();
    }, []);

    if (isLoading) return <div className="animate-pulse bg-white/20 h-40 rounded-2xl" />;
    if (!classData || !classData.hasGroup) return null;

    const { groupName, progress } = classData;
    const { totalXp, targetXp, percentage, studentCount } = progress;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 backdrop-blur-md border border-indigo-500/20 shadow-xl p-6 relative overflow-hidden"
        >
            {/* Class Shield Icon in background */}
            <div className="absolute -bottom-6 -left-6 text-indigo-500/10 pointer-events-none transform -rotate-12">
                <Shield size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <Users size={20} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">Klass-Stolthet</h4>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{groupName}</p>
                        </div>
                    </div>
                    <div className="bg-white/50 dark:bg-white/10 px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                        <Heart size={12} className="text-rose-500 fill-rose-500" />
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{studentCount} Teammedlemmar</span>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Klassens gemensamma XP</span>
                            <span className="text-xl font-black text-slate-700 dark:text-white">{totalXp.toLocaleString()} <span className="text-xs font-medium opacity-50">/ {targetXp.toLocaleString()}</span></span>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-indigo-600">{percentage}%</span>
                        </div>
                    </div>

                    <div className="h-4 w-full bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden p-1">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 2, ease: "circOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                        >
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        </motion.div>
                    </div>
                </div>

                <div className="bg-white/40 dark:bg-white/5 rounded-xl border border-white/20 p-4 flex items-center gap-4 group cursor-help">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                        <Award size={24} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight uppercase mb-0.5 text-balance">Nästa gemensamma milstolpe</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white">Gemensam Klass-fika & Nytt Avatar-set 🍰</p>
                    </div>
                </div>

                <p className="mt-4 text-[10px] italic text-slate-400 text-center font-medium">"När en växer, växer hela klassen. Ingen lämnas bakom."</p>
            </div>
        </motion.div>
    );
};

export default ClassPrideWidget;
