import React, { useState } from 'react';
import { Users, Briefcase, FileText, User, Layers, Search, Lock, Unlock, File as FileIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = ({ users, courses, documents, handleToggleCourseStatus }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.courseCode && c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'ALL' ? true : filterStatus === 'OPEN' ? c.isOpen : !c.isOpen;
        return matchesSearch && matchesFilter;
    });

    const latestUsers = [...users].reverse().slice(0, 5);
    const latestDocs = [...documents].reverse().slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.live_overview')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.realtime_data')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center justify-between">
                    <div><p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.users')}</p><p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p></div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><Users size={24}/></div>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center justify-between">
                    <div><p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.courses')}</p><p className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length}</p></div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400"><Briefcase size={24}/></div>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center justify-between">
                    <div><p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.archived_files')}</p><p className="text-3xl font-bold text-gray-900 dark:text-white">{documents.length}</p></div>
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400"><FileText size={24}/></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* SENASTE ANVÄNDARE */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><User size={18}/> {t('dashboard.latest_registered')}</h3>
                        <Link to="/admin" className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded font-bold hover:bg-indigo-100">{t('dashboard.manage')}</Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {latestUsers.map(u => (
                            <div key={u.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors flex justify-between items-center">
                                <div><p className="font-bold text-sm text-gray-900 dark:text-white">{u.fullName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p></div>
                                <span className="text-[10px] bg-gray-100 dark:bg-[#3c4043] text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-bold uppercase">{u.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* SENASTE FILER */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText size={18}/> {t('dashboard.latest_uploads')}</h3>
                        <Link to="/documents" className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded font-bold hover:bg-indigo-100">{t('dashboard.archive')}</Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {latestDocs.map(d => (
                            <div key={d.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] flex justify-between items-center transition-colors">
                                <div className="flex items-center gap-3"><FileIcon size={16} className="text-indigo-500"/><span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{d.title || d.fileName}</span></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KURSREGISTER (TABELL) */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Layers size={20}/> {t('dashboard.course_registry')}</h3>
                    <div className="flex gap-2">
                        <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16}/><input className="pl-9 pr-4 py-2 border dark:border-[#3c4043] rounded-lg text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white" placeholder={t('dashboard.search_placeholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
                        <select className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="ALL">{t('dashboard.all_statuses')}</option><option value="OPEN">{t('dashboard.open')}</option><option value="CLOSED">{t('dashboard.closed')}</option></select>
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                    <tr><th className="p-4">{t('course.status')}</th><th className="p-4">{t('admin.course_code')}</th><th className="p-4">{t('admin.course_name')}</th><th className="p-4">{t('admin.teacher')}</th><th className="p-4 text-right">{t('common.action')}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                    {filteredCourses.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors">
                            <td className="p-4"><button onClick={() => handleToggleCourseStatus(c.id)} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 w-fit ${c.isOpen ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'}`}>{c.isOpen ? <><Unlock size={10}/> Öppen</> : <><Lock size={10}/> Stängd</>}</button></td>
                            <td className="p-4 font-mono text-gray-600 dark:text-gray-400">{c.courseCode}</td>
                            <td className="p-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">{c.teacher?.fullName || "-"}</td>
                            <td className="p-4 text-right"><button onClick={() => navigate(`/course/${c.id}`)} className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline">{t('dashboard.manage')}</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;