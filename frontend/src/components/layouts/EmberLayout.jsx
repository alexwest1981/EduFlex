import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, Plus, HelpCircle, Shield, Folder, BarChart2, HardDrive, Wallet, Music, Play, Pause, Heart, Speaker, Store } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';
import ChatModule from '../../modules/chat/ChatModule';
import GlobalSearch from '../GlobalSearch';
import NotificationBell from '../NotificationBell';

const EmberLayout = ({ children }) => {
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

    // Grouping Navigation for Ember Sidebar
    const generalNav = [
        { path: '/', icon: <LayoutDashboard size={18} />, label: t('sidebar.dashboard') },
        { path: '/profile', icon: <User size={18} />, label: t('sidebar.profile') || 'Min Profil' },
        { path: '/calendar', icon: <Calendar size={18} />, label: t('sidebar.calendar') },
    ];

    const utilityNav = [
        { path: '/catalog', icon: <Layers size={18} />, label: t('sidebar.catalog') },
        { path: '/documents', icon: <FileText size={18} />, label: t('sidebar.documents') },
        ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={18} />, label: t('sidebar.resource_bank') }] : []),
    ];

    const supportNav = [
        ...(roleName === 'ADMIN' ? [{ path: '/analytics', icon: <TrendingUp size={18} />, label: t('sidebar.analytics') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={18} />, label: t('sidebar.admin') }] : []),
        { path: '#logout', icon: <LogOut size={18} />, label: t('sidebar.logout'), action: handleLogout },
    ];


    return (
        <div className="flex items-center justify-center p-6 h-screen w-screen overflow-hidden text-[#1E1E1E] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
            <style>{`
                @media (prefers-color-scheme: dark) {
                    .dark-mode-bg { background: var(--app-background-dark) !important; }
                }
                :root.dark body { background: var(--app-background-dark) !important; }
                .app-wrapper { background: var(--app-background); }
                .dark .app-wrapper { background: var(--app-background-dark); }
            `}</style>
            <div className={`fixed inset-0 -z-10 app-wrapper transition-colors duration-300 pointer-events-none`} />

            {/* FLOATING APP CONTAINER */}
            <div className="w-full h-full max-w-[1800px] bg-white dark:bg-[#1E1F20] rounded-[30px] shadow-2xl overflow-hidden flex flex-row border border-white/10 relative">

                {/* LEFT SIDEBAR - Clean White */}
                <aside className="w-64 lg:w-72 bg-white dark:bg-[#1E1F20] flex flex-col border-r border-gray-100 dark:border-gray-800 h-full shrink-0">

                    {/* Brand */}
                    <div className="h-24 flex items-center px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                                <span className="text-white dark:text-black font-bold text-lg">E</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                                {systemSettings?.site_name || "EduFlex"}
                            </span>
                        </div>
                    </div>

                    {/* Primary CTA replaced with Search */}
                    <div className="px-6 mb-8">
                        <GlobalSearch className="w-full" inputClassName="bg-[#FF5722] text-white placeholder-white/70 shadow-lg shadow-orange-500/20 focus:ring-orange-500/40" />
                    </div>

                    {/* Navigation Scroll */}
                    <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide py-2">

                        {/* Group: GENERAL */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">General</h3>
                            <div className="space-y-1">
                                {generalNav.map(item => (
                                    <NavLink key={item.path} to={item.path} className={({ isActive: navActive }) => {
                                        const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                        return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive ? 'bg-orange-50 dark:bg-orange-900/10 text-[#FF5722]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`;
                                    }}>
                                        {item.icon}
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Group: UTILITIES */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Utilities</h3>
                            <div className="space-y-1">
                                {utilityNav.map(item => (
                                    <NavLink key={item.path} to={item.path} className={({ isActive: navActive }) => {
                                        const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                        return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive ? 'bg-orange-50 dark:bg-orange-900/10 text-[#FF5722]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`;
                                    }}>
                                        {item.icon}
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Group: SUPPORT */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Support</h3>
                            <div className="space-y-1">
                                {supportNav.map(item => (
                                    item.action ? (
                                        <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600">
                                            {item.icon}
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </button>
                                    ) : (
                                        <NavLink key={item.path} to={item.path} className={({ isActive: navActive }) => {
                                            const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                            return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                            ${isActive ? 'bg-orange-50 dark:bg-orange-900/10 text-[#FF5722]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`;
                                        }}>
                                            {item.icon}
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </NavLink>
                                    )
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Bottom Helper */}
                    <div className="p-6">
                        <div onClick={() => navigate('/support')} className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                            <HelpCircle size={18} />
                            <span className="font-medium text-sm">{t('sidebar.support') || 'Help & Support'}</span>
                            <span className="ml-auto bg-[#3F51B5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">8</span>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT RIGHT */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1E1F20]">

                    {/* Header */}
                    <header className="h-24 flex items-center justify-between px-8 border-b border-gray-50 dark:border-gray-800 shrink-0">
                        {/* Search Bar Removed */}
                        <div className="w-96"></div>

                        {/* Right Area */}
                        <div className="flex items-center gap-6">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors"><HelpCircle size={20} /></button>
                            <NotificationBell />

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-800">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{currentUser?.firstName} {currentUser?.lastName}</p>
                                    <p className="text-xs text-gray-500">{roleName}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer" onClick={() => navigate('/profile')}>
                                    {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{currentUser?.firstName?.[0]}</div>}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-8 relative">
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

export default EmberLayout;
