import React from 'react';
import MobileWidget from './MobileWidget';

/**
 * MobileDashboardLayout - The orchestrator for mobile widgets.
 * Manages the layout grid/flexbox for optimal mobile viewing.
 */
const MobileDashboardLayout = ({ widgets = [] }) => {
    return (
        <div className="flex flex-col w-full min-h-screen pb-24 px-4 pt-4 overflow-x-hidden">
            {/* 
              This layout assumes specific 'Mobile Widgets' will be passed in.
              In the future, we will map Desktop Widgets to MobileWidget wrappers here.
            */}
            <div className="flex flex-col space-y-4">
                {widgets.map((widget, index) => (
                    <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                        {widget}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MobileDashboardLayout;
