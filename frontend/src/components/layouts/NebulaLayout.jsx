import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, ShoppingBag, MessageSquare, PieChart, HelpCircle, Store, Library, ClipboardList, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import logoTop from '../../assets/images/Logo_top.png';
import { useTranslation } from 'react-i18next';

import ChatModule from '../../modules/chat/ChatModule';

const NebulaLayout = ({ children }) => {
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
        return url.startsWith('http') ? url : `${window.location.origin}${url} `;
    };
    const profileImgUrl = getProfileUrl();

    const gamificationActive = isModuleActive('GAMIFICATION');
    const analyticsActive = isModuleActive('ANALYTICS');
    const token = localStorage.getItem('token');

    const roleName = currentUser?.role?.name || currentUser?.role;

    // Nebula uses icon-heavy top navigation
    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        { path: '/catalog', icon: <ShoppingBag size={20} />, label: t('sidebar.catalog') },
        { path: '/my-courses', icon: <BookOpen size={20} />, label: t('sidebar.my_courses') },
        ...(['STUDENT', 'TEACHER', 'ADMIN'].includes(roleName) ? [{ path: '/ebooks', icon: <Library size={18} />, label: t('sidebar.ebooks') }] : []),
        { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') },
        { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
        { path: '/communication', icon: <MessageSquare size={20} />, label: t('shortcuts.messages') || 'Meddelanden' },
        ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={20} />, label: t('sidebar.resource_bank') }] : []),
        ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/evaluations/manage', icon: <ClipboardList size={20} />, label: 'Utvärderingar' }] : []),
        { path: '/support', icon: <HelpCircle size={20} />, label: t('sidebar.support') },
        ...(isModuleActive('WELLBEING_CENTER') && ['STUDENT', 'ROLE_STUDENT', 'ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR'].includes(roleName) ? [{ path: '/wellbeing-center', icon: <Heart size={20} />, label: 'Well-being Center' }] : []),
        ...(isModuleActive('WELLBEING_CENTER') && (roleName === 'HALSOTEAM' || roleName === 'ROLE_HALSOTEAM') ? [{ path: '/wellbeing-center/inbox', icon: <Heart size={20} />, label: 'E-hälsa Inbox' }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/analytics', icon: <PieChart size={20} />, label: t('sidebar.analytics') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
    ];

    return (
        <div className="flex flex-col min-h-screen w-full text-gray-800 dark:text-[#E3E3E3] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
            <style>{`
@media(prefers - color - scheme: dark) {
                    .dark - mode - bg { background: var(--app - background - dark)!important; }
}
                : root.dark body { background: var(--app - background - dark)!important; }
                .app - wrapper { background: var(--app - background); }
                .dark.app - wrapper { background: var(--app - background - dark); }
`}</style>
            <div className={`fixed inset - 0 - z - 10 app - wrapper transition - colors duration - 300 pointer - events - none`} />

            {/* NEBULA TOP BAR - Minimalist & Glassy */}
            <header className="h-24 px-10 flex items-center justify-between shrink-0 sticky top-0 z-50 backdrop-blur-md bg-white/40 dark:bg-[#131314]/40 transition-colors duration-300">
                {/* Logo Area */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 flex items-center justify-center">
                            <img src={logoTop} alt="EduFlex Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-black text-2xl tracking-tight text-gray-800 dark:text-white opacity-80 uppercase">
                            {systemSettings?.site_name || "EduFlex"}
                        </span>
                    </div>
                </div>

                {/* Center Navigation - Floating Pills */}
                <nav className="hidden lg:flex items-center gap-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                        return (
                            <NavLink key={item.path} to={item.path} className={`p - 3.5 rounded - 2xl transition - all duration - 300 group
                                ${isActive
                                    ? 'bg-white dark:bg-[#2D2D2D] text-purple-600 dark:text-purple-400 shadow-xl shadow-purple-900/5 scale-110'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                                } `}>
                                {item.icon}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Right Utilities - Glass Capsules */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-black/20 p-2 rounded-full border border-white/20">
                        <div className="flex flex-col text-right px-2">
                            <span className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Welcome</span>
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{currentUser?.firstName}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 cursor-pointer hover:border-purple-400 transition-colors" onClick={() => navigate('/profile')}>
                            {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-100 flex items-center justify-center font-bold text-purple-800">{currentUser?.firstName?.[0]}</div>}
                        </div>
                    </div>

                    {/* Settings Button - Only for Admin */}
                    {roleName === 'ADMIN' && (
                        <button onClick={() => navigate('/admin')} className="p-3 bg-white/40 dark:bg-black/20 rounded-full text-gray-500 hover:text-purple-600 transition-colors" title={t('sidebar.admin')}>
                            <Settings size={20} />
                        </button>
                    )}

                    {/* Logout Button */}
                    <button onClick={handleLogout} className="p-3 bg-white/40 dark:bg-black/20 rounded-full text-gray-500 hover:text-red-600 transition-colors" title={t('sidebar.logout')}>
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA - Infinite Glass Card */}
            <main className="flex-1 px-6 pb-6" >
                <div className="flex-1 bg-white/60 dark:bg-[#1E1F20]/60 backdrop-blur-3xl rounded-[40px] shadow-2xl shadow-purple-900/5 border border-white/60 dark:border-white/5 p-10 relative">
                    {children}
                </div>
            </main >

            {isModuleActive('CHAT') && (
                <ChatModule
                    currentUser={currentUser}
                    API_BASE={API_BASE}
                    token={token}
                />
            )}
        </div >
    );
};

export default NebulaLayout;
