import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Brain,
    Target,
    Zap,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    BarChart2,
    BookOpen,
    Clock,
    Layers,
    Activity
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const AdaptiveLearningDashboard = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.adaptive.getDashboard();
            setDashboardData(response);
        } catch (error) {
            console.error("Failed to fetch adaptive dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            await api.adaptive.analyze();
            await fetchDashboard();
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        // Optimistic update
        setDashboardData(prev => ({
            ...prev,
            recommendations: prev.recommendations.map(r =>
                r.id === id ? { ...r, status: newStatus } : r
            )
        }));

        try {
            await api.adaptive.updateStatus(id, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            fetchDashboard(); // Revert on failure
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    const { profile, recommendations } = dashboardData || {};

    // Parse JSON strings if they come as strings
    const parseList = (jsonStr) => {
        if (!jsonStr) return [];
        if (Array.isArray(jsonStr)) return jsonStr;
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            return [];
        }
    };

    const struggleAreas = parseList(profile?.struggleAreas);
    const strengthAreas = parseList(profile?.strengthAreas);

    // Prepare VAK Data
    const vakData = [
        { subject: 'Visuellt', A: profile?.visualScore || 0, fullMark: 100 },
        { subject: 'Auditivt', A: profile?.auditoryScore || 0, fullMark: 100 },
        { subject: 'Kinestetiskt', A: profile?.kinestheticScore || 0, fullMark: 100 },
    ];

    const getPaceLabel = (pace) => {
        switch (pace) {
            case 'FAST': return 'Snabb';
            case 'SLOW': return 'Grundlig';
            default: return 'Balanserad';
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Brain className="text-brand-primary" />
                        Min Lärväg
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        AI-driven analys av din inlärningsstil och personliga rekommendationer.
                    </p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                    {analyzing ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Arbetar...
                        </>
                    ) : (
                        <>
                            <Zap size={18} />
                            Uppdatera Analys
                        </>
                    )}
                </button>
            </div>

            {/* Profile Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* VAK Chart Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Inlärningsprofil (VAK)</h3>
                    <div className="flex-1 w-full h-full min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={vakData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Profil"
                                    dataKey="A"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.6}
                                />
                                <RechartsTooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pace Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={64} className="text-brand-teal" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Studietakt</h3>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {getPaceLabel(profile?.pacePreference)}
                    </div>
                    <p className="text-xs text-slate-500">
                        Baserat på din aktivitet och framsteg.
                    </p>
                </div>

                {/* Focus Areas Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Target size={64} className="text-brand-orange" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Identifierade Utmaningar</h3>
                    <div className="flex flex-wrap gap-2">
                        {struggleAreas.length > 0 ? (
                            struggleAreas.map((area, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full border border-red-200 dark:border-red-800">
                                    {area}
                                </span>
                            ))
                        ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                                <CheckCircle size={16} /> Inga hinder identifierade
                            </span>
                        )}
                    </div>

                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4 mb-2">Styrkor</h3>
                    <div className="flex flex-wrap gap-2">
                        {strengthAreas.length > 0 ? (
                            strengthAreas.map((area, idx) => (
                                <span key={idx} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                                    {area}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 text-sm">Analyseras...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
            {profile?.aiAnalysisSummary && (
                <div className="bg-gradient-to-r from-brand-primary/5 to-brand-purple/5 border border-brand-primary/10 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                            <TrendingUp className="text-brand-primary" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                AI-Insikt
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {profile.aiAnalysisSummary}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations List */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={20} />
                    Rekommenderade Åtgärder ({recommendations?.length || 0})
                </h2>

                {recommendations?.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {recommendations.map((rec) => (
                            <div key={rec.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(rec.type)}`}>
                                        {rec.type}
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        Prio: {rec.priorityScore}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-brand-primary transition-colors">
                                    {rec.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                                    {rec.description}
                                </p>

                                {rec.aiReasoning && (
                                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                            <Brain size={12} />
                                            Varför detta?
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                                            "{rec.aiReasoning}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(rec.id, 'IN_PROGRESS')}
                                        disabled={rec.status === 'IN_PROGRESS' || rec.status === 'COMPLETED'}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${rec.status === 'IN_PROGRESS'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                                            : rec.status === 'COMPLETED'
                                                ? 'bg-blue-100 text-blue-800 cursor-default'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {rec.status === 'IN_PROGRESS' ? 'Pågående' : rec.status === 'COMPLETED' ? 'Slutförd' : 'Markera Startad'}
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors">
                                        Gå till material
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Inga rekommendationer än</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            När du slutför kurser och quiz kommer AI:n att börja ge dig personliga tips här.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const getTypeColor = (type) => {
    switch (type) {
        case 'CONTENT_REVIEW': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'CHALLENGE_YOURSELF': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'STREAK_REPAIR': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
        case 'MENTOR_MEETING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
};

export default AdaptiveLearningDashboard;
