import React from 'react';
import { Users, Briefcase, FileText, CheckCircle, XCircle, UserCheck, Shield, MessageSquare, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RecentMessagesWidget from '../RecentMessagesWidget';

const AdminStats = ({ users = [], courses = [], documents = [], onViewMessages, unreadCount = 0 }) => {
    const { t } = useTranslation();
    // --- HANTERA PAGINERAD DATA ---
    // users kan vara en array eller ett paginerat objekt {content: [...]}
    const userList = Array.isArray(users) ? users : (users?.content || []);
    const courseList = Array.isArray(courses) ? courses : (courses?.content || []);
    const docList = Array.isArray(documents) ? documents : (documents?.content || []);

    // --- BERÄKNA DETALJERAD DATA ---
    const studentCount = userList.filter(u => u.role === 'STUDENT' || u.role?.name === 'STUDENT').length;
    const teacherCount = userList.filter(u => u.role === 'TEACHER' || u.role?.name === 'TEACHER').length;
    const adminCount = userList.filter(u => u.role === 'ADMIN' || u.role?.name === 'ADMIN').length;
    const mentorCount = userList.filter(u => u.role === 'MENTOR' || u.role?.name === 'MENTOR').length;
    const principalCount = userList.filter(u => u.role === 'PRINCIPAL' || u.role?.name === 'PRINCIPAL').length;

    const openCourses = courseList.filter(c => c.isOpen).length;
    const closedCourses = courseList.length - openCourses;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ANVÄNDAR-STATISTIK */}
            <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform text-blue-500">
                    <Users size={120} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
                        <Users size={22} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{userList.length}</h3>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('dashboard.total_users')}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase" title={t('dashboard.students')}><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {studentCount} S</div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase" title={t('dashboard.teachers')}><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> {teacherCount} L</div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase" title={t('dashboard.admins')}><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {adminCount} A</div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase" title={t('dashboard.mentors')}><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> {mentorCount} M</div>
                    </div>
                </div>
            </div>

            {/* KURS-STATISTIK */}
            <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform text-indigo-500">
                    <Briefcase size={120} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400">
                        <Briefcase size={22} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{courseList.length}</h3>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Totalt Kurser</p>
                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase"><CheckCircle size={12} /> {openCourses} Aktiva</div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase"><XCircle size={12} /> {closedCourses} Arkiv</div>
                    </div>
                </div>
            </div>

            {/* FIL-STATISTIK */}
            <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform text-orange-500">
                    <FileText size={120} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400">
                        <FileText size={22} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{docList.length}</h3>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('dashboard.archived_files')}</p>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Datasync OK
                        </p>
                    </div>
                </div>
            </div>

            {/* SENASTE MEDDELANDEN */}
            <div
                onClick={onViewMessages}
                className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer active:scale-95"
            >
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform text-emerald-500">
                    <MessageSquare size={120} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
                        <MessageSquare size={22} />
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                            NYTT
                        </span>
                    )}
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{unreadCount}</h3>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nya Meddelanden</p>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center group-hover:text-indigo-600 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest">{t('dashboard.go_to_inbox')}</p>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
