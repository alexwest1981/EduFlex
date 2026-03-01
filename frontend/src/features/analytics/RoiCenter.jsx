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
        return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-8 p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <TrendingUp size={24} />
                        </div>
                        ROI & Prestation
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Koppla utbildningsresultat till faktiska affärsmål och KPI:er.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-[#1E1F20] p-2 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-gray-100 dark:border-[#3c4043]">
                        <Database size={16} className="text-gray-400" />
                        <select
                            className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer"
                            value={selectedCourseId || ''}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => setView('dashboard')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}
                        >
                            Översikt
                        </button>
                        <button
                            onClick={() => setView('import')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'import' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}
                        >
                            Importera KPI
                        </button>
                        <button
                            onClick={() => setView('tco')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'tco' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#282a2c]'}`}
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
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
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
