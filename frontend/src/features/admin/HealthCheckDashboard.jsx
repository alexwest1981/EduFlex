import React, { useState, useEffect } from 'react';
import { api } from '../../services/api'; // Assuming api service exists
import { Save, AlertTriangle, CheckCircle, Database, Server, Users, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HealthCheckDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/health/data-integrity');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch health stats", error);
            toast.error("Kunde inte hämta systemstatus");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Server className="w-6 h-6 text-indigo-600" />
                    Systemhälsa & Dataintegritet
                </h1>
                <button onClick={fetchData} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                    Uppdatera
                </button>
            </div>

            {/* MAIN STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={<Users />} label="Totalt Antal Användare" value={stats.totalUsers} color="blue" />
                <StatCard icon={<BookOpen />} label="Totalt Antal Kurser" value={stats.totalCourses} color="green" />
                <StatCard icon={<Database />} label="Lagringsanvändning" value={stats.storageUsageFormatted} color="purple" />
                <StatCard
                    icon={<AlertTriangle />}
                    label="Problem hittade"
                    value={stats.orphanedStudentCount + stats.emptyCourseCount}
                    color={stats.orphanedStudentCount + stats.emptyCourseCount > 0 ? "red" : "gray"}
                />
            </div>

            {/* ORPHANED STUDENTS */}
            <div className="bg-white dark:bg-[#1E1E1F] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-500" />
                        Föräldralösa Elever (Utan Klass)
                    </h2>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {stats.orphanedStudentCount} st
                    </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    {stats.orphanedStudents.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                            <p>Inga föräldralösa elever hittades.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500">
                                <tr>
                                    <th className="p-3">Namn</th>
                                    <th className="p-3">Användarnamn</th>
                                    <th className="p-3">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {stats.orphanedStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 font-medium">{student.name}</td>
                                        <td className="p-3 text-gray-500">{student.username}</td>
                                        <td className="p-3">
                                            <a href={`/profile/${student.id}`} className="text-indigo-600 hover:text-indigo-500 hover:underline">
                                                Hantera
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* EMPTY COURSES */}
            <div className="bg-white dark:bg-[#1E1E1F] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-yellow-500" />
                        Tomma Kurser (Inga studenter)
                    </h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {stats.emptyCourseCount} st
                    </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    {stats.emptyCourses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                            <p>Inga tomma kurser hittades.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500">
                                <tr>
                                    <th className="p-3">Kursnamn</th>
                                    <th className="p-3">Kurskod</th>
                                    <th className="p-3">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {stats.emptyCourses.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 font-medium">{course.name}</td>
                                        <td className="p-3 text-gray-500">{course.code}</td>
                                        <td className="p-3">
                                            <a href={`/course/${course.id}`} className="text-indigo-600 hover:text-indigo-500 hover:underline">
                                                Hantera
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        red: "bg-red-50 text-red-600",
        gray: "bg-gray-50 text-gray-600",
        yellow: "bg-yellow-50 text-yellow-600"
    };

    return (
        <div className="bg-white dark:bg-[#1E1E1F] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colors[color] || colors.gray}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </div>
    );
}

export default HealthCheckDashboard;
