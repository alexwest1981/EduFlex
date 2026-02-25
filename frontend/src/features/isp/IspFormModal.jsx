import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Plus, Trash2, Loader2, GraduationCap, Sparkles, Wand2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Student & Grundinfo', 'Planens innehåll', 'Planerade kurser'];

const emptyForm = {
    studentId: '',
    studieform: 'PLATS',
    studyPacePct: 100,
    plannedStart: '',
    plannedEnd: '',
    syfte: '',
    bakgrund: '',
    mal: '',
    stodbehoV: '',
    counselorNotes: '',
    examensmal: '',
    kravPoang: 2500,
    validering: '',
    courses: [],
};

const emptyCourse = {
    courseName: '',
    courseCode: '',
    studyPacePct: 100,
    plannedStart: '',
    plannedEnd: '',
    points: 100,
    level: 'Gymnasial',
};

const IspFormModal = ({ isOpen, onClose, onSaved, existingPlan }) => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(emptyForm);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newCourse, setNewCourse] = useState({ ...emptyCourse });

    const isEditing = !!existingPlan;

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            if (existingPlan) {
                setForm({
                    studentId: existingPlan.student?.id || '',
                    studieform: existingPlan.studieform || 'PLATS',
                    studyPacePct: existingPlan.studyPacePct || 100,
                    plannedStart: existingPlan.plannedStart || '',
                    plannedEnd: existingPlan.plannedEnd || '',
                    syfte: existingPlan.syfte || '',
                    bakgrund: existingPlan.bakgrund || '',
                    mal: existingPlan.mal || '',
                    stodbehoV: existingPlan.stodbehoV || '',
                    counselorNotes: existingPlan.counselorNotes || '',
                    examensmal: existingPlan.examensmal || '',
                    kravPoang: existingPlan.kravPoang || 2500,
                    validering: existingPlan.validering || '',
                    courses: (existingPlan.plannedCourses || []).map(c => ({
                        courseName: c.courseName || '',
                        courseCode: c.courseCode || '',
                        studyPacePct: c.studyPacePct || 100,
                        plannedStart: c.plannedStart || '',
                        plannedEnd: c.plannedEnd || '',
                        points: c.points || 100,
                        level: c.level || 'Gymnasial',
                    })),
                });
            } else {
                setForm(emptyForm);
            }
            setNewCourse({ ...emptyCourse });
            fetchStudents();
        }
    }, [isOpen, existingPlan]);

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const data = await api.get('/users?role=STUDENT');
            setStudents(Array.isArray(data) ? data : (data?.content || []));
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setStudentsLoading(false);
        }
    };

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const addCourse = () => {
        if (!newCourse.courseName.trim()) {
            toast.error('Ange kursnamn');
            return;
        }
        setForm(prev => ({ ...prev, courses: [...prev.courses, { ...newCourse }] }));
        setNewCourse({ ...emptyCourse });
    };

    const removeCourse = (idx) => {
        setForm(prev => ({ ...prev, courses: prev.courses.filter((_, i) => i !== idx) }));
    };

    const validateStep = () => {
        if (step === 0) {
            if (!form.studentId) { toast.error('Välj en student'); return false; }
            if (!form.plannedStart) { toast.error('Ange planerat startdatum'); return false; }
        }
        return true;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                studentId: Number(form.studentId),
                studyPacePct: Number(form.studyPacePct),
                examensmal: form.examensmal,
                kravPoang: Number(form.kravPoang),
                courses: form.courses.map(c => ({
                    ...c,
                    studyPacePct: Number(c.studyPacePct),
                    points: Number(c.points),
                    plannedStart: c.plannedStart || null,
                    plannedEnd: c.plannedEnd || null,
                })),
                plannedStart: form.plannedStart || null,
                plannedEnd: form.plannedEnd || null,
                validering: form.validering,
            };

            if (isEditing) {
                await api.put(`/isp/${existingPlan.id}`, payload);
                toast.success('Studieplan uppdaterad');
            } else {
                await api.post('/isp', payload);
                toast.success('Studieplan skapad (utkast)');
            }
            onSaved();
        } catch (err) {
            console.error('Failed to save ISP', err);
            toast.error('Kunde inte spara studieplanen');
        } finally {
            setSaving(false);
        }
    };

    const handleAiSuggestions = async () => {
        if (!form.examensmal) {
            toast.error('Ange ett examensmål först för att AI ska veta vad den ska föreslå.');
            return;
        }

        const id = toast.loading('AI skriver kursförslag...');
        try {
            const suggestions = await api.post('/isp/suggest-courses', {
                examObjective: form.examensmal,
                studentId: form.studentId
            });

            if (Array.isArray(suggestions)) {
                setForm(prev => ({
                    ...prev,
                    courses: [...prev.courses, ...suggestions]
                }));
                toast.success(`Hittade ${suggestions.length} relevanta kurser!`, { id });
                setStep(2); // Gå till kurslistan
            }
        } catch (err) {
            console.error('AI Suggestion failed', err);
            toast.error('Kunde inte hämta AI-förslag just nu', { id });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                {isEditing ? 'Redigera studieplan' : 'Ny individuell studieplan'}
                            </h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Steg {step + 1} av {STEPS.length} · {STEPS[step]}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-8 pt-4 shrink-0">
                    <div className="flex gap-2">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-gray-800'}`} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar">

                    {/* Step 1: Student & Grundinfo */}
                    {step === 0 && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student *</label>
                                {studentsLoading ? (
                                    <div className="flex items-center gap-2 py-3 text-gray-400">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-sm font-bold">Laddar studenter...</span>
                                    </div>
                                ) : (
                                    <select
                                        value={form.studentId}
                                        onChange={e => set('studentId', e.target.value)}
                                        disabled={isEditing}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all disabled:opacity-60"
                                    >
                                        <option value="">Välj student...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.firstName} {s.lastName} ({s.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Studieform</label>
                                    <select
                                        value={form.studieform}
                                        onChange={e => set('studieform', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                    >
                                        <option value="PLATS">På plats</option>
                                        <option value="DISTANS">Distans</option>
                                        <option value="KOMBINERAD">Kombinerad</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Studietakt</label>
                                    <select
                                        value={form.studyPacePct}
                                        onChange={e => set('studyPacePct', Number(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                    >
                                        <option value={100}>100% – Heltid</option>
                                        <option value={75}>75%</option>
                                        <option value={50}>50% – Halvtid</option>
                                        <option value={25}>25%</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Planerat startdatum *</label>
                                    <input
                                        type="date"
                                        value={form.plannedStart}
                                        onChange={e => set('plannedStart', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Planerat slutdatum</label>
                                    <input
                                        type="date"
                                        value={form.plannedEnd}
                                        onChange={e => set('plannedEnd', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Examensmål</label>
                                    <input
                                        value={form.examensmal}
                                        onChange={e => set('examensmal', e.target.value)}
                                        placeholder="T.ex. Högskoleförberedande"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Krav poäng</label>
                                    <input
                                        type="number"
                                        value={form.kravPoang}
                                        onChange={e => set('kravPoang', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Validering / Tidigare meriter</label>
                                <textarea
                                    value={form.validering}
                                    onChange={e => set('validering', e.target.value)}
                                    placeholder="Tidigare kurser som tillgodoräknas..."
                                    rows={2}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-medium shadow-inner focus:ring-2 ring-indigo-500 transition-all resize-none"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleAiSuggestions}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transform hover:-translate-y-0.5 transition-all"
                                >
                                    <Sparkles size={16} />
                                    Få intelligenta kursförslag med AI
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 2: Planens innehåll */}
                    {step === 1 && (
                        <>
                            {[
                                { key: 'bakgrund', label: 'Bakgrund', placeholder: 'Beskriv studentens tidigare utbildning, arbetslivserfarenhet och kompetenser...' },
                                { key: 'syfte', label: 'Syfte', placeholder: 'Vad är syftet med studierna? Vad vill studenten uppnå?' },
                                { key: 'mal', label: 'Mål', placeholder: 'Konkreta studiemål och delmål...' },
                                { key: 'stodbehoV', label: 'Stödbehov', placeholder: 'Behov av extra stöd, anpassningar eller resurser...' },
                                { key: 'counselorNotes', label: 'SYV-noteringar (ej synliga för student)', placeholder: 'Interna noteringar...' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
                                    <textarea
                                        value={form[key]}
                                        onChange={e => set(key, e.target.value)}
                                        placeholder={placeholder}
                                        rows={key === 'counselorNotes' ? 2 : 3}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-medium shadow-inner focus:ring-2 ring-indigo-500 transition-all resize-none"
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    {/* Step 3: Planerade kurser */}
                    {step === 2 && (
                        <>
                            {/* Add new course */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 space-y-4">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Lägg till kurs</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Kursnamn *</label>
                                        <input
                                            value={newCourse.courseName}
                                            onChange={e => setNewCourse(p => ({ ...p, courseName: e.target.value }))}
                                            placeholder="T.ex. Matematik 1a"
                                            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-3 py-2.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Kurskod</label>
                                        <input
                                            value={newCourse.courseCode}
                                            onChange={e => setNewCourse(p => ({ ...p, courseCode: e.target.value }))}
                                            placeholder="T.ex. MATMAT01a"
                                            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-3 py-2.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Poäng</label>
                                        <input
                                            type="number"
                                            value={newCourse.points}
                                            onChange={e => setNewCourse(p => ({ ...p, points: e.target.value }))}
                                            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-3 py-2.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Nivå</label>
                                        <select
                                            value={newCourse.level}
                                            onChange={e => setNewCourse(p => ({ ...p, level: e.target.value }))}
                                            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-3 py-2.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                        >
                                            <option value="Gymnasial">Gymnasial</option>
                                            <option value="Grundläggande">Grundläggande</option>
                                            <option value="SFI">SFI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Studietakt</label>
                                        <select
                                            value={newCourse.studyPacePct}
                                            onChange={e => setNewCourse(p => ({ ...p, studyPacePct: Number(e.target.value) }))}
                                            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-3 py-2.5 text-sm font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all"
                                        >
                                            <option value={100}>100%</option>
                                            <option value={75}>75%</option>
                                            <option value={50}>50%</option>
                                            <option value={25}>25%</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Period</label>
                                        <div className="flex gap-2">
                                            <input type="date" value={newCourse.plannedStart}
                                                onChange={e => setNewCourse(p => ({ ...p, plannedStart: e.target.value }))}
                                                className="flex-1 bg-white dark:bg-gray-800 border-none rounded-xl px-2 py-2.5 text-xs font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all" />
                                            <input type="date" value={newCourse.plannedEnd}
                                                onChange={e => setNewCourse(p => ({ ...p, plannedEnd: e.target.value }))}
                                                className="flex-1 bg-white dark:bg-gray-800 border-none rounded-xl px-2 py-2.5 text-xs font-bold shadow-inner focus:ring-2 ring-indigo-500 transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={addCourse}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    <Plus size={14} />
                                    Lägg till kurs
                                </button>
                            </div>

                            {/* Course list */}
                            {form.courses.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Planerade kurser ({form.courses.length})</h4>
                                    {form.courses.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl px-5 py-3 border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <div className="font-bold text-sm text-gray-900 dark:text-white">{c.courseName}</div>
                                                <div className="text-[10px] font-black text-gray-400">
                                                    {c.courseCode && <span className="mr-3">{c.courseCode}</span>}
                                                    <span className="mr-3">{c.points} po</span>
                                                    <span className="mr-3">{c.level}</span>
                                                    {c.studyPacePct}%
                                                    {c.plannedStart && <span className="ml-3">{c.plannedStart} → {c.plannedEnd || '?'}</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeCourse(i)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {form.courses.length === 0 && (
                                <p className="text-center text-xs text-gray-400 font-bold py-4">
                                    Inga kurser tillagda ännu. ISP kan sparas utan kurser.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
                    <button
                        onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        <ChevronLeft size={16} />
                        {step > 0 ? 'Tillbaka' : 'Avbryt'}
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={() => { if (validateStep()) setStep(s => s + 1); }}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                        >
                            Nästa
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isEditing ? 'Spara ändringar' : 'Spara utkast'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IspFormModal;
