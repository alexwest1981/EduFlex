import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAppContext } from './AppContext';

const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
    const { currentUser } = useAppContext();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshModules = async () => {
        if (!currentUser) return; // Hämta inte om utloggad
        try {
            const data = await api.modules.getAll();
            setModules(data);
        } catch (e) {
            console.error("Kunde inte hämta moduler", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshModules();
    }, [currentUser]);

    // Hjälpfunktion för att kolla om en modul är på
    const isModuleActive = (key) => {
        const mod = modules.find(m => m.moduleKey === key);
        return mod ? mod.active : false; // Default false om den inte finns
    };

    return (
        <ModuleContext.Provider value={{ modules, isModuleActive, refreshModules, loading }}>
            {children}
        </ModuleContext.Provider>
    );
};

export const useModules = () => useContext(ModuleContext);