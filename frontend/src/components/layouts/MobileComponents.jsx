import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, LogOut, Moon, Sun, LayoutDashboard, Calendar, User, Layers } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import NotificationBell from '../NotificationBell';
import OnlineFriendsPanel from '../social/OnlineFriendsPanel';
import { useTranslation } from 'react-i18next';

// Helper to fix MinIO URLs for client access
const getProfileUrl = (url) => {
    if (!url) return null;
    let finalUrl = url;
    if (finalUrl.includes('minio:9000')) {
        // Replace 'minio' with actual hostname (e.g. 192.168.x.x or localhost)
        const hostname = window.location.hostname;
        finalUrl = finalUrl.replace('minio', hostname);
    }
    // Ensure protocol
    if (!finalUrl.startsWith('http')) {
        // Fallback to backend port 8080 if not specified
        finalUrl = `http://${window.location.hostname}:8080${finalUrl}`;
    }
    return finalUrl;
};

/**
 * MobileSidebar - A hyper-modern, glassmorphic sidebar for mobile devices.
 * Slides in from the left and applies a heavy backdrop blur.
 */
export const MobileSidebar = ({ isOpen, onClose, navItems, friendsPanelOpen, setFriendsPanelOpen }) => {
    const { currentUser, logout, systemSettings, theme, toggleTheme } = useAppContext();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };
    const profileImgUrl = getProfileUrl(currentUser?.profilePictureUrl);

    // Common role/permission logic (could be passed as props, but deriving here for simplicity if context is available)
    const roleName = currentUser?.role?.name || currentUser?.role;

    if (!currentUser) return null;

    return (
        <>
            {/* Backdrop with fade-in and blur */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-all duration-300 animate-in fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Drawer */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                border-r border-white/20 dark:border-white/5
                shadow-2xl flex flex-col lg:hidden
            `}>
                {/* Header / Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100/50 dark:border-[#282a2c]/50">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-xl mr-3 shadow-sm">
                            {systemSettings?.site_name ? systemSettings.site_name[0] : 'E'}
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white truncate block">
                            {systemSettings?.site_name || "EduFlex"}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path === '/admin' && location.pathname.startsWith('/enterprise'));

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose} // Auto-close on navigate
                                className={`relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-indigo-50 to-transparent dark:from-[#333537] dark:to-transparent text-indigo-700 dark:text-white shadow-sm font-semibold'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-white rounded-r-full"></div>
                                )}
                                <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                                    {React.cloneElement(item.icon, { size: 22 })}
                                </div>
                                <span className="ml-3 font-medium text-sm">
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100/50 dark:border-[#282a2c]/50 space-y-2">
                    <button onClick={toggleTheme} className="flex items-center w-full px-4 py-3 rounded-xl transition-colors bg-gray-50/50 dark:bg-[#282a2c]/50 hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-300">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="ml-3 font-medium text-sm">{theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}</span>
                    </button>

                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                        <LogOut size={20} />
                        <span className="ml-3 font-bold text-sm">{t('sidebar.logout')}</span>
                    </button>

                    <div className="pt-2 flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {profileImgUrl ? (
                                <img src={profileImgUrl} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold">{currentUser.initials}</div>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Inloggad som <span className="font-semibold text-gray-900 dark:text-white">{currentUser.firstName}</span>
                        </div>
                    </div>
                </div>
            </aside>

        </>
    );
};

// Import Branding Hook
import { useBranding } from '../../context/BrandingContext';

/**
 * MobileBottomNav - Duolingo-style bottom navigation.
 * Features "3D" pressed buttons and colorful active states.
 */
export const MobileBottomNav = ({ onMenuOpen }) => {
    const { t } = useTranslation();
    const location = useLocation();

    // Get custom mobile theme
    const { getCustomTheme } = useBranding();
    const customTheme = getCustomTheme();
    const mobileTheme = customTheme?.mobile || {};

    // Default Fallbacks
    const bgColor = mobileTheme.backgroundColor || '#ffffff';
    const activeColor = mobileTheme.activeColor || '#4f46e5';
    const inactiveColor = mobileTheme.inactiveColor || '#9ca3af';
    const isGlass = mobileTheme.glassmorphism || false;

    // Custom NavLink with "3D" button effect
    const NavItem = ({ to, icon: Icon, label }) => {
        return (
            <NavLink
                to={to}
                className={({ isActive }) => `
                    flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-100 relative
                    ${isActive
                        ? `bg-transparent translate-y-1`
                        : 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 active:translate-y-1'
                    }
                `}
            >
                {({ isActive }) => (
                    <>
                        <div
                            className={`
                                relative flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all
                            `}
                            style={{
                                borderColor: isActive ? activeColor : 'transparent',
                                backgroundColor: isActive ? `${activeColor}20` : 'transparent', // 20 = 12% opacity
                                color: isActive ? activeColor : inactiveColor
                            }}
                        >
                            <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <div
            className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-[#202F36] pb-safe z-50 transition-colors duration-300"
            style={{
                backgroundColor: isGlass ? `${bgColor}dd` : bgColor, // Add transparency if glass
                backdropFilter: isGlass ? 'blur(10px)' : 'none'
            }}
        >
            <div className="flex justify-around items-center h-[88px] pb-4 px-2">
                <NavItem
                    to="/"
                    icon={LayoutDashboard}
                    label="Home"
                />
                <NavItem
                    to="/catalog"
                    icon={Layers}
                    label="Catalog"
                />
                <NavItem
                    to="/calendar"
                    icon={Calendar}
                    label="Calendar"
                />
                <NavItem
                    to="/profile"
                    icon={User}
                    label="Profile"
                />

                {/* More / Menu Button - styled to match */}
                <button
                    onClick={onMenuOpen}
                    className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:translate-y-1"
                    style={{ color: inactiveColor }}
                >
                    <div className="w-10 h-10 flex items-center justify-center">
                        <Menu size={26} strokeWidth={2} />
                    </div>
                </button>
            </div>
        </div>
    );
};

/**
 * MobileHeader - Simplified, clean header.
 */
export const MobileHeader = ({ friendsPanelOpen, setFriendsPanelOpen }) => {
    const { currentUser } = useAppContext();
    const profileImgUrl = getProfileUrl(currentUser?.profilePictureUrl);

    return (
        <div className="sticky top-0 z-20 px-4 py-3 lg:hidden flex items-center justify-between bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden border border-indigo-200 dark:border-indigo-800/50">
                    {profileImgUrl ? (
                        <img src={profileImgUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {currentUser?.firstName?.[0]}
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Välkommen tillbaka,</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{currentUser?.firstName}</span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => setFriendsPanelOpen(!friendsPanelOpen)}
                    className={`relative p-2 rounded-xl transition-colors ${friendsPanelOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-white/10 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Users size={20} />
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </button>
                <NotificationBell />
            </div>
        </div>
    );
};
