import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Save, User as UserIcon, TrendingUp, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

const BusinessOutcomeImport = ({ courseId, onComplete }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        metricName: 'Försäljning / KPI',
        metricValue: ''
    });

    useEffect(() => {
        if (courseId) {
            loadStudents();
        }
    }, [courseId]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            // Get course with enrolled students
            const course = await api.courses.getOne(courseId);
            // Use students enrolled in the course directly from the CourseDTO
            setStudents(course.students || []);
        } catch (e) {
            console.error("Failed to load students", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userId || !formData.metricValue) return;

        setSubmitting(true);
        setMessage(null);
        try {
            await api.analytics.roi.saveOutcome({
                ...formData,
                courseId
            });
            setMessage({ type: 'success', text: 'Data sparad framgångsrikt!' });
            setFormData({ ...formData, metricValue: '' });
            if (onComplete) onComplete();
        } catch (e) {
            setMessage({ type: 'error', text: 'Kunde inte spara data: ' + e.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" />
                Registrera Affärsmål (KPI)
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Student</label>
                        <div className="relative">
                            <select
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-[#282a2c] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white appearance-none"
                                required
                            >
                                <option value="">Välj student...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.username})</option>
                                ))}
                            </select>
                            <UserIcon className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">KPI Namn</label>
                        <input
                            type="text"
                            value={formData.metricName}
                            onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-[#282a2c] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            placeholder="t.ex. Försäljning dec"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Målvärde (Numeriskt)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.metricValue}
                            onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-[#282a2c] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'} animate-bounce-subtle`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        {submitting ? 'Sparar...' : (
                            <>
                                <Save size={18} />
                                Spara KPI-data
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-8 p-6 bg-gray-50 dark:bg-[#282a2c] rounded-2xl border border-gray-100 dark:border-[#3c4043]">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    Tips för ROI-analys
                </h4>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-2 list-disc pl-4">
                    <li>Använd numeriska värden som går att korrelera (t.ex. försäljningssiffor, antal avslutade ärenden, CSAT-score).</li>
                    <li>Säkerställ att mätvärdet är inspelat EFTER att studenten genomfört sina AI-övningar i kursen.</li>
                    <li>ROI-diagrammet uppdateras automatiskt så fort du sparar nya värden.</li>
                </ul>
            </div>
        </div>
    );
};

export default BusinessOutcomeImport;
