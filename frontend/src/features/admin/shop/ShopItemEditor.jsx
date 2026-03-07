import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, X, Upload, Save, Lock, GripVertical } from 'lucide-react';
import { api } from '../../../services/api';
import { getGamificationAssetPath } from '../../../utils/gamificationUtils';

const ShopItemEditor = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: 0,
        type: 'FRAME',
        rarity: 'COMMON',
        isLimited: false,
        imageUrl: '',
        unlockCriteria: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [criteriaType, setCriteriaType] = useState('NONE'); // NONE, COURSE_COMPLETION, QUIZ_SCORE
    const [criteriaData, setCriteriaData] = useState({}); // { referenceId, threshold }
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                cost: item.cost || 0,
                type: item.type || 'FRAME',
                rarity: item.rarity || 'COMMON',
                isLimited: item.isLimited || false,
                imageUrl: item.imageUrl || '',
                unlockCriteria: item.unlockCriteria || ''
            });
            setImagePreview(getGamificationAssetPath(item.imageUrl, item.type));

            if (item.unlockCriteria) {
                try {
                    const criteria = JSON.parse(item.unlockCriteria);
                    setCriteriaType(criteria.type);
                    setCriteriaData({
                        referenceId: criteria.referenceId,
                        threshold: criteria.threshold
                    });
                } catch (e) {
                    console.error("Failed to parse unlock criteria", e);
                }
            }
        }

        // Fetch courses and quizzes for dropdowns
        const fetchData = async () => {
            try {
                const [coursesRes, quizzesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/quizzes')
                ]);
                setCourses(coursesRes || []);
                setQuizzes(quizzesRes || []);
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };
        fetchData();
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCriteriaChange = (type, key, value) => {
        if (type === 'type') {
            setCriteriaType(value);
            setCriteriaData({}); // Reset data on type change
        } else {
            setCriteriaData(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = formData.imageUrl;

            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);
                const uploadRes = await api.post('/admin/shop/upload', uploadData);
                finalImageUrl = uploadRes;
            }

            let finalCriteria = null;
            if (criteriaType !== 'NONE') {
                finalCriteria = JSON.stringify({
                    type: criteriaType,
                    ...criteriaData
                });
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
                unlockCriteria: finalCriteria,
                cost: parseInt(formData.cost),
                // Ensure ID is passed if updating
                ...(item && { id: item.id })
            };

            await onSave(payload);
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save item: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10 border border-[var(--border-main)] shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent"></div>
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
                        {item ? 'Redigera föremål' : 'Skapa nytt föremål'}
                    </h2>
                    <button onClick={onCancel} className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-[var(--text-secondary)] rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Namn</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Typ</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="FRAME">Ram</option>
                                <option value="BACKGROUND">Bakgrund</option>
                                <option value="BADGE">Märke</option>
                                <option value="TITLE">Titel</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Beskrivning</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Kostnad (XP)</label>
                            <div className="relative">
                                <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" />
                                <input
                                    type="number"
                                    name="cost"
                                    value={formData.cost}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Sällsynthet</label>
                            <select
                                name="rarity"
                                value={formData.rarity}
                                onChange={handleChange}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="COMMON">Common</option>
                                <option value="RARE">Rare</option>
                                <option value="EPIC">Epic</option>
                                <option value="LEGENDARY">Legendary</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-3">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isLimited"
                                    checked={formData.isLimited}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <div className={`w-10 h-6 rounded-full relative transition-all duration-300 shadow-inner ${formData.isLimited ? 'bg-brand-blue' : 'bg-white/5'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.isLimited ? 'right-1' : 'left-1'}`}></div>
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-secondary)]/60 uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">Limited Edition</span>
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 shadow-inner">
                        <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-4">Föremålsbild</label>
                        <div className="flex items-center space-x-6">
                            <div className="w-28 h-28 border border-white/5 rounded-3xl flex items-center justify-center overflow-hidden bg-white/5 shadow-inner group/preview">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover/preview:scale-110 transition-transform" />
                                ) : (
                                    <div className="text-[var(--text-secondary)]/20 text-[9px] font-black uppercase tracking-widest text-center">Ingen bild</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer bg-brand-blue text-white px-6 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center w-fit font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Ladda upp bild
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                                <p className="text-[10px] text-[var(--text-secondary)]/40 mt-3 font-bold">Rekommenderas: PNG med transparens, 512x512px.</p>
                            </div>
                        </div>
                    </div>

                    {/* Unlock Criteria */}
                    <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 shadow-inner space-y-4">
                        <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] flex items-center">
                            <Lock className="w-4 h-4 mr-2 text-brand-blue" />
                            Upplåsningskrav
                        </label>
                        <select
                            value={criteriaType}
                            onChange={(e) => handleCriteriaChange('type', null, e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner appearance-none cursor-pointer"
                        >
                            <option value="NONE">Inga (Kan köpas direkt)</option>
                            <option value="COURSE_COMPLETION">Slutför en kurs</option>
                            <option value="QUIZ_SCORE">Nå ett visst resultat på ett quiz</option>
                        </select>

                        {criteriaType === 'COURSE_COMPLETION' && (
                            <div className="animate-in slide-in-from-top-2">
                                <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Välj kurs</label>
                                <select
                                    value={criteriaData.referenceId || ''}
                                    onChange={(e) => handleCriteriaChange('data', 'referenceId', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">-- Välj kurs --</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {criteriaType === 'QUIZ_SCORE' && (
                            <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Välj Quiz</label>
                                    <select
                                        value={criteriaData.referenceId || ''}
                                        onChange={(e) => handleCriteriaChange('data', 'referenceId', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">-- Välj Quiz --</option>
                                        {quizzes.map(q => (
                                            <option key={q.id} value={q.id}>{q.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.3em] mb-2">Minsta resultat %</label>
                                    <input
                                        type="number"
                                        value={criteriaData.threshold || ''}
                                        onChange={(e) => handleCriteriaChange('data', 'threshold', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-8 mt-10 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-4 text-[10px] font-black text-[var(--text-secondary)]/60 uppercase tracking-widest hover:text-[var(--text-primary)] transition-all"
                        >
                            Avbryt
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-blue/30 flex items-center disabled:opacity-50"
                        >
                            <Save className="w-5 h-5 mr-3" />
                            {loading ? 'Sparar...' : 'Spara föremål'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopItemEditor;
