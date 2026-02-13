import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, HelpCircle, Store, Library, MessageSquare, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';

import ChatModule from '../../modules/chat/ChatModule';
import NotificationBell from '../NotificationBell';

const HorizonLayout = ({ children }) => {
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
        return url.startsWith('http') ? url : `${window.location.origin}${url}`;
    };
    const profileImgUrl = getProfileUrl();

    const gamificationActive = isModuleActive('GAMIFICATION');
    const analyticsActive = isModuleActive('ANALYTICS');
    const darkModeActive = isModuleActive('DARK_MODE');
    const token = localStorage.getItem('token');

    const roleName = currentUser?.role?.name || currentUser?.role;

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={18} />, label: t('sidebar.dashboard') },
        { path: '/calendar', icon: <Calendar size={18} />, label: t('sidebar.calendar') || 'Kalender' },
        ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={18} />, label: t('sidebar.resource_bank') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={18} />, label: t('sidebar.admin') }] : []),
        ...(analyticsActive && roleName === 'ADMIN' ? [{ path: '/analytics', icon: <TrendingUp size={18} />, label: t('sidebar.analytics') }] : []),
        { path: '/catalog', icon: <Layers size={18} />, label: t('sidebar.catalog') },
        ...(['STUDENT', 'TEACHER', 'ADMIN'].includes(roleName) ? [{ path: '/ebooks', icon: <Library size={18} />, label: t('sidebar.library') || 'Bibliotek' }] : []),
        { path: '/documents', icon: <FileText size={18} />, label: t('sidebar.documents') },
        { path: '/communication', icon: <MessageSquare size={18} />, label: t('shortcuts.messages') || 'Meddelanden' },
        { path: '/support', icon: <HelpCircle size={18} />, label: t('sidebar.support') || 'Kontakt & Support' },
        ...(isModuleActive('WELLBEING_CENTER') && ['STUDENT', 'ROLE_STUDENT', 'ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR'].includes(roleName) ? [{ path: '/wellbeing-center', icon: <Heart size={18} />, label: 'Well-being Center' }] : []),
        ...(isModuleActive('WELLBEING_CENTER') && (roleName === 'HALSOTEAM' || roleName === 'ROLE_HALSOTEAM') ? [{ path: '/wellbeing-center/inbox', icon: <Heart size={18} />, label: 'E-hälsa Inbox' }] : []),
    ];

    return (
        <div className="flex flex-col min-h-screen text-gray-900 dark:text-[#E3E3E3] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
            <style>{`
                @media (prefers-color-scheme: dark) {
                    .dark-mode-bg { background: var(--app-background-dark) !important; }
                }
                :root.dark body { background: var(--app-background-dark) !important; }
                .app-wrapper { background: var(--app-background); }
                .dark .app-wrapper { background: var(--app-background-dark); }
            `}</style>
            <div className={`fixed inset-0 -z-10 app-wrapper transition-colors duration-300 pointer-events-none`} />

            {/* TOP NAVIGATION BAR */}
            <header className="h-20 px-8 flex items-center justify-between shrink-0 sticky top-0 z-50 bg-[var(--app-background)]/80 backdrop-blur-md transition-colors duration-300">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <div className="h-10 px-4 bg-white dark:bg-[#1E1F20] rounded-full flex items-center justify-center border border-gray-100 dark:border-[#3c4043] shadow-sm">
                        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                            {systemSettings?.site_name || "EduFlex"}
                        </span>
                    </div>
                </div>

                {/* Center Navigation Pucks */}
                <nav className="hidden lg:flex items-center gap-2 bg-white/50 dark:bg-[#1E1F20]/50 backdrop-blur-md p-1.5 rounded-full border border-white/20 dark:border-white/10 shadow-sm">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                        return (
                            <NavLink key={item.path} to={item.path} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium
                                ${isActive
                                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-[#2c2e30]'
                                }`}>
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Right Utilities */}
                <div className="flex items-center gap-4">
                    <button className="p-2.5 bg-white dark:bg-[#1E1F20] rounded-full text-gray-500 hover:text-gray-900 transition-colors shadow-sm border border-gray-100 dark:border-[#3c4043]">
                        <Search size={20} />
                    </button>
                    <NotificationBell />

                    {/* User Profile Pill */}
                    <div className="flex items-center gap-3 pl-2 pr-2 py-1.5 bg-white dark:bg-[#1E1F20] rounded-full border border-gray-100 dark:border-[#3c4043] shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/profile')}>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{currentUser?.firstName?.[0]}</div>}
                        </div>
                        <span className="text-sm font-bold pr-2 hidden xl:block">{currentUser?.firstName}</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-4 md:p-6 flex flex-col">
                {/* Content Card */}
                <div className="flex-1 bg-white/80 dark:bg-[#1E1F20]/90 backdrop-blur-xl rounded-[40px] shadow-sm border border-white/50 dark:border-white/5 p-8 relative">
                    {children}
                </div>
            </main>

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

export default HorizonLayout;
