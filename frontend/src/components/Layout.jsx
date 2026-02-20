import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useBranding } from '../context/BrandingContext';
import { DESIGN_SYSTEMS } from '../context/DesignSystemContext';

import StandardLayout from './layouts/StandardLayout';
import FloatingLayout from './layouts/FloatingLayout';
import HorizonLayout from './layouts/HorizonLayout';
import NebulaLayout from './layouts/NebulaLayout';
import EmberLayout from './layouts/EmberLayout';
import VoltageLayout from './layouts/VoltageLayout';
import MidnightLayout from './layouts/MidnightLayout';
import PulseLayout from './layouts/PulseLayout';
import AiCoachSidebar from './ai/AiCoachSidebar';

const Layout = ({ children }) => {
    const { systemSettings, currentUser } = useAppContext();
    const { branding } = useBranding();

    // Set Document Title
    useEffect(() => {
        if (systemSettings && systemSettings.site_name) {
            document.title = systemSettings.site_name;
        }
    }, [systemSettings]);

    // --- ACTIVITY TRACKING (Global) ---
    // Works across ALL layouts
    useEffect(() => {
        if (!currentUser) return;

        const pingActivity = async () => {
            try {
                // Dynamic import to avoid circular dep issues if any
                const { api } = await import('../services/api');
                await api.users.ping();
            } catch (err) {
                console.error("Activity ping failed", err);
            }
        };

        // Ping immediately
        pingActivity();
        // Ping every 5 minutes
        const intervalId = setInterval(pingActivity, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [currentUser]);


    // Handle Legacy Name Mappings
    let targetSystemId = branding?.designSystem;
    if (targetSystemId === 'professional') targetSystemId = 'classic';
    if (targetSystemId === 'donezo') targetSystemId = 'focus';
    // 'nebula' works as is

    // Determine Logic
    const activeDesign = targetSystemId ? DESIGN_SYSTEMS[targetSystemId] : null;
    const layoutStyle = activeDesign?.layout?.style;

    const renderLayout = () => {
        if (layoutStyle === 'floating') return <FloatingLayout>{children}</FloatingLayout>;
        if (layoutStyle === 'horizon') return <HorizonLayout>{children}</HorizonLayout>;
        if (layoutStyle === 'nebula') return <NebulaLayout>{children}</NebulaLayout>;
        if (layoutStyle === 'ember') return <EmberLayout>{children}</EmberLayout>;
        if (layoutStyle === 'voltage') return <VoltageLayout>{children}</VoltageLayout>;
        if (layoutStyle === 'midnight') return <MidnightLayout>{children}</MidnightLayout>;
        if (layoutStyle === 'pulse') return <PulseLayout>{children}</PulseLayout>;

        return <StandardLayout>{children}</StandardLayout>;
    };

    return (
        <>
            {renderLayout()}
            <AiCoachSidebar />
        </>
    );
};

export default Layout;
