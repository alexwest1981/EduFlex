import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Edit2, Trash2, ChevronRight,
    GraduationCap, BookOpen, Layers, Globe, Check, X,
    RefreshCw, MoreVertical, LayoutGrid, List, AlertCircle
} from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const ProgramManager = () => {
    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        sunCode: '',
        requiresLia: false,
        totalCredits: 0
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [progData, courseData] = await Promise.all([
                api.educationPrograms.getAll(),
                api.courses.getAll()
            ]);
            setPrograms(progData);
            setCourses(courseData);
        } catch (e) {
            console.error('Failed to load programs/courses:', e);
            toast.error('Misslyckades att hämta data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenCreate = () => {
        setEditingProgram(null);
        setFormData({
            name: '',
            description: '',
            category: '',
            sunCode: '',
            requiresLia: false,
            totalCredits: 0
        });
        setShowModal(true);
    };

    const handleOpenEdit = (program) => {
        setEditingProgram(program);
        setFormData({
            name: program.name || '',
            description: program.description || '',
            category: program.category || '',
            sunCode: program.sunCode || '',
            requiresLia: program.requiresLia || false,
            totalCredits: program.totalCredits || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProgram) {
                await api.educationPrograms.update(editingProgram.id, formData);
                toast.success('Programmet uppdaterat');
            } else {
                await api.educationPrograms.create(formData);
                toast.success('Programmet skapat');
            }
            setShowModal(false);
            loadData();
        } catch (e) {
            console.error('Save failed:', e);
            toast.error('Kunde inte spara programmet');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Är du säker på att du vill ta bort detta program?')) return;
        try {
            await api.educationPrograms.delete(id);
            toast.success('Programmet borttaget');
            loadData();
        } catch (e) {
            console.error('Delete failed:', e);
            toast.error('Kunde inte ta bort programmet');
        }
    };

    const filteredPrograms = programs.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sunCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-1">
                        Programhantering
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Strukturera kurser i kompletta utbildningsprogram med SUN-kodning och JobTech-matchning.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={20} />
                    Skapa nytt program
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)] shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[var(--text-primary)]"
                        placeholder="Sök utbildning..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 rounded-xl bg-[var(--bg-input)] text-gray-400 hover:text-indigo-600 transition-all">
                        <Filter size={18} />
                    </button>
                    <button onClick={loadData} className="p-2.5 rounded-xl bg-[var(--bg-input)] text-gray-400 hover:text-indigo-600 transition-all">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading && programs.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
                    <RefreshCw size={32} className="animate-spin" />
                    <p>Laddar program...</p>
                </div>
            ) : filteredPrograms.length === 0 ? (
                <div className="bg-[var(--bg-card)] rounded-3xl py-24 text-center border border-[var(--border-main)]">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <GraduationCap size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Inga program hittades</h3>
                    <p className="text-[var(--text-secondary)] text-sm">Skapa din första utbildning för att komma igång.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrograms.map(program => (
                        <div key={program.id} className="group bg-[var(--bg-card)] rounded-[32px] p-6 border border-[var(--border-main)] hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-black/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                    <GraduationCap size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleOpenEdit(program)}
                                        className="p-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-indigo-400 transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(program.id)}
                                        className="p-2 rounded-xl text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 group-hover:text-indigo-400 transition-colors">
                                {program.name}
                            </h3>

                            <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-6">
                                {program.description || 'Ingen beskrivning angiven.'}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-[var(--border-main)]">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider">SUN-kod</span>
                                    <span className="text-[var(--text-primary)] font-bold px-2 py-1 rounded-lg bg-[var(--bg-input)]">{program.sunCode || '---'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Kurser</span>
                                    <span className="text-indigo-400 font-black">{program.courses?.length || 0} st</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Poäng</span>
                                    <span className="text-[var(--text-primary)] font-bold">{program.totalCredits || 0} YHp</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-3 rounded-2xl bg-[var(--bg-input)] text-[var(--text-secondary)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                                Hantera kurser
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upsert Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-xl bg-[var(--bg-card)] rounded-[32px] overflow-hidden animate-in fade-in zoom-in duration-200 border border-[var(--border-main)]">
                        <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between">
                            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                                {editingProgram ? 'Redigera program' : 'Skapa nytt program'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-[var(--text-primary)]">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Programnamn</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border-none focus:ring-2 focus:ring-indigo-500/50 text-[var(--text-primary)]"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="t.ex. Frontendutvecklare"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Kategori</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border-none focus:ring-2 focus:ring-indigo-500/50 text-[var(--text-primary)]"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="t.ex. IT"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">SUN-kod</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border-none focus:ring-2 focus:ring-indigo-500/50 text-[var(--text-primary)]"
                                        value={formData.sunCode}
                                        onChange={e => setFormData({ ...formData, sunCode: e.target.value })}
                                        placeholder="t.ex. 481a"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Beskrivning</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border-none focus:ring-2 focus:ring-indigo-500/50 h-32 resize-none text-[var(--text-primary)]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Beskriv utbildningen..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Totala poäng</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border-none focus:ring-2 focus:ring-indigo-500/50 text-[var(--text-primary)]"
                                        value={formData.totalCredits}
                                        onChange={e => setFormData({ ...formData, totalCredits: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, requiresLia: !formData.requiresLia })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${formData.requiresLia ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.requiresLia ? 'left-7' : 'left-1'}`} />
                                    </button>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Innehåller LIA</span>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-[var(--bg-input)] text-gray-400 font-bold hover:bg-white/5 transition-all"
                                >
                                    Avbryt
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    {editingProgram ? 'Spara ändringar' : 'Skapa program'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramManager;
