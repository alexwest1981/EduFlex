import React, { useState, useEffect } from 'react';
import {
    GraduationCap, CheckCircle, AlertCircle, BookOpen, Calendar,
    User, Loader2, ClipboardCheck
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const STUDIEFORM_LABEL = { PLATS: 'På plats', DISTANS: 'Distans', KOMBINERAD: 'Kombinerad' };

const StudentIspPage = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [acknowledging, setAcknowledging] = useState(false);
    const [confirmChecked, setConfirmChecked] = useState(false);

    useEffect(() => {
        fetchMyPlan();
    }, []);

    const fetchMyPlan = async () => {
        setLoading(true);
        try {
            const data = await api.get('/isp/my');
            setPlan(data);
        } catch (err) {
            if (err?.response?.status === 404 || err?.status === 404) {
                setPlan(null); // Ingen aktiv plan
            } else {
                console.error('Failed to fetch ISP', err);
                toast.error('Kunde inte hämta studieplanen');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async () => {
        if (!confirmChecked) {
            toast.error('Du behöver bekräfta att du läst studieplanen');
            return;
        }
        setAcknowledging(true);
        try {
            const updated = await api.post(`/isp/${plan.id}/acknowledge`);
            setPlan(updated);
            toast.success('Tack! Du har kvitterat din studieplan.');
        } catch (err) {
            console.error('Failed to acknowledge', err);
            toast.error('Kunde inte kvittera studieplanen');
        } finally {
            setAcknowledging(false);
        }
    };

    const Section = ({ title, value }) =>
        value ? (
            <div className="space-y-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {value}
                </p>
            </div>
        ) : null;

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-indigo-400 mx-auto" size={40} />
                    <p className="font-bold text-gray-400">Hämtar din studieplan...</p>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="p-8 flex justify-center items-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[2rem] inline-block">
                        <GraduationCap size={48} className="text-gray-300 mx-auto" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Ingen aktiv studieplan</h2>
                    <p className="text-sm text-gray-400 font-medium">
                        Det finns ingen aktiv studieplan. Kontakta din studie- och yrkesvägledare (SYV) via{' '}
                        <a href="/support" className="text-indigo-500 hover:underline">kontaktformuläret</a> för att påbörja din planering.
                    </p>
                </div>
            </div>
        );
    }

    const acknowledged = !!plan.studentAcknowledgedAt;

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Min Studieplan</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Individuell studieplan (ISP) · Version {plan.version}</p>
                    </div>
                </div>
            </header>

            {/* Kvitterings-banner */}
            {!acknowledged ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={24} className="text-amber-500 shrink-0" />
                        <div>
                            <h3 className="font-black text-amber-800 dark:text-amber-400">Din studieplan väntar på kvittering</h3>
                            <p className="text-sm font-medium text-amber-700/70 dark:text-amber-500/70 mt-0.5">
                                Läs igenom din studieplan noggrant och kvittera att du tagit del av den.
                            </p>
                        </div>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={confirmChecked}
                                onChange={e => setConfirmChecked(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${confirmChecked
                                    ? 'bg-amber-500 border-amber-500'
                                    : 'border-amber-300 dark:border-amber-700 group-hover:border-amber-500'
                                }`}>
                                {confirmChecked && <CheckCircle size={13} className="text-white" />}
                            </div>
                        </div>
                        <span className="text-sm font-bold text-amber-800 dark:text-amber-400">
                            Jag har läst och tagit del av min individuella studieplan
                        </span>
                    </label>
                    <button
                        onClick={handleAcknowledge}
                        disabled={acknowledging || !confirmChecked}
                        className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                    >
                        {acknowledging ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
                        Kvittera studieplan
                    </button>
                </div>
            ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[2rem] p-5 flex items-center gap-3">
                    <CheckCircle size={24} className="text-green-600 shrink-0" />
                    <div>
                        <p className="font-black text-green-800 dark:text-green-400">Du har kvitterat din studieplan</p>
                        <p className="text-xs font-bold text-green-600/70 mt-0.5">
                            {new Date(plan.studentAcknowledgedAt).toLocaleString('sv-SE')}
                        </p>
                    </div>
                </div>
            )}

            {/* Meta info */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Grunduppgifter</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: <User size={14} />, label: 'SYV', value: `${plan.counselor?.firstName || ''} ${plan.counselor?.lastName || ''}`.trim() || '—' },
                        { icon: <BookOpen size={14} />, label: 'Studieform', value: STUDIEFORM_LABEL[plan.studieform] || plan.studieform || '—' },
                        { icon: <Calendar size={14} />, label: 'Studietakt', value: `${plan.studyPacePct}%` },
                        { icon: <Calendar size={14} />, label: 'Period', value: plan.plannedStart ? `${plan.plannedStart}${plan.plannedEnd ? ' → ' + plan.plannedEnd : ''}` : '—' },
                    ].map(item => (
                        <div key={item.label} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                {item.icon}
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                            <p className="font-black text-sm text-gray-900 dark:text-white">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan content */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Planens innehåll</h2>
                <Section title="Bakgrund" value={plan.bakgrund} />
                <Section title="Syfte" value={plan.syfte} />
                <Section title="Mål" value={plan.mal} />
                <Section title="Stödbehov" value={plan.stodbehoV} />

                {!plan.bakgrund && !plan.syfte && !plan.mal && !plan.stodbehoV && (
                    <p className="text-sm text-gray-400 font-medium italic">Inga textfält har fyllts i ännu.</p>
                )}
            </div>

            {/* Planned courses */}
            {plan.plannedCourses?.length > 0 && (
                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                        Planerade kurser ({plan.plannedCourses.length})
                    </h2>
                    <div className="space-y-2">
                        {plan.plannedCourses.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-2xl px-5 py-4">
                                <div>
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{c.courseName}</div>
                                    <div className="text-[10px] font-black text-gray-400 mt-0.5">
                                        {c.courseCode && <span className="mr-3">{c.courseCode}</span>}
                                        {c.studyPacePct}%
                                        {c.plannedStart && <span className="ml-3">{c.plannedStart}{c.plannedEnd ? ' → ' + c.plannedEnd : ''}</span>}
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            c.status === 'DROPPED' ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {c.status === 'PLANNED' ? 'Planerad' : c.status === 'IN_PROGRESS' ? 'Pågår' :
                                        c.status === 'COMPLETED' ? 'Klar' : 'Avhoppad'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentIspPage;
