import React from 'react';
import { User, FileText, File as FileIcon, Search, Plus, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminRecentActivity = ({ latestUsers, latestDocs, onNewUserClick }) => {
    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "-";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-in slide-in-from-bottom-6">
            {/* Senaste Användare */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><User size={18} /> Senaste Användare</h3>
                    <button onClick={onNewUserClick} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1"><Plus size={14} /> Ny Användare</button>
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

            {/* Senaste Filer */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText size={18} /> Senaste Uppladdningar</h3>
                    <Link to="/documents" className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded font-bold hover:bg-indigo-100">Arkiv</Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                    {latestDocs.map(d => (
                        <div key={d.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] flex justify-between items-center transition-colors">
                            <div className="flex items-center gap-3">
                                <FileIcon size={16} className="text-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{d.title || d.fileName}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(d.uploadedAt || d.createdAt)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AdminUserTable = ({ users, onNewUser }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState('ALL');

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-[#131314]">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><User size={18} /> Användarregister</h3>
                    <button onClick={onNewUser} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1"><Plus size={14} /> Ny Användare</button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-[#1E1F20] dark:text-white dark:border-[#3c4043]" placeholder="Sök användare..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="ALL">Alla Roller</option>
                        <option value="STUDENT">Studenter</option>
                        <option value="TEACHER">Lärare</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                        <tr><th className="p-4">Namn</th><th className="p-4">Email</th><th className="p-4">Roll</th><th className="p-4 text-right">Id</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{u.fullName}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                                <td className="p-4 text-right text-gray-400 font-mono text-xs">#{u.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminCourseRegistry = ({ courses, onEdit, onManage, onNewCourse }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('ALL');

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.courseCode && c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'ALL' ? true : filterStatus === 'OPEN' ? c.isOpen : !c.isOpen;
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateInput) => {
        if (!dateInput) return "-";
        if (Array.isArray(dateInput)) return new Date(dateInput[0], dateInput[1] - 1, dateInput[2]).toLocaleDateString();
        return new Date(dateInput).toLocaleDateString();
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden animate-in slide-in-from-bottom-8">
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
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => onEdit(c)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Redigera kurs"><Edit2 size={16} /></button>
                                    <button onClick={() => onManage(c.id)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline px-2 py-1">Hantera</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};