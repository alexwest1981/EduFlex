import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Layers, Users, Calendar, AlertCircle, X,
    Briefcase, Cpu, Heart, ShoppingBag, Building, PenTool, Code2,
    TrendingUp, Zap, Camera, Compass, Globe, Package, Newspaper,
    Scale, GraduationCap, Leaf, Megaphone, Calculator, Tv,
    Paintbrush, Building2, Languages, Anchor, BookA, Cog, Truck,
    HeartPulse, MoreHorizontal, LayoutGrid, List, SortAsc, ArrowRight, Filter
} from 'lucide-react';
import SkolverketCourseInfo from '../../components/SkolverketCourseInfo';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { COURSE_CATEGORIES } from '../../constants/courseCategories';

const CATEGORY_ICONS = {
    "Affärsutveckling och ledarskap": Briefcase,
    "Artificiell intelligens": Cpu,
    "Barn och fritid": Heart,
    "Beteende- och samhällsvetenskap": Users,
    "Butik, administration och personal": ShoppingBag,
    "Bygg och anläggning": Building,
    "CAD": PenTool,
    "Data/IT": Code2,
    "Ekonomi, administration och försäljning": TrendingUp,
    "El och energi": Zap,
    "Fotografisk bild": Camera,
    "Förberedande och orienterande": Compass,
    "Hotell och turism": Globe,
    "Hälso- och sjukvård samt socialt arbete": HeartPulse,
    "Inköp och logistik": Package,
    "Journalistik och information": Newspaper,
    "Juridik": Scale,
    "Kombinationsutbildning": Layers,
    "Komvuxarbete": GraduationCap,
    "Lantbruk, djurvård, trädgård": Leaf,
    "Marknadsföring": Megaphone,
    "Matematik och naturvetenskap": Calculator,
    "Media och kommunikation": Tv,
    "Måleri": Paintbrush,
    "Samhällsbyggnad och byggteknik": Building2,
    "SFI": Languages,
    "Sjöfart": Anchor,
    "Språk": BookA,
    "Teknik och tillverkning": Cog,
    "Transporttjänster": Truck,
    "Vård och omsorg": HeartPulse,
    "Övrigt": MoreHorizontal,
};

const CATEGORY_GRADIENTS = {
    "Artificiell intelligens": "from-violet-500 to-purple-600",
    "Data/IT": "from-blue-500 to-cyan-600",
    "Ekonomi, administration och försäljning": "from-emerald-500 to-teal-600",
    "Hälso- och sjukvård samt socialt arbete": "from-rose-500 to-pink-600",
    "Vård och omsorg": "from-rose-500 to-pink-600",
    "Matematik och naturvetenskap": "from-orange-500 to-amber-600",
    "Teknik och tillverkning": "from-slate-500 to-gray-600",
    "Affärsutveckling och ledarskap": "from-indigo-500 to-blue-600",
    "Språk": "from-green-500 to-emerald-600",
    "Media och kommunikation": "from-yellow-500 to-orange-600",
    "El och energi": "from-yellow-400 to-amber-500",
    "Bygg och anläggning": "from-stone-500 to-amber-700",
    "Lantbruk, djurvård, trädgård": "from-lime-500 to-green-600",
    "Hotell och turism": "from-sky-500 to-blue-600",
    "Juridik": "from-slate-600 to-slate-800",
    "Marknadsföring": "from-fuchsia-500 to-pink-600",
    "SFI": "from-teal-500 to-cyan-600",
    "Sjöfart": "from-blue-600 to-indigo-700",
    "CAD": "from-gray-500 to-slate-600",
    "default": "from-indigo-500 to-violet-600",
};

const getGradient = (category) => CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.default;

const CourseCatalog = () => {
    const { currentUser } = useAppContext();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Alla Kurser');
    const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('name');
    const [applying, setApplying] = useState(null);
    const [applySuccess, setApplySuccess] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await api.courses.getAll();
                setCourses(data);
            } catch (error) {
                console.error("Kunde inte hämta kurskatalog", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleApply = async (courseId) => {
        if (!currentUser) { navigate('/login'); return; }
        setApplying(courseId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${window.location.origin}/api/courses/${courseId}/apply/${currentUser.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setApplySuccess(courseId);
                setTimeout(() => setApplySuccess(null), 3000);
            } else {
                const err = await res.json();
                alert(`Kunde inte ansöka: ${err.error || 'Okänt fel'}`);
            }
        } catch {
            alert("Något gick fel vid ansökan.");
        } finally {
            setApplying(null);
        }
    };

    const counts = useMemo(() => courses.reduce((acc, course) => {
        const cat = COURSE_CATEGORIES.includes(course.category) ? course.category : 'Övrigt';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {}), [courses]);

    const openCourses = useMemo(() => courses.filter(c => c.isOpen), [courses]);

    const totalSpots = useMemo(() =>
        openCourses.reduce((sum, c) => sum + Math.max(0, (c.maxStudents || 100) - (c.enrolledCount || 0)), 0),
        [openCourses]
    );

    const activeCategories = useMemo(() => Object.keys(counts).length, [counts]);

    const filteredCourses = useMemo(() => {
        let result = courses.filter(course => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
            const courseCat = COURSE_CATEGORIES.includes(course.category) ? course.category : 'Övrigt';
            const matchesCategory = selectedCategory === 'Alla Kurser' || courseCat === selectedCategory;
            return matchesSearch && matchesCategory && course.isOpen;
        });
        if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
        else if (sortBy === 'spots') result.sort((a, b) =>
            ((b.maxStudents || 100) - (b.enrolledCount || 0)) - ((a.maxStudents || 100) - (a.enrolledCount || 0))
        );
        else if (sortBy === 'students') result.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
        return result;
    }, [courses, searchTerm, selectedCategory, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] pb-24 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">

            {/* ─── HERO ─── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                {/* Glow orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2" />
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl -translate-y-1/3" />
                </div>
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '28px 28px' }}
                />

                <div className="relative max-w-7xl mx-auto px-8 pt-10 pb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 border border-indigo-500/25 rounded-full text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-5">
                        Kurskatalog
                    </span>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                        Hitta din nästa{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                            utmaning
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-lg mb-8">
                        Utforska vårt utbud av yrkesinriktade kurser och ta nästa steg i din karriär.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8 mb-8">
                        {[
                            { label: 'Tillgängliga kurser', value: openCourses.length },
                            { label: 'Ämnesområden', value: activeCategories },
                            { label: 'Lediga platser', value: totalSpots },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tabular-nums">
                                    {loading ? '–' : stat.value}
                                </span>
                                <span className="text-slate-400 text-sm">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:bg-white/15 transition-all text-sm font-medium"
                            placeholder="Sök kurser, kurskoder..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ─── MAIN ─── */}
            <div className="max-w-7xl mx-auto px-8 py-7">

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{filteredCourses.length}</span>
                        {' '}kurser
                        {selectedCategory !== 'Alla Kurser' && (
                            <span className="ml-1 text-indigo-600 dark:text-indigo-400">· {selectedCategory}</span>
                        )}
                    </p>

                    <div className="flex items-center gap-2">
                        {/* Sort */}
                        <label className="flex items-center gap-2 bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-xl px-3 py-2 cursor-pointer">
                            <SortAsc size={14} className="text-gray-400 shrink-0" />
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="text-xs text-gray-600 dark:text-gray-300 bg-transparent outline-none cursor-pointer"
                            >
                                <option value="name">Namn A–Ö</option>
                                <option value="spots">Flest platser</option>
                                <option value="students">Populärast</option>
                            </select>
                        </label>

                        {/* View toggle */}
                        <div className="flex bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                <LayoutGrid size={15} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                <List size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-7">

                    {/* ─── SIDEBAR ─── */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden sticky top-6 shadow-sm">
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2a2b2d] flex items-center gap-2">
                                <Filter size={14} className="text-indigo-500" />
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Kategorier</h3>
                            </div>
                            <div className="p-3 max-h-[72vh] overflow-y-auto custom-scrollbar">
                                {/* All courses */}
                                <button
                                    onClick={() => setSelectedCategory('Alla Kurser')}
                                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 mb-0.5 ${
                                        selectedCategory === 'Alla Kurser'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232426]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Layers size={14} className="shrink-0" />
                                        <span>Alla Kurser</span>
                                    </div>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                        selectedCategory === 'Alla Kurser'
                                            ? 'bg-white/25 text-white'
                                            : 'bg-gray-100 dark:bg-[#2a2b2d] text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {openCourses.length}
                                    </span>
                                </button>

                                {COURSE_CATEGORIES.map(cat => {
                                    const count = counts[cat] || 0;
                                    if (count === 0) return null;
                                    const Icon = CATEGORY_ICONS[cat] || MoreHorizontal;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 mb-0.5 ${
                                                selectedCategory === cat
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232426]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Icon size={14} className="shrink-0" />
                                                <span className="truncate">{cat}</span>
                                            </div>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                                selectedCategory === cat
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-gray-100 dark:bg-[#2a2b2d] text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* ─── COURSE LIST ─── */}
                    <div className={`lg:col-span-3 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'flex flex-col gap-3'}`}>
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-[#1a1b1d] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2a2b2d] animate-pulse">
                                    <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-[#252628] dark:to-[#2a2b2d]" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-200 dark:bg-[#252628] rounded-lg w-3/4" />
                                        <div className="h-3 bg-gray-100 dark:bg-[#222] rounded-lg" />
                                        <div className="h-3 bg-gray-100 dark:bg-[#222] rounded-lg w-2/3" />
                                        <div className="h-1.5 bg-gray-100 dark:bg-[#222] rounded-full mt-4" />
                                    </div>
                                </div>
                            ))
                        ) : filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => {
                                const max = course.maxStudents || 100;
                                const current = course.enrolledCount || 0;
                                const spotsLeft = max - current;
                                const isFull = spotsLeft <= 0;
                                const fillPct = Math.min(100, Math.round((current / max) * 100));
                                const gradient = getGradient(course.category);
                                const isApplied = applySuccess === course.id;

                                /* ── LIST VIEW ── */
                                if (viewMode === 'list') {
                                    return (
                                        <div key={course.id} className="group bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200 flex">
                                            <div className={`w-1.5 shrink-0 bg-gradient-to-b ${gradient}`} />
                                            <div className="flex items-center gap-5 px-5 py-4 flex-1 min-w-0 flex-wrap md:flex-nowrap">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500">{course.courseCode}</span>
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 px-1.5 py-0.5 bg-gray-100 dark:bg-[#252628] rounded-md">{course.category || 'Allmänt'}</span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                                                </div>

                                                {/* Capacity bar (list) */}
                                                <div className="hidden md:block w-28 shrink-0">
                                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                        <span>{current}</span><span>{max}</span>
                                                    </div>
                                                    <div className="h-1 bg-gray-100 dark:bg-[#252628] rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${fillPct > 80 ? 'bg-red-400' : fillPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                            style={{ width: `${fillPct}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className={`hidden md:inline text-xs font-bold px-2.5 py-1 rounded-lg ${isFull ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                                                        {isFull ? 'Fullbokad' : `${spotsLeft} platser`}
                                                    </span>
                                                    <button onClick={() => setSelectedCourseInfo(course)} className="text-xs text-gray-400 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/15 transition-colors">
                                                        Info
                                                    </button>
                                                    <button
                                                        onClick={() => handleApply(course.id)}
                                                        disabled={isFull || applying === course.id}
                                                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                            isApplied ? 'bg-emerald-500 text-white'
                                                            : isFull ? 'bg-gray-100 dark:bg-[#252628] text-gray-400 cursor-not-allowed'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                                        }`}
                                                    >
                                                        {isApplied ? '✓ Skickat' : applying === course.id ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Ansök'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                /* ── GRID VIEW ── */
                                return (
                                    <div
                                        key={course.id}
                                        className="group bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-800/40 transition-all duration-300 flex flex-col"
                                    >
                                        {/* Card header gradient */}
                                        <div className={`h-20 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                                            {/* Subtle texture */}
                                            <div className="absolute inset-0 opacity-10"
                                                style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
                                            />
                                            <div className="relative p-4 flex items-start justify-between gap-2">
                                                <span className="bg-white/25 backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider max-w-[70%] truncate">
                                                    {course.category || 'Allmänt'}
                                                </span>
                                                {course.courseCode && (
                                                    <span className="bg-black/25 backdrop-blur-sm text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg text-white shrink-0">
                                                        {course.courseCode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                                                {course.name}
                                            </h3>
                                            <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
                                                {course.description
                                                    ? course.description.replace(/<[^>]*>/g, '')
                                                    : 'Ingen beskrivning tillgänglig.'}
                                            </p>

                                            {/* Capacity */}
                                            <div className="mb-5">
                                                <div className="flex justify-between items-center text-[11px] text-gray-400 mb-1.5">
                                                    <span className="flex items-center gap-1">
                                                        <Users size={11} />
                                                        {current} / {max} studenter
                                                    </span>
                                                    {course.startDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={11} />
                                                            {new Date(course.startDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="h-1.5 bg-gray-100 dark:bg-[#252628] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${fillPct > 80 ? 'bg-red-400' : fillPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                        style={{ width: `${fillPct}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-auto flex items-center justify-between gap-2">
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                                                    isFull
                                                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                }`}>
                                                    {isFull ? 'Fullbokad' : `${spotsLeft} platser kvar`}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedCourseInfo(course)}
                                                        className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#252628] transition-colors"
                                                    >
                                                        Info
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleApply(course.id); }}
                                                        disabled={isFull || applying === course.id}
                                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                            isApplied
                                                                ? 'bg-emerald-500 text-white'
                                                                : isFull
                                                                    ? 'bg-gray-100 dark:bg-[#252628] text-gray-400 cursor-not-allowed'
                                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40'
                                                        }`}
                                                    >
                                                        {isApplied ? (
                                                            '✓ Skickat'
                                                        ) : applying === course.id ? (
                                                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <>Ansök <ArrowRight size={11} /></>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-2xl flex items-center justify-center mb-4">
                                    <Search size={22} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">Inga kurser hittades</p>
                                <p className="text-gray-400 text-sm mb-4">Prova en annan sökterm eller kategori</p>
                                {selectedCategory !== 'Alla Kurser' && (
                                    <button
                                        onClick={() => setSelectedCategory('Alla Kurser')}
                                        className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline"
                                    >
                                        Visa alla kurser
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── INFO MODAL ─── */}
            {selectedCourseInfo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedCourseInfo(null)}
                >
                    <div
                        className="bg-white dark:bg-[#1a1b1d] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative border border-gray-100 dark:border-[#2a2b2d] custom-scrollbar"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Gradient top bar */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(selectedCourseInfo.category)} rounded-t-3xl`} />

                        <button
                            onClick={() => setSelectedCourseInfo(null)}
                            className="absolute top-5 right-5 p-2 bg-gray-100 dark:bg-[#252628] hover:bg-gray-200 dark:hover:bg-[#333] rounded-xl transition-colors z-10"
                        >
                            <X size={16} className="text-gray-500" />
                        </button>

                        <div className="p-1">
                            {selectedCourseInfo.skolverketCourse ? (
                                <SkolverketCourseInfo skolverketCourse={selectedCourseInfo.skolverketCourse} />
                            ) : (
                                <div className="p-8">
                                    <h2 className="text-2xl font-black mb-1 text-gray-900 dark:text-white pr-10">
                                        {selectedCourseInfo.name}
                                    </h2>
                                    <p className="text-sm text-gray-400 mb-6">
                                        {selectedCourseInfo.courseCode} · {selectedCourseInfo.category}
                                    </p>
                                    <div
                                        className="text-gray-600 dark:text-gray-300 mb-6 prose dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedCourseInfo.description }}
                                    />
                                    {selectedCourseInfo.category !== 'Skolverket Import' && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3">
                                            <AlertCircle size={15} className="mt-0.5 shrink-0" />
                                            <span>Denna kurs är inte kopplad till en officiell kursplan från Skolverket ännu.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;
