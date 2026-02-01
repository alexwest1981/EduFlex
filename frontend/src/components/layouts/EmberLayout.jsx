import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp, Bell, Search, Plus, HelpCircle, Shield, Folder, BarChart2, HardDrive, Wallet, Music, Play, Pause, Heart, Speaker, Store, Library, ClipboardList } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';
import ChatModule from '../../modules/chat/ChatModule';
import GlobalSearch from '../GlobalSearch';
import NotificationBell from '../NotificationBell';
import SidebarSection from '../SidebarSection';
import logoTop from '../../assets/images/Logo_top.png';
import { ShieldCheck } from 'lucide-react';

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
        return url.startsWith('http') ? url : `${window.location.origin}${url}`;
    };
    const profileImgUrl = getProfileUrl();
    const token = localStorage.getItem('token');
    const roleName = currentUser?.role?.name || currentUser?.role;

    const navItems = {
        main: [
            { path: '/', icon: <LayoutDashboard size={18} />, label: t('sidebar.dashboard') },
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
            { path: '/support', icon: <HelpCircle size={18} />, label: t('sidebar.support') },
        ],
        admin: [
            ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={18} />, label: t('sidebar.admin') }] : []),
            ...(isModuleActive('ANALYTICS') && roleName === 'ADMIN' ? [{ path: '/analytics', icon: <TrendingUp size={18} />, label: t('sidebar.analytics') }] : []),
        ]
    };


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
                            <div className="w-9 h-9 flex items-center justify-center">
                                <img src={logoTop} alt="EduFlex Logo" className="w-full h-full object-contain" />
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
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 scrollbar-hide">
                        <SidebarSection
                            title={t('sidebar.categories.main')}
                            items={navItems.main}
                            sidebarOpen={true}
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

                    {/* Bottom Profile Helper */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                        <div
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center justify-center overflow-hidden shrink-0">
                                {profileImgUrl ? (
                                    <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={18} className="text-[#FF5722]" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser?.firstName}</p>
                                <p className="text-[10px] uppercase font-bold text-[#FF5722] tracking-wider">{roleName}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full mt-4 flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors text-xs font-bold"
                        >
                            <LogOut size={16} /> {t('sidebar.logout')}
                        </button>
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
