import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Users, HelpCircle, Store, Library, ClipboardList, ShieldCheck, MessageSquare, Heart, Thermometer, BarChart2, Brain, FolderOpen, Link2, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';
import { getSafeUrl, api } from '../../services/api';
import NotificationBell from '../NotificationBell';
import OnlineFriendsPanel from '../social/OnlineFriendsPanel';
import SidebarSection from '../SidebarSection';
import logoTop from '../../assets/images/Logo_top.png';
import { Download } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import PwaInstallPrompt from '../pwa/PwaInstallPrompt';
import { getNavigationConfig, sectionIcons } from '../../config/navigation';
import GlobalSearch from '../GlobalSearch';
import ChatModule from '../../modules/chat/ChatModule';

const StandardLayout = ({ children }) => {
    const context = useAppContext() || {};
    const { currentUser, logout, systemSettings, theme, toggleTheme, API_BASE, licenseTier } = context;
    const { isModuleActive } = useModules() || {};
    const { t } = useTranslation() || { t: k => k };
    const navigate = useNavigate();
    const location = useLocation();
    const { isInstalled, canInstall, install } = usePwaInstall() || {};
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [friendsPanelOpen, setFriendsPanelOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

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

    const navItems = getNavigationConfig(currentUser, t, isModuleActive, licenseTier, { unreadMessages: 0 });
    const [activeSection, setActiveSection] = useState(() => {
        // Try to determine active section from current path
        for (const [section, items] of Object.entries(navItems)) {
            if (items.some(item => location.pathname === item.path)) return section;
        }
        return 'main';
    });

    // Icons for the Rail component
    // (Imported at top)

    return (
        <div className="flex min-h-screen text-gray-900 dark:text-[#E3E3E3] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
            <style>{`
                @media (prefers-color-scheme: dark) {
                    .dark-mode-bg { background: var(--app-background-dark) !important; }
                }
                :root.dark body { background: var(--app-background-dark) !important; }
                .app-wrapper { background: var(--app-background); }
                .dark .app-wrapper { background: var(--app-background-dark); }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .dark.custom-scrollbar::-webkit-scrollbar-thumb { background: #2D2D2D; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                .sidebar-glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    border-right: 1px solid rgba(0, 0, 0, 0.05);
                }
                .dark.sidebar-glass {
                    background: rgba(0, 0, 0, 0.95);
                    backdrop-filter: blur(25px);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
            <div className={`fixed inset-0 -z-10 app-wrapper transition-colors duration-300 pointer-events-none`} />

            {/* NEW DUAL-TIER SIDEBAR */}
            <aside className="hidden lg:flex sticky top-0 h-screen z-50 overflow-hidden shadow-2xl sidebar-glass" style={{ width: sidebarOpen ? '320px' : '72px', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>

                {/* 1. LEFT RAIL (Icon Bar) */}
                <div className="w-[72px] bg-white/40 dark:bg-zinc-950 flex flex-col items-center py-6 shrink-0 z-10 transition-colors duration-300 border-r border-black/5 dark:border-white/5">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
                        <img src={logoTop} alt="EduFlex" className="w-7 h-7 object-contain" />
                    </div>

                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-10">
                        {Object.keys(navItems).map(sectionKey => {
                            if (navItems[sectionKey].length === 0) return null;
                            const isActive = activeSection === sectionKey;

                            return (
                                <button
                                    key={sectionKey}
                                    onClick={() => {
                                        setActiveSection(sectionKey);
                                        if (!sidebarOpen) setSidebarOpen(true);
                                    }}
                                    className={`relative group p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {sectionIcons[sectionKey]}

                                    {/* Tooltip for when sidebar is closed */}
                                    {!sidebarOpen && (
                                        <div className="absolute left-[70px] bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 uppercase tracking-widest">
                                            {t(`sidebar.categories.${sectionKey}`) || sectionKey}
                                        </div>
                                    )}

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-white rounded-l-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-auto space-y-4 pt-4 border-t border-black/5 dark:border-white/5 items-center flex flex-col w-full">
                        <button onClick={toggleTheme} className="p-3 text-gray-400 hover:text-indigo-600 transition-colors">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-rose-500 transition-colors group">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* 2. DYNAMIC NAVIGATION PANEL */}
                <div className={`flex-1 flex flex-col bg-gray-50/50 dark:bg-black transition-all duration-300 ${!sidebarOpen ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                    <div className="h-16 px-6 flex items-center border-b border-black/5 dark:border-white/5 shrink-0">
                        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                            {t(`sidebar.categories.${activeSection}`) || activeSection}
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-2">
                        {navItems[activeSection]?.map(item => {
                            const fullCurrentPath = location.pathname + location.search;
                            const isActive = item.path.includes('?')
                                ? fullCurrentPath === item.path
                                : (item.path === '/' || item.path === '/principal/dashboard'
                                    ? (location.pathname === item.path && (location.search === '' || location.search === '?tab=OVERVIEW'))
                                    : location.pathname === item.path);

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                        ? 'bg-indigo-600/5 text-indigo-600 dark:text-indigo-400 border border-indigo-600/10'
                                        : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`text-[13px] font-bold ${isActive ? 'tracking-tight' : 'font-medium'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg shadow-rose-500/20">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* PANEL FOOTER (User Info) */}
                    <div className="p-4 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-zinc-950/50 m-4 rounded-3xl group/profile transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/5 cursor-pointer active:scale-95" onClick={() => navigate('/profile')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-black shadow-sm border border-black/5 dark:border-white/10 overflow-hidden p-0.5 group-hover/profile:border-indigo-500/50 transition-colors">
                                <div className="w-full h-full rounded-[14px] overflow-hidden">
                                    {profileImgUrl ? (
                                        <img src={profileImgUrl} alt="P" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <User size={18} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black text-gray-900 dark:text-white truncate tracking-tight group-hover/profile:text-indigo-600 dark:group-hover/profile:text-indigo-400 transition-colors">{currentUser?.fullName}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{roleName}</p>
                            </div>
                            <div className="text-gray-300 dark:text-gray-700 group-hover/profile:text-indigo-500 transition-colors">
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content - responsive margins */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ml-0 p-0 bg-gray-50 dark:bg-[#000000]`}>

                <header className={`h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-all ${scrolled ? 'bg-white/80 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10' : 'bg-transparent'
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
                <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 flex items-center justify-around px-2 z-40">
                    <MobileNavItem to="/" icon={<LayoutDashboard size={20} />} label="Hem" active={location.pathname === '/'} />
                    <MobileNavItem to="/resources" icon={<BookOpen size={20} />} label="Resurser" active={location.pathname === '/resources'} />
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="flex flex-col items-center justify-center gap-1 text-gray-400"
                    >
                        <div className="p-2 rounded-xl bg-indigo-600 text-white -mt-8 shadow-lg shadow-indigo-500/20">
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
                        <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-zinc-950 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-[#282a2c] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src={logoTop} alt="" className="w-8 h-8 object-contain" />
                                    <span className="font-bold text-lg dark:text-white">EduFlex</span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-gray-100 dark:bg-[#282a2c] text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                {Object.entries(navItems).map(([key, items]) => (
                                    items.length > 0 && <SidebarSection key={key} title={t(`sidebar.categories.${key}`) || key} items={items} sidebarOpen={true} />
                                ))}

                                <div className="pt-4 space-y-2 border-t border-black/5 dark:border-white/5">
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
            } `}
    >
        {icon}
        <span className="text-[10px] font-bold">{label}</span>
    </NavLink>
);

export default StandardLayout;
