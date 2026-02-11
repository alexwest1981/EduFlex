import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    BookOpen,
    TrendingUp,
    MessageSquare,
    ChevronRight,
    Search
} from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import WidgetWrapper from './components/WidgetWrapper';
import { useDesignSystem } from '../../context/DesignSystemContext';

const GuardianDashboard = ({ currentUser }) => {
    const { t } = useTranslation();
    const { currentDesignSystem } = useDesignSystem();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchMetrics(selectedChild.id);
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        setIsLoading(true);
        try {
            const data = await api.guardian.getChildren();
            setChildren(data || []);
            if (data && data.length > 0) {
                setSelectedChild(data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch children:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMetrics = async (childId) => {
        try {
            const data = await api.guardian.getDashboard(childId);
            setMetrics(data);
        } catch (error) {
            console.error("Failed to fetch dashboard metrics:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header with Child Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1a1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Vårdnadshavardashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Välkommen tillbaka, här är status för dina barn.
                    </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    {children.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChild(child)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedChild?.id === child.id
                                ? 'bg-white dark:bg-[#2c2e33] text-brand-teal shadow-md'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {child.firstName}
                        </button>
                    ))}
                </div>
            </div>

            {!selectedChild ? (
                <div className="text-center p-20 bg-gray-50 dark:bg-[#1a1c1e] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-500">
                    <Users className="mx-auto w-12 h-12 mb-4 opacity-50" />
                    Inga barn länkade till detta konto. Kontakta skolans administratör.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <MetricCard
                                icon={<CheckCircle className="text-green-500" />}
                                title="Närvaro Idag"
                                value={`${metrics?.attendancePercentage || 0}%`}
                                subtitle={`${metrics?.presentCount || 0}/${metrics?.totalRecords || 0} lektioner`}
                                color="border-green-100 bg-green-50/10"
                            />
                            <MetricCard
                                icon={<Clock className="text-blue-500" />}
                                title="Kommande Läxor"
                                value={metrics?.upcomingAssignmentsCount || 0}
                                subtitle="Inlämningar nästa 7 dygn"
                                color="border-blue-100 bg-blue-50/10"
                            />
                            <MetricCard
                                icon={<TrendingUp className="text-brand-teal" />}
                                title="Senaste Resultat"
                                value={metrics?.recentResults?.[0]?.grade || '-'}
                                subtitle={metrics?.recentResults?.[0]?.course?.name || 'Inga resultat än'}
                                color="border-brand-teal/20 bg-brand-teal/5"
                            />
                        </div>

                        {/* Today's Schedule */}
                        <WidgetWrapper className="h-auto">
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-6 text-brand-teal">
                                    <Calendar size={20} />
                                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">Dagens Schema</h2>
                                </div>
                                <div className="space-y-3">
                                    {metrics?.todaySchedule?.length > 0 ? (
                                        metrics.todaySchedule.map(event => (
                                            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-brand-teal">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 text-center text-sm font-bold text-brand-teal">
                                                        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">{event.title}</div>
                                                        <div className="text-xs text-gray-500">{event.course?.name || 'Övrigt'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs px-2 py-1 bg-white dark:bg-[#1a1c1e] rounded text-gray-500 border border-gray-100 dark:border-gray-800">
                                                    {event.type}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                            Inga lektioner idag
                                        </div>
                                    )}
                                </div>
                            </div>
                        </WidgetWrapper>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Mockup Quick Actions removed as requested */}

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-[#1a1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-brand-teal">
                                <TrendingUp size={18} />
                                Senaste händelser
                            </h3>
                            <div className="space-y-4">
                                {metrics?.recentResults?.map(res => (
                                    <div key={res.id} className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal">
                                            <BookOpen size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                Nytt resultat i <span className="font-bold">{res.course?.name}</span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Betyg: {res.grade} • {res.gradedAt ? new Date(res.gradedAt).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!metrics?.recentResults || metrics.recentResults.length === 0) && (
                                    <p className="text-sm text-gray-500 text-center py-4">Ingen recent aktivitet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ icon, title, value, subtitle, color }) => (
    <div className={`p-5 rounded-2xl border ${color} shadow-sm bg-white dark:bg-opacity-5 transition-transform hover:scale-[1.02]`}>
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center mb-4 shadow-sm">
            {icon}
        </div>
        <div className="text-xs text-gray-500 mb-1 font-medium">{title}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{subtitle}</div>
    </div>
);

export default GuardianDashboard;
