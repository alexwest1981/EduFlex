import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Globe, BookOpen, Calendar, Users, Award,
    CheckCircle2, Loader2, AlertCircle, GraduationCap,
    Briefcase, Code2, Cog, HeartPulse, Building2, ArrowRight,
    Layers, Clock, Lock, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

/* Samma ikon/gradient-logik som ProgramCatalog */
const SUN_ICONS = { '4': Code2, '5': Cog, '7': HeartPulse, '2': Briefcase, '8': Building2, 'default': GraduationCap };
const getSunIcon = (sunCode) => SUN_ICONS[sunCode?.[0]] || SUN_ICONS.default;
const getSunGradient = (sunCode) => {
    const map = { '4': 'from-blue-600 to-cyan-500', '5': 'from-slate-600 to-gray-500', '7': 'from-rose-500 to-pink-600', '2': 'from-emerald-600 to-teal-500', '8': 'from-orange-500 to-amber-600' };
    return map[sunCode?.[0]] || 'from-indigo-600 to-violet-500';
};

const ProgramDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAppContext();

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                // Try to get by ID first, then slug if ID is not available
                const data = await api.educationPrograms.getById(id);
                setProgram(data);
            } catch (e) {
                setError('Kunde inte hämta utbildningsprogrammet.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleApply = async () => {
        if (!currentUser) { navigate('/login'); return; }
        setApplying(true);
        try {
            await api.educationPrograms.apply(program.id, currentUser.id);
            setApplied(true);
        } catch (e) {
            alert('Kunde inte skicka ansökan: ' + (e.message || 'Okänt fel'));
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-40">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
    );

    if (error || !program) return (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
            <AlertCircle size={28} />
            <p className="text-sm">{error || 'Program hittades inte.'}</p>
            <button onClick={() => navigate('/programs')} className="text-indigo-500 text-sm underline">← Tillbaka</button>
        </div>
    );

    const Icon = getSunIcon(program.sunCode);
    const gradient = getSunGradient(program.sunCode);
    const cleanDesc = program.description?.replace(/<[^>]*>/g, '') || '';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 pb-24">

            {/* HERO */}
            <div className={`relative bg-gradient-to-br ${gradient} overflow-hidden`}>
                {/* Dot pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

                <div className="relative max-w-5xl mx-auto px-8 pt-8 pb-10">
                    {/* Breadcrumb */}
                    <button
                        onClick={() => navigate('/programs')}
                        className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Tillbaka till Utbildningar
                    </button>

                    <div className="flex items-start gap-6 flex-wrap">
                        {/* Ikon */}
                        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 shadow-lg">
                            <Icon size={36} className="text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {program.sunCode && (
                                    <span className="bg-black/20 backdrop-blur text-white text-xs font-mono font-bold px-3 py-1 rounded-lg">
                                        SUN {program.sunCode}
                                    </span>
                                )}
                                {program.requiresLia && (
                                    <span className="bg-amber-500/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-lg">
                                        Inkl. LIA/Praktik
                                    </span>
                                )}
                                <span className={`text-xs font-bold px-3 py-1 rounded-lg backdrop-blur ${program.isOpen ? 'bg-emerald-500/80 text-white' : 'bg-black/30 text-white/70'}`}>
                                    {program.isOpen ? '✓ Öppen för ansökan' : 'Stängd för ansökan'}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                                {program.name}
                            </h1>
                            {program.courseCode && (
                                <p className="text-white/60 text-sm font-mono">{program.courseCode}</p>
                            )}
                        </div>

                        {/* Ansök-knapp */}
                        <div className="shrink-0">
                            {!currentUser ? (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg text-sm"
                                >
                                    <Lock size={14} />
                                    Logga in för att ansöka
                                </button>
                            ) : applied ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm">
                                    <CheckCircle2 size={16} />
                                    Ansökan skickad!
                                </div>
                            ) : (
                                <button
                                    onClick={handleApply}
                                    disabled={!program.isOpen || applying}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${!program.isOpen
                                            ? 'bg-black/20 text-white/50 cursor-not-allowed'
                                            : 'bg-white text-gray-900 hover:bg-white/90'
                                        }`}
                                >
                                    {applying
                                        ? <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                                        : <><ArrowRight size={14} />Ansök nu</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <div className="max-w-5xl mx-auto px-8 py-8">
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Vänster – Info */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Beskrivning */}
                        {cleanDesc && (
                            <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] p-6">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                    <BookOpen size={14} />
                                    Om utbildningen
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                                    {cleanDesc}
                                </p>
                            </div>
                        )}

                        {/* Kurser i programmet */}
                        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] p-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                                <Layers size={14} />
                                Kursöversikt
                            </h2>
                            <div className="space-y-3">
                                {program.courses && program.courses.length > 0 ? (
                                    program.courses.map((course, idx) => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#252628] border border-transparent hover:border-indigo-500/30 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/courses/${course.id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1a1b1d] flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                                                        {course.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-mono">{course.courseCode || 'KURS-ID: ' + course.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-500">{course.credits || 0} YHp</span>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Inga kurser har lagts till i detta program ännu.</p>
                                )}
                            </div>
                        </div>

                        {/* Kursplan (Skolverket) */}
                        {program.skolverketCourse && (
                            <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] p-6">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                    <Award size={14} />
                                    Nationell kursplan (Skolverket)
                                </h2>
                                <div className="space-y-3 text-sm">
                                    {program.skolverketCourse.centralContent && (
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white mb-1">Centralt innehåll</p>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {program.skolverketCourse.centralContent.replace(/<[^>]*>/g, '')}
                                            </p>
                                        </div>
                                    )}
                                    {program.skolverketCourse.gradingCriteria && (
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white mb-1">Betygskriterier</p>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {program.skolverketCourse.gradingCriteria.replace(/<[^>]*>/g, '')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Moduler */}
                        {program.modulesCount > 0 && (
                            <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] p-6">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                    <Layers size={14} />
                                    Kursmoduler
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Programmet innehåller <strong className="text-gray-900 dark:text-white">{program.modulesCount}</strong> lärmoduler.
                                    Logga in för att se fullständigt innehåll och starta dina studier.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Höger – Faktaruta */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-100 dark:border-[#2a2b2d] p-5 space-y-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Programfakta</h3>

                            {[
                                { icon: Globe, label: 'SUN-kod', value: program.sunCode || '–' },
                                { icon: Calendar, label: 'Start', value: program.startDate || 'Löpande intake' },
                                { icon: Calendar, label: 'Slut', value: program.endDate || '–' },
                                { icon: Users, label: 'Platser', value: program.maxStudents ? `${program.enrolledCount ?? 0} / ${program.maxStudents}` : 'Obegränsad' },
                                { icon: Briefcase, label: 'LIA/Praktik', value: program.requiresLia ? 'Ja' : 'Nej' },
                                { icon: Clock, label: 'Status', value: program.isOpen ? 'Öppen' : 'Stängd' },
                            ].map(({ icon: Ic, label, value }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-[#252628] rounded-lg flex items-center justify-center shrink-0">
                                        <Ic size={14} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA för ej inloggade */}
                        {!currentUser && (
                            <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white`}>
                                <p className="font-bold text-sm mb-1">Intresserad?</p>
                                <p className="text-white/80 text-xs mb-4">Logga in eller skapa ett konto för att ansöka till detta program.</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-white text-gray-900 font-bold py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
                                >
                                    Logga in / Skapa konto
                                </button>
                            </div>
                        )}

                        {/* Tillbaka */}
                        <button
                            onClick={() => navigate('/programs')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2a2b2d] text-gray-600 dark:text-gray-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all"
                        >
                            <ArrowLeft size={14} />
                            Alla utbildningar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetail;
