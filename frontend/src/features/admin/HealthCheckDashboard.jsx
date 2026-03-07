import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, Database, AlertTriangle, RefreshCw,
    CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

/**
 * Standalone System Health & Data Integrity Dashboard
 * This page helps administrators monitor data orphans and empty resources.
 */
const HealthCheckDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [healthStats, setHealthStats] = useState(null);
    const [healthLoading, setHealthLoading] = useState(true);

    const isAdmin = currentUser?.role?.name === 'ADMIN' || currentUser?.role === 'ADMIN';

    const fetchHealthData = async () => {
        setHealthLoading(true);
        try {
            const response = await api.get('/admin/health/data-integrity');
            setHealthStats(response);
        } catch (e) {
            console.error('Failed to fetch health stats:', e);
        } finally {
            setHealthLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchHealthData();
        } else {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    if (healthLoading && !healthStats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Analyserar systemhälsa...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-bold mb-2 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Tillbaka till Administration
                    </button>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Systemhälsa & Dataintegritet</h1>
                    <p className="text-[var(--text-secondary)]">Övervaka systemets data, användare och resurser för att säkra driftsäkerheten.</p>
                </div>
                <button
                    onClick={fetchHealthData}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 font-bold"
                >
                    <RefreshCw size={18} className={healthLoading ? 'animate-spin' : ''} />
                    Uppdatera Status
                </button>
            </div>

            {healthStats && (
                <>
                    {/* KEY METRICS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DbStatCard icon={<Users />} label="Totalt Antal Användare" value={healthStats.totalUsers} color="blue" />
                        <DbStatCard icon={<BookOpen />} label="Totalt Antal Kurser" value={healthStats.totalCourses} color="green" />
                        <DbStatCard icon={<Database />} label="Lagring" value={healthStats.storageUsageFormatted} color="purple" />
                        <DbStatCard
                            icon={<AlertTriangle />}
                            label="Åtgärder som behöver ses över"
                            value={healthStats.orphanedStudentCount + healthStats.emptyCourseCount}
                            color={
                                healthStats.orphanedStudentCount > 0 ? "red" :
                                    healthStats.emptyCourseCount > 0 ? "yellow" : "gray"
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* ORPHANED STUDENTS SECTION */}
                        <div className="bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-main)] overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center bg-white/5">
                                <h3 className="font-black text-[var(--text-primary)] flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                        <Users size={20} className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                    Föräldralösa Elever (Utan Klass)
                                </h3>
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-black px-3 py-1 rounded-full">
                                    {healthStats.orphanedStudentCount} st
                                </span>
                            </div>
                            <div className="p-2">
                                {healthStats.orphanedStudents.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">Inga föräldralösa elever hittade.</p>
                                        <p className="text-xs opacity-60">Alla studenter är kopplade till minst en klass.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                                <tr>
                                                    <th className="p-4">Namn</th>
                                                    <th className="p-4">Användarnamn</th>
                                                    <th className="p-4 text-right">Åtgärd</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border-main)]">
                                                {healthStats.orphanedStudents.map(student => (
                                                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="p-4 font-bold text-[var(--text-primary)]">{student.name}</td>
                                                        <td className="p-4 text-[var(--text-secondary)]">{student.username}</td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => navigate(`/profile/${student.id}`)}
                                                                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                                            >
                                                                Hantera
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* EMPTY COURSES SECTION */}
                        <div className="bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-main)] overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center bg-white/5">
                                <h3 className="font-black text-[var(--text-primary)] flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                                        <BookOpen size={20} className="text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    Tomma Kurser (Inga studenter)
                                </h3>
                                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-black px-3 py-1 rounded-full">
                                    {healthStats.emptyCourseCount} st
                                </span>
                            </div>
                            <div className="p-2">
                                {healthStats.emptyCourses.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">Inga tomma kurser hittade.</p>
                                        <p className="text-xs opacity-60">Alla kurser har minst en registrerad student.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                                <tr>
                                                    <th className="p-4">Kursnamn</th>
                                                    <th className="p-4">Kurskod</th>
                                                    <th className="p-4 text-right">Åtgärd</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                                {healthStats.emptyCourses.map(course => (
                                                    <tr key={course.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                                        <td className="p-4 font-bold text-gray-900 dark:text-white">{course.name}</td>
                                                        <td className="p-4 text-gray-500 font-mono text-xs">{course.code}</td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => navigate(`/course/${course.id}`)}
                                                                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                                            >
                                                                Visa Kurs
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const DbStatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
        green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        purple: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
        red: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        gray: "bg-white/5 text-[var(--text-secondary)] border border-white/10",
        yellow: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    };

    return (
        <div className="bg-[var(--bg-card)] p-6 rounded-[32px] border border-[var(--border-main)] flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform duration-300">
            <div className={`p-4 rounded-2xl ${colors[color] || colors.gray} shadow-inner`}>
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <div>
                <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{value}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)]">{label}</div>
            </div>
        </div>
    );
};

export default HealthCheckDashboard;
