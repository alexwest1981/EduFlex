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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">

            {/* ANVÄNDAR-STATISTIK */}
            <div className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm flex flex-col justify-between min-h-[160px]" style={{ backdropFilter: 'var(--card-backdrop)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.total_users')}</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{userList.length}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><Users size={24} /></div>
                </div>
                {/* Detaljerad breakdown */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('dashboard.students')}><UserCheck size={11} className="text-green-500" /> {studentCount} S</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('dashboard.teachers')}><Briefcase size={11} className="text-indigo-500" /> {teacherCount} L</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('dashboard.admins')}><Shield size={11} className="text-red-500" /> {adminCount} A</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('dashboard.mentors')}><Users size={11} className="text-orange-500" /> {mentorCount} M</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400" title={t('dashboard.principals')}><Shield size={11} className="text-purple-500" /> {principalCount} R</div>
                </div>
            </div>

            {/* KURS-STATISTIK */}
            <div className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm flex flex-col justify-between h-40" style={{ backdropFilter: 'var(--card-backdrop)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Totalt Kurser</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{courseList.length}</p>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400"><Briefcase size={24} /></div>
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} /> {openCourses} {t('dashboard.open')}</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={12} /> {closedCourses} {t('dashboard.closed')}</div>
                </div>
            </div>

            {/* FIL-STATISTIK */}
            <div className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm flex flex-col justify-between h-40" style={{ backdropFilter: 'var(--card-backdrop)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.archived_files')}</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{docList.length}</p>
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400"><FileText size={24} /></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                    <p className="text-xs text-gray-400 italic">{t('dashboard.realtime_update_notice')}</p>
                </div>
            </div>

            {/* SENASTE MEDDELANDEN (STAT CARD STYLE) */}
            <div
                onClick={onViewMessages}
                className="bg-card dark:bg-card-dark p-6 rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:border-indigo-400 transition-all group"
                style={{ backdropFilter: 'var(--card-backdrop)' }}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.new_messages')}</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{unreadCount}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"><MessageSquare size={24} /></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-bold group-hover:text-indigo-600 transition-colors">{t('dashboard.go_to_inbox')}</p>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
