import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, Plus, HelpCircle, Shield, Folder, BarChart2, HardDrive, Wallet, Music, Play, Pause, Heart, Speaker } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';
import ChatModule from '../../modules/chat/ChatModule';
import GlobalSearch from '../GlobalSearch';
import NotificationBell from '../NotificationBell';

const VoltageLayout = ({ children }) => {
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

    // Voltage Navigation - Optimized for the "Console" look
    const mainNav = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        { path: '/catalog', icon: <Folder size={20} />, label: t('sidebar.catalog') },
        { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') },
        { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
        ...(roleName === 'ADMIN' ? [{ path: '/analytics', icon: <BarChart2 size={20} />, label: t('sidebar.analytics') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/resources', icon: <HardDrive size={20} />, label: t('sidebar.resource_bank') }] : []),
    ];

    const bottomNav = [
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
        { path: '#logout', icon: <LogOut size={20} />, label: t('sidebar.logout'), action: handleLogout },
    ];


    return (
        <div className="flex items-center justify-center p-8 h-screen w-screen overflow-hidden text-[#1E1E1E] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
            <style>{`
                @media (prefers-color-scheme: dark) {
                    .dark-mode-bg { background: var(--app-background-dark) !important; }
                }
                :root.dark body { background: var(--app-background-dark) !important; }
                .app-wrapper { background: var(--app-background); }
                .dark .app-wrapper { background: var(--app-background-dark); }
            `}</style>
            <div className={`fixed inset-0 -z-10 app-wrapper transition-colors duration-300 pointer-events-none`} />

            {/* CONSOLE CONTAINER - High Contrast */}
            <div className="w-full h-full max-w-[1600px] bg-[#F2F3F5] dark:bg-[#121212] rounded-[40px] shadow-2xl overflow-hidden flex flex-row relative ring-4 ring-black/5 dark:ring-white/5">

                {/* BLACK SIDEBAR - The "Console" Strip */}
                <aside className="w-24 lg:w-72 bg-[#0A0A0A] text-white flex flex-col h-full shrink-0 relative z-10 transition-all duration-300">

                    {/* Brand / Logo */}
                    <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border-2 border-[#CCFF00] rounded-full flex items-center justify-center">
                                <span className="text-[#CCFF00] font-bold text-lg">+</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white hidden lg:block">
                                {systemSettings?.site_name || "EduFlex"}
                            </span>
                        </div>
                    </div>

                    {/* Primary Action Button replaced with Search */}
                    <div className="px-4 lg:px-6 mb-8 mt-2">
                        <GlobalSearch className="w-full" inputClassName="bg-[#CCFF00] text-black placeholder-black/60 font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)] focus:ring-[#CCFF00]/40" />
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 overflow-y-auto px-4 lg:px-6 space-y-6 scrollbar-hide py-2 flex flex-col items-center lg:items-stretch">
                        <div className="space-y-2">
                            {mainNav.map(item => (
                                <NavLink key={item.path} to={item.path} className={({ isActive: navActive }) => {
                                    const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                    return `flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 rounded-2xl transition-all duration-200 group
                                    ${isActive ? 'bg-[#1F1F1F] text-[#CCFF00]' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`;
                                }}>
                                    {({ isActive: navActive }) => {
                                        const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                        return (
                                            <>
                                                <div className="relative">
                                                    {item.icon}
                                                    {isActive && <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#CCFF00] rounded-r-full hidden lg:block"></div>}
                                                </div>
                                                <span className="font-medium text-sm hidden lg:block">{item.label}</span>
                                            </>
                                        );
                                    }}
                                </NavLink>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-gray-800 space-y-2 mt-auto">
                            {bottomNav.map(item => (
                                item.action ? (
                                    <button key={item.label} onClick={item.action} className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 rounded-2xl transition-all duration-200 text-gray-400 hover:text-[#FF4444] hover:bg-[#1F1111]">
                                        {item.icon}
                                        <span className="font-medium text-sm hidden lg:block">{item.label}</span>
                                    </button>
                                ) : (
                                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 rounded-2xl transition-all duration-200
                                        ${isActive ? 'bg-[#1F1F1F] text-[#CCFF00]' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}>
                                        {item.icon}
                                        <span className="font-medium text-sm hidden lg:block">{item.label}</span>
                                    </NavLink>
                                )
                            ))}
                        </div>

                    </div>

                    {/* User Profile Mini - Bottom */}
                    <div className="p-6 mt-auto">
                        <div className="flex items-center justify-center lg:justify-start gap-4 cursor-pointer" onClick={() => navigate('/profile')}>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 hover:border-[#CCFF00] transition-colors">
                                {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center font-bold text-xs text-white">{currentUser?.firstName?.[0]}</div>}
                            </div>
                            <div className="hidden lg:block overflow-hidden">
                                <p className="text-sm font-bold text-white leading-none mb-1 truncate">{currentUser?.firstName}</p>
                                <p className="text-xs text-gray-500 truncate">{roleName}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT RIGHT */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F2F3F5] dark:bg-[#121212] relative">

                    {/* Header Strip - Minimal */}
                    <header className="h-20 flex items-center justify-between px-8 shrink-0 bg-transparent">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-[#0A0A0A] dark:text-white">
                                {t('sidebar.dashboard')}
                            </h1>
                        </div>

                        {/* Top Utilities */}
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                        </div>
                    </header>

                    {/* CONTENT CANVAS */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
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

export default VoltageLayout;
