import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, Layers, Menu, X, Award, Zap, Moon, Sun, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useModules } from '../context/ModuleContext';
import { useTranslation } from 'react-i18next';

import ChatModule from '../modules/chat/ChatModule';

const Layout = ({ children }) => {
    const { currentUser, logout, systemSettings, theme, toggleTheme, API_BASE } = useAppContext();
    const { isModuleActive } = useModules();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const handleLogout = () => { logout(); navigate('/login'); };

    const profileImgUrl = currentUser?.profilePictureUrl
        ? `http://127.0.0.1:8080${currentUser.profilePictureUrl}` : null;

    const gamificationActive = isModuleActive('GAMIFICATION');
    const analyticsActive = isModuleActive('ANALYTICS');
    const darkModeActive = isModuleActive('DARK_MODE');
    const token = localStorage.getItem('token');

    // FIX: Uppdatera fönstertiteln när systemSettings ändras
    useEffect(() => {
        if (systemSettings && systemSettings.site_name) {
            document.title = systemSettings.site_name;
        }
    }, [systemSettings]);

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        { path: '/calendar', icon: <Calendar size={20} />, label: t('sidebar.calendar') || 'Kalender' },
        ...(currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN' ? [{ path: '/resources', icon: <BookOpen size={20} />, label: t('sidebar.resource_bank') }] : []),
        ...(currentUser?.role === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
        ...(analyticsActive && currentUser?.role === 'ADMIN' ? [{ path: '/analytics', icon: <TrendingUp size={20} />, label: t('sidebar.analytics') }] : []),
        { path: '/catalog', icon: <Layers size={20} />, label: t('sidebar.catalog') },
        { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
        { path: '/profile', icon: <User size={20} />, label: t('sidebar.my_profile') },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] font-sans transition-colors duration-300">

            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-[#1E1F20] border-r border-gray-200 dark:border-[#282a2c] transition-all duration-300 flex flex-col fixed h-full z-20 shadow-sm`}>

                {/* LOGO AREA - NU MED DYNAMISKT NAMN */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-[#282a2c]">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-xl mr-3 shadow-sm">
                        {systemSettings?.site_name ? systemSettings.site_name[0] : 'E'}
                    </div>
                    {sidebarOpen && <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white truncate">
                        {systemSettings?.site_name || "EduFlex"}
                    </span>}
                </div>

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
                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">{currentUser?.role}</span>
                        </div>
                    )}

                    {sidebarOpen && gamificationActive && (
                        <div className="mt-4 w-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-[#282a2c] dark:to-[#282a2c] border border-amber-200 dark:border-[#3c4043] rounded-xl p-3 flex items-center justify-between animate-in zoom-in duration-300">
                            <div className="flex items-center gap-2">
                                <div className="bg-white dark:bg-[#3c4043] p-1.5 rounded-full text-amber-600 dark:text-amber-400 shadow-sm"><Award size={16} /></div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">Level {currentUser?.level || 1}</p>
                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-300">{currentUser?.role === 'STUDENT' ? t('auth.student') : currentUser?.role === 'TEACHER' ? t('auth.teacher') : t('auth.admin')}</p>
                                </div>
                            </div>
                            <div className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1">
                                <Zap size={12} fill="currentColor" /> {currentUser?.points || 0}
                            </div>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink key={item.path} to={item.path} className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group 
                                ${isActive
                                    ? 'bg-gray-900 text-white dark:bg-[#004A77] dark:text-[#c2e7ff]'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2c] hover:text-gray-900 dark:hover:text-gray-200'
                                }`}>
                                <div className={`${!sidebarOpen && 'mx-auto'}`}>{item.icon}</div>
                                {sidebarOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
                                {!sidebarOpen && <div className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">{item.label}</div>}
                            </NavLink>
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
                    {sidebarOpen && <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-2">EduFlex v1.0.2</p>}
                </div>
            </aside>

            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8 h-full overflow-y-auto bg-gray-50 dark:bg-[#131314]`}>
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                {children}
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

export default Layout;