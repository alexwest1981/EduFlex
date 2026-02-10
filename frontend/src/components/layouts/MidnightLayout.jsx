import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, Plus, HelpCircle, Shield, Folder, BarChart2, HardDrive, Wallet, PieChart, Activity, Store, Library, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';

import ChatModule from '../../modules/chat/ChatModule';

import GlobalSearch from '../GlobalSearch';
import NotificationBell from '../NotificationBell';
import logoTop from '../../assets/images/Logo_top.png';

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
        return url.startsWith('http') ? url : `${window.location.origin}${url} `;
    };
    const profileImgUrl = getProfileUrl();
    const token = localStorage.getItem('token');
    const roleName = currentUser?.role?.name || currentUser?.role;

    // Midnight Navigation - Top Pill Bar
    const navItems = [
        { path: '/', icon: <LayoutDashboard size={18} />, label: t('sidebar.dashboard') },
        { path: '/catalog', icon: <Wallet size={18} />, label: t('sidebar.catalog') },
        { path: '/my-courses', icon: <BookOpen size={18} />, label: t('sidebar.my_courses') },
        { path: '/ebooks', icon: <Library size={18} />, label: t('sidebar.ebooks') },
        { path: '/calendar', icon: <Calendar size={18} />, label: t('sidebar.calendar') },
        { path: '/documents', icon: <FileText size={18} />, label: t('sidebar.documents') },
        { path: '/communication', icon: <MessageSquare size={18} />, label: t('shortcuts.messages') || 'Meddelanden' },
        ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={18} />, label: t('sidebar.resource_bank') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/analytics', icon: <Activity size={18} />, label: t('sidebar.analytics') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={18} />, label: t('sidebar.admin') }] : []),
    ];

    return (
        <div className="flex items-center justify-center p-6 min-h-screen w-full text-zinc-300 font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}> {/* Rich Zinc Black */}
            <style>{`
@media(prefers - color - scheme: dark) {
                    .dark - mode - bg { background: var(--app - background - dark)!important; }
}
                : root.dark body { background: var(--app - background - dark)!important; }
                .app - wrapper { background: var(--app - background); }
                .dark.app - wrapper { background: var(--app - background - dark); }
                .midnight - scroll:: -webkit - scrollbar { width: 6px; }
                .midnight - scroll:: -webkit - scrollbar - track { background: #121212; }
                .midnight - scroll:: -webkit - scrollbar - thumb { background: #27272a; border - radius: 10px; }
                .midnight - scroll:: -webkit - scrollbar - thumb:hover { background: #3f3f46; }
`}</style>

            {/* FLOATING APP CONTAINER - Dark Zinc Card */}
            <div className="w-full min-h-screen max-w-[1700px] bg-[#121212] rounded-[32px] shadow-2xl flex flex-col border border-white/10 relative items-stretch">

                {/* HEADER - FinPoint Style */}
                <header className="h-20 flex items-center justify-between px-8 shrink-0 border-b border-white/5 bg-[#121212]/50 backdrop-blur-md sticky top-0 z-50">

                    {/* Left: Brand + Nav Pills */}
                    <div className="flex items-center gap-10">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 flex items-center justify-center">
                                <img src={logoTop} alt="EduFlex Logo" className="w-full h-full object-contain filter brightness-0 invert" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white/90">
                                {systemSettings?.site_name || "EduFlex"}
                            </span>
                        </div>

                        {/* Navigation Pills */}
                        <nav className="hidden lg:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5 backdrop-blur-sm">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive: navActive }) => {
                                        const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                        return `px - 4 py - 1.5 rounded - full text - xs font - medium transition - all duration - 300 flex items - center gap - 2
                                        ${isActive
                                                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                                                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                                            } `;
                                    }}
                                >
                                    {({ isActive: navActive }) => {
                                        const isActive = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                        return (
                                            <>
                                                {isActive && <div className="w-1.5 h-1.5 bg-[#00DC82] rounded-full animate-pulse" />}
                                                <span>{item.label}</span>
                                            </>
                                        );
                                    }}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Right: Utilities */}
                    <div className="flex items-center gap-4">
                        <GlobalSearch className="w-72" inputClassName="bg-zinc-900/50 text-white placeholder-zinc-600 border border-white/10 rounded-xl focus:border-[#00DC82]/50 focus:ring-1 focus:ring-[#00DC82]/20" />

                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        <NotificationBell />

                        <div className="flex items-center gap-3 pl-2 cursor-pointer group" onClick={() => navigate('/profile')}>
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 ring-2 ring-transparent group-hover:ring-[#00DC82]/30 transition-all">
                                {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-[#00DC82]">{currentUser?.firstName?.[0]}</div>}
                            </div>
                            <div className="hidden xl:block">
                                <p className="text-xs font-semibold text-white/90 leading-tight">{currentUser?.firstName}</p>
                                <p className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">{roleName}</p>
                            </div>
                        </div>

                        <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1">
                            <LogOut size={18} />
                        </button>
                    </div>

                </header>

                {/* MAIN CONTENT - Dark Canvas */}
                <main className="flex-1 px-8 py-6 midnight-scroll relative bg-gradient-to-b from-[#121212] to-[#0D0D0D]">
                    {/* Subtle Glows */}
                    <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00DC82] opacity-[0.02] blur-[120px] pointer-events-none rounded-full mix-blend-screen" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 opacity-[0.02] blur-[150px] pointer-events-none rounded-full mix-blend-screen" />

                    {/* Content Container */}
                    <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                        {children}
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
