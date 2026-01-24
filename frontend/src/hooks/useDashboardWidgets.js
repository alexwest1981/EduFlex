import React, { useState, useEffect } from 'react';

/**
 * Hook to manage dashboard widget visibility.
 * @param {string} dashboardId - Unique identifier for the dashboard (e.g., 'student_dashboard', 'admin_dashboard')
 * @param {Object} defaultWidgets - Default widget visibility state (e.g., { stats: true, calendar: true })
 */
export const useDashboardWidgets = (dashboardId, defaultWidgets) => {
    const [widgets, setWidgets] = useState(defaultWidgets);
    const [isLoaded, setIsLoaded] = useState(false);

    // KEY point: Load immediately on mount
    useEffect(() => {
        const saved = localStorage.getItem(`widgets_${dashboardId}`);
        if (saved) {
            try {
                setWidgets({ ...defaultWidgets, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse saved widgets", e);
            }
        }
        setIsLoaded(true);
    }, [dashboardId]);

    const toggleWidget = (key) => {
        const newWidgets = { ...widgets, [key]: !widgets[key] };
        setWidgets(newWidgets);
        localStorage.setItem(`widgets_${dashboardId}`, JSON.stringify(newWidgets));
    };

    return { widgets, toggleWidget, isLoaded };
};
