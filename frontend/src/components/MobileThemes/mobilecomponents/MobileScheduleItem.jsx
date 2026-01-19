import React from 'react';
import MobileWidget from './MobileWidget';
import { Play, ChevronRight, FileText } from 'lucide-react';
import { useBranding } from '../../../context/BrandingContext';

/**
 * MobileScheduleItem - Timeline item for course schedule.
 * Replicates "1.1 Basic tips" and "Final exam" cards.
 */
const MobileScheduleItem = ({ title, subtitle, time, type = 'lesson', isActive = false }) => {
    const { getCustomTheme } = useBranding();
    const customTheme = getCustomTheme();
    const radius = customTheme?.mobile?.borderRadius || '24px';

    // Config based on type
    const isExam = type === 'exam';

    const bgClass = isExam ? 'bg-[#FF5A5F]' : 'bg-[#E6F5FA]';
    const textClass = isExam ? 'text-white' : 'text-gray-900';
    const subTextClass = isExam ? 'text-white/80' : 'text-gray-500';
    const iconBg = isExam ? 'bg-white/20 text-white' : 'bg-white text-gray-900';

    return (
        <div className="flex gap-4 relative pl-4 pb-8 last:pb-0">
            {/* Timeline Line */}
            <div className="absolute left-0 top-2 bottom-0 w-[2px] bg-gray-100 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-black mt-1 mb-1 ring-4 ring-white" />
            </div>

            <div className="flex-1">
                {time && (
                    <div className="text-xs font-bold text-gray-500 mb-2 ml-1">
                        {time}
                    </div>
                )}

                <div
                    className={`p-4 flex items-center justify-between shadow-sm transition-transform active:scale-[0.98] ${bgClass}`}
                    style={{ borderRadius: radius }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl ${iconBg}`}
                            style={{ borderRadius: parseInt(radius) > 16 ? '16px' : '12px' }}
                        >
                            {isExam ? <FileText size={20} /> : <Play size={20} fill={isExam ? "white" : "currentColor"} />}
                        </div>

                        <div>
                            <h4 className={`font-bold text-sm ${textClass}`}>{title}</h4>
                            <p className={`text-xs ${subTextClass}`}>{subtitle}</p>
                        </div>
                    </div>

                    <button className={`p-2 rounded-full ${isExam ? 'hover:bg-white/20' : 'hover:bg-black/5'}`}>
                        <ChevronRight size={20} className={textClass} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileScheduleItem;
