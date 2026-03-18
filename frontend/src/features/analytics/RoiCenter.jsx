import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import RoiDashboard from './components/RoiDashboard';
import BusinessOutcomeImport from './components/BusinessOutcomeImport';
import TcoCalculator from './components/TcoCalculator';
import { TrendingUp, Plus, Database, ChevronLeft, Calculator } from 'lucide-react';

const RoiCenter = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'import', or 'tco'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const res = await api.courses.getAll();
            setCourses(res);
            if (res.length > 0) {
                setSelectedCourseId(res[0].id);
            }
        } catch (e) {
            console.error("Failed to load courses", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div></div>;
    }

    return (
        <div className="space-y-8 p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
                        <div className="p-2 bg-brand-blue rounded-xl text-white">
                            <TrendingUp size={24} />
                        </div>
                        ROI & Prestation
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 font-bold">
                        Koppla utbildningsresultat till faktiska affärsmål och KPI:er.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-main)] shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-[var(--border-main)]">
                        <Database size={16} className="text-[var(--text-secondary)]" />
                        <select
                            className="bg-transparent border-none text-sm font-bold text-[var(--text-primary)] focus:ring-0 cursor-pointer outline-none"
                            value={selectedCourseId || ''}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            {courses.map(c => (
                                <option key={c.id} value={c.id} className="bg-[var(--bg-card)]">{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => setView('dashboard')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${view === 'dashboard' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
                        >
                            Översikt
                        </button>
                        <button
                            onClick={() => setView('import')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${view === 'import' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
                        >
                            Importera KPI
                        </button>
                        <button
                            onClick={() => setView('tco')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${view === 'tco' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
                        >
                            ROI-Kalkylator
                        </button>
                    </div>
                </div>
            </div>

            {/* Main View Area */}
            <div className="min-h-[500px]">
                {view === 'dashboard' ? (
                    <RoiDashboard courseId={selectedCourseId} />
                ) : view === 'tco' ? (
                    <TcoCalculator />
                ) : (
                    <div className="space-y-6">
                        <button
                            onClick={() => setView('dashboard')}
                            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-brand-blue transition-colors font-black"
                        >
                            <ChevronLeft size={16} />
                            Tillbaka till Dashboard
                        </button>
                        <BusinessOutcomeImport courseId={selectedCourseId} onComplete={() => setView('dashboard')} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoiCenter;
