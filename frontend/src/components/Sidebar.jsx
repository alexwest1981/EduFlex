import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Users, UserCircle, LogOut, ShieldCheck, Calendar, MessageSquare, Settings2, FileQuestion, Palette, Store, Sparkles, TrendingUp, Award, GraduationCap, Heart, Download, Brain, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { api, getSafeUrl } from '../services/api';
import { useModules } from '../context/ModuleContext';
import { useAppContext } from '../context/AppContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { getNavigationConfig } from '../config/navigation';

const Sidebar = ({ currentUser, logout, siteName, version }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [requestCount, setRequestCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const { isModuleActive } = useModules();
    const { licenseTier } = useAppContext();
    const { canInstall, install, isInstalled } = usePwaInstall();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const requests = await api.connections.getRequests();
                setRequestCount(requests.length);
            } catch (e) { console.error(e); }
        };

        const fetchUnreadMessages = async () => {
            try {
                const count = await api.messages.getUnreadCount();
                setUnreadMessages(count);
            } catch (e) { console.error(e); }
        };

        fetchRequests();
        fetchUnreadMessages();
        const interval = setInterval(() => {
            fetchRequests();
            fetchUnreadMessages();
        }, 60000); // Poll count
        return () => clearInterval(interval);
    }, []);

    const navItemsConfig = getNavigationConfig(currentUser, t, isModuleActive, licenseTier, { unreadMessages });

    const sectionLabels = {
        main: t('sidebar.categories.main'),
        education: t('sidebar.categories.education'),
        tools: t('sidebar.categories.tools'),
        syv: t('sidebar.categories.syv'),
        admin: t('sidebar.categories.admin'),
        rektor: t('sidebar.categories.rektor'),
        guardian: t('sidebar.categories.guardian')
    };
    const profileImg = currentUser?.profilePictureUrl ? getSafeUrl(currentUser.profilePictureUrl) : null;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50">
            {/* LOGO AREA */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-xl text-gray-900 tracking-tight">{siteName || 'EduFlex'}</h1>
                    <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">{t('sidebar.lms_platform')}</span>
                </div>
            </div>

            {/* USER PROFILE SNIPPET */}
            <div className="p-4 mx-4 mt-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all duration-300 relative active:scale-95 group/profile" onClick={() => navigate('/profile')}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200 group-hover/profile:border-indigo-400 transition-colors">
                    {profileImg ? (
                        <img src={profileImg} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle size={24} className="text-indigo-500" />
                    )}
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover/profile:text-indigo-600 transition-colors">{currentUser?.fullName || currentUser?.username}</p>
                    <p className="text-xs text-indigo-600 font-medium truncate capitalize">{(currentUser?.role?.name || currentUser?.role || '').toLowerCase()}</p>
                </div>
                <div className="text-gray-300 group-hover/profile:text-indigo-400 transition-colors">
                    <ChevronRight size={16} />
                </div>
                {requestCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                        {requestCount}
                    </div>
                )}
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                {Object.entries(navItemsConfig).map(([sectionKey, items]) => {
                    if (!items || items.length === 0) return null;

                    return (
                        <div key={sectionKey} className="space-y-1">
                            {sectionKey !== 'main' && (
                                <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    {sectionLabels[sectionKey] || sectionKey}
                                </h3>
                            )}
                            {items.map(item => {
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
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm
                                            ${isActive
                                                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                {item.icon}
                                            </div>
                                            {item.label}
                                        </div>
                                        {item.badge && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-gray-100">
                {canInstall && !isInstalled && (
                    <button
                        onClick={install}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors mb-3"
                    >
                        <Download size={14} /> {t('sidebar.install_app')}
                    </button>
                )}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm group"
                >
                    <div className="text-gray-400 group-hover:text-red-500">
                        <LogOut size={20} />
                    </div>
                    {t('sidebar.logout')}
                </button>
                {version && (
                    <div className="mt-4 text-[10px] text-gray-400 text-center font-mono">
                        v{version}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
