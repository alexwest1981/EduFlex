import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAppContext } from './AppContext';

const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
    const { currentUser } = useAppContext();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshModules = async (retryCount = 0) => {
        if (!currentUser) return;

        // Wait a tiny bit if this is the first attempt, to ensure token is in localStorage
        if (retryCount === 0) {
            const token = localStorage.getItem('token');
            if (!token) {
                // If no token yet, wait 300ms and try one more time
                setTimeout(() => refreshModules(1), 300);
                return;
            }
        }

        try {
            const data = await api.modules.getAll();
            if (Array.isArray(data)) {
                setModules(data);
                setLoading(false);
            } else {
                console.warn("API returned non-array for modules:", data);
                setModules([]);
                setLoading(false);
            }
        } catch (e) {
            console.error("Kunde inte hämta moduler", e);

            // If it was a 401 and we haven't retried yet, try once more after a delay
            if (e.message?.includes('UNAUTHORIZED') && retryCount < 1) {
                setTimeout(() => refreshModules(retryCount + 1), 1000);
            } else {
                setModules([]);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        refreshModules();
    }, [currentUser]);

    // Hjälpfunktion för att kolla om en modul är på
    const isModuleActive = React.useCallback((key) => {
        if (!Array.isArray(modules)) return false; // Safety check
        const mod = modules.find(m => m.moduleKey === key);
        return mod ? mod.active : false; // Default false om den inte finns
    }, [modules]);

    const contextValue = React.useMemo(() => ({
        modules,
        isModuleActive,
        refreshModules,
        loading
    }), [modules, isModuleActive, loading]);

    return (
        <ModuleContext.Provider value={contextValue}>
            {children}
        </ModuleContext.Provider>
    );
};

export const useModules = () => useContext(ModuleContext);
