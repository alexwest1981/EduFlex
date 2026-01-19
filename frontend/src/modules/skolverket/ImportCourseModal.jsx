import React, { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, User as UserIcon, Loader2, Check } from 'lucide-react';
import { api } from '../../services/api';

const ImportCourseModal = ({ subject, onClose, onImport }) => {
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    // Form State
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            // Fetch all users and filter for teachers
            // Assuming /api/users returns pagination object or list
            const res = await api.get('/users?size=1000');
            const users = res.content || res || []; // Handle Page<User> or List<User>

            // Filter: Role name contains 'TEACHER' or 'ADMIN' (admins can also be teachers)
            // Adjust based on your Role model structure (e.g., user.role.name)
            const teacherList = users.filter(u =>
                u.role?.name === 'TEACHER' || u.role?.name === 'ROLE_TEACHER' || u.role?.name === 'ADMIN'
            );

            setTeachers(teacherList);
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        } finally {
            setLoadingTeachers(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            code: subject.code,
            name: subject.name,
            description: subject.description,
            teacherId: selectedTeacher ? parseInt(selectedTeacher) : null,
            startDate: startDate || null,
            endDate: endDate || null
        };

        await onImport(payload);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-[#282a2c] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#282a2c] flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">Importera Kurs</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kursnamn</label>
                        <input
                            type="text"
                            value={subject.name}
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lärare</label>
                        <div className="relative">
                            <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Välj en lärare...</option>
                                {loadingTeachers ? (
                                    <option disabled>Laddar...</option>
                                ) : (
                                    teachers.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.firstName} {t.lastName} ({t.email})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum</label>
                            <div className="relative">
                                <CalIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slutdatum</label>
                            <div className="relative">
                                <CalIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Avbryt
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Importera
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportCourseModal;
