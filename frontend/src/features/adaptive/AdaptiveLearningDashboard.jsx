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
    Layers
} from 'lucide-react';
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
                {/* Learning Style Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Layers size={64} className="text-brand-purple" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Inlärningsstil</h3>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {profile?.primaryLearningStyle || 'Okänd'}
                    </div>
                    <p className="text-xs text-slate-500">
                        Baserat på hur du interagerar med materialet.
                    </p>
                </div>

                {/* Pace Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={64} className="text-brand-teal" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Studietakt</h3>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {profile?.averagePaceMultiplier < 1.0 ? 'Snabb' : profile?.averagePaceMultiplier > 1.0 ? 'Grundlig' : 'Balanserad'}
                    </div>
                    <p className="text-xs text-slate-500">
                        Jämfört med genomsnittet för dina kurser.
                    </p>
                </div>

                {/* Focus Areas Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Target size={64} className="text-brand-orange" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Fokusområden</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile?.struggleAreas?.length > 0 ? (
                            profile.struggleAreas.map((area, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full border border-red-200 dark:border-red-800">
                                    {area}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 text-sm">Inga specifika problemområden identifierade.</span>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
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
                            {profile?.aiAnalysisSummary || "Kör din första analys för att få insikter."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommendations List */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={20} />
                    Rekommenderade Åtgärder
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
                                        onClick={() => handleStatusUpdate(rec.id, 'ACCEPTED')}
                                        disabled={rec.status === 'ACCEPTED'}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${rec.status === 'ACCEPTED'
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {rec.status === 'ACCEPTED' ? 'Pågående' : 'Markera Startad'}
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
        case 'REVIEW_TOPIC': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'CHALLENGE_YOURSELF': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'WELLBEING_CHECK': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
        default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
};

export default AdaptiveLearningDashboard;
