import React, { forwardRef } from 'react';
import { useDesignSystem } from '../../../context/DesignSystemContext';

const WidgetWrapper = forwardRef(({ children, style, className, onMouseDown, onMouseUp, onTouchEnd, ...props }, ref) => {
    const { currentDesignSystem } = useDesignSystem();

    // Combine RGL styles with Unified CSS Variables
    const combinedStyle = {
        ...style,
        background: 'var(--bg-card)',
        backdropFilter: 'var(--backdrop-blur, blur(12px))',
        border: '1px solid var(--border-main)',
        borderRadius: 'var(--radius-xl, 24px)',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    };

    return (
        <div
            ref={ref}
            style={combinedStyle}
            className={`${className} widget-wrapper transition-shadow duration-200`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            {...props}
        >
            {/* Inner content container - handles scrolling if needed */}
            <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar relative">
                {children}
            </div>
        </div>
    );
});

export default WidgetWrapper;
