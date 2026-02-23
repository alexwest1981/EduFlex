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

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-[#3c4043] rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white dark:bg-[#131314] text-gray-900 dark:text-white text-sm";
const labelClass = "text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide";

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Support Innehåll</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Skapa och hantera FAQ-svar och videoguider som visas i Help Center.
                    </p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
                >
                    <Plus size={16} /> Ny Artikel
                </button>
            </div>

            {/* Typ-filter */}
            <div className="flex gap-2">
                {[['ALL', 'Alla'], ['FAQ', 'FAQ'], ['VIDEO', 'Videoguider']].map(([val, label]) => (
                    <button
                        key={val}
                        onClick={() => setFilterType(val)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filterType === val
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-[#282a2c] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3c4043]'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Formulär (skapa/redigera) */}
            {showForm && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-lg">
                            {editingId ? '✏️ Redigera artikel' : '✨ Ny artikel'}
                        </h4>
                        <button onClick={closeForm} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                            <X size={18} className="text-indigo-700 dark:text-indigo-300" />
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
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${form.type === val
                                            ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-600 dark:text-gray-400 hover:border-indigo-300'}`}
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
                        <div className="flex items-center gap-3 pt-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={form.isPublished}
                                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                            </label>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {form.isPublished ? '✅ Publicerad (syns i Help Center)' : '👁️ Dold (utkast)'}
                            </span>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/30 mt-2">
                            <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-100 dark:bg-[#3c4043] text-gray-700 dark:text-white rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#505357] transition-colors">
                                Avbryt
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Save size={16} /> {saving ? 'Sparar...' : (editingId ? 'Spara ändringar' : 'Publicera artikel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Artikellista */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 dark:bg-[#282a2c] rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-[#1E1F20] rounded-2xl border border-dashed border-gray-200 dark:border-[#3c4043]">
                    <Info size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold">Inga artiklar ännu</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Klicka "Ny Artikel" för att komma igång.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredArticles.map((article) => (
                        <div
                            key={article.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${article.isPublished
                                ? 'bg-white dark:bg-[#1E1F20] border-gray-200 dark:border-[#3c4043]'
                                : 'bg-gray-50 dark:bg-[#131314] border-gray-200 dark:border-[#3c4043] opacity-60'
                                }`}
                        >
                            {/* Ikon */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20">
                                {article.type === 'VIDEO'
                                    ? <Video size={18} className="text-indigo-500" />
                                    : <BookOpen size={18} className="text-indigo-500" />
                                }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-xs">
                                        {article.title}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${article.type === 'VIDEO'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        }`}>{article.type}</span>
                                    {article.category && (
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#282a2c] px-2 py-0.5 rounded-full">
                                            {CATEGORIES.find(c => c.id === article.category)?.label || article.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-md">
                                    {article.content || article.videoUrl || '—'}
                                </p>
                            </div>

                            {/* Åtgärder */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleTogglePublish(article)}
                                    title={article.isPublished ? 'Avpublicera' : 'Publicera'}
                                    className={`p-2 rounded-lg transition-colors ${article.isPublished
                                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3c4043]'
                                        }`}
                                >
                                    {article.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    onClick={() => openEdit(article)}
                                    title="Redigera"
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(article.id)}
                                    title="Ta bort"
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {articles.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
                    {articles.length} artikel{articles.length !== 1 ? 'ar' : ''} totalt · {articles.filter(a => a.isPublished).length} publicerade
                </p>
            )}
        </div>
    );
}
