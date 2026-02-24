import React, { useState, useEffect } from 'react';
import { X, Calendar, Book, Download, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ReportGeneratorModal = ({ isOpen, onClose, onGenerated }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingCourses, setFetchingCourses] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        setFetchingCourses(true);
        try {
            const response = await api.get('/courses');
            setCourses(response || []);
        } catch (error) {
            console.error('Failed to fetch courses', error);
            toast.error('Kunde inte hämta kurser');
        } finally {
            setFetchingCourses(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedCourse || !startDate || !endDate) {
            toast.error('Vänligen fyll i alla fält');
            return;
        }

        setLoading(true);
        try {
            // Vi skickar som LocalDateTime ISO strängar
            const startStr = `${startDate}T00:00:00`;
            const endStr = `${endDate}T23:59:59`;

            const response = await api.get(`/reports/csn/attendance/${selectedCourse}`, {
                params: { start: startStr, end: endStr }
            });

            toast.success('Rapport genererad!');
            onGenerated(response);
            onClose();
        } catch (error) {
            console.error('Failed to generate report', error);
            toast.error('Ett fel uppstod vid generering');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Generera CSN-Rapport</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Närvaro-sammanställning för efterlevnad</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-2xl shadow-sm transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Kursval */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Välj Kurs</label>
                        <div className="relative">
                            <Book className="absolute left-4 top-3.5 text-indigo-500" size={18} />
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all appearance-none"
                                disabled={fetchingCourses}
                            >
                                <option value="">Välj en kurs...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Datumintervall */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Från Datum</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 text-indigo-500" size={18} />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Till Datum</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 text-indigo-500" size={18} />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || fetchingCourses}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                            {loading ? 'Genererar...' : 'Skapa Rapport'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportGeneratorModal;
