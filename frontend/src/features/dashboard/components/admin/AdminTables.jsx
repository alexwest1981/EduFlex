import React, { useState, useEffect } from 'react';
import { User, FileText, File as FileIcon, Search, Plus, Edit2, Trash2, FileCode, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';
// ... (skip down to AdminCourseRegistry signature)
import Pagination from '../../../../components/common/Pagination';

export const AdminCourseRegistry = ({ courses, onEdit, onManage, onNewCourse, onDelete }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('sv-SE');
    };

    const filteredCourses = courses?.filter(c => {
        const matchesSearch = (c.name + c.courseCode).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'OPEN' ? c.isOpen : !c.isOpen);
        return matchesSearch && matchesStatus;
    }) || [];

    // Pagination Logic
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-card dark:bg-card-dark rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm overflow-hidden animate-in slide-in-from-bottom-8" style={{ backdropFilter: 'var(--card-backdrop)' }}>
            <div className="p-6 border-b border-card dark:border-card-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-[#131314]/50">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-800 dark:text-white">{t('dashboard.course_registry')}</h3>
                    <button onClick={onNewCourse} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1"><Plus size={14} /> {t('dashboard.new_course')}</button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-[#1E1F20] dark:text-white dark:border-[#3c4043]" placeholder={t('dashboard.search_course')} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <select className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="ALL">{t('dashboard.all_statuses')}</option>
                        <option value="OPEN">{t('dashboard.open')}</option>
                        <option value="CLOSED">{t('dashboard.closed')}</option>
                    </select>
                </div>
            </div>
            {/* Removed max-h-[400px] & overflow-y-auto */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                        <tr><th className="p-4">{t('dashboard.table.status')}</th><th className="p-4">{t('dashboard.table.code')}</th><th className="p-4">{t('dashboard.table.name')}</th><th className="p-4">{t('dashboard.table.date')}</th><th className="p-4 text-right">{t('dashboard.table.action')}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {currentItems.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${c.color || 'bg-gray-300'}`} title={t('dashboard.course_color')}></div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isOpen ? t('dashboard.open') : t('dashboard.closed')}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-gray-600 dark:text-gray-400">{c.courseCode}</td>
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">{formatDate(c.startDate)} - {formatDate(c.endDate)}</td>
                                <td className="p-4 text-right flex justify-end gap-2 text-gray-500">
                                    <button onClick={() => onEdit(c)} className="p-2 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title={t('dashboard.edit_course')}><Edit2 size={16} /></button>
                                    <button onClick={() => onDelete(c.id)} className="p-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t('dashboard.delete_course')}><Trash2 size={16} /></button>
                                    <button onClick={() => onManage(c.id)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline px-2 py-1 ml-2">{t('dashboard.manage')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

export const RecentUsersWidget = ({ latestUsers, onNewUserClick }) => {
    const { t } = useTranslation();
    return (

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 overflow-hidden animate-in slide-in-from-bottom-8 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <User size={18} className="text-indigo-600" />
                    {t('dashboard.recent_users')}
                </h3>
                <button onClick={onNewUserClick} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1">
                    <Plus size={12} /> {t('dashboard.new')}
                </button>
            </div>
            <div className="space-y-3">
                {latestUsers?.length > 0 ? latestUsers.map((u, index) => (
                    <div key={u.id ?? `user-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043] hover:border-indigo-200 transition-colors">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs uppercase border border-indigo-200">
                            {u.firstName?.[0] || '?'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono capitalize">{(u.role?.name || u.role || '').toLowerCase()}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-400 italic">{t('dashboard.no_new_users')}</p>
                )}
            </div>
        </div>
    );
};

export const RecentUploadsWidget = ({ latestDocs }) => {
    const { t } = useTranslation();
    const [selectedDoc, setSelectedDoc] = useState(null);

    const getFileIcon = (mimeType) => {
        if (!mimeType) return <FileIcon size={16} />;
        if (mimeType.startsWith('image/')) return <Image size={16} />;
        if (mimeType.includes('pdf')) return <FileText size={16} />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText size={16} />;
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return <FileText size={16} />;
        if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('html')) return <FileCode size={16} />;
        return <FileIcon size={16} />;
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 overflow-hidden animate-in slide-in-from-bottom-8 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileIcon size={18} className="text-blue-600" />
                        {t('dashboard.recent_uploads')}
                    </h3>
                </div>
                <div className="space-y-3 flex-1">
                    {latestDocs?.length > 0 ? latestDocs.map((d, index) => (
                        <div
                            key={d.id ?? `doc-${index}`}
                            onClick={() => setSelectedDoc(d)}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043] hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group"
                        >
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                {getFileIcon(d.fileType)}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={d.fileName || d.title || t('dashboard.unknown_file')}>{d.fileName || d.title || t('dashboard.unknown_file')}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {d.size ? `${(d.size / 1024).toFixed(1)} KB` : t('dashboard.unknown_size')} • {d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('sv-SE') : t('dashboard.unknown_date')}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-400 italic">{t('dashboard.no_files_uploaded')}</p>
                    )}
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedDoc(null)}>
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white truncate pr-4">{selectedDoc.fileName || selectedDoc.title}</h3>
                            <button onClick={() => setSelectedDoc(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-full text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 flex flex-col items-center text-center">
                            {selectedDoc.fileType?.startsWith('image/') ? (
                                <img
                                    src={`${window.location.origin}${selectedDoc.fileUrl}`}
                                    alt="Preview"
                                    className="max-h-64 rounded-lg shadow-sm mb-6 object-contain"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                    {React.cloneElement(getFileIcon(selectedDoc.fileType), { size: 48 })}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 w-full text-sm mb-6">
                                <div className="bg-gray-50 dark:bg-[#131314] p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Storlek</p>
                                    <p className="font-mono font-bold dark:text-white">{(selectedDoc.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#131314] p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Typ</p>
                                    <p className="font-mono font-bold dark:text-white uppercase">{selectedDoc.fileType?.split('/')[1] || 'FIL'}</p>
                                </div>
                            </div>

                            <a
                                href={`${window.location.origin}${selectedDoc.fileUrl}`}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                {t('common.download_file') || 'Ladda ner fil'}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const AdminUserTable = ({ users, onNewUser, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterRole, setFilterRole] = React.useState('ALL');
    const [availableRoles, setAvailableRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        api.roles.getAll().then(setAvailableRoles).catch(console.error);
    }, []);

    const filteredUsers = users?.filter(u => {
        const matchesSearch = (u.firstName + ' ' + u.lastName + u.email).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || (u.role?.name || u.role) === filterRole;
        return matchesSearch && matchesRole;
    }) || [];

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-card dark:bg-card-dark rounded-[var(--radius-xl)] border border-card dark:border-card-dark shadow-sm overflow-hidden animate-in slide-in-from-bottom-8" style={{ backdropFilter: 'var(--card-backdrop)' }}>
            <div className="p-6 border-b border-card dark:border-card-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-[#131314]/50">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-800 dark:text-white">{t('dashboard.user_registry')}</h3>
                    <button onClick={onNewUser} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1">
                        <Plus size={14} /> {t('dashboard.new_user')}
                    </button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-[#1E1F20] dark:text-white dark:border-[#3c4043]"
                            placeholder={t('dashboard.search_user')}
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <select
                        className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white"
                        value={filterRole}
                        onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="ALL">{t('dashboard.all_roles')}</option>
                        {availableRoles && availableRoles.length > 0 ? (
                            availableRoles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))
                        ) : (
                            <>
                                <option value="STUDENT">{t('dashboard.students')}</option>
                                <option value="TEACHER">{t('dashboard.teachers')}</option>
                                <option value="ADMIN">{t('dashboard.admins')}</option>
                            </>
                        )}
                    </select>
                </div>
            </div>
            {/* Removed max-h-[500px] & overflow-y-auto */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                        <tr>
                            <th className="p-4">{t('dashboard.table.user')}</th>
                            <th className="p-4">{t('dashboard.table.email')}</th>
                            <th className="p-4">{t('dashboard.table.role')}</th>
                            <th className="p-4">{t('dashboard.table.status')}</th>
                            <th className="p-4 text-right">{t('dashboard.table.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {currentItems.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                        {u.firstName?.[0] || '?'}
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</span>
                                </td>
                                <td className="p-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${(u.role?.name || u.role) === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                        (u.role?.name || u.role) === 'TEACHER' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {u.role?.name || u.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400 text-xs">{t('dashboard.active')}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {onEdit && (
                                            <button onClick={() => onEdit(u)} className="p-2 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title={t('dashboard.edit_user')}>
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button onClick={() => onDelete(u.id)} className="p-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t('dashboard.delete_user')}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};
