import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Plus, Trash2, GripVertical, ArrowUp, ArrowDown,
    Save, ArrowLeft, FileText, ToggleLeft, ToggleRight
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const questionTypes = [
    { value: 'RATING_1_5', label: 'Betyg 1-5' },
    { value: 'FREE_TEXT', label: 'Fritext' },
    { value: 'MULTIPLE_CHOICE', label: 'Flerval' },
    { value: 'YES_NO', label: 'Ja/Nej' },
];

const emptyQuestion = () => ({
    questionText: '',
    questionType: 'RATING_1_5',
    optionsJson: '',
    isRequired: true,
    sortOrder: 0,
});

const SurveyBuilder = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([emptyQuestion()]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            api.elevhalsa.getTemplates().then(templates => {
                const t = templates.find(tpl => tpl.id === parseInt(id));
                if (t) {
                    setTitle(t.title);
                    setDescription(t.description || '');
                    setQuestions(t.questions.length > 0 ? t.questions.map(q => ({
                        ...q,
                        optionsJson: q.optionsJson || '',
                    })) : [emptyQuestion()]);
                }
            }).catch(() => toast.error('Kunde inte ladda mallen'))
                .finally(() => setLoading(false));
        }
    }, [id, isEditing]);

    const addQuestion = () => {
        setQuestions([...questions, emptyQuestion()]);
    };

    const removeQuestion = (idx) => {
        if (questions.length <= 1) return;
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const moveQuestion = (idx, direction) => {
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= questions.length) return;
        const updated = [...questions];
        [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
        setQuestions(updated);
    };

    const updateQuestion = (idx, field, value) => {
        const updated = [...questions];
        updated[idx] = { ...updated[idx], [field]: value };
        setQuestions(updated);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Ange en titel för enkätmallen');
            return;
        }
        if (questions.some(q => !q.questionText.trim())) {
            toast.error('Alla frågor måste ha en frågetext');
            return;
        }
        if (questions.some(q => q.questionType === 'MULTIPLE_CHOICE' && !q.optionsJson.trim())) {
            toast.error('Flervalsfrågor måste ha alternativ');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                questions: questions.map((q, i) => ({
                    questionText: q.questionText,
                    questionType: q.questionType,
                    optionsJson: q.questionType === 'MULTIPLE_CHOICE'
                        ? JSON.stringify(q.optionsJson.split(',').map(s => s.trim()).filter(Boolean))
                        : null,
                    isRequired: q.isRequired,
                    sortOrder: i,
                })),
            };

            if (isEditing) {
                await api.elevhalsa.updateTemplate(id, payload);
                toast.success('Mall uppdaterad');
            } else {
                await api.elevhalsa.createTemplate(payload);
                toast.success('Mall skapad');
            }
            navigate('/health-dashboard');
        } catch (err) {
            toast.error('Kunde inte spara mallen');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/health-dashboard')}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-teal/20 rounded-xl">
                            <FileText className="w-6 h-6 text-brand-teal" />
                        </div>
                        {isEditing ? 'Redigera enkätmall' : 'Skapa enkätmall'}
                    </h1>
                </div>
            </div>

            {/* Template Info */}
            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Titel</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="T.ex. Trivselenkät VT2026"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 ring-brand-teal/30 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Beskrivning</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Valfri beskrivning av enkäten..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 ring-brand-teal/30 dark:text-white resize-none"
                    />
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        Frågor ({questions.length})
                    </h2>
                    <button onClick={addQuestion}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-xl text-sm font-medium hover:bg-brand-teal/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        Lägg till fråga
                    </button>
                </div>

                {questions.map((q, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1E1F20] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 text-gray-400">
                                <GripVertical className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Fråga {idx + 1}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors">
                                    <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                                <button onClick={() => moveQuestion(idx, 1)} disabled={idx === questions.length - 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors">
                                    <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                                <button onClick={() => removeQuestion(idx)} disabled={questions.length <= 1}
                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Frågetext</label>
                                <input
                                    type="text"
                                    value={q.questionText}
                                    onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                                    placeholder="Skriv din fråga här..."
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 ring-brand-teal/30 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Typ</label>
                                <select
                                    value={q.questionType}
                                    onChange={e => updateQuestion(idx, 'questionType', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white"
                                >
                                    {questionTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {q.questionType === 'MULTIPLE_CHOICE' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                    Svarsalternativ (kommaseparerade)
                                </label>
                                <input
                                    type="text"
                                    value={q.optionsJson}
                                    onChange={e => updateQuestion(idx, 'optionsJson', e.target.value)}
                                    placeholder="Alternativ 1, Alternativ 2, Alternativ 3"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 ring-brand-teal/30 dark:text-white"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <button onClick={() => updateQuestion(idx, 'isRequired', !q.isRequired)}
                                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                                {q.isRequired
                                    ? <ToggleRight className="w-5 h-5 text-brand-teal" />
                                    : <ToggleLeft className="w-5 h-5 text-gray-400" />
                                }
                                Obligatorisk
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pb-8">
                <button onClick={() => navigate('/health-dashboard')}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    Avbryt
                </button>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-bold hover:bg-brand-teal/90 disabled:opacity-50 transition-colors">
                    <Save className="w-4 h-4" />
                    {saving ? 'Sparar...' : (isEditing ? 'Uppdatera mall' : 'Spara mall')}
                </button>
            </div>
        </div>
    );
};

export default SurveyBuilder;
