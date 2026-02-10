import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, Plus, HelpCircle, Shield, Folder, BarChart2, HardDrive, Wallet, Music, Play, Pause, Heart, Speaker, Store, Library, ClipboardList, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';
import ChatModule from '../../modules/chat/ChatModule';
import GlobalSearch from '../GlobalSearch';
import NotificationBell from '../NotificationBell';
import SidebarSection from '../SidebarSection';
import logoTop from '../../assets/images/Logo_top.png';
import { ShieldCheck } from 'lucide-react';

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
        return url.startsWith('http') ? url : `${window.location.origin}${url} `;
    };
    const profileImgUrl = getProfileUrl();
    const token = localStorage.getItem('token');
    const roleName = currentUser?.role?.name || currentUser?.role;

    const navItems = {
        main: [
            { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
            { path: '/catalog', icon: <Layers size={18} />, label: t('sidebar.catalog') },
        ],
        education: [
            ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={18} />, label: t('sidebar.resource_bank') }] : []),
            ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/evaluations/manage', icon: <ClipboardList size={18} />, label: 'Utvärderingar' }] : []),
            ...(roleName === 'TEACHER' ? [{ path: '/?tab=COURSES', icon: <BookOpen size={18} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
            ...(roleName === 'STUDENT' ? [{ path: '/my-courses', icon: <BookOpen size={18} />, label: t('sidebar.my_courses') || 'Mina kurser' }] : []),
            { path: '/ebooks', icon: <Library size={18} />, label: t('sidebar.ebooks') },
        ],
        tools: [
            { path: '/calendar', icon: <Calendar size={18} />, label: t('sidebar.calendar') },
            { path: '/documents', icon: <FileText size={18} />, label: t('sidebar.documents') },
            { path: '/communication', icon: <MessageSquare size={18} />, label: t('shortcuts.messages') || 'Meddelanden' },
            { path: '/support', icon: <HelpCircle size={18} />, label: t('sidebar.support') },
        ],
        admin: [
            ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
            ...(isModuleActive('ANALYTICS') && roleName === 'ADMIN' ? [{ path: '/analytics', icon: <BarChart2 size={20} />, label: t('sidebar.analytics') }] : []),
        ]
    };


    return (
        <div className="flex items-center justify-center p-8 min-h-screen w-full text-[#1E1E1E] font-sans transition-colors duration-300" style={{ background: 'var(--app-background)' }}>
            <style>{`
@media(prefers - color - scheme: dark) {
                    .dark - mode - bg { background: var(--app - background - dark)!important; }
}
                : root.dark body { background: var(--app - background - dark)!important; }
                .app - wrapper { background: var(--app - background); }
                .dark.app - wrapper { background: var(--app - background - dark); }
`}</style>
            <div className={`fixed inset - 0 - z - 10 app - wrapper transition - colors duration - 300 pointer - events - none`} />

            {/* CONSOLE CONTAINER - High Contrast */}
            <div className="w-full min-h-screen max-w-[1600px] bg-[#F2F3F5] dark:bg-[#121212] rounded-[40px] shadow-2xl flex flex-row relative ring-4 ring-black/5 dark:ring-white/5">

                {/* BLACK SIDEBAR - The "Console" Strip */}
                <aside className="w-24 lg:w-72 bg-[#0A0A0A] text-white flex flex-col shrink-0 relative z-10 transition-all duration-300 self-stretch">

                    {/* Brand / Logo */}
                    <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img src={logoTop} alt="EduFlex Logo" className="w-full h-full object-contain" />
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
                    <div className="flex-1 px-4 lg:px-6 py-4 space-y-6 scrollbar-hide flex flex-col items-center lg:items-stretch transition-all duration-300">
                        <SidebarSection
                            title={t('sidebar.categories.main')}
                            items={navItems.main}
                            sidebarOpen={true} // Voltage is usually fixed on desktop
                        />
                        <SidebarSection
                            title={t('sidebar.categories.education')}
                            items={navItems.education}
                            sidebarOpen={true}
                        />
                        <SidebarSection
                            title={t('sidebar.categories.tools')}
                            items={navItems.tools}
                            sidebarOpen={true}
                        />
                        {navItems.admin.length > 0 && (
                            <SidebarSection
                                title={t('sidebar.categories.admin')}
                                items={navItems.admin}
                                sidebarOpen={true}
                            />
                        )}
                    </div>

                    {/* User Profile Mini - Bottom */}
                    <div className="p-6 mt-auto border-t border-gray-800">
                        <div
                            className="flex items-center justify-center lg:justify-start gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-colors group relative"
                            onClick={() => navigate('/profile')}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-[#CCFF00] transition-colors shrink-0">
                                {profileImgUrl ? (
                                    <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center font-bold text-xs text-white">
                                        {currentUser?.firstName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="hidden lg:block min-w-0">
                                <p className="text-sm font-bold text-white truncate">{currentUser?.firstName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{roleName}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full mt-4 flex items-center justify-center lg:justify-start gap-3 px-4 py-2 text-[#FF4444] hover:bg-red-500/10 rounded-xl transition-colors text-xs font-bold"
                        >
                            <LogOut size={18} /> <span className="hidden lg:block">{t('sidebar.logout')}</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT RIGHT */}
                <div className="flex-1 flex flex-col bg-[#F2F3F5] dark:bg-[#121212] relative">

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
                    <main className="flex-1 p-4 lg:p-8 relative">
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
