import React from 'react';
import { BarChart2, TrendingUp, Users, Activity } from 'lucide-react';

const MobileAnalyticsView = () => {
    return (
        <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
            <h2 className="text-3xl font-bold text-white">Systemanalys</h2>

            {/* Main Chart Placeholder */}
            <div className="bg-[#1C1C1E] p-6 rounded-[32px] text-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Veckoaktivitet</p>
                        <h3 className="text-2xl font-bold">12,450 Besök</h3>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <TrendingUp size={12} /> +12%
                    </div>
                </div>

                {/* CSS Bar Chart */}
                <div className="h-40 flex items-end justify-between gap-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="w-full bg-[#FF6D5A]/20 rounded-t-lg relative group">
                            <div className="absolute bottom-0 left-0 right-0 bg-[#FF6D5A] rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 font-bold">
                    <span>Mån</span><span>Tis</span><span>Ons</span><span>Tor</span><span>Fre</span><span>Lör</span><span>Sön</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1C1C1E] p-5 rounded-[28px] text-white">
                    <div className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center text-blue-400 mb-3">
                        <Users size={20} />
                    </div>
                    <h4 className="text-2xl font-bold">85%</h4>
                    <p className="text-xs text-gray-400">Retention Rate</p>
                </div>
                <div className="bg-[#1C1C1E] p-5 rounded-[28px] text-white">
                    <div className="bg-purple-500/20 w-10 h-10 rounded-full flex items-center justify-center text-purple-400 mb-3">
                        <Activity size={20} />
                    </div>
                    <h4 className="text-2xl font-bold">24ms</h4>
                    <p className="text-xs text-gray-400">Avg Latency</p>
                </div>
            </div>
        </div>
    );
};

export default MobileAnalyticsView;
