import React from 'react';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

const PrincipalDashboard = () => {
    // This wrapper allows us to add Principal-specific navigation or features 
    // around the Analytics Dashboard in the future (e.g. Staff Management).
    return (
        <div>
            <AnalyticsDashboard />
        </div>
    );
};

export default PrincipalDashboard;
