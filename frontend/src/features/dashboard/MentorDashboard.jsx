import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import StudentDrillDown from '../analytics/StudentDrillDown';

const MentorDashboard = () => {
    const { t } = useTranslation();
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Mock data for mentees - In real app, fetch from /api/mentor/mentees
    const mentees = [
        { id: 101, name: "Anna Andersson", class: "9A", status: "Active", risk: "Low", attendance: 95 },
        { id: 102, name: "Erik Eriksson", class: "9A", status: "At Risk", risk: "High", attendance: 72 },
        { id: 103, name: "Maria Nilsson", class: "9B", status: "Active", risk: "Medium", attendance: 88 },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="text-indigo-600" /> Mentoröversikt
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Hantera dina mentorselver och följ deras utveckling.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <p className="text-sm font-bold text-gray-500 uppercase">Mina Elever</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{mentees.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <p className="text-sm font-bold text-gray-500 uppercase">I Farozonen</p>
                    <p className="text-3xl font-black text-red-500">{mentees.filter(m => m.risk === 'High').length}</p>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <p className="text-sm font-bold text-gray-500 uppercase">Genomsnittlig Närvaro</p>
                    <p className="text-3xl font-black text-indigo-600">85%</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043]">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Elevlista</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Namn</th>
                                <th className="px-6 py-4">Klass</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Närvaro</th>
                                <th className="px-6 py-4">Risk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                            {mentees.map((student) => (
                                <tr
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className="hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{student.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{student.class}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{student.attendance}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 font-bold ${student.risk === 'High' ? 'text-red-500' : student.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                            {student.risk === 'High' && <AlertTriangle size={14} />}
                                            {student.risk}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedStudent && (
                <StudentDrillDown
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default MentorDashboard;
