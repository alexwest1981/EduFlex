import React from 'react';
import { Users, Briefcase, FileText, CheckCircle, XCircle, UserCheck, Shield } from 'lucide-react';

const AdminStats = ({ users, courses, documents }) => {
    // --- BERÄKNA DETALJERAD DATA ---
    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const teacherCount = users.filter(u => u.role === 'TEACHER').length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;

    const openCourses = courses.filter(c => c.isOpen).length;
    const closedCourses = courses.length - openCourses;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">

            {/* ANVÄNDAR-STATISTIK */}
            <div className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm flex flex-col justify-between h-40" style={{ backdropFilter: 'var(--card-backdrop)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Totalt Användare</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{users.length}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><Users size={24} /></div>
                </div>
                {/* Detaljerad breakdown */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400"><UserCheck size={12} className="text-green-500" /> {studentCount} Stud</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400"><Briefcase size={12} className="text-indigo-500" /> {teacherCount} Lär</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400"><Shield size={12} className="text-red-500" /> {adminCount} Adm</div>
                </div>
            </div>

            {/* KURS-STATISTIK */}
            <div className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm flex flex-col justify-between h-40" style={{ backdropFilter: 'var(--card-backdrop)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Totalt Kurser</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{courses.length}</p>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400"><Briefcase size={24} /></div>
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} /> {openCourses} Öppna</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={12} /> {closedCourses} Stängda</div>
                </div>
            </div>

            {/* FIL-STATISTIK */}
            <div className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm flex flex-col justify-between h-40" style={{ backdropFilter: 'var(--card-backdrop)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Arkiverade Filer</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{documents.length}</p>
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400"><FileText size={24} /></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                    <p className="text-xs text-gray-400 italic">Data uppdateras i realtid.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;