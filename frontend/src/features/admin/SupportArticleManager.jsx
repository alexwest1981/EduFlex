import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Pencil, Trash2, Eye, EyeOff, Save, X,
    BookOpen, Video, ChevronUp, ChevronDown, Info
} from 'lucide-react';
import { api } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';
import toast from 'react-hot-toast';

// Kategorier för support-artiklar – speglar flikar i SupportPage
const CATEGORIES = [
    { id: 'system', label: 'System & Inloggning' },
    { id: 'pedagogy', label: 'Pedagogik & Kurser' },
    { id: 'ai', label: 'EduAI & Innovation' },
    { id: 'security', label: 'Säkerhet & GDPR' },
    { id: 'other', label: 'Övrigt' },
];

const EMPTY_FORM = {
    title: '',
    content: '',
    category: 'system',
    type: 'FAQ',
    videoUrl: '',
    duration: '',
    thumbnail: 'bg-brand-teal/20',
    displayOrder: 0,
    isPublished: true,
};

const inputClass = "w-full px-4 py-2.5 border border-[var(--border-main)] rounded-xl outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white/5 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-secondary)]/50";
const labelClass = "text-[10px] font-black text-[var(--text-secondary)] mb-2 block uppercase tracking-[0.2em]";

export default function SupportArticleManager() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'FAQ', 'VIDEO'

    const fetchArticles = useCallback(async () => {
        try {
            const data = await api.support.articles.getAll();
            setArticles(data);
        } catch (e) {
            toast.error('Kunde inte hämta artiklar');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchArticles(); }, [fetchArticles]);

    const openNew = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowForm(true);
    };

    const openEdit = (article) => {
        setForm({
            title: article.title || '',
            content: article.content || '',
            category: article.category || 'system',
            type: article.type || 'FAQ',
            videoUrl: article.videoUrl || '',
            duration: article.duration || '',
            thumbnail: article.thumbnail || 'bg-brand-teal/20',
            displayOrder: article.displayOrder || 0,
            isPublished: article.isPublished !== false,
        });
        setEditingId(article.id);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Titel är obligatorisk'); return; }
        // Quill returnerar '<p><br></p>' när fältet är tomt
        const contentIsEmpty = !form.content || form.content === '<p><br></p>' || form.content.trim() === '';
        if (form.type === 'FAQ' && contentIsEmpty) { toast.error('Svarets text är obligatorisk för FAQ'); return; }

        setSaving(true);
        try {
            if (editingId) {
                await api.support.articles.update(editingId, form);
                toast.success('Artikel uppdaterad! ✅');
            } else {
                await api.support.articles.create(form);
                toast.success('Artikel publicerad! 🚀');
            }
            await fetchArticles();
            closeForm();
        } catch (e) {
            toast.error('Kunde inte spara artikeln');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Är du säker? Detta tar bort artikeln permanent.')) return;
        try {
            await api.support.articles.delete(id);
            toast.success('Artikel borttagen');
            setArticles(prev => prev.filter(a => a.id !== id));
        } catch (e) {
            toast.error('Kunde inte ta bort artikeln');
        }
    };

    const handleTogglePublish = async (article) => {
        try {
            await api.support.articles.update(article.id, { ...article, isPublished: !article.isPublished });
            toast.success(!article.isPublished ? 'Artikel publicerad' : 'Artikel avpublicerad');
            fetchArticles();
        } catch (e) {
            toast.error('Kunde inte uppdatera artikel');
        }
    };

    const filteredArticles = articles.filter(a => filterType === 'ALL' || a.type === filterType);

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-2xl font-black text-[var(--text-primary)]">Support Innehåll</h3>
                    <p className="font-bold text-[var(--text-secondary)] mt-1">
                        Skapa och hantera FAQ-svar och videoguider som visas i Help Center.
                    </p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-3 px-6 py-3 bg-brand-blue text-white rounded-2xl font-black text-sm hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-brand-blue/20"
                >
                    <Plus size={18} /> Ny Artikel
                </button>
            </div>

            {/* Typ-filter */}
            <div className="flex gap-2">
                {[['ALL', 'Alla'], ['FAQ', 'FAQ'], ['VIDEO', 'Videoguider']].map(([val, label]) => (
                    <button
                        key={val}
                        onClick={() => setFilterType(val)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === val
                            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                            : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] border border-white/5'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Formulär (skapa/redigera) */}
            {showForm && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h4 className="text-xl font-black text-[var(--text-primary)]">
                            {editingId ? '✏️ Redigera artikel' : '✨ Ny artikel'}
                        </h4>
                        <button onClick={closeForm} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all">
                            <X size={18} className="text-[var(--text-secondary)]" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Typ – FAQ eller Video */}
                        <div>
                            <label className={labelClass}>Typ</label>
                            <div className="flex gap-3">
                                {[['FAQ', 'FAQ-artikel', BookOpen], ['VIDEO', 'Videoguide', Video]].map(([val, label, Icon]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type: val }))}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs border-2 transition-all ${form.type === val
                                            ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-lg shadow-brand-blue/10'
                                            : 'border-[var(--border-main)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-brand-blue/30'}`}
                                    >
                                        <Icon size={16} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Titel */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>Titel / Fråga *</label>
                                <input
                                    className={inputClass}
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder={form.type === 'FAQ' ? 'T.ex. Hur hanterar EduFlex GDPR?' : 'T.ex. Kom igång med EduFlex'}
                                    required
                                />
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className={labelClass}>Kategori</label>
                                <select
                                    className={inputClass}
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                >
                                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>

                            {/* Visningsordning */}
                            <div>
                                <label className={labelClass}>Visningsordning</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={form.displayOrder}
                                    onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* FAQ: Svarstext med rich text editor */}
                        {form.type === 'FAQ' && (
                            <div>
                                <label className={labelClass}>Svarets text *</label>
                                <RichTextEditor
                                    value={form.content}
                                    onChange={(val) => setForm(f => ({ ...f, content: val }))}
                                    placeholder="Skriv svaret på frågan här... (stöder fetstil, listor, länkar m.m.)"
                                    style={{ minHeight: '160px' }}
                                />
                            </div>
                        )}

                        {/* VIDEO: URL och längd */}
                        {form.type === 'VIDEO' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Video-URL</label>
                                    <input
                                        className={inputClass}
                                        value={form.videoUrl}
                                        onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Längd (t.ex. 3:45)</label>
                                    <input
                                        className={inputClass}
                                        value={form.duration}
                                        onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                                        placeholder="3:45"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Beskrivning</label>
                                    <RichTextEditor
                                        value={form.content}
                                        onChange={(val) => setForm(f => ({ ...f, content: val }))}
                                        placeholder="Kort beskrivning av vad videon handlar om..."
                                        style={{ minHeight: '120px' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Publicera toggle */}
                        <div className="flex items-center gap-4 pt-4 relative z-10">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={form.isPublished}
                                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                                />
                                <div className="w-12 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:bg-brand-blue border border-white/5"></div>
                            </label>
                            <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                {form.isPublished ? '✅ Publicerad (syns i Help Center)' : '👁️ Dold (utkast)'}
                            </span>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-main)] mt-6 relative z-10">
                            <button type="button" onClick={closeForm} className="px-6 py-3 bg-white/5 text-[var(--text-secondary)] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
                                Avbryt
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-3 px-8 py-3 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.05] disabled:opacity-50 transition-all shadow-xl shadow-brand-blue/20"
                            >
                                <Save size={18} /> {saving ? 'Sparar...' : (editingId ? 'Spara ändringar' : 'Publicera artikel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Artikellista */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-main)] shadow-inner">
                    <Info size={48} className="mx-auto text-[var(--text-secondary)]/20 mb-4" />
                    <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs">Inga artiklar ännu</p>
                    <p className="text-xs font-bold text-[var(--text-secondary)]/50 mt-2">Klicka "Ny Artikel" för att komma igång.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredArticles.map((article) => (
                        <div
                            key={article.id}
                            className={`flex items-center gap-6 p-6 rounded-2xl border transition-all duration-300 group shadow-sm hover:shadow-xl hover:border-brand-blue/20 ${article.isPublished
                                ? 'bg-[var(--bg-card)] border-[var(--border-main)]'
                                : 'bg-[var(--bg-main)] border-[var(--border-main)] opacity-50 grayscale shadow-inner'
                                }`}
                        >
                            {/* Ikon */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-blue/10 border border-brand-blue/20 text-brand-blue shadow-lg shadow-brand-blue/5">
                                {article.type === 'VIDEO'
                                    ? <Video size={20} />
                                    : <BookOpen size={20} />
                                }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-black text-[var(--text-primary)] text-sm tracking-tight truncate max-w-xs">
                                        {article.title}
                                    </span>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${article.type === 'VIDEO'
                                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                        : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                                        }`}>{article.type}</span>
                                    {article.category && (
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] bg-white/5 border border-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                                            {CATEGORIES.find(c => c.id === article.category)?.label || article.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-[var(--text-secondary)] mt-1 truncate max-w-md">
                                    {article.content || article.videoUrl || '—'}
                                </p>
                            </div>

                            {/* Åtgärder */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                <button
                                    onClick={() => handleTogglePublish(article)}
                                    title={article.isPublished ? 'Avpublicera' : 'Publicera'}
                                    className={`p-2.5 rounded-xl transition-all border ${article.isPublished
                                        ? 'text-green-500 bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                                        : 'text-[var(--text-secondary)] bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {article.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    onClick={() => openEdit(article)}
                                    title="Redigera"
                                    className="p-2.5 text-brand-blue bg-brand-blue/5 border border-brand-blue/20 rounded-xl transition-all hover:bg-brand-blue/10"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(article.id)}
                                    title="Ta bort"
                                    className="p-2.5 text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl transition-all hover:bg-red-500/10 shadow-lg shadow-red-500/5"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {articles.length > 0 && (
                <p className="text-[10px] font-black text-[var(--text-secondary)]/30 text-center uppercase tracking-[0.3em] pt-8">
                    {articles.length} artikel{articles.length !== 1 ? 'ar' : ''} totalt · {articles.filter(a => a.isPublished).length} publicerade
                </p>
            )}
        </div>
    );
}
