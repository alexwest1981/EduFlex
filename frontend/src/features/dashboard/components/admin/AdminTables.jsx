import React, { useState, useEffect } from 'react';
import { User, FileText, File as FileIcon, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../../../services/api';
// ... (skip down to AdminCourseRegistry signature)
export const AdminCourseRegistry = ({ courses, onEdit, onManage, onNewCourse, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('sv-SE');
    };

    const filteredCourses = courses?.filter(c => {
        const matchesSearch = (c.name + c.courseCode).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'OPEN' ? c.isOpen : !c.isOpen);
        return matchesSearch && matchesStatus;
    }) || [];

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden animate-in slide-in-from-bottom-8">
            {/* ... (keep header) ... */}
            <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-[#131314]">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-800 dark:text-white">Kursregister</h3>
                    <button onClick={onNewCourse} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1"><Plus size={14} /> Ny Kurs</button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-[#1E1F20] dark:text-white dark:border-[#3c4043]" placeholder="Sök kurs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="ALL">Alla Statusar</option>
                        <option value="OPEN">Öppna</option>
                        <option value="CLOSED">Stängda</option>
                    </select>
                </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                        <tr><th className="p-4">Status</th><th className="p-4">Kod</th><th className="p-4">Namn</th><th className="p-4">Datum</th><th className="p-4 text-right">Åtgärd</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {filteredCourses.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${c.color || 'bg-gray-300'}`} title="Kursfärg"></div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isOpen ? 'Öppen' : 'Stängd'}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-gray-600 dark:text-gray-400">{c.courseCode}</td>
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">{formatDate(c.startDate)} - {formatDate(c.endDate)}</td>
                                <td className="p-4 text-right flex justify-end gap-2 text-gray-500">
                                    <button onClick={() => onEdit(c)} className="p-2 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Redigera kurs"><Edit2 size={16} /></button>
                                    <button onClick={() => onDelete(c.id)} className="p-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Ta bort kurs"><Trash2 size={16} /></button>
                                    <button onClick={() => onManage(c.id)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline px-2 py-1 ml-2">Hantera</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminRecentActivity = ({ latestUsers, latestDocs, onNewUserClick, showUsers = true, showDocs = true }) => {
    // Determine grid columns based on visibility
    const gridCols = (showUsers && showDocs) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6 overflow-hidden animate-in slide-in-from-bottom-8">
            <div className={`grid ${gridCols} gap-8`}>
                {/* Left: Latest Users */}
                {showUsers && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <User size={18} className="text-indigo-600" />
                                Senaste användare
                            </h3>
                            <button onClick={onNewUserClick} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1">
                                <Plus size={12} /> Ny
                            </button>
                        </div>
                        <div className="space-y-3">
                            {latestUsers?.length > 0 ? latestUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043] hover:border-indigo-200 transition-colors">
                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs uppercase border border-indigo-200">
                                        {u.firstName?.[0] || '?'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{u.firstName} {u.lastName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono capitalize">{(u.role?.name || u.role || '').toLowerCase()}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 italic">Inga nya användare registrerade.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Right: Latest Docs */}
                {showDocs && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FileIcon size={18} className="text-blue-600" />
                                Senaste uppladdningar
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {latestDocs?.length > 0 ? latestDocs.map(d => (
                                <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043] hover:border-blue-200 transition-colors">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                                        <FileText size={16} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={d.title}>{d.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Uppladdad av {d.uploadedBy || 'Okänd'}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 italic">Inga filer uppladdade än.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AdminUserTable = ({ users, onNewUser, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterRole, setFilterRole] = React.useState('ALL');
    const [availableRoles, setAvailableRoles] = useState([]);

    useEffect(() => {
        api.roles.getAll().then(setAvailableRoles).catch(console.error);
    }, []);

    const filteredUsers = users?.filter(u => {
        const matchesSearch = (u.firstName + ' ' + u.lastName + u.email).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || (u.role?.name || u.role) === filterRole;
        return matchesSearch && matchesRole;
    }) || [];

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-[#131314]">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-800 dark:text-white">Användarregister</h3>
                    <button onClick={onNewUser} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1">
                        <Plus size={14} /> Ny Användare
                    </button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-[#1E1F20] dark:text-white dark:border-[#3c4043]"
                            placeholder="Sök användare..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white"
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                    >
                        <option value="ALL">Alla Roller</option>
                        {availableRoles && availableRoles.length > 0 ? (
                            availableRoles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))
                        ) : (
                            <>
                                <option value="STUDENT">Studenter</option>
                                <option value="TEACHER">Lärare</option>
                                <option value="ADMIN">Admins</option>
                            </>
                        )}
                    </select>
                </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                        <tr>
                            <th className="p-4">Användare</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Roll</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Åtgärd</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {filteredUsers.map(u => (
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
                                <td className="p-4 text-gray-400 text-xs">Aktiv</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {onEdit && (
                                            <button onClick={() => onEdit(u)} className="p-2 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Redigera användare">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button onClick={() => onDelete(u.id)} className="p-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Ta bort användare">
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
        </div>
    );
};