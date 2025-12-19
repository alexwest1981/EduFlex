import React from 'react';
import { LayoutDashboard, BookOpen, Briefcase, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ view, navigateTo, currentUser, logout }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Översikt' },
        { id: 'courses', icon: BookOpen, label: 'Kurser' },
        { id: 'documents', icon: Briefcase, label: 'Dokument' },
    ];

    if (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') {
        menuItems.push({ id: 'admin', icon: Settings, label: 'Admin' });
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">EduFlex</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${view === item.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <item.icon size={20} className={view === item.id ? 'text-indigo-600' : 'text-gray-400'}/>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-xl p-4 mb-2">
                    <div className="font-semibold text-sm truncate">{currentUser.fullName}</div>
                    <div className="text-xs text-gray-500">{currentUser.role}</div>
                </div>
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm transition-colors">
                    <LogOut size={16}/> Logga Ut
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;