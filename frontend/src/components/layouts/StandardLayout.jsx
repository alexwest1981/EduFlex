import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Users, HelpCircle, Store, Library, ClipboardList, ShieldCheck, MessageSquare, Heart, Thermometer, BarChart2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';
import { getSafeUrl } from '../../services/api';

import ChatModule from '../../modules/chat/ChatModule';
import GlobalSearch from '../GlobalSearch';
import NotificationBell from '../NotificationBell';
import OnlineFriendsPanel from '../social/OnlineFriendsPanel';
import SidebarSection from '../SidebarSection';
import logoTop from '../../assets/images/Logo_top.png';

const StandardLayout = ({ children }) => {
    const { currentUser, logout, systemSettings, theme, toggleTheme, API_BASE } = useAppContext();
    const { isModuleActive } = useModules();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [friendsPanelOpen, setFriendsPanelOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const getProfileUrl = () => {
        return getSafeUrl(currentUser?.profilePictureUrl);
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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = {
        main: [
            { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
            { path: '/catalog', icon: <Layers size={20} />, label: t('sidebar.catalog') },
        ],
        education: [
            ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={20} />, label: t('sidebar.resource_bank') }] : []),
            ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/evaluations/manage', icon: <ClipboardList size={20} />, label: 'Utvärderingar' }] : []),
            ...(roleName === 'TEACHER' ? [{ path: '/?tab=COURSES', icon: <BookOpen size={20} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
            ...(roleName === 'STUDENT' ? [{ path: '/my-courses', icon: <BookOpen size={20} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
            ...(['STUDENT', 'TEACHER', 'ADMIN'].includes(roleName) ? [{ path: '/ebooks', icon: <Library size={20} />, label: t('sidebar.ebooks') }] : []),
        ],
        tools: [
            { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') },
            { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
            { path: '/communication', icon: <MessageSquare size={20} />, label: t('shortcuts.messages') || 'Meddelanden' },
            { path: '/support', icon: <HelpCircle size={20} />, label: t('sidebar.support') },
            ...(isModuleActive('EDUGAME') ? [{ path: '/shop', icon: <Store size={20} />, label: 'Butik' }] : []),
            ...(isModuleActive('WELLBEING_CENTER') && !['HALSOTEAM', 'ROLE_HALSOTEAM', 'ADMIN', 'ROLE_ADMIN'].includes(roleName) ? [{ path: '/wellbeing-center', icon: <Heart size={20} />, label: 'Sjukanmälan & E-hälsa' }] : [])
        ],
        admin: [
            ...(roleName === 'ADMIN' || roleName === 'ROLE_ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
            ...(roleName === 'HALSOTEAM' || roleName === 'ROLE_HALSOTEAM' ? [
                { path: '/health-dashboard', icon: <Heart size={20} className="text-rose-500" />, label: 'E-hälsa (Hälsoteam)' }
            ] : []),
            ...(isModuleActive('ANALYTICS') && (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') ? [{ path: '/analytics', icon: <BarChart2 size={20} />, label: t('sidebar.analytics') }] : []),
        ],
        rektor: [
            ...(['REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL'].includes(roleName) ? [
                { path: '/principal/dashboard', icon: <ShieldCheck size={20} />, label: 'Rektorspaket' },
                { path: '/principal/quality', icon: <Award size={20} />, label: 'Kvalitetsarbete' },
                { path: '/principal/management-reports', icon: <TrendingUp size={20} />, label: 'Ledningsrapport' },
                { path: '/principal/tools', icon: <Settings size={20} />, label: 'Verktyg & Admin' }
            ] : [])
        ],
        guardian: [
            ...(roleName === 'GUARDIAN' || roleName === 'ROLE_GUARDIAN' ? [
                { path: '/', icon: <LayoutDashboard size={20} />, label: 'Vårdnadshavare' },
                { path: '/communication', icon: <MessageSquare size={20} />, label: 'Meddelanden' },
                { path: '/calendar', icon: <Calendar size={20} />, label: 'Schema' },
                { path: '/support', icon: <HelpCircle size={20} />, label: 'Support' }
            ] : [])
        ]
    };

    return (
        <div className="flex min-h-screen text-gray-900 dark:text-[#E3E3E3] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
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

            {/* SIDEBAR - Always desktop-focused now */}
            <aside className={`
                sticky top-0 h-screen transition-all duration-300 z-50 flex flex-col
                ${sidebarOpen ? 'w-72' : 'w-20'}
                bg-white dark:bg-[#1E1F20] border-r border-gray-100 dark:border-[#282a2c]
                hidden lg:flex
            `} style={{ backdropFilter: 'none' }}>

                {/* LOGO AREA */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-[#282a2c] shrink-0">
                    <div className="flex items-center">
                        <div className="w-9 h-9 flex items-center justify-center mr-3">
                            <img src={logoTop} alt="EduFlex Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className={`font-bold text-xl tracking-tight text-gray-800 dark:text-white truncate block ${!sidebarOpen && 'lg:hidden'}`}>
                            {systemSettings?.site_name || "EduFlex"}
                        </span>
                    </div>
                </div>

                <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <SidebarSection
                        title={t('sidebar.categories.main')}
                        items={navItems.main}
                        sidebarOpen={sidebarOpen}
                    />
                    {navItems.guardian.length > 0 && (
                        <SidebarSection
                            title="Vårdnadshavare"
                            items={navItems.guardian}
                            sidebarOpen={sidebarOpen}
                        />
                    )}
                    {navItems.rektor.length > 0 && (
                        <SidebarSection
                            title="Rektorspaket"
                            items={navItems.rektor}
                            sidebarOpen={sidebarOpen}
                        />
                    )}
                    <SidebarSection
                        title={t('sidebar.categories.education')}
                        items={navItems.education}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarSection
                        title={t('sidebar.categories.tools')}
                        items={navItems.tools}
                        sidebarOpen={sidebarOpen}
                    />
                    {navItems.admin.length > 0 && (
                        <SidebarSection
                            title={t('sidebar.categories.admin')}
                            items={navItems.admin}
                            sidebarOpen={sidebarOpen}
                        />
                    )}
                </nav>

                {/* PROFILE AREA - Moved to bottom for modern feel */}
                <div className={`p-4 border-t border-gray-100 dark:border-[#282a2c] transition-all ${!sidebarOpen && 'px-2'}`}>
                    <div
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors relative group`}
                        onClick={() => navigate('/profile')}
                    >
                        <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center overflow-hidden">
                            {profileImgUrl ? (
                                <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                            )}
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-200 truncate">{currentUser?.fullName}</h3>
                                <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider truncate">{roleName}</p>
                            </div>
                        )}
                        {!sidebarOpen && (
                            <div className="absolute left-16 bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                {t('sidebar.my_profile')}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                            </div>
                        )}
                    </div>
                </div>

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
            <main className={`flex-1 transition-all duration-300 ml-0 p-0 bg-gray-50 dark:bg-[#131314]`}>

                <header className={`h-16 flex items-center justify-between px-8 sticky top-0 z-40 transition-all ${scrolled ? 'bg-white/80 dark:bg-[#1E1F20]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#282a2c]' : 'bg-transparent'
                    }`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hidden lg:block"
                            title={sidebarOpen ? t('common.minimize_menu') || "Minimera meny" : t('common.expand_menu') || "Expandera meny"}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <GlobalSearch />
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
                </header>

                <div className="flex-1 p-4 lg:p-8 relative custom-scrollbar">
                    {children}
                </div>
            </main>

            {
                isModuleActive('CHAT') && (
                    <div className="hidden lg:block">
                        <ChatModule
                            currentUser={currentUser}
                            API_BASE={API_BASE}
                            token={token}
                        />
                    </div>
                )
            }
        </div >
    );
};

export default StandardLayout;
