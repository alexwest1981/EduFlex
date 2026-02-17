import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    X, Settings, Users, Shield, Palette, Database,
    Activity, FileText, Globe, Lock, Bell
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import { useAppContext } from '../../context/AppContext';

const MobileAdminControlCenter = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { getCustomTheme } = useBranding();
    const { currentUser } = useAppContext();

    // Only show for admins
    const isAdmin = currentUser?.role?.name === 'ADMIN' || currentUser?.role === 'ADMIN';
    if (!isAdmin) return null;

    const customTheme = getCustomTheme();
    const mobileTheme = customTheme?.mobile || {};
    const borderRadius = mobileTheme.borderRadius || '24px';
    const isGlass = mobileTheme.glassmorphism || false;
    const activeColor = mobileTheme.activeColor || '#4f46e5';

    // Animation classes based on state
    const containerClasses = isOpen
        ? 'opacity-100 translate-y-0 pointer-events-auto'
        : 'opacity-0 translate-y-10 pointer-events-none';

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const shortcuts = [
        { icon: Settings, label: 'Inställningar', path: '/system' },
        { icon: Users, label: 'Användare', path: '/admin' },
        { icon: Palette, label: 'Mobiltema', path: '/enterprise/whitelabel?tab=mobile' },
        { icon: Shield, label: 'Säkerhet', path: '/system?tab=security' },
        { icon: Activity, label: 'Analys', path: '/analytics' },
        { icon: Database, label: 'Resurser', path: '/resources' },
        { icon: FileText, label: 'Loggar', path: '/admin' }, // Placeholder as explicit logs page might not exist
        { icon: Globe, label: 'Whitelabel', path: '/enterprise/whitelabel' },
    ];

    // Use Portal to render outside of sticky headers (which create containing blocks)
    return ReactDOM.createPortal(
        <div className={`fixed inset-0 z-[10000] flex flex-col transition-all duration-300 ${containerClasses}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Control Center Card */}
            <div className="absolute inset-x-4 bottom-8 top-20 flex flex-col justify-end pointer-events-none">
                <div
                    className="w-full backdrop-blur-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
                    style={{
                        borderRadius: borderRadius,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: mobileTheme.backgroundColor || (isGlass ? 'rgba(255,255,255,0.8)' : '#ffffff')
                    }}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100/50 dark:border-white/5 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Central</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Snabbkontroll för administratörer</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        >
                            <X size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar">
                        {shortcuts.map((shortcut, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavigate(shortcut.path)}
                                className="group relative overflow-hidden p-4 h-24 rounded-2xl bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-100 dark:border-white/5 transition-all active:scale-95 flex flex-col justify-between items-start"
                                style={{ borderRadius: parseInt(borderRadius) > 16 ? '20px' : borderRadius }}
                            >
                                <div className="p-2 rounded-xl text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/20 transition-colors">
                                    <shortcut.icon size={20} />
                                </div>
                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 pl-1 group-hover:translate-x-1 transition-transform">
                                    {shortcut.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Footer Stats / Info */}
                    <div className="p-4 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100/50 dark:border-white/5">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>EduFlex v2.0.18</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                System OK
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MobileAdminControlCenter;
