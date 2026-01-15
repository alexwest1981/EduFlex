import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, Plus, HelpCircle, Shield, Folder, BarChart2, HardDrive, Wallet, PieChart, Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';

import ChatModule from '../../modules/chat/ChatModule';

const MidnightLayout = ({ children }) => {
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

    // Midnight Navigation - Top Pill Bar
    const navItems = [
        { path: '/', icon: <LayoutDashboard size={18} />, label: t('sidebar.dashboard') },
        { path: '/catalog', icon: <Wallet size={18} />, label: t('sidebar.catalog') }, // Wallet for "Investment" vibe
        { path: '/documents', icon: <FileText size={18} />, label: t('sidebar.documents') },
        { path: '/calendar', icon: <Calendar size={18} />, label: t('sidebar.calendar') },
        ...(roleName === 'ADMIN' ? [{ path: '/analytics', icon: <Activity size={18} />, label: t('sidebar.analytics') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={18} />, label: t('sidebar.admin') }] : []),
    ];

    return (
        <div className="flex items-center justify-center p-8 h-screen w-screen overflow-hidden text-gray-200 font-sans transition-colors duration-300" style={{ background: '#050505' }}> {/* Deep Black BG */}
            <style>{`
                @media (prefers-color-scheme: dark) {
                    .dark-mode-bg { background: #050505 !important; }
                }
                :root.dark body { background: #050505 !important; }
                .app-wrapper { background: #050505; }
                .midnight-scroll::-webkit-scrollbar { width: 6px; }
                .midnight-scroll::-webkit-scrollbar-track { background: #111; }
                .midnight-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
            `}</style>

            {/* FLOATING APP CONTAINER - Dark Mode Card */}
            <div className="w-full h-full max-w-[1600px] bg-[#0F0F0F] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/5 relative">

                {/* HEADER - FinPoint Style */}
                <header className="h-24 flex items-center justify-between px-10 shrink-0 border-b border-white/5">

                    {/* Left: Brand + Nav Pills */}
                    <div className="flex items-center gap-12">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#00DC82] rounded-lg flex items-center justify-center transform rotate-45">
                                <div className="transform -rotate-45">
                                    <Zap size={18} className="text-black fill-black" />
                                </div>
                            </div>
                            <span className="font-bold text-xl tracking-wide text-white">
                                {systemSettings?.site_name || "EduFlex"}
                            </span>
                        </div>

                        {/* Navigation Pills */}
                        <nav className="hidden lg:flex items-center gap-1 bg-[#1A1A1A] p-1.5 rounded-full border border-white/5">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                                    ${isActive
                                            ? 'bg-white text-black shadow-lg shadow-white/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Right: Utilities */}
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-[#1A1A1A] border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#00DC82] focus:outline-none transition-colors w-64"
                            />
                        </div>

                        <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00DC82] rounded-full"></span>
                        </button>

                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 cursor-pointer" onClick={() => navigate('/profile')}>
                            {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center font-bold text-xs text-[#00DC82]">{currentUser?.firstName?.[0]}</div>}
                        </div>

                        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>

                </header>

                {/* MAIN CONTENT - Dark Canvas */}
                <main className="flex-1 overflow-y-auto p-8 midnight-scroll relative">
                    {/* Mint Gradient Glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00DC82] opacity-[0.03] blur-[150px] pointer-events-none rounded-full" />

                    {/* Content Container */}
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Optional breadcrumb/header area could go here */}
                        <div className="min-h-full">
                            {children}
                        </div>
                    </div>
                </main>

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

export default MidnightLayout;
