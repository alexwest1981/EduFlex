import React from 'react';
import SKAManager from '../SKAManager';
import YearCycleVisualization from '../YearCycleVisualization';

const SKADashboard = () => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="xl:col-span-4">
                <YearCycleVisualization />
            </div>
            <div className="xl:col-span-8">
                <SKAManager />
            </div>
        </div>
    );
};

export default SKADashboard;
