import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Thermometer, Calendar, Clock,
    CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const statusLabels = { ACTIVE: 'Aktiv', CANCELLED: 'Avbruten' };
const statusColors = {
    ACTIVE: 'bg-rose-500/10 text-rose-600',
    CANCELLED: 'bg-gray-500/10 text-gray-500',
};

const SickLeaveForm = () => {
    const navigate = useNavigate();
    const [activeReport, setActiveReport] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            const [active, hist] = await Promise.all([
                api.sickLeave.getActive(),
                api.sickLeave.getMy(),
            ]);
            setActiveReport(active);
            setHistory(hist || []);
        } catch (err) {
            console.error('Failed to load sick leave data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async () => {
        if (!startDate) {
            toast.error('Ange ett startdatum');
            return;
        }
        setSubmitting(true);
        try {
            await api.sickLeave.report({
                startDate,
                endDate: endDate || null,
                reason: reason || null,
            });
            toast.success('Sjukanmälan registrerad');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
            setReason('');
            loadData();
        } catch (err) {
            toast.error('Kunde inte registrera sjukanmälan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!activeReport) return;
        if (!window.confirm('Vill du avbryta din sjukanmälan?')) return;
        try {
            await api.sickLeave.cancel(activeReport.id);
            toast.success('Sjukanmälan avbruten');
            loadData();
        } catch (err) {
            toast.error('Kunde inte avbryta sjukanmälan');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 rounded-xl">
                            <Thermometer className="w-6 h-6 text-rose-500" />
                        </div>
                        Sjukanmälan
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                        Anmäl frånvaro på grund av sjukdom.
                    </p>
                </div>
            </div>

            {/* Active Report */}
            {activeReport && (
                <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-200 dark:border-rose-800/30 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Du är sjukanmäld
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors.ACTIVE}`}>
                            Aktiv
                        </span>
                    </div>
                    <div className="text-sm text-rose-600 dark:text-rose-300 space-y-1">
                        <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Från: {activeReport.startDate}
                            {activeReport.endDate ? ` — Till: ${activeReport.endDate}` : ' (tills vidare)'}
                        </p>
                        {activeReport.reason && (
                            <p className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {activeReport.reason}
                            </p>
                        )}
                    </div>
                    <button onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black/20 text-rose-600 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Avbryt sjukanmälan
                    </button>
                </div>
            )}

            {/* Report Form */}
            {!activeReport && (
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-rose-500" />
                        Ny sjukanmälan
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                Startdatum *
                            </label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                Slutdatum (valfritt)
                            </label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                            Anledning (valfritt)
                        </label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)}
                            placeholder="T.ex. förkyld, magsjuk..."
                            rows={2}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white resize-none" />
                    </div>

                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 disabled:opacity-50 transition-colors">
                        <Thermometer className="w-4 h-4" />
                        {submitting ? 'Skickar...' : 'Sjukanmäl mig'}
                    </button>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-white/5">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Historik
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {history.map(r => (
                            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                        {r.startDate}{r.endDate ? ` — ${r.endDate}` : ''}
                                    </p>
                                    {r.reason && (
                                        <p className="text-xs text-gray-400 truncate">{r.reason}</p>
                                    )}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${statusColors[r.status] || ''}`}>
                                    {statusLabels[r.status] || r.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SickLeaveForm;
