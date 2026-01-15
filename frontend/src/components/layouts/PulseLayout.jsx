import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, Plus, HelpCircle, Shield, Folder, BarChart2, HardDrive, Wallet, Music, Play, Pause, Heart, Speaker } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';

import ChatModule from '../../modules/chat/ChatModule';

const PulseLayout = ({ children }) => {
    const { currentUser, logout, systemSettings, theme, toggleTheme, API_BASE } = useAppContext();
    const { isModuleActive } = useModules();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };

    const getProfileUrl = () => {
        if (!currentUser?.profilePictureUrl) return null;
        let url = currentUser.profilePictureUrl;
        if (url.includes('minio:9000')) url = url.replace('minio:9000', 'localhost:9000');
        return url.startsWith('http') ? url : `http://localhost:8080${url}`;
    };
    const profileImgUrl = getProfileUrl();
    const token = localStorage.getItem('token');
    const roleName = currentUser?.role?.name || currentUser?.role;

    // Pulse Navigation - Icon Only Circular Sidebar
    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
        { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') },
        ...(roleName === 'ADMIN' ? [{ path: '/analytics', icon: <BarChart2 size={20} />, label: t('sidebar.analytics') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
    ];

    return (
        <div className="flex items-center justify-center p-8 h-screen w-screen overflow-hidden text-gray-800 font-sans transition-colors duration-300" style={{ background: '#E8E8E8' }}> {/* Soft Grey BG */}
            <style>{`
                @media (prefers-color-scheme: dark) {
                    .dark-mode-bg { background: #121212 !important; }
                }
                :root.dark body { background: #121212 !important; }
                .app-wrapper { background: #E8E8E8; }
                .pulse-scroll::-webkit-scrollbar { width: 0px; background: transparent; } /* Hidden scrollbar for clean look */
            `}</style>

            {/* FLOATING APP CONTAINER - Soft Card */}
            <div className="w-full h-full max-w-[1500px] bg-[#F4F4F4] dark:bg-[#1E1E1E] rounded-[40px] shadow-2xl overflow-hidden flex flex-row relative border border-white/40">

                {/* SIDEBAR - Icon Only Strip */}
                <aside className="w-24 bg-[#F4F4F4] dark:bg-[#1E1E1E] flex flex-col items-center py-8 shrink-0 z-20">

                    {/* Brand Icon */}
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 mb-8">
                        <span className="text-white font-black text-lg">E</span>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex flex-col gap-6 w-full items-center">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                                ${isActive
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-110'
                                        : 'text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-white/10'
                                    }`}
                                title={item.label}
                            >
                                {item.icon}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom Utility */}
                    <div className="mt-auto flex flex-col gap-6 items-center">
                        <button onClick={handleLogout} className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all">
                            <LogOut size={20} />
                        </button>
                        <button onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform">
                            {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-red-100 flex items-center justify-center font-bold text-xs text-red-600">{currentUser?.firstName?.[0]}</div>}
                        </button>
                    </div>

                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F4F4F4] dark:bg-[#1E1E1E]">

                    {/* Header - Transparent & Minimal */}
                    <header className="h-24 flex items-center justify-between px-8 shrink-0">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                Hello, <span className="text-red-600">{currentUser?.firstName}!</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-white dark:bg-[#2A2A2A] rounded-full px-4 py-2 flex items-center gap-2 shadow-sm border border-gray-100 dark:border-gray-800">
                                <Search size={16} className="text-gray-400" />
                                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-48" />
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto px-8 pb-32 pulse-scroll">
                        {children}
                    </main>



                </div>

            </div>

            {isModuleActive('CHAT') && (
                <ChatModule
                    currentUser={currentUser}
                    API_BASE={API_BASE}
                    token={token}
                />
            )}
        </div>
    );
};

export default PulseLayout;
