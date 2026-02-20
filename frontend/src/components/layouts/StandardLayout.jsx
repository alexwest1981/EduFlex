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
import { Download } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import PwaInstallPrompt from '../pwa/PwaInstallPrompt';

const StandardLayout = ({ children }) => {
    const context = useAppContext() || {};
    const { currentUser, logout, systemSettings, theme, toggleTheme, API_BASE } = context;
    const { isModuleActive } = useModules() || {};
    const { t } = useTranslation() || { t: k => k };
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [friendsPanelOpen, setFriendsPanelOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { isInstalled, canInstall, install } = usePwaInstall() || {};

    const handleInstall = () => {
        if (canInstall) {
            install();
        } else {
            alert("För att installera appen på din enhet:\n\niOS: Klicka på dela-knappen och välj 'Lägg till på hemskärmen'.\n\nAndroid/Chrome: Klicka på de tre punkterna i webbläsaren och välj 'Installera app'.");
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const getProfileUrl = () => {
        return getSafeUrl(currentUser?.profilePictureUrl);
    };
    const profileImgUrl = getProfileUrl();

    const gamificationActive = isModuleActive('GAMIFICATION');
    const analyticsActive = isModuleActive('ANALYTICS');
    const darkModeActive = isModuleActive('DARK_MODE');
    const token = localStorage.getItem('token');

    const rawRole = currentUser?.role?.name || currentUser?.role || '';
    const roleName = typeof rawRole === 'string' ? rawRole.toUpperCase() : '';
    const isAdmin = roleName.includes('ADMIN') || roleName.includes('SUPERADMIN') || currentUser?.role?.isSuperAdmin || currentUser?.role?.superAdmin;

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
            ...(roleName.includes('TEACHER') || isAdmin ? [{ path: '/resources', icon: <BookOpen size={20} />, label: t('sidebar.resource_bank') }] : []),
            ...(roleName.includes('TEACHER') || isAdmin ? [{ path: '/evaluations/manage', icon: <ClipboardList size={20} />, label: 'Utvärderingar' }] : []),
            ...(roleName === 'TEACHER' ? [{ path: '/?tab=COURSES', icon: <BookOpen size={20} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
            ...(roleName === 'STUDENT' ? [{ path: '/my-courses', icon: <BookOpen size={20} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
            ...(roleName === 'STUDENT' ? [{ path: '/adaptive-learning', icon: <TrendingUp size={20} />, label: 'Min Lärväg' }] : []),
            ...(roleName.includes('STUDENT') || roleName.includes('TEACHER') || isAdmin ? [{ path: '/ebooks', icon: <Library size={20} />, label: t('sidebar.ebooks') }] : []),
        ],
        tools: [
            { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') },
            { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
            { path: '/communication', icon: <MessageSquare size={20} />, label: t('shortcuts.messages') || 'Meddelanden' },
            { path: '/support', icon: <HelpCircle size={20} />, label: t('sidebar.support') },
            ...(isModuleActive('EDUGAME') ? [{ path: '/shop', icon: <Store size={20} />, label: 'Butik' }] : []),
            ...(isModuleActive('WELLBEING_CENTER') && !['HALSOTEAM', 'ROLE_HALSOTEAM'].includes(roleName) ? [{ path: '/wellbeing-center', icon: <Heart size={20} />, label: 'Sjukanmälan & E-hälsa' }] : [])
        ],
        admin: [
            ...(isAdmin ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
            ...(roleName === 'HALSOTEAM' || roleName === 'ROLE_HALSOTEAM' ? [
                { path: '/health-dashboard', icon: <Heart size={20} className="text-rose-500" />, label: 'E-hälsa (Hälsoteam)' }
            ] : []),
            ...(isModuleActive('ANALYTICS') && isAdmin ? [{ path: '/analytics', icon: <BarChart2 size={20} />, label: t('sidebar.analytics') }] : []),
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

                    {!isInstalled && (
                        <button onClick={handleInstall} className={`flex items-center w-full px-3 py-2 rounded-xl transition-colors bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ${!sidebarOpen && 'justify-center'}`}>
                            <Download size={20} />
                            {sidebarOpen && <span className="ml-3 font-bold text-sm">Installera App</span>}
                        </button>
                    )}
                    <button onClick={handleLogout} className={`flex items-center w-full px-3 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors ${!sidebarOpen && 'justify-center'}`}>
                        <LogOut size={20} />
                        {sidebarOpen && <span className="ml-3 font-bold text-sm">{t('sidebar.logout')}</span>}
                    </button>
                    {sidebarOpen && <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center flex justify-center mt-2">EduFlex v2.0.18</p>}
                </div>
            </aside>

            {/* Main content - responsive margins */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ml-0 p-0 bg-gray-50 dark:bg-[#131314]`}>

                <header className={`h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-all ${scrolled ? 'bg-white/80 dark:bg-[#1E1F20]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#282a2c]' : 'bg-transparent'
                    }`}>
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 mr-4">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setMobileMenuOpen(true);
                                } else {
                                    setSidebarOpen(!sidebarOpen);
                                }
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
                            title={sidebarOpen ? t('common.minimize_menu') || "Minimera meny" : t('common.expand_menu') || "Expandera meny"}
                        >
                            {sidebarOpen ? <X size={20} className="hidden lg:block" /> : <Menu size={20} className="hidden lg:block" />}
                            <Menu size={20} className="lg:hidden" />
                        </button>
                        <GlobalSearch className="w-full max-w-[140px] xs:max-w-[180px] sm:max-w-xs lg:w-96" />
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

                <div className="flex-1 p-4 lg:p-8 relative custom-scrollbar overflow-x-hidden">
                    {children}
                </div>

                {/* MOBILE BOTTOM NAV */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#1E1F20]/80 backdrop-blur-lg border-t border-gray-100 dark:border-[#282a2c] flex items-center justify-around px-2 z-40">
                    <MobileNavItem to="/" icon={<LayoutDashboard size={20} />} label="Hem" active={location.pathname === '/'} />
                    <MobileNavItem to="/resources" icon={<BookOpen size={20} />} label="Resurser" active={location.pathname === '/resources'} />
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="flex flex-col items-center justify-center gap-1 text-gray-400"
                    >
                        <div className="p-2 rounded-xl bg-indigo-600 text-white -mt-8 shadow-lg shadow-indigo-500/30">
                            <Menu size={24} />
                        </div>
                        <span className="text-[10px] font-bold">Meny</span>
                    </button>
                    <MobileNavItem to="/communication" icon={<MessageSquare size={20} />} label="Chatt" active={location.pathname === '/communication'} />
                    <MobileNavItem to="/profile" icon={<User size={20} />} label="Profil" active={location.pathname === '/profile'} />
                </div>

                {/* MOBILE DRAWER OVERLAY */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-[#1E1F20] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-[#282a2c] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src={logoTop} alt="" className="w-8 h-8 object-contain" />
                                    <span className="font-bold text-lg dark:text-white">EduFlex</span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-gray-100 dark:bg-[#282a2c] text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <SidebarSection title="Navigering" items={navItems.main} sidebarOpen={true} />
                                {navItems.admin.length > 0 && <SidebarSection title="Admin" items={navItems.admin} sidebarOpen={true} />}
                                {navItems.rektor.length > 0 && <SidebarSection title="Rektor" items={navItems.rektor} sidebarOpen={true} />}
                                <SidebarSection title="Verktyg" items={navItems.tools} sidebarOpen={true} />

                                <div className="pt-4 space-y-2">
                                    {!isInstalled && (
                                        <button onClick={() => { handleInstall(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold">
                                            <Download size={20} />
                                            Ladda ner appen
                                        </button>
                                    )}
                                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#282a2c] text-gray-600 dark:text-gray-300 font-bold">
                                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                        {theme === 'dark' ? 'Ljust läge' : 'Mörkt läge'}
                                    </button>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-600 font-bold">
                                        <LogOut size={20} />
                                        Logga ut
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
            <PwaInstallPrompt />
        </div >
    );
};

const MobileNavItem = ({ to, icon, label, active }) => (
    <NavLink
        to={to}
        className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
    >
        {icon}
        <span className="text-[10px] font-bold">{label}</span>
    </NavLink>
);

export default StandardLayout;
