import React, { useState } from 'react';
import {
    X, CheckCircle, AlertCircle, Edit2, PlayCircle, RotateCcw, Flag,
    GraduationCap, User, Calendar, BookOpen, Loader2, ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    DRAFT: { label: 'Utkast', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
    ACTIVE: { label: 'Aktiv', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    REVISED: { label: 'Under revision', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    COMPLETED: { label: 'Avslutad', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ARCHIVED: { label: 'Arkiverad', color: 'bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600' },
};

const STUDIEFORM_LABEL = { PLATS: 'På plats', DISTANS: 'Distans', KOMBINERAD: 'Kombinerad' };

const IspDetailModal = ({ plan: initialPlan, onClose, onEdit }) => {
    const [plan, setPlan] = useState(initialPlan);
    const [loading, setLoading] = useState(false);

    const cfg = STATUS_CONFIG[plan.status] || STATUS_CONFIG.DRAFT;
    const acknowledged = !!plan.studentAcknowledgedAt;

    const totalPoints = (plan.plannedCourses || []).reduce((sum, c) => sum + (c.points || 0), 0);

    const performAction = async (endpoint, successMsg) => {
        setLoading(true);
        try {
            const updated = await api.post(endpoint);
            setPlan(updated);
            toast.success(successMsg);
        } catch (err) {
            console.error(`Action ${endpoint} failed`, err);
            toast.error('Åtgärden misslyckades. Kontrollera att du har behörighet.');
        } finally {
            setLoading(false);
        }
    };

    const Field = ({ label, value }) => (
        value ? (
            <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{value}</p>
            </div>
        ) : null
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                {plan.student?.firstName} {plan.student?.lastName}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                                    {cfg.label}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase">v{plan.version}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

                    {/* Meta info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: <User size={14} />, label: 'SYV', value: `${plan.counselor?.firstName || ''} ${plan.counselor?.lastName || ''}`.trim() },
                            { icon: <BookOpen size={14} />, label: 'Studieform', value: STUDIEFORM_LABEL[plan.studieform] || plan.studieform },
                            { icon: <Calendar size={14} />, label: 'Studietakt', value: `${plan.studyPacePct}%` },
                            { icon: <Calendar size={14} />, label: 'Period', value: plan.plannedStart ? `${plan.plannedStart}${plan.plannedEnd ? ' → ' + plan.plannedEnd : ''}` : '—' },
                            { icon: <Award size={14} />, label: 'Examensmål', value: plan.examensmal },
                            { icon: <BarChart2 size={14} />, label: 'Poäng', value: `${totalPoints} / ${plan.kravPoang || 2500}` },
                        ].map(item => (
                            <div key={item.label} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    {item.icon}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                <p className="font-black text-sm text-gray-900 dark:text-white">{item.value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    {/* Kvittering */}
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl ${acknowledged
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : plan.status === 'ACTIVE'
                                ? 'bg-amber-50 dark:bg-amber-900/20'
                                : 'bg-gray-50 dark:bg-gray-900'
                        }`}>
                        {acknowledged ? (
                            <>
                                <CheckCircle size={20} className="text-green-600 shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-green-700 dark:text-green-400">Studenten har kvitterat</p>
                                    <p className="text-[10px] font-bold text-green-600/70">
                                        {new Date(plan.studentAcknowledgedAt).toLocaleString('sv-SE')}
                                    </p>
                                </div>
                            </>
                        ) : plan.status === 'ACTIVE' ? (
                            <>
                                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                                <p className="text-sm font-black text-amber-700 dark:text-amber-400">Väntar på kvittering från studenten</p>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={20} className="text-gray-400 shrink-0" />
                                <p className="text-sm font-bold text-gray-400">Kvittering sker när planen aktiveras</p>
                            </>
                        )}
                    </div>

                    {/* Plan content */}
                    <div className="space-y-5">
                        <Field label="Bakgrund" value={plan.bakgrund} />
                        <Field label="Syfte" value={plan.syfte} />
                        <Field label="Mål" value={plan.mal} />
                        <Field label="Stödbehov" value={plan.stodbehoV} />
                        {plan.counselorNotes && <Field label="SYV-noteringar" value={plan.counselorNotes} />}
                    </div>

                    {/* Planned courses */}
                    {plan.plannedCourses?.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                Planerade kurser ({plan.plannedCourses.length})
                            </h3>
                            <div className="space-y-2">
                                {plan.plannedCourses.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-2xl px-5 py-3">
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{c.courseName}</div>
                                            <div className="text-[10px] font-black text-gray-400">
                                                {c.courseCode && <span className="mr-3">{c.courseCode}</span>}
                                                <span className="mr-3">{c.points} po</span>
                                                <span className="mr-3">{c.level}</span>
                                                {c.studyPacePct}%
                                                {c.plannedStart && <span className="ml-3">{c.plannedStart}{c.plannedEnd ? ' → ' + c.plannedEnd : ''}</span>}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
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

                {/* Action footer */}
                <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex flex-wrap gap-3 justify-between items-center">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            Stäng
                        </button>

                        <div className="flex flex-wrap gap-2">
                            {/* Edit — only for DRAFT or REVISED */}
                            {(plan.status === 'DRAFT' || plan.status === 'REVISED') && (
                                <button
                                    onClick={() => onEdit(plan)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    <Edit2 size={14} />
                                    Redigera
                                </button>
                            )}

                            {/* Activate — DRAFT or REVISED */}
                            {(plan.status === 'DRAFT' || plan.status === 'REVISED') && (
                                <button
                                    onClick={() => performAction(`/isp/${plan.id}/activate`, 'Plan aktiverad')}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                                    Aktivera plan
                                </button>
                            )}

                            {/* Revise — ACTIVE only */}
                            {plan.status === 'ACTIVE' && (
                                <button
                                    onClick={() => performAction(`/isp/${plan.id}/revise`, 'Revision öppnad')}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                                    Öppna revision
                                </button>
                            )}

                            {/* Complete — ACTIVE only */}
                            {plan.status === 'ACTIVE' && (
                                <button
                                    onClick={() => performAction(`/isp/${plan.id}/complete`, 'Plan avslutad')}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
                                    Avsluta plan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IspDetailModal;
