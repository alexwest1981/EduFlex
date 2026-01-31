import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';
import SkolverketCourseSelector from '../../../../components/SkolverketCourseSelector';

import { COURSE_CATEGORIES } from '../../../../constants/courseCategories';

const COURSE_COLORS = [
    { value: 'bg-indigo-600', label: 'Indigo' },
    { value: 'bg-blue-600', label: 'Blue' },
    { value: 'bg-green-600', label: 'Green' },
    { value: 'bg-red-600', label: 'Red' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-purple-600', label: 'Purple' },
    { value: 'bg-pink-600', label: 'Pink' },
    { value: 'bg-gray-800', label: 'Black' }
];

// --- CREATE USER ---
export const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', role: 'STUDENT' });
    const [loading, setLoading] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            api.roles.getAll().then(setRoleList).catch(err => console.error("Failed to fetch roles", err));
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            await api.users.register(formData);
            onUserCreated();
            onClose();
        } catch (error) {
            setErrorMsg(t('messages.register_error') || "Kunde inte skapa användare. Kontrollera uppgifterna.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('admin.register_new_user')}</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errorMsg}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.firstname')} value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.lastname')} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                    <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('auth.username')} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    <input required type="email" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.email')} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input required type="password" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.password')} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <select className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        {roleList && roleList.length > 0 ? (
                            roleList.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))
                        ) : (
                            <>
                                <option value="STUDENT">{t('auth.student')}</option>
                                <option value="TEACHER">{t('auth.teacher')}</option>
                                <option value="ADMIN">{t('auth.admin')}</option>
                            </>
                        )}
                    </select>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">{loading ? t('common.loading') : t('admin.create_account')}</button>
                </form>
            </div>
        </div>
    );
};

// --- EDIT USER ---
export const EditUserModal = ({ isOpen, onClose, onUserUpdated, userToEdit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', username: '', role: '' });
    const [loading, setLoading] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                firstName: userToEdit.firstName || '',
                lastName: userToEdit.lastName || '',
                email: userToEdit.email || '',
                username: userToEdit.username || '',
                role: userToEdit.role?.name || userToEdit.role || 'STUDENT'
            });
        }
    }, [userToEdit]);

    useEffect(() => {
        if (isOpen) {
            api.roles.getAll().then(setRoleList).catch(err => console.error("Failed to fetch roles", err));
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            await api.users.update(userToEdit.id, formData);
            onUserUpdated();
            onClose();
        } catch (error) {
            setErrorMsg(t('messages.setting_error') || "Kunde inte uppdatera användare. Kontrollera uppgifterna.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !userToEdit) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('admin.edit_user')}</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errorMsg}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Förnamn" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Efternamn" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                    <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Användarnamn" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    <input required type="email" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <select className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        {roleList && roleList.length > 0 ? (
                            roleList.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))
                        ) : (
                            <>
                                <option value="STUDENT">{t('auth.student')}</option>
                                <option value="TEACHER">{t('auth.teacher')}</option>
                                <option value="ADMIN">{t('auth.admin')}</option>
                            </>
                        )}
                    </select>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">{loading ? t('common.loading') : t('dashboard.active')}</button>
                </form>
            </div>
        </div>
    );
};


// --- CREATE COURSE ---
export const CreateCourseModal = ({ isOpen, onClose, onCourseCreated, teachers }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', courseCode: '', description: '', category: 'Övrigt', tags: '', teacherId: '', startDate: '', endDate: '', color: 'bg-indigo-600', maxStudents: 30, isOpen: true });
    const [loading, setLoading] = useState(false);
    const [useSkolverket, setUseSkolverket] = useState(false);
    const [showSkolverketSelector, setShowSkolverketSelector] = useState(false);
    const [selectedSkolverketCourse, setSelectedSkolverketCourse] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.courses.create({ ...formData, maxStudents: parseInt(formData.maxStudents), skolverketCourseId: selectedSkolverketCourse?.id }, formData.teacherId);
            onCourseCreated();
            onClose();
            setSelectedSkolverketCourse(null);
            setUseSkolverket(false);
        } catch (error) { alert(t('course.error_occurred') || "Kunde inte skapa kursen."); } finally { setLoading(false); }
    };

    const handleSkolverketSelect = (course) => {
        setSelectedSkolverketCourse(course);
        setFormData({
            ...formData,
            name: course.courseName,
            courseCode: course.courseCode,
            category: course.subject,
            description: course.description || formData.description // Use Skolverket description if available
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('admin.create_course')}</h3>
                        <button onClick={onClose}><X className="text-gray-500" size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043]">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Öppen för studenter</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isOpen ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {/* Skolverket Option */}
                        <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                            <input type="checkbox" id="useSkolverket" checked={useSkolverket} onChange={(e) => { setUseSkolverket(e.target.checked); if (!e.target.checked) setSelectedSkolverketCourse(null); }} className="w-4 h-4" />
                            <label htmlFor="useSkolverket" className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{t('admin.base_on_skolverket')}</label>
                        </div>
                        {useSkolverket && (
                            <div>
                                {selectedSkolverketCourse ? (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex justify-between">
                                            <div>
                                                <span className="font-mono text-sm font-bold text-green-700 dark:text-green-400">{selectedSkolverketCourse.courseCode}</span>
                                                <h4 className="font-bold text-green-900 dark:text-green-100 mt-1">{selectedSkolverketCourse.courseName}</h4>
                                                <p className="text-sm text-green-700 dark:text-green-300">{selectedSkolverketCourse.subject} • {selectedSkolverketCourse.points}p</p>
                                            </div>
                                            <button type="button" onClick={() => setSelectedSkolverketCourse(null)} className="text-green-600"><X size={20} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setShowSkolverketSelector(true)} className="w-full p-3 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium">{t('admin.choose_skolverket_course')}</button>
                                )}
                            </div>
                        )}
                        <input required className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.course_name')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <input required className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.course_code')} value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value })} />
                            <select className="w-full p2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="">{t('course_modal.category')}...</option>
                                {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">{t('admin.start_date') || 'Startdatum'}</label>
                                <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">{t('admin.end_date') || 'Slutdatum'}</label>
                                <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                            </div>
                        </div>
                        <input type="number" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.max_seats')} value={formData.maxStudents} onChange={e => setFormData({ ...formData, maxStudents: e.target.value })} />

                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder={t('admin.tags')} />

                        {/* DIGITAL CLASSROOM SETTINGS */}
                        <div className="p-4 bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#3c4043] rounded-lg space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.digital_classroom')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <select className="w-full p-2 text-sm border rounded dark:bg-[#1E1F20] dark:border-[#3c4043] dark:text-white" value={formData.classroomType || ''} onChange={e => setFormData({ ...formData, classroomType: e.target.value })}>
                                    <option value="">{t('admin.choose_platform')}</option>
                                    <option value="ZOOM">Zoom</option>
                                    <option value="TEAMS">Microsoft Teams</option>
                                    <option value="MEET">Google Meet</option>
                                    <option value="DISCORD">Discord</option>
                                </select>
                                <input className="w-full p-2 text-sm border rounded dark:bg-[#1E1F20] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.paste_link')} value={formData.classroomLink || ''} onChange={e => setFormData({ ...formData, classroomLink: e.target.value })} />
                            </div>
                        </div>

                        {/* COLORS */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">{t('admin.color_theme')}</label>
                            <div className="flex gap-2 flex-wrap">
                                {COURSE_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c.value })}
                                        className={`w-8 h-8 rounded-full ${c.value} ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : 'opacity-70 hover:opacity-100'}`}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <select className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })}><option value="">{t('admin.choose_teacher')}</option>{teachers.map(t => (<option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>))}</select>
                        <textarea className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white h-20 resize-none" placeholder={t('admin.content')} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">{loading ? t('common.loading') : t('admin.create_course')}</button>
                    </form>
                </div>
            </div>
            {showSkolverketSelector && <SkolverketCourseSelector onSelect={handleSkolverketSelect} onClose={() => setShowSkolverketSelector(false)} />}
        </>
    );
};

// --- EDIT COURSE ---
export const EditCourseModal = ({ isOpen, onClose, onCourseUpdated, teachers, courseToEdit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', courseCode: '', category: '', description: '', tags: '', teacherId: '', startDate: '', endDate: '', color: '', maxStudents: 30, isOpen: true });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (courseToEdit) {
            setFormData({
                name: courseToEdit.name || '', courseCode: courseToEdit.courseCode || '', category: courseToEdit.category || 'Övrigt',
                description: courseToEdit.description || '', tags: courseToEdit.tags || '', teacherId: courseToEdit.teacher?.id || '', startDate: courseToEdit.startDate || '',
                endDate: courseToEdit.endDate || '', color: courseToEdit.color || 'bg-indigo-600', maxStudents: courseToEdit.maxStudents || 30,
                classroomType: courseToEdit.classroomType || '', classroomLink: courseToEdit.classroomLink || '',
                isOpen: courseToEdit.isOpen !== undefined ? courseToEdit.isOpen : true
            });
        }
    }, [courseToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await api.courses.update(courseToEdit.id, { ...formData, maxStudents: parseInt(formData.maxStudents) });
            onCourseUpdated(); onClose();
        } catch (error) { alert(t('course.error_occurred') || "Kunde inte uppdatera kursen."); } finally { setLoading(false); }
    };

    if (!isOpen || !courseToEdit) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('admin.edit_course')}</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-100 dark:border-[#3c4043]">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Öppen för studenter</span>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isOpen ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value })} />
                        <select className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="">{t('course_modal.category')}...</option>
                            {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">{t('admin.start_date')}</label>
                            <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">{t('admin.end_date')}</label>
                            <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>
                    </div>
                    <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" type="number" value={formData.maxStudents} onChange={e => setFormData({ ...formData, maxStudents: e.target.value })} />

                    <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder={t('admin.tags')} />

                    {/* DIGITAL CLASSROOM SETTINGS */}
                    <div className="p-4 bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#3c4043] rounded-lg space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.digital_classroom')}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <select className="w-full p-2 text-sm border rounded dark:bg-[#1E1F20] dark:border-[#3c4043] dark:text-white" value={formData.classroomType || ''} onChange={e => setFormData({ ...formData, classroomType: e.target.value })}>
                                <option value="">{t('admin.choose_platform')}</option>
                                <option value="ZOOM">Zoom</option>
                                <option value="TEAMS">Microsoft Teams</option>
                                <option value="MEET">Google Meet</option>
                                <option value="DISCORD">Discord</option>
                            </select>
                            <input className="w-full p-2 text-sm border rounded dark:bg-[#1E1F20] dark:border-[#3c4043] dark:text-white" placeholder={t('admin.paste_link')} value={formData.classroomLink || ''} onChange={e => setFormData({ ...formData, classroomLink: e.target.value })} />
                        </div>
                    </div>

                    {/* COLORS */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block">{t('admin.color_theme')}</label>
                        <div className="flex gap-2 flex-wrap">
                            {COURSE_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: c.value })}
                                    className={`w-8 h-8 rounded-full ${c.value} ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : 'opacity-70 hover:opacity-100'}`}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    <select className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })}><option value="">{t('admin.choose_teacher')}</option>{teachers?.map(t => (<option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>))}</select>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">{t('common.save')}</button>
                </form>
            </div>
        </div>
    );
};
