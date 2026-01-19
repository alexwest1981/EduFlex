import React, { useMemo } from 'react';
import * as ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDesignSystem } from '../../../context/DesignSystemContext';

// Handle ESM/CJS interop weirdness with Vite
const RGL = ReactGridLayout.default || ReactGridLayout;
const WidthProvider = RGL.WidthProvider || ReactGridLayout.WidthProvider;
const Responsive = RGL.Responsive || ReactGridLayout.Responsive;

// Fallback to avoid crash if imports fail (helps debugging)
const SafeWidthProvider = WidthProvider || ((c) => c);
const ResponsiveGridLayout = SafeWidthProvider(Responsive || 'div');

const DashboardGrid = ({
    children,
    layouts,
    onLayoutChange,
    isEditable = false,
    rowHeight = 100
}) => {
    const { currentDesignSystem } = useDesignSystem();

    // Default props for the grid to ensure smooth UX
    const gridProps = useMemo(() => ({
        className: "layout",
        layouts: layouts,
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: rowHeight,
        margin: [24, 24], // Gap between items
        containerPadding: [0, 0],
        isDraggable: isEditable,
        isResizable: isEditable,
        onLayoutChange: onLayoutChange,
        compactType: 'vertical', // Items flow upwards to fill gaps
        preventCollision: false,
    }), [layouts, isEditable, rowHeight, onLayoutChange]);

    return (
        <div className={`dashboard-grid-wrapper ${isEditable ? 'edit-mode' : ''}`}>
            {isEditable && (
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 text-sm flex items-center gap-2 animate-in fade-in">
                    <span className="animate-pulse">●</span>
                    Redigeringsläge aktivt. Dra och släpp boxarna för att möblera om.
                </div>
            )}

            <ResponsiveGridLayout {...gridProps}>
                {children}
            </ResponsiveGridLayout>

            <style>{`
                .dashboard-grid-wrapper.edit-mode .react-grid-item {
                    border: 2px dashed #6366f1;
                    background: rgba(99, 102, 241, 0.05);
                    border-radius: ${currentDesignSystem.card.radius.xl};
                    cursor: grab;
                }
                .dashboard-grid-wrapper.edit-mode .react-grid-item:active {
                    cursor: grabbing;
                    background: rgba(99, 102, 241, 0.1);
                    z-index: 100;
                }
                .react-grid-item.react-grid-placeholder {
                    background: #6366f1 !important;
                    opacity: 0.2 !important;
                    border-radius: ${currentDesignSystem.card.radius.xl} !important;
                }
            `}</style>
        </div>
    );
};

export default DashboardGrid;
