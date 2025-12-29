import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, User, Settings, LogOut,
    Layers, Menu, X, Award, Zap
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
    const { currentUser, logout, systemSettings } = useAppContext();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // FIX: Bygg korrekt URL för profilbild
    // Vi lägger till serverns adress framför sökvägen som kommer från databasen
    const profileImgUrl = currentUser?.profilePictureUrl
        ? `http://127.0.0.1:8080${currentUser.profilePictureUrl}`
        : null;

    // Kontrollera om moduler är aktiverade
    const gamificationActive = systemSettings && systemSettings['gamification_enabled'] === 'true';

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        ...(currentUser?.role === 'ADMIN' ? [{ path: '/admin', icon: <Settings size={20} />, label: t('sidebar.admin') }] : []),
        { path: '/catalog', icon: <Layers size={20} />, label: t('sidebar.catalog') },
        { path: '/documents', icon: <FileText size={20} />, label: t('sidebar.documents') },
        { path: '/profile', icon: <User size={20} />, label: t('sidebar.my_profile') },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans transition-colors dark:bg-gray-900 dark:text-gray-100">

            {/* --- SIDEBAR --- */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col fixed h-full z-20 shadow-sm`}>

                {/* LOGO */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg shadow-indigo-200 dark:shadow-none">
                        E
                    </div>
                    {sidebarOpen && <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white">EduFlex</span>}
                </div>

                {/* USER PROFILE CARD */}
                <div className={`p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700 transition-all ${!sidebarOpen && 'px-2'}`}>
                    <div className="relative mb-3 group cursor-pointer" onClick={() => navigate('/profile')}>
                        {/* Cirkel för bild */}
                        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-gray-700 border-2 border-indigo-100 dark:border-gray-600 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                            {profileImgUrl ? (
                                <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <span>{currentUser?.firstName?.[0]}</span>
                            )}
                        </div>
                        {/* Online-indikator */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>

                    {sidebarOpen && (
                        <div className="text-center animate-in fade-in">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[200px]">{currentUser?.fullName}</h3>
                            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">{currentUser?.role}</span>
                        </div>
                    )}

                    {/* --- GAMIFICATION MODUL (Visas ENDAST om aktiverad i Admin) --- */}
                    {sidebarOpen && gamificationActive && (
                        <div className="mt-4 w-full bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 flex items-center justify-between animate-in zoom-in duration-300">
                            <div className="flex items-center gap-2">
                                <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full text-orange-500 shadow-sm"><Award size={16}/></div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase">Level 5</p>
                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Expert</p>
                                </div>
                            </div>
                            <div className="text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center gap-1">
                                <Zap size={12} fill="currentColor"/> 2.4k
                            </div>
                        </div>
                    )}
                </div>

                {/* MENY */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                            >
                                <div className={`${!sidebarOpen && 'mx-auto'}`}>
                                    {item.icon}
                                </div>
                                {sidebarOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
                                {!sidebarOpen && <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">{item.label}</div>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* LOGOUT */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${!sidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="ml-3 font-bold text-sm">{t('sidebar.logout')}</span>}
                    </button>
                    {sidebarOpen && <p className="text-[10px] text-gray-300 text-center mt-2">EduFlex v1.0.2</p>}
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8 h-full overflow-y-auto`}>

                {/* Header med meny-knapp */}
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                        {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
                    </button>
                </div>

                {children}
            </main>
        </div>
    );
};

export default Layout;