import React, { useState } from 'react';
import {
    X, CheckCircle2, XCircle, Clock, AlertCircle,
    FileText, User, Mail, Phone, Calendar,
    MessageSquare, Save, ArrowRight, ShieldCheck,
    GraduationCap, Info
} from 'lucide-react';
import { api } from '../../../../services/api';

const ApplicationDetailModal = ({ application, onClose, onUpdate }) => {
    const [note, setNote] = useState(application.adminNote || '');
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(newStatus);
        try {
            await api.courses.handleApplication(application.id, newStatus);
            onUpdate();
            onClose();
        } catch (e) {
            console.error('Failed to update status:', e);
            alert('Misslyckades att uppdatera status.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleSaveNote = async () => {
        setSaving(true);
        try {
            await api.courses.updateApplicationNote(application.id, note);
            onUpdate();
            // We don't close, just show feedback? For now, we'll keep it simple
        } catch (e) {
            console.error('Failed to save note:', e);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        const map = {
            'PENDING': 'bg-amber-100 text-amber-700',
            'UNDER_REVIEW': 'bg-indigo-100 text-indigo-700',
            'APPROVED': 'bg-emerald-100 text-emerald-700',
            'REJECTED': 'bg-rose-100 text-rose-700',
            'MORE_INFO': 'bg-blue-100 text-blue-700',
            'WAITLISTED': 'bg-slate-100 text-slate-700'
        };
        return map[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a1b1d] rounded-[32px] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-[#2a2b2d] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">
                            {application.student?.firstName?.[0]}{application.student?.lastName?.[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                                {application.student?.firstName} {application.student?.lastName}
                            </h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                Ansökan till {application.course?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#252628] text-gray-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 h-[600px]">
                    {/* Left Side: Info & Profile */}
                    <div className="lg:col-span-2 border-r border-gray-50 dark:border-[#2a2b2d] p-8 overflow-y-auto bg-gray-50/50 dark:bg-[#1a1b1d]">
                        <div className="space-y-8">
                            {/* Student Details */}
                            <section>
                                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                    <User size={12} className="text-indigo-500" />
                                    Sökande
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white dark:bg-[#252628] text-gray-400">
                                            <Mail size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">E-post</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{application.student?.email || 'Ingen e-post'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white dark:bg-[#252628] text-gray-400">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Telefon</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{application.student?.phone || 'Inget telefonnummer'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white dark:bg-[#252628] text-gray-400">
                                            <Info size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Personnummer</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{application.student?.ssn || 'Inget SSN'}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                    <GraduationCap size={12} className="text-indigo-500" />
                                    Utbildning
                                </h3>
                                <div className="p-4 bg-white dark:bg-[#252628] rounded-2xl border border-gray-100 dark:border-[#3a3b3d] shadow-sm">
                                    <p className="font-black text-gray-800 dark:text-white leading-tight mb-2">{application.course?.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                        <Calendar size={12} />
                                        Sökt den {new Date(application.appliedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Right Side: Decision & Notes */}
                    <div className="lg:col-span-3 p-8 overflow-y-auto bg-white dark:bg-[#1a1b1d]">
                        {/* Status Selection */}
                        <section className="mb-10">
                            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                Antagningsbeslut
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'APPROVED', label: 'Antag sökande', icon: <CheckCircle2 size={16} />, color: 'emerald' },
                                    { id: 'REJECTED', label: 'Avslå ansökan', icon: <XCircle size={16} />, color: 'rose' },
                                    { id: 'UNDER_REVIEW', label: 'Under granskning', icon: <Clock size={16} />, color: 'indigo' },
                                    { id: 'MORE_INFO', label: 'Behöver kompletteras', icon: <AlertCircle size={16} />, color: 'blue' },
                                    { id: 'WAITLISTED', label: 'Sätt som reserv', icon: <Calendar size={16} />, color: 'slate' },
                                ].map(btn => (
                                    <button
                                        key={btn.id}
                                        onClick={() => handleStatusChange(btn.id)}
                                        disabled={updatingStatus === btn.id}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-sm font-bold ${application.status === btn.id
                                                ? `bg-${btn.color}-600 border-${btn.color}-600 text-white shadow-lg shadow-${btn.color}-500/20`
                                                : `bg-white dark:bg-[#252628] border-gray-100 dark:border-[#3a3b3d] text-gray-600 dark:text-gray-300 hover:border-${btn.color}-300 hover:bg-${btn.color}-50 dark:hover:bg-${btn.color}-900/10`
                                            }`}
                                    >
                                        <div className={`${application.status === btn.id ? 'text-white' : `text-${btn.color}-500`}`}>
                                            {updatingStatus === btn.id ? <Clock size={16} className="animate-spin" /> : btn.icon}
                                        </div>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Admin Note */}
                        <section>
                            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                <MessageSquare size={12} className="text-amber-500" />
                                Interna anteckningar
                            </h3>
                            <div className="relative">
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-[#252628] border border-gray-100 dark:border-[#3a3b3d] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[160px] resize-none"
                                    placeholder="Skriv interna anteckningar om sökanden eller beslutsprocessen..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                                <button
                                    onClick={handleSaveNote}
                                    disabled={saving || note === application.adminNote}
                                    className="absolute bottom-4 right-4 bg-indigo-600 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                    Spara anteckning
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 bg-gray-50 dark:bg-[#1a1b1d] border-t border-gray-100 dark:border-[#2a2b2d] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <Clock size={14} />
                        Senast uppdaterad: {new Date(application.updatedAt || application.appliedAt).toLocaleString()}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3b3d] text-gray-400 text-sm font-bold hover:bg-white dark:hover:bg-[#252628] transition-all"
                        >
                            Stäng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailModal;
