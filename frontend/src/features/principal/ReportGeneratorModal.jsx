import React, { useState, useEffect } from 'react';
import { X, Calendar, Book, Download, Loader2, FileSpreadsheet, FileText, Layers } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * Modal för att generera CSN-rapporter.
 * Stödjer enskild kurs eller bulk-export (alla valda kurser).
 * Exportformat: JSON (rendererad tabell) eller Excel (.xlsx).
 */
const ReportGeneratorModal = ({ isOpen, onClose, onGenerated }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [exportFormat, setExportFormat] = useState('json'); // json = tabell, excel = .xlsx

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
            // Förifyllda datum: senaste 30 dagarna
            const today = new Date();
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            setEndDate(today.toISOString().split('T')[0]);
            setStartDate(monthAgo.toISOString().split('T')[0]);
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

    const toggleCourse = (courseId) => {
        setSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const selectAll = () => {
        if (selectedCourses.length === courses.length) {
            setSelectedCourses([]);
        } else {
            setSelectedCourses(courses.map(c => c.id));
        }
    };

    const handleGenerate = async () => {
        if (selectedCourses.length === 0 || !startDate || !endDate) {
            toast.error('Välj minst en kurs och fyll i datumintervall');
            return;
        }

        setLoading(true);
        try {
            const startStr = `${startDate}T00:00:00`;
            const endStr = `${endDate}T23:59:59`;

            if (exportFormat === 'excel' && selectedCourses.length === 1) {
                // Direkt Excel-download för enskild kurs
                const response = await api.get(`/reports/csn/attendance/${selectedCourses[0]}/excel`, {
                    params: { start: startStr, end: endStr },
                    responseType: 'blob'
                });

                const blob = new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `CSN_Rapport_${startDate}_${endDate}.xlsx`);
                link.click();
                URL.revokeObjectURL(url);

                toast.success('Excel-rapport nedladdad!');
                onClose();
            } else if (selectedCourses.length === 1) {
                // Enskild kurs → JSON för tabellvisning
                const response = await api.get(`/reports/csn/attendance/${selectedCourses[0]}`, {
                    params: { start: startStr, end: endStr }
                });
                toast.success('Rapport genererad!');
                onGenerated(response);
                onClose();
            } else {
                // Bulk-export → flera kurser
                const response = await api.post('/reports/csn/attendance/bulk', {
                    courseIds: selectedCourses,
                    start: startStr,
                    end: endStr
                });
                toast.success(`Rapport genererad för ${selectedCourses.length} kurser!`);
                onGenerated(response);
                onClose();
            }
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
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Närvaro + aktivitet + kursresultat</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-2xl shadow-sm transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Kursval med flerval */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Välj Kurser</label>
                            <button
                                onClick={selectAll}
                                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest"
                            >
                                {selectedCourses.length === courses.length ? 'Avmarkera alla' : 'Välj alla'}
                            </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-1.5">
                            {fetchingCourses ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-indigo-400" size={24} />
                                </div>
                            ) : courses.map(course => (
                                <label
                                    key={course.id}
                                    className={`flex items-center gap-3 py-2.5 px-4 rounded-xl cursor-pointer transition-all ${selectedCourses.includes(course.id)
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCourses.includes(course.id)}
                                        onChange={() => toggleCourse(course.id)}
                                        className="w-4 h-4 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white block truncate">{course.name}</span>
                                        {course.courseCode && (
                                            <span className="text-[10px] text-gray-400 font-bold">{course.courseCode}</span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                        {selectedCourses.length > 0 && (
                            <p className="text-[10px] font-bold text-indigo-500 ml-1">
                                {selectedCourses.length} kurs{selectedCourses.length > 1 ? 'er' : ''} vald{selectedCourses.length > 1 ? 'a' : ''}
                            </p>
                        )}
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

                    {/* Exportformat */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exportformat</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setExportFormat('json')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${exportFormat === 'json'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <FileText size={16} />
                                Tabell / CSV
                            </button>
                            <button
                                onClick={() => setExportFormat('excel')}
                                disabled={selectedCourses.length > 1}
                                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${exportFormat === 'excel'
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none'
                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-gray-600'
                                    } ${selectedCourses.length > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <FileSpreadsheet size={16} />
                                Excel (.xlsx)
                            </button>
                        </div>
                        {selectedCourses.length > 1 && exportFormat === 'json' && (
                            <p className="text-[10px] font-bold text-amber-500 ml-1">
                                Bulk-export stödjer tabell/CSV. Excel-export fungerar för enskild kurs.
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || fetchingCourses || selectedCourses.length === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                            {loading ? 'Genererar...' : exportFormat === 'excel' ? 'Ladda ner Excel' : 'Skapa Rapport'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportGeneratorModal;
