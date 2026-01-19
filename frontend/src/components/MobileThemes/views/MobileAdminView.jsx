import React from 'react';
import { Shield, Database, Lock, Globe, Server, AlertTriangle } from 'lucide-react';

const MobileAdminView = () => {
    return (
        <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
            <h2 className="text-3xl font-bold text-white">Administration</h2>

            <div className="space-y-3">
                <div className="bg-[#1C1C1E] rounded-2xl p-4">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-3">Systemet</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <Server size={20} className="text-indigo-500" />
                                <span className="font-bold">Server Status</span>
                            </div>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-bold">Online</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <Database size={20} className="text-blue-500" />
                                <span className="font-bold">Databas</span>
                            </div>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-bold">Connected</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-3">Säkerhet</h3>
                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between text-white active:opacity-50">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-red-500" />
                                <span className="font-bold">Brandvägg</span>
                            </div>
                            <span className="text-xs font-mono text-white/50">Active</span>
                        </button>
                        <button className="w-full flex items-center justify-between text-white active:opacity-50">
                            <div className="flex items-center gap-3">
                                <Lock size={20} className="text-orange-500" />
                                <span className="font-bold">Behörigheter</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-3">Logs</h3>
                    <div className="p-3 bg-black/30 rounded-xl font-mono text-[10px] text-green-400 h-32 overflow-hidden">
                        <p>[INFO] Server started at 08:00:01</p>
                        <p>[INFO] Connection pool initialized</p>
                        <p>[WARN] High memory usage detected (85%)</p>
                        <p>[INFO] User login: admin_user</p>
                        <p>[INFO] User login: student_01</p>
                        <p>[INFO] Scheduled backup completed</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileAdminView;
