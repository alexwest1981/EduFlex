import React, { forwardRef } from 'react';
import { useDesignSystem } from '../../../context/DesignSystemContext';

const WidgetWrapper = forwardRef(({ children, style, className, onMouseDown, onMouseUp, onTouchEnd, ...props }, ref) => {
    const { currentDesignSystem } = useDesignSystem();

    // Combine RGL styles with Design System Card styles
    const combinedStyle = {
        ...style,
        background: currentDesignSystem.card.background,
        backdropFilter: currentDesignSystem.card.backdrop,
        border: currentDesignSystem.card.border,
        borderRadius: currentDesignSystem.card.radius.xl,
        boxShadow: currentDesignSystem.card.shadow,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Ensure content stays inside
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
