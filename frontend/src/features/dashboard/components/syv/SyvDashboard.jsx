import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Search, Filter, Calendar, CheckCircle2, XCircle,
    MoreHorizontal, ArrowRight, ShieldCheck, Mail, Phone,
    Clock, AlertCircle, FileText, ChevronRight, GraduationCap,
    Download, LayoutGrid, List, RefreshCw
} from 'lucide-react';
import { api } from '../../../../services/api';
import { useAppContext } from '../../../../context/AppContext';
import ApplicationDetailModal from './ApplicationDetailModal';

const SyvDashboard = () => {
    const { currentUser } = useAppContext();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedApp, setSelectedApp] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    const loadApplications = async () => {
        setLoading(true);
        try {
            const data = await api.courses.getAllApplications();
            setApplications(data);
        } catch (e) {
            console.error('Failed to load applications:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    const filteredApps = useMemo(() => {
        return applications.filter(app => {
            const studentName = (app.student?.firstName + ' ' + app.student?.lastName).toLowerCase();
            const courseName = app.course?.name?.toLowerCase() || '';
            const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                courseName.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const total = applications.length;
        const pending = applications.filter(a => a.status === 'PENDING').length;
        const approved = applications.filter(a => a.status === 'APPROVED').length;
        const rejected = applications.filter(a => a.status === 'REJECTED').length;
        return { total, pending, approved, rejected };
    }, [applications]);

    const getStatusColor = (status) => {
        const map = {
            'PENDING': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'UNDER_REVIEW': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            'APPROVED': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            'REJECTED': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
            'MORE_INFO': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'WAITLISTED': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        };
        return map[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status) => {
        const map = {
            'PENDING': 'Väntande',
            'UNDER_REVIEW': 'Granskas',
            'APPROVED': 'Antagen',
            'REJECTED': 'Avslagen',
            'MORE_INFO': 'Komplettering',
            'WAITLISTED': 'Reserv'
        };
        return map[status] || status;
    };

    if (loading && applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
                <RefreshCw size={32} className="animate-spin" />
                <p className="font-medium">Laddar ansökningar...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Header / Stats Overlay */}
            <div className="mb-8 bg-white dark:bg-[#1a1b1d] rounded-3xl p-8 border border-gray-100 dark:border-[#2a2b2d] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                            Antagningshantering
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Hantera inkomna ansökningar till EduFlex utbildningsprogram.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadApplications}
                            className="p-3 rounded-2xl bg-gray-50 dark:bg-[#252628] text-gray-600 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Totalt inkomna', value: stats.total, icon: <FileText size={18} />, color: 'blue' },
                        { label: 'Väntande beslut', value: stats.pending, icon: <Clock size={18} />, color: 'amber' },
                        { label: 'Antagna', value: stats.approved, icon: <CheckCircle2 size={18} />, color: 'emerald' },
                        { label: 'Avslag', value: stats.rejected, icon: <XCircle size={18} />, color: 'rose' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-gray-50 dark:bg-[#252628] rounded-2xl p-4 flex items-center gap-4 border border-transparent hover:border-indigo-100/50 dark:hover:border-indigo-900/30 transition-all">
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">{stat.label}</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/50 dark:bg-[#1a1b1d]/50 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-[#2a2b2d]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#252628] border border-gray-100 dark:border-[#2a2b2d] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        placeholder="Sök på student eller program..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-[#252628] p-1 rounded-xl border border-gray-100 dark:border-[#2a2b2d]">
                        {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === status
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2b2d]'
                                    }`}
                            >
                                {status === 'ALL' ? 'Alla' : getStatusLabel(status)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Applications List */}
            {filteredApps.length === 0 ? (
                <div className="bg-white dark:bg-[#1a1b1d] rounded-3xl py-20 text-center border border-gray-100 dark:border-[#2a2b2d]">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <Filter size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inga ansökningar hittades</h3>
                    <p className="text-gray-500 text-sm">Prova att ändra din sökning eller filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredApps.map(app => (
                        <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className="group flex items-center gap-6 bg-white dark:bg-[#1a1b1d] p-5 rounded-3xl border border-gray-100 dark:border-[#2a2b2d] hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-black/20 transition-all cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 overflow-hidden">
                                {app.student?.profilePictureUrl ? (
                                    <img src={app.student.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{app.student?.firstName?.[0]}{app.student?.lastName?.[0]}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors mb-0.5">
                                    {app.student?.firstName} {app.student?.lastName}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap size={12} />
                                        {app.course?.name}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(app.appliedAt).toLocaleDateString('sv-SE', {
                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 shrink-0">
                                <div className={`hidden md:flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                    {getStatusLabel(app.status)}
                                </div>

                                <button className="p-2 rounded-xl bg-gray-50 dark:bg-[#252628] text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedApp && (
                <ApplicationDetailModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={loadApplications}
                />
            )}
        </div>
    );
};

export default SyvDashboard;
