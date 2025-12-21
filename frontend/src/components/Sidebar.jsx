import React from 'react';
import {
    LayoutDashboard,
    BookOpen,
    FolderOpen,
    Users,
    UserCircle,
    LogOut,
    ShieldCheck
} from 'lucide-react';

const Sidebar = ({ view, navigateTo, currentUser, logout }) => {

    // Definiera menyval baserat på roll
    const getMenuItems = () => {
        const role = currentUser?.role;

        const items = [
            { id: 'dashboard', label: 'Översikt', icon: <LayoutDashboard size={20}/> }
        ];

        if (role === 'STUDENT') {
            items.push({ id: 'catalog', label: 'Kurskatalog', icon: <BookOpen size={20}/> });
        }

        // Admin hanterar kurser i Dashboarden, men lärare/studenter ser "Mina kurser" där.
        // Vi kan lägga till 'users' för Admin.
        if (role === 'ADMIN') {
            items.push({ id: 'admin', label: 'Användare', icon: <Users size={20}/> });
        }

        // Alla har tillgång till dokument
        items.push({ id: 'documents', label: 'Filer & Dokument', icon: <FolderOpen size={20}/> });

        items.push({ id: 'profile', label: 'Min Profil', icon: <UserCircle size={20}/> });

        return items;
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 transition-all duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-8 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-200 shadow-md">
                    <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="font-bold text-xl text-gray-800 tracking-tight">EduFlex</span>
            </div>

            {/* User Info Card (Mini) */}
            {currentUser && (
                <div className="p-6 pb-2">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden">
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

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {getMenuItems().map(item => (
                    <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                            ${view === item.id
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <div className={`${view === item.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {item.icon}
                        </div>
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Logout Area */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                >
                    <LogOut size={18}/> Logga ut
                </button>
            </div>
        </div>
    );
};

export default Sidebar;