import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, LogOut, Moon, Sun, LayoutDashboard, Calendar, User, Layers, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import NotificationBell from '../NotificationBell';
import OnlineFriendsPanel from '../social/OnlineFriendsPanel';
import { useTranslation } from 'react-i18next';
// Import Branding Hook
import { useBranding } from '../../context/BrandingContext';
import MobileAdminControlCenter from '../../features/mobile-admin/MobileAdminControlCenter';

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

    // Theme support for Sidebar
    const { getCustomTheme } = useBranding();
    const customTheme = getCustomTheme();
    const mobileTheme = customTheme?.mobile || {};
    const borderRadius = mobileTheme.borderRadius || '24px';

    const handleLogout = () => { logout(); navigate('/login'); };
    const profileImgUrl = getProfileUrl(currentUser?.profilePictureUrl);

    if (!currentUser) return null;

    return (
        <>
            {/* Backdrop with fade-in and blur */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-all duration-300 animate-in fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Drawer */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                    border-r border-white/20 dark:border-white/5
                    shadow-2xl flex flex-col lg:hidden
                `}
                style={{
                    borderTopRightRadius: borderRadius,
                    borderBottomRightRadius: borderRadius,
                }}
            >
                {/* Header / Logo */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100/50 dark:border-[#282a2c]/50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-xl mr-3 shadow-lg shadow-black/10">
                            {systemSettings?.site_name ? systemSettings.site_name[0] : 'E'}
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white truncate block">
                            {systemSettings?.site_name || "EduFlex"}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path === '/admin' && location.pathname.startsWith('/enterprise'));

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose} // Auto-close on navigate
                                className={`relative flex items-center px-4 py-4 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-indigo-50 to-transparent dark:from-[#333537] dark:to-transparent text-indigo-700 dark:text-white shadow-sm font-bold'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                    }`}
                                style={{
                                    borderRadius: isActive ? borderRadius : '12px'
                                }}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-600 dark:bg-white rounded-r-full"></div>
                                )}
                                <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                                    {React.cloneElement(item.icon, { size: 24 })}
                                </div>
                                <span className="ml-4 font-medium text-base">
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100/50 dark:border-[#282a2c]/50 space-y-3">
                    <button onClick={toggleTheme} className="flex items-center w-full px-4 py-3.5 rounded-xl transition-colors bg-gray-50/50 dark:bg-[#282a2c]/50 hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-300">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="ml-3 font-medium text-sm">{theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}</span>
                    </button>

                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                        <LogOut size={20} />
                        <span className="ml-3 font-bold text-sm">{t('sidebar.logout')}</span>
                    </button>

                    <div className="pt-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ring-2 ring-white dark:ring-gray-800">
                            {profileImgUrl ? (
                                <img src={profileImgUrl} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold">{currentUser.initials}</div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Inloggad som</span>
                            <span className="font-bold text-gray-900 dark:text-white">{currentUser.firstName}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

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

    // New Design Tokens
    const borderRadius = mobileTheme.borderRadius || '24px';
    const depth = mobileTheme.componentDepth || 'floating'; // flat, shadow, floating, glass
    const animation = mobileTheme.animationPreset || 'bouncy'; // minimal, smooth, bouncy

    // Determine container styles based on depth
    const getContainerStyles = () => {
        const isFloating = depth === 'floating';
        const isGlassEffect = depth === 'glass';
        const isSoft = depth === 'shadow';

        // Base transparency: Glass needs to be much more transparent to be visible
        const bgOpacity = isGlassEffect ? 'aa' : 'ff'; // aa = ~66%, ff = 100%

        const styles = {
            backgroundColor: `${bgColor}${bgOpacity}`,
            backdropFilter: isGlassEffect ? 'blur(20px) saturate(180%)' : 'none',
            // If floating, use full radius. If docked, only top radius.
            borderRadius: isFloating ? borderRadius : `${parseInt(borderRadius) > 0 ? borderRadius : '0'} ${parseInt(borderRadius) > 0 ? borderRadius : '0'} 0 0`,
            borderTop: (isGlassEffect || depth === 'flat') ? '1px solid rgba(255,255,255,0.1)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        };

        if (isFloating) {
            return {
                ...styles,
                bottom: '24px',
                left: '20px',
                right: '20px',
                boxShadow: isGlassEffect
                    ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Tailwind shadow-2xl
                paddingBottom: '0px'
            };
        }

        // Docked Styles
        return {
            ...styles,
            boxShadow: isSoft
                ? '0 -10px 40px -10px rgba(0,0,0,0.1)' // Strong upward shadow
                : 'none'
        };
    };

    // Custom NavLink with "3D" button effect
    const NavItem = ({ to, icon: Icon, label }) => {
        const getAnimationClass = (isActive) => {
            if (animation === 'minimal') {
                return isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-100 active:opacity-40';
            }
            if (animation === 'bouncy') {
                // Spring physics bezier
                const spring = 'transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]';
                return isActive
                    ? `${spring} -translate-y-3 scale-110`
                    : `${spring} hover:scale-105 active:scale-90 active:rotate-3`;
            }
            // Smooth / Default
            return isActive ? 'transition-all duration-300 -translate-y-1' : 'transition-all duration-300 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5';
        };

        return (
            <NavLink
                to={to}
                className={({ isActive }) => `
                    flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer group
                    ${getAnimationClass(isActive)}
                `}
            >
                {({ isActive }) => (
                    <>
                        <div
                            className="relative flex items-center justify-center w-12 h-12 transition-all duration-300"
                            style={{
                                // Item shape follows the theme radius or fully rounded for high radius themes
                                borderRadius: borderRadius === '9999px' ? '50%' : borderRadius,
                                backgroundColor: isActive ? `${activeColor}${isGlass ? '40' : '20'}` : 'transparent',
                                color: isActive ? activeColor : inactiveColor,
                                boxShadow: (isActive && (depth === 'floating' || depth === 'shadow') && animation !== 'minimal')
                                    ? `0 10px 20px -5px ${activeColor}60` // Glow effect
                                    : 'none',
                                border: (isActive && animation === 'minimal') ? `2px solid ${activeColor}` : 'none'
                            }}
                        >
                            <Icon size={isActive && animation === 'bouncy' ? 28 : 24} strokeWidth={isActive ? 2.5 : 2} />

                            {/* Bouncy Dot Indicator */}
                            {isActive && animation === 'bouncy' && (
                                <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeColor }} />
                            )}
                        </div>
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <div
            className={`
                lg:hidden fixed z-50 transition-all duration-300 
                ${depth === 'floating' ? 'mx-4 mb-4' : 'bottom-0 left-0 right-0 pb-safe border-t border-gray-200 dark:border-[#202F36]'}
            `}
            style={getContainerStyles()}
        >
            <div className={`flex justify-around items-center ${depth === 'floating' ? 'h-[72px] px-2' : 'h-[80px] px-2'}`}>
                <NavItem to="/" icon={LayoutDashboard} label="Home" />
                <NavItem to="/catalog" icon={Layers} label="Catalog" />
                <NavItem to="/calendar" icon={Calendar} label="Calendar" />
                <NavItem to="/profile" icon={User} label="Profile" />

                {/* More / Menu Button */}
                <button
                    onClick={onMenuOpen}
                    className="flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-90 duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]"
                    style={{ color: inactiveColor }}
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-black/5 dark:hover:bg-white/10">
                        <Menu size={24} strokeWidth={2} />
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
    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    // Check if user is admin
    const isAdmin = currentUser?.role?.name === 'ADMIN' || currentUser?.role === 'ADMIN';

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
                {/* Admin Trigger (Mobile Only) */}
                {isAdmin && (
                    <button
                        onClick={() => setAdminMenuOpen(true)}
                        className="p-2 rounded-xl text-rose-600 bg-rose-50 dark:bg-rose-900/10 dark:text-rose-400 mr-1 transition-transform active:scale-90"
                    >
                        <ShieldAlert size={20} strokeWidth={2.5} />
                    </button>
                )}

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

            {/* Admin Control Center Overlay */}
            {adminMenuOpen && <MobileAdminControlCenter isOpen={adminMenuOpen} onClose={() => setAdminMenuOpen(false)} />}
        </div>
    );
};
