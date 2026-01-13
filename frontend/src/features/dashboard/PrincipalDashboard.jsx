import React from 'react';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

// --- SHARED ---
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import DashboardCustomizer from '../../components/dashboard/DashboardCustomizer';

const PrincipalDashboard = () => {
    // Widget State via Hook
    const { widgets, toggleWidget } = useDashboardWidgets('principal', {
        kpiCards: true,
        revenueChart: true,
        acquisitionChart: true,
        systemStatus: true
    });

    const widgetLabels = {
        kpiCards: 'Nyckeltal (KPI)',
        revenueChart: 'Intäktstillväxt',
        acquisitionChart: 'Användartillväxt',
        systemStatus: 'Systemstatus'
    };

    return (
        <div>
            {/* Customizer is tricky here because AnalyticsDashboard owns the header.
                We might need to pass the customizer UI OR pass the controls down.
                Actually, simpler to render Customizer here but absolute positioned or allow AnalyticsDashboard to render children in header?
                
                Let's pass the 'customizer' as a prop or 'headerAction' prop to AnalyticsDashboard if we modify it.
                Or just wrapping div with header?
            */}
            {/* 
                AnalyticsDashboard has its own H1 header. Putting another header above it looks bad.
                I should pass `customizer` component or props to AnalyticsDashboard.
            */}
            <AnalyticsDashboard
                widgets={widgets}
                customizer={
                    <DashboardCustomizer
                        widgets={widgets}
                        toggleWidget={toggleWidget}
                        widgetLabels={widgetLabels}
                    />
                }
            />
        </div>
    );
};

export default PrincipalDashboard;
