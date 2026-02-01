import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Play, List, Settings, BarChart3, Trash2, ClipboardList, Info, X, Layers } from 'lucide-react';

const EvaluationManager = () => {
    const [templates, setTemplates] = useState([]);
    const [courses, setCourses] = useState([]);
    const [activeInstances, setActiveInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateTemplate, setShowCreateTemplate] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', description: '', questions: [] });
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleCreateTemplate = async () => {
        try {
            await api.post('/evaluations/templates', newTemplate);
            setShowCreateTemplate(false);
            fetchData();
        } catch (err) {
            alert('Kunde inte skapa mall.');
        }
    };

    const handleActivate = async () => {
        if (!selectedCourse || !selectedTemplate) return;
        try {
            await api.post('/evaluations/activate', {
                courseId: selectedCourse,
                templateId: selectedTemplate
            });
            alert('Utvärdering aktiverad!');
            fetchData();
        } catch (err) {
            alert('Kunde inte aktivera utvärdering.');
        }
    };

    const addQuestion = () => {
        setNewTemplate(prev => ({
            ...prev,
            questions: [...prev.questions, { questionText: '', questionType: 'LIKERT', orderIndex: prev.questions.length }]
        }));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
            Laddar hantering...
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl">
                            <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        Kursutvärderingar
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">Hantera mallar och aktivera utvärderingar för dina kurser.</p>
                </div>
                <button
                    onClick={() => setShowCreateTemplate(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Skapa ny mall
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Activation Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Play className="w-5 h-5 text-green-500" />
                            Aktivera utvärdering
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Välj kurs</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    // Custom style handled by index.css layers, but classes added for clarity
                                    className="dark:bg-[#282a2c] dark:border-transparent"
                                >
                                    <option value="">Välj en kurs...</option>
                                    {courses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Välj mall</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="dark:bg-[#282a2c] dark:border-transparent"
                                >
                                    <option value="">Välj en mall...</option>
                                    {templates?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={handleActivate}
                                disabled={!selectedCourse || !selectedTemplate}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:grayscale text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-green-600/10"
                            >
                                Starta utvärdering
                            </button>
                        </div>

                        <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl flex gap-3">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed font-medium">
                                När du aktiverar en utvärdering blir den synlig för alla elever i den valda kursen. Svaren samlas in helt anonymt.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Templates List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <List className="w-5 h-5 text-blue-500" />
                            Mina mallar
                        </h2>
                        <span className="text-xs font-bold text-slate-500 uppercase">{templates?.length || 0} mallar</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {templates?.map(template => (
                            <div key={template.id} className="group bg-white dark:bg-[#1e1f20] hover:ring-2 hover:ring-blue-500/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                                        <ClipboardList className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
                                    </div>
                                    {template.systemTemplate && (
                                        <span className="text-[10px] uppercase tracking-widest font-black bg-blue-600 text-white px-2.5 py-1 rounded-lg">Default</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium">{template.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                        <Layers className="w-4 h-4" />
                                        {template.questions?.length || 0} frågor
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-blue-500">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                        {!template.systemTemplate && (
                                            <button className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-slate-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {templates?.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4">
                                <ClipboardList className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Inga mallar skapade</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Template Modal */}
            {showCreateTemplate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Ny utvärderingsmall</h2>
                            <button onClick={() => setShowCreateTemplate(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Mallnamn</label>
                                    <input
                                        type="text"
                                        value={newTemplate.name}
                                        onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        placeholder="T.ex. Slututvärdering"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Beskrivning</label>
                                    <textarea
                                        value={newTemplate.status} // reused for description in simple state
                                        className="h-24"
                                        onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                        placeholder="Kort beskrivning av syftet..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Frågor ({newTemplate.questions.length})</label>
                                    <button
                                        onClick={addQuestion}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-500 uppercase flex items-center gap-1.5"
                                    >
                                        <Plus className="w-4 h-4" /> Lägg till
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {newTemplate.questions.map((q, idx) => (
                                        <div key={idx} className="flex gap-4 items-start bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all group hover:border-blue-500/30">
                                            <div className="mt-2.5 w-6 h-6 bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-lg text-[10px] font-black text-slate-500">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <input
                                                    className="bg-transparent border-none p-0 text-gray-900 dark:text-white font-bold placeholder:font-normal focus:ring-0"
                                                    value={q.questionText}
                                                    onChange={e => {
                                                        const qs = [...newTemplate.questions];
                                                        qs[idx].questionText = e.target.value;
                                                        setNewTemplate({ ...newTemplate, questions: qs });
                                                    }}
                                                    placeholder="Ställ din fråga..."
                                                />
                                                <div className="flex gap-2">
                                                    {['LIKERT', 'TEXT', 'NPS', 'EMOJI'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => {
                                                                const qs = [...newTemplate.questions];
                                                                qs[idx].questionType = type;
                                                                setNewTemplate({ ...newTemplate, questions: qs });
                                                            }}
                                                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${q.questionType === type
                                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const qs = newTemplate.questions.filter((_, i) => i !== idx);
                                                    setNewTemplate({ ...newTemplate, questions: qs });
                                                }}
                                                className="mt-2.5 p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {newTemplate.questions.length === 0 && (
                                        <button
                                            onClick={addQuestion}
                                            className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 hover:border-blue-500/30 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-2 group"
                                        >
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Lägg till första frågan</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-top border-gray-100 dark:border-gray-800 flex gap-4 bg-slate-50/50 dark:bg-slate-800/10">
                            <button
                                onClick={() => setShowCreateTemplate(false)}
                                className="flex-1 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold border border-gray-200 dark:border-gray-700 transition-all active:scale-95"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleCreateTemplate}
                                disabled={!newTemplate.name || newTemplate.questions.length === 0}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                            >
                                Spara mall
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationManager;
