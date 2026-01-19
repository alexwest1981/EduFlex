import React from 'react';
import { LayoutGrid, CheckSquare, Search, User, MoreHorizontal, PieChart } from 'lucide-react';
import { useBranding } from '../../../context/BrandingContext';

/**
 * MobileFloatingNav - A floating pill-shaped navigation dock.
 * Matches the "Finsights" design style.
 */
const MobileFloatingNav = ({ activeTab, onTabChange }) => {
    // The image shows 5 icons: Dashboard (Grid), Connections (Nodes?), Toggle?, Files?, Menu (Dots).
    // We'll map them to: Dashboard, Courses, Schedule, Messages, Menu.

    const tabs = [
        { id: 'dashboard', icon: LayoutGrid },
        { id: 'courses', icon: PieChart },
        { id: 'schedule', icon: CheckSquare }, // Using CheckSquare to look like the checklist icon
        { id: 'messages', icon: User }, // Placeholder
        { id: 'menu', icon: MoreHorizontal }
    ];

    return (
        <div className="fixed bottom-8 left-6 right-6 z-50">
            <div className="bg-white rounded-3xl h-[72px] shadow-2xl flex justify-between items-center px-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange && onTabChange(tab.id)}
                            className={`p-3 rounded-2xl transition-all ${isActive
                                    ? 'bg-black text-white'
                                    : 'text-gray-400 hover:text-black'
                                }`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileFloatingNav;
