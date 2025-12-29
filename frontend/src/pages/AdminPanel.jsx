import React, { useState } from 'react';
import {
    Users, BookOpen, FileText, Trash2, Plus,
    Settings, ExternalLink, X, Save, Shield, UploadCloud, Search, Filter, Sliders,
    Puzzle, MessageSquare, Award, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WIDGET_COLORS = [
    { name: 'Indigo', value: 'bg-indigo-600' },
    { name: 'Blue', value: 'bg-blue-600' },
    { name: 'Green', value: 'bg-emerald-600' },
    { name: 'Red', value: 'bg-red-600' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Purple', value: 'bg-purple-600' },
    { name: 'Gray', value: 'bg-gray-700' },
    { name: 'Pink', value: 'bg-pink-600' },
];

const EditCourseModal = ({ course, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...course });
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">{t('admin.edit_course_settings')}</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('admin.course_name')}</label>
                        <input className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('admin.course_code')}</label>
                            <input className="w-full border p-2 rounded-lg font-mono uppercase" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value.toUpperCase()})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('admin.color_theme')}</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {WIDGET_COLORS.map(c => (
                                    <button key={c.value} type="button" onClick={() => setFormData({...formData, color: c.value})} className={`w-6 h-6 rounded-full ${c.value} ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} title={c.name} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('common.description')}</label>
                        <textarea className="w-full border p-2 rounded-lg h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><Save size={16}/> {t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UploadDocumentModal = ({ onClose, onUpload, currentUser }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setIsUploading(true);
        await onUpload(file, title, description);
        setIsUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">{t('docs.upload_title')}</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setFile(e.target.files[0]); setTitle(e.target.files[0]?.name || ''); }} required />
                        <UploadCloud size={48} className="mx-auto text-indigo-400 mb-2"/>
                        <p className="text-sm font-bold text-gray-700">{file ? file.name : t('docs.drop_text')}</p>
                        <p className="text-xs text-gray-400">PDF, Word, Excel, Bilder</p>
                    </div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">{t('course.title')}</label><input className="w-full border p-2 rounded-lg" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">{t('common.description')} (valfritt)</label><textarea className="w-full border p-2 rounded-lg h-20 resize-none" value={description} onChange={e => setDescription(e.target.value)} /></div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t('common.cancel')}</button>
                        <button disabled={isUploading} type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">{isUploading ? t('docs.saving') : t('common.upload')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminPanel = ({ adminTab, setAdminTab, users, currentUser, handleAttemptDeleteUser, courses, setShowCourseModal, handleDeleteCourse, handleUpdateCourse, allDocuments, fetchAllDocuments, handleDeleteDoc, registerForm, setRegisterForm, handleRegister, handleGenerateUsernames, usernameSuggestions, checkUsernameAvailability, handleAdminUpload, systemSettings, onUpdateSetting }) => {
    const { t, i18n } = useTranslation();
    const [editingCourse, setEditingCourse] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('ALL');
    const navigate = useNavigate();

    const safeDocuments = Array.isArray(allDocuments) ? allDocuments : [];
    const getOwnerName = (doc) => { const u = doc.user || doc.owner; if (!u) return "Okänd"; if (typeof u === 'string') return u; if (typeof u === 'object') return u.fullName || u.username || "Namnlös"; return "Okänd"; };
    const formatDate = (dateString) => { if (!dateString) return "-"; return new Date(dateString).toLocaleDateString(i18n.language); };
    const filteredCourses = courses.filter(course => {
        const searchLower = courseSearch.toLowerCase();
        const matchesSearch = course.name.toLowerCase().includes(searchLower) || (course.courseCode && course.courseCode.toLowerCase().includes(searchLower));
        let matchesFilter = true;
        if (courseFilter === 'OPEN') matchesFilter = course.isOpen;
        if (courseFilter === 'CLOSED') matchesFilter = !course.isOpen;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {editingCourse && <EditCourseModal course={editingCourse} onClose={() => setEditingCourse(null)} onSave={(updatedData) => { handleUpdateCourse(updatedData); setEditingCourse(null); }} />}
            {showUploadModal && (<UploadDocumentModal currentUser={currentUser} onClose={() => setShowUploadModal(false)} onUpload={handleAdminUpload} />)}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.title')}</h1>
            <p className="text-gray-500 mb-8">{t('admin.subtitle')}</p>

            <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
                <button onClick={() => setAdminTab('users')} className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${adminTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}><Users size={18} /> {t('admin.tab_users')}</button>
                <button onClick={() => setAdminTab('courses')} className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${adminTab === 'courses' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}><BookOpen size={18} /> {t('admin.tab_courses')}</button>
                <button onClick={() => setAdminTab('docs')} className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${adminTab === 'docs' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}><FileText size={18} /> {t('admin.tab_docs')}</button>
                <button onClick={() => setAdminTab('settings')} className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${adminTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}><Sliders size={18} /> {t('admin.tab_settings')}</button>
                <button onClick={() => setAdminTab('modules')} className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${adminTab === 'modules' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}><Puzzle size={18} /> Moduler</button>
            </div>

            {/* --- FLIK: ANVÄNDARE --- */}
            {adminTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={20} className="text-indigo-600"/> {t('admin.register_new')}</h3>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4"><input className="border p-2 rounded-lg text-sm" placeholder={t('admin.firstname')} value={registerForm.firstName} onChange={e => setRegisterForm({...registerForm, firstName: e.target.value})} required /><input className="border p-2 rounded-lg text-sm" placeholder={t('admin.lastname')} value={registerForm.lastName} onChange={e => setRegisterForm({...registerForm, lastName: e.target.value})} required /></div>
                            <input className="w-full border p-2 rounded-lg text-sm" placeholder={t('admin.ssn')} value={registerForm.ssn} onChange={e => setRegisterForm({...registerForm, ssn: e.target.value})} required />
                            <input className="w-full border p-2 rounded-lg text-sm" placeholder={t('admin.email')} type="email" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} required />
                            <div className="border-t pt-4 mt-2">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t('admin.account_role')}</label>
                                <div className="flex gap-2 mb-3">
                                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: 'STUDENT'})} className={`flex-1 py-2 text-xs font-bold rounded ${registerForm.role === 'STUDENT' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Student</button>
                                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: 'TEACHER'})} className={`flex-1 py-2 text-xs font-bold rounded ${registerForm.role === 'TEACHER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t('admin.teacher')}</button>
                                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: 'ADMIN'})} className={`flex-1 py-2 text-xs font-bold rounded ${registerForm.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Admin</button>
                                </div>
                                <div className="flex gap-2"><input className="flex-1 border p-2 rounded-lg text-sm font-mono" placeholder={t('auth.username')} value={registerForm.username} onChange={e => setRegisterForm({...registerForm, username: e.target.value})} required /><button type="button" onClick={handleGenerateUsernames} className="bg-gray-200 px-3 rounded-lg text-xs font-bold hover:bg-gray-300">{t('admin.generate')}</button></div>
                                {usernameSuggestions.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{usernameSuggestions.map(u => (<span key={u} onClick={() => setRegisterForm({...registerForm, username: u})} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100">{u}</span>))}</div>)}
                                <input className="w-full border p-2 rounded-lg text-sm mt-3" placeholder={t('admin.password')} type="password" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} required />
                            </div>
                            <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">{t('admin.create_account')}</button>
                        </form>
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">{t('admin.registered_users')} ({users.length})</div>
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase sticky top-0"><tr><th className="p-4">{t('common.name')}</th><th className="p-4">{t('course.role')}</th><th className="p-4">{t('auth.username')}</th><th className="p-4 text-right">{t('common.action')}</th></tr></thead>
                                <tbody className="divide-y">
                                {users.map(u => (<tr key={u.id} className="hover:bg-gray-50"><td className="p-4 font-bold">{u.fullName}</td><td className="p-4"><span className={`text-xs px-2 py-1 rounded font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'TEACHER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td><td className="p-4 font-mono text-gray-500">{u.username}</td><td className="p-4 text-right">{u.id !== currentUser.id && (<button onClick={() => handleAttemptDeleteUser(u)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>)}</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FLIK: KURSER --- */}
            {adminTab === 'courses' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">{t('admin.course_overview')}</h3>
                        <button onClick={() => setShowCourseModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 flex items-center gap-2"><Plus size={20} /> {t('admin.create_course')}</button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex-1 relative"><Search size={20} className="absolute left-3 top-2.5 text-gray-400"/><input type="text" placeholder={t('admin.search_course')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} /></div>
                        <div className="flex items-center gap-2"><Filter size={20} className="text-gray-500"/><select className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}><option value="ALL">{t('dashboard.all_statuses')}</option><option value="OPEN">{t('dashboard.open')}</option><option value="CLOSED">{t('dashboard.closed')}</option></select></div>
                    </div>
                    {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredCourses.map(course => (
                                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className={`h-2 ${course.color || 'bg-indigo-600'}`}></div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4"><div><span className="text-xs font-bold font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">{course.courseCode}</span>{!course.isOpen && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">{t('dashboard.closed')}</span>}<h3 className="font-bold text-lg leading-tight">{course.name}</h3></div><div className="relative"><button onClick={() => handleDeleteCourse(course.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1" title={t('common.delete')}><Trash2 size={18} /></button></div></div>
                                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">{course.description || "Ingen beskrivning."}</p>
                                        <div className="grid grid-cols-2 gap-3"><button onClick={() => setEditingCourse(course)} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"><Settings size={16} /> {t('admin.settings')}</button><button onClick={() => navigate(`/course/${course.id}`)} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">{t('admin.content')} <ExternalLink size={16} /></button></div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 border-t text-xs text-gray-500 flex justify-between"><span>{t('admin.teacher')}: {course.teacher?.fullName || 'Ej tilldelad'}</span><span>{t('admin.students')}: {course.students?.length || 0}</span></div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300"><BookOpen size={48} className="mx-auto text-gray-300 mb-2"/><p className="text-gray-500 font-bold">{t('admin.no_courses')}</p></div>}
                </div>
            )}

            {/* --- FLIK: DOKUMENT --- */}
            {adminTab === 'docs' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50"><h3 className="font-bold text-lg">{t('admin.global_docs')}</h3><button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"><UploadCloud size={16}/> {t('admin.upload_file')}</button></div>
                    {safeDocuments.length > 0 ? (
                        <table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 uppercase"><tr><th className="p-4">{t('common.name')}</th><th className="p-4">Ägare</th><th className="p-4">{t('common.date')}</th><th className="p-4 text-right">{t('common.action')}</th></tr></thead><tbody className="divide-y">{safeDocuments.map(d => (<tr key={d.id} className="hover:bg-gray-50"><td className="p-4 flex items-center gap-2 font-medium"><FileText size={16} className="text-gray-400"/>{d.title || d.fileName || d.name}</td><td className="p-4">{getOwnerName(d)}</td><td className="p-4 text-gray-500">{formatDate(d.uploadDate || d.date)}</td><td className="p-4 text-right"><button onClick={() => handleDeleteDoc(d.id, true)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={16}/></button></td></tr>))}</tbody></table>
                    ) : <div className="p-12 text-center text-gray-400">{t('admin.no_docs')}</div>}
                </div>
            )}

            {/* --- FLIK: INSTÄLLNINGAR --- */}
            {adminTab === 'settings' && (
                <div className="max-w-2xl"><div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"><div className="p-6 border-b bg-gray-50"><h3 className="font-bold text-lg">{t('admin.module_management')}</h3><p className="text-sm text-gray-500">Hantera globala inställningar.</p></div><div className="p-6 space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200"><label className="block text-sm font-bold text-gray-700 mb-2">{t('admin.site_name')}</label><div className="flex gap-2"><input type="text" className="flex-1 border p-2 rounded-lg text-sm" placeholder="T.ex. Klinteskolan - EduFlex" defaultValue={systemSettings && systemSettings['site_name']} onBlur={(e) => onUpdateSetting('site_name', e.target.value)} /><button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">{t('common.save')}</button></div></div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"><div><h4 className="font-bold text-gray-900">{t('admin.registration')}</h4><p className="text-xs text-gray-500">{t('admin.registration_desc')}</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={systemSettings && systemSettings['registration_open'] === 'true'} onChange={(e) => onUpdateSetting('registration_open', e.target.checked ? 'true' : 'false')} /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div></label></div>
                    <div className="p-4 bg-gray-100 rounded-xl border border-gray-200 flex justify-between items-center opacity-70"><div><h4 className="font-bold text-gray-700">{t('admin.version')}</h4><p className="text-xs text-gray-500">Kan endast uppdateras av systemutvecklare.</p></div><span className="font-mono font-bold text-gray-600 bg-gray-200 px-3 py-1 rounded">{systemSettings && systemSettings['system_version'] ? systemSettings['system_version'] : '1.0.0'}</span></div>
                </div></div></div>
            )}

            {/* --- FLIK: MODULER / MARKNADSPLATS --- */}
            {adminTab === 'modules' && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Modul & Tillägg</h2>
                            <p className="text-gray-500">Aktivera eller inaktivera systemfunktioner.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* --- CHATT MODUL --- */}
                        <div className={`p-6 rounded-xl border-2 transition-all ${systemSettings['chat_enabled'] === 'true' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white grayscale'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600"><MessageSquare size={24}/></div>
                                <button onClick={() => onUpdateSetting('chat_enabled', systemSettings['chat_enabled'] === 'true' ? 'false' : 'true')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${systemSettings['chat_enabled'] === 'true' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{systemSettings['chat_enabled'] === 'true' ? 'Installerad' : 'Installera'}</button>
                            </div>
                            <h3 className="font-bold text-lg mb-1">EduChat Pro</h3>
                            <p className="text-sm text-gray-600 mb-4 h-10">Realtidskommunikation för lärare och elever med WebSocket-stöd.</p>
                            <div className="text-xs font-mono text-gray-400">v2.1.0 • Core Module</div>
                        </div>

                        {/* --- GAMIFICATION MODUL (Mockup) --- */}
                        <div className={`p-6 rounded-xl border-2 transition-all ${systemSettings['gamification_enabled'] === 'true' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-orange-500"><Award size={24}/></div>
                                <button onClick={() => onUpdateSetting('gamification_enabled', systemSettings['gamification_enabled'] === 'true' ? 'false' : 'true')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${systemSettings['gamification_enabled'] === 'true' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{systemSettings['gamification_enabled'] === 'true' ? 'Aktiv' : 'Aktivera'}</button>
                            </div>
                            <h3 className="font-bold text-lg mb-1">Gamification Pack</h3>
                            <p className="text-sm text-gray-600 mb-4 h-10">Lås upp badges, XP-system och topplistor för kurser.</p>
                            <div className="text-xs font-mono text-gray-400">v1.0.5 • Tillägg</div>
                        </div>

                        {/* --- DARK MODE (System Theme) --- */}
                        <div className={`p-6 rounded-xl border-2 transition-all ${systemSettings['dark_mode_enabled'] === 'true' ? 'border-gray-800 bg-gray-100' : 'border-gray-200 bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-800 rounded-lg shadow-sm text-white"><Moon size={24}/></div>
                                <button onClick={() => onUpdateSetting('dark_mode_enabled', systemSettings['dark_mode_enabled'] === 'true' ? 'false' : 'true')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${systemSettings['dark_mode_enabled'] === 'true' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}>{systemSettings['dark_mode_enabled'] === 'true' ? 'PÅ' : 'AV'}</button>
                            </div>
                            <h3 className="font-bold text-lg mb-1">Dark Mode Core</h3>
                            <p className="text-sm text-gray-600 mb-4 h-10">Möjliggör mörkt läge för hela plattformen.</p>
                            <div className="text-xs font-mono text-gray-400">v3.0.0 • UI Patch</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;