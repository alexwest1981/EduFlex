import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Users, UserCircle, LogOut, ShieldCheck, Calendar, MessageSquare, Settings2, FileQuestion, Palette, Store, Sparkles, TrendingUp, Award, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { api } from '../services/api';
import { useModules } from '../context/ModuleContext';

const Sidebar = ({ currentUser, logout, siteName, version }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [requestCount, setRequestCount] = useState(0);
    const { isModuleActive } = useModules();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const requests = await api.connections.getRequests();
                setRequestCount(requests.length);
            } catch (e) { console.error(e); }
        };
        fetchRequests();
        const interval = setInterval(fetchRequests, 60000); // Poll count
        return () => clearInterval(interval);
    }, []);

    const getMenuItems = () => {
        const role = currentUser?.role?.name || currentUser?.role;
        const items = [
            { path: '/', label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} /> }
        ];

        if (role === 'TEACHER' || role === 'ADMIN') {
            items.push({ path: '/resources', label: t('sidebar.resource_bank'), icon: <BookOpen size={20} /> });
            // Direct link to My Courses for Teachers
            if (role === 'TEACHER') {
                items.push({ path: '/?tab=COURSES', label: t('sidebar.my_courses'), icon: <BookOpen size={20} /> });
            }
            // Only show AI Quiz if module is active
            if (isModuleActive('AI_QUIZ')) {
                items.push({ path: '/ai-quiz', label: t('sidebar.ai_quiz') || 'AI Quiz', icon: <Sparkles size={20} /> });
            }
        }

        if (role === 'STUDENT') {
            items.push({ path: '/my-courses', label: t('sidebar.my_courses'), icon: <BookOpen size={20} /> });
            items.push({ path: '/catalog', label: t('sidebar.catalog'), icon: <BookOpen size={20} /> });
        }
        if (role === 'ADMIN' || role === 'TEACHER') {
            items.push({ path: '/admin', label: t('sidebar.admin'), icon: <Users size={20} /> });
            items.push({ path: '/analytics', label: t('sidebar.analytics'), icon: <TrendingUp size={20} /> });
            items.push({ path: '/system', label: t('sidebar.system') || 'System', icon: <Settings2 size={20} /> });
        }
        if (role !== 'ADMIN') {
            items.push({ path: '/documents', label: t('sidebar.documents'), icon: <FolderOpen size={20} /> });
        }
        items.push({ path: '/ebooks', label: t('sidebar.ebooks') || 'E-books', icon: <BookOpen size={20} /> });
        items.push({ path: '/calendar', label: t('sidebar.calendar'), icon: <Calendar size={20} /> });
        items.push({ path: '/support', label: t('sidebar.support'), icon: <FileQuestion size={20} /> });


        console.log('Sidebar Role:', role);
        console.log('Sidebar Items:', items);
        return items;
    };

    // FIX: Hjälpfunktion för att bygga bild-URL
    const getProfileImage = () => {
        if (!currentUser?.profilePictureUrl) return null;
        let url = currentUser.profilePictureUrl;
        if (url.includes('minio:9000')) url = url.replace('minio:9000', 'localhost:9000');

        return url.startsWith('http')
            ? url
            : `${window.location.origin}${url}`;
    };

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
                    {getProfileImage() ? (
                        <img src={getProfileImage()} alt="Profil" className="w-full h-full object-cover" />
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
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                            ${currentPath === item.path
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <div className={`${currentPath === item.path ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {item.icon}
                        </div>
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium mb-2"
                >
                    <LogOut size={18} /> {t('sidebar.logout')}
                </button>
                <div className="text-center text-[10px] text-gray-400 font-mono">
                    v{version || '1.0.0'}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
