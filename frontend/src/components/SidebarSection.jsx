import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const SidebarSection = ({ title, items, sidebarOpen, roleName }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // If sidebar is slim, we don't show the collapsible state in the same way,
    // but the component should handle both modes.

    if (items.length === 0) return null;

    return (
        <div className="mb-3">
            {/* SECTION HEADER */}
            {sidebarOpen ? (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-between px-4 mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <span>{title}</span>
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
            ) : (
                <div className="my-2 border-t border-gray-100 dark:border-gray-800 mx-4"></div>
            )}

            {/* SECTION ITEMS */}
            <div className={`space-y-1 transition-all duration-300 overflow-hidden ${isCollapsed && sidebarOpen ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                {items.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path === '/admin' && location.pathname.startsWith('/enterprise'));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive: navActive }) => {
                                const active = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                return `relative flex items-center px-4 py-2 rounded-xl transition-all duration-200 group ${active
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c] hover:text-gray-900 dark:hover:text-gray-200'
                                    }`;
                            }}
                        >
                            {({ isActive: navActive }) => {
                                const active = navActive || (item.path === '/admin' && location.pathname.startsWith('/enterprise'));
                                return (
                                    <>
                                        {active && sidebarOpen && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full"></div>
                                        )}

                                        <div className={`${!sidebarOpen && 'mx-auto'} ${active ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                            {React.cloneElement(item.icon, { size: 20 })}
                                        </div>

                                        {sidebarOpen && (
                                            <span className={`ml-3 text-sm font-medium ${active ? 'font-semibold' : ''}`}>
                                                {item.label}
                                            </span>
                                        )}

                                        {!sidebarOpen && (
                                            <div className="absolute left-16 bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                                {item.label}
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                                            </div>
                                        )}
                                    </>
                                );
                            }}
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default SidebarSection;
