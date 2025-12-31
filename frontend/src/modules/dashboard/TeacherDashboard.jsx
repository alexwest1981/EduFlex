import React, { useState } from 'react';
import { Mail, Phone, ChevronRight, X, MessageSquare, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StudentDetailModal = ({ student, myCourses, onClose }) => {
    if (!student) return null;
    const enrolledCourses = myCourses.filter(c => c.students?.some(s => s.id === student.id));
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-[#3c4043]">
                <div className="bg-indigo-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
                    <h2 className="text-xl font-bold">{student.fullName}</h2>
                    <p className="text-indigo-200 text-sm">@{student.username}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Mail size={18} className="text-indigo-500"/><a href={`mailto:${student.email}`} className="hover:underline">{student.email}</a></div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Phone size={18} className="text-indigo-500"/><span>{student.phone || "Ingen telefon"}</span></div>
                    <div className="border-t border-gray-100 dark:border-[#3c4043] pt-4">
                        <h4 className="font-bold text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">Kurser:</h4>
                        <div className="flex flex-wrap gap-2">{enrolledCourses.map(c => <span key={c.id} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 px-2 py-1 rounded text-xs font-bold">{c.name}</span>)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard = ({ currentUser, myCourses, ungradedSubmissions }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState(null);

    const allUniqueStudents = Array.from(new Set(myCourses.flatMap(c => c.students || []).map(s => s.id)))
        .map(id => myCourses.flatMap(c => c.students || []).find(s => s.id === id));

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
            {selectedStudent && <StudentDetailModal student={selectedStudent} myCourses={myCourses} onClose={() => setSelectedStudent(null)} />}

            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.teacher_panel')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.overview_for', {name: currentUser.fullName})}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1E1F20] p-5 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm"><h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">{t('dashboard.my_students')}</h3><p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{allUniqueStudents.length}</p></div>
                <div className="bg-white dark:bg-[#1E1F20] p-5 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm"><h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">{t('dashboard.to_grade')}</h3><p className="text-3xl font-bold text-orange-500 dark:text-orange-400">{ungradedSubmissions.length}</p></div>
                <div className="bg-white dark:bg-[#1E1F20] p-5 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm"><h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">{t('dashboard.active_courses')}</h3><p className="text-3xl font-bold text-green-600 dark:text-green-400">{myCourses.length}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Mina Kurser</h2>
                    <div className="space-y-4">
                        {myCourses.map(course => (
                            <div key={course.id} onClick={() => navigate(`/course/${course.id}`)} className="bg-white dark:bg-[#1E1F20] p-5 rounded-xl border border-gray-200 dark:border-[#3c4043] hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all flex justify-between items-center group shadow-sm">
                                <div><h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.name}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{course.courseCode} • {course.students?.length || 0} studenter</p></div>
                                <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500"/>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] font-bold text-sm text-gray-800 dark:text-white">Mina Studenter</div>
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {allUniqueStudents.length === 0 ? <p className="p-4 text-sm text-gray-500 text-center">Inga studenter.</p> : allUniqueStudents.map(s => (
                            <div key={s.id} onClick={() => setSelectedStudent(s)} className="p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] cursor-pointer flex justify-between items-center transition-colors">
                                <div><p className="font-bold text-sm text-gray-900 dark:text-white">{s.fullName}</p><p className="text-xs text-gray-500 dark:text-gray-400">@{s.username}</p></div>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Visa</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;