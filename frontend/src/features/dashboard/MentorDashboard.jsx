import React, { useState, useEffect } from 'react';
import {
    Users, TrendingUp, AlertTriangle, MessageSquare,
    Heart, Calendar, BarChart2, MoreVertical,
    Mail, Phone, Info, X, Zap,
    PieChart, Download, FileText, Send,
    UserPlus, Bell, Settings, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    Cell, LineChart, Line
} from 'recharts';
import { api } from '../../services/api';
import SurveyNotificationWidget from './widgets/SurveyNotificationWidget';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// --- SVENSKA ÖVERSÄTTNINGAR (INLINE FÖR SNABBHET) ---
const translations = {
    title: "Klassens puls",
    attendance: "Idag närvaro",
    risk: "Risk status",
    grades: "Betyg progress",
    wellbeing: "Trivsel index",
    contacts: "Olästa studenter",
    quickActions: "Snabba åtgärder",
    pupilGrid: "Elevvy",
    trends: "Trender",
    sendMsg: "Skicka info",
    survey: "Trivselenkät",
    report: "Exportera",
    invite: "Bjud in",
    riskHigh: "Hög risk",
    riskMedium: "Varning",
    riskLow: "Aktiv",
    noClass: "Ingen klass tilldelad"
};

const KPI_COLORS = {
    attendance: "#3b82f6",
    risk: "#ef4444",
    grades: "#10b981",
    wellbeing: "#8b5cf6",
    contacts: "#f59e0b"
};

const MentorDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [pupils, setPupils] = useState([]);
    const [selectedPupil, setSelectedPupil] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [overviewData, pupilsData] = await Promise.all([
                api.mentors.getClassOverview(),
                api.mentors.getMyClassPupils()
            ]);
            setOverview(overviewData);
            setPupils(pupilsData);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch mentor dashboard:', err);
            setError(translations.noClass);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Hämtar klassens puls...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
            <div className="max-w-md text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{error}</h2>
                    <p className="text-gray-600 dark:text-gray-400">Kontakta administratören för att bli tilldelad en klass.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-6 transition-colors duration-300">
            {/* HEADER */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {translations.title}: <span className="text-blue-600 dark:text-blue-400">{overview?.className}</span>
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {overview?.studentCount} elever • Senaste uppdateringen: {new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => fetchDashboardData()} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
                        <TrendingUp className="h-5 w-5" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-sm">
                        <Filter className="h-4 w-4" />
                        Filtrera
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-medium text-sm">
                        <Calendar className="h-4 w-4" />
                        Idag
                    </button>
                </div>
            </motion.div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <KPICard
                    title={translations.attendance}
                    value={overview?.attendanceToday}
                    icon={Users}
                    color={KPI_COLORS.attendance}
                    detail="8 avvikelser"
                />
                <KPICard
                    title={translations.risk}
                    value={overview?.atRiskCount}
                    icon={AlertTriangle}
                    color={KPI_COLORS.risk}
                    detail="Hög prioritet"
                />
                <KPICard
                    title={translations.grades}
                    value={overview?.gradeStatus}
                    icon={TrendingUp}
                    color={KPI_COLORS.grades}
                    detail="2 F-varningar"
                />
                <KPICard
                    title={translations.wellbeing}
                    value={overview?.wellbeingIndex + "%"}
                    icon={Heart}
                    color={KPI_COLORS.wellbeing}
                    detail={overview?.avgWellbeing?.toFixed(1) + "/5 snitt"}
                />
                <KPICard
                    title={translations.contacts}
                    value={overview?.contactNeeds}
                    icon={MessageSquare}
                    color={KPI_COLORS.contacts}
                    detail="Från elever"
                />
            </div>

            <SurveyNotificationWidget />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* STUDENT GRID */}
                <div className="lg:col-span-8 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            {translations.pupilGrid}
                        </h2>
                        <div className="flex gap-2">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> God
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Varning
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div> Risk
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 bg-white/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
                        {pupils.map((pupil, idx) => (
                            <PupilMiniCard
                                key={pupil.id}
                                pupil={pupil}
                                index={idx}
                                onSelect={setSelectedPupil}
                            />
                        ))}
                        {pupils.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-400 italic">
                                Inga elever hittades i {overview?.className}
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR: GRAPHS & ACTIONS */}
                <div className="lg:col-span-4 space-y-6">
                    {/* QUICK ACTIONS */}
                    <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            {translations.quickActions}
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <ActionButton icon={Mail} label={translations.sendMsg} color="bg-blue-50 text-blue-600 dark:bg-blue-900/30" />
                            <ActionButton icon={Heart} label={translations.survey} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30" />
                            <ActionButton icon={FileText} label={translations.report} color="bg-amber-50 text-amber-600 dark:bg-amber-900/30" />
                            <ActionButton icon={UserPlus} label={translations.invite} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" />
                            <ActionButton icon={BarChart2} label="Analys" color="bg-slate-100 dark:bg-slate-800" />
                            <ActionButton icon={Calendar} label="Schema" color="bg-slate-100 dark:bg-slate-800" />
                            <ActionButton icon={Bell} label="Notiser" color="bg-slate-100 dark:bg-slate-800" />
                            <ActionButton icon={Settings} label="Hantera" color="bg-slate-100 dark:bg-slate-800" />
                        </div>
                    </section>

                    {/* TREND GRAPH */}
                    <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <BarChart2 className="h-4 w-4" />
                                {translations.trends}
                            </h3>
                            <select className="text-xs bg-transparent border-none focus:ring-0 text-slate-500 font-medium">
                                <option>Närvaro</option>
                                <option>Trivsel</option>
                            </select>
                        </div>
                        <div className="h-48 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockTrendData}>
                                    <defs>
                                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px', color: 'white' }}
                                        itemStyle={{ color: '#60a5fa' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="val"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTrend)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>
            </div>

            {/* PUPIL POPUP MODAL */}
            <AnimatePresence>
                {selectedPupil && (
                    <Modal onClose={() => setSelectedPupil(null)}>
                        <PupilDetail pupil={selectedPupil} />
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const KPICard = ({ title, value, icon: Icon, color, detail }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all"
    >
        <div className="flex justify-between items-start relative z-10">
            <div className="p-2.5 rounded-2xl bg-opacity-10" style={{ backgroundColor: `${color}20`, color: color }}>
                <Icon className="h-5 w-5" />
            </div>
            <MoreVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 cursor-pointer" />
        </div>
        <div className="mt-4 relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{detail}</p>
        </div>
        {/* Subtle gradient background */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }}></div>
    </motion.div>
);

const PupilMiniCard = ({ pupil, index, onSelect }) => {
    // Determine ring color based on riskScore (1-5)
    const ringColor =
        pupil.riskScore >= 4 ? 'border-red-500 ring-red-500/20' :
            pupil.riskScore >= 3 ? 'border-amber-500 ring-amber-500/20' :
                'border-emerald-500 ring-emerald-500/20';

    return (
        <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(pupil)}
            className="flex flex-col items-center group relative p-1"
        >
            <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 p-1 bg-white dark:bg-slate-800 transition-all ${ringColor} ring-4`}>
                {pupil.photo ? (
                    <img src={pupil.photo} alt={pupil.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                    <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {pupil.name.charAt(0)}
                    </div>
                )}
                {/* Status Indicator Bar */}
                <div className="absolute -bottom-1 left-2 right-2 h-[2px] rounded-full flex gap-1">
                    <div className={`h-full w-1/3 rounded-full ${pupil.attendance > 90 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div className={`h-full w-1/3 rounded-full ${pupil.wellbeing >= 3 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <div className={`h-full w-1/3 rounded-full ${pupil.grades.includes('0/') ? 'bg-slate-300' : 'bg-emerald-500'}`}></div>
                </div>
            </div>
            <span className="mt-2 text-[10px] md:text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-[64px]">
                {pupil.name.split(' ')[0]}
            </span>
        </motion.button>
    );
};

const ActionButton = ({ icon: Icon, label, color }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-1.5 group"
    >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-md ${color}`}>
            <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
    </motion.button>
);

const Modal = ({ children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
            <div className="absolute right-6 top-6 z-20">
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X className="h-6 w-6" />
                </button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

const PupilDetail = ({ pupil }) => (
    <div className="flex flex-col">
        {/* Profile Header */}
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute -bottom-12 left-8 border-4 border-white dark:border-slate-900 rounded-3xl overflow-hidden w-28 h-28 bg-white shadow-xl">
                {pupil.photo ? (
                    <img src={pupil.photo} alt={pupil.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-3xl font-black">
                        {pupil.name.charAt(0)}
                    </div>
                )}
            </div>
        </div>

        <div className="pt-16 pb-8 px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{pupil.name}</h2>
                <p className="text-blue-500 font-bold mb-6">Elev ID: #{pupil.id}</p>

                <div className="space-y-4">
                    <StatRow label="Närvaro" value={pupil.attendance + "%"} color="text-blue-500" />
                    <StatRow label="Betyg" value={pupil.grades} color="text-emerald-500" />
                    <StatRow label="Trivsel" value={pupil.wellbeing + "/5"} color="text-purple-500" />
                    <StatRow label="Risk Nivå" value={pupil.riskScore >= 4 ? 'HÖG' : 'LÅG'} color={pupil.riskScore >= 4 ? 'text-red-500' : 'text-emerald-500'} />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Snabba val</h3>
                <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 transition-all font-bold group">
                    <Mail className="h-5 w-5 text-slate-400 group-hover:text-blue-500" /> Skicka Mail
                </button>
                <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-200 transition-all font-bold group">
                    <Phone className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" /> Ringvårdshavare
                </button>
                <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-700 dark:text-slate-200 transition-all font-bold group">
                    <Info className="h-5 w-5 text-slate-400 group-hover:text-amber-500" /> Detaljerad profil
                </button>
            </div>
        </div>
    </div>
);

const StatRow = ({ label, value, color }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-slate-400 font-bold text-sm uppercase">{label}</span>
        <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
);

// --- MOCK DATA ---
const mockTrendData = [
    { name: 'Mån', val: 88 },
    { name: 'Tis', val: 92 },
    { name: 'Ons', val: 85 },
    { name: 'Tor', val: 94 },
    { name: 'Fre', val: 89 },
    { name: 'Lör', val: 90 },
    { name: 'Sön', val: 95 },
];

export default MentorDashboard;
