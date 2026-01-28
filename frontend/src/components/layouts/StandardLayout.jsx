import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Users, HelpCircle, Store, Library } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';

import ChatModule from '../../modules/chat/ChatModule';
import NotificationBell from '../NotificationBell';
import OnlineFriendsPanel from '../social/OnlineFriendsPanel';
import { MobileSidebar, MobileHeader, MobileBottomNav } from './MobileComponents';

const StandardLayout = ({ children }) => {
    const { currentUser, logout, systemSettings, theme, toggleTheme, API_BASE } = useAppContext();
    const { isModuleActive } = useModules();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [friendsPanelOpen, setFriendsPanelOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [location.pathname]);

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

    // --- ACTIVITY TRACKING ---
    useEffect(() => {
        if (!currentUser) return;

        const pingActivity = async () => {
            try {
                // Assuming api.users.ping() exists and updates lastActive
                if (window.api?.users?.ping) {
                    await window.api.users.ping();
                } else {
                    // Fallback if api is imported directly (which it is)
                    const { api } = await import('../../services/api');
                    await api.users.ping();
                }
            } catch (err) {
                console.error("Activity ping failed", err);
            }
        };

        // Ping immediately on mount/login
        pingActivity();

        // Ping every 5 minutes
        const intervalId = setInterval(pingActivity, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [currentUser]);

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') },
        { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
        { path: '/catalog', icon: <Layers size={20} />, label: t('sidebar.catalog') },
        { path: '/ebooks', icon: <Library size={20} />, label: t('sidebar.library') },
        ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={20} />, label: t('sidebar.resource_bank') }] : []),
        ...(roleName === 'TEACHER' ? [{ path: '/?tab=COURSES', icon: <BookOpen size={20} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
        ...(roleName === 'STUDENT' ? [{ path: '/my-courses', icon: <BookOpen size={20} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
        ...(analyticsActive && roleName === 'ADMIN' ? [{ path: '/analytics', icon: <TrendingUp size={20} />, label: t('sidebar.analytics') }] : []),
        { path: '/support', icon: <HelpCircle size={20} />, label: t('sidebar.support') },
        { path: '/profile', icon: <User size={20} />, label: t('sidebar.my_profile') },
    ];

    return (
        <div className="flex h-screen text-gray-900 dark:text-[#E3E3E3] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
            <style>{`
                @media (prefers-color-scheme: dark) {
                    .dark-mode-bg { background: var(--app-background-dark) !important; }
                }
                :root.dark body { background: var(--app-background-dark) !important; }
                /* Helper for React wrapper */
                .app-wrapper { background: var(--app-background); }
                .dark .app-wrapper { background: var(--app-background-dark); }
            `}</style>
            <div className={`fixed inset-0 -z-10 app-wrapper transition-colors duration-300 pointer-events-none`} />

            {/* Mobile overlay */}
            {/* Mobile Sidebar (New Theme) */}
            <MobileSidebar
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                navItems={navItems}
                friendsPanelOpen={friendsPanelOpen}
                setFriendsPanelOpen={setFriendsPanelOpen}
            />

            {/* Desktop Sidebar */}
            <aside className={`
                hidden lg:flex
                ${sidebarOpen ? 'w-64' : 'w-20'}
                bg-white dark:bg-gray-900 
                lg:bg-card lg:dark:bg-card-dark 
                border-none
                transition-all duration-300 flex-col fixed h-full z-40 
                shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)]
            `} style={{ backdropFilter: 'var(--card-backdrop)' }}>

                {/* LOGO AREA */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-[#282a2c]">
                    <div className="flex items-center">
                        <img
                            src="/src/assets/images/Logo_top.png"
                            alt="EduFlex"
                            className="w-8 h-8 object-contain mr-3"
                        />
                        {/* Show text on mobile always, on desktop only when expanded */}
                        <span className={`font-bold text-xl tracking-tight text-gray-800 dark:text-white truncate block ${!sidebarOpen && 'lg:hidden'}`}>
                            {systemSettings?.site_name || "EduFlex"}
                        </span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-lg text-gray-500 dark:text-gray-400 transition-colors lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* PROFILE AREA (IN SIDEBAR FOR STANDARD) */}
                <div className={`p-6 flex flex-col items-center border-b border-gray-100 dark:border-[#282a2c] transition-all ${!sidebarOpen && 'px-2'}`}>
                    <div className="relative mb-3 group cursor-pointer" onClick={() => navigate('/profile')}>
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#282a2c] border-2 border-gray-200 dark:border-[#3c4043] flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-2xl overflow-hidden">
                            {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <span>{currentUser?.firstName?.[0]}</span>}
                        </div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#1E1F20] rounded-full"></div>
                    </div>
                    {sidebarOpen && (
                        <div className="text-center animate-in fade-in">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-200 truncate max-w-[200px]">{currentUser?.fullName}</h3>
                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">{roleName}</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item, index) => {
                        // Fix for Enterprise/Whitelabel sub-routes keeping Admin active
                        const isActive = location.pathname === item.path ||
                            (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                        const showSeparator = (
                            (item.path === '/resources' && (roleName === 'TEACHER' || roleName === 'ADMIN')) ||
                            (item.path === '/admin' && roleName === 'ADMIN') ||
                            item.path === '/profile'
                        );

                        return (
                            <React.Fragment key={item.path}>
                                {showSeparator && (
                                    <div className="my-3 border-t border-gray-200 dark:border-[#3c4043]"></div>
                                )}
                                <NavLink
                                    to={item.path}
                                    className={({ isActive: navActive }) => {
                                        const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                        return `relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-gradient-to-r from-indigo-50 to-transparent dark:from-[#333537] dark:to-transparent text-indigo-700 dark:text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c] hover:text-gray-900 dark:hover:text-gray-200 hover:scale-[1.02]'
                                            }`;
                                    }}
                                >
                                    {({ isActive: navActive }) => {
                                        const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                        return (
                                            <>
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-white rounded-r-full"></div>
                                                )}

                                                <div className={`${!sidebarOpen && 'mx-auto'} ${isActive ? 'scale-110' : ''} transition-transform`}>
                                                    {React.cloneElement(item.icon, { size: 22 })}
                                                </div>

                                                {sidebarOpen && (
                                                    <span className={`ml-3 font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
                                                        {item.label}
                                                    </span>
                                                )}

                                                {!sidebarOpen && (
                                                    <div className="absolute left-16 bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                                        {item.label}
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    }}
                                </NavLink>
                            </React.Fragment>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-[#282a2c] space-y-2">
                    {darkModeActive && (
                        <button onClick={toggleTheme} className={`flex items-center w-full px-3 py-2 rounded-xl transition-colors bg-gray-50 dark:bg-[#282a2c] hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-300 ${!sidebarOpen && 'justify-center'}`}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            {sidebarOpen && <span className="ml-3 font-medium text-sm">{theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}</span>}
                        </button>
                    )}
                    <button onClick={handleLogout} className={`flex items-center w-full px-3 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors ${!sidebarOpen && 'justify-center'}`}>
                        <LogOut size={20} />
                        {sidebarOpen && <span className="ml-3 font-bold text-sm">{t('sidebar.logout')}</span>}
                    </button>
                    {sidebarOpen && <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center flex justify-center mt-2">EduFlex v1.0.3</p>}
                </div>
            </aside>

            {/* Main content - responsive margins */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ml-0 p-0 lg:p-8 pb-20 lg:pb-8 h-full overflow-y-auto bg-gray-50 dark:bg-[#131314]`}>

                <MobileHeader
                    friendsPanelOpen={friendsPanelOpen}
                    setFriendsPanelOpen={setFriendsPanelOpen}
                />

                {/* Desktop Header */}
                <div className="hidden lg:flex mb-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Desktop sidebar toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                            title={sidebarOpen ? t('common.minimize_menu') || "Minimera meny" : t('common.expand_menu') || "Expandera meny"}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 relative">
                        {/* Online Friends Toggle */}
                        <button
                            onClick={() => setFriendsPanelOpen(!friendsPanelOpen)}
                            className={`relative p-2.5 rounded-full transition-colors ${friendsPanelOpen ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-gray-100 text-gray-500 dark:text-gray-400 dark:hover:bg-[#282a2c]'}`}
                            title={t('common.online_friends') || "Online Vänner"}
                        >
                            <Users size={20} />
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </button>
                        <OnlineFriendsPanel isOpen={friendsPanelOpen} onClose={() => setFriendsPanelOpen(false)} />

                        <NotificationBell />
                    </div>
                </div>

                <div className="px-4 lg:px-0">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav onMenuOpen={() => setMobileSidebarOpen(true)} />

            {isModuleActive('CHAT') && (
                <div className="hidden lg:block">
                    <ChatModule
                        currentUser={currentUser}
                        API_BASE={API_BASE}
                        token={token}
                    />
                </div>
            )}
        </div >
    );
};

export default StandardLayout;
