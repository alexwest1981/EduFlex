import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Users, UserCircle, LogOut, ShieldCheck, Calendar, MessageSquare, Settings2, FileQuestion, Palette, Store, Sparkles, TrendingUp, Award, GraduationCap, Heart, Download, Brain } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { api } from '../services/api';
import { useModules } from '../context/ModuleContext';
import { usePwaInstall } from '../hooks/usePwaInstall';

const Sidebar = ({ currentUser, logout, siteName, version }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [requestCount, setRequestCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const { isModuleActive } = useModules();
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

    const getMenuItems = () => {
        const role = currentUser?.role?.name || currentUser?.role || '';
        const roleName = role.toUpperCase();
        const principalRoles = ['ADMIN', 'ROLE_ADMIN', 'ROLE_REKTOR', 'REKTOR', 'PRINCIPAL'];
        const adminRoles = ['ADMIN', 'ROLE_ADMIN'];
        const teacherRoles = ['TEACHER', 'ROLE_TEACHER'];

        const dashboardPath = principalRoles.includes(roleName) ? '/principal/dashboard' : '/';

        const items = [
            { path: dashboardPath, label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} /> }
        ];

        if (teacherRoles.includes(roleName) || adminRoles.includes(roleName)) {
            items.push({ path: '/resources', label: t('sidebar.resource_bank'), icon: <BookOpen size={20} /> });
            // Direct link to My Courses for Teachers
            if (teacherRoles.includes(roleName)) {
                items.push({ path: '/?tab=COURSES', label: t('sidebar.my_courses'), icon: <BookOpen size={20} /> });
            }
            // Only show AI Quiz if module is active
            if (isModuleActive('AI_QUIZ')) {
                items.push({ path: '/ai-quiz', label: t('sidebar.ai_quiz') || 'AI Quiz', icon: <Sparkles size={20} /> });
            }
        }

        if (roleName === 'STUDENT' || roleName === 'ROLE_STUDENT') {
            items.push({ path: '/my-courses', label: t('sidebar.my_courses'), icon: <BookOpen size={20} /> });
            items.push({ path: '/ai-hub', label: 'EduAI Hub', icon: <Brain size={20} /> });
            items.push({ path: '/catalog', label: t('sidebar.catalog'), icon: <BookOpen size={20} /> });
        }

        if (adminRoles.includes(roleName) || teacherRoles.includes(roleName)) {
            items.push({ path: '/admin', label: t('sidebar.admin'), icon: <Users size={20} /> });
            items.push({ path: '/analytics', label: t('sidebar.analytics'), icon: <TrendingUp size={20} /> });
            items.push({ path: '/system', label: t('sidebar.system') || 'System', icon: <Settings2 size={20} /> });
        }

        if (adminRoles.includes(roleName)) {
            items.push({ path: '/admin/ai-audit', label: 'AI Audit', icon: <Sparkles size={20} /> });
        }

        // --- REKTOR / PRINCIPAL NAVIGATION ---
        if (principalRoles.includes(roleName)) {
            items.push({ path: '/principal/dashboard', label: 'Rektorspaket', icon: <ShieldCheck size={20} /> });
            items.push({ path: '/principal/quality', label: 'Kvalitetsarbete', icon: <Award size={20} /> });
            items.push({ path: '/principal/management-reports', label: 'Ledningsrapport', icon: <TrendingUp size={20} /> });
            items.push({ path: '/principal/tools', label: 'Verktyg & Admin', icon: <Settings2 size={20} /> });
        }
        if (roleName === 'GUARDIAN' || roleName === 'ROLE_GUARDIAN') {
            items.push({ path: '/', label: 'Barnens Dashboard', icon: <Users size={20} /> });
        }

        // Helper to check permissions
        const hasPermission = (perm) => {
            if (currentUser?.role?.isSuperAdmin || currentUser?.role?.superAdmin) return true;
            return currentUser?.role?.permissions?.includes(perm);
        };

        const isGuardian = roleName === 'GUARDIAN' || roleName === 'ROLE_GUARDIAN';
        if (!adminRoles.includes(roleName) && !isGuardian) {
            items.push({ path: '/documents', label: t('sidebar.documents'), icon: <FolderOpen size={20} /> });
        }

        // Communication with unread badge
        items.push({
            path: '/communication',
            label: t('shortcuts.messages') || 'Kommunikation',
            icon: <MessageSquare size={20} />,
            badge: unreadMessages > 0 ? unreadMessages : null
        });

        // E-books: Only for STUDENT, ADMIN, TEACHER
        const allowedEbookRoles = ['STUDENT', 'ADMIN', 'TEACHER', 'ROLE_STUDENT', 'ROLE_ADMIN', 'ROLE_TEACHER'];

        if (hasPermission('ACCESS_EBOOKS') && allowedEbookRoles.includes(roleName)) {
            items.push({ path: '/ebooks', label: t('sidebar.ebooks') || 'E-books', icon: <BookOpen size={20} /> });
        }

        if (hasPermission('ACCESS_SHOP') && isModuleActive('GAMIFICATION')) {
            items.push({ path: '/shop', label: t('sidebar.shop') || 'Butik', icon: <Store size={20} /> });
        }

        if (isModuleActive('WELLBEING_CENTER')) {
            const wellbeingRoles = ['STUDENT', 'ROLE_STUDENT', 'ADMIN', 'ROLE_ADMIN', 'ROLE_REKTOR', 'REKTOR'];
            if (wellbeingRoles.includes(roleName)) {
                items.push({ path: '/wellbeing-center', label: 'Well-being Center', icon: <Heart size={20} className="text-brand-teal" /> });
            }
            if (roleName === 'HALSOTEAM' || roleName === 'ROLE_HALSOTEAM' || adminRoles.includes(roleName)) {
                items.push({ path: '/wellbeing-center/inbox', label: 'E-hälsa Inbox', icon: <Heart size={20} className="text-brand-teal" /> });
            }
        }

        items.push({ path: '/calendar', label: t('sidebar.calendar'), icon: <Calendar size={20} /> });
        items.push({ path: '/support', label: t('sidebar.support'), icon: <FileQuestion size={20} /> });


        console.log('Sidebar Role:', role);
        console.log('Sidebar Items:', items);
        return items;
    };

    // FIX: Använd getSafeUrl för att hantera MinIO och https korrekt
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
                    <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">LMS PLATTFORM</span>
                </div>
            </div>

            {/* USER PROFILE SNIPPET (Denna saknades kanske innan) */}
            <div className="p-4 mx-4 mt-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => navigate('/profile')}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200">
                    {profileImg ? (
                        <img src={profileImg} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle size={24} className="text-indigo-500" />
                    )}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.fullName || currentUser?.username}</p>
                    <p className="text-xs text-indigo-600 font-medium truncate capitalize">{(currentUser?.role?.name || currentUser?.role || '').toLowerCase()}</p>
                </div>
                {requestCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                        {requestCount}
                    </div>
                )}
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {getMenuItems().map(item => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                            ${currentPath === item.path
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${currentPath === item.path ? 'text-indigo-600' : 'text-gray-400'}`}>
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
                ))}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-gray-100">
                {canInstall && !isInstalled && (
                    <button
                        onClick={install}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all text-sm font-bold mb-3 border border-indigo-100 group"
                    >
                        <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                            <Download size={16} className="text-indigo-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase opacity-70 leading-none mb-0.5">Applikation</p>
                            <p>Ladda ner EduFlex</p>
                        </div>
                    </button>
                )}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium mb-2"
                >
                    <LogOut size={18} /> {t('sidebar.logout')}
                </button>
                <div className="text-center text-[10px] text-gray-400 font-mono">
                    v{version || '2.0.18'}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
