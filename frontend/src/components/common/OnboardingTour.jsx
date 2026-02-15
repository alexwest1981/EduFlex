import React, { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAppContext } from '../../context/AppContext';

/**
 * OnboardingTour
 * Triggers a product tour for first-time users (based on localStorage).
 * 
 * @param {Array} steps - Formatting: [{ element: '#id', popover: { title, description } }]
 * @param {string} tourId - Unique ID for this tour to track completion (e.g., 'dashboard-tour-v1')
 */
const OnboardingTour = ({ steps, tourId }) => {
    const { currentUser } = useAppContext();

    useEffect(() => {
        if (!currentUser || steps.length === 0) return;

        const hasSeenTour = localStorage.getItem(`hasSeenTour_${tourId}`);
        if (hasSeenTour) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: steps,
            onDestroy: () => {
                // Mark as seen when tour is closed or finished
                localStorage.setItem(`hasSeenTour_${tourId}`, 'true');
            },
            nextBtnText: 'Nästa',
            prevBtnText: 'Bakåt',
            doneBtnText: 'Klar',
        });

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            driverObj.drive();
        }, 1500);

        return () => clearTimeout(timer);
    }, [currentUser, steps, tourId]);

    return null; // This component handles side effects only
};

export default OnboardingTour;
