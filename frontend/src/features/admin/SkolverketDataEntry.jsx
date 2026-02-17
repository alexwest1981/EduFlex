import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Book, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const SkolverketDataEntry = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        englishTitle: '',
        skolformer: '',
        pdfUrl: '',
        subjectPurpose: '',
        objectives: ''
    });
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('grundinfo');
    const [stats, setStats] = useState({ total: 0, completed: 0 });

    useEffect(() => {
        fetchCourses();
        fetchStats();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await api.get('/skolverket/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await api.get('/skolverket/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const loadCourseData = async (course) => {
        setLoading(true);
        setSelectedCourse(course);

        // Load existing data
        setFormData({
            description: course.description || '',
            englishTitle: course.englishTitle || '',
            skolformer: course.skolformer || '',
            pdfUrl: course.pdfUrl || '',
            subjectPurpose: course.subjectPurpose || '',
            objectives: course.objectives || ''
        });

        // Load criteria
        try {
            const criteriaData = await api.get(`/skolverket/courses/${course.courseCode}/criteria`);
            setCriteria(criteriaData.length > 0 ? criteriaData : getDefaultCriteria());
        } catch (error) {
            setCriteria(getDefaultCriteria());
        }

        setLoading(false);
    };

    const getDefaultCriteria = () => {
        return [
            { gradeLevel: 'E', criteriaText: '', sortOrder: 1 },
            { gradeLevel: 'D', criteriaText: '', sortOrder: 2 },
            { gradeLevel: 'C', criteriaText: '', sortOrder: 3 },
            { gradeLevel: 'B', criteriaText: '', sortOrder: 4 },
            { gradeLevel: 'A', criteriaText: '', sortOrder: 5 }
        ];
    };

    const handleSave = async () => {
        if (!selectedCourse) return;

        setSaving(true);
        try {
            // Save course details
            await api.put(`/skolverket/courses/${selectedCourse.courseCode}/details`, formData);

            // Save grading criteria
            const validCriteria = criteria.filter(c => c.criteriaText.trim() !== '');
            if (validCriteria.length > 0) {
                await api.post(`/skolverket/courses/${selectedCourse.courseCode}/criteria`, validCriteria);
            }

            alert('Data sparad!');
            fetchStats();
        } catch (error) {
            alert('Kunde inte spara: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        if (!selectedCourse) return;

        setLoading(true);
        try {
            await api.post(`/skolverket/api/sync/${selectedCourse.courseCode}`);
            // Reload course data to show updated fields
            const updatedCourses = await api.get('/skolverket/courses');
            setCourses(updatedCourses);
            const freshCourse = updatedCourses.find(c => c.courseCode === selectedCourse.courseCode);
            if (freshCourse) loadCourseData(freshCourse);

            toast.success('Data synkad med Skolverket!');
        } catch (error) {
            alert('Kunde inte synka: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateCriteria = (index, field, value) => {
        const updated = [...criteria];
        updated[index][field] = value;
        setCriteria(updated);
    };

    const tabs = [
        { id: 'grundinfo', label: 'Grundinfo' },
        { id: 'innehall', label: 'Innehåll' },
        { id: 'kunskapskrav', label: 'Kunskapskrav' }
    ];

    const gradeColors = {
        E: 'bg-green-100 dark:bg-green-900/30 border-green-500',
        D: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500',
        C: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500',
        B: 'bg-purple-100 dark:bg-purple-900/30 border-purple-500',
        A: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500'
    };

    return (
        <div className="space-y-6">
            {/* Header with Progress */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skolverket Data Entry</h2>
                        <p className="text-gray-600 dark:text-gray-400">Fyll i detaljerad kursinformation manuellt</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            {stats.completed}/{stats.total}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">kurser ifyllda</div>
                    </div>
                </div>

                {/* Course Selector */}
                <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Välj kurs
                    </label>
                    <select
                        value={selectedCourse?.courseCode || ''}
                        onChange={(e) => {
                            const course = courses.find(c => c.courseCode === e.target.value);
                            if (course) loadCourseData(course);
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-[#282a2c] border border-gray-300 dark:border-[#3c4043] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">-- Välj en kurs --</option>
                        {courses.map(course => (
                            <option key={course.courseCode} value={course.courseCode}>
                                {course.courseCode} - {course.courseName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Entry Form */}
            {selectedCourse && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Grundinfo Tab */}
                    {activeTab === 'grundinfo' && (
                        <div className="space-y-4">
                            <InputField
                                label="Engelsk titel"
                                value={formData.englishTitle}
                                onChange={(e) => setFormData({ ...formData, englishTitle: e.target.value })}
                                placeholder="Administration 1"
                            />
                            <InputField
                                label="Skolformer"
                                value={formData.skolformer}
                                onChange={(e) => setFormData({ ...formData, skolformer: e.target.value })}
                                placeholder="VUXGYM, GYAN"
                            />
                            <InputField
                                label="PDF URL"
                                value={formData.pdfUrl}
                                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                                placeholder="https://syllabus-web.skolverket.se/..."
                            />
                        </div>
                    )}

                    {/* Innehåll Tab */}
                    {activeTab === 'innehall' && (
                        <div className="space-y-4">
                            <TextAreaField
                                label="Beskrivning"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Kursen administration 1 omfattar punkterna 1–3..."
                                rows={6}
                            />
                            <TextAreaField
                                label="Ämnets syfte"
                                value={formData.subjectPurpose}
                                onChange={(e) => setFormData({ ...formData, subjectPurpose: e.target.value })}
                                placeholder="Undervisningen i ämnet administration ska syfta till..."
                                rows={8}
                            />
                            <TextAreaField
                                label="Kursmål / Undervisningen ska ge eleverna förutsättningar att utveckla följande"
                                value={formData.objectives}
                                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                                placeholder="1. Kunskap om organisation och administrativt arbete..."
                                rows={8}
                            />
                        </div>
                    )}

                    {/* Kunskapskrav Tab */}
                    {activeTab === 'kunskapskrav' && (
                        <div className="space-y-4">
                            {criteria.map((criterion, index) => (
                                <div key={index} className={`p-4 rounded-lg border-l-4 ${gradeColors[criterion.gradeLevel]}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-lg">Betyget {criterion.gradeLevel}</h3>
                                    </div>
                                    <textarea
                                        value={criterion.criteriaText}
                                        onChange={(e) => updateCriteria(index, 'criteriaText', e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white dark:bg-[#282a2c] border border-gray-300 dark:border-[#3c4043] rounded-lg text-gray-900 dark:text-white resize-none"
                                        placeholder={`Kriterier för betyg ${criterion.gradeLevel}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            <Save size={20} />
                            {saving ? 'Sparar...' : 'Spara'}
                        </button>
                        <button
                            onClick={handleSync}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            <Book size={20} />
                            {loading ? 'Synkar...' : 'Synka med Skolverket'}
                        </button>
                        <button
                            onClick={() => setSelectedCourse(null)}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-[#282a2c] hover:bg-gray-300 dark:hover:bg-[#3c4043] text-gray-900 dark:text-white rounded-lg font-medium"
                        >
                            <X size={20} />
                            Avbryt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-white dark:bg-[#282a2c] border border-gray-300 dark:border-[#3c4043] rounded-lg text-gray-900 dark:text-white"
        />
    </div>
);

const TextAreaField = ({ label, value, onChange, placeholder, rows }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 bg-white dark:bg-[#282a2c] border border-gray-300 dark:border-[#3c4043] rounded-lg text-gray-900 dark:text-white resize-none"
        />
    </div>
);

export default SkolverketDataEntry;
