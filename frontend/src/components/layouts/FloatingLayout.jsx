import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext';
import { useTranslation } from 'react-i18next';

import ChatModule from '../../modules/chat/ChatModule';
import GlobalSearch from '../GlobalSearch';

const FloatingLayout = ({ children }) => {
    const { currentUser, logout, systemSettings, theme, toggleTheme, API_BASE } = useAppContext();
    const { isModuleActive } = useModules();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const handleLogout = () => { logout(); navigate('/login'); };

    const getProfileUrl = () => {
        if (!currentUser?.profilePictureUrl) return null;
        let url = currentUser.profilePictureUrl;
        if (url.includes('minio:9000')) url = url.replace('minio:9000', 'localhost:9000');
        return url.startsWith('http') ? url : `http://localhost:8080${url}`;
    };
    const profileImgUrl = getProfileUrl();

    const gamificationActive = isModuleActive('GAMIFICATION');
    const analyticsActive = isModuleActive('ANALYTICS');
    const darkModeActive = isModuleActive('DARK_MODE');
    const token = localStorage.getItem('token');

    const roleName = currentUser?.role?.name || currentUser?.role;

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') || 'Kalender' },
        ...(roleName === 'TEACHER' || roleName === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={20} />, label: t('sidebar.resource_bank') }] : []),
        ...(roleName === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
        ...(analyticsActive && roleName === 'ADMIN' ? [{ path: '/analytics', icon: <TrendingUp size={20} />, label: t('sidebar.analytics') }] : []),
        { path: '/catalog', icon: <Layers size={20} />, label: t('sidebar.catalog') },
        { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
        { path: '/profile', icon: <User size={20} />, label: t('sidebar.my_profile') },
    ];

    return (
        <div className="flex h-screen text-gray-900 dark:text-[#E3E3E3] font-sans transition-colors duration-300 p-4 gap-4 overflow-hidden" style={{ background: 'var(--app-background)' }}>
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

            <aside className={`
                ${sidebarOpen ? 'w-64' : 'w-20'} 
                rounded-[30px] border-none shadow-none h-full bg-white dark:bg-[#1E1F20]
                transition-all duration-300 flex flex-col z-20
            `}>

                {/* LOGO AREA */}
                <div className="h-24 flex items-center px-8">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-xl mr-3 shadow-sm">
                        {systemSettings?.site_name ? systemSettings.site_name[0] : 'E'}
                    </div>
                    {sidebarOpen && <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white truncate">
                        {systemSettings?.site_name || "EduFlex"}
                    </span>}
                </div>

                {/* NO PROFILE IN SIDEBAR */}

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink key={item.path} to={item.path} className={`flex items-center px-4 py-3 transition-all duration-200 group relative
                                ${isActive ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                            `}>

                                {/* Left Marker */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-green-800 rounded-full"></div>
                                )}

                                <div className={`${!sidebarOpen && 'mx-auto'} ${isActive ? 'text-green-800 dark:text-green-400' : ''}`}>{item.icon}</div>
                                {sidebarOpen && <span className="ml-4 font-medium text-sm">{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-8 space-y-2">
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
                    {sidebarOpen && <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-2">EduFlex v1.0.3</p>}
                </div>
            </aside>

            {/* MAIN CONTENT CARD */}
            <main className="flex-1 transition-all duration-300 bg-white dark:bg-[#1E1F20] rounded-[30px] shadow-sm ml-0 overflow-y-auto h-full p-8">

                {/* TOP HEADER */}
                <div className="flex items-center justify-between mb-8">
                    {/* Global Search */}
                    <GlobalSearch />

                    {/* Profile */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col text-right">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{currentUser?.fullName}</span>
                            <span className="text-xs text-gray-500">{currentUser?.email}</span>
                        </div>
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 cursor-pointer" onClick={() => navigate('/profile')}>
                            {profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-800">{currentUser?.firstName?.[0]}</div>}
                        </div>
                    </div>
                </div>

                {children}

                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed bottom-8 right-8 p-3 bg-gray-900 text-white rounded-full shadow-lg z-50 md:hidden">
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
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

export default FloatingLayout;
