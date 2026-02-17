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

        // Use a user-specific key to avoid persistence issues between different users
        const storageKey = `hasSeenTour_${tourId}_${currentUser.id}`;
        const hasSeenTour = localStorage.getItem(storageKey);

        if (hasSeenTour) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: steps,
            allowClose: true,
            overlayOpacity: 0.7,
            onCloseClick: () => {
                localStorage.setItem(storageKey, 'true');
                driverObj.destroy();
            },
            onDestroyed: () => {
                localStorage.setItem(storageKey, 'true');
            },
            // Fallback name for v1 dismiss event
            onDismissed: () => {
                localStorage.setItem(storageKey, 'true');
            },
            nextBtnText: 'Nästa',
            prevBtnText: 'Bakåt',
            doneBtnText: 'Klar',
        });

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // Check again inside timeout just in case
            if (localStorage.getItem(storageKey)) return;
            driverObj.drive();
        }, 1500);

        return () => {
            clearTimeout(timer);
            // If the component unmounts while the tour is active, we should probably mark it as seen
            // to prevent annoying loops if they navigate away.
            if (driverObj.isActive()) {
                localStorage.setItem(storageKey, 'true');
                driverObj.destroy();
            }
        };
    }, [currentUser, steps, tourId]);

    return null; // This component handles side effects only
};

export default OnboardingTour;
