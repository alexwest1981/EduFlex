import React from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Users, UserCircle, LogOut, ShieldCheck, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // <---

const Sidebar = ({ currentUser, logout, siteName, version }) => {
    const { t } = useTranslation(); // <---
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const getMenuItems = () => {
        const role = currentUser?.role;
        const items = [
            { path: '/', label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20}/> }
        ];

        if (role === 'STUDENT') {
            items.push({ path: '/catalog', label: t('sidebar.catalog'), icon: <BookOpen size={20}/> });
        }

        if (role === 'ADMIN') {
            items.push({ path: '/admin', label: t('sidebar.admin'), icon: <Users size={20}/> });
        }

        if (role !== 'ADMIN') {
            items.push({ path: '/documents', label: t('sidebar.documents'), icon: <FolderOpen size={20}/> });
        }

        // Alla kan se kalender (om du vill)
        // items.push({ path: '/calendar', label: t('sidebar.calendar'), icon: <Calendar size={20}/> });

        items.push({ path: '/profile', label: t('sidebar.my_profile'), icon: <UserCircle size={20}/> });

        return items;
    };

    const logoLetter = siteName ? siteName.charAt(0).toUpperCase() : 'E';

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 transition-all duration-300">
            <div className="h-16 flex items-center px-8 border-b border-gray-100 overflow-hidden">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-200 shadow-md shrink-0">
                    <span className="text-white font-bold text-xl">{logoLetter}</span>
                </div>
                <span className="font-bold text-lg text-gray-800 tracking-tight truncate" title={siteName || 'EduFlex'}>
                    {siteName || 'EduFlex'}
                </span>
            </div>

            {currentUser && (
                <div className="p-6 pb-2">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden shrink-0">
                            {currentUser.profilePictureUrl ? (
                                <img src={`http://127.0.0.1:8080${currentUser.profilePictureUrl}`} alt="Avatar" className="w-full h-full object-cover"/>
                            ) : (
                                <span>{currentUser.firstName?.[0]}{currentUser.lastName?.[0]}</span>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-bold text-sm text-gray-900 truncate">{currentUser.firstName}</div>
                            <div className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider flex items-center gap-1">
                                {currentUser.role === 'ADMIN' && <ShieldCheck size={10}/>}
                                {currentUser.role}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
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

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium mb-2"
                >
                    <LogOut size={18}/> {t('sidebar.logout')}
                </button>
                <div className="text-center text-[10px] text-gray-400 font-mono">
                    v{version || '1.0.0'}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;