import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Plus, Play, List, Settings, Trash2, ClipboardList, X, Layers,
    ChevronRight, AlertCircle, CheckCircle2, Loader2, FileText,
    Star, AlignLeft, BarChart2, Smile
} from 'lucide-react';

// ─── Question type metadata ──────────────────────────────────────────────────
const Q_TYPES = {
    LIKERT: { label: 'Skala',  icon: Star,       desc: '1–5 betyg' },
    TEXT:   { label: 'Text',   icon: AlignLeft,  desc: 'Fritextsvar' },
    NPS:    { label: 'NPS',    icon: BarChart2,  desc: '0–10 poäng' },
    EMOJI:  { label: 'Emoji',  icon: Smile,      desc: 'Känsloreaktion' },
};

// ─── Shared input classes ────────────────────────────────────────────────────
const inputCls = "w-full bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-[#2a2b2d] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow";
const labelCls = "block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5";

// ─── Component ───────────────────────────────────────────────────────────────
const EvaluationManager = () => {
    const [templates, setTemplates] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', description: '', questions: [] });
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [activating, setActivating] = useState(false);
    const [activateSuccess, setActivateSuccess] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [templatesRes, coursesRes] = await Promise.all([
                api.get('/evaluations/templates'),
                api.get('/courses/my-courses')
            ]);
            setTemplates(templatesRes || []);
            setCourses(coursesRes || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setNewTemplate({ name: '', description: '', questions: [] });
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (template) => {
        setNewTemplate({ name: template.name, description: template.description, questions: template.questions || [] });
        setEditingId(template.id);
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingId(null); };

    const handleSave = async () => {
        try {
            if (editingId) {
                await api.put(`/evaluations/templates/${editingId}`, newTemplate);
            } else {
                await api.post('/evaluations/templates', newTemplate);
            }
            closeModal();
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Kunde inte spara mallen.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Är du säker på att du vill ta bort den här mallen?')) return;
        try {
            await api.delete(`/evaluations/templates/${id}`);
            fetchData();
        } catch {
            alert('Kunde inte ta bort mallen.');
        }
    };

    const handleActivate = async () => {
        if (!selectedCourse || !selectedTemplate) return;
        setActivating(true);
        try {
            await api.post('/evaluations/activate', { courseId: selectedCourse, templateId: selectedTemplate });
            setActivateSuccess(true);
            setTimeout(() => setActivateSuccess(false), 3000);
            fetchData();
        } catch {
            alert('Kunde inte aktivera utvärderingen.');
        } finally {
            setActivating(false);
        }
    };

    const addQuestion = () => {
        setNewTemplate(prev => ({
            ...prev,
            questions: [...prev.questions, { questionText: '', questionType: 'LIKERT', orderIndex: prev.questions.length }]
        }));
    };

    const updateQuestion = (idx, field, value) => {
        const qs = [...newTemplate.questions];
        qs[idx] = { ...qs[idx], [field]: value };
        setNewTemplate({ ...newTemplate, questions: qs });
    };

    const removeQuestion = (idx) => {
        setNewTemplate({ ...newTemplate, questions: newTemplate.questions.filter((_, i) => i !== idx) });
    };

    // ── Loading ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <span className="text-sm font-medium">Laddar...</span>
        </div>
    );

    return (
        <div className="min-h-full bg-gray-50 dark:bg-[#0f1012] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">

            {/* ── HERO ── */}
            <div className="relative overflow-hidden bg-white dark:bg-[#1a1b1d] border-b border-gray-200 dark:border-[#2a2b2d]">
                {/* Dot-grid texture */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                {/* Glow */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl" />

                <div className="relative px-6 py-8 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-500">Hantering</span>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Kursutvärderingar</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Skapa mallar och aktivera anonyma utvärderingar för dina kurser.
                            </p>
                        </div>

                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 shrink-0"
                        >
                            <Plus size={15} />
                            Ny mall
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-[#252628]">
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{templates.length}</p>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Mallar</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-[#2a2b2d]" />
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{courses.length}</p>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Kurser</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-[#2a2b2d]" />
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">
                                {templates.reduce((sum, t) => sum + (t.questions?.length || 0), 0)}
                            </p>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Frågor totalt</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── LEFT: ACTIVATE ── */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-2xl overflow-hidden sticky top-4">
                        <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <Play size={13} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aktivera utvärdering</h2>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className={labelCls}>Välj kurs</label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">Välj kurs...</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Välj mall</label>
                                    <select
                                        value={selectedTemplate}
                                        onChange={(e) => setSelectedTemplate(e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">Välj mall...</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>

                                <button
                                    onClick={handleActivate}
                                    disabled={!selectedCourse || !selectedTemplate || activating || activateSuccess}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all mt-1 ${
                                        activateSuccess
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                                    }`}
                                >
                                    {activating
                                        ? <><Loader2 size={14} className="animate-spin" /> Aktiverar...</>
                                        : activateSuccess
                                            ? <><CheckCircle2 size={14} /> Aktiverad!</>
                                            : <><Play size={14} /> Starta utvärdering</>
                                    }
                                </button>
                            </div>

                            <div className="mt-4 p-3.5 bg-indigo-50 dark:bg-indigo-500/[0.07] border border-indigo-100 dark:border-indigo-500/[0.12] rounded-xl flex gap-2.5">
                                <AlertCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-700 dark:text-indigo-300/80 leading-relaxed font-medium">
                                    Aktiverade utvärderingar är anonyma och synliga för alla elever i kursen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: TEMPLATES ── */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <List size={15} className="text-gray-400" />
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Mina mallar</h2>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{templates.length} st</span>
                    </div>

                    {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-[#2a2b2d] rounded-2xl text-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-[#252628] rounded-2xl flex items-center justify-center mb-3">
                                <ClipboardList size={20} className="text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400">Inga mallar skapade</p>
                            <p className="text-xs text-gray-400 mt-1">Skapa din första utvärderingsmall för att komma igång.</p>
                            <button
                                onClick={openCreate}
                                className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                            >
                                <Plus size={13} /> Skapa mall
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {templates.map(template => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onEdit={() => openEdit(template)}
                                    onDelete={() => handleDelete(template.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODAL ── */}
            {showModal && (
                <TemplateModal
                    editingId={editingId}
                    newTemplate={newTemplate}
                    setNewTemplate={setNewTemplate}
                    onClose={closeModal}
                    onSave={handleSave}
                    onAddQuestion={addQuestion}
                    onUpdateQuestion={updateQuestion}
                    onRemoveQuestion={removeQuestion}
                />
            )}
        </div>
    );
};

// ─── Template Card ────────────────────────────────────────────────────────────
const TemplateCard = ({ template, onEdit, onDelete }) => {
    const qCount = template.questions?.length || 0;
    const types = [...new Set((template.questions || []).map(q => q.questionType))];

    return (
        <div className="group bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                    <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                {template.systemTemplate && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        Standard
                    </span>
                )}
            </div>

            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 truncate">{template.name}</h3>
            {template.description && (
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{template.description}</p>
            )}

            {/* Question type badges */}
            {types.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {types.map(type => {
                        const meta = Q_TYPES[type];
                        return (
                            <span key={type} className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#252628] text-gray-500 dark:text-gray-400">
                                {meta?.label || type}
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#252628]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                    <Layers size={12} />
                    {qCount} {qCount === 1 ? 'fråga' : 'frågor'}
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        title="Redigera"
                    >
                        <Settings size={14} />
                    </button>
                    {!template.systemTemplate && (
                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Ta bort"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Template Modal ───────────────────────────────────────────────────────────
const TemplateModal = ({ editingId, newTemplate, setNewTemplate, onClose, onSave, onAddQuestion, onUpdateQuestion, onRemoveQuestion }) => {
    const canSave = newTemplate.name.trim() && newTemplate.questions.length > 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1b1d] w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2a2b2d] flex flex-col max-h-[88vh] overflow-hidden">

                {/* Gradient bar */}
                <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 shrink-0" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2a2b2d] flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        {editingId ? 'Redigera mall' : 'Ny utvärderingsmall'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252628] rounded-lg transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-5 space-y-4 custom-scrollbar">

                    {/* Name */}
                    <div>
                        <label className={labelCls}>Mallnamn *</label>
                        <input
                            type="text"
                            value={newTemplate.name}
                            onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                            placeholder="T.ex. Slututvärdering"
                            className={inputCls}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelCls}>Beskrivning</label>
                        <textarea
                            value={newTemplate.description}
                            onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                            placeholder="Kort beskrivning av syftet..."
                            rows={2}
                            className={`${inputCls} resize-none`}
                        />
                    </div>

                    {/* Questions */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className={labelCls + ' mb-0'}>Frågor ({newTemplate.questions.length})</label>
                            <button
                                onClick={onAddQuestion}
                                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-wider transition-colors"
                            >
                                <Plus size={12} /> Lägg till
                            </button>
                        </div>

                        <div className="space-y-2">
                            {newTemplate.questions.length === 0 ? (
                                <button
                                    onClick={onAddQuestion}
                                    className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-[#2a2b2d] rounded-xl text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-500 transition-all flex flex-col items-center gap-2"
                                >
                                    <Plus size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Lägg till första frågan</span>
                                </button>
                            ) : (
                                newTemplate.questions.map((q, idx) => (
                                    <QuestionRow
                                        key={idx}
                                        index={idx}
                                        question={q}
                                        onUpdateText={(val) => onUpdateQuestion(idx, 'questionText', val)}
                                        onUpdateType={(val) => onUpdateQuestion(idx, 'questionType', val)}
                                        onRemove={() => onRemoveQuestion(idx)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-[#2a2b2d] flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-100 dark:bg-[#252628] hover:bg-gray-200 dark:hover:bg-[#2e2f31] text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl transition-colors"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!canSave}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                    >
                        {editingId ? 'Spara ändringar' : 'Skapa mall'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Question Row ─────────────────────────────────────────────────────────────
const QuestionRow = ({ index, question, onUpdateText, onUpdateType, onRemove }) => {
    return (
        <div className="flex gap-3 items-start bg-gray-50 dark:bg-[#0f1012] border border-gray-100 dark:border-[#2a2b2d] rounded-xl p-3 group">
            {/* Index badge */}
            <div className="w-5 h-5 shrink-0 rounded-md bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center mt-1">
                {index + 1}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <input
                    type="text"
                    value={question.questionText}
                    onChange={e => onUpdateText(e.target.value)}
                    placeholder="Skriv din fråga..."
                    className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-0"
                />
                {/* Type selector */}
                <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(Q_TYPES).map(([type, meta]) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onUpdateType(type)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                question.questionType === type
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-gray-200 dark:border-[#2a2b2d] text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                        >
                            {meta.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={onRemove}
                className="p-1 text-gray-300 dark:text-gray-600 hover:text-rose-500 rounded-lg transition-colors mt-0.5 shrink-0"
            >
                <X size={13} />
            </button>
        </div>
    );
};

export default EvaluationManager;
