import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Globe, GraduationCap, Briefcase, ChevronRight,
    LayoutGrid, List, Loader2, AlertCircle, BookOpen, Filter,
    Building2, X, ArrowRight, Cpu, HeartPulse, Cog, Code2
} from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

/* SUN-kod kategori → ikon-mapping. Enkel men utbyggbar. */
const SUN_ICONS = {
    '4': Code2,
    '5': Cog,
    '7': HeartPulse,
    '2': Briefcase,
    '8': Building2,
    'default': GraduationCap,
};

const getSunIcon = (sunCode) => {
    if (!sunCode) return SUN_ICONS.default;
    return SUN_ICONS[sunCode[0]] || SUN_ICONS.default;
};

/* Gradient baserat på SUN-kategori */
const getSunGradient = (sunCode) => {
    const map = {
        '4': 'from-blue-600 to-cyan-500',
        '5': 'from-slate-600 to-gray-500',
        '7': 'from-rose-500 to-pink-600',
        '2': 'from-emerald-600 to-teal-500',
        '8': 'from-orange-500 to-amber-600',
    };
    return map[sunCode?.[0]] || 'from-indigo-600 to-violet-500';
};

const ProgramCard = ({ course, viewMode, onApply, applying, applySuccess }) => {
    const gradient = getSunGradient(course.sunCode);
    const Icon = getSunIcon(course.sunCode);
    const isApplied = applySuccess === course.id;

    if (viewMode === 'list') {
        return (
            <div className="group bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200 flex">
                <div className={`w-1.5 shrink-0 bg-gradient-to-b ${gradient}`} />
                <div className="flex items-center gap-5 px-5 py-4 flex-1 min-w-0 flex-wrap md:flex-nowrap">
                    <div className={`hidden md:flex w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white items-center justify-center shrink-0`}>
                        <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            {course.sunCode && (
                                <span className="text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                                    SUN {course.sunCode}
                                </span>
                            )}
                            {course.requiresLia && (
                                <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                                    Inkl. LIA
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm group-hover:text-indigo-600 transition-colors">
                            {course.name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden md:inline text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                            {course.isOpen ? 'Öppen för ansökan' : 'Stängd'}
                        </span>
                        <button
                            onClick={() => onApply(course.id)}
                            disabled={!course.isOpen || applying === course.id}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${isApplied ? 'bg-emerald-500 text-white'
                                : !course.isOpen ? 'bg-gray-100 dark:bg-[#252628] text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                }`}
                        >
                            {isApplied ? '✓ Skickat' : applying === course.id
                                ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                : 'Ansök'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <div className="group bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-800/40 transition-all duration-300 flex flex-col">
            {/* Colored header */}
            <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
                />
                <Icon size={28} className="text-white/80 relative z-10" />
                {course.sunCode && (
                    <span className="absolute top-3 left-3 bg-black/25 backdrop-blur-sm text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg text-white">
                        SUN {course.sunCode}
                    </span>
                )}
                {course.requiresLia && (
                    <span className="absolute top-3 right-3 bg-amber-500/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-lg text-white">
                        LIA
                    </span>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {course.name}
                </h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
                    {course.description
                        ? course.description.replace(/<[^>]*>/g, '')
                        : 'Nationellt utbildningsprogram från Skolverkets SUSA-nav.'}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${course.isOpen
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {course.isOpen ? 'Öppen' : 'Stängd'}
                    </span>
                    <button
                        onClick={() => onApply(course.id)}
                        disabled={!course.isOpen || applying === course.id}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isApplied ? 'bg-emerald-500 text-white'
                            : !course.isOpen ? 'bg-gray-100 dark:bg-[#252628] text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                            }`}
                    >
                        {isApplied ? '✓ Anmäld' : applying === course.id
                            ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : <><span>Ansök</span><ArrowRight size={11} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProgramCatalog = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLia, setFilterLia] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [applying, setApplying] = useState(null);
    const [applySuccess, setApplySuccess] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                // Hämta alla kurser och filtrera dem som har en SUN-kod
                const data = await api.courses.getAll();
                setAllCourses(data);
                // Program = kurser med sunCode satt (importerat via SUSA-navet)
                const sunPrograms = data.filter(c => c.sunCode);
                setPrograms(sunPrograms);
            } catch (e) {
                console.error('Kunde inte ladda utbildningsprogram:', e);
                setError('Kunde inte hämta utbildningsprogram från servern.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleApply = async (courseId) => {
        if (!currentUser) { navigate('/login'); return; }
        setApplying(courseId);
        try {
            await api.courses.apply(courseId, currentUser.id);
            setApplySuccess(courseId);
            setTimeout(() => setApplySuccess(null), 3000);
        } catch (e) {
            alert('Kunde inte skicka ansökan: ' + (e.message || 'Okänt fel'));
        } finally {
            setApplying(null);
        }
    };

    const filtered = useMemo(() => {
        return programs.filter(p => {
            const matchSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.sunCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.courseCode || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchLia = !filterLia || p.requiresLia;
            return matchSearch && matchLia;
        });
    }, [programs, searchTerm, filterLia]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] pb-24 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">

            {/* HERO */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2" />
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-teal-600/15 rounded-full blur-3xl -translate-y-1/3" />
                </div>
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '28px 28px' }}
                />

                <div className="relative max-w-7xl mx-auto px-8 pt-10 pb-12">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-full text-emerald-300 text-xs font-semibold tracking-wider uppercase">
                            <Globe size={12} />
                            Utbildningsnavet · Skolverket
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                        Utbildningsprogram{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            via SUSA-navet
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-lg mb-8">
                        Nationellt godkända yrkeshögskoleprogram och kurser hämtade direkt från Skolverkets utbildningsdatabas.
                    </p>

                    <div className="flex flex-wrap gap-8 mb-8">
                        {[
                            { label: 'Tillgängliga program', value: programs.length },
                            { label: 'Med LIA/Praktik', value: programs.filter(p => p.requiresLia).length },
                            { label: 'Öppna för ansökan', value: programs.filter(p => p.isOpen).length },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tabular-nums">
                                    {loading ? '–' : stat.value}
                                </span>
                                <span className="text-slate-400 text-sm">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sökfält */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:bg-white/15 transition-all text-sm font-medium"
                            placeholder="Sök program, SUN-kod..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <div className="max-w-7xl mx-auto px-8 py-7">

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> program
                        </p>
                        <button
                            onClick={() => setFilterLia(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filterLia
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white dark:bg-[#1a1b1d] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2a2b2d] hover:border-amber-400'
                                }`}
                        >
                            <Filter size={12} />
                            Visa LIA-program
                            {filterLia && <X size={10} className="ml-1" />}
                        </button>
                    </div>

                    <div className="flex bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#2a2b2d] rounded-xl overflow-hidden">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                            <LayoutGrid size={15} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                            <List size={15} />
                        </button>
                    </div>
                </div>

                {/* Empty / Error state */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 mb-6">
                        <AlertCircle size={18} className="shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
                        <Loader2 size={28} className="animate-spin" />
                        <p className="text-sm">Hämtar utbildningsprogram...</p>
                    </div>
                ) : programs.length === 0 ? (
                    /* Inga program importerade ännu = Admin-uppmaning */
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                            <Globe size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                            Inga utbildningsprogram ännu
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">
                            Inga program från SUSA-navet har importerats ännu. Som admin kan du hämta program via <strong>Admin → Kurser → Hämta via SUN-kod</strong>.
                        </p>
                        <a
                            href="/admin"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                        >
                            <BookOpen size={16} />
                            Gå till Admin
                            <ChevronRight size={16} />
                        </a>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Search size={28} className="text-gray-300 mb-3" />
                        <p className="text-gray-700 dark:text-gray-300 font-semibold">Inga program hittades</p>
                        <p className="text-gray-400 text-sm">Prova en annan sökterm</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-3'}>
                        {filtered.map(program => (
                            <ProgramCard
                                key={program.id}
                                course={program}
                                viewMode={viewMode}
                                onApply={handleApply}
                                applying={applying}
                                applySuccess={applySuccess}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramCatalog;
