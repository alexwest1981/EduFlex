import React from 'react';
import MobileWidget from './MobileWidget';
import { Play, Calendar, CheckSquare, Clock } from 'lucide-react';

/**
 * MobileCourseCard - Represents a course in a square, modern card format.
 * Replicates the "Mobile design" / "3D modeling" cards from the design.
 */
const MobileCourseCard = ({ title, duration, modules, icon: Icon, colorClass = "bg-blue-50 text-blue-600" }) => {
    return (
        <MobileWidget className={`flex flex-col h-full min-h-[160px] justify-between !p-6 ${colorClass} !border-0`}>
            <div className="flex justify-between items-start">
                <div className="p-3 bg-white rounded-2xl shadow-sm bg-opacity-60 backdrop-blur-sm">
                    {Icon ? <Icon size={24} /> : <Play size={24} />}
                </div>
            </div>

            <div className="mt-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                    {title}
                </h3>
                <div className="flex flex-col gap-1 text-xs font-medium opacity-70 text-gray-800">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-current" /> {duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-current" /> {modules} modules
                    </span>
                </div>
            </div>
        </MobileWidget>
    );
};

export default MobileCourseCard;
