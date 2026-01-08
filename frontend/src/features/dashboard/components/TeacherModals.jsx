import React, { useState, useEffect } from 'react';
import { X, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';

// --- CREATE COURSE ---
export const CreateCourseModal = ({ isOpen, onClose, onCourseCreated, currentUser }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;
    const [formData, setFormData] = useState({ name: '', courseCode: '', category: 'Programmering', description: '', startDate: '', endDate: '', color: 'bg-indigo-600', maxStudents: 30 });
    const [loading, setLoading] = useState(false);
    const colors = [{ name: 'Indigo', value: 'bg-indigo-600' }, { name: 'Röd', value: 'bg-red-600' }, { name: 'Grön', value: 'bg-emerald-600' }, { name: 'Blå', value: 'bg-blue-600' }, { name: 'Orange', value: 'bg-orange-500' }, { name: 'Lila', value: 'bg-purple-600' }];

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const payload = {
                ...formData,
                maxStudents: parseInt(formData.maxStudents),
                startDate: formData.startDate || null,
                endDate: formData.endDate || null
            };
            await api.courses.create(payload, currentUser.id);
            onCourseCreated(); onClose();
        } catch (error) { alert("Kunde inte skapa kursen."); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] p-6">
                <h3 className="font-bold text-lg mb-4 dark:text-white">{t('course_modal.create_title')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder={t('course_modal.name')} />
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value })} placeholder={t('course_modal.code')} />
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder={t('course_modal.category')} />
                    </div>
                    <textarea className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white min-h-[100px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder={t('course_modal.description')} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                    </div>
                    <input type="number" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.maxStudents} onChange={e => setFormData({ ...formData, maxStudents: e.target.value })} placeholder={t('course_modal.max_students')} />
                    <div className="flex gap-2">{colors.map(c => <button key={c.value} type="button" onClick={() => setFormData({ ...formData, color: c.value })} className={`w-6 h-6 rounded-full ${c.value} ${formData.color === c.value ? 'ring-2 ring-gray-400' : ''}`} />)}</div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">{t('common.cancel')}</button><button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{t('course_modal.create_btn')}</button></div>
                </form>
            </div>
        </div>
    );
};

// --- EDIT COURSE ---
export const EditCourseModal = ({ isOpen, onClose, onCourseUpdated, courseToEdit }) => {
    const { t } = useTranslation();
    if (!isOpen || !courseToEdit) return null;
    const [formData, setFormData] = useState({ name: '', courseCode: '', category: '', description: '', startDate: '', endDate: '', color: '', isOpen: true, maxStudents: 30, classroomLink: '', classroomType: 'ZOOM', examLink: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (courseToEdit) {
            setFormData({
                name: courseToEdit.name || '', courseCode: courseToEdit.courseCode || '', category: courseToEdit.category || '', description: courseToEdit.description || '',
                startDate: courseToEdit.startDate || '', endDate: courseToEdit.endDate || '', color: courseToEdit.color || 'bg-indigo-600', isOpen: courseToEdit.isOpen,
                maxStudents: courseToEdit.maxStudents || 30, classroomLink: courseToEdit.classroomLink || '', classroomType: courseToEdit.classroomType || 'ZOOM', examLink: courseToEdit.examLink || ''
            });
        }
    }, [courseToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await api.courses.update(courseToEdit.id, { ...formData, maxStudents: parseInt(formData.maxStudents) });
            onCourseUpdated(); onClose();
        } catch (error) { alert("Kunde inte uppdatera kursen."); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden my-8 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('course_modal.edit_title')}</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                    <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value })} />
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <textarea className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white min-h-[100px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder={t('course_modal.description')} />
                    {/* Digitalt Klassrum */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2"><Video size={14} /> {t('course_modal.classroom_section')}</h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <select className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm" value={formData.classroomType} onChange={e => setFormData({ ...formData, classroomType: e.target.value })}><option value="ZOOM">Zoom</option><option value="TEAMS">Teams</option><option value="MEET">Meet</option></select>
                            <input className="col-span-2 w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm" value={formData.classroomLink} onChange={e => setFormData({ ...formData, classroomLink: e.target.value })} placeholder={t('course_modal.classroom_link')} />
                        </div>
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm" value={formData.examLink} onChange={e => setFormData({ ...formData, examLink: e.target.value })} placeholder={t('course_modal.exam_link')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">{t('common.cancel')}</button><button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{t('common.save')}</button></div>
                </form>
            </div>
        </div>
    );
};